# App Store pre-flight audit

Written 14 October 2026, against commit `259d601`. No code was changed to
produce this.

This is Phase 1 of the launch plan. Read the corrections first — the plan was
written against some assumptions this codebase has since moved past, and three
of its tasks are already done.

---

## Corrections to the launch plan

**Production is Netlify, not Vercel.** The live site is
`mapped-astrology.netlify.app` (Netlify project `mapped-astrology`, team
`6a888e7f…`). `NEXT_PUBLIC_SITE_URL` is set to that address. Netlify builds
automatically from `main` on every push. `vercel.json` is still in the repo but
only carries a cron definition that Netlify ignores — `netlify.toml` recreates
it as a Scheduled Function.

This matters for Phase 1: the plan says "load the production Vercel app as the
server URL". Doing that would point the iOS app at an abandoned deployment.

**Capacitor is already installed.** `@capacitor/core` 8.5.0, with
`capacitor.config.ts` and an `android/` project in the repo. The app does not
load a remote server URL — it ships as a **static export** built by
`scripts/build-app.mjs`, talking to the Netlify-hosted API routes over HTTPS.
That is a stronger position than the plan assumes, and it is why
`AGENTS.md` forbids `cookies()`, Server Actions, middleware and ISR.

What is missing is the **iOS** half: there is no `ios/` directory.

**Account deletion already exists and is sound** (see below).

**Dolly's crisis layer already exists** (`src/lib/crisis.ts`), runs locally
before every gate, and is covered by tests.

---

## 1. Surface area

| | count |
|---|---|
| Pages (`page.tsx`) | 31 |
| API routes (`route.ts`) | 32 |

Route groups: `(tabs)` for the five main tabs, plus standalone `/account`,
`/onboarding`, `/welcome`, `/library/*`, `/rectification`, `/privacy`,
`/terms`.

## 2. How login works

Three methods, and they are **not offered consistently**:

| surface | email + password | Google | Apple |
|---|---|---|---|
| `AuthModal` (sign-up / sign-in) | yes | **yes** | **no** |
| `/welcome` | yes | **yes** | **no** |
| `/account` (linking) | — | yes | yes |

`handleSocialLogin` accepts `"google" | "apple"` in all three files, but only
`/account` ever renders the Apple button.

> **Guideline 4.8 risk — the clearest rejection in this audit.** At the moment
> a new user creates an account, Google is offered and Sign in with Apple is
> not. The code is already written; the button is simply not rendered on the
> two surfaces that matter. Whether the Apple provider is *enabled in the
> Supabase dashboard* could not be checked from here — that is a dashboard
> setting, and someone needs to look.

## 3. How payments work today

Stripe Checkout and the Billing Portal, called from
`/api/stripe/checkout` and `/api/stripe/portal`.

- `src/lib/openCheckout.ts` already hands the URL to the **system browser** on
  native rather than navigating the WebView — the usual 3.1.1 rejection is
  already avoided. It deliberately does not fall back to an in-app navigation.
- Return URLs go through `returnBaseUrl()`, which refuses `localhost` and
  `capacitor://` origins.
- An existing subscriber is sent to Stripe's plan-change flow rather than being
  sold a second subscription.
- Webhook handles `past_due` as entitled, plus `invoice.paid` /
  `invoice.payment_failed`.

> **Live defect:** `STRIPE_PRICE_ID` and `STRIPE_PRICE_ID_MAX` are configured on
> Netlify. `STRIPE_PRICE_ID_ANNUAL` and `STRIPE_PRICE_ID_MAX_ANNUAL` are **not**.
> The pricing table and plans sheet both offer yearly, and pressing it returns
> a 500. Monthly works.

## 4. Where user data lives

25 user-scoped tables in Supabase `public`. Everything a person creates —
charts, journal entries, Dolly conversations and memory, connections, tarot and
palm readings, course progress, ritual completions, custom rituals,
certificates, quiz attempts, notification log, push subscriptions, promo
redemptions, purchased decks, AI usage — is keyed to `user_id`.

## 5. Account deletion — already compliant

`/api/account/delete` deletes `bug_reports` (and their storage objects),
`journal_entries`, `charts`, `profiles`, then calls
`auth.admin.deleteUser()`.

Verified against the live schema: **24 of the 25 user tables are
`ON DELETE CASCADE` from `auth.users`** (directly, or via `profiles`, which
itself cascades). So deleting the auth user removes everything, including
`dolly_conversations` and `dolly_memory`.

The one exception is `bug_reports`, whose FK is `ON DELETE SET NULL` — which is
exactly why the route deletes those rows and their screenshots explicitly
first. The design is deliberate and correct.

Still to add for Guideline 5.1.1(v): the screen must **tell the user an Apple
subscription has to be cancelled separately in iPhone Settings**. That sentence
does not exist yet.

## 6. Third parties that receive user data

| service | what it receives | where |
|---|---|---|
| **Anthropic** | birth chart, transits, messages, journal text, connections | `/api/dolly`, `/api/dolly/summarize`, `/api/dolly/notes`, `/api/journal/reflect`, `/api/journal/prompt`, `/api/wizard`, horoscope |
| **OpenStreetMap (Nominatim)** | the city string as it is typed | `CitySearch`, maps |
| **Resend** | bug-report email | `/api/bug-report-notify` |
| **Web Push / APNs** | device endpoint | notifications |
| **Supabase** | everything else | — |

> **Guideline 5.1.2(i) gap.** There is **no AI consent screen**. Nothing asks
> permission before the first Dolly message, and nothing records that consent
> with a timestamp. The privacy page describes what is sent, which is necessary
> but not sufficient — Apple wants explicit opt-in before personal data goes to
> a third-party AI. This is a build item, not a copy item.

## 7. What will misbehave inside an iOS WebView

- **`window.open` ×4 in `src/lib/shareCard.ts`** — share/open paths. Needs
  checking inside the shell; some will want the native share sheet instead.
- **Blob downloads ×4** — `ShareCard.tsx`, `exportUserData.ts`,
  `exportChart.ts`, `shareCard.ts` use `createObjectURL` / `download=`. A
  WKWebView does not download files the way a browser does; these need the
  Capacitor Filesystem and Share plugins.
- **OAuth redirect** — `signInWithOAuth` round-trips through a browser. Inside
  the shell this needs the Capacitor Browser plugin and a registered deep-link
  scheme, or it strands the user outside the app.
- Checkout is already handled (see §3).

---

## What is actually left, against the plan's phases

Done already: Capacitor (Android), account deletion, crisis protocol, privacy
policy and terms, offline notice, push infrastructure, safe-area handling on
the chat composer, entertainment disclaimer in Terms.

Open, in the order I would do them:

1. **Sign in with Apple on the sign-up surfaces** (4.8) — smallest fix, clearest
   rejection. Needs the Supabase provider enabled too.
2. **AI consent screen** (5.1.2(i)) — nothing exists.
3. **The two annual Stripe prices** — a live broken purchase path, not an App
   Store item.
4. **`ios/` target, icon, splash, build path** — no Mac in this environment, so
   Codemagic or your own Mac.
5. **Deep links + OAuth inside the shell**, and the download/share paths.
6. **"Cancel your Apple subscription separately" line** on the delete screen.
7. **Widget, haptics, native share** (4.2 defence).
8. **Privacy manifest** (`PrivacyInfo.xcprivacy`) and the App Privacy answers.

## What I could not check from here

- Whether the Apple provider is enabled in the Supabase dashboard.
- Whether an old Vercel deployment is still publicly reachable and serving a
  stale build. Outbound HTTPS to that host is blocked in this environment
  (`403 CONNECT`, policy denial).
- Anything requiring Xcode or an iOS simulator.
