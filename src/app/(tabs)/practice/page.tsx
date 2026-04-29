"use client";

/**
 * My Practice — the anti-streak cycle tracking view.
 *
 * Source: Mapped_Cycles_Tracking.md
 *
 * Shows:
 * 1. Current cycle (moon phase + rituals this cycle)
 * 2. Lunar cycles completed
 * 3. Seasonal cycles (with rest toggle)
 * 4. Zodiac season wheel
 * 5. Transits witnessed
 * 6. Totals (rituals, most-used mood word, most-used ritual)
 * 7. Weekly/monthly reports when available
 */

import { useState, useMemo } from "react";
import { getDailyEnergy } from "@/lib/celestialCalendar";
import {
  getAllCompletions,
  getCompletionsSince,
  calculateSeasonalCycles,
  calculateZodiacSeasons,
  calculateTransitsWitnessed,
  generateWeeklyReport,
  generateMonthlyReport,
  detectPractitionerType,
  markCycleAsRest,
  type CompletionRecord,
} from "@/lib/feedback";
import Link from "next/link";

export default function PracticePage() {
  const today = useMemo(() => new Date(), []);
  const energy = useMemo(() => getDailyEnergy(today), [today]);
  const completions = useMemo(() => getAllCompletions(), []);
  const recentCompletions = useMemo(() => getCompletionsSince(28), []);

  const seasonalCycles = useMemo(() => calculateSeasonalCycles(), []);
  const zodiacSeasons = useMemo(() => calculateZodiacSeasons(), []);
  const transits = useMemo(() => calculateTransitsWitnessed(), []);
  const weeklyReport = useMemo(() => generateWeeklyReport(), []);
  const monthlyReport = useMemo(() => generateMonthlyReport(), []);
  const practitionerType = useMemo(() => detectPractitionerType(completions), [completions]);

  const [showReport, setShowReport] = useState<"weekly" | "monthly" | null>(null);

  // ─── Derived stats ───────────────────────────────────────────────────

  const totalRituals = completions.length;

  const mostUsedMood = useMemo(() => {
    if (completions.length === 0) return null;
    const counts: Record<string, number> = {};
    completions.forEach((c) => {
      counts[c.moodWord] = (counts[c.moodWord] || 0) + 1;
    });
    return Object.entries(counts).sort(([, a], [, b]) => b - a)[0]?.[0] ?? null;
  }, [completions]);

  const mostUsedRitual = useMemo(() => {
    if (completions.length === 0) return null;
    const counts: Record<string, number> = {};
    completions.forEach((c) => {
      counts[c.ritualTitle] = (counts[c.ritualTitle] || 0) + 1;
    });
    return Object.entries(counts).sort(([, a], [, b]) => b - a)[0]?.[0] ?? null;
  }, [completions]);

  const engagedZodiacCount = zodiacSeasons.filter((z) => z.engaged).length;

  // ─── Empty state ─────────────────────────────────────────────────────

  if (completions.length === 0) {
    return (
      <main className="flex-1 flex flex-col px-5 py-6 max-w-lg mx-auto w-full pb-28">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-2xl text-foreground" style={{ fontFamily: "var(--font-display)" }}>
            My Practice
          </h1>
        </div>
        <p className="text-foreground/40 text-sm mb-8">Your cycles, your pace.</p>

        <div className="flex-1 flex items-center justify-center">
          <div className="text-center px-8">
            <div className="text-4xl mb-4">{energy.moonPhase.emoji}</div>
            <p className="text-foreground/50 text-[14px] leading-relaxed mb-2">
              Nothing here yet.
            </p>
            <p className="text-foreground/30 text-[12px] leading-relaxed mb-6">
              Complete your first ritual and your practice will start taking shape here —
              cycles, patterns, all of it. No rush.
            </p>
            <Link
              href="/learn"
              className="inline-block px-5 py-3 rounded-xl bg-terracotta/10 text-terracotta text-[13px] font-medium"
            >
              Browse rituals
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 flex flex-col px-5 py-6 max-w-lg mx-auto w-full pb-28">

      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl text-foreground" style={{ fontFamily: "var(--font-display)" }}>
          My Practice
        </h1>
      </div>
      <p className="text-foreground/40 text-sm mb-6">Your cycles, your pace.</p>

      {/* ═══ CURRENT CYCLE ═══ */}
      <div className="rounded-2xl bg-card/50 border border-foreground/12 p-5 mb-4">
        <div className="flex items-center gap-4">
          <span className="text-[40px]">{energy.moonPhase.emoji}</span>
          <div>
            <h2 className="text-foreground/80 text-[15px] font-medium">
              {energy.moonPhase.label}
            </h2>
            <p className="text-foreground/40 text-[11px]">
              {recentCompletions.length} ritual{recentCompletions.length !== 1 ? "s" : ""} this lunar cycle
            </p>
          </div>
        </div>
      </div>

      {/* ═══ SEASONAL CYCLES ═══ */}
      <div className="rounded-2xl bg-card/40 border border-foreground/10 p-4 mb-4">
        <h3 className="text-foreground/30 text-[10px] uppercase tracking-[0.15em] font-semibold mb-3">
          Seasonal Cycles
        </h3>
        <div className="grid grid-cols-4 gap-2">
          {seasonalCycles.map((s) => (
            <div
              key={s.season}
              className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border transition-all ${
                s.current
                  ? "bg-terracotta/5 border-terracotta/20"
                  : s.engaged
                    ? "bg-sage/5 border-sage/15"
                    : s.rested
                      ? "bg-foreground/3 border-foreground/8"
                      : "bg-card/30 border-foreground/6"
              }`}
            >
              <span className="text-[18px]">{s.icon}</span>
              <span className="text-foreground/50 text-[10px] font-medium">{s.season}</span>
              {s.current ? (
                <span className="text-terracotta text-[8px] font-bold uppercase">Now</span>
              ) : s.engaged ? (
                <span className="text-sage text-[8px] font-bold">✓</span>
              ) : s.rested ? (
                <span className="text-foreground/30 text-[8px]">Rested</span>
              ) : (
                <span className="text-foreground/15 text-[8px]">—</span>
              )}
            </div>
          ))}
        </div>
        {/* Rest toggle for current season */}
        {seasonalCycles.filter((s) => s.current && !s.engaged).length > 0 && (
          <button
            onClick={() => {
              const current = seasonalCycles.find((s) => s.current);
              if (current) markCycleAsRest(current.season, current.year);
            }}
            className="mt-3 text-foreground/25 text-[10px] hover:text-foreground/40 transition-colors"
          >
            Mark this season as intentional rest
          </button>
        )}
      </div>

      {/* ═══ ZODIAC SEASONS WHEEL ═══ */}
      <div className="rounded-2xl bg-card/40 border border-foreground/10 p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-foreground/30 text-[10px] uppercase tracking-[0.15em] font-semibold">
            Zodiac Seasons
          </h3>
          <span className="text-foreground/25 text-[10px]">
            {engagedZodiacCount} of 12
          </span>
        </div>
        <div className="grid grid-cols-6 gap-2">
          {zodiacSeasons.map((z) => (
            <div
              key={z.sign}
              className={`flex flex-col items-center gap-1 py-2 rounded-lg transition-all ${
                z.engaged ? "bg-terracotta/8" : "bg-foreground/3"
              }`}
            >
              <span className={`text-[18px] ${z.engaged ? "" : "opacity-25"}`}>
                {z.glyph}
              </span>
              <span className={`text-[8px] font-medium ${
                z.engaged ? "text-foreground/55" : "text-foreground/20"
              }`}>
                {z.sign.slice(0, 3)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ TRANSITS WITNESSED ═══ */}
      <div className="rounded-2xl bg-card/40 border border-foreground/10 p-4 mb-4">
        <h3 className="text-foreground/30 text-[10px] uppercase tracking-[0.15em] font-semibold mb-3">
          Transits Witnessed
        </h3>
        <div className="space-y-2">
          {transits.map((t) => (
            <div key={t.label} className="flex items-center gap-3">
              <span className="text-[16px] w-6 text-center">{t.icon}</span>
              <span className="text-foreground/55 text-[12px] font-medium flex-1">{t.label}</span>
              <span className="text-foreground/35 text-[12px] tabular-nums">{t.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ MOOD INSIGHTS ═══ */}
      {completions.length >= 3 && <MoodInsights completions={completions} />}

      {/* ═══ YOUR PATTERNS ═══ */}
      <div className="rounded-2xl bg-card/40 border border-foreground/10 p-4 mb-4">
        <h3 className="text-foreground/30 text-[10px] uppercase tracking-[0.15em] font-semibold mb-3">
          Your Patterns
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-foreground/40 text-[11px]">Total rituals</span>
            <span className="text-foreground/65 text-[13px] font-medium tabular-nums">{totalRituals}</span>
          </div>
          {mostUsedRitual && (
            <div className="flex items-center justify-between">
              <span className="text-foreground/40 text-[11px]">Most-used ritual</span>
              <span className="text-foreground/65 text-[12px] font-medium truncate ml-4 max-w-[160px] text-right">{mostUsedRitual}</span>
            </div>
          )}
          {mostUsedMood && (
            <div className="flex items-center justify-between">
              <span className="text-foreground/40 text-[11px]">Most-felt word</span>
              <span className="text-foreground/65 text-[13px] font-medium">{mostUsedMood}</span>
            </div>
          )}
          <div className="pt-2 border-t border-foreground/6">
            <div className="flex items-center gap-2">
              <span className="text-foreground/25 text-[10px] uppercase tracking-wider font-semibold">
                Practitioner type
              </span>
            </div>
            <p className="text-foreground/60 text-[13px] font-medium mt-1">{practitionerType.label}</p>
            <p className="text-foreground/35 text-[10px] mt-0.5">{practitionerType.description}</p>
          </div>
        </div>
      </div>

      {/* ═══ REPORTS ═══ */}
      {(weeklyReport || monthlyReport) && (
        <div className="rounded-2xl bg-card/40 border border-foreground/10 p-4 mb-4">
          <h3 className="text-foreground/30 text-[10px] uppercase tracking-[0.15em] font-semibold mb-3">
            Reports
          </h3>
          <div className="flex gap-2">
            {weeklyReport && (
              <button
                onClick={() => setShowReport(showReport === "weekly" ? null : "weekly")}
                className={`flex-1 py-3 rounded-xl border text-[12px] font-medium transition-all ${
                  showReport === "weekly"
                    ? "bg-terracotta/5 border-terracotta/20 text-terracotta"
                    : "bg-card/40 border-foreground/8 text-foreground/40"
                }`}
              >
                This week
              </button>
            )}
            {monthlyReport && (
              <button
                onClick={() => setShowReport(showReport === "monthly" ? null : "monthly")}
                className={`flex-1 py-3 rounded-xl border text-[12px] font-medium transition-all ${
                  showReport === "monthly"
                    ? "bg-terracotta/5 border-terracotta/20 text-terracotta"
                    : "bg-card/40 border-foreground/8 text-foreground/40"
                }`}
              >
                This month
              </button>
            )}
          </div>

          {/* Weekly report detail */}
          {showReport === "weekly" && weeklyReport && (
            <div className="mt-3 pt-3 border-t border-foreground/8 space-y-2">
              <p className="text-foreground/30 text-[10px]">{weeklyReport.dateRange}</p>
              <div className="flex items-center justify-between">
                <span className="text-foreground/40 text-[11px]">Rituals</span>
                <span className="text-foreground/60 text-[12px] font-medium">{weeklyReport.totalRituals}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-foreground/40 text-[11px]">Most-felt word</span>
                <span className="text-foreground/60 text-[12px] font-medium">{weeklyReport.mostFeltWord}</span>
              </div>
              {weeklyReport.bestFitRitual && (
                <div className="flex items-center justify-between">
                  <span className="text-foreground/40 text-[11px]">Best fit</span>
                  <span className="text-foreground/60 text-[12px] font-medium truncate ml-4 max-w-[160px] text-right">{weeklyReport.bestFitRitual}</span>
                </div>
              )}
            </div>
          )}

          {/* Monthly report detail */}
          {showReport === "monthly" && monthlyReport && (
            <div className="mt-3 pt-3 border-t border-foreground/8 space-y-2">
              <p className="text-foreground/30 text-[10px]">{monthlyReport.month}</p>
              <div className="flex items-center justify-between">
                <span className="text-foreground/40 text-[11px]">Rituals</span>
                <span className="text-foreground/60 text-[12px] font-medium">{monthlyReport.totalRituals}</span>
              </div>
              {monthlyReport.topRituals.length > 0 && (
                <div>
                  <span className="text-foreground/40 text-[11px]">Top rituals</span>
                  {monthlyReport.topRituals.map((r) => (
                    <p key={r.title} className="text-foreground/55 text-[11px] ml-2 mt-0.5">
                      {r.title} ({r.count}×)
                    </p>
                  ))}
                </div>
              )}
              {monthlyReport.moodWordCloud.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {monthlyReport.moodWordCloud.slice(0, 6).map((w) => (
                    <span
                      key={w.word}
                      className="px-2 py-1 rounded-lg bg-foreground/5 text-foreground/45 text-[10px]"
                    >
                      {w.word} ({w.count})
                    </span>
                  ))}
                </div>
              )}
              <p className="text-foreground/40 text-[11px] italic pt-1">
                {monthlyReport.observation}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Quiet footer */}
      <div className="text-center py-4">
        <p className="text-foreground/20 text-[10px]">
          A cycle is something you can return to, not something you can break.
        </p>
      </div>
    </main>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Mood Insights — visual mood distribution + contextual patterns
// ═══════════════════════════════════════════════════════════════════════════

const CATEGORY_META: Record<string, { label: string; color: string; emoji: string }> = {
  heavy: { label: "Heavy", color: "#c44", emoji: "◯" },
  hard: { label: "Hard", color: "#5588cc", emoji: "◯" },
  neutral: { label: "Neutral", color: "#999", emoji: "◯" },
  soft_positive: { label: "Soft", color: "#cc88aa", emoji: "◯" },
  bright_positive: { label: "Bright", color: "#ccaa44", emoji: "◯" },
};

function MoodInsights({ completions }: { completions: CompletionRecord[] }) {
  // ─── Mood category distribution ────────────────────────────
  const categoryDist = useMemo(() => {
    const counts: Record<string, number> = {};
    completions.forEach((c) => {
      counts[c.moodCategory] = (counts[c.moodCategory] || 0) + 1;
    });
    const total = completions.length;
    return Object.entries(counts)
      .map(([cat, count]) => ({ cat, count, pct: Math.round((count / total) * 100) }))
      .sort((a, b) => b.count - a.count);
  }, [completions]);

  // ─── Top mood words ────────────────────────────────────────
  const topWords = useMemo(() => {
    const counts: Record<string, number> = {};
    completions.forEach((c) => {
      counts[c.moodWord] = (counts[c.moodWord] || 0) + 1;
    });
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([word, count]) => ({ word, count }));
  }, [completions]);

  // ─── Moon phase correlation ────────────────────────────────
  const moonInsight = useMemo(() => {
    if (completions.length < 5) return null;
    const byPhase: Record<string, { positive: number; total: number }> = {};
    completions.forEach((c) => {
      const phase = c.moonPhase.toLowerCase();
      if (!byPhase[phase]) byPhase[phase] = { positive: 0, total: 0 };
      byPhase[phase].total++;
      if (c.moodCategory === "soft_positive" || c.moodCategory === "bright_positive") {
        byPhase[phase].positive++;
      }
    });
    let bestPhase = "";
    let bestRatio = 0;
    Object.entries(byPhase).forEach(([phase, data]) => {
      if (data.total >= 2) {
        const ratio = data.positive / data.total;
        if (ratio > bestRatio) { bestRatio = ratio; bestPhase = phase; }
      }
    });
    if (bestPhase && bestRatio > 0.5) {
      return `You tend to feel lighter during ${bestPhase} moons.`;
    }
    return null;
  }, [completions]);

  // ─── Time of day correlation ───────────────────────────────
  const timeInsight = useMemo(() => {
    if (completions.length < 5) return null;
    const byTime: Record<string, { fit: number; total: number }> = {};
    completions.forEach((c) => {
      if (!byTime[c.timeOfDay]) byTime[c.timeOfDay] = { fit: 0, total: 0 };
      byTime[c.timeOfDay].total++;
      if (c.fitRating === "yes") byTime[c.timeOfDay].fit++;
    });
    let bestTime = "";
    let bestRatio = 0;
    Object.entries(byTime).forEach(([time, data]) => {
      if (data.total >= 2) {
        const ratio = data.fit / data.total;
        if (ratio > bestRatio) { bestRatio = ratio; bestTime = time; }
      }
    });
    if (bestTime && bestRatio > 0.5) {
      return `Rituals tend to land best for you in the ${bestTime}.`;
    }
    return null;
  }, [completions]);

  // ─── Fit rating trend ──────────────────────────────────────
  const fitInsight = useMemo(() => {
    if (completions.length < 5) return null;
    const yesCount = completions.filter((c) => c.fitRating === "yes").length;
    const pct = Math.round((yesCount / completions.length) * 100);
    if (pct >= 70) return `${pct}% of your rituals have felt like a fit. You're finding what works.`;
    if (pct <= 30) return `Only ${pct}% felt like a fit so far. It might be worth trying different modalities.`;
    return null;
  }, [completions]);

  const insights = [moonInsight, timeInsight, fitInsight].filter(Boolean);

  return (
    <div className="rounded-2xl bg-card/40 border border-foreground/10 p-4 mb-4">
      <h3 className="text-foreground/30 text-[10px] uppercase tracking-[0.15em] font-semibold mb-3">
        Mood Landscape
      </h3>

      {/* Category distribution bars */}
      <div className="space-y-2 mb-4">
        {categoryDist.map(({ cat, count, pct }) => {
          const meta = CATEGORY_META[cat] || { label: cat, color: "#888", emoji: "◯" };
          return (
            <div key={cat} className="flex items-center gap-2.5">
              <span className="text-foreground/40 text-[10px] w-12 text-right">{meta.label}</span>
              <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ backgroundColor: "var(--background-elevated)" }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(pct, 4)}%`, backgroundColor: meta.color, opacity: 0.6 }}
                />
              </div>
              <span className="text-foreground/30 text-[10px] w-8 tabular-nums">{pct}%</span>
            </div>
          );
        })}
      </div>

      {/* Top mood words */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {topWords.map(({ word, count }) => (
          <span
            key={word}
            className="px-2.5 py-1 rounded-lg text-[10px] font-medium"
            style={{ backgroundColor: "var(--background-elevated)", color: "var(--foreground-secondary)" }}
          >
            {word} <span style={{ color: "var(--foreground-faint)" }}>×{count}</span>
          </span>
        ))}
      </div>

      {/* Contextual insights */}
      {insights.length > 0 && (
        <div className="pt-3 border-t border-foreground/6 space-y-2">
          {insights.map((insight, i) => (
            <p key={i} className="text-foreground/45 text-[11px] leading-relaxed italic">
              ✦ {insight}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
