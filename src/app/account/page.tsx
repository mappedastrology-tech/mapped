"use client";

/**
 * Account page — full account management.
 *
 * Signed out: Create account / Sign in (with Google + Apple social login)
 * Signed in: Edit profile, change password, zodiac prefs, delete account, sign out
 * Reset mode: Set a new password after clicking email reset link
 */

import { Suspense, useEffect, useState, useCallback, useRef, useId } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { authedFetch } from "@/lib/authedFetch";
import { useTheme } from "@/components/ThemeProvider";
import { useTier } from "@/components/TierProvider";
import { PlansPage } from "@/components/Paywall";
import CitySearch from "@/components/CitySearch";
import BugReportModal from "@/components/BugReportModal";
import DataExportButton from "@/components/DataExportButton";
import Link from "next/link";
import { ORACLE_DECKS } from "@/lib/oracleDecks";
import {
  DEFAULT_PREFERENCES, TIME_OPTIONS, PAUSE_OPTIONS, getPauseUntil,
  groupEnabled, setGroup, isPaused,
  type NotificationPreferences, type NotificationGroup,
} from "@/lib/notifications/catalogue";
import { useOracleAccess } from "@/lib/oracleAccess";
import { getProfile, invalidateProfile } from "@/lib/profileCache";
import { describeRedemption } from "@/lib/promoCodes";
import { clearOnSignOut } from "@/lib/accountIsolation";
import { TIERS, TRIAL_DAYS, type TierLevel } from "@/lib/tier";
import { fetchSetting, saveSetting } from "@/lib/syncedSettings";
import {
  getCachedLocation,
  fetchUserLocation,
  saveUserLocation,
  type UserLocation,
} from "@/lib/userLocation";
import { goBack } from "@/lib/goBack";
import { isAdmin } from "@/lib/admin";
import { applyChartSystem, loadChartSystemPreference, saveChartSystemPreference } from "@/lib/chartSystemSync";
import { chartSystemFromRow, chartSystemLabel, type ChartSystem } from "@/lib/astro/vedic/system";
import { defaultHouseSystem } from "@/lib/astro/vedic/houses";

export default function AccountPageWrapper() {
  return (
    <Suspense fallback={
      <main className="acct-scope flex-1 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-terracotta/30 border-t-terracotta rounded-full animate-spin" role="status" aria-label="Loading" />
      </main>
    }>
      <AccountPage />
    </Suspense>
  );
}

/* ─── Social login button components ─── */

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  );
}

/* ─── Confirmation modal ─── */

function ConfirmDialog({
  title,
  message,
  confirmLabel,
  confirmDestructive,
  onConfirm,
  onCancel,
  isLoading,
}: {
  title: string;
  message: string;
  confirmLabel: string;
  confirmDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  // Keyboard accessibility: close on Escape, focus the dialog on open, and trap
  // Tab focus inside it while it's up.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const focusable = dialog.querySelectorAll<HTMLElement>("button:not([disabled])");
    (focusable[0] ?? dialog).focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { onCancel(); return; }
      if (e.key !== "Tab" || focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <div aria-hidden="true" className="absolute inset-0 backdrop-blur-[2px]" style={{ backgroundColor: "var(--modal-overlay)" }} onClick={onCancel} />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="relative bg-background rounded-2xl border border-foreground/15 p-6 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200 outline-none"
      >
        <h3
          id={titleId}
          className="text-[19px] font-semibold tracking-[-0.01em] text-foreground mb-2"
        >
          {title}
        </h3>
        <p className="text-secondary text-sm mb-6 leading-relaxed">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 py-2.5 rounded-full border border-foreground/18 text-secondary text-sm
                       hover:border-foreground/25 transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 py-2.5 rounded-full text-sm font-medium transition-all disabled:opacity-50
              ${confirmDestructive
                ? "bg-red-500/90 text-white hover:bg-red-500"
                : "bg-terracotta text-cream hover:bg-terracotta-light"
              }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" role="status" aria-label="Loading" />
              </span>
            ) : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Inline editable field ─── */

function EditableField({
  label,
  value,
  onSave,
  type = "text",
  placeholder,
  helpText,
}: {
  label: string;
  value: string;
  onSave: (newValue: string) => Promise<string | null>; // returns error or null
  type?: string;
  placeholder?: string;
  helpText?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => { setDraft(value); }, [value]);

  async function handleSave() {
    if (draft.trim() === value) { setEditing(false); return; }
    setSaving(true);
    setError(null);
    const err = await onSave(draft.trim());
    setSaving(false);
    if (err) {
      setError(err);
    } else {
      setEditing(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    }
  }

  return (
    <div className="rounded-2xl bg-surface border border-foreground/15 p-5">
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs uppercase tracking-widest text-muted">{label}</p>
        {!editing && (
          <button
            onClick={() => { setEditing(true); setError(null); setSuccess(false); }}
            className="-mr-3 -my-3.5 px-3 py-3.5 text-xs text-terracotta/70 hover:text-terracotta transition-colors"
          >
            Edit
          </button>
        )}
      </div>

      {editing ? (
        <div className="flex flex-col gap-2 mt-2">
          <input
            type={type}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={placeholder}
            aria-label={label}
            autoFocus
            className="w-full px-3 py-2.5 rounded-xl bg-background border border-foreground/18
                       text-foreground text-sm placeholder:text-muted
                       focus:outline-none focus:border-terracotta/50 focus:ring-1 focus:ring-terracotta/25"
            onKeyDown={(e) => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") { setEditing(false); setDraft(value); } }}
          />
          {error && <p className="text-red-400 text-xs">{error}</p>}
          {helpText && <p className="text-muted text-[10px]">{helpText}</p>}
          <div className="flex gap-2">
            <button
              onClick={() => { setEditing(false); setDraft(value); setError(null); }}
              disabled={saving}
              className="flex-1 py-2 rounded-xl border border-foreground/15 text-muted text-xs
                         hover:border-foreground/20 transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !draft.trim()}
              className="flex-1 py-2 rounded-xl bg-terracotta text-cream text-xs font-medium
                         hover:bg-terracotta-light transition-all disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <p className="text-foreground text-sm">{value || "—"}</p>
          {success && (
            <span className="text-sage text-xs animate-in fade-in duration-200">Saved</span>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Ritual Tools section ─── */

const TOOL_OPTIONS = [
  { id: "candles", icon: "🕯️", label: "Candles", desc: "Any color candle" },
  { id: "salt", icon: "🧂", label: "Salt", desc: "Sea salt or Epsom" },
  { id: "herbs", icon: "🌿", label: "Kitchen Herbs", desc: "Cinnamon, rosemary, bay, lavender" },
  { id: "bath", icon: "🛁", label: "Bathtub", desc: "For ritual baths and soaks" },
  { id: "mirror", icon: "🪞", label: "Mirror", desc: "Any mirror you can sit in front of" },
  { id: "rose-quartz", icon: "💗", label: "Rose Quartz", desc: "Love and self-love" },
  { id: "clear-quartz", icon: "🤍", label: "Clear Quartz", desc: "Clarity and amplification" },
  { id: "amethyst", icon: "💜", label: "Amethyst", desc: "Peace and intuition" },
  { id: "incense", icon: "🪔", label: "Incense", desc: "Frankincense, sandalwood, palo santo" },
  { id: "crystals-other", icon: "💎", label: "Other Crystals", desc: "Citrine, black tourmaline, selenite, etc." },
  { id: "oils", icon: "💧", label: "Essential Oils", desc: "For anointing and scent" },
  { id: "tarot", icon: "🃏", label: "Tarot / Oracle Deck", desc: "For card-based rituals" },
];

function RitualToolsSection() {
  const [myTools, setMyTools] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const saved = localStorage.getItem("mapped:my-tools");
      if (saved) setMyTools(JSON.parse(saved));
    } catch {}
  }, []);

  const toggleTool = (id: string) => {
    setMyTools((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try { localStorage.setItem("mapped:my-tools", JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const enabledCount = Object.values(myTools).filter(Boolean).length;

  return (
    <div id="ritual-tools" className="rounded-2xl bg-surface border border-foreground/15 p-5">
      <p className="text-xs uppercase tracking-widest text-muted mb-1">Ritual Tools</p>
      <p className="text-[11px] text-muted mb-4">
        {enabledCount > 0
          ? `${enabledCount} selected — rituals are filtered to match`
          : "Tell us what you have at home so we can suggest rituals that work for you"}
      </p>
      <div className="grid grid-cols-2 gap-2">
        {TOOL_OPTIONS.map((tool) => (
          <button
            key={tool.id}
            onClick={() => toggleTool(tool.id)}
            className="flex items-center gap-2.5 p-3 rounded-xl text-left transition-all"
            style={{
              backgroundColor: myTools[tool.id] ? "var(--tag-green-bg, rgba(74,124,89,0.12))" : "var(--background, #faf5ef)",
              border: myTools[tool.id] ? "1px solid var(--sage, #4a7c59)" : "1px solid var(--border, rgba(0,0,0,0.08))",
            }}
          >
            <span className="text-[16px] shrink-0">{tool.icon}</span>
            <div className="min-w-0">
              <p className={`text-[12px] font-medium ${myTools[tool.id] ? "text-foreground" : "text-muted"}`}>
                {tool.label}
              </p>
            </div>
            <div
              className="ml-auto w-7 h-4 rounded-full flex items-center px-0.5 shrink-0 transition-all"
              style={{
                backgroundColor: myTools[tool.id] ? "var(--sage, #4a7c59)" : "var(--border, rgba(0,0,0,0.15))",
                justifyContent: myTools[tool.id] ? "flex-end" : "flex-start",
              }}
            >
              <div className="w-3 h-3 rounded-full bg-white" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── Almanac Preferences section ─── */

const ALMANAC_PREF_KEY = "mapped:almanac-prefs";

const ALMANAC_CONTENT_OPTIONS = [
  { id: "garden", icon: "🌱", label: "In Your Garden", desc: "Planting tips by moon phase" },
  { id: "weather-lore", icon: "🌦️", label: "Weather Lore", desc: "Folk weather predictions" },
  { id: "folk-wisdom", icon: "📜", label: "Folk Wisdom", desc: "Traditional sayings & proverbs" },
  { id: "star-visibility", icon: "🌟", label: "Star Visibility", desc: "What to look for tonight" },
];

function BirthTimeSettingsSection() {
  const router = useRouter();
  const [precision, setPrecision] = useState<string>("unknown");
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [savedTime, setSavedTime] = useState<string>("");

  // The editor is inline. It used to be a button that pushed
  // "/account#edit-birth-time" — from /account, to an anchor that exists
  // nowhere in the app — so it navigated to the page you were already on and
  // did nothing at all.
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      // Shared with every other section on this screen; see lib/profileCache.
      const profile = await getProfile();
      if (!profile) { setLoading(false); return; }
      const user = { id: profile.id };
      setUserId(user.id);

      // The time itself always comes from the chart. profiles carries only the
      // precision — it has no birth_time column, so reading one off the profile
      // silently yielded undefined and left the field blank.
      const { data: chart } = await supabase
        .from("charts")
        .select("birth_time, unknown_time")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (chart?.birth_time) setSavedTime(String(chart.birth_time).slice(0, 5));

      {
        // The chart decides WHETHER there is a time; the profile only says how
        // good it is. These two disagree on live accounts — several have
        // birth_time_precision 'unknown' while their chart holds a real time
        // and unknown_time false — and trusting the profile alone told those
        // people "No birth time entered" while the app was quite happily
        // drawing their houses from the time it had.
        const storedPrecision = profile?.birth_time_precision;
        if (chart?.unknown_time) {
          setPrecision("unknown");
        } else if (chart?.birth_time) {
          setPrecision(
            storedPrecision === "approximate" || storedPrecision === "rectified"
              ? storedPrecision
              : "exact",
          );
        } else if (storedPrecision) {
          setPrecision(storedPrecision);
        }
      }
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  /**
   * Save the time and rebuild the chart around it.
   *
   * applyBirthTime does the part that actually matters: the Rising sign, every
   * house cusp and everything derived from them change with the minute of
   * birth, so storing the time without recalculating would leave the chart the
   * rest of the app reads still built on the old one.
   */
  async function handleSave() {
    if (!userId) return;
    const time = draft.trim();
    if (!/^\d{2}:\d{2}$/.test(time)) {
      setSaveError("Enter a time as HH:MM.");
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      const { applyBirthTime } = await import("@/lib/chartSystemSync");
      const res = await applyBirthTime(userId, time);
      if (res.charts === 0 && res.failed > 0) {
        setSaveError("Couldn't rebuild your chart. Try again.");
        setSaving(false);
        return;
      }
      // Only the precision. profiles has no birth_time column — the time
      // itself lives on charts, which applyBirthTime has just written.
      // Including it here made PostgREST reject the whole statement, which is
      // what "couldn't save" was.
      const { error } = await supabase
        .from("profiles")
        .update({ birth_time_precision: "exact" })
        .eq("id", userId);
      if (error) {
        setSaveError("Couldn't save. Try again.");
        setSaving(false);
        return;
      }
      invalidateProfile();
      setPrecision("exact");
      setSavedTime(time);
      setEditing(false);
      await load();
      // The chart changed underneath every screen that caches a copy, so send
      // them back to a freshly read one rather than a stale render.
      router.refresh();
    } catch {
      setSaveError("Something went wrong. Try again.");
    }
    setSaving(false);
  }

  if (loading) return null;

  const precisionLabels: Record<string, string> = {
    exact: "Exact time recorded",
    approximate: "Approximate time",
    rectified: "Rectified (estimated)",
    unknown: "No birth time entered",
  };

  const badgeColors: Record<string, string> = {
    exact: "text-sage",
    approximate: "text-amber",
    rectified: "text-amber",
    unknown: "text-muted",
  };

  return (
    <div id="birth-time" className="rounded-2xl bg-surface border border-foreground/15 p-5">
      <p className="text-xs uppercase tracking-widest text-muted mb-3">Birth Time</p>
      <div className="flex items-center justify-between mb-3">
        <span className={`text-sm font-medium ${badgeColors[precision]}`}>
          {precisionLabels[precision] || "Unknown"}
        </span>
        {precision === "rectified" && (
          <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber/10 border border-amber/20 text-amber italic">rectified</span>
        )}
      </div>

      {editing ? (
        <div className="flex flex-col gap-2 mt-2">
          <label htmlFor="birth-time-input" className="text-[11px] text-muted">
            Your birth time, in the local time of where you were born.
          </label>
          <input
            id="birth-time-input"
            type="time"
            value={draft}
            onChange={(e) => { setDraft(e.target.value); setSaveError(null); }}
            className="w-full px-3 py-2.5 rounded-xl bg-background border border-foreground/15 text-foreground text-sm focus:outline-none focus:border-terracotta/40"
            style={{ minHeight: 44 }}
            disabled={saving}
          />
          {saveError && <p className="text-[11px] text-red-400">{saveError}</p>}
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving || !draft}
              className="flex-1 py-2.5 rounded-xl bg-terracotta text-cream text-xs font-semibold disabled:opacity-40 active:scale-[0.98] transition-all"
              style={{ minHeight: 44 }}
            >
              {saving ? "Rebuilding your chart…" : "Save birth time"}
            </button>
            <button
              onClick={() => { setEditing(false); setSaveError(null); }}
              disabled={saving}
              className="px-4 py-2.5 rounded-xl border border-foreground/18 text-muted text-xs font-medium disabled:opacity-40"
              style={{ minHeight: 44 }}
            >
              Cancel
            </button>
          </div>
          <p className="text-[10px] text-muted leading-relaxed">
            Saving recalculates your Rising sign, houses and everything built on them.
          </p>
        </div>
      ) : precision === "exact" ? (
        <button
          onClick={() => { setDraft(savedTime); setEditing(true); }}
          className="w-full py-2.5 rounded-xl border border-foreground/15 text-muted text-xs font-medium hover:border-foreground/25 transition-colors"
          style={{ minHeight: 44 }}
        >
          Change birth time
        </button>
      ) : (
        <div className="flex flex-col gap-2 mt-2">
          <button
            onClick={() => { setDraft(savedTime); setEditing(true); }}
            className="w-full py-2.5 rounded-xl bg-terracotta/10 border border-terracotta/20 text-terracotta text-xs font-medium hover:bg-terracotta/15 transition-colors"
            style={{ minHeight: 44 }}
          >
            Update with exact time
          </button>
          {precision === "unknown" && (
            <button
              onClick={() => router.push("/rectification")}
              className="w-full py-2.5 rounded-xl border border-foreground/15 text-muted text-xs font-medium hover:border-foreground/25 transition-colors"
            >
              Try rectification
            </button>
          )}
          <p className="text-[10px] text-muted leading-relaxed mt-1">
            {precision === "unknown"
              ? "Your chart is reduced without a birth time. Most features work, but some (like astrocartography) need the exact minute."
              : "Your Rising sign and houses are best-guess based on the window you provided."}
          </p>
        </div>
      )}
    </div>
  );
}

/* ─── Location section ─── */

function LocationSection({ userId }: { userId: string }) {
  const [location, setLocation] = useState<UserLocation | null>(() => getCachedLocation(userId));
  const [editing, setEditing] = useState(false);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchUserLocation(userId).then((loc) => {
      if (loc && !cancelled) setLocation(loc);
    });
    return () => { cancelled = true; };
  }, [userId]);

  async function handleSelect(result: { display_name: string; lat: string; lon: string }) {
    setSaving(true);
    setError(null);
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    const err = await saveUserLocation(userId, { lat, lng, label: result.display_name });
    setSaving(false);
    if (err) {
      setError(err);
    } else {
      setLocation({ lat, lng, label: result.display_name, source: "profile" });
      setEditing(false);
      setSearch("");
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    }
  }

  return (
    <div id="location" className="rounded-2xl bg-surface border border-foreground/15 p-5">
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs uppercase tracking-widest text-muted">Location</p>
        {!editing && (
          <button
            onClick={() => { setEditing(true); setError(null); setSuccess(false); setSearch(""); }}
            className="-mr-3 -my-3.5 px-3 py-3.5 text-xs text-terracotta/70 hover:text-terracotta transition-colors"
          >
            Edit
          </button>
        )}
      </div>

      {editing ? (
        <div className="flex flex-col gap-2 mt-2">
          <CitySearch value={search} onChange={setSearch} onSelect={handleSelect} />
          {saving && <p className="text-muted text-xs">Saving...</p>}
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <button
            onClick={() => { setEditing(false); setSearch(""); setError(null); }}
            disabled={saving}
            className="py-2 rounded-xl border border-foreground/15 text-muted text-xs
                       hover:border-foreground/20 transition-all disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-foreground text-sm">{location ? location.label : "Not set"}</p>
          {location?.source === "birth" && (
            <span className="text-muted text-xs italic">(from your birth chart — tap Edit to change)</span>
          )}
          {success && (
            <span className="text-sage text-xs animate-in fade-in duration-200">Saved</span>
          )}
        </div>
      )}

      <p className="text-muted text-[10px] mt-2">Used for sunrise, almanac and garden timing.</p>
    </div>
  );
}

function AlmanacPrefsSection() {
  const [prefs, setPrefs] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const saved = localStorage.getItem(ALMANAC_PREF_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed === "object" && parsed !== null) setPrefs(parsed);
      }
    } catch {}
  }, []);

  const toggle = (id: string) => {
    setPrefs((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try { localStorage.setItem(ALMANAC_PREF_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const enabledCount = Object.values(prefs).filter(Boolean).length;

  return (
    <div id="almanac-prefs" className="rounded-2xl bg-surface border border-foreground/15 p-5">
      <p className="text-xs uppercase tracking-widest text-muted mb-1">Almanac</p>
      <p className="text-[11px] text-muted mb-4">
        Choose what extra sections appear in your daily almanac
      </p>
      <div className="flex flex-col gap-2">
        {ALMANAC_CONTENT_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            onClick={() => toggle(opt.id)}
            className="flex items-center gap-3 p-3.5 rounded-xl text-left transition-all"
            style={{
              backgroundColor: prefs[opt.id] ? "var(--tag-green-bg, rgba(74,124,89,0.12))" : "var(--background, #faf5ef)",
              border: prefs[opt.id] ? "1px solid var(--sage, #4a7c59)" : "1px solid var(--border, rgba(0,0,0,0.08))",
            }}
          >
            <span className="text-[18px] shrink-0">{opt.icon}</span>
            <div className="flex-1 min-w-0">
              <p className={`text-[13px] font-medium ${prefs[opt.id] ? "text-foreground" : "text-muted"}`}>
                {opt.label}
              </p>
              <p className="text-[10px] text-muted">{opt.desc}</p>
            </div>
            <div
              className="w-7 h-4 rounded-full flex items-center px-0.5 shrink-0 transition-all"
              style={{
                backgroundColor: prefs[opt.id] ? "var(--sage, #4a7c59)" : "var(--border, rgba(0,0,0,0.15))",
                justifyContent: prefs[opt.id] ? "flex-end" : "flex-start",
              }}
            >
              <div className="w-3 h-3 rounded-full bg-white" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── Toggle Switch component ─── */

function ToggleSwitch({ checked, onChange, disabled }: { checked: boolean; onChange: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={onChange}
      className={`relative inline-flex h-[26px] w-[46px] shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 disabled:opacity-40 disabled:cursor-not-allowed ${
        checked ? "bg-terracotta" : "bg-foreground/20"
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-[22px] w-[22px] transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
          checked ? "translate-x-[20px]" : "translate-x-0"
        }`}
      />
    </button>
  );
}

/* ─── Notification Settings section ─── */

function NotificationSettingsSection() {
  const [prefs, setPrefs] = useState<Record<string, boolean | number | string | null>>({});
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [permissionState, setPermissionState] = useState<string>("default");
  const [requesting, setRequesting] = useState(false);
  // Why push can't be switched on, if it can't — iOS in a Safari tab is the
  // common one, and it is invisible to a plain permission check.
  const [blocker, setBlocker] = useState<string>("ok");
  const [testState, setTestState] = useState<{ kind: "idle" | "sending" | "sent" | "error"; msg?: string }>({ kind: "idle" });
  const [showDetail, setShowDetail] = useState(false);
  // Only decides whether the link is drawn. The send page and its API check
  // admin status on the server themselves; hiding a link protects nothing.
  const [adminUser, setAdminUser] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermissionState(Notification.permission);
    } else {
      setPermissionState("unsupported");
    }
    import("@/lib/notifications").then(({ pushBlocker }) => setBlocker(pushBlocker()));

    async function load() {
      const profile = await getProfile();
      if (!profile) return;
      setAdminUser(isAdmin(profile.id));
      // Merged over the defaults so a preference added since this profile was
      // last saved arrives with its intended default rather than undefined.
      setPrefs({ ...DEFAULT_PREFERENCES, ...(profile.notification_preferences ?? {}) });
      setLoaded(true);
    }
    load();

    // Permission granted on an earlier build could still mean NO stored
    // subscription — that was the silent failure. Re-register on every visit
    // (subscribing is idempotent) and say so if it still doesn't take.
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
      import("@/lib/notifications").then(async ({ initPushNotifications }) => {
        const r = await initPushNotifications();
        if (!r.ok && r.reason === "not-configured") {
          setTestState({ kind: "error", msg: "Notifications aren't configured on the server yet." });
        } else if (!r.ok && r.reason === "save-failed") {
          setTestState({ kind: "error", msg: "This device couldn't be linked to your account. Try again." });
        }
      });
    }
  }, []);

  async function handleToggleNotifications() {
    if (permissionState === "granted") {
      // Permission is already granted, but that does NOT mean this device is
      // registered — the old code returned here, which left anyone whose
      // subscription had silently failed with no way to create one. Retry it;
      // subscribing is idempotent when a subscription already exists.
      setRequesting(true);
      const { subscribeToPush } = await import("@/lib/notifications");
      const again = await subscribeToPush();
      setTestState(
        again.ok
          ? { kind: "sent", msg: "This device is registered." }
          : { kind: "error", msg: "Couldn't register this device. Reopen Mapped from your Home Screen and try again." },
      );
      setRequesting(false);
      return;
    }
    setRequesting(true);
    try {
      const { requestPermission, registerServiceWorker, subscribeToPush } = await import("@/lib/notifications");
      const result = await requestPermission();
      setPermissionState(result);
      if (result === "granted") {
        await registerServiceWorker();
        const sub = await subscribeToPush();
        // Say so when the subscription didn't actually store. Reporting this as
        // "on" is how an account ends up with the switch flipped and nothing
        // registered server-side.
        if (!sub.ok) {
          setTestState({
            kind: "error",
            msg:
              sub.reason === "not-configured"
                ? "Notifications aren't configured on the server yet."
                : sub.reason === "not-signed-in"
                  ? "Sign in first so this device can be linked to your account."
                  : "Couldn't register this device. Try again, or reopen the app from your Home Screen.",
          });
        }
      }
    } catch (err) {
      console.error("Permission request failed:", err);
      setTestState({ kind: "error", msg: "The browser refused the request." });
    }
    setRequesting(false);
  }

  /** Prove the whole chain: subscription -> server -> push service -> device. */
  async function sendTest() {
    setTestState({ kind: "sending" });
    try {
      const res = await authedFetch("/api/notifications/test", { method: "POST" });
      const body = await res.json().catch(() => ({}));
      if (res.ok && body.ok) {
        setTestState({ kind: "sent", msg: "Sent — it should arrive in a few seconds." });
      } else {
        setTestState({ kind: "error", msg: body.fix || body.error || "Couldn't send it." });
      }
    } catch {
      setTestState({ kind: "error", msg: "Couldn't reach the server." });
    }
  }

  async function save(updated: Record<string, boolean | number | string | null>) {
    setSaving(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      // Write the whole object as it now stands. The old version REBUILT it
      // from four switches every time, which meant saving any toggle silently
      // reset the delivery hour to 19 and cleared any pause.
      await supabase.from("profiles").update({ notification_preferences: updated }).eq("id", session.user.id);
      invalidateProfile();
    }
    setSaving(false);
  }

  function applyGroup(group: NotificationGroup, on: boolean) {
    const updated = setGroup(prefs as unknown as NotificationPreferences, group, on) as unknown as Record<string, boolean | number | string | null>;
    setPrefs(updated);
    save(updated);
  }

  function setValue(key: string, value: boolean | number | string | null) {
    const updated = { ...prefs, [key]: value };
    setPrefs(updated);
    save(updated);
  }

  if (!loaded) return null;

  const isEnabled = permissionState === "granted";

  const typed = prefs as unknown as NotificationPreferences;

  // The three switches most people will ever touch. Each one maps to a job:
  // something happened overhead, something happened in your chart, something
  // of yours is waiting.
  const groups: { key: NotificationGroup; label: string; desc: string }[] = [
    { key: "sky", label: "The sky", desc: "Full moons, eclipses, retrogrades. A heads-up when the sky shifts, so you can plan around it instead of finding out after." },
    { key: "chart", label: "My chart", desc: "When a planet lands on a point in your own chart: the moments that are about you, not everyone. Plus your solar return." },
    { key: "practice", label: "My practice", desc: "Reminders for the journal prompts and rituals you've saved, on the night they're meant for." },
  ];

  // Everything, for anyone who wants to tune it. Astrologers disagree with each
  // other about most of this, so the per-alert switches are a real answer
  // rather than a hedge.
  const detail: { key: keyof NotificationPreferences; label: string; desc: string }[] = [
    { key: "new_moon", label: "New moons", desc: "A fresh start. The night to set an intention." },
    { key: "new_moon_act", label: "Four days after a new moon", desc: "When it's time to take the first real step on what you intended." },
    { key: "full_moon", label: "Full moons", desc: "Things come to a head. A night for letting go and wrapping up." },
    { key: "quarter_moon", label: "Quarter moons", desc: "Mid-cycle check-ins: adjust course or push through." },
    { key: "eclipses", label: "Eclipses", desc: "Four to six a year, and they tend to mark turning points. Better to know before than after." },
    { key: "eclipse_season", label: "Eclipse season opening", desc: "Five weeks' notice, so big decisions don't land in the most unpredictable stretch." },
    { key: "retrograde_stations", label: "Retrograde stations", desc: "The day a planet turns. Mercury is the famous one: traditionally a time to double-check plans and hold off on big commitments." },
    { key: "retrograde_shadow", label: "Shadow periods clearing", desc: "The all-clear: a retrograde's aftereffects are over and it's safe to move forward." },
    { key: "major_ingresses", label: "Planets changing sign", desc: "Jupiter and slower. The shifts that set the tone for a year or more." },
    { key: "major_transits", label: "Transits to your chart", desc: "When a planet exactly hits your chart. Only the real ones, no filler." },
    { key: "transit_approaching", label: "Transits approaching", desc: "Four days' warning before a big one, so it doesn't catch you off guard." },
    { key: "solar_return", label: "Your solar return", desc: "Your astrological new year, to the minute. A good moment to set the year's intentions." },
    { key: "birthday_week", label: "Birthday week", desc: "A few days ahead, to look at what your coming year holds." },
    { key: "journal_checkin", label: "Journal check-ins", desc: "A journal question written for what you're moving through right now." },
    { key: "practice_reminders", label: "Saved rituals", desc: "On the night they're for, so you don't miss the moon you planned around." },
    { key: "learning_reminder", label: "Learning streak", desc: "A nudge to keep your learning streak going, if you want one." },
  ];

  return (
    <div className="rounded-2xl bg-surface border border-foreground/15 overflow-hidden">
      {/* Master toggle row */}
      <div className="flex items-center justify-between px-5 py-4">
        <div>
          <p className="text-foreground text-[15px] font-semibold">Notifications</p>
          {blocker === "ok" && permissionState !== "denied" && (
            <p className="text-muted text-[12px] mt-0.5 max-w-[16rem]">
              A heads-up when something in the sky, or in your chart, is worth knowing about. You choose what counts.
            </p>
          )}
          {blocker === "ios-needs-install" && (
            <p className="text-muted text-[11px] mt-0.5 max-w-[15rem]">
              On iPhone, add Mapped to your Home Screen first — tap Share, then Add to Home Screen, and open it from there.
            </p>
          )}
          {blocker !== "ios-needs-install" && permissionState === "denied" && (
            <p className="text-muted text-[11px] mt-0.5">Blocked in browser settings</p>
          )}
          {blocker === "unsupported" && (
            <p className="text-muted text-[11px] mt-0.5">This browser can&rsquo;t do notifications</p>
          )}
          {blocker === "not-configured" && (
            <p className="text-muted text-[11px] mt-0.5">Not switched on for this build yet</p>
          )}
        </div>
        {blocker !== "unsupported" && blocker !== "ios-needs-install" && (
          <ToggleSwitch
            checked={isEnabled}
            onChange={handleToggleNotifications}
            disabled={requesting || permissionState === "denied"}
          />
        )}
      </div>

      {/* Diagnostics, not a feature. A push that never arrives looks identical
          to one that was never sent, and this is the only way to tell the two
          apart from the device itself — but that is a thing the people who run
          Mapped need, not something to put in front of every subscriber. Both
          controls are admin-only; the real lock is the server-side check in the
          routes they call, this just stops them cluttering the screen. */}
      {isEnabled && adminUser && (
        <div className="px-5 pb-4 -mt-1">
          <button
            type="button"
            onClick={sendTest}
            disabled={testState.kind === "sending"}
            className="text-[12px] font-semibold underline underline-offset-2 disabled:opacity-50"
            style={{ color: "var(--brass)" }}
          >
            {testState.kind === "sending" ? "Sending…" : "Send me a test notification"}
          </button>
          <Link
            href="/admin/push"
            className="ml-4 text-[12px] font-semibold underline underline-offset-2"
            style={{ color: "var(--brass)" }}
          >
            Write a push
          </Link>
          {testState.msg && (
            <p
              className="text-[11px] mt-1.5 max-w-[19rem]"
              style={{ color: testState.kind === "error" ? "var(--terracotta, #b76b48)" : "var(--foreground-muted)" }}
            >
              {testState.msg}
            </p>
          )}
        </div>
      )}

      {/* Three switches, a time, and a pause. Everything else is one tap down. */}
      {isEnabled && (
        <div className="border-t border-foreground/8">
          {groups.map((g) => (
            <div key={g.key} className="flex items-center justify-between px-5 py-3.5 border-b border-foreground/5">
              <div className="flex-1 mr-4">
                <p className="text-foreground text-[14px] font-medium">{g.label}</p>
                <p className="text-muted text-[12px] mt-0.5">{g.desc}</p>
              </div>
              <ToggleSwitch
                checked={groupEnabled(typed, g.key)}
                onChange={() => applyGroup(g.key, !groupEnabled(typed, g.key))}
              />
            </div>
          ))}

          <div className="flex items-center justify-between px-5 py-3.5 border-b border-foreground/5">
            <div className="flex-1 mr-4">
              <p className="text-foreground text-[14px] font-medium">A reading every day</p>
              <p className="text-muted text-[12px] mt-0.5">One short reading from your own chart each day, so you have a reason to check in without having to remember.</p>
            </div>
            <ToggleSwitch
              checked={!!prefs.daily_content}
              onChange={() => setValue("daily_content", !prefs.daily_content)}
            />
          </div>

          {/* Delivery time. This is the setting that did nothing at all until
              the sender learned to run hourly and read the user's timezone. */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-foreground/5">
            <div className="flex-1 mr-4">
              <p className="text-foreground text-[14px] font-medium">Send at</p>
              <p className="text-muted text-[12px] mt-0.5">Your time, wherever you are</p>
            </div>
            <select
              id="notif-hour"
              value={String(prefs.preferred_hour ?? 19)}
              onChange={(e) => setValue("preferred_hour", Number(e.target.value))}
              className="text-[13px] bg-transparent border border-foreground/20 rounded-lg px-2 py-1.5 text-foreground"
            >
              {TIME_OPTIONS.map((t) => (
                <option key={t.hour} value={t.hour}>{t.label} · {t.description}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between px-5 py-3.5 border-b border-foreground/5">
            <div className="flex-1 mr-4">
              <p className="text-foreground text-[14px] font-medium">Quiet hours</p>
              <p className="text-muted text-[12px] mt-0.5">Nothing between 10 PM and 7 AM</p>
            </div>
            <ToggleSwitch
              checked={prefs.quiet_hours !== false}
              onChange={() => setValue("quiet_hours", prefs.quiet_hours === false)}
            />
          </div>

          <div className="px-5 py-3.5 border-b border-foreground/5">
            <div className="flex items-center justify-between">
              <div className="flex-1 mr-4">
                <p className="text-foreground text-[14px] font-medium">Pause</p>
                <p className="text-muted text-[12px] mt-0.5">
                  {isPaused(typed)
                    ? `Quiet until ${new Date(String(prefs.paused_until)).toLocaleDateString()}`
                    : "Everything off for a while"}
                </p>
              </div>
              {isPaused(typed) ? (
                <button
                  type="button"
                  onClick={() => setValue("paused_until", null)}
                  className="text-[12px] font-semibold underline underline-offset-2"
                  style={{ color: "var(--brass)" }}
                >
                  Resume
                </button>
              ) : (
                <div className="flex gap-2">
                  {PAUSE_OPTIONS.map((o) => (
                    <button
                      key={o.hours}
                      type="button"
                      onClick={() => setValue("paused_until", getPauseUntil(o.hours))}
                      className="text-[12px] border border-foreground/20 rounded-lg px-2 py-1"
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowDetail((v) => !v)}
            className="w-full text-left px-5 py-3.5 text-[13px] font-semibold"
            style={{ color: "var(--brass)" }}
            aria-expanded={showDetail}
          >
            {showDetail ? "Done" : "Choose individually"}
          </button>

          {showDetail && (
            <div className="border-t border-foreground/8">
              {detail.map((cat) => (
                <div key={cat.key} className="flex items-center justify-between px-5 py-3 border-b border-foreground/5">
                  <div className="flex-1 mr-4">
                    <p className="text-foreground text-[13px] font-medium">{cat.label}</p>
                    <p className="text-muted text-[11px] mt-0.5">{cat.desc}</p>
                  </div>
                  <ToggleSwitch
                    checked={prefs[cat.key] === true}
                    onChange={() => setValue(cat.key, prefs[cat.key] !== true)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}

/* ─── Subscription / Plan section ─── */

function SubscriptionSection() {
  const { tier, refreshTier, trialDaysLeft } = useTier();
  const [showPlans, setShowPlans] = useState(false);
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [loadingCheckout, setLoadingCheckout] = useState(false);

  // Any paid tier, not just Mapped+. Testing for "mid" alone showed a Mapped
  // Complete subscriber the Free card and an upgrade button.
  const isPaid = tier !== "free";
  const onTrial = trialDaysLeft > 0 && tier === "mid";
  const planName = TIERS[tier].name;
  const planPrice = tier === "free" ? "Free" : `$${TIERS[tier].price.toFixed(2)}/mo`;

  // What this plan actually includes now. The old free list promised a daily
  // horoscope and five Dolly messages, neither of which free has any more.
  const highlights: Record<TierLevel, string[]> = {
    free: ["Your full birth chart", "Almanac and transits", "One oracle deck", "A card pull each day"],
    mid: ["Dolly, whenever you want her", "Daily horoscopes for your chart", "Unlimited card pulls", "Astrocartography"],
    max: ["Everything in Mapped+", "Every oracle deck included", "New decks as they arrive"],
  };

  async function handleManageSubscription() {
    setLoadingPortal(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error("Portal error:", err);
    }
    setLoadingPortal(false);
  }

  async function handleUpgrade() {
    setLoadingCheckout(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error("Checkout error:", err);
    }
    setLoadingCheckout(false);
  }

  return (
    <>
      <div className="rounded-2xl bg-surface border border-foreground/15 p-5">
        <p className="text-xs uppercase tracking-widest text-muted mb-3">Your Plan</p>

        {/* Current tier badge */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${
              isPaid ? "bg-sage" : "bg-foreground/30"
            }`} />
            <span className="text-foreground text-base font-semibold">
              {planName}
            </span>
          </div>
          <span className="text-muted text-sm">
            {planPrice}
          </span>
        </div>

        {/* On the house right now. Said plainly and with the end date, because
            the thing people resent is not the trial ending, it is not having
            been told it would. */}
        {onTrial && (
          <p className="text-[11.5px] leading-relaxed mb-3 px-3 py-2 rounded-lg"
             style={{ backgroundColor: "var(--sage-soft, rgba(140,160,120,0.12))", color: "var(--foreground-on-card, inherit)", fontFamily: "var(--font-ui)" }}>
            Dolly is on us for your first {TRIAL_DAYS} days —{" "}
            <strong>{trialDaysLeft} {trialDaysLeft === 1 ? "day" : "days"} left</strong>.
            After that she lives in Mapped+.
          </p>
        )}

        {/* Feature highlights */}
        <div className="space-y-1.5 mb-4">
          {highlights[tier].map((h, i) => (
            <div key={i} className="flex items-center gap-2 text-secondary text-xs">
              <span className="text-sage">&#10003;</span>
              <span>{h}</span>
            </div>
          ))}
        </div>

        {/* Upgrade or Manage */}
        {isPaid ? (
          <button
            onClick={handleManageSubscription}
            disabled={loadingPortal}
            className="w-full py-3 rounded-full border border-foreground/18 text-secondary text-sm font-semibold active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {loadingPortal ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" role="status" aria-label="Loading" />
                Opening...
              </span>
            ) : (
              "Manage Subscription"
            )}
          </button>
        ) : (
          <div className="flex flex-col gap-2">
            <button
              onClick={handleUpgrade}
              disabled={loadingCheckout}
              className="w-full py-3 rounded-full bg-ink text-cream text-sm font-semibold active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {loadingCheckout ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-cream/30 border-t-cream rounded-full animate-spin" role="status" aria-label="Loading" />
                  Connecting...
                </span>
              ) : (
                `Upgrade to ${TIERS.mid.name} — $${TIERS.mid.price.toFixed(2)}/mo`
              )}
            </button>
            <button
              onClick={() => setShowPlans(true)}
              className="w-full py-2 text-muted text-xs hover:text-secondary transition-colors"
            >
              Compare plans
            </button>
          </div>
        )}

        {/* Manage billing note */}
        {isPaid && (
          <p className="text-center text-muted text-[10px] mt-2">
            Cancel or change plan anytime through the billing portal.
          </p>
        )}

        {/* Fair use. No number, but it says a ceiling exists, which is what
            app stores and consumer rules expect a subscription to disclose. */}
        <p className="text-center text-muted text-[10px] mt-2">
          Dolly and the other AI features are subject to fair use.
        </p>
      </div>

      {/* Plans comparison modal */}
      {showPlans && (
        <PlansPage
          currentTier={tier}
          onClose={() => setShowPlans(false)}
        />
      )}
    </>
  );
}

/* ─── Promo Code section ─── */

function PromoCodeSection() {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const { refreshTier } = useTier();
  // Anything this account was given for free is listed below, rather than only
  // quietly changing what works. Someone who redeemed a code months ago should
  // be able to see what they hold and when it runs out.
  const [perks, setPerks] = useState<{ label: string; detail: string }[]>([]);

  const loadPerks = useCallback(async () => {
    try {
      const profile = await getProfile();
      if (!profile) { setPerks([]); return; }
      const { data } = await supabase
        .from("promo_redemptions")
        .select("*")
        .eq("user_id", profile.id);
      const active = (data ?? [])
        .map((r) => describeRedemption(r as Parameters<typeof describeRedemption>[0]))
        .filter((x): x is { label: string; detail: string } => x !== null);
      setPerks(active);
    } catch {
      // The table may not exist in every environment — an empty list is the
      // right answer, not an error message about promo plumbing.
      setPerks([]);
    }
  }, []);

  useEffect(() => { loadPerks(); }, [loadPerks]);

  const handleRedeem = async () => {
    if (!code.trim()) return;
    setStatus("loading");
    setMessage("");

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setStatus("error");
        setMessage("Please sign in first.");
        return;
      }

      const res = await fetch("/api/promo/redeem", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ code: code.trim() }),
      });

      const data = await res.json();

      if (data.success) {
        setStatus("success");
        setMessage(data.message || "Code redeemed!");
        setCode("");
        // Refresh tier in case it was upgraded, and show the new perk in the
        // list straight away rather than only after a reload.
        await refreshTier();
        await loadPerks();
      } else {
        setStatus("error");
        setMessage(data.error || "Invalid code.");
      }
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Try again.");
    }
  };

  return (
    <div className="rounded-2xl bg-surface border border-foreground/15 p-5">
      <p className="text-xs uppercase tracking-widest text-muted mb-3">Promo Code</p>
      <div className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => { setCode(e.target.value.toUpperCase()); setStatus("idle"); setMessage(""); }}
          placeholder="Enter code"
          aria-label="Promo code"
          className="flex-1 px-3 py-2.5 rounded-xl bg-background border border-foreground/15 text-foreground text-sm placeholder:text-muted focus:outline-none focus:border-sage/50 tracking-wider font-mono"
          onKeyDown={(e) => e.key === "Enter" && handleRedeem()}
          disabled={status === "loading"}
        />
        <button
          onClick={handleRedeem}
          disabled={!code.trim() || status === "loading"}
          className="px-4 py-2.5 rounded-xl bg-ink text-cream text-sm font-semibold disabled:opacity-40 active:scale-[0.97] transition-all"
        >
          {status === "loading" ? "..." : "Apply"}
        </button>
      </div>
      {message && (
        <p className={`text-xs mt-2 ${status === "success" ? "text-sage" : "text-red-400"}`}>
          {message}
        </p>
      )}

      {perks.length > 0 && (
        <div className="mt-4 pt-4 border-t border-foreground/10">
          <p className="text-[11px] uppercase tracking-widest text-muted mb-2">Active on your account</p>
          <ul className="space-y-2">
            {perks.map((perk, i) => (
              <li key={i} className="flex items-baseline justify-between gap-3">
                <span className="text-secondary text-[12.5px]">{perk.label}</span>
                <span className="text-muted text-[11px] shrink-0">{perk.detail}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/* ─── Theme / Appearance section ─── */

function ThemeSection() {
  const { mode, setMode, theme, autoWithoutLocation } = useTheme();

  return (
    <div className="rounded-2xl bg-surface border border-foreground/15 p-5">
      <p className="text-xs uppercase tracking-widest text-muted mb-3">Appearance</p>
      <div className="flex gap-2">
        {([
          { value: "light" as const, label: "Day", desc: "Cream canvas", icon: "☀️" },
          { value: "dark" as const, label: "Night", desc: "Midnight canvas", icon: "🌙" },
          { value: "auto" as const, label: "Auto", desc: "Follows the sun", icon: "🌗" },
        ]).map((opt) => (
          <button
            key={opt.value}
            onClick={() => setMode(opt.value)}
            aria-pressed={mode === opt.value}
            className={`flex-1 flex flex-col items-center gap-1.5 py-4 rounded-xl text-sm font-medium transition-all border ${
              mode === opt.value
                ? "bg-terracotta/15 border-terracotta/40 text-terracotta"
                : "bg-background border-foreground/18 text-muted hover:border-foreground/20"
            }`}
            style={{ minHeight: 44 }}
          >
            <span className="text-lg">{opt.icon}</span>
            <span>{opt.label}</span>
            <span className="text-[10px] opacity-60">{opt.desc}</span>
          </button>
        ))}
      </div>

      {mode === "auto" ? (
        autoWithoutLocation ? (
          // Only reachable if the device will not report a timezone at all,
          // which is rare — but silently doing nothing would be worse.
          <p className="text-muted text-[10px] mt-2 leading-relaxed">
            Following your device appearance setting — this device isn&apos;t reporting
            a timezone, so there&apos;s no sunrise to follow.
          </p>
        ) : (
          <p className="text-muted text-[10px] mt-2 leading-relaxed">
            Light from sunrise to sunset wherever your device says you are, so it
            follows you when you travel. Currently {theme === "light" ? "day" : "night"}.
          </p>
        )
      ) : (
        <p className="text-muted text-[10px] mt-2">
          Changes how the entire app looks.
        </p>
      )}
    </div>
  );
}

/* ─── Oracle Deck section ─── */

function OracleDeckSection() {
  // The list is what the account OWNS, not the catalog. Every account gets one
  // oracle deck free, so a new user sees exactly one option here — the deck
  // they picked — and the list grows as they buy more. This is the only place
  // the choice is made; the home screen just reads it.
  const { decks, activeId, loading, choose } = useOracleAccess();

  return (
    <div className="rounded-2xl bg-surface border border-foreground/15 p-5">
      <p className="text-xs uppercase tracking-widest text-muted mb-1">Oracle Deck</p>
      <p className="text-muted text-[11px] mb-3">
        The oracle deck used for your daily pull on the home screen.
      </p>

      {loading ? (
        <p className="text-muted text-[12px] py-2">Loading your decks…</p>
      ) : decks.length === 0 ? (
        <div>
          <p className="text-secondary text-[12.5px] leading-relaxed mb-3">
            You haven&rsquo;t picked an oracle deck yet — one is free with your account.
          </p>
          <Link
            href="/tarot?store=1"
            className="inline-flex items-center justify-center px-5 py-3 rounded-xl text-[13px] font-semibold bg-terracotta text-cream hover:bg-terracotta-light"
            style={{ minHeight: 44 }}
          >
            Choose your free deck
          </Link>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            {decks.map((deck) => (
              <button
                key={deck.id}
                onClick={() => choose(deck.id)}
                aria-pressed={activeId === deck.id}
                className={`flex-1 min-w-[45%] flex flex-col items-center gap-1 py-3 rounded-xl text-sm font-medium transition-all border ${
                  activeId === deck.id
                    ? "bg-terracotta/15 border-terracotta/40 text-terracotta"
                    : "bg-background border-foreground/18 text-muted hover:border-foreground/20"
                }`}
              >
                <span>{deck.name}</span>
                <span className="text-[10px] opacity-60">{deck.cardCount} cards</span>
              </button>
            ))}
          </div>
          {decks.length < ORACLE_DECKS.length && (
            <p className="text-muted text-[11px] mt-3">
              More decks appear here as you add them —{" "}
              <Link href="/tarot?store=1" className="underline" style={{ color: "var(--brass)" }}>
                visit the Deck Store
              </Link>
              .
            </p>
          )}
        </>
      )}
    </div>
  );
}

/* ─── Report a Bug section ─── */

function ReportBugSection() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-between py-3 text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-terracotta">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 2l1.5 2.5M16 2l-1.5 2.5" />
              <rect x="8" y="6" width="8" height="12" rx="4" />
              <path d="M8 11H4M16 11h4M8 15H4M16 15h4M9 18l-2 3M15 18l2 3M12 6V4" />
            </svg>
          </span>
          <span className="text-foreground text-sm" style={{ fontFamily: "var(--font-ui)" }}>
            Report a Bug
          </span>
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
      <BugReportModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}

/* ─── About Our Sources section ─── */

function SourcesSection() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-2xl bg-surface border border-foreground/15 p-5">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between"
      >
        <p className="text-xs uppercase tracking-widest text-muted">About Our Sources</p>
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round"
          className={`text-muted transition-transform ${expanded ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {expanded && (
        <div className="mt-4 space-y-3 text-[12px] leading-[1.7] text-secondary">
          <p>
            Mapped synthesizes practices from many traditions: Hellenistic astrology (2nd century CE onward),
            Western magical practice, Hermetic Qabalah, traditional Western herbalism, color symbolism,
            crystal correspondences, and chakra theory.
          </p>
          <p>
            Some of these practices originate in closed traditions, including Hindu and Buddhist chakras,
            Indigenous American sage rituals, and African diasporic practices. We use these correspondences
            with respect for their origins and try to flag where attribution matters.
          </p>
          <p>
            We are not the keepers of any closed tradition. We are a Western synthesis. If you want to go
            deeper into any specific tradition, we encourage you to seek out teachers from within those traditions.
          </p>
          <div className="pt-2 border-t border-foreground/8 space-y-2 text-[11px] text-muted">
            <p>
              <strong className="text-muted">Chakras:</strong> The chakra framework Mapped uses is a Western
              synthesis of practices originating in Hindu and Buddhist tantric tradition.
            </p>
            <p>
              <strong className="text-muted">Sage:</strong> White sage is sacred to Indigenous communities in
              California (especially Chumash and Cahuilla peoples). Mapped recommends garden sage by default.
            </p>
            <p>
              <strong className="text-muted">Crystals:</strong> Crystals are mined globally, often in conditions
              that are environmentally or ethically concerning. Buy from sellers you trust.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Chart system (zodiac / ayanamsa / houses / nodes) ─── */

/** One row of equal-width choices. Tapping saves, so it is disabled while a save runs. */
function SystemChoice<T extends string>({ label, value, options, onPick, disabled, small }: {
  label?: string;
  value: T;
  options: { value: T; label: string; sub?: string }[];
  onPick: (v: T) => void;
  disabled: boolean;
  small?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      {label && <p className="text-xs text-muted">{label}</p>}
      <div className="flex gap-2" role="radiogroup" aria-label={label}>
        {options.map((opt) => {
          const active = value === opt.value;
          return (
            <button
              key={opt.value}
              role="radio"
              aria-checked={active}
              disabled={disabled}
              onClick={() => { if (!active) onPick(opt.value); }}
              className={`flex-1 ${small ? "py-2 rounded-lg text-xs" : "py-2.5 rounded-xl text-sm"} font-medium transition-all border disabled:opacity-60
                ${active
                  ? "bg-terracotta/15 border-terracotta/40 text-terracotta"
                  : "bg-background border-foreground/18 text-muted hover:border-foreground/20"
                }`}
            >
              {opt.label}
              {opt.sub && <span className="block text-[10px] mt-0.5 opacity-60">{opt.sub}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Main account page ─── */

function AccountPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = searchParams.get("mode") === "signin" ? "signin" : "signup";
  const isResetMode = searchParams.get("reset") === "true";
  const emailChanged = searchParams.get("emailChanged") === "true";
  const authError = searchParams.get("authError") === "true";

  // User state
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Chart system preference. Saving it recalculates the user's chart and
  // connections (lib/chartSystemSync.ts), so it is authoritative everywhere.
  const [chartSystem, setChartSystem] = useState<ChartSystem>(() => chartSystemFromRow(null));
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [prefsStatus, setPrefsStatus] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  // Auth form state
  const [mode, setMode] = useState<"signup" | "signin">(initialMode);
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState(
    emailChanged ? "Your email has been updated." :
    authError ? "Something went wrong with that link. Try again." : ""
  );

  // Forgot password state
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSending, setResetSending] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetError, setResetError] = useState("");

  // Change password state (signed in)
  const [showChangePassword, setShowChangePassword] = useState(isResetMode);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Delete account state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [connectionError, setConnectionError] = useState(false);

  const loadUser = useCallback(async () => {
    try {
      // If we arrived via a recovery or email_change link, verify the token first
      const tokenHash = searchParams.get("token_hash");
      const type = searchParams.get("type");
      if (tokenHash && type) {
        await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: type as "recovery" | "email_change" | "signup" | "email",
        });
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
        setEmail(session.user.email || null);
        setUserName(session.user.user_metadata?.name || null);
        try {
          const profile = await loadChartSystemPreference(session.user.id);
          // The chart row is what the user actually sees. People who picked
          // Vedic during onboarding may have a chart that says sidereal while
          // the profile still holds the tropical default — show the chart's
          // system and quietly bring the profile into line.
          const { data: chartRow } = await supabase
            .from("charts")
            .select("zodiac_system, ayanamsa")
            .eq("user_id", session.user.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();
          const fromProfile = chartSystemFromRow(profile);
          const fromChart = chartRow ? chartSystemFromRow(chartRow) : null;
          if (fromChart && (fromChart.zodiacSystem !== fromProfile.zodiacSystem
            || (fromChart.zodiacSystem === "sidereal" && fromChart.ayanamsa !== fromProfile.ayanamsa))) {
            const aligned = chartSystemFromRow({ ...profile, zodiac_system: fromChart.zodiacSystem, ayanamsa: fromChart.ayanamsa, house_system: null });
            setChartSystem(aligned);
            void saveChartSystemPreference(session.user.id, aligned);
          } else {
            setChartSystem(fromProfile);
          }
        } catch {
          // Profile fetch failed — use defaults
        }
      }
    } catch {
      setConnectionError(true);
    }
    setIsLoading(false);
  }, [searchParams]);

  useEffect(() => { loadUser(); }, [loadUser]);

  /* ─── Auth handlers ─── */

  async function handleAuthSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccessMessage("");

    try {
      if (mode === "signup") {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: formEmail,
          password: formPassword,
          options: { data: { name: formName } },
        });

        if (signUpError) throw signUpError;

        if (data.user && data.session) {
          setUserId(data.user.id);
          setEmail(data.user.email || null);
          setUserName(formName);
          const stored = sessionStorage.getItem("chartResult");
          if (stored) {
            const chartData = JSON.parse(stored);
            const { saveChart } = await import("@/lib/saveChart");
            await saveChart(data.user.id, chartData);
            sessionStorage.removeItem("chartResult");
          }
        } else if (data.user && !data.session) {
          setSuccessMessage("Check your email to confirm your account, then sign in.");
          setMode("signin");
        }
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: formEmail,
          password: formPassword,
        });

        if (signInError) throw signInError;

        if (data.user) {
          setUserId(data.user.id);
          setEmail(data.user.email || null);
          setUserName(data.user.user_metadata?.name || null);
          const stored = sessionStorage.getItem("chartResult");
          if (stored) {
            const chartData = JSON.parse(stored);
            const { saveChart } = await import("@/lib/saveChart");
            await saveChart(data.user.id, chartData);
            sessionStorage.removeItem("chartResult");
          }
          router.push("/home");
          return;
        }
      }
    } catch (err) {
      if (err instanceof Error) {
        if (err.message.includes("Failed to fetch") || err.message.includes("NetworkError") || err.message.includes("fetch")) {
          setError("Can't reach the server. Check your connection and try again.");
        } else if (err.message.includes("already registered")) {
          setError("This email already has an account. Try signing in.");
        } else if (err.message.includes("Invalid login")) {
          setError("Wrong email or password.");
        } else if (err.message.includes("Password should be")) {
          setError("Password needs to be at least 6 characters.");
        } else {
          setError(err.message);
        }
      } else {
        setError("Something went wrong.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSocialLogin(provider: "google" | "apple") {
    setError("");
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong with social login.");
      }
    }
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    setResetSending(true);
    setResetError("");

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
      });
      if (error) throw error;
      setResetSent(true);
    } catch (err) {
      if (err instanceof Error) {
        setResetError(err.message);
      } else {
        setResetError("Something went wrong.");
      }
    } finally {
      setResetSending(false);
    }
  }

  async function handleChangePassword() {
    setPasswordError("");
    if (newPassword.length < 6) {
      setPasswordError("Password needs to be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords don't match.");
      return;
    }

    setChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setPasswordSuccess(true);
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => {
        setShowChangePassword(false);
        setPasswordSuccess(false);
      }, 2000);
    } catch (err) {
      if (err instanceof Error) {
        setPasswordError(err.message);
      } else {
        setPasswordError("Something went wrong.");
      }
    } finally {
      setChangingPassword(false);
    }
  }

  async function handleUpdateName(newName: string): Promise<string | null> {
    try {
      const { error } = await supabase.auth.updateUser({
        data: { name: newName },
      });
      if (error) throw error;
      // Also update the profiles table
      if (userId) {
        await supabase.from("profiles").update({ name: newName }).eq("id", userId);
        invalidateProfile();
      }
      setUserName(newName);
      return null;
    } catch (err) {
      return err instanceof Error ? err.message : "Failed to update name.";
    }
  }

  async function handleUpdateEmail(newEmail: string): Promise<string | null> {
    try {
      const { error } = await supabase.auth.updateUser(
        { email: newEmail },
        { emailRedirectTo: `${window.location.origin}/auth/callback?type=email_change` }
      );
      if (error) throw error;
      // Supabase sends a confirmation email to the new address
      return null;
    } catch (err) {
      return err instanceof Error ? err.message : "Failed to update email.";
    }
  }

  async function handleDeleteAccount() {
    setDeleting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not signed in");

      const res = await fetch("/api/account/delete", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to delete account");

      // Sign out locally and redirect
      await supabase.auth.signOut();
      sessionStorage.clear();
      router.replace("/welcome");
    } catch (err) {
      setDeleting(false);
      setShowDeleteConfirm(false);
      setError(err instanceof Error ? err.message : "Failed to delete account.");
    }
  }

  async function saveChartSystem(next: ChartSystem) {
    if (!userId || savingPrefs) return;
    const previous = chartSystem;
    setChartSystem(next);
    setSavingPrefs(true);
    setPrefsStatus(null);
    try {
      const r = await applyChartSystem(userId, next);
      const people = r.connections ? ` and ${r.connections} ${r.connections === 1 ? "person" : "people"} on your map` : "";
      setPrefsStatus(r.failed
        ? { kind: "error", text: `Saved, but ${r.failed} chart${r.failed === 1 ? "" : "s"} couldn't be recalculated. Try again, or re-enter the birth details.` }
        : { kind: "ok", text: `Done — your chart${people} now use${r.charts + r.connections === 1 ? "s" : ""} ${chartSystemLabel(next)}.` });
    } catch (err) {
      console.error("Failed to save chart system:", err);
      setChartSystem(previous);
      setPrefsStatus({ kind: "error", text: "Couldn't save that. Check your connection and try again." });
    } finally {
      setSavingPrefs(false);
    }
  }

  async function handleSignOut() {
    try { await supabase.auth.signOut(); } catch { /* clear local state anyway */ }
    // Everything cached for this account goes, keeping only the handful of
    // device-level preferences. This used to be an allowlist of about a dozen
    // known-personal keys, which meant every feature added afterwards was
    // silently left behind on the device — journal entries, the chart, the
    // profile photo and the numerology name among them. See lib/accountIsolation.
    clearOnSignOut();
    invalidateProfile();
    setEmail(null);
    setUserName(null);
    setUserId(null);
    // Signing out of an app lands on its sign-in screen — on every device,
    // never the marketing site. replace(), so Back can't return to a signed-in
    // page that no longer has anyone behind it.
    router.replace("/welcome");
  }

  const inputClass = `w-full px-4 py-3.5 rounded-xl bg-surface border border-foreground/18
                      text-foreground placeholder:text-muted
                      focus:outline-none focus:border-terracotta/50 focus:ring-1 focus:ring-terracotta/25
                      text-base`;

  if (isLoading) {
    return (
      <main className="acct-scope flex-1 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-terracotta/30 border-t-terracotta rounded-full animate-spin" role="status" aria-label="Loading" />
      </main>
    );
  }

  return (
    <main className="acct-scope flex-1 flex flex-col px-6 py-8 max-w-lg mx-auto w-full">
      <button
        onClick={() => goBack("/home", (href) => router.push(href))}
        className="text-muted text-sm mb-8 self-start hover:text-foreground transition-colors"
      >
        &larr; back
      </button>

      <h1
        className="text-2xl text-foreground mb-6"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Account
      </h1>

      {connectionError && (
        <div className="rounded-2xl bg-terracotta/10 border border-terracotta/25 p-4 mb-5">
          <p className="text-terracotta text-sm font-medium mb-1">Can&apos;t reach the server</p>
          <p className="text-secondary text-xs leading-relaxed">
            Your account features need an internet connection. Check your Wi-Fi and try refreshing.
          </p>
        </div>
      )}

      {email ? (
        /* ═══════════════════════════════════════════
           ═══  SIGNED IN VIEW  ═══
           ═══════════════════════════════════════════ */
        <div className="flex flex-col gap-4">

          {/* Password reset banner */}
          {isResetMode && !passwordSuccess && (
            <div className="rounded-2xl bg-amber/10 border border-amber/25 p-4 mb-1 animate-in fade-in duration-300">
              <p className="text-amber text-sm font-medium">Set your new password below</p>
            </div>
          )}

          {/* ─── Subscription Plan ─── */}
          <SubscriptionSection />

          {/* ─── Promo Code ─── */}
          <PromoCodeSection />

          {/* ─── Editable name ─── */}
          <EditableField
            label="Name"
            value={userName || ""}
            onSave={handleUpdateName}
            placeholder="Your name"
          />

          {/* ─── Editable email ─── */}
          <EditableField
            label="Email"
            value={email}
            onSave={handleUpdateEmail}
            type="email"
            placeholder="your@email.com"
            helpText="We'll send a confirmation link to your new email address."
          />

          {/* ─── Change password ─── */}
          <div className="rounded-2xl bg-surface border border-foreground/15 p-5">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs uppercase tracking-widest text-muted">Password</p>
              {!showChangePassword && (
                <button
                  onClick={() => setShowChangePassword(true)}
                  className="-mr-3 -my-3.5 px-3 py-3.5 text-xs text-terracotta/70 hover:text-terracotta transition-colors"
                >
                  Change
                </button>
              )}
            </div>

            {showChangePassword ? (
              <div className="flex flex-col gap-3 mt-3 animate-in fade-in slide-in-from-top-2 duration-200">
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New password (6+ characters)"
                  aria-label="New password"
                  autoFocus
                  className="w-full px-3 py-2.5 rounded-xl bg-background border border-foreground/18
                             text-foreground text-sm placeholder:text-muted
                             focus:outline-none focus:border-terracotta/50 focus:ring-1 focus:ring-terracotta/25"
                />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  aria-label="Confirm new password"
                  className="w-full px-3 py-2.5 rounded-xl bg-background border border-foreground/18
                             text-foreground text-sm placeholder:text-muted
                             focus:outline-none focus:border-terracotta/50 focus:ring-1 focus:ring-terracotta/25"
                  onKeyDown={(e) => { if (e.key === "Enter") handleChangePassword(); }}
                />
                {passwordError && <p className="text-red-400 text-xs">{passwordError}</p>}
                {passwordSuccess && (
                  <p className="text-sage text-xs animate-in fade-in duration-200">
                    Password updated!
                  </p>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => { setShowChangePassword(false); setNewPassword(""); setConfirmPassword(""); setPasswordError(""); }}
                    disabled={changingPassword}
                    className="flex-1 py-2 rounded-xl border border-foreground/15 text-muted text-xs
                               hover:border-foreground/20 transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleChangePassword}
                    disabled={changingPassword || !newPassword}
                    className="flex-1 py-2 rounded-xl bg-terracotta text-cream text-xs font-medium
                               hover:bg-terracotta-light transition-all disabled:opacity-50"
                  >
                    {changingPassword ? "Updating..." : "Update password"}
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-foreground text-sm">••••••••</p>
            )}
          </div>

          {/* ─── Zodiac System Preference ─── */}
          <div className="rounded-2xl bg-surface border border-foreground/15 p-5">
            <p className="text-xs uppercase tracking-widest text-muted mb-3">Zodiac System</p>
            <div className="flex flex-col gap-4">
              <SystemChoice
                value={chartSystem.zodiacSystem}
                disabled={savingPrefs}
                options={[
                  { value: "tropical", label: "Western", sub: "Tropical" },
                  { value: "sidereal", label: "Vedic", sub: "Sidereal" },
                ]}
                // Switching zodiac resets houses to that zodiac's convention
                // (whole sign for Vedic, Placidus for Western).
                onPick={(z) => saveChartSystem({ ...chartSystem, zodiacSystem: z, houseSystem: defaultHouseSystem(z) })}
              />

              {chartSystem.zodiacSystem === "sidereal" && (
                <>
                  <SystemChoice
                    small
                    label="Ayanamsa"
                    value={chartSystem.ayanamsa}
                    disabled={savingPrefs}
                    options={[
                      { value: "lahiri", label: "Lahiri" },
                      { value: "krishnamurti", label: "KP" },
                      { value: "raman", label: "Raman" },
                    ]}
                    onPick={(a) => saveChartSystem({ ...chartSystem, ayanamsa: a })}
                  />
                  <SystemChoice
                    small
                    label="Rahu & Ketu"
                    value={chartSystem.nodeType}
                    disabled={savingPrefs}
                    options={[
                      { value: "mean", label: "Mean node" },
                      { value: "true", label: "True node" },
                    ]}
                    onPick={(n) => saveChartSystem({ ...chartSystem, nodeType: n })}
                  />
                  <p className="text-[10px] text-muted -mt-2">
                    Most Vedic astrologers use Lahiri and the mean node. Choose based on your tradition.
                  </p>
                </>
              )}

              <SystemChoice
                small
                label="Houses"
                value={chartSystem.houseSystem}
                disabled={savingPrefs}
                options={[
                  { value: "whole_sign", label: "Whole sign" },
                  { value: "placidus", label: "Placidus" },
                ]}
                onPick={(h) => saveChartSystem({ ...chartSystem, houseSystem: h })}
              />
            </div>

            <p className="text-[10px] mt-3" aria-live="polite" style={{ color: prefsStatus?.kind === "error" ? "var(--terracotta)" : undefined }}>
              {savingPrefs ? "Recalculating your chart…" : prefsStatus?.text ?? ""}
            </p>
            <p className="text-muted text-[10px] mt-1">
              Changing this recalculates your chart and the people on your map. Your horoscope, transits and Dolly all use it.
            </p>
          </div>

          {/* ─── Birth Time ─── */}
          <BirthTimeSettingsSection />

          {/* ─── Ritual Tools ─── */}
          <RitualToolsSection />

          {/* ─── Location ─── */}
          {userId && <LocationSection userId={userId} />}

          {/* ─── Almanac Preferences ─── */}
          <AlmanacPrefsSection />

          {/* ─── Oracle Deck ─── */}
          <OracleDeckSection />

          {/* ─── Notifications ─── */}
          <NotificationSettingsSection />

          {/* ─── Appearance / Theme ─── */}
          <ThemeSection />

          {/* ─── About Our Sources ─── */}
          <SourcesSection />

          {/* ─── Report a Bug ─── */}
          <ReportBugSection />

          {/* ─── Sign out ─── */}
          <button
            onClick={handleSignOut}
            className="mt-4 py-3 rounded-full border border-foreground/18 text-muted
                       text-sm hover:border-foreground/20 hover:text-foreground transition-all"
          >
            Sign out
          </button>

          {/* ─── Delete account ─── */}
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="py-3 rounded-full text-red-400/60 text-sm
                       hover:text-red-400 transition-all"
          >
            Delete account
          </button>

          {/* ─── Your data ─── */}
          <div className="pt-2">
            <DataExportButton />
          </div>

          {/* ─── Legal ─── */}
          <div className="flex items-center justify-center gap-4 pt-2">
            <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-muted/70 hover:text-foreground text-[11px] transition-colors">Privacy Policy</a>
            <span className="text-muted/40 text-[11px]">&middot;</span>
            <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-muted/70 hover:text-foreground text-[11px] transition-colors">Terms of Service</a>
          </div>

          {/* Error display */}
          {error && (
            <p className="text-red-400 text-xs text-center">{error}</p>
          )}

          {/* Delete confirmation modal */}
          {showDeleteConfirm && (
            <ConfirmDialog
              title="Delete your account?"
              message="This will permanently delete your account, your birth chart, journal entries, and all other data. This can't be undone."
              confirmLabel="Delete everything"
              confirmDestructive
              onConfirm={handleDeleteAccount}
              onCancel={() => setShowDeleteConfirm(false)}
              isLoading={deleting}
            />
          )}
        </div>
      ) : (
        /* ═══════════════════════════════════════════
           ═══  NOT SIGNED IN — AUTH FORMS  ═══
           ═══════════════════════════════════════════ */
        <div className="flex flex-col gap-6">

          {showForgotPassword ? (
            /* ─── Forgot password form ─── */
            <div className="rounded-2xl bg-surface border border-foreground/15 p-6 animate-in fade-in duration-200">
              <h3
                className="text-[19px] font-semibold tracking-[-0.01em] text-foreground mb-1"
              >
                Reset your password
              </h3>
              <p className="text-muted text-sm mb-5">
                Enter your email and we&apos;ll send you a link to reset your password.
              </p>

              {resetSent ? (
                <div className="text-center py-4">
                  <div className="w-12 h-12 rounded-full bg-sage/15 flex items-center justify-center mx-auto mb-3">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--sage)"
                         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                  </div>
                  <p className="text-foreground text-sm font-medium mb-1">Check your email</p>
                  <p className="text-muted text-xs mb-4">
                    We sent a reset link to <span className="text-secondary">{resetEmail}</span>.
                    Click the link in the email to set a new password.
                  </p>
                  <button
                    onClick={() => { setShowForgotPassword(false); setResetSent(false); setResetEmail(""); setMode("signin"); }}
                    className="text-terracotta text-sm hover:text-terracotta-light transition-colors"
                  >
                    Back to sign in
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="flex flex-col gap-3">
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="Email address"
                    aria-label="Email address"
                    required
                    autoFocus
                    className={inputClass}
                  />
                  {resetError && <p className="text-red-400 text-xs">{resetError}</p>}
                  <button
                    type="submit"
                    disabled={resetSending}
                    className="w-full py-3.5 rounded-full bg-terracotta text-cream font-semibold text-sm
                               tracking-wide hover:bg-terracotta-light active:scale-[0.98]
                               transition-all duration-200 disabled:opacity-50 mt-1"
                  >
                    {resetSending ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-3.5 h-3.5 border-2 border-cream/30 border-t-cream rounded-full animate-spin" role="status" aria-label="Loading" />
                        Sending...
                      </span>
                    ) : "Send reset link"}
                  </button>
                </form>
              )}

              {!resetSent && (
                <p className="text-center text-muted text-xs mt-4">
                  <button
                    onClick={() => { setShowForgotPassword(false); setResetError(""); }}
                    className="text-terracotta hover:text-terracotta-light transition-colors"
                  >
                    Back to sign in
                  </button>
                </p>
              )}
            </div>
          ) : (
            /* ─── Sign up / Sign in form ─── */
            <div className="rounded-2xl bg-surface border border-foreground/15 p-6">
              <h3
                className="text-[19px] font-semibold tracking-[-0.01em] text-foreground mb-1"
              >
                {mode === "signup" ? "Create an account" : "Welcome back"}
              </h3>
              <p className="text-muted text-sm mb-5">
                {mode === "signup"
                  ? "Save your chart so it's always here when you come back."
                  : "Sign in to load your saved chart."}
              </p>

              {successMessage && (
                <p className={`text-sm mb-4 p-3 rounded-xl border ${
                  authError
                    ? "text-red-400 bg-red-400/10 border-red-400/20"
                    : "text-sage bg-sage/10 border-sage/20"
                }`}>
                  {successMessage}
                </p>
              )}

              {/* ─── Social login buttons ─── */}
              <div className="flex flex-col gap-2.5 mb-5">
                <button
                  onClick={() => handleSocialLogin("google")}
                  className="w-full flex items-center justify-center gap-3 py-3 rounded-xl
                             bg-card border border-foreground/15 text-foreground text-sm font-medium
                             hover:bg-elevated active:scale-[0.98] transition-all duration-200"
                >
                  <GoogleIcon />
                  Continue with Google
                </button>
              </div>

              {/* ─── Divider ─── */}
              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px bg-foreground/10" />
                <span className="text-muted text-xs">or</span>
                <div className="flex-1 h-px bg-foreground/10" />
              </div>

              {/* ─── Email/password form ─── */}
              <form onSubmit={handleAuthSubmit} className="flex flex-col gap-3">
                {mode === "signup" && (
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Your name"
                    aria-label="Your name"
                    className={inputClass}
                  />
                )}

                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="Email"
                  aria-label="Email"
                  required
                  className={inputClass}
                />

                <input
                  type="password"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  placeholder="Password (6+ characters)"
                  aria-label="Password"
                  required
                  minLength={6}
                  className={inputClass}
                />

                {mode === "signin" && (
                  <button
                    type="button"
                    onClick={() => { setShowForgotPassword(true); setResetEmail(formEmail); setError(""); }}
                    className="text-xs text-terracotta/70 hover:text-terracotta transition-colors self-end -mt-1"
                  >
                    Forgot password?
                  </button>
                )}

                {error && (
                  <p className="text-terracotta text-xs">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-full bg-terracotta text-cream font-semibold text-sm
                             tracking-wide hover:bg-terracotta-light active:scale-[0.98]
                             transition-all duration-200 disabled:opacity-50 mt-1"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-3.5 h-3.5 border-2 border-cream/30 border-t-cream rounded-full animate-spin" role="status" aria-label="Loading" />
                      {mode === "signup" ? "Creating account..." : "Signing in..."}
                    </span>
                  ) : mode === "signup" ? (
                    "Create account"
                  ) : (
                    "Sign in"
                  )}
                </button>
              </form>

              <p className="text-center text-muted text-xs mt-4">
                {mode === "signup" ? (
                  <>
                    Already have an account?{" "}
                    <button
                      onClick={() => { setMode("signin"); setError(""); setSuccessMessage(""); }}
                      className="text-terracotta hover:text-terracotta-light transition-colors"
                    >
                      Sign in
                    </button>
                  </>
                ) : (
                  <>
                    Need an account?{" "}
                    <button
                      onClick={() => { setMode("signup"); setError(""); setSuccessMessage(""); }}
                      className="text-terracotta hover:text-terracotta-light transition-colors"
                    >
                      Sign up
                    </button>
                  </>
                )}
              </p>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
