'use client';
import { useEffect, useState } from 'react';

export default function OrientationGuard() {
  const [portrait, setPortrait] = useState(false);
  useEffect(() => {
    const check = () => setPortrait(window.matchMedia('(orientation: portrait)').matches && window.innerWidth < 900);
    check(); window.addEventListener('resize', check); window.addEventListener('orientationchange', check);
    return () => { window.removeEventListener('resize', check); window.removeEventListener('orientationchange', check); };
  }, []);
  if (!portrait) return null;
  return <div role="alert" style={{position:'fixed',inset:0,zIndex:2000,display:'grid',placeItems:'center',padding:28,background:'radial-gradient(ellipse at center,#1a2948f7,#03050cfb)',color:'#f7e8bc',textAlign:'center',fontFamily:'system-ui,sans-serif'}}><div><div style={{fontSize:56,marginBottom:12}}>▱ ↻</div><h2 style={{fontFamily:'Georgia,serif',fontWeight:500,letterSpacing:2}}>PUTAR PERANGKATMU</h2><p style={{maxWidth:310,lineHeight:1.7,color:'#c5cbd9'}}>Aetheria dirancang untuk layar landscape. Putar ponsel ke posisi mendatar untuk memasuki dunia.</p><small style={{color:'#d4b86f',letterSpacing:2}}>LANDSCAPE REQUIRED</small></div></div>;
}
