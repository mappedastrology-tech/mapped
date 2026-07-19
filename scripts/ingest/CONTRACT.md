# Ingestion Contract — Mapped knowledge base

You are distilling a source book into structured knowledge for the "Mapped" astrology app.
It powers (1) **Dolly**, an AI guide who talks warmly to users about their chart and life, and
(2) a **learning library** encyclopedia. Read your assigned extracted text file(s) and produce
two JSON output files.

## Hard rules
1. **DISTILL — never copy verbatim.** Rewrite every idea in your own clear, warm, plain words.
   Do NOT reproduce sentences or paragraphs from the source, especially for in-copyright books.
   You are capturing *knowledge and tradition*, not the author's text.
2. **Attribute.** Every passage records which source and author it came from (fields below).
3. **Stay useful to the app.** Favor content a user would ask Dolly about or look up:
   sign/planet/house/aspect meanings, techniques, timing, symbolism, correspondences,
   rituals, remedies, history, and interpretation guidance. Skip front-matter, indexes,
   dedications, ads, and publisher boilerplate.
4. **Neutral on contested claims.** Present astrological/esoteric/folk claims as *tradition*,
   not fact ("In this tradition…", "classically associated with…"). Never give medical,
   legal, or financial advice; add a `safety` note where a reader might misuse something
   (e.g. herbs, stones as cures).
5. **Voice:** clear, grounded, kind, plain-English. No purple prose, no hedging filler.

## Navigating large files
If your text file is very large, DON'T read it top to bottom. Use `grep -n` on the file to find
sections (e.g. sign names, planet names, "nakshatra", "aspect", chapter headings), then Read those
line ranges. Sample broadly across the whole book so coverage is even.

## Output file 1 — PASSAGES (feeds Dolly's searchable KB)
Write a JSON array to the passages path you are given. Each element:
```json
{
  "domain": "<assigned domain string>",
  "topic": "Mars in Scorpio",              // short subject label
  "title": "Mars in Scorpio",              // human title (can equal topic)
  "body": "Distilled 40–110 word explanation in Mapped's voice.",
  "summary": "One-line gist (<=140 chars).",
  "keywords": ["mars","scorpio","desire","intensity"],   // lowercase search terms
  "entities": ["Mars","Scorpio"],          // canonical proper nouns: planets, signs, House 1..12, stone/herb names
  "source_title": "The Only Astrology Book You'll Ever Need",
  "source_author": "Joanna Martine Woolfolk",
  "source_year": 2006,
  "public_domain": false
}
```
Target the passage count given in your assignment. Each `body` must be self-contained (a reader
sees it with no other context). Canonicalize entities: signs Title-case ("Scorpio"), planets
Title-case ("Mars","North Node"), houses as "House 5", stones/herbs Title-case singular.

## Output file 2 — REFERENCE (encyclopedia entries for the learning library)
Write a JSON array to the reference path you are given. Each element:
```json
{
  "domain": "astrology",   // MUST be one of: astrology, tarot, numerology, crystals, chakras,
                           // herbalism, essential-oils, almanac, meditation, dreams, runes
  "name": "Amethyst",
  "aka": ["Bishop's Stone"],          // optional
  "category": "Quartz / violet",      // optional short grouping
  "summary": "1–2 sentence plain overview.",
  "fields": [                          // 2–6 labelled facts
    {"label": "Tradition", "value": "…"},
    {"label": "Associations", "value": "…"},
    {"label": "History", "value": "…"}
  ],
  "safety": "Optional caution if relevant.",
  "tags": ["quartz","calming","crown-chakra"]
}
```
Produce the reference count given in your assignment (fewer, higher-quality entries are fine).
If your assignment says "passages only", write `[]` to the reference file.

## When done
Return a short summary: how many passages and reference entries you wrote, which topics you
covered, and any gaps. Do not paste the JSON back — just write the files.
