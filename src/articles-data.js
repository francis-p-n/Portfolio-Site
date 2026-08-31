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
    body: `Words are powerful. One word from a bad boss can set your career back by years. One good recommendation can skyrocket your chances in anything. Words have the power to make or break someone's life.

"Death and life are in the power of the tongue," says King Solomon. He knew the weight of words. They can build someone up, or tear them down.

Careless words can damage people, even when it's unintended. They have consequences. A comment can spiral into harm. A joke can lead to someone's insecurity. Any off-hand remark can trickle down through the passage of time. Every word spoken bears weight to someone, even when we don't mean it.

This is where pausing before speaking becomes a necessity. We understand that the power of the tongue can cause death or life. Before you speak, choose whether you want to build someone up, or tear them down; speak life or speak death. This pause is where wisdom lies after all (cf. James 1:19). It widens the gap between careful thought and rash impulse.

There's a simple framework found in Ephesians 4:29 to guide us:
Are my words uplifting, kind, true, at the right time, and does it give grace? This framework guides us to speak life, to edify and encourage one another, even when feedback is necessary. It guides us to speak truth in love. To speak intentionally, especially when it matters.

**Reflection Question:**
Do I take the time to think before speaking?`,
  },

  {
    id: 'lost-in-translation',
    title: 'Lost in Translation',
    date: '2026-09-01',
    description: 'A congregation goes quiet when the Latin comes around, and the reason is not difficulty but comfort — and a comfort nobody questions is one nobody explains either.',
    tags: ['Reflection', 'Faith'],
    img: '',
    highlight: true,
    body: `### A Reflection on Latin, and What We Traded It For

I was at a Mass a few weeks back where most of the Mass parts were sung in Latin, the Kyrie, the Gloria, the Sanctus, the Pater Noster, and most people just stopped singing when it came around. Not really out of reverence, more because they didn't know what to do with it. Even the choir was struggling through it, and it wasn't for lack of the words, they had it all up on the slide with the music and everything, I think it was that they were doing it because they had to and not because they wanted to, you could kind of hear that in it.

Rather, I don't think that's where the root of the friction is. **Latin isn't particularly hard in itself, it's more that people aren't always the most interested in getting out of their comfort zones.** English or Malay or Mandarin or whatever your language is, that's your comfort zone, and Latin was always going to sit outside of it. So when the Church said you don't have to use Latin anymore, a lot of people heard that as permission to just stay where they were comfortable, instead of a chance to keep reaching a bit further. **That's the actual issue underneath all of this, that we'd rather stay somewhere comfortable than step out of it for something bigger than ourselves.** That's how something gets lost over time, not in one big decision but in a bunch of small moments like that one, over and over, until nobody expects anyone to carry it anymore.

Most of us just assume Vatican II is the reason Latin disappeared, that's the story you pick up without really trying to, Latin was the old way, the Council modernised the Church out of it, and Malay or English or Mandarin took over because that's what renewal was supposed to look like. I believed some version of that too for a while.

But that's not actually what the document says. Sacrosanctum Concilium says pretty plainly that Latin is to be preserved in the Latin rite, and vernacular was allowed as something added on top, decided by local Church authority, not handed down as a replacement for it. It even says that where vernacular is used, people should still be able to say or sing the Latin parts that belong to them. Gregorian chant is given what the document calls pride of place.

So something got lost between what the Council actually asked for and the parish I was sitting in that Sunday.

Latin doesn't drift the way our living languages do, nobody's out there reshaping what it means day to day, the way English or Malay quietly shifts every decade. That stillness isn't magic and it's not a doctrine on its own, but it's mattered before. When the words of the Eucharistic Prayer got translated as "for all" instead of the more accurate "for many," that wasn't a small wording choice, it touched what the Church was actually saying about the scope of Christ's sacrifice. **A stable Latin text underneath all the translations guards against that kind of slow slippage.**

And Catholic is supposed to mean universal, that's meant to be something you can actually hear, not just something we say. A Mass in KL and a Mass in Rome are supposed to be recognisably the same rite. Every time the vernacular fully replaces the Latin Ordinary instead of sitting next to it, we lose a bit of that. In Malaysia especially, where one parish weekend runs through Malay, English, Mandarin and Tamil Masses, we're not even holding onto that unity within our own parish, let alone across the world.

I don't think it's really cowardice on our part though, even though I was tempted to call it that earlier on. Malaysia is genuinely a hard place to ask this of. Our languages don't share Latin's family the way French or Italian do, Tamil, Mandarin, Malay are all reaching a lot further just to meet Latin halfway than a European congregation ever had to. That friction is real, and I think it just makes the comfort zone thing worse, not separate from it. It's one thing to stay comfortable when the reach isn't that far, it's another thing entirely when the reach is this far and nobody's even told you why you'd bother.

But I think that same comfort zone is also what created the knowledge gap in the first place, and it's the kind of thing that just carries down the line without anyone really deciding it should. Say you grew up right after the Council, you've now got the option to just go with English, so you do. Your kids go to Sunday school not learning Latin, because you're not teaching it to them, why would you, it's not like you use it either. Then their kids come along and ask why Latin's even a thing, and nobody around them really knows how to answer that, because nobody in that whole chain ever stepped outside the comfort zone long enough to see what was out there and pass it down. It's not any one generation's fault exactly, it's just that **comfort doesn't need to explain itself, so it never does, and the gap just gets handed down along with everything else.** What's actually missing isn't willpower on its own, it's that nobody explained to our generation why the distance was worth closing in the first place, because nobody needed to while everyone stayed where it was easy. We inherited the silence during the Latin parts without inheriting the reason those parts were in Latin to begin with. And this doesn't fix itself in one jump either, it can't, it has to start early, actually catechizing kids on it, because if we don't they just grow up not knowing it was ever a thing to know. That's not disinterest on its own, it's a knowledge gap that comfort let grow, you can't expect someone to care about something they don't even know exists.

There's actually something in the numbers that backs this up. A survey of younger Latin Mass goers in the US found most of them weren't raised into it, only a small number had parents who led them there, most came to it on their own out of curiosity or reverence. Which tells me the younger generation isn't necessarily less interested in the older forms of the faith, if anything some of them are actively looking for it. Part of what's going on, I think, is just that same chain playing out, the generation who inherited Latin's decline, who grew up in the post-Council years without it, are the ones running things now, and it's hard to hand down an appetite for something you were never really given a reason to want yourself.

That's what I want to get at, not a call to drop Malay or English from the Mass, but a case for why the Ordinary, sung the way the Council actually asked for, is worth the effort of learning. Not because it's old, but because it's still ours whether we use it or not, part of a line running back through every Mass that's ever been said in the Latin rite, still holding the same words at the center of it.

**The meaning never changed, just the language. Maybe it's worth learning Latin again.**`,
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
