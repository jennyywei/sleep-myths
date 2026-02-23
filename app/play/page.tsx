"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import StarField from "@/components/StarField";
import TimerBar from "@/components/TimerBar";
import HealthBar from "@/components/HealthBar";
import Countdown from "@/components/Countdown";
import FlashOverlay from "@/components/FlashOverlay";
import BubbleArena from "@/components/BubbleArena";
import Blaster from "@/components/Blaster";
import { useGame } from "@/hooks/useGame";
import { getDifficultyRound } from "@/lib/gameReducer";

export default function PlayPage() {
  const router = useRouter();
  const { state, startCountdown, answerQuestion, reset, questionError } = useGame();

  const [locked, setLocked] = useState(false);
  const [flashType, setFlashType] = useState<"correct" | "wrong" | null>(null);
  const [flashTrigger, setFlashTrigger] = useState(0);

  const arenaRef = useRef<HTMLDivElement>(null);
  const difficultyRound = getDifficultyRound(state.timeLeft);

  // Auto-start countdown on mount
  useEffect(() => {
    if (state.phase === "idle") startCountdown();
  }, [state.phase, startCountdown]);

  // Navigate to results when game ends
  useEffect(() => {
    if (state.phase === "ended") {
      const t = setTimeout(() => router.push("/results"), 1400);
      return () => clearTimeout(t);
    }
  }, [state.phase, router]);

  const handleAnswer = useCallback(
    (choice: string) => {
      if (locked || state.phase !== "playing" || !state.currentQuestion) return;
      setLocked(true);
      const correct = choice === state.currentQuestion.correctAnswer;
      setFlashType(correct ? "correct" : "wrong");
      setFlashTrigger((n) => n + 1);
      answerQuestion(choice);
      setTimeout(() => setLocked(false), 1050);
    },
    [locked, state.phase, state.currentQuestion, answerQuestion]
  );

  // Error state
  if (questionError) {
    return (
      <main className="relative min-h-screen flex items-center justify-center">
        <StarField />
        <div className="relative z-10 glass-panel rounded-2xl p-8 max-w-md text-center space-y-4">
          <p className="text-2xl text-red-400" style={{ fontFamily: "'Gaegu', cursive" }}>
            Could not load questions
          </p>
          <p className="text-white/60 text-sm">{questionError}</p>
          <button
            onClick={() => { reset(); router.push("/"); }}
            className="px-6 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 transition-colors text-white"
          >
            Back to Home
          </button>
        </div>
      </main>
    );
  }

  const isPlaying = state.phase === "playing";
  const isCountdown = state.phase === "countdown";

  return (
    <main className="relative flex flex-col h-screen overflow-hidden">
      <StarField />
      <FlashOverlay type={flashType} trigger={flashTrigger} />

      {/* Countdown overlay */}
      <AnimatePresence>
        {isCountdown && <Countdown value={state.countdownValue} />}
      </AnimatePresence>

      {/* ── TOP HUD ─────────────────────────────────────────────────────────── */}
      <div className="relative z-20 shrink-0">
        <div className="px-4 pt-2.5 pb-1">
          <TimerBar timeLeft={state.timeLeft} />
        </div>

        <AnimatePresence mode="wait">
          {isPlaying && state.currentQuestion && (
            <motion.div
              key={state.currentQuestion.question}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.22 }}
              className="mx-4 mb-2 glass-panel rounded-2xl px-5 py-3"
            >
              <p
                className="text-white text-center leading-snug"
                style={{ fontFamily: "'Gaegu', cursive", fontSize: "1.15rem" }}
              >
                {state.currentQuestion.question}
              </p>
              <p className="text-white/35 text-xs text-center mt-1">
                click the correct bubble
              </p>
            </motion.div>
          )}
          {isCountdown && (
            <motion.div
              key="ready"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mx-4 mb-2 glass-panel rounded-2xl px-5 py-3 text-center"
            >
              <p className="text-white/50 text-sm" style={{ fontFamily: "'Gaegu', cursive" }}>
                Get ready...
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── GAME ARENA ──────────────────────────────────────────────────────── */}
      <div ref={arenaRef} className="relative flex-1 overflow-hidden">
        {/* Ambient orbs */}
        <div className="absolute top-4 left-1/3 w-64 h-64 rounded-full bg-violet-600/8 blur-3xl pointer-events-none" />
        <div className="absolute bottom-20 right-1/4 w-56 h-56 rounded-full bg-cyan-600/8 blur-3xl pointer-events-none" />

        {/* Bubble canvas arena */}
        {isPlaying && state.currentQuestion && (
          <BubbleArena
            choices={state.currentQuestion.choices}
            correctAnswer={state.currentQuestion.correctAnswer}
            round={difficultyRound}
            disabled={locked}
            onAnswer={handleAnswer}
          />
        )}

        {/* Blaster gun — rotates toward cursor */}
        <Blaster arenaRef={arenaRef} />

        {/* Difficulty label */}
        <AnimatePresence mode="wait">
          <motion.div
            key={difficultyRound}
            initial={{ opacity: 0, x: 14 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="absolute top-2 right-3 z-10"
          >
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full border ${
                difficultyRound === 3
                  ? "bg-red-500/20 border-red-400/40 text-red-300"
                  : difficultyRound === 2
                  ? "bg-orange-500/20 border-orange-400/40 text-orange-300"
                  : "bg-cyan-500/20 border-cyan-400/40 text-cyan-300"
              }`}
              style={{ fontFamily: "'Gaegu', cursive" }}
            >
              {difficultyRound === 1 && "Round 1"}
              {difficultyRound === 2 && "Round 2 — faster"}
              {difficultyRound === 3 && "Lightning Round!"}
            </span>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── BOTTOM HUD ──────────────────────────────────────────────────────── */}
      <div className="relative z-20 shrink-0 glass-panel border-t border-white/10 px-4 py-2 flex items-center gap-4">
        <div className="flex flex-col shrink-0">
          <span className="text-white/40 text-[10px] uppercase tracking-wider">Score</span>
          <motion.span
            key={state.score}
            initial={{ scale: 1.22 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.22 }}
            className="text-xl font-bold text-white leading-none"
            style={{ fontFamily: "'Gaegu', cursive" }}
          >
            {state.score.toLocaleString()}
          </motion.span>
        </div>
        <div className="flex-1" />
        <HealthBar health={state.health} />
      </div>

      {/* ── GAME OVER overlay ───────────────────────────────────────────────── */}
      <AnimatePresence>
        {state.phase === "ended" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.72, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 250, damping: 20 }}
              className="text-center space-y-2"
            >
              <p
                className="text-5xl text-white drop-shadow-[0_0_24px_rgba(168,85,247,0.8)]"
                style={{ fontFamily: "'Gaegu', cursive" }}
              >
                {state.health <= 0 ? "Game Over" : "Time's Up!"}
              </p>
              <p className="text-white/45 text-sm">Heading to results...</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Exit */}
      <button
        onClick={() => { reset(); router.push("/"); }}
        className="absolute bottom-14 left-3 z-20 text-white/25 hover:text-white/55 text-xs transition-colors"
        style={{ fontFamily: "'Gaegu', cursive" }}
      >
        exit
      </button>
    </main>
  );
}
