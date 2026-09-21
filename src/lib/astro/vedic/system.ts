/**
 * The chart's "system": zodiac, ayanamsa, house system and node type.
 *
 * ONE RULE: a chart row describes itself. `charts.zodiac_system` (etc.) is
 * what its stored positions were calculated in, and anything that compares
 * something against those positions — transits, Dolly, the horoscope, pushes —
 * must use that same system. Read it with chartSystemFromRow() and pass
 * transitParams() to /api/transits; never hard-code "tropical".
 *
 * The user's preference lives on `profiles`; changing it recalculates and
 * re-saves the chart rows (see lib/chartSystemSync.ts), so rows and preference
 * agree.
 */

import { AYANAMSA_LABELS, formatDegreesMinutes, normalizeAyanamsa, type AyanamsaName } from "./ayanamsa";
import { HOUSE_SYSTEM_LABELS, normalizeHouseSystem, type HouseSystem } from "./houses";
import { normalizeNodeType, type NodeType } from "./nodes";
import { nakshatraOf } from "./nakshatra";

export type ZodiacSystem = "tropical" | "sidereal";

export interface ChartSystem {
  zodiacSystem: ZodiacSystem;
  ayanamsa: AyanamsaName;
  houseSystem: HouseSystem;
  nodeType: NodeType;
}

export interface ChartSystemRow {
  zodiac_system?: string | null;
  ayanamsa?: string | null;
  house_system?: string | null;
  node_type?: string | null;
}

export interface ChartSystemCamel {
  zodiacSystem?: string | null;
  ayanamsa?: string | null;
  houseSystem?: string | null;
  nodeType?: string | null;
}

function build(z: unknown, a: unknown, h: unknown, n: unknown): ChartSystem {
  const zodiacSystem: ZodiacSystem = z === "sidereal" ? "sidereal" : "tropical";
  return {
    zodiacSystem,
    ayanamsa: normalizeAyanamsa(a),
    houseSystem: normalizeHouseSystem(h, zodiacSystem),
    nodeType: normalizeNodeType(n),
  };
}

/** From a snake_case database row (charts, connections, profiles). */
export function chartSystemFromRow(row: ChartSystemRow | null | undefined): ChartSystem {
  return build(row?.zodiac_system, row?.ayanamsa, row?.house_system, row?.node_type);
}

/** From a camelCase chart object (calculateChart output, sessionStorage copies, API bodies). */
export function chartSystemFromChart(chart: ChartSystemCamel | null | undefined): ChartSystem {
  return build(chart?.zodiacSystem, chart?.ayanamsa, chart?.houseSystem, chart?.nodeType);
}

/** The fields /api/transits and calculateTransits need. */
export function transitParams(sys: ChartSystem): { zodiacSystem: ZodiacSystem; ayanamsa: AyanamsaName } {
  return { zodiacSystem: sys.zodiacSystem, ayanamsa: sys.ayanamsa };
}

/** The fields calculateChart needs. */
export function chartCalcParams(sys: ChartSystem) {
  return {
    zodiacSystem: sys.zodiacSystem,
    ayanamsa: sys.ayanamsa,
    houseSystem: sys.houseSystem,
    nodeType: sys.nodeType,
  };
}

/** "Sidereal · Lahiri · Whole sign" / "Tropical · Placidus" — for the chart screen. */
export function chartSystemLabel(sys: ChartSystem): string {
  const parts: string[] = sys.zodiacSystem === "sidereal"
    ? ["Sidereal", AYANAMSA_LABELS[sys.ayanamsa]]
    : ["Tropical"];
  parts.push(HOUSE_SYSTEM_LABELS[sys.houseSystem]);
  return parts.join(" · ");
}

/**
 * Context block for model prompts (Dolly, horoscope, journal, rituals).
 * Factual framing only — it tells the model which zodiac the numbers are in so
 * it doesn't mix systems. It does not change Dolly's voice or boundaries.
 */
export function chartSystemPromptBlock(sys: ChartSystem, extras?: { ayanamsaDegrees?: number; moonNakshatra?: string }): string {
  if (sys.zodiacSystem === "tropical") {
    return [
      "## Zodiac system",
      `This chart uses the TROPICAL (Western) zodiac with ${HOUSE_SYSTEM_LABELS[sys.houseSystem]} houses. All natal and transit positions below are tropical.`,
    ].join("\n");
  }
  const aya = AYANAMSA_LABELS[sys.ayanamsa];
  const ayaDeg = extras?.ayanamsaDegrees != null ? ` (${formatDegreesMinutes(extras.ayanamsaDegrees)} at birth)` : "";
  const lines = [
    "## Zodiac system",
    `This chart is SIDEREAL (Vedic / Jyotish): ${aya} ayanamsa${ayaDeg}, ${HOUSE_SYSTEM_LABELS[sys.houseSystem].toLowerCase()} houses, ${sys.nodeType} lunar nodes (Rahu = North Node, Ketu = South Node).`,
    "Every natal AND transit position in this context is sidereal, each already corrected for the ayanamsa at its own moment.",
    "Read it as a sidereal chart: never convert placements to tropical, never describe signs by tropical calendar dates or \"zodiac season\", and don't mix in the tropical placements the person may know from Western apps. If they ask why their signs differ from a Western app, explain plainly that the sidereal zodiac sits about 24° behind the tropical one, so most placements shift back a sign.",
  ];
  if (extras?.moonNakshatra) lines.push(`Moon's birth nakshatra: ${extras.moonNakshatra}.`);
  return lines.join("\n");
}

const SIGN_ABBRS = ["Ari", "Tau", "Gem", "Can", "Leo", "Vir", "Lib", "Sco", "Sag", "Cap", "Aqu", "Pis"];

/**
 * Prompt block straight from a chart object as the API routes receive it.
 * For sidereal charts it also names the Moon's birth nakshatra and pada.
 */
export function chartSystemContext(
  chart: (ChartSystemCamel & {
    planets?: { name: string; sign: string; position?: number }[] | null;
    ayanamsaDegrees?: number | null;
  }) | null | undefined,
): string {
  const sys = chartSystemFromChart(chart);
  let moonNakshatra: string | undefined;
  if (sys.zodiacSystem === "sidereal") {
    const moon = chart?.planets?.find((p) => p.name === "Moon");
    const signIdx = moon ? SIGN_ABBRS.indexOf(moon.sign?.slice(0, 3)) : -1;
    if (moon && signIdx >= 0 && typeof moon.position === "number") {
      const n = nakshatraOf(signIdx * 30 + (moon.position as number));
      moonNakshatra = `${n.name}, pada ${n.pada} (lord ${n.lord})`;
    }
  }
  return chartSystemPromptBlock(sys, { ayanamsaDegrees: chart?.ayanamsaDegrees ?? undefined, moonNakshatra });
}
