'use client';
import { useRef } from 'react';
import { useUIStore } from '../lib/uiStore';

export default function MobileSkillDock({ onSkill }) {
  const editMode = useUIStore(s => s.editMode), position = useUIStore(s => s.uiPositions.skills), setPosition = useUIStore(s => s.setPosition);
  const drag = useRef(null);
  const onPointerDown = (e) => { if (!editMode) return; drag.current = { x:e.clientX, y:e.clientY, right:position.right, bottom:position.bottom }; e.currentTarget.setPointerCapture?.(e.pointerId); };
  const onPointerMove = (e) => { if (!drag.current || !editMode) return; setPosition('skills',{right:Math.max(0,Math.min(72,drag.current.right-(e.clientX-drag.current.x)/Math.max(1,window.innerWidth)*100)),bottom:Math.max(0,Math.min(55,drag.current.bottom-(e.clientY-drag.current.y)/Math.max(1,window.innerHeight)*100))}); };
  const button = {width:54,height:54,borderRadius:16,border:'1px solid #e8cb8170',background:'linear-gradient(145deg,#17223bde,#080c16ed)',color:'#f8e6b2',fontSize:20,boxShadow:'0 8px 24px #0007',touchAction:'manipulation'};
  return <div onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={()=>{drag.current=null;}} style={{position:'absolute',right:`${position.right}%`,bottom:`${position.bottom}%`,zIndex:9,display:'flex',gap:7,alignItems:'flex-end',padding:editMode?8:0,border:editMode?'1px dashed #f3d58b':'1px solid transparent',borderRadius:16,touchAction:'none'}}>{editMode&&<small style={{position:'absolute',top:-17,right:0,color:'#ffe2a0',fontSize:9}}>DRAG SKILLS</small>}<button style={button} title="Dash" onClick={()=>onSkill?.('dash')}>➤</button><button style={button} title="Interact" onClick={()=>onSkill?.('interact')}>✦</button><button style={{...button,width:62,height:62,borderRadius:20,background:'linear-gradient(145deg,#6b4e28,#171020)',fontSize:22}} title="Spirit Pulse" onClick={()=>onSkill?.('pulse')}>◉</button></div>;
}
