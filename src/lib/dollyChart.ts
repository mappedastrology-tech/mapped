import { chartSystemFromRow, type ChartSystemRow } from "@/lib/astro/vedic/system";

/**
 * The chart Dolly is sent, built from the user's saved `charts` row.
 *
 * One mapping for both Dolly screens. The mobile tab and the desktop
 * WebDolly each had their own copy of this, and the desktop one had drifted
 * into reading whatever sessionStorage held first — see WebDolly for what
 * that cost. The route only writes a "Birth Chart" section when `bigThree`
 * is present (buildChartSummary in api/dolly/route.ts), so that field is the
 * one that decides whether Dolly can see the chart at all.
 */
export interface DollyChart {
  bigThree?: { sun: string; moon: string; rising: string };
  planets: unknown[];
  houses: unknown[];
  specialPoints: unknown[];
  birthDate?: string;
  birthTime?: string;
  ascendant: unknown;
  midheaven: unknown;
  zodiacSystem: string;
  ayanamsa: string;
  houseSystem: string;
  nodeType: string;
}

export interface SavedChartRow extends ChartSystemRow {
  big_three?: { sun: string; moon: string; rising: string } | null;
  planets?: unknown[] | null;
  houses?: unknown[] | null;
  special_points?: unknown[] | null;
  birth_date?: string | null;
  birth_time?: string | null;
  ascendant?: unknown;
  midheaven?: unknown;
}

export function dollyChartFromRow(row: SavedChartRow): DollyChart {
  return {
    bigThree: row.big_three ?? undefined,
    planets: row.planets || [],
    houses: row.houses || [],
    specialPoints: row.special_points || [],
    birthDate: row.birth_date ?? undefined,
    birthTime: row.birth_time ?? undefined,
    ascendant: row.ascendant || null,
    midheaven: row.midheaven || null,
    ...chartSystemFromRow(row),
  };
}
