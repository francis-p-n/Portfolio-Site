/* ── sudoku ──────────────────────────────────────────
   Generated fresh every time, and hard on purpose: cells are dug out in
   symmetric pairs and every removal is checked to make sure exactly one
   solution survives, down to ~26 clues. */

const CLUE_TARGET = 26;      /* hard sits around 24-28 givens */
const DIG_BUDGET_MS = 400;   /* generation blocks the main thread — cap the jank */

const rowOf = i => (i / 9) | 0;
const colOf = i => i % 9;
const boxOf = i => ((rowOf(i) / 3) | 0) * 3 + ((colOf(i) / 3) | 0);

/* Peer lists are fixed for a 9x9 board, so build them once instead of
   rescanning all 81 cells on every legality check. */
const PEERS = Array.from({ length: 81 }, (_, i) => {
  const out = [];
  for (let k = 0; k < 81; k++) {
    if (k === i) continue;
    if (rowOf(k) === rowOf(i) || colOf(k) === colOf(i) || boxOf(k) === boxOf(i)) out.push(k);
  }
  return out;
});

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const legal = (grid, i, v) => !PEERS[i].some(k => grid[k] === v);

/* Fills an empty grid by backtracking over shuffled candidates, so every
   generated board is different. */
function fill(grid, at = 0) {
  if (at === 81) return true;
  if (grid[at] !== 0) return fill(grid, at + 1);
  for (const v of shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9])) {
    if (!legal(grid, at, v)) continue;
    grid[at] = v;
    if (fill(grid, at + 1)) return true;
    grid[at] = 0;
  }
  return false;
}

/* Stops at the second solution — we only need to know whether it's unique. */
function countSolutions(grid) {
  const work = grid.slice();
  let found = 0;
  (function rec() {
    if (found >= 2) return;
    /* Branch on the most-constrained empty cell; on a sparse grid that prunes
       vastly harder than filling in index order. */
    let at = -1, bestOpts = null;
    for (let i = 0; i < 81; i++) {
      if (work[i] !== 0) continue;
      const opts = [];
      for (let v = 1; v <= 9; v++) if (legal(work, i, v)) opts.push(v);
      if (!opts.length) return;
      if (!bestOpts || opts.length < bestOpts.length) { at = i; bestOpts = opts; }
      if (opts.length === 1) break;
    }
    if (at === -1) { found++; return; }
    for (const v of bestOpts) {
      work[at] = v;
      rec();
      work[at] = 0;
      if (found >= 2) return;
    }
  })();
  return found;
}

export function makePuzzle() {
  const solution = new Array(81).fill(0);
  fill(solution);

  const puzzle = solution.slice();
  let clues = 81;
  const deadline = Date.now() + DIG_BUDGET_MS;

  /* Symmetric pairs: it reads like a printed grid rather than a random
     spatter, and it halves the number of uniqueness checks. A pair rejected
     early can become removable once its neighbours are gone, so sweep a few
     times instead of writing each position off after one try. */
  for (let pass = 0; pass < 4; pass++) {
    if (clues <= CLUE_TARGET || Date.now() > deadline) break;
    for (const i of shuffle([...Array(81).keys()])) {
      if (clues <= CLUE_TARGET || Date.now() > deadline) break;
      if (puzzle[i] === 0) continue;
      const mirror = 80 - i;
      const a = puzzle[i], b = puzzle[mirror];
      puzzle[i] = 0;
      puzzle[mirror] = 0;
      if (countSolutions(puzzle) !== 1) { puzzle[i] = a; puzzle[mirror] = b; continue; }
      clues -= i === mirror ? 1 : 2;
    }
  }
  return { puzzle, solution, clues };
}

export const meta = { id: 'sudoku', title: 'sudoku', icon: '🔢', w: 400, h: 620 };

export function start(root) {
  let cells, given, solution, clues, selected, done;

  function deal() {
    const p = makePuzzle();
    solution = p.solution;
    clues = p.clues;
    given = p.puzzle.map(v => v !== 0);
    cells = p.puzzle.slice();
    selected = -1;
    done = false;
    draw();
  }

  /* Flags digits that repeat within a row, column or box. This marks clashes
     only — it never compares against the solution, so it can't leak answers. */
  function clashes() {
    const bad = new Set();
    for (let i = 0; i < 81; i++) {
      if (!cells[i]) continue;
      if (PEERS[i].some(k => cells[k] === cells[i])) bad.add(i);
    }
    return bad;
  }

  function draw() {
    const bad = clashes();
    if (!done && cells.every((v, i) => v === solution[i])) done = true;
    const selVal = selected >= 0 ? cells[selected] : 0;

    const grid = cells.map((v, i) => {
      const cls = ['sCell'];
      if (given[i]) cls.push('sGiven');
      if (i === selected) cls.push('sSel');
      else if (selVal && v === selVal) cls.push('sSame');
      if (bad.has(i)) cls.push('sBad');
      if (colOf(i) % 3 === 2 && colOf(i) !== 8) cls.push('sEdgeR');
      if (rowOf(i) % 3 === 2 && rowOf(i) !== 8) cls.push('sEdgeB');
      return `<button type="button" class="${cls.join(' ')}" data-cell="${i}">${v || ''}</button>`;
    }).join('');

    /* A digit greys out once all nine of it are on the board. */
    const counts = {};
    cells.forEach(v => { if (v) counts[v] = (counts[v] || 0) + 1; });
    const pad = [1, 2, 3, 4, 5, 6, 7, 8, 9]
      .map(n => `<button type="button" class="sKey${counts[n] === 9 ? ' sKeyDone' : ''}" data-key="${n}">${n}</button>`)
      .join('') + `<button type="button" class="sKey sKeyDel" data-key="0">⌫</button>`;

    const msg = done ? 'solved — that was a hard one.'
      : bad.size ? 'a red square repeats in its row, column or box.'
        : 'click a square, then a number. arrow keys work too.';

    root.innerHTML = `
      <div class="pzWrap">
        <p class="pzNote">${clues} givens · hard</p>
        <div class="sGrid">${grid}</div>
        <div class="sPad">${pad}</div>
        <p class="pzMsg${done ? ' pzWin' : bad.size ? ' pzWarn' : ''}">${msg}</p>
        <div class="pzBtns"><button type="button" class="btnSm pzBtn" data-act="new">new puzzle</button></div>
      </div>`;
  }

  function put(n) {
    if (done || selected < 0 || given[selected]) return;
    cells[selected] = n;
    draw();
  }

  /* Delegated, and bound once — draw() replaces the whole subtree, so
     per-element handlers would be rebound (and leak) on every keystroke. */
  root.addEventListener('click', e => {
    const cell = e.target.closest('[data-cell]');
    if (cell) { selected = +cell.dataset.cell; draw(); return; }
    const key = e.target.closest('[data-key]');
    if (key) { put(+key.dataset.key); return; }
    if (e.target.closest('[data-act="new"]')) deal();
  });

  /* Physical keyboard, but only while this window is the focused one, so two
     open puzzles never swallow the same keystroke. */
  document.addEventListener('keydown', e => {
    if (done || e.ctrlKey || e.metaKey || e.altKey) return;
    const win = root.closest('.win');
    if (!win || win.classList.contains('hidden') || !win.classList.contains('focused')) return;

    if (/^[1-9]$/.test(e.key)) { put(+e.key); e.preventDefault(); }
    else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') { put(0); e.preventDefault(); }
    else if (e.key.startsWith('Arrow')) {
      const step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -9, ArrowDown: 9 }[e.key];
      if (step === undefined) return;
      const from = selected < 0 ? 0 : selected;
      const next = selected < 0 ? 0 : from + step;
      /* Left/right must not wrap onto the neighbouring row. */
      if (next < 0 || next > 80) return;
      if (Math.abs(step) === 1 && rowOf(next) !== rowOf(from)) return;
      selected = next;
      draw();
      e.preventDefault();
    }
  });

  deal();
}
