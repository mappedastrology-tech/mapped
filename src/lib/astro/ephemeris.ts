/**
 * Astronomy engine wrapper — pure JavaScript, no native modules.
 *
 * Uses `astronomy-engine` for planetary positions and implements
 * Placidus house calculations from standard astronomical formulas.
 *
 * Accuracy: sub-arcminute for all planets, sufficient for astrology.
 */

import * as Astronomy from "astronomy-engine";
import { getChironLongitude } from "./chironEphemeris";

// ─── Planet name mapping ───
export const PLANETS = {
  Sun: "Sun",
  Moon: "Moon",
  Mercury: "Mercury",
  Venus: "Venus",
  Mars: "Mars",
  Jupiter: "Jupiter",
  Saturn: "Saturn",
  Uranus: "Uranus",
  Neptune: "Neptune",
  Pluto: "Pluto",
  Chiron: "Chiron",       // Calculated separately
  "North Node": "NorthNode", // Calculated from lunar orbital elements
} as const;

export type PlanetName = keyof typeof PLANETS;

// Degrees ↔ radians
const DEG = Math.PI / 180;
const RAD = 180 / Math.PI;

// ─── Julian Day utilities ───

/** Compute Julian Day from calendar date. hour is decimal (e.g. 14.5 = 2:30 PM UTC) */
export function julday(year: number, month: number, day: number, hour: number = 12): number {
  // Standard Julian Day formula
  let y = year;
  let m = month;
  if (m <= 2) { y -= 1; m += 12; }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + hour / 24.0 + B - 1524.5;
}

/** Convert Julian Day back to calendar date. */
export function revjul(jd: number): { year: number; month: number; day: number; hour: number } {
  const z = Math.floor(jd + 0.5);
  const f = jd + 0.5 - z;
  let A: number;
  if (z < 2299161) { A = z; }
  else {
    const alpha = Math.floor((z - 1867216.25) / 36524.25);
    A = z + 1 + alpha - Math.floor(alpha / 4);
  }
  const B = A + 1524;
  const C = Math.floor((B - 122.1) / 365.25);
  const D = Math.floor(365.25 * C);
  const E = Math.floor((B - D) / 30.6001);
  const day = B - D - Math.floor(30.6001 * E);
  const month = E < 14 ? E - 1 : E - 13;
  const year = month > 2 ? C - 4716 : C - 4715;
  const hour = f * 24;
  return { year, month, day, hour };
}

/** Format Julian Day as "YYYY-MM-DD" string. */
export function jdToDateStr(jd: number): string {
  const { year, month, day } = revjul(jd);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** Convert Julian Day to a Date object. */
function jdToDate(jd: number): Date {
  const { year, month, day, hour } = revjul(jd);
  const h = Math.floor(hour);
  const m = Math.round((hour - h) * 60);
  return new Date(Date.UTC(year, month - 1, day, h, m));
}

/** Convert a Date to Astronomy.FlexibleDateTime (AstroTime). */
function dateToAstro(d: Date): Astronomy.FlexibleDateTime {
  return d;
}

/** Convert year/month/day/hour to AstroTime. */
function jdToAstroTime(jd: number): Astronomy.FlexibleDateTime {
  return jdToDate(jd);
}

// ─── Planet positions using astronomy-engine ───

const ASTRO_BODIES: Record<string, Astronomy.Body> = {
  Sun: Astronomy.Body.Sun,
  Moon: Astronomy.Body.Moon,
  Mercury: Astronomy.Body.Mercury,
  Venus: Astronomy.Body.Venus,
  Mars: Astronomy.Body.Mars,
  Jupiter: Astronomy.Body.Jupiter,
  Saturn: Astronomy.Body.Saturn,
  Uranus: Astronomy.Body.Uranus,
  Neptune: Astronomy.Body.Neptune,
  Pluto: Astronomy.Body.Pluto,
};

/**
 * Get geocentric ecliptic longitude of a body at a given Julian Day.
 * Uses GeoVector + Ecliptic which works for ALL bodies including the Sun.
 * (EclipticLongitude is heliocentric and throws for the Sun.)
 */
function getGeoEclipticLongitude(body: Astronomy.Body, time: Astronomy.FlexibleDateTime): number {
  const geo = Astronomy.GeoVector(body, time, true);
  const ecl = Astronomy.Ecliptic(geo);
  return ecl.elon;
}

/**
 * Get ecliptic longitude of a planet at a given Julian Day.
 */
export function getPlanetLongitude(jd: number, planetKey: string): number {
  if (planetKey === "Chiron" || planetKey === "chiron") {
    return getChironLongitude(jd);
  }
  if (planetKey === "NorthNode" || planetKey === "North Node") {
    return getMeanNodeLongitude(jd);
  }
  if (planetKey === "Lilith" || planetKey === "Black Moon Lilith") {
    return getMeanLilithLongitude(jd);
  }
  const body = ASTRO_BODIES[planetKey];
  if (!body && body !== 0) return 0;
  const time = jdToAstroTime(jd);
  return getGeoEclipticLongitude(body, time);
}

/**
 * Get full planet data: longitude and retrograde status.
 */
export function getPlanetData(jd: number, planetKey: string): {
  longitude: number;
  latitude: number;
  distance: number;
  longitudeSpeed: number;
  retrograde: boolean;
} {
  if (planetKey === "Chiron" || planetKey === "chiron") {
    const lon = getChironLongitude(jd);
    const lon2 = getChironLongitude(jd + 1);
    const speed = ((lon2 - lon + 540) % 360) - 180;
    return { longitude: lon, latitude: 0, distance: 0, longitudeSpeed: speed, retrograde: speed < 0 };
  }
  if (planetKey === "NorthNode" || planetKey === "North Node") {
    const lon = getMeanNodeLongitude(jd);
    return { longitude: lon, latitude: 0, distance: 0, longitudeSpeed: -0.053, retrograde: true };
  }
  if (planetKey === "Lilith" || planetKey === "Black Moon Lilith") {
    const lon = getMeanLilithLongitude(jd);
    const lon2 = getMeanLilithLongitude(jd + 1);
    const speed = ((lon2 - lon + 540) % 360) - 180;
    return { longitude: lon, latitude: 0, distance: 0, longitudeSpeed: speed, retrograde: false };
  }

  const body = ASTRO_BODIES[planetKey];
  if (!body && body !== 0) {
    return { longitude: 0, latitude: 0, distance: 0, longitudeSpeed: 0, retrograde: false };
  }

  const time = jdToAstroTime(jd);
  const lon = getGeoEclipticLongitude(body, time);

  // Calculate speed by comparing position 1 day later
  const time2 = jdToAstroTime(jd + 1);
  const lon2 = getGeoEclipticLongitude(body, time2);
  let speed = ((lon2 - lon + 540) % 360) - 180; // handle wrap-around

  return {
    longitude: lon,
    latitude: 0, // astronomy-engine EclipticLongitude only returns longitude
    distance: 0,
    longitudeSpeed: speed,
    retrograde: speed < 0,
  };
}

// ─── Mean Black Moon Lilith (Mean Lunar Apogee) ───

/**
 * Calculate Mean Black Moon Lilith longitude.
 * This is the mean lunar apogee — the point in the Moon's orbit farthest from Earth.
 * Formula from Meeus, Astronomical Algorithms.
 */
function getMeanLilithLongitude(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0;
  // Mean longitude of lunar perigee (Meeus)
  let perigee = 83.3532465
    + 4069.0137287 * T
    - 0.0103200 * T * T
    - T * T * T / 80053.0
    + T * T * T * T / 18999000.0;
  // Black Moon Lilith = lunar APOGEE = perigee + 180°
  let lon = perigee + 180;
  lon = ((lon % 360) + 360) % 360;
  return Math.round(lon * 100) / 100;
}

// ─── Mean Lunar Node ───

/** Calculate Mean North Node longitude from orbital elements. */
function getMeanNodeLongitude(jd: number): number {
  // Julian centuries from J2000.0
  const T = (jd - 2451545.0) / 36525.0;
  // Mean longitude of ascending node (Meeus, Astronomical Algorithms)
  let omega = 125.0445479
    - 1934.1362891 * T
    + 0.0020754 * T * T
    + T * T * T / 467441.0
    - T * T * T * T / 60616000.0;
  omega = ((omega % 360) + 360) % 360;
  return Math.round(omega * 100) / 100;
}

// ─── Chiron ───
// Chiron longitude is now imported from ./chironEphemeris.ts
// (correction-enhanced Keplerian model calibrated against known positions)

// ─── Placidus House System ───

/** Calculate obliquity of the ecliptic. */
function getObliquity(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0;
  // IAU formula
  return 23.4392911 - 0.0130042 * T - 1.64e-7 * T * T + 5.04e-7 * T * T * T;
}

/** Greenwich Mean Sidereal Time in degrees. */
function gmst(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0;
  let theta = 280.46061837
    + 360.98564736629 * (jd - 2451545.0)
    + 0.000387933 * T * T
    - T * T * T / 38710000.0;
  return ((theta % 360) + 360) % 360;
}

/** Local Sidereal Time in degrees. */
function lst(jd: number, longitude: number): number {
  return ((gmst(jd) + longitude) % 360 + 360) % 360;
}

/**
 * Calculate Ascendant from RAMC, obliquity, and latitude.
 */
function calcAscendant(ramc: number, obliquity: number, latitude: number): number {
  const ramcRad = ramc * DEG;
  const oblRad = obliquity * DEG;
  const latRad = latitude * DEG;

  let asc = Math.atan2(
    Math.cos(ramcRad),
    -(Math.sin(ramcRad) * Math.cos(oblRad) + Math.tan(latRad) * Math.sin(oblRad))
  ) * RAD;

  asc = ((asc % 360) + 360) % 360;
  return asc;
}

/**
 * Calculate MC (Medium Coeli / Midheaven) from RAMC and obliquity.
 */
function calcMC(ramc: number, obliquity: number): number {
  const mc = Math.atan2(
    Math.sin(ramc * DEG),
    Math.cos(ramc * DEG) * Math.cos(obliquity * DEG)
  ) * RAD;
  return ((mc % 360) + 360) % 360;
}

/**
 * Placidus house cusp calculation.
 *
 * Uses the standard Placidus trisection of semi-arcs:
 * - Cusp 11: RA(λ) = RAMC + (1/3)×DSA(λ)
 * - Cusp 12: RA(λ) = RAMC + (2/3)×DSA(λ)
 * - Cusp 2:  RA(λ) = RAMC + DSA(λ) + (1/3)×NSA(λ)
 * - Cusp 3:  RA(λ) = RAMC + DSA(λ) + (2/3)×NSA(λ)
 *
 * Iterates by computing DSA for the current guess, deriving the target RA,
 * then converting back to ecliptic longitude until convergence.
 */
function calcPlacidusCusp(
  cuspNum: number, // 2,3,11,12 (the non-angular cusps)
  ramc: number,
  obliquity: number,
  latitude: number
): number {
  const oblRad = obliquity * DEG;
  const latRad = latitude * DEG;

  const mc = calcMC(ramc, obliquity);
  const asc = calcAscendant(ramc, obliquity, latitude);
  const ic = (mc + 180) % 360;

  // Initial guess: equal-house interpolation
  let lambda: number;
  switch (cuspNum) {
    case 11: {
      const diff = ((asc - mc) % 360 + 360) % 360;
      lambda = (mc + diff * (1 / 3)) % 360;
      break;
    }
    case 12: {
      const diff = ((asc - mc) % 360 + 360) % 360;
      lambda = (mc + diff * (2 / 3)) % 360;
      break;
    }
    case 2: {
      const diff = ((ic - asc) % 360 + 360) % 360;
      lambda = (asc + diff * (1 / 3)) % 360;
      break;
    }
    case 3: {
      const diff = ((ic - asc) % 360 + 360) % 360;
      lambda = (asc + diff * (2 / 3)) % 360;
      break;
    }
    default:
      return 0;
  }

  // Iterate to find the ecliptic longitude whose RA satisfies the Placidus condition
  for (let iter = 0; iter < 50; iter++) {
    // Declination and diurnal semi-arc of current guess
    const decl = Math.asin(Math.sin(oblRad) * Math.sin(lambda * DEG));
    const cosH = -Math.tan(latRad) * Math.tan(decl);

    let dsa: number;
    if (cosH >= 1) dsa = 0;
    else if (cosH <= -1) dsa = 180;
    else dsa = Math.acos(cosH) * RAD;

    const nsa = 180 - dsa;

    // Compute target RA based on cusp type
    let targetRA: number;
    switch (cuspNum) {
      case 11: targetRA = ramc + (1 / 3) * dsa; break;
      case 12: targetRA = ramc + (2 / 3) * dsa; break;
      case 2:  targetRA = ramc + dsa + (1 / 3) * nsa; break;
      case 3:  targetRA = ramc + dsa + (2 / 3) * nsa; break;
      default: targetRA = ramc;
    }
    targetRA = ((targetRA % 360) + 360) % 360;

    // Convert target RA back to ecliptic longitude
    // For a point on the ecliptic: λ = atan2(sin(RA)/cos(ε), cos(RA))
    const targetRARad = targetRA * DEG;
    const newLambda = ((Math.atan2(
      Math.sin(targetRARad) / Math.cos(oblRad),
      Math.cos(targetRARad)
    ) * RAD) % 360 + 360) % 360;

    let diff = Math.abs(newLambda - lambda);
    if (diff > 180) diff = 360 - diff;

    lambda = newLambda;
    if (diff < 0.0001) break;
  }

  return ((lambda % 360) + 360) % 360;
}

/**
 * Calculate house cusps and angles using Placidus system.
 */
export function getHouses(
  jd: number,
  latitude: number,
  longitude: number,
): {
  cusps: number[];
  ascendant: number;
  mc: number;
  armc: number;
  vertex: number;
} {
  const ramc = lst(jd, longitude); // RAMC = Local Sidereal Time
  const obliquity = getObliquity(jd);

  const ascendant = calcAscendant(ramc, obliquity, latitude);
  const mc = calcMC(ramc, obliquity);
  const ic = (mc + 180) % 360;
  const dsc = (ascendant + 180) % 360;

  // Calculate intermediate cusps using Placidus
  const cusp11 = calcPlacidusCusp(11, ramc, obliquity, latitude);
  const cusp12 = calcPlacidusCusp(12, ramc, obliquity, latitude);
  const cusp2 = calcPlacidusCusp(2, ramc, obliquity, latitude);
  const cusp3 = calcPlacidusCusp(3, ramc, obliquity, latitude);

  // Opposite cusps
  const cusp5 = (cusp11 + 180) % 360;
  const cusp6 = (cusp12 + 180) % 360;
  const cusp8 = (cusp2 + 180) % 360;
  const cusp9 = (cusp3 + 180) % 360;

  const cusps = [
    ascendant,  // House 1 (ASC)
    cusp2,      // House 2
    cusp3,      // House 3
    ic,         // House 4 (IC)
    cusp5,      // House 5
    cusp6,      // House 6
    dsc,        // House 7 (DSC)
    cusp8,      // House 8
    cusp9,      // House 9
    mc,         // House 10 (MC)
    cusp11,     // House 11
    cusp12,     // House 12
  ].map(c => Math.round(((c % 360 + 360) % 360) * 100) / 100);

  // Vertex = Ascendant calculated for the co-latitude
  const coLat = 90 - latitude;
  const vertex = calcAscendant(ramc, obliquity, coLat);

  return {
    cusps,
    ascendant: cusps[0],
    mc: cusps[9],
    armc: Math.round(ramc * 100) / 100,
    vertex: Math.round(((vertex % 360 + 360) % 360) * 100) / 100,
  };
}

/**
 * Calculate all planet positions for a given moment.
 */
export function getAllPlanetPositions(jd: number) {
  const planetNames: PlanetName[] = [
    "Sun", "Moon", "Mercury", "Venus", "Mars",
    "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto",
  ];

  return planetNames.map((name) => {
    const data = getPlanetData(jd, name);
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
  const chiron = getPlanetData(jd, "Chiron");
  const northNode = getPlanetData(jd, "North Node");
  const southNodeLon = (northNode.longitude + 180) % 360;
  const lilith = getPlanetData(jd, "Lilith");

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
      retrograde: true,
    },
    {
      name: "Lilith" as const,
      longitude: Math.round(lilith.longitude * 100) / 100,
      retrograde: false,
    },
  ];
}
