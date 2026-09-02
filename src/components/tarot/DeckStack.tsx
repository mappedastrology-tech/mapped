"use client";

/**
 * DeckStack — a deck rendered as a stack of cards, not a single card.
 *
 * A store tile showing one flat card looks like it is selling that card. Two
 * more cards fanned behind it say "this is a deck" before any of the text does.
 *
 * The cards behind are real cards from the deck, not duplicates of the cover,
 * so the fan hints at the deck's range. They are the same three the product
 * page and My Decks fan out, so a deck looks like itself everywhere.
 *
 * Sizing is driven entirely by the parent's box: the stack fills it and the
 * cards are a percentage of that, so the same component works at a 170px store
 * tile and a 120px onboarding tile without per-use tuning.
 */

import { getOracleDeck } from "@/lib/oracleDecks";
import { cardThumb, onCardThumbError } from "@/lib/cardThumb";

/** Rotation and horizontal shift per layer, back to front. */
const LAYERS = [
  { rotate: -8, shiftPct: -13, scale: 0.94 },
  { rotate: 7, shiftPct: 12, scale: 0.97 },
  { rotate: 0, shiftPct: 0, scale: 1 },
];

interface Props {
  deckId: string;
  /** Used when the registry has no cards, so a tile is never empty. */
  fallbackImage: string;
  alt: string;
  /** Card width as a share of the container. Lower leaves room for the fan. */
  cardWidthPct?: number;
}

/*
 * Why 58% and why the container is 20:23 rather than a card's 9:16:
 * a card at 58% of the width is 1.03x the width tall, and rotating that by 8
 * degrees needs 1.10x the width of vertical room (h·cos8 + w·sin8). A 9:16 box
 * has no spare height at all, so the fan got its top and bottom sliced off.
 * 20:23 gives 1.15x — enough for the rotation with a little air.
 */
export default function DeckStack({ deckId, fallbackImage, alt, cardWidthPct = 58 }: Props) {
  const registry = getOracleDeck(deckId);
  const images = (registry?.cards ?? []).slice(0, 3).map((c) => c.image);
  while (images.length < 3 && images.length > 0) images.push(images[0]);
  const faces = images.length ? images : [fallbackImage, fallbackImage, fallbackImage];

  return (
    <div className="relative w-full h-full overflow-hidden" aria-hidden="false">
      {faces.map((src, i) => {
        const layer = LAYERS[i];
        return (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={`${src}-${i}`}
            src={cardThumb(src)}
            onError={onCardThumbError}
            alt={i === faces.length - 1 ? alt : ""}
            loading="lazy"
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: `${cardWidthPct}%`,
              aspectRatio: "9 / 16",
              objectFit: "cover",
              borderRadius: 6,
              border: "0.5px solid rgba(154,115,34,0.45)",
              boxShadow: "0 6px 16px -6px rgba(0,0,0,0.55)",
              transform: `translate(-50%, -50%) translateX(${layer.shiftPct}%) rotate(${layer.rotate}deg) scale(${layer.scale})`,
              transformOrigin: "center center",
              zIndex: i,
            }}
          />
        );
      })}
    </div>
  );
}
