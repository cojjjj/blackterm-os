export type CredentialCategory =
  | "Offensive Security"
  | "Defensive Security"
  | "Security Engineering"
  | "Foundations"
  | "Professional";

export type CredentialRecord = {
  name: string;
  issuer: string;
  issued: string;
  expires?: string;
  credentialId: string;
  category: CredentialCategory;
  status: "ACTIVE" | "LIFETIME";
  description: string;
  verificationUrl?: string;
};

export const credentialRecords: CredentialRecord[] = [
  {
    name: "Introduction to Ethical Hacking Principles",
    issuer: "SkillUp",
    issued: "April 2026",
    credentialId: "4D3Q7UPMOX5W",
    category: "Foundations",
    status: "LIFETIME",
    description:
      "Foundational ethical-hacking concepts, security principles, attacker methodology, and responsible testing practices.",
  },
  {
    name: "Red Teaming Certificate",
    issuer: "TryHackMe",
    issued: "January 2025",
    expires: "February 2029",
    credentialId: "THM-JJNPWHHQG1",
    category: "Offensive Security",
    status: "ACTIVE",
    description:
      "Red-team operations, adversary simulation, initial access, persistence, privilege escalation, and reporting.",
  },
  {
    name: "Advent of Cyber 2024 Certificate",
    issuer: "TryHackMe",
    issued: "January 2025",
    expires: "February 2029",
    credentialId: "THM-P1QRARFV0Q",
    category: "Foundations",
    status: "ACTIVE",
    description:
      "Hands-on security challenges spanning web security, defensive analysis, cloud, forensics, and exploitation.",
  },
  {
    name: "Jr Penetration Tester Certificate",
    issuer: "TryHackMe",
    issued: "January 2025",
    expires: "February 2029",
    credentialId: "THM-XJBJ2VKKJK",
    category: "Offensive Security",
    status: "ACTIVE",
    description:
      "Practical penetration-testing methodology covering reconnaissance, enumeration, exploitation, and reporting.",
  },
  {
    name: "Beginner Pathway Certificate",
    issuer: "TryHackMe",
    issued: "January 2025",
    expires: "February 2029",
    credentialId: "THM-OVM1QATNBV",
    category: "Foundations",
    status: "ACTIVE",
    description:
      "Core Linux, networking, web, security, and introductory offensive and defensive concepts.",
  },
  {
    name: "Web Fundamentals Certificate",
    issuer: "TryHackMe",
    issued: "January 2025",
    expires: "February 2029",
    credentialId: "THM-6BVL3BO1AK",
    category: "Foundations",
    status: "ACTIVE",
    description:
      "HTTP, web architecture, authentication, common vulnerabilities, and fundamental web-testing techniques.",
  },
  {
    name: "Web Application Pentesting Certificate",
    issuer: "TryHackMe",
    issued: "January 2025",
    expires: "February 2029",
    credentialId: "THM-PA5JLFSNXM",
    category: "Offensive Security",
    status: "ACTIVE",
    description:
      "Hands-on web application security testing across authentication, access control, injection, and server-side flaws.",
  },
  {
    name: "DevSecOps Certificate",
    issuer: "TryHackMe",
    issued: "January 2025",
    expires: "February 2029",
    credentialId: "THM-VFX7AQ0IQL",
    category: "Security Engineering",
    status: "ACTIVE",
    description:
      "Secure development workflows, CI/CD security, dependency risk, container security, and security automation.",
  },
  {
    name: "Blue Team Pathway Certificate",
    issuer: "TryHackMe",
    issued: "January 2025",
    expires: "February 2029",
    credentialId: "THM-QKVE6DG0UD",
    category: "Defensive Security",
    status: "ACTIVE",
    description:
      "Threat detection, log analysis, incident response, security monitoring, and defensive investigation workflows.",
  },
  {
    name: "Security Engineer Certificate",
    issuer: "TryHackMe",
    issued: "January 2025",
    expires: "February 2029",
    credentialId: "THM-ZGEUZ8JZHP",
    category: "Security Engineering",
    status: "ACTIVE",
    description:
      "Secure systems engineering, application security, network controls, threat modeling, and defensive architecture.",
  },
  {
    name: "Cyber Security 101 Certificate",
    issuer: "TryHackMe",
    issued: "January 2025",
    expires: "February 2029",
    credentialId: "THM-JBTDGSVRRL",
    category: "Foundations",
    status: "ACTIVE",
    description:
      "Broad cybersecurity fundamentals across networking, Linux, Windows, cryptography, offensive security, and defense.",
  },
  {
    name: "Offensive Pentesting Certificate",
    issuer: "TryHackMe",
    issued: "January 2025",
    expires: "February 2029",
    credentialId: "THM-NTVMXLHNUU",
    category: "Offensive Security",
    status: "ACTIVE",
    description:
      "Advanced practical offensive-security training in enumeration, exploitation, privilege escalation, and attack paths.",
  },
  {
    name: "CompTIA PenTest+ Pathway Certificate",
    issuer: "TryHackMe",
    issued: "January 2025",
    expires: "February 2029",
    credentialId: "THM-L00WJNUX3P",
    category: "Offensive Security",
    status: "ACTIVE",
    description:
      "Training aligned to penetration-testing planning, information gathering, attacks, vulnerability analysis, and reporting.",
  },
  {
    name: "SOC Level 2 Certificate",
    issuer: "TryHackMe",
    issued: "January 2025",
    expires: "February 2029",
    credentialId: "THM-I4AKYQT0TF",
    category: "Defensive Security",
    status: "ACTIVE",
    description:
      "Intermediate SOC analysis including threat hunting, malware triage, detection engineering, and incident investigation.",
  },
  {
    name: "Intro to Cyber Pathway Certificate",
    issuer: "TryHackMe",
    issued: "January 2025",
    expires: "February 2029",
    credentialId: "THM-3FN4E4FZB9",
    category: "Foundations",
    status: "ACTIVE",
    description:
      "Introduction to offensive security, defensive security, networking, web technology, and cyber career paths.",
  },
  {
    name: "Pre Security (New) Certificate",
    issuer: "TryHackMe",
    issued: "January 2025",
    expires: "January 2028",
    credentialId: "THM-RTRSZPL3VD",
    category: "Foundations",
    status: "ACTIVE",
    description:
      "Computer fundamentals, networking basics, web foundations, Linux, Windows, and introductory security concepts.",
  },
  {
    name: "IBM Cybersecurity Analyst",
    issuer: "IBM",
    issued: "March 2025",
    credentialId: "D25S1KQ9SW6M",
    category: "Professional",
    status: "LIFETIME",
    description:
      "Cybersecurity analysis, network security, endpoint protection, incident response, threat intelligence, and SIEM concepts.",
  },
  {
    name: "Google Cybersecurity",
    issuer: "Google",
    issued: "March 2025",
    credentialId: "JL8HSSNHA91F",
    category: "Professional",
    status: "LIFETIME",
    description:
      "Security foundations, risk management, Linux, SQL, network security, detection, incident response, and Python automation.",
  },
  {
    name: "Google IT Support",
    issuer: "Google",
    issued: "March 2025",
    credentialId: "7LWQG7AFP46S",
    category: "Professional",
    status: "LIFETIME",
    description:
      "Technical support, computer hardware, operating systems, networking, system administration, and IT security.",
  },
];

export const credentialSummary = {
  total: credentialRecords.length,
  active: credentialRecords.filter((credential) => credential.status === "ACTIVE").length,
  lifetime: credentialRecords.filter((credential) => credential.status === "LIFETIME").length,
  issuers: new Set(credentialRecords.map((credential) => credential.issuer)).size,
};
