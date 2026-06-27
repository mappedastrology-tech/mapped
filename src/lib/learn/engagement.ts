import { getActivity } from "./activityStore";
import { getAllProgress, getCertificates } from "./progress";
import { computeStats, type LearningStats } from "./stats";
import type { AchievementContext } from "./achievements";

export interface Engagement {
  stats: LearningStats;
  ctx: AchievementContext;
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
