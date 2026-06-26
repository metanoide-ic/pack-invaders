/**
 * RELICS — Permanent meta-progression items.
 * Dropped by bosses. Persist across runs (saved in localStorage).
 * Each relic gives a small passive bonus. Max 5 equipped at a time.
 */

export interface Relic {
  id: string;
  name: string;
  description: string;
  icon: string;
  /** Stat bonuses applied at game start */
  bonus: RelicBonus;
}

export interface RelicBonus {
  hpBonus?: number;
  damagePercent?: number;
  fireRatePercent?: number;
  goldPercent?: number;
  shieldBonus?: number;
  healPerSecond?: number;
  skillCooldownReduction?: number;
}

export const ALL_RELICS: Relic[] = [
  { id: 'r_alien_tooth', name: 'Dente de Vrox', description: '+5% dano base.', icon: '🦷',
    bonus: { damagePercent: 5 } },
  { id: 'r_hydra_scale', name: 'Escama de Nydra', description: '+10 HP máximo.', icon: '🐍',
    bonus: { hpBonus: 10 } },
  { id: 'r_swarm_core', name: 'Núcleo do Enxame', description: '+5% cadência.', icon: '🐝',
    bonus: { fireRatePercent: 5 } },
  { id: 'r_toxar_gland', name: 'Glândula de Toxar', description: '+1 HP/s regeneração.', icon: '☠',
    bonus: { healPerSecond: 1 } },
  { id: 'r_titan_shard', name: 'Fragmento do Titã', description: '+5 escudo máximo.', icon: '💎',
    bonus: { shieldBonus: 5 } },
  { id: 'r_criox_crystal', name: 'Cristal de Criox', description: '+10% gold de kills.', icon: '❄',
    bonus: { goldPercent: 10 } },
  { id: 'r_phantax_eye', name: 'Olho de Phantax', description: '-10% cooldown de skills.', icon: '👁',
    bonus: { skillCooldownReduction: 10 } },
  { id: 'r_gluthar_heart', name: 'Coração de Gluthar', description: '+15 HP máximo.', icon: '💜',
    bonus: { hpBonus: 15 } },
  { id: 'r_vulkra_flame', name: 'Chama de Vulkra', description: '+8% dano.', icon: '🔥',
    bonus: { damagePercent: 8 } },
  { id: 'r_zethar_bolt', name: 'Raio de Zethar', description: '+8% cadência.', icon: '⚡',
    bonus: { fireRatePercent: 8 } },
  { id: 'r_solyx_light', name: 'Luz de Solyx', description: '+2 HP/s regeneração.', icon: '☀',
    bonus: { healPerSecond: 2 } },
  { id: 'r_epoch_fragment', name: 'Fragmento de Epoch', description: '-15% cooldown skills.', icon: '⏳',
    bonus: { skillCooldownReduction: 15 } },
];

const RELIC_STORAGE_KEY = 'packinvaders_relics';

/** Get all collected relic IDs */
export function getCollectedRelics(): string[] {
  try {
    const raw = localStorage.getItem(RELIC_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch { return []; }
}

/** Add a relic to the collection */
export function addRelic(relicId: string): void {
  const collected = getCollectedRelics();
  if (!collected.includes(relicId)) {
    collected.push(relicId);
    localStorage.setItem(RELIC_STORAGE_KEY, JSON.stringify(collected));
  }
}

/** Get equipped relics (first 5 collected) */
export function getEquippedRelics(): Relic[] {
  const collected = getCollectedRelics();
  return collected.slice(0, 5).map(id => ALL_RELICS.find(r => r.id === id)).filter(Boolean) as Relic[];
}

/** Get total bonus from all equipped relics */
export function getRelicBonuses(): RelicBonus {
  const equipped = getEquippedRelics();
  const total: RelicBonus = {};
  for (const r of equipped) {
    if (r.bonus.hpBonus) total.hpBonus = (total.hpBonus ?? 0) + r.bonus.hpBonus;
    if (r.bonus.damagePercent) total.damagePercent = (total.damagePercent ?? 0) + r.bonus.damagePercent;
    if (r.bonus.fireRatePercent) total.fireRatePercent = (total.fireRatePercent ?? 0) + r.bonus.fireRatePercent;
    if (r.bonus.goldPercent) total.goldPercent = (total.goldPercent ?? 0) + r.bonus.goldPercent;
    if (r.bonus.shieldBonus) total.shieldBonus = (total.shieldBonus ?? 0) + r.bonus.shieldBonus;
    if (r.bonus.healPerSecond) total.healPerSecond = (total.healPerSecond ?? 0) + r.bonus.healPerSecond;
    if (r.bonus.skillCooldownReduction) total.skillCooldownReduction = (total.skillCooldownReduction ?? 0) + r.bonus.skillCooldownReduction;
  }
  return total;
}

/** Pick a random relic that hasn't been collected yet */
export function getRandomNewRelic(): Relic | null {
  const collected = new Set(getCollectedRelics());
  const available = ALL_RELICS.filter(r => !collected.has(r.id));
  if (available.length === 0) return null;
  return available[Math.floor(Math.random() * available.length)];
}
