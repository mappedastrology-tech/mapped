# Mapped — Pre-Launch UI QA Review

*Part 1 defines what a thorough pre-launch UI QA entails (grounded in current industry practice). Part 2 applies it to Mapped with a status per category. Part 3 is the prioritized punch list.*

---

## Part 1 — What a thorough pre-launch UI QA entails

A real pre-launch QA is broader than "click around and look for bugs." Across mobile-app and web-launch QA guidance, a thorough review covers ~13 areas:

1. **Functional / core flows** — every primary task (sign up, onboarding, the main loops, payments) works end-to-end, including the unhappy paths.
2. **Navigation & information architecture** — intuitive, consistent, minimum effort; no dead ends; labels predict destinations.
3. **Responsive / multi-device** — scales correctly across breakpoints (test 320 / 375 / 414 / 768 / 1024 / 1280 / 1920), **no horizontal scroll at any width**. ~60% of traffic is mobile.
4. **Cross-browser** — consistent on Chrome, Safari, Firefox, Edge (+ iOS Safari / Android Chrome). **Safari is the #1 source of CSS bugs not seen in Chrome.**
5. **Accessibility (WCAG AA)** — keyboard operable (Tab/Enter/Esc), visible focus, **contrast ≥ 4.5:1 body / 3:1 large**, meaningful `alt` (or `alt=""` for decorative), labeled forms, logical heading order, captions/transcripts, respects reduced-motion.
6. **Performance** — pages/screens load **< 2s**; optimized images/CSS/JS; TTFB < ~600ms cached / < 1.2s dynamic; no memory leaks; smooth animations.
7. **UI states** — every component checked in **default, hover, focus, error, empty, loading, success, logged-in and logged-out** states.
8. **Visual & content consistency** — layout/spacing, typography, color, interactive states match spec; copy proofread (typos, tone, truncation).
9. **Forms & validation** — correct input types, inline validation, clear and specific error messages, sensible autofocus/autocorrect.
10. **Security & privacy** — auth/session handling, least-privilege permissions requested only when needed, data-privacy (GDPR) compliance, privacy policy + terms present.
11. **SEO & metadata** — title/description/Open Graph, favicon/app icon, manifest, robots, sitemap, canonical URLs.
12. **Analytics & monitoring** — error tracking and product analytics wired so you can see crashes and behavior from day one.
13. **Real-user/beta testing** — a beta with ~100–300 users matching the target audience before public launch; capture install, first-session, and store-compliance issues.

QA should run on a staging build that matches production, with stable test data, before the release is merged/shipped.

*Sources: [SennaLabs pre-launch usability checklist](https://sennalabs.com/blog/pre-launch-checklist-for-mobile-app-usability-testing), [Amwebtech mobile testing checklist](https://amwebtech.com/blog/mobile-app-testing-checklist-before-launch/), [OverlayQA website QA checklist](https://overlayqa.com/blog/website-qa-checklist/), [Reform cross-browser accessibility checklist](https://www.reform.app/blog/checklist-cross-browser-accessibility-testing), [BrowserStack visual regression guide](https://www.browserstack.com/percy/visual-regression-testing), [JustBeepIt 8-area QA checklist](https://www.justbeepit.com/post/the-ultimate-qa-checklist-for-website-launches-in-2025-8-core-areas).*

---

## Part 2 — Mapped against the checklist

Status key: ✅ ready · ⚠️ concern (fix soon) · ❌ blocker (fix before launch)

| # | Area | Status | Findings |
|---|---|---|---|
| 1 | **Functional / core flows** | ✅ | Onboarding → chart reveal, daily home, Dolly, Maps, Almanac, Library (courses + ~720-entry lookup) all work end-to-end. Engine test suite green (37/37). Note: paid decks are intentionally gated off. |
| 2 | **Navigation & IA** | ✅ | The big collision (Learn/Practice meaning two things) is fixed — bottom "Ritual," hamburger "My Practice," "Learn" = courses. Bottom nav now appears on every screen, hamburger double-highlight fixed. |
| 3 | **Responsive / multi-device** | ⚠️ | Mobile-first, centered `max-w-lg` column. Reads well on phones; on desktop it's a narrow centered column (fine for a mobile-first PWA, but confirm that's intended). **Not yet verified at 320px** (smallest phones) for overflow/truncation. |
| 4 | **Cross-browser** | ❌ | **Only Chrome has been tested.** Safari (especially **iOS Safari** — likely your biggest audience for an astrology app) is untested, and it's where CSS/flexbox/font bugs hide. Must test Safari + Firefox before launch. |
| 5 | **Accessibility (WCAG AA)** | ⚠️ | Good baseline: 44px tap targets, `aria-label` across ~58 components, decorative images `aria-hidden`/`alt=""`, focus traps in the menu and reference sheet, reduced-motion in the Library. Gaps: a **full contrast audit isn't done** (some micro-labels were borderline — partially raised), heading-order not audited, and the **Maps constellation is visual-only** (no list fallback for screen readers). |
| 6 | **Performance** | ❌ | **Blocker.** The oracle deck images are **~5 MB each** (`public/oracle/bird/*.png`, dozens of them) and `ritual` is **5.7 MB**; several page-background PNGs are 2–3 MB. Pulling an oracle card or opening Ritual downloads multi-megabyte assets — far over the < 2s budget on mobile data. These need WebP conversion + resizing before launch. (The *learning* images were optimized earlier; these decks/backgrounds were not.) |
| 7 | **UI states** | ✅ | Warm empty states ("No rush"), instant-fallback + background-upgrade loading on the daily reading, graceful error fallbacks. Minor: the "Personalizing your reading…" spinner can read as "stuck" after content is already shown. |
| 8 | **Visual & content** | ⚠️ | Gorgeous and consistent. Two type systems (Bodoni in Library, app fonts elsewhere) — intentional per owner. **No formal copy proofread** (typos/truncation pass) has been run. |
| 9 | **Forms & validation** | ✅ | Onboarding uses correct input types, inline validation (birth-time precision, password length, city autocomplete), clear errors, and a privacy reassurance line. |
| 10 | **Security & privacy** | ✅ | Auth-gated routes, RLS reviewed, AI routes gated, privacy policy + terms pages wired into footer/auth/onboarding/account, push prefs opt-in, birth data framed as private. (Earlier dedicated security review.) |
| 11 | **SEO & metadata** | ✅ | `manifest.json`, service worker, `robots.ts`, `sitemap.ts`, and root metadata (title, description, Open Graph, apple-web-app, viewport) all present. |
| 12 | **Analytics & monitoring** | ⚠️ | Sentry error monitoring is wired (graceful). **Confirm a product-analytics tool** (funnels, retention) is in place so you can read launch behavior; a bug-report button exists for qualitative reports. |
| 13 | **Real-user / beta testing** | ❌ | No structured beta yet (persona reviews are a proxy, not real users). Run a **closed beta (~100–300 target users)** to catch first-session, device, and store-compliance issues before public launch. |

---

## Part 3 — Prioritized pre-launch punch list

### ❌ Blockers (do before launch)
1. **Optimize the heavy images.** Convert the oracle deck (`public/oracle/bird/*`), `ritual`, and the 2–3 MB page backgrounds to **WebP + appropriately sized** (target < ~200 KB each). Biggest single launch risk — directly hurts load time, data use, and bounce. *(I can do this now.)*
2. **Test on Safari / iOS Safari (and Firefox).** Walk the core flows on real Safari; fix any CSS/layout divergences. iOS is likely your largest segment.
3. **Run a closed beta** with target users; triage what they hit.

### ⚠️ High-priority concerns
4. **Full WCAG AA contrast + keyboard pass**, plus a screen-reader list-fallback for the Maps constellation.
5. **Responsive check at 320px** (and 768px tablet) — confirm no overflow/truncation.
6. **Copy proofread** across the app (typos, truncation, tone consistency).
7. **Confirm product analytics** is installed and capturing the onboarding funnel.

### Polish (nice-to-have)
8. Fix the "personalizing" spinner so loaded content doesn't look loading.
9. Give the Library a "where am I" cue in the bottom nav.
10. One-time coachmarks for the map's tappable group labels.

---

**Bottom line:** Mapped is **functionally and visually launch-grade** — the flows work, security/privacy/SEO are handled, navigation is now coherent. The two things that genuinely gate a confident public launch are **image performance** (multi-MB assets) and **untested Safari/iOS** — both fully fixable. Add a short real-user beta and you're in great shape.
