"use client";

import { motion } from "framer-motion";
import React from "react";

/**
 * ScrollBanner — Reimagined as an ancient ink-on-silk handscroll.
 * 
 * Design language: Traditional Japanese emaki (picture scroll) with:
 * - Warm ivory/sepia ground, not parchment image
 * - Ink brushstroke border via pure CSS box-shadow + border
 * - Roller ends (maki-e) as decorative side pillars
 * - Clean sepia typography that reads crisp on the ground color
 */

interface ScrollBannerProps {
  type: "victory" | "safe" | "mission" | "info";
  message?: string;
  children?: React.ReactNode;
}

const TYPE_CONFIG = {
  victory: { accent: "#8b1a1a", ground: "from-[#fdf3e7] via-[#f5e6c8] to-[#fdf3e7]" },
  safe:    { accent: "#3a5a40", ground: "from-[#f0f4eb] via-[#e5eedd] to-[#f0f4eb]" },
  mission: { accent: "#4a3520", ground: "from-[#fdf3e7] via-[#f0dfc0] to-[#fdf3e7]" },
  info:    { accent: "#2c3e50", ground: "from-[#f4f1eb] via-[#ede8df] to-[#f4f1eb]" },
};

export default function ScrollBanner({ type, message, children }: ScrollBannerProps) {
  const config = TYPE_CONFIG[type];

  return (
    <motion.div
      initial={{ scaleX: 0.2, opacity: 0 }}
      animate={{ scaleX: 1, opacity: 1 }}
      exit={{ scaleX: 0.2, opacity: 0 }}
      transition={{ duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
      className="relative mx-auto my-2 w-full"
      style={{ transformOrigin: "center" }}
    >
      {/* Outer scroll frame — mimics the double border of an emaki */}
      <div
        className="relative overflow-visible"
        style={{
          filter: "drop-shadow(0 4px 24px rgba(0,0,0,0.35)) drop-shadow(0 1px 2px rgba(0,0,0,0.2))",
        }}
      >
        {/* Left roller end (maki) */}
        <div
          className="absolute -left-3 top-0 bottom-0 w-3 rounded-l-full z-10"
          style={{
            background: `linear-gradient(to right, ${config.accent}cc, ${config.accent}88, ${config.accent}cc)`,
            boxShadow: `inset -1px 0 2px rgba(0,0,0,0.3), 2px 0 4px rgba(0,0,0,0.15)`,
          }}
        />
        {/* Right roller end (maki) */}
        <div
          className="absolute -right-3 top-0 bottom-0 w-3 rounded-r-full z-10"
          style={{
            background: `linear-gradient(to left, ${config.accent}cc, ${config.accent}88, ${config.accent}cc)`,
            boxShadow: `inset 1px 0 2px rgba(0,0,0,0.3), -2px 0 4px rgba(0,0,0,0.15)`,
          }}
        />

        {/* Main scroll body */}
        <div
          className={`relative bg-gradient-to-r ${config.ground} px-8 py-6 md:px-12 md:py-8`}
          style={{
            borderTop: `2px solid ${config.accent}55`,
            borderBottom: `2px solid ${config.accent}55`,
          }}
        >
          {/* Ink brushstroke top/bottom lines — simulate the silk binding */}
          <div
            className="absolute inset-x-0 top-0 h-[3px]"
            style={{
              background: `linear-gradient(to right, transparent, ${config.accent}40, ${config.accent}80, ${config.accent}40, transparent)`,
            }}
          />
          <div
            className="absolute inset-x-0 bottom-0 h-[3px]"
            style={{
              background: `linear-gradient(to right, transparent, ${config.accent}40, ${config.accent}80, ${config.accent}40, transparent)`,
            }}
          />

          {/* Subtle grain overlay — CSS only, no image */}
          <div
            className="absolute inset-0 opacity-[0.04] pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
              backgroundSize: "128px 128px",
            }}
          />

          {/* Content */}
          <div className="relative z-10 text-center w-full">
            {message && (
              <p
                className="font-bold leading-snug tracking-wide"
                style={{
                  color: config.accent,
                  fontSize: "clamp(1rem, 3vw, 1.5rem)",
                  textShadow: "0 1px 0 rgba(255,255,255,0.5)",
                  fontFamily: "'Kaisei Decol', serif",
                  letterSpacing: "0.05em",
                }}
              >
                {message}
              </p>
            )}
            {children && (
              <div
                className="mt-4 w-full flex justify-center"
                style={{
                  color: config.accent,
                  fontFamily: "'IM Fell English SC', 'Noto Serif JP', serif",
                }}
              >
                {children}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
