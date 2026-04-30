/**
 * Swiss Ephemeris wrapper for Node.js.
 *
 * Uses the `swisseph` npm package (Node.js C bindings to Swiss Ephemeris).
 * Runs on Vercel serverless functions (Node.js runtime, NOT edge).
 *
 * Uses the built-in Moshier analytical ephemeris — no external data files needed.
 * Accuracy: within a few arcseconds, which is more than sufficient for astrology.
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const swe = require("swisseph");

// Planet IDs from Swiss Ephemeris
export const PLANETS = {
  Sun: swe.SE_SUN,
  Moon: swe.SE_MOON,
  Mercury: swe.SE_MERCURY,
  Venus: swe.SE_VENUS,
  Mars: swe.SE_MARS,
  Jupiter: swe.SE_JUPITER,
  Saturn: swe.SE_SATURN,
  Uranus: swe.SE_URANUS,
  Neptune: swe.SE_NEPTUNE,
  Pluto: swe.SE_PLUTO,
  Chiron: swe.SE_CHIRON,
  "North Node": swe.SE_MEAN_NODE,  // Mean lunar node
} as const;

export type PlanetName = keyof typeof PLANETS;

/** Compute Julian Day from calendar date. hour is decimal (e.g. 14.5 = 2:30 PM) */
export function julday(year: number, month: number, day: number, hour: number = 12): number {
  return swe.swe_julday(year, month, day, hour, swe.SE_GREG_CAL);
}

/** Convert Julian Day back to calendar date. */
export function revjul(jd: number): { year: number; month: number; day: number; hour: number } {
  const result = swe.swe_revjul(jd, swe.SE_GREG_CAL);
  return {
    year: result.year,
    month: result.month,
    day: result.day,
    hour: result.hour,
  };
}

/** Format Julian Day as "YYYY-MM-DD" string. */
export function jdToDateStr(jd: number): string {
  const { year, month, day } = revjul(jd);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/**
 * Get ecliptic longitude of a planet at a given Julian Day.
 * Uses Moshier ephemeris (no external files needed).
 */
export function getPlanetLongitude(jd: number, planetId: number): number {
  const flags = swe.SEFLG_SWIEPH | swe.SEFLG_SPEED;
  const result = swe.swe_calc_ut(jd, planetId, flags);
  if (result.error) {
    // Fallback to Moshier if Swiss Ephemeris files not found
    const moshier = swe.swe_calc_ut(jd, planetId, swe.SEFLG_MOSEPH | swe.SEFLG_SPEED);
    return moshier.longitude;
  }
  return result.longitude;
}

/**
 * Get full planet data: longitude, latitude, distance, speed.
 */
export function getPlanetData(jd: number, planetId: number): {
  longitude: number;
  latitude: number;
  distance: number;
  longitudeSpeed: number;
  retrograde: boolean;
} {
  const flags = swe.SEFLG_SWIEPH | swe.SEFLG_SPEED;
  let result = swe.swe_calc_ut(jd, planetId, flags);
  if (result.error) {
    result = swe.swe_calc_ut(jd, planetId, swe.SEFLG_MOSEPH | swe.SEFLG_SPEED);
  }
  return {
    longitude: result.longitude,
    latitude: result.latitude,
    distance: result.distance,
    longitudeSpeed: result.longitudeSpeed,
    retrograde: result.longitudeSpeed < 0,
  };
}

/**
 * Calculate house cusps and angles (ASC, MC, etc.) using Placidus system.
 */
export function getHouses(
  jd: number,
  latitude: number,
  longitude: number,
  system: string = "P" // P = Placidus
): {
  cusps: number[]; // 12 house cusp longitudes (index 0 = house 1)
  ascendant: number;
  mc: number;       // Midheaven
  armc: number;
  vertex: number;
} {
  const result = swe.swe_houses(jd, latitude, longitude, system);
  return {
    cusps: result.house.slice(1, 13), // swe_houses returns 1-indexed array (index 0 unused)
    ascendant: result.ascendant,
    mc: result.mc,
    armc: result.armc,
    vertex: result.vertex,
  };
}

/**
 * Calculate all planet positions for a given moment.
 * Returns array of planet data objects.
 */
export function getAllPlanetPositions(jd: number) {
  const planetNames: PlanetName[] = [
    "Sun", "Moon", "Mercury", "Venus", "Mars",
    "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto",
  ];

  return planetNames.map((name) => {
    const data = getPlanetData(jd, PLANETS[name]);
    return {
      name,
      longitude: Math.round(data.longitude * 100) / 100,
      retrograde: data.retrograde,
    };
  });
}

/**
 * Get special points: Chiron, North Node, South Node.
 */
export function getSpecialPoints(jd: number) {
  const chiron = getPlanetData(jd, PLANETS.Chiron);
  const northNode = getPlanetData(jd, PLANETS["North Node"]);

  // South Node is always opposite North Node
  const southNodeLon = (northNode.longitude + 180) % 360;

  return [
    {
      name: "Chiron" as const,
      longitude: Math.round(chiron.longitude * 100) / 100,
      retrograde: chiron.retrograde,
    },
    {
      name: "North Node" as const,
      longitude: Math.round(northNode.longitude * 100) / 100,
      retrograde: northNode.retrograde,
    },
    {
      name: "South Node" as const,
      longitude: Math.round(southNodeLon * 100) / 100,
      retrograde: !northNode.retrograde, // South Node retrogrades opposite
    },
  ];
}
