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

const ROWS = GRID.length;
const COLS = GRID[0].length;
const BLOCK = '#';
const KEYS = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];
const WHITE = [...GRID.join('')].filter(ch => ch !== BLOCK).length;
const LABELS = { check: 'check', word: 'reveal word', all: 'reveal all', clear: 'clear' };
const ARM_MS = 4000;

const isBlock = (r, c) => r < 0 || c < 0 || r >= ROWS || c >= COLS || GRID[r][c] === BLOCK;
const dirName = d => (d === 'A' ? 'across' : 'down');

function buildEntries() {
  const numbers = {};
  const entries = [];
  let n = 0;

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (isBlock(r, c)) continue;
      const startsAcross = isBlock(r, c - 1) && !isBlock(r, c + 1);
      const startsDown = isBlock(r - 1, c) && !isBlock(r + 1, c);
      if (!startsAcross && !startsDown) continue;
      numbers[`${r},${c}`] = ++n;

      for (const [starts, dir, dr, dc] of [[startsAcross, 'A', 0, 1], [startsDown, 'D', 1, 0]]) {
        if (!starts) continue;
        const cells = [];
        for (let i = 0; !isBlock(r + dr * i, c + dc * i); i++) cells.push([r + dr * i, c + dc * i]);
        entries.push({
          num: n,
          dir,
          cells,
          answer: cells.map(([y, x]) => GRID[y][x]).join(''),
          clue: CLUES[`${r},${c},${dir}`] || '(no clue)',
        });
      }
    }
  }
  return { numbers, entries };
}

const { numbers: NUMBERS, entries: ENTRIES } = buildEntries();

ENTRIES.forEach(entry => {
  if (entry.clue === '(no clue)') console.warn('crossword: no clue for', entry.num + entry.dir, entry.answer);
});

export class Crossword {
  static meta = {
    id: 'crossword',
    title: 'crossword',
    icon: '✝️',
    width: 470,
    height: 700,
    description: 'A hand-built theology crossword hidden in this portfolio.',
  };

  constructor(manager) {
    this.manager = manager;
    this.fill = GRID.map(row => [...row].map(ch => (ch === BLOCK ? null : '')));
    this.current = ENTRIES[0];
    this.at = 0;
    this.checked = false;
    this.done = false;
    this.armed = null;
    this.armTimer = 0;
    this.message = 'a theology crossword. click a square or a clue, then type.';
  }

  open() {
    const win = this.manager.create({ ...Crossword.meta, html: this.shell() });
    this.root = win.body;
    this.collect();
    this.bind();
    this.sync();
  }

  shell() {
    return `
    <div class="pzWrap">
      <div class="xwTop">
        <button type="button" class="xwNav" data-xw="prev" aria-label="previous clue">‹</button>
        <p class="xwCurrent"><b data-role="pos"></b><span data-role="clue"></span></p>
        <button type="button" class="xwNav" data-xw="next" aria-label="next clue">›</button>
      </div>
      ${this.gridHtml()}
      <div class="xwProg">
        <span class="xwTrack"><i class="xwFill" data-role="bar"></i></span>
        <span class="xwCount" data-role="count"></span>
      </div>
      <p class="pzMsg" data-role="msg" role="status" aria-live="polite"></p>
      <div class="xwKeys">${this.keysHtml()}</div>
      <p class="xwHint">type to fill · <b>space</b> swaps across and down · <b>tab</b> jumps to the next clue</p>
      <div class="pzBtns">
        ${Object.keys(LABELS).map(act => `<button type="button" class="btnSm pzBtn" data-xw="${act}">${LABELS[act]}</button>`).join('')}
      </div>
      ${this.cluesHtml()}
    </div>`;
  }

  gridHtml() {
    let html = '';
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (isBlock(r, c)) {
          html += '<div class="xwBlock"></div>';
          continue;
        }
        const n = NUMBERS[`${r},${c}`];
        html += `<button type="button" class="xwCell" data-r="${r}" data-c="${c}" tabindex="-1">
            ${n ? `<span class="xwNum">${n}</span>` : ''}<span class="xwLtr"></span>
          </button>`;
      }
    }
    return `<div class="xwGrid" role="group" aria-label="crossword grid"
        style="grid-template-columns:repeat(${COLS},1fr)">${html}</div>`;
  }

  keysHtml() {
    return KEYS.map(row => `<div class="xwKeyRow">
        ${[...row].map(ch => `<button type="button" class="xwKey" data-key="${ch}">${ch}</button>`).join('')}
        ${row === 'ZXCVBNM' ? '<button type="button" class="xwKey xwKeyWide" data-key="BACK" aria-label="backspace">⌫</button>' : ''}
      </div>`).join('');
  }

  cluesHtml() {
    const column = dir => ENTRIES.filter(e => e.dir === dir).map(e =>
      `<li><button type="button" class="xwClue" data-num="${e.num}" data-dir="${e.dir}">
          <b>${e.num}</b><span>${e.clue}</span>
        </button></li>`).join('');
    return `<div class="xwClues">
        <div><p class="xwHd">across</p><ol>${column('A')}</ol></div>
        <div><p class="xwHd">down</p><ol>${column('D')}</ol></div>
      </div>`;
  }

  collect() {
    const pick = sel => this.root.querySelector(sel);
    this.posEl = pick('[data-role="pos"]');
    this.clueEl = pick('[data-role="clue"]');
    this.barEl = pick('[data-role="bar"]');
    this.countEl = pick('[data-role="count"]');
    this.msgEl = pick('[data-role="msg"]');
    this.cells = [...this.root.querySelectorAll('.xwCell')].map(el => ({
      el,
      ltr: el.querySelector('.xwLtr'),
      r: Number(el.dataset.r),
      c: Number(el.dataset.c),
    }));
    this.clueBtns = [...this.root.querySelectorAll('.xwClue')].map(el => ({
      el,
      entry: ENTRIES.find(e => e.num === Number(el.dataset.num) && e.dir === el.dataset.dir),
    }));
    this.actBtns = new Map(Object.keys(LABELS).map(act => [act, this.root.querySelector(`[data-xw="${act}"]`)]));
  }

  bind() {
    this.root.addEventListener('click', e => {
      const square = e.target.closest('[data-r]');
      if (square) {
        this.select(Number(square.dataset.r), Number(square.dataset.c));
        return;
      }
      const clue = e.target.closest('[data-num]');
      if (clue) {
        const hit = this.clueBtns.find(x => x.el === clue);
        if (hit) this.goTo(hit.entry);
        return;
      }
      const key = e.target.closest('[data-key]');
      if (key) {
        if (key.dataset.key === 'BACK') this.back();
        else this.put(key.dataset.key);
        return;
      }
      const act = e.target.closest('[data-xw]')?.dataset.xw;
      if (act) this.run(act);
    });

    this.onKey = e => this.handleKey(e);
    document.addEventListener('keydown', this.onKey);
  }

  handleKey(e) {
    if (!document.contains(this.root)) {
      document.removeEventListener('keydown', this.onKey);
      return;
    }
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const win = this.root.closest('.win');
    if (!win || win.classList.contains('hidden') || !win.classList.contains('focused')) return;

    if (/^[a-zA-Z]$/.test(e.key)) this.put(e.key.toUpperCase());
    else if (e.key === 'Backspace' || e.key === 'Delete') this.back();
    else if (e.key === 'ArrowLeft') this.move(0, -1);
    else if (e.key === 'ArrowRight') this.move(0, 1);
    else if (e.key === 'ArrowUp') this.move(-1, 0);
    else if (e.key === 'ArrowDown') this.move(1, 0);
    else if (e.key === 'Tab' || e.key === 'Enter') this.step(e.shiftKey ? -1 : 1);
    else if (e.key === ' ') {
      const [r, c] = this.current.cells[this.at];
      this.select(r, c, this.current.dir === 'A' ? 'D' : 'A');
    } else return;

    e.preventDefault();
  }

  entryAt(r, c, dir) {
    return ENTRIES.find(e => e.dir === dir && e.cells.some(([y, x]) => y === r && x === c));
  }

  isFull(entry) {
    return entry.cells.every(([y, x]) => this.fill[y][x]);
  }

  firstGap(entry) {
    const i = entry.cells.findIndex(([y, x]) => !this.fill[y][x]);
    return i === -1 ? 0 : i;
  }

  get solved() {
    return GRID.every((row, r) => [...row].every((ch, c) => ch === BLOCK || this.fill[r][c] === ch));
  }

  nextUnfinished() {
    const i = ENTRIES.indexOf(this.current);
    for (let k = 1; k <= ENTRIES.length; k++) {
      const entry = ENTRIES[(i + k) % ENTRIES.length];
      if (!this.isFull(entry)) return entry;
    }
    return null;
  }

  goTo(entry, index) {
    this.current = entry;
    this.at = index === undefined ? this.firstGap(entry) : index;
    this.disarm();
    this.sync();
  }

  step(delta) {
    const i = ENTRIES.indexOf(this.current);
    this.goTo(ENTRIES[(i + delta + ENTRIES.length) % ENTRIES.length]);
  }

  select(r, c, preferred) {
    if (isBlock(r, c)) return;
    const [cr, cc] = this.current.cells[this.at];
    const wanted = preferred
      || (r === cr && c === cc ? (this.current.dir === 'A' ? 'D' : 'A') : this.current.dir);
    const next = this.entryAt(r, c, wanted) || this.entryAt(r, c, wanted === 'A' ? 'D' : 'A');
    if (!next) return;
    this.current = next;
    this.at = next.cells.findIndex(([y, x]) => y === r && x === c);
    this.disarm();
    this.sync();
  }

  move(dr, dc) {
    const dir = dc !== 0 ? 'A' : 'D';
    let [r, c] = this.current.cells[this.at];
    for (let i = 0; i < Math.max(ROWS, COLS); i++) {
      r += dr;
      c += dc;
      if (r < 0 || c < 0 || r >= ROWS || c >= COLS) return;
      if (!isBlock(r, c)) {
        this.select(r, c, dir);
        return;
      }
    }
  }

  put(ch) {
    if (this.done) return;
    const [r, c] = this.current.cells[this.at];
    this.fill[r][c] = ch;
    this.checked = false;
    this.disarm();

    if (this.solved) {
      this.done = true;
      this.message = 'every square right. that is the whole grid.';
      this.sync();
      return;
    }

    const ahead = this.current.cells.findIndex(([y, x], i) => i > this.at && !this.fill[y][x]);
    if (ahead !== -1) this.at = ahead;
    else if (!this.isFull(this.current)) this.at = this.firstGap(this.current);
    else {
      const next = this.nextUnfinished();
      if (next) {
        this.current = next;
        this.at = this.firstGap(next);
      }
    }
    this.sync();
  }

  back() {
    if (this.done) return;
    const [r, c] = this.current.cells[this.at];
    this.checked = false;
    this.disarm();
    if (this.fill[r][c]) this.fill[r][c] = '';
    else if (this.at > 0) {
      this.at--;
      const [pr, pc] = this.current.cells[this.at];
      this.fill[pr][pc] = '';
    } else {
      const i = ENTRIES.indexOf(this.current);
      this.current = ENTRIES[(i - 1 + ENTRIES.length) % ENTRIES.length];
      this.at = this.current.cells.length - 1;
    }
    this.sync();
  }

  eachWhite(fn) {
    GRID.forEach((row, r) => [...row].forEach((ch, c) => {
      if (ch !== BLOCK) fn(r, c, ch);
    }));
  }

  disarm() {
    if (!this.armed) return;
    this.armed = null;
    clearTimeout(this.armTimer);
  }

  arm(act) {
    if (this.armed === act) {
      this.disarm();
      return true;
    }
    clearTimeout(this.armTimer);
    this.armed = act;
    this.armTimer = setTimeout(() => {
      this.armed = null;
      this.sync();
    }, ARM_MS);
    this.sync();
    return false;
  }

  run(act) {
    if (act === 'prev') this.step(-1);
    else if (act === 'next') this.step(1);
    else if (act === 'check') this.check();
    else if (act === 'word') this.revealWord();
    else if (act === 'all') this.revealAll();
    else if (act === 'clear') this.clear();
  }

  check() {
    this.checked = true;
    let wrong = 0;
    let blanks = 0;
    this.eachWhite((r, c, ch) => {
      if (!this.fill[r][c]) blanks++;
      else if (this.fill[r][c] !== ch) wrong++;
    });
    this.message = wrong ? `${wrong} square${wrong === 1 ? '' : 's'} wrong — struck through in the grid.`
      : blanks ? `nothing wrong so far — ${blanks} still empty.`
        : 'all correct.';
    this.sync();
  }

  revealWord() {
    const label = `${this.current.num} ${dirName(this.current.dir)}`;
    this.current.cells.forEach(([r, c]) => { this.fill[r][c] = GRID[r][c]; });
    this.checked = false;
    if (this.solved) {
      this.done = true;
      this.message = 'that fills the last of it.';
      this.sync();
      return;
    }
    this.message = `${label} filled in.`;
    const next = this.nextUnfinished();
    if (next) this.goTo(next);
    else this.sync();
  }

  revealAll() {
    if (!this.arm('all')) return;
    this.eachWhite((r, c, ch) => { this.fill[r][c] = ch; });
    this.checked = false;
    this.done = true;
    this.message = 'revealed — the whole grid.';
    this.sync();
  }

  clear() {
    if (!this.done && !this.arm('clear')) return;
    this.eachWhite((r, c) => { this.fill[r][c] = ''; });
    this.checked = false;
    this.done = false;
    this.current = ENTRIES[0];
    this.at = 0;
    this.message = 'cleared. click a square or a clue, then type.';
    this.sync();
  }

  sync() {
    const lit = new Set(this.current.cells.map(([r, c]) => `${r},${c}`));
    const [cr, cc] = this.current.cells[this.at];
    let filled = 0;

    for (const { el, ltr, r, c } of this.cells) {
      const ch = this.fill[r][c];
      if (ch) filled++;
      if (ltr.textContent !== ch) ltr.textContent = ch;
      const here = r === cr && c === cc;
      el.classList.toggle('xwLit', lit.has(`${r},${c}`));
      el.classList.toggle('xwCur', here);
      el.classList.toggle('xwWrong', this.checked && !!ch && ch !== GRID[r][c]);
      el.classList.toggle('xwDone', this.done);
      el.tabIndex = here ? 0 : -1;
      el.setAttribute('aria-label', `row ${r + 1} column ${c + 1}, ${ch || 'empty'}`);
    }

    this.posEl.textContent = `${this.current.num} ${dirName(this.current.dir)}`;
    this.clueEl.textContent = this.current.clue;
    this.barEl.style.width = `${Math.round((filled / WHITE) * 100)}%`;
    this.countEl.textContent = `${filled}/${WHITE}`;
    this.msgEl.textContent = this.message;
    this.msgEl.className = `pzMsg${this.done ? ' pzWin' : this.checked ? ' pzWarn' : ''}`;

    for (const { el, entry } of this.clueBtns) {
      el.classList.toggle('xwClueOn', entry === this.current);
      el.classList.toggle('xwClueDone', this.isFull(entry));
    }

    for (const [act, btn] of this.actBtns) {
      btn.textContent = this.armed === act ? 'sure?'
        : act === 'clear' && this.done ? 'start over' : LABELS[act];
      btn.classList.toggle('pzArmed', this.armed === act);
      btn.disabled = this.done && act !== 'clear';
    }

    const active = document.activeElement;
    if (active && active.classList.contains('xwCell') && this.root.contains(active)) {
      const target = this.cells.find(x => x.r === cr && x.c === cc);
      if (target && target.el !== active) target.el.focus({ preventScroll: true });
    }
  }
}
