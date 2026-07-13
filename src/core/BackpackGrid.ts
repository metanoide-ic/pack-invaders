/**
 * BACKPACK GRID — Inventário 2D com detecção de adjacência e sinergias.
 *
 * Suporta:
 * - Itens com formato Tetris-like (shapes multi-cell)
 * - Detecção de colisão para placement
 * - Cálculo de adjacência (4-directional + stacking)
 * - Regras por personagem (ex: Grass Man = gravity/stacking)
 * - Recalcular todas as sinergias quando o grid muda
 */

import {
  PlacedItem, ItemDefinition, GridPosition, SynergyContext,
  getOccupiedCells, getShapeWidth, getShapeHeight,
  defaultStats, ItemStats, getItemWeight,
} from './ItemSystem';
import { ALL_COMBINATIONS } from './ItemCombinations';

// ─── Grid Configuration ──────────────────────────────────────────────────────

export interface BackpackConfig {
  cols: number;
  rows: number;
  characterId: string;
  /** If true, items must be stacked (Grass Man rule) */
  requireStacking: boolean;
  /** Backpack placement rule */
  backpackRule?: 'stacking' | 'freeform' | 'columns_only' | 'diagonal' | 'rows_only' | 'tetris';
  /** Base weight capacity (before card bonuses) — see BackpackGrid.getMaxWeight() */
  baseMaxWeight: number;
}

// ─── Backpack Grid Class ─────────────────────────────────────────────────────

export class BackpackGrid {
  readonly cols: number;
  readonly rows: number;
  readonly config: BackpackConfig;

  /** The grid: each cell holds the instanceId of the item occupying it, or null */
  private grid: (string | null)[][];
  /** All placed items by instanceId */
  private items: Map<string, PlacedItem> = new Map();
  /** Counter for unique instance IDs */
  private nextId = 0;
  /** Permanent weight-capacity bonus from cards (Mochila Reforçada etc.) —
   * additive on top of config.baseMaxWeight, survives recalculateSynergies()
   * since it lives here rather than in any item's state. */
  private weightCapacityBonus = 0;

  constructor(config: BackpackConfig) {
    this.cols = config.cols;
    this.rows = config.rows;
    this.config = config;
    this.grid = Array.from({ length: config.rows }, () => Array(config.cols).fill(null));
  }

  // ─── Weight ─────────────────────────────────────────────────────────────

  /** Total weight capacity: base (per-character, set at construction) plus
   * any permanent bonuses granted by cards. */
  getMaxWeight(): number {
    return this.config.baseMaxWeight + this.weightCapacityBonus;
  }

  /** Sum of getItemWeight() across every currently placed item. */
  getTotalWeight(): number {
    let total = 0;
    for (const item of this.items.values()) total += getItemWeight(item.definition);
    return total;
  }

  /** Permanently raises the weight cap (weight-capacity cards call this). */
  addWeightCapacity(amount: number): void {
    this.weightCapacityBonus += amount;
  }

  // ─── Placement ──────────────────────────────────────────────────────────

  /**
   * Check if an item can be placed at a given position.
   */
  canPlace(def: ItemDefinition, pos: GridPosition): boolean {
    const cells = getOccupiedCells(def.gridShape, pos);

    for (const cell of cells) {
      // Bounds check
      if (cell.col < 0 || cell.col >= this.cols || cell.row < 0 || cell.row >= this.rows) {
        return false;
      }
      // Collision check
      if (this.grid[cell.row][cell.col] !== null) {
        return false;
      }
    }

    // Weight limit: the whole point of the system is to cap loadout size
    // independent of physical grid space, so this applies regardless of
    // backpack rule.
    if (this.getTotalWeight() + getItemWeight(def) > this.getMaxWeight()) {
      return false;
    }

    // Stacking rule (Grass Man): item must rest on bottom row or on top of another item
    if (this.config.requireStacking) {
      const bottomCells = cells.filter(c => {
        // Check if this cell has support below
        const below = c.row + 1;
        if (below >= this.rows) return true; // On floor
        return this.grid[below][c.col] !== null; // On another item
      });
      // At least one cell must be supported
      if (bottomCells.length === 0) return false;
    }

    // Columns Only rule (Maré): items must be placed in existing occupied columns
    // OR in a new column with at least one cell on the bottom row.
    if (this.config.backpackRule === 'columns_only') {
      const hasAnyItem = this.items.size > 0;
      if (hasAnyItem) {
        // Get all currently occupied columns
        const occupiedCols = new Set<number>();
        for (let r = 0; r < this.rows; r++) {
          for (let c = 0; c < this.cols; c++) {
            if (this.grid[r][c] !== null) {
              occupiedCols.add(c);
            }
          }
        }
        // Item's columns
        const itemCols = new Set(cells.map(c => c.col));
        // Check: all cells must be in existing occupied columns, OR
        // the item introduces a new column but has at least one cell on bottom row
        const allInExisting = [...itemCols].every(col => occupiedCols.has(col));
        if (!allInExisting) {
          const hasBottomRow = cells.some(c => c.row === this.rows - 1);
          if (!hasBottomRow) return false;
        }
      }
    }

    // Diagonal rule (Pulso): each subsequent item must touch at least one
    // existing item via diagonal adjacency (not orthogonal).
    if (this.config.backpackRule === 'diagonal') {
      const hasAnyItem = this.items.size > 0;
      if (hasAnyItem) {
        const diagDirs = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
        let hasDiagonalTouch = false;
        for (const cell of cells) {
          for (const [dc, dr] of diagDirs) {
            const nc = cell.col + dc;
            const nr = cell.row + dr;
            if (nc >= 0 && nc < this.cols && nr >= 0 && nr < this.rows) {
              if (this.grid[nr][nc] !== null) {
                hasDiagonalTouch = true;
                break;
              }
            }
          }
          if (hasDiagonalTouch) break;
        }
        // Also ensure it's NOT orthogonally adjacent (making it strictly diagonal)
        // Actually per spec: must touch diagonally. Orthogonal is allowed if diagonal is met.
        if (!hasDiagonalTouch) return false;
      }
    }

    return true;
  }

  /**
   * Place an item at a position. Returns the instance ID.
   */
  placeItem(def: ItemDefinition, pos: GridPosition): string | null {
    if (!this.canPlace(def, pos)) return null;

    const instanceId = `item_${this.nextId++}`;
    const cells = getOccupiedCells(def.gridShape, pos);

    // Mark cells
    for (const cell of cells) {
      this.grid[cell.row][cell.col] = instanceId;
    }

    // Create placed item
    const placed: PlacedItem = {
      definition: def,
      instanceId,
      position: pos,
      stats: { ...defaultStats(), ...def.baseStats } as ItemStats,
      state: {},
    };
    this.items.set(instanceId, placed);

    // Recalculate all synergies
    this.recalculateSynergies();

    return instanceId;
  }

  /**
   * Remove an item from the grid.
   */
  removeItem(instanceId: string): boolean {
    const item = this.items.get(instanceId);
    if (!item) return false;

    const cells = getOccupiedCells(item.definition.gridShape, item.position);
    for (const cell of cells) {
      this.grid[cell.row][cell.col] = null;
    }

    this.items.delete(instanceId);
    this.recalculateSynergies();
    return true;
  }

  // ─── Item Upgrade (merge duplicates, 9 Kings style) ──────────────────────

  /** Max times an item can be upgraded by stacking duplicates onto it */
  readonly maxUpgrade = 3;

  /** Current upgrade level of a placed item (0 = base). */
  getUpgradeLevel(item: PlacedItem): number {
    return ((item.state as any).upgradeLevel as number) ?? 0;
  }

  /**
   * Try to upgrade the item at a cell by consuming a duplicate of the same definition.
   * Returns true if the upgrade was applied (caller should then consume the held item).
   */
  tryUpgradeItem(instanceId: string, byDefId: string): boolean {
    const item = this.items.get(instanceId);
    if (!item) return false;
    if (item.definition.id !== byDefId) return false;
    const cur = this.getUpgradeLevel(item);
    if (cur >= this.maxUpgrade) return false;
    (item.state as any).upgradeLevel = cur + 1;
    this.recalculateSynergies();
    return true;
  }

  // ─── Adjacency Calculation ──────────────────────────────────────────────

  /**
   * Get all items adjacent to a given item (sharing an edge, not diagonal).
   */
  getAdjacentItems(instanceId: string): PlacedItem[] {
    const item = this.items.get(instanceId);
    if (!item) return [];

    // Cristal Nexus: while placed, every item counts as adjacent to every
    // other — the whole backpack becomes one synergy web (its entire point).
    const hasNexus = Array.from(this.items.values()).some(i => i.definition.id === 'nexus_crystal');
    if (hasNexus) {
      return Array.from(this.items.values()).filter(i => i.instanceId !== instanceId);
    }

    const myCells = getOccupiedCells(item.definition.gridShape, item.position);
    const myCellSet = new Set(myCells.map(c => `${c.col},${c.row}`));
    const adjacentIds = new Set<string>();

    const dirs = [[0, -1], [0, 1], [-1, 0], [1, 0]]; // up, down, left, right

    for (const cell of myCells) {
      for (const [dc, dr] of dirs) {
        const nc = cell.col + dc;
        const nr = cell.row + dr;
        if (nc < 0 || nc >= this.cols || nr < 0 || nr >= this.rows) continue;
        const key = `${nc},${nr}`;
        if (myCellSet.has(key)) continue; // Own cell

        const occupant = this.grid[nr][nc];
        if (occupant && occupant !== instanceId) {
          adjacentIds.add(occupant);
        }
      }
    }

    return Array.from(adjacentIds).map(id => this.items.get(id)!).filter(Boolean);
  }

  /**
   * Calculate stack height for a given item (how many layers below it).
   * Used for Grass Man damage scaling.
   */
  getStackHeight(item: PlacedItem): number {
    // Count how many rows of items are below this item's position
    let height = 0;
    const bottomRow = item.position.row + getShapeHeight(item.definition.gridShape);
    for (let r = bottomRow; r < this.rows; r++) {
      let hasItem = false;
      for (let c = 0; c < this.cols; c++) {
        if (this.grid[r][c] !== null) { hasItem = true; break; }
      }
      if (hasItem) height++;
      else break;
    }
    return height;
  }

  // ─── Synergy Recalculation ──────────────────────────────────────────────

  /**
   * Recalculate all item stats based on current grid state.
   * This is the CORE of the emergent synergy system.
   */
  recalculateSynergies(): void {
    const allItems = Array.from(this.items.values());

    // Reset all stats to base, then re-apply persistent card bonuses
    for (const item of allItems) {
      item.stats = { ...defaultStats(), ...item.definition.baseStats } as ItemStats;
      // Neighbor/fusion-granted state fields (piercingBonus, homingBonus,
      // critChance, goldBonus, shopRarityBonus) get ADDED to by other items'
      // onSynergyUpdate and by applyCombinations below. Unlike item.stats
      // above, item.state is never recreated — without this reset, every
      // placement/move/removal anywhere in the backpack re-runs this whole
      // function and adds the bonus AGAIN on top of whatever was already
      // there, so e.g. Piercing Lens's "+1 to neighbors" silently became
      // "+1 per backpack edit, forever, never reverting" even after the
      // items were separated.
      (item.state as any).piercingBonus = 0;
      (item.state as any).homingBonus = 0;
      (item.state as any).critChance = 0;
      (item.state as any).goldBonus = 0;
      (item.state as any).shopRarityBonus = 0;
      // Card bonuses are stored in item.state._cp so they survive stat resets
      const cp = item.state._cp as { d?: number; r?: number; p?: number; a?: number; h?: number; s?: number; ao?: number } | undefined;
      if (cp) {
        if (cp.d) item.stats.damageMultiplier *= cp.d;
        if (cp.r) item.stats.fireRateMultiplier *= cp.r;
        if (cp.p) item.stats.projectileCount += cp.p;
        if (cp.a) item.stats.armorBonus += cp.a;
        if (cp.h) item.stats.healPerSecond += cp.h;
        if (cp.s) item.stats.projectileSpeed *= cp.s;
        if (cp.ao) item.stats.aoeRadius += cp.ao;
      }
      // Item upgrade levels (merge duplicates, 9 Kings style) — persists in state
      const up = (item.state as any).upgradeLevel as number | undefined;
      if (up && up > 0) {
        item.stats.damageMultiplier *= Math.pow(1.6, up);
        item.stats.fireRateMultiplier *= Math.pow(1.15, up);
        item.stats.projectileSpeed *= Math.pow(1.05, up);
        item.stats.aoeRadius += up * 5;
        item.stats.healPerSecond += up * (item.definition.baseStats?.healPerSecond ? 1 : 0);
      }
    }

    // Run each item's synergy update with context
    for (const item of allItems) {
      if (!item.definition.onSynergyUpdate) continue;

      const ctx: SynergyContext = {
        adjacentItems: this.getAdjacentItems(item.instanceId),
        allItems,
        characterId: this.config.characterId,
        position: item.position,
        stackHeight: this.getStackHeight(item),
      };

      item.definition.onSynergyUpdate(item, ctx);
    }

    // Apply character passives AFTER synergy calculation
    this.applyCharacterPassives(allItems);

    // Apply item combinations (fusions)
    this.applyCombinations(allItems);
  }

  /** Apply item combination bonuses when specific items are adjacent */
  private applyCombinations(allItems: PlacedItem[]): void {
    // Clear previous fusion states so moving items apart removes the glow
    for (const item of allItems) {
      (item.state as any).fusedName = undefined;
      (item.state as any).fusionColor = undefined;
    }

    for (const item of allItems) {
      const adjacents = this.getAdjacentItems(item.instanceId);
      const adjacentDefIds = adjacents.map(a => a.definition.id);

      for (const combo of ALL_COMBINATIONS) {
        // Only apply bonuses to itemA — that is the primary beneficiary of the fusion
        if (combo.itemA !== item.definition.id) continue;
        if (!adjacentDefIds.includes(combo.itemB)) continue;

        // Apply bonuses to itemA only
        if (combo.bonuses.damageMultiplier) item.stats.damageMultiplier *= combo.bonuses.damageMultiplier;
        if (combo.bonuses.fireRateMultiplier) item.stats.fireRateMultiplier *= combo.bonuses.fireRateMultiplier;
        if (combo.bonuses.projectileSpeed) item.stats.projectileSpeed += combo.bonuses.projectileSpeed;
        if (combo.bonuses.aoeRadius) item.stats.aoeRadius += combo.bonuses.aoeRadius;
        if (combo.bonuses.piercing) item.state.piercingBonus = (item.state.piercingBonus ?? 0) + combo.bonuses.piercing;
        if (combo.bonuses.healPerSecond) item.stats.healPerSecond += combo.bonuses.healPerSecond;
        if (combo.bonuses.projectileCount) item.stats.projectileCount += combo.bonuses.projectileCount;
        // Gold-economy fusions stack into the same fields their base items already use
        // (gold_magnet's goldBonus, luck_stone's shopRarityBonus) so they combine cleanly
        // with any other gold/luck sources instead of needing their own read path.
        if (combo.bonuses.goldMultiplier) (item.state as any).goldBonus = ((item.state as any).goldBonus ?? 0) + combo.bonuses.goldMultiplier;
        if (combo.bonuses.shopRarityBonus) (item.state as any).shopRarityBonus = ((item.state as any).shopRarityBonus ?? 0) + combo.bonuses.shopRarityBonus;
        if (combo.addTags) {
          for (const tag of combo.addTags) {
            if (!item.definition.tags.includes(tag as any)) {
              (item.definition.tags as string[]).push(tag);
            }
          }
        }

        // Mark as fused for visual display
        (item.state as any).fusedName = combo.resultName;
        (item.state as any).fusionColor = combo.fusionColor || '#f472b6';
        break; // Only one fusion per item
      }
    }
  }

  /**
   * Apply character-specific passive bonuses to all items.
   */
  private applyCharacterPassives(allItems: PlacedItem[]): void {
    const charId = this.config.characterId;

    switch (charId) {
      case 'fire_lord': {
        // All items with tag 'Fogo' get +50% damage
        for (const item of allItems) {
          if (item.definition.tags.includes('Fogo')) {
            item.stats.damageMultiplier *= 1.5;
          }
          // Explosion AoE radius +30% (handled in CombatEngine collision)
        }
        break;
      }
      case 'storm_runner': {
        // All emitters get +40% fire rate, -20% damage
        for (const item of allItems) {
          if (item.definition.tags.includes('Emissor') || item.definition.tags.includes('Arma')) {
            item.stats.fireRateMultiplier *= 1.4;
            item.stats.damageMultiplier *= 0.8;
          }
        }
        break;
      }
      case 'void_walker': {
        // +10% damage per 10 HP below max (max +100%)
        // Note: we use a stored reference to current HP; this gets recalculated when synergies update
        // Since we don't have direct access to combat state here, we store a multiplier that
        // CombatEngine can use. We approximate using a passive damage boost tracked externally.
        // For now, apply via a state flag that CombatEngine reads.
        // Actually, we can't access combat HP from here. Instead we'll mark items
        // and let the combat engine apply the bonus when firing.
        // Store the character bonus type for combat engine to handle dynamically.
        break;
      }
      case 'beast_tamer': {
        // Items with tag 'Pet' or 'Animal' get +100% damage and +50% fire rate
        for (const item of allItems) {
          if (item.definition.tags.includes('Pet') || item.definition.tags.includes('Animal')) {
            item.stats.damageMultiplier *= 2.0;
            item.stats.fireRateMultiplier *= 1.5;
          }
        }
        break;
      }
      case 'firefighter': {
        // Guardian: -15% fire rate (defensive focus), fire items -30% (trauma do fogo)
        for (const item of allItems) {
          if (item.definition.tags.includes('Emissor') || item.definition.tags.includes('Arma')) {
            item.stats.fireRateMultiplier *= 0.85;
          }
          if (item.definition.tags.includes('Fogo')) {
            item.stats.damageMultiplier *= 0.7;
          }
        }
        break;
      }
      // grass_man: handled by onSynergyUpdate (stacking height bonus)
      // aqua_sage: slow is handled in CombatEngine collision; heal is passive in tick
    }
  }

  // ─── Queries ────────────────────────────────────────────────────────────

  getAllItems(): PlacedItem[] {
    return Array.from(this.items.values());
  }

  getItem(instanceId: string): PlacedItem | undefined {
    return this.items.get(instanceId);
  }

  getItemAt(col: number, row: number): PlacedItem | null {
    const id = this.grid[row]?.[col];
    if (!id) return null;
    return this.items.get(id) ?? null;
  }

  getItemsByTag(tag: string): PlacedItem[] {
    return this.getAllItems().filter(i => i.definition.tags.includes(tag as any));
  }

  getGridSnapshot(): (string | null)[][] {
    return this.grid.map(row => [...row]);
  }

  /**
   * Calculate total combat power from all emitters in the backpack.
   */
  calculateBackpackPower(): CombatPower {
    const emitters = this.getAllItems().filter(i =>
      i.definition.tags.includes('Emissor') || i.definition.tags.includes('Arma')
    );

    let totalDamage = 0;
    let totalFireRate = 0;
    let totalProjectiles = 0;
    let totalHeal = 0;
    let totalArmor = 0;

    for (const emitter of emitters) {
      const s = emitter.stats;
      const dmg = s.damage * s.damageMultiplier;
      const rate = s.fireRate * s.fireRateMultiplier;
      totalDamage += dmg;
      totalFireRate += rate;
      totalProjectiles += s.projectileCount;
    }

    for (const item of this.getAllItems()) {
      totalHeal += item.stats.healPerSecond;
      totalArmor += item.stats.armorBonus;
    }

    return { totalDamage, totalFireRate, totalProjectiles, totalHeal, totalArmor, emitters };
  }
}

// ─── Combat Power Output ─────────────────────────────────────────────────────

export interface CombatPower {
  totalDamage: number;
  totalFireRate: number;
  totalProjectiles: number;
  totalHeal: number;
  totalArmor: number;
  emitters: PlacedItem[];
}
