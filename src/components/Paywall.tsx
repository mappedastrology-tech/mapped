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
import { type FeatureKey, getFeatureInfo, getMinTier, TIERS, recordPaywallDismissed } from "@/lib/tier";

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

        {/* Tier requirement */}
        <p className="text-muted text-xs mb-5">
          Available with Mapped+ ($11.11/month).
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

interface PlansPageProps {
  currentTier: "free" | "mid";
  onClose: () => void;
  onSelectTier?: (tier: "free" | "mid") => void;
}

export function PlansPage({ currentTier, onClose }: PlansPageProps) {
  const [loading, setLoading] = useState(false);
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

  async function handleUpgrade() {
    setLoading(true);
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
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error("No checkout URL returned:", data);
        setLoading(false);
      }
    } catch (err) {
      console.error("Checkout error:", err);
      setLoading(false);
    }
  }

  const freeFeatures = [
    "Basic birth chart",
    "Daily horoscope",
    "1 card pull per day",
    "Journal",
    "Almanac",
    "1 connection on the map",
  ];

  const paidFeatures = [
    "Unlimited Dolly conversations",
    "Unlimited card pulls",
    "All map connections",
    "Astrocartography",
    "Custom practices and rituals",
    "Detailed transits and aspects",
    "Family analysis",
  ];

  const isPaid = currentTier === "mid";

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
        {/* Free plan */}
        <div className={`rounded-2xl border p-5 ${currentTier === "free" ? "border-sage bg-sage/5" : "border-foreground/12 bg-card/40"}`}>
          <div className="flex items-baseline justify-between mb-3">
            <h3 className="text-foreground text-base font-bold" style={{ fontFamily: "var(--font-display)" }}>
              Free
            </h3>
            <span className="text-secondary text-sm">$0</span>
          </div>

          <ul className="space-y-1.5 mb-4">
            {freeFeatures.map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-secondary text-xs">
                <span className="text-sage mt-0.5">&#10003;</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>

          {currentTier === "free" && (
            <div className="text-center text-sage text-xs font-semibold py-2">
              Current plan
            </div>
          )}
        </div>

        {/* Mapped+ plan */}
        <div className={`rounded-2xl border p-5 ${isPaid ? "border-sage bg-sage/5" : "border-foreground/12 bg-card/40"}`}>
          <div className="flex items-baseline justify-between mb-3">
            <h3 className="text-foreground text-base font-bold" style={{ fontFamily: "var(--font-display)" }}>
              Mapped+
            </h3>
            <span className="text-foreground text-sm font-semibold">
              $11.11/month
            </span>
          </div>

          <ul className="space-y-1.5 mb-4">
            <li className="flex items-start gap-2 text-secondary text-xs">
              <span className="text-sage mt-0.5">&#10003;</span>
              <span className="font-medium">Everything in Free, plus:</span>
            </li>
            {paidFeatures.map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-secondary text-xs">
                <span className="text-sage mt-0.5">&#10003;</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>

          {isPaid ? (
            <div className="text-center text-sage text-xs font-semibold py-2">
              Current plan
            </div>
          ) : (
            <button
              onClick={handleUpgrade}
              disabled={loading}
              className="w-full py-3 rounded-full bg-ink text-cream text-sm font-semibold active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-cream/30 border-t-cream rounded-full animate-spin" role="status" aria-label="Loading" />
                  Connecting...
                </span>
              ) : (
                "Subscribe — $11.11/month"
              )}
            </button>
          )}
        </div>

        <p className="text-center text-muted text-xs pt-2">
          Cancel anytime. All prices in USD.
        </p>
      </div>
    </div>
  );
}
