import { verifyGameAccess } from '../../lib/accessToken.js';
import DungeonEntry from '../../components/DungeonEntry.jsx';
export const dynamic = 'force-dynamic';
export default function DungeonPage({ searchParams }) {
  const player = String(searchParams?.player || ''), access = String(searchParams?.access || '');
  if (!verifyGameAccess(access, player)) return <main style={{minHeight:'100vh',background:'#07121c',color:'#e8fbff',display:'grid',placeItems:'center',padding:24,textAlign:'center'}}><section><h1>Akses Karakter Diperlukan</h1><p>Minta tautan akses sementara dari bot WhatsApp dengan perintah <b>.enterdungeon</b>.</p></section></main>;
  return <DungeonEntry/>;
}
