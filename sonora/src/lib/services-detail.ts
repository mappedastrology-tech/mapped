/**
 * Full service copy for /services. The short one-liners on the homepage live
 * in site.ts; these are the expanded versions.
 *
 * No prices, no rates, no packages. That is deliberate and it is not an
 * oversight to be corrected later without asking.
 */
export const SERVICE_DETAIL = [
  {
    slug: 'visibility-audit',
    name: 'Visibility Audit',
    body: 'Where you stand right now in AI answers and traditional search, and what to do about it in what order. Covers the real query set your buyers use, an AI share-of-voice baseline against named competitors, a technical teardown of whether models can read your site at all, and the citation sources you are missing.',
    includes: [
      'Query set and search intent map',
      'AI visibility baseline vs. named competitors',
      'Technical AEO findings, prioritised by impact',
      'Category positioning assessment',
      'Sequenced roadmap',
    ],
    bestWhen:
      'You suspect you are invisible in AI answers and want to know how bad it is before committing to a plan.',
  },
  {
    slug: 'fractional-head-of-content',
    name: 'Fractional Head of Content',
    body: 'Content leadership without the hire. I own the strategy, the editorial standard, the measurement, and the vendors. Your team or your freelancers execute; I decide what gets made and hold the line on whether it is good enough.',
    includes: [
      'Content and category strategy',
      'Editorial standards and review',
      'Quarterly measurement against a fixed prompt set',
      'Agency and freelancer management',
      'Alignment with sales and demand gen',
    ],
    bestWhen:
      'You need senior content direction but not a full-time salary, or you have people producing work with nobody setting the direction.',
  },
  {
    slug: 'ai-visibility-monitoring',
    name: 'AI Visibility Monitoring',
    body: 'Ongoing measurement of how you appear in AI answers, on a fixed prompt set, against named competitors, on a set cadence. Most AI visibility reporting is unreliable because the measurement basis moves. This does not.',
    includes: [
      'Locked prompt set',
      'Quarterly share-of-voice and citation position',
      'Competitive citation mapping',
      'Sentiment tracking',
      'A report you can put in front of a board',
    ],
    bestWhen:
      'Someone is going to ask whether the content is working and you need an answer that holds up.',
  },
  {
    slug: 'original-research-programs',
    name: 'Original Research Programs',
    body: 'The most reliable way to get cited is to be the source. I design the research, direct the analysis, shape the story, and manage production. Surveys, analysis of data you already have, or a recurring index that gives PR a news hook four times a year.',
    includes: [
      'Research design and question framing',
      'Survey instrument and sourcing strategy',
      'Analysis direction and narrative',
      'Production management',
      'Distribution and derivative content plan',
    ],
    bestWhen:
      'Your category has no authoritative data and you would rather create it than cite someone else’s.',
  },
  {
    slug: 'roadmap-execution-management',
    name: 'Roadmap Execution Management',
    body: 'The audit produces a roadmap. Most roadmaps do not get executed because nobody translates them into work an engineering team will actually prioritise. I write the tickets, brief the team, review what ships, and verify it did what it was supposed to.',
    includes: [
      'Roadmap translated into scoped tickets',
      'Technical briefing for your engineers',
      'Implementation review',
      'Verification against the original baseline',
    ],
    bestWhen: 'You have the plan and the dev capacity but no one who can bridge them.',
    note: 'This requires your team’s development capacity. It is oversight, not implementation.',
  },
] as const;
