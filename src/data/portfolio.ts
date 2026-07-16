export const profile = {
  name: 'Tyler Deppa',
  initials: 'TD',
  title: 'Desktop Support Technician • Cybersecurity Student • Security Tool Builder',
  location: 'Western New York, USA',
  summary:
    'I am a hands-on IT support professional and cybersecurity student who enjoys troubleshooting systems, helping users, and building practical security tools. My work spans desktop support, networking, Windows and Linux administration, automation, SOC labs, and offensive-security training.',
  stats: [
    ['TryHackMe', 'Top 1%'],
    ['Rooms Completed', '1000+'],
    ['Security Projects', '10+'],
    ['Current Track', 'Cybersecurity']
  ]
};

export const projects = [
  {
    name: 'BlackTerm PhishScan',
    type: 'Threat Intelligence Tool',
    status: 'ACTIVE',
    description: 'A modular phishing and URL threat-intelligence scanner with risk scoring, screenshots, WHOIS, SSL, DNS, IP intelligence, and exportable HTML/JSON reports.',
    tech: ['Python', 'VirusTotal', 'URLHaus', 'Rich CLI', 'HTML Reports'],
    github: 'https://github.com/cojjjj'
  },
  {
    name: 'Walmart Calendar Sync OCR',
    type: 'Automation Utility',
    status: 'ACTIVE',
    description: 'Reads schedule screenshots with OCR and converts detected shifts into structured data for Google Calendar, CSV, and JSON workflows.',
    tech: ['Python', 'OCR', 'Google Calendar API', 'CSV', 'JSON'],
    github: 'https://github.com/cojjjj/walmart-calendar-sync-ocr'
  },
  {
    name: 'Home SOC Detection Lab',
    type: 'Blue Team Environment',
    status: 'LAB',
    description: 'A home security operations environment using Wazuh, Sysmon, Windows telemetry, endpoint monitoring, alert investigation, and detection engineering practice.',
    tech: ['Wazuh', 'Sysmon', 'Windows', 'VirtualBox', 'SIEM'],
    github: 'https://github.com/cojjjj'
  },
  {
    name: 'Multi-Service Docker Lab',
    type: 'DevSecOps Lab',
    status: 'LAB',
    description: 'A multi-container stack with a React frontend, Node API, MongoDB, Redis, Nginx, health checks, secrets, volumes, and isolated networking.',
    tech: ['Docker', 'React', 'Node.js', 'MongoDB', 'Redis', 'Nginx'],
    github: 'https://github.com/cojjjj'
  },
  {
    name: 'Log Integrity Checker',
    type: 'Security Utility',
    status: 'COMPLETE',
    description: 'Detects unexpected file changes using SHA-256 hashing, repeatable baselines, and clear integrity alerts.',
    tech: ['Python', 'SHA-256', 'File Monitoring'],
    github: 'https://github.com/cojjjj'
  },
  {
    name: 'SentinelWatch',
    type: 'Monitoring Project',
    status: 'COMPLETE',
    description: 'A security-focused monitoring project built to practice observability, alerting, and defensive engineering workflows.',
    tech: ['Python', 'Monitoring', 'Security Engineering'],
    github: 'https://github.com/cojjjj'
  }
];

export const skills = [
  ['Desktop & User Support', 94],
  ['Windows Administration', 91],
  ['Cybersecurity Fundamentals', 90],
  ['Customer Communication', 92],
  ['Networking & Connectivity', 84],
  ['Linux / Kali Linux', 81],
  ['Python & Automation', 79],
  ['Docker / DevOps', 73],
  ['Web Development', 72]
] as const;

export const certifications = [
  ['CompTIA ITF+', 'Foundational IT'],
  ['Certified Ethical Hacker (CEH)', 'Offensive Security'],
  ['CompTIA PenTest+', 'Penetration Testing'],
  ['Google Cybersecurity Certificate', 'Security Operations'],
  ['IBM Cybersecurity Analyst Certificate', 'Cyber Defense'],
  ['Cyber Defense Training - Part 1', 'Defensive Security'],
  ['TryHackMe Top 1% - 1000+ Rooms', 'Hands-on Labs']
] as const;

export const experience = [
  {
    role: 'Desktop Support Technician',
    company: 'Prestolite Electric',
    period: '2026 - Present',
    details: 'Supporting users, troubleshooting hardware and software, resolving connectivity issues, and growing enterprise desktop-support experience.'
  },
  {
    role: 'Audio Visual Tech / IT Help Desk',
    company: 'Salamanca High School',
    period: 'Previous Experience',
    details: 'Supported Windows, macOS, and ChromeOS devices; installed classroom technology; diagnosed hardware, software, AV, and network issues; documented solutions; trained non-technical users; and maintained equipment inventory.'
  },
  {
    role: 'Cybersecurity Student',
    company: 'Jamestown Community College',
    period: '2025 - Present',
    details: 'Studying cybersecurity, networking, scripting, system administration, penetration testing, vulnerability assessment, and incident response.'
  },
  {
    role: 'Lot Associate',
    company: 'The Home Depot',
    period: 'Previous Experience',
    details: 'Delivered customer-focused service, supported curbside pickup and loading, maintained safety standards, and worked effectively in a fast-paced team environment.'
  }
];

export const socials = [
  ['GitHub', 'https://github.com/cojjjj'],
  ['YouTube', 'https://youtube.com/@dyyeet1806'],
  ['Twitch', 'https://twitch.tv/blackterimanll'],
  ['LinkedIn', '#'],
  ['Email', 'mailto:Deppatyler@gmail.com']
] as const;
