import AccessRequired from '../../components/AccessRequired.jsx';
import { verifyGameAccess } from '../../lib/accessToken.js';
import DungeonEntry from '../../components/DungeonEntry.jsx';
export const dynamic = 'force-dynamic';
export default function DungeonPage({ searchParams }) {
  const player = String(searchParams?.player || ''), access = String(searchParams?.access || '');
  if (!/^[a-f0-9]{32}$/i.test(player) || !verifyGameAccess(access, player)) return <AccessRequired destination="dungeon" />;
  return <DungeonEntry playerId={player} accessToken={access}/>;
}
