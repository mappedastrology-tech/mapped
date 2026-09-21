/**
 * The Vedic layer of a sidereal chart: the graha table with nakshatra, pada,
 * nakshatra lord and navamsa for every body and the Ascendant.
 *
 * calculateChart() builds this from UNROUNDED sidereal longitudes and attaches
 * it as `chart.vedic`. It is derived data — never stored in the database — so
 * the chart screen recomputes it whenever it recalculates the chart.
 */

import { posToSign } from "../constants";
import { AYANAMSA_LABELS, type AyanamsaName } from "./ayanamsa";
import { nakshatraOf, type Graha } from "./nakshatra";
import { navamsaOf } from "./varga";
import type { HouseSystem } from "./houses";
import type { NodeType } from "./nodes";

/** The nine grahas of Jyotish, in the traditional listing order. */
export const GRAHA_ORDER: Graha[] = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"];

/** Uranus, Neptune, Pluto: not grahas; shown for reference, visually secondary. */
export const OUTER_PLANETS = ["Uranus", "Neptune", "Pluto"] as const;

export interface VedicBody {
  name: string;
  /** false for Uranus/Neptune/Pluto (and the Ascendant row). */
  isGraha: boolean;
  sign: string;
  signNum: number;
  position: number;
  absPosition: number;
  house: number | null;
  retrograde: boolean;
  nakshatra: string;
  pada: number;
  nakshatraLord: Graha;
  navamsaSign: string;
}

export interface VedicDetails {
  ayanamsa: AyanamsaName;
  ayanamsaLabel: string;
  /** True ayanamsa at the birth instant, degrees. */
  ayanamsaDegrees: number;
  houseSystem: HouseSystem;
  nodeType: NodeType;
  ascendant: VedicBody | null;
  grahas: VedicBody[];
  outerPlanets: VedicBody[];
  /** Unrounded sidereal Moon at birth — the input to the Vimshottari dasha. */
  moonLongitude: number;
  /** Birth instant in UTC, ISO string. */
  birthUtc: string;
  /** With an unknown birth time the Ascendant is omitted and dashas are unreliable. */
  unknownTime: boolean;
}

export interface VedicInputBody {
  name: string;
  /** Sidereal longitude, unrounded. */
  longitude: number;
  retrograde: boolean;
  house: number | null;
}

function describe(name: string, lon: number, retrograde: boolean, house: number | null, isGraha: boolean): VedicBody {
  const s = posToSign(lon);
  const n = nakshatraOf(lon);
  return {
    name,
    isGraha,
    sign: s.sign,
    signNum: s.signNum,
    position: s.position,
    absPosition: s.absPosition,
    house,
    retrograde,
    nakshatra: n.name,
    pada: n.pada,
    nakshatraLord: n.lord,
    navamsaSign: navamsaOf(lon).sign,
  };
}

export function buildVedicDetails(input: {
  bodies: VedicInputBody[];          // Sun..Pluto plus "North Node"/"South Node"
  ascendantLongitude: number | null; // sidereal, null when birth time unknown
  ayanamsa: AyanamsaName;
  ayanamsaDegrees: number;
  houseSystem: HouseSystem;
  nodeType: NodeType;
  birthUtc: Date;
  unknownTime: boolean;
}): VedicDetails {
  const byName = new Map(input.bodies.map((b) => [b.name, b]));
  // Rahu/Ketu are the North/South nodes under their Jyotish names.
  const alias: Record<string, string> = { Rahu: "North Node", Ketu: "South Node" };

  const grahas: VedicBody[] = [];
  for (const g of GRAHA_ORDER) {
    const b = byName.get(alias[g] ?? g);
    if (!b) continue;
    // The nodes are always treated as retrograde in Jyotish (mean node motion).
    const retro = g === "Rahu" || g === "Ketu" ? true : b.retrograde;
    grahas.push(describe(g, b.longitude, retro, b.house, true));
  }

  const outerPlanets: VedicBody[] = [];
  for (const o of OUTER_PLANETS) {
    const b = byName.get(o);
    if (b) outerPlanets.push(describe(o, b.longitude, b.retrograde, b.house, false));
  }

  const moon = byName.get("Moon");
  return {
    ayanamsa: input.ayanamsa,
    ayanamsaLabel: AYANAMSA_LABELS[input.ayanamsa],
    ayanamsaDegrees: input.ayanamsaDegrees,
    houseSystem: input.houseSystem,
    nodeType: input.nodeType,
    ascendant: input.ascendantLongitude == null ? null : describe("Ascendant", input.ascendantLongitude, false, 1, false),
    grahas,
    outerPlanets,
    moonLongitude: moon ? moon.longitude : 0,
    birthUtc: input.birthUtc.toISOString(),
    unknownTime: input.unknownTime,
  };
}
