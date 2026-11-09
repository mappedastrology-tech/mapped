import { supabase } from "@/lib/supabase";
import { saveOrShareFile } from "./saveFile";

/**
 * GDPR/CCPA-friendly "download my data" — gathers everything Mapped stores for
 * the signed-in user and triggers a JSON file download in the browser. RLS
 * ensures only the user's own rows come back; a table that can't be read is
 * listed under `notIncluded` rather than silently missing.
 *
 * Adding a table keyed by user_id? Add it here too — tests/dataExport.test.ts
 * fails until you do.
 */

// table -> the column that scopes a row to its owner
export const USER_TABLES: Record<string, string> = {
  profiles: "id",
  charts: "user_id",
  connections: "user_id",
  journal_entries: "user_id",
  ritual_completions: "user_id",
  tarot_readings: "user_id",
  custom_rituals: "user_id",
  dolly_conversations: "user_id",
  // The summary Dolly keeps about someone's life, written by the AI from
  // their own messages. It was the one thing about them they could neither
  // read nor take with them.
  dolly_memory: "user_id",
  bug_reports: "user_id",
  promo_redemptions: "user_id",
  // Added after an audit of every table keyed by user_id (supabase/*.sql and
  // every from("…") call). Each was user-owned and missing from the file.
  palm_readings: "user_id",
  journal_reflections: "user_id",
  // Learn: progress, quiz scores, review schedule, streak days, certificates.
  course_progress: "user_id",
  quiz_attempts: "user_id",
  lesson_reviews: "user_id",
  learning_activity: "user_id",
  certificates: "user_id",
  // Every account-synced preference — including the AI consent record (when
  // they agreed or declined, and to which version) and the profile photo.
  user_settings: "user_id",
  // The devices registered for notifications, and what was sent to them.
  push_subscriptions: "user_id",
  notification_log: "user_id",
  // Oracle decks owned, saved resonance results, cached daily horoscopes,
  // and the AI usage metered against the account.
  purchased_decks: "user_id",
  resonance_assignments: "user_id",
  horoscope_cache: "user_id",
  ai_usage: "user_id",
};

export async function exportUserData(): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) throw new Error("You need to be signed in to export your data.");

  const out: Record<string, unknown> = {
    exportedAt: new Date().toISOString(),
    account: { id: user.id, email: user.email },
  };

  // Tables that could not be read are named in the file rather than silently
  // left out, so "this is everything" is never claimed when it is not.
  const unavailable: string[] = [];
  for (const [table, col] of Object.entries(USER_TABLES)) {
    try {
      const { data, error } = await supabase.from(table).select("*").eq(col, user.id);
      if (!error) out[table] = data ?? [];
      else unavailable.push(table);
    } catch {
      /* table may not exist in this project */
      unavailable.push(table);
    }
  }
  if (unavailable.length) out.notIncluded = unavailable;

  const blob = new Blob([JSON.stringify(out, null, 2)], { type: "application/json" });
  await saveOrShareFile(blob, `mapped-data-export-${new Date().toISOString().slice(0, 10)}.json`, {
    title: "Your Mapped data",
  });
}
