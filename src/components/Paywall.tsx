"use client";

/**
 * Paywall — Modal displayed when a user tries to access a gated feature.
 *
 * Voice rules from the spec:
 * - Never guilt-trip or make the user feel they're missing out
 * - Never use "premium" or "pro" — use the actual tier names
 * - Never auto-redirect to checkout
 * - Always offer "Maybe later" as an equal option
 * - After dismissing, don't show again for that feature for 24 hours
 */

import { useState, useRef, useEffect, useCallback } from "react";
import { type FeatureKey, type TierLevel, getFeatureInfo, getMinTier, TIERS, recordPaywallDismissed } from "@/lib/tier";
import { AI_TIER_MULTIPLIER, AI_MULTIPLIER_WORD } from "@/lib/ai/dailyLimits";
import { openCheckout } from "@/lib/openCheckout";

interface PaywallProps {
  feature: FeatureKey;
  onDismiss: () => void;
  onSeePlans?: () => void;
}

export default function Paywall({ feature, onDismiss, onSeePlans }: PaywallProps) {
  const info = getFeatureInfo(feature);
  const minTier = getMinTier(feature);
  const tierInfo = TIERS[minTier];
  const dialogRef = useRef<HTMLDivElement>(null);

  const handleDismiss = useCallback(() => {
    recordPaywallDismissed(feature);
    onDismiss();
  }, [feature, onDismiss]);

  function handleSeePlans() {
    if (onSeePlans) {
      onSeePlans();
    }
  }

  // Focus trap
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const focusable = dialog.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const trap = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { handleDismiss(); return; }
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last?.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first?.focus(); }
      }
    };
    first?.focus();
    document.addEventListener('keydown', trap);
    return () => document.removeEventListener('keydown', trap);
  }, [handleDismiss]);

  if (!info) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-5" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Feature requires upgrade"
        className="w-full max-w-sm rounded-2xl border border-foreground/12 p-6 relative"
        style={{ backgroundColor: "var(--background)" }}
      >
        {/* Feature name */}
        <h2
          className="text-lg text-foreground mb-2"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {info.label}
        </h2>

        {/* Description */}
        <p className="text-secondary text-sm mb-5 leading-relaxed">
          {info.description}
        </p>

        {/* Tier requirement — read from the feature, not hardcoded: the deck
            features need Mapped Complete, and naming the wrong plan here sends
            someone to a checkout that would not unlock what they tapped. */}
        <p className="text-muted text-xs mb-5">
          Available with {tierInfo.name} (${tierInfo.price.toFixed(2)}/month).
        </p>

        {/* CTAs — equal visual weight */}
        <div className="flex gap-3">
          <button
            onClick={handleSeePlans}
            className="flex-1 py-3 rounded-full bg-ink text-cream text-sm font-semibold active:scale-[0.98] transition-all"
          >
            See plans
          </button>
          <button
            onClick={handleDismiss}
            className="flex-1 py-3 rounded-full border border-foreground/20 text-secondary text-sm font-semibold active:scale-[0.98] transition-all"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Plans Page Component ─── */

/**
 * Note the absence of an `onSelectTier` escape hatch. Picking a plan has to go
 * through /api/stripe/checkout below, because the database now pins the billing
 * columns to the server (20260922_lock_profile_tier_to_server.sql) — a client
 * writing `tier` straight to its own profiles row is silently reverted.
 *
 * What is listed here is what a plan GIVES. The monthly spend ceilings that sit
 * behind the AI tiers are not mentioned, by product decision; they live in
 * src/lib/ai/budget.ts, which never reaches the browser bundle.
 */
interface PlansPageProps {
  currentTier: TierLevel;
  onClose: () => void;
  /**
   * What they are billed today, so the sheet opens on the interval they are
   * already on. An annual subscriber who opened this saw Monthly selected and
   * a monthly price, and could move from a $100 year to a $22.22 month
   * without the screen ever mentioning that the interval had changed too.
   */
  currentInterval?: "month" | "year";
  /**
   * Whether there is a live Stripe subscription. A plan change is not a
   * purchase — the server sends an existing subscriber to Stripe's plan-change
   * screen rather than selling them a second subscription — so the button has
   * to stop saying "Subscribe" and stop quoting a full price that will in fact
   * be prorated.
   */
  hasSubscription?: boolean;
}

const FREE_FEATURES = [
  "Your full birth chart, Western or Vedic",
  "The almanac, transits and moon phases",
  "One oracle deck, chosen by you",
  "A card pull each day",
  "Journal and Learn",
  "One person on the map, with basic compatibility",
];

// Dolly and the daily horoscope live here rather than on Free: everything
// written by AI is what the first paid step buys.
const PLUS_FEATURES = [
  // Not "whenever you want her": that reads as unlimited, and it directly
  // contradicts the tier below, which is sold on having three times as much
  // of her. A plan cannot offer unlimited and then charge for more.
  "Dolly, every day — your chart, your timing, your people",
  "Daily horoscopes written for your chart",
  "The ritual wizard and custom practices",
  "Palm readings and chart readings",
  "Unlimited card pulls",
  "Astrocartography and full transits",
  // Not "every connection" any more — that is what Complete is for. Mapped+
  // gets one person with every depth tool pointed at them.
  "Your partner on the map, read in full depth",
];

// Dolly leads. This card used to list only the decks, so someone paying
// double saw nothing but the throw-in — and the thing they were actually
// buying, three times the room with Dolly, was never mentioned anywhere.
// The multiple comes from AI_TIER_MULTIPLIER, which also sets the daily caps
// and the monthly ceilings, so the promise cannot drift from the delivery.
const COMPLETE_FEATURES = [
  `${AI_MULTIPLIER_WORD[AI_TIER_MULTIPLIER.max] ?? `${AI_TIER_MULTIPLIER.max}x`} the time with Dolly, for long conversations and heavy weeks`,
  "Everyone on your map — family, friends, colleagues, not just one",
  "Every oracle deck, included",
  "New decks the day they arrive",
];

export function PlansPage({ currentTier, onClose, currentInterval, hasSubscription = false }: PlansPageProps) {
  const [loadingPlan, setLoadingPlan] = useState<"mid" | "max" | null>(null);
  /**
   * Annual was defined in TIERS from the start and shown nowhere, so every
   * subscriber was offered the most expensive way to pay and no other.
   */
  // Named `billing`, not `interval`: a state setter called setInterval
  // shadows window.setInterval for the whole component, which is a trap for
  // whoever adds a timer here next.
  const [billing, setBilling] = useState<"month" | "year">(currentInterval ?? "month");
  const plansDialogRef = useRef<HTMLDivElement>(null);

  // Focus trap for plans page
  useEffect(() => {
    const dialog = plansDialogRef.current;
    if (!dialog) return;
    const focusable = dialog.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const trap = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last?.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first?.focus(); }
      }
    };
    first?.focus();
    document.addEventListener('keydown', trap);
    return () => document.removeEventListener('keydown', trap);
  }, [onClose]);

  async function handleUpgrade(plan: "mid" | "max") {
    setLoadingPlan(plan);
    try {
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        // Not signed in — redirect to account page
        window.location.href = "/account";
        return;
      }

      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ plan, interval: billing }),
      });

      const data = await res.json();
      if (data.url) {
        openCheckout(data.url);
      } else {
        console.error("No checkout URL returned:", data);
        setLoadingPlan(null);
      }
    } catch (err) {
      console.error("Checkout error:", err);
      setLoadingPlan(null);
    }
  }

  /**
   * What a plan costs, in the interval being shown.
   *
   * Yearly is quoted per month with the total beside it, because "$100/year"
   * against "$11.11/month" asks the reader to do division before they can
   * compare — and the comparison is the entire reason the cheaper option is
   * worth showing.
   */
  function priceLabel(tier: "mid" | "max"): string {
    const t = TIERS[tier];
    if (billing === "month") return `$${t.price.toFixed(2)}/month`;
    return `$${(t.annualPrice / 12).toFixed(2)}/month · $${t.annualPrice}/year`;
  }

  /**
   * Rounded to nearest, not down.
   *
   * At the current prices the real saving is 24.99% — twelve months of
   * $11.11 is $133.32, not $133.32 — and flooring that printed "save 24%",
   * which reads as a typo and undersells the offer by a rounding error.
   * Rounding can in principle overstate by up to half a point, so if these
   * prices ever change, check this still describes them fairly.
   */
  const annualSavingPct = Math.round(
    (1 - TIERS.mid.annualPrice / (TIERS.mid.price * 12)) * 100,
  );

  const rank: Record<TierLevel, number> = { free: 0, mid: 1, max: 2 };

  function Bullets({ items, lead }: { items: string[]; lead?: string }) {
    return (
      <ul className="space-y-1.5 mb-4">
        {lead && (
          <li className="flex items-start gap-2 text-secondary text-xs">
            <span className="mt-0.5" style={{ color: "var(--sage-bright)" }}>&#10003;</span>
            <span className="font-medium">{lead}</span>
          </li>
        )}
        {items.map((f, i) => (
          <li key={i} className="flex items-start gap-2 text-secondary text-xs">
            <span className="mt-0.5" style={{ color: "var(--sage-bright)" }}>&#10003;</span>
            <span>{f}</span>
          </li>
        ))}
      </ul>
    );
  }

  /**
   * One card per plan. A plan below the current one shows nothing to press —
   * downgrading is a cancellation, which belongs in the billing portal, not
   * behind a button that looks like a purchase.
   */
  function PlanCard({ plan, title, price, children }: {
    plan: TierLevel;
    title: string;
    price: string;
    children: React.ReactNode;
  }) {
    const isCurrent = currentTier === plan;
    const canBuy = rank[plan] > rank[currentTier] && plan !== "free";
    return (
      <div className={`rounded-2xl border p-5 ${isCurrent ? "border-sage bg-sage/5" : "border-foreground/12 bg-card/40"}`}>
        <div className="flex items-baseline justify-between mb-3">
          <h3 className="text-foreground text-base font-bold" style={{ fontFamily: "var(--font-display)" }}>
            {title}
          </h3>
          <span className={isCurrent ? "text-secondary text-sm" : "text-foreground text-sm font-semibold"}>{price}</span>
        </div>

        {children}

        {isCurrent && (
          <div className="text-center  text-xs font-semibold py-2" style={{ color: "var(--sage-bright)" }}>
            Current plan
          </div>
        )}
        {canBuy && (
          <button
            onClick={() => handleUpgrade(plan as "mid" | "max")}
            disabled={loadingPlan !== null}
            className="w-full py-3 rounded-full bg-ink text-cream text-sm font-semibold active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {loadingPlan === plan ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-cream/30 border-t-cream rounded-full animate-spin" role="status" aria-label="Loading" />
                Connecting...
              </span>
            ) : hasSubscription ? (
              `Switch to ${title}`
            ) : (
              `Subscribe — ${price}`
            )}
          </button>
        )}
        {/* Said before they press it, not discovered on the Stripe screen. */}
        {canBuy && hasSubscription && (
          <p className="text-center text-muted text-[10px] mt-2">
            You&rsquo;ll change plan in the billing portal &mdash; Stripe credits what you have
            already paid for.
          </p>
        )}
      </div>
    );
  }

  return (
    <div ref={plansDialogRef} role="dialog" aria-modal="true" aria-label="Subscription plans" className="fixed inset-0 z-[250] overflow-y-auto" style={{ backgroundColor: "var(--background)" }}>
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 border-b border-foreground/10" style={{ backgroundColor: "var(--background)" }}>
        <h1 className="text-lg text-foreground" style={{ fontFamily: "var(--font-display)" }}>
          Plans
        </h1>
        <button onClick={onClose} className="text-muted text-sm font-medium">
          Close
        </button>
      </div>

      {/* Plan cards */}
      <div className="px-5 pb-8 pt-4 space-y-4">
        {/*
          Monthly or yearly. role="radiogroup", not two buttons: this is one
          choice between two options, and a screen reader should hear it that
          way rather than as two unrelated controls that happen to sit
          together.
        */}
        <div
          role="radiogroup"
          aria-label="Billing period"
          className="flex gap-1 p-1 rounded-full mx-auto w-fit"
          style={{ background: "var(--surface-mid)", border: "0.5px solid var(--border-card)" }}
        >
          {(["month", "year"] as const).map((v) => {
            const on = billing === v;
            return (
              <button
                key={v}
                role="radio"
                aria-checked={on}
                onClick={() => setBilling(v)}
                className="px-4 min-h-[44px] rounded-full text-sm font-semibold transition-colors"
                style={on
                  ? { background: "var(--brass)", color: "var(--btn-primary-text)" }
                  : { background: "transparent", color: "var(--foreground-secondary)" }}
              >
                {v === "month" ? "Monthly" : `Yearly · save ${annualSavingPct}%`}
              </button>
            );
          })}
        </div>

        <PlanCard plan="free" title="Free" price="$0">
          <Bullets items={FREE_FEATURES} />
        </PlanCard>

        <PlanCard plan="mid" title="Mapped+" price={priceLabel("mid")}>
          <Bullets items={PLUS_FEATURES} lead="Everything in Free, plus:" />
        </PlanCard>

        <PlanCard plan="max" title="Mapped Complete" price={priceLabel("max")}>
          <Bullets items={COMPLETE_FEATURES} lead="Everything in Mapped+, plus:" />
        </PlanCard>

        {/* Renewal terms, at the point of sale.
            This previously read only "Cancel anytime. All prices in USD."
            directly beneath two live Subscribe buttons — it never said the
            subscription renews, how often, at what price, or until when.
            "Cancel anytime" without "renews until you cancel" is the shape of
            claim that reads as misleading, and it is the first thing an app
            store reviewer looks for on a subscription screen. The fair-use
            qualifier travels with the claim now too, rather than living only
            on the Account card where nobody buying anything will see it. */}
        <div className="pt-2 flex flex-col gap-2">
          {/* Follows the toggle. Telling someone buying a year that it
              "renews every month" is exactly the kind of mismatch a store
              reviewer looks for. */}
          <p className="text-center text-muted text-xs leading-relaxed">
            {/* Explicit {" "}: JSX drops the space between an expression and
                text that then wraps to the next line, and this rendered as
                "renews every monthat the price shown" on the subscribe
                screen — the one screen a store reviewer reads word for word. */}
            Subscriptions renew every {billing === "month" ? "month" : "year"}{" "}
            at the price shown until you cancel. Cancel any time from Account &rarr; Your plan; you keep access until
            the end of the {billing === "month" ? "month" : "year"} you have paid for. Prices in USD.
          </p>
          {/* A pricing card is the wrong place for a message count: no
              subscription quotes one, and a number here reads as a ration
              rather than an allowance. It is not vague-by-omission either —
              the figures are in the Terms, and the app says so plainly at the
              moment someone actually reaches one. */}
          <p className="text-center text-muted text-xs">
            AI features have usage limits — see the{" "}
            <a href="/terms" className="underline underline-offset-2">Terms</a>.
          </p>
          <p className="text-center text-xs">
            <a href="/terms" className="underline underline-offset-2" style={{ color: "var(--foreground-secondary)", minHeight: 44, display: "inline-block", paddingTop: 12, paddingBottom: 12 }}>
              Terms of Service
            </a>
            <span className="text-muted" aria-hidden="true"> · </span>
            <a href="/privacy" className="underline underline-offset-2" style={{ color: "var(--foreground-secondary)", minHeight: 44, display: "inline-block", paddingTop: 12, paddingBottom: 12 }}>
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
