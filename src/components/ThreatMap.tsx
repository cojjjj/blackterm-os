import React, { useEffect, useMemo, useRef, useState } from 'react';

type ThreatKind = 'Phishing' | 'Ransomware' | 'Malware' | 'Botnet' | 'Credential';
type RangeKey = '1H' | '24H' | '7D' | '30D';

type ThreatNode = {
  id: string;
  city: string;
  country: string;
  x: number;
  y: number;
  score: number;
  kind: ThreatKind;
  intel: string[];
};

type ThreatRoute = {
  from: string;
  to: string;
  kind: ThreatKind;
};

const nodes: ThreatNode[] = [
  { id:'ny', city:'New York', country:'United States', x:23, y:38, score:68, kind:'Credential', intel:['Credential stuffing','Phishing kits','Cloud account abuse'] },
  { id:'sf', city:'San Francisco', country:'United States', x:13, y:40, score:54, kind:'Phishing', intel:['OAuth phishing','Malvertising','Token theft'] },
  { id:'sp', city:'São Paulo', country:'Brazil', x:34, y:70, score:71, kind:'Malware', intel:['Banking trojans','Loader campaigns','Mobile malware'] },
  { id:'ldn', city:'London', country:'United Kingdom', x:47, y:34, score:61, kind:'Phishing', intel:['Business email compromise','Credential theft','Brand impersonation'] },
  { id:'fra', city:'Frankfurt', country:'Germany', x:51, y:36, score:72, kind:'Malware', intel:['Malware distribution','Command-and-control','Infostealers'] },
  { id:'war', city:'Warsaw', country:'Poland', x:55, y:34, score:77, kind:'Ransomware', intel:['Ransomware staging','Remote access abuse','Initial-access brokers'] },
  { id:'jhb', city:'Johannesburg', country:'South Africa', x:54, y:73, score:58, kind:'Credential', intel:['Account takeover','SMS phishing','Financial fraud'] },
  { id:'mum', city:'Mumbai', country:'India', x:69, y:55, score:73, kind:'Botnet', intel:['Botnet scanning','Credential attacks','DDoS infrastructure'] },
  { id:'sin', city:'Singapore', country:'Singapore', x:78, y:63, score:65, kind:'Malware', intel:['Cloud compromise','Loader traffic','Supply-chain probes'] },
  { id:'tok', city:'Tokyo', country:'Japan', x:88, y:45, score:59, kind:'Phishing', intel:['QR phishing','Credential harvesting','Mobile targeting'] },
  { id:'syd', city:'Sydney', country:'Australia', x:90, y:78, score:48, kind:'Botnet', intel:['IoT scanning','DDoS nodes','Exposed services'] },
  { id:'dub', city:'Dubai', country:'United Arab Emirates', x:64, y:49, score:63, kind:'Credential', intel:['Executive impersonation','Cloud login abuse','Payment diversion'] },
];

const routes: ThreatRoute[] = [
  { from:'war', to:'ny', kind:'Ransomware' },
  { from:'fra', to:'ldn', kind:'Malware' },
  { from:'mum', to:'fra', kind:'Botnet' },
  { from:'sin', to:'sf', kind:'Malware' },
  { from:'sp', to:'ny', kind:'Credential' },
  { from:'tok', to:'syd', kind:'Phishing' },
  { from:'dub', to:'ldn', kind:'Credential' },
  { from:'jhb', to:'mum', kind:'Botnet' },
  { from:'sf', to:'tok', kind:'Phishing' },
];

const feedSeed = [
  ['Credential', 'Credential-harvesting cluster expanded across cloud login portals'],
  ['Ransomware', 'Ransomware staging activity observed on newly registered infrastructure'],
  ['Malware', 'Infostealer delivery chain rotated command-and-control endpoints'],
  ['Botnet', 'High-volume scanning detected against exposed remote-management services'],
  ['Phishing', 'Brand impersonation campaign began using fresh redirect domains'],
  ['Credential', 'Password-spray pattern observed against enterprise identity providers'],
  ['Malware', 'Loader traffic shifted to compromised web infrastructure'],
  ['Botnet', 'IoT nodes increased beacon frequency across multiple regions'],
] as const;

const rangeMultiplier: Record<RangeKey, number> = { '1H': 1, '24H': 7, '7D': 19, '30D': 46 };

const startup = [
  { label:'Initializing telemetry', progress:14 },
  { label:'Connecting regional sensors', progress:34 },
  { label:'Loading campaign database', progress:56 },
  { label:'Decrypting intelligence packets', progress:78 },
  { label:'Building global topology', progress:94 },
  { label:'Visualization online', progress:100 },
];

function curve(a: ThreatNode, b: ThreatNode) {
  const mx = (a.x + b.x) / 2;
  const my = Math.min(a.y, b.y) - Math.max(8, Math.abs(a.x - b.x) * .16);
  return `M ${a.x} ${a.y} Q ${mx} ${my} ${b.x} ${b.y}`;
}

function ThreatAudio({ enabled, online }:{ enabled:boolean; online:boolean }) {
  useEffect(() => {
    if (!enabled || !online) return;
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const master = ctx.createGain();
    master.gain.value = .022;
    master.connect(ctx.destination);

    const hum = ctx.createOscillator();
    const humGain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    hum.type = 'sine';
    hum.frequency.value = 48;
    humGain.gain.value = .55;
    filter.type = 'lowpass';
    filter.frequency.value = 160;
    hum.connect(humGain);
    humGain.connect(filter);
    filter.connect(master);
    hum.start();

    const ping = () => {
      if (ctx.state === 'suspended') ctx.resume().catch(()=>{});
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + .18);
      gain.gain.setValueAtTime(.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(.12, ctx.currentTime + .015);
      gain.gain.exponentialRampToValueAtTime(.0001, ctx.currentTime + .28);
      osc.connect(gain);
      gain.connect(master);
      osc.start();
      osc.stop(ctx.currentTime + .3);
    };

    const timer = window.setInterval(ping, 9500);
    const resume = () => ctx.state === 'suspended' && ctx.resume();
    window.addEventListener('pointerdown', resume, { once:true });
    ping();

    return () => {
      window.clearInterval(timer);
      window.removeEventListener('pointerdown', resume);
      try { hum.stop(); ctx.close(); } catch {}
    };
  }, [enabled, online]);

  return null;
}

function StartupSequence({ onDone, sound, setSound }:{
  onDone:()=>void;
  sound:boolean;
  setSound:(value:boolean)=>void;
}) {
  const [phase, setPhase] = useState(0);
  const [typed, setTyped] = useState('');
  const [glitch, setGlitch] = useState(false);
  const current = startup[Math.min(phase, startup.length - 1)];

  useEffect(() => {
    let char = 0;
    setTyped('');
    const typing = window.setInterval(() => {
      char += 1;
      setTyped(current.label.slice(0, char));
      if (char >= current.label.length) window.clearInterval(typing);
    }, 28);

    const glitchTimer = window.setTimeout(() => {
      if (phase === 3) {
        setGlitch(true);
        window.setTimeout(() => setGlitch(false), 180);
      }
    }, 280);

    const next = window.setTimeout(() => {
      if (phase >= startup.length - 1) {
        window.setTimeout(onDone, 520);
      } else {
        setPhase(v => v + 1);
      }
    }, phase === startup.length - 1 ? 780 : 520);

    return () => {
      window.clearInterval(typing);
      window.clearTimeout(next);
      window.clearTimeout(glitchTimer);
    };
  }, [phase, current.label, onDone]);

  return (
    <div className={`threat-startup phase-${phase}`}>
      <div className="startup-scanline" />
      <div className="startup-noise" />
      <div className="startup-topology" aria-hidden="true">
        <svg viewBox="0 0 100 60">
          <path d="M5 25L12 14L24 12L33 20L28 30L18 35L9 31ZM24 37L33 41L35 50L28 58L22 48ZM40 16L53 11L68 17L79 16L94 24L87 34L73 31L63 38L52 33L44 28ZM46 34L59 36L65 48L57 58L49 50ZM79 42L92 40L98 49L90 57L80 52Z"/>
          <circle cx="22" cy="25" r="1.2"/><circle cx="52" cy="24" r="1.2"/><circle cx="68" cy="27" r="1.2"/><circle cx="86" cy="48" r="1.2"/>
        </svg>
      </div>

      <div className="startup-console">
        <div className="startup-emblem"><span>BT</span><i/><b>INTEL</b></div>
        <small>BLACKTERM INTELLIGENCE ENGINE // SECURE BOOT</small>
        <h2>GLOBAL THREAT INTELLIGENCE</h2>
        <div className="startup-terminal">
          {startup.slice(0, phase).map((item, index) =>
            <p key={item.label}><span>{String(index + 1).padStart(2,'0')}</span>{item.label}<b>OK</b></p>
          )}
          <p className={glitch ? 'glitching' : ''}>
            <span>{String(phase + 1).padStart(2,'0')}</span>
            {glitch ? 'Decrypting ███████████ packets' : typed}
            <i>▋</i>
          </p>
        </div>
        <div className="startup-progress"><i style={{ width:`${current.progress}%` }}/></div>
        <div className="startup-meta"><span>{current.progress}%</span><b>{phase === startup.length - 1 ? 'ONLINE' : 'BOOTING'}</b></div>
        <button type="button" className="startup-sound" onClick={() => setSound(!sound)}>
          AUDIO {sound ? 'ON' : 'OFF'}
        </button>
      </div>

      {phase === startup.length - 1 && <div className="startup-flash" />}
    </div>
  );
}

export default function ThreatMap() {
  const [selected, setSelected] = useState<ThreatNode>(nodes[5]);
  const [kind, setKind] = useState<'All' | ThreatKind>('All');
  const [range, setRange] = useState<RangeKey>('24H');
  const [paused, setPaused] = useState(false);
  const [tick, setTick] = useState(0);
  const [online, setOnline] = useState(false);
  const [sound, setSound] = useState(true);
  const [reveal, setReveal] = useState(false);

  const finishStartup = () => {
    setOnline(true);
    window.setTimeout(() => setReveal(true), 40);
  };

  useEffect(() => {
    if (paused || !online) return;
    const timer = window.setInterval(() => setTick(v => v + 1), 2600);
    return () => window.clearInterval(timer);
  }, [paused, online]);

  const visibleNodes = useMemo(
    () => kind === 'All' ? nodes : nodes.filter(node => node.kind === kind),
    [kind],
  );

  const visibleIds = useMemo(() => new Set(visibleNodes.map(node => node.id)), [visibleNodes]);

  const visibleRoutes = useMemo(
    () => routes.filter(route =>
      (kind === 'All' || route.kind === kind) &&
      visibleIds.has(route.from) &&
      visibleIds.has(route.to)
    ),
    [kind, visibleIds],
  );

  const activeEvents = Math.round((112 + (tick % 17)) * rangeMultiplier[range]);
  const countries = Math.min(92, 38 + visibleNodes.length * 3 + Math.floor(rangeMultiplier[range] / 2));
  const feed = useMemo(() => {
    const offset = tick % feedSeed.length;
    return [...feedSeed.slice(offset), ...feedSeed.slice(0, offset)].slice(0, 6);
  }, [tick]);

  return (
    <div className="threat-map-shell">
      {!online && <StartupSequence onDone={finishStartup} sound={sound} setSound={setSound}/>}
      <ThreatAudio enabled={sound} online={online}/>

      <div className={`threat-map-app threat-map-reveal ${reveal ? 'online' : ''}`}>
        <header className="threat-map-header">
          <div>
            <small>BLACKTERM INTELLIGENCE ENGINE // VISUALIZATION MODE</small>
            <h2>Global Threat Intelligence</h2>
            <p>Interactive educational simulation of global attack patterns and defensive telemetry.</p>
          </div>
          <div className="threat-map-status">
            <button type="button" className={`threat-audio-toggle ${sound ? 'active' : ''}`} onClick={() => setSound(v => !v)}>
              AUDIO {sound ? 'ON' : 'OFF'}
            </button>
            <span className={paused ? 'paused' : ''}>● {paused ? 'PAUSED' : 'MONITORING'}</span>
            <button type="button" onClick={() => setPaused(v => !v)}>{paused ? 'RESUME' : 'PAUSE'}</button>
          </div>
        </header>

        <div className="threat-map-metrics">
          <article><small>ACTIVE EVENTS</small><strong>{activeEvents.toLocaleString()}</strong><span>simulated signals</span></article>
          <article><small>REGIONS TRACKED</small><strong>{countries}</strong><span>global coverage</span></article>
          <article><small>THREAT LEVEL</small><strong>ELEVATED</strong><span>training scenario</span></article>
          <article><small>REFRESH</small><strong>{paused ? 'HOLD' : '2.6s'}</strong><span>visual cycle</span></article>
        </div>

        <div className="threat-map-controls">
          <div>
            <small>THREAT CLASS</small>
            {(['All','Phishing','Ransomware','Malware','Botnet','Credential'] as const).map(item =>
              <button type="button" key={item} className={kind === item ? 'active' : ''} onClick={() => setKind(item)}>{item}</button>
            )}
          </div>
          <div>
            <small>TIME WINDOW</small>
            {(['1H','24H','7D','30D'] as const).map(item =>
              <button type="button" key={item} className={range === item ? 'active' : ''} onClick={() => setRange(item)}>{item}</button>
            )}
          </div>
        </div>

        <div className="threat-map-layout">
          <section className="threat-map-stage" aria-label="Simulated global cybersecurity activity map">
            <div className="threat-map-grid" />
            <div className="threat-radar-sweep" />
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label="Stylized global map with animated threat routes">
              <defs>
                <filter id="btGlow">
                  <feGaussianBlur stdDeviation=".7" result="blur" />
                  <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
                <pattern id="btDots" width="2.8" height="2.8" patternUnits="userSpaceOnUse">
                  <circle cx=".7" cy=".7" r=".2" fill="currentColor" opacity=".45"/>
                </pattern>
              </defs>

              <g className="world-silhouette">
                <path d="M5 34 L9 25 L18 19 L26 22 L30 29 L27 35 L23 37 L20 44 L15 48 L10 44 Z" />
                <path d="M24 51 L31 55 L34 65 L31 78 L27 88 L23 75 L20 62 Z" />
                <path d="M40 26 L47 20 L57 22 L60 28 L67 28 L72 33 L80 30 L91 36 L96 45 L91 51 L83 50 L78 58 L70 54 L65 45 L58 43 L52 49 L47 43 L42 40 Z" />
                <path d="M47 48 L56 50 L62 61 L59 77 L53 88 L47 78 L43 65 Z" />
                <path d="M82 68 L91 66 L97 73 L94 84 L85 86 L79 78 Z" />
                <path d="M39 18 L44 14 L49 17 L47 22 L41 23 Z" />
              </g>

              <g className="threat-routes">
                {visibleRoutes.map((route, index) => {
                  const a = nodes.find(n => n.id === route.from)!;
                  const b = nodes.find(n => n.id === route.to)!;
                  return <path key={`${route.from}-${route.to}`} d={curve(a,b)} style={{ animationDelay:`-${index * .63}s` }} />;
                })}
              </g>

              <g className="threat-packets">
                {visibleRoutes.map((route, index) => {
                  const a = nodes.find(n => n.id === route.from)!;
                  const b = nodes.find(n => n.id === route.to)!;
                  const id = `route-${route.from}-${route.to}`;
                  return (
                    <g key={id}>
                      <path id={id} d={curve(a,b)} fill="none" stroke="none"/>
                      <circle r=".48" className="packet-dot" style={{ animationDelay:`-${index * .57}s` }}>
                        <animateMotion dur={`${2.8 + (index % 3) * .7}s`} repeatCount="indefinite">
                          <mpath href={`#${id}`}/>
                        </animateMotion>
                      </circle>
                    </g>
                  );
                })}
              </g>

              <g className="threat-nodes">
                {visibleNodes.map((node, index) =>
                  <g
                    key={node.id}
                    className={`threat-node ${selected.id === node.id ? 'selected' : ''}`}
                    transform={`translate(${node.x} ${node.y})`}
                    onClick={() => setSelected(node)}
                    role="button"
                    aria-label={`${node.city}, ${node.country}: ${node.kind}`}
                    style={{ animationDelay:`-${index * .31}s` }}
                  >
                    <circle className="node-wave" r="2.4"/>
                    <circle className="node-ring" r="1.25"/>
                    <circle className="node-core" r=".58"/>
                  </g>
                )}
              </g>
            </svg>

            <div className="map-coordinate top-left">LAT 89.000 // LON -180.000</div>
            <div className="map-coordinate bottom-right">LAT -89.000 // LON 180.000</div>
            <div className="map-legend"><span><i/> Threat node</span><span><b/> Animated route</span><span><em/> Packet</span></div>
          </section>

          <aside className="threat-intel-panel">
            <div className="intel-classification">SELECTED INTELLIGENCE</div>
            <div className="intel-location">
              <small>{selected.country}</small>
              <h3>{selected.city}</h3>
              <span>{selected.kind.toUpperCase()}</span>
            </div>
            <div className="threat-score">
              <div><small>THREAT SCORE</small><strong>{selected.score}%</strong></div>
              <div><i style={{ width:`${selected.score}%` }} /></div>
            </div>
            <div className="intel-signals">
              <small>OBSERVED PATTERNS</small>
              {selected.intel.map((item, index) => <p key={item}><b>0{index + 1}</b>{item}</p>)}
            </div>
            <div className="intel-note">
              <strong>SIMULATED INTELLIGENCE</strong>
              <p>This interface demonstrates frontend visualization and SOC dashboard design. Events are generated locally and are not claims of current attacks.</p>
            </div>
          </aside>
        </div>

        <section className="threat-feed">
          <header><div><small>EVENT STREAM</small><h3>Global detection feed</h3></div><span>{paused ? 'FEED SUSPENDED' : 'AUTO ROTATING'}</span></header>
          <div>
            {feed.map(([type, text], index) =>
              <article key={`${type}-${text}`}>
                <time>{String(index * 7 + 2).padStart(2,'0')}s</time>
                <span>{type}</span>
                <p>{text}</p>
                <b>{['MEDIUM','HIGH','ELEVATED'][index % 3]}</b>
              </article>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
