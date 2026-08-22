import sharp from 'sharp';
import { statSync } from 'node:fs';

/**
 * Deck-cover thumbnails.
 *
 * The deck list and the deck store fan three cards out at 74-90 CSS px, but
 * were loading the full reading art to do it — 900x1600 webp, ~250KB each, so
 * roughly 750KB per deck row for thumbnails the size of a postage stamp.
 *
 * Only the covers need a small variant. The full art stays exactly as it is for
 * actual readings, and generating a thumb for all 189 card images would have
 * added 4.8MB to the bundle to save downloading nine of them.
 */
const WIDTH = 300;
const COVERS = [
  'public/tarot/classic/major-0.webp',
  'public/tarot/classic/major-8.webp',
  'public/tarot/classic/major-13.webp',
  'public/oracle/bird/1.webp',
  'public/oracle/bird/2.webp',
  'public/oracle/bird/3.webp',
  'public/oracle/stitched-animal/1.webp',
  'public/oracle/stitched-animal/2.webp',
  'public/oracle/stitched-animal/3.webp',
];

let full = 0, thumb = 0;
for (const f of COVERS) {
  const out = f.replace(/\.webp$/, '.thumb.webp');
  await sharp(f).resize({ width: WIDTH }).webp({ quality: 78, effort: 6 }).toFile(out);
  full += statSync(f).size; thumb += statSync(out).size;
  console.log(`${f.replace('public','')}  ${(statSync(f).size/1024).toFixed(0)}KB -> ${(statSync(out).size/1024).toFixed(0)}KB`);
}
console.log(`\ncovers: ${(full/1024).toFixed(0)}KB of art -> ${(thumb/1024).toFixed(0)}KB of thumbs (added ${(thumb/1024).toFixed(0)}KB to the bundle)`);
