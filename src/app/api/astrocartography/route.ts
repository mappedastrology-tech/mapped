import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

/**
 * POST /api/astrocartography
 *
 * Calculates astrocartography planetary lines for a birth chart, showing
 * where planetary energies are strongest on a world map. Requires a Python
 * script with ephemeris calculations, which is not available on Cloudflare
 * Pages / edge runtime.
 *
 * Astrocartography calculations must be performed on the local development server.
 */
export async function POST(request: NextRequest) {
  return NextResponse.json(
    {
      error:
        "Astrocartography calculations require the local development server with Python installed. This route is not available in the cloud deployment.",
    },
    { status: 501 }
  );
}
