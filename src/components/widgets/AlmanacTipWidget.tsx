"use client";

import { useEffect, useState } from "react";
import { getMoonPhase } from "@/lib/celestialCalendar";

interface AlmanacTip {
  category: string;
  icon: string;
  tip: string;
}

export default function AlmanacTipWidget() {
  const [tip, setTip] = useState<AlmanacTip | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const moonData = getMoonPhase(new Date());
    const lifeTips = moonData.almanac.lifeTips;

    if (lifeTips.length > 0) {
      // Deterministic seed based on date
      const today = new Date();
      const year = today.getFullYear();
      const month = today.getMonth();
      const day = today.getDate();
      const seed = ((year * 367 + month * 31 + day * 13) * 2654435761) >>> 0;

      const tipIndex = seed % lifeTips.length;
      setTip(lifeTips[tipIndex]);
    }

    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="rounded-xl bg-card/50 border border-foreground/15 p-6 flex items-center justify-center min-h-[140px]">
        <div className="w-5 h-5 border-2 border-sage/30 border-t-sage rounded-full animate-spin" role="status" aria-label="Loading" />
      </div>
    );
  }

  if (!tip) return null;

  return (
    <div className="rounded-xl bg-card/50 border border-foreground/15 p-6">
      <p className="text-xs uppercase tracking-widest text-sage/70 mb-4">
        🌾 Almanac Tip
      </p>
      <div className="flex gap-3">
        <span className="text-2xl flex-shrink-0">{tip.icon}</span>
        <div className="flex-1">
          <p className="text-foreground text-sm font-medium mb-2">{tip.category}</p>
          <p className="text-secondary text-sm leading-relaxed">{tip.tip}</p>
        </div>
      </div>
    </div>
  );
}
