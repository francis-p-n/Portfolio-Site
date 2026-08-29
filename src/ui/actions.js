export class ActionBus {
  constructor(root = document) {
    this.handlers = new Map();
    root.addEventListener('click', e => this.dispatch(e));
    root.addEventListener('keydown', e => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const el = e.target.closest?.('[data-act]');
      if (!el || el.tagName === 'BUTTON' || el.tagName === 'A') return;
      e.preventDefault();
      this.dispatch(e);
    });
  }

  on(name, handler) {
    this.handlers.set(name, handler);
    return this;
  }

  dispatch(event) {
    const el = event.target.closest?.('[data-act]');
    if (!el) return;
    const handler = this.handlers.get(el.dataset.act);
    if (handler) handler(el.dataset, el, event);
  }
}
