/**
 * Deck Store catalog — the oracle decks sold in the Tarot tab's Store.
 *
 * The store sells the app's REAL oracle decks (Stitched Animal, Bird) as
 * one-time purchases — own forever. Classic Tarot stays free. Each entry maps
 * to one Stripe Product+Price; card data/images come from the oracle registry
 * (src/lib/oracleDecks.ts), so the store shows real card photos and sample
 * meanings, and a purchased deck is instantly playable.
 *
 * Price resolution: an env override wins; otherwise the baked price id that
 * matches the server's STRIPE_SECRET_KEY mode. The app currently runs Stripe
 * in TEST mode — test products exist for both decks. Live products must be
 * created before switching to live keys (see DECK_STORE_SETUP.md).
 *
 * Ownership lives in the `purchased_decks` table (one row per user per deck,
 * written by the Stripe webhook).
 */

export type DeckStatus = "available" | "coming-soon";

export interface StoreDeck {
  id: string;                 // oracle registry deck id — purchased decks are playable
  name: string;
  tagline: string;            // one-liner under the name
  description: string;        // longer store copy
  cardCount: number;
  priceCents: number;         // display price; Stripe Price is the source of truth
  stripePriceEnv: string;     // optional env-var override for the Stripe price id
  stripePriceLive: string;    // live-mode Price id ("" until created — blocks live sale safely)
  stripePriceTest: string;    // test-mode Price id
  coverImage: string;
  status: DeckStatus;
}

/**
 * Resolve the Stripe Price id for a deck: an env override wins; otherwise pick
 * live vs test to match the server's STRIPE_SECRET_KEY mode (sk_live_… ⇒ live).
 * Returns undefined when the mode's price doesn't exist yet (deck unsellable).
 */
export function resolveStripePrice(deck: StoreDeck): string | undefined {
  const override = process.env[deck.stripePriceEnv];
  if (override) return override;
  const isLive = (process.env.STRIPE_SECRET_KEY || "").startsWith("sk_live");
  const id = isLive ? deck.stripePriceLive : deck.stripePriceTest;
  return id || undefined;
}

export const STORE_DECKS: StoreDeck[] = [
  {
    id: "stitched-animal",
    name: "Stitched Animal Oracle",
    tagline: "Soft hands, sharp wisdom.",
    description:
      "36 hand-stitched animal guides, each carrying its own counsel — from the Rabbit's sensitivity to the Fox's instinct. Warm, direct readings with no reversals: what you draw is what's speaking. The gentlest deck in Mapped, and the best one to learn oracle reading on.",
    cardCount: 36,
    priceCents: 555,
    stripePriceEnv: "STRIPE_PRICE_DECK_STITCHED_ANIMAL",
    stripePriceLive: "", // create the live product before going live (see DECK_STORE_SETUP.md)
    stripePriceTest: "price_1U6waTRdq07zsKMQbdKZfs3n",
    coverImage: "/oracle/stitched-animal/1.webp",
    status: "available",
  },
  {
    id: "bird",
    name: "The Bird Oracle",
    tagline: "Seventy-two wings, seven suits, one sky.",
    description:
      "A 72-card oracle in seven suits, each bird carrying wisdom drawn from observation and myth. Reads upright and reversed, so every card has two voices — a deeper, more layered deck for readers who want nuance and shadow in their pulls.",
    cardCount: 72,
    priceCents: 555,
    stripePriceEnv: "STRIPE_PRICE_DECK_BIRD",
    stripePriceLive: "", // create the live product before going live (see DECK_STORE_SETUP.md)
    stripePriceTest: "price_1U6wbBRdq07zsKMQRmUcFfjW",
    coverImage: "/oracle/bird/1.webp",
    status: "available",
  },
];

export const STORE_DECK_BY_ID: Record<string, StoreDeck> = Object.fromEntries(
  STORE_DECKS.map((d) => [d.id, d]),
);

export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}
