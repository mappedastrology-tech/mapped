/**
 * One read of the signed-in user's profile row, shared by everything that
 * needs it.
 *
 * The account screen mounts eight or so independent sections — birth time,
 * location, notifications, subscription, oracle deck, chart system — and each
 * used to fetch the same profiles row for itself. Several also called
 * supabase.auth.getUser(), which is a network round trip to Supabase to
 * re-validate the token, where getSession() reads the already-verified session
 * from local storage. The page therefore opened with a fan of duplicate
 * requests before it could render, and the slowest one set the pace.
 *
 * This collapses that to a single in-flight request. Callers that arrive while
 * one is running await the same promise rather than starting another.
 *
 * On trusting getSession(): the id it yields is only ever used to read rows the
 * database already restricts to their owner. A forged local session buys
 * nothing, because Postgres re-checks the JWT under RLS on every query. Auth
 * decisions that actually matter happen server-side in src/lib/apiAuth.ts,
 * which verifies the token properly.
 */

import { supabase } from "@/lib/supabase";

export interface CachedProfile {
  id: string;
  tier?: string | null;
  created_at?: string | null;
  name?: string | null;
  notification_preferences?: Record<string, unknown> | null;
  birth_time_precision?: string | null;
  birth_time?: string | null;
  birth_time_window?: string | null;
  location_lat?: number | null;
  location_lng?: number | null;
  location_label?: string | null;
  timezone?: string | null;
  zodiac_system?: string | null;
  ayanamsa?: string | null;
  house_system?: string | null;
  node_type?: string | null;
  onboarding_completed?: boolean | null;
  [key: string]: unknown;
}

/**
 * How long a resolved row is reused.
 *
 * The duplicate reads this exists to collapse all happen within a moment of
 * the screen mounting, so a few seconds is enough to catch every one of them.
 * Keeping it short also means a write that forgets to call invalidateProfile()
 * — profiles is written from several files — goes stale for a breath rather
 * than for the rest of the session. Explicit invalidation is still correct and
 * still wanted; this only bounds the damage when it is missed.
 */
const TTL_MS = 5_000;

let inflight: Promise<CachedProfile | null> | null = null;
let resolvedAt = 0;
let cachedFor: string | null = null;
/** Bumped per fetch, so a superseded read cannot start the TTL for a newer one. */
let generation = 0;

/**
 * The current user's profile row, fetched at most once per user per page load.
 *
 * Returns null when signed out, or when the read fails — callers already have
 * to handle a missing profile, and turning a failed read into a thrown error
 * here would take out every section at once instead of one.
 */
export function getProfile(): Promise<CachedProfile | null> {
  // A request still in flight is always joined, whatever the clock says —
  // that is the case this exists for, and starting a second one would defeat
  // the whole point.
  if (inflight && (resolvedAt === 0 || Date.now() - resolvedAt < TTL_MS)) return inflight;

  resolvedAt = 0;
  const myGeneration = ++generation;
  inflight = (async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const uid = session?.user?.id;
      if (!uid) return null;
      cachedFor = uid;

      // select("*") rather than a column list: the whole point is that one
      // read serves every section, and each section wants different columns.
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", uid)
        .maybeSingle();

      if (error) return null;
      return (data as CachedProfile) ?? null;
    } catch {
      return null;
    } finally {
      // Start the TTL when the row actually lands, not when it was asked for,
      // so a slow read still gets its full window of reuse afterwards.
      if (myGeneration === generation) resolvedAt = Date.now();
    }
  })();

  return inflight;
}

/**
 * Drop the cached row so the next read goes back to the database.
 *
 * Call this after writing to profiles. A stale cache here shows someone the
 * setting they just changed reverting on the next render, which reads as the
 * save having failed.
 */
export function invalidateProfile(): void {
  inflight = null;
  resolvedAt = 0;
  cachedFor = null;
}

/** Which user the cached row belongs to, for callers that need to notice a switch. */
export function cachedProfileUserId(): string | null {
  return cachedFor;
}
