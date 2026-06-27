import { NextResponse } from "next/server";

/**
 * RETIRED debug endpoint (made live Anthropic calls with no auth). Disabled —
 * returns 410 Gone. Safe to delete this file from a machine with write access.
 */
export async function GET() {
  return NextResponse.json({ error: "Gone" }, { status: 410 });
}
