"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

/**
 * FightAnimation — A silhouette clash between a samurai and a ninja.
 * Triggered when a spy is found during interrogation.
 */

interface Props {
  onComplete: () => void;
}

export default function FightAnimation({ onComplete }: Props) {
  const [stage, setStage] = useState<"clash" | "sparks" | "done">("clash");

  useEffect(() => {
    // Phase 1: Clash duration
    const t1 = setTimeout(() => setStage("sparks"), 400);
    // Phase 2: Total animation duration
    const t2 = setTimeout(() => {
      setStage("done");
      onComplete();
    }, 900);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none overflow-hidden bg-red-900/10 backdrop-blur-[2px]">
      <AnimatePresence>
        {stage !== "done" && (
          <>
            {/* Samurai */}
            <motion.div
              initial={{ left: "-20%", opacity: 0 }}
              animate={{ left: "40%", opacity: 1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="absolute top-1/2 -translate-y-1/2 text-[8rem] filter drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]"
            >
              ⚔️
            </motion.div>

            {/* Ninja/Spy */}
            <motion.div
              initial={{ right: "-20%", opacity: 0 }}
              animate={{ right: "40%", opacity: 1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="absolute top-1/2 -translate-y-1/2 text-[8rem] filter drop-shadow-[0_0_20px_rgba(255,0,0,0.3)] grayscale"
            >
              🥷
            </motion.div>

            {/* Impact Flash */}
            {stage === "sparks" && (
              <motion.div
                initial={{ scale: 0, opacity: 0.8 }}
                animate={{ scale: 4, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute w-64 h-64 rounded-full bg-white blur-3xl"
              />
            )}

            {/* Sparks */}
            {stage === "sparks" && (
              <div className="absolute flex items-center justify-center">
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 1, opacity: 1, rotate: i * 45 }}
                    animate={{ x: (Math.random() - 0.5) * 400, y: (Math.random() - 0.5) * 400, scale: 0, opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="absolute w-1 h-12 bg-yellow-400 rounded-full"
                    style={{ transformOrigin: "center" }}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
