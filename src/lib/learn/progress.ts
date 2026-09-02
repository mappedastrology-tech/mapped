import { supabase } from "@/lib/supabase";
import { scheduleInitialReview } from "./reviewStore";
import { awardXp } from "./activityStore";
import { XP_LESSON, XP_FINAL_BONUS, XP_PERFECT } from "./stats";
import type { CourseProgress, CertificateRecord } from "./types";

/**
 * Supabase-backed progress for the Learning Library. All reads/writes are
 * RLS-scoped to the signed-in user. Everything fails soft: if the user is
 * signed out or a table doesn't exist yet, these resolve to empty/no-op so the
 * UI still renders.
 */

async function uid(): Promise<string | null> {
  try {
    const { data } = await supabase.auth.getSession();
    return data.session?.user?.id ?? null;
  } catch {
    return null;
  }
}

interface ProgressRow {
  course_id: string;
  completed_lesson_ids: string[] | null;
  last_lesson_id: string | null;
  best_score: number | null;
  started_at: string;
  updated_at: string;
  completed_at: string | null;
}

function toProgress(r: ProgressRow): CourseProgress {
  return {
    courseId: r.course_id,
    completedLessonIds: r.completed_lesson_ids ?? [],
    lastLessonId: r.last_lesson_id,
    bestScore: r.best_score,
    startedAt: r.started_at,
    updatedAt: r.updated_at,
    completedAt: r.completed_at,
  };
}

/** Map of courseId → progress for the signed-in user. */
export async function getAllProgress(): Promise<Record<string, CourseProgress>> {
  const user = await uid();
  if (!user) return {};
  try {
    const { data, error } = await supabase
      .from("course_progress")
      .select("course_id, completed_lesson_ids, last_lesson_id, best_score, started_at, updated_at, completed_at")
      .eq("user_id", user);
    if (error || !data) return {};
    const out: Record<string, CourseProgress> = {};
    for (const r of data as ProgressRow[]) out[r.course_id] = toProgress(r);
    return out;
  } catch {
    return {};
  }
}

export async function getProgress(courseId: string): Promise<CourseProgress | null> {
  const all = await getAllProgress();
  return all[courseId] ?? null;
}

/** Mark a lesson complete (idempotent) and remember it as the last-viewed lesson. */
/**
 * @param perfect Every question right on the first try — earns a small bonus,
 *   and only on the first completion, so it cannot be farmed by retaking.
 * @returns whether this was the first completion, which is what decides if
 *   there is anything to celebrate.
 */
export async function markLessonComplete(
  courseId: string,
  lessonId: string,
  perfect = false,
): Promise<{ isNewCompletion: boolean }> {
  const user = await uid();
  if (!user) return { isNewCompletion: false };
  try {
    const existing = await getProgress(courseId);
    const completed = new Set(existing?.completedLessonIds ?? []);
    const isNew = !completed.has(lessonId);
    completed.add(lessonId);
    await supabase.from("course_progress").upsert(
      {
        user_id: user,
        course_id: courseId,
        completed_lesson_ids: [...completed],
        last_lesson_id: lessonId,
        updated_at: new Date().toISOString(),
        ...(existing ? {} : { started_at: new Date().toISOString() }),
      },
      { onConflict: "user_id,course_id" },
    );
    // Schedule a spaced-repetition review for this lesson (no-op if already set).
    await scheduleInitialReview(courseId, lessonId);
    // Award XP only the first time a lesson is completed.
    if (isNew) await awardXp(XP_LESSON + (perfect ? XP_PERFECT : 0), 1);
    return { isNewCompletion: isNew };
  } catch {
    /* fail soft */
    return { isNewCompletion: false };
  }
}

/** Log a quiz or final-test attempt (lessonId null = final test). */
export async function recordQuizAttempt(
  courseId: string,
  lessonId: string | null,
  score: number,
  passed: boolean,
): Promise<void> {
  const user = await uid();
  if (!user) return;
  try {
    await supabase.from("quiz_attempts").insert({
      user_id: user,
      course_id: courseId,
      lesson_id: lessonId,
      score,
      passed,
    });
  } catch {
    /* fail soft */
  }
}

/** Short, human-readable verification code, e.g. MPD-7F3A9C. */
function makeCertCode(): string {
  const s = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `MPD-${s}`;
}

/**
 * Record a final-test result. Updates best score + completion, and issues a
 * certificate the first time the learner passes. Returns the certificate if one
 * exists (new or pre-existing).
 */
export async function recordFinalResult(
  courseId: string,
  courseTitle: string,
  score: number,
  passed: boolean,
): Promise<CertificateRecord | null> {
  const user = await uid();
  if (!user) return null;

  await recordQuizAttempt(courseId, null, score, passed);

  try {
    const existing = await getProgress(courseId);
    const best = Math.max(existing?.bestScore ?? 0, score);
    await supabase.from("course_progress").upsert(
      {
        user_id: user,
        course_id: courseId,
        completed_lesson_ids: existing?.completedLessonIds ?? [],
        best_score: best,
        last_lesson_id: existing?.lastLessonId ?? null,
        updated_at: new Date().toISOString(),
        ...(passed ? { completed_at: new Date().toISOString() } : {}),
        ...(existing ? {} : { started_at: new Date().toISOString() }),
      },
      { onConflict: "user_id,course_id" },
    );
  } catch {
    /* fail soft */
  }

  if (!passed) return null;

  // Issue (or fetch existing) certificate.
  try {
    const { data: found } = await supabase
      .from("certificates")
      .select("id, course_id, course_title, score, code, issued_at")
      .eq("user_id", user)
      .eq("course_id", courseId)
      .maybeSingle();
    if (found) {
      return {
        id: found.id, courseId: found.course_id, courseTitle: found.course_title,
        score: found.score, code: found.code, issuedAt: found.issued_at,
      };
    }
    const code = makeCertCode();
    const { data: created } = await supabase
      .from("certificates")
      .insert({ user_id: user, course_id: courseId, course_title: courseTitle, score, code })
      .select("id, course_id, course_title, score, code, issued_at")
      .single();
    if (created) {
      await awardXp(XP_FINAL_BONUS, 1); // bonus for passing a course's final test
      return {
        id: created.id, courseId: created.course_id, courseTitle: created.course_title,
        score: created.score, code: created.code, issuedAt: created.issued_at,
      };
    }
  } catch {
    /* fail soft */
  }
  return null;
}

export async function getCertificates(): Promise<CertificateRecord[]> {
  const user = await uid();
  if (!user) return [];
  try {
    const { data } = await supabase
      .from("certificates")
      .select("id, course_id, course_title, score, code, issued_at")
      .eq("user_id", user)
      .order("issued_at", { ascending: false });
    return (data ?? []).map((c) => ({
      id: c.id, courseId: c.course_id, courseTitle: c.course_title,
      score: c.score, code: c.code, issuedAt: c.issued_at,
    }));
  } catch {
    return [];
  }
}
