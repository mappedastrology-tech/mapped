/**
 * Reporting an AI reply — the shared rules.
 *
 * Why this exists: Google Play's AI-Generated Content policy requires an app
 * whose AI writes text to let people flag offensive output from inside the
 * app, without leaving it. Apple's guidelines 1.2 and 4.7 ask the same of
 * chatbot apps. So every reply Dolly writes carries a small "Report this reply"
 * control (components/ReportReplyButton), which posts to /api/dolly/report,
 * which saves one row in public.dolly_reports.
 *
 * The client, the route and the tests all read these constants, so the four
 * reasons cannot drift apart. The same four values are the CHECK constraint in
 * supabase/dolly_reports_schema.sql — change one, change both.
 */

export const REPORT_REASONS = ["harmful", "offensive", "inaccurate", "other"] as const;
export type ReportReason = (typeof REPORT_REASONS)[number];

/** What the reader sees for each reason, in the order shown. */
export const REPORT_REASON_LABELS: Record<ReportReason, string> = {
  harmful: "Harmful or unsafe",
  offensive: "Offensive",
  inaccurate: "Inaccurate or made up",
  other: "Something else",
};

/** Which part of the app wrote the reported text. */
export const REPORT_SOURCES = ["dolly", "journal"] as const;
export type ReportSource = (typeof REPORT_SOURCES)[number];

/**
 * How much of the reply is kept. Dolly's replies are capped at 1,024 output
 * tokens, so a real one is well under this; the limit only stops a client
 * posting a novel.
 */
export const REPORT_REPLY_MAX = 8000;
/** The optional note the reader writes. */
export const REPORT_NOTE_MAX = 1000;

/** Shown once the report is saved. */
export const REPORT_THANKS = "Thanks, this reply has been reported. We review every report.";

export function isReportReason(v: unknown): v is ReportReason {
  return typeof v === "string" && (REPORT_REASONS as readonly string[]).includes(v);
}

export function isReportSource(v: unknown): v is ReportSource {
  return typeof v === "string" && (REPORT_SOURCES as readonly string[]).includes(v);
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Turn a request body into the row to insert, or say what is wrong with it.
 *
 * Pure, so the tests can call it without a database. user_id is NOT taken
 * from here: the route sets it from the verified session, never from the body.
 */
export function buildReportRow(body: unknown):
  | { ok: true; row: { source: ReportSource; reason: ReportReason; reply_text: string; note: string | null; conversation_id: string | null; message_id: string | null } }
  | { ok: false; error: string } {
  if (!body || typeof body !== "object") return { ok: false, error: "Could not read that report." };
  const b = body as Record<string, unknown>;

  if (!isReportReason(b.reason)) return { ok: false, error: "Pick a reason for the report." };

  const reply = typeof b.replyText === "string" ? b.replyText.trim() : "";
  if (!reply) return { ok: false, error: "There is no reply to report." };

  const source: ReportSource = isReportSource(b.source) ? b.source : "dolly";

  const note = typeof b.note === "string" ? b.note.trim().slice(0, REPORT_NOTE_MAX) : "";

  // A conversation id is only kept when it is a real row id. The mobile
  // screen uses "local-<day>" for a chat that has not been saved yet, and the
  // desktop screen keeps no id at all.
  const conversationId = typeof b.conversationId === "string" && UUID.test(b.conversationId) ? b.conversationId : null;
  const messageId = typeof b.messageId === "string" && b.messageId ? b.messageId.slice(0, 120) : null;

  return {
    ok: true,
    row: {
      source,
      reason: b.reason,
      reply_text: reply.slice(0, REPORT_REPLY_MAX),
      note: note || null,
      conversation_id: conversationId,
      message_id: messageId,
    },
  };
}
