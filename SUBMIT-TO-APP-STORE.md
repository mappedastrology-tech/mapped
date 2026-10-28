# Getting Mapped into the App Store

Taylor is a solo founder with a marketing background, not an engineer. Explain
plainly, don't assume Terminal fluency, and do the work rather than handing over
commands to run.

This file was written by the cloud session that just finished a large audit-and-fix
pass, so that whoever picks this up has the full picture.

---

## Where things stand

Pull request #1 is **merged**. `main` now contains twenty audit fixes across ten
commits. This matters because before that merge, `main` held a build where
**nobody could sign in to the native app** — every Supabase auth redirect pointed
at `/auth/callback`, which `scripts/build-app.mjs` deliberately deletes from the
app bundle.

Already done, so don't redo it:

| Thing | State |
|---|---|
| `NSCameraUsageDescription` + `NSPhotoLibraryUsageDescription` | In `ios/App/App/Info.plist` |
| Android `CAMERA` permission | In `android/app/src/main/AndroidManifest.xml` |
| `ios/App/App/PrivacyInfo.xcprivacy` | Written, **not yet added to the Xcode target** |
| Bundle ID | `com.mappedastrology.app` |
| Version / build | `1.0` / `1` |
| Signing style | Automatic, **no Team set** |

---

## The build

Run these for Taylor, checking each actually worked before moving on.

```bash
git checkout main && git pull
npm install
NEXT_PUBLIC_API_BASE=https://mapped-astrology.netlify.app npm run build:app
npx cap sync ios
npx cap open ios
```

**Step 3 is not `npm run build`.** `build:app` produces a static export in
`.next-app/` with the server routes stripped out, because the app has no server
at runtime — it calls the Netlify-hosted API over HTTPS instead. The ordinary
web build will not work in the app shell.

---

## The two steps that need Taylor's hands

These need his Apple account and Xcode's interface, so they can't be scripted.
Walk him through them.

**1. Signing.** In Xcode: select the **App** target → **Signing & Capabilities**
tab → tick **Automatically manage signing** → choose his **Team**.

This needs an **Apple Developer Program** membership ($99/year). If he hasn't
got one, everything below is blocked until it's approved, which can take a
couple of days.

**2. The privacy manifest.** Drag `PrivacyInfo.xcprivacy` from the Finder into
the **App** group in Xcode's left sidebar, making sure **"Add to targets: App"**
is ticked. Apple requires this file, and one that merely sits in the folder is
not in the bundle. Afterwards confirm it appears under **Build Phases → Copy
Bundle Resources**.

---

## Then

**Product → Archive**. When it finishes: **Distribute App → App Store Connect →
Upload**.

If the archive fails, read the actual Xcode error before guessing at a cause.

---

## Still outstanding — none of it blocks the archive

- App Store Connect privacy answers (the questionnaire about collected data).
  The manifest at `ios/App/App/PrivacyInfo.xcprivacy` has every answer in it
  already: no tracking, and seven collected data types, all linked to the
  account and all for app functionality.
- Screenshots at the required device sizes.
- Store listing copy.
- A bundled fallback list of major cities. Birth city is required to create a
  chart, and the lookup is proxied through `/api/geocode` but still depends on
  one upstream service. If it is down, nobody can finish signing up.

## House rules

- Don't force-push, don't rewrite history, don't touch `main` beyond pulling.
- Report what actually happened, including failures. Don't assume a step worked.
- `AGENTS.md` in the repo root has the four-platform rules. Read it before
  changing any UI or feature code.
