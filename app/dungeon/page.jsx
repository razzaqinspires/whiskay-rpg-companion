'use client';
import dynamic from 'next/dynamic';
const GameClient = dynamic(() => import('../../components/GameClient'), { ssr: false, loading: () => <main className="game-shell"><div className="scene-loading">Menyiapkan arena 3D…</div></main> });
export default function DungeonPage(){return <GameClient/>;}
