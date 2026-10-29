/**
 * The Moon's possible signs for a birth date with no known time.
 *
 * The Moon moves 12–15° a day, so on roughly 40–45% of dates it changes sign
 * at some point between midnight and midnight. An unknown-time chart is cast
 * for a placeholder time (noon), and its Moon sign is only one of two
 * possibilities on those dates. Telling someone "your Moon sign is still
 * accurate" without checking was false for nearly half of them.
 *
 * This casts the Moon at 00:00 and 23:59 LOCAL time on the birth date. The Moon
 * never goes retrograde and never covers 30° in a day, so if the two ends agree
 * the sign is certain, and if they differ it is one of exactly those two
 * adjacent signs.
 *
 * Uses the same pieces the chart does — the location's historical UTC offset
 * (calculateChart.getUtcOffsetHours), astronomy-engine via ephemeris.ts, and the
 * per-instant ayanamsa for sidereal charts — so the result matches the chart
 * screen's zodiac.
 */

import { getUtcOffsetHours } from "./calculateChart";
import { SIGN_NAMES } from "./constants";
import { getPlanetLongitude, julday } from "./ephemeris";
import { ayanamsaDegrees, type AyanamsaName } from "./vedic/ayanamsa";

export interface MoonRangeInput {
  birthDate: string; // "YYYY-MM-DD"
  latitude: number;
  longitude: number;
  zodiacSystem?: "tropical" | "sidereal" | string | null;
  ayanamsa?: AyanamsaName | null;
}

export interface MoonRange {
  /** Moon sign (abbreviation, e.g. "Leo") at 00:00 local. */
  start: string;
  /** Moon sign at 23:59 local. */
  end: string;
  /** True when the Moon changed sign during the day. */
  changesSign: boolean;
}

function moonSignAt(year: number, month: number, day: number, localHour: number, input: MoonRangeInput): string {
  const offset = getUtcOffsetHours(input.latitude, input.longitude, year, month, day, localHour);
  const jd = julday(year, month, day, localHour - offset);
  let lon = getPlanetLongitude(jd, "Moon");
  if (input.zodiacSystem === "sidereal") {
    lon = (((lon - ayanamsaDegrees(jd, input.ayanamsa ?? "lahiri")) % 360) + 360) % 360;
  }
  return SIGN_NAMES[Math.floor((((lon % 360) + 360) % 360) / 30)];
}

export function moonSignRange(input: MoonRangeInput): MoonRange | null {
  const [year, month, day] = String(input.birthDate || "").split("-").map(Number);
  if (!year || !month || !day) return null;
  if (!Number.isFinite(input.latitude) || !Number.isFinite(input.longitude)) return null;
  const start = moonSignAt(year, month, day, 0, input);
  const end = moonSignAt(year, month, day, 23 + 59 / 60, input);
  return { start, end, changesSign: start !== end };
}
