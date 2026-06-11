/**
 * Oracle Deck Registry — central access point for all oracle decks.
 *
 * Import this instead of individual deck files when you need
 * to list available decks or select by ID.
 */

import { STITCHED_ANIMAL_ORACLE, type OracleDeckInfo, type OracleCard } from "./stitchedAnimalOracle";
import { BIRD_ORACLE, type BirdOracleCard } from "./birdOracle";

export type { OracleDeckInfo, OracleCard, BirdOracleCard };

/** All available oracle decks in display order */
export const ORACLE_DECKS: OracleDeckInfo[] = [
  STITCHED_ANIMAL_ORACLE,
  // Bird oracle has extra fields (reversed, suit) but base shape is compatible
  {
    id: BIRD_ORACLE.id,
    name: BIRD_ORACLE.name,
    description: BIRD_ORACLE.description,
    cardCount: BIRD_ORACLE.cardCount,
    coverImage: BIRD_ORACLE.coverImage,
    backImage: BIRD_ORACLE.backImage,
    cards: BIRD_ORACLE.cards.map(c => ({
      id: c.id,
      number: c.number,
      animal: c.animal,
      keyword: c.keyword,
      meaning: c.meaning,
      image: c.image,
      media: c.media,
    })),
  },
];

/** Get a deck by ID */
export function getOracleDeck(id: string): OracleDeckInfo | undefined {
  return ORACLE_DECKS.find(d => d.id === id);
}

/** Get a random card from a specific deck, deterministic by seed */
export function getDailyOracleCard(deckId: string, seed: number): OracleCard | null {
  const deck = getOracleDeck(deckId);
  if (!deck) return null;
  const idx = ((seed * 7 + 13) % deck.cards.length + deck.cards.length) % deck.cards.length;
  return deck.cards[idx];
}

/** Default deck ID */
export const DEFAULT_ORACLE_DECK = "stitched-animal";

/** localStorage key for user's preferred oracle deck */
export const ORACLE_DECK_KEY = "mapped:oracle-deck";
