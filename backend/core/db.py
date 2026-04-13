"""
Database connection and helper functions for Shogun's Scout (SQLite via aiosqlite).
Provides synchronous helpers since SQLite is already local and fast.
"""
import sqlite3
import os
from pathlib import Path

DB_PATH = Path(__file__).parent.parent.parent / "data" / "dev.db"


def get_db() -> sqlite3.Connection:
    """Return a SQLite connection with row_factory set to sqlite3.Row."""
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL;")
    conn.execute("PRAGMA foreign_keys=ON;")
    return conn


def init_db() -> None:
    """Ensure the schema exists. Safe to call multiple times (IF NOT EXISTS)."""
    conn = get_db()
    with conn:
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS maps (
                id           VARCHAR(50)  PRIMARY KEY,
                display_name VARCHAR(100) NOT NULL,
                region       VARCHAR(100),
                created_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS spots (
                id        INTEGER      PRIMARY KEY AUTOINCREMENT,
                map_id    VARCHAR(50)  NOT NULL,
                name      VARCHAR(100) NOT NULL,
                pos_x     INTEGER      NOT NULL,
                pos_y     INTEGER      NOT NULL,
                category  VARCHAR(50)  NOT NULL,
                trivia    TEXT,
                image_uri VARCHAR(255) NOT NULL DEFAULT '',
                FOREIGN KEY (map_id) REFERENCES maps(id) ON DELETE CASCADE
            );

            CREATE INDEX IF NOT EXISTS idx_spots_map_id ON spots (map_id);
        """)
    conn.close()
