/**
 * The one free deck every account gets to choose.
 *
 * Ownership all lives in purchased_decks; a row with source = 'free_pick' is
 * the claim. So "has a pick left" is simply "no free_pick row yet" — there is
 * no separate flag to drift out of sync with what the user actually owns.
 *
 * Reads here are advisory: they decide what the UI offers. The rule itself is
 * a partial unique index on the table, so a client that lies about being
 * eligible still cannot take a second deck.
 */

import { supabase } from "@/lib/supabase";
import { apiUrl } from "@/lib/apiBase";
import { STORE_DECKS } from "@/lib/deckStore";
import { getProfile } from "@/lib/profileCache";
import { effectiveTier } from "@/lib/tier";

export interface DeckEntitlements {
  /** Deck ids the user owns, however they got them. */
  owned: Set<string>;
  /** True when the free pick has not been spent yet. */
  hasFreePick: boolean;
}

export const NO_ENTITLEMENTS: DeckEntitlements = { owned: new Set(), hasFreePick: false };

/**
 * Signed-out users get no pick — there is no account to attach it to, and the
 * store already tells them to sign in.
 */
export async function fetchDeckEntitlements(): Promise<DeckEntitlements> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return NO_ENTITLEMENTS;

  const [{ data, error }, profile] = await Promise.all([
    supabase
      .from("purchased_decks")
      .select("deck_id, source")
      .eq("user_id", session.user.id),
    // Shared with the rest of the screen rather than a read of its own.
    getProfile(),
  ]);

  // On a failed read, offer nothing rather than wrongly offering a free deck
  // to someone who already spent theirs — the claim would just be refused, and
  // being told "you already chose" after being invited to choose is worse than
  // not being invited.
  if (error || !data) return NO_ENTITLEMENTS;

  const owned = new Set(data.map((r) => r.deck_id as string));

  // Mapped Complete includes every deck for as long as it is active. These are
  // lent, not bought: nothing is written to purchased_decks, so the set shrinks
  // back to what they actually own if the subscription lapses. The free pick is
  // still tracked separately, so someone who subscribes before choosing it does
  // not silently lose it on cancelling.
  if (effectiveTier(profile?.tier, profile?.created_at) === "max") {
    for (const deck of STORE_DECKS) owned.add(deck.id);
  }

  return {
    owned,
    hasFreePick: !data.some((r) => r.source === "free_pick"),
  };
}

export interface ClaimResult {
  ok: boolean;
  error?: string;
}

export async function claimFreeDeck(deckId: string): Promise<ClaimResult> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    return { ok: false, error: "Sign in to choose your free deck." };
  }
  try {
    const res = await fetch(apiUrl("/api/decks/claim-free"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ deckId }),
    });
    const body = await res.json().catch(() => ({}));
    if (res.ok) return { ok: true };
    return { ok: false, error: body.error || "Could not claim the deck. Please try again." };
  } catch {
    return { ok: false, error: "Could not reach the server. Check your connection and try again." };
  }
}
