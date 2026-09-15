/**
 * What the app is allowed to say, and how often.
 *
 * Both rules here replaced something that was sending a true-sounding sentence
 * that wasn't true: a transit announced as "exact" at seven degrees off, and a
 * full moon announced as "tonight" on three consecutive nights.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { personalTransitNotification, EXACT_ORB, type ChartRow } from "../src/lib/notifications/transitPush";
import { getTodaysMoonEvent } from "../src/lib/celestialCalendar";

const CHART: ChartRow = {
  user_id: "test",
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

/** Every day of 2026–27 this chart would be sent a transit push. */
function transitSends(): { date: string; title: string; body: string }[] {
  const out: { date: string; title: string; body: string }[] = [];
  const start = Date.UTC(2026, 0, 1);
  for (let i = 0; i < 730; i++) {
    const date = new Date(start + i * 86400000).toISOString().slice(0, 10);
    const n = personalTransitNotification(CHART, date);
    if (n) out.push({ date, title: n.title, body: n.body });
  }
  return out;
}

test("nothing is called exact unless it is", () => {
  // The old rule was `exactDate === today` alone, and exactDate means "closest
  // day inside a bounded scan", not "the day this perfects". Over this range it
  // announced 7 transits as exact that were 4.5 to 7.8 degrees away.
  const sends = transitSends();
  assert.ok(sends.length > 0, "the sample chart should receive some transits");
  for (const s of sends) {
    assert.match(s.body, /Exact today/, `${s.date}: ${s.body}`);
  }
  // The threshold is what does the work; if it drifts upward the falsehoods return.
  assert.ok(EXACT_ORB <= 1.0, "EXACT_ORB must stay tight enough to mean 'exact'");
});

test("the transit title carries the specific thing, not a label", () => {
  // OS-level summarisers read the opening and rank on it, so "Your chart today"
  // — the old title — spent the only part that is always visible on nothing.
  for (const s of transitSends().slice(0, 12)) {
    assert.doesNotMatch(s.title, /^(Mapped|Your chart today)$/, s.title);
    assert.match(s.title, /^(Mars|Jupiter|Saturn|Uranus|Neptune|Pluto) \w+ your \w+$/, s.title);
    assert.ok(s.title.length <= 34, `title too long to survive the lock screen: ${s.title}`);
  }
});

test("a transit push is a rare thing, not a daily one", () => {
  // If this starts firing most days it has stopped meaning anything, and it is
  // competing for the same one-per-day slot as the moon.
  const perYear = transitSends().length / 2;
  assert.ok(perYear < 40, `${perYear} transit pushes a year is too many`);
});

test("a lunation is announced once, not for every night it looks full", () => {
  // getMoonPhaseLabel is true for about three days, which is why the old test
  // sent "tonight" three nights running.
  let peaks = 0, windowDays = 0;
  const start = new Date(2026, 8, 1);
  for (let i = 0; i < 30; i++) {
    const ev = getTodaysMoonEvent(new Date(start.getTime() + i * 86400000));
    if (!ev) continue;
    windowDays++;
    if (ev.isPeak) peaks++;
  }
  assert.equal(peaks, 2, "one new moon and one full moon peak in a month");
  assert.ok(windowDays > peaks, "the phase window is wider than the peak — that is the bug's shape");
});
