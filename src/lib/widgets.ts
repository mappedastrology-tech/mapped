/**
 * Widget System for Home Tab
 *
 * Manages widget registration, user preferences (enabled/order), and storage.
 * Each widget is self-contained and fetches its own data.
 */

export interface WidgetConfig {
  id: string;
  name: string;
  description: string;
  icon: string; // emoji
  defaultEnabled: boolean;
  defaultOrder: number;
  size: "small" | "medium" | "large"; // small=half width, medium=full width compact, large=full width tall
}

export interface WidgetPreference {
  id: string;
  enabled: boolean;
}

export const WIDGET_REGISTRY: WidgetConfig[] = [
  {
    id: "daily-quote",
    name: "Daily Quote",
    description: "Transit-matched quote of the day",
    icon: "💬",
    defaultEnabled: false,
    defaultOrder: 0,
    size: "medium",
  },
  {
    id: "moon-phase",
    name: "Moon Phase",
    description: "Current phase with almanac tip",
    icon: "🌙",
    defaultEnabled: false,
    defaultOrder: 1,
    size: "medium",
  },
  {
    id: "todays-ritual",
    name: "Today's Ritual",
    description: "Featured ritual for today",
    icon: "✦",
    defaultEnabled: false,
    defaultOrder: 2,
    size: "medium",
  },
  {
    id: "upcoming-events",
    name: "Upcoming Events",
    description: "Next celestial events",
    icon: "📅",
    defaultEnabled: false,
    defaultOrder: 3,
    size: "medium",
  },
  {
    id: "tarot-daily",
    name: "Card of the Day",
    description: "Pull a tarot or oracle card",
    icon: "🃏",
    defaultEnabled: false,
    defaultOrder: 4,
    size: "medium",
  },
  {
    id: "nakshatra",
    name: "Nakshatra",
    description: "Today's Vedic lunar mansion",
    icon: "⭐",
    defaultEnabled: false,
    defaultOrder: 5,
    size: "small",
  },
  {
    id: "planetary-hour",
    name: "Planetary Hour",
    description: "Current planetary ruler",
    icon: "☿",
    defaultEnabled: false,
    defaultOrder: 6,
    size: "small",
  },
  {
    id: "element-weather",
    name: "Elemental Weather",
    description: "Today's dominant element",
    icon: "🔥",
    defaultEnabled: false,
    defaultOrder: 7,
    size: "small",
  },
  {
    id: "almanac-tip",
    name: "Almanac Tip",
    description: "Life tip from the current moon phase",
    icon: "🌾",
    defaultEnabled: false,
    defaultOrder: 8,
    size: "medium",
  },
  {
    id: "chart-snapshot",
    name: "Birth Chart",
    description: "Your big three and current transits",
    icon: "🌀",
    defaultEnabled: false,
    defaultOrder: 9,
    size: "large",
  },
  {
    id: "dolly-note",
    name: "Dolly's Note",
    description: "A daily message from your cosmic guide",
    icon: "✨",
    defaultEnabled: false,
    defaultOrder: 10,
    size: "medium",
  },
];

const WIDGET_ORDER_KEY = "mapped:widget-order";

export function getDefaultWidgetOrder(): WidgetPreference[] {
  return WIDGET_REGISTRY.map((w) => ({
    id: w.id,
    enabled: w.defaultEnabled,
  }));
}

export function loadWidgetOrder(): WidgetPreference[] {
  if (typeof window === "undefined") {
    return getDefaultWidgetOrder();
  }

  try {
    const stored = localStorage.getItem(WIDGET_ORDER_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as WidgetPreference[];
      // Ensure all widgets are in the list (in case new ones were added)
      const registeredIds = new Set(WIDGET_REGISTRY.map((w) => w.id));
      const result = [...parsed];
      for (const widget of WIDGET_REGISTRY) {
        if (!result.find((p) => p.id === widget.id)) {
          result.push({ id: widget.id, enabled: widget.defaultEnabled });
        }
      }
      return result;
    }
  } catch (error) {
    console.error("Failed to load widget order from localStorage:", error);
  }

  return getDefaultWidgetOrder();
}

export function saveWidgetOrder(order: WidgetPreference[]): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem(WIDGET_ORDER_KEY, JSON.stringify(order));
  } catch (error) {
    console.error("Failed to save widget order to localStorage:", error);
  }
}

export function getWidgetConfig(id: string): WidgetConfig | undefined {
  return WIDGET_REGISTRY.find((w) => w.id === id);
}

export function getEnabledWidgetIds(preferences: WidgetPreference[]): string[] {
  return preferences.filter((p) => p.enabled).map((p) => p.id);
}

export function reorderWidgets(
  preferences: WidgetPreference[],
  fromIndex: number,
  toIndex: number
): WidgetPreference[] {
  const result = [...preferences];
  const [moved] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, moved);
  return result;
}
