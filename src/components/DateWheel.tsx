"use client";

/**
 * DateWheel — vertical scroll picker (iOS-style drum roller).
 *
 * Three columns: Month / Day / Year — each scrolls vertically.
 * The center row is the selected value, items above/below fade out.
 * Snap-scrolls to the nearest item on release.
 */

import { useRef, useEffect, useCallback, useState } from "react";

interface DateWheelProps {
  selectedDate: string; // "YYYY-MM-DD"
  onChange: (date: string) => void;
}

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const ITEM_HEIGHT = 40; // px per row
const VISIBLE_ITEMS = 5; // show 5 rows (2 above, center, 2 below)

function daysInMonth(month: number, year: number): number {
  return new Date(year, month, 0).getDate();
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

/* ─── Single scroll column ─── */
function WheelColumn({
  items,
  selectedIndex,
  onSelect,
  renderItem,
}: {
  items: number[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  renderItem: (value: number, isSelected: boolean) => React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isScrolling = useRef(false);
  const scrollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Scroll to selected index on mount / when it changes externally
  useEffect(() => {
    const el = ref.current;
    if (!el || isScrolling.current) return;
    el.scrollTop = selectedIndex * ITEM_HEIGHT;
  }, [selectedIndex]);

  const handleScroll = useCallback(() => {
    isScrolling.current = true;
    if (scrollTimer.current) clearTimeout(scrollTimer.current);
    scrollTimer.current = setTimeout(() => {
      const el = ref.current;
      if (!el) return;
      const idx = clamp(Math.round(el.scrollTop / ITEM_HEIGHT), 0, items.length - 1);
      // Snap
      el.scrollTo({ top: idx * ITEM_HEIGHT, behavior: "smooth" });
      isScrolling.current = false;
      if (idx !== selectedIndex) onSelect(idx);
    }, 80);
  }, [items.length, selectedIndex, onSelect]);

  const wheelHeight = VISIBLE_ITEMS * ITEM_HEIGHT;
  const padTop = Math.floor(VISIBLE_ITEMS / 2) * ITEM_HEIGHT;

  return (
    <div className="relative" style={{ height: wheelHeight }}>
      {/* Selection highlight bar */}
      <div
        className="absolute left-0 right-0 rounded-lg bg-terracotta/12 border-y border-terracotta/20 pointer-events-none z-10"
        style={{ top: padTop, height: ITEM_HEIGHT }}
      />
      {/* Fade overlays */}
      <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-surface to-transparent pointer-events-none z-20" />
      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-surface to-transparent pointer-events-none z-20" />

      <div
        ref={ref}
        onScroll={handleScroll}
        className="h-full overflow-y-auto scrollbar-hide"
        style={{
          scrollSnapType: "y mandatory",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {/* Top padding */}
        <div style={{ height: padTop }} />
        {items.map((val, i) => {
          const isSelected = i === selectedIndex;
          return (
            <div
              key={`${val}-${i}`}
              className="flex items-center justify-center cursor-pointer"
              style={{
                height: ITEM_HEIGHT,
                scrollSnapAlign: "start",
              }}
              onClick={() => {
                onSelect(i);
                ref.current?.scrollTo({ top: i * ITEM_HEIGHT, behavior: "smooth" });
              }}
            >
              {renderItem(val, isSelected)}
            </div>
          );
        })}
        {/* Bottom padding */}
        <div style={{ height: padTop }} />
      </div>
    </div>
  );
}

/* ─── Main DateWheel ─── */
export default function DateWheel({ selectedDate, onChange }: DateWheelProps) {
  const [y, m, d] = selectedDate.split("-").map(Number);
  const [showWheel, setShowWheel] = useState(false);

  const todayStr = new Date().toISOString().split("T")[0];
  const isToday = selectedDate === todayStr;

  // Ranges
  const years = Array.from({ length: 11 }, (_, i) => new Date().getFullYear() - 5 + i); // ±5 years
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const maxDay = daysInMonth(m, y);
  const days = Array.from({ length: maxDay }, (_, i) => i + 1);

  const yearIdx = years.indexOf(y);
  const monthIdx = m - 1;
  const dayIdx = clamp(d - 1, 0, maxDay - 1);

  const buildDate = useCallback(
    (newY?: number, newM?: number, newD?: number) => {
      const fy = newY ?? y;
      const fm = newM ?? m;
      const fd = newD ?? d;
      const maxD = daysInMonth(fm, fy);
      const clampedD = clamp(fd, 1, maxD);
      const str = `${fy}-${String(fm).padStart(2, "0")}-${String(clampedD).padStart(2, "0")}`;
      onChange(str);
    },
    [y, m, d, onChange]
  );

  // Format the display label
  const dayOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const dateObj = new Date(selectedDate + "T12:00:00");
  const displayLabel = isToday
    ? "Today"
    : `${dayOfWeek[dateObj.getDay()]}, ${MONTHS[m - 1]} ${d}, ${y}`;

  return (
    <div className="mb-4">
      {/* Compact date bar — tap to open/close wheel */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowWheel(!showWheel)}
          className="flex items-center gap-2 text-foreground text-sm font-medium py-2"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-terracotta/60">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <path d="M16 2v4M8 2v4M3 10h18" />
          </svg>
          {displayLabel}
          <svg
            width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            className={`text-foreground/30 transition-transform duration-200 ${showWheel ? "rotate-180" : ""}`}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {!isToday && (
          <button
            onClick={() => { onChange(todayStr); setShowWheel(false); }}
            className="text-terracotta text-xs font-medium py-2 px-2"
          >
            Today
          </button>
        )}
      </div>

      {/* Expandable wheel picker */}
      {showWheel && (
        <div className="rounded-xl border border-foreground/15 bg-surface overflow-hidden mt-1 mb-2">
          <div className="flex justify-center gap-2 px-4 py-3">
            {/* Month column */}
            <div className="flex-1 max-w-[100px]">
              <WheelColumn
                items={months}
                selectedIndex={monthIdx}
                onSelect={(i) => buildDate(undefined, i + 1)}
                renderItem={(val, sel) => (
                  <span className={`text-sm font-medium transition-all ${sel ? "text-foreground scale-105" : "text-foreground/30"}`}>
                    {MONTHS[val - 1]}
                  </span>
                )}
              />
            </div>

            {/* Day column */}
            <div className="flex-1 max-w-[60px]">
              <WheelColumn
                items={days}
                selectedIndex={dayIdx}
                onSelect={(i) => buildDate(undefined, undefined, i + 1)}
                renderItem={(val, sel) => (
                  <span className={`text-sm font-medium transition-all ${sel ? "text-foreground scale-105" : "text-foreground/30"}`}>
                    {val}
                  </span>
                )}
              />
            </div>

            {/* Year column */}
            <div className="flex-1 max-w-[70px]">
              <WheelColumn
                items={years}
                selectedIndex={yearIdx >= 0 ? yearIdx : 5}
                onSelect={(i) => buildDate(years[i])}
                renderItem={(val, sel) => (
                  <span className={`text-sm font-medium transition-all ${sel ? "text-foreground scale-105" : "text-foreground/30"}`}>
                    {val}
                  </span>
                )}
              />
            </div>
          </div>

          {/* Done button */}
          <button
            onClick={() => setShowWheel(false)}
            className="w-full py-2.5 text-terracotta text-xs font-medium border-t border-foreground/15"
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
}
