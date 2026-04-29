"use client";

import { useCallback, useEffect, useRef } from "react";

interface InfoSheetProps {
  isOpen: boolean;
  onClose: () => void;
  eyebrow?: string;
  title: string;
  glyph?: string;
  children: React.ReactNode;
}

export default function InfoSheet({
  isOpen,
  onClose,
  eyebrow,
  title,
  glyph,
  children,
}: InfoSheetProps) {
  const close = useCallback(() => onClose(), [onClose]);
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      document.body.style.overflow = "";
      return;
    }
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, close]);

  if (!isOpen) return null;

  return (
    <div
      onClick={(e) => {
        if (sheetRef.current && !sheetRef.current.contains(e.target as Node)) {
          close();
        }
      }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        overflowY: "auto",
        WebkitOverflowScrolling: "touch",
        background: "var(--modal-overlay)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
      }}
    >
      {/* Card */}
      <div
        ref={sheetRef}
        role="dialog"
        style={{
          width: "100%",
          maxWidth: 480,
          maxHeight: "80vh",
          overflowY: "auto",
          background: "var(--background, #F3E8D6)",
          borderRadius: 24,
          border: "1px solid rgba(42, 31, 24, 0.12)",
          boxShadow: "0 24px 48px -12px rgba(42, 31, 24, 0.3), 0 8px 16px -8px rgba(42, 31, 24, 0.15)",
        }}
      >
        {/* Header + close */}
        <div className="px-6 pt-5 pb-3 flex items-start gap-4">
          <div className="flex-1 min-w-0">
            {eyebrow && (
              <p className="text-terracotta/80 text-[10px] uppercase tracking-[0.25em] font-bold mb-2">
                {eyebrow}
              </p>
            )}
            <div className="flex items-center gap-3">
              {glyph && (
                <span className="text-[32px] leading-none" aria-hidden="true">
                  {glyph}
                </span>
              )}
              <h2
                className="text-foreground text-[24px] leading-[1.1] tracking-tight"
                style={{ fontFamily: "var(--font-display)", margin: 0 }}
              >
                {title}
              </h2>
            </div>
          </div>
          <button
            onClick={close}
            aria-label="Close"
            className="shrink-0 w-8 h-8 rounded-full bg-card/60 border border-foreground/15 flex items-center justify-center hover:bg-card/80 text-foreground/60"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 pb-6">
          <div className="text-foreground/85 text-[15px] leading-relaxed space-y-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
