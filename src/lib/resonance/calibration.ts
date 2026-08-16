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

/** trait id → cohort σ of raw sums. Divided out before the squash to equalise per-trait width. Missing ⇒ fallback. */
export const TRAIT_SPREAD: Record<string, number> = {
  "initiative": 21.3037,
  "endurance": 24.5095,
  "intensity": 13.5161,
  "stillness": 15.7316,
  "analysis": 17.0282,
  "intuition": 15.8239,
  "vision": 16.3095,
  "memory": 8.9744,
  "loyalty": 12.9396,
  "autonomy": 17.9366,
  "magnetism": 16.2087,
  "care": 20.4309,
  "expression": 16.6468,
  "craft": 13.1110,
  "display": 19.7257,
  "concealment": 14.2808,
  "order": 23.5854,
  "disruption": 18.0593,
  "adaptability": 18.9394,
  "sovereignty": 16.5578,
  "shadow": 13.5081,
  "transcendence": 17.5206,
  "embodiment": 15.2206,
  "transformation": 11.6622,
};

/**
 * trait id → mean raw sum across the cohort. Subtracted before the logistic
 * squash to re-centre the population at 50 (the deltas lean net-positive, so
 * without this everyone piles up high on many traits). Missing trait ⇒ 0.
 */
export const TRAIT_BASELINE: Record<string, number> = {
  "initiative": 42.5476,
  "endurance": 38.3291,
  "intensity": 21.9408,
  "stillness": 8.5632,
  "analysis": 35.3939,
  "intuition": 27.0461,
  "vision": 35.7999,
  "memory": 10.2438,
  "loyalty": 24.3839,
  "autonomy": 25.6685,
  "magnetism": 39.5983,
  "care": 43.9663,
  "expression": 32.4900,
  "craft": 25.4144,
  "display": 13.8221,
  "concealment": 23.3661,
  "order": 36.9800,
  "disruption": 2.4669,
  "adaptability": 38.3198,
  "sovereignty": 34.5528,
  "shadow": 17.5603,
  "transcendence": 32.8477,
  "embodiment": 20.4371,
  "transformation": 13.0650,
};

/** archetype id → additive score offset. Missing id ⇒ 0. */
export const ARCH_OFFSET: Record<string, number> = {
  "arch.bell.breaker": 0.034316,
  "arch.bell.builder": 0.034192,
  "arch.bell.kindler": 0.044374,
  "arch.bell.mender": 0.025277,
  "arch.bell.seer": 0.018601,
  "arch.bell.sovereign": 0.062137,
  "arch.bell.trickster": 0.080158,
  "arch.bell.warden": 0.021250,
  "arch.crown.breaker": 0.054859,
  "arch.crown.builder": 0.025833,
  "arch.crown.kindler": 0.017986,
  "arch.crown.mender": -0.094231,
  "arch.crown.seer": -0.001481,
  "arch.crown.sovereign": -0.007370,
  "arch.crown.trickster": -0.029690,
  "arch.crown.warden": -0.041584,
  "arch.flame.breaker": 0.036422,
  "arch.flame.builder": -0.004577,
  "arch.flame.kindler": 0.047724,
  "arch.flame.mender": -0.085363,
  "arch.flame.seer": -0.061417,
  "arch.flame.sovereign": 0.007372,
  "arch.flame.trickster": 0.037031,
  "arch.flame.warden": -0.043323,
  "arch.forge.breaker": -0.062252,
  "arch.forge.builder": 0.049650,
  "arch.forge.kindler": -0.016448,
  "arch.forge.mender": 0.020941,
  "arch.forge.seer": -0.006465,
  "arch.forge.sovereign": 0.013195,
  "arch.forge.trickster": -0.048381,
  "arch.forge.warden": 0.056000,
  "arch.path.breaker": 0.006933,
  "arch.path.builder": -0.055545,
  "arch.path.kindler": -0.008503,
  "arch.path.mender": -0.108076,
  "arch.path.seer": -0.050502,
  "arch.path.sovereign": -0.027010,
  "arch.path.trickster": 0.019396,
  "arch.path.warden": -0.087100,
  "arch.root.breaker": 0.037423,
  "arch.root.builder": 0.072995,
  "arch.root.kindler": 0.122936,
  "arch.root.mender": 0.039969,
  "arch.root.seer": 0.037363,
  "arch.root.sovereign": 0.045878,
  "arch.root.trickster": 0.068779,
  "arch.root.warden": 0.069755,
  "arch.star.breaker": 0.046615,
  "arch.star.builder": -0.019732,
  "arch.star.kindler": 0.009997,
  "arch.star.mender": 0.015453,
  "arch.star.seer": 0.045712,
  "arch.star.sovereign": -0.011132,
  "arch.star.trickster": 0.029486,
  "arch.star.warden": -0.051554,
  "arch.stone.breaker": 0.043799,
  "arch.stone.builder": 0.061400,
  "arch.stone.kindler": 0.014811,
  "arch.stone.mender": 0.033214,
  "arch.stone.seer": -0.015787,
  "arch.stone.sovereign": 0.024133,
  "arch.stone.trickster": 0.047610,
  "arch.stone.warden": 0.025535,
  "arch.thread.breaker": -0.017682,
  "arch.thread.builder": 0.050937,
  "arch.thread.kindler": 0.016163,
  "arch.thread.mender": 0.045001,
  "arch.thread.seer": 0.023382,
  "arch.thread.sovereign": 0.025820,
  "arch.thread.trickster": 0.028447,
  "arch.thread.warden": 0.083723,
  "arch.tide.breaker": -0.013581,
  "arch.tide.builder": -0.055493,
  "arch.tide.kindler": -0.031071,
  "arch.tide.mender": -0.040428,
  "arch.tide.seer": 0.005234,
  "arch.tide.sovereign": -0.070187,
  "arch.tide.trickster": -0.007191,
  "arch.tide.warden": 0.086869,
  "arch.wheel.breaker": -0.105062,
  "arch.wheel.builder": -0.089045,
  "arch.wheel.kindler": -0.115903,
  "arch.wheel.mender": -0.103765,
  "arch.wheel.seer": -0.040434,
  "arch.wheel.sovereign": -0.113644,
  "arch.wheel.trickster": -0.095794,
  "arch.wheel.warden": -0.070387,
  "arch.wind.breaker": 0.008097,
  "arch.wind.builder": -0.031101,
  "arch.wind.kindler": -0.013394,
  "arch.wind.mender": -0.041137,
  "arch.wind.seer": 0.000717,
  "arch.wind.sovereign": -0.000666,
  "arch.wind.trickster": 0.026714,
  "arch.wind.warden": -0.014125,
};

export function archOffset(id: string): number {
  return ARCH_OFFSET[id] ?? 0;
}
