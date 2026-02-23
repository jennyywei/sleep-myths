"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import StarField from "@/components/StarField";

const floatingWords = [
  { text: "REM Sleep", x: "8%", y: "18%", delay: 0 },
  { text: "Melatonin", x: "68%", y: "13%", delay: 0.6 },
  { text: "Circadian", x: "78%", y: "62%", delay: 1.1 },
  { text: "Delta Waves", x: "4%", y: "68%", delay: 1.6 },
  { text: "Narcolepsy", x: "42%", y: "78%", delay: 0.9 },
];

export default function LandingPage() {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-4">
      <StarField />

      {/* Ambient orbs */}
      <div className="fixed top-0 left-1/4 w-96 h-96 rounded-full bg-violet-600/10 blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-80 h-80 rounded-full bg-cyan-600/10 blur-3xl pointer-events-none" />

      {/* Floating word bubbles in background */}
      {floatingWords.map((c, i) => (
        <motion.div
          key={i}
          className="fixed pointer-events-none"
          style={{ left: c.x, top: c.y }}
          animate={{ y: [0, -14, 0] }}
          transition={{ duration: 3 + i * 0.4, delay: c.delay, repeat: Infinity, ease: "easeInOut" }}
        >
          <div
            className="px-4 py-2 rounded-3xl bg-white/5 border border-white/10 text-white/25 text-sm backdrop-blur-sm"
            style={{ fontFamily: "'Gaegu', cursive" }}
          >
            {c.text}
          </div>
        </motion.div>
      ))}

      {/* Main card */}
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center gap-8 max-w-md w-full text-center"
      >
        {/* Title */}
        <div className="flex flex-col items-center gap-2">
          <h1
            className="leading-tight"
            style={{
              fontFamily: "'Gaegu', cursive",
              fontSize: "clamp(3.5rem, 12vw, 5.5rem)",
              background: "linear-gradient(135deg, #c084fc 0%, #38bdf8 50%, #34d399 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              filter: "drop-shadow(0 0 28px rgba(192,132,252,0.45))",
            }}
          >
            Dream
            <br />
            Blaster
          </h1>
          <p
            className="text-white/45 tracking-widest uppercase text-xs"
            style={{ fontFamily: "'Gaegu', cursive" }}
          >
            Sleep Science Arcade
          </p>
        </div>

        {/* How to play */}
        <div className="glass-panel rounded-2xl px-6 py-4 w-full text-left space-y-2">
          <p
            className="text-white/40 text-xs uppercase tracking-widest mb-3"
            style={{ fontFamily: "'Gaegu', cursive" }}
          >
            How to play
          </p>
          {[
            ["Blast the correct floating dream bubble"],
            ["Keys 1-4 for quick answers"],
            ["Build streaks for bonus points"],
            ["5 health segments — wrong costs one"],
            ["60 seconds — correct adds time"],
          ].map(([text]) => (
            <div
              key={text}
              className="flex items-start gap-2.5 text-sm text-white/65"
              style={{ fontFamily: "'Gaegu', cursive" }}
            >
              <span className="text-violet-400 mt-0.5 shrink-0">—</span>
              <span>{text}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <Link href="/play" className="flex-1">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="w-full py-4 rounded-2xl text-white text-xl"
              style={{
                fontFamily: "'Gaegu', cursive",
                background: "linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)",
                boxShadow: "0 0 30px rgba(124,58,237,0.5), 0 4px 20px rgba(0,0,0,0.35)",
              }}
            >
              Play
            </motion.button>
          </Link>

          <Link href="/leaderboard" className="flex-1">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="w-full py-4 rounded-2xl text-white/75 glass-panel border border-white/20 text-lg"
              style={{ fontFamily: "'Gaegu', cursive" }}
            >
              Leaderboard
            </motion.button>
          </Link>
        </div>
      </motion.div>
    </main>
  );
}
