import { test } from "node:test";
import assert from "node:assert/strict";
import { ALL_REFERENCE, searchReference, scoreEntry, referenceByDomain } from "../src/lib/learn/reference";

test("every reference entry is well-formed with a unique id", () => {
  const ids = new Set<string>();
  for (const e of ALL_REFERENCE) {
    assert.ok(!ids.has(e.id), `duplicate reference id ${e.id}`);
    ids.add(e.id);
    assert.ok(e.name && e.summary, `${e.id} missing name/summary`);
    assert.ok(e.fields.length > 0, `${e.id} has no detail fields`);
    assert.ok(e.domain, `${e.id} missing domain`);
  }
});

test("crystals reference has a healthy number of entries", () => {
  const crystals = referenceByDomain("crystals");
  assert.ok(crystals.length >= 15, `expected >=15 crystals, got ${crystals.length}`);
});

test("toxic crystals carry a safety flag", () => {
  for (const id of ["malachite", "selenite"]) {
    const e = ALL_REFERENCE.find((x) => x.id === id)!;
    assert.ok(e.safety && e.safety.length > 0, `${id} should have a safety note`);
  }
});

test("search finds entries by name, alias, and tag", () => {
  assert.ok(searchReference("amethyst").some((e) => e.id === "amethyst"), "name search failed");
  assert.ok(searchReference("fool's gold").some((e) => e.id === "pyrite"), "alias search failed");
  assert.ok(searchReference("love").some((e) => e.id === "rose-quartz"), "tag/summary search failed");
  assert.equal(searchReference("zzzznotathing").length, 0, "nonsense query should return nothing");
});

test("exact-name matches rank above partial matches", () => {
  const amethyst = ALL_REFERENCE.find((e) => e.id === "amethyst")!;
  const rose = ALL_REFERENCE.find((e) => e.id === "rose-quartz")!;
  assert.ok(scoreEntry(amethyst, "amethyst") > scoreEntry(rose, "amethyst"), "exact match should score higher");
});
