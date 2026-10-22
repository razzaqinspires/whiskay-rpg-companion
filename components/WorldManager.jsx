'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Detailed } from '@react-three/drei';
import * as THREE from 'three';
import DestructibleObject from './DestructibleObject';

const CHUNK_SIZE = 20, RADIUS = 1;
function hash(n) { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
export function resourceSpecs(cx, cz) {
  return [
    { id: `tree:${cx}:${cz}`, x: cx * CHUNK_SIZE + 5 + hash(cx * 37 + cz * 17) * 8, z: cz * CHUNK_SIZE + 5 + hash(cx * 19 + cz * 43) * 8, kind: 'tree', material: 'Wood' },
    { id: `ore:${cx}:${cz}`, x: cx * CHUNK_SIZE + 11 + hash(cx * 13 + cz * 29) * 6, z: cz * CHUNK_SIZE + 11 + hash(cx * 31 + cz * 11) * 6, kind: 'ore', material: 'Iron Ore' }
  ];
}
function ChunkTree({ x, z, scale, season }) {
  const leaf = season === 'Winter' ? '#d9e8ed' : season === 'Autumn' ? '#b47b3d' : season === 'Spring' ? '#54a66c' : '#28734b';
  return <Detailed distances={[0,14,25]} position={[x,0,z]} scale={scale}><group><mesh position={[0,.65,0]}><cylinderGeometry args={[.12,.2,1.3,6]}/><meshStandardMaterial color="#68452d"/></mesh><mesh position={[0,1.55,0]}><coneGeometry args={[.8,1.6,6]}/><meshStandardMaterial color={leaf} roughness={1}/></mesh><mesh position={[0,2.1,0]}><coneGeometry args={[.55,1.2,5]}/><meshStandardMaterial color={leaf} roughness={1}/></mesh></group></Detailed>;
}
function WorldChunk({ cx, cz, season }) {
  const trees = useMemo(() => Array.from({length:8},(_,i)=>{const seed=(cx+101)*991+(cz+101)*313+i*17;return {key:`${cx}:${cz}:${i}`,x:cx*CHUNK_SIZE+2+hash(seed)*16,z:cz*CHUNK_SIZE+2+hash(seed+8)*16,scale:.7+hash(seed+19)*.55};}).filter(t=>Math.hypot(t.x,t.z)>5),[cx,cz]);
  return <group>{trees.map(t=><ChunkTree key={t.key} {...t} season={season}/>)}</group>;
}
function DayNightLighting({ worldHour = 9, weather = 'Clear' }) {
  const ambient=useRef(),sun=useRef(),fill=useRef(); const targetColor=useRef(new THREE.Color('#fff0cc'));
  useFrame((_,dt)=>{const hour=((Number(worldHour)||0)%24+24)%24;const daylight=THREE.MathUtils.clamp(Math.sin(((hour-6)/12)*Math.PI),0,1),night=1-daylight;const factor=weather==='Rain'?.62:weather==='Cloudy'?.78:1;const a=.16+daylight*.82*factor+night*.12,s=(.08+daylight*1.55)*factor;if(ambient.current)ambient.current.intensity=THREE.MathUtils.damp(ambient.current.intensity,a,1.8,Math.min(dt,.05));if(sun.current){sun.current.intensity=THREE.MathUtils.damp(sun.current.intensity,s,1.4,Math.min(dt,.05));const angle=((hour-6)/24)*Math.PI*2;sun.current.position.set(Math.cos(angle)*14,Math.max(1.2,Math.sin(angle)*18),4);targetColor.current.set(weather==='Rain'?'#9fb8d0':daylight>.35?'#fff0cc':'#91a9e8');sun.current.color.lerp(targetColor.current,1-Math.exp(-Math.min(dt,.05)*1.2));}if(fill.current)fill.current.intensity=THREE.MathUtils.damp(fill.current.intensity,.12+night*.24,1.5,Math.min(dt,.05));});
  return <><ambientLight ref={ambient} intensity={.65}/><directionalLight ref={sun} position={[8,14,4]} intensity={1.2} color="#fff0cc"/><hemisphereLight ref={fill} args={['#a8c9ff','#24354a',.2]}/></>;
}
function RainParticles({ position }) {
  const points=useRef();const particles=useMemo(()=>{const a=new Float32Array(180*3);for(let i=0;i<180;i++){a[i*3]=(Math.random()-.5)*24;a[i*3+1]=Math.random()*13+1;a[i*3+2]=(Math.random()-.5)*24;}return a;},[]);
  useFrame((_,dt)=>{const safe=Math.min(dt,.05);if(!points.current)return;const attr=points.current.geometry.attributes.position;for(let i=0;i<attr.count;i++){let y=attr.array[i*3+1]-safe*13;if(y<0)y=12+Math.random()*2;attr.array[i*3+1]=y;attr.array[i*3]+=(safe*.45);}attr.needsUpdate=true;});
  return <points ref={points} position={[Number(position?.x)||0,0,Number(position?.z)||0]} frustumCulled><bufferGeometry><bufferAttribute attach="attributes-position" count={180} array={particles} itemSize={3}/></bufferGeometry><pointsMaterial color="#b9dcff" size={.045} transparent opacity={.62} depthWrite={false} sizeAttenuation/></points>;
}
export default function WorldManager({ position={x:0,z:0}, season='Summer', worldHour=9, weather='Clear', attackToken=0 }) {
  const cx=Math.floor((Number(position.x)||0)/CHUNK_SIZE),cz=Math.floor((Number(position.z)||0)/CHUNK_SIZE);
  const chunks=useMemo(()=>{const out=[];for(let x=cx-RADIUS;x<=cx+RADIUS;x++)for(let z=cz-RADIUS;z<=cz+RADIUS;z++)out.push([x,z]);return out;},[cx,cz]);
  const resources=useMemo(()=>chunks.flatMap(([x,z])=>resourceSpecs(x,z)),[chunks]);
  const [target,setTarget]=useState({id:'',token:0});
  useEffect(()=>{if(!attackToken)return;let nearest=null,dist=3.4;for(const r of resources){const d=Math.hypot(position.x-r.x,position.z-r.z);if(d<dist){nearest=r;dist=d;}}setTarget({id:nearest?.id||'',token:attackToken});if(!nearest&&typeof window!=='undefined')window.dispatchEvent(new CustomEvent('whiskay:resource-message',{detail:{message:'Dekati pohon atau mineral (maks. 3.4 unit) lalu tekan ATK untuk menambang.'}}));},[attackToken,position.x,position.z,resources]);
  return <group><DayNightLighting worldHour={worldHour} weather={weather}/>{chunks.map(([x,z])=><WorldChunk key={`${x}:${z}`} cx={x} cz={z} season={season}/>)}{resources.map(r=><DestructibleObject key={r.id} {...r} position={[r.x,0,r.z]} hitToken={target.token} targeted={target.id===r.id}/>)}{weather==='Rain'&&<RainParticles position={position}/>}</group>;
}

export function getWorldResourceMarkers(position = {x:0,z:0}) { const cx=Math.floor((Number(position.x)||0)/CHUNK_SIZE), cz=Math.floor((Number(position.z)||0)/CHUNK_SIZE); const out=[]; for(let x=cx-RADIUS;x<=cx+RADIUS;x++) for(let z=cz-RADIUS;z<=cz+RADIUS;z++) out.push(...resourceSpecs(x,z)); return out; }
