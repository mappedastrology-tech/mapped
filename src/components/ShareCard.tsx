"use client";

/**
 * ShareCard — generates branded shareable images for Mapped charts.
 *
 * Renders a hidden styled card, captures it with html2canvas,
 * then triggers share (Web Share API) or download (fallback).
 *
 * Usage:
 *   <ShareCard
 *     type="natal"
 *     name="Taylor"
 *     subtitle="Aries Sun · Scorpio Moon · Leo Rising"
 *     planets={[...]}
 *     houses={[...]}
 *   />
 */

import { useRef, useState, useCallback } from "react";

/* ─── Types ─── */

interface ShareCardProps {
  /** What kind of chart */
  type: "natal" | "synastry" | "composite" | "solar" | "transits";
  /** Person or pair name */
  name: string;
  /** Big three or short description */
  subtitle?: string;
  /** Optional second person for synastry/composite */
  name2?: string;
  subtitle2?: string;
  /** Key data points to display on the card */
  highlights?: { label: string; value: string }[];
  /** Optional score for synastry */
  score?: number;
  /** Optional theme title (e.g. composite theme, solar return theme) */
  theme?: string;
}

/* ─── Sign emoji helper ─── */
const SIGN_SYMBOLS: Record<string, string> = {
  Ari: "♈", Tau: "♉", Gem: "♊", Can: "♋", Leo: "♌", Vir: "♍",
  Lib: "♎", Sco: "♏", Sag: "♐", Cap: "♑", Aqu: "♒", Pis: "♓",
};

/* ─── Component ─── */

export default function ShareCard({
  type,
  name,
  subtitle,
  name2,
  subtitle2,
  highlights,
  score,
  theme,
}: ShareCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [generating, setGenerating] = useState(false);

  const typeLabels: Record<string, string> = {
    natal: "Birth Chart",
    synastry: "Compatibility",
    composite: "Composite Chart",
    solar: "Solar Return",
    transits: "Transits",
  };

  const handleShare = useCallback(async () => {
    if (!cardRef.current || generating) return;
    setGenerating(true);

    try {
      // Dynamic import to avoid SSR issues
      const html2canvas = (await import("html2canvas")).default;

      // Make the card visible temporarily for capture
      const card = cardRef.current;
      card.style.display = "block";
      card.style.position = "fixed";
      card.style.left = "-9999px";
      card.style.top = "0";

      const canvas = await html2canvas(card, {
        backgroundColor: "#f0e6d2",
        scale: 2, // Retina quality
        useCORS: true,
        logging: false,
        width: 390,
        height: card.scrollHeight,
      });

      card.style.display = "none";
      card.style.position = "";
      card.style.left = "";
      card.style.top = "";

      // Convert to blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), "image/png", 1.0);
      });

      const file = new File([blob], `mapped-${type}-${name.toLowerCase().replace(/\s+/g, "-")}.png`, {
        type: "image/png",
      });

      // Try Web Share API first (works great on mobile)
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `${name}'s ${typeLabels[type]} — Mapped`,
          text: subtitle || "",
        });
      } else {
        // Fallback: download
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error("Share failed:", err);
    } finally {
      setGenerating(false);
    }
  }, [generating, type, name, subtitle]);

  return (
    <>
      {/* ── Share button ── */}
      <button
        onClick={handleShare}
        disabled={generating}
        className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-lavender/30 text-lavender text-xs font-medium tracking-wide hover:bg-lavender/10 hover:text-lavender-light transition-all active:scale-[0.97]"
      >
        {generating ? (
          <div className="w-3 h-3 border border-foreground/20 border-t-cream rounded-full animate-spin" role="status" aria-label="Loading" />
        ) : (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
            <polyline points="16 6 12 2 8 6" />
            <line x1="12" y1="2" x2="12" y2="15" />
          </svg>
        )}
        Share
      </button>

      {/* ── Hidden card for capture ── */}
      <div
        ref={cardRef}
        style={{ display: "none", width: 390, fontFamily: "var(--font-heading)" }}
      >
        <div
          style={{
            background:
              "linear-gradient(180deg, #f5f0e1 0%, #f0e6d2 40%, #e8dcc4 100%)",
            padding: "36px 28px",
            color: "#1a1815",
          }}
        >
          {/* Logo / branding */}
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <img
              src="/logo-light.png"
              alt="Mapped"
              width={170}
              height={48}
              style={{ width: 170, height: 48, objectFit: "contain", display: "block", margin: "0 auto" }}
            />
          </div>

          {/* Chart type label */}
          <div
            style={{
              textAlign: "center",
              fontSize: 10,
              letterSpacing: "0.2em",
              textTransform: "uppercase" as const,
              color: "#5a1f1a",
              opacity: 0.8,
              marginBottom: 8,
              fontWeight: 600,
            }}
          >
            {typeLabels[type]}
          </div>

          {/* Name(s) */}
          <div style={{ textAlign: "center", marginBottom: 4 }}>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: type === "synastry" || type === "composite" ? 22 : 30,
                color: "#1a1815",
              }}
            >
              {name2 ? `${name} & ${name2}` : name}
            </span>
          </div>

          {/* Theme title (composite/solar) */}
          {theme && (
            <div
              style={{
                textAlign: "center",
                fontSize: 13,
                color: "#4a2540",
                marginBottom: 4,
                fontStyle: "italic",
              }}
            >
              {theme}
            </div>
          )}

          {/* Subtitle (big three) */}
          {subtitle && (
            <div
              style={{
                textAlign: "center",
                fontSize: 12,
                color: "rgba(42, 31, 24, 0.6)",
                marginBottom: name2 && subtitle2 ? 2 : 20,
              }}
            >
              {subtitle}
            </div>
          )}
          {name2 && subtitle2 && (
            <div
              style={{
                textAlign: "center",
                fontSize: 12,
                color: "rgba(42, 31, 24, 0.6)",
                marginBottom: 20,
              }}
            >
              {subtitle2}
            </div>
          )}

          {/* Score (synastry) */}
          {score !== undefined && (
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 72,
                  height: 72,
                  borderRadius: "50%",
                  border: `3px solid ${score >= 70 ? "#5a7a3a" : score >= 50 ? "#c9a961" : "#5a1f1a"}`,
                  fontSize: 24,
                  fontWeight: 700,
                  color: score >= 70 ? "#5a7a3a" : score >= 50 ? "#c9a961" : "#5a1f1a",
                }}
              >
                {score}
              </div>
            </div>
          )}

          {/* Highlights grid */}
          {highlights && highlights.length > 0 && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: highlights.length <= 3 ? `repeat(${highlights.length}, 1fr)` : "repeat(3, 1fr)",
                gap: 8,
                marginBottom: 20,
              }}
            >
              {highlights.map((h, i) => (
                <div
                  key={i}
                  style={{
                    textAlign: "center",
                    padding: "10px 6px",
                    borderRadius: 10,
                    border: "1px solid rgba(180, 81, 40, 0.25)",
                    background: "rgba(255, 255, 255, 0.45)",
                  }}
                >
                  <div style={{ fontSize: 14, color: "#1a1815", fontWeight: 700 }}>
                    {h.value}
                  </div>
                  <div
                    style={{
                      fontSize: 9,
                      letterSpacing: "0.15em",
                      textTransform: "uppercase" as const,
                      color: "rgba(42, 31, 24, 0.45)",
                      marginTop: 2,
                      fontWeight: 600,
                    }}
                  >
                    {h.label}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Footer */}
          <div
            style={{
              textAlign: "center",
              fontSize: 9,
              color: "rgba(42, 31, 24, 0.35)",
              letterSpacing: "0.12em",
              paddingTop: 12,
              borderTop: "1px solid rgba(42, 31, 24, 0.1)",
              fontWeight: 600,
              textTransform: "uppercase" as const,
            }}
          >
            mapped · your astrology, your people
          </div>
        </div>
      </div>
    </>
  );
}
