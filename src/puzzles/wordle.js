/* ── wordle ──────────────────────────────────────────
   Six guesses, five letters. The answer pool leans towards awkward words —
   double letters, thin vowels, uncommon endings — because the brief was
   "quite hard". Guesses aren't dictionary-checked: a word list small enough
   to ship would reject far more real words than it caught nonsense. */

const ANSWERS = [
  'ABBEY', 'AGILE', 'AMBER', 'ARGUE', 'AWFUL', 'BADGE', 'BAYOU', 'BLIMP', 'BOOZY', 'BRIAR',
  'CACHE', 'CAULK', 'CHAFE', 'CHIRP', 'CIVIC', 'CLIFF', 'CRAMP', 'CROAK', 'CYNIC', 'DECOY',
  'DODGE', 'DOWRY', 'DRYER', 'EAGER', 'EJECT', 'ELUDE', 'EPOXY', 'EQUIP', 'ERROR', 'EXALT',
  'FEWER', 'FJORD', 'FLUFF', 'FOYER', 'FRISK', 'FUZZY', 'GAUZE', 'GLYPH', 'GNOME', 'GRIMY',
  'HATCH', 'HAVOC', 'HEDGE', 'HYENA', 'IDIOM', 'IGLOO', 'IMPEL', 'INEPT', 'IVORY', 'JAUNT',
  'JELLY', 'JOKER', 'KAYAK', 'KNACK', 'KNEEL', 'KRILL', 'LAPEL', 'LEDGE', 'LILAC', 'LUCID',
  'LYMPH', 'MADAM', 'MAMMA', 'MIRTH', 'MOSSY', 'MOTTO', 'MUMMY', 'NANNY', 'NERVY', 'NICHE',
  'NUDGE', 'NYLON', 'OCCUR', 'ONION', 'OZONE', 'PAPAL', 'PERKY', 'PHASE', 'PIXEL', 'PLUCK',
  'POPPY', 'PROXY', 'PUPIL', 'QUAIL', 'QUEUE', 'QUILT', 'QUIRK', 'RADAR', 'RAJAH', 'REBUS',
  'RIVER', 'ROBIN', 'ROUGE', 'RUMMY', 'SAVVY', 'SCRUB', 'SHYLY', 'SIEGE', 'SKIFF', 'SLOTH',
  'SNARL', 'SPASM', 'SQUAD', 'STAFF', 'SUGAR', 'SWILL', 'TABOO', 'TALLY', 'TEPID', 'THIGH',
  'TONIC', 'TRUSS', 'TULIP', 'ULCER', 'UNZIP', 'USHER', 'VAGUE', 'VIVID', 'VOUCH', 'WAFER',
  'WHARF', 'WHISK', 'WIDOW', 'WOOZY', 'WRUNG', 'XENON', 'YACHT', 'YEARN', 'YOKEL', 'ZEBRA',
];

const ROWS = 6, LEN = 5;
const KEYS = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];

/* Two passes, because a guess can hold more copies of a letter than the answer
   does: exact hits are claimed first, then the leftovers feed the "present"
   marks until the answer's supply of that letter runs out. */
export function score(guess, answer) {
  const marks = Array(LEN).fill('absent');
  const pool = {};
  for (let i = 0; i < LEN; i++) {
    if (guess[i] === answer[i]) marks[i] = 'correct';
    else pool[answer[i]] = (pool[answer[i]] || 0) + 1;
  }
  for (let i = 0; i < LEN; i++) {
    if (marks[i] === 'correct') continue;
    if (pool[guess[i]] > 0) { marks[i] = 'present'; pool[guess[i]]--; }
  }
  return marks;
}

export const meta = { id: 'wordle', title: 'wordle', icon: '🟩', w: 380, h: 620 };

export function start(root) {
  let answer, guesses, current, done, message;

  function deal() {
    answer = ANSWERS[Math.floor(Math.random() * ANSWERS.length)];
    guesses = [];
    current = '';
    done = false;
    message = 'six tries. type a five-letter word.';
    draw();
  }

  /* Best-known state per letter, so a key never downgrades from green. */
  function keyState() {
    const rank = { absent: 1, present: 2, correct: 3 };
    const best = {};
    guesses.forEach(g => {
      const marks = score(g, answer);
      [...g].forEach((ch, i) => {
        if (!best[ch] || rank[marks[i]] > rank[best[ch]]) best[ch] = marks[i];
      });
    });
    return best;
  }

  function draw() {
    const rows = [];
    for (let r = 0; r < ROWS; r++) {
      const guess = guesses[r];
      const typing = !done && r === guesses.length;
      const letters = [];
      for (let i = 0; i < LEN; i++) {
        if (guess) {
          letters.push(`<span class="wTile w-${score(guess, answer)[i]}">${guess[i]}</span>`);
        } else if (typing) {
          letters.push(`<span class="wTile${current[i] ? ' wFilled' : ''}">${current[i] || ''}</span>`);
        } else {
          letters.push('<span class="wTile"></span>');
        }
      }
      rows.push(`<div class="wRow">${letters.join('')}</div>`);
    }

    const st = keyState();
    const board = KEYS.map((row, n) => `<div class="wKeyRow">
        ${n === 2 ? '<button type="button" class="wKey wKeyWide" data-key="ENTER">enter</button>' : ''}
        ${[...row].map(ch => `<button type="button" class="wKey${st[ch] ? ' w-' + st[ch] : ''}" data-key="${ch}">${ch}</button>`).join('')}
        ${n === 2 ? '<button type="button" class="wKey wKeyWide" data-key="BACK">⌫</button>' : ''}
      </div>`).join('');

    const won = done && guesses[guesses.length - 1] === answer;
    root.innerHTML = `
      <div class="pzWrap">
        <div class="wGrid">${rows.join('')}</div>
        <p class="pzMsg${won ? ' pzWin' : done ? ' pzWarn' : ''}">${message}</p>
        <div class="wKeys">${board}</div>
        <div class="pzBtns"><button type="button" class="btnSm pzBtn" data-act="new">new word</button></div>
      </div>`;
  }

  function submit() {
    if (current.length < LEN) { message = `${LEN} letters, please.`; draw(); return; }
    guesses.push(current);
    const won = current === answer;
    current = '';
    if (won) {
      done = true;
      message = `got it in ${guesses.length} — nice.`;
    } else if (guesses.length === ROWS) {
      done = true;
      message = `out of guesses. it was ${answer}.`;
    } else {
      message = `${ROWS - guesses.length} ${ROWS - guesses.length === 1 ? 'try' : 'tries'} left.`;
    }
    draw();
  }

  function press(key) {
    if (done) return;
    if (key === 'ENTER') submit();
    else if (key === 'BACK') { current = current.slice(0, -1); draw(); }
    else if (/^[A-Z]$/.test(key) && current.length < LEN) { current += key; draw(); }
  }

  /* Delegated and bound once — draw() replaces the whole subtree. */
  root.addEventListener('click', e => {
    const k = e.target.closest('[data-key]');
    if (k) { press(k.dataset.key); return; }
    if (e.target.closest('[data-act="new"]')) deal();
  });

  document.addEventListener('keydown', e => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const win = root.closest('.win');
    if (!win || win.classList.contains('hidden') || !win.classList.contains('focused')) return;
    if (e.key === 'Enter') { press('ENTER'); e.preventDefault(); }
    else if (e.key === 'Backspace') { press('BACK'); e.preventDefault(); }
    else if (/^[a-zA-Z]$/.test(e.key)) { press(e.key.toUpperCase()); e.preventDefault(); }
  });

  deal();
}
