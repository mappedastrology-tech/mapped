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
}

const FREE_FEATURES = [
  "Your full birth chart, Western or Vedic",
  "The almanac, transits and moon phases",
  "One oracle deck, chosen by you",
  "A card pull each day",
  "Journal and Learn",
  "One connection on the map",
];

// Dolly and the daily horoscope live here rather than on Free: everything
// written by AI is what the first paid step buys.
const PLUS_FEATURES = [
  "Dolly, whenever you want her",
  "Daily horoscopes written for your chart",
  "The ritual wizard and custom practices",
  "Palm readings and chart readings",
  "Unlimited card pulls",
  "Astrocartography and full transits",
  "Every connection on the map",
];

const COMPLETE_FEATURES = [
  "Every oracle deck, included",
  "New decks the day they arrive",
];

export function PlansPage({ currentTier, onClose }: PlansPageProps) {
  const [loadingPlan, setLoadingPlan] = useState<"mid" | "max" | null>(null);
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
        body: JSON.stringify({ plan }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error("No checkout URL returned:", data);
        setLoadingPlan(null);
      }
    } catch (err) {
      console.error("Checkout error:", err);
      setLoadingPlan(null);
    }
  }

  const rank: Record<TierLevel, number> = { free: 0, mid: 1, max: 2 };

  function Bullets({ items, lead }: { items: string[]; lead?: string }) {
    return (
      <ul className="space-y-1.5 mb-4">
        {lead && (
          <li className="flex items-start gap-2 text-secondary text-xs">
            <span className="text-sage mt-0.5">&#10003;</span>
            <span className="font-medium">{lead}</span>
          </li>
        )}
        {items.map((f, i) => (
          <li key={i} className="flex items-start gap-2 text-secondary text-xs">
            <span className="text-sage mt-0.5">&#10003;</span>
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
          <div className="text-center text-sage text-xs font-semibold py-2">
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
            ) : (
              `Subscribe — ${price}`
            )}
          </button>
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
        <PlanCard plan="free" title="Free" price="$0">
          <Bullets items={FREE_FEATURES} />
        </PlanCard>

        <PlanCard plan="mid" title="Mapped+" price="$11.11/month">
          <Bullets items={PLUS_FEATURES} lead="Everything in Free, plus:" />
        </PlanCard>

        <PlanCard plan="max" title="Mapped Complete" price="$22.22/month">
          <Bullets items={COMPLETE_FEATURES} lead="Everything in Mapped+, plus:" />
        </PlanCard>

        <p className="text-center text-muted text-xs pt-2">
          Cancel anytime. All prices in USD.
        </p>
      </div>
    </div>
  );
}
