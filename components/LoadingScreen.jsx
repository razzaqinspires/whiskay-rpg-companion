'use client';
import { useProgress } from '@react-three/drei';
import { useEffect, useState } from 'react';

export default function LoadingScreen() {
  const { active, progress, errors } = useProgress();
  const [minimumElapsed, setMinimumElapsed] = useState(false);
  const [failsafeElapsed, setFailsafeElapsed] = useState(false);
  useEffect(() => {
    const minId = window.setTimeout(() => setMinimumElapsed(true), 650);
    // Some WebViews never report useProgress activity (or leave it at 0).
    // Fail open after a bounded wait so gameplay cannot be blocked forever.
    const safeId = window.setTimeout(() => setFailsafeElapsed(true), 9000);
    return () => { window.clearTimeout(minId); window.clearTimeout(safeId); };
  }, []);
  if (minimumElapsed && ((!active && progress >= 100) || failsafeElapsed)) return null;
  const value = failsafeElapsed ? 100 : Math.max(0, Math.min(100, Math.round(progress || 0)));
  const status = errors.length ? 'ASSET FALLBACK ACTIVE' : failsafeElapsed ? 'ENTERING WITH AVAILABLE ASSETS' : 'SYNCING ASSETS';
  return <div role="status" aria-live="polite" style={{position:'absolute',inset:0,zIndex:1000,display:'grid',placeItems:'center',background:'radial-gradient(ellipse at 50% 35%,#26334dcc,#050811f5)',backdropFilter:'blur(14px)',color:'#f7e7b2',fontFamily:'Georgia,serif',textAlign:'center',padding:24}}>
    <div style={{width:'min(420px,90vw)'}}><div style={{fontSize:11,letterSpacing:5,color:'#d9bd75'}}>A E T H E R I A</div><h2 style={{fontWeight:500,fontSize:'clamp(28px,6vw,42px)',margin:'18px 0 8px',textShadow:'0 0 28px #e8bd5a44'}}>The Realm Awakens</h2><p style={{fontFamily:'system-ui',fontSize:12,color:'#c6c4bd'}}>Menyiapkan dunia, relic, dan resonansi spirit…</p><div style={{height:5,marginTop:28,borderRadius:8,background:'#ffffff20',overflow:'hidden',border:'1px solid #d7b86a66'}}><div style={{height:'100%',width:`${value}%`,background:'linear-gradient(90deg,#a87b35,#ffe6a1)',transition:'width .2s',boxShadow:'0 0 18px #ffdf87'}}/></div><div style={{display:'flex',justifyContent:'space-between',font:'10px system-ui',letterSpacing:2,marginTop:10,color:'#e8d7a5'}}><span>{status}</span><span>{value}%</span></div></div>
  </div>;
}
