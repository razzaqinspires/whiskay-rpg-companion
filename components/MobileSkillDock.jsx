'use client';
import { useEffect, useRef, useState } from 'react';
import { useUIStore } from '../lib/uiStore';

export default function MobileSkillDock({ onSkill }) {
  const editMode = useUIStore(s => s.editMode), position = useUIStore(s => s.uiPositions.skills), setPosition = useUIStore(s => s.setPosition);
  const drag = useRef(null);
  const [charge, setCharge] = useState({ active:false, volts:5, label:'Standard 5V' });
  useEffect(() => { const update = (event) => { const p=event?.detail?.player||{}; const volts=Number(p.current_volt_speed??p.currentVoltSpeed??5); setCharge({active:volts>5,volts,label:volts>5?`⚡ Fast Charge ${volts}V`:'Standard 5V'}); }; window.addEventListener('whiskay:player-update',update); return () => window.removeEventListener('whiskay:player-update',update); }, []);
  const onPointerDown = (e) => { if (!editMode) return; drag.current = { x:e.clientX, y:e.clientY, right:position.right, bottom:position.bottom }; e.currentTarget.setPointerCapture?.(e.pointerId); };
  const onPointerMove = (e) => { if (!drag.current || !editMode) return; setPosition('skills',{right:Math.max(0,Math.min(72,drag.current.right-(e.clientX-drag.current.x)/Math.max(1,window.innerWidth)*100)),bottom:Math.max(0,Math.min(55,drag.current.bottom-(e.clientY-drag.current.y)/Math.max(1,window.innerHeight)*100))}); };
  const button = {width:54,height:54,borderRadius:16,border:'1px solid #e8cb8170',background:'linear-gradient(145deg,#17223bde,#080c16ed)',color:'#f8e6b2',fontSize:20,boxShadow:'0 8px 24px #0007',touchAction:'manipulation'};
  return <div onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={()=>{drag.current=null;}} style={{position:'absolute',right:`max(env(safe-area-inset-right), ${position.right}%)`,bottom:`max(env(safe-area-inset-bottom), ${position.bottom}%)`,zIndex:91,display:'flex',gap:7,alignItems:'flex-end',padding:editMode?8:0,border:editMode?'1px dashed #f3d58b':'1px solid transparent',borderRadius:16,touchAction:'none'}}>{charge.active&&<small style={{position:'absolute',top:-31,right:0,color:'#8ef7ff',fontSize:10,whiteSpace:'nowrap',textShadow:'0 0 8px #00d9ff'}}>⚡ {charge.volts}V FAST</small>}{editMode&&<small style={{position:'absolute',top:-17,right:0,color:'#ffe2a0',fontSize:9}}>DRAG SKILLS</small>}<button style={button} title="Dash" onClick={()=>onSkill?.('dash')}>➤</button><button style={button} title="Interact" onClick={()=>onSkill?.('interact')}>✦</button><button style={{...button,width:62,height:62,borderRadius:20,background:'linear-gradient(145deg,#6b4e28,#171020)',fontSize:22}} title="Spirit Pulse" onClick={()=>onSkill?.('pulse')}>◉</button></div>;
}


export function getFastChargeIndicator(player = {}) {
  const volts = Number(player.current_volt_speed ?? player.currentVoltSpeed ?? 5);
  return { active: volts > 5, volts, label: volts > 5 ? `⚡ Fast Charge ${volts}V` : 'Standard 5V' };
}
