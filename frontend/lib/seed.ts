/**
 * Client-side implementation of the Poisson-disc dispersal (stratified quadrant seeding)
 * Generates well-dispersed spot positions randomly but consistently with a guaranteed minimum separation.
 */

// Simple seeded PRNG (xorshift)
function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateDispersedPositions(
  n: number,
  minDist = 11.0,
  margin = 6.0,
  seed: number
) {
  const rng = mulberry32(seed);

  const lo = margin;
  const hi = 100.0 - margin;
  const span = hi - lo;
  const mid = lo + span / 2;

  const positions: { x: number; y: number }[] = [];
  const active: { x: number; y: number }[] = [];
  const cellSize = minDist / Math.sqrt(2);

  // Using a Map to emulate the Python grid dictionary
  const grid = new Map<string, { x: number; y: number }>();

  function gridKey(x: number, y: number): string {
    return `${Math.floor((x - lo) / cellSize)},${Math.floor((y - lo) / cellSize)}`;
  }

  function tooClose(x: number, y: number, md: number): boolean {
    const gx = Math.floor((x - lo) / cellSize);
    const gy = Math.floor((y - lo) / cellSize);
    for (let dx = -2; dx <= 2; dx++) {
      for (let dy = -2; dy <= 2; dy++) {
        const nb = grid.get(`${gx + dx},${gy + dy}`);
        if (nb) {
          const dist = Math.hypot(x - nb.x, y - nb.y);
          if (dist < md) return true;
        }
      }
    }
    return false;
  }

  function addPoint(x: number, y: number) {
    positions.push({ x, y });
    active.push({ x, y });
    grid.set(gridKey(x, y), { x, y });
  }

  // Step 1: Seed two points in each quadrant
  const quadrants = [
    [lo, lo, mid, mid], // top-left
    [mid, lo, hi, mid], // top-right
    [lo, mid, mid, hi], // bottom-left
    [mid, mid, hi, hi], // bottom-right
  ];

  for (const [x0, y0, x1, y1] of quadrants) {
    for (let c = 0; c < 2; c++) {
      let placed = false;
      for (let attempt = 0; attempt < 50; attempt++) {
        const sx = x0 + (x1 - x0) * 0.1 + rng() * ((x1 - x0) * 0.8);
        const sy = y0 + (y1 - y0) * 0.1 + rng() * ((y1 - y0) * 0.8);
        if (!tooClose(sx, sy, minDist * 0.7)) {
          addPoint(sx, sy);
          placed = true;
          break;
        }
      }
      if (!placed) {
        const sx = x0 + 1 + rng() * ((x1 - x0) - 2);
        const sy = y0 + 1 + rng() * ((y1 - y0) - 2);
        addPoint(sx, sy);
      }
    }
  }

  // Step 2: Bridson expansion
  const K = 40;
  let currentMd = minDist;

  while (positions.length < n) {
    if (active.length === 0) {
      currentMd *= 0.8;
      if (currentMd < 4.5) break;
      active.push(...positions);
      continue;
    }

    const activeIdx = Math.floor(rng() * active.length);
    const base = active[activeIdx];
    let placed = false;

    for (let i = 0; i < K; i++) {
      const angle = rng() * 2 * Math.PI;
      const r = currentMd + rng() * (1.5 * currentMd);
      const cx = base.x + r * Math.cos(angle);
      const cy = base.y + r * Math.sin(angle);

      if (cx >= lo && cx <= hi && cy >= lo && cy <= hi && !tooClose(cx, cy, currentMd)) {
        addPoint(cx, cy);
        placed = true;
        if (positions.length === n) break;
      }
    }

    if (!placed) {
      active.splice(activeIdx, 1);
    }
  }

  // Step 3: fallback – fill remaining slots with relaxed distance
  if (positions.length < n) {
    for (let i = 0; i < 5000; i++) {
      const x = lo + rng() * span;
      const y = lo + rng() * span;
      if (!tooClose(x, y, 4.5)) {
        addPoint(x, y);
      }
      if (positions.length >= n) break;
    }
  }

  // Step 4: shuffle
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }

  return positions.slice(0, n).map(p => ({ x: Math.round(p.x), y: Math.round(p.y) }));
}
