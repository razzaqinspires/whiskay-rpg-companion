'use client';
import { useMemo } from 'react';
import { Detailed } from '@react-three/drei';

const CHUNK_SIZE = 20;
const RADIUS = 1;
function hash(n) { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
function ChunkTree({ x, z, scale, season }) {
  const leaf = season === 'Winter' ? '#d9e8ed' : season === 'Autumn' ? '#b47b3d' : season === 'Spring' ? '#54a66c' : '#28734b';
  return <Detailed distances={[0, 14, 25]} position={[x,0,z]} scale={scale}>
    <group><mesh position={[0,.65,0]}><cylinderGeometry args={[.12,.2,1.3,6]}/><meshStandardMaterial color="#68452d"/></mesh><mesh position={[0,1.55,0]}><coneGeometry args={[.8,1.6,6]}/><meshStandardMaterial color={leaf} roughness={1}/></mesh><mesh position={[0,2.1,0]}><coneGeometry args={[.55,1.2,5]}/><meshStandardMaterial color={leaf} roughness={1}/></mesh></group>
  </Detailed>;
}
function WorldChunk({ cx, cz, season }) {
  const trees = useMemo(() => Array.from({length: 8}, (_, i) => {
    const seed = (cx + 101) * 991 + (cz + 101) * 313 + i * 17;
    return { key: `${cx}:${cz}:${i}`, x: cx*CHUNK_SIZE + 2 + hash(seed)*16, z: cz*CHUNK_SIZE + 2 + hash(seed+8)*16, scale: .7 + hash(seed+19)*.55 };
  }).filter(t => Math.hypot(t.x,t.z) > 5), [cx,cz]);
  return <group>{trees.map(t => <ChunkTree key={t.key} {...t} season={season}/>)}</group>;
}
export default function WorldManager({ position = {x:0,z:0}, season = 'Summer' }) {
  const cx = Math.floor((Number(position.x)||0) / CHUNK_SIZE);
  const cz = Math.floor((Number(position.z)||0) / CHUNK_SIZE);
  const chunks = useMemo(() => { const out=[]; for(let x=cx-RADIUS;x<=cx+RADIUS;x++) for(let z=cz-RADIUS;z<=cz+RADIUS;z++) out.push([x,z]); return out; },[cx,cz]);
  return <group>{chunks.map(([x,z]) => <WorldChunk key={`${x}:${z}`} cx={x} cz={z} season={season}/>)}</group>;
}
