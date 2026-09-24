/**
 * Prompt caching: paying once for the parts of a prompt that never change.
 *
 * Anthropic will store a prefix of a request and bill a later identical
 * prefix at a tenth of the input rate, against 1.25x to write it. For a chat
 * that re-sends the same system prompt, the same birth chart and the same
 * conversation on every turn, that is most of the bill.
 *
 * Nothing in Mapped used it. A Dolly message carried roughly 6,500 tokens of
 * byte-identical context — an 11,000-character system prompt, the chart
 * summary, the precomputed depth and timing, and up to twelve saved people's
 * entire charts — and bought all of it again on every single turn. A
 * twenty-message conversation paid for the same chart twenty times.
 *
 * The one rule that makes it work: caching matches a PREFIX. Everything
 * before a breakpoint must be byte-identical to last time, so the blocks have
 * to be ordered most-stable-first. A single volatile line early — today's
 * date, the passages retrieved for this question — invalidates everything
 * after it and the cache never hits. That ordering is the whole mechanism,
 * and it is easy to break by adding a block in the obvious place, which is
 * why this lives in one tested function rather than inline at each call site.
 */

import type Anthropic from "@anthropic-ai/sdk";

/** Anthropic allows four cache breakpoints per request. */
export const MAX_BREAKPOINTS = 4;

const EPHEMERAL = { type: "ephemeral" } as const;

export interface CachedSystemInput {
  /**
   * Identical for every user — the persona and the rules. Cached first and on
   * its own, so it stays warm from all readers' traffic together rather than
   * one person's.
   */
  base: string;
  /**
   * This reader's own long-lived context: their chart, the people on their
   * map. Changes when they edit something, not between messages.
   */
  stable?: string[];
  /**
   * Everything that changes from message to message — what Dolly remembers,
   * recent journal entries, today's sky, passages retrieved for this
   * question. Deliberately NOT cached: writing a cache entry costs more than
   * sending the tokens plainly, and one that is never read back is pure loss.
   */
  volatile?: string[];
}

/**
 * The `system` field, as ordered blocks with breakpoints.
 *
 * Two breakpoints, not more. Each one costs something to write, so splitting
 * into many small cached blocks is worse than a few large ones — and a block
 * that never gets read back is a loss, not a saving.
 */
export function cachedSystem({ base, stable, volatile }: CachedSystemInput): Anthropic.TextBlockParam[] {
  const blocks: Anthropic.TextBlockParam[] = [
    { type: "text", text: base, cache_control: EPHEMERAL },
  ];

  const stableText = (stable ?? []).filter((p) => p?.trim()).join("\n");
  if (stableText) {
    blocks.push({ type: "text", text: `---\n\n${stableText}`, cache_control: EPHEMERAL });
  }

  const volatileText = (volatile ?? []).filter((p) => p?.trim()).join("\n");
  if (volatileText) {
    blocks.push({ type: "text", text: `---\n\n${volatileText}` });
  }

  return blocks;
}

/**
 * Below this many messages, caching the conversation loses money: a cache
 * entry costs 1.25x to write, so storing two short lines to save a tenth of
 * two short lines is worse than not bothering.
 */
export const HISTORY_CACHE_MIN_MESSAGES = 5;

/**
 * Mark the conversation so far as cacheable.
 *
 * The breakpoint goes on the last message BEFORE the new question, because
 * everything up to there is exactly what the next turn will send again — the
 * longest prefix worth storing. Each turn then reads the whole conversation
 * back at a tenth of the rate and writes only the turn just added.
 *
 * Returns a new array; the input is not modified.
 */
export function withCachedHistory(
  messages: readonly Anthropic.MessageParam[],
  minMessages = HISTORY_CACHE_MIN_MESSAGES,
): Anthropic.MessageParam[] {
  const out = [...messages];
  const lastPrior = out.length - 2;
  if (out.length < minMessages || lastPrior < 0) return out;

  const turn = out[lastPrior];
  // Only the plain-string form. Anything already in block form has its own
  // structure — possibly its own breakpoint — and rewriting it blind could
  // push the request over the four-breakpoint limit.
  if (typeof turn.content !== "string") return out;

  out[lastPrior] = {
    role: turn.role,
    content: [{ type: "text", text: turn.content, cache_control: EPHEMERAL }],
  };
  return out;
}

/** How many breakpoints a request is using, for the limit check. */
export function countBreakpoints(
  system: readonly Anthropic.TextBlockParam[],
  messages: readonly Anthropic.MessageParam[],
): number {
  let n = system.filter((b) => b.cache_control).length;
  for (const m of messages) {
    if (typeof m.content === "string") continue;
    for (const block of m.content) {
      if (typeof block === "object" && "cache_control" in block && block.cache_control) n++;
    }
  }
  return n;
}
