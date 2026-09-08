# Mapped — 12-User Simulation & Profile Fact-Check Program

**Purpose.** Run 12 synthetic users through the *real, deployed* Mapped app across a compressed equivalent of a 3-month usage period, capture every bug and every "this doesn't make sense" moment, and rigorously fact-check every profile the app generates (astrology, numerology, Human Design, and the Resonance results: archetype, animal guide, deity, character).

**How to read this.** Sections 1–3 are the design (what we're testing and with whom). Section 4 is issue capture. Sections 5–6 are the fact-check methodology and the **SOP** — the exact, repeatable procedure. Section 7 is tooling. Section 8 is **"what you might be missing"** — read that one even if you skim the rest. The companion file `Mapped_Simulation_Trackers.xlsx` is where you actually record everything; every template in this document maps to a sheet in that workbook.

---

## 1. Objectives & success criteria

We are answering four questions:

1. **Is it correct?** For each persona, are the Sun/Moon/Rising, all placements and houses, the numerology numbers, and the full Human Design chart *actually right* for that birth data, verified against an independent source?
2. **Is it coherent?** Do the Resonance results (archetype, animal, deity, character) make sense for the chart, stay deterministic (never silently regenerate or change), and cite provenance honestly?
3. **Does it hold together as an experience?** Over a simulated 3 months of real usage — journaling, tarot, Dolly, transits, revisiting the profile — does anything break, confuse, or contradict itself?
4. **Is it safe and sound?** Privacy, cost/credit behaviour, error handling, cross-user data isolation, and the content-safety guardrails.

**Exit criteria (the program is "done" when):**

- All 12 personas have a completed, signed-off fact-check sheet with **zero unresolved S1/S2 correctness defects**.
- Every surface in the coverage matrix (Section 3) has been exercised by at least 3 personas across both web and mobile.
- The issue log has no open **S1 (broken)** or **S2 (wrong/misleading)** items; S3/S4 items are triaged with a decision (fix / won't-fix / backlog).
- A determinism-and-cost pass confirms fixed content (placements, numerology, archetype, animal, deity, character) does **not** regenerate or spend AI credits on repeat views.
- A final report summarises defects found, fixed, and outstanding, with before/after evidence.

---

## 2. The 12 personas

Synthetic personas let us control every input, so every output can be checked against a known-correct reference. The roster is a **coverage matrix**, not 12 random people — each persona is chosen to stress a specific class of edge case that commonly breaks astrology/numerology/HD engines. Birth data below is the *input*; the "target" column is what that persona is meant to prove and must be confirmed during fact-check (if a target doesn't materialise, note it and, where it matters, swap the date).

| # | Persona | Birth date | Birth time | Birthplace | Edge cases it stresses |
|---|---|---|---|---|---|
| P01 | Ava Chen | 1990-07-15 | 14:30 | New York, USA | Baseline / control. US-Eastern DST-on, standard 2-word Latin name, Cancer Sun. |
| P02 | Mateo Rossi | 1985-10-27 | 02:30 | Rome, Italy | European DST **fall-back weekend** — a local time that occurs twice; tests UTC-offset resolution. |
| P03 | Zainab Al-Farsi | 1993-02-18 | 23:50 | Dubai, UAE | **Near-midnight** birth (date-rollover risk in UTC conversion); Gulf +4, no DST; name with hyphen/particle. |
| P04 | Freya Þórsdóttir | 1998-12-21 | 03:10 | Reykjavík, Iceland | **High latitude** (Placidus house distortion, intercepted signs, possible missing/extreme houses); solstice; **non-ASCII name** (Þ, ó) → numerology transliteration. |
| P05 | Kwame Mensah | 1979-12-31 | 23:55 | Accra, Ghana | **Year-boundary** birth; equatorial; GMT+0; **pre-1980 historical** timezone data. |
| P06 | Mia Nakamura | 2000-02-29 | 12:00 | Tokyo, Japan | **Leap day (Feb 29)**; exact noon; JST no DST. |
| P07 | Lucas Silva | 1988-02-05 | 21:40 | São Paulo, Brazil | **Southern hemisphere**; Brazil summer-time (historical DST whose rules changed) — timezone-engine stress. |
| P08 | Priya Nair | 1995-09-05 | 18:20 | Mumbai, India | **Half-hour timezone** (IST +5:30) — non-integer offset. |
| P09 | Sam Rivers | 1992-04-04 | **UNKNOWN** | Denver, USA | **Unknown birth time** → no Rising, no Human Design; tests the degraded "no-birth-time" path on every surface (profile, resonance confidence, HD/rising warnings). |
| P10 | Noor Haddad | 1990-06-13 | 08:15 | Beirut, Lebanon | **Master number** target (digit-sum 29 → Life Path 11); inspect for **karmic-debt** numbers; Gemini. |
| P11 | Elena Petrova | 1970-06-13 | 10:05 | Moscow, USSR | Target **Reflector** HD type (rarest, ~1% — confirm, don't force); Soviet-era "decree time" TZ oddity. |
| P12 | Diego Torres-Vega | 1996-04-19 | 05:50 | Mexico City, Mexico | **Sun on the Aries/Taurus cusp** + **dawn birth** (Rising near the ascendant cusp → the app's rising-cusp warning); **hyphenated surname** for numerology. |

**Notes on targets.**
- P11 (Reflector) and P10 (master/karmic) are *aspirational*: Human Design type and karmic-debt numbers depend on exact computation, so confirm during fact-check and only swap the date if a Reflector is important to you (it's a nice-to-have — the four common HD types are already well covered by P01–P08, P10, P12).
- Collectively the roster should surface all five HD types, both hemispheres, integer and half-hour and DST-boundary timezones, a leap day, a year boundary, a high-latitude chart, an unknown-time chart, and four "hard" numerology names (non-ASCII, hyphenated, particle, and a master-number case). Confirm this spread on the Personas sheet before you start; add a 13th persona if a class is missing.

**Data hygiene.** Create 12 separate real accounts (or the app's equivalent) — one per persona — so that Row-Level Security and cross-user isolation get tested for real. Use a naming convention like `sim+p01@yourdomain` … `sim+p12@yourdomain` (Gmail's `+alias` trick gives 12 distinct addresses on one inbox). Never share a login between two personas; leakage between them is itself a defect you want to catch.

---

## 3. The compressed-simulation model

### 3.1 Coverage matrix — every surface, every persona-week

The app's surfaces (features to exercise): **Chart / Astrology** (big-3, full placements, houses, aspects, transits, synastry/connections, composite, solar return, astrocartography), **Numerology**, **Human Design**, **Palmistry** (+ share card), **Tarot & Oracle** (draws, readings, save, "further reading with Dolly"), **Dolly** (web + mobile, cross-feature context, saved chats, summaries, bug report), **Journal** (check-ins, morning/evening reflection, burn mode, voice-to-text, photos, titles), **Profile / Resonance** (archetype + radar + traits + reading, animal, deity, character, "Everything you are"), **Maps / people**, **Home**, **Rituals / Learn**, **Notifications**, **Settings / theme / top bar**, **Auth / accounts**, **Payments** (if live).

Rule of thumb: **each surface is touched by ≥3 personas, across both web and mobile.** Track coverage on the Personas sheet (one column per surface, tick when done). Don't let all 12 do only the "happy path" home screen.

### 3.2 Compressing 3 months into a short run

A real 3-month beta is mostly *repetition* plus *time passing*. We compress the repetition and handle time separately.

- **Map 1 simulated week → 1 test session.** Twelve sessions per persona = a simulated 3 months (12–13 weeks). You do not need 12 calendar weeks; you can run several sessions per day. Realistically this is **3–6 focused test days** for one tester across all personas, or faster split across a small team.
- **Each session follows a script** (Section 3.3) so behaviour is consistent and comparable persona-to-persona, and so a regression can be re-run identically after a fix.
- **Vary the "day"** deliberately: some sessions in the morning, some at night (to catch the journal's time-aware titles and any day/night logic), some with a fresh app load (cold cache), some returning (warm).

### 3.3 Per-session script (the "week")

Each session, as the persona:

1. **Open the app** (alternate cold load / returning; alternate web / mobile per the coverage matrix).
2. **Home**: read the day's content; note anything that looks wrong, generic, or contradicts the profile.
3. **One "generated" surface** on rotation (chart interpretation, numerology, Human Design, a specific placement like "Mars in the 8th"): open it, then **open it again** — confirm the text is identical and that no loading/regeneration/credit-spend happens (this is the determinism check in the field).
4. **Journal**: do a check-in (rotate morning-reflection / evening / free / burn mode / voice-to-text / add-photo across sessions). Confirm titles are time-appropriate, back-navigation is correct, and nothing freezes or scrolls oddly.
5. **Tarot or Oracle**: pull a reading, save it, then "further reading with Dolly" — confirm the save prompt appears and Dolly receives the pull.
6. **Dolly**: ask 2–3 things that require your chart/journal/tarot context ("what does my chart say about X", "what did I journal about", "what's my transit today"). Confirm it's actually connected to *this* persona's data and not generic or another persona's.
7. **Transits / Maps**: check today's transits; across personas confirm they **differ per person** and per day (the known past bug). Compare two personas side by side.
8. **Profile / Resonance**: view the archetype, radar, animal, deity, character. Confirm they're stable across reloads and coherent with the chart.
9. **Log everything** odd, wrong, confusing, slow, or ugly in the Issue Log immediately (don't batch from memory).

### 3.4 The one thing compression can't fake — time-dependent behaviour

Some behaviour only appears as real calendar time passes: **transits changing week to week, journal streaks, scheduled/daily notifications, "near-future" transit recomputation, solar-return timing, and anything cached-by-day.** Compression can't observe these naturally. Handle them explicitly:

- **Transit-change check:** verify the *calculation* directly by computing transits for several future dates (a developer check against the transit engine, or by temporarily setting a test device's clock forward a few weeks and reloading). Confirm the numbers move and stay per-person. Record it as a dedicated line item rather than assuming.
- **Notifications:** trigger the notification path manually (or with the device clock) rather than waiting; confirm timezone-correct send time and that it isn't duplicated or spammy.
- **"Fixed vs. time-sensitive" invariant:** confirm the intended split — fixed placements/numbers/archetype **never** recompute; near-future transits **do**. This is both a correctness check and a cost check.
- Flag anything you genuinely cannot validate in compression as **"requires calendar spot-check"** and schedule a light real-time follow-up (a 10-minute look once a week for a few weeks).

---

## 4. Capturing issues and "things that don't make sense"

### 4.1 One log, logged in the moment

Everything goes in the **Issue Log** sheet as it happens. Memory is lossy; a screenshot at the moment of confusion is worth ten reconstructed bug reports. Two buckets share the log:

- **Defects** — something is broken, wrong, or misleading.
- **"Doesn't make sense"** — nothing is technically broken, but a real user would be confused, mistrustful, or annoyed. These are first-class findings, not noise; they're often the difference between an app people keep and one they delete. Log them with type = **UX/Confusion** and describe *what you expected vs. what happened*.

### 4.2 Issue record — fields (map 1:1 to the Issue Log sheet)

`ID` · `Date` · `Persona` · `Platform` (web / iOS / Android) · `Surface/Feature` · `Type` · `Severity` · `Title` · `Steps to reproduce` · `Expected` · `Actual` · `Evidence` (screenshot/recording link) · `Status` · `Owner` · `Fix commit/PR` · `Notes`.

### 4.3 Type taxonomy

`Bug` (crash, error, broken flow) · `Calc/Data error` (wrong astrological/numerology/HD value) · `Content accuracy` (interpretation factually wrong or self-contradicting) · `UX/Confusion` (unclear, surprising, mistrust-inducing) · `Copy` (typo, tone, grammar) · `Performance` (slow, janky) · `Visual/Layout` (spacing, overlap, theming) · `Accessibility` · `Cost/Credits` (unexpected AI regeneration/spend) · `Privacy/Security` (data leak, wrong-user data) · `Safety/Content-policy` (medical/financial claims, self-harm handling, minors, cultural sensitivity).

### 4.4 Severity

| Sev | Meaning | Example | SLA |
|---|---|---|---|
| **S1 — Critical** | Broken, data loss, crash, privacy leak, wrong-user data, or a safety failure. | Dolly shows another persona's chart; app crashes on a leap-day birth. | Stop-ship. Fix before continuing. |
| **S2 — Major** | Wrong or misleading output a user would act on or screenshot. | Rising sign wrong; Life Path miscalculated; a deity mislabelled or from an excluded closed tradition. | Fix this cycle. |
| **S3 — Minor** | Confusing, ugly, or annoying, but not wrong. | Journal title not time-appropriate; text too close to an image. | Triage; fix if cheap. |
| **S4 — Trivial** | Cosmetic / polish. | A typo; 2px misalignment. | Backlog. |

### 4.5 Triage cadence

- **Daily (during active runs):** a 15-minute pass — read the day's new issues, set severity, kill duplicates, escalate S1s immediately.
- **Weekly:** review trends (which surface generates the most confusion?), decide the fix list, and **re-run the affected session scripts after each deploy** (regression — Section 6.4).

---

## 5. Profile fact-check methodology

This is the heart of "fact-check every profile." For each persona you produce one completed fact-check record per system. The principle throughout: **the app's value is compared against an independent, authoritative reference, using the same settings, and any mismatch is a defect.**

### 5.1 Astrology

**What the app does (so the reference matches it):** tropical zodiac by default (a sidereal option exists), **Placidus houses** (computed from cusps in the chart engine), timezone resolved from coordinates with DST handled per the birth date. Set your reference tool to **exactly these settings** or the comparison is meaningless.

**Reference tools (independent of the app):** Astro.com (Astrodienst) "Extended Chart Selection", and/or Astro-Seek — both let you fix zodiac = tropical, houses = Placidus, and enter an exact time and place.

**Check, per persona:**
- **Big Three:** Sun sign, Moon sign, Rising/Ascendant sign.
- **Every placement:** for each of Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto, North Node, Chiron — the **sign** and the **house** match the reference.
- **Houses:** the 12 cusp signs; and specifically the ascendant and midheaven.
- **Edge behaviours:** DST-boundary births (P02, P07) resolve to the correct UTC and therefore the correct chart; half-hour offset (P08) is honoured; leap day (P06) and year-boundary (P05) don't shift the date; high-latitude (P04) houses are handled (note intercepted/duplicated signs and whether the app copes); near-midnight (P03) doesn't roll to the wrong day; unknown-time (P09) correctly **suppresses** Rising and anything house-dependent rather than defaulting to 0°/Aries.
- **Cusp warning (P12):** the rising-cusp caution actually appears when the Ascendant is within a couple of degrees of a sign boundary.

**Acceptance:** Big Three and every planet's sign must match exactly. House placements must match given the same house system; if the app secretly uses a different house system than it displays, that is itself an S2 finding (confirm which system is *shown to the user* — see Gaps §8).

### 5.2 Numerology

**Method to pin down first (this is a real ambiguity in the app):** confirm (a) which **name string** feeds the calculation — the full birth name, a display name, or an account name — and (b) the reduction method (Pythagorean, master numbers 11/22/33 preserved, components reduced separately vs. all digits summed). The app has more than one possible name source; if it's using a display name, Expression/Soul-Urge/Personality are computed from the wrong string for everyone. **Pin the method, then hand-calculate.**

**Reference:** a hand calculation (most reliable, because you control the method) cross-checked against a reputable Pythagorean calculator set to the *same* master-preservation rule.

**Check, per persona:** Life Path (from the date), Expression, Soul Urge, Personality, Birthday, Maturity — and the presence/handling of **master numbers** (P10 target) and **karmic-debt numbers** (13/14/16/19). Verify non-ASCII/hyphenated names (P03, P04, P12) are transliterated/handled consistently and documented, not silently dropped.

**Acceptance:** every number matches the hand calculation under the app's stated method; master numbers are preserved (not reduced to 2/4/6); the exact name string used is known and correct.

### 5.3 Human Design

**Reference:** the official **Jovian Archive / MyBodyGraph** calculator (or Genetic Matrix as a second opinion). Enter identical birth data.

**Check, per persona:** Type, Strategy, Authority, Profile (both lines), Definition, defined/undefined **Centers** (all nine), **Channels**, and the **gates** — crucially including the **Design side** (the app computes the sky at 88° of solar arc before birth; confirm the design-side gates and the incarnation cross match, not just the personality side). For P09 (unknown time) confirm HD is correctly **withheld**, not guessed.

**Acceptance:** Type, Authority, Profile, and Definition match the reference for all timed personas; spot-check that at least a few design-side gates and the channel list agree (design-side errors are the most common way HD engines go subtly wrong).

### 5.4 Resonance results (archetype, animal, deity, character)

There is no external "correct answer" here — the engine is proprietary and deterministic — so fact-checking means four different checks:

1. **Determinism & no-cost.** Load the profile, record the four results, hard-reload several times (and on a second device/session). The archetype, animal, deity, character, traits, facets, and signature must be **identical every time**, with **no loading spinner and no AI-credit spend** on repeat views. (This directly tests the "why does it need a new version every time — that's sus" concern.) Any drift or spend is S1/S2.
2. **Face validity / coherence.** Does the result fit the chart? A Scorpio-heavy, 8th-house, introspective persona landing on a shadow/transformation archetype, a nocturnal animal, an underworld deity, and a withdrawn character is coherent; a sunny extrovert getting the same would be a red flag. Record a one-line "plausible? y/n + why" per persona. Also confirm the **secondary/"shaded by"** and the **evidence lines** reference the persona's actual placements.
3. **Provenance accuracy** (the app's differentiator — check it hard). For the deity and animal cards: is the **tier** right (attested / widely-shared / modern-popular / historical / living-open)? Are the **sources** real and correctly attributed (e.g. the hummingbird framed as the Aztec warrior-soul, not "joy"; the owl as Greek/Welsh)? Is the **terminology** correct ("Animal Guide", never "spirit animal")? Is **nothing assigned from an excluded closed tradition** (no Òrìṣà, Vodou Lwa, Indigenous North American, Aboriginal, Hawaiian aumakua, Siberian, living Maya day-signs, or Abrahamic figures)? Do **living-tradition** deities use comparative phrasing ("echoes"), never possessive? Any violation is S2 (or S1 if culturally sensitive).
4. **Cross-persona spread.** Lay the 12 personas' four results side by side. You should not see the same archetype/animal/deity/character dominating multiple personas, nor an obviously wrong repeat. (The engine is calibrated for even coverage; this is the field confirmation.)

**Acceptance:** perfectly deterministic and free on repeat; coherent with the chart; provenance accurate and within the cultural gate; sensible spread across the 12.

### 5.5 Cross-feature consistency

Verify the profile agrees with itself everywhere it appears: the Sun sign on Home matches the chart matches Dolly's understanding; the archetype on the profile matches any share card; Dolly's "your chart" answers match the actual chart; a saved tarot pull is the one Dolly references. Contradictions between surfaces are high-value UX findings.

---

## 6. The SOP — Standard Operating Procedure

This is the repeatable procedure. Do it the same way every time so results are comparable and regressions are catchable.

### 6.1 Roles

Even solo, wear these hats explicitly and note which you're in:
- **Runner** — drives the app as the persona, follows the session script, logs issues.
- **Fact-checker** — runs the independent references and completes the fact-check sheets. *Should be a separate pass from running*, ideally a fresh mindset (bias: the runner already "trusts" the number they saw).
- **Triage owner** — sets severity, dedupes, decides the fix list, verifies fixes.

### 6.2 One-time setup (before any runs)

1. Freeze a **build under test** — record the exact deployed version/commit. Every issue references it.
2. Create the **12 accounts** and enter each persona's birth data **exactly** (double-check date, time, place — a typo here invalidates the fact-check).
3. On the **Personas sheet**, confirm the coverage matrix is complete (all HD types sought, both hemispheres, all the timezone/date edge cases). Add a persona if a class is missing.
4. Set up **references**: bookmark Astro.com/Astro-Seek (tropical + Placidus), the numerology method + calculator, and MyBodyGraph. Write the chosen numerology method at the top of the numerology sheet.
5. Decide how you'll capture **AI-credit/cost telemetry** (dashboard, logs) so the determinism-and-cost checks have a source of truth.

### 6.3 Per-persona fact-check procedure (do once per persona, ~30–45 min each)

1. **Enter** the persona's birth data in the app; screenshot the raw chart/profile.
2. **Astrology:** open Astro.com with identical settings; fill the FactCheck-Astrology rows (app value vs reference value vs match). Note any edge-case behaviour for that persona.
3. **Numerology:** hand-calculate under the pinned method; fill FactCheck-Numerology. Confirm the name string used.
4. **Human Design:** run MyBodyGraph; fill FactCheck-HumanDesign incl. a design-side spot-check.
5. **Resonance:** run the four checks in §5.4; fill FactCheck-Resonance. Do the reload-and-cost determinism test and record the credit reading before/after.
6. **Cross-feature:** confirm consistency (§5.5).
7. **Sign-off:** mark the persona "fact-checked" with your initials and date only when every row is filled and every mismatch is logged as an issue.

### 6.4 Per-session run loop (the "week")

Follow the Section 3.3 script; log issues live; tick the coverage matrix; record the session in the Weekly-Run-Log sheet (persona, sim-week, platform, surfaces touched, issues opened).

### 6.5 Deploy-regression procedure (after every fix/deploy)

1. Note the new build version.
2. **Re-run the exact session script(s)** that surfaced the fixed issue, on the same persona(s), and confirm the fix.
3. Run the **automated resonance validation** (`npm run resonance:validate`) and a determinism spot-check to confirm no regression in the engine's coverage/balance and that fixed content still doesn't regenerate.
4. Re-verify **one** previously-passing fact-check line per system as a smoke test (deploys can break things that were fine).
5. Update the issue's status to Verified/Closed with the fix commit.

### 6.6 Weekly review & final report

- **Weekly:** trends, fix list, coverage gaps, calendar spot-checks for time-dependent items.
- **Final:** a short report — defects found/fixed/outstanding by severity and surface, the 12 fact-check sheets, the resonance spread table, and a go/no-go against the exit criteria in Section 1.

---

## 7. Tooling & environment

- **Accounts/data isolation:** 12 distinct logins; verify no persona can see another's data (RLS). This is both setup and a security test.
- **Capture:** screenshots for every issue; screen recordings for flows and anything intermittent. Store links in the Issue Log.
- **Console & network:** on web, keep dev-tools open — log console errors and failed/duplicated network calls (especially any AI endpoint firing on a supposedly-static view). On mobile, use the platform logs or a debug build.
- **Cost telemetry:** a way to see AI-credit spend per action (your Anthropic/usage dashboard or app logs), so "did this regenerate?" has an objective answer.
- **References:** Astro.com / Astro-Seek (astrology), MyBodyGraph / Genetic Matrix (Human Design), hand-calc + a Pythagorean calculator (numerology).
- **Regression automation:** the existing `resonance:validate` harness in the repo; run it on every deploy.
- **Devices:** at least one iOS, one Android, and desktop + mobile web; light and dark theme.

---

## 8. What you might be missing (gaps, risks, and blind spots)

You asked to be told if you're missing things. These are the areas a founder running this alone most often overlooks — grouped so you can decide which to fold into the program.

**Input & calculation edge cases (beyond the personas):**
- **House system transparency.** Confirm which house system is actually *shown to the user*, and that it's consistent everywhere. If the engine computes Placidus but any doc/claim says Whole Sign (or vice-versa), that's a credibility bug.
- **Numerology name source.** Pin down the exact string feeding numerology; a display-name vs. birth-name mismatch silently corrupts Expression/Soul-Urge/Personality for everyone.
- **Pre-1970 and "war time"/decree-time timezones** (P05, P11): historical offsets are where TZ libraries most often disagree — spot-check against a historical TZ source.
- **The 0°/Aries default trap:** the past bug where missing positions collapsed to 0° Aria. Explicitly confirm unknown/absent data never silently defaults to a real-looking value anywhere (charts, transits, connections).

**Determinism, cost, and trust:**
- **Credit/regeneration audit across *every* AI surface**, not just the profile — chart interpretation, numerology text, Dolly, tarot readings. A single view that quietly re-calls the model is both a cost leak and the "sus" feeling users flagged.
- **Caching correctness:** if content is cached (localStorage/db), confirm the cache key is right so two different people never see each other's cached reading, and a genuinely-changed input *does* refresh.

**Safety & content policy (easy to under-test, high blast radius):**
- **Dolly safety:** self-harm / crisis handling, no medical or financial advice, appropriate handling if a user presents as a minor, and no confidently-wrong claims about someone's chart. Script a few adversarial persona messages to test this deliberately.
- **Cultural sensitivity / appropriation** in the deity and animal libraries — the exclusion list and "Animal Guide" terminology are a legal-and-reputational spine; fact-check them hard (§5.4.3).
- **Copyright:** tarot/oracle art licensing, and the character library being genuinely public-domain (Sherlock Holmes and Tarzan have contested late-works status in some markets).
- **Disclaimers:** "for entertainment / self-reflection", not deterministic fact — present where it needs to be.

**Privacy, security, compliance:**
- **RLS / cross-user isolation** tested with the 12 real accounts (not assumed).
- **Sensitive data:** birth date/time/place and full name are personal data; confirm storage, and that account **deletion** actually removes it. If you later add *real* testers, you need consent and a basic privacy notice.
- **Payments (if Stripe is live):** trial start/expiry, upgrade/downgrade, refund, and **entitlement gating** (does a free user correctly hit the paywall; does a paid user never lose access mid-session?).

**Platform, performance, accessibility, observability:**
- **Web ↔ mobile parity:** the same profile should read the same on both; you've already hit web-vs-mobile Dolly and layout bugs, so treat parity as a first-class check.
- **Performance:** cold-load time, a *large* journal, image-heavy entries, the radar SVG on low-end phones.
- **Accessibility:** contrast (especially the brass-on-dark theme), tap-target sizes, dynamic font scaling, screen-reader labels on icon-only buttons.
- **Error handling & empty states:** no chart yet, no journal yet, offline, flaky network, expired session — every surface should degrade gracefully, not white-screen.
- **Observability:** is crash/error logging (e.g. Sentry) capturing what testers hit? If not, you're relying entirely on manual notes. Add it before the run if you can — it turns "it glitched once" into a stack trace.
- **Analytics:** are you capturing what personas actually *do* (funnels, feature usage, drop-off)? Even in a sim, this validates your event tracking is firing correctly for the real launch.

**Process gaps:**
- **A fresh-eyes pass.** The most valuable "doesn't make sense" findings come from someone who has *never* seen the app. Budget one session with an outsider per major surface.
- **Regression discipline.** Fixes cause new bugs; the deploy-regression step (§6.5) is what stops the program from playing whack-a-mole.
- **Time-dependent follow-up.** Compression can't fully cover transits-over-months, streaks, and notifications; schedule the light real-calendar spot-checks (§3.4) rather than declaring victory early.

---

## 9. How the pieces fit (quick start)

1. Open `Mapped_Simulation_Trackers.xlsx`; on the **Personas** sheet, confirm/adjust the 12 and finish the coverage matrix.
2. Do the **one-time setup** (§6.2): freeze the build, create 12 accounts, set up references and cost telemetry.
3. Run the **per-persona fact-check** (§6.3) for all 12 → fill the four FactCheck sheets. Fix S1/S2 correctness issues first.
4. Run the **compressed sessions** (§6.4) → fill the Weekly-Run-Log, log issues live.
5. After each fix, run **deploy-regression** (§6.5).
6. **Weekly review**; do the **calendar spot-checks** for time-dependent items; write the **final report** against the exit criteria.

*Everything you record has a home in the workbook; this document is the "why and how," the workbook is the "what you found."*
