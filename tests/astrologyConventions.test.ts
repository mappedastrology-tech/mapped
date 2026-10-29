/**
 * Astrology conventions Mapped commits to (Taylor's decisions, Oct 2026):
 *
 *  (a) rulerships — modern ruler named first with the traditional alongside
 *      ("Pluto, traditionally Mars"); single-planet techniques use traditional.
 *  (b) profections / Lord of the Year — whole-sign houses.
 *  (c) orbs — ONE table, lib/astro/constants.ts ASPECTS, used everywhere.
 *  plus: Mercury exalted in Virgo, no sect without a birth time, node type
 *  named in every zodiac, and the unknown-time Moon range.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";

import { ASPECTS } from "@/lib/astro/constants";
import { DEPTH_ASPECTS, buildChartDepth } from "@/lib/astro/dollyDepth";
import { getLordOfTheYear, getSectLight } from "@/lib/rulers";
import { getChartRuler } from "@/lib/chartRuler";
import { rulerLabel, traditionalRuler, modernRuler } from "@/lib/rulerships";
import { analyzeChart, type Planet } from "@/lib/chartAnalysis";
import { chartSystemLabel } from "@/lib/astro/vedic/system";
import { moonSignRange } from "@/lib/astro/moonRange";
import { calculateChart } from "@/lib/astro/calculateChart";

const ROOT = path.resolve(__dirname, "..");
const read = (p: string) => readFileSync(path.join(ROOT, p), "utf8");
const SIGNS = ["Ari", "Tau", "Gem", "Can", "Leo", "Vir", "Lib", "Sco", "Sag", "Cap", "Aqu", "Pis"];

/* ─── (c) one orb table ─── */

test("Dolly's depth block uses the shared orb table, not its own", () => {
  assert.deepEqual(
    DEPTH_ASPECTS.map((a) => [a.name, a.angle, a.orb]),
    ASPECTS.map(([n, d, o]) => [n, d, o]),
  );
  const src = read("src/lib/astro/dollyDepth.ts");
  assert.doesNotMatch(src, /\{\s*name:\s*"sextile",\s*angle:\s*60,\s*orb:\s*\d/, "dollyDepth re-declares orbs");
});

test("Dolly sees the same aspects the chart does at the edges of the table", () => {
  const planet = (name: string, sign: string, position: number) => ({ name, sign, position, house: null, retrograde: false });
  // Sun 0° Aries; Jupiter 7.5° Leo = trine 7.5° off (outside 7°); Venus 4.5° Gemini = sextile 4.5° off (inside 5°).
  const out = buildChartDepth({
    planets: [planet("Sun", "Ari", 0), planet("Jupiter", "Leo", 7.5), planet("Venus", "Gem", 4.5)],
  });
  assert.doesNotMatch(out, /Sun trine Jupiter/, "7.5° trine should be out of orb (table says 7°)");
  assert.match(out, /Sun sextile Venus/, "4.5° sextile should be in orb (table says 5°)");
});

test("the knowledge-base seed and Learn reference state the same orbs", () => {
  const seed = read("supabase/seed_aspects.sql");
  for (const [name, , orb] of ASPECTS) {
    const m = seed.match(new RegExp(`'${name}',\\s*'[^']+',\\s*\\d+,\\s*(\\d+),`));
    assert.ok(m, `${name} row not found in seed`);
    assert.equal(Number(m![1]), orb, `seed orb for ${name}`);
  }
  const learn = read("src/lib/learn/reference/astrology.ts");
  for (const [name, , orb] of ASPECTS) {
    const block = learn.slice(learn.indexOf(`aspect("${name}"`));
    const m = block.match(/"~(\d+)°"\)/);
    assert.equal(Number(m![1]), orb, `Learn reference orb for ${name}`);
  }
});

/* ─── (a) rulerships ─── */

test("rulers are named modern-first with the traditional alongside", () => {
  assert.equal(rulerLabel("Sco"), "Pluto, traditionally Mars");
  assert.equal(rulerLabel("Aquarius"), "Uranus, traditionally Saturn");
  assert.equal(rulerLabel("Pis"), "Neptune, traditionally Jupiter");
  assert.equal(rulerLabel("Lib"), "Venus");
  for (const s of SIGNS) assert.ok(traditionalRuler(s) && modernRuler(s), s);
});

test("chart ruler: modern planet, traditional co-ruler, and the summary names both", () => {
  const planets = [
    { name: "Pluto", sign: "Lib", house: "Twelfth_House" },
    { name: "Mars", sign: "Cap", house: "Third_House" },
  ];
  const r = getChartRuler(planets, [{ number: 1, sign: "Sco" }])!;
  assert.equal(r.planet, "Pluto");
  assert.equal(r.coRuler, "Mars");
  assert.equal(r.label, "Pluto, traditionally Mars");
  assert.match(r.summary, /Traditional astrology gives Scorpio rising to Mars/);
  const lib = getChartRuler([{ name: "Venus", sign: "Leo", house: null }], [{ number: 1, sign: "Lib" }])!;
  assert.equal(lib.coRuler, undefined);
  assert.equal(lib.label, "Venus");
});

/* ─── (b) whole-sign profections ─── */

test("Lord of the Year counts whole signs from the rising sign, not Placidus cusps", () => {
  // Placidus-style cusps with Taurus on both the 2nd and 3rd (Gemini intercepted).
  const houses = [
    { number: 1, sign: "Ari" }, { number: 2, sign: "Tau" }, { number: 3, sign: "Tau" },
    { number: 4, sign: "Can" }, { number: 5, sign: "Leo" }, { number: 6, sign: "Vir" },
    { number: 7, sign: "Lib" }, { number: 8, sign: "Sco" }, { number: 9, sign: "Sco" },
    { number: 10, sign: "Cap" }, { number: 11, sign: "Aqu" }, { number: 12, sign: "Pis" },
  ];
  const planets = [{ name: "Mercury", sign: "Pis", house: "Twelfth_House" }];
  // Born 2000-06-15; on 2002-07-01 they are 2 → 3rd house year.
  const lord = getLordOfTheYear("2000-06-15", planets, houses, new Date(2002, 6, 1))!;
  assert.equal(lord.profectionHouse, 3);
  assert.equal(lord.profectionSign, "Gem", "whole sign: Aries + 2 = Gemini (the cusp says Taurus)");
  assert.equal(lord.lordPlanet, "Mercury");
});

test("profections use the traditional ruler and say so", () => {
  const houses = [{ number: 1, sign: "Sco" }];
  const lord = getLordOfTheYear("2000-01-01", [{ name: "Mars", sign: "Ari", house: null }], houses, new Date(2000, 5, 1))!;
  assert.equal(lord.profectionSign, "Sco");
  assert.equal(lord.lordPlanet, "Mars");
  assert.match(lord.summary, /traditional ruler/);
  assert.match(lord.summary, /modern ruler is Pluto/);
});

test("Dolly's profection reads whole signs too", () => {
  const out = buildChartDepth(
    {
      birthDate: "2000-06-15",
      bigThree: { sun: "Gem", moon: "Ari", rising: "Ari" },
      planets: [{ name: "Sun", sign: "Gem", position: 24, house: null, retrograde: false }],
      houses: [
        { number: 1, sign: "Ari", position: 10 }, { number: 2, sign: "Tau", position: 5 },
        { number: 3, sign: "Tau", position: 28 },
      ],
    },
    new Date(Date.UTC(2002, 6, 1)),
  );
  assert.match(out, /3rd house activated \(Gemini/);
  assert.match(out, /time-lord Mercury/);
});

/* ─── dignities ─── */

test("Mercury is exalted in Virgo everywhere, never Aquarius", () => {
  const seed = read("supabase/seed_dignities.sql");
  assert.doesNotMatch(seed, /\('Mercury', 'Aquarius', 'exalted'/);
  assert.match(seed, /\('Mercury', 'Virgo', 'domicile',\n '[^']*exalted here/);
  const mig = read("supabase/migrations/20261028_fix_mercury_exaltation.sql");
  assert.match(mig, /delete from public\.kb_dignities\s+where planet = 'Mercury' and sign = 'Aquarius'/);
  const planets: Planet[] = [P("Mercury", 310)];
  const a = analyzeChart(planets, [], []);
  assert.equal(a.dignities.find((d) => d.planet === "Mercury")!.dignity, "peregrine");
});

/* ─── sect ─── */

const P = (name: string, abs: number, house: string | null = null): Planet => ({
  name, sign: SIGNS[Math.floor(abs / 30)], signNum: Math.floor(abs / 30), position: abs % 30, absPosition: abs, house, retrograde: false,
});

test("no sect is stated when the birth time is unknown", () => {
  const unknown = analyzeChart([P("Sun", 100), P("Moon", 200)], [], []);
  assert.equal(unknown.sect, null);
  assert.equal(getSectLight([{ name: "Sun", sign: "Can", house: null }, { name: "Moon", sign: "Lib", house: null }], []), null);
  const known = analyzeChart([P("Sun", 100, "Tenth_House"), P("Moon", 200, "Second_House")], [], []);
  assert.equal(known.sect?.isDayChart, true);
  const panel = read("src/components/ChartInsightsPanel.tsx");
  assert.match(panel, /\{analysis\.sect && \(/, "insights panel must hide sect when it is null");
});

/* ─── critical degrees & combustion ─── */

test("critical degrees match the windows the copy names", () => {
  const crit = (abs: number) => analyzeChart([P("Sun", 200), P("Venus", abs)], [], []).criticalDegrees
    .filter((c) => c.planet === "Venus" && c.type.startsWith("critical"));
  assert.equal(crit(12.6).length, 0, "12° Aries is not the 13° critical");
  assert.equal(crit(13.4).length, 1, "13° Aries is");
  assert.equal(crit(14.2).length, 0, "14° Aries is not");
  assert.equal(crit(30 + 7.5).length, 0, "7° Taurus is not a fixed critical");
  assert.equal(crit(30 + 8.5).length, 1, "8° Taurus is");
  assert.equal(crit(30 + 10.2).length, 0, "10° Taurus is not");
  assert.equal(crit(60 + 17.9).length, 1, "17° Gemini is");
});

test("combustion applies only to the classical planets", () => {
  const a = analyzeChart([P("Sun", 100), P("Pluto", 102), P("Uranus", 101), P("Mercury", 104), P("Neptune", 98)], [], []);
  const names = a.combustPlanets.map((c) => c.planet).sort();
  assert.deepEqual(names, ["Mercury"]);
});

/* ─── node type ─── */

test("the chart label names the node type in tropical charts too", () => {
  assert.equal(
    chartSystemLabel({ zodiacSystem: "tropical", ayanamsa: "lahiri", houseSystem: "placidus", nodeType: "mean" }),
    "Tropical · Placidus · Mean node",
  );
  assert.match(
    chartSystemLabel({ zodiacSystem: "sidereal", ayanamsa: "lahiri", houseSystem: "whole_sign", nodeType: "true" }),
    /True node$/,
  );
});

/* ─── unknown birth time: the Moon ─── */

const NYC = { latitude: 40.7128, longitude: -74.006 };

function moonSignFromChart(date: string, time: string): string {
  const c = calculateChart({ name: "t", birthDate: date, birthTime: time, unknownTime: false, ...NYC, cityName: "NYC" }) as {
    planets: { name: string; sign: string }[];
  };
  return c.planets.find((p) => p.name === "Moon")!.sign;
}

test("moon range agrees with the chart engine at both ends of the day", () => {
  let changed = 0;
  let checked = 0;
  for (let d = 1; d <= 28; d++) {
    const date = `2024-03-${String(d).padStart(2, "0")}`;
    const r = moonSignRange({ birthDate: date, ...NYC })!;
    assert.equal(r.start, moonSignFromChart(date, "00:00"), `${date} start`);
    assert.equal(r.end, moonSignFromChart(date, "23:59"), `${date} end`);
    assert.equal(r.changesSign, r.start !== r.end);
    // the placeholder (noon) Moon is always one of the two possibilities
    assert.ok([r.start, r.end].includes(moonSignFromChart(date, "12:00")), `${date} noon`);
    if (r.changesSign) {
      const i = SIGNS.indexOf(r.start);
      assert.equal(r.end, SIGNS[(i + 1) % 12], `${date}: a day's Moon spans adjacent signs`);
      changed++;
    }
    checked++;
  }
  // The Moon changes sign roughly every 2.3 days, so ~40–45% of dates.
  assert.ok(changed >= 8 && changed <= 16, `${changed}/${checked} days changed sign`);
});

test("moon range returns null on bad input instead of guessing", () => {
  assert.equal(moonSignRange({ birthDate: "", ...NYC }), null);
  assert.equal(moonSignRange({ birthDate: "2024-03-01", latitude: NaN, longitude: 0 }), null);
});

test("the unknown-time panel no longer claims the Moon is always accurate", () => {
  const page = read("src/app/(tabs)/you/page.tsx");
  assert.doesNotMatch(page, /Sun, Moon, and planetary signs are still accurate/);
  assert.doesNotMatch(page, /\(approx\)/);
  assert.match(page, /moonSignRange\(/);
  const form = read("src/app/chart/new/page.tsx");
  assert.doesNotMatch(form, /may be approximate/);
});
