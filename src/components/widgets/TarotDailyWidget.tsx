"use client";

import { useEffect, useState } from "react";
import { ALL_CARDS } from "@/lib/tarot";

interface Card {
  name: string;
  meaning: string;
}

export default function TarotDailyWidget() {
  const [card, setCard] = useState<Card | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Deterministic seed based on date
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const day = today.getDate();
    const seed = ((year * 367 + month * 31 + day * 13) * 2654435761) >>> 0;

    // Pick a card based on seed
    const cardIndex = seed % ALL_CARDS.length;
    const tarotCard = ALL_CARDS[cardIndex];

    setCard({
      name: tarotCard.name,
      meaning: tarotCard.uprightMeaning,
    });
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="rounded-xl bg-card/50 border border-foreground/15 p-6 flex items-center justify-center min-h-[180px]">
        <div className="w-5 h-5 border-2 border-terracotta/30 border-t-terracotta rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-card/50 border border-foreground/15 p-6">
      <p className="text-xs uppercase tracking-widest text-terracotta/70 mb-4">
        🃏 Card of the Day
      </p>

      {!revealed ? (
        <button
          onClick={() => setRevealed(true)}
          className="w-full flex items-center justify-center aspect-[2/3] rounded-lg bg-gradient-to-br from-terracotta/20 to-amber/20 border border-terracotta/30 hover:border-terracotta/60 transition-all cursor-pointer mb-4 text-4xl"
        >
          🂠
        </button>
      ) : card ? (
        <div className="space-y-3">
          <div className="text-center p-4 bg-foreground/5 rounded-lg">
            <p className="text-foreground font-medium text-lg">{card.name}</p>
          </div>
          <p className="text-foreground/60 text-sm leading-relaxed">{card.meaning}</p>
          <button
            onClick={() => setRevealed(false)}
            className="text-terracotta hover:text-terracotta-light text-sm transition-colors"
          >
            Draw again →
          </button>
        </div>
      ) : null}
    </div>
  );
}
