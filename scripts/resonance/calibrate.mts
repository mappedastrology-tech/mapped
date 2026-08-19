/**
 * Resonance calibrator (spec §4.6 — balanced assignment).
 *
 * Raw cosine similarity over-concentrates on the entries nearest the population
 * centroid and starves the rest. This solves for an additive price offset per
 * entry so that assigning by `similarity − offset` spreads the primary win-share
 * evenly. It's a price-adjustment / auction loop: over-attracting entries get
 * their price raised, starved ones lowered, until every share sits inside the
 * target band. Runs for BOTH libraries — the 96 archetypes and the 72 animal
 * guides — plus the per-trait baseline/spread that centres the trait space.
 * Everything is baked into src/lib/resonance/calibration.ts as constants, so the
 * runtime stays a pure deterministic function with no cohort at request time.
 *
 * Run:  npx tsx scripts/resonance/calibrate.mts [N] [iters]
 */

import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { scoresWithBaseline, rawTraitSums, traitsWithBaseline, rankLibrary } from "../../src/lib/resonance/engine.ts";
import { ARCHETYPES } from "../../src/lib/resonance/archetypes.ts";
import { ANIMAL_GUIDES } from "../../src/lib/resonance/animals.ts";
import { DEITIES } from "../../src/lib/resonance/deities.ts";
import { CHARACTERS } from "../../src/lib/resonance/characters.ts";
import { TRAIT_ORDER } from "../../src/lib/resonance/traits.ts";
import { sampleInput } from "./cohort.mts";

const N = Number(process.argv[2] ?? 40000);
const ITERS = Number(process.argv[3] ?? 600);

// One fixed cohort, reused across all passes so baseline and offsets agree.
console.log(`Sampling ${N} charts…`);
const inputs = Array.from({ length: N }, () => sampleInput());

// --- Pass 1: per-trait mean (baseline) and σ (spread) of raw sums. ---
const baseline = Object.fromEntries(TRAIT_ORDER.map((t) => [t, 0])) as Record<string, number>;
const sq = Object.fromEntries(TRAIT_ORDER.map((t) => [t, 0])) as Record<string, number>;
for (const inp of inputs) {
  const rs = rawTraitSums(inp);
  for (const t of TRAIT_ORDER) { baseline[t] += rs[t]; sq[t] += rs[t] * rs[t]; }
}
const spread = Object.fromEntries(TRAIT_ORDER.map((t) => [t, 1])) as Record<string, number>;
for (const t of TRAIT_ORDER) {
  baseline[t] /= N;
  spread[t] = Math.max(Math.sqrt(Math.max(0, sq[t] / N - baseline[t] * baseline[t])), 4); // floor so a near-constant trait can't explode
}

/**
 * Balanced-assignment price solver. `sims` is a flat N×K similarity matrix;
 * returns a re-centred offset per column so win-shares land in the target band.
 */
function solveOffsets(sims: Float64Array, K: number, label: string): number[] {
  const TARGET = 1 / K;
  const offset = new Float64Array(K);
  const counts = new Int32Array(K);
  const EPS = 0.0004;
  let lr = 0.012;
  let lastMax = 1, lastMin = 0;

  for (let it = 0; it < ITERS; it++) {
    counts.fill(0);
    for (let u = 0; u < N; u++) {
      const base = u * K;
      let best = 0, bestVal = sims[base] - offset[0];
      for (let c = 1; c < K; c++) {
        const v = sims[base + c] - offset[c];
        if (v > bestVal) { bestVal = v; best = c; }
      }
      counts[best]++;
    }
    let maxShare = 0, minShare = 1;
    for (let c = 0; c < K; c++) {
      const share = counts[c] / N;
      if (share > maxShare) maxShare = share;
      if (share < minShare) minShare = share;
      offset[c] += lr * Math.log((share + EPS) / TARGET);
    }
    lastMax = maxShare; lastMin = minShare;
    if (it % 100 === 0 || it === ITERS - 1) {
      console.log(`  [${label}] iter ${String(it).padStart(3)}  max ${(maxShare * 100).toFixed(2)}%  min ${(minShare * 100).toFixed(2)}%`);
    }
    if (maxShare <= 0.020 && minShare >= 0.006) { lr *= 0.6; if (lr < 0.001) break; }
  }
  // Re-centre (a constant shift doesn't change argmax) for tidy numbers.
  let mean = 0;
  for (let c = 0; c < K; c++) mean += offset[c];
  mean /= K;
  const out = Array.from(offset, (o) => o - mean);
  console.log(`  [${label}] converged: max ${(lastMax * 100).toFixed(2)}%  min ${(lastMin * 100).toFixed(2)}%`);
  return out;
}

// --- Pass 2a: archetype similarity matrix + offsets. ---
const archIds = ARCHETYPES.map((a) => a.id);
const AK = archIds.length;
const archCol = new Map(archIds.map((id, i) => [id, i]));
console.log(`Scoring ${N} × ${AK} archetypes…`);
const archSims = new Float64Array(N * AK);
inputs.forEach((inp, u) => {
  const base = u * AK;
  for (const { id, s } of scoresWithBaseline(inp, baseline, spread)) archSims[base + (archCol.get(id) as number)] = s;
});
const archOffsets = solveOffsets(archSims, AK, "archetype");

// --- Passes 2b+: secondary libraries (animals, deities, characters). Same math,
// but the match runs on the user's final trait vector (baseline+spread applied). ---
const userTraits = inputs.map((inp) => traitsWithBaseline(inp, baseline, spread));

function libraryOffsets(label: string, entries: { id: string; traits: typeof ARCHETYPES[number]["traits"] }[]): { ids: string[]; offs: number[] } {
  const ids = entries.map((e) => e.id);
  const K = ids.length;
  const colMap = new Map(ids.map((id, i) => [id, i]));
  console.log(`Scoring ${N} × ${K} ${label}…`);
  const sims = new Float64Array(N * K);
  userTraits.forEach((traits, u) => {
    if (!traits) return;
    const base = u * K;
    for (const { id, s } of rankLibrary(traits, entries)) sims[base + (colMap.get(id) as number)] = s;
  });
  return { ids, offs: solveOffsets(sims, K, label) };
}

const animal = libraryOffsets("animal guides", ANIMAL_GUIDES);
const deity = libraryOffsets("deities", DEITIES);
const character = libraryOffsets("characters", CHARACTERS);

// --- Emit calibration.ts ---
const fmtOffsets = (idList: string[], offs: number[]) =>
  idList
    .map((id, i) => [id, offs[i]] as [string, number])
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([id, o]) => `  ${JSON.stringify(id)}: ${o.toFixed(6)},`)
    .join("\n");

const archBody = fmtOffsets(archIds, archOffsets);
const animalBody = fmtOffsets(animal.ids, animal.offs);
const deityBody = fmtOffsets(deity.ids, deity.offs);
const characterBody = fmtOffsets(character.ids, character.offs);
const baselineBody = TRAIT_ORDER.map((t) => `  ${JSON.stringify(t)}: ${baseline[t].toFixed(4)},`).join("\n");
const spreadBody = TRAIT_ORDER.map((t) => `  ${JSON.stringify(t)}: ${spread[t].toFixed(4)},`).join("\n");
const version = `cohort-N${N}-iter${ITERS}`;

const out = `/**
 * GENERATED — do not edit by hand. Produced by \`npm run resonance:calibrate\`.
 *
 * Balanced-assignment calibration (spec §4.6). Raw cosine similarity over-
 * concentrates on the entries nearest the population centroid and leaves the
 * "moderate-everything" ones unreachable. The calibrator runs a synthetic cohort
 * and solves for an additive offset per entry such that assigning by
 * \`similarity − offset\` spreads the primary win-share evenly (every entry
 * reachable, none a black hole), for both the archetypes and the animal guides.
 * Plus a per-trait baseline+spread that centres and equalises the trait space.
 * All baked as constants, so the runtime stays a deterministic pure function —
 * no cohort, no global state, same input → same output.
 *
 * A positive offset means "this entry was over-attracting, penalise it"; a
 * negative offset lifts a previously-starved one. Offsets are tiny (cosine-
 * scale), so they only decide genuinely borderline matches.
 */

export const CALIBRATION_VERSION = ${JSON.stringify(version)};

/** trait id → cohort σ of raw sums. Divided out before the squash to equalise per-trait width. Missing ⇒ fallback. */
export const TRAIT_SPREAD: Record<string, number> = {
${spreadBody}
};

/**
 * trait id → mean raw sum across the cohort. Subtracted before the logistic
 * squash to re-centre the population at 50 (the deltas lean net-positive, so
 * without this everyone piles up high on many traits). Missing trait ⇒ 0.
 */
export const TRAIT_BASELINE: Record<string, number> = {
${baselineBody}
};

/** archetype id → additive score offset. Missing id ⇒ 0. */
export const ARCH_OFFSET: Record<string, number> = {
${archBody}
};

export function archOffset(id: string): number {
  return ARCH_OFFSET[id] ?? 0;
}

/** animal id → additive score offset (same balancing as archetypes). Missing id ⇒ 0. */
export const ANIMAL_OFFSET: Record<string, number> = {
${animalBody}
};

export function animalOffset(id: string): number {
  return ANIMAL_OFFSET[id] ?? 0;
}

/** deity id → additive score offset (same balancing as archetypes). Missing id ⇒ 0. */
export const DEITY_OFFSET: Record<string, number> = {
${deityBody}
};

export function deityOffset(id: string): number {
  return DEITY_OFFSET[id] ?? 0;
}

/** character id → additive score offset (same balancing as archetypes). Missing id ⇒ 0. */
export const CHARACTER_OFFSET: Record<string, number> = {
${characterBody}
};

export function characterOffset(id: string): number {
  return CHARACTER_OFFSET[id] ?? 0;
}
`;

const here = dirname(fileURLToPath(import.meta.url));
writeFileSync(join(here, "../../src/lib/resonance/calibration.ts"), out);

console.log(`\nWrote ${AK} archetype + ${animal.ids.length} animal + ${deity.ids.length} deity + ${character.ids.length} character offsets → calibration.ts (${version})`);
