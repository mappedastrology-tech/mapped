"use client";

import { useEffect, useState } from "react";
import { loadEngagement, type Engagement } from "@/lib/learn/engagement";
import { evaluateAchievements } from "@/lib/learn/achievements";
import { DAILY_GOALS, getGoalId, setDailyGoal } from "@/lib/learn/goals";
import LibraryHeader from "./LibraryHeader";

function GoalRing({ value, goal }: { value: number; goal: number }) {
  const pct = Math.min(1, goal > 0 ? value / goal : 0);
  const r = 34;
  const c = 2 * Math.PI * r;
  const done = pct >= 1;
  return (
    <svg width="84" height="84" viewBox="0 0 84 84" aria-hidden="true">
      <circle cx="42" cy="42" r={r} fill="none" stroke="var(--border)" strokeWidth="7" />
      <circle
        cx="42" cy="42" r={r} fill="none"
        stroke={done ? "var(--sage)" : "var(--brass)"} strokeWidth="7" strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={c * (1 - pct)} transform="rotate(-90 42 42)"
      />
      <text x="42" y="40" textAnchor="middle" fontSize="17" fontWeight="700" fill="var(--foreground)">{done ? "✓" : value}</text>
      <text x="42" y="55" textAnchor="middle" fontSize="9" fill="var(--foreground-muted)">{done ? "done" : `/ ${goal}`}</text>
    </svg>
  );
}

export default function ProgressDashboard() {
  const [eng, setEng] = useState<Engagement | null>(null);
  const [goalId, setGoalId] = useState("regular");

  useEffect(() => {
    setGoalId(getGoalId());
    let active = true;
    loadEngagement().then((e) => { if (active) setEng(e); });
    return () => { active = false; };
  }, []);

  const goal = DAILY_GOALS.find((g) => g.id === goalId) ?? DAILY_GOALS[1];

  if (!eng) {
    return (
      <main className="min-h-screen lib-felt">
        <LibraryHeader title="Your Progress" fallback="/library" />
        <p className="text-center text-sm py-10" style={{ color: "var(--foreground-muted)" }}>Loading…</p>
      </main>
    );
  }

  const { stats, ctx } = eng;
  const achievements = evaluateAchievements(ctx);
  const maxWeek = Math.max(1, ...stats.weekly.map((w) => w.items));

  return (
    <main className="min-h-screen lib-felt">
      <LibraryHeader title="Your Progress" fallback="/library" />
      <div className="max-w-lg mx-auto px-5 py-5 pb-24">
        {/* Level + XP */}
        <div className="rounded-2xl p-5 mb-3" style={{ background: "linear-gradient(135deg, var(--plum), var(--plum-deep))", border: "1px solid var(--brass)" }}>
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-[10px] uppercase tracking-widest" style={{ color: "var(--brass-light)" }}>Level</p>
              <p className="text-[32px] font-bold leading-none" style={{ color: "#f0e6d2", fontFamily: "var(--font-display)" }}>{stats.level}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-widest" style={{ color: "var(--brass-light)" }}>Total XP</p>
              <p className="text-[22px] font-bold leading-none" style={{ color: "#f0e6d2", fontFamily: "var(--font-display)" }}>{stats.totalXp}</p>
            </div>
          </div>
          <div className="h-2 rounded-full overflow-hidden mt-3" style={{ backgroundColor: "rgba(0,0,0,0.3)" }}>
            <div className="h-full rounded-full" style={{ width: `${(stats.xpIntoLevel / stats.xpForLevel) * 100}%`, backgroundColor: "var(--brass)" }} />
          </div>
          <p className="text-[10px] mt-1" style={{ color: "rgba(240,230,210,0.6)" }}>{stats.xpForLevel - stats.xpIntoLevel} XP to level {stats.level + 1}</p>
        </div>

        {/* Streak + daily goal */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="rounded-2xl p-4 flex flex-col justify-center" style={{ backgroundColor: "var(--background-card)", border: "1px solid var(--border-card)" }}>
            <div className="flex items-center gap-2">
              <span className="text-2xl" aria-hidden="true">{stats.streak > 0 ? "🔥" : "✨"}</span>
              <span className="text-[28px] font-bold leading-none" style={{ color: "var(--foreground)", fontFamily: "var(--font-display)" }}>{stats.streak}</span>
            </div>
            <p className="text-[11px] mt-1" style={{ color: "var(--foreground-secondary)" }}>day streak{stats.atRisk && stats.streak > 0 ? " · learn today to keep it" : ""}</p>
            {stats.longestStreak > stats.streak && <p className="text-[10px] mt-0.5" style={{ color: "var(--foreground-muted)" }}>best: {stats.longestStreak}</p>}
          </div>
          <div className="rounded-2xl p-4 flex items-center gap-3" style={{ backgroundColor: "var(--background-card)", border: "1px solid var(--border-card)" }}>
            <GoalRing value={stats.todayXp} goal={goal.xp} />
            <div>
              <p className="text-[11px] font-semibold" style={{ color: "var(--foreground)" }}>Today&rsquo;s goal</p>
              <p className="text-[10px]" style={{ color: "var(--foreground-muted)" }}>{goal.xp} XP</p>
            </div>
          </div>
        </div>

        {/* Goal selector */}
        <div className="flex gap-1.5 mb-5">
          {DAILY_GOALS.map((g) => (
            <button
              key={g.id}
              onClick={() => { setDailyGoal(g.id); setGoalId(g.id); }}
              className="flex-1 py-2 rounded-xl text-[11px] font-medium transition-colors"
              style={goalId === g.id ? { backgroundColor: "var(--plum)", color: "var(--brass)", border: "1px solid var(--brass)" } : { backgroundColor: "var(--background-card)", color: "var(--foreground-muted)", border: "1px solid var(--border-card)" }}
            >
              {g.label}<span className="block text-[9px] opacity-70">{g.xp} XP</span>
            </button>
          ))}
        </div>

        {/* Weekly activity */}
        <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: "var(--brass)" }}>This week</p>
        <div className="rounded-2xl p-4 mb-5 flex items-end justify-between gap-2" style={{ backgroundColor: "var(--background-card)", border: "1px solid var(--border-card)", height: 120 }}>
          {stats.weekly.map((w) => (
            <div key={w.date} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
              <div
                className="w-full rounded-md"
                style={{
                  height: `${Math.max(6, (w.items / maxWeek) * 70)}px`,
                  backgroundColor: w.isToday ? "var(--brass)" : w.items > 0 ? "var(--plum-light)" : "var(--border)",
                }}
                title={`${w.items} this day`}
              />
              <span className="text-[9px]" style={{ color: w.isToday ? "var(--brass)" : "var(--foreground-muted)" }}>{w.label}</span>
            </div>
          ))}
        </div>

        {/* Stat tiles */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {[
            { label: "Lessons done", value: ctx.lessonsCompleted },
            { label: "Courses passed", value: ctx.coursesCompleted },
            { label: "Certificates", value: ctx.certificates },
            { label: "Active days", value: stats.totalActiveDays },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl p-4" style={{ backgroundColor: "var(--background-card)", border: "1px solid var(--border-card)" }}>
              <p className="text-[24px] font-bold leading-none" style={{ color: "var(--foreground)", fontFamily: "var(--font-display)" }}>{s.value}</p>
              <p className="text-[11px] mt-1" style={{ color: "var(--foreground-secondary)" }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Achievements */}
        <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: "var(--brass)" }}>
          Achievements · {achievements.filter((a) => a.unlocked).length}/{achievements.length}
        </p>
        <div className="grid grid-cols-3 gap-2.5">
          {achievements.map(({ achievement, unlocked }) => (
            <div
              key={achievement.id}
              className="rounded-2xl p-3 text-center"
              style={{ backgroundColor: "var(--background-card)", border: "1px solid var(--border-card)", opacity: unlocked ? 1 : 0.4 }}
            >
              <div className="text-2xl mb-1" style={{ filter: unlocked ? "none" : "grayscale(1)" }} aria-hidden="true">{achievement.icon}</div>
              <p className="text-[11px] font-semibold leading-tight" style={{ color: "var(--foreground)" }}>{achievement.title}</p>
              <p className="text-[9px] mt-0.5 leading-snug" style={{ color: "var(--foreground-muted)" }}>{achievement.description}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
