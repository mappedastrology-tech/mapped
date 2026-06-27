import { test } from "node:test";
import assert from "node:assert/strict";

import { calculateChart } from "@/lib/astro/calculateChart";
import { calculateSynastry, SYNASTRY_VERSION } from "@/lib/astro/calculateSynastry";
import { getTodaysSolarEvent, getSolarEventsForYear } from "@/lib/celestialCalendar";
import { CLAUDE_MODEL, FALLBACK_MODEL } from "@/lib/aiModel";

const SAMPLE = {
  name: "Test",
  birthDate: "1990-07-04",
  birthTime: "14:30",
  latitude: 29.7604,
  longitude: -95.3698,
  cityName: "Houston",
};

test("calculateChart: returns a complete, sane chart", () => {
  const c = calculateChart(SAMPLE) as any;
  assert.equal(c.planets.length, 10, "10 planets");
  for (const p of c.planets) {
    assert.ok(p.sign && typeof p.absPosition === "number");
    assert.ok(p.absPosition >= 0 && p.absPosition < 360, `${p.name} longitude in range`);
  }
  assert.ok(c.bigThree.sun && c.bigThree.moon && c.bigThree.rising, "big three present");
  assert.equal(c.houses.length, 12, "12 houses");
  assert.ok(c.specialPoints.some((sp: any) => sp.name === "North Node"));
  assert.ok(c.specialPoints.some((sp: any) => sp.name === "Lilith"));
  assert.ok(c.midheaven && typeof c.midheaven.absPosition === "number");
  assert.ok(c.vertex && typeof c.vertex.absPosition === "number", "vertex present for known birth time");
});

test("calculateChart: South Node is exactly opposite North Node", () => {
  const c = calculateChart(SAMPLE) as any;
  const nn = c.specialPoints.find((p: any) => p.name === "North Node").absPosition;
  const sn = c.specialPoints.find((p: any) => p.name === "South Node").absPosition;
  const diff = Math.abs(((nn - sn) % 360 + 360) % 360);
  assert.ok(Math.abs(diff - 180) < 0.5, `nodes opposed (got ${diff})`);
});

test("calculateChart: unknown birth time omits the Vertex", () => {
  const c = calculateChart({ ...SAMPLE, unknownTime: true }) as any;
  assert.equal(c.vertex, null);
});

test("calculateSynastry: returns full structure with versioned metadata", () => {
  const c1 = calculateChart(SAMPLE) as any;
  const c2 = calculateChart({ ...SAMPLE, birthDate: "1992-11-20", birthTime: "08:15" }) as any;
  const syn = calculateSynastry(c1, c2, "partner") as any;

  assert.equal(syn.version, SYNASTRY_VERSION);
  assert.ok(Array.isArray(syn.crossAspects) && syn.crossAspects.length > 0);
  assert.ok(Array.isArray(syn.themes) && syn.themes.length > 0);
  assert.equal(typeof syn.harmony, "number");
  assert.equal(typeof syn.tension, "number");

  for (const fc of syn.fatedContacts) {
    assert.equal(fc.fated, true);
    assert.ok(fc.fatedReason && fc.fatedCategory && fc.fatedCategoryLabel);
    assert.ok(typeof fc.fatedWeight === "number");
  }
  // fated contacts are sorted by weight (desc)
  const weights = syn.fatedContacts.map((f: any) => f.fatedWeight ?? 0);
  for (let i = 1; i < weights.length; i++) assert.ok(weights[i - 1] >= weights[i], "fated sorted by weight");
});

test("getSolarEventsForYear: exactly four events, correct order and signs", () => {
  const ev = getSolarEventsForYear(2026);
  assert.equal(ev.length, 4);
  assert.deepEqual(ev.map((e) => e.kind), ["spring-equinox", "summer-solstice", "autumn-equinox", "winter-solstice"]);
  assert.deepEqual(ev.map((e) => e.sign), ["Aries", "Cancer", "Libra", "Capricorn"]);
  for (let i = 1; i < ev.length; i++) assert.ok(ev[i].date > ev[i - 1].date, "chronological");
});

test("getTodaysSolarEvent: fires on the exact day, null otherwise", () => {
  for (const e of getSolarEventsForYear(2026)) {
    const hit = getTodaysSolarEvent(e.date);
    assert.ok(hit, `should detect ${e.name} on ${e.date.toDateString()}`);
    assert.equal(hit!.kind, e.kind);
  }
  // a clearly non-event day
  assert.equal(getTodaysSolarEvent(new Date(2026, 6, 4)), null);
});

test("aiModel: model identifiers look valid", () => {
  for (const m of [CLAUDE_MODEL, FALLBACK_MODEL]) {
    assert.equal(typeof m, "string");
    assert.ok(/^claude-/.test(m), `model "${m}" looks like a Claude model`);
  }
  assert.notEqual(CLAUDE_MODEL, FALLBACK_MODEL, "fallback differs from primary");
});
