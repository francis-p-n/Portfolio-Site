const TARGETS = 'button, a, .pCard, .artFeat, .artRow, .accHd, .lBtn, .deskIcon';

export class SoundBoard {
  constructor({ hover, click, button, icons }) {
    this.hover = hover ? new Audio(hover) : null;
    this.click = click ? new Audio(click) : null;
    if (this.hover) this.hover.volume = 0.3;
    if (this.click) this.click.volume = 0.4;
    this.button = button;
    this.icons = icons;
    this.enabled = true;
    this.listen();
  }

  listen() {
    document.addEventListener('pointerover', e => {
      const el = e.target.closest?.(TARGETS);
      if (el && !el.contains(e.relatedTarget)) this.play(this.hover);
    });
    document.addEventListener('pointerdown', e => {
      if (e.target.closest?.(TARGETS)) this.play(this.click);
    });
  }

  play(clip) {
    if (!this.enabled || !clip) return;
    clip.currentTime = 0;
    clip.play().catch(() => {});
  }

  toggle() {
    this.enabled = !this.enabled;
    this.icons.paint(this.button?.firstElementChild, this.enabled ? 'sfx-on' : 'sfx-off');
    this.button?.setAttribute('aria-pressed', String(this.enabled));
  }
}
