"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { buildReviewQuiz, gradeReview, type ReviewQuiz } from "@/lib/learn/review";
import { getDueReviews, recordReview } from "@/lib/learn/reviewStore";
import { awardXp } from "@/lib/learn/activityStore";
import { loadEngagement } from "@/lib/learn/engagement";
import { XP_REVIEW } from "@/lib/learn/stats";
import type { QuizScore } from "@/lib/learn/quiz";
import LibraryHeader from "./LibraryHeader";
import Quiz from "./Quiz";

type Phase = "loading" | "empty" | "intro" | "taking" | "done";

export default function ReviewSession() {
  const [phase, setPhase] = useState<Phase>("loading");
  const [rq, setRq] = useState<ReviewQuiz | null>(null);
  const [lessonCount, setLessonCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [advanced, setAdvanced] = useState(0);
  const [scorePct, setScorePct] = useState(0);

  useEffect(() => {
    let active = true;
    Promise.all([getDueReviews(), loadEngagement()]).then(([due, eng]) => {
      if (!active) return;
      setStreak(eng.stats.streak);
      if (due.length === 0) { setPhase("empty"); return; }
      const quiz = buildReviewQuiz(due);
      setRq(quiz);
      setLessonCount(new Set(Object.values(quiz.lessonOf).map((d) => `${d.courseId}::${d.lessonId}`)).size);
      setPhase("intro");
    });
    return () => { active = false; };
  }, []);

  async function handleComplete(score: QuizScore, answers: Record<string, string>) {
    if (!rq) return;
    const graded = gradeReview(rq, answers);
    setAdvanced(graded.filter((g) => g.passed).length);
    setScorePct(Math.round(score.fraction * 100));
    setPhase("done");
    await Promise.all(graded.map((g) => recordReview(g.review.courseId, g.review.lessonId, g.passed)));
    if (graded.length > 0) await awardXp(graded.length * XP_REVIEW, graded.length);
  }

  return (
    <main className="min-h-screen lib-felt">
      <style>{`@keyframes rev-floaty{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}`}</style>
      <LibraryHeader title="Daily Review" fallback="/library" />
      <div className="max-w-lg mx-auto px-5 py-6 pb-28">
        {phase === "loading" && (
          <p className="text-center text-sm py-10" style={{ color: "var(--foreground-muted)" }}>Loading your review…</p>
        )}

        {phase === "empty" && (
          <div className="rounded-2xl p-6 text-center" style={{ background: "linear-gradient(140deg, rgba(45,64,41,0.18), var(--background-card) 70%)", border: "1px solid var(--sage)", boxShadow: "var(--card-shadow)" }}>
            <div className="mx-auto mb-3 w-16 h-16 rounded-full flex items-center justify-center text-[26px]" style={{ backgroundColor: "var(--sage)", color: "#fff" }} aria-hidden="true">✓</div>
            <h2 className="text-[18px] font-semibold mb-1" style={{ color: "var(--foreground)", fontFamily: "var(--font-display)" }}>All caught up</h2>
            <p className="text-[13px] leading-relaxed" style={{ color: "var(--foreground-secondary)" }}>
              Nothing is due for review right now. Finish a lesson and it&rsquo;ll come back here on a spaced schedule so it sticks.
            </p>
            <Link href="/library" className="inline-block mt-4 px-5 py-2.5 rounded-xl text-[13px] font-medium" style={{ backgroundColor: "var(--btn-primary-bg)", color: "var(--btn-primary-text)" }}>
              Back to Learn
            </Link>
          </div>
        )}

        {phase === "intro" && (
          <div className="rounded-2xl p-6 text-center" style={{ background: "linear-gradient(140deg, rgba(201,169,97,0.16), var(--background-card) 70%)", border: "1px solid rgba(201,169,97,0.4)", boxShadow: "var(--card-shadow)" }}>
            <div className="mx-auto mb-3 w-20 h-20 rounded-full flex flex-col items-center justify-center" style={{ background: "linear-gradient(135deg, var(--plum), var(--plum-deep))", border: "3px solid var(--brass)" }}>
              <span className="text-[28px] font-bold leading-none" style={{ color: "var(--lib-on-plum)", fontFamily: "var(--font-display)" }}>{lessonCount}</span>
              <span className="text-[8px] uppercase tracking-wider" style={{ color: "var(--brass-light)" }}>lessons</span>
            </div>
            <h2 className="text-[18px] font-semibold mb-1" style={{ color: "var(--foreground)", fontFamily: "var(--font-display)" }}>Daily review</h2>
            <p className="text-[13px] leading-relaxed mb-1" style={{ color: "var(--foreground-secondary)" }}>
              A short test on {lessonCount === 1 ? "a lesson you've" : `${lessonCount} lessons you've`} already finished. Answer the questions to lock the material in.
            </p>
            <p className="text-[11px] mb-5" style={{ color: "var(--foreground-muted)" }}>
              Get a lesson&rsquo;s questions right and it won&rsquo;t come back for longer.
            </p>
            <button onClick={() => setPhase("taking")} className="w-full py-3 rounded-xl text-[14px] font-medium active:scale-[0.99] transition-transform" style={{ backgroundColor: "var(--btn-primary-bg)", color: "var(--btn-primary-text)" }}>
              Start review
            </button>
          </div>
        )}

        {phase === "taking" && rq && (
          <>
            <div className="text-center mb-4">
              <p className="text-[9px] uppercase font-semibold" style={{ letterSpacing: "0.2em", color: "var(--brass)" }}>Daily review</p>
              {streak > 0 && (
                <span className="inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 rounded-full" style={{ background: "rgba(201,169,97,0.12)" }}>
                  <span className="text-[14px]" aria-hidden="true">🔥</span>
                  <span className="text-[16px] font-bold leading-none" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{streak}</span>
                  <span className="text-[9px] uppercase" style={{ letterSpacing: "0.1em", color: "var(--foreground-muted)" }}>day streak</span>
                </span>
              )}
            </div>
            <Quiz questions={rq.questions} onComplete={handleComplete} title="Review" />
          </>
        )}

        {phase === "done" && (
          <div className="rounded-2xl p-7 text-center" style={{ background: "linear-gradient(140deg, rgba(201,169,97,0.14), var(--background-card) 75%)", border: "1px solid rgba(201,169,97,0.4)", boxShadow: "var(--card-shadow)" }}>
            <div className="relative w-24 h-24 mx-auto">
              <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "radial-gradient(circle at 42% 36%, rgba(201,169,97,0.4), rgba(11,7,18,0) 82%)" }} />
              <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 42, animation: "rev-floaty 3.4s ease-in-out infinite" }} aria-hidden="true">🌙</span>
            </div>
            <h2 className="text-[24px] font-medium mt-4" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>Review complete</h2>
            <p className="text-[34px] font-bold leading-none mt-3" style={{ fontFamily: "var(--font-display)", color: "var(--brass-light)" }}>{scorePct}%</p>
            <p className="text-[13px] mt-3" style={{ color: "var(--foreground-secondary)" }}>
              {advanced} of {lessonCount} {lessonCount === 1 ? "lesson" : "lessons"} pushed further out. The rest will come back sooner so you can lock them in.
            </p>
            <div className="inline-flex items-center gap-1.5 mt-5 px-4 py-2 rounded-full" style={{ background: "rgba(201,169,97,0.14)" }}>
              <span className="text-[15px] font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--brass-light)" }}>+{lessonCount * XP_REVIEW} XP</span>
            </div>
            <p className="text-[11px] mt-4" style={{ color: "var(--foreground-muted)" }}>Come back tomorrow to keep the streak alive ✦</p>
            <Link href="/library" className="block mt-5 px-5 py-2.5 rounded-xl text-[13px] font-medium" style={{ backgroundColor: "var(--btn-primary-bg)", color: "var(--btn-primary-text)" }}>
              Done
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
