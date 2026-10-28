/**
 * Formatting for transit dates and the natal points a transit lands on.
 *
 * Transits span wildly different lengths — a Mercury aspect lasts a fortnight,
 * a Pluto aspect most of a decade — so the date precision has to move with
 * them. Printing "Mar 7, 2032" for the end of a Pluto transit claims a
 * certainty nobody has; "2024 – 2032" says the true thing.
 */

const SHORT_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const DAY_MS = 86_400_000;

/** Widths at which the unit coarsens, in days of window. */
const MONTH_PRECISION_ABOVE = 120;
const YEAR_PRECISION_ABOVE = 1200;

/** Beyond this many months out, an exact hit is given as a month, not a day. */
const EXACT_MONTH_PRECISION_ABOVE = 12;

function parseTransitDate(dateStr?: string | number): Date | null {
  if (!dateStr) return null;
  const [y, m, d] = String(dateStr).split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(Date.UTC(y, m - 1, d));
}

/** Full day precision: "Oct 31, 2026". */
export function fmtTransitDate(dateStr?: string | number): string {
  const dt = parseTransitDate(dateStr);
  if (!dt) return "";
  return `${SHORT_MONTHS[dt.getUTCMonth()]} ${dt.getUTCDate()}, ${dt.getUTCFullYear()}`;
}

/** A transit's window, at the precision its width justifies. */
export function fmtDateRange(start?: string, end?: string): string {
  const a = parseTransitDate(start);
  const b = parseTransitDate(end);
  if (!a || !b) return "";

  const days = (b.getTime() - a.getTime()) / DAY_MS;
  const [yearA, yearB] = [a.getUTCFullYear(), b.getUTCFullYear()];
  const [monthA, monthB] = [SHORT_MONTHS[a.getUTCMonth()], SHORT_MONTHS[b.getUTCMonth()]];

  if (days > YEAR_PRECISION_ABOVE) {
    return yearA === yearB ? `${yearB}` : `${yearA} – ${yearB}`;
  }
  if (days > MONTH_PRECISION_ABOVE) {
    return yearA === yearB
      ? `${monthA} – ${monthB} ${yearB}`
      : `${monthA} ${yearA} – ${monthB} ${yearB}`;
  }
  return yearA === yearB
    ? `${monthA} ${a.getUTCDate()} – ${monthB} ${b.getUTCDate()}, ${yearB}`
    : `${fmtTransitDate(start)} – ${fmtTransitDate(end)}`;
}

/** The exact hit, at the precision its distance justifies. */
export function fmtExactDate(dateStr?: string | number, now: number = Date.now()): string {
  const dt = parseTransitDate(dateStr);
  if (!dt) return "";
  const monthsOut = Math.abs(dt.getTime() - now) / DAY_MS / 30.44;
  if (monthsOut > EXACT_MONTH_PRECISION_ABOVE) {
    return `${SHORT_MONTHS[dt.getUTCMonth()]} ${dt.getUTCFullYear()}`;
  }
  return fmtTransitDate(dateStr);
}

/**
 * Name every natal point a transit lands on. The calculator folds a transit
 * that crosses a natal cluster into one entry, so callers that only read
 * `natalPlanet` would quietly lose the rest.
 */
export function natalPointsLabel(ta: { natalPlanet: string; alsoNatal?: string[] }): string {
  const names = [ta.natalPlanet, ...(ta.alsoNatal ?? [])];
  if (names.length === 1) return names[0];
  return `${names.slice(0, -1).join(", ")} & ${names[names.length - 1]}`;
}
