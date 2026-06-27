/**
 * ENEMY DEFINITIONS — 15 distinct enemy types.
 * Each enemy has movement pattern, stats, element, and special behavior.
 */

import { Tag } from '../core/ItemSystem';

export interface EnemyDefinition {
  id: string;
  name: string;
  tags: Tag[];
  hp: number;
  speed: number;
  damage: number;
  width: number;
  height: number;
  goldReward: number;
  armor: number;
  /** Movement pattern */
  movement: 'straight' | 'sine' | 'zigzag' | 'erratic' | 'charge' | 'strafe';
  /** Special behavior */
  special?: EnemySpecial;
  /** Sprite key for SpriteGen lookup */
  spriteId: string;
  /** Minimum wave to appear */
  minWave: number;
  /** Spawn weight (higher = more common) */
  weight: number;
}

export type EnemySpecial =
  | { type: 'shoot'; fireRate: number; projectileSpeed: number }
  | { type: 'explode'; radius: number; damage: number }
  | { type: 'split'; childId: string; count: number }
  | { type: 'spawn'; childId: string; interval: number }
  | { type: 'phase'; chance: number }
  | { type: 'armor'; hits: number }
  | { type: 'slow_on_hit'; duration: number }
  | { type: 'drain'; range: number; dps: number };

// ─── Basic Enemies (available from start) ────────────────────────────────────

export const ENEMY_SCOUT: EnemyDefinition = {
  id: 'scout',
  name: 'Cuspidor',
  tags: [],
  hp: 8,
  speed: 60,
  damage: 4,
  width: 16,
  height: 16,
  goldReward: 2,
  armor: 0,
  movement: 'straight',
  spriteId: 'scout',
  minWave: 1,
  weight: 10,
};

export const ENEMY_GRUNT: EnemyDefinition = {
  id: 'grunt',
  name: 'Grunto',
  tags: [],
  hp: 20,
  speed: 35,
  damage: 6,
  width: 24,
  height: 24,
  goldReward: 4,
  armor: 0,
  movement: 'straight',
  spriteId: 'grunt',
  minWave: 1,
  weight: 8,
};

export const ENEMY_TANK: EnemyDefinition = {
  id: 'tank',
  name: 'Coura�a',
  tags: [],
  hp: 60,
  speed: 15,
  damage: 10,
  width: 32,
  height: 32,
  goldReward: 8,
  armor: 2,
  movement: 'straight',
  spriteId: 'tank',
  minWave: 3,
  weight: 4,
};

export const ENEMY_SHOOTER: EnemyDefinition = {
  id: 'shooter',
  name: 'Agulha',
  tags: [],
  hp: 15,
  speed: 25,
  damage: 5,
  width: 24,
  height: 24,
  goldReward: 5,
  armor: 0,
  movement: 'strafe',
  special: { type: 'shoot', fireRate: 1.5, projectileSpeed: 200 },
  spriteId: 'shooter',
  minWave: 2,
  weight: 6,
};

export const ENEMY_ZIGZAG: EnemyDefinition = {
  id: 'zigzag',
  name: 'Serpe',
  tags: [],
  hp: 12,
  speed: 45,
  damage: 5,
  width: 16,
  height: 16,
  goldReward: 3,
  armor: 0,
  movement: 'sine',
  spriteId: 'zigzag',
  minWave: 2,
  weight: 7,
};

export const ENEMY_SWARM: EnemyDefinition = {
  id: 'swarm',
  name: 'Larva',
  tags: [],
  hp: 4,
  speed: 50,
  damage: 2,
  width: 16,
  height: 16,
  goldReward: 1,
  armor: 0,
  movement: 'straight',
  spriteId: 'swarm',
  minWave: 1,
  weight: 12,
};

export const ENEMY_SHIELD_BEARER: EnemyDefinition = {
  id: 'shield_bearer',
  name: 'Muralha',
  tags: [],
  hp: 30,
  speed: 20,
  damage: 8,
  width: 32,
  height: 32,
  goldReward: 7,
  armor: 0,
  movement: 'straight',
  special: { type: 'armor', hits: 3 },
  spriteId: 'shield_bearer',
  minWave: 4,
  weight: 4,
};

export const ENEMY_BOMBER: EnemyDefinition = {
  id: 'bomber',
  name: 'Inchado',
  tags: ['Explosivo'],
  hp: 25,
  speed: 30,
  damage: 12,
  width: 32,
  height: 32,
  goldReward: 6,
  armor: 0,
  movement: 'straight',
  special: { type: 'explode', radius: 80, damage: 15 },
  spriteId: 'bomber',
  minWave: 3,
  weight: 5,
};

// ─── Elemental Enemies (unlock with characters) ──────────────────────────────

export const ENEMY_FIRE_IMP: EnemyDefinition = {
  id: 'fire_imp',
  name: 'Brasa',
  tags: ['Fogo'],
  hp: 14,
  speed: 55,
  damage: 6,
  width: 16,
  height: 16,
  goldReward: 4,
  armor: 0,
  movement: 'zigzag',
  spriteId: 'fire_imp',
  minWave: 5,
  weight: 5,
};

export const ENEMY_ICE_GOLEM: EnemyDefinition = {
  id: 'ice_golem',
  name: 'Crioforte',
  tags: ['Gelo', 'Água'],
  hp: 50,
  speed: 12,
  damage: 8,
  width: 24,
  height: 24,
  goldReward: 8,
  armor: 3,
  movement: 'straight',
  special: { type: 'slow_on_hit', duration: 2 },
  spriteId: 'ice_golem',
  minWave: 6,
  weight: 3,
};

export const ENEMY_VINE_CREEP: EnemyDefinition = {
  id: 'vine_creep',
  name: 'Esporo-Raiz',
  tags: ['Orgânico', 'Planta'],
  hp: 16,
  speed: 30,
  damage: 4,
  width: 16,
  height: 16,
  goldReward: 4,
  armor: 0,
  movement: 'sine',
  special: { type: 'split', childId: 'scout', count: 2 },
  spriteId: 'vine_creep',
  minWave: 5,
  weight: 5,
};

export const ENEMY_THUNDER_BUG: EnemyDefinition = {
  id: 'thunder_bug',
  name: 'Fagulha',
  tags: ['Elétrico'],
  hp: 10,
  speed: 80,
  damage: 5,
  width: 16,
  height: 16,
  goldReward: 4,
  armor: 0,
  movement: 'erratic',
  spriteId: 'thunder_bug',
  minWave: 6,
  weight: 5,
};

export const ENEMY_SHADOW_WRAITH: EnemyDefinition = {
  id: 'shadow_wraith',
  name: 'Vulto',
  tags: [],
  hp: 22,
  speed: 35,
  damage: 7,
  width: 24,
  height: 24,
  goldReward: 6,
  armor: 0,
  movement: 'sine',
  special: { type: 'phase', chance: 0.5 },
  spriteId: 'shadow_wraith',
  minWave: 7,
  weight: 4,
};

// ─── Bosses ──────────────────────────────────────────────────────────────────

export const BOSS_DRILL_SERGEANT: EnemyDefinition = {
  id: 'boss_drill_sergeant',
  name: 'Vrox, o Perfurador',
  tags: [],
  hp: 300,
  speed: 10,
  damage: 20,
  width: 48,
  height: 48,
  goldReward: 50,
  armor: 5,
  movement: 'charge',
  special: { type: 'spawn', childId: 'scout', interval: 3 },
  spriteId: 'boss_drill_sergeant',
  minWave: 5,
  weight: 0, // Boss, spawned explicitly
};

export const BOSS_HYDRA: EnemyDefinition = {
  id: 'boss_hydra',
  name: 'Nydra, a Multifauce',
  tags: [],
  hp: 400,
  speed: 8,
  damage: 15,
  width: 48,
  height: 48,
  goldReward: 75,
  armor: 3,
  movement: 'straight',
  special: { type: 'shoot', fireRate: 3, projectileSpeed: 180 },
  spriteId: 'boss_hydra',
  minWave: 10,
  weight: 0, // Boss, spawned explicitly
};

// ─── New Enemies (16-25) ─────────────────────────────────────────────────────

export const ENEMY_HEALER: EnemyDefinition = {
  id: 'healer',
  name: 'Sutura',
  tags: ['Orgânico'],
  hp: 18,
  speed: 25,
  damage: 3,
  width: 24,
  height: 24,
  goldReward: 6,
  armor: 0,
  movement: 'sine',
  spriteId: 'healer',
  minWave: 4,
  weight: 4,
};

export const ENEMY_TELEPORTER: EnemyDefinition = {
  id: 'teleporter',
  name: 'Piscante',
  tags: ['Elétrico'],
  hp: 14,
  speed: 30,
  damage: 5,
  width: 16,
  height: 16,
  goldReward: 5,
  armor: 0,
  movement: 'erratic',
  spriteId: 'teleporter',
  minWave: 5,
  weight: 4,
};

export const ENEMY_SPLITTER: EnemyDefinition = {
  id: 'splitter',
  name: 'Cis�o',
  tags: [],
  hp: 24,
  speed: 30,
  damage: 4,
  width: 24,
  height: 24,
  goldReward: 5,
  armor: 0,
  movement: 'straight',
  special: { type: 'split', childId: 'scout', count: 2 },
  spriteId: 'splitter',
  minWave: 4,
  weight: 4,
};

export const ENEMY_MAGNETIC: EnemyDefinition = {
  id: 'magnetic',
  name: 'Polo',
  tags: ['Elétrico'],
  hp: 30,
  speed: 20,
  damage: 6,
  width: 24,
  height: 24,
  goldReward: 7,
  armor: 1,
  movement: 'straight',
  special: { type: 'phase', chance: 0.3 },
  spriteId: 'magnetic',
  minWave: 6,
  weight: 3,
};

export const ENEMY_REFLECTOR: EnemyDefinition = {
  id: 'reflector',
  name: 'Espelhar',
  tags: [],
  hp: 28,
  speed: 22,
  damage: 5,
  width: 24,
  height: 24,
  goldReward: 6,
  armor: 2,
  movement: 'straight',
  special: { type: 'armor', hits: 5 },
  spriteId: 'reflector',
  minWave: 6,
  weight: 3,
};

export const ENEMY_SPAWNER: EnemyDefinition = {
  id: 'spawner',
  name: 'Ninhada',
  tags: [],
  hp: 40,
  speed: 12,
  damage: 4,
  width: 32,
  height: 32,
  goldReward: 10,
  armor: 1,
  movement: 'straight',
  special: { type: 'spawn', childId: 'scout', interval: 4 },
  spriteId: 'spawner',
  minWave: 7,
  weight: 3,
};

export const ENEMY_BERSERKER: EnemyDefinition = {
  id: 'berserker',
  name: 'Feral',
  tags: ['Fogo'],
  hp: 35,
  speed: 40,
  damage: 10,
  width: 24,
  height: 24,
  goldReward: 8,
  armor: 0,
  movement: 'charge',
  spriteId: 'berserker',
  minWave: 7,
  weight: 3,
};

export const ENEMY_GHOST_SHIP: EnemyDefinition = {
  id: 'ghost_ship',
  name: 'Vaporoso',
  tags: [],
  hp: 20,
  speed: 35,
  damage: 8,
  width: 24,
  height: 24,
  goldReward: 6,
  armor: 0,
  movement: 'sine',
  special: { type: 'phase', chance: 0.7 },
  spriteId: 'ghost_ship',
  minWave: 8,
  weight: 3,
};

export const ENEMY_ACID_BLOB: EnemyDefinition = {
  id: 'acid_blob',
  name: 'Corr�i',
  tags: ['Veneno', 'Orgânico'],
  hp: 22,
  speed: 20,
  damage: 6,
  width: 24,
  height: 24,
  goldReward: 5,
  armor: 0,
  movement: 'straight',
  spriteId: 'acid_blob',
  minWave: 5,
  weight: 4,
};

export const ENEMY_SENTINEL: EnemyDefinition = {
  id: 'sentinel',
  name: 'Monolito',
  tags: [],
  hp: 150,
  speed: 10,
  damage: 15,
  width: 40,
  height: 40,
  goldReward: 30,
  armor: 4,
  movement: 'straight',
  special: { type: 'armor', hits: 5 },
  spriteId: 'sentinel',
  minWave: 8,
  weight: 1,
};

// ─── New Enemies (26-40) ─────────────────────────────────────────────────────

// 26. Frost Archer
export const ENEMY_FROST_ARCHER: EnemyDefinition = {
  id: 'frost_archer',
  name: 'Estilha�o',
  tags: ['Gelo'],
  hp: 18,
  speed: 28,
  damage: 5,
  width: 24,
  height: 24,
  goldReward: 6,
  armor: 0,
  movement: 'strafe',
  special: { type: 'shoot', fireRate: 1.2, projectileSpeed: 220 },
  spriteId: 'frost_archer',
  minWave: 5,
  weight: 4,
};

// 27. Fire Dancer
export const ENEMY_FIRE_DANCER: EnemyDefinition = {
  id: 'fire_dancer',
  name: 'Pirovaga',
  tags: ['Fogo'],
  hp: 16,
  speed: 50,
  damage: 7,
  width: 16,
  height: 16,
  goldReward: 5,
  armor: 0,
  movement: 'sine',
  spriteId: 'fire_dancer',
  minWave: 6,
  weight: 4,
};

// 28. Earth Golem
export const ENEMY_EARTH_GOLEM: EnemyDefinition = {
  id: 'earth_golem',
  name: 'Siltara',
  tags: ['Orgânico'],
  hp: 45,
  speed: 12,
  damage: 9,
  width: 32,
  height: 32,
  goldReward: 9,
  armor: 3,
  movement: 'straight',
  special: { type: 'armor', hits: 5 },
  spriteId: 'earth_golem',
  minWave: 7,
  weight: 3,
};

// 29. Wind Sprite
export const ENEMY_WIND_SPRITE: EnemyDefinition = {
  id: 'wind_sprite',
  name: 'Vendaval',
  tags: ['Vento'],
  hp: 10,
  speed: 70,
  damage: 4,
  width: 16,
  height: 16,
  goldReward: 4,
  armor: 0,
  movement: 'erratic',
  special: { type: 'phase', chance: 0.4 },
  spriteId: 'wind_sprite',
  minWave: 6,
  weight: 4,
};

// 30. Poison Mushroom
export const ENEMY_POISON_MUSHROOM: EnemyDefinition = {
  id: 'poison_mushroom',
  name: 'Fungor',
  tags: ['Veneno', 'Orgânico'],
  hp: 30,
  speed: 5,
  damage: 3,
  width: 24,
  height: 24,
  goldReward: 5,
  armor: 0,
  movement: 'straight',
  special: { type: 'spawn', childId: 'scout', interval: 5 },
  spriteId: 'poison_mushroom',
  minWave: 5,
  weight: 3,
};

// 31. Crystal Guardian
export const ENEMY_CRYSTAL_GUARDIAN: EnemyDefinition = {
  id: 'crystal_guardian',
  name: 'Quartzo',
  tags: [],
  hp: 35,
  speed: 18,
  damage: 8,
  width: 24,
  height: 24,
  goldReward: 8,
  armor: 2,
  movement: 'straight',
  special: { type: 'armor', hits: 3 },
  spriteId: 'crystal_guardian',
  minWave: 7,
  weight: 3,
};

// 32. Shadow Assassin
export const ENEMY_SHADOW_ASSASSIN: EnemyDefinition = {
  id: 'shadow_assassin',
  name: 'Umbral',
  tags: [],
  hp: 15,
  speed: 90,
  damage: 15,
  width: 16,
  height: 16,
  goldReward: 7,
  armor: 0,
  movement: 'charge',
  special: { type: 'phase', chance: 0.6 },
  spriteId: 'shadow_assassin',
  minWave: 8,
  weight: 3,
};

// 33. Lava Slime
export const ENEMY_LAVA_SLIME: EnemyDefinition = {
  id: 'lava_slime',
  name: 'Magmela',
  tags: ['Fogo'],
  hp: 20,
  speed: 25,
  damage: 6,
  width: 24,
  height: 24,
  goldReward: 5,
  armor: 0,
  movement: 'straight',
  special: { type: 'split', childId: 'fire_imp', count: 2 },
  spriteId: 'lava_slime',
  minWave: 6,
  weight: 4,
};

// 34. Storm Cloud
export const ENEMY_STORM_CLOUD: EnemyDefinition = {
  id: 'storm_cloud',
  name: 'Tronar',
  tags: ['Elétrico'],
  hp: 25,
  speed: 20,
  damage: 8,
  width: 32,
  height: 24,
  goldReward: 7,
  armor: 0,
  movement: 'sine',
  special: { type: 'explode', radius: 60, damage: 10 },
  spriteId: 'storm_cloud',
  minWave: 7,
  weight: 3,
};

// 35. Bone Warrior
export const ENEMY_BONE_WARRIOR: EnemyDefinition = {
  id: 'bone_warrior',
  name: 'Osteal',
  tags: [],
  hp: 28,
  speed: 30,
  damage: 9,
  width: 24,
  height: 24,
  goldReward: 7,
  armor: 1,
  movement: 'straight',
  special: { type: 'armor', hits: 99 },
  spriteId: 'bone_warrior',
  minWave: 8,
  weight: 3,
};

// 36. Mimic
export const ENEMY_MIMIC: EnemyDefinition = {
  id: 'mimic',
  name: 'Mimikro',
  tags: [],
  hp: 22,
  speed: 55,
  damage: 12,
  width: 16,
  height: 16,
  goldReward: 10,
  armor: 0,
  movement: 'charge',
  spriteId: 'mimic',
  minWave: 6,
  weight: 3,
};

// 37. Plague Doctor
export const ENEMY_PLAGUE_DOCTOR: EnemyDefinition = {
  id: 'plague_doctor',
  name: 'Flagelo',
  tags: ['Veneno'],
  hp: 24,
  speed: 22,
  damage: 6,
  width: 24,
  height: 24,
  goldReward: 7,
  armor: 1,
  movement: 'straight',
  special: { type: 'shoot', fireRate: 0.8, projectileSpeed: 150 },
  spriteId: 'plague_doctor',
  minWave: 7,
  weight: 3,
};

// 38. Iron Maiden
export const ENEMY_IRON_MAIDEN: EnemyDefinition = {
  id: 'iron_maiden',
  name: 'Ferrox',
  tags: [],
  hp: 50,
  speed: 15,
  damage: 10,
  width: 32,
  height: 32,
  goldReward: 10,
  armor: 5,
  movement: 'straight',
  spriteId: 'iron_maiden',
  minWave: 9,
  weight: 2,
};

// 39. Time Warp
export const ENEMY_TIME_WARP: EnemyDefinition = {
  id: 'time_warp',
  name: 'Cr�nos',
  tags: [],
  hp: 18,
  speed: 25,
  damage: 4,
  width: 24,
  height: 24,
  goldReward: 6,
  armor: 0,
  movement: 'sine',
  special: { type: 'slow_on_hit', duration: 3 },
  spriteId: 'time_warp',
  minWave: 8,
  weight: 3,
};

// 40. Mini Boss: The Swarm Queen
export const BOSS_SWARM_QUEEN: EnemyDefinition = {
  id: 'boss_swarm_queen',
  name: 'Matriarca Krix',
  tags: ['Orgânico'],
  hp: 200,
  speed: 8,
  damage: 12,
  width: 48,
  height: 48,
  goldReward: 60,
  armor: 2,
  movement: 'straight',
  special: { type: 'spawn', childId: 'swarm', interval: 0.33 },
  spriteId: 'boss_swarm_queen',
  minWave: 15,
  weight: 0,
};

// ─── New Enemies (41-60) ─────────────────────────────────────────────────────

// 41. Kamikaze
export const ENEMY_KAMIKAZE: EnemyDefinition = {
  id: 'kamikaze',
  name: 'Vol�til',
  tags: ['Explosivo'],
  hp: 10,
  speed: 180,
  damage: 20,
  width: 16,
  height: 16,
  goldReward: 5,
  armor: 0,
  movement: 'charge',
  special: { type: 'explode', radius: 50, damage: 20 },
  spriteId: 'kamikaze',
  minWave: 6,
  weight: 4,
};

// 42. Helix
export const ENEMY_HELIX: EnemyDefinition = {
  id: 'helix',
  name: 'H�lice',
  tags: [],
  hp: 14,
  speed: 40,
  damage: 5,
  width: 16,
  height: 16,
  goldReward: 4,
  armor: 0,
  movement: 'sine',
  special: { type: 'phase', chance: 0.2 },
  spriteId: 'helix',
  minWave: 5,
  weight: 5,
};

// 43. Phase Wraith
export const ENEMY_PHASE_WRAITH: EnemyDefinition = {
  id: 'phase_wraith',
  name: '�tera',
  tags: [],
  hp: 20,
  speed: 35,
  damage: 8,
  width: 24,
  height: 24,
  goldReward: 6,
  armor: 0,
  movement: 'straight',
  special: { type: 'phase', chance: 0.5 },
  spriteId: 'phase_wraith',
  minWave: 7,
  weight: 3,
};

// 44. Hive Mind
export const ENEMY_HIVE_MIND: EnemyDefinition = {
  id: 'hive_mind',
  name: 'Sinapse',
  tags: ['Orgânico'],
  hp: 40,
  speed: 15,
  damage: 5,
  width: 32,
  height: 32,
  goldReward: 10,
  armor: 1,
  movement: 'straight',
  special: { type: 'spawn', childId: 'swarm', interval: 5 },
  spriteId: 'hive_mind',
  minWave: 8,
  weight: 2,
};

// 45. Spore Cloud
export const ENEMY_SPORE_CLOUD: EnemyDefinition = {
  id: 'spore_cloud',
  name: 'M�celo',
  tags: ['Orgânico', 'Veneno'],
  hp: 35,
  speed: 5,
  damage: 2,
  width: 32,
  height: 32,
  goldReward: 8,
  armor: 0,
  movement: 'straight',
  special: { type: 'spawn', childId: 'scout', interval: 3 },
  spriteId: 'spore_cloud',
  minWave: 7,
  weight: 3,
};

// 46. Crystalline
export const ENEMY_CRYSTALLINE: EnemyDefinition = {
  id: 'crystalline',
  name: 'Faceta',
  tags: [],
  hp: 28,
  speed: 25,
  damage: 7,
  width: 24,
  height: 24,
  goldReward: 7,
  armor: 2,
  movement: 'straight',
  special: { type: 'armor', hits: 1 },
  spriteId: 'crystalline',
  minWave: 6,
  weight: 4,
};

// 47. Magnetic Core
export const ENEMY_MAGNETIC_CORE: EnemyDefinition = {
  id: 'magnetic_core',
  name: 'Atrax',
  tags: ['Elétrico'],
  hp: 45,
  speed: 12,
  damage: 6,
  width: 32,
  height: 32,
  goldReward: 9,
  armor: 2,
  movement: 'straight',
  special: { type: 'phase', chance: 0.2 },
  spriteId: 'magnetic_core',
  minWave: 8,
  weight: 2,
};

// 48. Flame Elemental
export const ENEMY_FLAME_ELEMENTAL: EnemyDefinition = {
  id: 'flame_elemental',
  name: 'Ign�voro',
  tags: ['Fogo'],
  hp: 30,
  speed: 35,
  damage: 9,
  width: 24,
  height: 24,
  goldReward: 7,
  armor: 0,
  movement: 'sine',
  special: { type: 'explode', radius: 40, damage: 8 },
  spriteId: 'flame_elemental',
  minWave: 7,
  weight: 3,
};

// 49. Tide Walker
export const ENEMY_TIDE_WALKER: EnemyDefinition = {
  id: 'tide_walker',
  name: 'Marelha',
  tags: ['Água'],
  hp: 32,
  speed: 22,
  damage: 6,
  width: 24,
  height: 24,
  goldReward: 7,
  armor: 1,
  movement: 'sine',
  spriteId: 'tide_walker',
  minWave: 7,
  weight: 3,
};

// 50. Storm Djinn
export const ENEMY_STORM_DJINN: EnemyDefinition = {
  id: 'storm_djinn',
  name: 'Voltarc',
  tags: ['Elétrico'],
  hp: 26,
  speed: 40,
  damage: 10,
  width: 24,
  height: 24,
  goldReward: 8,
  armor: 0,
  movement: 'strafe',
  special: { type: 'shoot', fireRate: 1.5, projectileSpeed: 250 },
  spriteId: 'storm_djinn',
  minWave: 8,
  weight: 3,
};

// 51. Plague Carrier
export const ENEMY_PLAGUE_CARRIER: EnemyDefinition = {
  id: 'plague_carrier',
  name: 'Pest�fero',
  tags: ['Veneno'],
  hp: 18,
  speed: 30,
  damage: 5,
  width: 24,
  height: 24,
  goldReward: 6,
  armor: 0,
  movement: 'straight',
  special: { type: 'explode', radius: 60, damage: 5 },
  spriteId: 'plague_carrier',
  minWave: 6,
  weight: 4,
};

// 52. Root Golem
export const ENEMY_ROOT_GOLEM: EnemyDefinition = {
  id: 'root_golem',
  name: 'Radicante',
  tags: ['Orgânico', 'Planta'],
  hp: 80,
  speed: 8,
  damage: 12,
  width: 40,
  height: 40,
  goldReward: 12,
  armor: 3,
  movement: 'straight',
  special: { type: 'split', childId: 'vine_creep', count: 2 },
  spriteId: 'root_golem',
  minWave: 9,
  weight: 2,
};

// 53. Void Dancer
export const ENEMY_VOID_DANCER: EnemyDefinition = {
  id: 'void_dancer',
  name: 'Noct�vaga',
  tags: [],
  hp: 16,
  speed: 55,
  damage: 7,
  width: 16,
  height: 16,
  goldReward: 5,
  armor: 0,
  movement: 'erratic',
  special: { type: 'phase', chance: 0.3 },
  spriteId: 'void_dancer',
  minWave: 7,
  weight: 4,
};

// 54. War Drum
export const ENEMY_WAR_DRUM: EnemyDefinition = {
  id: 'war_drum',
  name: 'Pulsar',
  tags: [],
  hp: 38,
  speed: 15,
  damage: 4,
  width: 32,
  height: 32,
  goldReward: 9,
  armor: 1,
  movement: 'straight',
  special: { type: 'shoot', fireRate: 0.5, projectileSpeed: 150 },
  spriteId: 'war_drum',
  minWave: 8,
  weight: 2,
};

// 55. Gold Thief
export const ENEMY_GOLD_THIEF: EnemyDefinition = {
  id: 'gold_thief',
  name: 'Rapina',
  tags: [],
  hp: 12,
  speed: 70,
  damage: 0,
  width: 16,
  height: 16,
  goldReward: 15,
  armor: 0,
  movement: 'erratic',
  spriteId: 'gold_thief',
  minWave: 5,
  weight: 3,
};

// 56. Mini Boss: Titan Prime
export const BOSS_TITAN_PRIME: EnemyDefinition = {
  id: 'boss_titan_prime',
  name: 'Gorvath, o Colosso',
  tags: [],
  hp: 400,
  speed: 8,
  damage: 18,
  width: 48,
  height: 48,
  goldReward: 65,
  armor: 4,
  movement: 'straight',
  special: { type: 'shoot', fireRate: 2, projectileSpeed: 200 },
  spriteId: 'boss_titan_prime',
  minWave: 12,
  weight: 0,
};

// 57. Mini Boss: The Devourer
export const BOSS_DEVOURER: EnemyDefinition = {
  id: 'boss_devourer',
  name: 'Gluthar, o Faminto',
  tags: ['Orgânico'],
  hp: 350,
  speed: 10,
  damage: 15,
  width: 48,
  height: 48,
  goldReward: 60,
  armor: 2,
  movement: 'straight',
  special: { type: 'spawn', childId: 'swarm', interval: 2 },
  spriteId: 'boss_devourer',
  minWave: 14,
  weight: 0,
};

// 58. Mini Boss: Storm King
export const BOSS_STORM_KING: EnemyDefinition = {
  id: 'boss_storm_king',
  name: 'Zethar, Coroa de Raios',
  tags: ['Elétrico'],
  hp: 300,
  speed: 12,
  damage: 20,
  width: 48,
  height: 48,
  goldReward: 55,
  armor: 2,
  movement: 'sine',
  special: { type: 'shoot', fireRate: 3, projectileSpeed: 280 },
  spriteId: 'boss_storm_king',
  minWave: 16,
  weight: 0,
};

// 59. Boss: The Architect
export const BOSS_ARCHITECT: EnemyDefinition = {
  id: 'boss_architect',
  name: 'Nexus, o Construtor',
  tags: [],
  hp: 600,
  speed: 6,
  damage: 22,
  width: 56,
  height: 56,
  goldReward: 100,
  armor: 5,
  movement: 'straight',
  special: { type: 'spawn', childId: 'grunt', interval: 2 },
  spriteId: 'boss_architect',
  minWave: 20,
  weight: 0,
};

// 60. Boss: The Primordial (Final Boss)
export const BOSS_KEPLER_PRIME: EnemyDefinition = {
  id: 'boss_kepler_prime',
  name: 'Xal-Vor, o Primordial',
  tags: ['Fogo', 'Elétrico'],
  hp: 1000,
  speed: 5,
  damage: 30,
  width: 64,
  height: 64,
  goldReward: 200,
  armor: 6,
  movement: 'straight',
  special: { type: 'shoot', fireRate: 4, projectileSpeed: 300 },
  spriteId: 'boss_kepler_prime',
  minWave: 24,
  weight: 0,
};

// ─── NEW BOSSES (9-20) ───────────────────────────────────────────────────────

// 9. Toxar, the Plague Father
export const BOSS_TOXAR: EnemyDefinition = {
  id: 'boss_toxar', name: 'Toxar, o Pai da Praga',
  tags: ['Veneno', 'Orgânico'], hp: 350, speed: 7, damage: 14,
  width: 48, height: 48, goldReward: 70, armor: 2,
  movement: 'sine',
  special: { type: 'spawn', childId: 'acid_blob', interval: 2.5 },
  spriteId: 'boss_toxar', minWave: 8, weight: 0,
};

// 10. Criox, the Frozen Tyrant
export const BOSS_CRIOX: EnemyDefinition = {
  id: 'boss_criox', name: 'Criox, o Tirano Congelado',
  tags: ['Gelo', 'Água'], hp: 450, speed: 6, damage: 16,
  width: 56, height: 56, goldReward: 80, armor: 5,
  movement: 'straight',
  special: { type: 'shoot', fireRate: 2.5, projectileSpeed: 160 },
  spriteId: 'boss_criox', minWave: 10, weight: 0,
};

// 11. Vulkra, the Molten Worm
export const BOSS_VULKRA: EnemyDefinition = {
  id: 'boss_vulkra', name: 'Vulkra, a Verme de Magma',
  tags: ['Fogo'], hp: 500, speed: 14, damage: 18,
  width: 48, height: 48, goldReward: 85, armor: 3,
  movement: 'sine',
  special: { type: 'explode', radius: 100, damage: 25 },
  spriteId: 'boss_vulkra', minWave: 13, weight: 0,
};

// 12. Phantax, the Phase Lord
export const BOSS_PHANTAX: EnemyDefinition = {
  id: 'boss_phantax', name: 'Phantax, o Senhor das Fases',
  tags: [], hp: 300, speed: 15, damage: 12,
  width: 48, height: 48, goldReward: 75, armor: 0,
  movement: 'erratic',
  special: { type: 'phase', chance: 0.6 },
  spriteId: 'boss_phantax', minWave: 11, weight: 0,
};

// 13. Terravox, the Living Mountain
export const BOSS_TERRAVOX: EnemyDefinition = {
  id: 'boss_terravox', name: 'Terravox, a Montanha Viva',
  tags: ['Orgânico'], hp: 800, speed: 4, damage: 25,
  width: 64, height: 64, goldReward: 100, armor: 8,
  movement: 'straight',
  special: { type: 'armor', hits: 10 },
  spriteId: 'boss_terravox', minWave: 17, weight: 0,
};

// 14. Solyx, the Burning Eye
export const BOSS_SOLYX: EnemyDefinition = {
  id: 'boss_solyx', name: 'Solyx, o Olho Ardente',
  tags: ['Fogo', 'Elétrico'], hp: 400, speed: 10, damage: 20,
  width: 48, height: 48, goldReward: 90, armor: 2,
  movement: 'strafe',
  special: { type: 'shoot', fireRate: 5, projectileSpeed: 350 },
  spriteId: 'boss_solyx', minWave: 18, weight: 0,
};

// 15. Abyssara, the Rift Mother
export const BOSS_ABYSSARA: EnemyDefinition = {
  id: 'boss_abyssara', name: 'Abyssara, a Mãe da Fenda',
  tags: [], hp: 550, speed: 8, damage: 18,
  width: 56, height: 56, goldReward: 95, armor: 3,
  movement: 'sine',
  special: { type: 'spawn', childId: 'phase_wraith', interval: 3 },
  spriteId: 'boss_abyssara', minWave: 19, weight: 0,
};

// 16. Mechron, the Assimilator
export const BOSS_MECHRON: EnemyDefinition = {
  id: 'boss_mechron', name: 'Mechron, o Assimilador',
  tags: ['Elétrico'], hp: 600, speed: 9, damage: 20,
  width: 56, height: 56, goldReward: 110, armor: 6,
  movement: 'straight',
  special: { type: 'shoot', fireRate: 3, projectileSpeed: 250 },
  spriteId: 'boss_mechron', minWave: 21, weight: 0,
};

// 17. Voidmaw, the Hungering Dark
export const BOSS_VOIDMAW: EnemyDefinition = {
  id: 'boss_voidmaw', name: 'Voidmaw, a Escuridão Faminta',
  tags: [], hp: 700, speed: 6, damage: 22,
  width: 56, height: 56, goldReward: 120, armor: 4,
  movement: 'charge',
  special: { type: 'split', childId: 'shadow_wraith', count: 3 },
  spriteId: 'boss_voidmaw', minWave: 22, weight: 0,
};

// 18. Astral Serpent
export const BOSS_ASTRAL_SERPENT: EnemyDefinition = {
  id: 'boss_astral_serpent', name: 'Serpente Astral',
  tags: ['Vento'], hp: 500, speed: 18, damage: 16,
  width: 48, height: 48, goldReward: 100, armor: 2,
  movement: 'sine',
  special: { type: 'shoot', fireRate: 4, projectileSpeed: 300 },
  spriteId: 'boss_astral_serpent', minWave: 23, weight: 0,
};

// 19. Harbinger, Herald of Xal-Vor
export const BOSS_HARBINGER: EnemyDefinition = {
  id: 'boss_harbinger', name: 'Arauto de Xal-Vor',
  tags: ['Fogo', 'Veneno'], hp: 900, speed: 7, damage: 28,
  width: 64, height: 64, goldReward: 150, armor: 5,
  movement: 'strafe',
  special: { type: 'spawn', childId: 'berserker', interval: 2 },
  spriteId: 'boss_harbinger', minWave: 25, weight: 0,
};

// 20. Zyr'Goth, the Fallen God
export const BOSS_EPOCH: EnemyDefinition = {
  id: 'boss_epoch', name: 'Zyr-Goth, o Deus Caído',
  tags: ['Explosivo'], hp: 1200, speed: 3, damage: 35,
  width: 72, height: 72, goldReward: 250, armor: 10,
  movement: 'straight',
  special: { type: 'explode', radius: 150, damage: 50 },
  spriteId: 'boss_epoch', minWave: 28, weight: 0,
};

// ─── Leech — drains HP from player when close ────────────────────────────────
export const ENEMY_LEECH: EnemyDefinition = {
  id: 'leech',
  name: 'Sanguessuga',
  tags: ['Orgânico'],
  hp: 22,
  speed: 32,
  damage: 0,
  width: 20,
  height: 20,
  goldReward: 9,
  armor: 0,
  movement: 'sine',
  special: { type: 'drain', range: 95, dps: 5 },
  spriteId: 'leech',
  minWave: 5,
  weight: 4,
};

// ─── All Enemies Export ──────────────────────────────────────────────────────

export const ALL_ENEMIES: EnemyDefinition[] = [
  ENEMY_SCOUT, ENEMY_GRUNT, ENEMY_TANK, ENEMY_SHOOTER, ENEMY_ZIGZAG,
  ENEMY_SWARM, ENEMY_SHIELD_BEARER, ENEMY_BOMBER,
  ENEMY_FIRE_IMP, ENEMY_ICE_GOLEM, ENEMY_VINE_CREEP, ENEMY_THUNDER_BUG, ENEMY_SHADOW_WRAITH,
  BOSS_DRILL_SERGEANT, BOSS_HYDRA,
  ENEMY_HEALER, ENEMY_TELEPORTER, ENEMY_SPLITTER, ENEMY_MAGNETIC, ENEMY_REFLECTOR,
  ENEMY_SPAWNER, ENEMY_BERSERKER, ENEMY_GHOST_SHIP, ENEMY_ACID_BLOB, ENEMY_SENTINEL,
  ENEMY_FROST_ARCHER, ENEMY_FIRE_DANCER, ENEMY_EARTH_GOLEM, ENEMY_WIND_SPRITE,
  ENEMY_POISON_MUSHROOM, ENEMY_CRYSTAL_GUARDIAN, ENEMY_SHADOW_ASSASSIN, ENEMY_LAVA_SLIME,
  ENEMY_STORM_CLOUD, ENEMY_BONE_WARRIOR, ENEMY_MIMIC, ENEMY_PLAGUE_DOCTOR,
  ENEMY_IRON_MAIDEN, ENEMY_TIME_WARP, BOSS_SWARM_QUEEN,
  // New enemies (41-60)
  ENEMY_KAMIKAZE, ENEMY_HELIX, ENEMY_PHASE_WRAITH, ENEMY_HIVE_MIND, ENEMY_SPORE_CLOUD,
  ENEMY_CRYSTALLINE, ENEMY_MAGNETIC_CORE, ENEMY_FLAME_ELEMENTAL, ENEMY_TIDE_WALKER,
  ENEMY_STORM_DJINN, ENEMY_PLAGUE_CARRIER, ENEMY_ROOT_GOLEM, ENEMY_VOID_DANCER,
  ENEMY_WAR_DRUM, ENEMY_GOLD_THIEF, ENEMY_LEECH,
  BOSS_TITAN_PRIME, BOSS_DEVOURER, BOSS_STORM_KING, BOSS_ARCHITECT, BOSS_KEPLER_PRIME,
  // New bosses (9-20)
  BOSS_TOXAR, BOSS_CRIOX, BOSS_VULKRA, BOSS_PHANTAX, BOSS_TERRAVOX, BOSS_SOLYX,
  BOSS_ABYSSARA, BOSS_MECHRON, BOSS_VOIDMAW, BOSS_ASTRAL_SERPENT, BOSS_HARBINGER, BOSS_EPOCH,
];

export const BOSSES: EnemyDefinition[] = [
  BOSS_DRILL_SERGEANT, BOSS_HYDRA, BOSS_SWARM_QUEEN, BOSS_TOXAR,
  BOSS_TITAN_PRIME, BOSS_CRIOX, BOSS_PHANTAX, BOSS_DEVOURER,
  BOSS_VULKRA, BOSS_STORM_KING, BOSS_TERRAVOX, BOSS_SOLYX,
  BOSS_ABYSSARA, BOSS_ARCHITECT, BOSS_MECHRON, BOSS_VOIDMAW,
  BOSS_ASTRAL_SERPENT, BOSS_HARBINGER, BOSS_KEPLER_PRIME, BOSS_EPOCH,
];

/** Get enemies available for a given wave */
export function getEnemiesForWave(wave: number): EnemyDefinition[] {
  return ALL_ENEMIES.filter(e => e.minWave <= wave && e.weight > 0);
}

/** Get boss for a wave (bosses appear every 5 waves) */
export function getBossForWave(wave: number): EnemyDefinition | null {
  if (wave % 5 !== 0) return null;
  const bossIndex = Math.floor(wave / 5) - 1;
  return BOSSES[bossIndex % BOSSES.length] || null;
}
