import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

/**
 * POST /api/chart/calculate
 *
 * This route calls a Python/Kerykeion script to calculate natal charts from
 * birth data. It requires child_process and Python, which are not available
 * on Cloudflare Pages / edge runtime.
 *
 * Chart calculations must be performed on the local development server.
 * Once calculated, chart data is saved to Supabase and served from there.
 */
export async function POST(request: NextRequest) {
  return NextResponse.json(
    {
      error:
        "Chart calculations require the local development server with Python installed. Your chart data is saved in Supabase after initial calculation.",
    },
    { status: 501 }
  );
}
