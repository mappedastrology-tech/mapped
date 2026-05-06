"use client";

/**
 * BirthTimeProvider — React context for birth time precision state.
 *
 * Reads precision from Supabase profile on mount. Exposes precision level,
 * feature visibility helpers, and re-prompt state.
 */

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import {
  type BirthTimePrecision,
  type TimeWindow,
  type TimeDependentFeature,
  canShowFeature,
  shouldRenderFeature,
  getRepromptForToday,
  type RepromptState,
} from "@/lib/birth-time";

interface BirthTimeContextValue {
  precision: BirthTimePrecision;
  timeWindow: TimeWindow | null;
  dayNightKnown: boolean;
  isDaytime: boolean | null;
  loading: boolean;
  /** Check visibility status of a time-dependent feature */
  featureStatus: (feature: TimeDependentFeature) => "full" | "caveated" | "hidden";
  /** Whether a feature should render at all */
  shouldRender: (feature: TimeDependentFeature) => boolean;
  /** Current re-prompt day (null = no prompt) */
  repromptDay: number | null;
  /** Dismiss all re-prompts permanently */
  dismissReprompts: () => void;
  /** Mark a re-prompt day as shown */
  markRepromptShown: (day: number) => void;
  /** Refresh from Supabase */
  refresh: () => Promise<void>;
}

const BirthTimeContext = createContext<BirthTimeContextValue>({
  precision: "unknown",
  timeWindow: null,
  dayNightKnown: false,
  isDaytime: null,
  loading: true,
  featureStatus: () => "hidden",
  shouldRender: () => true,
  repromptDay: null,
  dismissReprompts: () => {},
  markRepromptShown: () => {},
  refresh: async () => {},
});

export function useBirthTime() {
  return useContext(BirthTimeContext);
}

const REPROMPT_KEY = "mapped:birth_time_reprompt";

export function BirthTimeProvider({ children }: { children: ReactNode }) {
  const [precision, setPrecision] = useState<BirthTimePrecision>("unknown");
  const [timeWindow, setTimeWindow] = useState<TimeWindow | null>(null);
  const [dayNightKnown, setDayNightKnown] = useState(false);
  const [isDaytime, setIsDaytime] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [repromptState, setRepromptState] = useState<RepromptState | null>(null);

  const loadFromSupabase = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data: profile } = await supabase
        .from("profiles")
        .select("birth_time_precision, birth_time_window, day_night_known, is_daytime, created_at, birth_time")
        .eq("id", user.id)
        .single();

      if (profile) {
        // If user has a birth time saved but precision was never set (pre-onboarding account),
        // treat it as "exact" so they aren't blocked from time-dependent features
        const effectivePrecision = (!profile.birth_time_precision && profile.birth_time)
          ? "exact"
          : (profile.birth_time_precision || "unknown");
        setPrecision(effectivePrecision);
        setTimeWindow(profile.birth_time_window || null);
        setDayNightKnown(profile.day_night_known || false);
        setIsDaytime(profile.is_daytime ?? null);

        // Load re-prompt state from localStorage
        const stored = localStorage.getItem(REPROMPT_KEY);
        if (stored) {
          setRepromptState(JSON.parse(stored));
        } else {
          const initial: RepromptState = {
            dismissed: false,
            lastShownDay: null,
            accountCreatedAt: profile.created_at || new Date().toISOString(),
          };
          setRepromptState(initial);
          localStorage.setItem(REPROMPT_KEY, JSON.stringify(initial));
        }
      }
    } catch (e) {
      console.error("BirthTimeProvider load error:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadFromSupabase(); }, [loadFromSupabase]);

  const featureStatus = useCallback(
    (feature: TimeDependentFeature) => canShowFeature(precision, feature),
    [precision]
  );

  const shouldRender = useCallback(
    (feature: TimeDependentFeature) => shouldRenderFeature(precision, feature),
    [precision]
  );

  const repromptDay = precision === "unknown" && repromptState
    ? getRepromptForToday(repromptState)
    : null;

  const dismissReprompts = useCallback(() => {
    if (!repromptState) return;
    const updated = { ...repromptState, dismissed: true };
    setRepromptState(updated);
    localStorage.setItem(REPROMPT_KEY, JSON.stringify(updated));
  }, [repromptState]);

  const markRepromptShown = useCallback((day: number) => {
    if (!repromptState) return;
    const updated = { ...repromptState, lastShownDay: day };
    setRepromptState(updated);
    localStorage.setItem(REPROMPT_KEY, JSON.stringify(updated));
  }, [repromptState]);

  return (
    <BirthTimeContext.Provider
      value={{
        precision,
        timeWindow,
        dayNightKnown,
        isDaytime,
        loading,
        featureStatus,
        shouldRender,
        repromptDay,
        dismissReprompts,
        markRepromptShown,
        refresh: loadFromSupabase,
      }}
    >
      {children}
    </BirthTimeContext.Provider>
  );
}
