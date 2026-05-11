/**
 * Completion Sync — dual-write layer for ritual completions.
 *
 * Strategy: localStorage is the fast, always-available source of truth.
 * Supabase is the durable backup that syncs when the user is online
 * and authenticated. On login, we merge: any local-only records get
 * pushed to Supabase, and any Supabase-only records get pulled to local.
 *
 * Also syncs tarot reading history.
 */

import { supabase } from "./supabase";
import { type CompletionRecord, getAllCompletions } from "./feedback";

// ═══════════════════════════════════════════════════════════════════════════
// COMPLETIONS — push local records to Supabase
// ═══════════════════════════════════════════════════════════════════════════

const COMPLETIONS_TABLE = "ritual_completions";
const TAROT_TABLE = "tarot_readings";
const COMPLETIONS_KEY = "mapped:completions";
const TAROT_KEY = "mapped:tarot-history";

/**
 * Push a single completion to Supabase (fire-and-forget).
 * Called from saveCompletion() after writing to localStorage.
 */
export async function pushCompletionToSupabase(record: CompletionRecord): Promise<void> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return; // Not logged in — skip silently

    await supabase.from(COMPLETIONS_TABLE).upsert({
      id: record.id,
      user_id: session.user.id,
      ritual_id: record.ritualId,
      ritual_title: record.ritualTitle,
      completed_at: record.completedAt,
      mood_word: record.moodWord,
      mood_category: record.moodCategory,
      fit_rating: record.fitRating,
      journal_entry: record.journalEntry || null,
      moon_phase: record.moonPhase,
      zodiac_season: record.zodiacSeason,
      day_of_week: record.dayOfWeek,
      time_of_day: record.timeOfDay,
      was_recommendation: record.wasRecommendation,
      was_override: record.wasOverride,
      was_user_searched: record.wasUserSearched,
    }, { onConflict: "id" });
  } catch {
    // Network error — local copy is fine, will sync later
  }
}

/**
 * Full sync on login or app startup.
 * 1. Push any local records missing from Supabase
 * 2. Pull any Supabase records missing from local
 */
export async function syncCompletions(): Promise<{ pushed: number; pulled: number }> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return { pushed: 0, pulled: 0 };

    const userId = session.user.id;
    const localRecords = getAllCompletions();
    const localIds = new Set(localRecords.map((r) => r.id));

    // Fetch all remote records
    const { data: remoteRows, error } = await supabase
      .from(COMPLETIONS_TABLE)
      .select("*")
      .eq("user_id", userId);

    if (error) throw error;
    const remoteRecords = (remoteRows || []) as Record<string, unknown>[];
    const remoteIds = new Set(remoteRecords.map((r) => r.id as string));

    // Push local-only records to Supabase
    const toPush = localRecords.filter((r) => !remoteIds.has(r.id));
    if (toPush.length > 0) {
      await supabase.from(COMPLETIONS_TABLE).upsert(
        toPush.map((r) => ({
          id: r.id,
          user_id: userId,
          ritual_id: r.ritualId,
          ritual_title: r.ritualTitle,
          completed_at: r.completedAt,
          mood_word: r.moodWord,
          mood_category: r.moodCategory,
          fit_rating: r.fitRating,
          journal_entry: r.journalEntry || null,
          moon_phase: r.moonPhase,
          zodiac_season: r.zodiacSeason,
          day_of_week: r.dayOfWeek,
          time_of_day: r.timeOfDay,
          was_recommendation: r.wasRecommendation,
          was_override: r.wasOverride,
          was_user_searched: r.wasUserSearched,
        })),
        { onConflict: "id" }
      );
    }

    // Pull remote-only records to localStorage
    const toPull = remoteRecords.filter((r) => !localIds.has(r.id as string));
    if (toPull.length > 0) {
      const pulled: CompletionRecord[] = toPull.map((r) => ({
        id: r.id as string,
        ritualId: r.ritual_id as string,
        ritualTitle: r.ritual_title as string,
        completedAt: r.completed_at as string,
        moodWord: r.mood_word as string,
        moodCategory: r.mood_category as CompletionRecord["moodCategory"],
        fitRating: r.fit_rating as CompletionRecord["fitRating"],
        journalEntry: (r.journal_entry as string) || undefined,
        moonPhase: r.moon_phase as string,
        zodiacSeason: r.zodiac_season as string,
        dayOfWeek: r.day_of_week as string,
        timeOfDay: r.time_of_day as CompletionRecord["timeOfDay"],
        wasRecommendation: r.was_recommendation as boolean,
        wasOverride: r.was_override as boolean,
        wasUserSearched: r.was_user_searched as boolean,
      }));
      const merged = [...localRecords, ...pulled];
      merged.sort((a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime());
      try {
        localStorage.setItem(COMPLETIONS_KEY, JSON.stringify(merged));
      } catch {}
    }

    return { pushed: toPush.length, pulled: toPull.length };
  } catch {
    return { pushed: 0, pulled: 0 };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// TAROT READINGS — same pattern
// ═══════════════════════════════════════════════════════════════════════════

interface SavedReading {
  id: string;
  date: string;
  deck: string;
  spreadName: string;
  cards: { name: string; keywords?: string[]; position?: string; reversed?: boolean }[];
}

export async function pushReadingToSupabase(reading: SavedReading): Promise<void> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    await supabase.from(TAROT_TABLE).upsert({
      id: reading.id,
      user_id: session.user.id,
      read_at: reading.date,
      deck: reading.deck,
      spread_name: reading.spreadName,
      cards: reading.cards, // stored as JSONB
    }, { onConflict: "id" });
  } catch {}
}

export async function syncTarotReadings(): Promise<{ pushed: number; pulled: number }> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return { pushed: 0, pulled: 0 };

    const userId = session.user.id;
    let localReadings: SavedReading[] = [];
    try {
      localReadings = JSON.parse(localStorage.getItem(TAROT_KEY) || "[]");
    } catch {}
    const localIds = new Set(localReadings.map((r) => r.id));

    const { data: remoteRows, error } = await supabase
      .from(TAROT_TABLE)
      .select("*")
      .eq("user_id", userId);

    if (error) throw error;
    const remoteRecords = (remoteRows || []) as Record<string, unknown>[];
    const remoteIds = new Set(remoteRecords.map((r) => r.id as string));

    // Push
    const toPush = localReadings.filter((r) => !remoteIds.has(r.id));
    if (toPush.length > 0) {
      await supabase.from(TAROT_TABLE).upsert(
        toPush.map((r) => ({
          id: r.id,
          user_id: userId,
          read_at: r.date,
          deck: r.deck,
          spread_name: r.spreadName,
          cards: r.cards,
        })),
        { onConflict: "id" }
      );
    }

    // Pull
    const toPull = remoteRecords.filter((r) => !localIds.has(r.id as string));
    if (toPull.length > 0) {
      const pulled: SavedReading[] = toPull.map((r) => ({
        id: r.id as string,
        date: r.read_at as string,
        deck: r.deck as string,
        spreadName: r.spread_name as string,
        cards: r.cards as SavedReading["cards"],
      }));
      const merged = [...localReadings, ...pulled];
      merged.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      // Keep last 50
      const trimmed = merged.slice(0, 50);
      try {
        localStorage.setItem(TAROT_KEY, JSON.stringify(trimmed));
      } catch {}
    }

    return { pushed: toPush.length, pulled: toPull.length };
  } catch {
    return { pushed: 0, pulled: 0 };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// FULL SYNC — call on app startup or login
// ═══════════════════════════════════════════════════════════════════════════

export async function syncAllData(): Promise<void> {
  await Promise.all([syncCompletions(), syncTarotReadings()]);
}
