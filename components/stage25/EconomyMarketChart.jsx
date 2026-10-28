'use client';
import { useEffect, useState } from 'react';

export default function EconomyMarketChart() {
  const [ticks, setTicks] = useState([]);
  const [status, setStatus] = useState('Memuat data pasar…');
  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const response = await fetch('/api/economy/market', { cache: 'no-store' });
        if (!response.ok) throw new Error('Endpoint pasar belum tersedia');
        const data = await response.json();
        if (alive) { setTicks(Array.isArray(data.ticks) ? data.ticks.slice(-24) : []); setStatus('Data pasar tersinkron'); }
      } catch { if (alive) setStatus('Data pasar belum tersedia; grafik tidak menggunakan data simulasi.'); }
    };
    load(); const timer = setInterval(load, 30_000);
    return () => { alive = false; clearInterval(timer); };
  }, []);
  const values = ticks.map(t => Number(t.market_index)).filter(Number.isFinite);
  const min = Math.min(...values, 0.9), max = Math.max(...values, 1.1);
  const points = values.map((v, i) => `${values.length < 2 ? 10 : 10 + i * (280 / (values.length - 1))},${80 - ((v - min) / Math.max(0.0001, max - min)) * 65}`).join(' ');
  return <section aria-label="Grafik pasar Koin Mod" className="rounded-xl border border-white/10 bg-slate-950/70 p-4 text-white"><h2 className="font-semibold">Pasar Koin Mod</h2><p className="text-xs text-slate-400">{status}</p><svg viewBox="0 0 300 90" role="img" aria-label="Indeks pasar dari transaksi tercatat" className="mt-3 w-full"><path d="M10 80 H290" stroke="currentColor" opacity=".25" />{points && <polyline points={points} fill="none" stroke="#67e8f9" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />}</svg><p className="text-xs text-slate-400">{ticks.length ? `${ticks.length} titik data aktual` : 'Menunggu data transaksi aktual dari endpoint server.'}</p></section>;
}
