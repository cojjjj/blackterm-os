import { useEffect, useMemo, useState } from "react";
import { useObserverNetwork } from "../context/ObserverNetworkContext";
import {
  networkStatsService,
  type ObserverNetworkStats,
} from "../services/networkStatsService";
import { worldEventService } from "../services/worldEventService";
import type { WorldEvent } from "../types/backend";

function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

function getRank(points: number): {
  name: string;
  level: number;
  current: number;
  target: number;
} {
  const ranks = [
    { name: "VISITOR", target: 25 },
    { name: "OBSERVER I", target: 75 },
    { name: "OBSERVER II", target: 150 },
    { name: "ANALYST", target: 300 },
    { name: "OPERATOR", target: 600 },
    { name: "BLACKTERM ELITE", target: 1000 },
  ];

  const index = ranks.findIndex((rank) => points < rank.target);
  const activeIndex = index === -1 ? ranks.length - 1 : index;
  const previousTarget = activeIndex === 0 ? 0 : ranks[activeIndex - 1].target;
  const active = ranks[activeIndex];

  return {
    name: active.name,
    level: activeIndex + 1,
    current: Math.max(0, points - previousTarget),
    target: Math.max(1, active.target - previousTarget),
  };
}

export default function ObserverDashboard() {
  const { session, loading, error, reload } = useObserverNetwork();
  const [stats, setStats] = useState<ObserverNetworkStats>({
    observer_count: 0,
    total_visits: 0,
    world_event_count: 0,
  });
  const [events, setEvents] = useState<WorldEvent[]>([]);
  const [syncing, setSyncing] = useState(false);

  const loadNetworkData = async () => {
    setSyncing(true);

    try {
      const [nextStats, nextEvents] = await Promise.all([
        networkStatsService.get(),
        worldEventService.listLatest(5),
      ]);

      setStats(nextStats);
      setEvents(nextEvents);
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    void loadNetworkData();

    const unsubscribe = worldEventService.subscribe((event) => {
      setEvents((current) => [event, ...current].slice(0, 5));
      setStats((current) => ({
        ...current,
        world_event_count: current.world_event_count + 1,
      }));
    });

    return unsubscribe;
  }, []);

  const rank = useMemo(
    () => getRank(session?.points ?? 0),
    [session?.points],
  );

  if (loading) {
    return (
      <div className="observer-dashboard observer-dashboard-loading">
        SYNCHRONIZING OBSERVER PROFILE...
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="observer-dashboard observer-dashboard-offline">
        <span>OBSERVER NETWORK OFFLINE</span>
        <p>{error ?? "Profile data could not be loaded."}</p>
        <button type="button" onClick={() => void reload()}>
          RETRY CONNECTION
        </button>
      </div>
    );
  }

  const { observer, achievements, points } = session;
  const progress = Math.min(100, (rank.current / rank.target) * 100);

  return (
    <div className="observer-dashboard">
      <header className="observer-dashboard-header">
        <div>
          <small>BLACKTERM CLOUD IDENTITY</small>
          <h1>Observer Network</h1>
          <p>
            Persistent profile, achievement record, and live network
            telemetry.
          </p>
        </div>

        <div className="observer-network-state">
          <i />
          <span>NETWORK ONLINE</span>
          <small>{syncing ? "SYNCING" : "SYNCHRONIZED"}</small>
        </div>
      </header>

      <section className="observer-profile-hero">
        <div className="observer-emblem">
          <span>BT</span>
          <i />
          <b>{rank.level.toString().padStart(2, "0")}</b>
        </div>

        <div className="observer-profile-copy">
          <small>OBSERVER IDENTIFICATION</small>
          <h2>{observer.observer_id}</h2>
          <p>{observer.username || "Visitor"}</p>

          <div className="observer-clearance-row">
            <span>{observer.clearance}</span>
            <b>{rank.name}</b>
          </div>
        </div>

        <div className="observer-xp">
          <small>NETWORK XP</small>
          <strong>{points}</strong>
          <span>
            {rank.current} / {rank.target} TO NEXT RANK
          </span>
          <div>
            <i style={{ width: `${progress}%` }} />
          </div>
        </div>
      </section>

      <section className="observer-stat-grid">
        <article>
          <small>ACHIEVEMENTS</small>
          <strong>{achievements.length}</strong>
          <span>Cloud verified</span>
        </article>
        <article>
          <small>VISITS</small>
          <strong>{observer.total_visits}</strong>
          <span>Recorded sessions</span>
        </article>
        <article>
          <small>TIME ONLINE</small>
          <strong>{formatDuration(observer.total_time_seconds)}</strong>
          <span>Persistent runtime</span>
        </article>
        <article>
          <small>UNLOCKED SCENE</small>
          <strong>{observer.unlocked_scene || "DEFAULT"}</strong>
          <span>Active environment</span>
        </article>
      </section>

      <div className="observer-dashboard-columns">
        <section className="observer-achievement-panel">
          <header>
            <div>
              <small>VERIFIED RECORD</small>
              <h3>Achievements</h3>
            </div>
            <span>{points} XP</span>
          </header>

          <div className="observer-achievement-list">
            {achievements.length ? (
              achievements.map((entry) => (
                <article key={entry.id}>
                  <div>◆</div>
                  <section>
                    <strong>
                      {entry.achievement?.name ?? "Unknown Achievement"}
                    </strong>
                    <p>{entry.achievement?.description}</p>
                    <small>
                      {new Date(entry.unlocked_at).toLocaleString()}
                    </small>
                  </section>
                  <b>+{entry.achievement?.points ?? 0}</b>
                </article>
              ))
            ) : (
              <div className="observer-empty-state">
                No achievements synchronized.
              </div>
            )}
          </div>
        </section>

        <section className="observer-network-panel">
          <header>
            <div>
              <small>GLOBAL TELEMETRY</small>
              <h3>Network Status</h3>
            </div>
            <button type="button" onClick={() => void loadNetworkData()}>
              REFRESH
            </button>
          </header>

          <div className="observer-global-stats">
            <article>
              <strong>{stats.observer_count.toLocaleString()}</strong>
              <span>Observers registered</span>
            </article>
            <article>
              <strong>{stats.total_visits.toLocaleString()}</strong>
              <span>Total connections</span>
            </article>
            <article>
              <strong>{stats.world_event_count.toLocaleString()}</strong>
              <span>World events</span>
            </article>
          </div>

          <div className="observer-event-feed">
            <small>RECENT WORLD ACTIVITY</small>

            {events.length ? (
              events.map((event) => (
                <article key={event.id}>
                  <i className={`severity-${event.severity.toLowerCase()}`} />
                  <div>
                    <strong>{event.title}</strong>
                    <p>{event.description}</p>
                    <small>
                      {event.severity} //{" "}
                      {new Date(event.created_at).toLocaleTimeString()}
                    </small>
                  </div>
                </article>
              ))
            ) : (
              <div className="observer-empty-state">
                No world events have been transmitted yet.
              </div>
            )}
          </div>
        </section>
      </div>

      <footer className="observer-dashboard-footer">
        <span>AUTHENTICATED THROUGH SUPABASE</span>
        <span>ROW LEVEL SECURITY ACTIVE</span>
        <span>LAST SYNC {new Date(observer.last_seen).toLocaleString()}</span>
      </footer>
    </div>
  );
}
