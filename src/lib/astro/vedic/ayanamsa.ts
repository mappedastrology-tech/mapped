/**
 * Ayanamsa — the angle between the tropical zodiac (measured from the moving
 * vernal equinox) and the sidereal zodiac (fixed against the stars).
 *
 * WHY THIS IS COMPUTED, NOT A CONSTANT
 * The equinox precesses about 50.3" a year, so the ayanamsa grows by roughly
 * 1° every 72 years. A frozen value (the app used 24.17° for everyone) is only
 * right for one year: for a 1960 birth it put every planet ~0.8° too far back,
 * which is enough to move a Moon into the wrong nakshatra or a planet into the
 * wrong sign. Every sidereal position must use the ayanamsa for ITS moment —
 * the birth instant for a natal chart, the transit instant for a transit.
 *
 * THE MODEL
 *   mean ayanamsa(t) = value at J2000.0 + general precession in longitude p_A(t)
 *   true ayanamsa(t) = mean ayanamsa(t) + nutation in longitude Δψ(t)
 *
 * p_A is the IAU 2006 (Capitaine et al. 2003) polynomial. The J2000 values are
 * the Swiss Ephemeris 2.10 values for each ayanamsa; this model reproduces the
 * Swiss Ephemeris to well under 1 arcsecond across 1900–2100 (see
 * tests/vedic.test.ts).
 *
 * Mapped's tropical longitudes come from astronomy-engine as APPARENT
 * positions on the TRUE ecliptic of date (they include nutation), so the value
 * to subtract is the TRUE ayanamsa. That is also what Swiss Ephemeris does, so
 * our sidereal positions line up with Jagannatha Hora / Swiss-based software.
 */

import * as Astronomy from "astronomy-engine";

export type AyanamsaName = "lahiri" | "krishnamurti" | "raman";

export const AYANAMSA_NAMES: AyanamsaName[] = ["lahiri", "krishnamurti", "raman"];

/** Human label, used in the UI and in model prompts. */
export const AYANAMSA_LABELS: Record<AyanamsaName, string> = {
  lahiri: "Lahiri",
  krishnamurti: "Krishnamurti (KP)",
  raman: "Raman",
};

/** Mean ayanamsa in degrees at J2000.0 (JD 2451545.0), per Swiss Ephemeris 2.10. */
const AYANAMSA_AT_J2000: Record<AyanamsaName, number> = {
  // Lahiri / Chitrapaksha: Indian Calendar Reform Committee, 23°15'00.658" on 1956-03-21.
  lahiri: 23.8570923537,
  // K.S. Krishnamurti (KP system).
  krishnamurti: 23.7602400403,
  // B.V. Raman.
  raman: 22.4107910403,
};

const J2000 = 2451545.0;

/** Accept anything stored in the database and fall back to Lahiri. */
export function normalizeAyanamsa(value: unknown): AyanamsaName {
  return value === "krishnamurti" || value === "raman" ? value : "lahiri";
}

/** Julian Day (UT) → astronomy-engine time. */
function astroTimeFromJd(jdUt: number): Astronomy.AstroTime {
  return Astronomy.MakeTime(new Date((jdUt - 2440587.5) * 86400000));
}

/** General precession in longitude since J2000, in degrees (IAU 2006 p_A). */
export function precessionSinceJ2000(jdUt: number): number {
  // UT vs TT (about a minute) is irrelevant at this precision.
  const T = (jdUt - J2000) / 36525;
  const arcsec =
    5028.796195 * T +
    1.1054348 * T * T +
    0.00007964 * T * T * T -
    0.000023857 * T * T * T * T;
  return arcsec / 3600;
}

/** Mean ayanamsa (no nutation), degrees. This is the figure almanacs usually quote. */
export function meanAyanamsa(jdUt: number, name: AyanamsaName = "lahiri"): number {
  return AYANAMSA_AT_J2000[name] + precessionSinceJ2000(jdUt);
}

/** Nutation in longitude Δψ, degrees (IAU 2000B via astronomy-engine). */
export function nutationInLongitude(jdUt: number): number {
  return Astronomy.e_tilt(astroTimeFromJd(jdUt)).dpsi / 3600;
}

/**
 * True ayanamsa, degrees: the amount to subtract from an apparent tropical
 * longitude (as produced by ephemeris.ts) to get the sidereal longitude.
 */
export function ayanamsaDegrees(jdUt: number, name: AyanamsaName = "lahiri"): number {
  return meanAyanamsa(jdUt, name) + nutationInLongitude(jdUt);
}

/** Tropical → sidereal longitude at a given moment, normalised to [0, 360). */
export function toSidereal(tropicalLon: number, jdUt: number, name: AyanamsaName = "lahiri"): number {
  return (((tropicalLon - ayanamsaDegrees(jdUt, name)) % 360) + 360) % 360;
}

/** Julian Day (UT) for a JS Date. */
export function jdFromDate(date: Date): number {
  return date.getTime() / 86400000 + 2440587.5;
}

/** 23.8571 → `23°51'` (degrees and whole arcminutes, for display). */
export function formatDegreesMinutes(deg: number): string {
  let d = Math.floor(deg);
  let m = Math.round((deg - d) * 60);
  if (m === 60) { d += 1; m = 0; }
  return `${d}°${String(m).padStart(2, "0")}'`;
}
