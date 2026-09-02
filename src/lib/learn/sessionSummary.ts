/**
 * What to celebrate when a lesson ends — PURE logic, no Supabase.
 *
 * Finishing a lesson used to end in a small "+15 XP" chip. Everything that
 * makes the habit stick — the streak advancing, the daily goal being met, a
 * level turning over — happened silently, on a screen the user had to navigate
 * away to see. This works out, from a snapshot taken before the lesson, which
 * of those things just happened, so the completion screen can say so.
 *
 * It is arithmetic on the before-stats rather than a second round-trip: the
 * award has only just been written, a re-read could race it, and this way the
 * summary is still right with no connection at all.
 */

import { levelFromXp, XP_LESSON, XP_PERFECT, type LearningStats } from "./stats";

export interface SessionSummary {
  xpEarned: number;
  perfect: boolean;
  perfectBonus: number;
  firstTry: { correct: number; total: number };

  streak: number;
  /** True when this lesson was the first activity of the day. */
  streakAdvanced: boolean;

  goalXp: number;
  goalProgressBefore: number;
  goalProgressAfter: number;
  goalJustMet: boolean;

  level: number;
  leveledUp: boolean;
}

export interface SessionInput {
  /** Stats as they were before this lesson was recorded. */
  before: LearningStats;
  goalXp: number;
  firstTry: { correct: number; total: number };
  /** False when the lesson had already been completed before — no XP is given
   *  a second time, so there is nothing new to celebrate. */
  isNewCompletion: boolean;
}

export function buildSessionSummary({ before, goalXp, firstTry, isNewCompletion }: SessionInput): SessionSummary {
  const perfect = isNewCompletion && firstTry.total > 0 && firstTry.correct === firstTry.total;
  const perfectBonus = perfect ? XP_PERFECT : 0;
  const xpEarned = isNewCompletion ? XP_LESSON + perfectBonus : 0;

  const goalProgressAfter = before.todayXp + xpEarned;
  // Only "just met" if it wasn't already met — crossing the line is the moment,
  // and every lesson after it shouldn't re-fire the same celebration.
  const goalJustMet = before.todayXp < goalXp && goalProgressAfter >= goalXp;

  // computeStreak deliberately doesn't count today until there's activity, so
  // the first thing done today is what pushes the number up.
  const streakAdvanced = isNewCompletion && before.todayItems === 0;
  const streak = before.streak + (streakAdvanced ? 1 : 0);

  const totalAfter = before.totalXp + xpEarned;
  const level = levelFromXp(totalAfter);

  return {
    xpEarned,
    perfect,
    perfectBonus,
    firstTry,
    streak,
    streakAdvanced,
    goalXp,
    goalProgressBefore: before.todayXp,
    goalProgressAfter,
    goalJustMet,
    level,
    leveledUp: level > before.level,
  };
}
