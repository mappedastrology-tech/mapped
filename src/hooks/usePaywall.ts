"use client";

/**
 * usePaywall — hook for gating features behind tiers.
 *
 * Usage:
 *   const { gate, PaywallModal } = usePaywall();
 *
 *   function handleWizardClick() {
 *     if (gate("wizard")) return; // shows paywall if needed, returns true if blocked
 *     // ... proceed with wizard
 *   }
 *
 *   // Render PaywallModal somewhere in JSX:
 *   {PaywallModal}
 */

import { useState, useCallback, useEffect, createElement } from "react";
import { useTier } from "@/components/TierProvider";
import { type FeatureKey, isPaywallCoolingDown, getFeatureInfo } from "@/lib/tier";
import { useToast } from "@/components/Toast";
import { getProfile } from "@/lib/profileCache";
import Paywall, { PlansPage } from "@/components/Paywall";

/**
 * Why a gate was closed, for callers that can say something better than a
 * toast.
 *
 * `"cooldown"` is the one that matters. Dismissing a paywall suppresses it for
 * 24 hours, which is right — nobody wants to be nagged. But `gate` returned a
 * bare `true` for both cases, so a caller could not tell "I showed the
 * paywall, stop here" from "I showed nothing at all, stop here". Every one of
 * them took the second branch as the first and returned silently: for a full
 * day after a single "maybe later", tapping the feature did nothing
 * whatsoever. On the Dolly tab that is the entire screen — composer, send
 * button and all six starter prompts — inert, with no paywall, no message and
 * no disabled state. It reads as broken software, not as a price.
 */
export type GateResult = "allowed" | "paywall" | "cooldown" | "pending";

export function usePaywall() {
  const { tier, hasAccess, loading: tierLoading } = useTier();
  const { toast } = useToast();
  const [activeFeature, setActiveFeature] = useState<FeatureKey | null>(null);
  const [showPlans, setShowPlans] = useState(false);

  /**
   * What they are billed, so the plans sheet opens on their interval and calls
   * a plan change a plan change. Read from the shared profile cache, which
   * every screen has already populated by the time a gate can close, so this
   * costs nothing.
   */
  const [billing, setBilling] = useState<{ interval?: "month" | "year"; hasSubscription: boolean }>(
    { hasSubscription: false },
  );
  useEffect(() => {
    let alive = true;
    getProfile()
      .then((p) => {
        if (!alive) return;
        const raw = p?.subscription_interval;
        setBilling({
          interval: raw === "year" ? "year" : raw === "month" ? "month" : undefined,
          hasSubscription: !!p?.stripe_subscription_id,
        });
      })
      .catch(() => { /* defaults are correct for someone with no subscription */ });
    return () => { alive = false; };
  }, [tier]);

  /**
   * Gate a feature and say why it closed — for screens that can show something
   * better than a toast, such as an inline line with a link to plans.
   * Shows the paywall when it is due, and nothing at all during the cooldown;
   * handling that case is the caller's job.
   */
  const gateWithReason = useCallback(
    (feature: FeatureKey): GateResult => {
      /**
       * Decide nothing until the tier is known.
       *
       * TierProvider starts at "free" and resolves a moment later, so a gate
       * asked during that window says no to everybody — including people who
       * pay. From an event handler that never showed, because the tier had
       * long since landed; /rectification calls this in its render body, on
       * mount, and a Mapped+ subscriber got the paywall every single time.
       * Once activeFeature is set the tier arriving does not take it back
       * down, so it was not even a flicker.
       *
       * Blocked but silent: the caller waits rather than being told no.
       */
      if (tierLoading) return "pending";
      if (hasAccess(feature)) return "allowed";
      if (isPaywallCoolingDown(feature)) return "cooldown";
      setActiveFeature(feature);
      return "paywall";
    },
    [hasAccess, tierLoading],
  );

  /**
   * Gate a feature. Returns true if access is BLOCKED.
   * Returns false if the user has access (proceed normally).
   *
   * Always gives some feedback: a paywall when one is due, and a toast when
   * the paywall is in its cooldown, so a blocked tap is never silent.
   */
  const gate = useCallback(
    (feature: FeatureKey): boolean => {
      const reason = gateWithReason(feature);
      // Still loading the tier. Not a price, so not a paywall and not an
      // upgrade toast — but not silence either: a tap that does nothing at all
      // is the thing this hook already exists to avoid.
      if (reason === "pending") {
        toast.info("One moment — checking your plan.");
        return true;
      }
      if (reason === "cooldown") {
        const info = getFeatureInfo(feature);
        toast.info(
          info ? `${info.label} comes with Mapped+.` : "That one comes with Mapped+.",
        );
      }
      return reason !== "allowed";
    },
    [gateWithReason, toast],
  );

  /**
   * Check access without showing paywall (for disabling UI elements).
   */
  const canAccess = useCallback(
    (feature: FeatureKey): boolean => hasAccess(feature),
    [hasAccess],
  );

  const PaywallModal = activeFeature
    ? createElement(Paywall, {
        feature: activeFeature,
        onDismiss: () => setActiveFeature(null),
        onSeePlans: () => {
          setActiveFeature(null);
          setShowPlans(true);
        },
      })
    : showPlans
    ? createElement(PlansPage, {
        currentTier: tier,
        currentInterval: billing.interval,
        hasSubscription: billing.hasSubscription,
        onClose: () => setShowPlans(false),
      })
    : null;

  return { gate, gateWithReason, canAccess, PaywallModal, showPlans, setShowPlans };
}
