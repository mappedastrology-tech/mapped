# Mapped — Simulation Run 1: Findings

**Scope of this run.** All 12 personas were executed end-to-end through the app's **real, deployed engines** — astrology (`calculateChart`), numerology (`computeNumerology`), Human Design (`computeHumanDesign`), and the Resonance engine across all four libraries — via the exact code paths the profile page uses, at commit `22986df`. Each persona was run twice for determinism, and once more with the sign-name bug corrected to measure its impact. Outputs were fact-checked against **independent** references (raw ephemeris math for the Sun, hand calculation for numerology, internal-consistency checks for HD). Every value is reproducible: `npx tsx scripts/sim/run.mts` regenerates `scripts/sim/report.json`.

**What this run did NOT do.** It did not click through the deployed UI (the Chrome extension has not registered with this session), so UX/layout/flow findings and cost/credit telemetry are still owed by the UI pass. It also did not run external calculators (Astro.com / MyBodyGraph) — those remain the human fact-checker's step in the SOP.

**Headline.** The astronomical core is **correct** — Sun sign *and* degree matched an independent ephemeris for all 12, including every deliberately hard case. Numerology's date math is correct with master numbers preserved. Human Design is internally consistent (and P01 happens to be a genuine Reflector). Against that solid base the run found **three S2 correctness bugs** — two of which affect a large share of real users right now — plus two minor items. Everything is deterministic (12/12 identical across repeat runs).

---

## 1. Fact-check results (per system)

**Astrology — PASS on the core, one S2 in the unknown-time path.**
Sun sign and degree matched raw `astronomy-engine` math for **12/12** to within ~0.04°. This covered the leap day (P06, 2000-02-29 → 9.83° Pisces), the year boundary (P05, 23:55 on Dec 31 → correctly still Capricorn), the near-midnight birth (P03, 23:50 → 0.18° Pisces — right on the cusp and still correct), the half-hour IST offset (P08), Brazilian summer time (P07, −2), Soviet decree time (P11, +3), and the cusp/dawn birth (P12, 29.66° Aries — the sign flips at 30°, and the app held it). The rising-cusp warning fired for P06/P09/P11 as designed. **P02 taught the fact-checker something:** my persona premise ("late-October DST fall-back") was wrong for 1985 — Italy ended DST on 29 September that year, so the app's +1 was *correct*, not a bug. Logged honestly (I-004 downgraded to S3).

**Numerology — date numbers PASS; name numbers FAIL for non-ASCII names (S2).**
Life Path and Birthday matched hand calculation for 12/12, with masters preserved (P03 LP 33, P09/P10 LP 11, P06 Birthday 11 — none collapsed to 6/2). But the name parser strips every non-A–Z character, so **any accented or Nordic name is computed from a mangled string** (I-003, below).

**Human Design — internally consistent; unknown-time correctly withheld.**
All timed personas produced a coherent Type/Authority/Profile/Definition, and P01's Reflector is real (zero defined centers, zero channels, "No Definition" — exactly what defines the type). P09 correctly had HD withheld. External MyBodyGraph confirmation is still the human step per the SOP.

**Resonance — deterministic PASS; correctness FAIL from an upstream data mismatch (S2).**
12/12 identical across repeated runs. But the archetype/animal/deity/character results are all being computed **without any zodiac signs** (I-001, below) — the single largest finding, and it visibly distorts the cross-persona spread.

---

## 2. Issues found (also in the Issue Log sheet)

**I-001 · S2 · Zodiac signs never reach the Resonance engine.**
The database and `calculateChart` store signs **abbreviated** (`"Gem"`, `"Sco"`, `"Ari"`); the Resonance engine's weight tables are keyed by **full names** (`"Gemini"`, `"Scorpio"`). Nothing translates between them, so every user's Sun, Moon, Rising, and planetary-sign features are silently dropped — only houses, numerology, and Human Design get through. **12/12 personas' archetype, animal, deity, and character results change when the signs are restored**, and the bug produces a visible artefact: "The Cowardly Lion" won 5 of 12 characters and "Dog" 3 of 12 animals in the live path, versus a healthy spread when fixed. Fix: normalise abbreviation → full name at the engine boundary, then bump `ENGINE_VERSION` so stored snapshots supersede cleanly (the immutability rule handles the transition). This is the first thing to ship.

**I-002 · S2 (borderline S1) · Unknown birth time still fabricates a Rising sign and house placements.**
For P09 (`unknownTime: true`), `calculateChart` returned Rising = Cancer, a rising-cusp warning, and real house numbers for every planet — all derived from an assumed noon. The chart page (`you/page.tsx`) correctly hides these, and the Resonance path correctly drops houses, so the *main* screens are fine. But **20 other consumers read Rising/houses with no unknown-time guard** — notably `dollyDepth.ts` (43 references, so Dolly can confidently tell an unknown-time user about a Rising and houses that were invented), `Interpretations.tsx`, `exportChart`, `WebToday`, `chartRuler`, and the composite/solar-return interpreters. Fix at the source: `calculateChart` should return `rising: null` and `houses: []`/`house: null` when `unknownTime`, which protects all 20 at once. Rated S2 because it makes the app assert false facts; a Dolly session that states them would arguably be S1.

**I-003 · S2 · Non-ASCII letters silently stripped from names → wrong Expression / Soul Urge / Personality.**
`parseName` does `.replace(/[^A-Z]/g, "")`, deleting Þ, ó, é, ü, ø, ß, ñ and every other extended letter. The effect is not a rounding error — it flips results: *Freya Þórsdóttir* gets Ex 1 / SU 6 / Pe 4 from the app vs Ex 5 / SU 9 / Pe 5 with proper transliteration; *José García* gets Ex 11 / SU 8 vs the correct Ex 7 / SU 22; *Zoë Müller* shows a false double master (11/11) that is really 1/1. Anyone with an accented, Nordic, or extended-Latin name is getting wrong name-numbers, sometimes with fake master numbers. Fix: Unicode NFD-decompose and strip combining marks, plus an explicit map for letters that don't decompose (Þ→TH, ß→SS, Æ→AE, Ø→O, Đ→D), *before* the A–Z filter.

**I-004 · S3 · UTC offset sampled at noon UTC, ignoring the birth hour.**
`getUtcOffsetHours` uses a fixed 12:00Z reference, so a birth on a DST-transition day *before* the switch gets the post-switch offset (~1 h off → Ascendant off ~15°, enough to flip a Rising sign). Narrow (only births in the hours between a switch and noon UTC on the transition day itself), and — to be explicit — the P02 case turned out **not** to trigger it because Italy's 1985 switch was in September. Fix: sample the offset at the actual local birth datetime.

**I-005 · S3 · Numerology name source isn't visible to the user.**
The name feeding the calculation comes from a stored/display string the user never sees or confirms. Combined with I-003, users can't tell *why* a number looks off. Show "calculated from: ‹name›" with an edit affordance (spec §6.4 #2 / `numerology.source_name`).

---

## 3. What passed cleanly (worth stating)

Determinism (12/12 identical); Sun sign+degree (12/12 vs independent ephemeris, incl. all edge cases); Life Path & Birthday (12/12 by hand, masters preserved); HD internal consistency and the correct withholding of HD for unknown time; the rising-cusp warning; historical timezone lookup (Rome/NY/São Paulo/Moscow all correct); the Reflector edge case surfacing naturally.

---

## 4. Recommended next actions, in order

1. **Fix I-001** (sign normalisation + `ENGINE_VERSION` bump) — one small change, largest user-facing impact; re-run `scripts/sim/run.mts` and confirm the concentration disappears.
2. **Fix I-002** at the source in `calculateChart` — protects all 20 downstream consumers; add P09 as a permanent regression case.
3. **Fix I-003** in `parseName` — add a unit test over the four names above.
4. Fix I-004 (sample at birth instant) and add I-005 (surface the name).
5. Run the **UI pass** once the Chrome extension connects: the per-session script, cost/credit telemetry, Dolly safety prompts, and web↔mobile parity — the half of the plan this run couldn't cover.
6. Human fact-checker step: confirm the 12 charts against Astro.com (tropical + Placidus) and MyBodyGraph per the SOP; the pre-filled "App value" columns are now in the workbook so that pass starts from real output.
