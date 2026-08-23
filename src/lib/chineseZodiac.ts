/**
 * Chinese zodiac — computed, not looked up.
 *
 * The zodiac year does NOT start on 1 January: it starts at Chinese New Year,
 * which is the second new moon after the December solstice (the lunar month
 * containing the solstice is month 11, so month 1 begins two new moons later).
 * Both are computed from real ephemeris in China Standard Time (UTC+8), the
 * meridian the calendar is defined against — so someone born in late January
 * gets the correct (previous) animal instead of an off-by-one-year answer.
 *
 * Three animals are derived, which is how the system is normally read:
 *   - year animal   ("outer" / how the world sees you) — from Chinese New Year
 *   - month animal  ("inner" / your private drives)    — from the solar terms
 *   - hour animal   ("secret" / your true self)        — from the double-hour
 *
 * Month branches follow SOLAR terms, not lunar months: the Tiger month begins
 * at Lì Chūn, when the Sun reaches 315° ecliptic longitude (~4 Feb), and each
 * branch runs 30° of solar longitude from there.
 */

import * as Astronomy from "astronomy-engine";

export const ZODIAC_ANIMALS = [
  "Rat", "Ox", "Tiger", "Rabbit", "Dragon", "Snake",
  "Horse", "Goat", "Monkey", "Rooster", "Dog", "Pig",
] as const;
export type ZodiacAnimal = (typeof ZODIAC_ANIMALS)[number];

export const ZODIAC_ELEMENTS = ["Wood", "Fire", "Earth", "Metal", "Water"] as const;
export type ZodiacElement = (typeof ZODIAC_ELEMENTS)[number];

const CST_OFFSET_MS = 8 * 3600 * 1000; // China Standard Time, UTC+8

export interface ChineseZodiac {
  animal: ZodiacAnimal;        // year ("outer") animal
  element: ZodiacElement;      // year element, from the heavenly stem
  polarity: "Yang" | "Yin";
  yearName: string;            // e.g. "Yang Wood Dragon"
  zodiacYear: number;          // the zodiac year the birth falls in
  newYear: string;             // ISO date of that year's Chinese New Year (CST)
  innerAnimal: ZodiacAnimal;   // month animal
  secretAnimal: ZodiacAnimal;  // hour animal
}

/** Local-date string in China Standard Time (the calendar's reference meridian). */
function cstDateString(d: Date): string {
  return new Date(d.getTime() + CST_OFFSET_MS).toISOString().slice(0, 10);
}

/** The UTC instant of Chinese New Year: 2nd new moon after the prior December solstice. */
function chineseNewYearInstant(year: number): Date {
  const solstice = Astronomy.Seasons(year - 1).dec_solstice.date;
  let nm = Astronomy.SearchMoonPhase(0, solstice, 40)!.date;                       // 1st new moon
  nm = Astronomy.SearchMoonPhase(0, new Date(nm.getTime() + 86400000), 40)!.date;  // 2nd
  return nm;
}

/**
 * Chinese New Year as a CST calendar date, "YYYY-MM-DD" — the form you want for
 * display or comparison. (The underlying instant is UTC, and CNY falls late in
 * the UTC day often enough that using it directly is an off-by-one trap.)
 */
export function chineseNewYear(year: number): string {
  return cstDateString(chineseNewYearInstant(year));
}

/**
 * @param birthDate "YYYY-MM-DD"
 * @param birthTime "HH:MM" local to the birthplace (used for the hour animal)
 * @param utcInstant exact UTC instant of birth, when known. The month animal is
 *   set by solar terms, so a birth within a few hours of a term boundary (~3% of
 *   births) needs the real instant to land on the right side; without it we
 *   assume noon UTC on the birth date.
 */
export function computeChineseZodiac(
  birthDate: string,
  birthTime?: string | null,
  utcInstant?: Date | null,
): ChineseZodiac | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(birthDate.trim());
  if (!m) return null;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];

  const birth = utcInstant ?? new Date(Date.UTC(y, mo - 1, d, 12, 0));

  // Which zodiac year? Before this year's CNY → the previous zodiac year.
  const zodiacYear = birthDate < chineseNewYear(y) ? y - 1 : y;
  const newYear = chineseNewYear(zodiacYear);   // the CNY that opened THEIR zodiac year

  // Sexagenary cycle: stem (10) gives element + polarity, branch (12) the animal.
  const stem = ((zodiacYear - 4) % 10 + 10) % 10;
  const branch = ((zodiacYear - 4) % 12 + 12) % 12;
  const animal = ZODIAC_ANIMALS[branch];
  const element = ZODIAC_ELEMENTS[Math.floor(stem / 2)];
  const polarity = stem % 2 === 0 ? "Yang" : "Yin";

  // Month ("inner") animal — solar terms. Tiger month starts at solar longitude 315°.
  const sunLon = Astronomy.SunPosition(birth).elon;
  const innerAnimal = ZODIAC_ANIMALS[(2 + Math.floor((((sunLon - 315) % 360) + 360) % 360 / 30)) % 12];

  // Hour ("secret") animal — the double-hours, Rat spanning 23:00–01:00.
  const hour = birthTime && /^\d{1,2}:\d{2}$/.test(birthTime) ? Number(birthTime.split(":")[0]) : 12;
  const secretAnimal = ZODIAC_ANIMALS[Math.floor(((hour + 1) % 24) / 2)];

  return {
    animal, element, polarity,
    yearName: `${polarity} ${element} ${animal}`,
    zodiacYear, newYear, innerAnimal, secretAnimal,
  };
}

/**
 * The plate for each sign, under /public/zodiac.
 *
 * Nine of the twelve are the same creature the Animal Guides library already
 * has painted, so those plates were copied across rather than re-commissioned.
 * They live under their own zodiac/ names deliberately: the two libraries mean
 * different things, and someone can be matched to the Rat as a guide AND be
 * born in a Rat year, so each set has to be replaceable without disturbing the
 * other.
 *
 * Rabbit, Goat and Pig have no honest match — the library's nearest animals are
 * the hare, the wild ram and the wild boar, which are different creatures from
 * the 兔, 羊 and 猪 of the zodiac — so those three are their own plates.
 */
export const ZODIAC_ART: Record<ZodiacAnimal, string> = {
  Rat: "/zodiac/zodiac.rat.webp",
  Ox: "/zodiac/zodiac.ox.webp",
  Tiger: "/zodiac/zodiac.tiger.webp",
  Rabbit: "/zodiac/zodiac.rabbit.webp",
  Dragon: "/zodiac/zodiac.dragon.webp",
  Snake: "/zodiac/zodiac.snake.webp",
  Horse: "/zodiac/zodiac.horse.webp",
  Goat: "/zodiac/zodiac.goat.webp",
  Monkey: "/zodiac/zodiac.monkey.webp",
  Rooster: "/zodiac/zodiac.rooster.webp",
  Dog: "/zodiac/zodiac.dog.webp",
  Pig: "/zodiac/zodiac.pig.webp",
};

/** Short reading per animal — what the sign is traditionally said to carry. */
export const ANIMAL_TRAIT: Record<ZodiacAnimal, string> = {
  Rat: "Quick, resourceful, and always three moves ahead — you find the opening others walk past.",
  Ox: "Steady past the point most people quit. What you start finishes, even if it takes years.",
  Tiger: "Courage first, plan second. You move on instinct and dare the room to keep up.",
  Rabbit: "Diplomatic and quietly exacting — you win by reading the situation, never by force.",
  Dragon: "Vivid and unmissable. You take up space naturally and expect the scale to match.",
  Snake: "Watchful, private, and precise. You say a fraction of what you've worked out.",
  Horse: "Restless and warm, built for movement — fences read as suggestions.",
  Goat: "Gentle and unusually perceptive; you make things beautiful and let others take the credit.",
  Monkey: "Inventive and irreverent, solving by cleverness what others solve by grinding.",
  Rooster: "Direct, exacting, and unafraid to say the thing at the volume it deserves.",
  Dog: "Loyal past the point of sense, with a strong and inconvenient conscience.",
  Pig: "Generous and unguarded — you give the benefit of the doubt long after it's earned.",
};

/** What the element layer adds on top of the animal. */
export const ELEMENT_TRAIT: Record<ZodiacElement, string> = {
  Wood: "Wood grows outward — expansion, cooperation, and a long view of what you're building.",
  Fire: "Fire adds heat and visibility: passion, urgency, and a talent for drawing people in.",
  Earth: "Earth steadies everything: patience, reliability, and a preference for solid ground.",
  Metal: "Metal sharpens: discipline, clarity, and an edge that cuts through vagueness.",
  Water: "Water goes around obstacles — intuition, adaptability, and quiet persistence.",
};
