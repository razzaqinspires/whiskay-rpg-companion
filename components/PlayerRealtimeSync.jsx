'use client';
import { useEffect, useRef, useState } from 'react';

const emit = (name, detail) => { try { window.dispatchEvent(new CustomEvent(name, { detail })); } catch {} };
export default function PlayerRealtimeSync() {
  const [message, setMessage] = useState('');
  const timerRef = useRef(null);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const playerId = params.get('player') || '';
    const accessToken = params.get('access') || '';
    const projectUrl = String(process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/+$/, '');
    const anonKey = String(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '');
    if (!/^[a-f0-9]{32}$/i.test(playerId) || !accessToken || !projectUrl || !anonKey) return;
    let disposed = false, socket, heartbeat, reconnect, ref = 0, joinRef = '1', lastPayload = null;
    const connect = async () => {
      try {
        if (!lastPayload) {
          const initialResponse = await fetch('/api/player?player=' + encodeURIComponent(playerId) + '&accessToken=' + encodeURIComponent(accessToken), { cache: 'no-store' });
          const initialData = await initialResponse.json().catch(() => ({}));
          if (initialResponse.ok && initialData?.player) {
            lastPayload = JSON.stringify(initialData.player);
            emit('whiskay:player-update', { player: initialData.player, updatedAt: initialData.updatedAt, initial: true });
          }
        }
        const tokenResponse = await fetch('/api/player/realtime-token', { method: 'POST', headers: {'content-type':'application/json'}, body: JSON.stringify({playerId, accessToken}), cache:'no-store' });
        const tokenData = await tokenResponse.json().catch(()=>({}));
        if (!tokenResponse.ok || !tokenData.token || disposed) { setMessage('Realtime belum dikonfigurasi'); return; }
        const wsUrl = new URL(projectUrl.replace(/^https:/,'wss:').replace(/^http:/,'ws:') + '/realtime/v1/websocket');
        wsUrl.searchParams.set('apikey', anonKey); wsUrl.searchParams.set('vsn','1.0.0');
        socket = new WebSocket(wsUrl.toString());
        socket.onopen = () => {
          if (disposed) return;
          const topic = `realtime:public:player_snapshots`;
          socket.send(JSON.stringify({topic,event:'phx_join',payload:{config:{broadcast:{ack:false,self:false},presence:{key:''},postgres_changes:[{event:'*',schema:'public',table:'player_snapshots',filter:`player_id=eq.${playerId}`}],private:false},access_token:tokenData.token},ref:String(++ref),join_ref:joinRef}));
          heartbeat = setInterval(()=>{ if(socket?.readyState===WebSocket.OPEN) socket.send(JSON.stringify({topic:'phoenix',event:'heartbeat',payload:{},ref:String(++ref)})); },25000);
          setMessage('Realtime tersambung');
        };
        socket.onmessage = event => {
          let packet; try { packet=JSON.parse(event.data); } catch { return; }
          if (packet.event === 'phx_reply' && packet.payload?.status === 'error') { setMessage('Realtime ditolak oleh policy Supabase'); return; }
          if (packet.event !== 'postgres_changes') return;
          const data = packet.payload?.data || packet.payload || {};
          const record = data.record || data.new || data;
          const old = data.old || {};
          if (record?.player_id && record.player_id !== playerId) return;
          const payload = record?.payload;
          if (!payload || typeof payload !== 'object') return;
          const serialized = JSON.stringify(payload);
          if (serialized === lastPayload) return;
          const previous = lastPayload ? JSON.parse(lastPayload) : null; lastPayload = serialized;
          emit('whiskay:player-update', { player: payload, updatedAt: record.updated_at, previous });
          const oldGold = Number(previous?.gold ?? payload.gold ?? 0), newGold = Number(payload.gold ?? 0);
          if (previous && newGold !== oldGold) {
            const delta = newGold - oldGold;
            emit('whiskay:toast', { message: delta > 0 ? `💰 +${delta} Gold diterima` : `💸 ${Math.abs(delta)} Gold digunakan`, kind: delta > 0 ? 'success' : 'info' });
          }
          const oldInv = new Set((previous?.inventory || []).map(item=>`${item.id}:${item.quantity||1}`));
          const gained = (payload.inventory || []).filter(item=>!oldInv.has(`${item.id}:${item.quantity||1}`));
          if (previous && gained.length) emit('whiskay:toast', { message: `🎁 Inventory diperbarui: ${gained.map(item=>item.name||item.id).join(', ')}`, kind:'success' });
        };
        socket.onclose = () => { clearInterval(heartbeat); if (!disposed) { setMessage('Realtime terputus, menyambungkan ulang…'); reconnect=setTimeout(connect,3000); } };
        socket.onerror = () => { try { socket.close(); } catch {} };
      } catch { if (!disposed) { setMessage('Realtime tidak tersedia'); reconnect=setTimeout(connect,5000); } }
    };
    connect();
    return () => { disposed=true; clearTimeout(reconnect); clearInterval(heartbeat); try { socket?.close(); } catch {} };
  }, []);
  return message ? <span className="realtime-status" aria-live="polite" title={message}>{message==='Realtime tersambung'?'● LIVE':message}</span> : null;
}
