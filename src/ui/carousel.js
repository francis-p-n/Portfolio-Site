export class Carousel {
  constructor(root) {
    this.root = root;
    this.track = root.querySelector('.carTrack');
    this.dots = [...root.querySelectorAll('.carDot')];
    this.index = 0;
    this.go(0);
  }

  get count() {
    return this.track ? this.track.children.length : 0;
  }

  go(index) {
    if (!this.count) return;
    this.index = (index + this.count) % this.count;
    this.track.style.transform = `translateX(-${this.index * 100}%)`;
    this.dots.forEach((dot, n) => dot.classList.toggle('carDotOn', n === this.index));
  }

  step(delta) {
    this.go(this.index + delta);
  }
}
