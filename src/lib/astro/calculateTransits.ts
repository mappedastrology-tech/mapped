/**
 * Transit calculator — TypeScript port of calculate_transits.py.
 *
 * Calculates current planetary positions and finds aspects to a natal chart.
 * Supports both Tropical and Sidereal zodiac systems.
 *
 * Uses Swiss Ephemeris for planet positions and transit window scanning.
 */

import {
  ASPECTS_WITH_QUINCUNX,
  AYANAMSA_VALUES,
  angleDiff,
  findAspect,
  posToSign,
  applySidereal,
} from "./constants";
import {
  julday,
  jdToDateStr,
  getPlanetLongitude,
  getPlanetData,
  PLANETS,
  PlanetName,
} from "./ephemeris";
import { getTransitIntensity } from "../transitIntensity";

// ---------- Constants ----------

/** How far to scan for each planet's transit window (days) */
const SCAN_RANGE: Record<string, number> = {
  Moon: 4, Sun: 30, Mercury: 40, Venus: 40, Mars: 60,
  Jupiter: 200, Saturn: 300, Uranus: 400, Neptune: 400, Pluto: 400,
};

const PLANET_WEIGHT: Record<string, number> = {
  Pluto: 10, Neptune: 9, Uranus: 8, Saturn: 7,
  Jupiter: 6, Mars: 5, Venus: 4, Mercury: 3,
  Sun: 2, Moon: 1,
};

// ---------- Types ----------

interface NatalPlanet {
  name: string;
  sign: string;
  absPosition: number;
  house?: number | null;
  [key: string]: unknown;
}

interface HouseEntry {
  number: number;
  sign: string;
  absPosition: number;
  [key: string]: unknown;
}

interface TransitInput {
  natalPlanets: NatalPlanet[];
  natalHouses?: HouseEntry[];
  transitDate: string;        // "YYYY-MM-DD"
  latitude?: number;
  longitude?: number;
  zodiacSystem?: "tropical" | "sidereal";
  ayanamsa?: string;
}

interface TransitPlanet {
  name: string;
  sign: string;
  signNum: number;
  position: number;
  absPosition: number;
  retrograde: boolean;
}

interface TransitAspect {
  transitPlanet: string;
  transitSign: string;
  transitRetrograde: boolean;
  natalPlanet: string;
  natalSign: string;
  natalHouse: number | null;
  transitHouse: number;
  aspect: string;
  orb: number;
  startDate?: string;
  exactDate?: string;
  endDate?: string;
}

// ---------- Transit window scanner ----------

function findTransitWindow(
  planetName: string,
  natalAbs: number,
  aspectDeg: number,
  maxOrb: number,
  todayJd: number,
  ayanamsaOffset: number = 0,
): { startDate: string; exactDate: string; endDate: string } | null {
  const planetId = PLANETS[planetName as PlanetName];
  if (planetId === undefined) return null;

  const scan = SCAN_RANGE[planetName] ?? 120;

  function orbAt(jd: number): number {
    let lon = getPlanetLongitude(jd, planetId);
    if (ayanamsaOffset) {
      lon = ((lon - ayanamsaOffset) % 360 + 360) % 360;
    }
    return Math.abs(angleDiff(lon, natalAbs) - aspectDeg);
  }

  // Scan backward to find when aspect entered orb
  let startJd = todayJd;
  for (let d = 1; d <= scan; d++) {
    const jd = todayJd - d;
    if (orbAt(jd) > maxOrb) {
      startJd = jd + 1;
      break;
    }
    if (d === scan) {
      startJd = todayJd - scan;
    }
  }

  // Scan forward to find when aspect leaves orb
  let endJd = todayJd;
  for (let d = 1; d <= scan; d++) {
    const jd = todayJd + d;
    if (orbAt(jd) > maxOrb) {
      endJd = jd - 1;
      break;
    }
    if (d === scan) {
      endJd = todayJd + scan;
    }
  }

  // Find exact date (minimum orb) — coarse pass
  let bestJd = todayJd;
  let bestOrb = orbAt(todayJd);
  const step = Math.max(1, Math.floor((endJd - startJd) / 120));
  for (let jd = startJd; jd <= endJd; jd += step) {
    const o = orbAt(jd);
    if (o < bestOrb) {
      bestOrb = o;
      bestJd = jd;
    }
  }

  // Refine around bestJd with 0.5-day steps
  for (let i = -20; i <= 20; i++) {
    const jd = bestJd + i * 0.5;
    if (jd < startJd || jd > endJd) continue;
    const o = orbAt(jd);
    if (o < bestOrb) {
      bestOrb = o;
      bestJd = jd;
    }
  }

  return {
    startDate: jdToDateStr(startJd),
    exactDate: jdToDateStr(bestJd),
    endDate: jdToDateStr(endJd),
  };
}

// ---------- House lookup ----------

function getTransitHouse(absPos: number, cuspPositions: number[]): number {
  if (cuspPositions.length === 0) return 0;
  for (let i = 0; i < 12; i++) {
    const nextI = (i + 1) % 12;
    const start = cuspPositions[i];
    const end = cuspPositions[nextI];
    if (start < end) {
      if (absPos >= start && absPos < end) return i + 1;
    } else {
      if (absPos >= start || absPos < end) return i + 1;
    }
  }
  return 1;
}

// ---------- Main export ----------

export function calculateTransits(data: TransitInput) {
  const natalPlanets = data.natalPlanets;
  const natalHouses = data.natalHouses || [];
  const transitDate = data.transitDate;
  // Note: data.latitude/longitude are accepted for API compatibility but transit
  // positions are location-independent; no coordinate fallback is needed here.

  const zodiacSystem = data.zodiacSystem || "tropical";
  const ayanamsaName = data.ayanamsa || "lahiri";
  const isSidereal = zodiacSystem === "sidereal";
  const ayanamsaOffset = isSidereal ? (AYANAMSA_VALUES[ayanamsaName] ?? 24.17) : 0;

  // Parse transit date
  const [year, month, day] = transitDate.split("-").map(Number);
  const jd = julday(year, month, day, 12); // noon

  // Calculate transiting planet positions using Swiss Ephemeris
  const transitPlanetNames: PlanetName[] = [
    "Sun", "Moon", "Mercury", "Venus", "Mars",
    "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto",
  ];

  const transitPlanets: TransitPlanet[] = [];
  for (const pname of transitPlanetNames) {
    const planetData = getPlanetData(jd, PLANETS[pname]);
    const tropicalAbs = Math.round(planetData.longitude * 100) / 100;

    if (isSidereal) {
      const sid = applySidereal(tropicalAbs, ayanamsaOffset);
      transitPlanets.push({
        name: pname,
        sign: sid.sign,
        signNum: sid.signNum,
        position: sid.position,
        absPosition: sid.absPosition,
        retrograde: planetData.retrograde,
      });
    } else {
      const info = posToSign(tropicalAbs);
      transitPlanets.push({
        name: pname,
        sign: info.sign,
        signNum: info.signNum,
        position: info.position,
        absPosition: info.absPosition,
        retrograde: planetData.retrograde,
      });
    }
  }

  // House cusp positions for transit house lookup
  const houseCusps = [...natalHouses].sort((a, b) => (a.number || 0) - (b.number || 0));
  const cuspPositions = houseCusps.map((h) => h.absPosition);

  // Find all transit-to-natal aspects
  const transitAspects: TransitAspect[] = [];
  for (const tp of transitPlanets) {
    const tHouse = getTransitHouse(tp.absPosition, cuspPositions);

    for (const np of natalPlanets) {
      const result = findAspect(tp.absPosition, np.absPosition, ASPECTS_WITH_QUINCUNX);
      if (result) {
        const [aspectName, orb] = result;
        transitAspects.push({
          transitPlanet: tp.name,
          transitSign: tp.sign,
          transitRetrograde: tp.retrograde,
          natalPlanet: np.name,
          natalSign: np.sign,
          natalHouse: np.house ?? null,
          transitHouse: tHouse,
          aspect: aspectName,
          orb,
        });
      }
    }
  }

  // Sort by full intensity score (planet weight × aspect type × orb × natal weight × retrograde)
  transitAspects.sort(
    (a, b) => getTransitIntensity(b).score - getTransitIntensity(a).score,
  );

  // Compute date windows for each aspect
  const todayJd = jd;
  const aspectOrbMap = new Map(ASPECTS_WITH_QUINCUNX.map(([name, , maxOrb]) => [name, maxOrb]));

  for (const ta of transitAspects) {
    const natalPoint = natalPlanets.find((np) => np.name === ta.natalPlanet);
    if (!natalPoint) continue;

    const natalAbs = natalPoint.absPosition;
    const aspectDeg = ASPECTS_WITH_QUINCUNX.find(([name]) => name === ta.aspect)?.[1];
    if (aspectDeg === undefined) continue;

    const maxOrbForAspect = aspectOrbMap.get(ta.aspect) ?? 8;
    const window = findTransitWindow(
      ta.transitPlanet,
      natalAbs,
      aspectDeg,
      maxOrbForAspect,
      todayJd,
      ayanamsaOffset,
    );
    if (window) {
      ta.startDate = window.startDate;
      ta.exactDate = window.exactDate;
      ta.endDate = window.endDate;
    }
  }

  const result: Record<string, unknown> = {
    transitDate,
    transitPlanets,
    transitAspects,
    zodiacSystem,
  };

  if (isSidereal) {
    result.ayanamsa = ayanamsaName;
  }

  return result;
}
