# App Store Connect — App Privacy answers

Click-through answers for the App Privacy questionnaire, in the order Apple asks.
Every answer below is traced to a real table or code path, not guessed.

**App Store Connect → your app → App Privacy → Edit**

First question: **"Do you or your third-party partners collect data from this app?"**
→ **Yes**

---

## Tick these data types, and nothing else

| Apple's category | Tick | Where it lives |
|---|---|---|
| Contact Info → **Email Address** | ✅ | `auth.users`, for signing in |
| Contact Info → **Name** | ✅ | `profiles`, `charts` |
| Financial Info → **Purchase History** | ✅ | `profiles.tier`, `purchased_decks` |
| Location → **Coarse Location** | ✅ | birth coordinates on `charts` — see the note below |
| User Content → **Photos or Videos** | ✅ | palm photographs, profile photo |
| User Content → **Customer Support** | ✅ | `bug_reports` |
| User Content → **Other User Content** | ✅ | `journal_entries`, `dolly_conversations`, `tarot_readings`, `custom_rituals` |
| Identifiers → **User ID** | ✅ | the Supabase account id |
| Identifiers → **Device ID** | ✅ | `push_subscriptions` endpoints |
| Usage Data → **Product Interaction** | ✅ | `course_progress`, `quiz_attempts`, `lesson_reviews`, `ritual_completions` |
| Diagnostics → **Crash Data** | ✅ | `/api/client-error` |

**Leave everything else unticked**, in particular:

- **Payment Info** — card details go straight to Stripe and never touch our
  servers. We store a Stripe customer id, not a card.
- **Precise Location** — the app never calls `navigator.geolocation` and asks
  for no location permission. Verified by grep.
- **Contacts** — the people on someone's map are typed in by hand. The device
  address book is never read.
- **Browsing History**, **Search History**, **Advertising Data**,
  **Health & Fitness**, **Sensitive Info**.

---

## For every single one of the eleven, answer the follow-ups the same way

1. **"Is this data linked to the user's identity?"** → **Yes**
   (everything is keyed to their account)
2. **"Is this data used to track the user?"** → **No**
   (nothing is shared with data brokers, used for advertising, or joined with
   data from other companies' apps — which is Apple's definition of tracking)
3. **"What is this data used for?"** → tick **App Functionality** only

Do **not** tick Analytics, Product Personalization, Advertising, or Developer's
Advertising or Marketing for anything. Ticking Analytics on Product Interaction
would be the easy mistake — but course progress is not analytics here, it *is*
the Learn feature: the progress bar, the streak and the certificate are built
from it.

---

## Two judgment calls, so you can defend them if asked

**Coarse Location.** A reasonable person could argue this isn't location data at
all — it's a birth city someone types, it's historical, and it never comes from
the device. I ticked it anyway. Under-declaring is the expensive mistake at
review; over-declaring costs you a line on the privacy label.

**Sensitive Info — left unticked.** Apple's definition covers biometric data,
and a palm photograph could be argued either way. I left it off because the
photo is never used to identify anyone; it's read for an entertainment reading
and the user consents first. If a reviewer raises it, that's the answer. Be
ready to give it rather than surprised by the question.

---

## Also fill in

- **Privacy Policy URL** → `https://mapped-astrology.netlify.app/privacy`
- **Account deletion**: Apple requires in-app account deletion (5.1.1(v)).
  Mapped has it, on the Account screen. It cascades across 24 of 25 tables
  from `auth.users`; `bug_reports` is handled explicitly.

---

## This must agree with the manifest

`ios/App/App/PrivacyInfo.xcprivacy` declares the same eleven types, no
tracking, and an empty tracking-domains array. If you change an answer here,
change it there too — a contradiction between the two is exactly what gets
flagged.
