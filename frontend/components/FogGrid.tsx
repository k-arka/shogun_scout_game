"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { SpotItem } from "@/lib/api";
import ScrollBanner from "./ScrollBanner";
import FightAnimation from "./FightAnimation";

/**
 * FogGrid — v6.1
 *
 * Interaction model:
 *  - ENTER near a spot → interrogate directly
 *    · Already-interrogated spy spot → skip fight, show result banner immediately
 *    · New spy hit → fight animation → banner
 *    · Safe spot → banner
 *  - Banner: NO visible button — show subtle "Press Enter" hint only; ENTER advances to details
 *  - Detail card: ENTER or Escape closes it; subtle [Enter] hint shown inside Close button
 *  - HUD: "New Game" button → confirmation modal → redirects to war-room territory selection
 *  - Fog: heavier overlay — icons are the focus, background image is atmospheric only
 *  - Far spots: "distant lantern" effect — raised opacity + pulsing beacon glow so the full
 *    map is always discoverable; they remain clearly dimmer than in-range spots
 *  - Icons + samurai: enlarged for high visibility; explored spots show ADDITIONAL badge above
 *    original icon (never replaces it)
 */

const GRID_SIZE   = 100;
const FOG_RADIUS  = 20;   // ghost visibility radius
const GLOW_RADIUS = 3.5;  // clear reveal radius
const SPY_COUNT   = 5;

const BG_IMAGES: Record<string, string> = {
  "nature-mist":    "/theme-backgrounds/nature-mist.png",
  "lantern-dusk":   "/theme-backgrounds/lantern-dusk.png",
  "cyber-smoke":    "/theme-backgrounds/cyber-smoke.png",
  "castle-shadows": "/theme-backgrounds/castle-shadows.png",
};

interface Props {
  spots: SpotItem[];
  mapId: string;
  theme: string;
}

type SpotState = "hidden" | "visited" | "spy" | "safe";

function dist(ax: number, ay: number, bx: number, by: number) {
  return Math.sqrt((ax - bx) ** 2 + (ay - by) ** 2);
}

function pickSpies(spots: SpotItem[], count: number): Set<number> {
  const indices = [...Array(spots.length).keys()];
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return new Set(indices.slice(0, count));
}

export default function FogGrid({ spots, mapId, theme }: Props) {
  const [px, setPx] = useState(50);
  const [py, setPy] = useState(50);
  const spySet = useRef<Set<number>>(pickSpies(spots, Math.min(SPY_COUNT, spots.length)));

  const [spotStates, setSpotStates] = useState<Record<number, SpotState>>(() =>
    Object.fromEntries(spots.map((s) => [s.id, "hidden"]))
  );

  const [detailSpot, setDetailSpot] = useState<SpotItem | null>(null);
  const pendingDetailRef = useRef<SpotItem | null>(null);

  const [showFight, setShowFight] = useState(false);
  const [banner, setBanner] = useState<{
    type: "victory" | "safe";
    title: string;
    subtitle: string;
  } | null>(null);

  const spiesFound = Object.values(spotStates).filter((s) => s === "spy").length;
  const visitedCount = Object.values(spotStates).filter((s) => s !== "hidden").length;

  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  function formatTime(s: number) {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const ss = (s % 60).toString().padStart(2, "0");
    return `${m}:${ss}`;
  }

  // ── Interrogation ──────────────────────────────────────────────────────────
  function performInterrogation(spot: SpotItem) {
    const spotIdx = spots.findIndex(s => s.id === spot.id);
    const isSpy = spySet.current.has(spotIdx);
    const currentState = spotStates[spot.id] ?? "hidden";

    // Mark the spot
    setSpotStates(prev => ({ ...prev, [spot.id]: isSpy ? "spy" : "safe" }));
    pendingDetailRef.current = spot;

    // If this spy spot was ALREADY interrogated → skip fight, show banner directly
    if (isSpy && currentState === "spy") {
      setBanner({
        type: "victory",
        title: "SPY ALREADY ELIMINATED 👺",
        subtitle: "You've already vanquished the shadow here.",
      });
      return;
    }

    if (isSpy) {
      setShowFight(true);
      const newCount = spiesFound + 1;
      if (newCount >= SPY_COUNT) {
        if (timerRef.current) clearInterval(timerRef.current);
        setTimeout(() => setGameOver(true), 5000);
      }
    } else {
      setBanner({
        type: "safe",
        title: "No Spy Detected",
        subtitle: "A great place to visit. Thankfully, no spies lurk here.",
      });
    }
  }

  function handleFightComplete() {
    setShowFight(false);
    setBanner({
      type: "victory",
      title: "SPY ELIMINATED! 👺",
      subtitle: "Well done, Scout. The shadow has been vanquished.",
    });
  }

  function handleShowDetails() {
    setBanner(null);
    if (pendingDetailRef.current) {
      setDetailSpot(pendingDetailRef.current);
      pendingDetailRef.current = null;
    }
  }

  const [showNewGameConfirm, setShowNewGameConfirm] = useState(false);

  function startNewGame() {
    setShowNewGameConfirm(true);
  }

  function confirmNewGame() {
    window.location.href = "/war-room";
  }

  // ── Keyboard handler ───────────────────────────────────────────────────────
  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      // If detail card is open → Enter closes it
      if (detailSpot) {
        if (e.key === "Enter" || e.key === "Escape") {
          e.preventDefault();
          setDetailSpot(null);
        }
        return;
      }

      // If banner is showing → Enter triggers Show Details
      if (banner && !showFight) {
        if (e.key === "Enter" || e.key === "Escape") {
          e.preventDefault();
          handleShowDetails();
        }
        return;
      }

      if (gameOver || showFight) return;

      switch (e.key) {
        case "ArrowUp":    e.preventDefault(); setPy(y => Math.max(0, y - 1)); break;
        case "ArrowDown":  e.preventDefault(); setPy(y => Math.min(GRID_SIZE - 1, y + 1)); break;
        case "ArrowLeft":  e.preventDefault(); setPx(x => Math.max(0, x - 1)); break;
        case "ArrowRight": e.preventDefault(); setPx(x => Math.min(GRID_SIZE - 1, x + 1)); break;
        case "Enter": {
          const nearby = spots.find(s => dist(px, py, s.pos_x, s.pos_y) <= GLOW_RADIUS);
          if (nearby) performInterrogation(nearby);
          break;
        }
      }
    },
    [detailSpot, banner, gameOver, showFight, px, py, spots, spotStates]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  // ── Fog — heavier overlay so icons are the focal point, not the background ──
  const fogStyle = {
    background: `radial-gradient(circle ${FOG_RADIUS}% at ${px}% ${py}%, rgba(0,0,0,0.10) 0%, rgba(0,0,0,0.55) 55%, rgba(0,0,0,0.82) 100%)`,
  };

  return (
    <div className="relative w-full h-full flex flex-col select-none bg-[var(--bg)] text-[var(--text)]">

      {/* ── HUD ────────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-2.5 z-30 bg-black/55 backdrop-blur-lg border-b border-[var(--accent)]/25 relative shrink-0">
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[var(--accent)]/40 to-transparent" />

        <div className="flex items-center gap-4 text-[11px] font-black tracking-[0.12em] uppercase">
          <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-sm border border-white/5">
            <span className="text-base opacity-80">⏳</span>
            <span className="text-[var(--accent)] font-mono">{formatTime(seconds)}</span>
          </div>
          <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-sm border border-white/5">
            <span className="text-base">👺</span>
            <span>Spies: <span className="text-red-400">{spiesFound}/{SPY_COUNT}</span></span>
          </div>
          <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-sm border border-white/5 opacity-70">
            <span className="text-base">⛩️</span>
            <span>{visitedCount}/20 Visited</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-[var(--accent)]/10 px-4 py-1.5 rounded-full border border-[var(--accent)]/15 text-[9px] text-[var(--accent)] font-bold uppercase tracking-[0.2em] hidden lg:block">
            ↑↓←→ Move &nbsp;•&nbsp; ENTER: Interrogate when near a site
          </div>
          {/* New Game button — solid background for maximum legibility */}
          <button
            onClick={() => setShowNewGameConfirm(true)}
            className="font-heading font-black text-[10px] uppercase tracking-[0.2em] px-4 py-1.5 rounded-sm transition-all hover:scale-105"
            style={{
              color: "var(--bg)",
              background: "var(--accent)",
              border: "1px solid color-mix(in srgb, var(--accent) 80%, black)",
              boxShadow: "0 0 12px color-mix(in srgb, var(--accent) 30%, transparent)"
            }}
          >
            New Game
          </button>
        </div>
      </div>

      {/* ── Grid ───────────────────────────────────────────────────────────── */}
      <div className="relative flex-1 w-full overflow-hidden" style={{ minHeight: "70vh" }}>

        {/* Background image — dimmed & blurred so icons remain the focal point */}
        <div
          className="absolute inset-0 z-0 scale-[1.04]"
          style={{
            backgroundImage: `url('${BG_IMAGES[theme] || BG_IMAGES["lantern-dusk"]}')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "blur(2px) brightness(0.55) saturate(0.7)",
          }}
        />

        {/* Semi-opaque overlay to push icons forward */}
        <div className="absolute inset-0 z-[1] bg-black/40" />

        {/* Subtle dot grid for depth */}
        <div
          className="absolute inset-0 opacity-[0.04] z-[2]"
          style={{
            backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        {/* Spots */}
        {spots.map((spot) => {
          const state = spotStates[spot.id] ?? "hidden";
          const d = dist(px, py, spot.pos_x, spot.pos_y);
          const near    = d <= GLOW_RADIUS;
          const visible = d <= FOG_RADIUS;
          const explored = state === "spy" || state === "safe";

          // ── Tier sizing ────────────────────────────────────────────────────
          // near    : player is directly adjacent — full reveal, large
          // visible : within fog radius — semi-revealed, medium
          // far     : outside fog radius — "distant lantern" effect; dim but discoverable
          const iconSize  = near ? "text-6xl" : visible ? "text-4xl" : "text-2xl";
          const badgeIcon = state === "spy" ? "👺" : state === "safe" ? "✅" : null;
          const badgeSize = near ? "text-3xl" : visible ? "text-2xl" : "text-lg";

          // ── Animate values per tier ────────────────────────────────────────
          const tierScale   = near ? 1.55 : visible ? 1.15 : 0.9;
          // Far spots are raised to 0.50 so they're clearly visible through fog
          const tierOpacity = near ? 1.0  : visible ? 0.88 : 0.50;
          // Far gets 1.5px blur (readable), visible gets 0.5px (almost crisp)
          const tierBlur    = near ? 0    : visible ? 0.5  : 1.5;

          // ── Drop-shadow per tier ───────────────────────────────────────────
          // Near: accent-colored glow + white halo
          // Visible: warm white to contrast dark bg 
          // Far: accent-tinted glow specifically designed to punch through the fog overlay
          const iconFilter = near
            ? `drop-shadow(0 0 18px var(--accent)) drop-shadow(0 0 8px white) drop-shadow(0 3px 8px rgba(0,0,0,0.95))`
            : visible
              ? `drop-shadow(0 0 10px rgba(255,220,130,0.7)) drop-shadow(0 2px 5px rgba(0,0,0,0.95))`
              : `drop-shadow(0 0 14px var(--accent)) drop-shadow(0 0 6px rgba(255,200,100,0.8)) drop-shadow(0 2px 4px rgba(0,0,0,0.9))`;
              // ^ Far gets the strongest colored glow to pierce the fog

          return (
            <motion.div
              key={spot.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-10 cursor-pointer"
              style={{ left: `${spot.pos_x}%`, top: `${spot.pos_y}%` }}
              animate={{
                scale:   tierScale,
                opacity: tierOpacity,
                filter:  `blur(${tierBlur}px)`,
              }}
              transition={{ duration: 0.3 }}
              onClick={() => {
                if (near && !banner && !showFight && !detailSpot) performInterrogation(spot);
              }}
            >
              <div className="flex flex-col items-center gap-0.5">
                {/* Explored badge — floats ABOVE the original icon */}
                {explored && (
                  <motion.div
                    initial={{ scale: 0, y: 4 }}
                    animate={{ scale: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    className={`${badgeSize} leading-none`}
                    style={{
                      filter: "drop-shadow(0 0 8px rgba(255,255,255,0.9)) drop-shadow(0 2px 4px rgba(0,0,0,0.8))",
                    }}
                  >
                    {badgeIcon}
                  </motion.div>
                )}

                {/* Pulsing beacon ring behind far/visible icons — "lantern in the fog" */}
                {!near && (
                  <div
                    className="absolute inset-0 -z-10 flex items-center justify-center pointer-events-none"
                    style={{
                      // Shift up slightly to sit behind the icon, not the badge
                      top: explored ? "40%" : "50%",
                      transform: "translate(-50%, -50%)",
                      left: "50%",
                    }}
                  >
                    <div
                      className="beacon-pulse rounded-full"
                      style={{
                        width:  visible ? "2.8rem" : "2rem",
                        height: visible ? "2.8rem" : "2rem",
                        background: "radial-gradient(circle, color-mix(in srgb, var(--accent) 60%, transparent) 0%, transparent 70%)",
                      }}
                    />
                  </div>
                )}

                {/* Original spot icon — always visible */}
                <div
                  className={`${iconSize} transition-all leading-none relative`}
                  style={{ filter: iconFilter }}
                >
                  {spot.icon}
                </div>

                {/* Name label shown when near */}
                {near && (
                  <span className="text-[9px] font-black uppercase tracking-[0.15em] text-[var(--accent)] bg-black/85 px-2 py-0.5 rounded backdrop-blur-sm whitespace-nowrap shadow-md border border-[var(--accent)]/20">
                    {spot.name}
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}

        {/* Player — Samurai icon, larger */}
        <motion.div
          className="absolute z-20 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          animate={{ left: `${px}%`, top: `${py}%` }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="relative">
            {/* Outer aura ring */}
            <div
              className="animate-aura absolute -inset-4 rounded-full blur-2xl"
              style={{ background: "var(--accent)", opacity: 0.45 }}
            />
            {/* Inner bright ring */}
            <div
              className="absolute -inset-1.5 rounded-full blur-sm"
              style={{ background: "var(--accent)", opacity: 0.25 }}
            />
            {/* The samurai — very large for high visibility */}
            <div className="relative text-7xl drop-shadow-[0_0_16px_black] scale-x-[-1] leading-none">
              🥷
            </div>
          </div>
        </motion.div>

        {/* Light fog mask */}
        <div className="fog-mask absolute inset-0 pointer-events-none z-[15]" style={fogStyle} />
      </div>

      {/* ── Overlays ───────────────────────────────────────────────────────── */}
      <AnimatePresence>

        {/* Fight animation */}
        {showFight && <FightAnimation onComplete={handleFightComplete} />}

        {/* Result banner — no button, press Enter to advance to details */}
        {banner && !showFight && (
          <motion.div
            key="banner"
            className="fixed inset-0 flex items-center justify-center z-[110] px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleShowDetails} />
            <div className="relative z-10 w-full max-w-md">
              <ScrollBanner type={banner.type} message={banner.title}>
                <div className="space-y-5 w-full">
                  <p className="text-sm font-serif leading-relaxed text-center">{banner.subtitle}</p>
                  {/* No button — keyboard-driven only */}
                  <p
                    className="text-center text-[10px] uppercase tracking-[0.25em] opacity-50 font-mono"
                    style={{ color: "inherit" }}
                  >
                    ↵ Press Enter to continue
                  </p>
                </div>
              </ScrollBanner>
            </div>
          </motion.div>
        )}

        {/* Detail card — Enter/Click outside closes */}
        {detailSpot && (
          <motion.div
            className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/82 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDetailSpot(null)}
          >
            <motion.div
              className="w-full max-w-md rounded-sm overflow-hidden shadow-2xl"
              initial={{ y: 20, scale: 0.97 }}
              animate={{ y: 0, scale: 1 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              onClick={e => e.stopPropagation()}
              style={{ border: "1px solid rgba(212,175,55,0.25)" }}
            >
              <div className="w-full h-44 bg-black/40 overflow-hidden flex items-center justify-center relative">
                {detailSpot.image_uri
                  ? <img src={detailSpot.image_uri} className="w-full h-full object-cover opacity-80" alt={detailSpot.name} />
                  : <span className="text-8xl opacity-20 select-none">{detailSpot.icon}</span>
                }
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60" />
                <div className="absolute bottom-4 left-5">
                  <p className="text-[9px] uppercase tracking-[0.35em] font-black" style={{ color: "var(--accent)", opacity: 0.8 }}>
                    {detailSpot.category}
                  </p>
                </div>
              </div>
              <div className="p-6 space-y-4" style={{ background: "var(--bg)" }}>
                <h3 className="font-heading text-2xl font-black tracking-wide" style={{ color: "var(--text)" }}>
                  {detailSpot.name}
                </h3>
                <p className="text-sm leading-relaxed opacity-70 font-serif">{detailSpot.trivia}</p>
                <div className="h-px bg-gradient-to-r from-transparent via-[var(--accent)]/30 to-transparent" />
                <button
                  className="w-full font-heading font-black text-xs uppercase tracking-widest py-3 border transition-all hover:opacity-70 flex items-center justify-center gap-3"
                  style={{ borderColor: "rgba(255,255,255,0.1)", color: "var(--text)", background: "rgba(255,255,255,0.04)" }}
                  onClick={() => setDetailSpot(null)}
                >
                  Close <span className="opacity-40 text-[9px]">[Enter]</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Victory screen */}
        {gameOver && (
          <motion.div
            className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="w-full max-w-xl text-center">
              <ScrollBanner type="victory" message="SHOGUN VICTORIOUS">
                <div className="space-y-6 pt-2">
                  <p className="text-sm font-serif italic">
                    Your scouting of {mapId} is complete. The spies have been vanquished.
                  </p>
                  <div className="flex justify-center gap-12 font-bold tracking-widest uppercase text-xs border-y border-current/15 py-4">
                    <div>Time: {formatTime(seconds)}</div>
                    <div>Spies: 5/5</div>
                    <div>Sites: {visitedCount}/20</div>
                  </div>
                  <div className="flex gap-4 justify-center pt-4">
                    <button
                      className="font-heading font-black text-xs uppercase tracking-widest px-8 py-3 transition hover:scale-105"
                      style={{ background: "#4a3520", color: "#fdf3e7", border: "1.5px solid #8b6914" }}
                      onClick={() => window.location.reload()}
                    >
                      Play Again
                    </button>
                    <button
                      className="font-heading font-black text-xs uppercase tracking-widest px-8 py-3 transition hover:scale-105"
                      style={{ background: "#4a3520", color: "#fdf3e7", border: "1.5px solid #8b6914" }}
                      onClick={() => { window.location.href = "/war-room"; }}
                    >
                      Return to War Room
                    </button>
                  </div>
                </div>
              </ScrollBanner>
            </div>
          </motion.div>
        )}

      </AnimatePresence>

      {/* ── New Game Confirmation Modal ────────────────────────────────────── */}
      <AnimatePresence>
        {showNewGameConfirm && (
          <motion.div
            key="new-game-confirm"
            className="fixed inset-0 z-[150] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setShowNewGameConfirm(false)} />
            <motion.div
              className="relative z-10 w-full max-w-sm rounded-sm overflow-hidden shadow-2xl text-center"
              initial={{ scale: 0.92, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 16 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              style={{ background: "var(--bg)", border: "1px solid color-mix(in srgb, var(--accent) 30%, transparent)" }}
            >
              <div className="px-8 py-6 space-y-5">
                <div className="text-4xl">⚔️</div>
                <h3 className="font-heading font-black text-lg uppercase tracking-[0.15em]" style={{ color: "var(--accent)" }}>
                  Abandon Mission?
                </h3>
                <p className="text-sm opacity-60 font-serif leading-relaxed">
                  Your current progress will be lost. Return to the Territory Selection screen to choose a new mission.
                </p>
                <div className="h-px bg-gradient-to-r from-transparent via-[var(--accent)]/25 to-transparent" />
                <div className="flex gap-3">
                  <button
                    className="flex-1 font-heading font-black text-[10px] uppercase tracking-[0.2em] py-2.5 rounded-sm border transition-all hover:opacity-70"
                    style={{ borderColor: "rgba(255,255,255,0.1)", color: "var(--text)", background: "rgba(255,255,255,0.04)" }}
                    onClick={() => setShowNewGameConfirm(false)}
                  >
                    Keep Playing
                  </button>
                  <button
                    className="flex-1 font-heading font-black text-[10px] uppercase tracking-[0.2em] py-2.5 rounded-sm border transition-all hover:scale-105"
                    style={{ borderColor: "var(--accent)", color: "var(--accent)", background: "color-mix(in srgb, var(--accent) 12%, transparent)" }}
                    onClick={confirmNewGame}
                  >
                    Select Territory
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Vignette — subtle edge darkening */}
      <div className="fixed inset-0 pointer-events-none z-40 shadow-[inset_0_0_80px_rgba(0,0,0,0.5)]" />
    </div>
  );
}
