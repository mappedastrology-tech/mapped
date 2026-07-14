/**
 * Upcoming exact transit timing — computes the next EXACT dates when the slow,
 * meaningful transiting planets perfectly aspect a user's natal points.
 *
 * This lets the chatbot give concrete timing ("Saturn exact on your Venus around
 * March 12, 2027") instead of a vague "soon."
 *
 * Reuses astronomy-engine the same way currentSky.ts does:
 * Astronomy.GeoVector(body, time, true) → Astronomy.Ecliptic(vec).elon.
 */

import * as Astronomy from "astronomy-engine";

export interface TimingChart {
  planets?: { name: string; sign: string; position: number; house: string | null; retrograde: boolean }[];
  houses?: { number: number; sign: string; position: number }[];
}

const SIGN_NAMES = [
  "Ari", "Tau", "Gem", "Can", "Leo", "Vir",
  "Lib", "Sco", "Sag", "Cap", "Aqu", "Pis",
];

/** Slow, meaningful transiting bodies to scan. */
const TRANSIT_BODIES: { name: string; body: Astronomy.Body }[] = [
  { name: "Jupiter", body: Astronomy.Body.Jupiter },
  { name: "Saturn", body: Astronomy.Body.Saturn },
  { name: "Uranus", body: Astronomy.Body.Uranus },
  { name: "Neptune", body: Astronomy.Body.Neptune },
  { name: "Pluto", body: Astronomy.Body.Pluto },
];

/** The personal natal planets we look for (from chart.planets[]). */
const NATAL_PERSONAL = ["Sun", "Moon", "Mercury", "Venus", "Mars"];

/** Aspects to check (sextile skipped to reduce noise). */
const ASPECTS: { angle: number; word: string }[] = [
  { angle: 0, word: "conjunct" },
  { angle: 90, word: "square" },
  { angle: 120, word: "trine" },
  { angle: 180, word: "opposite" },
];

const OUTER_PLANETS = new Set(["Uranus", "Neptune", "Pluto"]);

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const MS_PER_DAY = 24 * 60 * 60 * 1000;

interface NatalPoint {
  label: string; // how it's shown to the user, e.g. "Venus", "Ascendant"
  lon: number; // absolute ecliptic longitude 0–360
}

interface Hit {
  transitPlanet: string;
  aspectWord: string;
  point: string;
  date: Date;
}

/** Convert a 3-letter sign abbr + degrees-within-sign to absolute longitude. */
function toAbsLon(sign: string, position: number): number | null {
  const idx = SIGN_NAMES.indexOf(sign);
  if (idx < 0) return null;
  return idx * 30 + position;
}

/** Ecliptic longitude of a transiting body on a date (matches currentSky.ts). */
function eclipticLongitude(body: Astronomy.Body, date: Date): number {
  const time = Astronomy.MakeTime(date);
  const vec = Astronomy.GeoVector(body, time, true);
  return Astronomy.Ecliptic(vec).elon;
}

/** Fold an angle to the range (-180, 180]. */
function foldAngle(a: number): number {
  let x = ((a % 360) + 360) % 360; // 0–360
  if (x > 180) x -= 360; // (-180, 180]
  return x;
}

function formatDate(d: Date): string {
  return `${MONTH_NAMES[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

/** Build the list of natal target points from the chart. */
function collectNatalPoints(chart: TimingChart): NatalPoint[] {
  const points: NatalPoint[] = [];

  for (const p of chart.planets ?? []) {
    if (!NATAL_PERSONAL.includes(p.name)) continue;
    const lon = toAbsLon(p.sign, p.position);
    if (lon == null) continue;
    points.push({ label: p.name, lon });
  }

  const houses = chart.houses ?? [];
  const asc = houses.find((h) => h.number === 1);
  if (asc) {
    const lon = toAbsLon(asc.sign, asc.position);
    if (lon != null) points.push({ label: "Ascendant", lon });
  }
  const mc = houses.find((h) => h.number === 10);
  if (mc) {
    const lon = toAbsLon(mc.sign, mc.position);
    if (lon != null) points.push({ label: "Midheaven", lon });
  }

  return points;
}

/**
 * Compute the next EXACT dates that slow transiting planets aspect the user's
 * natal points, returning a formatted text block for the chatbot.
 *
 * @param chart       user's natal chart
 * @param fromDate    scan start (default: today)
 * @param monthsAhead scan window in months (default: 18)
 */
export function getUpcomingTransitWindows(
  chart: TimingChart,
  fromDate: Date = new Date(),
  monthsAhead: number = 18,
): string {
  const natalPoints = collectNatalPoints(chart);
  if (natalPoints.length === 0) return "";

  const start = new Date(Date.UTC(
    fromDate.getUTCFullYear(),
    fromDate.getUTCMonth(),
    fromDate.getUTCDate(),
  ));
  const end = new Date(start.getTime());
  end.setUTCMonth(end.getUTCMonth() + monthsAhead);
  const totalDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / MS_PER_DAY));

  const hits: Hit[] = [];

  for (const transit of TRANSIT_BODIES) {
    // Precompute this planet's daily longitude ONCE per day (cache), rather than
    // recomputing per aspect/target.
    const dayLon: number[] = new Array(totalDays + 1);
    const dayDate: Date[] = new Array(totalDays + 1);
    for (let d = 0; d <= totalDays; d++) {
      const dt = new Date(start.getTime() + d * MS_PER_DAY);
      dayDate[d] = dt;
      dayLon[d] = eclipticLongitude(transit.body, dt);
    }

    for (const point of natalPoints) {
      for (const aspect of ASPECTS) {
        // Only record the FIRST (soonest) exact hit per (planet, point, aspect)
        // to avoid spamming repeated retrograde passes.
        let prevDiff = foldAngle(dayLon[0] - point.lon - aspect.angle);
        for (let d = 1; d <= totalDays; d++) {
          const diff = foldAngle(dayLon[d] - point.lon - aspect.angle);
          // A crossing of exact = sign change between consecutive days, ignoring
          // the wrap discontinuity near ±180 (guard with a magnitude check).
          const signChange =
            (prevDiff <= 0 && diff > 0) || (prevDiff > 0 && diff <= 0);
          const smallJump = Math.abs(diff - prevDiff) < 90;
          if (signChange && smallJump) {
            // Linearly interpolate between the two days for a better date.
            const denom = diff - prevDiff;
            const frac = denom === 0 ? 0 : -prevDiff / denom;
            const t = dayDate[d - 1].getTime() + frac * MS_PER_DAY;
            hits.push({
              transitPlanet: transit.name,
              aspectWord: aspect.word,
              point: point.label,
              date: new Date(t),
            });
            break; // soonest hit only for this (planet, point, aspect)
          }
          prevDiff = diff;
        }
      }
    }
  }

  const heading = `## Upcoming exact transits (next ${monthsAhead} months)`;

  if (hits.length === 0) {
    return (
      `${heading}\n` +
      `No exact slow-planet transits to your personal points fall in the next ` +
      `${monthsAhead} months (some may still be within orb and building).`
    );
  }

  hits.sort((a, b) => a.date.getTime() - b.date.getTime());
  const soonest = hits.slice(0, 8);

  const note =
    `These are the peak dates — the influence is felt for weeks around each one ` +
    `(months for the outer planets like Uranus, Neptune, and Pluto).`;

  const lines = soonest.map(
    (h) =>
      `- ${h.transitPlanet} ${h.aspectWord} your natal ${h.point} — exact around ${formatDate(h.date)}` +
      (OUTER_PLANETS.has(h.transitPlanet) ? "" : ""),
  );

  return `${heading}\n${note}\n${lines.join("\n")}`;
}
