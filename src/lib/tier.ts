/**
 * Tier System — Feature gating, paywall logic, and tier definitions.
 *
 * Three tiers:
 *   - free ($0): generous daily content, 1 deck, 5 Dolly msgs/day, 1 synastry partner
 *   - mid ($11.11/mo): wizard, unlimited Dolly, multiple partners, astrocartography, custom rituals
 *   - top ($22.22/mo): unlimited wizard, ZR timeline, fixed stars, composites, 50% off decks
 *
 * Pricing uses numerology: 11:11 (manifestation), 22:22 (master builder), 5:55 (change/freedom).
 */

/* ─── Tier definitions ─── */

export type TierLevel = "free" | "mid" | "top";

export interface TierInfo {
  level: TierLevel;
  name: string;
  price: number;         // monthly USD
  annualPrice: number;   // annual USD
}

export const TIERS: Record<TierLevel, TierInfo> = {
  free: { level: "free", name: "Free", price: 0, annualPrice: 0 },
  mid: { level: "mid", name: "Mid", price: 11.11, annualPrice: 89 },
  top: { level: "top", name: "Top", price: 22.22, annualPrice: 179 },
};

export const DECK_PRICE = 5.55;
export const DECK_PRICE_TOP = 2.78; // 50% off for top tier

/* ─── Feature definitions ─── */

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
  | "birth_time_rectification";

interface FeatureDef {
  key: FeatureKey;
  minTier: TierLevel;
  label: string;
  description: string; // plain language, no jargon
}

const TIER_ORDER: Record<TierLevel, number> = { free: 0, mid: 1, top: 2 };

export const FEATURES: FeatureDef[] = [
  // Mid features
  { key: "wizard", minTier: "mid", label: "Ritual Wizard", description: "Create personalized rituals guided by your chart and the current sky." },
  { key: "custom_rituals", minTier: "mid", label: "Custom Rituals", description: "Build and save your own rituals to your daily rotation." },
  { key: "full_transits", minTier: "mid", label: "Full Transits", description: "See all current transits ranked by how strongly they hit your chart." },
  { key: "multiple_synastry", minTier: "mid", label: "Multiple Partners", description: "Compare your chart with more than one person." },
  { key: "astrocartography", minTier: "mid", label: "Astrocartography", description: "See where your planetary lines cross the globe and what they mean for you there." },
  { key: "unlimited_dolly", minTier: "mid", label: "Unlimited Dolly", description: "Ask Dolly as many questions as you want, with memory across sessions." },
  { key: "unlimited_pulls", minTier: "mid", label: "Unlimited Pulls", description: "Pull cards as many times as you want each day." },
  { key: "skeptic_mode", minTier: "mid", label: "Skeptic Mode", description: "See the reasoning and tradition behind every interpretation." },
  { key: "antiscia", minTier: "mid", label: "Antiscia Contacts", description: "Hidden connections between your chart and another person's." },
  { key: "deck_purchase", minTier: "mid", label: "Deck Purchases", description: "Buy additional tarot and oracle decks." },
  { key: "deep_aspects", minTier: "mid", label: "Deep Aspects", description: "Detailed aspect interpretations with context and examples." },
  { key: "profection_detail", minTier: "mid", label: "Profection Detail", description: "A deeper look at your current annual profection year." },
  { key: "bookmarks", minTier: "mid", label: "Bookmarks", description: "Save your favorite reads to come back to." },
  { key: "push_customization", minTier: "mid", label: "Notification Customization", description: "Fine-tune which notifications you receive and when." },
  // Top features
  { key: "almuten", minTier: "top", label: "Almuten Figuris", description: "Your chart's soul ruler — a medieval calculation of the most powerful planet." },
  { key: "zr_timeline", minTier: "top", label: "Full ZR Timeline", description: "See every zodiacal releasing chapter of your life, past and future." },
  { key: "triplicity_lords", minTier: "top", label: "Triplicity Lords", description: "Three planets that rule different thirds of your life." },
  { key: "fixed_stars", minTier: "top", label: "Fixed Star Contacts", description: "Ancient stars that touch your personal planets." },
  { key: "lots_beyond_fortune", minTier: "top", label: "Arabic Lots", description: "Calculated points beyond Part of Fortune — Spirit, Eros, Necessity." },
  { key: "planetary_hour_precision", minTier: "top", label: "Planetary Hour Precision", description: "Wizard outputs timed to the exact planetary hour." },
  { key: "pdf_export", minTier: "top", label: "PDF Chart Export", description: "Download your full chart as a formatted PDF." },
  { key: "composite_charts", minTier: "top", label: "Composite Charts", description: "The merged chart of a relationship — what you create together." },
  { key: "unlimited_family", minTier: "top", label: "Unlimited Family Map", description: "Add as many family members as you want to your relational map." },
  { key: "unlimited_wizard", minTier: "top", label: "Unlimited Wizard", description: "No monthly cap on ritual generations." },
  { key: "voice_memo_wizard", minTier: "top", label: "Voice Memo Input", description: "Speak your intention to the wizard instead of typing." },
  { key: "multi_day_rituals", minTier: "top", label: "Multi-Day Sequences", description: "Rituals that span multiple days as a connected practice." },
  { key: "practice_patterns", minTier: "top", label: "Practice Patterns", description: "See trends and insights across your ritual practice over time." },
  { key: "multiple_moon_practices", minTier: "top", label: "Multiple Moon Practices", description: "Run more than one moon practice simultaneously." },
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
    dollyMessagesPerDay: 5,
    pullsPerDay: 1,
    synastryPartners: 1,
    familyMembers: 10,
    wizardPerMonth: 0,
    transitsShown: 3,
  },
  mid: {
    dollyMessagesPerDay: Infinity,
    pullsPerDay: Infinity,
    synastryPartners: Infinity,
    familyMembers: 10,
    wizardPerMonth: 10,
    transitsShown: Infinity,
  },
  top: {
    dollyMessagesPerDay: Infinity,
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
