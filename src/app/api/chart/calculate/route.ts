import { NextRequest, NextResponse } from "next/server";
import { calculateChart } from "@/lib/astro/calculateChart";
import { isResolvedZone } from "@/lib/astro/birthTimezone";
import { lookupTimezone } from "@/lib/astro/geoTimezone";

import { withCors, corsPreflight } from "@/lib/cors";
/**
 * POST /api/chart/calculate
 *
 * Calculates a full birth chart from birth data using astronomy-engine (pure JS).
 * Runs on Vercel Node.js serverless runtime — no native dependencies required.
 */
async function handlePOST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validate required fields (birthTime is optional — defaults to noon if unknown)
    if (!data.name || !data.birthDate || data.latitude == null || data.longitude == null) {
      return NextResponse.json(
        { error: "Missing required fields: name, birthDate, latitude, longitude" },
        { status: 400 }
      );
    }

    // Default to noon if birth time is unknown
    if (!data.birthTime) {
      data.birthTime = "12:00";
      data.unknownTime = true;
    }

    // The birthplace's real zone. A caller passes `timezone` only when it is
    // the stored zone (or the user's own override) for THESE coordinates;
    // otherwise — new charts, edited places, the legacy "UTC" placeholder —
    // it is resolved here from the coordinates. The result carries it, and
    // saveChart stores it on the row.
    if (!isResolvedZone(data.timezone)) {
      data.timezone = lookupTimezone(Number(data.latitude), Number(data.longitude));
    }

    const result = calculateChart(data);
    return NextResponse.json(result);
  } catch (err) {
    console.error("Chart calculation error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Chart calculation failed." },
      { status: 500 }
    );
  }
}

export const POST = withCors(handlePOST);
export const OPTIONS = corsPreflight;
