'use client';
import { useEffect, useRef, useState } from 'react';

export default function AudioDeck() {
  const [musicOn, setMusicOn] = useState(false), [soundOn, setSoundOn] = useState(true);
  const audio = useRef(null), timer = useRef(null), step = useRef(0);
  const ensureContext = () => {
    if (!audio.current) { const Ctx = window.AudioContext || window.webkitAudioContext; if (!Ctx) return null; audio.current = new Ctx(); }
    if (audio.current.state === 'suspended') void audio.current.resume();
    return audio.current;
  };
  const tone = (frequency, duration=.45, type='sine', volume=.035) => {
    const ctx = ensureContext(); if (!ctx) return;
    const osc = ctx.createOscillator(), gain = ctx.createGain(); osc.type=type; osc.frequency.value=frequency; gain.gain.setValueAtTime(.0001,ctx.currentTime); gain.gain.exponentialRampToValueAtTime(volume,ctx.currentTime+.04); gain.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+duration); osc.connect(gain); gain.connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime+duration+.03);
  };
  useEffect(() => { const onGameSfx = (event) => { if (!soundOn) return; const kind = event?.detail?.kind; if (kind === 'dash') { tone(180,.12,'sawtooth',.025); window.setTimeout(()=>tone(440,.16,'triangle',.025),70); } else if (kind === 'interact') { tone(660,.16,'sine',.03); } else if (kind === 'pulse') { tone(130,.25,'triangle',.035); window.setTimeout(()=>tone(520,.28,'sine',.025),90); } }; window.addEventListener('whiskay:sfx', onGameSfx); return () => window.removeEventListener('whiskay:sfx', onGameSfx); }, [soundOn]);
  useEffect(() => () => { if(timer.current)window.clearInterval(timer.current); if(audio.current)void audio.current.close(); }, []);
  const toggleMusic = () => {
    if (musicOn) { if(timer.current)window.clearInterval(timer.current); timer.current=null; setMusicOn(false); return; }
    ensureContext(); const notes=[220,261.63,329.63,392,329.63,293.66,261.63,196]; step.current=0;
    tone(110,1.2,'sine',.018); timer.current=window.setInterval(()=>{const f=notes[step.current%notes.length];tone(f,1.1,'sine',.018);if(step.current%4===0)tone(f/2,1.8,'triangle',.012);step.current++;},1050);setMusicOn(true);
  };
  return <div style={{display:'flex',gap:6,alignItems:'center',flexWrap:'wrap'}}><button type="button" onClick={toggleMusic} style={control}>{musicOn?'♫ AMBIENCE ON':'♫ AMBIENCE OFF'}</button><button type="button" onClick={()=>{setSoundOn(v=>!v);if(!soundOn)tone(660,.12,'triangle',.05);}} style={control}>{soundOn?'♪ SFX ON':'♪ SFX OFF'}</button><button type="button" onClick={()=>{if(soundOn){tone(523.25,.1,'triangle',.04);window.setTimeout(()=>tone(783.99,.18,'sine',.035),90);}}} style={control}>TEST SFX</button></div>;
}
const control={padding:'9px 11px',border:'1px solid #d8bb7150',borderRadius:8,background:'#0b1220d9',color:'#f1dba2',fontSize:9,letterSpacing:1,cursor:'pointer'};
