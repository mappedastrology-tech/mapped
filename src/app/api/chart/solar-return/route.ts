import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

/**
 * POST /api/chart/solar-return
 *
 * Calculates the solar return chart for a given year — the exact moment
 * the Sun returns to its natal position. Requires a Python script with
 * ephemeris data, which is not available on Cloudflare Pages / edge runtime.
 *
 * Solar return calculations must be performed on the local development server.
 */
export async function POST(request: NextRequest) {
  return NextResponse.json(
    {
      error:
        "Solar return calculations require the local development server with Python installed. This route is not available in the cloud deployment.",
    },
    { status: 501 }
  );
}
