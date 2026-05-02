"use client";

import { useEffect, useState } from "react";
import { PLANETARY_DAYS } from "@/lib/celestialCalendar";

interface PlanetaryHour {
  planet: string;
  energy: string;
  focus: string;
}

export default function PlanetaryHourWidget() {
  const [hour, setHour] = useState<PlanetaryHour | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simple calculation: divide day into 12 daytime hours (6am-6pm) and 12 nighttime
    const now = new Date();
    const hour24 = now.getHours();
    const minutes = now.getMinutes();
    const timeOfDay = hour24 + minutes / 60;

    let hourIndex: number;

    // Daytime (6am-6pm)
    if (timeOfDay >= 6 && timeOfDay < 18) {
      const minutesSinceSunrise = (timeOfDay - 6) * 60;
      const hoursSinceSunrise = minutesSinceSunrise / 60;
      hourIndex = Math.floor(hoursSinceSunrise);
    }
    // Nighttime (6pm-6am)
    else {
      const minutesSinceSunset = (timeOfDay < 6 ? timeOfDay + 24 - 18 : timeOfDay - 18) * 60;
      const hoursSinceSunset = minutesSinceSunset / 60;
      hourIndex = 12 + Math.floor(hoursSinceSunset);
    }

    // Chaldean order: Saturn, Jupiter, Mars, Sun, Venus, Mercury, Moon
    // Each day's first hour is ruled by the day's planet.
    // The sequence then continues through the Chaldean order.
    // PLANETARY_DAYS indices: 0=Sun, 1=Moon, 2=Mars, 3=Mercury, 4=Jupiter, 5=Venus, 6=Saturn
    const chaldeanSequence = [6, 4, 2, 0, 5, 3, 1]; // PLANETARY_DAYS indices in Chaldean order
    const dayOfWeek = now.getDay();

    // Find where this day's planet sits in the Chaldean sequence
    // dayOfWeek: 0=Sun,1=Mon,2=Tue,3=Wed,4=Thu,5=Fri,6=Sat → PLANETARY_DAYS index is same
    const dayPlanetIndex = dayOfWeek; // Sun=0, Moon=1, Mars=2, etc.
    const startPos = chaldeanSequence.indexOf(dayPlanetIndex);
    // Walk hourIndex steps through the Chaldean sequence
    const planetIndex = chaldeanSequence[(startPos + hourIndex) % 7];

    const planetaryDay = PLANETARY_DAYS[planetIndex];

    setHour({
      planet: planetaryDay.planet,
      energy: planetaryDay.energy,
      focus: planetaryDay.focus,
    });
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="rounded-xl bg-card/50 border border-foreground/15 p-4 flex items-center justify-center h-[120px]">
        <div className="w-4 h-4 border-2 border-amber/30 border-t-amber rounded-full animate-spin" />
      </div>
    );
  }

  if (!hour) return null;

  return (
    <div className="rounded-xl bg-card/50 border border-foreground/15 p-4">
      <p className="text-xs uppercase tracking-widest text-amber/70 mb-2">
        ☿ Planetary Hour
      </p>
      <p className="text-foreground font-medium text-sm mb-1">{hour.planet}</p>
      <p className="text-foreground/60 text-xs leading-relaxed">{hour.focus}</p>
    </div>
  );
}
