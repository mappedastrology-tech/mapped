/**
 * Builds a single-file, browsable preview of the whole site.
 *
 * This exists because the site could not be deployed from the build
 * environment. It stitches every built page into one document with a page
 * switcher so the design and copy can be reviewed in a browser. It is a
 * preview, not the site: real URLs, the booking iframe, analytics, and the
 * forms only work once it is on Netlify.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const dist = path.join(root, 'dist');
const out = process.argv[2];

const PAGES = [
  ['/', 'index.html', 'Home'],
  ['/method', 'method.html', 'Method'],
  ['/services', 'services.html', 'Services'],
  ['/about', 'about.html', 'About'],
  ['/blog', 'blog.html', 'Writing'],
  ['/blog/the-sonora-method', 'blog/the-sonora-method.html', 'A post'],
  ['/book', 'book.html', 'Book'],
  ['/contact', 'contact.html', 'Contact'],
  ['/privacy', 'privacy.html', 'Privacy'],
  ['/404', '404.html', '404'],
];

const MIME = { webp: 'image/webp', png: 'image/png', jpg: 'image/jpeg', svg: 'image/svg+xml' };

async function dataUri(assetPath) {
  const file = await readFile(path.join(dist, assetPath.replace(/^\//, '')));
  const extension = assetPath.split('.').pop();
  return `data:${MIME[extension] ?? 'application/octet-stream'};base64,${file.toString('base64')}`;
}

const css = await readFile(path.join(dist, '_astro', 'Base.CiZcYP31.css'), 'utf8');

// Every local image becomes a data URI so the page is self-contained.
const assets = new Map();
for (const asset of [
  '/brand/sonora-full.webp',
  '/brand/sonora-wordmark.webp',
  '/brand/sonora-wordmark-knockout.webp',
  '/brand/sonora-icon.webp',
  '/images/taylor-corbett.webp',
]) {
  assets.set(asset, await dataUri(asset));
}

const known = new Set(PAGES.map(([route]) => route));

/** Per-page scoped styles that Astro inlines into <head> rather than the
 *  shared stylesheet. Without these, component layout rules are missing. */
function headStyles(html) {
  const head = html.slice(0, html.indexOf('</head>'));
  return [...head.matchAll(/<style>([\s\S]*?)<\/style>/g)]
    .map((match) => match[1])
    .join('\n');
}

function transform(html, route) {
  // Body only — the artifact supplies the document shell.
  let body = html.slice(html.indexOf('<body'), html.lastIndexOf('</body>'));
  body = body.slice(body.indexOf('>') + 1);

  // Strip every script: analytics has no business in a preview, and without
  // the `js` class nothing is ever hidden behind the scroll animation.
  body = body.replace(/<script[\s\S]*?<\/script>/g, '');

  // Inline the images.
  for (const [asset, uri] of assets) {
    body = body.split(asset).join(uri);
  }

  // Internal links drive the page switcher instead of navigating.
  body = body.replace(/href="(\/[^"#]*)"/g, (match, href) => {
    const target = href.replace(/\/$/, '') || '/';
    return known.has(target) ? `href="#" data-goto="${target}"` : match;
  });

  // The booking iframe points at Google; the preview cannot load it.
  body = body.replace(
    /<iframe[\s\S]*?<\/iframe>/,
    `<div class="preview-note">
       <strong>Google Calendar booking embed</strong>
       <span>Loads on the live site. Previews cannot embed third-party calendars.</span>
     </div>`
  );

  return `<section class="pv-page" data-route="${route}" hidden>${body}</section>`;
}

const sections = [];
const scopedStyles = new Set();
for (const [route, file] of PAGES) {
  const html = await readFile(path.join(dist, file), 'utf8');
  const styles = headStyles(html);
  if (styles) scopedStyles.add(styles);
  sections.push(transform(html, route));
}

const tabs = PAGES.map(
  ([route, , label]) =>
    `<button type="button" data-goto="${route}" class="pv-tab">${label}</button>`
).join('');

const page = `<title>Sonora Site Preview</title>
<style>
${css}
${[...scopedStyles].join('\n')}

/* ---- preview chrome only. None of this is part of the site. ---- */
.pv-bar {
  position: sticky; top: 0; z-index: 500;
  display: flex; flex-wrap: wrap; align-items: center; gap: 8px;
  padding: 10px 16px;
  background: #16133F; color: #FAF7F2;
  font-family: var(--font-body); font-size: 13px;
}
.pv-bar .pv-label {
  font-weight: 600; letter-spacing: .08em; text-transform: uppercase;
  opacity: .6; margin-right: 8px; font-size: 11px;
}
.pv-tab {
  appearance: none; cursor: pointer;
  padding: 7px 13px; border-radius: 999px;
  border: 1px solid rgba(250,247,242,.25);
  background: transparent; color: #FAF7F2;
  font: inherit; font-weight: 500;
}
.pv-tab:hover { border-color: #F3C677; }
.pv-tab[aria-current="true"] { background: #F3C677; border-color: #F3C677; color: #0C0A3E; }
.pv-page[hidden] { display: none; }
.pv-note-bar {
  padding: 10px 16px; background: #F4EFE7; color: #3A3852;
  font-family: var(--font-body); font-size: 13px; line-height: 1.5;
  border-bottom: 1px solid var(--rule);
}
.preview-note {
  display: flex; flex-direction: column; gap: 6px;
  max-width: 820px; padding: 40px 32px;
  border: 2px dashed var(--rule); border-radius: 2px;
  background: #F4EFE7; font-family: var(--font-body);
}
.preview-note strong { color: var(--ink); }
.preview-note span { color: var(--muted); font-size: 15px; }
/* The real header is sticky; stacked under the preview bar it fights for the
   top edge, so it is pinned normally here. */
.pv-page .site-header { position: static; }
</style>

<nav class="pv-bar" aria-label="Preview pages">
  <span class="pv-label">Preview</span>
  ${tabs}
</nav>
<p class="pv-note-bar">
  This is a static preview of every page, stitched into one file so it can be
  viewed without a deploy. Forms, the booking calendar, analytics and the real
  URLs only work once the site is live on Netlify.
</p>

${sections.join('\n')}

<script>
  (function () {
    const pages = document.querySelectorAll('.pv-page');
    const tabs = document.querySelectorAll('.pv-tab');

    function show(route) {
      let matched = false;
      pages.forEach(function (page) {
        const isTarget = page.dataset.route === route;
        page.hidden = !isTarget;
        if (isTarget) matched = true;
      });
      if (!matched) return show('/');
      tabs.forEach(function (tab) {
        tab.setAttribute('aria-current', String(tab.dataset.goto === route));
      });
      window.scrollTo(0, 0);
    }

    document.addEventListener('click', function (event) {
      const trigger = event.target.closest('[data-goto]');
      if (!trigger) return;
      event.preventDefault();
      show(trigger.dataset.goto);
    });

    show('/');
  })();
</script>`;

await writeFile(out, page);
console.log(`preview written to ${out} (${(page.length / 1024).toFixed(0)} KB)`);
