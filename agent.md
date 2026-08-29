# Agent Context: Portfolio OS

Developer handbook for this repository. Read this before changing anything.

---

## What this is

A personal portfolio and blog that presents itself as a desktop OS. Every section
— about, articles, projects, links, faq, contact — is a draggable, snappable
window on a wallpaper, with a dock along the bottom. It is a static site: there
is no backend, no database, and nothing is fetched at runtime except the icon
SVGs and the markdown parser.

---

## Stack

- Vanilla HTML5, CSS3 and ES2022 modules. No framework.
- Vite for the dev server and the production bundle.
- `marked` for markdown, dynamically imported the first time an article is opened.
- Deployed to Vercel. `Dockerfile` builds the same `dist/` and serves it from nginx.

---

## Layout

```
index.html            page shell — loader, wallpaper, lightbox, footer
public/styles.css     the entire stylesheet
src/app.js            PortfolioOS: boots everything and wires the action bus
src/windows.js        PAGES — the one list every window, dock button and home shortcut derives from
src/views.js          pure functions returning the HTML for each window body
src/config.js         all site copy: bio, skills, projects, career, faq, links, colours
src/articles-data.js  articles as markdown; exports PUBLISHED (drafts filtered, newest first)
src/articles.js       article list rendering and the article reader window
src/game.js           pathfinder easter egg (Graph / Puzzle / Pathfinder), lazily imported
src/crossword.js      theology crossword easter egg (Crossword), lazily imported
src/ui/               window-manager, dock, actions, icons, theme, sound, accordion, carousel, lightbox
src/util/html.js      escaping and date formatting
```

---

## Conventions

- **No inline handlers.** Interactive elements carry `data-act="namespace:verb"`;
  `ActionBus` delegates from `document` to a handler registered in `PortfolioOS.wireActions`.
- **No globals.** Nothing is hung off `window`.
- **One source of truth per concept.** Adding a window means adding one entry to
  `PAGES` in `src/windows.js` — the dock button, home shortcut, tab title and
  meta description all follow from it.
- **Content lives in `src/config.js` and `src/articles-data.js`**, never in the views.
- **Easter eggs stay lazy.** `game.js` and `crossword.js` are dynamic imports and
  must not be referenced statically, or they land in the main bundle.

---

## Easter eggs

- Five pokes at the pen avatar in the about window opens **pathfinder**: a random
  weighted graph where you click from S to E and try to match Dijkstra.
- The word "thoughts" in the articles window opens the **crossword**.

---

## Commands

```
npm run dev       vite dev server on :5173
npm run build     production bundle into dist/
npm run preview   serve the built bundle
```
