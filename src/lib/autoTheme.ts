/**
 * Choosing light or dark from the sun, at the reader's own location.
 *
 * "Auto" here does not mean the operating system's appearance setting — that
 * is its own thing and is kept as the fallback. It means the app is light
 * between sunrise and sunset where the reader actually is, and dark the rest
 * of the time, which is what someone asking for this is picturing.
 *
 * Pure and dependency-light on purpose: ThemeProvider runs on every page of
 * the app including the signed-out marketing pages, so the decision has to be
 * computable from a date and a pair of coordinates without touching the
 * network, the database or the session.
 *
 * On which clock: getSunriseSunset returns decimal hours already expressed in
 * the *device's* local timezone, so the comparison below is like for like with
 * the device clock. For the ordinary case — someone in roughly the place their
 * phone thinks it is — that is exactly right. Someone whose saved location is
 * a continent away from their device gets the sun of their saved place on the
 * clock they are reading by, which is the more useful of the two wrong answers
 * and is what the almanac already does.
 */

import { getSunriseSunset } from "./celestialMechanics";

export type ResolvedTheme = "light" | "dark";
export type ThemeMode = "light" | "dark" | "auto";

export interface Coords {
  lat: number;
  lng: number;
}

/** Decimal local hours for a moment, e.g. 13.5 for 13:30. */
function localHour(now: Date): number {
  return now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 3600;
}

/** Fold any hour into 0–24. */
function norm(hour: number): number {
  return ((hour % 24) + 24) % 24;
}

/**
 * Is `hour` inside the daylight arc that runs from sunrise to sunset?
 *
 * Written as an arc rather than a plain `rise <= h < set` because the two
 * boundaries are not guaranteed to sit inside the same 0–24 day. They are
 * expressed on the device's clock, so a saved location several timezones from
 * the device pushes one of them past midnight, and so does a high latitude
 * where the sun sets after midnight local time. Comparing on the arc is
 * correct in all of those and identical in the ordinary case.
 */
function withinDaylight(hour: number, sunrise: number, sunset: number): boolean {
  const h = norm(hour);
  const rise = norm(sunrise);
  const set = norm(sunset);
  return rise <= set ? h >= rise && h < set : h >= rise || h < set;
}

/**
 * The sun's declination, to within about a quarter of a degree.
 *
 * Only used to break the polar tie below, where the question is nothing
 * subtler than "is the sun up for the whole 24 hours or none of it" — an
 * approximation is ample, and it avoids exporting more of the ephemeris
 * internals for one branch.
 */
function solarDeclination(now: Date): number {
  const start = Date.UTC(now.getUTCFullYear(), 0, 0);
  const dayOfYear = Math.floor((now.getTime() - start) / 86_400_000);
  return -23.44 * Math.cos(((2 * Math.PI) / 365) * (dayOfYear + 10));
}

/**
 * Above the Arctic or below the Antarctic circle the sun may not rise or set
 * at all, and getSunriseSunset says so by returning null. Which of the two it
 * is comes from whether the sun is tilted toward this hemisphere.
 */
function polarDaylight(now: Date, lat: number): boolean {
  return Math.sign(solarDeclination(now)) === Math.sign(lat);
}

/**
 * Light or dark for this moment at these coordinates.
 *
 * Returns null when it cannot be decided — no coordinates — so the caller can
 * fall back to the operating system preference rather than this module
 * inventing one.
 */
export function themeForMoment(now: Date, coords: Coords | null): ResolvedTheme | null {
  if (!coords || !Number.isFinite(coords.lat) || !Number.isFinite(coords.lng)) return null;

  const times = getSunriseSunset(now, coords.lat, coords.lng);
  if (!times) return polarDaylight(now, coords.lat) ? "light" : "dark";

  return withinDaylight(localHour(now), times.sunrise, times.sunset) ? "light" : "dark";
}

/**
 * Milliseconds until the theme should next change, so the switch can be
 * scheduled instead of polled.
 *
 * Always at least a minute, and never more than six hours. The floor keeps a
 * boundary we have just crossed from scheduling a zero-length timer and
 * spinning; the ceiling means that if anything here is wrong — a stale
 * calculation, a device that slept through the transition, a location that
 * changed — the error is corrected within the afternoon rather than persisting
 * until the next reload.
 */
export function msUntilNextSwitch(now: Date, coords: Coords | null): number {
  const MINUTE = 60_000;
  const MAX = 6 * 60 * MINUTE;
  if (!coords) return MAX;

  const times = getSunriseSunset(now, coords.lat, coords.lng);
  if (!times) return MAX;

  const hour = localHour(now);
  // Hours ahead of now until each boundary, on the arc — so a boundary that
  // sits past midnight is "soon", not "minus twenty hours".
  const candidates = [times.sunrise, times.sunset]
    .map((b) => norm(norm(b) - hour))
    .filter((delta) => delta > 0)
    .sort((a, b) => a - b)
    .map((delta) => hour + delta);

  // Past both of today's boundaries, the next one is tomorrow's sunrise. Using
  // tomorrow's actual sunrise rather than today's avoids drifting by the few
  // minutes a day the sunrise moves, which matters near the solstices.
  if (candidates.length === 0) {
    const tomorrow = new Date(now.getTime() + 24 * 60 * MINUTE);
    const next = getSunriseSunset(tomorrow, coords.lat, coords.lng);
    const sunriseTomorrow = next ? next.sunrise : 6;
    const hoursAway = 24 - hour + sunriseTomorrow;
    return Math.min(MAX, Math.max(MINUTE, hoursAway * 60 * MINUTE));
  }

  return Math.min(MAX, Math.max(MINUTE, (candidates[0] - hour) * 60 * MINUTE));
}

/* ─── Where the coordinates come from ─── */

/**
 * A copy of the reader's coordinates that is not keyed by user id.
 *
 * lib/userLocation caches the full location under mapped:location:<userId>,
 * which the theme cannot read: ThemeProvider sits above the session and has no
 * user id to look one up with, and it also runs on pages where nobody is
 * signed in. So saving a location also writes this, which holds two numbers
 * and no label — the least that answers "where is the sun right now".
 */
const COORDS_KEY = "mapped:theme-coords";

export function readThemeCoords(): Coords | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(COORDS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Coords;
      if (Number.isFinite(parsed?.lat) && Number.isFinite(parsed?.lng)) {
        return { lat: parsed.lat, lng: parsed.lng };
      }
    }
    return adoptExistingLocation();
  } catch {
    return null;
  }
}

/**
 * One-time pickup of a location saved before this key existed.
 *
 * Everyone already using the app has coordinates cached under
 * mapped:location:<userId>, and without this they would turn Auto on and find
 * it following their device exactly as before, with nothing to explain why.
 * Waiting for the next location save would fix it eventually; this fixes it on
 * the first read.
 *
 * Scanning for the key is the price of the theme sitting above the session and
 * having no user id to construct one with. It runs once — the value is written
 * to the stable key immediately after.
 */
function adoptExistingLocation(): Coords | null {
  try {
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (!key || !key.startsWith("mapped:location:")) continue;
      const parsed = JSON.parse(window.localStorage.getItem(key) || "null") as Coords | null;
      if (parsed && Number.isFinite(parsed.lat) && Number.isFinite(parsed.lng)) {
        const coords = { lat: parsed.lat, lng: parsed.lng };
        writeThemeCoords(coords);
        return coords;
      }
    }
  } catch {
    // unreadable storage — auto falls back to the system setting
  }
  return null;
}

export function writeThemeCoords(coords: Coords): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(COORDS_KEY, JSON.stringify({ lat: coords.lat, lng: coords.lng }));
  } catch {
    // storage full or blocked — auto just falls back to the system preference
  }
}
