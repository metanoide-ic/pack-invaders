/**
 * LEADERBOARD — Local high score tracking.
 * Stores top 10 runs.
 */

export interface LeaderboardEntry {
  characterId: string;
  months: number;
  score: number;
  kills: number;
  difficulty: string;
  date: string;
}

const STORAGE_KEY = 'packinvaders_leaderboard';

export function getLeaderboard(): LeaderboardEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch { return []; }
}

export function addToLeaderboard(entry: LeaderboardEntry): number {
  const board = getLeaderboard();
  board.push(entry);
  board.sort((a, b) => b.months - a.months || b.score - a.score);
  const trimmed = board.slice(0, 10);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  // Return position (0-indexed)
  return trimmed.findIndex(e => e === entry || (e.months === entry.months && e.score === entry.score && e.date === entry.date));
}
