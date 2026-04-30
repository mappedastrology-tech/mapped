import { NextRequest, NextResponse } from "next/server";
import { calculateComposite } from "@/lib/astro/calculateComposite";

/**
 * POST /api/composite
 *
 * Calculates a composite (relationship) chart from two birth charts.
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

    const result = calculateComposite(data);
    return NextResponse.json(result);
  } catch (err) {
    console.error("Composite error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Composite calculation failed." },
      { status: 500 }
    );
  }
}
