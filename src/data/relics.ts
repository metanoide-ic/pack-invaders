/**
 * RELICS — Permanent meta-progression items.
 * Dropped by bosses (each boss drops its own signature relic first).
 * Persist across runs (saved in localStorage). Every collected relic is
 * active — hunting down all 20 bosses builds your permanent power.
 */

export interface Relic {
  id: string;
  name: string;
  description: string;
  icon: string;
  /** Boss whose kill drops this relic (undefined = generic random drop) */
  bossId?: string;
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
  critPercent?: number;
  dodgePercent?: number;
  damageReductionPercent?: number;
  shopDiscountPercent?: number;
  pickupRadiusPercent?: number;
}

export const ALL_RELICS: Relic[] = [
  { id: 'r_alien_tooth', name: 'Dente de Vrox', description: '+5% dano base.', icon: '🦷',
    bonus: { damagePercent: 5 } },
  { id: 'r_hydra_scale', name: 'Escama de Nydra', description: '+10 HP máximo.', icon: '🐍',
    bossId: 'boss_hydra', bonus: { hpBonus: 10 } },
  { id: 'r_swarm_core', name: 'Núcleo do Enxame', description: '+5% cadência.', icon: '🐝',
    bossId: 'boss_swarm_queen', bonus: { fireRatePercent: 5 } },
  { id: 'r_toxar_gland', name: 'Glândula de Toxar', description: '+1 HP/s regeneração.', icon: '☠',
    bossId: 'boss_toxar', bonus: { healPerSecond: 1 } },
  { id: 'r_titan_shard', name: 'Fragmento do Titã', description: '+5 escudo máximo.', icon: '💎',
    bossId: 'boss_titan_prime', bonus: { shieldBonus: 5 } },
  { id: 'r_criox_crystal', name: 'Cristal de Criox', description: '+10% gold de kills.', icon: '❄',
    bossId: 'boss_criox', bonus: { goldPercent: 10 } },
  { id: 'r_phantax_eye', name: 'Olho de Phantax', description: '-10% cooldown de skills.', icon: '👁',
    bossId: 'boss_phantax', bonus: { skillCooldownReduction: 10 } },
  { id: 'r_gluthar_heart', name: 'Coração de Gluthar', description: '+15 HP máximo.', icon: '💜',
    bossId: 'boss_devourer', bonus: { hpBonus: 15 } },
  { id: 'r_vulkra_flame', name: 'Chama de Vulkra', description: '+8% dano.', icon: '🔥',
    bossId: 'boss_vulkra', bonus: { damagePercent: 8 } },
  { id: 'r_zethar_bolt', name: 'Raio de Zethar', description: '+8% cadência.', icon: '⚡',
    bossId: 'boss_storm_king', bonus: { fireRatePercent: 8 } },
  { id: 'r_solyx_light', name: 'Luz de Solyx', description: '+2 HP/s regeneração.', icon: '☀',
    bossId: 'boss_solyx', bonus: { healPerSecond: 2 } },
  { id: 'r_epoch_fragment', name: 'Fragmento de Epoch', description: '-15% cooldown skills.', icon: '⏳',
    bossId: 'boss_epoch', bonus: { skillCooldownReduction: 15 } },
  { id: 'r_drill_bit', name: 'Broca do Sargento', description: '+5% chance de crítico.', icon: '⛏',
    bossId: 'boss_drill_sergeant', bonus: { critPercent: 5 } },
  { id: 'r_architect_blueprint', name: 'Planta do Arquiteto', description: '-10% preços na loja.', icon: '📐',
    bossId: 'boss_architect', bonus: { shopDiscountPercent: 10 } },
  { id: 'r_kepler_lens', name: 'Lente de Kepler', description: '+40% raio de coleta de power-ups.', icon: '🔭',
    bossId: 'boss_kepler_prime', bonus: { pickupRadiusPercent: 40 } },
  { id: 'r_terravox_core', name: 'Núcleo de Terravox', description: '-5% dano recebido.', icon: '🗿',
    bossId: 'boss_terravox', bonus: { damageReductionPercent: 5 } },
  { id: 'r_abyssara_pearl', name: 'Pérola de Abyssara', description: '+10 escudo máximo.', icon: '🦪',
    bossId: 'boss_abyssara', bonus: { shieldBonus: 10 } },
  { id: 'r_mechron_gear', name: 'Engrenagem de Mechron', description: '+6% cadência.', icon: '⚙',
    bossId: 'boss_mechron', bonus: { fireRatePercent: 6 } },
  { id: 'r_voidmaw_fang', name: 'Presa de Voidmaw', description: '+5% esquiva.', icon: '🌑',
    bossId: 'boss_voidmaw', bonus: { dodgePercent: 5 } },
  { id: 'r_astral_scale', name: 'Escama Astral', description: '+8% gold de kills.', icon: '🌠',
    bossId: 'boss_astral_serpent', bonus: { goldPercent: 8 } },
  { id: 'r_harbinger_sigil', name: 'Sígilo do Arauto', description: '+10% dano.', icon: '🔱',
    bossId: 'boss_harbinger', bonus: { damagePercent: 10 } },
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

/** Get equipped relics — every collected relic is active */
export function getEquippedRelics(): Relic[] {
  const collected = getCollectedRelics();
  return collected.map(id => ALL_RELICS.find(r => r.id === id)).filter(Boolean) as Relic[];
}

/** Get total bonus from all equipped relics */
export function getRelicBonuses(): RelicBonus {
  const equipped = getEquippedRelics();
  const total: RelicBonus = {};
  for (const r of equipped) {
    for (const key of Object.keys(r.bonus) as (keyof RelicBonus)[]) {
      const v = r.bonus[key];
      if (v) total[key] = (total[key] ?? 0) + v;
    }
  }
  return total;
}

/** The signature relic for a killed boss, if not yet collected */
export function getRelicForBoss(bossDefId: string): Relic | null {
  const collected = new Set(getCollectedRelics());
  const relic = ALL_RELICS.find(r => r.bossId === bossDefId);
  return relic && !collected.has(relic.id) ? relic : null;
}

/** Pick a random relic that hasn't been collected yet */
export function getRandomNewRelic(): Relic | null {
  const collected = new Set(getCollectedRelics());
  const available = ALL_RELICS.filter(r => !collected.has(r.id));
  if (available.length === 0) return null;
  return available[Math.floor(Math.random() * available.length)];
}
