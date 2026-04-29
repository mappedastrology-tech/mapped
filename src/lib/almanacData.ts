/**
 * Almanac Data — daily sky data, activity guidance, and celestial observations.
 *
 * Provides deterministic, date-based almanac data for the Mapped astrology app.
 * Uses approximate astronomical formulas tuned for ~30degN latitude (central Texas).
 * Not JPL-accurate, but plausible and consistent.
 */

import {
  getMoonPhase,
  getCurrentZodiacSeason,
  getNextMoonEvents,
  PLANETARY_DAYS,
  ZODIAC_SEASONS,
  MOON_LORE,
  type MoonPhaseInfo,
  type ZodiacSeason,
  type PlanetaryDay,
} from "@/lib/celestialCalendar";

// ─── TYPES ────────────────────────────────────────────────────────────────────

export interface TodaySky {
  sunrise: string;
  sunset: string;
  dayLengthHours: number;
  dayLengthMinutes: number;
  dayLengthDirection: "longer" | "shorter" | "equinox";
  moonPhase: MoonPhaseInfo;
  moonSign: string;
  moonSignElement: "fire" | "water" | "earth" | "air";
  sunSign: string;
  sunSignTheme: string;
  dayOfSeason: number;
  planetaryRuler: PlanetaryDay;
  voidOfCourseMoon: VoidOfCourseMoonWindow | null;
}

export interface VoidOfCourseMoonWindow {
  start: string;   // time string like "2:15 PM"
  end: string;     // time string like "6:42 PM"
  duration: string; // e.g. "4h 27m"
  note: string;     // brief guidance
}

export interface GoodForItem {
  activity: string;
  icon: string;
}

export interface HoldOffResult {
  items: GoodForItem[];
  reason: string;
  duration?: string;
}

export interface TonightSkyResult {
  observation: string;
  emoji: string;
}

export interface ThisMoonResult {
  name: string;
  fullDate: Date;
  origin: string;
  lore: string;
  otherNames: string[];
  daysUntilFull: number;
}

export interface ComingUpEvent {
  date: Date;
  label: string;
}

export interface GardenTips {
  bestDays: { activity: string; dates: string }[];
  localNote: string;
}

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const ZODIAC_SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
] as const;

const SIGN_ELEMENTS: Record<string, "fire" | "water" | "earth" | "air"> = {
  Aries: "fire", Taurus: "earth", Gemini: "air", Cancer: "water",
  Leo: "fire", Virgo: "earth", Libra: "air", Scorpio: "water",
  Sagittarius: "fire", Capricorn: "earth", Aquarius: "air", Pisces: "water",
};

/** Synodic month in days — moon completes one zodiac cycle in ~27.32 days */
const SIDEREAL_MONTH = 27.321661;
const KNOWN_NEW_MOON = new Date("2024-01-11T11:57:00Z").getTime();

// ─── MOON SIGN ACTIVITIES (curated per specification) ─────────────────────────

const MOON_SIGN_ACTIVITIES: Record<string, GoodForItem[]> = {
  Aries: [
    { activity: "Starting a new project", icon: "🚀" },
    { activity: "Beginning an exercise routine", icon: "💪" },
    { activity: "Getting a haircut for growth", icon: "✂️" },
    { activity: "Having that hard conversation", icon: "🗣️" },
  ],
  Taurus: [
    { activity: "Starting a skincare routine", icon: "🧴" },
    { activity: "Making a big purchase you've researched", icon: "💎" },
    { activity: "Hosting a gathering", icon: "🍽️" },
    { activity: "Planting something", icon: "🌱" },
  ],
  Gemini: [
    { activity: "Going on a first date", icon: "💬" },
    { activity: "Signing contracts or agreements", icon: "📝" },
    { activity: "Starting a creative writing project", icon: "✍️" },
    { activity: "Reaching out to someone you've lost touch with", icon: "📱" },
  ],
  Cancer: [
    { activity: "Deep cleaning your space", icon: "🧹" },
    { activity: "Starting a home improvement", icon: "🏠" },
    { activity: "Cooking or preserving food", icon: "🥘" },
    { activity: "Nurturing an important relationship", icon: "💛" },
  ],
  Leo: [
    { activity: "Getting a tattoo or piercing", icon: "🎨" },
    { activity: "Throwing or attending a party", icon: "🎉" },
    { activity: "Working on a creative project", icon: "🎭" },
    { activity: "Expressing yourself boldly", icon: "👑" },
  ],
  Virgo: [
    { activity: "Starting a health routine", icon: "🥗" },
    { activity: "Organizing your space or schedule", icon: "📋" },
    { activity: "Deep cleaning and decluttering", icon: "✨" },
    { activity: "Scheduling a dental or doctor appointment", icon: "🩺" },
  ],
  Libra: [
    { activity: "Getting a beauty treatment", icon: "💅" },
    { activity: "Going on a first date", icon: "🌹" },
    { activity: "Redecorating a room", icon: "🖼️" },
    { activity: "Working on a partnership", icon: "🤝" },
  ],
  Scorpio: [
    { activity: "Quitting a bad habit", icon: "🔥" },
    { activity: "Doing shadow work or therapy", icon: "🪞" },
    { activity: "Having a deep conversation", icon: "🌊" },
    { activity: "Scheduling surgery or procedures", icon: "⚕️" },
  ],
  Sagittarius: [
    { activity: "Booking or starting travel", icon: "✈️" },
    { activity: "Starting a class or course", icon: "📚" },
    { activity: "Big-picture planning", icon: "🗺️" },
    { activity: "Doing something adventurous", icon: "🏔️" },
  ],
  Capricorn: [
    { activity: "Making a career move", icon: "📈" },
    { activity: "Submitting a job application", icon: "💼" },
    { activity: "Financial planning", icon: "🏦" },
    { activity: "Committing to something long-term", icon: "🪨" },
  ],
  Aquarius: [
    { activity: "Trying something totally new", icon: "⚡" },
    { activity: "Joining or starting a group project", icon: "🤲" },
    { activity: "Volunteering or humanitarian work", icon: "🌍" },
    { activity: "Innovating on a problem", icon: "💡" },
  ],
  Pisces: [
    { activity: "Spiritual practice or meditation", icon: "🧘" },
    { activity: "Dream journaling", icon: "🌙" },
    { activity: "Making art", icon: "🎨" },
    { activity: "Healing work — yours or someone else's", icon: "💜" },
  ],
};

// Waxing-phase bonus activities (growth/beginning)
const WAXING_BONUS: GoodForItem[] = [
  { activity: "Setting new intentions", icon: "🌱" },
  { activity: "Starting something you've been putting off", icon: "✨" },
];

// Waning-phase bonus activities (releasing/completing)
const WANING_BONUS: GoodForItem[] = [
  { activity: "Finishing a lingering project", icon: "✅" },
  { activity: "Letting go of what's not working", icon: "🍂" },
];

// ─── TONIGHT'S SKY OBSERVATIONS (~30 curated entries) ─────────────────────────

interface SkyObservation {
  text: string;
  emoji: string;
  /** Which conditions trigger this: season (0-3 for spring/summer/fall/winter), moonPhase, or dayOfYear range */
  condition: {
    season?: number;
    phaseGroup?: "new" | "waxing" | "full" | "waning";
    dayRange?: [number, number];
  };
}

const SKY_OBSERVATIONS: SkyObservation[] = [
  // Moon-phase driven
  { text: "The sky is moonless tonight. Every star is sharper for it.", emoji: "✨", condition: { phaseGroup: "new" } },
  { text: "A thin crescent hangs in the west after sunset — the kind of moon that feels like a secret.", emoji: "🌙", condition: { phaseGroup: "waxing" } },
  { text: "The moon rises early tonight — bright enough to read by, if you're outside.", emoji: "🌕", condition: { phaseGroup: "full" } },
  { text: "The waning moon won't rise until well after midnight. The early evening belongs to the stars.", emoji: "🌌", condition: { phaseGroup: "waning" } },

  // Seasonal — Spring (season 0)
  { text: "Venus is the brightest point in the western sky after sunset tonight.", emoji: "💫", condition: { season: 0 } },
  { text: "Spring evenings are short but sweet — Orion is setting in the west, giving way to Leo overhead.", emoji: "🦁", condition: { season: 0 } },
  { text: "The Big Dipper is high in the northeast tonight. Follow the arc of its handle to find Arcturus, one of the brightest stars.", emoji: "⭐", condition: { season: 0 } },
  { text: "The spring sky turns over slowly tonight — winter constellations sinking, summer ones rising in the east.", emoji: "🌅", condition: { season: 0 } },
  { text: "If you can find Virgo tonight (look south), you're looking toward a cluster of thousands of galaxies.", emoji: "🌌", condition: { season: 0 } },

  // Seasonal — Summer (season 1)
  { text: "The Summer Triangle — Vega, Deneb, Altair — is nearly overhead. Three stars, three eagles, one sky.", emoji: "🔺", condition: { season: 1 } },
  { text: "Scorpius is low in the south tonight. Its red heart, Antares, is a star 700 times wider than our sun.", emoji: "🦂", condition: { season: 1 } },
  { text: "Jupiter is up most of the night this month, bright and steady in the eastern sky after dark.", emoji: "🪐", condition: { season: 1 } },
  { text: "The Milky Way is at its best on moonless summer nights. If you can get away from city lights, it's worth it.", emoji: "🌌", condition: { season: 1 } },
  { text: "Warm nights and late sunsets make this the easiest time of year to stargaze. No coat required.", emoji: "🌃", condition: { season: 1 } },

  // Seasonal — Fall (season 2)
  { text: "Mars is visible in the east after sunset, glowing with its unmistakable orange tint.", emoji: "🔴", condition: { season: 2 } },
  { text: "The Great Square of Pegasus is high in the south tonight — autumn's signature constellation.", emoji: "🐴", condition: { season: 2 } },
  { text: "Nights are growing noticeably longer. The sky gets dark early enough to stargaze before bedtime.", emoji: "🌙", condition: { season: 2 } },
  { text: "Andromeda — the nearest galaxy, 2.5 million light-years away — is visible tonight as a faint smudge near Pegasus.", emoji: "🌀", condition: { season: 2 } },
  { text: "The autumn sky has a quiet grandeur. Fewer bright stars, but the ones that are there feel closer.", emoji: "✨", condition: { season: 2 } },

  // Seasonal — Winter (season 3)
  { text: "Orion dominates the southern sky tonight. Its three belt stars point to Sirius, the brightest star.", emoji: "⭐", condition: { season: 3 } },
  { text: "Cold air makes for steady seeing. The stars barely twinkle tonight — they look like tiny holes poked in the dark.", emoji: "🌌", condition: { season: 3 } },
  { text: "The Pleiades — a tiny cluster of blue-white stars — are high overhead. The Japanese call them Subaru.", emoji: "💠", condition: { season: 3 } },
  { text: "Winter has the most bright stars of any season. Step outside after dinner and look south — it's a light show.", emoji: "🌟", condition: { season: 3 } },
  { text: "The longest nights of the year mean the most starlight. Bundle up — it's worth it.", emoji: "🧣", condition: { season: 3 } },

  // Meteor showers / special events (by day-of-year range)
  { text: "The Quadrantid meteor shower peaks around now — look northeast after midnight for fast, bright streaks.", emoji: "☄️", condition: { dayRange: [2, 5] } },
  { text: "The Lyrid meteor shower is active. Look for 10-20 meteors per hour in the predawn sky.", emoji: "☄️", condition: { dayRange: [110, 114] } },
  { text: "The Perseid meteor shower peaks tonight. Up to 100 meteors per hour if the moon cooperates.", emoji: "☄️", condition: { dayRange: [223, 226] } },
  { text: "The Geminid meteor shower — the year's best — peaks around now. Bundle up and look up.", emoji: "☄️", condition: { dayRange: [347, 350] } },
  { text: "Tonight is close to the summer solstice. The sun barely dips below the horizon, and twilight lingers late.", emoji: "🌅", condition: { dayRange: [170, 174] } },
  { text: "The winter solstice is near. The longest night of the year — and the turn back toward the light.", emoji: "🕯️", condition: { dayRange: [353, 357] } },
];

// ─── FULL MOON NAMES BY MONTH ─────────────────────────────────────────────────

const FULL_MOON_NAMES: { name: string; otherNames: string[] }[] = [
  { name: "Wolf Moon",       otherNames: ["Old Moon", "Moon After Yule", "Ice Moon"] },
  { name: "Snow Moon",       otherNames: ["Hunger Moon", "Storm Moon", "Bone Moon"] },
  { name: "Worm Moon",       otherNames: ["Sap Moon", "Crow Moon", "Crust Moon"] },
  { name: "Pink Moon",       otherNames: ["Sprouting Grass Moon", "Egg Moon", "Fish Moon"] },
  { name: "Flower Moon",     otherNames: ["Milk Moon", "Corn Planting Moon", "Hare Moon"] },
  { name: "Strawberry Moon", otherNames: ["Honey Moon", "Mead Moon", "Rose Moon"] },
  { name: "Buck Moon",       otherNames: ["Thunder Moon", "Hay Moon", "Wyrt Moon"] },
  { name: "Sturgeon Moon",   otherNames: ["Green Corn Moon", "Grain Moon", "Red Moon"] },
  { name: "Harvest Moon",    otherNames: ["Corn Moon", "Barley Moon"] },
  { name: "Hunter's Moon",   otherNames: ["Blood Moon", "Sanguine Moon", "Travel Moon"] },
  { name: "Beaver Moon",     otherNames: ["Frost Moon", "Mourning Moon", "Oak Moon"] },
  { name: "Cold Moon",       otherNames: ["Long Night Moon", "Moon Before Yule"] },
];

// ─── HELPER UTILITIES ─────────────────────────────────────────────────────────

/** Day of year (1-366) */
function dayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

/** Season index: 0=spring, 1=summer, 2=fall, 3=winter (Northern Hemisphere) */
function getSeason(date: Date): number {
  const m = date.getMonth(); // 0-based
  if (m >= 2 && m <= 4) return 0; // Mar-May
  if (m >= 5 && m <= 7) return 1; // Jun-Aug
  if (m >= 8 && m <= 10) return 2; // Sep-Nov
  return 3; // Dec-Feb
}

/** Deterministic pseudo-random based on a seed number (0-1 range) */
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

/** Format a decimal hour as "H:MM AM/PM" */
function formatTime(decimalHours: number): string {
  const totalMinutes = Math.round(decimalHours * 60);
  let hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const ampm = hours >= 12 ? "PM" : "AM";
  if (hours > 12) hours -= 12;
  if (hours === 0) hours = 12;
  return `${hours}:${minutes.toString().padStart(2, "0")} ${ampm}`;
}

/**
 * Approximate sunrise/sunset for ~30degN latitude (Austin/San Antonio area).
 * Uses a simplified sinusoidal model based on day of year.
 * Sunrise ranges ~5:30 (summer) to ~7:15 (winter).
 * Sunset ranges ~5:30 (winter) to ~8:35 (summer).
 */
function getSunTimes(date: Date): { sunrise: number; sunset: number } {
  const doy = dayOfYear(date);
  // Day offset from summer solstice (day ~172)
  const angle = ((doy - 172) / 365.25) * 2 * Math.PI;

  // Sunrise: oscillates around 6:22 with amplitude ~0.88 hours
  const sunrise = 6.37 + 0.88 * Math.cos(angle);

  // Sunset: oscillates around 19:02 (7:02 PM) with amplitude ~1.55 hours
  const sunset = 19.03 - 1.55 * Math.cos(angle);

  return { sunrise, sunset };
}

/**
 * Get the current moon sign based on date.
 * The moon spends ~2.33 days in each sign, cycling through all 12 in ~27.32 days.
 */
function getMoonSign(date: Date): string {
  const diff = date.getTime() - KNOWN_NEW_MOON;
  const daysSinceRef = diff / (1000 * 60 * 60 * 24);
  const cycleDays = ((daysSinceRef % SIDEREAL_MONTH) + SIDEREAL_MONTH) % SIDEREAL_MONTH;
  const signIndex = Math.floor((cycleDays / SIDEREAL_MONTH) * 12);
  return ZODIAC_SIGNS[signIndex];
}

/** Day number within the current zodiac season (1-based) */
function getDayOfSeason(date: Date, season: ZodiacSeason): number {
  const seasonStart = new Date(date.getFullYear(), season.startMonth - 1, season.startDay);
  // Handle Capricorn wrapping around year boundary
  if (season.startMonth > season.endMonth && date.getMonth() < season.startMonth - 1) {
    seasonStart.setFullYear(date.getFullYear() - 1);
  }
  const diff = date.getTime() - seasonStart.getTime();
  return Math.max(1, Math.floor(diff / (1000 * 60 * 60 * 24)) + 1);
}

/**
 * Generate a plausible void-of-course moon window.
 * VOC occurs when the moon makes its last major aspect before leaving a sign.
 * We approximate this by placing a window near sign transitions.
 */
function getVoidOfCourseMoon(date: Date): VoidOfCourseMoonWindow | null {
  const diff = date.getTime() - KNOWN_NEW_MOON;
  const daysSinceRef = diff / (1000 * 60 * 60 * 24);
  const cycleDays = ((daysSinceRef % SIDEREAL_MONTH) + SIDEREAL_MONTH) % SIDEREAL_MONTH;
  const daysPerSign = SIDEREAL_MONTH / 12;
  const positionInSign = cycleDays % daysPerSign;
  const fractionOfSign = positionInSign / daysPerSign;

  // VOC window happens in the last ~15% of a sign transit
  if (fractionOfSign < 0.85) return null;

  // Generate a plausible window using the date as seed
  const seed = dayOfYear(date) + date.getFullYear();
  const rand = seededRandom(seed);

  const startHour = 9 + Math.floor(rand * 10); // between 9 AM and 7 PM
  const durationMinutes = 90 + Math.floor(seededRandom(seed + 1) * 240); // 1.5h to 5.5h
  const endHour = startHour + durationMinutes / 60;

  const durationH = Math.floor(durationMinutes / 60);
  const durationM = durationMinutes % 60;

  return {
    start: formatTime(startHour),
    end: formatTime(Math.min(endHour, 23.99)),
    duration: `${durationH}h ${durationM}m`,
    note: "Routine tasks are fine, but avoid starting anything brand-new or signing important documents during this window.",
  };
}

// ─── EXPORTED FUNCTIONS ───────────────────────────────────────────────────────

/**
 * Today's sky snapshot: sunrise/sunset, day length, moon info, sun sign, and planetary ruler.
 */
export function getTodaySky(date: Date): TodaySky {
  const { sunrise, sunset } = getSunTimes(date);
  const dayLengthDecimal = sunset - sunrise;
  const dayLengthHours = Math.floor(dayLengthDecimal);
  const dayLengthMinutes = Math.round((dayLengthDecimal - dayLengthHours) * 60);

  // Compare to yesterday to determine if days are getting longer or shorter
  const yesterday = new Date(date.getTime() - 24 * 60 * 60 * 1000);
  const yesterdayTimes = getSunTimes(yesterday);
  const yesterdayLength = yesterdayTimes.sunset - yesterdayTimes.sunrise;
  const lengthDiff = dayLengthDecimal - yesterdayLength;
  let dayLengthDirection: TodaySky["dayLengthDirection"] = "equinox";
  if (Math.abs(lengthDiff) > 0.003) {
    dayLengthDirection = lengthDiff > 0 ? "longer" : "shorter";
  }

  const moonPhase = getMoonPhase(date);
  const moonSign = getMoonSign(date);
  const zodiacSeason = getCurrentZodiacSeason(date);
  const planetaryRuler = PLANETARY_DAYS[date.getDay()];

  return {
    sunrise: formatTime(sunrise),
    sunset: formatTime(sunset),
    dayLengthHours,
    dayLengthMinutes,
    dayLengthDirection,
    moonPhase,
    moonSign,
    moonSignElement: SIGN_ELEMENTS[moonSign],
    sunSign: zodiacSeason.sign,
    sunSignTheme: zodiacSeason.theme,
    dayOfSeason: getDayOfSeason(date, zodiacSeason),
    planetaryRuler,
    voidOfCourseMoon: getVoidOfCourseMoon(date),
  };
}

export interface GoodForResult {
  activities: GoodForItem[];
  why: string;
}

// Sign themes for "Why?" explanations
const SIGN_THEMES: Record<string, string> = {
  Aries: "bold action, initiative, and fresh starts",
  Taurus: "stability, beauty, sensory pleasure, and material comfort",
  Gemini: "communication, curiosity, and social connection",
  Cancer: "nurturing, home, emotional bonds, and self-care",
  Leo: "self-expression, creativity, confidence, and celebration",
  Virgo: "health, organization, attention to detail, and service",
  Libra: "beauty, partnership, balance, and aesthetic decisions",
  Scorpio: "transformation, depth, letting go, and honest confrontation",
  Sagittarius: "expansion, adventure, learning, and big-picture thinking",
  Capricorn: "ambition, structure, long-term planning, and career moves",
  Aquarius: "innovation, community, unconventional approaches, and group work",
  Pisces: "spirituality, creativity, healing, and intuitive work",
};

/**
 * Activities that are especially well-supported by today's moon sign and phase.
 * Combines moon-sign-specific activities with waxing/waning bonus suggestions.
 */
export function getGoodForToday(date: Date): GoodForResult {
  const moonSign = getMoonSign(date);
  const moonPhase = getMoonPhase(date);

  const signActivities = MOON_SIGN_ACTIVITIES[moonSign] || MOON_SIGN_ACTIVITIES["Aries"];

  // Pick 2-3 sign activities based on date seed (deterministic)
  const seed = dayOfYear(date) * 7 + date.getFullYear();
  const shuffled = [...signActivities].sort(
    (a, b) => seededRandom(seed + a.activity.length) - seededRandom(seed + b.activity.length)
  );
  const picked = shuffled.slice(0, 3);

  // Add one waxing or waning bonus
  const isWaxing = moonPhase.phase.startsWith("waxing") || moonPhase.phase === "new" || moonPhase.phase === "first-quarter";
  const bonus = isWaxing ? WAXING_BONUS : WANING_BONUS;
  const bonusPick = bonus[Math.floor(seededRandom(seed + 99) * bonus.length)];

  const phaseDescriptor = isWaxing ? "The waxing phase supports growth and beginnings." : "The waning phase supports completion and release.";
  const signTheme = SIGN_THEMES[moonSign] || "balanced energy";

  return {
    activities: [...picked, bonusPick],
    why: `The moon in ${moonSign} favors ${signTheme}. ${phaseDescriptor}`,
  };
}

/**
 * Things to hold off on, if there's a reason.
 * Returns null on most days. Returns guidance during void-of-course moon windows.
 */
export function getHoldOffToday(date: Date): HoldOffResult | null {
  const voc = getVoidOfCourseMoon(date);
  if (!voc) return null;

  const moonSign = getMoonSign(date);

  return {
    items: [
      { activity: "Signing contracts or major agreements", icon: "📝" },
      { activity: "Launching a new project or business", icon: "🚫" },
      { activity: "Making big purchases", icon: "💳" },
      { activity: "Starting an important conversation for the first time", icon: "🤐" },
    ],
    reason: `The moon is void-of-course today (${voc.start} - ${voc.end}) as it transitions out of ${moonSign}. Actions started during VOC periods tend not to stick or go as planned. Routine stuff is fine — just don't begin anything you want to last.`,
    duration: voc.duration,
  };
}

/**
 * A romantic, 1-2 sentence observation about tonight's sky.
 * Deterministically selects from curated observations based on moon phase, season, and day of year.
 */
export function getTonightSky(date: Date): TonightSkyResult {
  const doy = dayOfYear(date);
  const season = getSeason(date);
  const moonPhase = getMoonPhase(date);

  // Determine phase group
  let phaseGroup: "new" | "waxing" | "full" | "waning";
  if (moonPhase.phase === "new") phaseGroup = "new";
  else if (moonPhase.phase === "full") phaseGroup = "full";
  else if (moonPhase.phase.startsWith("waxing") || moonPhase.phase === "first-quarter") phaseGroup = "waxing";
  else phaseGroup = "waning";

  // First, check for day-range matches (meteor showers, solstices)
  const dayRangeMatch = SKY_OBSERVATIONS.find(
    (obs) => obs.condition.dayRange && doy >= obs.condition.dayRange[0] && doy <= obs.condition.dayRange[1]
  );
  if (dayRangeMatch) {
    return { observation: dayRangeMatch.text, emoji: dayRangeMatch.emoji };
  }

  // Next, try phase-specific observations
  const phaseMatches = SKY_OBSERVATIONS.filter((obs) => obs.condition.phaseGroup === phaseGroup);
  if (phaseMatches.length > 0) {
    // Use date seed to pick deterministically so the same phase doesn't always show the same text
    const seed = doy + date.getFullYear() * 3;
    const idx = Math.floor(seededRandom(seed) * phaseMatches.length);
    return { observation: phaseMatches[idx].text, emoji: phaseMatches[idx].emoji };
  }

  // Fall back to seasonal observations
  const seasonMatches = SKY_OBSERVATIONS.filter((obs) => obs.condition.season === season);
  const seed = doy + date.getFullYear() * 7;
  const idx = Math.floor(seededRandom(seed) * seasonMatches.length);
  const pick = seasonMatches[idx] || SKY_OBSERVATIONS[0];
  return { observation: pick.text, emoji: pick.emoji };
}

/**
 * Info about the current lunar month's full moon: traditional name, lore, and countdown.
 */
export function getThisMoon(date: Date): ThisMoonResult {
  const { nextFull } = getNextMoonEvents(date);

  // Determine which month's full moon we're in
  // If the next full moon is in this month or the next, use that month.
  // Otherwise fall back to current month.
  let targetMonth: number;
  let fullDate: Date;

  if (nextFull) {
    fullDate = nextFull.date;
    targetMonth = fullDate.getMonth(); // 0-based
  } else {
    // Fallback: approximate full moon ~14 days from now
    fullDate = new Date(date.getTime() + 14 * 24 * 60 * 60 * 1000);
    targetMonth = fullDate.getMonth();
  }

  const moonInfo = FULL_MOON_NAMES[targetMonth];
  const loreEntry = MOON_LORE[moonInfo.name];

  const daysUntilFull = nextFull
    ? Math.max(0, nextFull.daysUntil)
    : Math.max(0, Math.round((fullDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)));

  return {
    name: moonInfo.name,
    fullDate,
    origin: loreEntry?.origin ?? moonInfo.otherNames[0] ?? "Traditional",
    lore: loreEntry?.story ?? `The ${moonInfo.name} rises this month.`,
    otherNames: moonInfo.otherNames,
    daysUntilFull,
  };
}

/**
 * 4-5 upcoming sky events: next full/new moons, planet ingresses, equinoxes/solstices, meteor showers.
 */
export function getComingUp(date: Date): ComingUpEvent[] {
  const events: ComingUpEvent[] = [];
  const year = date.getFullYear();

  // Next full and new moons
  const { nextFull, nextNew } = getNextMoonEvents(date);
  if (nextFull) {
    const moonName = nextFull.moonName || "Full Moon";
    events.push({ date: nextFull.date, label: moonName });
  }
  if (nextNew) {
    events.push({ date: nextNew.date, label: nextNew.label });
  }

  // Equinoxes and solstices
  const astronomicalEvents = [
    { date: new Date(year, 2, 20), label: "Spring Equinox" },
    { date: new Date(year, 5, 20), label: "Summer Solstice" },
    { date: new Date(year, 8, 22), label: "Autumn Equinox" },
    { date: new Date(year, 11, 21), label: "Winter Solstice" },
  ];

  // Next zodiac season ingress
  const currentSeason = getCurrentZodiacSeason(date);
  const currentIndex = ZODIAC_SEASONS.findIndex((s) => s.sign === currentSeason.sign);
  const nextSeasonIndex = (currentIndex + 1) % 12;
  const nextSeason = ZODIAC_SEASONS[nextSeasonIndex];
  let ingressYear = year;
  let ingressDate = new Date(ingressYear, nextSeason.startMonth - 1, nextSeason.startDay);
  if (ingressDate.getTime() < date.getTime()) {
    ingressYear++;
    ingressDate = new Date(ingressYear, nextSeason.startMonth - 1, nextSeason.startDay);
  }
  events.push({ date: ingressDate, label: `${nextSeason.sign} Season begins` });

  // Meteor showers (approximate peak dates, using the current or next year)
  const meteorShowers = [
    { month: 0, day: 3, label: "Quadrantid meteor shower peaks" },
    { month: 3, day: 22, label: "Lyrid meteor shower peaks" },
    { month: 7, day: 12, label: "Perseid meteor shower peaks" },
    { month: 9, day: 21, label: "Orionid meteor shower peaks" },
    { month: 11, day: 14, label: "Geminid meteor shower peaks" },
  ];

  for (const shower of meteorShowers) {
    let showerDate = new Date(year, shower.month, shower.day);
    if (showerDate.getTime() < date.getTime()) {
      showerDate = new Date(year + 1, shower.month, shower.day);
    }
    // Only add if within ~90 days
    const daysUntil = (showerDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
    if (daysUntil <= 90) {
      events.push({ date: showerDate, label: shower.label });
    }
  }

  // Add upcoming equinoxes/solstices within 90 days
  for (const ae of astronomicalEvents) {
    let eventDate = ae.date;
    if (eventDate.getTime() < date.getTime()) {
      eventDate = new Date(year + 1, ae.date.getMonth(), ae.date.getDate());
    }
    const daysUntil = (eventDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
    if (daysUntil <= 90) {
      events.push({ date: eventDate, label: ae.label });
    }
  }

  // Sort by date, deduplicate, take top 5
  events.sort((a, b) => a.date.getTime() - b.date.getTime());

  // Deduplicate by label similarity
  const seen = new Set<string>();
  const unique = events.filter((e) => {
    const key = e.label.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return unique.slice(0, 5);
}

/**
 * Gardening guidance based on moon phase — a classic almanac feature.
 * Uses biodynamic gardening principles: waxing = above-ground growth, waning = roots and clearing.
 */
export function getGardenTips(date: Date): GardenTips {
  const moonPhase = getMoonPhase(date);
  const moonSign = getMoonSign(date);
  const element = SIGN_ELEMENTS[moonSign];
  const season = getSeason(date);

  const bestDays: { activity: string; dates: string }[] = [];

  // Phase-based guidance
  const isWaxing = moonPhase.phase.startsWith("waxing") || moonPhase.phase === "new" || moonPhase.phase === "first-quarter";

  if (isWaxing) {
    if (moonPhase.phase === "new" || moonPhase.phase === "waxing-crescent") {
      bestDays.push({ activity: "Plant leafy greens and herbs", dates: "Now through first quarter" });
      bestDays.push({ activity: "Sow seeds for above-ground crops", dates: "Best in the next 3-4 days" });
    } else {
      bestDays.push({ activity: "Transplant seedlings", dates: "Now while growth energy builds" });
      bestDays.push({ activity: "Fertilize and feed plants", dates: "Through the full moon" });
    }
  } else {
    if (moonPhase.phase === "full" || moonPhase.phase === "waning-gibbous") {
      bestDays.push({ activity: "Plant root vegetables", dates: "Now through last quarter" });
      bestDays.push({ activity: "Harvest herbs for potency", dates: "Best in the next few days" });
    } else {
      bestDays.push({ activity: "Weed, prune, and clear beds", dates: "Through the new moon" });
      bestDays.push({ activity: "Turn compost and amend soil", dates: "Best before the new moon" });
    }
  }

  // Element-based bonus
  if (element === "water") {
    bestDays.push({ activity: "Water deeply — plants absorb more in water signs", dates: "Today" });
  } else if (element === "earth") {
    bestDays.push({ activity: "Work the soil and transplant", dates: "Today (earth sign = strong roots)" });
  } else if (element === "fire") {
    bestDays.push({ activity: "Harvest fruits and seeds", dates: "Today (fire sign = preservation)" });
  } else {
    bestDays.push({ activity: "Harvest flowers and herbs for drying", dates: "Today (air sign = good for drying)" });
  }

  // Season-specific local note for central Texas
  const localNotes = [
    "Spring in central Texas: wildflower season is here. Bluebonnets, Indian paintbrush, and evening primrose are at their peak. Plant warm-season crops after the last frost (usually mid-March).",
    "Summer in central Texas: water early morning or late evening to reduce evaporation. Mulch heavily. Heat-tolerant herbs like rosemary, basil, and Mexican mint marigold thrive now.",
    "Fall in central Texas: the second planting season. Cool-weather crops like kale, broccoli, lettuce, and radishes go in now. It's also the best time to plant native trees.",
    "Winter in central Texas: protect tender plants from occasional hard freezes. Plan your spring garden. Prune dormant trees and roses in late January or February.",
  ];

  return {
    bestDays,
    localNote: localNotes[season],
  };
}
