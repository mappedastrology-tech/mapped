import type { NextConfig } from "next";

/**
 * Two builds from one codebase (see PLATFORMS.md):
 *
 *  - Web build (default): SSR pages + the 28 API routes, deployed to Netlify.
 *  - App build (APP_BUILD=1): a static export of the frontend only, bundled
 *    into the Capacitor iOS/Android shells. Run it via `npm run build:app`,
 *    which also moves src/app/api aside — static export rejects route handlers
 *    that read Request, and all of ours do.
 */
const isAppBuild = process.env.APP_BUILD === "1";

const nextConfig: NextConfig = isAppBuild
  ? {
      output: "export",
      // Separate output dir so an app build never clobbers the web build.
      distDir: ".next-app",
      // No Node server in the app, so no on-demand image optimization.
      images: { unoptimized: true },
      // Emit dir/index.html, which the Capacitor webview resolves correctly
      // for deep paths like /library/tarot-foundations.
      trailingSlash: true,
    }
  : {};

export default nextConfig;
