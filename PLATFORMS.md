# Platforms

Mapped targets four surfaces from one codebase.

| Surface | Status | How it is built |
|---|---|---|
| Mobile web | **Live** | Next.js `(tabs)` layout, served from Netlify |
| Desktop web | **Live** | `src/components/web/Web*.tsx`, swapped in at `lg+` |
| iOS app | **Not started** | Capacitor shell around a static export |
| Android app | **Not started** | Same Capacitor project |

## Architecture: one codebase, two builds

```
                    ┌───────────────────────────────┐
  src/  ───────────►│ WEB BUILD  (next build)       │──► Netlify
                    │ SSR pages + 28 API routes     │    mapped-astrology
                    └───────────────────────────────┘         ▲
                    ┌───────────────────────────────┐         │ HTTPS
                    │ APP BUILD  (output: 'export') │─────────┘
                    │ static frontend, no API dir   │──► Capacitor ──► iOS
                    └───────────────────────────────┘              └─► Android
```

The apps ship the **frontend only**. All server work (Anthropic, Stripe,
Supabase service-role, web-push) stays on Netlify and is called over HTTPS.
One API surface for every platform, so the apps cannot drift from the web.

### Why the app build must be a static export

Capacitor bundles files, not a Node server. Next.js static export forbids
route handlers that read `Request`, and all 28 of ours do — so the app build
excludes `src/app/api` and points at the deployed API instead.

Static export also forbids `cookies()`, `headers()`, Server Actions,
middleware/proxy, rewrites/redirects/headers config, and ISR. **None are used
today. Keep it that way** — see `AGENTS.md`.

## Readiness audit (2026-08-21)

Good news: the app is already close.

- 34 client components; the frontend is overwhelmingly client-side ✅
- Only 10 server pages, all thin `params` wrappers with no data fetching ✅
- The 3 dynamic library routes now have `generateStaticParams()` ✅
- No cookies/headers/Server Actions/middleware/ISR anywhere ✅
- Native-shaped features already exist — camera (palmistry, journal photos,
  profile), on-device chart maths, offline content ✅ (matters for Apple 4.2)

Remaining work for the app build:

- [x] Env-switched `next.config.ts` (`APP_BUILD=1` → `output: 'export'`, `images.unoptimized`)
- [x] Build step excluding server-only routes (`scripts/build-app.mjs`)
- [x] `NEXT_PUBLIC_API_BASE` rewrite (`src/lib/apiBase.ts`)
- [x] Capacitor config + dependencies
- [ ] `npx cap add ios` / `npx cap add android` — needs macOS + Xcode /
      Android Studio, so it runs on your machine, not in CI
- [ ] APNs + FCM push
- [ ] Icons, splash screens, store listings

**Phase 1 is proven end to end:** `npm run build:app` produces 215 static
pages in `.next-app/`, and the web build still emits all 28 API routes.

### Building the apps

```bash
# 1. Static export against the deployed API
NEXT_PUBLIC_API_BASE=https://mapped-astrology.netlify.app npm run build:app

# 2. One-time, on a Mac with Xcode / Android Studio installed
npx cap add ios
npx cap add android

# 3. Copy the bundle into the native shells, then open them
npm run cap:sync
npm run cap:ios       # or: npm run cap:android
```

`build-app.mjs` moves `src/app/api` and `src/app/auth/callback` aside for the
duration of the build and restores them afterwards, including on crash or
Ctrl-C. If a run is ever killed hard, the next run recovers them automatically
from `.app-build-parked/`.

## Push notifications differ per platform

| Platform | Mechanism | Status |
|---|---|---|
| Mobile/desktop web, PWA | Web Push + VAPID | Built; keys set on Netlify |
| iOS app | **APNs** via Capacitor | Not started — needs Apple Developer account |
| Android app | **FCM** via Capacitor | Not started — needs Firebase project |

Web push does **not** work inside a native wrapper. The existing
`push_subscriptions` table and `/api/cron/notifications` sender can be reused;
the token registration and send path differ per platform.

## Roadmap — apps first, web polish after

Launching in November means **submitting by mid-October**. Apple review runs
days to weeks and first submissions are often rejected, so the buffer is the
plan, not padding.

**Phase 1 — App build foundation** (now → mid Sept)
Static export path proven end to end; Capacitor project; app runs on a
simulator against the live Netlify API. Open the Apple Developer ($99/yr) and
Google Play ($25 one-off) accounts now — enrolment can take days.

**Phase 2 — Native integration** (mid Sept → mid Oct)
APNs + FCM push; camera through the Capacitor plugin; deep links; app icons,
splash screens, store screenshots.

**Phase 3 — Review hardening** (mid Oct)
Guideline 4.2 is the real risk: Apple rejects thin website wrappers. Lean on
the genuinely native surfaces (camera palmistry, offline library, local
notifications, on-device chart calculation). Privacy manifest, data-collection
disclosures, account deletion (already at `/api/account/delete`). TestFlight
and Play internal testing.

**Phase 4 — Submit and launch** (mid Oct submit → Nov launch)

**Phase 5 — Web polish** (post-launch)
Desktop and mobile web to launch quality. Both already ship, so this is
refinement rather than construction.

## Costs to expect

| Item | Cost |
|---|---|
| Apple Developer Program | $99/year |
| Google Play Console | $25 one-time |
| Netlify | Free tier; Cloudflare in front for the ~56MB of art |
| Upstash Redis | Free tier — **required** before traffic, see `DEPLOY.md` |

## Running the apps locally

The native projects (`ios/`, `android/`) are committed, but the ~82MB web
bundle they serve is **not** — it is build output. A fresh clone therefore has
an empty `ios/App/App/public/`, and Xcode will run to a white screen until the
bundle is in place.

Three ways to get it there, in order of preference.

### A. Build it locally (needs Node)

```bash
NEXT_PUBLIC_API_BASE=https://mapped-astrology.netlify.app npm run build:app
npx cap sync
```

### B. Download it from CI (no Node needed)

GitHub → **Actions → "Build app bundle" → Run workflow**. When it finishes,
download the `app-bundle` artifact and unzip its contents into
`ios/App/App/public/`.

### C. Dev mode — point the app at the live site (fastest, temporary)

Lets the shell run with no bundle at all. Edit
`ios/App/App/capacitor.config.json` and add a `url` inside `server`:

```json
"server": {
  "androidScheme": "https",
  "iosScheme": "https",
  "url": "https://mapped-astrology.netlify.app",
  "cleartext": false
}
```

> **Remove this before submitting.** An app that only loads a remote URL has no
> offline behaviour and is exactly the "thin wrapper" Apple rejects under
> Guideline 4.2. Dev convenience only.

## Opening the project in Xcode

1. Clone the repo (GitHub Desktop is fine — no terminal needed).
2. Get the bundle in place via A, B, or C above.
3. Open **`ios/App/App.xcodeproj`**.
   (After a `pod install` there will also be an `App.xcworkspace` — once it
   exists, always open the **workspace**, not the project.)
4. Select the **App** target → **Signing & Capabilities** → tick *Automatically
   manage signing* → choose your team. The bundle identifier is
   `com.mappedastrology.app`.
5. Pick a simulator (e.g. iPhone 15) from the device dropdown.
6. Press **⌘R**.

A physical device additionally needs the phone plugged in, trusted, and
Developer Mode enabled (Settings → Privacy & Security → Developer Mode).
