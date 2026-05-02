/**
 * Transit Intensity Scorer — shared utility
 *
 * Calculates how strongly a transit is affecting the chart (0-100).
 * Factors: planet weight, aspect type, orb tightness, natal planet
 * importance, retrograde status.
 *
 * Extracted from maps/page.tsx so it can be used by the API route,
 * maps page, and any future transit display.
 */

/** Minimal shape a transit aspect needs for scoring */
export interface TransitForScoring {
  transitPlanet: string;
  natalPlanet: string;
  aspect: string;
  orb: number;
  transitRetrograde?: boolean;
}

export interface IntensityResult {
  score: number;
  label: string;
  color: string;
}

// Planet weight: outer planets hit harder, longer
const PLANET_WEIGHT: Record<string, number> = {
  Pluto: 55, Neptune: 48, Uranus: 45, Saturn: 40, Jupiter: 30,
  Mars: 20, Venus: 16, Mercury: 13, Sun: 11, Moon: 7,
};

// Aspect intensity: conjunctions/oppositions hit hardest
const ASPECT_WEIGHT: Record<string, number> = {
  conjunction: 1.0, opposition: 0.9, square: 0.85,
  quincunx: 0.65, trine: 0.55, sextile: 0.45,
};

// Natal planet importance: personal planets feel it more viscerally
const NATAL_WEIGHT: Record<string, number> = {
  Sun: 1.6, Moon: 1.6, Mercury: 1.2, Venus: 1.35, Mars: 1.2,
  Jupiter: 0.9, Saturn: 1.0, Uranus: 0.85, Neptune: 0.85, Pluto: 0.8,
};

/**
 * Score a transit aspect from 0-100 by strength/impact.
 * Higher = more intense, more felt in daily life.
 */
export function getTransitIntensity(ta: TransitForScoring): IntensityResult {
  const base = PLANET_WEIGHT[ta.transitPlanet] || 10;
  const aspectMult = ASPECT_WEIGHT[ta.aspect] || 0.5;
  const natalMult = NATAL_WEIGHT[ta.natalPlanet] || 1.0;
  // Tighter orb = stronger. 0° orb = 1.0x, 8° orb ≈ 0.25x
  const orbFactor = Math.max(0.25, 1.0 - (ta.orb / 10.5));
  // Retrograde adds ~18% intensity (energy concentrated, revisiting)
  const retroMult = ta.transitRetrograde ? 1.18 : 1.0;

  let score = Math.round(base * aspectMult * natalMult * orbFactor * retroMult);
  score = Math.min(100, Math.max(1, score));

  let label = "Background hum";
  let color = "text-foreground/30";
  if (score >= 75) { label = "Life-altering"; color = "text-terracotta"; }
  else if (score >= 55) { label = "Very strong"; color = "text-amber"; }
  else if (score >= 38) { label = "Significant"; color = "text-foreground/70"; }
  else if (score >= 20) { label = "Moderate"; color = "text-foreground/50"; }
  else if (score >= 10) { label = "Subtle"; color = "text-foreground/40"; }

  return { score, label, color };
}

/**
 * Sort an array of transit aspects by intensity (strongest first).
 * Non-destructive — returns a new sorted array.
 */
export function sortTransitsByIntensity<T extends TransitForScoring>(transits: T[]): T[] {
  return [...transits].sort((a, b) => getTransitIntensity(b).score - getTransitIntensity(a).score);
}
