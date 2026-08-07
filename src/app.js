import { CFG } from './config.js';

/* Articles pull in supabase/marked/dompurify — load them lazily so they
   stay off the critical path. The import fires once, after first paint. */
let articlesModPromise = null;
function loadArticlesMod() {
  if (!articlesModPromise) articlesModPromise = import('./articles.js');
  return articlesModPromise;
}
/* ── apply CFG colors ──────────────────────────────── */
/* Updating CSS root vars to apply the user's CFG colors */
document.documentElement.style.setProperty('--acc', CFG.accent);
document.documentElement.style.setProperty('--desk', CFG.desktopBg);
document.documentElement.style.setProperty('--winBg', CFG.winBg);

/* ── theme ─────────────────────────────────────────── */
const themeBtn = document.getElementById('themeBtn');
let isDark = localStorage.getItem('theme') === 'dark';
function setTheme(dark) {
  isDark = dark;
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  document.documentElement.style.setProperty('--acc', dark ? CFG.accentDk : CFG.accent);
  document.documentElement.style.setProperty('--desk', dark ? CFG.desktopBgDk : CFG.desktopBg);
  document.documentElement.style.setProperty('--winBg', dark ? CFG.winBgDk : CFG.winBg);
  document.documentElement.style.setProperty('--deskWave', dark ? '#1e293b' : '#bae6fd');
  paintIcon(themeBtn.firstElementChild, dark ? 'theme-light' : 'theme-dark', dark ? '☀️' : '🌙');
  localStorage.setItem('theme', dark ? 'dark' : 'light');
}
themeBtn.onclick = () => setTheme(!isDark);
if (isDark) setTheme(true);

/* ── sound engine ──────────────────────────────────── */
let sfxEnabled = true;
let sfxUnlocked = false; // Strictly required because of Chrome Autoplay rules!

/* Only build Audio objects for configured files — an empty src resolves
   to the page URL and fails loudly on every hover */
const sndHover = CFG.sfxHover ? new Audio(CFG.sfxHover) : null;
const sndClick = CFG.sfxClick ? new Audio(CFG.sfxClick) : null;
if (sndHover) sndHover.volume = 0.3;
if (sndClick) sndClick.volume = 0.4;

const sfxBtn = document.getElementById('sfxBtn');
sfxBtn.onclick = () => {
  sfxEnabled = !sfxEnabled;
  paintIcon(sfxBtn.firstElementChild, sfxEnabled ? 'sfx-on' : 'sfx-off', sfxEnabled ? '🔊' : '🔇');
};

function playSnd(audio) {
  if (!sfxEnabled || !audio) return;

  // If the browser hasn't allowed audio yet, we'll try to unlock it now
  if (!sfxUnlocked) {
    sfxUnlocked = true;
  }

  audio.currentTime = 0;
  audio.play().catch(err => {
    console.warn("SFX playback failed:", err);
  });
}

// Attempt to unlock audio strictly after user's FIRST global interaction over the dom
document.body.addEventListener('click', () => { sfxUnlocked = true; }, { once: true });
document.body.addEventListener('keydown', () => { sfxUnlocked = true; }, { once: true });

// Auto-bind sound effects to every interactive button/link!
function bindSfx() {
  // Find all custom buttons, icons, window close buttons, and anchor links
  const interactives = document.querySelectorAll('button, .pCard, a, .wClose, .topBtn, .fQ, .lBtn');
  interactives.forEach(el => {
    el.addEventListener('mouseenter', () => playSnd(sndHover));
    el.addEventListener('mousedown', () => playSnd(sndClick));
  });
}

/* ── window manager ─────────────────────────────────── */
let topZ = 20;
const winMap = {};

/* mkWin function mimics how Sharyap windows are built and rendered */
function mkWin(id, title, icon, w, h, x, y, html) {
  /* Re-created windows (e.g. reopening an article) replace their stale copy */
  if (winMap[id]) winMap[id].el.remove();
  const el = document.createElement('div');
  el.className = 'win';
  el.id = 'w-' + id;

  /* Center windows and constrain to viewport */
  const safeW = Math.min(w, window.innerWidth - 32);
  const safeH = Math.min(h, window.innerHeight - 80);
  const cx = Math.max(16, (window.innerWidth - safeW) / 2);
  const cy = Math.max(60, (window.innerHeight - safeH) / 2);
  el.style.cssText = `width:${safeW}px;height:${safeH}px;left:${cx}px;top:${cy}px`;

  el.innerHTML = `
    <div class="winBar" id="b-${id}">
      <div class="winTitle">${title}</div>
      <button class="wClose" onclick="closeWin('${id}')">✕</button>
    </div>
    <div class="winBody" id="wb-${id}">${html}</div>
    <div class="resH" id="r-${id}"></div>`;

  document.body.appendChild(el);
  winMap[id] = { el, title, icon, w: safeW, h: safeH, origW: w, origH: h, minned: false, maxed: false, prev: null };
  el.addEventListener('mousedown', () => focusWin(id));
  initDrag(id);
  initRes(id);
  focusWin(id);
}

/* Manages which window is floating on top */
function focusWin(id) {
  topZ++;
  /* Keep windows below the fixed top controls (z-index 500) by
     renormalizing the stack before it climbs that high */
  if (topZ > 450) {
    topZ = 20;
    Object.values(winMap)
      .sort((a, b) => (+a.el.style.zIndex || 0) - (+b.el.style.zIndex || 0))
      .forEach(w => { w.el.style.zIndex = ++topZ; });
    topZ++;
  }
  winMap[id].el.style.zIndex = topZ;
  winMap[id].el.classList.add('focused');
  Object.keys(winMap).forEach(k => { if (k !== id) winMap[k].el.classList.remove('focused'); });
}

/* Completely hides a window returning user to the desktop (like Sharyap modal closes) */
function closeWin(id) {
  winMap[id].el.classList.add('hidden');
  /* A put-away window must not stay 'focused', or the dock's toggle
     would need two clicks to bring it back */
  winMap[id].el.classList.remove('focused');
  winMap[id].minned = true;
  syncDock();
}

/* ── hand-drawn icons ───────────────────────────────── */
/* Every glyph ships as an emoji and is upgraded in place to the matching
   SVG in /icons if that file exists. Missing or malformed files simply
   leave the emoji alone, so the nav can never render empty. */
const iconCache = {};

async function fetchIcon(name) {
  if (name in iconCache) return iconCache[name];
  try {
    const res = await fetch(`icons/${name}.svg`);
    /* A missing file on the dev server comes back as the SPA's index.html */
    const txt = res.ok ? await res.text() : '';
    iconCache[name] = txt.trim().startsWith('<svg') ? txt : null;
  } catch {
    iconCache[name] = null;
  }
  return iconCache[name];
}

/* The toggles swap between two icons, so both states are preloaded even
   though only one of each is in the DOM at hydration time */
const EXTRA_ICONS = ['theme-light', 'sfx-off'];

/* The same icon can be on screen twice (nav and dock), so every injection
   gets its own ids — duplicate ids are invalid and make clip-path
   references resolve to whichever copy happens to be first in the document */
let iconSeq = 0;
function uniquifyIds(svg) {
  const n = ++iconSeq;
  return svg
    .replace(/id="([^"]+)"/g, (_, id) => `id="${id}-${n}"`)
    .replace(/url\(#([^)]+)\)/g, (_, id) => `url(#${id}-${n})`);
}

/* Paints one slot: the SVG if we have it, otherwise the emoji it falls back to */
function paintIcon(el, name, emoji) {
  if (!el) return;
  el.dataset.icon = name;
  const svg = iconCache[name];
  if (svg) {
    el.innerHTML = uniquifyIds(svg);
    el.classList.add('hasIcon');
  } else {
    el.textContent = emoji;
    el.classList.remove('hasIcon');
  }
}

async function hydrateIcons() {
  const slots = [...document.querySelectorAll('[data-icon]')];
  const names = [...new Set([...slots.map(s => s.dataset.icon), ...EXTRA_ICONS])];
  await Promise.all(names.map(fetchIcon));
  slots.forEach(slot => {
    const svg = iconCache[slot.dataset.icon];
    if (!svg) return;
    slot.innerHTML = uniquifyIds(svg);
    slot.classList.add('hasIcon');
  });
}

/* ── dock ───────────────────────────────────────────── */
/* A closed window isn't gone, it's just put away — the dock is where it
   lives in the meantime, and how you get it back. */
function mkDock(defs) {
  const dock = document.createElement('div');
  dock.id = 'dock';
  dock.innerHTML = defs.map(d => `
        <button class="dockBtn" id="dk-${d.id}" title="${d.title}" aria-label="${d.title}" onclick="toggleWin('${d.id}')">
          <span class="dockGlyph" data-icon="${d.id}">${d.icon}</span>
          <span class="dockDot"></span>
        </button>`).join('');
  document.body.appendChild(dock);
  syncDock();
}

/* Lit dot = window is open somewhere on the desktop */
function syncDock() {
  Object.keys(winMap).forEach(id => {
    const btn = document.getElementById('dk-' + id);
    if (btn) btn.classList.toggle('dockOpen', !winMap[id].minned);
  });
}

/* Dock click: restore if put away, put away if already focused, else raise */
function toggleWin(id) {
  const w = winMap[id];
  if (!w) return;
  if (w.minned) openWin(id);
  else if (w.el.classList.contains('focused')) closeWin(id);
  else focusWin(id);
}

function openWin(id) {
  if (winMap[id]) {
    // Re-calculate safe dimensions in case window was resized
    const safeW = Math.min(winMap[id].origW || winMap[id].w, window.innerWidth - 32);
    const safeH = Math.min(winMap[id].origH || winMap[id].h, window.innerHeight - 80);
    const cx = Math.max(16, (window.innerWidth - safeW) / 2);
    const cy = Math.max(60, (window.innerHeight - safeH) / 2);

    winMap[id].w = safeW;
    winMap[id].h = safeH;
    winMap[id].maxed = false;
    winMap[id].el.style.width = safeW + 'px';
    winMap[id].el.style.height = safeH + 'px';
    winMap[id].el.style.left = cx + 'px';
    winMap[id].el.style.top = cy + 'px';

    winMap[id].el.classList.remove('hidden');
    winMap[id].el.classList.add('opening');
    winMap[id].el.addEventListener('animationend', () => winMap[id].el.classList.remove('opening'), { once: true });
    winMap[id].minned = false;
    focusWin(id);
    syncDock();
  }
}

/* ── window snapping ────────────────────────────────── */
const SNAP_EDGE = 24; /* px from a screen edge that arms a snap */
const snapGhost = document.createElement('div');
snapGhost.id = 'snapGhost';
document.body.appendChild(snapGhost);

function snapZone(x, y) {
  if (y <= SNAP_EDGE) return 'top';
  /* Half-screen splits only make sense on wider viewports */
  if (window.innerWidth >= 700) {
    if (x <= SNAP_EDGE) return 'left';
    if (x >= window.innerWidth - SNAP_EDGE) return 'right';
  }
  return null;
}

function snapRect(zone) {
  const vw = window.innerWidth, vh = window.innerHeight;
  if (zone === 'left') return { x: 8, y: 8, w: vw / 2 - 12, h: vh - 16 };
  if (zone === 'right') return { x: vw / 2 + 4, y: 8, w: vw / 2 - 12, h: vh - 16 };
  return { x: 8, y: 8, w: vw - 16, h: vh - 16 }; /* top = maximize */
}

function showGhost(zone) {
  if (!zone) { snapGhost.classList.remove('show'); return; }
  const r = snapRect(zone);
  snapGhost.style.left = r.x + 'px';
  snapGhost.style.top = r.y + 'px';
  snapGhost.style.width = r.w + 'px';
  snapGhost.style.height = r.h + 'px';
  snapGhost.classList.add('show');
}

function animateTo(el, r) {
  el.classList.add('snapAnim');
  el.style.left = r.x + 'px'; el.style.top = r.y + 'px';
  el.style.width = r.w + 'px'; el.style.height = r.h + 'px';
  setTimeout(() => el.classList.remove('snapAnim'), 200);
}

function applySnap(id, zone) {
  const win = winMap[id], el = win.el;
  /* Remember the floating geometry so restore/unsnap can return to it */
  if (!win.maxed) win.prev = { x: el.offsetLeft, y: el.offsetTop, w: el.offsetWidth, h: el.offsetHeight };
  animateTo(el, snapRect(zone));
  win.maxed = true;
}

function restoreWin(id) {
  const win = winMap[id];
  const p = win.prev || { x: 60, y: 60, w: win.origW, h: win.origH };
  animateTo(win.el, p);
  win.maxed = false;
}

function toggleMax(id) {
  winMap[id].maxed ? restoreWin(id) : applySnap(id, 'top');
}

/* ── drag (pointer events cover mouse AND touch) ────── */
function initDrag(id) {
  const bar = document.getElementById('b-' + id);
  const el = winMap[id].el;
  let dragging = false, moved = false, dx = 0, dy = 0, startX = 0, startY = 0, zone = null;

  bar.addEventListener('pointerdown', e => {
    if (e.button !== 0 || e.target.closest('.wClose')) return;
    focusWin(id);
    /* Grabbing a snapped window pops it back to floating size under the pointer */
    if (winMap[id].maxed) {
      const p = winMap[id].prev || { w: winMap[id].origW, h: winMap[id].origH };
      const w = Math.min(p.w, window.innerWidth - 32);
      const h = Math.min(p.h, window.innerHeight - 80);
      el.style.width = w + 'px';
      el.style.height = h + 'px';
      el.style.left = Math.max(0, Math.min(e.clientX - w / 2, window.innerWidth - w)) + 'px';
      el.style.top = Math.max(0, e.clientY - 21) + 'px';
      winMap[id].maxed = false;
      winMap[id].w = w; winMap[id].h = h;
    }
    dragging = true; moved = false;
    startX = e.clientX; startY = e.clientY;
    dx = e.clientX - el.offsetLeft; dy = e.clientY - el.offsetTop;
    /* Capture keeps the drag alive even when the pointer outruns the bar.
       Synthetic events (tests) have no active pointer, hence the guard. */
    try { bar.setPointerCapture(e.pointerId); } catch (err) { }
    e.preventDefault();
  });

  bar.addEventListener('pointermove', e => {
    if (!dragging) return;
    /* Ignore sub-6px jitters so plain clicks near an edge never snap */
    if (!moved && Math.hypot(e.clientX - startX, e.clientY - startY) < 6) return;
    moved = true;
    let nx = e.clientX - dx, ny = e.clientY - dy;
    nx = Math.max(0, Math.min(nx, window.innerWidth - el.offsetWidth));
    ny = Math.max(0, Math.min(ny, window.innerHeight - el.offsetHeight - 50));
    el.style.left = nx + 'px'; el.style.top = ny + 'px';
    zone = snapZone(e.clientX, e.clientY);
    showGhost(zone);
  });

  const endDrag = () => {
    if (!dragging) return;
    dragging = false;
    showGhost(null);
    if (moved && zone) applySnap(id, zone);
    zone = null;
  };
  bar.addEventListener('pointerup', endDrag);
  bar.addEventListener('pointercancel', endDrag);

  /* Classic OS gesture: double-click the title bar to maximize/restore */
  bar.addEventListener('dblclick', e => {
    if (e.target.closest('.wClose')) return;
    toggleMax(id);
  });
}

/* ── resize (pointer events cover mouse AND touch) ──── */
function initRes(id) {
  const rh = document.getElementById('r-' + id);
  const el = winMap[id].el;
  let resizing = false, sx = 0, sy = 0, sw = 0, sh = 0;

  rh.addEventListener('pointerdown', e => {
    if (winMap[id].maxed) return;
    resizing = true; sx = e.clientX; sy = e.clientY;
    sw = el.offsetWidth; sh = el.offsetHeight;
    try { rh.setPointerCapture(e.pointerId); } catch (err) { }
    e.preventDefault(); e.stopPropagation();
  });

  rh.addEventListener('pointermove', e => {
    if (!resizing) return;
    el.style.width = Math.max(240, sw + e.clientX - sx) + 'px';
    el.style.height = Math.max(140, sh + e.clientY - sy) + 'px';
  });

  const endRes = () => {
    if (!resizing) return;
    resizing = false;
    const b = el.getBoundingClientRect();
    winMap[id].w = b.width;
    winMap[id].h = b.height;
  };
  rh.addEventListener('pointerup', endRes);
  rh.addEventListener('pointercancel', endRes);
}

/* ── lightbox ───────────────────────────────────────── */
function openLb(src) {
  if (!src) return;
  document.getElementById('lbImg').src = src;
  document.getElementById('lb').classList.add('open');
}
function closeLb(e) {
  if (!e || e.target !== document.getElementById('lbImg'))
    document.getElementById('lb').classList.remove('open');
}

/* ── FAQ toggle ─────────────────────────────────────── */
function tglFaq(i) {
  const btns = document.querySelectorAll('.fQ');
  const ans = document.querySelectorAll('.fA');
  const isOpen = btns[i]?.classList.contains('open');
  btns.forEach(b => b.classList.remove('open'));
  ans.forEach(a => a.classList.remove('open'));
  if (!isOpen && btns[i]) { btns[i].classList.add('open'); ans[i].classList.add('open'); }
}

/* ── HTML builders ──────────────────────────────────── */
function avHtml() {
  return CFG.avatar
    ? `<img src="${CFG.avatar}" alt="${CFG.name}"/>`
    : CFG.avatarEmoji;
}

/* ── Sharyap Home Screen UI omitted as a window, and will be rendered onto the desktop instead! ── */

/* The landing view is itself a window — the desktop underneath stays empty
   wallpaper, so the whole site reads as one OS rather than a page with popups. */
const HOME_NAV = [
  ['about', '👤'], ['articles', '📰'], ['projects', '🎨'],
  ['links', '🔗'], ['faq', '❓', 'working with me'], ['contact', '✉️'],
];

function bHome() {
  const navBtns = HOME_NAV.map(([id, ico, label = id]) => `
        <button class="deskIcon" onclick="openWin('${id}')">
          <span class="deskIcoGlyph" data-icon="${id}">${ico}</span>
          <span class="deskIcoLbl">${label}</span>
        </button>`).join('');
  return `
    <div class="deskCenter">
      ${CFG.avatar ? `<img src="${CFG.avatar}" class="deskAvatar"/>` : `<div class="deskEmoji">${CFG.avatarEmoji}</div>`}
      <h1 class="deskTitle">hi! i'm <span style="color:var(--acc); text-transform:lowercase">${CFG.name}</span></h1>
      <p class="deskSub">${CFG.tagline}</p>
      <div class="deskGrid">${navBtns}</div>
    </div>`;
}

function bAbout() {
  const intPool = CFG.interests || [];
  const lngPool = CFG.langs || [];
  const int = intPool.map(i => `<span class="tag">${i}</span>`).join('');
  const lng = lngPool.map(l => `<span class="tag">${l}</span>`).join('');
  return `
    <div style="display:flex;gap:12px;align-items:flex-start;margin-bottom:13px">
      <div class="avi">${avHtml()}</div>
      <div>
        <div class="bigN" style="font-size:1.35rem">${CFG.name}</div>
        ${CFG.nameKanji ? `<div style="font-size:.78rem;color:var(--txt2);font-weight:700">${CFG.nameKanji}</div>` : ''}
        <div class="subT">${CFG.tagline}</div>
        <div style="font-size:.74rem;color:var(--txt2)">${CFG.location}</div>
      </div>
    </div>
    <span class="sl">about</span>
    <p class="bioP" id="abBio"></p>
    <hr/>
    <span class="sl">education</span>
    <p style="font-size:.82rem;font-weight:700;color:var(--txt)">${CFG.edu}</p>
    <p style="font-size:.74rem;color:var(--acc);font-weight:700">${CFG.eduNote}</p>
    <hr/>
    <span class="sl">other interests</span>
    <div class="tagRow">${int}</div>
    <hr/>
    <span class="sl">language proficiency</span>
    <div class="tagRow">${lng}</div>`;
}

function bLinks() {
  const linksPool = CFG.links || [];
  const active = linksPool.filter(l => l.url);
  return `<span class="sl">find me online</span>
    <div class="lGrid">
      ${active.map(l => `<a class="lBtn" href="${l.url}" target="_blank" rel="noopener"><span class="lIco">${l.emoji}</span>${l.label}</a>`).join('')}
    </div>
    <p style="font-size:.68rem;color:var(--txt2);margin-top:12px">clicking any link opens a new tab ✦</p>`;
}

/* A skill pill always carries its proficiency level — never a bare keyword. */
function skillPills(pool) {
  return (pool || []).map(s =>
    `<span class="pill">${s.name}<span class="pillLvl">${s.level}</span></span>`
  ).join('');
}

function bProjects() {
  const projectsPool = CFG.projects || [];

  const pHtml = projectsPool.map(p => {
    const hi = p.img && p.img.length;
    const link = p.url
      ? `<a href="${p.url}" target="_blank" rel="noopener" class="btnSm">${p.btn || 'view project'}</a>`
      : (p.btn ? `<span class="btnSm btnSmOff">${p.btn}</span>` : '');
    return `<div class="pCard">
      <div class="pImg">${hi ? `<img src="${p.img}" alt="${p.title}"/>` : '💻'}</div>
      <p class="pTit">${p.title}${p.wip ? `<span class="wipTag">work in progress</span>` : ''}</p>
      ${p.stack ? `<p class="pStack">${p.stack}</p>` : ''}
      <p class="pDsc">${p.desc}</p>
      ${link}
    </div>`;
  }).join('');

  return `
    <span class="sl">technical skills</span>
    <div class="pRow">${skillPills(CFG.skillsTechnical)}</div>
    <span class="sl">creative &amp; leadership skills</span>
    <div class="pRow">${skillPills(CFG.skillsCreative)}</div>
    <hr/>
    <span class="sl">projects</span>${pHtml}
    <hr/>
    ${bGallery()}`;
}

/* Photography renders as a section at the foot of the projects window. */
/* Every shot is flattened into one slide list — with a handful of photos a
   carousel shows each one at a readable size instead of shrinking them all
   into thumbnail grids. Slide click still opens the lightbox. */
function gallerySlides() {
  return (CFG.gallery || []).flatMap(s =>
    (s.photos || []).map(p => ({ ...p, event: s.event, date: s.date }))
  );
}

let galIdx = 0;

function bGallery() {
  const slides = gallerySlides();
  if (!slides.length) return '';

  const track = slides.map(p => `<figure class="carSlide">
      <div class="carImg" onclick="openLb('${p.img}')">
        <img src="${p.img}" alt="${p.caption}" loading="lazy" decoding="async"/>
      </div>
      <figcaption class="carCap">
        <span class="carEvent">${p.event}</span>${p.date ? `<span class="carDate">${p.date}</span>` : ''}
        <span class="carText">${p.caption}</span>
      </figcaption>
    </figure>`).join('');

  const dots = slides.map((_, i) =>
    `<button class="carDot" onclick="goSlide(${i})" aria-label="photo ${i + 1}"></button>`).join('');

  return `<span class="sl">photography</span>
    <p style="font-size:.74rem;color:var(--txt2);margin-bottom:11px">event photography</p>
    <div class="car">
      <div class="carView"><div class="carTrack" id="carTrack">${track}</div></div>
      <button class="carNav carPrev" onclick="stepSlide(-1)" aria-label="previous photo">‹</button>
      <button class="carNav carNext" onclick="stepSlide(1)" aria-label="next photo">›</button>
      <div class="carDots" id="carDots">${dots}</div>
    </div>`;
}

function goSlide(i) {
  const track = document.getElementById('carTrack');
  if (!track) return;
  const count = track.children.length;
  if (!count) return;
  galIdx = (i + count) % count;            /* wraps in both directions */
  track.style.transform = `translateX(-${galIdx * 100}%)`;
  [...document.querySelectorAll('#carDots .carDot')]
    .forEach((d, n) => d.classList.toggle('carDotOn', n === galIdx));
}

function stepSlide(delta) { goSlide(galIdx + delta); }

function bFaq() {
  const faqPool = CFG.faq || [];
  return `<span class="sl">working with me</span>
    <div style="margin-top:4px">
    ${faqPool.map((f, i) => `
      <div class="fItem">
        <button class="fQ" onclick="tglFaq(${i})">${f.q}<span class="fArr">+</span></button>
        <div class="fA" id="fa${i}">${f.a}</div>
      </div>`).join('')}
    </div>`;
}

function bContact() {
  return `
    <div class="ctBox">
      <span class="ctIcon">💌</span>
      <span class="sl" style="display:inline-block">yayy mail!</span>
      <p style="font-size:.81rem;color:var(--txt2);margin-top:9px;line-height:1.7">the easiest way to reach me is email! i check it regularly and reply to everyone :)</p>
      <p style="font-size:.83rem;font-weight:700;margin-top:12px;color:var(--txt)">email me at:<br/><span style="color:var(--acc)">${CFG.email}</span></p>
      <a class="mBtn" href="mailto:${CFG.email}">send me an email!</a>
    </div>`;
}

/* The articles window opens instantly with a spinner; the real content
   (a Supabase fetch) streams in once the lazy module resolves. */
function bArticles() {
  return `<div style="display:flex;flex-direction:column;align-items:center;gap:12px;padding:40px 0">
        <div class="spinner" style="width:30px;height:30px;border-width:3px"></div>
        <p style="font-size:.78rem;color:var(--txt2)">loading articles…</p>
      </div>`;
}

async function hydrateArticles() {
  try {
    const mod = await loadArticlesMod();
    window.openArticleWindow = mod.openArticleWindow;
    const html = await mod.renderArticlesHtml();
    const body = document.getElementById('wb-articles');
    if (body) body.innerHTML = html;
  } catch (err) {
    console.error('Failed to load articles:', err);
    const body = document.getElementById('wb-articles');
    if (body) body.innerHTML = `<p style="font-size:.8rem;color:var(--txt2)">couldn't load articles right now — try again later.</p>`;
  }
}

/* ── init ─────────────────────────────────────────────── */
/* This function runs when the page loads, setting everything up! */
async function init() {
  // 1. Set the browser tab title
  document.getElementById('pgTitle').textContent = CFG.desktopTitle;

  // 2. Define all the windows we want to create. 'home' is the hero itself —
  //    on the reference site even the landing card is a real window.
  const defs = [
    { id: 'home', title: 'home', icon: '🏠', w: 620, h: 515 },
    { id: 'about', title: 'about', icon: '👤', w: 580, h: 440 },
    { id: 'articles', title: 'articles', icon: '📰', w: 320, h: 420 },
    { id: 'projects', title: 'projects', icon: '🎨', w: 580, h: 440 },
    { id: 'links', title: 'links', icon: '🔗', w: 300, h: 240 },
    { id: 'faq', title: 'working with me', icon: '❓', w: 340, h: 340 },
    { id: 'contact', title: 'contact', icon: '✉️', w: 290, h: 280 },
  ];

  // 3. Map each window ID to the function that generates its HTML content
  const htmlMap = { home: bHome, about: bAbout, articles: bArticles, projects: bProjects, links: bLinks, faq: bFaq, contact: bContact };

  // 4. Create each window using our mkWin helper function!
  // All builders are synchronous now, so nothing here waits on the network.
  for (const d of defs) {
    mkWin(d.id, d.title, d.icon, d.w, d.h, 0, 0, htmlMap[d.id]());
    // Hide immediately to prevent auto-opening — except home, which is the landing view
    if (d.id !== 'home') closeWin(d.id);
  }

  // 4b. Build the dock so every window has somewhere to be restored from
  mkDock(defs);

  // 4c. Light the first carousel dot now the projects window exists
  goSlide(0);

  // 4d. Upgrade the emoji glyphs to hand-drawn SVGs where we have them
  hydrateIcons();

  // 5. Fill out the 'About Me' bio automatically
  const bioEl = document.getElementById('abBio');
  if (bioEl) bioEl.innerHTML = CFG.aboutBio;

  // 6. Windows are now hidden during creation in the step above!

  // Now that all HTML is placed inside the active site, bind the SFX system automatically
  bindSfx();

  // 8. Desktop is ready — fade the loader out, then fetch articles in the background
  document.getElementById('loader').classList.add('done');
  hydrateArticles();
}

// Expose functions to global scope for inline HTML handlers
window.openWin = openWin;
window.toggleWin = toggleWin;
window.goSlide = goSlide;
window.stepSlide = stepSlide;
window.closeWin = closeWin;
window.openLb = openLb;
window.closeLb = closeLb;
window.tglFaq = tglFaq;
window.mkWin = mkWin;
// Stub until the lazy articles module replaces it in hydrateArticles()
window.openArticleWindow = async (id) => {
  const mod = await loadArticlesMod();
  return mod.openArticleWindow(id);
};

init();
