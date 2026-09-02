"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCourse, getLesson, lessonContext, passThresholdFor, domainAccent } from "@/lib/learn/registry";
import { markLessonComplete, recordQuizAttempt } from "@/lib/learn/progress";
import { detectNewAchievements } from "@/lib/learn/achievementsNotify";
import { useToast } from "@/components/Toast";
import type { QuizScore } from "@/lib/learn/quiz";
import { loadEngagement } from "@/lib/learn/engagement";
import { getDailyGoal } from "@/lib/learn/goals";
import { buildSessionSummary, type SessionSummary } from "@/lib/learn/sessionSummary";
import type { Achievement } from "@/lib/learn/achievements";
import type { LearningStats } from "@/lib/learn/stats";
import LessonComplete from "./LessonComplete";
import LibraryHeader from "./LibraryHeader";
import LessonBlocks from "./LessonBlocks";
import Quiz from "./Quiz";

const INTERACTIVE = new Set(["sort", "flip", "match", "explore", "annotated"]);

export default function LessonView({ courseId, lessonId }: { courseId: string; lessonId: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const course = getCourse(courseId);
  const lesson = course ? getLesson(course, lessonId) : undefined;
  const [completedLesson, setCompletedLesson] = useState<string | null>(null);
  const [summary, setSummary] = useState<SessionSummary | null>(null);
  const [fresh, setFresh] = useState<Achievement[]>([]);
  const quizDone = completedLesson === lessonId;

  // Snapshot the stats BEFORE the lesson is recorded. The completion screen
  // needs to know what changed, and reading again afterwards would race the
  // write that just happened.
  const [before, setBefore] = useState<LearningStats | null>(null);
  useEffect(() => {
    let alive = true;
    loadEngagement()
      .then((e) => { if (alive) setBefore(e.stats); })
      .catch(() => { /* signed out or offline — the screen degrades */ });
    return () => { alive = false; };
  }, [lessonId]);

  if (!course || !lesson) {
    return (
      <main className="min-h-screen lib-felt">
        <LibraryHeader title="Lesson" fallback={`/library/${courseId}`} />
        <p className="max-w-lg mx-auto px-5 py-10 text-center text-sm" style={{ color: "var(--foreground-muted)" }}>This lesson couldn&rsquo;t be found.</p>
      </main>
    );
  }

  const ctx = lessonContext(course, lessonId);
  const accent = domainAccent(course.domain);

  // Teaching content stays in the body; any interactive activity becomes a
  // question inside the quiz (after the multiple-choice ones).
  const bodyBlocks = lesson.blocks.filter((b) => !INTERACTIVE.has(b.kind));
  const activities = lesson.blocks.filter((b) => INTERACTIVE.has(b.kind));

  async function handleQuizComplete(
    score: QuizScore,
    _answers: Record<string, string>,
    firstTry: { correct: number; total: number },
  ) {
    setCompletedLesson(lessonId);
    // Flawless means right first time, not right eventually — in retry mode
    // score.fraction is ~1.0 for nearly everyone.
    const perfect = firstTry.total > 0 && firstTry.correct === firstTry.total;

    const [{ isNewCompletion }] = await Promise.all([
      markLessonComplete(courseId, lessonId, perfect),
      recordQuizAttempt(courseId, lessonId, score.fraction, score.fraction >= passThresholdFor(course!)),
    ]);

    if (before) {
      setSummary(buildSessionSummary({
        before,
        goalXp: getDailyGoal().xp,
        firstTry,
        isNewCompletion,
      }));
    }

    detectNewAchievements().then((unlocked) => {
      // Shown as cards on the completion screen rather than a toast that
      // slides away — and all of them, not just the first.
      if (unlocked.length) setFresh(unlocked);
      else if (!before) unlocked.forEach((a) => toast.success(`🏆 ${a.title} unlocked!`));
    });
  }

  return (
    <main className="min-h-screen lib-felt">
      <LibraryHeader
        title={course.title}
        fallback={`/library/${courseId}`}
        crumbs={[{ label: "Library", href: "/library" }]}
        accent={accent}
      />
      {/* Course progress bar */}
      <div className="h-1" style={{ backgroundColor: "var(--lib-track)" }}>
        <div className="h-full" style={{ width: `${ctx.total > 0 ? ((ctx.index + 1) / ctx.total) * 100 : 0}%`, backgroundColor: accent }} />
      </div>
      <div key={lessonId} className="max-w-lg mx-auto px-5 py-6 pb-28 animate-in fade-in slide-in-from-right-4 duration-300">
        <p className="text-[10px] uppercase tracking-widest mb-2 flex items-center gap-1.5" style={{ color: accent }}>
          <span aria-hidden="true" className="text-[13px]">{course.icon}</span> Lesson {ctx.index + 1} of {ctx.total}
        </p>
        <h2 className="text-[23px] font-medium leading-tight mb-3" style={{ color: "var(--foreground)", fontFamily: "var(--font-display)" }}>{lesson.title}</h2>
        <div className="rounded-xl px-4 py-3 mb-5" style={{ backgroundColor: "var(--background-card)", borderLeft: `3px solid ${accent}`, boxShadow: "var(--card-shadow)" }}>
          <p className="text-[10px] uppercase tracking-widest mb-1 font-semibold" style={{ color: accent }}>Objective</p>
          <p className="text-[13px] leading-relaxed" style={{ color: "var(--foreground-secondary)" }}>{lesson.objective}</p>
        </div>

        {/* Lesson body (teaching only) */}
        <LessonBlocks blocks={bodyBlocks} />

        {/* Quiz — multiple-choice questions, then the interactive activity as the last question(s) */}
        <div className="mt-8">
          <p className="text-[11px] uppercase tracking-widest mb-3" style={{ color: "var(--brass)" }}>Check your understanding</p>
          <Quiz questions={lesson.quiz} activities={activities} onComplete={handleQuizComplete} retry />
        </div>

        {/* Continue */}
        {quizDone && (
          <div className="mt-6 flex flex-col gap-2">
            {summary ? (
              <LessonComplete summary={summary} achievements={fresh} accent={accent} />
            ) : (
              <div className="self-center mb-1 px-3 py-1.5 rounded-full text-[12px] font-semibold" style={{ backgroundColor: "var(--tag-green-bg)", color: "var(--sage-light)" }}>
                ✦ Lesson complete
              </div>
            )}
            {ctx.next ? (
              <Link href={`/library/${courseId}/${ctx.next.id}`} className="block text-center w-full py-3 rounded-xl text-[14px] font-medium active:scale-[0.99] transition-transform" style={{ backgroundColor: "var(--btn-primary-bg)", color: "var(--btn-primary-text)" }}>
                Next lesson →
              </Link>
            ) : (
              <button onClick={() => router.push(`/library/${courseId}`)} className="block text-center w-full py-3 rounded-xl text-[14px] font-medium active:scale-[0.99] transition-transform" style={{ backgroundColor: "var(--btn-primary-bg)", color: "var(--btn-primary-text)" }}>
                Finish — back to course
              </button>
            )}
            <Link href={`/library/${courseId}`} className="block text-center w-full py-2.5 text-[12px]" style={{ color: "var(--foreground-muted)" }}>
              Back to course overview
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
