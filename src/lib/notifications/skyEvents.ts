/**
 * Sky events worth a notification, computed rather than tabulated.
 *
 * All of these were in the strategy document and none of them existed in code.
 * Each one is here because the tradition holds it to be a moment rather than a
 * span — which is also what keeps the volume low enough to be worth sending.
 *
 * Every function takes a date and answers "did this happen on this calendar
 * day, in this timezone", because that is the question a daily notification
 * asks. They are pure and use the same ephemeris as the rest of the app.
 */

import * as Astronomy from "astronomy-engine";

const DAY_MS = 24 * 60 * 60 * 1000;

const SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
];

/** Planets that station often enough to matter and slowly enough to be felt. */
export const STATIONING = ["Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"] as const;
export type StationingPlanet = typeof STATIONING[number];

/** Outer planets only: an ingress that means something lasts years, not weeks. */
export const SLOW_MOVERS = ["Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"] as const;

/** Roughly how long each spends in a sign, for the copy. */
export const YEARS_PER_SIGN: Record<string, number> = {
  Jupiter: 1, Saturn: 3, Uranus: 7, Neptune: 14, Pluto: 20,
};

/**
 * Apparent geocentric ecliptic longitude — where the planet appears to be from
 * here, which is the only frame in which anything is ever retrograde.
 *
 * Astronomy.EclipticLongitude is HELIOCENTRIC. Using it made every station
 * detection return nothing at all, because seen from the Sun no planet ever
 * turns around.
 */
function lonAt(body: Astronomy.Body, at: Date): number {
  const vec = Astronomy.GeoVector(body, at, true);
  return Astronomy.Ecliptic(vec).elon;
}

function bodyFor(name: string): Astronomy.Body {
  return Astronomy.Body[name as keyof typeof Astronomy.Body] as Astronomy.Body;
}

/** Signed daily motion, degrees, unwrapped across the 0/360 boundary. */
function motion(body: Astronomy.Body, at: Date): number {
  const a = lonAt(body, new Date(at.getTime() - DAY_MS / 2));
  const b = lonAt(body, new Date(at.getTime() + DAY_MS / 2));
  let d = b - a;
  if (d > 180) d -= 360;
  if (d < -180) d += 360;
  return d;
}

export interface Station {
  planet: string;
  /** "retrograde" when it turns backwards, "direct" when it resumes. */
  direction: "retrograde" | "direct";
  /** The degree it stops on — the degree the tradition says carries the weight. */
  longitude: number;
  sign: string;
  /**
   * For a direct station: when this planet turned retrograde, so the copy can
   * say how long it has been stuck without inventing a date. Undefined when the
   * search does not reach back far enough.
   */
  retrogradeSince?: Date;
}

/**
 * Walk back to the station that started this retrograde.
 *
 * Without it the "stuck since [month]" line has to be filled with something,
 * and the something it was being filled with was the current month — so a
 * planet turning direct in February was announced as having been stuck since
 * February. Pluto's retrograde runs nearly half a year, so the search has to
 * reach further than feels necessary.
 */
function retrogradeStartedAt(body: Astronomy.Body, directStation: Date): Date | undefined {
  for (let back = 1; back <= 200; back++) {
    const d = new Date(directStation.getTime() - back * DAY_MS);
    const before = motion(body, new Date(d.getTime() - DAY_MS));
    const after = motion(body, d);
    if (Math.sign(before) !== Math.sign(after) && after < 0) return d;
  }
  return undefined;
}

/**
 * Planets stationing on this local day.
 *
 * A station is where the planet's apparent motion reverses, so it is found by
 * the sign of the daily motion changing between yesterday and today. The
 * tradition holds the station, not the retrograde span, to be the event worth
 * marking: a stationary planet is slow, and slowness is held to intensify. It
 * is also two moments per cycle instead of three weeks of nagging.
 */
export function stationsOn(day: Date): Station[] {
  const start = new Date(day.getFullYear(), day.getMonth(), day.getDate());
  const end = new Date(start.getTime() + DAY_MS);
  const out: Station[] = [];
  for (const name of STATIONING) {
    const body = bodyFor(name);
    const before = motion(body, start);
    const after = motion(body, end);
    if (before === 0 || after === 0) continue;
    if (Math.sign(before) === Math.sign(after)) continue;
    const lon = lonAt(body, start);
    const direction = after < 0 ? "retrograde" : "direct";
    out.push({
      planet: name,
      direction,
      longitude: lon,
      sign: SIGNS[Math.floor(lon / 30) % 12],
      ...(direction === "direct" ? { retrogradeSince: retrogradeStartedAt(body, start) } : {}),
    });
  }
  return out;
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
 * is a three-year statement. Note that a planet can cross a boundary three
 * times when it retrogrades back over it — this reports each crossing, which is
 * honest, because each one is a real change of sign.
 */
export function ingressesOn(day: Date): Ingress[] {
  const start = new Date(day.getFullYear(), day.getMonth(), day.getDate());
  const prev = new Date(start.getTime() - DAY_MS);
  const out: Ingress[] = [];
  for (const name of SLOW_MOVERS) {
    const body = bodyFor(name);
    const a = Math.floor(lonAt(body, prev) / 30) % 12;
    const b = Math.floor(lonAt(body, start) / 30) % 12;
    if (a === b) continue;
    out.push({ planet: name, sign: SIGNS[b], years: YEARS_PER_SIGN[name] ?? 1 });
  }
  return out;
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
 * season opens on the first day the next eclipse is within the lead window and
 * yesterday it was not.
 */
export function eclipseSeasonOpensOn(day: Date): EclipseSeason | null {
  const start = new Date(day.getFullYear(), day.getMonth(), day.getDate());
  const prev = new Date(start.getTime() - DAY_MS);
  const inWindow = (from: Date) => {
    const next = nextEclipse(from);
    const days = (next.at.getTime() - from.getTime()) / DAY_MS;
    return days <= SEASON_LEAD_DAYS ? next : null;
  };
  const today = inWindow(start);
  if (!today) return null;
  if (inWindow(prev)) return null;   // the season was already open yesterday

  // Count the eclipses inside the season — usually two, occasionally three.
  let count = 0;
  let cursor = start;
  const seasonEnd = new Date(start.getTime() + 37 * DAY_MS);
  while (cursor < seasonEnd) {
    const e = nextEclipse(cursor);
    if (e.at >= seasonEnd) break;
    count++;
    cursor = new Date(e.at.getTime() + DAY_MS);
  }
  return { firstAt: today.at, kind: today.kind, count };
}

/**
 * Eclipse searches are the most expensive thing in this file and the season
 * check asks for the same ones repeatedly — a day-resolution cache turns a
 * year's scan from minutes into seconds. Results are a pure function of the
 * date, so caching them cannot go stale.
 */
const eclipseCache = new Map<string, { at: Date; kind: "solar" | "lunar" }>();

function nextEclipse(from: Date): { at: Date; kind: "solar" | "lunar" } {
  const key = from.toISOString().slice(0, 10);
  const cached = eclipseCache.get(key);
  if (cached) return cached;

  const solar = Astronomy.SearchGlobalSolarEclipse(from);
  const lunar = Astronomy.SearchLunarEclipse(from);
  const result = solar.peak.date < lunar.peak.date
    ? { at: solar.peak.date, kind: "solar" as const }
    : { at: lunar.peak.date, kind: "lunar" as const };

  if (eclipseCache.size > 2000) eclipseCache.clear();
  eclipseCache.set(key, result);
  return result;
}

/** An eclipse peaking on this local day, if any. */
export function eclipseOn(day: Date): { kind: "solar" | "lunar"; at: Date } | null {
  const start = new Date(day.getFullYear(), day.getMonth(), day.getDate());
  const e = nextEclipse(new Date(start.getTime() - DAY_MS));
  const sameDay = e.at.getFullYear() === start.getFullYear()
    && e.at.getMonth() === start.getMonth()
    && e.at.getDate() === start.getDate();
  return sameDay ? e : null;
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
  // The Sun passes each longitude once a year; start a fortnight early so the
  // search brackets it wherever in the year it falls.
  const approx = Astronomy.SearchSunLongitude(natalSunLongitude, new Date(Date.UTC(year - 1, 11, 20)), 400);
  if (!approx) throw new Error(`no solar return for longitude ${natalSunLongitude} in ${year}`);
  return approx.date;
}

export function solarReturnOn(day: Date, natalSunLongitude: number): Date | null {
  const at = solarReturnInstant(natalSunLongitude, day.getFullYear());
  const same = at.getFullYear() === day.getFullYear()
    && at.getMonth() === day.getMonth()
    && at.getDate() === day.getDate();
  return same ? at : null;
}
