import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

/**
 * POST /api/synastry
 *
 * Calculates synastry (compatibility) between two charts by analyzing
 * inter-chart aspects and relationship themes. Requires a Python script,
 * which is not available on Cloudflare Pages / edge runtime.
 *
 * Synastry calculations must be performed on the local development server.
 */
export async function POST(request: NextRequest) {
  return NextResponse.json(
    {
      error:
        "Synastry calculations require the local development server with Python installed. This route is not available in the cloud deployment.",
    },
    { status: 501 }
  );
}
