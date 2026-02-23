"use client";

import { motion, AnimatePresence } from "framer-motion";

interface FlashOverlayProps {
  type: "correct" | "wrong" | null;
  trigger: number;
}

export default function FlashOverlay({ type, trigger }: FlashOverlayProps) {
  return (
    <AnimatePresence>
      {trigger > 0 && type && (
        <motion.div
          key={trigger}
          className="fixed inset-0 pointer-events-none z-30"
          initial={{ opacity: 0.35 }}
          animate={{ opacity: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45 }}
          style={{
            backgroundColor:
              type === "correct"
                ? "rgba(74, 222, 128, 0.2)"
                : "rgba(239, 68, 68, 0.25)",
          }}
        />
      )}
    </AnimatePresence>
  );
}
