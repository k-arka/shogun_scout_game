"use client";
/**
 * Play Page — wraps TanStack Query + FogGrid.
 * Reads ?map and ?theme from URL (set by the War Room).
 */
import { useQuery } from "@tanstack/react-query";
import { useQueryState } from "nuqs";
import { useRouter } from "next/navigation";
import { fetchSpots, type SpotItem } from "@/lib/api";
import FogGrid from "@/components/FogGrid";

export default function PlayPage() {
  const router = useRouter();
  const [mapId] = useQueryState("map");
  const [theme] = useQueryState("theme");

  const resolvedTheme = theme ?? "lantern-dusk";

  const { data: spots, isLoading, isError, error } = useQuery<SpotItem[]>({
    queryKey: ["spots", mapId],
    queryFn: () => {
      if (!mapId) throw new Error("No map selected");
      return fetchSpots(mapId);
    },
    enabled: !!mapId,
  });

  if (!mapId) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-6 px-6">
        <p className="text-lg opacity-60">No map selected.</p>
        <button className="bushido-btn px-8 py-3" onClick={() => router.push("/war-room")}>
          Return to War Room
        </button>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center text-sm opacity-50 animate-pulse">
        Loading mission data…
      </main>
    );
  }

  if (isError) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-4 px-6">
        <p className="text-red-400 text-sm">
          ⚠ {(error as Error).message}
        </p>
        <button className="bushido-btn px-8 py-3" onClick={() => router.push("/war-room")}>
          Return to War Room
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col" style={{ height: "100dvh" }}>
      <FogGrid spots={spots!} mapId={mapId} theme={resolvedTheme} />
    </main>
  );
}
