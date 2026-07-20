import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useObserverNetwork } from "../context/ObserverNetworkContext";

type AppTarget =
  | "identity"
  | "projects"
  | "skills"
  | "certs"
  | "career"
  | "resume"
  | "github"
  | "tryhackme"
  | "contact"
  | "observer"
  | "noc"
  | "command"
  | "threatmap"
  | "homelab"
  | "incident"
  | "sandbox";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  suggestedApp?: AppTarget;
  category?: string;
};

type ApiReply = {
  answer: string;
  suggestedApp?: AppTarget;
  category?: string;
  mode?: "ai" | "local";
};

interface BlackTermAIProps {
  openApp: (id: AppTarget) => void;
  activeContext?: string;
}

const STARTERS = [
  "Tell me about Tyler",
  "Why should I hire Tyler?",
  "What are Tyler's best projects?",
  "What certifications does Tyler have?",
  "What is BLACKTERM OS?",
  "What can you help me with?",
];

const APP_LABELS: Partial<Record<AppTarget, string>> = {
  identity: "OPEN IDENTITY",
  projects: "OPEN PROJECT ARCHIVE",
  skills: "OPEN SKILLS",
  certs: "OPEN CERTIFICATIONS",
  career: "OPEN CAREER",
  resume: "OPEN RESUME",
  github: "OPEN GITHUB",
  tryhackme: "OPEN TRYHACKME",
  contact: "OPEN SECURE COMMS",
  observer: "OPEN OBSERVER PROFILE",
  noc: "OPEN NETWORK OPERATIONS",
  command: "OPEN COMMAND INTELLIGENCE",
  threatmap: "OPEN THREAT MAP",
  homelab: "OPEN HOME LAB",
  incident: "OPEN INCIDENT ENGINE",
  sandbox: "OPEN MALWARE SANDBOX",
};

function makeId(): string {
  return crypto.randomUUID();
}

function localFallback(question: string): ApiReply {
  const q = question.toLowerCase();

  if (q.includes("hire") || q.includes("why tyler")) {
    return {
      answer:
        "Tyler combines real desktop-support experience with hands-on cybersecurity development. He troubleshoots users and systems, communicates clearly, and independently builds projects involving React, TypeScript, Python, Supabase, Docker, SOC monitoring, threat intelligence, and automation. BLACKTERM OS itself is evidence that he can take a large idea from design through deployment.",
      suggestedApp: "resume",
      category: "RECRUITER ANALYSIS",
      mode: "local",
    };
  }

  if (q.includes("project") || q.includes("blackterm")) {
    return {
      answer:
        "Tyler's featured projects include BLACKTERM OS, BLACKTERM PhishScan, BLACKTERM Recon, a Home SOC Detection Lab, Walmart Calendar Sync OCR, SentinelWatch, Log Integrity Checker, and multi-service Docker environments. They demonstrate security tooling, full-stack development, automation, infrastructure, and reporting.",
      suggestedApp: "projects",
      category: "PROJECT ARCHIVE",
      mode: "local",
    };
  }

  if (q.includes("cert") || q.includes("training")) {
    return {
      answer:
        "Tyler's listed training includes CompTIA ITF+, CEH, PenTest+, Google Cybersecurity, IBM Cybersecurity, and extensive TryHackMe work placing him in the top 1% with more than 1,000 completed rooms.",
      suggestedApp: "certs",
      category: "VERIFIED TRAINING",
      mode: "local",
    };
  }

  if (q.includes("contact") || q.includes("email") || q.includes("reach")) {
    return {
      answer:
        "Tyler's professional contact channels are available through Secure Comms. I can open that application now.",
      suggestedApp: "contact",
      category: "SECURE COMMUNICATIONS",
      mode: "local",
    };
  }

  return {
    answer:
      "The live intelligence service is unavailable, but my local portfolio index is online. Ask about Tyler's background, projects, certifications, skills, experience, resume, GitHub, TryHackMe record, or hiring fit.",
    suggestedApp: "identity",
    category: "LOCAL FALLBACK",
    mode: "local",
  };
}

export default function BlackTermAI({
  openApp,
  activeContext,
}: BlackTermAIProps) {
  const { session } = useObserverNetwork();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: makeId(),
      role: "assistant",
      content:
        "BLACKTERM Intelligence Core online. I know Tyler's portfolio, projects, skills, training, and experience. You can also ask me general questions.",
      category: "SYSTEM INITIALIZATION",
    },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [phase, setPhase] = useState("AWAITING QUERY");
  const logRef = useRef<HTMLDivElement>(null);

  const observerCode = session?.observer.observer_id ?? "UNVERIFIED";
  const clearance = session?.observer.clearance ?? "PUBLIC";

  const recentConversation = useMemo(
    () =>
      messages.slice(-8).map((message) => ({
        role: message.role,
        content: message.content,
      })),
    [messages],
  );

  useEffect(() => {
    logRef.current?.scrollTo({
      top: logRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, thinking]);

  async function ask(question: string) {
    const clean = question.trim();
    if (!clean || thinking) return;

    const userMessage: ChatMessage = {
      id: makeId(),
      role: "user",
      content: clean,
    };

    setMessages((current) => [...current, userMessage]);
    setInput("");
    setThinking(true);
    setPhase("SCANNING PORTFOLIO INDEX");

    const phaseTimer = window.setTimeout(
      () => setPhase("SYNTHESIZING RESPONSE"),
      550,
    );

    try {
      const response = await fetch("/api/blackterm-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: clean,
          conversation: [...recentConversation, userMessage].slice(-8),
          observer: { code: observerCode, clearance },
          activeContext: activeContext ?? "desktop",
        }),
      });

      if (!response.ok) {
        throw new Error(`Intelligence endpoint returned ${response.status}`);
      }

      const reply = (await response.json()) as ApiReply;
      setMessages((current) => [
        ...current,
        {
          id: makeId(),
          role: "assistant",
          content: reply.answer,
          suggestedApp: reply.suggestedApp,
          category: reply.category ?? "INTELLIGENCE RESPONSE",
        },
      ]);
    } catch (error) {
      console.error("BLACKTERM AI request failed:", error);
      const fallback = localFallback(clean);
      setMessages((current) => [
        ...current,
        {
          id: makeId(),
          role: "assistant",
          content: fallback.answer,
          suggestedApp: fallback.suggestedApp,
          category: fallback.category,
        },
      ]);
    } finally {
      window.clearTimeout(phaseTimer);
      setThinking(false);
      setPhase("CHANNEL READY");
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    void ask(input);
  }

  return (
    <div className="bt-ai">
      <header className="bt-ai-header">
        <div className="bt-ai-core" aria-hidden="true">
          <i />
          <span>BT</span>
          <b />
        </div>
        <div>
          <small>BLACKTERM INTELLIGENCE CORE // v3.0</small>
          <h1>Ask anything. Explore everything.</h1>
          <p>
            Portfolio-grounded intelligence with general conversational access.
          </p>
        </div>
        <div className="bt-ai-status">
          <span>● ONLINE</span>
          <small>{observerCode}</small>
          <b>{clearance}</b>
        </div>
      </header>

      <div className="bt-ai-layout">
        <aside className="bt-ai-sidebar">
          <section>
            <small>KNOWLEDGE SOURCES</small>
            {[
              ["Portfolio", "INDEXED"],
              ["Projects", "INDEXED"],
              ["Resume", "LOADED"],
              ["Observer Network", "LIVE"],
              ["General Knowledge", "ENABLED"],
            ].map(([name, state]) => (
              <div key={name}>
                <span>{name}</span>
                <b>{state}</b>
              </div>
            ))}
          </section>

          <section>
            <small>QUICK QUERIES</small>
            {STARTERS.map((starter) => (
              <button key={starter} onClick={() => void ask(starter)}>
                {starter}
              </button>
            ))}
          </section>

          <section className="bt-ai-privacy">
            <small>SECURITY NOTICE</small>
            <p>
              Public portfolio context only. Private credentials and backend
              secrets are never included in prompts.
            </p>
          </section>
        </aside>

        <main className="bt-ai-chat">
          <div className="bt-ai-log" ref={logRef}>
            {messages.map((message) => (
              <article key={message.id} className={`bt-ai-message ${message.role}`}>
                <header>
                  <strong>
                    {message.role === "assistant"
                      ? "BLACKTERM AI"
                      : "OBSERVER"}
                  </strong>
                  <small>
                    {message.category ??
                      (message.role === "user" ? "QUERY" : "RESPONSE")}
                  </small>
                </header>
                <p>{message.content}</p>
                {message.suggestedApp && APP_LABELS[message.suggestedApp] && (
                  <button onClick={() => openApp(message.suggestedApp!)}>
                    {APP_LABELS[message.suggestedApp]} →
                  </button>
                )}
              </article>
            ))}

            {thinking && (
              <article className="bt-ai-message assistant thinking">
                <header>
                  <strong>BLACKTERM AI</strong>
                  <small>{phase}</small>
                </header>
                <div className="bt-ai-thinking">
                  <i />
                  <i />
                  <i />
                </div>
                <div className="bt-ai-scanline" />
              </article>
            )}
          </div>

          <form className="bt-ai-input" onSubmit={submit}>
            <span>&gt;</span>
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask about Tyler, BLACKTERM, cybersecurity, or anything else..."
              maxLength={1200}
              autoFocus
            />
            <button type="submit" disabled={thinking || !input.trim()}>
              {thinking ? "PROCESSING" : "TRANSMIT"}
            </button>
          </form>
        </main>
      </div>
    </div>
  );
}
