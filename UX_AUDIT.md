# Mapped — Expert UX / UI Audit

*A heuristic walkthrough of the live app (mapped-olive.vercel.app), reviewed as a product/UX expert. Screens covered: Onboarding, Home, Chart (You), Dolly, Maps, Almanac, Practice, the Learn/Library section, both navigation systems, and light/dark theming.*

---

## Executive summary

Mapped is, visually and tonally, in the top tier of astrology apps. The craft is real: a coherent, literate, "calm-witchy" aesthetic; an honest, agency-first voice ("a lens, not a prediction," "No rush"); and unusual breadth — daily readings, a full natal chart, an AI guide, a relationship constellation, a sky almanac, ritual practice, and a deep learning library, all in one world.

The biggest risks are **not** craft — they're **information architecture and consistency**. There are two parallel navigation systems with **colliding names**, the app's sheer breadth can overwhelm, and theming is only half-implemented on the immersive screens. None of these are fatal; all are fixable. Below, findings are prioritized P0 (broken) → P3 (polish).

**The one-line verdict:** beautiful, trustworthy, content-rich — held back mainly by a confusing nav taxonomy and an "everything at once" density that needs hierarchy.

---

## What's working (protect these)

- **Honest, anti-manipulation voice.** "Dolly uses astrology as a lens, not a prediction. You always have agency," "a rest day is on us," "No rush." This is the trust moat and the thing competitors can't copy.
- **Coherence across surfaces.** Seven feature areas speak one visual + editorial language. Rare.
- **Standout differentiators.** The **Maps constellation** and the **chart reveal** are screenshot-and-share moments.
- **Thoughtful edge cases.** "Don't know your birth time" handled gracefully; warm empty states; streak forgiveness.

---

## P0 — Broken / blocking

*(None found that hard-block a core task on the live build. The items below are the highest-severity UX problems, not crashes.)*

---

## P1 — High (significant confusion or friction)

### 1. Two navigation systems with colliding names
There's a **bottom tab bar** *and* a **hamburger drawer**, and the same words point to different places:

| Word the user sees | Where it lives | Where it goes |
|---|---|---|
| **"Learn"** | Hamburger | `/library` (courses) |
| **"Practice"** | Bottom tab | `/learn` (rituals/tarot) |
| **"My Practice"** | Hamburger | `/practice` (streaks/stats) |
| **"Library"** | Hamburger | `/library/reference` (lookup) |

A user literally cannot predict where "Practice" or "Learn" goes — each has two meanings, and `/learn` (a route) is *not* the "Learn" menu item. This is the single most important thing to fix.
**Fix:** pick one home for each concept and rename so no word is overloaded. Suggested: bottom tabs = Home · Almanac · Chart · Maps · Dolly (the daily/identity loop); hamburger = Learn, Library, Journal, Rituals, Palmistry, Account. Rename the bottom "Practice"→"Rituals" (and its route), reserve "Practice" for the stats page, and never use "Learn" for two things.

### 2. Core surfaces are buried in the hamburger
The **Library** (now ~730 reference entries + 13 deep courses — a huge part of the product) and **Journal** are reachable *only* from the hamburger. Hamburgers are the lowest-discoverability pattern in mobile UI; many users never open them. A first-timer may never discover the learning library exists.
**Fix:** surface Library/Learn somewhere persistent — e.g., a bottom-tab slot, a Home entry point (the new "Start with these" card helps but is dismissible), or a prominent Home module.

### 3. Home is dense — too many "primary" actions
The Home screen stacks: moon hero → greeting → "Start with these" → today's reading → Lean in/Avoid → gold **"Begin today's check-in"** → "Go deeper" → daily quote → Today's Pulls (tarot/oracle) → widgets. There are multiple gold/primary buttons competing for "the one thing to do now."
**Fix:** establish a single clear primary action per visit and demote the rest to secondary styling. Consider progressive disclosure (collapse Pulls/widgets below the fold with a peek).

### 4. Light mode is only half-implemented on immersive screens
The Library themes fully, but **Home, Chart, Maps, and Dolly are dark-first with hardcoded colors** (plum cards, cream text, forest-green nav). In light mode the top bar turns cream while the hero/cards stay dark — a muddy in-between state rather than a true light theme.
**Fix:** decide deliberately. Either (a) make those immersive screens **dark-only** (hide the theme toggle there, or treat the night sky as intentional), or (b) fully theme them. The current half-state reads as a bug.

---

## P2 — Medium (consistency & polish)

### 5. Two type systems
The Library uses Bodoni Moda + DM Sans (from the design handoff); the rest of the app uses a different display/script pairing. It creates a subtle seam between the "Library world" and the "app world." Decide whether that's an intentional sub-brand or should be unified.

### 6. "Dolly" has no in-context explanation
The bottom tab is just a glyph + "Dolly." A new user doesn't know Dolly is the AI guide until they tap. A one-word descriptor ("Dolly · guide") or first-visit tooltip would help.

### 7. Low-contrast micro-labels
Several 9–10px uppercase labels and 0.45–0.6-opacity subtitles (e.g., "moon in capricorn," section eyebrows) sit near the lower bound of legibility on the dark/starfield background, especially for older eyes or in sunlight. Nudge opacity/size up where it's purely decorative-but-informational.

### 8. Loading affordance can read as "stuck"
Home shows the reading instantly (smart fallback) then upgrades in the background — but the "Personalizing your reading…" spinner persists during the upgrade, which can look like the content hasn't loaded yet even though it has. Consider a subtler "✨ refining…" chip or removing the spinner once readable text is present.

### 9. Orphaned active-state on the bottom nav within Library
Now that the bottom nav appears on Library screens (good), none of the bottom tabs map to Library, so **nothing is highlighted** there — the user loses their "where am I" cue at the bottom. Minor, but consider mapping a tab (or a subtle "Library" indicator) when inside `/library`.

### 10. Stale internal labels
The BottomNav code/comments reference "5 tabs / Today, Almanac, Practice, Chart, Places," but the live bar shows 6 (Home, Almanac, Chart, Practice, Maps, Dolly). Harmless to users, but a sign the nav taxonomy has drifted — reconcile alongside fix #1.

---

## P3 — Low (nice-to-have)

- **Affordance discovery on Maps.** The constellation relies on "tap a star / tap the label" discovery. The "Drag to roam · pinch to zoom · tap a star" hint helps; consider a one-time coachmark for the tappable group labels (the Origin Family "traits & curses" entry was genuinely hard to find before this pass).
- **Desktop layout.** It's a centered mobile column with large empty margins on desktop. Fine for a mobile-first product; just confirm that's the intended target.
- **Reduced-motion.** The Library respects `prefers-reduced-motion`; verify the rest of the app (moon drift, card flips, slide-ins) does too.
- **Accessibility of the spatial map.** The constellation is visual-only; screen-reader users get button labels but not the spatial relationships. A list-view fallback of "people in your orbit" would make it inclusive.

---

## Top 10 fixes, prioritized

1. **Resolve the nav-name collisions** (Learn / Practice each mean two things). — P1, highest leverage.
2. **Surface Library/Learn out of the hamburger** into a persistent entry point. — P1.
3. **Give Home a single clear primary action**; demote the rest. — P1.
4. **Commit light mode**: fully theme the immersive screens or make them deliberately dark-only. — P1.
5. **Label Dolly** as the AI guide in-nav. — P2.
6. **Raise contrast/size** on decorative-but-informational micro-labels. — P2.
7. **Fix the "personalizing" spinner** so loaded content doesn't look loading. — P2.
8. **Give Library a "where am I" cue** in the bottom nav. — P2.
9. **Decide on the two type systems** (sub-brand vs unify). — P2.
10. **One-time coachmarks** for the map's tappable group labels. — P3.

---

## Heuristic scorecard (Nielsen, 1–5)

| Heuristic | Score | Note |
|---|---|---|
| Visibility of system status | 4 | Strong; minus the "stuck-looking" spinner |
| Match to real world | 5 | Speaks the user's language, honestly |
| User control & freedom | 5 | Dismissible cards, agency-first voice |
| **Consistency & standards** | **2.5** | Nav-name collisions; half-themed light mode; two type systems |
| Error prevention | 4 | Good form handling (birth-time, validation) |
| Recognition vs recall | 3.5 | Two navs raise recall cost |
| Flexibility & efficiency | 4 | Test-out, lookup, shortcuts |
| Aesthetic & minimalist | 3.5 | Gorgeous but Home is dense |
| Help users recover from errors | 4 | Warm, clear messaging |
| Help & documentation | 3.5 | New "Start here"; could surface more |

**Composite: strong product, with consistency/IA the clear weak axis.**
