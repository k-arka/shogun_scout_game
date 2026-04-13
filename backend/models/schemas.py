"""
Pydantic schemas for Shogun's Scout.
These models strictly enforce the 20-spot limit and 7-category icon schema.
"""
from typing import Optional, List
from pydantic import BaseModel, Field, field_validator


# ─── Valid Categories ────────────────────────────────────────────────────────
VALID_CATEGORIES = {"Shrine", "Temple", "Fortress", "Garden", "Structure", "Eatery", "District"}

CATEGORY_ICONS: dict[str, str] = {
    "Shrine":    "⛩️",
    "Temple":    "🪷",
    "Fortress":  "🏯",
    "Garden":    "🎋",
    "Structure": "🌉",
    "Eatery":    "🏮",
    "District":  "🏘️",
}


# ─── Spot Models ─────────────────────────────────────────────────────────────
class SpotCoords(BaseModel):
    x: int = Field(..., ge=0, le=100)
    y: int = Field(..., ge=0, le=100)


class SpotIn(BaseModel):
    """Input model for a single spot from map_definition.json."""
    name: str
    coords: SpotCoords
    category: str
    trivia: str

    @field_validator("category")
    @classmethod
    def validate_category(cls, v: str) -> str:
        if v not in VALID_CATEGORIES:
            raise ValueError(f"Invalid category '{v}'. Must be one of: {sorted(VALID_CATEGORIES)}")
        return v


class SpotOut(BaseModel):
    """Output model for a spot served to the frontend."""
    id: int
    map_id: str
    name: str
    pos_x: int
    pos_y: int
    category: str
    icon: str
    trivia: str
    image_uri: Optional[str] = None

    model_config = {"from_attributes": True}


# ─── Map Models ──────────────────────────────────────────────────────────────
class MapDefinition(BaseModel):
    """Strict input schema for map_definition.json — exactly 20 spots required."""
    city: str
    region: str
    spots: List[SpotIn] = Field(..., min_length=20, max_length=20)


class MapOut(BaseModel):
    """Output model for map list endpoint."""
    id: str
    display_name: str
    region: Optional[str] = None

    model_config = {"from_attributes": True}


