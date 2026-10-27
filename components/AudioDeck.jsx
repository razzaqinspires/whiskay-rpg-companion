'use client';
import { useEffect, useRef, useState } from 'react';

export default function AudioDeck() {
  const [musicOn, setMusicOn] = useState(false), [soundOn, setSoundOn] = useState(true);
  const audio = useRef(null), timer = useRef(null), step = useRef(0), playerPos = useRef({x:0,y:0,z:0});
  const ensureContext = () => {
    if (!audio.current) { const Ctx = window.AudioContext || window.webkitAudioContext; if (!Ctx) return null; audio.current = new Ctx(); }
    if (audio.current.state === 'suspended') void audio.current.resume();
    return audio.current;
  };
  const tone = (frequency, duration=.45, type='sine', volume=.035, spatial=null) => {
    const ctx = ensureContext(); if (!ctx) return;
    const osc = ctx.createOscillator(), gain = ctx.createGain(); osc.type=type; osc.frequency.value=frequency; gain.gain.setValueAtTime(.0001,ctx.currentTime); gain.gain.exponentialRampToValueAtTime(volume,ctx.currentTime+.04); gain.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+duration); osc.connect(gain);
    if(spatial && ctx.createPanner){const panner=ctx.createPanner();panner.panningModel='HRTF';panner.distanceModel='inverse';panner.refDistance=2;panner.maxDistance=35;panner.rolloffFactor=1.4;panner.positionX.value=Number(spatial.x)||0;panner.positionY.value=Number(spatial.y)||0;panner.positionZ.value=Number(spatial.z)||0; if(ctx.listener.positionX){ctx.listener.positionX.value=playerPos.current.x||0;ctx.listener.positionY.value=playerPos.current.y||0;ctx.listener.positionZ.value=playerPos.current.z||0;} gain.connect(panner);panner.connect(ctx.destination);}else gain.connect(ctx.destination);osc.start(); osc.stop(ctx.currentTime+duration+.03);
  };
  useEffect(() => { const onPlayerPosition = event => { playerPos.current={x:Number(event.detail?.x)||0,y:0,z:Number(event.detail?.z)||0}; };
    window.addEventListener('whiskay:player-position',onPlayerPosition);
    const onGameSfx = (event) => { if (!soundOn) return; const kind = event?.detail?.kind; const spatial=event?.detail?.position||null; if (kind === 'attack') { tone(145,.12,'sawtooth',.055,spatial); window.setTimeout(()=>tone(380,.16,'triangle',.035,spatial),45); } else if (kind === 'mine') { tone(740,.08,'square',.04,spatial); window.setTimeout(()=>tone(310,.18,'triangle',.035,spatial),60); } else if (kind === 'dash') { tone(180,.12,'sawtooth',.025); window.setTimeout(()=>tone(440,.16,'triangle',.025),70); } else if (kind === 'interact') { tone(660,.16,'sine',.03); } else if (kind === 'pulse') { tone(130,.25,'triangle',.035); window.setTimeout(()=>tone(520,.28,'sine',.025),90); } else if (kind === 'pet' || kind === 'pet-feed') { tone(587.33,.11,'sine',.024,spatial); window.setTimeout(()=>tone(783.99,.13,'triangle',.026,spatial),75); window.setTimeout(()=>tone(987.77,.20,'sine',.022,spatial),145); } }; window.addEventListener('whiskay:sfx', onGameSfx); return () => {window.removeEventListener('whiskay:sfx', onGameSfx);window.removeEventListener('whiskay:player-position',onPlayerPosition);}; }, [soundOn]);
  useEffect(() => () => { if(timer.current)window.clearInterval(timer.current); if(audio.current)void audio.current.close(); }, []);
  const toggleMusic = () => {
    if (musicOn) { if(timer.current)window.clearInterval(timer.current); timer.current=null; setMusicOn(false); return; }
    ensureContext(); const notes=[220,261.63,329.63,392,329.63,293.66,261.63,196]; step.current=0;
    tone(110,1.2,'sine',.018,{x:-18,y:1,z:10}); timer.current=window.setInterval(()=>{const f=notes[step.current%notes.length];const source=step.current%2===0?{x:30,y:0,z:-8}:{x:-18,y:1,z:10};tone(f,1.1,'sine',.018,source);if(step.current%4===0)tone(f/2,1.8,'triangle',.012,{x:30,y:0,z:-8});step.current++;},1050);setMusicOn(true);
  };
  return <div style={{display:'flex',gap:6,alignItems:'center',flexWrap:'wrap'}}><button type="button" onClick={toggleMusic} style={control}>{musicOn?'♫ AMBIENCE ON':'♫ AMBIENCE OFF'}</button><button type="button" onClick={()=>{setSoundOn(v=>!v);if(!soundOn)tone(660,.12,'triangle',.05);}} style={control}>{soundOn?'♪ SFX ON':'♪ SFX OFF'}</button><button type="button" onClick={()=>{if(soundOn){tone(523.25,.1,'triangle',.04);window.setTimeout(()=>tone(783.99,.18,'sine',.035),90);}}} style={control}>TEST SFX</button></div>;
}
const control={padding:'9px 11px',border:'1px solid #d8bb7150',borderRadius:8,background:'#0b1220d9',color:'#f1dba2',fontSize:9,letterSpacing:1,cursor:'pointer'};
