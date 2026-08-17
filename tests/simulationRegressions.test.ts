/**
 * Regression tests for the three S2 bugs found by the 12-persona simulation
 * (Mapped_Simulation_Run1_Findings.md — I-001, I-002, I-003). Each of these
 * silently corrupted real user output; keep them pinned.
 */
import { test } from "node:test";
import assert from "node:assert/strict";

import { calculateChart } from "@/lib/astro/calculateChart";
import { computeNumerology, normalizeNameLetters } from "@/lib/numerology";
import { computeResonance, normSign, extractFeatures } from "@/lib/resonance/engine";

// ── I-001: abbreviated sign names must reach the Resonance engine ─────────────
test("I-001: abbreviated signs (as stored in charts) resolve to full names", () => {
  assert.equal(normSign("Gem"), "Gemini");
  assert.equal(normSign("Sco"), "Scorpio");
  assert.equal(normSign("Scorpio"), "Scorpio");
  assert.equal(normSign("aries"), "Aries");
  assert.equal(normSign(null), null);
  assert.equal(normSign("Nope"), null);
});

test("I-001: abbreviated and full sign inputs produce identical resonance", () => {
  const base = { lifePath: 3, expression: 5, soulUrge: 9, hdType: "Generator", hdAuthority: "emotional", hdLines: [5, 1] as [number, number] };
  const abbrev = computeResonance({ ...base, sun: "Gem", moon: "Sco", rising: "Ari", placements: [{ name: "Mars", sign: "Ari", house: 1 }] });
  const full = computeResonance({ ...base, sun: "Gemini", moon: "Scorpio", rising: "Aries", placements: [{ name: "Mars", sign: "Aries", house: 1 }] });
  assert.ok(abbrev && full);
  assert.equal(abbrev!.primary.id, full!.primary.id);
  assert.deepEqual(abbrev!.traits, full!.traits);
  // And the zodiac features actually contribute (Sun/Moon/Rising appear).
  const feats = extractFeatures({ ...base, sun: "Gem", moon: "Sco", rising: "Ari" }).map((f) => f.id);
  assert.ok(feats.includes("astro.sun.Gemini"), `expected Gemini Sun feature, got ${feats}`);
  assert.ok(feats.includes("astro.rising.Aries"));
});

// ── I-002: unknown birth time must not fabricate time-dependent data ─────────
test("I-002: unknown birth time yields no Rising, houses, MC, or cusp warning", () => {
  const chart = calculateChart({
    name: "Sam Rivers", birthDate: "1992-04-04", birthTime: "12:00",
    latitude: 39.7392, longitude: -104.9903, unknownTime: true,
  }) as Record<string, unknown>;
  const bigThree = chart.bigThree as { sun: string; moon: string; rising: string };
  assert.equal(bigThree.rising, "", "rising must be empty when time is unknown");
  assert.equal(chart.risingCusp, null);
  assert.deepEqual(chart.houses, []);
  assert.equal(chart.midheaven, null);
  const planets = chart.planets as { house: number | null }[];
  assert.ok(planets.length > 0);
  for (const p of planets) assert.equal(p.house, null, "planet houses must be null when time is unknown");
  // Sun/Moon signs are still computed (noon convention).
  assert.ok(bigThree.sun && bigThree.moon);
});

test("I-002: known birth time still populates Rising, houses, and MC", () => {
  const chart = calculateChart({
    name: "Ava Chen", birthDate: "1990-07-15", birthTime: "14:30",
    latitude: 40.7128, longitude: -74.006,
  }) as Record<string, unknown>;
  const bigThree = chart.bigThree as { rising: string };
  assert.ok(bigThree.rising);
  assert.equal((chart.houses as unknown[]).length, 12);
  assert.ok(chart.midheaven);
});

// ── I-003: non-ASCII letters must be transliterated, not deleted ────────────
test("I-003: accented and Nordic letters transliterate instead of vanishing", () => {
  assert.equal(normalizeNameLetters("Þórsdóttir"), "THORSDOTTIR");
  assert.equal(normalizeNameLetters("García"), "GARCIA");
  assert.equal(normalizeNameLetters("Müller"), "MULLER");
  assert.equal(normalizeNameLetters("Søren"), "SOREN");
  assert.equal(normalizeNameLetters("Straße"), "STRASSE");
  assert.equal(normalizeNameLetters("Guðmundsdóttir"), "GUDMUNDSDOTTIR");
});

test("I-003: José García gets the correct name numbers (was Ex11/SU8, a false master)", () => {
  const p = computeNumerology("José García", "1998-12-21");
  assert.ok(p);
  assert.equal(p!.expression.value, 7);
  assert.equal(p!.soulUrge.value, 22);
  assert.equal(p!.personality.value, 3);
});
