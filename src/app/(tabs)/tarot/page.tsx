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
 *  6. Freestyle (Scattered) → drag cards freely around the table
 */

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  ALL_CARDS, SPREADS, ORACLE_DECKS, SUIT_INFO,
  shuffleDeck, drawCards,
  type TarotCard, type TarotSpread, type DrawnCard, type OracleDeck,
} from "@/lib/tarot";
import { tarotMeanings } from "@/lib/tarotMeanings";
import { STITCHED_ANIMAL_ORACLE, type OracleCard, type OracleDeckInfo } from "@/lib/stitchedAnimalOracle";

/* ─── Types ─── */
type View = "decks" | "spreads" | "picking" | "spread-view" | "card-detail" | "freestyle-fan" | "freestyle-scatter";
type DeckTab = "my-decks" | "store";

const CARD_W = 58;
const CARD_H = Math.round(CARD_W * 1.6);

interface UserChart {
  planets?: { name: string; sign: string; signNum: number }[];
  bigThree?: { sun: string; moon: string; rising: string };
}

/* ═══════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════ */

export default function TarotTab() {
  const router = useRouter();

  /* ─── Core State ─── */
  const [view, setView] = useState<View>("decks");
  const [deckTab, setDeckTab] = useState<DeckTab>("my-decks");
  const [selectedDeck, setSelectedDeck] = useState<string>("classic-tarot");
  const [selectedSpread, setSelectedSpread] = useState<TarotSpread | null>(null);
  const [shuffledDeck, setShuffledDeck] = useState<TarotCard[]>([]);
  const [userChart, setUserChart] = useState<UserChart | null>(null);
  const [oracleDecks, setOracleDecks] = useState<OracleDeck[]>(ORACLE_DECKS);

  /* ─── Oracle deck state ─── */
  const isOracleDeck = selectedDeck === "stitched-animal";
  const activeOracleDeck: OracleDeckInfo | null = isOracleDeck ? STITCHED_ANIMAL_ORACLE : null;
  const [shuffledOracleCards, setShuffledOracleCards] = useState<OracleCard[]>([]);
  const [pickedOracleCards, setPickedOracleCards] = useState<{ card: OracleCard; revealed: boolean; positionIndex: number }[]>([]);
  const [detailOracleCard, setDetailOracleCard] = useState<OracleCard | null>(null);

  /* ─── Spread picking state ─── */
  const [pickedCards, setPickedCards] = useState<DrawnCard[]>([]); // cards placed in spread
  const [currentPickPos, setCurrentPickPos] = useState(0); // which spread position we're picking for
  const [fanRotation, setFanRotation] = useState(0); // fan angle controlled by touch

  /* ─── Freestyle state ─── */
  const [freestylePicks, setFreestylePicks] = useState<DrawnCard[]>([]);

  /* ─── Scatter state — positions for each card ─── */
  const [scatterCards, setScatterCards] = useState<{
    card: TarotCard;
    x: number;
    y: number;
    rotation: number;
    picked: boolean;
  }[]>([]);
  const scatterRef = useRef<HTMLDivElement>(null);
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  /* ─── Card detail state ─── */
  const [detailCard, setDetailCard] = useState<DrawnCard | null>(null);
  const [detailPosition, setDetailPosition] = useState<{ name: string; description: string } | undefined>();

  /* ─── Fan touch state ─── */
  const fanRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ x: number; rotation: number } | null>(null);

  /* ─── Scattered card initial positions ─── */
  const initScatter = useCallback((deck: TarotCard[]) => {
    setScatterCards(deck.slice(0, 60).map((card) => ({
      card,
      x: 10 + Math.random() * 65,
      y: 8 + Math.random() * 65,
      rotation: -30 + Math.random() * 60,
      picked: false,
    })));
  }, []);

  /* ─── Load user chart for AstroTarot ─── */
  useEffect(() => {
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;
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
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("mapped:tarot-history");
      if (saved) setReadingHistory(JSON.parse(saved));
    } catch {}
  }, []);

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
      try { localStorage.setItem("mapped:tarot-history", JSON.stringify(updated)); } catch {}
      // Fire-and-forget Supabase backup
      import("@/lib/completionSync").then((m) => m.pushReadingToSupabase(reading)).catch(() => {});
      return updated;
    });
  }, [selectedDeck, selectedSpread, isOracleDeck, pickedOracleCards, pickedCards, freestylePicks]);

  /* ─── Auto-save when all cards are revealed ─── */
  const readingSavedRef = useRef(false);
  useEffect(() => {
    if (readingSavedRef.current) return;
    const hasCards = pickedCards.length > 0 || pickedOracleCards.length > 0;
    if (!hasCards) return;
    const allRevealed = isOracleDeck
      ? pickedOracleCards.every((c) => c.revealed)
      : pickedCards.every((c) => c.revealed);
    if (allRevealed && selectedSpread && (isOracleDeck ? pickedOracleCards.length >= selectedSpread.cardCount : pickedCards.length >= selectedSpread.cardCount)) {
      saveReading();
      readingSavedRef.current = true;
    }
  }, [pickedCards, pickedOracleCards, isOracleDeck, selectedSpread, saveReading]);

  // Reset save flag when starting a new reading
  useEffect(() => {
    readingSavedRef.current = false;
  }, [selectedSpread]);

  /* ─── Start a spread reading ─── */
  const handleStartSpread = useCallback((spread: TarotSpread) => {
    setSelectedSpread(spread);
    if (isOracleDeck && activeOracleDeck) {
      const shuffled = [...activeOracleDeck.cards].sort(() => Math.random() - 0.5);
      setShuffledOracleCards(shuffled);
      setPickedOracleCards([]);
    } else {
      const deck = shuffleDeck(ALL_CARDS);
      setShuffledDeck(deck);
    }
    setPickedCards([]);
    setCurrentPickPos(0);
    setFanRotation(0);
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
  const handleStartFreestyle = useCallback((mode: "fan" | "scatter") => {
    if (isOracleDeck && activeOracleDeck) {
      const shuffled = [...activeOracleDeck.cards].sort(() => Math.random() - 0.5);
      setShuffledOracleCards(shuffled);
      setPickedOracleCards([]);
    }
    const deck = shuffleDeck(ALL_CARDS);
    setShuffledDeck(deck);
    setFreestylePicks([]);
    setFanRotation(0);
    if (mode === "scatter") {
      if (isOracleDeck && activeOracleDeck) {
        const shuffled = [...activeOracleDeck.cards].sort(() => Math.random() - 0.5);
        // For oracle scatter, use a TarotCard-shaped wrapper so scatter drag works
        // The id field is what links back to the oracle card
        setScatterCards(shuffled.map((oCard) => ({
          card: { id: oCard.id, name: oCard.animal, number: oCard.number, suit: "major" as const, arcana: "major" as const, uprightKeywords: [oCard.keyword], reversedKeywords: [], uprightMeaning: oCard.meaning, reversedMeaning: "" } as TarotCard,
          x: 10 + Math.random() * 65,
          y: 8 + Math.random() * 65,
          rotation: -30 + Math.random() * 60,
          picked: false,
        })));
      } else {
        initScatter(deck);
      }
      setView("freestyle-scatter");
    } else {
      setView("freestyle-fan");
    }
  }, [initScatter, isOracleDeck, activeOracleDeck]);

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

  /* ─── Scatter: pick a card ─── */
  const pickScatterCard = useCallback((idx: number) => {
    const sc = scatterCards[idx];
    if (!sc || sc.picked) return;
    setScatterCards(prev => prev.map((c, i) => i === idx ? { ...c, picked: true } : c));
    setFreestylePicks(prev => [...prev, {
      card: sc.card, reversed: Math.random() < 0.35, revealed: false, positionIndex: prev.length,
    }]);
  }, [scatterCards]);

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

  /* ─── Scatter drag handlers ─── */
  const onScatterTouchStart = useCallback((e: React.TouchEvent, idx: number) => {
    const sc = scatterCards[idx];
    if (sc.picked) return;
    e.stopPropagation();
    const touch = e.touches[0];
    const rect = scatterRef.current?.getBoundingClientRect();
    if (!rect) return;
    const cardX = (sc.x / 100) * rect.width;
    const cardY = (sc.y / 100) * rect.height;
    dragOffsetRef.current = { x: touch.clientX - rect.left - cardX, y: touch.clientY - rect.top - cardY };
    setDraggingIdx(idx);
    // Bring to front
    setScatterCards(prev => prev.map((c, i) => i === idx ? { ...c } : c));
  }, [scatterCards]);

  const onScatterTouchMove = useCallback((e: React.TouchEvent) => {
    if (draggingIdx === null) return;
    const touch = e.touches[0];
    const rect = scatterRef.current?.getBoundingClientRect();
    if (!rect) return;
    const newX = ((touch.clientX - rect.left - dragOffsetRef.current.x) / rect.width) * 100;
    const newY = ((touch.clientY - rect.top - dragOffsetRef.current.y) / rect.height) * 100;
    setScatterCards(prev => prev.map((c, i) =>
      i === draggingIdx ? { ...c, x: Math.max(0, Math.min(90, newX)), y: Math.max(0, Math.min(85, newY)) } : c
    ));
  }, [draggingIdx]);

  const onScatterTouchEnd = useCallback(() => {
    setDraggingIdx(null);
  }, []);

  /* ─── Scatter mouse handlers (desktop) ─── */
  const onScatterMouseDown = useCallback((e: React.MouseEvent, idx: number) => {
    const sc = scatterCards[idx];
    if (sc.picked) return;
    e.preventDefault();
    e.stopPropagation();
    const rect = scatterRef.current?.getBoundingClientRect();
    if (!rect) return;
    const cardX = (sc.x / 100) * rect.width;
    const cardY = (sc.y / 100) * rect.height;
    dragOffsetRef.current = { x: e.clientX - rect.left - cardX, y: e.clientY - rect.top - cardY };
    setDraggingIdx(idx);
  }, [scatterCards]);

  const onScatterMouseMove = useCallback((e: React.MouseEvent) => {
    if (draggingIdx === null) return;
    const rect = scatterRef.current?.getBoundingClientRect();
    if (!rect) return;
    const newX = ((e.clientX - rect.left - dragOffsetRef.current.x) / rect.width) * 100;
    const newY = ((e.clientY - rect.top - dragOffsetRef.current.y) / rect.height) * 100;
    setScatterCards(prev => prev.map((c, i) =>
      i === draggingIdx ? { ...c, x: Math.max(0, Math.min(90, newX)), y: Math.max(0, Math.min(85, newY)) } : c
    ));
  }, [draggingIdx]);

  const onScatterMouseUp = useCallback(() => {
    setDraggingIdx(null);
  }, []);

  const onScatterMouseLeave = useCallback(() => {
    setDraggingIdx(null);
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
  const goToDolly = useCallback((card?: DrawnCard) => {
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

  /* ═══════════════════════════════════════════
     RENDER: Oracle Card Detail View
     ═══════════════════════════════════════════ */
  if (view === "card-detail" && isOracleDeck && detailOracleCard) {
    const oCard = detailOracleCard;
    return (
      <main className="flex-1 flex flex-col px-5 py-6 max-w-lg mx-auto w-full overflow-y-auto">
        <button
          onClick={() => { setDetailOracleCard(null); setView(selectedSpread ? "spread-view" : pickedOracleCards.length > 0 ? "freestyle-fan" : "decks"); }}
          className="flex items-center gap-2 text-foreground/40 text-sm mb-4 active:text-foreground/60"
        >
          <span className="text-lg">‹</span> Back
        </button>

        {/* Position context */}
        {detailPosition && (
          <div className="mb-4">
            <span className="text-[10px] tracking-widest uppercase text-foreground/30">{detailPosition.name}</span>
            <p className="text-foreground/20 text-[10px] mt-0.5">{detailPosition.description}</p>
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
          <h1 className="text-xl text-foreground mb-1" style={{ fontFamily: "var(--font-display)" }}>
            {oCard.animal}
          </h1>
          <span className="text-xs tracking-widest uppercase text-terracotta/70">{oCard.keyword}</span>
        </div>

        {/* Meaning */}
        <div className="mb-5">
          <p className="text-foreground/60 text-sm leading-relaxed">{oCard.meaning}</p>
        </div>

        {/* Media recommendations */}
        {oCard.media && (
          <div className="rounded-lg bg-foreground/3 border border-foreground/15 p-4 mb-5">
            <span className="text-[9px] tracking-widest uppercase text-foreground/25 block mb-2.5">Recommended</span>
            <div className="space-y-2">
              {oCard.media.book && (
                <div className="flex items-start gap-2">
                  <span className="text-foreground/20 text-[10px] mt-0.5">📖</span>
                  <p className="text-foreground/45 text-xs leading-relaxed">{oCard.media.book}</p>
                </div>
              )}
              {oCard.media.film && (
                <div className="flex items-start gap-2">
                  <span className="text-foreground/20 text-[10px] mt-0.5">🎬</span>
                  <p className="text-foreground/45 text-xs leading-relaxed">{oCard.media.film}</p>
                </div>
              )}
              {oCard.media.song && (
                <div className="flex items-start gap-2">
                  <span className="text-foreground/20 text-[10px] mt-0.5">🎵</span>
                  <p className="text-foreground/45 text-xs leading-relaxed">{oCard.media.song}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Talk to Dolly */}
        <button
          onClick={() => goToDolly()}
          className="w-full py-3 rounded-xl border border-foreground/15 bg-foreground/3 text-foreground/50 text-sm flex items-center justify-center gap-2 active:bg-foreground/6 transition-colors mb-4"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" strokeWidth="1.5" stroke="currentColor" strokeLinecap="round">
            <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
          </svg>
          Talk to Dolly about this card
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
          className="flex items-center gap-2 text-foreground/40 text-sm mb-4 active:text-foreground/60"
        >
          <span className="text-lg">‹</span> Back
        </button>

        {/* Position context */}
        {detailPosition && (
          <div className="mb-4">
            <span className="text-[10px] tracking-widest uppercase text-foreground/30">{detailPosition.name}</span>
            <p className="text-foreground/20 text-[10px] mt-0.5">{detailPosition.description}</p>
          </div>
        )}

        {/* Card header */}
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl text-foreground" style={{ fontFamily: "var(--font-display)" }}>
            {card.name}
            {reversed && <span className="text-foreground/30 text-sm ml-2">(Reversed)</span>}
          </h1>
          <span className="text-[10px] text-foreground/25">{SUIT_INFO[card.suit]?.name}{card.element && ` · ${card.element}`}</span>
        </div>

        {/* Keywords */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {(reversed ? card.reversedKeywords : card.uprightKeywords).map(kw => (
            <span key={kw} className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: `${suitColor}15`, color: `${suitColor}cc` }}>{kw}</span>
          ))}
        </div>

        {/* Main meaning */}
        <div className="mb-4">
          <p className="text-foreground/60 text-sm leading-relaxed">
            {deep ? (reversed ? deep.reversed : deep.upright) : (reversed ? card.reversedMeaning : card.uprightMeaning)}
          </p>
        </div>

        {/* Advice */}
        {deep?.advice && (
          <div className="rounded-lg bg-foreground/3 border border-foreground/15 p-3 mb-4">
            <span className="text-[9px] tracking-widest uppercase text-foreground/25 block mb-1">The Takeaway</span>
            <p className="text-foreground/50 text-xs leading-relaxed italic">{deep.advice}</p>
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
                <p className="text-foreground/50 text-xs leading-relaxed">{ctx.text}</p>
              </div>
            ))}
          </div>
        )}


        {/* AstroTarot insight */}
        {isAstro && astroInsight && (
          <div className="mt-1 pl-3 border-l-2 mb-4" style={{ borderColor: `${suitColor}44` }}>
            <span className="text-[9px] tracking-widest uppercase block mb-1" style={{ color: suitColor }}>✦ Your Chart&apos;s Take</span>
            <p className="text-foreground/50 text-xs leading-relaxed italic">{astroInsight}</p>
          </div>
        )}

        {/* Talk to Dolly */}
        <button
          onClick={() => goToDolly(detailCard)}
          className="w-full py-3 rounded-xl border border-foreground/15 bg-foreground/3 text-foreground/50 text-sm flex items-center justify-center gap-2 active:bg-foreground/6 transition-colors mb-4"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" strokeWidth="1.5" stroke="currentColor" strokeLinecap="round">
            <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
          </svg>
          Talk to Dolly about this card
        </button>
      </main>
    );
  }

  /* ═══════════════════════════════════════════
     RENDER: My Decks
     ═══════════════════════════════════════════ */
  if (view === "decks") {
    return (
      <main className="flex-1 flex flex-col px-5 py-6 max-w-lg mx-auto w-full overflow-y-auto">
        <h1 className="text-2xl text-foreground text-center mb-1" style={{ fontFamily: "var(--font-display)" }}>
          Tarot & Oracle
        </h1>
        <p className="text-foreground/40 text-xs text-center mb-6">Your decks. Your readings. Your guidance.</p>

        {/* Decks */}
        <div className="space-y-4">
            {/* Classic Tarot */}
            <DeckCard
              title="Classic Tarot"
              subtitle="78 cards · Major & Minor Arcana"
              gradient="linear-gradient(135deg, #1a1408, #2d2010, #1a1408)"
              onClick={() => { setSelectedDeck("classic-tarot"); setView("spreads"); }}
            />

            {/* AstroTarot */}
            {userChart && (
              <DeckCard
                title="AstroTarot"
                subtitle="78 cards · Woven with your birth chart"
                gradient="linear-gradient(135deg, #0a0f1a, #1a1040, #0a0f1a)"
                onClick={() => { setSelectedDeck("astro-tarot"); setView("spreads"); }}
              />
            )}

            {/* Stitched Animal Oracle — always available */}
            <button onClick={() => { setSelectedDeck("stitched-animal"); setView("spreads"); }} className="w-full text-left">
              <div className="rounded-2xl overflow-hidden border border-foreground/18 active:scale-[0.98] transition-transform">
                <div className="h-28 flex items-center justify-center relative gap-2" style={{ background: "linear-gradient(135deg, #f5efe6, #e8ddd0, #f5efe6)" }}>
                  {[1, 6, 11, 22, 28].map((n) => (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img key={n} src={`/oracle/stitched-animal/${n}.png`} alt="" className="h-20 rounded-md shadow-md border border-foreground/15"
                      style={{ transform: `rotate(${(n % 5 - 2) * 4}deg)` }} />
                  ))}
                </div>
                <div className="p-4 bg-foreground/3">
                  <h3 className="text-foreground text-sm font-medium mb-0.5">Stitched Animal Oracle</h3>
                  <p className="text-foreground/40 text-xs">{STITCHED_ANIMAL_ORACLE.cardCount} cards · Guidance from the animal kingdom</p>
                </div>
              </div>
            </button>

            {/* Other purchased oracle decks */}
            {oracleDecks.filter(d => d.purchased).map(deck => (
              <DeckCard key={deck.id} title={deck.name} subtitle={`${deck.cardCount} cards`}
                gradient={deck.coverColor} onClick={() => { setSelectedDeck(deck.id); setView("spreads"); }} />
            ))}
        </div>

        {/* ─── Past Readings ─── */}
        {readingHistory.length === 0 && (
          <div className="mt-8 text-center py-6">
            <p className="text-foreground/30 text-[12px] leading-relaxed">
              Your readings will appear here once you pull your first cards.
            </p>
          </div>
        )}
        {readingHistory.length > 0 && (
          <div className="mt-8">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center justify-between w-full mb-3"
            >
              <h2 className="text-foreground/50 text-[10px] tracking-widest uppercase">
                Past Readings
              </h2>
              <span className="text-foreground/30 text-[10px]">
                {readingHistory.length} · {showHistory ? "Hide" : "Show"}
              </span>
            </button>
            {showHistory && (
              <div className="space-y-2">
                {readingHistory.slice(0, 20).map((reading) => (
                  <div
                    key={reading.id}
                    className="p-3.5 rounded-xl border border-foreground/10 bg-foreground/3"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-foreground text-sm font-medium" style={{ fontFamily: "var(--font-heading)" }}>
                        {reading.spreadName}
                      </span>
                      <span className="text-foreground/25 text-[10px]">
                        {new Date(reading.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {reading.cards.map((card, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 rounded-md text-[10px] font-medium"
                          style={{
                            backgroundColor: "var(--tag-bg, rgba(0,0,0,0.05))",
                            color: "var(--foreground-secondary, #666)",
                          }}
                        >
                          {card.position ? `${card.position}: ` : ""}{card.name}{card.reversed ? " ↓" : ""}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
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
    return (
      <main className="flex-1 flex flex-col px-5 py-6 max-w-lg mx-auto w-full overflow-y-auto">
        <button onClick={() => setView("decks")} className="flex items-center gap-2 text-foreground/40 text-sm mb-4 active:text-foreground/60">
          <span className="text-lg">‹</span> Back to decks
        </button>
        <h1 className="text-xl text-foreground text-center mb-1" style={{ fontFamily: "var(--font-display)" }}>Choose Your Spread</h1>
        <p className="text-foreground/40 text-xs text-center mb-6">Or go freestyle — no rules, just intuition.</p>

        <div className="space-y-3 mb-8">
          {SPREADS.map(spread => (
            <button key={spread.id} onClick={() => handleStartSpread(spread)}
              className="w-full text-left p-4 rounded-xl border border-foreground/15 bg-foreground/3 active:bg-foreground/6 transition-colors"
            >
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-foreground text-sm font-medium">{spread.name}</h3>
                <span className="text-foreground/25 text-xs">{spread.cardCount} {spread.cardCount === 1 ? "card" : "cards"}</span>
              </div>
              <p className="text-foreground/35 text-xs leading-relaxed">{spread.description}</p>
            </button>
          ))}
        </div>

        <h2 className="text-foreground/50 text-[10px] tracking-widest uppercase mb-3">Freestyle</h2>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => handleStartFreestyle("fan")}
            className="p-4 rounded-xl border border-foreground/15 bg-foreground/3 active:bg-foreground/6 transition-colors text-left"
          >
            <div className="text-2xl mb-2 opacity-40">🃏</div>
            <h3 className="text-foreground text-sm font-medium mb-1">Fanned</h3>
            <p className="text-foreground/30 text-xs">Cards fanned in an arc. Swipe through and pick the ones that call to you.</p>
          </button>
          <button onClick={() => handleStartFreestyle("scatter")}
            className="p-4 rounded-xl border border-foreground/15 bg-foreground/3 active:bg-foreground/6 transition-colors text-left"
          >
            <div className="text-2xl mb-2 opacity-40">🎴</div>
            <h3 className="text-foreground text-sm font-medium mb-1">Scattered</h3>
            <p className="text-foreground/30 text-xs">Cards scattered on the table. Move them with your finger, then tap to pick.</p>
          </button>
        </div>
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
          className="flex items-center gap-2 text-foreground/40 text-sm mb-2 active:text-foreground/60"
        >
          <span className="text-lg">‹</span> Back
        </button>

        {/* Position indicator */}
        <div className="text-center mb-3">
          <p className="text-foreground text-sm font-medium" style={{ fontFamily: "var(--font-display)" }}>
            {pos?.name || `Card ${currentPickPos + 1}`}
          </p>
          <p className="text-foreground/30 text-[10px] mt-0.5">{pos?.description}</p>
          <p className="text-foreground/20 text-[10px] mt-1">
            {currentPickPos + 1} of {selectedSpread.cardCount} · Swipe & tap to pick
          </p>
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
                        ? "linear-gradient(135deg, #f5efe6, #e8ddd0)"
                        : Math.abs(angle) < 8
                          ? "linear-gradient(135deg, #2d2010, #3d2a14, #2d2010)"
                          : "linear-gradient(135deg, #1a1408, #2d2010, #1a1408)",
                      boxShadow: Math.abs(angle) < 8 ? "0 0 12px rgba(201,168,76,0.1)" : "none",
                    }}
                  >
                    <div className="w-full h-full flex items-center justify-center">
                      {isOracleDeck ? (
                        <span className="text-[#8b7355] text-[10px] font-medium opacity-40">✦</span>
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

        <p className="text-foreground/15 text-[10px] text-center mt-2 mb-2">← swipe to browse →</p>
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
            className="flex items-center gap-2 text-foreground/40 text-sm mb-4 active:text-foreground/60"
          >
            <span className="text-lg">‹</span> Back to spreads
          </button>

          <h1 className="text-lg text-foreground text-center mb-1" style={{ fontFamily: "var(--font-display)" }}>
            {selectedSpread.name}
          </h1>
          <p className="text-foreground/30 text-xs text-center mb-4">
            {allRevealed ? "Tap any card to read its message" : "Tap each card to reveal it"}
          </p>

          <div className="relative w-full" style={{ minHeight: selectedSpread.cardCount <= 3 ? 180 : selectedSpread.cardCount <= 5 ? 280 : 380 }}>
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
                  <div className="relative w-full h-full transition-transform duration-700"
                    style={{ transformStyle: "preserve-3d", transform: oc.revealed ? "rotateY(180deg)" : "rotateY(0deg)" }}
                  >
                    {/* Back — warm linen */}
                    <div className="absolute inset-0 rounded-lg border border-foreground/18 flex items-center justify-center"
                      style={{ backfaceVisibility: "hidden", background: "linear-gradient(135deg, #f5efe6, #e8ddd0, #f5efe6)" }}
                    >
                      <span className="text-[#8b7355] text-sm opacity-30">✦</span>
                    </div>
                    {/* Front — card art */}
                    <div className="absolute inset-0 rounded-lg border border-foreground/18 overflow-hidden"
                      style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={oc.card.image} alt={oc.card.animal} className="w-full h-full object-cover" />
                    </div>
                  </div>
                  <span className="absolute -bottom-4 left-0 right-0 text-center text-[8px] text-foreground/20 truncate">{pos.name}</span>
                </button>
              );
            })}
          </div>

          {allRevealed && (
            <button onClick={() => goToDolly()}
              className="mt-8 mx-auto px-5 py-3 rounded-xl border border-foreground/15 bg-foreground/3 text-foreground/50 text-sm flex items-center gap-2 active:bg-foreground/6"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" strokeWidth="1.5" stroke="currentColor" strokeLinecap="round">
                <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
              </svg>
              Talk to Dolly about this reading
            </button>
          )}

          {allRevealed && (
            <div className="flex gap-3 mt-4 mb-4">
              <button onClick={() => { setView("spreads"); setPickedOracleCards([]); }}
                className="flex-1 py-3 rounded-full border border-foreground/18 text-foreground/40 text-sm active:bg-foreground/5"
              >New Reading</button>
              <button onClick={() => handleStartSpread(selectedSpread)}
                className="flex-1 py-3 rounded-full bg-terracotta/20 text-terracotta text-sm font-medium active:bg-terracotta/30"
              >Reshuffle</button>
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
          className="flex items-center gap-2 text-foreground/40 text-sm mb-4 active:text-foreground/60"
        >
          <span className="text-lg">‹</span> Back to spreads
        </button>

        <h1 className="text-lg text-foreground text-center mb-1" style={{ fontFamily: "var(--font-display)" }}>
          {selectedSpread.name}
        </h1>
        <p className="text-foreground/30 text-xs text-center mb-4">
          {allRevealed ? "Tap any card to read its full meaning" : "Tap each card to reveal it"}
        </p>

        <div className="relative w-full" style={{ minHeight: selectedSpread.cardCount <= 3 ? 180 : selectedSpread.cardCount <= 5 ? 280 : 380 }}>
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
                <div className="relative w-full h-full transition-transform duration-700"
                  style={{ transformStyle: "preserve-3d", transform: dc.revealed ? "rotateY(180deg)" : "rotateY(0deg)" }}
                >
                  <div className="absolute inset-0 rounded-lg border border-foreground/20 flex items-center justify-center"
                    style={{ backfaceVisibility: "hidden", background: "linear-gradient(135deg, #1a1408, #2d2010, #1a1408)" }}
                  >
                    <div className="w-[55%] h-[65%] rounded border border-foreground/18" />
                  </div>
                  <div className="absolute inset-0 rounded-lg border flex flex-col items-center justify-center p-1"
                    style={{
                      backfaceVisibility: "hidden", transform: "rotateY(180deg)",
                      borderColor: suitColor, background: `linear-gradient(145deg, ${suitColor}11, #0a0a08)`,
                    }}
                  >
                    {dc.reversed && <span className="absolute top-0.5 right-1 text-[7px] text-foreground/30">↓R</span>}
                    <span className="text-[7px] text-foreground/30 mb-0.5">{dc.card.arcana === "major" ? romanNumeral(dc.card.number) : dc.card.suit}</span>
                    <span className="text-[9px] text-foreground text-center leading-tight px-0.5"
                      style={{ transform: dc.reversed ? "rotate(180deg)" : "none" }}
                    >{dc.card.name.replace("The ", "")}</span>
                  </div>
                </div>
                <span className="absolute -bottom-4 left-0 right-0 text-center text-[8px] text-foreground/20 truncate">{pos.name}</span>
              </button>
            );
          })}
        </div>

        {allRevealed && (
          <button onClick={() => goToDolly()}
            className="mt-8 mx-auto px-5 py-3 rounded-xl border border-foreground/15 bg-foreground/3 text-foreground/50 text-sm flex items-center gap-2 active:bg-foreground/6"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" strokeWidth="1.5" stroke="currentColor" strokeLinecap="round">
              <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
            </svg>
            Talk to Dolly about this reading
          </button>
        )}

        {allRevealed && (
          <div className="flex gap-3 mt-4 mb-4">
            <button onClick={() => { setView("spreads"); setPickedCards([]); }}
              className="flex-1 py-3 rounded-full border border-foreground/18 text-foreground/40 text-sm active:bg-foreground/5"
            >New Reading</button>
            <button onClick={() => handleStartSpread(selectedSpread)}
              className="flex-1 py-3 rounded-full bg-terracotta/20 text-terracotta text-sm font-medium active:bg-terracotta/30"
            >Reshuffle</button>
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
          className="flex items-center gap-2 text-foreground/40 text-sm mb-2 active:text-foreground/60"
        >
          <span className="text-lg">‹</span> Back
        </button>

        <h1 className="text-lg text-foreground text-center mb-1" style={{ fontFamily: "var(--font-display)" }}>Fanned</h1>
        <p className="text-foreground/30 text-[10px] text-center mb-2">Swipe or drag through the deck · Tap cards that call to you · {totalPicked} picked</p>

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
                        ? "linear-gradient(135deg, #f5efe6, #e8ddd0)"
                        : Math.abs(angle) < 8 ? "linear-gradient(135deg, #2d2010, #3d2a14, #2d2010)" : "linear-gradient(135deg, #1a1408, #2d2010, #1a1408)",
                      boxShadow: Math.abs(angle) < 8 ? "0 0 12px rgba(201,168,76,0.1)" : "none",
                    }}
                  >
                    <div className="w-full h-full flex items-center justify-center">
                      {isOracleDeck ? (
                        <span className="text-[#8b7355] text-[10px] font-medium opacity-40">✦</span>
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

        <p className="text-foreground/15 text-[10px] text-center mt-1 mb-3">← swipe to browse →</p>

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
                  style={{ width: 52, height: 52 * 1.6, perspective: "600px" }}
                >
                  <div className="w-full h-full transition-transform duration-700"
                    style={{ transformStyle: "preserve-3d", transform: oc.revealed ? "rotateY(180deg)" : "rotateY(0deg)" }}
                  >
                    <div className="absolute inset-0 rounded-lg border border-foreground/18 flex items-center justify-center"
                      style={{ backfaceVisibility: "hidden", background: "linear-gradient(135deg, #f5efe6, #e8ddd0)" }}
                    >
                      <span className="text-[#8b7355] text-[10px] opacity-30">✦</span>
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

  /* ═══════════════════════════════════════════
     RENDER: Freestyle — Scattered (drag cards)
     ═══════════════════════════════════════════ */
  if (view === "freestyle-scatter") {
    const totalPicked = isOracleDeck ? pickedOracleCards.length : freestylePicks.length;

    const handleScatterPick = (idx: number) => {
      if (isOracleDeck) {
        const sc = scatterCards[idx];
        if (!sc || sc.picked) return;
        setScatterCards(prev => prev.map((c, i) => i === idx ? { ...c, picked: true } : c));
        const oCard = shuffledOracleCards.find(o => o.id === sc.card.id);
        if (oCard) {
          setPickedOracleCards(prev => [...prev, { card: oCard, revealed: false, positionIndex: prev.length }]);
        }
      } else {
        pickScatterCard(idx);
      }
    };

    return (
      <main className="flex-1 flex flex-col px-5 py-4 max-w-lg mx-auto w-full overflow-hidden">
        <button onClick={() => { setView("spreads"); setFreestylePicks([]); setPickedOracleCards([]); }}
          className="flex items-center gap-2 text-foreground/40 text-sm mb-2 active:text-foreground/60"
        >
          <span className="text-lg">‹</span> Back
        </button>

        <h1 className="text-lg text-foreground text-center mb-1" style={{ fontFamily: "var(--font-display)" }}>Scattered</h1>
        <p className="text-foreground/30 text-[10px] text-center mb-2">Drag cards around · Double-click to pick · {totalPicked} picked</p>

        {/* Scatter area */}
        <div
          ref={scatterRef}
          className="relative flex-1 min-h-[320px] rounded-xl border border-foreground/15 bg-foreground/2 overflow-hidden"
          onTouchMove={onScatterTouchMove}
          onTouchEnd={onScatterTouchEnd}
          onMouseMove={onScatterMouseMove}
          onMouseUp={onScatterMouseUp}
          onMouseLeave={onScatterMouseLeave}
          style={{ touchAction: "none", userSelect: "none" }}
        >
          {scatterCards.map((sc, i) => (
            <div
              key={i}
              onTouchStart={(e) => onScatterTouchStart(e, i)}
              onMouseDown={(e) => onScatterMouseDown(e, i)}
              onDoubleClick={() => handleScatterPick(i)}
              className="absolute transition-none"
              style={{
                left: `${sc.x}%`,
                top: `${sc.y}%`,
                width: 44,
                height: 44 * 1.6,
                transform: `rotate(${sc.rotation}deg) ${sc.picked ? "scale(0.6)" : draggingIdx === i ? "scale(1.1)" : "scale(1)"}`,
                opacity: sc.picked ? 0.15 : draggingIdx === i ? 1 : 0.85,
                zIndex: draggingIdx === i ? 999 : sc.picked ? 0 : 1,
                touchAction: "none",
                cursor: sc.picked ? "default" : "grab",
              }}
            >
              <div className="w-full h-full rounded border border-foreground/15 overflow-hidden"
                style={{
                  background: isOracleDeck
                    ? "linear-gradient(135deg, #f5efe6, #e8ddd0)"
                    : "linear-gradient(135deg, #1a1408, #2d2010, #1a1408)",
                  boxShadow: draggingIdx === i ? "0 4px 16px rgba(0,0,0,0.5)" : "none",
                }}
              >
                {isOracleDeck && (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-[#8b7355] text-[8px] opacity-30">✦</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Picked cards — oracle */}
        {isOracleDeck && pickedOracleCards.length > 0 && (
          <div className="border-t border-foreground/15 pt-3 mt-3">
            <div className="flex gap-2 flex-wrap">
              {pickedOracleCards.map((oc, i) => (
                <button key={i} onClick={() => {
                    if (!oc.revealed) setPickedOracleCards(prev => prev.map((c, j) => j === i ? { ...c, revealed: true } : c));
                    else { setDetailOracleCard(oc.card); setView("card-detail"); }
                  }}
                  className="transition-all duration-300"
                  style={{ width: 52, height: 52 * 1.6, perspective: "600px" }}
                >
                  <div className="w-full h-full transition-transform duration-700"
                    style={{ transformStyle: "preserve-3d", transform: oc.revealed ? "rotateY(180deg)" : "rotateY(0deg)" }}
                  >
                    <div className="absolute inset-0 rounded-lg border border-foreground/18 flex items-center justify-center"
                      style={{ backfaceVisibility: "hidden", background: "linear-gradient(135deg, #f5efe6, #e8ddd0)" }}
                    >
                      <span className="text-[#8b7355] text-[10px] opacity-30">✦</span>
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
          <div className="border-t border-foreground/15 pt-3 mt-3">
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
      style={{ width: 52, height: 52 * 1.6, perspective: "600px" }}
    >
      <div className="w-full h-full transition-transform duration-700"
        style={{ transformStyle: "preserve-3d", transform: dc.revealed ? "rotateY(180deg)" : "rotateY(0deg)" }}
      >
        <div className="absolute inset-0 rounded-lg border border-foreground/20 flex items-center justify-center"
          style={{ backfaceVisibility: "hidden", background: "linear-gradient(135deg, #1a1408, #2d2010, #1a1408)" }}
        >
          <span className="text-foreground/15 text-[10px]">?</span>
        </div>
        <div className="absolute inset-0 rounded-lg border flex flex-col items-center justify-center p-1"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)", borderColor: suitColor, background: `linear-gradient(145deg, ${suitColor}11, #0a0a08)` }}
        >
          {dc.reversed && <span className="absolute top-0.5 right-0.5 text-[6px] text-foreground/25">↓R</span>}
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
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" strokeWidth="1" stroke="var(--terracotta)" strokeLinecap="round" className="opacity-50">
                <circle cx="12" cy="12" r="8" /><path d="M12 4l1.5 3.5L17 9l-3.5 1.5L12 14l-1.5-3.5L7 9l3.5-1.5L12 4z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="p-4 bg-foreground/3">
          <h3 className="text-foreground text-sm font-medium mb-0.5">{title}</h3>
          <p className="text-foreground/40 text-xs">{subtitle}</p>
        </div>
      </div>
    </button>
  );
}

/* ─── Roman numeral helper ─── */
function romanNumeral(n: number): string {
  const numerals: [number, string][] = [[21,"XXI"],[20,"XX"],[19,"XIX"],[18,"XVIII"],[17,"XVII"],[16,"XVI"],[15,"XV"],[14,"XIV"],[13,"XIII"],[12,"XII"],[11,"XI"],[10,"X"],[9,"IX"],[8,"VIII"],[7,"VII"],[6,"VI"],[5,"V"],[4,"IV"],[3,"III"],[2,"II"],[1,"I"],[0,"0"]];
  return numerals.find(([v]) => v === n)?.[1] || String(n);
}
