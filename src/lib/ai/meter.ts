/**
 * The two lines every AI route needs: check before, bill after.
 *
 * SERVER ONLY — re-exports from src/lib/ai/budget.ts, which reads the service
 * role key and holds the spend ceilings.
 *
 * Routes differ in how they call Claude (streamed, resilient-with-fallback,
 * plain create), so this deliberately does not wrap the call itself. It gives
 * a gate that returns a ready-made Response, and a recorder that takes the
 * finished message.
 */

import { checkAiBudget, recordAiUsage } from "@/lib/ai/budget";

/**
 * Returns a Response to send back when the user may not make this call, or
 * null when they may. Callers should `if (denied) return denied;`.
 */
export async function guardAi(userId: string, route: string): Promise<Response | null> {
  const verdict = await checkAiBudget(userId);
  if (verdict.allowed) return null;
  console.info(`[ai-budget] ${route} refused for ${userId} (tier ${verdict.tier})`);
  return new Response(JSON.stringify({ error: verdict.message }), {
    status: verdict.status ?? 429,
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * Collects usage from a streamed response.
 *
 * A stream reports its cost across two event types rather than on a finished
 * message: message_start carries the input and cache counts, and each
 * message_delta carries the running output total. Feed every event through
 * observe(), then pass .usage to recordAiUsage when the stream ends — including
 * when it ends badly, since tokens generated before a break were still billed
 * to us.
 */
export function streamBilling() {
  const usage = {
    input_tokens: 0,
    output_tokens: 0,
    cache_read_input_tokens: 0,
    cache_creation_input_tokens: 0,
  };
  return {
    usage,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    observe(event: any): void {
      if (event?.type === "message_start" && event.message?.usage) {
        const u = event.message.usage;
        usage.input_tokens = u.input_tokens ?? 0;
        usage.cache_read_input_tokens = u.cache_read_input_tokens ?? 0;
        usage.cache_creation_input_tokens = u.cache_creation_input_tokens ?? 0;
      } else if (event?.type === "message_delta" && event.usage?.output_tokens != null) {
        usage.output_tokens = event.usage.output_tokens;
      }
    },
  };
}

/** Shape shared by a finished Anthropic message, without importing the SDK type. */
interface FinishedMessage {
  model?: string;
  usage?: {
    input_tokens?: number | null;
    output_tokens?: number | null;
    cache_read_input_tokens?: number | null;
    cache_creation_input_tokens?: number | null;
  } | null;
}

/**
 * Bill a completed call.
 *
 * Prefers the model named in the response over the one requested: a route that
 * falls back from Sonnet to Haiku genuinely costs the fallback's rate, and
 * billing the requested model would overcharge the user's budget by 3x.
 */
export async function meterMessage(
  userId: string,
  route: string,
  message: FinishedMessage | null | undefined,
  requestedModel: string,
): Promise<void> {
  await recordAiUsage({
    userId,
    route,
    model: message?.model || requestedModel,
    usage: message?.usage ?? null,
  });
}
