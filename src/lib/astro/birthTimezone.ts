/**
 * Birth time → UTC, the way it was actually kept at that place on that date.
 *
 * This is the largest single source of wrong charts, so the rules are written
 * down here once and every chart path uses them:
 *
 * 1. THE ZONE comes from the chart row (`charts.timezone` / `connections.timezone`),
 *    which holds the real IANA zone for the birthplace, resolved server-side
 *    from the coordinates with geo-tz (see /api/timezone and lib/astro/geoTimezone).
 *    "UTC" was a placeholder every chart was saved with until Oct 2026 and is
 *    treated as "not resolved yet", like null. A user may also store a manual
 *    override: a fixed offset ("UTC-05:00") or "LMT" (local mean time).
 *
 * 2. HISTORY comes from the runtime's own IANA data (Intl), except before 1970
 *    for the zones in tzBackzone.ts, whose earlier history the runtime does not
 *    carry (Iceland was UTC−1 until 1968; Amsterdam kept +0:19:32 until 1937).
 *
 * 3. LOCAL MEAN TIME: before a zone adopted standard time, clocks kept the
 *    local mean time of the TOWN, not of the zone's reference city. IANA's
 *    LMT entry is Berlin's (+0:53:28) for every German birth; Einstein's Ulm
 *    was +0:39:58. So within a zone's initial LMT period we use the
 *    birthplace's own longitude (4 minutes of time per degree).
 *
 * 4. CLOCK CHANGES: a time that never existed (the hour skipped when clocks
 *    went forward) is read as the clock before the change — someone writing
 *    02:30 had not moved their clock yet — which equals 03:30 daylight time.
 *    A time that happened twice (the hour repeated when clocks went back) is
 *    read as the FIRST occurrence, still on daylight time. Both are reported,
 *    never silent, so the chart page can say which reading was used.
 *
 * 5. NO ZONE AT ALL (offline, or a chart not yet resolved): fall back to the
 *    coarse box table in ./timezone and mark the result `estimated`, so the UI
 *    tells the user rather than presenting it as their chart.
 *
 * Client-safe: no filesystem, no geo-tz. Runs in the browser, the native app
 * and the API routes identically.
 */

import { BACKZONE } from "./tzBackzone";
import { getTimezoneForCoords } from "./timezone";

/** 1970-01-01T00:00Z in seconds — the end of the backzone table's authority. */
const BACKZONE_CUTOFF = 0;

/** The stored values that mean "no zone resolved yet". */
const PLACEHOLDERS = new Set(["", "UTC"]);

export type ZoneSpec =
  | { kind: "iana"; zone: string }
  | { kind: "fixed"; offsetSeconds: number }
  | { kind: "lmt" };

const fmtCache = new Map<string, Intl.DateTimeFormat>();
function offsetFormatter(zone: string): Intl.DateTimeFormat {
  let f = fmtCache.get(zone);
  if (!f) {
    f = new Intl.DateTimeFormat("en-US", { timeZone: zone, timeZoneName: "longOffset" });
    fmtCache.set(zone, f);
  }
  return f;
}

function isKnownIana(zone: string): boolean {
  if (BACKZONE[zone]) return true;
  try {
    offsetFormatter(zone);
    return true;
  } catch {
    return false;
  }
}

/**
 * Read a stored timezone value. Returns null for "not resolved" (null, empty,
 * the legacy "UTC" placeholder, or anything unrecognisable).
 */
export function parseZone(tz: string | null | undefined): ZoneSpec | null {
  if (tz == null) return null;
  const s = String(tz).trim();
  if (PLACEHOLDERS.has(s)) return null;
  if (s === "LMT") return { kind: "lmt" };
  const m = s.match(/^UTC([+\-−])(\d{1,2})(?::?(\d{2}))?$/);
  if (m) {
    const h = Number(m[2]), min = Number(m[3] || 0);
    if (h > 14 || min > 59) return null;
    return { kind: "fixed", offsetSeconds: (m[1] === "+" ? 1 : -1) * (h * 3600 + min * 60) };
  }
  return isKnownIana(s) ? { kind: "iana", zone: s } : null;
}

/** True when a stored timezone is a real zone or a deliberate override. */
export function isResolvedZone(tz: string | null | undefined): boolean {
  return parseZone(tz) !== null;
}

/** Stored form of a manual fixed offset: "UTC+05:30", "UTC-05:00". */
export function formatFixedZone(offsetSeconds: number): string {
  const sign = offsetSeconds < 0 ? "-" : "+";
  const abs = Math.abs(Math.round(offsetSeconds / 60));
  return `UTC${sign}${String(Math.floor(abs / 60)).padStart(2, "0")}:${String(abs % 60).padStart(2, "0")}`;
}

/** Display form of an offset: "UTC−5", "UTC+5:30", "UTC+0:39:58". */
export function formatOffsetLabel(offsetSeconds: number): string {
  const s = Math.round(offsetSeconds);
  if (s === 0) return "UTC±0";
  const sign = s < 0 ? "−" : "+";
  const abs = Math.abs(s);
  const h = Math.floor(abs / 3600), m = Math.floor((abs % 3600) / 60), sec = abs % 60;
  if (sec) return `UTC${sign}${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  if (m) return `UTC${sign}${h}:${String(m).padStart(2, "0")}`;
  return `UTC${sign}${h}`;
}

/** Offset (seconds east) Intl reports for `zone` at a UTC instant, to the second. */
function intlOffsetSeconds(zone: string, utcSec: number): number {
  const part = offsetFormatter(zone).formatToParts(new Date(utcSec * 1000)).find((p) => p.type === "timeZoneName")?.value || "GMT";
  const m = part.match(/GMT([+\-−])(\d{1,2})(?::(\d{2}))?(?::(\d{2}))?/);
  if (!m) return 0;
  return (m[1] === "+" ? 1 : -1) * (Number(m[2]) * 3600 + Number(m[3] || 0) * 60 + Number(m[4] || 0));
}

const firstTransitionCache = new Map<string, number | null>();
/**
 * The end of a zone's initial (LMT) period according to Intl, in UTC seconds,
 * or null when the zone has no such period (Etc/GMT+5, UTC). Found by a yearly
 * scan and a bisection; cached per zone.
 */
function intlFirstTransition(zone: string): number | null {
  if (firstTransitionCache.has(zone)) return firstTransitionCache.get(zone)!;
  const yearStart = (y: number) => Date.UTC(y, 0, 1) / 1000;
  const initial = intlOffsetSeconds(zone, yearStart(1800));
  let result: number | null = null;
  for (let y = 1801; y <= 2000; y++) {
    if (intlOffsetSeconds(zone, yearStart(y)) !== initial) {
      let lo = yearStart(y - 1), hi = yearStart(y);
      while (hi - lo > 1) {
        const mid = Math.floor((lo + hi) / 2);
        if (intlOffsetSeconds(zone, mid) === initial) lo = mid; else hi = mid;
      }
      result = hi;
      break;
    }
  }
  firstTransitionCache.set(zone, result);
  return result;
}

const abbrCache = new Map<string, Intl.DateTimeFormat>();
function abbreviation(zone: string, utcSec: number): string | null {
  try {
    let f = abbrCache.get(zone);
    if (!f) {
      f = new Intl.DateTimeFormat("en-US", { timeZone: zone, timeZoneName: "short" });
      abbrCache.set(zone, f);
    }
    const v = f.formatToParts(new Date(utcSec * 1000)).find((p) => p.type === "timeZoneName")?.value || null;
    // "GMT-5" style names add nothing beside the offset label.
    return v && !/^(GMT|UTC)([+\-−]|$)/.test(v) ? v : null;
  } catch {
    return null;
  }
}

interface ZoneState {
  offset: number;      // seconds east of UTC
  dst: boolean;
  lmt: boolean;        // the birthplace's local mean time is in force
  backzone: boolean;   // came from tzBackzone.ts rather than the runtime
}

/** Seconds east of UTC for the birthplace's local mean time. */
function lmtSeconds(lon: number): number {
  return Math.round(lon * 240);
}

/** What the clocks in `zone` (at longitude `lon`) read at a UTC instant. */
function zoneStateAt(zone: string, utcSec: number, lon: number): ZoneState {
  const bz = BACKZONE[zone];
  if (bz && utcSec < BACKZONE_CUTOFF) {
    let idx = -1;
    for (let i = 0; i < bz.transitions.length && bz.transitions[i][0] <= utcSec; i++) idx = i;
    if (idx < 0) {
      return bz.lmt != null
        ? { offset: lmtSeconds(lon), dst: false, lmt: true, backzone: true }
        : { offset: bz.initial, dst: false, lmt: false, backzone: true };
    }
    return { offset: bz.transitions[idx][1], dst: bz.transitions[idx][2] === 1, lmt: false, backzone: true };
  }
  const first = intlFirstTransition(zone);
  if (first != null && utcSec < first) return { offset: lmtSeconds(lon), dst: false, lmt: true, backzone: false };
  const offset = intlOffsetSeconds(zone, utcSec);
  // Daylight time = ahead of the smaller of that year's January and July offsets.
  const y = new Date(utcSec * 1000).getUTCFullYear();
  const std = Math.min(intlOffsetSeconds(zone, Date.UTC(y, 0, 1) / 1000), intlOffsetSeconds(zone, Date.UTC(y, 6, 1) / 1000));
  return { offset, dst: offset > std, lmt: false, backzone: false };
}

export interface BirthOffset {
  /** Hours east of UTC applied to the birth time. */
  offsetHours: number;
  /** The stored zone value that was used — null when the zone was only estimated. */
  zone: string | null;
  /** The zone actually consulted (the estimate's guess, when `source` is "estimated"). */
  zoneUsed: string;
  source: "zone" | "manual" | "lmt" | "estimated";
  abbreviation: string | null;
  dst: boolean;
  /** The birthplace's local mean time was used (pre-standard-time birth, or forced). */
  lmt: boolean;
  /** Pre-1970 history came from the backzone table, not the runtime. */
  backzone: boolean;
  /** The local time was skipped ("gap") or repeated ("overlap") by a clock change. */
  ambiguity: null | { kind: "gap" | "overlap"; usedOffsetHours: number; otherOffsetHours: number };
}

/**
 * Resolve a LOCAL birth date/time at a place to its UTC offset.
 * `localHour` is decimal (14.5 = 14:30).
 */
export function resolveBirthOffset(
  tz: string | null | undefined,
  lat: number, lon: number,
  year: number, month: number, day: number, localHour: number,
): BirthOffset {
  const spec = parseZone(tz);
  const wall = Date.UTC(year, month - 1, day) / 1000 + Math.round(localHour * 3600);

  if (spec?.kind === "fixed") {
    return {
      offsetHours: spec.offsetSeconds / 3600, zone: tz!.trim(), zoneUsed: tz!.trim(), source: "manual",
      abbreviation: null, dst: false, lmt: false, backzone: false, ambiguity: null,
    };
  }
  if (spec?.kind === "lmt") {
    return {
      offsetHours: lmtSeconds(lon) / 3600, zone: "LMT", zoneUsed: "LMT", source: "lmt",
      abbreviation: "LMT", dst: false, lmt: true, backzone: false, ambiguity: null,
    };
  }

  const zone = spec?.kind === "iana" ? spec.zone : getTimezoneForCoords(lat, lon);
  const at = (u: number) => zoneStateAt(zone, u, lon);

  // Every offset in force within a day either side is a candidate; a candidate
  // is valid if the instant it implies really does carry that offset.
  const before = at(wall - 86400).offset;
  const after = at(wall + 86400).offset;
  const candidates = Array.from(new Set([before, after]));
  const valid = candidates.filter((o) => at(wall - o).offset === o);

  let offset: number;
  let ambiguity: BirthOffset["ambiguity"] = null;
  if (valid.length === 1) {
    offset = valid[0];
  } else if (valid.length > 1) {
    // Repeated hour: the first occurrence is the larger offset (earlier instant).
    offset = Math.max(...valid);
    ambiguity = { kind: "overlap", usedOffsetHours: offset / 3600, otherOffsetHours: Math.min(...valid) / 3600 };
  } else {
    // Skipped hour: read on the clock as it stood before the change.
    offset = before;
    ambiguity = { kind: "gap", usedOffsetHours: before / 3600, otherOffsetHours: after / 3600 };
  }

  const state = at(wall - offset);
  return {
    offsetHours: offset / 3600,
    zone: spec ? zone : null,
    zoneUsed: zone,
    source: spec ? "zone" : "estimated",
    abbreviation: state.lmt ? "LMT" : state.backzone ? null : abbreviation(zone, wall - offset),
    dst: state.dst,
    lmt: state.lmt,
    backzone: state.backzone,
    ambiguity,
  };
}

/**
 * Local birth time → decimal UT hour on the birth date (may run below 0 or
 * past 24; julday() is linear in the hour). For callers that pass a UT hour
 * rather than a chart, like astrocartography.
 */
export function birthTimeToUtcHour(
  birthDate: string, birthTime: string, timezone: string | null | undefined,
  latitude: number, longitude: number,
): number {
  const [y, m, d] = birthDate.split("-").map(Number);
  const [hh, mm] = String(birthTime || "12:00").split(":").map(Number);
  const localHour = hh + (mm || 0) / 60;
  return localHour - resolveBirthOffset(timezone, latitude, longitude, y, m, d, localHour).offsetHours;
}

function hhmm(hours: number): string {
  const total = Math.round((((hours % 24) + 24) % 24) * 60);
  return `${String(Math.floor(total / 60) % 24).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

/** "America/Chicago (CDT, UTC−5)", "Local mean time (UTC+0:39:58)", "UTC−05:00 (set by you)". */
export function describeBirthOffset(r: BirthOffset): string {
  const label = formatOffsetLabel(r.offsetHours * 3600);
  if (r.source === "manual") return `${label} (set by you)`;
  if (r.source === "lmt") return `Local mean time (${label}, set by you)`;
  const zone = r.zoneUsed.replace(/_/g, " ");
  if (r.lmt) return `Local mean time for the birthplace (${label}) — before ${zone} kept standard time`;
  return `${zone} (${r.abbreviation ? `${r.abbreviation}, ` : ""}${label})`;
}

/**
 * A UTC instant on the clocks of `zone`:
 * { date: "2026-05-05", time: "07:43", zone, abbreviation: "CDT" | null }.
 */
export function localClock(iso: string, zone: string) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: zone, year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZoneName: "short",
    }).formatToParts(new Date(iso)).map((p) => [p.type, p.value]),
  );
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    time: `${parts.hour}:${parts.minute}`,
    zone,
    abbreviation: (parts.timeZoneName as string | undefined) || null,
  };
}

/** One sentence about a skipped or repeated clock hour, or null. */
export function describeAmbiguity(r: BirthOffset, birthTime: string): string | null {
  if (!r.ambiguity) return null;
  const used = formatOffsetLabel(r.ambiguity.usedOffsetHours * 3600);
  const other = formatOffsetLabel(r.ambiguity.otherOffsetHours * 3600);
  if (r.ambiguity.kind === "gap") {
    const [h, m] = birthTime.split(":").map(Number);
    const shifted = hhmm(h + (m || 0) / 60 + (r.ambiguity.otherOffsetHours - r.ambiguity.usedOffsetHours));
    return `Clocks went forward that night, so ${birthTime} never appeared on them. We read it on the old time (${used}), the same moment as ${shifted} on the new. To read it on the new time instead, set ${other} below.`;
  }
  return `Clocks went back that night, so ${birthTime} happened twice. We used the first one (${used}). If it was the second, set ${other} below.`;
}
