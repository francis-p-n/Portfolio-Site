# Agent Context: Portfolio OS

Welcome! This file serves as the core developer handbook and context file for any AI agent onboarding into Francis's Portfolio OS repository.

---

## 🎯 Project Overview & Mission
Francis's Portfolio OS is a web-based portfolio resembling a classic desktop OS. Visitors can interact with applications (like reading blog articles, browsing projects, and adjusting themes) inside draggable, windowed interfaces. The site serves as a developer showcase and technical blog.

---

## 🛠️ Technology Stack
- **Frontend Core:** Vanilla HTML5, CSS3, ES6 JavaScript.
- **Bundler / Build System:** Vite (`package.json`).
- **Database:** Supabase (PostgreSQL) hosting articles and content.
- **Client Libraries:**
  - `marked` (Markdown parsing)
  - `dompurify` (HTML sanitization)
  - `@supabase/supabase-js` (database queries)
- **Containerization:** Docker (`Dockerfile`, Nginx server).

---

## 📁 Key Files & Directories
- [index.html](file:///c:/Users/MSI/Desktop/Projects/Portfolio%20Website/index.html): Main application shell and UI layout.
- [package.json](file:///c:/Users/MSI/Desktop/Projects/Portfolio%20Website/package.json): Node project manifest and dependencies.
- [supabase_setup.sql](file:///c:/Users/MSI/Desktop/Projects/Portfolio%20Website/supabase_setup.sql): Database table schema and row-level security policy creation script.
- [Dockerfile](file:///c:/Users/MSI/Desktop/Projects/Portfolio%20Website/Dockerfile): Static distribution server setup.
- [architecture.md](file:///c:/Users/MSI/Desktop/Projects/Portfolio%20Website/architecture.md): Visual diagrams and data flows.
- [todo.md](file:///c:/Users/MSI/Desktop/Projects/Portfolio%20Website/todo.md): Active issues, roadmap backlog, and completed items list.

---

## ⚡ Active Context
- **Current Development Focus:** Mobile touch gestures and interactive/custom workspace features.
- **Pending Tasks:** Implement swipe/touch gesture recognition for window dragging/resizing.

---

## 📜 Changelog / Recent Edits

### [2026-06-15]
- **Refactored:** Desktop dashboard inline styles in [index.html](file:///c:/Users/MSI/Desktop/Projects/Portfolio%20Website/index.html) to clean CSS classes with mobile media query adjustments.
- **Implemented:** Viewport-constrained window dimensions (`safeW`/`safeH`) and viewport centering logic to prevent window overflow on small screens.
- **Updated:** Synchronized project docs ([README.md](file:///c:/Users/MSI/Desktop/Projects/Portfolio%20Website/README.md), [architecture.md](file:///c:/Users/MSI/Desktop/Projects/Portfolio%20Website/architecture.md), [todo.md](file:///c:/Users/MSI/Desktop/Projects/Portfolio%20Website/todo.md), and [agent.md](file:///c:/Users/MSI/Desktop/Projects/Portfolio%20Website/agent.md)) using the `/autodocumentation` skill.
- **Added:** Initial [architecture.md](file:///c:/Users/MSI/Desktop/Projects/Portfolio%20Website/architecture.md) documentation outlining system components, database schemas, and data flow.
- **Added:** Initial [todo.md](file:///c:/Users/MSI/Desktop/Projects/Portfolio%20Website/todo.md) backlog tracking feature roadmap, responsive work, and DevOps goals.
- **Added:** Central [agent.md](file:///c:/Users/MSI/Desktop/Projects/Portfolio%20Website/agent.md) context file for onboarding agents.
- **Created:** Global `autodocumentation` skill in the Antigravity system configuration to automate repo-wide documentation updates.
