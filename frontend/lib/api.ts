/**
 * Shared API helpers for the frontend.
 * All calls hit the FastAPI backend at localhost:8000.
 */

const getApiBase = () => {
  const isLocal = typeof window !== "undefined" && window.location.hostname === "localhost";
  const envVar = process.env.NEXT_PUBLIC_API_URL || "";

  // Defensive: if the env var was set to localhost but we're in prod, clear it
  if (envVar.includes("localhost") && !isLocal) {
    return "";
  }

  if (envVar && !envVar.includes("localhost") && !envVar.includes("127.0.0.1")) {
    return envVar;
  }
  
  if (isLocal) {
    return "http://localhost:8000";
  }

  return "";
};

const API_BASE = getApiBase();

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
