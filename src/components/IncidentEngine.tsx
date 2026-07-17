import React, { useEffect, useMemo, useState } from 'react';
import {
  IncidentSnapshot, IncidentStage, defaultIncident, incidentLabels,
  incidentStages, readIncident, subscribeIncident, writeIncident
} from './incidentBus';

type AppTarget='threatmap'|'homelab'|'security'|'assistant'|'terminal';

const stageInfo:Record<IncidentStage,{
  title:string; detail:string; mitre:string; target?:AppTarget; event:string;
}> = {
  idle:{title:'Mission 01 ready',detail:'Encoded PowerShell incident simulation is prepared.',mitre:'—',event:'Awaiting operator command'},
  'initial-access':{title:'Phishing link opened',detail:'A simulated user opens a malicious document delivered through email.',mitre:'T1566.001',target:'threatmap',event:'External campaign route associated with endpoint'},
  execution:{title:'Encoded PowerShell launched',detail:'The Windows endpoint starts a Base64-encoded PowerShell command.',mitre:'T1059.001',target:'homelab',event:'WIN-ENDPOINT-01 process creation observed'},
  telemetry:{title:'Sysmon event forwarded',detail:'Sysmon records process creation and the Wazuh agent forwards telemetry.',mitre:'T1059.001',target:'homelab',event:'Windows → Sysmon → Wazuh data path active'},
  detection:{title:'High-severity alert generated',detail:'Wazuh correlation rules identify suspicious encoded execution.',mitre:'T1059.001',target:'security',event:'Rule 92057 generated severity 8.7 alert'},
  investigation:{title:'Analyst investigation active',detail:'The operator reviews process lineage, command arguments, and host context.',mitre:'IR-INVESTIGATE',target:'assistant',event:'BLACKTERM AI prepared investigation summary'},
  containment:{title:'Endpoint isolated',detail:'The affected endpoint is logically contained from the lab network.',mitre:'IR-CONTAIN',target:'terminal',event:'Containment command accepted for WIN-ENDPOINT-01'},
  resolved:{title:'Incident contained',detail:'Malicious activity is stopped and the endpoint is ready for recovery.',mitre:'IR-RECOVER',event:'Mission completed successfully'}
};

export default function IncidentEngine({openApp}:{openApp:(id:any)=>void}) {
  const [incident,setIncident]=useState<IncidentSnapshot>(()=>readIncident());
  const [selected,setSelected]=useState<IncidentStage>(incident.stage);
  const [speed,setSpeed]=useState(1);

  useEffect(()=>subscribeIncident(next=>{setIncident(next);setSelected(next.stage)}),[]);

  useEffect(()=>{
    if(!incident.running||incident.mode!=='auto'||incident.stage==='resolved')return;
    const timer=window.setTimeout(()=>{
      const index=incidentStages.indexOf(incident.stage);
      const nextStage=incidentStages[Math.min(index+1,incidentStages.length-1)];
      const next={...incident,stage:nextStage,alertCount:nextStage==='detection'?incident.alertCount+1:incident.alertCount,running:nextStage!=='resolved'};
      writeIncident(next);
      const target=stageInfo[nextStage].target;
      if(target) openApp(target);
    },2600/speed);
    return()=>window.clearTimeout(timer);
  },[incident,speed,openApp]);

  const update=(patch:Partial<IncidentSnapshot>)=>{
    const next={...incident,...patch};
    writeIncident(next);
  };

  const start=()=>{
    const next={...defaultIncident,stage:'initial-access' as IncidentStage,running:true,mode:incident.mode,startedAt:Date.now()};
    writeIncident(next);
    openApp('threatmap');
  };

  const step=()=>{
    const index=incidentStages.indexOf(incident.stage);
    const nextStage=incidentStages[Math.min(index+1,incidentStages.length-1)];
    const next={...incident,stage:nextStage,alertCount:nextStage==='detection'?incident.alertCount+1:incident.alertCount,running:false};
    writeIncident(next);
    const target=stageInfo[nextStage].target;
    if(target) openApp(target);
  };

  const reset=()=>writeIncident({...defaultIncident,mode:incident.mode});

  const stageIndex=incidentStages.indexOf(incident.stage);
  const progress=Math.max(0,(stageIndex/(incidentStages.length-1))*100);
  const selectedInfo=stageInfo[selected];

  const eventRows=useMemo(()=>{
    const completed=incidentStages.slice(1,Math.max(1,stageIndex+1)).reverse();
    return completed.slice(0,6).map((stage,index)=>({
      stage,time:`${String(index*6+2).padStart(2,'0')}s`,...stageInfo[stage]
    }));
  },[stageIndex]);

  return <div className="incident-engine">
    <header className="incident-header">
      <div><small>BLACKTERM INCIDENT SIMULATION ENGINE // MISSION 01</small><h2>Encoded PowerShell Intrusion</h2><p>Interactive detection-to-response scenario connecting the Threat Map, Home Lab, Security Center, AI, and Terminal.</p></div>
      <div className={`incident-severity stage-${incident.stage}`}><small>SEVERITY</small><strong>{incident.stage==='idle'?'—':incident.severity}</strong><span>{incident.stage==='resolved'?'RESOLVED':incident.stage==='idle'?'STANDBY':'HIGH'}</span></div>
    </header>

    <div className="incident-controls">
      <button className="primary" onClick={start}>{incident.stage==='idle'||incident.stage==='resolved'?'START MISSION':'RESTART'}</button>
      <button onClick={()=>update({running:!incident.running})} disabled={incident.stage==='idle'||incident.stage==='resolved'}>{incident.running?'PAUSE':'RESUME'}</button>
      <button onClick={step} disabled={incident.stage==='resolved'}>STEP FORWARD</button>
      <button onClick={reset}>RESET</button>
      <label>MODE<select value={incident.mode} onChange={e=>update({mode:e.target.value as 'auto'|'manual',running:false})}><option value="auto">AUTO PLAY</option><option value="manual">MANUAL</option></select></label>
      <label>SPEED<select value={speed} onChange={e=>setSpeed(Number(e.target.value))}><option value="0.75">0.75×</option><option value="1">1×</option><option value="1.5">1.5×</option><option value="2">2×</option></select></label>
    </div>

    <div className="incident-progress"><div><span>{incidentLabels[incident.stage]}</span><b>{Math.round(progress)}%</b></div><div><i style={{width:`${progress}%`}}/></div></div>

    <div className="incident-layout">
      <section className="incident-canvas">
        <div className="incident-grid"/>
        <div className="incident-flow">
          {[
            ['threatmap','THREAT MAP','Campaign origin'],
            ['homelab','WINDOWS ENDPOINT','Affected host'],
            ['homelab','SYSMON','Process telemetry'],
            ['security','WAZUH / SOC','Detection'],
            ['assistant','BLACKTERM AI','Investigation'],
            ['terminal','CONTAINMENT','Response']
          ].map(([app,title,subtitle],index)=>{
            const active=index<=Math.max(-1,stageIndex-1);
            const current=index===Math.max(0,Math.min(5,stageIndex-1));
            return <React.Fragment key={title}>
              <button className={`incident-node ${active?'active':''} ${current?'current':''}`} onClick={()=>openApp(app)}>
                <span>{String(index+1).padStart(2,'0')}</span><strong>{title}</strong><small>{subtitle}</small><i>{active?'ONLINE':'WAITING'}</i>
              </button>
              {index<5&&<div className={`incident-edge ${active&&index<stageIndex-1?'active':''}`}><i/><b>→</b></div>}
            </React.Fragment>
          })}
        </div>

        <div className="incident-stage-detail">
          <div><small>CURRENT STAGE</small><h3>{stageInfo[incident.stage].title}</h3><p>{stageInfo[incident.stage].detail}</p></div>
          <span>{stageInfo[incident.stage].mitre}</span>
        </div>
      </section>

      <aside className="incident-timeline">
        <small>MISSION TIMELINE</small>
        {incidentStages.map((stage,index)=>{
          const complete=index<=stageIndex;
          return <button key={stage} className={`${complete?'complete':''} ${incident.stage===stage?'current':''}`} onClick={()=>setSelected(stage)}>
            <i>{complete?'✓':String(index).padStart(2,'0')}</i>
            <div><strong>{incidentLabels[stage]}</strong><small>{stageInfo[stage].mitre}</small></div>
          </button>
        })}
      </aside>
    </div>

    <div className="incident-lower">
      <section className="incident-intel">
        <header><div><small>STAGE INTELLIGENCE</small><h3>{selectedInfo.title}</h3></div>{selectedInfo.target&&<button onClick={()=>openApp(selectedInfo.target!)}>OPEN RELATED APP ↗</button>}</header>
        <p>{selectedInfo.detail}</p>
        <div><span>MITRE / ACTION</span><b>{selectedInfo.mitre}</b></div>
        <div><span>EVENT</span><b>{selectedInfo.event}</b></div>
      </section>

      <section className="incident-events">
        <header><div><small>INCIDENT EVENT STREAM</small><h3>Correlated activity</h3></div><span>{incident.running?'LIVE':'PAUSED'}</span></header>
        {eventRows.length?eventRows.map(row=><article key={row.stage}><time>{row.time}</time><span>{row.stage.toUpperCase()}</span><p>{row.event}</p><b>{row.stage==='detection'?'HIGH':'INFO'}</b></article>):<div className="incident-empty">Start Mission 01 to generate correlated events.</div>}
      </section>
    </div>
  </div>
}

export function IncidentStatusOverlay({openApp}:{openApp:(id:any)=>void}) {
  const [incident,setIncident]=useState<IncidentSnapshot>(()=>readIncident());
  useEffect(()=>subscribeIncident(setIncident),[]);
  if(incident.stage==='idle')return null;
  const info=stageInfo[incident.stage];
  return <button className={`incident-global-overlay stage-${incident.stage}`} onClick={()=>openApp('incident')}>
    <span>{incident.stage==='resolved'?'✓':'!'}</span>
    <div><small>MISSION 01 // {incident.stage.toUpperCase()}</small><strong>{info.title}</strong><p>{info.event}</p></div>
    <b>{incident.stage==='resolved'?'CLOSED':incident.severity}</b>
  </button>
}
