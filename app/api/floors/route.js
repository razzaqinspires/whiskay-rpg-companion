import floorsData from '../../../lib/floors.json';

// This App Router handler is the sole owner of /api/floors.
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  return Response.json(floorsData, {
    headers: { 'Cache-Control': 'no-store, max-age=0' },
  });
}
