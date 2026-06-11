// User's current location — the single source of truth for all
// location-aware calculations (sunrise/sunset, almanac, gardening zone,
// transits). Replaces the old hardcoded Austin, TX fallbacks.
//
// Resolution order:
//   1. Explicit location set in Account settings (profiles.location_*)
//   2. Birth location from the user's chart (everyone who onboarded has one)
//   3. null — callers decide how to degrade (most show a "set location" hint)
//
// Cached in localStorage (userId-scoped) so synchronous code paths don't
// need to await Supabase.

import { supabase } from "@/lib/supabase";

export interface UserLocation {
  lat: number;
  lng: number;
  /** Human-readable label, e.g. "Brooklyn, New York, USA" */
  label: string;
  /** Where this location came from */
  source: "profile" | "birth";
}

const cacheKey = (userId: string) => `mapped:location:${userId}`;

// ─── Cache ───────────────────────────────────────────────────────────────────

export function getCachedLocation(userId: string): UserLocation | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(cacheKey(userId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as UserLocation;
    if (typeof parsed.lat !== "number" || typeof parsed.lng !== "number") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function cacheLocation(userId: string, loc: UserLocation): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(cacheKey(userId), JSON.stringify(loc));
  } catch {
    // storage full/unavailable — non-fatal
  }
}

export function clearCachedLocation(userId: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(cacheKey(userId));
  } catch {
    // non-fatal
  }
}

// ─── Fetch / save ────────────────────────────────────────────────────────────

/**
 * Resolve the user's current location: explicit profile location first,
 * then birth location from their chart. Caches the result.
 */
export async function fetchUserLocation(userId: string): Promise<UserLocation | null> {
  // 1. Explicit location on profile
  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("location_lat, location_lng, location_label")
      .eq("id", userId)
      .maybeSingle();

    if (
      profile &&
      typeof profile.location_lat === "number" &&
      typeof profile.location_lng === "number"
    ) {
      const loc: UserLocation = {
        lat: profile.location_lat,
        lng: profile.location_lng,
        label: profile.location_label || "Your location",
        source: "profile",
      };
      cacheLocation(userId, loc);
      return loc;
    }
  } catch {
    // fall through to birth location
  }

  // 2. Birth location from chart. Users can have multiple chart rows
  // (historic duplicates), so take the most recent — .maybeSingle()
  // would error on duplicates and silently lose the location.
  try {
    const { data: chartRows } = await supabase
      .from("charts")
      .select("latitude, longitude, city_name")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1);

    const chart = chartRows?.[0];
    if (chart && typeof chart.latitude === "number" && typeof chart.longitude === "number") {
      const loc: UserLocation = {
        lat: chart.latitude,
        lng: chart.longitude,
        label: chart.city_name || "Your birth location",
        source: "birth",
      };
      cacheLocation(userId, loc);
      return loc;
    }
  } catch {
    // no chart either
  }

  return null;
}

/** Save an explicit current location to the user's profile. */
export async function saveUserLocation(
  userId: string,
  loc: { lat: number; lng: number; label: string }
): Promise<string | null> {
  const { error } = await supabase
    .from("profiles")
    .update({
      location_lat: loc.lat,
      location_lng: loc.lng,
      location_label: loc.label,
    })
    .eq("id", userId);

  if (error) return error.message;
  cacheLocation(userId, { ...loc, source: "profile" });
  return null;
}

// ─── Garden zone estimation ──────────────────────────────────────────────────

/**
 * Rough USDA hardiness zone estimate from latitude (continental US).
 * Good enough as a default — users can override in settings.
 */
export function estimateGardenZone(lat: number): string {
  const abs = Math.abs(lat);
  if (abs >= 47) return "4b";
  if (abs >= 44) return "5a";
  if (abs >= 42) return "5b";
  if (abs >= 40) return "6a";
  if (abs >= 38) return "6b";
  if (abs >= 36) return "7a";
  if (abs >= 34) return "7b";
  if (abs >= 32) return "8a";
  if (abs >= 30) return "8b";
  if (abs >= 28) return "9a";
  if (abs >= 26) return "9b";
  return "10a";
}
