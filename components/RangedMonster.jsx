import React, {useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import {Html} from '@react-three/drei';
import * as THREE from 'three';

/**
 * Lightweight ranged enemy. Fires a cooldown-based proximity attack via a browser event.
 * It deliberately uses distance checks (no per-frame raycast) to stay mobile-friendly.
 */
export default function RangedMonster({position=[-2,0,-4], playerPos={x:0,z:0}, floor=1, enabled=true}) {
  const root=useRef(), projectile=useRef(), cooldown=useRef(1.5), shot=useRef(0), direction=useRef(new THREE.Vector3());
  const maxHp=36+floor*9, damage=4+floor*2, range=5.8+floor*.2;
  useFrame((state,dt)=>{
    const d=Math.min(dt,.05);
    if(!root.current||!enabled)return;
    const dx=playerPos.x-root.current.position.x, dz=playerPos.z-root.current.position.z, dist=Math.hypot(dx,dz);
    if(dist<range && dist>.01){
      root.current.rotation.y=Math.atan2(dx,dz);
      cooldown.current-=d;
      if(cooldown.current<=0){cooldown.current=2.5;shot.current=.38;direction.current.set(dx/dist,0,dz/dist);}
    }
    if(shot.current>0){shot.current-=d;if(projectile.current){projectile.current.visible=true;const t=1-shot.current/.38;projectile.current.position.set(0,1.05,0);projectile.current.position.x=direction.current.x*t*dist;projectile.current.position.z=direction.current.z*t*dist;}}
    else if(projectile.current)projectile.current.visible=false;
    if(shot.current<=0 && cooldown.current>2.35 && dist<range && dist>0.8){
      // One compact hit event at the end of a short projectile telegraph.
      cooldown.current=2.5;
      if(typeof window!=='undefined')window.dispatchEvent(new CustomEvent('whiskay:ranged-hit',{detail:{damage, floor}}));
    }
  });
  return <group ref={root} position={position}>
    <mesh position={[0,.72,0]} castShadow><capsuleGeometry args={[.27,.65,4,7]}/><meshToonMaterial color={floor>3?'#8b365c':'#42618d'}/></mesh>
    <mesh position={[0,1.35,0]} castShadow><sphereGeometry args={[.22,10,8]}/><meshToonMaterial color="#d8b9a4"/></mesh>
    <mesh position={[0,1.4,-.04]}><sphereGeometry args={[.24,10,8,0,Math.PI*2,0,Math.PI*.5]}/><meshToonMaterial color="#20203d"/></mesh>
    <mesh position={[.28,.92,.05]} rotation={[0,0,-.7]}><cylinderGeometry args={[.025,.035,.55,5]}/><meshToonMaterial color="#bd9960"/></mesh>
    <mesh ref={projectile} visible={false} position={[0,1,0]}><sphereGeometry args={[.11,8,6]}/><meshBasicMaterial color="#ff725e"/></mesh>
    <Html position={[0,1.8,0]} center distanceFactor={13}><div style={{whiteSpace:'nowrap',padding:'3px 6px',borderRadius:6,background:'#180d1add',border:'1px solid #e46d6d88',fontSize:9,color:'#ffd8d2'}}>Ranged Wisp · Lv.{floor}</div></Html>
  </group>;
}
