# Mapped Learning Library — Research & Curriculum Blueprint

> Deep-research foundation for the in-app learning library (courses → lessons → quizzes → final test → certificate). Evidence-forward, with honest safety notes. Use this as the source-of-truth for authoring lesson content and quiz questions.

---

## 0. How to read this

Every esoteric topic below is split into three layers, and lessons must keep them visibly distinct:

- **TRADITION** — what the practice teaches (taught faithfully and in depth).
- **HISTORY** — where it actually came from (often corrects popular myths).
- **EVIDENCE** — what science does/doesn't support (led with, not buried).
- **SAFETY** — concrete cautions, featured prominently where real risk exists (herbs, oils, toxic minerals).

The honest, defensible framing for the whole library: these are **contemplative, symbolic, and cultural practices**. Their documented benefits run through attention, intention, ritual, reflection, and the placebo response — not through measurable physical "energy." Teach the tradition thoroughly; never make medical claims.

---

## 1. Pedagogy & engine design (evidence-based)

These shape the course engine itself.

**Lesson structure**
- One lesson = **one objective = one concept**, ~**3–5 minutes**, ~**200–350 words** (≤6 min if ever video). State the objective at the top ("By the end you'll be able to…").
- Chunk smaller for hard/unfamiliar material. Show estimated time per lesson and a progress indicator (lesson X of Y, % complete).

**Retrieval practice + spacing (highest-leverage features)**
- **Quiz immediately after every lesson** — retrieval beats re-reading for retention (testing effect; Roediger & Karpicke 2006).
- **Spaced review prompts** on an expanding schedule (**1 → 3 → 7 → 14 → 30 days**), adaptive: lengthen on success, reset to 1 day on a miss. Wire into the existing notification engine.

**Quiz design**
- 3–5 items per lesson. Build distractors from **real misconceptions**, not random wrong answers. 3 plausible options is fine (no filler 4th).
- **Immediate feedback with rationale** — explain why the right answer is right and why the chosen wrong answer is wrong.
- Mix item types: multiple-choice, true/false, matching.
- Keep items independent (one question never answers another). Store an explanation string per option.

**Final test + mastery**
- **Pass mark: 80%**, criterion/mastery-referenced (not graded on a curve). Display the threshold openly.
- **Generous retakes.** On fail, route the learner back to the specific weak lessons, then a fresh attempt.
- Pull each exam from a **question bank ~2–3× the exam length**, randomized (order of questions and options), so retakes aren't identical.

**Motivation / completion** (self-paced courses have notoriously low completion)
- Always-visible **progress**, **forgiving streaks** (allow a missed day), **milestone badges + certificates** for genuine accomplishment.
- Avoid competitive leaderboards in a wellness context; design for competence, autonomy, relatedness. Don't over-reward trivial actions (overjustification effect).

**Certificates**
- Contain: learner name, course title, completion date, estimated hours, issuer + logo, **unique certificate ID**, and a "completed with ≥80%" note.
- **Honest framing:** call them **"Certificates of Completion," not CEUs/credits.** Add: *"This certificate documents completion of an educational course in Mapped. It is not an accredited continuing-education credential and may not satisfy professional licensing requirements."*
- Make them shareable/downloadable.

---

## 2. Domain curricula

Each domain = a **track** of one or more courses. Courses = modules → lessons. Author content from the facts below.

### 2.1 Astrology
**Track: Foundations → Intermediate → Advanced.**

*Course A — Astrology Foundations*
1. What astrology is (and isn't): a symbolic language, not a predictive science
2. The birth chart: the sky frozen at your birth moment; what you need (date, exact time, place)
3. The four elements (fire/earth/air/water) & three modalities (cardinal/fixed/mutable)
4. The 12 signs — one lesson per element-group (4 lessons), key traits, ruling planets
5. The 10 planets + luminaries: Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto — what each governs
6. The "Big Three": Sun (identity), Moon (emotion), Rising/Ascendant (mask) — and why birth time matters for the Rising
7. The 12 houses: life areas; angular/succedent/cadent
8. The major aspects: conjunction, sextile, square, trine, opposition — orbs
9. Putting it together: reading a chart holistically

*Course B — Intermediate:* chart ruler, dignities (domicile/exaltation/detriment/fall), retrogrades, lunar nodes, Chiron, Lilith, hemispheres & chart shapes.

*Course C — Advanced:* transits (current sky vs natal), progressions, synastry (chart comparison) & composite charts, returns (solar/lunar), profections.

**EVIDENCE:** Astrology has been **tested and not supported** as a predictive or personality-descriptive science. The landmark study — Shawn **Carlson, "A double-blind test of astrology," *Nature* 1985** — found astrologers could not match natal charts to personality profiles above chance. (Teaching nuance: later re-analyses by Ertel (2009) and others argued the data weren't as flatly negative as Carlson claimed; present this honestly as "the most-cited test; its interpretation is debated, but mainstream science does not consider astrology validated.") The **Forer/Barnum effect** (vague, flattering statements feel personally accurate to almost everyone) explains much of astrology's felt accuracy. Frame astrology as a **tool for self-reflection and meaning-making**, which is exactly how Mapped already positions it.

**CULTURAL NOTE:** Distinguish **Western (tropical)** astrology from **Vedic/Jyotish (sidereal)** astrology — different zodiac, different cultural and religious roots. Credit each; don't blend them silently. (Mapped already supports both tropical and sidereal.)

---

### 2.2 Tarot
*Course — Tarot Foundations*
1. What tarot is: a 78-card symbolic system used for reflection and storytelling
2. **History (myth-buster):** tarot began as a **card game in mid-15th-century northern Italy** (*tarocchi*). Divinatory use only began **late 1700s** (Court de Gébelin, Etteilla). The "ancient Egyptian Book of Thoth" origin is a **myth**. The famous **Rider–Waite–Smith deck** is from **1909** (illustrated by Pamela Colman Smith, conceived by A. E. Waite).
3. Structure: **22 Major Arcana** (life themes/archetypes, The Fool → The World) + **56 Minor Arcana**
4. The Minor Arcana: **4 suits** (Wands/fire, Cups/water, Swords/air, Pentacles/earth), Ace–10 + 4 court cards (Page, Knight, Queen, King)
5. The Major Arcana — the Fool's Journey (one or two lessons walking the 22)
6. Court cards & suits in depth
7. Reversals (and the choice to use them or not)
8. Spreads: single card, three-card (past/present/future), the Celtic Cross
9. How to read: intuition + the cards as prompts; ethics (no medical/legal/death predictions)

**EVIDENCE:** Tarot has **no demonstrated predictive power**; it's a **projective tool** — the images prompt reflection and the reader's intuition. The value is in the structured self-inquiry, not divination. Teach it as such.

**SAFETY/ETHICS:** Reputable readers don't diagnose illness, predict death, or give legal/financial directives. Include this as an ethics lesson.

---

### 2.3 Numerology
*Course — Numerology Foundations*
1. What numerology is: assigning meaning to numbers; a symbolic system
2. **History:** number symbolism is ancient (Pythagoras is the namesake of the Western system; "Chaldean" is named for ancient Babylon). It is **not** part of mathematics.
3. The core numbers 1–9 and the **master numbers 11, 22, (33)**
4. **The Life Path number** — from the birth date. Reduce month, day, and year separately, sum, then reduce to a single digit (keeping 11/22/33). *Key fact: the Life Path is **identical in both Pythagorean and Chaldean systems** because it's date-derived.*
5. Name-based numbers: **Expression/Destiny** (all letters), **Soul Urge** (vowels), **Personality** (consonants)
6. **The two systems:**
   - **Pythagorean** — letters numbered **1–9 in sequence** (A=1, B=2 … I=9, J=1…). Most common in the West.
   - **Chaldean** — values assigned by **sound/vibration, 1–8 only** (9 is "sacred," not assigned to letters); the mapping is **not** sequential (e.g., F=8, G=3, H=5) and must be looked up.
   - *The systems agree on date-derived numbers (Life Path, Personal Year) and diverge on **name-derived** numbers.*
7. Personal Year/Month/Day cycles
8. Putting a full profile together

**EVIDENCE:** No scientific support; a symbolic/reflective system. The same Forer-effect caveat applies.

---

### 2.4 Crystals & Gemstones
*Course — Crystals: Tradition & Truth*

**Module 1 — What a crystal actually is (real geology):** mineral vs rock vs crystal; the 7 crystal systems; **Mohs hardness** (1 talc → 10 diamond); how crystals form.
**Module 2 — History of crystal beliefs:** ancient ornamental/amuletic use (real) vs healing claims (20th-c. New Age); **birthstones standardized by U.S. jewelers in 1912** (marketing, not ancient law).
**Module 3 — Field guide:** quartz family + popular stones, each with **real mineralogy + traditional association**.
**Module 4 — Practices:** cleansing/charging/"programming" (tradition) with science overlay (water dissolves selenite; sunlight fades amethyst/rose quartz; salt scratches soft stones).
**Module 5 — Buying wisely:** fakes, dyes, misleading names.
**Module 6 — Safety (featured).**
**Module 7 — Evidence & honest practice.**

**Headline facts (great quiz items):**
- Amethyst, citrine, rose quartz, smoky quartz are **all the same mineral — quartz (SiO₂)**; color comes from trace impurities/irradiation, not different "energies."
- **~95% of "citrine" sold is heat-treated amethyst.**
- **Obsidian is volcanic glass — amorphous, not a crystal at all.**
- **Selenite is gypsum (Mohs 2) and dissolves in water.**

**EVIDENCE:** Crystal healing is a **pseudoscience** — no evidence crystals emit healing energy or treat disease. The widely-cited **French et al. (1999/2001) study** (80 people; real quartz vs fake) found people reported the same "energy" sensations from fake crystals — the effect is **suggestion/placebo**. (Note honestly: it was conference-presented, not peer-reviewed-published; cite as illustrative.) The **placebo effect is real** and can genuinely aid relaxation — so crystals can serve as **ritual/mindfulness anchors** with no medical claims.

**SAFETY (featured — toxic minerals):** Never grind, lick, inhale dust from, or make "elixirs/gem water" out of toxic stones: **cinnabar (mercury), galena (lead), realgar/orpiment (arsenic), stibnite (antimony), malachite (raw, copper), torbernite/autunite (uranium — radioactive).** For "crystal water," use the **indirect method** (stone sealed in a separate vessel) or stick to inert clear quartz. Wash hands; keep specimens from children.

**CULTURAL:** "Smudging" with white sage/palo santo is rooted in **Indigenous North American** ceremony (over-harvesting + appropriation concerns) — present respectfully, offer alternatives (incense, sound).

---

### 2.5 Chakras & the subtle body
*Course — Chakras: Origins & Practice*

**Module 1 — Real origins (history corrective):** the subtle-body model (**nadis** channels, **prana**, **kundalini**) comes from **Indian tantric/yogic traditions**. Earliest hints in the **Upanishads** (mid-1st-millennium BCE); developed in tantric texts ~8th–16th c. CE. **Key fact:** the foundational text **_Ṣaṭ-cakra-nirūpaṇa_ (1577)** describes **six** centers ("ṣaṭ" = six); classical systems used **varying** numbers of chakras.
**Module 2 — The Western seven-chakra map:** the familiar **7-chakra rainbow** version is a **modern synthesis** — **Sir John Woodroffe (_The Serpent Power_, 1919)** + **Theosophy (C. W. Leadbeater, _The Chakras_, 1927)** fixed the rainbow colors and gland/plexus associations **not** in the original texts. One lesson per chakra (table below).
**Module 3 — Subtle body in depth:** ida/pingala/sushumna nadis, kundalini.
**Module 4 — Balancing practices:** pranayama (breath), meditation/visualization, bija mantra, asana, sound — framed by their **real** benefits (relaxation, focus).
**Module 5 — Western-psychology synthesis:** **Anodea Judith** (*Wheels of Life* 1987; *Eastern Body, Western Mind* 1996) — Jungian/developmental overlay (where most "chakra = psychological theme" language comes from).
**Module 6 — Evidence.** **Module 7 — Respect & appropriation.**

| # | Sanskrit | Location | Color | Element | Bija | Themes |
|---|---|---|---|---|---|---|
|1|Muladhara (Root)|Base of spine|Red|Earth|LAM|Safety, grounding|
|2|Svadhisthana (Sacral)|Lower abdomen|Orange|Water|VAM|Emotion, creativity|
|3|Manipura (Solar plexus)|Navel|Yellow|Fire|RAM|Will, confidence|
|4|Anahata (Heart)|Chest|Green|Air|YAM|Love, compassion|
|5|Vishuddha (Throat)|Throat|Blue|Ether|HAM|Communication, truth|
|6|Ajna (Third eye)|Brow|Indigo|Light|OM|Intuition|
|7|Sahasrara (Crown)|Top of head|Violet/white|Consciousness|silence/OM|Spiritual connection|

**EVIDENCE:** No scientific evidence chakras exist as physical/energetic structures or can be measured. The plexus/gland overlap is **metaphor**, not proof. Real benefits come from **breathwork, meditation, body awareness** — well-studied for stress/emotion. No medical claims.

**CULTURAL (featured):** a living sacred tradition of **Hindu/Buddhist tantra**. Credit origins explicitly, separate classical tradition from Western synthesis, use Sanskrit respectfully, avoid costume-style imagery, and never frame "chakra balancing" as medical treatment. Note rare distress from intense kundalini/breathwork — go gently; not a substitute for care.

---

### 2.6 Herbalism
*Course — Herbalism: Tradition, Evidence & Safety* **(safety-critical)**

**Module 1 — What herbalism is:** folk/traditional use; the **regulatory reality** — in the US, supplements are **not FDA-approved for safety/efficacy** and are not standardized dose-to-dose.
**Module 2 — Preparations:** teas/infusions, decoctions, tinctures, salves — basics and hygiene.
**Module 3 — Common herbs (tradition vs evidence):** e.g., **ginger** (nausea — some evidence), **peppermint** (IBS — some evidence), **chamomile/valerian** (sleep/calm — mixed/modest evidence), **turmeric/curcumin** (anti-inflammatory — bioavailability caveats), **echinacea** (colds — weak/mixed), **ginkgo** (memory — not supported for prevention), **St John's wort** (mild-moderate depression — *some* evidence **but** major interactions — see safety).
**Module 4 — Safety (featured, see below).**
**Module 5 — Sourcing, sustainability, and "magical"/folk correspondences** (taught as tradition, clearly separated from medicinal claims).

**EVIDENCE:** Mixed by herb. Some have genuine clinical support (ginger, peppermint, senna, etc.); many traditional uses are unproven. Always lead with the actual evidence per herb and avoid blanket "natural = safe/effective."

**SAFETY (featured — must be prominent):**
- **Herb–drug interactions.** **St John's wort** is a potent **CYP3A4 / P-glycoprotein inducer** — it can **reduce the effectiveness of many drugs**, including **hormonal birth control** (breakthrough bleeding / contraceptive failure), **anticoagulants, immunosuppressants, HIV and cancer drugs, and many others**, and combined with **SSRIs/antidepressants can cause serotonin syndrome.** **Ginkgo, garlic, ginger, and high-dose fish oil** can increase **bleeding risk** with anticoagulants. **Grapefruit** inhibits CYP3A4 and raises levels of many drugs.
- **Pregnancy & breastfeeding.** Avoid **emmenagogue/abortifacient and uterine-stimulant herbs** (e.g., **blue cohosh, black cohosh, pennyroyal, mugwort, rue, tansy, wormwood, high-dose parsley/sage**). Note the dose distinction: culinary amounts of common herbs are generally fine; concentrated/medicinal doses are the risk.
- **"Not a substitute for medical care."** Always tell users to consult a clinician/pharmacist before combining herbs with medication, in pregnancy/breastfeeding, or for any medical condition.

---

### 2.7 Essential oils / Aromatherapy
*Course — Essential Oils: Safe & Effective Use* **(safety-critical)**

**Module 1 — What essential oils are:** concentrated volatile plant extracts; extraction (distillation, cold-press).
**Module 2 — Carriers & dilution (safety core):** never apply most oils undiluted; typical **dilution 1–3% for adults** (≈ **6 drops/oz at 1%**), **lower (≤0.5–1%) for children, elderly, sensitive skin**; do a patch test.
**Module 3 — Methods:** diffusion (ventilation, time limits), topical (diluted), and **why ingestion is discouraged** without expert supervision.
**Module 4 — Common oils (tradition vs evidence):** **lavender** (relaxation/sleep — modest evidence), **peppermint** (alertness, tension headache — some evidence), **tea tree** (topical antimicrobial — some evidence; **never ingest**), **eucalyptus**, **citrus** (mood).
**Module 5 — Safety (featured, see below).**

**EVIDENCE:** Aromatherapy shows **modest, mostly short-term** effects on mood, relaxation, and some symptoms (e.g., lavender for anxiety/sleep, peppermint for tension headache). It is **not** a treatment for disease.

**SAFETY (featured — must be prominent):**
- **Phototoxicity.** **Cold-pressed citrus oils** contain furanocoumarins that **burn skin under UV/sun**. Tisserand max dermal limits (then avoid sun ~12–18h): **bergamot ~0.4%**, **cold-pressed lime ~0.7%**, **lemon ~2%**, **grapefruit ~4%**. Steam-distilled citrus is essentially non-phototoxic. Effects of multiple citrus oils **add up**.
- **Skin sensitization:** never apply undiluted; oxidized citrus/pine oils sensitize; patch-test.
- **Never ingest** without qualified guidance; keep away from eyes/mucous membranes.
- **Pets (featured).** Many oils are **toxic to cats** (cats lack key liver enzymes) and risky for dogs: **tea tree (melaleuca), wintergreen, peppermint, citrus/d-limonene, pine, eucalyptus, clove, cinnamon, ylang-ylang, pennyroyal**. Diffusing can harm cats; **never apply to pets.** Signs: drooling, vomiting, tremors, difficulty breathing, lethargy → vet immediately (ASPCA / Pet Poison Helpline).
- **Pregnancy/children/asthma:** extra caution; some oils contraindicated.
- **"Not a substitute for medical care."**

---

### 2.8 Almanac & Lunar Living
*Course — Reading the Sky & Living by the Almanac*

1. **Moon phases (real astronomy):** why phases happen (Moon's position relative to Sun/Earth), the ~29.5-day synodic month; the 8 phases (new, waxing crescent, first quarter, waxing gibbous, full, waning gibbous, last quarter, waning crescent)
2. **Phase meanings (tradition):** new = intention/begin; waxing = build; full = culmination/release; waning = let go/rest
3. **Eclipses & nodes (real astronomy + tradition):** why solar/lunar eclipses happen; why they're culturally "big"
4. **The Wheel of the Year:** solstices, equinoxes (what an equinox actually is), and the cross-quarter days
5. **Planetary days of the week** (Sun→Sunday, Moon→Monday, etc.) and **planetary hours** (Chaldean order) — tradition
6. **Gardening by the Moon:** the tradition (plant by phase/sign) **and the evidence**
7. Building a personal almanac/ritual rhythm

**EVIDENCE:** The **astronomy is real and exact** (phases, eclipses, equinoxes, tides). The **tradition's predictive claims are not supported**: controlled reviews (e.g., American Society of Agronomy / *Agronomy* 2020) find **no reliable evidence** that lunar phase affects plant growth beyond the Moon's real effect on tides; moonlight is 100–1,000× dimmer than sunlight. Teach lunar living as **a meaningful rhythm and ritual structure**, not a mechanism — pair every folklore claim with the real astronomy.

---

## 3. What you may be missing — recommended additions

Ranked by fit with Mapped and value to a comprehensive library. Top picks fold cleanly into the outline now; the rest are "future tracks."

**Strongly recommended (add to v1 outline):**
1. **Meditation & Breathwork** — the single most evidence-backed wellness practice (real effects on stress, attention, mood). It's the honest "this actually works" anchor of the whole library and already lives in your rituals. *Safety note: intense breathwork cautions (pregnancy, cardiovascular, dissociation).*
2. **Dream interpretation / dream journaling** — pairs with your journal feature; teach both the symbolic tradition and the real sleep science (REM, why we dream). Low risk, high engagement.
3. **Runes (Elder Futhark)** — a clean, finite divination/symbol system (24 runes) with rich history; structurally similar to tarot, easy to make a tidy course. *Cultural note: acknowledge Norse origins and disavow the historical misuse of certain runes by hate groups.*

**Recommended (future tracks):**
4. **Manifestation / intention-setting** — popular and ties to new-moon rituals; teach evidence-forward (goal-setting, behavioral activation work; "law of attraction" as belief, not physics) and **flag the harm of toxic positivity / "you caused your illness" framing**.
5. **Feng Shui** — spatial harmony tradition; broadly benign; credit Chinese origins.
6. **I Ching** — ancient Chinese divination/philosophy; deep but complex; credit origins.
7. **Sound healing** (singing bowls) and **color/aura** — short tradition-forward modules; modest/again-placebo evidence.

**Include with care / flag:**
8. **Palmistry** — you already have a palmistry tab, so a short course fits; evidence-forward (no predictive validity).
9. **Ayurveda** — a **full traditional medical system** with real cultural depth; teach as culture/history, **not** medical advice, with strong safety framing (some traditional remedies contain heavy metals).
10. **Astrology sub-specialties** (horary, electional, **medical astrology**) — advanced electives; **medical astrology must carry a hard "not medical advice / see a doctor" guardrail.**

**Avoid presenting as fact / extra caution:** anything implying a health claim (Reiki/energy healing as treatment, crystal/essential-oil "cures," medical astrology diagnoses). Keep these as *tradition* with explicit disclaimers, or omit.

---

## 4. Cross-cutting standards for every lesson

- **Lead with evidence**, then teach tradition in depth. Never bury the science.
- **Safety callouts are non-optional** for herbs, oils, and toxic minerals — surface them prominently, not in fine print.
- **Credit cultural origins** (Hindu/Buddhist tantra for chakras; Indigenous for smudging; Norse for runes; Chinese for feng shui/I Ching; Vedic for Jyotish) and avoid appropriative framing.
- **No medical, legal, or financial claims.** Every health-adjacent course carries a "not a substitute for professional care" line, matching the app's existing honest-framing pattern.
- **Quiz answers must be unambiguous and defensible** — anchor questions to facts (history, structure, safety, definitions), not to contested interpretive claims.

---

## 5. Key sources

**Learning science:** ATD (microlearning); Roediger & Karpicke 2006 (testing effect); Karpicke & Roediger 2008 (spacing); Bloom's taxonomy (objectives); mastery-learning review (PMC10159400); MOOC completion + gamification/Self-Determination Theory meta-analyses; CEU/certificate standards (UMN, Red Cross).
**Crystals/chakras:** Wikipedia (Quartz, Crystal healing, Chakra); Science-Based Medicine; French et al. placebo study; Theosophical Society "The Rainbow Body"; Hareesh.org "real story on the chakras"; Anodea Judith.
**Astrology:** Carlson, *Nature* 1985 ("A double-blind test of astrology"); Ertel 2009 reanalysis; Forer/Barnum effect.
**Herbs/oils safety:** NCCIH (St John's wort; herb–drug interactions); British Journal of Pharmacology 2020 (SJW interactions); Tisserand Institute (phototoxicity, dilution); ASPCA / Pet Poison Helpline / VCA (oils toxic to pets); American Pregnancy Association (pregnancy herbs).
**Lunar:** *Agronomy* 2020 (MDPI) and American Society of Agronomy (no evidence for lunar planting); standard astronomy.
**Tarot/numerology:** standard reference on tarot history (15th-c. Italian origin; RWS 1909); Pythagorean vs Chaldean system references.

*(Full URL list retained in research notes; can be appended on request.)*
