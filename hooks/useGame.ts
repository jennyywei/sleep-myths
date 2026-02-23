"use client";

import { useReducer, useEffect, useRef, useCallback, useState } from "react";
import {
  gameReducer,
  INITIAL_STATE,
  saveRun,
  clearRun,
  getDifficultyRound,
  getCloudSpeed,
} from "@/lib/gameReducer";
import { buildQuestion, loadQuestions } from "@/lib/questions";
import type { GameState, RawQuestion } from "@/lib/types";

export interface GameHook {
  state: GameState;
  cloudSpeed: number;
  difficultyRound: 1 | 2 | 3;
  startCountdown: () => void;
  answerQuestion: (choice: string) => void;
  reset: () => void;
  questionError: string | null;
}

export function useGame(): GameHook {
  const [state, dispatch] = useReducer(gameReducer, INITIAL_STATE);
  const [questionError, setQuestionError] = useState<string | null>(null);
  const questionsRef = useRef<RawQuestion[]>([]);
  const usedIndicesRef = useRef<Set<number>>(new Set());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const difficultyRound = getDifficultyRound(state.timeLeft);
  const cloudSpeed = getCloudSpeed(difficultyRound);

  // Load questions on mount
  useEffect(() => {
    loadQuestions()
      .then((qs) => {
        if (qs.length < 4) {
          setQuestionError(
            "Not enough questions in questions.csv (need at least 4)."
          );
          return;
        }
        questionsRef.current = qs;
      })
      .catch(() =>
        setQuestionError(
          "Could not load questions.csv. Check the /public/data/ folder."
        )
      );
  }, []);

  // Persist game run to localStorage whenever state changes
  useEffect(() => {
    if (state.phase !== "idle") {
      saveRun(state);
    }
  }, [state]);

  // Countdown ticker (fires once per second)
  useEffect(() => {
    if (state.phase !== "countdown") return;
    const t = setTimeout(() => {
      dispatch({ type: "TICK_COUNTDOWN" });
    }, 1000);
    return () => clearTimeout(t);
  }, [state.phase, state.countdownValue]);

  // Transition countdown → playing when countdownValue hits 0
  useEffect(() => {
    if (state.phase !== "countdown" || state.countdownValue !== 0) return;

    const t = setTimeout(() => {
      spawnNextQuestion();
    }, 600);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.phase, state.countdownValue]);

  // Main game timer (1 tick per second)
  useEffect(() => {
    if (state.phase !== "playing") {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = setInterval(() => {
      dispatch({ type: "TICK_TIMER" });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [state.phase]);

  // Cleanup refs on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (countdownRef.current) clearTimeout(countdownRef.current);
    };
  }, []);

  function spawnNextQuestion(isFirst = true) {
    if (questionsRef.current.length === 0) return;

    let result = buildQuestion(questionsRef.current, usedIndicesRef.current);
    if (!result) {
      // Exhausted all questions — wrap around
      usedIndicesRef.current = new Set();
      result = buildQuestion(questionsRef.current, usedIndicesRef.current);
    }
    if (!result) return;

    usedIndicesRef.current.add(result.index);

    if (isFirst) {
      dispatch({ type: "START_PLAYING", question: result.question });
    } else {
      dispatch({ type: "NEXT_QUESTION", question: result.question });
    }
  }

  const startCountdown = useCallback(() => {
    usedIndicesRef.current = new Set();
    clearRun();
    dispatch({ type: "START_COUNTDOWN" });
  }, []);

  const answerQuestion = useCallback(
    (choice: string) => {
      if (state.phase !== "playing" || !state.currentQuestion) return;

      const correct = choice === state.currentQuestion.correctAnswer;

      if (correct) {
        dispatch({ type: "ANSWER_CORRECT", bonusTime: 0.5, bonusScore: 0 });
      } else {
        dispatch({ type: "ANSWER_WRONG", penaltyTime: 1 });
      }

      // Queue next question after a short animation delay
      setTimeout(() => {
        spawnNextQuestion(false);
      }, 1100);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.phase, state.currentQuestion]
  );

  const reset = useCallback(() => {
    usedIndicesRef.current = new Set();
    clearRun();
    dispatch({ type: "RESET" });
  }, []);

  return {
    state,
    cloudSpeed,
    difficultyRound,
    startCountdown,
    answerQuestion,
    reset,
    questionError,
  };
}
