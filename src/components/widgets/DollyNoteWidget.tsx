"use client";

import { useState, useEffect } from "react";

const DOLLY_NOTES = [
  "You're allowed to take up space today.",
  "Not everything needs to be figured out right now.",
  "Trust the timing of your own life.",
  "Your sensitivity is a superpower, not a weakness.",
  "Rest is productive. Your body knows this even when your mind forgets.",
  "You don't have to earn the right to be gentle with yourself.",
  "The fact that you're still trying says more than you think.",
  "Some things are meant to be felt, not fixed.",
  "You're not behind. You're on your own timeline.",
  "The version of you that's scared is also the version of you that's brave.",
  "Let go of the idea that you need permission to change.",
  "You are the only one who gets to define what enough looks like for you.",
  "Not every thought you have is true. Be choosy about which ones you believe.",
  "The thing you're avoiding? It's probably smaller than it feels.",
  "You contain more tenderness than you give yourself credit for.",
  "Today doesn't have to be everything. It just has to be today.",
  "Your worth isn't tied to your output.",
  "Breathe. You've survived every hard day so far.",
  "It's okay to want things that are soft and uncomplicated.",
  "The stars didn't make you who you are. They just recognized you.",
];

export default function DollyNoteWidget() {
  const [visible, setVisible] = useState(false);

  // Pick the daily note once per mount (lazy init keeps Date.now() out of render).
  const [note] = useState(() => {
    const day = Math.floor(Date.now() / 86400000);
    return DOLLY_NOTES[day % DOLLY_NOTES.length];
  });

  useEffect(() => {
    setVisible(true);
  }, []);

  return (
    <div
      className="rounded-xl p-5 transition-opacity duration-700"
      style={{
        backgroundColor: "var(--background-card)",
        border: "1px solid var(--border-card)",
        opacity: visible ? 1 : 0,
      }}
    >
      <p
        className="text-[10px] uppercase tracking-[0.15em] font-bold mb-3"
        style={{ color: "var(--terracotta)" }}
      >
        ✦ Dolly&apos;s Note
      </p>
      <p
        className="text-[15px] leading-relaxed italic"
        style={{ fontFamily: "var(--font-ui)", color: "var(--foreground)" }}
      >
        &ldquo;{note}&rdquo;
      </p>
    </div>
  );
}
