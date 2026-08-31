# Francis's Portfolio OS

An interactive portfolio and blog that behaves like a desktop operating system,
built in vanilla JavaScript with no framework. Every section is a real window:
draggable, resizable, snappable to the screen edges, and restorable from a dock.

Live at [fpn-portfolio.vercel.app](https://fpn-portfolio.vercel.app/).

## Features

- **Window manager** — pointer-event drag and resize (mouse and touch on one code
  path), edge snapping with a preview ghost, half-screen splits, double-click to
  maximise, z-order that renormalises instead of climbing forever.
- **One window registry** — `src/windows.js` exports `PAGES`; the windows, dock
  buttons, home shortcuts, tab titles and meta descriptions all derive from it.
  Adding a section is one object.
- **Delegated events** — a single `ActionBus` on `document` resolves
  `data-act="namespace:verb"` attributes to handlers. No inline `onclick`, no
  `window.*` globals, and windows created later are interactive for free.
- **Static content** — copy lives in `src/config.js`, posts as markdown in
  `src/articles-data.js`. No database and no runtime fetch.
- **Code splitting** — `marked` and both easter eggs load only when needed, so
  the entry chunk stays small.
- **Shareable articles** — every window has a hash route, and the build emits a
  static page per post at `/a/<slug>/` carrying its own preview tags and full
  text, so a single article can be sent to someone and unfurls properly.
- **Theming** — CSS custom properties, dark mode persisted to `localStorage`.
- **Two easter eggs** — a Dijkstra-scored pathfinding puzzle and a hand-built
  crossword, both hidden.

## Stack

Vanilla HTML/CSS/ES2022 · Vite · `marked` · Vercel · Docker (nginx)

## Running it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # bundle into dist/
npm run preview  # serve the bundle
```

Docker:

```bash
docker build -t portfolio-os .
docker run -p 8080:80 portfolio-os
```

## Making it yours

Edit `src/config.js` for copy and colours, `src/articles-data.js` for posts.
Everything else is structure. `agent.md` and `architecture.md` document the
internals.
