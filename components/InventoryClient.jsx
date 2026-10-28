'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
export default function InventoryClient({ playerId, accessToken }) {
  const [player, setPlayer] = useState(null), [status, setStatus] = useState('loading');
  useEffect(() => {
    let active = true;
    fetch(`/api/player?player=${encodeURIComponent(playerId)}&accessToken=${encodeURIComponent(accessToken)}`, { cache: 'no-store' })
      .then(async response => { const data = await response.json().catch(() => ({})); if (!response.ok) throw new Error(data.error || 'load_failed'); return data; })
      .then(data => { if (active) { setPlayer(data.player || null); setStatus('ready'); } })
      .catch(() => { if (active) setStatus('error'); });
    return () => { active = false; };
  }, [playerId, accessToken]);
  const panel = { minHeight: '100vh', background: '#07121c', color: '#e8fbff', padding: 24, fontFamily: 'system-ui,sans-serif' };
  if (status === 'loading') return <main style={panel}>Memuat inventaris karakter dari server…</main>;
  if (status === 'error' || !player) return <main style={panel}><h1>Sesi tidak valid</h1><p>Inventaris tidak dapat dibuka tanpa checkpoint WhatsApp yang sah. Minta tautan baru dari bot.</p><Link href="/">Kembali ke portal</Link></main>;
  const inventory = Array.isArray(player.inventory) ? player.inventory : [];
  const itemStyle = { background: '#102231', border: '1px solid #315365', borderRadius: 12, padding: 14 };
  return <main style={panel}><header style={{display:'flex',justifyContent:'space-between',gap:12,flexWrap:'wrap',alignItems:'center'}}><Link href={`/adventure?player=${encodeURIComponent(playerId)}&access=${encodeURIComponent(accessToken)}`} style={{color:'#8debf0'}}>← Kembali ke Adventure</Link><span>SERVER SAVE · VERIFIED</span></header><section style={{margin:'32px 0 20px'}}><p style={{letterSpacing:3,color:'#8debf0'}}>PLAYER COLLECTION / SUPABASE SNAPSHOT</p><h1 style={{fontSize:'clamp(30px,5vw,52px)',margin:'8px 0'}}>Inventory</h1><p>Inventaris ini milik karakter terverifikasi. Data demo dan localStorage tidak digunakan sebagai sumber inventaris.</p></section><section style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))',gap:10}}>{[['LEVEL',player.level??1],['GOLD',player.gold??0],['GEMS',player.gems??0],['POTIONS',player.potions??0],['SPIRIT SHARDS',player.spiritShards??0],['ITEMS',inventory.length]].map(([label,value])=><div key={label} style={itemStyle}><small style={{color:'#91b3c3'}}>{label}</small><h2 style={{margin:'8px 0'}}>{value}</h2></div>)}</section><h2 style={{marginTop:30}}>Items & Relics</h2>{inventory.length ? <section style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:12}}>{inventory.map((item,index)=><article key={`${item.id||item.name||'item'}-${index}`} style={itemStyle}><small style={{color:'#8debf0'}}>{String(item.rarity||'COMMON').toUpperCase()} · {String(item.type||item.slot||'ITEM').toUpperCase()}</small><h3>{item.name||item.id||`Item ${index+1}`}</h3><p>Jumlah: {Number(item.quantity??1)}</p><p>{item.description||item.detail||'Item tersimpan pada snapshot karakter server.'}</p></article>)}</section> : <div style={{...itemStyle,marginTop:12}}><h3>Inventaris masih kosong</h3><p>Item akan muncul setelah diperoleh melalui sistem game/bot dan tersimpan pada snapshot karakter ini.</p></div>}<p style={{marginTop:24,color:'#91b3c3',fontSize:13}}>Player ID: {playerId.slice(0,8)}… · Sinkronisasi berasal dari snapshot server; tidak ada item bawaan palsu.</p></main>;
}
