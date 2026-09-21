/**
 * Vedic / sidereal calculations.
 *
 * Reference values come from the Swiss Ephemeris 2.10 (pyswisseph, Moshier
 * ephemeris) — the engine behind Jagannatha Hora, Astro.com and most Jyotish
 * software. Tolerances are stated per check; the project target is ~1 arcminute.
 */
import { test } from "node:test";
import assert from "node:assert/strict";

import {
  meanAyanamsa, ayanamsaDegrees, formatDegreesMinutes, normalizeAyanamsa,
} from "@/lib/astro/vedic/ayanamsa";
import { nakshatraOf, NAKSHATRA_NAMES } from "@/lib/astro/vedic/nakshatra";
import { vimshottariDasha, currentDasha, upcomingAntardashas, DASHA_YEARS } from "@/lib/astro/vedic/dasha";
import { navamsaOf } from "@/lib/astro/vedic/varga";
import { wholeSignCusps, wholeSignHouse, normalizeHouseSystem } from "@/lib/astro/vedic/houses";
import { trueNodeLongitude } from "@/lib/astro/vedic/nodes";
import { getPanchang, tithiName, karanaName } from "@/lib/astro/vedic/panchang";
import { julday } from "@/lib/astro/ephemeris";
import { calculateChart } from "@/lib/astro/calculateChart";
import { calculateTransits } from "@/lib/astro/calculateTransits";
import { NAKSHATRAS } from "@/lib/celestialCalendar";

const ARCMIN = 1 / 60;
const near = (actual: number, expected: number, tol: number, label: string) => {
  let d = Math.abs(actual - expected) % 360;
  if (d > 180) d = 360 - d;
  assert.ok(d <= tol, `${label}: got ${actual.toFixed(4)}, expected ${expected.toFixed(4)} (off ${(d * 60).toFixed(2)}')`);
};

// ─── Ayanamsa ────────────────────────────────────────────────────────────────

test("ayanamsa: Lahiri matches Swiss Ephemeris across 1900–2100", () => {
  // swe.get_ayanamsa_ut (mean ayanamsa) at 0h UT on 1 January.
  const ref: [number, number][] = [
    [1900, 22.46053059], [1956, 23.24250198], [2000, 23.85707323], [2024, 24.19234403], [2100, 25.25426827],
  ];
  for (const [y, deg] of ref) near(meanAyanamsa(julday(y, 1, 1, 0), "lahiri"), deg, 1 / 3600, `Lahiri ${y}`);
});

test("ayanamsa: the brief's sanity figures (23°51' in 2000, ~24°12' in 2024)", () => {
  assert.equal(formatDegreesMinutes(meanAyanamsa(julday(2000, 1, 1, 0))), "23°51'");
  // 24°11'32" on 1 Jan 2024, reaching 24°12' by spring.
  near(meanAyanamsa(julday(2024, 6, 1, 0)), 24 + 12 / 60, ARCMIN, "Lahiri mid-2024");
});

test("ayanamsa: KP and Raman match Swiss Ephemeris", () => {
  near(meanAyanamsa(julday(2000, 1, 1, 0), "krishnamurti"), 23.76022092, 1 / 3600, "KP 2000");
  near(meanAyanamsa(julday(2100, 1, 1, 0), "krishnamurti"), 25.15741605, 1 / 3600, "KP 2100");
  near(meanAyanamsa(julday(2000, 1, 1, 0), "raman"), 22.41077192, 1 / 3600, "Raman 2000");
  near(meanAyanamsa(julday(1900, 1, 1, 0), "raman"), 21.01422913, 1 / 3600, "Raman 1900");
});

test("ayanamsa: true ayanamsa includes nutation (what gets subtracted from positions)", () => {
  // swe.get_ayanamsa_ex_ut(jd, 0) for the sample birth below.
  near(ayanamsaDegrees(julday(1990, 7, 4, 19.5), "lahiri"), 23.72825689, 2 / 3600, "true Lahiri 1990-07-04");
});

test("ayanamsa: unknown stored values fall back to Lahiri", () => {
  assert.equal(normalizeAyanamsa(null), "lahiri");
  assert.equal(normalizeAyanamsa("fagan"), "lahiri");
  assert.equal(normalizeAyanamsa("raman"), "raman");
});

// ─── Nakshatras ──────────────────────────────────────────────────────────────

test("nakshatra: boundaries, padas and lords", () => {
  assert.deepEqual(
    { ...nakshatraOf(0), degreesIn: 0, fraction: 0 },
    { index: 0, name: "Ashwini", pada: 1, lord: "Ketu", degreesIn: 0, fraction: 0 },
  );
  assert.equal(nakshatraOf(13.3334).name, "Bharani");
  assert.equal(nakshatraOf(13.3334).lord, "Venus");
  assert.equal(nakshatraOf(3.34).pada, 2);
  assert.equal(nakshatraOf(359.99).name, "Revati");
  assert.equal(nakshatraOf(359.99).pada, 4);
  assert.equal(nakshatraOf(359.99).lord, "Mercury");
  assert.equal(nakshatraOf(-0.5).name, "Revati", "negative longitudes wrap");
});

test("nakshatra: names line up with the almanac copy in celestialCalendar", () => {
  assert.deepEqual(NAKSHATRAS.map((n) => n.name), [...NAKSHATRA_NAMES]);
});

// ─── Navamsa & whole-sign houses ─────────────────────────────────────────────

test("navamsa: classical starting signs by element", () => {
  assert.equal(navamsaOf(0).sign, "Ari");      // fire (Aries) starts from Aries
  assert.equal(navamsaOf(30).sign, "Cap");     // earth (Taurus) starts from Capricorn
  assert.equal(navamsaOf(60).sign, "Lib");     // air (Gemini) starts from Libra
  assert.equal(navamsaOf(90).sign, "Can");     // water (Cancer) starts from Cancer
  assert.equal(navamsaOf(29.99).sign, "Sag");  // last navamsa of Aries
  assert.equal(navamsaOf(222.6725).sign, "Lib"); // 12.67° Scorpio: 4th navamsa from Cancer
});

test("whole-sign houses: rising sign is the whole 1st house", () => {
  const asc = 182.06; // 2° Libra
  assert.deepEqual(wholeSignCusps(asc).slice(0, 3), [180, 210, 240]);
  assert.equal(wholeSignHouse(181, asc), 1);
  assert.equal(wholeSignHouse(179, asc), 12);
  assert.equal(wholeSignHouse(0.5, asc), 7);
  assert.equal(normalizeHouseSystem(null, "sidereal"), "whole_sign");
  assert.equal(normalizeHouseSystem(null, "tropical"), "placidus");
  assert.equal(normalizeHouseSystem("placidus", "sidereal"), "placidus");
});

test("true node agrees with Swiss Ephemeris", () => {
  near(trueNodeLongitude(julday(1990, 7, 4, 19.5)), 307.4779, 0.5 * ARCMIN, "true node 1990-07-04");
});

// ─── A full sidereal birth chart ─────────────────────────────────────────────

// Houston, 4 July 1990, 14:30 CDT (19:30 UT).
const SAMPLE = {
  name: "Test", birthDate: "1990-07-04", birthTime: "14:30",
  latitude: 29.7604, longitude: -95.3698, cityName: "Houston",
};

test("sidereal chart: positions match Swiss Ephemeris (Lahiri)", () => {
  const c = calculateChart({ ...SAMPLE, zodiacSystem: "sidereal", ayanamsa: "lahiri" }) as any;
  const p = (n: string) => [...c.planets, ...c.specialPoints].find((x: any) => x.name === n).absPosition;
  // swe.calc_ut(..., FLG_SIDEREAL) reference values
  near(p("Sun"), 78.829, 0.02, "Sun");
  near(p("Moon"), 222.6725, 0.02, "Moon");
  near(p("Mars"), 0.9409, 0.02, "Mars");
  near(p("Saturn"), 269.0203, 0.02, "Saturn");
  near(p("North Node"), 284.9472, 0.02, "mean Rahu");
  near(c.ascendant.absPosition, 182.0631, 0.05, "Ascendant");
  near(c.midheaven.absPosition, 93.8736, 0.05, "MC");
  near(c.ayanamsaDegrees, 23.7283, 0.001, "ayanamsa at birth");
  assert.equal(c.houseSystem, "whole_sign", "sidereal defaults to whole-sign");
  assert.equal(c.houses[0].absPosition, 180, "house 1 = all of Libra");
  assert.equal(c.bigThree.rising, "Lib");
});

test("sidereal chart: true-node option swaps Rahu/Ketu", () => {
  const c = calculateChart({ ...SAMPLE, zodiacSystem: "sidereal", nodeType: "true" }) as any;
  const nn = c.specialPoints.find((x: any) => x.name === "North Node").absPosition;
  const sn = c.specialPoints.find((x: any) => x.name === "South Node").absPosition;
  near(nn, 283.7497, 0.02, "true Rahu");
  near(sn, 103.7497, 0.02, "true Ketu");
});

test("sidereal chart: Vedic layer — Moon nakshatra, grahas named Rahu/Ketu, navamsa", () => {
  const c = calculateChart({ ...SAMPLE, zodiacSystem: "sidereal" }) as any;
  const v = c.vedic;
  assert.ok(v, "vedic block present");
  assert.deepEqual(v.grahas.map((g: any) => g.name), ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"]);
  const moon = v.grahas.find((g: any) => g.name === "Moon");
  assert.equal(moon.nakshatra, "Anuradha");
  assert.equal(moon.pada, 3);
  assert.equal(moon.nakshatraLord, "Saturn");
  assert.equal(moon.navamsaSign, "Lib");
  assert.equal(v.ascendant.nakshatra, "Chitra");
  assert.deepEqual(v.outerPlanets.map((g: any) => g.name), ["Uranus", "Neptune", "Pluto"]);
});

test("tropical chart: unchanged defaults (Placidus, no vedic block, house 1 = Ascendant)", () => {
  const c = calculateChart(SAMPLE) as any;
  assert.equal(c.houseSystem, "placidus");
  assert.equal(c.vedic, undefined);
  assert.equal(c.houses[0].absPosition, c.ascendant.absPosition);
});

test("unknown birth time: no Ascendant, no houses, Vedic layer flags it", () => {
  const c = calculateChart({ ...SAMPLE, zodiacSystem: "sidereal", unknownTime: true }) as any;
  assert.equal(c.ascendant, null);
  assert.deepEqual(c.houses, []);
  assert.equal(c.vedic.ascendant, null);
  assert.equal(c.vedic.unknownTime, true);
});

// ─── Vimshottari dasha ───────────────────────────────────────────────────────

test("dasha: balance at birth from the Moon's nakshatra", () => {
  const c = calculateChart({ ...SAMPLE, zodiacSystem: "sidereal" }) as any;
  const tl = vimshottariDasha(c.vedic.moonLongitude, new Date(c.vedic.birthUtc));
  assert.equal(tl.birthLord, "Saturn");
  // Moon 9.339° into Anuradha's 13.333° → 29.96% of Saturn's 19 years left.
  assert.ok(Math.abs(tl.balanceYears - 5.6917) < 0.01, `balance ${tl.balanceYears}`);
  assert.deepEqual(tl.mahadashas.slice(0, 4).map((m) => m.lord), ["Saturn", "Mercury", "Ketu", "Venus"]);
  // Saturn ends ~5.69y after birth (July 1990) → March 1996.
  assert.equal(tl.mahadashas[0].end.toISOString().slice(0, 7), "1996-03");
});

test("dasha: current and upcoming periods", () => {
  const c = calculateChart({ ...SAMPLE, zodiacSystem: "sidereal" }) as any;
  const tl = vimshottariDasha(c.vedic.moonLongitude, new Date(c.vedic.birthUtc));
  const now = currentDasha(tl, new Date("2026-09-21T12:00:00Z"));
  assert.ok(now);
  // Saturn → 1996, Mercury → 2013, Ketu → 2020, then Venus (20y) to 2040.
  // Within Venus: Venus 3y4m, Sun 1y, Moon 1y8m, then Mars (early 2026 – 2027).
  assert.equal(now!.maha.lord, "Venus");
  assert.equal(now!.antar.lord, "Mars");
  const next = upcomingAntardashas(tl, new Date("2026-09-21T12:00:00Z"), 3);
  assert.deepEqual(next.map((n) => n.antar.lord), ["Rahu", "Jupiter", "Saturn"]);
});

test("dasha: antardashas tile each mahadasha exactly", () => {
  const tl = vimshottariDasha(100, new Date("1980-01-01T00:00:00Z"));
  for (const m of tl.mahadashas.slice(1, 5)) {
    assert.equal(m.antardashas.length, 9);
    assert.equal(m.antardashas[0].lord, m.lord, "first bhukti is the maha lord");
    assert.equal(m.antardashas[0].start.getTime(), m.start.getTime());
    assert.equal(m.antardashas[8].end.getTime(), m.end.getTime());
    const years = (m.end.getTime() - m.start.getTime()) / (365.25 * 86400000);
    assert.ok(Math.abs(years - DASHA_YEARS[m.lord]) < 1e-6);
  }
});

// ─── Transits use the transit-moment ayanamsa ────────────────────────────────

test("sidereal transits: planets are sidereal for the transit date", () => {
  const natal = calculateChart({ ...SAMPLE, zodiacSystem: "sidereal" }) as any;
  const t = calculateTransits({
    natalPlanets: natal.planets, natalHouses: natal.houses,
    transitDate: "2026-09-21", zodiacSystem: "sidereal", ayanamsa: "lahiri",
  }) as any;
  const tropical = calculateTransits({ natalPlanets: natal.planets, transitDate: "2026-09-21" }) as any;
  const sun = t.transitPlanets.find((p: any) => p.name === "Sun").absPosition;
  const sunT = tropical.transitPlanets.find((p: any) => p.name === "Sun").absPosition;
  // swe true Lahiri at 2026-09-21 12:00 UT = 24.2329 (birth value was 23.7283).
  near(sunT - sun, 24.2329, 0.02, "transit ayanamsa (2026) not the birth one");
  assert.equal(t.zodiacSystem, "sidereal");
});

// ─── Panchang ────────────────────────────────────────────────────────────────

test("panchang: 21 Sep 2026 12:00 UT matches Swiss Ephemeris", () => {
  const p = getPanchang(new Date("2026-09-21T12:00:00Z"));
  assert.equal(p.tithi.number, 10);
  assert.equal(p.tithi.name, "Shukla Dashami");
  assert.equal(p.nakshatra.name, "Uttara Ashadha");
  assert.equal(p.yoga.name, "Atiganda");
  assert.equal(p.karana.name, "Garaja");
  // Tithi ends 14:32 UT, nakshatra ends 01:38 UT on the 22nd (±3 min).
  assert.ok(Math.abs(p.tithi.endsAt!.getTime() - Date.parse("2026-09-21T14:32:00Z")) < 3 * 60000);
  assert.ok(Math.abs(p.nakshatra.endsAt!.getTime() - Date.parse("2026-09-22T01:38:00Z")) < 3 * 60000);
});

test("panchang: new moon (8 Apr 2024 eclipse) is Amavasya, Naga karana", () => {
  const p = getPanchang(new Date("2024-04-08T18:00:00Z"));
  assert.equal(p.tithi.name, "Amavasya");
  assert.equal(p.karana.name, "Naga");
  assert.equal(p.nakshatra.name, "Revati");
  assert.equal(p.yoga.name, "Vaidhriti");
});

test("panchang: naming helpers", () => {
  assert.equal(tithiName(1).name, "Shukla Pratipada");
  assert.equal(tithiName(15).name, "Purnima");
  assert.equal(tithiName(16).name, "Krishna Pratipada");
  assert.equal(karanaName(0), "Kimstughna");
  assert.equal(karanaName(1), "Bava");
  assert.equal(karanaName(56), "Vishti");
  assert.equal(karanaName(57), "Shakuni");
});
