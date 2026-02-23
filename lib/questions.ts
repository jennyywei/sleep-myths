import Papa from "papaparse";
import type { RawQuestion, ActiveQuestion } from "./types";

// ─── CSV loader ───────────────────────────────────────────────────────────────

export async function loadQuestions(): Promise<RawQuestion[]> {
  const res = await fetch("/data/questions.csv");
  if (!res.ok) throw new Error("Failed to load questions.csv");
  const text = await res.text();

  const parsed = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim().toLowerCase(),
  });

  return parsed.data
    .map((row) => ({
      question: (row["question"] ?? "").trim(),
      answer: (row["answer"] ?? "").trim(),
      explanation: (row["explanation"] ?? "").trim() || undefined,
    }))
    .filter((q) => q.question !== "" && q.answer !== "");
}

// ─── Active question builder ──────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function buildQuestion(
  pool: RawQuestion[],
  usedIndices: Set<number>
): { question: ActiveQuestion; index: number } | null {
  if (pool.length < 4) return null;

  // find an unused question index
  const available = pool
    .map((_, i) => i)
    .filter((i) => !usedIndices.has(i));

  if (available.length === 0) return null;

  const idx = available[Math.floor(Math.random() * available.length)];
  const chosen = pool[idx];

  // 3 distractors from other rows
  const others = pool
    .filter((_, i) => i !== idx)
    .map((q) => q.answer);

  const uniqueOthers = Array.from(new Set(others)).filter(
    (a) => a !== chosen.answer
  );

  if (uniqueOthers.length < 3) return null;

  const distractors = shuffle(uniqueOthers).slice(0, 3);
  const choices = shuffle([chosen.answer, ...distractors]);

  return {
    question: {
      question: chosen.question,
      correctAnswer: chosen.answer,
      choices,
      explanation: chosen.explanation,
    },
    index: idx,
  };
}
