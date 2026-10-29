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
import { TRADITIONAL_RULER, modernRuler } from "./rulerships";

const ZODIAC_ORDER = ["Ari", "Tau", "Gem", "Can", "Leo", "Vir", "Lib", "Sco", "Sag", "Cap", "Aqu", "Pis"];

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
  profectionSign: string;      // abbreviation of the whole sign counted from the rising sign
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

  /**
   * No house for the Sun means no sect. Say so, rather than guessing.
   *
   * Sect is entirely a question of whether the Sun was above the horizon,
   * which cannot be known without a birth hour — and calculateChart
   * deliberately sets every planet.house to null when the time is unknown,
   * precisely so that nothing downstream invents one.
   *
   * This function then undid that. `sunHouseNum >= 7` is false for null, so
   * an unknown time fell through to "night", and every person who answered
   * "I don't know my birth time" was told, as bare fact, that they were born
   * at night and their Moon was in charge. It was the first thing they saw
   * after handing over their details. Half of them were simply told something
   * untrue, and the library had gone out of its way not to say it.
   */
  if (sunHouseNum === null) return null;

  // Day chart if Sun is in houses 7-12 (above the horizon)
  // This is a simplification; technically it's based on the descendant,
  // but whole-sign houses make this straightforward.
  const isDayChart = sunHouseNum >= 7;

  const sect: "day" | "night" = isDayChart ? "day" : "night";
  const sectLight = isDayChart ? "Sun" : "Moon";
  const sectPlanet = isDayChart ? sun : moon;

  const benefic = isDayChart ? "Jupiter" : "Venus";
  const malefic = isDayChart ? "Saturn" : "Mars";

  const signFull = SIGN_FULL[sectPlanet.sign] || sectPlanet.sign;
  const summary = isDayChart
    ? `You were born during the day, making you a day chart. Your Sun is your sect light — the luminary your whole chart takes its lead from. In ${signFull}, your Sun operates with full authority. Day charts tend to be more visible, externally driven, and action-oriented.`
    : `You were born at night, making you a night chart. Your Moon is your sect light — the luminary your whole chart takes its lead from. In ${signFull}, your Moon sets the emotional tone for everything. Night charts tend to be more internal, reflective, and emotionally driven.`;

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
 * 3. Count whole signs from the rising sign: the profected sign is the rising
 *    sign advanced by `age` signs. This is whole-sign, whatever house system
 *    the chart displays.
 * 4. Traditional ruler of that sign = Lord of the Year
 *
 * Profections are a Hellenistic technique, defined on whole signs. This used to
 * read the sign on the Placidus cusp of house N instead, which differs whenever
 * a sign is intercepted or duplicated on the cusps — common at higher latitudes —
 * and then named the wrong planet as the year's ruler. `houses` is still the
 * input because house 1 carries the rising sign in every system.
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

  // Whole-sign: count signs from the rising sign (house 1's sign in any system).
  const risingSign = houses.find(h => h.number === 1)?.sign;
  const risingIdx = risingSign ? ZODIAC_ORDER.indexOf(risingSign.slice(0, 3)) : -1;
  if (risingIdx < 0) return null;
  const profectionSign = ZODIAC_ORDER[(risingIdx + age) % 12];
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

  // Name the modern ruler too where it differs, so a reader who learned
  // "Scorpio is Pluto's" isn't left wondering why we said Mars.
  const modern = modernRuler(profectionSign);
  const rulerNote = modern && modern !== lordPlanet
    ? `${lordPlanet}, its traditional ruler (the modern ruler is ${modern}; profections use the traditional one)`
    : lordPlanet;

  const summary = `You're ${age} — a ${houseOrd} house profection year. Counting one sign per year from your rising sign lands on ${signFull}, ruled by ${rulerNote}. This year, ${lordPlanet} is your Lord of the Year. ${houseTheme}${lordInSign}${coActivated} Transits to your natal ${lordPlanet} are worth paying closer attention to this year.`;

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
  8: "This is a year about transformation, shared resources, intimacy, and letting go to make room.",
  9: "This is a year about travel, higher learning, philosophy, and expansion. Your worldview is under construction.",
  10: "This is a year about career, public reputation, and legacy. What you build in the world is the focus.",
  11: "This is a year about community, friendships, hopes, and your vision for the future. Your people matter most.",
  12: "This is a year about solitude, spirituality, rest, and what's hidden. The inner world needs tending.",
};

/**
 * Does this transit involve the Lord of the Year?
 *
 * Takes the whole aspect, because calculateTransits folds natal points that
 * sit within 10 degrees of each other into one row and lists the rest in
 * `alsoNatal`. This predicate read only `natalPlanet`, so a row rendered as
 * "Saturn square your Sun & Mercury" carried no year-ruler badge in a Mercury
 * year, and the "Year ruler only" filter dropped it — while the unfiltered
 * list named Mercury one line above.
 *
 * There used to be a second copy of this, todayInvolvesLord, with the same
 * body and no callers. The fold broke both at once; one predicate cannot
 * drift from itself.
 */
export function isLordOfYearTransit(
  transit: { transitPlanet: string; natalPlanet: string; alsoNatal?: string[] },
  lordPlanet: string,
): boolean {
  if (transit.transitPlanet === lordPlanet) return true;
  if (transit.natalPlanet === lordPlanet) return true;
  return !!transit.alsoNatal?.includes(lordPlanet);
}
