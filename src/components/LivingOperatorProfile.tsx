import { FormEvent, useMemo, useState } from "react";
import {
  coreOperatorEvents,
  eventTypeLabels,
  type OperatorEvent,
  type OperatorEventType,
} from "../data/operator-events";

const STORAGE_KEY = "blackterm-custom-operator-events";

function loadCustomEvents(): OperatorEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as OperatorEvent[]) : [];
  } catch {
    return [];
  }
}

function displayDate(value: string): string {
  if (value === "FUTURE") return "FUTURE OBJECTIVE";

  const match = /^(\d{4})-(\d{2})$/.exec(value);
  if (!match) return value;

  const date = new Date(Number(match[1]), Number(match[2]) - 1, 1);
  return date.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
}

export default function LivingOperatorProfile() {
  const [customEvents, setCustomEvents] = useState<OperatorEvent[]>(
    loadCustomEvents,
  );
  const [filter, setFilter] = useState<"ALL" | OperatorEventType>("ALL");
  const [showAdd, setShowAdd] = useState(false);

  const events = useMemo(
    () =>
      [...coreOperatorEvents, ...customEvents]
        .filter((event) => filter === "ALL" || event.type === filter)
        .sort((a, b) => {
          if (a.date === "FUTURE") return 1;
          if (b.date === "FUTURE") return -1;
          return b.date.localeCompare(a.date);
        }),
    [customEvents, filter],
  );

  const totalXp = useMemo(
    () =>
      [...coreOperatorEvents, ...customEvents]
        .filter((event) => event.status === "VERIFIED")
        .reduce((total, event) => total + event.xp, 0),
    [customEvents],
  );

  const verified = useMemo(
    () =>
      [...coreOperatorEvents, ...customEvents].filter(
        (event) => event.status === "VERIFIED",
      ).length,
    [customEvents],
  );

  function addEvent(event: OperatorEvent) {
    const next = [...customEvents, event];
    setCustomEvents(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setShowAdd(false);
  }

  return (
    <div className="living-operator-profile">
      <header className="living-operator-hero">
        <div className="living-operator-emblem">
          <span>TD</span>
          <i />
        </div>

        <div>
          <small>BLACKTERM // LIVING PROFESSIONAL RECORD</small>
          <h1>Living Operator Profile</h1>
          <p>
            A persistent career timeline that evolves with every project,
            certification, deployment, role, and technical milestone.
          </p>
        </div>

        <div className="living-operator-level">
          <small>OPERATOR LEVEL</small>
          <strong>LEVEL {Math.max(1, Math.floor(totalXp / 2500))}</strong>
          <span>{totalXp.toLocaleString()} VERIFIED XP</span>
        </div>
      </header>

      <section className="living-operator-stats">
        <article>
          <small>VERIFIED EVENTS</small>
          <strong>{verified}</strong>
        </article>
        <article>
          <small>TOTAL XP</small>
          <strong>{totalXp.toLocaleString()}</strong>
        </article>
        <article>
          <small>CUSTOM RECORDS</small>
          <strong>{customEvents.length}</strong>
        </article>
        <article>
          <small>PROFILE STATUS</small>
          <strong>EVOLVING</strong>
        </article>
      </section>

      <section className="living-operator-controls">
        <div>
          <small>EVENT FILTER</small>
          <nav>
            {(
              [
                "ALL",
                "CAREER",
                "CERTIFICATION",
                "PROJECT",
                "PLATFORM",
                "TRAINING",
                "COMMUNITY",
              ] as const
            ).map((item) => (
              <button
                key={item}
                className={filter === item ? "active" : ""}
                onClick={() => setFilter(item)}
              >
                {item}
              </button>
            ))}
          </nav>
        </div>

        <button
          className="living-operator-add"
          onClick={() => setShowAdd(true)}
        >
          + LOG NEW MILESTONE
        </button>
      </section>

      <section className="living-operator-timeline">
        {events.map((event) => (
          <article
            key={event.id}
            className={`operator-event event-${event.type.toLowerCase()} status-${event.status
              .toLowerCase()
              .replaceAll(" ", "-")}`}
          >
            <div className="operator-event-node">
              <i />
              <span>{event.type.slice(0, 3)}</span>
            </div>

            <div className="operator-event-content">
              <header>
                <div>
                  <small>
                    {eventTypeLabels[event.type]} // {displayDate(event.date)}
                  </small>
                  <h2>{event.title}</h2>
                </div>
                <b>{event.status}</b>
              </header>

              <p>{event.description}</p>

              <footer>
                <span>{event.source ?? "BLACKTERM RECORD"}</span>
                <strong>+{event.xp.toLocaleString()} XP</strong>
              </footer>
            </div>
          </article>
        ))}
      </section>

      {showAdd ? (
        <MilestoneComposer
          onClose={() => setShowAdd(false)}
          onSubmit={addEvent}
        />
      ) : null}
    </div>
  );
}

function MilestoneComposer({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (event: OperatorEvent) => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<OperatorEventType>("PROJECT");
  const [date, setDate] = useState(
    new Date().toISOString().slice(0, 7),
  );
  const [xp, setXp] = useState(500);
  const [source, setSource] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!title.trim() || !description.trim()) return;

    onSubmit({
      id: `custom-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      type,
      date,
      xp: Math.max(0, xp),
      source: source.trim() || "Operator-submitted record",
      status: "VERIFIED",
    });
  }

  return (
    <div
      className="operator-composer-backdrop"
      onMouseDown={onClose}
      role="presentation"
    >
      <form
        className="operator-composer"
        onSubmit={submit}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header>
          <div>
            <small>BLACKTERM RECORD COMPOSER</small>
            <h2>Log New Milestone</h2>
          </div>
          <button type="button" onClick={onClose}>
            ×
          </button>
        </header>

        <label>
          <span>EVENT TITLE</span>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="New certification, project, role, or milestone"
            autoFocus
          />
        </label>

        <label>
          <span>DESCRIPTION</span>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Describe what was accomplished and why it matters."
          />
        </label>

        <div className="operator-composer-grid">
          <label>
            <span>TYPE</span>
            <select
              value={type}
              onChange={(event) =>
                setType(event.target.value as OperatorEventType)
              }
            >
              <option>CAREER</option>
              <option>CERTIFICATION</option>
              <option>PROJECT</option>
              <option>PLATFORM</option>
              <option>TRAINING</option>
              <option>COMMUNITY</option>
            </select>
          </label>

          <label>
            <span>DATE</span>
            <input
              type="month"
              value={date}
              onChange={(event) => setDate(event.target.value)}
            />
          </label>

          <label>
            <span>XP VALUE</span>
            <input
              type="number"
              min="0"
              step="100"
              value={xp}
              onChange={(event) => setXp(Number(event.target.value))}
            />
          </label>
        </div>

        <label>
          <span>SOURCE / EVIDENCE</span>
          <input
            value={source}
            onChange={(event) => setSource(event.target.value)}
            placeholder="GitHub, issuer, employer, deployment, etc."
          />
        </label>

        <footer>
          <button type="button" onClick={onClose}>
            CANCEL
          </button>
          <button type="submit">VERIFY EVENT +</button>
        </footer>
      </form>
    </div>
  );
}
