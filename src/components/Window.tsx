import React, { useEffect, useRef, useState } from 'react';

type Props = {
  title: string;
  icon: string;
  active: boolean;
  minimized: boolean;
  zIndex: number;
  startPosition?: { x: number; y: number };
  onFocus: () => void;
  onClose: () => void;
  onMinimize: () => void;
  children: React.ReactNode;
};

export default function Window({ title, icon, active, minimized, zIndex, startPosition, onFocus, onClose, onMinimize, children }: Props) {
  const [position, setPosition] = useState(startPosition || { x: 170, y: 80 });
  const [maximized, setMaximized] = useState(false);
  const dragRef = useRef({ dragging: false, offsetX: 0, offsetY: 0 });

  useEffect(() => {
    const move = (event: PointerEvent) => {
      if (!dragRef.current.dragging || maximized) return;
      setPosition({
        x: Math.max(0, Math.min(window.innerWidth - 350, event.clientX - dragRef.current.offsetX)),
        y: Math.max(0, Math.min(window.innerHeight - 110, event.clientY - dragRef.current.offsetY))
      });
    };
    const stop = () => { dragRef.current.dragging = false; };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', stop);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', stop);
    };
  }, [maximized]);

  if (minimized) return null;

  return (
    <section className={`os-window ${active ? 'active' : ''} ${maximized ? 'maximized' : ''}`} style={maximized ? { zIndex } : { left: position.x, top: position.y, zIndex }} onPointerDown={onFocus}>
      <header className="window-titlebar" onDoubleClick={() => setMaximized(v => !v)} onPointerDown={(event) => {
        if ((event.target as HTMLElement).closest('button')) return;
        dragRef.current = { dragging: true, offsetX: event.clientX - position.x, offsetY: event.clientY - position.y };
      }}>
        <div className="window-title"><span className="window-app-icon"><img src={icon} alt="" /></span><strong>{title}</strong><small>BLACKTERM://LOCAL</small></div>
        <div className="window-controls">
          <button onClick={onMinimize} aria-label="Minimize">—</button>
          <button onClick={() => setMaximized(v => !v)} aria-label="Maximize">□</button>
          <button className="close" onClick={onClose} aria-label="Close">×</button>
        </div>
      </header>
      <div className="window-content">{children}</div>
    </section>
  );
}
