# In-app purchase (App Store and Google Play)

The web sells plans and decks through Stripe. The iOS and Android apps sell
them through the App Store and Google Play, using RevenueCat in front of both
stores. Apple (Guideline 3.1.1) and Google Play (Payments policy) require their
own billing for digital goods in every storefront outside the US, so this is
what makes a worldwide launch possible.

Nothing here is live until the keys below are set. Without them the app keeps
the old behaviour: a link out to Stripe in the system browser, which is only
allowed on the US storefronts.

## How it works

- `src/lib/storeProducts.ts`: every product id, on both stores, and the tier
  or deck it unlocks.
- `src/lib/iap.ts`: the app side. Loads the RevenueCat plugin only inside the
  apps, logs in with the Supabase user id, fetches local prices, buys,
  restores, and opens the store's own subscriptions page.
- `/api/iap/sync`: called by the app after a purchase, a restore and when the
  app comes back to the foreground. Reads RevenueCat with the secret key and
  writes the result. The app is never trusted about what was bought.
- `/api/revenuecat/webhook`: RevenueCat calls this on every renewal,
  cancellation, refund and transfer. It does the same read.
- `src/lib/storeEntitlements.ts`: turns RevenueCat's record into a tier and
  decks, and combines it with Stripe.

### Stripe and the stores together

`profiles.store_tier` holds what the stores grant. `profiles.tier` stays the
one column every gate reads, and is always the higher of the Stripe plan and
the store plan, so a lapse on one side never downgrades a plan paid for on the
other. A tier granted by hand (a comp, a tester) is never touched unless the
stores have granted something to that account at some point.

Inside the apps, someone with a web (Stripe) plan sees it but is not sold a
second one; the screen says to change it on the website. Someone with a store
plan manages it in the store.

Deleting an account cancels a Stripe plan and deletes the RevenueCat customer.
A store subscription can only be cancelled by its owner, and the delete dialog
says so.

## Products to create

Create these exactly as written. A product id can never be reused in App Store
Connect, even after deletion.

| Plan | App Store id | Google Play subscription : base plan |
|---|---|---|
| Mapped+ monthly | `mapped_plus_monthly` | `mapped_plus` : `monthly` |
| Mapped+ yearly | `mapped_plus_annual` | `mapped_plus` : `annual` |
| Complete monthly | `mapped_complete_monthly` | `mapped_complete` : `monthly` |
| Complete yearly | `mapped_complete_annual` | `mapped_complete` : `annual` |

- App Store: all four auto-renewable subscriptions in one subscription group
  named "Mapped", with Complete ranked above Mapped+.
- Decks: one non-consumable per deck, same id on both stores:
  `deck_stitched_animal`, `deck_bird`.
- Prices: pick the store price point closest to the web price
  (Mapped+ $11.11/month or $100/year; Complete $22.22/month or $200/year).

## RevenueCat setup

1. Create a project with an App Store app and a Play Store app.
2. App Store: add the In-App Purchase key (App Store Connect → Users and
   Access → Integrations → In-App Purchase) and the App Store Connect API key.
3. Play Store: add a Google Cloud service account with access to the Play
   Console app (financial data and order management).
4. Import the products above. Create two entitlements, `plus` and `complete`,
   and attach every Mapped+ product to `plus` and every Complete product to
   `complete`.
5. Webhook: URL `https://<api host>/api/revenuecat/webhook`, authorization
   header value `Bearer <REVENUECAT_WEBHOOK_AUTH>`.

## Environment variables

| Name | Where | What |
|---|---|---|
| `REVENUECAT_SECRET_KEY` | Netlify (server) | RevenueCat secret API key (v1). Unset = store sync is off. |
| `REVENUECAT_WEBHOOK_AUTH` | Netlify (server) | A long random string; the same value goes in the RevenueCat webhook. |
| `NEXT_PUBLIC_REVENUECAT_IOS_KEY` | GitHub repo variable, app build | RevenueCat public Apple SDK key. |
| `NEXT_PUBLIC_REVENUECAT_ANDROID_KEY` | GitHub repo variable, app build | RevenueCat public Google SDK key. |

The two public keys are safe to ship in the app. The secret key and webhook
value are not.

## Database

Apply `supabase/migrations/20261118_store_purchases.sql`. It adds the
`store_*` columns to `profiles`, allows `source = 'store'` on
`purchased_decks`, and locks the new columns to the service role the same way
the Stripe billing columns are locked.

## Testing

- iOS: a sandbox tester (App Store Connect → Users and Access → Sandbox) on a
  device, or a StoreKit configuration file in Xcode.
- Android: license testers in the Play Console, on a build from the internal
  testing track.
- After a test purchase, the account screen should show "Billed by the App
  Store" or "Billed by Google Play", and the RevenueCat customer should be the
  Supabase user id.
