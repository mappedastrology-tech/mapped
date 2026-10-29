/**
 * The almanac does not tell anyone to schedule, skip or delay medical care,
 * or to time money, loan, investment or legal decisions by the sky.
 *
 * It used to: day scores for "Surgery", "Starting medication", "Investing"
 * and "Applying for loans"; a body-timing screen that flagged breast, heart
 * and kidney check-ups "Not Ideal" by Moon sign; full-moon advice to "cash in
 * on investments"; "sign contracts" on Wednesdays. These pin that it is gone,
 * and that the folklore that remains is phrased as folklore.
 */

import test from "node:test";
import assert from "node:assert/strict";
import {
  getCategoryDefinitions, isUnscoredTopic, getGoodForToday, getHoldOffToday,
  scoreCategoryForDate, getTodaySky, getWeekData, getMonthData, mercuryStatus,
} from "../src/lib/almanacData";
import { FULL_ALMANAC, PLANETARY_DAY_CONTEXT, NAKSHATRAS, getCelestialEvents } from "../src/lib/celestialCalendar";
import { getBodyTiming } from "../src/lib/bodyTiming";

/** Instructions about care or money decisions. Folklore words ("medicinal herbs") are fine. */
const FORBIDDEN = /surger|procedure|medicat|prescri|check-?up|screening|dental|extraction|colonic|\binvest|loan|debt|mortgage|contracts?\b|\blease|\bsign(ing)? (new|major|important)|financial (move|agreement|decision|planning)|cash in|immune/i;

test("no category scores medical, money or legal decisions", () => {
  for (const d of getCategoryDefinitions()) {
    assert.doesNotMatch(`${d.id} ${d.name} ${d.description}`, FORBIDDEN, d.id);
    assert.equal(isUnscoredTopic(d.id), false, `built-in ${d.id} must stay scoreable`);
  }
  assert.ok(!getCategoryDefinitions().some((d) => d.domain === "Money"));
});

test("removed and look-alike custom categories are not scored", () => {
  for (const id of ["money", "surgery", "starting-medication", "investing", "applying-for-loans",
    "signing-leases", "buying-property", "therapy-sessions", "dentist", "my-crypto", "divorce-filing"]) {
    assert.equal(isUnscoredTopic(id), true, id);
  }
  for (const id of ["design", "filming-tiktok-videos", "gardening", "yoga"]) {
    assert.equal(isUnscoredTopic(id), false, id);
  }
  const sky = getTodaySky(new Date(2026, 9, 28));
  assert.equal(scoreCategoryForDate("surgery", new Date(2026, 9, 28), sky).topFactor, "Not scored by the sky");
});

test("the phase almanac, day context and nakshatras carry no care or money instructions", () => {
  for (const p of FULL_ALMANAC) {
    for (const t of p.almanac.lifeTips) assert.doesNotMatch(t.tip, FORBIDDEN, `${p.phase} ${t.category}`);
    assert.ok(!p.almanac.lifeTips.some((t) => t.category === "Money" || t.category === "Health"), p.phase);
  }
  for (const [day, c] of Object.entries(PLANETARY_DAY_CONTEXT)) {
    for (const s of [...c.doToday, ...c.avoidToday]) assert.doesNotMatch(s, FORBIDDEN, day);
  }
  for (const n of NAKSHATRAS) assert.doesNotMatch(n.brief, /treatment|financial|medicine/i, n.name);
});

test("a year of good-for, hold-off and week copy stays clean", () => {
  for (let d = new Date(2026, 0, 1); d.getFullYear() === 2026; d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 3)) {
    for (const a of getGoodForToday(d).activities) assert.doesNotMatch(a.activity, FORBIDDEN, a.activity);
    const hold = getHoldOffToday(d);
    for (const a of hold.items) assert.doesNotMatch(a.activity, FORBIDDEN, a.activity);
    assert.doesNotMatch(hold.reason, FORBIDDEN);
  }
  for (const m of [0, 9]) {
    const week = getWeekData(new Date(2026, m, 15));
    assert.doesNotMatch(JSON.stringify(week), FORBIDDEN);
    assert.doesNotMatch(JSON.stringify(getMonthData(2026, m)), FORBIDDEN);
  }
  for (const e of getCelestialEvents(2026)) assert.doesNotMatch(`${e.description} ${e.ritualHint}`, FORBIDDEN, e.id);
});

test("body lore is reflection — no avoid lists, no 'better days' to move care to", () => {
  const b = getBodyTiming(new Date(2026, 9, 28)) as unknown as Record<string, unknown>;
  assert.equal("avoid" in b, false);
  assert.equal("safe" in b, false);
  assert.equal("betterDays" in b, false);
  assert.doesNotMatch(JSON.stringify(b), /procedures? booked|will hold|not ideal|all clear/i);
});

test("good-for does not contradict an active Mercury retrograde", () => {
  // 24 Oct – 13 Nov 2026. The beta sweep caught "Good for: signing contracts"
  // on a day Home was saying "expect plans to shift".
  for (let d = new Date(2026, 9, 25); d < new Date(2026, 10, 13); d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)) {
    assert.equal(mercuryStatus(d).state, "retrograde", d.toDateString());
    const good = getGoodForToday(d);
    for (const a of good.activities) {
      assert.doesNotMatch(a.activity, /starting a new project|bold decision|booking or starting travel|career move|job application|committing to something|contract/i, `${d.toDateString()}: ${a.activity}`);
    }
    assert.match(good.why, /Mercury is retrograde/);
  }
  assert.equal(mercuryStatus(new Date(2026, 11, 15)).state, "direct");
  assert.equal(mercuryStatus(new Date(2026, 10, 20)).state, "post-shadow");
});
