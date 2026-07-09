/**
 * SPRITE LOADER — Loads real PNG sprites from the public/sprites/ folder.
 * Falls back to procedural sprites if images fail to load.
 */

import { generateFenixPortrait } from './SpriteGen';

export interface LoadedSprites {
  characters: Map<string, HTMLImageElement | HTMLCanvasElement>;
  vendors: Map<string, HTMLImageElement | HTMLCanvasElement>;
  bosses: Map<string, HTMLImageElement | HTMLCanvasElement>;
  enemies: Map<string, HTMLImageElement | HTMLCanvasElement>;
  /** In-combat top-down (back view) player sprites, keyed by character ID */
  topdown: Map<string, HTMLImageElement>;
  /** Item icons with real art, keyed by item definition id */
  items: Map<string, HTMLImageElement>;
  menuBg: HTMLImageElement | null;
}

const CHARACTER_IDS = ['raiz', 'favil', 'pelagia', 'arco', 'barathro', 'nex', 'fenix'];
const VENDOR_IDS = ['luna', 'brutus', 'nyx', 'zikri'];
const BOSS_IDS = [
  'vrox', 'nydra', 'krix', 'toxar', 'gorvath', 'criox', 'phantax', 'gluthar',
  'vulkra', 'zethar', 'terravox', 'solyx', 'abyssara', 'nexus', 'mechron',
  'voidmaw', 'astral_serpent', 'harbinger', 'xalvor', 'zyrgoth',
];

/** Enemy defIds with real cut-out art (rest fall back to procedural sprites) */
const ENEMY_SPRITE_IDS = [
  'sentinel', 'spawner', 'leech', 'fire_imp', 'berserker', 'thunder_bug',
  'helix', 'root_golem', 'vine_creep', 'flame_elemental', 'storm_cloud',
  'hive_mind', 'shadow_wraith', 'gold_thief', 'shadow_assassin', 'ghost_ship',
  'scout', 'grunt', 'zigzag', 'kamikaze', 'magnetic', 'acid_blob',
  'crystalline', 'mimic', 'bone_warrior', 'tank', 'ice_golem',
];

/** Item ids with real icon art (rest keep the procedural icons) */
const ITEM_SPRITE_IDS = [
  'basic_gun', 'fire_gun', 'ice_gun', 'shotgun', 'sniper',
  'armor_plate', 'repair_kit', 'battery', 'ancient_rune', 'void_crystal',
];

/** Map character IDs in code to sprite file names */
const CHAR_ID_MAP: Record<string, string> = {
  'grass_man': 'raiz',
  'fire_lord': 'favil',
  'aqua_sage': 'pelagia',
  'storm_runner': 'arco',
  'void_walker': 'barathro',
  'beast_tamer': 'nex',
  'firefighter': 'fenix',
};

/** Map vendor IDs in code to sprite file names */
const VENDOR_ID_MAP: Record<string, string> = {
  'luna': 'luna',
  'brutus': 'brutus',
  'nyx': 'nyx',
  'zikri': 'zikri',
};

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load: ${src}`));
    img.src = src;
  });
}

let cachedLoaded: LoadedSprites | null = null;

export async function loadAllSprites(): Promise<LoadedSprites> {
  if (cachedLoaded) return cachedLoaded;

  const characters = new Map<string, HTMLImageElement | HTMLCanvasElement>();
  const vendors = new Map<string, HTMLImageElement | HTMLCanvasElement>();
  const bosses = new Map<string, HTMLImageElement | HTMLCanvasElement>();
  const enemies = new Map<string, HTMLImageElement | HTMLCanvasElement>();
  const topdown = new Map<string, HTMLImageElement>();

  // In-combat top-down player models (48px tall, transparent bg)
  const TOPDOWN_IDS = ['grass_man', 'aqua_sage', 'storm_runner', 'beast_tamer'];
  for (const id of TOPDOWN_IDS) {
    try {
      const img = await loadImage(`./sprites/characters/topdown/${id}.png`);
      topdown.set(id, img);
    } catch { /* fall back to procedural sprite */ }
  }

  // Procedural portrait generators for characters without PNG art
  const proceduralPortraits: Record<string, () => HTMLCanvasElement> = {
    'fenix': () => generateFenixPortrait(300, 480),
  };

  // Load characters
  for (const id of CHARACTER_IDS) {
    try {
      const img = await loadImage(`./sprites/characters/${id}.png`);
      characters.set(id, img);
    } catch {
      if (proceduralPortraits[id]) {
        characters.set(id, proceduralPortraits[id]());
      }
    }
  }

  // Load vendors
  for (const id of VENDOR_IDS) {
    try {
      const img = await loadImage(`./sprites/vendors/${id}.png`);
      vendors.set(id, img);
    } catch { /* fallback */ }
  }

  // Load bosses; cutout-style art (transparent bg) also becomes the boss's
  // in-combat sprite via getBossCombatSprite
  for (const id of BOSS_IDS) {
    try {
      const img = await loadImage(`./sprites/bosses/${id}.png`);
      bosses.set(id, img);
      if (isCutout(img)) bossCutouts.add(id);
    } catch { /* fallback */ }
  }

  // Load enemy sprites (real art cut from the AI-generated sheet; falls
  // back to procedural generation in Renderer when a defId has no file)
  for (const id of ENEMY_SPRITE_IDS) {
    try {
      const img = await loadImage(`./sprites/enemies/${id}.png`);
      enemies.set(id, img);
    } catch { /* fallback to procedural */ }
  }

  // Load item icons (main.ts swaps these into the procedural icon map)
  const items = new Map<string, HTMLImageElement>();
  for (const id of ITEM_SPRITE_IDS) {
    try {
      const img = await loadImage(`./sprites/items/${id}.png`);
      items.set(id, img);
    } catch { /* fallback to procedural */ }
  }

  cachedLoaded = { characters, vendors, bosses, enemies, topdown, items, menuBg: null };

  // Load menu background
  try {
    cachedLoaded.menuBg = await loadImage('./sprites/menu_bg.png');
  } catch { /* fallback to procedural */ }

  return cachedLoaded;
}

/** Get in-combat top-down player sprite by character ID (null → use procedural) */
export function getTopdownSprite(charId: string): HTMLImageElement | null {
  if (!cachedLoaded) return null;
  return cachedLoaded.topdown.get(charId) || null;
}

/** Get character portrait by game character ID */
export function getCharacterPortrait(charId: string): HTMLImageElement | HTMLCanvasElement | null {
  if (!cachedLoaded) return null;
  const spriteId = CHAR_ID_MAP[charId];
  if (!spriteId) return null;
  return cachedLoaded.characters.get(spriteId) || null;
}

/** Get vendor portrait by vendor ID */
export function getVendorPortrait(vendorId: string): HTMLImageElement | HTMLCanvasElement | null {
  if (!cachedLoaded) return null;
  const spriteId = VENDOR_ID_MAP[vendorId];
  if (!spriteId) return null;
  return cachedLoaded.vendors.get(spriteId) || null;
}

/** Map boss_drill_sergeant -> vrox, etc. */
const BOSS_DEF_MAP: Record<string, string> = {
  'boss_drill_sergeant': 'vrox',
  'boss_hydra': 'nydra',
  'boss_swarm_queen': 'krix',
  'boss_toxar': 'toxar',
  'boss_titan_prime': 'gorvath',
  'boss_criox': 'criox',
  'boss_phantax': 'phantax',
  'boss_devourer': 'gluthar',
  'boss_vulkra': 'vulkra',
  'boss_storm_king': 'zethar',
  'boss_terravox': 'terravox',
  'boss_solyx': 'solyx',
  'boss_abyssara': 'abyssara',
  'boss_architect': 'nexus',
  'boss_mechron': 'mechron',
  'boss_voidmaw': 'voidmaw',
  'boss_astral_serpent': 'astral_serpent',
  'boss_harbinger': 'harbinger',
  'boss_kepler_prime': 'xalvor',
  'boss_epoch': 'zyrgoth',
};

/** Get boss portrait by boss definition ID */
export function getBossPortrait(bossDefId: string): HTMLImageElement | HTMLCanvasElement | null {
  if (!cachedLoaded) return null;
  const spriteId = BOSS_DEF_MAP[bossDefId];
  if (!spriteId) return null;
  return cachedLoaded.bosses.get(spriteId) || null;
}

/** Boss sprite ids whose art is a true cutout (transparent background) and so
 * can be drawn as an in-combat sprite. Most of the older boss art is a full
 * painted scene with an opaque background — fine as a codex portrait, ugly as
 * a combat sprite — so those stay procedural in combat. */
const bossCutouts = new Set<string>();

function isCutout(img: HTMLImageElement): boolean {
  const size = 32; // sampling resolution is plenty to measure transparency
  const c = document.createElement('canvas');
  c.width = size; c.height = size;
  const ctx = c.getContext('2d')!;
  ctx.drawImage(img, 0, 0, size, size);
  const data = ctx.getImageData(0, 0, size, size).data;
  let transparent = 0;
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] < 20) transparent++;
  }
  return transparent / (size * size) > 0.25;
}

/** Get a boss's in-combat sprite: only bosses with cutout art return one. */
export function getBossCombatSprite(bossDefId: string): HTMLImageElement | null {
  if (!cachedLoaded) return null;
  const spriteId = BOSS_DEF_MAP[bossDefId];
  if (!spriteId || !bossCutouts.has(spriteId)) return null;
  const img = cachedLoaded.bosses.get(spriteId);
  return img instanceof HTMLImageElement ? img : null;
}
