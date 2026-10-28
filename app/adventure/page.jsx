import AccessRequired from '../../components/AccessRequired.jsx';
import { verifyGameAccess } from '../../lib/accessToken.js';
import AdventureEntry from '../../components/AdventureEntry.jsx';
export const dynamic = 'force-dynamic';
export default function AdventurePage({ searchParams }) {
  const player = String(searchParams?.player || ''), access = String(searchParams?.access || '');
  if (!/^[a-f0-9]{32}$/i.test(player) || !verifyGameAccess(access, player)) return <AccessRequired destination="adventure" />;
  return <AdventureEntry playerId={player} accessToken={access}/>;
}
