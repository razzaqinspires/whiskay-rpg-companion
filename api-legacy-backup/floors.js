import { readFile } from 'node:fs/promises';
import path from 'node:path';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
  try {
    const file = path.join(process.cwd(), 'data', 'floors.json');
    const data = JSON.parse(await readFile(file, 'utf8'));
    return res.status(200).json(data);
  } catch (error) {
    console.error('[api/floors] failed to load floor data:', error?.message || error);
    return res.status(500).json({ error: 'floor_data_unavailable', floors: [] });
  }
}
