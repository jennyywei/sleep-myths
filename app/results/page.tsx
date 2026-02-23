"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import StarField from "@/components/StarField";
import { loadRun, clearRun } from "@/lib/gameReducer";
import { getBadge } from "@/lib/types";
import {
  loadSeedLeaderboard,
  loadLocalScores,
  mergeLeaderboard,
  saveLocalScore,
} from "@/lib/leaderboard";
import type { GameState, LeaderboardEntry } from "@/lib/types";

const FORM_URL = "https://forms.gle/3ETEyRspCBV9r2yo6";

function makeId(): string {
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function ResultsPage() {
  const router = useRouter();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [board, setBoard] = useState<LeaderboardEntry[]>([]);
  const [playerName, setPlayerName] = useState("");
  const [saved, setSaved] = useState(false);
  const [playerId, setPlayerId] = useState<string | null>(null);

  useEffect(() => {
    const run = loadRun();
    if (!run || run.phase !== "ended") {
      router.replace("/");
      return;
    }
    setGameState(run);

    // Load leaderboard for inline display
    loadSeedLeaderboard()
      .then((seed) => {
        const local = loadLocalScores();
        setBoard(mergeLeaderboard(seed, local).slice(0, 8));
      })
      .catch(() => {
        setBoard(loadLocalScores().slice(0, 8));
      });
  }, [router]);

  if (!gameState) return null;

  const accuracy =
    gameState.answeredCount > 0
      ? gameState.correctCount / gameState.answeredCount
      : 0;

  const badge = getBadge(accuracy);

  const handleSave = () => {
    if (saved || !playerName.trim()) return;
    const id = makeId();
    saveLocalScore({
      id,
      name: playerName.trim(),
      score: gameState.score,
      accuracy,
      createdAt: new Date().toISOString(),
      isLocal: true,
    });
    setPlayerId(id);
    setSaved(true);
    // Refresh board with new entry
    loadSeedLeaderboard()
      .then((seed) => {
        const local = loadLocalScores();
        setBoard(mergeLeaderboard(seed, local).slice(0, 8));
      })
      .catch(() => {
        setBoard(loadLocalScores().slice(0, 8));
      });
  };

  const handlePlayAgain = () => {
    clearRun();
    router.push("/play");
  };

  return (
    <main className="relative min-h-screen overflow-y-auto pb-16">
      <StarField />
      <div className="fixed top-0 left-1/4 w-80 h-80 rounded-full bg-violet-600/10 blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-72 h-72 rounded-full bg-cyan-600/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-lg mx-auto px-4 pt-12 space-y-7">

        {/* ── Score card ────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel rounded-3xl p-8 text-center space-y-2"
        >
          <motion.p
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 240, damping: 18, delay: 0.1 }}
            className="text-6xl text-white"
            style={{ fontFamily: "'Gaegu', cursive" }}
          >
            {gameState.score.toLocaleString()}
          </motion.p>
          <p className="text-white/60 text-lg" style={{ fontFamily: "'Gaegu', cursive" }}>
            {badge}
          </p>
          <p className="text-white/40 text-sm">
            {gameState.correctCount} / {gameState.answeredCount} correct &middot;{" "}
            {Math.round(accuracy * 100)}%
          </p>
        </motion.div>

        {/* ── Thanks + form ─────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center space-y-4"
        >
          <p
            className="text-2xl text-white"
            style={{ fontFamily: "'Gaegu', cursive" }}
          >
            Thanks for playing!
          </p>
          <a
            href={FORM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="w-full py-4 rounded-2xl text-white text-lg"
              style={{
                fontFamily: "'Gaegu', cursive",
                background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
                boxShadow: "0 0 24px rgba(124,58,237,0.45)",
              }}
            >
              Submit your response
            </motion.button>
          </a>
          <p className="text-white/35 text-xs">
            Share your name, score, and one thing you learned
          </p>
        </motion.div>

        {/* ── Mini leaderboard ──────────────────────────────────────────────── */}
        {board.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="space-y-2"
          >
            <p
              className="text-white/50 text-center text-sm"
              style={{ fontFamily: "'Gaegu', cursive" }}
            >
              Top Scores
            </p>
            <div className="glass-panel rounded-2xl overflow-hidden">
              {board.map((entry, i) => {
                const rank = i + 1;
                const isMe = entry.id === playerId || entry.isLocal;
                return (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.04 }}
                    className={`flex items-center gap-3 px-4 py-2.5 border-b border-white/5 last:border-0 ${
                      isMe ? "bg-violet-500/12" : ""
                    }`}
                  >
                    <span
                      className="text-sm w-5 text-center shrink-0"
                      style={{
                        fontFamily: "'Gaegu', cursive",
                        color:
                          rank === 1
                            ? "#fbbf24"
                            : rank === 2
                            ? "#94a3b8"
                            : rank === 3
                            ? "#b45309"
                            : "rgba(255,255,255,0.4)",
                      }}
                    >
                      {rank}
                    </span>
                    <span
                      className={`flex-1 text-sm truncate ${
                        isMe ? "text-violet-300" : "text-white"
                      }`}
                      style={{ fontFamily: "'Gaegu', cursive" }}
                    >
                      {entry.name}
                      {isMe && (
                        <span className="ml-1.5 text-[9px] text-violet-400 border border-violet-400/40 bg-violet-400/15 px-1 rounded-full">
                          you
                        </span>
                      )}
                    </span>
                    <span
                      className="text-sm font-bold shrink-0"
                      style={{
                        fontFamily: "'Gaegu', cursive",
                        color: rank <= 3 ? "#fbbf24" : "rgba(255,255,255,0.85)",
                      }}
                    >
                      {entry.score.toLocaleString()}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ── Save score ────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="glass-panel rounded-2xl p-5 space-y-3"
        >
          <p className="text-white/70 text-sm" style={{ fontFamily: "'Gaegu', cursive" }}>
            Save your score
          </p>
          {saved ? (
            <p className="text-green-300 text-sm" style={{ fontFamily: "'Gaegu', cursive" }}>
              Saved!
            </p>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleSave(); }}
                placeholder="your name"
                maxLength={24}
                className="flex-1 bg-white/8 border border-white/15 rounded-xl px-3 py-2 text-white placeholder-white/25 text-sm outline-none focus:border-violet-400 transition-colors"
                style={{ fontFamily: "'Gaegu', cursive" }}
              />
              <button
                onClick={handleSave}
                disabled={!playerName.trim()}
                className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white text-sm transition-colors"
                style={{ fontFamily: "'Gaegu', cursive" }}
              >
                Save
              </button>
            </div>
          )}
        </motion.div>

        {/* ── CTA row ───────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex gap-3"
        >
          <motion.button
            onClick={handlePlayAgain}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="flex-1 py-3 rounded-2xl text-white text-lg"
            style={{
              fontFamily: "'Gaegu', cursive",
              background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
              boxShadow: "0 0 20px rgba(124,58,237,0.4)",
            }}
          >
            Play Again
          </motion.button>
          <Link href="/leaderboard">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="px-5 py-3 rounded-2xl text-white/60 glass-panel border border-white/10 text-sm"
              style={{ fontFamily: "'Gaegu', cursive" }}
            >
              Full board
            </motion.button>
          </Link>
          <Link href="/">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="px-5 py-3 rounded-2xl text-white/50 glass-panel border border-white/10 text-sm"
              style={{ fontFamily: "'Gaegu', cursive" }}
            >
              Home
            </motion.button>
          </Link>
        </motion.div>

      </div>
    </main>
  );
}
