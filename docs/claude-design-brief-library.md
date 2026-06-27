# Claude Design brief — Mapped Learning Library

Paste this into a new Claude Design conversation (claude.ai/design). If you connect the
`mapped` repo during onboarding, it will pull these tokens automatically — but this brief
makes the intent explicit either way. **Goal: a visual refresh of two screens — keep the
structure and information, level up the look.**

---

## What Mapped is

A mobile astrology + esoterica app (launching November). The Learning Library is a
Duolingo-style learning section: courses with lessons and quizzes, a quick-reference
lookup, spaced-repetition review, and light gamification (XP, levels, streaks, daily
goals, achievements — deliberately **no social leaderboard**). The mood is **mystical,
warm, editorial, premium** — like a beautifully-printed occult almanac, not a neon game.

**Form factor:** mobile-first. Design at **~390px wide** (content max-width ~512px,
single column). Everything below is a phone screen.

---

## Design system (use these exactly)

Dark, candlelit palette on near-black plum. Gold is the hero accent.

**Core**
- Background: `#0e0a14` (near-black plum) · Card: `#2a1f35` · Elevated: `#1a1420`
- Hero gradient: `linear-gradient(135deg, #1a1420, #0e0a14)`
- Text: `#e8dfc4` (warm cream) · Secondary: `#c4b8a0` · Muted: `#8a7d6b`
- Card border: `rgba(106,58,96,0.5)` · Card shadow: `0 2px 8px rgba(0,0,0,0.4)`

**Accents**
- Brass/gold (primary): `#c9a961`, light `#d4b878`, dark `#a88a40`
- Plum: `#4a2540`, deep `#1f1730`, light `#6a3a60`
- Sage/green (success, "done"): `#5a7a3a` / `#6a8a4a`
- Oxblood (errors): `#5a1f1a` / `#7a3028`
- Lavender: `#B8A0D2`

**Per-topic accent colors** (each topic owns one — use for its tile/hero):
astrology `#c9a961` · tarot `#a274d6` · numerology `#4a90c2` · crystals `#8e7cc3` ·
chakras `#4caf93` · herbalism `#6a9a4a` · essential-oils `#d39a3e` · almanac `#5b6bb5` ·
meditation `#3fa3a3` · dreams `#7b86d6` · runes `#b5654a`

**Type**
- Display (big titles, numbers): JS Chanok / Bodoni Moda / Playfair — high-contrast serif
- Headings & body: Le Jour Serif / Playfair — elegant workhorse serif
- Eyebrow caps / labels: uppercase, wide letter-spacing (~0.2em), small (9–11px), brass
- UI / small text: DM Sans

**Shape language:** generous rounding (cards 16–24px, hero 24px), soft inner glows,
thin gold hairline borders, subtle gradients. Avoid flat/sterile. Avoid neon or cartoonish.

---

## Screen 1 — Library Home (`/library`)

The landing screen. Keep these blocks, in this order; make them feel richer and more
premium. Mock it with real content below.

1. **Progress hero** (top, most important). A plum gradient card containing:
   - A circular **level ring** (gold progress arc, "LEVEL / 7" in the center)
   - "**90 XP to level 8**" + a small **weekly activity bar chart** ("This week")
   - Three **stat chips**: 🔥 12 days · ✓ 34 lessons · ⚡ 1,240 total XP
   - A **daily-goal bar**: "Daily goal — 30/50 XP"
   - A **Continue** row at the bottom: topic icon + "Continue / Tarot Foundations →"
   - *Push on:* make this the centerpiece — the thing that makes you want to come back.
     More depth, better data-viz, a sense of momentum and reward.

2. **Search bar** — "Search courses & topics — e.g. amethyst, tarot…"

3. **Daily review banner** (when reviews are due): 🔁 "Daily review ready — 3 lessons due"

4. **Jump back in** — a short list of in-progress courses.

5. **Browse topics** — a **2-column grid of 11 topic tiles** (the real list below). Each
   tile: topic accent gradient, an icon chip, the title, and a small evidence tag.
   *Push on:* these tiles should feel collectible and tactile — like cards in a deck.

6. Footer disclaimer line (small, muted): "Evidence-first, with honest safety notes.
   For learning and reflection — not medical, legal, or financial advice."

**The 11 topic tiles (real content):**

| Topic | Icon | Tag | Accent |
|---|---|---|---|
| Astrology | ☉ | Symbolic system | `#c9a961` |
| Tarot | 🔮 | Reflective tool | `#a274d6` |
| Numerology | 9 | Symbolic system | `#4a90c2` |
| Crystals | 💎 | Tradition + geology | `#8e7cc3` |
| Chakras | 🌀 | Contemplative tradition | `#4caf93` |
| Herbalism | 🌿 | Evidence + safety | `#6a9a4a` |
| Essential Oils | 🪔 | Evidence + safety | `#d39a3e` |
| Almanac & Moon | 🌙 | Astronomy + tradition | `#5b6bb5` |
| Meditation | 🧘 | Strong evidence | `#3fa3a3` |
| Dreams | 💤 | Science + symbolism | `#7b86d6` |
| Runes | ᚠ | Reflective tool | `#b5654a` |

---

## Screen 2 — Domain Hub (a topic's page, e.g. `/library/d/astrology`)

Reached by tapping a topic tile. Keep this structure:

1. **Illustrated hero banner** — full-width card in the topic's accent gradient, with the
   topic's icon medallion, title, and a one-line blurb (e.g. Astrology: "Read a birth
   chart as a language for self-reflection."). Include space for a piece of topic
   cover art in the corner. *Push on:* make this hero genuinely beautiful — it sets the
   tone for the whole topic.

2. **Tabs** — "Courses" / "Reference · 46" (a segmented control in the accent color).

3. **Courses list** — stacked cards. Each: course title, subtitle, a meta row
   ("Beginner · 45 min · 8 lessons"), and a small **completion ring** on the right with a
   status word ("start" / "going" / "✓ done").

Example courses for Astrology: "Astrology Foundations" (Beginner), "Astrology
Intermediate", "Astrology Advanced".

---

## Directions to explore

Please generate **3–4 distinct visual directions** for the Library Home, then we'll pick
one and apply it to the Domain Hub. Some angles worth trying:

- **Almanac / grimoire** — printed-page textures, gold foil, illuminated-manuscript framing.
- **Celestial dashboard** — starfields, constellation lines, glowing data-viz for the hero.
- **Tarot deck** — topic tiles as collectible cards with ornate borders.
- **Refined minimal** — same palette, but quieter, more whitespace, very premium/editorial.

Keep all of them: mobile (390px), dark, on-brand with the tokens above, AA-contrast text,
and **no leaderboard / no competitive social mechanics**.

---

## Handoff

Once a direction is chosen, package the Claude Design **handoff bundle** and bring it back
to the Mapped project — the components live in `src/components/learn/` (`LibraryHome.tsx`,
`DomainHub.tsx`) and the tokens in `src/app/globals.css`. I'll implement it against the
real code and verify the build.
