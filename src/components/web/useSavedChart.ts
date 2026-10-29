"use client";

/**
 * The signed-in person's own chart and name, for the desktop web screens.
 *
 * The desktop Today page used to read only sessionStorage, which is per tab, so
 * on any fresh desktop tab it fell back to the design prototype's sample chart
 * ("Sun Cancer · Moon Pisces · Leo rising") and showed it to real people. This
 * reads the saved `charts` row first, exactly as WebDolly and the mobile Home
 * do, and only falls back to a chart built in this tab before signing up.
 *
 * The state is explicit — loading / none / ready — so a screen can show an
 * honest "loading" or "no chart yet" instead of filling the gap with sample
 * values.
 */

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { firstNameOf } from "@/lib/greeting";

export interface BigThree { sun: string; moon: string; rising: string }

export type SavedChart =
  | { status: "loading" }
  | { status: "none"; userId: string | null; firstName: string | null }
  | {
      status: "ready";
      userId: string | null;
      firstName: string | null;
      /** The name on the chart (used for numerology), not necessarily the account name. */
      chartName: string;
      bigThree: BigThree | null;
      /** "YYYY-MM-DD", when the chart has one. */
      birthDate: string | null;
    };

function validBigThree(b: unknown): BigThree | null {
  const v = b as Partial<BigThree> | null | undefined;
  return v?.sun && v?.moon && v?.rising ? { sun: v.sun, moon: v.moon, rising: v.rising } : null;
}

export function useSavedChart(): SavedChart {
  const [state, setState] = useState<SavedChart>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      let userId: string | null = null;
      let accountName: string | null = null;
      try {
        const { data: { session } } = await supabase.auth.getSession();
        userId = session?.user?.id ?? null;
        accountName = (session?.user?.user_metadata?.name as string | undefined) ?? null;
        if (userId) {
          const { data: row } = await supabase
            .from("charts")
            .select("name, big_three, birth_date")
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();
          if (row) {
            if (!cancelled) setState({
              status: "ready",
              userId,
              firstName: firstNameOf(accountName) ?? firstNameOf(row.name),
              chartName: row.name || accountName || "",
              bigThree: validBigThree(row.big_three),
              birthDate: row.birth_date ?? null,
            });
            return;
          }
        }
      } catch { /* unreachable — fall through to the tab's own chart, if any */ }

      // No saved chart: one built in this tab before signing up, if present.
      try {
        const raw = sessionStorage.getItem("chartResult");
        const p = raw ? JSON.parse(raw) : null;
        const bigThree = validBigThree(p?.bigThree || p?.big_three);
        if (bigThree) {
          if (!cancelled) setState({
            status: "ready",
            userId,
            firstName: firstNameOf(accountName) ?? firstNameOf(p?.name),
            chartName: p?.name || accountName || "",
            bigThree,
            birthDate: p?.birthDate || p?.birth_date || null,
          });
          return;
        }
      } catch { /* ignore */ }

      if (!cancelled) setState({ status: "none", userId, firstName: firstNameOf(accountName) });
    })();
    return () => { cancelled = true; };
  }, []);

  return state;
}
