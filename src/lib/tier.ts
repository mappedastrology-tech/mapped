/**
 * Tier System — Feature gating, paywall logic, and tier definitions.
 *
 * Three tiers:
 *   - free ($0): the whole astrology app — chart, transits, almanac, journal,
 *     learn, the one oracle deck every account picks at signup. No AI.
 *   - mid ($11.11/mo "Mapped+"): the above plus every AI feature — Dolly, the
 *     ritual wizard, horoscopes, chart interpretation, palmistry.
 *   - max ($22.22/mo "Mapped Complete"): the above plus every oracle deck,
 *     included for as long as the subscription is active.
 *
 * Pricing uses numerology: 11:11 (manifestation), 22:22 (master builder),
 * 5:55 (change/freedom) for one-off deck purchases.
 *
 * Note what is NOT here: the monthly spend ceilings that back the AI tiers.
 * Those live in src/lib/ai/budget.ts, which never reaches the browser — this
 * file is imported by client components, so anything in it ships in the JS
 * bundle and can be read by anyone who opens devtools.
 */

/* ─── Tier definitions ─── */

export type TierLevel = "free" | "mid" | "max";

export interface TierInfo {
  level: TierLevel;
  name: string;
  price: number;         // monthly USD
  annualPrice: number;   // annual USD
}

export const TIERS: Record<TierLevel, TierInfo> = {
  free: { level: "free", name: "Free", price: 0, annualPrice: 0 },
  // Annual is 25% off twelve months, on both tiers — a shade over nine
  // months' money for twelve months of access.
  mid: { level: "mid", name: "Mapped+", price: 11.11, annualPrice: 100 },
  max: { level: "max", name: "Mapped Complete", price: 22.22, annualPrice: 200 },
};

export const DECK_PRICE = 5.55;

/* ─── The new-account trial ─── */

/**
 * Days of Mapped+ every new account gets, so people meet Dolly before paying.
 *
 * Seven, not five. This product's value compounds — the almanac is daily,
 * Dolly's memory builds across conversations, a ritual practice is a habit —
 * and five days never covers a full week or a weekend. Seven is also what
 * people expect a trial to be, so it reads as standard rather than stingy.
 */
export const TRIAL_DAYS = 7;

/**
 * Whether an account is still inside its opening trial.
 *
 * Derived from the profile's created_at rather than a trial_ends_at column
 * that gets written at signup. created_at is set by the database default, so
 * there is nothing for a client to set, nothing to backfill for accounts that
 * already exist, and no way for the trial to be silently re-armed by writing a
 * new date. The cost is that a trial cannot be extended by hand — if that is
 * ever wanted, it should be a promo code, which is already built.
 *
 * A missing or unparseable created_at means no trial: an unknown signup date
 * must not hand out paid access.
 */
export function isTrialActive(createdAt: string | null | undefined, now: Date = new Date()): boolean {
  if (!createdAt) return false;
  const started = new Date(createdAt).getTime();
  if (Number.isNaN(started)) return false;
  return now.getTime() < started + TRIAL_DAYS * 24 * 60 * 60 * 1000;
}

/** Whole days of trial left, rounded up, for display. Zero once it has ended. */
export function trialDaysLeft(createdAt: string | null | undefined, now: Date = new Date()): number {
  if (!isTrialActive(createdAt, now)) return 0;
  const endsAt = new Date(createdAt as string).getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000;
  return Math.max(0, Math.ceil((endsAt - now.getTime()) / (24 * 60 * 60 * 1000)));
}

/**
 * The tier a user actually gets right now: whatever they pay for, or Mapped+
 * while the trial runs, whichever is higher.
 *
 * Taking the higher of the two matters — a trialling user who subscribes to
 * Mapped Complete on day two must not be dropped to Mapped+ for three days.
 *
 * Both the browser (TierProvider) and the server (src/lib/ai/budget.ts) call
 * this, so what the UI offers and what the API allows cannot drift apart.
 */
export function effectiveTier(
  storedTier: string | null | undefined,
  createdAt: string | null | undefined,
  now: Date = new Date(),
): TierLevel {
  const paid: TierLevel =
    storedTier === "mid" || storedTier === "max" ? storedTier : "free";
  if (paid === "free" && isTrialActive(createdAt, now)) return "mid";
  return paid;
}

/* ─── Feature definitions ─── */

import { DAILY_AI_LIMITS, AI_TIER_MULTIPLIER, AI_MULTIPLIER_WORD, dailyLimit } from "@/lib/ai/dailyLimits";

export type FeatureKey =
  | "wizard"
  | "custom_rituals"
  | "full_transits"
  | "multiple_synastry"
  | "astrocartography"
  | "unlimited_dolly"
  | "unlimited_pulls"
  | "skeptic_mode"
  | "antiscia"
  | "deck_purchase"
  | "deep_aspects"
  | "profection_detail"
  | "bookmarks"
  | "push_customization"
  | "almuten"
  | "zr_timeline"
  | "triplicity_lords"
  | "fixed_stars"
  | "lots_beyond_fortune"
  | "planetary_hour_precision"
  | "pdf_export"
  | "composite_charts"
  | "unlimited_family"
  | "unlimited_wizard"
  | "voice_memo_wizard"
  | "multi_day_rituals"
  | "practice_patterns"
  | "multiple_moon_practices"
  | "birth_time_rectification"
  | "ai_features"
  | "more_dolly"
  | "all_decks";

interface FeatureDef {
  key: FeatureKey;
  minTier: TierLevel;
  label: string;
  description: string; // plain language, no jargon
}

const TIER_ORDER: Record<TierLevel, number> = { free: 0, mid: 1, max: 2 };

export const FEATURES: FeatureDef[] = [
  // The two tier-defining gates.
  { key: "ai_features", minTier: "mid", label: "Everything with Dolly", description: "Dolly, the ritual wizard, daily horoscopes, chart readings and palm readings." },
  { key: "more_dolly", minTier: "max", label: `${AI_MULTIPLIER_WORD[AI_TIER_MULTIPLIER.max] ?? `${AI_TIER_MULTIPLIER.max}x`} the time with Dolly`, description: "The same Dolly, with room for much longer conversations and heavier weeks." },
  { key: "all_decks", minTier: "max", label: "Every Oracle Deck", description: "All oracle decks, yours to read with while your subscription is active." },
  // Mapped+ features
  { key: "wizard", minTier: "mid", label: "Ritual Wizard", description: "Create personalized rituals guided by your chart and the current sky." },
  { key: "custom_rituals", minTier: "mid", label: "Custom Rituals", description: "Build and save your own rituals to your daily rotation." },
  { key: "full_transits", minTier: "mid", label: "Full Transits", description: "See all current transits ranked by how strongly they hit your chart." },
  { key: "multiple_synastry", minTier: "mid", label: "Multiple Partners", description: "Compare your chart with more than one person." },
  { key: "astrocartography", minTier: "mid", label: "Astrocartography", description: "See where your planetary lines cross the globe and what they mean for you there." },
  // Not "Unlimited Dolly — ask as much as you like", which was false, and not
  // a message count either, which is not a thing a subscription advertises
  // and would invite a comparison nobody benefits from. Non-absolute language
  // here; the actual limits live in the Terms, where limits belong.
  { key: "unlimited_dolly", minTier: "mid", label: "Dolly, every day", description: "Ask about your chart, your timing, the people in your life — and she remembers your past conversations. Usage limits apply." },
  { key: "unlimited_pulls", minTier: "mid", label: "Unlimited Pulls", description: "Pull cards as many times as you want each day." },
  { key: "skeptic_mode", minTier: "mid", label: "Skeptic Mode", description: "See the reasoning and tradition behind every interpretation." },
  { key: "antiscia", minTier: "mid", label: "Antiscia Contacts", description: "Hidden connections between your chart and another person's." },
  { key: "deck_purchase", minTier: "mid", label: "Deck Purchases", description: "Buy additional tarot and oracle decks." },
  { key: "deep_aspects", minTier: "mid", label: "Deep Aspects", description: "Detailed aspect interpretations with context and examples." },
  { key: "profection_detail", minTier: "mid", label: "Profection Detail", description: "A deeper look at your current annual profection year." },
  { key: "bookmarks", minTier: "mid", label: "Bookmarks", description: "Save your favorite reads to come back to." },
  { key: "push_customization", minTier: "mid", label: "Notification Customization", description: "Fine-tune which notifications you receive and when." },
  // Mapped+ features (formerly split across mid/top)
  { key: "almuten", minTier: "mid", label: "Almuten Figuris", description: "Your chart's soul ruler — a medieval calculation of the most powerful planet." },
  { key: "zr_timeline", minTier: "mid", label: "Full ZR Timeline", description: "See every zodiacal releasing chapter of your life, past and future." },
  { key: "triplicity_lords", minTier: "mid", label: "Triplicity Lords", description: "Three planets that rule different thirds of your life." },
  { key: "fixed_stars", minTier: "mid", label: "Fixed Star Contacts", description: "Ancient stars that touch your personal planets." },
  { key: "lots_beyond_fortune", minTier: "mid", label: "Arabic Lots", description: "Calculated points beyond Part of Fortune — Spirit, Eros, Necessity." },
  { key: "planetary_hour_precision", minTier: "mid", label: "Planetary Hour Precision", description: "Wizard outputs timed to the exact planetary hour." },
  { key: "pdf_export", minTier: "mid", label: "PDF Chart Export", description: "Download your full chart as a formatted PDF." },
  { key: "composite_charts", minTier: "mid", label: "Composite Charts", description: "The merged chart of a relationship — what you create together." },
  { key: "unlimited_family", minTier: "mid", label: "Unlimited Family Map", description: "Add as many family members as you want to your relational map." },
  { key: "unlimited_wizard", minTier: "mid", label: "Rituals on demand", description: "Create a ritual whenever you need one, shaped to your chart and the current sky. Usage limits apply." },
  { key: "voice_memo_wizard", minTier: "mid", label: "Voice Memo Input", description: "Speak your intention to the wizard instead of typing." },
  { key: "multi_day_rituals", minTier: "mid", label: "Multi-Day Sequences", description: "Rituals that span multiple days as a connected practice." },
  { key: "practice_patterns", minTier: "mid", label: "Practice Patterns", description: "See trends and insights across your ritual practice over time." },
  { key: "multiple_moon_practices", minTier: "mid", label: "Multiple Moon Practices", description: "Run more than one moon practice simultaneously." },
  { key: "birth_time_rectification", minTier: "mid", label: "Birth Time Rectification", description: "Estimate your birth time from life events and physical traits." },
];

/* ─── Feature gating utilities ─── */

/**
 * Check if a user's tier level allows access to a feature.
 */
export function hasAccess(userTier: TierLevel, feature: FeatureKey): boolean {
  const def = FEATURES.find(f => f.key === feature);
  if (!def) return true; // Unknown feature = allow
  return TIER_ORDER[userTier] >= TIER_ORDER[def.minTier];
}

/**
 * Get the minimum tier needed for a feature.
 */
export function getMinTier(feature: FeatureKey): TierLevel {
  const def = FEATURES.find(f => f.key === feature);
  return def?.minTier || "free";
}

/**
 * Get feature info for paywall display.
 */
export function getFeatureInfo(feature: FeatureKey): FeatureDef | null {
  return FEATURES.find(f => f.key === feature) || null;
}

/* ─── Usage limits ─── */

export const USAGE_LIMITS = {
  free: {
    // Zero, not five: AI is what separates free from paid, so the free tier
    // gets none of it rather than a trial trickle.
    dollyMessagesPerDay: 0,
    pullsPerDay: 1,
    synastryPartners: 1,
    familyMembers: 10,
    wizardPerMonth: 0,
    transitsShown: 3,
  },
  mid: {
    // Not Infinity: the server enforces this, and a UI that believes otherwise
    // cannot warn anyone they are close to it.
    dollyMessagesPerDay: dailyLimit("dolly", "mid"),
    pullsPerDay: Infinity,
    synastryPartners: Infinity,
    familyMembers: Infinity,
    wizardPerMonth: Infinity,
    transitsShown: Infinity,
  },
  max: {
    dollyMessagesPerDay: dailyLimit("dolly", "max"),
    pullsPerDay: Infinity,
    synastryPartners: Infinity,
    familyMembers: Infinity,
    wizardPerMonth: Infinity,
    transitsShown: Infinity,
  },
} as const;

/**
 * Get usage limits for a tier.
 */
export function getLimits(tier: TierLevel) {
  return USAGE_LIMITS[tier];
}

/* ─── Paywall cooldown ─── */

const PAYWALL_COOLDOWN_KEY = "mapped:paywall-dismissed";
const COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Check if a paywall for a feature was recently dismissed.
 */
export function isPaywallCoolingDown(feature: FeatureKey): boolean {
  try {
    const raw = localStorage.getItem(PAYWALL_COOLDOWN_KEY);
    if (!raw) return false;
    const dismissed: Record<string, number> = JSON.parse(raw);
    const ts = dismissed[feature];
    if (!ts) return false;
    return Date.now() - ts < COOLDOWN_MS;
  } catch { return false; }
}

/**
 * Record that a paywall for a feature was dismissed.
 */
export function recordPaywallDismissed(feature: FeatureKey): void {
  try {
    const raw = localStorage.getItem(PAYWALL_COOLDOWN_KEY);
    const dismissed: Record<string, number> = raw ? JSON.parse(raw) : {};
    dismissed[feature] = Date.now();
    localStorage.setItem(PAYWALL_COOLDOWN_KEY, JSON.stringify(dismissed));
  } catch { /* ignore */ }
}

/* ─── Wizard usage tracking ─── */

const WIZARD_USAGE_KEY = "mapped:wizard-usage";

export function getWizardUsageThisMonth(): number {
  try {
    const raw = localStorage.getItem(WIZARD_USAGE_KEY);
    if (!raw) return 0;
    const data: { month: string; count: number } = JSON.parse(raw);
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    if (data.month !== currentMonth) return 0;
    return data.count;
  } catch { return 0; }
}

export function incrementWizardUsage(): void {
  try {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const raw = localStorage.getItem(WIZARD_USAGE_KEY);
    let data: { month: string; count: number } = raw ? JSON.parse(raw) : { month: currentMonth, count: 0 };
    if (data.month !== currentMonth) data = { month: currentMonth, count: 0 };
    data.count += 1;
    localStorage.setItem(WIZARD_USAGE_KEY, JSON.stringify(data));
  } catch { /* ignore */ }
}

/* ─── Dolly usage tracking ─── */

const DOLLY_USAGE_KEY = "mapped:dolly-usage";

export function getDollyUsageToday(): number {
  try {
    const raw = localStorage.getItem(DOLLY_USAGE_KEY);
    if (!raw) return 0;
    const data: { date: string; count: number } = JSON.parse(raw);
    const today = new Date().toISOString().slice(0, 10);
    if (data.date !== today) return 0;
    return data.count;
  } catch { return 0; }
}

export function incrementDollyUsage(): void {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const raw = localStorage.getItem(DOLLY_USAGE_KEY);
    let data: { date: string; count: number } = raw ? JSON.parse(raw) : { date: today, count: 0 };
    if (data.date !== today) data = { date: today, count: 0 };
    data.count += 1;
    localStorage.setItem(DOLLY_USAGE_KEY, JSON.stringify(data));
  } catch { /* ignore */ }
}

/* ─── Pull usage tracking ─── */

const PULL_USAGE_KEY = "mapped:pull-usage";

export function getPullUsageToday(): number {
  try {
    const raw = localStorage.getItem(PULL_USAGE_KEY);
    if (!raw) return 0;
    const data: { date: string; count: number } = JSON.parse(raw);
    const today = new Date().toISOString().slice(0, 10);
    if (data.date !== today) return 0;
    return data.count;
  } catch { return 0; }
}

export function incrementPullUsage(): void {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const raw = localStorage.getItem(PULL_USAGE_KEY);
    let data: { date: string; count: number } = raw ? JSON.parse(raw) : { date: today, count: 0 };
    if (data.date !== today) data = { date: today, count: 0 };
    data.count += 1;
    localStorage.setItem(PULL_USAGE_KEY, JSON.stringify(data));
  } catch { /* ignore */ }
}
