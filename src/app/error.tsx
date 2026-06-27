"use client";

/**
 * Global error boundary — catches unhandled errors across the entire app.
 * Shows a branded fallback instead of the generic Vercel "This page couldn't load" screen.
 */

import { useEffect } from "react";
import { captureError } from "@/lib/errorMonitor";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    captureError(error, { boundary: "app/error", digest: error.digest });
  }, [error]);

  return (
    <div
      className="min-h-dvh flex flex-col items-center justify-center px-6 text-center"
      style={{ background: "var(--background, #f0e6d2)", color: "var(--foreground, #3d3328)" }}
    >
      <div className="mb-8">
        <h2 className="text-[42px] leading-none tracking-tight mb-1">
          <span style={{ fontFamily: "'Bodoni Moda', serif", fontStyle: "italic", fontWeight: 400 }}>mapp</span>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, letterSpacing: "-0.02em" }}>ed.</span>
        </h2>
      </div>

      <div className="max-w-sm">
        <p className="text-lg mb-2" style={{ fontFamily: "var(--font-display, Georgia)" }}>
          Something went sideways
        </p>
        <p className="text-sm opacity-60 mb-8 leading-relaxed">
          The stars are still aligned — we just hit a temporary glitch.
          This usually means our server is taking a breather.
        </p>

        <button
          onClick={reset}
          className="px-8 py-3 rounded-full text-sm font-semibold tracking-wide
                     active:scale-[0.98] transition-all"
          style={{
            backgroundColor: "var(--brass, #b8a068)",
            color: "#1a1a1a",
          }}
        >
          Try again
        </button>

        <p className="text-xs opacity-40 mt-6">
          If this keeps happening, check your connection or try again in a minute.
        </p>
      </div>
    </div>
  );
}
