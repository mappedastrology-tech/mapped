/**
 * Where to send someone back to after they leave for Stripe.
 *
 * Checkout and the billing portal both need absolute return URLs, and both
 * used to build them from the request's Origin header with a hardcoded
 * fallback. That breaks in the native app, and breaks worse now that checkout
 * opens in the SYSTEM browser rather than the app's WebView (see
 * lib/openCheckout for why it has to).
 *
 * Inside Capacitor the page's origin is `https://localhost`, so the Origin
 * header on an API call from the app says `https://localhost` too. Stripe
 * would then redirect Safari to https://localhost/home?upgraded=true, which
 * resolves to nothing — the person pays, and lands on an error page.
 *
 * So the Origin header is used only when it is somewhere a browser can
 * actually reach, and otherwise this falls back to the public site. The two
 * routes also disagreed about what that fallback was: one pair said
 * mapped.app while the rest of the app said NEXT_PUBLIC_SITE_URL. One answer
 * now.
 */

const FALLBACK = process.env.NEXT_PUBLIC_SITE_URL || "https://mapped-olive.vercel.app";

/** Hosts that exist only inside the app or a dev machine. */
function isReachablePublicly(origin: string): boolean {
  try {
    const url = new URL(origin);
    if (url.protocol !== "http:" && url.protocol !== "https:") return false;
    const host = url.hostname.toLowerCase();
    if (host === "localhost" || host === "127.0.0.1" || host === "::1") return false;
    // A bare hostname with no dot cannot be resolved from outside.
    if (!host.includes(".")) return false;
    return true;
  } catch {
    return false;
  }
}

/**
 * The base URL to build Stripe return links from.
 *
 * `origin` is the request's Origin header, which may be absent, may be the
 * app's internal origin, or may be a dev machine.
 */
export function returnBaseUrl(origin: string | null | undefined): string {
  if (origin && isReachablePublicly(origin)) return origin.replace(/\/$/, "");
  return FALLBACK.replace(/\/$/, "");
}
