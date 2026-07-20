import { useObserverNetwork } from "../context/ObserverNetworkContext";

export function ObserverBootOverlay() {
  const { session, progress, loading, error, reload } = useObserverNetwork();

  if (!loading && !error) return null;

  return (
    <div className="observer-boot-overlay" role="status" aria-live="polite">
      <div className="observer-boot-panel">
        <div className="observer-boot-kicker">BLACKTERM OS</div>
        <h1>Observer Network</h1>

        {error ? (
          <>
            <p className="observer-boot-error">CONNECTION FAILED</p>
            <p>{error}</p>
            <button type="button" onClick={() => void reload()}>
              Retry connection
            </button>
          </>
        ) : (
          <>
            <p>{progress.message}</p>
            <div className="observer-boot-line" />
            <dl>
              <div><dt>Stage</dt><dd>{progress.stage}</dd></div>
              <div><dt>Observer</dt><dd>{session?.observer.observer_id ?? "PENDING"}</dd></div>
              <div><dt>Clearance</dt><dd>{session?.observer.clearance ?? "UNVERIFIED"}</dd></div>
            </dl>
          </>
        )}
      </div>
    </div>
  );
}
