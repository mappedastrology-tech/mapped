import { NextResponse } from "next/server";

/**
 * RETIRED. This was a one-time, unauthenticated DB-seeding endpoint and must not
 * be reachable in production. It now does nothing and returns 410 Gone.
 * (Safe to delete this file entirely from a machine with write access.)
 */
export async function GET() {
  return NextResponse.json({ error: "Gone" }, { status: 410 });
}
