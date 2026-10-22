'use client';
import dynamic from 'next/dynamic';
const AdventureClient = dynamic(() => import('./AdventureClient'), { ssr:false, loading:()=> <main style={{minHeight:'100vh',background:'#07121c',color:'#dff7ff',display:'grid',placeItems:'center'}}>Menyiapkan dunia Adventure 3D…</main> });
export default function AdventureEntry({playerId,accessToken}) { return <AdventureClient playerId={playerId} accessToken={accessToken}/>; }
