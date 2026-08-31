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

  {
    id: 'lost-in-translation',
    title: 'Lost in Translation',
    date: '2026-09-01',
    description: 'Latin did not leave the Mass by decree but by drift, and what we traded away was a stable text and an audible sign that the Church is one.',
    tags: ['Reflection', 'Faith'],
    img: '',
    body: `### A Reflection on Latin, and What We Traded It For

I was at a Mass a few weeks back where part of the Sanctus was sung in Latin, and I noticed something I hadn't really paid attention to before. When the Latin came around, most people just stopped singing. Not really out of reverence, I think, more because they didn't know what to do with it. And it wasn't just the congregation, even the choir was struggling through it.

I think that's actually the more telling detail. It wasn't that the choir forgot the words, it was that they were doing it because they had to, not because they wanted to. You could hear it. And I think that's really where the friction comes from, not that Latin is hard exactly, but that when people aren't actually interested in going back to it, and they're confused on top of that, it just never sticks. That's how something like this gets lost over time, not in one big decision but in a lot of small moments like that one.

Makes you wonder when we stopped expecting our own people to actually carry the language of their own worship.

I think most of us, myself included for a while, just assume Vatican II is the reason Latin disappeared. That's the story you pick up without really trying to, Latin was the old way, the Council modernised the Church out of it, and Malay or English or Mandarin took over because that's what renewal was supposed to look like.

But that's actually not what the document says. Sacrosanctum Concilium, the Vatican II text on the liturgy, says pretty plainly that Latin is to be preserved in the Latin rite. Vernacular was allowed as something added on, decided by the local Church authority, not handed down as a replacement for it. It even says that where vernacular is used, people should still be able to say or sing the Latin parts that belong to them. And Gregorian chant, which is basically Latin's musical home, is given what the document calls pride of place.

So somewhere between what the Council actually asked for and the parish I was sitting in that Sunday, something got lost that wasn't supposed to go.

I think there are two separate reasons this actually matters, and I want to keep them apart rather than lump them into one vague point about tradition.

The first is that Latin doesn't really drift the way our living languages do. Nobody's out there reshaping what it means day to day, the way English or Malay quietly shifts every decade or so. That stillness isn't magic and it's not a doctrine on its own, but it has actually mattered before. When the words of the Eucharistic Prayer were translated as "for all" instead of the more accurate "for many," it wasn't just a small wording choice, it touched what the Church was actually saying about the scope of Christ's sacrifice. Having one stable Latin text underneath all the translations is one way of guarding against that kind of slow slippage.

The second is that Catholic is supposed to mean universal, and I think that's meant to be something you can actually hear, not just something we say. A Mass in KL and a Mass in Rome are supposed to be recognisably the same rite. Every time the vernacular fully replaces the Latin Ordinary instead of sitting next to it, we lose a bit of that. And in Malaysia especially, where one parish weekend can run through Malay, English, Mandarin and Tamil Masses, we're not even holding onto that unity within our own parish, let alone across the world.

I don't think this is really cowardice on our part, even though I was tempted to call it that earlier on. Malaysia is genuinely a hard place to ask this of. Our languages don't share Latin's family the way French or Italian do, Tamil, Mandarin, Malay are all reaching a lot further just to meet Latin halfway than a European congregation ever had to. That friction is real, it's not just people being lazy.

What I think is actually missing isn't willpower, it's that nobody really explained to our generation why the distance was worth closing in the first place. We inherited the silence during the Latin parts without inheriting the reason those parts were in Latin to begin with.

And I don't think this fixes itself in one jump either. It can't. It has to start early, with actually catechizing our kids on this, because if we don't, they just grow up not knowing it was ever a thing to know. That's not disinterest, that's a knowledge gap. You can't expect someone to care about something they don't even know exists. So the transition only really works if it starts young and if people actually understand why it matters before we ask them to carry it.

There's actually something interesting in the numbers here too. A survey of younger Latin Mass goers in the US found that most of them weren't raised into it, only a small number had parents who actually led them there. Most of them came to it on their own, out of curiosity or reverence, not because it was handed to them. Which tells me the younger generation isn't necessarily less interested in the older forms of the faith, if anything some of them are actively looking for it. I think part of what's actually going on is that the generation that inherited Latin's decline, the ones who grew up in the post-Council years without it, are the ones running things now. And it's hard to hand down an appetite for something you were never really given a reason to want yourself.

That's really what I want to get at, not a call to drop Malay or English from the Mass, but a case for why the Ordinary, sung the way the Council actually asked for, is worth the effort of learning. Not because it's old, but because it's still ours whether we use it or not, part of a line running back through every Mass that's ever been said in the Latin rite, still holding the same words at the center of it.

Sanctus. Holy. It hasn't changed. Maybe it's worth integrating it back into the Mass again.`,
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
