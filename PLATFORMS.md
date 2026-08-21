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

- [ ] Env-switched `next.config.ts` (`APP_BUILD=1` → `output: 'export'`, `images.unoptimized`)
- [ ] Build step that excludes `src/app/api` from the app build
- [ ] Point the app at the Netlify API via `NEXT_PUBLIC_API_BASE`
      (relative `fetch("/api/…")` has no origin inside Capacitor)
- [ ] Capacitor project + iOS/Android shells

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
