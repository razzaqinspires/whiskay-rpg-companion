'use client';
import { useMemo } from 'react';
export default function ModCoinShop({ botNumber = process.env.NEXT_PUBLIC_WHISKAY_BOT_NUMBER || '', quantity = 100, modCoinPrice = null, batteryUpgradePrice = 100 }) {
  const link = useMemo(() => { const text = `.buy modcoin ${Math.max(1,Math.min(100000,Math.floor(Number(quantity)||100)))}`; const digits=String(botNumber||'').replace(/\D/g,''); return digits ? `https://wa.me/${digits}?text=${encodeURIComponent(text)}` : `https://wa.me/?text=${encodeURIComponent(text)}`; }, [botNumber, quantity]);
  return <section aria-label="Mod Coin Shop" style={{border:'1px solid #d9b96b66',borderRadius:16,padding:16,background:'linear-gradient(145deg,#101b2c,#090e18)',color:'#f5e8c4',display:'grid',gap:10}}>
    <h3 style={{margin:0}}>🪙 Mod Coin Shop</h3><p style={{margin:0,fontSize:13,opacity:.85}}>Pembelian dan konfirmasi pembayaran diproses melalui WhiskayBot.</p>
    <div style={{display:'flex',justifyContent:'space-between',gap:8}}><span>Mod Coin × {quantity}</span><strong>{modCoinPrice == null ? 'Harga dikonfirmasi bot' : `Rp${Number(modCoinPrice).toLocaleString('id-ID')}`}</strong></div>
    <div style={{display:'flex',justifyContent:'space-between',gap:8}}><span>Upgrade kapasitas +50</span><strong>{batteryUpgradePrice} Koin Mod</strong></div>
    <a href={link} target="_blank" rel="noreferrer" style={{display:'inline-flex',justifyContent:'center',padding:'11px 14px',borderRadius:10,background:'#1fae67',color:'#fff',fontWeight:700,textDecoration:'none'}}>Beli via WhatsApp · .buy modcoin {quantity}</a>
  </section>;
}
