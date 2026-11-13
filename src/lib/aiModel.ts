/**
 * Central Claude model configuration + a resilient message helper.
 *
 * All AI routes (horoscope, Dolly, journal, chart interpretation, wizard)
 * import from here so the model can be updated in ONE place. Anthropic retires
 * dated model snapshots over time; when that happens, change it here only.
 *
 * Current models:
 *   claude-opus-5-5   — most capable ($4 / $20 per MTok)
 *   claude-sonnet-5   — balanced quality/cost ($2 / $10), the default here
 *   claude-haiku-5-5  — fastest/cheapest ($0.10 / $0.50), the fallback
 */

import type Anthropic from "@anthropic-ai/sdk";

/**
 * Thinking off, explicitly.
 *
 * This app has never used extended thinking: Dolly is a conversation, and a
 * pause while she reasons costs output tokens and makes her slower to start
 * talking, for no gain on "what does Saturn square Moon mean for me".
 *
 * On the older models that was the DEFAULT — omit `thinking` and none happens.
 * On every current model it is the opposite: omit it and adaptive thinking
 * runs. Migrating without this line would have quietly turned thinking on for
 * every reply in the app, which is slower and dearer — the exact opposite of
 * why the models were changed.
 */
export const THINKING_OFF = { type: "disabled" } as const;

/**
 * Default model for user-facing AI generations (horoscope, Dolly, journal, etc.).
 *
 * Sonnet 5, not Sonnet 5.5, and the reason is worth keeping. They cost the
 * same ($2 / $10), and 5.5 is the newer model — but on 5.5 `thinking:
 * disabled` is rejected, and the only way to turn thinking off there is
 * `{type: "between_tools"}`, which the pinned SDK (0.82.0) does not have in
 * its types. So on 5.5 this app would have to let every Dolly reply think
 * first. Sonnet 5 takes `disabled`, bills the same, and leaves her behaving
 * exactly as she does today — a third cheaper than Sonnet 4.6 with nothing
 * else changed. Revisit when the SDK is upgraded.
 */
export const CLAUDE_MODEL = "claude-sonnet-5";

/**
 * Fallback model used automatically if the primary call fails (e.g. the primary
 * model was retired, is temporarily overloaded, or returns a 404/5xx). A
 * different model family means a single deprecation can't take everything down.
 */
export const FALLBACK_MODEL = "claude-haiku-5-5";

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
    return await client.messages.create({ thinking: THINKING_OFF, ...params, model: CLAUDE_MODEL });
  } catch (err) {
    console.error(
      "[ai] primary model failed, retrying with fallback:",
      err instanceof Error ? err.message : String(err),
    );
    return await client.messages.create({ thinking: THINKING_OFF, ...params, model: FALLBACK_MODEL });
  }
}
