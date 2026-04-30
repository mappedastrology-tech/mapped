import { NextRequest, NextResponse } from "next/server";
import { calculateAstrocartography } from "@/lib/astro/calculateAstrocartography";

/**
 * POST /api/astrocartography
 *
 * Calculates astrocartography lines for a birth chart.
 */
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    if (data.birthYear == null || data.birthMonth == null || data.birthDay == null || data.birthHourUtc == null) {
      return NextResponse.json(
        { error: "Missing required fields: birthYear, birthMonth, birthDay, birthHourUtc" },
        { status: 400 }
      );
    }

    const result = calculateAstrocartography(data);
    return NextResponse.json(result);
  } catch (err) {
    console.error("Astrocartography error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Astrocartography calculation failed." },
      { status: 500 }
    );
  }
}
