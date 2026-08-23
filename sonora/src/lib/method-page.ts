/**
 * The expanded stage copy used on /method. 150–200 words each. The homepage
 * uses the short form in method.ts; this is the long form.
 */
export const STAGE_DETAIL = [
  {
    number: '01',
    name: 'Listen',
    paragraphs: [
      'The first stage finds out what is actually being asked, and who currently gets to answer it.',
      'That means the real query set, in the words your buyers use rather than the words your category page uses. It comes out of sales calls, support tickets, churn interviews, and the questions your team fields so often they have stopped noticing them. Those questions are usually the most valuable thing in the building, and almost nobody has written them down.',
      'It also means a baseline. A fixed set of prompts goes to the major assistants and the results get recorded: whether you appear, in what position, described how, and which sources the answer was assembled from. That last part carries the most weight. Models cite what they trust, the list of what they trust is short and specific, and most of it is not your website.',
      'The stage ends when you know the questions and you know who owns them today.',
    ],
  },
  {
    number: '02',
    name: 'Locate',
    paragraphs: [
      'The second stage decides which position you can plausibly own within a year.',
      'Plausibly is doing real work in that sentence. Most positioning exercises pick the position the company wants. This one picks the position the company can hold, given who is already there, which surfaces the answers come from, and how much time you actually have.',
      'Sometimes the position exists and nobody has claimed it. That is the easy case, and rarer than you would hope. Sometimes it does not exist yet, and the work is naming it, which is slower and more expensive than occupying something already named. Occasionally it is still the only honest option, because the existing category actively misdescribes what you do.',
      'The output is a sentence you can defend under pressure and a specific set of questions you intend to own. Everything in the next two stages is sequenced against that sentence.',
    ],
  },
  {
    number: '03',
    name: 'Saturate',
    paragraphs: [
      'The third stage gets you into every surface where the question gets asked.',
      'Owned content is the smallest part of this. It is the part most teams start with, because it is the part they control, and controlling a channel is not the same as being found through it.',
      'The larger part is infrastructure and third parties. Infrastructure means whether a model can read you at all: content in the served HTML, semantic markup, structured data that matches what is on the page, nothing material hidden behind a click or injected by a script. A site that needs JavaScript to reveal its own paragraphs is invisible to much of what now decides whether you exist.',
      'Third parties means the sources models actually pull from. Comparison sites, review platforms, community threads, documentation, trade publications, directories nobody thinks about. Your presence there is a bigger input to what a model says about you than your blog is.',
      'The output is a roadmap, sequenced by impact rather than by what is easiest to start.',
    ],
  },
  {
    number: '04',
    name: 'Sustain',
    paragraphs: [
      'The fourth stage measures whether any of it worked, on a basis that holds still.',
      'Measurement in AI search is unreliable for a boring reason: the basis moves. Ask a different question, phrase it differently, ask it a week later, and the answer changes. Most reporting in this space compares numbers that were never comparable in the first place.',
      'The fix is to fix the basis. A locked prompt set, written down and unchanged quarter to quarter. A named competitor list. A set cadence. Then share of voice — the proportion of answers to that prompt set in which you appear at all — followed by citation position, sentiment, and which sources drove each result.',
      'Fixed is the operative word. A number that is not comparable quarter over quarter is not a number. It is a mood, and it will not survive the first question from your board.',
    ],
  },
] as const;
