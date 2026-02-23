import type { GameState, GameAction, ActiveQuestion } from "./types";

export const INITIAL_STATE: GameState = {
  phase: "idle",
  score: 0,
  health: 5,
  streak: 0,
  bestStreak: 0,
  timeLeft: 60,
  multiplier: 1,
  answeredCount: 0,
  correctCount: 0,
  history: [],
  currentQuestion: null,
  countdownValue: 3,
};

export function computeStreakBonus(streak: number): number {
  if (streak >= 5) return 0; // multiplier handled separately
  if (streak >= 3) return 50;
  return 0;
}

export function computeMultiplier(streak: number): number {
  return streak >= 5 ? 2 : 1;
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "START_COUNTDOWN":
      return { ...INITIAL_STATE, phase: "countdown", countdownValue: 3 };

    case "TICK_COUNTDOWN": {
      const next = state.countdownValue - 1;
      // Phase stays "countdown" — START_PLAYING dispatched after "GO!" is shown
      return { ...state, countdownValue: Math.max(0, next) };
    }

    case "START_PLAYING":
      return {
        ...state,
        phase: "playing",
        currentQuestion: action.question,
      };

    case "NEXT_QUESTION":
      return {
        ...state,
        currentQuestion: action.question,
      };

    case "ANSWER_CORRECT": {
      const newStreak = state.streak + 1;
      const newBest = Math.max(state.bestStreak, newStreak);
      const multiplier = computeMultiplier(newStreak);
      const streakBonus = computeStreakBonus(newStreak);
      const earned = (100 + action.bonusScore + streakBonus) * multiplier;

      const record = state.currentQuestion
        ? {
            question: state.currentQuestion.question,
            correctAnswer: state.currentQuestion.correctAnswer,
            playerAnswer: state.currentQuestion.correctAnswer,
            wasCorrect: true,
            explanation: state.currentQuestion.explanation,
          }
        : null;

      return {
        ...state,
        score: Math.max(0, state.score + earned),
        streak: newStreak,
        bestStreak: newBest,
        multiplier,
        timeLeft: Math.min(60, state.timeLeft + action.bonusTime),
        answeredCount: state.answeredCount + 1,
        correctCount: state.correctCount + 1,
        history: record ? [...state.history, record] : state.history,
      };
    }

    case "ANSWER_WRONG": {
      const newHealth = state.health - 1;

      const record = state.currentQuestion
        ? {
            question: state.currentQuestion.question,
            correctAnswer: state.currentQuestion.correctAnswer,
            playerAnswer: "— (wrong choice)",
            wasCorrect: false,
            explanation: state.currentQuestion.explanation,
          }
        : null;

      if (newHealth <= 0) {
        return {
          ...state,
          health: 0,
          streak: 0,
          multiplier: 1,
          score: Math.max(0, state.score - 50),
          timeLeft: Math.max(0, state.timeLeft - action.penaltyTime),
          answeredCount: state.answeredCount + 1,
          history: record ? [...state.history, record] : state.history,
          phase: "ended",
        };
      }

      return {
        ...state,
        health: newHealth,
        streak: 0,
        multiplier: 1,
        score: Math.max(0, state.score - 50),
        timeLeft: Math.max(0, state.timeLeft - action.penaltyTime),
        answeredCount: state.answeredCount + 1,
        history: record ? [...state.history, record] : state.history,
      };
    }

    case "TICK_TIMER": {
      const newTime = state.timeLeft - 1;
      if (newTime <= 0) {
        return { ...state, timeLeft: 0, phase: "ended" };
      }
      return { ...state, timeLeft: newTime };
    }

    case "TIME_UP":
      return { ...state, phase: "ended", timeLeft: 0 };

    case "RESET":
      return INITIAL_STATE;

    default:
      return state;
  }
}

// ─── Persistence helpers ──────────────────────────────────────────────────────

const STORAGE_KEY = "dreamblaster_run";

export function saveRun(state: GameState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // storage may be full or unavailable
  }
}

export function loadRun(): GameState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as GameState;
  } catch {
    return null;
  }
}

export function clearRun(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

// Derive helper: what question index / difficulty round based on elapsed time
export function getDifficultyRound(timeLeft: number): 1 | 2 | 3 {
  const elapsed = 60 - timeLeft;
  if (elapsed < 20) return 1;
  if (elapsed < 40) return 2;
  return 3;
}

export function getCloudSpeed(round: 1 | 2 | 3): number {
  // seconds to cross the screen
  const speeds: Record<1 | 2 | 3, number> = { 1: 14, 2: 9, 3: 6 };
  return speeds[round];
}
