/* All site copy and colours. This is the only file to edit to change what the
   site says. */
export const CFG = {
  name: "francis",
  nameKanji: "",
  tagline: "Data Science @ Monash. Theology, code, and community.",
  location: "Kuala Lumpur, Malaysia (UTC+8)",
  email: "francis.pn.29757@gmail.com",
  avatar: "images/avatar.webp",
  avatarEmoji: "🖊️",
  desktopTitle: "Francis P.N. — CS & Data Science, Monash University Malaysia",

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

  /* Deliberately short — only what I actually reach for, each with a
     proficiency level so nothing reads as a bare keyword. */
  skillsTechnical: [
    { name: "Python", level: "Intermediate" },
    { name: "C++", level: "Intermediate" },
    { name: "SQL — Oracle & MongoDB", level: "Intermediate" },
    { name: "Data Analytics", level: "Intermediate" },
    { name: "Web Scraping — openpyxl / requests", level: "Intermediate" },
    { name: "Git & GitHub", level: "Basic" },
  ],
  skillsCreative: [
    { name: "Theological Writing", level: "Advanced" },
    { name: "Research & Verification Methodology", level: "Advanced" },
    { name: "Public Speaking", level: "Intermediate" },
    { name: "Mentorship & Youth Leadership", level: "Intermediate" },
    { name: "Event Photography", level: "Intermediate" },
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
    {
      title: "WeBoosta",
      img: "images/weboosta.webp", stack: "Next.js · FastAPI · LangGraph · Gemini · Supabase",
      desc: "An AI-search optimisation platform for hotels, built with Shariq Nauman for UMHackathon 2026. Multi-agent workflows simulate how AI travel agents evaluate a property, then generate machine-readable content so the hotel stays discoverable.",
      url: "https://github.com/ShariqNauman/aeo-optimizer", btn: "view source",
    },
    /* TODO(Francis): fill in stack, links and fuller descriptions once these are further along. */
    {
      title: "Ekklesia",
      img: "", stack: "",
      desc: "A mobile app designed to be a one-stop source for all things Catholic in Malaysia.",
      url: "", btn: "", wip: true,
    },
    {
      title: "ArkFlow",
      img: "", stack: "",
      desc: "A SaaS platform targeted to streamline animal management for zoos and conservations.",
      url: "", btn: "", wip: true,
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

  /* Rendered in the about window as the career section. */
  workExperience: [
    {
      org: "Alpha Malaysia",
      role: "Intern – Alpha for Church & Coach Engagement",
      period: "May – August 2026",
      bullets: [
        "Orchestrated complex operational logistics for a 3,000-delegate conference, ensuring seamless flow of resources.",
        "Streamlined and updated the leadership directory for 667 churches, implementing rigorous data validation protocols to improve communication accuracy and stakeholder engagement.",
        "Collaborated with senior leadership to formulate and execute strategic initiatives, utilizing analytical insights to align organizational goals with long-term operational objectives.",
      ],
    },
    {
      org: "Methodist College Kuala Lumpur",
      role: "Temporary Staff",
      period: "January – May 2025",
      bullets: [
        "Spearheaded the training and development of student leaders, enhancing leadership competencies and operational readiness through structured mentorship and performance evaluations.",
        "Managed Student Affairs social media channels, executing a strategic content plan that increased digital engagement and strengthened the college's community presence.",
        "Conceptualized and implemented sustainable frameworks for student soft skills development, ensuring long-term scalability and measurable growth in student professional capabilities.",
        "Coordinated the execution of the MCKL Dash for Charity 2025, managing cross-functional logistics and stakeholder communications to ensure a high-impact, successful community event.",
      ],
    },
  ],

  leadershipRoles: [
    {
      org: "Flaming Phoenix, 46th Petaling Perdana Scout Troop",
      role: "Interim Leader",
      period: "2023 – Present",
      bullets: [
        "Trained multiple successful King Scouts.",
        "Renewed training of student leaders and systems, allowing scouts to start earning merit badges again.",
        "Liaised regularly with the school administration and district/state-level Scout Commissioners to organize appropriate programs to train secondary school-age youth Scouts in leadership and survival skills.",
      ],
    },
    {
      org: "Monash University Student Association",
      role: "School of Information Technology Secretary",
      period: "January – July 2026",
      bullets: [
        "Handled the administration of multiple events, including post-event reports.",
        "Created questions and invigilated a coding competition.",
        "Handled communication between regular students and committee members.",
        "Co-Director for the Monash Hackathon 2026.",
      ],
    },
    {
      org: "Methodist College Kuala Lumpur, Student Affairs Department",
      role: "Orientation Camp ReSTA (Recruitment, Selection, Training, Appraisal), Camps 1–4",
      period: "2025",
      bullets: [
        "Managed and advised the recruitment and selection process of facilitators.",
        "Provided active mentorship, feedback, and training for 8 commanders alongside 2 partners.",
        "Liaised with staff members and spearheaded large-scale overhauls to outdated systems.",
      ],
    },
  ],

  honours: [
    "ASEAN Future Sustainable Leaders Pitch Competition 2023 Winner",
    "UMHackathon 2026 Finalist",
    "GDG KL myHack 2026 Finalist",
    "WOSM Safe From Harm Certified",
  ],

  faq: [
    { q: "Are you available for freelance or contract work?", a: "Yes — I take on research projects, writing commissions, event photography and small data/scripting work alongside my studies. Term-time capacity is limited, so longer lead times help." },
    { q: "Do you collaborate on open-source or side projects?", a: "Yes. I'm most interested in tools for churches and student communities, Python data tooling, and anything involving structured research datasets." },
    { q: "What time zone are you in and how do you prefer to be contacted?", a: "Kuala Lumpur, UTC+8. Email is best — I usually reply within 2–3 days." },
    { q: "What are you currently working on?", a: "Forming the Monash Catholic Society (MCS), the <em>Life to the Fullness</em> writing project, Project Avaris (an RPG), and a few hardware side-projects." },
  ],

  /* Absolute origin, used to build the share links and OG tags baked into
     the per-article pages at build time. No trailing slash. */
  siteUrl: "https://fpn-portfolio.vercel.app",

  /* Where the "everything else" link at the foot of the articles window points. */
  substackUrl: "https://substack.com/@francispn",

  /* Sound effect files, relative to the site root. Leave empty to disable. */
  sfxHover: "",
  sfxClick: "sfx/click.mp3",

  /* Accent, wallpaper and window fill, light then dark. */
  accent: "#f5a11c",
  accentDk: "#d18615",
  desktopBg: "#e0f2fe",
  desktopBgDk: "#0f172a",
  winBg: "#ffffff",
  winBgDk: "#1e293b",
};
