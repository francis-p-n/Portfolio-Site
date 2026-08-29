# Portfolio OS — Roadmap

Checked items are verifiable in the repo. Anything not checked is not built yet.

---

## Done

- [x] **Window manager** — draggable, resizable, focusable windows with a dock.
- [x] **Edge snapping** — drag to the top edge to maximise, to a side for a half-screen split, double-click the title bar to toggle.
- [x] **Touch support** — drag and resize run on pointer events, so mouse and touch share one path.
- [x] **Window registry** — every window, dock button and home shortcut derives from `PAGES` in `src/windows.js`.
- [x] **Delegated events** — one `ActionBus` on `document`; no inline handlers and no `window.*` globals.
- [x] **Static articles** — markdown in `src/articles-data.js`, parsed by `marked` on first open.
- [x] **Code splitting** — `marked` and both easter eggs are dynamic imports.
- [x] **Dark mode** — CSS custom properties, choice persisted to `localStorage`.
- [x] **Hand-drawn icon set** — SVGs upgraded in place over an emoji fallback.
- [x] **Pathfinder easter egg** — random weighted graph, Dijkstra-scored, streak tracked.
- [x] **Crossword easter egg** — hand-built grid, check / reveal word / reveal all.
- [x] **Docker image** — two-stage build, nginx serves `dist/`.
- [x] **CI** — `.github/workflows/build.yml` runs `npm ci && npm run build` on every push and PR.

## Next

- [ ] **Swipe gestures** — pointer drag works on touch, but there is no flick-to-dismiss or pinch-to-resize.
- [ ] **Résumé download** — a PDF in the links window; recruiters look for it first and it is not there.
- [ ] **Deep links** — `?window=projects` so a shared URL opens on the right window.
- [ ] **Finish the two drafts** — `preparation-execution` and `pentecost-a-modern-reality` in `src/articles-data.js` have descriptions but no body.
- [ ] **Custom wallpapers** — pick or upload a background, stored in `localStorage`.
- [ ] **Terminal app** — a small CLI window (`help`, `ls articles`, `theme`, `clear`).
- [ ] **System settings app** — one window for theme, cursor and sound instead of the two top-left buttons.

## Not planned

- **Guestbook** — needs a backend; the site is deliberately static.
