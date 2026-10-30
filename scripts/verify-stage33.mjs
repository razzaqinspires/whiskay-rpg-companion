import { readFile, access } from 'node:fs/promises';
import path from 'node:path';
const root = process.cwd();
const files = ['README.md','CHANGELOG.md','MEMORY.md','docs/STAGE-33.md','docs/STAGE-33-250-SUBCATEGORIES.md'];
for (const file of files) await access(path.join(root,file));
const readme = await readFile(path.join(root,'README.md'),'utf8');
if (!readme.includes('Knightbot-MD') || !readme.includes('Stage 33')) throw new Error('Stage 33 scope not documented in README');
await access(path.join(root,'app/api/player'));
console.log('Stage 33 static website scope contract: OK');
