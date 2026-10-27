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

/**
 * How far either side of today to look for a transit's start and end (days).
 * Generous for the slow planets: Pluto can sit inside an 8° orb for a decade,
 * and a scan that stops short reports the edge of its own scan as the end of
 * the transit, which is a fabricated date. If a boundary is still not found
 * inside this range we report no window at all rather than guess.
 */
const SCAN_RANGE: Record<string, number> = {
  Moon: 5, Sun: 40, Mercury: 70, Venus: 70, Mars: 140,
  Jupiter: 500, Saturn: 900, Uranus: 1600, Neptune: 2600, Pluto: 3400,
};

/**
 * Coarse step used while hunting for a boundary (days). Sized so each step
 * moves the planet a fraction of a degree; the boundary is then pinned down by
 * bisection, so a large step costs accuracy nothing and saves thousands of
 * ephemeris lookups.
 */
const SCAN_STEP: Record<string, number> = {
  Moon: 0.25, Sun: 1, Mercury: 1, Venus: 1, Mars: 2,
  Jupiter: 4, Saturn: 6, Uranus: 10, Neptune: 14, Pluto: 16,
};

/**
 * The Moon aspects every natal point every month and holds each aspect for a
 * few hours. Listing those alongside a two-year Pluto transit is noise, so the
 * Moon is not treated as a transiting body here. (The live Moon position is
 * surfaced separately, in the current-sky view.)
 */
const TRANSITING_BODIES: PlanetName[] = [
  "Sun", "Mercury", "Venus", "Mars",
  "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto",
];

/** Planets slow enough that an aspect to them is a period of time, not a day. */
const SLOW_PLANETS = new Set(["Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"]);

/**
 * Fast movers get half the usual orb. An 8° Mars conjunction is three weeks of
 * "something may be about to happen"; 4° is the part you actually feel.
 */
const FAST_ORB_FACTOR = 0.5;

/**
 * Aspects this weak are below the threshold of being noticeable at all. The
 * floor only removes what the intensity model already scores as nothing.
 */
const MIN_INTENSITY = 6;

/**
 * Two natal points this close are one piece of sky. A transit crossing them
 * makes the same aspect to each and reads as three near-identical rows, so the
 * strongest is kept and the rest are folded into it.
 */
const CLUSTER_ORB = 10;

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
  /**
   * Other natal points in the same patch of sky that this transit hits with
   * the same aspect, folded in so one event is one row.
   */
  alsoNatal?: string[];
  startDate?: string;
  exactDate?: string;
  endDate?: string;
}

// ---------- Transit window scanner ----------

/**
 * Find the stretch of time the aspect is inside orb, plus the date it is
 * closest to exact.
 *
 * Walks outward from today in coarse steps until the aspect falls out of orb,
 * then bisects to pin the crossing to within a quarter of a day. Returns null
 * if either boundary lies beyond the planet's scan range — an unknown date is
 * better left blank than filled in with the edge of the scan.
 */
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

  const range = SCAN_RANGE[planetName] ?? 200;
  const step = SCAN_STEP[planetName] ?? 2;

  function orbAt(jd: number): number {
    let lon = getPlanetLongitude(jd, planetId);
    if (ayanamsaOffset) {
      lon = ((lon - ayanamsaOffset) % 360 + 360) % 360;
    }
    return Math.abs(angleDiff(lon, natalAbs) - aspectDeg);
  }

  /**
   * Walk in `dir` (+1 forward, -1 back) until the aspect leaves orb, then
   * bisect between the last day inside and the first day outside.
   * Null means it never left orb within range.
   */
  function boundary(dir: 1 | -1): number | null {
    let inside = todayJd;
    for (let d = step; d <= range; d += step) {
      const jd = todayJd + dir * d;
      if (orbAt(jd) > maxOrb) {
        // Bisect between `inside` (in orb) and `jd` (out of orb).
        let lo = inside;
        let hi = jd;
        while (Math.abs(hi - lo) > 0.25) {
          const mid = (lo + hi) / 2;
          if (orbAt(mid) > maxOrb) hi = mid;
          else lo = mid;
        }
        return lo;
      }
      inside = jd;
    }
    return null;
  }

  const startJd = boundary(-1);
  const endJd = boundary(1);
  if (startJd === null || endJd === null) return null;

  // Closest approach: coarse sweep across the window, then refine around the
  // best sample. Retrograde loops can produce several near-equal passes; the
  // global minimum is the one reported.
  let bestJd = todayJd;
  let bestOrb = orbAt(todayJd);
  const sweep = Math.max(0.25, Math.min(step, (endJd - startJd) / 200));
  for (let jd = startJd; jd <= endJd; jd += sweep) {
    const o = orbAt(jd);
    if (o < bestOrb) {
      bestOrb = o;
      bestJd = jd;
    }
  }
  for (let jd = bestJd - sweep; jd <= bestJd + sweep; jd += 0.25) {
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
  const transitPlanets: TransitPlanet[] = [];
  for (const pname of TRANSITING_BODIES) {
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

  const aspectOrbMap = new Map(ASPECTS_WITH_QUINCUNX.map(([name, , maxOrb]) => [name, maxOrb]));

  /**
   * Whether an aspect is worth showing at all. Every rule here exists to cut a
   * specific kind of noise rather than to rank what survives.
   */
  function isMeaningful(
    transitPlanet: string,
    natalPlanet: string,
    aspect: string,
    orb: number,
  ): boolean {
    const slow = SLOW_PLANETS.has(transitPlanet);
    const maxOrb = aspectOrbMap.get(aspect) ?? 8;

    // Fast movers only count while the aspect is genuinely close.
    if (!slow && orb > maxOrb * FAST_ORB_FACTOR) return false;

    // The quincunx is a minor aspect; from a fast planet it is a day of static.
    if (aspect === "quincunx" && !slow) return false;

    // A planet returning to its own natal place matters at the turning points
    // of its cycle — the return, the opposition, the squares. Transiting
    // Mercury 150° from natal Mercury is not an event.
    if (transitPlanet === natalPlanet) {
      const cyclePoint = aspect === "conjunction" || aspect === "opposition" || aspect === "square";
      if (!cyclePoint) return false;
      if (transitPlanet === "Sun" || transitPlanet === "Mercury" || transitPlanet === "Venus") {
        return aspect === "conjunction";
      }
    }

    return true;
  }

  // Find transit-to-natal aspects worth showing
  const transitAspects: TransitAspect[] = [];
  for (const tp of transitPlanets) {
    const tHouse = getTransitHouse(tp.absPosition, cuspPositions);

    for (const np of natalPlanets) {
      const result = findAspect(tp.absPosition, np.absPosition, ASPECTS_WITH_QUINCUNX);
      if (!result) continue;

      const [aspectName, orb] = result;
      if (!isMeaningful(tp.name, np.name, aspectName, orb)) continue;

      const candidate: TransitAspect = {
        transitPlanet: tp.name,
        transitSign: tp.sign,
        transitRetrograde: tp.retrograde,
        natalPlanet: np.name,
        natalSign: np.sign,
        natalHouse: np.house ?? null,
        transitHouse: tHouse,
        aspect: aspectName,
        orb,
      };

      if (getTransitIntensity(candidate).score < MIN_INTENSITY) continue;
      transitAspects.push(candidate);
    }
  }

  // Sort by full intensity score (planet weight × aspect type × orb × natal weight × retrograde)
  transitAspects.sort(
    (a, b) => getTransitIntensity(b).score - getTransitIntensity(a).score,
  );

  // Collapse a transit that crosses a natal cluster into a single entry. One
  // pass of Saturn over a Venus–Mars–Jupiter conjunction is one thing
  // happening, not three. Sorted order means the strongest row is the keeper.
  const natalAbsByName = new Map(natalPlanets.map((np) => [np.name, np.absPosition]));
  const merged: TransitAspect[] = [];
  for (const ta of transitAspects) {
    const abs = natalAbsByName.get(ta.natalPlanet);
    const host = abs === undefined ? undefined : merged.find((k) => {
      if (k.transitPlanet !== ta.transitPlanet || k.aspect !== ta.aspect) return false;
      const kAbs = natalAbsByName.get(k.natalPlanet);
      return kAbs !== undefined && angleDiff(abs, kAbs) <= CLUSTER_ORB;
    });

    if (host) {
      host.alsoNatal = [...(host.alsoNatal ?? []), ta.natalPlanet];
    } else {
      merged.push(ta);
    }
  }

  // Compute date windows for what survived
  const todayJd = jd;
  for (const ta of merged) {
    const natalAbs = natalAbsByName.get(ta.natalPlanet);
    if (natalAbs === undefined) continue;

    const aspectDeg = ASPECTS_WITH_QUINCUNX.find(([name]) => name === ta.aspect)?.[1];
    if (aspectDeg === undefined) continue;

    const window = findTransitWindow(
      ta.transitPlanet,
      natalAbs,
      aspectDeg,
      aspectOrbMap.get(ta.aspect) ?? 8,
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
    transitAspects: merged,
    zodiacSystem,
  };

  if (isSidereal) {
    result.ayanamsa = ayanamsaName;
  }

  return result;
}
