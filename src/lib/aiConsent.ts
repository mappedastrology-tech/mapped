"use client";

/**
 * The browser's half of AI consent. The half that matters is the server's —
 * see lib/ai/consent.ts, which refuses the request itself.
 *
 * This exists so the app can show the consent screen before someone types a
 * message rather than after, and so declining is a real answer the app
 * remembers instead of a dialog that reappears on every tap.
 */

import { supabase } from "@/lib/supabase";
import { fetchSetting, saveSetting } from "@/lib/syncedSettings";

/** Must match AI_CONSENT_KEY on the server. */
export const AI_CONSENT_KEY = "ai-consent";
/** Set when somebody says no, so we stop asking and hide the AI surfaces. */
export const AI_DECLINED_KEY = "ai-consent-declined";

export const AI_PROVIDER_NAME = "Anthropic";

/** What actually leaves Mapped, in the order a person would think of it. */
export const AI_SHARED_ITEMS = [
  "Your birth date, time and place, and the chart built from them",
  "What you write to Dolly, and what she has written back",
  "Journal entries, when you ask for a reflection or a prompt",
  "The people on your map — their names and charts — when a question is about them",
  "A photograph of your palm, when you ask for a palmistry reading",
] as const;

export type AiConsentState = "unknown" | "granted" | "declined";

/**
 * Read once per page load.
 *
 * `unknown` is the honest answer while the read is in flight or the network
 * is down, and the caller shows a spinner rather than guessing — guessing
 * `granted` would send data without permission, and guessing `declined` would
 * nag somebody who already agreed.
 */
export async function readAiConsent(): Promise<AiConsentState> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const uid = session?.user?.id;
    if (!uid) return "unknown";
    const [granted, declined] = await Promise.all([
      fetchSetting(uid, AI_CONSENT_KEY),
      fetchSetting(uid, AI_DECLINED_KEY),
    ]);
    if (granted) return "granted";
    if (declined) return "declined";
    return "unknown";
  } catch {
    return "unknown";
  }
}

/**
 * Record a yes. The value IS the timestamp, which is what makes "when did
 * they agree" answerable later.
 */
export async function grantAiConsent(): Promise<boolean> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const uid = session?.user?.id;
    if (!uid) return false;
    await saveSetting(uid, AI_CONSENT_KEY, new Date().toISOString());
    return true;
  } catch {
    return false;
  }
}

/**
 * Record a no.
 *
 * Stored rather than simply "not granted", because the two need to behave
 * differently: somebody who has not been asked gets the screen, and somebody
 * who said no gets left alone. They can still change their mind in Settings.
 */
export async function declineAiConsent(): Promise<boolean> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const uid = session?.user?.id;
    if (!uid) return false;
    await saveSetting(uid, AI_DECLINED_KEY, new Date().toISOString());
    return true;
  } catch {
    return false;
  }
}
