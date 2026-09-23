/**
 * Topics the learner is getting wrong, for the "weak spots" block on the
 * Library home.
 *
 * There was no notion of a weak topic anywhere in the app before this. Quiz
 * attempts were recorded and then only ever read back as a per-course best
 * score, so "which subjects are you actually struggling with" had no answer.
 *
 * The rule is the one the design asks for: a topic is weak when the mean score
 * of its most recent attempts is below 70%. Attempts are per COURSE, and a
 * topic is a domain, so attempts are rolled up through the course's domain —
 * which is also what makes the count meaningful, since a domain usually holds
 * several courses and one bad course is a weak subject.
 *
 * Only the last few attempts count, so the block reflects where someone is now
 * rather than where they started. Without that window, an early run of wrong
 * answers would keep a topic flagged long after it had been learned, which is
 * both wrong and discouraging.
 */

import { supabase } from "@/lib/supabase";
import { getCourse } from "./registry";

/** One recorded quiz attempt, narrowed to what the rule needs. */
export interface TopicAttempt {
  courseId: string;
  /** 0..1, as stored in quiz_attempts.score. */
  score: number;
  /** ISO timestamp; used only for ordering. */
  createdAt: string;
}

/** Below this mean score, a topic counts as weak. */
export const WEAK_THRESHOLD = 0.7;

/** How many recent attempts per topic the mean is taken over. */
export const WEAK_WINDOW = 5;

/**
 * The domains whose recent accuracy sits below the threshold.
 *
 * Pure, and takes its own course→domain resolver, so the rule can be tested
 * without a database or the content registry.
 *
 * A single attempt is enough to flag a topic. That is deliberate: someone who
 * has answered one quiz at 40% does have a weak spot, and waiting for a second
 * attempt would leave the block empty exactly when it is most useful.
 */
export function weakTopicIds(
  attempts: readonly TopicAttempt[],
  domainOf: (courseId: string) => string | null,
): string[] {
  const byDomain = new Map<string, TopicAttempt[]>();

  for (const a of attempts) {
    if (!Number.isFinite(a.score)) continue;
    const domain = domainOf(a.courseId);
    if (!domain) continue; // a course that has since been retired
    const list = byDomain.get(domain);
    if (list) list.push(a);
    else byDomain.set(domain, [a]);
  }

  const weak: string[] = [];
  for (const [domain, list] of byDomain) {
    // Most recent first, then the window. Sorting here rather than trusting
    // the caller's order keeps the rule correct whatever the query did.
    const recent = [...list]
      .sort((x, y) => y.createdAt.localeCompare(x.createdAt))
      .slice(0, WEAK_WINDOW);
    if (recent.length === 0) continue;
    const mean = recent.reduce((sum, a) => sum + a.score, 0) / recent.length;
    if (mean < WEAK_THRESHOLD) weak.push(domain);
  }
  return weak.sort();
}

/**
 * The learner's weak topics, read from their own attempts.
 *
 * Returns an empty list rather than throwing when signed out or when the read
 * fails: this drives one decorative count on the home screen, and taking the
 * whole screen down over it would be a poor trade.
 */
export async function getWeakTopics(): Promise<string[]> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const uid = session?.user?.id;
    if (!uid) return [];

    // Bounded: enough to cover the window for every domain several times over,
    // without pulling a learner's entire history down to count a badge.
    const { data, error } = await supabase
      .from("quiz_attempts")
      .select("course_id, score, created_at")
      .eq("user_id", uid)
      .order("created_at", { ascending: false })
      .limit(200);

    if (error || !data) return [];

    const attempts: TopicAttempt[] = data.map((row) => ({
      courseId: String(row.course_id),
      score: Number(row.score),
      createdAt: String(row.created_at),
    }));

    return weakTopicIds(attempts, (courseId) => getCourse(courseId)?.domain ?? null);
  } catch {
    return [];
  }
}
