/**
 * Vimshottari dasha — the 120-year planetary period system.
 *
 * HOW IT WORKS
 * 1. Find the Moon's nakshatra at birth (sidereal). Its lord runs the first
 *    mahadasha.
 * 2. The part of the nakshatra the Moon has ALREADY crossed counts as elapsed:
 *    balance of first dasha = (1 − fraction crossed) × that lord's years.
 * 3. Mahadashas then follow DASHA_ORDER, each for its full length.
 * 4. Each mahadasha divides into nine antardashas (bhuktis), starting with the
 *    mahadasha lord itself, each lasting maha years × antar years / 120.
 *
 * CONVENTIONS (stated because software disagrees on them)
 * - Year length: 365.25 days (Julian year). Some software uses 365.2422 or a
 *   360-day "savana" year; over a lifetime the dates can drift a few weeks
 *   apart. Jagannatha Hora's default is close to this.
 * - The Moon must be the unrounded sidereal longitude at the exact birth
 *   instant: the Moon moves ~13°/day, so a 0.01° error is ~5 days of dasha
 *   for a 20-year Venus period.
 * - Needs a birth time. Without one the Moon can be anywhere in a ~13° span
 *   and the dasha dates are guesses; callers must not show them as fact.
 */

import { DASHA_ORDER, nakshatraOf, type Graha } from "./nakshatra";

export const DASHA_YEARS: Record<Graha, number> = {
  Ketu: 7, Venus: 20, Sun: 6, Moon: 10, Mars: 7, Rahu: 18, Jupiter: 16, Saturn: 19, Mercury: 17,
};

export const DASHA_TOTAL_YEARS = 120;
export const DASHA_YEAR_DAYS = 365.25;
const MS_PER_YEAR = DASHA_YEAR_DAYS * 86400000;

export interface DashaPeriod {
  lord: Graha;
  start: Date;
  end: Date;
}

export interface Mahadasha extends DashaPeriod {
  antardashas: DashaPeriod[];
}

export interface DashaTimeline {
  /** Lord of the Moon's birth nakshatra — the first mahadasha. */
  birthLord: Graha;
  /** Years of the first mahadasha still to run at birth. */
  balanceYears: number;
  mahadashas: Mahadasha[];
}

function addYears(d: Date, years: number): Date {
  return new Date(d.getTime() + years * MS_PER_YEAR);
}

function antardashasFor(maha: DashaPeriod, mahaYears: number, fullStart: Date): DashaPeriod[] {
  // Antardashas are laid out across the FULL mahadasha, beginning at its
  // notional start (for the birth mahadasha that start is before birth).
  const out: DashaPeriod[] = [];
  const startIdx = DASHA_ORDER.indexOf(maha.lord);
  let cursor = fullStart;
  for (let k = 0; k < 9; k++) {
    const lord = DASHA_ORDER[(startIdx + k) % 9];
    const years = (mahaYears * DASHA_YEARS[lord]) / DASHA_TOTAL_YEARS;
    const end = addYears(cursor, years);
    out.push({ lord, start: cursor, end });
    cursor = end;
  }
  return out;
}

/**
 * Build the mahadasha/antardasha timeline.
 *
 * @param moonSiderealLon Moon's sidereal longitude at birth, unrounded.
 * @param birth           Birth instant.
 * @param spanYears       How far from birth to lay periods out (default 120).
 */
export function vimshottariDasha(moonSiderealLon: number, birth: Date, spanYears = 120): DashaTimeline {
  const nak = nakshatraOf(moonSiderealLon);
  const birthLord = nak.lord;
  const firstYears = DASHA_YEARS[birthLord];
  const balanceYears = firstYears * (1 - nak.fraction);

  const mahadashas: Mahadasha[] = [];
  const horizon = addYears(birth, spanYears);

  // Notional start of the birth mahadasha (before birth).
  let fullStart = addYears(birth, -(firstYears - balanceYears));
  let idx = DASHA_ORDER.indexOf(birthLord);
  while (fullStart < horizon) {
    const lord = DASHA_ORDER[idx % 9];
    const years = DASHA_YEARS[lord];
    const end = addYears(fullStart, years);
    const maha: DashaPeriod = { lord, start: fullStart < birth ? birth : fullStart, end };
    const antar = antardashasFor(maha, years, fullStart)
      // Drop sub-periods that finished before birth, and clip the running one.
      .filter((a) => a.end > birth)
      .map((a) => (a.start < birth ? { ...a, start: birth } : a));
    mahadashas.push({ ...maha, antardashas: antar });
    fullStart = end;
    idx++;
  }

  return { birthLord, balanceYears, mahadashas };
}

export interface CurrentDasha {
  maha: Mahadasha;
  antar: DashaPeriod;
}

/** The mahadasha + antardasha running at `at`, or null outside the timeline. */
export function currentDasha(timeline: DashaTimeline, at: Date): CurrentDasha | null {
  const t = at.getTime();
  const maha = timeline.mahadashas.find((m) => m.start.getTime() <= t && t < m.end.getTime());
  if (!maha) return null;
  const antar = maha.antardashas.find((a) => a.start.getTime() <= t && t < a.end.getTime());
  if (!antar) return null;
  return { maha, antar };
}

/** The next `count` antardashas starting after `at` (crossing mahadasha boundaries). */
export function upcomingAntardashas(
  timeline: DashaTimeline, at: Date, count = 6,
): { maha: Graha; antar: DashaPeriod }[] {
  const t = at.getTime();
  const out: { maha: Graha; antar: DashaPeriod }[] = [];
  for (const m of timeline.mahadashas) {
    for (const a of m.antardashas) {
      if (a.start.getTime() > t) {
        out.push({ maha: m.lord, antar: a });
        if (out.length >= count) return out;
      }
    }
  }
  return out;
}
