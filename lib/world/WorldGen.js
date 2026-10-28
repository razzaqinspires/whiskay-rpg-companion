/** Deterministic, dependency-free world layout generator. Same seed => same markers. */
function mulberry32(seed) { return function () { let t = seed += 0x6D2B79F5; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
export function normalizeSeed(seed) { const n = Number(seed); return Number.isFinite(n) ? (Math.trunc(n) >>> 0) : 1999; }
export function generateWorld(seed = 1999, count = 160) {
  const rng = mulberry32(normalizeSeed(seed));
  const markers = [];
  const total = Math.max(0, Math.min(2000, Math.trunc(Number(count) || 0)));
  for (let i = 0; i < total; i++) {
    const x = Math.round((rng() * 2 - 1) * 500 * 100) / 100;
    const z = Math.round((rng() * 2 - 1) * 500 * 100) / 100;
    const roll = rng();
    markers.push({ id: `${normalizeSeed(seed)}:${i}`, kind: roll < .48 ? 'tree' : roll < .72 ? 'rock' : roll < .9 ? 'ore' : 'ruin', x, z, scale: Math.round((.65 + rng() * .8) * 100) / 100 });
  }
  return markers;
}
export default generateWorld;
