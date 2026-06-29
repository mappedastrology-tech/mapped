"use client";

/**
 * Maps Tab — your relationship map.
 *
 * Visual scrollable map with You at center and category nodes:
 * Family, Partner, Friends, City.
 * Tap a category to expand its members. Tap a member to see synastry.
 * Family section includes "Generate Family Analysis" for strengths & curses.
 */

import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { calculateChart } from "@/lib/astro/calculateChart";
import { SYNASTRY_VERSION } from "@/lib/astro/calculateSynastry";
import { getGrowthArea, getStrengthArea, getAspectCopy } from "@/lib/astro/growthAreas";
import { toPlatonic } from "@/lib/astro/platonicText";
import { usePaywall } from "@/hooks/usePaywall";
import { useTier } from "@/components/TierProvider";
import { useBirthTime } from "@/components/BirthTimeProvider";
import { TierBPlaceholder } from "@/components/BirthTimeCue";
import { SIGN_FULL } from "@/lib/knowledge";
import InfoTip from "@/components/InfoTip";
import CitySearch, { type LocationResult } from "@/components/CitySearch";
import ChartWheel, { SIGN_NAMES } from "@/components/ChartWheel";
import PlacementAccordion from "@/components/PlacementAccordion";
import DateWheel from "@/components/DateWheel";
import { generateYearSummary, SR_PLANET_HOUSE_HIGHLIGHTS } from "@/lib/solar-return-interpretations";
import { generateRelationshipSummary } from "@/lib/composite-interpretations";
import { getLordOfTheYear, isLordOfYearTransit } from "@/lib/rulers";
import { getTransitIntensity } from "@/lib/transitIntensity";
import ShareCard from "@/components/ShareCard";
import ExportButton from "@/components/ExportButton";
import { WORLD_COUNTRY_PATHS } from "@/lib/worldPaths";
import { getCachedLocation, fetchUserLocation } from "@/lib/userLocation";
import { DEFAULT_COORDS } from "@/lib/celestialMechanics";
import NightSky from "./NightSky";

/* ═══════════════════════════════════════════
   Error Boundary — catches rendering crashes
   ═══════════════════════════════════════════ */
class DetailErrorBoundary extends React.Component<
  { children: React.ReactNode; onReset: () => void },
  { error: Error | null; stack: string }
> {
  constructor(props: { children: React.ReactNode; onReset: () => void }) {
    super(props);
    this.state = { error: null, stack: "" };
  }
  static getDerivedStateFromError(error: Error) {
    return { error, stack: "" };
  }
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[DetailErrorBoundary] Render crash:", error, "\nStack:", error.stack, "\nComponent:", info.componentStack);
    this.setState({ stack: (error.stack || "") + "\n\nComponent tree:" + (info.componentStack || "") });
  }
  render() {
    if (this.state.error) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
          <p className="text-secondary text-sm mb-2">Something went wrong loading this chart.</p>
          <p className="text-muted text-xs mb-4 max-w-sm break-words">Try going back and reopening. If it keeps happening, report it in Account settings.</p>
          <button
            onClick={() => { this.setState({ error: null, stack: "" }); this.props.onReset(); }}
            className="px-5 py-2 rounded-full bg-terracotta text-cream text-sm font-medium"
          >
            Back to your map
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

/* ═══════════════════════════════════════════
   Types
   ═══════════════════════════════════════════ */

interface Connection {
  id: string;
  name: string;
  relationship: string;
  category: string;
  birth_date: string;
  birth_time: string | null;
  unknown_time: boolean;
  city_name: string | null;
  latitude: number | null;
  longitude: number | null;
  timezone: string | null;
  big_three: { sun: string; moon: string; rising: string } | null;
  planets: Planet[] | null;
  houses: unknown[] | null;
  aspects: unknown[] | null;
  special_points: SpecialPoint[] | null;
  midheaven: unknown | null;
  synastry: SynastryData | null;
}

interface Planet {
  name: string;
  sign: string;
  signNum: number;
  position: number;
  absPosition: number;
  house: string | null;
  retrograde: boolean;
}

interface SpecialPoint {
  name: string;
  sign: string;
  signNum: number;
  position: number;
  absPosition: number;
  house: string | null;
  retrograde: boolean;
}

interface SynastryData {
  crossAspects: CrossAspect[];
  fatedContacts: CrossAspect[];
  themes: { title: string; summary: string; score?: number }[];
  harmony: number;
  tension: number;
  totalAspects: number;
}

interface CrossAspect {
  p1Name: string;
  p1Sign: string;
  p2Name: string;
  p2Sign: string;
  aspect: string;
  orb: number;
  fated?: boolean;
  fatedReason?: string;
  fatedCategory?: string;
  fatedCategoryLabel?: string;
  fatedKeywords?: string[];
  fatedWeight?: number;
}

interface UserChart {
  planets: Planet[];
  specialPoints: SpecialPoint[];
  houses?: { number: number; sign: string; signNum: number; position: number; absPosition: number }[];
  bigThree: { sun: string; moon: string; rising: string };
  birthDate?: string;
  birthTime?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  zodiacSystem?: string;
  ayanamsa?: string;
}

interface AstroLine {
  planet: string;
  angle: string;
  points: [number, number][];
  color: string;
  style: string;
  keyword: string;
  meaning: string;
}

interface NearbyLine {
  planet: string;
  angle: string;
  distance: number;
  keyword: string;
  meaning: string;
  color: string;
}

interface Paran {
  planet1: string;
  angle1: string;
  planet2: string;
  angle2: string;
  lat: number;
  lng: number;
  distance: number;
  color1: string;
  color2: string;
}

interface ParentProfile {
  role: string;
  name: string;
  bigThree: string; // e.g. "Taurus Sun · Taurus Moon · Cap Rising"
  shadows: { label: string; planet: string; description: string }[];
  gifts: { label: string; planet: string; description: string }[];
  frictionWithYou: { label: string; source: string; description: string }[];
  harmonyWithYou: { label: string; source: string; description: string }[];
}

interface FamilyAnalysis {
  parentProfiles: ParentProfile[];
  siblingNotes: { trait: string; source: string; description: string }[];
}

interface TimelineEntry {
  id: string;
  cityName: string;
  lat: number;
  lng: number;
  startDate: string; // YYYY-MM-DD or just YYYY
  endDate: string;   // YYYY-MM-DD or "present"
}

interface TransitAspect {
  transitPlanet: string;
  transitSign: string;
  transitRetrograde: boolean;
  natalPlanet: string;
  natalSign: string;
  natalHouse: string | null;
  transitHouse: number;
  aspect: string;
  orb: number;
  startDate?: string;
  exactDate?: string;
  endDate?: string;
}

interface TransitData {
  transitDate: string;
  transitPlanets: { name: string; sign: string; position: number; absPosition: number; retrograde: boolean }[];
  transitAspects: TransitAspect[];
}

/* ═══════════════════════════════════════════
   Aspect Interpretations
   ═══════════════════════════════════════════ */

const ASPECT_NATURE: Record<string, { nature: "harmonious" | "challenging" | "powerful"; keyword: string }> = {
  conjunction: { nature: "powerful", keyword: "merges" },
  trine: { nature: "harmonious", keyword: "flows with" },
  sextile: { nature: "harmonious", keyword: "supports" },
  square: { nature: "challenging", keyword: "clashes with" },
  opposition: { nature: "challenging", keyword: "opposes" },
  quincunx: { nature: "challenging", keyword: "misaligns with" },
};

const PLANET_THEMES: Record<string, string> = {
  Sun: "core identity and life purpose",
  Moon: "emotional needs and instincts",
  Venus: "love language and values",
  Mars: "desire, drive, and passion",
  Mercury: "communication and thinking style",
  Jupiter: "growth, luck, and expansion",
  Saturn: "commitment, boundaries, and lessons",
  Neptune: "dreams, intuition, and idealism",
  Pluto: "power, transformation, and intensity",
  Uranus: "freedom, surprise, and individuality",
  "North Node": "soul's growth direction",
  "South Node": "past-life comfort zone",
  Chiron: "deepest wound and healing gift",
};

function getAspectDescription(a: CrossAspect, platonic = false): string {
  // Fated aspects carry their own rich, direction-aware copy.
  if (a.fatedReason) return platonic ? toPlatonic(a.fatedReason) : a.fatedReason;
  if (!ASPECT_NATURE[a.aspect]) return `Your ${a.p1Name} connects with their ${a.p2Name}.`;
  // Per-planet-pair copy so every aspect reads distinctly (not just a shared
  // "harmonious/challenging" template with the two planet names swapped in).
  return getAspectCopy(a.p1Name, a.p2Name, a.aspect, platonic);
}

/* ═══════════════════════════════════════════
   Transit Interpretations
   ═══════════════════════════════════════════ */

const HOUSE_THEMES: Record<number, { area: string; vibe: string }> = {
  1: { area: "Identity & Self-image", vibe: "How they present themselves and feel about who they are" },
  2: { area: "Money & Values", vibe: "Finances, possessions, self-worth, and what they value" },
  3: { area: "Communication & Mind", vibe: "Daily conversations, learning, siblings, short trips" },
  4: { area: "Home & Family", vibe: "Living situation, family dynamics, emotional foundations" },
  5: { area: "Creativity & Romance", vibe: "Fun, self-expression, dating, children, hobbies" },
  6: { area: "Health & Routine", vibe: "Daily habits, work environment, wellness, self-care" },
  7: { area: "Partnerships", vibe: "Close relationships, contracts, one-on-one dynamics" },
  8: { area: "Transformation & Intimacy", vibe: "Shared resources, deep bonds, endings and rebirths" },
  9: { area: "Adventure & Beliefs", vibe: "Travel, higher learning, philosophy, spiritual growth" },
  10: { area: "Career & Public Image", vibe: "Professional life, reputation, ambition, legacy" },
  11: { area: "Community & Dreams", vibe: "Friendships, groups, future goals, social causes" },
  12: { area: "Subconscious & Solitude", vibe: "Rest, dreams, hidden patterns, spiritual retreat" },
};

const TRANSIT_PLANET_ENERGY: Record<string, { speed: string; keyword: string; energy: string }> = {
  Sun: { speed: "month-long", keyword: "Spotlight", energy: "illuminates and energizes" },
  Moon: { speed: "2-3 day", keyword: "Emotional tone", energy: "stirs emotions and instincts" },
  Mercury: { speed: "2-3 week", keyword: "Mental shift", energy: "changes how they think and communicate" },
  Venus: { speed: "3-4 week", keyword: "Heart pull", energy: "shifts what feels good and who they're drawn to" },
  Mars: { speed: "6-7 week", keyword: "Drive", energy: "fuels ambition, desire, and potential friction" },
  Jupiter: { speed: "year-long", keyword: "Expansion", energy: "brings growth, luck, and opportunity" },
  Saturn: { speed: "2-3 year", keyword: "Lesson", energy: "demands structure, discipline, and maturity" },
  Uranus: { speed: "7-year", keyword: "Disruption", energy: "breaks patterns and sparks sudden change" },
  Neptune: { speed: "14-year", keyword: "Dissolving", energy: "blurs boundaries and heightens intuition" },
  Pluto: { speed: "15-25 year", keyword: "Transformation", energy: "forces deep, irreversible change" },
};

/* ── Transit intensity scoring ──
   Estimates a theme score from its title when no backend score exists (for older data). */
const THEME_TITLE_SCORES: Record<string, number> = {
  "Natural Understanding": 78, "The City Gets You": 78,
  "Push and Pull Dynamic": 72, "The City Challenges Your Identity": 72,
  "Physical Chemistry": 68, "Frustrated Desire": 65,
  "Emotional Resonance": 70, "Emotional Safety": 70, "Emotionally at Home": 70,
  "Emotional Tension": 65, "Emotional Friction": 65, "Emotional Mismatch": 65,
  "Mirror Energy": 62, "Same Frequency": 62,
  "Shared Love Language": 55, "Shared Values": 55, "You Love What This City Loves": 55,
  "Easy Communication": 48, "The City Speaks Your Language": 48,
  "Communication Gaps": 45, "Mental Friction with the City": 45,
  "Authority Dynamic": 58, "The City Disciplines You": 58,
  "Complex Connection": 30, "A Nuanced Relationship": 30,
};
function estimateThemeScore(theme: { title: string; score?: number }): number {
  if (theme.score) return theme.score;
  // Check for element themes
  if (theme.title.startsWith("Shared ") && (theme.title.includes("Energy") || theme.title.includes("DNA"))) return 45;
  return THEME_TITLE_SCORES[theme.title] ?? 50;
}

/* Returns a label, color, and description for a synastry theme score (0-100). */
function getThemeIntensity(score: number): { label: string; color: string; desc: string } {
  if (score >= 80) return { label: "Defining", color: "#c9a961", desc: "A core theme in the relationship — tight aspects with strong planetary weight. This shapes how you experience each other." };
  if (score >= 65) return { label: "Strong", color: "#d4b878", desc: "A major theme — prominent aspects that meaningfully influence the dynamic between you." };
  if (score >= 50) return { label: "Present", color: "#a88a40", desc: "A real part of the relationship, but not the loudest. You'll notice it in certain situations more than others." };
  if (score >= 35) return { label: "Subtle", color: "#5a7a3a", desc: "A faint thread — the connection exists but with wider orbs or softer aspects. It's there, just not front and center." };
  return { label: "Background", color: "#8a7d6b", desc: "A very loose connection — wide orbs or minor aspect types. More of an undertone than something you'd consciously feel." };
}

const TIER_EXPLANATIONS = [
  { label: "Defining", range: "80-100", color: "#c9a961", desc: "Core theme — tight aspects, strong planets" },
  { label: "Strong", range: "65-79", color: "#d4b878", desc: "Major influence on the dynamic" },
  { label: "Present", range: "50-64", color: "#a88a40", desc: "Noticeable in certain situations" },
  { label: "Subtle", range: "35-49", color: "#5a7a3a", desc: "Faint thread — wider orbs, softer aspects" },
  { label: "Background", range: "10-34", color: "#8a7d6b", desc: "Undertone — very loose connection" },
];

/* Transit intensity scoring imported from @/lib/transitIntensity */

/* ── Specific transit-to-natal descriptions ──
   Keyed by "TransitPlanet-NatalPlanet" for unique descriptions.
   Falls back to generic per-planet descriptions. */
const TRANSIT_PAIR_DESC: Record<string, Record<string, string>> = {
  "Pluto-Sun": {
    conjunction: "Pluto is fusing with their core identity. Who they thought they were is being dismantled and rebuilt from the inside. This is a once-in-a-lifetime ego death and rebirth — the person who comes out the other side won't be the same one who went in.",
    square: "Pluto is forcing a confrontation between who they are and who they're becoming. Power struggles with authority figures, control issues surfacing, or an intense drive to prove themselves. Something about their self-image is being challenged at the root.",
    opposition: "Pluto is working through other people — someone in their life is acting as a mirror for their own buried power dynamics. Intense relationships, projection, or a feeling that other people hold all the cards right now.",
    trine: "Pluto is quietly empowering their sense of self. They feel more magnetic, authoritative, and in control without even trying. Good time for leadership moves, deep personal work, or stepping into a version of themselves they've been afraid of.",
    sextile: "Pluto is offering a doorway to personal transformation — but they have to walk through it. Opportunities to deepen their self-understanding, shed old identities, or step into a more authentic version of themselves.",
  },
  "Pluto-Moon": {
    conjunction: "Pluto is excavating their emotional basement. Childhood wounds, unconscious patterns, and deeply buried feelings are being dredged up — not to torture them, but to be processed and released. Emotional catharsis is likely.",
    square: "Their emotional life is under intense pressure. Feelings they've suppressed are forcing their way to the surface. Relationships with women or mother figures may be a battleground. Sleep disruptions, emotional volatility, or compulsive behaviors are common.",
    opposition: "Deep emotional dynamics are playing out through close relationships. Someone may be triggering their deepest insecurities — or they're projecting their fears onto others. Trust issues and emotional power plays are the theme.",
    trine: "Emotional depth comes naturally right now. They can access buried feelings without being overwhelmed by them. Powerful intuition, therapeutic breakthroughs, and emotional resilience. A good period for deep healing work.",
    sextile: "An invitation to do emotional processing they've been putting off. Therapy, journaling, or honest conversations can unlock major breakthroughs. The universe is making it easier to face what usually feels too heavy.",
  },
  "Pluto-Venus": {
    conjunction: "Pluto is overhauling their entire relationship to love, money, and self-worth. Obsessive attractions, financial power shifts, or a complete reevaluation of what and who they value. Existing relationships transform or end.",
    square: "Love and money are battlegrounds right now. Jealousy, possessiveness, or financial control issues are surfacing. They may be drawn to intense, complicated people — or discovering their own shadow side in relationships.",
    opposition: "Someone else is playing the Pluto role — a partner or close person is triggering deep issues around control, jealousy, or financial dependence. The lesson is taking back their own power without destroying the relationship.",
    trine: "Their magnetism is off the charts. Deep, meaningful connections form naturally. Financial intuition is sharp. They can transform their relationship to beauty, pleasure, and money without the usual Pluto pain.",
    sextile: "An opportunity to deepen a relationship or redefine what they value. Could attract a transformative person or financial opportunity if they're willing to be vulnerable.",
  },
  "Pluto-Mars": {
    conjunction: "Their willpower is nuclear right now. Incredible drive, ambition, and raw power — but also the potential for destructive anger, obsession, or reckless intensity. They need a productive outlet or this energy becomes volatile.",
    square: "Rage, frustration, or an overwhelming need to fight something. Power struggles at work or in relationships. They feel like they're hitting a wall and the only option is to bulldoze through it. Channel this or it becomes destructive.",
    opposition: "Other people are provoking their aggression or competitive side. Someone may be trying to dominate them, or they're unconsciously provoking conflict. Physical danger if they're not careful with this energy.",
    trine: "Unstoppable determination without the destructive edge. They can move mountains right now — physical stamina, focused ambition, and the ability to push through obstacles that would normally stop them cold.",
    sextile: "An opportunity to channel intense drive into something productive. Good for physical challenges, career pushes, or confronting fears they've been avoiding.",
  },
  "Pluto-Mercury": {
    conjunction: "Their mind is being rewired. Obsessive thinking, detective-level insight, or a compulsion to uncover hidden truths. They may discover a secret or become fixated on understanding something at the deepest possible level.",
    square: "Mental intensity borders on paranoia. Overthinking, suspicion, or communication breakdowns around sensitive topics. They may say things they can't take back — or discover something they wish they didn't know.",
    trine: "Penetrating mental clarity. They can see through lies, read between lines, and understand complex psychological dynamics effortlessly. Good for research, investigation, writing, or therapy.",
    sextile: "An opportunity to transform how they think and communicate. Deep conversations, psychological insights, or a research rabbit hole that changes their perspective permanently.",
  },
  "Pluto-Jupiter": {
    conjunction: "Massive ambition and the power to back it up. This can manifest as a major success, a spiritual transformation, or an obsessive quest for more — more power, more money, more meaning.",
    square: "Overreach and power inflation. They believe they can do anything, which could lead to spectacular success or spectacular failure. Ethical shortcuts tempt them. The lesson is power with integrity.",
    trine: "Profound growth that feels effortless. Major opportunities for wealth, influence, or spiritual expansion. They're being given the keys to a bigger life if they're willing to transform to fit it.",
  },
  "Pluto-Saturn": {
    conjunction: "The structures of their life are being demolished and rebuilt. Career, authority, long-term plans — everything solid is being tested. What survives this transit is genuinely unshakeable.",
    square: "An immovable object meets an unstoppable force. Institutional power, authority figures, or their own rigid structures are being challenged by forces of deep change. Extremely stressful but ultimately liberating.",
    trine: "They can restructure their life from the ground up with unusual discipline and depth. Institutional power works in their favor. Good for building something that will last decades.",
  },
  "Saturn-Sun": {
    conjunction: "A major maturation point. Life is demanding they grow up in some fundamental way. Heavy responsibility, self-doubt, or a reckoning with their life direction. Difficult but defines the next 29 years.",
    square: "Obstacles and frustrations block their self-expression. Authority figures push back, plans stall, energy feels low. They're being forced to earn what used to come easily. Discipline is the only way through.",
    opposition: "Other people — bosses, partners, institutions — are the source of restriction. They feel limited by commitments or judged by the world. The challenge is owning their authority rather than resenting others'.",
    trine: "Steady, earned progress. Discipline pays off, authority figures support them, and their hard work is recognized. Not exciting, but deeply satisfying. A builder's transit.",
    sextile: "Opportunities through discipline and maturity. A mentor appears, a structure solidifies, or a long-term plan clicks into place. They have to do the work, but the door is open.",
  },
  "Saturn-Moon": {
    conjunction: "Emotional austerity. Loneliness, depression, or a sense that they're carrying the world. Relationships with mother figures may be strained. The lesson is learning to meet their own emotional needs.",
    square: "Emotional needs clash with duties and reality. They want comfort but life demands discipline. Guilt around prioritizing themselves. Family obligations feel crushing.",
    opposition: "Other people's demands leave no room for their emotional needs. They feel unsupported, lonely in relationships, or forced to be the strong one when they're falling apart inside.",
    trine: "Emotional maturity comes naturally. They can handle heavy feelings without being destroyed by them. Good time for therapy, setting boundaries, or building emotional resilience. Quiet inner strength.",
    sextile: "An opportunity to build better emotional foundations. Setting boundaries, addressing family patterns, or finding a therapist who actually helps.",
  },
  "Saturn-Venus": {
    conjunction: "Love and money get real. A relationship tested by time, distance, or circumstance. Financial belt-tightening. They're learning what (and who) is actually worth committing to versus what just felt good.",
    square: "What they want clashes with what's realistic. Romantic disappointment, financial strain, or feeling unappreciated. Self-worth takes a hit. The lesson is finding value that doesn't depend on external validation.",
    opposition: "A partner or financial situation demands sacrifice. They may feel trapped in a loveless dynamic or financially dependent. The challenge is renegotiating terms without resentment.",
    trine: "Commitment deepens naturally. A relationship matures into something lasting, or financial plans pay off through patience. Love isn't flashy but it's real.",
  },
  "Saturn-Mars": {
    conjunction: "Their drive and ambition meet a brick wall. Frustration, blocked energy, or forced patience. Physical issues possible (especially teeth, bones, joints). The lesson is channeling anger into disciplined effort.",
    square: "Stop-and-go energy. They push forward and get slapped back. Rage at limitations, authority conflicts, or physical frustration. This breaks unless they learn strategic patience.",
    trine: "Disciplined, focused energy. They can work tirelessly toward a goal without burning out. Military-level efficiency. Best transit for building something through sustained effort.",
  },
  "Saturn-Mercury": {
    conjunction: "Thinking gets serious and possibly dark. Pessimistic mindset, communication feels labored, or they take on intellectual responsibilities. Good for focused study but terrible for lighthearted conversation.",
    square: "Communication breakdowns, negative thinking loops, or feeling intellectually inadequate. Paperwork problems, contract issues, or difficulty expressing themselves clearly.",
    trine: "Clear, structured thinking. Good for serious writing, studying, planning, or any task requiring mental discipline. Their words carry weight and authority.",
  },
  "Jupiter-Sun": {
    conjunction: "A year of expansion and confidence. Doors open, luck increases, and they feel larger than life. The risk is overcommitting or gaining weight. This is their annual 'level up' moment.",
    square: "Growth through overextension. They've taken on too much or been too optimistic. Reality checks around ego and ambition. Still a positive period — just a messy one.",
    opposition: "Other people bring opportunities — partnerships, collaborations, or benefactors. The risk is giving away too much of themselves. Balance generosity with self-interest.",
    trine: "Effortless good fortune. They're in the right place at the right time. Confidence, opportunities, and a general sense that life is working in their favor. Don't waste this by playing small.",
    sextile: "Lucky breaks if they take initiative. An opportunity for growth that requires action — it won't just fall in their lap, but the path is clearly lit.",
  },
  "Jupiter-Moon": {
    conjunction: "Emotional abundance. They feel nurtured by the universe, generous with their feelings, and deeply optimistic. Home improvements, family blessings, or a pregnancy/birth. Overeating is common.",
    square: "Emotional excess — mood swings between euphoria and melodrama. They overcommit emotionally, smother others with care, or indulge feelings that should be moderated.",
    trine: "Deep emotional contentment. Relationships feel warm, home feels like a sanctuary, and their intuition is working in their favor. A genuinely happy period.",
  },
  "Jupiter-Venus": {
    conjunction: "Love and money expand. New romance, windfalls, artistic inspiration, or just feeling beautiful and generous. The risk is overspending and indulgence. A genuinely delightful transit.",
    trine: "Ease in love and finances. Relationships flow, money comes without stress, and they naturally attract good things. The best time to ask for what they want.",
    square: "Too much of a good thing — overspending, overindulging, or idealizing a person who isn't what they seem. Fun but potentially costly.",
  },
  "Uranus-Sun": {
    conjunction: "Identity earthquake. They can't keep living as the same person and the universe is making sure of it. Sudden career changes, relationship exits, or a radical reinvention that shocks everyone who knows them.",
    square: "Restless disruption. They rebel against everything that feels limiting — jobs, relationships, routines. Impulsive decisions that may be brilliant or reckless. The challenge is channeling revolution productively.",
    opposition: "Other people upend their world. A partner leaves suddenly, a boss fires them, or someone enters their life who changes everything. They didn't choose this disruption but they need it.",
    trine: "Freedom comes naturally. They evolve and reinvent without the usual upheaval. Tech opportunities, unique creative expression, or a lifestyle upgrade that actually sticks.",
  },
  "Uranus-Moon": {
    conjunction: "Emotional earthquakes. Their feelings are unpredictable, their living situation may change abruptly, or a family shock disrupts their foundation. The old version of 'home' and 'safety' is being rebuilt.",
    square: "Emotional volatility and restlessness. They crave freedom from domestic routines, react unpredictably, or experience sudden anxious episodes. Relationships with women/mother figures may be turbulent.",
    trine: "Emotional liberation without the drama. They naturally let go of old emotional patterns, try new living situations, or develop an unconventional approach to emotional needs that actually works.",
  },
  "Uranus-Venus": {
    conjunction: "Love life gets electrified. Sudden attractions to unusual people, unexpected breakups, or a complete overhaul of their aesthetic and values. Whatever they thought they wanted in love — it's changing.",
    square: "Relationship instability. Boredom drives them toward excitement, even if it's destructive. Financial volatility. They want freedom and commitment simultaneously, which creates chaos.",
    trine: "Refreshing changes in love and creativity. New types of people enter their life, creative inspiration strikes from unexpected places, or they discover a new style/aesthetic that feels liberating.",
  },
  "Neptune-Sun": {
    conjunction: "Their identity dissolves and reforms. Who they are becomes unclear — spiritual awakening, creative explosion, or existential confusion. They may sacrifice themselves for a cause or lose themselves in fantasy.",
    square: "Confusion about who they are and what they want. Others deceive them, or they deceive themselves. Energy is low, motivation foggy. The spiritual lesson is surrender without losing themselves entirely.",
    opposition: "Other people confuse them. A relationship involves deception, codependency, or unrealistic expectations. They project savior/victim dynamics onto others. Boundaries are the medicine.",
    trine: "Spiritual and creative flow. Their imagination, compassion, and artistic abilities are heightened. They connect to something bigger than themselves without losing their footing.",
  },
  "Neptune-Moon": {
    conjunction: "Their emotional reality becomes dreamlike. Heightened psychic sensitivity, vivid dreams, and deep compassion — but also vulnerability to emotional manipulation, substance issues, or codependency. Boundaries dissolve.",
    square: "Emotional confusion and vulnerability. They absorb others' feelings, struggle to distinguish their needs from others', or escape into fantasy/substances. A family secret may surface.",
    trine: "Beautiful emotional sensitivity. Artistic inspiration, spiritual connection, and deep empathy flow naturally. Dreams may be prophetic. Their intuition is a reliable guide right now.",
  },
  "Neptune-Venus": {
    conjunction: "Love becomes spiritual or delusional — sometimes both. Soul-mate feelings, artistic transcendence, or devastating romantic disillusionment. The most creatively inspired transit but the worst for clear-eyed relationship choices.",
    square: "Rose-colored glasses in love and money. They idealize partners who don't deserve it, overspend on beautiful things, or invest in schemes that sound too good to be true. The art is gorgeous; the judgment is terrible.",
    trine: "Creative and romantic flow. They attract beauty, feel inspired, and experience love in its most idealized form. Good for art, music, and deepening spiritual connections in relationships.",
  },
  "Mars-Sun": {
    conjunction: "A surge of vitality and assertiveness. They feel ready to conquer — new projects, physical challenges, confrontations they've been avoiding. The risk is aggression or burnout.",
    square: "Frustration and conflict. They're picking fights or running into obstacles that provoke their anger. Accidents possible if they're reckless. Channel this into exercise or competitive pursuits.",
    trine: "Clean, confident energy. They take initiative easily, physical vitality is high, and they can assert themselves without alienating people. Start things now.",
  },
  "Mars-Moon": {
    conjunction: "Emotions run hot. They react before thinking, get defensive easily, or feel an urgent need to protect what's theirs. Arguments at home or with family. High emotional and physical energy.",
    square: "Emotional friction. Irritability, impatience with loved ones, or domestic conflicts. They know they're overreacting but can't stop. Physical activity is the pressure valve.",
    trine: "Motivated by their feelings. Emotional energy fuels productive action. They defend loved ones fiercely and channel passion into nurturing projects.",
  },
  "Mars-Venus": {
    conjunction: "Desire is amplified. Strong sexual/romantic energy, creative passion, or an urge to pursue what they find beautiful. Good for dates, art, and going after what they want.",
    square: "Tension between what they want and what they desire. Romantic frustration, mixed signals, or creative blocks that feel personal. The attraction is there but the timing is off.",
    trine: "Effortless charm and creative energy. Social life flows, romantic connections feel easy, and their aesthetic sense is sharp. Great for anything involving beauty, pleasure, or people.",
  },
};

/* ── Composed fallback descriptions ──
   For transit pairs without a hand-written TRANSIT_PAIR_DESC entry, build a
   distinct line from three parts: what the transiting planet brings, which
   natal life area it touches, and how the aspect delivers it. */

const TRANSIT_FORCE: Record<string, { brings: string; direct: string; flowing: string; friction: string }> = {
  Sun: {
    brings: "a spotlight",
    direct: "For the next few weeks, visibility and vitality concentrate here whether they invite it or not.",
    flowing: "What they put forward in this area gets seen in its best light — worth showing up deliberately.",
    friction: "The light falls on exactly what they'd rather keep offstage — uncomfortable, but clarifying.",
  },
  Moon: {
    brings: "a tide of feeling",
    direct: "It only lasts a day or two, but while it does, this part of life carries a real emotional charge.",
    flowing: "Instinct and circumstance line up for a day or two — a good window to act on a hunch here.",
    friction: "For a day or two, passing moods color this area more than facts do — feel it fully, decide later.",
  },
  Mercury: {
    brings: "a rewiring of the conversation",
    direct: "For a couple of weeks, the thinking and talking around this area speeds up and sharpens.",
    flowing: "Words come easier here right now — the conversation, message, or pitch they've been postponing will land better than usual.",
    friction: "Crossed wires are likely here — details slip, tones get misread. Saying it twice, plainly, is the workaround.",
  },
  Venus: {
    brings: "a softening",
    direct: "For a few weeks, this area warms up — more pull toward pleasure, connection, and what feels good.",
    flowing: "Ease finds this area on its own right now — appreciation, attraction, and small luck arrive without being chased.",
    friction: "The urge here is to smooth things over rather than deal with them — comfort now, cost later.",
  },
  Mars: {
    brings: "a charge of ignition",
    direct: "For the next several weeks this area runs hot — more energy, more urgency, a shorter fuse.",
    flowing: "There's clean fuel for this area right now — initiative gets rewarded, so start rather than deliberate.",
    friction: "Heat builds fast here — impatience, friction, forced moves. Physical effort burns it off better than arguing does.",
  },
  Jupiter: {
    brings: "a wave of expansion",
    direct: "Over the better part of a year, this area simply gets bigger — more opportunity, more appetite, more of everything.",
    flowing: "This is growth that doesn't need forcing — saying yes a little more often than usual will pay off here.",
    friction: "The hazard is too much of a good thing — promising past capacity, mistaking appetite for ability.",
  },
  Saturn: {
    brings: "a slow pressure test",
    direct: "This runs for a year or more, and it works like an audit — what's solid gets certified, what's flimsy gets rebuilt.",
    flowing: "Slow, structural effort compounds here right now — what they build under this transit tends to last.",
    friction: "Progress feels heavier than it should here — that's the test working. Whatever survives it is genuinely theirs.",
  },
  Uranus: {
    brings: "a current of disruption",
    direct: "This is a long transit with one job — to make this area unrecognizable, starting with whatever's gone stale.",
    flowing: "Change shows up here as a refresh instead of a rupture — experiments are cheap right now, so run a few.",
    friction: "Stability isn't on offer here for a while — but neither is staying stuck, and that's the trade.",
  },
  Neptune: {
    brings: "a fine fog",
    direct: "This unfolds over years, not weeks — the hard edges of this area slowly soften until something more imaginative can take shape.",
    flowing: "Intuition is a reliable instrument in this area right now — inspiration will outperform analysis.",
    friction: "Clarity is the first casualty here — facts blur and wishful thinking creeps in, so double-check anything that sounds perfect.",
  },
  Pluto: {
    brings: "an excavation",
    direct: "This is once-in-a-lifetime weather — whatever was buried in this area is surfacing, and what gets rebuilt will be permanent.",
    flowing: "Depth is available without the wreckage — this area can be transformed deliberately instead of by force.",
    friction: "Watch where the grip tightens — whatever they're trying hardest to control in this area is exactly what's being pried open.",
  },
};

const NATAL_AREA: Record<string, string> = {
  Sun: "their natal Sun — the core of who they are and where their life is pointed",
  Moon: "their natal Moon — moods, home, and what makes them feel safe",
  Mercury: "their natal Mercury — how they think, speak, and take in the world",
  Venus: "their natal Venus — love, money, and what they find worth wanting",
  Mars: "their natal Mars — drive, temper, and how they go after things",
  Jupiter: "their natal Jupiter — beliefs, optimism, and the appetite for more",
  Saturn: "their natal Saturn — the structures, duties, and limits their life is built on",
  Uranus: "their natal Uranus — the wiring for freedom and rebellion",
  Neptune: "their natal Neptune — ideals, imagination, and escape hatches",
  Pluto: "their natal Pluto — the deep machinery of power and control",
  "North Node": "their North Node — the direction their growth is being pulled",
  "South Node": "their South Node — the comfort zone they keep defaulting back to",
  Chiron: "their Chiron — the old wound they've learned to work around",
};

function composeTransitDescription(ta: TransitAspect): string {
  const tp = ta.transitPlanet;
  const f = TRANSIT_FORCE[tp];
  const theme = PLANET_THEMES[ta.natalPlanet];
  const area =
    NATAL_AREA[ta.natalPlanet] ||
    (theme ? `their natal ${ta.natalPlanet} — ${theme}` : `their natal ${ta.natalPlanet}`);
  if (!f) return `${tp} is activating ${area}.`;

  // Deterministic variant pick so the same transit always reads the same way,
  // but neighboring pairs don't share sentence skeletons.
  const hash = (tp + ta.natalPlanet).split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const alt = hash % 2 === 1;

  switch (ta.aspect) {
    case "conjunction":
      return alt
        ? `Direct contact: ${tp} has landed squarely on ${area}. No buffer, no angle — the two are fused for the duration. ${f.direct}`
        : `${tp} is sitting directly on ${area}. A conjunction doesn't negotiate — it merges, and for now ${f.brings} runs through everything this point touches. ${f.direct}`;
    case "trine":
      return alt
        ? `An easy channel is open from ${tp} into ${area}. Nothing needs forcing here — effort travels further than usual. ${f.flowing}`
        : `Right now the path is greased between ${tp} and ${area}. Trines don't announce themselves — the ease is quiet, real, and easy to waste. ${f.flowing}`;
    case "sextile":
      return alt
        ? `A quiet offer is on the table between ${tp} and ${area}. Sextiles stay theoretical until acted on — the door is unlocked, not open. ${f.flowing}`
        : `${tp} is cracking a door open for ${area}. Sextiles are invitations rather than events — nothing moves unless they do. ${f.flowing}`;
    case "square":
      return alt
        ? `Something has to give: ${tp} is working at cross-purposes with ${area}. The tension won't resolve on its own. ${f.friction}`
        : `${tp} is grinding against ${area}. The friction is the point — squares force the fix that comfort kept postponing. ${f.friction}`;
    case "opposition":
      return alt
        ? `${tp} has moved directly opposite ${area}. Expect the tug-of-war to play out through other people before it feels like their own. ${f.friction}`
        : `From the far side of the chart, ${tp} is pulling against ${area}. Oppositions tend to wear someone else's face — notice who's holding the other end of the rope. ${f.friction}`;
    case "quincunx":
      return alt
        ? `A low-grade itch: ${tp} keeps brushing against ${area}. Close enough to feel, too off-kilter to blend — small adjustments are the only fix. ${f.friction}`
        : `${tp} sits at an awkward angle to ${area}. No open conflict — these two just don't speak the same language right now, and recalibration beats force. ${f.friction}`;
    default:
      return `${tp} is activating ${area}. ${f.direct}`;
  }
}

function getTransitDescription(ta: TransitAspect): string {
  const tp = TRANSIT_PLANET_ENERGY[ta.transitPlanet];
  const house = HOUSE_THEMES[ta.transitHouse];
  const aspectNature = ASPECT_NATURE[ta.aspect];

  if (!tp || !aspectNature) return `${ta.transitPlanet} is activating their ${ta.natalPlanet}.`;

  // Check for specific transit pair description
  const pairKey = `${ta.transitPlanet}-${ta.natalPlanet}`;
  const pairDescs = TRANSIT_PAIR_DESC[pairKey];
  let description = pairDescs?.[ta.aspect] || "";

  // Fallback: compose a distinct description for pairs without hand-written copy
  if (!description) {
    description = composeTransitDescription(ta);
  }

  if (house) {
    description += ` Playing out in their ${ordinal(ta.transitHouse)} house: ${house.vibe.toLowerCase()}.`;
  }

  if (ta.transitRetrograde) {
    description += ` ${ta.transitPlanet} is retrograde — this energy turns inward. More reflection, revisiting, and internal processing than outward events.`;
  }

  return description;
}

/* ── Specific manifestations per transit pair + house ── */
const TRANSIT_PAIR_MANIFESTS: Record<string, Record<string, string[]>> = {
  "Pluto-Sun": {
    challenging: ["Power struggles with bosses, parents, or authority figures", "An identity they've outgrown is being forcibly stripped away", "Compulsive need to control situations or be seen as powerful"],
    harmonious: ["Quiet confidence and magnetic presence", "Opportunities to step into a leadership role", "Deep self-understanding that shifts their life direction"],
    neutral: ["Complete identity transformation — they won't recognize their old self", "Encounters with powerful people who change their trajectory", "Obsessive focus on becoming someone new"],
  },
  "Pluto-Moon": {
    challenging: ["Childhood wounds resurfacing through current relationships", "Emotional manipulation — either giving or receiving", "Insomnia, anxiety, or compulsive emotional processing"],
    harmonious: ["Therapeutic breakthroughs that release years of stored emotion", "Deepening trust and intimacy in close relationships", "Psychic impressions or unusually vivid, meaningful dreams"],
    neutral: ["The relationship with their mother or a mother figure transforms", "Moving or completely renovating their living space", "A secret from the past comes to light"],
  },
  "Pluto-Venus": {
    challenging: ["Jealousy or possessiveness — theirs or someone else's", "A relationship that becomes all-consuming or toxic", "Financial loss tied to someone else's decisions or debts"],
    harmonious: ["A love connection that changes them at the cellular level", "Financial empowerment — gaining control over their resources", "Artistic work that channels raw, vulnerable emotion"],
    neutral: ["An existing relationship transforms beyond recognition", "Complete reassessment of what they find attractive", "A financial or creative rebirth"],
  },
  "Pluto-Mars": {
    challenging: ["Rage that feels disproportionate to the situation", "Dangerous risk-taking or attracting aggressive people", "Power struggles that could turn physical or legal"],
    harmonious: ["Superhuman focus and determination toward a goal", "Physical transformation through intense training or healing", "Strategic power moves that reshape their position"],
    neutral: ["An unstoppable drive that demands an outlet", "Sexual energy at extreme levels", "Confrontation with a powerful adversary or situation"],
  },
  "Pluto-Mercury": {
    challenging: ["Paranoid or obsessive thought patterns", "Discovering uncomfortable truths or being lied to", "Communication breakdowns around taboo or sensitive subjects"],
    harmonious: ["Detective-level insight into people's hidden motives", "Writing or speaking about subjects that transform others", "Psychological clarity that permanently changes their worldview"],
    neutral: ["Uncovering a secret that changes everything", "An intellectual obsession that won't let go", "Profound conversations that alter their mental framework"],
  },
  "Saturn-Sun": {
    challenging: ["Career setbacks or increased professional pressure", "A crisis of confidence — questioning their life path", "Physical fatigue or health issues related to stress and overwork"],
    harmonious: ["Professional recognition for years of hard work", "A promotion, award, or public acknowledgment", "Feeling mature and competent in a way that's deeply satisfying"],
    neutral: ["Taking on a role of serious responsibility", "Becoming an authority figure in some area of life", "A reality check that's painful but ultimately clarifying"],
  },
  "Saturn-Moon": {
    challenging: ["Loneliness or emotional isolation, even in relationships", "Depression or emotional flatness that won't lift", "Strain in relationship with mother or primary caregiver"],
    harmonious: ["Building emotional boundaries that actually work", "Finding comfort in solitude and self-reliance", "A quiet period of emotional maturity and inner peace"],
    neutral: ["Learning to parent themselves emotionally", "Setting boundaries with family members", "A period of emotional austerity that builds resilience"],
  },
  "Saturn-Venus": {
    challenging: ["Romantic rejection or feeling unworthy of love", "Financial restrictions or unexpected expenses", "Questioning whether a long-term relationship is worth the effort"],
    harmonious: ["Committing to a relationship that proves its worth over time", "Financial discipline that pays off significantly", "Appreciating simple, enduring pleasures over flashy ones"],
    neutral: ["Deciding what (and who) is truly worth their time", "A love interest who's older, more serious, or established", "Financial restructuring or long-term money planning"],
  },
  "Saturn-Mars": {
    challenging: ["Feeling blocked, frustrated, or physically exhausted", "Conflict with authority figures over how things should be done", "Injuries from overexertion — especially bones, teeth, and joints"],
    harmonious: ["Incredible stamina and focused determination", "Building something that requires sustained physical or mental effort", "Military-level discipline applied to a personal goal"],
    neutral: ["A test of patience and strategic thinking", "Having to earn something they thought would come easier", "Physical training or health regimen that demands consistency"],
  },
  "Jupiter-Sun": {
    challenging: ["Overcommitting or taking on more than they can handle", "Weight gain from overindulgence", "Arrogance or unrealistic expectations about what's possible"],
    harmonious: ["A major opportunity that aligns with their life purpose", "Travel, education, or a new chapter that expands their world", "Genuine luck — being in the right place at the right time"],
    neutral: ["Feeling larger than life and ready for the next chapter", "A big decision about their direction and purpose", "Meeting a mentor or benefactor who opens doors"],
  },
  "Jupiter-Moon": {
    challenging: ["Emotional excess — crying at commercials, mood swings", "Overeating or overindulging for emotional comfort", "Smothering loved ones with too much care or generosity"],
    harmonious: ["Deep emotional contentment and gratitude", "Positive developments at home — renovation, family growth, or relocation", "Feeling emotionally safe and supported by the universe"],
    neutral: ["Emotional expansion — feelings are bigger than usual", "Possible pregnancy, birth, or family addition", "A home improvement that genuinely changes their quality of life"],
  },
  "Uranus-Sun": {
    challenging: ["Impulsive decisions that shock everyone — including themselves", "Sudden job loss, breakup, or lifestyle disruption", "Feeling like an alien in their own life"],
    harmonious: ["Reinventing themselves in an exciting, authentic way", "Technology or innovation creating unexpected opportunities", "Freedom from a limitation they thought was permanent"],
    neutral: ["An identity earthquake — who they were is not who they'll be", "Sudden change in direction they didn't see coming", "Attracting unusual people and unconventional situations"],
  },
  "Uranus-Moon": {
    challenging: ["Anxiety spikes and emotional unpredictability", "Sudden changes to living situation or family structure", "Feeling emotionally ungrounded and unable to find stability"],
    harmonious: ["Liberating emotional breakthroughs", "Exciting changes to home or family life", "Developing unconventional emotional coping strategies that actually work"],
    neutral: ["Their concept of home and security is being redefined", "A sudden move, renovation, or family shake-up", "Emotional freedom from patterns that felt permanent"],
  },
  "Uranus-Venus": {
    challenging: ["Sudden breakup or attraction to someone wildly inappropriate", "Financial volatility — unexpected expenses or windfalls", "Boredom-driven decisions in love or money that backfire"],
    harmonious: ["An exciting new relationship or creative direction", "Financial innovation or an unexpected source of income", "Discovering a style, art form, or person that feels like a revelation"],
    neutral: ["Their taste in everything — people, aesthetics, values — is shifting", "A relationship either electrifies or ends", "Sudden creative inspiration from an unexpected source"],
  },
  "Neptune-Sun": {
    challenging: ["Identity confusion — feeling lost without a clear sense of self", "Being deceived or deceiving themselves about who they are", "Fatigue, low motivation, or mysterious health complaints"],
    harmonious: ["Spiritual awakening or deepening creative practice", "Compassion and empathy at an all-time high", "A creative project that channels something transcendent"],
    neutral: ["Their sense of self is dissolving and reforming", "A period of spiritual seeking or existential questioning", "Boundaries between self and others become very thin"],
  },
  "Neptune-Moon": {
    challenging: ["Emotional confusion — can't tell their feelings from others'", "Vulnerability to emotional manipulation or codependency", "Escapism through substances, fantasy, or avoidance"],
    harmonious: ["Profound psychic sensitivity and accurate intuition", "Artistic or musical inspiration that feels channeled", "Deep compassion that heals others just by being present"],
    neutral: ["Dreams become vivid, prophetic, or deeply symbolic", "The line between imagination and reality thins", "A family secret or hidden truth gradually surfaces"],
  },
  "Neptune-Venus": {
    challenging: ["Falling for someone who isn't who they seem", "Financial decisions based on wishful thinking", "Aesthetic perfectionism that leads to constant dissatisfaction"],
    harmonious: ["Romantic experiences that feel transcendent and fated", "Artistic inspiration at its most beautiful and flowing", "Attracting beauty, grace, and harmony effortlessly"],
    neutral: ["Their ideal of love is being redefined from the ground up", "A creative or romantic experience that feels like a dream", "The line between love and illusion is very thin right now"],
  },
  "Jupiter-Saturn": {
    challenging: ["Ambition clashing with practical limitations", "Feeling stuck between wanting more and being realistic", "Business or legal complications that test patience"],
    harmonious: ["The perfect balance of vision and discipline to build something lasting", "A breakthrough where hard work finally meets opportunity", "Long-term investments beginning to pay off"],
    neutral: ["Restructuring goals — what's worth building for the long haul", "A crossroads between expansion and consolidation", "Balancing optimism with reality in a productive way"],
  },
  "Jupiter-Mercury": {
    challenging: ["Mental overload — too many ideas, not enough focus", "Promises or plans that are bigger than what's deliverable", "Miscommunication from assuming everyone's on the same page"],
    harmonious: ["Brilliant ideas that actually have legs", "Learning something that genuinely changes how they see the world", "Negotiations, publishing, or teaching opportunities landing"],
    neutral: ["Their mind is buzzing with possibilities and big-picture thinking", "A pivotal conversation or piece of information arrives", "Expanding their intellectual horizons through travel, study, or people"],
  },
  "Jupiter-Venus": {
    challenging: ["Overspending, overindulging, or loving too hard too fast", "Taking generosity for granted — theirs or others'", "Relationship expectations becoming unrealistic"],
    harmonious: ["Genuine abundance in love, money, or creative fulfillment", "Meeting someone who expands their idea of what's possible in love", "Financial or social luck that opens new doors"],
    neutral: ["Their appetites are larger than usual — for pleasure, beauty, and connection", "A generous opportunity appears in love or finances", "Celebrating and appreciating what they already have"],
  },
  "Jupiter-Mars": {
    challenging: ["Reckless confidence leading to overextension", "Anger or competitiveness that's hard to rein in", "Physical excess — going too hard at the gym, taking on too much"],
    harmonious: ["Unstoppable momentum toward a goal", "Athletic performance or physical energy at a peak", "Bold moves that actually land — courage pays off"],
    neutral: ["An adrenaline-fueled period where action feels essential", "A competitive situation that reveals what they're made of", "Physical adventure, travel, or risk-taking calling to them"],
  },
  "Jupiter-Pluto": {
    challenging: ["Obsession with power, status, or control over outcomes", "Financial schemes or power plays that escalate dangerously", "Ego inflation that alienates people who matter"],
    harmonious: ["Massive transformation backed by genuine opportunity", "Financial empowerment or a powerful new position", "Deep confidence that comes from confronting their shadows"],
    neutral: ["An encounter with real power — institutional, personal, or financial", "Ambition merging with intensity to create something formidable", "Transformation on a scale they can actually see and feel"],
  },
  "Jupiter-Uranus": {
    challenging: ["Restlessness so extreme they blow up something good", "Gambling on long shots that don't pay off", "Sudden changes that feel exciting but lack a plan"],
    harmonious: ["A lucky break that comes from nowhere and changes everything", "Innovation, technology, or unconventional paths opening up", "Freedom arriving suddenly and feeling exactly right"],
    neutral: ["A sudden expansion of what seems possible", "Breaking free from a limitation through an unexpected opportunity", "An exciting, unpredictable chapter beginning"],
  },
  "Jupiter-Neptune": {
    challenging: ["Beautiful delusions — spiritual bypassing or unrealistic idealism", "Being taken advantage of through misplaced trust or generosity", "Creative or financial ventures built on wishful thinking"],
    harmonious: ["Spiritual experiences that feel genuinely transcendent", "Creativity, compassion, and imagination flowing effortlessly", "A retreat, pilgrimage, or healing experience that shifts perspective"],
    neutral: ["The boundary between faith and fantasy is paper-thin", "A vision or dream that feels too meaningful to ignore", "Expanded intuition and sensitivity to the invisible world"],
  },
  "Uranus-Saturn": {
    challenging: ["Structures they depend on cracking under pressure to change", "Rebellion against rules, systems, or their own discipline", "The old way isn't working but the new way isn't clear yet"],
    harmonious: ["Successfully redesigning an outdated structure in their life", "Finding innovative solutions to chronic, stubborn problems", "Authority and freedom finding an unexpected balance"],
    neutral: ["A tug-of-war between stability and radical change", "Systems, habits, or structures getting a forced upgrade", "The question isn't if things will change — it's how"],
  },
  "Uranus-Mars": {
    challenging: ["Impulsive actions they can't take back", "Accident-prone energy — especially with technology, vehicles, or electricity", "Explosive anger or sudden confrontation out of nowhere"],
    harmonious: ["A surge of originality and courage to try something bold", "Athletic or physical breakthroughs from unconventional methods", "Acting decisively on an opportunity no one else sees"],
    neutral: ["Adrenaline is running high — they need an outlet", "A sudden, unexpected fight-or-flight moment", "Revolutionary energy that demands immediate physical expression"],
  },
  "Uranus-Mercury": {
    challenging: ["Scattered thinking and inability to focus on one thing", "Technology failures, communication chaos, or digital overwhelm", "Saying something shocking they didn't know they were thinking"],
    harmonious: ["Genius-level insight or a eureka moment that changes their direction", "Technology, coding, or communication skills leveling up fast", "Meeting someone who thinks in a way that cracks their mind open"],
    neutral: ["Their mind is moving at a speed their life hasn't caught up to", "An unexpected piece of information rewrites their assumptions", "Communication patterns and thinking habits being disrupted and upgraded"],
  },
  "Uranus-Pluto": {
    challenging: ["Power structures collapsing in ways that feel threatening", "Obsessive need for freedom clashing with deep psychological patterns", "Generational trauma being triggered by current events"],
    harmonious: ["Deep, permanent transformation that actually feels liberating", "Breaking free from a pattern that's haunted them for years", "A revolutionary personal change that aligns power with freedom"],
    neutral: ["A slow earthquake reshaping the deepest foundations of their psyche", "The intersection of personal power and radical freedom", "Something they thought was permanently fixed about themselves is changing"],
  },
  "Neptune-Mars": {
    challenging: ["Motivation evaporating without explanation", "Being deceived into action — fighting someone else's battle", "Passive-aggression, avoidance, or difficulty asserting themselves"],
    harmonious: ["Physical energy channeled into creative or spiritual practice", "Acting on compassion and intuition rather than ego", "Athletic grace — movement becomes almost meditative"],
    neutral: ["The line between asserting themselves and sacrificing for others blurs", "Desire takes on a dreamy, spiritual, or artistic quality", "Physical energy fluctuating in mysterious ways"],
  },
  "Neptune-Mercury": {
    challenging: ["Brain fog, confusion, or an inability to think clearly", "Being lied to — or lying to themselves — about important facts", "Creative thinking that can't land in practical reality"],
    harmonious: ["Writing, speaking, or thinking with unusual poetic depth", "Intuitive knowing that bypasses logic and turns out to be right", "Learning through music, art, or meditation rather than textbooks"],
    neutral: ["Logic and intuition are trading places", "A message, dream, or sign that feels too specific to ignore", "Their communication style softening and becoming more nuanced"],
  },
  "Neptune-Saturn": {
    challenging: ["Structures dissolving — career instability, lost direction, eroding foundations", "Fear of an uncertain future that can't be controlled", "Disillusionment with institutions, authority, or their own ambitions"],
    harmonious: ["Giving concrete form to a creative or spiritual vision", "Building something meaningful that serves the collective", "Finding strength in surrender and discipline in faith"],
    neutral: ["The collision of pragmatism and idealism — both feel necessary", "A slow dissolving of rigid structures to make room for something more fluid", "Learning that not everything worth building has a blueprint"],
  },
};

// House-specific manifestation overlays
const HOUSE_MANIFESTS: Record<number, string[]> = {
  1: ["Changes to their physical appearance, style, or how others perceive them", "A new personal initiative or identity shift"],
  2: ["Financial changes — income shifts, spending habits, or money mindset", "Reevaluating what gives them a sense of security and self-worth"],
  3: ["Important conversations, emails, or messages that shift things", "Changes in daily commute, sibling relationships, or learning path"],
  4: ["Home or family life is the stage — moves, renovations, or family dynamics shifting", "Emotional processing tied to childhood or parents"],
  5: ["Romantic encounters, creative projects, or reconnecting with what's fun", "Changes in relationship to children, hobbies, or self-expression"],
  6: ["Health wake-up calls, new routines, or changes at their day job", "A coworker or daily habit becomes surprisingly important"],
  7: ["One specific relationship is the focal point — partner, close friend, or rival", "Contract negotiations, legal matters, or commitment decisions"],
  8: ["Shared finances, debts, inheritance, or someone else's resources become central", "Psychological depths — therapy, crisis, or intimate breakthroughs"],
  9: ["Travel plans, educational pursuits, or a philosophical shift", "Legal matters, publishing, or cross-cultural experiences"],
  10: ["Career is the arena — promotions, public visibility, or professional pressure", "Their reputation or public image is being reshaped"],
  11: ["Friend groups shift, community involvement changes, or a dream crystallizes", "Technology, social media, or group dynamics are in flux"],
  12: ["Hidden or unconscious patterns emerge — dreams, isolation, or spiritual retreats", "Something behind the scenes is shifting before it becomes visible"],
};

function getTransitManifestations(ta: TransitAspect): string[] {
  const manifests: string[] = [];
  const planet = ta.transitPlanet;
  const natal = ta.natalPlanet;
  const houseNum = ta.transitHouse;
  const aspectNature = ASPECT_NATURE[ta.aspect];
  const nature = aspectNature?.nature || "neutral";

  // 1. Get specific pair manifestations
  const pairKey = `${planet}-${natal}`;
  const pairManifests = TRANSIT_PAIR_MANIFESTS[pairKey];
  if (pairManifests) {
    const specific = pairManifests[nature] || pairManifests["neutral"] || [];
    manifests.push(...specific);
  }

  // 2. Add house-specific manifestation if we have room
  if (manifests.length < 3 && houseNum > 0) {
    const houseM = HOUSE_MANIFESTS[houseNum];
    if (houseM) {
      // Pick the one that doesn't overlap with what we already have
      for (const m of houseM) {
        if (manifests.length >= 3) break;
        if (!manifests.some(existing => existing.toLowerCase().includes(m.split(" ")[0].toLowerCase()))) {
          manifests.push(m);
        }
      }
    }
  }

  // 3. Fallback for planet combos without specific entries
  if (manifests.length === 0) {
    const natalTheme = PLANET_THEMES[natal] || natal;
    const tpInfo = TRANSIT_PLANET_ENERGY[planet];
    if (tpInfo) {
      manifests.push(`${tpInfo.energy.charAt(0).toUpperCase() + tpInfo.energy.slice(1)} around their ${natalTheme}`);
    }
    if (houseNum > 0) {
      const house = HOUSE_THEMES[houseNum];
      if (house) manifests.push(`Activity and shifts in their ${house.area.toLowerCase()}`);
    }
    if (ta.transitRetrograde) {
      manifests.push("Revisiting old patterns or unfinished business in this area");
    }
  }

  return manifests.slice(0, 3);
}

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

const SHORT_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function fmtTransitDate(dateStr?: string | number): string {
  if (!dateStr) return "";
  const [y, m, d] = String(dateStr).split("-").map(Number);
  const month = SHORT_MONTHS[m - 1] || "";
  return `${month} ${d}, ${y}`;
}

function fmtDateRange(start?: string, end?: string): string {
  if (!start || !end) return "";
  return `${fmtTransitDate(start)} – ${fmtTransitDate(end)}`;
}

/* ═══════════════════════════════════════════
   Compatibility Algorithm
   ═══════════════════════════════════════════ */

// Aspect weights for romantic compatibility scoring
/* ═══════════════════════════════════════════
   Data sanitizer — ensures connection data is safe to render
   ═══════════════════════════════════════════ */
function sanitizeConnection(conn: Connection): Connection {
  const safeNum = (v: unknown): number => (typeof v === "number" && isFinite(v) ? v : 0);
  const safeStr = (v: unknown, fallback = ""): string => (typeof v === "string" ? v : String(v ?? fallback));

  // Ensure all string fields are actually strings (Supabase JSONB can return unexpected types)
  const name = safeStr(conn.name, "Unknown");
  const relationship = safeStr(conn.relationship, "friend");
  const category = safeStr(conn.category, "friend");
  const birth_date = safeStr(conn.birth_date, "2000-01-01");
  const birth_time = conn.birth_time != null ? safeStr(conn.birth_time) : null;
  const city_name = conn.city_name != null ? safeStr(conn.city_name) : null;

  // Sanitize big_three
  let big_three = conn.big_three;
  if (big_three && typeof big_three === "object") {
    big_three = {
      sun: safeStr(big_three.sun, "Ari"),
      moon: safeStr(big_three.moon, "Ari"),
      rising: safeStr(big_three.rising, ""),
    };
  }

  // Convert numeric house (1-12) back to the string format the rest of the app expects
  const HOUSE_WORDS = ["First","Second","Third","Fourth","Fifth","Sixth","Seventh","Eighth","Ninth","Tenth","Eleventh","Twelfth"];
  const normalizeHouse = (h: unknown): string | null => {
    if (h == null) return null;
    if (typeof h === "number" && h >= 1 && h <= 12) return `${HOUSE_WORDS[h - 1]}_House`;
    if (typeof h === "string") return h;
    return null;
  };

  // Sanitize planets — filter out entries with NaN/missing positions
  const planets = Array.isArray(conn.planets)
    ? conn.planets.filter(p => p && typeof p.name === "string" && typeof p.sign === "string")
        .map(p => ({ ...p, absPosition: safeNum(p.absPosition), position: safeNum(p.position), house: normalizeHouse(p.house) }))
    : null;

  // Sanitize houses
  const houses = Array.isArray(conn.houses)
    ? (conn.houses as any[]).filter(h => h && typeof h.sign === "string")
        .map(h => ({ ...h, absPosition: safeNum(h.absPosition), position: safeNum(h.position) }))
    : null;

  // Sanitize special_points — same house normalization as planets
  const special_points = Array.isArray(conn.special_points)
    ? conn.special_points.filter((sp: any) => sp && typeof sp.name === "string")
        .map((sp: any) => ({ ...sp, absPosition: safeNum(sp.absPosition), position: safeNum(sp.position), house: normalizeHouse(sp.house) }))
    : conn.special_points;

  // Sanitize synastry
  let synastry = conn.synastry;
  if (synastry) {
    synastry = {
      ...synastry,
      crossAspects: Array.isArray(synastry.crossAspects) ? synastry.crossAspects : [],
      themes: Array.isArray(synastry.themes) ? synastry.themes : [],
      fatedContacts: Array.isArray(synastry.fatedContacts) ? synastry.fatedContacts : [],
      harmony: typeof synastry.harmony === "number" ? synastry.harmony : 0,
      tension: typeof synastry.tension === "number" ? synastry.tension : 0,
      totalAspects: typeof synastry.totalAspects === "number" ? synastry.totalAspects : 0,
    };
  }

  return { ...conn, name, relationship, category, birth_date, birth_time, city_name, big_three, planets, houses, special_points, synastry };
}

const ASPECT_WEIGHT: Record<string, number> = {
  conjunction: 1.0,
  trine: 0.9,
  sextile: 0.7,
  square: -0.5,
  opposition: -0.3,
  quincunx: -0.2,
};

// Planet importance for romance (higher = more weight)
const PLANET_ROMANCE_WEIGHT: Record<string, number> = {
  Sun: 3, Moon: 3, Venus: 4, Mars: 3, Mercury: 2,
  Jupiter: 2, Saturn: 1.5, Neptune: 1, Pluto: 1.5, Uranus: 0.8,
  "North Node": 1.5, "South Node": 1, Chiron: 1.2,
};

// Category tags for each aspect (which area of the relationship it touches)
const ASPECT_CATEGORIES: Record<string, string[]> = {
  Sun: ["identity", "ego", "life direction"],
  Moon: ["emotions", "comfort", "instinct"],
  Venus: ["love", "attraction", "values"],
  Mars: ["passion", "drive", "conflict"],
  Mercury: ["communication", "thinking", "humor"],
  Jupiter: ["growth", "adventure", "optimism"],
  Saturn: ["commitment", "stability", "lessons"],
  Neptune: ["romance", "spirituality", "idealism"],
  Pluto: ["transformation", "intensity", "power"],
  Uranus: ["excitement", "independence", "surprise"],
  "North Node": ["destiny", "growth"],
  "South Node": ["past life", "comfort zone"],
  Chiron: ["healing", "vulnerability"],
};

interface CompatibilityResult {
  score: number;                // 0-100
  label: string;                // "Deep bond", "Magnetic", etc.
  strengths: string[];          // Natural language strengths
  challenges: string[];         // Natural language challenges
  summary: string;              // Full relationship paragraph
}

function computeCompatibility(
  syn: SynastryData,
  userName: string,
  partnerName: string,
  userBigThree: { sun: string; moon: string; rising: string } | null,
  partnerBigThree: { sun: string; moon: string; rising: string } | null,
  context: "partner" | "family" | "friend" = "partner",
): CompatibilityResult {
  const isPlatonic = context !== "partner";
  const allAspects = Array.isArray(syn.crossAspects) ? [...syn.crossAspects] : [];
  if (allAspects.length === 0) {
    return { score: 50, label: "Unknown", strengths: ["Not enough data to analyze"], challenges: [], summary: `We need more birth data to fully map the connection between ${userName} and ${partnerName}.` };
  }

  // 1. Calculate raw weighted score
  let totalWeight = 0;
  let weightedSum = 0;
  const strengthAspects: { text: string; weight: number; cats: string[]; p1Name: string; p2Name: string; aspect: string }[] = [];
  const challengeAspects: { text: string; weight: number; cats: string[]; p1Name: string; p2Name: string; aspect: string }[] = [];

  for (const a of allAspects) {
    const aspectW = ASPECT_WEIGHT[a.aspect] ?? 0;
    const p1w = PLANET_ROMANCE_WEIGHT[a.p1Name] ?? 1;
    const p2w = PLANET_ROMANCE_WEIGHT[a.p2Name] ?? 1;
    const pairWeight = (p1w + p2w) / 2;
    const orbFactor = Math.max(0, 1 - a.orb / 10); // tighter orbs count more
    const contribution = aspectW * pairWeight * orbFactor;

    totalWeight += pairWeight * orbFactor;
    weightedSum += contribution;

    const cats = [...(ASPECT_CATEGORIES[a.p1Name] || []), ...(ASPECT_CATEGORIES[a.p2Name] || [])];
    const uniqueCats = [...new Set(cats)];

    if (aspectW > 0) {
      strengthAspects.push({ text: `${a.p1Name} ${a.aspect} ${a.p2Name}`, weight: Math.abs(contribution), cats: uniqueCats, p1Name: a.p1Name, p2Name: a.p2Name, aspect: a.aspect });
    } else if (aspectW < 0) {
      challengeAspects.push({ text: `${a.p1Name} ${a.aspect} ${a.p2Name}`, weight: Math.abs(contribution), cats: uniqueCats, p1Name: a.p1Name, p2Name: a.p2Name, aspect: a.aspect });
    }
  }

  // Normalize to 0-100 scale (midpoint at 50 when neutral)
  const rawRatio = totalWeight > 0 ? weightedSum / totalWeight : 0; // -1 to +1
  let score = Math.round(50 + rawRatio * 40); // maps to 10-90 base range

  // Bonus for fated contacts (karmic bond lifts score)
  const fated = Array.isArray(syn.fatedContacts) ? syn.fatedContacts : [];
  const fatedBonus = Math.min(fated.length * 3, 12);
  score += fatedBonus;

  // Bonus for high harmony ratio
  const harmonyCount = typeof syn.harmony === "number" ? syn.harmony : 0;
  const tensionCount = typeof syn.tension === "number" ? syn.tension : 0;
  const harmonyRatio = harmonyCount / Math.max(harmonyCount + tensionCount, 1);
  if (harmonyRatio > 0.65) score += 5;
  if (harmonyRatio > 0.8) score += 5;

  score = Math.max(15, Math.min(98, score)); // clamp

  // 2. Label (context-aware)
  let label = "Complex";
  if (isPlatonic) {
    if (score >= 85) label = "Unbreakable bond";
    else if (score >= 75) label = "Deep bond";
    else if (score >= 65) label = "Strong connection";
    else if (score >= 55) label = "Natural fit";
    else if (score >= 45) label = "Growth-oriented";
    else if (score >= 35) label = "Challenging but meaningful";
    else label = "Friction-heavy";
  } else {
    if (score >= 85) label = "Soulmate energy";
    else if (score >= 75) label = "Deep bond";
    else if (score >= 65) label = "Strong connection";
    else if (score >= 55) label = "Magnetic pull";
    else if (score >= 45) label = "Growth-oriented";
    else if (score >= 35) label = "Challenging but transformative";
    else label = "Friction-heavy";
  }

  // 3. Build strengths (top categories from harmonious aspects)
  strengthAspects.sort((a, b) => b.weight - a.weight);
  challengeAspects.sort((a, b) => b.weight - a.weight);

  const strengthCats = new Map<string, number>();
  for (const s of strengthAspects) {
    for (const c of s.cats) strengthCats.set(c, (strengthCats.get(c) || 0) + s.weight);
  }
  const challengeCats = new Map<string, number>();
  for (const c of challengeAspects) {
    for (const cat of c.cats) challengeCats.set(cat, (challengeCats.get(cat) || 0) + c.weight);
  }

  const topStrengths = [...strengthCats.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4).map(([cat]) => cat);
  const topChallenges = [...challengeCats.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([cat]) => cat);

  // 4. Human-readable strengths and challenges (context-aware for platonic vs romantic)
  const ROMANTIC_STRENGTHS: Record<string, string> = {
    "love": "A natural romantic ease — love flows between you",
    "attraction": "Magnetic physical and emotional attraction",
    "emotions": "Deep emotional understanding and safety",
    "comfort": "You feel at home with each other",
    "communication": "Easy, stimulating conversations",
    "humor": "Shared sense of humor and mental wavelength",
    "passion": "Intense physical chemistry and drive",
    "identity": "You see and appreciate each other's true selves",
    "life direction": "Your paths in life naturally support each other",
    "growth": "You inspire each other to grow and expand",
    "adventure": "A shared sense of adventure and exploration",
    "commitment": "A solid foundation for long-term partnership",
    "stability": "You create security and structure together",
    "romance": "An almost dreamlike romantic quality",
    "spirituality": "A spiritual or transcendent connection",
    "transformation": "You transform each other at a deep level",
    "intensity": "An all-or-nothing bond that runs deep",
    "excitement": "Electric, unpredictable energy that keeps things alive",
    "destiny": "A fated quality — like you were meant to meet",
    "healing": "You help each other heal old wounds",
    "vulnerability": "A safe space to be fully vulnerable",
    "values": "Aligned values and what you hold dear",
    "instinct": "An intuitive, unspoken understanding",
    "thinking": "Intellectual compatibility and respect",
    "optimism": "You bring out the best and most hopeful in each other",
    "independence": "Respect for each other's freedom and individuality",
    "power": "A powerful, magnetic dynamic",
    "past life": "A deep familiarity, as if you've known each other before",
    "ego": "Mutual admiration and respect",
    "drive": "You motivate and energize each other",
    "lessons": "Important life lessons learned through the relationship",
    "idealism": "A beautiful, idealized vision of love together",
    "surprise": "Constant freshness and unpredictability",
    "comfort zone": "Natural ease and familiarity from the start",
  };

  const PLATONIC_STRENGTHS: Record<string, string> = {
    "love": "A genuine warmth and care for each other",
    "attraction": "A natural gravitational pull — you just click",
    "emotions": "Deep emotional understanding and mutual support",
    "comfort": "You feel completely yourself around each other",
    "communication": "Easy, open conversations that never feel forced",
    "humor": "Shared sense of humor and mental wavelength",
    "passion": "Shared enthusiasm and drive when you team up",
    "identity": "You see and appreciate each other's true selves",
    "life direction": "Your paths in life naturally support each other",
    "growth": "You inspire each other to grow and try new things",
    "adventure": "A shared sense of adventure and exploration",
    "commitment": "A loyal, dependable bond built to last",
    "stability": "You create a sense of safety and consistency for each other",
    "romance": "A deeply caring, nurturing connection",
    "spirituality": "A spiritual or transcendent connection",
    "transformation": "You help each other evolve through life's changes",
    "intensity": "A deep, meaningful bond that doesn't do surface-level",
    "excitement": "You keep each other's lives interesting and dynamic",
    "destiny": "A fated quality — like you were always meant to know each other",
    "healing": "You help each other heal and process difficult experiences",
    "vulnerability": "A safe space to be fully honest and open",
    "values": "Aligned values and priorities that keep you in sync",
    "instinct": "An intuitive, unspoken understanding",
    "thinking": "Intellectual respect and stimulating ideas",
    "optimism": "You bring out the best and most hopeful in each other",
    "independence": "Healthy respect for each other's space and autonomy",
    "power": "A strong, influential dynamic that brings out strength",
    "past life": "A deep familiarity, like you've known each other forever",
    "ego": "Genuine mutual admiration and support",
    "drive": "You motivate and energize each other",
    "lessons": "Important life lessons learned through this bond",
    "idealism": "A shared vision of how things could be better",
    "surprise": "Constant freshness and unpredictability",
    "comfort zone": "Natural ease and familiarity from the start",
  };

  const ROMANTIC_CHALLENGES: Record<string, string> = {
    "conflict": "Power struggles and heated disagreements",
    "passion": "Intensity that can tip into volatility",
    "ego": "Clashes over pride or the need to be right",
    "communication": "Misunderstandings or different communication styles",
    "emotions": "Emotional needs that don't always align",
    "stability": "Tension between security and freedom",
    "commitment": "Different timelines or definitions of commitment",
    "independence": "Balancing togetherness with personal space",
    "power": "Control dynamics that need conscious work",
    "transformation": "Deep changes that can feel destabilizing",
    "intensity": "Emotional heaviness that requires breaks",
    "lessons": "Hard lessons that test patience and resilience",
    "drive": "Competing ambitions or different energy levels",
    "identity": "Friction around personal identity and autonomy",
    "values": "Occasional misalignment on what matters most",
    "idealism": "Unrealistic expectations of each other",
    "comfort": "Risk of complacency or taking each other for granted",
    "life direction": "Diverging life goals that need compromise",
  };

  const PLATONIC_CHALLENGES: Record<string, string> = {
    "conflict": "Butting heads when you both feel strongly",
    "passion": "Intensity that can overwhelm the lighter side of things",
    "ego": "Moments of competitiveness or needing to be right",
    "communication": "Different communication styles that cause misreads",
    "emotions": "Emotional wavelengths that don't always match up",
    "stability": "Different needs for consistency vs spontaneity",
    "commitment": "Different levels of investment in staying close",
    "independence": "Navigating how much space each person needs",
    "power": "Subtle dynamics around who leads and who follows",
    "transformation": "Growing in different directions at times",
    "intensity": "A heaviness that can feel like too much sometimes",
    "lessons": "Hard truths that test the bond",
    "drive": "Different energy levels or competing priorities",
    "identity": "Tension around roles and expectations",
    "values": "Not always seeing eye to eye on what matters",
    "idealism": "Expecting too much of each other",
    "comfort": "Risk of taking the relationship for granted",
    "life direction": "Life paths that pull you in different directions",
  };

  const strengthPhrases = isPlatonic ? PLATONIC_STRENGTHS : ROMANTIC_STRENGTHS;
  const challengePhrases = isPlatonic ? PLATONIC_CHALLENGES : ROMANTIC_CHALLENGES;
  // Strengths: render each from the strongest *actual* harmonious aspect in
  // that category, so the copy reflects this chart's real planets.
  const usedStrengthAspects = new Set<string>();
  const strengths = topStrengths.map((cat) => {
    const best = strengthAspects.find(
      (a) => a.cats.includes(cat) && !usedStrengthAspects.has(a.text),
    );
    if (best) {
      usedStrengthAspects.add(best.text);
      return getStrengthArea(best.p1Name, best.p2Name, best.aspect, isPlatonic);
    }
    return strengthPhrases[cat] || `Strong ${cat} connection`;
  });

  // Growth areas: render each from the strongest *actual* challenge aspect in
  // that category, so the copy reflects this specific chart rather than a fixed
  // per-category phrase. Avoid reusing the same aspect across two areas.
  const usedChallengeAspects = new Set<string>();
  const challenges = topChallenges.map((cat) => {
    const best = challengeAspects.find(
      (a) => a.cats.includes(cat) && !usedChallengeAspects.has(a.text),
    );
    if (best) {
      usedChallengeAspects.add(best.text);
      return getGrowthArea(best.p1Name, best.p2Name, best.aspect, isPlatonic);
    }
    return challengePhrases[cat] || `Navigating ${cat} differences`;
  });

  // 5. Generate summary paragraph
  const person = String(partnerName || "").split(" ")[0] || "them";
  const user = String(userName || "") || "You";
  const bondWord = isPlatonic ? "bond" : "connection";

  // Remap category names for platonic contexts (no "love", "attraction", "passion", "romance" about family)
  const PLATONIC_CAT_REMAP: Record<string, string> = {
    "love": "care", "attraction": "connection", "passion": "energy", "romance": "closeness",
    "conflict": "friction", "ego": "identity", "drive": "motivation", "power": "influence",
    "intensity": "depth", "excitement": "spontaneity",
  };
  const safeCategory = (cat: string) => isPlatonic ? (PLATONIC_CAT_REMAP[cat] || cat) : cat;
  const safeCats = (cats: string[]) => cats.map(safeCategory);

  let summary = "";

  // Use the actual strength/challenge phrases (already context-aware) for the narrative
  const s1 = strengths[0] || "";
  const s2 = strengths[1] || "";
  const c1 = challenges[0] || "";
  const c2 = challenges[1] || "";
  const hasFated = fated.length > 0;
  const fatedNote = isPlatonic
    ? `This ${bondWord} has a fated quality — the kind where you feel like this person was always meant to be in your life.`
    : `There's a karmic thread running through this — it doesn't feel accidental.`;

  if (score >= 75) {
    summary = `This is one of ${isPlatonic ? "the strongest bonds" : "the most compatible connections"} in your chart. `;
    if (s1) summary += `${s1}. `;
    if (s2) summary += `${s2}. `;
    summary += `The overall dynamic leans heavily toward ease — you don't have to work hard to understand each other. `;
    if (hasFated) summary += `${fatedNote} `;
    if (c1) {
      summary += `The one area that asks for conscious effort: ${c1.charAt(0).toLowerCase() + c1.slice(1)}. But in a ${bondWord} this strong, that tension is what keeps things from going stale — it's the edge that makes you both better.`;
    }
  } else if (score >= 55) {
    summary = `${user} and ${person} have a ${bondWord} that works because it's real, not because it's easy. `;
    if (s1) summary += `What holds you together: ${s1.charAt(0).toLowerCase() + s1.slice(1)}. `;
    if (s2) summary += `${s2}. `;
    if (hasFated) summary += `${fatedNote} `;
    if (c1) {
      summary += `Where things get complicated: ${c1.charAt(0).toLowerCase() + c1.slice(1)}`;
      if (c2) summary += `, and ${c2.charAt(0).toLowerCase() + c2.slice(1)}`;
      summary += `. These aren't dealbreakers — they're the parts of the ${bondWord} that ask you to show up differently than you normally would. The growth is in the friction.`;
    }
  } else {
    summary = `This is a ${bondWord} that asks a lot of both people. `;
    if (s1) {
      summary += `The genuine bright spots — ${s1.charAt(0).toLowerCase() + s1.slice(1)}`;
      if (s2) summary += ` and ${s2.charAt(0).toLowerCase() + s2.slice(1)}`;
      summary += ` — are real, and they matter. `;
    }
    if (c1) {
      summary += `But the challenges are equally real: ${c1.charAt(0).toLowerCase() + c1.slice(1)}`;
      if (c2) summary += `, and ${c2.charAt(0).toLowerCase() + c2.slice(1)}`;
      summary += `. `;
    }
    if (hasFated) summary += `${fatedNote} `;
    summary += `${isPlatonic ? "Bonds" : "Relationships"} like this carry the deepest lessons. They don't work on autopilot — they work when both people choose to stay conscious.`;
  }

  return { score, label, strengths, challenges, summary };
}

/* ═══════════════════════════════════════════
   Constants
   ═══════════════════════════════════════════ */

const RELATIONSHIP_OPTIONS: { value: string; label: string; category: string }[] = [
  { value: "partner", label: "Partner", category: "partner" },
  { value: "mother", label: "Mother", category: "family" },
  { value: "father", label: "Father", category: "family" },
  { value: "sister", label: "Sister", category: "family" },
  { value: "brother", label: "Brother", category: "family" },
  { value: "child", label: "Child", category: "family" },
  { value: "niece", label: "Niece", category: "family" },
  { value: "nephew", label: "Nephew", category: "family" },
  { value: "godchild", label: "Godchild", category: "family" },
  { value: "grandmother", label: "Grandmother", category: "family" },
  { value: "grandfather", label: "Grandfather", category: "family" },
  { value: "aunt", label: "Aunt", category: "family" },
  { value: "uncle", label: "Uncle", category: "family" },
  { value: "friend", label: "Friend", category: "friend" },
];


// Relationships that belong to "Your Circle" (the family you're building)
const CIRCLE_RELATIONSHIPS = ["partner", "child", "godchild"];
// Everything else in family category is "Origin Family" (where you come from)
const ORIGIN_RELATIONSHIPS = ["mother", "father", "sister", "brother", "grandmother", "grandfather", "aunt", "uncle", "niece", "nephew"];

const PLANET_SYMBOLS: Record<string, string> = {
  Sun: "\u2609", Moon: "\u263D", Mercury: "\u263F", Venus: "\u2640",
  Mars: "\u2642", Jupiter: "\u2643", Saturn: "\u2644",
  Uranus: "\u2645", Neptune: "\u2646", Pluto: "\u2647",
  "North Node": "\u260A", "South Node": "\u260B", Chiron: "\u26B7",
  Lilith: "\u26B8", Vertex: "Vx",
};

// Compute a chart's Vertex (fated point) from birth data. Returns null when the
// birth time is unknown or data is incomplete — synastry then simply skips it.
function chartVertex(
  birthDate?: string | null, birthTime?: string | null,
  latitude?: number | null, longitude?: number | null,
  unknownTime?: boolean | null, zodiacSystem?: string | null, ayanamsa?: string | null,
): { sign: string; absPosition: number } | null {
  if (!birthDate || !birthTime || latitude == null || longitude == null || unknownTime) return null;
  try {
    const c = calculateChart({
      name: "",
      birthDate,
      birthTime,
      latitude,
      longitude,
      zodiacSystem: (zodiacSystem as "tropical" | "sidereal") || "tropical",
      ...(zodiacSystem === "sidereal" ? { ayanamsa: (ayanamsa as "lahiri" | "krishnamurti" | "raman") || "lahiri" } : {}),
    }) as { vertex?: { sign: string; absPosition: number } | null };
    return c.vertex ?? null;
  } catch {
    return null;
  }
}

// Accent color + label for each fated-mark category.
const FATED_CATEGORY_STYLE: Record<string, { label: string; cls: string }> = {
  destiny: { label: "Destiny", cls: "text-amber border-amber/30 bg-amber/10" },
  karmic: { label: "Karmic", cls: "text-sage border-sage/30 bg-sage/10" },
  binding: { label: "Binding", cls: "text-ink border-ink/30 bg-ink/10" },
  soulmate: { label: "Soul-deep", cls: "text-terracotta border-terracotta/30 bg-terracotta/10" },
  healing: { label: "Healing", cls: "text-sage border-sage/30 bg-sage/10" },
  shadow: { label: "Shadow", cls: "text-ink border-ink/30 bg-ink/10" },
};

function elementColor(sign: string): string {
  if (["Ari", "Leo", "Sag"].includes(sign)) return "text-terracotta";
  if (["Tau", "Vir", "Cap"].includes(sign)) return "text-sage";
  if (["Gem", "Lib", "Aqu"].includes(sign)) return "text-amber";
  return "text-ink";
}

function elementBg(sign: string): string {
  if (["Ari", "Leo", "Sag"].includes(sign)) return "bg-terracotta/8 border-terracotta/25";
  if (["Tau", "Vir", "Cap"].includes(sign)) return "bg-sage/8 border-sage/25";
  if (["Gem", "Lib", "Aqu"].includes(sign)) return "bg-amber/8 border-amber/25";
  return "bg-ink/8 border-ink/25";
}

const ASPECT_SYMBOLS: Record<string, string> = {
  conjunction: "\u260C",
  opposition: "\u260D",
  trine: "\u25B3",
  square: "\u25A1",
  sextile: "\u2731",
};

const ASPECT_COLORS: Record<string, string> = {
  conjunction: "text-amber",
  trine: "text-sage",
  sextile: "text-sage/70",
  square: "text-terracotta",
  opposition: "text-terracotta/70",
};

/* ═══════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════ */

/** Helper: convert local birth time to UTC using IANA timezone string */
function birthTimeToUtcHour(birthDate: string, birthTime: string, timezone?: string): number {
  const [hh, mm] = String(birthTime || "12:00").split(":").map(Number);
  const localHour = hh + mm / 60;

  if (!timezone) {
    // Fallback: assume UTC-6 (CST) if no timezone available
    return localHour + 6;
  }

  try {
    // Use Intl to get the UTC offset for the birth date in the given timezone
    const dateStr = `${birthDate}T${birthTime.padStart(5, "0")}:00`;
    const localDate = new Date(dateStr);
    // Get offset in minutes between UTC and the timezone
    const utcDate = new Date(localDate.toLocaleString("en-US", { timeZone: "UTC" }));
    const tzDate = new Date(localDate.toLocaleString("en-US", { timeZone: timezone }));
    const offsetMinutes = (utcDate.getTime() - tzDate.getTime()) / 60000;
    return localHour + offsetMinutes / 60;
  } catch {
    // Fallback if timezone string is invalid
    return localHour + 6;
  }
}

/* ═══════════════════════════════════════════
   Timeline — planet line synopsis per location
   ═══════════════════════════════════════════ */

/** What it means to live near a planet's line */
const PLANET_LIVING_SYNOPSIS: Record<string, { theme: string; synopsis: string }> = {
  Sun: { theme: "Identity & Visibility", synopsis: "This was a place where you felt most like yourself — or were pushed to figure out who that was. Your confidence, visibility, and sense of purpose were amplified here. People noticed you." },
  Moon: { theme: "Emotional Life & Belonging", synopsis: "This place shaped your emotional landscape. It felt like home in some deep way, or it stirred up everything you needed to process about home, family, and safety. Your inner world was loud here." },
  Mercury: { theme: "Communication & Learning", synopsis: "Your mind was active here — new ideas, new connections, new ways of thinking. This was a place of learning, conversation, and mental stimulation. Information flowed to you easily." },
  Venus: { theme: "Love, Beauty & Pleasure", synopsis: "This was a place of attraction — you were drawn to the culture, the aesthetics, the social life. Relationships flourished here. You felt more beautiful, more connected, more alive to pleasure." },
  Mars: { theme: "Drive, Conflict & Energy", synopsis: "This place lit a fire under you. Your ambition, competitive edge, and physical energy were all heightened. It may have also brought conflict or impatience — everything felt more urgent here." },
  Jupiter: { theme: "Luck, Growth & Expansion", synopsis: "This was an expansive place for you. Opportunities came more easily, your worldview grew, and things felt possible. Abundance, travel, education, and optimism were all amplified." },
  Saturn: { theme: "Discipline, Structure & Challenges", synopsis: "This place tested you and made you grow up. Hard work, responsibility, and structure were the themes. It may have felt heavy at times, but the things you built here lasted." },
  Uranus: { theme: "Freedom, Disruption & Awakening", synopsis: "This place shook things up. Your sense of independence, your need for change, and your willingness to break from convention were all activated. Life here was unpredictable but liberating." },
  Neptune: { theme: "Dreams, Creativity & Illusion", synopsis: "This was a dreamy, creative, and sometimes confusing place. Boundaries blurred — between work and art, between you and others, between reality and fantasy. Inspiration was high, but so was fog." },
  Pluto: { theme: "Transformation & Power", synopsis: "This place transformed you at a deep level. Power dynamics, intensity, and the need to shed old versions of yourself were all present. You left this place a different person than when you arrived." },
};

/** Get synopsis for a location based on nearby planetary lines */
function getLocationSynopsis(lat: number, lng: number, lines: AstroLine[]): { planet: string; angle: string; dist: number; theme: string; synopsis: string }[] {
  const nearby: { planet: string; angle: string; dist: number; theme: string; synopsis: string }[] = [];

  for (const line of lines) {
    const dist = minDistToLine(lat, lng, line.points);
    if (dist > 15) continue; // Only count lines within 15 degrees

    const info = PLANET_LIVING_SYNOPSIS[line.planet];
    if (!info) continue;

    // Avoid duplicates — only keep the closest angle for each planet
    const existing = nearby.find(n => n.planet === line.planet);
    if (existing && existing.dist <= dist) continue;
    if (existing) {
      const idx = nearby.indexOf(existing);
      nearby[idx] = { planet: line.planet, angle: line.angle, dist, ...info };
    } else {
      nearby.push({ planet: line.planet, angle: line.angle, dist, ...info });
    }
  }

  return nearby.sort((a, b) => a.dist - b.dist);
}

/** Timeline localStorage key — scoped per user */
const TIMELINE_LS_KEY_BASE = "mapped_timeline";

function getTimelineKey(uid?: string | null): string {
  return uid ? `${TIMELINE_LS_KEY_BASE}:${uid}` : TIMELINE_LS_KEY_BASE;
}

function loadTimeline(uid?: string | null): TimelineEntry[] {
  try {
    const raw = localStorage.getItem(getTimelineKey(uid));
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveTimeline(entries: TimelineEntry[], uid?: string | null) {
  try { localStorage.setItem(getTimelineKey(uid), JSON.stringify(entries)); } catch { /* ignore */ }
}

/** Family analysis is persisted per user, keyed to a signature of the family
 * members — so it's saved once and only regenerated when the family changes. */
const familyKey = (uid?: string | null) => `mapped:familyAnalysis:${uid || "anon"}`;
const familyMembers = (conns: Connection[]) => conns.filter((c) => c.category === "family");
function familySignature(conns: Connection[]): string {
  return familyMembers(conns)
    .map((c) => `${c.id}:${c.relationship}:${c.birth_date}:${c.birth_time || ""}`)
    .sort()
    .join("|");
}
type SavedFamily = { sig: string; analysis: FamilyAnalysis };

/* ═══════════════════════════════════════════
   Major Cities Database
   ═══════════════════════════════════════════ */

interface MajorCity {
  name: string;
  date: string; // YYYY-MM-DD founding/incorporation
  sun: string;  // 3-letter sign abbreviation
  lat: number;
  lng: number;
  country: string; // display label for filtering
}

// Sun sign derived from founding date. These are real incorporation/founding dates.
const MAJOR_CITIES: MajorCity[] = [
  // ── United States ──
  { name: "New York City", date: "1898-01-01", sun: "Cap", lat: 40.7128, lng: -74.006, country: "US" },
  { name: "Los Angeles", date: "1850-04-04", sun: "Ari", lat: 34.0522, lng: -118.2437, country: "US" },
  { name: "Chicago", date: "1837-03-04", sun: "Pis", lat: 41.8781, lng: -87.6298, country: "US" },
  { name: "Houston", date: "1837-06-05", sun: "Gem", lat: 29.7604, lng: -95.3698, country: "US" },
  { name: "Phoenix", date: "1881-02-25", sun: "Pis", lat: 33.4484, lng: -112.074, country: "US" },
  { name: "Philadelphia", date: "1701-10-25", sun: "Sco", lat: 39.9526, lng: -75.1652, country: "US" },
  { name: "San Antonio", date: "1837-05-05", sun: "Tau", lat: 29.4241, lng: -98.4936, country: "US" },
  { name: "San Diego", date: "1850-03-27", sun: "Ari", lat: 32.7157, lng: -117.1611, country: "US" },
  { name: "Dallas", date: "1856-02-02", sun: "Aqu", lat: 32.7767, lng: -96.797, country: "US" },
  { name: "San Francisco", date: "1850-04-15", sun: "Ari", lat: 37.7749, lng: -122.4194, country: "US" },
  { name: "Austin", date: "1839-12-27", sun: "Cap", lat: 30.2672, lng: -97.7431, country: "US" },
  { name: "Seattle", date: "1869-12-02", sun: "Sag", lat: 47.6062, lng: -122.3321, country: "US" },
  { name: "Denver", date: "1861-11-07", sun: "Sco", lat: 39.7392, lng: -104.9903, country: "US" },
  { name: "Nashville", date: "1806-12-29", sun: "Cap", lat: 36.1627, lng: -86.7816, country: "US" },
  { name: "Portland", date: "1851-02-08", sun: "Aqu", lat: 45.5152, lng: -122.6784, country: "US" },
  { name: "Miami", date: "1896-07-28", sun: "Leo", lat: 25.7617, lng: -80.1918, country: "US" },
  { name: "Atlanta", date: "1847-12-29", sun: "Cap", lat: 33.749, lng: -84.388, country: "US" },
  { name: "New Orleans", date: "1718-05-07", sun: "Tau", lat: 29.9511, lng: -90.0715, country: "US" },
  { name: "Minneapolis", date: "1867-03-01", sun: "Pis", lat: 44.9778, lng: -93.265, country: "US" },
  { name: "Boston", date: "1822-02-23", sun: "Pis", lat: 42.3601, lng: -71.0589, country: "US" },
  { name: "Las Vegas", date: "1911-05-15", sun: "Tau", lat: 36.1699, lng: -115.1398, country: "US" },
  { name: "Honolulu", date: "1907-04-30", sun: "Tau", lat: 21.3069, lng: -157.8583, country: "US" },

  // ── Canada ──
  { name: "Toronto", date: "1834-03-06", sun: "Pis", lat: 43.6532, lng: -79.3832, country: "Canada" },
  { name: "Vancouver", date: "1886-04-06", sun: "Ari", lat: 49.2827, lng: -123.1207, country: "Canada" },
  { name: "Montréal", date: "1832-06-05", sun: "Gem", lat: 45.5017, lng: -73.5673, country: "Canada" },

  // ── Mexico ──
  { name: "Mexico City", date: "1524-03-13", sun: "Pis", lat: 19.4326, lng: -99.1332, country: "Mexico" },

  // ── South America ──
  { name: "Buenos Aires", date: "1536-02-02", sun: "Aqu", lat: -34.6037, lng: -58.3816, country: "Argentina" },
  { name: "São Paulo", date: "1554-01-25", sun: "Aqu", lat: -23.5505, lng: -46.6333, country: "Brazil" },
  { name: "Rio de Janeiro", date: "1565-03-01", sun: "Pis", lat: -22.9068, lng: -43.1729, country: "Brazil" },
  { name: "Lima", date: "1535-01-18", sun: "Cap", lat: -12.0464, lng: -77.0428, country: "Peru" },
  { name: "Bogotá", date: "1538-08-06", sun: "Leo", lat: 4.711, lng: -74.0721, country: "Colombia" },
  { name: "Santiago", date: "1541-02-12", sun: "Aqu", lat: -33.4489, lng: -70.6693, country: "Chile" },
  { name: "Medellín", date: "1616-03-02", sun: "Pis", lat: 6.2442, lng: -75.5812, country: "Colombia" },
  { name: "Montevideo", date: "1724-12-24", sun: "Cap", lat: -34.9011, lng: -56.1645, country: "Uruguay" },

  // ── Europe ──
  { name: "London", date: "1189-10-08", sun: "Lib", lat: 51.5074, lng: -0.1278, country: "UK" },
  { name: "Paris", date: "0508-11-27", sun: "Sag", lat: 48.8566, lng: 2.3522, country: "France" },
  { name: "Berlin", date: "1237-10-28", sun: "Sco", lat: 52.52, lng: 13.405, country: "Germany" },
  { name: "Rome", date: "0753-04-21", sun: "Tau", lat: 41.9028, lng: 12.4964, country: "Italy" },
  { name: "Barcelona", date: "1249-04-11", sun: "Ari", lat: 41.3874, lng: 2.1686, country: "Spain" },
  { name: "Amsterdam", date: "1275-10-27", sun: "Sco", lat: 52.3676, lng: 4.9041, country: "Netherlands" },
  { name: "Lisbon", date: "1256-06-01", sun: "Gem", lat: 38.7223, lng: -9.1393, country: "Portugal" },
  { name: "Copenhagen", date: "1254-06-01", sun: "Gem", lat: 55.6761, lng: 12.5683, country: "Denmark" },
  { name: "Stockholm", date: "1252-08-01", sun: "Leo", lat: 59.3293, lng: 18.0686, country: "Sweden" },
  { name: "Vienna", date: "1221-06-01", sun: "Gem", lat: 48.2082, lng: 16.3738, country: "Austria" },
  { name: "Prague", date: "1348-04-07", sun: "Ari", lat: 50.0755, lng: 14.4378, country: "Czech Republic" },
  { name: "Athens", date: "1834-09-18", sun: "Vir", lat: 37.9838, lng: 23.7275, country: "Greece" },
  { name: "Istanbul", date: "0330-05-11", sun: "Tau", lat: 41.0082, lng: 28.9784, country: "Turkey" },
  { name: "Dublin", date: "1171-06-15", sun: "Gem", lat: 53.3498, lng: -6.2603, country: "Ireland" },
  { name: "Edinburgh", date: "1329-05-28", sun: "Gem", lat: 55.9533, lng: -3.1883, country: "UK" },
  { name: "Reykjavík", date: "1786-08-18", sun: "Leo", lat: 64.1466, lng: -21.9426, country: "Iceland" },

  // ── Africa ──
  { name: "Cape Town", date: "1652-04-06", sun: "Ari", lat: -33.9249, lng: 18.4241, country: "South Africa" },
  { name: "Marrakech", date: "1070-05-01", sun: "Tau", lat: 31.6295, lng: -7.9811, country: "Morocco" },
  { name: "Nairobi", date: "1899-07-01", sun: "Can", lat: -1.2921, lng: 36.8219, country: "Kenya" },
  { name: "Lagos", date: "1914-01-01", sun: "Cap", lat: 6.5244, lng: 3.3792, country: "Nigeria" },
  { name: "Cairo", date: "0969-07-06", sun: "Can", lat: 30.0444, lng: 31.2357, country: "Egypt" },
  { name: "Accra", date: "1877-03-28", sun: "Ari", lat: 5.6037, lng: -0.187, country: "Ghana" },
  { name: "Dar es Salaam", date: "1862-01-01", sun: "Cap", lat: -6.7924, lng: 39.2083, country: "Tanzania" },

  // ── Middle East ──
  { name: "Dubai", date: "1833-06-09", sun: "Gem", lat: 25.2048, lng: 55.2708, country: "UAE" },
  { name: "Tel Aviv", date: "1909-04-11", sun: "Ari", lat: 32.0853, lng: 34.7818, country: "Israel" },
  { name: "Beirut", date: "1888-01-01", sun: "Cap", lat: 33.8938, lng: 35.5018, country: "Lebanon" },

  // ── South & Southeast Asia ──
  { name: "Mumbai", date: "1661-09-21", sun: "Vir", lat: 19.076, lng: 72.8777, country: "India" },
  { name: "Delhi", date: "1911-12-12", sun: "Sag", lat: 28.6139, lng: 77.209, country: "India" },
  { name: "Bangalore", date: "1537-03-27", sun: "Ari", lat: 12.9716, lng: 77.5946, country: "India" },
  { name: "Bangkok", date: "1782-04-21", sun: "Tau", lat: 13.7563, lng: 100.5018, country: "Thailand" },
  { name: "Singapore", date: "1819-02-06", sun: "Aqu", lat: 1.3521, lng: 103.8198, country: "Singapore" },
  { name: "Bali", date: "1906-06-27", sun: "Can", lat: -8.3405, lng: 115.092, country: "Indonesia" },
  { name: "Hanoi", date: "1010-07-01", sun: "Can", lat: 21.0278, lng: 105.8342, country: "Vietnam" },
  { name: "Kathmandu", date: "0723-10-01", sun: "Lib", lat: 27.7172, lng: 85.324, country: "Nepal" },

  // ── East Asia ──
  { name: "Tokyo", date: "1868-07-17", sun: "Can", lat: 35.6762, lng: 139.6503, country: "Japan" },
  { name: "Kyoto", date: "0794-10-22", sun: "Lib", lat: 35.0116, lng: 135.7681, country: "Japan" },
  { name: "Seoul", date: "1394-10-28", sun: "Sco", lat: 37.5665, lng: 126.978, country: "South Korea" },
  { name: "Shanghai", date: "1927-07-07", sun: "Can", lat: 31.2304, lng: 121.4737, country: "China" },
  { name: "Hong Kong", date: "1842-08-29", sun: "Vir", lat: 22.3193, lng: 114.1694, country: "China" },
  { name: "Taipei", date: "1920-10-01", sun: "Lib", lat: 25.033, lng: 121.5654, country: "Taiwan" },

  // ── Oceania ──
  { name: "Sydney", date: "1842-07-20", sun: "Can", lat: -33.8688, lng: 151.2093, country: "Australia" },
  { name: "Melbourne", date: "1847-06-12", sun: "Gem", lat: -37.8136, lng: 144.9631, country: "Australia" },
  { name: "Auckland", date: "1871-04-24", sun: "Tau", lat: -36.8485, lng: 174.7633, country: "New Zealand" },
];

const COUNTRY_LIST = Array.from(new Set(MAJOR_CITIES.map(c => c.country))).sort();

// ─── Life Areas: astrocartography scoring by life question ───

type LifeAreaId = "destiny" | "love" | "money" | "healing" | "work" | "transformation" | "rest" | "adventure";

interface LifeArea {
  id: LifeAreaId;
  label: string;
  icon: string;
  question: string; // what the user is actually asking
  planets: Record<string, number>; // planet → weight (negative = penalizes)
  angles: Record<string, number>; // angle → multiplier
  relevantLines: { planet: string; angle: string }[]; // which lines to highlight on map
}

const LIFE_AREAS: LifeArea[] = [
  {
    id: "love",
    label: "Love",
    icon: "♀",
    question: "Where will I find love?",
    planets: { Venus: 5, Moon: 3, Mars: 2, Neptune: 1, Saturn: -1.5 },
    angles: { AC: 1.6, DC: 1.8, IC: 1.4, MC: 0.6 },
    relevantLines: [
      { planet: "Venus", angle: "ASC" }, { planet: "Venus", angle: "DSC" },
      { planet: "Venus", angle: "IC" }, { planet: "Venus", angle: "MC" },
      { planet: "Moon", angle: "DSC" }, { planet: "Mars", angle: "DSC" },
    ],
  },
  {
    id: "destiny",
    label: "Destiny",
    icon: "☊",
    question: "Where is my purpose?",
    planets: { "North Node": 5, Sun: 4, Jupiter: 3, Pluto: 1.5 },
    angles: { MC: 2.0, AC: 1.4, DC: 0.6, IC: 0.5 },
    relevantLines: [
      { planet: "North Node", angle: "MC" }, { planet: "North Node", angle: "ASC" },
      { planet: "Sun", angle: "MC" }, { planet: "Jupiter", angle: "MC" },
    ],
  },
  {
    id: "money",
    label: "Money",
    icon: "♃",
    question: "Where will I prosper?",
    planets: { Jupiter: 5, Venus: 3, Sun: 2.5, Pluto: 2, Saturn: 1 },
    angles: { MC: 2.0, AC: 1.4, DC: 0.5, IC: 0.4 },
    relevantLines: [
      { planet: "Jupiter", angle: "MC" }, { planet: "Jupiter", angle: "ASC" },
      { planet: "Venus", angle: "MC" }, { planet: "Sun", angle: "MC" },
      { planet: "Pluto", angle: "MC" },
    ],
  },
  {
    id: "healing",
    label: "Healing",
    icon: "☽",
    question: "Where can I rest and recover?",
    planets: { Moon: 5, Neptune: 3, Jupiter: 2.5, Venus: 1.5, Mars: -2, Saturn: -1 },
    angles: { IC: 2.0, DC: 1.2, AC: 0.8, MC: 0.4 },
    relevantLines: [
      { planet: "Moon", angle: "IC" }, { planet: "Neptune", angle: "IC" },
      { planet: "Jupiter", angle: "IC" }, { planet: "Venus", angle: "IC" },
    ],
  },
  {
    id: "work",
    label: "Best Work",
    icon: "♄",
    question: "Where will I do my best work?",
    planets: { Saturn: 5, Mercury: 4, Mars: 3, Sun: 2 },
    angles: { MC: 2.2, AC: 1.0, IC: 0.3, DC: 0.3 },
    relevantLines: [
      { planet: "Saturn", angle: "MC" }, { planet: "Mercury", angle: "MC" },
      { planet: "Mars", angle: "MC" }, { planet: "Sun", angle: "MC" },
    ],
  },
  {
    id: "transformation",
    label: "Transformation",
    icon: "♇",
    question: "Where will I be changed?",
    planets: { Pluto: 5, Uranus: 4, Saturn: 3, Neptune: 1.5 },
    angles: { AC: 1.8, MC: 1.4, IC: 1.0, DC: 0.8 },
    relevantLines: [
      { planet: "Pluto", angle: "ASC" }, { planet: "Pluto", angle: "MC" },
      { planet: "Uranus", angle: "ASC" }, { planet: "Saturn", angle: "MC" },
    ],
  },
  {
    id: "rest",
    label: "Rest",
    icon: "☾",
    question: "Where can I feel at home?",
    planets: { Moon: 5, Venus: 4, Jupiter: 3, Mars: -2, Pluto: -2 },
    angles: { IC: 2.2, DC: 1.0, AC: 0.6, MC: 0.3 },
    relevantLines: [
      { planet: "Moon", angle: "IC" }, { planet: "Venus", angle: "IC" },
      { planet: "Jupiter", angle: "IC" },
    ],
  },
  {
    id: "adventure",
    label: "Adventure",
    icon: "♅",
    question: "Where will I feel alive?",
    planets: { Jupiter: 4, Uranus: 5, Mars: 3.5, Sun: 2, Saturn: -1.5 },
    angles: { AC: 2.0, MC: 1.2, DC: 0.8, IC: 0.4 },
    relevantLines: [
      { planet: "Jupiter", angle: "ASC" }, { planet: "Uranus", angle: "ASC" },
      { planet: "Mars", angle: "ASC" }, { planet: "Uranus", angle: "MC" },
    ],
  },
];

// ─── City detail copy per life area (headline, description, reasoning, caveat) ───

interface CityDetail {
  headline: (city: string) => string;
  description: (city: string, topLine: { planet: string; angle: string }) => string;
  reasoning: (city: string, lines: { planet: string; angle: string; dist: number }[]) => string;
  caveat: string;
}

const ANGLE_NAMES: Record<string, string> = { ASC: "Ascendant", DSC: "Descendant", MC: "Midheaven", IC: "Nadir" };

/** Plain-English description of what each planet governs — no jargon */
const PLANET_PLAIN: Record<string, string> = {
  Sun: "your identity and confidence",
  Moon: "your emotions and inner life",
  Mercury: "your communication and thinking",
  Venus: "love, beauty, and attraction",
  Mars: "drive, ambition, and conflict",
  Jupiter: "luck, growth, and opportunity",
  Saturn: "discipline, responsibility, and hard lessons",
  Uranus: "sudden change and independence",
  Neptune: "creativity, intuition, and illusion",
  Pluto: "deep transformation and power",
  "North Node": "your life purpose and destiny",
};

/** Specific crossing descriptions for planet pairs — keyed by sorted planet names */
const CROSSING_DESCRIPTIONS: Record<string, string> = {
  "Mars|Venus": "Attraction meets drive. Chemistry is strong here — passion runs hot, and romantic energy has an edge to it.",
  "Jupiter|Venus": "Love and luck combine. Social life expands, romantic opportunities multiply, and beauty feels effortless.",
  "Moon|Venus": "Emotional depth meets warmth. Relationships here have unusual tenderness. A place where love feels safe.",
  "Saturn|Venus": "Love meets commitment. Partnerships that form here tend to be serious and long-lasting, not casual.",
  "Neptune|Venus": "Romance feels dreamy and idealized. Art and creativity flow, but be careful — things may not be what they seem.",
  "Pluto|Venus": "Intense, transformative love. Relationships here change you fundamentally. Nothing stays surface-level.",
  "Uranus|Venus": "Love arrives unexpectedly. Relationships are exciting but unconventional — freedom matters as much as closeness.",
  "Mercury|Venus": "Charm meets wit. You communicate with warmth here, and social connections form through conversation and ideas.",
  "Jupiter|Sun": "Purpose meets expansion. You feel larger than life here — recognized, optimistic, and lucky.",
  "Saturn|Sun": "Identity meets discipline. This place demands you grow up and take yourself seriously. Hard, but you earn real authority.",
  "Pluto|Sun": "Identity meets transformation. Who you are fundamentally shifts here. You become more powerful, but it's not comfortable.",
  "Moon|Sun": "Your inner life and outer identity align. You feel emotionally whole here — what you feel matches who you are.",
  "Mercury|Sun": "Your mind and identity sharpen together. Communication comes naturally, and people listen when you speak.",
  "Neptune|Sun": "Your sense of self becomes more fluid and creative. Great for artistic work, but your direction can feel foggy.",
  "Uranus|Sun": "You reinvent yourself here. Expect sudden shifts in how you see yourself and how others see you.",
  "Mars|Sun": "Confidence and drive amplify each other. You feel bold and competitive here, but watch for ego clashes.",
  "Jupiter|Moon": "Emotional life expands. You feel generous, optimistic, and emotionally secure. A warm, abundant place.",
  "Mars|Moon": "Emotions run hot. You feel things intensely and react quickly. Passionate but sometimes volatile.",
  "Mercury|Moon": "Your feelings and your words connect easily. You understand your own emotions and can articulate them clearly.",
  "Saturn|Moon": "Emotional life feels heavier here. Family responsibilities weigh on you, but emotional maturity deepens.",
  "Neptune|Moon": "Intuition and emotion blur together. Deeply spiritual and empathetic, but boundaries can dissolve.",
  "Pluto|Moon": "Emotional intensity at its peak. Hidden feelings surface, psychological depth increases. Healing, but heavy.",
  "Uranus|Moon": "Emotional life is unpredictable. Moods shift quickly, living situations change, but you gain emotional freedom.",
  "Jupiter|Mars": "Energy and opportunity combine. You feel driven and lucky at the same time — a good place for bold moves.",
  "Mercury|Mars": "Sharp mind meets strong will. You argue well, think fast, and get things done. Watch for being too blunt.",
  "Saturn|Mars": "Drive meets discipline. Progress is slow but solid. You learn patience here, sometimes the hard way.",
  "Jupiter|Mercury": "Your mind expands. Learning, teaching, writing, and big ideas all thrive. Communication opens doors.",
  "Jupiter|Saturn": "Growth meets structure. Success comes through patience and persistence. Slow expansion that actually lasts.",
  "Neptune|Pluto": "Generational energy — deep spiritual and psychological undercurrents. The effect is subtle and collective.",
  "Pluto|Uranus": "Radical transformation. Old structures break down and something entirely new emerges. Intense and disruptive.",
  "Neptune|Uranus": "Innovation meets imagination. Boundaries dissolve in unexpected ways. Creative breakthroughs are possible.",
  "Saturn|Uranus": "Stability and disruption clash. You oscillate between wanting security and needing freedom. Tense but productive.",
  "Mercury|Saturn": "Thinking becomes more disciplined and serious. Good for focused study, but mental heaviness is possible.",
  "Mercury|Uranus": "Your mind speeds up. Original ideas come fast, and you think in ways that surprise people.",
  "Mercury|Neptune": "Imagination and communication merge. Great for creative writing and art, but clarity can suffer.",
  "Mercury|Pluto": "Your thinking goes deep. You uncover hidden truths and communicate with intensity. Research thrives here.",
  "Mars|Neptune": "Drive meets intuition. You pursue goals guided by feeling rather than logic. Inspiring, but sometimes directionless.",
  "Mars|Pluto": "Willpower and transformation combine. Enormous drive to change things — you push hard and don't back down.",
  "Mars|Uranus": "Energy is explosive and unpredictable. Sudden bursts of action, bold moves, and a need for independence.",
  "Mars|Saturn": "Ambition meets limitation. You work harder than anywhere else, but frustration can build. Persistence wins.",
  "Jupiter|Neptune": "Faith and optimism expand. A place for spiritual growth, creative vision, and idealism — but stay grounded.",
  "Jupiter|Pluto": "Power and expansion combine. Ambition is enormous here. You can achieve a lot, but watch for excess.",
  "Jupiter|Uranus": "Sudden luck and unexpected opportunities. Life takes surprising turns that tend to work out well.",
  "Neptune|Saturn": "Dreams meet reality. You learn which visions are worth building and which are illusions. Bittersweet clarity.",
  "Pluto|Saturn": "Power meets discipline. Transformation through hard work. You rebuild things from the ground up here.",
  "North Node|Sun": "Your identity aligns with your life purpose. You feel like you're finally heading in the right direction.",
  "Moon|North Node": "Your emotional instincts guide you toward your destiny. Home and purpose feel connected.",
  "North Node|Venus": "Love and purpose align. Relationships here push you toward who you're meant to become.",
  "Jupiter|North Node": "Growth and destiny combine. Opportunities arrive that feel fated. Expansion serves your larger purpose.",
  "Mars|North Node": "Your drive pushes you toward your purpose. Action feels meaningful and aligned here.",
  "Mercury|North Node": "Communication and learning serve your destiny. The ideas you encounter here shape your path.",
  "North Node|Saturn": "Difficult lessons that serve your growth. The hard stuff here is the point — it's building something lasting.",
  "North Node|Pluto": "Deep transformation aligned with destiny. You shed old versions of yourself and step into who you're becoming.",
  "North Node|Uranus": "Your path takes unexpected turns that feel right in hindsight. Freedom and purpose merge.",
  "Neptune|North Node": "Spiritual calling. Your intuition guides you toward your purpose, but the path isn't always clear.",
};

/** Get crossing description for a planet pair */
function getCrossingDescription(planet1: string, planet2: string): string {
  const key = [planet1, planet2].sort().join("|");
  if (CROSSING_DESCRIPTIONS[key]) return CROSSING_DESCRIPTIONS[key];
  // Fallback using plain descriptions
  const p1Desc = PLANET_PLAIN[planet1] || planet1.toLowerCase();
  const p2Desc = PLANET_PLAIN[planet2] || planet2.toLowerCase();
  return `${planet1} (${p1Desc}) and ${planet2} (${p2Desc}) overlap here. Both energies are active in this location, blending into something you'd feel in daily life.`;
}

/** Which life areas a given planet+angle combo is relevant for */
function lifeAreasForLine(planet: string, angle: string): string[] {
  return LIFE_AREAS
    .filter(area => area.relevantLines.some(rl => rl.planet === planet && rl.angle === angle))
    .map(area => area.label);
}
const ANGLE_PLAIN: Record<string, string> = {
  ASC: "rising over the horizon",
  DSC: "setting below the horizon",
  MC: "at the very top of the sky",
  IC: "at the deepest point below",
};

const LIFE_AREA_COPY: Record<LifeAreaId, CityDetail> = {
  love: {
    headline: (city) => `${city} is strong for love`,
    description: (_city, top) => {
      if (top.planet === "Venus" && top.angle === "ASC") return "You become more magnetic here — people are drawn to you almost without reason. Expect more attention, more offers, more beauty in daily life.";
      if (top.planet === "Venus" && top.angle === "DSC") return "This is where you meet them. Partnerships form more easily, attraction feels mutual and fated. Longer stays increase the chances.";
      if (top.planet === "Venus" && top.angle === "IC") return "A place for building something together. Domesticity feels sweet here, not stifling. Good for settling down with someone.";
      if (top.planet === "Moon" && top.angle === "DSC") return "Emotional connection comes easily here. Partnerships tend toward depth and intuition rather than surface chemistry.";
      return "Venus energy amplifies attraction and openness. You're more receptive to love here, and it's more receptive to you.";
    },
    reasoning: (_city, lines) => {
      const lineDesc = lines.slice(0, 2).map(l => `${l.planet} ${ANGLE_NAMES[l.angle] || l.angle} (${l.dist < 2 ? "very close" : l.dist < 5 ? "close" : "nearby"})`).join(" and ");
      return `Your ${lineDesc} line${lines.length > 1 ? "s run" : " runs"} through this area. Venus governs attraction, beauty, and magnetism. The ${ANGLE_NAMES[lines[0]?.angle] || "angle"} position means the energy is ${lines[0]?.angle === "ASC" ? "projected outward — others see it in you" : lines[0]?.angle === "DSC" ? "reflected back — you encounter it in others" : lines[0]?.angle === "IC" ? "internalized — it shapes your private life" : "elevated — it becomes public and visible"}.`;
    },
    caveat: "Venus lines amplify attraction but don't guarantee depth. This is a place for romance and connection, not necessarily for building something lasting without effort.",
  },
  destiny: {
    headline: (city) => `${city} aligns with your purpose`,
    description: (_city, top) => {
      if (top.planet === "North Node") return "Your soul's direction passes through here. Life feels more on-track, like you're moving toward something rather than away. Decisions come more clearly.";
      if (top.planet === "Sun" && top.angle === "MC") return "You're seen here. Your public self and your true self align more easily. Career moves made from this place tend to stick.";
      return "The energy here supports forward motion. Things you start tend to have weight and longevity.";
    },
    reasoning: (_city, lines) => {
      const lineDesc = lines.slice(0, 2).map(l => `${l.planet} ${ANGLE_NAMES[l.angle] || l.angle}`).join(" and ");
      return `Your ${lineDesc} line${lines.length > 1 ? "s pass" : " passes"} through here. The North Node represents your soul's evolutionary direction — where you're headed this lifetime, not where you've been. At the Midheaven, that purpose becomes visible to others.`;
    },
    caveat: "Destiny lines feel compelling but can be intense. Growth here isn't always comfortable — it's the 'right' path, not necessarily the easy one.",
  },
  money: {
    headline: (city) => `${city} favors prosperity`,
    description: (_city, top) => {
      if (top.planet === "Jupiter" && top.angle === "MC") return "Expansion at the top. Opportunities come to you here — bigger roles, better pay, luckier breaks. Things tend to work out.";
      if (top.planet === "Pluto" && top.angle === "MC") return "Power and wealth through transformation. This isn't passive abundance — it's the kind that comes from stepping into authority.";
      return "Financial energy flows more easily here. You're more likely to be in the right place at the right time for material gain.";
    },
    reasoning: (_city, lines) => {
      const lineDesc = lines.slice(0, 2).map(l => `${l.planet} ${ANGLE_NAMES[l.angle] || l.angle}`).join(" and ");
      return `Your ${lineDesc} line${lines.length > 1 ? "s cross" : " crosses"} this location. Jupiter expands whatever it touches — at the Midheaven, that means career and public success. Venus at the MC adds charm and ease to professional dealings.`;
    },
    caveat: "Prosperity lines increase opportunity, not guarantee outcomes. You still have to show up. But the wind is at your back here.",
  },
  healing: {
    headline: (city) => `${city} supports healing`,
    description: (_city, top) => {
      if (top.planet === "Moon" && top.angle === "IC") return "Emotional safety lives here. You can access feelings you've been avoiding, process old wounds, actually rest. The nervous system settles.";
      if (top.planet === "Neptune" && top.angle === "IC") return "Spiritual dissolution in the best sense — ego quiets down, intuition gets louder, creative/healing work flows. Just watch the escapism.";
      return "The energy here is gentle. Defenses come down naturally, not by force. Good for therapy, retreat, or just catching your breath.";
    },
    reasoning: (_city, lines) => {
      const lineDesc = lines.slice(0, 2).map(l => `${l.planet} ${ANGLE_NAMES[l.angle] || l.angle}`).join(" and ");
      return `Your ${lineDesc} line${lines.length > 1 ? "s touch" : " touches"} this area. The IC (Nadir) is the most private point in your chart — it governs home, roots, emotional foundations. Moon here deepens access to feelings; Neptune softens the boundaries that keep pain locked in.`;
    },
    caveat: "Healing locations can also amplify sensitivity and vulnerability. Neptune IC in particular can blur reality — pair deep inner work with grounding practices.",
  },
  work: {
    headline: (city) => `${city} sharpens your work`,
    description: (_city, top) => {
      if (top.planet === "Saturn" && top.angle === "MC") return "Mastery lives here. The work is harder but the results last. You build things that matter — reputation, expertise, legacy.";
      if (top.planet === "Mercury" && top.angle === "MC") return "Your ideas land here. Communication is clearer, writing is sharper, intellectual work finds its audience.";
      if (top.planet === "Mars" && top.angle === "MC") return "Drive and ambition amplify here. You work harder, push further, and people notice the intensity. Good for competition.";
      return "Professional focus comes more naturally here. Discipline feels less like punishment, more like flow.";
    },
    reasoning: (_city, lines) => {
      const lineDesc = lines.slice(0, 2).map(l => `${l.planet} ${ANGLE_NAMES[l.angle] || l.angle}`).join(" and ");
      return `Your ${lineDesc} line${lines.length > 1 ? "s converge" : " lands"} here. Saturn at the Midheaven is traditionally feared but actually represents mastery through sustained effort — the kind of reputation that's earned, not given. Mercury MC sharpens the mind for communication-heavy careers.`;
    },
    caveat: "Saturn MC is a crucible, not a shortcut. The work is real and sometimes isolating. But what you build here tends to outlast you.",
  },
  transformation: {
    headline: (city) => `${city} will change you`,
    description: (_city, top) => {
      if (top.planet === "Pluto") return "Nothing stays the same here. Old identities dissolve, power dynamics surface, and you either transform or leave. It's not subtle.";
      if (top.planet === "Uranus" && top.angle === "ASC") return "Awakening energy. You surprise yourself here — sudden clarity, unexpected reinvention, the feeling of finally seeing something you couldn't before.";
      return "The energy here dismantles what isn't working. It's uncomfortable while it's happening and clarifying in retrospect.";
    },
    reasoning: (_city, lines) => {
      const lineDesc = lines.slice(0, 2).map(l => `${l.planet} ${ANGLE_NAMES[l.angle] || l.angle}`).join(" and ");
      return `Your ${lineDesc} line${lines.length > 1 ? "s intersect" : " intersects"} here. Pluto governs death-and-rebirth cycles — the destruction of what's outlived its usefulness. Uranus is the lightning bolt — sudden, irreversible shifts in perspective. Neither is gentle, but both are honest.`;
    },
    caveat: "Transformation locations are powerful but not recreational. Visit with intention, not avoidance. The changes that happen here tend to be permanent.",
  },
  rest: {
    headline: (city) => `${city} feels like home`,
    description: (_city, top) => {
      if (top.planet === "Moon" && top.angle === "IC") return "Deep comfort here. Sleep improves, appetite normalizes, the constant low-grade anxiety of modern life quiets down. You can actually exhale.";
      if (top.planet === "Venus" && top.angle === "IC") return "Beauty in private life. Your home here would be lovely — aesthetics matter, pleasure isn't guilt-inducing, leisure feels earned.";
      return "You can stop performing here. The energy supports being rather than doing.";
    },
    reasoning: (_city, lines) => {
      const lineDesc = lines.slice(0, 2).map(l => `${l.planet} ${ANGLE_NAMES[l.angle] || l.angle}`).join(" and ");
      return `Your ${lineDesc} line${lines.length > 1 ? "s settle" : " settles"} here. The IC represents your innermost self — the version of you that exists when no one's watching. Moon at this angle deepens emotional security; Venus adds grace to daily domestic life; Jupiter makes the home feel spacious and generous.`;
    },
    caveat: "Rest locations can become too comfortable. Growth slows when everything feels easy. Best as a home base you return to, not a place to hide.",
  },
  adventure: {
    headline: (city) => `${city} wakes you up`,
    description: (_city, top) => {
      if (top.planet === "Uranus" && top.angle === "ASC") return "You're unpredictable here, in the best way. Routines break, spontaneity replaces planning, and you discover versions of yourself you didn't know existed.";
      if (top.planet === "Jupiter" && top.angle === "ASC") return "Everything feels possible here. You're luckier, bolder, more willing to say yes. The world expands when you show up.";
      if (top.planet === "Mars" && top.angle === "ASC") return "Physical energy surges here. You want to move, compete, explore. Sitting still feels wrong. Great for athletics, physical challenges, or just walking everywhere.";
      return "Restlessness has a direction here. You don't just want to escape — you want to discover.";
    },
    reasoning: (_city, lines) => {
      const lineDesc = lines.slice(0, 2).map(l => `${l.planet} ${ANGLE_NAMES[l.angle] || l.angle}`).join(" and ");
      return `Your ${lineDesc} line${lines.length > 1 ? "s activate" : " activates"} here. The Ascendant is your interface with the world — how you show up and what comes toward you. Jupiter on this angle expands your presence; Uranus electrifies it; Mars energizes it. All three favor bold action over careful planning.`;
    },
    caveat: "Adventure lines energize but don't stabilize. Great for trips, sabbaticals, and chapters of exploration. Less ideal if you need to slow down.",
  },
};

interface CityScore {
  city: MajorCity;
  scores: Record<LifeAreaId, number>;
  total: number;
  nearbyLines: { planet: string; angle: string; dist: number }[];
}

/** Calculate distance in degrees between a point and the nearest point on a line */
function minDistToLine(lat: number, lng: number, linePoints: [number, number][]): number {
  let minDist = Infinity;
  for (const [pLat, pLng] of linePoints) {
    const dLat = lat - pLat;
    const dLng = lng - pLng;
    const dist = Math.sqrt(dLat * dLat + dLng * dLng);
    if (dist < minDist) minDist = dist;
  }
  return minDist;
}

/** Convert proximity to a score: closer = higher. Max ~10 for right on the line, 0 for far away */
function proximityScore(distDeg: number): number {
  if (distDeg <= 2) return 10;
  if (distDeg <= 5) return 8;
  if (distDeg <= 10) return 6;
  if (distDeg <= 15) return 4;
  if (distDeg <= 25) return 2;
  return 0;
}

const ANGLE_MAP: Record<string, string> = { ASC: "AC", DSC: "DC", MC: "MC", IC: "IC" };

function scoreCitiesAstro(lines: AstroLine[], country?: string | null): CityScore[] {
  const cities = country ? MAJOR_CITIES.filter(c => c.country === country) : MAJOR_CITIES;
  return cities.map(city => {
    const nearby: { planet: string; angle: string; dist: number }[] = [];
    const scores: Record<string, number> = {};

    // Initialize all area scores
    for (const area of LIFE_AREAS) scores[area.id] = 0;

    for (const line of lines) {
      const dist = minDistToLine(city.lat, city.lng, line.points);
      if (dist > 30) continue;

      nearby.push({ planet: line.planet, angle: line.angle, dist });
      const score = proximityScore(dist);
      if (score === 0) continue;

      // Score each life area
      for (const area of LIFE_AREAS) {
        const pw = area.planets[line.planet] ?? 0;
        if (pw === 0) continue;
        const angleMapped = ANGLE_MAP[line.angle] || line.angle;
        const am = area.angles[angleMapped] ?? 1;
        scores[area.id] += score * pw * am;
      }
    }

    // Clamp negatives
    for (const area of LIFE_AREAS) scores[area.id] = Math.max(0, scores[area.id]);

    const total = Object.values(scores).reduce((sum, v) => sum + v, 0);
    return {
      city,
      scores: scores as Record<LifeAreaId, number>,
      total,
      nearbyLines: nearby.sort((a, b) => a.dist - b.dist).slice(0, 6),
    };
  }).sort((a, b) => b.total - a.total);
}

/* ═══════════════════════════════════════════
   Local storage helpers (works without auth)
   ═══════════════════════════════════════════ */

const LS_KEY = "mapped_connections";

function loadLocalConnections(): Connection[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalConnections(conns: Connection[]) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(conns));
  } catch { /* storage full */ }
}

/* ═══════════════════════════════════════════
   Family Analysis Algorithm
   ═══════════════════════════════════════════ */

/* ─── Planet shadow profiles — what each planet's sign reveals about a parent's patterns ─── */
const PLANET_SHADOW: Record<string, Record<string, { shadow: string; pattern: string }>> = {
  Mars: {
    Ari: { shadow: "Explosive anger", pattern: "anger comes fast and loud — short fuse, quick to yell, then acts like nothing happened" },
    Tau: { shadow: "Passive stubbornness", pattern: "won't fight openly but digs in and refuses to budge — the silent wall" },
    Gem: { shadow: "Verbal aggression", pattern: "weaponizes words when upset — sharp tongue, cutting remarks, argues to win" },
    Can: { shadow: "Guilt as control", pattern: "gets angry through hurt feelings — 'after everything I've done for you' energy" },
    Leo: { shadow: "Domination", pattern: "needs to be the authority — anger comes out when their ego is challenged" },
    Vir: { shadow: "Criticism as anger", pattern: "anger can come out as nitpicking — finding fault in the details, making you feel like nothing is quite right" },
    Lib: { shadow: "Passive aggression", pattern: "won't confront directly but you feel the cold — uses silence and withdrawal" },
    Sco: { shadow: "Punishing silence", pattern: "holds grudges, cuts you off emotionally, makes you earn your way back" },
    Sag: { shadow: "Brutal honesty as weapon", pattern: "says hurtful things and frames it as 'just being real' — no filter when angry" },
    Cap: { shadow: "Cold withdrawal", pattern: "shuts down emotionally and becomes all business — love becomes conditional on performance" },
    Aqu: { shadow: "Emotional dismissal", pattern: "treats your feelings like they're irrational — intellectualizes everything to avoid the real issue" },
    Pis: { shadow: "Victim mode", pattern: "makes themselves the wounded one even when they caused the harm — you end up apologizing" },
  },
  Saturn: {
    Ari: { shadow: "Fear of weakness", pattern: "taught you that vulnerability is dangerous — you have to be tough or you're failing" },
    Tau: { shadow: "Scarcity mindset", pattern: "money anxiety passed down — there's never enough, even when there is" },
    Gem: { shadow: "Intellectual pressure", pattern: "you had to be smart enough, say the right thing, always have an answer" },
    Can: { shadow: "Conditional nurturing", pattern: "love was available but it came with strings — you learned to earn comfort" },
    Leo: { shadow: "Performance pressure", pattern: "you had to shine or you were invisible — achievement became your identity" },
    Vir: { shadow: "Perfectionism", pattern: "nothing was ever good enough — you internalized the critic" },
    Lib: { shadow: "Peace at any price", pattern: "conflict was forbidden — you learned to suppress your real feelings to keep harmony" },
    Sco: { shadow: "Trust wounds", pattern: "secrets, control, or betrayal in the family — you learned that closeness is dangerous" },
    Sag: { shadow: "Restricted freedom", pattern: "beliefs were rigid, exploration was discouraged — you carry guilt about wanting more" },
    Cap: { shadow: "Emotional austerity", pattern: "feelings were a luxury — you were expected to handle things, not feel them" },
    Aqu: { shadow: "Alienation pattern", pattern: "being different was punished — you learned to hide the parts of you that didn't fit" },
    Pis: { shadow: "Boundary dissolution", pattern: "you were responsible for a parent's emotional state — their pain became yours to carry" },
  },
  Moon: {
    Ari: { shadow: "Emotional impulsivity", pattern: "reacts before thinking — emotional volatility that creates instability at home" },
    Tau: { shadow: "Emotional rigidity", pattern: "feelings have to fit the routine — change is threatening, comfort is king" },
    Gem: { shadow: "Emotional avoidance", pattern: "talks around feelings instead of sitting in them — deflects with humor or logic" },
    Can: { shadow: "Enmeshment", pattern: "love and worry are the same thing — can't let you grow up because it feels like losing you" },
    Leo: { shadow: "Centering themselves", pattern: "your emotions were always compared to theirs — hard to have your own experience" },
    Vir: { shadow: "Worry as love", pattern: "constant anxiety about getting it right — you learned that love means fixing" },
    Lib: { shadow: "Emotional performance", pattern: "everything had to look fine — real feelings were uncomfortable and got smoothed over" },
    Sco: { shadow: "Emotional intensity", pattern: "feelings went to 10 or 0 — you learned to walk on eggshells" },
    Sag: { shadow: "Emotional bypassing", pattern: "positivity as avoidance — your pain was reframed as a lesson instead of just held" },
    Cap: { shadow: "Emotional withholding", pattern: "love was shown through providing, not affection — you may struggle to feel 'enough' without achieving" },
    Aqu: { shadow: "Emotional distance", pattern: "present but not warm — you learned to self-soothe because comfort wasn't offered freely" },
    Pis: { shadow: "Emotional flooding", pattern: "absorbs everyone's pain — the household mood was dictated by this parent's state" },
  },
  Pluto: {
    Ari: { shadow: "Power through force", pattern: "my way or else — conflict in this family was about domination, not resolution" },
    Tau: { shadow: "Possessiveness", pattern: "love expressed as ownership — you may struggle with feeling controlled by people who love you" },
    Gem: { shadow: "Manipulation through information", pattern: "truth was a tool — what was told to whom was strategic" },
    Can: { shadow: "Emotional manipulation", pattern: "guilt, obligation, and loyalty used as leverage — love came with invisible strings" },
    Leo: { shadow: "Narcissistic patterns", pattern: "the family orbited around one person's needs — your role was to reflect their light" },
    Vir: { shadow: "Control through standards", pattern: "obsessive order — chaos was the enemy and you were the mess to be fixed" },
    Lib: { shadow: "Power hidden behind niceness", pattern: "everything looked harmonious on the surface while control operated underneath" },
    Sco: { shadow: "Family secrets", pattern: "there are things that happened in this family that were never spoken about — but you felt them" },
    Sag: { shadow: "Ideological control", pattern: "beliefs weren't questioned — leaving the family worldview felt like betrayal" },
    Cap: { shadow: "Achievement as worth", pattern: "your value was your output — rest, play, and softness weren't respected" },
    Aqu: { shadow: "Emotional exile", pattern: "being yourself meant being the outsider — conformity was the price of belonging" },
    Pis: { shadow: "Martyrdom cycle", pattern: "sacrifice was the family currency — someone always had to be suffering for others" },
  },
};

/* ─── Strength profiles — what a parent's strong placements gift to a child ─── */
const PLANET_GIFT: Record<string, Record<string, { gift: string; description: string }>> = {
  Sun: {
    Ari: { gift: "Courage", description: "taught you to go first, be direct, and back yourself" },
    Tau: { gift: "Steadiness", description: "showed you that reliability is a form of love" },
    Gem: { gift: "Curiosity", description: "made learning feel natural — you grew up asking questions" },
    Can: { gift: "Emotional safety", description: "made home feel like a real refuge" },
    Leo: { gift: "Self-worth", description: "taught you to own who you are without apologizing" },
    Vir: { gift: "Competence", description: "showed you that doing things well is its own reward" },
    Lib: { gift: "Fairness", description: "taught you to see both sides and treat people with grace" },
    Sco: { gift: "Resilience", description: "showed you that you can survive anything and come back stronger" },
    Sag: { gift: "Perspective", description: "taught you to see the bigger picture and stay hopeful" },
    Cap: { gift: "Work ethic", description: "showed you that what you build matters and discipline pays off" },
    Aqu: { gift: "Independent thinking", description: "taught you to trust your own mind even when others disagree" },
    Pis: { gift: "Compassion", description: "showed you how to hold space for other people's pain" },
  },
  Venus: {
    Ari: { gift: "Passionate love", description: "you learned that love should be exciting and fought for" },
    Tau: { gift: "Sensory warmth", description: "love was physical — good food, touch, comfort, beauty in the home" },
    Gem: { gift: "Verbal affection", description: "love was communicated — compliments, conversation, staying interested" },
    Can: { gift: "Devotional love", description: "you learned love as showing up no matter what" },
    Leo: { gift: "Generous love", description: "love was celebrated, expressed boldly, never hidden" },
    Vir: { gift: "Acts of service", description: "love looked like doing things for you — quiet, consistent, practical care" },
    Lib: { gift: "Harmonious partnership", description: "you grew up seeing what it looks like when people prioritize the relationship" },
    Sco: { gift: "Deep loyalty", description: "you learned that real love is unwavering, even in the dark" },
    Sag: { gift: "Freedom in love", description: "love wasn't possessive — you learned to let people be themselves" },
    Cap: { gift: "Committed love", description: "love meant building something together — showing up long-term" },
    Aqu: { gift: "Unconditional acceptance", description: "you were loved for your weirdness, not in spite of it" },
    Pis: { gift: "Unconditional love", description: "love was offered without conditions — tender, forgiving, all-encompassing" },
  },
  Jupiter: {
    Ari: { gift: "Bold optimism", description: "you learned to bet on yourself" },
    Tau: { gift: "Abundance mindset", description: "there was always enough — generosity was modeled" },
    Gem: { gift: "Intellectual richness", description: "knowledge was valued and shared freely" },
    Can: { gift: "Emotional generosity", description: "feelings were welcomed, not rationed" },
    Leo: { gift: "Creative confidence", description: "self-expression was encouraged and celebrated" },
    Vir: { gift: "Growth through skill", description: "getting better at things was the family ethos" },
    Lib: { gift: "Social intelligence", description: "you learned how to navigate people with grace" },
    Sco: { gift: "Emotional courage", description: "the family could go deep — nothing was too heavy to face" },
    Sag: { gift: "Expansive worldview", description: "you were encouraged to explore, question, and grow beyond your origins" },
    Cap: { gift: "Strategic thinking", description: "you learned to plan, build, and think long-term" },
    Aqu: { gift: "Progressive values", description: "you were raised to think for yourself and care about the bigger picture" },
    Pis: { gift: "Spiritual depth", description: "there was room for faith, intuition, and things beyond the material" },
  },
};

/* ─── How synastry aspects manifest as family patterns ─── */
const HARD_ASPECT_FAMILY: Record<string, string> = {
  // Parent planet → User planet: what the hard aspect creates
  "Mars→Moon": "Your {role}'s anger or aggression style directly impacts your emotional safety. You may have learned to manage their temper before your own feelings.",
  "Mars→Sun": "Your {role}'s drive and aggression clashed with your core identity. You may have felt steamrolled, or learned to fight back in ways that don't serve you.",
  "Saturn→Moon": "Your {role}'s rules, restrictions, or expectations weighed on you emotionally. You may carry a sense that you need to earn comfort or that your feelings are inconvenient.",
  "Saturn→Sun": "Your {role} put pressure on who you are — whether through criticism, high expectations, or withholding approval. Your confidence may be tangled up with their opinion of you.",
  "Saturn→Venus": "Your {role}'s restrictions shaped how you love. You may second-guess your worth in relationships or feel like affection has to be earned.",
  "Pluto→Moon": "There's a power dynamic between your {role} and your emotional world. Their intensity — whether overt or covert — shaped how safe you feel being vulnerable.",
  "Pluto→Sun": "Your {role}'s need for control touched your core identity. You may struggle with autonomy or feel like being yourself threatens the relationship.",
  "Pluto→Venus": "Your {role}'s intensity shaped your relationship patterns. You may confuse love with control, or seek out relationships that echo this power dynamic.",
  "Moon→Moon": "You absorb your {role}'s emotional state. Their moods became your moods — this is an inherited emotional pattern that takes conscious effort to untangle.",
  "Mars→Venus": "Your {role}'s aggression or drive clashed with your sense of love and beauty. You may have learned that conflict and love are inseparable.",
  "Neptune→Moon": "Your {role}'s boundaries were unclear — you may have grown up confused about what was real and what was performance in the family emotional life.",
  "Neptune→Sun": "Your {role} may have idealized you or been hard to pin down. You might struggle with seeing yourself clearly because the mirror they held up was foggy.",
};

const SOFT_ASPECT_FAMILY: Record<string, string> = {
  "Sun→Sun": "You and your {role} share a core understanding — your identities support each other. You see yourself reflected positively in them.",
  "Moon→Moon": "Emotional attunement comes naturally between you. Your {role}'s emotional style nurtures yours — this is inherited emotional safety.",
  "Venus→Venus": "You and your {role} share a love language. How they express care resonates with how you receive it.",
  "Venus→Moon": "Your {role}'s way of showing love directly nourishes your emotional needs. This is one of the warmest parent-child connections.",
  "Jupiter→Sun": "Your {role} expanded your sense of self — their optimism or generosity helped you believe in your own potential.",
  "Jupiter→Moon": "Your {role} made you feel emotionally abundant. Their presence in your life is a source of comfort and growth.",
  "Sun→Moon": "Your {role}'s identity nurtures your emotional world. Who they are makes you feel safe — this is a foundational family gift.",
};

function generateFamilyAnalysis(
  userChart: UserChart,
  connections: Connection[]
): FamilyAnalysis {
  const familyCore = connections.filter(
    (c) => c.category === "family"
  );
  const mom = familyCore.find((c) => c.relationship === "mother");
  const dad = familyCore.find((c) => c.relationship === "father");
  const siblings = familyCore.filter((c) => ["sister", "brother"].includes(c.relationship));

  const parents = [mom, dad].filter(Boolean) as Connection[];

  // ═══ BUILD PARENT PROFILES ═══
  const parentProfiles: ParentProfile[] = [];

  for (const parent of parents) {
    if (!parent.big_three) continue;
    const role = parent.relationship === "mother" ? "Mother" : "Father";
    const bt = parent.big_three;
    const btStr = `${SIGN_FULL[bt.sun]} Sun · ${SIGN_FULL[bt.moon]} Moon${bt.rising ? ` · ${SIGN_FULL[bt.rising]} Rising` : ""}`;

    const shadows: ParentProfile["shadows"] = [];
    const gifts: ParentProfile["gifts"] = [];
    const frictionWithYou: ParentProfile["frictionWithYou"] = [];
    const harmonyWithYou: ParentProfile["harmonyWithYou"] = [];

    // Their chart shadows
    if (parent.planets) {
      const pMars = parent.planets.find((p) => p.name === "Mars");
      if (pMars) {
        const prof = PLANET_SHADOW.Mars[pMars.sign];
        if (prof) shadows.push({ label: prof.shadow, planet: `Mars in ${SIGN_FULL[pMars.sign]}`, description: prof.pattern });
      }
      const pSaturn = parent.planets.find((p) => p.name === "Saturn");
      if (pSaturn) {
        const prof = PLANET_SHADOW.Saturn[pSaturn.sign];
        if (prof) shadows.push({ label: prof.shadow, planet: `Saturn in ${SIGN_FULL[pSaturn.sign]}`, description: prof.pattern });
      }
      const moonProf = PLANET_SHADOW.Moon[bt.moon];
      if (moonProf) shadows.push({ label: moonProf.shadow, planet: `Moon in ${SIGN_FULL[bt.moon]}`, description: moonProf.pattern });
    }

    // Their gifts
    const sunGift = PLANET_GIFT.Sun[bt.sun];
    if (sunGift) gifts.push({ label: sunGift.gift, planet: `${SIGN_FULL[bt.sun]} Sun`, description: sunGift.description });

    if (parent.planets) {
      const pVenus = parent.planets.find((p) => p.name === "Venus");
      if (pVenus) {
        const vg = PLANET_GIFT.Venus[pVenus.sign];
        if (vg) gifts.push({ label: vg.gift, planet: `Venus in ${SIGN_FULL[pVenus.sign]}`, description: vg.description });
      }
    }

    // Synastry friction & harmony with you
    if (parent.synastry) {
      const hardAspects = parent.synastry.crossAspects.filter(
        a => ["square", "opposition"].includes(a.aspect) && a.orb < 6
      ).sort((a, b) => a.orb - b.orb);

      const softAspects = parent.synastry.crossAspects.filter(
        a => ["conjunction", "trine", "sextile"].includes(a.aspect) && a.orb < 5
      ).sort((a, b) => a.orb - b.orb);

      const usedH = new Set<string>();
      for (const asp of hardAspects.slice(0, 4)) {
        const key = `${asp.p1Name}→${asp.p2Name}`;
        if (usedH.has(key)) continue;
        const tpl = HARD_ASPECT_FAMILY[key];
        if (tpl) {
          usedH.add(key);
          frictionWithYou.push({
            label: `${asp.p1Name} ${asp.aspect} your ${asp.p2Name}`,
            source: `${SIGN_FULL[asp.p1Sign]} → ${SIGN_FULL[asp.p2Sign]} (${asp.orb.toFixed(1)}°)`,
            description: tpl.replace(/\{role\}/g, role.toLowerCase()),
          });
        }
      }

      const usedS = new Set<string>();
      for (const asp of softAspects.slice(0, 3)) {
        const key = `${asp.p1Name}→${asp.p2Name}`;
        if (usedS.has(key)) continue;
        const tpl = SOFT_ASPECT_FAMILY[key];
        if (tpl) {
          usedS.add(key);
          harmonyWithYou.push({
            label: `${asp.p1Name} ${asp.aspect} your ${asp.p2Name}`,
            source: `${SIGN_FULL[asp.p1Sign]} → ${SIGN_FULL[asp.p2Sign]}`,
            description: tpl.replace(/\{role\}/g, role.toLowerCase()),
          });
        }
      }
    }

    parentProfiles.push({
      role, name: parent.name, bigThree: btStr,
      shadows, gifts, frictionWithYou, harmonyWithYou,
    });
  }

  // ═══ Sibling notes ═══
  const siblingNotes: FamilyAnalysis["siblingNotes"] = [];
  for (const sib of siblings) {
    if (!sib.big_three || !sib.synastry) continue;
    const sibLabel = sib.name || sib.relationship;
    const { harmony, tension } = sib.synastry;
    if (harmony > tension) {
      siblingNotes.push({
        trait: `Alliance with ${sibLabel}`,
        source: `${harmony} harmonious · ${tension} challenging`,
        description: `You and ${sibLabel} have more ease than friction. This sibling bond is a resource, especially when navigating the harder family dynamics.`,
      });
    } else if (tension > harmony) {
      siblingNotes.push({
        trait: `Tension with ${sibLabel}`,
        source: `${tension} challenging · ${harmony} harmonious`,
        description: `You and ${sibLabel} push each other's buttons. This sibling dynamic mirrors some of the family patterns — the friction is where the inherited stuff plays out between equals.`,
      });
    }
  }

  return { parentProfiles, siblingNotes };
}

function getElement(sign: string): string {
  if (["Ari", "Leo", "Sag"].includes(sign)) return "fire";
  if (["Tau", "Vir", "Cap"].includes(sign)) return "earth";
  if (["Gem", "Lib", "Aqu"].includes(sign)) return "air";
  return "water";
}

/* ═══════════════════════════════════════════
   Component
   ═══════════════════════════════════════════ */

export default function MapsTab() {
  const { gate, PaywallModal } = usePaywall();
  const { tier } = useTier();
  const { precision: birthTimePrecision, shouldRender: shouldRenderTimeFeature } = useBirthTime();
  // ─── State ───
  const [userChart, setUserChart] = useState<UserChart | null>(null);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Navigation
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [personTab, setPersonTab] = useState<"synastry" | "chart" | "transits" | "solar" | "composite">("synastry");
  const [openPlacement, setOpenPlacement] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addCategory, setAddCategory] = useState<string | null>(null);

  // City
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [cityName, setCityName] = useState<string | null>(null);
  const [cityDate, setCityDate] = useState("");
  const [cityLat, setCityLat] = useState<number | null>(null);
  const [cityLng, setCityLng] = useState<number | null>(null);
  // cityChart and cityLoading removed — astrocartography doesn't need city charts

  // Birth time placeholder
  const [showBirthTimePlaceholder, setShowBirthTimePlaceholder] = useState(false);

  // Astrocartography
  const [showAstroMap, setShowAstroMap] = useState(false);
  const [astroLines, setAstroLines] = useState<AstroLine[] | null>(null);
  const [astroNearby, setAstroNearby] = useState<NearbyLine[] | null>(null);
  const [astroLoading, setAstroLoading] = useState(false);
  const [astroError, setAstroError] = useState(false);
  const [selectedLifeArea, setSelectedLifeArea] = useState<LifeAreaId>("love");
  const [expandedCity, setExpandedCity] = useState<string | null>(null);
  const [countryFilter, setCountryFilter] = useState<string | null>(null);
  const [advancedMode, setAdvancedMode] = useState(false);
  const [astroParans, setAstroParans] = useState<Paran[]>([]);
  const [expandedParan, setExpandedParan] = useState<string | null>(null);

  // Reset to main view when Maps tab is tapped in bottom nav
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail === "/maps") {
        setSelectedId(null);
        setShowAddForm(false);
        setShowAstroMap(false);
        setShowCityPicker(false);
        setShowSelfView(false);
        setFamilyAnalysis(null);
        setShowFamilyPanel(false);
      }
    };
    window.addEventListener("nav:tab-tap", handler);
    return () => window.removeEventListener("nav:tab-tap", handler);
  }, []);

  // Map zoom/pan state + hovered line tooltip
  const [mapZoom, setMapZoom] = useState(1);
  const [mapPan, setMapPan] = useState({ x: 0, y: 0 });
  const [hoveredLine, setHoveredLine] = useState<{ planet: string; angle: string; keyword: string; meaning: string; x: number; y: number } | null>(null);
  const dragRef = useRef<{ dragging: boolean; startX: number; startY: number; panX: number; panY: number }>({ dragging: false, startX: 0, startY: 0, panX: 0, panY: 0 });
  const pinchRef = useRef<number | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const wheelHandlerRef = useRef<((e: WheelEvent) => void) | null>(null);

  // Callback ref: attaches non-passive wheel listener the instant the div mounts
  const mapRefCallback = useCallback((node: HTMLDivElement | null) => {
    // Clean up old listener
    if (mapContainerRef.current && wheelHandlerRef.current) {
      mapContainerRef.current.removeEventListener("wheel", wheelHandlerRef.current);
    }
    mapContainerRef.current = node;
    if (!node) return;
    const SVG_W = 800, SVG_H = 500;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      setMapZoom(z => {
        const nz = Math.max(1, Math.min(6, z * delta));
        const vw = SVG_W / nz, vh = SVG_H / nz;
        setMapPan(p => ({ x: Math.max(0, Math.min(SVG_W - vw, p.x)), y: Math.max(0, Math.min(SVG_H - vh, p.y)) }));
        return nz;
      });
    };
    wheelHandlerRef.current = handler;
    node.addEventListener("wheel", handler, { passive: false });
  }, []);

  // Life Timeline
  const [timelineEntries, setTimelineEntries] = useState<TimelineEntry[]>([]);
  const [showTimelineForm, setShowTimelineForm] = useState(false);
  const [tlCity, setTlCity] = useState("");
  const [tlLat, setTlLat] = useState<number | null>(null);
  const [tlLng, setTlLng] = useState<number | null>(null);
  const [tlStart, setTlStart] = useState("");
  const [tlEnd, setTlEnd] = useState("");
  const [tlPresent, setTlPresent] = useState(false);
  const [expandedTimeline, setExpandedTimeline] = useState<string | null>(null);
  const [editingTimelineId, setEditingTimelineId] = useState<string | null>(null);
  const [editStart, setEditStart] = useState("");
  const [editEnd, setEditEnd] = useState("");
  const [editPresent, setEditPresent] = useState(false);

  // Add/Edit person form
  const [formName, setFormName] = useState("");
  const [formRelationship, setFormRelationship] = useState("");
  const [formBirthDate, setFormBirthDate] = useState("");
  const [formBirthTime, setFormBirthTime] = useState("");
  const [formUnknownTime, setFormUnknownTime] = useState(false);
  const [formCity, setFormCity] = useState("");
  const [formLat, setFormLat] = useState<number | null>(null);
  const [formLng, setFormLng] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [editingConnectionId, setEditingConnectionId] = useState<string | null>(null);
  const [swipedId, setSwipedId] = useState<string | null>(null);

  // Synastry loading
  const [synastryLoading, setSynastryLoading] = useState(false);

  // Family analysis — generated on demand, then persisted per user
  const [familyAnalysis, setFamilyAnalysis] = useState<FamilyAnalysis | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [showFamilyPanel, setShowFamilyPanel] = useState(false);
  const [savedFamily, setSavedFamily] = useState<SavedFamily | null>(null);

  // Load any previously-saved family analysis for this user.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(familyKey(userId));
      setSavedFamily(raw ? (JSON.parse(raw) as SavedFamily) : null);
    } catch { setSavedFamily(null); }
  }, [userId]);

  // Aspect accordion
  const [openAspect, setOpenAspect] = useState<string | null>(null);
  const [showDetailedAspects, setShowDetailedAspects] = useState(false);

  // Transits
  const [transitData, setTransitData] = useState<TransitData | null>(null);
  const [transitLoading, setTransitLoading] = useState(false);
  const [transitPersonId, setTransitPersonId] = useState<string | null>(null); // track which person's transits are loaded
  const [transitDate, setTransitDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [selfTransitDate, setSelfTransitDate] = useState(() => new Date().toISOString().split("T")[0]);

  // Solar return
  const [solarReturnData, setSolarReturnData] = useState<Record<string, any> | null>(null);
  const [solarReturnLoading, setSolarReturnLoading] = useState(false);
  const [solarReturnPersonId, setSolarReturnPersonId] = useState<string | null>(null);
  const [solarReturnYear, setSolarReturnYear] = useState(() => new Date().getFullYear());

  // Composite chart
  const [compositeData, setCompositeData] = useState<Record<string, any> | null>(null);
  const [compositeLoading, setCompositeLoading] = useState(false);
  const [compositePersonId, setCompositePersonId] = useState<string | null>(null);

  // Self view (transit overlap)
  const [showSelfView, setShowSelfView] = useState(false);
  const [selfTab, setSelfTab] = useState<"transits" | "synastry" | "solar">("transits");

  // Maps is an immersive night-sky experience — force dark while this tab is
  // mounted (no light mode here). Restore the saved theme preference on leave.
  useEffect(() => {
    const html = document.documentElement;
    const forceDark = () => { if (html.getAttribute("data-theme") !== "dark") html.setAttribute("data-theme", "dark"); };
    forceDark();
    const obs = new MutationObserver(forceDark);
    obs.observe(html, { attributes: true, attributeFilter: ["data-theme"] });
    return () => {
      obs.disconnect();
      let pref: string | null = null;
      try { pref = localStorage.getItem("mapped:theme"); } catch { /* ignore */ }
      html.setAttribute("data-theme", pref === "dark" || pref === "light" ? pref : "light");
    };
  }, []);
  const [selfTransitData, setSelfTransitData] = useState<TransitData | null>(null);
  const [selfTransitLoading, setSelfTransitLoading] = useState(false);
  const [transitFilterLoY, setTransitFilterLoY] = useState(false);

  // Compute Lord of the Year for transit re-ranking
  const mapsLoY = useMemo(() => {
    if (!userChart?.birthDate || !userChart?.houses?.length) return null;
    return getLordOfTheYear(userChart.birthDate, userChart.planets, userChart.houses);
  }, [userChart]);
  const [overlapPersonId, setOverlapPersonId] = useState<string | null>(null);
  const [overlapTransitData, setOverlapTransitData] = useState<TransitData | null>(null);
  const [overlapTransitLoading, setOverlapTransitLoading] = useState(false);
  const [overlapError, setOverlapError] = useState<string | null>(null);

  // ─── Load data ───
  useEffect(() => {
    async function load() {
      let signedInUserId: string | null = null;
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          signedInUserId = session.user.id;
          setUserId(signedInUserId);
        }
      } catch { /* continue without auth */ }

      let foundChart = false;
      if (signedInUserId) {
        const { data: chartData } = await supabase
          .from("charts")
          .select("*")
          .eq("user_id", signedInUserId)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();
        if (chartData) {
          setUserChart({
            planets: chartData.planets || [],
            specialPoints: chartData.special_points || [],
            houses: chartData.houses || [],
            bigThree: chartData.big_three,
            birthDate: chartData.birth_date,
            birthTime: chartData.birth_time,
            latitude: chartData.latitude,
            longitude: chartData.longitude,
            timezone: chartData.timezone,
            zodiacSystem: chartData.zodiac_system || "tropical",
            ayanamsa: chartData.ayanamsa || "lahiri",
          });
          foundChart = true;
        }
      }

      if (!foundChart) {
        try {
          const stored = sessionStorage.getItem("chartResult");
          if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed.planets && parsed.bigThree) {
              setUserChart({
                planets: parsed.planets || [],
                specialPoints: parsed.specialPoints || [],
                houses: parsed.houses || [],
                bigThree: parsed.bigThree,
                birthDate: parsed.birthDate,
                birthTime: parsed.birthTime,
                latitude: parsed.latitude,
                longitude: parsed.longitude,
                timezone: parsed.timezone,
                zodiacSystem: parsed.zodiacSystem || "tropical",
                ayanamsa: parsed.ayanamsa || "lahiri",
              });
            }
          }
        } catch { /* ignore */ }
      }

      if (signedInUserId) {
        try {
          const { data: conns } = await supabase
            .from("connections").select("*")
            .eq("user_id", signedInUserId)
            .order("created_at", { ascending: true });
          if (conns && conns.length > 0) {
            // Recalculate every connection's chart client-side to ensure
            // correct timezone + Placidus house cusps.
            const recalculated = conns.map((conn: any) => {
              if (!conn.birth_date || !conn.birth_time || conn.latitude == null || conn.longitude == null) return conn;
              try {
                const fresh = calculateChart({
                  name: conn.name || "",
                  birthDate: conn.birth_date,
                  birthTime: conn.birth_time,
                  unknownTime: conn.unknown_time,
                  latitude: conn.latitude,
                  longitude: conn.longitude,
                  cityName: conn.city_name,
                  zodiacSystem: conn.zodiac_system || "tropical",
                  ...(conn.zodiac_system === "sidereal" ? { ayanamsa: conn.ayanamsa || "lahiri" } : {}),
                }) as any;
                return {
                  ...conn,
                  big_three: fresh.bigThree,
                  planets: fresh.planets,
                  houses: fresh.houses,
                  aspects: fresh.aspects,
                  special_points: fresh.specialPoints || null,
                  midheaven: fresh.midheaven || null,
                };
              } catch (err) {
                console.error("[maps recalc] Failed for", conn.name, err);
                return conn;
              }
            });
            setConnections(recalculated);
          } else {
            // Signed-in user has no connections yet — start empty, don't load someone else's localStorage
            setConnections([]);
          }
        } catch {
          // Supabase error for signed-in user — start empty
          setConnections([]);
        }
      } else {
        setConnections(loadLocalConnections());
      }

      setIsLoading(false);
    }
    load();
  }, []);

  // Load saved city + timeline on mount (scoped per user)
  useEffect(() => {
    if (userId) {
      try {
        const saved = localStorage.getItem(`mapped:city:${userId}`);
        if (saved) {
          const data = JSON.parse(saved);
          setCityName(data.name);
          if (data.date) setCityDate(data.date);
          setCityLat(data.lat);
          setCityLng(data.lng);
        }
      } catch { /* ignore */ }
    }
    setTimelineEntries(loadTimeline(userId));
  }, [userId]);

  // Load astrocartography when user opens the view
  useEffect(() => {
    if (!showAstroMap || astroLines || astroLoading) return;

    // Try to get birth data from userChart or fallback to sessionStorage
    let birthDate = userChart?.birthDate;
    let birthTime = userChart?.birthTime || "12:00";
    let birthLat = userChart?.latitude;
    let birthLng = userChart?.longitude;

    if (!birthDate) {
      try {
        const raw = sessionStorage.getItem("chartResult");
        if (raw) {
          const parsed = JSON.parse(raw);
          birthDate = parsed.birthDate;
          birthTime = parsed.birthTime || "12:00";
          birthLat = parsed.latitude;
          birthLng = parsed.longitude;
          // Also update userChart state for future use
          if (birthDate && userChart) {
            setUserChart({ ...userChart, birthDate, birthTime, latitude: birthLat, longitude: birthLng, timezone: parsed.timezone });
          }
        }
      } catch { /* ignore */ }
    }

    if (!birthDate) return; // truly no birth data available

    setAstroLoading(true);
    setAstroError(false);
    const [y, m, d] = String(birthDate).split("-").map(Number);
    const tz = userChart?.timezone;
    const utcHour = birthTimeToUtcHour(String(birthDate), String(birthTime || "12:00"), tz || undefined);
    fetch("/api/astrocartography", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        birthYear: y, birthMonth: m, birthDay: d,
        birthHourUtc: utcHour,
        birthLat: birthLat || 0,
        birthLng: birthLng || 0,
        targetLat: cityLat || birthLat || 30,
        targetLng: cityLng || birthLng || -98,
        radius: 8,
      }),
    })
      .then(res => {
        if (!res.ok) { setAstroError(true); return null; }
        return res.json();
      })
      .then(data => {
        if (data) {
          setAstroLines(data.lines || []);
          setAstroNearby(data.nearbyLines || []);
          setAstroParans(data.parans || []);
        }
      })
      .catch(() => { setAstroError(true); })
      .finally(() => setAstroLoading(false));
  }, [showAstroMap]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Grouped connections ───

  const selected = useMemo(() => {
    const raw = connections.find((c) => c.id === selectedId) || null;
    return raw ? sanitizeConnection(raw) : null;
  }, [connections, selectedId]);

  // Auto-refresh stale synastry: stored synastry JSON predating the current
  // SYNASTRY_VERSION (old copy, nodal duplicates, direction bugs) gets
  // recalculated once when the connection is opened.
  const autoRecalcedIds = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (!selectedId || !userChart) return;
    const raw = connections.find((c) => c.id === selectedId);
    if (!raw || !raw.planets || !raw.synastry) return;
    const storedVersion = (raw.synastry as { version?: number }).version ?? 0;
    if (storedVersion >= SYNASTRY_VERSION) return;
    if (autoRecalcedIds.current.has(raw.id)) return;
    autoRecalcedIds.current.add(raw.id);
    void recalcSynastry(raw);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, userChart, connections]);

  // ─── Add person ───
  const handleAddPerson = useCallback(async () => {
    if (!formName || !formRelationship || !formBirthDate) {
      setFormError("Name, relationship, and birth date are required.");
      return;
    }
    if (!formLat || !formLng) {
      setFormError("Please select a birth city.");
      return;
    }
    // Gate: free tier can only have 1 synastry partner
    if (tier === "free" && connections.length >= 1) {
      if (gate("multiple_synastry")) return;
    }

    setIsSubmitting(true);
    setFormError("");

    try {
      // Use same zodiac system as the user's chart
      const zodSystem = userChart?.zodiacSystem || "tropical";
      const ayan = userChart?.ayanamsa || "lahiri";

      const calcRes = await fetch("/api/chart/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName,
          birthDate: formBirthDate,
          birthTime: formUnknownTime ? "12:00" : formBirthTime || "12:00",
          latitude: formLat,
          longitude: formLng,
          cityName: formCity,
          zodiacSystem: zodSystem,
          ...(zodSystem === "sidereal" ? { ayanamsa: ayan } : {}),
        }),
      });

      if (!calcRes.ok) throw new Error("Chart calculation failed");
      const chartResult = await calcRes.json();

      const rel = RELATIONSHIP_OPTIONS.find((r) => r.value === formRelationship);
      const category = rel?.category || "friend";

      // Calculate synastry with context
      let synastryResult = null;
      if (userChart) {
        const synRes = await fetch("/api/synastry", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chart1: { planets: userChart.planets, specialPoints: userChart.specialPoints, bigThree: userChart.bigThree },
            chart2: { planets: chartResult.planets, specialPoints: chartResult.specialPoints || [], bigThree: chartResult.bigThree },
            context: category,
          }),
        });
        if (synRes.ok) synastryResult = await synRes.json();
      }

      const newConn: Connection = {
        id: crypto.randomUUID(),
        name: formName,
        relationship: formRelationship,
        category,
        birth_date: formBirthDate,
        birth_time: formUnknownTime ? null : formBirthTime || null,
        unknown_time: formUnknownTime || !formBirthTime,
        city_name: formCity,
        latitude: formLat,
        longitude: formLng,
        timezone: null,
        big_three: chartResult.bigThree,
        planets: chartResult.planets,
        houses: chartResult.houses,
        aspects: chartResult.aspects,
        special_points: chartResult.specialPoints || null,
        midheaven: chartResult.midheaven || null,
        synastry: synastryResult,
      };

      if (userId) {
        try {
          // If replacing a partner, delete old one from DB
          if (category === "partner") {
            const oldPartners = connections.filter(c => c.category === "partner");
            for (const old of oldPartners) {
              try { await supabase.from("connections").delete().eq("id", old.id); } catch { /* ignore */ }
            }
          }
          const { data: dbConn } = await supabase
            .from("connections")
            .insert({ ...newConn, user_id: userId })
            .select().single();
          if (dbConn) newConn.id = dbConn.id;
        } catch { /* save locally */ }
      }

      // Replace existing partner(s) if adding a new partner
      const base = category === "partner"
        ? connections.filter(c => c.category !== "partner")
        : connections;
      const updated = [...base, newConn];
      setConnections(updated);
      if (!userId) saveLocalConnections(updated);

      setFormName(""); setFormRelationship(""); setFormBirthDate("");
      setFormBirthTime(""); setFormUnknownTime(false); setFormCity("");
      setFormLat(null); setFormLng(null); setShowAddForm(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  }, [formName, formRelationship, formBirthDate, formBirthTime, formUnknownTime, formCity, formLat, formLng, userChart, userId, connections, tier, gate]);

  // ─── Remove a connection ───
  const handleRemoveConnection = useCallback(async (connId: string) => {
    if (userId) {
      try { await supabase.from("connections").delete().eq("id", connId); } catch { /* ignore */ }
    }
    const updated = connections.filter(c => c.id !== connId);
    setConnections(updated);
    if (!userId) saveLocalConnections(updated);
    setSelectedId(null);
    setOpenAspect(null);
    setPersonTab("synastry");
    setOpenPlacement(null);
    setShowDetailedAspects(false);
  }, [userId, connections]);

  // ─── Edit person ───
  const handleEditPerson = useCallback(async () => {
    if (!editingConnectionId) return;
    if (!formName || !formRelationship || !formBirthDate) {
      setFormError("Name, relationship, and birth date are required.");
      return;
    }
    if (!formLat || !formLng) {
      setFormError("Please select a birth city.");
      return;
    }

    setIsSubmitting(true);
    setFormError("");

    try {
      const oldConn = connections.find(c => c.id === editingConnectionId);
      if (!oldConn) throw new Error("Connection not found");

      // Check if birth info changed (needs recalculation)
      const birthChanged =
        oldConn.birth_date !== formBirthDate ||
        (oldConn.birth_time || "") !== (formUnknownTime ? "" : formBirthTime) ||
        oldConn.latitude !== formLat ||
        oldConn.longitude !== formLng;

      let chartResult = null;
      let synastryResult = oldConn.synastry;

      if (birthChanged) {
        const zodSystem = userChart?.zodiacSystem || "tropical";
        const ayan = userChart?.ayanamsa || "lahiri";

        const calcRes = await fetch("/api/chart/calculate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formName,
            birthDate: formBirthDate,
            birthTime: formUnknownTime ? "12:00" : formBirthTime || "12:00",
            latitude: formLat,
            longitude: formLng,
            cityName: formCity,
            zodiacSystem: zodSystem,
            ...(zodSystem === "sidereal" ? { ayanamsa: ayan } : {}),
          }),
        });
        if (!calcRes.ok) {
          const errBody = await calcRes.json().catch(() => ({}));
          throw new Error(errBody.error || "Chart calculation failed. Check their birth info.");
        }
        chartResult = await calcRes.json();

        // Validate chart result has expected shape
        if (!chartResult?.planets || !chartResult?.bigThree) {
          throw new Error("Chart calculation returned incomplete data. Try again.");
        }

        // Recalculate synastry
        if (userChart) {
          try {
            const rel = RELATIONSHIP_OPTIONS.find(r => r.value === formRelationship);
            const cat = rel?.category || oldConn.category;
            const synRes = await fetch("/api/synastry", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                chart1: { planets: userChart.planets, specialPoints: userChart.specialPoints, bigThree: userChart.bigThree },
                chart2: { planets: chartResult.planets, specialPoints: chartResult.specialPoints || [], bigThree: chartResult.bigThree },
                context: cat,
              }),
            });
            if (synRes.ok) synastryResult = await synRes.json();
          } catch {
            // Synastry failure shouldn't block the edit — just keep old synastry
            console.warn("[editPerson] Synastry recalc failed, keeping old data");
          }
        }
      }

      const rel = RELATIONSHIP_OPTIONS.find(r => r.value === formRelationship);
      const category = rel?.category || oldConn.category;

      const updatedConn: Connection = {
        ...oldConn,
        name: formName,
        relationship: formRelationship,
        category,
        birth_date: formBirthDate,
        birth_time: formUnknownTime ? null : formBirthTime || null,
        unknown_time: formUnknownTime || !formBirthTime,
        city_name: formCity,
        latitude: formLat,
        longitude: formLng,
        ...(chartResult ? {
          big_three: chartResult.bigThree,
          planets: chartResult.planets,
          houses: chartResult.houses,
          aspects: chartResult.aspects,
          special_points: chartResult.specialPoints || null,
          midheaven: chartResult.midheaven || null,
        } : {}),
        synastry: synastryResult,
      };

      if (userId) {
        try {
          // Only send fields that exist as columns in the connections table
          const dbPayload: Record<string, unknown> = {
            name: updatedConn.name,
            relationship: updatedConn.relationship,
            category: updatedConn.category,
            birth_date: updatedConn.birth_date,
            birth_time: updatedConn.birth_time,
            unknown_time: updatedConn.unknown_time,
            city_name: updatedConn.city_name,
            latitude: updatedConn.latitude,
            longitude: updatedConn.longitude,
            timezone: updatedConn.timezone,
            big_three: updatedConn.big_three,
            planets: updatedConn.planets,
            houses: updatedConn.houses,
            aspects: updatedConn.aspects,
            special_points: updatedConn.special_points,
            midheaven: updatedConn.midheaven,
            synastry: updatedConn.synastry,
          };
          const { error: dbErr } = await supabase.from("connections").update(dbPayload).eq("id", updatedConn.id);
          if (dbErr) console.warn("[editPerson] Supabase update failed:", dbErr.message);
        } catch (dbCatchErr) {
          console.warn("[editPerson] DB save failed, using local:", dbCatchErr);
        }
      }

      const updated = connections.map(c => c.id === editingConnectionId ? updatedConn : c);
      setConnections(updated);
      if (!userId) saveLocalConnections(updated);

      setFormName(""); setFormRelationship(""); setFormBirthDate("");
      setFormBirthTime(""); setFormUnknownTime(false); setFormCity("");
      setFormLat(null); setFormLng(null); setShowAddForm(false);
      setEditingConnectionId(null);
      // After editing (especially birthday), go back to map view so
      // the detail view re-mounts cleanly when the user taps again.
      if (birthChanged) {
        setSelectedId(null);
        setPersonTab("synastry");
        setShowDetailedAspects(false);
      }
    } catch (err) {
      console.error("[editPerson] Error:", err);
      setFormError(err instanceof Error ? err.message : "Something went wrong. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [editingConnectionId, formName, formRelationship, formBirthDate, formBirthTime, formUnknownTime, formCity, formLat, formLng, userChart, userId, connections]);

  // ─── Recalc synastry ───
  async function recalcSynastry(conn: Connection) {
    if (!userChart || !conn.planets) return;
    setSynastryLoading(true);
    try {
      // The Vertex (a fated point) needs an accurate birth time + location.
      // Compute it fresh for both charts so it can drive fated marks.
      const userVertex = chartVertex(
        (userChart as any).birthDate, (userChart as any).birthTime,
        (userChart as any).latitude, (userChart as any).longitude,
        false, (userChart as any).zodiacSystem, (userChart as any).ayanamsa,
      );
      const connVertex = chartVertex(
        conn.birth_date, conn.birth_time,
        (conn as any).latitude, (conn as any).longitude,
        (conn as any).unknown_time, (conn as any).zodiac_system, (conn as any).ayanamsa,
      );
      const res = await fetch("/api/synastry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chart1: { planets: userChart.planets, specialPoints: userChart.specialPoints, bigThree: userChart.bigThree, vertex: userVertex },
          chart2: { planets: conn.planets, specialPoints: conn.special_points || [], bigThree: conn.big_three, vertex: connVertex },
          context: conn.category,
        }),
      });
      if (res.ok) {
        const synData = await res.json();
        if (userId) {
          try { await supabase.from("connections").update({ synastry: synData }).eq("id", conn.id); } catch { /* ignore */ }
        }
        const updated = connections.map((c) => c.id === conn.id ? { ...c, synastry: synData } : c);
        setConnections(updated);
        if (!userId) saveLocalConnections(updated);
      }
    } catch { /* silently fail */ }
    finally { setSynastryLoading(false); }
  }

  // ─── Resolve the user's current location (cache-first) for coordinate fallbacks ───
  async function resolveUserLoc() {
    if (!userId) return null;
    return getCachedLocation(userId) ?? (await fetchUserLocation(userId));
  }

  // ─── Fetch transits for a person ───
  async function fetchTransits(conn: Connection, date?: string) {
    if (!conn.planets) return;
    setTransitLoading(true);
    const useDate = date || transitDate;
    try {
      const loc = await resolveUserLoc();
      const res = await fetch("/api/transits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          natalPlanets: conn.planets,
          natalHouses: conn.houses || [],
          transitDate: useDate,
          latitude: conn.latitude ?? loc?.lat,
          longitude: conn.longitude ?? loc?.lng,
          zodiacSystem: userChart?.zodiacSystem || "tropical",
          ...(userChart?.zodiacSystem === "sidereal" ? { ayanamsa: userChart?.ayanamsa || "lahiri" } : {}),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setTransitData(data);
        setTransitPersonId(conn.id);
      }
    } catch { /* silently fail */ }
    finally { setTransitLoading(false); }
  }

  // ─── Fetch solar return chart ───
  async function fetchSolarReturn(conn: Connection, year?: number) {
    if (!conn.planets) return;
    const targetYear = year || solarReturnYear;
    setSolarReturnLoading(true);
    try {
      // Find the natal Sun's absolute position
      const sunPlanet = conn.planets.find((p: any) => p.name === "Sun");
      if (!sunPlanet) { setSolarReturnLoading(false); return; }

      const loc = await resolveUserLoc();
      const res = await fetch("/api/chart/solar-return", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          natalSunAbsPos: sunPlanet.absPosition,
          birthDate: conn.birth_date,
          birthTime: conn.birth_time || "12:00",
          // last resort — user has no location set
          latitude: conn.latitude ?? loc?.lat ?? DEFAULT_COORDS.lat,
          longitude: conn.longitude ?? loc?.lng ?? DEFAULT_COORDS.lng,
          year: targetYear,
          name: conn.name,
          cityName: conn.city_name || "",
          zodiacSystem: userChart?.zodiacSystem || "tropical",
          ...(userChart?.zodiacSystem === "sidereal" ? { ayanamsa: userChart?.ayanamsa || "lahiri" } : {}),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setSolarReturnData(data);
        setSolarReturnPersonId(conn.id);
        setSolarReturnYear(targetYear);
      }
    } catch (err) {
      console.error("Solar return fetch error:", err);
    } finally {
      setSolarReturnLoading(false);
    }
  }

  // ─── Fetch composite chart ───
  async function fetchComposite(conn: Connection) {
    if (!conn.planets || !userChart?.planets) return;
    setCompositeLoading(true);
    try {
      const res = await fetch("/api/composite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chart1: {
            planets: userChart.planets,
            houses: userChart.houses || [],
            specialPoints: userChart.specialPoints || [],
          },
          chart2: {
            planets: conn.planets,
            houses: conn.houses || [],
            specialPoints: conn.special_points || [],
          },
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setCompositeData(data);
        setCompositePersonId(conn.id);
      }
    } catch (err) {
      console.error("Composite fetch error:", err);
    } finally {
      setCompositeLoading(false);
    }
  }

  // ─── Fetch both transit sets for the overlap view (parallel) ───
  async function fetchBothTransits(conn: Connection) {
    const errors: string[] = [];
    setOverlapError(null);

    // Set BOTH loading states upfront before any awaits to prevent race conditions
    setSelfTransitLoading(true);
    setOverlapTransitLoading(true);

    const today = new Date().toISOString().split("T")[0];
    const loc = await resolveUserLoc();

    // Build both requests
    // Get YOUR planet data: try userChart → sessionStorage → Supabase direct query
    let selfPlanets: unknown[] | null = userChart?.planets && userChart.planets.length > 0 ? userChart.planets : null;
    let selfHouses: unknown[] = userChart?.houses || [];
    let selfLat: number | undefined = userChart?.latitude ?? loc?.lat;
    let selfLng: number | undefined = userChart?.longitude ?? loc?.lng;

    if (!selfPlanets) {
      try {
        const stored = sessionStorage.getItem("chartResult");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.planets?.length > 0) {
            selfPlanets = parsed.planets;
            selfHouses = parsed.houses || [];
            selfLat = parsed.latitude || selfLat;
            selfLng = parsed.longitude || selfLng;
          }
        }
      } catch { /* ignore */ }
    }

    // Last resort: query Supabase directly — get auth session fresh (don't rely on userId state)
    if (!selfPlanets) {
      try {
        const { data: { session: authSession } } = await supabase.auth.getSession();
        const uid = authSession?.user?.id || userId;
        if (uid) {
          const { data: freshChart } = await supabase
            .from("charts")
            .select("planets, houses, latitude, longitude")
            .eq("user_id", uid)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();
          if (freshChart && freshChart.planets?.length > 0) {
            selfPlanets = freshChart.planets as unknown[];
            selfHouses = (freshChart.houses || []) as unknown[];
            selfLat = freshChart.latitude ?? selfLat;
            selfLng = freshChart.longitude ?? selfLng;
            setUserChart((prev) => prev ? { ...prev, planets: freshChart.planets, houses: freshChart.houses || [] } : {
              planets: freshChart.planets as Planet[],
              specialPoints: [],
              houses: (freshChart.houses || []) as UserChart["houses"],
              bigThree: { sun: "", moon: "", rising: "" },
              latitude: freshChart.latitude,
              longitude: freshChart.longitude,
            });
            if (!userId) setUserId(uid);
          }
        }
      } catch { /* ignore */ }
    }

    const selfPromise = selfPlanets
      ? fetch("/api/transits", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            natalPlanets: selfPlanets,
            natalHouses: selfHouses,
            transitDate: today,
            latitude: selfLat,
            longitude: selfLng,
            zodiacSystem: userChart?.zodiacSystem || "tropical",
            ...(userChart?.zodiacSystem === "sidereal" ? { ayanamsa: userChart?.ayanamsa || "lahiri" } : {}),
          }),
        })
          .then(async (res) => {
            if (res.ok) { setSelfTransitData(await res.json()); }
            else { errors.push(`Your transits failed (${res.status})`); console.error("Self transit:", res.status, await res.text()); }
          })
          .catch((err) => { errors.push(`Your transits: ${err}`); console.error("Self transit error:", err); })
      : Promise.resolve(errors.push("Your chart has no planet data — try recalculating your chart on the You tab"));

    const overlapPromise = conn.planets
      ? fetch("/api/transits", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            natalPlanets: conn.planets,
            natalHouses: conn.houses || [],
            transitDate: today,
            latitude: conn.latitude ?? loc?.lat,
            longitude: conn.longitude ?? loc?.lng,
            zodiacSystem: userChart?.zodiacSystem || "tropical",
            ...(userChart?.zodiacSystem === "sidereal" ? { ayanamsa: userChart?.ayanamsa || "lahiri" } : {}),
          }),
        })
          .then(async (res) => {
            if (res.ok) { setOverlapTransitData(await res.json()); }
            else { errors.push(`${conn.name} transits failed (${res.status})`); console.error("Overlap transit:", res.status, await res.text()); }
          })
          .catch((err) => { errors.push(`${conn.name} transits: ${err}`); console.error("Overlap transit error:", err); })
      : Promise.resolve(errors.push(`${conn.name} has no planet data`));

    // Wait for BOTH to complete before clearing loading
    await Promise.all([selfPromise, overlapPromise]);

    setSelfTransitLoading(false);
    setOverlapTransitLoading(false);
    if (errors.length > 0) setOverlapError(errors.join(" · "));
  }

  // Standalone fetcher for the "You" circle tap (no overlap needed)
  async function fetchSelfTransits(date?: string) {
    if (!userChart?.planets) return;
    setSelfTransitLoading(true);
    const useDate = date || selfTransitDate;
    try {
      const loc = await resolveUserLoc();
      const res = await fetch("/api/transits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          natalPlanets: userChart.planets,
          natalHouses: userChart.houses || [],
          transitDate: useDate,
          latitude: userChart.latitude ?? loc?.lat,
          longitude: userChart.longitude ?? loc?.lng,
          zodiacSystem: userChart.zodiacSystem || "tropical",
          ...(userChart.zodiacSystem === "sidereal" ? { ayanamsa: userChart.ayanamsa || "lahiri" } : {}),
        }),
      });
      if (res.ok) setSelfTransitData(await res.json());
    } catch (err) { console.error("Self transit error:", err); }
    finally { setSelfTransitLoading(false); }
  }

  // ─── Fetch self solar return ───
  const [selfSolarReturn, setSelfSolarReturn] = useState<Record<string, any> | null>(null);
  const [selfSolarLoading, setSelfSolarLoading] = useState(false);
  const [selfSolarYear, setSelfSolarYear] = useState(() => new Date().getFullYear());

  async function fetchSelfSolarReturn(year?: number) {
    if (!userChart?.planets) return;
    const targetYear = year || selfSolarYear;
    setSelfSolarLoading(true);
    try {
      const sunPlanet = userChart.planets.find((p: any) => p.name === "Sun");
      if (!sunPlanet) { setSelfSolarLoading(false); return; }

      const loc = await resolveUserLoc();
      const res = await fetch("/api/chart/solar-return", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          natalSunAbsPos: sunPlanet.absPosition,
          birthDate: userChart.birthDate,
          birthTime: userChart.birthTime || "12:00",
          // last resort — user has no location set
          latitude: userChart.latitude ?? loc?.lat ?? DEFAULT_COORDS.lat,
          longitude: userChart.longitude ?? loc?.lng ?? DEFAULT_COORDS.lng,
          year: targetYear,
          name: "You",
          zodiacSystem: userChart.zodiacSystem || "tropical",
          ...(userChart.zodiacSystem === "sidereal" ? { ayanamsa: userChart.ayanamsa || "lahiri" } : {}),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setSelfSolarReturn(data);
        setSelfSolarYear(targetYear);
      }
    } catch (err) {
      console.error("Self solar return error:", err);
    } finally {
      setSelfSolarLoading(false);
    }
  }

  // ─── Generate family analysis ───
  function handleFamilyAnalysis() {
    if (!userChart) return;
    setAnalysisLoading(true);
    setTimeout(() => {
      const analysis = generateFamilyAnalysis(userChart, connections);
      const saved: SavedFamily = { sig: familySignature(connections), analysis };
      setSavedFamily(saved);
      try { localStorage.setItem(familyKey(userId), JSON.stringify(saved)); } catch { /* ignore */ }
      setFamilyAnalysis(analysis);
      setAnalysisLoading(false);
      setShowFamilyPanel(false);
    }, 500);
  }

  // ─── Helpers ───
  const inputClass = `w-full px-4 py-3 rounded-xl bg-surface border border-foreground/18
    text-foreground placeholder:text-muted text-sm
    focus:outline-none focus:border-terracotta/50 focus:ring-1 focus:ring-terracotta/25`;

  function openAddForm(category: string) {
    setEditingConnectionId(null);
    setAddCategory(category);
    setShowAddForm(true);
    setFormRelationship("");
    setFormName("");
    setFormBirthDate("");
    setFormBirthTime("");
    setFormUnknownTime(false);
    setFormCity("");
    setFormLat(null);
    setFormLng(null);
    setFormError("");
  }

  function openEditForm(conn: Connection) {
    setEditingConnectionId(conn.id);
    setAddCategory(conn.category);
    setFormName(conn.name);
    setFormRelationship(conn.relationship);
    setFormBirthDate(conn.birth_date);
    setFormBirthTime(conn.birth_time || "");
    setFormUnknownTime(conn.unknown_time);
    setFormCity(conn.city_name || "");
    setFormLat(conn.latitude);
    setFormLng(conn.longitude);
    setFormError("");
    setShowAddForm(true);
  }

  const filteredRelationships = addCategory
    ? addCategory === "circle"
      ? RELATIONSHIP_OPTIONS.filter((r) => CIRCLE_RELATIONSHIPS.includes(r.value))
      : addCategory === "origin"
        ? RELATIONSHIP_OPTIONS.filter((r) => ORIGIN_RELATIONSHIPS.includes(r.value))
        : RELATIONSHIP_OPTIONS.filter((r) => r.category === addCategory)
    : RELATIONSHIP_OPTIONS;

  /* ═══════════════════════════════════════════
     Render
     ═══════════════════════════════════════════ */

  if (isLoading) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-terracotta/30 border-t-terracotta rounded-full animate-spin" role="status" aria-label="Loading" />
      </main>
    );
  }

  // ─── Self view: My Transits + Relationship weather ───
  if (showSelfView) {
    const overlapPerson = overlapPersonId ? connections.find(c => c.id === overlapPersonId) : null;
    const personName = String(overlapPerson?.name || "").split(" ")[0] || "";
    const isPartnerOverlap = overlapPerson?.category === "partner";
    const isFamilyOverlap = overlapPerson?.category === "family";

    // ── Build prescriptive relationship story from both transit sets ──
    //
    // Strategy: instead of creating one card per planet (which produces 5-7
    // redundant cards), we consolidate by *tone*. If Pluto AND Saturn are both
    // challenging, that's one "Heavy weather" card listing both. If Jupiter
    // trines both charts while Saturn squares them, we get exactly two cards:
    // one tension, one support. Maximum 3 cards total.
    //
    type StoryCard = { icon: string; headline: string; body: string; advice: string; tone: "warm" | "tension" | "growth" | "neutral" };
    const storyCards: StoryCard[] = [];

    if (selfTransitData && overlapTransitData && overlapPerson) {
      const yours = selfTransitData.transitAspects || [];
      const theirs = overlapTransitData.transitAspects || [];

      const ASPECT_FEEL: Record<string, { verb: string }> = {
        conjunction: { verb: "amplifying" },
        square: { verb: "challenging" },
        opposition: { verb: "polarizing" },
        trine: { verb: "supporting" },
        sextile: { verb: "gently activating" },
      };

      // Track which planets are hitting both charts (outer only)
      const OUTER = ["Pluto", "Neptune", "Uranus", "Saturn", "Jupiter"];
      const PLANET_RANK: Record<string, number> = { Pluto: 5, Neptune: 4, Uranus: 3, Saturn: 2, Jupiter: 1 };
      const yourMajor = yours.filter(a => OUTER.includes(a.transitPlanet));
      const theirMajor = theirs.filter(a => OUTER.includes(a.transitPlanet));
      const transitPlanets = [...new Set([...yourMajor.map(a => a.transitPlanet), ...theirMajor.map(a => a.transitPlanet)])]
        .sort((a, b) => (PLANET_RANK[b] || 0) - (PLANET_RANK[a] || 0));

      // Classify each planet's relationship impact
      type PlanetHit = {
        planet: string;
        category: "both-challenging" | "both-flowing" | "mixed" | "yours-only" | "theirs-only";
        yourAspect?: string; theirAspect?: string;
        yourNatal?: string; theirNatal?: string;
        yourOrb?: number; theirOrb?: number;
        youHarder?: boolean;
      };
      const hits: PlanetHit[] = [];

      for (const tp of transitPlanets) {
        const yHits = yourMajor.filter(a => a.transitPlanet === tp);
        const tHits = theirMajor.filter(a => a.transitPlanet === tp);
        const yh = yHits[0]; const th = tHits[0];

        if (yh && th) {
          const yChal = ["square", "opposition"].includes(yh.aspect);
          const tChal = ["square", "opposition"].includes(th.aspect);
          if (yChal && tChal) hits.push({ planet: tp, category: "both-challenging", yourAspect: yh.aspect, theirAspect: th.aspect, yourNatal: yh.natalPlanet, theirNatal: th.natalPlanet, yourOrb: yh.orb, theirOrb: th.orb });
          else if (!yChal && !tChal) hits.push({ planet: tp, category: "both-flowing", yourAspect: yh.aspect, theirAspect: th.aspect, yourNatal: yh.natalPlanet, theirNatal: th.natalPlanet });
          else hits.push({ planet: tp, category: "mixed", yourAspect: yh.aspect, theirAspect: th.aspect, yourNatal: yh.natalPlanet, theirNatal: th.natalPlanet, youHarder: yChal });
        } else if (yh) {
          hits.push({ planet: tp, category: "yours-only", yourAspect: yh.aspect, yourNatal: yh.natalPlanet, yourOrb: yh.orb });
        } else if (th) {
          hits.push({ planet: tp, category: "theirs-only", theirAspect: th.aspect, theirNatal: th.natalPlanet, theirOrb: th.orb });
        }
      }

      // ── Consolidated advice by lead planet + relationship type ──
      const relType = isPartnerOverlap ? "partner" : isFamilyOverlap ? "family" : "friend";
      const CHALLENGE_ADVICE: Record<string, Record<string, string>> = {
        Pluto: {
          partner: `Power dynamics are surfacing. Name the feeling without blame — "I'm feeling a need for control and I know it's not about you."`,
          family: `Old family power dynamics are being excavated. Don't try to fix generational patterns in one conversation — just notice.`,
          friend: `Intensity is high. Give the friendship room. Not every bond needs to go deep all the time.`,
        },
        Neptune: {
          partner: `Confusion is in the air. You might be seeing what you want to see. Hold off on big relationship decisions until the fog lifts.`,
          family: `Boundaries are blurry. Stay grounded in what's yours versus what's theirs.`,
          friend: `Miscommunication is likely. Over-communicate and don't assume.`,
        },
        Uranus: {
          partner: `Both of you are restless. Channel it into trying something new together rather than picking fights out of boredom.`,
          family: `Expect the unexpected. Someone might say something that changes the dynamic. Stay flexible.`,
          friend: `You both need more independence than usual. Don't take distance personally.`,
        },
        Saturn: {
          partner: `Saturn tests foundations. If things feel heavy, the relationship is being asked to mature. Do the hard conversation.`,
          family: `Who carries the load? This transit asks you to redistribute responsibility more honestly.`,
          friend: `Be realistic about what you can give each other right now instead of overcommitting.`,
        },
        Jupiter: {
          partner: `You might be overextending — saying yes to too much. Jupiter expands everything, including problems. Stay generous but realistic.`,
          family: `Expectations are inflated on both sides. Be honest about capacity.`,
          friend: `Growing pains — one or both of you is outgrowing old patterns. Let it breathe.`,
        },
      };
      const FLOW_ADVICE: Record<string, Record<string, string>> = {
        Pluto: {
          partner: `The walls are down for both of you. Have the conversation that scares you — it will bring you closer.`,
          family: `If there's a family wound that needs addressing, this is the window where it can actually shift.`,
          friend: `Share something real. This transit rewards vulnerability with trust.`,
        },
        Neptune: {
          partner: `Romance and spiritual connection are heightened. Create beauty together — the everyday becomes magical.`,
          family: `Compassion flows naturally. Forgiveness and letting go of old grudges come easier.`,
          friend: `Creative collaboration is favored. If you've been meaning to start a project together, now's the time.`,
        },
        Uranus: {
          partner: `Try something you've never done together. This transit rewards breaking routine.`,
          family: `Be open to seeing family members as who they are now, not who they were.`,
          friend: `Say yes to the weird idea. The friendship needs some adventure right now.`,
        },
        Saturn: {
          partner: `You're both ready to build something real. This is the transit for commitments that last.`,
          family: `Practical support — showing up consistently — means more than words right now.`,
          friend: `Show up when you say you will. Small consistent gestures build lasting trust.`,
        },
        Jupiter: {
          partner: `Plan something big together — a trip, a goal. Jupiter rewards bold moves made in partnership.`,
          family: `Celebrate together. Jupiter amplifies joy when it's shared.`,
          friend: `Expand your world together. Take a class, explore a new place.`,
        },
      };

      // ── Group hits by tone and build consolidated cards ──

      const challengingBoth = hits.filter(h => h.category === "both-challenging");
      const flowingBoth = hits.filter(h => h.category === "both-flowing");
      const mixedBoth = hits.filter(h => h.category === "mixed");
      const yoursOnly = hits.filter(h => h.category === "yours-only");
      const theirsOnly = hits.filter(h => h.category === "theirs-only");

      // Card 1: Shared tension (consolidated)
      if (challengingBoth.length > 0) {
        const lead = challengingBoth[0]; // strongest planet
        const planets = challengingBoth.map(h => h.planet);
        const planetList = planets.length === 1 ? planets[0] : planets.slice(0, -1).join(", ") + " and " + planets.at(-1);
        const isPlural = planets.length > 1;
        const leadAdvice = CHALLENGE_ADVICE[lead.planet]?.[relType] || "Be patient with each other. This is temporary.";

        storyCards.push({
          icon: "🔥",
          headline: isPlural ? `${planetList} are both pressing on this relationship` : `${lead.planet} is testing you both`,
          body: isPlural
            ? `${planetList} are all making hard aspects to both of your charts right now. That's a lot of pressure landing on the same dynamic at the same time. Neither of you is operating from your most relaxed place — and the friction you feel isn't really about each other, it's the sky turning up the volume on everything.`
            : `${lead.planet} is ${ASPECT_FEEL[lead.yourAspect || ""]?.verb || "challenging"} your ${lead.yourNatal} (${lead.yourAspect}) while simultaneously ${ASPECT_FEEL[lead.theirAspect || ""]?.verb || "challenging"} ${personName}'s ${lead.theirNatal} (${lead.theirAspect}). Neither of you is in a relaxed place right now, and the friction between you isn't really about each other.`,
          advice: leadAdvice,
          tone: "tension",
        });
      }

      // Card 2: Shared flow (consolidated)
      if (flowingBoth.length > 0) {
        const lead = flowingBoth[0];
        const planets = flowingBoth.map(h => h.planet);
        const planetList = planets.length === 1 ? planets[0] : planets.slice(0, -1).join(", ") + " and " + planets.at(-1);
        const isPlural = planets.length > 1;
        const leadAdvice = FLOW_ADVICE[lead.planet]?.[relType] || "Lean in. This is a good time to deepen this connection.";

        storyCards.push({
          icon: "✨",
          headline: isPlural ? `${planetList} are all working in your favor` : `${lead.planet} is opening doors for you both`,
          body: isPlural
            ? `${planetList} are all making supportive aspects to both of your charts. You're both in a receptive, expansive state. This is a window where the relationship can deepen without much effort — the cosmic weather is on your side.`
            : `${lead.planet} is ${ASPECT_FEEL[lead.yourAspect || ""]?.verb || "supporting"} your ${lead.yourNatal} while also ${ASPECT_FEEL[lead.theirAspect || ""]?.verb || "supporting"} ${personName}'s ${lead.theirNatal}. You're both open in the same ways right now.`,
          advice: leadAdvice,
          tone: "warm",
        });
      }

      // Card 3: Imbalance (only if there's no shared tension/flow to cover the main dynamic)
      if (mixedBoth.length > 0 && storyCards.length < 2) {
        const lead = mixedBoth[0];
        const youHarder = lead.youHarder;
        const whoStruggles = youHarder ? "you" : personName;
        const whoFlows = youHarder ? personName : "you";

        const MIXED_ADVICE: Record<string, Record<string, { youHarder: string; themHarder: string }>> = {
          Pluto: {
            partner: { youHarder: `Let ${personName} know you're going through something. They can hold space — but only if they know you need it.`, themHarder: `Check in on ${personName}. They might be having a harder time than they're showing. Your steadiness is their anchor.` },
            family: { youHarder: `Lean on ${personName}'s stability without expecting them to fully understand what you're processing.`, themHarder: `${personName} might be going through a quiet upheaval. Make it clear you're a safe place to land.` },
            friend: { youHarder: `It's okay to be honest about needing space right now.`, themHarder: `Show up without expectations. ${personName} might pull away — don't take it personally.` },
          },
          Saturn: {
            partner: { youHarder: `Tell ${personName} what you're carrying — they can help shoulder it.`, themHarder: `${personName} is carrying a heavy weight. Don't try to lighten it with optimism — just be there.` },
            family: { youHarder: `Be direct about what you need from them.`, themHarder: `Practical help — not pep talks — is what ${personName} needs.` },
            friend: { youHarder: `Let their ease remind you that not everything has to be hard.`, themHarder: `Invite them out, but don't push if they decline.` },
          },
        };
        const adviceMap = MIXED_ADVICE[lead.planet]?.[relType];
        const advice = youHarder ? (adviceMap?.youHarder || `Let ${personName} know what you need.`) : (adviceMap?.themHarder || `Ask ${personName} how they're really doing.`);

        storyCards.push({
          icon: "⚖️",
          headline: `${lead.planet} is landing differently on each of you`,
          body: `${lead.planet} is making a ${lead.yourAspect} to your ${lead.yourNatal} and a ${lead.theirAspect} to ${personName}'s ${lead.theirNatal}. ${whoFlows} ${youHarder ? "is" : "are"} feeling supported while ${whoStruggles} ${youHarder ? "are" : "is"} under pressure. The person having the easier time might not realize the other is struggling.`,
          advice,
          tone: "growth",
        });
      }

      // Card: One-sided activation (only show the STRONGEST one, and only if we have room)
      if (storyCards.length < 3 && (yoursOnly.length > 0 || theirsOnly.length > 0)) {
        // Pick the single strongest one-sided hit
        const allOneSided = [...yoursOnly, ...theirsOnly];
        const best = allOneSided[0]; // already sorted by planet rank
        if (best) {
          const isYours = best.category === "yours-only";
          const isChallenging = ["square", "opposition"].includes((isYours ? best.yourAspect : best.theirAspect) || "");
          const natal = isYours ? best.yourNatal : best.theirNatal;
          const aspect = isYours ? best.yourAspect : best.theirAspect;
          const feel = ASPECT_FEEL[aspect || ""]?.verb || "activating";
          const who = isYours ? "your" : `${personName}'s`;
          const other = isYours ? personName : "you";

          storyCards.push({
            icon: isChallenging ? "🌊" : "🌱",
            headline: `${best.planet} is activating ${who} chart — not ${isYours ? personName + "'s" : "yours"}`,
            body: `Transit ${best.planet} is ${feel} ${who} ${natal} (${aspect}), but it's not making significant contact with ${isYours ? personName + "'s" : "your"} chart. ${isChallenging ? `The tension ${isYours ? "you feel" : personName + " feels"} is mostly internal — ${isYours ? personName + " isn't" : "you're not"} causing it.` : `${isYours ? "You have" : personName + " has"} access to growth that's ${isYours ? "yours" : "theirs"} alone right now.`}`,
            advice: isChallenging
              ? `${isYours ? `Don't project this onto ${personName}. The source is the sky, not them.` : `Don't take ${personName}'s mood personally. This is their process. Be steady.`}`
              : `${isYours ? `Share your enthusiasm — ${personName} can be part of it.` : `Encourage what's emerging. Your interest in their growth strengthens the bond.`}`,
            tone: isChallenging ? "tension" : "growth",
          });
        }
      }

      // Venus/Mars card — only if no outer-planet cards already covered the same tone
      const hasTensionCard = storyCards.some(c => c.tone === "tension");
      const hasWarmCard = storyCards.some(c => c.tone === "warm");

      const yourVenus = yours.filter(a => a.transitPlanet === "Venus" && ["Sun", "Moon", "Venus", "Mars"].includes(a.natalPlanet));
      const theirVenus = theirs.filter(a => a.transitPlanet === "Venus" && ["Sun", "Moon", "Venus", "Mars"].includes(a.natalPlanet));
      const yourMars = yours.filter(a => a.transitPlanet === "Mars" && ["Sun", "Moon", "Venus", "Mars"].includes(a.natalPlanet));
      const theirMars = theirs.filter(a => a.transitPlanet === "Mars" && ["Sun", "Moon", "Venus", "Mars"].includes(a.natalPlanet));

      if (storyCards.length < 3 && yourVenus.length > 0 && theirVenus.length > 0 && !hasWarmCard) {
        storyCards.push({
          icon: "💛",
          headline: "Venus is softening things between you",
          body: `Transit Venus is touching personal planets in both charts. You're both more attuned to beauty, affection, and what feels good. ${hasTensionCard ? "This is a counterweight to the heavier transits — lean into it." : "The relationship gets a temporary upgrade in sweetness."}`,
          advice: isPartnerOverlap
            ? `This is date night energy. Be present with each other — this window is brief.`
            : `Express appreciation. A genuine gesture will land especially well right now.`,
          tone: "warm",
        });
      } else if (storyCards.length < 3 && yourMars.length > 0 && theirMars.length > 0 && !hasTensionCard) {
        storyCards.push({
          icon: "⚡",
          headline: "Mars is turning up the heat",
          body: `Transit Mars is hitting personal planets for both of you. Energy is high, patience is low. ${isPartnerOverlap ? "This can show up as passion or arguments — often both in the same day." : "You might snap at each other over small things, or conversely, get a lot done together."}`,
          advice: `Channel this into action, not arguments. Exercise together, tackle a project, or have the honest conversation you've been avoiding.`,
          tone: "tension",
        });
      }

      // Fallback: quiet skies
      if (storyCards.length === 0) {
        storyCards.push({
          icon: "☁️",
          headline: "Quiet skies between you",
          body: `The major transits right now aren't making strong connections to both of your charts simultaneously. This is a period of relative calm for the relationship itself, even if one or both of you has personal transits going on.`,
          advice: `Use this calm to maintain, not coast. Check in, show up, do the small things. Not every period needs to be intense to be meaningful.`,
          tone: "neutral",
        });
      }
    }

    return (
      <main className="flex-1 flex flex-col px-5 py-6 max-w-lg mx-auto w-full overflow-y-auto">
        <button
          onClick={() => { setShowSelfView(false); setOverlapPersonId(null); setOverlapTransitData(null); }}
          className="flex items-center gap-2 text-muted text-sm mb-4 active:text-secondary"
        >
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to your map
        </button>

        <div className="text-center mb-4">
          <h1 className="text-2xl text-foreground mb-1" style={{ fontFamily: "var(--font-display)" }}>
            You
          </h1>
          {userChart?.bigThree && (
            <p className="text-muted text-sm">
              {SIGN_FULL[userChart.bigThree.sun] || userChart.bigThree.sun} Sun · {SIGN_FULL[userChart.bigThree.moon] || userChart.bigThree.moon} Moon
              {userChart.bigThree.rising && ` · ${SIGN_FULL[userChart.bigThree.rising] || userChart.bigThree.rising} Rising`}
            </p>
          )}
        </div>

        {/* ═══ Tab Bar ═══ */}
        <div className="flex rounded-xl bg-card/45 border border-foreground/15 p-1 mb-6">
          <button
            onClick={() => { setSelfTab("transits"); if (!selfTransitData && !selfTransitLoading) fetchSelfTransits(); }}
            className={`flex-1 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
              selfTab === "transits"
                ? "bg-terracotta/15 text-terracotta border border-terracotta/20"
                : "text-muted border border-transparent"
            }`}
          >
            My Transits
          </button>
          <button
            onClick={() => {
              setSelfTab("solar");
              if (!selfSolarReturn && !selfSolarLoading) fetchSelfSolarReturn();
            }}
            className={`flex-1 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
              selfTab === "solar"
                ? "bg-terracotta/15 text-terracotta border border-terracotta/20"
                : "text-muted border border-transparent"
            }`}
          >
            Solar Return
          </button>
          <button
            onClick={() => setSelfTab("synastry")}
            className={`flex-1 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
              selfTab === "synastry"
                ? "bg-terracotta/15 text-terracotta border border-terracotta/20"
                : "text-muted border border-transparent"
            }`}
          >
            Between Us
          </button>
        </div>

        {/* ═══ My Transits Tab ═══ */}
        {selfTab === "transits" && (
          <>
            {/* Date wheel */}
            <DateWheel
              selectedDate={selfTransitDate}
              onChange={(date) => {
                setSelfTransitDate(date);
                fetchSelfTransits(date);
              }}
            />

            {selfTransitLoading && (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-2 border-terracotta/30 border-t-terracotta rounded-full animate-spin mx-auto mb-3" role="status" aria-label="Loading" />
                <p className="text-muted text-sm">Calculating your transits...</p>
              </div>
            )}

            {selfTransitData && !selfTransitLoading && (
              <>
                <div className="text-center mb-4">
                  <p className="text-muted text-xs">
                    What the sky is activating in your chart
                  </p>
                </div>

                {/* Current planet positions */}
                <div className="rounded-xl border border-foreground/15 bg-card/45 px-4 py-4 mb-6">
                  <p className="text-muted text-[10px] uppercase tracking-widest mb-3">Where the planets are right now</p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    {selfTransitData.transitPlanets.filter(p => p.name !== "Moon").map(tp => (
                      <div key={tp.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-muted text-sm w-5 text-center" style={{ fontFamily: "var(--font-heading)" }}>
                            {PLANET_SYMBOLS[tp.name] || ""}
                          </span>
                          <span className="text-secondary text-xs">{tp.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className={`text-xs font-medium ${elementColor(tp.sign)}`}>
                            {SIGN_FULL[tp.sign] || SIGN_NAMES[tp.sign] || tp.sign}
                          </span>
                          {tp.retrograde && (
                            <span className="text-terracotta/60 text-[9px] font-medium px-1 py-0.5 rounded bg-terracotta/10">Rx</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Filter toggle: All / Year Ruler Only */}
                {mapsLoY && (
                  <div className="flex items-center gap-2 mb-4">
                    <button
                      onClick={() => setTransitFilterLoY(false)}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-medium border transition-all ${
                        !transitFilterLoY
                          ? "bg-terracotta/15 text-terracotta border-terracotta/20"
                          : "text-muted border-foreground/10"
                      }`}
                    >
                      All transits
                    </button>
                    <button
                      onClick={() => setTransitFilterLoY(true)}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-medium border transition-all ${
                        transitFilterLoY
                          ? "bg-lavender/15 text-lavender border-lavender/20"
                          : "text-muted border-foreground/10"
                      }`}
                    >
                      Year ruler only
                    </button>
                    <span className="text-muted text-[10px] ml-auto">
                      {mapsLoY.lordPlanet} year
                    </span>
                  </div>
                )}

                {/* Major + minor transits — sorted purely by intensity */}
                {(() => {
                  const majorPlanets = ["Pluto", "Neptune", "Uranus", "Saturn", "Jupiter"];
                  const loyPlanet = mapsLoY?.lordPlanet || "";

                  // Filter by LoY if toggle is active
                  let aspects = selfTransitData.transitAspects;
                  if (transitFilterLoY && loyPlanet) {
                    aspects = aspects.filter(a => isLordOfYearTransit(a.transitPlanet, a.natalPlanet, loyPlanet));
                  }

                  // Sort purely by intensity — most impactful first
                  const intensitySort = (a: TransitAspect, b: TransitAspect) =>
                    getTransitIntensity(b).score - getTransitIntensity(a).score;

                  const major = aspects
                    .filter(a => majorPlanets.includes(a.transitPlanet))
                    .sort(intensitySort);
                  const minor = aspects
                    .filter(a => !majorPlanets.includes(a.transitPlanet))
                    .sort(intensitySort);

                  return (
                    <>
                      {major.length > 0 && (
                        <div className="mb-6">
                          <h2 className="text-foreground text-base font-medium mb-1" style={{ fontFamily: "var(--font-display)" }}>
                            Major transits
                          </h2>
                          <p className="text-muted text-xs mb-3">Slow-moving planets — these themes last weeks to years</p>
                          <div className="flex flex-col gap-3">
                            {major.map((ta, i) => {
                              const uid = `self-maj-${i}`;
                              const isOpen = openAspect === uid;
                              const nature = ASPECT_NATURE[ta.aspect];
                              const tpInfo = TRANSIT_PLANET_ENERGY[ta.transitPlanet];
                              const dotColor = nature?.nature === "harmonious" ? "bg-sage" : nature?.nature === "challenging" ? "bg-terracotta" : "bg-amber";
                              const manifests = getTransitManifestations(ta);
                              const intensity = getTransitIntensity(ta);

                              return (
                                <div key={i} className="rounded-xl border border-foreground/18 bg-card/50 overflow-hidden">
                                  <button
                                    onClick={() => setOpenAspect(isOpen ? null : uid)}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-left"
                                  >
                                    <div className={`w-3 h-3 rounded-full flex-shrink-0 ${dotColor}`} />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-foreground text-sm font-medium">
                                        {ta.transitPlanet} {ta.aspect} your {ta.natalPlanet}
                                      </p>
                                      <div className="flex items-center gap-2 text-xs text-muted">
                                        <span className={nature?.nature === "harmonious" ? "text-sage" : nature?.nature === "challenging" ? "text-terracotta" : "text-amber"}>
                                          {tpInfo?.keyword || "Active"}
                                        </span>
                                        <span>&middot;</span>
                                        <span>{tpInfo?.speed || ""} transit</span>
                                        {ta.transitRetrograde && (
                                          <>
                                            <span>&middot;</span>
                                            <span className="text-terracotta/50">Rx</span>
                                          </>
                                        )}
                                      </div>
                                      {ta.startDate && ta.endDate && (
                                        <p className="text-muted text-[10px] mt-0.5">
                                          {fmtDateRange(ta.startDate, ta.endDate)}
                                          {ta.exactDate && (
                                            <span className="text-muted"> · exact {fmtTransitDate(ta.exactDate)}</span>
                                          )}
                                        </p>
                                      )}
                                      <div className="flex items-center gap-1.5 text-[10px] text-muted mt-0.5">
                                        <span>{intensity.score}/100</span>
                                        <span>&middot;</span>
                                        <span>{ta.orb}&deg; orb</span>
                                        {ta.transitHouse > 0 && (
                                          <>
                                            <span>&middot;</span>
                                            <span>{ordinal(ta.transitHouse)} house — {HOUSE_THEMES[ta.transitHouse]?.area}</span>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                                      {loyPlanet && isLordOfYearTransit(ta.transitPlanet, ta.natalPlanet, loyPlanet) && (
                                        <span className="text-[8px] uppercase tracking-wider font-bold text-lavender bg-lavender/10 px-1.5 py-0.5 rounded">
                                          Year Ruler
                                        </span>
                                      )}
                                      <span className={`text-[10px] font-medium ${intensity.color}`}>{intensity.label}</span>
                                      <div className="w-12 h-1 rounded-full bg-foreground/8 overflow-hidden">
                                        <div
                                          className={`h-full rounded-full transition-all ${
                                            intensity.score >= 75 ? "bg-terracotta" :
                                            intensity.score >= 55 ? "bg-amber" :
                                            intensity.score >= 38 ? "bg-cream/40" :
                                            "bg-foreground/20"
                                          }`}
                                          style={{ width: `${intensity.score}%` }}
                                        />
                                      </div>
                                    </div>
                                    <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                                      className={`text-muted transition-transform flex-shrink-0 ${isOpen ? "rotate-180" : ""}`}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                    </svg>
                                  </button>
                                  {isOpen && (
                                    <div className="px-4 pb-4 border-t border-foreground/15">
                                      <div className="flex items-center justify-between mt-3 mb-2">
                                        <div className="flex items-center gap-2">
                                          {ta.transitHouse > 0 && (
                                            <>
                                              <span className="text-ink text-xs font-medium">
                                                {ordinal(ta.transitHouse)} House
                                              </span>
                                              <span className="text-muted text-[10px]">
                                                {HOUSE_THEMES[ta.transitHouse]?.area}
                                              </span>
                                            </>
                                          )}
                                        </div>
                                        <span className="text-muted text-[10px]">{ta.orb}&deg; orb</span>
                                      </div>
                                      {ta.startDate && ta.endDate && (
                                        <div className="flex items-center gap-2 mb-2">
                                          <span className="text-muted text-[10px] uppercase tracking-widest">Active</span>
                                          <span className="text-muted text-xs">{fmtDateRange(ta.startDate, ta.endDate)}</span>
                                          {ta.exactDate && (
                                            <>
                                              <span className="text-muted text-[10px]">&middot;</span>
                                              <span className="text-muted text-xs">Exact {fmtTransitDate(ta.exactDate)}</span>
                                            </>
                                          )}
                                        </div>
                                      )}
                                      <p className="text-secondary text-xs leading-relaxed mb-3">
                                        {getTransitDescription(ta)}
                                      </p>
                                      {manifests.length > 0 && (
                                        <div>
                                          <p className="text-muted text-[10px] uppercase tracking-widest mb-1.5">Ways this might show up</p>
                                          <div className="flex flex-col gap-1.5">
                                            {manifests.map((m, mi) => (
                                              <div key={mi} className="flex items-start gap-2">
                                                <span className="text-muted text-xs mt-0.5">&bull;</span>
                                                <span className="text-muted text-xs leading-relaxed">{m}</span>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {minor.length > 0 && (
                        <div className="mb-6">
                          <h2 className="text-foreground text-base font-medium mb-1" style={{ fontFamily: "var(--font-display)" }}>
                            Current activations
                          </h2>
                          <p className="text-muted text-xs mb-3">Faster-moving planets — these set the day-to-day tone</p>
                          <div className="flex flex-col gap-2">
                            {minor.slice(0, 15).map((ta, i) => {
                              const uid = `self-min-${i}`;
                              const isOpen = openAspect === uid;
                              const nature = ASPECT_NATURE[ta.aspect];
                              const tpInfo = TRANSIT_PLANET_ENERGY[ta.transitPlanet];
                              const dotColor = nature?.nature === "harmonious" ? "bg-sage" : nature?.nature === "challenging" ? "bg-terracotta" : "bg-amber";
                              const intensity = getTransitIntensity(ta);
                              const manifests = getTransitManifestations(ta);

                              return (
                                <div key={i} className="rounded-xl border border-foreground/18 bg-card/50 overflow-hidden">
                                  <button
                                    onClick={() => setOpenAspect(isOpen ? null : uid)}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-left"
                                  >
                                    <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${dotColor}`} />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-foreground text-sm font-medium">
                                        {ta.transitPlanet} {ta.aspect} your {ta.natalPlanet}
                                      </p>
                                      <div className="flex items-center gap-2 text-xs text-muted">
                                        <span>{tpInfo?.keyword || "Active"}</span>
                                        {ta.transitRetrograde && <span className="text-terracotta/50">Rx</span>}
                                      </div>
                                      <div className="flex items-center gap-1.5 text-[10px] text-muted mt-0.5">
                                        <span>{intensity.score}/100</span>
                                        <span>&middot;</span>
                                        <span>{ta.orb}&deg; orb</span>
                                        {ta.transitHouse > 0 && (
                                          <>
                                            <span>&middot;</span>
                                            <span>{ordinal(ta.transitHouse)} house</span>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                                      {loyPlanet && isLordOfYearTransit(ta.transitPlanet, ta.natalPlanet, loyPlanet) && (
                                        <span className="text-[8px] uppercase tracking-wider font-bold text-lavender bg-lavender/10 px-1 py-0.5 rounded">
                                          LoY
                                        </span>
                                      )}
                                      <span className={`text-[10px] ${intensity.color}`}>{intensity.label}</span>
                                      <div className="w-10 h-0.5 rounded-full bg-foreground/8 overflow-hidden">
                                        <div
                                          className={`h-full rounded-full ${
                                            intensity.score >= 75 ? "bg-terracotta" :
                                            intensity.score >= 55 ? "bg-amber" :
                                            intensity.score >= 38 ? "bg-cream/40" :
                                            "bg-foreground/20"
                                          }`}
                                          style={{ width: `${intensity.score}%` }}
                                        />
                                      </div>
                                    </div>
                                    <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                                      className={`text-muted transition-transform flex-shrink-0 ${isOpen ? "rotate-180" : ""}`}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                    </svg>
                                  </button>
                                  {isOpen && (
                                    <div className="px-4 pb-3 border-t border-foreground/15">
                                      <p className="text-secondary text-xs leading-relaxed pt-2">
                                        {getTransitDescription(ta)}
                                      </p>
                                      {manifests.length > 0 && (
                                        <div className="mt-2">
                                          <p className="text-muted text-[10px] uppercase tracking-widest mb-1">Ways this might show up</p>
                                          <div className="flex flex-col gap-1">
                                            {manifests.map((m, mi) => (
                                              <div key={mi} className="flex items-start gap-2">
                                                <span className="text-muted text-xs mt-0.5">&bull;</span>
                                                <span className="text-muted text-xs leading-relaxed">{m}</span>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {major.length === 0 && minor.length === 0 && (
                        <div className="text-center py-8">
                          <p className="text-muted text-sm">No significant transits to your chart right now.</p>
                          <p className="text-muted text-xs mt-1">This is a relatively quiet period astrologically.</p>
                        </div>
                      )}
                    </>
                  );
                })()}

                <div className="rounded-xl border border-foreground/15 bg-card/40 px-4 py-3">
                  <p className="text-muted text-xs leading-relaxed">
                    Transits show where the planets are activating your birth chart. Major transits (Jupiter through Pluto) shape long-term themes, while inner planet transits (Sun through Mars) set the daily tone.
                  </p>
                </div>
              </>
            )}

            {!selfTransitData && !selfTransitLoading && (
              <div className="text-center py-12">
                <p className="text-muted text-sm mb-3">Couldn&rsquo;t load transit data.</p>
                <button
                  onClick={() => fetchSelfTransits()}
                  className="px-4 py-2 rounded-xl border border-foreground/18 text-muted text-xs hover:text-foreground transition-colors"
                >
                  Try again
                </button>
              </div>
            )}
          </>
        )}

        {/* ═══ My Solar Return Tab ═══ */}
        {selfTab === "solar" && (
          <>
            {selfSolarLoading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-6 h-6 border-2 border-terracotta/30 border-t-terracotta rounded-full animate-spin mb-3" role="status" aria-label="Loading" />
                <p className="text-muted text-xs">Calculating your solar return...</p>
              </div>
            ) : selfSolarReturn ? (
              (() => {
                const yearSummary = generateYearSummary(selfSolarReturn);
                return (
                  <>
                    {/* Year picker */}
                    <div className="flex items-center justify-center gap-3 mb-5">
                      <button
                        onClick={() => { const y = selfSolarYear - 1; setSelfSolarYear(y); fetchSelfSolarReturn(y); }}
                        className="w-8 h-8 rounded-lg border border-foreground/18 flex items-center justify-center text-muted hover:text-foreground transition-colors active:scale-95"
                      >
                        <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
                      </button>
                      <div className="text-center">
                        <span className="text-foreground text-lg font-medium" style={{ fontFamily: "var(--font-display)" }}>{selfSolarYear}</span>
                        <p className="text-muted text-[10px] uppercase tracking-widest">solar return</p>
                      </div>
                      <button
                        onClick={() => { const y = selfSolarYear + 1; setSelfSolarYear(y); fetchSelfSolarReturn(y); }}
                        className="w-8 h-8 rounded-lg border border-foreground/18 flex items-center justify-center text-muted hover:text-foreground transition-colors active:scale-95"
                      >
                        <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
                      </button>
                    </div>

                    {/* Return date */}
                    <div className="rounded-xl border border-gold/15 bg-gold/5 px-4 py-3 mb-5">
                      <div className="flex items-center gap-2 mb-1">
                        <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-60">
                          <circle cx="12" cy="12" r="5" />
                          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                        </svg>
                        <span className="text-gold/80 text-xs font-medium">Your Sun returns on</span>
                      </div>
                      <p className="text-foreground text-sm">
                        {(() => {
                          const d = new Date(selfSolarReturn.returnDate + "T12:00:00");
                          const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                          const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                          return `${dayNames[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()} at ${selfSolarReturn.returnTime}`;
                        })()}
                      </p>
                    </div>

                    {/* Big three */}
                    <div className="flex items-center justify-center gap-3 mb-5">
                      {[
                        { label: "SR Sun", sign: selfSolarReturn.bigThree?.sun },
                        { label: "SR Moon", sign: selfSolarReturn.bigThree?.moon },
                        { label: "SR Rising", sign: selfSolarReturn.bigThree?.rising },
                      ].map((item) => (
                        <div key={item.label} className="flex-1 text-center py-2.5 rounded-xl border border-foreground/15 bg-card/40">
                          <p className="text-foreground text-sm font-medium">{item.sign}</p>
                          <p className="text-muted text-[10px] uppercase tracking-widest mt-0.5">{item.label}</p>
                        </div>
                      ))}
                    </div>

                    {/* Share & Export */}
                    <div className="flex justify-center gap-2 mb-5">
                      <ShareCard
                        type="solar"
                        name="My"
                        theme={yearSummary.title}
                        subtitle={selfSolarReturn.bigThree ? `SR Sun ${selfSolarReturn.bigThree.sun} · SR Moon ${selfSolarReturn.bigThree.moon} · SR Rising ${selfSolarReturn.bigThree.rising}` : undefined}
                        highlights={[
                          { label: "SR Sun", value: selfSolarReturn.bigThree?.sun || "?" },
                          { label: "SR Moon", value: selfSolarReturn.bigThree?.moon || "?" },
                          { label: "SR Rising", value: selfSolarReturn.bigThree?.rising || "?" },
                        ]}
                      />
                      <ExportButton
                        type="solar-return"
                        name="My Solar Return"
                        bigThree={selfSolarReturn.bigThree}
                        planets={selfSolarReturn.planets}
                        houses={selfSolarReturn.houses}
                        aspects={selfSolarReturn.aspects}
                        specialPoints={selfSolarReturn.specialPoints}
                        meta={{ year: String(selfSolarYear), returnDate: selfSolarReturn.returnDate || "", returnTime: selfSolarReturn.returnTime || "" }}
                      />
                    </div>

                    {/* ── Year Ahead Themes ── */}
                    <h3 className="text-secondary text-[10px] uppercase tracking-widest mb-3">Your Year Ahead</h3>
                    <div className="space-y-3 mb-6">
                      {yearSummary.themes.map((theme, i) => (
                        <div key={i} className="rounded-xl border border-foreground/15 bg-surface/25 px-4 py-3.5">
                          <p className="text-foreground text-sm font-medium mb-1.5" style={{ fontFamily: "var(--font-display)" }}>
                            {theme.heading}
                          </p>
                          <p className="text-muted text-xs leading-relaxed">
                            {theme.body}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Collapsible: Placements */}
                    <details className="group mb-4">
                      <summary className="flex items-center justify-between cursor-pointer py-2 text-muted text-[10px] uppercase tracking-widest hover:text-foreground transition-colors">
                        <span>All placements</span>
                        <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition-transform group-open:rotate-180"><polyline points="6 9 12 15 18 9" /></svg>
                      </summary>
                      <div className="space-y-1.5 mt-2">
                        {(selfSolarReturn.planets || []).map((planet: any) => (
                          <div key={planet.name} className="flex items-center justify-between px-4 py-2.5 rounded-xl border border-foreground/15 bg-card/35">
                            <div className="flex items-center gap-2.5">
                              <span className="text-foreground text-sm">{planet.name}</span>
                              {planet.retrograde && <span className="text-red-400/50 text-[9px] font-medium">Rx</span>}
                            </div>
                            <div className="text-right">
                              <span className="text-secondary text-sm">{planet.sign}</span>
                              <span className="text-muted text-[10px] ml-1.5">{planet.position?.toFixed(1)}&deg;</span>
                              {planet.house && <span className="text-muted text-[10px] ml-1.5">H{planet.house}</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </details>

                    {/* Collapsible: Houses */}
                    <details className="group mb-4">
                      <summary className="flex items-center justify-between cursor-pointer py-2 text-muted text-[10px] uppercase tracking-widest hover:text-foreground transition-colors">
                        <span>House cusps</span>
                        <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition-transform group-open:rotate-180"><polyline points="6 9 12 15 18 9" /></svg>
                      </summary>
                      <div className="grid grid-cols-3 gap-1.5 mt-2">
                        {(selfSolarReturn.houses || []).map((house: any) => (
                          <div key={house.number} className="text-center py-2 rounded-lg border border-foreground/15 bg-card/30">
                            <p className="text-muted text-[9px] uppercase tracking-widest">House {house.number}</p>
                            <p className="text-muted text-xs mt-0.5">{house.sign} {house.position?.toFixed(0)}&deg;</p>
                          </div>
                        ))}
                      </div>
                    </details>

                    {/* Collapsible: Aspects */}
                    {selfSolarReturn.aspects && selfSolarReturn.aspects.length > 0 && (
                      <details className="group mb-4">
                        <summary className="flex items-center justify-between cursor-pointer py-2 text-muted text-[10px] uppercase tracking-widest hover:text-foreground transition-colors">
                          <span>Aspects</span>
                          <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition-transform group-open:rotate-180"><polyline points="6 9 12 15 18 9" /></svg>
                        </summary>
                        <div className="space-y-1 mt-2">
                          {(selfSolarReturn.aspects as any[]).slice(0, 15).map((asp: any, i: number) => {
                            const aspectSymbols: Record<string, string> = { conjunction: "\u260C", opposition: "\u260D", trine: "\u25B3", square: "\u25A1", sextile: "\u2731", quincunx: "Qx" };
                            const sym = aspectSymbols[asp.aspect?.toLowerCase()] || asp.aspect;
                            return (
                              <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg border border-foreground/15 bg-card/30">
                                <span className="text-muted text-xs">{asp.p1Name} {sym} {asp.p2Name}</span>
                                <span className="text-muted text-[10px]">{asp.orbit?.toFixed(1)}&deg;</span>
                              </div>
                            );
                          })}
                        </div>
                      </details>
                    )}
                  </>
                );
              })()
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <button
                  onClick={() => fetchSelfSolarReturn()}
                  className="px-5 py-2.5 rounded-xl bg-terracotta/15 border border-terracotta/20 text-terracotta text-sm hover:bg-terracotta/25 transition-colors active:scale-[0.98]"
                >
                  Calculate My Solar Return
                </button>
                <p className="text-muted text-xs mt-3 text-center max-w-[260px]">
                  See your year-ahead themes based on when the Sun returns to your natal degree
                </p>
              </div>
            )}
          </>
        )}

        {/* ═══ Between Us (Synastry) Tab ═══ */}
        {selfTab === "synastry" && (
          <>
            <div className="text-center mb-4">
              <p className="text-muted text-sm">
                What the sky is doing to your relationship right now
              </p>
            </div>

            {/* Person selector dropdown */}
            <div className="mb-6">
              <select
                value={overlapPersonId || ""}
                aria-label="Select a person for comparison"
                onChange={(e) => {
                  const id = e.target.value;
                  if (!id) { setOverlapPersonId(null); setOverlapTransitData(null); return; }
                  setOverlapPersonId(id);
                  setOverlapTransitData(null);
                  setSelfTransitData(null);
                  const conn = connections.find(c => c.id === id);
                  if (conn) fetchBothTransits(conn);
                }}
                className="w-full px-4 py-3 rounded-xl bg-surface border border-foreground/18 text-foreground text-sm focus:outline-none focus:border-terracotta/50 focus:ring-1 focus:ring-terracotta/25 appearance-none"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23d4c5a980' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 16px center" }}
              >
                <option value="">Select a person</option>
                {connections.filter(c => c.planets).map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.relationship})</option>
                ))}
              </select>
            </div>

            {/* Loading */}
            {(selfTransitLoading || overlapTransitLoading) && overlapPersonId && (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-2 border-terracotta/30 border-t-terracotta rounded-full animate-spin mx-auto mb-3" role="status" aria-label="Loading" />
                <p className="text-muted text-sm">Reading the sky between you...</p>
              </div>
            )}

            {/* No person selected yet */}
            {!overlapPersonId && (
              <div className="text-center py-16">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-card/45 flex items-center justify-center">
                  <span className="text-2xl" style={{ fontFamily: "var(--font-heading)" }}>{"\u263D"}</span>
                </div>
                <p className="text-muted text-sm mb-1">Choose someone from your map</p>
                <p className="text-muted text-xs">
                  See how today&rsquo;s transits are shaping what&rsquo;s happening between you
                </p>
              </div>
            )}

            {/* Failed to load */}
            {overlapPersonId && !selfTransitLoading && !overlapTransitLoading && (!selfTransitData || !overlapTransitData) && (
              <div className="text-center py-12">
                <p className="text-muted text-sm mb-2">Couldn&rsquo;t load transit data.</p>
                {overlapError && (
                  <p className="text-muted text-xs mb-3 font-mono">{overlapError}</p>
                )}
                <button
                  onClick={() => {
                    const conn = connections.find(c => c.id === overlapPersonId);
                    if (conn) fetchBothTransits(conn);
                  }}
                  className="px-4 py-2 rounded-xl border border-foreground/18 text-muted text-xs hover:text-foreground transition-colors"
                >
                  Try again
                </button>
              </div>
            )}

            {/* Relationship story */}
            {overlapPerson && selfTransitData && overlapTransitData && !selfTransitLoading && !overlapTransitLoading && (
              <>
                <div className="flex items-center justify-center gap-4 mb-8">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-terracotta/12 border border-terracotta/30 flex items-center justify-center mb-1">
                      <span className="text-terracotta text-lg" style={{ fontFamily: "var(--font-heading)" }}>{"\u2609"}</span>
                    </div>
                    <span className="text-muted text-[10px]">You</span>
                  </div>
                  <div className="flex-1 max-w-[100px] h-px bg-gradient-to-r from-terracotta/30 via-foreground/10 to-terracotta/30 relative">
                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-background px-1.5">
                      <span className="text-muted text-[9px] uppercase tracking-wider">now</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-sage/12 border border-sage/30 flex items-center justify-center mb-1">
                      <span className="text-sage text-sm font-medium">{personName[0]}</span>
                    </div>
                    <span className="text-muted text-[10px]">{personName}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  {storyCards.map((card, i) => {
                    const bgTone = card.tone === "warm" ? "bg-sage/5 border-sage/15" : card.tone === "tension" ? "bg-terracotta/5 border-terracotta/15" : card.tone === "growth" ? "bg-amber/5 border-amber/15" : "bg-surface/60 border-foreground/15";
                    const headlineColor = card.tone === "warm" ? "text-sage" : card.tone === "tension" ? "text-terracotta" : card.tone === "growth" ? "text-amber" : "text-foreground";
                    return (
                      <div key={i} className={`rounded-xl border ${bgTone} px-5 py-5`}>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-base">{card.icon}</span>
                          <h3 className={`text-sm font-medium ${headlineColor}`} style={{ fontFamily: "var(--font-display)" }}>
                            {card.headline}
                          </h3>
                        </div>
                        <p className="text-secondary text-sm leading-relaxed mb-4">{card.body}</p>
                        <div className="rounded-lg bg-foreground/[0.03] border border-foreground/15 px-4 py-3">
                          <p className="text-muted text-[10px] uppercase tracking-widest mb-1.5">What to do</p>
                          <p className="text-secondary text-sm leading-relaxed">{card.advice}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </>
        )}

        <div className="h-8" />
      </main>
    );
  }

  // ─── Detail view for selected connection ───
  if (selected) {
    let syn: SynastryData | null = null;
    let bt: { sun: string; moon: string; rising: string } | null = null;
    let personPlanets: Planet[] = [];
    let personHouses: { number: number; sign: string; signNum: number; position: number; absPosition: number }[] = [];
    let isPartner = false;
    let compat: CompatibilityResult | null = null;

    try {
      syn = (selected.synastry as SynastryData | null) ?? null;
      bt = selected.big_three ?? null;
      personPlanets = selected.planets || [];
      personHouses = (selected.houses || []) as { number: number; sign: string; signNum: number; position: number; absPosition: number }[];
      isPartner = selected.category === "partner";

      // Normalize synastry data — Supabase JSONB round-trips can drop empty arrays
      if (syn) {
        if (!Array.isArray(syn.crossAspects)) syn.crossAspects = [];
        if (!Array.isArray(syn.themes)) syn.themes = [];
        if (!Array.isArray(syn.fatedContacts)) syn.fatedContacts = [];
        if (typeof syn.harmony !== "number") syn.harmony = 0;
        if (typeof syn.tension !== "number") syn.tension = 0;
      }

      // Compute compatibility
      if (syn) {
        compat = computeCompatibility(syn, "You", selected.name, userChart?.bigThree || null, bt, selected.category as "partner" | "family" | "friend");
      }
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : "Unknown error";
      const errStack = e instanceof Error ? e.stack : "";
      console.error("[maps] Detail view setup crashed:", e, "\nStack:", errStack, "\nSelected:", JSON.stringify({ name: selected.name, category: selected.category, hasSyn: !!selected.synastry, hasPlanets: !!selected.planets, planetHouses: selected.planets?.slice(0,3).map(p => ({ n: p.name, h: p.house, ht: typeof p.house })) }));
      // Show error fallback instead of crashing the page
      return (
        <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
          <p className="text-secondary text-sm mb-2">Something went wrong loading this chart (setup).</p>
          <p className="text-muted text-xs mb-4 max-w-sm break-words">{errMsg}</p>
          <pre className="text-muted text-[8px] leading-tight mb-4 max-w-sm overflow-auto max-h-48 text-left whitespace-pre-wrap break-all bg-foreground/5 p-2 rounded">{errStack}</pre>
          <button
            onClick={() => { setSelectedId(null); setPersonTab("synastry"); }}
            className="px-5 py-2 rounded-full bg-terracotta text-cream text-sm font-medium"
          >
            Back to your map
          </button>
        </main>
      );
    }

    // Safe first-name helper — guards against non-string name from Supabase
    const firstName = String(selected.name || "").split(" ")[0] || "them";

    return (
      <DetailErrorBoundary onReset={() => { setSelectedId(null); setPersonTab("synastry"); }}>
      <main className="flex-1 flex flex-col px-5 py-6 max-w-lg mx-auto w-full overflow-y-auto">
        <button
          onClick={() => { setSelectedId(null); setOpenAspect(null); setPersonTab("synastry"); setOpenPlacement(null); setShowDetailedAspects(false); }}
          className="flex items-center gap-2 text-muted text-sm mb-4 active:text-secondary"
        >
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to your map
        </button>

        <div className="text-center mb-4">
          <p className="text-muted text-xs uppercase tracking-widest mb-2">
            {selected.relationship}
          </p>
          <h1 className="text-2xl text-foreground mb-1" style={{ fontFamily: "var(--font-display)" }}>
            {selected.name}
          </h1>
          {bt && (
            <p className="text-muted text-sm">
              {SIGN_FULL[bt.sun]} Sun · {SIGN_FULL[bt.moon]} Moon
              {bt.rising && ` · ${SIGN_FULL[bt.rising]} Rising`}
            </p>
          )}
          <div className="flex items-center justify-center gap-4 mt-2">
            <button
              onClick={() => openEditForm(selected)}
              className="text-muted text-xs underline underline-offset-2 hover:text-foreground transition-colors"
            >
              edit info
            </button>
            {isPartner && (
              <button
                onClick={() => {
                  setSelectedId(null);
                  setShowDetailedAspects(false);
                  openAddForm("partner");
                }}
                className="text-muted text-xs underline underline-offset-2 hover:text-foreground transition-colors"
              >
                change partner
              </button>
            )}
            <button
              onClick={() => {
                if (confirm(`Remove ${selected.name} from your map?`)) {
                  handleRemoveConnection(selected.id);
                }
              }}
              className="text-muted text-xs underline underline-offset-2 hover:text-red-400/60 transition-colors"
            >
              remove
            </button>
          </div>
        </div>

        {/* ═══ Tab Bar (5 tabs) ═══ */}
        <div className="flex rounded-xl bg-card/45 border border-foreground/15 p-1 mb-6">
            <button
              onClick={() => { setPersonTab("synastry"); setOpenPlacement(null); setShowDetailedAspects(false); }}
              className={`flex-1 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                personTab === "synastry"
                  ? "bg-terracotta/15 text-terracotta border border-terracotta/20"
                  : "text-muted border border-transparent"
              }`}
            >
              {isPartner ? "Compat" : "Synastry"}
            </button>
            <button
              onClick={() => { setPersonTab("chart"); setOpenAspect(null); setShowDetailedAspects(false); }}
              className={`flex-1 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                personTab === "chart"
                  ? "bg-terracotta/15 text-terracotta border border-terracotta/20"
                  : "text-muted border border-transparent"
              }`}
            >
              Chart
            </button>
            <button
              onClick={() => {
                setPersonTab("composite");
                setOpenAspect(null);
                setShowDetailedAspects(false);
                if (selected.planets && userChart?.planets && (compositePersonId !== selected.id || !compositeData)) {
                  fetchComposite(selected);
                }
              }}
              className={`flex-1 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                personTab === "composite"
                  ? "bg-terracotta/15 text-terracotta border border-terracotta/20"
                  : "text-muted border border-transparent"
              }`}
            >
              Comp.
            </button>
            <button
              onClick={() => {
                setPersonTab("transits");
                setOpenAspect(null);
                setShowDetailedAspects(false);
                if (selected.planets && (transitPersonId !== selected.id || !transitData)) {
                  fetchTransits(selected);
                }
              }}
              className={`flex-1 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                personTab === "transits"
                  ? "bg-terracotta/15 text-terracotta border border-terracotta/20"
                  : "text-muted border border-transparent"
              }`}
            >
              Transits
            </button>
            <button
              onClick={() => {
                setPersonTab("solar");
                setOpenAspect(null);
                setShowDetailedAspects(false);
                if (selected.planets && (solarReturnPersonId !== selected.id || !solarReturnData)) {
                  fetchSolarReturn(selected);
                }
              }}
              className={`flex-1 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                personTab === "solar"
                  ? "bg-terracotta/15 text-terracotta border border-terracotta/20"
                  : "text-muted border border-transparent"
              }`}
            >
              Solar
            </button>
        </div>

        {/* ═══ SYNASTRY / COMPATIBILITY TAB ═══ */}
        {personTab === "synastry" && (
          <>
            {/* Calculate synastry if missing */}
            {!syn && selected.planets && (
              <button
                onClick={() => recalcSynastry(selected)}
                disabled={synastryLoading}
                className="px-6 py-3 rounded-full bg-terracotta text-cream font-semibold text-sm tracking-wide hover:bg-terracotta-light active:scale-[0.98] transition-all mb-8 mx-auto"
              >
                {synastryLoading ? "Calculating..." : "Calculate compatibility"}
              </button>
            )}

            {/* ─── Partner: rich compatibility view ─── */}
            {isPartner && compat && syn && (
              <>
                {/* Score Ring */}
                <div className="flex flex-col items-center mb-6">
                  <div className="relative w-32 h-32 mb-3">
                    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                      <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="4" className="text-foreground/5" />
                      <circle cx="50" cy="50" r="42" fill="none"
                        stroke={compat.score >= 70 ? "#5a7a3a" : compat.score >= 50 ? "#c9a961" : "#5a1f1a"}
                        strokeWidth="4" strokeLinecap="round"
                        strokeDasharray={`${(compat.score / 100) * 264} 264`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
                        {compat.score}
                      </span>
                      <span className="text-muted text-[10px] uppercase tracking-wider">/ 100</span>
                    </div>
                  </div>
                  <span className="text-sm font-medium" style={{
                    color: compat.score >= 70 ? "#5a7a3a" : compat.score >= 50 ? "#c9a961" : "#5a1f1a"
                  }}>
                    {compat.label}
                  </span>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted">
                    <span className="text-sage">{syn.harmony} harmonious</span>
                    <span>&middot;</span>
                    <span className="text-terracotta">{syn.tension} challenging</span>
                    {syn.fatedContacts.length > 0 && (
                      <>
                        <span>&middot;</span>
                        <span className="text-amber">{syn.fatedContacts.length} fated</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Share & export */}
                <div className="flex justify-center gap-2 mb-4">
                  <ShareCard
                    type="synastry"
                    name="You"
                    name2={firstName}
                    score={compat.score}
                    subtitle={userChart?.bigThree ? `${SIGN_FULL[userChart.bigThree.sun] || userChart.bigThree.sun} Sun · ${SIGN_FULL[userChart.bigThree.moon] || userChart.bigThree.moon} Moon` : undefined}
                    subtitle2={bt ? `${SIGN_FULL[bt.sun] || bt.sun} Sun · ${SIGN_FULL[bt.moon] || bt.moon} Moon` : undefined}
                    highlights={[
                      { label: "Harmonious", value: String(syn.harmony) },
                      { label: "Challenging", value: String(syn.tension) },
                      { label: "Fated", value: String(syn.fatedContacts.length) },
                    ]}
                  />
                  <ExportButton
                    type="synastry"
                    name="You"
                    name2={firstName}
                    aspects={syn.crossAspects}
                    meta={{
                      "Score": String(compat.score),
                      "Harmonious aspects": String(syn.harmony),
                      "Challenging aspects": String(syn.tension),
                      "Fated contacts": String(syn.fatedContacts.length),
                    }}
                  />
                </div>

                {/* Relationship Summary */}
                <div className="rounded-2xl border border-foreground/15 bg-surface/60 px-5 py-5 mb-4">
                  <p className="text-secondary text-sm leading-relaxed">
                    {compat.summary}
                  </p>
                </div>
                {/* Strengths — expandable accordions */}
                {compat.strengths.length > 0 && (
                  <div className="mb-5">
                    <h2 className="text-foreground text-base font-medium mb-3" style={{ fontFamily: "var(--font-display)" }}>
                      Strengths
                    </h2>
                    <div className="flex flex-col gap-2">
                      {compat.strengths.map((s, i) => {
                        const uid = `str-${i}`;
                        const isOpen = openAspect === uid;
                        // Find the top harmonious aspect that contributed to this strength
                        const relatedAspects = syn.crossAspects.filter(a => {
                          const w = ASPECT_WEIGHT[a.aspect] ?? 0;
                          return w > 0;
                        }).slice(i, i + 2);
                        return (
                          <div key={i} className="rounded-xl border border-sage/10 bg-sage/5 overflow-hidden">
                            <button
                              onClick={() => setOpenAspect(isOpen ? null : uid)}
                              className="w-full flex items-start gap-3 px-4 py-3 text-left"
                            >
                              <span className="text-sage text-sm mt-0.5 flex-shrink-0">&#10003;</span>
                              <span className="text-secondary text-sm leading-relaxed flex-1">{s}</span>
                              <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                                className={`text-sage/40 transition-transform duration-200 flex-shrink-0 mt-1 ${isOpen ? "rotate-180" : ""}`}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                            {isOpen && relatedAspects.length > 0 && (
                              <div className="px-4 pb-3 border-t border-sage/10">
                                <div className="flex flex-col gap-2 pt-2">
                                  {relatedAspects.map((ra, ri) => (
                                    <div key={ri} className="text-xs">
                                      <div className="flex items-center gap-1.5 mb-0.5">
                                        <span className={ASPECT_COLORS[ra.aspect] || "text-muted"}>
                                          {ASPECT_SYMBOLS[ra.aspect] || ""}
                                        </span>
                                        <span className="text-muted">
                                          Your {ra.p1Name} {ra.aspect} their {ra.p2Name}
                                        </span>
                                        <span className="text-muted ml-auto">{ra.orb}&deg;</span>
                                      </div>
                                      <p className="text-muted leading-relaxed">{getAspectDescription(ra, selected.category !== "partner")}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Growth areas — expandable accordions */}
                {compat.challenges.length > 0 && (
                  <div className="mb-6">
                    <h2 className="text-foreground text-base font-medium mb-3" style={{ fontFamily: "var(--font-display)" }}>
                      Growth areas
                    </h2>
                    <div className="flex flex-col gap-2">
                      {compat.challenges.map((c, i) => {
                        const uid = `chl-${i}`;
                        const isOpen = openAspect === uid;
                        const relatedAspects = syn.crossAspects.filter(a => {
                          const w = ASPECT_WEIGHT[a.aspect] ?? 0;
                          return w < 0;
                        }).slice(i, i + 2);
                        return (
                          <div key={i} className="rounded-xl border border-terracotta/10 bg-terracotta/5 overflow-hidden">
                            <button
                              onClick={() => setOpenAspect(isOpen ? null : uid)}
                              className="w-full flex items-start gap-3 px-4 py-3 text-left"
                            >
                              <span className="text-terracotta text-sm mt-0.5 flex-shrink-0">&#9651;</span>
                              <span className="text-secondary text-sm leading-relaxed flex-1">{c}</span>
                              <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                                className={`text-terracotta/40 transition-transform duration-200 flex-shrink-0 mt-1 ${isOpen ? "rotate-180" : ""}`}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                            {isOpen && relatedAspects.length > 0 && (
                              <div className="px-4 pb-3 border-t border-terracotta/10">
                                <div className="flex flex-col gap-2 pt-2">
                                  {relatedAspects.map((ra, ri) => (
                                    <div key={ri} className="text-xs">
                                      <div className="flex items-center gap-1.5 mb-0.5">
                                        <span className={ASPECT_COLORS[ra.aspect] || "text-muted"}>
                                          {ASPECT_SYMBOLS[ra.aspect] || ""}
                                        </span>
                                        <span className="text-muted">
                                          Your {ra.p1Name} {ra.aspect} their {ra.p2Name}
                                        </span>
                                        <span className="text-muted ml-auto">{ra.orb}&deg;</span>
                                      </div>
                                      <p className="text-muted leading-relaxed">{getAspectDescription(ra, selected.category !== "partner")}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Themes */}
                {syn.themes.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <h2 className="text-foreground text-base font-medium" style={{ fontFamily: "var(--font-display)" }}>
                        Your themes
                      </h2>
                      <InfoTip term="Theme Scores" explanation="Each theme is scored 0-100 based on how tight the aspects are between your charts, which planets are involved, and how many connections exist. Tighter orbs and heavier planets (Sun, Moon, Venus) score higher. The tier label shows how strongly the theme shows up: Defining (80+), Strong (65-79), Present (50-64), Subtle (35-49), Background (under 35)." />
                    </div>
                    <div className="flex flex-col gap-3">
                      {syn.themes.map((theme, i) => {
                        const themeScore = estimateThemeScore(theme);
                        const intensity = getThemeIntensity(themeScore);
                        const ringColor = themeScore >= 70 ? "#5a7a3a" : themeScore >= 50 ? "#c9a961" : "#5a1f1a";
                        return (
                          <div key={i} className="rounded-xl border border-foreground/15 bg-surface/60 px-4 py-4">
                            <div className="flex items-start gap-4">
                              <div className="relative w-14 h-14 flex-shrink-0">
                                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                                  <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="5" className="text-foreground/5" />
                                  <circle cx="50" cy="50" r="42" fill="none"
                                    stroke={ringColor}
                                    strokeWidth="5" strokeLinecap="round"
                                    strokeDasharray={`${(themeScore / 100) * 264} 264`}
                                  />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                  <span className="text-base font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
                                    {themeScore}
                                  </span>
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                  <p className="text-foreground text-sm font-medium" style={{ fontFamily: "var(--font-display)" }}>
                                    {theme.title}
                                  </p>
                                  <InfoTip term={intensity.label} explanation={intensity.desc} />
                                </div>
                                <p className="text-secondary text-sm leading-relaxed">{theme.summary}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* All Aspects — timeline-style individual accordions */}
                <div className="border-t border-foreground/15 pt-4 mb-2">
                  <h2 className="text-foreground text-base font-medium mb-3" style={{ fontFamily: "var(--font-display)" }}>
                    All aspects ({syn.crossAspects.length})
                  </h2>
                  <div className="flex flex-col gap-2">
                    {syn.crossAspects.map((a, i) => {
                      const uid = `asp-${i}`;
                      const isOpen = openAspect === uid;
                      const nature = ASPECT_NATURE[a.aspect];
                      const dotColor = nature?.nature === "harmonious" ? "bg-sage" : nature?.nature === "challenging" ? "bg-terracotta" : "bg-amber";

                      return (
                        <div key={i} className="rounded-xl border border-foreground/18 bg-card/50 overflow-hidden">
                          <button
                            onClick={() => setOpenAspect(isOpen ? null : uid)}
                            className="w-full flex items-center gap-3 px-4 py-3 text-left"
                          >
                            <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${dotColor}`} />
                            <div className="flex-1 min-w-0">
                              <p className="text-foreground text-sm font-medium">
                                {a.p1Name} <span className="text-muted">{a.aspect}</span> {a.p2Name}
                              </p>
                              <p className="text-muted text-xs">
                                {nature?.nature === "harmonious" ? "Harmonious" : nature?.nature === "challenging" ? "Challenging" : "Powerful"}
                                {a.fated && " · Fated"}
                                <span className="ml-1 text-muted">{a.orb}&deg; orb</span>
                              </p>
                            </div>
                            <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                              className={`text-muted transition-transform flex-shrink-0 ${isOpen ? "rotate-180" : ""}`}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          {isOpen && (
                            <div className="px-4 pb-3 border-t border-foreground/15">
                              <p className="text-secondary text-xs leading-relaxed pt-2">
                                {getAspectDescription(a, selected.category !== "partner")}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {/* ─── Non-partner: standard synastry view ─── */}
            {!isPartner && syn && (() => {
              // Filter out romantic themes for family/friend connections
              const ROMANTIC_THEME_TITLES = ["Physical Chemistry", "Frustrated Desire", "Shared Love Language"];
              const isPlatonic = selected.category === "family" || selected.category === "friend";
              const filteredThemes = isPlatonic
                ? syn.themes.filter(t => !ROMANTIC_THEME_TITLES.includes(t.title))
                : syn.themes;

              // Sanitize fated reasons that may have been calculated without context
              // Backstop: rewrite any romantic/sexual language for family/friend.
              // Delegates to the centralized, comprehensive toPlatonic util.
              function sanitizePlatonicText(text: string): string {
                return isPlatonic ? toPlatonic(text) : text;
              }

              return (
              <>
                {/* Score ring — same as partner view */}
                {compat && (
                  <>
                    <div className="flex flex-col items-center mb-6">
                      <div className="relative w-32 h-32 mb-3">
                        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                          <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="4" className="text-foreground/5" />
                          <circle cx="50" cy="50" r="42" fill="none"
                            stroke={compat.score >= 70 ? "#5a7a3a" : compat.score >= 50 ? "#c9a961" : "#5a1f1a"}
                            strokeWidth="4" strokeLinecap="round"
                            strokeDasharray={`${(compat.score / 100) * 264} 264`}
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-3xl font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
                            {compat.score}
                          </span>
                          <span className="text-muted text-[10px] uppercase tracking-wider">/ 100</span>
                        </div>
                      </div>
                      <span className="text-sm font-medium" style={{
                        color: compat.score >= 70 ? "#5a7a3a" : compat.score >= 50 ? "#c9a961" : "#5a1f1a"
                      }}>
                        {compat.label}
                      </span>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted">
                        <span className="text-sage">{syn.harmony} harmonious</span>
                        <span>&middot;</span>
                        <span className="text-terracotta">{syn.tension} challenging</span>
                        {syn.fatedContacts.length > 0 && (
                          <>
                            <span>&middot;</span>
                            <span className="text-amber">{syn.fatedContacts.length} fated</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="rounded-xl border border-foreground/15 bg-surface/60 px-5 py-5 mb-4">
                      <p className="text-secondary text-sm leading-relaxed">{sanitizePlatonicText(compat.summary)}</p>
                    </div>
                  </>
                )}

                {filteredThemes.length > 0 && (
                  <>
                    <div className="flex items-center gap-2 mb-3">
                      <h2 className="text-lg text-foreground" style={{ fontFamily: "var(--font-display)" }}>
                        Themes
                      </h2>
                      <InfoTip term="Theme Scores" explanation="Each theme is scored 0-100 based on how tight the aspects are between your charts, which planets are involved, and how many connections exist. Tighter orbs and heavier planets (Sun, Moon, Venus) score higher. The tier label shows how strongly the theme shows up: Defining (80+), Strong (65-79), Present (50-64), Subtle (35-49), Background (under 35)." />
                    </div>
                    <div className="flex flex-col gap-3 mb-6">
                      {filteredThemes.map((theme, i) => {
                        const themeScore = estimateThemeScore(theme);
                        const intensity = getThemeIntensity(themeScore);
                        const ringColor = themeScore >= 70 ? "#5a7a3a" : themeScore >= 50 ? "#c9a961" : "#5a1f1a";
                        return (
                          <div key={i} className="rounded-xl border border-foreground/15 bg-surface/60 px-4 py-4">
                            <div className="flex items-start gap-4">
                              <div className="relative w-14 h-14 flex-shrink-0">
                                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                                  <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="5" className="text-foreground/5" />
                                  <circle cx="50" cy="50" r="42" fill="none"
                                    stroke={ringColor}
                                    strokeWidth="5" strokeLinecap="round"
                                    strokeDasharray={`${(themeScore / 100) * 264} 264`}
                                  />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                  <span className="text-base font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
                                    {themeScore}
                                  </span>
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                  <p className="text-foreground text-sm font-medium" style={{ fontFamily: "var(--font-display)" }}>
                                    {sanitizePlatonicText(theme.title)}
                                  </p>
                                  <InfoTip term={intensity.label} explanation={intensity.desc} />
                                </div>
                                <p className="text-secondary text-sm leading-relaxed">{sanitizePlatonicText(theme.summary)}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}

                {syn.fatedContacts.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <h2 className="text-lg text-foreground" style={{ fontFamily: "var(--font-display)" }}>
                        Fated contacts
                      </h2>
                      <InfoTip term="Fated Contacts" explanation="Contacts involving the Lunar Nodes, the Vertex, Saturn, Pluto, Chiron, or Black Moon Lilith between your charts. Each is tagged by what kind of fate it carries — Destiny, Karmic, Binding, Soul-deep, Healing, or Shadow — and ranked by how strongly it shows up." />
                    </div>
                    <div className="flex flex-col gap-2">
                      {syn.fatedContacts.slice(0, 10).map((fc, i) => {
                        const cat = fc.fatedCategory ? FATED_CATEGORY_STYLE[fc.fatedCategory] : null;
                        return (
                        <div key={i} className="rounded-xl border border-amber/10 bg-amber/5 px-4 py-3">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className={`text-xs ${ASPECT_COLORS[fc.aspect] || "text-muted"}`}>
                              {ASPECT_SYMBOLS[fc.aspect] || ""}
                            </span>
                            <span className="text-secondary text-xs">
                              Your {fc.p1Name} {fc.aspect} their {fc.p2Name}
                            </span>
                            <span className="text-muted text-[10px] ml-auto">{fc.orb}&deg;</span>
                          </div>
                          {cat && (
                            <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
                              <span className={`text-[10px] px-2 py-0.5 rounded-full border ${cat.cls}`}>{cat.label}</span>
                              {(fc.fatedKeywords || []).map((kw, k) => (
                                <span key={k} className="text-muted text-[10px]">{kw}{k < (fc.fatedKeywords!.length - 1) ? " ·" : ""}</span>
                              ))}
                            </div>
                          )}
                          {fc.fatedReason && (
                            <p className="text-secondary text-sm leading-relaxed">{sanitizePlatonicText(fc.fatedReason)}</p>
                          )}
                        </div>
                        );
                      })}
                      {syn.fatedContacts.length > 10 && (
                        <p className="text-muted text-xs px-1 pt-1">
                          + {syn.fatedContacts.length - 10} more fated contacts in all aspects below
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Non-partner aspects — same timeline accordion style */}
                <div className="mb-6">
                  <h2 className="text-lg text-foreground mb-3" style={{ fontFamily: "var(--font-display)" }}>
                    All aspects
                  </h2>
                  <div className="flex flex-col gap-2">
                    {syn.crossAspects
                      .filter(a => {
                        // For family, filter out Venus-Mars cross-aspects (romantic indicator)
                        if (selected.category === "family") {
                          const pair = [a.p1Name, a.p2Name].sort().join("-");
                          if (pair === "Mars-Venus") return false;
                        }
                        return true;
                      })
                      .slice(0, 20).map((a, i) => {
                      const uid = `syn-${i}`;
                      const isOpen = openAspect === uid;
                      const nature = ASPECT_NATURE[a.aspect];
                      const dotColor = nature?.nature === "harmonious" ? "bg-sage" : nature?.nature === "challenging" ? "bg-terracotta" : "bg-amber";
                      return (
                        <div key={i} className="rounded-xl border border-foreground/18 bg-card/50 overflow-hidden">
                          <button
                            onClick={() => setOpenAspect(isOpen ? null : uid)}
                            className="w-full flex items-center gap-3 px-4 py-3 text-left"
                          >
                            <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${dotColor}`} />
                            <div className="flex-1 min-w-0">
                              <p className="text-foreground text-sm font-medium">
                                {a.p1Name} <span className="text-muted">{a.aspect}</span> {a.p2Name}
                              </p>
                              <p className="text-muted text-xs">
                                {nature?.nature === "harmonious" ? "Harmonious" : nature?.nature === "challenging" ? "Challenging" : "Powerful"}
                                {a.fated && " · Fated"}
                                <span className="ml-1 text-muted">{a.orb}&deg; orb</span>
                              </p>
                            </div>
                            <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                              className={`text-muted transition-transform flex-shrink-0 ${isOpen ? "rotate-180" : ""}`}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          {isOpen && (
                            <div className="px-4 pb-3 border-t border-foreground/15">
                              <p className="text-secondary text-xs leading-relaxed pt-2">
                                {sanitizePlatonicText(getAspectDescription(a, isPlatonic))}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
              );
            })()}
          </>
        )}

        {/* ═══ THEIR CHART TAB (shared by partner and non-partner) ═══ */}
        {personTab === "chart" && (
          <>
            {personPlanets.length > 0 && (
                  <div className="mb-6 relative">
                    <div className="absolute inset-0 bg-terracotta/5 rounded-full blur-2xl" />
                    <ChartWheel planets={personPlanets} houses={selected.unknown_time ? [] : personHouses} />
                  </div>
                )}

                {bt && (
                  <div className="flex flex-wrap justify-center gap-2 mb-4">
                    {[
                      { label: "Sun", sign: bt.sun },
                      { label: "Moon", sign: bt.moon },
                      { label: "Rising", sign: selected.unknown_time ? "" : (bt.rising || "") },
                    ].filter(p => p.sign).map(({ label, sign }) => (
                      <div
                        key={label}
                        className={`px-4 py-2 rounded-full border text-sm font-medium ${elementBg(sign)}`}
                      >
                        <span className="text-muted">{label}</span>
                        <span className="text-muted mx-1.5">&middot;</span>
                        <span className={elementColor(sign)}>{SIGN_NAMES[sign] || SIGN_FULL[sign] || sign}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Share & export */}
                <div className="flex justify-center gap-2 mb-6">
                  <ShareCard
                    type="natal"
                    name={selected.name}
                    subtitle={bt ? (selected.unknown_time
                      ? `${SIGN_FULL[bt.sun] || bt.sun} Sun · ${SIGN_FULL[bt.moon] || bt.moon} Moon`
                      : `${SIGN_FULL[bt.sun] || bt.sun} Sun · ${SIGN_FULL[bt.moon] || bt.moon} Moon · ${SIGN_FULL[bt.rising] || bt.rising} Rising`) : undefined}
                    highlights={selected.planets?.slice(0, 6).map((p: any) => ({
                      label: p.name,
                      value: `${SIGN_FULL[p.sign] || p.sign}`,
                    }))}
                  />
                  <ExportButton
                    type="natal-chart"
                    name={selected.name}
                    bigThree={bt || undefined}
                    planets={selected.planets || undefined}
                    houses={selected.houses as any[] || undefined}
                    aspects={selected.aspects as any[] || undefined}
                    specialPoints={selected.special_points || undefined}
                  />
                </div>

                <div className="rounded-xl border border-foreground/15 bg-card/40 px-4 py-3 mb-6">
                  <div className="flex items-center gap-4 text-xs text-muted">
                    {selected.birth_date && <span>{selected.birth_date}</span>}
                    {selected.birth_time && !selected.unknown_time && <span>{selected.birth_time}</span>}
                    {selected.unknown_time && <span className="text-muted">Time unknown</span>}
                    {selected.city_name && <span>{selected.city_name}</span>}
                  </div>
                  {selected.unknown_time && (
                    <p className="text-[11px] text-muted mt-2 leading-relaxed">
                      Without a birth time, {selected.name.split(" ")[0]}&rsquo;s rising sign, houses, and
                      angles can&rsquo;t be calculated, so they&rsquo;re hidden. Sun, Moon, and planetary
                      signs are still accurate, and connection insights based on them hold up.
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3 mb-6">
                  <div className="flex-1 h-px bg-foreground/10" />
                  <span className="text-terracotta/40 text-lg">{"\u2609"}</span>
                  <div className="flex-1 h-px bg-foreground/10" />
                </div>

                <h2 className="text-xl text-foreground mb-4" style={{ fontFamily: "var(--font-display)" }}>
                  {selected.name}&rsquo;s Placements
                </h2>

                <div className="flex flex-col gap-2 mb-6">
                  {personPlanets.map((planet) => (
                    <PlacementAccordion
                      key={planet.name}
                      planetName={planet.name}
                      planetSymbol={PLANET_SYMBOLS[planet.name] || "?"}
                      sign={planet.sign}
                      position={planet.position}
                      house={selected.unknown_time ? null : planet.house}
                      retrograde={planet.retrograde}
                      isOpen={openPlacement === planet.name}
                      onToggle={() => setOpenPlacement(openPlacement === planet.name ? null : planet.name)}
                    />
                  ))}
                  {/* Rising / Ascendant — only when an accurate birth time is known */}
                  {!selected.unknown_time && bt?.rising && (() => {
                    const ascPt = selected.special_points?.find(sp => sp.name === "Ascendant" || sp.name === "ASC");
                    const risingSign = SIGN_NAMES[bt.rising] || bt.rising;
                    const risingColor = ["Ari","Leo","Sag"].includes(bt.rising) ? "text-terracotta"
                      : ["Tau","Vir","Cap"].includes(bt.rising) ? "text-sage"
                      : ["Gem","Lib","Aqu"].includes(bt.rising) ? "text-amber"
                      : "text-ink";
                    return (
                      <div className="rounded-xl border bg-card/50 border-foreground/15 flex items-center justify-between py-3 px-4">
                        <div className="flex items-center gap-3">
                          <span className={`text-lg ${risingColor}`} style={{ fontFamily: "var(--font-heading)" }}>AC</span>
                          <span className="text-foreground text-sm font-medium">Rising</span>
                        </div>
                        <span className={`text-sm font-medium ${risingColor}`}>
                          {risingSign}
                          <span className="text-muted text-xs ml-2">
                            {ascPt ? `${ascPt.position.toFixed(0)}°` : ""} · 1st House
                          </span>
                        </span>
                      </div>
                    );
                  })()}
                </div>

                {selected.special_points && selected.special_points.length > 0 && (
                  <>
                    <h2 className="text-lg text-foreground mb-3" style={{ fontFamily: "var(--font-display)" }}>
                      Special Points
                    </h2>
                    <div className="flex flex-col gap-2 mb-6">
                      {selected.special_points.map((sp) => (
                        <PlacementAccordion
                          key={sp.name}
                          planetName={sp.name}
                          planetSymbol={PLANET_SYMBOLS[sp.name] || "?"}
                          sign={sp.sign}
                          position={sp.position}
                          house={selected.unknown_time ? null : sp.house}
                          retrograde={sp.retrograde}
                          isOpen={openPlacement === `sp-${sp.name}`}
                          onToggle={() => setOpenPlacement(openPlacement === `sp-${sp.name}` ? null : `sp-${sp.name}`)}
                        />
                      ))}
                    </div>
                  </>
                )}

                {/* ─── Natal Aspects (accordion style) ─── */}
                {selected.aspects && (selected.aspects as { p1Name: string; p2Name: string; aspect: string; orbit: number }[]).length > 0 && (
                  <>
                    <h2 className="text-lg text-foreground mb-3" style={{ fontFamily: "var(--font-display)" }}>
                      Natal Aspects
                    </h2>
                    <div className="flex flex-col gap-2 mb-6">
                      {(selected.aspects as { p1Name: string; p2Name: string; aspect: string; orbit: number }[]).slice(0, 25).map((a, i) => {
                        const uid = `natal-${i}`;
                        const isOpen = openAspect === uid;
                        const nature = ASPECT_NATURE[a.aspect];
                        const dotColor = nature?.nature === "harmonious" ? "bg-sage" : nature?.nature === "challenging" ? "bg-terracotta" : "bg-amber";
                        return (
                          <div key={i} className="rounded-xl border border-foreground/18 bg-card/50 overflow-hidden">
                            <button
                              onClick={() => setOpenAspect(isOpen ? null : uid)}
                              className="w-full flex items-center gap-3 px-4 py-3 text-left"
                            >
                              <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${dotColor}`} />
                              <div className="flex-1 min-w-0">
                                <p className="text-foreground text-sm font-medium">
                                  {a.p1Name} <span className="text-muted">{a.aspect}</span> {a.p2Name}
                                </p>
                                <p className="text-muted text-xs">
                                  {nature?.nature === "harmonious" ? "Harmonious" : nature?.nature === "challenging" ? "Challenging" : "Powerful"}
                                  <span className="ml-1 text-muted">{a.orbit}&deg; orb</span>
                                </p>
                              </div>
                              <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                                className={`text-muted transition-transform flex-shrink-0 ${isOpen ? "rotate-180" : ""}`}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                            {isOpen && (
                              <div className="px-4 pb-3 border-t border-foreground/15">
                                <p className="text-secondary text-xs leading-relaxed pt-2">
                                  {selected.name}&rsquo;s {PLANET_THEMES[a.p1Name] || a.p1Name} {nature?.keyword || "connects with"} their own {PLANET_THEMES[a.p2Name] || a.p2Name}. This is a core part of who they are.
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}

          </>
        )}

        {/* ═══ TRANSITS TAB ═══ */}
        {personTab === "transits" && (
          <>
            {/* Date wheel */}
            <DateWheel
              selectedDate={transitDate}
              onChange={(date) => {
                setTransitDate(date);
                if (selected.planets) fetchTransits(selected, date);
              }}
            />

            {/* Loading */}
            {transitLoading && (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-2 border-terracotta/30 border-t-terracotta rounded-full animate-spin mx-auto mb-3" role="status" aria-label="Loading" />
                <p className="text-muted text-sm">Calculating transits...</p>
              </div>
            )}

            {/* No planets data */}
            {!selected.planets && (
              <div className="text-center py-12">
                <p className="text-muted text-sm">Birth chart data needed to calculate transits.</p>
              </div>
            )}

            {/* Transit results */}
            {transitData && transitPersonId === selected.id && !transitLoading && (
              <>
                <div className="text-center mb-4">
                  <p className="text-muted text-xs">
                    What the sky is activating in {firstName}&rsquo;s chart
                  </p>
                </div>

                {/* Current planet positions */}
                <div className="rounded-xl border border-foreground/15 bg-card/45 px-4 py-4 mb-6">
                  <p className="text-muted text-[10px] uppercase tracking-widest mb-3">Where the planets are right now</p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    {transitData.transitPlanets.filter(p => p.name !== "Moon").map(tp => (
                      <div key={tp.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-muted text-sm w-5 text-center" style={{ fontFamily: "var(--font-heading)" }}>
                            {PLANET_SYMBOLS[tp.name] || ""}
                          </span>
                          <span className="text-secondary text-xs">{tp.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className={`text-xs font-medium ${elementColor(tp.sign)}`}>
                            {SIGN_FULL[tp.sign] || SIGN_NAMES[tp.sign] || tp.sign}
                          </span>
                          {tp.retrograde && (
                            <span className="text-terracotta/60 text-[9px] font-medium px-1 py-0.5 rounded bg-terracotta/10">Rx</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Major transits (outer planets: Pluto, Neptune, Uranus, Saturn, Jupiter) */}
                {(() => {
                  const majorPlanets = ["Pluto", "Neptune", "Uranus", "Saturn", "Jupiter"];
                  const major = transitData.transitAspects
                    .filter(a => majorPlanets.includes(a.transitPlanet))
                    .sort((a, b) => getTransitIntensity(b).score - getTransitIntensity(a).score);
                  const minor = transitData.transitAspects
                    .filter(a => !majorPlanets.includes(a.transitPlanet))
                    .sort((a, b) => getTransitIntensity(b).score - getTransitIntensity(a).score);

                  return (
                    <>
                      {major.length > 0 && (
                        <div className="mb-6">
                          <h2 className="text-foreground text-base font-medium mb-1" style={{ fontFamily: "var(--font-display)" }}>
                            Major transits
                          </h2>
                          <p className="text-muted text-xs mb-3">Slow-moving planets — these themes last weeks to years</p>
                          <div className="flex flex-col gap-3">
                            {major.map((ta, i) => {
                              const uid = `tr-maj-${i}`;
                              const isOpen = openAspect === uid;
                              const nature = ASPECT_NATURE[ta.aspect];
                              const tpInfo = TRANSIT_PLANET_ENERGY[ta.transitPlanet];
                              const dotColor = nature?.nature === "harmonious" ? "bg-sage" : nature?.nature === "challenging" ? "bg-terracotta" : "bg-amber";
                              const manifests = getTransitManifestations(ta);
                              const intensity = getTransitIntensity(ta);

                              return (
                                <div key={i} className="rounded-xl border border-foreground/18 bg-card/50 overflow-hidden">
                                  <button
                                    onClick={() => setOpenAspect(isOpen ? null : uid)}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-left"
                                  >
                                    <div className={`w-3 h-3 rounded-full flex-shrink-0 ${dotColor}`} />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-foreground text-sm font-medium">
                                        {ta.transitPlanet} {ta.aspect} {firstName}&rsquo;s {ta.natalPlanet}
                                      </p>
                                      <div className="flex items-center gap-2 text-xs text-muted">
                                        <span className={nature?.nature === "harmonious" ? "text-sage" : nature?.nature === "challenging" ? "text-terracotta" : "text-amber"}>
                                          {tpInfo?.keyword || "Active"}
                                        </span>
                                        <span>&middot;</span>
                                        <span>{tpInfo?.speed || ""} transit</span>
                                        {ta.transitRetrograde && (
                                          <>
                                            <span>&middot;</span>
                                            <span className="text-terracotta/50">Rx</span>
                                          </>
                                        )}
                                      </div>
                                      {ta.startDate && ta.endDate && (
                                        <p className="text-muted text-[10px] mt-0.5">
                                          {fmtDateRange(ta.startDate, ta.endDate)}
                                          {ta.exactDate && (
                                            <span className="text-muted"> · exact {fmtTransitDate(ta.exactDate)}</span>
                                          )}
                                        </p>
                                      )}
                                      <div className="flex items-center gap-1.5 text-[10px] text-muted mt-0.5">
                                        <span>{intensity.score}/100</span>
                                        <span>&middot;</span>
                                        <span>{ta.orb}&deg; orb</span>
                                        {ta.transitHouse > 0 && (
                                          <>
                                            <span>&middot;</span>
                                            <span>{ordinal(ta.transitHouse)} house — {HOUSE_THEMES[ta.transitHouse]?.area}</span>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                    {/* Intensity badge */}
                                    <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                                      {mapsLoY?.lordPlanet && isLordOfYearTransit(ta.transitPlanet, ta.natalPlanet, mapsLoY.lordPlanet) && (
                                        <span className="text-[8px] uppercase tracking-wider font-bold text-lavender bg-lavender/10 px-1.5 py-0.5 rounded">
                                          Year Ruler
                                        </span>
                                      )}
                                      <span className={`text-[10px] font-medium ${intensity.color}`}>{intensity.label}</span>
                                      <div className="w-12 h-1 rounded-full bg-foreground/8 overflow-hidden">
                                        <div
                                          className={`h-full rounded-full transition-all ${
                                            intensity.score >= 75 ? "bg-terracotta" :
                                            intensity.score >= 55 ? "bg-amber" :
                                            intensity.score >= 38 ? "bg-cream/40" :
                                            "bg-foreground/20"
                                          }`}
                                          style={{ width: `${intensity.score}%` }}
                                        />
                                      </div>
                                    </div>
                                    <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                                      className={`text-muted transition-transform flex-shrink-0 ${isOpen ? "rotate-180" : ""}`}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                    </svg>
                                  </button>
                                  {isOpen && (
                                    <div className="px-4 pb-4 border-t border-foreground/15">
                                      {/* Intensity + House context */}
                                      <div className="flex items-center justify-between mt-3 mb-2">
                                        <div className="flex items-center gap-2">
                                          {ta.transitHouse > 0 && (
                                            <>
                                              <span className="text-ink text-xs font-medium">
                                                {ordinal(ta.transitHouse)} House
                                              </span>
                                              <span className="text-muted text-[10px]">
                                                {HOUSE_THEMES[ta.transitHouse]?.area}
                                              </span>
                                            </>
                                          )}
                                        </div>
                                        <span className="text-muted text-[10px]">{ta.orb}&deg; orb</span>
                                      </div>
                                      {/* Date window */}
                                      {ta.startDate && ta.endDate && (
                                        <div className="flex items-center gap-2 mb-2">
                                          <span className="text-muted text-[10px] uppercase tracking-widest">Active</span>
                                          <span className="text-muted text-xs">{fmtDateRange(ta.startDate, ta.endDate)}</span>
                                          {ta.exactDate && (
                                            <>
                                              <span className="text-muted text-[10px]">&middot;</span>
                                              <span className="text-muted text-xs">Exact {fmtTransitDate(ta.exactDate)}</span>
                                            </>
                                          )}
                                        </div>
                                      )}
                                      {/* Description */}
                                      <p className="text-secondary text-xs leading-relaxed mb-3">
                                        {getTransitDescription(ta)}
                                      </p>
                                      {/* Manifestations */}
                                      {manifests.length > 0 && (
                                        <div>
                                          <p className="text-muted text-[10px] uppercase tracking-widest mb-1.5">Ways this might show up</p>
                                          <div className="flex flex-col gap-1.5">
                                            {manifests.map((m, mi) => (
                                              <div key={mi} className="flex items-start gap-2">
                                                <span className="text-muted text-xs mt-0.5">&bull;</span>
                                                <span className="text-muted text-xs leading-relaxed">{m}</span>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {minor.length > 0 && (
                        <div className="mb-6">
                          <h2 className="text-foreground text-base font-medium mb-1" style={{ fontFamily: "var(--font-display)" }}>
                            Current activations
                          </h2>
                          <p className="text-muted text-xs mb-3">Faster-moving planets — these set the day-to-day tone</p>
                          <div className="flex flex-col gap-2">
                            {minor.slice(0, 15).map((ta, i) => {
                              const uid = `tr-min-${i}`;
                              const isOpen = openAspect === uid;
                              const nature = ASPECT_NATURE[ta.aspect];
                              const tpInfo = TRANSIT_PLANET_ENERGY[ta.transitPlanet];
                              const dotColor = nature?.nature === "harmonious" ? "bg-sage" : nature?.nature === "challenging" ? "bg-terracotta" : "bg-amber";
                              const intensity = getTransitIntensity(ta);
                              const manifests = getTransitManifestations(ta);

                              return (
                                <div key={i} className="rounded-xl border border-foreground/18 bg-card/50 overflow-hidden">
                                  <button
                                    onClick={() => setOpenAspect(isOpen ? null : uid)}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-left"
                                  >
                                    <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${dotColor}`} />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-foreground text-sm font-medium">
                                        {ta.transitPlanet} {ta.aspect} {ta.natalPlanet}
                                      </p>
                                      <div className="flex items-center gap-2 text-xs text-muted">
                                        <span>{tpInfo?.keyword || "Active"}</span>
                                        {ta.transitRetrograde && <span className="text-terracotta/50">Rx</span>}
                                      </div>
                                      {ta.startDate && ta.endDate && (
                                        <p className="text-muted text-[10px] mt-0.5">
                                          {fmtDateRange(ta.startDate, ta.endDate)}
                                          {ta.exactDate && (
                                            <span className="text-muted"> · exact {fmtTransitDate(ta.exactDate)}</span>
                                          )}
                                        </p>
                                      )}
                                      <div className="flex items-center gap-1.5 text-[10px] text-muted mt-0.5">
                                        <span>{intensity.score}/100</span>
                                        <span>&middot;</span>
                                        <span>{ta.orb}&deg; orb</span>
                                        {ta.transitHouse > 0 && (
                                          <>
                                            <span>&middot;</span>
                                            <span>{ordinal(ta.transitHouse)} house</span>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                    {/* Intensity badge */}
                                    <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                                      <span className={`text-[10px] ${intensity.color}`}>{intensity.label}</span>
                                      <div className="w-10 h-0.5 rounded-full bg-foreground/8 overflow-hidden">
                                        <div
                                          className={`h-full rounded-full ${
                                            intensity.score >= 75 ? "bg-terracotta" :
                                            intensity.score >= 55 ? "bg-amber" :
                                            intensity.score >= 38 ? "bg-cream/40" :
                                            "bg-foreground/20"
                                          }`}
                                          style={{ width: `${intensity.score}%` }}
                                        />
                                      </div>
                                    </div>
                                    <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                                      className={`text-muted transition-transform flex-shrink-0 ${isOpen ? "rotate-180" : ""}`}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                    </svg>
                                  </button>
                                  {isOpen && (
                                    <div className="px-4 pb-3 border-t border-foreground/15">
                                      <div className="flex items-center justify-between mt-2 mb-1.5">
                                        <div className="flex items-center gap-2">
                                          {ta.transitHouse > 0 && (
                                            <>
                                              <span className="text-ink text-xs font-medium">
                                                {ordinal(ta.transitHouse)} House
                                              </span>
                                              <span className="text-muted text-[10px]">
                                                {HOUSE_THEMES[ta.transitHouse]?.area}
                                              </span>
                                            </>
                                          )}
                                        </div>
                                        <span className="text-muted text-[10px]">{ta.orb}&deg; orb</span>
                                      </div>
                                      {ta.startDate && ta.endDate && (
                                        <div className="flex items-center gap-2 mt-1 mb-1">
                                          <span className="text-muted text-[10px]">
                                            {fmtDateRange(ta.startDate, ta.endDate)}
                                            {ta.exactDate && <span className="text-muted"> · exact {fmtTransitDate(ta.exactDate)}</span>}
                                          </span>
                                        </div>
                                      )}
                                      <p className="text-secondary text-xs leading-relaxed pt-1">
                                        {getTransitDescription(ta)}
                                      </p>
                                      {manifests.length > 0 && (
                                        <div className="mt-2">
                                          <p className="text-muted text-[10px] uppercase tracking-widest mb-1">Ways this might show up</p>
                                          <div className="flex flex-col gap-1">
                                            {manifests.map((m, mi) => (
                                              <div key={mi} className="flex items-start gap-2">
                                                <span className="text-muted text-xs mt-0.5">&bull;</span>
                                                <span className="text-muted text-xs leading-relaxed">{m}</span>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {major.length === 0 && minor.length === 0 && (
                        <div className="text-center py-8">
                          <p className="text-muted text-sm">No significant transits to their chart right now.</p>
                          <p className="text-muted text-xs mt-1">This is a relatively quiet period astrologically.</p>
                        </div>
                      )}
                    </>
                  );
                })()}

                <div className="rounded-xl border border-foreground/15 bg-card/40 px-4 py-3">
                  <p className="text-muted text-xs leading-relaxed">
                    Transits show where today&rsquo;s planets are activating {firstName}&rsquo;s birth chart. Major transits (Jupiter through Pluto) shape long-term themes, while inner planet transits (Sun through Mars) set the daily tone. The house tells you which life area is being activated.
                  </p>
                </div>
              </>
            )}
          </>
        )}

        {/* ═══ COMPOSITE CHART TAB ═══ */}
        {personTab === "composite" && (
          <>
            {compositeLoading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-6 h-6 border-2 border-terracotta/30 border-t-terracotta rounded-full animate-spin mb-3" role="status" aria-label="Loading" />
                <p className="text-muted text-xs">Calculating your composite chart...</p>
              </div>
            ) : !selected.planets || !userChart?.planets ? (
              <div className="text-center py-12">
                <p className="text-muted text-sm">Both charts need full birth data</p>
                <p className="text-muted text-xs mt-1">Add complete birth details to see the composite chart.</p>
              </div>
            ) : compositeData && compositePersonId === selected.id ? (
              (() => {
                const relSummary = generateRelationshipSummary(compositeData, selected.category as "partner" | "family" | "friend", selected.name);
                // Backstop: scrub any residual romantic language from composite copy for family/friend.
                if (selected.category === "family" || selected.category === "friend") {
                  relSummary.title = toPlatonic(relSummary.title);
                  relSummary.themes = relSummary.themes.map((t) => ({ ...t, heading: toPlatonic(t.heading), body: toPlatonic(t.body) }));
                }
                return (
                  <>
                    {/* Header */}
                    <div className="rounded-xl border border-gold/15 bg-gold/5 px-4 py-3 mb-5">
                      <div className="flex items-center gap-2 mb-1">
                        <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-60">
                          <circle cx="9" cy="9" r="7" />
                          <circle cx="15" cy="15" r="7" />
                        </svg>
                        <span className="text-gold/80 text-xs font-medium">{relSummary.title}</span>
                      </div>
                      <p className="text-muted text-xs leading-relaxed">
                        The composite chart is the midpoint of both your charts — it represents the relationship itself as its own entity.
                      </p>
                    </div>

                    {/* Composite big three */}
                    <div className="flex items-center justify-center gap-3 mb-5">
                      {[
                        { label: "Core", sign: compositeData.bigThree?.sun, sub: "Sun" },
                        { label: "Emotional", sign: compositeData.bigThree?.moon, sub: "Moon" },
                        { label: "Vibe", sign: compositeData.bigThree?.rising, sub: "Rising" },
                      ].map((item) => (
                        <div key={item.label} className="flex-1 text-center py-2.5 rounded-xl border border-foreground/15 bg-card/40">
                          <p className="text-foreground text-sm font-medium">{item.sign || "—"}</p>
                          <p className="text-muted text-[10px] uppercase tracking-widest mt-0.5">{item.label}</p>
                          <p className="text-muted text-[9px]">{item.sub}</p>
                        </div>
                      ))}
                    </div>

                    {/* Share & export */}
                    <div className="flex justify-center gap-2 mb-5">
                      <ShareCard
                        type="composite"
                        name="You"
                        name2={firstName}
                        theme={relSummary.title}
                        subtitle={compositeData.bigThree ? `${compositeData.bigThree.sun || "?"} Sun · ${compositeData.bigThree.moon || "?"} Moon · ${compositeData.bigThree.rising || "?"} Rising` : undefined}
                        highlights={[
                          { label: "Core", value: compositeData.bigThree?.sun || "?" },
                          { label: "Emotional", value: compositeData.bigThree?.moon || "?" },
                          { label: "Vibe", value: compositeData.bigThree?.rising || "?" },
                        ]}
                      />
                      <ExportButton
                        type="composite"
                        name="You"
                        name2={firstName}
                        bigThree={compositeData.bigThree}
                        planets={compositeData.planets}
                        houses={compositeData.houses}
                        aspects={compositeData.aspects}
                        specialPoints={compositeData.specialPoints}
                      />
                    </div>

                    {/* ── Relationship Insight Cards ── */}
                    <div className="space-y-4 mb-6">
                      {relSummary.themes.map((theme, idx) => (
                        <div key={idx} className="rounded-xl border border-foreground/15 bg-card/35 px-4 py-4">
                          <h3
                            className="text-foreground text-sm font-medium mb-2"
                            style={{ fontFamily: "var(--font-display)" }}
                          >
                            {theme.heading}
                          </h3>
                          <p className="text-muted text-xs leading-relaxed">{theme.body}</p>
                        </div>
                      ))}
                    </div>

                    {/* ── Raw Data (collapsed) ── */}
                    <details className="mb-4">
                      <summary className="text-muted text-[10px] uppercase tracking-widest cursor-pointer hover:text-foreground transition-colors py-2">
                        Composite Placements
                      </summary>
                      <div className="space-y-1.5 mt-3">
                        {(compositeData.planets || []).map((planet: any) => (
                          <div
                            key={planet.name}
                            className="flex items-center justify-between px-4 py-2.5 rounded-xl border border-foreground/15 bg-card/35"
                          >
                            <span className="text-foreground text-sm">{planet.name}</span>
                            <div className="text-right">
                              <span className="text-secondary text-sm">{planet.sign}</span>
                              <span className="text-muted text-[10px] ml-1.5">{planet.position?.toFixed(1)}&deg;</span>
                              {planet.house && (
                                <span className="text-muted text-[10px] ml-1.5">H{planet.house}</span>
                              )}
                            </div>
                          </div>
                        ))}
                        {compositeData.specialPoints && (compositeData.specialPoints as any[]).map((sp: any) => (
                          <div key={sp.name} className="flex items-center justify-between px-4 py-2.5 rounded-xl border border-foreground/15 bg-card/35">
                            <span className="text-foreground text-sm">{sp.name}</span>
                            <div className="text-right">
                              <span className="text-secondary text-sm">{sp.sign}</span>
                              <span className="text-muted text-[10px] ml-1.5">{sp.position?.toFixed(1)}&deg;</span>
                              {sp.house && <span className="text-muted text-[10px] ml-1.5">H{sp.house}</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </details>

                    <details className="mb-4">
                      <summary className="text-muted text-[10px] uppercase tracking-widest cursor-pointer hover:text-foreground transition-colors py-2">
                        House Cusps
                      </summary>
                      <div className="grid grid-cols-3 gap-1.5 mt-3">
                        {(compositeData.houses || []).map((house: any) => (
                          <div key={house.number} className="text-center py-2 rounded-lg border border-foreground/15 bg-card/30">
                            <p className="text-muted text-[9px] uppercase tracking-widest">House {house.number}</p>
                            <p className="text-muted text-xs mt-0.5">{house.sign} {house.position?.toFixed(0)}&deg;</p>
                          </div>
                        ))}
                      </div>
                    </details>

                    {compositeData.aspects && compositeData.aspects.length > 0 && (
                      <details className="mb-4">
                        <summary className="text-muted text-[10px] uppercase tracking-widest cursor-pointer hover:text-foreground transition-colors py-2">
                          Composite Aspects
                        </summary>
                        <div className="space-y-1 mt-3">
                          {(compositeData.aspects as any[]).slice(0, 15).map((asp: any, i: number) => {
                            const aspectSymbols: Record<string, string> = {
                              conjunction: "\u260C", opposition: "\u260D", trine: "\u25B3",
                              square: "\u25A1", sextile: "\u2731", quincunx: "Qx",
                            };
                            const sym = aspectSymbols[asp.aspect?.toLowerCase()] || asp.aspect;
                            const isHard = ["square", "opposition"].includes(asp.aspect?.toLowerCase());
                            const isSoft = ["trine", "sextile"].includes(asp.aspect?.toLowerCase());
                            return (
                              <div key={i} className={`flex items-center justify-between px-3 py-2 rounded-lg border bg-card/30 ${
                                isHard ? "border-red-400/10" : isSoft ? "border-green-400/10" : "border-foreground/15"
                              }`}>
                                <span className="text-muted text-xs">
                                  {asp.p1Name} {sym} {asp.p2Name}
                                </span>
                                <span className="text-muted text-[10px]">{asp.orbit?.toFixed(1)}&deg;</span>
                              </div>
                            );
                          })}
                        </div>
                      </details>
                    )}
                  </>
                );
              })()

            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <button
                  onClick={() => fetchComposite(selected)}
                  className="px-5 py-2.5 rounded-xl bg-terracotta/15 border border-terracotta/20 text-terracotta text-sm hover:bg-terracotta/25 transition-colors active:scale-[0.98]"
                >
                  Calculate Composite Chart
                </button>
                <p className="text-muted text-xs mt-3 text-center max-w-[260px]">
                  See the chart that represents your relationship with {firstName} as its own entity
                </p>
              </div>
            )}
          </>
        )}

        {/* ═══ SOLAR RETURN TAB ═══ */}
        {personTab === "solar" && (
          <>
            {solarReturnLoading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-6 h-6 border-2 border-terracotta/30 border-t-terracotta rounded-full animate-spin mb-3" role="status" aria-label="Loading" />
                <p className="text-muted text-xs">Calculating solar return...</p>
              </div>
            ) : !selected.planets ? (
              <div className="text-center py-12">
                <p className="text-muted text-sm">No birth data available</p>
                <p className="text-muted text-xs mt-1">Add full birth details to see their solar return chart.</p>
              </div>
            ) : solarReturnData && solarReturnPersonId === selected.id ? (
              (() => {
                const yearSummary = generateYearSummary(solarReturnData);
                return (
                  <>
                    {/* Year picker */}
                    <div className="flex items-center justify-center gap-3 mb-5">
                      <button
                        onClick={() => { const y = solarReturnYear - 1; setSolarReturnYear(y); fetchSolarReturn(selected, y); }}
                        className="w-8 h-8 rounded-lg border border-foreground/18 flex items-center justify-center text-muted hover:text-foreground transition-colors active:scale-95"
                      >
                        <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
                      </button>
                      <div className="text-center">
                        <span className="text-foreground text-lg font-medium" style={{ fontFamily: "var(--font-display)" }}>{solarReturnYear}</span>
                        <p className="text-muted text-[10px] uppercase tracking-widest">solar return</p>
                      </div>
                      <button
                        onClick={() => { const y = solarReturnYear + 1; setSolarReturnYear(y); fetchSolarReturn(selected, y); }}
                        className="w-8 h-8 rounded-lg border border-foreground/18 flex items-center justify-center text-muted hover:text-foreground transition-colors active:scale-95"
                      >
                        <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
                      </button>
                    </div>

                    {/* Return date */}
                    <div className="rounded-xl border border-gold/15 bg-gold/5 px-4 py-3 mb-5">
                      <div className="flex items-center gap-2 mb-1">
                        <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-60">
                          <circle cx="12" cy="12" r="5" />
                          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                        </svg>
                        <span className="text-gold/80 text-xs font-medium">{firstName}&rsquo;s Sun returns on</span>
                      </div>
                      <p className="text-foreground text-sm">
                        {(() => {
                          const d = new Date(solarReturnData.returnDate + "T12:00:00");
                          const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                          const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                          return `${dayNames[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()} at ${solarReturnData.returnTime}`;
                        })()}
                      </p>
                    </div>

                    {/* Big three badges */}
                    <div className="flex items-center justify-center gap-3 mb-5">
                      {[
                        { label: "SR Sun", sign: solarReturnData.bigThree?.sun },
                        { label: "SR Moon", sign: solarReturnData.bigThree?.moon },
                        { label: "SR Rising", sign: solarReturnData.bigThree?.rising },
                      ].map((item) => (
                        <div key={item.label} className="flex-1 text-center py-2.5 rounded-xl border border-foreground/15 bg-card/40">
                          <p className="text-foreground text-sm font-medium">{item.sign}</p>
                          <p className="text-muted text-[10px] uppercase tracking-widest mt-0.5">{item.label}</p>
                        </div>
                      ))}
                    </div>

                    {/* Share & Export */}
                    <div className="flex justify-center gap-2 mb-5">
                      <ShareCard
                        type="solar"
                        name={firstName}
                        theme={yearSummary.title}
                        subtitle={solarReturnData.bigThree ? `SR Sun ${solarReturnData.bigThree.sun} · SR Moon ${solarReturnData.bigThree.moon} · SR Rising ${solarReturnData.bigThree.rising}` : undefined}
                        highlights={[
                          { label: "SR Sun", value: solarReturnData.bigThree?.sun || "?" },
                          { label: "SR Moon", value: solarReturnData.bigThree?.moon || "?" },
                          { label: "SR Rising", value: solarReturnData.bigThree?.rising || "?" },
                        ]}
                      />
                      <ExportButton
                        type="solar-return"
                        name={selected.name}
                        bigThree={solarReturnData.bigThree}
                        planets={solarReturnData.planets}
                        houses={solarReturnData.houses}
                        aspects={solarReturnData.aspects}
                        specialPoints={solarReturnData.specialPoints}
                        meta={{ year: String(solarReturnYear), returnDate: solarReturnData.returnDate || "", returnTime: solarReturnData.returnTime || "" }}
                      />
                    </div>

                    {/* ── Year Ahead Themes (the main content) ── */}
                    <h3 className="text-secondary text-[10px] uppercase tracking-widest mb-3">{firstName}&rsquo;s Year Ahead</h3>
                    <div className="space-y-3 mb-6">
                      {yearSummary.themes.map((theme, i) => (
                        <div key={i} className="rounded-xl border border-foreground/15 bg-surface/25 px-4 py-3.5">
                          <p className="text-foreground text-sm font-medium mb-1.5" style={{ fontFamily: "var(--font-display)" }}>
                            {theme.heading}
                          </p>
                          <p className="text-muted text-xs leading-relaxed">
                            {theme.body}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* ── Collapsible: Placements detail ── */}
                    <details className="group mb-4">
                      <summary className="flex items-center justify-between cursor-pointer py-2 text-muted text-[10px] uppercase tracking-widest hover:text-foreground transition-colors">
                        <span>All placements</span>
                        <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition-transform group-open:rotate-180">
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </summary>
                      <div className="space-y-1.5 mt-2">
                        {(solarReturnData.planets || []).map((planet: any) => (
                          <div key={planet.name} className="flex items-center justify-between px-4 py-2.5 rounded-xl border border-foreground/15 bg-card/35">
                            <div className="flex items-center gap-2.5">
                              <span className="text-foreground text-sm">{planet.name}</span>
                              {planet.retrograde && <span className="text-red-400/50 text-[9px] font-medium">Rx</span>}
                            </div>
                            <div className="text-right">
                              <span className="text-secondary text-sm">{planet.sign}</span>
                              <span className="text-muted text-[10px] ml-1.5">{planet.position?.toFixed(1)}&deg;</span>
                              {planet.house && <span className="text-muted text-[10px] ml-1.5">H{planet.house}</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </details>

                    {/* ── Collapsible: Houses ── */}
                    <details className="group mb-4">
                      <summary className="flex items-center justify-between cursor-pointer py-2 text-muted text-[10px] uppercase tracking-widest hover:text-foreground transition-colors">
                        <span>House cusps</span>
                        <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition-transform group-open:rotate-180">
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </summary>
                      <div className="grid grid-cols-3 gap-1.5 mt-2">
                        {(solarReturnData.houses || []).map((house: any) => (
                          <div key={house.number} className="text-center py-2 rounded-lg border border-foreground/15 bg-card/30">
                            <p className="text-muted text-[9px] uppercase tracking-widest">House {house.number}</p>
                            <p className="text-muted text-xs mt-0.5">{house.sign} {house.position?.toFixed(0)}&deg;</p>
                          </div>
                        ))}
                      </div>
                    </details>

                    {/* ── Collapsible: Aspects ── */}
                    {solarReturnData.aspects && solarReturnData.aspects.length > 0 && (
                      <details className="group mb-4">
                        <summary className="flex items-center justify-between cursor-pointer py-2 text-muted text-[10px] uppercase tracking-widest hover:text-foreground transition-colors">
                          <span>Aspects</span>
                          <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition-transform group-open:rotate-180">
                            <polyline points="6 9 12 15 18 9" />
                          </svg>
                        </summary>
                        <div className="space-y-1 mt-2">
                          {(solarReturnData.aspects as any[]).slice(0, 15).map((asp: any, i: number) => {
                            const aspectSymbols: Record<string, string> = { conjunction: "\u260C", opposition: "\u260D", trine: "\u25B3", square: "\u25A1", sextile: "\u2731", quincunx: "Qx" };
                            const sym = aspectSymbols[asp.aspect?.toLowerCase()] || asp.aspect;
                            return (
                              <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg border border-foreground/15 bg-card/30">
                                <span className="text-muted text-xs">{asp.p1Name} {sym} {asp.p2Name}</span>
                                <span className="text-muted text-[10px]">{asp.orbit?.toFixed(1)}&deg;</span>
                              </div>
                            );
                          })}
                        </div>
                      </details>
                    )}
                  </>
                );
              })()
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <button
                  onClick={() => fetchSolarReturn(selected)}
                  className="px-5 py-2.5 rounded-xl bg-terracotta/15 border border-terracotta/20 text-terracotta text-sm hover:bg-terracotta/25 transition-colors active:scale-[0.98]"
                >
                  Calculate Solar Return
                </button>
                <p className="text-muted text-xs mt-3 text-center max-w-[260px]">
                  See {firstName}&rsquo;s year-ahead themes based on when the Sun returns to their natal degree
                </p>
              </div>
            )}
          </>
        )}

        <div className="h-8" />

        {/* Edit modal (must be inside this return block) */}
        {showAddForm && (
          <div className="fixed inset-0 z-50 flex items-end justify-center backdrop-blur-sm" style={{ backgroundColor: "var(--modal-overlay)" }}
            onClick={(e) => { if (e.target === e.currentTarget) { setShowAddForm(false); setEditingConnectionId(null); } }}>
            <div className="w-full max-w-lg max-h-[85vh] rounded-t-2xl border border-foreground/18 bg-background animate-slide-up flex flex-col">
              <div className="flex items-center justify-between p-5 pb-2 flex-shrink-0">
                <h3 className="text-lg text-foreground" style={{ fontFamily: "var(--font-display)" }}>
                  {editingConnectionId ? "Edit info" : "Add a person"}
                </h3>
                <button onClick={() => { setShowAddForm(false); setEditingConnectionId(null); }} aria-label="Close" className="min-w-[44px] min-h-[44px] flex items-center justify-center text-muted hover:text-foreground transition-colors">
                  <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex flex-col gap-3 px-5 pb-6 overflow-y-auto">
                <input type="text" value={formName} onChange={(e) => setFormName(e.target.value)}
                  placeholder="Their name" aria-label="Their name" className={inputClass} />
                <select value={formRelationship} onChange={(e) => setFormRelationship(e.target.value)}
                  aria-label="Relationship type"
                  className={`${inputClass} ${!formRelationship ? "text-muted" : ""}`}>
                  <option value="" disabled>Relationship</option>
                  {filteredRelationships.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
                <input type="date" value={formBirthDate} onChange={(e) => setFormBirthDate(e.target.value)}
                  aria-label="Their birth date" className={inputClass} />
                {!formUnknownTime && (
                  <input type="time" value={formBirthTime} onChange={(e) => setFormBirthTime(e.target.value)}
                    aria-label="Their birth time" className={inputClass} />
                )}
                <label className="flex items-center gap-2 text-muted text-xs">
                  <input type="checkbox" checked={formUnknownTime}
                    onChange={(e) => setFormUnknownTime(e.target.checked)}
                    aria-label="Birth time unknown"
                    className="rounded border-foreground/20" />
                  Birth time unknown
                </label>
                <CitySearch
                  value={formCity}
                  onChange={(val) => { setFormCity(val); if (!val) { setFormLat(null); setFormLng(null); } }}
                  onSelect={(loc: LocationResult) => {
                    setFormCity(loc.display_name);
                    setFormLat(parseFloat(loc.lat));
                    setFormLng(parseFloat(loc.lon));
                  }}
                />
                {formError && <p className="text-terracotta text-xs">{formError}</p>}
                <button onClick={editingConnectionId ? handleEditPerson : handleAddPerson} disabled={isSubmitting}
                  className="px-6 py-3 rounded-full bg-terracotta text-cream font-semibold text-sm tracking-wide hover:bg-terracotta-light active:scale-[0.98] transition-all disabled:opacity-50 mt-2">
                  {isSubmitting
                    ? (editingConnectionId ? "Updating chart..." : "Calculating their chart...")
                    : (editingConnectionId ? "Save changes" : "Add to map")}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
      </DetailErrorBoundary>
    );
  }

  // ─── Family Analysis view ───
  if (familyAnalysis) {
    return (
      <main className="flex-1 flex flex-col px-5 py-6 max-w-lg mx-auto w-full overflow-y-auto">
        <button
          onClick={() => setFamilyAnalysis(null)}
          className="flex items-center gap-2 text-muted text-sm mb-6 active:text-secondary"
        >
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to your map
        </button>

        <div className="text-center mb-8">
          <h1 className="text-2xl text-foreground mb-2" style={{ fontFamily: "var(--font-display)" }}>
            Family Analysis
          </h1>
          <p className="text-muted text-sm">
            How your family&rsquo;s charts shaped who you are.
          </p>
        </div>

        {/* Parent Profiles */}
        {familyAnalysis.parentProfiles.map((parent, pi) => (
          <div key={pi} className="mb-8">
            {/* Parent header */}
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-lg text-foreground" style={{ fontFamily: "var(--font-display)" }}>
                {parent.name}
              </h2>
              <span className="text-muted text-xs">{parent.role}</span>
            </div>
            <p className="text-muted text-xs mb-4">{parent.bigThree}</p>

            {/* Their shadows */}
            {parent.shadows.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-muted text-xs uppercase tracking-widest">Their patterns</p>
                  <InfoTip
                    term="Shadow Patterns"
                    explanation="These are your parent's hardwired tendencies — their conflict style, fears, and emotional coping. You absorbed these growing up whether you wanted to or not."
                  />
                </div>
                <div className="flex flex-col gap-2">
                  {parent.shadows.map((s, si) => (
                    <div key={si} className="rounded-lg border border-terracotta/10 bg-terracotta/5 px-3 py-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-terracotta text-sm font-medium">{s.label}</span>
                        <span className="text-muted text-[10px]">{s.planet}</span>
                      </div>
                      <p className="text-secondary text-xs leading-relaxed">{s.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* What they gave you */}
            {parent.gifts.length > 0 && (
              <div className="mb-4">
                <p className="text-muted text-xs uppercase tracking-widest mb-2">What they gave you</p>
                <div className="flex flex-col gap-2">
                  {parent.gifts.map((g, gi) => (
                    <div key={gi} className="rounded-lg border border-sage/10 bg-sage/5 px-3 py-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sage text-sm font-medium">{g.label}</span>
                        <span className="text-muted text-[10px]">{g.planet}</span>
                      </div>
                      <p className="text-secondary text-xs leading-relaxed">{g.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Friction with you */}
            {parent.frictionWithYou.length > 0 && (
              <div className="mb-4">
                <p className="text-muted text-xs uppercase tracking-widest mb-2">Where you clash</p>
                <div className="flex flex-col gap-2">
                  {parent.frictionWithYou.map((f, fi) => (
                    <div key={fi} className="rounded-lg border border-terracotta/10 bg-terracotta/5 px-3 py-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-terracotta/80 text-sm font-medium">{f.label}</span>
                        <span className="text-muted text-[10px]">{f.source}</span>
                      </div>
                      <p className="text-secondary text-xs leading-relaxed">{f.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Harmony with you */}
            {parent.harmonyWithYou.length > 0 && (
              <div className="mb-4">
                <p className="text-muted text-xs uppercase tracking-widest mb-2">Where you connect</p>
                <div className="flex flex-col gap-2">
                  {parent.harmonyWithYou.map((h, hi) => (
                    <div key={hi} className="rounded-lg border border-sage/10 bg-sage/5 px-3 py-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sage/80 text-sm font-medium">{h.label}</span>
                        <span className="text-muted text-[10px]">{h.source}</span>
                      </div>
                      <p className="text-secondary text-xs leading-relaxed">{h.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Divider between parents */}
            {pi < familyAnalysis.parentProfiles.length - 1 && (
              <div className="border-t border-foreground/15 mt-6 mb-2" />
            )}
          </div>
        ))}

        {/* Sibling Notes */}
        {familyAnalysis.siblingNotes.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg text-foreground mb-3" style={{ fontFamily: "var(--font-display)" }}>
              Sibling dynamics
            </h2>
            <div className="flex flex-col gap-3">
              {familyAnalysis.siblingNotes.map((sn, si) => (
                <div key={si} className="rounded-xl border border-foreground/15 bg-card/45 px-4 py-4">
                  <p className="text-foreground text-sm font-medium mb-1">{sn.trait}</p>
                  <p className="text-muted text-xs mb-2">{sn.source}</p>
                  <p className="text-secondary text-sm leading-relaxed">{sn.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {familyAnalysis.parentProfiles.length === 0 && familyAnalysis.siblingNotes.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted text-sm">
              Add your parents and siblings to unlock family analysis.
            </p>
          </div>
        )}

        <div className="h-8" />
      </main>
    );
  }

  // ─── City handlers ───
  function handleCitySubmit() {
    if (!cityLat || !cityLng) return;

    // Save to localStorage (scoped per user)
    if (userId) {
      try {
        localStorage.setItem(`mapped:city:${userId}`, JSON.stringify({
          name: cityName, date: cityDate, lat: cityLat, lng: cityLng,
        }));
      } catch { /* ignore */ }
    }

    setShowCityPicker(false);

    // If already in astro view, recalculate with new city location
    if (showAstroMap) {
      setAstroLines(null);
      setAstroNearby(null);
      // The useEffect watching showAstroMap won't re-fire since it's already true
      // So we trigger it by toggling off then on
      setShowAstroMap(false);
      setTimeout(() => setShowAstroMap(true), 50);
    }
  }



  // ─── Birth Time Placeholder for Astrocartography ───
  if (showBirthTimePlaceholder) {
    return (
      <div className="flex flex-col h-full bg-background">
        <div className="flex items-center gap-3 px-5 pt-5 pb-3">
          <button onClick={() => setShowBirthTimePlaceholder(false)} aria-label="Go back" className="min-w-[44px] min-h-[44px] flex items-center justify-center text-muted hover:text-foreground transition-colors">
            <svg aria-hidden="true" width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M13 4L7 10L13 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
          </button>
          <h2 className="text-base font-semibold text-foreground">Astrocartography</h2>
        </div>
        <div className="px-5 py-8">
          <TierBPlaceholder feature="astrocartography" showRectification={true} showSkip onSkip={() => setShowBirthTimePlaceholder(false)} />
        </div>
      </div>
    );
  }

  // ─── Astrocartography View (main city experience) ───
  if (showAstroMap && userChart) {
    const svgW = 800;
    const svgH = 500;
    const projX = (lng: number) => ((lng + 180) / 360) * svgW;
    const projY = (lat: number) => ((90 - lat) / 180) * svgH;
    const planetSet = new Set((astroLines || []).map(l => l.planet));
    const planetList = Array.from(planetSet);

    // City rankings based on astrocartography line proximity
    const scores = astroLines ? scoreCitiesAstro(astroLines, countryFilter) : [];
    const activeArea = LIFE_AREAS.find(a => a.id === selectedLifeArea) || LIFE_AREAS[0];
    // Sort by closest relevant line (strength badge order), then by area score as tiebreaker
    const topForArea = scores
      .filter(s => (s.scores[selectedLifeArea] || 0) > 0)
      .map(s => {
        const areaRelevant = s.nearbyLines.filter(nl =>
          activeArea.relevantLines.some(rl => rl.planet === nl.planet && rl.angle === nl.angle)
        );
        const closestDist = areaRelevant.length > 0 ? Math.min(...areaRelevant.map(l => l.dist)) : 999;
        return { ...s, closestDist };
      })
      .sort((a, b) => a.closestDist - b.closestDist || (b.scores[selectedLifeArea] || 0) - (a.scores[selectedLifeArea] || 0))
      .slice(0, 10);

    // Filter lines for the selected life area
    const relevantLineSet = new Set(activeArea.relevantLines.map(l => `${l.planet}|${l.angle}`));
    const filteredLines = (astroLines || []).filter(l => relevantLineSet.has(`${l.planet}|${l.angle}`));
    const allLines = astroLines || [];

    return (
      <main className="flex-1 flex flex-col px-5 py-6 max-w-lg mx-auto w-full overflow-y-auto">
        <button
          onClick={() => { setShowAstroMap(false); setAstroLines(null); setAstroNearby(null); setAstroParans([]); setAdvancedMode(false); }}
          className="flex items-center gap-2 text-muted text-sm mb-6 active:text-secondary"
        >
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to your map
        </button>

        <div className="text-center mb-6">
          <h1 className="text-2xl text-foreground mb-1" style={{ fontFamily: "var(--font-display)" }}>
            Your Map
          </h1>
          <p className="text-muted text-sm">
            {advancedMode ? "All your planetary lines, crossings, and details" : "Where your planetary energy lands on Earth"}
          </p>
          {cityName && (
            <div className="flex items-center justify-center gap-2 mt-2">
              <span className="text-ink text-xs">
                Viewing from {cityName.split(",")[0]}
              </span>
              <button
                onClick={() => setShowCityPicker(true)}
                className="text-muted text-xs underline underline-offset-2 hover:text-foreground transition-colors"
              >
                change
              </button>
            </div>
          )}
          {!cityName && (
            <button
              onClick={() => setShowCityPicker(true)}
              className="mt-2 text-ink text-xs underline underline-offset-2 hover:text-ink/70 transition-colors"
            >
              Set your city to see nearby lines
            </button>
          )}
        </div>

        {/* Advanced / Simple toggle — right below the header */}
        {astroLines && (
          <div className="flex items-center justify-center gap-2 mb-5">
            <button
              onClick={() => { setAdvancedMode(false); setExpandedParan(null); setHoveredLine(null); setMapZoom(1); setMapPan({ x: 0, y: 0 }); }}
              className={`text-xs px-3 py-1 rounded-full transition-all ${
                !advancedMode
                  ? "bg-foreground/10 text-foreground font-medium"
                  : "bg-foreground/3 text-muted"
              }`}
            >
              Life Areas
            </button>
            <button
              onClick={() => { setAdvancedMode(true); setExpandedCity(null); }}
              className={`text-xs px-3 py-1 rounded-full transition-all ${
                advancedMode
                  ? "bg-foreground/10 text-foreground font-medium"
                  : "bg-foreground/3 text-muted"
              }`}
            >
              Full Chart
            </button>
          </div>
        )}

        {/* ─── No birth data ─── */}
        {!astroLoading && !astroLines && !astroError && !userChart.birthDate && (
          <div className="text-center py-12">
            <p className="text-muted text-sm mb-2">Birth date and time needed</p>
            <p className="text-muted text-xs">Astrocartography requires your exact birth data. Try recalculating your chart first.</p>
          </div>
        )}

        {/* ─── Server-side calculation unavailable ─── */}
        {!astroLoading && astroError && (
          <div className="text-center py-12 px-4">
            <p className="text-muted text-base mb-2" style={{ fontFamily: "var(--font-display)" }}>Something went wrong</p>
            <p className="text-muted text-sm leading-relaxed">
              We couldn&apos;t load your astrocartography map right now. Please check your birth details and try again.
              If the problem continues, try signing out and back in.
            </p>
          </div>
        )}

        {/* ─── Loading ─── */}
        {astroLoading && (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-ink/30 border-t-ink rounded-full animate-spin mx-auto mb-3" role="status" aria-label="Loading" />
            <p className="text-muted text-sm">Calculating planetary lines...</p>
            <p className="text-muted text-xs mt-1">This takes a moment</p>
          </div>
        )}

        {astroLines && (
          <>
            {/* ─── SVG World Map (zoomable & pannable) ─── */}
            <div
              ref={mapRefCallback}
              className="rounded-xl border border-foreground/18 bg-card/45 overflow-hidden mb-1 select-none relative cursor-grab"
              onPointerDown={(e) => {
                dragRef.current = { dragging: true, startX: e.clientX, startY: e.clientY, panX: mapPan.x, panY: mapPan.y };
                (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
                setHoveredLine(null);
              }}
              onPointerMove={(e) => {
                if (!dragRef.current.dragging) return;
                const dx = (e.clientX - dragRef.current.startX) / mapZoom;
                const dy = (e.clientY - dragRef.current.startY) / mapZoom;
                const sc = svgW / ((e.currentTarget as HTMLElement).clientWidth || svgW);
                const vw = svgW / mapZoom, vh = svgH / mapZoom;
                const nx = Math.max(0, Math.min(svgW - vw, dragRef.current.panX - dx * sc));
                const ny = Math.max(0, Math.min(svgH - vh, dragRef.current.panY - dy * sc));
                setMapPan({ x: nx, y: ny });
              }}
              onPointerUp={() => { dragRef.current.dragging = false; }}
              onPointerCancel={() => { dragRef.current.dragging = false; }}
              onTouchStart={(e) => {
                if (e.touches.length === 2) {
                  const dx = e.touches[0].clientX - e.touches[1].clientX;
                  const dy = e.touches[0].clientY - e.touches[1].clientY;
                  pinchRef.current = Math.sqrt(dx * dx + dy * dy);
                }
              }}
              onTouchMove={(e) => {
                if (e.touches.length === 2 && pinchRef.current) {
                  const dx = e.touches[0].clientX - e.touches[1].clientX;
                  const dy = e.touches[0].clientY - e.touches[1].clientY;
                  const dist = Math.sqrt(dx * dx + dy * dy);
                  const ratio = dist / pinchRef.current;
                  setMapZoom(z => {
                    const nz = Math.max(1, Math.min(6, z * ratio));
                    const vw = svgW / nz, vh = svgH / nz;
                    setMapPan(p => ({ x: Math.max(0, Math.min(svgW - vw, p.x)), y: Math.max(0, Math.min(svgH - vh, p.y)) }));
                    return nz;
                  });
                  pinchRef.current = dist;
                }
              }}
              onTouchEnd={() => { pinchRef.current = null; }}
            >
              {/* Zoom controls — advanced mode only */}
              {advancedMode && <div className="absolute top-2 right-2 z-10 flex flex-col gap-1">
                <button
                  onClick={() => {
                    setMapZoom(z => {
                      const nz = Math.min(6, z * 1.4);
                      const vw = 800 / nz, vh = 500 / nz;
                      setMapPan(p => ({ x: Math.max(0, Math.min(800 - vw, p.x)), y: Math.max(0, Math.min(500 - vh, p.y)) }));
                      return nz;
                    });
                  }}
                  className="bg-card/70 backdrop-blur-sm rounded-full w-7 h-7 min-w-[44px] min-h-[44px] flex items-center justify-center text-secondary text-sm font-bold active:bg-card/90 hover:bg-card/80 transition-colors"
                  aria-label="Zoom in"
                >
                  +
                </button>
                <button
                  onClick={() => {
                    setMapZoom(z => {
                      const nz = Math.max(1, z / 1.4);
                      const vw = 800 / nz, vh = 500 / nz;
                      setMapPan(p => ({ x: Math.max(0, Math.min(800 - vw, p.x)), y: Math.max(0, Math.min(500 - vh, p.y)) }));
                      return nz;
                    });
                  }}
                  className="bg-card/70 backdrop-blur-sm rounded-full w-7 h-7 min-w-[44px] min-h-[44px] flex items-center justify-center text-secondary text-sm font-bold active:bg-card/90 hover:bg-card/80 transition-colors"
                  aria-label="Zoom out"
                >
                  −
                </button>
                {mapZoom > 1 && (
                  <button
                    onClick={() => { setMapZoom(1); setMapPan({ x: 0, y: 0 }); }}
                    className="bg-card/70 backdrop-blur-sm rounded-full w-7 h-7 min-w-[44px] min-h-[44px] flex items-center justify-center text-muted text-xs active:bg-card/90 hover:bg-card/80 transition-colors"
                    aria-label="Reset zoom"
                  >
                    ×
                  </button>
                )}
              </div>}
              <svg
                viewBox={`${mapPan.x} ${mapPan.y} ${svgW / mapZoom} ${svgH / mapZoom}`}
                className="w-full"
                style={{ minHeight: 220, cursor: advancedMode && mapZoom > 1 ? "grab" : "default", pointerEvents: "none" }}
              >
                <rect width={svgW} height={svgH} fill="#f0e6d2" />
                {[-120, -60, 0, 60, 120].map(lng => (
                  <line key={`g-lng-${lng}`} x1={projX(lng)} y1={0} x2={projX(lng)} y2={svgH} stroke="#2A1F18" strokeWidth="0.5" strokeOpacity={0.15} />
                ))}
                {[-60, -30, 0, 30, 60].map(lat => (
                  <line key={`g-lat-${lat}`} x1={0} y1={projY(lat)} x2={svgW} y2={projY(lat)} stroke="#2A1F18" strokeWidth="0.5" strokeOpacity={0.15} />
                ))}
                <line x1={0} y1={projY(0)} x2={svgW} y2={projY(0)} stroke="#5a1f1a" strokeWidth="0.8" strokeOpacity={0.4} />

                {/* Country outlines — Natural Earth 110m */}
                {WORLD_COUNTRY_PATHS.map((d, i) => (
                  <path key={`c-${i}`} d={d} fill="#4a2540" fillOpacity={0.25} stroke="#2A1F18" strokeWidth="0.3" strokeOpacity={0.3} />
                ))}

                {/* ── Country labels (always visible) ── */}
                {[
                  { name: "United States", lat: 40, lng: -100 },
                  { name: "Canada", lat: 56, lng: -100 },
                  { name: "Mexico", lat: 24, lng: -102 },
                  { name: "Brazil", lat: -10, lng: -52 },
                  { name: "Argentina", lat: -35, lng: -64 },
                  { name: "Colombia", lat: 4, lng: -73 },
                  { name: "Peru", lat: -10, lng: -76 },
                  { name: "Chile", lat: -33, lng: -71 },
                  { name: "UK", lat: 54, lng: -2 },
                  { name: "France", lat: 47, lng: 2 },
                  { name: "Spain", lat: 40, lng: -4 },
                  { name: "Germany", lat: 51, lng: 10 },
                  { name: "Italy", lat: 43, lng: 12 },
                  { name: "Turkey", lat: 39, lng: 35 },
                  { name: "Egypt", lat: 27, lng: 30 },
                  { name: "Nigeria", lat: 9, lng: 8 },
                  { name: "Kenya", lat: 0, lng: 38 },
                  { name: "South Africa", lat: -30, lng: 25 },
                  { name: "India", lat: 22, lng: 79 },
                  { name: "China", lat: 35, lng: 103 },
                  { name: "Japan", lat: 37, lng: 138 },
                  { name: "Australia", lat: -25, lng: 134 },
                  { name: "Thailand", lat: 15, lng: 101 },
                  { name: "Indonesia", lat: -3, lng: 118 },
                  { name: "Russia", lat: 60, lng: 90 },
                  { name: "Morocco", lat: 32, lng: -6 },
                  { name: "Iran", lat: 33, lng: 53 },
                  { name: "Saudi Arabia", lat: 24, lng: 45 },
                ].map(c => (
                  <text key={c.name} x={projX(c.lng)} y={projY(c.lat)} textAnchor="middle"
                    fill="#2A1F18" fontSize={mapZoom >= 2 ? "5" : "3.5"} fontWeight="600" fillOpacity={0.2}
                    style={{ textTransform: "uppercase", letterSpacing: mapZoom >= 2 ? "1px" : "0.5px" }}>
                    {c.name}
                  </text>
                ))}

                {/* ── State / region labels (zoom ≥ 2) ── */}
                {mapZoom >= 2 && [
                  { name: "California", lat: 37, lng: -120 },
                  { name: "Texas", lat: 31.5, lng: -99 },
                  { name: "Florida", lat: 28, lng: -82 },
                  { name: "New York", lat: 43, lng: -75 },
                  { name: "Illinois", lat: 40, lng: -89 },
                  { name: "Pennsylvania", lat: 41, lng: -77 },
                  { name: "Georgia", lat: 33, lng: -83 },
                  { name: "Colorado", lat: 39, lng: -105.5 },
                  { name: "Washington", lat: 47.5, lng: -120.5 },
                  { name: "Tennessee", lat: 36, lng: -86 },
                  { name: "Louisiana", lat: 31, lng: -92 },
                  { name: "Arizona", lat: 34.2, lng: -111.5 },
                  { name: "Minnesota", lat: 46, lng: -94 },
                  { name: "Oregon", lat: 44, lng: -120.5 },
                  { name: "Massachusetts", lat: 42.3, lng: -71.8 },
                  { name: "Nevada", lat: 39, lng: -116.5 },
                  { name: "Hawaii", lat: 20, lng: -156 },
                  { name: "Ontario", lat: 50, lng: -85 },
                  { name: "Québec", lat: 52, lng: -72 },
                  { name: "British Columbia", lat: 54, lng: -125 },
                  { name: "England", lat: 52.5, lng: -1.2 },
                  { name: "Scotland", lat: 57, lng: -4 },
                  { name: "Bavaria", lat: 49, lng: 11.5 },
                  { name: "Catalonia", lat: 41.8, lng: 1.5 },
                  { name: "Tuscany", lat: 43.3, lng: 11.3 },
                  { name: "Maharashtra", lat: 19.5, lng: 75 },
                  { name: "Rajasthan", lat: 27, lng: 74 },
                  { name: "Queensland", lat: -22, lng: 145 },
                  { name: "New South Wales", lat: -33, lng: 147 },
                  { name: "Hokkaido", lat: 43, lng: 143 },
                ].map(s => (
                  <text key={s.name} x={projX(s.lng)} y={projY(s.lat)} textAnchor="middle"
                    fill="#2A1F18" fontSize="3" fontWeight="400" fillOpacity={0.15}
                    style={{ letterSpacing: "0.3px" }}>
                    {s.name}
                  </text>
                ))}

                {/* ── City dots + labels (zoom ≥ 2.5) ── */}
                {mapZoom >= 2.5 && MAJOR_CITIES.map(city => (
                  <g key={`city-${city.name}`}>
                    <circle cx={projX(city.lng)} cy={projY(city.lat)} r="1" fill="#2A1F18" fillOpacity={0.25} />
                    <text x={projX(city.lng) + 2} y={projY(city.lat) + 1} fill="#2A1F18" fontSize="2.5" fillOpacity={0.3}>
                      {city.name}
                    </text>
                  </g>
                ))}

                {/* Planetary lines — advanced shows all, life-area highlights relevant */}
                {allLines.map((line, li) => {
                  const pts = line.points;
                  if (pts.length < 2) return null;
                  const isRelevant = advancedMode || relevantLineSet.has(`${line.planet}|${line.angle}`);
                  const pathD = pts.map((p, i) => `${i === 0 ? "M" : "L"}${projX(p[1]).toFixed(1)},${projY(p[0]).toFixed(1)}`).join(" ");
                  const isHovered = hoveredLine?.planet === line.planet && hoveredLine?.angle === line.angle;
                  return (
                    <g key={`line-${li}`}>
                      {/* Visible line */}
                      <path d={pathD} fill="none" stroke={isHovered ? "#fff" : isRelevant ? line.color : "#4a2540"}
                        strokeWidth={isHovered ? "3" : isRelevant ? (advancedMode ? "1.5" : "2.2") : "0.8"}
                        strokeOpacity={isHovered ? 1 : isRelevant ? (advancedMode ? 0.7 : 0.85) : 0.15}
                        strokeDasharray={line.style === "dashed" ? "4 3" : undefined} />
                      {/* Wide invisible hit area for hover — advanced mode only */}
                      {advancedMode && <path d={pathD} fill="none" stroke="transparent" strokeWidth={Math.max(8, 12 / mapZoom)}
                        style={{ pointerEvents: "auto", cursor: "pointer" }}
                        onPointerEnter={(e) => {
                          const rect = (e.currentTarget.ownerSVGElement as SVGSVGElement)?.getBoundingClientRect();
                          setHoveredLine({
                            planet: line.planet, angle: line.angle,
                            keyword: line.keyword, meaning: line.meaning,
                            x: e.clientX - (rect?.left || 0),
                            y: e.clientY - (rect?.top || 0),
                          });
                        }}
                        onPointerMove={(e) => {
                          if (!hoveredLine || hoveredLine.planet !== line.planet || hoveredLine.angle !== line.angle) return;
                          const rect = (e.currentTarget.ownerSVGElement as SVGSVGElement)?.getBoundingClientRect();
                          setHoveredLine(prev => prev ? {
                            ...prev,
                            x: e.clientX - (rect?.left || 0),
                            y: e.clientY - (rect?.top || 0),
                          } : null);
                        }}
                        onPointerLeave={() => setHoveredLine(null)} />}
                    </g>
                  );
                })}

                {/* Paran markers (advanced mode) */}
                {advancedMode && astroParans.slice(0, 20).map((p, pi) => (
                  <g key={`paran-${pi}`}>
                    <circle cx={projX(p.lng)} cy={projY(p.lat)} r="2" fill="none" stroke="#fff" strokeWidth="1" strokeOpacity={0.6} />
                    <circle cx={projX(p.lng)} cy={projY(p.lat)} r="1.2" fill={p.color1} fillOpacity={0.9} />
                  </g>
                ))}

                {/* Timeline location markers */}
                {timelineEntries.map((entry) => (
                  <g key={entry.id}>
                    <circle cx={projX(entry.lng)} cy={projY(entry.lat)} r="2.5" fill="#5a7a3a" stroke="#f0e6d2" strokeWidth="0.6" />
                    <text x={projX(entry.lng)} y={projY(entry.lat) - 5} textAnchor="middle" fill="#2A1F18" fontSize="4" fontWeight="600">
                      {String(entry.cityName || "").split(",")[0]}
                    </text>
                  </g>
                ))}

                {/* Birth location */}
                {userChart.latitude && userChart.longitude && (
                  <g>
                    <circle cx={projX(userChart.longitude)} cy={projY(userChart.latitude)} r="3" fill="#5a1f1a" stroke="#f0e6d2" strokeWidth="0.8" />
                    <text x={projX(userChart.longitude)} y={projY(userChart.latitude) - 6} textAnchor="middle" fill="#5a1f1a" fontSize="4" fontWeight="700">Born</text>
                  </g>
                )}
              </svg>

              {/* Hover tooltip for astrocartography lines (advanced mode) */}
              {advancedMode && hoveredLine && (() => {
                const areas = lifeAreasForLine(hoveredLine.planet, hoveredLine.angle);
                const angleName = ANGLE_NAMES[hoveredLine.angle] || hoveredLine.angle;
                return (
                  <div
                    className="absolute z-20 pointer-events-none"
                    style={{ left: hoveredLine.x + 12, top: hoveredLine.y - 8, maxWidth: 240 }}
                  >
                    <div className="bg-[var(--ink)] text-[var(--cream)] rounded-xl px-3 py-2.5 shadow-lg text-xs leading-snug">
                      <div className="font-bold mb-0.5">
                        {hoveredLine.planet} {angleName}
                      </div>
                      {hoveredLine.keyword && (
                        <div className="text-[var(--cream)]/60 text-[10px] mb-1">{hoveredLine.keyword}</div>
                      )}
                      <div className="text-[var(--cream)]/80 mb-1.5">{hoveredLine.meaning}</div>
                      {areas.length > 0 && (
                        <div className="text-[10px] text-[var(--cream)]/50 border-t border-[var(--cream)]/10 pt-1 mt-1">
                          Relevant for: {areas.join(", ")}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
            {advancedMode && mapZoom <= 1 && (
              <p className="text-muted text-[9px] text-center mb-2">Scroll to zoom · drag to pan · hover lines for details</p>
            )}

            {/* Legend (advanced mode only) */}
            {advancedMode && (
              <div className="flex flex-wrap items-center gap-2 mb-1 px-1">
                {planetList.map(planet => {
                  const line = astroLines.find(l => l.planet === planet);
                  return (
                    <div key={planet} className="flex items-center gap-1.5 text-xs">
                      <div className="w-3 h-0.5 rounded-full" style={{ backgroundColor: line?.color || "#888" }} />
                      <span className="text-muted">{planet}</span>
                    </div>
                  );
                })}
              </div>
            )}
            {advancedMode && (
              <div className="flex items-center gap-1.5 text-xs mb-4 px-1">
                <span className="text-muted">solid = Rising/Midheaven</span>
                <span className="text-muted">|</span>
                <span className="text-muted">dashed = Setting/Nadir</span>
                <span className="text-muted">·</span>
                <span className="text-muted">hover any line for details</span>
              </div>
            )}

            {/* ─── Lines Near You (Advanced mode) ─── */}
            {advancedMode && astroNearby && astroNearby.length > 0 && (
              <div className="mb-8">
                <h2 className="text-foreground text-base font-medium mb-2" style={{ fontFamily: "var(--font-display)" }}>
                  Lines Near {cityName ? cityName.split(",")[0] : "You"}
                </h2>
                <p className="text-muted text-xs mb-4">
                  Planetary lines within ~500 miles{cityName ? ` of ${cityName.split(",")[0]}` : ""}. The closer the line, the stronger you feel its energy in your daily life.
                </p>
                <div className="flex flex-col gap-3">
                  {astroNearby.map((nl) => {
                    const isOpen = openAspect === `astro-${nl.planet}-${nl.angle}`;
                    const strengthLabel = nl.distance < 2 ? "Very Strong" : nl.distance < 4 ? "Strong" : nl.distance < 6 ? "Moderate" : "Subtle";
                    const strengthColor = nl.distance < 2 ? "text-sage" : nl.distance < 4 ? "text-sage/70" : nl.distance < 6 ? "text-amber" : "text-muted";
                    const angleLabel = nl.angle === "ASC" ? "Rising Line" : nl.angle === "DSC" ? "Setting Line" : nl.angle === "MC" ? "Midheaven Line" : "Nadir Line";
                    const angleExplain = nl.angle === "ASC" ? "Shapes your identity, appearance, and how people perceive you"
                      : nl.angle === "DSC" ? "Influences your relationships, partnerships, and who you attract"
                      : nl.angle === "MC" ? "Governs your career, public reputation, and life direction"
                      : "Affects your home life, emotional foundations, and sense of belonging";

                    return (
                      <button
                        key={`${nl.planet}-${nl.angle}`}
                        className={`rounded-xl border ${isOpen ? "border-foreground/15" : "border-foreground/15"} bg-surface/60 px-4 py-4 text-left w-full transition-colors`}
                        onClick={() => setOpenAspect(isOpen ? null : `astro-${nl.planet}-${nl.angle}`)}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: nl.color, opacity: 0.8 }} />
                            <span className="text-foreground text-sm font-medium">{nl.planet}</span>
                            <span className="text-muted text-xs">{angleLabel}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-medium ${strengthColor}`}>{strengthLabel}</span>
                            <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                              className={`text-muted transition-transform ${isOpen ? "rotate-180" : ""}`}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                        <p className="text-ink text-xs font-medium mb-0.5">{nl.keyword}</p>
                        <p className="text-muted text-xs">{nl.distance < 1 ? "Less than 1" : nl.distance}&deg; from this line</p>

                        {isOpen && (
                          <div className="mt-3 pt-3 border-t border-foreground/15 space-y-3">
                            {/* Angle explanation */}
                            <div className="rounded-lg bg-foreground/3 px-3 py-2">
                              <p className="text-muted text-[10px] uppercase tracking-wider mb-1">{nl.angle} Line</p>
                              <p className="text-muted text-xs leading-relaxed">{angleExplain}</p>
                            </div>
                            {/* Planet-specific meaning for this angle */}
                            {nl.meaning && (
                              <div>
                                <p className="text-muted text-[10px] uppercase tracking-wider mb-1">What this means for you</p>
                                <p className="text-secondary text-sm leading-relaxed">{nl.meaning}</p>
                              </div>
                            )}
                            {/* Strength interpretation */}
                            <div>
                              <p className="text-muted text-[10px] uppercase tracking-wider mb-1">Strength</p>
                              <p className="text-muted text-xs leading-relaxed">
                                {nl.distance < 2
                                  ? `At ${nl.distance < 1 ? "less than 1" : nl.distance}° away, this is one of your most powerful lines in this area. You likely feel ${nl.planet}'s energy constantly — it colors your entire experience of living here.`
                                  : nl.distance < 4
                                  ? `At ${nl.distance}° away, this line has a strong influence. ${nl.planet}'s energy is a consistent theme in your life here, even if you don't always notice it consciously.`
                                  : nl.distance < 6
                                  ? `At ${nl.distance}° away, this is a moderate influence. You may feel ${nl.planet}'s energy during certain periods or situations, but it's not the dominant theme.`
                                  : `At ${nl.distance}° away, this is a subtle background influence. ${nl.planet}'s themes are present but not overpowering — they come out in specific circumstances.`}
                              </p>
                            </div>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
                {/* Geographic proximity note */}
                <div className="mt-3 rounded-lg bg-foreground/3 px-3 py-2">
                  <p className="text-muted text-xs leading-relaxed">
                    Astrocartography lines run across hundreds of miles, so nearby cities (within the same state or region) will often share the same lines. This is normal — it means the entire area carries similar planetary energy for you.
                  </p>
                </div>
              </div>
            )}

            {advancedMode && astroNearby && astroNearby.length === 0 && (
              <div className="rounded-xl border border-foreground/15 bg-card/45 px-4 py-4 mb-8 text-center">
                <p className="text-muted text-sm">No major planetary lines pass near your location.</p>
                <p className="text-muted text-xs mt-1">Your strongest planetary energy is elsewhere on the globe.</p>
              </div>
            )}

            {/* ─── Crossings (Advanced mode) ─── */}
            {advancedMode && astroParans.length > 0 && (
              <div className="mb-8">
                <h2 className="text-foreground text-base font-medium mb-1" style={{ fontFamily: "var(--font-display)" }}>
                  Crossings
                </h2>
                <p className="text-muted text-xs mb-1.5">
                  Each line on your map represents one planet at one angle. A crossing is where two of those lines meet — meaning two different planetary energies overlap at the same place on Earth.
                </p>
                <p className="text-muted text-xs mb-3">
                  That overlap creates a blend. If your Venus line crosses your Jupiter line somewhere, that spot carries both love and expansion energy — which tends to be stronger together than either one alone.
                </p>
                <div className="flex flex-col gap-1.5">
                  {astroParans.slice(0, 15).map((p, pi) => {
                    const key = `${p.planet1}-${p.planet2}-${p.lat}-${p.lng}`;
                    const isOpen = expandedParan === key;
                    const angleName1 = ANGLE_NAMES[p.angle1] || p.angle1;
                    const angleName2 = ANGLE_NAMES[p.angle2] || p.angle2;
                    // Find which life areas this crossing is relevant to
                    const areas1 = lifeAreasForLine(p.planet1, p.angle1);
                    const areas2 = lifeAreasForLine(p.planet2, p.angle2);
                    const allAreas = Array.from(new Set([...areas1, ...areas2]));
                    return (
                      <button
                        key={key}
                        onClick={() => setExpandedParan(isOpen ? null : key)}
                        className={`rounded-lg border bg-card/50 text-left w-full transition-all ${isOpen ? "border-foreground/15 px-3.5 py-2.5" : "border-foreground/8 px-3 py-2"}`}
                      >
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 shrink-0">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color1 }} />
                            <span className="text-muted text-[10px]">+</span>
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color2 }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-foreground text-[13px] font-medium block truncate">
                              {p.planet1} + {p.planet2}
                            </span>
                            <span className="text-muted text-[10px] block truncate">
                              {PLANET_PLAIN[p.planet1] || ""} meets {PLANET_PLAIN[p.planet2] || ""}
                            </span>
                          </div>
                          <span className="text-muted text-[10px] shrink-0">
                            {Math.abs(p.lat).toFixed(0)}°{p.lat >= 0 ? "N" : "S"}, {Math.abs(p.lng).toFixed(0)}°{p.lng >= 0 ? "E" : "W"}
                          </span>
                          <svg aria-hidden="true" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                            className={`text-muted transition-transform shrink-0 ${isOpen ? "rotate-180" : ""}`}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                        {isOpen && (
                          <div className="mt-2.5 pt-2.5 border-t border-foreground/6 space-y-2">
                            {/* What's crossing */}
                            <div className="flex flex-wrap gap-1.5">
                              <span className="text-[10px] bg-foreground/4 text-muted px-2 py-0.5 rounded-full">{p.planet1} {angleName1}</span>
                              <span className="text-[10px] bg-foreground/4 text-muted px-2 py-0.5 rounded-full">{p.planet2} {angleName2}</span>
                            </div>
                            {/* Plain-English meaning */}
                            <p className="text-secondary text-xs leading-relaxed">
                              {getCrossingDescription(p.planet1, p.planet2)}
                            </p>
                            {/* Life area relevance */}
                            {allAreas.length > 0 && (
                              <p className="text-muted text-[10px]">
                                Relevant for: {allAreas.join(", ")}
                              </p>
                            )}
                            {/* How crossings work */}
                            <div className="rounded bg-foreground/3 px-2.5 py-2">
                              <p className="text-muted text-[10px] leading-relaxed">
                                This crossing is where your {p.planet1} {angleName1.toLowerCase()} line meets your {p.planet2} {angleName2.toLowerCase()} line within about 75 miles. The closer the crossing, the more tightly the two energies blend. Think of it as both planets &ldquo;speaking&rdquo; at the same time in the same place.
                              </p>
                            </div>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ─── Life Area Tabs + City Rankings (default view) ─── */}
            {!advancedMode && (
            <div className="mb-8">
              {/* Tab strip */}
              <div className="flex gap-1.5 overflow-x-auto pb-2 mb-2 -mx-1 px-1 scrollbar-hide">
                {LIFE_AREAS.map(area => (
                  <button
                    key={area.id}
                    onClick={() => { setSelectedLifeArea(area.id); setExpandedCity(null); }}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] whitespace-nowrap transition-all ${
                      selectedLifeArea === area.id
                        ? "bg-foreground/10 text-foreground font-medium"
                        : "bg-foreground/3 text-muted active:bg-foreground/8"
                    }`}
                  >
                    <span className="text-xs">{area.icon}</span>
                    {area.label}
                  </button>
                ))}
              </div>

              {/* Question + country filter row */}
              <div className="flex items-center justify-between mb-3">
                <p className="text-muted text-xs italic">{activeArea.question}</p>
                <select
                  value={countryFilter || ""}
                  aria-label="Filter by country"
                  onChange={(e) => { setCountryFilter(e.target.value || null); setExpandedCity(null); }}
                  className="text-[10px] text-muted bg-transparent border border-foreground/10 rounded-md px-1.5 py-0.5 outline-none cursor-pointer"
                >
                  <option value="">All countries</option>
                  {COUNTRY_LIST.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* City cards for selected area */}
              {topForArea.length === 0 && (
                <div className="rounded-lg border border-foreground/8 bg-card/30 px-3 py-4 text-center">
                  <p className="text-muted text-xs">No strong {activeArea.label.toLowerCase()} locations{countryFilter ? ` in ${countryFilter}` : ""}.</p>
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                {topForArea.map((s, i) => {
                  const isExpanded = expandedCity === `${activeArea.id}-${s.city.name}`;
                  const copy = LIFE_AREA_COPY[activeArea.id];
                  const areaLines = s.nearbyLines.filter(nl =>
                    activeArea.relevantLines.some(rl => rl.planet === nl.planet && (
                      (rl.angle === "ASC" && nl.angle === "ASC") ||
                      (rl.angle === "DSC" && nl.angle === "DSC") ||
                      (rl.angle === "MC" && nl.angle === "MC") ||
                      (rl.angle === "IC" && nl.angle === "IC")
                    ))
                  );
                  const topLine = areaLines[0] || s.nearbyLines[0];

                  return (
                    <button
                      key={s.city.name}
                      onClick={() => setExpandedCity(isExpanded ? null : `${activeArea.id}-${s.city.name}`)}
                      className={`rounded-lg border bg-card/50 text-left w-full transition-all ${isExpanded ? "border-foreground/15 px-3.5 py-3" : "border-foreground/8 px-3 py-2"}`}
                    >
                      {/* Collapsed row: tight single-line */}
                      <div className="flex items-center gap-2">
                        <span className="text-muted text-[10px] w-3 shrink-0 text-right">{i + 1}</span>
                        <span className="text-foreground text-[13px] font-medium flex-1 truncate">{s.city.name}</span>
                        <span className={`text-[9px] font-medium px-1.5 py-px rounded-full shrink-0 ${
                          s.closestDist < 2 ? "bg-sage/15 text-sage" :
                          s.closestDist < 5 ? "bg-amber/12 text-amber" :
                          "bg-foreground/4 text-muted"
                        }`}>
                          {s.closestDist < 2 ? "Very strong" : s.closestDist < 5 ? "Strong" : "Moderate"}
                        </span>
                        <svg aria-hidden="true" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                          className={`text-muted transition-transform shrink-0 ${isExpanded ? "rotate-180" : ""}`}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>

                      {/* Expanded detail */}
                      {isExpanded && topLine && (
                        <div className="mt-2.5 pt-2.5 border-t border-foreground/6 space-y-2.5">
                          <p className="text-secondary text-xs leading-relaxed">
                            {copy.description(s.city.name, topLine)}
                          </p>

                          <div className="rounded bg-foreground/3 px-2.5 py-2">
                            <p className="text-muted text-[9px] uppercase tracking-widest mb-1">Why this works</p>
                            <p className="text-muted text-[11px] leading-relaxed">
                              {copy.reasoning(s.city.name, areaLines.length > 0 ? areaLines : [topLine])}
                            </p>
                          </div>

                          {areaLines.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {areaLines.slice(0, 4).map((nl, j) => (
                                <span key={j} className="text-[9px] text-muted bg-foreground/4 px-1.5 py-px rounded-full">
                                  {nl.planet} {nl.angle} · {nl.dist < 1 ? "<1" : Math.round(nl.dist)}°
                                </span>
                              ))}
                            </div>
                          )}

                          <div className="border-l-[1.5px] border-foreground/8 pl-2.5">
                            <p className="text-muted text-[11px] leading-relaxed italic">
                              {copy.caveat}
                            </p>
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
            )}

            {/* ═══ LIFE TIMELINE ═══ */}
            <div className="mb-8">
              <h2 className="text-foreground text-base font-medium mb-2" style={{ fontFamily: "var(--font-display)" }}>
                Your Life Timeline
              </h2>
              <p className="text-muted text-xs mb-4">
                Add places you&rsquo;ve lived to see how your planetary lines shaped each chapter.
              </p>

              {/* Existing entries — sorted by start date */}
              {timelineEntries.length > 0 && (
                <div className="flex flex-col gap-3 mb-4">
                  {[...timelineEntries]
                    .sort((a, b) => String(a.startDate || "").localeCompare(String(b.startDate || "")))
                    .map((entry) => {
                      const isExpanded = expandedTimeline === entry.id;
                      const synopsis = astroLines ? getLocationSynopsis(entry.lat, entry.lng, astroLines) : [];
                      const startYear = String(entry.startDate || "").split("-")[0];
                      const endLabel = entry.endDate === "present" ? "Present" : String(entry.endDate || "").split("-")[0];

                      return (
                        <div key={entry.id} className="rounded-xl border border-foreground/18 bg-card/50 overflow-hidden">
                          <button
                            onClick={() => setExpandedTimeline(isExpanded ? null : entry.id)}
                            className="w-full flex items-center gap-3 px-4 py-3 text-left"
                          >
                            {/* Timeline dot + line */}
                            <div className="flex flex-col items-center flex-shrink-0">
                              <div className={`w-3 h-3 rounded-full ${entry.endDate === "present" ? "bg-sage" : "bg-ink"}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-foreground text-sm font-medium truncate">{entry.cityName}</p>
                              <p className="text-muted text-xs">{startYear} &ndash; {endLabel}</p>
                            </div>
                            {synopsis.length > 0 && (
                              <span className="text-muted text-xs flex-shrink-0">
                                {synopsis.length} line{synopsis.length !== 1 ? "s" : ""}
                              </span>
                            )}
                            <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                              className={`text-muted transition-transform flex-shrink-0 ${isExpanded ? "rotate-180" : ""}`}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>

                          {isExpanded && (
                            <div className="px-4 pb-4 border-t border-foreground/15">
                              {synopsis.length === 0 ? (
                                <p className="text-muted text-xs pt-3">
                                  No major planetary lines pass near this location. The astrological influence here was subtle — shaped more by transits and your overall chart than by geographic placement.
                                </p>
                              ) : (
                                <div className="flex flex-col gap-3 pt-3">
                                  {synopsis.map((s, i) => (
                                    <div key={i}>
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="text-ink text-xs font-medium">{s.planet} {s.angle}</span>
                                        <span className="text-muted text-[10px]">
                                          {s.dist < 3 ? "strong effect" : s.dist < 8 ? "moderate effect" : "subtle effect"}
                                        </span>
                                      </div>
                                      <p className="text-foreground text-xs font-medium mb-0.5">{s.theme}</p>
                                      <p className="text-muted text-xs leading-relaxed">{s.synopsis}</p>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Edit dates / Delete */}
                              {editingTimelineId === entry.id ? (
                                <div className="mt-3 pt-3 border-t border-foreground/15" onClick={(e) => e.stopPropagation()}>
                                  <p className="text-muted text-xs mb-2 font-medium">Edit dates</p>
                                  <div className="grid grid-cols-2 gap-2 mb-2">
                                    <div>
                                      <label className="text-muted text-[10px] mb-0.5 block">From</label>
                                      <input
                                        type="date"
                                        value={editStart}
                                        onChange={(e) => setEditStart(e.target.value)}
                                        aria-label="Start date"
                                        className="w-full bg-foreground/5 rounded-lg px-2 py-1.5 text-xs text-foreground border border-foreground/18 focus:border-ink/50 outline-none"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-muted text-[10px] mb-0.5 block">To</label>
                                      {/* Segmented toggle: Date vs Present */}
                                      <div className="flex rounded-lg overflow-hidden border border-foreground/18 mb-1">
                                        <button
                                          type="button"
                                          onClick={() => setEditPresent(false)}
                                          className={`flex-1 py-1.5 text-[10px] font-medium transition-colors ${!editPresent ? "bg-ink text-cream" : "bg-foreground/5 text-muted"}`}
                                        >
                                          Date
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => { setEditPresent(true); setEditEnd(""); }}
                                          className={`flex-1 py-1.5 text-[10px] font-medium transition-colors ${editPresent ? "bg-sage text-cream" : "bg-foreground/5 text-muted"}`}
                                        >
                                          Still here
                                        </button>
                                      </div>
                                      {!editPresent && (
                                        <input
                                          type="date"
                                          value={editEnd}
                                          onChange={(e) => setEditEnd(e.target.value)}
                                          aria-label="End date"
                                          className="w-full bg-foreground/5 rounded-lg px-2 py-1.5 text-xs text-foreground border border-foreground/18 focus:border-ink/50 outline-none"
                                        />
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => {
                                        if (!editStart) return;
                                        const updated = timelineEntries.map(t =>
                                          t.id === entry.id
                                            ? { ...t, startDate: editStart, endDate: editPresent ? "present" : (editEnd || "present") }
                                            : t
                                        );
                                        setTimelineEntries(updated);
                                        saveTimeline(updated, userId);
                                        setEditingTimelineId(null);
                                      }}
                                      disabled={!editStart}
                                      className="flex-1 py-1.5 rounded-full bg-ink text-cream text-xs font-medium active:scale-[0.98] disabled:opacity-40"
                                    >
                                      Save
                                    </button>
                                    <button
                                      onClick={() => setEditingTimelineId(null)}
                                      className="px-3 py-1.5 rounded-full border border-foreground/18 text-muted text-xs"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="mt-3 pt-3 border-t border-foreground/15 flex items-center gap-3">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingTimelineId(entry.id);
                                      setEditStart(entry.startDate);
                                      setEditEnd(entry.endDate === "present" ? "" : entry.endDate);
                                      setEditPresent(entry.endDate === "present");
                                    }}
                                    className="text-ink/60 text-xs hover:text-ink transition-colors"
                                  >
                                    Edit dates
                                  </button>
                                  <span className="text-foreground/10">|</span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const updated = timelineEntries.filter(t => t.id !== entry.id);
                                      setTimelineEntries(updated);
                                      saveTimeline(updated, userId);
                                      setExpandedTimeline(null);
                                      setEditingTimelineId(null);
                                    }}
                                    className="text-terracotta/40 text-xs hover:text-terracotta transition-colors"
                                  >
                                    Remove
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              )}

              {/* Add location form */}
              {showTimelineForm ? (
                <div className="rounded-xl border border-ink/20 bg-ink/5 px-4 py-4 mb-3">
                  <p className="text-foreground text-sm font-medium mb-3" style={{ fontFamily: "var(--font-display)" }}>
                    Add a place you&rsquo;ve lived
                  </p>

                  <div className="mb-3">
                    <label className="text-muted text-xs mb-1 block">City</label>
                    <CitySearch
                      value={tlCity}
                      onChange={(v: string) => setTlCity(v)}
                      onSelect={(loc: LocationResult) => {
                        setTlCity(String(loc.display_name || "").split(",")[0]);
                        setTlLat(parseFloat(loc.lat));
                        setTlLng(parseFloat(loc.lon));
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="text-muted text-xs mb-1 block">From</label>
                      <input
                        type="date"
                        value={tlStart}
                        onChange={(e) => setTlStart(e.target.value)}
                        aria-label="Residence start date"
                        className="w-full bg-foreground/5 rounded-lg px-3 py-2 text-sm text-foreground border border-foreground/18 focus:border-ink/50 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-muted text-xs mb-1 block">To</label>
                      {/* Segmented toggle: Date vs Present */}
                      <div className="flex rounded-lg overflow-hidden border border-foreground/18 mb-1">
                        <button
                          type="button"
                          onClick={() => setTlPresent(false)}
                          className={`flex-1 py-2 text-xs font-medium transition-colors ${!tlPresent ? "bg-ink text-cream" : "bg-foreground/5 text-muted"}`}
                        >
                          Date
                        </button>
                        <button
                          type="button"
                          onClick={() => { setTlPresent(true); setTlEnd(""); }}
                          className={`flex-1 py-2 text-xs font-medium transition-colors ${tlPresent ? "bg-sage text-cream" : "bg-foreground/5 text-muted"}`}
                        >
                          I still live here
                        </button>
                      </div>
                      {!tlPresent && (
                        <input
                          type="date"
                          value={tlEnd}
                          onChange={(e) => setTlEnd(e.target.value)}
                          aria-label="Residence end date"
                          className="w-full bg-foreground/5 rounded-lg px-3 py-2 text-sm text-foreground border border-foreground/18 focus:border-ink/50 outline-none"
                        />
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={async () => {
                        if (!tlCity || !tlStart) return;
                        // If lat is missing (user typed but didn't select), geocode now
                        let lat = tlLat;
                        let lng = tlLng;
                        if (!lat) {
                          try {
                            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(tlCity)}&limit=1`, { headers: { "User-Agent": "Mapped-Astrology-App" } });
                            const data = await res.json();
                            if (data && data[0]) {
                              lat = parseFloat(data[0].lat);
                              lng = parseFloat(data[0].lon);
                            }
                          } catch { /* proceed without coords */ }
                        }
                        const newEntry: TimelineEntry = {
                          id: `tl-${Date.now()}`,
                          cityName: tlCity,
                          lat: lat || 0,
                          lng: lng || 0,
                          startDate: tlStart,
                          endDate: tlPresent ? "present" : (tlEnd || "present"),
                        };
                        const updated = [...timelineEntries, newEntry];
                        setTimelineEntries(updated);
                        saveTimeline(updated, userId);
                        setShowTimelineForm(false);
                        setTlCity(""); setTlLat(null); setTlLng(null);
                        setTlStart(""); setTlEnd(""); setTlPresent(false);
                        setExpandedTimeline(newEntry.id); // Auto-expand the new entry
                      }}
                      disabled={!tlCity || !tlStart}
                      className="flex-1 py-2.5 rounded-full bg-ink text-cream text-sm font-semibold active:scale-[0.98] transition-all disabled:opacity-40"
                    >
                      Add to timeline
                    </button>
                    <button
                      onClick={() => {
                        setShowTimelineForm(false);
                        setTlCity(""); setTlLat(null); setTlLng(null);
                        setTlStart(""); setTlEnd(""); setTlPresent(false);
                      }}
                      className="px-4 py-2.5 rounded-full border border-foreground/18 text-muted text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowTimelineForm(true)}
                  className="w-full rounded-xl border border-dashed border-foreground/15 py-3 text-muted text-sm hover:border-ink/30 hover:text-ink transition-colors"
                >
                  + Add a place you&rsquo;ve lived
                </button>
              )}
            </div>

            {/* ─── Explainer ─── */}
            <div className="rounded-xl border border-foreground/15 bg-card/40 px-4 py-3 mb-6">
              <p className="text-muted text-xs leading-relaxed">
                Astrocartography maps where your planets were rising (ASC), setting (DSC), at their highest point (MC), or lowest point (IC) at your birth. Lines show where each planet&rsquo;s energy is strongest. Cities are ranked by how close your planetary lines pass — the closer a line, the stronger its influence on your life there. Your life timeline shows how each place activated different planetary energies during the time you lived there.
              </p>
            </div>
          </>
        )}

        {/* City picker modal (duplicated here because this view returns early) */}
        {showCityPicker && (
          <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm px-4" style={{ backgroundColor: "var(--modal-overlay)" }}
            onClick={(e) => { if (e.target === e.currentTarget) setShowCityPicker(false); }}>
            <div className="w-full max-w-lg rounded-2xl border border-foreground/18 bg-background p-5 pb-6 animate-slide-up shadow-xl">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg text-foreground" style={{ fontFamily: "var(--font-display)" }}>
                  Change your city
                </h3>
                <button onClick={() => setShowCityPicker(false)} aria-label="Close" className="min-w-[44px] min-h-[44px] flex items-center justify-center text-muted hover:text-foreground transition-colors">
                  <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-muted text-xs mb-4">
                Search for a city to see which planetary lines are nearby.
              </p>
              <div className="flex flex-col gap-3">
                <CitySearch
                  value={cityName || ""}
                  onChange={(val) => { setCityName(val); if (!val) { setCityLat(null); setCityLng(null); } }}
                  onSelect={(loc: LocationResult) => {
                    setCityName(loc.display_name);
                    setCityLat(parseFloat(loc.lat));
                    setCityLng(parseFloat(loc.lon));
                  }}
                />
                <button onClick={handleCitySubmit} disabled={!cityLat}
                  className="px-6 py-3 rounded-full bg-ink text-cream font-semibold text-sm tracking-wide active:scale-[0.98] transition-all disabled:opacity-50 mt-2">
                  Set city
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    );
  }

  // ─── Main map view ───
  return (
    <main className="w-full overflow-hidden" style={{ marginBottom: -16 }}>
      {/* ═══ NIGHT SKY — Your Constellation ═══ */}
      <NightSky
        people={connections.map((c) => ({
          id: c.id,
          name: c.name,
          sun: c.big_three?.sun ?? null,
          group: c.category === "friend"
            ? "friend"
            : (c.category === "partner" || CIRCLE_RELATIONSHIPS.includes(c.relationship))
              ? "circle"
              : "origin",
        }))}
        userSun={userChart ? SIGN_FULL[userChart.bigThree.sun] : null}
        hasChart={!!userChart}
        onSelectPerson={(id) => { setSelectedId(id); setShowSelfView(false); }}
        onSelectSelf={() => { setShowSelfView(true); setSelectedId(null); setSelfTab("transits"); if (!selfTransitData) fetchSelfTransits(); }}
        onSelectGroup={(g) => { if (g === "origin") setShowFamilyPanel(true); }}
        onAdd={(category) => openAddForm(category)}
        onOpenPlaces={() => {
          if (!shouldRenderTimeFeature("astrocartography")) { setShowBirthTimePlaceholder(true); return; }
          if (gate("astrocartography")) return;
          if (userChart && !userChart.birthDate) {
            try {
              const raw = sessionStorage.getItem("chartResult");
              if (raw) {
                const parsed = JSON.parse(raw);
                if (parsed.birthDate) {
                  setUserChart((prev) => prev ? { ...prev, birthDate: parsed.birthDate, birthTime: parsed.birthTime, latitude: parsed.latitude, longitude: parsed.longitude, timezone: parsed.timezone } : prev);
                }
              }
            } catch { /* ignore */ }
          }
          setShowAstroMap(true);
        }}
      />

      {/* ═══ ORIGIN FAMILY PANEL — members + generate/view/regenerate ═══ */}
      {showFamilyPanel && (() => {
        const members = familyMembers(connections);
        const currentSig = familySignature(connections);
        const isStale = savedFamily ? savedFamily.sig !== currentSig : false;
        const hasCurrent = !!savedFamily && !isStale;
        const btnLabel = analysisLoading
          ? "Generating…"
          : hasCurrent ? "Traits & Curses"
          : savedFamily ? "Regenerate traits & curses"
          : "Generate traits & curses";
        return (
          <div className="fixed inset-0 z-50 flex items-end justify-center backdrop-blur-sm" style={{ backgroundColor: "var(--modal-overlay)" }}
            onClick={(e) => { if (e.target === e.currentTarget) setShowFamilyPanel(false); }}>
            <div className="w-full max-w-lg max-h-[85vh] rounded-t-2xl border border-foreground/18 bg-background animate-slide-up flex flex-col">
              <div className="flex items-center justify-between p-5 pb-2 flex-shrink-0">
                <h3 className="text-lg text-foreground" style={{ fontFamily: "var(--font-display)" }}>Origin Family</h3>
                <button onClick={() => setShowFamilyPanel(false)} aria-label="Close" className="text-muted hover:text-foreground transition-colors">
                  <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" d="M18 6L6 18M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="px-5 pb-6 overflow-y-auto">
                <p className="text-muted text-[13px] mb-3">Your family&rsquo;s traits &amp; curses, cross-referenced across these members:</p>
                {members.length === 0 ? (
                  <p className="text-secondary text-sm py-6 text-center">Add your parents and siblings to your map first.</p>
                ) : (
                  <ul className="flex flex-col gap-2 mb-5">
                    {members.map((m) => (
                      <li key={m.id} className="flex items-center gap-3 rounded-xl px-4 py-2.5" style={{ backgroundColor: "var(--background-card)", border: "1px solid var(--border-card)" }}>
                        <span className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0" style={{ background: "rgba(184,160,210,0.18)", color: "var(--lavender)" }}>{m.name.charAt(0).toUpperCase()}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-foreground text-sm font-medium truncate">{m.name}</p>
                          <p className="text-muted text-xs capitalize">{m.relationship}{m.big_three ? ` · ${SIGN_FULL[m.big_three.sun]} Sun` : ""}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                {isStale && (
                  <p className="text-[12px] mb-3" style={{ color: "var(--brass-light)" }}>Your family changed since this was generated — regenerate for an up-to-date reading.</p>
                )}
                {members.length > 0 && (
                  <button
                    onClick={() => {
                      if (analysisLoading) return;
                      if (hasCurrent && savedFamily) { setFamilyAnalysis(savedFamily.analysis); setShowFamilyPanel(false); }
                      else { handleFamilyAnalysis(); }
                    }}
                    disabled={analysisLoading || !userChart}
                    className="w-full py-3.5 rounded-full font-semibold text-sm tracking-wide active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                    style={{ backgroundColor: "var(--btn-primary-bg)", color: "var(--btn-primary-text)" }}
                  >
                    {hasCurrent && <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l2.5 5.5L20 9l-4 4 1 6-5-3-5 3 1-6-4-4 5.5-.5z" /></svg>}
                    {btnLabel}{hasCurrent ? " ›" : ""}
                  </button>
                )}
                {!userChart && <p className="text-muted text-xs text-center mt-3">Calculate your own chart first.</p>}
              </div>
            </div>
          </div>
        );
      })()}

      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center backdrop-blur-sm" style={{ backgroundColor: "var(--modal-overlay)" }}
          onClick={(e) => { if (e.target === e.currentTarget) { setShowAddForm(false); setEditingConnectionId(null); } }}>
          <div className="w-full max-w-lg max-h-[85vh] rounded-t-2xl border border-foreground/18 bg-background animate-slide-up flex flex-col">
            <div className="flex items-center justify-between p-5 pb-2 flex-shrink-0">
              <h3 className="text-lg text-foreground" style={{ fontFamily: "var(--font-display)" }}>
                {editingConnectionId ? "Edit info" : "Add a person"}
              </h3>
              <button onClick={() => { setShowAddForm(false); setEditingConnectionId(null); }} aria-label="Close form" className="text-muted hover:text-foreground transition-colors">
                <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex flex-col gap-3 px-5 pb-6 overflow-y-auto">
              <input type="text" value={formName} onChange={(e) => setFormName(e.target.value)}
                placeholder="Their name" aria-label="Their name" className={inputClass} />

              <select value={formRelationship} onChange={(e) => setFormRelationship(e.target.value)}
                aria-label="Relationship type" className={`${inputClass} ${!formRelationship ? "text-muted" : ""}`}>
                <option value="" disabled>Relationship</option>
                {filteredRelationships.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>

              <input type="date" value={formBirthDate} onChange={(e) => setFormBirthDate(e.target.value)}
                aria-label="Their birth date" className={inputClass} />

              {!formUnknownTime && (
                <input type="time" value={formBirthTime} onChange={(e) => setFormBirthTime(e.target.value)}
                  aria-label="Their birth time" className={inputClass} />
              )}
              <label className="flex items-center gap-2 text-muted text-xs">
                <input type="checkbox" checked={formUnknownTime}
                  onChange={(e) => setFormUnknownTime(e.target.checked)}
                  aria-label="Birth time unknown" className="rounded border-foreground/20" />
                Birth time unknown
              </label>

              <CitySearch
                value={formCity}
                onChange={(val) => { setFormCity(val); if (!val) { setFormLat(null); setFormLng(null); } }}
                onSelect={(loc: LocationResult) => {
                  setFormCity(loc.display_name);
                  setFormLat(parseFloat(loc.lat));
                  setFormLng(parseFloat(loc.lon));
                }}
              />

              {formError && <p className="text-terracotta text-xs">{formError}</p>}

              <button onClick={editingConnectionId ? handleEditPerson : handleAddPerson} disabled={isSubmitting}
                className="px-6 py-3 rounded-full bg-terracotta text-cream font-semibold text-sm tracking-wide hover:bg-terracotta-light active:scale-[0.98] transition-all disabled:opacity-50 mt-2">
                {isSubmitting
                  ? (editingConnectionId ? "Updating chart..." : "Calculating their chart...")
                  : (editingConnectionId ? "Save changes" : "Add to map")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* City picker modal */}
      {showCityPicker && (
        <div className="fixed inset-0 z-50 flex items-end justify-center backdrop-blur-sm" style={{ backgroundColor: "var(--modal-overlay)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowCityPicker(false); }}>
          <div className="w-full max-w-lg rounded-t-2xl border border-foreground/18 bg-background p-5 pb-8 animate-slide-up">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg text-foreground" style={{ fontFamily: "var(--font-display)" }}>
                Set your city
              </h3>
              <button onClick={() => setShowCityPicker(false)} aria-label="Close city picker" className="text-muted hover:text-foreground transition-colors">
                <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-muted text-xs mb-4">
              Enter the city you live in to see which planetary lines are nearby and how they shape your experience there.
            </p>

            <div className="flex flex-col gap-3">
              <CitySearch
                value={cityName || ""}
                onChange={(val) => { setCityName(val); if (!val) { setCityLat(null); setCityLng(null); } }}
                onSelect={(loc: LocationResult) => {
                  setCityName(loc.display_name);
                  setCityLat(parseFloat(loc.lat));
                  setCityLng(parseFloat(loc.lon));
                }}
              />

              <button onClick={handleCitySubmit} disabled={!cityLat}
                className="px-6 py-3 rounded-full bg-ink text-cream font-semibold text-sm tracking-wide active:scale-[0.98] transition-all disabled:opacity-50 mt-2">
                Set city
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="h-8" />
      {PaywallModal}
    </main>
  );
}
