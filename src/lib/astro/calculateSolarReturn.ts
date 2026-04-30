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
  SIGN_NAMES,
  AYANAMSA_VALUES,
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
}

// ---------- Helpers ----------

/**
 * Get the Sun's ecliptic longitude at a given Julian Day.
 */
function getSunLongitude(jd: number): number {
  return getPlanetLongitude(jd, PLANETS.Sun);
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
): number {
  // Start searching 2 days before the birthday in the target year
  const searchStartJd = julday(targetYear, birthMonth, birthDay, 0) - 2;

  // Phase 1: scan hour by hour over a 5-day window to find the crossing
  let bestJd = searchStartJd;
  let bestDiff = 999;

  const totalHours = 5 * 24;
  for (let h = 0; h < totalHours; h++) {
    const jd = searchStartJd + h / 24;
    const sunPos = getSunLongitude(jd);
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
    const sunPos = getSunLongitude(mid);
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
  const natalSunAbs = data.natalSunAbsPos;
  const [, birthMonth, birthDay] = data.birthDate.split("-").map(Number);
  const targetYear = data.year ?? new Date().getFullYear();
  const lat = data.latitude;
  const lng = data.longitude;

  const zodiacSystem = data.zodiacSystem || "tropical";
  const ayanamsaName = data.ayanamsa || "lahiri";
  const isSidereal = zodiacSystem === "sidereal";
  const ayanamsaOffset = isSidereal ? (AYANAMSA_VALUES[ayanamsaName] ?? 24.17) : 0;

  // Find the exact return moment
  const returnJd = findSolarReturnJd(natalSunAbs, birthMonth, birthDay, targetYear);
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
  const houses = houseData.cusps.map((cusp, i) => {
    const tropicalAbs = cusp;
    if (isSidereal) {
      const sid = applySidereal(tropicalAbs, ayanamsaOffset);
      return { number: i + 1, sign: sid.sign, signNum: sid.signNum, position: sid.position, absPosition: sid.absPosition };
    }
    const info = posToSign(tropicalAbs);
    return { number: i + 1, sign: info.sign, signNum: info.signNum, position: info.position, absPosition: info.absPosition };
  });

  // Assign house numbers to planets and special points
  for (const p of [...planets, ...specialPoints]) {
    p.house = assignHouse(p.absPosition, houses);
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
    rising: houses[0]?.sign || "",
  };

  const result: Record<string, unknown> = {
    year: targetYear,
    returnDate: returnDateStr,
    returnTime: returnTimeStr,
    natalSunDegree: Math.round(natalSunAbs * 100) / 100,
    bigThree,
    planets,
    specialPoints,
    midheaven,
    houses,
    aspects,
    zodiacSystem,
  };

  if (isSidereal) {
    result.ayanamsa = ayanamsaName;
    result.ayanamsaDegrees = ayanamsaOffset;
  }

  return result;
}
