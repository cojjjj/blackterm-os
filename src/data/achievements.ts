export type AchievementCategory =
  | "Career"
  | "Cybersecurity"
  | "Builder"
  | "Training"
  | "Platform";

export type AchievementRecord = {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  icon: string;
  status: "UNLOCKED" | "LOCKED";
  progress: number;
  target?: string;
  unlockedAt?: string;
  rarity: "COMMON" | "RARE" | "EPIC" | "LEGENDARY";
};

export const achievementRecords: AchievementRecord[] = [
  {
    id: "tryhackme-top-one",
    title: "Top 1% Operator",
    description:
      "Reached the top 1% of TryHackMe learners through sustained hands-on cybersecurity training.",
    category: "Training",
    icon: "◇",
    status: "UNLOCKED",
    progress: 100,
    unlockedAt: "TryHackMe milestone",
    rarity: "LEGENDARY",
  },
  {
    id: "one-thousand-rooms",
    title: "Thousand-Room Veteran",
    description:
      "Completed more than 1,000 TryHackMe rooms across offensive, defensive, cloud, web, and incident-response topics.",
    category: "Training",
    icon: "1000",
    status: "UNLOCKED",
    progress: 100,
    unlockedAt: "TryHackMe milestone",
    rarity: "LEGENDARY",
  },
  {
    id: "credential-vault",
    title: "Credential Vault",
    description:
      "Indexed 19 public certification and training records inside BLACKTERM OS.",
    category: "Training",
    icon: "CV",
    status: "UNLOCKED",
    progress: 100,
    unlockedAt: "BLACKTERM Credential Vault",
    rarity: "EPIC",
  },
  {
    id: "desktop-technician",
    title: "Desktop Support Technician",
    description:
      "Converted hands-on troubleshooting, communication, and technical support experience into a professional IT role.",
    category: "Career",
    icon: "IT",
    status: "UNLOCKED",
    progress: 100,
    unlockedAt: "Career milestone",
    rarity: "EPIC",
  },
  {
    id: "blackterm-creator",
    title: "Creator of BLACKTERM OS",
    description:
      "Designed and shipped an interactive cybersecurity portfolio that behaves like a living operating system.",
    category: "Builder",
    icon: "BT",
    status: "UNLOCKED",
    progress: 100,
    unlockedAt: "BLACKTERM OS",
    rarity: "LEGENDARY",
  },
  {
    id: "live-ai",
    title: "Intelligence Core Online",
    description:
      "Connected BLACKTERM OS to a live portfolio-grounded AI assistant through a production serverless backend.",
    category: "Platform",
    icon: "AI",
    status: "UNLOCKED",
    progress: 100,
    unlockedAt: "OpenAI + Vercel",
    rarity: "EPIC",
  },
  {
    id: "builder-scale",
    title: "Builder at Scale",
    description:
      "Grew BLACKTERM OS beyond 8,000 lines of code while maintaining a working production build.",
    category: "Builder",
    icon: "8K",
    status: "UNLOCKED",
    progress: 100,
    unlockedAt: "Codebase milestone",
    rarity: "RARE",
  },
  {
    id: "cloud-stack",
    title: "Full-Stack Deployment",
    description:
      "Deployed React, TypeScript, Vercel serverless functions, Supabase, and live AI as one connected product.",
    category: "Platform",
    icon: "☁",
    status: "UNLOCKED",
    progress: 100,
    unlockedAt: "Production deployment",
    rarity: "EPIC",
  },
  {
    id: "home-soc",
    title: "Home SOC Operator",
    description:
      "Built a hands-on detection lab involving endpoint telemetry, Wazuh, Sysmon, and security monitoring workflows.",
    category: "Cybersecurity",
    icon: "SOC",
    status: "UNLOCKED",
    progress: 100,
    unlockedAt: "Home SOC Detection Lab",
    rarity: "EPIC",
  },
  {
    id: "security-toolsmith",
    title: "Security Toolsmith",
    description:
      "Built practical security tools spanning phishing analysis, reconnaissance, integrity monitoring, and automation.",
    category: "Cybersecurity",
    icon: "⚙",
    status: "UNLOCKED",
    progress: 100,
    unlockedAt: "Project archive",
    rarity: "LEGENDARY",
  },
  {
    id: "ten-thousand-lines",
    title: "Five-Digit Codebase",
    description:
      "Expand the BLACKTERM ecosystem beyond 10,000 maintained lines of code.",
    category: "Builder",
    icon: "10K",
    status: "LOCKED",
    progress: 80,
    target: "10,000 lines",
    rarity: "EPIC",
  },
  {
    id: "twenty-five-credentials",
    title: "Credential Master",
    description:
      "Reach 25 verified credentials and training records inside the Credential Vault.",
    category: "Training",
    icon: "25",
    status: "LOCKED",
    progress: 76,
    target: "25 records",
    rarity: "LEGENDARY",
  },
];

export const achievementSummary = {
  total: achievementRecords.length,
  unlocked: achievementRecords.filter(
    (achievement) => achievement.status === "UNLOCKED",
  ).length,
  locked: achievementRecords.filter(
    (achievement) => achievement.status === "LOCKED",
  ).length,
  completion: Math.round(
    (achievementRecords.filter(
      (achievement) => achievement.status === "UNLOCKED",
    ).length /
      achievementRecords.length) *
      100,
  ),
};
