import { test } from "node:test";
import assert from "node:assert/strict";
import { levelFromXp, computeStreak, computeStats, XP_PER_LEVEL, type ActivityDay } from "../src/lib/learn/stats";
import { evaluateAchievements, unlockedCount } from "../src/lib/learn/achievements";

const NOW = new Date("2026-06-23T12:00:00");

function ymd(offsetDays: number): string {
  const d = new Date(NOW);
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

test("levelFromXp uses the XP-per-level threshold", () => {
  assert.equal(levelFromXp(0), 1);
  assert.equal(levelFromXp(XP_PER_LEVEL - 1), 1);
  assert.equal(levelFromXp(XP_PER_LEVEL), 2);
  assert.equal(levelFromXp(XP_PER_LEVEL * 3), 4);
});

test("streak counts consecutive days ending today", () => {
  const days = new Set([ymd(0), ymd(-1), ymd(-2)]);
  const { streak, atRisk } = computeStreak(days, NOW);
  assert.equal(streak, 3);
  assert.equal(atRisk, false);
});

test("streak forgives a single missed day (built-in freeze)", () => {
  const days = new Set([ymd(0), ymd(-2)]); // yesterday missed
  assert.equal(computeStreak(days, NOW).streak, 2);
});

test("streak stays alive (at risk) when only yesterday is done", () => {
  const days = new Set([ymd(-1)]);
  const { streak, atRisk } = computeStreak(days, NOW);
  assert.equal(streak, 1);
  assert.equal(atRisk, true);
});

test("streak is 0 when last activity is older than yesterday", () => {
  const days = new Set([ymd(-3)]);
  assert.equal(computeStreak(days, NOW).streak, 0);
});

test("computeStats totals XP and returns a 7-day week", () => {
  const activity: ActivityDay[] = [
    { date: ymd(0), xp: 30, items: 2 },
    { date: ymd(-1), xp: 15, items: 1 },
  ];
  const s = computeStats(activity, NOW);
  assert.equal(s.totalXp, 45);
  assert.equal(s.todayXp, 30);
  assert.equal(s.weekly.length, 7);
  assert.equal(s.weekly[s.weekly.length - 1].isToday, true);
});

test("achievements unlock from context", () => {
  const base = computeStats([], NOW);
  const none = evaluateAchievements({ stats: base, lessonsCompleted: 0, certificates: 0, coursesCompleted: 0 });
  assert.equal(none.find((a) => a.achievement.id === "first-lesson")!.unlocked, false);
  const some = { stats: base, lessonsCompleted: 1, certificates: 0, coursesCompleted: 0 };
  assert.equal(evaluateAchievements(some).find((a) => a.achievement.id === "first-lesson")!.unlocked, true);
  assert.ok(unlockedCount(some) >= 1);
});
