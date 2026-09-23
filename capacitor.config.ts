import type { CapacitorConfig } from "@capacitor/cli";

/**
 * Capacitor shell for the iOS and Android apps (see PLATFORMS.md).
 *
 * webDir points at the static export produced by `npm run build:app`. The
 * bundle ships the frontend only; API calls are rewritten to the deployed
 * origin at runtime by src/lib/apiBase.ts.
 */
const config: CapacitorConfig = {
  appId: "com.mappedastrology.app",
  appName: "Mapped",
  webDir: ".next-app",

  // Serve the bundle over https://localhost rather than capacitor://. Supabase
  // auth and the Web Crypto APIs the chart maths uses both require a secure
  // context, and this keeps the origin stable for CORS on the API side.
  server: {
    androidScheme: "https",
    iosScheme: "https",
  },

  /**
   * Keyboard handling, which `interactiveWidget` in the viewport does not
   * cover on iOS.
   *
   * WKWebView with `contentInset: "always"` scrolls the page under the
   * keyboard instead of resizing it, so the composer goes out of view. The
   * Keyboard plugin's native resize mode shrinks the WebView itself, which is
   * what the layout already expects.
   *
   * resizeOnFullScreen is the Android counterpart for fullscreen activities,
   * where the WebView otherwise keeps its full height behind the keyboard.
   */
  plugins: {
    Keyboard: {
      resize: "native",
      resizeOnFullScreen: true,
    },
  },

  ios: {
    // The felt-black canvas, so the status bar area never flashes white.
    backgroundColor: "#0e0a14",
    contentInset: "always",
  },
  android: {
    backgroundColor: "#0e0a14",
  },
};

export default config;
