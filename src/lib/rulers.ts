/**
 * Rulers Layer — Sect Light + Lord of the Year (annual profection)
 *
 * These two rulers form the foundation of the rulers framework:
 * - Sect Light: Sun (day chart) or Moon (night chart) — the MVP of your chart
 * - Lord of the Year: The planet ruling your current profection house
 *
 * Both are computed client-side from existing chart data.
 */

import { SIGN_FULL } from "./knowledge";

/* ─── Sign → Traditional ruler mapping ─── */
const TRADITIONAL_RULER: Record<string, string> = {
  Ari: "Mars",     Tau: "Venus",    Gem: "Mercury",
  Can: "Moon",     Leo: "Sun",      Vir: "Mercury",
  Lib: "Venus",    Sco: "Mars",     Sag: "Jupiter",
  Cap: "Saturn",   Aqu: "Saturn",   Pis: "Jupiter",
};

/* ─── Interfaces ─── */

export interface SectLightInfo {
  sect: "day" | "night";
  sectLight: "Sun" | "Moon";
  sectLightSign: string;       // abbreviation e.g. "Sco"
  sectLightHouse: string | null;
  benefic: string;             // sect benefic (Jupiter for day, Venus for night)
  malefic: string;             // sect malefic (Saturn for day, Mars for night)
  summary: string;
}

export interface LordOfTheYearInfo {
  age: number;
  profectionHouse: number;     // 1-12
  profectionSign: string;      // abbreviation of the sign on that house cusp
  lordPlanet: string;          // the planet ruling that sign (traditional)
  lordSign: string;            // what sign the lord is in natally
  lordHouse: string | null;    // what house the lord is in natally
  nextBirthday: string;        // ISO date of next profection change
  summary: string;
}

/* ─── Sect Light calculation ─── */

/**
 * Determine sect (day/night) from the Sun's house position.
 * Day chart = Sun above the horizon (houses 7-12 in whole sign).
 * We use the Sun's house directly: houses 7, 8, 9, 10, 11, 12 = day chart.
 */
export function getSectLight(
  planets: Array<{ name: string; sign: string; house: string | null }>,
  houses: Array<{ number: number; sign: string }>
): SectLightInfo | null {
  const sun = planets.find(p => p.name === "Sun");
  const moon = planets.find(p => p.name === "Moon");
  if (!sun || !moon) return null;

  // Determine house number from the house string
  const sunHouseNum = parseHouse(sun.house);

  // Day chart if Sun is in houses 7-12 (above the horizon)
  // This is a simplification; technically it's based on the descendant,
  // but whole-sign houses make this straightforward.
  const isDayChart = sunHouseNum !== null && sunHouseNum >= 7;

  const sect: "day" | "night" = isDayChart ? "day" : "night";
  const sectLight = isDayChart ? "Sun" : "Moon";
  const sectPlanet = isDayChart ? sun : moon;

  const benefic = isDayChart ? "Jupiter" : "Venus";
  const malefic = isDayChart ? "Saturn" : "Mars";

  const signFull = SIGN_FULL[sectPlanet.sign] || sectPlanet.sign;
  const summary = isDayChart
    ? `You were born during the day, making you a day chart. Your Sun is your sect light — the planet that leads your team. In ${signFull}, your Sun operates with full authority. Day charts tend to be more visible, externally driven, and action-oriented.`
    : `You were born at night, making you a night chart. Your Moon is your sect light — the planet that leads your team. In ${signFull}, your Moon sets the emotional tone for everything. Night charts tend to be more internal, reflective, and emotionally driven.`;

  return {
    sect,
    sectLight,
    sectLightSign: sectPlanet.sign,
    sectLightHouse: sectPlanet.house,
    benefic,
    malefic,
    summary,
  };
}

/* ─── Lord of the Year (Annual Profection) ─── */

/**
 * Calculate the Lord of the Year using annual profections.
 *
 * Algorithm:
 * 1. Determine user's age (years since birth)
 * 2. Profection house = (age % 12) + 1
 * 3. Find the sign on that house cusp (whole sign houses = house N starts with sign N from rising)
 * 4. Traditional ruler of that sign = Lord of the Year
 */
export function getLordOfTheYear(
  birthDate: string,
  planets: Array<{ name: string; sign: string; house: string | null }>,
  houses: Array<{ number: number; sign: string }>,
  referenceDate?: Date
): LordOfTheYearInfo | null {
  if (!birthDate || !houses.length) return null;

  const now = referenceDate || new Date();
  const [birthY, birthM, birthD] = String(birthDate).split("-").map(Number);
  if (!birthY || !birthM || !birthD) return null;

  // Calculate age (have they had their birthday this year?)
  let age = now.getFullYear() - birthY;
  const birthdayThisYear = new Date(now.getFullYear(), birthM - 1, birthD);
  if (now < birthdayThisYear) {
    age -= 1;
  }
  if (age < 0) age = 0;

  // Profection house = (age % 12) + 1
  const profectionHouse = (age % 12) + 1;

  // Use the sign on the Placidus cusp for the profection house
  // (matches the house system the rest of the chart displays)
  const profectionHouseData = houses.find(h => h.number === profectionHouse);
  if (!profectionHouseData) return null;
  const profectionSign = profectionHouseData.sign;
  const lordPlanet = TRADITIONAL_RULER[profectionSign];
  if (!lordPlanet) return null;

  // Find the lord's natal position
  const lordNatal = planets.find(p => p.name === lordPlanet);
  const lordSign = lordNatal?.sign || "?";
  const lordHouse = lordNatal?.house || null;

  // Find any natal planets sitting in the profection sign (co-activated this year)
  const planetsInProfectionSign = planets
    .filter(p => p.sign === profectionSign && p.name !== lordPlanet)
    .map(p => p.name);

  // Calculate next birthday (when profection changes)
  let nextBirthday: Date;
  if (now >= birthdayThisYear) {
    nextBirthday = new Date(now.getFullYear() + 1, birthM - 1, birthD);
  } else {
    nextBirthday = birthdayThisYear;
  }

  const signFull = SIGN_FULL[profectionSign] || profectionSign;
  const lordSignFull = SIGN_FULL[lordSign] || lordSign;
  const houseOrd = ORDINAL[profectionHouse] || `${profectionHouse}th`;
  const lordHouseOrd = lordHouse ? houseOrdFromString(lordHouse) : null;

  // Build summary
  const houseTheme = HOUSE_THEMES[profectionHouse] || "";
  const lordInSign = lordSignFull !== "?" ? ` ${lordPlanet} sits in ${lordSignFull} in your birth chart${lordHouseOrd ? ` (${lordHouseOrd} house)` : ""}, coloring how this year unfolds.` : "";
  const coActivated = planetsInProfectionSign.length > 0
    ? ` Your natal ${planetsInProfectionSign.join(" and ")} ${planetsInProfectionSign.length === 1 ? "is" : "are"} also in ${signFull}, so ${planetsInProfectionSign.length === 1 ? "it gets" : "they get"} activated this year too.`
    : "";

  const summary = `You're ${age} — a ${houseOrd} house profection year. Your ${houseOrd} house cusp falls in ${signFull}, ruled by ${lordPlanet}. This year, ${lordPlanet} is your Lord of the Year. ${houseTheme}${lordInSign}${coActivated} Watch transits to your natal ${lordPlanet} closely — they're the plot points of your year.`;

  return {
    age,
    profectionHouse,
    profectionSign,
    lordPlanet,
    lordSign,
    lordHouse,
    nextBirthday: nextBirthday.toISOString().split("T")[0],
    summary,
  };
}

/* ─── Helpers ─── */

function parseHouse(house: string | number | null): number | null {
  if (house == null) return null;
  if (typeof house === "number") return house >= 1 && house <= 12 ? house : null;
  const map: Record<string, number> = {
    First: 1, Second: 2, Third: 3, Fourth: 4, Fifth: 5, Sixth: 6,
    Seventh: 7, Eighth: 8, Ninth: 9, Tenth: 10, Eleventh: 11, Twelfth: 12,
  };
  const word = String(house).split("_")[0];
  return map[word] || null;
}

function houseOrdFromString(house: string): string | null {
  const num = parseHouse(house);
  if (!num) return null;
  return ORDINAL[num] || null;
}

const ORDINAL: Record<number, string> = {
  1: "1st", 2: "2nd", 3: "3rd", 4: "4th", 5: "5th", 6: "6th",
  7: "7th", 8: "8th", 9: "9th", 10: "10th", 11: "11th", 12: "12th",
};

/** What each profection house year is about */
const HOUSE_THEMES: Record<number, string> = {
  1: "This is a year about you — your identity, your body, your direction. Fresh starts and personal reinvention.",
  2: "This is a year about money, self-worth, and what you value. Resources and stability take center stage.",
  3: "This is a year about communication, learning, siblings, and your immediate world. Ideas are in motion.",
  4: "This is a year about home, family, roots, and your private world. The foundation matters most now.",
  5: "This is a year about creativity, romance, joy, and self-expression. What makes you come alive leads the way.",
  6: "This is a year about health, daily routines, work, and service. How you structure your days changes everything.",
  7: "This is a year about partnerships, marriage, and one-on-one relationships. The other person matters enormously right now.",
  8: "This is a year about transformation, shared resources, intimacy, and endings that lead to beginnings.",
  9: "This is a year about travel, higher learning, philosophy, and expansion. Your worldview is under construction.",
  10: "This is a year about career, public reputation, and legacy. What you build in the world is the focus.",
  11: "This is a year about community, friendships, hopes, and your vision for the future. Your people matter most.",
  12: "This is a year about solitude, spirituality, rest, and what's hidden. The inner world needs tending.",
};

/**
 * Check if a transit involves the Lord of the Year planet.
 * Used for re-ranking transits on the Maps → My Transits screen.
 */
export function isLordOfYearTransit(
  transitPlanet: string,
  natalPlanet: string,
  lordPlanet: string
): boolean {
  return transitPlanet === lordPlanet || natalPlanet === lordPlanet;
}

/**
 * Determine if today's transit involves the Lord of the Year,
 * for use in home screen headline copy.
 */
export function todayInvolvesLord(
  transits: Array<{ transitPlanet: string; natalPlanet: string }>,
  lordPlanet: string
): boolean {
  return transits.some(t => t.transitPlanet === lordPlanet || t.natalPlanet === lordPlanet);
}
