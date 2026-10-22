'use client';
import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
export default function WorldBoss({ position = {x: 11, z: -12}, enabled = true }) {
  const root=useRef(null), ring=useRef(null), material=useRef(null), phase=useRef('idle'), timer=useRef(3), target=useRef(new THREE.Vector3()), last=useRef(0);
  useEffect(()=>{ if(enabled) window.dispatchEvent(new CustomEvent('whiskay:worldboss-spawned',{detail:{x:position.x,z:position.z}})); phase.current='idle'; timer.current=2.5; if(ring.current) ring.current.visible=false; },[enabled]);
  useFrame((_,dt)=>{
    if(!enabled){if(ring.current)ring.current.visible=false;return;}
    const step=Math.min(dt,.05); if(root.current)root.current.rotation.y+=step*.35; timer.current-=step;
    if(phase.current==='idle'&&timer.current<=0){target.current.set(position.x,0.035,position.z);phase.current='warning';timer.current=1.25;if(ring.current){ring.current.position.set(position.x,.035,position.z);ring.current.scale.setScalar(1);ring.current.visible=true;}}
    else if(phase.current==='warning'){
      if(material.current)material.current.opacity=.22+(Math.sin(performance.now()*.02)+1)*.16;
      if(ring.current)ring.current.scale.setScalar(1+(1.25-Math.max(0,timer.current))*.12);
      if(timer.current<=0){phase.current='idle';timer.current=4.2;if(ring.current)ring.current.visible=false;const now=performance.now();if(now-last.current>1000){last.current=now;window.dispatchEvent(new CustomEvent('whiskay:worldboss-aoe',{detail:{x:target.current.x,z:target.current.z,radius:2.5,damage:16}}));}}
    }
  });
  return <group>
    <group ref={root} position={[position.x,0,position.z]}>
      <mesh position={[0,1.65,0]} castShadow><icosahedronGeometry args={[1.15,1]}/><meshToonMaterial color="#8d214d" emissive="#5b092b" emissiveIntensity={1.15}/></mesh>
      <mesh position={[0,2.05,.62]}><octahedronGeometry args={[.38,0]}/><meshBasicMaterial color="#ffdb8a"/></mesh>
      <mesh position={[-.68,2.38,0]} rotation={[0,0,.45]}><coneGeometry args={[.24,.9,5]}/><meshToonMaterial color="#c99cff"/></mesh>
      <mesh position={[.68,2.38,0]} rotation={[0,0,-.45]}><coneGeometry args={[.24,.9,5]}/><meshToonMaterial color="#c99cff"/></mesh>
      <mesh position={[0,.12,0]} rotation={[-Math.PI/2,0,0]}><torusGeometry args={[1.3,.045,8,28]}/><meshBasicMaterial color="#ff507a" emissive="#9d153e"/></mesh>
    </group>
    <mesh ref={ring} rotation={[-Math.PI/2,0,0]} visible={false}><ringGeometry args={[1.9,2.5,40]}/><meshBasicMaterial ref={material} color="#ff315c" transparent opacity={.4} depthWrite={false} side={THREE.DoubleSide}/></mesh>
  </group>;
}
