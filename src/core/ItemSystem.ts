/**
 * ITEM SYSTEM — ECS-lite com Tags para sinergias emergentes.
 *
 * Cada item é definido declarativamente com:
 * - tags: categorias semânticas para matching de sinergias
 * - gridShape: formato Tetris-like (matriz 2D de 0/1)
 * - stats: valores numéricos base (dano, fire rate, etc)
 * - onSynergyUpdate: callback que recalcula stats baseado em adjacências
 * - onTick: callback executado cada tick de combate
 */

// ─── Core Types ──────────────────────────────────────────────────────────────

export type Tag =
  | 'Arma' | 'Emissor' | 'Fogo' | 'Água' | 'Orgânico' | 'Animal'
  | 'Modificador' | 'ModFrequência' | 'Utilitário' | 'Pet'
  | 'Vento' | 'Elétrico' | 'Veneno' | 'Gelo' | 'Planta'
  | 'Escudo' | 'Cura' | 'AoE' | 'Perfurante' | 'Explosivo';

export interface ItemStats {
  damage: number;
  fireRate: number;      // shots per second
  projectileSpeed: number;
  projectileCount: number;
  aoeRadius: number;
  healPerSecond: number;
  armorBonus: number;
  /** Generic multipliers applied by synergies */
  damageMultiplier: number;
  fireRateMultiplier: number;
  [key: string]: number;
}

export function defaultStats(): ItemStats {
  return {
    damage: 0,
    fireRate: 0,
    projectileSpeed: 300,
    projectileCount: 1,
    aoeRadius: 0,
    healPerSecond: 0,
    armorBonus: 0,
    damageMultiplier: 1,
    fireRateMultiplier: 1,
  };
}

export interface SynergyContext {
  /** All items adjacent to this item in the grid */
  adjacentItems: PlacedItem[];
  /** All items in the entire backpack */
  allItems: PlacedItem[];
  /** Current character's passive rules */
  characterId: string;
  /** Position info */
  position: GridPosition;
  /** Height in stack (for Grass Man) */
  stackHeight: number;
}

export interface GridPosition {
  col: number;
  row: number;
}

export interface ItemDefinition {
  id: string;
  name: string;
  description: string;
  tags: Tag[];
  /** Grid shape: 1 = occupied cell, 0 = empty. Row-major. */
  gridShape: number[][];
  /** Base stats before synergies */
  baseStats: Partial<ItemStats>;
  /** Cost in gold */
  cost: number;
  /** Rarity tier: 0=common, 1=uncommon, 2=rare, 3=legendary */
  rarity: number;
  /**
   * Called when adjacencies change. Mutate `stats` based on context.
   * This is the heart of emergent synergies.
   */
  onSynergyUpdate?: (item: PlacedItem, ctx: SynergyContext) => void;
  /**
   * Called every combat tick. Emit projectiles, apply effects, etc.
   */
  onTick?: (item: PlacedItem, dt: number, emit: EmitProjectile) => void;
}

export interface PlacedItem {
  definition: ItemDefinition;
  instanceId: string;
  position: GridPosition;
  /** Computed stats (base + synergy modifiers) */
  stats: ItemStats;
  /** Runtime state (cooldowns, counters, etc) */
  state: Record<string, number>;
}

// ─── Projectile Emission ─────────────────────────────────────────────────────

export interface ProjectileData {
  x: number;
  y: number;
  vx: number;
  vy: number;
  damage: number;
  piercing: number;
  aoeRadius: number;
  tags: Tag[];
  ownerId: string;
}

export type EmitProjectile = (proj: ProjectileData) => void;

// ─── Item Shape Utilities ────────────────────────────────────────────────────

export function getShapeWidth(shape: number[][]): number {
  return shape[0]?.length ?? 0;
}

export function getShapeHeight(shape: number[][]): number {
  return shape.length;
}

/** Get all occupied cells of a shape relative to its top-left position */
export function getOccupiedCells(shape: number[][], pos: GridPosition): GridPosition[] {
  const cells: GridPosition[] = [];
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c] === 1) {
        cells.push({ col: pos.col + c, row: pos.row + r });
      }
    }
  }
  return cells;
}
