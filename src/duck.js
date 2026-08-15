/* ── the duck ────────────────────────────────────────
   A rare visitor. Every so often a duck paddles across the waves at the foot
   of the desktop; click it before it swims off the far side and it hands you
   a puzzle. It is meant to be rare — most visits will never see one.

   Tuning: SIGHTING_MS is the average gap between sightings and SWIM_MS is how
   long the duck is on screen (and therefore catchable) each time.
   window.duck() summons one immediately, which is the only sane way to test
   this without waiting ten minutes. */

const SIGHTING_MS = 10 * 60 * 1000;   /* average gap between ducks */
const SPREAD = 0.3;                   /* ±30%, so the gap isn't metronomic */
const SWIM_MS = 42_000;               /* time to cross the screen */

let timer = null;
let current = null;

const jitter = () => SIGHTING_MS * (1 - SPREAD + Math.random() * SPREAD * 2);

/* Drawn to sit on the waterline: the body's underside is the last thing above
   it, so the duck reads as floating rather than hovering. Same filled,
   hand-drawn language as the nav icons. */
function duckSvg(facingLeft) {
  return `<svg class="duckArt${facingLeft ? ' duckFlip' : ''}" viewBox="0 0 62 40" aria-hidden="true">
      <path class="duckBody" d="M3 19 C9 16 18 15 27 17 C30 10 33 4 40 4 C46 4 50 8 49.5 13.5
        C49.3 15 49.2 16.2 49 17.6 C48 21 44 23.5 42 25.5 C45 29 42 33.5 35 33.5
        C21 34 9 31 5 27 C4 24 3.5 21.5 3 19 Z"/>
      <path class="duckWing" d="M16 22 C22 19.5 30 21 33 25 C27 28.5 19 27.5 16 22 Z"/>
      <path class="duckBeak" d="M49.2 12.4 L59 15.2 L49 18.4 Z"/>
      <circle class="duckEye" cx="44.5" cy="11" r="1.7"/>
    </svg>`;
}

function despawn(el) {
  if (!el) return;
  el.classList.add('duckGone');
  setTimeout(() => el.remove(), 500);
  if (current === el) current = null;
}

function schedule(delay = jitter()) {
  clearTimeout(timer);
  timer = setTimeout(spawn, delay);
}

export function spawn() {
  /* Never two at once — but don't wedge the scheduler shut if the node was
     torn out from under us by something other than despawn(). */
  if (current && current.isConnected) return;
  current = null;

  const facingLeft = Math.random() < 0.5;
  const el = document.createElement('button');
  el.id = 'duck';
  el.className = 'duck';
  el.type = 'button';
  el.setAttribute('aria-label', 'a duck — click it');
  el.style.setProperty('--swim', SWIM_MS + 'ms');
  el.style.animationName = facingLeft ? 'duckSwimLeft' : 'duckSwimRight';
  /* The bob is on the inner wrapper so it composes with the drift instead of
     fighting it for the transform on a single element. */
  el.innerHTML = `<span class="duckBob">${duckSvg(facingLeft)}</span>`;

  el.addEventListener('click', () => {
    despawn(el);
    schedule();                              /* the next one is independent */
    import('./puzzles/index.js')
      .then(m => m.openRandomPuzzle())
      .catch(err => console.error('puzzle failed to load:', err));
  });

  /* Swam off the far edge uncaught — better luck next time. */
  el.addEventListener('animationend', e => {
    if (e.animationName.startsWith('duckSwim')) { despawn(el); schedule(); }
  });

  document.body.appendChild(el);
  current = el;
}

export function startDuck() {
  schedule();
  /* Nothing is scheduled while the tab is in the background — a duck that
     paddled across an unwatched tab would just burn the sighting. */
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) clearTimeout(timer);
    else if (!current) schedule();
  });
}
