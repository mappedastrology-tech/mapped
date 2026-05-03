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

import { useState } from "react";
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

  function handleDismiss() {
    recordPaywallDismissed(feature);
    onDismiss();
  }

  function handleSeePlans() {
    if (onSeePlans) {
      onSeePlans();
    }
  }

  if (!info) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-5" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div
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
        <p className="text-foreground/60 text-sm mb-5 leading-relaxed">
          {info.description}
        </p>

        {/* Tier requirement */}
        <p className="text-foreground/40 text-xs mb-5">
          Available with {minTier === "mid" ? "Mid ($11.11/month) and Top ($22.22/month)" : "Top ($22.22/month)"}.
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
            className="flex-1 py-3 rounded-full border border-foreground/20 text-foreground/60 text-sm font-semibold active:scale-[0.98] transition-all"
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
  currentTier: "free" | "mid" | "top";
  onClose: () => void;
  onSelectTier?: (tier: "free" | "mid" | "top") => void;
}

export function PlansPage({ currentTier, onClose, onSelectTier }: PlansPageProps) {
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");

  const plans = [
    {
      tier: "free" as const,
      name: "Free",
      monthly: 0,
      annual: 0,
      features: [
        "Full natal chart calculation",
        "Sun, Moon, Rising readings",
        "Chart ruler + sect light",
        "Daily transit + moon phase",
        "One ritual per day",
        "One free deck + one pull per day",
        "Dolly (5 messages/day)",
        "Synastry with one partner",
      ],
    },
    {
      tier: "mid" as const,
      name: "Mid",
      monthly: 11.11,
      annual: 89,
      features: [
        "Everything in Free",
        "Ritual Wizard (10/month)",
        "Custom rituals",
        "Full transits + strength scoring",
        "Multiple synastry partners",
        "Astrocartography",
        "Unlimited Dolly with memory",
        "Unlimited deck purchases",
        "Unlimited card pulls",
        "Skeptic Mode",
      ],
    },
    {
      tier: "top" as const,
      name: "Top",
      monthly: 22.22,
      annual: 179,
      features: [
        "Everything in Mid",
        "Unlimited Wizard + voice input",
        "Full ZR lifetime timeline",
        "Almuten figuris (soul ruler)",
        "Fixed star contacts",
        "Arabic Lots",
        "Composite charts",
        "PDF chart export",
        "50% off deck purchases",
        "Practice pattern insights",
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-[250] overflow-y-auto" style={{ backgroundColor: "var(--background)" }}>
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 border-b border-foreground/10" style={{ backgroundColor: "var(--background)" }}>
        <h1 className="text-lg text-foreground" style={{ fontFamily: "var(--font-display)" }}>
          Plans
        </h1>
        <button onClick={onClose} className="text-foreground/50 text-sm font-medium">
          Close
        </button>
      </div>

      {/* Billing toggle */}
      <div className="flex justify-center py-4">
        <div className="flex rounded-full border border-foreground/15 overflow-hidden">
          <button
            onClick={() => setBilling("monthly")}
            className={`px-5 py-2 text-xs font-semibold transition-colors ${billing === "monthly" ? "bg-ink text-cream" : "text-foreground/50"}`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBilling("annual")}
            className={`px-5 py-2 text-xs font-semibold transition-colors ${billing === "annual" ? "bg-ink text-cream" : "text-foreground/50"}`}
          >
            Annual (save ~30%)
          </button>
        </div>
      </div>

      {/* Plan cards */}
      <div className="px-5 pb-8 space-y-4">
        {plans.map((plan) => {
          const isCurrent = plan.tier === currentTier;
          const price = billing === "monthly" ? plan.monthly : plan.annual;
          const period = billing === "monthly" ? "/month" : "/year";

          return (
            <div
              key={plan.tier}
              className={`rounded-2xl border p-5 ${isCurrent ? "border-sage bg-sage/5" : "border-foreground/12 bg-card/40"}`}
            >
              <div className="flex items-baseline justify-between mb-3">
                <h3 className="text-foreground text-base font-bold" style={{ fontFamily: "var(--font-display)" }}>
                  {plan.name}
                </h3>
                <div className="text-right">
                  {price === 0 ? (
                    <span className="text-foreground/60 text-sm">Free</span>
                  ) : (
                    <span className="text-foreground text-sm font-semibold">
                      ${price}{period}
                    </span>
                  )}
                </div>
              </div>

              <ul className="space-y-1.5 mb-4">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-foreground/60 text-xs">
                    <span className="text-sage mt-0.5">&#10003;</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              {isCurrent ? (
                <div className="text-center text-sage text-xs font-semibold py-2">
                  Current plan
                </div>
              ) : (
                <button
                  onClick={() => onSelectTier?.(plan.tier)}
                  className={`w-full py-3 rounded-full text-sm font-semibold active:scale-[0.98] transition-all ${
                    plan.tier === "free"
                      ? "border border-foreground/15 text-foreground/50"
                      : "bg-ink text-cream"
                  }`}
                >
                  {plan.tier === "free" ? "Stay on Free" : `Try ${plan.name} — $${billing === "monthly" ? plan.monthly : plan.annual}${period}`}
                </button>
              )}
            </div>
          );
        })}

        <p className="text-center text-foreground/35 text-xs pt-2">
          Cancel anytime. All prices in USD.
        </p>
      </div>
    </div>
  );
}
