import { CFG } from './config.js';
import { PAGES, HOME_SHORTCUTS } from './windows.js';
import { openArticleWindow } from './articles.js';
import { ActionBus } from './ui/actions.js';
import { Accordion } from './ui/accordion.js';
import { Carousel } from './ui/carousel.js';
import { Dock } from './ui/dock.js';
import { IconLoader } from './ui/icons.js';
import { Lightbox } from './ui/lightbox.js';
import { SoundBoard } from './ui/sound.js';
import { Theme } from './ui/theme.js';
import { WindowManager } from './ui/window-manager.js';
import { Router } from './ui/router.js';

/* execCommand is the fallback for browsers that refuse the async clipboard on
   an insecure origin or without a permission grant. */
async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    /* fall through */
  }
  const field = document.createElement('textarea');
  field.value = text;
  field.setAttribute('readonly', '');
  field.style.cssText = 'position:fixed;top:-1000px;opacity:0';
  document.body.appendChild(field);
  field.select();
  let ok = false;
  try {
    ok = document.execCommand('copy');
  } catch {
    ok = false;
  }
  field.remove();
  return ok;
}

const POKES_TO_UNLOCK = 5;
const POKE_DECAY_MS = 1400;

class PortfolioOS {
  constructor() {
    this.icons = new IconLoader('icons', ['theme-light', 'sfx-off']);
    this.theme = new Theme(document.getElementById('themeBtn'), this.icons);
    this.sound = new SoundBoard({
      hover: CFG.sfxHover,
      click: CFG.sfxClick,
      button: document.getElementById('sfxBtn'),
      icons: this.icons,
    });
    this.manager = new WindowManager();
    this.router = new Router(this.manager, { openArticle: id => this.openArticle(id) });
    this.lightbox = new Lightbox(document.getElementById('lb'));
    this.accordion = new Accordion();
    this.actions = new ActionBus();
    this.carousels = new WeakMap();
    this.pokes = 0;
    this.pokeTimer = 0;
  }

  boot() {
    this.theme.apply();
    document.getElementById('pgTitle').textContent = CFG.desktopTitle;
    this.wireActions();
    this.openDesktop();
    this.dock = new Dock(this.manager, PAGES);
    /* Only now — the desktop opens every window on boot, and each focus would
       otherwise overwrite the incoming deep link before we could read it. */
    this.manager.onRoute = id => (id ? this.router.sync(id) : this.router.clear());
    this.router.start();
    this.mountCarousels(document);
    this.icons.hydrate();
    document.getElementById('loader').classList.add('done');
  }

  wireActions() {
    const wm = this.manager;
    this.actions
      .on('win:open', data => wm.open(data.win))
      .on('win:stow', data => wm.stow(data.win))
      .on('win:toggle', data => wm.toggle(data.win))
      .on('theme:toggle', () => this.theme.toggle())
      .on('sfx:toggle', () => this.sound.toggle())
      .on('acc:toggle', (data, el) => this.accordion.toggle(el))
      .on('lightbox:open', data => this.lightbox.open(data.src, data.alt))
      .on('carousel:go', (data, el) => this.carouselFor(el)?.go(Number(data.index)))
      .on('carousel:step', (data, el) => this.carouselFor(el)?.step(Number(data.step)))
      .on('article:open', data => this.openArticle(data.article, true))
      .on('article:share', (data, el) => this.shareArticle(data.article, el))
      .on('avatar:poke', () => this.poke())
      .on('puzzle:open', () => this.openCrossword())
      .on('game:open', () => this.openPathfinder());
  }

  /* Opens the article and, for a click rather than a deep link, leaves a
     history entry so the back button returns to the list. */
  async openArticle(id, push = false) {
    const opened = await openArticleWindow(this.manager, id);
    if (!opened) {
      this.manager.open('articles');
      return false;
    }
    this.router.sync(`art-${id}`, push);
    return true;
  }

  async shareArticle(id, el) {
    const url = this.router.shareUrl(id);
    const done = await copyText(url);
    el.textContent = done ? 'link copied' : url;
    el.classList.toggle('artShareOk', done);
    clearTimeout(this.shareTimer);
    this.shareTimer = setTimeout(() => {
      el.textContent = 'copy link';
      el.classList.remove('artShareOk');
    }, done ? 1800 : 6000);
  }

  openDesktop() {
    for (const page of PAGES) {
      this.manager.create({ ...page, html: page.render(HOME_SHORTCUTS) });
      if (page.id !== 'home') this.manager.stow(page.id);
    }
    this.manager.focus('home');
  }

  mountCarousels(root) {
    root.querySelectorAll('[data-carousel]').forEach(el => {
      this.carousels.set(el, new Carousel(el));
    });
  }

  carouselFor(el) {
    return this.carousels.get(el.closest('[data-carousel]'));
  }

  poke() {
    const avi = document.querySelector('#wb-about .avi');
    if (avi) {
      avi.classList.remove('aviPoke');
      void avi.offsetWidth;
      avi.classList.add('aviPoke');
    }
    clearTimeout(this.pokeTimer);
    this.pokeTimer = setTimeout(() => { this.pokes = 0; }, POKE_DECAY_MS);
    if (++this.pokes < POKES_TO_UNLOCK) return;
    this.pokes = 0;
    this.openPathfinder();
  }

  async openPathfinder() {
    try {
      const { Pathfinder } = await import('./game.js');
      if (this.manager.has(Pathfinder.meta.id)) {
        this.manager.open(Pathfinder.meta.id);
        return;
      }
      new Pathfinder(this.manager).open();
    } catch (err) {
      console.error('pathfinder failed to load', err);
    }
  }

  async openCrossword() {
    try {
      const { Crossword } = await import('./crossword.js');
      new Crossword(this.manager).open();
    } catch (err) {
      console.error('crossword failed to load', err);
    }
  }
}

new PortfolioOS().boot();
