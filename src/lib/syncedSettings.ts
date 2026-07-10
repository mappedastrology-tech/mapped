// Account-synced user preferences.
//
// A thin wrapper over the `user_settings` table (user_id, key, value). Values
// are stored as JSON but the app only uses simple strings, so the helpers
// return/accept strings. localStorage remains the synchronous cache and the
// signed-out fallback; the account is the cross-device source of truth.
//
// Keys are the bare suffix (e.g. "oracle-deck"); the matching localStorage key
// is conventionally `mapped:<key>`.

import { supabase } from "@/lib/supabase";

/** Read one account setting. Returns null if unset / offline / signed out. */
export async function fetchSetting(userId: string, key: string): Promise<string | null> {
  try {
    const { data } = await supabase
      .from("user_settings")
      .select("value")
      .eq("user_id", userId)
      .eq("key", key)
      .maybeSingle();
    const v = data?.value;
    if (v == null) return null;
    return typeof v === "string" ? v : String(v);
  } catch {
    return null;
  }
}

/** Upsert one account setting (fire-and-forget; offline is non-fatal). */
export async function saveSetting(userId: string, key: string, value: string): Promise<void> {
  try {
    await supabase
      .from("user_settings")
      .upsert(
        { user_id: userId, key, value, updated_at: new Date().toISOString() },
        { onConflict: "user_id,key" }
      );
  } catch {
    // offline — the localStorage cache holds the value until the next sync
  }
}

/** Remove one account setting (e.g. clearing a saved fishing spot). */
export async function clearSetting(userId: string, key: string): Promise<void> {
  try {
    await supabase.from("user_settings").delete().eq("user_id", userId).eq("key", key);
  } catch {
    // offline — non-fatal
  }
}
