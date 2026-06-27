import type { Metadata } from "next";
import TopBar from "@/components/TopBar";
import ReferenceList from "@/components/learn/ReferenceList";

export const metadata: Metadata = {
  title: "Library — Mapped",
  description: "Look up any card, sign, crystal, herb, or oil — a searchable reference across every topic.",
};

export default function LibraryLookupPage() {
  return (
    <main className="min-h-screen lib-felt">
      <TopBar />
      <div className="max-w-lg mx-auto px-5 pb-24">
        <div className="flex items-center justify-center gap-2.5 pt-3 pb-1">
          <span style={{ width: 16, height: 1, background: "rgba(201,169,97,0.45)" }} />
          <span className="text-[9px] font-semibold uppercase" style={{ letterSpacing: "0.2em", color: "var(--foreground-muted)" }}>The Library</span>
          <span style={{ width: 16, height: 1, background: "rgba(201,169,97,0.45)" }} />
        </div>
        <h1 className="text-center text-[26px] font-medium mb-1" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>Look it up</h1>
        <p className="text-[12px] leading-relaxed text-center pb-1" style={{ color: "var(--foreground-muted)" }}>
          Search across every topic — cards, signs, crystals, herbs, oils, and runes.
        </p>
        <ReferenceList placeholder="Search the Library — amethyst, Scorpio, lavender…" />
      </div>
    </main>
  );
}
