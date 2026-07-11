"use client";

/**
 * Loads the user's real relationship connections (Supabase) and lays them out
 * as a constellation around "You", scoring each by elemental compatibility
 * between the two charts' Sun/Moon/rising. This is a lighter read than the
 * mobile app's full synastry engine, but it runs on real people and real
 * placements. Returns null until loaded (or when there's nothing to show), so
 * the page keeps its sample constellation as a graceful fallback.
 */

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const SKY_W = 2400, SKY_H = 1600;
const CENTER = { x: SKY_W / 2, y: SKY_H / 2 };

const ELEMENT: Record<string, "fire" | "earth" | "air" | "water"> = {
  Aries: "fire", Leo: "fire", Sagittarius: "fire",
  Taurus: "earth", Virgo: "earth", Capricorn: "earth",
  Gemini: "air", Libra: "air", Aquarius: "air",
  Cancer: "water", Scorpio: "water", Pisces: "water",
};
const ELEMENT_COLOR: Record<string, string> = { fire: "#b5654a", earth: "#7ba055", air: "#7d9cc0", water: "#5a8fb0" };

type BigThree = { sun: string; moon: string; rising: string };
export interface CPerson {
  id: string; name: string; initials: string; rel: string; x: number; y: number; color: string;
  score: number; connLabel: string; harm: number; chall: number; fated: number; signs: string; summary: string;
}
export interface Constellation { you: { signs: string; initials: string }; people: CPerson[] }

function affinity(a: string, b: string): 2 | 1 | 0 | -1 {
  const ea = ELEMENT[a], eb = ELEMENT[b];
  if (!ea || !eb) return 0;
  if (ea === eb) return 2; // same element — deep resonance
  const complement = (ea === "fire" && eb === "air") || (ea === "air" && eb === "fire") || (ea === "water" && eb === "earth") || (ea === "earth" && eb === "water");
  if (complement) return 1; // supportive
  const clash = (ea === "fire" && eb === "water") || (ea === "water" && eb === "fire") || (ea === "earth" && eb === "air") || (ea === "air" && eb === "earth");
  if (clash) return -1; // friction
  return 0;
}

function connLabel(score: number): string {
  if (score >= 88) return "Deeply woven";
  if (score >= 80) return "Easy & bright";
  if (score >= 72) return "Rooted";
  if (score >= 64) return "Complementary";
  return "Its own weather";
}

function summarize(you: BigThree, them: BigThree, name: string): string {
  const yourSunEl = ELEMENT[you.sun], theirSunEl = ELEMENT[them.sun];
  const a = affinity(you.sun, them.sun);
  if (a === 2) return `Two ${theirSunEl} Suns — ${name} meets you in the same register. Easy understanding, with a shared blind spot to watch for.`;
  if (a === 1) return `${cap(theirSunEl)} to your ${yourSunEl} — ${name} lifts and complements you. Different enough to keep it interesting, aligned enough to feel safe.`;
  if (a === -1) return `${cap(theirSunEl)} meets your ${yourSunEl} — a charged mix with ${name}. Real spark and real friction; it rewards patience and clear words.`;
  return `A quieter blend with ${name}. Neither pulls hard on the other — the connection is what you both choose to make of it.`;
}
function cap(s?: string) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : ""; }

function readUserBigThree(): BigThree | null {
  try {
    for (const key of ["chartResult", "mapped:chartData"]) {
      const raw = sessionStorage.getItem(key);
      if (!raw) continue;
      const p = JSON.parse(raw);
      const b = p?.bigThree || p?.big_three;
      if (b?.sun && b?.moon && b?.rising) return { sun: b.sun, moon: b.moon, rising: b.rising };
    }
  } catch { /* ignore */ }
  return null;
}

export function useConstellation(): Constellation | null {
  const [data, setData] = useState<Constellation | null>(null);
  useEffect(() => {
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;
        const you = readUserBigThree();
        if (!you) return; // can't score compatibility without the user's chart
        const { data: conns } = await supabase
          .from("connections").select("id,name,relationship,big_three")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: true });
        if (!conns || conns.length === 0) return;

        const scored = conns
          .filter((c: { big_three: BigThree | null }) => c.big_three?.sun)
          .map((c: { id: string; name: string; relationship: string | null; big_three: BigThree }) => {
            const t = c.big_three;
            // Sun weighs most, then Moon, then rising.
            const raw = affinity(you.sun, t.sun) * 3 + affinity(you.moon, t.moon) * 2 + affinity(you.rising, t.rising) * 1;
            // raw ranges roughly -6..12 → map to 55..95
            const score = Math.round(Math.max(55, Math.min(95, 74 + raw * 3.2)));
            const pos: number[] = [affinity(you.sun, t.sun), affinity(you.moon, t.moon), affinity(you.rising, t.rising)];
            const harm = Math.max(2, Math.min(8, 4 + pos.filter((v) => v > 0).reduce((s, v) => s + v, 0)));
            const chall = Math.max(1, Math.min(5, 1 + pos.filter((v) => v < 0).length * 2));
            const seed = c.id.split("").reduce((s, ch) => (s * 31 + ch.charCodeAt(0)) >>> 0, 7);
            const fated = 1 + (seed % 3);
            const el = ELEMENT[t.sun] || "air";
            return {
              conn: c, t, score, harm, chall, fated, color: ELEMENT_COLOR[el],
              summary: summarize(you, t, c.name?.split(" ")[0] || "they"),
            };
          })
          .sort((a, b) => b.score - a.score)
          .slice(0, 12);

        // Lay out around the center on a ring; higher score sits closer.
        const people: CPerson[] = scored.map((s, i) => {
          const angle = (i / scored.length) * Math.PI * 2 + 0.4;
          const radius = 640 - (s.score - 55) * 4; // 55→640px, 95→480px
          return {
            id: s.conn.id,
            name: s.conn.name || "Someone",
            initials: (s.conn.name || "?").trim().charAt(0).toUpperCase(),
            rel: s.conn.relationship || "Connection",
            x: Math.round(CENTER.x + Math.cos(angle) * radius),
            y: Math.round(CENTER.y + Math.sin(angle) * radius * 0.78),
            color: s.color,
            score: s.score,
            connLabel: connLabel(s.score),
            harm: s.harm, chall: s.chall, fated: s.fated,
            signs: `Sun ${s.t.sun} · Moon ${s.t.moon} · ${s.t.rising} rising`,
            summary: s.summary,
          };
        });

        setData({
          you: { signs: `Sun ${you.sun} · Moon ${you.moon} · ${you.rising} rising`, initials: "Y" },
          people,
        });
      } catch { /* keep sample fallback */ }
    })();
  }, []);
  return data;
}
