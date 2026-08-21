/**
 * Daily card seeding — deterministic per (user, day).
 *
 * The original seed was date-only, so every account revealed the identical
 * "card of the day". Mixing a stable per-account salt keeps the card fixed all
 * day for one user while differing across users. Signed-out visitors get a
 * persistent per-device salt so even anonymous draws differ between devices.
 */

import { supabase } from "@/lib/supabase";

const DEVICE_SALT_KEY = "mapped:card-salt";

/** FNV-1a — small, stable string hash onto uint32. */
function fnv1a(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

/** Date mixed with the salt, avalanched through the Knuth multiplier. */
export function mixDailySeed(date: Date, salt: number): number {
  const base = date.getFullYear() * 367 + date.getMonth() * 31 + date.getDate() * 13;
  return Math.imul(base ^ salt, 2654435761) >>> 0;
}

/**
 * Resolve the per-account salt: the signed-in user's id hashed, else a
 * per-device salt persisted in localStorage. getSession() reads the locally
 * cached session, so this resolves without a network round-trip.
 */
export async function getCardSalt(): Promise<number> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const uid = session?.user?.id;
    if (uid) return fnv1a(uid);
  } catch { /* signed out or auth unavailable — fall through */ }
  try {
    const existing = Number(localStorage.getItem(DEVICE_SALT_KEY));
    if (Number.isFinite(existing) && existing > 0) return existing >>> 0;
    const fresh = ((Math.floor(Math.random() * 0xffffffff)) || 1) >>> 0;
    localStorage.setItem(DEVICE_SALT_KEY, String(fresh));
    return fresh;
  } catch {
    return 0;
  }
}
