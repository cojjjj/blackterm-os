import React, { useEffect, useMemo, useState } from 'react';

type NodeKind = 'edge' | 'host' | 'hypervisor' | 'vm' | 'service';
type LabNode = {
  id:string; name:string; subtitle:string; kind:NodeKind;
  status:'ONLINE'|'MONITORING'|'STANDBY';
  x:number; y:number; cpu:number; memory:number; network:number;
  details:string[]; tools:string[];
};

const labNodes:LabNode[] = [
 {id:'internet',name:'Internet',subtitle:'External network',kind:'edge',status:'ONLINE',x:50,y:8,cpu:0,memory:0,network:92,details:['Public internet uplink','External research and package sources','Isolated from lab workloads'],tools:['HTTPS','DNS','VPN']},
 {id:'router',name:'Home Router',subtitle:'Gateway and wireless edge',kind:'edge',status:'ONLINE',x:50,y:22,cpu:21,memory:38,network:64,details:['NAT and local gateway','Wireless and wired device access','Separates lab hosts from the public network'],tools:['DHCP','DNS forwarding','Firewall']},
 {id:'workstation',name:'Main Workstation',subtitle:'Primary BLACKTERM host',kind:'host',status:'ONLINE',x:50,y:38,cpu:34,memory:49,network:42,details:['AMD Ryzen 9 7950X3D','32 GB DDR5 memory','Windows host for development and virtualization'],tools:['VS Code','Git','Python','Docker','VirtualBox']},
 {id:'virtualbox',name:'VirtualBox',subtitle:'Virtualization layer',kind:'hypervisor',status:'ONLINE',x:50,y:53,cpu:45,memory:58,network:35,details:['Runs isolated security systems','Supports snapshots and repeatable labs','Bridged and host-only networking'],tools:['Snapshots','NAT Network','Host-only Network']},
 {id:'kali',name:'Kali Linux',subtitle:'Offensive security VM',kind:'vm',status:'STANDBY',x:14,y:77,cpu:18,memory:31,network:12,details:['Authorized security testing workstation','Reconnaissance and web assessment environment','Isolated from production devices'],tools:['Nmap','Burp Suite','Wireshark','Gobuster','Metasploit']},
 {id:'windows',name:'Windows Endpoint',subtitle:'Monitored test workstation',kind:'vm',status:'MONITORING',x:38,y:77,cpu:29,memory:44,network:26,details:['Windows endpoint enrolled in the lab','Sysmon telemetry enabled','Used to generate and investigate events'],tools:['Sysmon','PowerShell','Event Viewer','Wazuh Agent']},
 {id:'wazuh',name:'Wazuh Manager',subtitle:'SIEM and detection server',kind:'service',status:'MONITORING',x:62,y:77,cpu:41,memory:53,network:39,details:['Centralizes endpoint security telemetry','Detection rules and alert investigation','Dashboard for SOC-style analysis'],tools:['Wazuh Dashboard','Rules Engine','File Integrity Monitoring','Log Analysis']},
 {id:'ubuntu',name:'Ubuntu Server',subtitle:'Linux services VM',kind:'vm',status:'ONLINE',x:86,y:77,cpu:23,memory:37,network:31,details:['Linux administration practice','Container and service hosting','Network troubleshooting target'],tools:['Docker','Nginx','SSH','systemd']}
];

const links = [
 ['internet','router'],['router','workstation'],['workstation','virtualbox'],
 ['virtualbox','kali'],['virtualbox','windows'],['virtualbox','wazuh'],['virtualbox','ubuntu'],
 ['windows','wazuh'],['ubuntu','wazuh']
] as const;

const events = [
 'Windows endpoint forwarded a Sysmon process event',
 'Wazuh rules engine evaluated endpoint telemetry',
 'Ubuntu service health check completed',
 'VirtualBox host-only network heartbeat received',
 'Kali snapshot verified and returned to standby',
 'File integrity baseline remains unchanged'
];

const kindLabel:Record<NodeKind,string>={edge:'NETWORK EDGE',host:'PHYSICAL HOST',hypervisor:'VIRTUALIZATION',vm:'VIRTUAL MACHINE',service:'SECURITY SERVICE'};
const nodeById=(id:string)=>labNodes.find(n=>n.id===id)!;

export default function HomeLab(){
 const [selected,setSelected]=useState(labNodes[6]);
 const [monitoring,setMonitoring]=useState(true);
 const [tick,setTick]=useState(0);
 const [view,setView]=useState<'topology'|'inventory'>('topology');

 useEffect(()=>{if(!monitoring)return;const t=window.setInterval(()=>setTick(v=>v+1),2200);return()=>window.clearInterval(t)},[monitoring]);

 const metrics=useMemo(()=>({
   systems:labNodes.length,
   active:labNodes.filter(n=>n.status!=='STANDBY').length,
   alerts:3+(tick%3),
   events:386+tick*7
 }),[tick]);

 const currentEvents=useMemo(()=>{
   const o=tick%events.length;
   return [...events.slice(o),...events.slice(0,o)].slice(0,5);
 },[tick]);

 const highlightedLinks = useMemo(()=>{
   if(selected.id==='windows') return new Set(['virtualbox-windows','windows-wazuh']);
   if(selected.id==='wazuh') return new Set(['virtualbox-wazuh','windows-wazuh','ubuntu-wazuh']);
   if(selected.id==='ubuntu') return new Set(['virtualbox-ubuntu','ubuntu-wazuh']);
   if(selected.id==='kali') return new Set(['virtualbox-kali']);
   if(selected.id==='virtualbox') return new Set(['workstation-virtualbox','virtualbox-kali','virtualbox-windows','virtualbox-wazuh','virtualbox-ubuntu']);
   return new Set(links.filter(([a,b])=>a===selected.id||b===selected.id).map(([a,b])=>`${a}-${b}`));
 },[selected]);

 return <div className="home-lab-app polished-lab">
  <header className="home-lab-header">
   <div><small>BLACKTERM LAB // PERSONAL CYBER RANGE</small><h2>Home Lab Visualization</h2><p>Interactive map of Tyler's virtualization, monitoring, Linux, Windows, and security-testing environment.</p></div>
   <div className="home-lab-header-actions">
    <button className={view==='topology'?'active':''} onClick={()=>setView('topology')}>TOPOLOGY</button>
    <button className={view==='inventory'?'active':''} onClick={()=>setView('inventory')}>INVENTORY</button>
    <button className={monitoring?'active':''} onClick={()=>setMonitoring(v=>!v)}>{monitoring?'● MONITORING':'○ PAUSED'}</button>
   </div>
  </header>

  <div className="home-lab-metrics">
   {[['LAB SYSTEMS',metrics.systems,'documented assets'],['ACTIVE NODES',metrics.active,'online or monitored'],['EVENTS TODAY',metrics.events,'simulated telemetry'],['OPEN ALERTS',metrics.alerts,'training scenario']].map(([a,b,c])=><article key={String(a)}><small>{a}</small><strong>{b}</strong><span>{c}</span></article>)}
  </div>

  {view==='topology'?<div className="home-lab-layout">
   <section className="lab-topology">
    <div className="lab-grid"/>
    <div className="virtual-rack-label"><span>VIRTUALBOX CYBER RANGE</span><b>4 GUEST SYSTEMS</b></div>
    <div className="virtual-rack-frame"/>

    <svg viewBox="0 0 100 100" preserveAspectRatio="none">
     <defs><filter id="labGlow"><feGaussianBlur stdDeviation=".7" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
     <g className="lab-links">
      {links.map(([f,t],i)=>{
       const a=nodeById(f),b=nodeById(t),id=`${f}-${t}`;
       const d=`M ${a.x} ${a.y} C ${a.x} ${(a.y+b.y)/2}, ${b.x} ${(a.y+b.y)/2}, ${b.x} ${b.y}`;
       return <path key={id} id={`lab-link-${i}`} d={d} className={highlightedLinks.has(id)?'highlighted':''}/>
      })}
     </g>
     <g className="lab-packets">
      {links.map(([f,t],i)=>{
       const id=`${f}-${t}`;
       return <circle key={id+'p'} r={highlightedLinks.has(id)?'.58':'.42'} className={highlightedLinks.has(id)?'highlighted':''}>
        <animateMotion dur={`${highlightedLinks.has(id)?1.35:2.4+(i%4)*.45}s`} repeatCount="indefinite"><mpath href={`#lab-link-${i}`}/></animateMotion>
       </circle>
      })}
     </g>
    </svg>

    {labNodes.map((n,i)=><button
      key={n.id}
      className={`lab-node kind-${n.kind} ${selected.id===n.id?'selected':''} ${n.id==='virtualbox'?'wide-node':''}`}
      style={{left:`${n.x}%`,top:`${n.y}%`,animationDelay:`-${i*.24}s`}}
      onClick={()=>setSelected(n)}
    >
      <span>{n.kind==='edge'?'⌁':n.kind==='host'?'▣':n.kind==='hypervisor'?'◇':n.kind==='service'?'⬡':'▤'}</span>
      <strong>{n.name}</strong><small>{n.subtitle}</small>
      <i className={n.status.toLowerCase()}><em/>{n.status}</i>
    </button>)}
   </section>

   <aside className="lab-inspector">
    <div className="lab-inspector-class">{kindLabel[selected.kind]}</div>
    <div className="lab-inspector-title">
     <span>{selected.kind==='service'?'⬡':selected.kind==='vm'?'▤':selected.kind==='host'?'▣':'◇'}</span>
     <div><small>{selected.status}</small><h3>{selected.name}</h3><p>{selected.subtitle}</p></div>
    </div>

    {(selected.id==='windows'||selected.id==='wazuh')&&<div className="telemetry-route">
      <small>ACTIVE TELEMETRY PATH</small>
      <div><span>WINDOWS</span><b>→</b><span>SYSMON</span><b>→</b><span>WAZUH</span><b>→</b><span>SOC</span></div>
    </div>}

    <div className="lab-resource-bars">
     {[['CPU',selected.cpu],['MEMORY',selected.memory],['NETWORK',selected.network]].map(([l,v])=>{
      const value=Math.min(98,Number(v)+((tick+Number(v))%5));
      return <div key={String(l)}><span>{l}</span><strong>{value}%</strong><div><i style={{width:`${value}%`}}/></div></div>
     })}
    </div>

    <section className="lab-detail-section"><small>ROLE AND CONFIGURATION</small>{selected.details.map((d,i)=><p key={d}><b>0{i+1}</b>{d}</p>)}</section>
    <section className="lab-tools"><small>TOOLS / SERVICES</small><div>{selected.tools.map(t=><span key={t}>{t}</span>)}</div></section>
    <div className="lab-disclosure"><strong>PORTFOLIO REPRESENTATION</strong><p>This visualization documents Tyler's hands-on lab experience. Resource percentages and event counts are simulated.</p></div>
   </aside>
  </div>
  :<section className="lab-inventory">{labNodes.map(n=><button key={n.id} onClick={()=>{setSelected(n);setView('topology')}}><span>{n.kind==='service'?'⬡':n.kind==='vm'?'▤':n.kind==='host'?'▣':'◇'}</span><div><strong>{n.name}</strong><small>{n.subtitle}</small></div><em>{kindLabel[n.kind]}</em><b className={n.status.toLowerCase()}>{n.status}</b></button>)}</section>}

  <section className="lab-event-feed"><header><div><small>LAB TELEMETRY</small><h3>Security and infrastructure events</h3></div><span>{monitoring?'LIVE SIMULATION':'FEED PAUSED'}</span></header>{currentEvents.map((e,i)=><article key={e}><time>{String(i*9+3).padStart(2,'0')}s</time><span>{i%2?'SYSTEM':'SECURITY'}</span><p>{e}</p><b>{i===0?'NEW':'OK'}</b></article>)}</section>
 </div>
}
