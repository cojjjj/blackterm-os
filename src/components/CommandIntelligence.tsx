import { useEffect, useMemo, useState } from "react";
import { useObserverNetwork } from "../context/ObserverNetworkContext";
import {
  briefingService,
  type CommandBriefing,
} from "../services/briefingService";
import {
  missionService,
  type ObserverMission,
} from "../services/missionService";

type AppTarget =
  | "observer"
  | "noc"
  | "threatmap"
  | "incident"
  | "sandbox"
  | "projects"
  | "assistant";

interface CommandIntelligenceProps {
  openApp: (id: AppTarget) => void;
}

const emptyBriefing: CommandBriefing = {
  threat_level: "LOW",
  active_observers: 0,
  transmission_count: 0,
  achievement_count: 0,
  total_points: 0,
  mission_status: "UNASSIGNED",
};

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 5) return "MIDNIGHT PROTOCOL ACTIVE";
  if (hour < 12) return "GOOD MORNING, OBSERVER";
  if (hour < 18) return "GOOD AFTERNOON, OBSERVER";
  return "GOOD EVENING, OBSERVER";
}

export default function CommandIntelligence({
  openApp,
}: CommandIntelligenceProps) {
  const { session, reload } = useObserverNetwork();
  const [briefing, setBriefing] = useState<CommandBriefing>(emptyBriefing);
  const [assignment, setAssignment] = useState<ObserverMission | null>(null);
  const [loading, setLoading] = useState(true);
  const [transcript, setTranscript] = useState<string[]>([
    "BLACKTERM INTELLIGENCE CORE ONLINE",
    "Awaiting authenticated observer identity...",
  ]);

  const load = async () => {
    if (!session) return;

    setLoading(true);
    setTranscript((items) => [...items, "Synchronizing command intelligence..."]);

    try {
      const [nextBriefing, nextAssignment] = await Promise.all([
        briefingService.get(session.observer.id),
        missionService.getDailyMission(session.observer.id),
      ]);

      setBriefing(nextBriefing);
      setAssignment(nextAssignment);
      setTranscript((items) => [
        ...items.slice(-5),
        "Observer identity verified.",
        "Threat matrix synchronized.",
        nextAssignment
          ? `Mission ${nextAssignment.mission?.code ?? "UNKNOWN"} assigned.`
          : "No mission available.",
        "Command channel ready.",
      ]);
    } catch (error) {
      console.error("Command Intelligence failed:", error);
      setTranscript((items) => [
        ...items.slice(-6),
        "Command synchronization degraded.",
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [session?.observer.id]);

  const recommendedApp = useMemo<AppTarget>(() => {
    const title = assignment?.mission?.title.toLowerCase() ?? "";
    if (title.includes("phish") || title.includes("relay")) return "threatmap";
    if (title.includes("malware")) return "sandbox";
    if (title.includes("incident")) return "incident";
    return "noc";
  }, [assignment?.mission?.title]);

  const advanceMission = async () => {
    if (!assignment) return;

    const nextProgress = Math.min(100, assignment.progress + 25);
    const updated = await missionService.updateProgress(
      assignment.id,
      nextProgress,
    );

    setAssignment((current) =>
      current
        ? {
            ...current,
            progress: updated.progress,
            status: updated.status,
            completed_at: updated.completed_at,
          }
        : current,
    );

    setTranscript((items) => [
      ...items.slice(-6),
      `Mission progress updated: ${nextProgress}%`,
      nextProgress >= 100
        ? "MISSION COMPLETE // XP REWARD VERIFIED"
        : "Mission state synchronized.",
    ]);

    if (nextProgress >= 100) {
      await reload();
    }
  };

  if (!session) {
    return (
      <div className="command-intelligence command-offline">
        OBSERVER IDENTITY REQUIRED
      </div>
    );
  }

  const mission = assignment?.mission;

  return (
    <div className="command-intelligence">
      <header className="command-header">
        <div>
          <small>BLACKTERM INTELLIGENCE CORE</small>
          <h1>{getGreeting()}</h1>
          <p>
            Observer {session.observer.observer_id} // Clearance{" "}
            {session.observer.clearance}
          </p>
        </div>

        <div className={`command-threat threat-${briefing.threat_level.toLowerCase()}`}>
          <span>GLOBAL THREAT LEVEL</span>
          <strong>{briefing.threat_level}</strong>
          <small>{loading ? "SYNCING" : "LIVE DATA"}</small>
        </div>
      </header>

      <section className="command-summary-grid">
        <article>
          <small>ACTIVE OBSERVERS</small>
          <strong>{briefing.active_observers}</strong>
          <span>Connected to relay</span>
        </article>
        <article>
          <small>TRANSMISSIONS</small>
          <strong>{briefing.transmission_count}</strong>
          <span>Indexed globally</span>
        </article>
        <article>
          <small>ACHIEVEMENTS</small>
          <strong>{briefing.achievement_count}</strong>
          <span>{briefing.total_points} verified XP</span>
        </article>
        <article>
          <small>MISSION STATE</small>
          <strong>{assignment?.status ?? briefing.mission_status}</strong>
          <span>Daily assignment</span>
        </article>
      </section>

      <div className="command-main-grid">
        <section className="command-mission">
          <header>
            <div>
              <small>PRIORITY ASSIGNMENT</small>
              <h2>{mission?.title ?? "Awaiting mission assignment"}</h2>
            </div>
            <span>{mission?.difficulty ?? "PENDING"}</span>
          </header>

          {mission ? (
            <>
              <div className="mission-code">
                <span>{mission.code}</span>
                <b>{mission.origin}</b>
              </div>

              <p className="mission-summary">{mission.summary}</p>

              <article className="mission-objective">
                <small>OBJECTIVE</small>
                <p>{mission.objective}</p>
              </article>

              <div className="mission-progress">
                <div>
                  <span>DECRYPT / INVESTIGATION PROGRESS</span>
                  <b>{assignment.progress}%</b>
                </div>
                <div>
                  <i style={{ width: `${assignment.progress}%` }} />
                </div>
              </div>

              <footer>
                <div>
                  <small>REWARD</small>
                  <strong>+{mission.reward_xp} XP</strong>
                </div>
                <button
                  type="button"
                  onClick={() => openApp(recommendedApp)}
                >
                  OPEN RECOMMENDED TOOL
                </button>
                <button
                  type="button"
                  onClick={() => void advanceMission()}
                  disabled={assignment.progress >= 100}
                >
                  {assignment.progress >= 100
                    ? "MISSION COMPLETE"
                    : "ADVANCE SIMULATION +25%"}
                </button>
              </footer>
            </>
          ) : (
            <div className="command-empty">
              No active mission was returned by the network.
            </div>
          )}
        </section>

        <aside className="command-side">
          <section className="command-transcript">
            <header>
              <small>AI BRIEFING CHANNEL</small>
              <span>GROUNDED</span>
            </header>
            <div>
              {transcript.map((line, index) => (
                <p key={`${line}-${index}`}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  {line}
                </p>
              ))}
            </div>
          </section>

          <section className="command-actions">
            <header>
              <small>COMMAND SHORTCUTS</small>
            </header>
            <button onClick={() => openApp("noc")}>
              NETWORK OPERATIONS
            </button>
            <button onClick={() => openApp("observer")}>
              OBSERVER PROFILE
            </button>
            <button onClick={() => openApp("assistant")}>
              BLACKTERM AI
            </button>
            <button onClick={() => void load()}>
              REFRESH BRIEFING
            </button>
          </section>
        </aside>
      </div>

      <section className="command-lower-grid">
        <article>
          <small>DATABASE</small>
          <strong>CONNECTED</strong>
          <i />
        </article>
        <article>
          <small>AUTH RELAY</small>
          <strong>VERIFIED</strong>
          <i />
        </article>
        <article>
          <small>WORLD EVENTS</small>
          <strong>SYNCHRONIZED</strong>
          <i />
        </article>
        <article>
          <small>MISSION ENGINE</small>
          <strong>ACTIVE</strong>
          <i />
        </article>
      </section>
    </div>
  );
}
