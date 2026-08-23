# sonoramethod.com

This is the Sonora website. It is a set of files that get turned into a website
automatically. You do not need to understand how that works to change what the
site says.

This README is written for Taylor. It assumes no programming experience. Where
something genuinely needs a developer, it says so.

---

## The short version

- **To change words on a page:** edit a file in `src/pages/`, save, done.
- **To publish a blog post:** add a file to `src/content/blog/`, save, done.
- **To publish anything:** save the change on GitHub. The site rebuilds and goes
  live on its own in about a minute.
- **If something looks broken:** nothing you do here can break the live site
  permanently. The previous version stays up until the new one builds cleanly.

---

## What still needs to happen before launch

These are the things only you can supply. Everything else is built.

| # | What | Where it goes |
|---|------|---------------|
| 1 | The four logo PNGs | Drop into `public/brand/` using the exact filenames in the table further down |
| 2 | Your headshot | Save as `public/images/taylor-corbett-source.jpg` |
| 3 | Your LinkedIn URL | `src/lib/site.ts`, replace `TAYLOR_TO_PROVIDE_LINKEDIN_URL` |
| 4 | Your Cal.com booking link | `src/lib/site.ts`, replace `TAYLOR_TO_PROVIDE_CALCOM_LINK` |
| 5 | Analytics site ID | `src/lib/site.ts`, replace `TAYLOR_TO_PROVIDE_ANALYTICS_SITE_ID` |
| 6 | List of former employer names | `scripts/employer-names.txt`, one per line |
| 7 | `hello@sonoramethod.com` mailbox | Google Workspace, forwarding to your main inbox |

Until each of those is supplied the site still works. It shows an obvious
placeholder instead — a dashed box on the booking page, "LinkedIn — link
pending" in the footer, and a grey placeholder where the headshot goes. Nothing
silently ships as blank.

After launch there are three more, listed at the bottom of this file.

---

## Changing words on a page

Every page is one file. Open it, find the sentence, change it, save.

| Page on the site | File to edit |
|---|---|
| Homepage | `src/pages/index.astro` |
| The Sonora Method | `src/pages/method.astro` |
| Services | `src/pages/services.astro` |
| About | `src/pages/about.astro` |
| Book a call | `src/pages/book.astro` |
| Contact | `src/pages/contact.astro` |
| Writing (the blog index) | `src/pages/blog/index.astro` |
| Privacy | `src/pages/privacy.astro` |
| The "page not found" page | `src/pages/404.astro` |

Inside those files, your words sit between angle-bracket tags like `<p>` and
`</p>`. Change what is between the tags. Leave the tags alone.

```
<p>
  This sentence you can change.
</p>
```

Three things live in one place because they appear on several pages:

- **Contact details, location, tagline, the nav and footer links** —
  `src/lib/site.ts`
- **The four method stages** — `src/lib/method.ts` (short version, homepage) and
  `src/lib/method-page.ts` (long version, Method page)
- **The five services** — `src/lib/site.ts` (one-liners) and
  `src/lib/services-detail.ts` (full descriptions)
- **The four FAQ answers** — `src/lib/faq.ts`

Change them there and every page that uses them updates at once. The FAQ file is
worth knowing about: the same words feed the visible page *and* the hidden
markup that answer engines read, so the two can never disagree.

### Two characters to be careful with

Apostrophes and quotes inside a page file should be written as `&rsquo;` for a
curly apostrophe. If you type a plain `'` it still works — it just looks
slightly less polished. Both are fine.

---

## Publishing a blog post

1. Go to `src/content/blog/` on GitHub.
2. Click **Add file → Create new file**.
3. Name it with the words you want in the URL, all lowercase, hyphens instead of
   spaces, ending in `.md`. `seo-isnt-dead.md` becomes
   `sonoramethod.com/blog/seo-isnt-dead`.
4. Paste this at the top, filling in your own values:

```markdown
---
title: "SEO isn't dead, it's evolved"
description: "One or two sentences. This is what shows up in Google and in link previews. Keep it under 155 characters."
date: 2026-09-01
draft: false
---

Your first paragraph goes here. Just write normally.

## A section heading uses two hash marks

More writing.

- A bullet list
- Looks like this

> A pull quote looks like this.
```

5. Write the post below that block.
6. Click **Commit changes**.

The post appears on `/blog`, on the homepage, in the RSS feed, in the sitemap, in
`llms.txt`, and gets its own social share image — all automatically. Nothing
else to update.

**Everything above the second `---` is required except `draft`.** A post without
a `description` will stop the build on purpose, because a post without one gets
a blank preview everywhere it is shared.

### Working on a post before it's ready

Set `draft: true` in that block. The post stays in the repo and never appears on
the site. Change it to `false` when you want it live.

### Dates

Write dates as `2026-09-01` — year, month, day. Posts sort newest first.

---

## Publishing changes

If you are editing on github.com, clicking **Commit changes** is the whole
process. Netlify notices, rebuilds the site, and the change is live in about a
minute.

If a build fails, Netlify emails you and **the old version of the site stays
up**. Forward the email to whoever is helping you; the message says which file
and which line.

---

## The logo files

Five files live in `public/brand/`. Four are yours; the fifth is generated.

| Filename | What it is | Used for |
|---|---|---|
| `sonora-full.png` | Wordmark with radiating waves | Homepage hero, social share image |
| `sonora-wordmark.png` | Wordmark only, no waves | Nav bar, footer |
| `sonora-icon.png` | Arch with waves, square | Favicon, apple touch icon |
| `sonora-arch.png` | Solid arch shape only | Graphic element |
| `sonora-wordmark-knockout.png` | *Generated* — the wordmark in cream | Footer, on the dark background |

**To install the real logos:** upload your four PNGs to `public/brand/`, using
exactly those filenames, replacing what is there. That is the only step. The
favicon, the apple touch icon, the cream footer wordmark, and the social share
image all regenerate from them on the next build.

The files currently in that folder are placeholders drawn to the same
proportions, so nothing shifts on the page when the real ones land.

`sonora-icon.png` should have a transparent background. It sits on cream in the
header and on navy in the mobile menu.

---

## Your headshot

Save it as `public/images/taylor-corbett-source.jpg` (or `.png`). The build
crops it to a square, compresses it, and produces the version the site uses. Use
the largest file you have; it will be resized down.

It is displayed as a square with a rounded top — the arch shape. Faces sit near
the top of the crop, so a photo with headroom works best.

---

## The booking page

The `/book` page shows a dashed placeholder box until the Cal.com link is set.

Once you have set up Cal.com (account, Google Calendar connected, one 30-minute
"Intro call" event type, booking questions for company URL and "what are you
trying to fix", a buffer between meetings), open `src/lib/site.ts` and replace:

```
calcom: 'TAYLOR_TO_PROVIDE_CALCOM_LINK',
```

with your link in `username/event-slug` form — the part of your Cal.com URL after
`cal.com/`. For example:

```
calcom: 'sonora/intro-call',
```

The booking calendar appears on the page automatically.

---

## Analytics

The site is built for **Plausible** — cookieless, no consent banner needed, no
effect on page speed. Create the account, add `sonoramethod.com` as a site, then
open `src/lib/site.ts` and replace:

```
analyticsSiteId: 'TAYLOR_TO_PROVIDE_ANALYTICS_SITE_ID',
```

with:

```
analyticsSiteId: 'sonoramethod.com',
```

That switches the tracking script on. Nothing else to do. (If you choose Fathom
instead, the script line in `src/layouts/Base.astro` needs a one-line change —
that one is a developer job, but a five-minute one.)

---

## The newsletter

Both signup forms — footer and blog page — currently collect addresses through
Netlify. To read them: Netlify dashboard → your site → **Forms** → `newsletter`.
You can export the list as a spreadsheet from there.

When you pick a proper email provider (ConvertKit, Buttondown, or Beehiiv), the
change is one line in `src/components/NewsletterForm.astro`: swap the `action`
to that provider's form endpoint and remove `data-netlify="true"`. Nothing else
about the form changes. Export your existing list from Netlify first and import
it into the new provider.

The contact form works the same way and lands in the same place, under
`contact`.

---

## Things this site will not let you do by accident

Some rules from the brief are enforced by the code, not by memory:

- **A page without a title or description stops the build.** It cannot ship
  half-configured.
- **A blog post without a description stops the build.**
- **Draft posts never reach the live site**, even by a stray link.
- `npm run verify` **fails** if a price, a rate, or a former employer name
  appears anywhere in the built site (once you have filled in
  `scripts/employer-names.txt`).
- The testimonial component has **no field for a company name**. That is
  deliberate. Do not add one.

---

## For a developer

Astro, static output, no framework JavaScript. Plain CSS with custom properties
in `src/styles/global.css`; everything else is component-scoped.

```bash
npm install       # once
npm run dev       # local preview at http://localhost:4321
npm run build     # production build into dist/
npm run verify    # run the pre-launch checklist against dist/
```

`npm run build` runs `scripts/generate-assets.mjs` first. That script writes
placeholder brand PNGs **only where a file is missing**, derives the favicons and
the knockout wordmark from the supplied artwork, renders the Open Graph cards
(default plus one per post, using the fonts in `scripts/fonts/`), and converts
the headshot to WebP. It never overwrites artwork it did not create.

`npm run verify` checks, against `dist/`: body copy present with JS disabled,
unique titles and descriptions within length, canonical and Open Graph tags,
JSON-LD types per route, prohibited content, heading order and landmarks, alt
text, the machine-readable files, form wiring, and which placeholders are still
unset. It exits non-zero on failure, so it can gate a deploy.

Structured data is assembled in `src/lib/schema.ts` as a single `@graph` per
page with stable `@id`s. Deliberate omissions, which should stay omitted: no
`alumniOf` on the Person node, no `offers` or price fields on the Service nodes.

Content lives in a content collection defined in `src/content.config.ts`.
`/llms.txt` and `/rss.xml` are generated routes, not static files, so both pick
up new posts with no manual step.

### Deploying

Netlify, building from this repo. Build command `npm run build`, publish
directory `dist`. Headers and caching are in `netlify.toml`.

**While this folder lives inside the Mapped repository**, set the Netlify site's
**base directory** to `sonora`. If it is later moved to its own repository,
clear that setting and everything else works unchanged.

DNS: use Netlify DNS for the apex domain and point `www` at it as a redirect.
HTTPS provisions itself through Let's Encrypt once DNS resolves.

---

## After launch

1. **Verify the site in Google Search Console and Bing Webmaster Tools**, and
   submit `https://sonoramethod.com/sitemap-index.xml` to both.
2. **Update your LinkedIn** — the profile still lists a role as "Present".
3. **Form the business entity before signing a client contract.** A DBA under an
   existing LLC is possible, but it does not separate liability between the two
   businesses and it puts the other entity's name on your contracts and W-9.
   Worth thirty minutes with a small-business attorney. *(This is not legal
   advice.)*
4. **Have a lawyer review one master services agreement template.** Once, not per
   client.

---

## Who to ask

For anything in this file that does not behave as described, or anything that
needs a developer, start with whoever handed this repository over. The three
places worth checking first:

- **Netlify dashboard** — build failures, form submissions, DNS, HTTPS.
- **`npm run verify` output** — it names the page and the problem.
- **The Netlify build log** — it names the file and the line.
