/**
 * Composite chart calculator — TypeScript port of calculate_composite.py.
 *
 * A composite chart is the "relationship chart" — the midpoint of two people's
 * natal charts. Each composite planet = midpoint of Person A's planet and
 * Person B's planet. It represents the relationship itself as a third entity.
 *
 * Pure math — no ephemeris needed.
 */

import {
  ASPECTS_WITH_QUINCUNX,
  midpoint,
  posToSign,
  angleDiff,
  findAspect,
  assignHouse,
} from "./constants";

// ---------- Types ----------

interface ChartPoint {
  name: string;
  sign: string;
  signNum: number;
  position: number;
  absPosition: number;
  house?: number | null;
  retrograde?: boolean;
  [key: string]: unknown;
}

interface HouseData {
  number: number;
  sign: string;
  signNum: number;
  position: number;
  absPosition: number;
}

interface ChartData {
  planets: ChartPoint[];
  houses?: HouseData[];
  specialPoints?: ChartPoint[];
}

interface CompositeInput {
  chart1: ChartData;
  chart2: ChartData;
}

interface CompositePoint {
  name: string;
  sign: string;
  signNum: number;
  position: number;
  absPosition: number;
  house: number | null;
  retrograde: boolean;
}

interface CompositeAspect {
  p1Name: string;
  p2Name: string;
  aspect: string;
  orbit: number;
}

// ---------- Main export ----------

export function calculateComposite(data: CompositeInput) {
  const { chart1, chart2 } = data;

  // -- Composite planets --
  const planets1 = new Map((chart1.planets || []).map((p) => [p.name, p]));
  const planets2 = new Map((chart2.planets || []).map((p) => [p.name, p]));

  const PLANET_NAMES = [
    "Sun", "Moon", "Mercury", "Venus", "Mars",
    "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto",
  ];

  const compositePlanets: CompositePoint[] = [];
  for (const name of PLANET_NAMES) {
    const p1 = planets1.get(name);
    const p2 = planets2.get(name);
    if (p1 && p2) {
      const mid = midpoint(p1.absPosition, p2.absPosition);
      const info = posToSign(mid);
      compositePlanets.push({
        name,
        ...info,
        house: null,
        retrograde: false,
      });
    }
  }

  // -- Composite houses --
  const houses1 = new Map((chart1.houses || []).map((h) => [h.number, h]));
  const houses2 = new Map((chart2.houses || []).map((h) => [h.number, h]));

  const compositeHouses: HouseData[] = [];
  for (let num = 1; num <= 12; num++) {
    const h1 = houses1.get(num);
    const h2 = houses2.get(num);
    if (h1 && h2) {
      const mid = midpoint(h1.absPosition, h2.absPosition);
      const info = posToSign(mid);
      compositeHouses.push({
        number: num,
        ...info,
      });
    }
  }

  // -- Assign houses to planets --
  if (compositeHouses.length > 0) {
    const sortedHouses = [...compositeHouses].sort((a, b) => a.number - b.number);
    for (const planet of compositePlanets) {
      planet.house = assignHouse(planet.absPosition, sortedHouses);
    }
  }

  // -- Composite special points --
  const sp1 = new Map((chart1.specialPoints || []).map((p) => [p.name, p]));
  const sp2 = new Map((chart2.specialPoints || []).map((p) => [p.name, p]));

  const compositeSpecial: CompositePoint[] = [];
  for (const name of ["Chiron", "North Node", "South Node"]) {
    const s1 = sp1.get(name);
    const s2 = sp2.get(name);
    if (s1 && s2) {
      const mid = midpoint(s1.absPosition, s2.absPosition);
      const info = posToSign(mid);
      const house = compositeHouses.length > 0
        ? assignHouse(mid, [...compositeHouses].sort((a, b) => a.number - b.number))
        : null;
      compositeSpecial.push({
        name,
        ...info,
        house,
        retrograde: false,
      });
    }
  }

  // -- Midheaven --
  let midheavenResult: { sign: string; signNum: number; position: number; absPosition: number } | null = null;
  if (compositeHouses.length > 0) {
    const h10 = compositeHouses.find((h) => h.number === 10);
    if (h10) {
      midheavenResult = {
        sign: h10.sign,
        signNum: h10.signNum,
        position: h10.position,
        absPosition: h10.absPosition,
      };
    }
  }

  // -- Big Three --
  const bigThree: Record<string, string> = {};
  const sunP = compositePlanets.find((p) => p.name === "Sun");
  const moonP = compositePlanets.find((p) => p.name === "Moon");
  if (sunP) bigThree.sun = sunP.sign;
  if (moonP) bigThree.moon = moonP.sign;
  if (compositeHouses.length > 0) {
    bigThree.rising = compositeHouses[0].sign;
  }

  // -- Aspects between composite planets --
  const allBodies = [...compositePlanets, ...compositeSpecial];
  const aspects: CompositeAspect[] = [];
  for (let i = 0; i < allBodies.length; i++) {
    for (let j = i + 1; j < allBodies.length; j++) {
      const result = findAspect(
        allBodies[i].absPosition,
        allBodies[j].absPosition,
        ASPECTS_WITH_QUINCUNX,
      );
      if (result) {
        const [aspectName, orb] = result;
        aspects.push({
          p1Name: allBodies[i].name,
          p2Name: allBodies[j].name,
          aspect: aspectName,
          orbit: orb,
        });
      }
    }
  }
  aspects.sort((a, b) => a.orbit - b.orbit);

  return {
    bigThree,
    planets: compositePlanets,
    houses: compositeHouses,
    specialPoints: compositeSpecial,
    midheaven: midheavenResult,
    aspects: aspects.slice(0, 25),
  };
}
