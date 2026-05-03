/**
 * Birth Time Precision system for Mapped
 * Handles users with exact, approximate, rectified, or unknown birth times.
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export type BirthTimePrecision = "exact" | "approximate" | "rectified" | "unknown";

export type TimeWindow =
  | "early_morning"  // 5–8 AM
  | "morning"        // 8–11 AM
  | "midday"         // 11 AM–2 PM
  | "afternoon"      // 2–5 PM
  | "early_evening"  // 5–8 PM
  | "evening"        // 8–11 PM
  | "late_night"     // 11 PM–2 AM
  | "overnight";     // 2–5 AM

export interface TimeWindowMeta {
  label: string;
  description: string;
  midpointHour: number; // 24hr format midpoint used for calculations
  isDaytime: boolean;
}

export interface RectificationData {
  events: RectificationEvent[];
  personalityAnswers: Record<string, string>;
  physicalAnswers: Record<string, string>;
  confidence: number; // 0-1
  calculatedAt: string; // ISO date
  estimatedTime: string; // HH:MM
  estimatedRising: string; // sign name
}

export interface RectificationEvent {
  type: "career" | "relationship" | "life" | "other";
  description: string;
  date: string; // YYYY-MM or YYYY-MM-DD
}

export interface BirthTimeData {
  birthDate: string; // YYYY-MM-DD
  birthTime: string | null; // HH:MM:SS or null
  birthTimePrecision: BirthTimePrecision;
  birthTimeWindow: TimeWindow | null;
  birthTimeRectifiedData: RectificationData | null;
  birthLocation: string;
  dayNightKnown: boolean;
  isDaytime: boolean | null; // null if day/night not known
}

// ─── Constants ───────────────────────────────────────────────────────────────

export const TIME_WINDOWS: Record<TimeWindow, TimeWindowMeta> = {
  early_morning: { label: "Early morning", description: "5–8 AM", midpointHour: 6.5, isDaytime: true },
  morning:       { label: "Morning",       description: "8–11 AM", midpointHour: 9.5, isDaytime: true },
  midday:        { label: "Midday",        description: "11 AM–2 PM", midpointHour: 12.5, isDaytime: true },
  afternoon:     { label: "Afternoon",     description: "2–5 PM", midpointHour: 15.5, isDaytime: true },
  early_evening: { label: "Early evening", description: "5–8 PM", midpointHour: 18.5, isDaytime: false },
  evening:       { label: "Evening",       description: "8–11 PM", midpointHour: 21.5, isDaytime: false },
  late_night:    { label: "Late night",    description: "11 PM–2 AM", midpointHour: 0.5, isDaytime: false },
  overnight:     { label: "Overnight",     description: "2–5 AM", midpointHour: 3.5, isDaytime: false },
};

// ─── Feature Gating ──────────────────────────────────────────────────────────

/**
 * Tier A: Features that show with a soft cue (visible but flagged)
 * Tier B: Features hidden entirely until birth time is provided
 */

export type TimeDependentFeature =
  // Tier A — visible with soft cue
  | "rising_sign"
  | "houses"
  | "house_based_aspects"
  | "solar_return_themes"
  | "house_transits"
  | "synastry_houses"
  | "chart_ruler"
  | "midheaven"
  // Tier B — hidden entirely
  | "astrocartography"
  | "lord_of_year"
  | "profections"
  | "zr_timeline"
  | "almuten_figuris"
  | "triplicity_rulers"
  | "solar_return_precise";

const TIER_B_FEATURES: TimeDependentFeature[] = [
  "astrocartography",
  "lord_of_year",
  "profections",
  "zr_timeline",
  "almuten_figuris",
  "triplicity_rulers",
  "solar_return_precise",
];

const TIER_A_FEATURES: TimeDependentFeature[] = [
  "rising_sign",
  "houses",
  "house_based_aspects",
  "solar_return_themes",
  "house_transits",
  "synastry_houses",
  "chart_ruler",
  "midheaven",
];

/**
 * Whether a feature is Tier B (hidden entirely without time)
 */
export function isTierB(feature: TimeDependentFeature): boolean {
  return TIER_B_FEATURES.includes(feature);
}

/**
 * Whether a feature is Tier A (visible with soft cue)
 */
export function isTierA(feature: TimeDependentFeature): boolean {
  return TIER_A_FEATURES.includes(feature);
}

/**
 * Whether a time-dependent feature can be shown for this user's precision level.
 * - "exact": all features available
 * - "approximate": Tier A with caveats, Tier B hidden (except astrocartography always hidden)
 * - "rectified": same as approximate (treated with caveats)
 * - "unknown": Tier A shows placeholder/soft cue, Tier B hidden
 */
export function canShowFeature(
  precision: BirthTimePrecision,
  feature: TimeDependentFeature
): "full" | "caveated" | "hidden" {
  if (precision === "exact") return "full";

  if (precision === "approximate" || precision === "rectified") {
    // Astrocartography is too sensitive even for approximate
    if (feature === "astrocartography" || feature === "solar_return_precise") return "hidden";
    if (isTierB(feature)) return "caveated";
    return "caveated";
  }

  // Unknown
  if (isTierB(feature)) return "hidden";
  return "hidden"; // Tier A also hidden for unknown — they show as placeholder cards
}

/**
 * Whether a feature should render at all for this user.
 * Returns false only for Tier B features on unknown/approximate users.
 */
export function shouldRenderFeature(
  precision: BirthTimePrecision,
  feature: TimeDependentFeature
): boolean {
  const status = canShowFeature(precision, feature);
  return status !== "hidden";
}

// ─── Re-prompt Cadence ───────────────────────────────────────────────────────

export const REPROMPT_DAYS = [3, 7, 14, 30] as const;

export interface RepromptState {
  dismissed: boolean;        // permanently silenced
  lastShownDay: number | null;
  accountCreatedAt: string;  // ISO date
}

/**
 * Get which re-prompt (if any) should show today.
 * Returns null if no prompt should show.
 */
export function getRepromptForToday(state: RepromptState): number | null {
  if (state.dismissed) return null;

  const created = new Date(state.accountCreatedAt);
  const now = new Date();
  const daysSinceCreation = Math.floor(
    (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Find the appropriate prompt day
  for (const day of REPROMPT_DAYS) {
    if (daysSinceCreation >= day && (state.lastShownDay === null || state.lastShownDay < day)) {
      return day;
    }
  }

  return null;
}

/**
 * Get copy for a specific re-prompt day
 */
export function getRepromptCopy(day: number): { title: string; body: string; location: string } {
  switch (day) {
    case 3:
      return {
        title: "Found your birth time?",
        body: "Add it for the full chart experience.",
        location: "you_tab_banner",
      };
    case 7:
      return {
        title: "A quick tip",
        body: "Try asking a parent about your birth time — even an approximate is helpful for your chart.",
        location: "push_notification",
      };
    case 14:
      return {
        title: "Your chart has more to show",
        body: "Want to refine your birth time? Even a rough window helps.",
        location: "account_banner",
      };
    case 30:
      return {
        title: "Last time we'll ask",
        body: "We won't keep asking. Add your time anytime in Settings.",
        location: "final_banner",
      };
    default:
      return { title: "", body: "", location: "" };
  }
}

// ─── Voice Copy ──────────────────────────────────────────────────────────────

export const BIRTH_TIME_COPY = {
  onboarding_skip: `Don't know your birth time? It happens. We'll calculate everything we can without it — a lot, actually. The Rising sign and houses depend on the time, but most of your chart is still readable. You can add the time later, or try our rectification tool.`,

  feature_hidden_astrocartography: `Astrocartography needs your exact birth time. The map shows where your chart lights up the world — that calculation works to the minute. If you find it later, this will fill in.`,

  feature_hidden_profections: `Your Lord of the Year is calculated from your Ascendant — which we can't determine without your exact birth time.`,

  feature_hidden_generic: (featureName: string) =>
    `${featureName} needs your exact birth time to work. Add yours to unlock this view.`,

  user_accepts_no_time: `That's okay. A lot of people don't have it and never will. We'll work with what you've got. If you ever want to try rectification, it's there. Otherwise, your chart still has plenty to read.`,

  approximate_badge: `You entered an approximate birth time. Your Sun, Moon, and planet signs are accurate. Your Rising sign and houses are best-guess based on the window you provided — they could be a sign off in either direction.`,

  rectified_badge: `This is a calculated estimate, not your actual birth time. If you find your real birth time, please update it. Rectification can be wrong, especially when life events don't fit the average pattern.`,

  approximate_house_disclaimer: `Based on your approximate time. The actual reading depends on the exact minute.`,
} as const;

// ─── Rectification ───────────────────────────────────────────────────────────

export const RISING_SIGN_ARCHETYPES = [
  { sign: "Aries", label: "Energetic and forward" },
  { sign: "Taurus", label: "Grounded and warm" },
  { sign: "Gemini", label: "Quick and curious" },
  { sign: "Cancer", label: "Soft and watchful" },
  { sign: "Leo", label: "Confident and bright" },
  { sign: "Virgo", label: "Reserved and observant" },
  { sign: "Libra", label: "Charming and balanced" },
  { sign: "Scorpio", label: "Intense and private" },
  { sign: "Sagittarius", label: "Adventurous and direct" },
  { sign: "Capricorn", label: "Composed and serious" },
  { sign: "Aquarius", label: "Different and detached" },
  { sign: "Pisces", label: "Dreamy and elusive" },
] as const;

export const PHYSICAL_BUILD_OPTIONS = [
  "Lean and angular",
  "Athletic and muscular",
  "Compact and sturdy",
  "Tall and willowy",
  "Round and soft",
  "Average and balanced",
] as const;

export const NOTABLE_FEATURE_OPTIONS = [
  "Eyes — intense or distinctive",
  "Smile — warm or memorable",
  "Voice — unusual pitch or quality",
  "Posture — very upright or relaxed",
  "Hands — expressive or graceful",
  "Hair — thick, distinctive, or unusual",
  "Overall presence — hard to miss",
] as const;
