/**
 * POST /api/stripe/checkout-deck — Create a Stripe Checkout Session for a
 * ONE-TIME oracle-deck purchase (mode: "payment", own forever).
 *
 * Body: { deckId: string }
 * Headers: Authorization: Bearer <supabase_access_token>
 * Returns: { url: string } — the Stripe Checkout URL to redirect to
 *
 * The webhook (checkout.session.completed with mode=payment and
 * metadata.deck_id) writes the purchased_decks row that grants ownership.
 */

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { stripe } from "@/lib/stripe";
import { STORE_DECK_BY_ID } from "@/lib/deckStore";

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    const token = authHeader.slice(7);
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: `Bearer ${token}` } } },
    );
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { deckId } = (await request.json().catch(() => ({}))) as { deckId?: string };
    const deck = deckId ? STORE_DECK_BY_ID[deckId] : undefined;
    if (!deck) return NextResponse.json({ error: "Unknown deck" }, { status: 400 });
    if (deck.status !== "available") {
      return NextResponse.json({ error: "This deck isn't available yet" }, { status: 400 });
    }

    const priceId = process.env[deck.stripePriceEnv];
    if (!priceId) {
      return NextResponse.json(
        { error: `Deck not configured (missing ${deck.stripePriceEnv})` },
        { status: 500 },
      );
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    // Already owned? Don't double-charge.
    const { data: existing } = await supabaseAdmin
      .from("purchased_decks")
      .select("id")
      .eq("user_id", user.id)
      .eq("deck_id", deck.id)
      .maybeSingle();
    if (existing) {
      return NextResponse.json({ error: "You already own this deck" }, { status: 409 });
    }

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single();

    const origin = request.headers.get("origin") || "https://mapped-olive.vercel.app";
    const sessionParams: Record<string, unknown> = {
      mode: "payment" as const,
      payment_method_types: ["card"] as const,
      line_items: [{ price: priceId, quantity: 1 }],
      allow_promotion_codes: true,
      success_url: `${origin}/tarot?deck_purchased=${deck.id}`,
      cancel_url: `${origin}/tarot?store=1`,
      metadata: {
        supabase_user_id: user.id,
        deck_id: deck.id,
      },
    };
    if (profile?.stripe_customer_id) {
      sessionParams.customer = profile.stripe_customer_id;
    } else {
      sessionParams.customer_email = user.email;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const session = await stripe.checkout.sessions.create(sessionParams as any);
    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("checkout-deck error:", err);
    return NextResponse.json({ error: "Could not start checkout" }, { status: 500 });
  }
}
