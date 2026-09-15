/**
 * The personal-transit push: one notification for the strongest major transit
 * that is genuinely exact against a user's natal chart today.
 *
 * Lives here rather than inside the cron route so it can be tested. The rule it
 * enforces is one line long and was the difference between a true statement and
 * a false one — see EXACT_ORB.
 */

import { calculateTransits } from "@/lib/astro/calculateTransits";
import type { NotificationCategory } from "@/lib/notifications";

export interface ChartRow {
  user_id: string;
  planets: { name: string; sign: string; absPosition: number; house?: number | null }[] | null;
  houses: { number: number; sign: string; absPosition: number }[] | null;
  zodiac_system: string | null;
  ayanamsa: string | null;
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
const TRANSIT_VERB: Record<string, string> = {
  conjunction: "meets", opposition: "opposes", square: "squares", trine: "trines",
};
const TRANSIT_FLAVOR: Record<string, string> = {
  conjunction: "A new cycle starts here.",
  opposition: "A push-pull kind of day. Something's asking for balance.",
  square: "Friction you can put to work.",
  trine: "Things flow a little easier here, if you want to use it.",
};

/**
 * Returns a notification for the single strongest major transit that is EXACT
 * today against the user's natal chart, or null if none qualifies. Transits to
 * natal planets are valid even for unknown-birth-time charts (planet positions
 * don't depend on time), so no time guard is needed here.
 */
export function personalTransitNotification(
  chart: ChartRow,
  today: string,
): { category: NotificationCategory; title: string; body: string } | null {
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

  const verb = TRANSIT_VERB[hit.aspect] ?? "aspects";
  const flavor = TRANSIT_FLAVOR[hit.aspect] ?? "";
  // The specific thing goes in the title: the OS summarisers read the opening
  // of a notification and rank on it, and "Your chart today" tells them nothing.
  return {
    category: "major_transits",
    title: `${hit.transitPlanet} ${verb} your ${hit.natalPlanet}`,
    body: `Exact today. ${flavor}`.trim(),
  };
}

