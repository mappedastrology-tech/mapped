/**
 * API base resolution for the native (Capacitor) builds.
 *
 * On the web the app and its API share an origin, so `fetch("/api/…")` works.
 * Inside Capacitor the page is served from `capacitor://localhost` (iOS) or
 * `http://localhost` (Android), where a root-relative URL points at the
 * bundled files rather than the API — every call would 404.
 *
 * `NEXT_PUBLIC_API_BASE` is set for app builds only (see scripts/build-app.mjs)
 * and points at the deployed web origin. When present we rewrite root-relative
 * /api URLs to absolute ones.
 *
 * This is installed as a `fetch` wrapper rather than an `apiUrl()` helper that
 * every call site must remember: there are ~30 call sites today, and any new
 * one that forgets would break only in the app, where it is least likely to be
 * noticed. Patching once keeps every existing and future caller correct.
 */

export const API_BASE = (process.env.NEXT_PUBLIC_API_BASE || "").replace(/\/$/, "");

/** Absolute URL for an API path. Returns the path unchanged on the web. */
export function apiUrl(path: string): string {
  if (!API_BASE) return path;
  return path.startsWith("/api") ? `${API_BASE}${path}` : path;
}

let installed = false;

/** Wrap window.fetch so root-relative /api calls resolve against API_BASE. */
export function installApiBase(): void {
  if (installed || !API_BASE || typeof window === "undefined") return;
  installed = true;

  const original = window.fetch.bind(window);
  window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
    if (typeof input === "string" && input.startsWith("/api")) {
      return original(apiUrl(input), init);
    }
    // Request objects carry an already-resolved absolute URL, so rebuild them
    // against API_BASE when they point at the local origin's /api path.
    if (input instanceof Request && new URL(input.url).pathname.startsWith("/api")) {
      const { pathname, search } = new URL(input.url);
      return original(new Request(`${API_BASE}${pathname}${search}`, input), init);
    }
    return original(input as RequestInfo, init);
  };
}
