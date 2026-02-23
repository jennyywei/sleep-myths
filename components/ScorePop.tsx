"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface ScorePopProps {
  value: number;
  positive: boolean;
  trigger: number; // increment this to spawn a new pop
}

interface Pop {
  id: number;
  value: number;
  positive: boolean;
}

export default function ScorePop({ value, positive, trigger }: ScorePopProps) {
  const [pops, setPops] = useState<Pop[]>([]);

  useEffect(() => {
    if (trigger === 0) return;
    const pop: Pop = { id: trigger, value, positive };
    setPops((prev) => [...prev, pop]);
    const t = setTimeout(() => {
      setPops((prev) => prev.filter((p) => p.id !== pop.id));
    }, 900);
    return () => clearTimeout(t);
  }, [trigger, value, positive]);

  return (
    <div className="fixed top-24 right-8 pointer-events-none z-40">
      <AnimatePresence>
        {pops.map((pop) => (
          <motion.div
            key={pop.id}
            initial={{ y: 0, opacity: 1, scale: 1 }}
            animate={{ y: -60, opacity: 0, scale: 1.4 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={`text-2xl font-black ${
              pop.positive ? "text-green-300" : "text-red-400"
            } drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]`}
          >
            {pop.positive ? "+" : "-"}
            {Math.abs(pop.value)}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
