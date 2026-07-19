import React, { useEffect, useMemo, useRef, useState } from 'react';

type TourStep = {
  eyebrow: string;
  title: string;
  description: string;
  app?: string;
  proof: string[];
  actionLabel?: string;
};

const steps: TourStep[] = [
  {
    eyebrow: '01 // OPERATOR PROFILE',
    title: 'Meet Tyler Deppa',
    description: 'A cybersecurity student and desktop-support professional who combines hands-on troubleshooting, security training, and a builder mindset.',
    app: 'identity',
    proof: ['End-user support experience', 'Cybersecurity degree path', 'Clear technical communication'],
  },
  {
    eyebrow: '02 // PRACTICAL RANGE',
    title: 'Explore the Home Lab',
    description: 'An interactive representation of the systems Tyler uses to practice monitoring, endpoint telemetry, virtualization, networking, and defensive operations.',
    app: 'homelab',
    proof: ['Wazuh + Sysmon monitoring', 'Windows and Linux endpoints', 'VirtualBox cyber range'],
  },
  {
    eyebrow: '03 // DETECTION & RESPONSE',
    title: 'Run an Incident Investigation',
    description: 'The Incident Engine demonstrates how an alert moves from detection through analysis, correlation, containment, and recovery.',
    app: 'incident',
    proof: ['Detection-to-containment workflow', 'SOC-style event correlation', 'MITRE-informed investigation'],
  },
  {
    eyebrow: '04 // MALWARE ANALYSIS',
    title: 'Inspect the Malware Sandbox',
    description: 'A safe educational simulator for reviewing process behavior, indicators of compromise, memory activity, and ATT&CK mappings.',
    app: 'sandbox',
    proof: ['Behavior timeline', 'IOC extraction', 'Risk scoring and AI explanation'],
  },
  {
    eyebrow: '05 // HANDS-ON PROOF',
    title: 'Review Projects and Training',
    description: 'Tyler has completed extensive practical cybersecurity training and builds tools that solve real technical problems.',
    app: 'projects',
    proof: ['Top 1% TryHackMe record', '1000+ completed rooms', 'Public GitHub project archive'],
  },
  {
    eyebrow: '06 // NEXT STEP',
    title: 'Resume and Contact',
    description: 'Thank you for exploring BLACKTERM OS. Tyler is ready to bring curiosity, troubleshooting discipline, and security awareness to an IT or cybersecurity team.',
    app: 'interview',
    proof: ['Production-deployed portfolio', '5,662+ lines across 32 source files', 'Available for professional opportunities'],
    actionLabel: 'FINISH TOUR',
  },
];

export default function RecruiterMode({
  open,
  onClose,
  openApp,
}: {
  open: boolean;
  onClose: () => void;
  openApp: (id: any) => void;
}) {
  const openAppRef = useRef(openApp);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const step = steps[index];
  useEffect(() => { openAppRef.current = openApp; }, [openApp]);
  const progress = useMemo(() => ((index + 1) / steps.length) * 100, [index]);

  useEffect(() => {
    if (!open) return;
    setIndex(0);
    setPaused(false);
  }, [open]);

  useEffect(() => {
    if (!open || paused || !step.app) return;
    const timer = window.setTimeout(() => openAppRef.current(step.app), 260);
    return () => window.clearTimeout(timer);
  }, [open, index, paused, step.app]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowRight') setIndex(value => Math.min(steps.length - 1, value + 1));
      if (event.key === 'ArrowLeft') setIndex(value => Math.max(0, value - 1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const finish = () => {
    localStorage.setItem('blackterm-recruiter-tour-complete', 'true');
    onClose();
  };

  return <div className="recruiter-mode" role="dialog" aria-modal="true" aria-label="BLACKTERM recruiter tour">
    <div className="recruiter-scan" />
    <div className="recruiter-focus-ring" />
    <section className="recruiter-panel">
      <header>
        <div>
          <small>BLACKTERM // GUIDED ACCESS</small>
          <strong>RECRUITER MODE</strong>
        </div>
        <button onClick={finish} aria-label="Exit recruiter mode">EXIT ×</button>
      </header>

      <div className="recruiter-progress"><i style={{ width: `${progress}%` }} /></div>
      <div className="recruiter-counter">STEP {String(index + 1).padStart(2, '0')} / {String(steps.length).padStart(2, '0')}</div>

      <main key={index}>
        <small>{step.eyebrow}</small>
        <h2>{step.title}</h2>
        <p>{step.description}</p>
        <div className="recruiter-proof">
          {step.proof.map(item => <span key={item}><b>✓</b>{item}</span>)}
        </div>
      </main>

      <footer>
        <button disabled={index === 0} onClick={() => setIndex(value => value - 1)}>← BACK</button>
        <button onClick={() => setPaused(value => !value)}>{paused ? 'RESUME' : 'PAUSE'}</button>
        <button onClick={finish}>SKIP TOUR</button>
        {index < steps.length - 1
          ? <button className="primary" onClick={() => setIndex(value => value + 1)}>NEXT →</button>
          : <button className="primary" onClick={finish}>{step.actionLabel || 'FINISH'}</button>}
      </footer>
      <em>Use ← → arrow keys to navigate • ESC to exit</em>
    </section>
  </div>;
}
