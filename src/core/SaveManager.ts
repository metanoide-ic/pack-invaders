/**
 * SAVE MANAGER — Sistema de salvamento com 4 slots.
 * Salva no localStorage como packinvaders_save_0 até packinvaders_save_3.
 * Auto-save após cada wave (na fase CARDS).
 */

export interface SaveSlot {
  id: number;
  exists: boolean;
  characterId: string;
  month: number;
  year: number;
  totalMonths: number;
  gold: number;
  itemCount: number;
  aliencore: boolean;
  twitchEnabled: boolean;
  /** Full serialized game state */
  gameData: string;
}

export interface SaveGameData {
  characterId: string;
  month: number;
  year: number;
  totalMonths: number;
  gold: number;
  playerHp: number;
  playerMaxHp: number;
  aliencoreMode: boolean;
  aliencoreUnlocked: boolean;
  items: SavedItem[];
  stats: {
    enemiesKilled: number;
    damageDealt: number;
    itemsBought: number;
  };
}

export interface SavedItem {
  defId: string;
  col: number;
  row: number;
  /** Upgrade level from merging duplicates (0 = base) */
  up?: number;
}

const SAVE_PREFIX = 'packinvaders_save_';

export class SaveManager {
  /** Get all 4 save slot summaries */
  static getSlots(): SaveSlot[] {
    const slots: SaveSlot[] = [];
    for (let i = 0; i < 4; i++) {
      slots.push(SaveManager.getSlot(i));
    }
    return slots;
  }

  /** Get a single save slot summary */
  static getSlot(id: number): SaveSlot {
    const raw = localStorage.getItem(`${SAVE_PREFIX}${id}`);
    if (!raw) {
      return {
        id,
        exists: false,
        characterId: '',
        month: 0,
        year: 0,
        totalMonths: 0,
        gold: 0,
        itemCount: 0,
        aliencore: false,
        twitchEnabled: false,
        gameData: '',
      };
    }
    try {
      const data: SaveGameData = JSON.parse(raw);
      return {
        id,
        exists: true,
        characterId: data.characterId,
        month: data.month,
        year: data.year,
        totalMonths: data.totalMonths,
        gold: data.gold,
        itemCount: data.items.length,
        aliencore: data.aliencoreMode,
        twitchEnabled: false,
        gameData: raw,
      };
    } catch {
      return {
        id,
        exists: false,
        characterId: '',
        month: 0,
        year: 0,
        totalMonths: 0,
        gold: 0,
        itemCount: 0,
        aliencore: false,
        twitchEnabled: false,
        gameData: '',
      };
    }
  }

  /** Save game state to a slot */
  static save(slotId: number, data: SaveGameData): void {
    try {
      localStorage.setItem(`${SAVE_PREFIX}${slotId}`, JSON.stringify(data));
    } catch { /* ignore storage errors */ }
  }

  /** Load game data from a slot (returns null if empty) */
  static load(slotId: number): SaveGameData | null {
    const raw = localStorage.getItem(`${SAVE_PREFIX}${slotId}`);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as SaveGameData;
    } catch {
      return null;
    }
  }

  /** Delete a save slot */
  static deleteSlot(slotId: number): void {
    localStorage.removeItem(`${SAVE_PREFIX}${slotId}`);
  }

  /** Check if aliencore has ever been unlocked (any slot) */
  static isAliencoreEverUnlocked(): boolean {
    for (let i = 0; i < 4; i++) {
      const slot = SaveManager.getSlot(i);
      if (slot.exists && slot.aliencore) return true;
    }
    return localStorage.getItem('packinvaders_aliencore_unlocked') === '1';
  }

  /** Mark aliencore as globally unlocked */
  static markAliencoreUnlocked(): void {
    localStorage.setItem('packinvaders_aliencore_unlocked', '1');
  }
}
