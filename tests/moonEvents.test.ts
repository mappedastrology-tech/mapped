/**
 * The moon calendar used to be two hand-typed tables. Three of the twelve 2026
 * new moons were a day out and the full moons mixed UTC dates with US ones, so
 * on 11 September 2026 — a new moon — the home screen showed a New Moon card
 * that opened nothing. These pin both halves of that: the dates are right, and
 * a card that says "New Moon" always has a page behind it.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { getTodaysMoonEvent, getFullMoonsForYear, getCelestialEvents } from "../src/lib/celestialCalendar";
import { getMoonPhase } from "../src/lib/celestialCalendar";
import { moonEventsForYear } from "../src/lib/astro/currentSky";

/** Verified against pyephem, independent of the app's own ephemeris. */
const TRUE_NEW_MOONS_2026_UTC = [
  "2026-01-18", "2026-02-17", "2026-03-19", "2026-04-17", "2026-05-16", "2026-06-15",
  "2026-07-14", "2026-08-12", "2026-09-11", "2026-10-10", "2026-11-09", "2026-12-09",
];
const TRUE_FULL_MOONS_2026_UTC = [
  "2026-01-03", "2026-02-01", "2026-03-03", "2026-04-02", "2026-05-01", "2026-05-31",
  "2026-06-29", "2026-07-29", "2026-08-28", "2026-09-26", "2026-10-26", "2026-11-24",
  "2026-12-24",
];

const utcDay = (d: Date) => d.toISOString().slice(0, 10);

test("the 2026 new moons land on the right UTC days", () => {
  // June, September and December were the three the old table got wrong, and
  // all three are events in the small hours UTC — the ones a US-sourced table
  // reads as the previous evening.
  assert.deepEqual(moonEventsForYear("new", 2026).map(utcDay), TRUE_NEW_MOONS_2026_UTC);
});

test("the 2026 full moons land on the right UTC days", () => {
  assert.deepEqual(moonEventsForYear("full", 2026).map(utcDay), TRUE_FULL_MOONS_2026_UTC);
});

test("a day the moon reads as new or full always has an event behind it", () => {
  // The bug, exactly: the phase card said New Moon and tapping it did nothing.
  const start = new Date(2026, 0, 1);
  const missing: string[] = [];
  for (let i = 0; i < 365; i++) {
    const d = new Date(start.getTime() + i * 86400000);
    const phase = getMoonPhase(d).phase;
    if (phase !== "new" && phase !== "full") continue;
    const ev = getTodaysMoonEvent(d);
    if (!ev) missing.push(`${d.toDateString()} reads ${phase}`);
    else if (ev.kind !== phase) missing.push(`${d.toDateString()} reads ${phase} but offers ${ev.kind}`);
  }
  assert.deepEqual(missing, [], `\n${missing.join("\n")}\n`);
});

test("a day that is neither new nor full offers no event", () => {
  for (const d of [new Date(2026, 8, 8), new Date(2026, 8, 18), new Date(2026, 8, 21)]) {
    assert.equal(getTodaysMoonEvent(d), null, d.toDateString());
  }
});

test("exactly one day per event is the peak", () => {
  // The banner rides on isPeak, so two peaks in a row would mean two mornings
  // of an uninvited takeover for one moon.
  let peaks = 0;
  const start = new Date(2026, 0, 1);
  for (let i = 0; i < 365; i++) {
    const ev = getTodaysMoonEvent(new Date(start.getTime() + i * 86400000));
    if (ev?.isPeak) peaks++;
  }
  // 13 full moons and 12 new moons fall inside 2026 local time.
  assert.equal(peaks, 25);
});

test("the year grid is not empty outside 2026", () => {
  // It used to return [] for every other year, so the grid would vanish on
  // 1 January 2027 with nothing to explain it.
  for (const year of [2025, 2027, 2031]) {
    assert.equal(getFullMoonsForYear(year).length >= 12, true, String(year));
  }
});

test("a second full moon in one calendar month is the Blue Moon", () => {
  const g = getFullMoonsForYear(2026);
  const may = g.filter((m) => m.month === 4);
  assert.equal(may.length, 2);
  assert.equal(may[0].name, "Flower Moon");
  assert.equal(may[1].name, "Blue Moon");
  assert.equal(may[1].isBlue, true);
  assert.equal(g.filter((m) => m.isBlue).length, 1);
});

test("a full moon carries its traditional name and the sign it stands in", () => {
  const sep = getTodaysMoonEvent(new Date(2026, 8, 26));
  assert.equal(sep?.kind, "full");
  assert.equal(sep?.moonName, "Harvest Moon");
  assert.equal(sep?.zodiacSign, "Aries");   // opposite the Sun in Libra
  assert.equal(sep?.lore?.name, "Harvest Moon");
});

test("all four 2026 eclipses stay attached to their moons in any timezone", () => {
  // Eclipse dates are quoted in UTC. Matching the table in local time silently
  // loses the August lunar eclipse west of Greenwich — it is 04:18 UTC on the
  // 28th, which is the evening of the 27th in Texas.
  const flagged = getCelestialEvents(2026)
    .filter((e) => e.category === "moon" && /Eclipse/.test(e.description));
  assert.equal(flagged.length, 4);
  assert.equal(flagged.filter((e) => /Solar Eclipse/.test(e.description)).length, 2);
  assert.equal(flagged.filter((e) => /Lunar Eclipse/.test(e.description)).length, 2);
});
