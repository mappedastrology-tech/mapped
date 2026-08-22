/**
 * Deck-cover thumbnails.
 *
 * The deck list and the deck store fan three cards out at 74-90 CSS px. They
 * were loading the full reading art to do it — up to 900x1600 and ~250KB each,
 * so roughly 750KB per deck row for thumbnails the size of a postage stamp.
 *
 * Only the nine cover images have a 300px variant (see scripts/make-thumbs.mjs);
 * the full art is untouched and is still what a reading displays. Anything
 * without a thumb should fall back to the original rather than show a hole,
 * which is what onCardThumbError is for.
 */

export function cardThumb(src: string): string {
  return src.replace(/\.webp$/i, ".thumb.webp");
}

/** onError handler: swap a missing thumb back to the full-size art, once. */
export function onCardThumbError(e: React.SyntheticEvent<HTMLImageElement>): void {
  const img = e.currentTarget;
  if (!img.src.includes(".thumb.webp")) return;
  img.src = img.src.replace(".thumb.webp", ".webp");
}
