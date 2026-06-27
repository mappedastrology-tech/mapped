"use client";

/**
 * BugReportModal — the shared bug/feedback capture flow.
 *
 * Controlled via `open` / `onClose`. When it opens it captures a screenshot of
 * the current view (html2canvas, best-effort), then collects the user's
 * description + category and standard diagnostic context, uploads the
 * screenshot to the private `bug-screenshots` Supabase bucket, inserts a row
 * into `bug_reports`, and pings the notify endpoint (best-effort email).
 *
 * Used by both the global floating BugReportButton and the Account screen row,
 * so the experience is identical everywhere.
 */

import { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION || "0.1.0";

type Category = "bug" | "suggestion" | "other";
type Phase = "capturing" | "form" | "submitting" | "success" | "error";

const CATEGORIES: { id: Category; label: string }[] = [
  { id: "bug", label: "Bug" },
  { id: "suggestion", label: "Suggestion" },
  { id: "other", label: "Other" },
];

export default function BugReportModal({
  open,
  onClose,
  defaultCategory = "bug",
}: {
  open: boolean;
  onClose: () => void;
  defaultCategory?: Category;
}) {
  const pathname = usePathname();
  const [phase, setPhase] = useState<Phase>("capturing");
  const [category, setCategory] = useState<Category>(defaultCategory);
  const [description, setDescription] = useState("");
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [includeShot, setIncludeShot] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // On open: reset, then capture the current screen before showing the form.
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setPhase("capturing");
    setCategory(defaultCategory);
    setDescription("");
    setScreenshot(null);
    setIncludeShot(true);
    setErrorMsg("");
    (async () => {
      try {
        const html2canvas = (await import("html2canvas")).default;
        const canvas = await html2canvas(document.body, {
          backgroundColor: null,
          scale: Math.min(window.devicePixelRatio || 1, 1.5),
          useCORS: true,
          logging: false,
          ignoreElements: (el) => el.hasAttribute?.("data-bugreport-ignore"),
          windowWidth: document.documentElement.clientWidth,
          windowHeight: document.documentElement.clientHeight,
        });
        if (!cancelled) setScreenshot(canvas.toDataURL("image/jpeg", 0.7));
      } catch {
        /* screenshot is optional */
      } finally {
        if (!cancelled) setPhase("form");
      }
    })();
    return () => { cancelled = true; };
  }, [open, defaultCategory]);

  const submit = useCallback(async () => {
    if (!description.trim()) return;
    setPhase("submitting");
    setErrorMsg("");
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const uid = session?.user?.id ?? null;

      let screenshotPath: string | null = null;
      if (includeShot && screenshot && uid) {
        try {
          const blob = await (await fetch(screenshot)).blob();
          const path = `${uid}/${Date.now()}.jpg`;
          const { error: upErr } = await supabase.storage
            .from("bug-screenshots")
            .upload(path, blob, { contentType: "image/jpeg", upsert: false });
          if (!upErr) screenshotPath = path;
        } catch {
          /* screenshot optional */
        }
      }

      const payload = {
        user_id: uid,
        user_email: session?.user?.email ?? null,
        category,
        description: description.trim(),
        route: pathname,
        app_version: APP_VERSION,
        user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
        viewport: typeof window !== "undefined" ? `${window.innerWidth}x${window.innerHeight}` : null,
        screenshot_path: screenshotPath,
        metadata: { language: typeof navigator !== "undefined" ? navigator.language : null },
      };

      const { error } = await supabase.from("bug_reports").insert(payload);
      if (error) throw error;

      // Best-effort email notification — never blocks the user.
      try {
        void fetch("/api/bug-report-notify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, has_screenshot: !!screenshotPath }),
          keepalive: true,
        });
      } catch { /* ignore */ }

      setPhase("success");
      setTimeout(onClose, 1600);
    } catch (err) {
      console.error("[bug-report] submit failed:", err);
      setErrorMsg("Couldn't send the report. Please try again in a moment.");
      setPhase("error");
    }
  }, [description, category, includeShot, screenshot, pathname, onClose]);

  if (!open) return null;

  return (
    <div
      data-bugreport-ignore
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4"
      onClick={phase === "submitting" ? undefined : onClose}
    >
      <div
        className="w-full sm:max-w-md bg-background rounded-t-2xl sm:rounded-2xl border border-foreground/15 shadow-xl p-5 max-h-[90dvh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {phase === "success" ? (
          <div className="py-8 text-center">
            <div className="mx-auto mb-3 w-10 h-10 rounded-full bg-sage/15 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--sage, #7a8b6f)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <p className="text-foreground text-base" style={{ fontFamily: "var(--font-display)" }}>Thank you</p>
            <p className="text-muted text-sm mt-1">Your report was sent. We&apos;ll take a look.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-foreground text-lg" style={{ fontFamily: "var(--font-display)" }}>Report a bug</h2>
              <button type="button" onClick={onClose} aria-label="Close" disabled={phase === "submitting"} className="text-muted hover:text-foreground p-1 -mr-1">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-muted text-xs mb-4">
              Tell us what went wrong or felt off. We&apos;ll attach the current screen and your device details to help us fix it.
            </p>

            {/* Category chips */}
            <div className="flex gap-2 mb-3">
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategory(c.id)}
                  disabled={phase === "submitting"}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    category === c.id
                      ? "bg-terracotta text-cream border-terracotta"
                      : "border-foreground/15 text-secondary hover:border-foreground/30"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            <label htmlFor="bug-desc" className="sr-only">What happened?</label>
            <textarea
              id="bug-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={category === "suggestion" ? "What would make this better?" : "What happened? What did you expect instead?"}
              rows={4}
              autoFocus
              disabled={phase === "submitting"}
              className="w-full rounded-xl border border-foreground/15 bg-surface px-3 py-2.5 text-sm text-foreground placeholder:text-muted/70 focus:outline-none focus:border-terracotta/40 resize-none"
            />

            {screenshot && (
              <label className="flex items-center gap-2.5 mt-3 cursor-pointer select-none">
                <input type="checkbox" checked={includeShot} onChange={(e) => setIncludeShot(e.target.checked)} disabled={phase === "submitting"} className="accent-terracotta w-4 h-4" />
                <span className="text-secondary text-xs flex items-center gap-2">
                  Attach screenshot
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={screenshot} alt="Screenshot preview" className="h-9 w-auto rounded border border-foreground/10" />
                </span>
              </label>
            )}

            <div className="mt-3 text-[10px] text-muted/80">
              Includes: {pathname} · v{APP_VERSION} · your device &amp; browser
            </div>

            {errorMsg && <p className="text-terracotta text-xs mt-3">{errorMsg}</p>}

            <div className="flex gap-2 mt-5">
              <button type="button" onClick={onClose} disabled={phase === "submitting"} className="flex-1 py-2.5 rounded-full border border-foreground/15 text-secondary text-sm font-medium hover:bg-foreground/5 transition-colors disabled:opacity-60">
                Cancel
              </button>
              <button
                type="button"
                onClick={submit}
                disabled={!description.trim() || phase === "submitting" || phase === "capturing"}
                className="flex-1 py-2.5 rounded-full bg-terracotta text-cream text-sm font-semibold hover:bg-terracotta-light active:scale-[0.98] transition-all disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
              >
                {phase === "submitting" ? (
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
