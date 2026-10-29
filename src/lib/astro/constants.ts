/**
 * Shared astrology constants used across all calculation modules.
 */

export const SIGN_NAMES = [
  "Ari", "Tau", "Gem", "Can", "Leo", "Vir",
  "Lib", "Sco", "Sag", "Cap", "Aqu", "Pis",
] as const;

export const SIGN_ELEMENT: Record<string, string> = {
  Ari: "fire", Leo: "fire", Sag: "fire",
  Tau: "earth", Vir: "earth", Cap: "earth",
  Gem: "air", Lib: "air", Aqu: "air",
  Can: "water", Pis: "water", Sco: "water",
};

// NOTE: there is deliberately no ayanamsa constant here. The ayanamsa changes
// ~50" a year and must be computed for the moment in question — see
// vedic/ayanamsa.ts (ayanamsaDegrees).

/** Standard aspect definitions: [name, exactDegrees, maxOrb] */
export const ASPECTS: [string, number, number][] = [
  ["conjunction", 0, 8],
  ["opposition", 180, 8],
  ["trine", 120, 7],
  ["square", 90, 7],
  ["sextile", 60, 5],
];

export const ASPECTS_WITH_QUINCUNX: [string, number, number][] = [
  ...ASPECTS,
  ["quincunx", 150, 3],
];

/** Smallest angular distance between two zodiac positions (0-180). */
export function angleDiff(a: number, b: number): number {
  const d = Math.abs(a - b) % 360;
  return d <= 180 ? d : 360 - d;
}

/** Check if two positions form an aspect. Returns [aspectName, orb] or null. */
export function findAspect(
  pos1: number,
  pos2: number,
  aspectList: [string, number, number][] = ASPECTS
): [string, number] | null {
  const diff = angleDiff(pos1, pos2);
  for (const [name, degrees, maxOrb] of aspectList) {
    const orb = Math.abs(diff - degrees);
    if (orb <= maxOrb) {
      return [name, Math.round(orb * 100) / 100];
    }
  }
  return null;
}

/**
 * Convert absolute position (0-360) to sign info.
 *
 * TRUNCATES to 0.01° first and derives every field from that one value, so
 * they always agree and the sign is the one the body is really in: 59.996°
 * is 29.99° Taurus (it has not reached Gemini), never "30.00° Taurus" as
 * rounding produced. position is always 0–29.99, absPosition 0–359.99. (The
 * 1e-6 absorbs float noise such as 59.99999999999 for an exact 60.)
 */
export function posToSign(absPos: number) {
  const hundredths = ((Math.floor(absPos * 100 + 1e-6) % 36000) + 36000) % 36000;
  const signNum = Math.floor(hundredths / 3000);
  return {
    sign: SIGN_NAMES[signNum],
    signNum,
    position: (hundredths % 3000) / 100,
    absPosition: hundredths / 100,
  };
}

/**
 * Apply sidereal correction to a tropical absolute position.
 * `ayanamsaOffset` must be the ayanamsa for THAT moment (vedic/ayanamsa.ts).
 */
export function applySidereal(absPosition: number, ayanamsaOffset: number) {
  const siderealPos = ((absPosition - ayanamsaOffset) % 360 + 360) % 360;
  return posToSign(siderealPos);
}

/**
 * Midpoint of two zodiac positions (shorter arc), unrounded — posToSign does
 * the one rounding, so a midpoint at 59.996° stays in Taurus.
 */
export function midpoint(pos1: number, pos2: number): number {
  const diff = ((pos2 - pos1) % 360 + 360) % 360;
  let mid: number;
  if (diff > 180) {
    mid = (pos1 + diff / 2 + 180) % 360;
  } else {
    mid = (pos1 + diff / 2) % 360;
  }
  return mid;
}

/** Determine which house a planet falls in based on house cusp positions. */
export function assignHouse(
  planetPos: number,
  houses: { number: number; absPosition: number }[]
): number {
  for (let i = 0; i < houses.length; i++) {
    const cuspStart = houses[i].absPosition;
    const cuspEnd = houses[(i + 1) % houses.length].absPosition;

    if (cuspEnd < cuspStart) {
      // Wraps around 360/0
      if (planetPos >= cuspStart || planetPos < cuspEnd) {
        return houses[i].number;
      }
    } else {
      if (planetPos >= cuspStart && planetPos < cuspEnd) {
        return houses[i].number;
      }
    }
  }
  return 1; // fallback
}
