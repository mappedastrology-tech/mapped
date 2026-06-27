/** Daily-goal presets, stored locally so the user owns their pace (autonomy). */

export interface DailyGoal {
  id: string;
  label: string;
  xp: number;
  blurb: string;
}

export const DAILY_GOALS: DailyGoal[] = [
  { id: "casual", label: "Casual", xp: 10, blurb: "A little each day" },
  { id: "regular", label: "Regular", xp: 20, blurb: "A lesson or two" },
  { id: "committed", label: "Committed", xp: 40, blurb: "Real momentum" },
];

const KEY = "mapped:learn:goal";
const DEFAULT_ID = "regular";

export function getGoalId(): string {
  if (typeof window === "undefined") return DEFAULT_ID;
  try {
    return localStorage.getItem(KEY) || DEFAULT_ID;
  } catch {
    return DEFAULT_ID;
  }
}

export function getDailyGoal(): DailyGoal {
  const id = getGoalId();
  return DAILY_GOALS.find((g) => g.id === id) ?? DAILY_GOALS[1];
}

export function setDailyGoal(id: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, id);
  } catch {
    /* ignore */
  }
}
