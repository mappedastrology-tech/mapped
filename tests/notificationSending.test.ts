/**
 * The sender: whose hour it is, how often, and what is true today.
 *
 * Each of these replaced something that was written down and not enforced. The
 * delivery-time setting existed on a settings screen and was never read; the
 * frequency caps existed as functions with no callers; the sky events existed
 * only in a strategy document.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { localNow, candidatesFor, houseOf } from "../src/app/api/cron/notifications/route";
import {
  DEFAULT_PREFERENCES, exceedsCaps, dailyReadingBlocked, isQuietHour,
  groupEnabled, setGroup, getPriority,
  CAP_PER_WEEK, type SentNotification, type NotificationPreferences,
} from "../src/lib/notifications/catalogue";
import { stationsOn, ingressesOn, eclipseOn, eclipseSeasonOpensOn, solarReturnInstant } from "../src/lib/notifications/skyEvents";
import type { ChartRow } from "../src/lib/notifications/transitPush";

const CHART: ChartRow = {
  user_id: "t",
  planets: [
    { name: "Sun", sign: "Aries", absPosition: 15 },
    { name: "Moon", sign: "Cancer", absPosition: 100 },
    { name: "Mercury", sign: "Aries", absPosition: 25 },
    { name: "Venus", sign: "Taurus", absPosition: 45 },
    { name: "Mars", sign: "Leo", absPosition: 135 },
    { name: "Jupiter", sign: "Libra", absPosition: 195 },
    { name: "Saturn", sign: "Capricorn", absPosition: 285 },
  ],
  houses: Array.from({ length: 12 }, (_, i) => ({ number: i + 1, sign: "Aries", absPosition: i * 30 })),
  zodiac_system: "tropical",
  ayanamsa: "lahiri",
};

/* ─── Whose hour is it ─── */

test("7 PM means their 7 PM, not the server's", () => {
  // 2026-09-16 00:00 UTC is still the evening of the 15th in Chicago.
  const at = new Date("2026-09-16T00:00:00Z");
  assert.equal(localNow(at, "America/Chicago").hour, 19);
  assert.equal(localNow(at, "America/Chicago").ymd, "2026-09-15");
  assert.equal(localNow(at, "UTC").hour, 0);
  assert.equal(localNow(at, "UTC").ymd, "2026-09-16");
  assert.equal(localNow(at, "Asia/Tokyo").hour, 9);
  assert.equal(localNow(at, "Asia/Tokyo").ymd, "2026-09-16");
});

test("an unknown timezone falls back to UTC instead of throwing", () => {
  const at = new Date("2026-09-16T00:00:00Z");
  assert.equal(localNow(at, "Mars/Olympus_Mons").hour, localNow(at, "UTC").hour);
  assert.equal(localNow(at, null).hour, localNow(at, "UTC").hour);
});

test("the old fixed hour would have reached nobody at their chosen time", () => {
  // 14:00 UTC, which is what every user used to get, against the default 7 PM.
  const at = new Date("2026-09-16T14:00:00Z");
  for (const tz of ["America/Chicago", "America/Los_Angeles", "Europe/London", "Asia/Tokyo"]) {
    assert.notEqual(localNow(at, tz).hour, DEFAULT_PREFERENCES.preferred_hour, tz);
  }
  // and in Tokyo it landed inside quiet hours
  assert.equal(isQuietHour(localNow(at, "Asia/Tokyo").hour), true);
});

/* ─── How often ─── */

const ago = (days: number) => new Date(Date.now() - days * 86400000).toISOString();

test("the caps are enforced against a real log", () => {
  const now = new Date();
  assert.equal(exceedsCaps([], now), false);
  assert.equal(exceedsCaps([{ category: "full_moon", sent_at: ago(0.2) }], now), true, "one a day");

  const four: SentNotification[] = [1, 2, 3, 4].map((d) => ({ category: "full_moon", sent_at: ago(d) }));
  assert.equal(four.length, CAP_PER_WEEK);
  assert.equal(exceedsCaps(four, now), true, "four a week");

  const three: SentNotification[] = [2, 3, 4].map((d) => ({ category: "full_moon", sent_at: ago(d) }));
  assert.equal(exceedsCaps(three, now), false);

  const ten: SentNotification[] = Array.from({ length: 10 }, (_, i) => ({ category: "full_moon", sent_at: ago(8 + i * 2) }));
  assert.equal(exceedsCaps(ten, now), true, "ten a month");
});

test("the daily reading is exempt from the weekly cap but not from doubling up", () => {
  // It is anticipated content someone asked for, not an interruption — capping
  // it at four a week would just make it erratic.
  const now = new Date();
  const week: SentNotification[] = [1, 2, 3, 4].map((d) => ({ category: "daily_content", sent_at: ago(d) }));
  assert.equal(dailyReadingBlocked(week, now), false);
  assert.equal(dailyReadingBlocked([{ category: "full_moon", sent_at: ago(0.1) }], now), true);
});

test("quiet hours cover the night and nothing else", () => {
  for (const h of [22, 23, 0, 3, 6]) assert.equal(isQuietHour(h), true, String(h));
  for (const h of [7, 9, 12, 19, 21]) assert.equal(isQuietHour(h), false, String(h));
});

/* ─── Groups ─── */

test("a group switch restores that group's defaults, not everything in it", () => {
  // Turning "The sky" on should not opt someone into the second-order beats
  // that are deliberately off.
  const off = setGroup(DEFAULT_PREFERENCES, "sky", false);
  assert.equal(groupEnabled(off, "sky"), false);
  assert.equal(groupEnabled(off, "chart"), true, "other groups untouched");

  const on = setGroup(off, "sky", true);
  assert.equal(on.full_moon, true);
  assert.equal(on.new_moon_act, false, "the act beat stays off");
  assert.equal(on.retrograde_shadow, false, "shadow periods stay off");
});

test("the learning streak is off unless someone asks for it", () => {
  // It is the app talking about itself rather than about the sky or the chart.
  assert.equal(DEFAULT_PREFERENCES.learning_reminder, false);
  assert.equal(DEFAULT_PREFERENCES.daily_content, false);
});

/* ─── What is true today ─── */

test("the rarest thing wins when two are true at once", () => {
  assert.ok(getPriority("solar_return") < getPriority("full_moon"));
  assert.ok(getPriority("eclipses") < getPriority("new_moon"));
  assert.ok(getPriority("major_transits") < getPriority("journal_checkin"));
  assert.ok(getPriority("daily_content") > getPriority("practice_reminders"));
});

test("an ordinary day produces nothing at all", () => {
  // The default is silence. If this starts returning something on a random
  // Tuesday, the budget is being spent on manufactured reasons to open the app.
  const quiet = new Date(2026, 8, 18);   // no moon peak, no station, no eclipse
  const prefs: NotificationPreferences = { ...DEFAULT_PREFERENCES };
  assert.deepEqual(candidatesFor(quiet, prefs, CHART, undefined).map((c) => c.category), []);
});

test("a whole year stays inside the budget", () => {
  // Roughly three a fortnight for someone who has not opted into the daily
  // reading, which is the whole design.
  const prefs: NotificationPreferences = { ...DEFAULT_PREFERENCES };
  let total = 0;
  const start = new Date(2026, 0, 1);
  for (let i = 0; i < 365; i++) {
    const day = new Date(start.getTime() + i * 86400000);
    if (candidatesFor(day, prefs, CHART, undefined).length > 0) total++;
  }
  assert.ok(total >= 40 && total <= 110, `${total} notification days a year is outside the intended range`);
});

test("the sky events are the ones that actually happened in 2026", () => {
  // Cross-checked against published retrograde periods: Mercury turns back on
  // 26 Feb, 29 Jun and 24 Oct 2026, and Venus on 3 Oct.
  const stations: string[] = [];
  const start = new Date(2026, 0, 1);
  for (let i = 0; i < 365; i++) {
    const d = new Date(start.getTime() + i * 86400000);
    for (const s of stationsOn(d)) {
      stations.push(`${d.getMonth() + 1}/${d.getDate()} ${s.planet} ${s.direction}`);
    }
  }
  assert.ok(stations.includes("2/26 Mercury retrograde"), stations.join(", "));
  assert.ok(stations.includes("6/29 Mercury retrograde"));
  assert.ok(stations.includes("10/24 Mercury retrograde"));
  assert.ok(stations.includes("10/3 Venus retrograde"));
  // Mercury alone stations six to eight times a year; this must not be empty,
  // which is exactly what happened when the longitude was heliocentric.
  assert.ok(stations.length >= 14, `only ${stations.length} stations in a year`);
});

test("the four 2026 eclipses land on their real days, and open two seasons", () => {
  const eclipses: string[] = [], seasons: string[] = [];
  const start = new Date(2026, 0, 1);
  for (let i = 0; i < 365; i++) {
    const d = new Date(start.getTime() + i * 86400000);
    const e = eclipseOn(d);
    if (e) eclipses.push(`${d.getMonth() + 1}/${d.getDate()} ${e.kind}`);
    if (eclipseSeasonOpensOn(d)) seasons.push(`${d.getMonth() + 1}/${d.getDate()}`);
  }
  assert.deepEqual(eclipses, ["2/17 solar", "3/3 lunar", "8/12 solar", "8/28 lunar"]);
  assert.equal(seasons.length, 2, `seasons: ${seasons.join(", ")}`);
});

test("only the slow planets are announced changing sign", () => {
  let count = 0;
  const start = new Date(2026, 0, 1);
  for (let i = 0; i < 365; i++) {
    for (const g of ingressesOn(new Date(start.getTime() + i * 86400000))) {
      assert.ok(["Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"].includes(g.planet), g.planet);
      count++;
    }
  }
  assert.ok(count <= 8, `${count} ingresses a year is too many to be the slow ones`);
});

test("a solar return is one moment a year, exact to the minute", () => {
  const at = solarReturnInstant(15, 2026);       // natal Sun at 15 Aries
  assert.equal(at.getUTCFullYear(), 2026);
  assert.equal(at.getUTCMonth(), 3, "the Sun reaches 15 Aries in early April");
  // and the following year is within a day and a half of the same date
  const next = solarReturnInstant(15, 2027);
  const drift = Math.abs((next.getTime() - at.getTime()) / 86400000 - 365.25);
  assert.ok(drift < 1.5, `solar return drifted ${drift.toFixed(2)} days`);
});

test("house lookup degrades to something sayable when the chart has no houses", () => {
  // Someone without a birth time still gets transits; the copy must not render
  // "your undefined house".
  assert.equal(houseOf(undefined, 200), "1st");
  assert.equal(houseOf({ ...CHART, houses: null }, 200), "1st");
  assert.equal(houseOf(CHART, 35), "2nd");
  assert.equal(houseOf(CHART, 340), "12th");
});
