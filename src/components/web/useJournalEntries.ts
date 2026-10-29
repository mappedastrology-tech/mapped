"use client";

/**
 * The signed-in person's journal, for the desktop Journal and Today pages —
 * the same source as the mobile Journal: remote entries are pulled and merged
 * into localStorage first (a no-op offline or signed out), then read back.
 *
 * `streak` counts journal entries and tarot pulls together, exactly like the
 * mobile Journal header, via lib/journalStreak.
 */

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getLocalEntries, pullJournalEntries, type JournalEntry } from "@/lib/journal";
import { getTarotHistoryKey } from "@/lib/completionSync";
import { journalStreak, entryDate } from "@/lib/journalStreak";

function tarotPullDates(userId: string | null): Date[] {
  try {
    const raw = localStorage.getItem(getTarotHistoryKey(userId));
    const pulls = raw ? (JSON.parse(raw) as { date?: string }[]) : [];
    return pulls.map((p) => new Date(p.date || NaN));
  } catch {
    return [];
  }
}

export function useJournalEntries() {
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [pullDates, setPullDates] = useState<Date[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      let userId: string | null = null;
      try {
        const { data: { session } } = await supabase.auth.getSession();
        userId = session?.user?.id ?? null;
        if (userId) await pullJournalEntries(userId);
      } catch { /* offline — the local copy is still the journal */ }
      if (cancelled) return;
      setEntries(getLocalEntries());
      setPullDates(tarotPullDates(userId));
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  /** After a save on this screen: re-read the local journal. */
  const refresh = useCallback(() => setEntries(getLocalEntries()), []);

  const streak = journalStreak([...entries.map(entryDate), ...pullDates]);
  return { loading, entries, streak, refresh };
}
