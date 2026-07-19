import React, { useEffect, useMemo, useState } from 'react';
import type { WallpaperName } from './Personalization';

type Props={ wallpaper:WallpaperName; enabled:boolean };

const labels:Partial<Record<WallpaperName,string>>={
  'singularity':'EVENT HORIZON ACTIVE',
  'ghost-protocol':'GHOST PROTOCOL // UNVERIFIED SIGNAL',
  'midnight-override':'MIDNIGHT OVERRIDE // CITY LINKED',
  'core-breach':'CORE TEMPERATURE CRITICAL',
  'lost-transmission':'NO SIGNAL // DEEP SPACE RELAY',
  'terminal-world':'GLOBAL NODE MAP // 128 LINKS',
  'red-vector':'RED VECTOR // THREAT LEVEL CRITICAL',
  'frozen-signal':'FROZEN SIGNAL // ZERO RESPONSE',
  'archive':'THE ARCHIVE // ACCESS RESTRICTED',
  'rogue-shadow':'ROGUE SHADOW // PRESENCE DETECTED'
};

export default function LiveWallpaper({wallpaper,enabled}:Props){
  const [eventId,setEventId]=useState(0);
  const supported=wallpaper in labels;
  useEffect(()=>{
    if(!enabled||!supported)return;
    const schedule=()=>window.setTimeout(()=>{setEventId(v=>v+1);timer=schedule()},4500+Math.random()*8500);
    let timer=schedule();
    return()=>window.clearTimeout(timer);
  },[enabled,wallpaper,supported]);
  const sparks=useMemo(()=>Array.from({length:18},(_,i)=>({
    left:`${(i*37)%100}%`,top:`${(i*53)%100}%`,delay:`-${(i%7)*1.1}s`,duration:`${5+(i%6)}s`
  })),[wallpaper]);
  if(!enabled||!supported)return null;
  return <div className={`live-wallpaper live-${wallpaper}`} aria-hidden="true">
    <div className="live-drift layer-a"/><div className="live-drift layer-b"/>
    <div className="live-sweep"/><div className="live-vignette"/>
    <div className="live-particles">{sparks.map((s,i)=><i key={i} style={{left:s.left,top:s.top,animationDelay:s.delay,animationDuration:s.duration}}/>)}</div>
    <div key={eventId} className="live-random-event"><span/><b>{labels[wallpaper]}</b></div>
    <div className="live-hud"><span>BLACKTERM // LIVE WALLPAPER</span><b>{String(wallpaper).replaceAll('-',' ').toUpperCase()}</b></div>
  </div>;
}
