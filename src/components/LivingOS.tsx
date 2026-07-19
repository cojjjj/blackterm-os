import React, { useEffect, useMemo, useState } from 'react';

export type ObserverState = {
  visits:number;
  totalApps:number;
  clearance:number;
  firstSeen:string;
  lastSeen:string;
};

const KEY='bt-observer-state-v1';

export function loadObserverState():ObserverState{
  const now=new Date().toISOString();
  try{
    const raw=localStorage.getItem(KEY);
    if(raw){
      const old=JSON.parse(raw) as ObserverState;
      const next={...old,visits:(old.visits||0)+1,lastSeen:now};
      localStorage.setItem(KEY,JSON.stringify(next));
      return next;
    }
  }catch{}
  const first={visits:1,totalApps:0,clearance:1,firstSeen:now,lastSeen:now};
  localStorage.setItem(KEY,JSON.stringify(first));
  return first;
}

export function saveObserverState(state:ObserverState){
  localStorage.setItem(KEY,JSON.stringify(state));
}

export function observerGreeting(visits:number){
  if(visits>=10)return 'Observer recognized. Omega clearance retained.';
  if(visits>=5)return 'You returned. The Archive remembers.';
  if(visits>=3)return 'Observer signature reacquired.';
  if(visits>=2)return 'Welcome back, Observer.';
  return 'New Observer detected.';
}

export function clearanceName(level:number){
  return ['VISITOR','DELTA-1','SIGMA-3','OMEGA-7'][Math.max(0,Math.min(3,level-1))];
}

export function SeasonalLayer(){
  const season=useMemo(()=>{
    const m=new Date().getMonth();
    if(m===9)return 'halloween';
    if(m===11||m===0)return 'winter';
    if(m>=5&&m<=7)return 'summer';
    return 'standard';
  },[]);
  if(season==='standard')return null;
  return <div className={`season-layer season-${season}`} aria-hidden="true">
    {Array.from({length:season==='winter'?44:season==='halloween'?22:14},(_,i)=><i key={i} style={{left:`${(i*37)%101}%`,animationDelay:`-${(i%13)*.7}s`,animationDuration:`${7+(i%8)}s`}}/>)}
    <span>{season==='halloween'?'OCTOBER GHOST PROTOCOL':season==='winter'?'FROZEN RELAY SEASON':'HEAT-SHIMMER ACTIVE'}</span>
  </div>;
}

const procedural=[
  'Encrypted relay handshake verified',
  'Unknown carrier signal faded below threshold',
  'Archive integrity sweep completed',
  'Node 07 restored to operational status',
  'Passive threat signature discarded',
  'Long-range telemetry packet received',
  'Observer behavior model synchronized',
  'Remote uplink latency nominal'
];

export function LivingEventFeed({activeApp,onEvent}:{activeApp?:string;onEvent?:(text:string)=>void}){
  const [event,setEvent]=useState('Living world engine initialized');
  useEffect(()=>{
    const emit=()=>{
      const contextual=activeApp?`${activeApp.toUpperCase()} channel activity detected`:procedural[Math.floor(Math.random()*procedural.length)];
      setEvent(contextual);onEvent?.(contextual);
    };
    const first=window.setTimeout(emit,3500);
    const timer=window.setInterval(emit,18000+Math.floor(Math.random()*12000));
    return()=>{clearTimeout(first);clearInterval(timer)};
  },[activeApp,onEvent]);
  return <div className="living-event"><small>{new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit',second:'2-digit'})}</small><span>{event}</span></div>;
}
