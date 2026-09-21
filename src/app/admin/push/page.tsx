"use client";

/**
 * /admin/push — write and send a push notification by hand.
 *
 * Only the accounts in src/lib/admin.ts can use it. This page asks the server
 * before showing anything, and the server is what actually enforces it: anyone
 * else gets a plain "not found", exactly like a URL that doesn't exist.
 *
 * The draft is checked as it's typed against the same rules the server applies
 * (manualPush.ts), and the preview is drawn the way a lock screen draws it —
 * including the "MAPPED" line the phone adds on its own, which is why the title
 * should never be spent saying it again.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { authedFetch } from "@/lib/authedFetch";
import { MAX_TITLE, MAX_BODY } from "@/lib/notifications/copy";
import { DESTINATIONS, validateManualPush, type Audience } from "@/lib/notifications/manualPush";

type Gate = { kind: "checking" } | { kind: "denied" } | { kind: "ok"; people: number; devices: number };
type Result =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "done"; ok: boolean; msg: string };

export default function AdminPushPage() {
  const [gate, setGate] = useState<Gate>({ kind: "checking" });
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [url, setUrl] = useState("/home");
  const [audience, setAudience] = useState<Audience>("me");
  const [confirming, setConfirming] = useState(false);
  const [result, setResult] = useState<Result>({ kind: "idle" });
  // Every edit below also cancels a half-finished "tap again to confirm", so a
  // confirmation can never send a different draft from the one it was shown.

  useEffect(() => {
    authedFetch("/api/admin/push")
      .then(async (res) => {
        if (!res.ok) return setGate({ kind: "denied" });
        const j = await res.json();
        setGate({ kind: "ok", people: j.people ?? 0, devices: j.devices ?? 0 });
      })
      .catch(() => setGate({ kind: "denied" }));
  }, []);

  if (gate.kind === "checking") return <main className="min-h-screen" style={{ background: "var(--background)" }} />;

  if (gate.kind === "denied") {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center" style={{ background: "var(--background)" }}>
        <p className="text-foreground text-[15px]">This page doesn&rsquo;t exist.</p>
        <Link href="/home" className="mt-3 text-[13px] underline underline-offset-2" style={{ color: "var(--brass)" }}>Go home</Link>
      </main>
    );
  }

  const check = validateManualPush({ title, body, url, audience });
  const titleOver = title.trim().length > MAX_TITLE;
  const bodyOver = body.trim().length > MAX_BODY;
  const everyoneLabel = `Everyone (${gate.people} ${gate.people === 1 ? "person" : "people"})`;

  async function send() {
    if (!check.ok) return;
    if (audience === "everyone" && !confirming) { setConfirming(true); return; }
    setConfirming(false);
    setResult({ kind: "sending" });
    try {
      const res = await authedFetch("/api/admin/push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body, url, audience }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok && j.error) return setResult({ kind: "done", ok: false, msg: j.error });
      setResult({ kind: "done", ok: !!j.ok, msg: summarise(j) });
    } catch {
      setResult({ kind: "done", ok: false, msg: "Couldn't reach the server." });
    }
  }

  return (
    <main className="min-h-screen px-5 pt-10 pb-16" style={{ background: "var(--background)" }}>
      <div className="max-w-md mx-auto">
        <Link href="/account" className="text-[12px] underline underline-offset-2" style={{ color: "var(--foreground-muted)" }}>← Account</Link>
        <h1 className="mt-4 text-[26px] text-foreground" style={{ fontFamily: "var(--font-display)" }}>Send a push</h1>
        <p className="mt-1 text-[13px]" style={{ color: "var(--foreground-muted)" }}>
          {gate.people} {gate.people === 1 ? "person has" : "people have"} notifications on, across {gate.devices} {gate.devices === 1 ? "device" : "devices"}.
        </p>

        {/* ── Preview, drawn the way the phone draws it ── */}
        <div className="mt-6 rounded-2xl px-4 py-3 shadow-lg" style={{ background: "rgba(40,36,48,0.92)", color: "#f2eee6" }}>
          <div className="flex items-center justify-between text-[11px] tracking-wide uppercase" style={{ color: "#b9b2c6" }}>
            <span className="flex items-center gap-1.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-terracotta-cropped.png" alt="" className="w-4 h-4 rounded" />
              Mapped
            </span>
            <span className="normal-case">now</span>
          </div>
          <p className="mt-1 text-[15px] font-semibold leading-snug">{title.trim() || "Your title"}</p>
          <p className="text-[14px] leading-snug" style={{ color: "#d8d2e2" }}>{body.trim() || "Your message."}</p>
        </div>
        <p className="mt-2 text-[11px]" style={{ color: "var(--foreground-faint)" }}>
          The phone adds the &ldquo;MAPPED&rdquo; line itself. Use the title for the actual thing.
        </p>

        {/* ── The draft ── */}
        <label className="block mt-6">
          <span className="flex justify-between text-[12px]" style={{ color: "var(--foreground-secondary)" }}>
            Title <span style={{ color: titleOver ? "var(--terracotta, #b76b48)" : "var(--foreground-faint)" }}>{title.trim().length}/{MAX_TITLE}</span>
          </span>
          <input
            value={title}
            onChange={(e) => { setTitle(e.target.value); setConfirming(false); }}
            placeholder="Full moon in Aries"
            className="mt-1 w-full rounded-lg px-3 py-2.5 text-[15px] text-foreground outline-none"
            style={{ background: "var(--background-card)", border: `1px solid ${titleOver ? "var(--terracotta, #b76b48)" : "transparent"}` }}
          />
        </label>

        <label className="block mt-4">
          <span className="flex justify-between text-[12px]" style={{ color: "var(--foreground-secondary)" }}>
            Message <span style={{ color: bodyOver ? "var(--terracotta, #b76b48)" : "var(--foreground-faint)" }}>{body.trim().length}/{MAX_BODY}</span>
          </span>
          <textarea
            value={body}
            onChange={(e) => { setBody(e.target.value); setConfirming(false); }}
            rows={3}
            placeholder="Whatever has been building for two weeks gets obvious tonight."
            className="mt-1 w-full rounded-lg px-3 py-2.5 text-[15px] text-foreground outline-none resize-none"
            style={{ background: "var(--background-card)", border: `1px solid ${bodyOver ? "var(--terracotta, #b76b48)" : "transparent"}` }}
          />
        </label>

        <label className="block mt-4">
          <span className="text-[12px]" style={{ color: "var(--foreground-secondary)" }}>Opens</span>
          <select
            value={url}
            onChange={(e) => { setUrl(e.target.value); setConfirming(false); }}
            className="mt-1 w-full rounded-lg px-3 py-2.5 text-[15px] text-foreground outline-none"
            style={{ background: "var(--background-card)" }}
          >
            {DESTINATIONS.map((d) => <option key={d.path} value={d.path}>{d.label}</option>)}
          </select>
        </label>

        <fieldset className="mt-4">
          <legend className="text-[12px]" style={{ color: "var(--foreground-secondary)" }}>Send to</legend>
          <div className="mt-1 grid grid-cols-2 gap-2">
            {(["me", "everyone"] as Audience[]).map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => { setAudience(a); setConfirming(false); }}
                className="rounded-lg px-3 py-2.5 text-[13px] font-medium"
                style={{
                  background: audience === a ? "var(--brass)" : "var(--background-card)",
                  color: audience === a ? "#1a1420" : "var(--foreground)",
                }}
              >
                {a === "me" ? "Just me" : everyoneLabel}
              </button>
            ))}
          </div>
          <p className="mt-2 text-[11px]" style={{ color: "var(--foreground-faint)" }}>
            {audience === "me"
              ? "Goes to your own devices only. Doesn't count toward anyone's limits."
              : "Skips anyone who's paused, in their quiet hours, or already heard from Mapped today. Counts toward their limits."}
          </p>
        </fieldset>

        {!check.ok && (title || body) && (
          <p className="mt-4 text-[12px]" style={{ color: "var(--terracotta, #b76b48)" }}>{check.error}</p>
        )}

        <button
          type="button"
          onClick={send}
          disabled={!check.ok || result.kind === "sending"}
          className="mt-5 w-full rounded-lg px-4 py-3 text-[14px] font-semibold disabled:opacity-40"
          style={{ background: confirming ? "var(--terracotta, #b76b48)" : "var(--brass)", color: "#1a1420" }}
        >
          {result.kind === "sending"
            ? "Sending…"
            : confirming
              ? `Send to ${gate.people} ${gate.people === 1 ? "person" : "people"} — tap again to confirm`
              : audience === "me" ? "Send to me" : "Send to everyone"}
        </button>

        {result.kind === "done" && (
          <p className="mt-3 text-[13px]" style={{ color: result.ok ? "var(--foreground-secondary)" : "var(--terracotta, #b76b48)" }}>
            {result.msg}
          </p>
        )}
      </div>
    </main>
  );
}

function summarise(j: {
  ok?: boolean; audience?: string; people?: number; devices?: number; failed?: number; expired?: number;
  skipped?: { paused: number; quiet: number; capped: number };
}): string {
  const parts: string[] = [];
  if (j.audience === "me") {
    parts.push(j.devices ? `Sent to ${j.devices} of your ${j.devices === 1 ? "device" : "devices"}.` : "Nothing went through.");
  } else {
    parts.push(`Sent to ${j.people ?? 0} ${j.people === 1 ? "person" : "people"} (${j.devices ?? 0} ${j.devices === 1 ? "device" : "devices"}).`);
    const s = j.skipped;
    if (s) {
      const why = [
        s.capped && `${s.capped} already heard from Mapped today or hit their weekly limit`,
        s.quiet && `${s.quiet} in quiet hours`,
        s.paused && `${s.paused} paused`,
      ].filter(Boolean);
      if (why.length) parts.push(`Skipped: ${why.join(", ")}.`);
    }
  }
  if (j.expired) parts.push(`${j.expired} expired ${j.expired === 1 ? "device was" : "devices were"} removed.`);
  if (j.failed) parts.push(`${j.failed} failed at the push service.`);
  return parts.join(" ");
}
