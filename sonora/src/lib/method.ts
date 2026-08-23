/**
 * The four stages. The homepage renders the short form; /method renders the
 * expanded form. Both read from here so they can never drift apart.
 */
export const STAGES = [
  {
    number: '01',
    name: 'Listen',
    short:
      'Find out what’s actually being asked and who currently gets the answer. The real query set, in your buyers’ words. A baseline of how you show up in AI answers today, and which sources those citations come from.',
  },
  {
    number: '02',
    name: 'Locate',
    short:
      'Find the position you can plausibly own within a year. Sometimes it exists and nobody’s claimed it. Sometimes it doesn’t exist yet and the work is naming it.',
  },
  {
    number: '03',
    name: 'Saturate',
    short:
      'Get into every surface where that question gets asked. Owned content is the smallest part. The larger part is the infrastructure that determines whether a model can read you at all, and the third-party sources it actually pulls from.',
  },
  {
    number: '04',
    name: 'Sustain',
    short:
      'Measure against a fixed prompt set, on a fixed cadence, against named competitors. Fixed is the operative word. A number that isn’t comparable quarter over quarter isn’t a number.',
  },
] as const;
