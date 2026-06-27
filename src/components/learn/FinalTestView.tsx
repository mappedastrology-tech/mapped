"use client";

import { useState } from "react";
import Link from "next/link";
import { getCourse, passThresholdFor, domainAccent } from "@/lib/learn/registry";
import { sampleQuestions, type QuizScore } from "@/lib/learn/quiz";
import { recordFinalResult } from "@/lib/learn/progress";
import { detectNewAchievements } from "@/lib/learn/achievementsNotify";
import { useToast } from "@/components/Toast";
import type { CertificateRecord, QuizQuestion } from "@/lib/learn/types";
import LibraryHeader from "./LibraryHeader";
import Quiz from "./Quiz";
import Certificate from "./Certificate";
import Confetti from "./Confetti";

export default function FinalTestView({ courseId }: { courseId: string }) {
  const course = getCourse(courseId);
  const { toast } = useToast();
  const [phase, setPhase] = useState<"intro" | "taking">("intro");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [finished, setFinished] = useState(false);
  const [passed, setPassed] = useState(false);
  const [cert, setCert] = useState<CertificateRecord | null>(null);
  const [attemptKey, setAttemptKey] = useState(0);
  const [confetti, setConfetti] = useState(false);

  if (!course || course.status !== "published" || !course.finalTest?.length) {
    return (
      <main className="min-h-screen lib-felt">
        <LibraryHeader title="Final test" fallback={`/library/${courseId}`} />
        <p className="max-w-lg mx-auto px-5 py-10 text-center text-sm" style={{ color: "var(--foreground-muted)" }}>This test isn&rsquo;t available yet.</p>
      </main>
    );
  }

  const threshold = passThresholdFor(course);
  const size = course.finalTestSize ?? 10;

  function start() {
    setQuestions(sampleQuestions(course!.finalTest!, size));
    setFinished(false);
    setCert(null);
    setPhase("taking");
    setAttemptKey((k) => k + 1);
  }

  async function handleComplete(score: QuizScore) {
    const didPass = score.fraction >= threshold;
    setPassed(didPass);
    setFinished(true);
    const issued = await recordFinalResult(courseId, course!.title, score.fraction, didPass);
    if (issued) setCert(issued);
    if (didPass) {
      setConfetti(true);
      setTimeout(() => setConfetti(false), 4500);
      detectNewAchievements().then((fresh) => {
        if (fresh[0]) toast.success(`🏆 ${fresh[0].title} unlocked!`);
      });
    }
  }

  return (
    <main className="min-h-screen lib-felt">
      {confetti && <Confetti />}
      <LibraryHeader
        title={`${course.title} — Final Test`}
        fallback={`/library/${courseId}`}
        crumbs={[{ label: "Library", href: "/library" }, { label: course.title, href: `/library/${courseId}` }]}
        accent={domainAccent(course.domain)}
      />
      <div className="max-w-lg mx-auto px-5 py-6 pb-28">
        {phase === "intro" && (
          <div className="rounded-2xl p-6 text-center" style={{ backgroundColor: "var(--background-card)", border: "1px solid var(--border-card)" }}>
            <div className="text-3xl mb-3" aria-hidden="true">📝</div>
            <h2 className="text-[18px] font-semibold mb-2" style={{ color: "var(--foreground)", fontFamily: "var(--font-display)" }}>Final Test</h2>
            <p className="text-[13px] leading-relaxed mb-5" style={{ color: "var(--foreground-secondary)" }}>
              {size} questions, drawn at random from a larger bank. You need <strong style={{ color: "var(--foreground)" }}>{Math.round(threshold * 100)}%</strong> to pass and earn your certificate. You can retake it as many times as you like.
            </p>
            <button onClick={start} className="w-full py-3 rounded-xl text-[14px] font-medium active:scale-[0.99] transition-transform" style={{ backgroundColor: "var(--btn-primary-bg)", color: "var(--btn-primary-text)" }}>
              Begin test
            </button>
          </div>
        )}

        {phase === "taking" && (
          <>
            <Quiz key={attemptKey} questions={questions} onComplete={handleComplete} passThreshold={threshold} title="Final test" />

            {finished && (
              <div className="mt-6 flex flex-col gap-3">
                {passed ? (
                  <>
                    {cert && <Certificate cert={cert} />}
                    <Link href={`/library/${courseId}`} className="block text-center w-full py-3 rounded-xl text-[14px] font-medium" style={{ backgroundColor: "var(--background-card)", border: "1px solid var(--border-card)", color: "var(--foreground)" }}>
                      Back to course
                    </Link>
                  </>
                ) : (
                  <>
                    <div className="rounded-xl px-4 py-3" style={{ backgroundColor: "var(--tag-bg)" }}>
                      <p className="text-[13px] leading-relaxed" style={{ color: "var(--foreground-secondary)" }}>
                        Almost there. Revisit the lessons, then take a fresh set of questions.
                      </p>
                    </div>
                    <button onClick={start} className="block text-center w-full py-3 rounded-xl text-[14px] font-medium active:scale-[0.99] transition-transform" style={{ backgroundColor: "var(--btn-primary-bg)", color: "var(--btn-primary-text)" }}>
                      Retake test
                    </button>
                    <Link href={`/library/${courseId}`} className="block text-center w-full py-2.5 text-[12px]" style={{ color: "var(--foreground-muted)" }}>
                      Review the lessons
                    </Link>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
