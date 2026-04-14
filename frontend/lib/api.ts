import { generateDispersedPositions } from "./seed";

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

const CATEGORY_ICONS: Record<string, string> = {
  "Shrine": "⛩️",
  "Temple": "🪷",
  "Fortress": "🏯",
  "Garden": "🎋",
  "Structure": "🌉",
  "Eatery": "🏮",
  "District": "🏘️",
};

export async function fetchMaps(): Promise<MapItem[]> {
  return [
    { id: "tokyo", display_name: "Tokyo", region: "Kanto" },
    { id: "kyoto", display_name: "Kyoto", region: "Kansai" },
    { id: "osaka", display_name: "Osaka", region: "Kansai" },
    { id: "hokkaido", display_name: "Hokkaido", region: "Hokkaido" },
    { id: "fuji_viewpoints", display_name: "Fuji", region: "Chubu" },
  ];
}

// Simple xorshift generator just for sampling array
function simpleRandom(seed: number) {
  return function() {
    seed ^= seed << 13;
    seed ^= seed >> 17;
    seed ^= seed << 5;
    return ((seed < 0 ? ~seed + 1 : seed) % 1000000) / 1000000;
  };
}

export async function fetchSpots(mapId: string): Promise<SpotItem[]> {
  const filename = mapId === "fuji_viewpoints" ? "fuji_viewpoints_seed.json" : `${mapId}_seed.json`;
  const res = await fetch(`/data/${filename}`);
  if (!res.ok) throw new Error("Failed to fetch map data");
  const data = await res.json();
  
  let seedStr = typeof window !== "undefined" ? sessionStorage.getItem(`seed_${mapId}`) : null;
  if (!seedStr) {
    seedStr = Math.floor(Math.random() * 1000000).toString();
    if (typeof window !== "undefined") {
      sessionStorage.setItem(`seed_${mapId}`, seedStr);
    }
  }
  const rngSeed = parseInt(seedStr, 10);
  const rng = simpleRandom(rngSeed);

  const rawSpots = data.spots;
  // Always shuffle to pick 20 random spots if map has more than 20
  const shuffled = [...rawSpots];
  for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const selectedSpots = shuffled.slice(0, 20);
  
  const positions = generateDispersedPositions(selectedSpots.length, 11.0, 6.0, rngSeed);

  return selectedSpots.map((s: any, idx: number) => ({
    id: idx + 1,
    map_id: mapId,
    name: s.name,
    pos_x: positions[idx].x,
    pos_y: positions[idx].y,
    category: s.category,
    icon: CATEGORY_ICONS[s.category] || "📍",
    trivia: s.trivia,
    image_uri: "",
  }));
}
