import { CFG } from './config.js';
import { escapeHtml } from './util/html.js';

let panelSeq = 0;

export function panel(label, meta, inner, open = false) {
  const id = `ac${++panelSeq}`;
  return `<div class="acc${open ? ' open' : ''}" id="${id}">
      <button class="accHd" data-act="acc:toggle" aria-expanded="${open}" aria-controls="${id}-b">
        <span class="accTit">${label}</span>
        ${meta ? `<span class="accMeta">${meta}</span>` : ''}
        <span class="accArr" aria-hidden="true">+</span>
      </button>
      <div class="accBody" id="${id}-b"><div class="accPad">${inner}</div></div>
    </div>`;
}

function avatar() {
  return CFG.avatar ? `<img src="${CFG.avatar}" alt="${escapeHtml(CFG.name)}"/>` : CFG.avatarEmoji;
}

function tags(pool) {
  return (pool || []).map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('');
}

export function home(pages) {
  const shortcuts = pages.map(page => `
        <button class="deskIcon" data-act="win:open" data-win="${page.id}">
          <span class="deskIcoGlyph" data-icon="${page.id}">${page.icon}</span>
          <span class="deskIcoLbl">${page.title}</span>
        </button>`).join('');
  return `
    <div class="deskCenter">
      ${CFG.avatar ? `<img src="${CFG.avatar}" class="deskAvatar" alt="${escapeHtml(CFG.name)}"/>` : `<div class="deskEmoji">${CFG.avatarEmoji}</div>`}
      <h1 class="deskTitle">hi! i'm <span style="color:var(--acc); text-transform:lowercase">${escapeHtml(CFG.name)}</span></h1>
      <p class="deskSub">${escapeHtml(CFG.tagline)}</p>
      <div class="deskGrid">${shortcuts}</div>
    </div>`;
}

export function about() {
  return `
    <div class="abHead">
      <div class="avi" data-act="avatar:poke" role="button" tabindex="0" aria-label="poke the avatar">${avatar()}</div>
      <div>
        <div class="bigN">${escapeHtml(CFG.name)}</div>
        ${CFG.nameKanji ? `<div class="abKanji">${escapeHtml(CFG.nameKanji)}</div>` : ''}
        <div class="subT">${escapeHtml(CFG.tagline)}</div>
        <div class="abLoc">${escapeHtml(CFG.location)}</div>
      </div>
    </div>
    <p class="bioP">${CFG.aboutBio}</p>
    <hr/>
    <span class="sl">education</span>
    <p class="abEdu">${escapeHtml(CFG.edu)}</p>
    <p class="abEduNote">${escapeHtml(CFG.eduNote)}</p>
    <hr/>
    ${career()}
    <hr/>
    <span class="sl">other interests</span>
    <div class="tagRow">${tags(CFG.interests)}</div>
    <span class="sl secGap">languages</span>
    <div class="tagRow">${tags(CFG.langs)}</div>`;
}

function roleCard(role) {
  const bullets = (role.bullets || []).map(b => `<li>${escapeHtml(b)}</li>`).join('');
  return `<div class="roleCard">
      <p class="roleOrg">${escapeHtml(role.org)}</p>
      <p class="pStack">${escapeHtml(role.role)} · ${escapeHtml(role.period)}</p>
      <ul class="roleBullets">${bullets}</ul>
    </div>`;
}

export function career() {
  const work = CFG.workExperience || [];
  const lead = CFG.leadershipRoles || [];
  const honours = CFG.honours || [];

  return `<span class="sl">career</span>
    <div class="accGroup">
      ${work.length ? panel('work experience', `${work.length}`, work.map(roleCard).join(''), true) : ''}
      ${lead.length ? panel('leadership roles', `${lead.length}`, lead.map(roleCard).join('')) : ''}
      ${honours.length ? panel('honours &amp; awards', `${honours.length}`, `<div class="tagRow tagRowFlush">${tags(honours)}</div>`) : ''}
    </div>`;
}

function skillPills(pool) {
  return (pool || []).map(skill =>
    `<span class="pill">${escapeHtml(skill.name)}<span class="pillLvl">${escapeHtml(skill.level)}</span></span>`).join('');
}

function projectCard(project) {
  const link = project.url
    ? `<a href="${escapeHtml(project.url)}" target="_blank" rel="noopener" class="btnSm">${escapeHtml(project.btn || 'view project')}</a>`
    : '';
  return `<article class="pCard">
      <div class="pCardHd">
        <span class="pIco" aria-hidden="true">💻</span>
        <div>
          <p class="pTit">${escapeHtml(project.title)}</p>
          ${project.stack ? `<p class="pStack">${escapeHtml(project.stack)}</p>` : ''}
        </div>
      </div>
      ${project.img ? `<div class="pImg"><img src="${escapeHtml(project.img)}" alt="${escapeHtml(project.title)}" loading="lazy"/></div>` : ''}
      <p class="pDsc">${escapeHtml(project.desc)}</p>
      ${link}
    </article>`;
}

function wipRow(project) {
  return `<div class="wipItem">
      <span class="wipDot" aria-hidden="true"></span>
      <div>
        <p class="wipTit">${escapeHtml(project.title)}</p>
        <p class="pDsc wipDsc">${escapeHtml(project.desc)}</p>
      </div>
    </div>`;
}

export function projects() {
  const pool = CFG.projects || [];
  const shipped = pool.filter(p => !p.wip);
  const wip = pool.filter(p => p.wip);
  const technical = CFG.skillsTechnical || [];
  const creative = CFG.skillsCreative || [];

  return `
    <span class="sl">projects</span>
    <p class="secNote">finished and public</p>
    <div class="pGrid">${shipped.map(projectCard).join('')}</div>
    ${wip.length ? `
    <span class="sl secGap">in the works</span>
    <div class="wipList">${wip.map(wipRow).join('')}</div>` : ''}
    <hr/>
    <span class="sl">skills</span>
    <div class="accGroup">
      ${technical.length ? panel('technical', `${technical.length}`, `<div class="pRow">${skillPills(technical)}</div>`, true) : ''}
      ${creative.length ? panel('creative &amp; leadership', `${creative.length}`, `<div class="pRow">${skillPills(creative)}</div>`) : ''}
    </div>
    <hr/>
    ${gallery()}`;
}

function slides() {
  return (CFG.gallery || []).flatMap(set =>
    (set.photos || []).map(photo => ({ ...photo, event: set.event, date: set.date })));
}

export function gallery() {
  const shots = slides();
  if (!shots.length) return '';

  const track = shots.map(shot => `<figure class="carSlide">
      <div class="carImg" data-act="lightbox:open" data-src="${escapeHtml(shot.img)}" data-alt="${escapeHtml(shot.caption)}"
           role="button" tabindex="0" aria-label="open ${escapeHtml(shot.caption)}">
        <img src="${escapeHtml(shot.img)}" alt="${escapeHtml(shot.caption)}" loading="lazy" decoding="async"/>
      </div>
      <figcaption class="carCap">
        <span class="carEvent">${escapeHtml(shot.event)}</span>${shot.date ? `<span class="carDate">${escapeHtml(shot.date)}</span>` : ''}
        <span class="carText">${escapeHtml(shot.caption)}</span>
      </figcaption>
    </figure>`).join('');

  const dots = shots.map((_, i) =>
    `<button class="carDot" data-act="carousel:go" data-index="${i}" aria-label="photo ${i + 1}"></button>`).join('');

  return `<span class="sl">photography</span>
    <p style="font-size:.74rem;color:var(--txt2);margin-bottom:11px">event photography</p>
    <div class="car" data-carousel>
      <div class="carView"><div class="carTrack">${track}</div></div>
      <button class="carNav carPrev" data-act="carousel:step" data-step="-1" aria-label="previous photo">‹</button>
      <button class="carNav carNext" data-act="carousel:step" data-step="1" aria-label="next photo">›</button>
      <div class="carDots">${dots}</div>
    </div>`;
}

export function links() {
  const active = (CFG.links || []).filter(link => link.url);
  return `<span class="sl">find me online</span>
    <div class="lGrid">
      ${active.map(link => `<a class="lBtn" href="${escapeHtml(link.url)}" target="_blank" rel="noopener"><span class="lIco">${link.emoji}</span>${escapeHtml(link.label)}</a>`).join('')}
    </div>
    <p style="font-size:.68rem;color:var(--txt2);margin-top:12px">clicking any link opens a new tab ✦</p>`;
}

export function faq() {
  return `<span class="sl">faq</span>
    <p class="secNote">what working with me looks like</p>
    <div class="accGroup">${(CFG.faq || []).map(item => panel(item.q, '', `<p class="accText">${item.a}</p>`)).join('')}</div>`;
}

export function contact() {
  return `
    <div class="ctBox">
      <span class="ctIcon">💌</span>
      <span class="sl" style="display:inline-block">yayy mail!</span>
      <p style="font-size:.81rem;color:var(--txt2);margin-top:9px;line-height:1.7">the easiest way to reach me is email! i check it regularly and reply to everyone :)</p>
      <p style="font-size:.83rem;font-weight:700;margin-top:12px;color:var(--txt)">email me at:<br/><span style="color:var(--acc)">${escapeHtml(CFG.email)}</span></p>
      <a class="mBtn" href="mailto:${escapeHtml(CFG.email)}">send me an email!</a>
    </div>`;
}
