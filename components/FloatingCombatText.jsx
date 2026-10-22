'use client';
import { useEffect, useRef, useState } from 'react';
import { Html, Billboard } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';

function DamageLabel({ event, onDone }) {
  const root = useRef(); const born = useRef(performance.now());
  useFrame(() => { const t=Math.min(1,(performance.now()-born.current)/1000); if(root.current){root.current.position.y=event.position[1]+t*1.15;root.current.scale.setScalar(.85+t*.25);} if(t>=1)onDone(event.id); });
  const color=event.kind==='player-damage'?'#ff4d5f':event.critical?'#ffd66b':'#f6fbff';
  return <group ref={root} position={event.position}><Billboard><Html center distanceFactor={10} style={{pointerEvents:'none'}}><div style={{fontWeight:1000,fontSize:event.critical?17:14,color,textShadow:'0 2px 4px #000,0 0 9px #000',whiteSpace:'nowrap',opacity:1}}>{event.critical?'✦ ':''}{event.damage}</div></Html></Billboard></group>;
}
export default function FloatingCombatText(){
 const [items,setItems]=useState([]); const seq=useRef(0);
 useEffect(()=>{const handler=e=>{const d=e.detail||{};const x=Number(d.x)||0,z=Number(d.z)||0;const damage=Math.max(1,Math.min(99999,Math.round(Number(d.damage)||1)));setItems(old=>[...old.slice(-7),{id:++seq.current,position:[x,Number(d.y)||1.3,z],damage,critical:Boolean(d.critical),kind:d.kind||'hit'}]);};window.addEventListener('whiskay:combat-hit',handler);return()=>window.removeEventListener('whiskay:combat-hit',handler);},[]);
 return <>{items.map(item=><DamageLabel key={item.id} event={item} onDone={id=>setItems(old=>old.filter(x=>x.id!==id))}/>)}</>;
}
