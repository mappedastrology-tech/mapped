import { supabase } from "@/lib/supabase";
import { dollyBody } from "@/lib/dollyReply";

/**
 * Reporting one Dolly reply.
 *
 * The general "report a bug" button cannot say WHICH answer was wrong, and by
 * the time someone describes it in their own words the reply itself is gone.
 * This captures the exact reply, the question that produced it and a reason,
 * and saves them to `dolly_reply_reports` (see the migration of the same name)
 * under the person's own account, then pings the existing email alert.
 */

export type DollyReportReason = "wrong" | "unhelpful" | "harmful" | "offensive" | "other";

/** Order is the order shown. Labels are what the person reads. */
export const DOLLY_REPORT_REASONS: { id: DollyReportReason; label: string }[] = [
  { id: "wrong", label: "It got my chart or the sky wrong" },
  { id: "unhelpful", label: "It wasn't helpful" },
  { id: "harmful", label: "It gave unsafe or harmful advice" },
  { id: "offensive", label: "It was upsetting or offensive" },
  { id: "other", label: "Something else" },
];

/** Mirrors the CHECK limits in the migration, so the insert never trips them. */
export const LIMITS = { reply: 20000, prompt: 8000, note: 2000 } as const;

export interface DollyReportInput {
  messageId: string;
  /** The reply as stored, meta line included: it is what Dolly actually sent. */
  replyText: string;
  /** The person's message just before the reply, if there was one. */
  promptText?: string | null;
  /** YYYY-MM-DD of the chat the reply sits in. */
  day?: string | null;
  reason: DollyReportReason;
  note?: string;
  surface: "mobile" | "desktop";
}

export type DollyReportResult = "sent" | "already" | "signed_out" | "failed";

const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION || "0.1.0";

function clip(s: string | null | undefined, max: number): string | null {
  const t = (s ?? "").trim();
  return t ? t.slice(0, max) : null;
}

/** The row to insert. Pure, so the limits and shape can be tested. */
export function buildReportRow(input: DollyReportInput, userId: string) {
  return {
    user_id: userId,
    message_id: input.messageId.slice(0, 200),
    conversation_day: /^\d{4}-\d{2}-\d{2}$/.test(input.day ?? "") ? input.day : null,
    reply_text: clip(input.replyText, LIMITS.reply) ?? "",
    prompt_text: clip(input.promptText, LIMITS.prompt),
    reason: input.reason,
    note: clip(input.note, LIMITS.note),
    surface: input.surface,
    app_version: APP_VERSION,
    user_agent: typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 500) : null,
  };
}

/**
 * The person's message that a reply answered: the nearest earlier message from
 * them. Skips notices and crisis cards, which carry no question.
 */
export function promptBefore<T>(
  list: T[],
  index: number,
  isUser: (m: T) => boolean,
  text: (m: T) => string,
): string | null {
  for (let i = index - 1; i >= 0; i--) {
    if (isUser(list[i])) return text(list[i]) || null;
  }
  return null;
}

export async function submitDollyReport(input: DollyReportInput): Promise<DollyReportResult> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const uid = session?.user?.id;
    if (!uid) return "signed_out";

    const row = buildReportRow(input, uid);
    if (!row.reply_text) return "failed";

    const { error } = await supabase.from("dolly_reply_reports").insert(row);
    // The same reply reported twice: the unique constraint says so, and the
    // person has already done what they meant to do.
    if (error?.code === "23505") return "already";
    if (error) throw error;

    // Best-effort email to the owner, through the same alert bug reports use.
    // Never blocks or fails the report.
    try {
      void fetch("/api/bug-report-notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: "dolly_reply",
          user_id: uid,
          user_email: session?.user?.email ?? null,
          route: input.surface === "desktop" ? "/dolly (desktop)" : "/dolly",
          app_version: APP_VERSION,
          user_agent: row.user_agent,
          reason: input.reason,
          description: row.note ?? "",
          // The prose only: the meta line is not readable in an email.
          reply_excerpt: (dollyBody(row.reply_text) || row.reply_text).slice(0, 800),
        }),
        keepalive: true,
      });
    } catch { /* ignore */ }

    return "sent";
  } catch (err) {
    console.error("[dolly-report] submit failed:", err);
    return "failed";
  }
}
