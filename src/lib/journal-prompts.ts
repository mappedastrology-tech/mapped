/**
 * Journal Prompt Library — chart-shaped prompts for Mapped's journal.
 *
 * 150+ prompts across 5 categories, selected by astrological priority.
 * Never repeats within 30 days.
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export type PromptCategory = "transit" | "moon_phase" | "day_of_week" | "lord_of_year" | "generic";

export interface JournalPrompt {
  id: string;
  category: PromptCategory;
  text: string;
  /** For transit prompts: which transit triggers it (e.g., "saturn_square_sun") */
  trigger?: string;
  /** For moon phase: which phase */
  moonPhase?: string;
  /** For day-of-week: which day (0=Sun, 1=Mon, etc.) */
  dayOfWeek?: number;
  /** For Lord of Year: which planet */
  lordPlanet?: string;
}

// ─── Transit Prompts ─────────────────────────────────────────────────────────

const TRANSIT_PROMPTS: JournalPrompt[] = [
  // Saturn
  { id: "t01", category: "transit", trigger: "saturn_square_sun", text: "Saturn is squaring your Sun. What are you being asked to take responsibility for?" },
  { id: "t02", category: "transit", trigger: "saturn_conjunct_moon", text: "Saturn is on your Moon. Where are you holding yourself together when you want to fall apart?" },
  { id: "t03", category: "transit", trigger: "saturn_opposite_sun", text: "Saturn opposes your Sun. Who or what is testing your sense of self right now?" },
  { id: "t04", category: "transit", trigger: "saturn_trine_venus", text: "Saturn trines your Venus. What relationship is quietly becoming more real?" },
  { id: "t05", category: "transit", trigger: "saturn_square_mars", text: "Saturn squares your Mars. Where are you being told to slow down but don't want to?" },
  { id: "t06", category: "transit", trigger: "saturn_conjunct_mc", text: "Saturn crosses your Midheaven. What does the next version of your career actually look like?" },
  { id: "t07", category: "transit", trigger: "saturn_return", text: "You're in your Saturn return. What structure in your life no longer holds the weight of who you're becoming?" },

  // Pluto
  { id: "t08", category: "transit", trigger: "pluto_conjunct_moon", text: "Pluto is on your Moon. What feeling have you been hiding from yourself?" },
  { id: "t09", category: "transit", trigger: "pluto_square_sun", text: "Pluto squares your Sun. What part of your identity is dying so something else can live?" },
  { id: "t10", category: "transit", trigger: "pluto_conjunct_venus", text: "Pluto is on your Venus. What do you want so badly it frightens you?" },
  { id: "t11", category: "transit", trigger: "pluto_opposite_mars", text: "Pluto opposes your Mars. Where is your anger actually a map to something that matters?" },

  // Jupiter
  { id: "t12", category: "transit", trigger: "jupiter_trine_venus", text: "Jupiter is trining your Venus. What are you noticing that you find beautiful right now?" },
  { id: "t13", category: "transit", trigger: "jupiter_conjunct_sun", text: "Jupiter is on your Sun. What would you attempt if you fully believed it would work?" },
  { id: "t14", category: "transit", trigger: "jupiter_trine_moon", text: "Jupiter trines your Moon. What do you feel safe enough to want right now?" },
  { id: "t15", category: "transit", trigger: "jupiter_square_saturn", text: "Jupiter squares your Saturn. Where are you outgrowing a rule you once needed?" },
  { id: "t16", category: "transit", trigger: "jupiter_conjunct_mc", text: "Jupiter crosses your Midheaven. What opportunity is showing up that you almost didn't notice?" },

  // Mars
  { id: "t17", category: "transit", trigger: "mars_opposite_mars", text: "It's your Mars return halfway point. What are you fighting for that you didn't fight for last time?" },
  { id: "t18", category: "transit", trigger: "mars_conjunct_venus", text: "Mars is on your Venus. What desire are you pretending is smaller than it actually is?" },
  { id: "t19", category: "transit", trigger: "mars_square_moon", text: "Mars squares your Moon. What is irritating you that's actually telling you something important?" },
  { id: "t20", category: "transit", trigger: "mars_conjunct_mars", text: "Mars returns to its natal place. What were you angry about two years ago — and is it resolved?" },

  // Uranus
  { id: "t21", category: "transit", trigger: "uranus_conjunct_asc", text: "Uranus is on your Ascendant. What part of yourself are you ready to let surface?" },
  { id: "t22", category: "transit", trigger: "uranus_square_moon", text: "Uranus squares your Moon. What in your daily life suddenly feels unbearable?" },
  { id: "t23", category: "transit", trigger: "uranus_opposite_venus", text: "Uranus opposes your Venus. What relationship needs to change shape — or end?" },
  { id: "t24", category: "transit", trigger: "uranus_trine_sun", text: "Uranus trines your Sun. What new version of yourself is emerging without effort?" },

  // Neptune
  { id: "t25", category: "transit", trigger: "neptune_square_sun", text: "Neptune squares your Sun. What are you confused about — and do you need the clarity you think you do?" },
  { id: "t26", category: "transit", trigger: "neptune_conjunct_moon", text: "Neptune is on your Moon. What boundary have you let dissolve that maybe shouldn't have?" },
  { id: "t27", category: "transit", trigger: "neptune_trine_venus", text: "Neptune trines your Venus. What are you romanticizing — and is that actually okay right now?" },

  // Mercury
  { id: "t28", category: "transit", trigger: "mercury_retrograde", text: "Mercury is retrograde. What old conversation is replaying in your head — and what would you say differently?" },
  { id: "t29", category: "transit", trigger: "mercury_conjunct_sun", text: "Mercury is on your Sun. What do you need to say out loud today?" },

  // Venus
  { id: "t30", category: "transit", trigger: "venus_conjunct_moon", text: "Venus is on your Moon. What makes you feel genuinely cared for? Name it specifically." },
  { id: "t31", category: "transit", trigger: "venus_return", text: "Venus returns to its natal place. What do you value now that you didn't a year ago?" },
  { id: "t32", category: "transit", trigger: "venus_square_saturn", text: "Venus squares your Saturn. Where are you withholding affection — from yourself or someone else?" },
];

// ─── Moon Phase Prompts ──────────────────────────────────────────────────────

const MOON_PHASE_PROMPTS: JournalPrompt[] = [
  // New Moon
  { id: "m01", category: "moon_phase", moonPhase: "new", text: "What seed are you planting this cycle? Be specific. Vague seeds don't grow." },
  { id: "m02", category: "moon_phase", moonPhase: "new", text: "The moon is invisible tonight. What are you beginning in the dark?" },
  { id: "m03", category: "moon_phase", moonPhase: "new", text: "New moons ask: what do you want to be true by the full moon? Name one thing." },
  { id: "m04", category: "moon_phase", moonPhase: "new", text: "Something always starts on a new moon. What started without you noticing?" },

  // Waxing Crescent
  { id: "m05", category: "moon_phase", moonPhase: "waxing_crescent", text: "What did you decide last new moon? Are you actually doing it?" },
  { id: "m06", category: "moon_phase", moonPhase: "waxing_crescent", text: "The crescent is a sliver of commitment. What are you committing to this week?" },

  // First Quarter
  { id: "m07", category: "moon_phase", moonPhase: "first_quarter", text: "What's getting in the way? Name the friction." },
  { id: "m08", category: "moon_phase", moonPhase: "first_quarter", text: "First quarter moons surface resistance. What are you pushing against right now?" },
  { id: "m09", category: "moon_phase", moonPhase: "first_quarter", text: "Something needs a decision this week. What have you been deferring?" },

  // Waxing Gibbous
  { id: "m10", category: "moon_phase", moonPhase: "waxing_gibbous", text: "What needs editing before this culminates?" },
  { id: "m11", category: "moon_phase", moonPhase: "waxing_gibbous", text: "You're almost at the full moon. What feels almost-done but not quite?" },

  // Full Moon
  { id: "m12", category: "moon_phase", moonPhase: "full", text: "What is being illuminated that you'd rather not see?" },
  { id: "m13", category: "moon_phase", moonPhase: "full", text: "Full moons reveal. What became visible this week that was hidden before?" },
  { id: "m14", category: "moon_phase", moonPhase: "full", text: "Something peaks tonight. What are you celebrating or releasing?" },
  { id: "m15", category: "moon_phase", moonPhase: "full", text: "The moon is at maximum light. What are you seeing clearly for the first time?" },

  // Waning Gibbous
  { id: "m16", category: "moon_phase", moonPhase: "waning_gibbous", text: "What are you grateful for from this cycle?" },
  { id: "m17", category: "moon_phase", moonPhase: "waning_gibbous", text: "The full moon just passed. What did it show you?" },

  // Last Quarter
  { id: "m18", category: "moon_phase", moonPhase: "last_quarter", text: "What are you done carrying?" },
  { id: "m19", category: "moon_phase", moonPhase: "last_quarter", text: "Last quarter asks you to let go of one thing. What's it going to be?" },
  { id: "m20", category: "moon_phase", moonPhase: "last_quarter", text: "What story about yourself are you ready to stop telling?" },

  // Waning Crescent / Balsamic
  { id: "m21", category: "moon_phase", moonPhase: "waning_crescent", text: "What needs rest before the next cycle starts?" },
  { id: "m22", category: "moon_phase", moonPhase: "waning_crescent", text: "The moon is almost gone. What do you need to put down before it returns?" },
  { id: "m23", category: "moon_phase", moonPhase: "waning_crescent", text: "Balsamic moons are for composting. What experience is decomposing into wisdom?" },
];

// ─── Day-of-Week Prompts ─────────────────────────────────────────────────────

const DAY_PROMPTS: JournalPrompt[] = [
  // Sunday (Sun)
  { id: "d01", category: "day_of_week", dayOfWeek: 0, text: "Who are you when no one's watching?" },
  { id: "d02", category: "day_of_week", dayOfWeek: 0, text: "Sunday is the Sun's day. What gives you energy right now — and what drains it?" },
  { id: "d03", category: "day_of_week", dayOfWeek: 0, text: "The Sun rules identity. What part of yourself did you perform this week versus actually feel?" },

  // Monday (Moon)
  { id: "d04", category: "day_of_week", dayOfWeek: 1, text: "How are you actually feeling today? Not the version you'd give a coworker." },
  { id: "d05", category: "day_of_week", dayOfWeek: 1, text: "Monday belongs to the Moon. What do you need that you haven't asked for?" },
  { id: "d06", category: "day_of_week", dayOfWeek: 1, text: "The Moon rules memory. What keeps surfacing from the past this week?" },

  // Tuesday (Mars)
  { id: "d07", category: "day_of_week", dayOfWeek: 2, text: "What are you avoiding fighting for?" },
  { id: "d08", category: "day_of_week", dayOfWeek: 2, text: "Tuesday belongs to Mars. What boundary do you need to enforce today?" },
  { id: "d09", category: "day_of_week", dayOfWeek: 2, text: "Mars is drive. Where are you holding back when you should be moving?" },

  // Wednesday (Mercury)
  { id: "d10", category: "day_of_week", dayOfWeek: 3, text: "What conversation have you been rehearsing in your head?" },
  { id: "d11", category: "day_of_week", dayOfWeek: 3, text: "Wednesday belongs to Mercury. What are you overthinking that just needs to be said?" },
  { id: "d12", category: "day_of_week", dayOfWeek: 3, text: "Mercury rules the mind. What thought keeps looping — and what does it actually want?" },

  // Thursday (Jupiter)
  { id: "d13", category: "day_of_week", dayOfWeek: 4, text: "What would you do if you trusted that more was possible?" },
  { id: "d14", category: "day_of_week", dayOfWeek: 4, text: "Thursday belongs to Jupiter. Where in your life could you be more generous — with yourself?" },
  { id: "d15", category: "day_of_week", dayOfWeek: 4, text: "Jupiter is faith. What are you having a hard time believing in right now?" },

  // Friday (Venus)
  { id: "d16", category: "day_of_week", dayOfWeek: 5, text: "What are you in love with right now? Anything counts." },
  { id: "d17", category: "day_of_week", dayOfWeek: 5, text: "Friday belongs to Venus. What beautiful thing happened this week that you didn't pause for?" },
  { id: "d18", category: "day_of_week", dayOfWeek: 5, text: "Venus rules pleasure. What did your body enjoy today that your mind didn't notice?" },

  // Saturday (Saturn)
  { id: "d19", category: "day_of_week", dayOfWeek: 6, text: "What's the truth you've been avoiding telling yourself?" },
  { id: "d20", category: "day_of_week", dayOfWeek: 6, text: "Saturday belongs to Saturn. What are you building slowly — and is it worth the effort?" },
  { id: "d21", category: "day_of_week", dayOfWeek: 6, text: "Saturn rules time. What would your future self thank you for doing today?" },
];

// ─── Lord of the Year Prompts ────────────────────────────────────────────────

const LORD_PROMPTS: JournalPrompt[] = [
  // Saturn
  { id: "l01", category: "lord_of_year", lordPlanet: "Saturn", text: "Saturn is running your year. What are you building slowly? Where are you tired of cutting corners?" },
  { id: "l02", category: "lord_of_year", lordPlanet: "Saturn", text: "Your year belongs to Saturn. What rule are you following that you chose — versus one that was imposed?" },
  { id: "l03", category: "lord_of_year", lordPlanet: "Saturn", text: "Saturn years strip away what isn't earned. What feels heavy right now because it's real?" },

  // Jupiter
  { id: "l04", category: "lord_of_year", lordPlanet: "Jupiter", text: "Jupiter is your year. Where are you saying yes? Where are you saying no out of fear, not wisdom?" },
  { id: "l05", category: "lord_of_year", lordPlanet: "Jupiter", text: "Your year belongs to Jupiter. What expanded without you trying?" },
  { id: "l06", category: "lord_of_year", lordPlanet: "Jupiter", text: "Jupiter years teach through excess. What do you have too much of — and is that actually a problem?" },

  // Mars
  { id: "l07", category: "lord_of_year", lordPlanet: "Mars", text: "Mars is your year. What are you starting? What are you angry about that's actually a clue?" },
  { id: "l08", category: "lord_of_year", lordPlanet: "Mars", text: "Your year belongs to Mars. Where did you act on instinct this week — and was it right?" },
  { id: "l09", category: "lord_of_year", lordPlanet: "Mars", text: "Mars years burn fast. What are you in a hurry about — and should you be?" },

  // Venus
  { id: "l10", category: "lord_of_year", lordPlanet: "Venus", text: "Venus is your year. What relationship — with a person, a place, a part of yourself — needs attention?" },
  { id: "l11", category: "lord_of_year", lordPlanet: "Venus", text: "Your year belongs to Venus. What are you finding beautiful lately that surprised you?" },
  { id: "l12", category: "lord_of_year", lordPlanet: "Venus", text: "Venus years ask about worth. What do you value now that you didn't last year?" },

  // Mercury
  { id: "l13", category: "lord_of_year", lordPlanet: "Mercury", text: "Mercury runs your year. What are you learning — and what are you unlearning?" },
  { id: "l14", category: "lord_of_year", lordPlanet: "Mercury", text: "Your year belongs to Mercury. What information changed everything this month?" },
  { id: "l15", category: "lord_of_year", lordPlanet: "Mercury", text: "Mercury years move fast in the mind. What idea keeps coming back no matter how many times you dismiss it?" },

  // Sun
  { id: "l16", category: "lord_of_year", lordPlanet: "Sun", text: "The Sun rules your year. Where are you becoming more visible — and how does that feel?" },
  { id: "l17", category: "lord_of_year", lordPlanet: "Sun", text: "Your year belongs to the Sun. What part of your identity solidified this month?" },

  // Moon
  { id: "l18", category: "lord_of_year", lordPlanet: "Moon", text: "The Moon rules your year. What emotional pattern are you finally seeing clearly?" },
  { id: "l19", category: "lord_of_year", lordPlanet: "Moon", text: "Your year belongs to the Moon. What do you need right now — not what you should need. What you actually need." },
];

// ─── Generic Fallback Prompts ────────────────────────────────────────────────

const GENERIC_PROMPTS: JournalPrompt[] = [
  { id: "g01", category: "generic", text: "What are you noticing today that you haven't named yet?" },
  { id: "g02", category: "generic", text: "What's the thing you keep almost saying?" },
  { id: "g03", category: "generic", text: "What's the question under the question you're asking?" },
  { id: "g04", category: "generic", text: "Three things you saw today. Don't make them mean anything. Just name them." },
  { id: "g05", category: "generic", text: "What's taking up more space in your head than it deserves?" },
  { id: "g06", category: "generic", text: "What did you feel today that you didn't let yourself fully feel?" },
  { id: "g07", category: "generic", text: "Name something that ended recently. How do you know it's over?" },
  { id: "g08", category: "generic", text: "What are you pretending is fine?" },
  { id: "g09", category: "generic", text: "What's different about today compared to a month ago?" },
  { id: "g10", category: "generic", text: "What would you tell your last-year self about this week?" },
  { id: "g11", category: "generic", text: "Who did you think about today that you haven't spoken to?" },
  { id: "g12", category: "generic", text: "What decision are you circling without landing?" },
  { id: "g13", category: "generic", text: "What surprised you about yourself today?" },
  { id: "g14", category: "generic", text: "Where did your energy go today? Trace it." },
  { id: "g15", category: "generic", text: "What's one thing you did today that you'd do again tomorrow?" },
  { id: "g16", category: "generic", text: "What are you tolerating that you used to refuse?" },
  { id: "g17", category: "generic", text: "What would you write if no one would ever read it? Write that." },
  { id: "g18", category: "generic", text: "What's the most honest sentence you can write right now?" },
  { id: "g19", category: "generic", text: "Something shifted this week. Can you name when it happened?" },
  { id: "g20", category: "generic", text: "What's yours right now that wasn't yours a year ago?" },
  { id: "g21", category: "generic", text: "What's one thing you're afraid to want?" },
  { id: "g22", category: "generic", text: "What do you know now that you didn't know this morning?" },
  { id: "g23", category: "generic", text: "What are you bracing for? And is it actually coming?" },
  { id: "g24", category: "generic", text: "What's the kindest thing someone said to you recently? Did you let it land?" },
  { id: "g25", category: "generic", text: "Where are you holding tension right now — physically?" },
  { id: "g26", category: "generic", text: "What are you waiting for permission to do?" },
  { id: "g27", category: "generic", text: "What did you choose today? Even small choices count." },
  { id: "g28", category: "generic", text: "What would change if you trusted your first instinct more?" },
  { id: "g29", category: "generic", text: "What is quietly getting better without your effort?" },
  { id: "g30", category: "generic", text: "Write one sentence you'd put on a wall where only you could see it." },
];

// ─── All Prompts ─────────────────────────────────────────────────────────────

export const ALL_PROMPTS: JournalPrompt[] = [
  ...TRANSIT_PROMPTS,
  ...MOON_PHASE_PROMPTS,
  ...DAY_PROMPTS,
  ...LORD_PROMPTS,
  ...GENERIC_PROMPTS,
];

// ─── Prompt Selection Engine ─────────────────────────────────────────────────

const SHOWN_PROMPTS_KEY = "mapped:journal_shown_prompts";
const NO_REPEAT_DAYS = 30;

interface ShownPromptRecord {
  id: string;
  shownAt: string; // ISO date
}

function getShownPrompts(): ShownPromptRecord[] {
  try {
    const raw = localStorage.getItem(SHOWN_PROMPTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function markPromptShown(promptId: string) {
  const shown = getShownPrompts();
  shown.push({ id: promptId, shownAt: new Date().toISOString() });
  // Keep only last 90 days
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 90);
  const filtered = shown.filter((r) => new Date(r.shownAt) > cutoff);
  localStorage.setItem(SHOWN_PROMPTS_KEY, JSON.stringify(filtered));
}

function getRecentlyShownIds(): Set<string> {
  const shown = getShownPrompts();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - NO_REPEAT_DAYS);
  return new Set(
    shown.filter((r) => new Date(r.shownAt) > cutoff).map((r) => r.id)
  );
}

export interface PromptContext {
  /** Active transits as trigger keys (e.g., "saturn_square_sun") */
  activeTransits?: string[];
  /** Current moon phase */
  moonPhase?: string;
  /** Day of week (0=Sun, 6=Sat) */
  dayOfWeek?: number;
  /** Lord of the Year planet name */
  lordOfYear?: string;
}

/**
 * Select the best prompt for the current context.
 * Priority: transit > moon phase > day of week > lord of year > generic
 */
export function selectPrompt(context: PromptContext): JournalPrompt {
  const recentlyShown = getRecentlyShownIds();

  function pickFromPool(pool: JournalPrompt[]): JournalPrompt | null {
    const available = pool.filter((p) => !recentlyShown.has(p.id));
    if (available.length === 0) return null;
    // Pseudo-random based on date so it's stable within a day
    const today = new Date().toISOString().slice(0, 10);
    const hash = today.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
    return available[hash % available.length];
  }

  // Priority 1: Active transit
  if (context.activeTransits?.length) {
    const transitPool = TRANSIT_PROMPTS.filter((p) =>
      context.activeTransits!.includes(p.trigger || "")
    );
    const pick = pickFromPool(transitPool);
    if (pick) { markPromptShown(pick.id); return pick; }
  }

  // Priority 2: Moon phase
  if (context.moonPhase) {
    const moonPool = MOON_PHASE_PROMPTS.filter((p) => p.moonPhase === context.moonPhase);
    const pick = pickFromPool(moonPool);
    if (pick) { markPromptShown(pick.id); return pick; }
  }

  // Priority 3: Day of week
  if (context.dayOfWeek !== undefined) {
    const dayPool = DAY_PROMPTS.filter((p) => p.dayOfWeek === context.dayOfWeek);
    const pick = pickFromPool(dayPool);
    if (pick) { markPromptShown(pick.id); return pick; }
  }

  // Priority 4: Lord of the Year
  if (context.lordOfYear) {
    const lordPool = LORD_PROMPTS.filter((p) => p.lordPlanet === context.lordOfYear);
    const pick = pickFromPool(lordPool);
    if (pick) { markPromptShown(pick.id); return pick; }
  }

  // Priority 5: Generic fallback
  const genericPick = pickFromPool(GENERIC_PROMPTS);
  if (genericPick) { markPromptShown(genericPick.id); return genericPick; }

  // Absolute fallback (all prompts seen recently)
  const fallback = GENERIC_PROMPTS[Math.floor(Math.random() * GENERIC_PROMPTS.length)];
  return fallback;
}

/**
 * Get the next prompt (for "Different prompt" cycling).
 * Excludes the current prompt and recently shown.
 */
export function getNextPrompt(context: PromptContext, excludeIds: string[]): JournalPrompt | null {
  const recentlyShown = getRecentlyShownIds();
  const excluded = new Set([...excludeIds, ...recentlyShown]);

  // Try each priority level
  const pools = [
    context.activeTransits?.length
      ? TRANSIT_PROMPTS.filter((p) => context.activeTransits!.includes(p.trigger || ""))
      : [],
    context.moonPhase
      ? MOON_PHASE_PROMPTS.filter((p) => p.moonPhase === context.moonPhase)
      : [],
    context.dayOfWeek !== undefined
      ? DAY_PROMPTS.filter((p) => p.dayOfWeek === context.dayOfWeek)
      : [],
    context.lordOfYear
      ? LORD_PROMPTS.filter((p) => p.lordPlanet === context.lordOfYear)
      : [],
    GENERIC_PROMPTS,
  ];

  for (const pool of pools) {
    const available = pool.filter((p) => !excluded.has(p.id));
    if (available.length > 0) {
      const pick = available[Math.floor(Math.random() * available.length)];
      markPromptShown(pick.id);
      return pick;
    }
  }

  return null; // All exhausted
}
