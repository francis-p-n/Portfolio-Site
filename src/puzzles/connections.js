/* ── connections ─────────────────────────────────────
   Sixteen words, four hidden groups of four, four mistakes allowed. Groups are
   listed easiest-first, and each puzzle carries at least one word that looks
   like it belongs to the wrong group — that overlap is the whole game. */

const PUZZLES = [
  {
    groups: [
      { name: 'kinds of bridge', words: ['ARCH', 'TRUSS', 'CABLE', 'BEAM'] },
      { name: 'network things', words: ['NODE', 'EDGE', 'GRAPH', 'PATH'] },
      { name: '___ light', words: ['TRAFFIC', 'MOON', 'SPOT', 'LIME'] },
      { name: 'homophones of letters', words: ['QUEUE', 'WHY', 'SEA', 'ARE'] },
    ],
  },
  {
    groups: [
      { name: 'brewed drinks', words: ['COFFEE', 'STOUT', 'CIDER', 'KOMBUCHA'] },
      { name: 'python built-ins', words: ['RANGE', 'FILTER', 'MAP', 'ZIP'] },
      { name: 'file formats', words: ['PARQUET', 'AVRO', 'ORC', 'FEATHER'] },
      { name: 'flightless birds', words: ['KIWI', 'EMU', 'RHEA', 'PENGUIN'] },
    ],
  },
  {
    groups: [
      { name: 'malaysian dishes', words: ['LAKSA', 'RENDANG', 'SATAY', 'CENDOL'] },
      { name: 'kuala lumpur landmarks', words: ['PETRONAS', 'MERDEKA', 'BATU', 'MENARA'] },
      { name: 'monsoon weather', words: ['HUMID', 'SQUALL', 'DELUGE', 'MUGGY'] },
      { name: 'currency nicknames', words: ['RINGGIT', 'QUID', 'BUCK', 'DOSH'] },
    ],
  },
  {
    groups: [
      { name: 'sort algorithms', words: ['MERGE', 'HEAP', 'BUBBLE', 'RADIX'] },
      { name: 'memory regions', words: ['STACK', 'CACHE', 'REGISTER', 'BUFFER'] },
      { name: 'coffee orders', words: ['FLAT', 'LONG', 'SHORT', 'CORTADO'] },
      { name: 'things that pop', words: ['CORK', 'BALLOON', 'BLISTER', 'FLASH'] },
    ],
  },
  {
    groups: [
      { name: 'scout skills', words: ['LASHING', 'PIONEER', 'TRACKING', 'SIGNAL'] },
      { name: 'types of knot', words: ['BOWLINE', 'TIMBER', 'SHEET', 'REEF'] },
      /* CLOVE reads as a knot (clove hitch) but is only ever a spice here —
         that misdirection is the point, and it keeps all 16 words distinct. */
      { name: 'spices', words: ['CLOVE', 'STAR', 'MACE', 'NUTMEG'] },
      { name: 'card games', words: ['BRIDGE', 'HEARTS', 'SPIT', 'WAR'] },
    ],
  },
  {
    groups: [
      { name: 'gospel writers', words: ['MATTHEW', 'MARK', 'LUKE', 'JOHN'] },
      { name: 'liturgical seasons', words: ['ADVENT', 'LENT', 'EASTER', 'ORDINARY'] },
      { name: 'kinds of chant', words: ['GREGORIAN', 'AMBROSIAN', 'MOZARABIC', 'BYZANTINE'] },
      { name: 'famous cathedrals', words: ['CHARTRES', 'COLOGNE', 'DURHAM', 'SEVILLE'] },
    ],
  },
];

const TIER = ['cnA', 'cnB', 'cnC', 'cnD'];
const MAX_MISTAKES = 4;

/* A puzzle whose 16 words aren't distinct leaves a group that can never be
   completed, so it is dropped rather than dealt. Checked once, at load. */
const PLAYABLE = PUZZLES.filter(p => {
  const words = p.groups.flatMap(g => g.words);
  const ok = p.groups.length === 4 && words.length === 16 && new Set(words).size === 16;
  if (!ok) console.warn('connections: skipping malformed puzzle', p.groups.map(g => g.name));
  return ok;
});

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const meta = { id: 'connections', title: 'connections', icon: '🟨', w: 420, h: 560 };

export function start(root) {
  let puzzle, tiles, picked, solved, mistakes, done, message;

  function deal() {
    puzzle = PLAYABLE[Math.floor(Math.random() * PLAYABLE.length)];
    tiles = puzzle.groups.flatMap((g, gi) => g.words.map(word => ({ word, group: gi })));
    shuffle(tiles);
    picked = new Set();
    solved = [];
    mistakes = 0;
    done = false;
    message = 'find four groups of four.';
    draw();
  }

  function remaining() {
    return tiles.filter(t => !solved.includes(t.group));
  }

  function draw() {
    const bands = solved.map(gi => `<div class="cnBand ${TIER[gi]}">
        <b>${puzzle.groups[gi].name}</b>
        <span>${puzzle.groups[gi].words.join(' · ')}</span>
      </div>`).join('');

    const board = remaining().map(t =>
      `<button type="button" class="cnTile${picked.has(t.word) ? ' cnPicked' : ''}" data-word="${t.word}">${t.word}</button>`
    ).join('');

    const dots = Array.from({ length: MAX_MISTAKES }, (_, i) =>
      `<span class="cnLife${i < mistakes ? ' cnLost' : ''}"></span>`).join('');

    root.innerHTML = `
      <div class="pzWrap">
        <p class="pzNote">four groups · four mistakes</p>
        ${bands ? `<div class="cnBands">${bands}</div>` : ''}
        ${done ? '' : `<div class="cnGrid">${board}</div>`}
        <p class="pzMsg${done && solved.length === 4 ? ' pzWin' : done ? ' pzWarn' : ''}">${message}</p>
        ${done ? '' : `<div class="cnLives">${dots}</div>`}
        <div class="pzBtns">
          ${done ? '' : `<button type="button" class="btnSm pzBtn" data-act="shuffle">shuffle</button>
          <button type="button" class="btnSm pzBtn" data-act="clear"${picked.size ? '' : ' disabled'}>deselect</button>
          <button type="button" class="btnSm pzBtn" data-act="submit"${picked.size === 4 ? '' : ' disabled'}>submit</button>`}
          <button type="button" class="btnSm pzBtn" data-act="new">new puzzle</button>
        </div>
      </div>`;
  }

  function revealRest() {
    puzzle.groups.forEach((_, gi) => { if (!solved.includes(gi)) solved.push(gi); });
  }

  function submit() {
    if (picked.size !== 4 || done) return;
    const chosen = tiles.filter(t => picked.has(t.word));
    const groups = new Set(chosen.map(t => t.group));

    if (groups.size === 1) {
      const gi = chosen[0].group;
      solved.push(gi);
      picked.clear();
      if (solved.length === 4) {
        done = true;
        message = mistakes === 0 ? 'all four, clean. that is a proper solve.' : 'all four groups found.';
      } else {
        message = `${puzzle.groups[gi].name}. ${4 - solved.length} to go.`;
      }
      draw();
      return;
    }

    mistakes++;
    /* "One away" is the signal that makes the game fair — without it a near
       miss is indistinguishable from a wild guess. */
    const counts = {};
    chosen.forEach(t => { counts[t.group] = (counts[t.group] || 0) + 1; });
    const close = Object.values(counts).includes(3);

    if (mistakes >= MAX_MISTAKES) {
      done = true;
      revealRest();
      message = 'out of mistakes — here they all are.';
    } else {
      message = close ? 'one away.' : `not a group. ${MAX_MISTAKES - mistakes} mistakes left.`;
    }
    picked.clear();
    draw();
  }

  /* Delegated and bound once — draw() replaces the whole subtree. */
  root.addEventListener('click', e => {
    const tile = e.target.closest('[data-word]');
    if (tile && !done) {
      const w = tile.dataset.word;
      if (picked.has(w)) picked.delete(w);
      else if (picked.size < 4) picked.add(w);
      draw();
      return;
    }
    const act = e.target.closest('[data-act]')?.dataset.act;
    if (act === 'submit') submit();
    else if (act === 'clear') { picked.clear(); draw(); }
    else if (act === 'shuffle') { shuffle(tiles); draw(); }
    else if (act === 'new') deal();
  });

  deal();
}
