import { useEffect, useMemo, useState } from "react";
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
  from: "user" | "ai";
  text: string;
  actions?: ChatAction[];
};

type Props = {
  openApp: (id: AppTarget) => void;
  notify: (message: string) => void;
  activeContext?: AppTarget;
};

const emptyOverview: NetworkOverview = {
  active_observers: 0,
  total_observers: 0,
  total_visits: 0,
  open_transmissions: 0,
};

const appCommands: Array<{
  app: AppTarget;
  labels: string[];
  title: string;
}> = [
  { app: "resume", title: "Resume.pdf", labels: ["resume", "cv"] },
  {
    app: "projects",
    title: "Project Archive",
    labels: ["project archive", "projects", "python projects", "portfolio projects"],
  },
  { app: "github", title: "GitHub Live", labels: ["github", "repositories", "repos"] },
  {
    app: "observer",
    title: "Observer Network",
    labels: ["observer profile", "observer network", "my profile"],
  },
  {
    app: "noc",
    title: "Network Operations",
    labels: ["network operations", "noc", "active observers", "live network"],
  },
  {
    app: "command",
    title: "Command Intelligence",
    labels: ["command intelligence", "daily mission", "mission"],
  },
  {
    app: "threatmap",
    title: "Threat Map",
    labels: ["threat map", "threat intelligence", "global threats"],
  },
  { app: "homelab", title: "Home Lab", labels: ["home lab", "soc lab", "cyber range"] },
  {
    app: "incident",
    title: "Incident Engine",
    labels: ["incident engine", "incident response", "ir lab"],
  },
  {
    app: "sandbox",
    title: "Malware Sandbox",
    labels: ["malware sandbox", "sandbox", "malware analysis"],
  },
  {
    app: "certs",
    title: "Certifications",
    labels: ["certifications", "certificates", "certs"],
  },
  { app: "skills", title: "Skills Monitor", labels: ["skills", "capabilities"] },
  {
    app: "career",
    title: "Career Timeline",
    labels: ["career", "experience", "work history"],
  },
  { app: "contact", title: "Secure Comms", labels: ["contact", "email", "connect"] },
  { app: "terminal", title: "BlackTerm", labels: ["terminal", "shell", "blackterm"] },
  { app: "security", title: "Security Center", labels: ["security center", "security"] },
  { app: "settings", title: "Settings", labels: ["settings", "personalization"] },
  { app: "tryhackme", title: "TryHackMe", labels: ["tryhackme", "training record"] },
];

function detectAppCommand(query: string) {
  const normalized = query.toLowerCase();
  const commandVerb =
    /\b(open|show|launch|start|take me to|display|view|bring up)\b/i.test(query);

  if (!commandVerb) return null;

  return (
    appCommands.find((command) =>
      command.labels.some((label) => normalized.includes(label)),
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

  if (normalized.includes("resume") || normalized.includes("desktop support")) {
    add("Open Resume", "resume");
  }
  if (
    normalized.includes("project") ||
    normalized.includes("python") ||
    normalized.includes("blackterm")
  ) {
    add("View Projects", "projects");
  }
  if (
    normalized.includes("soc") ||
    normalized.includes("incident") ||
    normalized.includes("detection")
  ) {
    add("Open Incident Engine", "incident");
  }
  if (normalized.includes("github") || normalized.includes("repository")) {
    add("Open GitHub", "github");
  }
  if (normalized.includes("certification")) {
    add("View Certifications", "certs");
  }
  if (normalized.includes("observer") || normalized.includes("network")) {
    add("Open Observer Network", "observer");
  }

  return actions.slice(0, 3);
}

function isRecruiterQuery(query: string): boolean {
  return /\b(hiring|hire|job description|candidate|role|recruiter|fit|match|qualification)\b/i.test(
    query,
  );
}

export default function BlackTermAIController({
  openApp,
  notify,
  activeContext,
}: Props) {
  const { session } = useObserverNetwork();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      from: "ai",
      text:
        "BLACKTERM Intelligence Core online. Ask about Tyler, paste a job description, inspect live network activity, or tell me which application to open.",
      actions: [
        { label: "Why hire Tyler?", app: "interview" },
        { label: "Open Resume", app: "resume" },
        { label: "Project Archive", app: "projects" },
      ],
    },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [mode, setMode] = useState<"CONNECTING" | "LIVE AI" | "LOCAL FALLBACK">(
    "CONNECTING",
  );
  const [overview, setOverview] = useState<NetworkOverview>(emptyOverview);

  const refreshNetwork = async () => {
    try {
      const nextOverview = await networkOperationsService.getOverview();
      setOverview(nextOverview);
    } catch (error) {
      console.error("BLACKTERM AI network context failed:", error);
    }
  };

  useEffect(() => {
    void refreshNetwork();
    const timer = window.setInterval(() => void refreshNetwork(), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const contextSummary = useMemo(
    () => ({
      activeApp: activeContext ?? "assistant",
      observerId: session?.observer.observer_id ?? "UNASSIGNED",
      clearance: session?.observer.clearance ?? "VISITOR",
      achievements: session?.achievements.length ?? 0,
      points: session?.points ?? 0,
      activeObservers: overview.active_observers,
      totalObservers: overview.total_observers,
      networkConnections: overview.total_visits,
      transmissions: overview.open_transmissions,
    }),
    [activeContext, overview, session],
  );

  const addMessage = (message: ChatMessage) => {
    setMessages((current) => [...current, message]);
  };

  const runLocalCommand = (query: string): boolean => {
    const command = detectAppCommand(query);

    if (command) {
      openApp(command.app);
      notify(`BLACKTERM AI launched ${command.title}.`);
      addMessage({
        from: "ai",
        text: `Directive accepted. Launching ${command.title}.`,
        actions: [{ label: `Open ${command.title}`, app: command.app }],
      });
      setMode("LIVE AI");
      return true;
    }

    if (/\b(recruiter mode|recruiter tour)\b/i.test(query)) {
      openApp("interview");
      openApp("resume");
      notify("Recruiter evidence package opened.");
      addMessage({
        from: "ai",
        text:
          "Recruiter workflow initialized. I opened Tyler's hiring summary and resume so the strongest evidence is immediately available.",
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
        from: "ai",
        text:
          `Observer Network report: ${overview.active_observers} active, ` +
          `${overview.total_observers} registered, ${overview.total_visits} recorded connections, ` +
          `and ${overview.open_transmissions} indexed transmissions.`,
        actions: [
          { label: "Open NOC", app: "noc" },
          { label: "Observer Profile", app: "observer" },
        ],
      });
      setMode("LIVE AI");
      return true;
    }

    return false;
  };

  const submit = async (question = input) => {
    const query = question.trim();
    if (!query || thinking) return;

    addMessage({ from: "user", text: query });
    setInput("");

    if (runLocalCommand(query)) return;

    setThinking(true);
    setMode("CONNECTING");

    try {
      const history = messages.slice(-8).map((message) => ({
        role: message.from === "ai" ? "assistant" : "user",
        content: message.text,
      }));

      const recruiterInstruction = isRecruiterQuery(query)
        ? "\nThis is a recruiter or job-fit query. Give a clear evidence-based fit assessment, identify strengths and honest gaps, and recommend which portfolio apps to inspect."
        : "";

      const response = await fetch("/api/blackterm-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message:
            query +
            recruiterInstruction +
            `\n\nLive BLACKTERM state: ${JSON.stringify(contextSummary)}`,
          history,
          activeContext: contextSummary.activeApp,
        }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          typeof payload?.error === "string"
            ? payload.error
            : `Intelligence service returned ${response.status}.`,
        );
      }

      const text =
        typeof payload?.text === "string" && payload.text.trim()
          ? payload.text.trim()
          : "The Intelligence Core returned an empty response.";

      addMessage({
        from: "ai",
        text,
        actions: suggestedActions(text),
      });
      setMode("LIVE AI");
    } catch (error) {
      console.error("BLACKTERM AI request failed:", error);
      addMessage({
        from: "ai",
        text:
          "Live intelligence is temporarily unavailable. The local command layer remains operational, so you can still open apps, inspect projects, view the resume, or access the Observer Network.",
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
  };

  return (
    <div className="bt-ai-control">
      <header className="bt-ai-control-header">
        <div className="bt-ai-core-mark">
          <span>BT</span>
          <i />
        </div>
        <div>
          <small>BLACKTERM INTELLIGENCE CORE</small>
          <h2>Operating System Assistant</h2>
          <p>
            Portfolio knowledge, recruiter analysis, live telemetry, and desktop
            control.
          </p>
        </div>
        <div className={`bt-ai-mode mode-${mode.toLowerCase().replace(" ", "-")}`}>
          <i />
          <span>{mode}</span>
        </div>
      </header>

      <section className="bt-ai-telemetry">
        <article>
          <small>OBSERVER</small>
          <strong>{contextSummary.observerId}</strong>
        </article>
        <article>
          <small>ACTIVE OBSERVERS</small>
          <strong>{overview.active_observers}</strong>
        </article>
        <article>
          <small>NETWORK CONNECTIONS</small>
          <strong>{overview.total_visits}</strong>
        </article>
        <article>
          <small>ACTIVE CONTEXT</small>
          <strong>{String(contextSummary.activeApp).toUpperCase()}</strong>
        </article>
      </section>

      <div className="bt-ai-layout">
        <aside className="bt-ai-command-panel">
          <small>OS DIRECTIVES</small>
          <button onClick={() => submit("Open my resume")}>OPEN RESUME</button>
          <button onClick={() => submit("Show my projects")}>
            PROJECT ARCHIVE
          </button>
          <button onClick={() => submit("Open Network Operations")}>
            NETWORK OPERATIONS
          </button>
          <button onClick={() => submit("Start recruiter mode")}>
            RECRUITER WORKFLOW
          </button>

          <small>QUERY TEMPLATES</small>
          <button onClick={() => submit("Why should someone hire Tyler?")}>
            WHY HIRE TYLER?
          </button>
          <button
            onClick={() =>
              submit("Show the strongest cybersecurity projects in Tyler's portfolio.")
            }
          >
            CYBER PROJECTS
          </button>
          <button onClick={() => submit("Report current observer network status")}>
            LIVE NETWORK REPORT
          </button>
        </aside>

        <section className="bt-ai-chat">
          <div className="bt-ai-log">
            {messages.map((message, index) => (
              <article className={message.from} key={`${message.from}-${index}`}>
                <small>{message.from === "ai" ? "BLACKTERM AI" : "VISITOR"}</small>
                <p>{message.text}</p>
                {message.actions?.length ? (
                  <div>
                    {message.actions.map((action) => (
                      <button
                        key={`${action.app}-${action.label}`}
                        onClick={() => openApp(action.app)}
                      >
                        {action.label} ↗
                      </button>
                    ))}
                  </div>
                ) : null}
              </article>
            ))}

            {thinking ? (
              <article className="ai bt-ai-thinking">
                <small>BLACKTERM AI</small>
                <p>Synchronizing portfolio index and live system context...</p>
                <i />
              </article>
            ) : null}
          </div>

          <div className="bt-ai-suggestions">
            {[
              "Tell me about Tyler",
              "I'm hiring for desktop support",
              "Show Python projects",
              "What certifications does Tyler have?",
              "Open Incident Engine",
            ].map((suggestion) => (
              <button key={suggestion} onClick={() => submit(suggestion)}>
                {suggestion}
              </button>
            ))}
          </div>

          <form
            className="bt-ai-input"
            onSubmit={(event) => {
              event.preventDefault();
              void submit();
            }}
          >
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
