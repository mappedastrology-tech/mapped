"use client";

import { useMemo, useState } from "react";
import type { QuizQuestion, LessonBlock } from "@/lib/learn/types";
import { scoreQuiz, shuffle, isRecallCorrect, answeredCorrectly, type QuizScore } from "@/lib/learn/quiz";
import LessonBlocks from "./LessonBlocks";

/**
 * Shared quiz runner. Presents multiple-choice questions one at a time, then any
 * interactive `activities` (sort/flip/wheel/diagram) as the final question(s).
 * Activities aren't graded — they're a hands-on "do" step in the check.
 */
export default function Quiz({
  questions,
  onComplete,
  passThreshold,
  title,
  retry = false,
  activities,
}: {
  questions: QuizQuestion[];
  onComplete?: (score: QuizScore, answers: Record<string, string>) => void;
  /** When set, the results screen shows pass/fail against this fraction (0..1). */
  passThreshold?: number;
  title?: string;
  /** Lesson "quick check" mode: wrong answers let you try again, then reveal. */
  retry?: boolean;
  /** Interactive blocks shown as the last question(s), after the MCQs. */
  activities?: LessonBlock[];
}) {
  const MAX_TRIES = 2;
  const prepared = useMemo(
    () => questions.map((q) => ({ ...q, options: shuffle(q.options) })),
    [questions],
  );

  type PreparedQ = (typeof prepared)[number];
  type Item = { kind: "q"; q: PreparedQ } | { kind: "activity"; block: LessonBlock };
  const items: Item[] = [
    ...prepared.map((q) => ({ kind: "q" as const, q })),
    ...(activities ?? []).map((block) => ({ kind: "activity" as const, block })),
  ];

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [revealed, setRevealed] = useState(false);
  const [wrongPicks, setWrongPicks] = useState<Set<string>>(new Set());
  const [typed, setTyped] = useState(""); // recall (type-the-answer) input
  const [done, setDone] = useState(false);

  const current = items[index];
  const q = current?.kind === "q" ? current.q : undefined;
  const isRecall = q?.type === "recall";
  const chosen = q ? answers[q.id] : undefined;
  const chosenOpt = q?.options.find((o) => o.id === chosen);
  const correctOpt = q?.options.find((o) => o.correct);
  const isLast = index === items.length - 1;
  const missed = retry && revealed && !!chosenOpt && !chosenOpt.correct;
  const recallRight = !!isRecall && revealed && !!q && isRecallCorrect(q, chosen ?? "");

  function advance() {
    if (isLast) {
      setDone(true);
      onComplete?.(scoreQuiz(prepared, answers), answers);
    } else {
      setIndex((i) => i + 1);
      setRevealed(false);
      setWrongPicks(new Set());
      setTyped("");
    }
  }

  function submitRecall() {
    if (revealed || !q || !typed.trim()) return;
    setAnswers((a) => ({ ...a, [q.id]: typed }));
    setRevealed(true);
  }

  function choose(optId: string) {
    if (revealed || !q) return;
    if (!retry) {
      setAnswers((a) => ({ ...a, [q.id]: optId }));
      setRevealed(true);
      return;
    }
    const opt = q.options.find((o) => o.id === optId);
    if (opt?.correct) {
      setAnswers((a) => ({ ...a, [q.id]: optId }));
      setRevealed(true);
    } else {
      const next = new Set(wrongPicks).add(optId);
      setWrongPicks(next);
      if (next.size >= MAX_TRIES) {
        setAnswers((a) => ({ ...a, [q.id]: optId }));
        setRevealed(true);
      }
    }
  }

  if (done) {
    const score = scoreQuiz(prepared, answers);
    const pct = Math.round(score.fraction * 100);
    const passed = passThreshold != null ? score.fraction >= passThreshold : null;
    const celebrate = passed === true || (passThreshold == null && score.fraction >= 0.8);
    return (
      <div className="relative rounded-2xl p-6 text-center overflow-hidden" style={{ backgroundColor: "var(--background-card)", border: `1px solid ${celebrate ? "var(--sage)" : "var(--border-card)"}`, boxShadow: "var(--card-shadow)" }}>
        {celebrate && (
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            {[
              { l: "12%", t: "18%", d: "0ms", c: "var(--brass)" },
              { l: "82%", t: "16%", d: "120ms", c: "var(--sage-light)" },
              { l: "20%", t: "60%", d: "240ms", c: "var(--brass-light)" },
              { l: "78%", t: "58%", d: "360ms", c: "var(--sage)" },
              { l: "50%", t: "10%", d: "180ms", c: "var(--brass)" },
            ].map((s, i) => (
              <span key={i} className="absolute text-[12px] animate-ping" style={{ left: s.l, top: s.t, color: s.c, animationDelay: s.d, animationDuration: "1.4s" }}>✦</span>
            ))}
          </div>
        )}
        <p className="relative text-[11px] uppercase tracking-widest mb-2" style={{ color: "var(--foreground-muted)" }}>
          {passThreshold != null ? "Result" : "Quiz complete"}
        </p>
        <p className="relative text-5xl font-bold mb-1 animate-in zoom-in duration-300" style={{ color: celebrate ? "var(--sage-light)" : "var(--foreground)", fontFamily: "var(--font-display)" }}>{pct}%</p>
        <p className="relative text-sm mb-3" style={{ color: "var(--foreground-secondary)" }}>
          {score.correct} of {score.total} correct
        </p>
        {passed === true && (
          <p className="relative text-sm font-semibold" style={{ color: "var(--sage-light)" }}>🎉 Passed — nicely done.</p>
        )}
        {passed === false && (
          <p className="relative text-sm font-medium" style={{ color: "var(--terracotta)" }}>
            Not quite — {Math.round((passThreshold ?? 0) * 100)}% needed. Review and try again.
          </p>
        )}
        {passed === null && celebrate && (
          <p className="relative text-sm font-semibold" style={{ color: "var(--sage-light)" }}>✨ Nicely done!</p>
        )}
      </div>
    );
  }

  if (!current) return null;

  return (
    <div className="rounded-2xl p-5" style={{ backgroundColor: "var(--background-card)", border: "1px solid var(--border-card)" }} role="group" aria-label={title || "Quiz"}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] uppercase tracking-widest" style={{ color: "var(--foreground-muted)" }}>
          {title ? `${title} · ` : ""}Question {index + 1} of {items.length}
        </span>
      </div>
      {/* Progress dots */}
      <div className="flex gap-1 mb-4">
        {items.map((it, j) => {
          let bg = "var(--border)";
          if (j === index) bg = "var(--brass)";
          if (j < index || (j === index && it.kind === "q" && revealed)) {
            if (it.kind === "q") {
              const ans = answers[it.q.id];
              bg = answeredCorrectly(it.q, ans) ? "var(--sage)" : ans ? "var(--oxblood-light)" : "var(--brass)";
            } else bg = "var(--brass)";
          }
          return <span key={j} className="h-1.5 flex-1 rounded-full transition-colors" style={{ backgroundColor: bg }} />;
        })}
      </div>

      {current.kind === "activity" ? (
        <>
          <LessonBlocks blocks={[current.block]} />
          <button
            onClick={advance}
            className="mt-4 w-full py-3 rounded-xl text-[14px] font-medium transition-transform active:scale-[0.99]"
            style={{ backgroundColor: "var(--btn-primary-bg)", color: "var(--btn-primary-text)" }}
          >
            {isLast ? "See result" : "Next question"}
          </button>
        </>
      ) : q && isRecall ? (
        <>
          <p className="text-[18px] mb-2 leading-snug" style={{ color: "var(--foreground)", fontFamily: "var(--font-display)" }}>{q.prompt}</p>
          <p className="text-[11px] mb-3" style={{ color: "var(--foreground-muted)" }}>Type your answer — spelling is forgiving.</p>

          <input
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") submitRecall(); }}
            disabled={revealed}
            placeholder="Your answer…"
            aria-label="Your answer"
            autoComplete="off"
            className="w-full px-4 py-3 rounded-xl text-[15px] outline-none disabled:opacity-90"
            style={{ backgroundColor: "var(--background-elevated)", border: `1.5px solid ${revealed ? (recallRight ? "var(--sage)" : "var(--oxblood-light)") : "var(--border-card)"}`, color: "var(--foreground)" }}
          />

          {revealed && (
            <p className="mt-3 text-[13px] leading-relaxed px-1" style={{ color: "var(--foreground-secondary)" }}>
              {recallRight ? (
                <span style={{ color: "var(--sage-light)", fontWeight: 600 }}>Correct ✓ </span>
              ) : (
                <><span style={{ color: "var(--oxblood-light)", fontWeight: 600 }}>Answer: </span><span style={{ color: "var(--foreground)" }}>{q.answer}</span>. </>
              )}
              {q.explanation}
            </p>
          )}

          {!revealed ? (
            <button
              onClick={submitRecall}
              disabled={!typed.trim()}
              className="mt-4 w-full py-3 rounded-xl text-[14px] font-medium transition-transform active:scale-[0.99] disabled:opacity-40"
              style={{ backgroundColor: "var(--btn-primary-bg)", color: "var(--btn-primary-text)" }}
            >
              Check
            </button>
          ) : (
            <button
              onClick={advance}
              className="mt-4 w-full py-3 rounded-xl text-[14px] font-medium transition-transform active:scale-[0.99]"
              style={{ backgroundColor: "var(--btn-primary-bg)", color: "var(--btn-primary-text)" }}
            >
              {isLast ? "See result" : "Next question"}
            </button>
          )}
        </>
      ) : q ? (
        <>
          <p className="text-[18px] mb-4 leading-snug" style={{ color: "var(--foreground)", fontFamily: "var(--font-display)" }}>{q.prompt}</p>

          <div className="flex flex-col gap-2">
            {q.options.map((o) => {
              const isChosen = chosen === o.id;
              const triedWrong = wrongPicks.has(o.id);
              const showCorrect = revealed && o.correct;
              const showWrong = (revealed && isChosen && !o.correct) || triedWrong;
              const disabled = revealed || triedWrong;
              const border = showCorrect ? "var(--sage)" : showWrong ? "var(--oxblood-light)" : isChosen ? "var(--brass)" : "var(--border-card)";
              const bg = showCorrect ? "var(--tag-green-bg)" : showWrong ? "rgba(122,48,40,0.15)" : "var(--background-elevated)";
              return (
                <button
                  key={o.id}
                  onClick={() => choose(o.id)}
                  disabled={disabled}
                  className="text-left px-4 py-3 rounded-xl text-sm transition-colors disabled:cursor-default"
                  style={{ backgroundColor: bg, border: `1.5px solid ${border}`, color: "var(--foreground)", opacity: triedWrong && !revealed ? 0.55 : 1 }}
                >
                  <span className="flex items-center gap-2">
                    {revealed && o.correct && <span style={{ color: "var(--sage-light)" }} aria-hidden="true">✓</span>}
                    {showWrong && <span style={{ color: "var(--oxblood-light)" }} aria-hidden="true">✗</span>}
                    <span>{o.text}</span>
                  </span>
                </button>
              );
            })}
          </div>

          {retry && !revealed && wrongPicks.size > 0 && (
            <p className="mt-3 text-[13px] font-medium px-1" style={{ color: "var(--terracotta)" }}>
              Not quite — give it another try.
            </p>
          )}

          {revealed && (missed ? correctOpt?.explanation : chosenOpt?.explanation) && (
            <p className="mt-3 text-[13px] leading-relaxed px-1" style={{ color: "var(--foreground-secondary)" }}>
              {missed && <span style={{ color: "var(--brass)", fontWeight: 600 }}>Remember: </span>}
              {missed ? correctOpt?.explanation : chosenOpt?.explanation}
            </p>
          )}

          {missed && (
            <p className="mt-2 text-[12px] px-1" style={{ color: "var(--foreground-muted)" }}>
              ↑ Scroll up to revisit the lesson, then keep going.
            </p>
          )}

          {revealed && (
            <button
              onClick={advance}
              className="mt-4 w-full py-3 rounded-xl text-[14px] font-medium transition-transform active:scale-[0.99]"
              style={{ backgroundColor: "var(--btn-primary-bg)", color: "var(--btn-primary-text)" }}
            >
              {isLast ? "See result" : "Next question"}
            </button>
          )}
        </>
      ) : null}
    </div>
  );
}
