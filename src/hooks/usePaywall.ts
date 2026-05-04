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

import { useState, useCallback, createElement } from "react";
import { useTier } from "@/components/TierProvider";
import { type FeatureKey, isPaywallCoolingDown } from "@/lib/tier";
import { supabase } from "@/lib/supabase";
import Paywall, { PlansPage } from "@/components/Paywall";

export function usePaywall() {
  const { tier, hasAccess, refreshTier } = useTier();
  const [activeFeature, setActiveFeature] = useState<FeatureKey | null>(null);
  const [showPlans, setShowPlans] = useState(false);

  /**
   * Gate a feature. Returns true if access is BLOCKED (paywall shown).
   * Returns false if the user has access (proceed normally).
   */
  const gate = useCallback(
    (feature: FeatureKey): boolean => {
      if (hasAccess(feature)) return false; // allowed
      if (isPaywallCoolingDown(feature)) return true; // blocked but don't show modal again
      setActiveFeature(feature);
      return true; // blocked, showing paywall
    },
    [hasAccess],
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
        onClose: () => setShowPlans(false),
        onSelectTier: async (selectedTier: "free" | "mid" | "top") => {
          try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
              await supabase
                .from("profiles")
                .update({ tier: selectedTier })
                .eq("id", session.user.id);
              await refreshTier();
            }
          } catch { /* ignore */ }
          setShowPlans(false);
        },
      })
    : null;

  return { gate, canAccess, PaywallModal, showPlans, setShowPlans };
}
