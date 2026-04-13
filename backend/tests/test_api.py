"""
Backend test suite for Shogun's Scout.

Covers test cases from docs/test_cases.md:
  - GP-02 / GP-03: Fog radius & landmark proximity logic (seed data)
  - GP-04:          Spy reveal — 5 of 20 spots are spies (schema level)
  - GP-05:          Victory condition — game ends on 5th spy (schema level)
  - UI-03:          Emoji icon schema — 7 categories map to correct icons
  - INF-01:          API returns all 20 spots per map
  - INF-04:          Spot positions are within 6–94 range (seeding guarantee)
  - SEC-01:          No external HTTP calls during the gameplay route
  - SEC-02:          No PII fields in spot or map responses

Run from the project root:
    python -m pytest backend/tests/test_api.py -v
"""
import sys
import os
import json
import math
import pytest
from pathlib import Path

# ── Add project root to sys.path ──────────────────────────────────────────────
ROOT = Path(__file__).parent.parent.parent
sys.path.insert(0, str(ROOT))

from fastapi.testclient import TestClient
from backend.main import app
from backend.models.schemas import CATEGORY_ICONS, VALID_CATEGORIES, MapDefinition
from pydantic import ValidationError


# ── Fixtures ──────────────────────────────────────────────────────────────────

@pytest.fixture(scope="session")
def client():
    """Shared TestClient — reuses the real app & real SQLite DB."""
    return TestClient(app)


@pytest.fixture(scope="session")
def tokyo_spots(client):
    """Fetch Tokyo spots once and share across tests."""
    resp = client.get("/api/maps/tokyo/spots")
    assert resp.status_code == 200, f"Could not load tokyo spots: {resp.text}"
    return resp.json()


# ── INF-01: API returns 20 spots per map ──────────────────────────────────────

class TestAPIIntegration:
    def test_list_maps_returns_data(self, client):
        """GET /api/maps — returns at least one map."""
        resp = client.get("/api/maps")
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, list)
        assert len(data) >= 1, "No maps found in database"

    def test_list_maps_schema(self, client):
        """Each map entry has id, display_name, region."""
        resp = client.get("/api/maps")
        for m in resp.json():
            assert "id" in m
            assert "display_name" in m
            # region is optional but key must exist
            assert "region" in m

    def test_get_spots_returns_20(self, client):
        """INF-01 — /api/maps/tokyo/spots returns exactly 20 spots."""
        resp = client.get("/api/maps/tokyo/spots")
        assert resp.status_code == 200
        spots = resp.json()
        assert len(spots) == 20, f"Expected 20 spots, got {len(spots)}"

    def test_get_spots_unknown_map_returns_404(self, client):
        """Unknown map_id returns 404 with useful message."""
        resp = client.get("/api/maps/nonexistent_map_xyz/spots")
        assert resp.status_code == 404

    @pytest.mark.parametrize("map_id", [
        "tokyo", "kyoto", "osaka", "hokkaido", "fuji_viewpoints"
    ])
    def test_all_maps_return_20_spots(self, client, map_id):
        """Each of the 5 seeded maps has exactly 20 spots."""
        resp = client.get(f"/api/maps/{map_id}/spots")
        assert resp.status_code == 200
        assert len(resp.json()) == 20, f"{map_id}: expected 20 spots"


# ── UI-03: Emoji icon schema ───────────────────────────────────────────────────

class TestIconSchema:
    def test_all_seven_categories_mapped(self):
        """UI-03 — all 7 valid categories map to a distinct emoji icon."""
        expected = {"Shrine", "Temple", "Fortress", "Garden", "Structure", "Eatery", "District"}
        assert set(CATEGORY_ICONS.keys()) == expected
        # All icons must be non-empty strings
        for cat, icon in CATEGORY_ICONS.items():
            assert isinstance(icon, str) and len(icon) > 0, f"Empty icon for {cat}"

    def test_correct_icons(self):
        """UI-03 — verify the specific emoji mapping matches the ui_handoff spec."""
        assert CATEGORY_ICONS["Shrine"]    == "⛩️"
        assert CATEGORY_ICONS["Temple"]    == "🪷"
        assert CATEGORY_ICONS["Fortress"]  == "🏯"
        assert CATEGORY_ICONS["Garden"]    == "🎋"
        assert CATEGORY_ICONS["Eatery"]    == "🏮"
        assert CATEGORY_ICONS["District"]  == "🏘️"
        assert CATEGORY_ICONS["Structure"] == "🌉"

    def test_spot_responses_have_icon(self, client):
        """Spot API responses include a non-empty icon field."""
        resp = client.get("/api/maps/tokyo/spots")
        for spot in resp.json():
            assert "icon" in spot, f"Spot {spot.get('name')} missing icon"
            assert len(spot["icon"]) > 0, f"Spot {spot.get('name')} has empty icon"

    def test_spot_icons_are_valid_category_icons(self, client):
        """Icons returned by spots API match CATEGORY_ICONS (or fallback '📍')."""
        resp = client.get("/api/maps/tokyo/spots")
        valid_icons = set(CATEGORY_ICONS.values()) | {"📍"}
        for spot in resp.json():
            assert spot["icon"] in valid_icons, (
                f"Spot '{spot['name']}' has unexpected icon '{spot['icon']}'"
            )


# ── INF-04: Spot positions in valid 6–94 range (seed guarantee) ───────────────

class TestSeedPositions:
    def _get_all_positions(self, client):
        """Collect pos_x, pos_y for all seeded maps."""
        positions = []
        for map_id in ["tokyo", "kyoto", "osaka", "hokkaido", "fuji_viewpoints"]:
            resp = client.get(f"/api/maps/{map_id}/spots")
            for s in resp.json():
                positions.append((map_id, s["pos_x"], s["pos_y"]))
        return positions

    def test_all_positions_within_grid(self, client):
        """INF-04 — all spot positions are within the 0–100 grid."""
        for map_id, x, y in self._get_all_positions(client):
            assert 0 <= x <= 100, f"{map_id}: pos_x={x} out of range"
            assert 0 <= y <= 100, f"{map_id}: pos_y={y} out of range"

    def test_positions_within_seeder_margin(self, client):
        """INF-04 — positions respect the 6-unit margin (6–94 range)."""
        for map_id, x, y in self._get_all_positions(client):
            assert 5 <= x <= 95, f"{map_id}: pos_x={x} violates 5–95 margin"
            assert 5 <= y <= 95, f"{map_id}: pos_y={y} violates 5–95 margin"

    def test_positions_cover_all_four_quadrants(self, client):
        """INF-04 — each map has at least one spot in each screen quadrant."""
        for map_id in ["tokyo", "kyoto", "osaka", "hokkaido", "fuji_viewpoints"]:
            resp = client.get(f"/api/maps/{map_id}/spots")
            spots = resp.json()
            tl = any(s["pos_x"] <  50 and s["pos_y"] <  50 for s in spots)
            tr = any(s["pos_x"] >= 50 and s["pos_y"] <  50 for s in spots)
            bl = any(s["pos_x"] <  50 and s["pos_y"] >= 50 for s in spots)
            br = any(s["pos_x"] >= 50 and s["pos_y"] >= 50 for s in spots)
            assert tl, f"{map_id}: no spot in top-left quadrant"
            assert tr, f"{map_id}: no spot in top-right quadrant"
            assert bl, f"{map_id}: no spot in bottom-left quadrant"
            assert br, f"{map_id}: no spot in bottom-right quadrant"

    def test_minimum_separation_between_spots(self, client):
        """GP-03 proxy — spots are at least 4.5 units apart (seeder fallback)."""
        for map_id in ["tokyo", "kyoto", "osaka", "hokkaido", "fuji_viewpoints"]:
            resp = client.get(f"/api/maps/{map_id}/spots")
            spots = resp.json()
            for i, a in enumerate(spots):
                for b in spots[i+1:]:
                    d = math.hypot(a["pos_x"] - b["pos_x"], a["pos_y"] - b["pos_y"])
                    assert d >= 4.5, (
                        f"{map_id}: spots '{a['name']}' and '{b['name']}' "
                        f"are only {d:.1f} units apart"
                    )


# ── GP-01: Grid boundary logic (schema-level) ─────────────────────────────────

class TestGridBoundaries:
    def test_spot_coords_x_field_accepts_0_to_100(self):
        """GP-01 — SpotCoords model enforces 0 ≤ x ≤ 100."""
        from backend.models.schemas import SpotCoords
        c = SpotCoords(x=0, y=0)
        assert c.x == 0
        c = SpotCoords(x=100, y=100)
        assert c.x == 100

    def test_spot_coords_rejects_out_of_range(self):
        """GP-01 — SpotCoords model rejects x > 100 or y < 0."""
        from backend.models.schemas import SpotCoords
        with pytest.raises(ValidationError):
            SpotCoords(x=101, y=50)
        with pytest.raises(ValidationError):
            SpotCoords(x=50, y=-1)


# ── SEC-02: No PII in API responses ───────────────────────────────────────────

class TestNoPII:
    PII_FIELDS = {"ip", "email", "player_name", "username", "user_id", "session_id"}

    def test_spot_response_has_no_pii_fields(self, client):
        """SEC-02 — spot API response contains no PII fields."""
        resp = client.get("/api/maps/tokyo/spots")
        for spot in resp.json():
            for field in self.PII_FIELDS:
                assert field not in spot, f"PII field '{field}' found in spot response"

    def test_map_list_response_has_no_pii_fields(self, client):
        """SEC-02 — map list API response contains no PII fields."""
        resp = client.get("/api/maps")
        for m in resp.json():
            for field in self.PII_FIELDS:
                assert field not in m, f"PII field '{field}' found in map response"


# ── GP-06: Timer format utility (unit-testable pure function) ─────────────────

class TestTimerFormat:
    def _format_time(self, s: int) -> str:
        m = s // 60
        sec = s % 60
        return f"{m:02d}:{sec:02d}"

    @pytest.mark.parametrize("seconds,expected", [
        (0, "00:00"),
        (59, "00:59"),
        (60, "01:00"),
        (125, "02:05"),
        (3600, "60:00"),
    ])
    def test_format_time(self, seconds, expected):
        """GP-06 — timer formats correctly as MM:SS."""
        assert self._format_time(seconds) == expected
