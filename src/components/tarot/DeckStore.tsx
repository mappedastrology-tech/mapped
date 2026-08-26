"use client";

/**
 * Deck Store — the oracle-deck storefront inside the Tarot tab.
 *
 * Laid out as a conventional online store, because that is what it is: a
 * product grid of tiles (photo, name, price, buy button), and a product page
 * with a gallery, a price block, a sticky buy bar, and expandable detail
 * sections. People have bought things online before; borrowing that vocabulary
 * means nobody has to learn this screen.
 *
 * What it deliberately does NOT borrow: star ratings, review counts, "N people
 * bought this", strikethrough list prices. Those are the load-bearing parts of
 * a real storefront and there is no data behind any of them here — inventing
 * them would be fabricating social proof. Everything shown is a real fact about
 * the deck: card count, price, whether you own it.
 *
 * Sells the app's real oracle decks (one-time purchase, own forever) with real
 * card photos. Checkout via /api/stripe/checkout-deck; ownership from
 * purchased_decks.
 */

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { STORE_DECKS, formatPrice, type StoreDeck } from "@/lib/deckStore";
import { getOracleDeck, type OracleCard } from "@/lib/oracleDecks";
import { cardThumb, onCardThumbError } from "@/lib/cardThumb";
import { storeCard, onStoreImageError } from "@/lib/storeImage";

interface Props {
  /** Deck id from ?deck_purchased= — shows the success banner. */
  justPurchased?: string | null;
}

/* Product photos are drawn at 9:16. Fixing the ratio on every image box keeps
   the grid from reflowing as photos arrive. */
const CARD_RATIO = "9 / 16";

export default function DeckStore({ justPurchased }: Props) {
  const [owned, setOwned] = useState<Set<string>>(new Set());
  const [buying, setBuying] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [openDeck, setOpenDeck] = useState<StoreDeck | null>(null);
  const [heroIndex, setHeroIndex] = useState(0);
  const [openSection, setOpenSection] = useState<string | null>("about");

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

  function openProduct(deck: StoreDeck) {
    setError(null);
    setHeroIndex(0);
    setOpenSection("about");
    setOpenDeck(deck);
  }

  const errorBox = error && (
    <div className="rounded-lg px-4 py-3 text-[13px]" role="alert"
      style={{ backgroundColor: "color-mix(in srgb, var(--oxblood-light) 12%, transparent)", border: "1px solid var(--oxblood-light)", color: "var(--foreground)" }}>
      {error}
    </div>
  );

  /* ═══════════════════════ Product page ═══════════════════════ */
  if (openDeck) {
    const registry = getOracleDeck(openDeck.id);
    const cards: OracleCard[] = registry?.cards ?? [];
    const gallery = cards.slice(0, 6);
    const hero = gallery[heroIndex] ?? gallery[0];
    // Spread three sample cards across the deck so the preview shows its range.
    const samples = cards.length >= 3
      ? [cards[0], cards[Math.floor(cards.length / 2)], cards[cards.length - 1]]
      : cards;
    const isOwned = owned.has(openDeck.id);
    const soldOut = openDeck.status === "coming-soon";

    return (
      <div className="mp-store flex flex-col">
        {/* Breadcrumb back, the way every product page has one */}
        <button
          onClick={() => setOpenDeck(null)}
          className="self-start -ml-2 px-2 py-2.5 text-[13px] font-medium"
          style={{ color: "var(--foreground-secondary)" }}
        >
          ← All decks
        </button>

        {/* ─── Gallery ─── */}
        <div className="rounded-xl overflow-hidden" style={{ background: "var(--background-card)", border: "1px solid var(--border-card)" }}>
          {hero && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={hero.image}
              alt={`${openDeck.name} — ${hero.animal}`}
              className="w-full"
              style={{ aspectRatio: CARD_RATIO, objectFit: "contain", maxHeight: 380, padding: 14 }}
            />
          )}
        </div>

        {gallery.length > 1 && (
          <div className="flex gap-2 mt-2.5 overflow-x-auto pb-1">
            {gallery.map((c, i) => (
              <button
                key={c.id}
                onClick={() => setHeroIndex(i)}
                aria-label={`View ${c.animal}`}
                aria-current={i === heroIndex}
                className="shrink-0 rounded-lg overflow-hidden"
                style={{
                  width: 48, height: 68, minWidth: 44,
                  border: i === heroIndex ? "2px solid var(--brass)" : "1px solid var(--border-card)",
                  padding: 0, background: "var(--background-card)",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={cardThumb(c.image)} onError={onCardThumbError} alt="" loading="lazy"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </button>
            ))}
          </div>
        )}

        {/* ─── Title + price block ─── */}
        <div className="mt-5">
          {/* Deliberately NOT --font-heading. Le Jour Serif is an all-caps
              titling face, so it rendered this as "THE BIRD ORACLE" while the
              same product read "The Bird Oracle" in Georgia on the tile one tap
              earlier — the product named in two typefaces and two cases. The
              store's UI font (DM Sans, see .mp-store), one size up and bold,
              is what a product title looks like. The decorative face still
              carries the page header above, where it belongs. */}
          <h2 className="text-[22px] font-bold leading-tight" style={{ color: "var(--foreground)" }}>
            {openDeck.name}
          </h2>
          <p className="text-[13px] italic mt-1" style={{ color: "var(--brass)" }}>{openDeck.tagline}</p>

          <div className="flex items-baseline gap-2.5 mt-3.5">
            <span className="text-[26px] font-bold leading-none" style={{ color: "var(--foreground)" }}>
              {formatPrice(openDeck.priceCents)}
            </span>
            <span className="text-[12px]" style={{ color: "var(--foreground-muted)" }}>
              one-time · yours forever
            </span>
          </div>
          {isOwned && (
            <p className="text-[13px] font-semibold mt-2.5" style={{ color: "var(--brass)" }}>
              ✓ In your library — open it from My Decks
            </p>
          )}
          {soldOut && !isOwned && (
            <p className="text-[13px] font-semibold mt-2.5" style={{ color: "var(--foreground-muted)" }}>
              Coming soon
            </p>
          )}
        </div>

        {errorBox && <div className="mt-4">{errorBox}</div>}

        {/* ─── Expandable detail sections ─── */}
        <div className="mt-5 rounded-xl overflow-hidden" style={{ border: "1px solid var(--border-card)" }}>
          <Section
            id="about" label="Description"
            open={openSection === "about"}
            onToggle={(id) => setOpenSection(openSection === id ? null : id)}
          >
            <p className="text-[13.5px] leading-relaxed" style={{ color: "var(--foreground-secondary)" }}>
              {openDeck.description}
            </p>
          </Section>

          <Section
            id="inside" label={`What's inside · ${openDeck.cardCount} cards`}
            open={openSection === "inside"}
            onToggle={(id) => setOpenSection(openSection === id ? null : id)}
          >
            <div className="flex flex-col gap-3">
              {samples.map((c) => (
                <div key={c.id} className="flex gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={cardThumb(c.image)} onError={onCardThumbError} alt="" loading="lazy"
                    className="rounded-md shrink-0"
                    style={{ width: 44, height: 62, objectFit: "cover", border: "1px solid var(--border-card)" }} />
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold" style={{ color: "var(--foreground)" }}>
                      {c.animal} <span className="font-normal italic" style={{ color: "var(--brass)" }}>· {c.keyword}</span>
                    </p>
                    <p className="text-[12px] leading-relaxed mt-0.5 line-clamp-3" style={{ color: "var(--foreground-secondary)" }}>
                      {c.meaning}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section
            id="details" label="Details"
            open={openSection === "details"}
            onToggle={(id) => setOpenSection(openSection === id ? null : id)}
            last
          >
            <dl className="text-[13px]" style={{ color: "var(--foreground-secondary)" }}>
              <Row term="Cards" value={String(openDeck.cardCount)} />
              <Row term="Format" value="Oracle deck — read inside the Tarot tab" />
              <Row term="Purchase" value="One-time. No subscription, no expiry." />
              <Row term="Delivery" value="Unlocks instantly after payment." />
              <Row term="Payment" value="Secure checkout by Stripe." />
            </dl>
          </Section>
        </div>

        {/* ─── Sticky buy bar, the way a product page always ends ─── */}
        <div className="sticky bottom-3 mt-5 pt-1">
          {isOwned ? (
            <div className="w-full text-center px-4 py-3.5 rounded-lg text-[14px] font-semibold"
              style={{ backgroundColor: "rgba(201,169,97,0.14)", color: "var(--brass)", border: "1px solid var(--brass)" }}>
              ✓ You own this deck
            </div>
          ) : (
            <button
              onClick={() => buy(openDeck)}
              disabled={buying === openDeck.id || soldOut}
              className="w-full px-5 py-3.5 rounded-lg text-[15px] font-bold active:scale-[0.99] transition-transform disabled:opacity-60"
              style={{ backgroundColor: "var(--brass)", color: "var(--btn-ink)", boxShadow: "0 6px 22px color-mix(in srgb, var(--brass) 26%, transparent)" }}
            >
              {soldOut
                ? "Coming soon"
                : buying === openDeck.id
                  ? "Opening checkout…"
                  : `Buy now · ${formatPrice(openDeck.priceCents)}`}
            </button>
          )}
        </div>
      </div>
    );
  }

  /* ═══════════════════════ Store grid ═══════════════════════ */
  return (
    <div className="mp-store flex flex-col gap-4">
      {justPurchased && (
        <div className="rounded-lg px-4 py-3 text-[13px] leading-relaxed"
          style={{ backgroundColor: "rgba(201,169,97,0.14)", border: "1px solid var(--brass)", color: "var(--foreground)" }}>
          ✓ Order complete — your new deck is in My Decks, yours forever.
        </div>
      )}
      {errorBox}

      {/* Results header, as on any catalog page */}
      <div className="flex items-baseline justify-between">
        <h2 className="text-[15px] font-bold" style={{ color: "var(--foreground)" }}>
          All decks
        </h2>
        <span className="text-[12px]" style={{ color: "var(--foreground-muted)" }}>
          {STORE_DECKS.length} {STORE_DECKS.length === 1 ? "item" : "items"}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {STORE_DECKS.map((deck) => {
          const isOwned = owned.has(deck.id);
          const soldOut = deck.status === "coming-soon";
          return (
            /* Two sibling buttons, never nested — the tile opens the product
               page, the CTA buys. A button inside a button is invalid HTML and
               the inner one swallows the outer's clicks. */
            <div key={deck.id} className="flex flex-col rounded-xl overflow-hidden"
              style={{ backgroundColor: "var(--background-card)", border: "1px solid var(--border-card)" }}>
              <button
                onClick={() => openProduct(deck)}
                className="text-left active:scale-[0.995] transition-transform"
              >
                <div className="relative w-full" style={{ aspectRatio: CARD_RATIO, background: "var(--background)" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={storeCard(deck.coverImage)}
                    onError={onStoreImageError}
                    alt={deck.name}
                    loading="lazy"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                  {isOwned && (
                    <span className="absolute top-2 left-2 px-2 py-1 rounded text-[9.5px] font-bold uppercase tracking-[0.1em]"
                      style={{ background: "var(--brass)", color: "var(--btn-ink)" }}>
                      Owned
                    </span>
                  )}
                </div>

                <div className="px-3 pt-2.5">
                  <h3 className="text-[13.5px] font-semibold leading-snug line-clamp-2" style={{ color: "var(--foreground)" }}>
                    {deck.name}
                  </h3>
                  <p className="text-[11.5px] mt-0.5" style={{ color: "var(--foreground-muted)" }}>
                    {deck.cardCount} cards
                  </p>
                  <p className="text-[16px] font-bold mt-1.5" style={{ color: "var(--foreground)" }}>
                    {formatPrice(deck.priceCents)}
                  </p>
                </div>
              </button>

              <div className="px-3 pb-3 pt-2 mt-auto">
                {isOwned ? (
                  <button
                    onClick={() => openProduct(deck)}
                    className="w-full py-2.5 rounded-lg text-[12.5px] font-semibold"
                    style={{ minHeight: 44, background: "transparent", color: "var(--brass)", border: "1px solid var(--brass)" }}
                  >
                    View deck
                  </button>
                ) : (
                  <button
                    onClick={() => buy(deck)}
                    disabled={buying === deck.id || soldOut}
                    className="w-full py-2.5 rounded-lg text-[12.5px] font-bold active:scale-[0.99] transition-transform disabled:opacity-60"
                    style={{ minHeight: 44, backgroundColor: "var(--brass)", color: "var(--btn-ink)" }}
                  >
                    {soldOut ? "Coming soon" : buying === deck.id ? "Opening…" : "Buy now"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {signedIn === false && (
        <p className="text-[11.5px] text-center leading-relaxed" style={{ color: "var(--foreground-faint)" }}>
          Sign in to purchase — decks are tied to your account and sync across devices.
        </p>
      )}

      {/* Reassurance strip — the row of guarantees a checkout page always carries */}
      <ul className="flex flex-col gap-1.5 rounded-xl px-4 py-3.5 text-[11.5px]"
        style={{ border: "1px solid var(--border-card)", color: "var(--foreground-muted)" }}>
        <li>✓ One-time purchase — no subscription</li>
        <li>✓ Unlocks instantly after payment</li>
        <li>✓ Secure checkout by Stripe</li>
      </ul>
    </div>
  );
}

/* ─── Expandable product-page section ─── */
function Section({ id, label, open, onToggle, children, last }: {
  id: string; label: string; open: boolean;
  onToggle: (id: string) => void; children: React.ReactNode; last?: boolean;
}) {
  return (
    <div style={{ borderBottom: last ? "none" : "1px solid var(--border-card)" }}>
      <button
        onClick={() => onToggle(id)}
        aria-expanded={open}
        className="w-full flex items-center justify-between px-4 py-3.5 text-left"
      >
        <span className="text-[13.5px] font-semibold" style={{ color: "var(--foreground)" }}>{label}</span>
        <span className="text-[13px] shrink-0" style={{ color: "var(--foreground-muted)", transform: open ? "rotate(180deg)" : undefined, transition: "transform 150ms" }}>⌄</span>
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}

function Row({ term, value }: { term: string; value: string }) {
  return (
    <div className="flex gap-3 py-1.5" style={{ borderTop: "1px solid var(--border-card)" }}>
      <dt className="shrink-0" style={{ width: 86, color: "var(--foreground-muted)" }}>{term}</dt>
      <dd className="min-w-0">{value}</dd>
    </div>
  );
}
