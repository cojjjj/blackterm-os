import React, { useEffect, useMemo, useState } from 'react';
import type { WallpaperName } from './Personalization';

type Props={ wallpaper:WallpaperName; enabled:boolean; activeApp?:string };

const labels:Partial<Record<WallpaperName,string[]>>={
  'singularity':['EVENT HORIZON ACTIVE','GRAVITY WELL OSCILLATION','UNKNOWN MASS DETECTED'],
  'ghost-protocol':['UNVERIFIED SIGNAL','PHANTOM PROCESS DETECTED','IDENTITY HASH MISMATCH'],
  'midnight-override':['CITY RELAY LINKED','ROOFTOP NODE ONLINE','MIDNIGHT CHANNEL OPEN'],
  'core-breach':['CORE TEMPERATURE CRITICAL','ROOT ACCESS GRANTED','DATA BUS OVERLOAD'],
  'lost-transmission':['NO SIGNAL','DEEP SPACE RELAY LOST','CARRIER WAVE SEARCHING'],
  'terminal-world':['128 NODES LINKED','GLOBAL TRACE ACTIVE','PACKET ROUTE CHANGED'],
  'red-vector':['THREAT LEVEL CRITICAL','VECTOR LOCK ACQUIRED','CONTAINMENT FAILURE'],
  'frozen-signal':['ZERO RESPONSE','THERMAL LINK OFFLINE','SIGNAL FROZEN'],
  'archive':['ACCESS RESTRICTED','ARCHIVE INDEXING','RECOVERED FRAGMENT FOUND'],
  'rogue-shadow':['PRESENCE DETECTED','SHADOW PROCESS ACTIVE','OBSERVER UNKNOWN']
};

const sceneNames = new Set(Object.keys(labels));

export default function LiveWallpaper({wallpaper,enabled,activeApp}:Props){
  const [eventId,setEventId]=useState(0);
  const [message,setMessage]=useState('');
  const supported=sceneNames.has(wallpaper);

  useEffect(()=>{
    if(!enabled||!supported)return;
    let timer=0;
    const schedule=()=>{
      timer=window.setTimeout(()=>{
        const pool=labels[wallpaper]||['SIGNAL EVENT'];
        setMessage(pool[Math.floor(Math.random()*pool.length)]);
        setEventId(v=>v+1);
        schedule();
      },6500+Math.random()*12000);
    };
    schedule();
    return()=>window.clearTimeout(timer);
  },[enabled,wallpaper,supported]);

  const particles=useMemo(()=>Array.from({length:32},(_,i)=>({
    left:`${(i*29+7)%100}%`,top:`${(i*47+11)%100}%`,delay:`-${(i%11)*.83}s`,duration:`${5+(i%8)*.8}s`,size:`${1+(i%3)}px`
  })),[wallpaper]);

  const rain=useMemo(()=>Array.from({length:24},(_,i)=>({
    left:`${(i*41+3)%100}%`,delay:`-${(i%9)*.7}s`,duration:`${2.8+(i%6)*.38}s`,height:`${28+(i%5)*16}px`
  })),[wallpaper]);

  if(!enabled||!supported)return null;

  return <div className={`live-wallpaper cinematic-scene live-${wallpaper} reactive-${activeApp||'desktop'}`} aria-hidden="true">
    <div className="scene-parallax scene-back"/>
    <div className="scene-parallax scene-mid"/>
    <div className="scene-parallax scene-front"/>
    <div className="scene-fog fog-a"/><div className="scene-fog fog-b"/>
    <div className="scene-orbit orbit-a"/><div className="scene-orbit orbit-b"/>
    <div className="scene-radar"/><div className="scene-beam"/>
    <div className="scene-code"><span>0xB7A4</span><span>BLACKTERM://ACTIVE</span><span>NODE_OMEGA_7</span></div>
    <div className="scene-particles">{particles.map((p,i)=><i key={i} style={{left:p.left,top:p.top,width:p.size,height:p.size,animationDelay:p.delay,animationDuration:p.duration}}/>)}</div>
    <div className="scene-rain">{rain.map((r,i)=><i key={i} style={{left:r.left,height:r.height,animationDelay:r.delay,animationDuration:r.duration}}/>)}</div>
    <div className="scene-lightning"/>
    <div className="scene-vignette"/>
    <div key={eventId} className="scene-random-event"><span/><b>{message}</b></div>
    <div className="scene-hud"><span>BLACKTERM // CINEMATIC ENVIRONMENT</span><b>{String(wallpaper).replaceAll('-',' ').toUpperCase()}</b><em>{activeApp?`REACTING TO // ${activeApp.toUpperCase()}`:'SYSTEM IDLE'}</em></div>
  </div>;
}
