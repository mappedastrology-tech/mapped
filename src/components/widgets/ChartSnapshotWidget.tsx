"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface ChartData {
  sunSign: string;
  moonSign: string;
  risingSign: string;
}

export default function ChartSnapshotWidget() {
  const router = useRouter();
  const [chart, setChart] = useState<ChartData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = sessionStorage.getItem("chartResult");
    if (stored) {
      const data = JSON.parse(stored);
      setChart({
        sunSign: data.sunSign || "Unknown",
        moonSign: data.moonSign || "Unknown",
        risingSign: data.risingSign || "Unknown",
      });
    }
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="rounded-xl bg-card/50 border border-foreground/15 p-6 flex items-center justify-center h-[180px]">
        <div className="w-5 h-5 border-2 border-amber/30 border-t-amber rounded-full animate-spin" />
      </div>
    );
  }

  if (!chart) {
    return (
      <div className="rounded-xl bg-card/50 border border-foreground/15 p-6">
        <p className="text-xs uppercase tracking-widest text-amber/70 mb-4">
          🌀 Birth Chart
        </p>
        <p className="text-foreground/60 text-sm mb-4">
          Calculate your birth chart to see your big three and current transits.
        </p>
        <button
          onClick={() => router.push("/chart/new")}
          className="px-4 py-2 rounded-lg bg-terracotta/20 text-terracotta hover:bg-terracotta/30 text-sm font-medium transition-colors"
        >
          Calculate chart →
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-card/50 border border-foreground/15 p-6">
      <p className="text-xs uppercase tracking-widest text-amber/70 mb-4">
        🌀 Birth Chart
      </p>
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-4 bg-foreground/5 rounded-lg">
          <p className="text-foreground/50 text-xs uppercase mb-1">Sun</p>
          <p className="text-foreground font-medium">{chart.sunSign}</p>
        </div>
        <div className="text-center p-4 bg-foreground/5 rounded-lg">
          <p className="text-foreground/50 text-xs uppercase mb-1">Moon</p>
          <p className="text-foreground font-medium">{chart.moonSign}</p>
        </div>
        <div className="text-center p-4 bg-foreground/5 rounded-lg">
          <p className="text-foreground/50 text-xs uppercase mb-1">Rising</p>
          <p className="text-foreground font-medium">{chart.risingSign}</p>
        </div>
      </div>
      <button
        onClick={() => router.push("/chart/new")}
        className="text-terracotta hover:text-terracotta-light text-sm mt-4 transition-colors"
      >
        Recalculate chart →
      </button>
    </div>
  );
}
