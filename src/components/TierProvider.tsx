"use client";

/**
 * TierProvider — React context for the user's current tier level.
 *
 * Reads tier from Supabase profile on mount. Falls back to "free".
 * Exposes: tier, setTier, hasAccess(feature), limits.
 */

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import {
  type TierLevel,
  type FeatureKey,
  hasAccess as checkAccess,
  getLimits,
  USAGE_LIMITS,
} from "@/lib/tier";
import { getActivePromoTier } from "@/lib/promoCodes";

type Limits = { dollyMessagesPerDay: number; pullsPerDay: number; synastryPartners: number; familyMembers: number; wizardPerMonth: number; transitsShown: number };

interface TierContextValue {
  tier: TierLevel;
  loading: boolean;
  /** Check if current tier has access to a feature */
  hasAccess: (feature: FeatureKey) => boolean;
  /** Get usage limits for current tier */
  limits: Limits;
  /** Force-refresh tier from Supabase */
  refreshTier: () => Promise<void>;
}

const TierContext = createContext<TierContextValue>({
  tier: "free",
  loading: true,
  hasAccess: () => true,
  limits: USAGE_LIMITS.free as unknown as Limits,
  refreshTier: async () => {},
});

export function TierProvider({ children }: { children: ReactNode }) {
  const [tier, setTier] = useState<TierLevel>("free");
  const [loading, setLoading] = useState(true);

  const fetchTier = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setTier("free");
        setLoading(false);
        return;
      }

      // Fetch tier from profiles first (set by Stripe webhook or promo code)
      const { data: profile } = await supabase
        .from("profiles")
        .select("tier")
        .eq("id", user.id)
        .single();

      // Check for active promo-based tier (non-fatal — table may not exist)
      try {
        const { data: redemptions } = await supabase
          .from("promo_redemptions")
          .select("*")
          .eq("user_id", user.id);
        if (redemptions && redemptions.length > 0) {
          const promoTier = getActivePromoTier(redemptions);
          if (promoTier) {
            setTier(promoTier);
            setLoading(false);
            return;
          }
        }
      } catch { /* promo_redemptions table may not exist — skip */ }

      // Whitelisted rather than trusted, so a stray value in the column can
      // only ever read as free. Keep this list in step with TierLevel — a tier
      // missing here does not fail loudly, it silently downgrades a paying
      // subscriber to free everywhere in the UI.
      if (profile?.tier === "free" || profile?.tier === "mid" || profile?.tier === "max") {
        setTier(profile.tier);
      } else {
        setTier("free");
      }
    } catch {
      setTier("free");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTier();
  }, [fetchTier]);

  const value: TierContextValue = {
    tier,
    loading,
    hasAccess: (feature: FeatureKey) => checkAccess(tier, feature),
    limits: getLimits(tier),
    refreshTier: fetchTier,
  };

  return <TierContext.Provider value={value}>{children}</TierContext.Provider>;
}

export function useTier() {
  return useContext(TierContext);
}
