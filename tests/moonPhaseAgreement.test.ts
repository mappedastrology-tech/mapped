/**
 * The Almanac screen shows the Moon three times. All three must agree.
 *
 * The bug this pins: bodyTiming.ts and fishingForecast.ts each carried a
 * byte-identical hand-rolled approximation anchored to `new Date(2000, 0, 1)`
 * — local midnight, and about 5.1 days before the new moon nearest that date.
 * So on a real full moon both said "waning gibbous", while the header, reading
 * the actual ephemeris, said "Full Moon". One screen, three different Moons.
 *
 * Both copies now call getMoonPhaseFraction. This test exists so a third copy
 * cannot quietly reappear.
 */

import test from "node:test";
import assert from "node:assert/strict";

import { getMoonPhaseLabel } from "../src/lib/astro/currentSky";
import { getBodyTiming } from "../src/lib/bodyTiming";
import { getFishingForecast } from "../src/lib/fishingForecast";

/** Real new and full moons, to the day, in UTC. */
const LUNATIONS: [string, "new" | "full"][] = [
  ["2026-11-09", "new"],
  ["2026-11-24", "full"],
  ["2026-12-09", "new"],
  ["2026-12-23", "full"],
  ["2027-01-07", "new"],
];

test("every moon-phase source on the Almanac agrees with the ephemeris", () => {
  for (const [iso, kind] of LUNATIONS) {
    const date = new Date(`${iso}T12:00:00Z`);

    const sky = getMoonPhaseLabel(date).toLowerCase();
    const body = getBodyTiming(date).moonPhase.toLowerCase();
    const fishing = (getFishingForecast(date, "Lake Travis")?.moonPhaseLabel ?? "").toLowerCase();

    assert.ok(sky.includes(kind), `${iso}: ephemeris says "${sky}", expected a ${kind} moon`);
    assert.ok(body.includes(kind), `${iso}: body timing says "${body}", ephemeris says "${sky}"`);
    assert.ok(fishing.includes(kind), `${iso}: fishing says "${fishing}", ephemeris says "${sky}"`);
  }
});

test("waxing is the first half of the cycle, not a string match", () => {
  // A few days after a new moon the Moon is waxing; a few days after full it is not.
  const afterNew = getBodyTiming(new Date("2026-11-13T12:00:00Z")).moonPhase.toLowerCase();
  const afterFull = getBodyTiming(new Date("2026-11-28T12:00:00Z")).moonPhase.toLowerCase();
  assert.ok(afterNew.includes("waxing"), `expected waxing four days after the new moon, got "${afterNew}"`);
  assert.ok(afterFull.includes("waning"), `expected waning four days after the full moon, got "${afterFull}"`);
});
