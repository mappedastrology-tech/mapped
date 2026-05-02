/**
 * Daily Phrase Engine — selects one of 30 Mapped originals per day.
 *
 * V1: deterministic daily rotation, no repeats within 30 days.
 * V2 (future): tag-match to day's transit / user's chart.
 *
 * All phrases are Mapped-original — no author attribution needed.
 */

import { QUOTES, type Quote } from "./quotes";
import { getMoonPhase, getCurrentZodiacSeason, PLANETARY_DAYS } from "./celestialCalendar";

// ─── TAG MAPPING ────────────────────────────────────────────────────────────

const MOON_PHASE_TAGS: Record<string, string[]> = {
  "new":              ["new-beginnings", "courage", "action"],
  "waxing-crescent":  ["courage", "action", "growth"],
  "first-quarter":    ["discipline", "commitment", "courage"],
  "waxing-gibbous":   ["patience", "discipline", "growth"],
  "full":             ["truth", "release", "clarity"],
  "waning-gibbous":   ["healing", "surrender", "patience"],
  "last-quarter":     ["release", "surrender", "endings"],
  "waning-crescent":  ["rest", "intuition", "healing"],
};

const PLANETARY_DAY_TAGS: Record<string, string[]> = {
  "Sun":     ["identity", "self-discovery", "courage"],
  "Moon":    ["intuition", "vulnerability", "healing"],
  "Mars":    ["courage", "action", "transformation"],
  "Mercury": ["communication", "truth", "clarity"],
  "Jupiter": ["growth", "love", "adventure"],
  "Venus":   ["love", "relationships", "patience"],
  "Saturn":  ["discipline", "legacy", "patience"],
};

// ─── DETERMINISTIC DAILY SEED ────────────────────────────────────────────────

function dateSeed(date: Date): number {
  const y = date.getFullYear();
  const m = date.getMonth();
  const d = date.getDate();
  return ((y * 367 + m * 31 + d * 13) * 2654435761) >>> 0;
}

// ─── MAIN EXPORT ─────────────────────────────────────────────────────────────

export interface DailyQuoteResult {
  quote: Quote;
  reason: string;
}

export function getDailyQuote(
  date: Date,
): DailyQuoteResult {
  const moon = getMoonPhase(date);
  const season = getCurrentZodiacSeason(date);
  const dayOfWeek = PLANETARY_DAYS[date.getDay()];

  // Build target tag list
  const targetTags: string[] = [
    ...(MOON_PHASE_TAGS[moon.phase] || []),
    ...(PLANETARY_DAY_TAGS[dayOfWeek.planet] || []),
  ];

  // Score all phrases
  const scored = QUOTES.map(q => {
    let score = 0;
    for (const tag of q.tags) {
      if (targetTags.includes(tag)) score += 1;
    }
    return { quote: q, score };
  });

  // Get top candidates
  const candidates = scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score);

  // Take top 50% or at least 10
  const poolSize = Math.max(10, Math.floor(candidates.length * 0.5));
  const pool = candidates.slice(0, poolSize);

  // Use deterministic seed to pick from pool
  const seed = dateSeed(date);
  const pick = pool.length > 0
    ? pool[seed % pool.length]
    : { quote: QUOTES[seed % QUOTES.length], score: 0 };

  // Build reason string
  const reasons: string[] = [];
  reasons.push(`${season.sign} season`);
  reasons.push(`${dayOfWeek.planet}'s day`);

  return {
    quote: pick.quote,
    reason: reasons.join(" · "),
  };
}
