/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  Edit this file to change everything the visitor reads.
 *
 *  • profile  – name, tagline, About text, skills, contact links.
 *  • projects – one entry per cartridge, in shelf order (six per shelf).
 *
 *  Only describe what a project really does. Links are only rendered when a
 *  URL is present, so leave liveUrl/sourceUrl out until you have a real,
 *  public address. Images marked `demo: true` are illustrations, not
 *  screenshots, and show a "Demo preview" caption.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import type { Profile, Project } from './types'

export const profile: Profile = {
  name: 'Dorukan Kılınç',
  tagline: 'Computer Engineer | Cybersecurity & AI | Software & Game Development',
  about: [
    'Hi, I’m Dorukan, a computer engineer focused on cybersecurity and AI development. I build secure software systems, AI-powered applications, and interactive games.',
    'My work ranges from a multi-tenant school management platform with fine-grained access controls to computer vision, IoT automation, native iOS applications, and physics-based games. I enjoy turning complex ideas into reliable, usable products.',
  ],
  notes: [
    { label: 'Primary focus', value: 'Cybersecurity & secure software engineering' },
    { label: 'AI development', value: 'LLMs, AI agents and backend integrations' },
    { label: 'Also building', value: 'Full-stack products and games' },
    { label: 'Education', value: 'B.Sc. Computer Engineering, Bahçeşehir University (2021–2026)' },
    { label: 'Studio', value: 'Summyra — my software work', href: 'https://summyra.com/' },
  ],
  skills: [
    'RBAC',
    'PostgreSQL Row-Level Security',
    'Secure API development',
    'Python',
    'LLM integration',
    'CrewAI',
    'C#',
    '.NET 8',
    'TypeScript',
    'React',
    'Next.js',
    'NestJS',
    'Swift',
    'SwiftUI',
    'Java',
    'Unity 6',
    'Git',
    'Linux',
  ],
  skillGroups: [
    {
      label: 'Security & architecture',
      items: ['RBAC', 'Scoped permissions', 'PostgreSQL Row-Level Security', 'Secure API development', 'Session & CSRF safeguards'],
    },
    {
      label: 'AI',
      items: ['Python', 'LLM integration', 'CrewAI', 'Multi-agent systems', 'MCP'],
    },
    {
      label: 'Backend & web',
      items: [
        'C#',
        'ASP.NET',
        '.NET 8',
        'TypeScript',
        'JavaScript',
        'React',
        'Next.js',
        'NestJS',
        'REST APIs',
        'PostgreSQL',
        'Oracle SQL',
        'Drizzle ORM',
      ],
    },
    {
      label: 'Mobile & games',
      items: ['Swift', 'SwiftUI', 'iOS', 'Java', 'Android Studio', 'Unity 6', 'C++', 'Unreal Engine (basics)', '3D fundamentals'],
    },
    {
      label: 'Tools',
      items: ['Git', 'Linux', 'Postman', 'Jira', 'Debugging', 'QA testing'],
    },
  ],
  contactIntro:
    'I’m open to opportunities in cybersecurity, AI development, and software engineering, as well as collaborations on interactive products and games. You can reach me by email or LinkedIn.',
  contact: [
    { label: 'Email', href: 'mailto:dorukankilinc28@gmail.com', text: 'dorukankilinc28@gmail.com' },
    { label: 'LinkedIn', href: 'https://linkedin.com/in/dorukankilinc/', text: 'linkedin.com/in/dorukankilinc' },
    { label: 'GitHub', href: 'https://github.com/dorukanklnc', text: 'github.com/dorukanklnc' },
  ],
  experience: [
    {
      title: 'AI Engineering Intern',
      company: 'Kuika Software',
      location: 'Istanbul, Turkey',
      period: 'February 2026 – March 2026',
      points: [
        'Engineered multi-agent AI systems with Python and CrewAI to orchestrate complex business workflows.',
        'Integrated large language models into backend services via REST APIs using C# and .NET 8.',
        'Deployed Model Context Protocol (MCP) servers to securely connect LLMs with external enterprise data sources.',
        'Built a “Business Intelligence” AI agent that queries internal SQL databases and runs real-time web research.',
        'Designed data-driven pipelines that let LLMs process enterprise data and generate executive reports.',
      ],
      technologies: ['Python', 'CrewAI', 'LLMs', 'C#', '.NET 8', 'MCP', 'SQL', 'REST APIs'],
    },
    {
      title: 'Full Stack Developer – QA Testing Intern',
      company: 'Turkish Technology',
      location: 'Istanbul, Turkey',
      period: 'July 2024 – August 2024',
      points: [
        'Developed features of the TTPlanner internal web application with HTML, CSS, JavaScript, ASP.NET and C#.',
        'Managed databases and optimized queries with Oracle SQL.',
        'Delivered 10+ web application features for client data analysis and processing.',
        'Wrote 30+ test cases and validated APIs with Postman.',
        'Ran software and load testing for user-facing applications, reducing system failures by 80%.',
        'Worked with UX and the CTO in Jira for agile tracking and debugging.',
      ],
      technologies: ['C#', 'ASP.NET', 'JavaScript', 'Oracle SQL', 'Postman', 'Jira'],
    },
  ],
  honors: ['TÜBİTAK High School Research Projects Competition (Biology) — National Encouragement Award'],
}

const demo = (slug: string, alt: string) => ({
  src: `projects/${slug}/preview.svg`,
  alt,
  demo: true,
})

const allProjects: Project[] = [
  {
    slug: 'summyra-campus',
    title: 'Summyra Campus',
    type: 'Multi-tenant school management SaaS',
    summary:
      'A multi-tenant management platform for schools, with personalized portals, role-based access, and academic and financial workflows.',
    description: [
      'Summyra Campus (CampusOS) is a modular school management platform where school owners, principals, vice principals, teachers, accounting staff, students, guardians, and other personnel sign in with their own accounts and see features appropriate to their responsibilities. Teachers can manage homework, students can view assignments and grades, and accounting staff work with payment and financial records through their authorized areas.',
      'The system uses Next.js/React, NestJS, and PostgreSQL. Its codebase includes role-based and scope-based permissions, server-side access checks, session and CSRF controls, PostgreSQL row-level security for tenant isolation, and audit-related infrastructure.',
    ],
    role: 'Solo developer & product builder',
    technologies: ['Next.js', 'React', 'TypeScript', 'NestJS', 'PostgreSQL', 'Drizzle ORM', 'RBAC', 'PostgreSQL RLS'],
    features: [
      'Multi-tenant architecture that keeps each school’s data separate',
      'Role-based modules, actions and portal content, with server-side permission checks',
      'Accounts for principals, vice principals, teachers, accounting staff, students, guardians and other personnel',
      'Teachers assign and track homework; students see their assignments and grades',
      'Accounting, payment and finance modules, plus attendance, exam, grading and staff workflows',
      'RBAC, permission scopes, PostgreSQL row-level security and audit infrastructure',
    ],
    thumbnail: demo('summyra-campus', 'Demo illustration of a school management dashboard with role-based portals'),
    screenshots: [demo('summyra-campus', 'Demo illustration of a school management dashboard with role-based portals')],
    labelColor: '#E0B33F',
    emblem: 'SC',
  },
  {
    slug: 'summyra-panel',
    title: 'Summyra Panel',
    type: 'Hotel reservation management · PWA',
    summary:
      'A mobile-first reservation management app for hotels, with a tap-to-book room calendar, payment and deposit tracking, WhatsApp templates and a daily push summary. Live and in use at a hotel.',
    description: [
      'Hotels often take bookings over WhatsApp and the phone and keep them in a notebook. Summyra Panel replaces that notebook: staff record a reservation with a few taps instead of typing, on a web app that installs on the phone like a native app (PWA). It is live and in daily use at a hotel, and runs at no monthly hosting cost on the free tiers of Cloudflare and Neon.',
      'Double bookings are prevented in the database itself: a PostgreSQL EXCLUDE constraint (btree_gist) on the stay’s date range rejects overlapping reservations even when two devices save at the same moment. Check-out dates and totals are generated columns, and a small versioned migration system runs each step in one transaction under a lock. The data layer picks Neon’s HTTP driver, postgres-js or PGlite (embedded Postgres in WebAssembly) from the connection URL, which solved connection reuse in the serverless runtime.',
      'Web Push is implemented without a library: RFC 8291 (aes128gcm) encryption and RFC 8292 VAPID signing (ES256 JWT) written on WebCrypto, so the same code runs on Node and Cloudflare Workers. Security includes scrypt password hashing tuned to Cloudflare’s per-request CPU limit, HMAC-SHA256 signed session cookies (httpOnly, secure, sameSite), login rate limiting, an authorization check in every server action, search-engine blocking and CSV formula-injection protection.',
      'It is built as a product rather than a one-off: business details live in a single config file, one command generates the password and push keys and uploads every secret to Cloudflare, and a new hotel can be set up in about an hour. End-to-end Playwright tests cover login, booking, a same-room double booking from two tabs, payments, cancel and undo, search, CSV, three screen widths and both themes, run against real Postgres on Node and on Cloudflare’s local runtime (workerd).',
    ],
    role: 'Solo developer & product builder',
    technologies: [
      'TypeScript',
      'Next.js 16',
      'React 19',
      'PostgreSQL',
      'Neon',
      'PGlite',
      'Cloudflare Workers',
      'Tailwind CSS 4',
      'Zod',
      'PWA',
      'Web Push',
      'Playwright',
    ],
    features: [
      'Today screen: occupancy, arrivals and departures, amounts to collect, pending deposits and tomorrow’s guests',
      'Room × day calendar over three weeks with half-day bars; tapping an empty cell opens a booking form for that room and date',
      'Tap-to-book form where occupied rooms close in real time, with one-tap date, nights and guest choices',
      'Database-level protection against double bookings',
      'Payment and deposit tracking with due dates, overdue warnings and partial or full payments',
      'Ready-made WhatsApp messages (confirmation, check-in and deposit reminders, review request), marked once sent',
      'Morning summary pushed to the phone at 08:00 every day',
      'Turkish-character-insensitive search, Excel-friendly CSV export and a monthly report (occupancy, revenue, average nightly rate, breakdown by source and room)',
      'Mobile-first design with light and dark themes',
    ],
    thumbnail: demo('summyra-panel', 'Demo illustration of a hotel reservation dashboard with a booking calendar'),
    screenshots: [demo('summyra-panel', 'Demo illustration of a hotel reservation dashboard with a booking calendar')],
    labelColor: '#6CA6D9',
    emblem: 'SP',
  },
  {
    slug: 'smart-office-security',
    title: 'Smart Office Security',
    type: 'Computer vision · Security',
    summary:
      'A smart-office camera security system that recognizes enrolled faces and raises an alarm by email and phone call when an unfamiliar face is detected.',
    description: [
      'Authorized people are first enrolled by showing their faces to the camera. After that the system watches the camera feeds: enrolled faces pass without alerts, while an unfamiliar face triggers an alarm sent both as an email notification and as an automated phone call. It also covers a night-monitoring use case.',
      'Its public Python module uses YOLOv8n and OpenCV for real-time person detection, bounding boxes, confidence values, and FPS reporting. The face-recognition and alerting parts of the system are not part of that public repository.',
      'This was a team project. I worked on every part of it, from the electrical wiring and camera setup to the dashboard, the Python code and the AI integration, and I built the AI detection component myself.',
    ],
    role: 'Team project — built the AI detection; worked across the whole system',
    technologies: ['Python', 'Ultralytics YOLOv8n', 'OpenCV'],
    features: [
      'Enrollment of authorized faces through the camera',
      'Unfamiliar-face detection that triggers an alarm',
      'Automatic email notifications',
      'Automated phone-call alerts',
      'Day and night monitoring',
      'Monitoring dashboard',
      'Real-time person-detection component built with Python, OpenCV and YOLOv8n',
    ],
    sourceUrl: 'https://github.com/dorukanklnc/smart-office-person-detection',
    sourceLabel: 'Person-detection module source',
    thumbnail: demo('smart-office-security', 'Demo illustration of a security camera feed with a person-detection box and alerts'),
    screenshots: [
      demo('smart-office-security', 'Demo illustration of a security camera feed with a person-detection box and alerts'),
    ],
    labelColor: '#E8845A',
    emblem: 'SO',
  },
  {
    slug: 'tiny-siege-wars',
    title: 'Tiny Siege Wars',
    type: '3D physics-based castle siege game',
    summary:
      'A Unity/C# castle-siege game built around modular castles, physics-driven projectile attacks, and destructible structures.',
    description: [
      'Players build modular 3D castles and attack them with physics-driven projectiles; walls and towers take structural damage and can be destroyed.',
      'The game includes an offline castle editor, defense testing and raid gameplay. It is a personal project in active development; online multiplayer is planned.',
    ],
    role: 'Solo developer',
    technologies: ['Unity 6', 'C#', '3D PhysX'],
    features: [
      'Modular 3D castles',
      'Physics-driven projectile attacks aimed at weak points',
      'Destructible structures',
      'Offline castle editor, defense testing and raid gameplay',
    ],
    thumbnail: demo('tiny-siege-wars', 'Demo illustration of a catapult attacking a crumbling cartoon castle'),
    screenshots: [demo('tiny-siege-wars', 'Demo illustration of a catapult attacking a crumbling cartoon castle')],
    labelColor: '#C79B6D',
    emblem: 'TS',
  },
  {
    slug: 'rolebluff',
    title: 'RoleBluff',
    type: 'iOS social deduction game',
    summary:
      'A pass-and-play social deduction game where players use location-specific roles and one-word clues to identify a hidden impostor.',
    description: [
      'Players receive secret roles linked to a shared location, while one player becomes the impostor. Each person gives a brief clue connected to their role, and the impostor tries to blend in and infer the location without being exposed.',
    ],
    role: 'Solo developer',
    technologies: ['Swift', 'SwiftUI', 'Xcode', 'iOS'],
    features: [
      'Secret roles tied to a shared location, with one hidden impostor',
      'Player handoff and role reveal for shared-device, in-person play',
      'Turn-based clue rounds and round-state screens',
    ],
    thumbnail: demo('rolebluff', 'Demo illustration of the RoleBluff app on an iPhone'),
    screenshots: [demo('rolebluff', 'Demo illustration of the RoleBluff app on an iPhone')],
    labelColor: '#8E6CCF',
    emblem: 'RB',
  },
  {
    slug: 'akil-adasi',
    title: 'Akıl Adası',
    type: 'Educational Android app',
    summary:
      'An educational island adventure for children aged 5–10, with mini-games for arithmetic, seasons, animals, and everyday knowledge.',
    description: [
      'Children explore an island and complete interactive learning activities. The app features child-friendly navigation, several educational mini-games, and XP-based progression.',
    ],
    role: 'Solo developer',
    technologies: ['Java', 'Android Studio', 'Android'],
    features: [
      'Mini-games for addition and multiplication, telling time, seasons, animal habitats and directions',
      'Child-friendly island navigation with drag-and-drop activities',
      'XP progression with daily reset logic',
      'Saved game state with SharedPreferences',
    ],
    thumbnail: demo('akil-adasi', 'Demo illustration of the Akıl Adası app on an Android phone'),
    screenshots: [demo('akil-adasi', 'Demo illustration of the Akıl Adası app on an Android phone')],
    labelColor: '#B9D35A',
    emblem: 'AA',
  },
  {
    slug: 'rfid-attendance',
    title: 'RFID Attendance System',
    type: 'IoT · Access control',
    summary:
      'An RFID access and attendance system that logs entries and exits, prevents duplicate entry, flags time violations, and exports attendance to Excel.',
    role: 'Solo developer',
    technologies: ['Arduino', 'RFID RC522', 'Python', 'Serial communication'],
    features: [
      'Card-based entry and exit logging with timestamps',
      'Anti-passback rule: no second entry without an exit',
      'Time-violation warnings and automated notifications',
      'Attendance export to Excel',
      'Arduino and RC522 reader integrated with Python over serial',
    ],
    thumbnail: demo('rfid-attendance', 'Demo illustration of an RFID reader wired to a small computer'),
    screenshots: [
      demo('rfid-attendance', 'Demo illustration of an RFID reader wired to a small computer'),
    ],
    labelColor: '#E26D7A',
    emblem: 'ID',
  },
  {
    slug: 'ai-experiments',
    title: 'AI Experiments',
    type: 'Placeholder',
    summary: 'A placeholder cartridge for a future AI project.',
    technologies: [],
    thumbnail: demo('ai-experiments', 'Placeholder illustration of a small node graph'),
    screenshots: [demo('ai-experiments', 'Placeholder illustration of a small node graph')],
    labelColor: '#6CC3B5',
    emblem: 'AI',
    placeholder: true,
    // Hidden until there is a real AI project to show. Delete this line to bring it back.
    hidden: true,
  },
]

/** Projects shown on the site (entries with `hidden: true` are left out). */
export const projects = allProjects.filter((p) => !p.hidden)

export function findProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug)
}
