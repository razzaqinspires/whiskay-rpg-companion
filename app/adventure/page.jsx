import { verifyGameAccess } from '../../lib/accessToken.js';
import AdventureEntry from '../../components/AdventureEntry.jsx';
export const dynamic = 'force-dynamic';
export default function AdventurePage({ searchParams }) {
  const player = String(searchParams?.player || ''), access = String(searchParams?.access || '');
  if (!verifyGameAccess(access, player)) return <main style={{minHeight:'100vh',background:'#07121c',color:'#e8fbff',display:'grid',placeItems:'center',padding:24,textAlign:'center'}}><section><h1>Akses Karakter Diperlukan</h1><p>Game tidak dapat dimainkan hanya dengan membuka URL. Minta tautan Checkpoint melalui bot WhatsApp: <b>.enterdungeon</b>.</p><p>Tautan akses bersifat sementara dan terikat pada karakter pemain.</p></section></main>;
  return <AdventureEntry playerId={player} accessToken={access}/>;
}
