/**
 * POST-free city lookup, proxied through our own origin.
 *
 * Birth city is REQUIRED to create a chart — the submit button stays disabled
 * until a city is selected — so whatever answers this question is a single
 * point of failure for signup. It used to be called straight from the browser:
 *
 *   fetch("https://nominatim.openstreetmap.org/search?…",
 *         { headers: { "User-Agent": "Mapped-Astrology-App" } })
 *
 * Two problems with that. First, browsers silently DROP a User-Agent set on
 * fetch — it is a forbidden header name — so every request went out as an
 * anonymous browser, unattributable to this app. Nominatim is a donated
 * service that asks clients to identify themselves and to keep their volume
 * modest. Second, if it ever answered with a 403 or a 429, the client showed
 * "Check your connection and try again" — blaming the user's wifi — and the
 * signup button stayed disabled forever.
 *
 * Proxying fixes both: here the User-Agent is real, responses are cached
 * across users (city names repeat enormously — every prefix of "London" is the
 * same handful of answers), and failures come back as something the UI can
 * explain honestly.
 */

import { NextResponse } from "next/server";
import { checkRateLimitDurable, getClientIP } from "@/lib/rateLimit";

import { withCors, corsPreflight } from "@/lib/cors";
export const runtime = "nodejs";

const UPSTREAM = "https://nominatim.openstreetmap.org/search";

/**
 * Identify the app, with a contact address, as the service asks.
 * This works here and does nothing in a browser.
 */
const USER_AGENT = "Mapped/1.0 (astrology app; +https://mapped-astrology.netlify.app)";

/** A result as the city picker needs it. */
interface Place {
  display_name: string;
  lat: string;
  lon: string;
  address?: Record<string, string>;
}

/**
 * Shared answer cache.
 *
 * Serverless instances are short-lived, so this is a best-effort cut rather
 * than a guarantee — but autocomplete sends the same prefixes over and over,
 * and within one instance that collapses a signup's worth of keystrokes to a
 * couple of upstream calls.
 */
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const CACHE_MAX = 500;
const cache = new Map<string, { at: number; places: Place[] }>();

function cached(key: string): Place[] | null {
  const hit = cache.get(key);
  if (!hit) return null;
  if (Date.now() - hit.at > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  // Refresh recency so the cap evicts the genuinely cold entries.
  cache.delete(key);
  cache.set(key, hit);
  return hit.places;
}

function remember(key: string, places: Place[]): void {
  cache.set(key, { at: Date.now(), places });
  while (cache.size > CACHE_MAX) {
    const oldest = cache.keys().next().value;
    if (oldest === undefined) break;
    cache.delete(oldest);
  }
}

async function handleGET(request: Request) {
  const url = new URL(request.url);
  const query = (url.searchParams.get("q") || "").trim();

  // The client already waits for three characters; enforce it here too so a
  // direct caller cannot turn this into a firehose.
  if (query.length < 3) return NextResponse.json({ places: [] });

  const key = query.toLowerCase();

  const hit = cached(key);
  if (hit) return NextResponse.json({ places: hit, cached: true });

  const { allowed } = await checkRateLimitDurable(`geocode:${getClientIP(request)}`, 60, 60 * 1000);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many searches just now. Give it a moment.", places: [] },
      { status: 429 },
    );
  }

  try {
    const upstream = new URL(UPSTREAM);
    upstream.searchParams.set("format", "json");
    upstream.searchParams.set("q", query);
    upstream.searchParams.set("limit", "5");
    upstream.searchParams.set("addressdetails", "1");

    const res = await fetch(upstream, {
      headers: { "User-Agent": USER_AGENT, "Accept-Language": "en" },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      console.error(`[geocode] upstream ${res.status} for ${JSON.stringify(query)}`);
      return NextResponse.json(
        { error: "City lookup is unavailable right now.", places: [] },
        { status: 503 },
      );
    }

    const raw = (await res.json()) as Place[];
    const places = Array.isArray(raw)
      ? raw.map((p) => ({
          display_name: p.display_name,
          lat: p.lat,
          lon: p.lon,
          address: p.address,
        }))
      : [];

    remember(key, places);
    return NextResponse.json({ places });
  } catch (err) {
    console.error("[geocode] lookup failed:", err);
    return NextResponse.json(
      { error: "City lookup is unavailable right now.", places: [] },
      { status: 503 },
    );
  }
}

export const GET = withCors(handleGET);
export const OPTIONS = corsPreflight;
