/**
 * Where to send someone after they sign in, and how to get them there.
 *
 * On the desktop website, a signed-out visitor who clicked "Almanac" in the
 * header, a feature card, or a footer link was bounced by the (tabs) layout
 * back to "/" — the landing page they were already on — so every click looked
 * like a reload. Those links now go to /welcome with the page they wanted as
 * `next`, and /welcome returns them there after signing in.
 */

/** Pages a signed-out visitor can open as they are. */
const PUBLIC_PREFIXES = ["/library", "/privacy", "/terms", "/welcome", "/onboarding", "/auth"];

/**
 * A `next` value that is safe to navigate to: a path on this site only.
 * Anything else ("//evil.example", "https://…", missing) gives the fallback.
 */
export function safeNext(next: string | null | undefined, fallback = "/home"): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return fallback;
  return next;
}

/** The link a signed-out visitor should follow for `href`. */
export function signedOutHref(href: string): string {
  if (!href.startsWith("/") || href.startsWith("/#") || href === "/") return href;
  if (PUBLIC_PREFIXES.some((p) => href === p || href.startsWith(`${p}/`) || href.startsWith(`${p}?`))) return href;
  return `/welcome?next=${encodeURIComponent(href)}`;
}
