# Deck Store — Stripe status

## ✅ Already done for you (via your connected Stripe account)

All Stripe products and prices are CREATED — in both live mode and test mode —
and their price ids are baked into the app (`src/lib/deckStore.ts`). The server
automatically uses the test-mode prices while `STRIPE_SECRET_KEY` is a test key
(`sk_test_…`) and the live ones when you switch to a live key. No env vars
needed.

| Deck | Live price | Test price |
|---|---|---|
| Botanical Oracle · $4.99 | price_1U6wPsRdq07zsKMQAHWMLzL2 | price_1U6wR0Rdq07zsKMQXinoDEPF |
| Celestial Oracle · $4.99 | price_1U6wQVRdq07zsKMQvlsIUz3D | price_1U6wR8Rdq07zsKMQWDHEN9Qx |
| Sea Oracle · $3.99 | price_1U6wQdRdq07zsKMQxCzWM3tC | price_1U6wRHRdq07zsKMQerrs4epb |
| Crystal Oracle · $3.99 | price_1U6wQkRdq07zsKMQRHr2Y8Yg | price_1U6wRNRdq07zsKMQrVnsmKaB |

Your app currently runs Stripe in TEST MODE (the only webhook endpoint on the
account is the test-mode one at /api/stripe/webhook — which is already set to
receive checkout.session.completed, so deck fulfillment works now). You can
test the whole store today: buy with card 4242 4242 4242 4242, any future
expiry/CVC.

## Going LIVE later (the one manual bit)

When you're ready to take real money (this applies to your subscription too,
not just decks — live mode currently has NO webhook, so live purchases would
never be fulfilled):

1. Stripe Dashboard (live mode) → Developers → Webhooks → Add endpoint:
   `https://mapped-olive.vercel.app/api/stripe/webhook`
   events: `checkout.session.completed`, `customer.subscription.updated`,
   `customer.subscription.deleted`. Copy its signing secret (`whsec_…`).
2. Vercel env vars (Production): set `STRIPE_SECRET_KEY` to your live
   `sk_live_…` key and `STRIPE_WEBHOOK_SECRET` to that live signing secret.
   (Also `STRIPE_PRICE_ID` for the subscription, if that's still a test price.)
3. Redeploy. The deck store flips to live prices automatically.

(I tried to create the live webhook for you; my safety layer blocks creating
live payment infrastructure, so that one click is yours.)

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
