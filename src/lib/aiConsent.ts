"use client";

/**
 * The browser's half of AI consent. The half that matters is the server's —
 * see lib/ai/consent.ts, which refuses the request itself.
 *
 * This exists so the app can show the consent screen before someone types a
 * message rather than after, so declining is a real answer the app remembers
 * instead of a dialog that reappears on every tap, and so the answer can be
 * changed later in Account settings.
 *
 * The keys, the version and the list of what is sent come from
 * lib/aiConsentShared.ts, which the server reads too.
 */

import { supabase } from "@/lib/supabase";
import {
  AI_CONSENT_KEY,
  AI_DECLINED_KEY,
  AI_CONSENT_VERSION,
  AI_PROVIDER_NAME,
  AI_SHARED_ITEMS,
  consentValue,
  decideAiConsent,
  type AiConsentState,
} from "@/lib/aiConsentShared";

export {
  AI_CONSENT_KEY,
  AI_DECLINED_KEY,
  AI_CONSENT_VERSION,
  AI_PROVIDER_NAME,
  AI_SHARED_ITEMS,
  type AiConsentState,
};

/**
 * Read once per page load.
 *
 * `unknown` is the honest answer while the read is in flight, the network is
 * down, or the person agreed only to an older version of the list — and the
 * caller shows a spinner or the consent screen rather than guessing. Guessing
 * `granted` would send data without permission, and guessing `declined` would
 * hide Dolly from somebody who agreed.
 */
export async function readAiConsent(): Promise<AiConsentState> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const uid = session?.user?.id;
    if (!uid) return "unknown";
    const { data, error } = await supabase
      .from("user_settings")
      .select("key, value")
      .eq("user_id", uid)
      .in("key", [AI_CONSENT_KEY, AI_DECLINED_KEY]);
    if (error) return "unknown";
    const rows = (data ?? []) as { key: string; value: unknown }[];
    return decideAiConsent(
      rows.find((r) => r.key === AI_CONSENT_KEY)?.value,
      rows.find((r) => r.key === AI_DECLINED_KEY)?.value,
    );
  } catch {
    return "unknown";
  }
}

/**
 * The two writes an answer makes: save it, and remove the opposite answer.
 *
 * Pure, so the test can replay "allow, then turn off in Settings" against the
 * server's check without a database. Only the save has to succeed — the
 * server goes by whichever answer is newer (see decideAiConsent), so a removal
 * that fails on a flaky connection cannot leave an old "yes" in force.
 */
export function consentWrites(agree: boolean, now: Date = new Date()): {
  save: { key: string; value: string };
  remove: string;
} {
  return agree
    ? { save: { key: AI_CONSENT_KEY, value: consentValue(now) }, remove: AI_DECLINED_KEY }
    : { save: { key: AI_DECLINED_KEY, value: now.toISOString() }, remove: AI_CONSENT_KEY };
}

async function recordAnswer(agree: boolean): Promise<boolean> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const uid = session?.user?.id;
    if (!uid) return false;
    const { save, remove } = consentWrites(agree);
    const { error } = await supabase
      .from("user_settings")
      .upsert(
        { user_id: uid, key: save.key, value: save.value, updated_at: new Date().toISOString() },
        { onConflict: "user_id,key" },
      );
    // Reported, not swallowed: the screen says "that didn't save" rather than
    // telling someone AI is off when the server would still send.
    if (error) return false;
    await supabase.from("user_settings").delete().eq("user_id", uid).eq("key", remove);
    return true;
  } catch {
    return false;
  }
}

/**
 * Record a yes — to the current version of the list. The value carries the
 * version and the time, which is what makes "when did they agree, and to
 * what" answerable later.
 */
export function grantAiConsent(): Promise<boolean> {
  return recordAnswer(true);
}

/**
 * Record a no. Used by "Not now" on the consent screen and by turning AI off
 * in Account settings — the same record either way.
 *
 * Stored rather than simply "not granted", because the two need to behave
 * differently: somebody who has not been asked gets the screen, and somebody
 * who said no gets left alone. Once it is saved, every AI route refuses.
 */
export function declineAiConsent(): Promise<boolean> {
  return recordAnswer(false);
}
