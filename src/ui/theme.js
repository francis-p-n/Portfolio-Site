import { CFG } from '../config.js';

const KEY = 'theme';

const PALETTE = {
  light: { acc: CFG.accent, desk: CFG.desktopBg, winBg: CFG.winBg, deskWave: '#bae6fd' },
  dark: { acc: CFG.accentDk, desk: CFG.desktopBgDk, winBg: CFG.winBgDk, deskWave: '#1e293b' },
};

function remember(mode) {
  try {
    localStorage.setItem(KEY, mode);
  } catch {
  }
}

function recall() {
  try {
    return localStorage.getItem(KEY) === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

export class Theme {
  constructor(button, icons) {
    this.button = button;
    this.icons = icons;
    this.mode = recall();
  }

  apply(mode = this.mode) {
    this.mode = PALETTE[mode] ? mode : 'light';
    const root = document.documentElement;
    root.setAttribute('data-theme', this.mode);
    for (const [name, value] of Object.entries(PALETTE[this.mode])) {
      root.style.setProperty(`--${name}`, value);
    }
    this.icons.paint(this.button?.firstElementChild, this.mode === 'dark' ? 'theme-light' : 'theme-dark');
    remember(this.mode);
  }

  toggle() {
    this.apply(this.mode === 'dark' ? 'light' : 'dark');
  }
}
