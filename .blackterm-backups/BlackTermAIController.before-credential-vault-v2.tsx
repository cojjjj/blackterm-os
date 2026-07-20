import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useObserverNetwork } from "../context/ObserverNetworkContext";
import {
  networkOperationsService,
  type NetworkOverview,
} from "../services/networkOperationsService";

type AppTarget =
  | "command"
  | "noc"
  | "observer"
  | "identity"
  | "projects"
  | "files"
  | "security"
  | "skills"
  | "certs"
  | "career"
  | "resume"
  | "terminal"
  | "contact"
  | "settings"
  | "github"
  | "tryhackme"
  | "assistant"
  | "gallery"
  | "interview"
  | "threatmap"
  | "homelab"
  | "incident"
  | "sandbox";

type ChatAction = {
  label: string;
  app: AppTarget;
};

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  actions?: ChatAction[];
  category?: string;
};

type ApiHistoryItem = {
  role: "user" | "assistant";
  content: string;
};

type ApiReply = {
  text?: string;
  error?: string;
};

interface BlackTermAIControllerProps {
  openApp: (id: AppTarget) => void;
  notify: (message: string) => void;
  activeContext?: AppTarget;
}

const EMPTY_OVERVIEW: NetworkOverview = {
  active_observers: 0,
  total_observers: 0,
  total_visits: 0,
  open_transmissions: 0,
};

const COMMANDS: Array<{
  app: AppTarget;
  title: string;
  aliases: string[];
}> = [
  { app: "resume", title: "Resume.pdf", aliases: ["resume", "cv"] },
  {
    app: "projects",
    title: "Project Archive",
    aliases: ["project archive", "projects", "python projects"],
  },
  { app: "github", title: "GitHub Live", aliases: ["github", "repositories", "repos"] },
  {
    app: "observer",
    title: "Observer Network",
    aliases: ["observer network", "observer profile", "profile"],
  },
  {
    app: "noc",
    title: "Network Operations",
    aliases: ["network operations", "noc", "active observers", "live network"],
  },
  {
    app: "command",
    title: "Command Intelligence",
    aliases: ["command intelligence", "mission", "daily mission"],
  },
  {
    app: "threatmap",
    title: "Threat Map",
    aliases: ["threat map", "threat intelligence"],
  },
  { app: "homelab", title: "Home Lab", aliases: ["home lab", "soc lab", "cyber range"] },
  {
    app: "incident",
    title: "Incident Engine",
    aliases: ["incident engine", "incident response", "ir lab"],
  },
  {
    app: "sandbox",
    title: "Malware Sandbox",
    aliases: ["malware sandbox", "sandbox", "malware analysis"],
  },
  {
    app: "certs",
    title: "Certifications",
    aliases: ["certifications", "certificates", "certs"],
  },
  { app: "skills", title: "Skills Monitor", aliases: ["skills", "capabilities"] },
  {
    app: "career",
    title: "Career Timeline",
    aliases: ["career", "experience", "work history"],
  },
  { app: "contact", title: "Secure Comms", aliases: ["contact", "email", "connect"] },
  { app: "terminal", title: "BlackTerm", aliases: ["terminal", "shell"] },
  { app: "security", title: "Security Center", aliases: ["security center"] },
  { app: "settings", title: "Settings", aliases: ["settings", "personalization"] },
  { app: "tryhackme", title: "TryHackMe", aliases: ["tryhackme", "training record"] },
];

const SUGGESTIONS = [
  "Tell me about Tyler",
  "I'm hiring for desktop support",
  "Show Python projects",
  "What certifications does Tyler have?",
  "Open Incident Engine",
];

function makeId(): string {
  return crypto.randomUUID();
}

function detectCommand(query: string) {
  const normalized = query.toLowerCase();
  const hasVerb = /\b(open|show|launch|start|display|view|bring up|take me to)\b/i.test(query);
  if (!hasVerb) return null;
  return (
    COMMANDS.find((command) =>
      command.aliases.some((alias) => normalized.includes(alias)),
    ) ?? null
  );
}

function suggestedActions(text: string): ChatAction[] {
  const normalized = text.toLowerCase();
  const actions: ChatAction[] = [];

  const add = (label: string, app: AppTarget) => {
    if (!actions.some((action) => action.app === app)) {
      actions.push({ label, app });
    }
  };

  if (normalized.includes("resume") || normalized.includes("desktop support")) add("Open Resume", "resume");
  if (normalized.includes("project") || normalized.includes("python") || normalized.includes("blackterm")) add("View Projects", "projects");
  if (normalized.includes("soc") || normalized.includes("incident") || normalized.includes("detection")) add("Open Incident Engine", "incident");
  if (normalized.includes("github") || normalized.includes("repository")) add("Open GitHub", "github");
  if (normalized.includes("certification")) add("View Certifications", "certs");
  if (normalized.includes("observer") || normalized.includes("network")) add("Open Observer Network", "observer");

  return actions.slice(0, 3);
}

function isRecruiterQuery(query: string): boolean {
  return /\b(hiring|hire|job description|candidate|role|recruiter|fit|match|qualification)\b/i.test(query);
}

export default function BlackTermAIController({
  openApp,
  notify,
  activeContext = "assistant",
}: BlackTermAIControllerProps) {
  const { session } = useObserverNetwork();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: makeId(),
      role: "assistant",
      content:
        "BLACKTERM Intelligence Core online. Ask about Tyler, paste a job description, inspect live network activity, or tell me which application to open.",
      category: "SYSTEM INITIALIZATION",
      actions: [
        { label: "Why hire Tyler?", app: "interview" },
        { label: "Open Resume", app: "resume" },
        { label: "Project Archive", app: "projects" },
      ],
    },
  ]);

  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [mode, setMode] = useState<"CONNECTING" | "LIVE AI" | "LOCAL FALLBACK">("CONNECTING");
  const [overview, setOverview] = useState<NetworkOverview>(EMPTY_OVERVIEW);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const refresh = async () => {
      try {
        const next = await networkOperationsService.getOverview();
        setOverview(next);
      } catch (error) {
        console.error("BLACKTERM AI telemetry failed:", error);
      }
    };

    void refresh();
    const timer = window.setInterval(() => void refresh(), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    logRef.current?.scrollTo({
      top: logRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, thinking]);

  const observerCode = session?.observer.observer_id ?? "UNASSIGNED";
  const clearance = session?.observer.clearance ?? "VISITOR";

  const liveContext = useMemo(
    () => ({
      activeApp: activeContext,
      observerId: observerCode,
      clearance,
      achievements: session?.achievements.length ?? 0,
      points: session?.points ?? 0,
      activeObservers: overview.active_observers,
      totalObservers: overview.total_observers,
      networkConnections: overview.total_visits,
      transmissions: overview.open_transmissions,
    }),
    [activeContext, clearance, observerCode, overview, session?.achievements.length, session?.points],
  );

  function addMessage(message: Omit<ChatMessage, "id">) {
    setMessages((current) => [...current, { ...message, id: makeId() }]);
  }

  function runLocalCommand(query: string): boolean {
    const command = detectCommand(query);

    if (command) {
      openApp(command.app);
      notify(`BLACKTERM AI launched ${command.title}.`);
      addMessage({
        role: "assistant",
        content: `Directive accepted. Launching ${command.title}.`,
        category: "OS COMMAND",
        actions: [{ label: `Open ${command.title}`, app: command.app }],
      });
      setMode("LIVE AI");
      return true;
    }

    if (/\b(recruiter mode|recruiter workflow|recruiter tour)\b/i.test(query)) {
      openApp("interview");
      openApp("resume");
      notify("Recruiter evidence workflow opened.");
      addMessage({
        role: "assistant",
        content:
          "Recruiter workflow initialized. I opened Tyler's hiring summary and resume so the strongest evidence is immediately available.",
        category: "RECRUITER WORKFLOW",
        actions: [
          { label: "Hiring Summary", app: "interview" },
          { label: "Resume", app: "resume" },
          { label: "Career Timeline", app: "career" },
        ],
      });
      setMode("LIVE AI");
      return true;
    }

    if (/\b(show|check|report).*(online|observers|network status)\b/i.test(query)) {
      addMessage({
        role: "assistant",
        content:
          `Observer Network report: ${overview.active_observers} active, ` +
          `${overview.total_observers} registered, ${overview.total_visits} recorded connections, ` +
          `and ${overview.open_transmissions} indexed transmissions.`,
        category: "LIVE NETWORK REPORT",
        actions: [
          { label: "Open NOC", app: "noc" },
          { label: "Observer Profile", app: "observer" },
        ],
      });
      setMode("LIVE AI");
      return true;
    }

    return false;
  }

  async function submit(question = input) {
    const query = question.trim();
    if (!query || thinking) return;

    addMessage({
      role: "user",
      content: query,
      category: "VISITOR QUERY",
    });
    setInput("");

    if (runLocalCommand(query)) return;

    setThinking(true);
    setMode("CONNECTING");

    try {
      const history: ApiHistoryItem[] = messages.slice(-8).map((message) => ({
        role: message.role,
        content: message.content,
      }));

      const recruiterInstruction = isRecruiterQuery(query)
        ? "\nThis is a recruiter or job-fit query. Give a clear, evidence-based fit assessment, identify strengths and honest gaps, and recommend which portfolio applications to inspect."
        : "";

      const response = await fetch("/api/blackterm-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message:
            query +
            recruiterInstruction +
            `\n\nLive BLACKTERM state: ${JSON.stringify(liveContext)}`,
          history,
          activeContext,
        }),
      });

      const rawText = await response.text();
      let payload: ApiReply = {};

      try {
        payload = rawText ? (JSON.parse(rawText) as ApiReply) : {};
      } catch {
        payload = {
          error: rawText || "The intelligence service returned invalid JSON.",
        };
      }

      if (!response.ok) {
        throw new Error(
          payload.error || `Intelligence service returned ${response.status}.`,
        );
      }

      const answer = payload.text?.trim();
      if (!answer) {
        throw new Error("The intelligence service returned an empty answer.");
      }

      addMessage({
        role: "assistant",
        content: answer,
        category: "LIVE INTELLIGENCE RESPONSE",
        actions: suggestedActions(answer),
      });
      setMode("LIVE AI");
    } catch (error) {
      console.error("BLACKTERM AI request failed:", error);
      addMessage({
        role: "assistant",
        content:
          error instanceof Error
            ? `Live intelligence is temporarily unavailable: ${error.message}`
            : "Live intelligence is temporarily unavailable. The local command layer remains operational.",
        category: "LOCAL FALLBACK",
        actions: [
          { label: "Open Resume", app: "resume" },
          { label: "View Projects", app: "projects" },
          { label: "Network Operations", app: "noc" },
        ],
      });
      setMode("LOCAL FALLBACK");
    } finally {
      setThinking(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void submit();
  }

  return (
    <div className="bt-ai-control">
      <header className="bt-ai-control-header">
        <div className="bt-ai-core-mark" aria-hidden="true">
          <span>BT</span>
          <i />
        </div>

        <div>
          <small>BLACKTERM INTELLIGENCE CORE</small>
          <h2>Operating System Assistant</h2>
          <p>Portfolio knowledge, recruiter analysis, live telemetry, and desktop control.</p>
        </div>

        <div className={`bt-ai-mode mode-${mode.toLowerCase().replaceAll(" ", "-")}`}>
          <i />
          <span>{mode}</span>
        </div>
      </header>

      <section className="bt-ai-telemetry">
        <article><small>OBSERVER</small><strong>{observerCode}</strong></article>
        <article><small>ACTIVE OBSERVERS</small><strong>{overview.active_observers}</strong></article>
        <article><small>NETWORK CONNECTIONS</small><strong>{overview.total_visits}</strong></article>
        <article><small>ACTIVE CONTEXT</small><strong>{String(activeContext).toUpperCase()}</strong></article>
      </section>

      <div className="bt-ai-layout">
        <aside className="bt-ai-command-panel">
          <small>OS DIRECTIVES</small>
          <button onClick={() => void submit("Open my resume")}>OPEN RESUME</button>
          <button onClick={() => void submit("Show my projects")}>PROJECT ARCHIVE</button>
          <button onClick={() => void submit("Open Network Operations")}>NETWORK OPERATIONS</button>
          <button onClick={() => void submit("Start recruiter mode")}>RECRUITER WORKFLOW</button>

          <small>QUERY TEMPLATES</small>
          <button onClick={() => void submit("Why should someone hire Tyler?")}>WHY HIRE TYLER?</button>
          <button onClick={() => void submit("Show the strongest cybersecurity projects in Tyler's portfolio.")}>CYBER PROJECTS</button>
          <button onClick={() => void submit("Report current observer network status")}>LIVE NETWORK REPORT</button>
        </aside>

        <section className="bt-ai-chat">
          <div className="bt-ai-log" ref={logRef}>
            {messages.map((message) => (
              <article className={message.role} key={message.id}>
                <small>{message.role === "assistant" ? "BLACKTERM AI" : "VISITOR"}</small>
                {message.category ? <b>{message.category}</b> : null}
                <p>{message.content}</p>
                {message.actions?.length ? (
                  <div>
                    {message.actions.map((action) => (
                      <button key={`${action.app}-${action.label}`} onClick={() => openApp(action.app)}>
                        {action.label} ↗
                      </button>
                    ))}
                  </div>
                ) : null}
              </article>
            ))}

            {thinking ? (
              <article className="assistant bt-ai-thinking">
                <small>BLACKTERM AI</small>
                <p>Synchronizing portfolio index and live system context...</p>
                <i />
              </article>
            ) : null}
          </div>

          <div className="bt-ai-suggestions">
            {SUGGESTIONS.map((suggestion) => (
              <button key={suggestion} onClick={() => void submit(suggestion)}>
                {suggestion}
              </button>
            ))}
          </div>

          <form className="bt-ai-input" onSubmit={handleSubmit}>
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask about Tyler, paste a job description, or issue an OS command..."
              maxLength={1500}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void submit();
                }
              }}
            />

            <button type="submit" disabled={thinking || !input.trim()}>
              {thinking ? "ANALYZING" : "SEND"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
