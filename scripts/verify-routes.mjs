import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
const root = process.cwd();
const legacyApi = path.join(root, 'api');
try { await stat(legacyApi); assert.fail('Root /api folder must not coexist with App Router API routes.'); }
catch (error) { if (error?.code !== 'ENOENT') throw error; }
const apiRoot = path.join(root, 'app', 'api');
const routes = [];
async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(file);
    else if (entry.name === 'route.js' || entry.name === 'route.ts') routes.push(file);
  }
}
await walk(apiRoot);
assert.ok(routes.length >= 3, `Expected API handlers, found ${routes.length}`);
for (const file of routes) {
  const source = await readFile(file, 'utf8');
  assert.match(source, /export\s+const\s+dynamic\s*=\s*['"]force-dynamic['"]/, `${path.relative(root,file)} must explicitly opt out of static route output`);
}
const relative = routes.map(file => '/' + path.relative(apiRoot, path.dirname(file)).split(path.sep).join('/')).sort();
assert.equal(new Set(relative).size, relative.length, 'Duplicate App Router endpoint paths found');
console.log(`Route verification passed: ${routes.length} unique dynamic API route(s); no conflicting root /api functions.`);
