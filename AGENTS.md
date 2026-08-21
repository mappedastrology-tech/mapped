<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Four platforms, one codebase

Mapped ships to **iOS, Android, mobile web, and desktop web**. Every change is
expected to work on all four. See `PLATFORMS.md` for the architecture and the
current roadmap.

Before finishing any UI or feature work, check it against all four:

1. **Mobile web** — the `(tabs)` layout. The default; assume touch.
2. **Desktop web** — the `src/components/web/Web*.tsx` screens, shown at `lg+`
   via `WEB_PAGES` in `src/app/(tabs)/layout.tsx`. A new tab page usually needs
   a matching `Web*` screen, or it will render the mobile layout on desktop.
3. **iOS / Android** — the same React code inside Capacitor, served from a
   **static export**. This is the constraint that bites, so:
   - Keep pages client components. Server components must stay thin wrappers
     with no server-side data fetching.
   - Every dynamic route needs `generateStaticParams()`.
   - Never add: `cookies()`, `headers()`, Server Actions, middleware/proxy,
     rewrites/redirects/headers in `next.config`, or ISR. They all break the
     static export. (Route handlers under `src/app/api` are fine — they are
     excluded from the app build and called over HTTPS instead.)
   - Anything native (camera, push, filesystem, share) must degrade gracefully
     on web, and use a Capacitor plugin when running in the app.

Assume **no server at runtime in the app build**. The app is a static bundle
that talks to the Netlify-hosted API routes over HTTPS.
