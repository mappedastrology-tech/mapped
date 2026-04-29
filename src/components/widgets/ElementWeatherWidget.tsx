"use client";

import { useEffect, useState } from "react";
import { getDailyEnergy } from "@/lib/celestialCalendar";

interface ElementWeather {
  element: "fire" | "water" | "earth" | "air";
  description: string;
  emoji: string;
}

const ELEMENT_INFO: Record<string, { emoji: string; description: string }> = {
  fire: {
    emoji: "🔥",
    description: "Action, passion, and inspiration. A day for boldness and igniting your passions.",
  },
  water: {
    emoji: "💧",
    description: "Emotion, intuition, and flow. A day for depth, healing, and going with the current.",
  },
  earth: {
    emoji: "🌍",
    description: "Grounding, stability, and manifestation. A day for practical action and building.",
  },
  air: {
    emoji: "💨",
    description: "Communication, thought, and clarity. A day for ideas, connection, and curiosity.",
  },
};

export default function ElementWeatherWidget() {
  const [weather, setWeather] = useState<ElementWeather | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const energy = getDailyEnergy(new Date());
    const element = energy.element;
    const info = ELEMENT_INFO[element];

    setWeather({
      element,
      emoji: info.emoji,
      description: info.description,
    });
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="rounded-xl bg-card/50 border border-foreground/15 p-4 flex items-center justify-center h-[120px]">
        <div className="w-4 h-4 border-2 border-terracotta/30 border-t-terracotta rounded-full animate-spin" />
      </div>
    );
  }

  if (!weather) return null;

  return (
    <div className="rounded-xl bg-card/50 border border-foreground/15 p-4">
      <p className="text-xs uppercase tracking-widest text-terracotta/70 mb-2">
        🔥 Elemental Weather
      </p>
      <div className="flex items-start gap-2">
        <span className="text-2xl">{weather.emoji}</span>
        <div className="flex-1">
          <p className="text-foreground font-medium text-sm capitalize mb-1">{weather.element}</p>
          <p className="text-foreground/60 text-xs leading-relaxed">{weather.description}</p>
        </div>
      </div>
    </div>
  );
}
