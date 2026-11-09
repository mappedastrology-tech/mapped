/**
 * The almanac's personal categories read the real sky (almanacCategories.ts).
 *
 * Before: every factor compared its sign list to the MOON's sign — "Venus
 * condition" never looked at Venus — planets only added a weekday bonus, the
 * detail sheet showed a fixed invented aspect per weekday ("Sun trine Moon"
 * every Sunday) with a random "Exact at" time and a random best window, and
 * the Recovery domain timed willpower by the sky. These pin that it is gone.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import * as Astronomy from "astronomy-engine";
import {
  readCategoryForDay, getCategoryDefinitions, isUnscoredTopic, REMOVED_CATEGORIES,
  SCORE_EXPLAINER, overallDayScore, tierFor,
} from "../src/lib/almanacCategories";
import { getActivityDetail, getMonthData, getWeekData } from "../src/lib/almanacData";
import { clockIn, localDayWindow, voidOfCourseBetween, exactAspectsBetween } from "../src/lib/astro/skyCalendar";

const SIGNS = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
const CHI = "America/Chicago";

/** Independent of the app: astronomy-engine directly. */
function lonOf(body: string, at: Date): number {
  if (body === "Moon") return Astronomy.EclipticGeoMoon(at).lon;
  if (body === "Sun") return Astronomy.SunPosition(at).elon;
  return Astronomy.Ecliptic(Astronomy.GeoVector(Astronomy.Body[body as keyof typeof Astronomy.Body] as Astronomy.Body, at, true)).elon;
}
const signAt = (body: string, at: Date) => SIGNS[Math.floor((((lonOf(body, at) % 360) + 360) % 360) / 30)];
const noonIn = (day: Date, tz: string) => {
  const { start, end } = localDayWindow(day, tz);
  return new Date((start.getTime() + end.getTime()) / 2);
};
const ANGLE: Record<string, number> = { conjunct: 0, sextile: 60, square: 90, trine: 120, opposite: 180 };

const days = (from: Date, n: number, step = 1) =>
  Array.from({ length: n }, (_, i) => new Date(from.getFullYear(), from.getMonth(), from.getDate() + i * step));

test("each category's planet factor reads that planet, not the Moon", () => {
  const cases: [string, string][] = [["love", "Venus"], ["creativity", "Venus"], ["communication", "Mercury"], ["body", "Mars"]];
  for (const d of days(new Date(2026, 0, 3), 26, 14)) {
    for (const [id, planet] of cases) {
      const r = readCategoryForDay(id, d, { timeZone: CHI });
      const lead = r.reasons[0];
      assert.equal(lead.kind, "planet", `${id} leads with its planet`);
      const sign = signAt(planet, noonIn(d, CHI));
      assert.ok(lead.label.startsWith(`${planet} in ${sign}`), `${d.toDateString()} ${id}: "${lead.label}" vs ${planet} in ${sign}`);
    }
  }
});

test("dignity comes from the planet's real sign", () => {
  // Venus in Libra (own sign) in Nov 2026, in Virgo (fall) in Aug 2026.
  const nov = readCategoryForDay("love", new Date(2026, 10, 2), { timeZone: CHI }).reasons[0];
  assert.equal(nov.label, "Venus in Libra, its own sign");
  assert.ok(nov.weight > 0);
  let sawFall = false;
  for (const d of days(new Date(2026, 6, 1), 70)) {
    if (signAt("Venus", noonIn(d, CHI)) !== "Virgo") continue;
    const lead = readCategoryForDay("love", d, { timeZone: CHI }).reasons[0];
    assert.equal(lead.label, "Venus in Virgo, its fall");
    assert.ok(lead.weight < 0);
    sawFall = true;
  }
  assert.ok(sawFall, "found Venus in Virgo in summer 2026");
  // Same Moon sign, different Venus: the planet factor differs, so it is not the Moon's.
  const a = readCategoryForDay("love", new Date(2026, 10, 9), { timeZone: CHI });
  assert.ok(a.factors.some((f) => f.kind === "planet" && /Venus in Libra/.test(f.label)));
});

test("Mercury retrograde and stations are read from the ephemeris, with exact times", () => {
  const rx = readCategoryForDay("communication", new Date(2026, 10, 1), { timeZone: CHI });
  const m = rx.factors.find((f) => f.kind === "motion");
  assert.ok(m && /^Mercury retrograde in Scorpio, until Nov 13/.test(m.label), m?.label);
  assert.ok(m!.weight < 0);
  // Mercury stations direct 13 Nov 2026.
  const st = readCategoryForDay("communication", new Date(2026, 10, 13), { timeZone: CHI });
  const s = st.factors.find((f) => f.kind === "motion");
  assert.ok(s && /^Mercury stations direct today, exact \d{1,2}:\d{2} [AP]M$/.test(s.label), s?.label);
  // Creativity mentions Venus's retrograde at weight 0; communication is untouched by it.
  assert.ok(!rx.factors.some((f) => /Venus retrograde/.test(f.label)));
});

test("aspect times are exact: within a few minutes of an independent astronomy-engine search", () => {
  const sample = [new Date(2026, 0, 14), new Date(2026, 3, 2), new Date(2026, 6, 21), new Date(2026, 10, 9), new Date(2027, 1, 18)];
  let checked = 0;
  for (const d of sample) {
    for (const tz of [CHI, "UTC", "Asia/Tokyo"]) {
      const { start, end } = localDayWindow(d, tz);
      for (const a of exactAspectsBetween(start, end, "Moon")) {
        const sep = (t: Date) => (((lonOf("Moon", t) - lonOf(a.b, t)) % 360) + 360) % 360;
        const target = { conjunction: 0, sextile: 60, square: 90, trine: 120, opposition: 180 }[a.aspect];
        const off = (t: Date) => {
          const s = sep(t);
          return Math.min(...[target, 360 - target].map((g) => Math.abs((((s - g) % 360) + 540) % 360 - 180)));
        };
        // Brute force, minute by minute, ±30 min: the true crossing is the minimum.
        let bestT = a.at.getTime(), best = Infinity;
        for (let k = -30; k <= 30; k++) {
          const t = new Date(a.at.getTime() + k * 60000);
          const o = off(t);
          if (o < best) { best = o; bestT = t.getTime(); }
        }
        assert.ok(Math.abs(bestT - a.at.getTime()) <= 3 * 60000, `Moon ${a.aspect} ${a.b} ${a.at.toISOString()} vs ${new Date(bestT).toISOString()}`);
        assert.ok(off(a.at) < 0.05, `separation at reported time is ${off(a.at).toFixed(3)}° off`);
        checked++;
      }
    }
  }
  assert.ok(checked > 20, `checked ${checked}`);
});

test("the aspects a reading names are the real ones, shown in the reader's zone", () => {
  const d = new Date(2026, 10, 9);
  for (const tz of [CHI, "Asia/Tokyo"]) {
    const r = readCategoryForDay("rest", d, { timeZone: tz });
    const { start, end } = localDayWindow(d, tz);
    const real = exactAspectsBetween(start, end, "Moon");
    for (const f of r.factors.filter((x) => x.kind === "aspect" && x.label.startsWith("Moon "))) {
      const [, verb, body] = f.label.match(/^Moon (\w+) (\w+), exact/)!;
      const match = real.find((a) => a.b === body && a.at.getTime() === f.at!.getTime());
      assert.ok(match, `${tz}: ${f.label} is in the sky`);
      assert.equal({ conjunction: "conjunct", opposition: "opposite" }[match!.aspect as string] ?? match!.aspect, verb);
      assert.ok(f.label.endsWith(clockIn(f.at!, tz)), `${f.label} uses ${tz} clock`);
      assert.ok(ANGLE[verb] !== undefined);
    }
  }
});

test("same inputs, same output — nothing random", () => {
  for (const d of days(new Date(2026, 4, 1), 12, 9)) {
    for (const id of ["communication", "love", "body", "rest", "creativity", "my-pottery-class", "zzz"]) {
      const a = JSON.stringify(readCategoryForDay(id, d, { timeZone: CHI }));
      const b = JSON.stringify(readCategoryForDay(id, new Date(d), { timeZone: CHI }));
      assert.equal(a, b, `${id} ${d.toDateString()}`);
    }
    assert.equal(JSON.stringify(getActivityDetail("Making art", "good", d)), JSON.stringify(getActivityDetail("Making art", "good", new Date(d))));
  }
  const engine = readFileSync("src/lib/almanacCategories.ts", "utf8");
  assert.doesNotMatch(engine, /Math\.random|seededRandom|hashFor/);
  const data = readFileSync("src/lib/almanacData.ts", "utf8");
  assert.doesNotMatch(data, /PLANET_ASPECT_DESCRIPTIONS|Sun trine Moon|Exact at \$\{formatTime/);
  const detail = data.slice(data.indexOf("export function getActivityDetail"), data.indexOf("export function getGardenTips"));
  assert.doesNotMatch(detail, /seededRandom|hashForDetail/);
});

test("every reading carries 2–4 plain-English reasons", () => {
  const ids = getCategoryDefinitions().map((d) => d.id).concat(["filming-tiktok-videos", "pottery"]);
  for (const d of days(new Date(2026, 0, 1), 24, 15)) {
    for (const id of ids) {
      const r = readCategoryForDay(id, d, { timeZone: CHI });
      assert.ok(r.scored);
      assert.ok(r.reasons.length >= 2 && r.reasons.length <= 4, `${id} ${d.toDateString()}: ${r.reasons.length}`);
      for (const x of r.reasons) {
        assert.ok(x.label.length > 6 && x.note.length > 10, `${id}: "${x.label}" / "${x.note}"`);
        assert.doesNotMatch(x.label + x.note, /undefined|NaN|\[object/);
      }
      assert.ok(r.score >= 1 && r.score <= 10);
      assert.equal(r.tier, tierFor(r.score));
      assert.equal(r.word, { favorable: "Favorable", mixed: "Mixed", quiet: "Quiet" }[r.tier]);
      if (r.bestWindow) {
        assert.ok(r.bestWindow.endAt > r.bestWindow.startAt);
        assert.ok(r.bestWindow.reason.length > 5);
      } else {
        assert.ok(r.windowNote);
      }
    }
  }
});

test("the void-of-course Moon is respected: drags starts, suits rest, never inside a best window", () => {
  let seen = 0;
  for (const d of days(new Date(2026, 8, 1), 60)) {
    const { start, end } = localDayWindow(d, CHI);
    const voc = voidOfCourseBetween(start, end);
    const wake0 = start.getTime() + 7 * 3600e3, wake1 = start.getTime() + 22 * 3600e3;
    const awake = voc.some((v) => Math.min(v.end.getTime(), wake1) - Math.max(v.start.getTime(), wake0) > 3600e3);
    if (!awake) continue;
    seen++;
    const comm = readCategoryForDay("communication", d, { timeZone: CHI });
    const rest = readCategoryForDay("rest", d, { timeZone: CHI });
    const art = readCategoryForDay("creativity", d, { timeZone: CHI });
    assert.ok(comm.factors.find((f) => f.kind === "void")!.weight < 0, d.toDateString());
    assert.ok(rest.factors.find((f) => f.kind === "void")!.weight > 0, d.toDateString());
    assert.equal(art.factors.find((f) => f.kind === "void")!.weight, 0, d.toDateString());
    if (comm.bestWindow) {
      for (const v of voc) {
        const overlapMs = Math.min(v.end.getTime(), comm.bestWindow.endAt.getTime()) - Math.max(v.start.getTime(), comm.bestWindow.startAt.getTime());
        assert.ok(overlapMs <= 1000, `${d.toDateString()}: window ${comm.bestWindow.start}–${comm.bestWindow.end} overlaps void ${v.start.toISOString()}`);
      }
    }
    // The void begins at the Moon's last exact aspect — the same aspects the reading uses.
    for (const v of voc) {
      if (!v.lastAspect) continue;
      const at = exactAspectsBetween(new Date(v.start.getTime() - 60000), new Date(v.start.getTime() + 60000), "Moon");
      assert.ok(at.some((a) => a.b === v.lastAspect!.planet), `${d.toDateString()} void starts at a real aspect`);
    }
  }
  assert.ok(seen > 10, `saw ${seen} void days`);
});

test("Recovery categories are gone, and their topics stay unscored", () => {
  const defs = getCategoryDefinitions();
  assert.ok(!defs.some((d) => d.domain === "Recovery"));
  for (const id of ["high-willpower-days", "low-willpower-days", "breaking-habits"]) {
    assert.ok(REMOVED_CATEGORIES.has(id));
    assert.ok(!defs.some((d) => d.id === id), id);
    assert.equal(isUnscoredTopic(id), true, id);
    assert.equal(readCategoryForDay(id, new Date(2026, 10, 9)).scored, false, id);
  }
  for (const id of ["sobriety", "quitting-drinking", "smoking", "relapse-days", "my-diet", "gambling"]) {
    assert.equal(isUnscoredTopic(id), true, id);
  }
  // A benign routine category survives, moved out of the removed domain.
  assert.equal(defs.find((d) => d.id === "starting-habits")?.domain, "Inner Work");
  const page = readFileSync("src/app/(tabs)/almanac/AlmanacPageContent.tsx", "utf8");
  assert.doesNotMatch(page, /willpower|Recovery/i);
});

test("framing: reasons describe the sky, never promise or predict", () => {
  const PREDICTIVE = /\bwill (go|happen|succeed|fail|work out)|guarantee|lucky|unlucky|bad luck|danger|accident|disaster|avoid at all|doomed|you should|must not/i;
  const MONEY_CARE_LAW = /money|invest|loan|debt|salary|contract|legal|surger|medic|diagnos|health|willpower|temptation/i;
  for (const d of days(new Date(2026, 0, 1), 52, 7)) {
    for (const def of getCategoryDefinitions()) {
      const r = readCategoryForDay(def.id, d);
      const text = r.factors.map((f) => `${f.label} ${f.note}`).join(" ") + (r.bestWindow?.reason ?? "") + (r.windowNote ?? "");
      assert.doesNotMatch(text, PREDICTIVE, `${def.id} ${d.toDateString()}`);
      assert.doesNotMatch(text + def.description, MONEY_CARE_LAW, `${def.id}`);
    }
  }
  assert.match(SCORE_EXPLAINER, /not what will happen/);
});

test("week and month day scores come from the engine, not a seeded random number", () => {
  const week = getWeekData(new Date(2026, 10, 9));
  for (const d of week.days) assert.equal(d.score, overallDayScore(d.date));
  const month = getMonthData(2026, 10, "love");
  for (const c of month.weeks.flat()) {
    assert.equal(c.score, readCategoryForDay("love", c.date).score, c.date.toDateString());
  }
  const plain = getMonthData(2026, 10);
  for (const c of plain.weeks.flat()) assert.equal(c.score, overallDayScore(c.date));
});

test("custom categories are read like the built-in profile their words point to", () => {
  const d = new Date(2026, 10, 9);
  assert.equal(readCategoryForDay("filming-tiktok-videos", d).readAs, "Photo shoots");
  assert.equal(readCategoryForDay("morning-yoga", d).readAs, "Starting workouts");
  const general = readCategoryForDay("qwerty", d, { name: "Qwerty" });
  assert.equal(general.readAs, "General");
  assert.ok(general.reasons.some((r) => /Moon alone/.test(r.label)));
});
