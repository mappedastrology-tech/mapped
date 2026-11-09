/**
 * Interpretation and notification copy may describe themes to notice. It may
 * not predict events, health, money, legal or relationship outcomes, or call a
 * connection fated as fact (context/safety.md, "The determinism line").
 *
 * Each pattern below was found in real copy and rewritten. This keeps them out.
 * A miss here is not a style nit: it is a sentence that would be handed to
 * someone who is already frightened.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";

import { evaluateFatedMark, CATEGORY_LABEL, CATEGORY_KEYWORDS } from "@/lib/astro/fatedMarks";
import { COPY } from "@/lib/notifications/copy";
import { CHARACTERS } from "@/lib/resonance/characters";
import { ANIMAL_GUIDES } from "@/lib/resonance/animals";
import { DEITIES } from "@/lib/resonance/deities";
import { getTransitIntensity } from "@/lib/transitIntensity";

const ROOT = path.resolve(__dirname, "..");

const FILES = [
  "src/lib/solar-return-interpretations.ts",
  "src/lib/astro/fatedMarks.ts",
  "src/lib/notifications/copy.ts",
  "src/lib/transitIntensity.ts",
  "src/lib/chartRuler.ts",
  "src/lib/rulers.ts",
  "src/lib/sabianSymbols.ts",
  "supabase/seed_life_markers.sql",
];

const BANNED: [RegExp, string][] = [
  [/weight gain/i, "body prediction"],
  [/\bsurgery\b/i, "medical"],
  [/\bdiagnos\w*\b[^.]{0,30}\bhealth\b/i, "medical"],
  [/\binvestments?\b/i, "financial"],
  [/\bwindfalls?\b/i, "financial"],
  [/\binheritance\b/i, "financial"],
  [/\braises\b,/i, "financial"],
  [/get-rich/i, "financial"],
  [/financial abundance/i, "financial"],
  [/money comes to you/i, "financial"],
  [/legal battles?|lawsuit/i, "legal"],
  [/great year for marriage/i, "relationship outcome"],
  [/marry well/i, "relationship outcome"],
  [/it'?s your design/i, "deterministic"],
  [/karmic contract/i, "fatalistic"],
  [/always going to happen/i, "fatalistic"],
  [/always on the map/i, "fatalistic"],
  [/written before you arrived/i, "fatalistic"],
  [/whether you(?:'re| are)? (?:want it|ready) or not/i, "fatalistic"],
  [/\binevitabl[ey]\b/i, "fatalistic"],
  [/\bdestined\b/i, "fatalistic"],
  [/direction of your destiny/i, "fatalistic"],
  [/arranged in advance/i, "fatalistic"],
  [/\bwill happen\b/i, "prediction"],
  [/something'?s ending/i, "prediction"],
  [/something ends/i, "prediction"],
  [/commitments get made or broken/i, "relationship outcome"],
  [/\bprophetic\b/i, "fortune-telling"],
  [/almost never wrong/i, "fortune-telling"],
  [/life-altering/i, "prediction"],
  [/hard to walk away from/i, "validates staying"],
  [/rarely lets go cleanly/i, "glamorises possession"],
  [/channeled by Marc Edmund Jones/i, "false attribution"],
];

/** Strip // and block comments so explanatory notes may quote the old text. */
function proseOf(file: string): string {
  const src = readFileSync(path.join(ROOT, file), "utf8");
  if (file.endsWith(".sql")) return src.replace(/^\s*--.*$/gm, "");
  return src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "").replace(/\{\/\*[\s\S]*?\*\/\}/g, "");
}

test("owned copy files contain none of the banned patterns", () => {
  const hits: string[] = [];
  for (const f of FILES) {
    const prose = proseOf(f);
    for (const [re, why] of BANNED) {
      const m = prose.match(re);
      if (m) hits.push(`${f}: "${m[0]}" (${why})`);
    }
  }
  assert.deepEqual(hits, []);
});

test("every generated fated-mark reason is free of the banned patterns", () => {
  const BODIES = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune",
    "Pluto", "Chiron", "Lilith", "North Node", "South Node", "Vertex"];
  const hits = new Set<string>();
  for (const ctx of ["partner", "friend", "family", "city"] as const)
    for (const a of BODIES) for (const b of BODIES)
      for (const asp of ["conjunction", "opposition", "trine", "square", "sextile"]) {
        const m = evaluateFatedMark(a, b, asp, 1, ctx);
        if (!m) continue;
        for (const [re, why] of BANNED) if (re.test(m.reason)) hits.add(`${ctx} ${a}/${b}/${asp} (${why}): ${m.reason}`);
      }
  assert.deepEqual([...hits], []);
});

test("synastry contact labels and keywords carry no fate language", () => {
  const FATE = /\b(?:fated?|fateful|destin(?:y|ed)|karm\w*|soul-?deep|soul ?mates?|binding|meant to be)\b/i;
  const words = [...Object.values(CATEGORY_LABEL), ...Object.values(CATEGORY_KEYWORDS).flat()];
  for (const w of words) assert.doesNotMatch(w, FATE, `fate language in label/keyword: ${w}`);
  // The rendered feature: heading, counts, InfoTip and summary note on the Maps page.
  const maps = proseOf("src/app/(tabs)/maps/page.tsx");
  for (const s of ["Fated contacts", "Fated Contacts", " fated</span>", '" · Fated"', 'label: "Fated"',
    "karmic thread", "fated quality", "Destiny, Karmic, Binding, Soul-deep",
    'label: "Destiny", cls', 'label: "Karmic", cls', 'label: "Binding", cls', 'label: "Soul-deep", cls'])
    assert.ok(!maps.includes(s), `old fate wording still on the Maps page: ${s}`);
});

test("identity-card taglines (character, animal guide, deity) don't cast the reader as violent or doomed", () => {
  // The tagline is the line on the Profile card that people read as being about them.
  const GRIM = /\b(?:murder\w*|kill\w*|slay\w*|slain|blood\w*|grave|doom\w*|ruin\w*|revenge|devastat\w*|monster|madness|mad|rots?|could end it|the dead)\b/i;
  const hits = [...CHARACTERS, ...ANIMAL_GUIDES, ...DEITIES]
    .filter((g) => GRIM.test(g.tagline))
    .map((g) => `${g.id}: ${g.tagline}`);
  assert.deepEqual(hits, []);
});

test("notification bodies predict nothing", () => {
  for (const t of COPY)
    for (const [re, why] of BANNED)
      assert.doesNotMatch(`${t.title} ${t.body}`, re, `${t.category}/${t.variant} (${why})`);
  assert.doesNotMatch(COPY.map((t) => t.body).join(" "), /You should feel it within the week/);
});

test("the top transit-intensity label describes intensity, not consequence", () => {
  const top = getTransitIntensity({ transitPlanet: "Pluto", natalPlanet: "Sun", aspect: "conjunction", orb: 0 });
  assert.ok(top.score >= 75);
  assert.equal(top.label, "Peak intensity");
});

test("life-marker migration carries the same text as the seed", () => {
  const seed = readFileSync(path.join(ROOT, "supabase/seed_life_markers.sql"), "utf8");
  const mig = readFileSync(path.join(ROOT, "supabase/migrations/20261028_soften_life_markers.sql"), "utf8");
  const summaries = [...mig.matchAll(/set summary = '((?:[^']|'')*)'/g)].map((m) => m[1]);
  assert.ok(summaries.length >= 20);
  for (const s of summaries) assert.ok(seed.includes(`'${s}'`), `migration text not in seed: ${s.slice(0, 60)}`);
});
