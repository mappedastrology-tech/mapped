"use client";

import { useEffect, useRef } from "react";
import type { ReferenceEntry } from "@/lib/learn/types";
import { domainAccent } from "@/lib/learn/registry";
import { findEntryByName } from "@/lib/learn/reference";

const SAFETY_TONE = "var(--oxblood-light)";

/** Bottom-sheet detail for a single reference entry (progressive disclosure). */
export default function ReferenceSheet({ entry, onClose, onOpenEntry }: { entry: ReferenceEntry | null; onClose: () => void; onOpenEntry?: (entry: ReferenceEntry) => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!entry) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    ref.current?.focus();
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [entry, onClose]);

  if (!entry) return null;
  const accent = domainAccent(entry.domain);
  const statFields = entry.fields.slice(0, 3);
  const restFields = entry.fields.slice(3);

  return (
    <>
      <div className="fixed inset-0 z-[60] backdrop-blur-[2px]" style={{ backgroundColor: "var(--modal-overlay)" }} onClick={onClose} aria-hidden="true" />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={entry.name}
        tabIndex={-1}
        className="fixed left-0 right-0 bottom-0 z-[60] max-h-[88vh] overflow-y-auto rounded-t-3xl outline-none animate-in slide-in-from-bottom duration-200"
        style={{ backgroundColor: "var(--modal-bg)", borderTop: `3px solid ${accent}` }}
      >
        {/* grain wash */}
        <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
          <filter id="refgrain"><feTurbulence type="fractalNoise" baseFrequency="0.82" numOctaves={2} stitchTiles="stitch" /></filter>
        </svg>

        <div className="max-w-lg mx-auto px-5 pt-3 pb-8 relative">
          {/* grab handle */}
          <div className="w-10 h-1 rounded-full mx-auto mb-2" style={{ backgroundColor: "var(--border-strong)" }} aria-hidden="true" />

          {/* close */}
          <button
            onClick={onClose}
            className="absolute right-4 top-3 w-9 h-9 min-w-[40px] min-h-[40px] rounded-full flex items-center justify-center"
            style={{ backgroundColor: "var(--lib-track)" }}
            aria-label="Close"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--foreground)" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          {/* Icon orb + title */}
          <div className="text-center pt-1">
            <div className="relative mx-auto" style={{ width: 96, height: 96 }}>
              <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: `radial-gradient(circle at 42% 36%, ${accent}66, ${accent}33 60%, rgba(11,7,18,0) 84%)` }} />
              {entry.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={entry.image} alt="" aria-hidden="true" loading="lazy" style={{ position: "absolute", inset: 18, width: 60, height: 60, objectFit: "contain", filter: "drop-shadow(0 4px 9px rgba(0,0,0,0.5))" }} />
              ) : (
                <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, color: "var(--foreground)", fontFamily: "var(--font-display)" }} aria-hidden="true">{entry.name[0]}</span>
              )}
            </div>
            {entry.category && <p className="text-[9px] uppercase font-semibold mt-2.5" style={{ letterSpacing: "0.2em", color: accent }}>{entry.category}</p>}
            <h2 className="mt-1 text-[30px] font-medium leading-none" style={{ color: "var(--foreground)", fontFamily: "var(--font-display)" }}>{entry.name}</h2>
          </div>

          {/* Stat cards (first 3 fields) */}
          {statFields.length > 0 && (
            <div className="flex gap-2 mt-5">
              {statFields.map((f, i) => (
                <div key={i} className="flex-1 text-center px-1 py-2.5 rounded-[13px]" style={{ background: "var(--lib-surface)", border: "0.5px solid color-mix(in srgb, var(--brass) 14%, transparent)" }}>
                  <div className="text-[9px] uppercase font-semibold" style={{ letterSpacing: "0.16em", color: "var(--foreground-muted)" }}>{f.label}</div>
                  {(() => {
                    const linked = onOpenEntry ? findEntryByName(f.value, entry.domain, entry.id) : undefined;
                    return linked ? (
                      <button onClick={() => onOpenEntry!(linked)} className="mt-1 text-[13px] leading-tight active:opacity-70" style={{ fontFamily: "var(--font-display)", color: accent, textDecoration: "underline", textUnderlineOffset: 2 }}>{f.value}</button>
                    ) : (
                      <div className="mt-1 text-[13px] leading-tight" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{f.value}</div>
                    );
                  })()}
                </div>
              ))}
            </div>
          )}

          {/* At a glance (tags) */}
          {entry.tags && entry.tags.length > 0 && (
            <div className="mt-6">
              <p className="text-[9px] uppercase font-semibold" style={{ letterSpacing: "0.2em", color: accent }}>At a glance</p>
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {entry.tags.slice(0, 8).map((t, i) => (
                  <span key={i} className="text-[11px] px-3 py-1.5 rounded-full" style={{ background: `${accent}1a`, border: `0.5px solid ${accent}38`, color: "var(--brass)" }}>{t}</span>
                ))}
              </div>
            </div>
          )}

          {/* Body */}
          <p className="text-[9px] uppercase font-semibold mt-6" style={{ letterSpacing: "0.2em", color: accent }}>{(entry.domain === "almanac" || entry.domain === "meditation") ? "Overview" : "The tradition"}</p>
          <p className="text-[14px] leading-relaxed mt-2.5" style={{ color: "var(--foreground-secondary)" }}>{entry.summary}</p>

          {/* Safety */}
          {entry.safety && (
            <div className="rounded-xl px-4 py-3 mt-4" style={{ backgroundColor: "rgba(122,48,40,0.2)", borderLeft: `3px solid ${SAFETY_TONE}` }}>
              <p className="text-[9px] uppercase tracking-widest mb-1 font-semibold" style={{ color: SAFETY_TONE }}>Safety</p>
              <p className="text-[13px] leading-relaxed" style={{ color: "var(--foreground-secondary)" }}>{entry.safety}</p>
            </div>
          )}

          {/* Remaining fields */}
          {restFields.length > 0 && (
            <div className="flex flex-col gap-3 mt-5">
              {restFields.map((f, i) => {
                const linked = onOpenEntry ? findEntryByName(f.value, entry.domain, entry.id) : undefined;
                return (
                  <div key={i}>
                    <p className="text-[9px] uppercase tracking-widest mb-0.5 font-semibold" style={{ color: accent }}>{f.label}</p>
                    {linked ? (
                      <button onClick={() => onOpenEntry!(linked)} className="text-[14px] leading-relaxed text-left active:opacity-70" style={{ color: accent, textDecoration: "underline", textUnderlineOffset: 2 }}>{f.value} →</button>
                    ) : (
                      <p className="text-[14px] leading-relaxed" style={{ color: "var(--foreground-secondary)" }}>{f.value}</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {(entry.safety || entry.domain === "herbalism" || entry.domain === "essential-oils") && (
            <p className="text-[10px] leading-relaxed mt-6 text-center" style={{ color: "var(--foreground-muted)" }}>
              Not medical advice — check with a clinician or pharmacist before using herbs or oils for a health condition or alongside medication.
            </p>
          )}
        </div>
      </div>
    </>
  );
}
