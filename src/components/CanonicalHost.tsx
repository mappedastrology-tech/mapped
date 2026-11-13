"use client";

/**
 * Send anyone who lands on a stale host to the real one, carrying the URL.
 *
 * The repo was connected to Vercel as well as Netlify (see PLATFORMS.md), so
 * for months every push built a second, identical-looking copy of Mapped at a
 * vercel.app address. Netlify is the one true deployment: it is what
 * NEXT_PUBLIC_API_BASE points at in every app build, and what the docs say.
 *
 * Signing in is where the split stops being cosmetic and becomes a dead end.
 * Supabase OAuth uses PKCE: the browser keeps a one-time verifier in the
 * localStorage of the origin that STARTED the flow, and only that origin can
 * exchange the returned `code` for a session. Supabase then sends the person
 * back to whichever redirect URL it is configured with — and that is still the
 * vercel.app one. So the flow begins on Netlify, where the verifier is, and
 * finishes on Vercel, where it is not. The exchange cannot succeed, on that
 * host, ever. No amount of retrying fixes it; it just looks broken.
 *
 * Bouncing to the canonical origin with the query and hash intact puts the
 * `code` back in front of the browser that holds the verifier, and the sign-in
 * completes. It also means nobody can get stuck on the old copy by following
 * an old link or bookmark.
 *
 * The right long-term fix is still the Supabase setting — Authentication → URL
 * Configuration → Site URL and Redirect URLs. This is the belt that does not
 * depend on anyone remembering the braces.
 *
 * Deliberately narrow:
 *   - Only `*.vercel.app`. Netlify deploy previews, localhost and the
 *     Capacitor shells (which serve from capacitor://localhost or
 *     http://localhost) are all left alone — redirecting the app to a website
 *     would be a far worse bug than the one being fixed.
 *   - `location.replace`, so Back does not bounce in a loop.
 *   - Renders nothing.
 */

import { useEffect } from "react";

/** The one deployment. See PLATFORMS.md — "One host, on purpose". */
export const CANONICAL_ORIGIN = "https://mapped-astrology.netlify.app";

/** Hosts known to serve a stale copy of this app. */
export function isStaleHost(hostname: string): boolean {
  return hostname === "vercel.app" || hostname.endsWith(".vercel.app");
}

/** The URL to send someone to, or null if they are already in the right place. */
export function canonicalUrlFor(href: string, canonical = CANONICAL_ORIGIN): string | null {
  let url: URL;
  try {
    url = new URL(href);
  } catch {
    return null;
  }
  if (!isStaleHost(url.hostname)) return null;
  // Path, query AND hash: the query carries the OAuth `code`, and the hash
  // carries the session on the implicit flow. Dropping either turns a
  // recoverable sign-in into a silent sign-out.
  return `${canonical}${url.pathname}${url.search}${url.hash}`;
}

export default function CanonicalHost() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const target = canonicalUrlFor(window.location.href);
    if (target) window.location.replace(target);
  }, []);

  return null;
}
