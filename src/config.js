// ============================================================
// CUSTOMIZE — edit this file only to change site content/colors
// ============================================================
export const CFG = {
  name: "francis",
  nameKanji: "",
  tagline: "Data Science @ Monash. Theology, code, and community.",
  location: "Kuala Lumpur, Malaysia (UTC+8)",
  email: "francis.pn.29757@gmail.com",
  avatar: "",
  avatarEmoji: "🖊️",
  desktopTitle: "Francis P.N. — CS & Data Science, Monash University Malaysia",

  /* TODO(Francis): the [N] placeholders below are the only figures I could not
     verify. Replace them before the next deploy — see R-05 of the PRD. */
  aboutBio: `hi! i'm <strong>Francis</strong> — I'm currently studying Computer Science in Data Science at Monash University Malaysia, and I'm deeply passionate about journalism, storytelling, and community building.<br><br>I also dedicate a lot of my time to youth leadership and mentoring, serving as Interim Leader for the 46th Petaling Perdana Scout Troop and volunteering at the Church of the Assumption as a teacher.`,
  edu: "Bachelors of Computer Science in Data Science",
  eduNote: "(2025 - Present) Monash University Malaysia",
  interests: ["Research Projects", "Theology", "Game Development", "Journalism and Storytelling", "Photography", "Bouldering"],
  langs: ["English (fluent)", "Malay (fluent)", "Chinese Mandarin (basic)", "Hokkien (basic)"],

  links: [
    { label: "linkedin", emoji: "💼", url: "https://www.linkedin.com/in/francis-narcis/" },
    { label: "github", emoji: "⌥", url: "https://github.com/francis-p-n" },
    { label: "email me", emoji: "✉️", url: "mailto:francis.pn.29757@gmail.com" },
  ],

  /* Skills are split by category, and every entry carries a proficiency level. */
  skillsTechnical: [
    { name: "Python", level: "Intermediate" },
    { name: "SQL — Oracle & MongoDB", level: "Intermediate" },
    { name: "Data Analytics", level: "Intermediate" },
    { name: "Web Scraping — openpyxl / requests", level: "Intermediate" },
    { name: "React / Frontend", level: "Basic" },
    { name: "Git & GitHub", level: "Basic" },
  ],
  skillsCreative: [
    { name: "Theological Writing", level: "Advanced" },
    { name: "Research & Verification Methodology", level: "Advanced" },
    { name: "Event Photography", level: "Intermediate" },
    { name: "Public Speaking", level: "Intermediate" },
    { name: "Mentorship & Youth Leadership", level: "Intermediate" },
  ],

  projects: [
    {
      title: "easyPresent",
      img: "", stack: "Electron · C++ · hardware-accelerated rendering",
      desc: "An open-source ProPresenter alternative pairing an Electron frontend with a C++ rendering engine for live church presentation.",
      url: "https://github.com/francis-p-n/easyPresent", btn: "view source",
    },
    {
      title: "Jerusalem Bible API",
      img: "", stack: "REST API · passage parsing · full-text search",
      desc: "An API serving the complete 73-book Catholic canon in English and Chinese, with intelligent passage parsing and keyword search.",
      url: "https://github.com/francis-p-n/jerusalemBibleApi", btn: "view source",
    },
    {
      title: "Warframe Market Predictor",
      img: "", stack: "Python · statistical analysis · WhatsApp API",
      desc: "A background service that tracks live marketplace prices, runs statistical analysis over the history, and pushes daily summaries to WhatsApp.",
      url: "https://github.com/francis-p-n/warframe-market-predictor", btn: "view source",
    },
    /* TODO(Francis): fill in the stack, description and link for these two —
       placeholders are in place so the cards render, but the copy is a guess. */
    {
      title: "MyHack",
      img: "", stack: "",
      desc: "",
      url: "", btn: "",
    },
    {
      title: "WeBoosta",
      img: "", stack: "Next.js · FastAPI · LangGraph · Gemini · Supabase",
      desc: "An AI-search optimisation platform for hotels, built with Shariq Nauman for UMHackathon 2026. Multi-agent workflows simulate how AI travel agents evaluate a property, then generate machine-readable content so the hotel stays discoverable.",
      url: "https://github.com/ShariqNauman/aeo-optimizer", btn: "view source",
    },
  ],

  /* Photo sets render as a section inside the projects window; each set records event and date. */
  gallery: [
    {
      event: "Monash Photography Society workshop", date: "2025",
      photos: [{ img: "images/lights.webp", caption: "Long-exposure light study from the workshop." }],
    },
    {
      event: "Petaling Perdana Scouts 80KM Hike", date: "2025",
      photos: [{ img: "images/scouts.webp", caption: "On the trail during the 80KM Hike." }],
    },
    {
      event: "Church camp", date: "2025",
      photos: [{ img: "images/eucharist.webp", caption: "Eucharistic adoration at the closing night." }],
    },
  ],

  faq: [
    { q: "Are you available for freelance or contract work?", a: "Yes — I take on research projects, writing commissions, event photography and small data/scripting work alongside my studies. Term-time capacity is limited, so longer lead times help." },
    { q: "Do you collaborate on open-source or side projects?", a: "Yes. I'm most interested in tools for churches and student communities, Python data tooling, and anything involving structured research datasets." },
    { q: "What time zone are you in and how do you prefer to be contacted?", a: "Kuala Lumpur, UTC+8. Email is best — I usually reply within 2–3 days." },
    { q: "What are you currently working on?", a: "Forming the Monash Catholic Society (MCS), the <em>Life to the Fullness</em> writing project, Project Avaris (an RPG), and a few hardware side-projects." },
  ],

  articles: [
    { title: "My test thoughts", img: "", desc: "A brief summary of my most recent article, exploring topics on leadership, storytelling, and community.", url: "https://substack.com/@francispn", btn: "read more" },
    { title: "Theological Explorations", img: "", desc: "A recap of my recent notes on the intersection of faith and modern youth development.", url: "https://substack.com/@francispn", btn: "read more" },
    { title: "Journalism highlights", img: "", desc: "A deep dive into some storytelling exercises and local event administration.", url: "https://substack.com/@francispn", btn: "read more" }
  ],

  /* Provide filenames here for sound effects (e.g., 'hover.mp3' from zapsplat inside this folder) */
  sfxHover: "",
  sfxClick: "sfx/click.mp3",

  /* Sharyap relies heavily on orange as an accent color for links/buttons */
  accent: "#f5a11c",
  accentDk: "#d18615",
  /* Soft sky blue background to mimic Sharyap's home screen */
  desktopBg: "#e0f2fe",
  desktopBgDk: "#0f172a",
  /* Pure white background for modern minimalist window interiors */
  winBg: "#ffffff",
  winBgDk: "#1e293b",
  /* Removing taskbar colors as Sharyap doesn't use a taskbar */
};
