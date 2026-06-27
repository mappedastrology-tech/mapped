"use client";

/**
 * Solar Event Screen — full-screen takeover for the solstices & equinoxes,
 * mirroring the Moon Event Screen. Shows the seasonal turning point with a sun
 * visual, the day's character (longest day/night/balance), the sign the Sun
 * enters, lore, what it's best for, a seasonal ritual prompt, and a
 * "Wheel of the Year" grid of all four solar points.
 */

import { useMemo, useEffect, useRef } from "react";
import {
  getSolarEventsForYear,
  type TodaysSolarEvent,
  type SolarEventKind,
} from "@/lib/celestialCalendar";

const THEME: Record<SolarEventKind, { bg: string; accent: string; glow: string; sun: number }> = {
  "summer-solstice": { bg: "linear-gradient(180deg,#3a1f0a 0%,#6b3d12 50%,#9a5a1c 100%)", accent: "#ffd27a", glow: "rgba(255,200,90,0.40)", sun: 150 },
  "winter-solstice": { bg: "linear-gradient(180deg,#080814 0%,#161334 55%,#2a2350 100%)", accent: "#cbb6ff", glow: "rgba(180,150,255,0.28)", sun: 96 },
  "spring-equinox": { bg: "linear-gradient(180deg,#15240f 0%,#35501f 55%,#5e7d33 100%)", accent: "#e3f2ac", glow: "rgba(205,240,150,0.32)", sun: 124 },
  "autumn-equinox": { bg: "linear-gradient(180deg,#2a1408 0%,#5a2f12 55%,#8a5020 100%)", accent: "#ffcf9a", glow: "rgba(255,180,110,0.32)", sun: 124 },
};

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function SunVisual({ size, accent, glow }: { size: number; accent: string; glow: string }) {
  const rays = Array.from({ length: 12 });
  return (
    <div className="relative w-[180px] h-[180px] mx-auto flex items-center justify-center">
      <div className="absolute inset-0 rounded-full" style={{ background: `radial-gradient(circle, ${glow} 0%, transparent 68%)` }} />
      <svg width={180} height={180} viewBox="0 0 180 180" className="relative z-10" aria-hidden="true">
        {rays.map((_, i) => {
          const angle = (i * 30 * Math.PI) / 180;
          const inner = size / 2 + 8;
          const outer = size / 2 + 26;
          const x1 = 90 + Math.cos(angle) * inner;
          const y1 = 90 + Math.sin(angle) * inner;
          const x2 = 90 + Math.cos(angle) * outer;
          const y2 = 90 + Math.sin(angle) * outer;
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={accent} strokeWidth={2.5} strokeLinecap="round" opacity={0.7} />;
        })}
        <defs>
          <radialGradient id="sunfill" cx="50%" cy="42%" r="60%">
            <stop offset="0%" stopColor="#fff8e6" />
            <stop offset="55%" stopColor={accent} />
            <stop offset="100%" stopColor={accent} stopOpacity={0.85} />
          </radialGradient>
        </defs>
        <circle cx={90} cy={90} r={size / 2} fill="url(#sunfill)" />
      </svg>
    </div>
  );
}

function CorrespondenceCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.05)" }}>
      <p className="text-[9px] opacity-35 mb-1">{label}</p>
      <p className="text-[12px] opacity-70">{value}</p>
    </div>
  );
}

export default function SolarEventScreen({ event, onClose }: { event: TodaysSolarEvent; onClose: () => void }) {
  const theme = THEME[event.kind];
  const dialogRef = useRef<HTMLDivElement>(null);
  const yearEvents = useMemo(() => getSolarEventsForYear(event.date.getFullYear()), [event.date]);

  // Dark theme-color + lock scroll while open (same as the moon takeover).
  useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]');
    const prev = meta?.getAttribute("content") || "#f0e6d2";
    if (meta) meta.setAttribute("content", "#100a06");
    const statusMeta = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
    const prevStatus = statusMeta?.getAttribute("content") || "default";
    if (statusMeta) statusMeta.setAttribute("content", "black-translucent");
    document.body.style.overflow = "hidden";
    return () => {
      if (meta) meta.setAttribute("content", prev);
      if (statusMeta) statusMeta.setAttribute("content", prevStatus);
      document.body.style.overflow = "";
    };
  }, []);

  // Focus trap + Escape to close.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const focusable = dialog.querySelectorAll<HTMLElement>('button, [href], [tabindex]:not([tabindex="-1"])');
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const trap = (e: KeyboardEvent) => {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key !== "Tab") return;
      if (e.shiftKey) { if (document.activeElement === first) { e.preventDefault(); last?.focus(); } }
      else { if (document.activeElement === last) { e.preventDefault(); first?.focus(); } }
    };
    first?.focus();
    document.addEventListener("keydown", trap);
    return () => document.removeEventListener("keydown", trap);
  }, [onClose]);

  const dateStr = event.date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  const elementCap = event.element.charAt(0).toUpperCase() + event.element.slice(1);

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label="Solar event"
      className="fixed inset-0 z-[60] overflow-y-auto"
      style={{ background: theme.bg, color: "#fff", paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="relative z-10 max-w-lg mx-auto px-5 pb-10">
        <button onClick={onClose} className="pt-4 pb-2 flex items-center gap-1.5 text-[12px] min-h-[44px]" style={{ opacity: 0.6, color: "#fff" }} aria-label="Go back">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back
        </button>

        <div className="pt-4 pb-2">
          <SunVisual size={theme.sun} accent={theme.accent} glow={theme.glow} />
        </div>

        <div className="text-center pb-2">
          <p className="text-[9px] tracking-[0.25em] uppercase mb-1.5" style={{ opacity: 0.45 }}>
            ☀ {event.name} ☀
          </p>
          <h1 className="text-[28px] font-bold mb-1" style={{ fontFamily: "Georgia, serif" }}>{event.name}</h1>
          <p className="text-[13px]" style={{ opacity: 0.55 }}>{dateStr}</p>
        </div>

        <div className="flex justify-center gap-7 py-5 text-center">
          <div>
            <p className="text-[15px] font-semibold leading-tight max-w-[120px]" style={{ color: theme.accent }}>{event.dayType}</p>
            <p className="text-[9px] uppercase tracking-[0.15em] mt-1.5" style={{ opacity: 0.35 }}>The day</p>
          </div>
          <div style={{ width: 1, background: "rgba(255,255,255,0.12)" }} />
          <div>
            <p className="text-[20px] font-semibold" style={{ color: theme.accent }}>{event.sign}</p>
            <p className="text-[9px] uppercase tracking-[0.15em] mt-1" style={{ opacity: 0.35 }}>Sun enters</p>
          </div>
        </div>

        <div className="px-10 py-2">
          <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.14), transparent)" }} />
        </div>

        <div className="py-4">
          <p className="text-[9px] tracking-[0.2em] uppercase mb-2" style={{ opacity: 0.35 }}>About this turning point</p>
          <p className="text-[13px] leading-[1.6]" style={{ opacity: 0.72 }}>{event.description}</p>
        </div>

        <div className="pb-4">
          <p className="text-[9px] tracking-[0.2em] uppercase mb-2.5" style={{ opacity: 0.35 }}>Best for</p>
          <div className="flex flex-wrap gap-1.5">
            {event.bestFor.map((tag) => (
              <span key={tag} className="px-3 py-1.5 rounded-full text-[11px]" style={{ background: "rgba(255,255,255,0.08)", opacity: 0.7 }}>{tag}</span>
            ))}
          </div>
        </div>

        <div className="pb-4">
          <p className="text-[9px] tracking-[0.2em] uppercase mb-2.5" style={{ opacity: 0.35 }}>This season</p>
          <div className="grid grid-cols-2 gap-2">
            <CorrespondenceCard label="Element" value={`✦ ${elementCap}`} />
            <CorrespondenceCard label="Sign" value={`☉ ${event.sign}`} />
          </div>
        </div>

        {/* Seasonal ritual prompt */}
        <div className="py-3">
          <div className="rounded-2xl px-5 py-5" style={{ background: "rgba(255,255,255,0.06)", border: `1px solid ${theme.accent}33` }}>
            <p className="text-[9px] tracking-[0.2em] uppercase mb-2" style={{ opacity: 0.4 }}>A ritual for today</p>
            <p className="text-[14px] leading-[1.55]" style={{ opacity: 0.85 }}>{event.ritualHint}</p>
          </div>
        </div>

        {/* Wheel of the Year */}
        <div className="pt-5 pb-8">
          <p className="text-[9px] tracking-[0.2em] uppercase mb-3" style={{ opacity: 0.35 }}>Wheel of the Year · {event.date.getFullYear()}</p>
          <div className="grid grid-cols-2 gap-1.5">
            {yearEvents.map((e) => {
              const isCurrent = e.kind === event.kind;
              return (
                <div
                  key={e.kind}
                  className="flex items-center gap-2 py-2 px-2.5 rounded-lg"
                  style={{
                    background: isCurrent ? `${theme.accent}22` : "rgba(255,255,255,0.03)",
                    border: isCurrent ? `1px solid ${theme.accent}55` : "1px solid transparent",
                  }}
                >
                  <span className="text-[14px] shrink-0">{e.element === "fire" ? "🔥" : e.element === "earth" ? "🍂" : e.element === "air" ? "🌱" : "❄️"}</span>
                  <div className="min-w-0">
                    <p className="text-[11px] truncate" style={{ opacity: isCurrent ? 0.95 : 0.55, color: isCurrent ? theme.accent : undefined }}>
                      {MONTH_NAMES[e.date.getMonth()]} {e.date.getDate()}
                    </p>
                    <p className="text-[9px] truncate" style={{ opacity: isCurrent ? 0.6 : 0.3, color: isCurrent ? theme.accent : undefined }}>
                      {e.name}{isCurrent ? " ←" : ""}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
