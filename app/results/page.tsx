"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import StarField from "@/components/StarField";
import { loadRun, clearRun } from "@/lib/gameReducer";
import { getBadge, getBadgeEmoji } from "@/lib/types";
import { saveLocalScore } from "@/lib/leaderboard";
import type { GameState, AnswerRecord, Badge } from "@/lib/types";

// Simple UUID fallback without external dep
function makeId(): string {
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// ─── Animated counter ─────────────────────────────────────────────────────────

function CountUp({ target, duration = 1500 }: { target: number; duration?: number }) {
  const [current, setCurrent] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.round(eased * target));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return <>{current.toLocaleString()}</>;
}

// ─── Badge card ───────────────────────────────────────────────────────────────

const BADGE_STYLES: Record<Badge, { gradient: string; glow: string; border: string }> = {
  "Lucid Master": {
    gradient: "from-yellow-300 via-amber-400 to-orange-500",
    glow: "shadow-[0_0_40px_rgba(251,191,36,0.7)]",
    border: "border-yellow-400",
  },
  "Sleep Scientist": {
    gradient: "from-cyan-300 via-blue-400 to-violet-500",
    glow: "shadow-[0_0_30px_rgba(6,182,212,0.6)]",
    border: "border-cyan-400",
  },
  "Dream Apprentice": {
    gradient: "from-violet-400 via-purple-500 to-pink-500",
    glow: "shadow-[0_0_25px_rgba(139,92,246,0.6)]",
    border: "border-violet-400",
  },
  "Sleepy Intern": {
    gradient: "from-slate-400 via-gray-500 to-slate-600",
    glow: "shadow-[0_0_15px_rgba(148,163,184,0.4)]",
    border: "border-slate-400",
  },
};

// ─── Results Page ─────────────────────────────────────────────────────────────

export default function ResultsPage() {
  const router = useRouter();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [playerName, setPlayerName] = useState("");
  const [saved, setSaved] = useState(false);
  const [expandedItem, setExpandedItem] = useState<number | null>(null);

  useEffect(() => {
    const run = loadRun();
    if (!run || run.phase !== "ended") {
      router.replace("/");
      return;
    }
    setGameState(run);
  }, [router]);

  if (!gameState) {
    return (
      <main className="relative min-h-screen flex items-center justify-center">
        <StarField />
        <div className="relative z-10 text-white/50 text-sm">Loading results…</div>
      </main>
    );
  }

  const accuracy =
    gameState.answeredCount > 0
      ? gameState.correctCount / gameState.answeredCount
      : 0;

  const badge = getBadge(accuracy);
  const emoji = getBadgeEmoji(badge);
  const badgeStyle = BADGE_STYLES[badge];

  const handleSave = () => {
    if (saved || !playerName.trim()) return;
    saveLocalScore({
      id: makeId(),
      name: playerName.trim(),
      score: gameState.score,
      accuracy,
      createdAt: new Date().toISOString(),
      isLocal: true,
    });
    setSaved(true);
  };

  const handlePlayAgain = () => {
    clearRun();
    router.push("/play");
  };

  return (
    <main className="relative min-h-screen overflow-y-auto pb-16">
      <StarField />
      <div className="fixed top-0 left-1/4 w-96 h-96 rounded-full bg-violet-600/10 blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-80 h-80 rounded-full bg-cyan-600/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-2xl mx-auto px-4 pt-10 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-1"
        >
          <h1
            className="text-4xl sm:text-5xl font-black"
            style={{
              fontFamily: "'Orbitron', monospace",
              background: "linear-gradient(135deg, #c084fc, #38bdf8)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            RESULTS
          </h1>
          <p className="text-white/50 text-sm">Game complete — see how you did!</p>
        </motion.div>

        {/* Badge */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.2 }}
          className={`flex flex-col items-center gap-2 glass-panel rounded-3xl p-8 border-2 ${badgeStyle.border} ${badgeStyle.glow}`}
        >
          <span className="text-6xl">{emoji}</span>
          <span
            className={`text-2xl font-black bg-gradient-to-r ${badgeStyle.gradient} bg-clip-text text-transparent`}
            style={{ fontFamily: "'Orbitron', monospace" }}
          >
            {badge}
          </span>
          <p className="text-white/50 text-xs text-center">
            {badge === "Lucid Master" && "Extraordinary! You know your sleep science cold."}
            {badge === "Sleep Scientist" && "Impressive knowledge of sleep research!"}
            {badge === "Dream Apprentice" && "Good work — keep studying those sleep stages."}
            {badge === "Sleepy Intern" && "A little more study and you'll be dreaming big!"}
          </p>
        </motion.div>

        {/* Stats grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4"
        >
          {[
            {
              label: "Score",
              value: <CountUp target={gameState.score} />,
              color: "text-violet-300",
            },
            {
              label: "Accuracy",
              value: `${Math.round(accuracy * 100)}%`,
              color: "text-cyan-300",
            },
            {
              label: "Best Streak",
              value: gameState.bestStreak,
              color: "text-amber-300",
            },
            {
              label: "Answered",
              value: `${gameState.correctCount}/${gameState.answeredCount}`,
              color: "text-green-300",
            },
          ].map(({ label, value, color }) => (
            <div key={label} className="glass-panel rounded-2xl p-4 text-center">
              <div className={`text-2xl sm:text-3xl font-black ${color}`}>
                {value}
              </div>
              <div className="text-white/40 text-xs mt-1 uppercase tracking-wider">
                {label}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Question review */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-3"
        >
          <h2 className="text-white/60 text-sm uppercase tracking-widest font-semibold">
            Question Review
          </h2>

          {gameState.history.length === 0 && (
            <div className="glass-panel rounded-xl p-4 text-center text-white/40 text-sm">
              No questions answered this run.
            </div>
          )}

          {gameState.history.map((record: AnswerRecord, i: number) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.55 + i * 0.04 }}
            >
              <button
                onClick={() => setExpandedItem(expandedItem === i ? null : i)}
                className={`w-full text-left glass-panel rounded-xl px-4 py-3 border transition-colors ${
                  record.wasCorrect
                    ? "border-green-500/30 hover:border-green-400/50"
                    : "border-red-500/30 hover:border-red-400/50"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-lg shrink-0 mt-0.5">
                    {record.wasCorrect ? "✅" : "❌"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium leading-snug">
                      {record.question}
                    </p>
                    {!record.wasCorrect && (
                      <p className="text-red-400 text-xs mt-1">
                        Correct: <span className="font-semibold">{record.correctAnswer}</span>
                      </p>
                    )}
                  </div>
                  <span className="text-white/30 text-xs shrink-0">
                    {expandedItem === i ? "▲" : "▼"}
                  </span>
                </div>
              </button>

              <AnimatePresence>
                {expandedItem === i && record.explanation && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="glass-panel rounded-b-xl rounded-t-none px-4 py-3 border-t-0 -mt-1 border border-white/10">
                      <p className="text-white/70 text-xs leading-relaxed">
                        💡 {record.explanation}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>

        {/* Save score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          className="glass-panel rounded-2xl p-6 space-y-4"
        >
          <h2 className="text-white font-semibold">Save Your Score</h2>
          {saved ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center gap-2 text-green-300"
            >
              <span className="text-xl">✓</span>
              <span className="font-semibold">Score saved to leaderboard!</span>
            </motion.div>
          ) : (
            <div className="flex gap-3">
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleSave(); }}
                placeholder="Enter your name…"
                maxLength={24}
                className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder-white/30 text-sm outline-none focus:border-violet-400 transition-colors"
              />
              <motion.button
                onClick={handleSave}
                disabled={!playerName.trim()}
                whileHover={playerName.trim() ? { scale: 1.04 } : {}}
                whileTap={playerName.trim() ? { scale: 0.97 } : {}}
                className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors"
              >
                Save
              </motion.button>
            </div>
          )}
        </motion.div>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.75 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <motion.button
            onClick={handlePlayAgain}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="flex-1 py-4 rounded-2xl font-black text-white"
            style={{
              fontFamily: "'Orbitron', monospace",
              background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
              boxShadow: "0 0 25px rgba(124,58,237,0.4)",
            }}
          >
            PLAY AGAIN
          </motion.button>
          <Link href="/leaderboard" className="flex-1">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="w-full py-4 rounded-2xl font-semibold text-white/80 glass-panel border border-white/20"
            >
              🏆 Leaderboard
            </motion.button>
          </Link>
          <Link href="/" className="flex-1">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="w-full py-4 rounded-2xl font-semibold text-white/60 glass-panel border border-white/10"
            >
              Home
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </main>
  );
}
