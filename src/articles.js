import { supabase } from './supabaseClient';

export async function fetchArticles() {
  const { data: articles, error } = await supabase
    .from('articles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching articles:', error);
    return [];
  }
  return articles || [];
}

export async function renderArticlesHtml() {
  const articles = await fetchArticles();
  
  const highlighted = articles.filter(a => a.is_highlight);
  const recent = articles.filter(a => !a.is_highlight);

  const renderCard = (p) => {
    const hi = p.img && p.img.length;
    // We open article.html?id=... in a new tab
    return `<div class="pCard">
      <div class="pImg">${hi ? `<img src="${p.img}" alt="${p.title}"/>` : '📰'}</div>
      <p class="pTit">${p.title}</p>
      <p class="pDsc">${p.description}</p>
      <a href="/article.html?id=${p.id}" target="_blank" class="btnSm">read more</a>
    </div>`;
  };

  let html = `<span class="sl">articles & writing</span>
    <p style="font-size:.74rem;color:var(--txt2);margin-bottom:11px">my latest posts and thoughts</p>`;

  if (highlighted.length > 0) {
    html += `<h3 style="font-size: .85rem; margin-top: 15px; margin-bottom: 10px;">Highlights</h3>`;
    html += highlighted.map(renderCard).join('');
    html += `<hr style="margin: 20px 0; border: none; border-top: 1.5px dashed var(--border);" />`;
  }

  if (recent.length > 0) {
    html += `<h3 style="font-size: .85rem; margin-bottom: 10px;">Recent Articles</h3>`;
    html += recent.map(renderCard).join('');
  }

  if (articles.length === 0) {
    html += `<p style="font-size:.8rem; color:var(--txt2);">No articles published yet.</p>`;
  }

  return html;
}
