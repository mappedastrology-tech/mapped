"use client";

/**
 * Deck Store — the oracle-deck storefront inside the Tarot tab.
 *
 * Sells the app's real oracle decks (one-time purchase, own forever) with real
 * card photos. Tapping a deck opens a detail view — a browsable strip of actual
 * cards plus three sample cards with their keywords and meanings — enough to
 * know the deck's voice before buying. Checkout via /api/stripe/checkout-deck;
 * ownership from purchased_decks.
 */

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { STORE_DECKS, formatPrice, type StoreDeck } from "@/lib/deckStore";
import { getOracleDeck, type OracleCard } from "@/lib/oracleDecks";

interface Props {
  /** Deck id from ?deck_purchased= — shows the success banner. */
  justPurchased?: string | null;
}

export default function DeckStore({ justPurchased }: Props) {
  const [owned, setOwned] = useState<Set<string>>(new Set());
  const [buying, setBuying] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [openDeck, setOpenDeck] = useState<StoreDeck | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!alive) return;
      setSignedIn(!!session?.user);
      if (!session?.user) return;
      const { data } = await supabase
        .from("purchased_decks")
        .select("deck_id")
        .eq("user_id", session.user.id);
      if (alive && data) setOwned(new Set(data.map((r) => r.deck_id as string)));
    })();
    return () => { alive = false; };
  }, [justPurchased]);

  async function buy(deck: StoreDeck) {
    setError(null);
    setBuying(deck.id);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setError("Sign in to buy decks — your purchases are tied to your account.");
        return;
      }
      const res = await fetch("/api/stripe/checkout-deck", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ deckId: deck.id }),
      });
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url as string;
        return;
      }
      setError(data.error || "Could not start checkout. Please try again.");
    } catch {
      setError("Could not start checkout. Please try again.");
    } finally {
      setBuying(null);
    }
  }

  /* ─────────────────────────── Detail view ─────────────────────────── */
  if (openDeck) {
    const registry = getOracleDeck(openDeck.id);
    const cards: OracleCard[] = registry?.cards ?? [];
    // Spread three sample cards across the deck so the preview shows its range.
    const samples = cards.length >= 3
      ? [cards[0], cards[Math.floor(cards.length / 2)], cards[cards.length - 1]]
      : cards;
    const isOwned = owned.has(openDeck.id);

    return (
      <div className="flex flex-col gap-5">
        <button
          onClick={() => setOpenDeck(null)}
          className="self-start text-[12px] font-semibold tracking-[0.08em] uppercase"
          style={{ color: "var(--brass)" }}
        >
          ← Deck Store
        </button>

        <div className="text-center">
          <h3 className="text-[22px] leading-tight" style={{ fontFamily: "var(--font-heading)", color: "var(--foreground)" }}>
            {openDeck.name}
          </h3>
          <p className="text-[12px] italic mt-1" style={{ color: "var(--brass)" }}>{openDeck.tagline}</p>
          <p className="text-[10.5px] tracking-[0.12em] uppercase mt-1.5" style={{ color: "var(--foreground-faint)" }}>
            {openDeck.cardCount} cards · one-time purchase
          </p>
        </div>

        {/* Real card photos — browsable strip */}
        {cards.length > 0 && (
          <div className="-mx-5 px-5 overflow-x-auto">
            <div className="flex gap-2.5 pb-1" style={{ width: "max-content" }}>
              {cards.slice(0, 10).map((c) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={c.id}
                  src={c.image}
                  alt={c.animal}
                  className="h-40 w-auto rounded-xl flex-shrink-0"
                  style={{ border: "1px solid var(--border-card)" }}
                  loading="lazy"
                />
              ))}
              {cards.length > 10 && (
                <div
                  className="h-40 w-24 rounded-xl flex-shrink-0 flex items-center justify-center text-center px-2"
                  style={{ border: "1px dashed var(--border-card)", color: "var(--foreground-faint)" }}
                >
                  <span className="text-[11px] leading-snug">+{cards.length - 10} more cards</span>
                </div>
              )}
            </div>
          </div>
        )}

        <p className="text-[13.5px] leading-relaxed" style={{ color: "var(--foreground-secondary)" }}>
          {openDeck.description}
        </p>

        {/* Sample cards — the deck's actual voice */}
        {samples.length > 0 && (
          <div className="flex flex-col gap-3">
            <p className="text-[10px] tracking-[0.18em] uppercase font-semibold" style={{ color: "var(--brass)" }}>
              A taste of the deck
            </p>
            {samples.map((c) => (
              <div
                key={c.id}
                className="flex gap-3 rounded-2xl p-3"
                style={{ backgroundColor: "var(--background-card)", border: "1px solid var(--border-card)" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.image} alt="" className="w-14 h-20 object-cover rounded-lg flex-shrink-0" style={{ border: "1px solid var(--border-card)" }} loading="lazy" />
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold" style={{ color: "var(--foreground)" }}>
                    {c.animal} <span className="font-normal italic" style={{ color: "var(--brass)" }}>· {c.keyword}</span>
                  </p>
                  <p className="text-[12px] leading-relaxed mt-1 line-clamp-3" style={{ color: "var(--foreground-secondary)" }}>
                    {c.meaning}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="rounded-2xl px-4 py-3 text-[13px]" role="alert"
            style={{ backgroundColor: "color-mix(in srgb, var(--oxblood-light) 12%, transparent)", border: "1px solid var(--oxblood-light)", color: "var(--foreground)" }}>
            {error}
          </div>
        )}

        <div className="sticky bottom-4 pt-1">
          {isOwned ? (
            <div className="w-full text-center px-4 py-3 rounded-full text-[14px] font-semibold"
              style={{ backgroundColor: "rgba(201,169,97,0.14)", color: "var(--brass)", border: "1px solid var(--brass)" }}>
              ✓ You own this deck — it&rsquo;s in My Decks
            </div>
          ) : (
            <button
              onClick={() => buy(openDeck)}
              disabled={buying === openDeck.id}
              className="w-full px-5 py-3 rounded-full text-[15px] font-bold active:scale-[0.99] transition-transform disabled:opacity-60"
              style={{ backgroundColor: "var(--brass)", color: "var(--btn-ink)", boxShadow: "0 6px 22px color-mix(in srgb, var(--brass) 30%, transparent)" }}
            >
              {buying === openDeck.id ? "Opening checkout…" : `Buy ${openDeck.name} · ${formatPrice(openDeck.priceCents)}`}
            </button>
          )}
          <p className="text-[10.5px] text-center mt-2" style={{ color: "var(--foreground-faint)" }}>
            One-time purchase · yours forever · secure checkout by Stripe
          </p>
        </div>
      </div>
    );
  }

  /* ─────────────────────────── Store grid ─────────────────────────── */
  return (
    <div className="flex flex-col gap-4">
      {justPurchased && (
        <div className="rounded-2xl px-4 py-3 text-[13px] leading-relaxed"
          style={{ backgroundColor: "rgba(201,169,97,0.14)", border: "1px solid var(--brass)", color: "var(--foreground)" }}>
          ✧ Your new deck is yours forever — it now lives in My Decks.
        </div>
      )}
      {error && (
        <div className="rounded-2xl px-4 py-3 text-[13px]" role="alert"
          style={{ backgroundColor: "color-mix(in srgb, var(--oxblood-light) 12%, transparent)", border: "1px solid var(--oxblood-light)", color: "var(--foreground)" }}>
          {error}
        </div>
      )}

      <p className="text-[11.5px] leading-relaxed text-center mx-auto" style={{ maxWidth: 300, color: "var(--foreground-muted)" }}>
        New voices for your readings. Tap a deck to see its cards — buy once,
        keep forever.
      </p>

      {STORE_DECKS.map((deck) => {
        const isOwned = owned.has(deck.id);
        const registry = getOracleDeck(deck.id);
        const covers = (registry?.cards ?? []).slice(0, 3).map((c) => c.image);
        return (
          <button
            key={deck.id}
            onClick={() => { setError(null); setOpenDeck(deck); }}
            className="text-left rounded-2xl overflow-hidden active:scale-[0.995] transition-transform"
            style={{ backgroundColor: "var(--background-card)", border: "1px solid var(--border-card)" }}
          >
            <div className="flex gap-4 p-4">
              {/* Fanned real-card cover */}
              <div className="relative w-24 h-28 flex-shrink-0">
                {covers.map((src, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={src}
                    src={src}
                    alt=""
                    className="absolute h-24 w-auto rounded-lg"
                    style={{
                      border: "1px solid var(--border-card)",
                      left: i * 14,
                      top: i * 4,
                      transform: `rotate(${(i - 1) * 7}deg)`,
                      zIndex: i,
                      boxShadow: "0 3px 10px rgba(0,0,0,0.25)",
                    }}
                    loading="lazy"
                  />
                ))}
              </div>

              <div className="flex-1 min-w-0 flex flex-col">
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="text-[16px] leading-tight" style={{ fontFamily: "var(--font-heading)", color: "var(--foreground)" }}>
                    {deck.name}
                  </h3>
                  <span className="text-[10px] tracking-[0.1em] uppercase whitespace-nowrap" style={{ color: "var(--foreground-faint)" }}>
                    {deck.cardCount} cards
                  </span>
                </div>
                <p className="text-[11.5px] italic mt-0.5" style={{ color: "var(--brass)" }}>{deck.tagline}</p>
                <div className="mt-auto pt-3 flex items-center justify-between">
                  {isOwned ? (
                    <span className="inline-block px-4 py-1.5 rounded-full text-[12px] font-semibold"
                      style={{ backgroundColor: "rgba(201,169,97,0.14)", color: "var(--brass)", border: "1px solid var(--brass)" }}>
                      ✓ Owned
                    </span>
                  ) : (
                    <span className="inline-block px-4 py-1.5 rounded-full text-[13px] font-bold"
                      style={{ backgroundColor: "var(--brass)", color: "var(--btn-ink)" }}>
                      {formatPrice(deck.priceCents)}
                    </span>
                  )}
                  <span className="text-[11px]" style={{ color: "var(--foreground-faint)" }}>
                    Tap to explore →
                  </span>
                </div>
              </div>
            </div>
          </button>
        );
      })}

      {signedIn === false && (
        <p className="text-[11px] text-center leading-relaxed" style={{ color: "var(--foreground-faint)" }}>
          Sign in to purchase — decks are tied to your account and sync across devices.
        </p>
      )}
      <p className="text-[10.5px] text-center leading-relaxed px-4" style={{ color: "var(--foreground-faint)" }}>
        One-time purchase · secure checkout by Stripe · decks unlock instantly after payment.
      </p>
    </div>
  );
}
