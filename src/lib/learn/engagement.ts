import { getActivity } from "./activityStore";
import { getAllProgress, getCertificates } from "./progress";
import { computeStats, type LearningStats } from "./stats";
import type { AchievementContext } from "./achievements";

export interface Engagement {
  stats: LearningStats;
  ctx: AchievementContext;
}

/**
 * The zero state, computed synchronously — Level 1, no streak, nothing done.
 *
 * The library dashboard is meant to render for brand-new users too, so there is
 * no reason for it to wait on a network round-trip to appear. Seeding state with
 * this and replacing it when loadEngagement() resolves means the block is on the
 * page from the first paint, rather than being injected above everything a
 * moment later and shoving the whole page down.
 */
export function emptyEngagement(now: Date = new Date()): Engagement {
  const stats = computeStats([], now);
  return { stats, ctx: { stats, lessonsCompleted: 0, certificates: 0, coursesCompleted: 0 } };
}

/** Load everything the progress dashboard / home strip need in one call. */
export async function loadEngagement(now: Date = new Date()): Promise<Engagement> {
  const [activity, progress, certs] = await Promise.all([getActivity(), getAllProgress(), getCertificates()]);
  const stats = computeStats(activity, now);
  const lessonsCompleted = Object.values(progress).reduce((s, p) => s + (p.completedLessonIds?.length ?? 0), 0);
  const coursesCompleted = Object.values(progress).filter((p) => p.completedAt).length;
  return {
    stats,
    ctx: { stats, lessonsCompleted, certificates: certs.length, coursesCompleted },
  };
}
