/**
 * POST /api/iap/sync — ask RevenueCat what this person bought in the App
 * Store or Google Play, and write it down.
 *
 * The app calls this straight after a purchase or a restore, and when it
 * comes back to the foreground. The webhook (/api/revenuecat/webhook) is the
 * normal path for renewals and expiries; this is what makes a purchase show up
 * the instant it completes, and heals a missed webhook.
 *
 * The client sends nothing about the purchase itself. The server reads the
 * account's record from RevenueCat, which has validated the receipt with the
 * store, so there is nothing here a tampered app could forge.
 *
 * Headers: Authorization: Bearer <supabase_access_token>
 * Returns: { tier, storeTier, configured }
 */

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { syncStoreEntitlements } from "@/lib/storeEntitlements";
import { withCors, corsPreflight } from "@/lib/cors";

export const runtime = "nodejs";

async function handlePOST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    const result = await syncStoreEntitlements(admin, user.id);
    if (!result) {
      // RevenueCat is not configured on this deployment yet.
      return NextResponse.json({ configured: false });
    }
    return NextResponse.json({
      configured: true,
      tier: result.tier,
      storeTier: result.store.tier,
      decks: result.store.decks.map((d) => d.deckId),
    });
  } catch (err) {
    console.error("[iap] sync failed:", err);
    return NextResponse.json({ error: "Could not check your purchases." }, { status: 502 });
  }
}

export const POST = withCors(handlePOST);
export const OPTIONS = corsPreflight;
