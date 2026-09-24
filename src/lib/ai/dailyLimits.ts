/**
 * How much AI each tier gets per day, and how the tiers compare.
 *
 * SAFE FOR THE BROWSER — deliberately. These are product limits, not the
 * private monthly spend ceilings in lib/ai/budget.ts, and the difference
 * matters: a ceiling measured in dollars is ours to manage quietly, but the
 * RATIO between tiers is the thing Mapped Complete is sold on, so it has to
 * be something the app can state.
 *
 * They live here because they were previously written twice and disagreed.
 * The server enforced 30 Dolly messages a day; USAGE_LIMITS in tier.ts said
 * `Infinity`, and the plan copy said "Unlimited Dolly — ask as much as you
 * like". So the app sold something it did not deliver, and the person who hit
 * the cap had been told it did not exist.
 */

/** Tiers, repeated rather than imported: lib/tier imports this file. */
type Tier = "free" | "mid" | "max";

/**
 * What Mapped+ gets in a day. Mapped Complete gets this times its multiplier.
 */
export const DAILY_AI_LIMITS = {
  /** Messages to Dolly. */
  dolly: 30,
  /** Rituals from the wizard. */
  wizard: 15,
} as const;

/**
 * How much more AI each tier gets, relative to Mapped+.
 *
 * This is the whole proposition of the top tier — the oracle decks are a
 * throw-in — so it is one number, read by everything that depends on it:
 * the daily caps here, the monthly ceilings in budget.ts, and the plan copy
 * that promises it. Written separately in each of those places it would drift,
 * and the drift would be the app quietly not delivering what it sold. A test
 * pins the copy to this value.
 *
 * Free is zero because AI is the paid boundary.
 */
export const AI_TIER_MULTIPLIER: Record<Tier, number> = {
  free: 0,
  mid: 1,
  max: 3,
};

/** The multiplier as the copy says it — "three times the time with Dolly". */
export const AI_MULTIPLIER_WORD: Record<number, string> = {
  2: "Twice",
  3: "Three times",
  4: "Four times",
  5: "Five times",
};

/**
 * A tier's daily allowance for a feature.
 *
 * Was a flat 30 for everyone, which made Mapped Complete's headline promise
 * false in the only place a reader would notice it: a Complete subscriber
 * could send exactly as many messages in a day as a Mapped+ one, and only
 * pulled ahead by sustaining heavy use for weeks. They paid double and felt
 * nothing.
 */
export function dailyLimit(feature: keyof typeof DAILY_AI_LIMITS, tier: Tier): number {
  return DAILY_AI_LIMITS[feature] * AI_TIER_MULTIPLIER[tier];
}
