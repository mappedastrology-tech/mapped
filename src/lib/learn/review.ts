import { getCourse, getLesson } from "./registry";
import type { LearnDomain, QuizQuestion } from "./types";

/**
 * Spaced-repetition — PURE logic only (no Supabase), so it's easily testable.
 * The persistence layer lives in ./reviewStore.
 *
 * After a lesson is completed it's scheduled for review in 1 day; each
 * successful review pushes the next one further out along this schedule, and a
 * missed review resets to 1 day.
 */
export const REVIEW_INTERVALS = [1, 3, 7, 14, 30, 60]; // days

export function nextInterval(current: number, passed: boolean): number {
  if (!passed) return REVIEW_INTERVALS[0];
  const idx = REVIEW_INTERVALS.indexOf(current);
  if (idx === -1) return REVIEW_INTERVALS[1];
  return REVIEW_INTERVALS[Math.min(idx + 1, REVIEW_INTERVALS.length - 1)];
}

/** Self-rated recall confidence (Anki-style). */
export type ReviewGrade = "again" | "good" | "easy";

/**
 * Schedule the next review from a self-rating: "again" resets to the start,
 * "good" advances one step, "easy" advances two steps along the schedule.
 */
export function nextIntervalForGrade(current: number, grade: ReviewGrade): number {
  if (grade === "again") return REVIEW_INTERVALS[0];
  const idx = REVIEW_INTERVALS.indexOf(current);
  const base = idx === -1 ? 0 : idx;
  const step = grade === "easy" ? 2 : 1;
  return REVIEW_INTERVALS[Math.min(base + step, REVIEW_INTERVALS.length - 1)];
}

export interface DueReview {
  courseId: string;
  lessonId: string;
}

export interface ReviewQuiz {
  questions: QuizQuestion[];
  /** Maps each (uniquely-namespaced) question id back to its lesson. */
  lessonOf: Record<string, DueReview>;
}

/**
 * Build a single mixed review quiz from due lessons. Question ids are namespaced
 * (`courseId::lessonId::qid`) so questions from different lessons never collide.
 */
export function buildReviewQuiz(due: DueReview[], maxLessons = 6, perLesson = 2): ReviewQuiz {
  const questions: QuizQuestion[] = [];
  const lessonOf: Record<string, DueReview> = {};
  for (const d of due.slice(0, maxLessons)) {
    const course = getCourse(d.courseId);
    if (!course) continue;
    const lesson = getLesson(course, d.lessonId);
    if (!lesson) continue;
    for (const q of lesson.quiz.slice(0, perLesson)) {
      const id = `${d.courseId}::${d.lessonId}::${q.id}`;
      questions.push({ ...q, id });
      lessonOf[id] = d;
    }
  }
  return { questions, lessonOf };
}

/**
 * Given the review quiz and the user's answers, decide pass/fail per lesson
 * (a lesson passes only if all its questions were answered correctly).
 */
export function gradeReview(rq: ReviewQuiz, answers: Record<string, string>): { review: DueReview; passed: boolean }[] {
  const byLesson = new Map<string, { review: DueReview; correct: number; total: number }>();
  for (const q of rq.questions) {
    const d = rq.lessonOf[q.id];
    if (!d) continue; // defensive: question id with no lesson mapping
    const key = `${d.courseId}::${d.lessonId}`;
    const rec = byLesson.get(key) ?? { review: d, correct: 0, total: 0 };
    rec.total++;
    const chosen = answers[q.id];
    if (q.options.find((o) => o.id === chosen)?.correct) rec.correct++;
    byLesson.set(key, rec);
  }
  return [...byLesson.values()].map((r) => ({ review: r.review, passed: r.correct === r.total }));
}

export interface ReviewCard {
  id: string;
  review: DueReview;
  domain: LearnDomain;
  /** The question prompt (card front). */
  front: string;
  /** The correct answer (card back). */
  back: string;
  /** Why it's the answer (shown under the back). */
  detail?: string;
}

/**
 * Build flip-and-rate flashcards from due lessons — front is the question,
 * back is its correct answer plus the rationale. Mirrors buildReviewQuiz's
 * selection so the two stay in sync.
 */
export function buildReviewCards(due: DueReview[], maxLessons = 6, perLesson = 2): ReviewCard[] {
  const cards: ReviewCard[] = [];
  for (const d of due.slice(0, maxLessons)) {
    const course = getCourse(d.courseId);
    if (!course) continue;
    const lesson = getLesson(course, d.lessonId);
    if (!lesson) continue;
    for (const q of lesson.quiz.slice(0, perLesson)) {
      const correct = q.options.find((o) => o.correct);
      if (!correct) continue;
      cards.push({
        id: `${d.courseId}::${d.lessonId}::${q.id}`,
        review: d,
        domain: course.domain,
        front: q.prompt,
        back: correct.text,
        detail: correct.explanation,
      });
    }
  }
  return cards;
}

/** Lessons that still exist in shipped content (filters stale rows). */
export function filterLiveReviews(rows: DueReview[]): DueReview[] {
  return rows.filter((d) => {
    const c = getCourse(d.courseId);
    return !!c && !!getLesson(c, d.lessonId);
  });
}
