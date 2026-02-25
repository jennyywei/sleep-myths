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
const FACT_URL = "https://docs.google.com/document/d/1WU_ZPL8b70QPR5Ivy9VfmekPLoFoByKxXv5fq786l7Q/edit?usp=sharing";

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
              Fill out the Google form here!
            </motion.button>
          </a>
          <p className="text-white/35 text-xs">
            Share your name, score, and one thing you learned
          </p>
          <a
            href={FACT_URL}
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
              See the FACT SHEET here!
            </motion.button>
          </a>
          <p className="text-white/35 text-xs">
            Continuing your learning about sleep, sleep functions, dreams, disorders, and more through the fact sheet!
          </p>
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
          {/* <Link href="/leaderboard">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="px-5 py-3 rounded-2xl text-white/60 glass-panel border border-white/10 text-sm"
              style={{ fontFamily: "'Gaegu', cursive" }}
            >
              Full board
            </motion.button>
          </Link> */}
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
