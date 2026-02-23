"use client";

import { motion, AnimatePresence } from "framer-motion";

interface CountdownProps {
  value: number; // 3, 2, 1, 0 (0 = "GO!")
}

export default function Countdown({ value }: CountdownProps) {
  const label = value === 0 ? "GO!" : String(value);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <AnimatePresence mode="wait">
        <motion.div
          key={label}
          initial={{ scale: 2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20, duration: 0.4 }}
          className="flex flex-col items-center"
        >
          <span
            className={`font-black tracking-tight select-none ${
              value === 0
                ? "text-9xl text-green-300 drop-shadow-[0_0_40px_rgba(74,222,128,0.8)]"
                : "text-[10rem] text-white drop-shadow-[0_0_30px_rgba(168,85,247,0.8)]"
            }`}
          >
            {label}
          </span>
          {value > 0 && (
            <motion.div
              className="h-1 bg-violet-500 rounded-full mt-2"
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: 0.9, ease: "linear" }}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
