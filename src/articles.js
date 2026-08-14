/* Articles are static content now — the list renders synchronously from
   articles-data.js. Only the markdown parser is lazy, and only because
   nothing needs it until a post is actually opened. */
import { PUBLISHED } from './articles-data.js';
import { CFG } from './config.js';

let markedPromise = null;
function loadMarked() {
  if (!markedPromise) markedPromise = import('marked').then(m => m.marked);
  return markedPromise;
}

/* Titles and descriptions are authored in this repo, but they still land in
   attributes and innerHTML — escaping keeps a stray quote from breaking out. */
function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function fmtDate(iso, long = false) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(+d)) return '';
  return d.toLocaleDateString(undefined,
    long ? { year: 'numeric', month: 'short', day: 'numeric' } : { year: 'numeric', month: 'short' });
}

function metaLine(a) {
  return [fmtDate(a.date), a.tags?.[0]].filter(Boolean).map(escapeHtml).join(' · ');
}

function featureCard(a) {
  const meta = metaLine(a);
  return `<article class="artFeat" onclick="openArticleWindow('${escapeHtml(a.id)}')" tabindex="0">
      ${a.img ? `<div class="pImg"><img src="${escapeHtml(a.img)}" alt="${escapeHtml(a.title)}"/></div>` : ''}
      ${meta ? `<p class="artMeta">${meta}</p>` : ''}
      <p class="artFeatTit">${escapeHtml(a.title)}</p>
      <p class="pDsc">${escapeHtml(a.description)}</p>
      <span class="artGo">read article <span class="artArrow">→</span></span>
    </article>`;
}

function listRow(a) {
  const meta = metaLine(a);
  return `<article class="artRow" onclick="openArticleWindow('${escapeHtml(a.id)}')" tabindex="0">
      <div>
        ${meta ? `<p class="artMeta">${meta}</p>` : ''}
        <p class="artRowTit">${escapeHtml(a.title)}</p>
        <p class="pDsc artRowDsc">${escapeHtml(a.description)}</p>
      </div>
      <span class="artArrow">→</span>
    </article>`;
}

export function renderArticlesHtml() {
  const feature = PUBLISHED.find(a => a.highlight) || PUBLISHED[0];
  const rest = PUBLISHED.filter(a => a !== feature);

  const more = CFG.substackUrl
    ? `<a class="artMore" href="${CFG.substackUrl}" target="_blank" rel="noopener">everything else on substack →</a>`
    : '';

  if (!PUBLISHED.length) {
    return `<span class="sl">articles &amp; writing</span>
      <p class="secNote">nothing published yet — check back soon.</p>${more}`;
  }

  return `<span class="sl">articles &amp; writing</span>
    <p class="secNote">my latest posts and thoughts</p>
    ${feature ? featureCard(feature) : ''}
    ${rest.length ? `<hr/><span class="sl">more writing</span><div class="artList">${rest.map(listRow).join('')}</div>` : ''}
    ${more}`;
}

export async function openArticleWindow(id) {
  const a = PUBLISHED.find(p => p.id === id);
  if (!a) return;

  const marked = await loadMarked();
  const bodyHtml = await marked.parse(a.body || '');

  const tags = (a.tags || [])
    .map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('');

  window.mkWin('art-' + a.id, escapeHtml(a.title), '📄', 700, 550, 0, 0, `
    <div class="artPage">
      <h1 class="artPageTit">${escapeHtml(a.title)}</h1>
      <p class="artPageSub">${escapeHtml(a.description)}</p>
      <div class="artByline">
        <span class="artAvatar">${CFG.avatarEmoji || '🖊️'}</span>
        <div>
          <div class="artByName">${escapeHtml(CFG.name)}</div>
          <div class="artByDate">${fmtDate(a.date, true)}</div>
        </div>
      </div>
      <div class="mdBody">${bodyHtml}</div>
      ${tags ? `<div class="tagRow artPageTags">${tags}</div>` : ''}
    </div>`);
}
