/**
 * Deck Store catalog — the premium oracle decks sold in the Tarot tab's Store.
 *
 * The two launch decks (Stitched Animal, Bird) stay free for everyone; the
 * store sells NEW premium decks as one-time purchases (own forever). Each
 * entry maps to one Stripe Product+Price — put the live price id in
 * `stripePriceEnv`'s env var (see DECK_STORE_SETUP.md). A deck with
 * `status: "coming-soon"` renders in the store but can't be bought yet, so the
 * storefront can ship before every deck's art/cards are finished.
 *
 * Ownership lives in the `purchased_decks` table (one row per user per deck,
 * written by the Stripe webhook). Free decks never appear there — they're
 * owned implicitly.
 */

export type DeckStatus = "available" | "coming-soon";

export interface StoreDeck {
  id: string;                 // deck id, also used as ORACLE deck id once playable
  name: string;
  tagline: string;            // one-liner under the name
  description: string;        // longer store copy
  cardCount: number;
  priceCents: number;         // display price; Stripe Price is the source of truth
  stripePriceEnv: string;     // name of the env var holding the Stripe price id
  coverImage: string;         // /public path — swap in real art
  status: DeckStatus;
}

export const STORE_DECKS: StoreDeck[] = [
  {
    id: "botanical-oracle",
    name: "Botanical Oracle",
    tagline: "Wisdom pressed between the pages.",
    description:
      "44 cards of flowers, roots, and healing herbs — each carrying the folk meaning gardeners and herbalists have passed down for centuries. Draw one when you need to know what season you're actually in.",
    cardCount: 44,
    priceCents: 499,
    stripePriceEnv: "STRIPE_PRICE_DECK_BOTANICAL",
    coverImage: "/images/dried-flower-bouquet.png",
    status: "available",
  },
  {
    id: "celestial-oracle",
    name: "Celestial Oracle",
    tagline: "The night sky, dealt into your hands.",
    description:
      "48 cards of moons, comets, constellations, and eclipses. A deck for the big questions — timing, fate, and the long arc of things. Pairs naturally with your chart and transits.",
    cardCount: 48,
    priceCents: 499,
    stripePriceEnv: "STRIPE_PRICE_DECK_CELESTIAL",
    coverImage: "/images/cosmic-eye.png",
    status: "available",
  },
  {
    id: "sea-oracle",
    name: "Sea Oracle",
    tagline: "Messages from the deep.",
    description:
      "40 cards of tides, shells, storms, and creatures of the deep — for readings about feeling, intuition, and what moves underneath the surface of a situation.",
    cardCount: 40,
    priceCents: 399,
    stripePriceEnv: "STRIPE_PRICE_DECK_SEA",
    coverImage: "/images/angel-fish-grayscale.png",
    status: "coming-soon",
  },
  {
    id: "crystal-oracle",
    name: "Crystal Oracle",
    tagline: "Stone-clear answers.",
    description:
      "36 cards of crystals and minerals, each with its traditional association and a grounded, practical read. For when you want an answer with edges.",
    cardCount: 36,
    priceCents: 399,
    stripePriceEnv: "STRIPE_PRICE_DECK_CRYSTAL",
    coverImage: "/images/crystal-ball.png",
    status: "coming-soon",
  },
];

export const STORE_DECK_BY_ID: Record<string, StoreDeck> = Object.fromEntries(
  STORE_DECKS.map((d) => [d.id, d]),
);

export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}
