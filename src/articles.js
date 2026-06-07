import { supabase } from './supabaseClient';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

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
    // We open the article in a new window instead of a new tab
    return `<div class="pCard" onclick="openArticleWindow('${p.id}')" style="cursor:pointer">
      <div class="pImg">${hi ? `<img src="${p.img}" alt="${p.title}"/>` : '📰'}</div>
      <p class="pTit">${p.title}</p>
      <p class="pDsc">${p.description}</p>
      <button class="btnSm" style="pointer-events:none">read more</button>
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

export async function openArticleWindow(id) {
  // Fetch specific article
  const { data: article, error } = await supabase
    .from('articles')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !article) {
    console.error('Error fetching article:', error);
    return;
  }

  const dateObj = new Date(article.created_at);
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  const dateStr = dateObj.toLocaleDateString(undefined, options);

  // Parse Markdown to HTML and sanitize
  const rawHtml = await marked.parse(article.content_md || '');
  const cleanHtml = DOMPurify.sanitize(rawHtml);

  const tagsHtml = (article.tags && article.tags.length > 0) 
    ? article.tags.map(tag => `<span style="background:color-mix(in srgb, var(--txt2) 10%, transparent); color:var(--txt2); padding:4px 10px; border-radius:20px; font-size:0.75rem; margin-right:5px;">${tag}</span>`).join('')
    : '';

  // Render HTML for the window
  const htmlContent = `
    <div style="padding: 25px; line-height: 1.7; font-size: 0.95rem;">
      <h1 style="font-size: 2.2rem; font-weight: 800; margin-bottom: 10px; color: var(--txt); line-height: 1.2;">${article.title}</h1>
      <p style="font-size: 1.1rem; color: var(--txt2); margin-bottom: 20px;">${article.description || ''}</p>
      
      <div style="display:flex; align-items:center; gap:10px; margin-bottom:30px; font-size:0.85rem; color:var(--txt2);">
        <div style="width:36px; height:36px; border-radius:50%; background:color-mix(in srgb, var(--acc) 20%, var(--winBg)); display:flex; align-items:center; justify-content:center; font-size:1rem; border:1px solid var(--border);">🖊️</div>
        <div>
          <div style="color:var(--txt); font-weight:600;">Francis</div>
          <div>${dateStr}</div>
        </div>
      </div>

      <div class="md-content" style="color:var(--txt); margin-bottom:40px;">
        ${cleanHtml}
      </div>

      <div style="margin-top:40px;">
        ${tagsHtml}
      </div>
    </div>
  `;

  // Provide some markdown specific styles in the window
  const styleBlock = `
    <style>
      #w-art-${id} .md-content h1, #w-art-${id} .md-content h2, #w-art-${id} .md-content h3 {
        margin-top: 30px; margin-bottom: 10px; color: var(--txt); font-weight: 700;
      }
      #w-art-${id} .md-content p { margin-bottom: 15px; }
      #w-art-${id} .md-content img { max-width: 100%; height: auto; border-radius: 8px; margin: 20px 0; }
      #w-art-${id} .md-content pre { background: color-mix(in srgb, var(--acc) 10%, transparent); padding: 15px; border-radius: 6px; overflow-x: auto; margin: 20px 0; border: 1px solid var(--border); }
      #w-art-${id} .md-content code { font-family: monospace; font-size: 0.9em; background: color-mix(in srgb, var(--acc) 10%, transparent); padding: 2px 5px; border-radius: 4px; }
      #w-art-${id} .md-content a { color: var(--acc); text-decoration: underline; text-underline-offset: 3px; }
      #w-art-${id} .md-content blockquote { border-left: 3px solid var(--acc); padding-left: 15px; font-style: italic; color: var(--txt2); margin: 20px 0; }
    </style>
  `;

  // Create the window
  window.mkWin('art-' + id, article.title, '📄', 700, 550, 0, 0, styleBlock + htmlContent);
}
