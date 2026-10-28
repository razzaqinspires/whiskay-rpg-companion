'use client';
import dynamic from 'next/dynamic';
const GameClient = dynamic(() => import('./GameClient'), { ssr:false, loading:()=> <main className="game-shell"><div className="scene-loading">Menyiapkan instance Dungeonia…</div></main> });
export default function DungeonEntry({ playerId, accessToken }) { return <GameClient playerId={playerId} accessToken={accessToken}/>; }
