import { test } from "node:test";
import assert from "node:assert/strict";

import { computeArchetype, getArchetype } from "@/lib/archetype/engine";
import { ARCHETYPES } from "@/lib/archetype/data";
import { ELEMENTS, STANCES } from "@/lib/archetype/types";

test("all 20 element × stance archetypes exist and are self-consistent", () => {
  let count = 0;
  for (const el of ELEMENTS) {
    for (const st of STANCES) {
      const id = `${el}-${st}`;
      const a = ARCHETYPES[id];
      assert.ok(a, `archetype ${id} exists`);
      assert.equal(a.element, el);
      assert.equal(a.stance, st);
      assert.ok(a.name && a.description, `${id} has name + description`);
      assert.ok(a.traits.length >= 5 && a.traits.length <= 6, `${id} has 5–6 traits`);
      count++;
    }
  }
  assert.equal(count, 20);
});

test("Human Design type drives the stance", () => {
  const base = { sunSign: "Leo", moonSign: "Aries", risingSign: "Sagittarius", lifePath: 5 };
  assert.equal(computeArchetype({ ...base, hdType: "Manifestor" }).stance, "initiator");
  assert.equal(computeArchetype({ ...base, hdType: "Generator" }).stance, "cultivator");
  assert.equal(computeArchetype({ ...base, hdType: "Manifesting Generator" }).stance, "catalyst");
  assert.equal(computeArchetype({ ...base, hdType: "Projector" }).stance, "guide");
  assert.equal(computeArchetype({ ...base, hdType: "Reflector" }).stance, "mirror");
});

test("dominant element blends the big three + numerology", () => {
  const r = computeArchetype({
    sunSign: "Pisces",
    moonSign: "Cancer",
    risingSign: "Scorpio",
    lifePath: 7,
    hdType: "Projector",
  });
  assert.equal(r.element, "water");
  assert.equal(r.id, "water-guide");
  assert.ok(r.archetype);
});

test("stance falls back to numerology, then astrology, when HD is absent", () => {
  const num = computeArchetype({ sunSign: "Gemini", lifePath: 1 });
  assert.equal(num.stance, "initiator");
  assert.equal(num.stanceSource, "numerology");

  const astro = computeArchetype({ sunSign: "Cancer", moonSign: "Aries", risingSign: "Libra" });
  assert.equal(astro.stanceSource, "astrology");
  assert.equal(astro.stance, "initiator"); // all three cardinal
});

test("always resolves to a valid archetype, even with minimal input", () => {
  const r = computeArchetype({ sunSign: "Taurus" });
  assert.ok(getArchetype(r.id));
  assert.equal(r.element, "earth");
});
