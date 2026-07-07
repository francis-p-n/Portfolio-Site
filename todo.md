# Portfolio OS Roadmap & Backlog

This checklist tracks the completed work, active focus, and future features for Francis's Portfolio OS.

---

## Active & Core Features
- [x] **Desktop OS Workspace:** Core window manager, draggable windows, desktop shortcuts, taskbar.
- [x] **Supabase Database Integration:** Articles table, client setup, and row level security policies.
- [x] **Markdown Engine:** On-the-fly parsing with `marked` and sanitization with `DOMPurify`.
- [x] **Docker Deployment:** Dockerfile container setup with Alpine Nginx.

## Planned Enhancements

### 📱 Responsiveness & UX
- [/] **Mobile Optimization:**
  - [x] Implement viewport-constrained window sizing and centering to fit small screens (`index.html`).
  - [x] Refactor inline desktop dashboard/avatar/grid styles to clean CSS classes with media query adjustments.
  - [ ] Implement swipe/touch guestures for window dragging/resizing.
- [ ] **Custom Desktop Backgrounds:** Allow users to upload or select custom wallpaper themes (stored in localStorage).
- [ ] **Window Snap System:** Implement simple window snapping to edges (split screen or maximize).

### 🛠️ Interactive Apps
- [ ] **Terminal Simulator:** Add a functional CLI app where users can run basic terminal commands (e.g. `help`, `cat articles/`, `theme`, `clear`).
- [ ] **Real-time Chat Widget:** A guestbook application powered by Supabase Realtime DB.
- [ ] **System Settings App:** A dedicated configurations app for switching visual themes, cursor styles, and sound options.

### 🚀 DevOps & CI/CD
- [ ] **GitHub Actions Workflow:** Automate building the Docker image and pushing it to a registry on release tag creation.
- [ ] **Vercel Deployments:** Validate bundling for static hosting.
