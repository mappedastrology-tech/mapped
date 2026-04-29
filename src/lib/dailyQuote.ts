/**
 * Daily Quote Engine — matches a quote to the user's current celestial energy.
 *
 * Uses a deterministic seed (date) so the same quote shows all day,
 * but changes at midnight. Factors in:
 * - Current moon phase energy
 * - Zodiac season themes
 * - Planetary day ruler
 * - Optional: user's sun/moon/rising sign
 */

import { QUOTES, type Quote } from "./quotes";
import { getMoonPhase, getCurrentZodiacSeason, PLANETARY_DAYS } from "./celestialCalendar";

// ─── TRANSIT → TAG MAPPING ───────────────────────────────────────────────────
// Maps astrological conditions to quote tags for matching

const MOON_PHASE_TAGS: Record<string, string[]> = {
  "new":              ["new-beginnings", "intention", "hope", "possibility", "beginning", "birth", "creation"],
  "waxing-crescent":  ["courage", "action", "momentum", "growth", "initiative", "ambition"],
  "first-quarter":    ["discipline", "commitment", "challenge", "decision", "courage", "determination"],
  "waxing-gibbous":   ["patience", "refinement", "adjustment", "preparation", "perseverance"],
  "full":             ["truth", "revelation", "release", "gratitude", "illumination", "celebration", "completion"],
  "waning-gibbous":   ["wisdom", "sharing", "generosity", "teaching", "gratitude", "legacy"],
  "last-quarter":     ["release", "forgiveness", "endings", "letting-go", "surrender", "clarity"],
  "waning-crescent":  ["rest", "reflection", "solitude", "dreams", "intuition", "healing", "surrender"],
};

const ZODIAC_SEASON_TAGS: Record<string, string[]> = {
  "Aries":       ["courage", "action", "leadership", "boldness", "fire", "initiative", "adventure"],
  "Taurus":      ["abundance", "patience", "beauty", "grounding", "stability", "comfort", "nature"],
  "Gemini":      ["communication", "curiosity", "connection", "learning", "wit", "duality"],
  "Cancer":      ["home", "nurturing", "emotion", "family", "protection", "vulnerability", "care"],
  "Leo":         ["creativity", "joy", "expression", "confidence", "play", "passion", "pride"],
  "Virgo":       ["discipline", "service", "refinement", "health", "craft", "improvement"],
  "Libra":       ["balance", "relationships", "beauty", "harmony", "justice", "partnership"],
  "Scorpio":     ["transformation", "depth", "power", "truth", "mystery", "rebirth", "intensity"],
  "Sagittarius": ["freedom", "adventure", "truth", "expansion", "wisdom", "exploration"],
  "Capricorn":   ["ambition", "discipline", "legacy", "structure", "duty", "perseverance", "mastery"],
  "Aquarius":    ["rebellion", "innovation", "freedom", "community", "vision", "uniqueness"],
  "Pisces":      ["intuition", "dreams", "compassion", "surrender", "healing", "imagination", "spirituality"],
};

const PLANETARY_DAY_TAGS: Record<string, string[]> = {
  "Sun":     ["identity", "self-discovery", "confidence", "vitality", "purpose", "joy", "creation"],
  "Moon":    ["emotion", "intuition", "reflection", "vulnerability", "nurturing", "inner-world"],
  "Mars":    ["courage", "action", "strength", "conflict", "passion", "drive", "competition"],
  "Mercury": ["communication", "learning", "wit", "intelligence", "truth", "clarity", "connection"],
  "Jupiter": ["abundance", "growth", "expansion", "generosity", "wisdom", "opportunity", "optimism"],
  "Venus":   ["love", "beauty", "relationships", "pleasure", "art", "harmony", "self-worth"],
  "Saturn":  ["discipline", "legacy", "responsibility", "patience", "endurance", "structure", "time"],
};

const SIGN_TAGS: Record<string, string[]> = {
  "Aries": ["courage", "action", "fire"], "Taurus": ["patience", "abundance", "stability"],
  "Gemini": ["communication", "curiosity", "wit"], "Cancer": ["home", "emotion", "vulnerability"],
  "Leo": ["creativity", "joy", "confidence"], "Virgo": ["discipline", "craft", "service"],
  "Libra": ["balance", "harmony", "beauty"], "Scorpio": ["transformation", "power", "depth"],
  "Sagittarius": ["freedom", "adventure", "truth"], "Capricorn": ["ambition", "legacy", "duty"],
  "Aquarius": ["rebellion", "vision", "freedom"], "Pisces": ["intuition", "dreams", "healing"],
};

// ─── DETERMINISTIC DAILY SEED ────────────────────────────────────────────────

function dateSeed(date: Date): number {
  const y = date.getFullYear();
  const m = date.getMonth();
  const d = date.getDate();
  // Simple hash that changes daily
  return ((y * 367 + m * 31 + d * 13) * 2654435761) >>> 0;
}

// ─── SCORE QUOTES AGAINST CURRENT ENERGY ─────────────────────────────────────

function scoreQuote(quote: Quote, targetTags: string[]): number {
  let score = 0;
  for (const tag of quote.tags) {
    if (targetTags.includes(tag)) {
      score += 1;
    }
  }
  return score;
}

// ─── MAIN EXPORT ─────────────────────────────────────────────────────────────

export interface DailyQuoteResult {
  quote: Quote;
  reason: string; // why this quote was chosen
}

export function getDailyQuote(
  date: Date,
  userChart?: { sunSign?: string; moonSign?: string; risingSign?: string }
): DailyQuoteResult {
  const moon = getMoonPhase(date);
  const season = getCurrentZodiacSeason(date);
  const dayOfWeek = PLANETARY_DAYS[date.getDay()];

  // Build target tag list from all current energies
  const targetTags: string[] = [
    ...(MOON_PHASE_TAGS[moon.phase] || []),
    ...(ZODIAC_SEASON_TAGS[season.sign] || []),
    ...(PLANETARY_DAY_TAGS[dayOfWeek.planet] || []),
  ];

  // Add user chart tags if available
  if (userChart?.sunSign && SIGN_TAGS[userChart.sunSign]) {
    targetTags.push(...SIGN_TAGS[userChart.sunSign]);
  }
  if (userChart?.moonSign && SIGN_TAGS[userChart.moonSign]) {
    targetTags.push(...SIGN_TAGS[userChart.moonSign]);
  }

  // Score all quotes
  const scored = QUOTES.map(q => ({ quote: q, score: scoreQuote(q, targetTags) }));

  // Get top candidates (score > 0, sorted by score)
  const candidates = scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score);

  // Take top 20% of matches (or at least 15)
  const poolSize = Math.max(15, Math.floor(candidates.length * 0.2));
  const pool = candidates.slice(0, poolSize);

  // Use deterministic seed to pick from pool
  const seed = dateSeed(date);
  const pick = pool.length > 0 ? pool[seed % pool.length] : { quote: QUOTES[seed % QUOTES.length], score: 0 };

  // Build reason string
  const reasons: string[] = [];
  if (moon.phase === "full" || moon.phase === "new") {
    reasons.push(moon.label);
  }
  reasons.push(`${season.sign} season`);
  reasons.push(`${dayOfWeek.planet} day`);
  if (userChart?.sunSign) reasons.push(`${userChart.sunSign} Sun`);

  return {
    quote: pick.quote,
    reason: reasons.join(" · "),
  };
}
