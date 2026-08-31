/* Deep links. Every window is addressable, so a single article — or any
   section — can be sent to someone and opened directly.

     #/                       home
     #/projects               a section window
     #/article/<slug>         one article

   The static share pages under /a/<slug>/ (emitted by the Vite build) carry
   the real link-preview tags and bounce visitors into the matching hash. */

const ARTICLE_WIN = 'art-';
const ARTICLE_ROUTE = 'article/';

export class Router {
  constructor(manager, { openArticle, homeId = 'home' }) {
    this.manager = manager;
    this.openArticle = openArticle;
    this.homeId = homeId;
    this.silent = false;
  }

  /* Window id -> the hash that reopens it. Anything unroutable (the easter
     eggs) returns null and simply leaves the address bar alone. */
  hashFor(id) {
    if (id === this.homeId) return '#/';
    if (id.startsWith(ARTICLE_WIN)) return `#/${ARTICLE_ROUTE}${id.slice(ARTICLE_WIN.length)}`;
    if (this.manager.has(id)) return `#/${id}`;
    return null;
  }

  /* Reflect the focused window in the address bar. Focus fires on every
     pointerdown, so this replaces rather than pushes — only explicit opens
     add a history entry worth going back through. */
  sync(id, push = false) {
    const hash = this.hashFor(id);
    if (!hash || hash === location.hash || (hash === '#/' && !location.hash)) return;
    this.silent = true;
    history[push ? 'pushState' : 'replaceState'](null, '', hash);
    this.silent = false;
  }

  clear() {
    if (!location.hash || location.hash === '#/') return;
    this.silent = true;
    history.replaceState(null, '', location.pathname + location.search);
    this.silent = false;
  }

  parse(hash) {
    const path = (hash || '').replace(/^#\/?/, '').replace(/\/$/, '');
    if (!path) return { kind: 'home' };
    if (path.startsWith(ARTICLE_ROUTE)) return { kind: 'article', id: path.slice(ARTICLE_ROUTE.length) };
    return { kind: 'window', id: path };
  }

  async apply() {
    const route = this.parse(location.hash);
    if (route.kind === 'article') {
      await this.openArticle(route.id);
      return;
    }
    if (route.kind === 'window' && this.manager.has(route.id)) {
      this.manager.open(route.id);
      return;
    }
    this.manager.focus(this.homeId);
  }

  start() {
    const onNav = () => { if (!this.silent) this.apply(); };
    window.addEventListener('popstate', onNav);
    window.addEventListener('hashchange', onNav);
    return this.apply();
  }

  /* The absolute link to hand someone — the static share page, which unfurls
     with the article's own title and description. */
  shareUrl(articleId) {
    return `${location.origin}/a/${articleId}`;
  }
}
