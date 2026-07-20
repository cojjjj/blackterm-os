export type OperatorEventType =
  | "CAREER"
  | "CERTIFICATION"
  | "PROJECT"
  | "PLATFORM"
  | "TRAINING"
  | "COMMUNITY";

export type OperatorEvent = {
  id: string;
  date: string;
  title: string;
  description: string;
  type: OperatorEventType;
  status: "VERIFIED" | "IN PROGRESS" | "PLANNED";
  xp: number;
  source?: string;
};

export const coreOperatorEvents: OperatorEvent[] = [
  {
    id: "desktop-technician",
    date: "2026-07",
    title: "Desktop Support Technician",
    description:
      "Converted hands-on troubleshooting, customer communication, and technical support experience into a professional IT role.",
    type: "CAREER",
    status: "VERIFIED",
    xp: 2500,
    source: "Career milestone",
  },
  {
    id: "blackterm-v155",
    date: "2026-07",
    title: "BLACKTERM OS v15.5",
    description:
      "Released the Achievement Wall, Credential Vault, live AI assistant, cinematic operator feed, and recruiter-focused workstation experience.",
    type: "PLATFORM",
    status: "VERIFIED",
    xp: 2200,
    source: "Production deployment",
  },
  {
    id: "ethical-hacking-principles",
    date: "2026-04",
    title: "Ethical Hacking Principles",
    description:
      "Completed foundational ethical-hacking training focused on responsible testing, attacker methodology, and security principles.",
    type: "CERTIFICATION",
    status: "VERIFIED",
    xp: 600,
    source: "SkillUp",
  },
  {
    id: "credential-vault",
    date: "2026-07",
    title: "Credential Vault Online",
    description:
      "Indexed 19 public certification and training records into a searchable BLACKTERM application.",
    type: "PROJECT",
    status: "VERIFIED",
    xp: 1200,
    source: "BLACKTERM OS",
  },
  {
    id: "live-ai",
    date: "2026-07",
    title: "Live AI Intelligence Core",
    description:
      "Connected a portfolio-grounded AI assistant through a production serverless API with recruiter analysis and desktop controls.",
    type: "PLATFORM",
    status: "VERIFIED",
    xp: 1800,
    source: "OpenAI + Vercel",
  },
  {
    id: "tryhackme-top-one",
    date: "2025",
    title: "Top 1% TryHackMe",
    description:
      "Reached the top 1% of TryHackMe learners through sustained hands-on cybersecurity training.",
    type: "TRAINING",
    status: "VERIFIED",
    xp: 3000,
    source: "TryHackMe",
  },
  {
    id: "one-thousand-rooms",
    date: "2025",
    title: "1,000+ Rooms Completed",
    description:
      "Completed more than one thousand rooms across offensive security, blue-team operations, cloud, web, and incident response.",
    type: "TRAINING",
    status: "VERIFIED",
    xp: 3500,
    source: "TryHackMe",
  },
  {
    id: "google-cybersecurity",
    date: "2025-03",
    title: "Google Cybersecurity",
    description:
      "Completed professional training covering risk, Linux, SQL, networking, detection, incident response, and Python automation.",
    type: "CERTIFICATION",
    status: "VERIFIED",
    xp: 1000,
    source: "Google",
  },
  {
    id: "ibm-cybersecurity",
    date: "2025-03",
    title: "IBM Cybersecurity Analyst",
    description:
      "Completed analyst-focused training involving network security, endpoint protection, threat intelligence, SIEM, and incident response.",
    type: "CERTIFICATION",
    status: "VERIFIED",
    xp: 1000,
    source: "IBM",
  },
  {
    id: "home-soc",
    date: "2026",
    title: "Home SOC Detection Lab",
    description:
      "Built a hands-on monitoring environment with Wazuh, Sysmon, Windows telemetry, and practical detection workflows.",
    type: "PROJECT",
    status: "VERIFIED",
    xp: 1600,
    source: "GitHub project",
  },
  {
    id: "future-security-role",
    date: "FUTURE",
    title: "Security Operations Role",
    description:
      "Continue building professional IT experience while progressing toward a dedicated cybersecurity operations position.",
    type: "CAREER",
    status: "PLANNED",
    xp: 5000,
    source: "Next objective",
  },
];

export const eventTypeLabels: Record<OperatorEventType, string> = {
  CAREER: "Career Event",
  CERTIFICATION: "Verified Credential",
  PROJECT: "Project Deployment",
  PLATFORM: "Platform Evolution",
  TRAINING: "Training Milestone",
  COMMUNITY: "Community Signal",
};
