// ============================================================================
// gardeningAlmanac.ts — Gardening & Planting data for almanac
// Moon-sign planting guidance, seasonal tasks, frost dates, and USDA zone info.
// Based on traditional biodynamic/lunar gardening principles.
// Zone-aware: pass a USDA zone (see USDA_ZONES); falls back to Zone 8b
// only when no zone is provided.
// Hemisphere-aware: pass `southernHemisphere: true` (lat < 0) to shift all
// month-keyed seasonal data and frost dates by six months. USDA zone labels
// remain as-is — outside the US the latitude-estimated zone still works as a
// climate proxy even though the "USDA" naming is a US convention.
// ============================================================================

// --------------------------------------------------------------------------
// Interfaces
// --------------------------------------------------------------------------

export interface PlantingGuidance {
  moonSign: string;
  element: "fire" | "water" | "earth" | "air";
  fertility: "fertile" | "semi-fertile" | "barren";
  plantingAdvice: string[];
  avoidAdvice: string[];
  gardenTasks: string[];
  bodyPart: string; // traditional body rulership for the sign
}

export interface SeasonalTask {
  task: string;
  category: "plant" | "harvest" | "maintain" | "prepare";
  icon: string;
}

export interface FrostInfo {
  lastSpringFrost: string;     // typical date string "Mar 1"
  firstFallFrost: string;      // typical date "Nov 28"
  daysUntilLastFrost: number | null;  // null if past
  daysSinceLastFrost: number | null;  // null if before
  daysUntilFirstFrost: number | null; // null if past
  growingSeasonDays: number;
  isGrowingSeason: boolean;
  frostRisk: "none" | "low" | "moderate" | "high";
}

export interface GardeningData {
  planting: PlantingGuidance;
  seasonalTasks: SeasonalTask[];
  frost: FrostInfo;
  moonPhaseGardening: string;   // what the current moon phase means for gardening
  todaysSummary: string;        // one-sentence daily gardening summary
}

// --------------------------------------------------------------------------
// Moon Sign Planting Table (traditional biodynamic)
// --------------------------------------------------------------------------

const MOON_SIGN_PLANTING: Record<string, PlantingGuidance> = {
  Aries: {
    moonSign: "Aries",
    element: "fire",
    fertility: "barren",
    plantingAdvice: [
      "Plant garlic, onions, and peppers",
      "Sow quick-germinating seeds like radishes",
    ],
    avoidAdvice: [
      "Avoid transplanting — roots don't settle well",
      "Skip planting leafy greens",
    ],
    gardenTasks: [
      "Weed and cultivate soil",
      "Harvest root crops for storage",
      "Destroy pests and diseased plants",
      "Turn compost piles",
    ],
    bodyPart: "Head",
  },
  Taurus: {
    moonSign: "Taurus",
    element: "earth",
    fertility: "fertile",
    plantingAdvice: [
      "Plant potatoes, root vegetables, and bulbs",
      "Start leafy greens — lettuce, spinach, kale",
      "Transplant established seedlings",
    ],
    avoidAdvice: [
      "Avoid harvesting for long storage (too moist)",
    ],
    gardenTasks: [
      "Transplant and repot houseplants",
      "Lay sod or plant ground cover",
      "Fertilize and add compost",
    ],
    bodyPart: "Neck & Throat",
  },
  Gemini: {
    moonSign: "Gemini",
    element: "air",
    fertility: "barren",
    plantingAdvice: [
      "Plant melons and vining crops if you must",
      "Sow flower seeds for later bloom",
    ],
    avoidAdvice: [
      "Avoid planting most vegetables",
      "Skip transplanting",
    ],
    gardenTasks: [
      "Harvest herbs for drying",
      "Mow lawn to slow growth",
      "Cultivate and weed",
      "Spray for pests",
    ],
    bodyPart: "Arms & Lungs",
  },
  Cancer: {
    moonSign: "Cancer",
    element: "water",
    fertility: "fertile",
    plantingAdvice: [
      "Best sign for planting most crops",
      "Start leafy greens, beans, and squash",
      "Plant flowering vines and annuals",
      "Transplant anything — highest success rate",
    ],
    avoidAdvice: [
      "Avoid harvesting for storage (too juicy)",
    ],
    gardenTasks: [
      "Water deeply — plants absorb more now",
      "Graft fruit trees",
      "Irrigate and fertilize",
      "Bud fruit trees",
    ],
    bodyPart: "Chest & Stomach",
  },
  Leo: {
    moonSign: "Leo",
    element: "fire",
    fertility: "barren",
    plantingAdvice: [
      "Only plant sunflowers and other sun-lovers",
    ],
    avoidAdvice: [
      "Avoid planting or transplanting most crops",
      "Not ideal for starting seeds",
    ],
    gardenTasks: [
      "Mow lawn to retard growth",
      "Cultivate and destroy weeds",
      "Harvest crops for drying or storage",
      "Can fruits and vegetables",
    ],
    bodyPart: "Heart & Back",
  },
  Virgo: {
    moonSign: "Virgo",
    element: "earth",
    fertility: "barren",
    plantingAdvice: [
      "Plant decorative flowers and vines",
      "Good for perennial flowers (not food crops)",
    ],
    avoidAdvice: [
      "Avoid planting vegetables for eating",
      "Skip starting new fruit trees",
    ],
    gardenTasks: [
      "Cultivate and turn soil",
      "Destroy weeds and pests",
      "Harvest root crops for storage",
      "Detail work — staking, tying, trellising",
    ],
    bodyPart: "Intestines",
  },
  Libra: {
    moonSign: "Libra",
    element: "air",
    fertility: "semi-fertile",
    plantingAdvice: [
      "Plant flowers for beauty and fragrance",
      "Sow root vegetables — turnips, beets, carrots",
      "Start vine crops — grapes, hops, clematis",
    ],
    avoidAdvice: [
      "Not ideal for leafy greens",
    ],
    gardenTasks: [
      "Fertilize and amend soil",
      "Plant ornamental trees and shrubs",
      "Create new flower beds",
    ],
    bodyPart: "Kidneys & Lower Back",
  },
  Scorpio: {
    moonSign: "Scorpio",
    element: "water",
    fertility: "fertile",
    plantingAdvice: [
      "Second-best sign for planting (after Cancer)",
      "Plant tomatoes, peppers, squash, and corn",
      "Start seeds for strong germination",
      "Transplant for vigorous root growth",
    ],
    avoidAdvice: [
      "Avoid harvesting for storage",
    ],
    gardenTasks: [
      "Water and irrigate",
      "Apply liquid fertilizer",
      "Prune to encourage growth",
      "Transplant — roots establish quickly",
    ],
    bodyPart: "Reproductive organs",
  },
  Sagittarius: {
    moonSign: "Sagittarius",
    element: "fire",
    fertility: "barren",
    plantingAdvice: [
      "Plant onions, garlic, and leeks",
      "Sow hay and grain crops",
    ],
    avoidAdvice: [
      "Avoid planting most vegetables",
      "Skip transplanting",
    ],
    gardenTasks: [
      "Harvest root crops",
      "Cultivate soil",
      "Spray for pests",
      "Trim trees to retard growth",
    ],
    bodyPart: "Hips & Thighs",
  },
  Capricorn: {
    moonSign: "Capricorn",
    element: "earth",
    fertility: "semi-fertile",
    plantingAdvice: [
      "Plant root vegetables — potatoes, carrots, beets",
      "Set out tubers and bulbs",
      "Good for perennials and trees",
    ],
    avoidAdvice: [
      "Less ideal for above-ground annuals",
    ],
    gardenTasks: [
      "Prune to promote growth",
      "Graft or bud fruit trees",
      "Apply organic matter",
      "Plant trees and woody shrubs",
    ],
    bodyPart: "Knees & Bones",
  },
  Aquarius: {
    moonSign: "Aquarius",
    element: "air",
    fertility: "barren",
    plantingAdvice: [
      "Plant onions and garlic only",
    ],
    avoidAdvice: [
      "Avoid planting or transplanting",
      "Not suitable for starting seeds",
    ],
    gardenTasks: [
      "Harvest for storage and drying",
      "Weed and cultivate",
      "Destroy pests",
      "Turn compost",
      "Mow to retard growth",
    ],
    bodyPart: "Ankles & Circulation",
  },
  Pisces: {
    moonSign: "Pisces",
    element: "water",
    fertility: "fertile",
    plantingAdvice: [
      "Excellent for planting all crops",
      "Start root vegetables and leafy greens",
      "Plant flowers for abundant blooms",
      "Good for transplanting",
    ],
    avoidAdvice: [
      "Avoid harvesting — too much moisture",
    ],
    gardenTasks: [
      "Water thoroughly",
      "Fertilize and feed",
      "Plant and transplant freely",
      "Start compost tea",
    ],
    bodyPart: "Feet & Lymphatic system",
  },
};

// --------------------------------------------------------------------------
// Seasonal Tasks by Month (general guide — time plantings to your zone's
// frost dates; cooler zones shift later in spring, earlier in fall)
// --------------------------------------------------------------------------

const SEASONAL_TASKS: Record<number, SeasonalTask[]> = {
  0: [ // January
    { task: "Plan spring garden layout", category: "prepare", icon: "📋" },
    { task: "Order seeds for spring planting", category: "prepare", icon: "🌱" },
    { task: "Prune dormant fruit trees", category: "maintain", icon: "✂️" },
    { task: "Plant bare-root trees and roses", category: "plant", icon: "🌹" },
    { task: "Start onion sets indoors", category: "plant", icon: "🧅" },
    { task: "Turn and aerate compost", category: "maintain", icon: "♻️" },
  ],
  1: [ // February
    { task: "Direct-sow cool-season crops (lettuce, spinach, peas)", category: "plant", icon: "🥬" },
    { task: "Start tomato and pepper seeds indoors", category: "plant", icon: "🍅" },
    { task: "Plant potatoes a few weeks before your last frost date", category: "plant", icon: "🥔" },
    { task: "Prune roses before new growth", category: "maintain", icon: "🌹" },
    { task: "Apply pre-emergent for summer weeds", category: "maintain", icon: "🌿" },
    { task: "Divide perennials", category: "maintain", icon: "✂️" },
  ],
  2: [ // March
    { task: "Transplant tomatoes and peppers after last frost", category: "plant", icon: "🍅" },
    { task: "Direct-sow beans, squash, and cucumbers", category: "plant", icon: "🫘" },
    { task: "Plant herb garden — basil, cilantro, dill", category: "plant", icon: "🌿" },
    { task: "Set out marigolds and zinnias", category: "plant", icon: "🌼" },
    { task: "Mulch beds heavily (3-4 inches)", category: "maintain", icon: "🍂" },
    { task: "Start composting spring clippings", category: "maintain", icon: "♻️" },
  ],
  3: [ // April
    { task: "Plant okra, sweet potatoes, and melons", category: "plant", icon: "🍈" },
    { task: "Succession-plant beans every 2 weeks", category: "plant", icon: "🫘" },
    { task: "Harvest spring lettuce before bolting", category: "harvest", icon: "🥬" },
    { task: "Watch for tomato hornworms", category: "maintain", icon: "🐛" },
    { task: "Deep-water established trees", category: "maintain", icon: "💧" },
    { task: "Plant sunflowers for summer cutting", category: "plant", icon: "🌻" },
  ],
  4: [ // May
    { task: "Harvest spring onions and garlic", category: "harvest", icon: "🧅" },
    { task: "Plant warm-season crops once frost danger has passed", category: "plant", icon: "🌶️" },
    { task: "Harvest strawberries and blackberries", category: "harvest", icon: "🍓" },
    { task: "Set up drip irrigation for summer", category: "prepare", icon: "💧" },
    { task: "Mulch heavily before heat arrives", category: "maintain", icon: "🍂" },
    { task: "Succession-plant heat-tolerant beans and peas", category: "plant", icon: "🫘" },
  ],
  5: [ // June
    { task: "Harvest tomatoes, peppers, and squash", category: "harvest", icon: "🍅" },
    { task: "Water deeply 2-3× per week", category: "maintain", icon: "💧" },
    { task: "Plant fall tomato seeds indoors", category: "plant", icon: "🍅" },
    { task: "Harvest herbs before they bolt", category: "harvest", icon: "🌿" },
    { task: "Check for spider mites in heat", category: "maintain", icon: "🔍" },
    { task: "Preserve and can summer bounty", category: "harvest", icon: "🫙" },
  ],
  6: [ // July
    { task: "Start fall garden planning", category: "prepare", icon: "📋" },
    { task: "Plant fall tomatoes (transplants)", category: "plant", icon: "🍅" },
    { task: "Continue harvesting summer crops", category: "harvest", icon: "🌽" },
    { task: "Solarize empty beds for fall", category: "prepare", icon: "☀️" },
    { task: "Water container plants daily", category: "maintain", icon: "💧" },
    { task: "Sow pumpkins for fall harvest", category: "plant", icon: "🎃" },
  ],
  7: [ // August
    { task: "Transplant fall tomatoes and peppers", category: "plant", icon: "🍅" },
    { task: "Direct-sow fall beans and squash", category: "plant", icon: "🫘" },
    { task: "Start cool-season seedlings indoors", category: "plant", icon: "🌱" },
    { task: "Plant fall-blooming perennials", category: "plant", icon: "🌸" },
    { task: "Divide iris and daylilies", category: "maintain", icon: "✂️" },
    { task: "Prep beds for fall planting", category: "prepare", icon: "🪴" },
  ],
  8: [ // September
    { task: "Plant cool-season veggies (broccoli, kale, greens)", category: "plant", icon: "🥦" },
    { task: "Sow wildflower seeds for spring", category: "plant", icon: "🌼" },
    { task: "Plant garlic cloves", category: "plant", icon: "🧄" },
    { task: "Harvest sweet potatoes before frost", category: "harvest", icon: "🍠" },
    { task: "Overseed lawn with winter rye", category: "maintain", icon: "🌾" },
    { task: "Amend soil with compost for fall", category: "prepare", icon: "♻️" },
  ],
  9: [ // October
    { task: "Plant spring-blooming bulbs (tulips, daffodils)", category: "plant", icon: "🌷" },
    { task: "Direct-sow lettuce, spinach, and radishes", category: "plant", icon: "🥬" },
    { task: "Harvest pumpkins and winter squash", category: "harvest", icon: "🎃" },
    { task: "Plant trees and shrubs (ideal time)", category: "plant", icon: "🌳" },
    { task: "Collect and save seeds", category: "harvest", icon: "🌻" },
    { task: "Add fallen leaves to compost", category: "maintain", icon: "🍂" },
  ],
  10: [ // November
    { task: "Plant onion sets and multipliers", category: "plant", icon: "🧅" },
    { task: "Harvest fall greens and root vegetables", category: "harvest", icon: "🥕" },
    { task: "Protect tender plants from frost", category: "maintain", icon: "🧊" },
    { task: "Plant cover crops in empty beds", category: "plant", icon: "🌾" },
    { task: "Clean and store summer tools", category: "prepare", icon: "🧹" },
    { task: "Mulch around perennials", category: "maintain", icon: "🍂" },
  ],
  11: [ // December
    { task: "Plan next year's garden", category: "prepare", icon: "📋" },
    { task: "Prune dormant shade trees", category: "maintain", icon: "✂️" },
    { task: "Harvest winter greens (kale, collards)", category: "harvest", icon: "🥬" },
    { task: "Protect tender perennials from hard freezes", category: "maintain", icon: "🧊" },
    { task: "Build or repair raised beds", category: "prepare", icon: "🪵" },
    { task: "Test soil and amend for spring", category: "prepare", icon: "🧪" },
  ],
};

// --------------------------------------------------------------------------
// Frost dates — resolved per USDA zone via USDA_ZONES (defined below).
// Zone 8b is used only as a final default when no zone is provided.
// --------------------------------------------------------------------------

const DEFAULT_ZONE = "8b";

// Day-of-year offset for the first of each month (non-leap year).
const MONTH_DOY_OFFSET: Record<string, number> = {
  Jan: 0, Feb: 31, Mar: 59, Apr: 90, May: 120, Jun: 151,
  Jul: 181, Aug: 212, Sep: 243, Oct: 273, Nov: 304, Dec: 334,
};

/** Convert a frost date string like "Mar 1" to an approximate day of year. */
function frostDateToDayOfYear(dateStr: string): number {
  const [mon, day] = dateStr.split(" ");
  return (MONTH_DOY_OFFSET[mon] ?? 0) + (parseInt(day, 10) || 1);
}

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
const MONTH_DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

/** Convert a day of year (1–365, non-leap) back to a date string like "Aug 30". */
function dayOfYearToFrostDate(doy: number): string {
  let d = ((doy - 1) % 365 + 365) % 365 + 1; // normalize to 1..365
  for (let m = 0; m < 12; m++) {
    if (d <= MONTH_DAYS[m]) return `${MONTH_NAMES[m]} ${d}`;
    d -= MONTH_DAYS[m];
  }
  return "Dec 31";
}

/**
 * Shift a northern-hemisphere day-of-year by half a year for the southern
 * hemisphere (e.g. a "Mar 1" last frost, doy 60, becomes doy 242 ≈ Aug 30).
 */
function shiftDoyForSouth(doy: number): number {
  return ((doy + 182 - 1) % 365) + 1; // keep result in 1..365
}

/**
 * Map a calendar month (0–11) to the equivalent seasonal month for
 * month-keyed northern-hemisphere data (SEASONAL_TASKS, plantNow lists).
 * June (5) in Sydney → northern December (11).
 */
function seasonalMonth(month: number, southernHemisphere?: boolean): number {
  return southernHemisphere ? (month + 6) % 12 : month;
}

/** Resolve a ZoneInfo from a user-selected zone, falling back to the default. */
function resolveZone(userZone?: string): ZoneInfo {
  return (
    USDA_ZONES.find(z => z.zone === (userZone || DEFAULT_ZONE)) ||
    USDA_ZONES.find(z => z.zone === DEFAULT_ZONE)!
  );
}

// --------------------------------------------------------------------------
// Moon Phase Gardening Guide
// --------------------------------------------------------------------------

function getMoonPhaseGardeningNote(moonPhaseName: string): string {
  const phase = moonPhaseName.toLowerCase();
  if (phase.includes("new")) {
    return "New Moon — plant above-ground leafy annuals. Sap rises, encouraging leaf growth. Best for lettuce, spinach, cabbage, celery, and grain crops.";
  }
  if (phase.includes("waxing crescent") || phase.includes("first quarter")) {
    return "Waxing Moon — plant above-ground crops that bear fruit with seeds inside (tomatoes, beans, peppers, squash). Increasing light stimulates leaf growth and strong stems.";
  }
  if (phase.includes("waxing gibbous")) {
    return "Waxing Gibbous — excellent transplanting days. Strong root and leaf growth. Plant perennials, biennials, and anything you want to establish quickly.";
  }
  if (phase.includes("full")) {
    return "Full Moon — plant root crops (carrots, potatoes, beets, turnips). Energy is pulling downward. Also good for transplanting and pruning.";
  }
  if (phase.includes("waning gibbous") || phase.includes("third quarter")) {
    return "Waning Moon — plant root crops, bulbs, and perennials. Decreasing light favors root development. Good for planting trees and dividing plants.";
  }
  if (phase.includes("waning crescent") || phase.includes("last quarter")) {
    return "Dark/Waning Moon — rest period. Do not plant. Focus on weeding, pruning, turning compost, pest control, and soil preparation.";
  }
  return "Waning Moon — a rest phase for the garden. Focus on maintenance: weeding, composting, pest control, and preparing beds for the next cycle.";
}

// --------------------------------------------------------------------------
// Main Export
// --------------------------------------------------------------------------

/**
 * @param southernHemisphere Set true for users below the equator (lat < 0).
 * Shifts month-keyed seasonal tasks and frost dates by six months.
 */
export function getGardeningData(
  date: Date,
  moonSign: string,
  moonPhaseName: string,
  userZone?: string,
  southernHemisphere?: boolean,
): GardeningData {
  const month = seasonalMonth(date.getMonth(), southernHemisphere);
  const dayOfYear = getDayOfYear(date);

  // Planting guidance from moon sign
  const planting = MOON_SIGN_PLANTING[moonSign] || MOON_SIGN_PLANTING["Aries"];

  // Seasonal tasks for this month (hemisphere-adjusted)
  const seasonalTasks = SEASONAL_TASKS[month] || [];

  // Frost calculations (zone- and hemisphere-aware)
  const frost = computeFrostInfo(dayOfYear, userZone, southernHemisphere);

  // Moon phase gardening note
  const moonPhaseGardening = getMoonPhaseGardeningNote(moonPhaseName);

  // Build today's summary
  const todaysSummary = buildTodaySummary(planting, frost, moonPhaseName, month);

  return {
    planting,
    seasonalTasks,
    frost,
    moonPhaseGardening,
    todaysSummary,
  };
}

// --------------------------------------------------------------------------
// Helpers
// --------------------------------------------------------------------------

function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / 86400000);
}

function computeFrostInfo(
  dayOfYear: number,
  userZone?: string,
  southernHemisphere?: boolean,
): FrostInfo {
  const zoneInfo = resolveZone(userZone);
  let lastFrostDoy = frostDateToDayOfYear(zoneInfo.lastFrost);
  let firstFrostDoy = frostDateToDayOfYear(zoneInfo.firstFrost);
  if (southernHemisphere) {
    // Shift both frost dates by half a year. The growing season then wraps
    // the calendar year (e.g. zone 8b: last frost ~Aug 30, first frost ~May 29).
    lastFrostDoy = shiftDoyForSouth(lastFrostDoy);
    firstFrostDoy = shiftDoyForSouth(firstFrostDoy);
  }
  // Printed strings are derived from the (possibly shifted) DOYs so they
  // always match the arithmetic below.
  const lastSpringFrost = southernHemisphere
    ? dayOfYearToFrostDate(lastFrostDoy)
    : zoneInfo.lastFrost;
  const firstFallFrost = southernHemisphere
    ? dayOfYearToFrostDate(firstFrostDoy)
    : zoneInfo.firstFrost;
  // Modular season length — handles the southern wrap around Dec 31.
  const growingSeasonDays = (firstFrostDoy - lastFrostDoy + 365) % 365;

  let daysUntilLastFrost: number | null = null;
  let daysSinceLastFrost: number | null = null;
  let daysUntilFirstFrost: number | null = null;
  let isGrowingSeason = false;
  let frostRisk: "none" | "low" | "moderate" | "high" = "none";

  // Days elapsed since the last spring frost, wrapping the year boundary.
  const sinceLastFrost = (dayOfYear - lastFrostDoy + 365) % 365;

  if (sinceLastFrost <= growingSeasonDays) {
    // Growing season
    daysSinceLastFrost = sinceLastFrost;
    daysUntilFirstFrost = growingSeasonDays - sinceLastFrost;
    isGrowingSeason = true;
    frostRisk = daysUntilFirstFrost < 14 ? "low" : "none";
  } else {
    // Frost season (after first frost and/or before the next last frost)
    daysUntilLastFrost = 365 - sinceLastFrost;
    isGrowingSeason = false;
    frostRisk = daysUntilLastFrost < 14 ? "moderate" : "high";
  }

  return {
    lastSpringFrost,
    firstFallFrost,
    daysUntilLastFrost,
    daysSinceLastFrost,
    daysUntilFirstFrost,
    growingSeasonDays,
    isGrowingSeason,
    frostRisk,
  };
}

function buildTodaySummary(
  planting: PlantingGuidance,
  frost: FrostInfo,
  moonPhaseName: string,
  month: number
): string {
  const signQuality = planting.fertility === "fertile"
    ? `Moon in ${planting.moonSign} — one of the best planting signs.`
    : planting.fertility === "semi-fertile"
    ? `Moon in ${planting.moonSign} — decent for select planting.`
    : `Moon in ${planting.moonSign} — a barren sign. Focus on maintenance, not planting.`;

  const isWaning = moonPhaseName.toLowerCase().includes("waning") || moonPhaseName.toLowerCase().includes("last") || moonPhaseName.toLowerCase().includes("third");
  const phaseNote = isWaning
    ? "The waning moon favors root crops and cleanup."
    : "The waxing moon favors above-ground growth.";

  if (!frost.isGrowingSeason && frost.frostRisk === "high") {
    return `${signQuality} ${phaseNote} Frost season — protect tender plants and focus on indoor starts.`;
  }

  if (frost.daysUntilFirstFrost !== null && frost.daysUntilFirstFrost < 21) {
    return `${signQuality} ${phaseNote} First frost approaching in ~${frost.daysUntilFirstFrost} days — harvest what you can.`;
  }

  return `${signQuality} ${phaseNote}`;
}

// ============================================================================
// Planting Calendar — detailed 7-day planting guidance
// ============================================================================

// --------------------------------------------------------------------------
// Interfaces
// --------------------------------------------------------------------------

export interface CropCategory {
  name: string;
  icon: string;
  examples: string;
  bestDays: DayRating[];
  seasonalNote?: string;
}

export interface DayRating {
  dayNum: number;
  rating: "best" | "good" | "ok" | "poor" | "skip";
}

export interface MoonQuarter {
  quarter: 1 | 2 | 3 | 4;
  label: string;
  cropType: string;
  description: string;
  examples: string;
  isCurrent: boolean;
}

export interface PlantNowList {
  directSow: string[];
  transplant: string[];
  startIndoors: string[];
}

export interface GardenWisdom {
  saying: string;
  attribution: string;
}

export interface PlantingCalendarData {
  zone: string;
  region: string;
  subregion: string;
  lastFrost: string;
  firstFrost: string;
  todayVerdict: {
    crop: string;
    score: number;
    moonSign: string;
    moonElement: string;
    bestFor: string;
    vocNote?: string;
  };
  quarters: MoonQuarter[];
  cropCategories: CropCategory[];
  plantNow: PlantNowList;
  wisdom: GardenWisdom;
}

// --------------------------------------------------------------------------
// Moon sign sequence for day-by-day approximation
// --------------------------------------------------------------------------

const ZODIAC_ORDER = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
];

function getSignForDayOffset(currentSign: string, daysFromNow: number): string {
  const idx = ZODIAC_ORDER.indexOf(currentSign);
  if (idx === -1) return currentSign;
  // Moon spends ~2.5 days per sign
  const signShift = Math.floor(daysFromNow / 2.5);
  return ZODIAC_ORDER[(idx + signShift) % 12];
}

// --------------------------------------------------------------------------
// Fertility & crop affinity helpers
// --------------------------------------------------------------------------

type FertilityLevel = "fertile" | "semi-fertile" | "barren";

function getSignFertility(sign: string): FertilityLevel {
  const data = MOON_SIGN_PLANTING[sign];
  if (!data) return "barren";
  return data.fertility;
}

function getSignElement(sign: string): string {
  const data = MOON_SIGN_PLANTING[sign];
  if (!data) return "fire";
  return data.element;
}

function fertilityToBaseScore(f: FertilityLevel): number {
  switch (f) {
    case "fertile": return 8.5;
    case "semi-fertile": return 6;
    case "barren": return 3;
  }
}

function computeCropRating(
  sign: string,
  cropType: "fruiting" | "root" | "leafy" | "harvest",
  isWaxing: boolean
): "best" | "good" | "ok" | "poor" | "skip" {
  const fertility = getSignFertility(sign);
  const element = getSignElement(sign);

  if (cropType === "harvest") {
    // Barren signs are best for harvesting
    if (fertility === "barren") return "best";
    if (fertility === "semi-fertile") return "good";
    return "ok";
  }

  if (cropType === "fruiting") {
    if (fertility === "fertile" && isWaxing) return "best";
    if (fertility === "fertile") return "good";
    if (fertility === "semi-fertile" && isWaxing) return "good";
    if (fertility === "semi-fertile") return "ok";
    return "poor";
  }

  if (cropType === "root") {
    if ((element === "earth" || fertility === "fertile") && !isWaxing) return "best";
    if (element === "earth" || fertility === "fertile") return "good";
    if (fertility === "semi-fertile") return "ok";
    return "poor";
  }

  // leafy
  if ((element === "water" || fertility === "fertile") && isWaxing) return "best";
  if (fertility === "fertile") return "good";
  if (fertility === "semi-fertile" && isWaxing) return "good";
  if (fertility === "semi-fertile") return "ok";
  return "poor";
}

// --------------------------------------------------------------------------
// Moon phase → quarter determination
// --------------------------------------------------------------------------

function phaseToQuarter(moonPhaseName: string): 1 | 2 | 3 | 4 {
  const p = moonPhaseName.toLowerCase();
  if (p.includes("new") || p.includes("waxing crescent")) return 1;
  if (p.includes("first quarter") || p.includes("first-quarter") || p.includes("waxing gibbous")) return 2;
  if (p.includes("full") || p.includes("waning gibbous")) return 3;
  if (p.includes("third quarter") || p.includes("third-quarter") || p.includes("last quarter") || p.includes("last-quarter") || p.includes("waning crescent")) return 4;
  // Fallback heuristics
  if (p.includes("waxing")) return 2;
  if (p.includes("waning")) return 4;
  return 1;
}

function isWaxingPhase(moonPhaseName: string): boolean {
  const q = phaseToQuarter(moonPhaseName);
  return q === 1 || q === 2;
}

// --------------------------------------------------------------------------
// USDA Zone Data — frost dates and monthly planting lists per zone
// --------------------------------------------------------------------------

export interface ZoneInfo {
  zone: string;
  label: string;
  lastFrost: string;
  firstFrost: string;
  plantNow: Record<number, PlantNowList>;
}

// Each major zone has a and b subzones. "a" is the colder half, "b" is warmer.
// Frost dates shift ~1 week between a/b subzones.
export const USDA_ZONES: ZoneInfo[] = [
  { zone: "3a", label: "Zone 3a — Northern Plains, Mountain", lastFrost: "May 20", firstFrost: "Sep 10",
    plantNow: { 0:{directSow:[],transplant:[],startIndoors:["onions","leeks","celery"]},1:{directSow:[],transplant:[],startIndoors:["peppers","eggplant","herbs"]},2:{directSow:[],transplant:[],startIndoors:["tomatoes","broccoli","cabbage"]},3:{directSow:["peas","spinach","radishes"],transplant:["onion sets"],startIndoors:["squash","cucumbers","melons"]},4:{directSow:["lettuce","carrots","beets","beans","potatoes"],transplant:["broccoli","cabbage","kale"],startIndoors:["pumpkins"]},5:{directSow:["corn","squash","cucumbers","beans"],transplant:["tomatoes","peppers","herbs"],startIndoors:[]},6:{directSow:["succession lettuce","beans"],transplant:["fall broccoli"],startIndoors:["kale","cabbage for fall"]},7:{directSow:["lettuce","spinach","radishes","peas"],transplant:["kale","cabbage"],startIndoors:[]},8:{directSow:["garlic","cover crops"],transplant:["strawberries"],startIndoors:[]},9:{directSow:["garlic","cover crops (winter rye)"],transplant:[],startIndoors:[]},10:{directSow:["cover crops"],transplant:[],startIndoors:[]},11:{directSow:[],transplant:[],startIndoors:["onions","leeks"]} } },
  { zone: "3b", label: "Zone 3b — Northern Plains, Mountain", lastFrost: "May 15", firstFrost: "Sep 15",
    plantNow: { 0:{directSow:[],transplant:[],startIndoors:["onions","leeks","celery"]},1:{directSow:[],transplant:[],startIndoors:["peppers","eggplant","herbs"]},2:{directSow:[],transplant:[],startIndoors:["tomatoes","broccoli","cabbage"]},3:{directSow:["peas","spinach","radishes"],transplant:["onion sets"],startIndoors:["squash","cucumbers","melons"]},4:{directSow:["lettuce","carrots","beets","beans","potatoes"],transplant:["broccoli","cabbage","kale"],startIndoors:["pumpkins"]},5:{directSow:["corn","squash","cucumbers","beans"],transplant:["tomatoes","peppers","herbs"],startIndoors:[]},6:{directSow:["succession lettuce","beans"],transplant:["fall broccoli"],startIndoors:["kale","cabbage for fall"]},7:{directSow:["lettuce","spinach","radishes","peas"],transplant:["kale","cabbage"],startIndoors:[]},8:{directSow:["garlic","cover crops"],transplant:["strawberries"],startIndoors:[]},9:{directSow:["garlic","cover crops (winter rye)"],transplant:[],startIndoors:[]},10:{directSow:["cover crops"],transplant:[],startIndoors:[]},11:{directSow:[],transplant:[],startIndoors:["onions","leeks"]} } },
  { zone: "4a", label: "Zone 4a — Upper Midwest, Northeast Mountains", lastFrost: "May 15", firstFrost: "Sep 20",
    plantNow: { 0:{directSow:[],transplant:[],startIndoors:["onions","leeks","celery"]},1:{directSow:[],transplant:[],startIndoors:["peppers","eggplant"]},2:{directSow:[],transplant:[],startIndoors:["tomatoes","broccoli","cabbage","herbs"]},3:{directSow:["peas","spinach","radishes","lettuce"],transplant:["onion sets"],startIndoors:["squash","cucumbers"]},4:{directSow:["carrots","beets","beans","potatoes","corn"],transplant:["broccoli","cabbage","tomatoes (late)"],startIndoors:["pumpkins","melons"]},5:{directSow:["squash","cucumbers","beans","melons"],transplant:["tomatoes","peppers","herbs"],startIndoors:[]},6:{directSow:["succession lettuce","beans"],transplant:["fall broccoli"],startIndoors:["kale","cabbage for fall"]},7:{directSow:["lettuce","spinach","peas","radishes"],transplant:["kale","cabbage"],startIndoors:[]},8:{directSow:["garlic","spinach","cover crops"],transplant:["strawberries"],startIndoors:[]},9:{directSow:["garlic","cover crops"],transplant:[],startIndoors:[]},10:{directSow:["cover crops"],transplant:[],startIndoors:[]},11:{directSow:[],transplant:[],startIndoors:["onions","leeks"]} } },
  { zone: "4b", label: "Zone 4b — Upper Midwest, Northeast Mountains", lastFrost: "May 10", firstFrost: "Sep 25",
    plantNow: { 0:{directSow:[],transplant:[],startIndoors:["onions","leeks","celery"]},1:{directSow:[],transplant:[],startIndoors:["peppers","eggplant"]},2:{directSow:[],transplant:[],startIndoors:["tomatoes","broccoli","cabbage","herbs"]},3:{directSow:["peas","spinach","radishes","lettuce"],transplant:["onion sets"],startIndoors:["squash","cucumbers"]},4:{directSow:["carrots","beets","beans","potatoes","corn"],transplant:["broccoli","cabbage","tomatoes (late)"],startIndoors:["pumpkins","melons"]},5:{directSow:["squash","cucumbers","beans","melons"],transplant:["tomatoes","peppers","herbs"],startIndoors:[]},6:{directSow:["succession lettuce","beans"],transplant:["fall broccoli"],startIndoors:["kale","cabbage for fall"]},7:{directSow:["lettuce","spinach","peas","radishes"],transplant:["kale","cabbage"],startIndoors:[]},8:{directSow:["garlic","spinach","cover crops"],transplant:["strawberries"],startIndoors:[]},9:{directSow:["garlic","cover crops"],transplant:[],startIndoors:[]},10:{directSow:["cover crops"],transplant:[],startIndoors:[]},11:{directSow:[],transplant:[],startIndoors:["onions","leeks"]} } },
  { zone: "5a", label: "Zone 5a — Midwest, Mid-Atlantic", lastFrost: "Apr 30", firstFrost: "Oct 5",
    plantNow: { 0:{directSow:[],transplant:[],startIndoors:["onions","leeks"]},1:{directSow:[],transplant:[],startIndoors:["peppers","eggplant","celery"]},2:{directSow:[],transplant:[],startIndoors:["tomatoes","broccoli","cabbage"]},3:{directSow:["peas","spinach","radishes","lettuce","carrots"],transplant:["onion sets","potatoes"],startIndoors:["squash","cucumbers","melons"]},4:{directSow:["beans","beets","corn","squash"],transplant:["tomatoes","peppers","broccoli","herbs"],startIndoors:["pumpkins"]},5:{directSow:["cucumbers","melons","okra","beans"],transplant:["eggplant","peppers"],startIndoors:["fall broccoli"]},6:{directSow:["succession beans","summer squash"],transplant:[],startIndoors:["kale","cabbage for fall"]},7:{directSow:["lettuce","spinach","peas","radishes","beans"],transplant:["broccoli","kale"],startIndoors:[]},8:{directSow:["lettuce","spinach","garlic","radishes","turnips"],transplant:["cabbage","kale"],startIndoors:[]},9:{directSow:["garlic","cover crops","spinach"],transplant:["strawberries"],startIndoors:[]},10:{directSow:["garlic","cover crops"],transplant:["fruit trees"],startIndoors:[]},11:{directSow:["cover crops"],transplant:[],startIndoors:["onions"]} } },
  { zone: "5b", label: "Zone 5b — Midwest, Mid-Atlantic", lastFrost: "Apr 25", firstFrost: "Oct 10",
    plantNow: { 0:{directSow:[],transplant:[],startIndoors:["onions","leeks"]},1:{directSow:[],transplant:[],startIndoors:["peppers","eggplant","celery"]},2:{directSow:[],transplant:[],startIndoors:["tomatoes","broccoli","cabbage"]},3:{directSow:["peas","spinach","radishes","lettuce","carrots"],transplant:["onion sets","potatoes"],startIndoors:["squash","cucumbers","melons"]},4:{directSow:["beans","beets","corn","squash"],transplant:["tomatoes","peppers","broccoli","herbs"],startIndoors:["pumpkins"]},5:{directSow:["cucumbers","melons","okra","beans"],transplant:["eggplant","peppers"],startIndoors:["fall broccoli"]},6:{directSow:["succession beans","summer squash"],transplant:[],startIndoors:["kale","cabbage for fall"]},7:{directSow:["lettuce","spinach","peas","radishes","beans"],transplant:["broccoli","kale"],startIndoors:[]},8:{directSow:["lettuce","spinach","garlic","radishes","turnips"],transplant:["cabbage","kale"],startIndoors:[]},9:{directSow:["garlic","cover crops","spinach"],transplant:["strawberries"],startIndoors:[]},10:{directSow:["garlic","cover crops"],transplant:["fruit trees"],startIndoors:[]},11:{directSow:["cover crops"],transplant:[],startIndoors:["onions"]} } },
  { zone: "6a", label: "Zone 6a — Mid-South, Central", lastFrost: "Apr 20", firstFrost: "Oct 15",
    plantNow: { 0:{directSow:[],transplant:[],startIndoors:["onions","leeks","celery"]},1:{directSow:["peas (late month)"],transplant:[],startIndoors:["tomatoes","peppers","eggplant"]},2:{directSow:["peas","spinach","radishes","lettuce"],transplant:["onion sets"],startIndoors:["squash","cucumbers"]},3:{directSow:["carrots","beets","potatoes","Swiss chard"],transplant:["broccoli","cabbage","kale"],startIndoors:["melons","pumpkins"]},4:{directSow:["beans","corn","squash","cucumbers"],transplant:["tomatoes","peppers","herbs"],startIndoors:[]},5:{directSow:["okra","melons","Southern peas"],transplant:["eggplant","sweet potato slips"],startIndoors:["fall broccoli"]},6:{directSow:["succession beans","cucumbers"],transplant:["fall tomatoes (late)"],startIndoors:["kale","cabbage","broccoli for fall"]},7:{directSow:["beans","lettuce","peas","radishes"],transplant:["broccoli","kale","cabbage"],startIndoors:[]},8:{directSow:["lettuce","spinach","radishes","turnips","garlic"],transplant:["kale","Swiss chard"],startIndoors:[]},9:{directSow:["garlic","spinach","lettuce","cover crops"],transplant:["strawberries"],startIndoors:[]},10:{directSow:["garlic","cover crops","spinach (under cover)"],transplant:["fruit trees","roses"],startIndoors:[]},11:{directSow:["cover crops"],transplant:["bare-root trees"],startIndoors:["onions"]} } },
  { zone: "6b", label: "Zone 6b — Mid-South, Central", lastFrost: "Apr 15", firstFrost: "Oct 20",
    plantNow: { 0:{directSow:[],transplant:[],startIndoors:["onions","leeks","celery"]},1:{directSow:["peas (late month)"],transplant:[],startIndoors:["tomatoes","peppers","eggplant"]},2:{directSow:["peas","spinach","radishes","lettuce"],transplant:["onion sets"],startIndoors:["squash","cucumbers"]},3:{directSow:["carrots","beets","potatoes","Swiss chard"],transplant:["broccoli","cabbage","kale"],startIndoors:["melons","pumpkins"]},4:{directSow:["beans","corn","squash","cucumbers"],transplant:["tomatoes","peppers","herbs"],startIndoors:[]},5:{directSow:["okra","melons","Southern peas"],transplant:["eggplant","sweet potato slips"],startIndoors:["fall broccoli"]},6:{directSow:["succession beans","cucumbers"],transplant:["fall tomatoes (late)"],startIndoors:["kale","cabbage","broccoli for fall"]},7:{directSow:["beans","lettuce","peas","radishes"],transplant:["broccoli","kale","cabbage"],startIndoors:[]},8:{directSow:["lettuce","spinach","radishes","turnips","garlic"],transplant:["kale","Swiss chard"],startIndoors:[]},9:{directSow:["garlic","spinach","lettuce","cover crops"],transplant:["strawberries"],startIndoors:[]},10:{directSow:["garlic","cover crops","spinach (under cover)"],transplant:["fruit trees","roses"],startIndoors:[]},11:{directSow:["cover crops"],transplant:["bare-root trees"],startIndoors:["onions"]} } },
  { zone: "7a", label: "Zone 7a — Upper South, Pacific NW", lastFrost: "Apr 5", firstFrost: "Oct 28",
    plantNow: { 0:{directSow:["spinach","peas (late)"],transplant:[],startIndoors:["onions","peppers","eggplant"]},1:{directSow:["peas","lettuce","radishes","spinach"],transplant:["onion sets"],startIndoors:["tomatoes","peppers","herbs"]},2:{directSow:["carrots","beets","Swiss chard","potatoes"],transplant:["broccoli","cabbage","kale"],startIndoors:["squash","cucumbers","melons"]},3:{directSow:["beans","corn","squash","cucumbers"],transplant:["tomatoes","peppers","herbs"],startIndoors:["pumpkins"]},4:{directSow:["okra","melons","Southern peas","sweet potatoes"],transplant:["eggplant","basil"],startIndoors:["fall tomatoes (late)"]},5:{directSow:["Southern peas","okra","yard-long beans"],transplant:["sweet potato slips"],startIndoors:["broccoli","cabbage for fall"]},6:{directSow:["Southern peas","cucumbers (quick)"],transplant:["fall tomatoes"],startIndoors:["kale","Brussels sprouts for fall"]},7:{directSow:["beans","squash (quick)","lettuce","radishes"],transplant:["broccoli","kale","cabbage"],startIndoors:["spinach","cool-season greens"]},8:{directSow:["lettuce","spinach","radishes","turnips","garlic"],transplant:["broccoli","cabbage","kale"],startIndoors:[]},9:{directSow:["lettuce","spinach","peas","radishes","carrots"],transplant:["garlic","strawberries"],startIndoors:[]},10:{directSow:["spinach","lettuce","garlic","cover crops"],transplant:["fruit trees","roses"],startIndoors:["microgreens"]},11:{directSow:["cover crops"],transplant:["bare-root trees"],startIndoors:["early tomatoes (late month)","onions"]} } },
  { zone: "7b", label: "Zone 7b — Upper South, Pacific NW", lastFrost: "Apr 1", firstFrost: "Nov 1",
    plantNow: { 0:{directSow:["spinach","peas (late)"],transplant:[],startIndoors:["onions","peppers","eggplant"]},1:{directSow:["peas","lettuce","radishes","spinach"],transplant:["onion sets"],startIndoors:["tomatoes","peppers","herbs"]},2:{directSow:["carrots","beets","Swiss chard","potatoes"],transplant:["broccoli","cabbage","kale"],startIndoors:["squash","cucumbers","melons"]},3:{directSow:["beans","corn","squash","cucumbers"],transplant:["tomatoes","peppers","herbs"],startIndoors:["pumpkins"]},4:{directSow:["okra","melons","Southern peas","sweet potatoes"],transplant:["eggplant","basil"],startIndoors:["fall tomatoes (late)"]},5:{directSow:["Southern peas","okra","yard-long beans"],transplant:["sweet potato slips"],startIndoors:["broccoli","cabbage for fall"]},6:{directSow:["Southern peas","cucumbers (quick)"],transplant:["fall tomatoes"],startIndoors:["kale","Brussels sprouts for fall"]},7:{directSow:["beans","squash (quick)","lettuce","radishes"],transplant:["broccoli","kale","cabbage"],startIndoors:["spinach","cool-season greens"]},8:{directSow:["lettuce","spinach","radishes","turnips","garlic"],transplant:["broccoli","cabbage","kale"],startIndoors:[]},9:{directSow:["lettuce","spinach","peas","radishes","carrots"],transplant:["garlic","strawberries"],startIndoors:[]},10:{directSow:["spinach","lettuce","garlic","cover crops"],transplant:["fruit trees","roses"],startIndoors:["microgreens"]},11:{directSow:["cover crops"],transplant:["bare-root trees"],startIndoors:["early tomatoes (late month)","onions"]} } },
  { zone: "8a", label: "Zone 8a — South, Coastal", lastFrost: "Mar 25", firstFrost: "Nov 10",
    plantNow: { 0:{directSow:["spinach","peas","radishes","lettuce"],transplant:["onion sets","bare-root fruit trees"],startIndoors:["tomatoes","peppers","eggplant"]},1:{directSow:["peas","lettuce","carrots","beets","Swiss chard"],transplant:["broccoli","cabbage","kale","onion transplants"],startIndoors:["tomatoes","peppers","eggplant","herbs"]},2:{directSow:["beans","squash","cucumbers","corn","melons"],transplant:["tomatoes","peppers","herbs","flowers"],startIndoors:["pumpkins","gourds","okra"]},3:{directSow:["okra","Southern peas","sweet potatoes","watermelon"],transplant:["peppers","eggplant","basil"],startIndoors:["fall tomato seeds (late month)"]},4:{directSow:["Southern peas","okra","sweet potato slips","yard-long beans"],transplant:["sweet potato slips","heat-loving herbs"],startIndoors:["pumpkins for fall","fall tomatoes"]},5:{directSow:["Southern peas","okra"],transplant:["fall tomato starts (late month)"],startIndoors:["broccoli","cauliflower","cabbage for fall"]},6:{directSow:["Southern peas","pumpkins"],transplant:["fall tomatoes","peppers"],startIndoors:["broccoli","kale","Brussels sprouts for fall"]},7:{directSow:["beans","squash (late)","cucumbers (quick)"],transplant:["tomatoes","peppers","broccoli","kale"],startIndoors:["lettuce","spinach","cool-season greens"]},8:{directSow:["lettuce","spinach","radishes","turnips","garlic"],transplant:["broccoli","cabbage","kale","Swiss chard"],startIndoors:["onions for spring"]},9:{directSow:["lettuce","spinach","peas","radishes","carrots"],transplant:["garlic","onion sets","strawberries"],startIndoors:["herbs for windowsill"]},10:{directSow:["spinach","lettuce (under cover)","garlic"],transplant:["fruit trees","roses (bare-root)"],startIndoors:["microgreens","sprouts"]},11:{directSow:["cover crops (crimson clover, rye)"],transplant:["bare-root trees and shrubs"],startIndoors:["early tomatoes (late month)","onions"]} } },
  { zone: "8b", label: "Zone 8b — South, Coastal", lastFrost: "Mar 1", firstFrost: "Nov 28",
    plantNow: { 0:{directSow:["spinach","peas","radishes","lettuce"],transplant:["onion sets","bare-root fruit trees"],startIndoors:["tomatoes","peppers","eggplant"]},1:{directSow:["peas","lettuce","carrots","beets","Swiss chard"],transplant:["broccoli","cabbage","kale","onion transplants"],startIndoors:["tomatoes","peppers","eggplant","herbs"]},2:{directSow:["beans","squash","cucumbers","corn","melons"],transplant:["tomatoes","peppers","herbs","flowers"],startIndoors:["pumpkins","gourds","okra"]},3:{directSow:["okra","Southern peas","sweet potatoes","watermelon"],transplant:["peppers","eggplant","basil"],startIndoors:["fall tomato seeds (late month)"]},4:{directSow:["Southern peas","okra","sweet potato slips","yard-long beans"],transplant:["sweet potato slips","heat-loving herbs"],startIndoors:["pumpkins for fall","fall tomatoes"]},5:{directSow:["Southern peas","okra"],transplant:["fall tomato starts (late month)"],startIndoors:["broccoli","cauliflower","cabbage for fall"]},6:{directSow:["Southern peas","pumpkins"],transplant:["fall tomatoes","peppers"],startIndoors:["broccoli","kale","Brussels sprouts for fall"]},7:{directSow:["beans","squash (late)","cucumbers (quick)"],transplant:["tomatoes","peppers","broccoli","kale"],startIndoors:["lettuce","spinach","cool-season greens"]},8:{directSow:["lettuce","spinach","radishes","turnips","garlic"],transplant:["broccoli","cabbage","kale","Swiss chard"],startIndoors:["onions for spring"]},9:{directSow:["lettuce","spinach","peas","radishes","carrots"],transplant:["garlic","onion sets","strawberries"],startIndoors:["herbs for windowsill"]},10:{directSow:["spinach","lettuce (under cover)","garlic"],transplant:["fruit trees","roses (bare-root)"],startIndoors:["microgreens","sprouts"]},11:{directSow:["cover crops (crimson clover, rye)"],transplant:["bare-root trees and shrubs"],startIndoors:["early tomatoes (late month)","onions"]} } },
  { zone: "9a", label: "Zone 9a — Deep South, Desert SW", lastFrost: "Feb 25", firstFrost: "Nov 25",
    plantNow: { 0:{directSow:["peas","lettuce","radishes","carrots","beets"],transplant:["broccoli","cabbage","kale","onions"],startIndoors:["tomatoes","peppers"]},1:{directSow:["potatoes","beans","Swiss chard","spinach"],transplant:["tomatoes (late)","herbs"],startIndoors:["eggplant","melons"]},2:{directSow:["beans","corn","squash","cucumbers","okra"],transplant:["tomatoes","peppers","herbs"],startIndoors:["pumpkins"]},3:{directSow:["melons","Southern peas","sweet potatoes","okra"],transplant:["eggplant","basil"],startIndoors:[]},4:{directSow:["Southern peas","okra","yard-long beans"],transplant:["sweet potato slips"],startIndoors:["fall tomatoes"]},5:{directSow:["Southern peas","okra"],transplant:[],startIndoors:["broccoli","cabbage","kale for fall"]},6:{directSow:["Southern peas"],transplant:["fall tomatoes (late)"],startIndoors:["broccoli","kale","Brussels sprouts"]},7:{directSow:["beans","cucumbers (quick)"],transplant:["fall tomatoes","peppers","broccoli"],startIndoors:["lettuce","spinach"]},8:{directSow:["lettuce","radishes","turnips","beets","carrots"],transplant:["broccoli","kale","cabbage","Swiss chard"],startIndoors:["onions"]},9:{directSow:["lettuce","spinach","peas","radishes","garlic"],transplant:["strawberries","herbs"],startIndoors:[]},10:{directSow:["peas","spinach","lettuce","radishes","garlic"],transplant:["onion sets","fruit trees"],startIndoors:["tomatoes (late month)"]},11:{directSow:["peas","lettuce","radishes","carrots"],transplant:["broccoli","cabbage","bare-root trees"],startIndoors:["tomatoes","peppers"]} } },
  { zone: "9b", label: "Zone 9b — Deep South, Desert SW", lastFrost: "Feb 15", firstFrost: "Dec 1",
    plantNow: { 0:{directSow:["peas","lettuce","radishes","carrots","beets"],transplant:["broccoli","cabbage","kale","onions"],startIndoors:["tomatoes","peppers"]},1:{directSow:["potatoes","beans","Swiss chard","spinach"],transplant:["tomatoes (late)","herbs"],startIndoors:["eggplant","melons"]},2:{directSow:["beans","corn","squash","cucumbers","okra"],transplant:["tomatoes","peppers","herbs"],startIndoors:["pumpkins"]},3:{directSow:["melons","Southern peas","sweet potatoes","okra"],transplant:["eggplant","basil"],startIndoors:[]},4:{directSow:["Southern peas","okra","yard-long beans"],transplant:["sweet potato slips"],startIndoors:["fall tomatoes"]},5:{directSow:["Southern peas","okra"],transplant:[],startIndoors:["broccoli","cabbage","kale for fall"]},6:{directSow:["Southern peas"],transplant:["fall tomatoes (late)"],startIndoors:["broccoli","kale","Brussels sprouts"]},7:{directSow:["beans","cucumbers (quick)"],transplant:["fall tomatoes","peppers","broccoli"],startIndoors:["lettuce","spinach"]},8:{directSow:["lettuce","radishes","turnips","beets","carrots"],transplant:["broccoli","kale","cabbage","Swiss chard"],startIndoors:["onions"]},9:{directSow:["lettuce","spinach","peas","radishes","garlic"],transplant:["strawberries","herbs"],startIndoors:[]},10:{directSow:["peas","spinach","lettuce","radishes","garlic"],transplant:["onion sets","fruit trees"],startIndoors:["tomatoes (late month)"]},11:{directSow:["peas","lettuce","radishes","carrots"],transplant:["broccoli","cabbage","bare-root trees"],startIndoors:["tomatoes","peppers"]} } },
  { zone: "10a", label: "Zone 10a — South FL, Southern CA, Hawaii", lastFrost: "Feb 5", firstFrost: "Dec 10",
    plantNow: { 0:{directSow:["peas","lettuce","radishes","carrots","beets","beans"],transplant:["tomatoes","peppers","herbs"],startIndoors:[]},1:{directSow:["beans","corn","cucumbers","squash"],transplant:["tomatoes","peppers","eggplant"],startIndoors:[]},2:{directSow:["melons","okra","Southern peas","sweet potatoes"],transplant:["herbs","flowers"],startIndoors:[]},3:{directSow:["Southern peas","okra","yard-long beans","sweet potatoes"],transplant:["tropical herbs"],startIndoors:[]},4:{directSow:["Southern peas","okra"],transplant:[],startIndoors:[]},5:{directSow:["Southern peas"],transplant:[],startIndoors:["fall tomatoes","peppers"]},6:{directSow:["Southern peas"],transplant:[],startIndoors:["fall tomatoes","peppers"]},7:{directSow:["beans (late)","cucumbers"],transplant:["tomatoes","peppers"],startIndoors:["broccoli","kale"]},8:{directSow:["beans","lettuce","radishes","carrots","beets"],transplant:["tomatoes","peppers","herbs","broccoli"],startIndoors:[]},9:{directSow:["lettuce","spinach","peas","radishes","carrots"],transplant:["herbs","strawberries"],startIndoors:[]},10:{directSow:["peas","lettuce","radishes","carrots","beets"],transplant:["onions","herbs","fruit trees"],startIndoors:[]},11:{directSow:["peas","lettuce","radishes","carrots","beans"],transplant:["tomatoes","herbs","bare-root trees"],startIndoors:[]} } },
  { zone: "10b", label: "Zone 10b — South FL, Southern CA, Hawaii", lastFrost: "Jan 31", firstFrost: "Dec 15",
    plantNow: { 0:{directSow:["peas","lettuce","radishes","carrots","beets","beans"],transplant:["tomatoes","peppers","herbs"],startIndoors:[]},1:{directSow:["beans","corn","cucumbers","squash"],transplant:["tomatoes","peppers","eggplant"],startIndoors:[]},2:{directSow:["melons","okra","Southern peas","sweet potatoes"],transplant:["herbs","flowers"],startIndoors:[]},3:{directSow:["Southern peas","okra","yard-long beans","sweet potatoes"],transplant:["tropical herbs"],startIndoors:[]},4:{directSow:["Southern peas","okra"],transplant:[],startIndoors:[]},5:{directSow:["Southern peas"],transplant:[],startIndoors:["fall tomatoes","peppers"]},6:{directSow:["Southern peas"],transplant:[],startIndoors:["fall tomatoes","peppers"]},7:{directSow:["beans (late)","cucumbers"],transplant:["tomatoes","peppers"],startIndoors:["broccoli","kale"]},8:{directSow:["beans","lettuce","radishes","carrots","beets"],transplant:["tomatoes","peppers","herbs","broccoli"],startIndoors:[]},9:{directSow:["lettuce","spinach","peas","radishes","carrots"],transplant:["herbs","strawberries"],startIndoors:[]},10:{directSow:["peas","lettuce","radishes","carrots","beets"],transplant:["onions","herbs","fruit trees"],startIndoors:[]},11:{directSow:["peas","lettuce","radishes","carrots","beans"],transplant:["tomatoes","herbs","bare-root trees"],startIndoors:[]} } },
];

// --------------------------------------------------------------------------
// Garden Wisdom / Folklore
// --------------------------------------------------------------------------

const GARDEN_WISDOM: GardenWisdom[] = [
  { saying: "Plant corn when oak leaves are as big as a squirrel's ear.", attribution: "Appalachian farmers' proverb" },
  { saying: "One year's seeding means seven years' weeding.", attribution: "Old English proverb" },
  { saying: "When the dogwood blooms, plant your corn.", attribution: "Southern farming tradition" },
  { saying: "Sow dry, set wet.", attribution: "English cottage garden wisdom" },
  { saying: "If March comes in like a lion, it goes out like a lamb.", attribution: "Traditional weather lore" },
  { saying: "Make hay while the sun shines.", attribution: "English proverb, c. 1546" },
  { saying: "Plant peas on Washington's Birthday.", attribution: "Mid-Atlantic tradition" },
  { saying: "The best fertilizer is the gardener's shadow.", attribution: "Chinese proverb" },
  { saying: "A society grows great when old men plant trees whose shade they shall never sit in.", attribution: "Greek proverb" },
  { saying: "If you want to be happy for a lifetime, plant a garden.", attribution: "Chinese proverb" },
  { saying: "Don't judge each day by the harvest you reap but by the seeds that you plant.", attribution: "Robert Louis Stevenson" },
  { saying: "When the lilac leafs out, plant hardy greens; when it blooms, plant your beans.", attribution: "Phenology folk wisdom" },
  { saying: "Knee-high by Fourth of July.", attribution: "Corn growers' benchmark" },
  { saying: "Plant potatoes when you can turn the soil without it sticking to the shovel.", attribution: "Irish wisdom" },
  { saying: "The soil is the great connector of our lives.", attribution: "Wendell Berry" },
  { saying: "First plant four rows of peas: Preparedness, Promptness, Perseverance, Politeness.", attribution: "Garden humor, 19th century" },
  { saying: "To plant a garden is to believe in tomorrow.", attribution: "Audrey Hepburn" },
  { saying: "What is a weed? A plant whose virtues have not yet been discovered.", attribution: "Ralph Waldo Emerson" },
  { saying: "Gardening adds years to your life and life to your years.", attribution: "Anonymous" },
  { saying: "An old moon in a mist is worth gold in a kist.", attribution: "Scottish weather proverb" },
];

// --------------------------------------------------------------------------
// Main Export: getPlantingCalendar
// --------------------------------------------------------------------------

/**
 * @param southernHemisphere Set true for users below the equator (lat < 0).
 * Shifts month-keyed planting lists and frost dates by six months.
 */
export function getPlantingCalendar(
  date: Date,
  moonSign: string,
  moonPhaseName: string,
  vocEnd?: string,
  userZone?: string,
  southernHemisphere?: boolean,
): PlantingCalendarData {
  const month = seasonalMonth(date.getMonth(), southernHemisphere);
  const dayOfYear = getDayOfYear(date);
  const waxing = isWaxingPhase(moonPhaseName);
  const currentQuarter = phaseToQuarter(moonPhaseName);

  // --- Zone info — resolve from user selection (defaults to Zone 8b only
  // when no zone is provided) ---
  const zoneData = resolveZone(userZone);
  const zone = zoneData.zone;
  const region = zoneData.label.split(" — ")[1] || "";
  const subregion = "";
  // Frost date strings — shifted by half a year for the southern hemisphere,
  // derived from the shifted day-of-years so the printed dates stay correct.
  const lastFrost = southernHemisphere
    ? dayOfYearToFrostDate(shiftDoyForSouth(frostDateToDayOfYear(zoneData.lastFrost)))
    : zoneData.lastFrost;
  const firstFrost = southernHemisphere
    ? dayOfYearToFrostDate(shiftDoyForSouth(frostDateToDayOfYear(zoneData.firstFrost)))
    : zoneData.firstFrost;

  // --- Today's verdict ---
  const fertility = getSignFertility(moonSign);
  const element = getSignElement(moonSign);
  let baseScore = fertilityToBaseScore(fertility);
  // Moon phase modifier
  if (waxing) baseScore += 0.5; // above-ground boost
  else baseScore += 0.3; // root crop boost (slightly less)
  // Cap at 9.5
  baseScore = Math.min(9.5, baseScore);

  // Determine best crop type for today's combination
  let bestCrop = "Maintenance & weeding";
  let bestFor = "Weeding, cultivating, pest control";
  if (fertility === "fertile") {
    if (waxing) {
      bestCrop = "Fruiting crops";
      bestFor = "Tomatoes, peppers, squash, beans, cucumbers";
    } else {
      bestCrop = "Root crops & transplanting";
      bestFor = "Carrots, potatoes, beets, transplanting perennials";
    }
  } else if (fertility === "semi-fertile") {
    if (element === "earth") {
      bestCrop = "Root vegetables & bulbs";
      bestFor = "Potatoes, carrots, beets, onions, turnips";
    } else {
      bestCrop = "Flowers & vines";
      bestFor = "Ornamental flowers, grapes, clematis, root vegetables";
    }
  } else {
    bestCrop = "Harvest & maintain";
    bestFor = "Harvest for storage, weed, cultivate, prune, turn compost";
  }

  const todayVerdict: PlantingCalendarData["todayVerdict"] = {
    crop: bestCrop,
    score: Math.round(baseScore * 10) / 10,
    moonSign,
    moonElement: element,
    bestFor,
    vocNote: vocEnd ? `Moon void-of-course until ${vocEnd} — avoid starting new plantings` : undefined,
  };

  // --- Four Quarters ---
  const quarters: MoonQuarter[] = [
    {
      quarter: 1,
      label: "New to First Quarter",
      cropType: "Leafy greens",
      description: "Sap rises, leaf growth stimulated",
      examples: "Lettuce, spinach, cabbage, celery",
      isCurrent: currentQuarter === 1,
    },
    {
      quarter: 2,
      label: "First Quarter to Full",
      cropType: "Fruit & seed crops",
      description: "Strong stems, fruit development",
      examples: "Beans, peas, tomatoes, peppers, squash",
      isCurrent: currentQuarter === 2,
    },
    {
      quarter: 3,
      label: "Full to Last Quarter",
      cropType: "Roots & perennials",
      description: "Energy pulls downward, root growth",
      examples: "Carrots, garlic, potatoes, onions, beets",
      isCurrent: currentQuarter === 3,
    },
    {
      quarter: 4,
      label: "Last Quarter to New",
      cropType: "Rest period",
      description: "Weed, prune, turn compost",
      examples: "No planting — maintenance only",
      isCurrent: currentQuarter === 4,
    },
  ];

  // --- Crop Categories with 7-day ratings ---
  const isHotSeason = month >= 4 && month <= 7; // May–Aug
  const dayNum = date.getDate();

  const fruitingDays: DayRating[] = [];
  const rootDays: DayRating[] = [];
  const leafyDays: DayRating[] = [];
  const harvestDays: DayRating[] = [];

  for (let d = 0; d < 7; d++) {
    const sign = getSignForDayOffset(moonSign, d);
    const num = dayNum + d;
    fruitingDays.push({ dayNum: num, rating: computeCropRating(sign, "fruiting", waxing) });
    rootDays.push({ dayNum: num, rating: computeCropRating(sign, "root", waxing) });
    leafyDays.push({ dayNum: num, rating: computeCropRating(sign, "leafy", waxing) });
    harvestDays.push({ dayNum: num, rating: computeCropRating(sign, "harvest", waxing) });
  }

  const cropCategories: CropCategory[] = [
    {
      name: "Fruiting crops",
      icon: "T",
      examples: "Tomatoes, peppers, squash, beans",
      bestDays: fruitingDays,
    },
    {
      name: "Root crops",
      icon: "R",
      examples: "Carrots, potatoes, beets, garlic",
      bestDays: rootDays,
    },
    {
      name: "Leafy greens",
      icon: "L",
      examples: "Lettuce, spinach, kale, chard",
      bestDays: leafyDays,
      seasonalNote: isHotSeason ? "too hot · plant in fall" : undefined,
    },
    {
      name: "Harvest/prune/weed",
      icon: "H",
      examples: "Best in barren signs",
      bestDays: harvestDays,
    },
  ];

  // --- Plant Now ---
  const zoneMonthData = zoneData.plantNow;
  const plantNow = zoneMonthData[month] || zoneMonthData[0];

  // --- Wisdom ---
  const wisdomIndex = dayOfYear % GARDEN_WISDOM.length;
  const wisdom = GARDEN_WISDOM[wisdomIndex];

  return {
    zone,
    region,
    subregion,
    lastFrost,
    firstFrost,
    todayVerdict,
    quarters,
    cropCategories,
    plantNow,
    wisdom,
  };
}
