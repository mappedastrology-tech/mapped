// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// The canonical origin. Every absolute URL on the site — canonicals, OG tags,
// JSON-LD, the sitemap, RSS — is derived from this one value. Change it here
// and nowhere else.
export const SITE = 'https://sonoramethod.com';

export default defineConfig({
  site: SITE,
  output: 'static',
  trailingSlash: 'never',
  build: {
    // Emit /method.html rather than /method/index.html so Netlify serves clean
    // URLs without a trailing-slash redirect.
    format: 'file',
  },
  integrations: [
    sitemap({
      // /thanks is noindex — a form confirmation has no business in a sitemap.
      filter: (page) => !page.includes('/thanks'),
    }),
  ],
});
