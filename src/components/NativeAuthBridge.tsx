"use client";

/**
 * Catches the app being reopened through its URL scheme:
 *
 * - com.mappedastrology.app://auth/verify after Google or Apple sign-in in the
 *   in-app browser. Finishes the sign-in and hands over to /auth/verify, which
 *   saves any pending chart and routes on to /home, exactly as on the web. See
 *   src/lib/socialSignIn.ts.
 * - com.mappedastrology.app://app/<path> from /open-app, after Stripe. Routes
 *   to <path>; TierProvider re-syncs the subscription on resume.
 *
 * Renders nothing, and does nothing outside the native shell.
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isNativeApp } from "@/lib/isNativeApp";
import { completeNativeSignIn, NATIVE_AUTH_SCHEME } from "@/lib/socialSignIn";

export default function NativeAuthBridge() {
  const router = useRouter();

  useEffect(() => {
    if (!isNativeApp()) return;
    let remove: (() => void) | undefined;
    let cancelled = false;

    (async () => {
      const [{ App }, { Browser }] = await Promise.all([
        import("@capacitor/app"),
        import("@capacitor/browser"),
      ]);
      const handle = await App.addListener("appUrlOpen", async ({ url }) => {
        if (!url.startsWith(`${NATIVE_AUTH_SCHEME}://`)) return;

        // com.mappedastrology.app://app/<path> — back from Stripe via /open-app.
        const parsed = new URL(url);
        if (parsed.hostname === "app") {
          Browser.close().catch(() => { /* not open */ });
          router.replace(`${parsed.pathname || "/home"}${parsed.search}`);
          return;
        }

        const signedIn = await completeNativeSignIn(url);
        Browser.close().catch(() => { /* already closed */ });
        router.replace(signedIn ? "/auth/verify" : "/welcome?mode=signin");
      });
      if (cancelled) handle.remove();
      else remove = () => handle.remove();
    })();

    return () => {
      cancelled = true;
      remove?.();
    };
  }, [router]);

  return null;
}
