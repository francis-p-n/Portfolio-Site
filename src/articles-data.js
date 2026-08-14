/* ============================================================
   ARTICLES — static content, no database.
   Add a new post by appending an object to the array below.
   Newest first is not required; the list is sorted by `date`.

   id          slug used for the article window (keep it URL-safe)
   date        ISO date, drives the sort order and the byline
   highlight   the one post featured at the top of the window
   body        markdown — parsed at open time
   ============================================================ */
export const ARTICLES = [
  {
    id: 'before-you-speak',
    title: 'Before You Speak',
    date: '2026-08-03',
    description: 'Words carry the weight of life and death, and the pause before speaking is not hesitation but the discipline in which wisdom and grace are formed.',
    tags: ['Reflection', 'Faith'],
    img: '',
    highlight: true,
    body: `Words are powerful. One word from a bad boss can set your career back by years. One good recommendation can skyrocket your chances in anything. Words have the power to make or break someone's life.

"Death and life are in the power of the tongue," says King Solomon. He knew the weight of words. They can build someone up, or tear them down.

Careless words can damage people, even when it's unintended. They have consequences. A comment can spiral into harm. A joke can lead to someone's insecurity. Any off-hand remark can trickle down through the passage of time. Every word spoken bears weight to someone, even when we don't mean it.

This is where pausing before speaking becomes a necessity. We understand that the power of the tongue can cause death or life. Before you speak, choose whether you want to build someone up, or tear them down; speak life or speak death. This pause is where wisdom lies after all (cf. James 1:19). It widens the gap between careful thought and rash impulse.

There's a simple framework found in Ephesians 4:29 to guide us:
Are my words uplifting, kind, true, at the right time, and does it give grace? This framework guides us to speak life, to edify and encourage one another, even when feedback is necessary. It guides us to speak truth in love. To speak intentionally, especially when it matters.

**Reflection Question:**
Do I take the time to think before speaking?`,
  },

  /* TODO(Francis): these two were only ever descriptions in the old Supabase
     migration — no draft body was written. Paste the markdown into `body` and
     delete `draft: true` to publish them. */
  {
    id: 'preparation-execution',
    title: '80% Preparation, 20% Execution',
    date: '2026-08-03',
    description: 'Most people invert this ratio and call the resulting scramble talent; execution fails precisely where preparation was rationed, not where effort ran short.',
    tags: ['Craft'],
    img: '',
    draft: true,
    body: ``,
  },
  {
    id: 'pentecost-a-modern-reality',
    title: 'Pentecost: A Modern Reality',
    date: '2026-08-03',
    description: 'Pentecost is not an event the Church commemorates but one it still inhabits: the same Spirit commissioning ordinary people into work they did not choose.',
    tags: ['Faith'],
    img: '',
    draft: true,
    body: ``,
  },
];

/* Drafts never reach the UI — one place to enforce it. */
export const PUBLISHED = ARTICLES
  .filter(a => !a.draft && a.body.trim())
  .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
