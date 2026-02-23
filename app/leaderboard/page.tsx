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
import { getBadge, getBadgeEmoji } from "@/lib/types";
import type { LeaderboardEntry } from "@/lib/types";

// ─── Medal helpers ─────────────────────────────────────────────────────────────

function rankLabel(rank: number): string {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return String(rank);
}

function rankColor(rank: number): string {
  if (rank === 1) return "text-yellow-300";
  if (rank === 2) return "text-slate-300";
  if (rank === 3) return "text-amber-600";
  return "text-white/50";
}

// ─── Leaderboard Page ─────────────────────────────────────────────────────────

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [localIds, setLocalIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const local = loadLocalScores();
    const ids = new Set(local.map((e) => e.id));
    setLocalIds(ids);

    loadSeedLeaderboard()
      .then((seed) => {
        const merged = mergeLeaderboard(seed, local);
        setEntries(merged);
      })
      .catch(() => {
        // If seed fails, just show local
        setEntries(local);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="relative min-h-screen overflow-y-auto pb-16">
      <StarField />
      <div className="fixed top-0 left-1/4 w-96 h-96 rounded-full bg-violet-600/10 blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-80 h-80 rounded-full bg-cyan-600/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-2xl mx-auto px-4 pt-10 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          <div className="text-4xl">🏆</div>
          <h1
            className="text-4xl sm:text-5xl font-black"
            style={{
              fontFamily: "'Orbitron', monospace",
              background: "linear-gradient(135deg, #fbbf24, #f59e0b, #ef4444)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            LEADERBOARD
          </h1>

          {/* Demo mode badge */}
          <div className="inline-flex items-center gap-2 group relative">
            <span className="text-xs text-white/40 bg-white/5 border border-white/10 rounded-full px-3 py-1 cursor-default">
              Demo Mode Leaderboard
            </span>
            <div className="hidden group-hover:block absolute top-7 left-1/2 -translate-x-1/2 w-64 bg-gray-900 border border-white/10 rounded-xl p-3 text-xs text-white/60 leading-relaxed z-50 shadow-2xl">
              Global scores are seeded for demo purposes. Your score is saved
              locally to this browser only.
            </div>
          </div>
        </motion.div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="glass-panel rounded-2xl overflow-hidden border border-white/10"
        >
          {/* Table header */}
          <div className="grid grid-cols-[3rem_1fr_6rem_6rem_6rem] gap-2 px-4 py-3 border-b border-white/10">
            <div className="text-white/40 text-xs font-mono uppercase text-center">#</div>
            <div className="text-white/40 text-xs font-mono uppercase">Player</div>
            <div className="text-white/40 text-xs font-mono uppercase text-right">Score</div>
            <div className="text-white/40 text-xs font-mono uppercase text-right">Acc%</div>
            <div className="text-white/40 text-xs font-mono uppercase text-right">Badge</div>
          </div>

          {loading && (
            <div className="py-12 text-center text-white/40 text-sm">Loading…</div>
          )}

          {!loading && entries.length === 0 && (
            <div className="py-12 text-center">
              <div className="text-4xl mb-3">😴</div>
              <p className="text-white/50 text-sm">No scores yet. Play and save your first run!</p>
            </div>
          )}

          {!loading &&
            entries.map((entry, i) => {
              const rank = i + 1;
              const isLocal = localIds.has(entry.id);
              const badge = getBadge(entry.accuracy);
              const badgeEmoji = getBadgeEmoji(badge);

              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 + i * 0.03 }}
                  className={`
                    grid grid-cols-[3rem_1fr_6rem_6rem_6rem] gap-2
                    px-4 py-3 border-b border-white/5
                    transition-colors
                    ${isLocal
                      ? "bg-violet-500/10 border-l-2 border-l-violet-400"
                      : "hover:bg-white/3"
                    }
                  `}
                >
                  {/* Rank */}
                  <div
                    className={`text-sm font-bold text-center ${rankColor(rank)}`}
                    style={rank <= 3 ? { fontSize: "1.1rem" } : {}}
                  >
                    {rankLabel(rank)}
                  </div>

                  {/* Name */}
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`text-sm font-medium truncate ${
                        isLocal ? "text-violet-300" : "text-white"
                      }`}
                    >
                      {entry.name}
                    </span>
                    {isLocal && (
                      <span className="text-[9px] bg-violet-500/30 border border-violet-400/40 text-violet-300 px-1.5 py-0.5 rounded-full shrink-0">
                        YOU
                      </span>
                    )}
                  </div>

                  {/* Score */}
                  <div
                    className="text-sm font-bold text-right"
                    style={{
                      fontFamily: "'Orbitron', monospace",
                      color: rank <= 3 ? "#fbbf24" : "rgba(255,255,255,0.9)",
                    }}
                  >
                    {entry.score.toLocaleString()}
                  </div>

                  {/* Accuracy */}
                  <div className="text-sm text-right text-white/70">
                    {Math.round(entry.accuracy * 100)}%
                  </div>

                  {/* Badge */}
                  <div className="text-right" title={badge}>
                    <span className="text-base">{badgeEmoji}</span>
                  </div>
                </motion.div>
              );
            })}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Link href="/play" className="flex-1">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="w-full py-4 rounded-2xl font-black text-white"
              style={{
                fontFamily: "'Orbitron', monospace",
                background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
                boxShadow: "0 0 25px rgba(124,58,237,0.4)",
              }}
            >
              PLAY NOW
            </motion.button>
          </Link>
          <Link href="/" className="sm:w-40">
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
