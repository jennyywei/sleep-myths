"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useAnimation, AnimatePresence } from "framer-motion";
import type { CloudState } from "@/lib/types";

interface Particle {
  id: number;
  x: number;
  y: number;
  angle: number;
  color: string;
}

interface CloudProps {
  text: string;
  index: number;       // 0-3 for vertical lane
  speed: number;       // seconds to cross screen
  round: 1 | 2 | 3;
  onSelect: () => void;
  disabled: boolean;
}

const CLOUD_COLORS = [
  "from-violet-500/40 to-purple-600/40 border-violet-400/60",
  "from-cyan-500/40 to-blue-600/40 border-cyan-400/60",
  "from-pink-500/40 to-rose-600/40 border-pink-400/60",
  "from-amber-500/40 to-orange-600/40 border-amber-400/60",
];

const GLOW_COLORS = [
  "shadow-violet-500/50",
  "shadow-cyan-500/50",
  "shadow-pink-500/50",
  "shadow-amber-500/50",
];

const PARTICLE_COLORS = [
  "#c084fc", "#e879f9", "#38bdf8", "#34d399",
  "#fbbf24", "#f87171", "#a78bfa", "#67e8f9",
];

export default function Cloud({
  text,
  index,
  speed,
  round,
  onSelect,
  disabled,
}: CloudProps) {
  const [cloudState, setCloudState] = useState<CloudState>("idle");
  const [particles, setParticles] = useState<Particle[]>([]);
  const controls = useAnimation();
  const containerRef = useRef<HTMLDivElement>(null);
  const hasSelected = useRef(false);

  const colorClass = CLOUD_COLORS[index % CLOUD_COLORS.length];
  const glowClass = GLOW_COLORS[index % GLOW_COLORS.length];

  // Lane positions: 4 lanes across the screen height (10%, 30%, 55%, 75%)
  const laneTopPct = [12, 32, 55, 74][index % 4];

  // Wobble for round 3
  const wobble = round === 3
    ? { y: [0, -8, 6, -4, 0], transition: { duration: 1.8, repeat: Infinity, ease: "easeInOut" } }
    : {};

  useEffect(() => {
    // Animate from right to left
    const startDelay = index * 0.9; // stagger entry

    controls.start({
      x: [window.innerWidth + 200, -320],
      transition: {
        duration: speed,
        delay: startDelay,
        ease: "linear",
        repeat: Infinity,
        repeatDelay: 0.2,
      },
    });
  }, [controls, speed, index]);

  const handleClick = () => {
    if (disabled || hasSelected.current) return;
    hasSelected.current = true;
    onSelect();
  };

  const triggerCorrect = () => {
    setCloudState("correct");
    controls.stop();
    // Spawn particles
    const pts: Particle[] = Array.from({ length: 18 }, (_, i) => ({
      id: i,
      x: 0,
      y: 0,
      angle: (i / 18) * 360,
      color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
    }));
    setParticles(pts);
    setTimeout(() => setParticles([]), 800);
  };

  const triggerWrong = () => {
    setCloudState("wrong");
  };

  // Expose control methods via ref — parent calls these
  // We use a simple event bus approach: listen to custom events
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onCorrect = () => triggerCorrect();
    const onWrong = () => triggerWrong();
    el.addEventListener("cloud:correct", onCorrect);
    el.addEventListener("cloud:wrong", onWrong);
    return () => {
      el.removeEventListener("cloud:correct", onCorrect);
      el.removeEventListener("cloud:wrong", onWrong);
    };
  });

  const shakeVariants = {
    idle: { x: 0, rotate: 0 },
    wrong: {
      x: [0, -10, 10, -8, 8, -4, 4, 0],
      rotate: [0, -3, 3, -2, 2, 0],
      transition: { duration: 0.5 },
    },
    correct: { scale: [1, 1.3, 0], opacity: [1, 1, 0], transition: { duration: 0.4 } },
  };

  return (
    <motion.div
      ref={containerRef}
      className="absolute"
      style={{ top: `${laneTopPct}%`, left: 0 }}
      animate={controls}
    >
      <motion.div
        animate={round === 3 ? wobble : {}}
      >
        <motion.div
          variants={shakeVariants}
          animate={cloudState}
          className="relative"
        >
          {/* Cloud shape */}
          <motion.button
            onClick={handleClick}
            disabled={disabled}
            whileHover={disabled ? {} : { scale: 1.08 }}
            className={`
              relative w-48 px-4 py-5 rounded-[2.5rem]
              bg-gradient-to-br ${colorClass}
              border-2 backdrop-blur-md
              shadow-lg ${glowClass}
              text-white font-semibold text-sm text-center
              cursor-pointer select-none
              transition-shadow duration-200
              hover:shadow-2xl
              ${cloudState === "wrong" ? "border-red-400 bg-red-900/30" : ""}
              ${cloudState === "correct" ? "border-green-400 bg-green-900/30" : ""}
            `}
            style={{
              textShadow: "0 0 10px rgba(255,255,255,0.5)",
            }}
          >
            {/* Cloud bumps (CSS) */}
            <span
              className="absolute -top-4 left-6 w-12 h-8 rounded-full bg-white/10 border border-white/20"
              aria-hidden
            />
            <span
              className="absolute -top-6 left-16 w-16 h-10 rounded-full bg-white/10 border border-white/20"
              aria-hidden
            />
            <span
              className="absolute -top-3 right-8 w-10 h-7 rounded-full bg-white/10 border border-white/20"
              aria-hidden
            />

            {/* Keyboard hint */}
            <span className="absolute top-2 right-3 text-xs text-white/50 font-mono">
              {index + 1}
            </span>

            <span className="relative z-10 leading-snug">{text}</span>

            {/* Crack overlay for wrong */}
            {cloudState === "wrong" && (
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                viewBox="0 0 192 80"
              >
                <polyline
                  points="80,5 72,30 90,28 75,75"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="2"
                  opacity="0.8"
                />
                <polyline
                  points="120,10 130,35 115,33 125,70"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="1.5"
                  opacity="0.6"
                />
              </svg>
            )}
          </motion.button>

          {/* Particle burst */}
          <AnimatePresence>
            {particles.map((p) => (
              <motion.div
                key={p.id}
                className="absolute w-2 h-2 rounded-full pointer-events-none"
                style={{
                  backgroundColor: p.color,
                  left: "50%",
                  top: "50%",
                  zIndex: 50,
                }}
                initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
                animate={{
                  x: Math.cos((p.angle * Math.PI) / 180) * 80,
                  y: Math.sin((p.angle * Math.PI) / 180) * 80,
                  scale: 0,
                  opacity: 0,
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
