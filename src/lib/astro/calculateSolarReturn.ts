/**
 * Solar Return chart calculator — TypeScript port of calculate_solar_return.py.
 *
 * A solar return is the chart for the exact moment the Sun returns to its
 * natal degree each year — essentially your astrological birthday chart.
 * It maps themes for the year ahead.
 *
 * Uses Swiss Ephemeris for planet positions and binary search for the
 * exact Sun-return moment.
 */

import {
  ASPECTS,
  posToSign,
  applySidereal,
  findAspect,
  assignHouse,
} from "./constants";
import {
  julday,
  revjul,
  getPlanetLongitude,
  getPlanetData,
  getSpecialPoints,
  getHouses,
  getAllPlanetPositions,
  PLANETS,
} from "./ephemeris";
import { ayanamsaDegrees, normalizeAyanamsa, type AyanamsaName } from "./vedic/ayanamsa";
import { normalizeHouseSystem, wholeSignCusps, wholeSignHouse, type HouseSystem } from "./vedic/houses";
import { resolveBirthOffset } from "./birthTimezone";

// ---------- Types ----------

interface SolarReturnInput {
  natalSunAbsPos: number;
  birthDate: string;           // "YYYY-MM-DD"
  latitude: number;
  longitude: number;
  year?: number;
  name?: string;
  cityName?: string;
  zodiacSystem?: "tropical" | "sidereal";
  ayanamsa?: string;
  houseSystem?: HouseSystem | string | null;
  /**
   * The natal birth time is unknown, so the return instant is only known to
   * within the same +/-12h — which moves the solar-return Ascendant by well
   * over a hundred degrees. calculateChart refuses to invent angles in this
   * case; so does this.
   */
  unknownTime?: boolean;
  /**
   * The natal birth data. When present the natal Sun is recomputed here from
   * the birth instant instead of trusting `natalSunAbsPos`, which callers take
   * from a stored chart rounded to 0.01° — the Sun covers 0.01° in about 14
   * minutes, so the return time came out several minutes wrong.
   * `birthLatitude/Longitude` are the BIRTHPLACE (latitude/longitude above are
   * where the return is cast); `birthTimezone` is the chart's stored zone.
   */
  birthTime?: string | null;
  birthTimezone?: string | null;
  birthLatitude?: number | null;
  birthLongitude?: number | null;
}

// ---------- Helpers ----------

/**
 * Get the Sun's ecliptic longitude at a given Julian Day — sidereal when an
 * ayanamsa is given. A sidereal (Vedic "varshaphal") return is the moment the
 * SIDEREAL Sun comes back to its natal sidereal degree; that falls about a day
 * later per 72 years of age than the tropical return, because the ayanamsa grows.
 */
function getSunLongitude(jd: number, ayanamsa: AyanamsaName | null = null): number {
  const lon = getPlanetLongitude(jd, PLANETS.Sun);
  return ayanamsa ? (((lon - ayanamsaDegrees(jd, ayanamsa)) % 360) + 360) % 360 : lon;
}

/**
 * Find the exact Julian Day when the Sun returns to its natal degree.
 * Uses coarse hourly scan + binary search refinement.
 */
function findSolarReturnJd(
  natalSunAbs: number,
  birthMonth: number,
  birthDay: number,
  targetYear: number,
  ayanamsa: AyanamsaName | null = null,
): number {
  // Start searching 2 days before the birthday in the target year
  const searchStartJd = julday(targetYear, birthMonth, birthDay, 0) - 2;

  // Phase 1: scan hour by hour over a 5-day window to find the crossing
  let bestJd = searchStartJd;
  let bestDiff = 999;

  const totalHours = 5 * 24;
  for (let h = 0; h < totalHours; h++) {
    const jd = searchStartJd + h / 24;
    const sunPos = getSunLongitude(jd, ayanamsa);
    // Angular difference handling 360-degree wrap
    let diff = ((sunPos - natalSunAbs + 180) % 360 + 360) % 360 - 180;
    if (Math.abs(diff) < Math.abs(bestDiff)) {
      bestDiff = diff;
      bestJd = jd;
    }
  }

  // Phase 2: refine to the minute with binary search
  let low = bestJd - 1 / 24; // 1 hour before
  let high = bestJd + 1 / 24; // 1 hour after
  let mid = bestJd;

  for (let i = 0; i < 20; i++) {
    mid = (low + high) / 2;
    const sunPos = getSunLongitude(mid, ayanamsa);
    const diff = ((sunPos - natalSunAbs + 180) % 360 + 360) % 360 - 180;
    if (diff < 0) {
      low = mid;
    } else {
      high = mid;
    }
  }

  return mid;
}

/**
 * Convert a Julian Day to date and time strings.
 */
function jdToDateTime(jd: number): { dateStr: string; timeStr: string } {
  const { year, month, day, hour } = revjul(jd);
  const h = Math.floor(hour);
  const m = Math.round((hour - h) * 60);
  return {
    dateStr: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
    timeStr: `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`,
  };
}

// ---------- Main export ----------

export function calculateSolarReturn(data: SolarReturnInput) {
  const [birthYear, birthMonth, birthDay] = data.birthDate.split("-").map(Number);
  const targetYear = data.year ?? new Date().getFullYear();
  const lat = data.latitude;
  const lng = data.longitude;

  const zodiacSystem = data.zodiacSystem === "sidereal" ? "sidereal" : "tropical";
  const ayanamsaName = normalizeAyanamsa(data.ayanamsa);
  const isSidereal = zodiacSystem === "sidereal";
  const houseSystem = normalizeHouseSystem(data.houseSystem, zodiacSystem);

  // The natal Sun, unrounded, in the chart's own zodiac (see SolarReturnInput).
  let natalSunAbs = data.natalSunAbsPos;
  if (data.birthTime && data.birthLatitude != null && data.birthLongitude != null) {
    const [hh, mm] = data.birthTime.split(":").map(Number);
    const local = hh + (mm || 0) / 60;
    const tz = resolveBirthOffset(data.birthTimezone, data.birthLatitude, data.birthLongitude, birthYear, birthMonth, birthDay, local);
    natalSunAbs = getSunLongitude(julday(birthYear, birthMonth, birthDay, local - tz.offsetHours), isSidereal ? ayanamsaName : null);
  }

  // Find the exact return moment (natalSunAbs is in the chart's own zodiac)
  const returnJd = findSolarReturnJd(natalSunAbs, birthMonth, birthDay, targetYear, isSidereal ? ayanamsaName : null);
  // Ayanamsa at the RETURN moment.
  const ayanamsaOffset = isSidereal ? ayanamsaDegrees(returnJd, ayanamsaName) : 0;
  const { dateStr: returnDateStr, timeStr: returnTimeStr } = jdToDateTime(returnJd);

  // --- Planets ---
  const rawPlanets = getAllPlanetPositions(returnJd);
  const planets = rawPlanets.map((p) => {
    const tropicalAbs = p.longitude;
    if (isSidereal) {
      const sid = applySidereal(tropicalAbs, ayanamsaOffset);
      return {
        name: p.name,
        sign: sid.sign,
        signNum: sid.signNum,
        position: sid.position,
        absPosition: sid.absPosition,
        house: null as number | null,
        retrograde: p.retrograde,
      };
    }
    const info = posToSign(tropicalAbs);
    return {
      name: p.name,
      sign: info.sign,
      signNum: info.signNum,
      position: info.position,
      absPosition: info.absPosition,
      house: null as number | null,
      retrograde: p.retrograde,
    };
  });

  // --- Special points ---
  const rawSpecial = getSpecialPoints(returnJd);
  const specialPoints = rawSpecial.map((p) => {
    const tropicalAbs = p.longitude;
    if (isSidereal) {
      const sid = applySidereal(tropicalAbs, ayanamsaOffset);
      return {
        name: p.name,
        sign: sid.sign,
        signNum: sid.signNum,
        position: sid.position,
        absPosition: sid.absPosition,
        house: null as number | null,
        retrograde: p.retrograde,
      };
    }
    const info = posToSign(tropicalAbs);
    return {
      name: p.name,
      sign: info.sign,
      signNum: info.signNum,
      position: info.position,
      absPosition: info.absPosition,
      house: null as number | null,
      retrograde: p.retrograde,
    };
  });

  // --- Houses ---
  const houseData = getHouses(returnJd, lat, lng);
  const ascLon = (((houseData.ascendant - ayanamsaOffset) % 360) + 360) % 360;
  const cuspLons = houseSystem === "whole_sign"
    ? wholeSignCusps(ascLon)
    : houseData.cusps.map((c) => (((c - ayanamsaOffset) % 360) + 360) % 360);
  const houses = cuspLons.map((c, i) => {
    const info = posToSign(c);
    return { number: i + 1, sign: info.sign, signNum: info.signNum, position: info.position, absPosition: info.absPosition };
  });
  const ascInfo = posToSign(ascLon);
  const ascendant = data.unknownTime
    ? null
    : { sign: ascInfo.sign, signNum: ascInfo.signNum, position: ascInfo.position, absPosition: ascInfo.absPosition };

  // Assign house numbers to planets and special points. Skipped without a
  // birth time, for the same reason the Ascendant is: a house number derived
  // from a guessed angle reads as fact downstream.
  if (!data.unknownTime) {
    for (const p of [...planets, ...specialPoints]) {
      p.house = houseSystem === "whole_sign" ? wholeSignHouse(p.absPosition, ascLon) : assignHouse(p.absPosition, houses);
    }
  }

  // --- Midheaven ---
  const mcLon = houseData.mc;
  let midheaven: { sign: string; signNum: number; position: number; absPosition: number } | null;
  if (isSidereal) {
    const sid = applySidereal(mcLon, ayanamsaOffset);
    midheaven = { sign: sid.sign, signNum: sid.signNum, position: sid.position, absPosition: sid.absPosition };
  } else {
    const info = posToSign(mcLon);
    midheaven = { sign: info.sign, signNum: info.signNum, position: info.position, absPosition: info.absPosition };
  }

  // --- Aspects ---
  const allBodies = [...planets, ...specialPoints];
  const aspects: { p1Name: string; p2Name: string; aspect: string; orbit: number; aspectDegrees: number }[] = [];
  for (let i = 0; i < allBodies.length; i++) {
    for (let j = i + 1; j < allBodies.length; j++) {
      const result = findAspect(allBodies[i].absPosition, allBodies[j].absPosition, ASPECTS);
      if (result) {
        const [aspectName, orb] = result;
        const exactDeg = ASPECTS.find((a) => a[0] === aspectName)?.[1] ?? 0;
        aspects.push({
          p1Name: allBodies[i].name,
          p2Name: allBodies[j].name,
          aspect: aspectName,
          orbit: orb,
          aspectDegrees: exactDeg,
        });
      }
    }
  }
  aspects.sort((a, b) => a.orbit - b.orbit);

  // --- Big Three ---
  const bigThree = {
    sun: planets[0]?.sign || "",
    moon: planets[1]?.sign || "",
    rising: ascendant?.sign ?? "",
  };

  const result: Record<string, unknown> = {
    year: targetYear,
    // returnDate/returnTime are UNIVERSAL TIME. Display through returnUtc in
    // the return location's zone (the API route adds returnLocal), never as
    // if they were local.
    returnDate: returnDateStr,
    returnTime: returnTimeStr,
    returnUtc: new Date(Math.round((returnJd - 2440587.5) * 86400000)).toISOString(),
    natalSunDegree: Math.round(natalSunAbs * 100) / 100,
    bigThree,
    planets,
    specialPoints,
    ascendant,
    midheaven: data.unknownTime ? null : midheaven,
    houses: data.unknownTime ? [] : houses,
    unknownTime: !!data.unknownTime,
    aspects,
    zodiacSystem,
    houseSystem,
  };

  if (isSidereal) {
    result.ayanamsa = ayanamsaName;
    result.ayanamsaDegrees = ayanamsaOffset;
  }

  return result;
}
