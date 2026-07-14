/**
 * Current sky positions — uses astronomy-engine for accuracy.
 *
 * This is the SINGLE SOURCE OF TRUTH for "where is the moon/planets RIGHT NOW".
 * All client & server code should use these functions instead of crude formulas.
 */

import * as Astronomy from "astronomy-engine";

const SIGN_NAMES = [
  "Ari", "Tau", "Gem", "Can", "Leo", "Vir",
  "Lib", "Sco", "Sag", "Cap", "Aqu", "Pis",
];

const SIGN_FULL: Record<string, string> = {
  Ari: "Aries", Tau: "Taurus", Gem: "Gemini", Can: "Cancer",
  Leo: "Leo", Vir: "Virgo", Lib: "Libra", Sco: "Scorpio",
  Sag: "Sagittarius", Cap: "Capricorn", Aqu: "Aquarius", Pis: "Pisces",
};

function lonToSign(longitude: number): { abbr: string; full: string; degree: number } {
  const norm = ((longitude % 360) + 360) % 360;
  const idx = Math.floor(norm / 30) % 12;
  return {
    abbr: SIGN_NAMES[idx],
    full: SIGN_FULL[SIGN_NAMES[idx]],
    degree: Math.round((norm % 30) * 100) / 100,
  };
}

function dateToAstroTime(date: Date): Astronomy.AstroTime {
  return Astronomy.MakeTime(date);
}

/** Get the Moon's ecliptic longitude for a given date (accurate to arcminutes). */
export function getMoonLongitude(date: Date): number {
  const time = dateToAstroTime(date);
  const ecl = Astronomy.EclipticGeoMoon(time);
  return ecl.lon;
}

/** Get the Moon's current zodiac sign (accurate, using astronomy-engine). */
export function getCurrentMoonSign(date: Date = new Date()): { abbr: string; full: string; degree: number } {
  return lonToSign(getMoonLongitude(date));
}

/** Get the Sun's ecliptic longitude for a given date. */
export function getSunLongitude(date: Date): number {
  const time = dateToAstroTime(date);
  const equ = Astronomy.SunPosition(time);
  const ecl = Astronomy.Ecliptic(equ.vec);
  return ecl.elon;
}

/** Get the Sun's current zodiac sign. */
export function getCurrentSunSign(date: Date = new Date()): { abbr: string; full: string; degree: number } {
  return lonToSign(getSunLongitude(date));
}

/**
 * Exact dates/times of the four seasonal turning points for a given year,
 * computed from astronomy-engine (sub-minute accuracy). These are the moments
 * the Sun reaches 0° Aries / Cancer / Libra / Capricorn.
 */
export function getSeasonDates(year: number): {
  springEquinox: Date;
  summerSolstice: Date;
  autumnEquinox: Date;
  winterSolstice: Date;
} {
  const s = Astronomy.Seasons(year);
  return {
    springEquinox: s.mar_equinox.date,
    summerSolstice: s.jun_solstice.date,
    autumnEquinox: s.sep_equinox.date,
    winterSolstice: s.dec_solstice.date,
  };
}

/** Get any planet's current sign (planet names: Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto). */
export function getCurrentPlanetSign(planet: string, date: Date = new Date()): { abbr: string; full: string; degree: number } {
  if (planet === "Moon") return getCurrentMoonSign(date);
  if (planet === "Sun") return getCurrentSunSign(date);

  const bodyMap: Record<string, Astronomy.Body> = {
    Mercury: Astronomy.Body.Mercury,
    Venus: Astronomy.Body.Venus,
    Mars: Astronomy.Body.Mars,
    Jupiter: Astronomy.Body.Jupiter,
    Saturn: Astronomy.Body.Saturn,
    Uranus: Astronomy.Body.Uranus,
    Neptune: Astronomy.Body.Neptune,
    Pluto: Astronomy.Body.Pluto,
  };

  const body = bodyMap[planet];
  if (body == null) return { abbr: "Ari", full: "Aries", degree: 0 };

  const time = dateToAstroTime(date);
  const vec = Astronomy.GeoVector(body, time, true);
  const eclCoords = Astronomy.Ecliptic(vec);
  return lonToSign(eclCoords.elon);
}

/** Moon phase (0–1 fraction through the synodic month). */
export function getMoonPhaseFraction(date: Date = new Date()): number {
  const sunLon = getSunLongitude(date);
  const moonLon = getMoonLongitude(date);
  // Phase angle: moon longitude - sun longitude, normalized 0–360
  const phase = ((moonLon - sunLon) % 360 + 360) % 360;
  return phase / 360;
}

/** Get a human-readable moon phase label. */
export function getMoonPhaseLabel(date: Date = new Date()): string {
  const f = getMoonPhaseFraction(date);
  if (f < 0.0625) return "New Moon";
  if (f < 0.1875) return "Waxing Crescent";
  if (f < 0.3125) return "First Quarter";
  if (f < 0.4375) return "Waxing Gibbous";
  if (f < 0.5625) return "Full Moon";
  if (f < 0.6875) return "Waning Gibbous";
  if (f < 0.8125) return "Last Quarter";
  if (f < 0.9375) return "Waning Crescent";
  return "New Moon";
}

/** Moon illumination percentage (0–100). */
export function getMoonIllumination(date: Date = new Date()): number {
  const time = dateToAstroTime(date);
  const illum = Astronomy.Illumination(Astronomy.Body.Moon, time);
  return Math.round(illum.phase_fraction * 100);
}

// ─── Retrogrades ──────────────────────────────────────────────────────────────

export interface RetrogradeInfo {
  planet: string;
  sign: string;   // full sign name it's retrograde in
  meaning: string;
}

const RETRO_BODIES: Record<string, Astronomy.Body> = {
  Mercury: Astronomy.Body.Mercury,
  Venus: Astronomy.Body.Venus,
  Mars: Astronomy.Body.Mars,
  Jupiter: Astronomy.Body.Jupiter,
  Saturn: Astronomy.Body.Saturn,
  Uranus: Astronomy.Body.Uranus,
  Neptune: Astronomy.Body.Neptune,
  Pluto: Astronomy.Body.Pluto,
};

const RETRO_MEANING: Record<string, string> = {
  Mercury: "Communication, tech, and travel ask for a slower, second-draft pace. Back things up, reread before you send, and expect plans to shift.",
  Venus: "Love, money, and values turn inward. Old flames and old feelings resurface as you reassess what — and who — you truly want.",
  Mars: "Drive and momentum stall. Rethink your strategy rather than forcing action; frustration can turn inward, so channel it with care.",
  Jupiter: "Growth and belief turn reflective. Revisit your bigger vision and notice where you've overextended or overpromised.",
  Saturn: "Structures, commitments, and responsibilities come up for review. Where have you been too rigid — or not disciplined enough?",
  Uranus: "The urge to break free turns inward. Reconsider where you genuinely need change versus where you're just restless.",
  Neptune: "Dreams, intuition, and illusions slowly clarify. Fog around a person or situation begins to lift.",
  Pluto: "Deep power, control, and transformation themes resurface for another, quieter layer of work.",
};

/** Priority for the headline retrograde (Mercury is the cultural headliner). */
const RETRO_ORDER = ["Mercury", "Venus", "Mars", "Saturn", "Jupiter", "Pluto", "Uranus", "Neptune"];

function eclipticLongitude(body: Astronomy.Body, date: Date): number {
  const time = dateToAstroTime(date);
  const vec = Astronomy.GeoVector(body, time, true);
  return Astronomy.Ecliptic(vec).elon;
}

/**
 * Which major planets are retrograde on a given date, computed from the
 * ephemeris (Sun and Moon never retrograde). A planet is retrograde when its
 * apparent ecliptic longitude is decreasing day over day.
 */
export function getActiveRetrogrades(date: Date = new Date()): RetrogradeInfo[] {
  const prev = new Date(date.getTime() - 24 * 60 * 60 * 1000);
  const found: RetrogradeInfo[] = [];
  for (const [planet, body] of Object.entries(RETRO_BODIES)) {
    const today = eclipticLongitude(body, date);
    const yesterday = eclipticLongitude(body, prev);
    let delta = today - yesterday;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    if (delta < 0) {
      found.push({ planet, sign: getCurrentPlanetSign(planet, date).full, meaning: RETRO_MEANING[planet] });
    }
  }
  return found.sort((a, b) => RETRO_ORDER.indexOf(a.planet) - RETRO_ORDER.indexOf(b.planet));
}
