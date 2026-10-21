'use client';
import dynamic from 'next/dynamic';
const AdventureClient = dynamic(() => import('../../components/AdventureClient'), { ssr: false, loading: () => <main style={{minHeight:'100vh',background:'#07121c',color:'#dff7ff',display:'grid',placeItems:'center'}}>Menyiapkan dunia Adventure 3D…</main> });
export default function AdventurePage(){ return <AdventureClient/>; }
