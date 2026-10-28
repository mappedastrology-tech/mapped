import { NextResponse } from "next/server";

import { withCors, corsPreflight } from "@/lib/cors";
/**
 * RETIRED. This was a one-time, unauthenticated DB-seeding endpoint and must not
 * be reachable in production. It now does nothing and returns 410 Gone.
 * (Safe to delete this file entirely from a machine with write access.)
 */
async function handleGET() {
  return NextResponse.json({ error: "Gone" }, { status: 410 });
}

export const GET = withCors(handleGET);
export const OPTIONS = corsPreflight;
