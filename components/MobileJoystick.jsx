'use client';
import { useEffect, useRef } from 'react';
import nipplejs from 'nipplejs';
import { useUIStore } from '../lib/uiStore';

export default function MobileJoystick({ onVector }) {
  const zoneRef = useRef(null);
  const vectorRef = useRef({ x: 0, y: 0 });
  const editMode = useUIStore(s => s.editMode);
  const position = useUIStore(s => s.uiPositions.joystick);
  const setPosition = useUIStore(s => s.setPosition);
  useEffect(() => {
    if (!zoneRef.current || editMode) return;
    const manager = nipplejs.create({ zone: zoneRef.current, mode: 'static', position: { left: '50%', top: '50%' }, color: '#a8f5ff', size: 104, threshold: 0.3, fadeTime: 100, multitouch: false });
    manager.on('move', (_evt, data) => {
      const force = Number(data?.force || 0);
      if (force < 0.3) { vectorRef.current = { x: 0, y: 0 }; return; }
      const rad = Number(data?.angle?.radian || 0);
      vectorRef.current = { x: Math.cos(rad) * Math.min(force, 1), y: -Math.sin(rad) * Math.min(force, 1) };
    });
    const reset = () => { vectorRef.current = { x: 0, y: 0 }; onVector?.(0, 0); };
    manager.on('end', reset);
    const timer = window.setInterval(() => onVector?.(vectorRef.current.x, vectorRef.current.y), 45);
    return () => { window.clearInterval(timer); manager.destroy(); reset(); };
  }, [editMode, onVector]);
  const drag = useRef(null);
  const onPointerDown = (e) => { if (!editMode) return; drag.current = { x: e.clientX, y: e.clientY, left: position.left, bottom: position.bottom }; e.currentTarget.setPointerCapture?.(e.pointerId); };
  const onPointerMove = (e) => { if (!drag.current || !editMode) return; setPosition('joystick', { left: Math.max(0, Math.min(72, drag.current.left + (e.clientX - drag.current.x) / Math.max(1, window.innerWidth) * 100)), bottom: Math.max(0, Math.min(55, drag.current.bottom - (e.clientY - drag.current.y) / Math.max(1, window.innerHeight) * 100)) }); };
  return <div ref={zoneRef} aria-label="Analog movement control" onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={() => {drag.current = null;}} style={{position:'absolute',left:`${position.left}%`,bottom:`${position.bottom}%`,width:116,height:116,borderRadius:'50%',border:editMode?'1px dashed #ffd77d':'1px solid #8aefff50',background:editMode?'#9d7b2933':'#10233c35',touchAction:'none',zIndex:8,display:'grid',placeItems:'center',cursor:editMode?'move':'crosshair',userSelect:'none'}}>{editMode && <span style={{fontSize:9,color:'#ffe4a2',pointerEvents:'none'}}>DRAG</span>}</div>;
}
