import floorsData from '../../../lib/floors.json';
export const dynamic = 'force-static';
export async function GET(){return Response.json(floorsData,{headers:{'Cache-Control':'public, max-age=300, stale-while-revalidate=3600'}});}
