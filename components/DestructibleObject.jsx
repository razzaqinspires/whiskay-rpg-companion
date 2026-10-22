'use client';
import { useEffect, useRef, useState } from 'react';
import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';

/** Local-prototype resource node. Loot is emitted as a browser event for the Adventure inventory HUD. */
export default function DestructibleObject({ id, position, kind = 'tree', material = 'Wood', hitToken = 0, targeted = false, hitsRequired = 3 }) {
  const [hits, setHits] = useState(0);
  const [destroyed, setDestroyed] = useState(false);
  const [burst, setBurst] = useState(false);
  const root = useRef();
  const lastToken = useRef(0);
  useEffect(() => {
    if (!hitToken || hitToken === lastToken.current) return;
    if (!targeted || destroyed) return;
    lastToken.current = hitToken;
    if (hits + 1 >= hitsRequired) {
      setHits(hitsRequired);
      setDestroyed(true);
      setBurst(true);
      if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('whiskay:resource-gathered', { detail: { id, material, amount: kind === 'ore' ? 2 : 3, kind } }));
    } else setHits(current => current + 1);
  }, [hitToken, targeted, destroyed, hits, hitsRequired, id, material, kind]);
  useFrame((_, dt) => {
    if (root.current && destroyed) {
      root.current.scale.multiplyScalar(Math.max(0, 1 - Math.min(dt, .05) * 7));
      root.current.rotation.z += dt * 1.5;
    }
  });
  if (destroyed && !burst) return null;
  return <group ref={root} position={position}>
    {!destroyed && (kind === 'ore' ? <>
      <mesh castShadow position={[0,.42,0]}><dodecahedronGeometry args={[.48,0]}/><meshStandardMaterial color={hits ? '#7ed4ef' : '#536c80'} metalness={.45} roughness={.48}/></mesh>
      <mesh position={[.18,.64,.05]}><octahedronGeometry args={[.16,0]}/><meshStandardMaterial color="#79e9ff" emissive="#23758c" emissiveIntensity={.6}/></mesh>
    </> : <>
      <mesh castShadow position={[0,.42,0]}><cylinderGeometry args={[.23,.32,.9,7]}/><meshStandardMaterial color="#77502f"/></mesh>
      <mesh castShadow position={[0,1.05,0]}><coneGeometry args={[.72,1.15,7]}/><meshStandardMaterial color={hits ? '#9b7846' : '#31734b'} roughness={1}/></mesh>
    </>)}
    {destroyed && <group>{Array.from({length:7},(_,i)=><mesh key={i} position={[Math.cos(i*2.4)*.32,.35+(i%3)*.12,Math.sin(i*2.4)*.32]}><icosahedronGeometry args={[.075,0]}/><meshBasicMaterial color={kind==='ore'?'#8cecff':'#e8c17a'}/></mesh>)}</group>}
    {!destroyed && <Html position={[0,kind==='ore'?1.15:2.05,0]} center distanceFactor={13}><div style={{fontSize:9,color:'#e9fbff',whiteSpace:'nowrap',padding:'3px 5px',borderRadius:5,background:'#07131ddd',border:`1px solid ${targeted?'#f4d16d':'#4b7880'}`}}>{targeted?'⛏ TARGET ':''}{kind==='ore'?'Mineral':'Tree'} · {hits}/{hitsRequired}</div></Html>}
  </group>;
}
