/**
 * Birth time rectification that can show its working.
 *
 * What this replaces: a 2.5 second artificial pause followed by the midpoint
 * of whichever time window the user had just picked, paired with a rising sign
 * taken straight from one personality dropdown and a confidence number of
 * 0.55 + 0.08 per life event. The life events were collected and never read.
 * The rising sign was never checked against the time, so the screen could —
 * and routinely would — name a sign that was not rising at the time it had
 * just printed.
 *
 * What this does instead rests on one fact that is not a matter of opinion:
 * for a given date and place, each sign rises over a known, computable stretch
 * of the clock. Scanning the day gives those stretches exactly. Everything the
 * user tells us is then used to narrow which stretch they were born in, and
 * the answer is returned as the stretch itself — a span with a start and an
 * end — rather than as a single invented minute.
 *
 * The honesty is the point. A span of forty minutes is a genuinely useful
 * result; a span of three hours is a weak one, and looks weak, which is what
 * the old percentage was hiding. Where the evidence contradicts itself the
 * result says so instead of quietly preferring one input.
 */

import { getHouses, julday } from "./astro/ephemeris";
import { getUtcOffsetHours } from "./astro/calculateChart";
import { SIGN_NAMES } from "./astro/constants";
import { toSidereal, normalizeAyanamsa, type AyanamsaName } from "./astro/vedic/ayanamsa";
import { TIME_WINDOWS, type TimeWindow } from "./birth-time";

/** A stretch of local clock time during which one sign was on the ascendant. */
export interface RisingInterval {
  sign: string;
  /** Local decimal hours, 0–24. startHour < endHour; a day never wraps here. */
  startHour: number;
  endHour: number;
}

export interface RisingScanInput {
  birthDate: string;            // YYYY-MM-DD
  latitude: number;
  longitude: number;
  zodiacSystem?: string;        // "tropical" | "sidereal"
  ayanamsa?: string;
}

/**
 * Resolution of the scan, in minutes.
 *
 * The ascendant moves through a sign in roughly two hours at mid latitudes,
 * but far faster for the short-ascension signs and at high latitudes, so the
 * step has to be small enough not to step over a narrow one. One minute is
 * 1440 ascendant calculations for a day, each of which is a handful of
 * trigonometric operations — fast enough to run in the browser, and it means
 * a boundary is never reported more than a minute out.
 */
const STEP_MINUTES = 1;

function ascendantSign(
  jd: number,
  latitude: number,
  longitude: number,
  sidereal: boolean,
  ayanamsa: AyanamsaName,
): string {
  const { ascendant } = getHouses(jd, latitude, longitude);
  const lon = sidereal ? toSidereal(ascendant, jd, ayanamsa) : ascendant;
  const norm = ((lon % 360) + 360) % 360;
  return SIGN_NAMES[Math.floor(norm / 30)];
}

/**
 * Every sign that rose on this date at this place, and when.
 *
 * Returned in clock order. A sign can appear twice — the one that was rising
 * at midnight typically also returns at the end of the day — and both entries
 * are kept, because "which of the two" is exactly what the user's memory of
 * morning versus night resolves.
 */
export function risingIntervals(input: RisingScanInput): RisingInterval[] {
  const [year, month, day] = input.birthDate.split("-").map(Number);
  if (!year || !month || !day) return [];

  const sidereal = input.zodiacSystem === "sidereal";
  const ayanamsa = normalizeAyanamsa(input.ayanamsa);

  const out: RisingInterval[] = [];
  let current: RisingInterval | null = null;

  for (let minute = 0; minute <= 24 * 60; minute += STEP_MINUTES) {
    const hour = Math.min(minute / 60, 24);
    // The offset is resolved per sample rather than once for the day: a birth
    // on a daylight-saving changeover has two different offsets within the
    // same date, and a single offset would slide every interval after the
    // change by an hour.
    const tzOffset = getUtcOffsetHours(input.latitude, input.longitude, year, month, day, hour);
    const jd = julday(year, month, day, hour - tzOffset);
    const sign = ascendantSign(jd, input.latitude, input.longitude, sidereal, ayanamsa);

    if (!current || current.sign !== sign) {
      if (current) current.endHour = hour;
      current = { sign, startHour: hour, endHour: hour };
      out.push(current);
    } else {
      current.endHour = hour;
    }
  }

  // A trailing sliver narrower than the step is scan noise at the boundary,
  // not a sign that genuinely rose.
  return out.filter((iv) => iv.endHour - iv.startHour >= STEP_MINUTES / 60);
}

/** The remembered window as a pair of local hours. Wraps past midnight. */
export function windowRange(w: TimeWindow): { startHour: number; endHour: number } {
  const RANGES: Record<TimeWindow, [number, number]> = {
    early_morning: [5, 8],
    morning: [8, 11],
    midday: [11, 14],
    afternoon: [14, 17],
    early_evening: [17, 20],
    evening: [20, 23],
    late_night: [23, 26], // 11 PM – 2 AM, expressed past midnight
    overnight: [2, 5],
  };
  const [startHour, endHour] = RANGES[w];
  return { startHour, endHour };
}

/** Overlap of an interval with a window, in local hours, or null. */
function overlap(
  iv: RisingInterval,
  win: { startHour: number; endHour: number },
): { startHour: number; endHour: number } | null {
  // A window that runs past midnight is tested as two plain ranges rather than
  // with modular arithmetic, which is where wrap bugs tend to live.
  const spans: [number, number][] =
    win.endHour > 24
      ? [[win.startHour, 24], [0, win.endHour - 24]]
      : [[win.startHour, win.endHour]];

  for (let i = 0; i < spans.length; i++) {
    const [ws, we] = spans[i];
    const s = Math.max(iv.startHour, ws);
    const e = Math.min(iv.endHour, we);
    if (e > s) {
      // The piece after midnight is reported as 24–26 rather than 0–2, so the
      // caller can take a plain min and max across matches. On a wrapping
      // window the two pieces otherwise sit at opposite ends of the axis, and
      // min/max spreads the answer across the entire day instead of the three
      // hours the window actually covers.
      const shift = spans.length === 2 && i === 1 ? 24 : 0;
      return { startHour: s + shift, endHour: e + shift };
    }
  }
  return null;
}

export interface RectificationInput extends RisingScanInput {
  /** The window they remember being told about, if any. */
  window: TimeWindow | null;
  /** Rising signs their answers point at, best first. May be empty. */
  candidateSigns: string[];
}

export type RectificationOutcome =
  /** The answers agree: one sign, rising inside the remembered window. */
  | "agreed"
  /** Only the window is usable — no sign was offered, or none matched. */
  | "window_only"
  /** Only the sign is usable — no window was given. */
  | "sign_only"
  /** The sign they describe was not rising during the window they remember. */
  | "conflict";

export interface RectificationResult {
  outcome: RectificationOutcome;
  /** Local clock span the birth most likely falls in. */
  startHour: number;
  endHour: number;
  /** Midpoint of that span — the time to store if they accept it. */
  estimatedTime: string;
  /** The sign rising across the span, when the span has just one. */
  risingSign: string | null;
  /** Width of the span in minutes. This IS the uncertainty. */
  spanMinutes: number;
  /** Signs that were rising during the remembered window. */
  signsInWindow: string[];
  /** When a described sign was rising, even though it fell outside the window. */
  signIntervals: RisingInterval[];
}

function toClock(hour: number): string {
  const h = ((Math.floor(hour) % 24) + 24) % 24;
  const m = Math.round((hour - Math.floor(hour)) * 60) % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/**
 * Narrow a birth time from what the person can actually tell us.
 *
 * Never throws and never returns nothing: with no window and no sign it still
 * hands back the whole day, which is the truthful answer to having been told
 * nothing, and the caller can say so.
 */
export function rectifyBirthTime(input: RectificationInput): RectificationResult {
  const intervals = risingIntervals(input);
  const win = input.window ? windowRange(input.window) : null;

  const inWindow = win
    ? intervals
        .map((iv) => ({ iv, ov: overlap(iv, win) }))
        .filter((x) => x.ov !== null)
        .map((x) => ({ ...x.iv, ...x.ov! }))
    : [];
  const signsInWindow = [...new Set(inWindow.map((iv) => iv.sign))];

  // Intervals for the first candidate sign the scan actually saw. Preference
  // order is the caller's; we do not re-rank their evidence.
  const chosenSign = input.candidateSigns.find((s) => intervals.some((iv) => iv.sign === s)) ?? null;
  const signIntervals = chosenSign ? intervals.filter((iv) => iv.sign === chosenSign) : [];

  const finish = (
    outcome: RectificationOutcome,
    startHour: number,
    endHour: number,
    risingSign: string | null,
  ): RectificationResult => ({
    outcome,
    startHour,
    endHour,
    estimatedTime: toClock((startHour + endHour) / 2),
    risingSign,
    spanMinutes: Math.max(0, Math.round((endHour - startHour) * 60)),
    signsInWindow,
    signIntervals,
  });

  // Both kinds of evidence, and they agree: the tightest answer available.
  if (chosenSign && win) {
    const matched = inWindow.filter((iv) => iv.sign === chosenSign);
    if (matched.length > 0) {
      const best = matched.reduce((a, b) => (b.endHour - b.startHour > a.endHour - a.startHour ? b : a));
      return finish("agreed", best.startHour, best.endHour, chosenSign);
    }
    // They describe a sign that was not rising when they think they were born.
    // Reporting the window and naming the contradiction is more useful than
    // silently dropping whichever input we liked less.
    if (inWindow.length > 0) {
      const start = Math.min(...inWindow.map((iv) => iv.startHour));
      const end = Math.max(...inWindow.map((iv) => iv.endHour));
      return finish("conflict", start, end, signsInWindow.length === 1 ? signsInWindow[0] : null);
    }
  }

  if (win && inWindow.length > 0) {
    const start = Math.min(...inWindow.map((iv) => iv.startHour));
    const end = Math.max(...inWindow.map((iv) => iv.endHour));
    return finish("window_only", start, end, signsInWindow.length === 1 ? signsInWindow[0] : null);
  }

  if (chosenSign && signIntervals.length > 0) {
    const best = signIntervals.reduce((a, b) => (b.endHour - b.startHour > a.endHour - a.startHour ? b : a));
    return finish("sign_only", best.startHour, best.endHour, chosenSign);
  }

  return finish("window_only", 0, 24, null);
}

/** One sentence naming what the span actually rests on. Shown to the user. */
export function describeMethod(r: RectificationResult): string {
  switch (r.outcome) {
    case "agreed":
      return `${r.risingSign} was rising between ${toClock(r.startHour)} and ${toClock(r.endHour)} where you were born, which is inside the window you remember.`;
    case "conflict":
      return `The description you picked points at a rising sign that wasn't on the horizon during that window. The span below is what was actually rising then.`;
    case "sign_only":
      return `${r.risingSign} was rising between ${toClock(r.startHour)} and ${toClock(r.endHour)} where you were born. Narrowing it further needs a rough time of day.`;
    default:
      return r.spanMinutes >= 23 * 60
        ? `Without a time of day or a description to go on, this is the whole day.`
        : `This is the span your remembered window covers, with ${r.signsInWindow.length > 1 ? "more than one sign" : "one sign"} rising in it.`;
  }
}
