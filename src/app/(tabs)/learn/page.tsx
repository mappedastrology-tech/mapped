"use client";

/**
 * Practice Page — combined Rituals + Tarot with a top pill toggle.
 *
 * This is the main entry point for the "Practice" bottom nav tab.
 * Users toggle between Rituals (daily suggestions, catalog, moon ritual)
 * and Tarot (decks, spreads, card readings) as two modes of the same screen.
 */

import { useState } from "react";
import dynamic from "next/dynamic";

const RitualPageContent = dynamic(() => import("./RitualPageContent"), {
  ssr: false,
  loading: () => <div className="flex-1" />,
});

const TarotPageContent = dynamic(() => import("../tarot/TarotPageContent"), {
  ssr: false,
  loading: () => <div className="flex-1" />,
});

type PracticeTab = "rituals" | "tarot";

export default function PracticePage() {
  const [activeTab, setActiveTab] = useState<PracticeTab>("rituals");

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* ━━━ Pill Toggle ━━━ */}
      <div className="max-w-lg mx-auto w-full px-5 pt-4 pb-2">
        <div
          className="flex rounded-lg overflow-hidden"
          style={{
            background: "color-mix(in srgb, var(--foreground) 6%, transparent)",
            border: "1px solid var(--border-card)",
          }}
        >
          {(["rituals", "tarot"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex-1 py-2 text-[13px] font-semibold capitalize transition-colors"
              style={{
                background: activeTab === tab ? "var(--background-card)" : "transparent",
                color: activeTab === tab ? "var(--foreground)" : "var(--foreground-muted)",
                boxShadow: activeTab === tab ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
              }}
            >
              {tab === "rituals" ? "Rituals" : "Tarot"}
            </button>
          ))}
        </div>
      </div>

      {/* ━━━ Content ━━━ */}
      <div className="flex-1 min-h-0">
        {activeTab === "rituals" ? <RitualPageContent /> : <TarotPageContent />}
      </div>
    </div>
  );
}
