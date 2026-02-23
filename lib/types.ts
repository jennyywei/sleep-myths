// ─── Question types ──────────────────────────────────────────────────────────

export interface RawQuestion {
  question: string;
  answer: string;
  explanation?: string;
}

export interface ActiveQuestion {
  question: string;
  correctAnswer: string;
  choices: string[];
  explanation?: string;
}

// ─── Game state machine ───────────────────────────────────────────────────────

export type GamePhase = "idle" | "countdown" | "playing" | "ended";

export interface AnswerRecord {
  question: string;
  correctAnswer: string;
  playerAnswer: string;
  wasCorrect: boolean;
  explanation?: string;
}

export interface GameState {
  phase: GamePhase;
  score: number;
  health: number;
  streak: number;
  bestStreak: number;
  timeLeft: number;
  multiplier: number;
  answeredCount: number;
  correctCount: number;
  history: AnswerRecord[];
  currentQuestion: ActiveQuestion | null;
  countdownValue: number;
}

// ─── Game actions ─────────────────────────────────────────────────────────────

export type GameAction =
  | { type: "START_COUNTDOWN" }
  | { type: "TICK_COUNTDOWN" }
  | { type: "START_PLAYING"; question: ActiveQuestion }
  | { type: "ANSWER_CORRECT"; bonusTime: number; bonusScore: number }
  | { type: "ANSWER_WRONG"; penaltyTime: number }
  | { type: "NEXT_QUESTION"; question: ActiveQuestion }
  | { type: "TICK_TIMER" }
  | { type: "TIME_UP" }
  | { type: "RESET" };

// ─── Leaderboard types ────────────────────────────────────────────────────────

export interface LeaderboardEntry {
  id: string;
  name: string;
  score: number;
  accuracy: number;
  createdAt: string;
  isLocal?: boolean;
}

// ─── Badge system ─────────────────────────────────────────────────────────────

export type Badge =
  | "You'll get it next time..."
  | "Work in progress..."
  | "Getting there!"
  | "Sleep master!";

export function getBadge(accuracy: number): Badge {
  if (accuracy >= 0.95) return "Sleep master!";
  if (accuracy >= 0.8) return "Getting there!";
  if (accuracy >= 0.5) return "Work in progress...";
  return "You'll get it next time...";
}


// ─── Cloud animation type ─────────────────────────────────────────────────────

export type CloudState = "idle" | "correct" | "wrong";

export interface CloudData {
  id: string;
  text: string;
  index: number;
}
