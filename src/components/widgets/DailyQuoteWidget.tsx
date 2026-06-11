"use client";

import { useEffect, useState } from "react";
import { getDailyQuote } from "@/lib/dailyQuote";

export default function DailyQuoteWidget() {
  const [quote, setQuote] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const result = getDailyQuote(new Date());
    setQuote(result.quote.text);
    setReason(result.reason);
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="rounded-xl bg-card/50 border border-foreground/15 p-6 flex items-center justify-center min-h-[160px]">
        <div className="w-5 h-5 border-2 border-terracotta/30 border-t-terracotta rounded-full animate-spin" role="status" aria-label="Loading" />
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-card/50 border border-foreground/15 p-6">
      <p className="text-xs uppercase tracking-widest text-terracotta/70 mb-4">
        ✦ Daily Phrase
      </p>
      <p
        className="text-foreground text-lg leading-relaxed italic mb-3"
        style={{ fontFamily: "var(--font-display)" }}
      >
        &ldquo;{quote}&rdquo;
      </p>
      <p className="text-muted text-xs uppercase tracking-[0.15em]">{reason}</p>
    </div>
  );
}
