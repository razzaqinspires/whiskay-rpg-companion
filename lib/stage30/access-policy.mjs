/** Shared input guards for Stage 30 game routes. */
export function isValidPlayerId(value) {
  return typeof value === 'string' && /^[a-f0-9]{32}$/i.test(value);
}
export function parseBoundedInteger(value, { min = 0, max = 1000000 } = {}) {
  const number = typeof value === 'number' ? value : Number(value);
  if (!Number.isSafeInteger(number) || number < min || number > max) return null;
  return number;
}
export function parseFiniteCoordinate(value, { min = -100000, max = 100000 } = {}) {
  if (value === '' || value === null || value === undefined) return null;
  const number = Number(value);
  if (!Number.isFinite(number) || number < min || number > max) return null;
  return number;
}
