/**
 * Build-time asset generation. Runs before every `npm run build`.
 *
 * 1. Writes placeholder brand PNGs, but only where a file is missing. Drop
 *    Taylor's real PNGs into public/brand/ and they are used untouched.
 * 2. Derives favicon.ico, favicon-32.png, favicon-16.png and
 *    apple-touch-icon.png from public/brand/sonora-icon.png every time, so
 *    replacing the icon regenerates all four.
 * 3. Renders the default Open Graph card and one card per blog post.
 * 4. Converts a supplied headshot to WebP, or writes a placeholder.
 *
 * Nothing here runs in the browser. Fonts are read from scripts/fonts/ so the
 * build does not depend on network access.
 */
import { Resvg } from '@resvg/resvg-js';
import sharp from 'sharp';
import { readFile, writeFile, mkdir, readdir, access, rm } from 'node:fs/promises';
import { constants } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import {
  iconSvg,
  archSvg,
  wordmarkSvg,
  fullSvg,
  ogSvg,
  headshotPlaceholderSvg,
  INK,
  PAPER,
} from './brand-svg.mjs';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const publicDir = path.join(root, 'public');
const brandDir = path.join(publicDir, 'brand');
const imagesDir = path.join(publicDir, 'images');
const fontsDir = path.join(root, 'scripts', 'fonts');

const FONT_FILES = [
  path.join(fontsDir, 'Poppins-SemiBold.ttf'),
  path.join(fontsDir, 'Inter-Regular.ttf'),
];

const log = (message) => console.log(`  ${message}`);

async function exists(filePath) {
  try {
    await access(filePath, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

function renderPng(svg, width) {
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: width },
    font: {
      fontFiles: FONT_FILES,
      loadSystemFonts: false,
      defaultFontFamily: 'Poppins',
    },
  });
  return resvg.render().asPng();
}

/** Writes a PNG only if the destination is missing. Returns true if written. */
async function writeIfMissing(filePath, buffer) {
  if (await exists(filePath)) return false;
  await writeFile(filePath, buffer);
  return true;
}

/**
 * Minimal ICO container. Modern browsers accept PNG-encoded ICO entries, so
 * each size is embedded as a PNG rather than a BMP.
 */
function buildIco(entries) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(entries.length, 4);

  let offset = 6 + entries.length * 16;
  const directory = [];

  for (const entry of entries) {
    const record = Buffer.alloc(16);
    record.writeUInt8(entry.size >= 256 ? 0 : entry.size, 0); // width
    record.writeUInt8(entry.size >= 256 ? 0 : entry.size, 1); // height
    record.writeUInt8(0, 2); // palette
    record.writeUInt8(0, 3); // reserved
    record.writeUInt16LE(1, 4); // colour planes
    record.writeUInt16LE(32, 6); // bits per pixel
    record.writeUInt32LE(entry.data.length, 8);
    record.writeUInt32LE(offset, 12);
    directory.push(record);
    offset += entry.data.length;
  }

  return Buffer.concat([
    header,
    ...directory,
    ...entries.map((entry) => entry.data),
  ]);
}

/** Frontmatter reader. Only needs title and draft, so a full parser is overkill. */
function readFrontmatter(source) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};

  const data = {};
  for (const line of match[1].split(/\r?\n/)) {
    const pair = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/);
    if (!pair) continue;
    let value = pair[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    data[pair[1]] = value;
  }
  return data;
}

async function generateBrand() {
  await mkdir(brandDir, { recursive: true });

  const placeholders = [
    ['sonora-icon.png', () => renderPng(iconSvg(), 512)],
    ['sonora-arch.png', () => renderPng(archSvg(), 400)],
    ['sonora-wordmark.png', () => renderPng(wordmarkSvg(), 480)],
    ['sonora-full.png', () => renderPng(fullSvg(), 800)],
  ];

  let written = 0;
  for (const [name, render] of placeholders) {
    if (await writeIfMissing(path.join(brandDir, name), render())) written += 1;
  }

  // A marker so `npm run verify` keeps flagging that these are stand-ins.
  // Overwriting the PNGs with the real artwork is not enough on its own —
  // delete this file too, or run `npm run assets` after replacing them.
  const marker = path.join(brandDir, '.placeholder-artwork');
  if (written) {
    await writeFile(
      marker,
      'Generated stand-in artwork. Delete this file once the real PNGs are in place.\n'
    );
    log(`brand: wrote ${written} generated file(s) — replace with the real PNGs`);
  } else {
    log('brand: all files present, none overwritten');
  }
}

/**
 * The knockout wordmark is derived from sonora-wordmark.png when Taylor
 * supplies a real one, so she does not have to produce a second file.
 */
async function generateKnockout() {
  const source = path.join(brandDir, 'sonora-wordmark.png');
  const target = path.join(brandDir, 'sonora-wordmark-knockout.png');

  if (!(await exists(source))) return;

  const stats = await sharp(source).metadata();
  if (!stats.width || !stats.height) return;

  // A knockout is the same artwork in paper: keep the alpha channel, replace
  // every colour. Derived every build so Taylor never has to supply a second
  // file when she sends the real wordmark.
  const recoloured = await sharp(source)
    .ensureAlpha()
    .composite([
      {
        input: {
          create: {
            width: stats.width,
            height: stats.height,
            channels: 4,
            background: PAPER,
          },
        },
        blend: 'in',
      },
    ])
    .png()
    .toBuffer();

  await writeFile(target, recoloured);
  log('brand: derived sonora-wordmark-knockout.png from sonora-wordmark.png');
}

/**
 * WebP copies of the brand artwork. Taylor supplies PNGs — those filenames are
 * the contract in the README — and the pages reference the WebP the build
 * produces from them. Every browser in use supports WebP, and it is roughly a
 * quarter the weight.
 */
async function generateBrandWebp() {
  const sources = [
    'sonora-full.png',
    'sonora-wordmark.png',
    'sonora-wordmark-knockout.png',
    'sonora-icon.png',
    'sonora-arch.png',
  ];

  let count = 0;
  for (const name of sources) {
    const source = path.join(brandDir, name);
    if (!(await exists(source))) continue;
    await sharp(source)
      .webp({ quality: 90, effort: 6 })
      .toFile(path.join(brandDir, name.replace(/\.png$/, '.webp')));
    count += 1;
  }

  log(`brand: ${count} WebP copies for the pages to use`);
}

async function generateFavicons() {
  const iconPath = path.join(brandDir, 'sonora-icon.png');
  if (!(await exists(iconPath))) {
    log('favicons: skipped, public/brand/sonora-icon.png is missing');
    return;
  }

  const source = await readFile(iconPath);
  // The source icon is transparent so it can sit on either surface. Favicons
  // and the apple-touch icon get an opaque paper background — iOS in
  // particular renders transparency as black.
  const resize = (size) =>
    sharp(source)
      .resize(size, size, { fit: 'contain', background: PAPER })
      .flatten({ background: PAPER })
      .png()
      .toBuffer();

  const [png16, png32, png48, png180] = await Promise.all([
    resize(16),
    resize(32),
    resize(48),
    resize(180),
  ]);

  await Promise.all([
    writeFile(path.join(publicDir, 'favicon-16.png'), png16),
    writeFile(path.join(publicDir, 'favicon-32.png'), png32),
    writeFile(path.join(publicDir, 'apple-touch-icon.png'), png180),
    writeFile(
      path.join(publicDir, 'favicon.ico'),
      buildIco([
        { size: 16, data: png16 },
        { size: 32, data: png32 },
        { size: 48, data: png48 },
      ])
    ),
  ]);

  log('favicons: favicon.ico, favicon-16, favicon-32, apple-touch-icon');
}

async function generateOgImages() {
  await mkdir(imagesDir, { recursive: true });

  await writeFile(
    path.join(imagesDir, 'og-default.png'),
    renderPng(ogSvg(), 1200)
  );

  const blogDir = path.join(root, 'src', 'content', 'blog');
  if (!(await exists(blogDir))) {
    log('og: default card only, no blog directory');
    return;
  }

  const files = (await readdir(blogDir)).filter((file) => file.endsWith('.md'));
  const ogDir = path.join(imagesDir, 'og');
  await mkdir(ogDir, { recursive: true });

  let count = 0;
  for (const file of files) {
    const source = await readFile(path.join(blogDir, file), 'utf8');
    const data = readFrontmatter(source);
    if (data.draft === 'true' || !data.title) continue;

    const slug = file.replace(/\.md$/, '');
    await writeFile(
      path.join(ogDir, `${slug}.png`),
      renderPng(ogSvg({ title: data.title }), 1200)
    );
    count += 1;
  }

  log(`og: default card + ${count} post card(s)`);
}

async function generateHeadshot() {
  await mkdir(imagesDir, { recursive: true });
  const target = path.join(imagesDir, 'taylor-corbett.webp');

  const candidates = [
    'taylor-corbett-source.jpg',
    'taylor-corbett-source.jpeg',
    'taylor-corbett-source.png',
    'taylor-corbett-source.webp',
  ];

  for (const candidate of candidates) {
    const source = path.join(imagesDir, candidate);
    if (await exists(source)) {
      await sharp(source)
        .resize(800, 800, { fit: 'cover', position: 'top' })
        .webp({ quality: 82 })
        .toFile(target);
      await rm(path.join(imagesDir, '.placeholder-headshot'), { force: true });
      log(`headshot: converted ${candidate} to taylor-corbett.webp`);
      return;
    }
  }

  if (await exists(target)) {
    log('headshot: existing taylor-corbett.webp kept');
    return;
  }

  const png = renderPng(headshotPlaceholderSvg(), 800);
  await sharp(png).webp({ quality: 82 }).toFile(target);
  await writeFile(
    path.join(imagesDir, '.placeholder-headshot'),
    'Generated stand-in. Removed automatically once a real source image is supplied.\n'
  );
  log('headshot: placeholder written — drop taylor-corbett-source.jpg in public/images/');
}

console.log('Generating brand assets…');
await generateBrand();
await generateKnockout();
await generateBrandWebp();
await generateFavicons();
await generateOgImages();
await generateHeadshot();
console.log('Done.');
