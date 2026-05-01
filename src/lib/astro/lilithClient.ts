/**
 * Client-side Mean Black Moon Lilith calculator.
 * Only needs a birth date — no location required.
 * Used as a fallback when Lilith isn't in saved chart data.
 */

function dateToJD(date: Date): number {
  let y = date.getUTCFullYear();
  let m = date.getUTCMonth() + 1;
  const d = date.getUTCDate() + (date.getUTCHours() + date.getUTCMinutes() / 60) / 24;
  if (m <= 2) { y -= 1; m += 12; }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + B - 1524.5;
}

function getMeanLilithLongitude(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0;
  let lon = 83.3532465
    + 4069.0137287 * T
    - 0.0103200 * T * T
    - T * T * T / 80053.0
    + T * T * T * T / 18999000.0;
  lon = ((lon % 360) + 360) % 360;
  return Math.round(lon * 100) / 100;
}

const SIGNS = ["Ari", "Tau", "Gem", "Can", "Leo", "Vir", "Lib", "Sco", "Sag", "Cap", "Aqu", "Pis"];

function lonToSign(lon: number): { sign: string; position: number } {
  const signIndex = Math.floor(lon / 30);
  const position = Math.round((lon % 30) * 100) / 100;
  return { sign: SIGNS[signIndex], position };
}

export interface LilithData {
  name: "Lilith";
  sign: string;
  signNum: number;
  position: number;
  absPosition: number;
  house: number | null;
  retrograde: boolean;
}

/**
 * Calculate Lilith from a birth date string (YYYY-MM-DD) and optional time (HH:MM).
 * Returns a placement object compatible with the specialPoints array.
 */
export function getMeanLilithData(birthDate: string, birthTime?: string): LilithData {
  const [y, m, d] = birthDate.split("-").map(Number);
  const [hr, min] = birthTime ? birthTime.split(":").map(Number) : [12, 0];
  const date = new Date(Date.UTC(y, m - 1, d, hr, min));
  const jd = dateToJD(date);
  const lon = getMeanLilithLongitude(jd);
  const { sign, position } = lonToSign(lon);
  const signIndex = SIGNS.indexOf(sign);

  return {
    name: "Lilith",
    sign,
    signNum: signIndex + 1,
    position,
    absPosition: lon,
    house: null, // Can't determine house without location
    retrograde: false,
  };
}
