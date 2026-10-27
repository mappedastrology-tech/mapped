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
2. **Desktop web** — the same pages, widened. There is no separate desktop
   build: from `lg` up the TopBar and BottomNav hide themselves, `SideNav`
   takes over, and each page's container grows. Use the `.app-page` or
   `.app-read` class (defined in `src/app/globals.css`) for a page's
   container, and give a flat list of cards
   `lg:grid lg:grid-cols-2 2xl:grid-cols-3 lg:gap-4 lg:items-start` so it
   fills the window instead of running down one column. Keep every desktop
   rule behind an `lg:` prefix so the phone layout cannot regress.
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
