/**
 * Chiron Ephemeris — interpolated Swiss Ephemeris table.
 *
 * Chiron's orbit is strongly perturbed by Saturn and Uranus, so no compact
 * analytic model holds it: a two-body Keplerian orbit is 4–6° off within a
 * few decades of its epoch and 50°+ off two centuries away. Instead
 * chironTable.ts carries its apparent geocentric tropical longitude every
 * 10 days, 1801–2200, generated from Swiss Ephemeris (seas_18.se1) by
 * scripts/generate_chiron_table.py. This module decodes it once and
 * interpolates with a 4-point Lagrange cubic.
 *
 * Accuracy: within 0.001° of Swiss Ephemeris (quantization is 0.0001°).
 * Speed is the derivative of the same cubic, so the retrograde flag and the
 * station dates agree with Swiss.
 *
 * Outside 1801–2200 there is no authoritative position to give, so these
 * functions return NaN and callers must leave Chiron out (getSpecialPoints
 * does).
 */

import {
  CHIRON_START_JD,
  CHIRON_STEP_DAYS,
  CHIRON_COUNT,
  CHIRON_SCALE,
  CHIRON_FIRST,
  CHIRON_DELTAS,
} from "./chironTable";

const B64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
const OFFSET = 1 << 17;

let table: Float64Array | null = null;

/** Decode the table (unwrapped longitudes in degrees) on first use. */
function getTable(): Float64Array {
  if (table) return table;
  const digit = new Int8Array(128);
  for (let i = 0; i < 64; i++) digit[B64.charCodeAt(i)] = i;
  const t = new Float64Array(CHIRON_COUNT);
  let units = CHIRON_FIRST;
  t[0] = units / CHIRON_SCALE;
  for (let i = 1; i < CHIRON_COUNT; i++) {
    const k = (i - 1) * 3;
    const v = (digit[CHIRON_DELTAS.charCodeAt(k)] << 12)
      | (digit[CHIRON_DELTAS.charCodeAt(k + 1)] << 6)
      | digit[CHIRON_DELTAS.charCodeAt(k + 2)];
    units += v - OFFSET;
    t[i] = units / CHIRON_SCALE;
  }
  table = t;
  return t;
}

const TABLE_END_JD = CHIRON_START_JD + (CHIRON_COUNT - 1) * CHIRON_STEP_DAYS;

/** True when Chiron can be computed for this Julian Day (1801–2200). */
export function chironAvailable(jd: number): boolean {
  return jd >= CHIRON_START_JD && jd <= TABLE_END_JD;
}

/**
 * Lagrange cubic through the four table rows around jd.
 * Returns the unwrapped longitude and its first and second derivatives
 * (degrees per day, degrees per day²).
 */
function interpolate(jd: number): { lon: number; speed: number; accel: number } {
  const t = getTable();
  const x = (jd - CHIRON_START_JD) / CHIRON_STEP_DAYS;
  // Nodes i-1..i+2, shifted inward at the ends of the table.
  const i = Math.min(Math.max(Math.floor(x), 1), CHIRON_COUNT - 3);
  const u = x - i;
  const y0 = t[i - 1], y1 = t[i], y2 = t[i + 1], y3 = t[i + 2];

  const lon =
    -y0 * u * (u - 1) * (u - 2) / 6
    + y1 * (u + 1) * (u - 1) * (u - 2) / 2
    - y2 * (u + 1) * u * (u - 2) / 2
    + y3 * (u + 1) * u * (u - 1) / 6;

  const dLon =
    -y0 * (3 * u * u - 6 * u + 2) / 6
    + y1 * (3 * u * u - 4 * u - 1) / 2
    - y2 * (3 * u * u - 2 * u - 2) / 2
    + y3 * (3 * u * u - 1) / 6;

  const d2Lon =
    -y0 * (6 * u - 6) / 6
    + y1 * (6 * u - 4) / 2
    - y2 * (6 * u - 2) / 2
    + y3 * (6 * u) / 6;

  return {
    lon,
    speed: dLon / CHIRON_STEP_DAYS,
    accel: d2Lon / (CHIRON_STEP_DAYS * CHIRON_STEP_DAYS),
  };
}

/**
 * Chiron's geocentric tropical ecliptic longitude (0–360, unrounded),
 * or NaN outside 1801–2200.
 *
 * @param jd - Julian Day (UT)
 */
export function getChironLongitude(jd: number): number {
  return getChironData(jd).longitude;
}

/**
 * Chiron's longitude, instantaneous speed (°/day) and acceleration (°/day²);
 * all NaN outside 1801–2200.
 */
export function getChironData(jd: number): { longitude: number; speed: number; accel: number } {
  if (!chironAvailable(jd)) return { longitude: NaN, speed: NaN, accel: NaN };
  const { lon, speed, accel } = interpolate(jd);
  return { longitude: ((lon % 360) + 360) % 360, speed, accel };
}
