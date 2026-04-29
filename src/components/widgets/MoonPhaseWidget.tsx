"use client";

import { useEffect, useState } from "react";
import { getMoonPhase } from "@/lib/celestialCalendar";

export default function MoonPhaseWidget() {
  const [phase, setPhase] = useState<string>("");
  const [illumination, setIllumination] = useState<number>(0);
  const [emoji, setEmoji] = useState<string>("");
  const [energy, setEnergy] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const moonData = getMoonPhase(new Date());
    setPhase(moonData.label);
    setIllumination(moonData.illumination);
    setEmoji(moonData.emoji);
    setEnergy(moonData.energy);
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="rounded-xl bg-card/50 border border-foreground/15 p-6 flex items-center justify-center min-h-[140px]">
        <div className="w-5 h-5 border-2 border-amber/30 border-t-amber rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-card/50 border border-foreground/15 p-6">
      <p className="text-xs uppercase tracking-widest text-amber/70 mb-4">
        🌙 Moon Phase
      </p>
      <div className="flex items-center gap-4 mb-4">
        <div className="text-5xl">{emoji}</div>
        <div>
          <p className="text-foreground text-lg font-medium">{phase}</p>
          <p className="text-foreground/60 text-sm">{illumination}% illuminated</p>
        </div>
      </div>
      <p className="text-foreground/50 text-sm italic">{energy}</p>
    </div>
  );
}
