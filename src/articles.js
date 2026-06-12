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

  const renderHighlightCard = (p) => {
    const hasImg = p.img && p.img.length;
    const dateStr = p.created_at ? new Date(p.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short' }) : '';
    const category = (p.tags && p.tags.length > 0) ? p.tags[0] : '';
    const meta = [dateStr, category].filter(Boolean).join(' · ');
    return `<div class="pCard artHighlight" onclick="openArticleWindow('${p.id}')" style="cursor:pointer; margin-bottom: 15px; border-radius: var(--radSm); transition: box-shadow 0.2s, transform 0.2s;">
      ${hasImg ? `<div class="pImg"><img src="${p.img}" alt="${p.title}"/></div>` : ''}
      <p class="pTit">${p.title}</p>
      ${meta ? `<p style="font-size:0.7rem; color:var(--acc); font-weight:700; margin-bottom:5px; letter-spacing:0.5px;">${meta}</p>` : ''}
      <p class="pDsc">${p.description || ''}</p>
      <span style="display:inline-flex; align-items:center; gap:5px; font-size:0.77rem; font-weight:700; color:var(--acc); margin-top:8px;">Read Article <span style="transition: transform 0.2s;">→</span></span>
    </div>`;
  };

  const renderRecentItem = (p) => {
    const dateStr = p.created_at ? new Date(p.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short' }) : '';
    const category = (p.tags && p.tags.length > 0) ? p.tags[0] : '';
    const meta = [dateStr, category].filter(Boolean).join(' · ');
    return `<div class="artRecentItem" onclick="openArticleWindow('${p.id}')" style="cursor:pointer; padding: 11px 10px; border-radius: var(--radSm); border-bottom: 1px solid color-mix(in srgb, var(--border) 30%, transparent);">
      <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px;">
        <div style="flex:1;">
          ${meta ? `<p style="font-size:0.68rem; color:var(--acc); font-weight:700; margin-bottom:3px; letter-spacing:0.4px;">${meta}</p>` : ''}
          <p class="artRecentTitle" style="font-size:0.85rem; font-weight:700; color:var(--txt); margin-bottom:3px;">${p.title}</p>
          <p class="pDsc" style="font-size:0.78rem; margin:0; color:var(--txt2);">${p.description || ''}</p>
        </div>
        <span class="artArrow" style="color:var(--acc); font-weight:900; font-size:1rem; flex-shrink:0; padding-top:2px; transition: transform 0.2s;">→</span>
      </div>
    </div>`;
  };

  let html = `
    <style>
      .artHighlight:hover {
        box-shadow: 0 4px 18px rgba(0,0,0,0.10);
        transform: translateY(-2px);
      }
      .artRecentItem:hover {
        background: color-mix(in srgb, var(--acc) 6%, var(--winBg));
      }
      .artRecentItem:hover .artRecentTitle {
        text-decoration: underline;
        text-underline-offset: 3px;
      }
      .artRecentItem:hover .artArrow {
        transform: translateX(3px);
      }
      .artRecentItem:last-child {
        border-bottom: none;
      }
    </style>
    <span class="sl">articles & writing</span>
    <p style="font-size:.74rem;color:var(--txt2);margin-bottom:11px">my latest posts and thoughts</p>`;

  if (highlighted.length > 0) {
    html += `<h3 style="font-size: .78rem; font-weight:900; letter-spacing:1px; color:var(--acc); margin-top: 15px; margin-bottom: 10px; text-transform:uppercase;">Highlight</h3>`;
    html += highlighted.map(renderHighlightCard).join('');
    html += `<hr style="margin: 18px 0;" />`;
  }

  if (recent.length > 0) {
    html += `<h3 style="font-size: .78rem; font-weight:900; letter-spacing:1px; color:var(--acc); margin-bottom: 8px; text-transform:uppercase;">Recent Articles</h3>`;
    html += `<div style="display: flex; flex-direction: column;">`;
    html += recent.map(renderRecentItem).join('');
    html += `</div>`;
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
