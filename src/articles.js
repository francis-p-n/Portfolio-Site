import { PUBLISHED } from './articles-data.js';
import { CFG } from './config.js';
import { escapeHtml, formatDate } from './util/html.js';

let markedPromise = null;

function loadMarked() {
  if (!markedPromise) markedPromise = import('marked').then(m => m.marked);
  return markedPromise;
}

function metaLine(article) {
  return [formatDate(article.date), article.tags?.[0]].filter(Boolean).map(escapeHtml).join(' · ');
}

function featureCard(article) {
  const meta = metaLine(article);
  return `<article class="artFeat" data-act="article:open" data-article="${escapeHtml(article.id)}" tabindex="0" role="button">
      ${article.img ? `<div class="pImg"><img src="${escapeHtml(article.img)}" alt="${escapeHtml(article.title)}"/></div>` : ''}
      ${meta ? `<p class="artMeta">${meta}</p>` : ''}
      <p class="artFeatTit">${escapeHtml(article.title)}</p>
      <p class="pDsc">${escapeHtml(article.description)}</p>
      <span class="artGo">read article <span class="artArrow">→</span></span>
    </article>`;
}

function listRow(article) {
  const meta = metaLine(article);
  return `<article class="artRow" data-act="article:open" data-article="${escapeHtml(article.id)}" tabindex="0" role="button">
      <div>
        ${meta ? `<p class="artMeta">${meta}</p>` : ''}
        <p class="artRowTit">${escapeHtml(article.title)}</p>
        <p class="pDsc artRowDsc">${escapeHtml(article.description)}</p>
      </div>
      <span class="artArrow">→</span>
    </article>`;
}

export function renderArticlesHtml() {
  const feature = PUBLISHED.find(a => a.highlight) || PUBLISHED[0];
  const rest = PUBLISHED.filter(a => a !== feature);

  const more = CFG.substackUrl
    ? `<a class="artMore" href="${escapeHtml(CFG.substackUrl)}" target="_blank" rel="noopener">everything else on substack →</a>`
    : '';

  if (!PUBLISHED.length) {
    return `<span class="sl">articles &amp; writing</span>
      <p class="secNote">nothing published yet — check back soon.</p>${more}`;
  }

  return `<span class="sl">articles &amp; writing</span>
    <p class="secNote">my latest posts and <button type="button" class="eggWord" data-act="puzzle:open">thoughts</button></p>
    ${featureCard(feature)}
    ${rest.length ? `<hr/><span class="sl">more writing</span><div class="artList">${rest.map(listRow).join('')}</div>` : ''}
    ${more}`;
}

export async function openArticleWindow(manager, id) {
  const article = PUBLISHED.find(a => a.id === id);
  if (!article) return false;

  const marked = await loadMarked();
  const body = await marked.parse(article.body || '');
  const tagRow = (article.tags || []).map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('');

  manager.create({
    id: `art-${article.id}`,
    title: escapeHtml(article.title),
    icon: '📄',
    width: 700,
    height: 550,
    tabTitle: `${article.title} — ${CFG.name}`,
    description: article.description,
    html: `
    <div class="artPage">
      <h1 class="artPageTit">${escapeHtml(article.title)}</h1>
      <p class="artPageSub">${escapeHtml(article.description)}</p>
      <div class="artByline">
        <span class="artAvatar">${CFG.avatarEmoji || '🖊️'}</span>
        <div>
          <div class="artByName">${escapeHtml(CFG.name)}</div>
          <div class="artByDate">${formatDate(article.date, true)}</div>
        </div>
        <button type="button" class="artShare" data-act="article:share" data-article="${escapeHtml(article.id)}">copy link</button>
      </div>
      <div class="mdBody">${body}</div>
      ${tagRow ? `<div class="tagRow artPageTags">${tagRow}</div>` : ''}
    </div>`,
  });

  return true;
}
