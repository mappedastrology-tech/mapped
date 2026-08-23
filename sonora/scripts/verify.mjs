/**
 * Pre-launch verification, run against the built output in dist/.
 *
 * This is the checklist from the build spec, automated where automation is
 * possible. It does not replace Lighthouse, a real phone, or a keyboard pass —
 * those are listed at the end as manual steps.
 *
 * Usage: npm run build && npm run verify
 */
import { readFile, readdir, access } from 'node:fs/promises';
import { constants } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const dist = path.join(root, 'dist');

let failures = 0;
let warnings = 0;

const pass = (message) => console.log(`  ok    ${message}`);
const fail = (message) => {
  failures += 1;
  console.log(`  FAIL  ${message}`);
};
const warn = (message) => {
  warnings += 1;
  console.log(`  warn  ${message}`);
};

const heading = (title) => console.log(`\n${title}`);

async function exists(filePath) {
  try {
    await access(filePath, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function html(name) {
  return readFile(path.join(dist, name), 'utf8');
}

/** Curly quotes are emitted as entities; compare on a normalised copy. */
function decode(source) {
  return source
    .replace(/&rsquo;|&#8217;/g, '\u2019')
    .replace(/&lsquo;/g, '\u2018')
    .replace(/&mdash;/g, '\u2014')
    .replace(/&ndash;/g, '\u2013')
    .replace(/&middot;/g, '\u00b7')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

/** Every page, and a phrase from its body copy that must survive with JS off. */
const PAGES = [
  ['index.html', '/', 'The room got too loud'],
  ['method.html', '/method', 'Categories don’t create themselves'],
  ['services.html', '/services', 'Roadmap Execution Management'],
  ['about.html', '/about', 'A ranch in the Texas Hill Country'],
  ['blog.html', '/blog', 'Notes on AI search'],
  ['book.html', '/book', 'Thirty minutes'],
  ['contact.html', '/contact', 'What are you trying to fix?'],
  ['thanks.html', '/thanks', 'That came through'],
  ['privacy.html', '/privacy', 'This site collects almost nothing'],
  ['404.html', '/404', 'the opposite of the problem'],
  ['blog/the-sonora-method.html', '/blog/the-sonora-method', 'The room got too loud'],
];

heading('Body copy present in the served HTML (JS disabled)');
const documents = new Map();
for (const [file, route, phrase] of PAGES) {
  if (!(await exists(path.join(dist, file)))) {
    fail(`${route} — ${file} was not built`);
    continue;
  }
  const source = await html(file);
  documents.set(route, source);
  if (decode(source).includes(phrase)) {
    pass(`${route} contains "${phrase.slice(0, 34)}…"`);
  } else {
    fail(`${route} is missing body copy: "${phrase}"`);
  }
}

heading('Unique titles and descriptions');
const titles = new Map();
const descriptions = new Map();
for (const [route, source] of documents) {
  const title = source.match(/<title>([^<]*)<\/title>/)?.[1];
  const description = source.match(
    /<meta name="description" content="([^"]*)"/
  )?.[1];

  if (!title) {
    fail(`${route} has no <title>`);
  } else {
    if (titles.has(title)) fail(`${route} duplicates the title on ${titles.get(title)}`);
    titles.set(title, route);
    if (title.length > 60) warn(`${route} title is ${title.length} chars (target: under 60)`);
  }

  if (!description) {
    fail(`${route} has no meta description`);
  } else {
    if (descriptions.has(description)) {
      fail(`${route} duplicates the description on ${descriptions.get(description)}`);
    }
    descriptions.set(description, route);
    if (description.length > 155) {
      warn(`${route} description is ${description.length} chars (target: under 155)`);
    }
  }
}
if (titles.size === documents.size) pass(`${titles.size} unique titles`);
if (descriptions.size === documents.size) pass(`${descriptions.size} unique descriptions`);

heading('Canonical, Open Graph, Twitter');
let before = failures;
for (const [route, source] of documents) {
  const required = [
    'rel="canonical"',
    'property="og:title"',
    'property="og:description"',
    'property="og:image"',
    'property="og:type"',
    'property="og:url"',
    'name="twitter:card"',
  ];
  const missing = required.filter((tag) => !source.includes(tag));
  if (missing.length) fail(`${route} is missing: ${missing.join(', ')}`);
}
if (failures === before) pass('every page has canonical, og:*, and twitter:card');

heading('Structured data');
const TYPES_BY_ROUTE = {
  '/': ['Organization', 'WebSite', 'BreadcrumbList'],
  '/method': ['Organization', 'WebSite', 'FAQPage', 'BreadcrumbList'],
  '/services': ['Organization', 'WebSite', 'Service', 'BreadcrumbList'],
  '/about': ['Organization', 'WebSite', 'Person', 'BreadcrumbList'],
  '/blog/the-sonora-method': ['Organization', 'WebSite', 'BlogPosting', 'BreadcrumbList'],
};

for (const [route, source] of documents) {
  const raw = source.match(
    /<script type="application\/ld\+json">([\s\S]*?)<\/script>/
  )?.[1];

  if (!raw) {
    fail(`${route} has no JSON-LD`);
    continue;
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    fail(`${route} JSON-LD does not parse: ${error.message}`);
    continue;
  }

  const types = parsed['@graph'].flatMap((node) => node['@type']);
  const expected = TYPES_BY_ROUTE[route] ?? ['Organization', 'WebSite', 'BreadcrumbList'];
  const missing = expected.filter((type) => !types.includes(type));

  if (missing.length) {
    fail(`${route} JSON-LD is missing ${missing.join(', ')}`);
  } else {
    pass(`${route} — ${[...new Set(types)].join(', ')}`);
  }
}

heading('Prohibited content');
const forbidden = [
  // No prices or rates anywhere on the site.
  [/\$\s?\d/, 'a dollar figure'],
  [/\b\d+\s?%\s+(increase|growth|lift|more)/i, 'a performance metric'],
  [/\bpricing\b/i, 'the word "pricing"'],
  [/\bper month\b/i, 'a rate'],
  [/\bretainer fee\b/i, 'a fee reference'],
];

let prohibitedHits = 0;
for (const [route, source] of documents) {
  const text = source.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, ' ');
  for (const [pattern, label] of forbidden) {
    if (pattern.test(text)) {
      fail(`${route} contains ${label}`);
      prohibitedHits += 1;
    }
  }
}
if (!prohibitedHits) pass('no prices, rates, or performance metrics found');

/**
 * Employer names. Taylor supplies the list; until then this checks the file
 * exists and greps whatever is in it.
 */
const employerList = path.join(root, 'scripts', 'employer-names.txt');
if (await exists(employerList)) {
  const names = (await readFile(employerList, 'utf8'))
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'));

  if (!names.length) {
    warn('scripts/employer-names.txt is empty — add the names Taylor provides');
  } else {
    let hits = 0;
    for (const [route, source] of documents) {
      for (const name of names) {
        if (source.toLowerCase().includes(name.toLowerCase())) {
          fail(`${route} mentions "${name}"`);
          hits += 1;
        }
      }
    }
    if (!hits) pass(`no former employer named (${names.length} checked)`);
  }
} else {
  warn('scripts/employer-names.txt not found — cannot check for employer names');
}

heading('Accessibility structure');
before = failures;
for (const [route, source] of documents) {
  const h1Count = (source.match(/<h1[\s>]/g) ?? []).length;
  if (h1Count !== 1) fail(`${route} has ${h1Count} <h1> elements (expected 1)`);

  const levels = [...source.matchAll(/<h([1-6])[\s>]/g)].map((match) => Number(match[1]));
  for (let index = 1; index < levels.length; index += 1) {
    if (levels[index] - levels[index - 1] > 1) {
      fail(`${route} skips from h${levels[index - 1]} to h${levels[index]}`);
      break;
    }
  }

  if (!source.includes('class="skip-link"')) fail(`${route} has no skip-to-content link`);
  if (!source.includes('<main')) fail(`${route} has no <main>`);
  if (!source.includes('<footer')) fail(`${route} has no <footer>`);

  const imagesWithoutAlt = [...source.matchAll(/<img\b[^>]*>/g)].filter(
    (match) => !/\salt=/.test(match[0])
  );
  if (imagesWithoutAlt.length) {
    fail(`${route} has ${imagesWithoutAlt.length} <img> without alt`);
  }
}
if (failures === before) {
  pass('one h1 per page, no skipped levels, landmarks and alt text present');
}

heading('Machine-readable files');
for (const file of ['llms.txt', 'robots.txt', 'rss.xml', 'sitemap-index.xml']) {
  if (await exists(path.join(dist, file))) {
    pass(`/${file}`);
  } else {
    fail(`/${file} is missing`);
  }
}

const llms = await readFile(path.join(dist, 'llms.txt'), 'utf8');
if (llms.includes('/blog/the-sonora-method')) {
  pass('llms.txt lists published posts');
} else {
  fail('llms.txt is not listing posts');
}

const robots = await readFile(path.join(dist, 'robots.txt'), 'utf8');
for (const agent of ['GPTBot', 'ClaudeBot', 'PerplexityBot', 'Google-Extended', 'CCBot']) {
  if (!robots.includes(agent)) fail(`robots.txt does not name ${agent}`);
}
if (robots.includes('Sitemap:')) pass('robots.txt references the sitemap');

heading('Icons and social images');
for (const file of [
  'favicon.ico',
  'favicon-16.png',
  'favicon-32.png',
  'apple-touch-icon.png',
  'images/og-default.png',
  'images/og/the-sonora-method.png',
]) {
  if (await exists(path.join(dist, file))) {
    pass(`/${file}`);
  } else {
    fail(`/${file} is missing`);
  }
}

heading('Forms');
const contact = documents.get('/contact');
if (contact?.includes('data-netlify="true"') && contact.includes('name="form-name"')) {
  pass('contact form is wired to Netlify Forms');
} else {
  fail('contact form is missing Netlify Forms attributes');
}
if (contact?.includes('netlify-honeypot')) {
  pass('contact form has a honeypot');
} else {
  fail('contact form has no honeypot');
}

heading('Placeholders still in place');
const site = await readFile(path.join(root, 'src', 'lib', 'site.ts'), 'utf8');
for (const key of ['linkedin', 'calcom', 'analyticsSiteId']) {
  const line = site.match(new RegExp(`${key}: '([^']*)'`))?.[1] ?? '';
  if (line.startsWith('TAYLOR_TO_PROVIDE')) {
    warn(`${key} is still a placeholder`);
  } else {
    pass(`${key} is set`);
  }
}

const brandDir = path.join(root, 'public', 'brand');
const brandFiles = await readdir(brandDir);
if (brandFiles.length) {
  warn(
    'brand PNGs may still be placeholders — confirm public/brand/ holds Taylor’s real files'
  );
}

heading('Still to do by hand');
console.log('  - Lighthouse on mobile: Performance >= 95, Accessibility 100, SEO 100');
console.log('  - Validate JSON-LD in Google’s Rich Results Test');
console.log('  - Submit a real contact-form entry after the first deploy');
console.log('  - Keyboard-navigate every page');
console.log('  - Open the site on a real phone');

console.log(
  `\n${failures ? 'FAILED' : 'PASSED'} — ${failures} failure(s), ${warnings} warning(s)\n`
);

process.exit(failures ? 1 : 0);
