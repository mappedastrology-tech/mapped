import { test } from "node:test";
import assert from "node:assert/strict";

import { calculateChart } from "@/lib/astro/calculateChart";
import { calculateTransits } from "@/lib/astro/calculateTransits";
import { getTransitIntensity } from "@/lib/transitIntensity";
import { fmtDateRange, fmtExactDate, fmtTransitDate, natalPointsLabel } from "@/lib/transitFormat";
import { angleDiff } from "@/lib/astro/constants";

const SAMPLE = {
  name: "Test",
  birthDate: "1991-06-14",
  birthTime: "08:30",
  latitude: 35.1495,
  longitude: -90.0490,
  cityName: "Memphis",
};

interface Aspect {
  transitPlanet: string;
  natalPlanet: string;
  aspect: string;
  orb: number;
  alsoNatal?: string[];
  startDate?: string;
  exactDate?: string;
  endDate?: string;
}

/** Several dates across the year, so a test isn't passing by luck of one sky. */
const DATES = ["2026-01-15", "2026-04-02", "2026-07-21", "2026-10-27", "2027-02-09"];

function transitsOn(date: string): Aspect[] {
  const chart = calculateChart(SAMPLE) as any;
  const result = calculateTransits({
    natalPlanets: chart.planets,
    natalHouses: chart.houses,
    transitDate: date,
  }) as { transitAspects: Aspect[] };
  return result.transitAspects;
}

const SLOW = new Set(["Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"]);

test("transits: the Moon is not listed as a transiting body", () => {
  for (const date of DATES) {
    for (const ta of transitsOn(date)) {
      assert.notEqual(ta.transitPlanet, "Moon", `${date}: Moon transit leaked through`);
    }
  }
});

test("transits: one event is one row — no duplicate planet/aspect to a natal cluster", () => {
  const chart = calculateChart(SAMPLE) as any;
  const absByName = new Map<string, number>(
    chart.planets.map((p: any) => [p.name as string, p.absPosition as number]),
  );

  for (const date of DATES) {
    const seen: Aspect[] = [];
    for (const ta of transitsOn(date)) {
      const abs = absByName.get(ta.natalPlanet);
      const clash = seen.find((k) => {
        if (k.transitPlanet !== ta.transitPlanet || k.aspect !== ta.aspect) return false;
        const kAbs = absByName.get(k.natalPlanet);
        return abs !== undefined && kAbs !== undefined && angleDiff(abs, kAbs) <= 10;
      });
      assert.equal(
        clash,
        undefined,
        `${date}: ${ta.transitPlanet} ${ta.aspect} listed twice for the same patch of sky ` +
          `(${clash?.natalPlanet} and ${ta.natalPlanet})`,
      );
      seen.push(ta);
    }
  }
});

test("transits: no noise aspects — tight orbs on fast movers, no minor self-aspects", () => {
  for (const date of DATES) {
    for (const ta of transitsOn(date)) {
      const slow = SLOW.has(ta.transitPlanet);

      if (!slow) {
        assert.ok(ta.orb <= 4, `${date}: ${ta.transitPlanet} ${ta.aspect} ${ta.natalPlanet} too wide at ${ta.orb}°`);
        assert.notEqual(ta.aspect, "quincunx", `${date}: quincunx from fast-moving ${ta.transitPlanet}`);
      }

      if (ta.transitPlanet === ta.natalPlanet) {
        assert.ok(
          ["conjunction", "opposition", "square"].includes(ta.aspect),
          `${date}: ${ta.transitPlanet} ${ta.aspect} its own natal place is not a cycle point`,
        );
      }

      assert.ok(
        getTransitIntensity(ta).score >= 6,
        `${date}: ${ta.transitPlanet} ${ta.aspect} ${ta.natalPlanet} is below the noticeable threshold`,
      );
    }
  }
});

test("transits: every transit carries a real window, never the edge of the scan", () => {
  for (const date of DATES) {
    const aspects = transitsOn(date);
    assert.ok(aspects.length > 0, `${date}: no transits at all`);

    for (const ta of aspects) {
      const where = `${date}: ${ta.transitPlanet} ${ta.aspect} ${ta.natalPlanet}`;
      assert.ok(ta.startDate && ta.endDate && ta.exactDate, `${where} has no window`);

      const start = Date.parse(`${ta.startDate}T00:00:00Z`);
      const end = Date.parse(`${ta.endDate}T00:00:00Z`);
      const exact = Date.parse(`${ta.exactDate}T00:00:00Z`);
      const today = Date.parse(`${date}T00:00:00Z`);

      assert.ok(start <= today && today <= end, `${where}: today falls outside its own window`);
      assert.ok(exact >= start && exact <= end, `${where}: exact date falls outside the window`);

      // The old scanner clamped at ±400 days and reported the clamp as the
      // transit's edge, so five slow transits all claimed the same dates.
      const day = 86_400_000;
      const span = (end - start) / day;
      if (SLOW.has(ta.transitPlanet)) {
        assert.notEqual(Math.round((today - start) / day), 400, `${where}: start is a scan artifact`);
        assert.notEqual(Math.round((end - today) / day), 400, `${where}: end is a scan artifact`);
      } else {
        assert.ok(span <= 200, `${where}: fast planet with a ${Math.round(span)}-day window`);
      }
    }
  }
});

test("transits: slow transits resolve the long windows the old 400-day scan could not", () => {
  const aspects = transitsOn("2026-10-27");
  const long = aspects.filter((ta) => {
    if (!ta.startDate || !ta.endDate) return false;
    const span = (Date.parse(ta.endDate) - Date.parse(ta.startDate)) / 86_400_000;
    return span > 810; // wider than the old scanner could ever report
  });
  assert.ok(long.length > 0, "expected at least one multi-year outer-planet window");
});

test("natalPointsLabel: names every folded natal point", () => {
  assert.equal(natalPointsLabel({ natalPlanet: "Venus" }), "Venus");
  assert.equal(natalPointsLabel({ natalPlanet: "Venus", alsoNatal: [] }), "Venus");
  assert.equal(natalPointsLabel({ natalPlanet: "Venus", alsoNatal: ["Mars"] }), "Venus & Mars");
  assert.equal(
    natalPointsLabel({ natalPlanet: "Venus", alsoNatal: ["Mars", "Jupiter"] }),
    "Venus, Mars & Jupiter",
  );
});

test("transit dates: precision coarsens as the window widens", () => {
  // Weeks — name the days, and the year only once.
  assert.equal(fmtDateRange("2026-10-17", "2026-11-14"), "Oct 17 – Nov 14, 2026");
  // Crossing new year at day precision still needs both years.
  assert.equal(fmtDateRange("2026-12-20", "2027-01-10"), "Dec 20, 2026 – Jan 10, 2027");
  // Months — a year-long Saturn transit does not start on a nameable day.
  assert.equal(fmtDateRange("2026-02-25", "2027-03-20"), "Feb 2026 – Mar 2027");
  assert.equal(fmtDateRange("2026-02-25", "2026-11-20"), "Feb – Nov 2026");
  // Years — "Mar 7, 2032" is certainty nobody has.
  assert.equal(fmtDateRange("2023-11-16", "2032-03-07"), "2023 – 2032");
  // Missing data formats to nothing, not "undefined".
  assert.equal(fmtDateRange(undefined, "2026-11-14"), "");
  assert.equal(fmtDateRange("2026-10-17", undefined), "");
});

test("transit dates: a distant exact hit is given as a month", () => {
  const now = Date.parse("2026-10-27T00:00:00Z");
  assert.equal(fmtExactDate("2026-10-31", now), "Oct 31, 2026");
  assert.equal(fmtExactDate("2027-01-01", now), "Jan 1, 2027");
  assert.equal(fmtExactDate("2028-01-09", now), "Jan 2028");
  assert.equal(fmtExactDate("2029-12-26", now), "Dec 2029");
  assert.equal(fmtExactDate(undefined, now), "");
});

test("transit dates: day precision is unchanged", () => {
  assert.equal(fmtTransitDate("2026-10-31"), "Oct 31, 2026");
  assert.equal(fmtTransitDate(""), "");
  assert.equal(fmtTransitDate(undefined), "");
});
