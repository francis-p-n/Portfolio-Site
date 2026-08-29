export class Lightbox {
  constructor(root) {
    this.root = root;
    this.img = root.querySelector('img');
    root.addEventListener('click', e => {
      if (e.target !== this.img) this.close();
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') this.close();
    });
  }

  get isOpen() {
    return this.root.classList.contains('open');
  }

  open(src, alt = '') {
    if (!src) return;
    this.img.src = src;
    this.img.alt = alt;
    this.root.classList.add('open');
  }

  close() {
    this.root.classList.remove('open');
  }
}
