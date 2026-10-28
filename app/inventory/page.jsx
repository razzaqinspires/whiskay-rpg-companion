import { verifyGameAccess } from '../../lib/accessToken.js';
import InventoryClient from '../../components/InventoryClient.jsx';
import AccessRequired from '../../components/AccessRequired.jsx';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export default function InventoryPage({ searchParams }) {
  const playerId = String(searchParams?.player || ''), accessToken = String(searchParams?.access || '');
  if (!/^[a-f0-9]{32}$/i.test(playerId) || !verifyGameAccess(accessToken, playerId)) return <AccessRequired destination="inventory" />;
  return <InventoryClient playerId={playerId} accessToken={accessToken} />;
}
