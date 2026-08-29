const NODES = 23;
const BOARD_W = 520;
const BOARD_H = 430;
const PAD = 30;
const COLS = 5;
const ROWS = 5;
const MAX_WEIGHT = 9;
const MIN_HOPS = 5;
const LAYOUT_TRIES = 40;
const BEST_KEY = 'pathfinderBest';

const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const edgeKey = (a, b) => (a < b ? `${a}-${b}` : `${b}-${a}`);

function shuffle(items) {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

function readBest() {
  try {
    const stored = Number.parseInt(localStorage.getItem(BEST_KEY) || '0', 10);
    return Number.isFinite(stored) && stored > 0 ? stored : 0;
  } catch {
    return 0;
  }
}

function writeBest(value) {
  try {
    localStorage.setItem(BEST_KEY, String(value));
  } catch {
    return;
  }
}

export class Graph {
  constructor(nodes, edges) {
    this.nodes = nodes;
    this.edges = edges;
    this.adjacency = nodes.map(() => []);
    for (const edge of edges) {
      this.adjacency[edge.a].push({ to: edge.b, weight: edge.weight });
      this.adjacency[edge.b].push({ to: edge.a, weight: edge.weight });
    }
  }

  get size() {
    return this.nodes.length;
  }

  neighbours(index) {
    return this.adjacency[index];
  }

  weightBetween(a, b) {
    return this.adjacency[a].find(edge => edge.to === b)?.weight;
  }

  cheapestFrom(start) {
    const cost = Array(this.size).fill(Infinity);
    const from = Array(this.size).fill(-1);
    const settled = Array(this.size).fill(false);
    cost[start] = 0;

    for (let step = 0; step < this.size; step++) {
      let at = -1;
      for (let i = 0; i < this.size; i++) {
        if (!settled[i] && (at < 0 || cost[i] < cost[at])) at = i;
      }
      if (at < 0 || cost[at] === Infinity) break;
      settled[at] = true;
      for (const { to, weight } of this.neighbours(at)) {
        if (cost[at] + weight < cost[to]) {
          cost[to] = cost[at] + weight;
          from[to] = at;
        }
      }
    }
    return { cost, from };
  }

  static trace(from, end) {
    const path = [];
    for (let at = end; at !== -1; at = from[at]) path.unshift(at);
    return path;
  }

  static scatter() {
    const cells = [];
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) cells.push([c, r]);
    shuffle(cells);
    const cw = (BOARD_W - PAD * 2) / COLS;
    const ch = (BOARD_H - PAD * 2) / ROWS;
    return cells.slice(0, NODES).map(([c, r], i) => ({
      i,
      x: PAD + c * cw + cw / 2 + (Math.random() - 0.5) * cw * 0.45,
      y: PAD + r * ch + ch / 2 + (Math.random() - 0.5) * ch * 0.45,
    }));
  }

  static wire(nodes) {
    const seen = new Set();
    const edges = [];
    const add = (a, b) => {
      if (a === b || seen.has(edgeKey(a, b))) return;
      seen.add(edgeKey(a, b));
      edges.push({ a, b, weight: 1 + Math.floor(Math.random() * MAX_WEIGHT) });
    };

    for (const node of nodes) {
      const nearest = nodes
        .filter(other => other !== node)
        .sort((p, q) => distance(node, p) - distance(node, q));
      nearest.slice(0, 2 + (Math.random() < 0.5 ? 1 : 0)).forEach(other => add(node.i, other.i));
    }

    const parent = nodes.map((_, i) => i);
    const find = x => (parent[x] === x ? x : (parent[x] = find(parent[x])));
    const union = (a, b) => { parent[find(a)] = find(b); };
    edges.forEach(edge => union(edge.a, edge.b));

    for (;;) {
      if (new Set(nodes.map(node => find(node.i))).size < 2) break;
      let bridge = null;
      for (const a of nodes) {
        for (const b of nodes) {
          if (find(a.i) === find(b.i)) continue;
          const d = distance(a, b);
          if (!bridge || d < bridge.d) bridge = { a: a.i, b: b.i, d };
        }
      }
      add(bridge.a, bridge.b);
      union(bridge.a, bridge.b);
    }

    return edges;
  }

  static random() {
    const nodes = Graph.scatter();
    return new Graph(nodes, Graph.wire(nodes));
  }
}

export class Puzzle {
  constructor(graph, start, end, cost, from) {
    this.graph = graph;
    this.start = start;
    this.end = end;
    this.optimal = cost[end];
    this.solution = Graph.trace(from, end);
    this.path = [start];
    this.cost = 0;
    this.reveal = null;
  }

  static deal() {
    for (let attempt = 0; attempt < LAYOUT_TRIES; attempt++) {
      const graph = Graph.random();
      const start = Math.floor(Math.random() * graph.size);
      const { cost, from } = graph.cheapestFrom(start);
      let end = -1;
      for (let i = 0; i < graph.size; i++) {
        if (i !== start && cost[i] < Infinity && (end < 0 || cost[i] > cost[end])) end = i;
      }
      if (end < 0) continue;
      const puzzle = new Puzzle(graph, start, end, cost, from);
      if (puzzle.solution.length < MIN_HOPS) continue;
      return puzzle;
    }
    return null;
  }

  get head() {
    return this.path[this.path.length - 1];
  }

  get finished() {
    return this.head === this.end;
  }

  get perfect() {
    return this.finished && this.cost === this.optimal;
  }

  canStepTo(index) {
    return !this.reveal && !this.path.includes(index) && this.graph.weightBetween(this.head, index) !== undefined;
  }

  stepTo(index) {
    const weight = this.graph.weightBetween(this.head, index);
    this.path.push(index);
    this.cost += weight;
  }

  stepBack() {
    if (this.path.length < 2) return;
    const last = this.path.pop();
    this.cost -= this.graph.weightBetween(this.head, last);
  }

  giveUp() {
    this.reveal = this.solution;
  }
}

export class Pathfinder {
  static meta = {
    id: 'game',
    title: 'pathfinder',
    icon: '🕹️',
    width: 560,
    height: 640,
    description: 'A shortest-path puzzle hidden in this portfolio.',
  };

  constructor(manager) {
    this.manager = manager;
    this.streak = 0;
    this.best = readBest();
    this.puzzle = null;
    this.message = '';
    this.tone = '';
  }

  open() {
    this.deal();
    const win = this.manager.create({ ...Pathfinder.meta, html: '' });
    this.root = win.body;
    this.root.addEventListener('click', e => this.onClick(e));
    this.render();
  }

  deal() {
    this.puzzle = Puzzle.deal() || Puzzle.deal();
    this.message = 'click your way from S to E — cheapest route wins';
    this.tone = '';
  }

  onClick(event) {
    const node = event.target.closest('[data-node]');
    if (node) {
      this.tap(Number(node.dataset.node));
      return;
    }
    const action = event.target.closest('[data-act]')?.dataset.act;
    if (action === 'pf:undo') this.undo();
    else if (action === 'pf:reveal') this.giveUp();
    else if (action === 'pf:new') this.next();
  }

  tap(index) {
    const puzzle = this.puzzle;
    if (!puzzle || puzzle.reveal) return;

    if (index === puzzle.head) {
      this.undo();
      return;
    }
    if (puzzle.path.includes(index)) {
      this.say("you've already been there", 'gWarn');
      return;
    }
    if (puzzle.graph.weightBetween(puzzle.head, index) === undefined) {
      this.say('no edge that way — follow the lines', 'gWarn');
      return;
    }

    puzzle.stepTo(index);

    if (!puzzle.finished) this.say(`cost so far: ${puzzle.cost}`);
    else if (puzzle.perfect) {
      this.streak++;
      if (this.streak > this.best) {
        this.best = this.streak;
        writeBest(this.best);
      }
      this.say(`solved in ${puzzle.cost} — that's the cheapest route. streak ${this.streak}.`, 'gWin');
    } else {
      this.say(`you got there for ${puzzle.cost}, but it can be done in ${puzzle.optimal}. undo and keep looking.`, 'gWarn');
    }
  }

  undo() {
    const puzzle = this.puzzle;
    if (!puzzle || puzzle.reveal || puzzle.path.length < 2) return;
    puzzle.stepBack();
    this.say(puzzle.path.length > 1 ? `cost so far: ${puzzle.cost}` : 'back to the start');
  }

  giveUp() {
    if (!this.puzzle || this.puzzle.reveal) return;
    this.puzzle.giveUp();
    this.streak = 0;
    this.say(`the cheapest route costs ${this.puzzle.optimal}. streak reset.`, 'gWarn');
  }

  next() {
    this.deal();
    this.render();
  }

  say(message, tone = '') {
    this.message = message;
    this.tone = tone;
    this.render();
  }

  board() {
    const puzzle = this.puzzle;
    const shown = puzzle.reveal || puzzle.path;
    const lit = new Set();
    for (let i = 1; i < shown.length; i++) lit.add(edgeKey(shown[i - 1], shown[i]));
    const visited = new Set(shown);
    const reachable = new Set(puzzle.reveal ? [] : puzzle.graph.neighbours(puzzle.head)
      .map(edge => edge.to)
      .filter(to => !puzzle.path.includes(to)));

    const wires = puzzle.graph.edges.map(edge => {
      const a = puzzle.graph.nodes[edge.a];
      const b = puzzle.graph.nodes[edge.b];
      const mx = (a.x + b.x) / 2;
      const my = (a.y + b.y) / 2;
      const on = lit.has(edgeKey(edge.a, edge.b));
      return `<line class="gEdge${on ? ' gEdgeOn' : ''}" x1="${a.x.toFixed(1)}" y1="${a.y.toFixed(1)}" x2="${b.x.toFixed(1)}" y2="${b.y.toFixed(1)}"/>
        <circle class="gWDot" cx="${mx.toFixed(1)}" cy="${my.toFixed(1)}" r="8.5"/>
        <text class="gW${on ? ' gWOn' : ''}" x="${mx.toFixed(1)}" y="${my.toFixed(1)}">${edge.weight}</text>`;
    }).join('');

    const dots = puzzle.graph.nodes.map(node => {
      const isStart = node.i === puzzle.start;
      const isEnd = node.i === puzzle.end;
      const state = (isStart ? ' gStart' : isEnd ? ' gEnd' : '')
        + (visited.has(node.i) ? ' gOn' : '')
        + (node.i === puzzle.head && !puzzle.reveal ? ' gHead' : '')
        + (reachable.has(node.i) ? ' gCan' : '');
      const label = isStart ? 'S' : isEnd ? 'E' : '';
      const name = isStart ? 'start' : isEnd ? 'goal' : `node ${node.i}`;
      const r = label ? 13 : 9.5;
      return `<g class="gNode${state}" data-node="${node.i}" role="button" tabindex="0" aria-label="${name}">
          <circle cx="${node.x.toFixed(1)}" cy="${node.y.toFixed(1)}" r="${r}"/>
          ${label ? `<text x="${node.x.toFixed(1)}" y="${node.y.toFixed(1)}">${label}</text>` : ''}
        </g>`;
    }).join('');

    return `<svg class="gBoard" viewBox="0 0 ${BOARD_W} ${BOARD_H}" role="img" aria-label="graph of ${puzzle.graph.size} nodes">
        <g>${wires}</g><g>${dots}</g>
      </svg>`;
  }

  render() {
    if (!this.root) return;
    const puzzle = this.puzzle;
    const canUndo = puzzle.path.length > 1 && !puzzle.reveal;
    const spent = puzzle.reveal || puzzle.perfect;

    this.root.innerHTML = `
    <div class="gWrap">
      <div class="gStats">
        <span class="gStat"><b>${puzzle.cost}</b>cost</span>
        <span class="gStat"><b>${this.streak}</b>streak</span>
        <span class="gStat"><b>${this.best}</b>best</span>
      </div>
      ${this.board()}
      <p class="gMsg${this.tone ? ` ${this.tone}` : ''}" role="status" aria-live="polite">${this.message}</p>
      <div class="gBtns">
        <button class="btnSm gBtn" data-act="pf:undo"${canUndo ? '' : ' disabled'}>undo</button>
        <button class="btnSm gBtn" data-act="pf:reveal"${spent ? ' disabled' : ''}>give up</button>
        <button class="btnSm gBtn" data-act="pf:new">new graph</button>
      </div>
    </div>`;
  }
}
