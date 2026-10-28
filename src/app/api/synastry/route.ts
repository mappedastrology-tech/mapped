import { NextRequest, NextResponse } from "next/server";
import { calculateSynastry } from "@/lib/astro/calculateSynastry";

import { withCors, corsPreflight } from "@/lib/cors";
/**
 * POST /api/synastry
 *
 * Compares two birth charts and calculates compatibility.
 */
async function handlePOST(request: NextRequest) {
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

export const POST = withCors(handlePOST);
export const OPTIONS = corsPreflight;
