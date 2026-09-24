"use client";

/**
 * Sending someone to Stripe, in a way the App Store allows.
 *
 * Apple's Guideline 3.1.1 says that to unlock features in your app you must
 * use in-app purchase, and that apps "may not use their own mechanisms to
 * unlock content or functionality". Since May 2025 there is one carve-out:
 *
 *   "In all other storefronts, except for the United States storefront,
 *    where this prohibition does not apply, apps and their metadata may not
 *    include buttons, external links, or other calls to action that direct
 *    customers to purchasing mechanisms other than in-app purchase."
 *
 * So on the US storefront you may LINK OUT to your own checkout, with no
 * entitlement and (currently) no commission. Everywhere else, IAP or nothing.
 *
 * The distinction that matters here is between linking out and taking the
 * payment yourself. Every call site used to do:
 *
 *     window.location.href = data.url;
 *
 * In a browser that is a normal redirect. Inside the Capacitor shell it
 * navigates the app's OWN WebView to Stripe, so the purchase happens within
 * the app — which is not a link-out under any reading, and is the single most
 * common reason a subscription app is rejected under 3.1.1.
 *
 * On native this now hands the URL to the system browser instead. The person
 * leaves the app, pays in Safari or Chrome, and comes back; the tier refreshes
 * when the app resumes (see TierProvider). On the web it stays a plain
 * redirect, which is what a browser should do.
 *
 * This does NOT make the app compliant outside the United States. Selling to
 * other storefronts needs real in-app purchase — see PLATFORMS.md.
 */

import { isNativeApp } from "@/lib/isNativeApp";

/**
 * Open a Stripe Checkout or Billing Portal URL.
 *
 * Returns false when the browser refused to open it, so the caller can show
 * the link rather than leaving someone looking at a button that did nothing.
 */
export function openCheckout(url: string): boolean {
  if (!url) return false;

  if (!isNativeApp()) {
    window.location.href = url;
    return true;
  }

  // Capacitor routes a _blank window for an off-origin https URL to the
  // system browser, because Stripe's host is not in server.allowNavigation
  // (nothing is — the config deliberately leaves it unset).
  const opened = window.open(url, "_blank", "noopener,noreferrer");
  if (opened) return true;

  // Some WebView configurations return null even though the URL did open, and
  // some genuinely refuse. Not falling back to location.href on purpose: that
  // is the behaviour this whole module exists to avoid, and a checkout that
  // silently happens in-app is worse than one that visibly failed.
  return false;
}

/** What to tell someone when the browser would not open. */
export const CHECKOUT_BLOCKED_MESSAGE =
  "Couldn't open the payment page. Check that your browser isn't blocking pop-ups, then try again.";
