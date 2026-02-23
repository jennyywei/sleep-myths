"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import StarField from "@/components/StarField";
import TimerBar from "@/components/TimerBar";
import HealthBar from "@/components/HealthBar";
import StreakMeter from "@/components/StreakMeter";
import Countdown from "@/components/Countdown";
import ScorePop from "@/components/ScorePop";
import FlashOverlay from "@/components/FlashOverlay";
import { useGame } from "@/hooks/useGame";
import { getDifficultyRound } from "@/lib/gameReducer";

// ─── Cloud colours ─────────────────────────────────────────────────────────────

const CLOUD_GRADIENTS = [
  "from-violet-600/50 to-purple-800/40 border-violet-400/60",
  "from-cyan-600/50 to-blue-800/40 border-cyan-400/60",
  "from-pink-600/50 to-rose-800/40 border-pink-400/60",
  "from-amber-600/50 to-orange-800/40 border-amber-400/60",
];

const LANE_TOP = ["12%", "33%", "55%", "74%"];

// ─── Individual floating cloud ─────────────────────────────────────────────────

interface FloatCloudProps {
  text: string;
  index: number;
  speed: number;
  round: 1 | 2 | 3;
  disabled: boolean;
  feedbackState: "idle" | "correct" | "wrong";
  onSelect: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

function FloatCloud({
  text,
  index,
  speed,
  round,
  disabled,
  feedbackState,
  onSelect,
}: FloatCloudProps) {
  const gradient = CLOUD_GRADIENTS[index % CLOUD_GRADIENTS.length];

  const wobble =
    round === 3
      ? {
          animate: { y: [0, -8, 5, -3, 0] },
          transition: { duration: 1.8, repeat: Infinity, ease: "easeInOut" as const },
        }
      : { animate: {}, transition: {} };

  const feedbackAnim =
    feedbackState === "wrong"
      ? { x: [0, -10, 10, -8, 8, -4, 4, 0], rotate: [0, -2, 2, -1, 1, 0] }
      : feedbackState === "correct"
      ? { scale: [1, 1.25, 0], opacity: [1, 1, 0] }
      : { x: 0, rotate: 0, scale: 1, opacity: 1 };

  const feedbackTrans = feedbackState !== "idle" ? { duration: 0.45 } : {};

  const borderExtra =
    feedbackState === "correct"
      ? "border-green-400 shadow-[0_0_30px_rgba(74,222,128,0.7)]"
      : feedbackState === "wrong"
      ? "border-red-400 shadow-[0_0_20px_rgba(239,68,68,0.6)]"
      : "";

  return (
    <motion.div
      className="absolute"
      style={{ top: LANE_TOP[index % 4], left: 0 }}
      animate={{ x: ["110vw", "-20vw"] }}
      transition={{
        duration: speed,
        delay: index * 1.1,
        ease: "linear",
        repeat: Infinity,
        repeatDelay: 0.4,
      }}
    >
      <motion.div {...wobble}>
        <motion.div animate={feedbackAnim} transition={feedbackTrans} className="relative">
          {/* Cloud bumps */}
          <div className="absolute -top-4 left-7 w-12 h-8 rounded-full bg-white/8 border border-white/10 pointer-events-none" />
          <div className="absolute -top-7 left-16 w-16 h-10 rounded-full bg-white/8 border border-white/10 pointer-events-none" />
          <div className="absolute -top-3 right-6 w-10 h-7 rounded-full bg-white/8 border border-white/10 pointer-events-none" />

          <motion.button
            onClick={onSelect}
            disabled={disabled}
            whileHover={disabled ? {} : { scale: 1.07 }}
            whileTap={disabled ? {} : { scale: 0.95 }}
            className={`
              relative w-52 px-5 py-6 rounded-[2.5rem]
              bg-gradient-to-br ${gradient}
              border-2 backdrop-blur-md
              shadow-lg
              text-white font-semibold text-sm text-center
              cursor-pointer select-none
              transition-all duration-150
              ${borderExtra}
              ${feedbackState === "wrong" ? "bg-red-900/20" : ""}
              ${feedbackState === "correct" ? "bg-green-900/20" : ""}
            `}
            style={{ textShadow: "0 0 10px rgba(255,255,255,0.4)" }}
          >
            <span className="absolute top-2 right-3 text-[10px] text-white/40 font-mono key-hint">
              {index + 1}
            </span>
            <span className="relative z-10 leading-snug">{text}</span>

            {/* Lightning crack for wrong */}
            {feedbackState === "wrong" && (
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                viewBox="0 0 208 96"
                preserveAspectRatio="none"
              >
                <polyline
                  points="85,4 76,34 95,30 78,92"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="2"
                  opacity="0.9"
                />
                <polyline
                  points="125,10 136,38 120,36 132,88"
                  fill="none"
                  stroke="#f97316"
                  strokeWidth="1.5"
                  opacity="0.7"
                />
              </svg>
            )}
          </motion.button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

// ─── Spark burst (correct answer) ─────────────────────────────────────────────

const SPARK_COLORS = [
  "#c084fc", "#e879f9", "#38bdf8", "#34d399",
  "#fbbf24", "#a78bfa", "#67e8f9", "#f472b6",
];

interface SparkBurstProps {
  x: number;
  y: number;
  id: number;
  onDone: (id: number) => void;
}

function SparkBurst({ x, y, id, onDone }: SparkBurstProps) {
  useEffect(() => {
    const t = setTimeout(() => onDone(id), 900);
    return () => clearTimeout(t);
  }, [id, onDone]);

  return (
    <div className="fixed pointer-events-none z-50" style={{ left: x, top: y }}>
      {Array.from({ length: 20 }, (_, i) => {
        const angle = (i / 20) * 360;
        const dist = 50 + Math.random() * 60;
        const color = SPARK_COLORS[i % SPARK_COLORS.length];
        return (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: 5 + Math.random() * 5,
              height: 5 + Math.random() * 5,
              backgroundColor: color,
              boxShadow: `0 0 6px ${color}`,
              left: 0,
              top: 0,
            }}
            initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
            animate={{
              x: Math.cos((angle * Math.PI) / 180) * dist,
              y: Math.sin((angle * Math.PI) / 180) * dist,
              scale: 0,
              opacity: 0,
            }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          />
        );
      })}
    </div>
  );
}

// ─── Main Play Page ────────────────────────────────────────────────────────────

interface Burst {
  id: number;
  x: number;
  y: number;
}

type FeedbackState = "idle" | "correct" | "wrong";

export default function PlayPage() {
  const router = useRouter();
  const { state, cloudSpeed, startCountdown, answerQuestion, reset, questionError } =
    useGame();

  const [feedbackMap, setFeedbackMap] = useState<Record<number, FeedbackState>>({
    0: "idle",
    1: "idle",
    2: "idle",
    3: "idle",
  });
  const [locked, setLocked] = useState(false);
  const [bursts, setBursts] = useState<Burst[]>([]);
  const [flashType, setFlashType] = useState<"correct" | "wrong" | null>(null);
  const [flashTrigger, setFlashTrigger] = useState(0);
  const [scorePop, setScorePop] = useState({ value: 0, positive: true, trigger: 0 });

  const difficultyRound = getDifficultyRound(state.timeLeft);

  // Auto-start countdown on mount
  useEffect(() => {
    if (state.phase === "idle") {
      startCountdown();
    }
  }, [state.phase, startCountdown]);

  // Navigate to results when game ends
  useEffect(() => {
    if (state.phase === "ended") {
      const t = setTimeout(() => router.push("/results"), 1400);
      return () => clearTimeout(t);
    }
  }, [state.phase, router]);

  // Reset feedback + lock after answer animation
  const resetFeedback = useCallback(() => {
    setTimeout(() => {
      setFeedbackMap({ 0: "idle", 1: "idle", 2: "idle", 3: "idle" });
      setLocked(false);
    }, 1000);
  }, []);

  const handleAnswer = useCallback(
    (choice: string, cloudIndex: number, e?: React.MouseEvent<HTMLButtonElement>) => {
      if (locked || state.phase !== "playing" || !state.currentQuestion) return;
      setLocked(true);

      const correct = choice === state.currentQuestion.correctAnswer;

      setFeedbackMap((prev) => ({
        ...prev,
        [cloudIndex]: correct ? "correct" : "wrong",
      }));
      setFlashType(correct ? "correct" : "wrong");
      setFlashTrigger((n) => n + 1);
      setScorePop({ value: correct ? 100 : 50, positive: correct, trigger: Date.now() });

      if (correct && e) {
        const rect = e.currentTarget.getBoundingClientRect();
        setBursts((prev) => [
          ...prev,
          { id: Date.now(), x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 },
        ]);
      }

      answerQuestion(choice);
      resetFeedback();
    },
    [locked, state.phase, state.currentQuestion, answerQuestion, resetFeedback]
  );

  // Keyboard shortcuts 1–4
  useEffect(() => {
    if (state.phase !== "playing" || !state.currentQuestion) return;
    const choices = state.currentQuestion.choices;

    const onKey = (e: KeyboardEvent) => {
      const n = parseInt(e.key, 10);
      if (n >= 1 && n <= 4 && choices[n - 1] !== undefined) {
        handleAnswer(choices[n - 1], n - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state.phase, state.currentQuestion, handleAnswer]);

  const removeBurst = useCallback((id: number) => {
    setBursts((prev) => prev.filter((b) => b.id !== id));
  }, []);

  // ── Error state ────────────────────────────────────────────────────────────

  if (questionError) {
    return (
      <main className="relative min-h-screen flex items-center justify-center">
        <StarField />
        <div className="relative z-10 glass-panel rounded-2xl p-8 max-w-md text-center space-y-4">
          <div className="text-4xl">⚠️</div>
          <h2 className="text-xl font-bold text-red-400">Question Load Error</h2>
          <p className="text-white/70 text-sm">{questionError}</p>
          <button
            onClick={() => { reset(); router.push("/"); }}
            className="mt-4 px-6 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 transition-colors text-white font-semibold"
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
    <main className="relative min-h-screen overflow-hidden">
      <StarField />

      {/* Ambient orbs */}
      <div className="fixed top-0 left-1/3 w-96 h-96 rounded-full bg-violet-600/8 blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-1/3 w-80 h-80 rounded-full bg-cyan-600/8 blur-3xl pointer-events-none" />

      {/* Overlays */}
      <FlashOverlay type={flashType} trigger={flashTrigger} />
      <ScorePop value={scorePop.value} positive={scorePop.positive} trigger={scorePop.trigger} />

      {/* Spark bursts */}
      {bursts.map((b) => (
        <SparkBurst key={b.id} id={b.id} x={b.x} y={b.y} onDone={removeBurst} />
      ))}

      {/* Countdown */}
      <AnimatePresence>
        {isCountdown && <Countdown value={state.countdownValue} />}
      </AnimatePresence>

      {/* HUD */}
      <div className="relative z-20 flex items-center gap-4 px-4 py-3 glass-panel border-b border-white/10">
        {/* Score */}
        <div className="flex flex-col shrink-0 min-w-[5rem]">
          <span className="text-white/40 text-[10px] font-mono uppercase tracking-wider">Score</span>
          <motion.span
            key={state.score}
            initial={{ scale: 1.3, color: "#a78bfa" }}
            animate={{ scale: 1, color: "#ffffff" }}
            transition={{ duration: 0.3 }}
            className="text-2xl font-black"
            style={{ fontFamily: "'Orbitron', monospace" }}
          >
            {state.score.toLocaleString()}
          </motion.span>
        </div>

        {/* Timer */}
        <div className="flex-1 min-w-0">
          <TimerBar timeLeft={state.timeLeft} />
        </div>

        {/* HP + Streak */}
        <div className="flex flex-col items-end gap-1 shrink-0">
          <HealthBar health={state.health} />
          <StreakMeter streak={state.streak} multiplier={state.multiplier} />
        </div>
      </div>

      {/* Difficulty badge */}
      <AnimatePresence mode="wait">
        <motion.div
          key={difficultyRound}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="absolute top-[68px] right-4 z-20"
        >
          <span
            className={`text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-full border ${
              difficultyRound === 3
                ? "bg-red-500/20 border-red-400/50 text-red-300"
                : difficultyRound === 2
                ? "bg-orange-500/20 border-orange-400/50 text-orange-300"
                : "bg-cyan-500/20 border-cyan-400/50 text-cyan-300"
            }`}
          >
            {difficultyRound === 1 && "Round 1"}
            {difficultyRound === 2 && "⚡ Round 2"}
            {difficultyRound === 3 && "🔥 Lightning"}
          </span>
        </motion.div>
      </AnimatePresence>

      {/* Question panel */}
      <AnimatePresence mode="wait">
        {isPlaying && state.currentQuestion && (
          <motion.div
            key={state.currentQuestion.question}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.25 }}
            className="absolute top-20 left-1/2 -translate-x-1/2 z-20 w-full max-w-2xl px-4"
          >
            <div className="glass-panel rounded-2xl px-6 py-4 text-center">
              <p className="text-white font-semibold text-base sm:text-lg leading-snug">
                {state.currentQuestion.question}
              </p>
              <p className="text-white/35 text-xs mt-1.5">
                Blast the correct cloud — or press{" "}
                <span className="key-hint">1</span>
                {" – "}
                <span className="key-hint">4</span>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Answer clouds */}
      {isPlaying && state.currentQuestion && (
        <div className="absolute inset-0 z-10 overflow-hidden">
          {state.currentQuestion.choices.map((choice, i) => (
            <FloatCloud
              key={`${state.currentQuestion!.question}-${i}`}
              text={choice}
              index={i}
              speed={cloudSpeed}
              round={difficultyRound}
              disabled={locked}
              feedbackState={feedbackMap[i] ?? "idle"}
              onSelect={(e) => handleAnswer(choice, i, e)}
            />
          ))}
        </div>
      )}

      {/* Game-over overlay */}
      <AnimatePresence>
        {state.phase === "ended" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.7, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="text-center space-y-3"
            >
              <div className="text-6xl">{state.health <= 0 ? "💀" : "⏱️"}</div>
              <h2
                className="text-5xl font-black text-white"
                style={{ fontFamily: "'Orbitron', monospace" }}
              >
                {state.health <= 0 ? "GAME OVER" : "TIME'S UP!"}
              </h2>
              <p className="text-white/50 text-sm">Heading to results…</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Exit */}
      <button
        onClick={() => { reset(); router.push("/"); }}
        className="absolute bottom-4 left-4 z-20 text-white/30 hover:text-white/60 text-sm transition-colors"
      >
        ← Exit
      </button>
    </main>
  );
}
