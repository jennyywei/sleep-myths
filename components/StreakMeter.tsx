"use client";

import { motion, AnimatePresence } from "framer-motion";

interface StreakMeterProps {
  streak: number;
  multiplier: number;
}

const MAX_VISUAL = 5;

export default function StreakMeter({ streak, multiplier }: StreakMeterProps) {
  const filled = Math.min(streak, MAX_VISUAL);
  const is2x = multiplier >= 2;

  return (
    <div className="flex items-center gap-2">
      <span className="text-white/60 text-xs font-mono uppercase tracking-wider shrink-0">
        STREAK
      </span>
      <div className="flex gap-1">
        {Array.from({ length: MAX_VISUAL }, (_, i) => (
          <motion.div
            key={i}
            animate={
              i < filled
                ? { scale: [1, 1.3, 1], opacity: 1 }
                : { scale: 1, opacity: 0.25 }
            }
            transition={{ delay: i * 0.05, type: "spring", stiffness: 300 }}
            className={`w-4 h-4 rounded-sm ${
              i < filled
                ? "bg-gradient-to-br from-yellow-300 to-amber-500 shadow-[0_0_6px_rgba(251,191,36,0.9)]"
                : "bg-white/20"
            }`}
          />
        ))}
      </div>

      <AnimatePresence>
        {is2x && (
          <motion.span
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="text-xs font-bold text-yellow-300 bg-yellow-400/20 border border-yellow-400/50 px-1.5 py-0.5 rounded"
          >
            2×
          </motion.span>
        )}
        {streak >= 3 && streak < 5 && (
          <motion.span
            key="bonus"
            initial={{ x: 10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -10, opacity: 0 }}
            className="text-xs text-amber-300 font-semibold"
          >
            +50
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
