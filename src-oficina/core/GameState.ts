import type { CommunityStats, SaveData } from './types';
import { INITIAL_STATS, INITIAL_RELATIONSHIPS } from '../data/community';
import { ITEMS } from '../data/items';
import { SaveManager } from './SaveManager';

export class GameState {
  dayIndex = 0;
  stats: CommunityStats = { ...INITIAL_STATS };
  relationships: Record<string, number> = { ...INITIAL_RELATIONSHIPS };
  choicesMade: Record<string, string> = {};
  finished = false;

  static loadOrNew(): GameState {
    const gs = new GameState();
    const saved = SaveManager.load();
    if (saved) {
      gs.dayIndex = saved.dayIndex;
      gs.stats = saved.stats;
      gs.relationships = saved.relationships;
      gs.choicesMade = saved.choicesMade;
      gs.finished = saved.finished;
    }
    return gs;
  }

  get currentItem() {
    return ITEMS[this.dayIndex] ?? null;
  }

  get totalDays() {
    return ITEMS.length;
  }

  clampStats() {
    for (const k of Object.keys(this.stats) as (keyof CommunityStats)[]) {
      this.stats[k] = Math.max(0, Math.min(100, this.stats[k]));
    }
    for (const k of Object.keys(this.relationships)) {
      this.relationships[k] = Math.max(0, Math.min(100, this.relationships[k]));
    }
  }

  advanceDay() {
    this.dayIndex++;
    if (this.dayIndex >= ITEMS.length) this.finished = true;
    this.persist();
  }

  persist() {
    const data: SaveData = {
      version: 1,
      dayIndex: this.dayIndex,
      stats: this.stats,
      relationships: this.relationships,
      choicesMade: this.choicesMade,
      finished: this.finished,
    };
    SaveManager.save(data);
  }

  reset() {
    this.dayIndex = 0;
    this.stats = { ...INITIAL_STATS };
    this.relationships = { ...INITIAL_RELATIONSHIPS };
    this.choicesMade = {};
    this.finished = false;
    SaveManager.clear();
  }
}
