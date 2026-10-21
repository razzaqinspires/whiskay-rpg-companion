'use client';
import {useEffect} from 'react';
import {useGLTF} from '@react-three/drei';

/** Optional GLBs are configured via NEXT_PUBLIC_*_GLB_URL. No network request is made when unset. */
export default function AssetWarmup(){
  useEffect(()=>{
    const urls=[process.env.NEXT_PUBLIC_HERO_GLB_URL,process.env.NEXT_PUBLIC_MONSTER_GLB_URL].filter(Boolean);
    urls.forEach(url=>{try{useGLTF.preload(url);}catch{/* runtime loader/error boundary supplies procedural fallback */}});
  },[]);
  return null;
}
