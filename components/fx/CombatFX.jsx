'use client';
import { useEffect, useState } from 'react';
/** Lightweight DOM overlay; dispatch whiskay:combat-fx with {damage, critical, x, y}. */
export default function CombatFX() {
  const [events, setEvents] = useState([]);
  useEffect(() => {
    const onFx = (event) => {
      const detail = event?.detail || {};
      const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      setEvents(old => [...old.slice(-7), { id, damage: Math.max(0, Number(detail.damage) || 0), critical: Boolean(detail.critical), x: Math.max(5, Math.min(95, Number(detail.x) || 50)), y: Math.max(10, Math.min(85, Number(detail.y) || 45)) }]);
      if (detail.critical) { document.documentElement.classList.add('whiskay-screen-shake'); setTimeout(() => document.documentElement.classList.remove('whiskay-screen-shake'), 320); }
      setTimeout(() => setEvents(old => old.filter(item => item.id !== id)), 1200);
    };
    window.addEventListener('whiskay:combat-fx', onFx);
    return () => window.removeEventListener('whiskay:combat-fx', onFx);
  }, []);
  return <div aria-live="polite" className="pointer-events-none fixed inset-0 z-[100] overflow-hidden">{events.map(item => <span key={item.id} style={{ left: `${item.x}%`, top: `${item.y}%`, animation: 'whiskay-damage-float 1.15s ease-out forwards' }} className={`absolute font-black drop-shadow-lg ${item.critical ? 'text-amber-300 text-3xl' : 'text-red-300 text-xl'}`}>-{item.damage}{item.critical ? ' CRIT!' : ''}</span>)}<style jsx global>{`@keyframes whiskay-damage-float{0%{transform:translateY(8px) scale(.8);opacity:0}15%{opacity:1}100%{transform:translateY(-48px) scale(1.12);opacity:0}}.whiskay-screen-shake{animation:whiskay-shake .28s linear}@keyframes whiskay-shake{0%,100%{transform:translate(0)}25%{transform:translate(-3px,2px)}50%{transform:translate(3px,-2px)}75%{transform:translate(-2px,-1px)}}</style></div>;
}
