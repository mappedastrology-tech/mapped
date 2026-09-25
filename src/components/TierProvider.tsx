"use client";

/**
 * TierProvider — React context for the user's current tier level.
 *
 * Reads tier from Supabase profile on mount. Falls back to "free".
 * Exposes: tier, setTier, hasAccess(feature), limits.
 */

import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import {
  type TierLevel,
  type FeatureKey,
  hasAccess as checkAccess,
  getLimits,
  USAGE_LIMITS,
  effectiveTier,
  trialDaysLeft,
} from "@/lib/tier";
import { getActivePromoTier } from "@/lib/promoCodes";
import { getProfile, invalidateProfile } from "@/lib/profileCache";
import { API_BASE } from "@/lib/apiBase";

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
  /**
   * Whole days left of the opening trial, 0 once it has ended. Drives the
   * "N days left" note in account settings — the tier itself already reflects
   * the trial, so nothing needs to branch on this to decide access.
   */
  trialDaysLeft: number;
}

const TierContext = createContext<TierContextValue>({
  tier: "free",
  loading: true,
  hasAccess: () => true,
  limits: USAGE_LIMITS.free as unknown as Limits,
  refreshTier: async () => {},
  trialDaysLeft: 0,
});

export function TierProvider({ children }: { children: ReactNode }) {
  const [tier, setTier] = useState<TierLevel>("free");
  const [trialLeft, setTrialLeft] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchTier = useCallback(async (opts?: { fresh?: boolean }) => {
    // refreshTier is called right after something changed the tier (a promo
    // redemption, a return from checkout), so it has to bypass the cache or it
    // would re-read the row it is trying to replace.
    if (opts?.fresh) invalidateProfile();
    try {
      // The shared profile read, not a fetch of our own: the account screen
      // mounts several sections that all want this row, and this used to be one
      // of two places that additionally paid for a networked auth.getUser().
      const profile = await getProfile();
      const userId = profile?.id ?? null;
      if (!userId) {
        setTier("free");
        setLoading(false);
        return;
      }

      // Check for active promo-based tier (non-fatal — table may not exist)
      try {
        const { data: redemptions } = await supabase
          .from("promo_redemptions")
          .select("*")
          .eq("user_id", userId);
        if (redemptions && redemptions.length > 0) {
          const promoTier = getActivePromoTier(redemptions);
          if (promoTier) {
            setTier(promoTier);
            setLoading(false);
            return;
          }
        }
      } catch { /* promo_redemptions table may not exist — skip */ }

      // effectiveTier whitelists the stored value (so a stray entry in the
      // column can only read as free) and layers the opening trial on top. The
      // AI routes resolve the tier through the same function, so what this
      // offers and what the server allows cannot drift apart.
      setTier(effectiveTier(profile?.tier, profile?.created_at));
      setTrialLeft(trialDaysLeft(profile?.created_at));
    } catch {
      setTier("free");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTier();
  }, [fetchTier]);

  /**
   * Reconcile with Stripe when the app comes back to the foreground.
   *
   * Checkout finishes OUTSIDE the app now — Apple's 3.1.1 means the native
   * build hands the URL to the system browser, so the sequence is: tap
   * Subscribe, pay in Safari, switch back. The app was never unmounted, so
   * nothing re-read anything, and it still believed the person was on the
   * free tier. They had paid and the app acted as though they had not.
   *
   * The sync route asks Stripe directly rather than waiting for a webhook,
   * which also recovers the cases where a webhook was missed entirely.
   *
   * Guarded so it runs at most once a minute: coming back to the app is a
   * frequent event, and this costs a Stripe API call.
   */
  const lastSyncRef = useRef(0);
  useEffect(() => {
    const onVisible = async () => {
      if (document.visibilityState !== "visible") return;
      // A ref, not a local: `tier` is in this effect's deps, so the effect
      // re-runs whenever the tier resolves. A local counter would be reset by
      // that re-run and the throttle would not hold across it.
      if (Date.now() - lastSyncRef.current < 60_000) return;
      lastSyncRef.current = Date.now();
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) return;
        const res = await fetch(`${API_BASE}/api/stripe/sync`, {
          method: "POST",
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (!res.ok) return;
        const body = await res.json().catch(() => null);
        // Only re-read when Stripe disagreed with what we are showing;
        // otherwise this would invalidate the shared profile cache on every
        // app switch.
        if (body && body.tier !== tier) await fetchTier({ fresh: true });
      } catch {
        /* Best-effort. A failure here must never break the app. */
      }
    };
    void onVisible();
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [fetchTier, tier]);

  const value: TierContextValue = {
    tier,
    loading,
    hasAccess: (feature: FeatureKey) => checkAccess(tier, feature),
    limits: getLimits(tier),
    refreshTier: () => fetchTier({ fresh: true }),
    trialDaysLeft: trialLeft,
  };

  return <TierContext.Provider value={value}>{children}</TierContext.Provider>;
}

export function useTier() {
  return useContext(TierContext);
}
