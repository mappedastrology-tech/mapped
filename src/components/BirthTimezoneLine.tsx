"use client";

/**
 * "Time zone used: America/Chicago (CDT, UTC−5)" under the birth data, with a
 * way to correct it.
 *
 * The zone is the input most likely to make a chart wrong, and the one a user
 * can least see, so it is always shown — with the reading that was used when
 * the zone was only estimated, the birth fell before standard time (local mean
 * time), or the clocks changed that night. The correction takes any IANA zone,
 * a fixed offset ("UTC-05:00") or "LMT"; "Look it up again" re-resolves the
 * zone from the birthplace. All rules: lib/astro/birthTimezone.
 */

import { useMemo, useState } from "react";
import { describeAmbiguity, describeBirthOffset, isResolvedZone, type BirthOffset } from "@/lib/astro/birthTimezone";

interface Props {
  info: BirthOffset;
  birthTime: string;
  unknownTime?: boolean;
  /** A zone string to use, or null to look the birthplace's zone up again. */
  onChange: (zone: string | null) => Promise<void>;
}

export default function BirthTimezoneLine({ info, birthTime, unknownTime, onChange }: Props) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(info.zone ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const zones = useMemo(() => {
    try {
      return (Intl as unknown as { supportedValuesOf?: (k: string) => string[] }).supportedValuesOf?.("timeZone") ?? [];
    } catch {
      return [];
    }
  }, []);

  const ambiguity = unknownTime ? null : describeAmbiguity(info, birthTime);

  async function run(zone: string | null) {
    if (zone !== null && !isResolvedZone(zone.trim())) {
      setError("Use a zone like America/Chicago, an offset like UTC-05:00, or LMT.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await onChange(zone === null ? null : zone.trim());
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't update the time zone.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="text-[10.5px] mt-1 leading-snug" style={{ color: "var(--foreground-faint)" }}>
      <p>
        {info.source === "estimated" ? "Time zone estimated: " : "Time zone used: "}
        {describeBirthOffset(info)}
        {!editing && (
          <>
            {" · "}
            <button type="button" onClick={() => { setValue(info.zone ?? ""); setEditing(true); }} className="underline underline-offset-2" style={{ color: "var(--brass)" }}>
              {info.source === "estimated" ? "Check it" : "Change"}
            </button>
          </>
        )}
      </p>
      {info.source === "estimated" && (
        <p className="mt-0.5">We couldn&rsquo;t confirm your birthplace&rsquo;s zone, so this is a best guess from the map. Your rising sign depends on it.</p>
      )}
      {ambiguity && <p className="mt-0.5">{ambiguity}</p>}
      {editing && (
        <div className="mt-2 mx-auto max-w-xs text-left">
          <input
            list="mapped-tz-list"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="America/Chicago, UTC-05:00 or LMT"
            aria-label="Birth time zone"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            className="w-full rounded-lg px-3 py-1.5 text-base bg-transparent"
            style={{ border: "0.5px solid rgba(201, 169, 97, 0.35)", color: "var(--foreground)" }}
          />
          <datalist id="mapped-tz-list">
            <option value="LMT">Local mean time of the birthplace</option>
            {zones.map((z) => <option key={z} value={z} />)}
          </datalist>
          <div className="flex flex-wrap gap-3 mt-1.5 justify-center">
            <button type="button" disabled={busy} onClick={() => run(value)} style={{ color: "var(--brass)" }} className="underline underline-offset-2 disabled:opacity-50">
              {busy ? "Saving…" : "Save"}
            </button>
            <button type="button" disabled={busy} onClick={() => run(null)} className="underline underline-offset-2 disabled:opacity-50">
              Look it up again
            </button>
            <button type="button" disabled={busy} onClick={() => { setEditing(false); setError(""); }} className="underline underline-offset-2 disabled:opacity-50">
              Cancel
            </button>
          </div>
          {error && <p className="mt-1 text-center" style={{ color: "var(--terracotta, #b0503a)" }}>{error}</p>}
        </div>
      )}
    </div>
  );
}
