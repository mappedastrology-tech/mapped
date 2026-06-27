import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/bug-report-notify
 *
 * Best-effort email notification when a bug report is filed. The report itself
 * is already saved to Supabase by the client; this just pings the maintainer.
 *
 * Uses Resend's REST API (no SDK / dependency needed). Configure in Vercel:
 *   RESEND_API_KEY     — your Resend API key
 *   BUG_REPORT_TO      — recipient (defaults to contacttaylorsometimes@gmail.com)
 *   BUG_REPORT_FROM    — verified sender (defaults to onboarding@resend.dev for testing)
 *
 * If RESEND_API_KEY is unset, this no-ops gracefully so nothing breaks before
 * email is configured.
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limit so this can't be abused as an open email/spam relay.
    const { checkRateLimitDurable, getClientIP } = await import("@/lib/rateLimit");
    const ip = getClientIP(request);
    const { allowed } = await checkRateLimitDurable(`bug-notify:${ip}`, 5, 60 * 60 * 1000);
    if (!allowed) {
      return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
    }

    const r = await request.json();
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ ok: true, skipped: "RESEND_API_KEY not set" });
    }

    const to = process.env.BUG_REPORT_TO || "contacttaylorsometimes@gmail.com";
    const from = process.env.BUG_REPORT_FROM || "Mapped Bug Reports <onboarding@resend.dev>";

    const category = String(r.category || "bug");
    const desc = String(r.description || "").slice(0, 4000);
    const subject = `[Mapped ${category}] ${desc.slice(0, 60)}${desc.length > 60 ? "…" : ""}`;

    const lines = [
      `Category: ${category}`,
      `From: ${r.user_email || "anonymous"}${r.user_id ? ` (${r.user_id})` : ""}`,
      `Screen: ${r.route || "unknown"}`,
      `App version: ${r.app_version || "unknown"}`,
      `Viewport: ${r.viewport || "unknown"}`,
      `Screenshot: ${r.has_screenshot ? "attached in Supabase Storage (bug-screenshots)" : "none"}`,
      `Device: ${r.user_agent || "unknown"}`,
      "",
      "Description:",
      desc,
      "",
      "— Review full reports in the Supabase dashboard → bug_reports table.",
    ];

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to,
        subject,
        text: lines.join("\n"),
        ...(r.user_email ? { reply_to: r.user_email } : {}),
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error("[bug-report-notify] Resend error:", res.status, detail);
      return NextResponse.json({ ok: false, status: res.status }, { status: 502 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[bug-report-notify] error:", err);
    // Notification failures must never surface to the user.
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
