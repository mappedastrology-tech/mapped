"use client";

/**
 * What Dolly remembers about you — shown, and deletable.
 *
 * Mapped keeps one evolving free-text note per person in `dolly_memory`,
 * written by the AI from their own messages, so Dolly has continuity between
 * conversations. It is genuinely useful and it is also the most personal
 * thing the app stores: a description of someone's life, in someone else's
 * words, that they never wrote and never saw.
 *
 * Until now there was no way to read it, no way to delete it short of
 * deleting the whole account, and it was missing from the data export — so
 * "download everything we hold about you" did not include the one record that
 * was about them rather than about their chart. That is the gap this closes,
 * and it is what lets the privacy page say the memory can be seen and removed
 * without that being a lie.
 *
 * Deleting is not destructive in any way that needs a confirmation step: the
 * note rebuilds itself from the next few conversations. It is a reset, not a
 * loss, and the copy says so rather than staging a scary dialog.
 */

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Phase = "loading" | "ready" | "empty" | "error" | "clearing";

export default function DollyMemorySection() {
  const [phase, setPhase] = useState<Phase>("loading");
  const [summary, setSummary] = useState("");
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState("");

  const load = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { setPhase("empty"); return; }
      const { data, error } = await supabase
        .from("dolly_memory")
        .select("summary")
        .eq("user_id", session.user.id)
        .maybeSingle();
      // A missing table in a project that hasn't run the migration is not an
      // error worth showing anyone — there is simply nothing remembered.
      if (error) { setPhase("empty"); return; }
      const text = (data?.summary ?? "").trim();
      setSummary(text);
      setPhase(text ? "ready" : "empty");
    } catch {
      setPhase("error");
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const clear = useCallback(async () => {
    setPhase("clearing");
    setStatus("");
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error("signed out");
      const { error } = await supabase.from("dolly_memory").delete().eq("user_id", session.user.id);
      if (error) throw error;
      setSummary("");
      setPhase("empty");
      setOpen(false);
      setStatus("Forgotten. Dolly starts fresh from your next conversation.");
    } catch {
      setPhase("ready");
      setStatus("That didn't save. Please try again in a moment.");
    }
  }, []);

  // Nothing stored and nothing went wrong: say so rather than hiding the
  // section, so the answer to "what does it know about me?" is never silence.
  return (
    <div className="mt-4">
      <h2 className="text-sm font-medium text-foreground mb-1">What Dolly remembers</h2>
      <p className="text-muted text-xs leading-relaxed mb-2.5">
        So she can pick up where you left off, Dolly keeps a short note about what&rsquo;s going on in your life,
        written from your own messages. It&rsquo;s sent with each new conversation.
      </p>

      {phase === "loading" && (
        <p className="text-muted text-xs" role="status">Checking&hellip;</p>
      )}

      {phase === "error" && (
        <div className="flex items-center gap-3">
          <p className="text-muted text-xs">Couldn&rsquo;t load this just now.</p>
          <button onClick={() => { setPhase("loading"); void load(); }} className="text-xs underline underline-offset-2 text-foreground min-h-[44px]">
            Try again
          </button>
        </div>
      )}

      {phase === "empty" && (
        <p className="text-muted text-xs">
          Nothing yet — she builds this up as you talk.
        </p>
      )}

      {(phase === "ready" || phase === "clearing") && (
        <>
          <button
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            className="text-xs underline underline-offset-2 text-foreground min-h-[44px] flex items-center"
          >
            {open ? "Hide what she remembers" : "Show what she remembers"}
          </button>
          {open && (
            <p
              className="text-secondary text-xs leading-relaxed mt-1.5 mb-2.5 whitespace-pre-wrap"
              style={{ background: "var(--background-elevated)", border: "1px solid var(--border-card)", borderRadius: 12, padding: "12px 14px" }}
            >
              {summary}
            </p>
          )}
          <div>
            <button
              onClick={clear}
              disabled={phase === "clearing"}
              className="text-xs min-h-[44px] flex items-center disabled:opacity-50"
              style={{ color: "var(--danger-text)", textDecoration: "underline", textUnderlineOffset: 2 }}
            >
              {phase === "clearing" ? "Forgetting…" : "Ask her to forget it"}
            </button>
          </div>
        </>
      )}

      {/* Announced, not just drawn — a confirmation nobody hears is not one. */}
      <p role="status" aria-live="polite" className="text-xs mt-1" style={{ color: "var(--sage-strong, var(--foreground-muted))" }}>
        {status}
      </p>
    </div>
  );
}
