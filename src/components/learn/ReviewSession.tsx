"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { buildReviewCards, nextIntervalForGrade, type ReviewCard, type ReviewGrade } from "@/lib/learn/review";
import { getDueReviews, recordReviewGrade } from "@/lib/learn/reviewStore";
import { awardXp } from "@/lib/learn/activityStore";
import { loadEngagement } from "@/lib/learn/engagement";
import { XP_REVIEW } from "@/lib/learn/stats";
import { DOMAINS } from "@/lib/learn/registry";
import { LessonProgressHeader, PrimaryPill } from "./LessonChrome";
import OfflineNotice from "./OfflineNotice";

type Phase = "loading" | "empty" | "taking" | "done";

/**
 * Daily review (design frame U).
 *
 * This is a reveal-and-rate flashcard deck, not the multiple-choice quiz it
 * used to be. The change is the design's, but the machinery for it was already
 * in the repo and simply unused: review.ts has built flashcards
 * (buildReviewCards) and graded them (nextIntervalForGrade) since spaced
 * repetition landed, and reviewStore has persisted a self-rating
 * (recordReviewGrade). Only the screen was missing.
 *
 * Rating honestly matters more than answering correctly here, which is the
 * argument for the change: recognising an answer among three options is a much
 * weaker test of recall than producing it from memory and then admitting
 * whether you had it.
 */
export default function ReviewSession() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("loading");
  const [cards, setCards] = useState<ReviewCard[]>([]);
  const [idx, setIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [streak, setStreak] = useState(0);
  const [tally, setTally] = useState<Record<ReviewGrade, number>>({ again: 0, good: 0, easy: 0 });

  useEffect(() => {
    let active = true;
    Promise.all([getDueReviews(), loadEngagement()]).then(([due, eng]) => {
      if (!active) return;
      setStreak(eng.stats.streak);
      const built = buildReviewCards(due);
      if (built.length === 0) { setPhase("empty"); return; }
      setCards(built);
      setPhase("taking");
    });
    return () => { active = false; };
  }, []);

  const card = cards[idx];
  const total = cards.length;
  const lessonCount = useMemo(
    () => new Set(cards.map((c) => `${c.review.courseId}::${c.review.lessonId}`)).size,
    [cards],
  );

  /**
   * How long each rating pushes this card out, asked of the scheduler rather
   * than written down here. The design's frame says "< 1 min / 1 day / 4 days";
   * those are that mock's numbers, and hard-coding them would quietly lie to
   * the reader the first time the schedule is tuned.
   */
  const intervalLabels = useMemo(() => {
    const label = (grade: ReviewGrade) => {
      if (grade === "again") return "< 1 min";
      const days = nextIntervalForGrade(1, grade);
      return days === 1 ? "1 day" : `${days} days`;
    };
    return { again: label("again"), good: label("good"), easy: label("easy") };
  }, []);

  async function rate(grade: ReviewGrade) {
    if (!card) return;
    setTally((t) => ({ ...t, [grade]: t[grade] + 1 }));
    void recordReviewGrade(card.review.courseId, card.review.lessonId, grade);

    if (idx + 1 >= total) {
      setPhase("done");
      if (lessonCount > 0) void awardXp(lessonCount * XP_REVIEW, lessonCount);
    } else {
      setIdx(idx + 1);
      setRevealed(false);
    }
  }

  const domainMeta = card ? DOMAINS.find((d) => d.id === card.domain) : undefined;

  return (
    <main className="min-h-screen lib-felt">
      <div className="max-w-lg mx-auto pb-28">
        <OfflineNotice />
        {phase === "loading" && (
          <p className="text-center text-sm py-10" style={{ color: "var(--lib-muted)" }}>Loading your review…</p>
        )}

        {/* Edge state 5 — nothing due. */}
        {phase === "empty" && (
          <div style={{ padding: "48px 24px 0" }} className="text-center">
            <div className="lib-floaty" style={{ fontSize: 44 }} aria-hidden="true">🌙</div>
            <h2
              className="uppercase"
              style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 500, letterSpacing: "0.07em", color: "var(--lib-ink)", marginTop: 14 }}
            >
              All caught up
            </h2>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 13, lineHeight: 1.6, color: "var(--lib-body)", marginTop: 10 }}>
              No cards due — the next batch surfaces tomorrow.
            </p>
            {streak > 0 && (
              <span
                className="inline-flex items-center gap-1.5 mt-5 px-4 py-2"
                style={{ borderRadius: 999, background: "rgba(201,169,97,0.12)" }}
              >
                <span className="lib-flame" style={{ fontSize: 14 }} aria-hidden="true">🔥</span>
                <span style={{ fontFamily: "var(--font-serif-lib)", fontWeight: 700, fontSize: 15, color: "var(--lib-ink)" }}>{streak}</span>
                <span className="uppercase" style={{ fontFamily: "var(--font-body)", fontSize: 9, letterSpacing: "0.1em", color: "var(--lib-muted)" }}>streak held</span>
              </span>
            )}
            <div className="mt-6 flex justify-center">
              <PrimaryPill onClick={() => router.push("/library")}>Back to Learn</PrimaryPill>
            </div>
          </div>
        )}

        {phase === "taking" && card && (
          <>
            <LessonProgressHeader
              progress={(idx + (revealed ? 1 : 0)) / total}
              label={`${idx + 1} / ${total}`}
              onClose={() => router.push("/library")}
              closeLabel="Leave review"
            />

            <div className="text-center" style={{ paddingTop: 18 }}>
              <p className="uppercase" style={{ fontFamily: "var(--font-body)", fontSize: 9, fontWeight: 700, letterSpacing: "0.2em", color: "var(--brass)" }}>
                Daily review
              </p>
              {streak > 0 && (
                <span className="inline-flex items-center gap-1.5 mt-2 px-3 py-1.5" style={{ borderRadius: 999, background: "rgba(201,169,97,0.12)" }}>
                  <span className="lib-flame" style={{ fontSize: 14 }} aria-hidden="true">🔥</span>
                  <span style={{ fontFamily: "var(--font-serif-lib)", fontWeight: 700, fontSize: 16, color: "var(--lib-ink)" }}>{streak}</span>
                  <span className="uppercase" style={{ fontFamily: "var(--font-body)", fontSize: 9, letterSpacing: "0.1em", color: "var(--lib-muted)" }}>day streak</span>
                </span>
              )}
            </div>

            {/* The card. Tapping it reveals, as well as the pill below. */}
            <button
              onClick={() => setRevealed(true)}
              disabled={revealed}
              className={revealed ? "w-full text-left" : "lib-press w-full text-left"}
              style={{
                display: "block", margin: "18px 24px 0", width: "calc(100% - 48px)",
                padding: "20px 20px 22px", borderRadius: 20,
                background: "var(--lib-card)",
                border: "0.5px solid color-mix(in srgb, var(--brass) 16%, transparent)",
                boxShadow: "var(--lib-card-shadow)",
              }}
            >
              <span className="flex items-center gap-2">
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: domainMeta?.accent ?? "var(--brass)" }} aria-hidden="true" />
                <span className="uppercase" style={{ fontFamily: "var(--font-body)", fontSize: 9, fontWeight: 700, letterSpacing: "0.18em", color: domainMeta?.accent ?? "var(--brass)" }}>
                  {domainMeta?.title ?? card.domain}
                </span>
              </span>

              <span
                className="block uppercase"
                style={{ fontFamily: "var(--font-display)", fontSize: 19, fontWeight: 500, letterSpacing: "0.05em", lineHeight: 1.2, color: "var(--lib-ink)", marginTop: 12 }}
              >
                {card.front}
              </span>

              {revealed ? (
                <>
                  <span className="block" style={{ height: 1, background: "var(--lib-rule)", margin: "16px 0 14px" }} />
                  <span style={{ display: "block", fontFamily: "var(--font-body)", fontSize: 14, lineHeight: 1.65, color: "var(--lib-ink)" }}>
                    {card.back}
                  </span>
                  {card.detail && (
                    <span style={{ display: "block", fontFamily: "var(--font-body)", fontSize: 12.5, lineHeight: 1.6, color: "var(--lib-body)", marginTop: 8 }}>
                      {card.detail}
                    </span>
                  )}
                </>
              ) : (
                <span style={{ display: "block", fontFamily: "var(--font-body)", fontSize: 11.5, color: "var(--lib-muted)", marginTop: 14 }}>
                  Tap the card to reveal the answer
                </span>
              )}
            </button>

            <div style={{ padding: "0 24px" }}>
              {!revealed ? (
                <div style={{ marginTop: 18 }}>
                  <PrimaryPill full arrow={false} onClick={() => setRevealed(true)}>Reveal answer</PrimaryPill>
                </div>
              ) : (
                <div className="grid grid-cols-3" style={{ gap: 9, marginTop: 18 }}>
                  {([
                    ["again", "Again", "rgba(122,48,40,0.16)", "#e0a99a"],
                    ["good", "Good", "rgba(201,169,97,0.14)", "#d4b878"],
                    ["easy", "Easy", "rgba(90,122,58,0.16)", "var(--sage-bright)"],
                  ] as const).map(([grade, label, bg, fg]) => (
                    <button
                      key={grade}
                      onClick={() => rate(grade)}
                      className="lib-press flex flex-col items-center justify-center"
                      style={{ padding: "11px 4px", borderRadius: 13, minHeight: 44, background: bg, border: `0.5px solid ${fg}`, color: fg }}
                    >
                      <span style={{ fontFamily: "var(--font-body)", fontSize: 12.5, fontWeight: 700 }}>{label}</span>
                      <span style={{ fontFamily: "var(--font-body)", fontSize: 9.5, opacity: 0.8, marginTop: 2 }}>{intervalLabels[grade]}</span>
                    </button>
                  ))}
                </div>
              )}

              <p className="text-center" style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--lib-muted)", marginTop: 14, lineHeight: 1.5 }}>
                {revealed
                  ? "Rate honestly — it tunes when each card returns."
                  : `${total} ${total === 1 ? "card" : "cards"} due in today's review.`}
              </p>
            </div>
          </>
        )}

        {phase === "done" && (
          <div className="text-center" style={{ padding: "48px 24px 0" }}>
            <div className="lib-floaty" style={{ fontSize: 44 }} aria-hidden="true">🌙</div>
            <h2
              className="uppercase"
              style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 500, letterSpacing: "0.07em", color: "var(--lib-ink)", marginTop: 14 }}
            >
              Review complete
            </h2>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--lib-body)", marginTop: 10 }}>
              {total} {total === 1 ? "card" : "cards"} reviewed
              {streak > 0 && ` · streak ${streak} → ${streak + 1}`}
            </p>

            <div className="flex justify-center flex-wrap gap-2 mt-5">
              {(["again", "good", "easy"] as const).map((g) => (
                <span
                  key={g}
                  className="px-3 py-1.5"
                  style={{ borderRadius: 999, background: "var(--lib-track)", fontFamily: "var(--font-body)", fontSize: 11, color: "var(--lib-body)" }}
                >
                  <span className="capitalize">{g}</span> · {tally[g]}
                </span>
              ))}
            </div>

            <div className="inline-flex items-center gap-1.5 mt-5 px-4 py-2" style={{ borderRadius: 999, background: "rgba(201,169,97,0.14)" }}>
              <span style={{ fontFamily: "var(--font-serif-lib)", fontWeight: 700, fontSize: 15, color: "var(--brass-light)" }}>
                +{lessonCount * XP_REVIEW} XP
              </span>
            </div>

            <p style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--lib-muted)", marginTop: 16 }}>
              Next review unlocks tomorrow ✦
            </p>

            <div className="mt-6 flex justify-center">
              <PrimaryPill onClick={() => router.push("/library")}>Done</PrimaryPill>
            </div>
            <Link href="/library" className="block text-center mt-3" style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--lib-muted)" }}>
              Back to Learn
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
