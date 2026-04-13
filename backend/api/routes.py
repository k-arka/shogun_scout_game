"""
FastAPI route definitions for Shogun's Scout.
"""
import json
from typing import List

from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends
from fastapi.responses import JSONResponse

from backend.core.db import get_db

from backend.models.schemas import MapOut, SpotOut, CATEGORY_ICONS
import sqlite3
import sys
from pathlib import Path

# Add project root so we can import data.seed safely without path issues
sys.path.append(str(Path(__file__).parent.parent.parent))
try:
    from data.seed import seed_map, SEED_FILES
except ImportError:
    seed_map = None
    SEED_FILES = {}

router = APIRouter()


# ─── Dependency ───────────────────────────────────────────────────────────────
def db_conn():
    conn = get_db()
    try:
        yield conn
    finally:
        conn.close()


# ─── Public Game Endpoints ────────────────────────────────────────────────────
@router.get("/api/maps", response_model=List[MapOut])
def list_maps(conn: sqlite3.Connection = Depends(db_conn)):
    """Return all available maps. Consumed by the War Room selector."""
    rows = conn.execute("SELECT id, display_name, region FROM maps ORDER BY created_at DESC").fetchall()
    return [dict(r) for r in rows]


@router.get("/api/maps/{map_id}/spots", response_model=List[SpotOut])
def get_spots(map_id: str, conn: sqlite3.Connection = Depends(db_conn)):
    """Return the 20 spots for a given map, enriched with their emoji icon."""
    rows = conn.execute(
        "SELECT * FROM spots WHERE map_id = ? ORDER BY id",
        (map_id,),
    ).fetchall()
    if not rows:
        raise HTTPException(status_code=404, detail=f"Map '{map_id}' not found or has no spots.")
    results = []
    for r in rows:
        d = dict(r)
        d["icon"] = CATEGORY_ICONS.get(d["category"], "📍")
        results.append(d)
    return results


@router.post("/api/maps/{map_id}/randomize")
def randomize_map_route(map_id: str):
    """
    Dynamically triggers a completely fresh procedural layout for the given map.
    Allows new application sessions to be completely varied.
    """
    if map_id not in SEED_FILES:
        raise HTTPException(status_code=404, detail="Map JSON not found for dynamic re-seeding.")
    if seed_map:
        seed_map(SEED_FILES[map_id], randomize=True)
    return {"status": "success"}

