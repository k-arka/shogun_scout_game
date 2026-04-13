'use client';

import React, { useState } from 'react';
import React, { useState } from 'react';

/**
 * SHOGUN'S SCOUT - STYLE PREVIEW
 * This component visualizes the visual soul of the RPG game.
 * It showcases traditional Japanese typography, themes, and HUD elements.
 */

const THEMES = [
  { id: 'nature-mist', name: 'Nature Mist', color: 'bg-[#f4ecdf]', text: 'text-[#2f3e46]', fog: 'bg-[#f4ecdf]/80', accent: 'border-[#52796f] text-[#52796f]' },
  { id: 'lantern-dusk', name: 'Lantern Dusk', color: 'bg-indigo-950/90', text: 'text-orange-50', fog: 'indigo-900/40', accent: 'border-orange-500 text-orange-500' },
  { id: 'cyber-smoke', name: 'Cyber Smoke', color: 'bg-slate-900/95', text: 'text-cyan-400', fog: 'cyan-900/20', accent: 'border-cyan-400 text-cyan-400' },
  { id: 'castle-shadows', name: 'Castle Shadows', color: 'bg-black/95', text: 'text-stone-300', fog: 'stone-950/60', accent: 'border-amber-500 text-amber-500' },
];

export default function StylePreview() {
  const [activeTheme, setActiveTheme] = useState(THEMES[0]); // Default to Nature Mist

  return (
    <div className={`min-h-screen p-8 transition-colors duration-700 ${activeTheme.color} ${activeTheme.text} font-sans relative`}>
      {/* Ukiyo-e Texture Overlay */}
      <div className="pointer-events-none fixed inset-0 z-0 opacity-10 mix-blend-multiply" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E")` }}>
      </div>

      <div className="max-w-6xl mx-auto relative z-10 flex flex-col md:flex-row-reverse gap-12">
        <header className="flex flex-col items-center border-l border-black/10 pl-8 shrink-0 font-[Kaisei_Decol]">
            <h1 className={`style={{ writingMode: 'vertical-rl' }} text-6xl font-black tracking-widest mb-6 py-4 uppercase ${activeTheme.text}`}>
                SHOGUN'S SCOUT
            </h1>
            <p className="style={{ writingMode: 'vertical-rl' }} text-sm uppercase tracking-[0.4em] opacity-60">MISSION BRIEFING</p>
            
            <div className="flex flex-col gap-4 mt-12 w-full">
            {THEMES.map((theme) => (
              <button
                key={theme.id}
                onClick={() => setActiveTheme(theme)}
                className={`px-2 py-4 border text-[10px] font-bold uppercase transition-all mx-auto`}
                style={{ writingMode: 'vertical-rl' }}
              >
                {theme.name}
              </button>
            ))}
            </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-12 flex-grow">
          <div className="lg:col-span-8 space-y-12">
        
        {/* Left Column: Typography & Controls */}
        <section className="space-y-12">
          <div>
            <h2 className="text-xs font-black uppercase tracking-tighter mb-6 opacity-40 border-l-2 border-amber-500 pl-4">Typography</h2>
            <div className="space-y-4">
              <h3 className="text-4xl font-bold italic">Bushido Briefing</h3>
              <p className="text-lg leading-relaxed opacity-80 decoration-amber-500/20 underline underline-offset-8">
                "Spies have infiltrated the Shogunate's territories. You have been dispatched to 5 key locations to eliminate them."
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-xs font-black uppercase tracking-tighter mb-6 opacity-40 border-l-2 border-amber-500 pl-4">Interaction HUD</h2>
            <div className="bg-black/40 p-4 border border-white/10 backdrop-blur-md flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <span className="text-amber-500">📜</span>
                <span className="text-xs font-bold uppercase tracking-wider">
                  Arrows: Move | [Enter]: Report | [I]: Interrogate
                </span>
              </div>
              <div className="flex justify-between items-center text-sm font-mono tracking-tighter">
                <div className="flex items-center gap-2">
                  <span className="text-lg">⏳</span> 04:12:87
                </div>
                <div className="flex items-center gap-2 text-amber-500">
                  <span className="text-lg">👺</span> Spies: 2 / 5
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Center Column: Landmarks & Action */}
        <section className="space-y-12">
          <div>
            <h2 className="text-xs font-black uppercase tracking-tighter mb-6 opacity-40 border-l-2 border-amber-500 pl-4">Map Artifacts</h2>
            <div className="grid grid-cols-2 gap-4 font-[Kaisei_Decol]">
              <div className="border border-white/10 p-4 flex flex-col items-center gap-2 hover:bg-white/5 transition-colors">
                 <div className="text-3xl">⛩️</div>
                 <span className="text-xs uppercase font-bold tracking-widest">Shrine</span>
              </div>
              <div className="border border-white/10 p-4 flex flex-col items-center gap-2 hover:bg-white/5 transition-colors">
                 <div className="text-3xl">🏯</div>
                 <span className="text-xs uppercase font-bold tracking-widest">Fortress</span>
              </div>
              <div className="border border-red-500/30 p-4 flex flex-col items-center gap-2 bg-red-900/20 cursor-pointer hover:border-red-500">
                 <div className="text-3xl text-red-500">👺</div>
                 <span className="text-xs uppercase font-bold text-red-500 tracking-widest">Spy Located</span>
              </div>
              <div className="border border-emerald-500/30 p-4 flex flex-col items-center gap-2 opacity-50 bg-emerald-900/10">
                 <div className="text-3xl text-emerald-500">✅</div>
                 <span className="text-xs uppercase font-bold text-emerald-500 tracking-widest">Safe Spot</span>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xs font-black uppercase tracking-tighter mb-6 opacity-40 border-l-2 border-amber-500 pl-4">Action Buttons</h2>
            <div className="flex flex-col gap-4">
              <button className="w-full bg-amber-600 hover:bg-amber-500 text-black font-black uppercase py-4 transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:scale-[1.02] active:scale-[0.98]">
                Proceed to War Room
              </button>
              <button className="w-full border border-white/20 hover:border-white text-white font-bold uppercase py-3 transition-all">
                End Mission
              </button>
            </div>
          </div>
        </section>

        {/* Right Column: Fog of War Simulation */}
        <section className="space-y-12">
          <div>
            <h2 className="text-xs font-black uppercase tracking-tighter mb-6 opacity-40 border-l-2 border-amber-500 pl-4">Fog of War Rendering</h2>
            <div className="relative aspect-square bg-black border border-white/10 overflow-hidden">
               {/* 100x100 Grid Lines */}
               <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '10px 10px' }}></div>
               
               {/* Simulated Landmark icon in fog */}
               <div className="absolute top-1/4 left-1/3 opacity-20 text-3xl">
                 ⛩️
               </div>

               {/* Vision Radius Blur Gradient */}
               <div className="absolute inset-x-0 inset-y-0 pointer-events-none" style={{ background: `radial-gradient(circle at 50% 50%, transparent 0, transparent 20%, currentColor 60%)` }}></div>
               
               {/* Player Icon */}
               <div className="absolute top-1/2 left-1/2 -ml-3 -mt-3 text-amber-500 animate-pulse">
                 <div className="border-4 border-amber-500 rounded-full h-6 w-6"></div>
               </div>

               <div className="absolute bottom-4 left-4">
                 <span className="text-lg opacity-50 mb-1">👁️</span>
                 <div className="text-[10px] uppercase font-bold opacity-50 leading-none tracking-widest">Vision Active</div>
               </div>
            </div>
            <p className="mt-4 text-[11px] leading-tight opacity-50 italic uppercase tracking-tighter">
              The Fog Transition (15-20 Units) uses a linear alpha gradient matching the active theme color palette.
            </p>
          </div>
        </section>

      </main>
      </div>

      <footer className="max-w-6xl mx-auto mt-24 pt-8 border-t border-black/10 flex justify-between items-center opacity-30 text-[10px] font-bold uppercase tracking-[0.2em] relative z-10">
         <div>© 2026 Shogun's Scout Engine</div>
         <div className="flex gap-8">
           <span>Performance: Optimized</span>
           <span>Style: Verified</span>
           <span>Asset Type: Vector/Static</span>
         </div>
      </footer>
    </div>
  );
}
