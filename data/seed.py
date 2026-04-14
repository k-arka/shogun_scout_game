"""
Seed script — inserts all 5 Japanese city maps into SQLite.

Positions are RANDOMLY generated at seed time using a Poisson-disc
dispersal algorithm so spots are well spread across the 100x100 grid
and never cluster in one area.

Run from project root:
    python data/seed.py              # seeds all 5 maps
    python data/seed.py --map tokyo  # seeds only Tokyo
    python data/seed.py --randomize  # re-randomizes positions on every run
"""

import json
import sys
import os
import math
import random
import argparse

sys.path.insert(0, os.path.abspath(os.path.join(__file__, "../..")))

from backend.core.db import get_db, init_db

DATA_DIR = os.path.dirname(__file__)

SEED_FILES = {
    "tokyo":          "tokyo_seed.json",
    "kyoto":          "kyoto_seed.json",
    "osaka":          "osaka_seed.json",
    "hokkaido":       "hokkaido_seed.json",
    "fuji_viewpoints":"fuji_viewpoints_seed.json",
}

# ── Poisson-disc dispersal (stratified quadrant seeding) ─────────────────────
# Seeds one point per quadrant of the [margin, 100-margin]² playfield, then
# grows via Bridson's algorithm to fill the remaining N-4 spots well across
# the full screen with guaranteed minimum separation.

def generate_dispersed_positions(n: int, min_dist: float = 16.0, margin: float = 4.0, seed: int | None = None) -> list[tuple[int, int]]:
    """Return N (x, y) integer tuples well dispersed across the full 100×100 grid.

    Strategy:
      1. Divide the space into 4 quadrants; place one seed in each quadrant
         to guarantee coverage across the ENTIRE screen.
      2. Run Bridson Poisson-disc sampling from those seeds to fill the rest.
      3. Shuffle to remove ordering bias before returning.
    """
    rng = random.Random(seed)
    lo, hi = margin, 100.0 - margin
    span = hi - lo
    mid = lo + span / 2

    # Grid for O(1) neighbourhood queries
    cell_size = min_dist / math.sqrt(2)
    grid: dict[tuple[int, int], tuple[float, float]] = {}
    active: list[tuple[float, float]] = []
    positions: list[tuple[float, float]] = []

    def grid_key(x: float, y: float) -> tuple[int, int]:
        return (int((x - lo) / cell_size), int((y - lo) / cell_size))

    def too_close(x: float, y: float, md: float) -> bool:
        gx, gy = grid_key(x, y)
        for dx in range(-2, 3):
            for dy in range(-2, 3):
                nb = grid.get((gx + dx, gy + dy))
                if nb and math.hypot(x - nb[0], y - nb[1]) < md:
                    return True
        return False

    def add_point(x: float, y: float) -> None:
        positions.append((x, y))
        active.append((x, y))
        grid[grid_key(x, y)] = (x, y)

    # ── Step 1: seed TWO points in each of the 4 quadrants ─────────────────
    quadrants = [
        (lo,  lo,  mid, mid),  # top-left
        (mid, lo,  hi,  mid),  # top-right
        (lo,  mid, mid, hi),   # bottom-left
        (mid, mid, hi,  hi),   # bottom-right
    ]
    for (x0, y0, x1, y1) in quadrants:
        for _ in range(2):
            placed = False
            for _attempt in range(50):
                sx = rng.uniform(x0 + (x1-x0)*0.10, x1 - (x1-x0)*0.10)
                sy = rng.uniform(y0 + (y1-y0)*0.10, y1 - (y1-y0)*0.10)
                # Use slightly relaxed min_dist for initial placements so they fit easily
                if not too_close(sx, sy, min_dist * 0.7):
                    add_point(sx, sy)
                    placed = True
                    break
            if not placed:
                # Fallback if constrained
                sx = rng.uniform(x0 + 1, x1 - 1)
                sy = rng.uniform(y0 + 1, y1 - 1)
                add_point(sx, sy)

    # ── Step 2: Bridson expansion ────────────────────────────────────────────
    K = 40           # candidates per active point per iteration
    current_md = min_dist

    while len(positions) < n:
        if not active:
            # All active exhausted – relax min_dist and retry from all points
            current_md *= 0.80
            if current_md < 4.5:
                break
            active.extend(positions)
            continue

        base = active[rng.randrange(len(active))]
        placed = False
        for _ in range(K):
            angle = rng.uniform(0, 2 * math.pi)
            r = rng.uniform(current_md, 2.5 * current_md)  # Throw points wider
            cx = base[0] + r * math.cos(angle)
            cy = base[1] + r * math.sin(angle)
            if lo <= cx <= hi and lo <= cy <= hi and not too_close(cx, cy, current_md):
                add_point(cx, cy)
                placed = True
                if len(positions) == n:
                    break
        if not placed:
            active.remove(base)

    # ── Step 3: fallback – fill remaining slots with relaxed distance ────────
    if len(positions) < n:
        for _ in range(5000):
            x = rng.uniform(lo, hi)
            y = rng.uniform(lo, hi)
            if not too_close(x, y, 4.5):
                add_point(x, y)
            if len(positions) >= n:
                break

    # ── Step 4: shuffle and return ───────────────────────────────────────────
    rng.shuffle(positions)
    return [(round(x), round(y)) for x, y in positions[:n]]


# ── Seeder ───────────────────────────────────────────────────────────────────

def seed_map(filename: str, use_fixed: bool = False, randomize: bool = False):
    """Seed a single map from its JSON file.

    Args:
        filename:  JSON filename inside DATA_DIR.
        use_fixed: If True, use coords from the JSON. If False (default),
                   generate random dispersed positions.
        randomize: If True, use a time-based seed so positions differ on every run.
    """
    path = os.path.join(DATA_DIR, filename)
    if not os.path.exists(path):
        print(f"[SKIP] {filename} not found.")
        return

    with open(path, encoding="utf-8") as f:
        payload = json.load(f)

    city   = payload["city"]
    region = payload.get("region")
    map_id = city.lower().replace(" ", "_").replace("-", "_")
    if "fuji" in map_id:
        map_id = "fuji_viewpoints"

    spots = payload["spots"]

    if len(spots) < 20:
        print(f"ERROR: {filename} has {len(spots)} spots, expected at least 20.")
        return

    # Randomly select exactly 20 spots if more than 20 are available
    if len(spots) > 20:
        if randomize:
            import time
            select_seed = int(time.time() * 1000) ^ hash(map_id)
        else:
            select_seed = hash(map_id)
        
        rng_select = random.Random(select_seed)
        spots = rng_select.sample(spots, 20)

    if use_fixed:
        # Use the explicit coords stored in the JSON (legacy mode)
        positions = [(s["coords"]["x"], s["coords"]["y"]) for s in spots]
    else:
        if randomize:
            # Time-based seed: different positions on every run
            import time
            rng_seed = int(time.time() * 1000) ^ hash(map_id)
        else:
            # Deterministic Bridson seed, stable per map_id across re-seeds
            rng_seed = hash(map_id) % (2**31) + sum(ord(c) * (i + 1) for i, c in enumerate(map_id))
        positions = generate_dispersed_positions(len(spots), min_dist=11.0, margin=6.0, seed=rng_seed)

    conn = get_db()
    with conn:
        conn.execute(
            "INSERT OR REPLACE INTO maps (id, display_name, region) VALUES (?, ?, ?)",
            (map_id, city, region),
        )
        conn.execute("DELETE FROM spots WHERE map_id = ?", (map_id,))
        for spot, (x, y) in zip(spots, positions):
            conn.execute(
                """INSERT INTO spots (map_id, name, pos_x, pos_y, category, trivia, image_uri)
                   VALUES (?, ?, ?, ?, ?, ?, ?)""",
                (map_id, spot["name"], x, y, spot["category"], spot["trivia"], ""),
            )
    conn.close()
    print(f"[OK] Seeded '{map_id}' — {len(spots)} spots {'(fixed coords)' if use_fixed else '(randomised positions)'}.")


def main():
    parser = argparse.ArgumentParser(description="Seed Shogun's Scout maps into SQLite.")
    parser.add_argument("--map", choices=list(SEED_FILES.keys()), help="Seed only this map.")
    parser.add_argument("--fixed", action="store_true", help="Use fixed coords from JSON instead of random positions.")
    parser.add_argument("--randomize", action="store_true", help="Use a time-based seed so positions vary on each run.")
    args = parser.parse_args()

    init_db()

    if args.map:
        seed_map(SEED_FILES[args.map], use_fixed=args.fixed, randomize=args.randomize)
    else:
        print("Seeding all maps with randomised Poisson-disc dispersal (Bridson algorithm)…")
        for filename in SEED_FILES.values():
            seed_map(filename, use_fixed=args.fixed, randomize=args.randomize)


if __name__ == "__main__":
    main()
