"use client";

import { useEffect, useState } from "react";
import { getDailyRituals } from "@/lib/rituals";

export default function TodaysRitualWidget() {
  const [ritual, setRitual] = useState<{
    title: string;
    duration: string;
    mood: string;
    steps: string[];
  } | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const rituals = getDailyRituals(new Date());
    setRitual({
      title: rituals.featured.title,
      duration: rituals.featured.duration,
      mood: rituals.featured.mood,
      steps: rituals.featured.steps,
    });
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="rounded-xl bg-card/50 border border-foreground/15 p-6 flex items-center justify-center min-h-[140px]">
        <div className="w-5 h-5 border-2 border-sage/30 border-t-sage rounded-full animate-spin" />
      </div>
    );
  }

  if (!ritual) return null;

  return (
    <div className="rounded-xl bg-card/50 border border-foreground/15 p-6">
      <p className="text-xs uppercase tracking-widest text-sage/70 mb-3">
        ✦ Today's Ritual
      </p>
      <p className="text-foreground font-medium mb-2">{ritual.title}</p>
      <div className="flex items-center gap-3 mb-4">
        <span className="text-xs text-foreground/50 bg-foreground/8 px-2 py-1 rounded">
          {ritual.duration}
        </span>
        <span className="text-xs text-foreground/50 bg-foreground/8 px-2 py-1 rounded capitalize">
          {ritual.mood}
        </span>
      </div>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-foreground/15 text-sm text-foreground/60 space-y-2">
          {ritual.steps.map((step, i) => (
            <p key={i} className="text-foreground/60">
              <span className="text-terracotta/70 mr-2">{i + 1}.</span>
              {step}
            </p>
          ))}
        </div>
      )}

      <button
        onClick={() => setExpanded(!expanded)}
        className="text-terracotta hover:text-terracotta-light text-sm mt-3 transition-colors"
      >
        {expanded ? "Collapse" : "View steps"} →
      </button>
    </div>
  );
}
