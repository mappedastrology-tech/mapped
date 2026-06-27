"use client";

import { useRef, useState } from "react";
import type { CertificateRecord } from "@/lib/learn/types";

/** A shareable, downloadable Certificate of Completion (honestly framed). */
export default function Certificate({ cert }: { cert: CertificateRecord }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);

  const dateStr = new Date(cert.issuedAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });

  async function download() {
    if (!cardRef.current) return;
    setBusy(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(cardRef.current, { backgroundColor: null, scale: 2 });
      const link = document.createElement("a");
      link.download = `mapped-certificate-${cert.courseId}.png`;
      link.href = canvas.toDataURL("image/png");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      /* fail soft */
    } finally {
      setBusy(false);
    }
  }

  const pct = Math.round(cert.score * 100);

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        ref={cardRef}
        className="relative w-full rounded-2xl px-6 py-7 text-center overflow-hidden"
        style={{ background: "linear-gradient(160deg, var(--plum-deep), var(--plum))", border: "2px solid var(--brass)", outline: "1px solid rgba(201,169,97,0.35)", outlineOffset: "-6px" }}
      >
        {/* corner flourishes */}
        {["top-2 left-2", "top-2 right-2", "bottom-2 left-2", "bottom-2 right-2"].map((pos) => (
          <span key={pos} className={`absolute ${pos} text-[12px]`} style={{ color: "rgba(201,169,97,0.6)" }} aria-hidden="true">✦</span>
        ))}

        <p className="text-[10px] uppercase tracking-[0.3em] mb-4" style={{ color: "var(--brass-light)" }}>Mapped · Certificate of Completion</p>

        {/* Award seal */}
        <div className="mx-auto mb-4 w-[88px] h-[88px] relative flex items-center justify-center" aria-hidden="true">
          <svg width="88" height="88" viewBox="0 0 88 88" className="absolute inset-0">
            <circle cx="44" cy="44" r="40" fill="none" stroke="var(--brass)" strokeWidth="1.5" />
            <circle cx="44" cy="44" r="34" fill="rgba(201,169,97,0.10)" stroke="var(--brass-light)" strokeWidth="1" />
            {Array.from({ length: 24 }).map((_, i) => {
              const a = (i / 24) * Math.PI * 2;
              return <circle key={i} cx={44 + Math.cos(a) * 40} cy={44 + Math.sin(a) * 40} r="1" fill="var(--brass)" />;
            })}
          </svg>
          <div className="text-center">
            <p className="text-[22px] font-bold leading-none" style={{ color: "#f0e6d2", fontFamily: "var(--font-display)" }}>{pct}%</p>
            <p className="text-[8px] uppercase tracking-widest" style={{ color: "var(--brass-light)" }}>Passed</p>
          </div>
        </div>

        <p className="text-[12px]" style={{ color: "rgba(240,230,210,0.7)" }}>This certifies the completion of</p>
        <p className="text-[20px] font-semibold my-2 leading-tight" style={{ color: "#f0e6d2", fontFamily: "var(--font-display)" }}>{cert.courseTitle}</p>
        <div className="flex items-center justify-center gap-2 my-3" aria-hidden="true">
          <span className="h-px w-8" style={{ backgroundColor: "rgba(201,169,97,0.4)" }} />
          <span style={{ color: "var(--brass)" }}>✦</span>
          <span className="h-px w-8" style={{ backgroundColor: "rgba(201,169,97,0.4)" }} />
        </div>
        <div className="flex items-center justify-between text-[10px]" style={{ color: "rgba(240,230,210,0.6)" }}>
          <span>{dateStr}</span>
          <span>ID {cert.code}</span>
        </div>
      </div>

      <button
        onClick={download}
        disabled={busy}
        className="text-[12px] px-4 py-2 rounded-full disabled:opacity-50"
        style={{ border: "1px solid var(--border-card)", color: "var(--foreground-secondary)" }}
      >
        {busy ? "Preparing…" : "Download certificate"}
      </button>

      <p className="text-[10px] leading-relaxed text-center px-2" style={{ color: "var(--foreground-muted)" }}>
        This documents completion of an educational course in Mapped. It is not an accredited continuing-education credential and may not satisfy professional licensing requirements.
      </p>
    </div>
  );
}
