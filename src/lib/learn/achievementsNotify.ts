import { loadEngagement } from "./engagement";
import { evaluateAchievements, type Achievement } from "./achievements";

/**
 * Detects achievements unlocked since the last check (tracked in localStorage),
 * updates the stored set, and returns the newly-unlocked ones so the caller can
 * celebrate them. Returns [] when signed out or on the server.
 */
const KEY = "mapped:learn:unlocked";

export async function detectNewAchievements(): Promise<Achievement[]> {
  if (typeof window === "undefined") return [];

  let known: string[] = [];
  let hadStored = false;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) { known = JSON.parse(raw); hadStored = true; }
  } catch {
    /* ignore */
  }

  const { ctx } = await loadEngagement();
  const unlocked = evaluateAchievements(ctx).filter((a) => a.unlocked).map((a) => a.achievement);
  const unlockedIds = unlocked.map((a) => a.id);

  try {
    localStorage.setItem(KEY, JSON.stringify(unlockedIds));
  } catch {
    /* ignore */
  }

  // First-ever check on a device that already has progress: seed silently so a
  // returning user isn't spammed with a burst of old achievements.
  if (!hadStored && unlocked.length > 1) return [];

  const knownSet = new Set(known);
  return unlocked.filter((a) => !knownSet.has(a.id));
}
