/**
 * Chinese zodiac — year animal + element, inner (month) animal, secret (hour)
 * animal, computed deterministically from birth date/time.
 *
 * Year boundary uses the solar term lichun (~Feb 4) rather than Chinese New
 * Year — the convention used in four-pillars readings, and accurate to ±1 day,
 * which only matters for birthdays on the boundary itself.
 */

export const ZODIAC_ANIMALS = [
  "Rat", "Ox", "Tiger", "Rabbit", "Dragon", "Snake",
  "Horse", "Goat", "Monkey", "Rooster", "Dog", "Pig",
] as const;
export type ZodiacAnimal = (typeof ZODIAC_ANIMALS)[number];

export const ZODIAC_ELEMENTS = ["Wood", "Fire", "Earth", "Metal", "Water"] as const;
export type ZodiacElement = (typeof ZODIAC_ELEMENTS)[number];

/** One-line temperament per animal, written in the app's reading voice. */
export const ANIMAL_LINE: Record<ZodiacAnimal, string> = {
  Rat: "Quick to the opening, and already counting what it costs.",
  Ox: "Slow to start, impossible to stop once the yoke is on.",
  Tiger: "All in before the plan exists, and usually right anyway.",
  Rabbit: "Reads the room from the doorway and keeps an exit in view.",
  Dragon: "Built for the big gesture — quiet maintenance is the hard part.",
  Snake: "Says a tenth of what it knows and misses nothing.",
  Horse: "Happiest mid-gallop; the stable is where the doubts live.",
  Goat: "Soft-hearted and stubborn about the strangest hills.",
  Monkey: "Solves it, then gets bored guarding the solution.",
  Rooster: "Sees the flaw first and can't unsee it — in things and in people.",
  Dog: "Loyal past the point of sense, and restless in the ribs about it.",
  Pig: "Generous to a fault line — gives until the giving is the problem.",
};

export interface ChineseZodiacResult {
  yearAnimal: ZodiacAnimal;
  element: ZodiacElement;
  /** Inner animal — from the solar month. */
  monthAnimal: ZodiacAnimal;
  /** Secret animal — from the birth hour; null when the time is unknown. */
  hourAnimal: ZodiacAnimal | null;
  /** e.g. "Wood Dog" */
  title: string;
  line: string;
}

// Solar-month start days (approximate solar terms): the animal month beginning
// in each calendar month. Index 0 = January (Ox month starts ~Jan 6).
const MONTH_STARTS: Array<{ day: number; animal: ZodiacAnimal }> = [
  { day: 6, animal: "Ox" },      // Jan
  { day: 4, animal: "Tiger" },   // Feb
  { day: 6, animal: "Rabbit" },  // Mar
  { day: 5, animal: "Dragon" },  // Apr
  { day: 6, animal: "Snake" },   // May
  { day: 6, animal: "Horse" },   // Jun
  { day: 7, animal: "Goat" },    // Jul
  { day: 8, animal: "Monkey" },  // Aug
  { day: 8, animal: "Rooster" }, // Sep
  { day: 8, animal: "Dog" },     // Oct
  { day: 7, animal: "Pig" },     // Nov
  { day: 7, animal: "Rat" },     // Dec
];

export function computeChineseZodiac(
  birthDate: string, // YYYY-MM-DD
  birthTime: string | null, // HH:MM
  unknownTime: boolean,
): ChineseZodiacResult | null {
  const dm = /^(\d{4})-(\d{2})-(\d{2})$/.exec(birthDate);
  if (!dm) return null;
  const year = Number(dm[1]);
  const month = Number(dm[2]); // 1-12
  const day = Number(dm[3]);

  // Year pillar — births before lichun (~Feb 4) belong to the previous year.
  const effYear = month < 2 || (month === 2 && day < 4) ? year - 1 : year;
  const yearAnimal = ZODIAC_ANIMALS[((effYear - 4) % 12 + 12) % 12];
  const element = ZODIAC_ELEMENTS[Math.floor((((effYear - 4) % 10 + 10) % 10) / 2)];

  // Month pillar — the solar month the birthday falls in.
  const idx = month - 1;
  const inCurrent = day >= MONTH_STARTS[idx].day;
  const monthAnimal = inCurrent ? MONTH_STARTS[idx].animal : MONTH_STARTS[(idx + 11) % 12].animal;

  // Hour pillar — two-hour branches starting with Rat at 23:00.
  let hourAnimal: ZodiacAnimal | null = null;
  if (!unknownTime && birthTime && /^\d{1,2}:\d{2}$/.test(birthTime)) {
    const h = Number(birthTime.split(":")[0]);
    hourAnimal = ZODIAC_ANIMALS[Math.floor(((h + 1) % 24) / 2)];
  }

  return {
    yearAnimal,
    element,
    monthAnimal,
    hourAnimal,
    title: `${element} ${yearAnimal}`,
    line: ANIMAL_LINE[yearAnimal],
  };
}
