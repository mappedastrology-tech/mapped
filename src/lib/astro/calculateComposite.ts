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

// ---------- Houses ----------

/**
 * Composite house cusps that always form a wheel in order.
 *
 * Taking each cusp's shorter-arc midpoint on its own breaks whenever the two
 * charts' cusps are more than 180° apart for some houses but not others: one
 * cusp lands on the far side and the wheel comes out of order (e.g. 198°,
 * 226°, 77°…). Instead the composite MC is the NEAR midpoint of the two MCs
 * (the usual convention), and every other cusp is the midpoint taken on the
 * same side: both wheels are unrolled counter-clockwise from their MC, the
 * second shifted by 360° if needed so the MCs are within 180°, and averaged
 * house by house. An average of two increasing sequences is increasing, so the
 * cusps stay in order, span exactly 360°, and opposite cusps stay opposite.
 */
function compositeCusps(houses1: HouseData[], houses2: HouseData[]): HouseData[] {
  const byNum1 = new Map(houses1.map((h) => [h.number, h.absPosition]));
  const byNum2 = new Map(houses2.map((h) => [h.number, h.absPosition]));
  // House numbers in wheel order starting at the MC: 10, 11, 12, 1, … 9.
  const order = Array.from({ length: 12 }, (_, i) => ((9 + i) % 12) + 1);
  if (!order.every((n) => byNum1.has(n) && byNum2.has(n))) return [];

  const unroll = (byNum: Map<number, number>) => {
    const out: number[] = [];
    for (const n of order) {
      const pos = byNum.get(n)!;
      if (out.length === 0) out.push(pos);
      else {
        const prev = out[out.length - 1];
        out.push(prev + ((((pos - prev) % 360) + 360) % 360));
      }
    }
    return out;
  };
  const a = unroll(byNum1);
  const b = unroll(byNum2);
  const shift = a[0] - b[0] > 180 ? 360 : b[0] - a[0] > 180 ? -360 : 0;

  const result = order.map((number, i) => {
    const mid = ((((a[i] + b[i] + shift) / 2) % 360) + 360) % 360;
    return { number, ...posToSign(mid) };
  });
  return result.sort((x, y) => x.number - y.number);
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
  const compositeHouses = compositeCusps(chart1.houses || [], chart2.houses || []);

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
  // The South Node is always exactly opposite the North Node, so every aspect
  // to it restates one to the North Node (conjunct SN = opposite NN), and
  // "North Node opposition South Node, orb 0" is not an aspect at all. Aspect
  // the North Node only.
  const allBodies = [...compositePlanets, ...compositeSpecial].filter((b) => b.name !== "South Node");
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
