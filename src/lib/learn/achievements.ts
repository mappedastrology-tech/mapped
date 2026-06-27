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

/** Milestones for the long game (streaks use longest-ever so they stay earned). */
export const ACHIEVEMENTS: Achievement[] = [
  { id: "first-lesson", icon: "🌱", title: "First Steps", description: "Complete your first lesson", unlocked: (c) => c.lessonsCompleted >= 1 },
  { id: "streak-3", icon: "🔥", title: "Warming Up", description: "Reach a 3-day streak", unlocked: (c) => c.stats.longestStreak >= 3 },
  { id: "lessons-10", icon: "📚", title: "Curious Mind", description: "Complete 10 lessons", unlocked: (c) => c.lessonsCompleted >= 10 },
  { id: "level-5", icon: "⭐", title: "Leveling Up", description: "Reach level 5", unlocked: (c) => c.stats.level >= 5 },
  { id: "first-cert", icon: "🎓", title: "Graduate", description: "Earn your first certificate", unlocked: (c) => c.certificates >= 1 },
  { id: "streak-7", icon: "🔥", title: "On a Roll", description: "Reach a 7-day streak", unlocked: (c) => c.stats.longestStreak >= 7 },
  { id: "lessons-25", icon: "📖", title: "Scholar", description: "Complete 25 lessons", unlocked: (c) => c.lessonsCompleted >= 25 },
  { id: "courses-3", icon: "🎖️", title: "Polymath", description: "Complete 3 courses", unlocked: (c) => c.coursesCompleted >= 3 },
  { id: "streak-30", icon: "🏆", title: "Devoted", description: "Reach a 30-day streak", unlocked: (c) => c.stats.longestStreak >= 30 },
];

export function evaluateAchievements(c: AchievementContext): { achievement: Achievement; unlocked: boolean }[] {
  return ACHIEVEMENTS.map((a) => ({ achievement: a, unlocked: a.unlocked(c) }));
}

export function unlockedCount(c: AchievementContext): number {
  return ACHIEVEMENTS.reduce((n, a) => n + (a.unlocked(c) ? 1 : 0), 0);
}
