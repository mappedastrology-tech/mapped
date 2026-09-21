/**
 * Divisional charts (vargas). Only the Navamsa (D9) is implemented.
 *
 * Navamsa: each sign is cut into nine parts of 3°20'. Counting those parts
 * continuously round the zodiac from 0° Aries and wrapping every 12 gives the
 * classical rule directly — fire signs start their navamsas from Aries, earth
 * from Capricorn, air from Libra, water from Cancer — without a lookup table.
 * Note a navamsa part is the same 3°20' as a nakshatra pada, so the 108
 * navamsas line up one-for-one with the 108 padas.
 */

import { SIGN_NAMES } from "../constants";

export interface VargaPosition {
  sign: string;
  signNum: number;
  /** Degree within the divisional sign (0–30), useful for D9 aspects/strength. */
  position: number;
}

export function navamsaOf(siderealLon: number): VargaPosition {
  const lon = ((siderealLon % 360) + 360) % 360;
  const part = Math.floor((lon * 9) / 30); // 0..107
  const signNum = part % 12;
  const position = ((lon * 9) % 30 + 30) % 30;
  return { sign: SIGN_NAMES[signNum], signNum, position: Math.round(position * 100) / 100 };
}
