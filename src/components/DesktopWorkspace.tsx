import React, { useEffect, useMemo, useRef, useState } from 'react';

type AppLike = { id:string; title:string; icon:string; hint:string };
type Position = { x:number; y:number };
type LayoutState = { ids:string[]; positions:Record<string,Position> };

const STORAGE_KEY = 'blackterm-desktop-layout-v1';
const CHANGE_EVENT = 'blackterm:desktop-layout';
const ICON_WIDTH = 96;
const ICON_HEIGHT = 104;
const GRID_X = 108;
const GRID_Y = 116;
const PAD_X = 16;
const PAD_Y = 18;

function makeDefault(apps:AppLike[]):LayoutState {
  const ids=apps.slice(0,16).map(app=>app.id);
  const positions:Record<string,Position>={};
  ids.forEach((id,index)=>{
    const row=index%6;
    const col=Math.floor(index/6);
    positions[id]={x:PAD_X+col*GRID_X,y:PAD_Y+row*GRID_Y};
  });
  return {ids,positions};
}

function readLayout(apps:AppLike[]):LayoutState {
  const fallback=makeDefault(apps);
  try {
    const parsed=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null') as LayoutState|null;
    if(!parsed||!Array.isArray(parsed.ids)||typeof parsed.positions!=='object')return fallback;
    const validIds=parsed.ids.filter(id=>apps.some(app=>app.id===id));
    const positions={...fallback.positions,...parsed.positions};
    return {ids:validIds.length?validIds:fallback.ids,positions};
  } catch { return fallback; }
}

function saveLayout(layout:LayoutState) {
  localStorage.setItem(STORAGE_KEY,JSON.stringify(layout));
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT,{detail:layout}));
}

function clamp(value:number,min:number,max:number){return Math.max(min,Math.min(max,value))}
function snap(value:number,size:number){return Math.round(value/size)*size}

export function DesktopWorkspace({apps,openApp}:{apps:AppLike[];openApp:(id:any)=>void}) {
  const areaRef=useRef<HTMLDivElement>(null);
  const [layout,setLayout]=useState<LayoutState>(()=>readLayout(apps));
  const [selected,setSelected]=useState<string|null>(null);
  const [dragging,setDragging]=useState<string|null>(null);
  const dragOffset=useRef({x:0,y:0});
  const activePointer=useRef<number|null>(null);
  const layoutRef=useRef(layout);

  useEffect(()=>{ layoutRef.current=layout; },[layout]);

  useEffect(()=>{
    const sync=(event:Event)=>setLayout((event as CustomEvent<LayoutState>).detail||readLayout(apps));
    window.addEventListener(CHANGE_EVENT,sync);
    return()=>window.removeEventListener(CHANGE_EVENT,sync);
  },[apps]);

  const update=(next:LayoutState)=>{setLayout(next);saveLayout(next)};

  const addShortcut=(id:string,clientX?:number,clientY?:number)=>{
    const area=areaRef.current;
    if(!area)return;
    const rect=area.getBoundingClientRect();
    const exists=layout.ids.includes(id);
    const index=layout.ids.length;
    const rawX=clientX===undefined?PAD_X+Math.floor(index/6)*GRID_X:clientX-rect.left-ICON_WIDTH/2;
    const rawY=clientY===undefined?PAD_Y+(index%6)*GRID_Y:clientY-rect.top-ICON_HEIGHT/2;
    const x=clamp(snap(rawX,12),0,Math.max(0,rect.width-ICON_WIDTH));
    const y=clamp(snap(rawY,12),0,Math.max(0,rect.height-ICON_HEIGHT));
    update({
      ids:exists?layout.ids:[...layout.ids,id],
      positions:{...layout.positions,[id]:{x,y}}
    });
    setSelected(id);
  };

  const removeShortcut=(id:string)=>{
    update({...layout,ids:layout.ids.filter(item=>item!==id)});
    setSelected(null);
  };

  const autoArrange=()=>{
    const positions:Record<string,Position>={...layout.positions};
    layout.ids.forEach((id,index)=>{
      const row=index%6,col=Math.floor(index/6);
      positions[id]={x:PAD_X+col*GRID_X,y:PAD_Y+row*GRID_Y};
    });
    update({...layout,positions});
  };

  const reset=()=>update(makeDefault(apps));

  const onPointerDown=(event:React.PointerEvent,id:string)=>{
    if(event.button!==0)return;
    const area=areaRef.current;
    const pos=layoutRef.current.positions[id]||{x:0,y:0};
    if(!area)return;
    const rect=area.getBoundingClientRect();
    dragOffset.current={x:event.clientX-rect.left-pos.x,y:event.clientY-rect.top-pos.y};
    activePointer.current=event.pointerId;
    setSelected(id);
    setDragging(id);
    event.preventDefault();
  };

  useEffect(()=>{
    if(!dragging)return;

    const move=(event:PointerEvent)=>{
      if(activePointer.current!==null&&event.pointerId!==activePointer.current)return;
      const area=areaRef.current;
      if(!area)return;
      const rect=area.getBoundingClientRect();
      const maxX=Math.max(0,rect.width-ICON_WIDTH);
      const maxY=Math.max(0,rect.height-ICON_HEIGHT);
      const x=clamp(snap(event.clientX-rect.left-dragOffset.current.x,6),0,maxX);
      const y=clamp(snap(event.clientY-rect.top-dragOffset.current.y,6),0,maxY);
      setLayout(current=>{
        const next={...current,positions:{...current.positions,[dragging]:{x,y}}};
        layoutRef.current=next;
        return next;
      });
      event.preventDefault();
    };

    const finish=(event:PointerEvent)=>{
      if(activePointer.current!==null&&event.pointerId!==activePointer.current)return;
      activePointer.current=null;
      setDragging(null);
      saveLayout(layoutRef.current);
    };

    window.addEventListener('pointermove',move,{passive:false});
    window.addEventListener('pointerup',finish);
    window.addEventListener('pointercancel',finish);
    return()=>{
      window.removeEventListener('pointermove',move);
      window.removeEventListener('pointerup',finish);
      window.removeEventListener('pointercancel',finish);
    };
  },[dragging]);

  return <div
    ref={areaRef}
    className={`desktop-workspace ${dragging?'is-dragging':''}`}
    onClick={event=>{if(event.target===event.currentTarget)setSelected(null)}}
    onDragOver={event=>{event.preventDefault();event.dataTransfer.dropEffect='copy'}}
    onDrop={event=>{
      event.preventDefault();
      const id=event.dataTransfer.getData('application/x-blackterm-app')||event.dataTransfer.getData('text/plain');
      if(apps.some(app=>app.id===id))addShortcut(id,event.clientX,event.clientY);
    }}
  >
    <div className="desktop-layout-tools">
      <button onClick={autoArrange} title="Align desktop icons">ALIGN</button>
      <button onClick={reset} title="Restore the default desktop">RESET</button>
    </div>

    {layout.ids.map(id=>{
      const app=apps.find(item=>item.id===id);
      if(!app)return null;
      const position=layout.positions[id]||{x:PAD_X,y:PAD_Y};
      return <button
        key={id}
        className={`movable-desktop-icon ${selected===id?'selected':''} ${dragging===id?'dragging':''}`}
        style={{left:position.x,top:position.y}}
        onPointerDown={event=>onPointerDown(event,id)}
        onDoubleClick={()=>openApp(id)}
        onContextMenu={event=>{event.preventDefault();removeShortcut(id)}}
        title={`${app.title} — double-click to open, right-click to remove`}
      >
        <span className="desktop-app-icon"><img src={app.icon} alt="" draggable={false}/></span>
        <b>{app.title}</b>
      </button>
    })}

    {!layout.ids.length&&<div className="desktop-empty-state">
      <strong>DESKTOP EMPTY</strong>
      <span>Drag applications here from the Start menu.</span>
    </div>}
  </div>;
}

export function StartAppGrid({apps,openApp}:{apps:AppLike[];openApp:(id:any)=>void}) {
  const [desktopIds,setDesktopIds]=useState<string[]>(()=>readLayout(apps).ids);

  useEffect(()=>{
    const sync=(event:Event)=>setDesktopIds(((event as CustomEvent<LayoutState>).detail||readLayout(apps)).ids);
    window.addEventListener(CHANGE_EVENT,sync);
    return()=>window.removeEventListener(CHANGE_EVENT,sync);
  },[apps]);

  const add=(id:string)=>{
    const layout=readLayout(apps);
    if(layout.ids.includes(id))return;
    const index=layout.ids.length;
    const next={
      ids:[...layout.ids,id],
      positions:{...layout.positions,[id]:{x:PAD_X+Math.floor(index/6)*GRID_X,y:PAD_Y+(index%6)*GRID_Y}}
    };
    saveLayout(next);
  };

  return <div className="start-apps enhanced-start-apps">
    {apps.map(app=>{
      const pinned=desktopIds.includes(app.id);
      return <div
        key={app.id}
        className="start-app-row"
        draggable
        onDragStart={event=>{
          event.dataTransfer.setData('application/x-blackterm-app',app.id);
          event.dataTransfer.setData('text/plain',app.id);
          event.dataTransfer.effectAllowed='copy';
        }}
      >
        <button className="start-app-open" onClick={()=>openApp(app.id)}>
          <span className="menu-app-icon"><img src={app.icon} alt=""/></span>
          <div><strong>{app.title}</strong><small>{app.hint}</small></div>
        </button>
        <button
          className={`desktop-pin-button ${pinned?'pinned':''}`}
          onClick={()=>add(app.id)}
          disabled={pinned}
          title={pinned?'Already on desktop':'Add to desktop'}
        >{pinned?'✓':'＋'}</button>
      </div>
    })}
    <div className="start-drag-hint">Drag any application onto the desktop, or press ＋ to add a shortcut.</div>
  </div>;
}
