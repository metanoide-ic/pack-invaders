/**
 * DIFFICULTY SYSTEM — Progressive difficulty unlocks.
 * Beat one to unlock the next. Each adds modifiers to combat.
 */

export interface Difficulty {
  id: string;
  name: string;
  description: string;
  /** Enemy stat multipliers */
  enemyHpMult: number;
  enemyDamageMult: number;
  enemySpeedMult: number;
  /** Gold multiplier (higher difficulties = more gold) */
  goldMult: number;
  /** Extra enemies per wave (percentage) */
  extraEnemyPct: number;
  /** Is this unlocked from start? */
  unlockedByDefault: boolean;
  /** Color for UI */
  color: string;
  /** Icon */
  icon: string;
}

export const ALL_DIFFICULTIES: Difficulty[] = [
  {
    id: 'recruit',
    name: 'Recruta',
    description: 'Para iniciantes. Inimigos fracos, aprenda as mecânicas.',
    enemyHpMult: 0.7, enemyDamageMult: 0.7, enemySpeedMult: 0.8,
    goldMult: 0.8, extraEnemyPct: 0,
    unlockedByDefault: true, color: '#4ade80', icon: '🌱',
  },
  {
    id: 'soldier',
    name: 'Soldado',
    description: 'A experiência padrão. Equilibrada e desafiadora.',
    enemyHpMult: 1.0, enemyDamageMult: 1.0, enemySpeedMult: 1.0,
    goldMult: 1.0, extraEnemyPct: 0,
    unlockedByDefault: true, color: '#fbbf24', icon: '⚔',
  },
  {
    id: 'veteran',
    name: 'Veterano',
    description: 'Inimigos mais fortes e numerosos. +20% HP, +15% dano.',
    enemyHpMult: 1.2, enemyDamageMult: 1.15, enemySpeedMult: 1.1,
    goldMult: 1.2, extraEnemyPct: 15,
    unlockedByDefault: false, color: '#f97316', icon: '🔥',
  },
  {
    id: 'elite',
    name: 'Elite',
    description: 'Para jogadores experientes. +50% HP, +30% dano, +20% velocidade.',
    enemyHpMult: 1.5, enemyDamageMult: 1.3, enemySpeedMult: 1.2,
    goldMult: 1.4, extraEnemyPct: 25,
    unlockedByDefault: false, color: '#ef4444', icon: '💀',
  },
  {
    id: 'nightmare',
    name: 'Pesadelo',
    description: 'Quase impossível. +100% HP, +50% dano, enxames maiores.',
    enemyHpMult: 2.0, enemyDamageMult: 1.5, enemySpeedMult: 1.3,
    goldMult: 1.8, extraEnemyPct: 40,
    unlockedByDefault: false, color: '#a855f7', icon: '👁',
  },
  {
    id: 'extinction',
    name: 'Extinção',
    description: 'A humanidade não deveria ter chegado aqui. Boa sorte.',
    enemyHpMult: 3.0, enemyDamageMult: 2.0, enemySpeedMult: 1.5,
    goldMult: 2.5, extraEnemyPct: 60,
    unlockedByDefault: false, color: '#dc2626', icon: '☠',
  },
];

const DIFFICULTY_STORAGE = 'packinvaders_difficulties_unlocked';

export function getUnlockedDifficulties(): Set<string> {
  try {
    const raw = localStorage.getItem(DIFFICULTY_STORAGE);
    if (!raw) return new Set(ALL_DIFFICULTIES.filter(d => d.unlockedByDefault).map(d => d.id));
    return new Set(JSON.parse(raw));
  } catch { return new Set(['recruit', 'soldier']); }
}

export function unlockNextDifficulty(currentId: string): string | null {
  const idx = ALL_DIFFICULTIES.findIndex(d => d.id === currentId);
  if (idx < 0 || idx >= ALL_DIFFICULTIES.length - 1) return null;
  const next = ALL_DIFFICULTIES[idx + 1];
  const unlocked = getUnlockedDifficulties();
  unlocked.add(next.id);
  localStorage.setItem(DIFFICULTY_STORAGE, JSON.stringify([...unlocked]));
  return next.id;
}

export function getDifficultyById(id: string): Difficulty {
  return ALL_DIFFICULTIES.find(d => d.id === id) || ALL_DIFFICULTIES[1];
}
