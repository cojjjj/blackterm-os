import { useObserverNetwork } from "../context/ObserverNetworkContext";

function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export function ObserverStatusPanel() {
  const { session, loading, error } = useObserverNetwork();

  if (loading) return <section className="observer-status-panel">SYNCING...</section>;
  if (error || !session) return <section className="observer-status-panel">OFFLINE</section>;

  const { observer, achievements, points } = session;

  return (
    <section className="observer-status-panel">
      <header>OBSERVER PROFILE</header>
      <dl>
        <div><dt>ID</dt><dd>{observer.observer_id}</dd></div>
        <div><dt>Clearance</dt><dd>{observer.clearance}</dd></div>
        <div><dt>Achievements</dt><dd>{achievements.length}</dd></div>
        <div><dt>Points</dt><dd>{points}</dd></div>
        <div><dt>Visits</dt><dd>{observer.total_visits}</dd></div>
        <div><dt>Time online</dt><dd>{formatDuration(observer.total_time_seconds)}</dd></div>
      </dl>
    </section>
  );
}
