import { NextRequest, NextResponse } from "next/server";
import { calculateSolarReturn } from "@/lib/astro/calculateSolarReturn";
import { localClock } from "@/lib/astro/birthTimezone";
import { lookupTimezone } from "@/lib/astro/geoTimezone";

import { withCors, corsPreflight } from "@/lib/cors";
/**
 * POST /api/chart/solar-return
 *
 * Calculates a solar return chart for a given year.
 */
async function handlePOST(request: NextRequest) {
  try {
    const data = await request.json();

    if (data.natalSunAbsPos == null || data.latitude == null || data.longitude == null) {
      return NextResponse.json(
        { error: "Missing required fields: natalSunAbsPos, latitude, longitude" },
        { status: 400 }
      );
    }

    const result = calculateSolarReturn(data);
    // The return instant on the clocks where it is cast. calculateSolarReturn
    // works in UT; the zone lookup needs geo-tz, which only runs here.
    const zone = lookupTimezone(Number(data.latitude), Number(data.longitude));
    if (zone) result.returnLocal = localClock(String(result.returnUtc), zone);
    return NextResponse.json(result);
  } catch (err) {
    console.error("Solar return error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Solar return calculation failed." },
      { status: 500 }
    );
  }
}

export const POST = withCors(handlePOST);
export const OPTIONS = corsPreflight;
