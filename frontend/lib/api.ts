/**
 * Shared API helpers for the frontend.
 * All calls hit the FastAPI backend at localhost:8000.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export interface MapItem {
  id: string;
  display_name: string;
  region?: string;
}

export interface SpotItem {
  id: number;
  map_id: string;
  name: string;
  pos_x: number;
  pos_y: number;
  category: string;
  icon: string;
  trivia: string;
  image_uri?: string;
}

export async function fetchMaps(): Promise<MapItem[]> {
  const res = await fetch(`${API_BASE}/api/maps`);
  if (!res.ok) throw new Error("Failed to fetch maps");
  return res.json();
}

export async function fetchSpots(mapId: string): Promise<SpotItem[]> {
  const res = await fetch(`${API_BASE}/api/maps/${mapId}/spots`);
  if (!res.ok) throw new Error(`Failed to fetch spots for map '${mapId}'`);
  return res.json();
}
