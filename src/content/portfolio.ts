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
    { label: 'Also building', value: 'Full-stack products and mobile games' },
    { label: 'Education', value: 'B.Sc. Computer Engineering, Bahçeşehir University (2021–2026)' },
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
    { label: 'Summyra', href: 'https://summyra.com/', text: 'summyra.com — my software studio' },
    { label: 'Instagram', href: 'https://instagram.com/dorukan_klnc', text: '@dorukan_klnc' },
  ],
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
      'A multi-tenant school management platform with personalized portals, role-based access, and academic and financial workflows.',
    description: [
      'Summyra Campus (CampusOS) is a modular school management platform where school owners, principals, vice principals, teachers, accounting staff, students, guardians, and other personnel sign in with their own accounts and see features appropriate to their responsibilities. Teachers can manage homework, students can view assignments and grades, and accounting staff work with payment and financial records through their authorized areas.',
      'The system uses Next.js/React, NestJS, and PostgreSQL. Its codebase includes role-based and scope-based permissions, server-side access checks, session and CSRF controls, PostgreSQL row-level security for tenant isolation, and audit-related infrastructure.',
    ],
    role: 'Software Developer / Product Builder',
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
    type: 'Hotel reservation data system',
    summary: 'A separate Summyra product for managing and working with hotel reservation data.',
    description: [
      'Summyra Panel focuses on hotel reservation data and operational information. It is a distinct product from Summyra Campus, which serves schools. The feature list and technology stack will be documented from the current implementation.',
    ],
    role: 'Developer / Product Builder',
    // Fill in from the real implementation; nothing is listed until it is verified.
    technologies: [],
    thumbnail: demo('summyra-panel', 'Demo illustration of a hotel reservation dashboard with a booking calendar'),
    screenshots: [demo('summyra-panel', 'Demo illustration of a hotel reservation dashboard with a booking calendar')],
    labelColor: '#6CA6D9',
    emblem: 'SP',
    placeholder: true,
  },
  {
    slug: 'smart-office-security',
    title: 'Smart Office Security',
    type: 'Computer vision · Security',
    summary:
      'A smart-office camera security system with person detection, unauthorized-entry alerts, and email and phone-call notifications.',
    description: [
      'Developed a smart-office monitoring system that detects people through camera feeds and issues alerts for unauthorized or unexpected access. The project includes email notifications and automated phone-call alerts, including a night-monitoring use case.',
      'Its public Python module uses YOLOv8n and OpenCV for real-time person detection, bounding boxes, confidence values, and FPS reporting. The alerting parts of the system are not part of that public repository.',
    ],
    technologies: ['Python', 'Ultralytics YOLOv8n', 'OpenCV'],
    features: [
      'Camera-based person detection for day and night monitoring',
      'Alerts for unauthorized or unrecognized entry',
      'Automatic email notifications',
      'Automated phone-call alerts',
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
    type: '3D physics-based game · In development',
    summary:
      'A Unity/C# castle-siege prototype focused on projectile physics, structural destruction, and tactical weak-point attacks.',
    description: [
      'Developing a 3D physics-based siege game featuring destructible castles, projectile attacks, and structural damage.',
      'Planned next: offline castle construction and defense testing, progression systems, and eventually asynchronous player-created challenges.',
    ],
    technologies: ['Unity 6', 'C#', '3D PhysX'],
    features: [
      'Destructible castles with structural damage',
      'Projectile attacks aimed at tactical weak points',
      'Playable prototype in active development',
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
    technologies: ['Swift', 'SwiftUI', 'Xcode', 'iOS'],
    features: [
      'Secret roles tied to a shared location',
      'Local pass-and-play flow on one device',
      'Round management and role reveal',
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
    technologies: ['Java', 'Android Studio', 'Android'],
    features: [
      'Mini-games for addition and multiplication, telling time, seasons, animal habitats and directions',
      'Child-friendly island navigation',
      'XP-based progression',
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
      'An RFID access and attendance system that logs entries and exits, prevents duplicate entry, and supports automated notifications.',
    technologies: ['Arduino', 'RFID RC522', 'Python', 'Serial communication'],
    features: [
      'Card-based entry and exit logging with timestamps',
      'Anti-passback rule: no second entry without an exit',
      'Automated notifications and entry tracking',
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
