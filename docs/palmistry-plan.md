# Palmistry Feature — Implementation Plan

**App:** Mapped (Next.js 16, App Router, Supabase, Anthropic/Claude, Stripe)
**Decisions locked in:** Lives in hamburger menu · Free for everyone · Structured + detailed reading · Reading text saved to Supabase, **photo never stored** (recommended; confirm or override)

---

## 1. What "accurate" means here (and the honesty framing)

Palmistry is a traditional divination practice, not a predictive science — no system reads the future from a palm. So "accurate" is delivered in the two ways that are actually real and that will make the feature feel legit:

1. **Accurate observation.** Claude vision (`claude-sonnet-4-6`, which has vision) genuinely looks at the photo and identifies what is physically present: the major lines (heart, head, life, fate), the mounts (Venus, Jupiter, Saturn, etc.), hand shape, and finger proportions. The reading references what's actually in *your* hand, not generic filler.
2. **Accurate to tradition.** The interpretation follows established palmistry conventions (e.g. a long, curved heart line = emotionally expressive; a deep unbroken life line = vitality), so it reads like a real palmist rather than random text.

A short, tasteful "for entertainment & reflection" line appears with each reading — consistent with how divination apps handle this and with your existing tarot/oracle sections.

---

## 2. Where it lives

- **New route:** `src/app/(tabs)/palmistry/` (joins the existing `(tabs)` group so it inherits the TopBar + BottomNav shell).
- **Hamburger menu:** add a "Palmistry" entry to the `MENU_ITEMS` array in `src/components/TopBar.tsx` (with a hand SVG icon and the subtitle "Read your palm").

---

## 3. Files to create / modify

### New files
| File | Purpose |
|------|---------|
| `src/app/(tabs)/palmistry/page.tsx` | Thin re-export of the client component (mirrors the tarot page pattern). |
| `src/app/(tabs)/palmistry/PalmistryPageContent.tsx` | The client UI: camera capture, preview, "read my palm" trigger, reading display. |
| `src/app/api/palmistry/route.ts` | Edge API route: auth-gated, rate-limited, sends the captured image to Claude vision, returns the structured reading. |
| `src/lib/palmistry.ts` | Shared types + the palmistry prompt/knowledge (line & mount definitions, reading structure). |
| `supabase/migrations/XXXX_palm_readings.sql` | `palm_readings` table (text only, no image column). |

### Modified files
| File | Change |
|------|--------|
| `src/components/TopBar.tsx` | Add "Palmistry" to `MENU_ITEMS`. |

---

## 4. Camera capture flow (client)

`PalmistryPageContent.tsx`:

1. Intro card: short explainer + a "Scan my palm" button.
2. On tap → request camera via `navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })`, stream into a `<video>` element. (Front camera by default so users can see; toggle to rear available.)
3. A hand-shaped guide overlay + the instruction "Hold your dominant hand flat, palm to the camera, fill the frame in good light."
4. "Capture" button → draw the current video frame to a `<canvas>` → export as a compressed JPEG data URL (downscaled to ~1024px to keep payload small).
5. Stop the camera stream immediately after capture (release the device).
6. Show the captured photo for confirm / retake.
7. On confirm → POST the image to `/api/palmistry`, show a themed loading state ("Reading your lines…"), then render the reading.

**Permissions / fallbacks:** if camera is denied or unavailable (desktop, blocked), fall back to a file picker (`<input type="file" accept="image/*" capture="environment">`) so the feature still works. Handle the denied-permission case with a friendly message.

---

## 5. API route (`/api/palmistry`)

Mirrors your existing AI routes (`journal/reflect`, `dolly`):

- `export const runtime = "edge"`.
- `getAuthedUserId(req)` → 401 if not signed in.
- `checkRateLimitDurable("palmistry:{uid}", 10, 60*60*1000)` → 429 if exceeded (these are paid vision calls).
- Accept `{ image: <base64 JPEG>, hand: "left"|"right", userName? }`.
- Validate it's an image and within a size cap; reject otherwise.
- Call `createMessageResilient` with a **multimodal message**: a system prompt that makes Claude act as a traditional palmist, plus a user message containing the image block + instructions.
- **Two-stage prompt for grounded accuracy:** Claude first describes what it actually observes (lines present/absent, length, depth, curvature, mounts, hand shape), then interprets each per traditional palmistry. Output returned as structured JSON sections.
- If Claude reports the image isn't a readable palm (no hand, too dark, blurry), return a friendly "couldn't read that — try again in better light" response instead of inventing a reading.
- Return structured JSON; **discard the image** (never written to DB or logs).

### Reading structure (the "structured + detailed" deliverable)
1. **Hand shape & overall impression** (earth/air/fire/water hand typing).
2. **Heart line** — love & emotional life.
3. **Head line** — intellect & thinking style.
4. **Life line** — vitality & life energy (note: not lifespan).
5. **Fate line** — career & life direction (if present).
6. **The mounts** — brief notes on the prominent ones.
7. **A closing synthesis** — a few sentences tying it together.

Each section: what was observed → what tradition says it means.

---

## 6. Reading display (client)

- Render the sections as elegant collapsible cards matching the app's existing aesthetic (terracotta/brass theme, same components/styling as tarot & chart insights).
- A share-friendly summary at top.
- Subtle "for reflection & entertainment" note.
- "Read again" button.
- (If saving enabled) auto-saves the text to Supabase; optionally surface in Journal/Practice history later.

---

## 7. Persistence (confirm this)

**Recommended:** `palm_readings` table stores `id, user_id, hand, reading_json, created_at` — **no image column**. The photo lives only in memory during the request.

Alternatives if you prefer:
- **Ephemeral only** — store nothing (drop the table + save call).
- **Save text + photo** — add a Supabase Storage bucket for the image (more privacy surface; would want a clear consent line).

---

## 8. Privacy & safety

- Photo is never persisted or logged; processed in-memory and discarded.
- Camera stream released right after capture.
- Clear in-UI note about what happens to the photo.
- Entertainment/reflection disclaimer on every reading.
- Reuses existing auth + rate limiting so it can't be abused for free vision calls.

---

## 9. Verification (before calling it done)

- `npm run check` (lint + typecheck) passes.
- Manual flow: menu → page → camera permission → capture → reading renders; retake works; file-upload fallback works; denied-permission message works.
- Confirm a non-hand image returns the graceful "couldn't read" path.
- Confirm no image data is written to Supabase or server logs.

---

## 10. Open items for your sign-off

1. **Persistence** — go with "save text, never photo" (recommended), or pick ephemeral / save-photo?
2. **Icon** — fine with a simple hand/palm SVG line icon to match the others?
3. Anything you want explicitly *excluded* from readings (e.g. nothing about health/lifespan)? Default already avoids medical/lifespan claims.
