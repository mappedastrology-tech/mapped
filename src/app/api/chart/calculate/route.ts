import { NextRequest, NextResponse } from "next/server";
import { calculateChart } from "@/lib/astro/calculateChart";

/**
 * POST /api/chart/calculate
 *
 * Calculates a full birth chart from birth data using astronomy-engine (pure JS).
 * Runs on Vercel Node.js serverless runtime — no native dependencies required.
 */
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validate required fields
    if (!data.name || !data.birthDate || !data.birthTime || data.latitude == null || data.longitude == null) {
      return NextResponse.json(
        { error: "Missing required fields: name, birthDate, birthTime, latitude, longitude" },
        { status: 400 }
      );
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
