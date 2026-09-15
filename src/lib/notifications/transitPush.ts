/**
 * The personal-transit push, and the journal check-in built on top of it.
 *
 * Both answer the same question — "is a major transit exact against this
 * person's chart today?" — so they share one lookup rather than computing the
 * ephemeris twice. They live here rather than inside the cron route so they can
 * be tested at all.
 */

import { calculateTransits } from "@/lib/astro/calculateTransits";
import type { NotificationCategory } from "@/lib/notifications/catalogue";
import { copyFor, renderCopy, shortPoint } from "@/lib/notifications/copy";
import { ALL_PROMPTS } from "@/lib/journal-prompts";

export interface ChartRow {
  user_id: string;
  planets: { name: string; sign: string; absPosition: number; house?: number | null }[] | null;
  houses: { number: number; sign: string; absPosition: number }[] | null;
  zodiac_system: string | null;
  ayanamsa: string | null;
}

export interface TransitHit {
  transitPlanet: string;
  natalPlanet: string;
  aspect: string;
  orb: number;
}

interface TransitAspectLite {
  transitPlanet: string;
  natalPlanet: string;
  aspect: string;
  exactDate?: string;
  orb?: number;
}

/**
 * How close the aspect must actually be before we call it exact.
 *
 * `exactDate` does NOT mean "the day this perfects". findTransitWindow returns
 * the closest day inside a bounded scan, so when the real perfection falls
 * outside that scan it still names a date — and the copy then tells the user a
 * transit is exact when it is degrees away. Measured over two years against a
 * sample chart, 7 of 44 sends were wrong this way, the worst being a Pluto
 * opposition announced as exact at 7.8 degrees off.
 *
 * One degree is a clean cut: across that run nothing landed between 0.5 and 2
 * degrees, so this separates the genuine perfections from the artefacts without
 * sitting near anything real.
 */
export const EXACT_ORB = 1.0;

// Only outer/intense transiters and hard/flowing major aspects are worth a push.
const NOTIFIABLE_ASPECTS = new Set(["conjunction", "opposition", "square", "trine"]);
const NOTIFIABLE_TRANSITERS = new Set(["Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"]);

/** The strongest major transit genuinely exact today, or null. */
export function exactTransitToday(chart: ChartRow, today: string): TransitHit | null {
  const planets = chart.planets;
  if (!Array.isArray(planets) || planets.length === 0) return null;

  let aspects: TransitAspectLite[];
  try {
    const result = calculateTransits({
      natalPlanets: planets,
      natalHouses: Array.isArray(chart.houses) ? chart.houses : [],
      transitDate: today,
      zodiacSystem: chart.zodiac_system === "sidereal" ? "sidereal" : "tropical",
      ayanamsa: chart.ayanamsa || "lahiri",
    }) as { transitAspects?: TransitAspectLite[] };
    aspects = result.transitAspects ?? [];
  } catch {
    return null;
  }

  // aspects arrive pre-sorted by intensity, so the first qualifying hit is the strongest.
  const hit = aspects.find(
    (a) => a.exactDate === today
      && typeof a.orb === "number" && a.orb <= EXACT_ORB
      && NOTIFIABLE_ASPECTS.has(a.aspect) && NOTIFIABLE_TRANSITERS.has(a.transitPlanet),
  );
  if (!hit) return null;
  return {
    transitPlanet: hit.transitPlanet,
    natalPlanet: hit.natalPlanet,
    aspect: hit.aspect,
    orb: hit.orb as number,
  };
}

export interface Push {
  category: NotificationCategory;
  title: string;
  body: string;
}

/**
 * Job 02 — your chart did something.
 *
 * Takes an already-computed hit where the caller has one: the journal check-in
 * asks the same question, and the ephemeris lookup is by far the most expensive
 * thing either of them does.
 */
export function personalTransitNotification(chart: ChartRow, today: string, known?: TransitHit | null): Push | null {
  const hit = known !== undefined ? known : exactTransitToday(chart, today);
  if (!hit) return null;
  const { title, body } = renderCopy(copyFor("major_transits", hit.aspect), {
    planet: hit.transitPlanet,
    natal: shortPoint(hit.natalPlanet),
  });
  return { category: "major_transits", title, body };
}

/* ─── Journal check-in ─── */

/**
 * The prompt library keys its transit prompts as `saturn_square_sun`. The
 * ephemeris says "conjunction" and "opposition" where the library says
 * "conjunct" and "opposite", and it spells the angles out where the library
 * abbreviates them.
 */
const PROMPT_ASPECT: Record<string, string> = {
  conjunction: "conjunct",
  opposition: "opposite",
  square: "square",
  trine: "trine",
};
const PROMPT_POINT: Record<string, string> = {
  Midheaven: "mc",
  Ascendant: "asc",
  "North Node": "node",
};

export function promptTrigger(hit: TransitHit): string {
  const planet = hit.transitPlanet.toLowerCase();
  const aspect = PROMPT_ASPECT[hit.aspect] ?? hit.aspect;
  const natal = PROMPT_POINT[hit.natalPlanet] ?? hit.natalPlanet.toLowerCase();
  return `${planet}_${aspect}_${natal}`;
}

/**
 * The question, without the sentence that restates the transit.
 *
 * Every transit prompt opens by naming the transit — "Saturn is squaring your
 * Sun. What are you being asked to take responsibility for?" — because in the
 * journal there is no title above it. In a notification the title already says
 * which transit it is, so keeping the first sentence would say it twice.
 */
export function promptQuestion(text: string): string {
  const i = text.indexOf(". ");
  return i === -1 ? text : text.slice(i + 2);
}

/**
 * Job 03 — something of yours is waiting.
 *
 * The sharpest thing in the catalogue, and it costs almost nothing: the app
 * already holds prompts keyed to exactly these transits, so this never has to
 * say "time to journal". It names the transit and asks the question written for
 * it — Job 02's specificity with Job 03's restraint. Where no question has been
 * written for a transit, it stays quiet rather than reaching for a generic one.
 */
export function journalCheckinNotification(chart: ChartRow, today: string, known?: TransitHit | null): Push | null {
  const hit = known !== undefined ? known : exactTransitToday(chart, today);
  if (!hit) return null;

  const prompt = ALL_PROMPTS.find((p) => p.trigger === promptTrigger(hit));
  if (!prompt) return null;

  // Same title as the plain transit push — they never both fire, and the aspect
  // verb is the accurate way to say it.
  const transitTitle = renderCopy(copyFor("major_transits", hit.aspect), {
    planet: hit.transitPlanet,
    natal: shortPoint(hit.natalPlanet),
  }).title;

  const { title, body } = renderCopy(copyFor("journal_checkin", "transit"), {
    title: transitTitle,
    prompt: promptQuestion(prompt.text),
  });
  return { category: "journal_checkin", title, body };
}
