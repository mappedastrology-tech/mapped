"use client";

/**
 * The end-of-lesson moment.
 *
 * What used to be here: a 12px chip reading "Lesson complete · +15 XP". The
 * streak advancing, the daily goal being met, a level turning over — all of it
 * happened silently on a screen you had to navigate away to find. That is the
 * one beat in the loop where effort has just been spent and the payoff should
 * land, and it was the quietest part of the app.
 *
 * Everything shown is a real fact from the user's own progress. Nothing here
 * invents a number to look impressive.
 */

import { useEffect, useState } from "react";
import type { SessionSummary } from "@/lib/learn/sessionSummary";
import type { Achievement } from "@/lib/learn/achievements";
import Confetti from "./Confetti";

export default function LessonComplete({
  summary,
  achievements,
  accent,
}: {
  summary: SessionSummary;
  achievements: Achievement[];
  accent: string;
}) {
  // Confetti is rationed. If it fires for every lesson it stops meaning
  // anything, so it is kept for the three things that genuinely only happen
  // once in a while.
  const bigMoment = summary.goalJustMet || summary.leveledUp || achievements.length > 0;
  const [showConfetti, setShowConfetti] = useState(false);
  useEffect(() => {
    if (!bigMoment) return;
    setShowConfetti(true);
    const t = setTimeout(() => setShowConfetti(false), 4000);
    return () => clearTimeout(t);
  }, [bigMoment]);

  const goalPct = summary.goalXp > 0
    ? Math.min(100, Math.round((summary.goalProgressAfter / summary.goalXp) * 100))
    : 0;
  const beforePct = summary.goalXp > 0
    ? Math.min(100, Math.round((summary.goalProgressBefore / summary.goalXp) * 100))
    : 0;

  return (
    <div
      className="relative mt-6 rounded-2xl overflow-hidden p-5 animate-in fade-in zoom-in-95 duration-300"
      style={{ backgroundColor: "var(--background-card)", border: `1px solid ${accent}`, boxShadow: "var(--card-shadow)" }}
    >
      {showConfetti && <Confetti />}

      <p className="relative text-[11px] uppercase tracking-[0.18em] text-center" style={{ color: "var(--foreground-muted)" }}>
        Lesson complete
      </p>

      {/* XP — the headline */}
      {/* The number and the unit are separate flex children rather than inline
          siblings: JS Chanok's advance widths let the "XP" tuck under the last
          digit when they share a line box. */}
      <p className="relative flex items-baseline justify-center gap-2 mt-2">
        <span className="text-[40px] leading-none font-bold" style={{ color: accent, fontFamily: "var(--font-display)" }}>
          +{summary.xpEarned}
        </span>
        <span className="text-[15px] font-semibold" style={{ color: accent, fontFamily: "var(--font-ui)" }}>XP</span>
      </p>

      {summary.perfect ? (
        <p className="relative text-center text-[12.5px] mt-2 font-semibold" style={{ color: "var(--sage-light)" }}>
          ✦ Flawless — {summary.firstTry.total}/{summary.firstTry.total} first try, +{summary.perfectBonus} bonus
        </p>
      ) : summary.firstTry.total > 0 ? (
        <p className="relative text-center text-[12px] mt-2" style={{ color: "var(--foreground-muted)" }}>
          {summary.firstTry.correct} of {summary.firstTry.total} right first try
        </p>
      ) : null}

      {/* Daily goal — the bar visibly moves from where it was */}
      <div className="relative mt-5">
        <div className="flex justify-between items-baseline mb-1.5">
          <span className="text-[10px] uppercase tracking-[0.16em] font-semibold" style={{ color: "var(--foreground-muted)" }}>
            Today&rsquo;s goal
          </span>
          <span className="text-[11.5px] font-semibold" style={{ color: summary.goalProgressAfter >= summary.goalXp ? "var(--sage-light)" : "var(--foreground-secondary)" }}>
            {Math.min(summary.goalProgressAfter, summary.goalXp)} / {summary.goalXp} XP
          </span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--lib-track)" }}>
          <div
            className="h-full rounded-full"
            style={{
              width: `${goalPct}%`,
              background: summary.goalProgressAfter >= summary.goalXp ? "var(--sage)" : accent,
              // Starts at the old value and animates to the new one, so the
              // bar is seen moving rather than just being further along.
              animation: `lc-fill 900ms cubic-bezier(.2,.8,.2,1) both`,
              ["--lc-from" as string]: `${beforePct}%`,
            }}
          />
        </div>
        <style>{`@keyframes lc-fill { from { width: var(--lc-from); } }`}</style>
        {summary.goalJustMet && (
          <p className="text-[12.5px] font-semibold mt-2 text-center" style={{ color: "var(--sage-light)" }}>
            🎯 Daily goal met — that&rsquo;s today done.
          </p>
        )}
      </div>

      {/* Streak and level, only when they actually changed */}
      {(summary.streakAdvanced || summary.leveledUp) && (
        <div className="relative flex gap-2 mt-4">
          {summary.streakAdvanced && (
            <div className="flex-1 rounded-xl px-3 py-2.5 text-center" style={{ background: "rgba(201,169,97,0.12)", border: "0.5px solid var(--brass)" }}>
              <p className="text-[17px] leading-none">🔥</p>
              <p className="text-[13px] font-bold mt-1" style={{ color: "var(--foreground)" }}>
                {summary.streak} day{summary.streak === 1 ? "" : "s"}
              </p>
              <p className="text-[10px] mt-0.5" style={{ color: "var(--foreground-muted)" }}>
                {summary.streak === 1 ? "Streak started" : "Streak extended"}
              </p>
            </div>
          )}
          {summary.leveledUp && (
            <div className="flex-1 rounded-xl px-3 py-2.5 text-center" style={{ background: "rgba(201,169,97,0.12)", border: "0.5px solid var(--brass)" }}>
              <p className="text-[17px] leading-none">⭐</p>
              <p className="text-[13px] font-bold mt-1" style={{ color: "var(--foreground)" }}>Level {summary.level}</p>
              <p className="text-[10px] mt-0.5" style={{ color: "var(--foreground-muted)" }}>Levelled up</p>
            </div>
          )}
        </div>
      )}

      {/* Achievements — a card each, not a toast that vanishes */}
      {achievements.map((a) => (
        <div key={a.id} className="relative flex items-center gap-3 mt-3 rounded-xl px-3.5 py-3" style={{ background: "rgba(201,169,97,0.10)", border: "0.5px solid var(--brass)" }}>
          <span className="text-[22px]" aria-hidden="true">{a.icon}</span>
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.16em] font-bold" style={{ color: "var(--brass)" }}>Achievement unlocked</p>
            <p className="text-[13.5px] font-semibold mt-0.5" style={{ color: "var(--foreground)" }}>{a.title}</p>
            <p className="text-[11.5px]" style={{ color: "var(--foreground-muted)" }}>{a.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
