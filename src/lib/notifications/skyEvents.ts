/**
 * Sky events worth a notification, computed rather than tabulated.
 *
 * All of these were in the strategy document and none of them existed in code.
 * Each one is here because the tradition holds it to be a moment rather than a
 * span — which is also what keeps the volume low enough to be worth sending.
 *
 * Every function answers "did this happen on this calendar day, for someone in
 * this timezone", because that is the question a daily notification asks.
 * `day` carries the calendar date in its local fields (the shape localNow() and
 * the screens produce); `timeZone` is the reader's IANA zone. On the server the
 * zone is not optional in spirit: the runtime's own midnight is UTC there, and
 * an event at 02:00 UTC is the previous evening in the Americas. These used to
 * build that midnight with `new Date(y, m, d)`, which is how US users came to
 * get eclipse and station pushes a day late.
 *
 * The events themselves are exact instants from the shared sky calendar.
 */

import * as Astronomy from "astronomy-engine";
import {
  stationsBetween, retrogradePeriodsBetween, ingressesBetween, nextEclipseAfter,
  eclipsesBetween, localDayWindow, isOnDay, STATION_PLANETS,
} from "@/lib/astro/skyCalendar";

const DAY_MS = 24 * 60 * 60 * 1000;

/** Planets that station often enough to matter and slowly enough to be felt. */
export const STATIONING = STATION_PLANETS;
export type StationingPlanet = typeof STATIONING[number];

/** Outer planets only: an ingress that means something lasts years, not weeks. */
export const SLOW_MOVERS = ["Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"] as const;

/** Roughly how long each spends in a sign, for the copy. */
export const YEARS_PER_SIGN: Record<string, number> = {
  Jupiter: 1, Saturn: 3, Uranus: 7, Neptune: 14, Pluto: 20,
};

export interface Station {
  planet: string;
  /** "retrograde" when it turns backwards, "direct" when it resumes. */
  direction: "retrograde" | "direct";
  /** The degree it stops on — the degree the tradition says carries the weight. */
  longitude: number;
  sign: string;
  /** The exact instant of the station. */
  at: Date;
  /**
   * For a direct station: when this planet turned retrograde, so the copy can
   * say how long it has been stuck without inventing a date. Undefined only if
   * the retrograde station is out of the search's reach.
   */
  retrogradeSince?: Date;
}

/**
 * Planets stationing on this local day.
 *
 * The tradition holds the station, not the retrograde span, to be the event
 * worth marking: a stationary planet is slow, and slowness is held to
 * intensify. It is also two moments per cycle instead of three weeks of
 * nagging.
 */
export function stationsOn(day: Date, timeZone?: string | null): Station[] {
  const { start, end } = localDayWindow(day, timeZone);
  return stationsBetween(start, end).map((s) => {
    const out: Station = {
      planet: s.planet, direction: s.direction, longitude: s.longitude, sign: s.sign, at: s.at,
    };
    if (s.direction === "direct") {
      const period = retrogradePeriodsBetween(s.planet, s.at, new Date(s.at.getTime() + 1))
        .find((p) => p.end.getTime() === s.at.getTime());
      if (period) out.retrogradeSince = period.start;
    }
    return out;
  });
}

export interface Ingress {
  planet: string;
  sign: string;
  years: number;
}

/**
 * Outer planets changing sign on this local day.
 *
 * Inner-planet ingresses happen constantly and say little; Saturn changing sign
 * is a three-year statement. A planet can cross a boundary three times when it
 * retrogrades back over it — each crossing is reported, because each one is a
 * real change of sign. (This used to compare the sign at yesterday's midnight
 * with today's, which announced an ingress on the day after it happened.)
 */
export function ingressesOn(day: Date, timeZone?: string | null): Ingress[] {
  const { start, end } = localDayWindow(day, timeZone);
  return ingressesBetween(start, end)
    .filter((g) => (SLOW_MOVERS as readonly string[]).includes(g.planet))
    .map((g) => ({ planet: g.planet, sign: g.sign, years: YEARS_PER_SIGN[g.planet] ?? 1 }));
}

export interface EclipseSeason {
  /** The first eclipse of the season. */
  firstAt: Date;
  kind: "solar" | "lunar";
  /** How many eclipses fall inside the season. */
  count: number;
}

/**
 * How close the first eclipse has to be for the season to count as open.
 *
 * An eclipse season is 31-37 days of real astronomy — the stretch where the Sun
 * sits near a lunar node — and practitioners treat it as the preparation
 * runway. Half of that is the sensible point to say it has started, because the
 * first eclipse falls near the middle rather than at the edge.
 */
export const SEASON_LEAD_DAYS = 18;

/**
 * True on the day an eclipse season opens.
 *
 * Detected from the eclipses themselves rather than from node geometry: the
 * season opens on the first local day the next eclipse is within the lead
 * window of that day's midnight, and yesterday it was not.
 */
export function eclipseSeasonOpensOn(day: Date, timeZone?: string | null): EclipseSeason | null {
  const { start } = localDayWindow(day, timeZone);
  const prevStart = localDayWindow(new Date(day.getFullYear(), day.getMonth(), day.getDate() - 1), timeZone).start;
  const inWindow = (from: Date) => {
    const next = nextEclipseAfter(from);
    const days = (next.at.getTime() - from.getTime()) / DAY_MS;
    return days <= SEASON_LEAD_DAYS ? next : null;
  };
  const today = inWindow(start);
  if (!today) return null;
  if (inWindow(prevStart)) return null;   // the season was already open yesterday

  // Count the eclipses inside the season — usually two, occasionally three.
  const count = eclipsesBetween(start, new Date(start.getTime() + 37 * DAY_MS)).length;
  return { firstAt: today.at, kind: today.kind, count };
}

/** An eclipse peaking on this local day, if any. */
export function eclipseOn(
  day: Date,
  timeZone?: string | null,
): { kind: "solar" | "lunar"; at: Date; type: string; label: string } | null {
  const { start, end } = localDayWindow(day, timeZone);
  const e = eclipsesBetween(start, end)[0];
  return e ? { kind: e.kind, at: e.at, type: e.type, label: e.label } : null;
}

/**
 * The instant the Sun returns to a natal longitude, in the year of `day`.
 *
 * The tradition reads this chart as governing the following twelve months, and
 * it is exact to the minute — which is why it can fall a day either side of the
 * calendar birthday. It is also the rarest personal event the app has, which is
 * what earns it the top of the priority order.
 */
export function solarReturnInstant(natalSunLongitude: number, year: number): Date {
  // The Sun passes each longitude exactly once per UTC year. (This used to
  // start the search on 20 December of the year before, so for a natal Sun in
  // the last ten days of Capricorn's approach it returned last December's
  // return — and solarReturnOn never fired for late-December birthdays.)
  const found = Astronomy.SearchSunLongitude(natalSunLongitude, new Date(Date.UTC(year, 0, 1)), 367);
  if (!found) throw new Error(`no solar return for longitude ${natalSunLongitude} in ${year}`);
  return found.date;
}

/** The solar return instant, when it falls on this local day. */
export function solarReturnOn(day: Date, natalSunLongitude: number, timeZone?: string | null): Date | null {
  // Search the local day itself (with a day's margin), so a return that is
  // 31 December locally and 1 January in UTC is still found.
  const { start } = localDayWindow(day, timeZone);
  const found = Astronomy.SearchSunLongitude(natalSunLongitude, new Date(start.getTime() - DAY_MS), 3);
  if (!found) return null;
  return isOnDay(found.date, day, timeZone) ? found.date : null;
}
