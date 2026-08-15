/* ── pathfinder ──────────────────────────────────────
   An easter egg: five pokes at the pen avatar in the about window opens it.
   A random weighted graph of 23 nodes; click your way from S to E and try to
   match the cheapest route Dijkstra can find. Loaded lazily, so none of this
   is in the bundle unless someone actually finds it. */

const N = 23;                 /* nodes */
const W = 520, H = 430;       /* svg canvas */
const PAD = 30;
const COLS = 5, ROWS = 5;     /* 25 cells for 23 nodes — two stay empty */
const BEST_KEY = 'pathfinderBest';

let S = null;                 /* the live game */

/* ── helpers ─────────────────────────────────────── */
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const ekey = (a, b) => (a < b ? `${a}-${b}` : `${b}-${a}`);

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/* ── graph generation ────────────────────────────── */
/* Nodes go in a jittered grid rather than a free scatter: random points clump,
   and clumps make the edges unreadable. */
function layout() {
  const cells = [];
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) cells.push([c, r]);
  shuffle(cells);
  const cw = (W - PAD * 2) / COLS, ch = (H - PAD * 2) / ROWS;
  return cells.slice(0, N).map(([c, r], i) => ({
    i,
    x: PAD + c * cw + cw / 2 + (Math.random() - .5) * cw * .45,
    y: PAD + r * ch + ch / 2 + (Math.random() - .5) * ch * .45,
  }));
}

/* Each node links to its 2–3 nearest neighbours, which keeps edges short and
   mostly non-crossing. Weights are random and unrelated to length, so the
   puzzle can't be solved by eyeballing the geometry. */
function connect(nodes) {
  const seen = new Set(), edges = [];
  const add = (a, b) => {
    if (a === b || seen.has(ekey(a, b))) return;
    seen.add(ekey(a, b));
    edges.push({ a, b, w: 1 + Math.floor(Math.random() * 9) });
  };

  nodes.forEach(n => {
    const near = nodes.filter(m => m !== n).sort((p, q) => dist(n, p) - dist(n, q));
    near.slice(0, 2 + (Math.random() < .5 ? 1 : 0)).forEach(m => add(n.i, m.i));
  });

  /* Nearest-neighbour linking can still leave islands — stitch them together
     by the shortest pair spanning two components until one remains. */
  const parent = nodes.map((_, i) => i);
  const find = x => (parent[x] === x ? x : (parent[x] = find(parent[x])));
  const union = (a, b) => { parent[find(a)] = find(b); };
  edges.forEach(e => union(e.a, e.b));

  for (;;) {
    const roots = new Set(nodes.map(n => find(n.i)));
    if (roots.size < 2) break;
    let best = null;
    for (const a of nodes) for (const b of nodes) {
      if (find(a.i) === find(b.i)) continue;
      const d = dist(a, b);
      if (!best || d < best.d) best = { a: a.i, b: b.i, d };
    }
    add(best.a, best.b);
    union(best.a, best.b);
  }

  return edges;
}

function adjacency(edges) {
  const adj = Array.from({ length: N }, () => []);
  edges.forEach(e => {
    adj[e.a].push({ to: e.b, w: e.w });
    adj[e.b].push({ to: e.a, w: e.w });
  });
  return adj;
}

/* Plain Dijkstra — 23 nodes, so a linear scan for the minimum is fine. */
function dijkstra(adj, from) {
  const cost = Array(N).fill(Infinity), prev = Array(N).fill(-1), done = Array(N).fill(false);
  cost[from] = 0;
  for (let step = 0; step < N; step++) {
    let u = -1;
    for (let i = 0; i < N; i++) if (!done[i] && (u < 0 || cost[i] < cost[u])) u = i;
    if (u < 0 || cost[u] === Infinity) break;
    done[u] = true;
    for (const { to, w } of adj[u]) {
      if (cost[u] + w < cost[to]) { cost[to] = cost[u] + w; prev[to] = u; }
    }
  }
  return { cost, prev };
}

function trace(prev, end) {
  const path = [];
  for (let at = end; at !== -1; at = prev[at]) path.unshift(at);
  return path;
}

/* Builds a puzzle worth solving: the goal is the node furthest from the start,
   and a route of fewer than four hops isn't much of a puzzle. */
function newPuzzle() {
  for (let attempt = 0; attempt < 40; attempt++) {
    const nodes = layout();
    const edges = connect(nodes);
    const adj = adjacency(edges);
    const start = Math.floor(Math.random() * N);
    const { cost, prev } = dijkstra(adj, start);
    let end = -1;
    for (let i = 0; i < N; i++) {
      if (i !== start && cost[i] < Infinity && (end < 0 || cost[i] > cost[end])) end = i;
    }
    if (end < 0) continue;
    const solution = trace(prev, end);
    if (solution.length < 5) continue;
    return { nodes, edges, adj, start, end, optimal: cost[end], solution };
  }
  return null;   /* astronomically unlikely; caller falls back to a retry */
}

/* ── state ───────────────────────────────────────── */
function readBest() {
  const n = parseInt(localStorage.getItem(BEST_KEY) || '0', 10);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function deal(streak) {
  const p = newPuzzle() || newPuzzle();
  S = {
    ...p,
    path: [p.start],
    cost: 0,
    streak,
    best: readBest(),
    reveal: null,
    msg: 'click your way from S to E — cheapest route wins',
    tone: '',
  };
}

function edgeWeight(a, b) {
  return (S.adj[a].find(e => e.to === b) || {}).w;
}

/* ── rendering ───────────────────────────────────── */
function board() {
  const shown = S.reveal || S.path;
  const on = new Set();
  for (let i = 1; i < shown.length; i++) on.add(ekey(shown[i - 1], shown[i]));
  const visited = new Set(shown);
  const head = S.path[S.path.length - 1];
  const canStep = new Set(S.reveal ? [] : S.adj[head].map(e => e.to).filter(t => !S.path.includes(t)));

  const wires = S.edges.map(e => {
    const a = S.nodes[e.a], b = S.nodes[e.b];
    const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
    const lit = on.has(ekey(e.a, e.b));
    return `<line class="gEdge${lit ? ' gEdgeOn' : ''}" x1="${a.x.toFixed(1)}" y1="${a.y.toFixed(1)}" x2="${b.x.toFixed(1)}" y2="${b.y.toFixed(1)}"/>
      <circle class="gWDot" cx="${mx.toFixed(1)}" cy="${my.toFixed(1)}" r="8.5"/>
      <text class="gW${lit ? ' gWOn' : ''}" x="${mx.toFixed(1)}" y="${my.toFixed(1)}">${e.w}</text>`;
  }).join('');

  const dots = S.nodes.map(n => {
    const role = n.i === S.start ? ' gStart' : n.i === S.end ? ' gEnd' : '';
    const cls = role + (visited.has(n.i) ? ' gOn' : '') + (n.i === head && !S.reveal ? ' gHead' : '')
      + (canStep.has(n.i) ? ' gCan' : '');
    const label = n.i === S.start ? 'S' : n.i === S.end ? 'E' : n.i;
    return `<g class="gNode${cls}" onclick="pfTap(${n.i})" role="button" tabindex="0" aria-label="node ${label}">
        <circle cx="${n.x.toFixed(1)}" cy="${n.y.toFixed(1)}" r="13"/>
        <text x="${n.x.toFixed(1)}" y="${n.y.toFixed(1)}">${label}</text>
      </g>`;
  }).join('');

  return `<svg class="gBoard" viewBox="0 0 ${W} ${H}" role="img" aria-label="graph of ${N} nodes">
      <g>${wires}</g><g>${dots}</g>
    </svg>`;
}

function render() {
  const body = document.getElementById('wb-game');
  if (!body) return;
  const solved = S.path[S.path.length - 1] === S.end && S.cost === S.optimal;

  body.innerHTML = `
    <div class="gWrap">
      <div class="gStats">
        <span class="gStat"><b>${S.cost}</b>cost</span>
        <span class="gStat"><b>${S.streak}</b>streak</span>
        <span class="gStat"><b>${S.best}</b>best</span>
      </div>
      ${board()}
      <p class="gMsg${S.tone ? ' ' + S.tone : ''}">${S.msg}</p>
      <div class="gBtns">
        <button class="btnSm gBtn" onclick="pfUndo()"${S.path.length > 1 && !S.reveal ? '' : ' disabled'}>undo</button>
        <button class="btnSm gBtn" onclick="pfReveal()"${S.reveal || solved ? ' disabled' : ''}>give up</button>
        <button class="btnSm gBtn" onclick="pfNew()">new graph</button>
      </div>
    </div>`;
}

/* ── interaction ─────────────────────────────────── */
function tap(i) {
  if (!S || S.reveal) return;
  const head = S.path[S.path.length - 1];

  /* Tapping the node you're standing on steps back — the same gesture undoes. */
  if (i === head) { undo(); return; }

  const w = edgeWeight(head, i);
  if (w === undefined) {
    S.msg = 'no edge that way — follow the lines';
    S.tone = 'gWarn';
    render();
    return;
  }
  if (S.path.includes(i)) {
    S.msg = "you've already been there";
    S.tone = 'gWarn';
    render();
    return;
  }

  S.path.push(i);
  S.cost += w;

  if (i !== S.end) {
    S.msg = `cost so far: ${S.cost}`;
    S.tone = '';
  } else if (S.cost === S.optimal) {
    S.streak++;
    if (S.streak > S.best) { S.best = S.streak; localStorage.setItem(BEST_KEY, String(S.best)); }
    S.msg = `solved in ${S.cost} — that's the cheapest route. streak ${S.streak}.`;
    S.tone = 'gWin';
  } else {
    S.msg = `you got there for ${S.cost}, but it can be done in ${S.optimal}. undo and keep looking.`;
    S.tone = 'gWarn';
  }
  render();
}

function undo() {
  if (!S || S.reveal || S.path.length < 2) return;
  const last = S.path.pop();
  S.cost -= edgeWeight(S.path[S.path.length - 1], last);
  S.msg = S.path.length > 1 ? `cost so far: ${S.cost}` : 'back to the start';
  S.tone = '';
  render();
}

function reveal() {
  if (!S || S.reveal) return;
  S.reveal = S.solution;
  S.streak = 0;
  S.msg = `the cheapest route costs ${S.optimal}. streak reset.`;
  S.tone = 'gWarn';
  render();
}

function next() {
  deal(S ? S.streak : 0);
  render();
}

/* ── entry point ─────────────────────────────────── */
export function openGame() {
  window.pfTap = tap;
  window.pfUndo = undo;
  window.pfReveal = reveal;
  window.pfNew = next;

  if (document.getElementById('w-game')) {
    window.openWin('game');
    return;
  }
  deal(0);
  window.mkWin('game', 'pathfinder', '🕹️', 560, 640, 0, 0, '');
  render();
}
