"use client";

/**
 * DollyReportSheet — "Report this reply" for one Dolly answer.
 *
 * Opened from the small Report control under a Dolly reply, on mobile and on
 * desktop. The person picks a reason, can add a line, and sends; the reply
 * itself and the question before it are attached automatically (see
 * lib/dollyReport.ts). It is a real dialog for the same reasons the bug report
 * sheet is: role and aria-modal, Escape closes, Tab stays inside, and focus
 * goes back to the Report control afterwards.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import {
  DOLLY_REPORT_REASONS,
  LIMITS,
  submitDollyReport,
  type DollyReportInput,
  type DollyReportReason,
  type DollyReportResult,
} from "@/lib/dollyReport";

type Phase = "form" | "submitting" | "done" | "error";

export type DollyReportTarget = Omit<DollyReportInput, "reason" | "note">;

type Props = {
  /** The reply being reported. null keeps the sheet closed. */
  target: DollyReportTarget | null;
  onClose: () => void;
  /** Called once the report is saved, or was already saved before. */
  onReported: (messageId: string) => void;
};

/**
 * Keyed by the reply, so each report starts with a fresh form: no reason left
 * ticked from the last one, no stale "couldn't send".
 */
export default function DollyReportSheet({ target, onClose, onReported }: Props) {
  if (!target) return null;
  return <ReportDialog key={target.messageId} target={target} onClose={onClose} onReported={onReported} />;
}

function ReportDialog({
  target,
  onClose,
  onReported,
}: Omit<Props, "target"> & { target: DollyReportTarget }) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [reason, setReason] = useState<DollyReportReason | null>(null);
  const [note, setNote] = useState("");
  const [phase, setPhase] = useState<Phase>("form");
  const [errorMsg, setErrorMsg] = useState("");
  // Read by the key handler, so changing phase doesn't re-bind it (re-binding
  // would hand focus back to the opener mid-send).
  const phaseRef = useRef<Phase>("form");
  const closeRef = useRef(onClose);
  useEffect(() => {
    phaseRef.current = phase;
    closeRef.current = onClose;
  });

  const submit = useCallback(async () => {
    if (!reason) return;
    setPhase("submitting");
    setErrorMsg("");
    const result: DollyReportResult = await submitDollyReport({ ...target, reason, note });
    if (result === "sent" || result === "already") {
      onReported(target.messageId);
      setPhase("done");
      setTimeout(onClose, 1600);
      return;
    }
    setErrorMsg(
      result === "signed_out"
        ? "Sign in to report a reply, so we can follow up if we need to."
        : "Couldn't send the report. Please try again in a moment.",
    );
    setPhase("error");
  }, [target, reason, note, onReported, onClose]);

  // Dialog behaviour: Escape, focus trap, focus returned on close.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const opener = document.activeElement as HTMLElement | null;
    const selector =
      'button:not([disabled]), textarea:not([disabled]), input:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])';

    // Start on the first reason, so a keyboard user lands inside the sheet.
    const first = dialog.querySelector<HTMLElement>('input[type="radio"]');
    first?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (phaseRef.current !== "submitting") closeRef.current();
        return;
      }
      if (e.key !== "Tab") return;
      const items: HTMLElement[] = [];
      dialog.querySelectorAll(selector).forEach((node: Element) => {
        const el = node as HTMLElement;
        if (el.offsetParent !== null) items.push(el);
      });
      if (items.length === 0) return;
      const head = items[0];
      const tail = items[items.length - 1];
      if (e.shiftKey && document.activeElement === head) { e.preventDefault(); tail.focus(); }
      else if (!e.shiftKey && document.activeElement === tail) { e.preventDefault(); head.focus(); }
      else if (!dialog.contains(document.activeElement)) { e.preventDefault(); head.focus(); }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      opener?.focus?.();
    };
  }, []);

  const busy = phase === "submitting";

  return (
    <div
      data-bugreport-ignore
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4"
      onClick={busy ? undefined : onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dolly-report-title"
        className="w-full sm:max-w-md bg-background rounded-t-2xl sm:rounded-2xl border border-foreground/15 shadow-xl p-5 max-h-[90dvh] overflow-y-auto"
        style={{ paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))" }}
        onClick={(e) => e.stopPropagation()}
      >
        {phase === "done" ? (
          <div className="py-8 text-center" role="status">
            <div className="mx-auto mb-3 w-10 h-10 rounded-full bg-sage/15 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--sage, #7a8b6f)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <p className="text-foreground text-base" style={{ fontFamily: "var(--font-display)" }}>Thank you</p>
            <p className="text-muted text-sm mt-1">We&apos;ll look at this reply and use it to improve Dolly.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-1">
              <h2 id="dolly-report-title" className="text-foreground text-lg" style={{ fontFamily: "var(--font-display)" }}>
                Report this reply
              </h2>
              <button type="button" onClick={onClose} aria-label="Close" disabled={busy} className="text-muted hover:text-foreground p-1 -mr-1">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-muted text-xs mb-4">
              We&apos;ll send this reply and your message before it to the Mapped team, so we can fix how Dolly answers.
            </p>

            <fieldset disabled={busy} className="flex flex-col gap-1.5 mb-3">
              <legend className="text-secondary text-xs font-medium mb-1.5">What was wrong with it?</legend>
              {DOLLY_REPORT_REASONS.map((r) => (
                <label
                  key={r.id}
                  className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 cursor-pointer select-none transition-colors ${
                    reason === r.id ? "border-terracotta/60 bg-terracotta/5" : "border-foreground/15 hover:border-foreground/30"
                  }`}
                >
                  <input
                    type="radio"
                    name="dolly-report-reason"
                    value={r.id}
                    checked={reason === r.id}
                    onChange={() => setReason(r.id)}
                    className="accent-terracotta w-4 h-4"
                  />
                  <span className="text-foreground text-sm">{r.label}</span>
                </label>
              ))}
            </fieldset>

            <label htmlFor="dolly-report-note" className="text-secondary text-xs font-medium">
              Anything to add? <span className="text-muted font-normal">(optional)</span>
            </label>
            <textarea
              id="dolly-report-note"
              value={note}
              onChange={(e) => setNote(e.target.value.slice(0, LIMITS.note))}
              placeholder={reason === "wrong" ? "What should it have said?" : "Tell us what felt off."}
              rows={3}
              disabled={busy}
              className="w-full mt-1.5 rounded-xl border border-foreground/15 bg-surface px-3 py-2.5 text-base text-foreground placeholder:text-muted/70 focus:outline-none focus:border-terracotta/40 resize-none"
            />

            {errorMsg && <p className="text-terracotta text-xs mt-3" role="alert">{errorMsg}</p>}

            <div className="flex gap-2 mt-5">
              <button type="button" onClick={onClose} disabled={busy} className="flex-1 py-2.5 rounded-full border border-foreground/15 text-secondary text-sm font-medium hover:bg-foreground/5 transition-colors disabled:opacity-60">
                Cancel
              </button>
              <button
                type="button"
                onClick={submit}
                disabled={!reason || busy}
                className="flex-1 py-2.5 rounded-full bg-terracotta text-cream text-sm font-semibold hover:bg-terracotta-light active:scale-[0.98] transition-all disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
              >
                {busy ? (
                  <>
                    <span className="w-4 h-4 border-2 border-cream/40 border-t-cream rounded-full animate-spin" />
                    Sending…
                  </>
                ) : (
                  "Send report"
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
