/**
 * goBack — router.back() with somewhere to land.
 *
 * `router.back()` is a no-op when there is nothing behind the current page: the
 * tap does nothing and the user is stranded. That is not an edge case here — it
 * is the normal state for a deep link, a shared URL, a page opened in a new tab,
 * and every cold start of the Capacitor app, which boots the webview straight at
 * a route.
 *
 * `history.length > 1` is the usual test and it is wrong often enough to matter:
 * it counts the whole browsing session, so a webview seeded with a blank entry
 * (or a user who typed a URL after other navigations) reports > 1 while this app
 * still has nowhere of its own to return to. Instead we record the history depth
 * at the moment this module first evaluates — i.e. on the app's entry page — and
 * treat "deeper than that" as proof the user navigated here from inside the app.
 * Same depth means they arrived directly, so we send them to the fallback.
 */

// Captured once, on the entry page, before any in-app navigation has happened.
const ENTRY_DEPTH = typeof window === "undefined" ? 0 : window.history.length;

export function goBack(fallback: string, push: (href: string) => void): void {
  if (typeof window !== "undefined" && window.history.length > ENTRY_DEPTH) {
    window.history.back();
    return;
  }
  push(fallback);
}
