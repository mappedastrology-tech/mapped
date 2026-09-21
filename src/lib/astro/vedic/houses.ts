/**
 * House systems.
 *
 * Mapped offers two:
 * - "placidus" — the modern Western default (time-based quadrant system).
 * - "whole_sign" — the rising sign is the entire 1st house, the next sign the
 *   entire 2nd, and so on. This is the standard in Jyotish and in Hellenistic
 *   astrology, and it is the DEFAULT FOR SIDEREAL charts.
 *
 * With whole-sign houses the house-1 cusp is 0° of the rising sign, NOT the
 * Ascendant degree, and the 10th house is not necessarily the sign of the MC.
 * That is why charts carry a separate `ascendant` field: anything that needs
 * the Ascendant degree (Lots, the wheel's ASC line, rising-cusp warnings) must
 * read `ascendant`, never houses[0].
 */

import { posToSign } from "../constants";

export type HouseSystem = "placidus" | "whole_sign";

export const HOUSE_SYSTEM_LABELS: Record<HouseSystem, string> = {
  placidus: "Placidus",
  whole_sign: "Whole sign",
};

/** Default house system for a zodiac: whole sign for sidereal, Placidus for tropical. */
export function defaultHouseSystem(zodiacSystem: string | null | undefined): HouseSystem {
  return zodiacSystem === "sidereal" ? "whole_sign" : "placidus";
}

/** Accept whatever is stored; null/unknown means "the default for this zodiac". */
export function normalizeHouseSystem(value: unknown, zodiacSystem: string | null | undefined): HouseSystem {
  if (value === "placidus" || value === "whole_sign") return value;
  return defaultHouseSystem(zodiacSystem);
}

/** Twelve whole-sign cusps (0° of each sign, starting with the rising sign). */
export function wholeSignCusps(ascendantLon: number): number[] {
  const ascSign = Math.floor((((ascendantLon % 360) + 360) % 360) / 30);
  return Array.from({ length: 12 }, (_, i) => ((ascSign + i) % 12) * 30);
}

/** House (1–12) of a longitude in whole-sign houses. */
export function wholeSignHouse(lon: number, ascendantLon: number): number {
  const ascSign = Math.floor((((ascendantLon % 360) + 360) % 360) / 30);
  const sign = Math.floor((((lon % 360) + 360) % 360) / 30);
  return ((sign - ascSign + 12) % 12) + 1;
}

/** Cusp list in the shape charts store: { number, sign, signNum, position, absPosition }. */
export function cuspsToHouses(cusps: number[]) {
  return cusps.map((c, i) => {
    const info = posToSign(c);
    return { number: i + 1, sign: info.sign, signNum: info.signNum, position: info.position, absPosition: info.absPosition };
  });
}
