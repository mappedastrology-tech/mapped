/**
 * Nakshatras — the 27 lunar mansions of 13°20' each, counted from 0° sidereal
 * Aries. Each is split into four padas of 3°20'. Each has a ruling graha
 * ("lord"); the lords repeat in the Vimshottari order Ketu → Venus → Sun →
 * Moon → Mars → Rahu → Jupiter → Saturn → Mercury, three times round.
 *
 * Only meaningful for SIDEREAL longitudes. Passing a tropical longitude gives a
 * nakshatra ~24° (about two mansions) away from the right one.
 *
 * Names match NAKSHATRAS in celestialCalendar.ts (which holds the deity /
 * quality / description copy) — tests/vedic.test.ts keeps the two in step.
 */

export type Graha =
  | "Sun" | "Moon" | "Mars" | "Mercury" | "Jupiter" | "Venus" | "Saturn" | "Rahu" | "Ketu";

export const NAKSHATRA_NAMES = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
  "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
  "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
  "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishtha", "Shatabhisha",
  "Purva Bhadrapada", "Uttara Bhadrapada", "Revati",
] as const;

/** Vimshottari lord sequence; nakshatra i is ruled by DASHA_ORDER[i % 9]. */
export const DASHA_ORDER: Graha[] = [
  "Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury",
];

/** 13°20' */
export const NAKSHATRA_SPAN = 360 / 27;
/** 3°20' */
export const PADA_SPAN = NAKSHATRA_SPAN / 4;

export interface NakshatraPosition {
  /** 0-based index, 0 = Ashwini. */
  index: number;
  name: string;
  /** 1–4 */
  pada: number;
  lord: Graha;
  /** Degrees travelled into this nakshatra (0 – 13.333). */
  degreesIn: number;
  /** Fraction of the nakshatra already traversed (0 – 1). Used for dasha balance. */
  fraction: number;
}

export function nakshatraOf(siderealLon: number): NakshatraPosition {
  const lon = ((siderealLon % 360) + 360) % 360;
  const index = Math.min(26, Math.floor(lon / NAKSHATRA_SPAN));
  const degreesIn = lon - index * NAKSHATRA_SPAN;
  const pada = Math.min(4, Math.floor(degreesIn / PADA_SPAN) + 1);
  return {
    index,
    name: NAKSHATRA_NAMES[index],
    pada,
    lord: DASHA_ORDER[index % 9],
    degreesIn,
    fraction: degreesIn / NAKSHATRA_SPAN,
  };
}
