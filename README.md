# Francis's Portfolio OS

An interactive, desktop-OS themed personal portfolio and blog built with vanilla web technologies. It features a custom floating window manager, draggable application windows, and dynamic content rendering.

## 🚀 Features

- **OS-Style Window Manager:** Fully draggable and focusable windows that mimic a desktop environment, automatically centered and constrained to the client viewport boundaries.
- **Static Articles:** Posts live in `src/articles-data.js` as markdown and ship with the bundle — no database, no runtime fetch, nothing to fall over.
- **Markdown Rendering:** On-the-fly parsing (powered by `marked`) inside the OS windows; the parser is code-split and only loads when a post is opened.
- **Responsive & Fast:** Adaptive grid layouts, clean CSS styling with media queries, and optimized assets built using Vite.
- **Custom Theming:** CSS variables for easily tweaking the aesthetic, including colors and dark/light modes.

## 🛠️ Tech Stack

- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Build Tool:** Vite
- **Content:** Static ES modules (`src/config.js`, `src/articles-data.js`) — no backend
- **Libraries:** `marked` (Markdown parsing)
- **Deployment:** Vercel
