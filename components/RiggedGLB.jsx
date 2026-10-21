'use client';
import {useEffect,useMemo} from 'react';
import {useGLTF,useAnimations} from '@react-three/drei';
import * as THREE from 'three';

const CLIPS={idle:['idle','breathing','stand'],walk:['walk','walking','run_cycle'],run:['run','running','sprint'],jump:['jump','jump_start'],attack:['attack','slash','sword'],dodge:['dodge','roll','evade'],hit:['hit','hurt','damage']};
function findClip(clips,state){
  const names=CLIPS[state]||CLIPS.idle;
  return clips.find(c=>names.some(n=>c.name.toLowerCase().includes(n)))||clips.find(c=>c.name.toLowerCase().includes('idle'))||clips[0];
}
export default function RiggedGLB({url,state='idle',position=[0,0,0],scale=1,rotation=[0,0,0],onLoaded}){
  const gltf=useGLTF(url);
  const scene=useMemo(()=>{const cloned=gltf.scene.clone(true);cloned.traverse(o=>{if(o.isMesh){o.castShadow=false;o.receiveShadow=false;if(o.material){o.material=o.material.clone();o.material.side=THREE.FrontSide;}}});return cloned;},[gltf.scene]);
  const {actions,clips,mixer}=useAnimations(gltf.animations,scene);
  useEffect(()=>{
    if(!clips?.length)return;
    const clip=findClip(clips,state); if(!clip)return;
    const next=actions[clip.name]; if(!next)return;
    next.reset().setLoop(THREE.LoopRepeat,Infinity).fadeIn(.18).play();
    Object.entries(actions).forEach(([name,action])=>{if(name!==clip.name)action?.fadeOut(.16);});
    return()=>{next.fadeOut(.12);};
  },[state,clips,actions]);
  useEffect(()=>{onLoaded?.(true);return()=>onLoaded?.(false);},[onLoaded]);
  return <group position={position} rotation={rotation} scale={scale}><primitive object={scene} /></group>;
}
