/* ── theology crossword ──────────────────────────────
   Hand-built 11x9. Every maximal run of two or more white cells is a real
   entry with a clue — there is no filler, and the grid is checked against
   that promise at load rather than trusted.

   Loaded lazily from the "thoughts" easter egg, so none of this ships in the
   main bundle. */

const GRID = [
  'COMMANDMENT',
  'A#O#N#I#A#E',
  'T#S#G#S#S#M',
  'H#E#E#C#T#P',
  'E#S#L#IRE#L',
  'D#####P#RUE',
  'REVIVAL####',
  'A#####ELDER',
  'LAMENT#####',
];

const ROWS = GRID.length;
const COLS = GRID[0].length;
const BLOCK = '#';

/* Keyed by "row,col,direction". Aimed at general knowledge rather than a
   theology degree — the answers should be recognisable to anyone who has been
   near a church or a Bible, and the clues point at the familiar story. */
const CLUES = {
  '0,0,A': 'One of the ten Moses carried down the mountain',
  '4,6,A': 'Anger — one of the seven deadly sins',
  '5,8,A': 'To regret something bitterly',
  '6,0,A': 'A tent, a visiting preacher and a week of meetings',
  '7,6,A': 'Senior member of a congregation, with a role to match',
  '8,0,A': 'What roughly a third of the psalms are doing',

  '0,0,D': "The big church with the bishop's chair in it",
  '0,2,D': 'He got the tablets but never the promised land',
  '0,4,D': 'Gabriel, for one',
  '0,6,D': 'One of the twelve who followed Jesus',
  '0,8,D': 'The empty tomb, marked annually',
  '0,10,D': 'Jesus overturned the money changers’ tables in this one',
};

const key = (r, c, d) => `${r},${c},${d}`;
const isBlock = (r, c) => r < 0 || c < 0 || r >= ROWS || c >= COLS || GRID[r][c] === BLOCK;

/* Standard crossword numbering: a cell is numbered when it opens an across or
   a down entry, scanning left-to-right, top-to-bottom. */
function buildEntries() {
  const numbers = {};
  const entries = [];
  let n = 0;

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (isBlock(r, c)) continue;
      const startsA = isBlock(r, c - 1) && !isBlock(r, c + 1);
      const startsD = isBlock(r - 1, c) && !isBlock(r + 1, c);
      if (!startsA && !startsD) continue;
      numbers[`${r},${c}`] = ++n;

      for (const [starts, dir, dr, dc] of [[startsA, 'A', 0, 1], [startsD, 'D', 1, 0]]) {
        if (!starts) continue;
        const cells = [];
        for (let i = 0; !isBlock(r + dr * i, c + dc * i); i++) cells.push([r + dr * i, c + dc * i]);
        entries.push({
          num: n, dir, r, c, cells,
          answer: cells.map(([y, x]) => GRID[y][x]).join(''),
          clue: CLUES[key(r, c, dir)] || '(no clue)',
        });
      }
    }
  }
  return { numbers, entries };
}

const { numbers: NUMBERS, entries: ENTRIES } = buildEntries();

/* The grid and the clue list have to agree; a missing clue is a bug in the
   data, not something to discover mid-solve. */
ENTRIES.forEach(e => {
  if (e.clue === '(no clue)') console.warn('crossword: no clue for', e.num + e.dir, e.answer);
});


const KEYS = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];
const WHITE = [...GRID.join('')].filter(ch => ch !== BLOCK).length;
const dirName = d => (d === 'A' ? 'across' : 'down');

/* The two buttons that throw work away ask twice; the label is the prompt. */
const LABELS = { check: 'check', word: 'reveal word', all: 'reveal all', clear: 'clear' };

export const meta = { id: 'crossword', title: 'crossword', icon: '✝️', w: 470, h: 700 };

export function start(root) {
  /* One letter per white cell, empty until typed. */
  const fill = GRID.map(row => [...row].map(ch => (ch === BLOCK ? null : '')));
  let cur = ENTRIES[0];
  let at = 0;                 /* index into cur.cells */
  let checked = false;        /* wrong letters stay flagged until the next edit */
  let done = false;
  let armed = null;           /* a destructive button waiting for its second press */
  let armTimer = 0;
  let message = 'a theology crossword. click a square or a clue, then type.';

  const inCur = new Set();

  function refreshHighlight() {
    inCur.clear();
    cur.cells.forEach(([r, c]) => inCur.add(`${r},${c}`));
  }

  /* ── entry helpers ──────────────────────────────── */
  const entryAt = (r, c, dir) => ENTRIES.find(e => e.dir === dir && e.cells.some(([y, x]) => y === r && x === c));
  const isFull = e => e.cells.every(([y, x]) => fill[y][x]);
  const firstGap = e => { const i = e.cells.findIndex(([y, x]) => !fill[y][x]); return i === -1 ? 0 : i; };
  const solved = () => GRID.every((row, r) => [...row].every((ch, c) => ch === BLOCK || fill[r][c] === ch));

  /* Landing on a clue should land on the first square you still have to think
     about, not on a letter that is already sitting there. */
  function goEntry(entry, index) {
    cur = entry;
    at = index === undefined ? firstGap(entry) : index;
    disarm();
    sync();
  }

  function step(delta) {
    const i = ENTRIES.indexOf(cur);
    goEntry(ENTRIES[(i + delta + ENTRIES.length) % ENTRIES.length]);
  }

  function nextUnfinished() {
    const i = ENTRIES.indexOf(cur);
    for (let k = 1; k <= ENTRIES.length; k++) {
      const e = ENTRIES[(i + k) % ENTRIES.length];
      if (!isFull(e)) return e;
    }
    return null;
  }

  function select(r, c, preferred) {
    if (isBlock(r, c)) return;
    const [cr, cc] = cur.cells[at];
    /* Clicking the square you are already on flips across/down. Clicking any
       other square in the same word just moves along it — flipping there is
       the classic way to lose your place. */
    const wanted = preferred
      || (r === cr && c === cc ? (cur.dir === 'A' ? 'D' : 'A') : cur.dir);
    /* A cell may belong to only one direction — fall back rather than deselect. */
    const next = entryAt(r, c, wanted) || entryAt(r, c, wanted === 'A' ? 'D' : 'A');
    if (!next) return;
    cur = next;
    at = cur.cells.findIndex(([y, x]) => y === r && x === c);
    disarm();
    sync();
  }

  /* ── typing ─────────────────────────────────────── */
  function put(ch) {
    if (done) return;
    const [r, c] = cur.cells[at];
    fill[r][c] = ch;
    checked = false;
    disarm();

    if (solved()) {
      done = true;
      message = 'every square right. that is the whole grid.';
      sync();
      return;
    }

    /* Skip to the next gap in this entry, so filling around a stuck letter
       doesn't mean stepping over it by hand every time. */
    const after = cur.cells.findIndex(([y, x], i) => i > at && !fill[y][x]);
    if (after !== -1) at = after;
    else if (!isFull(cur)) at = firstGap(cur);
    else {
      /* Word finished — carry on at the next unsolved clue rather than
         parking on its last square. */
      const nxt = nextUnfinished();
      if (nxt) { cur = nxt; at = firstGap(nxt); }
    }
    sync();
  }

  function back() {
    if (done) return;
    const [r, c] = cur.cells[at];
    checked = false;
    disarm();
    if (fill[r][c]) fill[r][c] = '';
    else if (at > 0) { at--; const [pr, pc] = cur.cells[at]; fill[pr][pc] = ''; }
    else {
      /* Nothing left to delete at the head of an entry — step back into the
         previous clue instead of swallowing the key. */
      const i = ENTRIES.indexOf(cur);
      cur = ENTRIES[(i - 1 + ENTRIES.length) % ENTRIES.length];
      at = cur.cells.length - 1;
    }
    sync();
  }

  function move(dr, dc) {
    const dir = dc !== 0 ? 'A' : 'D';
    let [r, c] = cur.cells[at];
    /* Walk past blocks so the arrow keys cross the grid rather than stopping
       at the first gap. */
    for (let i = 0; i < Math.max(ROWS, COLS); i++) {
      r += dr; c += dc;
      if (r < 0 || c < 0 || r >= ROWS || c >= COLS) return;
      if (!isBlock(r, c)) { select(r, c, dir); return; }
    }
  }

  /* ── shell, built once ──────────────────────────── */
  /* The grid, the clue list and the keyboard never change shape, so they are
     rendered once and then updated in place. Rebuilding the subtree on every
     keystroke — which is what this used to do — threw away the clue list's
     scroll position and the keyboard focus along with it. */
  function gridHtml() {
    let html = '';
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (isBlock(r, c)) { html += '<div class="xwBlock"></div>'; continue; }
        const n = NUMBERS[`${r},${c}`];
        html += `<button type="button" class="xwCell" data-r="${r}" data-c="${c}" tabindex="-1">
            ${n ? `<span class="xwNum">${n}</span>` : ''}<span class="xwLtr"></span>
          </button>`;
      }
    }
    /* The column count lives with the grid data, not the stylesheet. */
    return `<div class="xwGrid" role="group" aria-label="crossword grid"
        style="grid-template-columns:repeat(${COLS},1fr)">${html}</div>`;
  }

  function keysHtml() {
    return KEYS.map(row => `<div class="xwKeyRow">
        ${[...row].map(ch => `<button type="button" class="xwKey" data-key="${ch}">${ch}</button>`).join('')}
        ${row === 'ZXCVBNM' ? '<button type="button" class="xwKey xwKeyWide" data-key="BACK" aria-label="backspace">⌫</button>' : ''}
      </div>`).join('');
  }

  function cluesHtml() {
    const list = dir => ENTRIES.filter(e => e.dir === dir).map(e =>
      `<li><button type="button" class="xwClue" data-num="${e.num}" data-dir="${e.dir}">
          <b>${e.num}</b><span>${e.clue}</span>
        </button></li>`).join('');
    return `<div class="xwClues">
        <div><p class="xwHd">across</p><ol>${list('A')}</ol></div>
        <div><p class="xwHd">down</p><ol>${list('D')}</ol></div>
      </div>`;
  }

  /* The clue you are solving rides in a bar pinned to the top of the window,
     with the two arrows that walk the clue list. Before this it sat under the
     grid, which on a phone meant scrolling away from the squares to read it. */
  root.innerHTML = `
    <div class="pzWrap">
      <div class="xwTop">
        <button type="button" class="xwNav" data-act="prev" aria-label="previous clue">‹</button>
        <p class="xwCurrent"><b data-role="pos"></b><span data-role="clue"></span></p>
        <button type="button" class="xwNav" data-act="next" aria-label="next clue">›</button>
      </div>
      ${gridHtml()}
      <div class="xwProg">
        <span class="xwTrack"><i class="xwFill" data-role="bar"></i></span>
        <span class="xwCount" data-role="count"></span>
      </div>
      <p class="pzMsg" data-role="msg" role="status" aria-live="polite"></p>
      <div class="xwKeys">${keysHtml()}</div>
      <p class="xwHint">type to fill · <b>space</b> swaps across and down · <b>tab</b> jumps to the next clue</p>
      <div class="pzBtns">
        <button type="button" class="btnSm pzBtn" data-act="check">check</button>
        <button type="button" class="btnSm pzBtn" data-act="word">reveal word</button>
        <button type="button" class="btnSm pzBtn" data-act="all">reveal all</button>
        <button type="button" class="btnSm pzBtn" data-act="clear">clear</button>
      </div>
      ${cluesHtml()}
    </div>`;

  const pick = sel => root.querySelector(sel);
  const posEl = pick('[data-role="pos"]');
  const clueEl = pick('[data-role="clue"]');
  const barEl = pick('[data-role="bar"]');
  const countEl = pick('[data-role="count"]');
  const msgEl = pick('[data-role="msg"]');
  const cells = [...root.querySelectorAll('.xwCell')].map(el => ({
    el, ltr: el.querySelector('.xwLtr'), r: +el.dataset.r, c: +el.dataset.c,
  }));
  const clueBtns = [...root.querySelectorAll('.xwClue')].map(el => ({
    el, entry: ENTRIES.find(e => e.num === +el.dataset.num && e.dir === el.dataset.dir),
  }));
  const actBtns = new Map(Object.keys(LABELS).map(a => [a, root.querySelector(`[data-act="${a}"]`)]));

  /* ── paint ──────────────────────────────────────── */
  function sync() {
    refreshHighlight();
    const [cr, cc] = cur.cells[at];
    let filled = 0;

    for (const { el, ltr, r, c } of cells) {
      const ch = fill[r][c];
      if (ch) filled++;
      if (ltr.textContent !== ch) ltr.textContent = ch;
      const here = r === cr && c === cc;
      el.classList.toggle('xwLit', inCur.has(`${r},${c}`));
      el.classList.toggle('xwCur', here);
      el.classList.toggle('xwWrong', checked && !!ch && ch !== GRID[r][c]);
      el.classList.toggle('xwDone', done);
      /* One stop on the tab ring, so tabbing into the grid lands on the cursor
         rather than walking all sixty squares. */
      el.tabIndex = here ? 0 : -1;
      el.setAttribute('aria-label', `row ${r + 1} column ${c + 1}, ${ch || 'empty'}`);
    }

    posEl.textContent = `${cur.num} ${dirName(cur.dir)}`;
    clueEl.textContent = cur.clue;
    barEl.style.width = `${Math.round((filled / WHITE) * 100)}%`;
    countEl.textContent = `${filled}/${WHITE}`;
    msgEl.textContent = message;
    msgEl.className = `pzMsg${done ? ' pzWin' : checked ? ' pzWarn' : ''}`;

    for (const { el, entry } of clueBtns) {
      el.classList.toggle('xwClueOn', entry === cur);
      el.classList.toggle('xwClueDone', isFull(entry));
    }

    for (const [act, btn] of actBtns) {
      btn.textContent = armed === act ? 'sure?'
        : act === 'clear' && done ? 'start over' : LABELS[act];
      btn.classList.toggle('pzArmed', armed === act);
      /* Everything but clear is spent once the grid is finished; clear becomes
         the way back in rather than greying out with the rest. */
      btn.disabled = done && act !== 'clear';
    }

    /* Follow the cursor with focus, but only for someone already navigating by
       keyboard — otherwise this would yank the window's scroll on every click. */
    const active = document.activeElement;
    if (active && active.classList.contains('xwCell') && root.contains(active)) {
      const target = cells.find(x => x.r === cr && x.c === cc);
      if (target && target.el !== active) target.el.focus({ preventScroll: true });
    }
  }

  /* ── the second-press guard ─────────────────────── */
  function disarm() {
    if (!armed) return;
    armed = null;
    clearTimeout(armTimer);
  }

  function arm(act) {
    if (armed === act) { disarm(); return true; }
    clearTimeout(armTimer);
    armed = act;
    armTimer = setTimeout(() => { armed = null; sync(); }, 4000);
    sync();
    return false;
  }

  /* ── actions ────────────────────────────────────── */
  const eachWhite = fn => GRID.forEach((row, r) => [...row].forEach((ch, c) => { if (ch !== BLOCK) fn(r, c, ch); }));

  const ACTIONS = {
    prev: () => step(-1),
    next: () => step(1),

    check() {
      checked = true;
      let wrong = 0, blanks = 0;
      eachWhite((r, c, ch) => {
        if (!fill[r][c]) blanks++;
        else if (fill[r][c] !== ch) wrong++;
      });
      message = wrong ? `${wrong} square${wrong === 1 ? '' : 's'} wrong — struck through in the grid.`
        : blanks ? `nothing wrong so far — ${blanks} still empty.`
          : 'all correct.';
      sync();
    },

    /* A whole grid was the only hint on offer, which is no hint at all. One
       word is the size of help people actually want. */
    word() {
      const label = `${cur.num} ${dirName(cur.dir)}`;
      cur.cells.forEach(([r, c]) => { fill[r][c] = GRID[r][c]; });
      checked = false;
      if (solved()) {
        done = true;
        message = 'that fills the last of it.';
      } else {
        message = `${label} filled in.`;
        const nxt = nextUnfinished();
        if (nxt) { cur = nxt; at = firstGap(nxt); }
      }
      sync();
    },

    all() {
      if (!arm('all')) return;
      eachWhite((r, c, ch) => { fill[r][c] = ch; });
      checked = false;
      done = true;
      message = 'revealed — the whole grid.';
      sync();
    },

    clear() {
      /* A finished grid has nothing left to lose, so no second press there. */
      if (!done && !arm('clear')) return;
      eachWhite((r, c) => { fill[r][c] = ''; });
      checked = false;
      done = false;
      cur = ENTRIES[0];
      at = 0;
      message = 'cleared. click a square or a clue, then type.';
      sync();
    },
  };

  /* Delegated and bound once — sync() only ever edits what changed. */
  root.addEventListener('click', e => {
    const sq = e.target.closest('[data-r]');
    if (sq) { select(+sq.dataset.r, +sq.dataset.c); return; }

    const clue = e.target.closest('[data-num]');
    if (clue) {
      const hit = clueBtns.find(x => x.el === clue);
      if (hit) goEntry(hit.entry);
      return;
    }

    const k = e.target.closest('[data-key]');
    if (k) { k.dataset.key === 'BACK' ? back() : put(k.dataset.key); return; }

    const act = e.target.closest('[data-act]')?.dataset.act;
    if (ACTIONS[act]) ACTIONS[act]();
  });

  /* Physical keyboard, but only while this window is the focused one. Reopening
     the puzzle builds a fresh grid, so the old listener retires itself once its
     root is off the page. */
  function onKey(e) {
    if (!document.contains(root)) { document.removeEventListener('keydown', onKey); return; }
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const win = root.closest('.win');
    if (!win || win.classList.contains('hidden') || !win.classList.contains('focused')) return;

    if (/^[a-zA-Z]$/.test(e.key)) { put(e.key.toUpperCase()); e.preventDefault(); }
    else if (e.key === 'Backspace' || e.key === 'Delete') { back(); e.preventDefault(); }
    else if (e.key === 'ArrowLeft') { move(0, -1); e.preventDefault(); }
    else if (e.key === 'ArrowRight') { move(0, 1); e.preventDefault(); }
    else if (e.key === 'ArrowUp') { move(-1, 0); e.preventDefault(); }
    else if (e.key === 'ArrowDown') { move(1, 0); e.preventDefault(); }
    else if (e.key === 'Tab' || e.key === 'Enter') { step(e.shiftKey ? -1 : 1); e.preventDefault(); }
    else if (e.key === ' ') {
      /* The classic way to flip between across and down. */
      const [r, c] = cur.cells[at];
      select(r, c, cur.dir === 'A' ? 'D' : 'A');
      e.preventDefault();
    }
  }
  document.addEventListener('keydown', onKey);

  sync();
}
