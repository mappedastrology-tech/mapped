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
import {
  stationsForUtcYear, eclipseNear, voidOfCourseBetween, localDayWindow, retrogradePeriodsBetween,
} from "../src/lib/astro/skyCalendar";
import { getVoidOfCourseMoon } from "../src/lib/almanacData";

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
  // The eclipse flag on a new or full moon comes from the eclipse search, by
  // instant, so the August lunar eclipse (04:13 UTC on the 28th, the evening
  // of the 27th in Texas) stays attached wherever the reader is.
  const lunations = getCelestialEvents(2026)
    .filter((e) => /^(new|full)-moon-/.test(e.id) && /Eclipse/.test(e.description));
  assert.equal(lunations.length, 4);
  assert.equal(lunations.filter((e) => /Solar Eclipse/.test(e.description)).length, 2);
  assert.equal(lunations.filter((e) => /Lunar Eclipse/.test(e.description)).length, 2);
});

/* ─── Computed sky calendar: any year, not just 2026 ─── */

const iso = (d: Date) => d.toISOString().slice(0, 16);
const near = (a: Date, bIso: string, minutes: number) =>
  Math.abs(a.getTime() - new Date(bIso + ":00Z").getTime()) <= minutes * 60000;

test("2027's calendar has 2027's retrogrades — and no phantom Venus retrograde", () => {
  // Swiss Ephemeris: Mercury Rx 9 Feb–3 Mar, 10 Jun–4 Jul, 7–28 Oct 2027;
  // Mars Rx 10 Jan–1 Apr 2027. Venus does not retrograde in 2027 at all — the
  // old table showed 2026's October one.
  // Compared as UTC dates, because the calendar's own dates are the reader's:
  // 9 Feb 17:35 UTC is already 10 Feb in Tokyo, which is right there.
  const y0 = new Date(Date.UTC(2027, 0, 1)), y1 = new Date(Date.UTC(2028, 0, 1));
  const rx = (planet: string) => retrogradePeriodsBetween(planet, y0, y1)
    .filter((p) => p.start >= y0)
    .map((p) => `${p.start.toISOString().slice(5, 10)}..${p.end.toISOString().slice(5, 10)}`);
  assert.deepEqual(rx("Mercury"), ["02-09..03-03", "06-10..07-04", "10-07..10-28"]);
  assert.deepEqual(rx("Mars"), ["01-10..04-01"]);
  assert.deepEqual(rx("Venus"), []);
  const ev = getCelestialEvents(2027);
  assert.equal(ev.filter((e) => e.name === "Mercury Retrograde").length, 3);
  assert.equal(ev.filter((e) => e.name === "Venus Retrograde").length, 0);
  assert.ok(!ev.some((e) => /2026/.test(e.description)), "no 2026 text in 2027's calendar");
});

test("station instants agree with the Swiss Ephemeris to within minutes", () => {
  const all = [...stationsForUtcYear(2026), ...stationsForUtcYear(2027)];
  const find = (planet: string, dir: string, approx: string) =>
    all.find((s) => s.planet === planet && s.direction === dir && near(s.at, approx, 24 * 60));
  const swiss: [string, string, string][] = [
    ["Mercury", "retrograde", "2026-02-26T06:48"], ["Mercury", "direct", "2026-03-20T19:32"],
    ["Mercury", "retrograde", "2026-06-29T17:35"], ["Mercury", "direct", "2026-07-23T22:57"],
    ["Mercury", "retrograde", "2026-10-24T07:12"], ["Mercury", "direct", "2026-11-13T15:53"],
    ["Venus", "retrograde", "2026-10-03T07:15"], ["Venus", "direct", "2026-11-14T00:27"],
    ["Mars", "retrograde", "2027-01-10T12:59"], ["Mars", "direct", "2027-04-01T14:08"],
  ];
  for (const [planet, dir, at] of swiss) {
    const s = find(planet, dir, at);
    assert.ok(s, `${planet} ${dir} near ${at}`);
    assert.ok(near(s.at, at, 10), `${planet} ${dir}: ${iso(s.at)} vs Swiss ${at}`);
  }
});

test("eclipses are found for any year, and a 2027 full moon knows it is one", () => {
  // 20 Feb 2027 23:13 UT penumbral lunar eclipse. The old lookup only knew
  // 2026 and would have said "no eclipse".
  const ev = getTodaysMoonEvent(new Date(2027, 1, 20, 12), "UTC");
  assert.equal(ev?.kind, "full");
  assert.equal(ev?.isEclipse, true);
  assert.equal(ev?.eclipseLabel, "Penumbral Lunar Eclipse");
  assert.equal(eclipseNear(new Date(Date.UTC(2027, 7, 2, 10)), "solar")?.type, "total");
});

test("the void-of-course Moon matches an independent Swiss Ephemeris computation", () => {
  // Reference windows computed with pyswisseph (Moshier), same convention:
  // last exact Ptolemaic aspect to Sun–Pluto, until the ingress.
  const swiss: [string, string][] = [
    ["2026-10-02T02:41", "2026-10-02T19:54"],
    ["2026-10-03T15:08", "2026-10-04T22:54"],
    ["2026-10-06T10:22", "2026-10-07T02:52"],
    ["2026-10-07T18:56", "2026-10-09T08:10"],
    ["2027-03-03T01:37", "2027-03-04T11:31"],
    ["2027-03-06T14:00", "2027-03-06T23:25"],
  ];
  for (const [start, end] of swiss) {
    const got = voidOfCourseBetween(new Date(start + ":00Z"), new Date(end + ":00Z"))
      .find((v) => near(v.end, end, 60));
    assert.ok(got, `no VOC ending near ${end}`);
    assert.ok(near(got.start, start, 3), `start ${iso(got.start)} vs Swiss ${start}`);
    assert.ok(near(got.end, end, 3), `end ${iso(got.end)} vs Swiss ${end}`);
  }
});

test("a quiet day is not void just because the Moon is late in a sign", () => {
  // The old rule flagged anything past 25.5° and invented a window. 2 Oct
  // 2026 in UTC has a real one; the day must report THAT window, to the minute.
  const voc = getVoidOfCourseMoon(new Date(2026, 9, 2), "UTC");
  assert.ok(voc);
  assert.equal(iso(voc.startAt), "2026-10-02T02:41");
  assert.equal(voc.nextSign, "Cancer");
  assert.match(voc.note, /^The Moon has made its last aspect in Gemini/);
  assert.doesNotMatch(voc.note, /contract|document/i);
});

test("local-day windows are the reader's midnight, whatever the machine's zone", () => {
  const chicago = localDayWindow(new Date(2026, 7, 27), "America/Chicago");
  assert.equal(chicago.start.toISOString(), "2026-08-27T05:00:00.000Z");
  assert.equal(chicago.end.toISOString(), "2026-08-28T05:00:00.000Z");
  const tokyo = localDayWindow(new Date(2026, 7, 27), "Asia/Tokyo");
  assert.equal(tokyo.start.toISOString(), "2026-08-26T15:00:00.000Z");
  // A DST change makes a 23-hour day.
  const spring = localDayWindow(new Date(2026, 2, 8), "America/Chicago");
  assert.equal((spring.end.getTime() - spring.start.getTime()) / 3600000, 23);
  // The peak day of the August full moon follows the reader.
  assert.equal(getTodaysMoonEvent(new Date(2026, 7, 27, 12), "America/Chicago")?.isPeak, true);
  assert.equal(getTodaysMoonEvent(new Date(2026, 7, 28, 12), "America/Chicago")?.isPeak, false);
  assert.equal(getTodaysMoonEvent(new Date(2026, 7, 28, 12), "UTC")?.isPeak, true);
});

test("computed festivals land on their real dates, and table-only ones hide outside their years", () => {
  const on = (year: number, id: string) => {
    const e = getCelestialEvents(year).find((x) => x.id === `${id}-${year}`);
    return e ? `${e.date.getMonth() + 1}/${e.date.getDate()}` : null;
  };
  assert.equal(on(2026, "lunar-ny"), "2/17");
  assert.equal(on(2027, "lunar-ny"), "2/6");
  assert.equal(on(2025, "lunar-ny"), "1/29");
  assert.equal(on(2026, "mid-autumn"), "9/25");
  assert.equal(on(2025, "mid-autumn"), "10/6");
  assert.equal(on(2026, "qingming"), "4/5");
  assert.equal(on(2026, "makar-sankranti"), "1/14");
  assert.equal(on(2026, "nowruz"), "3/21");
  assert.equal(on(2026, "diwali"), "11/8");
  // Diwali used to show 20 Oct — 2025's date — every year.
  assert.equal(on(2027, "diwali"), null);
  assert.equal(on(2027, "ramadan"), null);
});
