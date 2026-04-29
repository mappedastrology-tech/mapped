import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

/**
 * POST /api/composite
 *
 * Calculates the composite (midpoint) chart for two people, representing
 * the relationship itself. Requires a Python script, which is not available
 * on Cloudflare Pages / edge runtime.
 *
 * Composite chart calculations must be performed on the local development server.
 */
export async function POST(request: NextRequest) {
  return NextResponse.json(
    {
      error:
        "Composite chart calculations require the local development server with Python installed. This route is not available in the cloud deployment.",
    },
    { status: 501 }
  );
}
