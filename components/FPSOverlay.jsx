'use client';
import {useEffect,useRef} from 'react';

/** Lightweight DOM FPS meter. It samples rAF without React state updates per frame. */
export default function FPSOverlay({corner='top-left'}) {
  const node=useRef(null);
  useEffect(()=>{
    let raf=0,frames=0,last=performance.now(),alive=true;
    const tick=(now)=>{
      if(!alive)return;
      frames++;
      const elapsed=now-last;
      if(elapsed>=500){
        const fps=Math.round(frames*1000/elapsed);
        if(node.current){node.current.textContent=`${fps} FPS`;node.current.dataset.level=fps>=50?'good':fps>=30?'mid':'low';}
        frames=0;last=now;
      }
      raf=requestAnimationFrame(tick);
    };
    raf=requestAnimationFrame(tick);
    return()=>{alive=false;cancelAnimationFrame(raf);};
  },[]);
  const pos=corner==='top-right'?{top:'max(8px,env(safe-area-inset-top))',right:'max(8px,env(safe-area-inset-right))'}:{top:'max(8px,env(safe-area-inset-top))',left:'max(8px,env(safe-area-inset-left))'};
  return <div ref={node} aria-label="Real-time frame rate" title="Frame rate measured with requestAnimationFrame" data-level="mid" style={{position:'absolute',...pos,zIndex:1200,pointerEvents:'none',padding:'4px 7px',borderRadius:7,background:'#020712b8',border:'1px solid #ffffff22',color:'#e9f6ff',font:'600 11px ui-monospace,monospace',letterSpacing:.3,backdropFilter:'blur(4px)'}}>-- FPS</div>;
}
