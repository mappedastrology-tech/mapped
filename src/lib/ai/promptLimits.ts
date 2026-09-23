/**
 * Bounds on what a client may put into an AI prompt.
 *
 * Everything the chat routes send to the model — the message, the history,
 * the chart, the connections, the journal and tarot context — arrives from the
 * browser, and none of it was capped.
 *
 * The two guards that exist do not cover this. The per-day rate limit bounds
 * how MANY requests someone can make, not how big each one is. The monthly
 * spend ceiling is checked BEFORE a call is made, so it can refuse the next
 * request but cannot make the current one smaller — one oversized message can
 * overshoot the remaining budget by a wide margin.
 *
 * At Sonnet's input price, a request near the hosting platform's payload limit
 * is worth several dollars. A Mapped+ subscriber's entire monthly AI budget is
 * $5. So an uncapped prompt costs real money AND burns through the reader's own
 * allowance, leaving Dolly silent for the rest of the month — the failure is
 * felt by the person who did nothing wrong.
 *
 * The numbers are deliberately generous. A long question is a few hundred
 * characters; four thousand is an essay. Anything above these is a runaway
 * client or someone probing, not a person asking about their chart.
 */

export const PROMPT_LIMITS = {
  /** A single user message. */
  message: 4_000,
  /** Each remembered turn. */
  historyTurn: 4_000,
  /** How many turns of history travel with a request. */
  historyTurns: 20,
  /** People on the reader's map included as context. A chart each is not small. */
  connections: 12,
  /** Journal / tarot context blocks sent by the client. */
  context: 4_000,
} as const;

/**
 * Trim text to a bound, marking it when something was removed.
 *
 * The marker matters: without it a truncated question reads to the model as a
 * complete one that simply stops mid-sentence, and the reply addresses the
 * fragment as though it were the whole thought.
 */
export function clampText(text: unknown, max: number): string {
  if (typeof text !== "string") return "";
  if (max <= 0) return "";
  return text.length <= max ? text : text.slice(0, max) + "\n[…trimmed]";
}

/** One conversation turn as the client sends it. */
export interface HistoryTurn {
  role: "user" | "assistant";
  content: string;
}

/**
 * The last N turns, each trimmed, with consecutive same-role turns dropped.
 *
 * The API requires alternating roles. Collapsing here rather than at the call
 * site means a client that sends two user turns in a row cannot produce a
 * request the model rejects.
 */
export function boundHistory(
  history: readonly HistoryTurn[] | undefined,
  limits: { historyTurns: number; historyTurn: number } = PROMPT_LIMITS,
): HistoryTurn[] {
  if (!history?.length) return [];
  const out: HistoryTurn[] = [];
  for (const turn of history.slice(-limits.historyTurns)) {
    if (turn?.role !== "user" && turn?.role !== "assistant") continue;
    if (out.length > 0 && out[out.length - 1].role === turn.role) continue;
    out.push({ role: turn.role, content: clampText(turn.content, limits.historyTurn) });
  }
  return out;
}
