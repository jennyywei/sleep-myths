"use client";

import { motion, AnimatePresence } from "framer-motion";

interface HealthBarProps {
  health: number;
  maxHealth?: number;
}

export default function HealthBar({ health, maxHealth = 5 }: HealthBarProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-white/60 text-xs font-mono uppercase tracking-wider shrink-0">
        HP
      </span>
      <div className="flex gap-1.5">
        {Array.from({ length: maxHealth }, (_, i) => (
          <AnimatePresence key={i} mode="wait">
            <motion.div
              key={i <= health - 1 ? "full" : "empty"}
              initial={{ scale: i === health ? 1.4 : 1 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              className={`w-5 h-5 rounded-sm border ${
                i <= health - 1
                  ? "bg-gradient-to-br from-rose-400 to-pink-600 border-pink-400 shadow-[0_0_8px_rgba(236,72,153,0.8)]"
                  : "bg-white/10 border-white/20"
              }`}
            />
          </AnimatePresence>
        ))}
      </div>
    </div>
  );
}
