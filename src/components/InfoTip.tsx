"use client";

/**
 * InfoTip — a small (i) icon that expands an inline explanation
 * when tapped. Uses a portal to render in document.body so it's
 * never clipped by overflow-hidden ancestors.
 */

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";

interface InfoTipProps {
  term: string;
  explanation: string;
}

export default function InfoTip({ term, explanation }: InfoTipProps) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLSpanElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  const reposition = useCallback(() => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const tipW = 280;
    // Prefer below the button, horizontally centered on it
    let left = rect.left + rect.width / 2 - tipW / 2;
    // Clamp so it doesn't go off-screen
    left = Math.max(8, Math.min(left, window.innerWidth - tipW - 8));
    let top = rect.bottom + 6;
    // If it would go off the bottom, show above
    if (top + 160 > window.innerHeight) {
      top = rect.top - 6; // will use transform to go upward
    }
    setPos({ top, left });
  }, []);

  useEffect(() => {
    if (!open) return;
    reposition();
    function handleClick(e: MouseEvent) {
      if (
        btnRef.current?.contains(e.target as Node) ||
        tipRef.current?.contains(e.target as Node)
      )
        return;
      setOpen(false);
    }
    function handleScroll() {
      setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("touchstart", handleClick as EventListener);
    window.addEventListener("scroll", handleScroll, true);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("touchstart", handleClick as EventListener);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [open, reposition]);

  return (
    <>
      <span
        ref={btnRef}
        role="button"
        tabIndex={0}
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.stopPropagation(); setOpen(!open); } }}
        className={`inline-flex items-center justify-center w-4 h-4 rounded-full
                    text-[9px] font-bold ml-1 transition-all flex-shrink-0 cursor-pointer select-none
                    ${open
                      ? "bg-terracotta/30 text-terracotta"
                      : "bg-foreground/8 text-foreground/30 hover:bg-foreground/12 hover:text-foreground/50"
                    }`}
        aria-label={`Learn about ${term}`}
      >
        i
      </span>

      {open &&
        pos &&
        createPortal(
          <div
            ref={tipRef}
            style={{ position: "fixed", top: pos.top, left: pos.left, width: 280, zIndex: 9999 }}
            className="rounded-xl bg-surface border border-foreground/20
                       shadow-xl shadow-ink/10 p-3.5"
          >
            <p className="text-foreground/90 text-xs font-semibold mb-1">{term}</p>
            <p className="text-foreground/60 text-xs leading-relaxed">{explanation}</p>
          </div>,
          document.body
        )}
    </>
  );
}
