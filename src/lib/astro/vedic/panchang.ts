/**
 * Panchang — the five limbs of the Hindu almanac, for a given moment.
 *
 *   tithi     lunar day: each 12° the Moon gains on the Sun (30 per month)
 *   nakshatra the Moon's lunar mansion (sidereal)
 *   yoga      each 13°20' of (sidereal Sun + sidereal Moon)       (27)
 *   karana    half a tithi, 6° of Moon−Sun elongation              (60 per month, 11 names)
 *   vara      weekday, named for its planetary ruler
 *
 * Tithi and karana depend only on the Moon−Sun angle, so they are the same in
 * every ayanamsa. Nakshatra and yoga use sidereal longitudes (Lahiri unless
 * told otherwise).
 *
 * CONVENTION: these values are for the instant asked about. A printed
 * panchang lists the tithi/nakshatra "prevailing at local sunrise" and the
 * time each one ends; we give the current value plus when the current tithi
 * and nakshatra end, which answers "what is it now" honestly. The vara is the
 * civil weekday of the date passed; traditionally the vara begins at local
 * sunrise rather than midnight.
 */

import { getPlanetLongitude } from "../ephemeris";
import { ayanamsaDegrees, jdFromDate, type AyanamsaName } from "./ayanamsa";
import { nakshatraOf, NAKSHATRA_SPAN, type NakshatraPosition } from "./nakshatra";

export const TITHI_NAMES = [
  "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami", "Shashthi", "Saptami",
  "Ashtami", "Navami", "Dashami", "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi",
] as const;

export const YOGA_NAMES = [
  "Vishkambha", "Priti", "Ayushman", "Saubhagya", "Shobhana", "Atiganda", "Sukarma",
  "Dhriti", "Shula", "Ganda", "Vriddhi", "Dhruva", "Vyaghata", "Harshana",
  "Vajra", "Siddhi", "Vyatipata", "Variyana", "Parigha", "Shiva", "Siddha",
  "Sadhya", "Shubha", "Shukla", "Brahma", "Indra", "Vaidhriti",
] as const;

const MOVABLE_KARANAS = ["Bava", "Balava", "Kaulava", "Taitila", "Garaja", "Vanija", "Vishti"] as const;

export const VARA = [
  { name: "Ravivara", ruler: "Sun" },
  { name: "Somavara", ruler: "Moon" },
  { name: "Mangalavara", ruler: "Mars" },
  { name: "Budhavara", ruler: "Mercury" },
  { name: "Guruvara", ruler: "Jupiter" },
  { name: "Shukravara", ruler: "Venus" },
  { name: "Shanivara", ruler: "Saturn" },
] as const;

export interface Tithi {
  /** 1–30. 1–15 Shukla (waxing), 16–30 Krishna (waning). */
  number: number;
  paksha: "Shukla" | "Krishna";
  /** e.g. "Shukla Ekadashi", "Purnima", "Amavasya". */
  name: string;
  endsAt: Date | null;
}

export interface Panchang {
  at: Date;
  tithi: Tithi;
  nakshatra: NakshatraPosition & { endsAt: Date | null };
  yoga: { number: number; name: string };
  karana: { number: number; name: string };
  vara: { name: string; ruler: string };
  ayanamsa: AyanamsaName;
}

const norm = (x: number) => ((x % 360) + 360) % 360;

function sunMoon(jd: number) {
  return { sun: getPlanetLongitude(jd, "Sun"), moon: getPlanetLongitude(jd, "Moon") };
}

/** Moon − Sun elongation, 0–360. */
function elongation(jd: number): number {
  const { sun, moon } = sunMoon(jd);
  return norm(moon - sun);
}

export function tithiName(n: number): { name: string; paksha: "Shukla" | "Krishna" } {
  if (n === 15) return { name: "Purnima", paksha: "Shukla" };
  if (n === 30) return { name: "Amavasya", paksha: "Krishna" };
  const paksha = n <= 15 ? "Shukla" : "Krishna";
  return { name: `${paksha} ${TITHI_NAMES[(n - 1) % 15]}`, paksha };
}

export function karanaName(k: number): string {
  // k is 0..59, the half-tithi index within the lunar month.
  if (k === 0) return "Kimstughna";
  if (k === 57) return "Shakuni";
  if (k === 58) return "Chatushpada";
  if (k === 59) return "Naga";
  return MOVABLE_KARANAS[(k - 1) % 7];
}

/**
 * When does the integer `indexAt(jd)` next change? Steps forward an hour at a
 * time (every limb here lasts well over an hour) then bisects to ~1 minute.
 */
function nextChange(jd0: number, indexAt: (jd: number) => number, maxHours = 36): Date | null {
  const start = indexAt(jd0);
  let lo = jd0;
  let hi = jd0;
  let found = false;
  for (let h = 1; h <= maxHours; h++) {
    hi = jd0 + h / 24;
    if (indexAt(hi) !== start) { found = true; break; }
    lo = hi;
  }
  if (!found) return null;
  while ((hi - lo) * 1440 > 1) {
    const mid = (lo + hi) / 2;
    if (indexAt(mid) === start) lo = mid; else hi = mid;
  }
  return new Date((hi - 2440587.5) * 86400000);
}

export function getPanchang(at: Date, ayanamsa: AyanamsaName = "lahiri"): Panchang {
  const jd = jdFromDate(at);
  const { sun, moon } = sunMoon(jd);
  const aya = ayanamsaDegrees(jd, ayanamsa);
  const sunSid = norm(sun - aya);
  const moonSid = norm(moon - aya);

  const tithiIndex = (j: number) => Math.floor(elongation(j) / 12);
  const tNum = Math.floor(norm(moon - sun) / 12) + 1;
  const tName = tithiName(tNum);

  const nakIndex = (j: number) => {
    const m = getPlanetLongitude(j, "Moon");
    return Math.floor(norm(m - ayanamsaDegrees(j, ayanamsa)) / NAKSHATRA_SPAN);
  };

  const yogaIdx = Math.floor(norm(sunSid + moonSid) / NAKSHATRA_SPAN);
  const karanaIdx = Math.floor(norm(moon - sun) / 6);
  const vara = VARA[at.getDay()];

  return {
    at,
    tithi: { number: tNum, paksha: tName.paksha, name: tName.name, endsAt: nextChange(jd, tithiIndex) },
    nakshatra: { ...nakshatraOf(moonSid), endsAt: nextChange(jd, nakIndex) },
    yoga: { number: yogaIdx + 1, name: YOGA_NAMES[yogaIdx] },
    karana: { number: karanaIdx + 1, name: karanaName(karanaIdx) },
    vara: { name: vara.name, ruler: vara.ruler },
    ayanamsa,
  };
}
