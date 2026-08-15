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

export const meta = { id: 'crossword', title: 'crossword', icon: '✝️', w: 470, h: 700 };

export function start(root) {
  /* One letter per white cell, empty until typed. */
  const fill = GRID.map(row => [...row].map(ch => (ch === BLOCK ? null : '')));
  let cur = ENTRIES[0];
  let at = 0;                 /* index into cur.cells */
  let checked = false;        /* wrong letters stay flagged until the next edit */
  let done = false;
  let message = 'across and down. click a square, or pick a clue.';

  const inCur = new Set();

  function refreshHighlight() {
    inCur.clear();
    cur.cells.forEach(([r, c]) => inCur.add(`${r},${c}`));
  }

  function entryAt(r, c, dir) {
    return ENTRIES.find(e => e.dir === dir && e.cells.some(([y, x]) => y === r && x === c));
  }

  function select(r, c, preferred) {
    if (isBlock(r, c)) return;
    const here = `${r},${c}`;
    const wanted = preferred
      || (inCur.has(here) ? (cur.dir === 'A' ? 'D' : 'A') : cur.dir);
    /* A cell may belong to only one direction — fall back rather than deselect. */
    const next = entryAt(r, c, wanted) || entryAt(r, c, wanted === 'A' ? 'D' : 'A');
    if (!next) return;
    cur = next;
    at = cur.cells.findIndex(([y, x]) => y === r && x === c);
    draw();
  }

  function solved() {
    return GRID.every((row, r) => [...row].every((ch, c) => ch === BLOCK || fill[r][c] === ch));
  }

  function put(ch) {
    if (done) return;
    const [r, c] = cur.cells[at];
    fill[r][c] = ch;
    checked = false;
    /* Skip to the next gap in this entry, so filling around a stuck letter
       doesn't mean stepping over it by hand every time. */
    const nextGap = cur.cells.findIndex(([y, x], i) => i > at && !fill[y][x]);
    at = nextGap !== -1 ? nextGap : Math.min(at + 1, cur.cells.length - 1);

    if (solved()) {
      done = true;
      message = 'every square right. that is the whole grid.';
    }
    draw();
  }

  function back() {
    if (done) return;
    const [r, c] = cur.cells[at];
    checked = false;
    if (fill[r][c]) fill[r][c] = '';
    else if (at > 0) { at--; const [pr, pc] = cur.cells[at]; fill[pr][pc] = ''; }
    draw();
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

  function drawGrid() {
    let html = '';
    const [cr, cc] = cur.cells[at];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (isBlock(r, c)) { html += '<div class="xwBlock"></div>'; continue; }
        const cls = ['xwCell'];
        if (inCur.has(`${r},${c}`)) cls.push('xwLit');
        if (r === cr && c === cc) cls.push('xwCur');
        if (checked && fill[r][c] && fill[r][c] !== GRID[r][c]) cls.push('xwWrong');
        if (done) cls.push('xwDone');
        const n = NUMBERS[`${r},${c}`];
        html += `<button type="button" class="${cls.join(' ')}" data-r="${r}" data-c="${c}">
            ${n ? `<span class="xwNum">${n}</span>` : ''}<span class="xwLtr">${fill[r][c] || ''}</span>
          </button>`;
      }
    }
    /* The column count lives with the grid data, not the stylesheet. */
    return `<div class="xwGrid" style="grid-template-columns:repeat(${COLS},1fr)">${html}</div>`;
  }

  function drawClues() {
    const list = dir => ENTRIES.filter(e => e.dir === dir).map(e =>
      `<li><button type="button" class="xwClue${e === cur ? ' xwClueOn' : ''}" data-num="${e.num}" data-dir="${e.dir}">
          <b>${e.num}</b><span>${e.clue}</span>
        </button></li>`).join('');
    return `<div class="xwClues">
        <div><p class="xwHd">across</p><ol>${list('A')}</ol></div>
        <div><p class="xwHd">down</p><ol>${list('D')}</ol></div>
      </div>`;
  }

  function draw() {
    refreshHighlight();
    const board = KEYS.map(row => `<div class="xwKeyRow">
        ${[...row].map(ch => `<button type="button" class="xwKey" data-key="${ch}">${ch}</button>`).join('')}
        ${row === 'ZXCVBNM' ? '<button type="button" class="xwKey xwKeyWide" data-key="BACK">⌫</button>' : ''}
      </div>`).join('');

    root.innerHTML = `
      <div class="pzWrap">
        <p class="pzNote">a theology crossword</p>
        ${drawGrid()}
        <p class="xwCurrent"><b>${cur.num} ${cur.dir === 'A' ? 'across' : 'down'}</b> ${cur.clue}</p>
        <p class="pzMsg${done ? ' pzWin' : checked ? ' pzWarn' : ''}">${message}</p>
        <div class="xwKeys">${board}</div>
        <div class="pzBtns">
          <button type="button" class="btnSm pzBtn" data-act="check"${done ? ' disabled' : ''}>check</button>
          <button type="button" class="btnSm pzBtn" data-act="clear"${done ? ' disabled' : ''}>clear</button>
          <button type="button" class="btnSm pzBtn" data-act="reveal"${done ? ' disabled' : ''}>reveal</button>
        </div>
        ${drawClues()}
      </div>`;
  }

  /* Delegated and bound once — draw() replaces the whole subtree. */
  root.addEventListener('click', e => {
    const sq = e.target.closest('[data-r]');
    if (sq) { select(+sq.dataset.r, +sq.dataset.c); return; }

    const clue = e.target.closest('[data-num]');
    if (clue) {
      const entry = ENTRIES.find(x => x.num === +clue.dataset.num && x.dir === clue.dataset.dir);
      if (entry) { cur = entry; at = 0; draw(); }
      return;
    }

    const k = e.target.closest('[data-key]');
    if (k) { k.dataset.key === 'BACK' ? back() : put(k.dataset.key); return; }

    const act = e.target.closest('[data-act]')?.dataset.act;
    if (act === 'check') {
      checked = true;
      let wrong = 0, blanks = 0;
      GRID.forEach((row, r) => [...row].forEach((ch, c) => {
        if (ch === BLOCK) return;
        if (!fill[r][c]) blanks++;
        else if (fill[r][c] !== ch) wrong++;
      }));
      message = wrong ? `${wrong} square${wrong === 1 ? '' : 's'} wrong.`
        : blanks ? `nothing wrong so far — ${blanks} still empty.`
          : 'all correct.';
      draw();
    } else if (act === 'clear') {
      GRID.forEach((row, r) => [...row].forEach((ch, c) => { if (ch !== BLOCK) fill[r][c] = ''; }));
      checked = false;
      message = 'cleared.';
      draw();
    } else if (act === 'reveal') {
      GRID.forEach((row, r) => [...row].forEach((ch, c) => { if (ch !== BLOCK) fill[r][c] = ch; }));
      checked = false;
      done = true;
      message = 'revealed — the whole grid.';
      draw();
    }
  });

  /* Physical keyboard, but only while this window is the focused one. */
  document.addEventListener('keydown', e => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const win = root.closest('.win');
    if (!win || win.classList.contains('hidden') || !win.classList.contains('focused')) return;

    if (/^[a-zA-Z]$/.test(e.key)) { put(e.key.toUpperCase()); e.preventDefault(); }
    else if (e.key === 'Backspace' || e.key === 'Delete') { back(); e.preventDefault(); }
    else if (e.key === 'ArrowLeft') { move(0, -1); e.preventDefault(); }
    else if (e.key === 'ArrowRight') { move(0, 1); e.preventDefault(); }
    else if (e.key === 'ArrowUp') { move(-1, 0); e.preventDefault(); }
    else if (e.key === 'ArrowDown') { move(1, 0); e.preventDefault(); }
    else if (e.key === 'Tab' || e.key === ' ') {
      /* Both classic ways to flip between across and down. */
      const [r, c] = cur.cells[at];
      select(r, c, cur.dir === 'A' ? 'D' : 'A');
      e.preventDefault();
    }
  });

  draw();
}
