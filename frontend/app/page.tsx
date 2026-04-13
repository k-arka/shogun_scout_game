import Link from "next/link";
import ScrollBanner from "@/components/ScrollBanner";

/**
 * Splash Screen — Lantern Dusk theme, Japanese immersion
 */
export default function HomePage() {
  return (
    <main className="theme-lantern-dusk relative min-h-screen flex flex-col items-center justify-center px-6 py-16 overflow-hidden bg-[var(--bg)] text-[var(--text)]">

      {/* Castle silhouette backdrop */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-1/2 opacity-[0.07] pointer-events-none z-0">
        <svg viewBox="0 0 800 600" fill="currentColor" className="w-full h-full">
          <path d="M100 600 L150 500 L250 500 L300 400 L500 400 L550 500 L650 500 L700 600 Z" />
          <rect x="250" y="300" width="300" height="100" />
          <path d="M300 300 L350 200 L450 200 L500 300 Z" />
          <path d="M350 200 L400 120 L450 200 Z" />
        </svg>
      </div>

      {/* Falling cherry blossoms */}
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="animate-petal text-pink-300/20 text-xl select-none"
          style={{
            left: `${12 + i * 11}%`,
            animationDelay: `${i * 1.3}s`,
            animationDuration: `${8 + i * 0.7}s`,
          }}
        >
          🌸
        </div>
      ))}

      {/* Hanging lanterns — left */}
      <div className="absolute top-0 left-10 md:left-24 animate-lantern z-20">
        <div className="w-px h-28 bg-orange-950/60 mx-auto" />
        <div className="w-10 h-16 bg-red-900 rounded-t-sm rounded-b-full shadow-[0_0_24px_rgba(185,28,28,0.6)] border border-orange-500/40 flex items-center justify-center">
          <div className="w-6 h-10 border-y border-orange-400/20" />
        </div>
      </div>
      {/* Hanging lanterns — right */}
      <div className="absolute top-0 right-10 md:right-24 animate-lantern z-20" style={{ animationDelay: "1.8s" }}>
        <div className="w-px h-20 bg-orange-950/60 mx-auto" />
        <div className="w-10 h-16 bg-red-900 rounded-t-sm rounded-b-full shadow-[0_0_24px_rgba(185,28,28,0.6)] border border-orange-500/40 flex items-center justify-center">
          <div className="w-6 h-10 border-y border-orange-400/20" />
        </div>
      </div>

      {/* Vertical title — two columns to avoid overlap */}
      <div className="absolute right-4 md:right-10 top-1/2 -translate-y-1/2 z-20 flex gap-3 md:gap-5">
        <h1 className="vertical-text font-heading font-black text-4xl md:text-6xl tracking-[0.35em]"
            style={{ color: "var(--accent)", textShadow: "2px 2px 0 rgba(0,0,0,0.4)" }}>
          SHOGUN
        </h1>
        <h1 className="vertical-text font-heading font-black text-4xl md:text-6xl tracking-[0.35em] mt-10 md:mt-20"
            style={{ color: "var(--accent)", textShadow: "2px 2px 0 rgba(0,0,0,0.4)" }}>
          SCOUT
        </h1>
      </div>

      {/* Center block */}
      <div className="relative z-10 max-w-xl w-full flex flex-col gap-10 items-center text-center">

        {/* Decorative katanas */}
        <div className="flex gap-6 opacity-15 select-none">
          <span className="text-6xl -rotate-45">⚔️</span>
          <span className="text-6xl rotate-45 scale-x-[-1]">⚔️</span>
        </div>

        <div>
          <h2 className="font-heading text-3xl md:text-4xl font-black tracking-tight">Mission Briefing</h2>
          <p className="text-[10px] uppercase tracking-[0.4em] mt-2 opacity-50">Edo Castle Command Center</p>
        </div>

        {/* The vintage scroll — now looks like a real emaki */}
        <ScrollBanner type="mission">
          <div className="max-w-md mx-auto space-y-4 py-2">
            <p className="text-sm md:text-base leading-relaxed font-serif">
              Spies have infiltrated the Shogunate&apos;s territories. You have been
              dispatched to key locations across the city to eliminate them.
            </p>
            <p className="text-sm font-black italic border-t border-current/15 pt-4">
              &ldquo;Trust no one. Verify every shadow.&rdquo;
            </p>
            <div className="pt-5">
              <Link href="/war-room">
                <button
                  className="font-heading font-black tracking-[0.25em] uppercase text-sm px-10 py-3 rounded-sm transition-all duration-300 hover:scale-105"
                  style={{
                    background: "#4a3520",
                    color: "#fdf3e7",
                    border: "2px solid #8b6914",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)",
                  }}
                >
                  Commence Scouting
                </button>
              </Link>
            </div>
          </div>
        </ScrollBanner>

        {/* Steps row */}
        <div className="grid grid-cols-3 gap-8 md:gap-14 pt-4">
          {[
            { icon: "⛩️", label: "Choose Territory" },
            { icon: "🌫️", label: "Navigate Fog" },
            { icon: "👺", label: "Eliminate Spies" },
          ].map(({ icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full border border-[var(--accent)]/25 flex items-center justify-center text-2xl backdrop-blur-sm bg-white/3">
                {icon}
              </div>
              <span className="text-[9px] uppercase tracking-[0.25em] font-black opacity-50">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Vignette */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.45)_100%)] z-0" />
    </main>
  );
}
