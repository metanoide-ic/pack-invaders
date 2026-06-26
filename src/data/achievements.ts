/**
 * ACHIEVEMENTS — Track player milestones.
 * Stored in localStorage. Displayed in main menu.
 */

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  /** Check function called with stats */
  condition: (stats: AchievementStats) => boolean;
}

export interface AchievementStats {
  totalKills: number;
  totalGoldEarned: number;
  totalItemsBought: number;
  totalMonthsSurvived: number;
  totalRuns: number;
  bossesKilled: number;
  maxCombo: number;
  charactersUnlocked: number;
  collectiblesFound: number;
}

export const ALL_ACHIEVEMENTS: Achievement[] = [
  { id: 'first_blood', name: 'Primeiro Sangue', description: 'Mate seu primeiro inimigo.', icon: '⚔',
    condition: (s) => s.totalKills >= 1 },
  { id: 'centurion', name: 'Centurião', description: 'Mate 100 inimigos no total.', icon: '💀',
    condition: (s) => s.totalKills >= 100 },
  { id: 'slayer', name: 'Exterminador', description: 'Mate 1000 inimigos no total.', icon: '☠',
    condition: (s) => s.totalKills >= 1000 },
  { id: 'genocide', name: 'Genocídio Alienígena', description: 'Mate 5000 inimigos.', icon: '🔥',
    condition: (s) => s.totalKills >= 5000 },

  { id: 'survivor_6', name: 'Meio Ano', description: 'Sobreviva 6 meses.', icon: '📅',
    condition: (s) => s.totalMonthsSurvived >= 6 },
  { id: 'survivor_12', name: 'Aniversário', description: 'Sobreviva 1 ano completo.', icon: '🎂',
    condition: (s) => s.totalMonthsSurvived >= 12 },
  { id: 'survivor_24', name: 'Veterano', description: 'Sobreviva 2 anos.', icon: '🎖',
    condition: (s) => s.totalMonthsSurvived >= 24 },
  { id: 'survivor_48', name: 'Lenda', description: 'Sobreviva 4 anos.', icon: '👑',
    condition: (s) => s.totalMonthsSurvived >= 48 },

  { id: 'boss_first', name: 'Caça-Boss', description: 'Derrote seu primeiro boss.', icon: '🐉',
    condition: (s) => s.bossesKilled >= 1 },
  { id: 'boss_hunter', name: 'Matador de Titãs', description: 'Derrote 10 bosses.', icon: '⚡',
    condition: (s) => s.bossesKilled >= 10 },

  { id: 'combo_5', name: 'Combo Iniciante', description: 'Alcance um combo de 5.', icon: '✨',
    condition: (s) => s.maxCombo >= 5 },
  { id: 'combo_15', name: 'Combo Mestre', description: 'Alcance um combo de 15.', icon: '💫',
    condition: (s) => s.maxCombo >= 15 },
  { id: 'combo_30', name: 'Frenesi', description: 'Alcance um combo de 30.', icon: '🌟',
    condition: (s) => s.maxCombo >= 30 },

  { id: 'shopper', name: 'Consumista', description: 'Compre 50 itens no total.', icon: '🛒',
    condition: (s) => s.totalItemsBought >= 50 },
  { id: 'rich', name: 'Magnata', description: 'Acumule 1000 gold no total.', icon: '💰',
    condition: (s) => s.totalGoldEarned >= 1000 },

  { id: 'unlock_2', name: 'Novos Horizontes', description: 'Desbloqueie 2 personagens.', icon: '🔓',
    condition: (s) => s.charactersUnlocked >= 2 },
  { id: 'unlock_all', name: 'Elenco Completo', description: 'Desbloqueie todos os 7 personagens.', icon: '🏆',
    condition: (s) => s.charactersUnlocked >= 7 },

  { id: 'collector_10', name: 'Colecionador', description: 'Encontre 10 colecionáveis.', icon: '📜',
    condition: (s) => s.collectiblesFound >= 10 },
  { id: 'collector_all', name: 'Arquivista', description: 'Encontre todos os 36 colecionáveis.', icon: '📚',
    condition: (s) => s.collectiblesFound >= 36 },

  { id: 'persistent', name: 'Persistente', description: 'Complete 10 runs.', icon: '🔄',
    condition: (s) => s.totalRuns >= 10 },
  { id: 'addict', name: 'Viciado', description: 'Complete 50 runs.', icon: '♾',
    condition: (s) => s.totalRuns >= 50 },
];

const ACHIEVEMENT_STORAGE_KEY = 'packinvaders_achievements';
const STATS_STORAGE_KEY = 'packinvaders_global_stats';

/** Get saved achievement IDs */
export function getUnlockedAchievements(): Set<string> {
  try {
    const raw = localStorage.getItem(ACHIEVEMENT_STORAGE_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw));
  } catch { return new Set(); }
}

/** Save unlocked achievements */
export function saveAchievements(unlocked: Set<string>): void {
  localStorage.setItem(ACHIEVEMENT_STORAGE_KEY, JSON.stringify([...unlocked]));
}

/** Get global accumulated stats */
export function getGlobalStats(): AchievementStats {
  try {
    const raw = localStorage.getItem(STATS_STORAGE_KEY);
    if (!raw) return defaultStats();
    return { ...defaultStats(), ...JSON.parse(raw) };
  } catch { return defaultStats(); }
}

/** Update global stats (additive) */
export function updateGlobalStats(delta: Partial<AchievementStats>): void {
  const current = getGlobalStats();
  for (const [key, val] of Object.entries(delta)) {
    if (key === 'maxCombo') {
      (current as any)[key] = Math.max((current as any)[key] || 0, val as number);
    } else {
      (current as any)[key] = ((current as any)[key] || 0) + (val as number);
    }
  }
  localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(current));
}

/** Check all achievements against current stats, return newly unlocked */
export function checkAchievements(): string[] {
  const stats = getGlobalStats();
  const unlocked = getUnlockedAchievements();
  const newlyUnlocked: string[] = [];

  for (const ach of ALL_ACHIEVEMENTS) {
    if (!unlocked.has(ach.id) && ach.condition(stats)) {
      unlocked.add(ach.id);
      newlyUnlocked.push(ach.id);
    }
  }

  if (newlyUnlocked.length > 0) {
    saveAchievements(unlocked);
  }
  return newlyUnlocked;
}

function defaultStats(): AchievementStats {
  return {
    totalKills: 0, totalGoldEarned: 0, totalItemsBought: 0,
    totalMonthsSurvived: 0, totalRuns: 0, bossesKilled: 0,
    maxCombo: 0, charactersUnlocked: 1, collectiblesFound: 0,
  };
}
