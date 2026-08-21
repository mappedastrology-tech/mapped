"use client";

/**
 * Deck Store — the premium-oracle-deck storefront inside the Tarot tab.
 *
 * Lists STORE_DECKS with cover, price, and a Buy button that starts a Stripe
 * Checkout (one-time payment, own forever) via /api/stripe/checkout-deck.
 * Ownership is read from purchased_decks; owned decks show "Owned", and
 * coming-soon decks render but can't be bought. The two launch decks
 * (Stitched Animal, Bird) are free and never appear here.
 */

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { STORE_DECKS, formatPrice, type StoreDeck } from "@/lib/deckStore";

interface Props {
  /** Deck id from ?deck_purchased= — shows the success banner. */
  justPurchased?: string | null;
}

export default function DeckStore({ justPurchased }: Props) {
  const [owned, setOwned] = useState<Set<string>>(new Set());
  const [buying, setBuying] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);

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

  return (
    <div className="flex flex-col gap-4">
      {justPurchased && (
        <div
          className="rounded-2xl px-4 py-3 text-[13px] leading-relaxed"
          style={{ backgroundColor: "rgba(201,169,97,0.14)", border: "1px solid var(--brass)", color: "var(--foreground)" }}
        >
          ✧ Your new deck is yours forever — it now lives in My Decks.
        </div>
      )}
      {error && (
        <div
          className="rounded-2xl px-4 py-3 text-[13px] leading-relaxed"
          style={{ backgroundColor: "color-mix(in srgb, var(--oxblood-light) 12%, transparent)", border: "1px solid var(--oxblood-light)", color: "var(--foreground)" }}
          role="alert"
        >
          {error}
        </div>
      )}

      <p className="text-[11.5px] leading-relaxed text-center mx-auto" style={{ maxWidth: 300, color: "var(--foreground-muted)" }}>
        New voices for your readings. Buy once, keep forever — every deck works
        with all your spreads and with Dolly.
      </p>

      {STORE_DECKS.map((deck) => {
        const isOwned = owned.has(deck.id);
        const comingSoon = deck.status === "coming-soon";
        return (
          <div
            key={deck.id}
            className="rounded-2xl overflow-hidden"
            style={{ backgroundColor: "var(--background-card)", border: "1px solid var(--border-card)" }}
          >
            <div className="flex gap-4 p-4">
              {/* Cover */}
              <div
                className="w-20 h-28 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden"
                style={{ background: "linear-gradient(160deg, rgba(201,169,97,0.18), rgba(0,0,0,0.25))", border: "1px solid var(--border-card)" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={deck.coverImage} alt="" className="max-w-full max-h-full object-contain p-1.5" style={comingSoon ? { filter: "grayscale(0.6)", opacity: 0.7 } : undefined} />
              </div>

              {/* Copy */}
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
                <p className="text-[12px] leading-relaxed mt-1.5 line-clamp-3" style={{ color: "var(--foreground-secondary)" }}>
                  {deck.description}
                </p>

                <div className="mt-auto pt-3">
                  {isOwned ? (
                    <span
                      className="inline-block px-4 py-1.5 rounded-full text-[12px] font-semibold"
                      style={{ backgroundColor: "rgba(201,169,97,0.14)", color: "var(--brass)", border: "1px solid var(--brass)" }}
                    >
                      ✓ Owned
                    </span>
                  ) : comingSoon ? (
                    <span
                      className="inline-block px-4 py-1.5 rounded-full text-[12px] font-medium"
                      style={{ backgroundColor: "var(--background)", color: "var(--foreground-faint)", border: "1px solid var(--border-card)" }}
                    >
                      Coming soon
                    </span>
                  ) : (
                    <button
                      onClick={() => buy(deck)}
                      disabled={buying === deck.id}
                      className="px-5 py-2 rounded-full text-[13px] font-bold active:scale-[0.98] transition-transform disabled:opacity-60"
                      style={{ backgroundColor: "var(--brass)", color: "var(--btn-ink)" }}
                    >
                      {buying === deck.id ? "Opening checkout…" : `Buy · ${formatPrice(deck.priceCents)}`}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
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
