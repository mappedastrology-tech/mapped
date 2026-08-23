/**
 * SVG sources for the placeholder brand assets and the OG images.
 *
 * These stand in until Taylor's four PNGs arrive. They are drawn from the same
 * geometry as the real mark — an arch with radiating waves — so layout,
 * spacing, and image dimensions do not change when the real files land. To
 * swap them in, drop the PNGs into public/brand/ using the filenames in
 * README.md; this script never overwrites a file it did not create.
 */

export const INK = '#0C0A3E';
export const ACCENT = '#F3C677';
export const PAPER = '#FAF7F2';

/** The arch: a rectangle with a semicircular top. It always points up. */
export const ARCH_PATH = 'M0 120V50a50 50 0 0 1 100 0v70z';

/**
 * Arch plus concentric waves radiating from it.
 * Drawn in a 200x200 box.
 */
function markGroup(color = INK, accent = ACCENT) {
  return `
    <g transform="translate(70 74) scale(0.6)">
      <path d="${ARCH_PATH}" fill="${color}" />
    </g>
    <g fill="none" stroke="${accent}" stroke-width="6" stroke-linecap="round">
      <path d="M46 146V96a54 54 0 0 1 108 0v50" />
      <path d="M22 146V96a78 78 0 0 1 156 0v50" />
    </g>`;
}

/* Transparent background: the icon sits on paper in the header and on ink in
   the mobile menu. The favicons flatten it onto paper at generation time. */
export function iconSvg(size = 512) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 200 200">
  ${markGroup()}
</svg>`;
}

export function archSvg(width = 400) {
  const height = Math.round((width * 120) / 100);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 100 120">
  <path d="${ARCH_PATH}" fill="${ACCENT}" />
</svg>`;
}

/** Wordmark: the word SONORA set in Poppins SemiBold, letter-spaced. */
export function wordmarkSvg({ width = 480, color = INK } = {}) {
  const height = Math.round(width / 4);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 480 120">
  <text x="0" y="86" font-family="Poppins" font-weight="600" font-size="86"
        letter-spacing="6" fill="${color}">SONORA</text>
</svg>`;
}

/** Full mark: waves above, wordmark below. */
export function fullSvg(width = 800) {
  const height = Math.round((width * 480) / 800);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 800 480">
  <g transform="translate(300 30)">
    ${markGroup()}
  </g>
  <text x="400" y="430" text-anchor="middle" font-family="Poppins" font-weight="600"
        font-size="104" letter-spacing="8" fill="${INK}">SONORA</text>
</svg>`;
}

/** Escapes text for safe inclusion in an SVG text node. */
export function escapeXml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Open Graph card, 1200x630, on ink.
 * With a title it renders the post title in Poppins; without one it renders
 * the wordmark and the tagline.
 */
export function ogSvg({ title, tagline = 'Content and search strategy' } = {}) {
  const waves = `
    <g fill="none" stroke="${ACCENT}" stroke-width="7" stroke-linecap="round" opacity="0.9">
      <path d="M1046 120V80a44 44 0 0 1 88 0v40" />
      <path d="M1020 120V80a70 70 0 0 1 140 0v40" />
    </g>
    <g transform="translate(1066 84) scale(0.48)">
      <path d="${ARCH_PATH}" fill="${PAPER}" />
    </g>`;

  if (!title) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${INK}" />
  <g transform="translate(500 150) scale(1.5)">
    <g fill="none" stroke="${ACCENT}" stroke-width="6" stroke-linecap="round">
      <path d="M46 146V96a54 54 0 0 1 108 0v50" />
      <path d="M22 146V96a78 78 0 0 1 156 0v50" />
    </g>
    <g transform="translate(70 74) scale(0.6)">
      <path d="${ARCH_PATH}" fill="${PAPER}" />
    </g>
  </g>
  <text x="600" y="486" text-anchor="middle" font-family="Poppins" font-weight="600"
        font-size="78" letter-spacing="7" fill="${PAPER}">SONORA</text>
  <text x="600" y="546" text-anchor="middle" font-family="Inter" font-weight="400"
        font-size="28" letter-spacing="1" fill="#A9A6C4">${escapeXml(tagline)}</text>
</svg>`;
  }

  const lines = wrapTitle(title, 22).slice(0, 4);
  const lineHeight = 78;
  const startY = 300 - ((lines.length - 1) * lineHeight) / 2;
  const titleText = lines
    .map(
      (line, index) =>
        `<text x="80" y="${startY + index * lineHeight}" font-family="Poppins" font-weight="600" font-size="64" letter-spacing="-1" fill="${PAPER}">${escapeXml(line)}</text>`
    )
    .join('\n  ');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${INK}" />
  ${waves}
  ${titleText}
  <rect x="80" y="486" width="72" height="4" fill="${ACCENT}" />
  <text x="80" y="556" font-family="Poppins" font-weight="600" font-size="34"
        letter-spacing="4" fill="${PAPER}">SONORA</text>
</svg>`;
}

/** Greedy wrap at a character budget. Titles are short; this is enough. */
export function wrapTitle(title, maxChars) {
  const words = title.split(/\s+/);
  const lines = [];
  let current = '';

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }

  if (current) lines.push(current);
  return lines;
}

/** Placeholder headshot: an arch silhouette on paper. Obvious, not ugly. */
export function headshotPlaceholderSvg(size = 800) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 200 200">
  <rect width="200" height="200" fill="#EFE9E0" />
  <g transform="translate(58 52) scale(0.84)">
    <path d="${ARCH_PATH}" fill="#D6CFC3" />
  </g>
  <text x="100" y="186" text-anchor="middle" font-family="Inter" font-weight="400"
        font-size="9" letter-spacing="1.5" fill="#8B8577">HEADSHOT PLACEHOLDER</text>
</svg>`;
}
