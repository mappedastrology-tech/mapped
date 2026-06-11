"use client";

import { useEffect, useState } from "react";
import { getMoonPhase, getMoonPhaseImage } from "@/lib/celestialCalendar";
import Image from "next/image";

export default function MoonPhaseWidget() {
  const [phase, setPhase] = useState<string>("");
  const [illumination, setIllumination] = useState<number>(0);
  const [phaseKey, setPhaseKey] = useState<string>("full");
  const [energy, setEnergy] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const moonData = getMoonPhase(new Date());
    setPhase(moonData.label);
    setIllumination(moonData.illumination);
    setPhaseKey(moonData.phase);
    setEnergy(moonData.energy);
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="rounded-xl bg-card/50 border border-foreground/15 p-6 flex items-center justify-center min-h-[140px]">
        <div className="w-5 h-5 border-2 border-amber/30 border-t-amber rounded-full animate-spin" role="status" aria-label="Loading" />
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-card/50 border border-foreground/15 p-6">
      <p className="text-xs uppercase tracking-widest text-amber/70 mb-4">
        🌙 Moon Phase
      </p>
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 relative shrink-0">
          <Image src={getMoonPhaseImage(phaseKey)} alt={phase} fill className="object-contain" />
        </div>
        <div>
          <p className="text-foreground text-lg font-medium">{phase}</p>
          <p className="text-secondary text-sm">{illumination}% illuminated</p>
        </div>
      </div>
      <p className="text-muted text-sm italic">{energy}</p>
    </div>
  );
}
