import { CFG } from './config.js';
import { renderArticlesHtml } from './articles.js';
import * as views from './views.js';

const SUMMARY = `${CFG.name} — Computer Science in Data Science at Monash University Malaysia, and a theological writer. Research projects, data tooling, and essays.`;

const DEFS = [
  {
    id: 'home',
    icon: '🏠',
    width: 620,
    height: 515,
    inHome: false,
    tabTitle: CFG.desktopTitle,
    description: SUMMARY,
    render: pages => views.home(pages),
  },
  {
    id: 'about',
    icon: '👤',
    width: 580,
    height: 560,
    description: `About ${CFG.name}: ${CFG.tagline} Includes work experience, leadership roles, and honours.`,
    render: views.about,
  },
  {
    id: 'articles',
    icon: '📰',
    width: 420,
    height: 520,
    description: `Writing and essays by ${CFG.name} on theology, storytelling, and community.`,
    render: renderArticlesHtml,
  },
  {
    id: 'projects',
    icon: '🎨',
    width: 580,
    height: 440,
    description: `Projects and skills from ${CFG.name}, spanning data tooling, research, and software.`,
    render: views.projects,
  },
  {
    id: 'links',
    icon: '🔗',
    width: 300,
    height: 240,
    description: `Where to find ${CFG.name} online.`,
    render: views.links,
  },
  {
    id: 'faq',
    icon: '❓',
    width: 360,
    height: 400,
    description: `Frequently asked questions about working with ${CFG.name}.`,
    render: views.faq,
  },
  {
    id: 'contact',
    icon: '✉️',
    width: 290,
    height: 280,
    description: `Get in touch with ${CFG.name} by email.`,
    render: views.contact,
  },
];

export const PAGES = DEFS.map(def => ({
  title: def.id,
  tabTitle: `${def.id} — ${CFG.name}`,
  inHome: true,
  ...def,
}));

export const HOME_SHORTCUTS = PAGES.filter(page => page.inHome);
