import { NextRequest, NextResponse } from "next/server";
import { getAuthedContext } from "@/lib/apiAuth";
import { buildReportRow, REPORT_REASON_LABELS } from "@/lib/dollyReport";

import { withCors, corsPreflight } from "@/lib/cors";
export const runtime = "nodejs";

/**
 * POST /api/dolly/report
 *
 * "Report this reply" — saves one row in public.dolly_reports.
 * See lib/dollyReport.ts for why this exists (Google Play's AI-Generated
 * Content policy, Apple 1.2 / 4.7).
 *
 * Body: { reason, replyText, note?, source?, conversationId?, messageId? }
 *
 * The insert goes through the reader's own token, so RLS applies: the row can
 * only ever be written as the signed-in user. No service-role key is involved.
 *
 * After saving, it emails the maintainer that a report came in — reason and
 * report id only, never the reply text or the note. The reply can quote
 * someone's journal or describe their chart, and an inbox is not where that
 * belongs; the full report is read in the Supabase dashboard. Uses the same
 * Resend settings as /api/bug-report-notify, and is skipped when they are not
 * set.
 */

async function notifyMaintainer(reportId: string, reasonLabel: string, source: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;
  const to = process.env.BUG_REPORT_TO || "contacttaylorsometimes@gmail.com";
  const from = process.env.BUG_REPORT_FROM || "Mapped Bug Reports <onboarding@resend.dev>";
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to,
        subject: `[Mapped report] ${source === "journal" ? "Journal" : "Dolly"} reply: ${reasonLabel}`,
        text: [
          `Someone reported an AI reply as: ${reasonLabel}.`,
          `Report id: ${reportId}`,
          "",
          "Read it in the Supabase dashboard → Table editor → dolly_reports.",
          "(The reply text is not in this email on purpose — it can contain someone's personal details.)",
        ].join("\n"),
      }),
    });
    if (!res.ok) console.error("[dolly/report] Resend error:", res.status);
  } catch (err) {
    // The report is already saved. A failed email must never fail it.
    console.error("[dolly/report] notify failed:", err);
  }
}

async function handlePOST(request: NextRequest) {
  const ctx = await getAuthedContext(request);
  if (!ctx) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
  const { userId, supabase } = ctx;

  // Generous for a person, tight for a script: nobody honestly reports thirty
  // replies in a day, and this is a write anyone signed in can make.
  const { checkRateLimitDurable } = await import("@/lib/rateLimit");
  const { allowed } = await checkRateLimitDurable(`dolly-report:${userId}`, 30, 24 * 60 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json({ error: "You've sent a lot of reports today. Please try again tomorrow." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Could not read that report." }, { status: 400 });
  }

  const built = buildReportRow(body);
  if (!built.ok) {
    return NextResponse.json({ error: built.error }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("dolly_reports")
    .insert({ ...built.row, user_id: userId })
    .select("id")
    .single();

  if (error || !data) {
    console.error("[dolly/report] insert failed:", error?.code, error?.message);
    return NextResponse.json({ error: "We couldn't send that report just now. Please try again." }, { status: 500 });
  }

  await notifyMaintainer(data.id as string, REPORT_REASON_LABELS[built.row.reason], built.row.source);

  return NextResponse.json({ ok: true });
}

export const POST = withCors(handlePOST);
export const OPTIONS = corsPreflight;
