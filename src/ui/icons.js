const FALLBACK = new Map([
  ['theme-dark', '🌙'],
  ['theme-light', '☀️'],
  ['sfx-on', '🔊'],
  ['sfx-off', '🔇'],
]);

export class IconLoader {
  constructor(base = 'icons', preload = []) {
    this.base = base;
    this.preload = preload;
    this.cache = new Map();
    this.seq = 0;
  }

  async load(name) {
    if (this.cache.has(name)) return this.cache.get(name);
    let svg = null;
    try {
      const res = await fetch(`${this.base}/${name}.svg`);
      const text = res.ok ? await res.text() : '';
      if (text.trim().startsWith('<svg')) svg = text;
    } catch {
      svg = null;
    }
    this.cache.set(name, svg);
    return svg;
  }

  scope(svg) {
    const n = ++this.seq;
    return svg
      .replace(/id="([^"]+)"/g, (_, id) => `id="${id}-${n}"`)
      .replace(/url\(#([^)]+)\)/g, (_, id) => `url(#${id}-${n})`);
  }

  paint(slot, name, emoji = FALLBACK.get(name) ?? '') {
    if (!slot) return;
    slot.dataset.icon = name;
    const svg = this.cache.get(name);
    if (svg) {
      slot.innerHTML = this.scope(svg);
      slot.classList.add('hasIcon');
    } else {
      slot.textContent = emoji;
      slot.classList.remove('hasIcon');
    }
  }

  async hydrate(root = document) {
    const slots = [...root.querySelectorAll('[data-icon]')];
    const names = new Set([...slots.map(s => s.dataset.icon), ...this.preload]);
    await Promise.all([...names].map(name => this.load(name)));
    slots.forEach(slot => {
      const svg = this.cache.get(slot.dataset.icon);
      if (!svg) return;
      slot.innerHTML = this.scope(svg);
      slot.classList.add('hasIcon');
    });
  }
}
