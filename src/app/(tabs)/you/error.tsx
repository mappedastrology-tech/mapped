"use client";

export default function YouError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex-1 flex flex-col items-center justify-center px-5 py-12 max-w-lg mx-auto w-full text-center">
      <h2
        className="text-xl text-foreground mb-3"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Something went wrong
      </h2>
      <p className="text-foreground/60 text-sm mb-2">
        {error.message || "The chart page encountered an error."}
      </p>
      <p className="text-foreground/40 text-xs mb-6 font-mono max-w-xs break-all">
        {error.digest || ""}
      </p>
      <button
        onClick={reset}
        className="px-5 py-2.5 rounded-full bg-terracotta text-white text-sm font-medium active:scale-95 transition-all"
      >
        Try again
      </button>
    </main>
  );
}
