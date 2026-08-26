/**
 * POST /api/decks/claim-free — spend the account's one free deck pick.
 *
 * Body: { deckId: string }
 * Headers: Authorization: Bearer <supabase_access_token>
 * Returns: { ok: true, deckId } — or 409 if the pick is already spent.
 *
 * Why this is a server route and not a client insert: granting a deck is
 * giving away something that otherwise costs money, so the client must not be
 * the thing that decides it happened. The insert runs with the service role
 * after the caller's token has been verified, and the "only one" rule is a
 * partial unique index on the table (see
 * supabase/migrations/20260826_purchased_decks_free_pick.sql) rather than a
 * SELECT-then-INSERT here, which two concurrent requests could both pass.
 */

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { STORE_DECK_BY_ID } from "@/lib/deckStore";

/** Postgres unique_violation. */
const UNIQUE_VIOLATION = "23505";

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

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    const { error } = await supabaseAdmin.from("purchased_decks").insert({
      user_id: user.id,
      deck_id: deck.id,
      source: "free_pick",
      amount_cents: 0,
      currency: "usd",
    });

    if (error) {
      // Two different unique indexes can reject this, and they mean different
      // things to the person tapping the button.
      if (error.code === UNIQUE_VIOLATION) {
        const alreadyOwnsThisDeck = error.message.includes("user_id_deck_id");
        return NextResponse.json(
          {
            error: alreadyOwnsThisDeck
              ? "You already have this deck."
              : "You've already chosen your free deck.",
          },
          { status: 409 },
        );
      }
      console.error("claim-free insert failed", error);
      return NextResponse.json({ error: "Could not claim the deck. Please try again." }, { status: 500 });
    }

    return NextResponse.json({ ok: true, deckId: deck.id });
  } catch (err) {
    console.error("claim-free failed", err);
    return NextResponse.json({ error: "Could not claim the deck. Please try again." }, { status: 500 });
  }
}
