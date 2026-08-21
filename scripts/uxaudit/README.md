# UX audit harness

Drives the app in a real browser across every route at phone and desktop
sizes, capturing what a manual pass would miss.

## What it checks

- JS crashes and console errors per route
- Horizontal overflow (content wider than the screen)
- Elements bleeding outside the viewport
- Tap targets under ~32px
- Images that failed to load
- Pages that render suspiciously little text
- Screenshots of every route at both sizes

## Running it

```bash
# 1. Start the dev server with real Supabase env vars
NEXT_PUBLIC_SUPABASE_URL=... NEXT_PUBLIC_SUPABASE_ANON_KEY=... npm run dev

# 2. Warm the routes so Next's on-demand compile doesn't skew the run
for r in / /home /almanac /journal /tarot /maps /dolly /you /numerology \
         /human-design /palmistry /learn /profile /library /account \
         /onboarding /chart/new /privacy /terms; do
  curl -s -o /dev/null "http://localhost:3000$r"
done

# 3. Audit
node scripts/uxaudit/audit.mjs
```

Results land in `findings.json`; screenshots in `shots/{phone,desktop}/`.

## Reading the output

Two classes of false positive are worth knowing about:

- **Network errors** (`ERR_TUNNEL_CONNECTION_FAILED`, `ERR_CONNECTION_RESET`)
  when running in a sandboxed environment without egress. Not app bugs.
- **The Next.js dev indicator** — a floating badge in the corner of dev-mode
  screenshots that does not exist in production.

The seeded session uses the `mapped:test-auth` shim in `lib/supabase.ts`, which
is stripped from production builds, so signed-in pages render without a real
auth backend. Keep the seeded chart's field names in sync with
`calculateChart` (planets use `position`, not `degree`) or pages will appear to
crash when the harness, not the app, is wrong.
