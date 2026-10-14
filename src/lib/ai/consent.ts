/**
 * Permission, before anything personal reaches an AI company.
 *
 * App Store Guideline 5.1.2(i) requires explicit consent before personal data
 * is sent to a third party, and Apple now applies it specifically to AI
 * providers. Mapped sends a lot: birth date, time and place, the chart built
 * from them, chat messages, journal text, and the names and charts of the
 * people on someone's map.
 *
 * Enforced on the SERVER, not only in the UI. A consent screen the client can
 * skip is a disclosure, not a permission — and the thing Apple is asking us
 * to gate is the request leaving our server, which only the server can stop.
 * The screen exists too (see lib/aiConsent.ts and the Dolly tab); this is what
 * makes it mean something.
 *
 * Deliberately separate from checkAiBudget. Budget is about what a tier has
 * paid for and answers "not right now"; consent is about whether we are
 * allowed to send at all, and answers "not until you say so". Folding them
 * together would mean free-tier limits and privacy permission sharing one
 * status code, and would have let the four routes that skip the budget check
 * skip consent with it.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * The user_settings key. Its VALUE is the ISO timestamp of the moment they
 * agreed — so "when did they consent" is answerable without a second column,
 * which is what matters if anyone ever has to show their working.
 */
export const AI_CONSENT_KEY = "ai-consent";

/** Bumped only if what we send, or who we send it to, materially changes. */
export const AI_CONSENT_VERSION = 1;

/** The provider, named — Apple wants the company, not "an AI". */
export const AI_PROVIDER_NAME = "Anthropic";

let cached: SupabaseClient | null = null;
function admin(): SupabaseClient {
  if (!cached) {
    cached = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
  }
  return cached;
}

/**
 * Has this account agreed?
 *
 * A failed read returns false. Refusing to send someone's birth chart to
 * another company because we could not confirm they said yes is the right way
 * round to be wrong: the cost is one unanswered request, and the alternative
 * cost is sending personal data without permission.
 */
export async function hasAiConsent(userId: string): Promise<boolean> {
  try {
    const { data, error } = await admin()
      .from("user_settings")
      .select("value")
      .eq("user_id", userId)
      .eq("key", AI_CONSENT_KEY)
      .maybeSingle();
    if (error) {
      console.error("[ai-consent] could not read consent:", error.message);
      return false;
    }
    return typeof data?.value === "string" && data.value.length > 0;
  } catch {
    return false;
  }
}

/**
 * The refusal an AI route returns when consent is missing.
 *
 * 403 and a machine-readable `code`, so the client can tell "you have not
 * agreed yet" (open the consent screen) apart from "you are out of messages"
 * (429) and "this is a paid feature" (402). Three different sentences, three
 * different things for the reader to do.
 */
export function aiConsentRequired(): Response {
  return new Response(
    JSON.stringify({
      code: "ai_consent_required",
      error: `Mapped needs your permission before sending anything to ${AI_PROVIDER_NAME}.`,
    }),
    { status: 403, headers: { "Content-Type": "application/json" } },
  );
}

/**
 * One call for an AI route: null means carry on, a Response means stop.
 *
 *   const refusal = await guardAiConsent(uid);
 *   if (refusal) return refusal;
 */
export async function guardAiConsent(userId: string): Promise<Response | null> {
  return (await hasAiConsent(userId)) ? null : aiConsentRequired();
}
