"use client";

import { motion } from "framer-motion";

interface TimerBarProps {
  timeLeft: number;
  maxTime?: number;
}

export default function TimerBar({ timeLeft, maxTime = 60 }: TimerBarProps) {
  const pct = Math.max(0, Math.min(1, timeLeft / maxTime));

  const color =
    pct > 0.5
      ? "from-cyan-400 to-violet-500"
      : pct > 0.25
      ? "from-yellow-400 to-orange-500"
      : "from-red-500 to-pink-600";

  const isUrgent = pct <= 0.25;

  return (
    <div className="flex items-center gap-3 w-full">
      <span className="text-white/60 text-xs font-mono uppercase tracking-wider shrink-0">
        TIME
      </span>
      <div className="flex-1 h-3 rounded-full bg-white/10 overflow-hidden relative">
        <motion.div
          className={`h-full rounded-full bg-gradient-to-r ${color}`}
          style={{ width: `${pct * 100}%` }}
          animate={isUrgent ? { opacity: [1, 0.5, 1] } : { opacity: 1 }}
          transition={isUrgent ? { duration: 0.6, repeat: Infinity } : {}}
        />
      </div>
      <motion.span
        className={`text-lg font-mono font-bold shrink-0 ${
          isUrgent ? "text-red-400" : "text-white"
        }`}
        animate={isUrgent ? { scale: [1, 1.1, 1] } : { scale: 1 }}
        transition={isUrgent ? { duration: 0.6, repeat: Infinity } : {}}
      >
        {Math.ceil(timeLeft)}s
      </motion.span>
    </div>
  );
}
