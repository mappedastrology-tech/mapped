import sharp from 'sharp';
import { statSync } from 'node:fs';

/**
 * Deck-cover thumbnails.
 *
 * The deck list and the deck store fan three cards out at 74-90 CSS px, but
 * were loading the full reading art to do it — 900x1600 webp, ~250KB each, so
 * roughly 750KB per deck row for thumbnails the size of a postage stamp.
 *
 * Only the images shown small need a variant. The full art stays exactly as it
 * is for actual readings, and generating a thumb for all 189 card images would
 * have added 4.8MB to the bundle to save downloading fifteen of them.
 */
const WIDTH = 300;

/**
 * Store product images. The deck store renders each cover as a product tile
 * roughly 170 CSS px wide, where the 300px thumb is soft on a 3x screen and
 * the full 900px art is ~20x more pixels than the tile can show.
 */
const CARD_WIDTH = 600;
const COVERS_FOR_STORE = ['public/oracle/stitched-animal/1.webp', 'public/oracle/bird/1.webp'];
const COVERS = [
  // The classic deck's three fanned covers.
  'public/tarot/classic/major-0.webp',
  'public/tarot/classic/major-8.webp',
  'public/tarot/classic/major-13.webp',
  // Each oracle deck's first six: three for the fanned cover, six for the
  // product page's gallery strip. Anything past six is never shown small.
  ...[1, 2, 3, 4, 5, 6].flatMap((n) => [
    `public/oracle/bird/${n}.webp`,
    `public/oracle/stitched-animal/${n}.webp`,
  ]),
];

let full = 0, thumb = 0;
for (const f of COVERS) {
  const out = f.replace(/\.webp$/, '.thumb.webp');
  await sharp(f).resize({ width: WIDTH }).webp({ quality: 78, effort: 6 }).toFile(out);
  full += statSync(f).size; thumb += statSync(out).size;
  console.log(`${f.replace('public','')}  ${(statSync(f).size/1024).toFixed(0)}KB -> ${(statSync(out).size/1024).toFixed(0)}KB`);
}
for (const f of COVERS_FOR_STORE) {
  const out = f.replace(/\.webp$/, '.card.webp');
  await sharp(f).resize({ width: CARD_WIDTH }).webp({ quality: 80, effort: 6 }).toFile(out);
  console.log(`${out.replace('public','')}  ${(statSync(out).size/1024).toFixed(0)}KB  (store tile)`);
}

console.log(`\ncovers: ${(full/1024).toFixed(0)}KB of art -> ${(thumb/1024).toFixed(0)}KB of thumbs (added ${(thumb/1024).toFixed(0)}KB to the bundle)`);
