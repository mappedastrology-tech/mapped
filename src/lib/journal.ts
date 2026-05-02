/**
 * Journal system — daily entries + AI-generated prompts and reflections.
 *
 * Storage: Supabase `journal_entries` table
 * Prompts: derived from daily horoscope + celestial context
 * Reflections: AI-generated at weekly/monthly/quarterly/yearly/new-year cadences
 */

import { supabase } from "./supabase";

// ─── TYPES ────────────────────────────────────────────────────────────────────

export interface JournalEntry {
  id: string;
  user_id: string;
  date: string;              // YYYY-MM-DD
  prompt: string;            // AI-generated prompt for this day
  content: string;           // user's written entry
  mood?: string;             // optional mood tag
  celestial_context?: {      // snapshot of what was happening in the sky
    moonPhase: string;
    zodiacSeason: string;
    planetaryDay: string;
    nakshatra: string;
  };
  created_at: string;
  updated_at: string;
}

export interface JournalReflection {
  id: string;
  user_id: string;
  cadence: "weekly" | "monthly" | "quarterly" | "yearly" | "new-year";
  period_start: string;      // start of the period this covers
  period_end: string;        // end of the period
  content: string;           // AI-generated reflection
  entry_count: number;       // how many journal entries were in this period
  created_at: string;
}

// ─── ENTRY CRUD ───────────────────────────────────────────────────────────────

export async function getJournalEntry(userId: string, date: string): Promise<JournalEntry | null> {
  try {
    const { data, error } = await supabase
      .from("journal_entries")
      .select("*")
      .eq("user_id", userId)
      .eq("date", date)
      .single();

    if (!error && data) return data as JournalEntry;
  } catch { /* Supabase unavailable */ }

  // Fall back to localStorage
  try {
    const lsEntries = JSON.parse(localStorage.getItem("mapped:journal-entries") || "[]") as JournalEntry[];
    return lsEntries.find(e => e.date === date) || null;
  } catch { return null; }
}

export async function saveJournalEntry(
  userId: string,
  date: string,
  content: string,
  prompt: string,
  mood?: string,
  celestialContext?: JournalEntry["celestial_context"]
): Promise<JournalEntry | null> {
  const now = new Date().toISOString();

  // Build the entry object for localStorage fallback
  const localEntry: JournalEntry = {
    id: `local-${date}-${userId}`,
    user_id: userId,
    date,
    content,
    prompt: prompt || "(no prompt)",
    mood: mood || undefined,
    celestial_context: celestialContext || undefined,
    created_at: now,
    updated_at: now,
  };

  // Always save to localStorage first (guaranteed to work)
  try {
    const lsKey = "mapped:journal-entries";
    const existing = JSON.parse(localStorage.getItem(lsKey) || "[]") as JournalEntry[];
    const idx = existing.findIndex(e => e.date === date);
    if (idx >= 0) {
      existing[idx] = { ...existing[idx], ...localEntry, id: existing[idx].id };
    } else {
      existing.unshift(localEntry);
    }
    // Keep last 200
    localStorage.setItem(lsKey, JSON.stringify(existing.slice(0, 200)));
  } catch { /* localStorage full or unavailable */ }

  // Try Supabase
  try {
    const { data: existingRow } = await supabase
      .from("journal_entries")
      .select("id")
      .eq("user_id", userId)
      .eq("date", date)
      .maybeSingle();

    const payload = {
      user_id: userId,
      date,
      content,
      prompt: prompt || "(no prompt)",
      mood: mood || null,
      celestial_context: celestialContext || null,
      updated_at: now,
    };

    if (existingRow) {
      const { user_id: _uid, date: _d, ...updatePayload } = payload;
      const { data, error } = await supabase
        .from("journal_entries")
        .update(updatePayload)
        .eq("user_id", userId)
        .eq("date", date)
        .select()
        .single();

      if (error) {
        console.error("Journal update error:", JSON.stringify(error));
        return localEntry; // Return localStorage version instead of null
      }
      return data as JournalEntry;
    } else {
      const { data, error } = await supabase
        .from("journal_entries")
        .insert(payload)
        .select()
        .single();

      if (error) {
        console.error("Journal insert error:", JSON.stringify(error));
        return localEntry; // Return localStorage version instead of null
      }
      return data as JournalEntry;
    }
  } catch (err) {
    console.error("Journal Supabase error:", err);
    return localEntry; // Supabase totally failed, but localStorage worked
  }
}

export async function getJournalEntries(
  userId: string,
  limit = 30,
  offset = 0
): Promise<JournalEntry[]> {
  let dbEntries: JournalEntry[] = [];
  try {
    const { data, error } = await supabase
      .from("journal_entries")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false })
      .range(offset, offset + limit - 1);

    if (!error && data) dbEntries = data as JournalEntry[];
  } catch { /* Supabase unavailable */ }

  // Merge localStorage entries that Supabase might not have
  try {
    const lsEntries = JSON.parse(localStorage.getItem("mapped:journal-entries") || "[]") as JournalEntry[];
    for (const lse of lsEntries) {
      if (!dbEntries.some(e => e.date === lse.date)) {
        dbEntries.push(lse);
      }
    }
    // Re-sort by date descending
    dbEntries.sort((a, b) => b.date.localeCompare(a.date));
  } catch { /* ignore */ }

  return dbEntries;
}

export async function getJournalEntriesForPeriod(
  userId: string,
  startDate: string,
  endDate: string
): Promise<JournalEntry[]> {
  const { data, error } = await supabase
    .from("journal_entries")
    .select("*")
    .eq("user_id", userId)
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: true });

  if (error) return [];
  return (data || []) as JournalEntry[];
}

// ─── REFLECTIONS ──────────────────────────────────────────────────────────────

export async function getReflections(
  userId: string,
  cadence?: JournalReflection["cadence"]
): Promise<JournalReflection[]> {
  let query = supabase
    .from("journal_reflections")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (cadence) {
    query = query.eq("cadence", cadence);
  }

  const { data, error } = await query.limit(20);
  if (error) return [];
  return (data || []) as JournalReflection[];
}

export async function saveReflection(
  userId: string,
  cadence: JournalReflection["cadence"],
  periodStart: string,
  periodEnd: string,
  content: string,
  entryCount: number
): Promise<JournalReflection | null> {
  const { data, error } = await supabase
    .from("journal_reflections")
    .insert({
      user_id: userId,
      cadence,
      period_start: periodStart,
      period_end: periodEnd,
      content,
      entry_count: entryCount,
    })
    .select()
    .single();

  if (error) {
    console.error("Reflection save error:", error);
    return null;
  }
  return data as JournalReflection;
}

// ─── PROMPT GENERATION (called from API) ──────────────────────────────────────

export function buildJournalPromptContext(horoscope: string, celestial: {
  moonPhase: string;
  zodiacSeason: string;
  planetaryDay: string;
  nakshatra: string;
  nakshatraQuality: string;
}): string {
  return `Today's horoscope: "${horoscope}"
Moon phase: ${celestial.moonPhase}
Zodiac season: ${celestial.zodiacSeason}
Planetary day: ${celestial.planetaryDay}
Nakshatra: ${celestial.nakshatra} (${celestial.nakshatraQuality})`;
}
