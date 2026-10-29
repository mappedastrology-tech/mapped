/**
 * The journal streak: consecutive days with something written, ending today —
 * or yesterday, so the count doesn't drop to zero first thing in the morning
 * before today's entry exists.
 *
 * One definition for the mobile Journal header, the desktop Journal sidebar
 * and the desktop Today page. The desktop screens used to print a hardcoded
 * "7", which a brand-new account saw on its first visit.
 */

function dayKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

export function journalStreak(dates: Date[], now: Date = new Date()): number {
  const days = new Set(dates.filter((d) => !isNaN(d.getTime())).map(dayKey));
  const cur = new Date(now);
  if (!days.has(dayKey(cur))) cur.setDate(cur.getDate() - 1);
  let streak = 0;
  while (days.has(dayKey(cur))) {
    streak++;
    cur.setDate(cur.getDate() - 1);
  }
  return streak;
}

/** The date an entry counts toward, from either of the shapes entries carry. */
export function entryDate(e: { created_at?: string | null; date?: string | null }): Date {
  return new Date(e.created_at || e.date || NaN);
}
