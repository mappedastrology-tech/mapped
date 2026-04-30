import { NextRequest, NextResponse } from "next/server";
import { calculateSolarReturn } from "@/lib/astro/calculateSolarReturn";

/**
 * POST /api/chart/solar-return
 *
 * Calculates a solar return chart for a given year.
 */
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    if (data.natalSunAbsPos == null || data.latitude == null || data.longitude == null) {
      return NextResponse.json(
        { error: "Missing required fields: natalSunAbsPos, latitude, longitude" },
        { status: 400 }
      );
    }

    const result = calculateSolarReturn(data);
    return NextResponse.json(result);
  } catch (err) {
    console.error("Solar return error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Solar return calculation failed." },
      { status: 500 }
    );
  }
}
