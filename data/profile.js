// Single source of truth for every piece of personal content on the site.
// Components import only what they need from here, so changing a phone number
// or adding a project is a one-file edit instead of hunting through JSX.
//
// Source: public/Vizhiyarasu_Resume_Professional.pdf

export const PROFILE = {
  firstName: "Vizhiyarasu",
  lastName: "Sampath",
  fullName: "Vizhiyarasu Sampath",
  // Hero wordmark. Full name, rendered as two stacked lines — see
  // #hero-heading in globals.css. Split on the newline rather than the space
  // so the break point is fixed instead of at the mercy of the type scale.
  heroName: "VIZHIYARASU\nSAMPATH",
  title: "AI-Assisted SDET",
  shortTitle: "SDET",
  // The resume's positioning line, under the name.
  positioning:
    "AI-Assisted SDET • Manual & Automation Testing • Prompt Engineering",
  // The hero renders `title` in full beneath the wordmark. Split across fixed
  // lines so the wrap points stay put at every breakpoint instead of shifting
  // with the type scale — see #hero-role in globals.css.
  heroTitle: "SOFTWARE DEVELOPMENT\nENGINEER IN TEST (SDET)",
  tagline: "Testing quality into software.",
  summary: [
    "Vizhiyarasu Sampath is an SDET with 2+ years delivering quality across three concurrent SaaS and ERP products, spanning manual testing, test automation, AI-assisted testing, and frontend development.",
    "Promoted three times in 18 months — Junior Quality Engineer to Associate Quality Engineer to SDET — he owns the full testing lifecycle across Vruksha, Varai and Eythio while engineering frontend features with React.js and Next.js.",
  ],
  // Used in the footer under the wordmark.
  footerBio: [
    "Vizhiyarasu doesn't just find bugs.",
    "He builds the systems that catch them.",
  ],
};

export const CONTACT = {
  email: "vizhiekr@gmail.com",
  phoneDisplay: "+91 80982 34425",
  phoneHref: "tel:+918098234425",
  whatsappUrl: "https://wa.me/918098234425",
  location: "Thanjavur, Tamil Nadu, India",
  resumeUrl: "/Vizhiyarasu_Resume_Professional.pdf",
};

// TODO: replace the `#` placeholders with real profile URLs.
export const SOCIALS = [
  { name: "LinkedIn", href: "#" },
  { name: "GitHub", href: "#" },
];

export const SKILLS = [
  {
    group: "Languages & Frameworks",
    items: [
      "HTML5",
      "CSS3",
      "JavaScript",
      "React.js",
      "Next.js",
      "Tailwind CSS",
      "WordPress",
    ],
  },
  {
    group: "Testing & Automation",
    items: [
      "Manual Testing",
      "Katalon Studio",
      "Selenium",
      "AI-Assisted Automation",
      "Functional / Regression / Integration / API / UAT",
    ],
  },
  {
    group: "AI Tools",
    items: ["Claude Code", "GitHub Copilot", "ChatGPT", "Antigravity"],
  },
  {
    group: "Tools & Platforms",
    items: [
      "Git",
      "GitHub",
      "GitHub Actions",
      "Jira",
      "Bugasura",
      "Postman",
      "VS Code",
      "MCP Tools",
    ],
  },
  {
    group: "Security Testing (Basic Level)",
    items: ["OWASP ZAP", "Burp Suite", "OWASP Top 10 — foundational exposure"],
  },
  {
    group: "Databases",
    items: ["MySQL", "RDBMS", "JSON"],
  },
  {
    group: "Soft Skills",
    items: ["Problem-Solving", "Teamwork", "Adaptability", "Ownership"],
  },
];

// Shape matches the `Row` component in components/Projects/Projects.jsx:
// { name, role, note, href, kind }. `href` is null for every entry because the
// resume lists no public URLs — Row renders those as static rows with a dot.
export const PROJECTS = [
  {
    name: "Eythio — Task Management Platform",
    role: "Developer & Tester",
    href: null,
    kind: "SaaS",
    note: "Unified release planning, sprint execution and bug tracking with built-in cost intelligence. Built responsive Kanban, Gantt and Dashboard UI, and validated RBAC and audit-log accuracy across workspace permissions.",
  },
  {
    name: "Varai — ERP Application",
    role: "Developer & Tester",
    href: null,
    kind: "ERP",
    note: "Sales, project and operations platform for system integrators and contractors. Developed authentication, bid-to-project conversion and multi-region/currency setup flows; covered signup, sign-in and role-based access with test and automation scripts.",
  },
  {
    name: "Vruksha — Real Estate ERP Application",
    role: "Tester",
    href: null,
    kind: "ERP",
    note: "Single source of truth for land, projects, partners and money. Tested the Stock → Project → Subproject → Unit → Sale chain, partner ledgers, bank-transaction mapping and GST/TDS handling.",
  },
  {
    name: "25YearsMore — Social Networking & Community Platform",
    role: "Tester",
    href: null,
    kind: "Platform",
    note: "Community platform for people aged 50–65. End-to-end manual testing of communities, events and coaching modules, the Life 2.0 readiness assessment, and defect tracking in Jira and Bugasura.",
  },
];

export const EXPERIENCE = [
  {
    name: "Arivar Techlabs Private Limited (Yakkaspace Group), Thanjavur",
    role: "Software Development Engineer in Test (SDET)",
    href: null,
    kind: "Apr 2026 — Present",
    note: "Engineer frontend features and own functional, regression, integration, API and UAT testing across three products (Vruksha, Varai, Eythio). Drive Katalon Studio automation across the full regression suite, review AI-generated Playwright and Selenium scripts, and manage defect workflows with MCP tools.",
  },
  {
    name: "Arivar Techlabs Private Limited (Yakkaspace Group), Thanjavur",
    role: "Associate Quality Engineer",
    href: null,
    kind: "Oct 2025 — Mar 2026",
    note: "Delivered manual and AI-assisted testing across three SaaS and ERP products. Designed test cases, test data sets and regression suites, supported frontend validation, and drove release validation across multiple cycles.",
  },
  {
    name: "Yakkaservices Private Limited (Yakkaspace Group), Thanjavur",
    role: "Junior Quality Engineer",
    href: null,
    kind: "Nov 2024 — Sep 2025",
    note: "Owned end-to-end manual testing for SaaS, ERP and web/mobile applications including 25YearsMore. Built Katalon Studio automation, validated UI behaviour across web and mobile, and ran foundational security testing with OWASP ZAP and Burp Suite.",
  },
];

export const EDUCATION = [
  {
    name: "Full Stack Development Certification",
    role: "Besant Technologies, Chennai (Velachery)",
    href: null,
    kind: "Certification",
    note: "6-month front-end web development training.",
  },
  {
    name: "Diploma in Cinema Editing & Visual Arts",
    role: "PALME-DEOR Film and Media College, Thanjavur",
    href: null,
    kind: "2020",
    note: "89% aggregate.",
  },
  {
    name: "Web Development Intern",
    role: "Yakkaservices (Yakkaspace)",
    href: null,
    kind: "Jul — Oct 2024",
    note: "Modern web development with React.js, Next.js, Tailwind CSS and Supabase; built and tested responsive UI components.",
  },
  {
    name: "Web Development Trainee / Intern",
    role: "SAIO",
    href: null,
    kind: "Oct 2023",
    note: "HTML, CSS, JavaScript, React.js and WordPress (Oxygen Builder) — 96% in the final assessment.",
  },
  {
    name: "Java Development Intern",
    role: "Shiash Info Solutions Pvt. Ltd.",
    href: null,
    kind: "Apr — Jun 2022",
    note: "Core Java and application development fundamentals with the technical team.",
  },
];

// Bento card content for components/MagicBento. Unlike the other exports this
// one is NOT the `Row` shape — achievements render as a card grid, not a list,
// so each entry carries its own three-part editorial split:
//   label       — category tag in the card header, tracked caps
//   title       — the short headline the eye lands on
//   description — one sentence of supporting detail
// Order matters: the 1024px grid gives cards 1 and 2 the wide spans, so the
// two strongest claims go first.
export const ACHIEVEMENTS = [
  {
    label: "Career Growth",
    title: "Three roles in 18 months",
    description:
      "Promoted from Junior Quality Engineer to Associate Quality Engineer to SDET in under two years, taking on more release ownership at each step.",
  },
  {
    label: "Coverage",
    title: "Deeper coverage on critical modules",
    description:
      "Raised test coverage across the highest-risk modules through deliberate test case design and disciplined execution.",
  },
  {
    label: "Defect Prevention",
    title: "Fewer defects reaching release",
    description:
      "Cut release-cycle defects by catching issues early — during requirement analysis and first-pass functional testing rather than in UAT.",
  },
  {
    label: "Automation",
    title: "Katalon Studio regression suites",
    description:
      "Replaced repetitive manual regression passes with Katalon Studio automation, freeing cycles for exploratory and edge-case work.",
  },
  {
    label: "Delivery",
    title: "Three concurrent products, shipped",
    description:
      "Ran quality for Vruksha, Varai and Eythio in parallel, holding each to its release date without trading away test depth.",
  },
];
