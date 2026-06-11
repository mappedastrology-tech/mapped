"use client";

/**
 * Tabs error boundary — catches errors within any tab page.
 * Shows a branded inline error with retry, instead of crashing the whole app.
 */

export default function TabsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const isNetworkError =
    error.message?.includes("fetch") ||
    error.message?.includes("network") ||
    error.message?.includes("503") ||
    error.message?.includes("Failed to fetch");

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center min-h-[60vh]">
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center mb-5"
        style={{ background: "color-mix(in srgb, var(--terracotta) 12%, transparent)" }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--terracotta)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          {isNetworkError ? (
            <>
              <path d="M1 1l22 22" />
              <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
              <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
              <path d="M10.71 5.05A16 16 0 0 1 22.56 9" />
              <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
              <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
              <line x1="12" y1="20" x2="12.01" y2="20" />
            </>
          ) : (
            <>
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </>
          )}
        </svg>
      </div>

      <p
        className="text-lg text-foreground mb-2"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {isNetworkError ? "Can't reach the server" : "Something went wrong"}
      </p>

      <p className="text-sm text-muted max-w-xs mb-6 leading-relaxed">
        {isNetworkError
          ? "Our server is taking a moment. Your data is safe — just try again."
          : "We hit an unexpected bump. Try refreshing."}
      </p>

      <button
        onClick={reset}
        className="px-6 py-2.5 rounded-full text-sm font-medium transition-all active:scale-[0.98]"
        style={{
          backgroundColor: "var(--brass)",
          color: "#1a1a1a",
        }}
      >
        Try again
      </button>
    </div>
  );
}
