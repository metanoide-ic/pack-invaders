/**
 * CODEX MANAGER — Tracks all unlocked lore entries.
 * Saves/loads progress to localStorage.
 * Integrates with GameManager for auto-unlocking.
 */

import { CodexEntry, ENEMY_LORE, BOSS_LORE, CHARACTER_LORE, ITEM_LORE, CARD_LORE } from '../data/codex';
import { ALL_COLLECTIBLES } from '../data/collectibles';

const STORAGE_KEY = 'packinvaders_codex';

interface CodexSaveData {
  unlocked: string[];
  lore2Unlocked: string[];
  killCounts: Record<string, number>;
}

export class CodexManager {
  private entries: Map<string, CodexEntry> = new Map();
  private killCounts: Map<string, number> = new Map();

  constructor() {
    this.initEntries();
    this.load();
  }

  private initEntries(): void {
    // Build all entries from static data
    const allRaw = [
      ...ENEMY_LORE,
      ...BOSS_LORE,
      ...CHARACTER_LORE,
      ...ITEM_LORE,
      ...CARD_LORE,
    ];

    for (const raw of allRaw) {
      this.entries.set(raw.id, {
        ...raw,
        unlocked: false,
        lore2Unlocked: false,
      });
    }

    // Add collectible entries
    for (const col of ALL_COLLECTIBLES) {
      this.entries.set(col.id, {
        id: col.id,
        category: 'collectible',
        name: col.name,
        lore1: col.lore,
        unlocked: false,
        lore2Unlocked: false,
      });
    }
  }

  // ─── Public API ────────────────────────────────────────────────────────────

  unlockEntry(id: string): boolean {
    const entry = this.entries.get(id);
    if (!entry || entry.unlocked) return false;
    entry.unlocked = true;
    this.save();
    return true;
  }

  unlockLore2(id: string): boolean {
    const entry = this.entries.get(id);
    if (!entry || !entry.unlocked || entry.lore2Unlocked) return false;
    entry.lore2Unlocked = true;
    this.save();
    return true;
  }

  /** Record a kill and check if lore2 threshold is met */
  recordKill(enemyId: string): void {
    const current = this.killCounts.get(enemyId) ?? 0;
    this.killCounts.set(enemyId, current + 1);

    // Auto-unlock entry on first kill
    this.unlockEntry(enemyId);

    // Check lore2 threshold
    const entry = this.entries.get(enemyId);
    if (entry && entry.lore2Threshold && !entry.lore2Unlocked) {
      if ((current + 1) >= entry.lore2Threshold) {
        this.unlockLore2(enemyId);
      }
    }

    this.save();
  }

  getEntry(id: string): CodexEntry | undefined {
    return this.entries.get(id);
  }

  getAllByCategory(category: CodexEntry['category']): CodexEntry[] {
    return Array.from(this.entries.values())
      .filter(e => e.category === category);
  }

  getProgress(): { unlocked: number; total: number } {
    const all = Array.from(this.entries.values());
    return {
      unlocked: all.filter(e => e.unlocked).length,
      total: all.length,
    };
  }

  getKillCount(enemyId: string): number {
    return this.killCounts.get(enemyId) ?? 0;
  }

  // ─── Timeline-locked entries ──────────────────────────────────────────────

  /**
   * Check if any codex entries should unlock based on the current month.
   * Some lore only appears after certain time has passed in the invasion.
   */
  checkTimelocks(totalMonths: number): void {
    // Unlock base collectible lore entries at timeline milestones
    const timeUnlocks: Record<number, string[]> = {
      6: ['col_news_clip_1', 'col_radio_broadcast'],
      12: ['col_military_order', 'col_survivor_journal_1'],
      18: ['col_survivor_journal_2'],
      24: ['col_emergency_broadcast'],
      // Character lore2 unlocks at key narrative moments
      30: ['grass_man'],  // Raiz lore2 after 30 months of survival
      36: ['fire_lord'],  // Inferno lore2 at year 3
      42: ['aqua_sage'],  // Maré lore2 
      44: ['storm_runner'], // Pulso lore2 (47 days reference)
      46: ['void_walker'], // Abismo lore2
      48: ['beast_tamer'], // Domadora lore2
    };

    const idsToUnlock = timeUnlocks[totalMonths];
    if (idsToUnlock) {
      for (const id of idsToUnlock) {
        const entry = this.entries.get(id);
        if (entry && entry.unlocked && !entry.lore2Unlocked && entry.lore2) {
          this.unlockLore2(id);
        } else if (entry && !entry.unlocked) {
          this.unlockEntry(id);
        }
      }
    }
  }

  // ─── Persistence ──────────────────────────────────────────────────────────

  private save(): void {
    const data: CodexSaveData = {
      unlocked: Array.from(this.entries.values())
        .filter(e => e.unlocked).map(e => e.id),
      lore2Unlocked: Array.from(this.entries.values())
        .filter(e => e.lore2Unlocked).map(e => e.id),
      killCounts: Object.fromEntries(this.killCounts),
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch { /* ignore storage errors */ }
  }

  private load(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data: CodexSaveData = JSON.parse(raw);
      for (const id of data.unlocked) {
        const entry = this.entries.get(id);
        if (entry) entry.unlocked = true;
      }
      for (const id of data.lore2Unlocked) {
        const entry = this.entries.get(id);
        if (entry) entry.lore2Unlocked = true;
      }
      for (const [id, count] of Object.entries(data.killCounts)) {
        this.killCounts.set(id, count);
      }
    } catch { /* ignore parse errors, start fresh */ }
  }
}
