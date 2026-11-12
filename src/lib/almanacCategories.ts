/**
 * The almanac's personal categories — "Your day".
 *
 * WHAT A SCORE IS
 * ---------------
 * A reading of the sky's weather for one kind of activity on one local day. It
 * describes conditions astrology traditionally associates with that activity;
 * it never promises an outcome, and no category covers money, medical, legal or
 * addiction-adjacent decisions (see isUnscoredTopic).
 *
 * THE METHOD (every number below is the whole of it — nothing is random)
 * ----------
 * Each category names a significator — the planet whose real condition today is
 * read (Mercury for communication, Venus for love and creativity, Mars for the
 * body, the Moon itself for rest) — plus the Moon signs and phase tradition
 * pairs with it, how it takes a void-of-course Moon, and which other planets'
 * contacts help or strain it. The score starts at 5 and adds:
 *
 *   1. The significator's essential dignity in the sign it actually occupies
 *      at local noon (ephemeris.ts; dignity table shared with the chart page,
 *      chartAnalysis.essentialDignity — traditional rulers):
 *        domicile +1.5 · exaltation +1.25 · peregrine 0 · detriment −1.25 · fall −1.5
 *      Moon-led categories skip this; their Moon-sign factor carries it.
 *   2. Its motion, for categories where retrograde matters (`retrograde: "drags"`):
 *        stationing today −1.0 · retrograde −1.0 · stationary (within a day
 *        of a station, ephemeris STATION_WINDOW_DAYS) −0.5
 *      Elsewhere it is mentioned at weight 0 — review suits journaling, repair…
 *   3. The Moon's sign at local noon: a sign tradition pairs with this +1.25,
 *      a poor fit −1.25, otherwise 0.
 *   4. The Moon's phase at local noon (waxing = elongation under 180°), when the
 *      category has a preference: matched +0.75, opposite −0.5.
 *   5. The void-of-course Moon (skyCalendar: last exact Ptolemaic aspect to
 *      Sun–Pluto until the ingress), by the share f of waking hours
 *      (7 AM – 10 PM local) it covers: drags −(0.5 + f); helps +(0.25 + 0.75f).
 *   6. Exact aspects (skyCalendar.exactAspectsBetween — no orbs, the instant it
 *      perfects): the Moon's aspects during the local day to the significator
 *      and the category's named planets, and the significator's own aspects to
 *      any planet perfecting within a day either side. By the other body's role:
 *                       trine/sextile   conjunction   square/opposition
 *        significator       +0.75          +0.5            −0.6
 *        helper             +0.75          +0.75           −0.25
 *        strain             +0.25          −0.75           −0.9
 *        other planet       +0.4            0              −0.4
 *      The aspect total is scaled to stay within ±2.
 *
 * The total is clamped to 1–10 and read as a word: 6.5 and up Favorable, under
 * 4.5 Quiet, Mixed between. Each reading carries 2–4 plain-English reasons —
 * the significator's condition first, then the heaviest factors — naming the
 * real configuration with exact times in the reader's zone.
 *
 * Best window: the two hours leading up to (and one after) the day's most
 * supportive exact Moon aspect, inside waking hours and outside any void
 * stretch — applying aspects are traditionally the strong side. For a category
 * the void Moon suits, the void stretch itself; for one it drags, the longest
 * waking stretch outside it. Otherwise none: when nothing stands out, the sheet
 * says so rather than inventing a time.
 *
 * Conventions (shared with the rest of the app): tropical zodiac; apparent
 * geocentric longitude of date; Ptolemaic aspects only; void of course to
 * Sun–Pluto (modern). A day is the reader's local calendar date (the app's
 * "day" Date shape, see skyCalendar local-day helpers); pass an IANA zone to
 * read it for someone else's midnight.
 */

import { getPlanetData } from "@/lib/astro/ephemeris";
import { essentialDignity } from "@/lib/chartAnalysis";
import { getMoonPhase, type MoonPhaseInfo } from "@/lib/celestialCalendar";
import { getMoonPhaseFraction } from "@/lib/astro/currentSky";
import {
  SIGNS, apparentLongitude, exactAspectsBetween, moonIngressesBetween, voidOfCourseBetween,
  stationsBetween, retrogradeAt, localDayWindow, clockIn, ymdIn, hourIn,
  type ExactAspect, type VoidOfCourse, type SkyStation,
} from "@/lib/astro/skyCalendar";

// ─── Types ─────────────────────────────────────────────────────────────────

export type Planet = "Sun" | "Moon" | "Mercury" | "Venus" | "Mars" | "Jupiter" | "Saturn";
type Body = Planet | "Uranus" | "Neptune" | "Pluto";
type Role = "significator" | "helper" | "strain" | "other";

export interface CategoryDefinition {
  id: string;
  name: string;
  domain: string;
  description: string;
  isBase: boolean;
  /** The planet whose real condition is read. "Moon" = Moon-led (no separate dignity factor). */
  planet: Planet;
  /** Other bodies whose contacts count, and how. */
  helpers: Body[];
  strains: Body[];
  /** Moon signs tradition pairs with this activity, and ones it finds a poor fit. */
  moonSigns: { favorable: string[]; unfavorable: string[] };
  /** Short phrase used in reasons: "talking things through". */
  theme: string;
  phase: "waxing" | "waning" | null;
  voc: "drags" | "helps" | "neutral";
  retrograde: "drags" | "neutral";
}

export interface CategoryReason {
  /** The real configuration: "Venus in Libra, its own sign", "Moon trine Venus, exact 3:12 PM". */
  label: string;
  /** One plain-English line on what tradition makes of it. */
  note: string;
  effect: "helps" | "neutral" | "drags";
  weight: number;
  kind: "planet" | "motion" | "moon" | "phase" | "void" | "aspect";
  at?: Date;
}

export interface CategoryWindow {
  start: string;
  end: string;
  startAt: Date;
  endAt: Date;
  reason: string;
}

export type CategoryTier = "favorable" | "mixed" | "quiet";

export interface CategoryReading {
  id: string;
  name: string;
  scored: boolean;
  score: number;
  tier: CategoryTier;
  word: "Favorable" | "Mixed" | "Quiet";
  /** 2–4 reasons for display, the significator first. */
  reasons: CategoryReason[];
  /** Every factor that went into the score. */
  factors: CategoryReason[];
  bestWindow: CategoryWindow | null;
  /** Why there is no window, when there isn't one. */
  windowNote: string | null;
  /** Custom categories: which built-in profile the name was read like. */
  readAs: string | null;
}

/** One line under every score, wherever it is shown. */
export const SCORE_EXPLAINER =
  "Scores read the sky's weather for each kind of thing today — the real Moon, planets and aspects — not what will happen.";

export const TIER_WORD: Record<CategoryTier, CategoryReading["word"]> = {
  favorable: "Favorable", mixed: "Mixed", quiet: "Quiet",
};

export function tierFor(score: number): CategoryTier {
  return score >= 6.5 ? "favorable" : score < 4.5 ? "quiet" : "mixed";
}

// ─── Categories ────────────────────────────────────────────────────────────

type Def = Omit<CategoryDefinition, "isBase" | "domain"> & { domain?: string };

const c = (d: Def, domain: string, isBase = false): CategoryDefinition => ({ ...d, domain: d.domain ?? domain, isBase });

const BASE: Def[] = [
  {
    id: "communication", name: "Communication", description: "Emails, hard conversations, launches",
    planet: "Mercury", helpers: ["Jupiter", "Venus"], strains: ["Saturn", "Mars"],
    moonSigns: { favorable: ["Gemini", "Libra", "Aquarius"], unfavorable: ["Scorpio", "Capricorn"] },
    theme: "talking and writing things through", phase: "waxing", voc: "drags", retrograde: "drags",
  },
  {
    id: "love", name: "Love", description: "Dates, conversations, reconciliation, connection",
    planet: "Venus", helpers: ["Jupiter", "Mars"], strains: ["Saturn"],
    moonSigns: { favorable: ["Cancer", "Libra", "Taurus", "Pisces"], unfavorable: ["Capricorn", "Aquarius"] },
    theme: "connection and closeness", phase: "waxing", voc: "drags", retrograde: "drags",
  },
  {
    id: "body", name: "Body", description: "Haircuts, starting routines, workouts",
    planet: "Mars", helpers: ["Sun", "Jupiter"], strains: ["Saturn"],
    moonSigns: { favorable: ["Aries", "Leo", "Sagittarius", "Virgo"], unfavorable: ["Pisces", "Cancer"] },
    theme: "movement and physical routines", phase: "waxing", voc: "drags", retrograde: "drags",
  },
  {
    id: "rest", name: "Rest", description: "When to push, when to retreat, recovery windows",
    planet: "Moon", helpers: ["Venus", "Jupiter", "Neptune"], strains: ["Mars", "Uranus"],
    moonSigns: { favorable: ["Cancer", "Pisces", "Taurus"], unfavorable: ["Aries", "Gemini", "Sagittarius"] },
    theme: "slowing down", phase: "waning", voc: "helps", retrograde: "neutral",
  },
  {
    // Venus as the planet of the arts; Neptune (imagination) and the Sun (the
    // natural fifth house's ruler, Leo) as helpers. A void Moon doesn't lower
    // it — absorbed making is not a fresh start — and a Venus retrograde is
    // mentioned but not counted: revising is creative work too.
    id: "creativity", name: "Creativity", description: "Writing, making, music, sketching, starting a creative project",
    planet: "Venus", helpers: ["Neptune", "Jupiter", "Sun"], strains: ["Saturn"],
    moonSigns: { favorable: ["Leo", "Pisces", "Taurus", "Libra"], unfavorable: ["Virgo", "Capricorn"] },
    theme: "making things", phase: "waxing", voc: "neutral", retrograde: "neutral",
  },
];

const EXPANDED: [string, Def[]][] = [
  ["Work", [
    { id: "negotiation", name: "Negotiation", description: "Asking for what you want, give-and-take, boundary setting",
      planet: "Mercury", helpers: ["Jupiter", "Mars"], strains: ["Saturn"],
      moonSigns: { favorable: ["Capricorn", "Libra", "Scorpio"], unfavorable: ["Pisces", "Cancer"] },
      theme: "give-and-take", phase: null, voc: "drags", retrograde: "drags" },
    { id: "public-speaking", name: "Public speaking", description: "Talks, panels, pitches, toasts",
      planet: "Mercury", helpers: ["Sun", "Jupiter"], strains: ["Saturn"],
      moonSigns: { favorable: ["Leo", "Gemini", "Sagittarius"], unfavorable: ["Scorpio", "Capricorn"] },
      theme: "speaking in front of people", phase: "waxing", voc: "drags", retrograde: "drags" },
    { id: "launches", name: "Launches", description: "Announcements, reveals, putting something out",
      planet: "Mercury", helpers: ["Jupiter", "Sun"], strains: ["Saturn"],
      moonSigns: { favorable: ["Aries", "Leo", "Aquarius"], unfavorable: ["Scorpio", "Capricorn"] },
      theme: "putting something new out", phase: "waxing", voc: "drags", retrograde: "drags" },
    { id: "networking", name: "Networking", description: "Meetups, LinkedIn, cold outreach",
      planet: "Mercury", helpers: ["Venus", "Jupiter"], strains: ["Saturn"],
      moonSigns: { favorable: ["Gemini", "Libra", "Leo"], unfavorable: ["Scorpio", "Capricorn", "Pisces"] },
      theme: "meeting and reaching out", phase: "waxing", voc: "drags", retrograde: "drags" },
    { id: "job-searching", name: "Job searching", description: "Applications, interviews, portfolio updates",
      planet: "Mercury", helpers: ["Saturn", "Jupiter"], strains: ["Mars"],
      moonSigns: { favorable: ["Capricorn", "Virgo", "Taurus"], unfavorable: ["Pisces", "Sagittarius"] },
      theme: "applications and interviews", phase: null, voc: "drags", retrograde: "drags" },
    { id: "asking-for-feedback", name: "Asking for feedback", description: "Reviews, critiques, honest input",
      planet: "Mercury", helpers: ["Saturn", "Jupiter"], strains: ["Mars"],
      moonSigns: { favorable: ["Virgo", "Libra", "Aquarius"], unfavorable: ["Leo", "Aries"] },
      theme: "asking for honest input", phase: null, voc: "neutral", retrograde: "neutral" },
    { id: "presentations", name: "Presentations", description: "Slides, demos, show-and-tell",
      planet: "Mercury", helpers: ["Sun", "Jupiter"], strains: ["Saturn"],
      moonSigns: { favorable: ["Leo", "Gemini", "Libra"], unfavorable: ["Scorpio", "Capricorn"] },
      theme: "presenting your work", phase: "waxing", voc: "drags", retrograde: "drags" },
  ]],
  ["Relationships", [
    { id: "first-dates", name: "First dates", description: "Meeting someone new, sparks, chemistry",
      planet: "Venus", helpers: ["Mars", "Jupiter"], strains: ["Saturn"],
      moonSigns: { favorable: ["Libra", "Leo", "Gemini", "Taurus"], unfavorable: ["Capricorn", "Virgo", "Scorpio"] },
      theme: "meeting someone new", phase: "waxing", voc: "drags", retrograde: "drags" },
    { id: "dtr-conversations", name: "DTR conversations", description: "Defining the relationship, labels, clarity",
      planet: "Mercury", helpers: ["Venus", "Jupiter"], strains: ["Saturn"],
      moonSigns: { favorable: ["Libra", "Cancer", "Taurus"], unfavorable: ["Aquarius", "Sagittarius"] },
      theme: "talking about where things stand", phase: null, voc: "drags", retrograde: "drags" },
    { id: "meeting-parents", name: "Meeting parents", description: "Family introductions, in-laws, milestones",
      planet: "Venus", helpers: ["Saturn", "Jupiter"], strains: ["Mars"],
      moonSigns: { favorable: ["Cancer", "Taurus", "Virgo", "Libra"], unfavorable: ["Aries", "Aquarius", "Sagittarius"] },
      theme: "family introductions", phase: null, voc: "drags", retrograde: "drags" },
    { id: "hard-conversations", name: "Hard conversations", description: "Boundaries, truth-telling, repair bids",
      planet: "Mercury", helpers: ["Jupiter", "Saturn", "Pluto"], strains: ["Mars"],
      moonSigns: { favorable: ["Scorpio", "Capricorn", "Virgo"], unfavorable: ["Pisces", "Libra"] },
      theme: "saying the difficult thing", phase: null, voc: "neutral", retrograde: "drags" },
    { id: "reconciliation", name: "Reconciliation", description: "Making up, forgiveness, rebuilding trust",
      planet: "Venus", helpers: ["Jupiter", "Neptune"], strains: ["Saturn", "Mars"],
      moonSigns: { favorable: ["Pisces", "Cancer", "Libra"], unfavorable: ["Aries", "Scorpio", "Capricorn"] },
      theme: "making up", phase: "waning", voc: "neutral", retrograde: "neutral" },
    { id: "hosting", name: "Hosting", description: "Dinner parties, gatherings, having people over",
      planet: "Venus", helpers: ["Jupiter"], strains: ["Saturn"],
      moonSigns: { favorable: ["Cancer", "Taurus", "Leo", "Libra"], unfavorable: ["Capricorn", "Scorpio"] },
      theme: "having people over", phase: "waxing", voc: "neutral", retrograde: "neutral" },
    { id: "friend-repair", name: "Friend repair", description: "Reconnecting, apologies, reaching out",
      planet: "Venus", helpers: ["Mercury", "Jupiter"], strains: ["Saturn"],
      moonSigns: { favorable: ["Aquarius", "Libra", "Gemini"], unfavorable: ["Scorpio", "Capricorn"] },
      theme: "reaching back out", phase: null, voc: "neutral", retrograde: "neutral" },
  ]],
  ["Body", [
    // Venus for appearance; a Venus retrograde is the one stretch tradition
    // most often says to leave your look alone, so it counts here.
    { id: "haircuts", name: "Haircuts", description: "Cuts, color, bang trims, big changes",
      planet: "Venus", helpers: ["Jupiter"], strains: ["Saturn"],
      moonSigns: { favorable: ["Leo", "Virgo", "Libra"], unfavorable: ["Scorpio", "Pisces", "Cancer"] },
      theme: "a cut or a change of look", phase: "waxing", voc: "drags", retrograde: "drags" },
    { id: "starting-workouts", name: "Starting workouts", description: "New gym plans, running programs, classes",
      planet: "Mars", helpers: ["Sun", "Jupiter"], strains: ["Saturn"],
      moonSigns: { favorable: ["Aries", "Leo", "Sagittarius"], unfavorable: ["Pisces", "Cancer", "Taurus"] },
      theme: "starting a training routine", phase: "waxing", voc: "drags", retrograde: "drags" },
    { id: "tattoo-appointments", name: "Tattoo appointments", description: "Ink and piercings",
      planet: "Mars", helpers: ["Venus", "Jupiter"], strains: ["Saturn"],
      moonSigns: { favorable: ["Leo", "Scorpio", "Aries"], unfavorable: ["Pisces", "Cancer", "Virgo"] },
      theme: "getting ink", phase: null, voc: "drags", retrograde: "drags" },
  ]],
  ["Home", [
    { id: "moving", name: "Moving", description: "Relocating, packing, settling in",
      planet: "Mercury", helpers: ["Saturn", "Jupiter"], strains: ["Uranus"],
      moonSigns: { favorable: ["Cancer", "Taurus", "Virgo"], unfavorable: ["Aries", "Sagittarius", "Gemini"] },
      theme: "packing up and settling in", phase: null, voc: "drags", retrograde: "drags" },
    { id: "deep-cleaning", name: "Deep cleaning", description: "Decluttering, organizing, purging",
      planet: "Moon", helpers: ["Saturn", "Mars", "Pluto"], strains: ["Neptune"],
      moonSigns: { favorable: ["Virgo", "Capricorn", "Scorpio"], unfavorable: ["Pisces", "Sagittarius"] },
      theme: "clearing and organizing", phase: "waning", voc: "neutral", retrograde: "neutral" },
    { id: "renovations", name: "Renovations", description: "Remodeling, construction, big upgrades",
      planet: "Mars", helpers: ["Saturn", "Jupiter"], strains: ["Uranus"],
      moonSigns: { favorable: ["Taurus", "Capricorn", "Virgo"], unfavorable: ["Pisces", "Gemini"] },
      theme: "building and remodeling", phase: "waxing", voc: "drags", retrograde: "drags" },
    { id: "planting", name: "Planting", description: "Garden starts, seeds, transplants",
      planet: "Moon", helpers: ["Venus", "Jupiter"], strains: ["Saturn", "Mars"],
      moonSigns: { favorable: ["Cancer", "Scorpio", "Pisces", "Taurus"], unfavorable: ["Aries", "Leo", "Gemini"] },
      theme: "sowing and transplanting", phase: "waxing", voc: "drags", retrograde: "neutral" },
  ]],
  ["Creative", [
    { id: "publishing", name: "Publishing", description: "Books, articles, newsletters, posts",
      planet: "Mercury", helpers: ["Jupiter", "Sun"], strains: ["Saturn"],
      moonSigns: { favorable: ["Gemini", "Sagittarius", "Leo"], unfavorable: ["Scorpio", "Capricorn"] },
      theme: "putting writing out", phase: "waxing", voc: "drags", retrograde: "drags" },
    { id: "performing", name: "Performing", description: "Gigs, shows, open mics, recitals",
      planet: "Sun", helpers: ["Venus", "Jupiter", "Mars"], strains: ["Saturn"],
      moonSigns: { favorable: ["Leo", "Aries", "Sagittarius", "Gemini"], unfavorable: ["Capricorn", "Virgo"] },
      theme: "being on stage", phase: "waxing", voc: "drags", retrograde: "neutral" },
    { id: "recording", name: "Recording", description: "Music, podcasts, voiceovers, demos",
      planet: "Mercury", helpers: ["Venus", "Neptune"], strains: ["Saturn"],
      moonSigns: { favorable: ["Pisces", "Libra", "Taurus"], unfavorable: ["Aries", "Gemini"] },
      theme: "recording", phase: null, voc: "neutral", retrograde: "drags" },
    { id: "photo-shoots", name: "Photo shoots", description: "Portraits, headshots, content shoots",
      planet: "Venus", helpers: ["Sun", "Jupiter", "Neptune"], strains: ["Saturn"],
      moonSigns: { favorable: ["Leo", "Libra", "Taurus"], unfavorable: ["Capricorn", "Scorpio"] },
      theme: "being in front of the camera", phase: "waxing", voc: "neutral", retrograde: "drags" },
    { id: "starting-projects", name: "Starting projects", description: "Fresh canvases, blank pages, new ideas",
      planet: "Mars", helpers: ["Sun", "Jupiter"], strains: ["Saturn"],
      moonSigns: { favorable: ["Aries", "Leo", "Aquarius", "Gemini"], unfavorable: ["Capricorn", "Virgo"] },
      theme: "beginning something new", phase: "waxing", voc: "drags", retrograde: "drags" },
    { id: "finishing-projects", name: "Finishing projects", description: "Final edits, shipping, wrapping up",
      planet: "Saturn", helpers: ["Mercury", "Mars", "Jupiter"], strains: ["Neptune"],
      moonSigns: { favorable: ["Virgo", "Capricorn", "Scorpio"], unfavorable: ["Aries", "Gemini"] },
      theme: "wrapping up", phase: "waning", voc: "neutral", retrograde: "neutral" },
  ]],
  ["Travel", [
    // No Mars or Uranus "strain" on the travel categories: on a trip a tense
    // contact reads as a hazard, and the almanac does not predict harm.
    { id: "starting-trips", name: "Starting trips", description: "Departures, road trips, first days",
      planet: "Mercury", helpers: ["Jupiter", "Venus"], strains: ["Saturn"],
      moonSigns: { favorable: ["Sagittarius", "Gemini", "Aries"], unfavorable: ["Cancer", "Taurus"] },
      theme: "setting off", phase: "waxing", voc: "drags", retrograde: "drags" },
    { id: "booking-travel", name: "Booking travel", description: "Flights, hotels, planning itineraries",
      planet: "Mercury", helpers: ["Jupiter"], strains: ["Saturn"],
      moonSigns: { favorable: ["Gemini", "Sagittarius", "Libra"], unfavorable: ["Cancer", "Capricorn"] },
      theme: "planning a trip", phase: null, voc: "drags", retrograde: "drags" },
    { id: "long-drives", name: "Long drives", description: "Road trips, cross-country, scenic routes",
      planet: "Mercury", helpers: ["Jupiter", "Venus"], strains: ["Saturn"],
      moonSigns: { favorable: ["Sagittarius", "Aries", "Gemini"], unfavorable: ["Cancer", "Pisces"] },
      theme: "time on the road", phase: null, voc: "neutral", retrograde: "neutral" },
    { id: "international-travel", name: "International travel", description: "Overseas trips, long journeys, new places",
      planet: "Jupiter", helpers: ["Mercury", "Sun"], strains: ["Saturn"],
      moonSigns: { favorable: ["Sagittarius", "Aquarius", "Gemini"], unfavorable: ["Cancer", "Taurus"] },
      theme: "long journeys", phase: "waxing", voc: "drags", retrograde: "neutral" },
  ]],
  ["Inner Work", [
    { id: "journaling", name: "Journaling", description: "Morning pages, reflection, processing",
      planet: "Mercury", helpers: ["Neptune", "Saturn"], strains: ["Mars"],
      moonSigns: { favorable: ["Pisces", "Cancer", "Scorpio"], unfavorable: ["Aries", "Leo"] },
      theme: "writing to reflect", phase: "waning", voc: "helps", retrograde: "neutral" },
    { id: "shadow-work", name: "Shadow work", description: "Noticing patterns, integration, depth",
      planet: "Moon", helpers: ["Pluto", "Saturn"], strains: ["Mars"],
      moonSigns: { favorable: ["Scorpio", "Pisces", "Capricorn"], unfavorable: ["Leo", "Aries", "Gemini"] },
      theme: "looking at your patterns", phase: "waning", voc: "helps", retrograde: "neutral" },
    { id: "dream-work", name: "Dream work", description: "Dream journals, symbols, interpretation",
      planet: "Moon", helpers: ["Neptune", "Jupiter"], strains: ["Saturn"],
      moonSigns: { favorable: ["Pisces", "Cancer", "Scorpio"], unfavorable: ["Virgo", "Capricorn", "Gemini"] },
      theme: "paying attention to dreams", phase: null, voc: "helps", retrograde: "neutral" },
    { id: "ancestral-work", name: "Ancestral work", description: "Family history, lineage, inherited stories",
      planet: "Moon", helpers: ["Saturn", "Pluto", "Neptune"], strains: ["Uranus"],
      moonSigns: { favorable: ["Cancer", "Scorpio", "Pisces", "Capricorn"], unfavorable: ["Aries", "Gemini"] },
      theme: "family history", phase: "waning", voc: "helps", retrograde: "neutral" },
    // Moved here when the Recovery domain was removed — a new routine, not a
    // willpower forecast.
    { id: "starting-habits", name: "Starting habits", description: "New routines, streaks, consistency",
      planet: "Mars", helpers: ["Saturn", "Sun"], strains: ["Neptune"],
      moonSigns: { favorable: ["Aries", "Virgo", "Capricorn", "Taurus"], unfavorable: ["Pisces", "Sagittarius", "Gemini"] },
      theme: "starting a new routine", phase: "waxing", voc: "drags", retrograde: "drags" },
  ]],
];

const DEFINITIONS: CategoryDefinition[] = [
  ...BASE.map((d) => c(d, "Base", true)),
  ...EXPANDED.flatMap(([domain, defs]) => defs.map((d) => c(d, domain))),
];

/**
 * Categories that were in the library and are gone on purpose. A saved list
 * that still holds one drops it on load. The Recovery domain timed
 * addiction-adjacent behaviour ("low-willpower days … avoid temptation") by
 * the sky; the money, medical and legal ones went earlier.
 */
export const REMOVED_CATEGORIES = new Set(["high-willpower-days", "low-willpower-days", "breaking-habits"]);

export function getCategoryDefinitions(): CategoryDefinition[] {
  return DEFINITIONS;
}

/**
 * Topics the almanac never scores by the sky: medical care, medication,
 * procedures and screenings, therapy appointments, money decisions
 * (investing, loans, debt, big purchases), legal or contractual ones, and
 * addiction, recovery and dieting. A real decision with real consequences does
 * not get made by a transit, and "a low-willpower day" is not something to
 * hand someone in recovery.
 *
 * Catches a removed category still saved in someone's list, and the same
 * topics typed in as a custom category.
 */
const UNSCORED_TOPIC = new RegExp([
  "surg", "operation", "procedur", "medic", "prescri", "pill", "dose", "dental", "dentist", "teeth", "tooth",
  "doctor", "clinic", "hospital", "screening", "mammogram", "biopsy", "vaccin", "treatment", "therap",
  "chemo", "diagnos", "health", "iud", "ivf", "fertility", "pregnan", "abortion",
  "money", "invest", "stock", "crypto", "loan", "mortgage", "debt", "credit", "financ", "budget",
  "salary", "purchase", "buying", "buy-", "property", "real-estate", "tax", "retire", "business",
  "contract", "lease", "signing", "legal", "lawyer", "lawsuit", "court", "divorce", "visa", "immigra",
  "willpower", "breaking-habit", "addict", "sober", "sobriety", "relapse", "recovery", "craving", "alcohol",
  "drinking", "smoking", "vaping", "nicotine", "gambl", "detox", "diet", "fasting", "weight-loss", "calorie",
].join("|"));

export function isUnscoredTopic(categoryId: string): boolean {
  const id = categoryId.toLowerCase();
  return REMOVED_CATEGORIES.has(id) || UNSCORED_TOPIC.test(id);
}

/** A custom category's name, read as the built-in profile its words point to. */
const KEYWORD_PROFILES: { keywords: string[]; profile: string }[] = [
  { keywords: ["film", "video", "tiktok", "youtube", "camera", "photo", "picture", "selfie", "content", "stream"], profile: "photo-shoots" },
  { keywords: ["perform", "stage", "show", "gig", "sing", "concert"], profile: "performing" },
  { keywords: ["paint", "draw", "art", "design", "craft", "sketch", "music", "song", "poem", "poetry", "creat"], profile: "creativity" },
  { keywords: ["write", "writing", "blog", "newsletter", "post", "publish", "book"], profile: "publishing" },
  { keywords: ["call", "talk", "speak", "email", "text", "pitch", "interview", "chat", "study", "learn", "read", "class", "exam"], profile: "communication" },
  { keywords: ["network", "meet", "connect", "social", "friend", "party"], profile: "networking" },
  { keywords: ["gym", "workout", "exercise", "run", "lift", "sport", "hike", "swim", "yoga", "dance", "train", "fitness", "pilates"], profile: "starting-workouts" },
  { keywords: ["rest", "sleep", "nap", "relax", "meditat", "spa", "bath", "quiet", "calm", "slow"], profile: "rest" },
  { keywords: ["journal", "reflect", "ritual", "tarot", "spirit", "pray", "altar", "manifest", "moon", "crystal"], profile: "journaling" },
  { keywords: ["dream"], profile: "dream-work" },
  { keywords: ["love", "date", "romance", "relationship", "partner", "flirt", "crush"], profile: "love" },
  { keywords: ["clean", "organiz", "declutter", "tidy", "laundry"], profile: "deep-cleaning" },
  { keywords: ["garden", "plant", "seed", "grow"], profile: "planting" },
  { keywords: ["cook", "bake", "host", "dinner", "home", "decorat", "nest"], profile: "hosting" },
  { keywords: ["travel", "trip", "adventure", "explore", "drive", "fly", "vacation", "road", "camp"], profile: "starting-trips" },
  { keywords: ["hair", "nail", "makeup", "beauty", "style", "fashion", "outfit"], profile: "haircuts" },
  { keywords: ["project", "start", "begin", "launch", "new"], profile: "starting-projects" },
  { keywords: ["finish", "edit", "wrap", "complete", "ship"], profile: "finishing-projects" },
];

/** No word matched: the Moon and the benefics/malefics, nothing planet-specific. */
const GENERAL: CategoryDefinition = {
  id: "general", name: "General", domain: "Custom", description: "", isBase: false,
  planet: "Moon", helpers: ["Venus", "Jupiter"], strains: ["Saturn", "Mars"],
  moonSigns: { favorable: [], unfavorable: [] }, theme: "this", phase: null, voc: "neutral", retrograde: "neutral",
};

function profileFor(categoryId: string): { def: CategoryDefinition; readAs: string | null } {
  const def = DEFINITIONS.find((d) => d.id === categoryId);
  if (def) return { def, readAs: null };
  // Keywords match the start of a word, so "art" finds "artwork" but not
  // "party" or "start".
  const words = categoryId.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
  for (const k of KEYWORD_PROFILES) {
    if (k.keywords.some((kw) => words.some((w) => w.startsWith(kw)))) {
      const p = DEFINITIONS.find((d) => d.id === k.profile)!;
      return { def: p, readAs: p.name };
    }
  }
  return { def: GENERAL, readAs: "General" };
}

// ─── Day facts (computed once per local day and zone) ──────────────────────

const HOUR = 3600 * 1000;
const DAY = 24 * HOUR;
const WAKE_START_H = 7;
const WAKE_END_H = 22;

const PLANETS: Planet[] = ["Sun", "Mercury", "Venus", "Mars", "Jupiter", "Saturn"];

const KEYWORD: Record<string, string> = {
  Sun: "visibility and vitality", Moon: "mood and instinct", Mercury: "words and thinking",
  Venus: "connection and pleasure", Mars: "drive and heat", Jupiter: "generosity and room to grow",
  Saturn: "limits and effort", Uranus: "the unexpected", Neptune: "imagination and softness",
  Pluto: "depth and intensity",
};

interface PlanetState {
  name: Planet;
  sign: string;
  dignity: ReturnType<typeof essentialDignity>;
  retrograde: boolean;
  stationary: boolean;
  /** Station inside the local day. */
  stationToday: SkyStation | null;
  /** Nearest station within a day either side (for "stationary" wording). */
  stationNear: SkyStation | null;
  /** When the current retrograde ends. */
  rxEnd: Date | null;
  /** Sign change during the local day. */
  ingress: { at: Date; sign: string } | null;
}

interface DayFacts {
  tz: string | null;
  start: Date;
  end: Date;
  noon: Date;
  wakeStart: Date;
  wakeEnd: Date;
  moonSign: string;
  moonIngress: { at: Date; sign: string } | null;
  phase: MoonPhaseInfo;
  waxing: boolean;
  vocs: VoidOfCourse[];
  /** Moon aspects perfecting inside the local day. */
  moonAspects: ExactAspect[];
  /** Planet–planet aspects perfecting within a day either side of it. */
  planetAspects: ExactAspect[];
  planets: Record<Planet, PlanetState>;
}

const signOf = (lon: number) => SIGNS[Math.floor((((lon % 360) + 360) % 360) / 30) % 12];
const jdOf = (d: Date) => d.getTime() / DAY + 2440587.5;

/** The instant the local clock reads `h`:00 on this day (DST-safe to the hour). */
function wallClock(start: Date, h: number, tz: string | null): Date {
  let t = start.getTime() + h * HOUR;
  const off = hourIn(new Date(t), tz) - h;
  if (off !== 0 && Math.abs(off) <= 2) t -= off * HOUR;
  return new Date(t);
}

function bisectSign(planet: string, lo: number, hi: number): Date {
  const s0 = signOf(apparentLongitude(planet, new Date(lo)));
  while (hi - lo > 30 * 1000) {
    const mid = (lo + hi) / 2;
    if (signOf(apparentLongitude(planet, new Date(mid))) === s0) lo = mid; else hi = mid;
  }
  return new Date(hi);
}

const factsCache = new Map<string, DayFacts>();

function dayFacts(day: Date, tz: string | null): DayFacts {
  const key = `${day.getFullYear()}-${day.getMonth()}-${day.getDate()}|${tz ?? ""}`;
  const hit = factsCache.get(key);
  if (hit) return hit;

  const { start, end } = localDayWindow(day, tz);
  const noon = wallClock(start, 12, tz);
  const moonLon = apparentLongitude("Moon", noon);
  const ingress = moonIngressesBetween(start, end)[0] ?? null;
  const stations = stationsBetween(new Date(start.getTime() - DAY), new Date(end.getTime() + DAY));

  const planets = {} as Record<Planet, PlanetState>;
  for (const name of PLANETS) {
    const data = getPlanetData(jdOf(noon), name);
    const sign = signOf(data.longitude);
    const sStart = signOf(apparentLongitude(name, start));
    const sEnd = signOf(apparentLongitude(name, end));
    const rx = data.retrograde ? retrogradeAt(name, noon) : null;
    planets[name] = {
      name,
      sign,
      dignity: essentialDignity(name, sign),
      retrograde: data.retrograde,
      stationary: data.stationary,
      stationToday: stations.find((s) => s.planet === name && s.at >= start && s.at < end) ?? null,
      stationNear: stations.find((s) => s.planet === name) ?? null,
      rxEnd: rx?.end ?? null,
      ingress: sStart !== sEnd ? { at: bisectSign(name, start.getTime(), end.getTime()), sign: sEnd } : null,
    };
  }

  const facts: DayFacts = {
    tz,
    start, end, noon,
    wakeStart: wallClock(start, WAKE_START_H, tz),
    wakeEnd: wallClock(start, WAKE_END_H, tz),
    moonSign: signOf(moonLon),
    moonIngress: ingress ? { at: ingress.at, sign: ingress.sign } : null,
    phase: getMoonPhase(noon),
    waxing: getMoonPhaseFraction(noon) < 0.5,
    vocs: voidOfCourseBetween(start, end),
    moonAspects: exactAspectsBetween(start, end, "Moon"),
    planetAspects: exactAspectsBetween(new Date(start.getTime() - DAY), new Date(end.getTime() + DAY))
      .filter((a) => a.a !== "Moon"),
    planets,
  };
  if (factsCache.size > 400) factsCache.clear();
  factsCache.set(key, facts);
  return facts;
}

// ─── Wording helpers ───────────────────────────────────────────────────────

/** "3:12 PM", or "yesterday 11:02 PM" / "Tue 4:10 AM" when the instant is on another local day. */
function when(at: Date, F: DayFacts): string {
  const clock = clockIn(at, F.tz);
  if (at >= F.start && at < F.end) return clock;
  if (at < F.start && at.getTime() >= F.start.getTime() - DAY) return `yesterday ${clock}`;
  if (at >= F.end && at.getTime() < F.end.getTime() + DAY) return `tomorrow ${clock}`;
  const { y, m, d } = ymdIn(at, F.tz);
  return `${new Date(y, m, d).toLocaleDateString("en-US", { month: "short", day: "numeric" })} ${clock}`;
}

function shortDate(at: Date, F: DayFacts): string {
  const { y, m, d } = ymdIn(at, F.tz);
  return new Date(y, m, d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const effectOf = (w: number): CategoryReason["effect"] => (w > 0.001 ? "helps" : w < -0.001 ? "drags" : "neutral");
const r2 = (x: number) => Math.round(x * 100) / 100;

// ─── Factors ───────────────────────────────────────────────────────────────

const DIGNITY_WEIGHT = { domicile: 1.5, exaltation: 1.25, peregrine: 0, detriment: -1.25, fall: -1.5 } as const;

function planetFactor(def: CategoryDefinition, F: DayFacts): CategoryReason | null {
  if (def.planet === "Moon") return null;
  const p = F.planets[def.planet];
  const name = def.planet;
  const label = {
    domicile: name === "Mercury" && p.sign === "Virgo" ? `${name} in ${p.sign}, its own sign and exaltation` : `${name} in ${p.sign}, its own sign`,
    exaltation: `${name} in ${p.sign}, where it is exalted`,
    detriment: `${name} in ${p.sign}, its detriment`,
    fall: `${name} in ${p.sign}, its fall`,
    peregrine: `${name} in ${p.sign}`,
  }[p.dignity];
  let note = {
    domicile: `${name}, planet of ${KEYWORD[name]}, is at full strength by sign.`,
    exaltation: `${name}, planet of ${KEYWORD[name]}, is honored here — one of its strongest signs.`,
    detriment: `${name}, planet of ${KEYWORD[name]}, works against the grain of this sign.`,
    fall: `${name}, planet of ${KEYWORD[name]}, is at its weakest by sign.`,
    peregrine: `No special strength or weakness by sign for ${name}, planet of ${KEYWORD[name]}.`,
  }[p.dignity];
  if (p.ingress) note += ` It enters ${p.ingress.sign} at ${when(p.ingress.at, F)}.`;
  const w = DIGNITY_WEIGHT[p.dignity];
  return { label, note, weight: w, effect: effectOf(w), kind: "planet" };
}

function motionFactor(def: CategoryDefinition, F: DayFacts): CategoryReason | null {
  if (def.planet === "Moon" || def.planet === "Sun") return null;
  const p = F.planets[def.planet];
  const counts = def.retrograde === "drags";
  if (p.stationToday) {
    const s = p.stationToday;
    const w = counts ? -1 : 0;
    return {
      label: `${def.planet} stations ${s.direction} today, exact ${when(s.at, F)}`,
      note: counts
        ? `A planet standing still — tradition reads its themes as loud and slow to move; a day for care over speed.`
        : `A planet standing still — its themes are loud today, which this kind of work can use.`,
      weight: w, effect: effectOf(w), kind: "motion", at: s.at,
    };
  }
  if (p.retrograde) {
    const w = counts ? -1 : 0;
    return {
      label: `${def.planet} retrograde in ${p.sign}${p.rxEnd ? `, until ${shortDate(p.rxEnd, F)}` : ""}`,
      note: counts
        ? "Tradition reads a retrograde as a time for revisiting and review more than first attempts."
        : "Tradition reads a retrograde as a time for revisiting — which suits this kind of work.",
      weight: w, effect: effectOf(w), kind: "motion",
    };
  }
  if (p.stationary && p.stationNear) {
    const w = counts ? -0.5 : 0;
    return {
      label: `${def.planet} stationary, turning ${p.stationNear.direction} ${when(p.stationNear.at, F)}`,
      note: "Moving very slowly near its station — tradition reads its themes as heavy and deliberate.",
      weight: w, effect: effectOf(w), kind: "motion", at: p.stationNear.at,
    };
  }
  return null;
}

function moonFactor(def: CategoryDefinition, F: DayFacts): CategoryReason {
  const sign = F.moonSign;
  const fav = def.moonSigns.favorable.includes(sign);
  const unfav = def.moonSigns.unfavorable.includes(sign);
  const w = fav ? 1.25 : unfav ? -1.25 : 0;
  let label = `Moon in ${sign}`;
  if (F.moonIngress) {
    label = F.moonIngress.at <= F.noon
      ? `Moon enters ${F.moonIngress.sign} at ${when(F.moonIngress.at, F)}`
      : `Moon in ${sign} until ${when(F.moonIngress.at, F)}`;
  }
  const theme = def.theme;
  const note = def === GENERAL
    ? `${sign}'s mood colors the day.`
    : fav ? `A sign tradition pairs with ${theme}.`
    : unfav ? `A sign tradition finds a less natural fit for ${theme}.`
    : `Neither a natural fit nor a poor one for ${theme}.`;
  return { label, note, weight: w, effect: effectOf(w), kind: "moon" };
}

function phaseFactor(def: CategoryDefinition, F: DayFacts): CategoryReason {
  const label = `${F.phase.label}, ${Math.round(F.phase.illumination)}% lit`;
  if (!def.phase) {
    return { label, note: `${F.waxing ? "Growing" : "Waning"} light — the phase doesn't weigh on this either way.`, weight: 0, effect: "neutral", kind: "phase" };
  }
  const matched = (def.phase === "waxing") === F.waxing;
  const w = matched ? 0.75 : -0.5;
  const note = F.waxing
    ? (def.phase === "waxing" ? "Growing light — tradition's time for beginnings and building." : "Growing light — tradition saves clearing and slowing down for the waning Moon.")
    : (def.phase === "waning" ? "Waning light — tradition's time for finishing, clearing and rest." : "Waning light — tradition saves beginnings for the growing Moon.");
  return { label, note, weight: w, effect: effectOf(w), kind: "phase" };
}

function overlap(a0: Date, a1: Date, b0: Date, b1: Date): number {
  return Math.max(0, Math.min(a1.getTime(), b1.getTime()) - Math.max(a0.getTime(), b0.getTime()));
}

function vocFactor(def: CategoryDefinition, F: DayFacts): CategoryReason | null {
  const voc = F.vocs[0];
  if (!voc) return null;
  const label = `Moon void of course ${when(voc.start, F)} – ${when(voc.end, F)}`;
  const awake = F.wakeEnd.getTime() - F.wakeStart.getTime();
  const frac = F.vocs.reduce((s, v) => s + overlap(v.start, v.end, F.wakeStart, F.wakeEnd), 0) / awake;
  if (frac <= 0) {
    return { label, note: "The void stretch falls outside waking hours (7 AM – 10 PM).", weight: 0, effect: "neutral", kind: "void", at: voc.start };
  }
  const w = def.voc === "drags" ? -(0.5 + frac) : def.voc === "helps" ? 0.25 + 0.75 * frac : 0;
  const note = def.voc === "drags"
    ? "Tradition treats the void Moon as a pause — better for routine than for fresh starts."
    : def.voc === "helps"
    ? "Tradition treats the void Moon as a pause, which suits this."
    : "Tradition treats the void Moon as a pause; it doesn't weigh on this kind of thing.";
  return { label, note, weight: r2(w), effect: effectOf(w), kind: "void", at: voc.start };
}

const ASPECT_WEIGHT: Record<Role, { soft: number; conj: number; hard: number }> = {
  significator: { soft: 0.75, conj: 0.5, hard: -0.6 },
  helper: { soft: 0.75, conj: 0.75, hard: -0.25 },
  strain: { soft: 0.25, conj: -0.75, hard: -0.9 },
  other: { soft: 0.4, conj: 0, hard: -0.4 },
};

function roleOf(def: CategoryDefinition, body: string): Role | null {
  if (body === def.planet) return "significator";
  if ((def.helpers as string[]).includes(body)) return "helper";
  if ((def.strains as string[]).includes(body)) return "strain";
  return null;
}

/** "Moon conjunct Venus", "Moon opposite Saturn" — how astrologers say it. */
const ASPECT_VERB: Record<string, string> = { conjunction: "conjunct", opposition: "opposite", trine: "trine", square: "square", sextile: "sextile" };

function aspectNote(role: Role, aspect: string, other: string): string {
  const soft = aspect === "trine" || aspect === "sextile";
  const conj = aspect === "conjunction";
  const k = KEYWORD[other];
  if (role === "strain") {
    if (soft) return `A steadying contact with ${other}, planet of ${k}.`;
    return `${other}, planet of ${k}, presses on it — tradition reads friction here.`;
  }
  if (soft) return `An easy contact with ${other}, planet of ${k}.`;
  if (conj) return role === "other" ? `A meeting with ${other}, planet of ${k}.` : `A meeting with ${other}, planet of ${k} — its themes are close at hand.`;
  return role === "helper"
    ? `A tense contact, though with a gentler planet (${other}, ${k}).`
    : `A tense contact with ${other}, planet of ${k}.`;
}

function aspectFactors(def: CategoryDefinition, F: DayFacts): CategoryReason[] {
  const out: CategoryReason[] = [];
  const add = (first: string, second: string, aspect: string, at: Date, role: Role) => {
    const t = aspect === "trine" || aspect === "sextile" ? "soft" : aspect === "conjunction" ? "conj" : "hard";
    const w = ASPECT_WEIGHT[role][t];
    out.push({ label: `${first} ${ASPECT_VERB[aspect] ?? aspect} ${second}, exact ${when(at, F)}`, note: aspectNote(role, aspect, second), weight: w, effect: effectOf(w), kind: "aspect", at });
  };
  for (const a of F.moonAspects) {
    const role = roleOf(def, a.b);
    if (role) add("Moon", a.b, a.aspect, a.at, role);
  }
  if (def.planet !== "Moon") {
    for (const a of F.planetAspects) {
      if (a.a !== def.planet && a.b !== def.planet) continue;
      const other = a.a === def.planet ? a.b : a.a;
      add(def.planet, other, a.aspect, a.at, roleOf(def, other) ?? "other");
    }
  }
  const total = out.reduce((s, f) => s + f.weight, 0);
  if (Math.abs(total) > 2) {
    const k = 2 / Math.abs(total);
    for (const f of out) f.weight = r2(f.weight * k);
  }
  return out;
}

// ─── Best window ───────────────────────────────────────────────────────────

const MIN_WINDOW = 45 * 60 * 1000;

function bestWindow(def: CategoryDefinition, F: DayFacts, factors: CategoryReason[]): { window: CategoryWindow | null; note: string | null } {
  const mk = (s: Date, e: Date, reason: string): CategoryWindow => ({ start: clockIn(s, F.tz), end: clockIn(e, F.tz), startAt: s, endAt: e, reason });

  const vocStarts = F.vocs.map((v) => v.start.getTime());
  const supportive = factors
    .filter((f) => f.kind === "aspect" && f.weight > 0 && f.label.startsWith("Moon ") && f.at)
    .filter((f) => f.at! >= F.wakeStart && f.at!.getTime() <= F.wakeEnd.getTime() + HOUR)
    .sort((a, b) => b.weight - a.weight || a.at!.getTime() - b.at!.getTime());
  for (const f of supportive) {
    const at = f.at!.getTime();
    let s = Math.max(at - 2 * HOUR, F.wakeStart.getTime());
    let e = Math.min(at + HOUR, F.wakeEnd.getTime());
    // The void begins at the Moon's last aspect (to within the two searches' tolerance), so a window around that aspect ends where the void begins.
    for (const vs of vocStarts) if (vs >= at - 60 * 1000 && vs < e) e = Math.min(Math.max(vs, s), e);
    for (const v of F.vocs) if (v.end.getTime() > s && v.end.getTime() <= at) s = v.end.getTime();
    if (e - s >= MIN_WINDOW) {
      const config = f.label.replace(/, exact .*$/, "");
      return { window: mk(new Date(s), new Date(e), `Leading up to ${config} (exact ${clockIn(f.at!, F.tz)})`), note: null };
    }
  }

  const voidAwake = F.vocs
    .map((v) => ({ s: Math.max(v.start.getTime(), F.wakeStart.getTime()), e: Math.min(v.end.getTime(), F.wakeEnd.getTime()) }))
    .filter((x) => x.e - x.s > 0);
  if (def.voc === "helps") {
    const v = voidAwake.sort((a, b) => (b.e - b.s) - (a.e - a.s))[0];
    if (v && v.e - v.s >= MIN_WINDOW) return { window: mk(new Date(v.s), new Date(v.e), "The void-of-course Moon — tradition's pause"), note: null };
  }
  if (def.voc === "drags" && voidAwake.length > 0) {
    // Longest waking stretch outside the void periods.
    const cuts = [F.wakeStart.getTime(), ...voidAwake.flatMap((v) => [v.s, v.e]), F.wakeEnd.getTime()];
    let best: { s: number; e: number } | null = null;
    for (let i = 0; i < cuts.length; i += 2) {
      const s = cuts[i], e = cuts[i + 1];
      if (e - s > 0 && (!best || e - s > best.e - best.s)) best = { s, e };
    }
    if (best && best.e - best.s >= HOUR) {
      const before = voidAwake.some((v) => v.s >= best!.e - 1000);
      return { window: mk(new Date(best.s), new Date(best.e), before ? "Before the Moon goes void of course" : "After the void-of-course Moon ends"), note: null };
    }
  }
  return { window: null, note: "No single stretch stands out today — the sky reads about the same from morning to night." };
}

// ─── Reading ───────────────────────────────────────────────────────────────

function readProfile(def: CategoryDefinition, F: DayFacts): Omit<CategoryReading, "id" | "name" | "readAs"> {
  const planet = planetFactor(def, F);
  const moon = moonFactor(def, F);
  const phase = phaseFactor(def, F);
  const factors: CategoryReason[] = [
    ...(planet ? [planet] : []),
    ...[motionFactor(def, F), vocFactor(def, F)].filter((f): f is CategoryReason => !!f),
    moon, phase,
    ...aspectFactors(def, F),
  ];
  const sum = factors.reduce((s, f) => s + f.weight, 0);
  const score = Math.round(Math.max(1, Math.min(10, 5 + sum)) * 10) / 10;
  const tier = tierFor(score);

  // Reasons: the significator first (the Moon for Moon-led categories), then
  // the heaviest factors; zero-weight facts only to reach two.
  const lead = planet ?? moon;
  const rest = factors.filter((f) => f !== lead);
  const weighted = rest.filter((f) => f.weight !== 0).sort((a, b) => Math.abs(b.weight) - Math.abs(a.weight));
  const reasons = [lead, ...weighted].slice(0, 4);
  for (const f of rest) {
    if (reasons.length >= 2) break;
    if (!reasons.includes(f)) reasons.push(f);
  }
  const { window, note } = bestWindow(def, F, factors);
  return { scored: true, score, tier, word: TIER_WORD[tier], reasons, factors, bestWindow: window, windowNote: note };
}

export interface ReadOptions {
  /** IANA zone whose midnight bounds the day; runtime-local when omitted. */
  timeZone?: string | null;
  /** Display name for a custom category. */
  name?: string;
}

function displayName(id: string): string {
  return id.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

/** The full reading for one category on one local day. Deterministic: same inputs, same output. */
export function readCategoryForDay(categoryId: string, day: Date, opts: ReadOptions = {}): CategoryReading {
  const builtIn = DEFINITIONS.find((d) => d.id === categoryId);
  const name = builtIn?.name ?? opts.name ?? displayName(categoryId);
  if (!builtIn && isUnscoredTopic(categoryId)) {
    return {
      id: categoryId, name, scored: false, score: 5, tier: "mixed", word: "Mixed",
      reasons: [], factors: [], bestWindow: null, windowNote: "Not scored by the sky", readAs: null,
    };
  }
  const { def, readAs } = profileFor(categoryId);
  const reading = readProfile(def, dayFacts(day, opts.timeZone ?? null));
  if (readAs === "General") {
    reading.reasons = [...reading.reasons.slice(0, 3), {
      label: "Read from the Moon alone",
      note: `No planet is tied to “${name}”, so this reads the Moon's sign, phase and its contacts with Venus, Jupiter, Mars and Saturn.`,
      weight: 0, effect: "neutral", kind: "moon",
    }];
  }
  return { id: categoryId, name, readAs, ...reading };
}

/**
 * One number for the whole day: the mean of the five base categories. Used by
 * the week strip and the month calendar when no single category is chosen.
 */
export function overallDayScore(day: Date, timeZone?: string | null): number {
  const base = DEFINITIONS.filter((d) => d.isBase);
  const F = dayFacts(day, timeZone ?? null);
  const mean = base.reduce((s, d) => s + readProfile(d, F).score, 0) / base.length;
  return Math.round(mean * 10) / 10;
}

// ─── Activity detail (the "Good for" / "Hold off" lines) ───────────────────

/** Broad kinds the good-for list sorts its lines into, read as a built-in profile. */
export const ACTIVITY_PROFILE: Record<string, string> = {
  action: "starting-projects",
  communication: "communication",
  creativity: "creativity",
  patience: "rest",
  planning: "finishing-projects",
};

/**
 * The reading behind one "Good for today" / "Hold off on" line. The line is
 * on the list because of the Moon's sign (that is how the lists are built), so
 * the Moon factor says exactly that; every other factor is the real sky, read
 * through the profile for that kind of activity.
 */
export function readActivityForDay(activity: string, kind: keyof typeof ACTIVITY_PROFILE, type: "good" | "skip", day: Date, timeZone?: string | null): CategoryReading {
  const def = DEFINITIONS.find((d) => d.id === ACTIVITY_PROFILE[kind]) ?? GENERAL;
  const F = dayFacts(day, timeZone ?? null);
  const listed: CategoryDefinition = {
    ...def,
    moonSigns: type === "good" ? { favorable: [F.moonSign], unfavorable: [] } : { favorable: [], unfavorable: [F.moonSign] },
  };
  const reading = readProfile(listed, F);
  const moon = reading.factors.find((f) => f.kind === "moon");
  if (moon) {
    moon.note = type === "good"
      ? `This is on tradition's list for a ${F.moonSign} Moon.`
      : `Tradition lists this as an awkward fit for a ${F.moonSign} Moon.`;
  }
  return { id: activity, name: activity, readAs: def.name, ...reading };
}

/** The next day in the coming fortnight whose reading reaches `atLeast`, or null. */
export function nextDayAtLeast(categoryId: string, from: Date, atLeast: number, timeZone?: string | null): Date | null {
  for (let i = 1; i <= 14; i++) {
    const d = new Date(from.getFullYear(), from.getMonth(), from.getDate() + i);
    if (readCategoryForDay(categoryId, d, { timeZone }).score >= atLeast) return d;
  }
  return null;
}
