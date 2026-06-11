"use client";

import { useEffect, useState } from "react";
import { getDailyEnergy } from "@/lib/celestialCalendar";

interface Event {
  name: string;
  daysUntil: number;
  tradition: string;
}

export default function UpcomingEventsWidget() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const energy = getDailyEnergy(new Date());
    const upcoming = energy.upcomingEvents.slice(0, 3).map((event) => {
      const today = new Date();
      const eventDate = new Date(event.date);
      const diffTime = eventDate.getTime() - today.getTime();
      const daysUntil = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return {
        name: event.name,
        daysUntil: Math.max(0, daysUntil),
        tradition: event.tradition,
      };
    });

    setEvents(upcoming);
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
        📅 Upcoming Events
      </p>
      <div className="space-y-3">
        {events.map((event, idx) => (
          <div key={idx}>
            {idx > 0 && <div className="h-px bg-foreground/5 mb-3" />}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-foreground text-sm font-medium">{event.name}</p>
                <p className="text-muted text-xs capitalize">
                  {event.tradition} tradition
                </p>
              </div>
              <span className="text-muted text-xs whitespace-nowrap ml-2">
                {event.daysUntil === 0
                  ? "Today"
                  : event.daysUntil === 1
                    ? "Tomorrow"
                    : `In ${event.daysUntil} days`}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
