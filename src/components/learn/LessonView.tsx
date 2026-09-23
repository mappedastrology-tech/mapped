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
import { LessonProgressHeader, LessonTitle, PrimaryPill, InfoPanel } from "./LessonChrome";
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
      {/* Shared lesson chrome: close, progress, step. The lesson is a focused
          flow, so it closes back to the course rather than carrying the
          library's sticky header. */}
      <LessonProgressHeader
        progress={ctx.total > 0 ? (ctx.index + 1) / ctx.total : 0}
        label={`${ctx.index + 1} / ${ctx.total}`}
        onClose={() => router.push(`/library/${courseId}`)}
      />

      <div key={lessonId} className="max-w-lg mx-auto pb-28 animate-in fade-in slide-in-from-right-4 duration-300" style={{ paddingLeft: 22, paddingRight: 22 }}>
        <LessonTitle eyebrow={course.title} title={lesson.title} />

        <InfoPanel eyebrow="Objective" accent={accent} style={{ marginTop: 20 }}>
          {lesson.objective}
        </InfoPanel>

        <div style={{ height: 20 }} />

        {/* Lesson body (teaching only) */}
        <LessonBlocks blocks={bodyBlocks} />

        {/* Quiz — multiple-choice questions, then the interactive activity as the last question(s) */}
        <div className="mt-8">
          <p className="uppercase mb-3" style={{ fontFamily: "var(--font-body)", fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", color: "var(--lib-muted)" }}>Check your understanding</p>
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
              <PrimaryPill full onClick={() => router.push(`/library/${courseId}/${ctx.next!.id}`)}>Next lesson</PrimaryPill>
            ) : (
              <PrimaryPill full onClick={() => router.push(`/library/${courseId}`)}>Finish</PrimaryPill>
            )}
            <Link href={`/library/${courseId}`} className="block text-center w-full py-2.5 text-[12px]" style={{ color: "var(--lib-muted)" }}>
              Back to course overview
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
