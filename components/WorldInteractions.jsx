'use client';
import { useRef } from 'react';
import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
function FishingSpot({ position = [0, 0, -7] }) {
  const bobber = useRef();
  useFrame(({ clock }) => { if (bobber.current) bobber.current.position.y = 0.46 + Math.sin(clock.elapsedTime * 2.3) * 0.055; });
  return <group position={position}>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, .03, 0]}><circleGeometry args={[1.45, 24]}/><meshStandardMaterial color="#2b7f9b" transparent opacity={.55} roughness={.25}/></mesh>
    <mesh position={[.72,.22,.3]} rotation={[0,0,-.25]}><cylinderGeometry args={[.025,.035,1.15,5]}/><meshStandardMaterial color="#d9b783"/></mesh>
    <mesh ref={bobber} position={[.35,.46,-.2]}><sphereGeometry args={[.09,8,6]}/><meshStandardMaterial color="#ff647a" emissive="#b42043" emissiveIntensity={.3}/></mesh>
    <Html position={[0,.75,0]} center distanceFactor={11}><button onClick={()=>window.dispatchEvent(new CustomEvent('whiskay:fishing-start'))} style={{whiteSpace:'nowrap',background:'#071622e8',border:'1px solid #7de4f0',borderRadius:8,padding:'6px 9px',color:'#e7fcff',fontSize:10,fontWeight:800,cursor:'pointer'}}>🎣 FISH</button></Html>
  </group>;
}
function StormWraith({ position }) {
  const root = useRef();
  useFrame(({ clock }, dt) => { if (root.current) { root.current.position.y = .85 + Math.sin(clock.elapsedTime * 2.4) * .12; root.current.rotation.y += Math.min(dt,.05) * .35; } });
  return <group position={position}><group ref={root}>
    <mesh position={[0,.65,0]}><octahedronGeometry args={[.72,1]}/><meshStandardMaterial color="#6d5dd3" emissive="#6237ce" emissiveIntensity={.65} transparent opacity={.88}/></mesh>
    <mesh position={[0,1.42,0]}><torusGeometry args={[.7,.035,6,20]}/><meshBasicMaterial color="#9eecff" transparent opacity={.7}/></mesh>
    {[-.18,.18].map(x=><mesh key={x} position={[x,.72,.56]}><sphereGeometry args={[.07,8,6]}/><meshBasicMaterial color="#ff5e8b"/></mesh>)}
    <pointLight position={[0,1,0]} color="#7e68ff" intensity={.65} distance={4}/></group>
    <Html position={[0,2.2,0]} center distanceFactor={12}><div style={{whiteSpace:'nowrap',fontSize:10,fontWeight:900,color:'#f4eaff',background:'#281447e8',border:'1px solid #bb8cff',padding:'4px 7px',borderRadius:7}}>⚡ STORM WRAITH · RARE</div></Html>
  </group>;
}
export default function WorldInteractions({ position = { x: 0, z: 0 }, weather = 'Clear', worldHour = 9 }) {
  const storm = weather === 'Rain' && (worldHour < 6 || worldHour >= 19);
  return <group><FishingSpot/><>{storm && <StormWraith position={[Number(position.x || 0) + 6, 0, Number(position.z || 0) + 4]}/>}</></group>;
}
