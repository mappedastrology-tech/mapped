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
import {
  AI_CONSENT_KEY,
  AI_DECLINED_KEY,
  AI_CONSENT_VERSION,
  AI_PROVIDER_NAME,
  decideAiConsent,
} from "@/lib/aiConsentShared";

/**
 * The keys, the version and the provider name live in lib/aiConsentShared.ts,
 * which the browser reads too — so the screen someone agreed to and the check
 * that enforces it cannot drift apart. Re-exported for existing importers.
 *
 * A "yes" is stored as `v<version>:<ISO time>`, so "when did they consent, and
 * to which list" is answerable without a second column — which is what matters
 * if anyone ever has to show their working.
 */
export { AI_CONSENT_KEY, AI_DECLINED_KEY, AI_CONSENT_VERSION, AI_PROVIDER_NAME };

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
 * Has this account agreed — to the CURRENT list, and not since taken it back?
 *
 * Both rows are read and decideAiConsent picks the latest answer. So turning
 * AI off in Settings is refused here even if removing the old "yes" row
 * failed, and a "yes" to an older version of the list is not enough.
 *
 * A failed read returns false. Refusing to send someone's birth chart to
 * another company because we could not confirm they said yes is the right way
 * round to be wrong: the cost is one unanswered request, and the alternative
 * cost is sending personal data without permission.
 *
 * `db` exists for tests; routes leave it out.
 */
export async function hasAiConsent(userId: string, db?: SupabaseClient): Promise<boolean> {
  try {
    const { data, error } = await (db ?? admin())
      .from("user_settings")
      .select("key, value")
      .eq("user_id", userId)
      .in("key", [AI_CONSENT_KEY, AI_DECLINED_KEY]);
    if (error) {
      console.error("[ai-consent] could not read consent:", error.message);
      return false;
    }
    const rows = (data ?? []) as { key: string; value: unknown }[];
    const granted = rows.find((r) => r.key === AI_CONSENT_KEY)?.value;
    const declined = rows.find((r) => r.key === AI_DECLINED_KEY)?.value;
    const state = decideAiConsent(granted, declined);
    if (state !== "granted") {
      /**
       * Say WHICH kind of no it is.
       *
       * Every refusal used to look identical from outside: a 403 and silence.
       * When the version moved to 3 and an account whose "yes" predated
       * versioning started being refused on every message, there was no way to
       * tell that apart from "never asked", "said no", or the database read
       * failing — and working it out took reading the deploy, the request
       * logs and the stored rows side by side.
       *
       * No user id and no values: the shape of the answer is the whole
       * diagnostic, and it is not worth putting someone's identifier in a log
       * to get it.
       */
      console.warn(
        `[ai-consent] refusing: state=${state} has_yes=${granted !== undefined} `
        + `has_no=${declined !== undefined} required_version=${AI_CONSENT_VERSION}`,
      );
    }
    return state === "granted";
  } catch (err) {
    // This used to be a bare `catch { return false }`. A throw here — a
    // missing service-role key, an unreachable database — is indistinguishable
    // from a deliberate "no" at the call site, so it has to say so somewhere.
    console.error("[ai-consent] consent check threw:", err instanceof Error ? err.message : String(err));
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
export async function guardAiConsent(userId: string, db?: SupabaseClient): Promise<Response | null> {
  return (await hasAiConsent(userId, db)) ? null : aiConsentRequired();
}
