import type { LearningStats } from "./stats";

/** Inputs an achievement can test against. */
export interface AchievementContext {
  stats: LearningStats;
  lessonsCompleted: number;
  certificates: number;
  coursesCompleted: number;
}

export interface Achievement {
  id: string;
  icon: string;
  title: string;
  description: string;
  unlocked: (c: AchievementContext) => boolean;
}

/**
 * Milestones, in roughly the order they are reachable — the library shows the
 * first still-locked one as the next thing to aim at, so the order is what
 * makes that teaser sensible.
 *
 * Streaks test longest-ever rather than current, so an earned badge is never
 * taken back for missing a day.
 *
 * The early rungs matter most. The ladder used to go "finish one lesson" and
 * then straight to a three-day streak or ten lessons, which is a long silence
 * for someone in their first sitting — days two and three had nothing in them.
 */
export const ACHIEVEMENTS: Achievement[] = [
  { id: "first-lesson", icon: "🌱", title: "First Steps", description: "Complete your first lesson", unlocked: (c) => c.lessonsCompleted >= 1 },
  { id: "lessons-3", icon: "✨", title: "Finding Your Feet", description: "Complete 3 lessons", unlocked: (c) => c.lessonsCompleted >= 3 },
  { id: "level-2", icon: "🌙", title: "Off the Mark", description: "Reach level 2", unlocked: (c) => c.stats.level >= 2 },
  { id: "streak-3", icon: "🔥", title: "Warming Up", description: "Reach a 3-day streak", unlocked: (c) => c.stats.longestStreak >= 3 },
  { id: "lessons-10", icon: "📚", title: "Curious Mind", description: "Complete 10 lessons", unlocked: (c) => c.lessonsCompleted >= 10 },
  { id: "streak-7", icon: "🔥", title: "On a Roll", description: "Reach a 7-day streak", unlocked: (c) => c.stats.longestStreak >= 7 },
  { id: "courses-1", icon: "🗝️", title: "Saw It Through", description: "Finish your first course", unlocked: (c) => c.coursesCompleted >= 1 },
  { id: "first-cert", icon: "🎓", title: "Graduate", description: "Earn your first certificate", unlocked: (c) => c.certificates >= 1 },
  { id: "level-5", icon: "⭐", title: "Leveling Up", description: "Reach level 5", unlocked: (c) => c.stats.level >= 5 },
  { id: "lessons-25", icon: "📖", title: "Scholar", description: "Complete 25 lessons", unlocked: (c) => c.lessonsCompleted >= 25 },
  { id: "streak-30", icon: "🏆", title: "Devoted", description: "Reach a 30-day streak", unlocked: (c) => c.stats.longestStreak >= 30 },
  { id: "courses-3", icon: "🎖️", title: "Polymath", description: "Complete 3 courses", unlocked: (c) => c.coursesCompleted >= 3 },
  { id: "lessons-50", icon: "🔭", title: "Deep Study", description: "Complete 50 lessons", unlocked: (c) => c.lessonsCompleted >= 50 },
  { id: "level-10", icon: "🌟", title: "Well Read", description: "Reach level 10", unlocked: (c) => c.stats.level >= 10 },
];

export function evaluateAchievements(c: AchievementContext): { achievement: Achievement; unlocked: boolean }[] {
  return ACHIEVEMENTS.map((a) => ({ achievement: a, unlocked: a.unlocked(c) }));
}

export function unlockedCount(c: AchievementContext): number {
  return ACHIEVEMENTS.reduce((n, a) => n + (a.unlocked(c) ? 1 : 0), 0);
}
