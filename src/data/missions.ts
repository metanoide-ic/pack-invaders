/**
 * MISSIONS — 9 Kings-style meta-progression with claimable rewards.
 *
 * Missions track lifetime stats (reusing the global achievement stats) and, once
 * complete, can be CLAIMED for a permanent reward: bonus starting gold applied to
 * every future run. This gives the long-term "get stronger between runs" loop.
 */

import { AchievementStats, getGlobalStats } from './achievements';

export interface Mission {
  id: string;
  name: string;
  description: string;
  icon: string;
  /** Which lifetime stat this mission tracks */
  stat: keyof AchievementStats;
  /** Target value to complete */
  goal: number;
  /** Permanent bonus starting gold granted when claimed */
  rewardGold: number;
}

// Reward values are intentionally small — this bonus is permanent and
// stacks forever (every claimed mission adds to every future run's starting
// gold via getMetaGoldBonus). At the old 10-50 scale, a completionist ended
// up with +340 starting gold against a 30-80 starting-gold cast and a
// first-shop income of ~90-100g total — enough to trivialize the shop from
// month 1 onward for anyone who'd played a few runs. Full completion now
// adds ~+81, a real but modest edge instead of a run-breaking one.
export const ALL_MISSIONS: Mission[] = [
  { id: 'm_kills_50',     name: 'Linha de Frente',   description: 'Mate 50 inimigos no total.',        icon: '⚔', stat: 'totalKills',          goal: 50,   rewardGold: 3 },
  { id: 'm_kills_500',    name: 'Máquina de Guerra',  description: 'Mate 500 inimigos no total.',       icon: '💀', stat: 'totalKills',          goal: 500,  rewardGold: 6 },
  { id: 'm_kills_2000',   name: 'Tempestade de Aço',  description: 'Mate 2000 inimigos no total.',      icon: '🔥', stat: 'totalKills',          goal: 2000, rewardGold: 12 },
  { id: 'm_boss_3',       name: 'Caçador de Titãs',   description: 'Derrote 3 bosses.',                 icon: '🐉', stat: 'bossesKilled',        goal: 3,    rewardGold: 5 },
  { id: 'm_boss_15',      name: 'Mata-Titãs',         description: 'Derrote 15 bosses.',                icon: '⚡', stat: 'bossesKilled',        goal: 15,   rewardGold: 10 },
  { id: 'm_months_12',    name: 'Um Ano de Guerra',   description: 'Sobreviva 12 meses no total.',      icon: '📅', stat: 'totalMonthsSurvived', goal: 12,   rewardGold: 4 },
  { id: 'm_months_48',    name: 'Resistência',        description: 'Sobreviva 48 meses no total.',      icon: '🎖', stat: 'totalMonthsSurvived', goal: 48,   rewardGold: 9 },
  { id: 'm_runs_10',      name: 'Persistência',       description: 'Complete 10 runs.',                 icon: '🔄', stat: 'totalRuns',           goal: 10,   rewardGold: 5 },
  { id: 'm_chars_4',      name: 'Esquadrão',          description: 'Desbloqueie 4 personagens.',        icon: '🔓', stat: 'charactersUnlocked',  goal: 4,    rewardGold: 7 },
  { id: 'm_combo_25',     name: 'Imparável',          description: 'Alcance um combo de 25.',           icon: '🌟', stat: 'maxCombo',            goal: 25,   rewardGold: 6 },
  { id: 'm_collect_20',   name: 'Arquivista',         description: 'Encontre 20 colecionáveis.',        icon: '📜', stat: 'collectiblesFound',   goal: 20,   rewardGold: 6 },
  { id: 'm_gold_5000',    name: 'Magnata da Guerra',  description: 'Acumule 5000 gold no total.',       icon: '💰', stat: 'totalGoldEarned',     goal: 5000, rewardGold: 8 },
];

const CLAIMED_KEY = 'packinvaders_missions_claimed';
const META_GOLD_KEY = 'packinvaders_meta_gold';

/** IDs of missions whose reward has been claimed. */
export function getClaimedMissions(): Set<string> {
  try {
    const raw = localStorage.getItem(CLAIMED_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch { return new Set(); }
}

function saveClaimed(set: Set<string>): void {
  localStorage.setItem(CLAIMED_KEY, JSON.stringify([...set]));
}

/** Permanent bonus starting gold earned from claimed missions. */
export function getMetaGoldBonus(): number {
  try { return parseInt(localStorage.getItem(META_GOLD_KEY) || '0', 10) || 0; }
  catch { return 0; }
}

export interface MissionProgress { value: number; complete: boolean; pct: number; }

export function getMissionProgress(m: Mission, stats: AchievementStats = getGlobalStats()): MissionProgress {
  const value = (stats as any)[m.stat] ?? 0;
  return { value, complete: value >= m.goal, pct: Math.min(1, value / m.goal) };
}

/** Claim a completed, unclaimed mission. Returns the reward gold applied (0 if not claimable). */
export function claimMission(id: string): number {
  const m = ALL_MISSIONS.find(x => x.id === id);
  if (!m) return 0;
  const claimed = getClaimedMissions();
  if (claimed.has(id)) return 0;
  if (!getMissionProgress(m).complete) return 0;
  claimed.add(id);
  saveClaimed(claimed);
  localStorage.setItem(META_GOLD_KEY, String(getMetaGoldBonus() + m.rewardGold));
  return m.rewardGold;
}

/** Number of missions that are complete but not yet claimed (for a menu badge). */
export function getClaimableMissionCount(stats: AchievementStats = getGlobalStats()): number {
  const claimed = getClaimedMissions();
  return ALL_MISSIONS.filter(m => !claimed.has(m.id) && getMissionProgress(m, stats).complete).length;
}
