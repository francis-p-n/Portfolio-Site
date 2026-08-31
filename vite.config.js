import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { defineConfig } from 'vite';

/* One static page per published article, at /a/<slug>/.

   The app itself is a single HTML file, so a link into it can only ever be a
   hash — and no unfurler (WhatsApp, LinkedIn, Slack) reads a hash or runs the
   JS behind it. These pages give every article a real URL with its own title,
   description and preview image, holding the full text for crawlers and for
   anyone without JS, and handing everyone else straight to the window. */
function articlePages() {
  let outDir = 'dist';

  const page = (article, body, CFG) => {
    const url = `${CFG.siteUrl}/a/${article.id}`;
    const title = `${article.title} — ${CFG.name}`;
    const esc = v => String(v ?? '').replace(/[&<>"']/g,
      c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

    return `<!DOCTYPE html>
<html lang="en" data-theme="light">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${esc(title)}</title>

  <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
  <link rel="icon" href="/favicon.ico" sizes="any" />
  <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
  <meta name="theme-color" content="${esc(CFG.accent)}" />

  <meta name="description" content="${esc(article.description)}" />
  <link rel="canonical" href="${esc(url)}" />
  <meta property="og:type" content="article" />
  <meta property="og:site_name" content="${esc(CFG.name)}" />
  <meta property="og:title" content="${esc(article.title)}" />
  <meta property="og:description" content="${esc(article.description)}" />
  <meta property="og:url" content="${esc(url)}" />
  <meta property="og:image" content="${esc(CFG.siteUrl)}/og-cover.png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="article:published_time" content="${esc(article.date)}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${esc(article.title)}" />
  <meta name="twitter:description" content="${esc(article.description)}" />
  <meta name="twitter:image" content="${esc(CFG.siteUrl)}/og-cover.png" />

  <link
    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Nunito:wght@400;600;700;800;900&family=Syne:wght@700;800&display=swap"
    rel="stylesheet" />
  <link rel="stylesheet" href="/styles.css" />

  <!-- Anyone with JS goes straight to the article window; replace() rather than
       assign() so the back button still leaves the site cleanly. -->
  <script>location.replace('/#/article/${article.id}');</script>
</head>

<body>
  <div class="staticBody">
    <div class="staticCard artPage">
      <h1 class="artPageTit">${esc(article.title)}</h1>
      <p class="artPageSub">${esc(article.description)}</p>
      <div class="artByline">
        <span class="artAvatar">${esc(CFG.avatarEmoji || '🖊️')}</span>
        <div>
          <div class="artByName">${esc(CFG.name)}</div>
          <div class="artByDate">${esc(article.date)}</div>
        </div>
      </div>
      <div class="mdBody">${body}</div>
      <a class="mBtn staticBack" href="/#/article/${article.id}">read this on the site</a>
    </div>
  </div>
</body>

</html>
`;
  };

  const sitemap = (CFG, articles) => {
    const entry = (loc, priority, changefreq) =>
      `  <url>\n    <loc>${loc}</loc>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
    const urls = [
      entry(`${CFG.siteUrl}/`, '1.0', 'monthly'),
      ...articles.map(a => entry(`${CFG.siteUrl}/a/${a.id}`, '0.8', 'yearly')),
    ];
    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;
  };

  return {
    name: 'article-pages',
    apply: 'build',

    configResolved(config) {
      outDir = join(config.root, config.build.outDir);
    },

    async closeBundle() {
      const { PUBLISHED } = await import('./src/articles-data.js');
      const { CFG } = await import('./src/config.js');
      const { marked } = await import('marked');

      for (const article of PUBLISHED) {
        const dir = join(outDir, 'a', article.id);
        await mkdir(dir, { recursive: true });
        await writeFile(join(dir, 'index.html'), page(article, await marked.parse(article.body || ''), CFG), 'utf8');
      }

      await writeFile(join(outDir, 'sitemap.xml'), sitemap(CFG, PUBLISHED), 'utf8');
      console.log(`\narticle-pages: wrote ${PUBLISHED.length} share page(s) and sitemap.xml`);
    },
  };
}

export default defineConfig({
  plugins: [articlePages()],
});
