/**
 * Journal Service Layer — the chart-shaped journaling system.
 *
 * Features: auto-tagging, tier gating (8/month free), metadata pattern
 * surfacing, privacy zones, crisis detection, burn-after-writing.
 *
 * Storage: localStorage primary with Supabase sync.
 */

import { supabase } from "./supabase";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface JournalEntry {
  id: string;
  user_id: string;
  text: string;
  date: string; // YYYY-MM-DD (kept for backwards compat)
  created_at: string; // ISO
  updated_at: string; // ISO
  prompt_id: string | null;
  prompt_text: string | null;
  is_burn: boolean;
  is_voice: boolean;
  // Legacy compat
  prompt?: string;
  content?: string;
  mood?: string;
  celestial_context?: {
    moonPhase: string;
    zodiacSeason: string;
    planetaryDay: string;
    nakshatra: string;
  };

  // Auto-tags (sky metadata)
  tags: JournalTags;
}

export interface JournalTags {
  moonPhase: string;
  planetaryDay: string;
  lordOfYear: string | null;
  activeTransits: string[];
  wordCount: number;
  timeOfDay: "morning" | "afternoon" | "evening" | "night";
}

export interface JournalReflection {
  id: string;
  user_id: string;
  cadence: "weekly" | "monthly" | "quarterly" | "yearly" | "new-year";
  period_start: string;
  period_end: string;
  content: string;
  entry_count: number;
  created_at: string;
}

export interface JournalPattern {
  id: string;
  type: "frequency" | "length" | "cyclical" | "event" | "topical" | "word_frequency";
  text: string;
  supportingEntryIds: string[];
  surfacedAt: string;
  dismissed: boolean;
}

export type FilterKey = "all" | "new_moon" | "full_moon" | "quarter_moon" | "by_planet_day" | "by_transit" | "by_lord" | "date_range";

// ─── Constants ───────────────────────────────────────────────────────────────

const JOURNAL_ENTRIES_KEY = "mapped:journal-entries";
const JOURNAL_PATTERNS_KEY = "mapped:journal_patterns";
const JOURNAL_DISMISSED_KEY = "mapped:journal_dismissed_patterns";

export const FREE_MONTHLY_CAP = 8;

const PLANETARY_DAYS: Record<number, string> = {
  0: "Sun", 1: "Moon", 2: "Mars", 3: "Mercury", 4: "Jupiter", 5: "Venus", 6: "Saturn",
};

// ─── Auto-tagging ────────────────────────────────────────────────────────────

export function getTimeOfDay(hour: number): "morning" | "afternoon" | "evening" | "night" {
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 21) return "evening";
  return "night";
}

export function getPlanetaryDay(date: Date): string {
  return PLANETARY_DAYS[date.getDay()] || "Sun";
}

export function autoTag(
  text: string,
  date: Date,
  moonPhase: string,
  lordOfYear: string | null,
  activeTransits: string[]
): JournalTags {
  return {
    moonPhase,
    planetaryDay: getPlanetaryDay(date),
    lordOfYear,
    activeTransits,
    wordCount: text.trim().split(/\s+/).filter(Boolean).length,
    timeOfDay: getTimeOfDay(date.getHours()),
  };
}

// ─── Entry CRUD ──────────────────────────────────────────────────────────────

export function getLocalEntries(): JournalEntry[] {
  try {
    const raw = localStorage.getItem(JOURNAL_ENTRIES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalEntries(entries: JournalEntry[]) {
  localStorage.setItem(JOURNAL_ENTRIES_KEY, JSON.stringify(entries.slice(0, 500)));
}

export function addEntry(entry: JournalEntry) {
  const entries = getLocalEntries();
  entries.unshift(entry);
  saveLocalEntries(entries);
  // Fire-and-forget Supabase backup (burn entries never leave the device)
  pushEntryToSupabase(entry).catch(() => {});
}

export function updateEntry(id: string, text: string) {
  const entries = getLocalEntries();
  const idx = entries.findIndex((e) => e.id === id);
  if (idx >= 0) {
    entries[idx].text = text;
    entries[idx].content = text;
    entries[idx].updated_at = new Date().toISOString();
    if (entries[idx].tags) {
      entries[idx].tags.wordCount = text.trim().split(/\s+/).filter(Boolean).length;
    }
    saveLocalEntries(entries);
    pushEntryToSupabase(entries[idx]).catch(() => {});
  }
}

export function deleteEntry(id: string) {
  const entries = getLocalEntries().filter((e) => e.id !== id);
  saveLocalEntries(entries);
  deleteEntryFromSupabase(id).catch(() => {});
}

// ─── Dual-write Sync (localStorage primary, Supabase durable backup) ─────────

/** Map a local entry to the journal_entries row shape (keyed by client_id). */
function entryToRow(entry: JournalEntry, userId: string) {
  return {
    user_id: userId,
    client_id: entry.id,
    date: entry.date || (entry.created_at || new Date().toISOString()).slice(0, 10),
    content: entry.text || entry.content || "",
    prompt: entry.prompt || entry.prompt_text || "",
    mood: entry.mood || null,
    celestial_context: entry.celestial_context || null,
    prompt_id: entry.prompt_id || null,
    prompt_text: entry.prompt_text || null,
    is_burn: false, // burn entries are never pushed
    is_voice: !!entry.is_voice,
    tags: entry.tags || null,
    created_at: entry.created_at || new Date().toISOString(),
    updated_at: entry.updated_at || new Date().toISOString(),
  };
}

/**
 * Push a single entry to Supabase (fire-and-forget).
 * No-ops when signed out, offline, or for burn-after-writing entries —
 * those are a privacy promise and never leave the device.
 */
export async function pushEntryToSupabase(entry: JournalEntry): Promise<void> {
  try {
    if (entry.is_burn) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return; // Not logged in — skip silently

    await supabase
      .from("journal_entries")
      .upsert(entryToRow(entry, session.user.id), { onConflict: "user_id,client_id" });
  } catch {
    // Network error — local copy is fine, will sync later
  }
}

/** Delete the Supabase row matching a local entry id (fire-and-forget). */
export async function deleteEntryFromSupabase(clientId: string): Promise<void> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    await supabase
      .from("journal_entries")
      .delete()
      .eq("user_id", session.user.id)
      .eq("client_id", clientId);
  } catch {
    // Offline — nothing to do
  }
}

/** Map a journal_entries row back to the local JournalEntry shape. */
function rowToEntry(r: Record<string, unknown>): JournalEntry {
  const content = (r.content as string) || "";
  const createdAt = (r.created_at as string) || new Date().toISOString();
  const tags = (r.tags as JournalTags | null) || {
    moonPhase: "unknown",
    planetaryDay: getPlanetaryDay(new Date(createdAt)),
    lordOfYear: null,
    activeTransits: [],
    wordCount: content.trim().split(/\s+/).filter(Boolean).length,
    timeOfDay: getTimeOfDay(new Date(createdAt).getHours()),
  };
  return {
    id: r.client_id as string,
    user_id: r.user_id as string,
    text: content,
    content,
    date: (r.date as string) || createdAt.slice(0, 10),
    created_at: createdAt,
    updated_at: (r.updated_at as string) || createdAt,
    prompt_id: (r.prompt_id as string) || null,
    prompt_text: (r.prompt_text as string) || null,
    prompt: (r.prompt as string) || (r.prompt_text as string) || undefined,
    mood: (r.mood as string) || undefined,
    celestial_context: (r.celestial_context as JournalEntry["celestial_context"]) || undefined,
    is_burn: false,
    is_voice: !!r.is_voice,
    tags,
  };
}

/**
 * Full sync on login or app startup.
 * Pulls remote entries, merges with local by client_id (newest updated_at
 * wins), writes the merged set back to localStorage, and pushes any
 * local-only entries up. Burn entries never sync. No-ops when signed out.
 */
export async function pullJournalEntries(userId: string): Promise<{ pushed: number; pulled: number }> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user || session.user.id !== userId) return { pushed: 0, pulled: 0 };

    const { data: remoteRows, error } = await supabase
      .from("journal_entries")
      .select("*")
      .eq("user_id", userId)
      .not("client_id", "is", null);
    if (error) throw error;

    const local = getLocalEntries();
    const byId = new Map<string, JournalEntry>(local.map((e) => [e.id, e]));
    const remoteIds = new Set<string>();
    let pulled = 0;

    for (const row of (remoteRows || []) as Record<string, unknown>[]) {
      const remote = rowToEntry(row);
      remoteIds.add(remote.id);
      const existing = byId.get(remote.id);
      if (!existing) {
        byId.set(remote.id, remote);
        pulled++;
      } else if ((remote.updated_at || "") > (existing.updated_at || "")) {
        byId.set(remote.id, remote); // newest updated_at wins
        pulled++;
      }
    }

    const merged = [...byId.values()].sort((a, b) =>
      (b.created_at || b.date || "").localeCompare(a.created_at || a.date || "")
    );
    saveLocalEntries(merged);

    // Push local-only entries up (never burn entries)
    const toPush = local.filter((e) => !e.is_burn && !remoteIds.has(e.id));
    if (toPush.length > 0) {
      await supabase
        .from("journal_entries")
        .upsert(toPush.map((e) => entryToRow(e, userId)), { onConflict: "user_id,client_id" });
    }

    return { pushed: toPush.length, pulled };
  } catch {
    return { pushed: 0, pulled: 0 };
  }
}

export function getEntriesThisMonth(): number {
  const entries = getLocalEntries();
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  return entries.filter((e) => new Date(e.created_at) >= monthStart).length;
}

export function canWriteEntry(tier: "free" | "mid"): boolean {
  if (tier !== "free") return true;
  return getEntriesThisMonth() < FREE_MONTHLY_CAP;
}

export function getRemainingEntries(tier: "free" | "mid"): number | null {
  if (tier !== "free") return null;
  return Math.max(0, FREE_MONTHLY_CAP - getEntriesThisMonth());
}

// ─── Supabase Sync (backwards compatible) ────────────────────────────────────

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

  const lsEntries = getLocalEntries();
  return lsEntries.find((e) => e.date === date) || null;
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
  const localEntry: JournalEntry = {
    id: `local-${date}-${Date.now()}`,
    user_id: userId,
    date,
    text: content,
    content,
    prompt: prompt || "(no prompt)",
    prompt_id: null,
    prompt_text: prompt || null,
    mood: mood || undefined,
    celestial_context: celestialContext || undefined,
    is_burn: false,
    is_voice: false,
    tags: autoTag(content, new Date(), celestialContext?.moonPhase || "unknown", null, []),
    created_at: now,
    updated_at: now,
  };

  // Save to localStorage
  addEntry(localEntry);

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
      void _uid; void _d;
      await supabase.from("journal_entries").update(updatePayload).eq("user_id", userId).eq("date", date);
    } else {
      await supabase.from("journal_entries").insert(payload);
    }
  } catch { /* Supabase failed, localStorage is the fallback */ }

  return localEntry;
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

  // Merge localStorage
  const lsEntries = getLocalEntries();
  for (const lse of lsEntries) {
    if (!dbEntries.some((e) => e.date === lse.date)) {
      dbEntries.push(lse);
    }
  }
  dbEntries.sort((a, b) => (b.created_at || b.date).localeCompare(a.created_at || a.date));
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

// ─── Reflections (kept for backwards compat) ─────────────────────────────────

export async function getReflections(
  userId: string,
  cadence?: JournalReflection["cadence"]
): Promise<JournalReflection[]> {
  let query = supabase
    .from("journal_reflections")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (cadence) query = query.eq("cadence", cadence);
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
    .insert({ user_id: userId, cadence, period_start: periodStart, period_end: periodEnd, content, entry_count: entryCount })
    .select()
    .single();
  if (error) return null;
  return data as JournalReflection;
}

// ─── Filtered Views ──────────────────────────────────────────────────────────

export function filterEntries(entries: JournalEntry[], filter: FilterKey, filterValue?: string): JournalEntry[] {
  switch (filter) {
    case "all": return entries;
    case "new_moon": return entries.filter((e) => e.tags?.moonPhase === "new");
    case "full_moon": return entries.filter((e) => e.tags?.moonPhase === "full");
    case "quarter_moon": return entries.filter((e) => e.tags?.moonPhase === "first_quarter" || e.tags?.moonPhase === "last_quarter");
    case "by_planet_day": return entries.filter((e) => e.tags?.planetaryDay === filterValue);
    case "by_transit": return entries.filter((e) => e.tags?.activeTransits?.includes(filterValue || ""));
    case "by_lord": return entries.filter((e) => e.tags?.lordOfYear === filterValue);
    case "date_range":
      if (filterValue) {
        const [start, end] = filterValue.split("|");
        return entries.filter((e) => e.created_at >= start && e.created_at <= end);
      }
      return entries;
    default: return entries;
  }
}

// ─── Metadata Pattern Surfacing (mid+) ───────────────────────────────────────

export function surfaceMetadataPatterns(entries: JournalEntry[]): JournalPattern[] {
  if (entries.length < 5) return [];
  const patterns: JournalPattern[] = [];
  const now = new Date();
  const validEntries = entries.filter((e) => e.tags);

  // Full moon frequency
  const fullMoonEntries = validEntries.filter((e) => e.tags.moonPhase === "full");
  if (fullMoonEntries.length >= 3) {
    patterns.push({
      id: "pat_full_moon_freq", type: "frequency",
      text: `You've written ${fullMoonEntries.length} entries on full moons — ${Math.round(fullMoonEntries.length / validEntries.length * 100)}% of your journal.`,
      supportingEntryIds: fullMoonEntries.map((e) => e.id),
      surfacedAt: now.toISOString(), dismissed: false,
    });
  }

  // Length by moon phase
  const avgLength = validEntries.reduce((s, e) => s + (e.tags.wordCount || 0), 0) / validEntries.length;
  const fullMoonAvg = fullMoonEntries.length > 0
    ? fullMoonEntries.reduce((s, e) => s + (e.tags.wordCount || 0), 0) / fullMoonEntries.length : 0;
  if (fullMoonAvg > avgLength * 1.4 && fullMoonEntries.length >= 3) {
    patterns.push({
      id: "pat_full_moon_length", type: "length",
      text: `Your full moon entries are ${(fullMoonAvg / avgLength).toFixed(1)}x longer than average.`,
      supportingEntryIds: fullMoonEntries.map((e) => e.id),
      surfacedAt: now.toISOString(), dismissed: false,
    });
  }

  // On this day last year
  const oneYearAgo = new Date(now);
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  const nearbyEntry = validEntries.find((e) => {
    const d = new Date(e.created_at);
    return Math.abs(d.getTime() - oneYearAgo.getTime()) < 3 * 24 * 60 * 60 * 1000;
  });
  if (nearbyEntry) {
    const text = nearbyEntry.text || nearbyEntry.content || "";
    const preview = text.slice(0, 60);
    patterns.push({
      id: "pat_this_day_last_year", type: "cyclical",
      text: `On this day last year, you wrote: "${preview}${text.length > 60 ? "..." : ""}"`,
      supportingEntryIds: [nearbyEntry.id],
      surfacedAt: now.toISOString(), dismissed: false,
    });
  }

  // Time of day pattern
  const timeGroups = validEntries.reduce((acc, e) => {
    const t = e.tags.timeOfDay || "night";
    acc[t] = (acc[t] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const topTime = Object.entries(timeGroups).sort((a, b) => b[1] - a[1])[0];
  if (topTime && topTime[1] > validEntries.length * 0.45) {
    patterns.push({
      id: "pat_time_of_day", type: "frequency",
      text: `You write most entries in the ${topTime[0]}. ${topTime[1]} out of ${validEntries.length} total.`,
      supportingEntryIds: validEntries.filter((e) => e.tags.timeOfDay === topTime[0]).map((e) => e.id),
      surfacedAt: now.toISOString(), dismissed: false,
    });
  }

  // Planet day clustering
  const dayGroups = validEntries.reduce((acc, e) => {
    const d = e.tags.planetaryDay || "Sun";
    acc[d] = (acc[d] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const topDay = Object.entries(dayGroups).sort((a, b) => b[1] - a[1])[0];
  if (topDay && topDay[1] >= 4 && topDay[1] > validEntries.length / 7 * 1.5) {
    patterns.push({
      id: `pat_day_${topDay[0].toLowerCase()}`, type: "frequency",
      text: `You write most on ${topDay[0]} days — ${topDay[1]} entries, more than any other day of the week.`,
      supportingEntryIds: validEntries.filter((e) => e.tags.planetaryDay === topDay[0]).map((e) => e.id),
      surfacedAt: now.toISOString(), dismissed: false,
    });
  }

  // Load dismissed patterns
  const dismissed = getDismissedPatterns();
  return patterns.filter((p) => !dismissed.has(p.id)).slice(0, 10);
}

function getDismissedPatterns(): Set<string> {
  try {
    const raw = localStorage.getItem(JOURNAL_DISMISSED_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch { return new Set(); }
}

export function dismissPattern(patternId: string) {
  const dismissed = getDismissedPatterns();
  dismissed.add(patternId);
  localStorage.setItem(JOURNAL_DISMISSED_KEY, JSON.stringify([...dismissed]));
}

// ─── Privacy & Copy ──────────────────────────────────────────────────────────

export const JOURNAL_PRIVACY_COPY = {
  welcome: `This isn't a productivity tool. It's a place where the chart asks the question and you answer.\n\nEvery entry stamps with what's happening in the sky — moon phase, planet day, what's hitting your chart. Over time, patterns surface. Your journaling becomes a record of your life through astrology.\n\nYou can write or speak. Your entries are yours. We don't read them unless you ask us to.`,

  privacyPromise: `Your journal is yours. Mapped doesn't read your entries unless you specifically ask us to. We never train on your content. We never share it. You can delete anything, export everything.`,

  textPatternOptIn: `To surface deeper patterns — like "you mention your mother more during Cancer transits" — Mapped needs to read your entries. We process them privately, never train on them, and you can turn this off at any time. Want to enable deeper patterns?`,

  burnConfirmation: `Your words have left no trace.`,

  firstEntrySaved: `Saved. This entry will live in your journal forever, tagged with what was happening in the sky today. Come back when you have something else to say.`,

  capReached: (remaining: number) =>
    remaining === 0
      ? `You've used all 8 entries this month. Upgrade to mid for unlimited journaling + pattern surfacing.`
      : `${remaining} entries remaining this month.`,
};

// ─── Crisis Detection ────────────────────────────────────────────────────────

const CRISIS_PHRASES = [
  "kill myself", "want to die", "self-harm", "end my life",
  "suicide", "don't want to be here", "better off dead",
  "harm myself", "cut myself",
];

export function detectCrisisContent(text: string): boolean {
  const lower = text.toLowerCase();
  return CRISIS_PHRASES.some((phrase) => lower.includes(phrase));
}

export const CRISIS_RESPONSE = {
  text: `What you wrote sounds heavy. You don't have to be alone with it. The 988 Suicide & Crisis Lifeline is free and confidential — you can call or text 988 anytime.`,
  options: ["Talk to Dolly", "Just rest", "I'm okay"] as const,
};

// ─── Legacy compat ───────────────────────────────────────────────────────────

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
