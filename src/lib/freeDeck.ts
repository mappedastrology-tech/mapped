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

  const { data, error } = await supabase
    .from("purchased_decks")
    .select("deck_id, source")
    .eq("user_id", session.user.id);

  // On a failed read, offer nothing rather than wrongly offering a free deck
  // to someone who already spent theirs — the claim would just be refused, and
  // being told "you already chose" after being invited to choose is worse than
  // not being invited.
  if (error || !data) return NO_ENTITLEMENTS;

  return {
    owned: new Set(data.map((r) => r.deck_id as string)),
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
