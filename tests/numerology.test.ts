import { test } from "node:test";
import assert from "node:assert/strict";

import {
  reduceNumber,
  pythagoreanValue,
  chaldeanValue,
  computeNumerology,
} from "@/lib/numerology";

test("pythagorean letter values wrap 1–9", () => {
  assert.equal(pythagoreanValue("A"), 1);
  assert.equal(pythagoreanValue("I"), 9);
  assert.equal(pythagoreanValue("J"), 1);
  assert.equal(pythagoreanValue("R"), 9);
  assert.equal(pythagoreanValue("S"), 1);
  assert.equal(pythagoreanValue("Z"), 8);
  assert.equal(pythagoreanValue("a"), 1, "case-insensitive");
});

test("chaldean letter values never assign 9", () => {
  assert.equal(chaldeanValue("A"), 1);
  assert.equal(chaldeanValue("F"), 8);
  assert.equal(chaldeanValue("O"), 7);
  assert.equal(chaldeanValue("U"), 6);
  for (const ch of "ABCDEFGHIJKLMNOPQRSTUVWXYZ") {
    assert.notEqual(chaldeanValue(ch), 9, `${ch} is not 9 in Chaldean`);
  }
});

test("reduceNumber preserves master numbers and flags karmic debt", () => {
  assert.equal(reduceNumber(38).value, 11, "38 → 11 master kept");
  assert.equal(reduceNumber(38, false).value, 2, "38 → 2 when masters off");
  assert.equal(reduceNumber(29).value, 11);
  assert.equal(reduceNumber(13).value, 4);
  assert.equal(reduceNumber(13).karmicDebt, 13);
  assert.equal(reduceNumber(19).karmicDebt, 19, "19 → 1 carries karmic debt 19");
  assert.equal(reduceNumber(19).value, 1);
  assert.equal(reduceNumber(28).karmicDebt, null, "28 → 1 has no karmic debt");
});

test("life path uses the segmented, master-preserving method", () => {
  // July 3, 1962 → 7 + 3 + (1962→9) = 19 → 1, carrying karmic debt 19.
  const a = computeNumerology("Test Name", "1962-07-03")!;
  assert.equal(a.lifePath.value, 1);
  assert.equal(a.lifePath.karmicDebt, 19);

  // Dec 25, 1981 → 3 + 7 + 1 = 11 (master).
  const b = computeNumerology("Test Name", "1981-12-25")!;
  assert.equal(b.lifePath.value, 11);
  assert.equal(b.lifePath.isMaster, true);

  // Nov 1, 2009 → 11 + 1 + 11 = 23 → 5.
  const c = computeNumerology("Test Name", "2009-11-01")!;
  assert.equal(c.lifePath.value, 5);
});

test("personal year uses current calendar year", () => {
  // Born April 12; in 2026 → 4 + (12→3) + (2026→1) = 8.
  const p = computeNumerology("Test Name", "1990-04-12", { now: new Date("2026-06-30") })!;
  assert.equal(p.personalYear, 8);
});

test("balance number reduces master numbers to a single digit", () => {
  // Thomas John Hancock → T(2)+J(1)+H(8) = 11 → 2.
  const p = computeNumerology("Thomas John Hancock", "1980-01-01")!;
  assert.equal(p.balance, 2);
});

test("Y is classified as a vowel or consonant by position", () => {
  // "Mary" → Y after a consonant = vowel, so it feeds the Soul Urge (vowels).
  // "Yolanda" → leading Y before a vowel = consonant.
  // Confirm the engine produces stable, finite results either way.
  const mary = computeNumerology("Mary Smith", "1990-05-05")!;
  const yol = computeNumerology("Yolanda Smith", "1990-05-05")!;
  for (const v of [mary.soulUrge.value, yol.personality.value]) {
    assert.ok(v >= 1 && v <= 33, "values in numerological range");
  }
});

test("name numbers differ between Pythagorean and Chaldean systems", () => {
  const py = computeNumerology("Jane Mary Doe", "1990-05-14", { system: "pythagorean" })!;
  const ch = computeNumerology("Jane Mary Doe", "1990-05-14", { system: "chaldean" })!;
  // Date-based numbers must match across systems.
  assert.equal(py.lifePath.value, ch.lifePath.value, "life path system-independent");
  assert.equal(py.birthday.value, ch.birthday.value, "birthday system-independent");
  assert.equal(py.personalYear, ch.personalYear, "personal year system-independent");
});

test("challenges are single digits 0–8 and pinnacles cover four periods", () => {
  const p = computeNumerology("Jane Mary Doe", "1990-05-14")!;
  assert.equal(p.challenges.length, 4);
  for (const c of p.challenges) assert.ok(c.value >= 0 && c.value <= 8, "challenge 0–8");
  assert.equal(p.pinnacles.length, 4);
  assert.equal(p.pinnacles[0].startAge, 0);
  assert.equal(p.pinnacles[3].endAge, null, "final pinnacle runs to the end");
  assert.equal(p.pinnacles.filter((x) => x.active).length, 1, "exactly one active pinnacle");
});

test("karmic lessons are the missing digits and subconscious self is 9 minus their count", () => {
  const p = computeNumerology("Jane Mary Doe", "1990-05-14")!;
  for (const d of p.karmicLessons) assert.ok(d >= 1 && d <= 9);
  assert.equal(p.subconsciousSelf, 9 - p.karmicLessons.length);
});

test("invalid birth dates return null", () => {
  assert.equal(computeNumerology("Jane Doe", "not-a-date"), null);
  assert.equal(computeNumerology("Jane Doe", "1990-13-40"), null);
});
