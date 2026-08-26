"use client";

/**
 * Tarot Tab — full tarot & oracle deck experience.
 *
 * Flow:
 *  1. My Decks → deck grid (owned decks + store tab)
 *  2. Spread Selection → pick a spread or freestyle mode
 *  3. Card Pick → fanned deck, swipe to pick card for each spread position
 *  4. Card Detail → tap any placed card to see full reading
 *  5. Freestyle (Fanned) → swipe-to-select from fanned arc
 *  6. (removed — was Scattered freestyle mode)
 */

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getTarotHistoryKey } from "@/lib/completionSync";
import {
  ALL_CARDS, SPREADS, ORACLE_DECKS, SUIT_INFO,
  shuffleDeck, shuffleArray, drawCards, getCardImagePath, CARD_BACK_IMAGE,
  type TarotCard, type TarotSpread, type DrawnCard, type OracleDeck,
} from "@/lib/tarot";
import { tarotMeanings } from "@/lib/tarotMeanings";
import { type OracleCard, type OracleDeckInfo } from "@/lib/stitchedAnimalOracle";
import { ORACLE_DECKS as ORACLE_DECK_REGISTRY, getOracleDeck } from "@/lib/oracleDecks";
import DeckStore from "@/components/tarot/DeckStore";
import { shareReadingAsImage } from "@/lib/shareCard";
import Image from "next/image";
import { cardThumb, onCardThumbError } from "@/lib/cardThumb";

/* ─── Types ─── */
type View = "decks" | "spreads" | "intention" | "picking" | "spread-view" | "card-detail" | "freestyle-fan";
type DeckTab = "my-decks" | "store";

const CARD_W = 74;
const CARD_H = Math.round(CARD_W * 1.6);

/* ─── Per-spread guide copy (design "About this spread" panel) ─── */
const SPREAD_GUIDES: Record<string, string> = {
  "yes-no": "Best for a single, well-framed question. Upright leans yes; reversed leans no — read the card’s meaning for the nuance behind the answer.",
  "relationship": "Maps a connection from both sides. Reach for it when you want to understand a dynamic — romantic, family, or work — rather than a yes/no verdict.",
  "horseshoe": "A gentle arc from where a situation came from to where it’s heading, with a card of advice in between. Good for a decision you’re sitting with.",
  "celtic-cross": "The classic deep-dive. Ten positions cover the heart of a matter, what crosses it, your inner world, outside forces, and the likely outcome. Give it time.",
  "freestyle": "No fixed positions — draw one card at a time and let the reading find its own shape. Best when you don’t have a set question yet.",
};

interface UserChart {
  planets?: { name: string; sign: string; signNum: number }[];
  bigThree?: { sun: string; moon: string; rising: string };
}

/* ═══════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════ */

export default function TarotTab() {
  const router = useRouter();

  /* ─── Auth — user ID for scoped localStorage ─── */
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  /* ─── Core State ─── */
  const [view, setView] = useState<View>("decks");
  const [deckTab, setDeckTab] = useState<DeckTab>("my-decks");
  const [justPurchasedDeck, setJustPurchasedDeck] = useState<string | null>(null);
  const [ownedStoreDecks, setOwnedStoreDecks] = useState<string[]>([]);

  // Store deep-links: ?deck_purchased=<id> (back from Stripe success) opens the
  // store with a success banner; ?store=1 (checkout cancelled) reopens the store.
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const purchased = params.get("deck_purchased");
      if (purchased) { setDeckTab("store"); setJustPurchasedDeck(purchased); }
      else if (params.get("store")) setDeckTab("store");
      if (purchased || params.get("store")) {
        window.history.replaceState({}, "", window.location.pathname);
      }
    } catch { /* ignore */ }
  }, []);

  // Owned premium (store) decks — shown in My Decks alongside the free decks.
  useEffect(() => {
    let alive = true;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user || !alive) return;
      const { data } = await supabase
        .from("purchased_decks")
        .select("deck_id")
        .eq("user_id", session.user.id);
      if (alive && data) setOwnedStoreDecks(data.map((r) => r.deck_id as string));
    })();
    return () => { alive = false; };
  }, [justPurchasedDeck]);
  const [selectedDeck, setSelectedDeck] = useState<string>("classic-tarot");
  const [selectedSpread, setSelectedSpread] = useState<TarotSpread | null>(null);
  const [shuffledDeck, setShuffledDeck] = useState<TarotCard[]>([]);
  const [userChart, setUserChart] = useState<UserChart | null>(null);
  const [oracleDecks, setOracleDecks] = useState<OracleDeck[]>(ORACLE_DECKS);

  /* ─── Oracle deck state ─── */
  const isOracleDeck = ORACLE_DECK_REGISTRY.some(d => d.id === selectedDeck);
  const activeOracleDeck: OracleDeckInfo | null = isOracleDeck ? (getOracleDeck(selectedDeck) ?? null) : null;
  const [shuffledOracleCards, setShuffledOracleCards] = useState<OracleCard[]>([]);
  const [pickedOracleCards, setPickedOracleCards] = useState<{ card: OracleCard; revealed: boolean; positionIndex: number }[]>([]);
  const [detailOracleCard, setDetailOracleCard] = useState<OracleCard | null>(null);

  /* ─── Spread picking state ─── */
  const [pickedCards, setPickedCards] = useState<DrawnCard[]>([]); // cards placed in spread
  const [currentPickPos, setCurrentPickPos] = useState(0); // which spread position we're picking for
  const [fanRotation, setFanRotation] = useState(0); // fan angle controlled by touch

  /* ─── Freestyle state ─── */
  const [freestylePicks, setFreestylePicks] = useState<DrawnCard[]>([]);

  /* ─── Spread select-confirm state (design select → about → begin flow) ─── */
  const [pendingSpreadId, setPendingSpreadId] = useState<string | null>(null); // spread id, or "freestyle"
  const [question, setQuestion] = useState("");

  /* ─── Card detail state ─── */
  const [detailCard, setDetailCard] = useState<DrawnCard | null>(null);
  const [detailPosition, setDetailPosition] = useState<{ name: string; description: string } | undefined>();
  const [expandedReadingCard, setExpandedReadingCard] = useState<number | null>(null);

  /* ─── Share state ─── */
  const [copiedShare, setCopiedShare] = useState<string | null>(null);
  const handleShare = useCallback(async (text: string, key: string) => {
    if (navigator.share) {
      try { await navigator.share({ text }); } catch {}
    } else {
      await navigator.clipboard.writeText(text);
      setCopiedShare(key);
      setTimeout(() => setCopiedShare(null), 2000);
    }
  }, []);

  /* ─── Fan touch state ─── */
  const fanRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ x: number; rotation: number } | null>(null);

  /* ─── Load user chart for AstroTarot ─── */
  useEffect(() => {
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;
        setCurrentUserId(session.user.id);
        const { data } = await supabase.from("charts").select("*")
          .eq("user_id", session.user.id).order("created_at", { ascending: false }).limit(1).single();
        if (data) setUserChart({ planets: data.planets || [], bigThree: data.big_three });
      } catch { /* ignore */ }
    })();
  }, []);

  /* ─── Reading history (localStorage) ─── */
  interface SavedReading {
    id: string;
    date: string;
    deck: string;
    spreadName: string;
    cards: { name: string; keywords: string[]; reversed: boolean; position?: string }[];
  }

  const [readingHistory, setReadingHistory] = useState<SavedReading[]>([]);
  const [showHistory, setShowHistory] = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(getTarotHistoryKey(currentUserId));
      if (saved) setReadingHistory(JSON.parse(saved));
    } catch {}
  }, [currentUserId]);

  const saveReading = useCallback(() => {
    const reading: SavedReading = {
      id: `${Date.now()}`,
      date: new Date().toISOString(),
      deck: selectedDeck,
      spreadName: selectedSpread?.name || "Freestyle",
      cards: [],
    };

    if (isOracleDeck && pickedOracleCards.length > 0) {
      reading.cards = pickedOracleCards.map((p, i) => ({
        name: p.card.animal,
        keywords: [p.card.keyword],
        reversed: false,
        position: selectedSpread?.positions[i]?.name,
      }));
    } else if (pickedCards.length > 0) {
      reading.cards = pickedCards.map((dc, i) => ({
        name: dc.card.name,
        keywords: dc.reversed ? dc.card.reversedKeywords : dc.card.uprightKeywords,
        reversed: dc.reversed,
        position: selectedSpread?.positions[i]?.name,
      }));
    } else if (freestylePicks.length > 0) {
      reading.cards = freestylePicks.map((dc) => ({
        name: dc.card.name,
        keywords: dc.reversed ? dc.card.reversedKeywords : dc.card.uprightKeywords,
        reversed: dc.reversed,
      }));
    }

    if (reading.cards.length === 0) return;

    setReadingHistory((prev) => {
      const updated = [reading, ...prev].slice(0, 50); // keep last 50
      try { localStorage.setItem(getTarotHistoryKey(currentUserId), JSON.stringify(updated)); } catch {}
      // Fire-and-forget Supabase backup
      import("@/lib/completionSync").then((m) => m.pushReadingToSupabase(reading)).catch(() => {});
      return updated;
    });
  }, [selectedDeck, selectedSpread, isOracleDeck, pickedOracleCards, pickedCards, freestylePicks, currentUserId]);

  /* ─── Manual save (opt-in) ─── */
  const [showSavedBanner, setShowSavedBanner] = useState(false);
  const [readingSaved, setReadingSaved] = useState(false);

  const handleSaveReading = useCallback(() => {
    if (readingSaved) return;
    saveReading();
    setReadingSaved(true);
    setShowSavedBanner(true);
    setTimeout(() => setShowSavedBanner(false), 3000);
  }, [saveReading, readingSaved]);

  // Reset saved flag when starting a new reading
  useEffect(() => {
    setReadingSaved(false);
  }, [selectedSpread]);
  useEffect(() => {
    if (pickedCards.length === 0 && pickedOracleCards.length === 0 && freestylePicks.length === 0) {
      setReadingSaved(false);
    }
  }, [pickedCards.length, pickedOracleCards.length, freestylePicks.length]);

  /* ─── Delete a saved reading ─── */
  const deleteReading = useCallback((id: string) => {
    setReadingHistory((prev) => {
      const updated = prev.filter((r) => r.id !== id);
      try { localStorage.setItem(getTarotHistoryKey(currentUserId), JSON.stringify(updated)); } catch {}
      return updated;
    });
  }, [currentUserId]);

  /* ─── Expanded reading in history ─── */
  const [expandedReadingId, setExpandedReadingId] = useState<string | null>(null);

  // Sync tarot readings from Supabase on mount (pulls remote readings user may have done on another device)
  useEffect(() => {
    if (!currentUserId) return;
    import("@/lib/completionSync").then((m) => m.syncTarotReadings()).then(() => {
      try {
        const saved = localStorage.getItem(getTarotHistoryKey(currentUserId));
        if (saved) setReadingHistory(JSON.parse(saved));
      } catch {}
    }).catch(() => {});
  }, [currentUserId]);

  /* ─── Start a spread reading ─── */
  const handleStartSpread = useCallback((spread: TarotSpread) => {
    setSelectedSpread(spread);
    if (isOracleDeck && activeOracleDeck) {
      const shuffled = shuffleArray(activeOracleDeck.cards);
      setShuffledOracleCards(shuffled);
      setPickedOracleCards([]);
    } else {
      const deck = shuffleDeck(ALL_CARDS);
      setShuffledDeck(deck);
    }
    setPickedCards([]);
    setCurrentPickPos(0);
    setFanRotation(0);
    setExpandedReadingCard(null);
    setView("picking");
  }, [isOracleDeck, activeOracleDeck]);

  /* ─── Pick a card from the fan for current spread position ─── */
  const pickCardForSpread = useCallback((deckIndex: number) => {
    if (!selectedSpread) return;

    if (isOracleDeck) {
      const oCard = shuffledOracleCards[deckIndex];
      if (!oCard || pickedOracleCards.some(p => p.card.id === oCard.id)) return;
      const newPicked = [...pickedOracleCards, { card: oCard, revealed: false, positionIndex: currentPickPos }];
      setPickedOracleCards(newPicked);
      if (currentPickPos + 1 < selectedSpread.cardCount) {
        setCurrentPickPos(currentPickPos + 1);
        setFanRotation(0);
      } else {
        setView("spread-view");
      }
      return;
    }

    const card = shuffledDeck[deckIndex];
    if (!card) return;
    if (pickedCards.some(p => p.card.id === card.id)) return;

    const drawn: DrawnCard = {
      card,
      reversed: Math.random() < 0.35,
      revealed: false,
      positionIndex: currentPickPos,
    };

    const newPicked = [...pickedCards, drawn];
    setPickedCards(newPicked);

    if (currentPickPos + 1 < selectedSpread.cardCount) {
      setCurrentPickPos(currentPickPos + 1);
      setFanRotation(0);
    } else {
      setView("spread-view");
    }
  }, [shuffledDeck, pickedCards, currentPickPos, selectedSpread, isOracleDeck, shuffledOracleCards, pickedOracleCards]);

  /* ─── Reveal a placed card ─── */
  const revealCard = useCallback((index: number) => {
    setPickedCards(prev => prev.map((c, i) => i === index ? { ...c, revealed: true } : c));
  }, []);

  /* ─── Freestyle fan pick ─── */
  const handleStartFreestyle = useCallback(() => {
    if (isOracleDeck && activeOracleDeck) {
      const shuffled = shuffleArray(activeOracleDeck.cards);
      setShuffledOracleCards(shuffled);
      setPickedOracleCards([]);
    }
    const deck = shuffleDeck(ALL_CARDS);
    setShuffledDeck(deck);
    setFreestylePicks([]);
    setFanRotation(0);
    setView("freestyle-fan");
  }, [isOracleDeck, activeOracleDeck]);

  /* ─── Begin the reading (confirm step after selecting a spread) ─── */
  const handleBeginReading = useCallback(() => {
    if (!pendingSpreadId) return;
    if (pendingSpreadId === "freestyle") {
      handleStartFreestyle();
      return;
    }
    const spread = SPREADS.find((s) => s.id === pendingSpreadId);
    if (spread) handleStartSpread(spread);
  }, [pendingSpreadId, handleStartFreestyle, handleStartSpread]);

  const pickFreestyleCard = useCallback((deckIndex: number) => {
    const card = shuffledDeck[deckIndex];
    if (!card || freestylePicks.some(p => p.card.id === card.id)) return;
    setFreestylePicks(prev => [...prev, {
      card, reversed: Math.random() < 0.35, revealed: false, positionIndex: prev.length,
    }]);
  }, [shuffledDeck, freestylePicks]);

  const revealFreestyleCard = useCallback((index: number) => {
    setFreestylePicks(prev => prev.map((c, i) => i === index ? { ...c, revealed: true } : c));
  }, []);

  /* ─── Active deck length (for fan rotation limits) ─── */
  const activeDeckLength = isOracleDeck ? shuffledOracleCards.length : shuffledDeck.length;

  /* ─── Fan touch handlers ─── */
  const onFanTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, rotation: fanRotation };
  }, [fanRotation]);

  const onFanTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const touch = e.touches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const newRot = touchStartRef.current.rotation + dx * 0.5;
    const maxRot = Math.max(0, (activeDeckLength - 15) * 3);
    setFanRotation(Math.max(-maxRot, Math.min(maxRot, newRot)));
  }, [activeDeckLength]);

  const onFanTouchEnd = useCallback(() => {
    touchStartRef.current = null;
  }, []);

  /* ─── Fan mouse handlers (desktop) ─── */
  const onFanMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    touchStartRef.current = { x: e.clientX, rotation: fanRotation };
  }, [fanRotation]);

  const onFanMouseMove = useCallback((e: React.MouseEvent) => {
    if (!touchStartRef.current) return;
    const dx = e.clientX - touchStartRef.current.x;
    const newRot = touchStartRef.current.rotation + dx * 0.5;
    const maxRot = Math.max(0, (activeDeckLength - 15) * 3);
    setFanRotation(Math.max(-maxRot, Math.min(maxRot, newRot)));
  }, [activeDeckLength]);

  const onFanMouseUp = useCallback(() => {
    touchStartRef.current = null;
  }, []);

  const onFanMouseLeave = useCallback(() => {
    touchStartRef.current = null;
  }, []);

  /* ─── AstroTarot insight ─── */
  function getAstroTarotInsight(card: TarotCard, reversed: boolean): string | null {
    if (!userChart?.planets || !userChart?.bigThree) return null;
    const { sun, moon, rising } = userChart.bigThree;
    const elementSigns: Record<string, string[]> = {
      Fire: ["Aries", "Leo", "Sagittarius"], Water: ["Cancer", "Scorpio", "Pisces"],
      Air: ["Gemini", "Libra", "Aquarius"], Earth: ["Taurus", "Virgo", "Capricorn"],
    };
    const relatedSigns = card.element ? elementSigns[card.element] || [] : [];
    const matchingPlanets = userChart.planets.filter(p => relatedSigns.some(s => p.sign?.includes(s)));

    if (card.arcana === "major") {
      if (card.name === "The Moon" && moon) return reversed
        ? `With your Moon in ${moon}, clarity about your emotional patterns is arriving. The fears that usually run your inner world are losing their grip.`
        : `With your Moon in ${moon}, this card hits your emotional depth directly. Trust the instinct your ${moon} Moon gives you.`;
      if (card.name === "The Sun" && sun) return reversed
        ? `As a ${sun} Sun, your core vitality is temporarily dimmed. The joy is still there — your ${sun} nature just needs space to reignite.`
        : `As a ${sun} Sun, this card amplifies everything your sign is about. Confidence, warmth, and clarity are yours to claim.`;
      if (card.name === "The Empress" && moon) return `Your Moon in ${moon} shapes how you nurture and create. The Empress${reversed ? " reversed asks where you've stopped nurturing yourself" : " says creative, abundant energy is flowing through your emotional nature right now"}.`;
      if (card.name === "The Emperor" && sun) return `Your ${sun} Sun influences how you take authority. The Emperor${reversed ? " reversed suggests your leadership style needs flexibility" : " affirms your ability to build structure"}.`;
      if (card.name === "The Tower" && rising) return `With ${rising} Rising, how you present yourself is getting disrupted. The Tower${reversed ? " reversed means you're resisting a necessary breakdown" : " is breaking down the mask — what emerges will be more authentic"}.`;
      if (card.name === "Death" && sun) return `As a ${sun} Sun, transformation hits at the core of your identity. Death${reversed ? " reversed means you're holding onto a version of yourself that's already gone" : " is asking you to shed a skin"}.`;
      if (card.name === "The Lovers" && sun && moon) return `With Sun in ${sun} and Moon in ${moon}, your love nature has two layers. The Lovers${reversed ? " reversed suggests misalignment between what your head wants and your heart needs" : " says those parts are coming into alignment"}.`;
      if (card.name === "The Hermit" && moon) return `Your Moon in ${moon} shapes your inner world. The Hermit${reversed ? " reversed says solitude has gone too far" : " validates your need to withdraw — your ${moon} Moon does its best processing in quiet"}.`;
      if (card.name === "Strength" && sun) return `As a ${sun} Sun, Strength${reversed ? " reversed says self-doubt is undermining your confidence" : " says you already have what you need — lead with patience, not force"}.`;
    }
    if (card.arcana === "minor" && card.element && matchingPlanets.length > 0) {
      const names = matchingPlanets.slice(0, 2).map(p => p.name).join(" and ");
      return `With your ${names} in ${card.element.toLowerCase()} signs, this ${SUIT_INFO[card.suit]?.name} card resonates with energy you already carry. ${reversed ? "The reversal suggests this familiar energy is blocked right now." : "Trust your instincts here."}`;
    }
    if (card.arcana === "minor" && card.element && matchingPlanets.length === 0) {
      return `You don't have strong ${card.element.toLowerCase()} energy in your chart, making this a growth edge. ${reversed ? "The reversal asks you to stretch into unfamiliar territory." : "Pay extra attention — it's bringing something your chart doesn't naturally access."}`;
    }
    return null;
  }

  /* ─── Navigate to Dolly with reading context ─── */
  const navigateDolly = useCallback((card?: DrawnCard) => {
    let context = "";

    if (card) {
      // Single card context
      const c = card.card;
      const orientation = card.reversed ? "reversed" : "upright";
      const keywords = card.reversed ? c.reversedKeywords : c.uprightKeywords;
      const meaning = card.reversed ? c.reversedMeaning : c.uprightMeaning;
      context = `I pulled ${c.name} (${orientation}) in a tarot reading. Keywords: ${keywords.join(", ")}. Meaning: "${meaning}" — Help me understand what this card means for me right now and how I can work with its energy.`;
    } else if (isOracleDeck && pickedOracleCards.length > 0) {
      // Oracle spread context
      const cardDescriptions = pickedOracleCards.map((p, i) => {
        const pos = selectedSpread?.positions[i];
        return `${pos ? pos.name + ": " : ""}${p.card.animal} (${p.card.keyword}) — "${p.card.meaning.slice(0, 120)}..."`;
      }).join("\n");
      context = `I just did a ${selectedSpread?.name || "freestyle"} oracle card reading with the Stitched Animal Oracle. Here are my cards:\n\n${cardDescriptions}\n\nHelp me understand the story these cards are telling together and what they mean for my life right now.`;
    } else if (pickedCards.length > 0) {
      // Tarot spread context
      const cardDescriptions = pickedCards.map((dc, i) => {
        const pos = selectedSpread?.positions[i];
        const orientation = dc.reversed ? "reversed" : "upright";
        const keywords = dc.reversed ? dc.card.reversedKeywords : dc.card.uprightKeywords;
        return `${pos ? pos.name + ": " : ""}${dc.card.name} (${orientation}) — ${keywords.join(", ")}`;
      }).join("\n");
      context = `I just did a ${selectedSpread?.name || "freestyle"} tarot reading. Here are my cards:\n\n${cardDescriptions}\n\nHelp me understand the story these cards are telling together, how they relate to each other, and what guidance they offer for my life right now.`;
    } else if (freestylePicks.length > 0) {
      // Freestyle picks
      const cardDescriptions = freestylePicks.map((dc) => {
        const orientation = dc.reversed ? "reversed" : "upright";
        return `${dc.card.name} (${orientation})`;
      }).join(", ");
      context = `I pulled these tarot cards in a freestyle reading: ${cardDescriptions}. Help me understand what they mean together and what message they have for me.`;
    }

    if (context) {
      sessionStorage.setItem("dolly-context", context);
    }
    router.push("/dolly");
  }, [router, isOracleDeck, pickedOracleCards, pickedCards, freestylePicks, selectedSpread]);

  // Prompt to save the reading before handing it off to Dolly (the save is opt-in,
  // so without this the reading would be lost when you leave for Dolly).
  const [dollySave, setDollySave] = useState<{ card?: DrawnCard } | null>(null);
  const goToDolly = useCallback((card?: DrawnCard) => {
    const hasReading = pickedCards.length > 0 || pickedOracleCards.length > 0 || freestylePicks.length > 0;
    if (hasReading && !readingSaved) { setDollySave({ card }); return; }
    navigateDolly(card);
  }, [pickedCards, pickedOracleCards, freestylePicks, readingSaved, navigateDolly]);

  const dollySaveModal = dollySave ? (
    <div onClick={() => setDollySave(null)} style={{ position: "fixed", inset: 0, zIndex: 60, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 440, margin: 12, borderRadius: 18, background: "var(--background-card)", border: "0.5px solid var(--border-card)", padding: 20, boxShadow: "0 12px 40px rgba(0,0,0,0.4)" }}>
        <p style={{ fontFamily: "var(--font-heading)", fontSize: 17, color: "var(--foreground)", margin: "0 0 6px" }}>Save this reading?</p>
        <p style={{ fontSize: 13, lineHeight: 1.5, color: "var(--foreground-muted)", margin: "0 0 16px" }}>Save it to your history before you take it to Dolly, so you can come back to it later.</p>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => { const c = dollySave.card; handleSaveReading(); setDollySave(null); navigateDolly(c); }} style={{ flex: 1, padding: "11px 0", borderRadius: 12, background: "var(--brass)", color: "#1a1020", border: "none", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>Save &amp; continue</button>
          <button onClick={() => { const c = dollySave.card; setDollySave(null); navigateDolly(c); }} style={{ flex: 1, padding: "11px 0", borderRadius: 12, background: "transparent", color: "var(--foreground-muted)", border: "0.5px solid var(--border-card)", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>Skip</button>
        </div>
      </div>
    </div>
  ) : null;

  /* ═══════════════════════════════════════════
     RENDER: Oracle Card Detail View
     ═══════════════════════════════════════════ */
  if (view === "card-detail" && isOracleDeck && detailOracleCard) {
    const oCard = detailOracleCard;
    return (
      <main className="flex-1 flex flex-col px-5 py-6 max-w-lg mx-auto w-full overflow-y-auto">
        <button
          onClick={() => { setDetailOracleCard(null); setView(selectedSpread ? "spread-view" : pickedOracleCards.length > 0 ? "freestyle-fan" : "decks"); }}
          className="flex items-center gap-2 text-muted text-sm mb-4 active:text-secondary"
        >
          <span className="text-lg">‹</span> Back
        </button>

        {/* Position context */}
        {detailPosition && (
          <div className="mb-4">
            <span className="text-[10px] tracking-widest uppercase text-muted">{detailPosition.name}</span>
            <p className="text-muted text-[10px] mt-0.5">{detailPosition.description}</p>
          </div>
        )}

        {/* Card image */}
        <div className="flex justify-center mb-5">
          <div className="w-40 rounded-xl overflow-hidden border border-foreground/18 shadow-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={oCard.image} alt={`${oCard.animal} — ${oCard.keyword}`} className="w-full h-auto" />
          </div>
        </div>

        {/* Card header */}
        <div className="text-center mb-4">
          <h1 className="text-xl text-foreground mb-1" style={{ fontFamily: "var(--font-heading)" }}>
            {oCard.animal}
          </h1>
          <span className="text-xs tracking-widest uppercase text-terracotta/70">{oCard.keyword}</span>
        </div>

        {/* Meaning */}
        <div className="mb-5">
          <p className="text-secondary text-sm leading-relaxed">{oCard.meaning}</p>
        </div>

        {/* Media recommendations */}
        {oCard.media && (
          <div className="rounded-lg bg-foreground/3 border border-foreground/15 p-4 mb-5">
            <span className="text-[9px] tracking-widest uppercase text-muted block mb-2.5">Recommended</span>
            <div className="space-y-2">
              {oCard.media.book && (
                <div className="flex items-start gap-2">
                  <span className="text-muted text-[10px] mt-0.5">📖</span>
                  <p className="text-muted text-xs leading-relaxed">{oCard.media.book}</p>
                </div>
              )}
              {oCard.media.film && (
                <div className="flex items-start gap-2">
                  <span className="text-muted text-[10px] mt-0.5">🎬</span>
                  <p className="text-muted text-xs leading-relaxed">{oCard.media.film}</p>
                </div>
              )}
              {oCard.media.song && (
                <div className="flex items-start gap-2">
                  <span className="text-muted text-[10px] mt-0.5">🎵</span>
                  <p className="text-muted text-xs leading-relaxed">{oCard.media.song}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Talk to Dolly */}
        <button
          onClick={() => goToDolly()}
          className="w-full py-3 rounded-xl border border-foreground/15 bg-foreground/3 text-muted text-sm flex items-center justify-center gap-2 active:bg-foreground/6 transition-colors mb-4"
        >
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" strokeWidth="1.5" stroke="currentColor" strokeLinecap="round">
            <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
          </svg>
          Talk to Dolly about this card
        </button>
        {dollySaveModal}

        {/* Share */}
        <button
          onClick={async () => {
            const fallback = `I pulled the ${oCard.animal} oracle card.\n\n${oCard.keyword}\n\n${oCard.meaning}\n\n— Mapped Astrology`;
            setCopiedShare("oracle-detail");
            await shareReadingAsImage(
              { spreadName: "Oracle Pull", date: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric" }), cards: [{ name: oCard.animal, keywords: [oCard.keyword] }] },
              fallback
            );
            setTimeout(() => setCopiedShare(null), 2000);
          }}
          className="w-full py-3 rounded-xl border border-foreground/15 text-muted text-sm flex items-center justify-center gap-2 active:bg-foreground/6 transition-colors mb-4"
        >
          <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" />
          </svg>
          {copiedShare === "oracle-detail" ? "Shared!" : "Share this card"}
        </button>
      </main>
    );
  }

  /* ═══════════════════════════════════════════
     RENDER: Card Detail View (Tarot)
     ═══════════════════════════════════════════ */
  if (view === "card-detail" && detailCard) {
    const { card, reversed } = detailCard;
    const deep = tarotMeanings[card.id];
    const suitColor = SUIT_INFO[card.suit]?.color || "#888";
    const isAstro = selectedDeck === "astro-tarot";
    const astroInsight = isAstro ? getAstroTarotInsight(card, reversed) : null;

    return (
      <main className="flex-1 flex flex-col px-5 py-6 max-w-lg mx-auto w-full overflow-y-auto">
        <button
          onClick={() => setView(selectedSpread ? "spread-view" : freestylePicks.length > 0 ? "freestyle-fan" : "decks")}
          className="flex items-center gap-2 text-muted text-sm mb-4 active:text-secondary"
        >
          <span className="text-lg">‹</span> Back
        </button>

        {/* Position context */}
        {detailPosition && (
          <div className="mb-4">
            <span className="text-[10px] tracking-widest uppercase text-muted">{detailPosition.name}</span>
            <p className="text-muted text-[10px] mt-0.5">{detailPosition.description}</p>
          </div>
        )}

        {/* Card image */}
        {getCardImagePath(card.id) && (
          <div className="flex justify-center mb-5">
            <div className="w-32 rounded-xl overflow-hidden border border-foreground/15 shadow-lg"
              style={{ transform: reversed ? "rotate(180deg)" : "none" }}>
              <Image src={getCardImagePath(card.id)!} alt={card.name} width={128} height={205}
                className="w-full h-auto" draggable={false} priority />
            </div>
          </div>
        )}

        {/* Card header */}
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
            {card.name}
            {reversed && <span className="text-muted text-sm ml-2">(Reversed)</span>}
          </h1>
          <span className="text-[10px] text-muted">{SUIT_INFO[card.suit]?.name}{card.element && ` · ${card.element}`}</span>
        </div>

        {/* Keywords */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {(reversed ? card.reversedKeywords : card.uprightKeywords).map(kw => (
            <span key={kw} className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: `${suitColor}15`, color: `${suitColor}cc` }}>{kw}</span>
          ))}
        </div>

        {/* Main meaning */}
        <div className="mb-4">
          <p className="text-secondary text-sm leading-relaxed">
            {deep ? (reversed ? deep.reversed : deep.upright) : (reversed ? card.reversedMeaning : card.uprightMeaning)}
          </p>
        </div>

        {/* Advice */}
        {deep?.advice && (
          <div className="rounded-lg bg-foreground/3 border border-foreground/15 p-3 mb-4">
            <span className="text-[9px] tracking-widest uppercase text-muted block mb-1">The Takeaway</span>
            <p className="text-muted text-xs leading-relaxed italic">{deep.advice}</p>
          </div>
        )}

        {/* Context meanings */}
        {deep && (
          <div className="space-y-3 mb-4">
            {[
              { key: "love", label: "Love & Relationships", icon: "♡", text: deep.love },
              { key: "career", label: "Career & Finances", icon: "◆", text: deep.career },
              { key: "spiritual", label: "Spiritual Growth", icon: "✦", text: deep.spiritual },
            ].map(ctx => (
              <div key={ctx.key} className="rounded-lg border border-foreground/15 p-3" style={{ background: `${suitColor}05` }}>
                <span className="text-[9px] tracking-widest uppercase block mb-1" style={{ color: `${suitColor}88` }}>
                  {ctx.icon} {ctx.label}
                </span>
                <p className="text-muted text-xs leading-relaxed">{ctx.text}</p>
              </div>
            ))}
          </div>
        )}


        {/* AstroTarot insight */}
        {isAstro && astroInsight && (
          <div className="mt-1 pl-3 border-l-2 mb-4" style={{ borderColor: `${suitColor}44` }}>
            <span className="text-[9px] tracking-widest uppercase block mb-1" style={{ color: suitColor }}>✦ Your Chart&apos;s Take</span>
            <p className="text-muted text-xs leading-relaxed italic">{astroInsight}</p>
          </div>
        )}

        {/* Talk to Dolly */}
        <button
          onClick={() => goToDolly(detailCard)}
          className="w-full py-3 rounded-xl border border-foreground/15 bg-foreground/3 text-muted text-sm flex items-center justify-center gap-2 active:bg-foreground/6 transition-colors mb-4"
        >
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" strokeWidth="1.5" stroke="currentColor" strokeLinecap="round">
            <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
          </svg>
          Talk to Dolly about this card
        </button>
        {dollySaveModal}

        {/* Share */}
        <button
          onClick={async () => {
            const orientation = reversed ? "Reversed" : "Upright";
            const keywords = reversed ? card.reversedKeywords : card.uprightKeywords;
            const meaning = reversed ? (deep?.reversed || card.reversedMeaning) : (deep?.upright || card.uprightMeaning);
            const fallback = `I pulled ${card.name} (${orientation}) from the tarot.\n\n${keywords.slice(0, 3).join(" · ")}\n\n${meaning}\n\n— Mapped Astrology`;
            setCopiedShare("tarot-detail");
            await shareReadingAsImage(
              { spreadName: "Tarot Pull", date: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric" }), cards: [{ name: card.name, reversed, keywords: keywords.slice(0, 4) }] },
              fallback
            );
            setTimeout(() => setCopiedShare(null), 2000);
          }}
          className="w-full py-3 rounded-xl border border-foreground/15 text-muted text-sm flex items-center justify-center gap-2 active:bg-foreground/6 transition-colors mb-4"
        >
          <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" />
          </svg>
          {copiedShare === "tarot-detail" ? "Shared!" : "Share this card"}
        </button>
      </main>
    );
  }

  /* ═══════════════════════════════════════════
     RENDER: My Decks
     ═══════════════════════════════════════════ */
  if (view === "decks") {
    return (
      <main className="flex-1 flex flex-col px-5 pt-5 pb-8 max-w-lg mx-auto w-full overflow-y-auto">
        <div className="text-center pt-1 pb-1">
          <p style={{ fontFamily: "var(--font-heading)", fontSize: 30, fontWeight: 400, letterSpacing: "0.16em", textTransform: "uppercase", lineHeight: 1.1, color: "var(--foreground)" }}>Tarot</p>
          <p style={{ fontFamily: "var(--font-script)", fontSize: 38, lineHeight: 1, marginTop: -2, color: "var(--brass)" }}>
            {deckTab === "store" ? "the deck store" : "choose your deck"}
          </p>
          {deckTab === "my-decks" && (
            <p className="text-[11.5px] leading-relaxed mx-auto mt-3" style={{ maxWidth: 300, color: "var(--foreground-muted)" }}>
              Pick a deck to read from. Each carries its own voice — then you&rsquo;ll choose how to lay the cards.
            </p>
          )}
        </div>

        {/* My Decks / Store tabs */}
        <div
          className="flex mx-auto mt-4 rounded-full p-1"
          style={{ backgroundColor: "var(--background-card)", border: "1px solid var(--border-card)" }}
          role="tablist"
        >
          {(["my-decks", "store"] as const).map((tab) => (
            <button
              key={tab}
              role="tab"
              aria-selected={deckTab === tab}
              onClick={() => setDeckTab(tab)}
              className="px-5 rounded-full text-[12px] font-semibold tracking-[0.06em] transition-colors"
              style={deckTab === tab
                // 40px tall inside a 1px-padded pill, so the tab itself clears
                // the 44px touch target once its padding is counted. It was
                // py-1.5 (30px), which is small for the control that switches
                // between the whole deck list and the whole store.
                ? { minHeight: 40, backgroundColor: "var(--brass)", color: "var(--btn-ink)" }
                : { minHeight: 40, color: "var(--foreground-muted)" }}
            >
              {tab === "my-decks" ? "My Decks" : "Deck Store"}
            </button>
          ))}
        </div>

        {deckTab === "store" && (
          <div className="mt-6">
            <DeckStore justPurchased={justPurchasedDeck} />
          </div>
        )}

        {/* Decks — plum horizontal cards with fanned cover */}
        <div className={deckTab === "store" ? "hidden" : "flex flex-col gap-4 mt-7"}>
          <DeckRow
            tag="Tarot · 78 cards"
            name="Classic Tarot"
            sub="The full Major & Minor Arcana — the traditional voice."
            count="78 cards"
            covers={["major-0", "major-8", "major-13"].map((id) => getCardImagePath(id)!).filter(Boolean)}
            onClick={() => { setSelectedDeck("classic-tarot"); setPendingSpreadId(null); setQuestion(""); setView("spreads"); }}
          />
          {/* Oracle decks are sold in the Deck Store — playable when owned,
              otherwise shown locked with a path to the store. */}
          {ORACLE_DECK_REGISTRY.map((deck) => {
            const isOwned = ownedStoreDecks.includes(deck.id);
            return (
              <DeckRow
                key={deck.id}
                tag={isOwned ? `Oracle · ${deck.cardCount} cards` : `Oracle · ${deck.cardCount} cards · In the Deck Store`}
                name={deck.name}
                sub={isOwned ? deck.description : `${deck.description.split(".")[0]}. Tap to see the cards and unlock it.`}
                count={`${deck.cardCount} cards`}
                covers={[0, 1, 2].map((i) => deck.cards[Math.min(i, deck.cards.length - 1)]?.image || `/oracle/${deck.id}/${i + 1}.webp`)}
                onClick={() => {
                  if (isOwned) { setSelectedDeck(deck.id); setPendingSpreadId(null); setQuestion(""); setView("spreads"); }
                  else setDeckTab("store");
                }}
              />
            );
          })}
          {oracleDecks.filter((d) => d.purchased).map((deck) => (
            <DeckRow
              key={deck.id}
              tag={`Oracle · ${deck.cardCount} cards`}
              name={deck.name}
              sub={deck.description || ""}
              count={`${deck.cardCount} cards`}
              covers={[]}
              gradient={deck.coverColor}
              onClick={() => { setSelectedDeck(deck.id); setPendingSpreadId(null); setQuestion(""); setView("spreads"); }}
            />
          ))}
        </div>

        {/* ─── Past Readings (hidden while browsing the store) ─── */}
        {deckTab === "my-decks" && readingHistory.length === 0 && (
          <div className="mt-8 text-center py-6">
            <p className="text-muted text-[12px] leading-relaxed">
              Your readings will appear here once you pull your first cards.
            </p>
          </div>
        )}
        {deckTab === "my-decks" && readingHistory.length > 0 && (
          <div className="mt-8">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center justify-between w-full mb-3"
            >
              <h2 className="text-muted text-[10px] tracking-widest uppercase">
                Past Readings
              </h2>
              <span className="text-muted text-[10px]">
                {readingHistory.length} · {showHistory ? "Hide" : "Show"}
              </span>
            </button>
            {showHistory && (
              <div className="space-y-2">
                {readingHistory.slice(0, 20).map((reading) => {
                  const isExpanded = expandedReadingId === reading.id;
                  return (
                    <div
                      key={reading.id}
                      className="rounded-xl border border-foreground/10 bg-foreground/3 overflow-hidden"
                    >
                      {/* Header — tap to expand/collapse */}
                      <button
                        onClick={() => setExpandedReadingId(isExpanded ? null : reading.id)}
                        className="w-full flex items-center justify-between p-3.5 active:bg-foreground/5 transition-colors"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-foreground text-sm font-medium truncate" style={{ fontFamily: "var(--font-heading)" }}>
                            {reading.spreadName}
                          </span>
                          <span className="text-muted text-[10px] flex-shrink-0">
                            {reading.cards.length} card{reading.cards.length !== 1 ? "s" : ""}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-muted text-[10px]">
                            {new Date(reading.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </span>
                          <svg
                            width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                            className={`text-muted transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </button>

                      {/* Expanded detail */}
                      {isExpanded && (
                        <div className="px-3.5 pb-3.5 border-t border-foreground/[0.06]">
                          {/* Card list */}
                          <div className="py-3 space-y-2">
                            {reading.cards.map((card, i) => (
                              <div key={i} className="flex items-start gap-2">
                                {card.position && (
                                  <span className="text-muted text-[10px] font-medium uppercase tracking-wider min-w-[60px] pt-0.5 flex-shrink-0">
                                    {card.position}
                                  </span>
                                )}
                                <div className="min-w-0">
                                  <span className="text-foreground text-xs font-medium">
                                    {card.name}{card.reversed ? " ↓" : ""}
                                  </span>
                                  {card.keywords && card.keywords.length > 0 && (
                                    <p className="text-muted text-[10px] mt-0.5">
                                      {card.keywords.slice(0, 3).join(" · ")}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Action buttons */}
                          <div className="flex items-center gap-3 pt-2 border-t border-foreground/[0.06]">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const cardsSummary = reading.cards.map(c =>
                                  `${c.position ? c.position + ": " : ""}${c.name}${c.reversed ? " (Reversed)" : ""}${c.keywords?.length ? " — " + c.keywords.slice(0, 3).join(", ") : ""}`
                                ).join(". ");
                                const dollyContext = `I did a ${reading.spreadName} reading on ${new Date(reading.date).toLocaleDateString("en-US", { month: "long", day: "numeric" })}. Cards: ${cardsSummary}. Help me revisit this reading and understand what these cards were telling me.`;
                                sessionStorage.setItem("dolly-context", dollyContext);
                                router.push("/dolly");
                              }}
                              className="flex items-center gap-1.5 text-muted text-[10px] font-medium active:text-foreground transition-colors"
                            >
                              <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" strokeWidth="1.5" stroke="currentColor" strokeLinecap="round">
                                <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
                              </svg>
                              Ask Dolly
                            </button>
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                const dateStr = new Date(reading.date).toLocaleDateString("en-US", { month: "long", day: "numeric" });
                                const cardLines = reading.cards.map(c =>
                                  `${c.position ? c.position + ": " : ""}${c.name}${c.reversed ? " (Reversed)" : ""}`
                                ).join("\n");
                                const fallback = `My ${reading.spreadName} reading (${dateStr}):\n\n${cardLines}\n\n— Mapped Astrology`;
                                setCopiedShare(`history-${reading.id}`);
                                await shareReadingAsImage(
                                  { spreadName: reading.spreadName, date: dateStr, cards: reading.cards },
                                  fallback
                                );
                                setTimeout(() => setCopiedShare(null), 2000);
                              }}
                              className="flex items-center gap-1.5 text-muted text-[10px] font-medium active:text-foreground transition-colors"
                            >
                              <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" />
                              </svg>
                              {copiedShare === `history-${reading.id}` ? "Shared!" : "Share"}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm("Delete this reading?")) {
                                  deleteReading(reading.id);
                                  setExpandedReadingId(null);
                                }
                              }}
                              className="flex items-center gap-1.5 text-muted text-[10px] font-medium active:text-red-400/80 transition-colors ml-auto"
                            >
                              <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                                <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" />
                              </svg>
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>
    );
  }

  /* ═══════════════════════════════════════════
     RENDER: Spread Selection
     ═══════════════════════════════════════════ */
  if (view === "spreads") {
    const slotStyle = (extra?: React.CSSProperties): React.CSSProperties => ({
      width: 10, height: 15, borderRadius: 2.5, background: "rgba(201,169,97,0.2)", border: "0.5px solid rgba(201,169,97,0.4)", ...extra,
    });
    return (
      <main className="flex-1 flex flex-col px-5 pt-5 pb-8 max-w-lg mx-auto w-full overflow-y-auto">
        {/* Selected-deck hero */}
        <div className="flex flex-col items-center pt-2 pb-1">
          <span className="text-[8.5px] tracking-[0.2em] uppercase font-bold" style={{ color: "var(--brass)" }}>
            {isOracleDeck ? "Oracle" : "Tarot"} deck
          </span>
          <p className="mt-1.5" style={{ fontFamily: "var(--font-heading)", fontSize: 26, color: "var(--foreground)" }}>
            {isOracleDeck ? (activeOracleDeck?.name || getOracleDeck(selectedDeck)?.name || "Oracle") : "Classic Tarot"}
          </p>
          <button onClick={() => setView("decks")} className="mt-2 text-[11px] underline underline-offset-2" style={{ color: "var(--foreground-faint)" }}>
            Change deck
          </button>
        </div>

        <p className="text-[9px] tracking-[0.25em] uppercase font-bold mt-8 mb-4" style={{ color: "var(--brass)" }}>How would you like to read?</p>
        <div className="flex flex-col gap-3 mb-3">
          {SPREADS.map((spread) => (
            <button
              key={spread.id}
              onClick={() => { setPendingSpreadId(spread.id); setQuestion(""); setView("intention"); }}
              className="w-full text-left flex items-center gap-4 active:scale-[0.99]"
              style={{ borderRadius: 18, background: "#4a2540", border: "1px solid rgba(201,169,97,0.16)", padding: "15px 16px", boxShadow: "0 6px 22px rgba(0,0,0,0.28)", transition: "border-color .18s, transform .15s" }}
            >
              {/* position diagram */}
              <span className="shrink-0 flex items-center justify-center gap-1" style={{ width: 62, height: 44 }}>
                {Array.from({ length: Math.min(spread.cardCount, 5) }).map((_, i) => (
                  <span key={i} style={slotStyle()} />
                ))}
              </span>
              <span className="flex-1 min-w-0">
                <span className="block" style={{ fontFamily: "var(--font-heading)", fontSize: 17, lineHeight: 1.1, color: "#f0e6d2" }}>{spread.name}</span>
                <span className="block text-[11.5px] mt-0.5" style={{ lineHeight: 1.4, color: "rgba(240,230,210,0.58)" }}>{spread.cardCount} {spread.cardCount === 1 ? "card" : "cards"} · {spread.description}</span>
              </span>
              <span className="shrink-0" style={{ color: "rgba(240,230,210,0.4)", fontSize: 20 }}>›</span>
            </button>
          ))}

          {/* Freestyle */}
          <button
            onClick={() => { setPendingSpreadId("freestyle"); setQuestion(""); setView("intention"); }}
            className="w-full text-left flex items-center gap-4 active:scale-[0.99]"
            style={{ borderRadius: 18, background: "#4a2540", border: "1px solid rgba(201,169,97,0.16)", padding: "15px 16px", boxShadow: "0 6px 22px rgba(0,0,0,0.28)", transition: "border-color .18s, transform .15s" }}
          >
            <span className="shrink-0 flex items-center justify-center" style={{ width: 62, height: 44 }}>
              <span style={slotStyle({ transform: "rotate(-11deg)" })} />
              <span style={slotStyle({ transform: "rotate(5deg)", marginLeft: -6 })} />
              <span style={slotStyle({ transform: "rotate(-2deg)", marginLeft: -6 })} />
            </span>
            <span className="flex-1 min-w-0">
              <span className="block" style={{ fontFamily: "var(--font-heading)", fontSize: 17, lineHeight: 1.1, color: "#f0e6d2" }}>Fanned</span>
              <span className="block text-[11.5px] mt-0.5" style={{ lineHeight: 1.4, color: "rgba(240,230,210,0.58)" }}>No rules — swipe the arc and pick the cards that call to you.</span>
            </span>
            <span className="shrink-0" style={{ color: "rgba(240,230,210,0.4)", fontSize: 20 }}>›</span>
          </button>
        </div>
      </main>
    );
  }

  /* ═══════════════════════════════════════════
     RENDER: Intention (one tap from a spread → set an intention → draw)
     ═══════════════════════════════════════════ */
  if (view === "intention" && pendingSpreadId) {
    const isFree = pendingSpreadId === "freestyle";
    const spread = SPREADS.find((s) => s.id === pendingSpreadId);
    const name = isFree ? "Fanned" : (spread?.name || "");
    const cardCount = isFree ? "" : `${spread?.cardCount ?? ""} ${spread?.cardCount === 1 ? "card" : "cards"} · `;
    const guide = isFree ? SPREAD_GUIDES["freestyle"] : (SPREAD_GUIDES[pendingSpreadId] || spread?.description || "");
    const deckName = isOracleDeck ? (activeOracleDeck?.name || getOracleDeck(selectedDeck)?.name || "Oracle") : "Classic Tarot";
    return (
      <main className="flex-1 flex flex-col px-5 pt-5 pb-8 max-w-lg mx-auto w-full overflow-y-auto">
        <button onClick={() => setView("spreads")} className="self-start text-[12px] flex items-center gap-1.5 mb-4" style={{ color: "var(--foreground-faint)" }}>
          <span style={{ fontSize: 16 }}>‹</span> Spreads
        </button>

        <div className="flex flex-col items-center text-center pt-4 pb-2">
          <span className="text-[8.5px] tracking-[0.24em] uppercase font-bold" style={{ color: "var(--brass)" }}>Your reading</span>
          <p className="mt-1.5" style={{ fontFamily: "var(--font-heading)", fontSize: 30, color: "var(--foreground)" }}>{name}</p>
          <p className="text-[11.5px] mt-1" style={{ color: "var(--foreground-muted)" }}>{cardCount}{deckName}</p>
        </div>

        <div className="mt-4" style={{ padding: "13px 16px", borderRadius: 14, background: "#4a2540", border: "1px solid rgba(201,169,97,0.16)" }}>
          <p className="text-[8px] tracking-[0.22em] uppercase font-bold" style={{ color: "var(--brass)", margin: "0 0 6px" }}>About this spread</p>
          <p className="text-[12px]" style={{ lineHeight: 1.6, margin: 0, color: "rgba(240,230,210,0.7)" }}>{guide}</p>
        </div>

        <label className="block text-[9px] tracking-[0.25em] uppercase font-bold mt-6 mb-2.5" style={{ color: "var(--brass)" }}>
          Ask a question · set your intention <span style={{ color: "var(--foreground-faint)", letterSpacing: "0.04em", textTransform: "none", fontWeight: 500 }}>— optional</span>
        </label>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          rows={3}
          autoFocus
          placeholder="What’s on your mind? Hold it as the cards turn…"
          className="w-full resize-none outline-none"
          style={{ boxSizing: "border-box", padding: "14px 15px", borderRadius: 14, background: "#4a2540", border: "1px solid rgba(201,169,97,0.16)", color: "#f0e6d2", fontFamily: "inherit", fontSize: 14, lineHeight: 1.5 }}
        />

        <button
          onClick={handleBeginReading}
          className="w-full flex items-center justify-center gap-2 mt-6"
          style={{ padding: 16, borderRadius: 99, border: "none", background: "var(--brass)", color: "#1a1815", cursor: "pointer" }}
        >
          <span style={{ fontFamily: "var(--font-script)", fontSize: 19 }}>Draw your cards</span>
          <span style={{ fontSize: 15 }}>→</span>
        </button>
        <p className="text-center text-[10.5px] mt-3.5" style={{ lineHeight: 1.6, color: "var(--foreground-faint)" }}>
          {isFree ? "Swipe the fan and pick the cards that call to you" : `Drawing ${name} from ${deckName}`}
        </p>
      </main>
    );
  }

  /* ═══════════════════════════════════════════
     RENDER: Card Picking (fanned deck for each spread position)
     ═══════════════════════════════════════════ */
  if (view === "picking" && selectedSpread) {
    const pos = selectedSpread.positions[currentPickPos];
    const fanDeck = isOracleDeck ? shuffledOracleCards : shuffledDeck;
    const fanPickedIds = isOracleDeck ? pickedOracleCards.map(p => p.card.id) : pickedCards.map(p => p.card.id);
    const totalCards = fanDeck.length;
    const fanSpread = 140; // total degrees of the fan arc
    const cardsInFan = Math.min(totalCards, 78);

    return (
      <main className="flex-1 flex flex-col px-5 py-4 max-w-lg mx-auto w-full overflow-hidden">
        <button onClick={() => { setView("spreads"); setPickedCards([]); }}
          className="flex items-center gap-2 text-muted text-sm mb-2 active:text-secondary"
        >
          <span className="text-lg">‹</span> Back
        </button>

        {/* Position indicator */}
        <div className="text-center mb-3">
          <p className="text-foreground text-sm font-medium" style={{ fontFamily: "var(--font-heading)" }}>
            {pos?.name || `Card ${currentPickPos + 1}`}
          </p>
          <p className="text-muted text-[10px] mt-0.5">{pos?.description}</p>
          <p className="text-muted text-[10px] mt-1">
            {currentPickPos + 1} of {selectedSpread.cardCount} · Swipe & tap to pick
          </p>
          {question && (
            <p className="mx-auto mt-1.5" style={{ fontFamily: "var(--font-script)", fontSize: 16, lineHeight: 1.45, maxWidth: 280, color: "var(--brass)" }}>&ldquo;{question}&rdquo;</p>
          )}
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-1.5 mb-4">
          {Array.from({ length: selectedSpread.cardCount }).map((_, i) => (
            <div key={i} className={`w-2 h-2 rounded-full transition-all ${
              i < currentPickPos ? "bg-terracotta/60" : i === currentPickPos ? "bg-terracotta" : "bg-foreground/10"
            }`} />
          ))}
        </div>

        {/* Fanned card deck — touch/mouse to swipe */}
        <div
          ref={fanRef}
          className="relative flex-1 min-h-[280px] overflow-hidden"
          onTouchStart={onFanTouchStart}
          onTouchMove={onFanTouchMove}
          onTouchEnd={onFanTouchEnd}
          onMouseDown={onFanMouseDown}
          onMouseMove={onFanMouseMove}
          onMouseUp={onFanMouseUp}
          onMouseLeave={onFanMouseLeave}
          style={{ touchAction: "none", userSelect: "none" }}
        >
          <div className="absolute bottom-4 left-1/2" style={{ transform: "translateX(-50%)" }}>
            {fanDeck.slice(0, cardsInFan).map((card, i) => {
              const cardId = "id" in card ? (card as { id: string }).id : "";
              const isPicked = fanPickedIds.includes(cardId);
              const baseAngle = ((i - cardsInFan / 2) / cardsInFan) * fanSpread;
              const angle = baseAngle + fanRotation;

              if (angle < -90 || angle > 90) return null;

              return (
                <button
                  key={cardId}
                  onClick={() => !isPicked && pickCardForSpread(i)}
                  className="absolute transition-opacity duration-150"
                  style={{
                    width: CARD_W,
                    height: CARD_H,
                    left: -CARD_W / 2,
                    bottom: 0,
                    transform: `rotate(${angle}deg)`,
                    transformOrigin: `50% ${CARD_H + 80}px`,
                    opacity: isPicked ? 0.15 : Math.abs(angle) < 15 ? 1 : Math.abs(angle) < 40 ? 0.7 : 0.4,
                    zIndex: cardsInFan - Math.abs(Math.round(angle)),
                    pointerEvents: isPicked ? "none" : "auto",
                  }}
                >
                  <div
                    className="w-full h-full rounded-lg border border-foreground/20 overflow-hidden"
                    style={{
                      background: isOracleDeck
                        ? "linear-gradient(135deg, #f0e6d2, #e8dcc4)"
                        : "linear-gradient(135deg, #1f1730, #2a2030, #1f1730)",
                      boxShadow: Math.abs(angle) < 8 ? "0 0 12px rgba(201,168,76,0.1)" : "none",
                    }}
                  >
                    {isOracleDeck && activeOracleDeck ? (
                      <Image src={activeOracleDeck.backImage} alt="Card back" width={CARD_W} height={CARD_H}
                        className="w-full h-full object-cover" draggable={false} />
                    ) : (
                      <Image src={CARD_BACK_IMAGE} alt="Card back" width={CARD_W} height={CARD_H}
                        className="w-full h-full object-cover" draggable={false} />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <p className="text-muted text-[10px] text-center mt-2 mb-2">← swipe to browse →</p>
      </main>
    );
  }

  /* ═══════════════════════════════════════════
     RENDER: Spread View (all cards placed)
     ═══════════════════════════════════════════ */
  if (view === "spread-view" && selectedSpread) {
    // Oracle spread view
    if (isOracleDeck) {
      const allRevealed = pickedOracleCards.every(c => c.revealed);

      return (
        <main className="flex-1 flex flex-col px-5 py-6 max-w-lg mx-auto w-full overflow-y-auto">
          <button onClick={() => { setView("spreads"); setPickedOracleCards([]); }}
            className="flex items-center gap-2 text-muted text-sm mb-4 active:text-secondary"
          >
            <span className="text-lg">‹</span> Back to spreads
          </button>

          <p className="text-[8.5px] tracking-[0.2em] uppercase font-bold text-center" style={{ color: "var(--brass)" }}>
            {activeOracleDeck?.name || "Oracle"}
          </p>
          <h1 className="text-center mt-1 mb-1.5" style={{ fontFamily: "var(--font-heading)", fontSize: 24, color: "var(--foreground)" }}>
            {selectedSpread.name}
          </h1>
          <p className="text-muted text-xs text-center mb-4">
            {allRevealed ? "Tap any card to read its message" : "Tap each card to reveal it"}
          </p>
          {question && (
            <p className="text-center mx-auto -mt-2 mb-4" style={{ fontFamily: "var(--font-script)", fontSize: 16, lineHeight: 1.45, maxWidth: 280, color: "var(--brass)" }}>&ldquo;{question}&rdquo;</p>
          )}

          {showSavedBanner && (
            <div className="text-center mb-3 py-1.5 px-4 rounded-full bg-sage/15 border border-sage/25 text-sage text-xs font-medium mx-auto" style={{ display: "flex", justifyContent: "center", width: "fit-content" }}>
              Saved to Past Readings
            </div>
          )}

          <div className="relative w-full" style={{ minHeight: selectedSpread.cardCount <= 3 ? 220 : selectedSpread.cardCount <= 5 ? 340 : 440 }}>
            {pickedOracleCards.map((oc, i) => {
              const pos = selectedSpread.positions[i];
              if (!pos) return null;

              return (
                <button
                  key={i}
                  onClick={() => {
                    if (!oc.revealed) {
                      setPickedOracleCards(prev => prev.map((c, j) => j === i ? { ...c, revealed: true } : c));
                    } else {
                      setDetailOracleCard(oc.card);
                      setDetailPosition(pos);
                      setView("card-detail");
                    }
                  }}
                  className="absolute transition-all duration-500"
                  style={{
                    left: `calc(${pos.x}% - ${CARD_W / 2}px)`,
                    top: `calc(${pos.y}% - ${CARD_H / 2}px)`,
                    width: CARD_W,
                    height: CARD_H,
                    perspective: "600px",
                  }}
                >
                  <div className="relative w-full h-full transition-transform duration-400"
                    style={{ transformStyle: "preserve-3d", transform: oc.revealed ? "rotateY(180deg)" : "rotateY(0deg)" }}
                  >
                    {/* Back — deck back image */}
                    <div className="absolute inset-0 rounded-lg border border-foreground/18 overflow-hidden"
                      style={{ backfaceVisibility: "hidden" }}
                    >
                      {activeOracleDeck ? (
                        <Image src={activeOracleDeck.backImage} alt="Card back" fill className="object-cover" draggable={false} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #f0e6d2, #e8dcc4, #f0e6d2)" }}>
                          <span className="text-[#c9a961] text-sm opacity-30">✦</span>
                        </div>
                      )}
                    </div>
                    {/* Front — card art */}
                    <div className="absolute inset-0 rounded-lg border border-foreground/18 overflow-hidden"
                      style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={oc.card.image} alt={oc.card.animal} className="w-full h-full object-cover" />
                    </div>
                  </div>
                  <span className="absolute -bottom-4 left-0 right-0 text-center text-[8px] text-muted truncate">{pos.name}</span>
                </button>
              );
            })}
          </div>

          {allRevealed && (
            <div className="mt-8 pt-6 border-t border-foreground/10">
              <h2 className="text-foreground text-base mb-4" style={{ fontFamily: "var(--font-heading)" }}>
                Your Reading
              </h2>
              <div className="space-y-4">
                {pickedOracleCards.map((oc, i) => {
                  const pos = selectedSpread.positions[i];
                  const isExpanded = expandedReadingCard === i;

                  return (
                    <button
                      key={i}
                      onClick={() => setExpandedReadingCard(isExpanded ? null : i)}
                      className="w-full text-left rounded-xl border border-foreground/12 bg-surface/40 overflow-hidden active:bg-foreground/[0.02] transition-all"
                    >
                      <div className="flex items-start gap-3 p-4">
                        <div className="w-10 h-14 rounded-lg border border-sage/30 flex-shrink-0 overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={oc.card.image} alt={oc.card.animal} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-muted text-[9px] uppercase tracking-[0.2em] font-bold mb-0.5">
                            {pos?.name || `Card ${i + 1}`}
                          </p>
                          <p className="text-foreground text-sm font-medium" style={{ fontFamily: "var(--font-heading)" }}>
                            {oc.card.animal}
                          </p>
                          <p className="text-muted text-[11px] mt-1">{oc.card.keyword}</p>
                        </div>
                        <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                          className={`text-muted mt-1 flex-shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}`}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                      {isExpanded && (
                        <div className="px-4 pb-4 space-y-3 border-t border-foreground/8 pt-3">
                          {pos?.description && (
                            <div>
                              <p className="text-muted text-[9px] uppercase tracking-widest mb-1">{pos.name}</p>
                              <p className="text-secondary text-[12px] leading-relaxed">{pos.description}</p>
                            </div>
                          )}
                          <div>
                            <p className="text-muted text-[9px] uppercase tracking-widest mb-1">Message</p>
                            <p className="text-secondary text-[13px] leading-relaxed">{oc.card.meaning}</p>
                          </div>
                          <div className="rounded-lg bg-sage/8 px-3 py-2.5">
                            <p className="text-muted text-[9px] uppercase tracking-widest mb-1">Reflection</p>
                            <p className="text-secondary text-[12px] leading-relaxed">
                              What part of your life is asking for {oc.card.keyword.toLowerCase()} right now?
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

          {allRevealed && (
            <div className="mt-8 space-y-3">
              {/* Save + Share row */}
              <div className="flex gap-3">
                <button
                  onClick={() => handleSaveReading()}
                  disabled={readingSaved}
                  className={`flex-1 py-3 rounded-full text-sm font-medium flex items-center justify-center gap-2 active:scale-[0.97] transition-all ${
                    readingSaved
                      ? "bg-sage/15 border border-sage/25 text-sage"
                      : "bg-terracotta/20 border border-terracotta/30 text-terracotta"
                  }`}
                >
                  <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    {readingSaved
                      ? <path d="M20 6L9 17l-5-5" />
                      : <><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></>
                    }
                  </svg>
                  {readingSaved ? "Saved" : "Save Reading"}
                </button>
                <button
                  onClick={async () => {
                    const dateStr = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric" });
                    const cards = pickedOracleCards.map((pc, i) => {
                      const posName = selectedSpread.positions[pc.positionIndex]?.name || `Position ${i + 1}`;
                      return { name: pc.card.animal, position: posName, keywords: [pc.card.keyword] };
                    });
                    const cardLines = cards.map(c => `${c.position}: ${c.name} — ${c.keywords[0]}`).join("\n");
                    const fallback = `My ${selectedSpread.name} oracle reading:\n\n${cardLines}\n\n— Mapped Astrology`;
                    setCopiedShare("oracle-spread");
                    await shareReadingAsImage({ spreadName: selectedSpread.name, date: dateStr, cards }, fallback);
                    setTimeout(() => setCopiedShare(null), 2000);
                  }}
                  className="flex-1 py-3 rounded-full border border-foreground/18 text-muted text-sm font-medium flex items-center justify-center gap-2 active:scale-[0.97] transition-all"
                >
                  <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" />
                  </svg>
                  {copiedShare === "oracle-spread" ? "Shared!" : "Share"}
                </button>
              </div>
              {/* Dolly */}
              <button onClick={() => goToDolly()}
                className="w-full py-3 rounded-xl border border-foreground/15 bg-foreground/3 text-muted text-sm flex items-center justify-center gap-2 active:bg-foreground/6"
              >
                <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" strokeWidth="1.5" stroke="currentColor" strokeLinecap="round">
                  <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
                </svg>
                Talk to Dolly about this reading
              </button>
              {dollySaveModal}
              {/* New / Reshuffle */}
              <div className="flex gap-3 mb-4">
                <button onClick={() => { setView("spreads"); setPickedOracleCards([]); }}
                  className="flex-1 py-3 rounded-full border border-foreground/18 text-muted text-sm active:bg-foreground/5"
                >New Reading</button>
                <button onClick={() => handleStartSpread(selectedSpread)}
                  className="flex-1 py-3 rounded-full bg-foreground/5 border border-foreground/10 text-muted text-sm active:bg-foreground/10"
                >Reshuffle</button>
              </div>
            </div>
          )}
        </main>
      );
    }

    // Tarot spread view
    const allRevealed = pickedCards.every(c => c.revealed);

    return (
      <main className="flex-1 flex flex-col px-5 py-6 max-w-lg mx-auto w-full overflow-y-auto">
        <button onClick={() => { setView("spreads"); setPickedCards([]); }}
          className="flex items-center gap-2 text-muted text-sm mb-4 active:text-secondary"
        >
          <span className="text-lg">‹</span> Back to spreads
        </button>

        <p className="text-[8.5px] tracking-[0.2em] uppercase font-bold text-center" style={{ color: "var(--brass)" }}>
          Classic Tarot
        </p>
        <h1 className="text-center mt-1 mb-1.5" style={{ fontFamily: "var(--font-heading)", fontSize: 24, color: "var(--foreground)" }}>
          {selectedSpread.name}
        </h1>
        <p className="text-muted text-xs text-center mb-4">
          {allRevealed ? "Tap any card to read its full meaning" : "Tap each card to reveal it"}
        </p>
        {question && (
          <p className="text-center mx-auto -mt-2 mb-4" style={{ fontFamily: "var(--font-script)", fontSize: 16, lineHeight: 1.45, maxWidth: 280, color: "var(--brass)" }}>&ldquo;{question}&rdquo;</p>
        )}

        {showSavedBanner && (
          <div className="text-center mb-3 py-1.5 px-4 rounded-full bg-sage/15 border border-sage/25 text-sage text-xs font-medium mx-auto" style={{ display: "flex", justifyContent: "center", width: "fit-content" }}>
            Saved to Past Readings
          </div>
        )}

        <div className="relative w-full" style={{ minHeight: selectedSpread.cardCount <= 3 ? 220 : selectedSpread.cardCount <= 5 ? 340 : 440 }}>
          {pickedCards.map((dc, i) => {
            const pos = selectedSpread.positions[i];
            if (!pos) return null;
            const suitColor = SUIT_INFO[dc.card.suit]?.color || "#888";

            return (
              <button
                key={i}
                onClick={() => {
                  if (!dc.revealed) {
                    revealCard(i);
                  } else {
                    setDetailCard(dc);
                    setDetailPosition(pos);
                    setView("card-detail");
                  }
                }}
                className="absolute transition-all duration-500"
                style={{
                  left: `calc(${pos.x}% - ${CARD_W / 2}px)`,
                  top: `calc(${pos.y}% - ${CARD_H / 2}px)`,
                  width: CARD_W,
                  height: CARD_H,
                  perspective: "600px",
                }}
              >
                <div className="relative w-full h-full transition-transform duration-400"
                  style={{ transformStyle: "preserve-3d", transform: dc.revealed ? "rotateY(180deg)" : "rotateY(0deg)" }}
                >
                  {/* Card back */}
                  <div className="absolute inset-0 rounded-lg border border-foreground/20 overflow-hidden"
                    style={{ backfaceVisibility: "hidden" }}
                  >
                    <Image src={CARD_BACK_IMAGE} alt="Card back" fill className="object-cover" draggable={false} />
                  </div>
                  {/* Card face */}
                  <div className="absolute inset-0 rounded-lg border overflow-hidden"
                    style={{
                      backfaceVisibility: "hidden", transform: "rotateY(180deg)",
                      borderColor: suitColor,
                    }}
                  >
                    {getCardImagePath(dc.card.id) ? (
                      <div className="relative w-full h-full" style={{ transform: dc.reversed ? "rotate(180deg)" : "none" }}>
                        <Image src={getCardImagePath(dc.card.id)!} alt={dc.card.name} fill className="object-cover" draggable={false} />
                        {dc.reversed && <span className="absolute top-0.5 right-1 text-[7px] text-white/60 bg-black/40 px-0.5 rounded">R</span>}
                      </div>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-1"
                        style={{ background: `linear-gradient(145deg, ${suitColor}11, #0e0a14)` }}>
                        {dc.reversed && <span className="absolute top-0.5 right-1 text-[7px] text-muted">↓R</span>}
                        <span className="text-[7px] text-muted mb-0.5">{dc.card.arcana === "major" ? romanNumeral(dc.card.number) : dc.card.suit}</span>
                        <span className="text-[9px] text-foreground text-center leading-tight px-0.5"
                          style={{ transform: dc.reversed ? "rotate(180deg)" : "none" }}
                        >{dc.card.name.replace("The ", "")}</span>
                      </div>
                    )}
                  </div>
                </div>
                <span className="absolute -bottom-4 left-0 right-0 text-center text-[8px] text-muted truncate">{pos.name}</span>
              </button>
            );
          })}
        </div>

        {allRevealed && (
          <div className="mt-8 pt-6 border-t border-foreground/10">
            <h2 className="text-foreground text-base mb-4" style={{ fontFamily: "var(--font-heading)" }}>
              Your Reading
            </h2>
            <div className="space-y-4">
              {pickedCards.map((dc, i) => {
                const pos = selectedSpread.positions[i];
                const suitColor = SUIT_INFO[dc.card.suit]?.color || "#888";
                const meanings = tarotMeanings[dc.card.id];
                const isExpanded = expandedReadingCard === i;

                return (
                  <button
                    key={i}
                    onClick={() => setExpandedReadingCard(isExpanded ? null : i)}
                    className="w-full text-left rounded-xl border border-foreground/12 bg-surface/40 overflow-hidden active:bg-foreground/[0.02] transition-all"
                  >
                    <div className="flex items-start gap-3 p-4">
                      {/* Card mini badge */}
                      <div className="w-10 h-14 rounded-lg border flex-shrink-0 overflow-hidden relative"
                        style={{ borderColor: suitColor, background: `linear-gradient(145deg, ${suitColor}15, transparent)` }}>
                        {getCardImagePath(dc.card.id) ? (
                          <div style={{ transform: dc.reversed ? "rotate(180deg)" : "none" }} className="w-full h-full relative">
                            <Image src={getCardImagePath(dc.card.id)!} alt={dc.card.name} fill className="object-cover" draggable={false} />
                          </div>
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center">
                            {dc.reversed && <span className="text-[7px] text-muted">↓R</span>}
                            <span className="text-[8px] text-muted">{dc.card.arcana === "major" ? romanNumeral(dc.card.number) : dc.card.suit}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-muted text-[9px] uppercase tracking-[0.2em] font-bold mb-0.5">
                          {pos?.name || `Card ${i + 1}`}
                        </p>
                        <p className="text-foreground text-sm font-medium" style={{ fontFamily: "var(--font-heading)" }}>
                          {dc.card.name}{dc.reversed ? " (Reversed)" : ""}
                        </p>
                        <p className="text-muted text-[11px] mt-1">
                          {(dc.reversed ? dc.card.reversedKeywords : dc.card.uprightKeywords).slice(0, 3).join(" · ")}
                        </p>
                      </div>

                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                        className={`text-muted mt-1 flex-shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}`}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>

                    {isExpanded && (
                      <div className="px-4 pb-4 space-y-3 border-t border-foreground/8 pt-3">
                        <div>
                          <p className="text-muted text-[9px] uppercase tracking-widest mb-1">
                            {pos?.description || "Position meaning"}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted text-[9px] uppercase tracking-widest mb-1">
                            {dc.reversed ? "Reversed meaning" : "Upright meaning"}
                          </p>
                          <p className="text-secondary text-[13px] leading-relaxed">
                            {dc.reversed ? dc.card.reversedMeaning : dc.card.uprightMeaning}
                          </p>
                        </div>
                        {meanings && (
                          <div className="space-y-2.5">
                            {meanings.love && (
                              <div>
                                <p className="text-muted text-[9px] uppercase tracking-widest mb-1">Love & Relationships</p>
                                <p className="text-secondary text-[12px] leading-relaxed">{meanings.love}</p>
                              </div>
                            )}
                            {meanings.career && (
                              <div>
                                <p className="text-muted text-[9px] uppercase tracking-widest mb-1">Career & Finances</p>
                                <p className="text-secondary text-[12px] leading-relaxed">{meanings.career}</p>
                              </div>
                            )}
                            {meanings.spiritual && (
                              <div>
                                <p className="text-muted text-[9px] uppercase tracking-widest mb-1">Spiritual Growth</p>
                                <p className="text-secondary text-[12px] leading-relaxed">{meanings.spiritual}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {allRevealed && (
          <div className="mt-8 space-y-3">
            {/* Save + Share row */}
            <div className="flex gap-3">
              <button
                onClick={() => handleSaveReading()}
                disabled={readingSaved}
                className={`flex-1 py-3 rounded-full text-sm font-medium flex items-center justify-center gap-2 active:scale-[0.97] transition-all ${
                  readingSaved
                    ? "bg-sage/15 border border-sage/25 text-sage"
                    : "bg-terracotta/20 border border-terracotta/30 text-terracotta"
                }`}
              >
                <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  {readingSaved
                    ? <path d="M20 6L9 17l-5-5" />
                    : <><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></>
                  }
                </svg>
                {readingSaved ? "Saved" : "Save Reading"}
              </button>
              <button
                onClick={async () => {
                  const dateStr = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric" });
                  const cards = pickedCards.map((dc, i) => ({
                    name: dc.card.name,
                    reversed: dc.reversed,
                    position: selectedSpread?.positions[i]?.name || `Position ${i + 1}`,
                    keywords: (dc.reversed ? dc.card.reversedKeywords : dc.card.uprightKeywords).slice(0, 4),
                  }));
                  const cardLines = cards.map(c => `${c.position}: ${c.name}${c.reversed ? " (Reversed)" : ""}`).join("\n");
                  const fallback = `My ${selectedSpread?.name || "tarot"} reading:\n\n${cardLines}\n\n— Mapped Astrology`;
                  setCopiedShare("tarot-spread");
                  await shareReadingAsImage({ spreadName: selectedSpread?.name || "Tarot Reading", date: dateStr, cards }, fallback);
                  setTimeout(() => setCopiedShare(null), 2000);
                }}
                className="flex-1 py-3 rounded-full border border-foreground/18 text-muted text-sm font-medium flex items-center justify-center gap-2 active:scale-[0.97] transition-all"
              >
                <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" />
                </svg>
                {copiedShare === "tarot-spread" ? "Shared!" : "Share"}
              </button>
            </div>
            {/* Dolly */}
            <button onClick={() => goToDolly()}
              className="w-full py-3 rounded-xl border border-foreground/15 bg-foreground/3 text-muted text-sm flex items-center justify-center gap-2 active:bg-foreground/6"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" strokeWidth="1.5" stroke="currentColor" strokeLinecap="round">
                <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
              </svg>
              Talk to Dolly about this reading
            </button>
            {dollySaveModal}
            {/* New / Reshuffle */}
            <div className="flex gap-3 mb-4">
              <button onClick={() => { setView("spreads"); setPickedCards([]); }}
                className="flex-1 py-3 rounded-full border border-foreground/18 text-muted text-sm active:bg-foreground/5"
              >New Reading</button>
              <button onClick={() => handleStartSpread(selectedSpread)}
                className="flex-1 py-3 rounded-full bg-foreground/5 border border-foreground/10 text-muted text-sm active:bg-foreground/10"
              >Reshuffle</button>
            </div>
          </div>
        )}
      </main>
    );
  }

  /* ═══════════════════════════════════════════
     RENDER: Freestyle — Fanned (touch swipe)
     ═══════════════════════════════════════════ */
  if (view === "freestyle-fan") {
    const freeDeck = isOracleDeck ? shuffledOracleCards : shuffledDeck;
    const freePickedIds = isOracleDeck ? pickedOracleCards.map(p => p.card.id) : freestylePicks.map(p => p.card.id);
    const totalPicked = isOracleDeck ? pickedOracleCards.length : freestylePicks.length;
    const cardsInFan = Math.min(freeDeck.length, 78);
    const fanSpread = 140;

    const handleFreeFanPick = (idx: number) => {
      if (isOracleDeck) {
        const oCard = shuffledOracleCards[idx];
        if (!oCard || pickedOracleCards.some(p => p.card.id === oCard.id)) return;
        setPickedOracleCards(prev => [...prev, { card: oCard, revealed: false, positionIndex: prev.length }]);
      } else {
        pickFreestyleCard(idx);
      }
    };

    return (
      <main className="flex-1 flex flex-col px-5 py-4 max-w-lg mx-auto w-full overflow-hidden">
        <button onClick={() => { setView("spreads"); setFreestylePicks([]); setPickedOracleCards([]); }}
          className="flex items-center gap-2 text-muted text-sm mb-2 active:text-secondary"
        >
          <span className="text-lg">‹</span> Back
        </button>

        <h1 className="text-lg text-foreground text-center mb-1" style={{ fontFamily: "var(--font-heading)" }}>Fanned</h1>
        <p className="text-muted text-[10px] text-center mb-2">Swipe or drag through the deck · Tap cards that call to you · {totalPicked} picked</p>
        {question && (
          <p className="text-center mx-auto -mt-1 mb-2" style={{ fontFamily: "var(--font-script)", fontSize: 16, lineHeight: 1.45, maxWidth: 280, color: "var(--brass)" }}>&ldquo;{question}&rdquo;</p>
        )}
        {showSavedBanner && (
          <div className="text-center mb-2 py-1.5 px-4 rounded-full bg-sage/15 border border-sage/25 text-sage text-xs font-medium mx-auto" style={{ display: "flex", justifyContent: "center", width: "fit-content" }}>
            Saved to Past Readings
          </div>
        )}

        {/* Fan */}
        <div
          ref={fanRef}
          className="relative flex-1 min-h-[260px] overflow-hidden"
          onTouchStart={onFanTouchStart}
          onTouchMove={onFanTouchMove}
          onTouchEnd={onFanTouchEnd}
          onMouseDown={onFanMouseDown}
          onMouseMove={onFanMouseMove}
          onMouseUp={onFanMouseUp}
          onMouseLeave={onFanMouseLeave}
          style={{ touchAction: "none", userSelect: "none" }}
        >
          <div className="absolute bottom-4 left-1/2" style={{ transform: "translateX(-50%)" }}>
            {freeDeck.slice(0, cardsInFan).map((card, i) => {
              const cardId = (card as { id: string }).id;
              const isPicked = freePickedIds.includes(cardId);
              const baseAngle = ((i - cardsInFan / 2) / cardsInFan) * fanSpread;
              const angle = baseAngle + fanRotation;
              if (angle < -90 || angle > 90) return null;

              return (
                <button key={cardId} onClick={() => !isPicked && handleFreeFanPick(i)}
                  className="absolute transition-opacity duration-150"
                  style={{
                    width: CARD_W, height: CARD_H, left: -CARD_W / 2, bottom: 0,
                    transform: `rotate(${angle}deg)`, transformOrigin: `50% ${CARD_H + 80}px`,
                    opacity: isPicked ? 0.15 : Math.abs(angle) < 15 ? 1 : Math.abs(angle) < 40 ? 0.7 : 0.4,
                    zIndex: cardsInFan - Math.abs(Math.round(angle)),
                    pointerEvents: isPicked ? "none" : "auto",
                  }}
                >
                  <div className="w-full h-full rounded-lg border border-foreground/20 overflow-hidden"
                    style={{
                      background: isOracleDeck
                        ? "linear-gradient(135deg, #f0e6d2, #e8dcc4)"
                        : Math.abs(angle) < 8 ? "linear-gradient(135deg, #2a2030, #3d3040, #2a2030)" : "linear-gradient(135deg, #1f1730, #2a2030, #1f1730)",
                      boxShadow: Math.abs(angle) < 8 ? "0 0 12px rgba(201,168,76,0.1)" : "none",
                    }}
                  >
                    <div className="w-full h-full flex items-center justify-center">
                      {isOracleDeck ? (
                        <span className="text-[#c9a961] text-[10px] font-medium opacity-40">✦</span>
                      ) : (
                        <div className="w-[55%] h-[65%] rounded border border-foreground/18" />
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <p className="text-muted text-[10px] text-center mt-1 mb-3">← swipe to browse →</p>

        {/* Picked cards — oracle */}
        {isOracleDeck && pickedOracleCards.length > 0 && (
          <div className="border-t border-foreground/15 pt-3">
            <div className="flex gap-2 flex-wrap">
              {pickedOracleCards.map((oc, i) => (
                <button key={i} onClick={() => {
                    if (!oc.revealed) setPickedOracleCards(prev => prev.map((c, j) => j === i ? { ...c, revealed: true } : c));
                    else { setDetailOracleCard(oc.card); setView("card-detail"); }
                  }}
                  className="transition-all duration-300"
                  style={{ width: 64, height: 64 * 1.6, perspective: "600px" }}
                >
                  <div className="w-full h-full transition-transform duration-400"
                    style={{ transformStyle: "preserve-3d", transform: oc.revealed ? "rotateY(180deg)" : "rotateY(0deg)" }}
                  >
                    <div className="absolute inset-0 rounded-lg border border-foreground/18 flex items-center justify-center"
                      style={{ backfaceVisibility: "hidden", background: "linear-gradient(135deg, #f0e6d2, #e8dcc4)" }}
                    >
                      <span className="text-[#c9a961] text-[10px] opacity-30">✦</span>
                    </div>
                    <div className="absolute inset-0 rounded-lg border border-foreground/18 overflow-hidden"
                      style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={oc.card.image} alt={oc.card.animal} className="w-full h-full object-cover" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Picked cards — tarot */}
        {!isOracleDeck && freestylePicks.length > 0 && (
          <div className="border-t border-foreground/15 pt-3">
            <div className="flex gap-2 flex-wrap">
              {freestylePicks.map((dc, i) => (
                <SmallCard key={i} dc={dc}
                  onTap={() => {
                    if (!dc.revealed) revealFreestyleCard(i);
                    else { setDetailCard(dc); setView("card-detail"); }
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </main>
    );
  }

  return null;
}

/* ═══════════════════════════════════════════
   Small Card (picked cards strip)
   ═══════════════════════════════════════════ */
function SmallCard({ dc, onTap }: { dc: DrawnCard; onTap: () => void }) {
  const suitColor = SUIT_INFO[dc.card.suit]?.color || "#888";
  return (
    <button onClick={onTap} className="transition-all duration-300"
      style={{ width: 64, height: 64 * 1.6, perspective: "600px" }}
    >
      <div className="w-full h-full transition-transform duration-400"
        style={{ transformStyle: "preserve-3d", transform: dc.revealed ? "rotateY(180deg)" : "rotateY(0deg)" }}
      >
        <div className="absolute inset-0 rounded-lg border border-foreground/20 flex items-center justify-center"
          style={{ backfaceVisibility: "hidden", background: "linear-gradient(135deg, #1f1730, #2a2030, #1f1730)" }}
        >
          <span className="text-muted text-[10px]">?</span>
        </div>
        <div className="absolute inset-0 rounded-lg border flex flex-col items-center justify-center p-1"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)", borderColor: suitColor, background: `linear-gradient(145deg, ${suitColor}11, #0e0a14)` }}
        >
          {dc.reversed && <span className="absolute top-0.5 right-0.5 text-[6px] text-muted">↓R</span>}
          <span className="text-[8px] text-foreground text-center leading-tight px-0.5"
            style={{ transform: dc.reversed ? "rotate(180deg)" : "none" }}
          >{dc.card.name.replace("The ", "")}</span>
        </div>
      </div>
    </button>
  );
}

/* ═══════════════════════════════════════════
   Deck Card Component (My Decks grid)
   ═══════════════════════════════════════════ */
function DeckCard({ title, subtitle, gradient, onClick }: {
  title: string; subtitle: string; gradient: string; onClick: () => void;
}) {
  return (
    <button onClick={onClick} className="w-full text-left">
      <div className="rounded-2xl overflow-hidden border border-foreground/18 active:scale-[0.98] transition-transform">
        <div className="h-28 flex items-center justify-center relative" style={{ background: gradient }}>
          <div className="relative">
            <div className="w-14 h-20 rounded-lg border border-foreground/20 bg-foreground/5 absolute -left-1 -top-1 rotate-[-6deg]" />
            <div className="w-14 h-20 rounded-lg border border-foreground/20 bg-foreground/5 absolute left-1 -top-0.5 rotate-[-2deg]" />
            <div className="w-14 h-20 rounded-lg border border-foreground/25 bg-foreground/8 relative rotate-[3deg] flex items-center justify-center">
              <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" strokeWidth="1" stroke="var(--terracotta)" strokeLinecap="round" className="opacity-50">
                <circle cx="12" cy="12" r="8" /><path d="M12 4l1.5 3.5L17 9l-3.5 1.5L12 14l-1.5-3.5L7 9l3.5-1.5L12 4z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="p-4 bg-foreground/3">
          <h3 className="text-foreground text-sm font-medium mb-0.5">{title}</h3>
          <p className="text-muted text-xs">{subtitle}</p>
        </div>
      </div>
    </button>
  );
}

/* ─── Design deck row — plum card with fanned cover (Choose your deck) ─── */
function DeckRow({ tag, name, sub, count, covers, gradient, onClick }: {
  tag: string; name: string; sub: string; count: string; covers: string[]; gradient?: string; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left active:scale-[0.99] transition-transform"
      style={{ border: "0.5px solid rgba(201,169,97,0.16)", borderRadius: 22, background: "#4a2540", padding: "18px 18px 18px 16px", display: "flex", alignItems: "center", gap: 22, boxShadow: "0 6px 22px rgba(0,0,0,0.34)" }}
    >
      <span className="shrink-0 relative block" style={{ width: 132, height: 150 }}>
        {covers.length > 0 ? (
          covers.slice(0, 3).map((img, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src={cardThumb(img)}
              onError={onCardThumbError}
              alt=""
              width={74}
              height={118}
              style={{ position: "absolute", top: 8, left: 12 + i * 20, width: 74, height: 118, objectFit: "cover", borderRadius: 8, transform: `rotate(${(i - 1) * 8}deg)`, boxShadow: "0 6px 14px -6px rgba(0,0,0,0.7)", border: "0.5px solid rgba(154,115,34,0.4)", zIndex: i }}
            />
          ))
        ) : (
          <span style={{ position: "absolute", inset: 8, borderRadius: 10, background: gradient || "#2a1e3d", border: "0.5px solid rgba(154,115,34,0.4)" }} />
        )}
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-[8.5px] tracking-[0.2em] uppercase font-bold" style={{ color: "var(--brass)" }}>{tag}</span>
        <span className="block mt-1.5" style={{ fontFamily: "var(--font-heading)", fontSize: 21, lineHeight: 1.1, color: "#f0e6d2" }}>{name}</span>
        <span className="block text-[12.5px] italic mt-1" style={{ lineHeight: 1.45, color: "rgba(240,230,210,0.6)" }}>{sub}</span>
        <span className="inline-flex items-center gap-1.5 mt-3 text-[9px] tracking-[0.14em] uppercase font-semibold" style={{ color: "var(--brass)" }}>{count} <span style={{ fontSize: 15 }}>→</span></span>
      </span>
    </button>
  );
}

/* ─── Roman numeral helper ─── */
function romanNumeral(n: number): string {
  const numerals: [number, string][] = [[21,"XXI"],[20,"XX"],[19,"XIX"],[18,"XVIII"],[17,"XVII"],[16,"XVI"],[15,"XV"],[14,"XIV"],[13,"XIII"],[12,"XII"],[11,"XI"],[10,"X"],[9,"IX"],[8,"VIII"],[7,"VII"],[6,"VI"],[5,"V"],[4,"IV"],[3,"III"],[2,"II"],[1,"I"],[0,"0"]];
  return numerals.find(([v]) => v === n)?.[1] || String(n);
}
