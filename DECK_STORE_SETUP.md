# Deck Store — Stripe setup

The Deck Store (Tarot tab → "Deck Store") is live in the code and ready to sell
one-time oracle-deck purchases. It reuses your existing Stripe account, webhook,
and customer records. To turn it on you only need to create the products in
Stripe and add their price ids as env vars.

## One-time setup (~10 minutes)

1. **Create the products** — Stripe Dashboard → Product catalog → "+ Add product",
   one per deck:

   | Product name | Price | Type |
   |---|---|---|
   | Botanical Oracle Deck | $4.99 | One-off |
   | Celestial Oracle Deck | $4.99 | One-off |
   | Sea Oracle Deck | $3.99 | One-off |
   | Crystal Oracle Deck | $3.99 | One-off |

   ("One-off", NOT recurring — these are purchases, not subscriptions. Prices
   are what the app displays today; change them in `src/lib/deckStore.ts` too
   if you pick different ones.)

2. **Copy each Price ID** (starts with `price_…`, shown on the product page).

3. **Add env vars** — Vercel → mapped → Settings → Environment Variables
   (Production; add Preview too if you test there):

   ```
   STRIPE_PRICE_DECK_BOTANICAL = price_xxx
   STRIPE_PRICE_DECK_CELESTIAL = price_xxx
   STRIPE_PRICE_DECK_SEA       = price_xxx
   STRIPE_PRICE_DECK_CRYSTAL   = price_xxx
   ```

4. **Redeploy** (env vars need a fresh build).

That's it — your existing `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET`
already cover the store. The webhook endpoint you configured for subscriptions
(`/api/stripe/webhook`) also fulfils deck purchases; just make sure
`checkout.session.completed` is among its enabled events (it already is if
subscriptions work).

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
