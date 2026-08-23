/**
 * SVG sources for the Sonora brand marks.
 *
 * These are drawn to match the supplied artwork — the arch standing in for the
 * "n" of Sonora, and the sonar rings radiating above and below it — using
 * Poppins SemiBold, the same geometric face the brand system specifies for
 * headings.
 *
 * They are a stand-in, not the real files. When the four PNGs are dropped into
 * public/brand/ they are used untouched and none of this runs. Because the
 * proportions match, nothing on the page shifts when that happens.
 */
import opentype from 'opentype.js';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

export const INK = '#0C0A3E';
export const ACCENT = '#F3C677';
export const PAPER = '#FAF7F2';

const here = path.dirname(fileURLToPath(import.meta.url));
const poppins = opentype.parse(
  readFileSync(path.join(here, 'fonts', 'Poppins-SemiBold.ttf')).buffer
);

/** The arch: straight sides, a semicircular top, a flat base. It points up. */
export const ARCH_PATH = 'M0 120V50a50 50 0 0 1 100 0v70z';

/** An arch of a given width, positioned by its bottom-left corner. */
function archPath(x, baseline, width) {
  const height = (width * 120) / 100;
  const radius = width / 2;
  const straight = height - radius;
  return [
    `M${x} ${baseline}`,
    `V${baseline - straight}`,
    `a${radius} ${radius} 0 0 1 ${width} 0`,
    `V${baseline}`,
    'z',
  ].join(' ');
}

/** Fixed-precision number, without trailing zeroes. */
const n = (value) => Number(value.toFixed(2)).toString();

/**
 * Serialises a glyph outline from its command list.
 *
 * opentype.js's own toPathData emitted a NaN control point partway through a
 * run here, which silently truncated everything after it in the renderer.
 * Writing the numbers out directly removes that whole class of problem.
 */
function serializePath(commands) {
  const parts = [];

  for (const command of commands) {
    switch (command.type) {
      case 'M':
        parts.push(`M${n(command.x)} ${n(command.y)}`);
        break;
      case 'L':
        parts.push(`L${n(command.x)} ${n(command.y)}`);
        break;
      case 'C':
        parts.push(
          `C${n(command.x1)} ${n(command.y1)} ${n(command.x2)} ${n(command.y2)} ${n(command.x)} ${n(command.y)}`
        );
        break;
      case 'Q':
        parts.push(
          `Q${n(command.x1)} ${n(command.y1)} ${n(command.x)} ${n(command.y)}`
        );
        break;
      case 'Z':
        parts.push('Z');
        break;
      default:
        throw new Error(`Unhandled path command: ${command.type}`);
    }
  }

  const data = parts.join(' ');
  if (data.includes('NaN')) {
    throw new Error('Glyph outline produced a NaN coordinate');
  }
  return data;
}

/**
 * Text as outlines rather than a <text> element. Removes any dependence on
 * font resolution inside the renderer, and lets the layout be measured exactly.
 */
function textPath(text, x, baseline, size, tracking = 0) {
  let cursor = x;
  const parts = [];

  for (const character of text) {
    const glyph = poppins.charToGlyph(character);
    parts.push(serializePath(glyph.getPath(cursor, baseline, size).commands));
    cursor += (glyph.advanceWidth / poppins.unitsPerEm) * size + tracking;
  }

  return { d: parts.join(' '), width: cursor - x - tracking };
}

function textWidth(text, size, tracking = 0) {
  let total = 0;
  for (const character of text) {
    total +=
      (poppins.charToGlyph(character).advanceWidth / poppins.unitsPerEm) * size +
      tracking;
  }
  return total - tracking;
}

/**
 * The wordmark: "So", an arch where the n belongs, then "ora".
 * Returns the paths plus the arch's position, so the rings can be centred on it.
 */
function buildWordmark({ size = 100, tracking = 1 } = {}) {
  // The arch stands at the height of a lowercase n with a little extra rise,
  // which is what the supplied mark does.
  const archWidth = size * 0.6;
  const archHeight = (archWidth * 120) / 100;
  const baseline = archHeight;
  const gap = tracking + size * 0.035;

  const leftWidth = textWidth('So', size, tracking);
  const rightWidth = textWidth('ora', size, tracking);

  const left = textPath('So', 0, baseline, size, tracking);
  const archX = leftWidth + gap;
  const rightX = archX + archWidth + gap;
  const right = textPath('ora', rightX, baseline, size, tracking);

  return {
    // Kept as separate subpaths. Concatenating glyph outlines and the arch into
    // one `d` lets their winding directions interact — counters fill in and
    // later glyphs disappear.
    paths: [left.d, archPath(archX, baseline, archWidth), right.d],
    width: rightX + rightWidth,
    height: baseline,
    archCentre: { x: archX + archWidth / 2, y: baseline - archHeight / 2 },
  };
}

/** Renders a mark's subpaths as separate <path> elements in one fill colour. */
function markPaths(mark, color) {
  return mark.paths
    .map((d) => `<path d="${d}" fill="${color}" />`)
    .join('\n    ');
}

/**
 * The sonar rings: concentric circles around the arch, each broken into a top
 * and a bottom arc with a gap left and right.
 */
function sonarRings({
  cx,
  cy,
  radii,
  stroke = INK,
  width = 2,
  spanDegrees = 132,
}) {
  const half = (spanDegrees / 2) * (Math.PI / 180);

  const arc = (radius, centreAngle) => {
    const from = centreAngle - half;
    const to = centreAngle + half;
    const x1 = cx + radius * Math.cos(from);
    const y1 = cy + radius * Math.sin(from);
    const x2 = cx + radius * Math.cos(to);
    const y2 = cy + radius * Math.sin(to);
    return `M${x1.toFixed(2)} ${y1.toFixed(2)} A${radius} ${radius} 0 0 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
  };

  const paths = radii
    .flatMap((radius) => [arc(radius, -Math.PI / 2), arc(radius, Math.PI / 2)])
    .join(' ');

  return `<path d="${paths}" fill="none" stroke="${stroke}" stroke-width="${width}" stroke-linecap="round" />`;
}

/** Square icon: the arch inside its rings. */
export function iconSvg(size = 512) {
  const cx = 100;
  const cy = 100;
  const archWidth = 34;
  const archHeight = (archWidth * 120) / 100;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 200 200">
  ${sonarRings({ cx, cy, radii: [32, 44, 56, 68, 80], width: 2.1 })}
  <path d="${archPath(cx - archWidth / 2, cy + archHeight / 2, archWidth)}" fill="${INK}" />
</svg>`;
}

/** The solid arch on its own. */
export function archSvg(width = 400) {
  const height = Math.round((width * 120) / 100);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 100 120">
  <path d="${ARCH_PATH}" fill="${INK}" />
</svg>`;
}

/** Wordmark only, no rings. */
export function wordmarkSvg({ width = 480, color = INK } = {}) {
  const mark = buildWordmark({ size: 100 });
  const padding = 6;
  const boxWidth = mark.width + padding * 2;
  const boxHeight = mark.height + padding * 2;
  const height = Math.round((width * boxHeight) / boxWidth);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${boxWidth.toFixed(2)} ${boxHeight.toFixed(2)}">
  <g transform="translate(${padding} ${padding})">
    ${markPaths(mark, color)}
  </g>
</svg>`;
}

/** The full mark: the wordmark with the rings radiating from its arch. */
export function fullSvg(width = 800) {
  const mark = buildWordmark({ size: 100 });
  const radii = [42, 60, 78, 96, 114];
  const reach = radii[radii.length - 1] + 4;

  // The rings extend above and below the wordmark, so the box grows vertically
  // around the arch's centre.
  const top = mark.archCentre.y - reach;
  const bottom = mark.archCentre.y + reach;
  const padding = 8;
  const boxWidth = mark.width + padding * 2;
  const boxHeight = bottom - top + padding * 2;
  const height = Math.round((width * boxHeight) / boxWidth);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${boxWidth.toFixed(2)} ${boxHeight.toFixed(2)}">
  <g transform="translate(${padding} ${(padding - top).toFixed(2)})">
    ${sonarRings({ cx: mark.archCentre.x, cy: mark.archCentre.y, radii, width: 1.9 })}
    ${markPaths(mark, INK)}
  </g>
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

/**
 * Open Graph card, 1200x630, on ink.
 * With a title it renders the post title; without one, the full mark.
 */
export function ogSvg({ title } = {}) {
  const corner = (() => {
    const mark = buildWordmark({ size: 34 });
    const scale = 1;
    return `<g transform="translate(80 ${556 - mark.height * scale}) scale(${scale})">
      ${markPaths(mark, PAPER)}
    </g>`;
  })();

  if (!title) {
    const mark = buildWordmark({ size: 92 });
    const radii = [40, 56, 72, 88, 104].map((r) => r * 1.15);
    const scale = 1.15;
    const x = 600 - (mark.width * scale) / 2;
    const y = 315 - (mark.archCentre.y * scale);

    return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${INK}" />
  <g transform="translate(${x.toFixed(2)} ${y.toFixed(2)}) scale(${scale})">
    ${sonarRings({ cx: mark.archCentre.x, cy: mark.archCentre.y, radii, stroke: ACCENT, width: 1.8 })}
    ${markPaths(mark, PAPER)}
  </g>
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

  const badge = (() => {
    const cx = 1080;
    const cy = 96;
    const archWidth = 26;
    const archHeight = (archWidth * 120) / 100;
    return `${sonarRings({ cx, cy, radii: [26, 38, 50, 62], stroke: ACCENT, width: 2 })}
    <path d="${archPath(cx - archWidth / 2, cy + archHeight / 2, archWidth)}" fill="${PAPER}" />`;
  })();

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${INK}" />
  ${badge}
  ${titleText}
  <rect x="80" y="486" width="72" height="4" fill="${ACCENT}" />
  ${corner}
</svg>`;
}

/** Placeholder headshot: an arch silhouette. Obvious, not ugly. */
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
