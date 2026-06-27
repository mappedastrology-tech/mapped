import { supabase } from "@/lib/supabase";
import { REVIEW_INTERVALS, nextInterval, nextIntervalForGrade, filterLiveReviews, type DueReview, type ReviewGrade } from "./review";

/**
 * Supabase persistence for the spaced-repetition review queue. Fails soft when
 * signed out or the table is absent. Pure logic lives in ./review.
 */

const DAY_MS = 86_400_000;

async function uid(): Promise<string | null> {
  try {
    const { data } = await supabase.auth.getSession();
    return data.session?.user?.id ?? null;
  } catch {
    return null;
  }
}

/** Schedule a lesson's first review (1 day out). No-op if one already exists. */
export async function scheduleInitialReview(courseId: string, lessonId: string): Promise<void> {
  const user = await uid();
  if (!user) return;
  try {
    await supabase.from("lesson_reviews").upsert(
      {
        user_id: user,
        course_id: courseId,
        lesson_id: lessonId,
        due_at: new Date(Date.now() + REVIEW_INTERVALS[0] * DAY_MS).toISOString(),
        interval_days: REVIEW_INTERVALS[0],
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,course_id,lesson_id", ignoreDuplicates: true },
    );
  } catch {
    /* fail soft */
  }
}

/** Lessons whose review is due now (oldest first), filtered to live content. */
export async function getDueReviews(): Promise<DueReview[]> {
  const user = await uid();
  if (!user) return [];
  try {
    const { data } = await supabase
      .from("lesson_reviews")
      .select("course_id, lesson_id, due_at")
      .eq("user_id", user)
      .lte("due_at", new Date().toISOString())
      .order("due_at", { ascending: true });
    return filterLiveReviews((data ?? []).map((r) => ({ courseId: r.course_id, lessonId: r.lesson_id })));
  } catch {
    return [];
  }
}

export async function getDueReviewCount(): Promise<number> {
  return (await getDueReviews()).length;
}

async function reschedule(courseId: string, lessonId: string, next: number): Promise<void> {
  const user = await uid();
  if (!user) return;
  try {
    await supabase.from("lesson_reviews").upsert(
      {
        user_id: user,
        course_id: courseId,
        lesson_id: lessonId,
        due_at: new Date(Date.now() + next * DAY_MS).toISOString(),
        interval_days: next,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,course_id,lesson_id" },
    );
  } catch {
    /* fail soft */
  }
}

async function currentInterval(courseId: string, lessonId: string): Promise<number> {
  const user = await uid();
  if (!user) return 1;
  try {
    const { data } = await supabase
      .from("lesson_reviews")
      .select("interval_days")
      .eq("user_id", user)
      .eq("course_id", courseId)
      .eq("lesson_id", lessonId)
      .maybeSingle();
    return data?.interval_days ?? 1;
  } catch {
    return 1;
  }
}

/** Advance (or reset) a lesson's review schedule after a pass/fail review. */
export async function recordReview(courseId: string, lessonId: string, passed: boolean): Promise<void> {
  const cur = await currentInterval(courseId, lessonId);
  await reschedule(courseId, lessonId, nextInterval(cur, passed));
}

/** Advance (or reset) a lesson's schedule from a self-rated grade (again/good/easy). */
export async function recordReviewGrade(courseId: string, lessonId: string, grade: ReviewGrade): Promise<void> {
  const cur = await currentInterval(courseId, lessonId);
  await reschedule(courseId, lessonId, nextIntervalForGrade(cur, grade));
}
