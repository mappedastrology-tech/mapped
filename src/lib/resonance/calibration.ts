/**
 * GENERATED — do not edit by hand. Produced by `npm run resonance:calibrate`.
 *
 * Per-archetype price offset (spec §4.6, balanced assignment). Raw cosine
 * similarity over-concentrates on the few archetypes nearest the population
 * centroid and leaves the "moderate-everything" archetypes unreachable. The
 * calibrator runs a synthetic cohort and solves for an additive offset per
 * archetype such that assigning by `similarity − offset` spreads the primary
 * win-share evenly (every archetype reachable, none a black hole). The offsets
 * are baked constants, so the runtime stays a deterministic pure function — no
 * cohort, no global state, same input → same output.
 *
 * A positive offset means "this archetype was over-attracting, penalise it"; a
 * negative offset lifts a previously-starved archetype. Offsets are tiny
 * (cosine-scale), so they only decide genuinely borderline matches — a strong
 * match is unaffected.
 */

export const CALIBRATION_VERSION = "cohort-N40000-iter600";

/**
 * trait id → mean raw sum across the cohort. Subtracted before the logistic
 * squash to re-centre the population at 50 (the deltas lean net-positive, so
 * without this everyone piles up high on many traits). Missing trait ⇒ 0.
 */
export const TRAIT_BASELINE: Record<string, number> = {
  "initiative": 42.5413,
  "endurance": 38.0460,
  "intensity": 21.8986,
  "stillness": 8.6130,
  "analysis": 35.4759,
  "intuition": 27.0927,
  "vision": 35.8072,
  "memory": 10.2631,
  "loyalty": 24.4560,
  "autonomy": 25.6612,
  "magnetism": 39.5213,
  "care": 44.0372,
  "expression": 32.7200,
  "craft": 25.2821,
  "display": 13.7908,
  "concealment": 23.4012,
  "order": 36.6638,
  "disruption": 2.4956,
  "adaptability": 38.6241,
  "sovereignty": 34.4063,
  "shadow": 17.5512,
  "transcendence": 32.9309,
  "embodiment": 20.3902,
  "transformation": 13.0407,
};

/** archetype id → additive score offset. Missing id ⇒ 0. */
export const ARCH_OFFSET: Record<string, number> = {
  "arch.bell.breaker": 0.051194,
  "arch.bell.builder": 0.038640,
  "arch.bell.kindler": 0.037946,
  "arch.bell.mender": 0.024517,
  "arch.bell.seer": 0.003036,
  "arch.bell.sovereign": 0.053039,
  "arch.bell.trickster": 0.088667,
  "arch.bell.warden": -0.003388,
  "arch.crown.breaker": 0.051832,
  "arch.crown.builder": 0.054020,
  "arch.crown.kindler": 0.032668,
  "arch.crown.mender": -0.101761,
  "arch.crown.seer": -0.007486,
  "arch.crown.sovereign": -0.016565,
  "arch.crown.trickster": -0.041841,
  "arch.crown.warden": -0.031639,
  "arch.flame.breaker": 0.055350,
  "arch.flame.builder": 0.004694,
  "arch.flame.kindler": 0.038710,
  "arch.flame.mender": -0.067165,
  "arch.flame.seer": -0.081464,
  "arch.flame.sovereign": 0.014267,
  "arch.flame.trickster": 0.047741,
  "arch.flame.warden": -0.050856,
  "arch.forge.breaker": -0.089867,
  "arch.forge.builder": 0.043708,
  "arch.forge.kindler": -0.045300,
  "arch.forge.mender": 0.004309,
  "arch.forge.seer": -0.023087,
  "arch.forge.sovereign": -0.013539,
  "arch.forge.trickster": -0.064947,
  "arch.forge.warden": 0.043894,
  "arch.path.breaker": 0.037535,
  "arch.path.builder": -0.029621,
  "arch.path.kindler": 0.006335,
  "arch.path.mender": -0.094793,
  "arch.path.seer": -0.056977,
  "arch.path.sovereign": -0.031701,
  "arch.path.trickster": 0.044036,
  "arch.path.warden": -0.122717,
  "arch.root.breaker": 0.031272,
  "arch.root.builder": 0.059216,
  "arch.root.kindler": 0.088708,
  "arch.root.mender": 0.015853,
  "arch.root.seer": 0.024663,
  "arch.root.sovereign": 0.003805,
  "arch.root.trickster": 0.066001,
  "arch.root.warden": 0.043800,
  "arch.star.breaker": 0.058388,
  "arch.star.builder": -0.028068,
  "arch.star.kindler": -0.000646,
  "arch.star.mender": 0.025953,
  "arch.star.seer": 0.036659,
  "arch.star.sovereign": -0.028596,
  "arch.star.trickster": 0.040725,
  "arch.star.warden": -0.061975,
  "arch.stone.breaker": 0.075573,
  "arch.stone.builder": 0.102187,
  "arch.stone.kindler": 0.049642,
  "arch.stone.mender": 0.046403,
  "arch.stone.seer": 0.004907,
  "arch.stone.sovereign": 0.058551,
  "arch.stone.trickster": 0.063828,
  "arch.stone.warden": 0.054672,
  "arch.thread.breaker": -0.007751,
  "arch.thread.builder": 0.065405,
  "arch.thread.kindler": 0.009981,
  "arch.thread.mender": 0.077195,
  "arch.thread.seer": 0.022948,
  "arch.thread.sovereign": 0.023768,
  "arch.thread.trickster": 0.050634,
  "arch.thread.warden": 0.063120,
  "arch.tide.breaker": 0.023106,
  "arch.tide.builder": -0.035805,
  "arch.tide.kindler": -0.014981,
  "arch.tide.mender": 0.003897,
  "arch.tide.seer": 0.012435,
  "arch.tide.sovereign": -0.082154,
  "arch.tide.trickster": 0.024009,
  "arch.tide.warden": 0.058655,
  "arch.wheel.breaker": -0.099572,
  "arch.wheel.builder": -0.064358,
  "arch.wheel.kindler": -0.151587,
  "arch.wheel.mender": -0.122221,
  "arch.wheel.seer": -0.058611,
  "arch.wheel.sovereign": -0.130930,
  "arch.wheel.trickster": -0.102531,
  "arch.wheel.warden": -0.142829,
  "arch.wind.breaker": 0.017555,
  "arch.wind.builder": -0.029851,
  "arch.wind.kindler": -0.020529,
  "arch.wind.mender": -0.022999,
  "arch.wind.seer": -0.004825,
  "arch.wind.sovereign": -0.016686,
  "arch.wind.trickster": 0.043260,
  "arch.wind.warden": -0.020696,
};

export function archOffset(id: string): number {
  return ARCH_OFFSET[id] ?? 0;
}
