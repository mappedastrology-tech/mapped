/**
 * A reference entry's `image` is a public path the browser fetches directly —
 * nothing type-checks it, and a wrong one fails silently as a missing plate in
 * the Library list. These check the paths against the files that actually exist.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { ALL_REFERENCE } from "../src/lib/learn/reference/index";

test("every reference image points at a file that exists", () => {
  const missing = ALL_REFERENCE
    .filter((e) => e.image && !existsSync(`public${e.image}`))
    .map((e) => `${e.id} -> ${e.image}`);
  assert.deepEqual(missing, [], `\nEntries pointing at a missing file:\n  ${missing.join("\n  ")}\n`);
});

test("the numerology plates are exactly the countable numbers", () => {
  // The plate is an object group whose count IS the number, so only the
  // countable entries can have one. A karmic debt or an angel number getting a
  // plate here would mean the set had drifted from the idea behind it.
  const plated = ALL_REFERENCE
    .filter((e) => e.domain === "numerology" && e.image)
    .map((e) => e.id)
    .sort();
  assert.deepEqual(plated, [
    "num-0", "num-1", "num-11", "num-2", "num-22", "num-3", "num-33",
    "num-4", "num-5", "num-6", "num-7", "num-8", "num-9",
  ]);
});

test("the chakra plates are exactly the wheels, not the concepts", () => {
  // A plate here is a yantra (or, for the two transpersonal centres, the thing
  // the centre describes). "Prana" has no object, so a plate appearing on one
  // of the five concept entries would mean the set had drifted from the idea.
  const plated = ALL_REFERENCE
    .filter((e) => e.domain === "chakras" && e.image)
    .map((e) => e.id)
    .sort();
  assert.deepEqual(plated, [
    "chakra-crown", "chakra-earth-star", "chakra-heart", "chakra-root",
    "chakra-sacral", "chakra-solar-plexus", "chakra-soul-star",
    "chakra-third-eye", "chakra-throat",
  ]);
});

test("every rune in the Elder Futhark has a plate", () => {
  // The alphabet is closed at 24. If this count moves, either a rune was lost
  // from the reference or something that is not a rune acquired the prefix.
  const runes = ALL_REFERENCE.filter((e) => e.domain === "runes");
  assert.equal(runes.length, 24);
  assert.deepEqual(runes.filter((e) => !e.image).map((e) => e.id), []);
});
