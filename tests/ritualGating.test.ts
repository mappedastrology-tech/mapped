/**
 * Three content bugs that each made the app quietly show the wrong thing.
 */

import test from "node:test";
import assert from "node:assert/strict";

import { RITUAL_CATALOG, ALL_RITUALS } from "../src/lib/ritualCatalog";
import { isLordOfYearTransit } from "../src/lib/rulers";

const CANONICAL_PHASES = new Set([
  "new", "waxing-crescent", "first-quarter", "waxing-gibbous",
  "full", "waning-gibbous", "last-quarter", "waning-crescent",
]);

test("opt-in-gated rituals are never suggested, but stay in the full library", () => {
  // The catalog documents these as opt-in only in three separate places, then
  // spread them into the suggestion pool with no filter — so a ritual about a
  // memory "from before the baby" could surface for someone who picked
  // "10 min / in bed / cry it out" and had given no postpartum context.
  const gatedInSuggestions = RITUAL_CATALOG.filter((r) => r.contentTags?.length);
  assert.deepEqual(
    gatedInSuggestions.map((r) => r.id),
    [],
    "rituals carrying contentTags must not be in the algorithmic pool",
  );

  const gatedOverall = ALL_RITUALS.filter((r) => r.contentTags?.length);
  assert.ok(gatedOverall.length > 0, "the gated rituals must still exist for search and by-id lookup");
  assert.ok(ALL_RITUALS.length > RITUAL_CATALOG.length, "ALL_RITUALS is the superset");
});

test("every bestPhases entry is a phase the moon engine actually emits", () => {
  // Twenty entries used space-separated names ("waxing crescent", "third
  // quarter") that getMoonPhase never returns, so those rituals were excluded
  // from the very phase they were tagged for. Two had no valid token at all.
  const bad: string[] = [];
  for (const ritual of ALL_RITUALS) {
    for (const phase of ritual.bestPhases ?? []) {
      if (!CANONICAL_PHASES.has(phase)) bad.push(`${ritual.id}: "${phase}"`);
    }
    if (ritual.bestPhases && ritual.bestPhases.length === 0) {
      bad.push(`${ritual.id}: empty bestPhases — unreachable on every day`);
    }
  }
  assert.deepEqual(bad, [], `invalid moon phase tags:\n  ${bad.join("\n  ")}`);
});

test("the Year ruler filter sees natal points folded into alsoNatal", () => {
  // calculateTransits folds nearby natal points into one row. The predicate
  // read only natalPlanet, so "Saturn square your Sun & Mercury" went
  // unbadged — and was dropped by the filter — in a Mercury year.
  const folded = { transitPlanet: "Saturn", natalPlanet: "Sun", alsoNatal: ["Mercury"] };
  assert.equal(isLordOfYearTransit(folded, "Mercury"), true, "a folded natal point still counts");
  assert.equal(isLordOfYearTransit(folded, "Sun"), true);
  assert.equal(isLordOfYearTransit(folded, "Saturn"), true, "the transiting planet counts");
  assert.equal(isLordOfYearTransit(folded, "Venus"), false);
  assert.equal(isLordOfYearTransit({ transitPlanet: "Mars", natalPlanet: "Moon" }, "Mercury"), false);
});
