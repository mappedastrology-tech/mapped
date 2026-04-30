import { NextRequest, NextResponse } from "next/server";
import { calculateTransits } from "@/lib/astro/calculateTransits";

/**
 * POST /api/transits
 *
 * Calculates current planetary transits to a natal chart.
 */
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    if (!data.natalPlanets || !data.transitDate) {
      return NextResponse.json(
        { error: "Missing required fields: natalPlanets, transitDate" },
        { status: 400 }
      );
    }

    const result = calculateTransits(data);
    return NextResponse.json(result);
  } catch (err) {
    console.error("Transits error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Transit calculation failed." },
      { status: 500 }
    );
  }
}
