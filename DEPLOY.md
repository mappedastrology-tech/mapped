# Deploying Mapped

## Today: Vercel (current setup)

Live site: https://mapped-olive.vercel.app

```bash
cd ~/Documents/mapped
npm run deploy
```

`npm run deploy` automatically runs the safety gate first (`npm run check` = ESLint + TypeScript). If either fails, the deploy is blocked — fix the errors, then deploy again. **Don't use `npx vercel --prod --force` directly; it skips the gate.**

Useful commands:

```bash
npm run check      # run the gate without deploying
npm run lint       # ESLint only (react-hooks rules catch crash bugs)
npm run typecheck  # TypeScript only
```

### Environment variables (set in Vercel dashboard → Project → Settings → Environment Variables)

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (sensitive)
- `ANTHROPIC_API_KEY` (sensitive)

### Cron

`vercel.json` schedules `/api/cron/notifications` daily at 14:00 UTC. This is Vercel-specific — see the Netlify section for its replacement.

---

## Migrating to Netlify

### Reality check on Next.js support

The Next.js 16 docs (`node_modules/next/dist/docs/01-app/01-getting-started/17-deploying.md`)
list only **Vercel and Bun** as *verified* adapters. Cloudflare and Netlify are
under "Other Platforms" — they ship their own Next.js integrations that are
"not built on the public Adapter API and are not verified by the Next.js team,
so feature support and compatibility may vary."

In practice this app is a good candidate anyway: no middleware, no ISR /
`revalidate`, no `use cache`. All 28 API routes run on the Node runtime. But
smoke-test after the first deploy rather than assuming zero-config.

The same docs also state the baseline plainly: *"To run Next.js, your platform
needs a Node.js server. That's it."* If Netlify's adapter ever fights us, any
host that runs `next start` (Render, Railway, Fly, a VPS) is a safe fallback
with full feature fidelity.

### What's already in the repo

| File | Purpose |
|---|---|
| `netlify.toml` | Build config + long-cache headers for the ~56MB of card/moon/texture art, and a no-cache header for `/sw.js` |
| `netlify/functions/notifications-cron.mts` | Scheduled Function replacing the Vercel cron (daily 14:00 UTC) |
| `sharp` in dependencies | Required for self-hosted Image Optimization |

`vercel.json` is left in place so the Vercel deploy keeps working until DNS is
cut over. Netlify ignores it.

### Step 1: Connect the repo

1. Log in at https://app.netlify.com
2. **Add new site → Import an existing project** → GitHub → `mappedastrology-tech/mapped`
3. Netlify auto-detects Next.js and reads `netlify.toml`. Leave the defaults.

### Step 2: Environment variables

Site configuration → Environment variables. Mark everything except the
`NEXT_PUBLIC_*` pair as secret.

**Required:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ANTHROPIC_API_KEY`

**Push notifications** (see the Push notifications section):
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`
- `VAPID_SUBJECT`
- `CRON_SECRET` — the scheduled function sends this as a bearer token, and
  `/api/cron/notifications` fails closed without it

**Cost control (do this before any real traffic):**
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

Without Redis, `checkRateLimitDurable` falls back to in-memory counting. On
serverless each instance keeps its own counter, so a burst spread across
instances walks straight through the limit — and every one of those requests
is a paid Anthropic call. This is the single largest surprise-bill vector in
the app, well ahead of hosting.

### Step 3: Put Cloudflare in front

`public/` is ~56MB (18MB oracle, 15MB images, 11MB backgrounds, 6.8MB tarot).
Bandwidth, not compute, is what scales with users.

Point the domain's DNS at Cloudflare (free plan) with proxying enabled. Static
art is then served from their edge on unmetered bandwidth, and the origin
barely sees repeat traffic. Combined with the cache headers in `netlify.toml`,
this is the main defence against a bandwidth-driven bill.

### Step 4: Verify

1. `https://<site>/api/notifications` → `{"configured": true}` once VAPID keys are set
2. Trigger the scheduled function once from Netlify's UI (Functions → notifications-cron)
   and check the log line for a `200`
3. Hard-refresh the app and confirm the service worker re-registers (DevTools → Application → Service Workers)

### Step 5: Cut over and decommission

Only after the Netlify site is verified: move DNS, watch for a day, then
delete the Vercel project so it can't bill.

---

## Push notifications

The full pipeline (opt-in UI, `public/sw.js`, `push_subscriptions` table with
RLS, `/api/cron/notifications` sender) is built. It needs keys.

Generate a VAPID pair:

```bash
npx web-push generate-vapid-keys
```

Set `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`,
`VAPID_SUBJECT` (`mailto:…`) and a random `CRON_SECRET`, then **redeploy** —
the public key is inlined at build time, so a redeploy is required.

Check `/api/notifications` reports `"configured": true`, then re-enable
notifications in the app so a keyed subscription replaces the old keyless one.

**iOS:** web push only works when the site is added to the Home Screen and
opened from that icon — never from a Safari tab.

**App Store builds:** this repo has no native wrapper (no Capacitor/Expo). A
plain Next.js app cannot ship to the App Store as-is, and web push does not
work inside a native wrapper — that requires APNs through the native layer.
Web push serves the web/PWA audience only.

## Supabase notes

- Free-tier NANO instance can return 503s under load. If the site loads but data doesn't: Supabase dashboard → Settings → General → **Restart project**, or wait 10–15 min.
- Before launch with real users, upgrade to Supabase Pro ($25/mo) — free-tier outages and the 2-emails/hour auth limit will hurt real users.
- An hourly uptime monitor (Claude scheduled task) checks both the site and the Supabase API and emails contacttaylorsometimes@gmail.com if either is down.

## API cost guard

Anthropic console → Settings → Billing → Usage limits: set a monthly cap.
