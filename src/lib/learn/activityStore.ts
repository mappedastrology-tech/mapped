import { supabase } from "@/lib/supabase";
import type { ActivityDay } from "./stats";

/** Supabase persistence for daily learning activity / XP. Fails soft. */

async function uid(): Promise<string | null> {
  try {
    const { data } = await supabase.auth.getSession();
    return data.session?.user?.id ?? null;
  } catch {
    return null;
  }
}

function ymdLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Add XP (and item count) to today's activity row. */
export async function awardXp(xp: number, items = 1): Promise<void> {
  const user = await uid();
  if (!user) return;
  try {
    const today = ymdLocal(new Date());
    const { data } = await supabase
      .from("learning_activity")
      .select("xp, items")
      .eq("user_id", user)
      .eq("activity_date", today)
      .maybeSingle();
    await supabase.from("learning_activity").upsert(
      {
        user_id: user,
        activity_date: today,
        xp: (data?.xp ?? 0) + xp,
        items: (data?.items ?? 0) + items,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,activity_date" },
    );
  } catch {
    /* fail soft */
  }
}

export async function getActivity(days = 120): Promise<ActivityDay[]> {
  const user = await uid();
  if (!user) return [];
  try {
    const since = new Date();
    since.setDate(since.getDate() - days);
    const { data } = await supabase
      .from("learning_activity")
      .select("activity_date, xp, items")
      .eq("user_id", user)
      .gte("activity_date", ymdLocal(since))
      .order("activity_date", { ascending: true });
    return (data ?? []).map((r) => ({ date: r.activity_date as string, xp: r.xp as number, items: r.items as number }));
  } catch {
    return [];
  }
}
