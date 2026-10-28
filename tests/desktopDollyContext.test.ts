/**
 * Desktop Dolly gets the same chart as mobile Dolly.
 *
 * The bug this pins: "on desktop, Dolly couldn't read my chart." WebDolly
 * rendered its composer and starter chips immediately and sent whatever its
 * chart ref held at the moment of the tap. On a fresh desktop tab that was
 * nothing — the chart was still loading, and sessionStorage (which it
 * consulted first) is per tab — so the request went out with `chart: null`
 * and the route had no Birth Chart section to give her. The mobile tab never
 * had this, because it shows a spinner until the chart has loaded.
 *
 * These checks are structural, like crisisPaths: the component cannot be
 * rendered under node, but the order of a few lines is exactly the bug.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { dollyChartFromRow } from "../src/lib/dollyChart";

const read = (p: string) => readFileSync(p, "utf8");
const stripComments = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");

function indexOfOrFail(src: string, needle: string, what: string): number {
  const at = src.indexOf(needle);
  assert.ok(at >= 0, `could not find ${what} (${needle})`);
  return at;
}

const WEB = "src/components/web/WebDolly.tsx";
const MOBILE = "src/app/(tabs)/dolly/page.tsx";

test("a saved chart row becomes the chart the Dolly route reads", () => {
  const chart = dollyChartFromRow({
    big_three: { sun: "Leo", moon: "Pisces", rising: "Virgo" },
    planets: [{ name: "Sun", sign: "Leo", position: 12.3, house: "12", retrograde: false }],
    houses: [{ number: 1, sign: "Virgo", position: 4.1 }],
    special_points: null,
    birth_date: "1990-08-05",
    birth_time: "06:30",
    ascendant: { sign: "Virgo", position: 4.1 },
    midheaven: null,
    zodiac_system: "sidereal",
    ayanamsa: null,
    house_system: null,
    node_type: null,
  });
  // bigThree is the field buildChartSummary in api/dolly/route.ts requires;
  // without it the route writes no chart section at all.
  assert.deepEqual(chart.bigThree, { sun: "Leo", moon: "Pisces", rising: "Virgo" });
  assert.equal(chart.planets.length, 1);
  assert.equal(chart.houses.length, 1);
  assert.deepEqual(chart.specialPoints, []);
  assert.equal(chart.birthDate, "1990-08-05");
  assert.equal(chart.midheaven, null);
  // The chart's own zodiac travels with it, never assumed tropical.
  assert.equal(chart.zodiacSystem, "sidereal");
  assert.ok(chart.houseSystem && chart.ayanamsa && chart.nodeType);
});

test("both Dolly screens build the chart with the same helper", () => {
  for (const file of [WEB, MOBILE]) {
    assert.match(read(file), /dollyChartFromRow\(/, `${file} builds its own chart object again`);
  }
});

test("desktop Dolly waits for the chart before it sends", () => {
  const src = stripComments(read(WEB));
  const wait = indexOfOrFail(src, "await contextReadyRef.current", "the wait for the chart");
  const readChart = indexOfOrFail(src, "const chart = chartRef.current", "the chart read in sendMsg");
  const post = indexOfOrFail(src, 'authedFetch("/api/dolly"', "the request");
  assert.ok(wait < readChart && readChart < post, "the chart must be read after it has loaded, and before the request");
  assert.match(src, /contextReadyRef\.current = \(async \(\) =>/, "the load effect must publish its promise");
});

test("desktop Dolly prefers the saved chart and never sends the bare transit array", () => {
  const src = stripComments(read(WEB));
  const saved = indexOfOrFail(src, '.from("charts")', "the saved-chart query");
  const cached = indexOfOrFail(src, 'sessionStorage.getItem("chartResult")', "the signed-out fallback");
  assert.ok(saved < cached, "the account's saved chart must win over a copy left in the tab");
  // "mapped:transits" holds transitAspects alone; the route reads
  // transits.transitAspects, so sending it drops the transits entirely.
  assert.doesNotMatch(src, /getItem\("mapped:transits"\)/);
});

test("desktop Dolly asks for AI consent the way mobile does", () => {
  const src = read(WEB);
  assert.match(src, /readAiConsent\(\)/);
  assert.match(src, /<AiConsentScreen/);
  assert.match(src, /ai_consent_required/, "a 403 for missing consent should reopen the question, not read as a failure");
});
