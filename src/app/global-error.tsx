"use client";

/**
 * Global error boundary — catches errors in the ROOT layout itself.
 * This is the last resort. Must include its own <html> and <body> tags
 * because the root layout may have crashed.
 */

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "1.5rem",
          textAlign: "center",
          background: "#f0e6d2",
          color: "#3d3328",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        }}
      >
        <div style={{ marginBottom: "2rem" }}>
          <h2 style={{ fontSize: "42px", lineHeight: 1, letterSpacing: "-0.02em", margin: 0 }}>
            <span style={{ fontFamily: "'Bodoni Moda', Georgia, serif", fontStyle: "italic", fontWeight: 400 }}>mapp</span>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>ed.</span>
          </h2>
        </div>

        <div style={{ maxWidth: "360px" }}>
          <p style={{ fontSize: "18px", marginBottom: "8px", fontFamily: "Georgia, serif" }}>
            Something went sideways
          </p>
          <p style={{ fontSize: "14px", opacity: 0.6, marginBottom: "32px", lineHeight: 1.6 }}>
            The stars are still aligned — we just hit a temporary glitch. This usually resolves on its own.
          </p>

          <button
            onClick={reset}
            style={{
              padding: "12px 32px",
              borderRadius: "9999px",
              border: "none",
              fontSize: "14px",
              fontWeight: 600,
              letterSpacing: "0.02em",
              cursor: "pointer",
              backgroundColor: "#b8a068",
              color: "#1a1a1a",
              transition: "transform 0.15s",
            }}
            onMouseDown={(e) => ((e.target as HTMLElement).style.transform = "scale(0.98)")}
            onMouseUp={(e) => ((e.target as HTMLElement).style.transform = "")}
          >
            Try again
          </button>

          <p style={{ fontSize: "12px", opacity: 0.4, marginTop: "24px" }}>
            If this keeps happening, try refreshing the page.
          </p>
        </div>
      </body>
    </html>
  );
}
