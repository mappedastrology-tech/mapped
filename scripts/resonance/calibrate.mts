/**
 * Resonance calibrator (spec §4.6 — balanced assignment).
 *
 * Raw cosine similarity over-concentrates on the archetypes nearest the
 * population centroid and starves the rest. This solves for an additive price
 * offset per archetype so that assigning by `similarity − offset` spreads the
 * primary win-share evenly across all 96. It's a price-adjustment / auction
 * loop: over-attracting archetypes get their price raised, starved ones lowered,
 * until every share sits inside the target band. The offsets are then baked into
 * src/lib/resonance/calibration.ts as constants — the runtime stays a pure,
 * deterministic function with no cohort at request time.
 *
 * Run:  npx tsx scripts/resonance/calibrate.mts [N] [iters]
 */

import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { scoresWithBaseline, rawTraitSums } from "../../src/lib/resonance/engine.ts";
import { ARCHETYPES } from "../../src/lib/resonance/archetypes.ts";
import { TRAIT_ORDER } from "../../src/lib/resonance/traits.ts";
import { sampleInput } from "./cohort.mts";

const N = Number(process.argv[2] ?? 40000);
const ITERS = Number(process.argv[3] ?? 600);

const ids = ARCHETYPES.map((a) => a.id);
const K = ids.length;
const col = new Map(ids.map((id, i) => [id, i]));
const TARGET = 1 / K;

// One fixed cohort, reused for both passes so the baseline and offsets agree.
console.log(`Sampling ${N} charts…`);
const inputs = Array.from({ length: N }, () => sampleInput());

// --- Pass 1: trait baseline = mean raw sum per trait (re-centres population). ---
const baseline = Object.fromEntries(TRAIT_ORDER.map((t) => [t, 0])) as Record<string, number>;
for (const inp of inputs) {
  const rs = rawTraitSums(inp);
  for (const t of TRAIT_ORDER) baseline[t] += rs[t];
}
for (const t of TRAIT_ORDER) baseline[t] /= N;

// --- Pass 2: similarity matrix under that baseline (N × K). ---
console.log(`Scoring ${N} × ${K} archetypes under baseline…`);
const sims = new Float64Array(N * K);
inputs.forEach((inp, u) => {
  const base = u * K;
  for (const { id, s } of scoresWithBaseline(inp, baseline)) sims[base + (col.get(id) as number)] = s;
});

// --- Iterative price adjustment. ---
const offset = new Float64Array(K);
const counts = new Int32Array(K);
const EPS = 0.0004;
let lr = 0.012;

function assignAndCount() {
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
}

let lastMax = 1, lastMin = 0;
for (let it = 0; it < ITERS; it++) {
  assignAndCount();
  let maxShare = 0, minShare = 1;
  for (let c = 0; c < K; c++) {
    const share = counts[c] / N;
    if (share > maxShare) maxShare = share;
    if (share < minShare) minShare = share;
    offset[c] += lr * Math.log((share + EPS) / TARGET);
  }
  lastMax = maxShare; lastMin = minShare;
  if (it % 50 === 0 || it === ITERS - 1) {
    console.log(`iter ${String(it).padStart(3)}  max ${(maxShare * 100).toFixed(2)}%  min ${(minShare * 100).toFixed(2)}%  lr ${lr.toFixed(4)}`);
  }
  // Tight internal band (inside the 0.4–2.5% gate) so an independent validation
  // draw still lands in-gate. Decay the step once we're close to settle it.
  if (maxShare <= 0.020 && minShare >= 0.006) { lr *= 0.6; if (lr < 0.001) break; }
}

// Re-centre offsets (a constant shift doesn't change argmax) for tidy numbers.
let mean = 0;
for (let c = 0; c < K; c++) mean += offset[c];
mean /= K;
for (let c = 0; c < K; c++) offset[c] -= mean;

// --- Emit calibration.ts ---
const entries = ids
  .map((id, i) => [id, offset[i]] as [string, number])
  .sort((a, b) => a[0].localeCompare(b[0]));

const body = entries.map(([id, o]) => `  ${JSON.stringify(id)}: ${o.toFixed(6)},`).join("\n");
const baselineBody = TRAIT_ORDER
  .map((t) => `  ${JSON.stringify(t)}: ${baseline[t].toFixed(4)},`)
  .join("\n");
const version = `cohort-N${N}-iter${ITERS}`;

const out = `/**
 * GENERATED — do not edit by hand. Produced by \`npm run resonance:calibrate\`.
 *
 * Per-archetype price offset (spec §4.6, balanced assignment). Raw cosine
 * similarity over-concentrates on the few archetypes nearest the population
 * centroid and leaves the "moderate-everything" archetypes unreachable. The
 * calibrator runs a synthetic cohort and solves for an additive offset per
 * archetype such that assigning by \`similarity − offset\` spreads the primary
 * win-share evenly (every archetype reachable, none a black hole). The offsets
 * are baked constants, so the runtime stays a deterministic pure function — no
 * cohort, no global state, same input → same output.
 *
 * A positive offset means "this archetype was over-attracting, penalise it"; a
 * negative offset lifts a previously-starved archetype. Offsets are tiny
 * (cosine-scale), so they only decide genuinely borderline matches — a strong
 * match is unaffected.
 */

export const CALIBRATION_VERSION = ${JSON.stringify(version)};

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
${body}
};

export function archOffset(id: string): number {
  return ARCH_OFFSET[id] ?? 0;
}
`;

const here = dirname(fileURLToPath(import.meta.url));
const target = join(here, "../../src/lib/resonance/calibration.ts");
writeFileSync(target, out);

console.log(`\nConverged: max ${(lastMax * 100).toFixed(2)}%  min ${(lastMin * 100).toFixed(2)}%`);
console.log(`Wrote ${entries.length} offsets → src/lib/resonance/calibration.ts (version ${version})`);
