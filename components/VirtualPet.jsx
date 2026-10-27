'use client';
import { useMemo, useRef } from 'react';
import { Html, Float } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
export default function VirtualPet({ position = {x:0,z:0}, pet = null }) {
  const root = useRef();
  const color = useMemo(() => pet?.color || (pet?.species === 'Peri' ? '#bd9cff' : pet?.species === 'Naga Mini' ? '#f0b96b' : '#70e6ca'), [pet?.color, pet?.species]);
  useFrame((state, dt) => {
    if (!root.current || !pet || pet.active === false) return;
    const safe = Math.min(dt, .05), t = state.clock.elapsedTime;
    const targetX = Number(position.x || 0) - Math.sin(t * .55) * 1.2 - .9;
    const targetZ = Number(position.z || 0) + Math.cos(t * .55) * .8 + 1.25;
    root.current.position.x = THREE.MathUtils.damp(root.current.position.x, targetX, 3.6, safe);
    root.current.position.z = THREE.MathUtils.damp(root.current.position.z, targetZ, 3.6, safe);
    root.current.position.y = THREE.MathUtils.damp(root.current.position.y, .85 + Math.sin(t * 2.2) * .16, 4, safe);
    root.current.rotation.y = THREE.MathUtils.damp(root.current.rotation.y, Math.atan2(position.x-root.current.position.x, position.z-root.current.position.z), 2, safe);
  });
  if (!pet || pet.active === false) return null;
  return <group ref={root} position={[Number(position.x || 0)-1, .85, Number(position.z || 0)+1]}>
    {pet.species === 'Peri' ? <group><mesh position={[0,.08,0]}><sphereGeometry args={[.25,16,12]}/><meshToonMaterial color={color} emissive={color} emissiveIntensity={.25}/></mesh><mesh position={[-.31,.15,0]} rotation={[0,0,.24]}><icosahedronGeometry args={[.24,0]}/><meshStandardMaterial color="#f4e9ff" transparent opacity={.82}/></mesh><mesh position={[.31,.15,0]} rotation={[0,0,-.24]}><icosahedronGeometry args={[.24,0]}/><meshStandardMaterial color="#f4e9ff" transparent opacity={.82}/></mesh></group> : pet.species === 'Naga Mini' ? <group><mesh><capsuleGeometry args={[.25,.48,4,8]}/><meshToonMaterial color={color} emissive={color} emissiveIntensity={.15}/></mesh><mesh position={[0,.27,-.2]}><coneGeometry args={[.11,.3,5]}/><meshToonMaterial color={color}/></mesh><mesh position={[-.13,.21,.06]}><sphereGeometry args={[.035,8,8]}/><meshBasicMaterial color="#20304a"/></mesh><mesh position={[.13,.21,.06]}><sphereGeometry args={[.035,8,8]}/><meshBasicMaterial color="#20304a"/></mesh></group> : <group><mesh><sphereGeometry args={[.34,18,14]}/><meshToonMaterial color={color} emissive={color} emissiveIntensity={.16}/></mesh><mesh position={[-.13,.05,.28]}><sphereGeometry args={[.045,8,8]}/><meshBasicMaterial color="#183247"/></mesh><mesh position={[.13,.05,.28]}><sphereGeometry args={[.045,8,8]}/><meshBasicMaterial color="#183247"/></mesh><mesh position={[0,-.1,.3]}><torusGeometry args={[.08,.018,6,12,Math.PI]}/><meshBasicMaterial color="#183247"/></mesh></group>}
    <mesh position={[0,-.22,0]} rotation={[-Math.PI/2,0,0]}><ringGeometry args={[.36,.41,24]}/><meshBasicMaterial color={color} transparent opacity={.45}/></mesh>
    <pointLight color={color} intensity={.38} distance={3}/>
    <Html position={[0,.62,0]} center distanceFactor={13}><span style={{whiteSpace:'nowrap',padding:'3px 7px',borderRadius:8,background:'#06131ddd',border:`1px solid ${color}`,color:'#e8fbff',fontSize:10}}>{pet.name || pet.species} · {Math.round(Number(pet.hunger ?? 100))}%</span></Html>
  </group>;
}
