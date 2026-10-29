import { NextRequest, NextResponse } from "next/server";
import { lookupTimezone } from "@/lib/astro/geoTimezone";

import { withCors, corsPreflight } from "@/lib/cors";
/**
 * GET /api/timezone?lat=&lng=
 *
 * The IANA time zone for a birthplace. Charts store it so every later
 * recalculation — in the browser, in the native app, offline — converts the
 * birth time with the zone the place actually keeps, not an estimate. The
 * lookup needs geo-tz's boundary data on disk, so it lives here rather than
 * in the client (see lib/astro/geoTimezone).
 */
async function handleGET(request: NextRequest) {
  const q = request.nextUrl.searchParams;
  // Number("") and Number(null) are 0 — a real coordinate — so check presence first.
  const raw = [q.get("lat"), q.get("lng")];
  const timezone = raw.every((v) => v != null && v.trim() !== "") ? lookupTimezone(Number(raw[0]), Number(raw[1])) : null;
  if (!timezone) {
    return NextResponse.json({ error: "lat and lng must be valid coordinates" }, { status: 400 });
  }
  // Zone boundaries move rarely; a day of caching is safe.
  return NextResponse.json({ timezone }, { headers: { "Cache-Control": "public, max-age=86400" } });
}

export const GET = withCors(handleGET);
export const OPTIONS = corsPreflight;
