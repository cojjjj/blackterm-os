import { useEffect, useMemo, useState } from "react";
import { useObserverNetwork } from "../context/ObserverNetworkContext";
import {
  networkOperationsService,
  type NetworkOverview,
  type PresenceRecord,
  type Transmission,
} from "../services/networkOperationsService";

const mapNodes = [
  { left: 18, top: 36, label: "NA-01" },
  { left: 29, top: 54, label: "SA-04" },
  { left: 47, top: 31, label: "EU-07" },
  { left: 58, top: 48, label: "AF-02" },
  { left: 72, top: 34, label: "AS-12" },
  { left: 84, top: 62, label: "OC-03" },
];

const emptyOverview: NetworkOverview = {
  active_observers: 0,
  total_observers: 0,
  total_visits: 0,
  open_transmissions: 0,
};

function timeAgo(value: string): string {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  return `${Math.floor(seconds / 3600)}h ago`;
}

export default function NetworkOperationsCenter() {
  const { session, networkStatus, networkError } = useObserverNetwork();
  const [presence, setPresence] = useState<PresenceRecord[]>([]);
  const [transmissions, setTransmissions] = useState<Transmission[]>([]);
  const [overview, setOverview] = useState<NetworkOverview>(emptyOverview);
  const [selectedTransmission, setSelectedTransmission] = useState<Transmission | null>(null);
  const [status, setStatus] = useState("INITIALIZING");
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = async () => {
    setStatus("SYNCING");
    setLoadError(null);

    const results = await Promise.allSettled([
      session
        ? networkOperationsService.heartbeat(
            session.observer.id,
            session.observer.observer_id,
            "network-operations",
          )
        : Promise.resolve(),
      networkOperationsService.listPresence(),
      networkOperationsService.listTransmissions(),
      networkOperationsService.getOverview(),
    ]);

    const errors: string[] = [];
    if (results[0].status === "rejected") errors.push(String(results[0].reason));
    if (results[1].status === "fulfilled") setPresence(results[1].value);
    else errors.push(String(results[1].reason));
    if (results[2].status === "fulfilled") setTransmissions(results[2].value);
    else errors.push(String(results[2].reason));
    if (results[3].status === "fulfilled") setOverview(results[3].value);
    else errors.push(String(results[3].reason));

    if (errors.length) {
      console.error("NOC synchronization errors:", errors);
      setLoadError(errors.join(" | "));
      setStatus("DEGRADED");
    } else {
      setStatus("LIVE");
    }
  };

  useEffect(() => {
    void load();
    const interval = window.setInterval(() => void load(), 60_000);
    const unsubscribePresence = networkOperationsService.subscribePresence(() => void load());
    const unsubscribeTransmissions = networkOperationsService.subscribeTransmissions((item) => {
      setTransmissions((current) => [item, ...current].slice(0, 8));
      setSelectedTransmission(item);
    });

    return () => {
      window.clearInterval(interval);
      unsubscribePresence();
      unsubscribeTransmissions();
    };
  }, [session?.observer.id]);

  const threatLevel = useMemo(() => {
    if (transmissions.some((item) => item.severity === "CRITICAL")) return "CRITICAL";
    if (transmissions.some((item) => item.severity === "HIGH")) return "ELEVATED";
    return "LOW";
  }, [transmissions]);

  const visibleStatus = status === "LIVE" && networkStatus === "DEGRADED" ? "DEGRADED" : status;
  const visibleError = loadError || networkError;

  return (
    <div className="noc">
      <header className="noc-header">
        <div>
          <small>BLACKTERM OBSERVER NETWORK</small>
          <h1>Network Operations Center</h1>
          <p>Live presence, telemetry, threats, and global transmissions.</p>
          {visibleError && <p className="noc-backend-error">BACKEND: {visibleError}</p>}
        </div>
        <div className={`noc-live-state state-${visibleStatus.toLowerCase()}`}>
          <i />
          <div><strong>{visibleStatus}</strong><small>REALTIME CHANNEL</small></div>
        </div>
      </header>

      <section className="noc-kpi-grid">
        <article><span>ACTIVE OBSERVERS</span><strong>{overview.active_observers}</strong><small>Last five minutes</small></article>
        <article><span>TOTAL OBSERVERS</span><strong>{overview.total_observers}</strong><small>Registered identities</small></article>
        <article><span>NETWORK CONNECTIONS</span><strong>{overview.total_visits}</strong><small>Recorded visits</small></article>
        <article className={`threat-${threatLevel.toLowerCase()}`}><span>THREAT LEVEL</span><strong>{threatLevel}</strong><small>{overview.open_transmissions} active transmissions</small></article>
      </section>

      <div className="noc-main-grid">
        <section className="noc-map-panel">
          <header><div><small>GLOBAL RELAY MATRIX</small><h2>Observer Network</h2></div><button type="button" onClick={() => void load()}>REFRESH</button></header>
          <div className="noc-world-map">
            <div className="noc-grid-lines"/><div className="noc-continent c-one"/><div className="noc-continent c-two"/><div className="noc-continent c-three"/><div className="noc-continent c-four"/>
            <svg viewBox="0 0 100 70" preserveAspectRatio="none" aria-hidden="true"><path d="M18 36 C30 10, 38 58, 47 31"/><path d="M47 31 C60 12, 67 52, 72 34"/><path d="M72 34 C78 46, 79 56, 84 62"/><path d="M29 54 C44 70, 50 57, 58 48"/></svg>
            {mapNodes.map((node,index)=><div key={node.label} className={`noc-map-node node-${index+1}`} style={{left:`${node.left}%`,top:`${node.top}%`}}><i/><span>{node.label}</span></div>)}
            <div className="noc-radar-sweep"/><div className="noc-map-caption"><span>ENCRYPTED ROUTES</span><b>{Math.max(6,overview.active_observers*2)} RELAYS</b></div>
          </div>
          <div className="noc-region-strip">{["NORTH AMERICA","EUROPE","ASIA PACIFIC","DARK RELAY"].map((region,index)=><article key={region}><i/><div><strong>{region}</strong><small>{index===3?"MONITORED":"OPERATIONAL"}</small></div><b>{String(index+1).padStart(2,"0")}</b></article>)}</div>
        </section>

        <aside className="noc-side-stack">
          <section className="noc-presence-panel"><header><small>LIVE PRESENCE</small><span>{presence.length} ONLINE</span></header><div className="noc-presence-list">{presence.length?presence.map(item=><article key={item.observer_id}><i/><div><strong>{item.observer_code}</strong><small>{item.current_app.toUpperCase()}</small></div><span>{timeAgo(item.last_seen)}</span></article>):<p className="noc-empty">Awaiting observer heartbeats...</p>}</div></section>
          <section className="noc-system-panel"><header><small>SYSTEM TELEMETRY</small><span>{visibleStatus === "LIVE" ? "NOMINAL" : "CHECK BACKEND"}</span></header>{[["DATABASE",96],["AUTH RELAY",92],["REALTIME BUS",88],["EVENT PIPELINE",81]].map(([label,value])=><div className="noc-meter" key={String(label)}><span>{label}</span><div><i style={{width:`${value}%`}}/></div><b>{value}%</b></div>)}</section>
        </aside>
      </div>

      <section className="noc-transmission-panel"><header><div><small>INCOMING TRANSMISSIONS</small><h2>Global Event Feed</h2></div><span>LIVE</span></header><div className="noc-transmission-grid">{transmissions.length?transmissions.map(item=><button type="button" key={item.id} className={`severity-${item.severity.toLowerCase()}`} onClick={()=>setSelectedTransmission(item)}><small>{item.origin}</small><strong>{item.title}</strong><p>{item.message}</p><div><i style={{width:`${Math.min(100,item.progress)}%`}}/></div><footer><span>{item.severity}</span><b>{item.progress}%</b></footer></button>):<div className="noc-empty">No active transmissions.</div>}</div></section>

      {selectedTransmission&&<div className="noc-transmission-modal" onClick={()=>setSelectedTransmission(null)}><article onClick={event=>event.stopPropagation()}><small>PRIORITY TRANSMISSION</small><h2>{selectedTransmission.title}</h2><p>{selectedTransmission.message}</p><dl><div><dt>Origin</dt><dd>{selectedTransmission.origin}</dd></div><div><dt>Severity</dt><dd>{selectedTransmission.severity}</dd></div><div><dt>Decrypt progress</dt><dd>{selectedTransmission.progress}%</dd></div></dl><button type="button" onClick={()=>setSelectedTransmission(null)}>CLOSE CHANNEL</button></article></div>}
    </div>
  );
}
