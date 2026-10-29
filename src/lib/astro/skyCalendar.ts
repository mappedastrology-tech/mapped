/**
 * The sky calendar — eclipses, stations, retrograde periods, slow-planet
 * ingresses and the void-of-course Moon, computed for any year.
 *
 * Every one of these used to be a hand-typed 2026 table, built with
 * `new Date(year, …)` so that 2027 quietly showed 2026's dates (and a Venus
 * retrograde that does not happen), with the 2026 eclipse types swapped in one
 * copy, and with the void-of-course Moon invented outright from a seeded random
 * number. They are all searches now, against the same astronomy-engine
 * ephemeris the rest of the app uses, cached per year so a screen that asks
 * thirty times pays once.
 *
 * Conventions, written down because silent inconsistency is worse than an
 * unpopular choice:
 *
 *   - Tropical zodiac, apparent geocentric longitude of date (light-time and
 *     aberration corrected) — the frame retrogrades and aspects live in.
 *   - A station is the instant the apparent longitude speed changes sign.
 *   - Eclipses are the global events: a solar eclipse is listed whether or not
 *     it is visible from where the reader is, and penumbral lunar eclipses are
 *     listed (labelled as penumbral), matching the published astrological
 *     calendars.
 *   - Void-of-course Moon: from the Moon's last exact Ptolemaic aspect
 *     (conjunction, sextile, square, trine, opposition) to any planet Sun
 *     through PLUTO, until it enters the next sign. Traditional practice
 *     (Lilly) counts only Sun–Saturn; most modern apps and ephemerides include
 *     the outer planets, and we follow the modern convention. No orbs — an
 *     aspect counts at the moment it perfects.
 *
 * Everything returned is an instant. Which calendar day an instant lands on is
 * the reader's question, answered by the local-day helpers at the bottom.
 */

import * as Astronomy from "astronomy-engine";

const MIN = 60 * 1000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

export const SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
] as const;

const norm360 = (x: number) => ((x % 360) + 360) % 360;
/** Signed difference folded into [-180, 180). */
const wrap180 = (x: number) => norm360(x + 180) - 180;
const signOf = (lon: number) => SIGNS[Math.floor(norm360(lon) / 30) % 12];

// ─── Longitudes ──────────────────────────────────────────────────────────────

function bodyFor(name: string): Astronomy.Body {
  return Astronomy.Body[name as keyof typeof Astronomy.Body] as Astronomy.Body;
}

/** Apparent geocentric ecliptic longitude of date, degrees. */
export function apparentLongitude(name: string, at: Date): number {
  if (name === "Moon") return norm360(Astronomy.EclipticGeoMoon(at).lon);
  if (name === "Sun") return norm360(Astronomy.SunPosition(at).elon);
  return norm360(Astronomy.Ecliptic(Astronomy.GeoVector(bodyFor(name), at, true)).elon);
}

/** Signed apparent speed, degrees/day, by a two-hour central difference. */
function speed(name: string, at: Date): number {
  const a = apparentLongitude(name, new Date(at.getTime() - HOUR));
  const b = apparentLongitude(name, new Date(at.getTime() + HOUR));
  return wrap180(b - a) * 12;
}

/** Bisect a sign change of `f` between lo and hi to within `tol` ms. */
function bisect(lo: number, hi: number, f: (t: number) => number, tol = MIN / 2): number {
  let flo = f(lo);
  while (hi - lo > tol) {
    const mid = (lo + hi) / 2;
    const fm = f(mid);
    if (Math.sign(fm) === Math.sign(flo)) { lo = mid; flo = fm; } else hi = mid;
  }
  return (lo + hi) / 2;
}

// ─── Stations & retrogrades ──────────────────────────────────────────────────

export const STATION_PLANETS = ["Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"] as const;

export interface SkyStation {
  planet: string;
  at: Date;
  /** "retrograde" when it turns backwards, "direct" when it resumes. */
  direction: "retrograde" | "direct";
  longitude: number;
  sign: string;
}

const stationCache = new Map<number, SkyStation[]>();

/** Every station of Mercury–Pluto whose instant falls in this UTC year. */
export function stationsForUtcYear(year: number): SkyStation[] {
  const hit = stationCache.get(year);
  if (hit) return hit;
  const from = Date.UTC(year, 0, 1);
  const to = Date.UTC(year + 1, 0, 1);
  const out: SkyStation[] = [];
  for (const planet of STATION_PLANETS) {
    // Daily samples are plenty: the shortest gap between two stations of one
    // planet (Mercury) is about three weeks.
    let prevT = from - DAY;
    let prevV = speed(planet, new Date(prevT));
    for (let t = from; t <= to + DAY; t += DAY) {
      const v = speed(planet, new Date(t));
      if (Math.sign(v) !== Math.sign(prevV) && v !== 0 && prevV !== 0) {
        const at = bisect(prevT, t, (x) => speed(planet, new Date(x)));
        if (at >= from && at < to) {
          const lon = apparentLongitude(planet, new Date(at));
          out.push({
            planet, at: new Date(at), direction: v < 0 ? "retrograde" : "direct",
            longitude: lon, sign: signOf(lon),
          });
        }
      }
      prevT = t;
      prevV = v;
    }
  }
  out.sort((a, b) => a.at.getTime() - b.at.getTime());
  stationCache.set(year, out);
  return out;
}

/** Stations with start <= at < end. */
export function stationsBetween(start: Date, end: Date): SkyStation[] {
  const out: SkyStation[] = [];
  for (let y = start.getUTCFullYear(); y <= end.getUTCFullYear(); y++) {
    for (const s of stationsForUtcYear(y)) {
      if (s.at >= start && s.at < end) out.push(s);
    }
  }
  return out;
}

export interface RetrogradePeriod {
  planet: string;
  /** The retrograde station. */
  start: Date;
  /** The direct station. */
  end: Date;
  startLongitude: number;
  endLongitude: number;
  startSign: string;
  endSign: string;
  /** When the planet first reaches the degree it will station direct on. */
  shadowStart: Date;
  /** When the planet regains the degree it stationed retrograde on. */
  shadowEnd: Date;
}

/**
 * The instant the planet, moving in `direction` from `from`, has travelled
 * `distance` degrees along the zodiac (direct motion counted positive).
 */
function travel(planet: string, from: Date, distance: number, direction: 1 | -1): Date {
  const step = direction * DAY;
  let t = from.getTime();
  let lon = apparentLongitude(planet, from);
  let covered = 0;
  for (let i = 0; i < 400; i++) {
    const nt = t + step;
    const nlon = apparentLongitude(planet, new Date(nt));
    const d = wrap180(nlon - lon) * direction;   // progress in the asked direction
    if (covered + d >= distance) {
      const base = covered;
      const startLon = lon;
      const at = bisect(Math.min(t, nt), Math.max(t, nt), (x) => base + wrap180(apparentLongitude(planet, new Date(x)) - startLon) * direction - distance);
      return new Date(at);
    }
    covered += d;
    t = nt;
    lon = nlon;
  }
  return new Date(t);
}

const periodCache = new Map<string, RetrogradePeriod[]>();

/**
 * Retrograde periods of one planet that overlap [start, end).
 *
 * Pairs each retrograde station with the next direct one, reaching into the
 * neighbouring years so a period that straddles New Year is whole.
 */
export function retrogradePeriodsBetween(planet: string, start: Date, end: Date): RetrogradePeriod[] {
  const y0 = start.getUTCFullYear() - 1;
  const y1 = end.getUTCFullYear() + 1;
  const key = `${planet}:${y0}:${y1}`;
  let all = periodCache.get(key);
  if (!all) {
    const stations: SkyStation[] = [];
    for (let y = y0; y <= y1; y++) stations.push(...stationsForUtcYear(y).filter((s) => s.planet === planet));
    all = [];
    for (let i = 0; i < stations.length - 1; i++) {
      const rx = stations[i], d = stations[i + 1];
      if (rx.direction !== "retrograde" || d.direction !== "direct") continue;
      const arc = norm360(rx.longitude - d.longitude);
      all.push({
        planet, start: rx.at, end: d.at,
        startLongitude: rx.longitude, endLongitude: d.longitude,
        startSign: rx.sign, endSign: d.sign,
        shadowStart: travel(planet, rx.at, arc, -1),
        shadowEnd: travel(planet, d.at, arc, 1),
      });
    }
    periodCache.set(key, all);
  }
  return all.filter((p) => p.start < end && p.end >= start);
}

/** The retrograde period containing this instant, if the planet is retrograde. */
export function retrogradeAt(planet: string, at: Date): RetrogradePeriod | null {
  return retrogradePeriodsBetween(planet, at, new Date(at.getTime() + 1))
    .find((p) => p.start <= at && at < p.end) ?? null;
}

// ─── Eclipses ────────────────────────────────────────────────────────────────

export type EclipseType = "total" | "annular" | "hybrid" | "partial" | "penumbral";

export interface SkyEclipse {
  at: Date;
  kind: "solar" | "lunar";
  type: EclipseType;
  /** The Sun's sign for a solar eclipse, the Moon's for a lunar one. */
  sign: string;
  /** "Annular Solar Eclipse", "Penumbral Lunar Eclipse"… */
  label: string;
}

const eclipseCache = new Map<number, SkyEclipse[]>();

function eclipseLabel(kind: "solar" | "lunar", type: EclipseType): string {
  const t = type.charAt(0).toUpperCase() + type.slice(1);
  return `${t} ${kind === "solar" ? "Solar" : "Lunar"} Eclipse`;
}

/** Every eclipse whose peak falls in this UTC year. */
export function eclipsesForUtcYear(year: number): SkyEclipse[] {
  const hit = eclipseCache.get(year);
  if (hit) return hit;
  const from = new Date(Date.UTC(year, 0, 1));
  const to = new Date(Date.UTC(year + 1, 0, 1));
  const out: SkyEclipse[] = [];

  for (let e = Astronomy.SearchGlobalSolarEclipse(from); e.peak.date < to; e = Astronomy.NextGlobalSolarEclipse(e.peak)) {
    const type = e.kind as EclipseType;
    out.push({ at: e.peak.date, kind: "solar", type, sign: signOf(apparentLongitude("Sun", e.peak.date)), label: eclipseLabel("solar", type) });
  }
  for (let e = Astronomy.SearchLunarEclipse(from); e.peak.date < to; e = Astronomy.NextLunarEclipse(e.peak)) {
    const type = e.kind as EclipseType;
    out.push({ at: e.peak.date, kind: "lunar", type, sign: signOf(apparentLongitude("Moon", e.peak.date)), label: eclipseLabel("lunar", type) });
  }
  out.sort((a, b) => a.at.getTime() - b.at.getTime());
  eclipseCache.set(year, out);
  return out;
}

/** Eclipses with start <= peak < end. */
export function eclipsesBetween(start: Date, end: Date): SkyEclipse[] {
  const out: SkyEclipse[] = [];
  for (let y = start.getUTCFullYear(); y <= end.getUTCFullYear(); y++) {
    for (const e of eclipsesForUtcYear(y)) if (e.at >= start && e.at < end) out.push(e);
  }
  return out;
}

/** The first eclipse peaking strictly after `from`. */
export function nextEclipseAfter(from: Date): SkyEclipse {
  for (let y = from.getUTCFullYear(); ; y++) {
    const e = eclipsesForUtcYear(y).find((x) => x.at > from);
    if (e) return e;
  }
}

/** The eclipse within a day of this lunation instant, if it is one. */
export function eclipseNear(at: Date, kind?: "solar" | "lunar"): SkyEclipse | null {
  return eclipsesBetween(new Date(at.getTime() - DAY), new Date(at.getTime() + DAY))
    .find((e) => !kind || e.kind === kind) ?? null;
}

// ─── Slow-planet ingresses ───────────────────────────────────────────────────

export const INGRESS_PLANETS = ["Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"] as const;

export interface SkyIngress {
  planet: string;
  at: Date;
  sign: string;
  /** True when the planet re-enters the sign it just left (a retrograde back-step). */
  retrograde: boolean;
}

const ingressCache = new Map<number, SkyIngress[]>();

/** Sign changes of Mars–Pluto whose instant falls in this UTC year. */
export function ingressesForUtcYear(year: number): SkyIngress[] {
  const hit = ingressCache.get(year);
  if (hit) return hit;
  const from = Date.UTC(year, 0, 1);
  const to = Date.UTC(year + 1, 0, 1);
  const out: SkyIngress[] = [];
  for (const planet of INGRESS_PLANETS) {
    const idx = (t: number) => Math.floor(apparentLongitude(planet, new Date(t)) / 30) % 12;
    let prevT = from;
    let prevI = idx(from);
    for (let t = from + DAY; t <= to; t += DAY) {
      const i = idx(t);
      if (i !== prevI) {
        // Signed distance to the boundary that was crossed, for the bisection.
        const forward = (i - prevI + 12) % 12 === 1;
        const boundary = forward ? i * 30 : prevI * 30;
        const at = bisect(prevT, t, (x) => wrap180(apparentLongitude(planet, new Date(x)) - boundary));
        out.push({ planet, at: new Date(at), sign: SIGNS[i], retrograde: !forward });
      }
      prevT = t;
      prevI = i;
    }
  }
  out.sort((a, b) => a.at.getTime() - b.at.getTime());
  ingressCache.set(year, out);
  return out;
}

export function ingressesBetween(start: Date, end: Date): SkyIngress[] {
  const out: SkyIngress[] = [];
  for (let y = start.getUTCFullYear(); y <= end.getUTCFullYear(); y++) {
    for (const g of ingressesForUtcYear(y)) if (g.at >= start && g.at < end) out.push(g);
  }
  return out;
}

// ─── Void-of-course Moon ─────────────────────────────────────────────────────

/**
 * The bodies a void-of-course Moon is measured against. Modern convention:
 * Sun through Pluto. Remove the last three for the traditional Sun–Saturn set.
 */
export const VOC_BODIES = ["Sun", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"] as const;

/** The Ptolemaic aspects, as Moon-minus-planet separations. */
const VOC_ASPECTS: { angle: number; name: string }[] = [
  { angle: 0, name: "conjunction" },
  { angle: 60, name: "sextile" }, { angle: 300, name: "sextile" },
  { angle: 90, name: "square" }, { angle: 270, name: "square" },
  { angle: 120, name: "trine" }, { angle: 240, name: "trine" },
  { angle: 180, name: "opposition" },
];

export interface MoonIngress {
  at: Date;
  /** The sign the Moon enters. */
  sign: string;
}

const moonIngressCache = new Map<string, MoonIngress[]>();

/** Moon sign changes in one UTC month, found at two-hour steps and bisected. */
function moonIngressesForUtcMonth(year: number, month: number): MoonIngress[] {
  const key = `${year}-${month}`;
  const hit = moonIngressCache.get(key);
  if (hit) return hit;
  const from = Date.UTC(year, month, 1);
  const to = Date.UTC(year, month + 1, 1);
  const out: MoonIngress[] = [];
  const idx = (t: number) => Math.floor(apparentLongitude("Moon", new Date(t)) / 30) % 12;
  let prevT = from;
  let prevI = idx(from);
  for (let t = from + 2 * HOUR; t <= to; t += 2 * HOUR) {
    const i = idx(t);
    if (i !== prevI) {
      const boundary = i * 30;
      const at = bisect(prevT, t, (x) => wrap180(apparentLongitude("Moon", new Date(x)) - boundary), 10 * 1000);
      if (at >= from && at < to) out.push({ at: new Date(at), sign: SIGNS[i] });
      prevI = i;
    }
    prevT = t;
  }
  moonIngressCache.set(key, out);
  return out;
}

/** Moon ingresses with start <= at < end. */
export function moonIngressesBetween(start: Date, end: Date): MoonIngress[] {
  const out: MoonIngress[] = [];
  const cursor = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), 1));
  while (cursor < end) {
    for (const g of moonIngressesForUtcMonth(cursor.getUTCFullYear(), cursor.getUTCMonth())) {
      if (g.at >= start && g.at < end) out.push(g);
    }
    cursor.setUTCMonth(cursor.getUTCMonth() + 1);
  }
  return out;
}

export interface VoidOfCourse {
  /** The Moon's last exact aspect in the sign it is leaving. */
  start: Date;
  /** The ingress into the next sign. */
  end: Date;
  /** The sign the Moon is void in. */
  sign: string;
  nextSign: string;
  /** What the last aspect was; null only if the Moon made none in the sign. */
  lastAspect: { planet: string; aspect: string } | null;
}

const vocCache = new Map<number, VoidOfCourse>();

/** The void-of-course period ending at this ingress. */
function vocEndingAt(ingress: MoonIngress, signStart: Date): VoidOfCourse {
  const hit = vocCache.get(ingress.at.getTime());
  if (hit) return hit;

  // Walk backwards from the ingress in two-hour steps; the first step that
  // contains a perfecting aspect contains the last one. The Moon outruns every
  // planet (it never moves less than ~11°/day; Mercury at most ~2°), so the
  // separation only ever increases and each crossing is a clean - to + change.
  const sep = (t: number, body: string) =>
    norm360(apparentLongitude("Moon", new Date(t)) - apparentLongitude(body, new Date(t)));
  const floor = signStart.getTime();
  let hi = ingress.at.getTime();
  let found: { at: number; planet: string; aspect: string } | null = null;

  while (hi > floor && !found) {
    const lo = Math.max(floor, hi - 2 * HOUR);
    for (const body of VOC_BODIES) {
      const sLo = sep(lo, body), sHi = sep(hi, body);
      for (const { angle, name } of VOC_ASPECTS) {
        const fLo = wrap180(sLo - angle), fHi = wrap180(sHi - angle);
        if (fLo < 0 && fHi >= 0 && fHi - fLo < 90) {
          const at = bisect(lo, hi, (x) => wrap180(sep(x, body) - angle), 10 * 1000);
          if (!found || at > found.at) found = { at, planet: body, aspect: name };
        }
      }
    }
    hi = lo;
  }

  const leaving = SIGNS[(SIGNS.indexOf(ingress.sign as typeof SIGNS[number]) + 11) % 12];
  const voc: VoidOfCourse = {
    start: new Date(found ? found.at : floor),
    end: ingress.at,
    sign: leaving,
    nextSign: ingress.sign,
    lastAspect: found ? { planet: found.planet, aspect: found.aspect } : null,
  };
  vocCache.set(ingress.at.getTime(), voc);
  return voc;
}

/** Void-of-course periods overlapping [start, end), earliest first. */
export function voidOfCourseBetween(start: Date, end: Date): VoidOfCourse[] {
  // A sign lasts at least ~2 days, so three days either side brackets every
  // period that can touch the window, along with the ingress before it.
  const ingresses = moonIngressesBetween(new Date(start.getTime() - 3 * DAY), new Date(end.getTime() + 3 * DAY));
  const out: VoidOfCourse[] = [];
  for (let i = 1; i < ingresses.length; i++) {
    if (ingresses[i].at <= start) continue;
    const voc = vocEndingAt(ingresses[i], ingresses[i - 1].at);
    if (voc.start < end && voc.end > start) out.push(voc);
    if (voc.start >= end) break;
  }
  return out;
}

// ─── Local days ──────────────────────────────────────────────────────────────

/**
 * Calendar days belong to the reader, instants to the sky.
 *
 * A `day` Date throughout the app means "the calendar date in its own
 * getFullYear/getMonth/getDate fields" — that is how the screens and the
 * notification sender already pass days around. The optional IANA `timeZone`
 * says whose midnight bounds that date. Without one, the runtime's own zone is
 * used, which is right in a browser and wrong on a server: a UTC server
 * deciding a Chicago user's day puts every event from 00:00 to 05:00 UTC on the
 * wrong date.
 */

function zoneOffsetMs(at: number, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone, hourCycle: "h23",
    year: "numeric", month: "numeric", day: "numeric",
    hour: "numeric", minute: "numeric", second: "numeric",
  }).formatToParts(new Date(at));
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0);
  const asUtc = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour") % 24, get("minute"), get("second"));
  return asUtc - Math.floor(at / 1000) * 1000;
}

function validZone(timeZone?: string | null): string | undefined {
  if (!timeZone) return undefined;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone });
    return timeZone;
  } catch {
    return "UTC";
  }
}

/** The instant of 00:00 on y/m/d in the zone (runtime-local when none). */
export function zonedMidnight(y: number, m: number, d: number, timeZone?: string | null): Date {
  const tz = validZone(timeZone);
  if (!tz) return new Date(y, m, d);
  const guess = Date.UTC(y, m, d);
  let t = guess - zoneOffsetMs(guess, tz);
  t = guess - zoneOffsetMs(t, tz);   // second pass settles a DST change near midnight
  return new Date(t);
}

/** [local midnight, next local midnight) for the calendar date `day` names. */
export function localDayWindow(day: Date, timeZone?: string | null): { start: Date; end: Date } {
  const y = day.getFullYear(), m = day.getMonth(), d = day.getDate();
  return { start: zonedMidnight(y, m, d, timeZone), end: zonedMidnight(y, m, d + 1, timeZone) };
}

/** The calendar date an instant lands on in the zone. */
export function ymdIn(at: Date, timeZone?: string | null): { y: number; m: number; d: number } {
  const tz = validZone(timeZone);
  if (!tz) return { y: at.getFullYear(), m: at.getMonth(), d: at.getDate() };
  const shifted = new Date(at.getTime() + zoneOffsetMs(at.getTime(), tz));
  return { y: shifted.getUTCFullYear(), m: shifted.getUTCMonth(), d: shifted.getUTCDate() };
}

/** That calendar date as a runtime-local midnight Date — the app's "day" shape. */
export function calendarDayIn(at: Date, timeZone?: string | null): Date {
  const { y, m, d } = ymdIn(at, timeZone);
  return new Date(y, m, d);
}

/** True when the instant falls on the calendar date `day` names, in the zone. */
export function isOnDay(at: Date, day: Date, timeZone?: string | null): boolean {
  const { y, m, d } = ymdIn(at, timeZone);
  return y === day.getFullYear() && m === day.getMonth() && d === day.getDate();
}

/** The local hour (0–23) of an instant in the zone. */
export function hourIn(at: Date, timeZone?: string | null): number {
  const tz = validZone(timeZone);
  if (!tz) return at.getHours();
  return new Date(at.getTime() + zoneOffsetMs(at.getTime(), tz)).getUTCHours();
}

/** "2:15 PM" in the zone. */
export function clockIn(at: Date, timeZone?: string | null): string {
  const tz = validZone(timeZone);
  return at.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", ...(tz ? { timeZone: tz } : {}) });
}
