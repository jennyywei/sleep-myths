"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import StarField from "@/components/StarField";

const floatingClouds = [
  { text: "REM Sleep", x: "10%", y: "20%", delay: 0 },
  { text: "Melatonin", x: "70%", y: "15%", delay: 0.5 },
  { text: "Circadian", x: "80%", y: "65%", delay: 1 },
  { text: "Delta Waves", x: "5%", y: "70%", delay: 1.5 },
  { text: "Narcolepsy", x: "45%", y: "80%", delay: 0.8 },
];

export default function LandingPage() {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-4">
      <StarField />

      {/* Decorative ambient orbs */}
      <div className="fixed top-0 left-1/4 w-96 h-96 rounded-full bg-violet-600/10 blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-80 h-80 rounded-full bg-cyan-600/10 blur-3xl pointer-events-none" />

      {/* Floating background clouds */}
      {floatingClouds.map((c, i) => (
        <motion.div
          key={i}
          className="fixed pointer-events-none"
          style={{ left: c.x, top: c.y }}
          animate={{ y: [0, -14, 0] }}
          transition={{
            duration: 3 + i * 0.5,
            delay: c.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <div className="px-4 py-2 rounded-3xl bg-white/5 border border-white/10 text-white/30 text-sm backdrop-blur-sm">
            {c.text}
          </div>
        </motion.div>
      ))}

      {/* Main card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center gap-8 max-w-lg w-full text-center"
      >
        {/* Title */}
        <div className="flex flex-col items-center gap-2">
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="text-6xl"
          >
            🌙
          </motion.div>
          <h1
            className="text-6xl sm:text-7xl font-black tracking-tight"
            style={{
              fontFamily: "'Orbitron', monospace",
              background:
                "linear-gradient(135deg, #c084fc 0%, #38bdf8 50%, #34d399 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              textShadow: "none",
              filter: "drop-shadow(0 0 30px rgba(192, 132, 252, 0.5))",
            }}
          >
            DREAM
            <br />
            BLASTER
          </h1>
          <p className="text-white/50 text-sm tracking-widest uppercase mt-1">
            Sleep Science Arcade
          </p>
        </div>

        {/* Description */}
        <p className="text-white/70 text-base leading-relaxed max-w-sm">
          Blast the correct answer clouds before time runs out. Build streaks,
          earn multipliers, and prove your sleep science knowledge!
        </p>

        {/* Instructions preview */}
        <div className="glass-panel rounded-2xl px-6 py-4 w-full text-left space-y-2">
          <p className="text-white/40 text-xs uppercase tracking-widest mb-3">
            How to play
          </p>
          {[
            ["🎯", "Click or tap the correct floating cloud"],
            ["⚡", "Keys 1–4 for quick answers"],
            ["💥", "5 streaks = 2× score multiplier"],
            ["❤️", "5 health segments — wrong = lose 1"],
            ["⏱️", "60 seconds — correct answers add time"],
          ].map(([icon, text]) => (
            <div key={text} className="flex items-center gap-3 text-sm text-white/70">
              <span className="text-base shrink-0">{icon}</span>
              <span>{text}</span>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <Link href="/play" className="flex-1">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="w-full py-4 rounded-2xl font-black text-lg tracking-wide text-white"
              style={{
                fontFamily: "'Orbitron', monospace",
                background:
                  "linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)",
                boxShadow:
                  "0 0 30px rgba(124,58,237,0.5), 0 4px 20px rgba(0,0,0,0.4)",
              }}
            >
              PLAY NOW
            </motion.button>
          </Link>

          <Link href="/leaderboard" className="flex-1">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="w-full py-4 rounded-2xl font-semibold text-base text-white/80 glass-panel border border-white/20"
            >
              🏆 Leaderboard
            </motion.button>
          </Link>
        </div>
      </motion.div>
    </main>
  );
}
