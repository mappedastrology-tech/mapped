import { NextRequest, NextResponse } from "next/server";
import { calculateSynastry } from "@/lib/astro/calculateSynastry";

/**
 * POST /api/synastry
 *
 * Compares two birth charts and calculates compatibility.
 */
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    if (!data.chart1 || !data.chart2) {
      return NextResponse.json(
        { error: "Missing required fields: chart1, chart2" },
        { status: 400 }
      );
    }

    const result = calculateSynastry(data.chart1, data.chart2, data.context || "friend");
    return NextResponse.json(result);
  } catch (err) {
    console.error("Synastry error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Synastry calculation failed." },
      { status: 500 }
    );
  }
}
