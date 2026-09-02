/**
 * Learning engagement — PURE stats logic (no Supabase, fully testable).
 *
 * XP is earned for learning actions; levels come from total XP; the streak is
 * forgiving (it tolerates one missed day, a built-in "freeze," and doesn't break
 * the instant a new day starts) so it motivates without shaming.
 */

export const XP_PER_LEVEL = 120;
export const XP_LESSON = 15; // first completion of a lesson
export const XP_REVIEW = 5; // per lesson reviewed
export const XP_FINAL_BONUS = 50; // first time a course's final test is passed
/** Flawless run of a lesson's check — every question right on the first try. */
export const XP_PERFECT = 5;

export interface ActivityDay {
  date: string; // 'YYYY-MM-DD' (local)
  xp: number;
  items: number;
}

export interface WeeklyBar {
  date: string;
  label: string; // 'Mon'…'Sun'
  items: number;
  isToday: boolean;
}

export interface LearningStats {
  totalXp: number;
  level: number;
  xpIntoLevel: number;
  xpForLevel: number;
  streak: number;
  atRisk: boolean; // streak alive but today isn't done yet
  longestStreak: number;
  totalActiveDays: number;
  todayXp: number;
  todayItems: number;
  weekly: WeeklyBar[];
}

export function levelFromXp(xp: number): number {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
}

function ymd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addDays(d: Date, n: number): Date {
  const c = new Date(d);
  c.setDate(c.getDate() + n);
  return c;
}

const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/**
 * Forgiving streak: counts consecutive active days ending at today/yesterday,
 * tolerating one skipped day (a built-in freeze). Returns 0 if the most recent
 * activity is older than yesterday.
 */
export function computeStreak(activeDays: Set<string>, now: Date): { streak: number; atRisk: boolean } {
  const today = ymd(now);
  const yesterday = ymd(addDays(now, -1));
  if (!activeDays.has(today) && !activeDays.has(yesterday)) return { streak: 0, atRisk: false };

  let streak = 0;
  let usedFreeze = false;
  let cursor = new Date(now);
  // Walk backward up to a generous window.
  for (let i = 0; i < 800; i++) {
    const ds = ymd(cursor);
    if (activeDays.has(ds)) {
      streak++;
    } else if (ds === today) {
      // today not done yet — don't count it, don't break the streak
    } else if (!usedFreeze) {
      usedFreeze = true; // forgive a single missed day
    } else {
      break;
    }
    cursor = addDays(cursor, -1);
  }
  return { streak, atRisk: !activeDays.has(today) };
}

function longestRun(activeDays: Set<string>): number {
  if (activeDays.size === 0) return 0;
  const sorted = [...activeDays].sort();
  let best = 1;
  let run = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1] + "T00:00:00");
    const cur = new Date(sorted[i] + "T00:00:00");
    const gap = Math.round((cur.getTime() - prev.getTime()) / 86_400_000);
    run = gap === 1 ? run + 1 : 1;
    if (run > best) best = run;
  }
  return best;
}

export function computeStats(activity: ActivityDay[], now: Date = new Date()): LearningStats {
  const byDate = new Map(activity.map((a) => [a.date, a]));
  const activeDays = new Set(activity.filter((a) => a.items > 0 || a.xp > 0).map((a) => a.date));

  const totalXp = activity.reduce((s, a) => s + a.xp, 0);
  const level = levelFromXp(totalXp);
  const xpIntoLevel = totalXp % XP_PER_LEVEL;

  const { streak, atRisk } = computeStreak(activeDays, now);
  const today = ymd(now);
  const todayRow = byDate.get(today);

  const weekly: WeeklyBar[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = addDays(now, -i);
    const ds = ymd(d);
    weekly.push({ date: ds, label: DOW[d.getDay()], items: byDate.get(ds)?.items ?? 0, isToday: ds === today });
  }

  return {
    totalXp,
    level,
    xpIntoLevel,
    xpForLevel: XP_PER_LEVEL,
    streak,
    atRisk,
    longestStreak: longestRun(activeDays),
    totalActiveDays: activeDays.size,
    todayXp: todayRow?.xp ?? 0,
    todayItems: todayRow?.items ?? 0,
    weekly,
  };
}
