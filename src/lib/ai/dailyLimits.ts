/**
 * How many AI requests a paid account may make per day, per feature.
 *
 * SAFE FOR THE BROWSER — deliberately. These are product limits, not the
 * private monthly spend ceilings in lib/ai/budget.ts, and the difference
 * matters: a ceiling measured in dollars is ours to manage quietly, but a cap
 * on how many times someone may use the thing they paid for is theirs to know
 * before they pay.
 *
 * They live here because they were previously written twice and disagreed.
 * The server enforced 30 Dolly messages a day; USAGE_LIMITS in tier.ts said
 * `Infinity`, and the plan copy said "Unlimited Dolly — ask Dolly as much as
 * you like". So the app sold something it did not deliver, and the person who
 * hit the cap had been told it did not exist. One constant, read by the route
 * that enforces it and the copy that describes it, is what stops that
 * happening again; a test asserts the copy still names these numbers.
 */

export const DAILY_AI_LIMITS = {
  /** Messages to Dolly. */
  dolly: 30,
  /** Rituals from the wizard. */
  wizard: 15,
} as const;
