import type { LeaderboardEntry } from "./types";

const LOCAL_KEY = "dreamblaster_scores";

export async function loadSeedLeaderboard(): Promise<LeaderboardEntry[]> {
  try {
    const res = await fetch("/data/seedLeaderboard.json");
    if (!res.ok) return [];
    const data = (await res.json()) as LeaderboardEntry[];
    return data.map((e) => ({ ...e, isLocal: false }));
  } catch {
    return [];
  }
}

export function loadLocalScores(): LeaderboardEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as LeaderboardEntry[];
    return parsed.map((e) => ({ ...e, isLocal: true }));
  } catch {
    return [];
  }
}

export function saveLocalScore(entry: LeaderboardEntry): void {
  if (typeof window === "undefined") return;
  try {
    const existing = loadLocalScores();
    const updated = [...existing, { ...entry, isLocal: true }];
    localStorage.setItem(LOCAL_KEY, JSON.stringify(updated));
  } catch {
    // ignore storage errors
  }
}

export function mergeLeaderboard(
  seed: LeaderboardEntry[],
  local: LeaderboardEntry[]
): LeaderboardEntry[] {
  const combined = [...seed, ...local];
  return combined
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.accuracy !== a.accuracy) return b.accuracy - a.accuracy;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    })
    .slice(0, 50);
}
