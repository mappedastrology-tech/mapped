import { test } from "node:test";
import assert from "node:assert/strict";

import { evaluateFatedMark, CATEGORY_KEYWORDS } from "@/lib/astro/fatedMarks";
import { getAspectCopy, getStrengthArea, getGrowthArea } from "@/lib/astro/growthAreas";
import { toPlatonic } from "@/lib/astro/platonicText";

const ROMANTIC =
  /\b(romantic|romance|sexual|sensual|erotic|seductive|seduction|chemistry|attraction|attracted|desire|intimate|intimacy|passionate|lovers?|flirt\w*|magnetic|in love|make love|courtship)\b/i;

const BODIES = [
  "Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn",
  "Uranus", "Neptune", "Pluto", "Chiron", "Lilith",
  "North Node", "South Node", "Vertex",
];
const ASPECTS = ["conjunction", "opposition", "trine", "square", "sextile"];

test("fated marks: family & friend copy contains no romantic/sexual language", () => {
  for (const ctx of ["family", "friend"] as const) {
    for (const a of BODIES) {
      for (const b of BODIES) {
        for (const asp of ASPECTS) {
          const mark = evaluateFatedMark(a, b, asp, 2, ctx);
          if (!mark) continue;
          const text = toPlatonic(mark.reason);
          assert.ok(
            !ROMANTIC.test(text),
            `romantic word in ${ctx} ${a}/${b}/${asp}: "${text.match(ROMANTIC)?.[0]}" :: ${text}`,
          );
        }
      }
    }
  }
});

test("aspect copy (platonic) contains no romantic/sexual language", () => {
  for (const a of BODIES) {
    for (const b of BODIES) {
      for (const asp of ASPECTS) {
        const text = toPlatonic(getAspectCopy(a, b, asp, true));
        assert.ok(!ROMANTIC.test(text), `romantic word in aspect ${a}/${b}/${asp}: ${text}`);
      }
    }
  }
});

test("fated marks: different planets to Saturn produce DISTINCT copy (no shared template)", () => {
  const neptune = evaluateFatedMark("Neptune", "Saturn", "conjunction", 0.5, "partner")!.reason;
  const uranus = evaluateFatedMark("Uranus", "Saturn", "conjunction", 0.5, "partner")!.reason;
  assert.notEqual(neptune, uranus);
  // and no shared trailing sentence
  const tail = (s: string) => s.split("—").slice(1).join("—").trim();
  assert.notEqual(tail(neptune), tail(uranus));
});

test("fated marks: metadata is well-formed (category, weight, keywords)", () => {
  const m = evaluateFatedMark("Venus", "North Node", "conjunction", 1, "partner")!;
  assert.equal(m.fated, true);
  assert.equal(m.category, "destiny");
  assert.ok(m.weight > 0 && m.weight <= 100);
  assert.ok(Array.isArray(m.keywords) && m.keywords.length > 0);
});

test("fated marks: shadow/soulmate keywords are not sexualized", () => {
  const flat = [...CATEGORY_KEYWORDS.shadow, ...CATEGORY_KEYWORDS.soulmate].join(" ");
  assert.ok(!/attraction|taboo|magnetic/i.test(flat), `keywords sexualized: ${flat}`);
});

test("growthAreas: same pair differs by aspect class; platonic overrides apply", () => {
  // Venus–Mars: romantic by default, platonic override removes chemistry/attraction.
  const rom = getStrengthArea("Venus", "Mars", "trine", false);
  const plat = getStrengthArea("Venus", "Mars", "trine", true);
  assert.notEqual(rom, plat);
  assert.ok(!ROMANTIC.test(plat), `platonic Venus-Mars still romantic: ${plat}`);
  // harmonious vs hard for the same pair are different
  assert.notEqual(getAspectCopy("Mercury", "Mars", "trine"), getAspectCopy("Mercury", "Mars", "square"));
});

test("growthAreas: a sweep of pairs yields distinct copy (no collapse to one template)", () => {
  const seen = new Set<string>();
  let n = 0;
  for (const a of ["Sun", "Moon", "Venus", "Mars", "Mercury"]) {
    for (const b of ["Saturn", "Pluto", "Uranus", "Neptune", "Jupiter"]) {
      seen.add(getGrowthArea(a, b, "square"));
      n++;
    }
  }
  // expect the vast majority to be unique
  assert.ok(seen.size >= n - 1, `growth copy collapsed: ${seen.size}/${n} unique`);
});
