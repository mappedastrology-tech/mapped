# Mapped — Copy Audit (App + Site)

**Date:** July 2026 · **Method:** four parallel auditors, each auditing a slice of the live
codebase against `Mapped_Positioning_Messaging_Strategy.md` (§10 rubric) and
`Mapped_Content_SEO_Strategy.md`.
**Scope:** landing + SEO/meta · onboarding + auth · core surfaces (Home, You/Chart, Maps,
Dolly, Almanac) · practice/learn + nav + paywall + notifications.

Rubric legend: **1** traceable to a pillar · **2** lens not prediction · **3**
adjustable-aware · **4** specific not vague · **5** voice-clean (banned language) · **6** warm
& agency-first · **7** vocabulary/nav-correct. Verdicts: 🟢 ships · 🟡 right idea, wrong words ·
🔴 off-strategy.

---

## Executive summary

The app's craft is real and much of the copy is genuinely on-brand — the ritual honesty note,
the paywall, the Dolly *system prompt*, the privacy/sources language, and the Journal "burn"
mode are all model examples of the voice. But the audit surfaced **five systemic gaps**, in
priority order:

1. **🔴 Push notifications are written in the exact voice we position against.** The
   notification library reads like Co-Star — doom ("Full moon… the reckoning kind"), snark
   ("decide what you actually want, for once"), prediction/warning ("communication gets weird
   for 3 weeks"), and streak-pressure ("don't let today be the gap"). The *plumbing* is
   ethical (rate-limited, quiet hours, opt-out defaults); the *words* betray Pillar 4. **This
   is the single biggest fix.**

2. **🔴 The signature differentiator — the tone dial — isn't in the product.** The
   Grounded/Balanced/Mystical tone step (positioning §8.5, the "hero moment") appears nowhere
   in onboarding, and the Just Me→Witchy tier is never named as a concept. First-run collects
   birth data then drops the user straight into deep Hellenistic material ("Your Moon is in
   charge," sect, lord of the year) in one fixed mystical register — the exact assumed-belief
   failure the strategy exists to fix, aimed right at our top-of-funnel skeptic.

3. **🔴 Fatalistic interpretive copy.** The natal-chart dictionaries (You/Chart) are written as
   verdicts ("You're meant to…", "will always feel suffocating," "You age in reverse"), and
   Maps labels family patterns as **"curses."** Both violate "a lens, not a prediction." The
   "This is a lens, not a verdict. Take what's useful" intro line is missing from the chart
   surface entirely.

4. **🔴 Nav word collisions remain** (the UX_AUDIT P1 problem, half-fixed). "Ritual" routes
   through `/learn`; the course library brands itself "The Mapped Library" while the label
   "Learn" points to it; "Library" names two destinations. "Your Map" titles both the
   connections view and astrocartography.

5. **🟡 The landing page and meta don't carry the positioning.** The hero H1 ("The whole sky,
   made personal") traces to no pillar; the two wedge pillars (the dials; "a lens, not a
   prediction") appear nowhere on the page; the crawlable meta description is the old thin
   version, missing 6+ head keywords and every differentiator term. No SEO "money pages" exist.

**What to protect:** Dolly's system prompt (strong anti-prediction guardrails), the ritual
safety note, the paywall, the "About Our Sources" block, birth-time reassurances, and the
notification *send logic*. These are the voice done right — use them as the reference.

---

## Priority fix list

### P0 — Trust-critical (do first)

- **Rewrite the notification copy library** — `src/lib/notifications.ts:289–346` and the cron
  transit flavor lines `src/app/api/cron/notifications/route.ts:89–94`. Remove all doom, snark,
  prediction, and streak-pressure. Every notification is a *note, not a warning* (§8.11). Keep
  the two already-good re-engagement lines (`:345–346`).
- **Kill "curses"** in Maps family analysis — `src/app/(tabs)/maps/NightSky.tsx:267`,
  `src/app/(tabs)/maps/page.tsx:7460–7462` → "family patterns."
- **De-fatalize the natal interpretation dictionaries + add the lens frame** —
  `src/app/(tabs)/you/page.tsx` (MC/Rising/Chiron/Node/Lilith blocks, e.g. lines 102, 156).
  Soften deterministic openers; add "This is a lens, not a verdict. Take what's useful." at the
  top of the placements section.

### P1 — Signature-strategy gaps

- **Add the tone dial to onboarding as the hero moment** (§8.5): "How should Mapped talk to
  you? — Grounded / Balanced / Mystical," helper "You can change this anytime." Place it
  *before* the sect/big-three reveal so the deep content renders in the chosen register.
- **Name the tier concept** (Just Me→Witchy) where ritual tooling is set — currently only an
  unnamed inventory checklist in account settings (`account/page.tsx:292`). Use the §8.14
  labels + one-liners.
- **Finish the nav de-collision** (§7): label "Ritual"→"Rituals" and move off `/learn`; brand
  the course library page "Learn" (not "The Mapped Library"); reserve "Library" for
  `/library/reference`; rename the astrocartography view "Your places" (already used as a label)
  so "Your Map" means one thing.
  - Files: `src/components/TopBar.tsx:52–53`, `SideNav.tsx:29`, `src/app/library/page.tsx:7`,
    `src/components/learn/LibraryHome.tsx:143`, `src/app/(tabs)/learn/RitualPageContent.tsx`,
    `src/app/(tabs)/maps/page.tsx:6374`.

### P2 — Landing, SEO, and voice polish

- **Reset the landing hero** — `src/components/web/WebLanding.tsx:134–138`: H1 → "Your chart
  called. It has notes."; subhead → the §8.4 line. Add one section each for Pillar 1 (the
  dials — "skeptic or witch, both welcome") and Pillar 4 ("we'll never tell you what's going to
  happen").
- **Fix the meta description** — `src/app/layout.tsx:17–18` (and OG/Twitter mirrors): paste the
  §8.2 description verbatim to recover `natal chart, transits, tarot, rituals, moon, horoscope,
  zodiac` + the "dial from skeptical to mystical" and "a lens, not a prediction" hooks.
- **Build the SEO money pages** — none exist yet; the landing is client-rendered and the
  sitemap exposes only `/`, `/privacy`, `/terms`. Start with the free **birth chart
  calculator** (SEO doc §5).
- **Voice sweep:** remove exclamation-point hype ("Looks like you already have an account!",
  "Password updated!", "Code redeemed!"); replace generic "Something went wrong." fallbacks with
  the §8.10 blameless default ("That didn't go through. Not your fault — try again in a
  moment."); stop leaking raw/dev error text to users (`dolly/page.tsx:421`,
  `api/dolly/route.ts:340`).
- **Dolly polish (additive — core is 🟢):** add the scripted refusal line (§8.7) for when users
  ask Dolly to predict; add the persona intro; change "your cosmic guide" → "your guide"
  (`dolly/page.tsx:802`); trim "she knows it all" (`:834`).

---

## Findings by surface

### 1. Landing + SEO/meta
Meta **title** is correct (§8.2). Biggest miss: **meta description is the old thin version** —
one drop-in fix (§8.2) recovers 6+ head keywords and both brand hooks. Hero H1 "The whole sky,
made personal" is 🔴 (no pillar); the tone/tier dials and "a lens, not a prediction" appear
**nowhere** on the page — "the page could belong to any astrology app." Two nav references leak
onto the landing: a Library card tagged "Learn/Start learning" and "Open your Today page →"
(should be **Home**). Social-proof claims ("40,000+ daily readers," "Featured in Sky &
Telescope," "Apple Design nominee," testimonials) need verification before ship. Structural SEO:
no money pages, client-rendered body, sitemap exposes 3 URLs.

### 2. Onboarding + auth
Warm and strong on Pillar 3 (depth) and Pillar 4 (trust): the privacy line, birth-time
reassurance ("more than you'd think"), tropical/Vedic guidance, and "About Our Sources" block
are all 🟢 and on-voice. **Headline gap: the tone dial step is absent** — the product leads with
"Your birth data" (clinical) then sect/chart-ruler/lord-of-the-year jargon in a fixed register,
before asking the user what language they trust. Fixes: add the tone step; de-jargon/tone-gate
the reveals; drop exclamation points; upgrade the three generic "Something went wrong."
fallbacks; align "Ritual"→"Rituals" in the tour grid (`onboarding/page.tsx:1385–1391`).

### 3. Core surfaces (Home, You/Chart, Maps, Dolly, Almanac)
**Almanac is exemplary** ("The Sky Right Now," "Good for today / Hold off on" — calm, non-doom).
**Dolly's system prompt is the strongest trust surface in the app** (see check below).
**You/Chart** is the problem area: hardcoded interpretations written as verdicts + missing lens
intro. **Maps**: "curses" language (P0) and a "Your Map" title collision; missing zero-state
("No connections yet. Add someone's chart…"). **Home**: greeting drops the "here's your read"
promise; "Horoscope unavailable right now." should use the §8.10 pattern; no calm quiet-day
state.

**Dolly voice check — 🟢 core is solid.** `api/dolly/route.ts:172–213` explicitly enforces
"You're not a fortune teller… a mirror," "the chart shows patterns, not destiny. They always
have agency," "Never predict specific events," "Never be fatalistic," plus a strong crisis→988
block. The user-facing microline matches §8.13 verbatim. Additive gaps only: no scripted
user-visible refusal line, no persona intro, "cosmic guide" pre-empts the tone dial, "she knows
it all" overpromises, and the `notes` endpoint lacks the same guardrails.

### 4. Practice/Learn, Tarot, Numerology, Human Design, Palmistry, Journal, Nav, Paywall, Notifications
**Notifications are the worst offender (P0).** Full offender list quoted in the appendix. The
send *mechanics* are ethical (max 1/4h, 4/7d; quiet hours 10pm–7am; re-engagement capped at 3;
marketing/daily-content default OFF) — only the strings need rewriting. **Nav collisions remain**
(Ritual→`/learn`; "Learn" label → page branded "The Mapped Library"; "Library" ×2). Ritual page
opens with a mystical honorific ("Seeker ☾") that assumes register (🔴, §3/§5). Bottom tabs are
clean. **Paywall, Tarot, Numerology, Human Design, Journal are on-voice** — the ritual safety
note and Journal burn-mode are model §8.13 lines to protect.

---

## Appendix — worst notification strings (all P0, `src/lib/notifications.ts`)

| Line | Current | Problem | Rewrite |
|---|---|---|---|
| :289 | "Today: more reading smut, less working overtime." | snark/vague | "Today's read: a good day to protect your own time. Two minutes inside." |
| :290 | "You are not behind. You are exactly on time, which is to say, late." | snark | "No cosmic homework today. A good day to catch your breath." |
| :292 | "Pop the champagne. Cancel the situationship." | prediction/snark | "Venus is doing something worth noticing today. Here's what's going on." |
| :297 | "Full moon in [sign] tonight. The reckoning kind." | doom | "Full Moon in [sign] tonight. A good night to put something down. Two-minute ritual inside." |
| :302 | "New moon in [sign]. Decide what you actually want — for once." | condescending | "New moon in [sign]. A clean page, if you want one." |
| :311 | "Mercury just turned retrograde… Communication gets weird for 3 weeks." | prediction/warning | "Mercury turns retrograde in your [house] house today. Three weeks to review, not restart." |
| :339–341 | "Your streak is still lit…" / "keeps your streak alive" / "don't let today be the gap" | streak pressure | "Still here whenever you are. A two-minute lesson's waiting — no pressure. A rest day is on us." |
| :344 | "Mercury is doing something interesting today." | vague | "Mercury changes signs today. Want to see what it touches in your chart?" |

Keep as-is (🟢): `:345` "Your chart didn't go anywhere. Whenever you're ready." and `:346` "We
won't keep checking in. You can come back anytime — your data is here."

---

## Suggested next step
The fastest high-trust win is the P0 notification rewrite (one file, self-contained) plus the
"curses"→"family patterns" swap. The highest-*strategy* win is adding the tone dial to
onboarding. I can implement any of these as edits on request — say which section and I'll make
the changes against the code.

*Sources: audits of the live `mapped` codebase against the positioning and SEO strategy docs in
`docs/`.*
