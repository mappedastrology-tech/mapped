/**
 * POST /api/revenuecat/webhook — RevenueCat tells us something changed for a
 * customer: a purchase, a renewal, a cancellation, an expiry, a refund, a
 * billing problem, a transfer between accounts.
 *
 * We do not act on the event's contents. Events can arrive late, twice or out
 * of order, so every event is treated as "go and look": the handler re-reads
 * the customer from RevenueCat and writes what is true now. That makes the
 * handler idempotent and immune to ordering.
 *
 * Authentication: RevenueCat sends the Authorization header configured in its
 * dashboard. It must equal "Bearer <REVENUECAT_WEBHOOK_AUTH>". Without the
 * secret set, the endpoint refuses everything rather than trusting anyone.
 */

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { timingSafeEqual } from "node:crypto";
import { syncStoreEntitlements } from "@/lib/storeEntitlements";

export const runtime = "nodejs";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function authorised(header: string | null): boolean {
  const secret = process.env.REVENUECAT_WEBHOOK_AUTH;
  if (!secret || !header) return false;
  const expected = Buffer.from(`Bearer ${secret}`);
  const got = Buffer.from(header);
  return expected.length === got.length && timingSafeEqual(expected, got);
}

interface RevenueCatEvent {
  type?: string;
  app_user_id?: string;
  original_app_user_id?: string;
  aliases?: string[];
  transferred_from?: string[];
  transferred_to?: string[];
}

export async function POST(request: Request) {
  if (!authorised(request.headers.get("authorization"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let event: RevenueCatEvent | undefined;
  try {
    const body = await request.json();
    event = body?.event;
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
  if (!event) return NextResponse.json({ received: true });

  // Only Mapped account ids (Supabase uuids). RevenueCat's own anonymous ids
  // ($RCAnonymousID:...) belong to nobody we can write to yet.
  const ids = new Set<string>();
  for (const id of [
    event.app_user_id,
    event.original_app_user_id,
    ...(event.aliases ?? []),
    ...(event.transferred_from ?? []),
    ...(event.transferred_to ?? []),
  ]) {
    if (id && UUID.test(id)) ids.add(id);
  }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  try {
    for (const id of ids) {
      await syncStoreEntitlements(admin, id);
    }
  } catch (err) {
    // A 500 makes RevenueCat retry, which is what we want for a transient
    // failure: the retry re-reads the truth anyway.
    console.error("[revenuecat] webhook sync failed:", err);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
