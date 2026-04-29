"use client";

import { useEffect, useState } from "react";
import { getCurrentNakshatra } from "@/lib/celestialCalendar";

interface Nakshatra {
  name: string;
  deity: string;
  quality: string;
  brief: string;
}

export default function NakshatraWidget() {
  const [nakshatra, setNakshatra] = useState<Nakshatra | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const nakshatraData = getCurrentNakshatra(new Date());
    setNakshatra({
      name: nakshatraData.name,
      deity: nakshatraData.deity,
      quality: nakshatraData.quality,
      brief: nakshatraData.brief,
    });
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="rounded-xl bg-card/50 border border-foreground/15 p-4 flex items-center justify-center h-[120px]">
        <div className="w-4 h-4 border-2 border-sage/30 border-t-sage rounded-full animate-spin" />
      </div>
    );
  }

  if (!nakshatra) return null;

  return (
    <div className="rounded-xl bg-card/50 border border-foreground/15 p-4">
      <p className="text-xs uppercase tracking-widest text-sage/70 mb-2">
        ⭐ Nakshatra
      </p>
      <p className="text-foreground font-medium text-sm mb-1">{nakshatra.name}</p>
      <p className="text-foreground/50 text-xs mb-2">{nakshatra.deity}</p>
      <p className="text-foreground/60 text-xs leading-relaxed">{nakshatra.brief}</p>
    </div>
  );
}
