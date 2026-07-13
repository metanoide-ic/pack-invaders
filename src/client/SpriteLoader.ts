/**
 * SPRITE LOADER — Loads real PNG sprites from the public/sprites/ folder.
 * Falls back to procedural sprites if images fail to load.
 */

import { generateFenixPortrait } from './SpriteGen';
import { ALL_ITEMS } from '../data/items';
import { ALL_ENEMIES } from '../data/enemies';

export interface LoadedSprites {
  characters: Map<string, HTMLImageElement | HTMLCanvasElement>;
  vendors: Map<string, HTMLImageElement | HTMLCanvasElement>;
  bosses: Map<string, HTMLImageElement | HTMLCanvasElement>;
  enemies: Map<string, HTMLImageElement | HTMLCanvasElement>;
  /** In-combat top-down (back view) player sprites, keyed by character ID */
  topdown: Map<string, HTMLImageElement>;
  /** Item icons with real art, keyed by item definition id */
  items: Map<string, HTMLImageElement>;
  /** Dedicated in-combat boss cutouts, keyed by boss sprite id */
  bossCombat: Map<string, HTMLImageElement>;
  /** Planet rotation frames for the inventory screen (empty = procedural) */
  planetFrames: HTMLImageElement[];
  /** Full-body vendor art for the shop overlay, keyed by vendor id */
  vendorsFull: Map<string, HTMLImageElement>;
  /** Screen-filling art for the final boss's cinematic entrance */
  zyrgothGiant: HTMLImageElement | null;
  /** Player weapon projectile art, keyed by element (see PROJECTILE_WEAPON_ELEMENTS) */
  projectilesWeapon: Map<string, HTMLImageElement>;
  /** Enemy projectile art, keyed by style (see PROJECTILE_ENEMY_STYLES) */
  projectilesEnemy: Map<string, HTMLImageElement>;
  /** Decorative UI panel textures — cover-fit behind the procedural chrome,
   * so a missing file just keeps today's flat-gradient look */
  uiPanels: Map<string, HTMLImageElement>;
  menuBg: HTMLImageElement | null;
}

/** Optional decorative background textures for UI panels. Each is drawn
 * cover-fit behind the existing procedural border/corner accents, so panels
 * degrade gracefully to today's flat gradient when the file is absent. */
export const UI_PANEL_IDS = ['backpack_panel', 'shop_card', 'reward_card'];

/** Player weapon projectile elements — every weapon's tags collapse into one
 * of these (see getProjectileElement in Renderer.ts). Order matters there,
 * not here. */
export const PROJECTILE_WEAPON_ELEMENTS = [
  'fire', 'ice', 'water', 'electric', 'poison', 'organic',
  'explosive', 'piercing', 'wind', 'arcane', 'normal',
];

/** Enemy projectile styles — every shooting enemy's tags collapse into one
 * of these (see getEnemyProjectileStyle in Renderer.ts). 'bomb' is the
 * Zeppelin's dropped mine; 'organic' is the default fallback (most enemies
 * spit bio-matter, not bullets). */
export const PROJECTILE_ENEMY_STYLES = [
  'organic', 'fire', 'ice', 'poison', 'electric', 'explosive', 'bomb',
];

const CHARACTER_IDS = ['raiz', 'favil', 'pelagia', 'arco', 'barathro', 'nex', 'fenix', 'zabel', 'setimo'];
const VENDOR_IDS = ['luna', 'brutus', 'nyx', 'zikri'];
const BOSS_IDS = [
  'vrox', 'nydra', 'krix', 'toxar', 'gorvath', 'criox', 'phantax', 'gluthar',
  'vulkra', 'zethar', 'terravox', 'solyx', 'abyssara', 'nexus', 'mechron',
  'voidmaw', 'astral_serpent', 'harbinger', 'xalvor', 'zyrgoth',
];

/** Every spawnable enemy now has real cut-out art in
 * public/sprites/enemies/<defId>.png (missing files fail silently to the
 * procedural sprite, same policy as items) */
const ENEMY_SPRITE_IDS = ALL_ENEMIES.filter(e => !e.id.startsWith('boss_')).map(e => e.id);

/** Every item now has real icon art in public/sprites/items/<id>.png;
 * load them all (missing files fail silently to the procedural icon). */
const ITEM_SPRITE_IDS = ALL_ITEMS.map(i => i.id);

/** Map character IDs in code to sprite file names */
const CHAR_ID_MAP: Record<string, string> = {
  'grass_man': 'raiz',
  'fire_lord': 'favil',
  'aqua_sage': 'pelagia',
  'storm_runner': 'arco',
  'void_walker': 'barathro',
  'beast_tamer': 'nex',
  'firefighter': 'fenix',
  'scrapper': 'zabel',
  'renegade': 'setimo',
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

  // In-combat top-down player models (64px tall, transparent bg)
  // 'coop_p2' is Player 2's dedicated CO-OP model (an art-sheet extra, not a
  // playable character) so P2 never looks like a clone of someone else
  const TOPDOWN_IDS = ['grass_man', 'fire_lord', 'aqua_sage', 'storm_runner', 'void_walker', 'beast_tamer', 'firefighter', 'scrapper', 'renegade', 'coop_p2'];
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

  // Dedicated in-combat boss cutouts (bosses/combat/) — preferred over the
  // painted codex portraits during fights
  const bossCombat = new Map<string, HTMLImageElement>();
  await Promise.all(BOSS_IDS.map(async id => {
    try {
      const img = await loadImage(`./sprites/bosses/combat/${id}.png`);
      bossCombat.set(id, img);
    } catch { /* boss stays procedural/cutout-detected in combat */ }
  }));

  // Planet rotation frames for the inventory screen
  const planetFrames: HTMLImageElement[] = [];
  await Promise.all(Array.from({ length: 12 }, (_, i) => i).map(async i => {
    try {
      planetFrames[i] = await loadImage(`./sprites/planet/frame_${String(i).padStart(2, '0')}.png`);
    } catch { /* keep procedural planet */ }
  }));

  // Load enemy sprites — all 55 in parallel (sequential awaits would add
  // seconds to startup); falls back to procedural when a file is missing
  await Promise.all(ENEMY_SPRITE_IDS.map(async id => {
    try {
      const img = await loadImage(`./sprites/enemies/${id}.png`);
      enemies.set(id, img);
    } catch { /* fallback to procedural */ }
  }));

  // Full-body vendor art (waist-up crop is done at draw time in the shop)
  const vendorsFull = new Map<string, HTMLImageElement>();
  await Promise.all(VENDOR_IDS.map(async id => {
    try {
      vendorsFull.set(id, await loadImage(`./sprites/vendors/${id}_full.png`));
    } catch { /* shop simply skips the overlay */ }
  }));

  // Giant final boss art for Zyr-Goth's cinematic entrance
  let zyrgothGiant: HTMLImageElement | null = null;
  try {
    zyrgothGiant = await loadImage('./sprites/bosses/zyrgoth_giant.png');
  } catch { /* boss falls back to the normal combat cutout */ }

  // Projectile art — small set of element/style sprites (see the constants
  // above); missing files keep the current procedural glow+shape
  const projectilesWeapon = new Map<string, HTMLImageElement>();
  await Promise.all(PROJECTILE_WEAPON_ELEMENTS.map(async id => {
    try {
      projectilesWeapon.set(id, await loadImage(`./sprites/projectiles/weapons/${id}.png`));
    } catch { /* fallback to procedural */ }
  }));
  const projectilesEnemy = new Map<string, HTMLImageElement>();
  await Promise.all(PROJECTILE_ENEMY_STYLES.map(async id => {
    try {
      projectilesEnemy.set(id, await loadImage(`./sprites/projectiles/enemies/${id}.png`));
    } catch { /* fallback to procedural */ }
  }));

  // Optional decorative UI panel textures (backpack plate, shop/reward cards)
  const uiPanels = new Map<string, HTMLImageElement>();
  await Promise.all(UI_PANEL_IDS.map(async id => {
    try {
      uiPanels.set(id, await loadImage(`./sprites/ui/${id}.png`));
    } catch { /* keep the flat procedural gradient */ }
  }));

  // Load item icons (main.ts swaps these into the procedural icon map).
  // All 150 in parallel — sequential awaits would add seconds to startup.
  const items = new Map<string, HTMLImageElement>();
  await Promise.all(ITEM_SPRITE_IDS.map(async id => {
    try {
      const img = await loadImage(`./sprites/items/${id}.png`);
      items.set(id, img);
    } catch { /* fallback to procedural */ }
  }));

  cachedLoaded = { characters, vendors, bosses, enemies, topdown, items, bossCombat, planetFrames: planetFrames.filter(Boolean), vendorsFull, zyrgothGiant, projectilesWeapon, projectilesEnemy, uiPanels, menuBg: null };

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

/** Get a boss's in-combat sprite: the dedicated combat cutout when present,
 * otherwise a codex portrait that happens to be a cutout. Opaque painted
 * scenes never render in combat. */
export function getBossCombatSprite(bossDefId: string): HTMLImageElement | null {
  if (!cachedLoaded) return null;
  const spriteId = BOSS_DEF_MAP[bossDefId];
  if (!spriteId) return null;
  const combat = cachedLoaded.bossCombat.get(spriteId);
  if (combat) return combat;
  if (!bossCutouts.has(spriteId)) return null;
  const img = cachedLoaded.bosses.get(spriteId);
  return img instanceof HTMLImageElement ? img : null;
}

/** Planet rotation frames for the inventory screen ([] until loaded) */
export function getPlanetFrames(): HTMLImageElement[] {
  return cachedLoaded?.planetFrames ?? [];
}

/** Full-body vendor art for the shop overlay (null → no overlay) */
export function getVendorFullBody(vendorId: string): HTMLImageElement | null {
  return cachedLoaded?.vendorsFull.get(vendorId) ?? null;
}

/** Giant Zyr-Goth art for the final boss cinematic (null → normal sprite) */
export function getZyrgothGiant(): HTMLImageElement | null {
  return cachedLoaded?.zyrgothGiant ?? null;
}

/** Real art for a player weapon projectile element (null → procedural glow) */
export function getWeaponProjectileArt(element: string): HTMLImageElement | null {
  return cachedLoaded?.projectilesWeapon.get(element) ?? null;
}

/** Real art for an enemy projectile style (null → procedural glow) */
export function getEnemyProjectileArt(style: string): HTMLImageElement | null {
  return cachedLoaded?.projectilesEnemy.get(style) ?? null;
}

/** Decorative UI panel texture (null → today's flat procedural gradient) */
export function getUiPanel(id: string): HTMLImageElement | null {
  return cachedLoaded?.uiPanels.get(id) ?? null;
}
