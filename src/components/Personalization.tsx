import React from 'react';

export type ThemeName = 'blue'|'cyan'|'violet'|'green'|'red'|'amber'|'ghost';
export type WallpaperName = 'grid'|'void'|'circuit'|'nebula'|'minimal'|'singularity'|'ghost-protocol'|'midnight-override'|'core-breach'|'lost-transmission'|'terminal-world'|'red-vector'|'frozen-signal'|'archive'|'rogue-shadow';
export type VisualEffects = {
  particles:boolean;
  glass:boolean;
  sound:boolean;
  scanlines:boolean;
  flicker:boolean;
  cursorTrail:boolean;
  radar:boolean;
  noise:boolean;
  glow:number;
  transparency:number;
  scanlineStrength:number;
  iconScale:number;
  wallpaper:WallpaperName;
  randomColors:boolean;
  randomSpeed:number;
  liveWallpaper:boolean;
  timeCycle:boolean;
};

type Props={
  theme:string;
  setTheme:(theme:string)=>void;
  matrix:boolean;
  setMatrix:(enabled:boolean)=>void;
  effects:VisualEffects;
  setEffects:React.Dispatch<React.SetStateAction<VisualEffects>>;
};

const themes:[ThemeName,string,string][]=[
  ['violet','Purple Void','#a880ff'],
  ['green','Cyber Green','#43ef9e'],
  ['red','Red Alert','#ff596f'],
  ['blue','Midnight Blue','#4da3ff'],
  ['amber','Amber Terminal','#f3b84b'],
  ['cyan','Arctic Signal','#46e5ef'],
  ['ghost','Ghost White','#d8efff']
];
const wallpapers:[WallpaperName,string][]=[
  ['grid','Tactical Grid'],
  ['void','Deep Void'],
  ['circuit','Circuit Mesh'],
  ['nebula','Signal Nebula'],
  ['minimal','Blackout'],
  ['singularity','Void Singularity'],
  ['ghost-protocol','Ghost Protocol'],
  ['midnight-override','Midnight Override'],
  ['core-breach','Core Breach'],
  ['lost-transmission','Lost Transmission'],
  ['terminal-world','Terminal World'],
  ['red-vector','Red Vector'],
  ['frozen-signal','Frozen Signal'],
  ['archive','The Archive'],
  ['rogue-shadow','Rogue Shadow']
];

export default function Personalization({theme,setTheme,matrix,setMatrix,effects,setEffects}:Props){
  const patch=(change:Partial<VisualEffects>)=>setEffects(current=>({...current,...change}));
  const reset=()=>{
    setTheme('violet');
    setMatrix(false);
    setEffects({particles:true,glass:true,sound:false,scanlines:true,flicker:false,cursorTrail:true,radar:true,noise:true,glow:70,transparency:94,scanlineStrength:35,iconScale:100,wallpaper:'grid',randomColors:false,randomSpeed:2500,liveWallpaper:true,timeCycle:true});
  };
  return <div className="personalization-app">
    <div className="section-title"><div><small>BLACKTERM PERSONALIZATION</small><h2>Customization Center</h2></div><span>LIVE PREVIEW • AUTO SAVED</span></div>
    <div className="personalization-layout">
      <section className="personalization-controls">
        <div className="custom-section"><header><div><small>01 / COLOR SYSTEM</small><h3>Accent themes</h3></div></header><div className="preset-grid">{themes.map(([id,label,color])=><button key={id} className={theme===id&&!effects.randomColors?'active':''} onClick={()=>{patch({randomColors:false});setTheme(id)}} style={{'--swatch':color} as React.CSSProperties}><i/><span>{label}</span><b>{theme===id&&!effects.randomColors?'ACTIVE':'APPLY'}</b></button>)}<button className={`random-spectrum ${effects.randomColors?'active':''}`} onClick={()=>patch({randomColors:!effects.randomColors})} style={{'--swatch':'linear-gradient(90deg,#ff596f,#f3b84b,#43ef9e,#46e5ef,#4da3ff,#a880ff)'} as React.CSSProperties}><i/><span>Random Spectrum</span><b>{effects.randomColors?'CYCLING':'ENABLE'}</b></button></div>{effects.randomColors&&<div className="random-speed"><label><span>Color cycle speed <b>{(effects.randomSpeed/1000).toFixed(1)}s</b></span><input type="range" min="800" max="6000" step="100" value={effects.randomSpeed} onChange={e=>patch({randomSpeed:Number(e.target.value)})}/></label><p>BLACKTERM OS will continuously rotate through every accent theme.</p></div>}</div>
        <div className="custom-section"><header><div><small>02 / DESKTOP ENVIRONMENT</small><h3>Wallpaper</h3></div></header><div className="wallpaper-options">{wallpapers.map(([id,label])=><button key={id} className={`${id} ${effects.wallpaper===id?'active':''}`} onClick={()=>patch({wallpaper:id})}><i/><span>{label}</span></button>)}</div></div>
        <div className="custom-section"><header><div><small>03 / VISUAL ENGINE</small><h3>Effects</h3></div></header><div className="toggle-grid">
          {([
            ['particles','Ambient particles'],['liveWallpaper','Live wallpaper'],['timeCycle','Dynamic day / night'],['glass','Glass blur'],['scanlines','CRT scanlines'],['flicker','Screen flicker'],['cursorTrail','Cursor aura'],['radar','Radar sweep'],['noise','Signal noise']
          ] as const).map(([key,label])=><button key={key} className={effects[key]?'on':''} onClick={()=>patch({[key]:!effects[key]})}><span>{label}</span><b>{effects[key]?'ON':'OFF'}</b></button>)}
          <button className={matrix?'on':''} onClick={()=>setMatrix(!matrix)}><span>Matrix rain</span><b>{matrix?'ON':'OFF'}</b></button>
        </div></div>
        <div className="custom-section"><header><div><small>04 / FINE TUNING</small><h3>Intensity controls</h3></div></header><div className="slider-stack">
          <label><span>Glow intensity <b>{effects.glow}%</b></span><input type="range" min="0" max="100" value={effects.glow} onChange={e=>patch({glow:Number(e.target.value)})}/></label>
          <label><span>Window opacity <b>{effects.transparency}%</b></span><input type="range" min="70" max="100" value={effects.transparency} onChange={e=>patch({transparency:Number(e.target.value)})}/></label>
          <label><span>Scanline strength <b>{effects.scanlineStrength}%</b></span><input type="range" min="0" max="100" value={effects.scanlineStrength} onChange={e=>patch({scanlineStrength:Number(e.target.value)})}/></label>
          <label><span>Desktop icon size <b>{effects.iconScale}%</b></span><input type="range" min="80" max="130" value={effects.iconScale} onChange={e=>patch({iconScale:Number(e.target.value)})}/></label>
        </div></div>
        <div className="custom-actions"><button onClick={()=>patch({sound:!effects.sound})}>{effects.sound?'MUTE AMBIENCE':'ENABLE AMBIENCE'}</button><button className="danger" onClick={reset}>RESTORE DEFAULTS</button></div>
      </section>
      <aside className="personalization-preview">
        <div className={`preview-monitor wallpaper-${effects.wallpaper} theme-${theme}`}><div className="preview-grid"/><div className="preview-window"><header><span>◈</span>BLACKTERM PREVIEW <b>— □ ×</b></header><section><small>THEME ONLINE</small><h3>{themes.find(item=>item[0]===theme)?.[1]||theme}</h3><p>Windows, controls, telemetry, icons, and system highlights update instantly.</p><button>ACTIVE SIGNAL</button></section></div><div className="preview-taskbar"><b>BT</b><i/><i/><i/><span>17:26</span></div></div>
        <div className="preview-stats"><div><span>ACCENT</span><b>{effects.randomColors?'RANDOM':String(theme).toUpperCase()}</b></div><div><span>WALLPAPER</span><b>{effects.wallpaper.toUpperCase()}</b></div><div><span>EFFECTS</span><b>{Object.entries(effects).filter(([,v])=>v===true).length + (matrix?1:0)} ACTIVE</b></div></div>
        <p className="custom-note">Your configuration is stored locally in this browser and restored the next time BLACKTERM OS starts.</p>
      </aside>
    </div>
  </div>;
}
