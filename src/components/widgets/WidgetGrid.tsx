"use client";

import dynamic from "next/dynamic";
import { getWidgetConfig } from "@/lib/widgets";
import type { WidgetPreference } from "@/lib/widgets";

// Dynamically import all widget components
const DailyQuoteWidget = dynamic(() => import("./DailyQuoteWidget"), {
  loading: () => <div className="rounded-xl bg-card/50 border border-foreground/15 p-6 h-40" />,
});

const MoonPhaseWidget = dynamic(() => import("./MoonPhaseWidget"), {
  loading: () => <div className="rounded-xl bg-card/50 border border-foreground/15 p-6 h-40" />,
});

const TodaysRitualWidget = dynamic(() => import("./TodaysRitualWidget"), {
  loading: () => <div className="rounded-xl bg-card/50 border border-foreground/15 p-6 h-40" />,
});

const UpcomingEventsWidget = dynamic(() => import("./UpcomingEventsWidget"), {
  loading: () => <div className="rounded-xl bg-card/50 border border-foreground/15 p-6 h-40" />,
});

const TarotDailyWidget = dynamic(() => import("./TarotDailyWidget"), {
  loading: () => <div className="rounded-xl bg-card/50 border border-foreground/15 p-6 h-48" />,
});

const NakshatraWidget = dynamic(() => import("./NakshatraWidget"), {
  loading: () => <div className="rounded-xl bg-card/50 border border-foreground/15 p-4 h-32" />,
});

const PlanetaryHourWidget = dynamic(() => import("./PlanetaryHourWidget"), {
  loading: () => <div className="rounded-xl bg-card/50 border border-foreground/15 p-4 h-32" />,
});

const ElementWeatherWidget = dynamic(() => import("./ElementWeatherWidget"), {
  loading: () => <div className="rounded-xl bg-card/50 border border-foreground/15 p-4 h-32" />,
});

const AlmanacTipWidget = dynamic(() => import("./AlmanacTipWidget"), {
  loading: () => <div className="rounded-xl bg-card/50 border border-foreground/15 p-6 h-40" />,
});

const ChartSnapshotWidget = dynamic(() => import("./ChartSnapshotWidget"), {
  loading: () => <div className="rounded-xl bg-card/50 border border-foreground/15 p-6 h-48" />,
});

const DollyNoteWidget = dynamic(() => import("./DollyNoteWidget"), {
  loading: () => <div className="rounded-xl bg-card/50 border border-foreground/15 p-6 h-40" />,
});

const WIDGET_COMPONENTS: Record<string, React.ComponentType> = {
  "daily-quote": DailyQuoteWidget,
  "moon-phase": MoonPhaseWidget,
  "todays-ritual": TodaysRitualWidget,
  "upcoming-events": UpcomingEventsWidget,
  "tarot-daily": TarotDailyWidget,
  nakshatra: NakshatraWidget,
  "planetary-hour": PlanetaryHourWidget,
  "element-weather": ElementWeatherWidget,
  "almanac-tip": AlmanacTipWidget,
  "chart-snapshot": ChartSnapshotWidget,
  "dolly-note": DollyNoteWidget,
};

interface Props {
  preferences: WidgetPreference[];
}

export default function WidgetGrid({ preferences }: Props) {
  const enabledIds = preferences.filter((p) => p.enabled).map((p) => p.id);

  return (
    <div className="space-y-4">
      {/* Two-column grid for small widgets */}
      <div className="grid grid-cols-2 gap-4">
        {enabledIds.map((id) => {
          const config = getWidgetConfig(id);
          if (!config) return null;

          if (config.size === "small") {
            const Component = WIDGET_COMPONENTS[id];
            if (!Component) return null;
            return (
              <div key={id}>
                <Component />
              </div>
            );
          }
          return null;
        })}
      </div>

      {/* Full-width for medium and large */}
      <div className="space-y-4">
        {enabledIds.map((id) => {
          const config = getWidgetConfig(id);
          if (!config) return null;

          if (config.size === "medium" || config.size === "large") {
            const Component = WIDGET_COMPONENTS[id];
            if (!Component) return null;
            return (
              <div key={id}>
                <Component />
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
}
