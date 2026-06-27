/**
 * Lightweight, dependency-free client error monitoring.
 *
 * Captures uncaught client errors + unhandled promise rejections (and anything
 * reported manually via captureError) and posts them to /api/client-error,
 * which logs them server-side (visible in your Vercel logs) and — once a Sentry
 * DSN is configured — forwards them to Sentry. No SDK or build-time dependency.
 *
 * Deduplicates identical errors and caps how many are sent per session so a
 * looping error can't spam the endpoint.
 */

let installed = false;
const seen = new Set<string>();
let sentCount = 0;
const MAX_PER_SESSION = 25;

export function captureError(error: unknown, context?: Record<string, unknown>): void {
  try {
    if (typeof window === "undefined" || sentCount >= MAX_PER_SESSION) return;
    const err = error instanceof Error ? error : new Error(typeof error === "string" ? error : JSON.stringify(error));
    const sig = `${err.name}:${err.message}:${(err.stack || "").slice(0, 160)}`;
    if (seen.has(sig)) return;
    seen.add(sig);
    sentCount++;

    const payload = {
      name: err.name,
      message: err.message?.slice(0, 1000),
      stack: err.stack?.slice(0, 4000),
      url: window.location.href,
      userAgent: navigator.userAgent,
      ts: new Date().toISOString(),
      context,
    };
    // keepalive lets the report send even during navigation/unload.
    fetch("/api/client-error", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => { /* monitoring must never throw */ });
  } catch { /* ignore */ }
}

/** Install global handlers once. Safe to call multiple times. */
export function initErrorMonitor(): void {
  if (installed || typeof window === "undefined") return;
  installed = true;
  window.addEventListener("error", (e) => captureError(e.error ?? e.message, { kind: "window.onerror" }));
  window.addEventListener("unhandledrejection", (e) => captureError(e.reason, { kind: "unhandledrejection" }));
}
