const SETTLE_MS = 300;

export class Accordion {
  constructor() {
    this.timers = new WeakMap();
  }

  toggle(head) {
    const box = head.closest('.acc');
    if (!box) return;
    const body = box.querySelector('.accBody');
    const open = box.classList.toggle('open');
    head.setAttribute('aria-expanded', String(open));
    if (!body) return;

    body.style.height = `${body.getBoundingClientRect().height}px`;
    body.getBoundingClientRect();
    body.style.height = `${open ? body.scrollHeight : 0}px`;

    clearTimeout(this.timers.get(body));
    this.timers.set(body, setTimeout(() => {
      body.style.height = open ? 'auto' : '0px';
    }, SETTLE_MS));
  }
}
