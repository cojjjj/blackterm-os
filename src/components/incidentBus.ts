export type IncidentStage =
  | 'idle'
  | 'initial-access'
  | 'execution'
  | 'telemetry'
  | 'detection'
  | 'investigation'
  | 'containment'
  | 'resolved';

export type IncidentSnapshot = {
  stage: IncidentStage;
  running: boolean;
  mode: 'auto' | 'manual';
  severity: number;
  alertCount: number;
  startedAt: number | null;
};

export const incidentStages: IncidentStage[] = [
  'idle','initial-access','execution','telemetry','detection',
  'investigation','containment','resolved'
];

export const incidentLabels: Record<IncidentStage,string> = {
  idle:'Mission ready',
  'initial-access':'Initial access',
  execution:'Suspicious execution',
  telemetry:'Telemetry forwarding',
  detection:'Detection generated',
  investigation:'Investigation active',
  containment:'Endpoint containment',
  resolved:'Incident resolved'
};

export const defaultIncident: IncidentSnapshot = {
  stage:'idle', running:false, mode:'auto', severity:8.7,
  alertCount:0, startedAt:null
};

const KEY='bt-incident-v12';

export function readIncident():IncidentSnapshot {
  try {
    const saved=localStorage.getItem(KEY);
    return saved ? {...defaultIncident,...JSON.parse(saved)} : defaultIncident;
  } catch { return defaultIncident; }
}

export function writeIncident(next:IncidentSnapshot) {
  localStorage.setItem(KEY,JSON.stringify(next));
  window.dispatchEvent(new CustomEvent('blackterm:incident',{detail:next}));
}

export function subscribeIncident(handler:(snapshot:IncidentSnapshot)=>void) {
  const listener=(event:Event)=>handler((event as CustomEvent<IncidentSnapshot>).detail);
  window.addEventListener('blackterm:incident',listener);
  return()=>window.removeEventListener('blackterm:incident',listener);
}
