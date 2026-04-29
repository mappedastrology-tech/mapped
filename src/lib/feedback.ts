/**
 * Feedback System — post-ritual completion check-in, data model, and reporting.
 *
 * Sources:
 * - Mapped_Feedback_System.md — completion flow, data layer, report-back system
 * - Mapped_Cycles_Tracking.md — anti-streak cycle tracking
 *
 * Three parts:
 * 1. Completion check-in (mood word, fit rating, optional journal)
 * 2. Data layer (CompletionRecord, storage utils)
 * 3. Report generation (weekly, monthly, quarterly)
 */

// ═══════════════════════════════════════════════════════════════════════════
// MOOD WORD PALETTE — 20 words organized by emotional category
// ═══════════════════════════════════════════════════════════════════════════

export type MoodCategory =
  | "heavy"
  | "hard"
  | "neutral"
  | "soft_positive"
  | "bright_positive";

export interface MoodWord {
  word: string;
  category: MoodCategory;
  color: string; // Tailwind background class at 20% opacity
}

export const MOOD_PALETTE: MoodWord[] = [
  // Heavy emotions (warm reds/oranges)
  { word: "Heavy", category: "heavy", color: "bg-red-400/20" },
  { word: "Tender", category: "heavy", color: "bg-red-400/20" },
  { word: "Raw", category: "heavy", color: "bg-red-400/20" },
  { word: "Tired", category: "heavy", color: "bg-orange-400/20" },
  // Hard emotions (cool blues)
  { word: "Anxious", category: "hard", color: "bg-blue-400/20" },
  { word: "Foggy", category: "hard", color: "bg-blue-400/20" },
  { word: "Sad", category: "hard", color: "bg-blue-400/20" },
  { word: "Stuck", category: "hard", color: "bg-blue-400/20" },
  // Neutral (grays)
  { word: "Quiet", category: "neutral", color: "bg-gray-400/20" },
  { word: "Steady", category: "neutral", color: "bg-gray-400/20" },
  { word: "Okay", category: "neutral", color: "bg-gray-400/20" },
  { word: "Curious", category: "neutral", color: "bg-gray-400/20" },
  // Soft positive (soft pinks/lavenders)
  { word: "Soft", category: "soft_positive", color: "bg-pink-300/20" },
  { word: "Settled", category: "soft_positive", color: "bg-pink-300/20" },
  { word: "Held", category: "soft_positive", color: "bg-pink-300/20" },
  { word: "Open", category: "soft_positive", color: "bg-pink-300/20" },
  // Bright positive (golds/sunny)
  { word: "Clear", category: "bright_positive", color: "bg-amber-300/20" },
  { word: "Light", category: "bright_positive", color: "bg-amber-300/20" },
  { word: "Strong", category: "bright_positive", color: "bg-amber-300/20" },
  { word: "Spacious", category: "bright_positive", color: "bg-amber-300/20" },
];

// ═══════════════════════════════════════════════════════════════════════════
// FIT RATING
// ═══════════════════════════════════════════════════════════════════════════

export type FitRating = "not_really" | "some" | "yes";

export const FIT_RATING_OPTIONS: { value: FitRating; emoji: string; label: string }[] = [
  { value: "not_really", emoji: "😶", label: "Not really" },
  { value: "some", emoji: "🤍", label: "Some" },
  { value: "yes", emoji: "✨", label: "Yes" },
];

// ═══════════════════════════════════════════════════════════════════════════
// COMPLETION RECORD — what gets stored per completed ritual
// ═══════════════════════════════════════════════════════════════════════════

export interface CompletionRecord {
  id: string; // unique ID for this record
  ritualId: string;
  ritualTitle: string;
  completedAt: string; // ISO timestamp
  moodWord: string;
  moodCategory: MoodCategory;
  fitRating: FitRating;
  journalEntry?: string;
  // Auto-captured context
  moonPhase: string;
  zodiacSeason: string;
  dayOfWeek: string;
  timeOfDay: "morning" | "afternoon" | "evening" | "night";
  // Algorithm learning
  wasRecommendation: boolean;
  wasOverride: boolean;
  wasUserSearched: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// STORAGE — localStorage-based (encrypt at rest in production)
// ═══════════════════════════════════════════════════════════════════════════

const STORAGE_KEY = "mapped:completions";

function getTimeOfDay(): CompletionRecord["timeOfDay"] {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  if (h < 21) return "evening";
  return "night";
}

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function saveCompletion(record: Omit<CompletionRecord, "id" | "completedAt" | "dayOfWeek" | "timeOfDay">): CompletionRecord {
  const full: CompletionRecord = {
    ...record,
    id: `cr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    completedAt: new Date().toISOString(),
    dayOfWeek: DAY_NAMES[new Date().getDay()],
    timeOfDay: getTimeOfDay(),
  };
  const existing = getAllCompletions();
  existing.push(full);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  } catch {}
  // Fire-and-forget Supabase backup
  import("./completionSync").then((m) => m.pushCompletionToSupabase(full)).catch(() => {});
  return full;
}

export function getAllCompletions(): CompletionRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function deleteCompletion(id: string): void {
  const records = getAllCompletions().filter((r) => r.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {}
}

export function getCompletionsSince(daysAgo: number): CompletionRecord[] {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - daysAgo);
  return getAllCompletions().filter((r) => new Date(r.completedAt) >= cutoff);
}

// ═══════════════════════════════════════════════════════════════════════════
// REPORT GENERATION
// ═══════════════════════════════════════════════════════════════════════════

export interface WeeklyReport {
  dateRange: string;
  totalRituals: number;
  mostFeltWord: string;
  bestFitRitual: string | null;
  mostRepeatedWord: string;
  moodMovement: { before: MoodCategory[]; after: MoodCategory[] };
}

export interface MonthlyReport {
  month: string;
  totalRituals: number;
  totalMinutes: number;
  moodWordCloud: { word: string; count: number }[];
  topRituals: { title: string; count: number; avgRating: number }[];
  mostUsedCategory: string;
  observation: string;
}

export interface PractitionerType {
  label: string;
  description: string;
}

const PRACTITIONER_TYPES: Record<string, PractitionerType> = {
  quiet: { label: "The Quiet Practitioner", description: "Short rituals, mostly morning, mostly Tier 0" },
  lunar: { label: "The Lunar Devotee", description: "High engagement on full and new moons" },
  crisis: { label: "The Crisis Worker", description: "Opens the app during hard moments" },
  routine: { label: "The Routine Builder", description: "Same time, same kind, building consistency" },
  seeker: { label: "The Seeker", description: "High variety, exploring everything" },
  shadow: { label: "The Shadow Worker", description: "Gravitates to release and deep-emotion rituals" },
};

export function generateWeeklyReport(): WeeklyReport | null {
  const records = getCompletionsSince(7);
  if (records.length < 3) return null; // Only generate if 3+ rituals

  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);

  // Most felt word
  const wordCounts: Record<string, number> = {};
  records.forEach((r) => {
    wordCounts[r.moodWord] = (wordCounts[r.moodWord] || 0) + 1;
  });
  const sortedWords = Object.entries(wordCounts).sort(([, a], [, b]) => b - a);

  // Best fit ritual
  const yesRituals = records.filter((r) => r.fitRating === "yes");
  const bestFit = yesRituals.length > 0 ? yesRituals[0].ritualTitle : null;

  return {
    dateRange: `${weekAgo.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${now.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
    totalRituals: records.length,
    mostFeltWord: sortedWords[0]?.[0] || "Quiet",
    bestFitRitual: bestFit,
    mostRepeatedWord: sortedWords[0]?.[0] || "Okay",
    moodMovement: {
      before: records.slice(0, Math.ceil(records.length / 2)).map((r) => r.moodCategory),
      after: records.slice(Math.ceil(records.length / 2)).map((r) => r.moodCategory),
    },
  };
}

export function generateMonthlyReport(): MonthlyReport | null {
  const records = getCompletionsSince(30);
  if (records.length < 5) return null;

  const wordCounts: Record<string, number> = {};
  const ritualCounts: Record<string, { count: number; ratings: number[] }> = {};
  const categoryCounts: Record<string, number> = {};

  records.forEach((r) => {
    wordCounts[r.moodWord] = (wordCounts[r.moodWord] || 0) + 1;
    if (!ritualCounts[r.ritualTitle]) ritualCounts[r.ritualTitle] = { count: 0, ratings: [] };
    ritualCounts[r.ritualTitle].count++;
    ritualCounts[r.ritualTitle].ratings.push(r.fitRating === "yes" ? 3 : r.fitRating === "some" ? 2 : 1);
    categoryCounts[r.zodiacSeason] = (categoryCounts[r.zodiacSeason] || 0) + 1;
  });

  const wordCloud = Object.entries(wordCounts)
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const topRituals = Object.entries(ritualCounts)
    .map(([title, { count, ratings }]) => ({
      title,
      count,
      avgRating: ratings.reduce((a, b) => a + b, 0) / ratings.length,
    }))
    .sort((a, b) => b.avgRating - a.avgRating || b.count - a.count)
    .slice(0, 3);

  const sortedCategories = Object.entries(categoryCounts).sort(([, a], [, b]) => b - a);

  // Generate observation based on patterns
  const eveningCount = records.filter((r) => r.timeOfDay === "evening" || r.timeOfDay === "night").length;
  const morningCount = records.filter((r) => r.timeOfDay === "morning").length;
  let observation = "";
  if (eveningCount > morningCount * 1.5) {
    observation = "You tend to rate evening rituals higher than morning ones.";
  } else if (morningCount > eveningCount * 1.5) {
    observation = "Morning rituals seem to land deepest for you.";
  } else {
    const topWord = wordCloud[0]?.word;
    observation = topWord
      ? `"${topWord}" has been your most frequent feeling this month.`
      : "Your practice is building steadily.";
  }

  return {
    month: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
    totalRituals: records.length,
    totalMinutes: 0, // Would calculate from ritual durations
    moodWordCloud: wordCloud,
    topRituals,
    mostUsedCategory: sortedCategories[0]?.[0] || "unknown",
    observation,
  };
}

export function detectPractitionerType(records: CompletionRecord[]): PractitionerType {
  if (records.length < 10) return PRACTITIONER_TYPES.seeker;

  const morningPct = records.filter((r) => r.timeOfDay === "morning").length / records.length;
  const releasePct = records.filter((r) =>
    r.moodCategory === "heavy" || r.moodCategory === "hard"
  ).length / records.length;

  // Unique rituals vs total
  const uniqueRituals = new Set(records.map((r) => r.ritualId)).size;
  const variety = uniqueRituals / records.length;

  if (releasePct > 0.5) return PRACTITIONER_TYPES.shadow;
  if (variety > 0.7) return PRACTITIONER_TYPES.seeker;
  if (variety < 0.3) return PRACTITIONER_TYPES.routine;
  if (morningPct > 0.6) return PRACTITIONER_TYPES.quiet;
  return PRACTITIONER_TYPES.lunar;
}

// ═══════════════════════════════════════════════════════════════════════════
// CYCLE TRACKING — The Anti-Streak System
// ═══════════════════════════════════════════════════════════════════════════

export interface LunarCycle {
  startDate: string;
  endDate: string;
  completionCount: number;
  engaged: boolean;
}

export interface SeasonalCycle {
  season: "Spring" | "Summer" | "Autumn" | "Winter";
  year: number;
  icon: string;
  engaged: boolean;
  rested: boolean; // User intentionally rested this cycle
  current: boolean;
}

export interface ZodiacSeasonEntry {
  sign: string;
  glyph: string;
  engaged: boolean;
}

export interface PersonalYear {
  fromDate: string; // Solar return (birthday)
  toDate: string;
  monthsEngaged: boolean[]; // 12 booleans
}

export interface TransitWitness {
  label: string;
  icon: string;
  count: number;
  inProgress?: string;
}

// ─── Rest cycle storage ──────────────────────────────────────────────────

const REST_KEY = "mapped:rest-cycles";

export function markCycleAsRest(season: string, year: number): void {
  const rests = getRestCycles();
  rests[`${season}-${year}`] = true;
  try { localStorage.setItem(REST_KEY, JSON.stringify(rests)); } catch {}
}

export function getRestCycles(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(REST_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

// ─── Cycle calculations (retrospective from completion records) ───────────

const ZODIAC_SIGNS = [
  { sign: "Aries", glyph: "♈", start: [3, 20] },
  { sign: "Taurus", glyph: "♉", start: [4, 19] },
  { sign: "Gemini", glyph: "♊", start: [5, 20] },
  { sign: "Cancer", glyph: "♋", start: [6, 20] },
  { sign: "Leo", glyph: "♌", start: [7, 22] },
  { sign: "Virgo", glyph: "♍", start: [8, 22] },
  { sign: "Libra", glyph: "♎", start: [9, 22] },
  { sign: "Scorpio", glyph: "♏", start: [10, 22] },
  { sign: "Sagittarius", glyph: "♐", start: [11, 21] },
  { sign: "Capricorn", glyph: "♑", start: [12, 21] },
  { sign: "Aquarius", glyph: "♒", start: [1, 19] },
  { sign: "Pisces", glyph: "♓", start: [2, 18] },
] as const;

function getZodiacSeason(date: Date): string {
  const m = date.getMonth() + 1;
  const d = date.getDate();
  for (let i = ZODIAC_SIGNS.length - 1; i >= 0; i--) {
    const [sm, sd] = ZODIAC_SIGNS[i].start;
    if (m > sm || (m === sm && d >= sd)) return ZODIAC_SIGNS[i].sign;
  }
  return "Capricorn"; // Dec 21 – Jan 18 wraps
}

function getSolarSeason(date: Date): "Spring" | "Summer" | "Autumn" | "Winter" {
  const m = date.getMonth() + 1;
  const d = date.getDate();
  if ((m === 3 && d >= 20) || m === 4 || m === 5 || (m === 6 && d < 21)) return "Spring";
  if ((m === 6 && d >= 21) || m === 7 || m === 8 || (m === 9 && d < 23)) return "Summer";
  if ((m === 9 && d >= 23) || m === 10 || m === 11 || (m === 12 && d < 21)) return "Autumn";
  return "Winter";
}

export function calculateSeasonalCycles(): SeasonalCycle[] {
  const completions = getAllCompletions();
  const rests = getRestCycles();
  const now = new Date();
  const currentSeason = getSolarSeason(now);
  const currentYear = now.getFullYear();

  const seasons: ("Spring" | "Summer" | "Autumn" | "Winter")[] = ["Spring", "Summer", "Autumn", "Winter"];
  const icons: Record<string, string> = { Spring: "🌷", Summer: "☀️", Autumn: "🍂", Winter: "❄️" };

  return seasons.map((season) => {
    const engaged = completions.some((c) => {
      const d = new Date(c.completedAt);
      return getSolarSeason(d) === season && d.getFullYear() === currentYear;
    });
    const restKey = `${season}-${currentYear}`;
    return {
      season,
      year: currentYear,
      icon: icons[season],
      engaged,
      rested: !!rests[restKey],
      current: season === currentSeason,
    };
  });
}

export function calculateZodiacSeasons(): ZodiacSeasonEntry[] {
  const completions = getAllCompletions();
  return ZODIAC_SIGNS.map(({ sign, glyph }) => ({
    sign,
    glyph,
    engaged: completions.some((c) => {
      const d = new Date(c.completedAt);
      return getZodiacSeason(d) === sign;
    }),
  }));
}

export function calculatePersonalYear(birthday: string): PersonalYear | null {
  if (!birthday) return null;
  const bday = new Date(birthday);
  const now = new Date();
  const thisYearBday = new Date(now.getFullYear(), bday.getMonth(), bday.getDate());
  const from = thisYearBday <= now ? thisYearBday : new Date(now.getFullYear() - 1, bday.getMonth(), bday.getDate());
  const to = new Date(from);
  to.setFullYear(to.getFullYear() + 1);

  const completions = getAllCompletions();
  const monthsEngaged: boolean[] = Array(12).fill(false);

  completions.forEach((c) => {
    const d = new Date(c.completedAt);
    if (d >= from && d < to) {
      const monthDiff = (d.getFullYear() - from.getFullYear()) * 12 + d.getMonth() - from.getMonth();
      if (monthDiff >= 0 && monthDiff < 12) monthsEngaged[monthDiff] = true;
    }
  });

  return {
    fromDate: from.toISOString().slice(0, 10),
    toDate: to.toISOString().slice(0, 10),
    monthsEngaged,
  };
}

export function calculateTransitsWitnessed(): TransitWitness[] {
  const completions = getAllCompletions();
  const fullMoons = completions.filter((c) => c.moonPhase === "full").length;
  const newMoons = completions.filter((c) => c.moonPhase === "new").length;

  return [
    { label: "Full moons", icon: "🌕", count: Math.min(fullMoons, 99) },
    { label: "New moons", icon: "🌑", count: Math.min(newMoons, 99) },
    { label: "Total rituals", icon: "✨", count: completions.length },
  ];
}

// ═══════════════════════════════════════════════════════════════════════════
// SKEPTIC MODE — Belief stance framing
// ═══════════════════════════════════════════════════════════════════════════

export type BeliefStance = "believer" | "skeptic" | "honest";

export const BELIEF_STANCES: { value: BeliefStance; label: string; description: string }[] = [
  { value: "believer", label: "Open believer", description: "The universe delivers. Energy is real. Crystals amplify." },
  { value: "skeptic", label: "Curious skeptic", description: "\"Many people find that...\" with a side of neuroscience." },
  { value: "honest", label: "I know this might be bullshit", description: "Frank about the metaphysics. The practice still works." },
];

const SKEPTIC_KEY = "mapped:belief-stance";

export function getBeliefStance(): BeliefStance {
  if (typeof window === "undefined") return "believer";
  try {
    return (localStorage.getItem(SKEPTIC_KEY) as BeliefStance) || "believer";
  } catch { return "believer"; }
}

export function setBeliefStance(stance: BeliefStance): void {
  try { localStorage.setItem(SKEPTIC_KEY, stance); } catch {}
}

/**
 * Translation table for dynamic content framing.
 * Write balanced/skeptic version first, then swap at render time.
 */
export const FRAMING_SWAPS: Record<string, Record<BeliefStance, string>> = {
  energy: { believer: "energy", skeptic: "attention", honest: "attention" },
  "the universe": { believer: "the universe", skeptic: "your subconscious", honest: "your subconscious" },
  "sacred practice": { believer: "sacred practice", skeptic: "intentional practice", honest: "practice" },
  "this works because": { believer: "this works because", skeptic: "many people find that", honest: "the mechanism here is" },
  vibration: { believer: "vibration", skeptic: "focus", honest: "focus" },
  "the cosmos": { believer: "the cosmos", skeptic: "the patterns above", honest: "the calendar event" },
};

export function frameContent(text: string, stance: BeliefStance): string {
  if (stance === "believer") return text; // Default content is already believer-framed
  let result = text;
  for (const [original, replacements] of Object.entries(FRAMING_SWAPS)) {
    result = result.replace(new RegExp(original, "gi"), replacements[stance]);
  }
  return result;
}

// ═══════════════════════════════════════════════════════════════════════════
// REFRESH MODE — User-controlled ritual override
// ═══════════════════════════════════════════════════════════════════════════

export type RefreshTime = "2min" | "5min" | "10min" | "20min" | "30min";
export type RefreshLocation = "home" | "work" | "public" | "bed" | "outside" | "transit";
export type RefreshVibe =
  | "calm_down"
  | "wake_up"
  | "cry_it_out"
  | "find_clarity"
  | "feel_less_alone"
  | "get_out_of_head"
  | "process_something"
  | "let_go"
  | "ask_for_something"
  | "just_be_still";

export const REFRESH_TIMES: { value: RefreshTime; label: string; maxMinutes: number }[] = [
  { value: "2min", label: "2 min", maxMinutes: 3 },
  { value: "5min", label: "5 min", maxMinutes: 7 },
  { value: "10min", label: "10 min", maxMinutes: 12 },
  { value: "20min", label: "20 min", maxMinutes: 25 },
  { value: "30min", label: "30+ min", maxMinutes: 999 },
];

export const REFRESH_LOCATIONS: { value: RefreshLocation; label: string }[] = [
  { value: "home", label: "At home" },
  { value: "work", label: "At work / desk" },
  { value: "public", label: "In public" },
  { value: "bed", label: "In bed" },
  { value: "outside", label: "Outside" },
  { value: "transit", label: "In transit" },
];

export const REFRESH_VIBES: { value: RefreshVibe; label: string; categories: string[] }[] = [
  { value: "calm_down", label: "Calm down", categories: ["health", "peace"] },
  { value: "wake_up", label: "Wake up", categories: ["health", "career"] },
  { value: "cry_it_out", label: "Cry it out", categories: ["release", "love"] },
  { value: "find_clarity", label: "Find clarity", categories: ["clarity"] },
  { value: "feel_less_alone", label: "Feel less alone", categories: ["love"] },
  { value: "get_out_of_head", label: "Get out of my head", categories: ["health", "peace"] },
  { value: "process_something", label: "Process something", categories: ["growth", "clarity"] },
  { value: "let_go", label: "Let go", categories: ["release"] },
  { value: "ask_for_something", label: "Ask for something", categories: ["manifestation", "wealth"] },
  { value: "just_be_still", label: "Just be still", categories: ["peace", "foundation"] },
];

/**
 * Location compatibility — which locations each ritual tier/type can work in.
 * Tier 0 rituals (no tools) work almost everywhere.
 * Rituals requiring tools are limited to home.
 */
export function isLocationCompatible(
  toolsNeeded: string[],
  tier: number,
  location: RefreshLocation
): boolean {
  // All-location rituals: Tier 0 with no tools or just paper/pen
  const noToolsRequired = !toolsNeeded.length ||
    toolsNeeded.every((t) => /paper|pen|notebook/i.test(t));

  if (location === "home") return true; // Everything works at home
  if (location === "bed") return tier <= 0 && noToolsRequired;
  if (location === "transit") return tier === 0 && noToolsRequired && !toolsNeeded.some((t) => /water|shower/i.test(t));
  if (location === "work" || location === "public") return tier === 0 && noToolsRequired;
  if (location === "outside") return tier <= 1 && !toolsNeeded.some((t) => /candle|bath|mirror|shower/i.test(t));
  return false;
}

/**
 * Parse a duration string like "10 min" or "1+ hr" into minutes.
 */
export function parseDuration(duration: string): number {
  if (duration.includes("hr")) return 60;
  if (duration.includes("sec")) return 1;
  const num = parseInt(duration);
  return isNaN(num) ? 10 : num;
}
