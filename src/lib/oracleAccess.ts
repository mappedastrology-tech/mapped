"use client";

/**
 * Which oracle decks an account may actually use.
 *
 * Oracle decks are owned, not universal: every account picks one free, and the
 * rest are bought. So the list of decks a user can choose between is their
 * purchases, not the catalog — and it grows as they buy more.
 *
 * This exists because the saved preference used to be validated against
 * ORACLE_DECKS (everything that exists) rather than against what the account
 * owns. Left alone, a user whose free pick was the Bird Oracle would still have
 * "stitched-animal" as their stored default and pull daily cards from a deck
 * they had never bought.
 *
 * The preference lives in two places on purpose, and this hook keeps that
 * detail in one file: localStorage for an instant first paint, and the synced
 * `oracle-deck` account setting so the choice follows you between devices.
 */

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ORACLE_DECKS, ORACLE_DECK_KEY, type OracleDeckInfo } from "@/lib/oracleDecks";
import { fetchSetting, saveSetting } from "@/lib/syncedSettings";
import { fetchDeckEntitlements } from "@/lib/freeDeck";

export interface OracleAccess {
  /** Owned decks, in catalog order. Empty until the free pick is spent. */
  decks: OracleDeckInfo[];
  /** The deck to pull from: the stored preference if still owned, else the
   *  first owned deck, else null when the account owns none. */
  activeId: string | null;
  /** False once ownership has been read, so callers can hold off rendering. */
  loading: boolean;
  /** Persist a new choice. Ignores decks the account does not own. */
  choose: (id: string) => void;
}

export function useOracleAccess(): OracleAccess {
  const [decks, setDecks] = useState<OracleDeckInfo[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession().catch(() => ({ data: { session: null } }));
      const uid = session?.user?.id ?? null;
      if (!cancelled) setUserId(uid);

      const { owned } = await fetchDeckEntitlements();
      const ownedDecks = ORACLE_DECKS.filter((d) => owned.has(d.id));

      // Preference order: the synced account setting, then this device's
      // localStorage, then whatever they own. Each is only honoured if the deck
      // is still owned — a stored id is a preference, not an entitlement.
      let preferred: string | null = null;
      if (uid) {
        const acct = await fetchSetting(uid, "oracle-deck").catch(() => null);
        if (acct && owned.has(acct)) preferred = acct;
      }
      if (!preferred) {
        try {
          const local = localStorage.getItem(ORACLE_DECK_KEY);
          if (local && owned.has(local)) preferred = local;
        } catch { /* storage unavailable */ }
      }

      if (cancelled) return;
      setDecks(ownedDecks);
      setActiveId(preferred ?? ownedDecks[0]?.id ?? null);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const choose = useCallback((id: string) => {
    if (!decks.some((d) => d.id === id)) return;
    setActiveId(id);
    try { localStorage.setItem(ORACLE_DECK_KEY, id); } catch { /* ignore */ }
    if (userId) saveSetting(userId, "oracle-deck", id);
  }, [decks, userId]);

  return { decks, activeId, loading, choose };
}
