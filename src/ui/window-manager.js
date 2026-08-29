const MARGIN_X = 32;
const MARGIN_Y = 80;
const MIN_W = 240;
const MIN_H = 140;
const EDGE = 24;
const SPLIT_MIN_VW = 700;
const DRAG_SLOP = 6;
const GRAB_OFFSET = 21;
const BASE_Z = 20;
const CEILING_Z = 450;
const GLIDE_MS = 200;

function capture(el, pointerId) {
  try {
    el.setPointerCapture(pointerId);
  } catch {
    return false;
  }
  return true;
}

export class AppWindow {
  constructor(manager, def) {
    this.manager = manager;
    this.id = def.id;
    this.title = def.title ?? def.id;
    this.icon = def.icon ?? '🗔';
    this.baseWidth = def.width;
    this.baseHeight = def.height;
    this.tabTitle = def.tabTitle ?? this.title;
    this.description = def.description ?? '';
    this.stowed = false;
    this.snapped = false;
    this.floating = null;
    this.el = this.build(def.html ?? '');
    this.place(this.fit());
    this.bindDrag();
    this.bindResize();
  }

  get body() {
    return this.el.querySelector('.winBody');
  }

  build(html) {
    const el = document.createElement('div');
    el.className = 'win';
    el.id = `w-${this.id}`;
    el.innerHTML = `
      <div class="winBar" id="b-${this.id}">
        <div class="winTitle">${this.title}</div>
        <button class="wClose" data-act="win:stow" data-win="${this.id}" aria-label="close ${this.title}">✕</button>
      </div>
      <div class="winBody" id="wb-${this.id}">${html}</div>
      <div class="resH" id="r-${this.id}"></div>`;
    el.addEventListener('pointerdown', () => this.manager.focus(this.id));
    document.body.appendChild(el);
    return el;
  }

  fit() {
    const w = Math.min(this.baseWidth, window.innerWidth - MARGIN_X);
    const h = Math.min(this.baseHeight, window.innerHeight - MARGIN_Y);
    return {
      w,
      h,
      x: Math.max(16, (window.innerWidth - w) / 2),
      y: Math.max(60, (window.innerHeight - h) / 2),
    };
  }

  rect() {
    return { x: this.el.offsetLeft, y: this.el.offsetTop, w: this.el.offsetWidth, h: this.el.offsetHeight };
  }

  place({ x, y, w, h }) {
    const style = this.el.style;
    style.left = `${x}px`;
    style.top = `${y}px`;
    style.width = `${w}px`;
    style.height = `${h}px`;
  }

  glide(target) {
    this.el.classList.add('snapAnim');
    this.place(target);
    clearTimeout(this.glideTimer);
    this.glideTimer = setTimeout(() => this.el.classList.remove('snapAnim'), GLIDE_MS);
  }

  snapTo(zone) {
    if (!this.snapped) this.floating = this.rect();
    this.glide(this.manager.zoneRect(zone));
    this.snapped = true;
  }

  unsnap() {
    this.glide(this.floating ?? this.fit());
    this.snapped = false;
  }

  toggleSnap() {
    if (this.snapped) this.unsnap();
    else this.snapTo('top');
  }

  grabFromSnap(event) {
    const prev = this.floating ?? { w: this.baseWidth, h: this.baseHeight };
    const w = Math.min(prev.w, window.innerWidth - MARGIN_X);
    const h = Math.min(prev.h, window.innerHeight - MARGIN_Y);
    this.place({
      w,
      h,
      x: Math.max(0, Math.min(event.clientX - w / 2, window.innerWidth - w)),
      y: Math.max(0, event.clientY - GRAB_OFFSET),
    });
    this.snapped = false;
  }

  bindDrag() {
    const bar = this.el.querySelector('.winBar');
    let drag = null;
    let zone = null;

    bar.addEventListener('pointerdown', e => {
      if (e.button !== 0 || e.target.closest('.wClose')) return;
      this.manager.focus(this.id);
      if (this.snapped) this.grabFromSnap(e);
      drag = {
        fromX: e.clientX,
        fromY: e.clientY,
        offX: e.clientX - this.el.offsetLeft,
        offY: e.clientY - this.el.offsetTop,
        moved: false,
      };
      capture(bar, e.pointerId);
      e.preventDefault();
    });

    bar.addEventListener('pointermove', e => {
      if (!drag) return;
      if (!drag.moved && Math.hypot(e.clientX - drag.fromX, e.clientY - drag.fromY) < DRAG_SLOP) return;
      drag.moved = true;
      const w = this.el.offsetWidth;
      const h = this.el.offsetHeight;
      this.el.style.left = `${Math.max(0, Math.min(e.clientX - drag.offX, window.innerWidth - w))}px`;
      this.el.style.top = `${Math.max(0, Math.min(e.clientY - drag.offY, window.innerHeight - h - 50))}px`;
      zone = this.manager.zoneAt(e.clientX, e.clientY);
      this.manager.showGhost(zone);
    });

    const release = () => {
      if (!drag) return;
      const { moved } = drag;
      drag = null;
      this.manager.showGhost(null);
      if (moved && zone) this.snapTo(zone);
      else if (moved) this.floating = this.rect();
      zone = null;
    };

    bar.addEventListener('pointerup', release);
    bar.addEventListener('pointercancel', release);
    bar.addEventListener('dblclick', e => {
      if (!e.target.closest('.wClose')) this.toggleSnap();
    });
  }

  bindResize() {
    const handle = this.el.querySelector('.resH');
    let from = null;

    handle.addEventListener('pointerdown', e => {
      if (this.snapped) return;
      from = { x: e.clientX, y: e.clientY, w: this.el.offsetWidth, h: this.el.offsetHeight };
      capture(handle, e.pointerId);
      e.preventDefault();
      e.stopPropagation();
    });

    handle.addEventListener('pointermove', e => {
      if (!from) return;
      this.el.style.width = `${Math.max(MIN_W, from.w + e.clientX - from.x)}px`;
      this.el.style.height = `${Math.max(MIN_H, from.h + e.clientY - from.y)}px`;
    });

    const settle = () => {
      if (!from) return;
      from = null;
      this.floating = this.rect();
    };

    handle.addEventListener('pointerup', settle);
    handle.addEventListener('pointercancel', settle);
  }

  show() {
    this.place(this.fit());
    this.snapped = false;
    this.stowed = false;
    this.el.classList.remove('hidden');
    this.el.classList.add('opening');
    this.el.addEventListener('animationend', () => this.el.classList.remove('opening'), { once: true });
  }

  stow() {
    this.stowed = true;
    this.el.classList.add('hidden');
    this.el.classList.remove('focused');
  }

  destroy() {
    clearTimeout(this.glideTimer);
    this.el.remove();
  }
}

export class WindowManager {
  constructor() {
    this.windows = new Map();
    this.watchers = [];
    this.z = BASE_Z;
    this.meta = document.querySelector('meta[name="description"]');
    this.ghost = document.createElement('div');
    this.ghost.id = 'snapGhost';
    document.body.appendChild(this.ghost);
  }

  watch(fn) {
    this.watchers.push(fn);
    return this;
  }

  announce() {
    this.watchers.forEach(fn => fn(this));
  }

  list() {
    return [...this.windows.values()];
  }

  get(id) {
    return this.windows.get(id);
  }

  has(id) {
    return this.windows.has(id);
  }

  create(def) {
    this.windows.get(def.id)?.destroy();
    const win = new AppWindow(this, def);
    this.windows.set(def.id, win);
    this.focus(def.id);
    this.announce();
    return win;
  }

  focus(id) {
    const win = this.get(id);
    if (!win) return;
    if (++this.z > CEILING_Z) this.renormalize();
    win.el.style.zIndex = this.z;
    this.list().forEach(other => other.el.classList.toggle('focused', other === win));
    this.retitle(win);
  }

  renormalize() {
    this.z = BASE_Z;
    this.list()
      .sort((a, b) => (+a.el.style.zIndex || 0) - (+b.el.style.zIndex || 0))
      .forEach(win => { win.el.style.zIndex = ++this.z; });
    this.z++;
  }

  retitle(win) {
    if (win.tabTitle) document.title = win.tabTitle;
    if (this.meta && win.description) this.meta.setAttribute('content', win.description);
  }

  open(id) {
    const win = this.get(id);
    if (!win) return;
    win.show();
    this.focus(id);
    this.announce();
  }

  stow(id) {
    const win = this.get(id);
    if (!win) return;
    win.stow();
    this.announce();
  }

  toggle(id) {
    const win = this.get(id);
    if (!win) return;
    if (win.stowed) this.open(id);
    else if (win.el.classList.contains('focused')) this.stow(id);
    else this.focus(id);
  }

  zoneAt(x, y) {
    if (y <= EDGE) return 'top';
    if (window.innerWidth >= SPLIT_MIN_VW) {
      if (x <= EDGE) return 'left';
      if (x >= window.innerWidth - EDGE) return 'right';
    }
    return null;
  }

  zoneRect(zone) {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    if (zone === 'left') return { x: 8, y: 8, w: vw / 2 - 12, h: vh - 16 };
    if (zone === 'right') return { x: vw / 2 + 4, y: 8, w: vw / 2 - 12, h: vh - 16 };
    return { x: 8, y: 8, w: vw - 16, h: vh - 16 };
  }

  showGhost(zone) {
    if (!zone) {
      this.ghost.classList.remove('show');
      return;
    }
    const r = this.zoneRect(zone);
    this.ghost.style.left = `${r.x}px`;
    this.ghost.style.top = `${r.y}px`;
    this.ghost.style.width = `${r.w}px`;
    this.ghost.style.height = `${r.h}px`;
    this.ghost.classList.add('show');
  }
}
