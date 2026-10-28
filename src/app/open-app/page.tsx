"use client";

/**
 * Back into the app after Stripe.
 *
 * Checkout from the native app happens in Safari (see lib/openCheckout), and
 * Stripe's return URL has to be a real web page — so it is this one, built by
 * returnUrl() in lib/siteUrl.ts. It hands `to` to the app's URL scheme, where
 * NativeAuthBridge routes to it, and offers a button in case iOS asks first.
 *
 * Only same-app paths are accepted, so this cannot be used to bounce someone
 * anywhere else.
 */

import { Suspense, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { NATIVE_AUTH_SCHEME } from "@/lib/socialSignIn";

function safePath(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/home";
  return raw;
}

function OpenAppContent() {
  const searchParams = useSearchParams();
  const target = useMemo(
    () => `${NATIVE_AUTH_SCHEME}://app${safePath(searchParams.get("to"))}`,
    [searchParams],
  );

  useEffect(() => {
    window.location.href = target;
  }, [target]);

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-4">
      <h1 style={{ fontFamily: "var(--font-heading)", fontSize: 24, color: "var(--foreground)" }}>
        All set
      </h1>
      <p className="text-[14px] leading-[1.6] max-w-xs" style={{ color: "var(--foreground-secondary)" }}>
        Head back to Mapped to pick up where you left off.
      </p>
      <a
        href={target}
        className="rounded-full px-8 text-[15px] font-semibold flex items-center"
        style={{ minHeight: 50, background: "var(--brass)", color: "var(--btn-primary-text)" }}
      >
        Back to Mapped
      </a>
    </main>
  );
}

export default function OpenAppPage() {
  return (
    <Suspense fallback={<main className="flex-1" />}>
      <OpenAppContent />
    </Suspense>
  );
}
