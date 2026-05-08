"use client";

/**
 * Account page — full account management.
 *
 * Signed out: Create account / Sign in (with Google + Apple social login)
 * Signed in: Edit profile, change password, zodiac prefs, delete account, sign out
 * Reset mode: Set a new password after clicking email reset link
 */

import { Suspense, useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useTheme } from "@/components/ThemeProvider";
import { useTier } from "@/components/TierProvider";
import { PlansPage } from "@/components/Paywall";
import { TIERS, FEATURES, type TierLevel } from "@/lib/tier";

export default function AccountPageWrapper() {
  return (
    <Suspense fallback={
      <main className="flex-1 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-terracotta/30 border-t-terracotta rounded-full animate-spin" />
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
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <div className="absolute inset-0 backdrop-blur-[2px]" style={{ backgroundColor: "var(--modal-overlay)" }} onClick={onCancel} />
      <div className="relative bg-background rounded-2xl border border-foreground/15 p-6 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <h3
          className="text-lg text-foreground mb-2"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {title}
        </h3>
        <p className="text-foreground/60 text-sm mb-6 leading-relaxed">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 py-2.5 rounded-full border border-foreground/18 text-foreground/60 text-sm
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
                <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
        <p className="text-xs uppercase tracking-widest text-foreground/40">{label}</p>
        {!editing && (
          <button
            onClick={() => { setEditing(true); setError(null); setSuccess(false); }}
            className="text-xs text-terracotta/70 hover:text-terracotta transition-colors"
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
            autoFocus
            className="w-full px-3 py-2.5 rounded-xl bg-background border border-foreground/18
                       text-foreground text-sm placeholder:text-foreground/30
                       focus:outline-none focus:border-terracotta/50 focus:ring-1 focus:ring-terracotta/25"
            onKeyDown={(e) => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") { setEditing(false); setDraft(value); } }}
          />
          {error && <p className="text-red-400 text-xs">{error}</p>}
          {helpText && <p className="text-foreground/30 text-[10px]">{helpText}</p>}
          <div className="flex gap-2">
            <button
              onClick={() => { setEditing(false); setDraft(value); setError(null); }}
              disabled={saving}
              className="flex-1 py-2 rounded-xl border border-foreground/15 text-foreground/50 text-xs
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
          <p className="text-foreground/80 text-sm">{value || "—"}</p>
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
      <p className="text-xs uppercase tracking-widest text-foreground/40 mb-1">Ritual Tools</p>
      <p className="text-[11px] text-foreground/30 mb-4">
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
              <p className={`text-[12px] font-medium ${myTools[tool.id] ? "text-foreground" : "text-foreground/50"}`}>
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

  useEffect(() => {
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setLoading(false); return; }
        const { data } = await supabase
          .from("profiles")
          .select("birth_time_precision, birth_time, birth_time_window")
          .eq("id", user.id)
          .single();
        if (data) {
          setPrecision(data.birth_time_precision || "unknown");
        }
      } catch { /* ignore */ }
      setLoading(false);
    })();
  }, []);

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
    unknown: "text-foreground/40",
  };

  return (
    <div id="birth-time" className="rounded-2xl bg-surface border border-foreground/15 p-5">
      <p className="text-xs uppercase tracking-widest text-foreground/40 mb-3">Birth Time</p>
      <div className="flex items-center justify-between mb-3">
        <span className={`text-sm font-medium ${badgeColors[precision]}`}>
          {precisionLabels[precision] || "Unknown"}
        </span>
        {precision === "rectified" && (
          <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber/10 border border-amber/20 text-amber italic">rectified</span>
        )}
      </div>

      {precision !== "exact" && (
        <div className="flex flex-col gap-2 mt-2">
          <button
            onClick={() => router.push("/account#edit-birth-time")}
            className="w-full py-2.5 rounded-xl bg-terracotta/10 border border-terracotta/20 text-terracotta text-xs font-medium hover:bg-terracotta/15 transition-colors"
          >
            Update with exact time
          </button>
          {precision === "unknown" && (
            <button
              onClick={() => router.push("/rectification")}
              className="w-full py-2.5 rounded-xl border border-foreground/15 text-foreground/50 text-xs font-medium hover:border-foreground/25 transition-colors"
            >
              Try rectification
            </button>
          )}
          <p className="text-[10px] text-foreground/35 leading-relaxed mt-1">
            {precision === "unknown"
              ? "Your chart is reduced without a birth time. Most features work, but some (like astrocartography) need the exact minute."
              : "Your Rising sign and houses are best-guess based on the window you provided."}
          </p>
        </div>
      )}
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
      <p className="text-xs uppercase tracking-widest text-foreground/40 mb-1">Almanac</p>
      <p className="text-[11px] text-foreground/30 mb-4">
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
              <p className={`text-[13px] font-medium ${prefs[opt.id] ? "text-foreground" : "text-foreground/50"}`}>
                {opt.label}
              </p>
              <p className="text-[10px] text-foreground/30">{opt.desc}</p>
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

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermissionState(Notification.permission);
    } else {
      setPermissionState("unsupported");
    }

    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      const { data } = await supabase.from("profiles").select("notification_preferences").eq("id", session.user.id).single();
      if (data?.notification_preferences) {
        const np = data.notification_preferences;
        // Map full prefs back to simplified view (handles existing users)
        if ("moon_phases" in np) {
          setPrefs(np);
        } else {
          setPrefs({
            moon_phases: np.full_moon ?? true,
            your_chart: np.major_transits ?? true,
            daily_message: np.daily_content ?? false,
          });
        }
      } else {
        setPrefs({
          moon_phases: true, your_chart: true, daily_message: false,
        });
      }
      setLoaded(true);
    }
    load();

    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
      import("@/lib/notifications").then(({ initPushNotifications }) => {
        initPushNotifications();
      });
    }
  }, []);

  async function handleToggleNotifications() {
    if (permissionState === "granted") {
      // Already granted — toggling off just updates prefs, browser permission stays
      return;
    }
    setRequesting(true);
    try {
      const { requestPermission, registerServiceWorker, subscribeToPush } = await import("@/lib/notifications");
      const result = await requestPermission();
      setPermissionState(result);
      if (result === "granted") {
        await registerServiceWorker();
        await subscribeToPush();
      }
    } catch (err) {
      console.error("Permission request failed:", err);
    }
    setRequesting(false);
  }

  async function save(updated: Record<string, boolean | number | string | null>) {
    setSaving(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      // Map simplified prefs to the full preference structure for the cron handler
      const fullPrefs = {
        full_moon: !!updated.moon_phases,
        new_moon: !!updated.moon_phases,
        quarter_moon: false,
        major_transits: !!updated.your_chart,
        retrograde_stations: !!updated.your_chart,
        birthday_week: !!updated.your_chart,
        solar_return: !!updated.your_chart,
        eclipses: !!updated.moon_phases,
        mercury_retrograde: !!updated.your_chart,
        major_ingresses: !!updated.your_chart,
        daily_content: !!updated.daily_message,
        practice_reminders: !!updated.moon_phases,
        re_engagement: true,
        preferred_hour: 19,
        paused_until: null,
        email_marketing: false,
      };
      await supabase.from("profiles").update({ notification_preferences: fullPrefs }).eq("id", session.user.id);
    }
    setSaving(false);
  }

  function toggle(key: string) {
    const updated = { ...prefs, [key]: !prefs[key] };
    setPrefs(updated);
    save(updated);
  }

  if (!loaded) return null;

  const isEnabled = permissionState === "granted";

  const categories = [
    { key: "moon_phases", label: "Moon phases", desc: "Full moons, new moons, and eclipses" },
    { key: "your_chart", label: "Your chart", desc: "Transits, retrogrades, and birthdays" },
    { key: "daily_message", label: "Daily message", desc: "A short note each morning" },
  ];

  return (
    <div className="rounded-2xl bg-surface border border-foreground/15 overflow-hidden">
      {/* Master toggle row */}
      <div className="flex items-center justify-between px-5 py-4">
        <div>
          <p className="text-foreground text-[15px] font-semibold">Notifications</p>
          {permissionState === "denied" && (
            <p className="text-foreground/40 text-[11px] mt-0.5">Blocked in browser settings</p>
          )}
          {permissionState === "unsupported" && (
            <p className="text-foreground/40 text-[11px] mt-0.5">Add to home screen to enable</p>
          )}
        </div>
        {permissionState !== "unsupported" && (
          <ToggleSwitch
            checked={isEnabled}
            onChange={handleToggleNotifications}
            disabled={requesting || permissionState === "denied"}
          />
        )}
      </div>

      {/* Category toggles — only shown when enabled */}
      {isEnabled && (
        <div className="border-t border-foreground/8">
          {categories.map((cat, i) => (
            <div
              key={cat.key}
              className={`flex items-center justify-between px-5 py-3.5 ${
                i < categories.length - 1 ? "border-b border-foreground/5" : ""
              }`}
            >
              <div className="flex-1 mr-4">
                <p className="text-foreground/80 text-[14px] font-medium">{cat.label}</p>
                <p className="text-foreground/35 text-[12px] mt-0.5">{cat.desc}</p>
              </div>
              <ToggleSwitch
                checked={!!prefs[cat.key]}
                onChange={() => toggle(cat.key)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Subscription / Plan section ─── */

function SubscriptionSection() {
  const { tier, refreshTier } = useTier();
  const [showPlans, setShowPlans] = useState(false);

  const tierInfo = TIERS[tier];
  const tierFeatures = FEATURES.filter(f => {
    const order: Record<TierLevel, number> = { free: 0, mid: 1, top: 2 };
    return order[f.minTier] <= order[tier];
  });

  // Show a few highlighted features for the current tier
  const highlights = tier === "free"
    ? ["Full natal chart", "Daily transit & moon phase", "One ritual per day", "Dolly (5 msgs/day)"]
    : tier === "mid"
    ? ["Ritual Wizard", "Full transits", "Unlimited Dolly", "Astrocartography"]
    : ["Unlimited Wizard", "ZR timeline", "Fixed stars", "Composite charts"];

  return (
    <>
      <div className="rounded-2xl bg-surface border border-foreground/15 p-5">
        <p className="text-xs uppercase tracking-widest text-foreground/40 mb-3">Your Plan</p>

        {/* Current tier badge */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${
              tier === "free" ? "bg-foreground/30" : tier === "mid" ? "bg-sage" : "bg-terracotta"
            }`} />
            <span className="text-foreground text-base font-semibold" style={{ fontFamily: "var(--font-display)" }}>
              {tierInfo.name}
            </span>
          </div>
          <span className="text-foreground/50 text-sm">
            {tierInfo.price === 0 ? "Free" : `$${tierInfo.price}/mo`}
          </span>
        </div>

        {/* Feature highlights */}
        <div className="space-y-1.5 mb-4">
          {highlights.map((h, i) => (
            <div key={i} className="flex items-center gap-2 text-foreground/60 text-xs">
              <span className="text-sage">✓</span>
              <span>{h}</span>
            </div>
          ))}
        </div>

        {/* Upgrade / See plans CTA */}
        {tier !== "top" ? (
          <button
            onClick={() => setShowPlans(true)}
            className="w-full py-3 rounded-full bg-ink text-cream text-sm font-semibold active:scale-[0.98] transition-all"
          >
            {tier === "free" ? "See plans" : "Upgrade to Top"}
          </button>
        ) : (
          <p className="text-center text-sage/70 text-xs font-medium py-2">
            You have access to everything ✦
          </p>
        )}

        {/* Manage billing note */}
        {tier !== "free" && (
          <p className="text-center text-foreground/30 text-[10px] mt-2">
            Cancel or change plan anytime in your app store subscriptions.
          </p>
        )}
      </div>

      {/* Plans comparison modal */}
      {showPlans && (
        <PlansPage
          currentTier={tier}
          onClose={() => setShowPlans(false)}
          onSelectTier={async (selectedTier) => {
            try {
              const { data: { session } } = await supabase.auth.getSession();
              if (!session?.user) return;
              await supabase
                .from("profiles")
                .update({ tier: selectedTier })
                .eq("id", session.user.id);
              await refreshTier();
            } catch { /* ignore */ }
            setShowPlans(false);
          }}
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
        // Refresh tier in case it was upgraded
        await refreshTier();
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
      <p className="text-xs uppercase tracking-widest text-foreground/40 mb-3">Promo Code</p>
      <div className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => { setCode(e.target.value.toUpperCase()); setStatus("idle"); setMessage(""); }}
          placeholder="Enter code"
          className="flex-1 px-3 py-2.5 rounded-xl bg-background border border-foreground/15 text-foreground text-sm placeholder:text-foreground/30 focus:outline-none focus:border-sage/50 tracking-wider font-mono"
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
    </div>
  );
}

/* ─── Theme / Appearance section ─── */

function ThemeSection() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="rounded-2xl bg-surface border border-foreground/15 p-5">
      <p className="text-xs uppercase tracking-widest text-foreground/40 mb-3">Appearance</p>
      <div className="flex gap-2">
        {([
          { value: "light" as const, label: "Light", desc: "Warm Altar", icon: "☀️" },
          { value: "dark" as const, label: "Dark", desc: "Spell Book", icon: "🌙" },
        ]).map((opt) => (
          <button
            key={opt.value}
            onClick={() => setTheme(opt.value)}
            className={`flex-1 flex flex-col items-center gap-1.5 py-4 rounded-xl text-sm font-medium transition-all border ${
              theme === opt.value
                ? "bg-terracotta/15 border-terracotta/40 text-terracotta"
                : "bg-background border-foreground/18 text-foreground/50 hover:border-foreground/20"
            }`}
          >
            <span className="text-lg">{opt.icon}</span>
            <span>{opt.label}</span>
            <span className="text-[10px] opacity-60">{opt.desc}</span>
          </button>
        ))}
      </div>
      <p className="text-foreground/30 text-[10px] mt-2">
        Changes how the entire app looks. Defaults to your device setting.
      </p>
    </div>
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
        <p className="text-xs uppercase tracking-widest text-foreground/40">About Our Sources</p>
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round"
          className={`text-foreground/30 transition-transform ${expanded ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {expanded && (
        <div className="mt-4 space-y-3 text-[12px] leading-[1.7] text-foreground/55">
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
          <div className="pt-2 border-t border-foreground/8 space-y-2 text-[11px] text-foreground/40">
            <p>
              <strong className="text-foreground/50">Chakras:</strong> The chakra framework Mapped uses is a Western
              synthesis of practices originating in Hindu and Buddhist tantric tradition.
            </p>
            <p>
              <strong className="text-foreground/50">Sage:</strong> White sage is sacred to Indigenous communities in
              California (especially Chumash and Cahuilla peoples). Mapped recommends garden sage by default.
            </p>
            <p>
              <strong className="text-foreground/50">Crystals:</strong> Crystals are mined globally, often in conditions
              that are environmentally or ethically concerning. Buy from sellers you trust.
            </p>
          </div>
        </div>
      )}
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

  // Zodiac system preference
  const [zodiacSystem, setZodiacSystem] = useState<"tropical" | "sidereal">("tropical");
  const [ayanamsa, setAyanamsa] = useState<"lahiri" | "krishnamurti" | "raman">("lahiri");
  const [savingPrefs, setSavingPrefs] = useState(false);

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
          const { data: profile } = await supabase
            .from("profiles")
            .select("zodiac_system, ayanamsa")
            .eq("id", session.user.id)
            .single();
          if (profile) {
            if (profile.zodiac_system) setZodiacSystem(profile.zodiac_system as "tropical" | "sidereal");
            if (profile.ayanamsa) setAyanamsa(profile.ayanamsa as "lahiri" | "krishnamurti" | "raman");
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
      router.push("/");
    } catch (err) {
      setDeleting(false);
      setShowDeleteConfirm(false);
      setError(err instanceof Error ? err.message : "Failed to delete account.");
    }
  }

  async function saveZodiacPreference(system: "tropical" | "sidereal", ayan: "lahiri" | "krishnamurti" | "raman") {
    setSavingPrefs(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await supabase
          .from("profiles")
          .update({ zodiac_system: system, ayanamsa: ayan })
          .eq("id", session.user.id);
      }
    } catch (err) {
      console.error("Failed to save zodiac preference:", err);
    } finally {
      setSavingPrefs(false);
    }
  }

  async function handleSignOut() {
    try { await supabase.auth.signOut(); } catch { /* clear local state anyway */ }
    sessionStorage.clear();
    setEmail(null);
    setUserName(null);
    setUserId(null);
    router.push("/");
  }

  const inputClass = `w-full px-4 py-3.5 rounded-xl bg-surface border border-foreground/18
                      text-foreground placeholder:text-foreground/30
                      focus:outline-none focus:border-terracotta/50 focus:ring-1 focus:ring-terracotta/25
                      text-base`;

  if (isLoading) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-terracotta/30 border-t-terracotta rounded-full animate-spin" />
      </main>
    );
  }

  return (
    <main className="flex-1 flex flex-col px-6 py-8 max-w-lg mx-auto w-full">
      <button
        onClick={() => router.back()}
        className="text-foreground/40 text-sm mb-8 self-start hover:text-foreground/60 transition-colors"
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
          <p className="text-foreground/60 text-xs leading-relaxed">
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
              <p className="text-xs uppercase tracking-widest text-foreground/40">Password</p>
              {!showChangePassword && (
                <button
                  onClick={() => setShowChangePassword(true)}
                  className="text-xs text-terracotta/70 hover:text-terracotta transition-colors"
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
                  autoFocus
                  className="w-full px-3 py-2.5 rounded-xl bg-background border border-foreground/18
                             text-foreground text-sm placeholder:text-foreground/30
                             focus:outline-none focus:border-terracotta/50 focus:ring-1 focus:ring-terracotta/25"
                />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full px-3 py-2.5 rounded-xl bg-background border border-foreground/18
                             text-foreground text-sm placeholder:text-foreground/30
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
                    className="flex-1 py-2 rounded-xl border border-foreground/15 text-foreground/50 text-xs
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
              <p className="text-foreground/80 text-sm">••••••••</p>
            )}
          </div>

          {/* ─── Zodiac System Preference ─── */}
          <div className="rounded-2xl bg-surface border border-foreground/15 p-5">
            <p className="text-xs uppercase tracking-widest text-foreground/40 mb-3">Zodiac System</p>
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => {
                  setZodiacSystem("tropical");
                  saveZodiacPreference("tropical", ayanamsa);
                }}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all border
                  ${zodiacSystem === "tropical"
                    ? "bg-terracotta/15 border-terracotta/40 text-terracotta"
                    : "bg-background border-foreground/18 text-foreground/50 hover:border-foreground/20"
                  }`}
              >
                Western
                <span className="block text-[10px] mt-0.5 opacity-60">Tropical</span>
              </button>
              <button
                onClick={() => {
                  setZodiacSystem("sidereal");
                  saveZodiacPreference("sidereal", ayanamsa);
                }}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all border
                  ${zodiacSystem === "sidereal"
                    ? "bg-terracotta/15 border-terracotta/40 text-terracotta"
                    : "bg-background border-foreground/18 text-foreground/50 hover:border-foreground/20"
                  }`}
              >
                Vedic
                <span className="block text-[10px] mt-0.5 opacity-60">Sidereal</span>
              </button>
            </div>

            {zodiacSystem === "sidereal" && (
              <div className="flex flex-col gap-2 animate-in fade-in duration-200">
                <p className="text-xs text-foreground/40">Ayanamsa</p>
                <div className="flex gap-2">
                  {([
                    { value: "lahiri" as const, label: "Lahiri" },
                    { value: "krishnamurti" as const, label: "KP" },
                    { value: "raman" as const, label: "Raman" },
                  ]).map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setAyanamsa(opt.value);
                        saveZodiacPreference(zodiacSystem, opt.value);
                      }}
                      className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all border
                        ${ayanamsa === opt.value
                          ? "bg-amber/15 border-amber/40 text-amber"
                          : "bg-background border-foreground/18 text-foreground/40 hover:border-foreground/20"
                        }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-foreground/30">
                  Most Vedic astrologers use Lahiri. Choose based on your tradition.
                </p>
              </div>
            )}

            {savingPrefs && (
              <p className="text-[10px] text-amber/50 mt-2">Saving...</p>
            )}
            <p className="text-foreground/30 text-[10px] mt-2">
              Changing this will affect how new charts are calculated. Existing charts keep their original system.
            </p>
          </div>

          {/* ─── Birth Time ─── */}
          <BirthTimeSettingsSection />

          {/* ─── Ritual Tools ─── */}
          <RitualToolsSection />

          {/* ─── Almanac Preferences ─── */}
          <AlmanacPrefsSection />

          {/* ─── Notifications ─── */}
          <NotificationSettingsSection />

          {/* ─── Appearance / Theme ─── */}
          <ThemeSection />

          {/* ─── About Our Sources ─── */}
          <SourcesSection />

          {/* ─── Sign out ─── */}
          <button
            onClick={handleSignOut}
            className="mt-4 py-3 rounded-full border border-foreground/18 text-foreground/50
                       text-sm hover:border-foreground/20 hover:text-foreground/70 transition-all"
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
                className="text-lg text-foreground mb-1"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Reset your password
              </h3>
              <p className="text-foreground/40 text-sm mb-5">
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
                  <p className="text-foreground/80 text-sm font-medium mb-1">Check your email</p>
                  <p className="text-foreground/40 text-xs mb-4">
                    We sent a reset link to <span className="text-foreground/60">{resetEmail}</span>.
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
                        <span className="w-3.5 h-3.5 border-2 border-cream/30 border-t-cream rounded-full animate-spin" />
                        Sending...
                      </span>
                    ) : "Send reset link"}
                  </button>
                </form>
              )}

              {!resetSent && (
                <p className="text-center text-foreground/40 text-xs mt-4">
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
                className="text-lg text-foreground mb-1"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {mode === "signup" ? "Create an account" : "Welcome back"}
              </h3>
              <p className="text-foreground/40 text-sm mb-5">
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
                             bg-card border border-foreground/15 text-foreground/80 text-sm font-medium
                             hover:bg-elevated active:scale-[0.98] transition-all duration-200"
                >
                  <GoogleIcon />
                  Continue with Google
                </button>
              </div>

              {/* ─── Divider ─── */}
              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px bg-foreground/10" />
                <span className="text-foreground/30 text-xs">or</span>
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
                    className={inputClass}
                  />
                )}

                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="Email"
                  required
                  className={inputClass}
                />

                <input
                  type="password"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  placeholder="Password (6+ characters)"
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
                      <span className="w-3.5 h-3.5 border-2 border-cream/30 border-t-cream rounded-full animate-spin" />
                      {mode === "signup" ? "Creating account..." : "Signing in..."}
                    </span>
                  ) : mode === "signup" ? (
                    "Create account"
                  ) : (
                    "Sign in"
                  )}
                </button>
              </form>

              <p className="text-center text-foreground/40 text-xs mt-4">
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
