"use client";

import { useState } from "react";
import { useQueryState } from "nuqs";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

/**
 * War Room — v3
 * - Sakura + Fuji theme background on both steps
 * - Appearance cards compact (no scroll needed)
 * - Selected appearance is preserved when going back
 * - Sticky CTA always visible
 */

const MAPS = [
  { id: "tokyo",           label: "Tokyo",    subtitle: "Edo Shadows",    kanji: "東京" },
  { id: "kyoto",           label: "Kyoto",    subtitle: "Ancient Capital", kanji: "京都" },
  { id: "osaka",           label: "Osaka",    subtitle: "Merchant City",   kanji: "大阪" },
  { id: "hokkaido",        label: "Hokkaido", subtitle: "Northern Wilds",  kanji: "北海道" },
  { id: "fuji_viewpoints", label: "Fuji",     subtitle: "Sacred Heights",  kanji: "富士" },
] as const;

const THEMES = [
  { id: "nature-mist",    label: "Nature Mist",    desc: "Mossy parchment & matcha" },
  { id: "lantern-dusk",   label: "Lantern Dusk",   desc: "Indigo midnight & lantern fire" },
  { id: "cyber-smoke",    label: "Cyber Smoke",    desc: "Neon cyan in digital void" },
  { id: "castle-shadows", label: "Castle Shadows", desc: "Obsidian & antique gold" },
] as const;

/** Dispatches a live theme preview event to ThemeWrapper */
function emitPreview(themeId: string | null) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("shogun-theme-preview", { detail: themeId }));
  }
}

export default function WarRoomPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedMap, setSelectedMap] = useQueryState("map");
  const [selectedTheme, setSelectedTheme] = useQueryState("theme");

  const currentTheme = selectedTheme || "lantern-dusk";

  // Navigate back — preserves selectedTheme
  function goBack() {
    setStep(1);
    emitPreview(null);
  }

  return (
    <main className="h-screen relative flex flex-col bg-[var(--bg)] text-[var(--text)] overflow-hidden">

      {/* ── Sakura + Fuji background (both steps) ── */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Mt. Fuji silhouette */}
        <svg
          viewBox="0 0 1200 600"
          fill="currentColor"
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full opacity-[0.07]"
          style={{ color: "var(--text)" }}
          preserveAspectRatio="xMidYMax meet"
        >
          <path d="M600 80 L150 600 L1050 600 Z" />
          <path d="M600 80 L490 260 L710 260 Z" opacity="0.6" />
          {/* Snow cap */}
          <path d="M600 80 L550 180 L650 180 Z" opacity="0.9" />
        </svg>

        {/* Sakura petals — CSS animated */}
        {[...Array(14)].map((_, i) => (
          <div
            key={i}
            className="animate-petal text-pink-300 select-none pointer-events-none"
            style={{
              left: `${(i * 7.3) % 100}%`,
              fontSize: `${12 + (i % 4) * 4}px`,
              animationDelay: `${(i * 1.1) % 9}s`,
              animationDuration: `${7 + (i % 5)}s`,
              opacity: 0.25,
              position: "absolute",
            }}
          >
            🌸
          </div>
        ))}

        {/* Horizontal branch with blossoms — top-left decoration */}
        <svg
          viewBox="0 0 400 200"
          className="absolute -top-4 -left-8 w-80 opacity-[0.12]"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M0 150 Q80 120 160 100 Q240 80 320 60 Q360 50 400 40" strokeLinecap="round"/>
          <path d="M80 130 Q60 110 50 90" strokeLinecap="round"/>
          <path d="M160 110 Q140 90 135 70" strokeLinecap="round"/>
          <path d="M240 90 Q220 70 215 50" strokeLinecap="round"/>
          <circle cx="50" cy="90" r="8" fill="currentColor" opacity="0.4"/>
          <circle cx="45" cy="84" r="5" fill="currentColor" opacity="0.3"/>
          <circle cx="57" cy="86" r="4" fill="currentColor" opacity="0.3"/>
          <circle cx="135" cy="70" r="8" fill="currentColor" opacity="0.4"/>
          <circle cx="128" cy="64" r="5" fill="currentColor" opacity="0.3"/>
          <circle cx="215" cy="50" r="7" fill="currentColor" opacity="0.4"/>
        </svg>

        {/* Hanging lanterns strip */}
        <div className="absolute top-0 w-full flex justify-around px-16">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-lantern" style={{ animationDelay: `${i * 0.35}s`, opacity: 0.18 }}>
              <div className="w-px h-10 bg-current mx-auto opacity-40" />
              <div className="w-4 h-6 bg-red-900 rounded-t-sm rounded-b-full border border-orange-600/40 shadow-[0_0_8px_rgba(200,50,20,0.3)]" />
            </div>
          ))}
        </div>
      </div>

      {/* ── Page header ── */}
      <header className="relative z-20 flex items-center justify-between px-8 pt-8 pb-3 shrink-0">
        <button
          onClick={() => router.push("/")}
          className="text-[10px] uppercase tracking-[0.3em] opacity-40 hover:opacity-80 transition-opacity"
        >
          ← Home
        </button>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.2 }}
            className="text-center"
          >
            <p className="text-[9px] uppercase tracking-[0.45em] opacity-40 font-black mb-1">Step {step} of 2</p>
            <h1 className="font-heading text-2xl md:text-3xl font-black tracking-widest" style={{ color: "var(--accent)" }}>
              {step === 1 ? "Choose Territory" : "Choose Appearance"}
            </h1>
            <div className="h-px w-28 mx-auto bg-gradient-to-r from-transparent via-[var(--accent)]/50 to-transparent mt-1.5" />
          </motion.div>
        </AnimatePresence>

        <div className="w-16 opacity-0 pointer-events-none">·</div>
      </header>

      {/* ── Scrollable content ── */}
      <div className="relative z-10 flex-1 overflow-y-auto overscroll-contain px-6 md:px-10 pb-28" style={{ minHeight: 0 }}>
        <AnimatePresence mode="wait">

          {/* STEP 1 — Territory */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -30, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="max-w-4xl mx-auto pt-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {MAPS.map((m) => {
                  const sel = selectedMap === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => setSelectedMap(m.id)}
                      className={`group relative text-left p-5 border transition-all duration-300 overflow-hidden rounded-sm ${
                        sel
                          ? "border-[var(--accent)] bg-[var(--accent)]/8 shadow-[0_0_24px_color-mix(in_srgb,var(--accent)_18%,transparent)]"
                          : "border-white/8 hover:border-[var(--accent)]/35 bg-white/3 hover:bg-white/5"
                      }`}
                    >
                      {/* Kanji watermark */}
                      <div className="absolute -right-2 -bottom-2 text-6xl font-black select-none pointer-events-none leading-none"
                           style={{ opacity: sel ? 0.08 : 0.04, color: "var(--text)" }}>
                        {m.kanji}
                      </div>

                      {sel && (
                        <div className="absolute top-3 right-3 w-2 h-2 rounded-full" style={{ background: "var(--accent)" }} />
                      )}

                      <p className="text-[9px] uppercase tracking-[0.3em] mb-1.5 font-black"
                         style={{ color: "var(--accent)", opacity: sel ? 0.9 : 0.5 }}>
                        {m.subtitle}
                      </p>
                      <h3 className="font-heading text-xl font-black tracking-wide">{m.label}</h3>
                      <p className="text-2xl mt-2 opacity-15">{m.kanji}</p>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* STEP 2 — Appearance */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -30, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="max-w-4xl mx-auto pt-3"
            >
              <button
                onClick={goBack}
                className="mb-4 text-[10px] uppercase tracking-[0.3em] opacity-40 hover:opacity-80 transition-opacity flex items-center gap-2"
              >
                ← Back to Territories
              </button>

              {/* Compact 2×2 grid — fits without scroll */}
              <div className="grid grid-cols-2 gap-3">
                {THEMES.map((t) => {
                  const sel = currentTheme === t.id;
                  return (
                    <button
                      key={t.id}
                      onMouseEnter={() => emitPreview(t.id)}
                      onMouseLeave={() => emitPreview(null)}
                      onClick={() => setSelectedTheme(t.id)}
                      className={`group relative text-left border-2 transition-all duration-300 overflow-hidden rounded-sm ${
                        sel
                          ? "border-[var(--accent)] shadow-[0_0_24px_color-mix(in_srgb,var(--accent)_22%,transparent)]"
                          : "border-white/10 hover:border-white/30 opacity-65 hover:opacity-100"
                      }`}
                      style={{ aspectRatio: "16/7" }}  /* compact landscape ratio */
                    >
                      <img
                        src={`/theme-previews/${selectedMap}/${t.id}.png`}
                        alt={t.label}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent" />

                      {sel && (
                        <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full border-2 border-white/70 flex items-center justify-center"
                             style={{ background: "var(--accent)" }}>
                          <span className="text-[8px] font-black text-white">✓</span>
                        </div>
                      )}

                      <div className="absolute bottom-3 left-4 right-4">
                        <h3 className="font-heading text-base font-black text-white tracking-wide leading-tight">{t.label}</h3>
                        <p className="text-[8px] text-white/50 uppercase tracking-[0.2em] mt-0.5">{t.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* ── Pinned CTA bar ── */}
      <div className="absolute bottom-0 inset-x-0 z-30 shrink-0">
        <div className="absolute inset-0 backdrop-blur-xl bg-[var(--bg)]/65" />
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[var(--accent)]/55 to-transparent" />

        <div className="relative flex items-center justify-between px-8 py-4">
          {/* Context label */}
          <div className="hidden md:block text-[10px] uppercase tracking-[0.28em] opacity-50 font-black">
            {step === 1 && selectedMap && (
              <>Selected: <span style={{ color: "var(--accent)" }}>{MAPS.find(m => m.id === selectedMap)?.label}</span></>
            )}
            {step === 2 && (
              <>{MAPS.find(m => m.id === selectedMap)?.label} · <span style={{ color: "var(--accent)" }}>{THEMES.find(t => t.id === currentTheme)?.label}</span></>
            )}
          </div>

          {step === 1 ? (
            <button
              disabled={!selectedMap}
              onClick={() => setStep(2)}
              className="ml-auto font-heading font-black text-sm tracking-[0.18em] uppercase px-10 py-3.5 rounded-sm transition-all duration-300 disabled:opacity-25 disabled:cursor-not-allowed"
              style={{
                background: selectedMap ? "var(--accent)" : "transparent",
                color: selectedMap ? "var(--bg)" : "var(--accent)",
                border: "2px solid var(--accent)",
                boxShadow: selectedMap ? "0 0 28px color-mix(in srgb,var(--accent) 28%,transparent)" : "none",
              }}
            >
              {selectedMap ? "Choose Appearance →" : "Select a Territory first"}
            </button>
          ) : (
            <button
              onClick={async () => { 
                emitPreview(null); 
                try {
                  const isLocal = typeof window !== "undefined" && window.location.hostname === "localhost";
                  const apiUrl = process.env.NEXT_PUBLIC_API_URL || (isLocal ? "http://localhost:8000" : "");
                  if (apiUrl) {
                    await fetch(`${apiUrl}/api/maps/${selectedMap}/randomize`, { method: "POST" });
                  }
                } catch (e) {
                  console.error("Failed to randomize map layout", e);
                }
                router.push(`/play?map=${selectedMap}&theme=${currentTheme}`); 
              }}
              className="ml-auto font-heading font-black text-sm tracking-[0.18em] uppercase px-12 py-3.5 rounded-sm transition-all duration-300 hover:scale-105"
              style={{
                background: "var(--accent)",
                color: "var(--bg)",
                border: "2px solid var(--accent)",
                boxShadow: "0 0 36px color-mix(in srgb,var(--accent) 32%,transparent)",
              }}
            >
              ⚔ Commence Scouting
            </button>
          )}
        </div>
      </div>

    </main>
  );
}
