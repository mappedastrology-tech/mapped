"use client";

import { useState } from "react";
import Link from "next/link";
import { courseLessons, getCourse, passThresholdFor, domainAccent } from "@/lib/learn/registry";
import { sampleQuestions, type QuizScore } from "@/lib/learn/quiz";
import { recordFinalResult } from "@/lib/learn/progress";
import { detectNewAchievements } from "@/lib/learn/achievementsNotify";
import { useToast } from "@/components/Toast";
import type { CertificateRecord, QuizQuestion } from "@/lib/learn/types";
import LibraryHeader from "./LibraryHeader";
import { PrimaryPill } from "./LessonChrome";
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
  /** Kept so a near miss can show how near it was. */
  const [pct, setPct] = useState(0);
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
    setPct(Math.round(score.fraction * 100));
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
            <h2 className="text-[18px] font-semibold mb-2" style={{ color: "var(--foreground)", fontFamily: "var(--font-serif-lib)" }}>Final Test</h2>
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
                  /* Edge state 4 — short of the pass mark. The score ring
                     shows how close it was against the mark, because "almost"
                     reads very differently at 74% than at 30%. */
                  <>
                    <div className="text-center">
                      <div
                        className="mx-auto"
                        style={{
                          width: 104, height: 104, borderRadius: "50%",
                          // Conic fill to the score, with the pass mark cut in
                          // as a brass tick so the gap is visible, not implied.
                          background: `conic-gradient(var(--brass-light) 0 ${pct}%, var(--lib-track) ${pct}% 100%)`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          position: "relative",
                        }}
                        aria-hidden="true"
                      >
                        <span
                          style={{
                            position: "absolute", inset: 8, borderRadius: "50%",
                            background: "var(--lib-page)", display: "flex",
                            alignItems: "center", justifyContent: "center",
                          }}
                        >
                          <span style={{ fontFamily: "var(--font-display)", fontSize: 28, letterSpacing: "0.02em", color: "var(--lib-ink)" }}>{pct}%</span>
                        </span>
                      </div>
                      <p
                        className="uppercase"
                        style={{ fontFamily: "var(--font-display)", fontSize: 19, fontWeight: 500, letterSpacing: "0.07em", color: "var(--lib-ink)", marginTop: 16 }}
                      >
                        Almost — {Math.round(threshold * 100)}% to pass
                      </p>
                      <p style={{ fontFamily: "var(--font-body)", fontSize: 13, lineHeight: 1.6, color: "var(--lib-body)", marginTop: 8 }}>
                        Revisit the lessons, then take a fresh set of questions.
                      </p>

                      {/* The lessons to go back to, as chips. */}
                      <div className="flex flex-wrap justify-center gap-1.5 mt-4">
                        {courseLessons(course).slice(0, 5).map((l) => (
                          <Link
                            key={l.id}
                            href={`/library/${courseId}/${l.id}`}
                            className="lib-press"
                            style={{
                              padding: "7px 13px", borderRadius: 999,
                              fontFamily: "var(--font-serif-lib)", fontSize: 12.5,
                              background: "var(--lib-card)", color: "var(--lib-ink)",
                              border: "0.5px solid color-mix(in srgb, var(--brass) 25%, transparent)",
                            }}
                          >
                            {l.title}
                          </Link>
                        ))}
                      </div>

                      <div className="mt-6">
                        <PrimaryPill full arrow={false} onClick={start}>Review &amp; retake</PrimaryPill>
                      </div>
                    </div>
                    <Link href={`/library/${courseId}`} className="block text-center w-full py-2.5 text-[12px]" style={{ color: "var(--lib-muted)" }}>
                      Back to course
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
