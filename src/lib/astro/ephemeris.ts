/**
 * Astronomy engine wrapper — pure JavaScript, no native modules.
 *
 * Uses `astronomy-engine` for planetary positions and implements
 * Placidus house calculations from standard astronomical formulas.
 *
 * Accuracy: sub-arcminute for all planets, sufficient for astrology.
 *
 * Conventions (checked against Swiss Ephemeris 2.10 in tests/ephemerisAccuracy):
 * - Planets: apparent geocentric, true ecliptic and equinox of date.
 * - Chiron: Swiss Ephemeris table, 1801–2200 only (chironEphemeris.ts).
 * - Nodes and Lilith: MEAN (true node is swapped in by calculateChart).
 * - Houses: Placidus; Porphyry inside the polar circles (flagged).
 *   Angles use apparent sidereal time and true obliquity.
 * - Vertex: always the western point.
 * - Retrograde: sign of the instantaneous speed; `stationary` within about a
 *   day of an exact station (STATION_WINDOW_DAYS).
 * - Longitudes are truncated, never rounded, to 0.01° (see posToSign).
 */

import * as Astronomy from "astronomy-engine";
import { getChironLongitude, getChironData, chironAvailable } from "./chironEphemeris";

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

/**
 * Convert Julian Day to a Date object, to the millisecond. (Rounding to the
 * minute here moved the Moon by up to 0.004° and made sub-minute speed
 * differences meaningless.) Same proleptic Gregorian calendar as julday.
 */
function jdToDate(jd: number): Date {
  return new Date((jd - 2440587.5) * 86400000);
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
 * A body is `stationary` when it is within about this many days of an exact
 * station (direct or retrograde): |speed| < |acceleration| × window, i.e. at
 * its present rate of change its speed is less than a day from zero (or was
 * zero less than a day ago). One rule for every body, so Mercury and Pluto
 * get the same ±1-day window — a fixed speed threshold gave Mercury hours and
 * Mars days. The `retrograde` flag is unaffected: it is still the sign of the
 * speed, so a stationary body is also direct or retrograde.
 */
export const STATION_WINDOW_DAYS = 1;

function isStationary(speed: number, accel: number): boolean {
  return Math.abs(speed) < Math.abs(accel) * STATION_WINDOW_DAYS;
}

/** Half-width of the central difference used for speed: 1 hour. */
const SPEED_STEP = 1 / 24;

/**
 * Get full planet data: longitude, instantaneous speed, retrograde status.
 *
 * Speed is a central difference over ±1 hour — the speed AT the moment, not
 * the average over the following day. (A 1-day forward difference called the
 * wrong direction for about 2% of charts, all within a day of a station.)
 */
export function getPlanetData(jd: number, planetKey: string): {
  longitude: number;
  latitude: number;
  distance: number;
  longitudeSpeed: number;
  retrograde: boolean;
  stationary: boolean;
} {
  if (planetKey === "Chiron" || planetKey === "chiron") {
    const { longitude, speed, accel } = getChironData(jd);
    return {
      longitude, latitude: 0, distance: 0, longitudeSpeed: speed,
      retrograde: speed < 0, stationary: isStationary(speed, accel),
    };
  }
  if (planetKey === "NorthNode" || planetKey === "North Node") {
    const lon = getMeanNodeLongitude(jd);
    return { longitude: lon, latitude: 0, distance: 0, longitudeSpeed: -0.053, retrograde: true, stationary: false };
  }
  if (planetKey === "Lilith" || planetKey === "Black Moon Lilith") {
    const lon = getMeanLilithLongitude(jd);
    const lon2 = getMeanLilithLongitude(jd + 1);
    const speed = ((lon2 - lon + 540) % 360) - 180;
    return { longitude: lon, latitude: 0, distance: 0, longitudeSpeed: speed, retrograde: false, stationary: false };
  }

  const body = ASTRO_BODIES[planetKey];
  if (!body && body !== 0) {
    return { longitude: 0, latitude: 0, distance: 0, longitudeSpeed: 0, retrograde: false, stationary: false };
  }

  const lon = getGeoEclipticLongitude(body, jdToAstroTime(jd));
  const before = getGeoEclipticLongitude(body, jdToAstroTime(jd - SPEED_STEP));
  const after = getGeoEclipticLongitude(body, jdToAstroTime(jd + SPEED_STEP));
  // Signed steps with wrap-around handled, then degrees per day (and per day²)
  const back = ((lon - before + 540) % 360) - 180;
  const fwd = ((after - lon + 540) % 360) - 180;
  const speed = (back + fwd) / (2 * SPEED_STEP);
  const accel = (fwd - back) / (SPEED_STEP * SPEED_STEP);

  return {
    longitude: lon,
    latitude: 0, // astronomy-engine EclipticLongitude only returns longitude
    distance: 0,
    longitudeSpeed: speed,
    retrograde: speed < 0,
    // Sun and Moon never station
    stationary: body !== Astronomy.Body.Sun && body !== Astronomy.Body.Moon && isStationary(speed, accel),
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
  return lon;
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
  return omega;
}

// ─── Chiron ───
// Chiron comes from ./chironEphemeris.ts (an interpolated Swiss Ephemeris table).

// ─── Placidus House System ───

/**
 * TRUE obliquity of the ecliptic (mean obliquity + nutation in obliquity), as
 * Swiss Ephemeris uses for houses. The planets from astronomy-engine are on
 * the true ecliptic of date, so the angles must be too.
 */
function getObliquity(jd: number): number {
  return Astronomy.e_tilt(Astronomy.MakeTime(jdToDate(jd))).tobl;
}

/**
 * Local APPARENT Sidereal Time in degrees (Greenwich apparent sidereal time,
 * which includes the equation of the equinoxes, plus east longitude). Mean
 * sidereal time put the angles up to ~0.005° off in RAMC — up to a degree on
 * the Ascendant near the polar circles.
 */
function lst(jd: number, longitude: number): number {
  return ((Astronomy.SiderealTime(jdToDate(jd)) * 15 + longitude) % 360 + 360) % 360;
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

/** Signed difference a − b, normalised to (−180, 180]. */
function difdeg(a: number, b: number): number {
  const d = (((a - b) % 360) + 360) % 360;
  return d > 180 ? d - 360 : d;
}

/** True when an ecliptic degree is east of the meridian (hour angle 180–360°). */
function isEastOfMeridian(lambda: number, ramc: number, obliquity: number): boolean {
  const ra = Math.atan2(Math.sin(lambda * DEG) * Math.cos(obliquity * DEG), Math.cos(lambda * DEG)) * RAD;
  return Math.sin((ramc - ra) * DEG) < 0;
}

/**
 * Porphyry cusp: each quadrant between the angles trisected in longitude.
 * Swiss Ephemeris falls back to this where Placidus is undefined.
 */
function porphyryCusp(cuspNum: number, asc: number, mc: number): number {
  const ic = (mc + 180) % 360;
  const upper = ((asc - mc) % 360 + 360) % 360; // MC → ASC (houses 10–12)
  const lower = ((ic - asc) % 360 + 360) % 360; // ASC → IC (houses 1–3)
  switch (cuspNum) {
    case 11: return (mc + upper / 3) % 360;
    case 12: return (mc + (2 * upper) / 3) % 360;
    case 2: return (asc + lower / 3) % 360;
    case 3: return (asc + (2 * lower) / 3) % 360;
    default: return 0;
  }
}

/**
 * Calculate house cusps and angles using Placidus system.
 *
 * Placidus is undefined inside the polar circles (|latitude| > 90° − ε, about
 * 66.56°): some ecliptic degrees never rise or set there, so their semi-arcs
 * cannot be trisected. Inside them — the Swiss Ephemeris convention — the
 * cusps fall back to Porphyry, and the result says so
 * (`houseSystemUsed: "porphyry"`, `polarFallback: true`) so the UI can tell
 * the user their houses are not Placidus.
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
  houseSystemUsed: "placidus" | "porphyry";
  polarFallback: boolean;
} {
  const ramc = lst(jd, longitude); // RAMC = Local Sidereal Time
  const obliquity = getObliquity(jd);
  const polar = Math.abs(latitude) > 90 - obliquity;

  let ascendant = calcAscendant(ramc, obliquity, latitude);
  const mc = calcMC(ramc, obliquity);
  // Inside the polar circle the horizon formula can return the WESTERN
  // horizon point (the setting degree). The Ascendant is the degree rising in
  // the east, so take the opposite point when that happens.
  if (polar && !isEastOfMeridian(ascendant, ramc, obliquity)) {
    ascendant = (ascendant + 180) % 360;
  }
  const ic = (mc + 180) % 360;
  const dsc = (ascendant + 180) % 360;

  // Intermediate cusps: Placidus, or Porphyry inside the polar circle
  const cusp = (n: number) => polar
    ? porphyryCusp(n, ascendant, mc)
    : calcPlacidusCusp(n, ramc, obliquity, latitude);
  const cusp11 = cusp(11);
  const cusp12 = cusp(12);
  const cusp2 = cusp(2);
  const cusp3 = cusp(3);

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
  ].map(trunc2);

  /**
   * Vertex — the ecliptic point on the WESTERN prime vertical (azimuth 270).
   *
   * The prime vertical of (lat, LST) is the horizon of (90 - lat, LST + 180),
   * so this is the Ascendant of the co-latitude at RAMC + 180. Without the
   * 180 the result is not on the prime vertical at all: measured at six
   * latitudes it came out between 12 and 39 degrees away, and the value fed
   * every "fated contact" in synastry at weight 88. With it, the azimuth is
   * 270.00 exactly.
   */
  const coLat = 90 - latitude;
  let vertex = calcAscendant(ramc + 180, obliquity, coLat);
  // Between the tropics that formula sometimes returns the anti-Vertex (the
  // eastern point). The Vertex is always on the WESTERN half of the wheel
  // (Swiss Ephemeris rule): if it lies on the MC→ASC→IC side, flip it.
  if (Math.abs(latitude) < obliquity && difdeg(vertex, mc) > 0) {
    vertex = (vertex + 180) % 360;
  }

  return {
    cusps,
    ascendant: cusps[0],
    mc: cusps[9],
    armc: Math.round(ramc * 100) / 100,
    vertex: trunc2(vertex),
    houseSystemUsed: polar ? "porphyry" : "placidus",
    polarFallback: polar,
  };
}

/**
 * Truncate a longitude to 0.01° (0–359.99). Truncation, not rounding, matches
 * posToSign: rounding 59.996° up to 60.00 would move a body still in Taurus
 * into Gemini.
 */
function trunc2(lon: number): number {
  return ((Math.floor(lon * 100 + 1e-6) % 36000 + 36000) % 36000) / 100;
}

/**
 * Calculate all planet positions for a given moment.
 *
 * Longitudes are truncated to 0.01° for storage/display unless `precise` is set.
 * Pass precise for anything derived from the Moon's exact degree (nakshatra
 * fraction, Vimshottari dasha): the Moon covers 0.01° in about a minute.
 */
export function getAllPlanetPositions(jd: number, precise = false) {
  const planetNames: PlanetName[] = [
    "Sun", "Moon", "Mercury", "Venus", "Mars",
    "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto",
  ];

  return planetNames.map((name) => {
    const data = getPlanetData(jd, name);
    return {
      name,
      longitude: precise ? data.longitude : trunc2(data.longitude),
      retrograde: data.retrograde,
      stationary: data.stationary,
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

  const points = [
    {
      name: "Chiron" as const,
      longitude: trunc2(chiron.longitude),
      retrograde: chiron.retrograde,
      stationary: chiron.stationary,
    },
    {
      name: "North Node" as const,
      longitude: trunc2(northNode.longitude),
      retrograde: northNode.retrograde,
      stationary: false,
    },
    {
      name: "South Node" as const,
      longitude: trunc2(southNodeLon),
      retrograde: true,
      stationary: false,
    },
    {
      name: "Lilith" as const,
      longitude: trunc2(lilith.longitude),
      retrograde: false,
      stationary: false,
    },
  ];
  // Chiron is only known 1801–2200 (see chironEphemeris.ts); outside that,
  // leave it out rather than invent a position.
  return chironAvailable(jd) ? points : points.filter((p) => p.name !== "Chiron");
}
