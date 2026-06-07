import { supabase } from './supabaseClient';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

async function loadArticle() {
  const params = new URLSearchParams(window.location.search);
  const articleId = params.get('id');

  if (!articleId) {
    document.getElementById('loader').innerText = 'Article not found.';
    return;
  }

  const { data: article, error } = await supabase
    .from('articles')
    .select('*')
    .eq('id', articleId)
    .single();

  if (error || !article) {
    console.error('Error fetching article:', error);
    document.getElementById('loader').innerText = 'Article not found or error loading.';
    return;
  }

  // Populate UI
  document.getElementById('title').innerText = article.title;
  document.getElementById('articleTitle').innerText = article.title;
  document.getElementById('description').innerText = article.description || '';
  
  const dateObj = new Date(article.created_at);
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  document.getElementById('date').innerText = dateObj.toLocaleDateString(undefined, options);

  // Parse Markdown to HTML and sanitize
  const rawHtml = await marked.parse(article.content_md || '');
  const cleanHtml = DOMPurify.sanitize(rawHtml);
  document.getElementById('content').innerHTML = cleanHtml;

  // Tags
  if (article.tags && article.tags.length > 0) {
    const tagsHtml = article.tags.map(tag => `<span class="tag">${tag}</span>`).join('');
    document.getElementById('tags').innerHTML = tagsHtml;
  }

  // Hide loader, show content
  document.getElementById('loader').style.display = 'none';
  document.getElementById('articleContent').style.display = 'block';
}

document.addEventListener('DOMContentLoaded', loadArticle);
