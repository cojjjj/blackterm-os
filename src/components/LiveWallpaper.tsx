import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { WallpaperName } from './Personalization';

type Props={ wallpaper:WallpaperName; enabled:boolean; activeApp?:string };
type Dot={x:number;y:number;vx:number;vy:number;r:number;a:number};

const sceneNames=new Set(['singularity','ghost-protocol','midnight-override','core-breach','lost-transmission','terminal-world','red-vector','frozen-signal','archive','rogue-shadow']);
const labels:Record<string,string[]>={
  singularity:['EVENT HORIZON ACTIVE','GRAVITY WELL OSCILLATION','UNKNOWN MASS DETECTED'],
  'ghost-protocol':['UNVERIFIED SIGNAL','PHANTOM PROCESS DETECTED','IDENTITY HASH MISMATCH'],
  'midnight-override':['CITY RELAY LINKED','ROOFTOP NODE ONLINE','MIDNIGHT CHANNEL OPEN'],
  'core-breach':['CORE TEMPERATURE CRITICAL','ROOT ACCESS GRANTED','DATA BUS OVERLOAD'],
  'lost-transmission':['NO SIGNAL','DEEP SPACE RELAY LOST','CARRIER WAVE SEARCHING'],
  'terminal-world':['NEW CONNECTION DETECTED','GLOBAL TRACE ACTIVE','PACKET ROUTE CHANGED'],
  'red-vector':['THREAT LEVEL CRITICAL','VECTOR LOCK ACQUIRED','CONTAINMENT FAILURE'],
  'frozen-signal':['ZERO RESPONSE','THERMAL LINK OFFLINE','SIGNAL FROZEN'],
  archive:['ACCESSING ARCHIVE...','ARCHIVE INDEXING','RECOVERED FRAGMENT FOUND'],
  'rogue-shadow':['PRESENCE DETECTED','SHADOW PROCESS ACTIVE','OBSERVER UNKNOWN']
};

const art:Record<string,string>={
  singularity:'/wallpapers/singularity.jpg','ghost-protocol':'/wallpapers/ghost-protocol.jpg','midnight-override':'/wallpapers/midnight-override.jpg',
  'core-breach':'/wallpapers/core-breach.jpg','lost-transmission':'/wallpapers/lost-transmission.jpg','terminal-world':'/wallpapers/terminal-world.jpg',
  'red-vector':'/wallpapers/red-vector.jpg','frozen-signal':'/wallpapers/frozen-signal.jpg',archive:'/wallpapers/archive.jpg','rogue-shadow':'/wallpapers/rogue-shadow.jpg'
};

function palette(scene:string){
  if(scene==='red-vector')return [255,35,45];
  if(scene==='terminal-world')return [40,255,125];
  if(scene==='frozen-signal')return [90,220,255];
  if(scene==='archive'||scene==='rogue-shadow')return [225,230,240];
  if(scene==='lost-transmission')return [115,90,255];
  return [175,70,255];
}

export default function LiveWallpaper({wallpaper,enabled,activeApp}:Props){
  const canvasRef=useRef<HTMLCanvasElement|null>(null);
  const [eventId,setEventId]=useState(0);
  const [message,setMessage]=useState('');
  const supported=sceneNames.has(wallpaper);
  const intensity=activeApp==='incident'||activeApp==='sandbox'?1.6:activeApp==='threatmap'?1.35:activeApp==='terminal'?1.25:1;
  const seeds=useMemo(()=>Array.from({length:70},()=>({x:Math.random(),y:Math.random(),vx:(Math.random()-.5)*.00018,vy:(Math.random()-.5)*.00018,r:.5+Math.random()*1.8,a:.15+Math.random()*.65})),[wallpaper]);

  useEffect(()=>{
    if(!enabled||!supported)return;
    let timer=0;
    const schedule=()=>{timer=window.setTimeout(()=>{const pool=labels[wallpaper]||['SIGNAL EVENT'];setMessage(pool[Math.floor(Math.random()*pool.length)]);setEventId(v=>v+1);schedule();},9000+Math.random()*16000)};
    schedule();return()=>window.clearTimeout(timer);
  },[enabled,wallpaper,supported]);

  useEffect(()=>{
    if(!enabled||!supported)return;
    const canvas=canvasRef.current;if(!canvas)return;
    const ctx=canvas.getContext('2d');if(!ctx)return;
    let raf=0,alive=true,last=performance.now(),pulse=0;
    const dots:Dot[]=seeds.map(s=>({...s}));
    const resize=()=>{const d=Math.min(devicePixelRatio||1,1.7);canvas.width=Math.floor(innerWidth*d);canvas.height=Math.floor(innerHeight*d);canvas.style.width=innerWidth+'px';canvas.style.height=innerHeight+'px';ctx.setTransform(d,0,0,d,0,0)};
    resize();window.addEventListener('resize',resize);
    const [r,g,b]=palette(wallpaper);
    const drawGrid=(w:number,h:number)=>{ctx.strokeStyle=`rgba(${r},${g},${b},.055)`;ctx.lineWidth=1;for(let x=0;x<w;x+=90){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke()}for(let y=0;y<h;y+=90){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke()}};
    const ring=(x:number,y:number,rad:number,a:number)=>{ctx.strokeStyle=`rgba(${r},${g},${b},${a})`;ctx.lineWidth=1;ctx.beginPath();ctx.arc(x,y,rad,0,Math.PI*2);ctx.stroke()};
    const frame=(now:number)=>{
      if(!alive)return;const dt=Math.min(40,now-last);last=now;pulse+=dt*.001*intensity;
      const w=innerWidth,h=innerHeight;ctx.clearRect(0,0,w,h);drawGrid(w,h);
      const mx=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--mouse-x'))||w*.5;
      const my=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--mouse-y'))||h*.5;
      const px=(mx-w*.5)*.012,py=(my-h*.5)*.012;
      ctx.save();ctx.translate(px,py);

      if(wallpaper==='terminal-world'){
        const cx=w*.57,cy=h*.48;for(let i=0;i<5;i++)ring(cx,cy,90+i*72,.08-i*.008);
        ctx.save();ctx.translate(cx,cy);ctx.rotate(pulse*.34);const grad=ctx.createConicGradient(0,0,0);grad.addColorStop(0,`rgba(${r},${g},${b},.24)`);grad.addColorStop(.11,'transparent');grad.addColorStop(1,'transparent');ctx.fillStyle=grad;ctx.beginPath();ctx.arc(0,0,380,0,Math.PI*2);ctx.fill();ctx.restore();
        const hubs=[[.30,.31],[.42,.39],[.51,.33],[.59,.42],[.66,.35],[.73,.57],[.37,.58],[.52,.58]];ctx.strokeStyle=`rgba(${r},${g},${b},.23)`;ctx.fillStyle=`rgb(${r},${g},${b})`;
        hubs.forEach((p,i)=>{const x=w*p[0],y=h*p[1];ctx.beginPath();ctx.arc(x,y,2.2+Math.sin(pulse*2+i)*1.2,0,6.28);ctx.fill();const q=hubs[(i+3)%hubs.length];ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(w*q[0],h*q[1]);ctx.stroke()});
      } else if(wallpaper==='singularity'){
        const cx=w*.68,cy=h*.46,base=115+Math.sin(pulse*1.4)*10;for(let i=0;i<7;i++)ring(cx,cy,base+i*25,.16-i*.017);
        ctx.save();ctx.translate(cx,cy);ctx.rotate(pulse*.25);for(let i=0;i<120;i++){const a=i*.37,rad=base+15+i*1.3;ctx.fillStyle=`rgba(${r},${g},${b},${.4-i/420})`;ctx.fillRect(Math.cos(a)*rad,Math.sin(a)*rad,2,2)}ctx.restore();
      } else if(wallpaper==='core-breach'){
        const cx=w*.64,cy=h*.43;for(let i=0;i<5;i++){ring(cx,cy,55+i*28,.22-i*.025)}ctx.fillStyle=`rgba(${r},${g},${b},${.14+.1*Math.sin(pulse*4)})`;ctx.fillRect(cx-62,cy-62,124,124);
        for(let i=0;i<18;i++){const a=i/18*Math.PI*2+pulse*.2;ctx.strokeStyle=`rgba(${r},${g},${b},.3)`;ctx.beginPath();ctx.moveTo(cx+Math.cos(a)*70,cy+Math.sin(a)*70);ctx.lineTo(cx+Math.cos(a)*310,cy+Math.sin(a)*310);ctx.stroke()}
      } else if(wallpaper==='lost-transmission'){
        const cx=w*.68,cy=h*.46;for(let i=0;i<4;i++)ring(cx,cy,110+i*62,.11);ctx.save();ctx.translate(cx,cy);ctx.rotate(pulse*.18);ctx.strokeStyle=`rgba(${r},${g},${b},.38)`;ctx.beginPath();ctx.arc(0,0,310,-.2,.2);ctx.stroke();ctx.fillStyle=`rgba(${r},${g},${b},.6)`;ctx.fillRect(300,-2,20,4);ctx.restore();
      } else if(wallpaper==='archive'){
        const x=w*.64;const glow=ctx.createLinearGradient(x-90,0,x+90,0);glow.addColorStop(0,'transparent');glow.addColorStop(.5,`rgba(${r},${g},${b},${.17+.08*Math.sin(pulse*2)})`);glow.addColorStop(1,'transparent');ctx.fillStyle=glow;ctx.fillRect(x-90,0,180,h);
      } else if(wallpaper==='ghost-protocol'){
        const a=.05+Math.max(0,Math.sin(pulse*.7))*0.08;ctx.fillStyle=`rgba(${r},${g},${b},${a})`;for(let y=0;y<h;y+=38){ctx.fillRect(w*.48+Math.sin(y*.03+pulse)*15,y,w*.35,1)}
      } else if(wallpaper==='red-vector'){
        const cx=w*.63,cy=h*.28;ctx.fillStyle=`rgba(255,25,35,${.05+.06*Math.sin(pulse*3)})`;ctx.beginPath();ctx.arc(cx,cy,180+Math.sin(pulse*2)*6,0,6.28);ctx.fill();for(let i=0;i<30;i++){ctx.fillStyle=`rgba(255,35,45,${.09+(i%5)*.02})`;ctx.fillRect((i*83+pulse*60)%w,0,1,h)}
      } else if(wallpaper==='frozen-signal'){
        for(let i=0;i<40;i++){ctx.strokeStyle=`rgba(${r},${g},${b},${.06+(i%6)*.018})`;const x=(i*61+pulse*18)%w;ctx.beginPath();ctx.moveTo(x,-40);ctx.lineTo(x-70,h+40);ctx.stroke()}
      } else if(wallpaper==='midnight-override'){
        for(let i=0;i<28;i++){const x=w*.36+i*36;const hh=80+(i*47)%260;ctx.fillStyle=`rgba(${r},${g},${b},${.035+(i%4)*.015})`;ctx.fillRect(x,h*.72-hh,28,hh)}
      } else if(wallpaper==='rogue-shadow'){
        const x=w*.70+Math.sin(pulse*.35)*24,y=h*.46;const grad=ctx.createRadialGradient(x,y,0,x,y,240);grad.addColorStop(0,`rgba(255,255,255,${.055+.025*Math.sin(pulse)})`);grad.addColorStop(1,'transparent');ctx.fillStyle=grad;ctx.fillRect(x-240,y-240,480,480);
      }

      dots.forEach((d,i)=>{d.x+=d.vx*dt*intensity;d.y+=d.vy*dt*intensity;if(d.x<0)d.x=1;if(d.x>1)d.x=0;if(d.y<0)d.y=1;if(d.y>1)d.y=0;ctx.fillStyle=`rgba(${r},${g},${b},${d.a})`;ctx.beginPath();ctx.arc(d.x*w,d.y*h,d.r,0,6.28);ctx.fill();if(i%9===0){ctx.strokeStyle=`rgba(${r},${g},${b},.045)`;ctx.beginPath();ctx.moveTo(d.x*w,d.y*h);ctx.lineTo((d.x*w)+28*Math.sin(pulse+i),(d.y*h)+28*Math.cos(pulse+i));ctx.stroke()}});
      ctx.restore();raf=requestAnimationFrame(frame)
    };
    raf=requestAnimationFrame(frame);return()=>{alive=false;cancelAnimationFrame(raf);window.removeEventListener('resize',resize)}
  },[enabled,supported,wallpaper,seeds,intensity]);

  if(!enabled||!supported)return null;
  return <div className={`live-wallpaper scene-engine scene-${wallpaper} reactive-${activeApp||'desktop'}`} aria-hidden="true">
    <div className="scene-art" style={{backgroundImage:`url(${art[wallpaper]})`}}/>
    <canvas ref={canvasRef}/>
    <div className="scene-depth scene-depth-back"/><div className="scene-depth scene-depth-front"/>
    <div className="scene-crt"/><div className="scene-vignette-v2"/>
    <div key={eventId} className="scene-event-v2"><b>{message}</b></div>
    <div className="scene-hud-v2"><span>BLACKTERM // SCENE ENGINE</span><b>{wallpaper.replaceAll('-',' ').toUpperCase()}</b><em>{activeApp?`REACTIVE LINK // ${activeApp.toUpperCase()}`:'ENVIRONMENT STABLE'}</em></div>
  </div>
}
