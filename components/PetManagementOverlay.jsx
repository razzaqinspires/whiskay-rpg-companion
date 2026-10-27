'use client';
import { useEffect, useState } from 'react';
const panel = {position:'absolute',left:'max(12px, env(safe-area-inset-left))',top:'max(66px, env(safe-area-inset-top))',zIndex:94,width:'min(248px, 34vw)',minWidth:170,padding:10,border:'1px solid #75e6d077',borderRadius:13,background:'#071321df',backdropFilter:'blur(10px)',color:'#e8fbff',fontSize:11,boxShadow:'0 6px 18px #0006'};
const bar=(value,color)=> <div style={{height:6,background:'#23384a',borderRadius:10,overflow:'hidden',marginTop:4}}><div style={{height:'100%',width:`${Math.max(0,Math.min(100,Number(value)||0))}%`,background:color,transition:'width .3s'}}/></div>;
export default function PetManagementOverlay({ playerId='' }) {
  const [pet,setPet] = useState(null), [status,setStatus] = useState('Memuat pet…');
  useEffect(()=>{
    let active=true;
    const accept = e => { const next=e.detail?.player?.pet; if(next!==undefined){setPet(previous=>{const nextHunger=Number(next?.hunger??0),previousHunger=Number(previous?.hunger??0);if(previous&&next&&nextHunger>previousHunger){window.dispatchEvent(new CustomEvent('whiskay:sfx',{detail:{kind:'pet'}}));}return next;});setStatus('Database sync');} };
    window.addEventListener('whiskay:player-update',accept);
    if(playerId) fetch('/api/player?player='+encodeURIComponent(playerId),{cache:'no-store'}).then(r=>r.ok?r.json():null).then(d=>{if(active&&d?.player){setPet(d.player.pet||null);setStatus('Snapshot loaded');}}).catch(()=>{if(active)setStatus('Mode lokal');}); else setStatus('Hubungkan karakter lewat bot');
    return()=>{active=false;window.removeEventListener('whiskay:player-update',accept);};
  },[playerId]);
  const hunger=Number(pet?.hunger??0), energy=Number(pet?.energy??0);
  return <aside aria-label="Manajemen virtual pet" style={panel}><div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:8}}><strong style={{fontSize:12}}>🐾 COMPANION</strong><small style={{color:'#75e6d0'}}>{status}</small></div>{pet&&pet.active!==false?<><div style={{fontSize:14,fontWeight:800,marginTop:6}}>{pet.name||pet.species} <span style={{fontSize:10,fontWeight:500,color:'#a9bdcf'}}>· {pet.species}</span></div><div style={{marginTop:7}}>❤️ Kenyang {Math.round(hunger)}/100{bar(hunger,hunger<30?'#fb7185':'#75e6d0')}</div><div style={{marginTop:7}}>⚡ Energi {Math.round(energy)}/100{bar(energy,energy<25?'#fbbf24':'#79aaff')}</div><p style={{margin:'7px 0 0',color:'#a9bdcf',lineHeight:1.4}}>Buff pasif: +8% kecepatan gerak. Gunakan <b>.feed pet-food</b> di WhatsApp untuk memberi makan dari inventory.</p></>:<p style={{margin:'8px 0 0',color:'#a9bdcf',lineHeight:1.45}}>Belum ada pet aktif. Tetaskan melalui perintah <b>.hatch</b> di WhatsApp.</p>}</aside>;
}
