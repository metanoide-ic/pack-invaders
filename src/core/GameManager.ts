/**
 * GAME MANAGER — Orquestra todos os sistemas.
 * Gerencia fases: Title → Inventory → Combat → Cards → Shop → repeat
 * Timeline: Ano/Mês system replaces waves. Roguelike endless until death.
 */

import { BackpackGrid, BackpackConfig } from './BackpackGrid';
import { CombatEngine, Enemy, computeWaveCount } from './CombatEngine';
import { ItemDefinition } from './ItemSystem';
import { ALL_ITEMS } from '../data/items';
import { pickRandomCards } from '../data/cards';
import { ALL_CHARACTERS, CharacterDefinition } from '../data/characters';
import { CodexManager } from './CodexManager';
import { getMonthlyFlavorText } from '../data/timeline';
import { TwitchIntegration, TwitchEvent } from '../client/TwitchIntegration';
import { pickRandomVendor, getVendorGreeting, VendorDefinition, ALL_VENDORS } from '../data/vendors';
import { SaveManager, SaveGameData, SavedItem } from './SaveManager';
import { createSkillStates, SkillState, SkillContext, getSkillPowerMult } from './SkillSystem';
import { getRandomCollectible, Collectible } from '../data/collectibles';
import { updateGlobalStats, checkAchievements } from '../data/achievements';
import { getMetaGoldBonus } from '../data/missions';
import { getDifficultyById, Difficulty, unlockNextDifficulty } from '../data/difficulties';
import { addToLeaderboard } from '../data/leaderboard';
import { getRelicBonuses, getRandomNewRelic, getRelicForBoss, addRelic, Relic, getEquippedRelics } from '../data/relics';
import { VersusEngine } from './VersusEngine';
import { getDailyChallenge, getDailyBest, setDailyBest } from '../data/dailyChallenge';

export type GamePhase = 'SPLASH' | 'MAIN_MENU' | 'SAVE_SELECT' | 'CREDITS' | 'ACHIEVEMENTS' | 'MISSIONS' | 'TITLE' | 'INVENTORY' | 'COMBAT' | 'CARDS' | 'SHOP' | 'GAME_OVER' | 'VICTORY' | 'CODEX' | 'TWITCH_VOTE' | 'SETTINGS' | 'EXTRA_MODES' | 'COOP' | 'VERSUS_SHIPS' | 'VERSUS_PVP';

export interface WaveEvent {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

const WAVE_EVENTS: WaveEvent[] = [
  { id: 'gold_rush', name: 'Jackpot', description: '+100% gold nessa wave!', icon: '💰', color: '#fbbf24' },
  { id: 'speed_wave', name: 'Blitz', description: 'Inimigos 50% mais rápidos!', icon: '💨', color: '#ef4444' },
  { id: 'armored_wave', name: 'Blindados', description: 'HP dos inimigos +50%!', icon: '🛡', color: '#94a3b8' },
  { id: 'swarm', name: 'Infestação', description: '+50% inimigos, menores.', icon: '🐛', color: '#a855f7' },
  { id: 'heal_wave', name: 'Brisa', description: '+5 HP/s nessa wave.', icon: '💚', color: '#4ade80' },
  { id: 'crit_wave', name: 'Crit Zone', description: '30% chance de crit em tudo.', icon: '⚡', color: '#f97316' },
  { id: 'no_shield', name: 'Exposed', description: 'Sem escudo essa wave.', icon: '⚠', color: '#dc2626' },
  { id: 'double_combo', name: 'Streak', description: 'Timer de combo 2x maior.', icon: '🔥', color: '#f97316' },
  { id: 'meteor_rain', name: 'Chuva de Meteoros', description: 'Meteoros caem do céu — desvie!', icon: '☄', color: '#f97316' },
  { id: 'supply_drop', name: 'Suprimentos', description: 'Power-ups caem 3x mais!', icon: '🎁', color: '#22d3ee' },
];

/**
 * Year Anomalies — from Year 2 on, each year rolls one global modifier that
 * lasts all 12 months. Every anomaly pairs a threat with a payoff so late
 * runs change texture instead of only inflating numbers.
 */
export interface YearAnomaly {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export const YEAR_ANOMALIES: YearAnomaly[] = [
  { id: 'horde', name: 'Ano da Horda', description: '+35% inimigos, porém 15% mais fracos. +10% gold.', icon: '👾', color: '#f472b6' },
  { id: 'haste', name: 'Ano da Pressa', description: 'Inimigos 20% mais rápidos. +25% gold.', icon: '💨', color: '#fbbf24' },
  { id: 'elites', name: 'Ano das Elites', description: 'Muito mais elites. +30% gold.', icon: '👑', color: '#38bdf8' },
  { id: 'bounty', name: 'Ano da Fartura', description: 'Power-ups 2x mais comuns. Inimigos +15% HP.', icon: '🎁', color: '#4ade80' },
];

export interface CardChoice {
  id: string;
  name: string;
  description: string;
  apply: (game: GameManager) => void;
}

export interface PotionDef {
  id: string;
  name: string;
  icon: string;
  cost: number;
  effect: (game: GameManager) => void;
}

export interface PotionSlot {
  def: PotionDef;
  count: number;
}

export const POTIONS: PotionDef[] = [
  { id: 'health_potion', name: 'Poção de Vida', icon: '❤', cost: 25, effect(game) { game.combat.state.playerHp = Math.min(game.combat.state.playerMaxHp, game.combat.state.playerHp + 40); } },
  { id: 'shield_potion', name: 'Poção de Escudo', icon: '🛡', cost: 20, effect(game) { game.combat.state.playerShield = game.combat.state.playerMaxShield; } },
  { id: 'rage_potion', name: 'Poção de Fúria', icon: '💢', cost: 35, effect(game) { for (const sk of game.skills) { sk.cooldownRemaining = 0; } } },
  { id: 'gold_potion', name: 'Poção de Ouro', icon: '✨', cost: 15, effect(game) { game.combat.state.gold += 30; } },
];

export class GameManager {
  phase: GamePhase = 'SPLASH';
  backpack!: BackpackGrid;
  combat!: CombatEngine;
  /** Active skills for the current character */
  skills: SkillState[] = [];
  /** Consumable potions (max 3, use with key 4/5/6) */
  potions: PotionSlot[] = [];
  /** Legacy wave counter (kept for compat, equals totalMonths) */
  wave: number = 0;
  /** Current month in the year (1-12) */
  month: number = 0;
  /** Current year (1+) */
  year: number = 1;
  /** Total months elapsed (the real difficulty counter) */
  totalMonths: number = 0;
  gold: number = 50; // Starting gold
  characterId: string = 'grass_man';
  cardChoices: CardChoice[] = [];
  /** Player movement direction for combat: -1, 0, 1 */
  playerDir: number = 0;
  /** Active synergy tags for HUD display */
  activeSynergies: string[] = [];
  /** Time between phases for transition */
  phaseTransitionTimer: number = 0;
  /** Gold earned in last wave for display */
  lastWaveGold: number = 0;
  /** Characters available for selection */
  characters: CharacterDefinition[] = ALL_CHARACTERS;
  /** Codex manager for lore tracking */
  codex: CodexManager = new CodexManager();
  /** Twitch integration (optional) */
  twitch: TwitchIntegration = new TwitchIntegration();
  /** Stats tracking for death screen */
  stats = {
    enemiesKilled: 0,
    damageDealt: 0,
    itemsBought: 0,
    codexUnlockedThisRun: [] as string[],
    fusionsDiscovered: [] as string[],
    skillsUsed: 0,
    runStartTime: Date.now(),
  };
  /** Best run record (months survived) */
  bestRun: number = parseInt(localStorage.getItem('packinvaders_best_run') || '0', 10);
  /** Whether to show first-play controls overlay */
  showControlsOverlay: boolean = !localStorage.getItem('packinvaders_played_before');
  /** Twitch vote result pending application */
  twitchVoteResult: { winner: string; votes: Map<string, number>; totalVotes: number } | null = null;
  /** Current active vendor for this shop visit */
  currentVendor: VendorDefinition | null = null;
  /** Current vendor greeting */
  vendorGreeting: string = '';
  /** Unlocked characters for vendor availability */
  unlockedCharIds: string[] = ['grass_man'];
  /** Phase before entering settings (to return to) */
  previousPhase: GamePhase = 'SPLASH';
  /** Current difficulty level */
  currentDifficulty: string = 'soldier';
  /** Aliencore mode: harder difficulty unlocked after month 48 */
  aliencoreMode: boolean = false;
  /** Whether aliencore has been unlocked this run */
  aliencoreUnlocked: boolean = false;
  /** Current save slot ID (-1 if none) */
  currentSaveSlot: number = -1;
  /** Show survival mode message */
  showSurvivalMessage: boolean = false;
  /** Survival message timer */
  survivalMessageTimer: number = 0;
  /** Enemies killed in current wave (for unlock tracking) */
  currentWaveKills: number = 0;
  /** Collectible found this wave (null if none) */
  pendingCollectible: Collectible | null = null;
  /** Current wave event modifier (null = normal wave) */
  currentWaveEvent: WaveEvent | null = null;
  /** Year Anomaly (Year 2+): global modifier for the whole current year */
  currentAnomaly: YearAnomaly | null = null;
  private anomalyYear = 0;
  /** Relic dropped this wave (shown on card screen) */
  pendingRelic: Relic | null = null;
  /** Newly unlocked difficulty ID (shown on game over screen) */
  newlyUnlockedDifficulty: string | null = null;
  /** Interest earned on banked gold last wave (shown on cards screen) */
  lastInterest: number = 0;
  /** Whether the current run is today's Daily Challenge (fixed character + anomaly) */
  isDailyChallenge: boolean = false;
  /** Date key (YYYY-MM-DD) of the active/last-played daily challenge */
  dailyDateKey: string = '';
  /** Best months survived on today's daily challenge (0 if not played yet) */
  dailyBest: number = 0;

  /** Preview of next month's wave for the inventory screen */
  getNextWavePreview(): { count: number; isBoss: boolean } {
    const nextTotal = this.totalMonths + 1;
    const m = this.month + 1 > 12 ? 1 : this.month + 1;
    const isBoss = this.monthSchedule(m).boss;
    const count = nextTotal === 1 ? 4 : computeWaveCount(nextTotal);
    return { count: Math.floor(count), isBoss };
  }

  constructor(characterId: string = 'grass_man') {
    this.characterId = characterId;
    // Load unlocked characters from localStorage
    this.unlockedCharIds = JSON.parse(localStorage.getItem('packinvaders_unlocked_chars') || '["grass_man"]');
    this.initGame(characterId);
  }

  private initGame(characterId: string): void {
    this.characterId = characterId;

    const charDef = ALL_CHARACTERS.find(c => c.id === characterId) || ALL_CHARACTERS[0];

    const config: BackpackConfig = {
      cols: charDef.backpackCols,
      rows: charDef.backpackRows,
      characterId,
      requireStacking: characterId === 'grass_man',
      backpackRule: charDef.backpackRule === 'stacking' ? 'stacking'
        : charDef.backpackRule === 'columns_only' ? 'columns_only'
        : charDef.backpackRule === 'diagonal' ? 'diagonal'
        : 'freeform',
      // Base weight cap scales gently with grid size (bigger backpacks get a
      // little more room) but is far from 1:1 with cell count — the point is
      // to cap loadout power independent of physical space. ~21-25 for the
      // 25-56 cell grids in the roster; weight-capacity cards add on top.
      baseMaxWeight: 18 + Math.floor((charDef.backpackRows * charDef.backpackCols) / 8),
    };

    this.backpack = new BackpackGrid(config);
    this.combat = new CombatEngine(this.backpack);
    this.skills = createSkillStates(characterId);
    this.gold = charDef.startingGold + getMetaGoldBonus();
    this.combat.state.playerHp = charDef.startingHp;
    this.combat.state.playerMaxHp = charDef.startingHp;
    // Shield scales with character: tankier chars get more shield
    const shieldAmounts: Record<string, number> = {
      grass_man: 25, fire_lord: 15, aqua_sage: 35, storm_runner: 20, void_walker: 10, beast_tamer: 20, firefighter: 40,
      scrapper: 15, renegade: 0, // Sétimo's xeno carapace rejects human shield tech
    };
    this.combat.state.playerMaxShield = shieldAmounts[characterId] ?? 25;
    this.combat.state.playerShield = this.combat.state.playerMaxShield;

    // Apply relic bonuses (meta-progression)
    const relicBonus = getRelicBonuses();
    if (relicBonus.hpBonus) {
      this.combat.state.playerMaxHp += relicBonus.hpBonus;
      this.combat.state.playerHp += relicBonus.hpBonus;
    }
    if (relicBonus.shieldBonus) {
      this.combat.state.playerMaxShield += relicBonus.shieldBonus;
      this.combat.state.playerShield = this.combat.state.playerMaxShield;
    }
    this.month = 0;
    this.year = 1;
    this.totalMonths = 0;
    this.wave = 0;
    this.newAchievements = [];
    this.newlyUnlockedDifficulty = null;
    this.currentAnomaly = null;
    this.anomalyYear = 0;
    this.isDailyChallenge = false;
    this.aliencoreMode = false;
    this.aliencoreUnlocked = SaveManager.isAliencoreEverUnlocked();

    // Give player the starting items — scan for first valid position
    for (const itemId of charDef.startingItems) {
      const item = ALL_ITEMS.find(i => i.id === itemId);
      if (!item) continue;
      let placed = false;
      // Try bottom-to-top, left-to-right until a valid spot is found
      outer: for (let row = charDef.backpackRows - 1; row >= 0; row--) {
        for (let col = 0; col < charDef.backpackCols; col++) {
          if (this.backpack.placeItem(item, { col, row })) {
            placed = true;
            break outer;
          }
        }
      }
      if (!placed) {
        // Fallback: try any position top-to-bottom
        for (let row = 0; row < charDef.backpackRows; row++) {
          for (let col = 0; col < charDef.backpackCols; col++) {
            if (this.backpack.placeItem(item, { col, row })) break;
          }
        }
      }
    }
  }

  // ─── Timeline ─────────────────────────────────────────────────────────────

  /** Get the display string for current time: "Ano X — Mês Y" */
  getTimeString(): string {
    return `Ano ${this.year} — Mês ${this.month}`;
  }

  /** Get the monthly flavor text for the current month */
  getMonthlyFlavor(): string {
    return getMonthlyFlavorText(this.totalMonths);
  }

  /** Per-wave gold multiplier — shop visits went from every month to ~every
   * 3rd, so raw income is cut to roughly what 3 old waves' worth would have
   * been across those 3 waves combined (not 3x it), keeping each shop trip's
   * buying power close to before while total gold earned over a run drops
   * for real. Tune here if runs feel too rich or too broke. */
  private static readonly GOLD_ECONOMY_SCALE = 0.35;

  /** Soft cap on a single wave's post-multiplier gold, keyed to totalMonths
   * (progression) instead of enemy count. Enemy count alone climbs to 80/wave
   * by year 3+ and each kill's reward also grows with wave, so uncapped gold
   * compounds into the thousands per wave while the shop's item catalog stays
   * flat (30-300g) — a run would end up sitting on tens of thousands of idle
   * gold with nothing worth buying. Square-root growth keeps early/mid-game
   * rewards close to their natural value (where the cap rarely binds) while
   * damping the late-game runaway so the shop stays meaningful all the way
   * through a long run. */
  private static waveGoldCap(totalMonths: number): number {
    return Math.floor(50 + 130 * Math.sqrt(totalMonths));
  }

  /**
   * Fixed 12-month schedule, identical every year: boss + shop every 3
   * months (3/6/9/12), a shop-only stop at 11 to gear up before the big
   * fight, cards every month except the three boss-only ones, and month 12
   * is always the giant screen-filling boss instead of a regular one.
   * Index 0 = month 1 ... index 11 = month 12.
   */
  private static readonly MONTH_SCHEDULE: { boss: boolean; megaBoss: boolean; cards: boolean; shop: boolean }[] = [
    { boss: false, megaBoss: false, cards: true, shop: false },  // 1
    { boss: false, megaBoss: false, cards: true, shop: false },  // 2
    { boss: true, megaBoss: false, cards: false, shop: true },   // 3
    { boss: false, megaBoss: false, cards: true, shop: false },  // 4
    { boss: false, megaBoss: false, cards: true, shop: false },  // 5
    { boss: true, megaBoss: false, cards: false, shop: true },   // 6
    { boss: false, megaBoss: false, cards: true, shop: false },  // 7
    { boss: false, megaBoss: false, cards: true, shop: false },  // 8
    { boss: true, megaBoss: false, cards: false, shop: true },   // 9
    { boss: false, megaBoss: false, cards: true, shop: false },  // 10
    { boss: false, megaBoss: false, cards: false, shop: true },  // 11
    { boss: true, megaBoss: true, cards: true, shop: true },     // 12
  ];

  private monthSchedule(month: number): { boss: boolean; megaBoss: boolean; cards: boolean; shop: boolean } {
    return GameManager.MONTH_SCHEDULE[Math.max(1, Math.min(12, month)) - 1];
  }

  /** Check if current month should have a boss based on the fixed schedule */
  isBossMonth(): boolean {
    return this.monthSchedule(this.month).boss;
  }

  /** The giant screen-filling boss (always month 12) instead of a regular one */
  isMegaBossMonth(): boolean {
    return this.monthSchedule(this.month).megaBoss;
  }

  /** Whether this month offers a card choice after combat */
  hasCardsThisMonth(): boolean {
    return this.monthSchedule(this.month).cards;
  }

  /** Whether this month's post-combat flow includes a shop visit. Month 1 of
   * the very first run gets a one-time bonus shop so the player isn't stuck
   * with zero purchases until month 3 — later years' month 1 does not repeat it. */
  hasShopThisMonth(): boolean {
    return this.monthSchedule(this.month).shop || this.totalMonths === 1;
  }

  // ─── Phase Transitions ────────────────────────────────────────────────────

  startFromTitle(characterId: string): void {
    this.initGame(characterId);
    this.updateActiveSynergies();
    this.phase = 'INVENTORY';
  }

  /** Start from save select with a specific slot */
  startFromSave(slotId: number, characterId: string): void {
    this.currentSaveSlot = slotId;
    this.initGame(characterId);
    this.phase = 'INVENTORY';
  }

  /** Load a saved game from a slot */
  loadFromSave(slotId: number): boolean {
    const data = SaveManager.load(slotId);
    if (!data) return false;
    this.currentSaveSlot = slotId;
    this.initGame(data.characterId);
    this.month = data.month;
    this.year = data.year;
    this.totalMonths = data.totalMonths;
    this.wave = data.totalMonths;
    this.gold = data.gold;
    this.combat.state.playerHp = data.playerHp;
    this.combat.state.playerMaxHp = data.playerMaxHp;
    this.aliencoreMode = data.aliencoreMode;
    this.aliencoreUnlocked = data.aliencoreUnlocked;
    this.currentDifficulty = data.currentDifficulty ?? 'soldier';
    this.stats.enemiesKilled = data.stats.enemiesKilled;
    this.stats.damageDealt = data.stats.damageDealt;
    this.stats.itemsBought = data.stats.itemsBought;

    // Clear backpack and restore items
    for (const item of this.backpack.getAllItems()) {
      this.backpack.removeItem(item.instanceId);
    }
    for (const saved of data.items) {
      const def = ALL_ITEMS.find(i => i.id === saved.defId);
      if (def) {
        const id = this.backpack.placeItem(def, { col: saved.col, row: saved.row });
        if (id && saved.up && saved.up > 0) {
          const placed = this.backpack.getItem(id);
          if (placed) {
            (placed.state as any).upgradeLevel = saved.up;
          }
        }
      }
    }
    this.backpack.recalculateSynergies();

    this.phase = 'INVENTORY';
    return true;
  }

  /** Auto-save current game state */
  autoSave(): void {
    if (this.currentSaveSlot < 0) return;
    const items: SavedItem[] = this.backpack.getAllItems().map(item => ({
      defId: item.definition.id,
      col: item.position.col,
      row: item.position.row,
      up: this.backpack.getUpgradeLevel(item) || undefined,
    }));
    const data: SaveGameData = {
      characterId: this.characterId,
      month: this.month,
      year: this.year,
      totalMonths: this.totalMonths,
      gold: this.gold,
      playerHp: this.combat.state.playerHp,
      playerMaxHp: this.combat.state.playerMaxHp,
      aliencoreMode: this.aliencoreMode,
      aliencoreUnlocked: this.aliencoreUnlocked,
      currentDifficulty: this.currentDifficulty,
      items,
      stats: {
        enemiesKilled: this.stats.enemiesKilled,
        damageDealt: this.stats.damageDealt,
        itemsBought: this.stats.itemsBought,
      },
    };
    SaveManager.save(this.currentSaveSlot, data);
  }

  startCombat(): void {
    // Advance the timeline
    this.month++;
    if (this.month > 12) {
      this.month = 1;
      this.year++;
    }
    this.totalMonths++;
    this.wave = this.totalMonths; // legacy compat

    // Determine if boss month (can be forced by Twitch — always a regular
    // boss when forced this way, never the scheduled mega boss)
    const isBoss = this.isBossMonth() || this.twitch.bossNextWave;
    const isMegaBoss = this.isMegaBossMonth();
    this.twitch.bossNextWave = false;

    // ─── Year Anomaly (Year 2+): rolled once per year, shapes every wave ──
    // Daily Challenge pins its anomaly for the whole run (set in
    // startDailyChallenge, active from month 1) instead of the normal
    // year-2+/random roll.
    const ca = this.combat as any;
    if (this.isDailyChallenge) {
      // currentAnomaly stays as pinned.
    } else if (this.year >= 2) {
      if (this.anomalyYear !== this.year) {
        this.anomalyYear = this.year;
        this.currentAnomaly = YEAR_ANOMALIES[Math.floor(Math.random() * YEAR_ANOMALIES.length)];
      }
    } else {
      this.currentAnomaly = null;
    }
    ca._anomalyCountMult = 1; ca._anomalyHpMult = 1; ca._anomalySpeedMult = 1;
    ca._anomalyGoldMult = 1; ca._anomalyEliteBonus = 0; ca._anomalyDropMult = 1;
    switch (this.currentAnomaly?.id) {
      case 'horde': ca._anomalyCountMult = 1.35; ca._anomalyHpMult = 0.85; ca._anomalyGoldMult = 1.1; break;
      case 'haste': ca._anomalySpeedMult = 1.2; ca._anomalyGoldMult = 1.25; break;
      case 'elites': ca._anomalyEliteBonus = 0.12; ca._anomalyGoldMult = 1.3; break;
      case 'bounty': ca._anomalyDropMult = 2; ca._anomalyHpMult = 1.15; break;
    }

    this.phase = 'COMBAT';
    this.combat.startWave(this.totalMonths, isBoss, isMegaBoss);

    // Announce the anomaly at the start of each year
    if (this.currentAnomaly && this.month === 1) {
      this.combat.spawnFloatingText(640, 230, `${this.currentAnomaly.icon} ${this.currentAnomaly.name.toUpperCase()}!`, this.currentAnomaly.color);
      this.combat.spawnFloatingText(640, 260, this.currentAnomaly.description, '#e2e8f0');
    }

    // Wave Event (20% chance after month 4, never on boss months)
    this.currentWaveEvent = null;
    if (!isBoss && this.totalMonths > 4 && Math.random() < 0.2) {
      this.currentWaveEvent = WAVE_EVENTS[Math.floor(Math.random() * WAVE_EVENTS.length)];
      // Apply event modifiers
      switch (this.currentWaveEvent.id) {
        case 'gold_rush':
          for (const e of this.combat.state.enemies) e.goldReward *= 2;
          break;
        case 'speed_wave':
          for (const e of this.combat.state.enemies) { e.speed *= 1.5; e.baseSpeed *= 1.5; }
          break;
        case 'armored_wave':
          for (const e of this.combat.state.enemies) { e.hp = Math.floor(e.hp * 1.5); e.maxHp = Math.floor(e.maxHp * 1.5); }
          break;
        case 'swarm':
          // Add 50% more enemies (clone random existing ones)
          const extraCount = Math.floor(this.combat.state.enemies.length * 0.5);
          for (let ei = 0; ei < extraCount; ei++) {
            const template = this.combat.state.enemies[ei % this.combat.state.enemies.length];
            this.combat.state.enemies.push({ ...template, id: `swarm_${Date.now()}_${ei}`, x: 50 + Math.random() * 1180, y: -50 - Math.random() * 200, width: Math.floor(template.width * 0.8), height: Math.floor(template.height * 0.8) });
          }
          this.combat.state.totalEnemies = this.combat.state.enemies.length;
          break;
        case 'no_shield':
          this.combat.state.playerShield = 0;
          this.combat.state.playerMaxShield = 0;
          break;
      }
    }

    // ─── Propagar flags de cards para o combat engine ────────────────────
    const g = this as any;
    const c = this.combat as any;

    // Wave event: Suprimentos triples power-up drop chance (reset each wave);
    // the Fartura anomaly stacks on top of it
    c._dropChanceMult = (this.currentWaveEvent?.id === 'supply_drop' ? 3 : 1) * (c._anomalyDropMult ?? 1);
    (this as any)._meteorTimer = 0;

    if (g._goldPerHit) { c._goldPerHitActive = true; c._goldPerHitAmount = g._goldPerHit; }
    if (g._secondWind) { c._secondWindActive = true; c._secondWindUsed = false; }
    if (g._bouncyShots) c._bouncyShots = g._bouncyShots;
    if (g._globalSlow) c._globalSlowMult = g._globalSlow;
    if (g._explodeOnKill) c._explodeOnKill = g._explodeOnKill;
    if (g._contactDamage) c._contactDamageAmount = g._contactDamage;
    if (g._goldPerKill) c._goldPerKill = g._goldPerKill;
    if (g._lastStand) c._lastStandActive = true;
    if (g._rageModePerKill) { c._rageModePerKill = g._rageModePerKill; c._rageDamageBonus = 0; }
    if (g._permanentHealPerSec) c._permanentHealPerSec = g._permanentHealPerSec;
    if (g._heatWaveDps) c._heatWaveDps = g._heatWaveDps;
    if (g._auraBaseDps) c._auraBaseDps = g._auraBaseDps;
    if (g._gravityPull) c._gravityPull = g._gravityPull;
    if (g._executeThreshold) c._executeThreshold = g._executeThreshold;
    if (g._empInterval) c._empInterval = g._empInterval;
    if (g._lightningInterval) c._lightningInterval = g._lightningInterval;
    if (g._damageReflect) c._damageReflect = g._damageReflect;
    // Reset per-wave timers
    c._empTimer = 0; c._lightningTimer = 0;

    // Revives & one-shot defensive cards
    if (g._riftWalk) { c._riftWalkActive = true; c._riftWalkUsed = false; } // 1x/wave
    if (g._phoenixRevive) c._phoenixReviveActive = true; // 1x/run (used-flag lives on CombatEngine itself)
    if (g._nuclearRevive) c._nuclearReviveActive = true; // 1x/run
    if (g._regenShield) c._regenShield = g._regenShield; // 1x/wave (state.regenShieldUsed resets in startWave)

    // Diana (beast_tamer) cards
    if (g._paralyzeFirst) c._paralyzeFirstDuration = g._paralyzeFirst;
    if (g._mindControl) c._mindControlActive = true;
    if (g._reanimate) c._reanimate = g._reanimate;
    if (g._dronePerKills) c._dronePerKills = g._dronePerKills;
    if (g._deathPoison) c._deathPoison = g._deathPoison;
    if (g._bossGoldMult) c._bossGoldMult = g._bossGoldMult;

    // Dr. Eon (void_walker) cards
    if (g._blackHoleInterval) c._blackHoleInterval = g._blackHoleInterval;
    if (g._enemyProjSlow) c._enemyProjSlow = g._enemyProjSlow;
    if (g._deathProjectiles) c._deathProjectiles = g._deathProjectiles;
    if (g._antiMatter) c._antiMatter = true;

    // Neutral cards
    if (g._comboDmgPerHit) c._comboDmgPerHit = g._comboDmgPerHit;
    if (g._bossDamageMult) c._bossDamageMult = g._bossDamageMult;
    if (g._eliteDamageMult) c._eliteDamageMult = g._eliteDamageMult;
    if (g._dashCooldownMult) c._dashCooldownMult = g._dashCooldownMult;
    if (g._shieldRegenMult) c._shieldRegenMult = g._shieldRegenMult;
    if (g._shieldRegenFlat) c._shieldRegenFlat = g._shieldRegenFlat;
    if (g._armorPierce) c._armorPierce = g._armorPierce;
    if (g._healOnKillChance) { c._healOnKillChance = g._healOnKillChance; c._healOnKillAmount = g._healOnKillAmount; }

    // Apply Aliencore mode effects
    if (this.aliencoreMode) {
      for (const e of this.combat.state.enemies) {
        e.speed *= 2;    // 2x speed
        e.damage *= 2;   // 2x damage
        if (e.isBoss) {
          e.hp *= 2;     // Boss HP +100%
          e.maxHp *= 2;
        }
      }
    }

    // Pacto Sombrio: max-HP penalty while equipped (delta-tracked so buying
    // or selling the item adjusts cleanly between waves)
    let hpPenalty = 0;
    for (const it of this.backpack.getAllItems()) {
      hpPenalty += ((it.state as any).maxHpPenalty ?? 0);
    }
    const prevPenalty = (this as any)._appliedHpPenalty ?? 0;
    if (hpPenalty !== prevPenalty) {
      this.combat.state.playerMaxHp = Math.max(10, this.combat.state.playerMaxHp - (hpPenalty - prevPenalty));
      this.combat.state.playerHp = Math.min(this.combat.state.playerHp, this.combat.state.playerMaxHp);
      (this as any)._appliedHpPenalty = hpPenalty;
    }

    // Surto de Crescimento (Rômulo): self-inflicted enemy HP penalty from the card
    const enemyHpBonus = (this as any)._enemyHpBonus ?? 0;
    if (enemyHpBonus > 0) {
      for (const e of this.combat.state.enemies) {
        e.hp = Math.floor(e.hp * (1 + enemyHpBonus));
        e.maxHp = Math.floor(e.maxHp * (1 + enemyHpBonus));
      }
    }

    // Apply difficulty modifiers
    const diff = getDifficultyById(this.currentDifficulty);
    for (const e of this.combat.state.enemies) {
      e.hp = Math.floor(e.hp * diff.enemyHpMult);
      e.maxHp = Math.floor(e.maxHp * diff.enemyHpMult);
      e.damage = Math.floor(e.damage * diff.enemyDamageMult);
      e.speed *= diff.enemySpeedMult;
      e.baseSpeed *= diff.enemySpeedMult;
    }
    // Difficulty: extra enemies (Veterano+ promise bigger waves, but nothing
    // ever read extraEnemyPct — clone existing enemies the same way the
    // Twitch curse does)
    if (diff.extraEnemyPct > 0 && this.combat.state.enemies.length > 0) {
      const extraCount = Math.ceil(this.combat.state.enemies.length * (diff.extraEnemyPct / 100));
      for (let i = 0; i < extraCount; i++) {
        const template = this.combat.state.enemies[i % this.combat.state.enemies.length];
        this.combat.state.enemies.push({
          ...template,
          id: `diff_enemy_${Date.now()}_${i}`,
          x: 80 + Math.random() * 1120,
          y: -50 - Math.random() * 250,
        });
      }
      this.combat.state.totalEnemies = this.combat.state.enemies.length;
    }

    // Apply Twitch curse (more enemies)
    if (this.twitch.curseNextWave) {
      const extraCount = Math.floor(this.combat.state.enemies.length * 0.3);
      // Clone some existing enemies
      for (let i = 0; i < extraCount; i++) {
        const template = this.combat.state.enemies[i % this.combat.state.enemies.length];
        if (template) {
          this.combat.state.enemies.push({
            ...template,
            id: `twitch_enemy_${Date.now()}_${i}`,
            x: 80 + Math.random() * 600,
            y: -50 - Math.random() * 200,
          });
        }
      }
      this.combat.state.totalEnemies = this.combat.state.enemies.length;
      this.twitch.curseNextWave = false;
    }

    // First month tutorial: only 4 scouts, very slow
    if (this.totalMonths === 1) {
      this.combat.state.enemies = this.combat.state.enemies.slice(0, 4);
      for (const e of this.combat.state.enemies) {
        e.speed = Math.max(15, e.speed * 0.4);
      }
      this.combat.state.totalEnemies = this.combat.state.enemies.length;
    }

    this.updateActiveSynergies();

    // Unlock time-locked codex entries
    this.codex.checkTimelocks(this.totalMonths);

    // Dismiss controls overlay on first combat
    if (this.showControlsOverlay) {
      this.dismissControlsOverlay();
    }
  }

  endCombat(): void {
    // Reset skill cooldowns between waves
    for (const skill of this.skills) {
      skill.cooldownRemaining = 0;
      skill.activeTimer = 0;
    }

    // Collect gold from combat (aliencore gives +50% gold)
    const goldMultiplier = this.aliencoreMode ? 1.5 : 1;
    // Perfect Wave: +50% gold if no damage taken
    const perfectBonus = this.combat.state.damageTakenThisWave === 0 ? 1.5 : 1.0;
    // Cards: Sorte Grande / Mercador Fantasma / Magnetismo Dourado stack additively
    const cardGoldBonus = 1 + ((this as any)._goldBonus ?? 0);
    // Relic: Cristal de Criox (+10% gold, permanent meta-progression)
    const relicGoldBonus = 1 + (getRelicBonuses().goldPercent ?? 0) / 100;
    // Difficulty: harder settings promise more gold (Veterano +20% .. Extinção +150%)
    const difficultyGoldMult = getDifficultyById(this.currentDifficulty).goldMult;
    // Shop visits dropped from every month to ~every 3rd (MONTH_SCHEDULE) —
    // per-wave income is cut to match, so total gold earned over a run is
    // genuinely lower (not just "the same money, less often to spend it").
    // A single scale point here covers every gold source above, since they
    // all funnel through combat.state.gold before this line.
    this.lastWaveGold = Math.min(
      Math.floor(this.combat.state.gold * GameManager.GOLD_ECONOMY_SCALE
        * goldMultiplier * perfectBonus * cardGoldBonus * relicGoldBonus * difficultyGoldMult),
      GameManager.waveGoldCap(this.totalMonths),
    );
    this.gold += this.lastWaveGold;

    // Track stats
    this.currentWaveKills = this.combat.state.totalEnemies - this.combat.state.enemies.length;
    this.stats.enemiesKilled += this.currentWaveKills;
    this.stats.damageDealt += this.combat.state.score;

    // Record kills in codex for lore unlocks
    for (const defId of this.combat.state.killedEnemyIds) {
      this.codex.recordKill(defId);
    }

    this.combat.state.gold = 0;

    // Check character unlocks before game over check
    this.checkCharacterUnlocks();

    // Per-wave global stats — runs for EVERY wave including the fatal one,
    // so nothing is double-counted at game over and boss kills from every
    // wave (not just the last) reach achievements/missions.
    updateGlobalStats({
      totalKills: this.currentWaveKills,
      totalGoldEarned: this.lastWaveGold,
      bossesKilled: this.combat.state.killedEnemyIds.filter(id => id.startsWith('boss_')).length,
      maxCombo: (this.combat.state as any).maxCombo || 0,
    });

    if (this.combat.state.playerHp <= 0) {
      // Save best run
      if (this.totalMonths > this.bestRun) {
        this.bestRun = this.totalMonths;
        localStorage.setItem('packinvaders_best_run', String(this.totalMonths));
      }

      if (this.isDailyChallenge && this.totalMonths > this.dailyBest) {
        this.dailyBest = this.totalMonths;
        setDailyBest(this.dailyDateKey, this.totalMonths);
      }

      // Unlock next difficulty at month 48
      if (this.totalMonths >= 48) {
        const unlocked = unlockNextDifficulty(this.currentDifficulty);
        if (unlocked) this.newlyUnlockedDifficulty = unlocked;
      }

      // Add to leaderboard
      addToLeaderboard({
        characterId: this.characterId,
        months: this.totalMonths,
        score: this.combat.state.score,
        kills: this.stats.enemiesKilled,
        difficulty: this.currentDifficulty,
        date: new Date().toLocaleDateString('pt-BR'),
      });

      this.phase = 'GAME_OVER';
      this.updateAchievementStats();
      return;
    }

    // Check for month 48 milestone: unlock survival/aliencore
    if (this.totalMonths === 48 && !this.aliencoreUnlocked) {
      this.aliencoreUnlocked = true;
      this.showSurvivalMessage = true;
      this.survivalMessageTimer = 4.0;
      SaveManager.markAliencoreUnlocked();
    }

    // If Twitch connected, start vote between waves
    if (this.twitch.connected) {
      this.startTwitchVote();
      return;
    }

    // Juros: reward banking gold between waves (capped so it doesn't snowball).
    // Creates a real spend-vs-save decision at the shop.
    // Investimento Sábio card raises both the rate and the cap together.
    const interestMult = (this as any)._interestBonusMult ?? 1;
    this.lastInterest = Math.min(Math.floor(20 * interestMult), Math.floor(this.gold * 0.08 * interestMult));
    this.gold += this.lastInterest;

    // No victory condition — endless roguelike until death
    // Auto-save after each wave
    this.autoSave();

    // 20% chance of finding a collectible
    this.pendingCollectible = null;
    if (Math.random() < 0.2) {
      const col = getRandomCollectible(this.unlockedCharIds, this.codex.getUnlockedIdsByCategory('collectible'));
      if (col) {
        this.pendingCollectible = col;
        this.codex.unlockEntry(col.id);
        this.stats.codexUnlockedThisRun.push(col.name);
      }
    }

    // Boss kill = relic drop: the boss's own signature relic first,
    // falling back to a random uncollected one
    this.pendingRelic = null;
    const killedBossId = this.combat.state.killedEnemyIds.find(id => id.startsWith('boss_'));
    if (killedBossId) {
      const newRelic = getRelicForBoss(killedBossId) ?? getRandomNewRelic();
      if (newRelic) {
        this.pendingRelic = newRelic;
        addRelic(newRelic.id);
      }
    }

    // Mid-run achievement check (stats already updated above, pre-game-over)
    const newAchs = checkAchievements();
    if (newAchs.length > 0) {
      this.newAchievements.push(...newAchs);
    }

    // Card selection only on scheduled months (skipped on the regular boss
    // months 3/6/9 and the shop-only stop at 11 — see MONTH_SCHEDULE). On a
    // skipped month go straight to goToShop()'s own gate instead, same as
    // skipCards() would, but with no gold bonus since the player didn't
    // choose to skip anything.
    if (this.hasCardsThisMonth()) {
      this.cardChoices = this.generateCardChoices();
      this.phase = 'CARDS';
    } else {
      // No CARDS screen this month to show the collectible/relic toast on —
      // every card-skipped month has a shop (see MONTH_SCHEDULE), so keep
      // pendingCollectible/pendingRelic alive and let the shop screen render
      // them instead of silently dropping the notification.
      this.cardChoices = [];
      this.goToShop();
    }
  }

  selectCard(index: number): void {
    if (index >= 0 && index < this.cardChoices.length) {
      this.cardChoices[index].apply(this);
    }
    this.pendingCollectible = null;
    this.goToShop();
  }

  skipCards(): void {
    this.pendingCollectible = null;
    this.pendingRelic = null;
    this.gold += 15; // Skip bonus
    this.goToShop();
  }

  /** Go to shop (or skip if it's not a shop month, vendor ghost chance
   * triggers, or a "Febre do Ouro"-style no-shop-waves card is active) */
  private goToShop(): void {
    // Shop cadence: only scheduled months (3/6/9/11/12, plus the very first
    // month of a fresh run) offer a shop at all — see MONTH_SCHEDULE.
    if (!this.hasShopThisMonth()) {
      this.phase = 'INVENTORY';
      this.updateActiveSynergies();
      return;
    }

    // Febre do Ouro: skip shop for N waves
    if ((this as any)._noShopWaves && (this as any)._noShopWaves > 0) {
      (this as any)._noShopWaves--;
      this.phase = 'INVENTORY';
      this.updateActiveSynergies();
      return;
    }

    const skipChance = (this as any)._vendorSkipChance ?? 0;
    if (skipChance > 0 && Math.random() < skipChance) {
      // Vendor doesn't appear — skip directly to inventory
      this.phase = 'INVENTORY';
      this.updateActiveSynergies();
    } else {
      this.phase = 'SHOP';
    }
  }

  exitShop(): void {
    this.currentVendor = null; // Reset for next shop visit
    this.pendingCollectible = null;
    this.pendingRelic = null;
    this.updateActiveSynergies();
    this.phase = 'INVENTORY';
  }

  openCodex(): void {
    this.previousPhase = this.phase;
    this.phase = 'CODEX';
  }

  closeCodex(): void {
    this.phase = this.previousPhase;
  }

  openSettings(fromPhase?: GamePhase): void {
    this.previousPhase = fromPhase ?? this.phase;
    this.phase = 'SETTINGS';
  }

  closeSettings(): void {
    this.phase = this.previousPhase;
  }

  versusEngine: VersusEngine | null = null;

  enterExtraModes(): void {
    this.phase = 'EXTRA_MODES';
  }

  enterCoop(): void {
    this.startCombat();
    this.phase = 'COOP';
    this.combat.activateCoopP2(this.characterId);
  }

  enterVersusShips(): void {
    this.versusEngine = new VersusEngine('ships');
    this.phase = 'VERSUS_SHIPS';
  }

  enterVersusPvp(): void {
    this.versusEngine = new VersusEngine('pvp');
    this.phase = 'VERSUS_PVP';
  }

  /** Start today's Daily Challenge: a fixed character + Year Anomaly shared by
   * everyone who plays today, regardless of character-unlock progress. */
  startDailyChallenge(): void {
    const daily = getDailyChallenge();
    this.dailyDateKey = daily.dateKey;
    this.dailyBest = getDailyBest(daily.dateKey);
    this.currentDifficulty = 'soldier';
    this.initGame(daily.characterId);
    this.isDailyChallenge = true;
    this.currentAnomaly = YEAR_ANOMALIES[daily.anomalyIndex];
    this.anomalyYear = 1; // pinned for the whole run; see startCombat's anomaly block
    this.updateActiveSynergies();
    this.phase = 'INVENTORY';
  }

  tickVersus(dt: number): void {
    this.versusEngine?.tick(dt);
  }

  // ─── Shop ─────────────────────────────────────────────────────────────────

  getShopItems(): ItemDefinition[] {
    // Pick a vendor if we don't have one yet for this shop visit
    if (!this.currentVendor) {
      this.currentVendor = pickRandomVendor(this.unlockedCharIds);
      this.vendorGreeting = getVendorGreeting(this.currentVendor);
    }

    // Get items from the current vendor's pool
    const vendorItemIds = new Set(this.currentVendor.exclusiveItems);
    const available = ALL_ITEMS.filter(i => i.cost > 0 && vendorItemIds.has(i.id));

    // Pedra da Sorte: bias the shuffle toward rarer items
    let luckBonus = 0;
    let extraItemSlots = 0;
    for (const it of this.backpack.getAllItems()) {
      luckBonus += ((it.state as any).shopRarityBonus ?? 0);
      extraItemSlots += ((it.state as any).extraShopItem ?? 0); // Insígnia de Mercador
    }
    const shuffled = [...available].sort(() =>
      Math.random() - 0.5
    ).sort((a, b) =>
      // Stable-ish rarity nudge: each luck point gives rare items a head start
      luckBonus > 0 ? (Math.random() - luckBonus * b.rarity * 0.15) - (Math.random() - luckBonus * a.rarity * 0.15) : 0
    );

    // Character shop size: Diana sees 3 items, Dr. Eon sees 4 (their disadvantages)
    let shopSize = this.characterId === 'beast_tamer' ? 3
      : this.characterId === 'void_walker' ? 4 : 5;
    shopSize += extraItemSlots;
    // Novo Estoque card: next shop only gets extra slots, consumed on use
    const extraSlots = (this as any)._extraShopSlots ?? 0;
    if (extraSlots > 0) {
      shopSize += extraSlots;
      (this as any)._extraShopSlots = 0;
    }
    return shuffled.slice(0, shopSize);
  }

  /** Final shop price after card discounts and character affinities */
  getItemCost(itemDef: ItemDefinition): number {
    let discount = (this as any)._shopDiscount ?? 0;
    // Zabel (scrapper): Olho de Lixão — everything is cheaper for her
    if (this.characterId === 'scrapper') discount += 0.2;
    // Relic: Planta do Arquiteto — permanent shop discount
    discount += (getRelicBonuses().shopDiscountPercent ?? 0) / 100;
    // Insígnia de Mercador: item-based shop discount
    for (const it of this.backpack.getAllItems()) {
      discount += ((it.state as any).shopDiscount ?? 0);
    }
    let cost = itemDef.cost * (1 - Math.min(0.6, discount));
    // Rômulo: organic items -20%
    if (this.characterId === 'grass_man' && itemDef.tags.includes('Orgânico')) cost *= 0.8;
    return Math.floor(cost);
  }

  /** Sell rate (Reciclador de Sucata raises the base 50%) */
  getSellRate(): number {
    // Zabel (scrapper): selling is her whole business — 75% back
    let rate = this.characterId === 'scrapper' ? 0.75 : 0.5;
    for (const it of this.backpack.getAllItems()) {
      const b = (it.state as any).sellBonus ?? 0;
      if (b) rate = Math.max(rate, 0.5 + b);
    }
    // Faro de Comerciante card
    rate += (this as any)._sellBonusGlobal ?? 0;
    return Math.min(0.8, rate);
  }

  buyItem(itemDef: ItemDefinition): boolean {
    const finalCost = this.getItemCost(itemDef);
    if (this.gold < finalCost) return false;
    this.gold -= finalCost;
    this.stats.itemsBought++;
    return true; // Item needs to be placed by the player
  }

  /** Sell an item (base 50%; Reciclador de Sucata raises to 75%) */
  sellItem(itemDef: ItemDefinition): number {
    const sellPrice = Math.floor(itemDef.cost * this.getSellRate());
    this.gold += sellPrice;
    return sellPrice;
  }

  /** Reroll shop items (costs gold) */
  rerollShop(): boolean {
    const cost = this.getRerollCost();
    if (this.gold < cost) return false;
    this.gold -= cost;
    // Force new vendor selection on next getShopItems call
    this.currentVendor = null;
    return true;
  }

  /** Get reroll cost */
  getRerollCost(): number {
    let cost = 10 + this.totalMonths * 2; // Gets more expensive over time
    // Estoque Rotativo card
    cost = Math.floor(cost * (1 - ((this as any)._rerollDiscount ?? 0)));
    // Zabel (scrapper): rummaging through stock is half price
    return this.characterId === 'scrapper' ? Math.floor(cost / 2) : cost;
  }

  // ─── Card Generation ──────────────────────────────────────────────────────

  generateCardChoices(): CardChoice[] {
    const cards = pickRandomCards(this.characterId, 3);
    return cards.map(c => ({
      id: c.id,
      name: c.name,
      description: c.description,
      apply: c.apply,
    }));
  }

  // ─── Skills ─────────────────────────────────────────────────────────────────

  /** Activate a skill by slot index (0, 1, 2) */
  useSkill(slotIdx: number): boolean {
    if (slotIdx < 0 || slotIdx >= this.skills.length) return false;
    const skill = this.skills[slotIdx];
    if (skill.cooldownRemaining > 0) return false;

    // Activate
    skill.cooldownRemaining = skill.definition.cooldown;
    skill.activeTimer = skill.definition.duration;
    skill.usesThisRun++;
    const powerMult = getSkillPowerMult(skill);

    const ctx: SkillContext = {
      arenaWidth: this.combat.arenaWidth,
      arenaHeight: this.combat.arenaHeight,
      spawnBurst: (count, damage, speed, _color, homing) => {
        for (let i = 0; i < count; i++) {
          const angle = (i / count) * Math.PI * 2;
          this.combat.state.projectiles.push({
            id: `skill_proj_${Date.now()}_${i}`,
            x: this.combat.state.playerX,
            y: this.combat.arenaHeight - 50,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            damage,
            piercing: 1,
            aoeRadius: 10,
            tags: homing ? ['Guiado'] : [],
            alive: true,
            trail: [],
          });
        }
      },
      damageArea: (x, y, radius, damage) => {
        const scaledDmg = damage * powerMult;
        const killed: Enemy[] = [];
        for (const e of this.combat.state.enemies) {
          const dx = e.x - x;
          const dy = e.y - y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < radius) {
            const dmg = Math.floor(scaledDmg * (1 - dist / radius * 0.5));
            e.hp -= dmg;
            this.combat.state.damageDealtThisSecond += dmg;
            this.combat.state.score += dmg;
            if (e.hp <= 0) killed.push(e);
          }
        }
        // Route through the real kill pipeline: combo, gold scaling, power-up
        // drops, elite affixes, boss fanfare, and every card mechanic that
        // hooks killEnemy (Reanimação, Necrose, Curto-Circuito, etc.)
        for (const e of killed) {
          this.combat.killEnemyExternal(e);
        }
      },
      heal: (amount) => {
        this.combat.state.playerHp = Math.min(
          this.combat.state.playerMaxHp,
          this.combat.state.playerHp + Math.floor(amount * powerMult)
        );
      },
      slowAll: (amount, duration) => {
        for (const e of this.combat.state.enemies) {
          e.slowAmount = amount;
          e.slowTimer = duration;
        }
      },
      pushEnemies: (x, y, force) => {
        for (const e of this.combat.state.enemies) {
          const dx = e.x - x;
          const dy = e.y - y;
          const dist = Math.max(1, Math.sqrt(dx * dx + dy * dy));
          const pushMult = force > 0 ? 1 : -1;
          e.x += (dx / dist) * Math.abs(force) * pushMult * 0.3;
          e.y += (dy / dist) * Math.abs(force) * pushMult * 0.3;
          e.y = Math.max(-100, e.y); // Don't push above spawn area
        }
      },
      reanimateStrongest: () => this.combat.reanimateStrongestKill(),
    };

    skill.definition.activate(this.combat.state, ctx);
    this.combat.triggerShake(4, 0.2);
    this.stats.skillsUsed++;
    return true;
  }

  /** Update skill cooldowns (called every combat tick) */
  updateSkills(dt: number): void {
    // Apply wave event continuous effects
    if (this.currentWaveEvent) {
      switch (this.currentWaveEvent.id) {
        case 'heal_wave':
          this.combat.state.playerHp = Math.min(this.combat.state.playerMaxHp, this.combat.state.playerHp + 5 * dt);
          break;
        case 'double_combo':
          if (this.combat.state.comboTimer > 0) this.combat.state.comboTimer += dt * 0.5; // Extends combo
          break;
        case 'crit_wave':
          (this.combat as any)._waveEventCritBonus = 0.3;
          break;
        case 'no_shield':
          this.combat.state.playerShield = 0;
          break;
        case 'meteor_rain': {
          // Falling rocks the player must dodge
          (this as any)._meteorTimer = ((this as any)._meteorTimer ?? 0) + dt;
          if ((this as any)._meteorTimer >= 1.1) {
            (this as any)._meteorTimer = 0;
            this.combat.state.enemyProjectiles.push({
              id: `meteor_${Date.now()}`,
              x: 40 + Math.random() * (this.combat.arenaWidth - 80),
              y: -10,
              vx: (Math.random() - 0.5) * 40,
              vy: 240 + Math.random() * 80,
              damage: 8 + Math.floor(this.totalMonths * 0.4),
              alive: true,
            });
          }
          break;
        }
      }
    } else {
      (this.combat as any)._waveEventCritBonus = 0;
    }

    // Check combo skill reset flag
    if ((this.combat.state as any)._comboSkillReset) {
      for (const skill of this.skills) {
        skill.cooldownRemaining = 0;
      }
      (this.combat.state as any)._comboSkillReset = false;
    }

    for (const skill of this.skills) {
      if (skill.cooldownRemaining > 0) {
        skill.cooldownRemaining = Math.max(0, skill.cooldownRemaining - dt);
      }
      if (skill.activeTimer > 0) {
        skill.activeTimer = Math.max(0, skill.activeTimer - dt);
      }
    }

    // Set skill multipliers on combat engine + relic bonuses
    const relicBonus = getRelicBonuses();
    let dmgMult = 1 + (relicBonus.damagePercent ?? 0) / 100;
    let rateMult = 1 + (relicBonus.fireRatePercent ?? 0) / 100;
    if (this.isSkillActive('self_ignite')) dmgMult *= 2.0;
    if (this.isSkillActive('overclock')) rateMult *= 3.0;
    (this.combat as any)._skillDamageMult = dmgMult;
    (this.combat as any)._skillFireRateMult = rateMult;
    // Relic combat bonuses (crit/dodge/damage reduction/pickup radius)
    (this.combat as any)._relicCrit = (relicBonus.critPercent ?? 0) / 100;
    (this.combat as any)._relicDodge = (relicBonus.dodgePercent ?? 0) / 100;
    (this.combat as any)._relicDR = (relicBonus.damageReductionPercent ?? 0) / 100;
    (this.combat as any)._relicPickup = (relicBonus.pickupRadiusPercent ?? 0) / 100;
    // Frenzy is pet-specific ("Pets atacam 3x mais rápido") — scoped inside
    // fireWeapons() by tag instead of the global multiplier above.
    (this.combat as any)._frenzyActive = this.isSkillActive('frenzy');

    // Relic: heal per second
    if (relicBonus.healPerSecond) {
      this.combat.state.playerHp = Math.min(
        this.combat.state.playerMaxHp,
        this.combat.state.playerHp + relicBonus.healPerSecond * dt
      );
    }
    // Sétimo (renegade): Biologia Xeno — constant regeneration in place of a shield
    if (this.characterId === 'renegade' && this.combat.state.playerHp > 0) {
      this.combat.state.playerHp = Math.min(
        this.combat.state.playerMaxHp,
        this.combat.state.playerHp + 1.5 * dt
      );
    }
    // Relic: skill cooldown reduction
    if (relicBonus.skillCooldownReduction) {
      for (const skill of this.skills) {
        if (skill.cooldownRemaining > 0) {
          skill.cooldownRemaining -= dt * (relicBonus.skillCooldownReduction / 100);
        }
      }
    }

    // Phase shift: make player invulnerable
    if (this.isSkillActive('phase_shift')) {
      // Restore any damage taken this frame (crude but effective)
      (this.combat as any)._phaseShiftActive = true;
    } else {
      (this.combat as any)._phaseShiftActive = false;
    }

    // Apply active skill effects
    for (const skill of this.skills) {
      if (skill.activeTimer <= 0) continue;
      switch (skill.definition.id) {
        case 'thorn_shield':
        case 'rescue_shield':
          // Block incoming enemy projectiles near player
          this.combat.state.enemyProjectiles = this.combat.state.enemyProjectiles.filter(p => {
            const dx = p.x - this.combat.state.playerX;
            const dy = p.y - (this.combat.arenaHeight - 40);
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 60) { p.alive = false; return false; }
            return true;
          });
          break;
        case 'whirlpool': {
          // Pull enemies toward center continuously
          const whirlKilled: Enemy[] = [];
          for (const e of this.combat.state.enemies) {
            const cx = this.combat.arenaWidth / 2;
            const cy = this.combat.arenaHeight / 2;
            const dx = cx - e.x;
            const dy = cy - e.y;
            const dist = Math.max(1, Math.sqrt(dx * dx + dy * dy));
            e.x += (dx / dist) * 80 * dt;
            e.y += (dy / dist) * 80 * dt;
            e.hp -= 3 * dt;
            if (e.hp <= 0) whirlKilled.push(e);
          }
          // Route through the real kill pipeline (combo, drops, card mechanics)
          for (const e of whirlKilled) this.combat.killEnemyExternal(e);
          break;
        }
        case 'photosynthesis_active':
          // Heal over time (40 HP / 5s = 8 HP/s)
          this.combat.state.playerHp = Math.min(
            this.combat.state.playerMaxHp,
            this.combat.state.playerHp + 8 * dt
          );
          break;
        case 'healing_rain':
          // Additional slow enforcement
          for (const e of this.combat.state.enemies) {
            if (!e.slowAmount || e.slowAmount > 0.4) {
              e.slowAmount = 0.4;
              e.slowTimer = 1;
            }
          }
          break;
      }
    }
  }

  /** Check if a specific skill is active (for combat engine to query) */
  isSkillActive(skillId: string): boolean {
    return this.skills.some(s => s.definition.id === skillId && s.activeTimer > 0);
  }

  // ─── Potions ───────────────────────────────────────────────────────────────

  /** Buy a potion (max 3 total slots) */
  buyPotion(potionId: string): boolean {
    const def = POTIONS.find(p => p.id === potionId);
    if (!def || this.gold < def.cost) return false;
    const existing = this.potions.find(p => p.def.id === potionId);
    if (existing) {
      if (existing.count >= 3) return false;
      this.gold -= def.cost;
      existing.count++;
      return true;
    }
    if (this.potions.length >= 3) return false;
    this.gold -= def.cost;
    this.potions.push({ def, count: 1 });
    return true;
  }

  /** Use a potion by slot index */
  usePotion(slotIdx: number): boolean {
    if (slotIdx < 0 || slotIdx >= this.potions.length) return false;
    const slot = this.potions[slotIdx];
    if (slot.count <= 0) return false;
    slot.def.effect(this);
    slot.count--;
    if (slot.count <= 0) {
      this.potions.splice(slotIdx, 1);
    }
    this.combat.triggerShake(3, 0.15);
    return true;
  }

  // ─── Synergies ────────────────────────────────────────────────────────────

  private updateActiveSynergies(): void {
    const items = this.backpack.getAllItems();
    const tagCounts = new Map<string, number>();
    for (const item of items) {
      for (const tag of item.definition.tags) {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      }
    }
    // Show tags with 2+ items
    this.activeSynergies = Array.from(tagCounts.entries())
      .filter(([_, count]) => count >= 2)
      .map(([tag, count]) => `${tag} x${count}`);
  }

  // ─── Twitch Integration ─────────────────────────────────────────────────

  /** Process pending Twitch events during combat */
  processTwitchEvents(): void {
    if (!this.twitch.connected) return;

    // Update timers
    this.twitch.update(0); // dt handled externally

    const event = this.twitch.getNextEvent();
    if (!event) return;

    this.applyTwitchEvent(event);
  }

  private applyTwitchEvent(event: TwitchEvent): void {
    const notifColor = '#a78bfa';

    switch (event.type) {
      case 'help': {
        // Spawn health pack: +20 HP
        const heal = 20;
        this.combat.state.playerHp = Math.min(
          this.combat.state.playerMaxHp,
          this.combat.state.playerHp + heal
        );
        this.twitch.addNotification(`${event.username}: !help — +${heal} HP!`, '#4ade80');
        break;
      }
      case 'curse': {
        // Next wave has +30% more enemies
        this.twitch.curseNextWave = true;
        this.twitch.addNotification(`${event.username}: !curse — Mais inimigos na próxima wave!`, '#ef4444');
        break;
      }
      case 'gold': {
        // +10 gold
        this.gold += 10;
        this.twitch.addNotification(`${event.username}: !gold — +10 Gold!`, '#fbbf24');
        break;
      }
      case 'boss': {
        // Force mini-boss next wave
        this.twitch.bossNextWave = true;
        this.twitch.addNotification(`${event.username}: !boss — Boss na próxima wave!`, '#f97316');
        break;
      }
      case 'speed': {
        // Enemies 50% faster for 15s
        this.twitch.applySpeedEffect(1.5, 15);
        this.twitch.addNotification(`${event.username}: !speed — Inimigos mais rápidos!`, '#ef4444');
        break;
      }
      case 'slow': {
        // Enemies 50% slower for 15s
        this.twitch.applySpeedEffect(0.5, 15);
        this.twitch.addNotification(`${event.username}: !slow — Inimigos mais lentos!`, '#67e8f9');
        break;
      }
      case 'shield': {
        // Temporary shield (absorbs 1 hit)
        this.twitch.shieldActive = true;
        this.twitch.addNotification(`${event.username}: !shield — Escudo ativado!`, '#6366f1');
        break;
      }
      case 'chaos': {
        // Random effect
        const effects: TwitchEvent['type'][] = ['help', 'curse', 'gold', 'boss', 'speed', 'slow', 'shield'];
        const randomType = effects[Math.floor(Math.random() * effects.length)];
        this.twitch.addNotification(`${event.username}: !chaos — Efeito aleatório!`, notifColor);
        this.applyTwitchEvent({ ...event, type: randomType });
        break;
      }
    }
  }

  /** Start a Twitch vote between waves */
  startTwitchVote(): void {
    if (!this.twitch.connected) return;
    this.twitch.startVote(['A', 'B', 'C']);
    this.phase = 'TWITCH_VOTE';
  }

  /** Apply Twitch vote result */
  applyTwitchVoteResult(winner: string): void {
    switch (winner) {
      case 'A':
        this.gold += 20;
        this.twitch.addNotification('Chat escolheu: +20 Gold!', '#fbbf24');
        break;
      case 'B':
        this.combat.state.playerHp = Math.min(
          this.combat.state.playerMaxHp,
          this.combat.state.playerHp + 30
        );
        this.twitch.addNotification('Chat escolheu: Heal 30 HP!', '#4ade80');
        break;
      case 'C':
        this.gold += 100;
        this.twitch.curseNextWave = true;
        this.twitch.addNotification('Chat escolheu: +100 Gold, inimigos +50%!', '#f97316');
        break;
    }
  }

  /** Dismiss controls overlay */
  dismissControlsOverlay(): void {
    this.showControlsOverlay = false;
    localStorage.setItem('packinvaders_played_before', '1');
  }

  /** Check if items have synergy with backpack contents */
  getItemSynergies(item: ItemDefinition): string[] {
    const backpackItems = this.backpack.getAllItems();
    const backpackTags = new Set<string>();
    for (const placed of backpackItems) {
      for (const tag of placed.definition.tags) {
        backpackTags.add(tag);
      }
    }
    return item.tags.filter(t => backpackTags.has(t));
  }

  // ─── Character Unlock System ──────────────────────────────────────────────

  /** Check if a character's unlock condition was met this run */
  checkCharacterUnlocks(): void {
    // fire_lord: Reach wave 10 (month 10) with grass_man
    if (this.characterId === 'grass_man' && this.totalMonths >= 10) {
      this.unlockCharacter('fire_lord');
    }
    // aqua_sage: Kill boss_hydra (tracked via codex kills)
    if (this.codex.getKillCount('boss_hydra') > 0) {
      this.unlockCharacter('aqua_sage');
    }
    // storm_runner: Kill 50 enemies in one wave
    if (this.currentWaveKills >= 50) {
      this.unlockCharacter('storm_runner');
    }
    // void_walker: Win a wave with less than 20 HP
    if (this.combat.state.waveCleared && this.combat.state.playerHp < 20 && this.combat.state.playerHp > 0) {
      this.unlockCharacter('void_walker');
    }
    // beast_tamer: Have 4+ pets in backpack
    const petCount = this.backpack.getAllItems().filter(i => i.definition.tags.includes('Pet')).length;
    if (petCount >= 4) {
      this.unlockCharacter('beast_tamer');
    }
    // firefighter: Clear a wave taking zero damage (a perfect, fully-defended wave)
    if (this.combat.state.waveCleared && this.combat.state.damageTakenThisWave === 0 && this.totalMonths >= 5) {
      this.unlockCharacter('firefighter');
    }
    // scrapper: Hold 500 gold at once — think like a merchant
    if (this.gold + this.combat.state.gold >= 500) {
      this.unlockCharacter('scrapper');
    }
    // renegade: Reach Year 4 (month 37) — the year Sétimo surrendered
    if (this.totalMonths >= 37) {
      this.unlockCharacter('renegade');
    }
  }

  /** Unlock a character and persist to localStorage */
  unlockCharacter(charId: string): void {
    if (this.unlockedCharIds.includes(charId)) return;
    this.unlockedCharIds.push(charId);
    localStorage.setItem('packinvaders_unlocked_chars', JSON.stringify(this.unlockedCharIds));
    // Track for notification
    const charDef = this.characters.find(c => c.id === charId);
    if (charDef) {
      this.newAchievements.push(`🔓 ${charDef.name} desbloqueado!`);
    }
  }

  /** Check if a character is unlocked */
  isCharacterUnlocked(charId: string): boolean {
    return this.unlockedCharIds.includes(charId);
  }

  /** Update global achievement stats at end of run */
  private updateAchievementStats(): void {
    // Kills/gold/bosses/combo are accumulated per wave in endCombat (before
    // the game-over branch), so only run-scoped stats are added here.
    updateGlobalStats({
      totalItemsBought: this.stats.itemsBought,
      totalMonthsSurvived: this.totalMonths,
      totalRuns: 1,
      charactersUnlocked: this.unlockedCharIds.length, // max-semantics
      collectiblesFound: this.stats.codexUnlockedThisRun.length,
    });
    this.newAchievements = checkAchievements();
  }

  /** Newly unlocked achievements (shown on game over screen) */
  newAchievements: string[] = [];
}
