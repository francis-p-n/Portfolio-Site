export class Dock {
  constructor(manager, entries) {
    this.manager = manager;
    this.el = document.createElement('div');
    this.el.id = 'dock';
    this.el.setAttribute('role', 'toolbar');
    this.el.setAttribute('aria-label', 'open windows');
    this.el.innerHTML = entries.map(entry => `
      <button class="dockBtn" id="dk-${entry.id}" title="${entry.title}" aria-label="${entry.title}"
              data-act="win:toggle" data-win="${entry.id}">
        <span class="dockGlyph" data-icon="${entry.id}">${entry.icon}</span>
        <span class="dockDot"></span>
      </button>`).join('');
    document.body.appendChild(this.el);
    manager.watch(() => this.sync());
    this.sync();
  }

  sync() {
    for (const win of this.manager.list()) {
      const btn = this.el.querySelector(`[data-win="${win.id}"]`);
      if (!btn) continue;
      btn.classList.toggle('dockOpen', !win.stowed);
      btn.setAttribute('aria-pressed', String(!win.stowed));
    }
  }
}
