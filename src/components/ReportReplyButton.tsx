"use client";

/**
 * "Report this reply" — a small flag under an AI-written reply, and the sheet
 * it opens.
 *
 * Required for store review: Google Play's AI-Generated Content policy wants
 * people able to flag offensive AI output without leaving the app, and Apple's
 * 1.2 / 4.7 ask the same of chatbot apps. See lib/dollyReport.ts.
 *
 * Used on both Dolly screens — the mobile tab and WebDolly on desktop — so it
 * styles itself from the global tokens in globals.css rather than either
 * screen's own, and renders the sheet into document.body through a portal.
 * The portal is not decoration: the reply rows animate in with a transform,
 * and a position:fixed sheet inside a transformed parent is positioned
 * against that parent instead of the screen.
 *
 * Deliberately quiet. It sits under every reply, so it is a muted icon with a
 * label for screen readers, not a button that competes with what Dolly said.
 */

import { useCallback, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { authedFetch } from "@/lib/authedFetch";
import { useDialogKeys } from "@/lib/useDialogKeys";
import {
  REPORT_REASONS,
  REPORT_REASON_LABELS,
  REPORT_NOTE_MAX,
  REPORT_THANKS,
  type ReportReason,
  type ReportSource,
} from "@/lib/dollyReport";

type Phase = "choosing" | "sending" | "sent";

export default function ReportReplyButton({
  replyText,
  source = "dolly",
  conversationId,
  messageId,
  style,
}: {
  /** The reply exactly as the reader saw it (prose, without the meta line). */
  replyText: string;
  source?: ReportSource;
  conversationId?: string | null;
  messageId?: string | null;
  /** Placement tweaks from the screen that hosts it. */
  style?: React.CSSProperties;
}) {
  const [open, setOpen] = useState(false);
  const [reported, setReported] = useState(false);
  const [phase, setPhase] = useState<Phase>("choosing");
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const noteId = useId();

  const close = useCallback(() => {
    if (phase === "sending") return;
    setOpen(false);
    // A sent report stays sent. Anything else starts fresh next time.
    if (phase !== "sent") { setReason(null); setNote(""); setError(null); }
  }, [phase]);
  useDialogKeys(open, sheetRef, close);

  async function send() {
    if (!reason || phase === "sending") return;
    setPhase("sending");
    setError(null);
    try {
      const res = await authedFetch("/api/dolly/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason, note, replyText, source, conversationId, messageId }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(typeof body.error === "string" && body.error ? body.error : "We couldn't send that report just now. Please try again.");
      }
      setPhase("sent");
      setReported(true);
    } catch (err) {
      setPhase("choosing");
      setError(err instanceof Error ? err.message : "We couldn't send that report just now. Please try again.");
    }
  }

  const sheet = open && (
    <div
      onClick={close}
      style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}
    >
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 440, margin: 12, borderRadius: 18,
          background: "var(--card)", border: "1px solid var(--border-card)",
          padding: 20, boxShadow: "0 12px 40px rgba(0,0,0,0.4)",
          paddingBottom: "max(20px, env(safe-area-inset-bottom))",
          color: "var(--foreground)",
        }}
      >
        {phase === "sent" ? (
          <>
            <p id={titleId} role="status" style={{ fontSize: 15, lineHeight: 1.5, margin: "0 0 16px" }}>
              {REPORT_THANKS}
            </p>
            <button
              onClick={close}
              style={{ width: "100%", minHeight: 44, borderRadius: 12, background: "transparent", color: "var(--foreground)", border: "1px solid var(--border-card)", fontWeight: 600, fontSize: 14, cursor: "pointer" }}
            >
              Close
            </button>
          </>
        ) : (
          <>
            <p id={titleId} style={{ fontFamily: "var(--font-serif)", fontSize: 17, margin: "0 0 4px" }}>
              Report this reply
            </p>
            <p style={{ fontSize: 13, lineHeight: 1.5, color: "var(--foreground-muted)", margin: "0 0 14px" }}>
              What&rsquo;s wrong with it?
            </p>
            <fieldset style={{ border: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
              <legend className="sr-only">Reason</legend>
              {REPORT_REASONS.map((r) => {
                const on = reason === r;
                return (
                  <label
                    key={r}
                    style={{
                      display: "flex", alignItems: "center", gap: 10, minHeight: 44, padding: "0 14px",
                      borderRadius: 12, cursor: "pointer", fontSize: 14,
                      border: `1px solid ${on ? "var(--brass)" : "var(--border-card)"}`,
                    }}
                  >
                    <input
                      type="radio"
                      name={`${titleId}-reason`}
                      value={r}
                      checked={on}
                      onChange={() => setReason(r)}
                      style={{ accentColor: "var(--brass)" }}
                    />
                    {REPORT_REASON_LABELS[r]}
                  </label>
                );
              })}
            </fieldset>
            <label htmlFor={noteId} style={{ display: "block", fontSize: 13, color: "var(--foreground-muted)", margin: "14px 0 6px" }}>
              Anything you&rsquo;d like to add? (optional)
            </label>
            <textarea
              id={noteId}
              value={note}
              onChange={(e) => setNote(e.target.value.slice(0, REPORT_NOTE_MAX))}
              rows={3}
              // 16px, or iOS zooms the page when the field takes focus.
              style={{ width: "100%", fontSize: 16, lineHeight: 1.4, padding: "10px 12px", borderRadius: 12, border: "1px solid var(--border-card)", background: "transparent", color: "var(--foreground)", resize: "vertical", boxSizing: "border-box" }}
            />
            {error && (
              <p role="alert" style={{ fontSize: 13, color: "var(--danger-text)", margin: "10px 0 0" }}>{error}</p>
            )}
            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button
                onClick={close}
                disabled={phase === "sending"}
                style={{ flex: 1, minHeight: 44, borderRadius: 12, background: "transparent", color: "var(--foreground-muted)", border: "1px solid var(--border-card)", fontWeight: 600, fontSize: 14, cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                onClick={send}
                disabled={!reason || phase === "sending"}
                style={{ flex: 1, minHeight: 44, borderRadius: 12, background: "var(--brass)", color: "var(--btn-primary-text)", border: "none", fontWeight: 600, fontSize: 14, cursor: "pointer", opacity: !reason || phase === "sending" ? 0.5 : 1 }}
              >
                {phase === "sending" ? "Sending…" : "Send"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={reported ? "Reply reported" : "Report this reply"}
        title={reported ? "Reported" : "Report this reply"}
        style={{
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          // A 44px target (the platform minimum) around a 14px mark, pulled
          // in by the margin so it doesn't push the thread apart.
          width: 44, height: 44, margin: "-10px 0 -10px -12px", borderRadius: 99, background: "transparent", border: "none",
          color: "var(--foreground-muted)", opacity: reported ? 0.9 : 0.6, cursor: "pointer", padding: 0,
          ...style,
        }}
      >
        <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill={reported ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 22V4" />
          <path d="M4 4h12l-2 4 2 4H4" />
        </svg>
      </button>
      {/* Only ever open after a tap, so document exists by then — the
          static prerender always renders this closed. */}
      {sheet ? createPortal(sheet, document.body) : null}
    </>
  );
}
