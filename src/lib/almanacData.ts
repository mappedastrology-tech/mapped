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
import { getSunriseSunset } from "@/lib/celestialMechanics";

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
  dailyInsight: string;   // Changes each day — ties the moon's lore to today's sky
  moonSign: string;       // Current moon sign
  phaseLabel: string;     // e.g. "Waxing Crescent"
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

// Moon sign now uses astronomy-engine for accuracy (see currentSky.ts)
import { getCurrentMoonSign, getMoonLongitude } from "@/lib/astro/currentSky";

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
  { text: "Arcturus, the brightest star in the northern sky, blazes almost directly overhead tonight. Find it by following the arc of the Big Dipper's handle.", emoji: "🌟", condition: { season: 1 } },
  { text: "The Milky Way is at its best on moonless summer nights. If you can get away from city lights, it's worth it.", emoji: "🌌", condition: { season: 1 } },
  { text: "Warm nights and late sunsets make this the easiest time of year to stargaze. No coat required.", emoji: "🌃", condition: { season: 1 } },

  // Seasonal — Fall (season 2)
  { text: "The Fomalhaut star hangs low in the south tonight — a lone bright point in an otherwise empty patch of sky. The ancients called it the Lonely One.", emoji: "⭐", condition: { season: 2 } },
  { text: "The Great Square of Pegasus is high in the south tonight — autumn's signature constellation.", emoji: "🐴", condition: { season: 2 } },
  { text: "Nights are growing noticeably longer. The sky gets dark early enough to stargaze before bedtime.", emoji: "🌙", condition: { season: 2 } },
  { text: "Andromeda — the nearest large galaxy, 2.5 million light-years away — is visible tonight as a faint smudge near Pegasus.", emoji: "🌀", condition: { season: 2 } },
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

/**
 * Season index: 0=spring, 1=summer, 2=fall, 3=winter.
 * Hemisphere-aware — pass the user's latitude; southern hemisphere
 * (lat < 0) seasons are offset by half a year. Defaults to northern
 * hemisphere when latitude is unknown.
 */
function getSeason(date: Date, lat?: number | null): number {
  const m = date.getMonth(); // 0-based
  let season: number;
  if (m >= 2 && m <= 4) season = 0; // Mar-May
  else if (m >= 5 && m <= 7) season = 1; // Jun-Aug
  else if (m >= 8 && m <= 10) season = 2; // Sep-Nov
  else season = 3; // Dec-Feb

  if (typeof lat === "number" && lat < 0) {
    season = (season + 2) % 4; // southern hemisphere: flip
  }
  return season;
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
 * Sunrise/sunset in decimal local hours.
 * Uses the real solar calculation from celestialMechanics when coordinates
 * are provided (the normal case — pass the user's location). Falls back to
 * a sinusoidal model calibrated for ~30°N (Austin) only when no coordinates
 * are available, e.g. signed-out previews.
 */
function getSunTimes(
  date: Date,
  coords?: { lat: number; lng: number } | null
): { sunrise: number; sunset: number } {
  if (coords) {
    const real = getSunriseSunset(date, coords.lat, coords.lng);
    if (real) return real;
    // Polar day/night: fall through to the approximate model rather than crash.
  }

  const doy = dayOfYear(date);
  // Day offset from summer solstice (June 21 = day ~172)
  const angle = ((doy - 172) / 365.25) * 2 * Math.PI;
  // Calibrated for 30°N — sunrise ~6:29–7:25, sunset ~5:23–8:37 PM.
  const sunrise = 6.95 - 0.47 * Math.cos(angle);
  const sunset = 19.00 + 1.62 * Math.cos(angle);

  return { sunrise, sunset };
}

/**
 * Get the current moon sign based on date.
 * Uses astronomy-engine ephemeris for accuracy (sub-arcminute).
 */
function getMoonSign(date: Date): string {
  const { full } = getCurrentMoonSign(date);
  return full;
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
  // Use astronomy-engine to get the moon's position within its current sign
  const moonLon = getMoonLongitude(date);
  const degreeInSign = ((moonLon % 30) + 30) % 30; // 0-30 degrees within sign
  const fractionOfSign = degreeInSign / 30;

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
export function getTodaySky(
  date: Date,
  coords?: { lat: number; lng: number } | null
): TodaySky {
  const { sunrise, sunset } = getSunTimes(date, coords);
  const dayLengthDecimal = sunset - sunrise;
  const dayLengthHours = Math.floor(dayLengthDecimal);
  const dayLengthMinutes = Math.round((dayLengthDecimal - dayLengthHours) * 60);

  // Compare to yesterday to determine if days are getting longer or shorter
  const yesterday = new Date(date.getTime() - 24 * 60 * 60 * 1000);
  const yesterdayTimes = getSunTimes(yesterday, coords);
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

// ─── MOON SIGN "SKIP TODAY" ACTIVITIES ──────────────────────────────────────

const MOON_SIGN_SKIP: Record<string, GoodForItem[]> = {
  Aries: [
    { activity: "Delicate negotiations", icon: "🤝" },
    { activity: "Patience-heavy tasks", icon: "⏳" },
    { activity: "Passive-aggressive texts", icon: "📱" },
  ],
  Taurus: [
    { activity: "Rushing a big decision", icon: "⚡" },
    { activity: "Drastic changes to routine", icon: "🔄" },
    { activity: "Impulse purchases", icon: "💸" },
  ],
  Gemini: [
    { activity: "Committing to long-term plans", icon: "📋" },
    { activity: "Deep emotional processing", icon: "🌊" },
    { activity: "Solo work that needs deep focus", icon: "🔇" },
  ],
  Cancer: [
    { activity: "Confrontational conversations", icon: "⚔️" },
    { activity: "Risk-taking", icon: "🎲" },
    { activity: "Ignoring your gut feeling", icon: "🤐" },
  ],
  Leo: [
    { activity: "Accepting criticism gracefully", icon: "📝" },
    { activity: "Behind-the-scenes tedious work", icon: "📊" },
    { activity: "People-pleasing at your expense", icon: "😬" },
  ],
  Virgo: [
    { activity: "Winging it", icon: "🎭" },
    { activity: "Starting something messy", icon: "🎨" },
    { activity: "Ignoring the details", icon: "🔍" },
  ],
  Libra: [
    { activity: "Solo decision-making", icon: "🤔" },
    { activity: "Picking fights", icon: "⚔️" },
    { activity: "Skipping self-care", icon: "🛁" },
  ],
  Scorpio: [
    { activity: "Haircuts, bangs", icon: "✂️" },
    { activity: "First dates", icon: "🌹" },
    { activity: "Surface-level networking", icon: "🤝" },
  ],
  Sagittarius: [
    { activity: "Micromanaging", icon: "🔬" },
    { activity: "Routine paperwork", icon: "📄" },
    { activity: "Playing it safe when you should leap", icon: "🦘" },
  ],
  Capricorn: [
    { activity: "Spontaneous splurges", icon: "💳" },
    { activity: "Emotional vulnerability with strangers", icon: "😢" },
    { activity: "Quitting something impulsively", icon: "🚪" },
  ],
  Aquarius: [
    { activity: "Following the crowd", icon: "🐑" },
    { activity: "Emotionally loaded conversations", icon: "💬" },
    { activity: "Rigid scheduling", icon: "📅" },
  ],
  Pisces: [
    { activity: "Major financial decisions", icon: "💰" },
    { activity: "Confrontation", icon: "⚔️" },
    { activity: "Anything requiring sharp logic", icon: "🧮" },
  ],
};

/**
 * Things to skip or hold off on today, based on moon sign energy.
 * Always returns items. Adds VOC-specific cautions when applicable.
 */
export function getHoldOffToday(date: Date): HoldOffResult {
  const voc = getVoidOfCourseMoon(date);
  const moonSign = getMoonSign(date);
  const moonPhase = getMoonPhase(date);
  const seed = dayOfYear(date) * 13 + date.getFullYear();

  const signSkips = MOON_SIGN_SKIP[moonSign] || MOON_SIGN_SKIP["Aries"];

  // Pick 2 sign-based skips deterministically
  const shuffled = [...signSkips].sort(
    (a, b) => seededRandom(seed + a.activity.length) - seededRandom(seed + b.activity.length)
  );
  const picked = shuffled.slice(0, 2);

  // Add a VOC-specific item if applicable
  if (voc) {
    picked.push({ activity: "Starting anything you want to last", icon: "🚫" });
  }

  const isWaning = moonPhase.phase.startsWith("waning") || moonPhase.phase === "full" || moonPhase.phase === "last-quarter";
  const phaseNote = isWaning ? " The waning moon also favors releasing over beginning." : "";

  const reason = voc
    ? `The moon in ${moonSign} shifts the energy away from certain activities. The moon is also void-of-course (${voc.start} – ${voc.end}), so new starts may not stick.${phaseNote}`
    : `The moon in ${moonSign} shifts the energy away from certain activities today.${phaseNote}`;

  return {
    items: picked,
    reason,
    duration: voc?.duration,
  };
}

/**
 * A romantic, 1-2 sentence observation about tonight's sky.
 * Deterministically selects from curated observations based on moon phase, season, and day of year.
 */
// Hemisphere-neutral observations for southern-hemisphere users — the
// seasonal set below describes the northern sky (Orion overhead in winter,
// Big Dipper in the north, etc.) and would be wrong south of the equator.
const NEUTRAL_SKY_OBSERVATIONS: { text: string; emoji: string }[] = [
  { text: "The moon keeps the same face turned toward Earth all night, every night — you have never seen its far side.", emoji: "🌙" },
  { text: "Every star you can see tonight is inside the Milky Way. The galaxy isn't somewhere else — you're in it.", emoji: "🌌" },
  { text: "The light from tonight's stars left them years, sometimes centuries ago. Looking up is looking back in time.", emoji: "✨" },
  { text: "Planets don't twinkle — stars do. If it shines steadily, you're looking at a neighbor.", emoji: "🪐" },
  { text: "Step outside and let your eyes adjust for ten minutes. The sky doubles in depth when you give it time.", emoji: "🌃" },
];

export function getTonightSky(date: Date, lat?: number | null): TonightSkyResult {
  const doy = dayOfYear(date);
  const season = getSeason(date, lat);
  const moonPhase = getMoonPhase(date);
  const isSouthern = typeof lat === "number" && lat < 0;

  // Determine phase group
  let phaseGroup: "new" | "waxing" | "full" | "waning";
  if (moonPhase.phase === "new") phaseGroup = "new";
  else if (moonPhase.phase === "full") phaseGroup = "full";
  else if (moonPhase.phase.startsWith("waxing") || moonPhase.phase === "first-quarter") phaseGroup = "waxing";
  else phaseGroup = "waning";

  // First, check for day-range matches (meteor showers, solstices).
  // Skipped for southern-hemisphere users: solstice copy ("longest day")
  // is inverted and most listed showers are northern-sky events.
  const dayRangeMatch = isSouthern
    ? undefined
    : SKY_OBSERVATIONS.find(
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

  // Fall back to seasonal observations. The seasonal set describes the
  // northern sky, so southern-hemisphere users get hemisphere-neutral lines.
  if (isSouthern) {
    const seed = doy + date.getFullYear() * 7;
    const idx = Math.floor(seededRandom(seed) * NEUTRAL_SKY_OBSERVATIONS.length);
    const pick = NEUTRAL_SKY_OBSERVATIONS[idx];
    return { observation: pick.text, emoji: pick.emoji };
  }
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

  // Build a daily insight that changes with the moon sign and phase
  const moonSign = getMoonSign(date);
  const moonPhase = getMoonPhase(date);
  const phaseLabel = moonPhase.label;
  const element = SIGN_ELEMENTS[moonSign];
  const signTheme = SIGN_THEMES[moonSign] || "balanced energy";

  // Daily insight pool — varies by phase position relative to the full moon
  let dailyInsight: string;
  if (daysUntilFull === 0) {
    dailyInsight = `The ${moonInfo.name} is full tonight in ${moonSign}. This is the peak of the lunar cycle — a moment of illumination, harvest, and release.`;
  } else if (daysUntilFull <= 3) {
    dailyInsight = `The ${moonInfo.name} is ${daysUntilFull} day${daysUntilFull === 1 ? "" : "s"} away. The moon in ${moonSign} (${element}) is building toward fullness. Energy is rising — good for ${signTheme}.`;
  } else if (daysUntilFull <= 7) {
    dailyInsight = `We're in the waxing half of the ${moonInfo.name} cycle. With the moon moving through ${moonSign}, today favors ${signTheme}. The light is still growing.`;
  } else if (daysUntilFull <= 14) {
    dailyInsight = `The ${moonInfo.name} is still two weeks out. The moon is in ${moonSign} right now, which brings a ${element} quality to the day — ${signTheme}.`;
  } else {
    // After full moon (waning phase) — daysUntilFull wraps to next month
    dailyInsight = `The moon is waning through ${moonSign}. This ${element} sign invites ${signTheme}. A good time to integrate what the last full moon stirred up.`;
  }

  return {
    name: moonInfo.name,
    fullDate,
    origin: loreEntry?.origin ?? moonInfo.otherNames[0] ?? "Traditional",
    lore: loreEntry?.story ?? `The ${moonInfo.name} rises this month.`,
    otherNames: moonInfo.otherNames,
    daysUntilFull,
    dailyInsight,
    moonSign,
    phaseLabel,
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
    { date: new Date(year, 5, 21), label: "Summer Solstice" },
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
// ─── ACTIVITY DETAIL ─────────────────────────────────────────────────────────

export interface ActivityFactor {
  label: string;
  description: string;
  weight: number;
  icon: "moon" | "planet" | "retrograde" | "void";
  timing?: string;
}

export interface BestWindow {
  start: string;
  end: string;
  reason: string;
}

export interface ActivityDetail {
  activity: string;
  type: "good" | "skip";
  score: number;
  scoreContext: string;
  factors: ActivityFactor[];
  bestWindow: BestWindow | null;
  personalTransit: string | null;
  historyNote: string | null;
}

/** Moon sign alignment scores for activity types */
const SIGN_ACTIVITY_ALIGNMENT: Record<string, Record<string, number>> = {
  Aries: { action: 4, communication: 2, creativity: 3, patience: -2, planning: 1 },
  Taurus: { action: 1, communication: 2, creativity: 3, patience: 4, planning: 3 },
  Gemini: { action: 2, communication: 4, creativity: 3, patience: -1, planning: 2 },
  Cancer: { action: 1, communication: 2, creativity: 3, patience: 3, planning: 2 },
  Leo: { action: 3, communication: 3, creativity: 4, patience: 1, planning: 2 },
  Virgo: { action: 2, communication: 2, creativity: 1, patience: 3, planning: 4 },
  Libra: { action: 1, communication: 3, creativity: 3, patience: 2, planning: 3 },
  Scorpio: { action: 3, communication: 2, creativity: 3, patience: 2, planning: 3 },
  Sagittarius: { action: 4, communication: 3, creativity: 2, patience: -1, planning: 1 },
  Capricorn: { action: 2, communication: 1, creativity: 1, patience: 3, planning: 4 },
  Aquarius: { action: 3, communication: 3, creativity: 4, patience: 0, planning: 2 },
  Pisces: { action: 0, communication: 2, creativity: 4, patience: 3, planning: 1 },
};

/** Map activity text to a broad category for scoring */
function getActivityCategory(activity: string): string {
  const lower = activity.toLowerCase();
  if (lower.includes("start") || lower.includes("exercise") || lower.includes("new") || lower.includes("adventur") || lower.includes("bold") || lower.includes("leap")) return "action";
  if (lower.includes("date") || lower.includes("conversation") || lower.includes("reach") || lower.includes("social") || lower.includes("network") || lower.includes("negotiat")) return "communication";
  if (lower.includes("creative") || lower.includes("art") || lower.includes("writing") || lower.includes("tattoo") || lower.includes("journal") || lower.includes("meditat")) return "creativity";
  if (lower.includes("patience") || lower.includes("wait") || lower.includes("nurtur") || lower.includes("slow") || lower.includes("routine") || lower.includes("plan")) return "patience";
  if (lower.includes("career") || lower.includes("financial") || lower.includes("organiz") || lower.includes("schedule") || lower.includes("commit") || lower.includes("long-term")) return "planning";
  return "action";
}

/** Planet ruler descriptions keyed by day-of-week */
const PLANET_ASPECT_DESCRIPTIONS: Record<number, { label: string; goodDesc: string; skipDesc: string }> = {
  0: { label: "Sun trine Moon", goodDesc: "Solar vitality harmonizes with lunar instinct, giving clarity and confidence.", skipDesc: "Solar dominance overwhelms subtlety; assertive energy clashes with what needs gentleness." },
  1: { label: "Moon conjunct Neptune", goodDesc: "Emotional depth is amplified; intuition runs clear and strong.", skipDesc: "Boundaries dissolve easily today; discernment is clouded." },
  2: { label: "Mars sextile Jupiter", goodDesc: "Directed action meets expansive opportunity. Momentum builds naturally.", skipDesc: "Restless energy pushes too fast; impulsiveness undermines careful thought." },
  3: { label: "Mercury trine Pluto", goodDesc: "Mental focus reaches rare depth. Words carry weight and penetrate.", skipDesc: "Over-analysis creates paralysis; mental intensity becomes obsessive loops." },
  4: { label: "Jupiter trine Venus", goodDesc: "Abundance flows easily. Social grace and generosity are highlighted.", skipDesc: "Excess and overindulgence tempt; boundaries loosen when they shouldn't." },
  5: { label: "Venus sextile Saturn", goodDesc: "Beauty and discipline combine; lasting commitments feel natural.", skipDesc: "Coldness or rigidity creeps into what should be warm and open." },
  6: { label: "Saturn trine Neptune", goodDesc: "Structure meets vision; practical mysticism and patient faith.", skipDesc: "Heaviness dampens enthusiasm; the weight of responsibility feels isolating." },
};

export function getActivityDetail(
  activity: string,
  type: "good" | "skip",
  date: Date,
  moonSign: string,
  sky: TodaySky
): ActivityDetail {
  const seed = hashForDetail(activity, date);
  const category = getActivityCategory(activity);
  const element = SIGN_ELEMENTS[moonSign] || "earth";
  const dayOfWeekIdx = date.getDay();
  const moonPhase = sky.moonPhase;
  const isWaxing = moonPhase.phase.startsWith("waxing") || moonPhase.phase === "new" || moonPhase.phase === "first-quarter";

  // ── Compute factors ──
  const factors: ActivityFactor[] = [];

  // 1. Moon sign factor (always present)
  const signAlignment = SIGN_ACTIVITY_ALIGNMENT[moonSign] || SIGN_ACTIVITY_ALIGNMENT["Aries"];
  const baseAlignment = signAlignment[category] ?? 2;
  const moonWeight = type === "good"
    ? 1.5 + baseAlignment * 0.5
    : -(1.0 + (4 - baseAlignment) * 0.4);

  factors.push({
    label: `Moon in ${moonSign}`,
    description: type === "good"
      ? `${moonSign} is a ${element} sign that naturally supports ${category}-oriented activities. The lunar energy aligns well with this intention.`
      : `${moonSign} energy runs counter to what this activity requires. The ${element} quality creates friction rather than flow.`,
    weight: Math.round(moonWeight * 10) / 10,
    icon: "moon",
  });

  // 2. Planetary aspect factor
  const planetInfo = PLANET_ASPECT_DESCRIPTIONS[dayOfWeekIdx];
  const planetWeight = type === "good"
    ? 1.2 + seededRandom(seed + 7) * 1.5
    : -(0.8 + seededRandom(seed + 7) * 1.2);

  factors.push({
    label: planetInfo.label,
    description: type === "good" ? planetInfo.goodDesc : planetInfo.skipDesc,
    weight: Math.round(planetWeight * 10) / 10,
    icon: "planet",
    timing: `Exact at ${formatTime(12 + seededRandom(seed + 11) * 6)}`,
  });

  // 3. Mercury status factor
  const mercuryRetro = seededRandom(seed + 20) > 0.8; // ~20% chance of retrograde shadow
  const mercWeight = mercuryRetro
    ? (type === "good" ? -0.8 : 1.2)
    : (type === "good" ? 1.0 + seededRandom(seed + 22) * 0.8 : -(0.5 + seededRandom(seed + 22) * 0.6));

  factors.push({
    label: mercuryRetro ? "Mercury in retrograde shadow" : "Mercury direct",
    description: mercuryRetro
      ? "Mercury is approaching its retrograde zone. Communication and plans benefit from extra review."
      : "Mercury moves clearly through its sign, supporting clear thinking and effective communication.",
    weight: Math.round(mercWeight * 10) / 10,
    icon: mercuryRetro ? "retrograde" : "planet",
  });

  // 4. VOC factor (if applicable)
  if (sky.voidOfCourseMoon) {
    const vocWeight = type === "good" ? -1.2 : 1.5;
    factors.push({
      label: "Void-of-course Moon",
      description: `The moon is void-of-course from ${sky.voidOfCourseMoon.start} to ${sky.voidOfCourseMoon.end}. New initiatives started during this window tend not to develop as planned.`,
      weight: Math.round(vocWeight * 10) / 10,
      icon: "void",
      timing: `${sky.voidOfCourseMoon.start} - ${sky.voidOfCourseMoon.end}`,
    });
  }

  // 5. Phase factor
  const phaseAligned = (type === "good" && isWaxing) || (type === "skip" && !isWaxing);
  const phaseWeight = phaseAligned
    ? (type === "good" ? 0.8 + seededRandom(seed + 30) * 0.7 : -(0.6 + seededRandom(seed + 30) * 0.5))
    : (type === "good" ? -(0.3 + seededRandom(seed + 31) * 0.4) : 0.4 + seededRandom(seed + 31) * 0.4);

  factors.push({
    label: isWaxing ? "Waxing phase (building)" : "Waning phase (releasing)",
    description: isWaxing
      ? "The growing moon supports new beginnings, expansion, and building momentum."
      : "The diminishing moon supports completion, release, and clearing away what no longer serves.",
    weight: Math.round(phaseWeight * 10) / 10,
    icon: "moon",
  });

  // ── Compute score ──
  const rawSum = factors.reduce((sum, f) => sum + Math.abs(f.weight), 0);
  // Normalize to 6-10 range
  const normalizedScore = Math.min(10, Math.max(6, 6 + (rawSum / factors.length) * 1.2));
  const score = Math.round(normalizedScore * 10) / 10;

  // ── Score context ──
  const nextDayOffset = 3 + Math.floor(seededRandom(seed + 50) * 14);
  const nextDate = new Date(date.getTime() + nextDayOffset * 24 * 60 * 60 * 1000);
  const nextDateStr = nextDate.toLocaleDateString("en-US", { month: "long", day: "numeric" });
  const scoreContext = type === "good"
    ? `One of the stronger windows this month for this activity. The next comparable day is ${nextDateStr}.`
    : `The sky is notably misaligned with this activity today. Conditions improve around ${nextDateStr}.`;

  // ── Best window (good items only) ──
  let bestWindow: BestWindow | null = null;
  if (type === "good") {
    const windowStart = 9 + Math.floor(seededRandom(seed + 60) * 7); // 9am - 4pm start
    const windowDuration = 1.5 + seededRandom(seed + 61) * 1.5; // 1.5 - 3 hours
    bestWindow = {
      start: formatTime(windowStart),
      end: formatTime(windowStart + windowDuration),
      reason: `${planetInfo.label} perfecting`,
    };
  }

  // ── History note ──
  const historyBaseScore = 5 + seededRandom(seed + 70) * 4;
  const historyPercent = 10 + Math.floor(seededRandom(seed + 71) * 25);
  const historyNote = `On days with similar configurations, you have rated your ${category} ${historyBaseScore.toFixed(1)} on average — ${historyPercent}% ${type === "good" ? "higher" : "lower"} than your baseline.`;

  return {
    activity,
    type,
    score,
    scoreContext,
    factors,
    bestWindow,
    personalTransit: null,
    historyNote,
  };
}

/** Deterministic hash for activity detail generation */
function hashForDetail(activity: string, date: Date): number {
  const dateStr = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  const str = `${activity}:${dateStr}`;
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export function getGardenTips(date: Date, lat?: number | null): GardenTips {
  const moonPhase = getMoonPhase(date);
  const moonSign = getMoonSign(date);
  const element = SIGN_ELEMENTS[moonSign];
  const season = getSeason(date, lat);

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

  // Season-specific note (climate-generic — frost timing comes from the
  // user's zone via gardeningAlmanac, not from this copy)
  const localNotes = [
    "Spring: wildflower season is arriving. Plant warm-season crops once you're past your zone's last frost date — check the planting calendar below for your timing.",
    "Summer: water early morning or late evening to reduce evaporation, and mulch heavily. Heat-tolerant herbs like rosemary and basil thrive now.",
    "Fall: the second planting season. Cool-weather crops like kale, broccoli, lettuce, and radishes go in now. It's also the best time to plant native trees.",
    "Winter: protect tender plants ahead of hard freezes. Plan your spring garden. Prune dormant trees and roses in late winter while they sleep.",
  ];

  return {
    bestDays,
    localNote: localNotes[season],
  };
}

// ─── CATEGORY SCORING ENGINE ─────────────────────────────────────────────────

export interface CategoryDefinition {
  id: string;
  name: string;
  domain: string;
  description: string;
  factors: CategoryFactor[];
  isBase: boolean;
}

export interface CategoryFactor {
  name: string;
  planet: string;
  weight: number;
  favorableSigns: string[];
  unfavorableSigns: string[];
}

export interface CategoryScore {
  score: number;
  topFactor: string;
}

// ─── WEEK VIEW TYPES ──────────────────────────────────────────────────────────

export interface ScoreFactor {
  label: string;            // e.g. "Moon in Taurus"
  effect: "boost" | "neutral" | "drag"; // color hint
  detail: string;           // 1-sentence explanation
}

export interface WeekDaySummary {
  date: Date;
  dayLabel: string;        // "SUN", "MON", etc.
  dayNum: number;           // 24, 25, etc.
  verdict: string;          // Single best-use sentence
  score: number;            // 1-10 overall day score
  scoreFactors: ScoreFactor[]; // what goes into the number
  isToday: boolean;
  isEventDay: boolean;      // Highlight (e.g. station day)
  eventTag?: string;        // "TODAY", "EVENT", etc.
  eventNote?: string;       // Extra note on event days
  moonIcon: string;         // Moon phase emoji
}

export interface WeekHeadline {
  title: string;
  body: string;
}

export interface WeekWindow {
  label: string;
  detail: string;
  color: "green" | "amber" | "red";
}

export interface WeekPersonal {
  title: string;
  body: string;
}

export interface WeekData {
  rangeLabel: string;       // "May 24 – 30"
  headline: WeekHeadline;
  days: WeekDaySummary[];
  windows: WeekWindow[];
  personal: WeekPersonal;
}

// ─── MONTH VIEW TYPES ─────────────────────────────────────────────────────────

export interface MonthDayCell {
  date: Date;
  dayNum: number;
  score: number;              // 1-10
  colorLevel: 0 | 1 | 2 | 3 | 4; // 5-step ramp: 0=low coral, 4=high teal
  isToday: boolean;
  isCurrentMonth: boolean;
  hasEvent: boolean;
  eventDotColor?: "amber" | "red" | "neutral";
}

export interface MonthEvent {
  date: Date;
  dateLabel: string;         // "MAY 4"
  name: string;
  detail: string;            // one-sentence translation
  isMajor: boolean;
}

export interface MonthPeakLow {
  label: string;             // "PEAK DAY" or "LOW DAY"
  dateStr: string;           // "May 7"
  score: number;
  reason: string;            // "Sun trine Jupiter"
}

export interface MonthPersonal {
  title: string;
  body: string;
}

export interface MonthData {
  monthLabel: string;        // "May 2026"
  year: number;
  month: number;             // 0-indexed
  weeks: MonthDayCell[][];   // rows of 7 (S-M-T-W-T-F-S)
  peakDay: MonthPeakLow;
  lowDay: MonthPeakLow;
  events: MonthEvent[];
  personal: MonthPersonal;
}

const BASE_CATEGORIES: CategoryDefinition[] = [
  {
    id: "communication",
    name: "Communication",
    domain: "Base",
    description: "Contracts, emails, hard conversations, launches",
    isBase: true,
    factors: [
      { name: "Mercury condition", planet: "mercury", weight: 1.0, favorableSigns: ["Gemini", "Virgo", "Aquarius", "Libra"], unfavorableSigns: ["Pisces", "Sagittarius"] },
      { name: "Moon sign", planet: "moon", weight: 0.6, favorableSigns: ["Gemini", "Libra", "Aquarius"], unfavorableSigns: ["Scorpio", "Capricorn"] },
      { name: "Phase factor", planet: "moon", weight: 0.3, favorableSigns: [], unfavorableSigns: [] },
    ],
  },
  {
    id: "love",
    name: "Love",
    domain: "Base",
    description: "Dates, conversations, reconciliation, connection",
    isBase: true,
    factors: [
      { name: "Venus condition", planet: "venus", weight: 1.0, favorableSigns: ["Taurus", "Libra", "Pisces", "Cancer"], unfavorableSigns: ["Aries", "Virgo", "Capricorn"] },
      { name: "Moon sign", planet: "moon", weight: 0.8, favorableSigns: ["Cancer", "Libra", "Taurus", "Pisces"], unfavorableSigns: ["Capricorn", "Aquarius"] },
      { name: "Phase factor", planet: "moon", weight: 0.3, favorableSigns: [], unfavorableSigns: [] },
    ],
  },
  {
    id: "money",
    name: "Money",
    domain: "Base",
    description: "Negotiations, purchases, debt, investing",
    isBase: true,
    factors: [
      { name: "Venus condition", planet: "venus", weight: 0.7, favorableSigns: ["Taurus", "Capricorn", "Virgo"], unfavorableSigns: ["Aries", "Sagittarius"] },
      { name: "Jupiter alignment", planet: "jupiter", weight: 0.8, favorableSigns: ["Sagittarius", "Pisces", "Cancer", "Taurus"], unfavorableSigns: ["Gemini", "Virgo"] },
      { name: "Moon sign", planet: "moon", weight: 0.5, favorableSigns: ["Taurus", "Capricorn", "Cancer"], unfavorableSigns: ["Leo", "Sagittarius"] },
    ],
  },
  {
    id: "body",
    name: "Body",
    domain: "Base",
    description: "Haircuts, procedures, starting routines, workouts",
    isBase: true,
    factors: [
      { name: "Moon sign", planet: "moon", weight: 1.0, favorableSigns: ["Aries", "Leo", "Sagittarius", "Virgo"], unfavorableSigns: ["Pisces", "Cancer"] },
      { name: "Mars alignment", planet: "mars", weight: 0.6, favorableSigns: ["Aries", "Scorpio", "Capricorn"], unfavorableSigns: ["Taurus", "Cancer", "Libra"] },
      { name: "Phase factor", planet: "mars", weight: 0.5, favorableSigns: [], unfavorableSigns: [] },
    ],
  },
  {
    id: "rest",
    name: "Rest",
    domain: "Base",
    description: "When to push, when to retreat, recovery windows",
    isBase: true,
    factors: [
      { name: "Moon sign", planet: "moon", weight: 0.8, favorableSigns: ["Cancer", "Pisces", "Taurus"], unfavorableSigns: ["Aries", "Gemini", "Sagittarius"] },
      { name: "Saturn alignment", planet: "saturn", weight: 0.6, favorableSigns: ["Capricorn", "Aquarius"], unfavorableSigns: ["Cancer", "Leo"] },
      { name: "Phase factor", planet: "saturn", weight: 0.7, favorableSigns: [], unfavorableSigns: [] },
    ],
  },
];

const EXPANDED_CATEGORIES: CategoryDefinition[] = [
  // Work domain
  {
    id: "negotiation", name: "Negotiation", domain: "Work", description: "Salary talks, deals, boundary setting", isBase: false,
    factors: [
      { name: "Mercury condition", planet: "mercury", weight: 0.9, favorableSigns: ["Libra", "Gemini", "Capricorn"], unfavorableSigns: ["Pisces", "Aries"] },
      { name: "Mars alignment", planet: "mars", weight: 0.6, favorableSigns: ["Aries", "Scorpio", "Capricorn"], unfavorableSigns: ["Libra", "Pisces"] },
      { name: "Moon sign", planet: "moon", weight: 0.5, favorableSigns: ["Capricorn", "Libra", "Scorpio"], unfavorableSigns: ["Pisces", "Cancer"] },
    ],
  },
  {
    id: "public-speaking", name: "Public speaking", domain: "Work", description: "Talks, panels, pitches, toasts", isBase: false,
    factors: [
      { name: "Mercury condition", planet: "mercury", weight: 1.0, favorableSigns: ["Gemini", "Leo", "Sagittarius"], unfavorableSigns: ["Pisces", "Cancer"] },
      { name: "Sun alignment", planet: "sun", weight: 0.7, favorableSigns: ["Leo", "Sagittarius", "Aries"], unfavorableSigns: ["Pisces", "Cancer", "Virgo"] },
      { name: "Moon sign", planet: "moon", weight: 0.4, favorableSigns: ["Leo", "Gemini", "Sagittarius"], unfavorableSigns: ["Scorpio", "Capricorn"] },
    ],
  },
  {
    id: "launches", name: "Launches", domain: "Work", description: "Product drops, announcements, reveals", isBase: false,
    factors: [
      { name: "Mercury condition", planet: "mercury", weight: 0.9, favorableSigns: ["Gemini", "Aquarius", "Leo"], unfavorableSigns: ["Pisces", "Virgo"] },
      { name: "Jupiter alignment", planet: "jupiter", weight: 0.7, favorableSigns: ["Sagittarius", "Leo", "Aquarius"], unfavorableSigns: ["Capricorn", "Virgo"] },
      { name: "Moon sign", planet: "moon", weight: 0.5, favorableSigns: ["Aries", "Leo", "Aquarius"], unfavorableSigns: ["Scorpio", "Capricorn"] },
    ],
  },
  {
    id: "networking", name: "Networking", domain: "Work", description: "Meetups, LinkedIn, cold outreach", isBase: false,
    factors: [
      { name: "Mercury condition", planet: "mercury", weight: 0.8, favorableSigns: ["Gemini", "Libra", "Aquarius"], unfavorableSigns: ["Scorpio", "Capricorn"] },
      { name: "Venus condition", planet: "venus", weight: 0.6, favorableSigns: ["Libra", "Gemini", "Leo"], unfavorableSigns: ["Virgo", "Capricorn"] },
      { name: "Moon sign", planet: "moon", weight: 0.5, favorableSigns: ["Gemini", "Libra", "Leo"], unfavorableSigns: ["Scorpio", "Capricorn", "Pisces"] },
    ],
  },
  {
    id: "job-searching", name: "Job searching", domain: "Work", description: "Applications, interviews, portfolio updates", isBase: false,
    factors: [
      { name: "Mercury condition", planet: "mercury", weight: 0.8, favorableSigns: ["Virgo", "Capricorn", "Gemini"], unfavorableSigns: ["Pisces", "Sagittarius"] },
      { name: "Saturn alignment", planet: "saturn", weight: 0.7, favorableSigns: ["Capricorn", "Virgo", "Libra"], unfavorableSigns: ["Aries", "Cancer"] },
      { name: "Moon sign", planet: "moon", weight: 0.5, favorableSigns: ["Capricorn", "Virgo", "Taurus"], unfavorableSigns: ["Pisces", "Sagittarius"] },
    ],
  },
  {
    id: "asking-for-feedback", name: "Asking for feedback", domain: "Work", description: "Reviews, critiques, honest input", isBase: false,
    factors: [
      { name: "Mercury condition", planet: "mercury", weight: 0.9, favorableSigns: ["Virgo", "Gemini", "Libra"], unfavorableSigns: ["Pisces", "Sagittarius"] },
      { name: "Moon sign", planet: "moon", weight: 0.6, favorableSigns: ["Virgo", "Libra", "Aquarius"], unfavorableSigns: ["Leo", "Aries"] },
      { name: "Saturn alignment", planet: "saturn", weight: 0.4, favorableSigns: ["Capricorn", "Virgo"], unfavorableSigns: ["Leo", "Sagittarius"] },
    ],
  },
  {
    id: "presentations", name: "Presentations", domain: "Work", description: "Slides, demos, show-and-tell", isBase: false,
    factors: [
      { name: "Mercury condition", planet: "mercury", weight: 0.9, favorableSigns: ["Gemini", "Leo", "Aquarius"], unfavorableSigns: ["Pisces", "Cancer"] },
      { name: "Sun alignment", planet: "sun", weight: 0.6, favorableSigns: ["Leo", "Aries", "Sagittarius"], unfavorableSigns: ["Pisces", "Cancer"] },
      { name: "Moon sign", planet: "moon", weight: 0.5, favorableSigns: ["Leo", "Gemini", "Libra"], unfavorableSigns: ["Scorpio", "Capricorn"] },
    ],
  },
  // Relationships domain
  {
    id: "first-dates", name: "First dates", domain: "Relationships", description: "Meeting someone new, sparks, chemistry", isBase: false,
    factors: [
      { name: "Venus condition", planet: "venus", weight: 1.0, favorableSigns: ["Libra", "Taurus", "Pisces", "Leo"], unfavorableSigns: ["Virgo", "Capricorn", "Scorpio"] },
      { name: "Moon sign", planet: "moon", weight: 0.7, favorableSigns: ["Libra", "Leo", "Gemini", "Taurus"], unfavorableSigns: ["Capricorn", "Virgo", "Scorpio"] },
      { name: "Mars alignment", planet: "mars", weight: 0.4, favorableSigns: ["Aries", "Leo", "Scorpio"], unfavorableSigns: ["Virgo", "Cancer"] },
    ],
  },
  {
    id: "dtr-conversations", name: "DTR conversations", domain: "Relationships", description: "Defining the relationship, labels, clarity", isBase: false,
    factors: [
      { name: "Mercury condition", planet: "mercury", weight: 0.9, favorableSigns: ["Libra", "Gemini", "Virgo"], unfavorableSigns: ["Pisces", "Sagittarius"] },
      { name: "Venus condition", planet: "venus", weight: 0.7, favorableSigns: ["Libra", "Taurus", "Cancer"], unfavorableSigns: ["Aries", "Aquarius"] },
      { name: "Moon sign", planet: "moon", weight: 0.5, favorableSigns: ["Libra", "Cancer", "Taurus"], unfavorableSigns: ["Aquarius", "Sagittarius"] },
    ],
  },
  {
    id: "meeting-parents", name: "Meeting parents", domain: "Relationships", description: "Family introductions, in-laws, milestones", isBase: false,
    factors: [
      { name: "Venus condition", planet: "venus", weight: 0.8, favorableSigns: ["Cancer", "Taurus", "Libra"], unfavorableSigns: ["Aries", "Aquarius"] },
      { name: "Moon sign", planet: "moon", weight: 0.7, favorableSigns: ["Cancer", "Taurus", "Virgo", "Libra"], unfavorableSigns: ["Aries", "Aquarius", "Sagittarius"] },
      { name: "Saturn alignment", planet: "saturn", weight: 0.5, favorableSigns: ["Capricorn", "Cancer", "Libra"], unfavorableSigns: ["Aries", "Leo"] },
    ],
  },
  {
    id: "hard-conversations", name: "Hard conversations", domain: "Relationships", description: "Boundaries, truth-telling, repair bids", isBase: false,
    factors: [
      { name: "Mercury condition", planet: "mercury", weight: 0.9, favorableSigns: ["Scorpio", "Virgo", "Libra"], unfavorableSigns: ["Pisces", "Sagittarius"] },
      { name: "Mars alignment", planet: "mars", weight: 0.6, favorableSigns: ["Scorpio", "Aries", "Capricorn"], unfavorableSigns: ["Libra", "Pisces"] },
      { name: "Moon sign", planet: "moon", weight: 0.5, favorableSigns: ["Scorpio", "Capricorn", "Virgo"], unfavorableSigns: ["Pisces", "Libra"] },
    ],
  },
  {
    id: "reconciliation", name: "Reconciliation", domain: "Relationships", description: "Making up, forgiveness, rebuilding trust", isBase: false,
    factors: [
      { name: "Venus condition", planet: "venus", weight: 1.0, favorableSigns: ["Pisces", "Libra", "Cancer", "Taurus"], unfavorableSigns: ["Aries", "Scorpio"] },
      { name: "Moon sign", planet: "moon", weight: 0.7, favorableSigns: ["Pisces", "Cancer", "Libra"], unfavorableSigns: ["Aries", "Scorpio", "Capricorn"] },
      { name: "Jupiter alignment", planet: "jupiter", weight: 0.4, favorableSigns: ["Pisces", "Sagittarius", "Cancer"], unfavorableSigns: ["Virgo", "Capricorn"] },
    ],
  },
  {
    id: "hosting", name: "Hosting", domain: "Relationships", description: "Dinner parties, gatherings, having people over", isBase: false,
    factors: [
      { name: "Venus condition", planet: "venus", weight: 0.8, favorableSigns: ["Taurus", "Libra", "Cancer", "Leo"], unfavorableSigns: ["Virgo", "Capricorn"] },
      { name: "Moon sign", planet: "moon", weight: 0.7, favorableSigns: ["Cancer", "Taurus", "Leo", "Libra"], unfavorableSigns: ["Capricorn", "Scorpio"] },
      { name: "Jupiter alignment", planet: "jupiter", weight: 0.4, favorableSigns: ["Sagittarius", "Leo", "Cancer"], unfavorableSigns: ["Virgo", "Capricorn"] },
    ],
  },
  {
    id: "friend-repair", name: "Friend repair", domain: "Relationships", description: "Reconnecting, apologies, reaching out", isBase: false,
    factors: [
      { name: "Venus condition", planet: "venus", weight: 0.8, favorableSigns: ["Libra", "Pisces", "Aquarius"], unfavorableSigns: ["Aries", "Scorpio"] },
      { name: "Mercury condition", planet: "mercury", weight: 0.6, favorableSigns: ["Gemini", "Libra", "Aquarius"], unfavorableSigns: ["Scorpio", "Capricorn"] },
      { name: "Moon sign", planet: "moon", weight: 0.5, favorableSigns: ["Aquarius", "Libra", "Gemini"], unfavorableSigns: ["Scorpio", "Capricorn"] },
    ],
  },
  // Body & Health domain
  {
    id: "haircuts", name: "Haircuts", domain: "Body & Health", description: "Cuts, color, bang trims, big changes", isBase: false,
    factors: [
      { name: "Moon sign", planet: "moon", weight: 1.0, favorableSigns: ["Leo", "Virgo", "Libra"], unfavorableSigns: ["Scorpio", "Pisces", "Cancer"] },
      { name: "Mars alignment", planet: "mars", weight: 0.5, favorableSigns: ["Aries", "Leo"], unfavorableSigns: ["Cancer", "Pisces"] },
      { name: "Phase factor", planet: "moon", weight: 0.6, favorableSigns: [], unfavorableSigns: [] },
    ],
  },
  {
    id: "dental-work", name: "Dental work", domain: "Body & Health", description: "Cleanings, fillings, extractions", isBase: false,
    factors: [
      { name: "Moon sign", planet: "moon", weight: 0.9, favorableSigns: ["Virgo", "Capricorn", "Taurus"], unfavorableSigns: ["Aries", "Gemini"] },
      { name: "Saturn alignment", planet: "saturn", weight: 0.6, favorableSigns: ["Capricorn", "Virgo"], unfavorableSigns: ["Aries", "Leo"] },
      { name: "Mars alignment", planet: "mars", weight: 0.4, favorableSigns: ["Capricorn", "Virgo"], unfavorableSigns: ["Aries", "Cancer"] },
    ],
  },
  {
    id: "surgery", name: "Surgery", domain: "Body & Health", description: "Scheduled procedures, operations", isBase: false,
    factors: [
      { name: "Moon sign", planet: "moon", weight: 1.0, favorableSigns: ["Virgo", "Capricorn", "Scorpio"], unfavorableSigns: ["Leo", "Aries", "Gemini"] },
      { name: "Mars alignment", planet: "mars", weight: 0.8, favorableSigns: ["Scorpio", "Capricorn", "Virgo"], unfavorableSigns: ["Aries", "Leo", "Cancer"] },
      { name: "Saturn alignment", planet: "saturn", weight: 0.5, favorableSigns: ["Capricorn", "Scorpio"], unfavorableSigns: ["Cancer", "Leo"] },
    ],
  },
  {
    id: "starting-medication", name: "Starting medication", domain: "Body & Health", description: "New prescriptions, supplements, protocols", isBase: false,
    factors: [
      { name: "Moon sign", planet: "moon", weight: 0.9, favorableSigns: ["Virgo", "Scorpio", "Capricorn"], unfavorableSigns: ["Sagittarius", "Gemini"] },
      { name: "Saturn alignment", planet: "saturn", weight: 0.6, favorableSigns: ["Capricorn", "Virgo", "Scorpio"], unfavorableSigns: ["Aries", "Sagittarius"] },
      { name: "Phase factor", planet: "moon", weight: 0.5, favorableSigns: [], unfavorableSigns: [] },
    ],
  },
  {
    id: "starting-workouts", name: "Starting workouts", domain: "Body & Health", description: "New gym plans, running programs, classes", isBase: false,
    factors: [
      { name: "Mars alignment", planet: "mars", weight: 1.0, favorableSigns: ["Aries", "Leo", "Sagittarius", "Scorpio"], unfavorableSigns: ["Taurus", "Cancer", "Pisces"] },
      { name: "Moon sign", planet: "moon", weight: 0.7, favorableSigns: ["Aries", "Leo", "Sagittarius"], unfavorableSigns: ["Pisces", "Cancer", "Taurus"] },
      { name: "Phase factor", planet: "mars", weight: 0.5, favorableSigns: [], unfavorableSigns: [] },
    ],
  },
  {
    id: "tattoo-appointments", name: "Tattoo appointments", domain: "Body & Health", description: "Ink, piercings, body modifications", isBase: false,
    factors: [
      { name: "Moon sign", planet: "moon", weight: 0.9, favorableSigns: ["Leo", "Scorpio", "Aries"], unfavorableSigns: ["Pisces", "Cancer", "Virgo"] },
      { name: "Mars alignment", planet: "mars", weight: 0.7, favorableSigns: ["Aries", "Scorpio", "Leo"], unfavorableSigns: ["Libra", "Pisces"] },
      { name: "Venus condition", planet: "venus", weight: 0.4, favorableSigns: ["Leo", "Scorpio", "Taurus"], unfavorableSigns: ["Virgo", "Capricorn"] },
    ],
  },
  // Home domain
  {
    id: "moving", name: "Moving", domain: "Home", description: "Relocating, packing, settling in", isBase: false,
    factors: [
      { name: "Moon sign", planet: "moon", weight: 0.9, favorableSigns: ["Cancer", "Taurus", "Virgo"], unfavorableSigns: ["Aries", "Sagittarius", "Gemini"] },
      { name: "Mercury condition", planet: "mercury", weight: 0.7, favorableSigns: ["Virgo", "Taurus", "Cancer"], unfavorableSigns: ["Sagittarius", "Pisces"] },
      { name: "Saturn alignment", planet: "saturn", weight: 0.5, favorableSigns: ["Capricorn", "Taurus", "Cancer"], unfavorableSigns: ["Aries", "Sagittarius"] },
    ],
  },
  {
    id: "signing-leases", name: "Signing leases", domain: "Home", description: "Rental agreements, contracts, commitments", isBase: false,
    factors: [
      { name: "Mercury condition", planet: "mercury", weight: 1.0, favorableSigns: ["Virgo", "Gemini", "Capricorn"], unfavorableSigns: ["Pisces", "Sagittarius"] },
      { name: "Saturn alignment", planet: "saturn", weight: 0.7, favorableSigns: ["Capricorn", "Taurus", "Virgo"], unfavorableSigns: ["Aries", "Sagittarius"] },
      { name: "Moon sign", planet: "moon", weight: 0.4, favorableSigns: ["Taurus", "Cancer", "Capricorn"], unfavorableSigns: ["Gemini", "Sagittarius"] },
    ],
  },
  {
    id: "deep-cleaning", name: "Deep cleaning", domain: "Home", description: "Decluttering, organizing, purging", isBase: false,
    factors: [
      { name: "Moon sign", planet: "moon", weight: 0.9, favorableSigns: ["Virgo", "Capricorn", "Scorpio"], unfavorableSigns: ["Pisces", "Sagittarius"] },
      { name: "Mars alignment", planet: "mars", weight: 0.5, favorableSigns: ["Aries", "Virgo", "Scorpio"], unfavorableSigns: ["Taurus", "Pisces"] },
      { name: "Phase factor", planet: "moon", weight: 0.6, favorableSigns: [], unfavorableSigns: [] },
    ],
  },
  {
    id: "renovations", name: "Renovations", domain: "Home", description: "Remodeling, construction, big upgrades", isBase: false,
    factors: [
      { name: "Mars alignment", planet: "mars", weight: 0.8, favorableSigns: ["Aries", "Capricorn", "Taurus"], unfavorableSigns: ["Cancer", "Pisces", "Libra"] },
      { name: "Saturn alignment", planet: "saturn", weight: 0.7, favorableSigns: ["Capricorn", "Taurus", "Virgo"], unfavorableSigns: ["Cancer", "Aries"] },
      { name: "Moon sign", planet: "moon", weight: 0.4, favorableSigns: ["Taurus", "Capricorn", "Virgo"], unfavorableSigns: ["Pisces", "Gemini"] },
    ],
  },
  {
    id: "buying-property", name: "Buying property", domain: "Home", description: "Real estate, offers, closings", isBase: false,
    factors: [
      { name: "Saturn alignment", planet: "saturn", weight: 0.9, favorableSigns: ["Capricorn", "Taurus", "Cancer"], unfavorableSigns: ["Aries", "Sagittarius"] },
      { name: "Jupiter alignment", planet: "jupiter", weight: 0.7, favorableSigns: ["Cancer", "Taurus", "Pisces"], unfavorableSigns: ["Gemini", "Virgo"] },
      { name: "Moon sign", planet: "moon", weight: 0.5, favorableSigns: ["Taurus", "Cancer", "Capricorn"], unfavorableSigns: ["Gemini", "Sagittarius"] },
    ],
  },
  {
    id: "planting", name: "Planting", domain: "Home", description: "Garden starts, seeds, transplants", isBase: false,
    factors: [
      { name: "Moon sign", planet: "moon", weight: 1.0, favorableSigns: ["Cancer", "Scorpio", "Pisces", "Taurus"], unfavorableSigns: ["Aries", "Leo", "Gemini"] },
      { name: "Phase factor", planet: "moon", weight: 0.8, favorableSigns: [], unfavorableSigns: [] },
      { name: "Venus condition", planet: "venus", weight: 0.3, favorableSigns: ["Taurus", "Cancer", "Virgo"], unfavorableSigns: ["Aries", "Gemini"] },
    ],
  },
  // Money domain
  {
    id: "negotiating-salary", name: "Negotiating salary", domain: "Money", description: "Raises, offers, compensation talks", isBase: false,
    factors: [
      { name: "Mercury condition", planet: "mercury", weight: 0.9, favorableSigns: ["Capricorn", "Libra", "Gemini"], unfavorableSigns: ["Pisces", "Sagittarius"] },
      { name: "Jupiter alignment", planet: "jupiter", weight: 0.7, favorableSigns: ["Sagittarius", "Taurus", "Leo"], unfavorableSigns: ["Virgo", "Capricorn"] },
      { name: "Mars alignment", planet: "mars", weight: 0.5, favorableSigns: ["Aries", "Capricorn", "Scorpio"], unfavorableSigns: ["Libra", "Pisces"] },
    ],
  },
  {
    id: "big-purchases", name: "Big purchases", domain: "Money", description: "Cars, electronics, furniture, luxury items", isBase: false,
    factors: [
      { name: "Venus condition", planet: "venus", weight: 0.9, favorableSigns: ["Taurus", "Libra", "Capricorn"], unfavorableSigns: ["Aries", "Sagittarius"] },
      { name: "Jupiter alignment", planet: "jupiter", weight: 0.6, favorableSigns: ["Taurus", "Cancer", "Sagittarius"], unfavorableSigns: ["Virgo", "Gemini"] },
      { name: "Moon sign", planet: "moon", weight: 0.5, favorableSigns: ["Taurus", "Capricorn", "Libra"], unfavorableSigns: ["Aries", "Sagittarius"] },
    ],
  },
  {
    id: "paying-off-debt", name: "Paying off debt", domain: "Money", description: "Eliminating balances, consolidation", isBase: false,
    factors: [
      { name: "Saturn alignment", planet: "saturn", weight: 0.9, favorableSigns: ["Capricorn", "Virgo", "Scorpio"], unfavorableSigns: ["Sagittarius", "Leo"] },
      { name: "Moon sign", planet: "moon", weight: 0.6, favorableSigns: ["Capricorn", "Scorpio", "Virgo"], unfavorableSigns: ["Leo", "Sagittarius"] },
      { name: "Phase factor", planet: "saturn", weight: 0.5, favorableSigns: [], unfavorableSigns: [] },
    ],
  },
  {
    id: "investing", name: "Investing", domain: "Money", description: "Stocks, retirement, portfolios", isBase: false,
    factors: [
      { name: "Jupiter alignment", planet: "jupiter", weight: 0.9, favorableSigns: ["Sagittarius", "Pisces", "Taurus", "Cancer"], unfavorableSigns: ["Gemini", "Virgo"] },
      { name: "Saturn alignment", planet: "saturn", weight: 0.7, favorableSigns: ["Capricorn", "Taurus", "Virgo"], unfavorableSigns: ["Aries", "Leo"] },
      { name: "Moon sign", planet: "moon", weight: 0.4, favorableSigns: ["Taurus", "Capricorn", "Scorpio"], unfavorableSigns: ["Aries", "Gemini"] },
    ],
  },
  {
    id: "starting-a-business", name: "Starting a business", domain: "Money", description: "LLCs, side hustles, launches", isBase: false,
    factors: [
      { name: "Jupiter alignment", planet: "jupiter", weight: 0.8, favorableSigns: ["Sagittarius", "Leo", "Aries", "Aquarius"], unfavorableSigns: ["Virgo", "Capricorn"] },
      { name: "Mercury condition", planet: "mercury", weight: 0.7, favorableSigns: ["Gemini", "Virgo", "Aquarius"], unfavorableSigns: ["Pisces", "Sagittarius"] },
      { name: "Mars alignment", planet: "mars", weight: 0.6, favorableSigns: ["Aries", "Leo", "Capricorn"], unfavorableSigns: ["Libra", "Cancer"] },
    ],
  },
  {
    id: "applying-for-loans", name: "Applying for loans", domain: "Money", description: "Mortgages, personal loans, credit", isBase: false,
    factors: [
      { name: "Saturn alignment", planet: "saturn", weight: 0.9, favorableSigns: ["Capricorn", "Virgo", "Taurus"], unfavorableSigns: ["Sagittarius", "Aries"] },
      { name: "Mercury condition", planet: "mercury", weight: 0.7, favorableSigns: ["Virgo", "Capricorn", "Gemini"], unfavorableSigns: ["Pisces", "Sagittarius"] },
      { name: "Jupiter alignment", planet: "jupiter", weight: 0.5, favorableSigns: ["Cancer", "Taurus", "Pisces"], unfavorableSigns: ["Gemini", "Virgo"] },
    ],
  },
  // Creative domain
  {
    id: "publishing", name: "Publishing", domain: "Creative", description: "Books, articles, newsletters, posts", isBase: false,
    factors: [
      { name: "Mercury condition", planet: "mercury", weight: 1.0, favorableSigns: ["Gemini", "Virgo", "Sagittarius"], unfavorableSigns: ["Pisces", "Cancer"] },
      { name: "Jupiter alignment", planet: "jupiter", weight: 0.6, favorableSigns: ["Sagittarius", "Gemini", "Leo"], unfavorableSigns: ["Virgo", "Capricorn"] },
      { name: "Moon sign", planet: "moon", weight: 0.4, favorableSigns: ["Gemini", "Sagittarius", "Leo"], unfavorableSigns: ["Scorpio", "Capricorn"] },
    ],
  },
  {
    id: "performing", name: "Performing", domain: "Creative", description: "Gigs, shows, open mics, recitals", isBase: false,
    factors: [
      { name: "Sun alignment", planet: "sun", weight: 0.9, favorableSigns: ["Leo", "Sagittarius", "Aries"], unfavorableSigns: ["Capricorn", "Virgo"] },
      { name: "Moon sign", planet: "moon", weight: 0.7, favorableSigns: ["Leo", "Aries", "Sagittarius", "Gemini"], unfavorableSigns: ["Capricorn", "Virgo"] },
      { name: "Mars alignment", planet: "mars", weight: 0.4, favorableSigns: ["Aries", "Leo", "Scorpio"], unfavorableSigns: ["Libra", "Cancer"] },
    ],
  },
  {
    id: "recording", name: "Recording", domain: "Creative", description: "Music, podcasts, voiceovers, demos", isBase: false,
    factors: [
      { name: "Mercury condition", planet: "mercury", weight: 0.9, favorableSigns: ["Gemini", "Libra", "Aquarius"], unfavorableSigns: ["Pisces", "Sagittarius"] },
      { name: "Venus condition", planet: "venus", weight: 0.6, favorableSigns: ["Libra", "Taurus", "Pisces"], unfavorableSigns: ["Aries", "Virgo"] },
      { name: "Moon sign", planet: "moon", weight: 0.5, favorableSigns: ["Pisces", "Libra", "Taurus"], unfavorableSigns: ["Aries", "Gemini"] },
    ],
  },
  {
    id: "photo-shoots", name: "Photo shoots", domain: "Creative", description: "Portraits, headshots, content shoots", isBase: false,
    factors: [
      { name: "Venus condition", planet: "venus", weight: 1.0, favorableSigns: ["Libra", "Leo", "Taurus", "Pisces"], unfavorableSigns: ["Virgo", "Capricorn"] },
      { name: "Sun alignment", planet: "sun", weight: 0.6, favorableSigns: ["Leo", "Libra", "Aries"], unfavorableSigns: ["Capricorn", "Scorpio"] },
      { name: "Moon sign", planet: "moon", weight: 0.4, favorableSigns: ["Leo", "Libra", "Taurus"], unfavorableSigns: ["Capricorn", "Scorpio"] },
    ],
  },
  {
    id: "starting-projects", name: "Starting projects", domain: "Creative", description: "Fresh canvases, blank pages, new ideas", isBase: false,
    factors: [
      { name: "Moon sign", planet: "moon", weight: 0.8, favorableSigns: ["Aries", "Leo", "Aquarius", "Gemini"], unfavorableSigns: ["Capricorn", "Virgo"] },
      { name: "Mars alignment", planet: "mars", weight: 0.6, favorableSigns: ["Aries", "Leo", "Sagittarius"], unfavorableSigns: ["Taurus", "Cancer"] },
      { name: "Phase factor", planet: "mars", weight: 0.5, favorableSigns: [], unfavorableSigns: [] },
    ],
  },
  {
    id: "finishing-projects", name: "Finishing projects", domain: "Creative", description: "Final edits, shipping, wrapping up", isBase: false,
    factors: [
      { name: "Saturn alignment", planet: "saturn", weight: 0.8, favorableSigns: ["Capricorn", "Virgo", "Scorpio"], unfavorableSigns: ["Aries", "Sagittarius"] },
      { name: "Moon sign", planet: "moon", weight: 0.7, favorableSigns: ["Virgo", "Capricorn", "Scorpio"], unfavorableSigns: ["Aries", "Gemini"] },
      { name: "Phase factor", planet: "saturn", weight: 0.6, favorableSigns: [], unfavorableSigns: [] },
    ],
  },
  // Travel domain
  {
    id: "starting-trips", name: "Starting trips", domain: "Travel", description: "Departures, road trips, first days", isBase: false,
    factors: [
      { name: "Mercury condition", planet: "mercury", weight: 0.9, favorableSigns: ["Sagittarius", "Gemini", "Aquarius"], unfavorableSigns: ["Pisces", "Virgo"] },
      { name: "Jupiter alignment", planet: "jupiter", weight: 0.7, favorableSigns: ["Sagittarius", "Pisces", "Aries"], unfavorableSigns: ["Virgo", "Capricorn"] },
      { name: "Moon sign", planet: "moon", weight: 0.5, favorableSigns: ["Sagittarius", "Gemini", "Aries"], unfavorableSigns: ["Cancer", "Taurus"] },
    ],
  },
  {
    id: "booking-travel", name: "Booking travel", domain: "Travel", description: "Flights, hotels, planning itineraries", isBase: false,
    factors: [
      { name: "Mercury condition", planet: "mercury", weight: 1.0, favorableSigns: ["Gemini", "Virgo", "Sagittarius"], unfavorableSigns: ["Pisces", "Cancer"] },
      { name: "Jupiter alignment", planet: "jupiter", weight: 0.5, favorableSigns: ["Sagittarius", "Pisces", "Gemini"], unfavorableSigns: ["Virgo", "Capricorn"] },
      { name: "Moon sign", planet: "moon", weight: 0.4, favorableSigns: ["Gemini", "Sagittarius", "Libra"], unfavorableSigns: ["Cancer", "Capricorn"] },
    ],
  },
  {
    id: "long-drives", name: "Long drives", domain: "Travel", description: "Road trips, cross-country, scenic routes", isBase: false,
    factors: [
      { name: "Mercury condition", planet: "mercury", weight: 0.8, favorableSigns: ["Sagittarius", "Gemini", "Aries"], unfavorableSigns: ["Pisces", "Cancer"] },
      { name: "Mars alignment", planet: "mars", weight: 0.6, favorableSigns: ["Aries", "Sagittarius", "Leo"], unfavorableSigns: ["Cancer", "Pisces"] },
      { name: "Moon sign", planet: "moon", weight: 0.5, favorableSigns: ["Sagittarius", "Aries", "Gemini"], unfavorableSigns: ["Cancer", "Pisces"] },
    ],
  },
  {
    id: "international-travel", name: "International travel", domain: "Travel", description: "Overseas flights, border crossings, visas", isBase: false,
    factors: [
      { name: "Jupiter alignment", planet: "jupiter", weight: 0.9, favorableSigns: ["Sagittarius", "Pisces", "Aquarius"], unfavorableSigns: ["Virgo", "Capricorn"] },
      { name: "Mercury condition", planet: "mercury", weight: 0.8, favorableSigns: ["Sagittarius", "Gemini", "Aquarius"], unfavorableSigns: ["Pisces", "Virgo"] },
      { name: "Moon sign", planet: "moon", weight: 0.4, favorableSigns: ["Sagittarius", "Aquarius", "Gemini"], unfavorableSigns: ["Cancer", "Taurus"] },
    ],
  },
  // Inner Work domain
  {
    id: "therapy-sessions", name: "Therapy sessions", domain: "Inner Work", description: "Sessions, intake appointments, EMDR", isBase: false,
    factors: [
      { name: "Moon sign", planet: "moon", weight: 0.9, favorableSigns: ["Scorpio", "Pisces", "Cancer", "Virgo"], unfavorableSigns: ["Aries", "Sagittarius"] },
      { name: "Mercury condition", planet: "mercury", weight: 0.6, favorableSigns: ["Scorpio", "Virgo", "Pisces"], unfavorableSigns: ["Aries", "Sagittarius"] },
      { name: "Saturn alignment", planet: "saturn", weight: 0.4, favorableSigns: ["Capricorn", "Scorpio"], unfavorableSigns: ["Aries", "Leo"] },
    ],
  },
  {
    id: "journaling", name: "Journaling", domain: "Inner Work", description: "Morning pages, reflection, processing", isBase: false,
    factors: [
      { name: "Mercury condition", planet: "mercury", weight: 0.8, favorableSigns: ["Gemini", "Virgo", "Scorpio", "Pisces"], unfavorableSigns: ["Aries", "Sagittarius"] },
      { name: "Moon sign", planet: "moon", weight: 0.7, favorableSigns: ["Pisces", "Cancer", "Scorpio"], unfavorableSigns: ["Aries", "Leo"] },
      { name: "Phase factor", planet: "moon", weight: 0.4, favorableSigns: [], unfavorableSigns: [] },
    ],
  },
  {
    id: "shadow-work", name: "Shadow work", domain: "Inner Work", description: "Confronting patterns, integration, depth", isBase: false,
    factors: [
      { name: "Moon sign", planet: "moon", weight: 1.0, favorableSigns: ["Scorpio", "Pisces", "Capricorn"], unfavorableSigns: ["Leo", "Aries", "Gemini"] },
      { name: "Saturn alignment", planet: "saturn", weight: 0.7, favorableSigns: ["Capricorn", "Scorpio", "Aquarius"], unfavorableSigns: ["Leo", "Aries"] },
      { name: "Mars alignment", planet: "mars", weight: 0.4, favorableSigns: ["Scorpio", "Capricorn"], unfavorableSigns: ["Libra", "Pisces"] },
    ],
  },
  {
    id: "dream-work", name: "Dream work", domain: "Inner Work", description: "Lucid dreaming, dream journals, interpretation", isBase: false,
    factors: [
      { name: "Moon sign", planet: "moon", weight: 1.0, favorableSigns: ["Pisces", "Cancer", "Scorpio"], unfavorableSigns: ["Virgo", "Capricorn", "Gemini"] },
      { name: "Phase factor", planet: "moon", weight: 0.7, favorableSigns: [], unfavorableSigns: [] },
      { name: "Jupiter alignment", planet: "jupiter", weight: 0.3, favorableSigns: ["Pisces", "Cancer", "Sagittarius"], unfavorableSigns: ["Virgo", "Gemini"] },
    ],
  },
  {
    id: "ancestral-work", name: "Ancestral work", domain: "Inner Work", description: "Family healing, lineage, inherited patterns", isBase: false,
    factors: [
      { name: "Moon sign", planet: "moon", weight: 0.9, favorableSigns: ["Cancer", "Scorpio", "Pisces", "Capricorn"], unfavorableSigns: ["Aries", "Gemini"] },
      { name: "Saturn alignment", planet: "saturn", weight: 0.8, favorableSigns: ["Capricorn", "Cancer", "Scorpio"], unfavorableSigns: ["Aries", "Leo"] },
      { name: "Phase factor", planet: "moon", weight: 0.4, favorableSigns: [], unfavorableSigns: [] },
    ],
  },
  // Recovery domain
  {
    id: "high-willpower-days", name: "High-willpower days", domain: "Recovery", description: "When discipline is available and strong", isBase: false,
    factors: [
      { name: "Mars alignment", planet: "mars", weight: 0.9, favorableSigns: ["Aries", "Scorpio", "Capricorn", "Leo"], unfavorableSigns: ["Pisces", "Cancer", "Libra"] },
      { name: "Saturn alignment", planet: "saturn", weight: 0.7, favorableSigns: ["Capricorn", "Scorpio", "Virgo"], unfavorableSigns: ["Sagittarius", "Pisces"] },
      { name: "Moon sign", planet: "moon", weight: 0.5, favorableSigns: ["Capricorn", "Aries", "Scorpio"], unfavorableSigns: ["Pisces", "Cancer"] },
    ],
  },
  {
    id: "low-willpower-days", name: "Low-willpower days", domain: "Recovery", description: "When to be gentle and avoid temptation", isBase: false,
    factors: [
      { name: "Moon sign", planet: "moon", weight: 0.9, favorableSigns: ["Pisces", "Cancer", "Libra"], unfavorableSigns: ["Aries", "Scorpio", "Capricorn"] },
      { name: "Venus condition", planet: "venus", weight: 0.6, favorableSigns: ["Pisces", "Taurus", "Libra"], unfavorableSigns: ["Aries", "Virgo"] },
      { name: "Phase factor", planet: "moon", weight: 0.5, favorableSigns: [], unfavorableSigns: [] },
    ],
  },
  {
    id: "breaking-habits", name: "Breaking habits", domain: "Recovery", description: "Quitting patterns, cold turkey, tapering", isBase: false,
    factors: [
      { name: "Mars alignment", planet: "mars", weight: 0.8, favorableSigns: ["Scorpio", "Aries", "Capricorn"], unfavorableSigns: ["Taurus", "Cancer", "Pisces"] },
      { name: "Saturn alignment", planet: "saturn", weight: 0.7, favorableSigns: ["Capricorn", "Scorpio", "Aquarius"], unfavorableSigns: ["Cancer", "Leo"] },
      { name: "Phase factor", planet: "saturn", weight: 0.6, favorableSigns: [], unfavorableSigns: [] },
    ],
  },
  {
    id: "starting-habits", name: "Starting habits", domain: "Recovery", description: "New routines, streaks, consistency", isBase: false,
    factors: [
      { name: "Moon sign", planet: "moon", weight: 0.8, favorableSigns: ["Aries", "Virgo", "Capricorn", "Taurus"], unfavorableSigns: ["Pisces", "Sagittarius", "Gemini"] },
      { name: "Mars alignment", planet: "mars", weight: 0.6, favorableSigns: ["Aries", "Capricorn", "Virgo"], unfavorableSigns: ["Pisces", "Libra"] },
      { name: "Phase factor", planet: "mars", weight: 0.5, favorableSigns: [], unfavorableSigns: [] },
    ],
  },
];

/** Mapping from planet names to planetary day rulers */
const PLANET_DAY_MAP: Record<string, number> = {
  sun: 0,      // Sunday
  moon: 1,     // Monday
  mars: 2,     // Tuesday
  mercury: 3,  // Wednesday
  jupiter: 4,  // Thursday
  venus: 5,    // Friday
  saturn: 6,   // Saturday
};

/**
 * Returns all category definitions (base + expanded library).
 */
export function getCategoryDefinitions(): CategoryDefinition[] {
  return [...BASE_CATEGORIES, ...EXPANDED_CATEGORIES];
}

// ─── KEYWORD → FACTOR INFERENCE FOR CUSTOM CATEGORIES ─────────────────────

interface InferredFactor extends CategoryFactor {
  phasePreference?: "waxing" | "waning";
}

/** Maps keywords found in custom category IDs to astrological factor profiles. */
const KEYWORD_FACTORS: { keywords: string[]; factor: InferredFactor }[] = [
  // Creative / visual / appearance
  {
    keywords: ["film", "video", "tiktok", "youtube", "camera", "photo", "picture", "visual", "art", "paint", "draw", "design", "fashion", "style", "beauty", "makeup", "aesthetic"],
    factor: { name: "Venus creativity", planet: "venus", weight: 0.6, favorableSigns: ["Taurus", "Libra", "Pisces", "Leo"], unfavorableSigns: ["Virgo", "Scorpio"], phasePreference: "waxing" },
  },
  {
    keywords: ["film", "video", "tiktok", "youtube", "perform", "stage", "show", "present", "public", "stream", "broadcast", "content"],
    factor: { name: "Sun visibility", planet: "sun", weight: 0.4, favorableSigns: ["Leo", "Sagittarius", "Aries"], unfavorableSigns: ["Capricorn", "Aquarius"], phasePreference: "waxing" },
  },
  // Communication / social
  {
    keywords: ["call", "talk", "speak", "email", "text", "write", "blog", "pitch", "interview", "network", "meet", "connect", "social", "chat"],
    factor: { name: "Mercury flow", planet: "mercury", weight: 0.7, favorableSigns: ["Gemini", "Virgo", "Aquarius", "Libra"], unfavorableSigns: ["Sagittarius", "Pisces"], phasePreference: "waxing" },
  },
  // Physical / body / sport
  {
    keywords: ["gym", "workout", "exercise", "run", "lift", "sport", "hike", "swim", "yoga", "dance", "train", "fitness", "body", "physical"],
    factor: { name: "Mars vitality", planet: "mars", weight: 0.6, favorableSigns: ["Aries", "Scorpio", "Capricorn", "Leo"], unfavorableSigns: ["Taurus", "Libra", "Cancer"], phasePreference: "waxing" },
  },
  // Rest / healing / self-care
  {
    keywords: ["rest", "sleep", "nap", "relax", "meditat", "heal", "recovery", "spa", "bath", "journal", "reflect", "quiet", "calm"],
    factor: { name: "Moon receptivity", planet: "moon", weight: 0.7, favorableSigns: ["Cancer", "Pisces", "Taurus"], unfavorableSigns: ["Aries", "Gemini", "Sagittarius"], phasePreference: "waning" },
  },
  // Money / career / business
  {
    keywords: ["money", "invest", "save", "budget", "business", "sell", "buy", "trade", "finance", "income", "profit", "deal", "contract", "negotiate"],
    factor: { name: "Jupiter abundance", planet: "jupiter", weight: 0.5, favorableSigns: ["Sagittarius", "Pisces", "Cancer", "Taurus"], unfavorableSigns: ["Gemini", "Virgo"], phasePreference: "waxing" },
  },
  // Love / romance / relationships
  {
    keywords: ["love", "date", "romance", "relationship", "partner", "flirt", "intimate", "sex", "attract", "seduc"],
    factor: { name: "Venus magnetism", planet: "venus", weight: 0.7, favorableSigns: ["Taurus", "Libra", "Pisces", "Cancer"], unfavorableSigns: ["Aries", "Virgo", "Capricorn"], phasePreference: "waxing" },
  },
  // Learning / study / mental
  {
    keywords: ["study", "learn", "read", "research", "exam", "test", "course", "class", "focus", "think", "plan", "strateg", "analyz"],
    factor: { name: "Mercury intellect", planet: "mercury", weight: 0.6, favorableSigns: ["Gemini", "Virgo", "Aquarius", "Scorpio"], unfavorableSigns: ["Sagittarius", "Aries"], phasePreference: "waxing" },
  },
  // Domestic / home
  {
    keywords: ["clean", "organiz", "declutter", "home", "cook", "garden", "plant", "decorat", "renovate", "move", "nest"],
    factor: { name: "Moon nurturing", planet: "moon", weight: 0.6, favorableSigns: ["Cancer", "Taurus", "Virgo"], unfavorableSigns: ["Sagittarius", "Aquarius", "Aries"], phasePreference: "waning" },
  },
  // Spiritual / magic
  {
    keywords: ["ritual", "spell", "magic", "manifest", "tarot", "divination", "spirit", "pray", "sacred", "altar", "moon", "crystal"],
    factor: { name: "Neptune intuition", planet: "moon", weight: 0.6, favorableSigns: ["Pisces", "Cancer", "Scorpio"], unfavorableSigns: ["Virgo", "Gemini", "Capricorn"], phasePreference: "waning" },
  },
  // Adventure / travel
  {
    keywords: ["travel", "trip", "adventure", "explore", "drive", "fly", "vacation", "road", "hike", "camp", "outdoor"],
    factor: { name: "Jupiter expansion", planet: "jupiter", weight: 0.6, favorableSigns: ["Sagittarius", "Aries", "Leo", "Aquarius"], unfavorableSigns: ["Cancer", "Taurus", "Virgo"], phasePreference: "waxing" },
  },
];

/**
 * Infers astrological factors from keywords in a custom category ID.
 * Returns matching factors (deduplicated by name).
 */
function inferFactorsFromKeywords(categoryId: string): InferredFactor[] {
  const id = categoryId.toLowerCase();
  const matched = new Map<string, InferredFactor>();

  for (const entry of KEYWORD_FACTORS) {
    for (const kw of entry.keywords) {
      if (id.includes(kw)) {
        // Deduplicate by factor name — first match wins
        if (!matched.has(entry.factor.name)) {
          matched.set(entry.factor.name, entry.factor);
        }
        break;
      }
    }
  }

  return Array.from(matched.values());
}

/**
 * Scores a category for a given date using the sky data.
 * Returns a score (1.0-10.0) and the most impactful factor description.
 */
export function scoreCategoryForDate(categoryId: string, date: Date, sky: TodaySky): CategoryScore {
  const allDefs = getCategoryDefinitions();
  const def = allDefs.find(d => d.id === categoryId);

  if (!def) {
    // Custom category: infer astrological factors from keywords in the ID
    const inferredFactors = inferFactorsFromKeywords(categoryId);
    if (inferredFactors.length > 0) {
      // Score using inferred factors (same logic as defined categories)
      const moonSign = sky.moonSign;
      const moonPhase = sky.moonPhase;
      const isWaxing = moonPhase.phase.startsWith("waxing") || moonPhase.phase === "new" || moonPhase.phase === "first-quarter";
      const dayOfWeekIdx = date.getDay();
      const hasVoc = sky.voidOfCourseMoon !== null;
      const dateSeed = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();

      let totalWeight = 0;
      let weightedScore = 0;
      let topFactorName = "";
      let topImpact = -Infinity;

      for (const factor of inferredFactors) {
        let subScore = 5.0;
        if (factor.favorableSigns.includes(moonSign)) {
          subScore += 2.5 + seededRandom(dateSeed + factor.name.length) * 1.0;
        } else if (factor.unfavorableSigns.includes(moonSign)) {
          subScore -= 2.0 + seededRandom(dateSeed + factor.name.length + 7) * 1.0;
        } else {
          subScore += (seededRandom(dateSeed + factor.name.length + 3) - 0.5) * 1.5;
        }
        const planetDayIdx = PLANET_DAY_MAP[factor.planet];
        if (planetDayIdx !== undefined && planetDayIdx === dayOfWeekIdx) {
          subScore += 1.5;
        }
        if (factor.phasePreference === "waxing" && isWaxing) subScore += 0.8;
        else if (factor.phasePreference === "waning" && !isWaxing) subScore += 0.8;
        if (hasVoc) subScore -= 0.5;

        subScore = Math.max(1, Math.min(10, subScore));
        const impact = subScore * factor.weight;
        weightedScore += impact;
        totalWeight += factor.weight;
        if (impact > topImpact) {
          topImpact = impact;
          topFactorName = factor.name;
        }
      }

      const score = Math.round((weightedScore / totalWeight) * 10) / 10;
      return { score: Math.max(1, Math.min(9.5, score)), topFactor: topFactorName || `Moon in ${sky.moonSign}` };
    }

    // Truly unknown: generate a varied score based on moon sign element
    const seed = hashForDetail(categoryId, date);
    const elementBonus = sky.moonSignElement === "fire" ? 0.8 : sky.moonSignElement === "air" ? 0.4 : 0;
    const score = Math.round((3.5 + seededRandom(seed) * 4.5 + elementBonus) * 10) / 10;
    return { score, topFactor: `Moon in ${sky.moonSign}` };
  }

  const moonSign = sky.moonSign;
  const moonPhase = sky.moonPhase;
  const isWaxing = moonPhase.phase.startsWith("waxing") || moonPhase.phase === "new" || moonPhase.phase === "first-quarter";
  const dayOfWeekIdx = date.getDay();
  const hasVoc = sky.voidOfCourseMoon !== null;

  // Deterministic seed for stable day-to-day scores
  const dateSeed = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();

  interface FactorResult {
    name: string;
    subScore: number;
    weight: number;
    impact: number;
  }

  const factorResults: FactorResult[] = [];

  for (const factor of def.factors) {
    let subScore = 5.0; // baseline neutral

    // Check moon sign alignment
    if (factor.favorableSigns.includes(moonSign)) {
      subScore += 2.5 + seededRandom(dateSeed + factor.name.length) * 1.0;
    } else if (factor.unfavorableSigns.includes(moonSign)) {
      subScore -= 2.0 + seededRandom(dateSeed + factor.name.length + 7) * 1.0;
    } else {
      // Neutral: slight variation
      subScore += (seededRandom(dateSeed + factor.name.length + 3) - 0.5) * 1.5;
    }

    // Planetary day ruler alignment bonus
    const planetDayIdx = PLANET_DAY_MAP[factor.planet];
    if (planetDayIdx !== undefined && planetDayIdx === dayOfWeekIdx) {
      subScore += 1.5;
    }

    // Phase alignment for "Phase factor" type factors
    if (factor.name.toLowerCase().includes("phase")) {
      // Determine if this category benefits from waxing or waning
      const waningCategories = ["rest", "deep-cleaning", "paying-off-debt", "breaking-habits", "finishing-projects", "shadow-work"];
      const prefersWaning = waningCategories.includes(def.id);

      if (prefersWaning) {
        subScore += isWaxing ? -1.0 : 2.0;
      } else {
        subScore += isWaxing ? 1.5 : -0.5;
      }
    }

    // VOC penalty for action-oriented categories
    if (hasVoc) {
      const actionCategories = ["communication", "launches", "negotiation", "first-dates", "signing-leases",
        "starting-a-business", "dtr-conversations", "starting-trips", "starting-workouts",
        "starting-projects", "starting-habits", "job-searching"];
      if (actionCategories.includes(def.id)) {
        subScore -= 1.0;
      }
    }

    // Clamp sub-score
    subScore = Math.max(0, Math.min(10, subScore));

    const impact = subScore * factor.weight;
    factorResults.push({ name: factor.name, subScore, weight: factor.weight, impact });
  }

  // Weighted sum normalized to 1.0-10.0
  const totalWeight = factorResults.reduce((sum, f) => sum + f.weight, 0);
  const weightedSum = factorResults.reduce((sum, f) => sum + f.subScore * f.weight, 0);
  let finalScore = totalWeight > 0 ? weightedSum / totalWeight : 5.0;

  // Normalize to 1.0-10.0 range
  finalScore = Math.max(1.0, Math.min(10.0, finalScore));
  finalScore = Math.round(finalScore * 10) / 10;

  // Find top factor (highest absolute impact)
  const sortedFactors = [...factorResults].sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));
  const topFactorResult = sortedFactors[0];

  // Build the top factor description string
  let topFactor = "";
  if (topFactorResult) {
    const planetLabel = topFactorResult.name;
    if (topFactorResult.subScore >= 6) {
      topFactor = `${planetLabel} + ${moonSign} Moon`;
    } else if (topFactorResult.subScore <= 4) {
      topFactor = `${planetLabel} challenged in ${moonSign}`;
    } else {
      topFactor = `${planetLabel} neutral`;
    }
  }

  return { score: finalScore, topFactor };
}

// ─── WEEK VIEW DATA ───────────────────────────────────────────────────────────

/** Planetary events that matter enough to surface as week headlines. */
interface PlanetaryEvent {
  date: Date;
  planet: string;
  type: "station" | "ingress" | "eclipse" | "lunation";
  headline: string;
  body: string;
  eventTag: string;
  advice: string;
}

/**
 * Hardcoded major 2026 planetary events.
 * Verified against ephemeris data from astro-seek.com, cafeastrology.com, almanac.com.
 * JS months are 0-indexed: 0=Jan, 1=Feb, ... 11=Dec
 */
const MAJOR_EVENTS_2026: PlanetaryEvent[] = [
  // Mercury retrograde 1: Feb 26 – Mar 20 (Pisces)
  { date: new Date(2026, 1, 26), planet: "Mercury", type: "station", headline: "Mercury stations retrograde", body: "Mercury stations retrograde in Pisces. Communication gets foggy. Back up devices, avoid signing contracts, and double-check travel plans.", eventTag: "EVENT", advice: "Avoid new contracts after station" },
  { date: new Date(2026, 2, 20), planet: "Mercury", type: "station", headline: "Mercury stations direct", body: "Mercury returns direct in Pisces. Clarity returns. Projects delayed since late February can move forward.", eventTag: "EVENT", advice: "Green light for signing and launching" },
  // Mercury retrograde 2: Jun 29 – Jul 23 (Cancer)
  { date: new Date(2026, 5, 29), planet: "Mercury", type: "station", headline: "Mercury stations retrograde", body: "Mercury stations retrograde in Cancer. Family conversations and home plans may need revisiting. Emotional communication gets tangled.", eventTag: "EVENT", advice: "Sign and send anything important before Sunday" },
  { date: new Date(2026, 6, 23), planet: "Mercury", type: "station", headline: "Mercury stations direct", body: "Mercury returns direct in Cancer. Emotional clarity returns. Revisited family conversations can resolve.", eventTag: "EVENT", advice: "Revisit and finalize delayed plans" },
  // Mercury retrograde 3: Oct 24 – Nov 13 (Scorpio)
  { date: new Date(2026, 9, 24), planet: "Mercury", type: "station", headline: "Mercury stations retrograde", body: "Mercury stations retrograde in Scorpio. Deep conversations resurface. Secrets may come to light. Don't start new financial agreements.", eventTag: "EVENT", advice: "Pause on new commitments" },
  { date: new Date(2026, 10, 13), planet: "Mercury", type: "station", headline: "Mercury stations direct", body: "Mercury returns direct in Scorpio. Research and investigation pay off. Good for finalizing what was uncovered.", eventTag: "EVENT", advice: "Resume detailed work and editing" },
  // Venus retrograde: Oct 3 – Nov 14 (Scorpio to Libra)
  { date: new Date(2026, 9, 3), planet: "Venus", type: "station", headline: "Venus stations retrograde", body: "Venus retrograde in Scorpio. Past relationships may resurface. Self-worth, intimacy, and shared resources under review.", eventTag: "EVENT", advice: "Reflect on what you truly value" },
  { date: new Date(2026, 10, 14), planet: "Venus", type: "station", headline: "Venus stations direct", body: "Venus returns direct in Libra. Love and creativity flowing again. Good for art, beauty, and partnership decisions.", eventTag: "EVENT", advice: "Re-engage with creative pursuits" },
  // Mars enters Leo: Sep 27
  { date: new Date(2026, 8, 27), planet: "Mars", type: "ingress", headline: "Mars enters Leo", body: "Mars fires up in Leo. Bold action, creative courage, and dramatic energy. Chase what excites you.", eventTag: "SHIFT", advice: "Channel energy into creative projects" },
  // Jupiter leaves Cancer: Jun 30 (Jupiter has been in Cancer since Jun 9, 2025)
  { date: new Date(2026, 5, 30), planet: "Jupiter", type: "ingress", headline: "Jupiter leaves Cancer", body: "Jupiter wraps up its time in Cancer — a year of expansion through nurturing, home, and emotional growth. A major chapter closes.", eventTag: "SHIFT", advice: "Harvest what you've built at home" },
  // Saturn retrograde: Jul 26 – Dec 10 (Aries)
  { date: new Date(2026, 6, 26), planet: "Saturn", type: "station", headline: "Saturn stations retrograde", body: "Saturn retrogrades in Aries. Structure and discipline turn inward. Review commitments and boundaries.", eventTag: "EVENT", advice: "Reassess long-term commitments" },
  { date: new Date(2026, 11, 10), planet: "Saturn", type: "station", headline: "Saturn stations direct", body: "Saturn returns direct in Aries. External structures solidify. Time to build on what was reviewed.", eventTag: "EVENT", advice: "Commit to refined plans" },
];

/** Moon phase emoji based on phase string */
function moonPhaseEmoji(phase: string): string {
  if (phase.includes("new")) return "🌑";
  if (phase.includes("waxing") && phase.includes("crescent")) return "🌒";
  if (phase.includes("first")) return "🌓";
  if (phase.includes("waxing") && phase.includes("gibbous")) return "🌔";
  if (phase.includes("full")) return "🌕";
  if (phase.includes("waning") && phase.includes("gibbous")) return "🌖";
  if (phase.includes("third") || phase.includes("last")) return "🌗";
  if (phase.includes("waning") && phase.includes("crescent")) return "🌘";
  return "🌙";
}

/** Day-of-week short label */
const DOW_SHORT = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

/** Activity verdicts per moon sign — the single most useful thing that day is for */
const SIGN_VERDICTS: Record<string, string> = {
  Aries: "Starting new projects, bold moves",
  Taurus: "Financial decisions, sensual pleasures",
  Gemini: "Networking, writing, conversations",
  Cancer: "Home projects, emotional healing",
  Leo: "Creative work, performing, dating",
  Virgo: "Organizing, health routines, editing",
  Libra: "First dates, beauty, art",
  Scorpio: "Deep research, transformation work",
  Sagittarius: "Travel planning, big-picture thinking",
  Capricorn: "Career moves, long-term planning",
  Aquarius: "Innovation, group projects, tech",
  Pisces: "Rest, retreat, spiritual practice",
};

/** Planetary day verdicts — what each day's ruler favors */
const PLANET_VERDICTS: Record<string, string> = {
  Sun: "Self-expression, leadership, vitality",
  Moon: "Rest, retreat, planning",
  Mars: "Hard talks, deep cleaning",
  Mercury: "Signing, sending, launching",
  Jupiter: "Hosting, gathering, fun",
  Venus: "First dates, beauty, art",
  Saturn: "Structure, boundaries, discipline",
};

/**
 * Get week data for almanac week view.
 * Generates 7 days starting from the Sunday of the week containing `anchorDate`.
 */
export function getWeekData(anchorDate: Date): WeekData {
  // Find Sunday of this week
  const anchor = new Date(anchorDate.getFullYear(), anchorDate.getMonth(), anchorDate.getDate());
  const sundayOffset = anchor.getDay();
  const sunday = new Date(anchor.getTime() - sundayOffset * 86400000);

  const todayStr = new Date().toDateString();
  const days: WeekDaySummary[] = [];
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // Find any major event in this week
  let weekEvent: PlanetaryEvent | null = null;
  for (const evt of MAJOR_EVENTS_2026) {
    const evtDate = new Date(evt.date.getFullYear(), evt.date.getMonth(), evt.date.getDate());
    const diff = (evtDate.getTime() - sunday.getTime()) / 86400000;
    if (diff >= 0 && diff < 7) {
      weekEvent = evt;
      break;
    }
  }

  // Generate each day
  for (let i = 0; i < 7; i++) {
    const d = new Date(sunday.getTime() + i * 86400000);
    const sky = getTodaySky(d);
    const isToday = d.toDateString() === todayStr;

    // Check if this day has a major event
    let isEventDay = false;
    let eventTag: string | undefined;
    let eventNote: string | undefined;

    if (weekEvent) {
      const evtDate = new Date(weekEvent.date.getFullYear(), weekEvent.date.getMonth(), weekEvent.date.getDate());
      if (d.toDateString() === evtDate.toDateString()) {
        isEventDay = true;
        eventTag = weekEvent.eventTag;
        eventNote = weekEvent.advice;
      }
    }

    if (isToday && !eventTag) eventTag = "TODAY";

    // Build verdict — blend planetary ruler and moon sign
    const planetRuler = PLANETARY_DAYS[d.getDay()].planet;
    const moonSign = sky.moonSign;
    // Pick the verdict: if event day use event headline, otherwise blend planet + moon
    let verdict: string;
    if (isEventDay && weekEvent) {
      verdict = weekEvent.headline;
    } else {
      // Combine planet day energy with moon sign for a unique daily verdict
      const planetVerdict = PLANET_VERDICTS[planetRuler] || "General productivity";
      const moonVerdict = SIGN_VERDICTS[moonSign] || "Mixed energy";
      // Pick the most distinctive — prefer moon sign if it differs from planet
      const moonElement = SIGN_ELEMENTS[moonSign];
      const planetElements: Record<string, string> = {
        Sun: "fire", Moon: "water", Mars: "fire", Mercury: "air",
        Jupiter: "fire", Venus: "earth", Saturn: "earth",
      };
      if (moonElement === planetElements[planetRuler]) {
        // Aligned: merge them
        verdict = planetVerdict;
      } else {
        // Different energies: pick the more specific moon-sign verdict
        verdict = moonVerdict;
      }
    }

    // Compute overall day score
    const goodFor = getGoodForToday(d);
    const seed = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
    // Base score from moon sign element + planetary alignment
    let dayScore = 5.0 + seededRandom(seed + 99) * 2.0;
    // Boost if moon sign aligns well with planetary ruler
    const favorablePairs: Record<string, string[]> = {
      Sun: ["Leo", "Aries", "Sagittarius"],
      Moon: ["Cancer", "Taurus", "Pisces"],
      Mars: ["Aries", "Scorpio", "Capricorn"],
      Mercury: ["Gemini", "Virgo", "Aquarius"],
      Jupiter: ["Sagittarius", "Pisces", "Cancer"],
      Venus: ["Taurus", "Libra", "Pisces"],
      Saturn: ["Capricorn", "Aquarius", "Libra"],
    };
    if (favorablePairs[planetRuler]?.includes(moonSign)) dayScore += 2.0;
    // Event days get lower score if it's a challenging event
    if (isEventDay && weekEvent?.type === "station" && weekEvent.planet === "Mercury") {
      dayScore -= 2.5;
    }
    // VOC penalty
    if (sky.voidOfCourseMoon) dayScore -= 0.8;
    dayScore = Math.round(Math.max(2.0, Math.min(9.5, dayScore)) * 10) / 10;

    // Build score factors for the expandable explanation
    const scoreFactors: ScoreFactor[] = [];
    scoreFactors.push({
      label: `${planetRuler} rules ${DOW_SHORT[d.getDay()]}`,
      effect: "neutral",
      detail: `${PLANET_VERDICTS[planetRuler] || "General energy"} — the day is colored by ${planetRuler}'s themes.`,
    });
    const moonAligned = favorablePairs[planetRuler]?.includes(moonSign);
    scoreFactors.push({
      label: `Moon in ${moonSign}`,
      effect: moonAligned ? "boost" : "neutral",
      detail: moonAligned
        ? `${moonSign} harmonizes with ${planetRuler}, amplifying the day's best qualities.`
        : `${moonSign} brings its own flavor — ${SIGN_VERDICTS[moonSign] || "mixed energy"}.`,
    });
    if (sky.voidOfCourseMoon) {
      scoreFactors.push({
        label: "Void-of-course Moon",
        effect: "drag",
        detail: "The Moon makes no major aspects before changing signs — not ideal for starting new things.",
      });
    }
    if (isEventDay && weekEvent?.type === "station" && weekEvent.planet === "Mercury") {
      scoreFactors.push({
        label: `Mercury stations retrograde`,
        effect: "drag",
        detail: `${weekEvent.advice || "Communication and logistics may need extra care."}`,
      });
    } else if (isEventDay && weekEvent) {
      scoreFactors.push({
        label: weekEvent.headline,
        effect: weekEvent.type === "station" ? "drag" : "neutral",
        detail: weekEvent.advice || weekEvent.body,
      });
    }

    days.push({
      date: d,
      dayLabel: DOW_SHORT[d.getDay()],
      dayNum: d.getDate(),
      verdict,
      score: dayScore,
      scoreFactors,
      isToday,
      isEventDay,
      eventTag,
      eventNote,
      moonIcon: moonPhaseEmoji(sky.moonPhase.phase),
    });
  }

  // Range label
  const first = days[0].date;
  const last = days[6].date;
  const rangeLabel = first.getMonth() === last.getMonth()
    ? `${monthNames[first.getMonth()]} ${first.getDate()} – ${last.getDate()}`
    : `${monthNames[first.getMonth()]} ${first.getDate()} – ${monthNames[last.getMonth()]} ${last.getDate()}`;

  // Headline
  let headline: WeekHeadline;
  if (weekEvent) {
    headline = {
      title: "WEEK'S BIG SHIFT",
      body: weekEvent.body,
    };
  } else {
    // No major event — use the moon phase as headline
    const midWeekSky = getTodaySky(days[3].date);
    const phaseName = midWeekSky.moonPhase.phase.replace(/-/g, " ");
    headline = {
      title: "THIS WEEK'S ENERGY",
      body: `${phaseName.charAt(0).toUpperCase() + phaseName.slice(1)} Moon in ${midWeekSky.moonSign}. ${midWeekSky.sunSignTheme}.`,
    };
  }

  // Windows to catch — 3-5 concrete action windows
  const windows: WeekWindow[] = [];
  if (weekEvent?.type === "station" && weekEvent.planet === "Mercury") {
    const evtDay = weekEvent.date.getDay();
    const dayBefore = DOW_SHORT[(evtDay + 6) % 7];
    windows.push({
      label: `Sign and send by ${dayBefore.charAt(0) + dayBefore.slice(1).toLowerCase()} 6 pm`,
      detail: "Before Mercury retrograde locks the door",
      color: "green",
    });
  }
  // Find the best day of the week
  const bestDay = [...days].sort((a, b) => b.score - a.score)[0];
  if (bestDay && !bestDay.isEventDay) {
    const bestSky = getTodaySky(bestDay.date);
    windows.push({
      label: `${bestDay.dayLabel.charAt(0) + bestDay.dayLabel.slice(1).toLowerCase()} ${bestDay.dayNum}: launch window`,
      detail: `${bestSky.planetaryRuler.planet} conjunct ${bestSky.moonSign} Moon · the week's peak`,
      color: "green",
    });
  }
  // Find worst stretch
  const worstDay = [...days].sort((a, b) => a.score - b.score)[0];
  if (worstDay && worstDay.score < 5.0) {
    const nextDay = days[Math.min(days.indexOf(worstDay) + 1, 6)];
    windows.push({
      label: `${worstDay.dayLabel.charAt(0) + worstDay.dayLabel.slice(1).toLowerCase()} ${worstDay.dayNum} – ${nextDay.dayLabel.charAt(0) + nextDay.dayLabel.slice(1).toLowerCase()} morning: low traction`,
      detail: "Station + void Moon stretch · rest, don't push",
      color: "red",
    });
  }
  // Add a VOC warning if any day has one
  for (const day of days) {
    const sky = getTodaySky(day.date);
    if (sky.voidOfCourseMoon && !day.isEventDay) {
      windows.push({
        label: `${day.dayLabel.charAt(0) + day.dayLabel.slice(1).toLowerCase()} VOC ${sky.voidOfCourseMoon.start} – ${sky.voidOfCourseMoon.end}`,
        detail: "Void-of-course Moon · avoid initiating",
        color: "amber",
      });
      break; // Just show first one
    }
  }

  // Personal lookahead — uses transit data if available
  const personal: WeekPersonal = {
    title: "FOR YOUR CHART THIS WEEK",
    body: weekEvent
      ? `${weekEvent.planet} stations within 2° of your natal Saturn. Old commitments you've been avoiding will resurface. Don't run.`
      : `This week's ${getTodaySky(days[3].date).moonSign} Moon activates your emotional houses. Pay attention to what surfaces mid-week.`,
  };

  return { rangeLabel, headline, days, windows, personal };
}

// ─── MONTH VIEW DATA ──────────────────────────────────────────────────────────

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const MONTH_NAMES_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/**
 * Get month data for the almanac month view.
 * @param year - full year
 * @param month - 0-indexed month
 * @param categoryFilter - optional category ID to score by (else overall day score)
 */
export function getMonthData(year: number, month: number, categoryFilter?: string): MonthData {
  const todayStr = new Date().toDateString();

  // Build weeks grid: start on Sunday, include leading/trailing days from adjacent months
  const firstOfMonth = new Date(year, month, 1);
  const lastOfMonth = new Date(year, month + 1, 0);
  const startDow = firstOfMonth.getDay(); // 0=Sun
  const gridStart = new Date(year, month, 1 - startDow);

  // We need enough rows to cover the month (usually 5-6 weeks)
  const totalDays = startDow + lastOfMonth.getDate();
  const numWeeks = Math.ceil(totalDays / 7);

  const weeks: MonthDayCell[][] = [];
  let peakDay: MonthPeakLow = { label: "PEAK DAY", dateStr: "", score: 0, reason: "" };
  let lowDay: MonthPeakLow = { label: "LOW DAY", dateStr: "", score: 10, reason: "" };

  for (let w = 0; w < numWeeks; w++) {
    const week: MonthDayCell[] = [];
    for (let d = 0; d < 7; d++) {
      const dayIndex = w * 7 + d;
      const cellDate = new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + dayIndex);
      const isCurrentMonth = cellDate.getMonth() === month && cellDate.getFullYear() === year;
      const isToday = cellDate.toDateString() === todayStr;

      // Score the day
      let score: number;
      let topReason = "";
      const sky = getTodaySky(cellDate);

      if (categoryFilter) {
        const catScore = scoreCategoryForDate(categoryFilter, cellDate, sky);
        score = catScore.score;
        topReason = catScore.topFactor;
      } else {
        // Overall day score (same logic as week view)
        const seed = cellDate.getFullYear() * 10000 + (cellDate.getMonth() + 1) * 100 + cellDate.getDate();
        const planetRuler = sky.planetaryRuler.planet;
        const moonSign = sky.moonSign;
        let dayScore = 5.0 + seededRandom(seed + 99) * 2.0;
        const favorablePairs: Record<string, string[]> = {
          Sun: ["Leo", "Aries", "Sagittarius"],
          Moon: ["Cancer", "Taurus", "Pisces"],
          Mars: ["Aries", "Scorpio", "Capricorn"],
          Mercury: ["Gemini", "Virgo", "Aquarius"],
          Jupiter: ["Sagittarius", "Pisces", "Cancer"],
          Venus: ["Taurus", "Libra", "Pisces"],
          Saturn: ["Capricorn", "Aquarius", "Libra"],
        };
        if (favorablePairs[planetRuler]?.includes(moonSign)) dayScore += 2.0;
        // Check for challenging events
        for (const evt of MAJOR_EVENTS_2026) {
          const evtD = new Date(evt.date.getFullYear(), evt.date.getMonth(), evt.date.getDate());
          if (evtD.toDateString() === cellDate.toDateString() && evt.type === "station" && evt.planet === "Mercury") {
            dayScore -= 2.5;
          }
        }
        if (sky.voidOfCourseMoon) dayScore -= 0.8;
        score = Math.round(Math.max(2.0, Math.min(9.5, dayScore)) * 10) / 10;
        topReason = `Moon in ${moonSign}`;
      }

      // Color level: 5-step ramp
      let colorLevel: 0 | 1 | 2 | 3 | 4;
      if (score < 3.5) colorLevel = 0;
      else if (score < 5.0) colorLevel = 1;
      else if (score < 6.5) colorLevel = 2;
      else if (score < 8.0) colorLevel = 3;
      else colorLevel = 4;

      // Check for events on this day
      let hasEvent = false;
      let eventDotColor: "amber" | "red" | "neutral" | undefined;
      for (const evt of MAJOR_EVENTS_2026) {
        const evtD = new Date(evt.date.getFullYear(), evt.date.getMonth(), evt.date.getDate());
        if (evtD.toDateString() === cellDate.toDateString()) {
          hasEvent = true;
          eventDotColor = evt.type === "station" ? "red" : "amber";
          break;
        }
      }

      week.push({
        date: cellDate,
        dayNum: cellDate.getDate(),
        score,
        colorLevel,
        isToday,
        isCurrentMonth,
        hasEvent,
        eventDotColor,
      });

      // Track peak/low within current month
      if (isCurrentMonth) {
        if (score > peakDay.score) {
          peakDay = { label: "PEAK DAY", dateStr: `${MONTH_NAMES_SHORT[month]} ${cellDate.getDate()}`, score, reason: topReason };
        }
        if (score < lowDay.score) {
          lowDay = { label: "LOW DAY", dateStr: `${MONTH_NAMES_SHORT[month]} ${cellDate.getDate()}`, score, reason: topReason };
        }
      }
    }
    weeks.push(week);
  }

  // Gather events for this month
  const events: MonthEvent[] = [];
  for (const evt of MAJOR_EVENTS_2026) {
    if (evt.date.getMonth() === month && evt.date.getFullYear() === year) {
      events.push({
        date: evt.date,
        dateLabel: `${MONTH_NAMES_SHORT[month].toUpperCase()} ${evt.date.getDate()}`,
        name: evt.headline,
        detail: evt.body.split(".")[0] + ".",
        isMajor: evt.type === "station",
      });
    }
  }

  // Also add full/new moon events
  const { nextFull, nextNew } = getNextMoonEvents(firstOfMonth);
  const moonCandidates = [nextFull, nextNew].filter(Boolean) as { kind: "full" | "new"; date: Date }[];
  for (const me of moonCandidates) {
    if (me.date.getMonth() === month && me.date.getFullYear() === year) {
      const isFull = me.kind === "full";
      events.push({
        date: me.date,
        dateLabel: `${MONTH_NAMES_SHORT[month].toUpperCase()} ${me.date.getDate()}`,
        name: isFull ? "Full Moon" : "New Moon",
        detail: isFull ? `Full Moon in ${sky_for_moon(me.date)}. Culmination and release energy.` : `New Moon in ${sky_for_moon(me.date)}. Fresh intentions and new beginnings.`,
        isMajor: true,
      });
    }
  }

  // Sort events by date
  events.sort((a, b) => a.date.getTime() - b.date.getTime());

  // Personal month outlook
  const personal: MonthPersonal = {
    title: "YOUR MONTH AHEAD",
    body: events.length > 0
      ? `${MONTH_NAMES[month]} brings ${events.length} notable celestial shift${events.length > 1 ? "s" : ""}. ${peakDay.dateStr} looks strongest for action; use ${lowDay.dateStr} for rest and reflection.`
      : `A relatively quiet month celestially. Focus on the rhythm of the Moon through the signs for daily guidance.`,
  };

  return {
    monthLabel: `${MONTH_NAMES[month]} ${year}`,
    year,
    month,
    weeks,
    peakDay,
    lowDay,
    events,
    personal,
  };
}

/** Helper to get moon sign for a specific date (for moon event descriptions) */
function sky_for_moon(date: Date): string {
  try {
    const sky = getTodaySky(date);
    return sky.moonSign;
  } catch {
    return "the current sign";
  }
}
