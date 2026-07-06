/**
 * DAILY CHALLENGE — a shared daily flavor: everyone who opens the game today
 * gets the same character + Year Anomaly, and tries to beat their own best
 * for the day. Enemy/shop RNG isn't seeded (that would need rewiring every
 * Math.random() call in the engine), so this isn't a strict head-to-head
 * leaderboard — it's a reason to come back and try a fixed, unusual build
 * every day, including characters you haven't unlocked yet.
 */
import { ALL_CHARACTERS } from './characters';

export interface DailyChallengeInfo {
  dateKey: string; // YYYY-MM-DD (UTC)
  characterId: string;
  anomalyIndex: number; // index into GameManager's YEAR_ANOMALIES (0-3)
}

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function dateKeyOf(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function getDailyChallenge(date: Date = new Date()): DailyChallengeInfo {
  const dateKey = dateKeyOf(date);
  const seed = hashString(dateKey);
  const characterId = ALL_CHARACTERS[seed % ALL_CHARACTERS.length].id;
  const anomalyIndex = Math.floor(seed / ALL_CHARACTERS.length) % 4;
  return { dateKey, characterId, anomalyIndex };
}

const BEST_KEY_PREFIX = 'packinvaders_daily_best_';
const HISTORY_KEY = 'packinvaders_daily_history';

export function getDailyBest(dateKey: string): number {
  return parseInt(localStorage.getItem(BEST_KEY_PREFIX + dateKey) || '0', 10);
}

export function setDailyBest(dateKey: string, months: number): void {
  localStorage.setItem(BEST_KEY_PREFIX + dateKey, String(months));
  const history: string[] = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  if (!history.includes(dateKey)) {
    history.push(dateKey);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(-90)));
  }
}

/** Consecutive days (ending today) the daily challenge was played at least once. */
export function getDailyStreak(today: Date = new Date()): number {
  const history: string[] = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  const played = new Set(history);
  let streak = 0;
  const d = new Date(today);
  while (played.has(dateKeyOf(d))) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}
