/**
 * Right Now Engine — Matches user's chart state to triggered phrases.
 *
 * Takes: natal chart data, lord of the year, active transits, current sky events
 * Returns: the best Right Now phrase for today (or null if nothing matches)
 *
 * Selection algorithm:
 * 1. Compute active conditions from chart state
 * 2. Filter phrases whose triggers match any active condition
 * 3. Apply 30-day anti-repetition
 * 4. Score by trigger strength (transit > LoY > sky > natal)
 * 5. Select deterministically per day (stable within a day, changes daily)
 */

import { RIGHT_NOW_PHRASES, type RightNowPhrase, type RightNowTrigger } from "./rightNowTriggers";

/* ─── Types ─── */

export interface ChartState {
  /** User's natal planets: [{ name: "Sun", sign: "Scorpio", house: "7" }] */
  planets: Array<{ name: string; sign: string; house: string | null }>;
  /** User's houses: [{ number: 1, sign: "Taurus" }] */
  houses?: Array<{ number: number; sign: string }>;
  /** User's Lord of the Year planet name (lowercase) */
  lordOfYear: string | null;
  /** Active transit aspects from /api/transits */
  transits: Array<{
    transitPlanet: string;
    transitSign: string;
    transitRetrograde: boolean;
    natalPlanet: string;
    natalSign: string;
    natalHouse: number | null;
    transitHouse: number;
    aspect: string;
    orb: number;
  }>;
  /** Current sky events */
  skyEvents: {
    mercuryRetrograde: boolean;
    venusRetrograde: boolean;
    marsRetrograde: boolean;
    moonPhase: string; // "full" | "new" | etc.
    moonSign: string;
    eclipseSeason: boolean;
  };
}

export interface RightNowResult {
  phrase: RightNowPhrase;
  matchedTrigger: RightNowTrigger;
  strength: number; // higher = more relevant
}

/* ─── Condition matching ─── */

/**
 * Given the user's chart state, compute a set of active condition strings
 * that can be matched against phrase trigger conditions.
 */
function computeActiveConditions(state: ChartState): Set<string> {
  const conditions = new Set<string>();

  // Lord of the Year
  if (state.lordOfYear) {
    conditions.add(`loy:${state.lordOfYear.toLowerCase()}`);
  }

  // Sky events
  if (state.skyEvents.mercuryRetrograde) conditions.add("sky:mercury_retrograde");
  if (state.skyEvents.venusRetrograde) conditions.add("sky:venus_retrograde");
  if (state.skyEvents.marsRetrograde) conditions.add("sky:mars_retrograde");
  if (state.skyEvents.eclipseSeason) conditions.add("sky:eclipse_season");
  if (state.skyEvents.moonPhase === "full") conditions.add(`sky:full_moon`);
  if (state.skyEvents.moonPhase === "new") conditions.add(`sky:new_moon`);

  // Active transits — generate condition keys
  for (const t of state.transits) {
    const tp = t.transitPlanet.toLowerCase();
    const np = t.natalPlanet.toLowerCase();
    const house = t.transitHouse;

    // General: "[planet] aspecting personal planet"
    const personalPlanets = ["sun", "moon", "mercury", "venus", "mars"];
    if (personalPlanets.includes(np)) {
      conditions.add(`transit:${tp}_aspecting_personal_planet`);
    }

    // Specific: "[planet] aspecting [natal planet]"
    conditions.add(`transit:${tp}_aspecting_${np}`);

    // House-based: "[planet] in [house] house"
    if (house) {
      conditions.add(`transit:${tp}_in_${house}`);
      // Common grouped checks
      if (house === 7) conditions.add(`transit:${tp}_in_7th`);
      if (house === 1) conditions.add(`transit:${tp}_in_1st`);
      if (house === 10) conditions.add(`transit:${tp}_in_10th`);
      if (house === 4) conditions.add(`transit:${tp}_in_4th`);
    }

    // Retrograde transits
    if (t.transitRetrograde) {
      conditions.add(`transit:${tp}_retrograde`);
    }
  }

  // Natal chart conditions
  const planets = state.planets;

  // Check for stelliums (3+ planets in one sign or house)
  const signCounts: Record<string, number> = {};
  const houseCounts: Record<string, number> = {};
  for (const p of planets) {
    const s = p.sign?.toLowerCase();
    if (s) signCounts[s] = (signCounts[s] || 0) + 1;
    if (p.house) houseCounts[p.house] = (houseCounts[p.house] || 0) + 1;
  }

  for (const [sign, count] of Object.entries(signCounts)) {
    if (count >= 3) conditions.add(`natal:${sign}_stellium`);
  }

  // Check planetary prominence (planet in domicile or angular house)
  for (const p of planets) {
    const name = p.name?.toLowerCase();
    const house = p.house ? parseInt(p.house) : null;
    const sign = p.sign?.toLowerCase();

    // Strong Saturn check
    if (name === "saturn" && (sign === "capricorn" || sign === "aquarius" || house === 10 || house === 1)) {
      conditions.add("natal:strong_saturn");
    }
    // Saturn in 6th
    if (name === "saturn" && house === 6) conditions.add("natal:saturn_in_6th");

    // Strong Pluto
    if (name === "pluto" && (house === 1 || house === 10 || house === 8)) {
      conditions.add("natal:pluto_prominent");
    }

    // Venus in 7th
    if (name === "venus" && house === 7) conditions.add("natal:venus_7th_house");

    // Mars in cardinal sign
    if (name === "mars" && ["aries", "cancer", "libra", "capricorn"].includes(sign || "")) {
      conditions.add("natal:mars_cardinal");
    }

    // Cancer emphasis
    if (sign === "cancer") conditions.add("natal:cancer_emphasis");
    // Leo emphasis
    if (sign === "leo") conditions.add("natal:leo_emphasis");

    // General planet-in-house
    if (name && house) conditions.add(`natal:${name}_in_${house}`);
  }

  return conditions;
}

/**
 * Map a trigger condition string to our computed condition format.
 */
function matchesTrigger(trigger: RightNowTrigger, conditions: Set<string>): boolean {
  const c = trigger.condition.toLowerCase();

  switch (trigger.type) {
    case "lord_of_year":
      return conditions.has(`loy:${c}`);

    case "sky":
      return conditions.has(`sky:${c}`);

    case "transit":
      // Transit conditions can match multiple formats
      return conditions.has(`transit:${c}`);

    case "natal":
      return conditions.has(`natal:${c}`);

    default:
      return false;
  }
}

/* ─── Trigger strength scoring ─── */

const STRENGTH_SCORES: Record<string, number> = {
  transit: 4,     // Most time-sensitive, highest priority
  lord_of_year: 3,
  sky: 2,
  natal: 1,       // Always true, lowest priority
};

/* ─── Anti-repetition ─── */

const HISTORY_KEY = "mapped:right_now_history";

interface HistoryEntry {
  phraseId: string;
  triggerCondition: string;
  date: string; // YYYY-MM-DD
}

function getHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveHistory(history: HistoryEntry[]): void {
  try {
    // Keep 90 days max
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 90);
    const cutoffStr = cutoff.toISOString().slice(0, 10);
    const filtered = history.filter(h => h.date >= cutoffStr);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
  } catch { /* ignore */ }
}

export function recordShown(phraseId: string, triggerCondition: string, date: string): void {
  const history = getHistory();
  history.push({ phraseId, triggerCondition, date });
  saveHistory(history);
}

function isRecentlyShown(phraseId: string, _triggerCondition: string): boolean {
  const history = getHistory();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const cutoffStr = thirtyDaysAgo.toISOString().slice(0, 10);

  // Phrase shown in last 30 days at all = excluded
  return history.some(h => h.phraseId === phraseId && h.date >= cutoffStr);
}

/* ─── Refresh tracking ─── */

const REFRESH_KEY = "mapped:right_now_refresh";

interface RefreshState {
  date: string;
  count: number;
  shownIds: string[]; // phrase IDs shown today (for cycling)
}

function getRefreshState(today: string): RefreshState {
  try {
    const raw = localStorage.getItem(REFRESH_KEY);
    if (raw) {
      const state = JSON.parse(raw) as RefreshState;
      if (state.date === today) return state;
    }
  } catch { /* ignore */ }
  return { date: today, count: 0, shownIds: [] };
}

function saveRefreshState(state: RefreshState): void {
  try { localStorage.setItem(REFRESH_KEY, JSON.stringify(state)); } catch { /* ignore */ }
}

/* ─── Main selection function ─── */

/**
 * Select the Right Now phrase for today given the user's chart state.
 * Returns null if no phrases match.
 */
export function selectRightNow(
  state: ChartState,
  today: string, // "YYYY-MM-DD"
): RightNowResult | null {
  const conditions = computeActiveConditions(state);
  const refreshState = getRefreshState(today);

  // Find all eligible phrases with their best matching trigger
  const eligible: RightNowResult[] = [];

  for (const phrase of RIGHT_NOW_PHRASES) {
    // Skip if shown in last 30 days
    if (isRecentlyShown(phrase.id, "")) continue;

    // Skip if already cycled through today
    if (refreshState.shownIds.includes(phrase.id)) continue;

    // Find the highest-strength matching trigger
    let bestTrigger: RightNowTrigger | null = null;
    let bestStrength = 0;

    for (const trigger of phrase.triggers) {
      if (matchesTrigger(trigger, conditions)) {
        const strength = STRENGTH_SCORES[trigger.type] || 0;
        if (strength > bestStrength) {
          bestStrength = strength;
          bestTrigger = trigger;
        }
      }
    }

    if (bestTrigger) {
      eligible.push({ phrase, matchedTrigger: bestTrigger, strength: bestStrength });
    }
  }

  if (eligible.length === 0) return null;

  // Sort by strength (highest first), then deterministic by date + id
  eligible.sort((a, b) => {
    if (b.strength !== a.strength) return b.strength - a.strength;
    // Deterministic tiebreak using phrase ID hash
    const hashA = simpleHash(today + a.phrase.id);
    const hashB = simpleHash(today + b.phrase.id);
    return hashA - hashB;
  });

  // Take the top result
  return eligible[0];
}

/**
 * Get the next Right Now phrase (for refresh). Returns null if max refreshes hit (3/day).
 */
export function refreshRightNow(
  state: ChartState,
  today: string,
): { result: RightNowResult | null; refreshesLeft: number } {
  const refreshState = getRefreshState(today);

  if (refreshState.count >= 3) {
    return { result: null, refreshesLeft: 0 };
  }

  const result = selectRightNow(state, today);

  if (result) {
    refreshState.count += 1;
    refreshState.shownIds.push(result.phrase.id);
    saveRefreshState(refreshState);
  }

  return { result, refreshesLeft: Math.max(0, 3 - refreshState.count) };
}

/**
 * Record that a Right Now card was shown today (call on initial render).
 */
export function markRightNowShown(phraseId: string, triggerCondition: string, today: string): void {
  const refreshState = getRefreshState(today);
  if (!refreshState.shownIds.includes(phraseId)) {
    refreshState.shownIds.push(phraseId);
    saveRefreshState(refreshState);
  }
  recordShown(phraseId, triggerCondition, today);
}

/* ─── Helpers ─── */

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return hash;
}

/**
 * Get current sky events from existing celestial data.
 * This adapts data already available on the home page.
 */
export function buildSkyEvents(celestial: {
  moonPhase?: { phase: string };
  moonSign?: string;
  retrogrades?: Array<{ planet: string; isRetrograde: boolean }>;
}): ChartState["skyEvents"] {
  const retrogrades = celestial.retrogrades || [];
  const mercRet = retrogrades.some(r => r.planet.toLowerCase() === "mercury" && r.isRetrograde);
  const venusRet = retrogrades.some(r => r.planet.toLowerCase() === "venus" && r.isRetrograde);
  const marsRet = retrogrades.some(r => r.planet.toLowerCase() === "mars" && r.isRetrograde);

  return {
    mercuryRetrograde: mercRet,
    venusRetrograde: venusRet,
    marsRetrograde: marsRet,
    moonPhase: celestial.moonPhase?.phase || "waxing-crescent",
    moonSign: celestial.moonSign || "",
    eclipseSeason: false, // would need eclipse calendar data
  };
}
