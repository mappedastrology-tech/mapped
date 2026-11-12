/**
 * Creativity is the fifth base almanac category (with communication, love,
 * body and rest). It is scored like the others (almanacCategories.ts): Venus's
 * real condition, the Moon's sign and phase, and the day's exact aspects. It
 * is about making things, never about money, care or legal decisions.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getCategoryDefinitions, scoreCategoryForDate, getTodaySky, mercuryStatus, readCategoryForDay } from "../src/lib/almanacData";

const def = () => getCategoryDefinitions().find((d) => d.id === "creativity");

test("creativity is a base category and a default", () => {
  const c = def();
  assert.ok(c, "creativity is defined");
  assert.equal(c.isBase, true);
  assert.equal(c.name, "Creativity");
  assert.match(c.description, /writing|making|music|sketch/i);
  assert.doesNotMatch(c.description, /money|invest|sell|price|health|medic|legal|contract/i);
  const page = readFileSync("src/components/almanac/useAlmanacCategories.ts", "utf8");
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

test("creativity reads Venus; retrogrades are named but not counted", () => {
  const c = def()!;
  assert.equal(c.planet, "Venus");
  assert.equal(c.retrograde, "neutral");
  // Venus is retrograde 3 Oct – 13 Nov 2026 (and Mercury 24 Oct – 13 Nov).
  // The reading says so for Venus, at weight 0 — revising is creative work
  // too — and Mercury's retrograde is not creativity's business at all.
  const d = new Date(2026, 9, 30);
  assert.equal(mercuryStatus(d).state, "retrograde");
  const r = readCategoryForDay("creativity", d);
  const motion = r.factors.find((f) => f.kind === "motion");
  assert.ok(motion, "the retrograde is mentioned");
  assert.match(motion!.label, /^Venus retrograde/);
  assert.equal(motion!.weight, 0);
  assert.ok(!r.factors.some((f) => /Mercury retrograde/.test(f.label)));
  const s = scoreCategoryForDate("creativity", d, getTodaySky(d));
  assert.equal(s.score, r.score);
});
