/**
 * Creativity is the fifth base almanac category (with communication, love,
 * body and rest). It is scored like the others, from the Moon's sign and
 * phase plus its factors' weekdays, and it is about making things, never
 * about money, care or legal decisions.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getCategoryDefinitions, scoreCategoryForDate, getTodaySky, mercuryStatus } from "../src/lib/almanacData";

const def = () => getCategoryDefinitions().find((d) => d.id === "creativity");

test("creativity is a base category and a default", () => {
  const c = def();
  assert.ok(c, "creativity is defined");
  assert.equal(c.isBase, true);
  assert.equal(c.name, "Creativity");
  assert.match(c.description, /writing|making|music|sketch/i);
  assert.doesNotMatch(c.description, /money|invest|sell|price|health|medic|legal|contract/i);
  const page = readFileSync("src/app/(tabs)/almanac/AlmanacPageContent.tsx", "utf8");
  const defaults = page.match(/const DEFAULT_CATEGORIES = (\[[^\]]*\])/);
  assert.ok(defaults);
  assert.deepEqual(JSON.parse(defaults[1]), ["communication", "love", "body", "rest", "creativity"]);
});

test("creativity reads the sky: Leo and Pisces Moons outscore Virgo and Capricorn Moons", () => {
  const bySign = new Map<string, number[]>();
  for (let d = new Date(2026, 0, 1); d.getFullYear() === 2026; d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)) {
    const sky = getTodaySky(d);
    const { score } = scoreCategoryForDate("creativity", d, sky);
    assert.ok(score >= 1 && score <= 10, `${d.toDateString()}: ${score}`);
    bySign.set(sky.moonSign, [...(bySign.get(sky.moonSign) ?? []), score]);
  }
  const avg = (s: string) => { const xs = bySign.get(s)!; return xs.reduce((a, b) => a + b, 0) / xs.length; };
  for (const hi of ["Leo", "Pisces", "Taurus", "Libra"]) {
    for (const lo of ["Virgo", "Capricorn"]) assert.ok(avg(hi) > avg(lo) + 1, `${hi} ${avg(hi).toFixed(1)} vs ${lo} ${avg(lo).toFixed(1)}`);
  }
});

test("creativity has no Mercury factor, so a retrograde doesn't move it", () => {
  assert.ok(!def()!.factors.some((f) => f.planet === "mercury"));
  // 24 Oct – 13 Nov 2026 is retrograde; the score is the same function of
  // Moon sign, phase and weekday as on any other day.
  const d = new Date(2026, 9, 30);
  assert.equal(mercuryStatus(d).state, "retrograde");
  const s = scoreCategoryForDate("creativity", d, getTodaySky(d));
  assert.ok(s.score >= 1 && s.score <= 10);
});
