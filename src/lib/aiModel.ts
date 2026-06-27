/**
 * Central Claude model configuration + a resilient message helper.
 *
 * All AI routes (horoscope, Dolly, journal, chart interpretation, wizard)
 * import from here so the model can be updated in ONE place. Anthropic retires
 * dated model snapshots over time; when that happens, change it here only.
 *
 * Current models (June 2026):
 *   claude-opus-4-8              — most capable
 *   claude-sonnet-4-6           — balanced quality/cost (default for this app)
 *   claude-haiku-4-5-20251001   — fastest/cheapest (used as the fallback)
 */

import type Anthropic from "@anthropic-ai/sdk";

/** Default model for user-facing AI generations (horoscope, Dolly, journal, etc.). */
export const CLAUDE_MODEL = "claude-sonnet-4-6";

/**
 * Fallback model used automatically if the primary call fails (e.g. the primary
 * model was retired, is temporarily overloaded, or returns a 404/5xx). A
 * different model family means a single deprecation can't take everything down.
 */
export const FALLBACK_MODEL = "claude-haiku-4-5-20251001";

/**
 * Create a (non-streaming) message with automatic model fallback. Pass every
 * parameter EXCEPT `model` — this sets the model for you and retries once with
 * FALLBACK_MODEL if the primary call throws.
 */
export async function createMessageResilient(
  client: Anthropic,
  params: Omit<Anthropic.Messages.MessageCreateParamsNonStreaming, "model">,
): Promise<Anthropic.Messages.Message> {
  try {
    return await client.messages.create({ ...params, model: CLAUDE_MODEL });
  } catch (err) {
    console.error(
      "[ai] primary model failed, retrying with fallback:",
      err instanceof Error ? err.message : String(err),
    );
    return await client.messages.create({ ...params, model: FALLBACK_MODEL });
  }
}
