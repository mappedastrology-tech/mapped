import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

/**
 * POST /api/transits
 *
 * Calculates current planetary transits to a natal chart, showing active
 * aspects and their timing. Requires a Python script with ephemeris data,
 * which is not available on Cloudflare Pages / edge runtime.
 *
 * Transit calculations must be performed on the local development server.
 */
export async function POST(request: NextRequest) {
  return NextResponse.json(
    {
      error:
        "Transit calculations require the local development server with Python installed. This route is not available in the cloud deployment.",
    },
    { status: 501 }
  );
}
