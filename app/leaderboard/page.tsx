"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import StarField from "@/components/StarField";
import {
  loadSeedLeaderboard,
  loadLocalScores,
  mergeLeaderboard,
} from "@/lib/leaderboard";
import { getBadge } from "@/lib/types";
import type { LeaderboardEntry } from "@/lib/types";

function rankColor(rank: number): string {
  if (rank === 1) return "#fbbf24";
  if (rank === 2) return "#94a3b8";
  if (rank === 3) return "#b45309";
  return "rgba(255,255,255,0.4)";
}

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [localIds, setLocalIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const local = loadLocalScores();
    const ids = new Set(local.map((e) => e.id));
    setLocalIds(ids);

    loadSeedLeaderboard()
      .then((seed) => setEntries(mergeLeaderboard(seed, local)))
      .catch(() => setEntries(local))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="relative min-h-screen overflow-y-auto pb-16">
      <StarField />
      <div className="fixed top-0 left-1/4 w-80 h-80 rounded-full bg-violet-600/10 blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-72 h-72 rounded-full bg-cyan-600/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-xl mx-auto px-4 pt-10 space-y-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1
            className="text-5xl text-white"
            style={{
              fontFamily: "'Gaegu', cursive",
              textShadow: "0 0 30px rgba(167,139,250,0.5)",
            }}
          >
            Leaderboard
          </h1>
        </motion.div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="glass-panel rounded-2xl overflow-hidden border border-white/10"
        >
          {/* Header row */}
          <div className="grid grid-cols-[2.5rem_1fr_5.5rem_5rem_5.5rem] gap-2 px-4 py-2.5 border-b border-white/10">
            {["#", "Player", "Score", "Acc", "Badge"].map((h) => (
              <div
                key={h}
                className="text-white/35 text-xs uppercase tracking-wider text-right first:text-center"
                style={{ fontFamily: "'Gaegu', cursive" }}
              >
                {h}
              </div>
            ))}
          </div>

          {loading && (
            <p className="py-10 text-center text-white/35 text-sm" style={{ fontFamily: "'Gaegu', cursive" }}>
              Loading...
            </p>
          )}

          {!loading && entries.length === 0 && (
            <div className="py-12 text-center space-y-2">
              <p className="text-white/40" style={{ fontFamily: "'Gaegu', cursive" }}>
                No scores yet. Be the first!
              </p>
            </div>
          )}

          {!loading &&
            entries.map((entry, i) => {
              const rank = i + 1;
              const isLocal = localIds.has(entry.id);
              const badge = getBadge(entry.accuracy);

              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -14 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.025 }}
                  className={`grid grid-cols-[2.5rem_1fr_5.5rem_5rem_5.5rem] gap-2 px-4 py-2.5 border-b border-white/5 last:border-0 transition-colors ${
                    isLocal ? "bg-violet-500/10 border-l-2 border-l-violet-400/60" : "hover:bg-white/3"
                  }`}
                >
                  {/* Rank */}
                  <div
                    className="text-sm text-center font-bold"
                    style={{ fontFamily: "'Gaegu', cursive", color: rankColor(rank) }}
                  >
                    {rank}
                  </div>

                  {/* Name */}
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span
                      className={`text-sm truncate ${isLocal ? "text-violet-300" : "text-white"}`}
                      style={{ fontFamily: "'Gaegu', cursive" }}
                    >
                      {entry.name}
                    </span>
                    {isLocal && (
                      <span className="text-[9px] text-violet-400 border border-violet-400/40 bg-violet-400/15 px-1 rounded-full shrink-0">
                        you
                      </span>
                    )}
                  </div>

                  {/* Score */}
                  <div
                    className="text-sm text-right font-bold"
                    style={{
                      fontFamily: "'Gaegu', cursive",
                      color: rank <= 3 ? "#fbbf24" : "rgba(255,255,255,0.88)",
                    }}
                  >
                    {entry.score.toLocaleString()}
                  </div>

                  {/* Accuracy */}
                  <div
                    className="text-sm text-right text-white/60"
                    style={{ fontFamily: "'Gaegu', cursive" }}
                  >
                    {Math.round(entry.accuracy * 100)}%
                  </div>

                  {/* Badge text */}
                  <div
                    className="text-xs text-right text-white/45 truncate"
                    style={{ fontFamily: "'Gaegu', cursive" }}
                    title={badge}
                  >
                    {badge}
                  </div>
                </motion.div>
              );
            })}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex gap-3"
        >
          <Link href="/play" className="flex-1">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="w-full py-3.5 rounded-2xl text-white text-lg"
              style={{
                fontFamily: "'Gaegu', cursive",
                background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
                boxShadow: "0 0 22px rgba(124,58,237,0.4)",
              }}
            >
              Play
            </motion.button>
          </Link>
          <Link href="/">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="px-6 py-3.5 rounded-2xl text-white/55 glass-panel border border-white/10 text-sm"
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
