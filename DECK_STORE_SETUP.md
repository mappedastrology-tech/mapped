# Deck Store — Stripe status

## Current lineup

The store sells the app's two REAL oracle decks at **$5.55** each (one-time,
own forever): Stitched Animal Oracle (36 cards) and The Bird Oracle (72
cards). Classic Tarot stays free. The store shows real card photos, and each
deck opens a detail page (browsable card strip + three sample cards with
keywords/meanings) so buyers can judge the deck's voice before purchase.
Unowned oracle decks appear locked in My Decks and route to the store.

## ✅ Done via your connected Stripe account (TEST mode — what the app runs)

| Deck | Price | Test price id |
|---|---|---|
| Stitched Animal Oracle | $5.55 | price_1U6waTRdq07zsKMQbdKZfs3n |
| The Bird Oracle | $5.55 | price_1U6wbBRdq07zsKMQRmUcFfjW |

Test the full flow today with card 4242 4242 4242 4242 (any future expiry/CVC):
buy → return banner → deck unlocked in My Decks → row in purchased_decks →
subscription tier untouched. The test webhook already covers fulfillment.

(The earlier four concept decks — Botanical/Celestial/Sea/Crystal — are out of
the storefront; their Stripe products can sit unused or be archived in the
dashboard. Re-add any of them later as a catalog entry once it has cards.)

## Going LIVE (two manual bits — my safety layer can't create live payment infrastructure)

1. Stripe Dashboard (live mode) → Product catalog: create the two products
   ("Stitched Animal Oracle Deck", "Bird Oracle Deck"), one-off $5.55 each.
   Paste their price_… ids into `stripePriceLive` in `src/lib/deckStore.ts`
   (or set env vars STRIPE_PRICE_DECK_STITCHED_ANIMAL / STRIPE_PRICE_DECK_BIRD).
   Until then the live ids are "" and live sales are safely refused.
2. Dashboard (live mode) → Developers → Webhooks → Add endpoint
   `https://mapped-olive.vercel.app/api/stripe/webhook` with events
   `checkout.session.completed`, `customer.subscription.updated`,
   `customer.subscription.deleted` — live mode currently has NO webhook, which
   also blocks live subscription fulfillment. Then set live STRIPE_SECRET_KEY +
   STRIPE_WEBHOOK_SECRET in Vercel and redeploy.

## How it works

- Buy button → `POST /api/stripe/checkout-deck` → Stripe Checkout
  (mode: payment, card, promo codes allowed). Signed-out users are prompted to
  sign in; already-owned decks are refused server-side (no double-charging).
- On payment, the webhook writes a row to `purchased_decks` (one per user per
  deck, unique, RLS: user can read own, only the service role writes). This is
  the ownership record — it survives forever and syncs across devices.
- Success returns to `/tarot?deck_purchased=<id>` (store opens with a success
  banner); cancel returns to `/tarot?store=1` (store reopens).
- Deck purchases do NOT touch subscription tier — the webhook branches
  mode=payment sessions off before the subscription logic.

## Before flipping a deck from "coming-soon" to "available"

A deck needs two things to be sellable *and* playable:

1. **Store presence** — already done (`src/lib/deckStore.ts`: cover, copy, price).
   The current covers are placeholders from `/public/images` — swap in real
   cover art when you have it.
2. **Playable cards** — add the deck's cards to the oracle registry
   (`src/lib/oracleDecks.ts`, same shape as the Bird deck: id, name, keyword,
   meaning, image per card, plus `/public/oracle/<deck-id>/…` images). Until a
   purchased deck is in the registry, it shows in My Decks as owned with
   "cards arriving in the next update" — so DON'T mark a deck `available`
   until its cards are in, or buyers wait on an IOU.

   Botanical and Celestial are currently marked `available` so you can test the
   full purchase flow end-to-end the moment the env vars are set. If their
   card sets aren't ready before launch, flip them to `"coming-soon"` in
   `src/lib/deckStore.ts` (one word each).

## Testing the flow without real money

Stripe test mode: use your test-mode API keys locally / in Preview, create the
same four products in test mode, use card `4242 4242 4242 4242`, any future
expiry, any CVC. Confirm: purchase → redirected back with the banner → deck
shows Owned in the store and appears in My Decks → `purchased_decks` has the
row → your subscription tier did NOT change.

## Adding a new deck later

1. Add an entry to `STORE_DECKS` in `src/lib/deckStore.ts` (id, copy, price,
   `stripePriceEnv` name, cover, status).
2. Create the Stripe product + price; add the env var; redeploy.
3. Add the card set to `src/lib/oracleDecks.ts` and flip status to `available`.
No other code changes — checkout, webhook, ownership, and the store grid all
key off the catalog.
