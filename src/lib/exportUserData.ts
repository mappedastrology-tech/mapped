import { supabase } from "@/lib/supabase";

/**
 * GDPR/CCPA-friendly "download my data" — gathers everything Mapped stores for
 * the signed-in user and triggers a JSON file download in the browser. RLS
 * ensures only the user's own rows come back; tables that don't exist are
 * skipped silently.
 */

// table -> the column that scopes a row to its owner
const USER_TABLES: Record<string, string> = {
  profiles: "id",
  charts: "user_id",
  connections: "user_id",
  journal_entries: "user_id",
  ritual_completions: "user_id",
  tarot_readings: "user_id",
  custom_rituals: "user_id",
  dolly_conversations: "user_id",
  bug_reports: "user_id",
  promo_redemptions: "user_id",
};

export async function exportUserData(): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) throw new Error("You need to be signed in to export your data.");

  const out: Record<string, unknown> = {
    exportedAt: new Date().toISOString(),
    account: { id: user.id, email: user.email },
  };

  for (const [table, col] of Object.entries(USER_TABLES)) {
    try {
      const { data, error } = await supabase.from(table).select("*").eq(col, user.id);
      if (!error) out[table] = data ?? [];
    } catch {
      /* table may not exist in this project — skip */
    }
  }

  const blob = new Blob([JSON.stringify(out, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `mapped-data-export-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
