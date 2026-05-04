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
import { getActivePromoTier, type PromoRedemption } from "@/lib/promoCodes";

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
  // Tiers disabled — everyone gets full access until payments are wired up
  const [tier] = useState<TierLevel>("top");
  const [loading] = useState(false);

  const fetchTier = useCallback(async () => {
    // no-op while tiers are disabled
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
