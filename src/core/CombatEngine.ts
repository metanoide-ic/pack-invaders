/**
 * COMBAT ENGINE — Space Invaders loop.
 * Processa emissores da mochila, gerencia projéteis, inimigos, e colisões.
 * Now with: player movement, enemy projectiles, difficulty curve, combo system.
 */

import { BackpackGrid, CombatPower } from './BackpackGrid';
import { ProjectileData, PlacedItem, Tag } from './ItemSystem';
import { getEnemiesForWave, getBossForEncounter, getMegaBossForEncounter, REGULAR_BOSSES, MEGA_BOSSES, EnemyDefinition, ALL_ENEMIES } from '../data/enemies';

/**
 * Continuous accelerating growth curve, anchored to a known value at
 * `anchorMonths` (a year boundary). Used for year-2+ difficulty scaling
 * instead of independent per-year branch formulas, which reset at each
 * year boundary and create discontinuities: a formula like
 * `base + (year - 2) * K + monthInYear * rate` regresses at the start of
 * every new year whenever `rate * 12` (the previous year's total
 * within-year growth) exceeds `K` (the flat per-year step) — and can also
 * spike if the opposite happens. This grows the slope itself gradually
 * every year so the curve never resets, jumps, or dips at a boundary.
 */
export function continuousYearScale(totalMonths: number, anchorMonths: number, anchorValue: number, baseSlope: number, slopeAccel: number): number {
  const year = Math.ceil(totalMonths / 12);
  const monthInYear = ((totalMonths - 1) % 12) + 1;
  const startYear = anchorMonths / 12 + 1;
  const n = year - startYear; // full years elapsed since the anchor year began
  const fullYearsSum = n * baseSlope * 12 + slopeAccel * 12 * (n * (n - 1) / 2);
  const curSlope = baseSlope + n * slopeAccel;
  return anchorValue + fullYearsSum + curSlope * monthInYear;
}

/** Base enemy count for a given month, before anomaly multipliers. Shared with
 * GameManager.getNextWavePreview so the inventory preview never drifts from
 * what generateWave actually spawns. */
export function computeWaveCount(totalMonths: number): number {
  if (totalMonths <= 6) return 4 + totalMonths * 1.5;
  if (totalMonths <= 12) return 10 + (totalMonths - 6) * 2;
  return Math.min(80, continuousYearScale(totalMonths, 12, 22, 1.5, 0.5));
}

/**
 * Once a run cycles through the full boss roster once (see
 * getBossForEncounter), repeats get one of these instead of reappearing
 * identically — a long run (year 5+) should feel different each lap, not
 * just numerically bigger. The affix fields reuse the same elite-affix
 * behaviors already implemented for regular enemies (regen heal-over-time,
 * volatile death burst) rather than introducing new mechanics.
 */
interface BossMutation {
  suffix: string;
  hpMult: number;
  dmgMult: number;
  speedMult: number;
  extraArmor: number;
  affix?: 'regen' | 'volatile';
}
const BOSS_MUTATIONS: BossMutation[] = [
  { suffix: 'FURIOSO', hpMult: 1.0, dmgMult: 1.35, speedMult: 1.2, extraArmor: 0 },
  { suffix: 'BLINDADO', hpMult: 1.15, dmgMult: 1.0, speedMult: 1.0, extraArmor: 10 },
  { suffix: 'REGENERADOR', hpMult: 1.1, dmgMult: 1.0, speedMult: 1.0, extraArmor: 0, affix: 'regen' },
  { suffix: 'VOLÁTIL', hpMult: 0.9, dmgMult: 1.15, speedMult: 1.1, extraArmor: 0, affix: 'volatile' },
  { suffix: 'ANCESTRAL', hpMult: 1.3, dmgMult: 1.15, speedMult: 0.9, extraArmor: 5 },
];

// ─── Enemy ───────────────────────────────────────────────────────────────────

export interface Enemy {
  id: string;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  speed: number;
  damage: number;
  tags: Tag[];
  width: number;
  height: number;
  goldReward: number;
  /** Shooting cooldown timer */
  shootTimer: number;
  /** Enemy definition reference for specials */
  special?: EnemyDefinition['special'];
  /** Is this a boss? */
  isBoss: boolean;
  /** Slow effect timer (seconds remaining) */
  slowTimer?: number;
  /** Slow multiplier (0-1, lower = slower) */
  slowAmount?: number;
  /** Movement pattern from definition */
  movement: 'straight' | 'sine' | 'zigzag' | 'erratic' | 'charge' | 'strafe';
  /** Armor hits remaining (for 'armor' special) */
  armorHits?: number;
  /** Phase state: is the enemy currently phased (invulnerable) */
  phased?: boolean;
  /** Phase timer for toggling */
  phaseTimer?: number;
  /** Spawn timer for spawner enemies */
  spawnTimer?: number;
  /** Internal timer for movement calculations */
  moveTimer: number;
  /** Direction for zigzag/strafe movement: -1 or 1 */
  moveDir: number;
  /** Whether this enemy is charging at the player */
  charging?: boolean;
  /** Charge target X (locks onto player X when starting charge) */
  chargeTargetX?: number;
  /** Explode on death flag */
  explodeOnDeath?: boolean;
  /** Original speed (for reference after slow effects) */
  baseSpeed: number;
  /** Boss phase 2 already activated (prevents re-trigger) */
  boss2ndPhaseActive?: boolean;
  /** Definition ID for codex tracking */
  defId: string;
  /** Hit flash timer (brief white flash when taking damage) */
  hitFlash?: number;
  /** Copycat boss variant: this enemy is a mirror of the player's own
   * character/build, rendered with the player's own sprite (see Renderer). */
  isCopycat?: boolean;
}

// ─── Projectile (in-flight) ──────────────────────────────────────────────────

export interface Projectile {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  damage: number;
  piercing: number;  // how many enemies it can pass through
  aoeRadius: number;
  tags: Tag[];
  alive: boolean;
  /** Trail positions for visual effect */
  trail: { x: number; y: number }[];
  /** Backpack instanceId of the item that fired this shot (per-item hit effects) */
  ownerId?: string;
  /** Wall bounces remaining (Frank/storm_runner: electric shots ricochet once) */
  bounces?: number;
  /** Seconds of flight remaining before the shot fizzles out on its own,
   * regardless of whether it's left the arena (short-range weapons like the
   * flamethrower; undefined = flies until it hits something or exits, same
   * as every other weapon). */
  life?: number;
  /** Multi-Target Lock (splitOnHit): whether this shot has already split into
   * two on its first hit — prevents the split children (and re-hits from the
   * same piercing shot) from splitting again. */
  hasSplit?: boolean;
}

// ─── Enemy Projectile ────────────────────────────────────────────────────────

export interface EnemyProjectile {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  damage: number;
  alive: boolean;
  /** Number of wall bounces remaining (0 = no bounce) */
  bounces?: number;
  /** Bomb (Zepelim): explodes with area damage when it reaches the ground */
  bomb?: boolean;
  /** Tags of the enemy that fired this shot (drives which art/element the renderer picks) */
  tags?: readonly string[];
}

// ─── Asteroid (Vácuo Aberto phase variant) ────────────────────────────────────

export interface Asteroid {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  damage: number;
  rotation: number;
  rotSpeed: number;
}

// ─── Floating Text (damage numbers, gold) ────────────────────────────────────

export interface FloatingText {
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  maxLife: number;
}

// ─── Power-Up Drops ──────────────────────────────────────────────────────────

export type PowerUpType = 'heal' | 'gold' | 'shield' | 'rapid' | 'freeze' | 'nuke';

export interface PowerUp {
  id: string;
  x: number;
  y: number;
  type: PowerUpType;
  /** Seconds until despawn after landing */
  life: number;
}

/**
 * Ally turret — a small stationary friendly that fires at the nearest enemy.
 * One system backs three different card effects (reanimated corpse, drone,
 * mind-controlled captive) since they're all "temporary friendly damage
 * source" in spirit.
 */
export interface AllyTurret {
  id: string;
  x: number;
  y: number;
  /** Seconds remaining; Infinity = lasts until wave ends */
  life: number;
  damage: number;
  fireRate: number;
  timer: number;
  color: string;
}

// ─── Boss Beam (telegraphed laser column) ────────────────────────────────────

export interface BossBeam {
  /** Column center X */
  x: number;
  /** Column width in px */
  width: number;
  /** Telegraph seconds remaining — beam is harmless while > 0 */
  warnTime: number;
  /** Active seconds remaining once the telegraph ends */
  activeTime: number;
  /** Damage per second while the player stands in the column */
  dps: number;
}

/**
 * Boss attack archetypes. Every boss keeps its base movement/shooting, but
 * layers one signature attack on top so the 20 bosses stop feeling identical:
 * - dive: telegraphs, then crashes down at the player (heavy contact hit)
 * - barrage: periodic radial fan of projectiles
 * - beam: telegraphed vertical laser column at the player's position
 * - pull: gravity window that drags the player toward the boss
 */
type BossPattern = 'dive' | 'barrage' | 'beam' | 'pull';

const BOSS_PATTERNS: Record<string, BossPattern> = {
  boss_vulkra: 'dive', boss_devourer: 'dive', boss_drill_sergeant: 'dive',
  boss_terravox: 'dive', boss_titan_prime: 'dive',
  boss_hydra: 'barrage', boss_swarm_queen: 'barrage', boss_storm_king: 'barrage',
  boss_toxar: 'barrage', boss_epoch: 'barrage', boss_criox: 'barrage',
  boss_solyx: 'beam', boss_kepler_prime: 'beam', boss_architect: 'beam',
  boss_mechron: 'beam', boss_harbinger: 'beam',
  boss_voidmaw: 'pull', boss_abyssara: 'pull', boss_phantax: 'pull',
  boss_astral_serpent: 'pull',
};

// ─── Combat State ────────────────────────────────────────────────────────────

export interface CombatState {
  wave: number;
  enemies: Enemy[];
  projectiles: Projectile[];
  enemyProjectiles: EnemyProjectile[];
  playerHp: number;
  playerMaxHp: number;
  /** Shield that absorbs damage before HP. Regenerates 2/s after 3s no damage. */
  playerShield: number;
  playerMaxShield: number;
  /** Time since last damage taken (for shield regen delay) */
  shieldRegenDelay: number;
  playerX: number;
  gold: number;
  score: number;
  isActive: boolean;
  waveCleared: boolean;
  /** Combo system */
  combo: number;
  comboTimer: number;
  /** Total enemies this wave (for progress bar) */
  totalEnemies: number;
  /** Floating texts for damage numbers / gold popups */
  floatingTexts: FloatingText[];
  /** Wave timer */
  waveTime: number;
  /** DPS tracker */
  damageDealtThisSecond: number;
  dpsDisplay: number;
  dpsTimer: number;
  /** Score multiplier (rises with combos, drops on damage taken) */
  scoreMultiplier: number;
  /** Boss warning */
  bossWarningTimer: number;
  /** Hit-stop (freeze frame) */
  hitStopTimer: number;
  /** Screen shake */
  shakeIntensity: number;
  shakeDuration: number;
  shakeTimer: number;
  /** Player flash (damage taken) */
  playerFlashTimer: number;
  /** IDs of enemies killed this wave (for codex tracking) */
  killedEnemyIds: string[];
  /** Total damage taken this wave (for perfect wave bonus) */
  damageTakenThisWave: number;
  /** Timer for boss phase 2 transition flash effect */
  bossPhaseTransitionTimer: number;
  /** Timer for drain warning indicator */
  drainWarningTimer: number;
  /** Player movement slow timer (from slow_on_hit enemies) */
  playerSlowTimer: number;
  /** Power-up drops falling from killed enemies */
  powerUps: PowerUp[];
  /** Rapid-fire buff timer (2x fire rate while > 0) */
  rapidFireTimer: number;
  /** Friendly turrets (Reanimação, Enxame Morto, Controle Mental) */
  allyTurrets: AllyTurret[];
  /** Boss laser columns (beam pattern) */
  bossBeams: BossBeam[];
  /** Emergency shield already granted this wave (Escudo Regenerativo) */
  regenShieldUsed: boolean;
  // Co-op Player 2 state
  player2Active?: boolean;
  player2X?: number;
  player2Hp?: number;
  player2MaxHp?: number;
  player2DashCooldown?: number;
  player2DashVelocity?: number;

  // ─── Phase Variants ────────────────────────────────────────────────────
  /** Active normal-variant id for this wave (e.g. 'frostbite'), or null */
  normalVariant: string | null;
  /** Active boss-variant id for this wave (e.g. 'copycat'), or null */
  bossVariant: string | null;
  /** Frostbite: seconds the player has gone without moving/dashing */
  frostbiteTimer: number;
  /** Frostbite: threshold at which the cold burst fires and the timer resets */
  frostbiteMax: number;
  /** Copycat: true once the mirror is defeated and the survive-only finale is running */
  copycatAdrenalineActive: boolean;
  /** Copycat: seconds remaining in the Adrenaline finale */
  copycatAdrenalineTimer: number;
  /** Copycat: total Adrenaline duration this fight (for HUD progress) */
  copycatAdrenalineTotal: number;
  /** Copycat: accumulates time between Adrenaline projectile bursts */
  copycatAdrenalineBurstTimer: number;
  /** Vácuo Aberto: incoming asteroids — collision deals heavy damage */
  asteroids: Asteroid[];
}

// ─── Combat Engine ───────────────────────────────────────────────────────────

export class CombatEngine {
  state: CombatState;
  private backpack: BackpackGrid;
  private nextProjectileId = 0;
  private nextEnemyId = 0;
  private nextEnemyProjId = 0;
  private nextAllyId = 0;
  private nextAsteroidId = 0;
  /** Vácuo Aberto: seconds until the next asteroid spawns */
  private _spaceAsteroidTimer = 1.5;
  readonly arenaWidth = 1280;
  readonly arenaHeight = 720;
  private playerSpeed = 350;
  /** Dash cooldown */
  private dashCooldown = 0;
  private dashActive = 0;
  private playerVelocity2 = 0;
  /** Enxame Morto (Diana): kills toward the next drone spawn */
  private _droneKillCounter = 0;
  /** Strongest enemy killed so far this wave (for the Reanimar skill) */
  private _strongestKillThisWave: { x: number; y: number; damage: number; maxHp: number } | null = null;
  /** How many *regular* boss fights (months 3/6/9) have happened this run —
   * drives boss rotation (see getBossForEncounter) */
  private _bossEncounterCount = 0;
  /** How many *mega* boss fights (month 12) have happened this run — own
   * counter so its rotation/mutation-lap escalation is independent of the
   * regular boss pool's (see getMegaBossForEncounter) */
  private _megaBossEncounterCount = 0;
  /** Seconds remaining of shot-recoil, read by the renderer for the weapon-kick animation */
  recoilTimer = 0;
  /** Zyr-Goth's entrance cutscene: seconds remaining (0 = not playing).
   * While > 0 the whole combat sim freezes; the renderer plays the rise+roar. */
  bossCinematic = 0;
  /** Total length of the current cinematic (renderer derives progress from this) */
  bossCinematicTotal = 0;
  /** Fired once at the roar moment of a boss cinematic (main.ts hooks audio) */
  onBossRoar: (() => void) | null = null;
  /** Singularidade (Dr. Eon): seconds until the next black hole pulse */
  private _blackHoleTimer = 0;
  /** Singularidade: seconds remaining in an active pull burst */
  private _blackHoleActive = 0;
  /** Per-run revive flags (persist for the CombatEngine's lifetime, i.e. the whole run) */
  private _phoenixReviveUsed = false;
  private _nuclearReviveUsed = false;
  /** Coletor de Almas: kills accumulated across the whole run */
  private _soulKills = 0;
  /** Damage-popup throttle: per-tick DoT (beams, drain) folds into one popup */
  private _dmgPopupAccum = 0;
  private _dmgPopupCooldown = 0;
  /** Gerador de Escudo: item shield capacity applied last wave (for clean re-apply) */
  private _prevItemShield = 0;

  /** Per-character base speed multiplier (preserved across card speed bonuses) */
  private charSpeedMult = 1;

  constructor(backpack: BackpackGrid) {
    this.backpack = backpack;
    // Apply character speed modifiers
    const charId = backpack.config.characterId;
    if (charId === 'storm_runner') this.charSpeedMult = 1.25; // +25%
    if (charId === 'aqua_sage') this.charSpeedMult = 0.85;    // -15%
    if (charId === 'firefighter') this.charSpeedMult = 0.80;  // -20% (heavy gear)
    this.playerSpeed = 350 * this.charSpeedMult;
    this.state = {
      wave: 0,
      enemies: [],
      projectiles: [],
      enemyProjectiles: [],
      playerHp: 100,
      playerMaxHp: 100,
      playerShield: 0,
      playerMaxShield: 30,
      shieldRegenDelay: 0,
      playerX: 640,
      gold: 0,
      score: 0,
      isActive: false,
      waveCleared: false,
      combo: 0,
      comboTimer: 0,
      totalEnemies: 0,
      floatingTexts: [],
      waveTime: 0,
      damageDealtThisSecond: 0,
      dpsDisplay: 0,
      dpsTimer: 0,
      scoreMultiplier: 1.0,
      bossWarningTimer: 0,
      hitStopTimer: 0,
      shakeIntensity: 0,
      shakeDuration: 0,
      shakeTimer: 0,
      playerFlashTimer: 0,
      killedEnemyIds: [],
      damageTakenThisWave: 0,
      bossPhaseTransitionTimer: 0,
      drainWarningTimer: 0,
      playerSlowTimer: 0,
      powerUps: [],
      rapidFireTimer: 0,
      allyTurrets: [],
      bossBeams: [],
      regenShieldUsed: false,
      normalVariant: null,
      bossVariant: null,
      frostbiteTimer: 0,
      frostbiteMax: 4,
      copycatAdrenalineActive: false,
      copycatAdrenalineTimer: 0,
      copycatAdrenalineTotal: 0,
      copycatAdrenalineBurstTimer: 0,
      asteroids: [],
    };
  }

  activateCoopP2(_charId: string): void {
    this.state.player2Active = true;
    this.state.player2X = this.arenaWidth / 2 + 80;
    this.state.player2Hp = 100;
    this.state.player2MaxHp = 100;
    this.state.player2DashCooldown = 0;
    this.state.player2DashVelocity = 0;
  }

  startWave(
    wave: number, isBossMonth: boolean = false, isMegaBossMonth: boolean = false,
    normalVariant: string | null = null, bossVariant: string | null = null, characterId: string = '',
  ): void {
    this.state.wave = wave;
    this.state.isActive = true;
    this.state.waveCleared = false;
    this.state.normalVariant = normalVariant;
    this.state.bossVariant = bossVariant;
    this.state.frostbiteTimer = 0;
    this.state.copycatAdrenalineActive = false;
    this.state.copycatAdrenalineTimer = 0;
    this.state.copycatAdrenalineBurstTimer = 0;
    this.state.copycatAdrenalineTotal = characterId === 'renegade' ? 0 : characterId === 'storm_runner' ? 5 : 10;
    this.state.asteroids = [];
    this._spaceAsteroidTimer = 1.5;
    this.state.enemies = this.generateWave(wave, isBossMonth, isMegaBossMonth, normalVariant, bossVariant, characterId);
    this.state.projectiles = [];
    this.state.enemyProjectiles = [];
    this.state.combo = 0;
    this.state.comboTimer = 0;
    this.state.totalEnemies = this.state.enemies.length;
    this.state.waveTime = 0;
    this.state.damageDealtThisSecond = 0;
    this.state.dpsDisplay = 0;
    this.state.dpsTimer = 0;
    this.state.hitStopTimer = 0;
    this.state.killedEnemyIds = [];
    this.state.damageTakenThisWave = 0;
    this.state.powerUps = [];
    this.state.rapidFireTimer = 0;
    this.state.allyTurrets = [];
    this.state.bossBeams = [];
    this.state.regenShieldUsed = false;
    this._droneKillCounter = 0;
    this._strongestKillThisWave = null;

    // ── Per-wave item effects & flag resets ────────────────────────────────
    let itemShieldBonus = 0;
    for (const it of this.backpack.getAllItems()) {
      const st = it.state as any;
      // Reset once-per-wave flags (golden egg gold, emergency effects)
      delete st.waveGoldGiven;
      delete st.shieldUsed;
      delete st._emergencyHealUsed;
      // Kit Médico: +50 HP at the start of every wave
      if (st.waveHealBonus) {
        this.state.playerHp = Math.min(this.state.playerMaxHp, this.state.playerHp + st.waveHealBonus);
      }
      // Gerador de Escudo: extra shield capacity while equipped
      if (st.shieldMax) itemShieldBonus += st.shieldMax;
      // Florian passive: "[Água] items also protect (shield)" — was advertised
      // on his character sheet but never actually implemented anywhere.
      if (this.backpack.config.characterId === 'firefighter' && it.definition.tags.includes('Água')) {
        itemShieldBonus += 6;
      }
    }
    this.state.playerMaxShield += itemShieldBonus - this._prevItemShield;
    if (itemShieldBonus > this._prevItemShield) {
      this.state.playerShield = Math.min(this.state.playerMaxShield,
        this.state.playerShield + (itemShieldBonus - this._prevItemShield));
    } else {
      this.state.playerShield = Math.min(this.state.playerShield, this.state.playerMaxShield);
    }
    this._prevItemShield = itemShieldBonus;

    // Marionete (Diana): first enemy of the wave is paralyzed on arrival
    if ((this as any)._paralyzeFirstDuration && this.state.enemies.length > 0) {
      const first = this.state.enemies[0];
      first.slowTimer = (this as any)._paralyzeFirstDuration;
      first.slowAmount = 0.02;
    }

    // Controle Mental (Diana): one captured enemy fights for you all wave
    if ((this as any)._mindControlActive && this.state.enemies.length > 0) {
      const idx = Math.floor(Math.random() * this.state.enemies.length);
      const captured = this.state.enemies.splice(idx, 1)[0];
      this.state.allyTurrets.push({
        id: `ally_mc_${Date.now()}`,
        x: this.arenaWidth / 2, y: this.arenaHeight - 140,
        life: Infinity, damage: Math.max(8, captured.damage), fireRate: 1.2, timer: 0,
        color: '#ec4899',
      });
      this.state.totalEnemies = Math.max(0, this.state.totalEnemies - 1);
    }

    // Boss warning
    if (isBossMonth) {
      this.state.bossWarningTimer = 2.0;
      this.triggerShake(8, 1.0);
    }
  }

  /** Trigger screen shake */
  triggerShake(intensity: number, duration: number): void {
    this.state.shakeIntensity = intensity;
    this.state.shakeDuration = duration;
    this.state.shakeTimer = 0;
  }

  /** Trigger player flash */
  triggerPlayerFlash(): void {
    this.state.playerFlashTimer = 0.15;
  }

  /** Trigger hit-stop */
  triggerHitStop(duration: number): void {
    this.state.hitStopTimer = duration;
  }

  /**
   * Main combat tick. Called at 60fps.
   * @param playerDir -1=left, 0=none, 1=right
   * @param p2Dir P2 direction in COOP mode (-1/0/1)
   */
  tick(dt: number, playerDir: number = 0, p2Dir: number = 0): void {
    if (!this.state.isActive) return;

    // Boss entrance cutscene: the world holds its breath while the colossus
    // rises. Roar (audio + shake) fires once when the timer crosses 1.3s left.
    if (this.bossCinematic > 0) {
      const was = this.bossCinematic;
      this.bossCinematic -= dt;
      if (was > 1.3 && this.bossCinematic <= 1.3) {
        this.onBossRoar?.();
        this.triggerShake(16, 1.1);
      }
      this.updateFloatingTexts(dt);
      this.updateShake(dt);
      return;
    }

    // Hit-stop: freeze everything briefly
    if (this.state.hitStopTimer > 0) {
      this.state.hitStopTimer -= dt;
      // Still update floating texts and timers during hit-stop
      this.updateFloatingTexts(dt);
      this.updateShake(dt);
      return;
    }

    // Update timers
    this.state.waveTime += dt;
    this.state.bossWarningTimer = Math.max(0, this.state.bossWarningTimer - dt);
    this.state.playerFlashTimer = Math.max(0, this.state.playerFlashTimer - dt);
    this.state.bossPhaseTransitionTimer = Math.max(0, this.state.bossPhaseTransitionTimer - dt);
    this.state.drainWarningTimer = Math.max(0, this.state.drainWarningTimer - dt);
    this.state.playerSlowTimer = Math.max(0, this.state.playerSlowTimer - dt);
    this._dmgPopupCooldown = Math.max(0, this._dmgPopupCooldown - dt);
    this.recoilTimer = Math.max(0, this.recoilTimer - dt);

    // Combo timer
    if (this.state.combo > 0) {
      this.state.comboTimer -= dt;
      if (this.state.comboTimer <= 0) {
        this.state.combo = 0;
        // Multiplier decays when combo drops
        this.state.scoreMultiplier = Math.max(1.0, this.state.scoreMultiplier - 0.5);
      }
    }

    // DPS tracker
    this.state.dpsTimer += dt;
    if (this.state.dpsTimer >= 1.0) {
      this.state.dpsDisplay = this.state.damageDealtThisSecond;
      this.state.damageDealtThisSecond = 0;
      this.state.dpsTimer = 0;
    }

    // 0. Move player
    this.movePlayer(dt, playerDir);
    if (this.state.player2Active) this.movePlayer2(dt, p2Dir);

    // 1. Fire weapons from backpack
    this.fireWeapons(dt);

    // 2. Move projectiles
    this.updateProjectiles(dt);

    // 3. Move enemies
    this.updateEnemies(dt);

    // 4. Enemy shooting
    this.updateEnemyShooting(dt);

    // 4b. Boss signature attacks (dive/barrage/beam/pull)
    this.updateBossPatterns(dt);

    // 5. Move enemy projectiles
    this.updateEnemyProjectiles(dt);

    // 5b. Power-up drops (fall + catch)
    this.updatePowerUps(dt);

    // 5c. Ally turrets (Reanimação, Enxame Morto, Controle Mental)
    this.updateAllyTurrets(dt);

    // 6. Check collisions (projectile vs enemy)
    this.checkCollisions(dt);

    // 6b. Anti-Matéria: player shots intercept enemy shots
    if ((this as any)._antiMatter) this.checkAntiMatter();

    // 7. Check enemy projectiles vs player
    this.checkEnemyProjectileHits();

    // 8. Check if enemies reached bottom (damage player)
    this.checkEnemyReachBottom();

    // 9. Apply passive healing
    this.applyHealing(dt);

    // 10. Apply character passives (HP drain/regen)
    this.applyCharacterPassives(dt);

    // 11. Apply item passive effects (EMP, auras, etc.)
    this.applyItemPassives(dt);

    // 11b. Phase variants: Frostbite hazard / Space asteroids / Copycat finale
    if (this.state.normalVariant === 'frostbite') this.updateFrostbite(dt, playerDir);
    if (this.state.normalVariant === 'space') this.updateSpaceAsteroids(dt);
    if (this.state.copycatAdrenalineActive) this.updateCopycatAdrenaline(dt);

    // 12. Update floating texts
    this.updateFloatingTexts(dt);

    // 13. Update shake
    this.updateShake(dt);

    // 13. Check win/lose
    if (this.state.enemies.length === 0 && !this.state.copycatAdrenalineActive) {
      this.state.waveCleared = true;
      this.state.isActive = false;
      // Reset shake to prevent infinite trembling
      this.state.shakeDuration = 0;
      this.state.shakeTimer = 0;
      this.state.shakeIntensity = 0;
    }
    if (this.state.playerHp <= 0) {
      this.state.isActive = false;
      this.state.shakeDuration = 0;
      this.state.shakeTimer = 0;
      this.state.shakeIntensity = 0;
    }
  }

  private playerVelocity = 0;

  private movePlayer(dt: number, dir: number): void {
    // Dash cooldown
    if (this.dashCooldown > 0) this.dashCooldown -= dt;
    if (this.dashActive > 0) this.dashActive -= dt;

    // Smooth acceleration/deceleration
    const slowPenalty = this.state.playerSlowTimer > 0 ? 0.5 : 1;
    const maxSpeed = this.playerSpeed * (this.dashActive > 0 ? 2.5 : 1) * slowPenalty;
    const accel = 2000; // pixels/s²
    const decel = 1800; // friction when not pressing

    if (dir !== 0) {
      this.playerVelocity += dir * accel * dt;
      // Clamp to max speed
      this.playerVelocity = Math.max(-maxSpeed, Math.min(maxSpeed, this.playerVelocity));
    } else {
      // Decelerate toward 0
      if (Math.abs(this.playerVelocity) < decel * dt) {
        this.playerVelocity = 0;
      } else {
        this.playerVelocity -= Math.sign(this.playerVelocity) * decel * dt;
      }
    }

    this.state.playerX += this.playerVelocity * dt;
    // Wall bounce (soft clamp)
    if (this.state.playerX < 20) { this.state.playerX = 20; this.playerVelocity = 0; }
    if (this.state.playerX > this.arenaWidth - 20) { this.state.playerX = this.arenaWidth - 20; this.playerVelocity = 0; }
  }

  /** Activate dash if available (beast_tamer has no dash) */
  dash(): void {
    if (this.backpack.config.characterId === 'beast_tamer') return;
    if (this.dashCooldown <= 0) {
      this.dashActive = 0.15;
      // Mestre do Dash card: lower multiplier = shorter cooldown
      this.dashCooldown = 1.0 * ((this as any)._dashCooldownMult ?? 1);
      // Instant velocity boost in current direction
      if (this.playerVelocity !== 0) {
        this.playerVelocity = Math.sign(this.playerVelocity) * this.playerSpeed * 2.5;
      } else {
        // If standing still, dash in last input direction or right
        this.playerVelocity = this.playerSpeed * 2;
      }
    }
  }

  /** Frostbite (normal phase variant): standing still bleeds cold up, moving
   * or dashing bleeds it back down — hitting the cap fires a heavy burst and
   * resets. Forces constant repositioning instead of camping a safe spot. */
  private updateFrostbite(dt: number, playerDir: number): void {
    const isMoving = playerDir !== 0 || Math.abs(this.playerVelocity) > 40;
    const isDashing = this.dashActive > 0;
    if (isMoving || isDashing) {
      this.state.frostbiteTimer = Math.max(0, this.state.frostbiteTimer - dt * 2.5);
    } else {
      this.state.frostbiteTimer += dt;
    }
    if (this.state.frostbiteTimer >= this.state.frostbiteMax) {
      this.state.frostbiteTimer = 0;
      const burstDamage = Math.max(18, this.state.playerMaxHp * 0.22);
      this.damagePlayer(burstDamage);
      this.spawnFloatingText(this.state.playerX, this.arenaHeight - 90, '❄ CONGELAMENTO! ❄', '#7dd3fc');
      this.triggerShake(10, 0.5);
      this.triggerPlayerFlash();
    }
  }

  /** Vácuo Aberto (normal phase variant): asteroids fall from the top on a
   * collision course — dodge with the same horizontal movement used to
   * avoid everything else, or eat a heavy hit. Missed asteroids (reach the
   * bottom without hitting the player) just despawn, no penalty. */
  private updateSpaceAsteroids(dt: number): void {
    this._spaceAsteroidTimer -= dt;
    if (this._spaceAsteroidTimer <= 0) {
      this._spaceAsteroidTimer = 1.6 + Math.random() * 1.2;
      const radius = 16 + Math.random() * 14;
      this.state.asteroids.push({
        id: `asteroid_${this.nextAsteroidId++}`,
        x: 60 + Math.random() * (this.arenaWidth - 120),
        y: -radius,
        vx: (Math.random() - 0.5) * 40,
        vy: 190 + Math.random() * 90,
        radius,
        damage: Math.max(16, this.state.playerMaxHp * 0.2),
        rotation: 0,
        rotSpeed: (Math.random() - 0.5) * 2.5,
      });
    }

    const st = this.state;
    for (let i = st.asteroids.length - 1; i >= 0; i--) {
      const a = st.asteroids[i];
      a.x += a.vx * dt;
      a.y += a.vy * dt;
      a.rotation += a.rotSpeed * dt;

      const hitPlayer = Math.abs(a.x - st.playerX) < a.radius + 16 && a.y > this.arenaHeight - 60 && a.y < this.arenaHeight - 20;
      if (hitPlayer) {
        this.damagePlayer(a.damage);
        this.spawnFloatingText(st.playerX, this.arenaHeight - 90, '☄ IMPACTO!', '#fca5a5');
        this.triggerShake(9, 0.4);
        this.triggerPlayerFlash();
        st.asteroids.splice(i, 1);
        continue;
      }
      if (a.y > this.arenaHeight + 60) {
        st.asteroids.splice(i, 1);
      }
    }
  }

  /** Copycat (boss phase variant): once the mirror is defeated, a short
   * survive-only finale — dodge fanned volleys until the timer runs out.
   * No kill requirement, just don't get hit too much. */
  private updateCopycatAdrenaline(dt: number): void {
    this.state.copycatAdrenalineTimer -= dt;
    this.state.copycatAdrenalineBurstTimer -= dt;
    if (this.state.copycatAdrenalineBurstTimer <= 0) {
      this.state.copycatAdrenalineBurstTimer = 0.55;
      const burstCount = 8 + Math.floor(Math.random() * 4);
      const originX = 100 + Math.random() * (this.arenaWidth - 200);
      for (let i = 0; i < burstCount; i++) {
        const angle = (Math.PI / Math.max(1, burstCount - 1)) * i + Math.PI * 0.15;
        const speed = 220 + Math.random() * 60;
        this.state.enemyProjectiles.push({
          id: `eproj_adrenaline_${this.nextEnemyProjId++}`,
          x: originX, y: 100,
          vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
          damage: 7,
          alive: true,
        });
      }
    }
    if (this.state.copycatAdrenalineTimer <= 0) {
      this.state.copycatAdrenalineActive = false;
      this.spawnFloatingText(this.state.playerX, this.arenaHeight - 100, 'SOBREVIVEU!', '#4ade80');
      this.triggerShake(6, 0.4);
    }
  }

  private movePlayer2(dt: number, dir: number): void {
    const st = this.state;
    if (st.player2DashCooldown! > 0) st.player2DashCooldown! -= dt;
    const dashActive = (st as any)._p2DashActive ?? 0;
    if (dashActive > 0) (st as any)._p2DashActive -= dt;
    const maxSpeed = this.playerSpeed * (dashActive > 0 ? 2.5 : 1);
    const accel = 2000;
    const decel = 1800;
    if (dir !== 0) {
      this.playerVelocity2 += dir * accel * dt;
      this.playerVelocity2 = Math.max(-maxSpeed, Math.min(maxSpeed, this.playerVelocity2));
    } else {
      if (Math.abs(this.playerVelocity2) < decel * dt) {
        this.playerVelocity2 = 0;
      } else {
        this.playerVelocity2 -= Math.sign(this.playerVelocity2) * decel * dt;
      }
    }
    st.player2X! += this.playerVelocity2 * dt;
    if (st.player2X! < 20) { st.player2X = 20; this.playerVelocity2 = 0; }
    if (st.player2X! > this.arenaWidth - 20) { st.player2X = this.arenaWidth - 20; this.playerVelocity2 = 0; }
  }

  dashP2(): void {
    const st = this.state;
    if (!st.player2Active) return;
    if ((st.player2DashCooldown ?? 0) <= 0) {
      (st as any)._p2DashActive = 0.15;
      st.player2DashCooldown = 1.0;
      if (this.playerVelocity2 !== 0) {
        this.playerVelocity2 = Math.sign(this.playerVelocity2) * this.playerSpeed * 2.5;
      } else {
        this.playerVelocity2 = this.playerSpeed * 2;
      }
    }
  }

  private fireWeapons(dt: number): void {
    // Mudança de Fase (Dr. Eon): invulnerable but cannot attack while phased
    if ((this as any)._phaseShiftActive) return;

    const emitters = this.backpack.getAllItems().filter(i =>
      i.definition.tags.includes('Emissor') || i.definition.tags.includes('Arma')
    );
    const charId = this.backpack.config.characterId;

    // Void Walker dynamic damage bonus based on missing HP
    let voidBonus = 1;
    if (charId === 'void_walker') {
      const missingHp = this.state.playerMaxHp - this.state.playerHp;
      const bonusStacks = Math.min(10, Math.floor(missingHp / 10));
      voidBonus = 1 + bonusStacks * 0.1; // max +100%
    }

    // Skill-based multipliers (set externally by GameManager)
    const skillDmgMult = (this as any)._skillDamageMult ?? 1;
    let skillRateMult = (this as any)._skillFireRateMult ?? 1;

    // Rapid-fire power-up: 2x fire rate
    if (this.state.rapidFireTimer > 0) skillRateMult *= 2;

    // FEVER: combo 15+ rewards aggressive play with +25% fire rate.
    // OVERDRIVE: combo 30+ adds +20% damage on top (renderer shows the tier).
    if (this.state.combo >= 15) skillRateMult *= 1.25;

    // ── Item-driven global modifiers (Núcleo Berserker, Corneta, etc.) ────
    let itemDmg = 1;
    let itemRate = 1;
    const hpPctNow = this.state.playerHp / this.state.playerMaxHp;
    for (const it of this.backpack.getAllItems()) {
      const st = it.state as any;
      // Núcleo Berserker: below threshold HP → damage multiplier (2.0 = +100%)
      if (st.berserkerThreshold && hpPctNow < st.berserkerThreshold) itemDmg *= st.berserkerDamageBonus ?? 2;
      // Corneta de Guerra: +10% dmg per combo point (capped +100%)
      if (st.comboDamageBonus) itemDmg *= 1 + Math.min(1.0, this.state.combo * st.comboDamageBonus);
      // Fragmento de Núcleo Alien: +3% dmg per enemy on screen (capped +150%)
      if (st.damagePerEnemy) itemDmg *= 1 + Math.min(1.5, this.state.enemies.length * st.damagePerEnemy);
      // Coletor de Almas: +1% dmg per kill this run (capped +200%)
      if (st.soulDamagePerKill) itemDmg *= 1 + Math.min(2.0, this._soulKills * st.soulDamagePerKill);
      // Estandarte de Guerra: +5% dmg per kill this wave (capped +150%)
      if (st.warBannerBonusPerKill) itemDmg *= 1 + Math.min(1.5, this.state.killedEnemyIds.length * st.warBannerBonusPerKill);
      // Injetor de Adrenalina: fire-rate multiplier below 50% HP (1.5 = +50%)
      if (st.lowHpFireRateBonus && hpPctNow < 0.5) itemRate *= st.lowHpFireRateBonus;
    }
    skillRateMult *= itemRate;

    for (const emitter of emitters) {
      if (emitter.definition.onTick) {
        // ── Character weapon identity (from character advantage lists) ──
        const tags = emitter.definition.tags;
        let charDmg = 1;
        let charRate = 1;
        // fire_lord, storm_runner, beast_tamer's pet bonus, and firefighter
        // were ALSO being applied here, on top of the identical multipliers
        // BackpackGrid.applyCharacterPassives() already bakes permanently
        // into item.stats.damageMultiplier/fireRateMultiplier (which
        // weaponTick reads to build proj.damage below) — silently squaring
        // each character's signature passive every frame (e.g. beast_tamer's
        // pets ended up at 4x damage / 2.25x rate instead of the intended
        // 2x / 1.5x). Only grass_man (Fogo penalty; its stacking-height bonus
        // is separate, via onSynergyUpdate), aqua_sage, renegade, and
        // beast_tamer's non-pet penalty live solely here — everyone else's
        // identity multiplier now applies exactly once, via BackpackGrid.
        switch (charId) {
          case 'grass_man':      // Rômulo: -20% fire damage
            if (tags.includes('Fogo')) charDmg *= 0.8;
            break;
          case 'aqua_sage':      // Mazu: water weapons +25% rate
            if (tags.includes('Água')) charRate *= 1.25;
            break;
          case 'beast_tamer':    // Diana: non-pets -30% dmg (pet bonus baked in BackpackGrid)
            if (!tags.includes('Pet') && !tags.includes('Animal')) charDmg *= 0.7;
            break;
          case 'renegade':       // Sétimo: xeno biology favors organic weaponry
            if (tags.includes('Orgânico') || tags.includes('Veneno')) charDmg *= 1.3;
            break;
        }

        // Frenzy skill: pets fire 3x faster while active
        if ((this as any)._frenzyActive && (tags.includes('Pet') || tags.includes('Animal'))) {
          charRate *= 3;
        }

        // Apply rate multipliers temporarily
        const origRate = emitter.stats.fireRateMultiplier;
        emitter.stats.fireRateMultiplier *= skillRateMult * charRate;

        emitter.definition.onTick(emitter, dt, (proj) => {
          let finalDamage = proj.damage * voidBonus * skillDmgMult * charDmg * itemDmg
            * (this.state.combo >= 30 ? 1.2 : 1); // OVERDRIVE
          // Motor do Caos: 50%-200% random damage swing per shot —
          // state.chaosMode used to be set on adjacent weapons and never read.
          if (emitter.state.chaosMode) {
            finalDamage *= 0.5 + Math.random() * 1.5;
          }
          // Paradoxo Temporal: fires at 2x rate (real, via fireRateMultiplier)
          // but half those shots deal zero damage — state.missChance used to
          // be set and never read, so this was a pure +100% fire rate item
          // with no downside at all.
          if (emitter.state.missChance && Math.random() < emitter.state.missChance) {
            finalDamage = 0;
          }
          this.recoilTimer = 0.12; // drives the character's shot-recoil animation
          // Short-range weapons (e.g. the flamethrower's cone) carry a range
          // in px; convert to seconds-of-flight at this shot's own speed so
          // it fizzles out mid-air instead of flying the length of the arena
          const speed = Math.hypot(proj.vx, proj.vy);
          const life = proj.range && speed > 0 ? proj.range / speed : undefined;
          this.state.projectiles.push({
            id: `proj_${this.nextProjectileId++}`,
            x: this.state.playerX + (proj.x - 400) * 0.05,
            y: this.arenaHeight - 45,
            vx: proj.vx,
            vy: proj.vy,
            damage: finalDamage,
            piercing: proj.piercing,
            aoeRadius: proj.aoeRadius,
            tags: [...proj.tags],
            alive: true,
            trail: [],
            ownerId: proj.ownerId,
            life,
          });
          // CO-OP: the backpack is shared, so every shot fires twin-barrel —
          // once from each player's position — instead of P2 standing around
          // unarmed while P1 does 100% of the shooting.
          if (this.state.player2Active && this.state.player2X !== undefined) {
            this.state.projectiles.push({
              id: `proj_${this.nextProjectileId++}`,
              x: this.state.player2X + (proj.x - 400) * 0.05,
              y: this.arenaHeight - 45,
              vx: proj.vx,
              vy: proj.vy,
              damage: finalDamage,
              piercing: proj.piercing,
              aoeRadius: proj.aoeRadius,
              life,
              tags: [...proj.tags],
              alive: true,
              trail: [],
              ownerId: proj.ownerId,
            });
          }
        });

        // Restore original rate
        emitter.stats.fireRateMultiplier = origRate;
      }
    }
  }

  /** Whether homing shots are active */
  private _homingActive = false;

  /** Enable or disable homing projectiles */
  setHomingActive(active: boolean): void {
    this._homingActive = active;
  }

  /** Set player speed multiplier (from cards) — preserves per-character base mult */
  setSpeedBonus(bonus: number): void {
    this.playerSpeed = 350 * this.charSpeedMult * (1 + bonus);
  }

  private updateProjectiles(dt: number): void {
    const charId = this.backpack.config.characterId;
    for (const p of this.state.projectiles) {
      if (!p.alive) continue;

      // Store trail position
      p.trail.push({ x: p.x, y: p.y });
      if (p.trail.length > 3) p.trail.shift();

      // Homing behavior: activated globally or per-projectile (Guiado tag from missile launcher)
      if (this._homingActive || p.tags.includes('Guiado')) {
        let nearest: Enemy | null = null;
        let nearDist = Infinity;
        for (const e of this.state.enemies) {
          const dx = e.x - p.x;
          const dy = e.y - p.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < nearDist) { nearDist = d; nearest = e; }
        }
        if (nearest && nearDist < 400) {
          const dx = nearest.x - p.x;
          const dy = nearest.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const turnSpeed = 3;
          p.vx += (dx / dist) * turnSpeed;
          p.vy += (dy / dist) * turnSpeed;
          const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
          const targetSpeed = 400;
          p.vx = (p.vx / speed) * targetSpeed;
          p.vy = (p.vy / speed) * targetSpeed;
        }
      }

      p.x += p.vx * dt;
      p.y += p.vy * dt;

      // Bouncy shots: bounce off left/right walls, capped (card grants 2;
      // Frank/storm_runner's "unstable pulses ricochet once" passive grants 1
      // when no card is active). The cap used to be checked but never
      // enforced — shots bounced forever regardless of the promised count.
      const maxBounces = (this as any)._bouncyShots ?? (charId === 'storm_runner' ? 1 : 0);
      if (maxBounces > 0 && (p.bounces ?? 0) < maxBounces) {
        if (p.x < 5) {
          p.x = 5;
          p.vx = Math.abs(p.vx);
          p.bounces = (p.bounces ?? 0) + 1;
        } else if (p.x > this.arenaWidth - 5) {
          p.x = this.arenaWidth - 5;
          p.vx = -Math.abs(p.vx);
          p.bounces = (p.bounces ?? 0) + 1;
        }
      }

      // Remove if off-screen
      if (p.y < -20 || p.y > this.arenaHeight + 20 || p.x < -20 || p.x > this.arenaWidth + 20) {
        p.alive = false;
      }

      // Short-range shots (flamethrower cone, etc.) fizzle out mid-air once
      // their life runs out, regardless of arena bounds
      if (p.life !== undefined) {
        p.life -= dt;
        if (p.life <= 0) p.alive = false;
      }
    }
    this.state.projectiles = this.state.projectiles.filter(p => p.alive);
  }

  private updateEnemies(dt: number): void {
    // Anti-slog pacing: stragglers hurry up so waves don't drag
    const remaining = this.state.enemies.length;
    const remainRatio = this.state.totalEnemies > 0 ? remaining / this.state.totalEnemies : 1;
    let paceMult = 1;
    if (remaining <= 3 || remainRatio < 0.15) paceMult = 1.6;
    if (this.state.waveTime > 45) paceMult *= 1.5;

    for (const e of this.state.enemies) {
      e.moveTimer += dt;
      // Decay hit flash
      if (e.hitFlash && e.hitFlash > 0) e.hitFlash -= dt;

      // Elite affix: regenerator heals 2%/s while below max
      if ((e as any).affix === 'regen' && e.hp < e.maxHp && e.hp > 0) {
        e.hp = Math.min(e.maxHp, e.hp + e.maxHp * 0.02 * dt);
      }

      // Update slow timer
      if (e.slowTimer && e.slowTimer > 0) {
        e.slowTimer -= dt;
        if (e.slowTimer <= 0) {
          e.slowTimer = 0;
          e.slowAmount = undefined;
        }
      }

      // Update phase timer (for 'phase' special) — `chance` controls the
      // fraction of each cycle spent phased/invulnerable, per enemy design
      // (0.2 = mostly vulnerable with brief evasive windows, 0.7 = mostly
      // evasive). Previously ignored, making every phase enemy identical.
      if (e.phaseTimer !== undefined) {
        e.phaseTimer -= dt;
        if (e.phaseTimer <= 0) {
          e.phased = !e.phased;
          const chance = e.special?.type === 'phase' ? e.special.chance : 0.4;
          const cycleBase = 3.0;
          const jitter = 0.8 + Math.random() * 0.4;
          e.phaseTimer = e.phased
            ? Math.max(0.4, cycleBase * chance * jitter)
            : Math.max(0.4, cycleBase * (1 - chance) * jitter);
        }
      }

      // Update spawn timer (for 'spawn' special)
      if (e.special?.type === 'spawn' && e.spawnTimer !== undefined) {
        e.spawnTimer -= dt;
        if (e.spawnTimer <= 0) {
          e.spawnTimer = e.special.interval;
          this.spawnChild(e, e.special.childId);
        }
      }

      // Base speed with slow effect
      const slowMult = (e.slowTimer && e.slowTimer > 0 && e.slowAmount) ? e.slowAmount : 1;
      const globalSlowMult = (this as any)._globalSlowMult ?? 1;
      const speed = e.speed * slowMult * globalSlowMult * (e.isBoss ? 1 : paceMult);

      // Movement behavior based on pattern
      switch (e.movement) {
        case 'straight':
          e.y += speed * dt;
          break;

        case 'sine':
          e.y += speed * dt;
          e.x += Math.sin(e.moveTimer * 3 + parseFloat(e.id.replace(/\D/g, '')) * 0.7) * speed * 1.2 * dt;
          break;

        case 'zigzag':
          e.y += speed * dt;
          // Change direction every ~1.2 seconds
          if (Math.floor(e.moveTimer / 1.2) % 2 === 0) {
            e.x += speed * 1.5 * dt * e.moveDir;
          } else {
            e.x -= speed * 1.5 * dt * e.moveDir;
          }
          break;

        case 'erratic':
          e.y += speed * 0.6 * dt;
          // Random jumps in position (teleport-like)
          if (Math.random() < 0.02) {
            e.x += (Math.random() - 0.5) * 80;
            e.y += (Math.random() - 0.5) * 30;
          }
          // Quick lateral dashes
          e.x += Math.sin(e.moveTimer * 8) * speed * 0.8 * dt;
          break;

        case 'charge': {
          // Moves down slowly until reaching y=150, telegraphs, then charges
          if (!e.charging && e.y < 150) {
            e.y += speed * 0.4 * dt;
          } else if (!e.charging) {
            // Telegraph: brief warning pause so the player can react
            const tel = (e as any)._chargeTel ?? 0.45;
            (e as any)._chargeTel = tel - dt;
            if ((e as any)._chargeTel <= 0) {
              e.charging = true;
              e.chargeTargetX = this.state.playerX;
            }
          }

          if (e.charging) {
            // Rush toward player at high speed
            const targetY = this.arenaHeight - 30;
            const dx = (e.chargeTargetX ?? this.state.playerX) - e.x;
            const dy = targetY - e.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 5) {
              e.x += (dx / dist) * speed * 2.5 * dt;
              e.y += (dy / dist) * speed * 2.5 * dt;
            } else {
              e.y += speed * 3 * dt; // Past player, keep going down
            }
          }
          break;
        }

        case 'strafe': {
          // Stay near top, strafe left/right while shooting down
          if (e.y < 80) {
            e.y += speed * dt; // Move into position
          } else {
            e.y = Math.min(e.y, 100); // Lock near top
            e.x += speed * 2.5 * dt * e.moveDir;
            // Reverse at arena edges
            if (e.x <= e.width / 2 + 20) e.moveDir = 1;
            if (e.x >= this.arenaWidth - e.width / 2 - 20) e.moveDir = -1;
          }
          break;
        }
      }

      // Boss special movement: strafe at top while shooting.
      // Skipped while the boss is executing a dive attack (pattern engine
      // steers it below the hover cap and back).
      if (e.isBoss && e.y > 60 && !(e as any)._diving && e.defId !== 'boss_epoch') {
        // Bosses hover at top area and strafe (Zyr-Goth is a stationary
        // colossus — his y/x are pinned at spawn)
        if (e.y > 120) e.y = 120; // Cap boss y-position
        e.x += Math.sin(e.moveTimer * 1.5) * speed * 3 * dt;
      }

      // Aura effects: healer regenerates nearby allies, war drum speeds them
      if (e.defId === 'healer' && Math.floor(e.moveTimer * 2) % 2 === 0) {
        // Healer: regenerate 2 HP to all allies within 100px every 0.5s
        for (const ally of this.state.enemies) {
          if (ally === e) continue;
          const dx = ally.x - e.x;
          const dy = ally.y - e.y;
          if (Math.sqrt(dx * dx + dy * dy) < 100) {
            ally.hp = Math.min(ally.maxHp, ally.hp + 1 * dt);
          }
        }
      }
      if (e.defId === 'war_drum') {
        // War Drum: all allies within 120px get +30% speed
        for (const ally of this.state.enemies) {
          if (ally === e || ally.defId === 'war_drum') continue;
          const dx = ally.x - e.x;
          const dy = ally.y - e.y;
          if (Math.sqrt(dx * dx + dy * dy) < 120) {
            ally.speed = ally.baseSpeed * 1.3;
          }
        }
      }

      // Drain enemy: suck HP from player when nearby
      if (e.special?.type === 'drain') {
        const playerY2 = this.arenaHeight - 45;
        const ddx = this.state.playerX - e.x;
        const ddy = playerY2 - e.y;
        const dist = Math.sqrt(ddx * ddx + ddy * ddy);
        if (dist < e.special.range) {
          this.damagePlayer(e.special.dps * dt);
          this.state.drainWarningTimer = 0.5;
          // Slow own movement — hovering while draining
          e.speed = Math.max(5, e.speed * 0.92);
        } else {
          // Restore speed when out of range
          e.speed = Math.min(e.baseSpeed, e.speed + e.baseSpeed * 0.5 * dt);
        }
      }

      // Clamp to arena
      e.x = Math.max(e.width / 2, Math.min(this.arenaWidth - e.width / 2, e.x));
      e.y = Math.min(this.arenaHeight + 50, e.y); // Allow going a bit past bottom for reach-bottom check
    }
  }

  /** Spawn a child enemy from a spawner */
  private spawnChild(parent: Enemy, childId: string): void {
    const childDef = ALL_ENEMIES.find((e: EnemyDefinition) => e.id === childId);
    if (!childDef) return;

    // Cap spawned enemies to avoid lag
    if (this.state.enemies.length > 60) return;

    const hpScale = 1 + this.state.wave * 0.1;
    this.state.enemies.push({
      id: `enemy_${this.nextEnemyId++}`,
      x: parent.x + (Math.random() - 0.5) * 40,
      y: parent.y + parent.height / 2 + 10,
      hp: Math.floor(childDef.hp * hpScale),
      maxHp: Math.floor(childDef.hp * hpScale),
      speed: childDef.speed,
      damage: childDef.damage,
      tags: [...childDef.tags],
      width: childDef.width,
      height: childDef.height,
      goldReward: childDef.goldReward,
      shootTimer: childDef.special?.type === 'shoot' ? 1 / childDef.special.fireRate : 2,
      special: childDef.special,
      isBoss: false,
      movement: childDef.movement,
      armorHits: childDef.special?.type === 'armor' ? childDef.special.hits : undefined,
      phased: false,
      phaseTimer: childDef.special?.type === 'phase' ? 2.0 : undefined,
      spawnTimer: childDef.special?.type === 'spawn' ? childDef.special.interval : undefined,
      moveTimer: Math.random() * 5,
      moveDir: Math.random() > 0.5 ? 1 : -1,
      explodeOnDeath: childDef.special?.type === 'explode',
      baseSpeed: childDef.speed,
      defId: childDef.id,
    });
    this.state.totalEnemies++;
  }

  private updateEnemyShooting(dt: number): void {
    // Distorção (Dr. Eon): enemy projectiles fly slower, permanently
    const projSlowMult = (this as any)._enemyProjSlow ?? 1;
    for (const e of this.state.enemies) {
      // Don't shoot while phased
      if (e.phased) continue;

      // Enemies with 'shoot' special
      if (e.special && e.special.type === 'shoot') {
        e.shootTimer -= dt;
        if (e.shootTimer <= 0) {
          const spec = e.special;
          e.shootTimer = 1 / spec.fireRate;

          // Aim toward player
          const dx = this.state.playerX - e.x;
          const dy = (this.arenaHeight - 30) - e.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const vx = dist > 0 ? (dx / dist) * spec.projectileSpeed : 0;
          const vy = dist > 0 ? (dy / dist) * spec.projectileSpeed : spec.projectileSpeed;

          this.state.enemyProjectiles.push({
            id: `eproj_${this.nextEnemyProjId++}`,
            x: e.x,
            y: e.y + e.height / 2,
            vx: vx * projSlowMult,
            vy: vy * projSlowMult,
            damage: Math.ceil(e.damage * 0.5),
            alive: true,
            tags: e.tags,
          });
          // Muzzle flash on shoot
          e.hitFlash = 0.05;

          // Boss multi-shot: fire additional projectiles in spread pattern
          if (e.isBoss) {
            const spread = 0.3; // radians
            const angle = Math.atan2(vy, vx);
            for (let s = -1; s <= 1; s += 2) {
              const spreadAngle = angle + spread * s;
              this.state.enemyProjectiles.push({
                id: `eproj_${this.nextEnemyProjId++}`,
                x: e.x,
                y: e.y + e.height / 2,
                vx: Math.cos(spreadAngle) * spec.projectileSpeed * projSlowMult,
                vy: Math.sin(spreadAngle) * spec.projectileSpeed * projSlowMult,
                damage: Math.ceil(e.damage * 0.4),
                alive: true,
                bounces: 2, // Boss projectiles bounce off walls twice
                tags: e.tags,
              });
            }
          }
        }
      }

      // Bomber (Zepelim): drops slow bombs that burst on the ground line
      if (e.special?.type === 'bomber') {
        e.shootTimer -= dt;
        if (e.shootTimer <= 0) {
          e.shootTimer = e.special.interval;
          this.state.enemyProjectiles.push({
            id: `eproj_${this.nextEnemyProjId++}`,
            x: e.x,
            y: e.y + e.height / 2,
            vx: 0,
            vy: 95 * projSlowMult,
            damage: e.special.damage,
            alive: true,
            bomb: true,
            tags: e.tags,
          });
          e.hitFlash = 0.05;
        }
      }

      // Bosses that don't have explicit 'shoot' still fire periodically
      if (e.isBoss && (!e.special || e.special.type !== 'shoot')) {
        e.shootTimer -= dt;
        if (e.shootTimer <= 0) {
          e.shootTimer = 2.0; // Every 2 seconds
          const dx = this.state.playerX - e.x;
          const dy = (this.arenaHeight - 30) - e.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const projSpeed = 180 * projSlowMult;
          this.state.enemyProjectiles.push({
            id: `eproj_${this.nextEnemyProjId++}`,
            x: e.x,
            y: e.y + e.height / 2,
            vx: dist > 0 ? (dx / dist) * projSpeed : 0,
            vy: dist > 0 ? (dy / dist) * projSpeed : projSpeed,
            damage: Math.ceil(e.damage * 0.4),
            alive: true,
            tags: e.tags,
          });
        }
      }
    }
  }

  /**
   * Boss signature attacks. Each boss runs one archetype from BOSS_PATTERNS
   * on an internal cooldown (shorter in phase 2). Beams live in
   * state.bossBeams so the renderer can draw the telegraph/active column.
   */
  private updateBossPatterns(dt: number): void {
    const st = this.state;

    // Advance beams (they outlive the shot that created them)
    for (let i = st.bossBeams.length - 1; i >= 0; i--) {
      const b = st.bossBeams[i];
      if (b.warnTime > 0) {
        b.warnTime -= dt;
      } else {
        b.activeTime -= dt;
        if (Math.abs(st.playerX - b.x) < b.width / 2 + 14) {
          this.damagePlayer(b.dps * dt);
        }
        if (b.activeTime <= 0) st.bossBeams.splice(i, 1);
      }
    }

    for (const e of st.enemies) {
      if (!e.isBoss || e.hp <= 0) continue;
      const pattern = BOSS_PATTERNS[e.defId] ?? 'barrage';
      const ex = e as any;
      if (ex._patTimer === undefined) ex._patTimer = 3.5; // grace period after spawn
      const cdMult = e.boss2ndPhaseActive ? 0.65 : 1;

      switch (pattern) {
        case 'dive': {
          if (ex._divePhase === 'telegraph') {
            ex._diveTimer -= dt;
            e.hitFlash = 0.05; // pulse white while winding up
            if (ex._diveTimer <= 0) {
              ex._divePhase = 'dive';
              ex._diving = true;
              ex._diveHit = false;
              ex._diveTargetX = st.playerX; // lock on at launch
            }
          } else if (ex._divePhase === 'dive') {
            const targetY = this.arenaHeight - 70;
            const dx = (ex._diveTargetX ?? st.playerX) - e.x;
            const dy = targetY - e.y;
            const dist = Math.hypot(dx, dy);
            const spd = 640;
            if (dist > 14) {
              e.x += (dx / dist) * spd * dt;
              e.y += (dy / dist) * spd * dt;
            } else {
              ex._divePhase = 'return';
            }
            // Contact hit — once per dive
            if (!ex._diveHit) {
              const pdx = st.playerX - e.x;
              const pdy = (this.arenaHeight - 45) - e.y;
              if (Math.abs(pdx) < e.width / 2 + 28 && Math.abs(pdy) < e.height / 2 + 32) {
                ex._diveHit = true;
                this.damagePlayer(e.damage);
                this.triggerShake(10, 0.35);
              }
            }
          } else if (ex._divePhase === 'return') {
            e.y -= 320 * dt;
            if (e.y <= 110) {
              ex._divePhase = undefined;
              ex._diving = false;
              ex._patTimer = 7.5 * cdMult;
            }
          } else {
            ex._patTimer -= dt;
            if (ex._patTimer <= 0) {
              ex._divePhase = 'telegraph';
              ex._diveTimer = 0.9;
              this.spawnFloatingText(e.x, e.y + 40, '⚠ MERGULHO!', '#f97316');
              this.triggerShake(4, 0.3);
            }
          }
          break;
        }

        case 'barrage': {
          ex._patTimer -= dt;
          if (ex._patTimer <= 0) {
            ex._patTimer = 6.0 * cdMult;
            const count = e.boss2ndPhaseActive ? 14 : 10;
            const projSlowMult = (this as any)._enemyProjSlow ?? 1;
            const spd = 175 * projSlowMult;
            for (let k = 0; k < count; k++) {
              // Downward fan spanning ~140°
              const ang = Math.PI * (0.12 + 0.76 * (k / (count - 1)));
              st.enemyProjectiles.push({
                id: `eproj_${this.nextEnemyProjId++}`,
                x: e.x,
                y: e.y + e.height / 2,
                vx: Math.cos(ang) * spd,
                vy: Math.sin(ang) * spd,
                damage: Math.ceil(e.damage * 0.35),
                alive: true,
                tags: e.tags,
              });
            }
            e.hitFlash = 0.1;
            this.triggerShake(5, 0.25);
          }
          break;
        }

        case 'beam': {
          ex._patTimer -= dt;
          if (ex._patTimer <= 0) {
            ex._patTimer = 8.0 * cdMult;
            st.bossBeams.push({
              x: st.playerX,
              width: 90,
              warnTime: 1.1,
              activeTime: 1.4,
              dps: Math.max(10, e.damage * 1.2),
            });
            this.spawnFloatingText(st.playerX, this.arenaHeight - 130, '⚠ LASER!', '#f43f5e');
          }
          break;
        }

        case 'pull': {
          if (ex._pullActive > 0) {
            ex._pullActive -= dt;
            const dir = Math.sign(e.x - st.playerX);
            st.playerX = Math.max(24, Math.min(this.arenaWidth - 24, st.playerX + dir * 135 * dt));
            st.drainWarningTimer = 0.2; // reuse the drain warning tint
            if (ex._pullActive <= 0) ex._patTimer = 7.0 * cdMult;
          } else {
            ex._patTimer -= dt;
            if (ex._patTimer <= 0) {
              ex._pullActive = 2.0;
              this.spawnFloatingText(e.x, e.y + 40, '🌀 ATRAÇÃO GRAVITACIONAL!', '#a78bfa');
            }
          }
          break;
        }
      }
    }
  }

  private nextPowerUpId = 0;

  /** Spawn a power-up drop at a position (weighted random type) */
  private spawnPowerUp(x: number, y: number): void {
    const roll = Math.random();
    const type: PowerUpType =
      roll < 0.28 ? 'heal' :
      roll < 0.54 ? 'gold' :
      roll < 0.72 ? 'shield' :
      roll < 0.86 ? 'rapid' :
      roll < 0.95 ? 'freeze' : 'nuke';
    this.state.powerUps.push({
      id: `pu_${this.nextPowerUpId++}`,
      x, y, type,
      life: 10,
    });
  }

  private updatePowerUps(dt: number): void {
    if (this.state.rapidFireTimer > 0) this.state.rapidFireTimer -= dt;

    const groundY = this.arenaHeight - 40;
    const st = this.state;
    for (let i = st.powerUps.length - 1; i >= 0; i--) {
      const pu = st.powerUps[i];
      // Fall until resting just above the ground line
      if (pu.y < groundY) {
        pu.y += 85 * dt;
      } else {
        pu.life -= dt;
      }
      if (pu.life <= 0) { st.powerUps.splice(i, 1); continue; }

      // Catch: player (or P2 in co-op) touches it near the ground.
      // Campo Magnético multiplies the catch radius.
      let magnetMult = 1;
      for (const it of this.backpack.getAllItems()) {
        const m = (it.state as any).pickupRadiusBonus;
        if (m) magnetMult = Math.max(magnetMult, m);
      }
      // Relic: Lente de Kepler widens the catch radius
      magnetMult *= 1 + ((this as any)._relicPickup ?? 0);
      const catchR = 26 * magnetMult;
      const caughtBy1 = Math.abs(pu.x - st.playerX) < catchR && pu.y > this.arenaHeight - 85;
      const caughtBy2 = !!st.player2Active && st.player2X !== undefined &&
        Math.abs(pu.x - st.player2X) < catchR && pu.y > this.arenaHeight - 85;
      if (caughtBy1 || caughtBy2) {
        this.applyPowerUp(pu);
        st.powerUps.splice(i, 1);
      }
    }
  }

  private applyPowerUp(pu: PowerUp): void {
    const st = this.state;
    switch (pu.type) {
      case 'heal':
        st.playerHp = Math.min(st.playerMaxHp, st.playerHp + 15);
        this.spawnFloatingText(pu.x, pu.y - 20, '+15 HP', '#4ade80');
        break;
      case 'gold': {
        const amount = 12 + Math.floor(st.wave * 0.8);
        st.gold += amount;
        this.spawnFloatingText(pu.x, pu.y - 20, `+${amount}g`, '#fbbf24');
        break;
      }
      case 'shield':
        st.playerShield = Math.min(st.playerMaxShield, st.playerShield + 15);
        this.spawnFloatingText(pu.x, pu.y - 20, '+ESCUDO', '#38bdf8');
        break;
      case 'rapid':
        st.rapidFireTimer = 5;
        this.spawnFloatingText(pu.x, pu.y - 20, 'CADÊNCIA 2X!', '#22d3ee');
        break;
      case 'freeze':
        for (const e of st.enemies) {
          if (e.isBoss) continue; // bosses shrug it off
          e.slowTimer = Math.max(e.slowTimer ?? 0, 2.5);
          e.slowAmount = 0.05;
        }
        this.spawnFloatingText(pu.x, pu.y - 20, '❄ CONGELADOS!', '#93c5fd');
        this.triggerShake(4, 0.2);
        break;
      case 'nuke': {
        // Big screen-wide blast: heavy damage to normals, chip to bosses
        for (const e of st.enemies) {
          e.hp -= e.isBoss ? e.maxHp * 0.06 : Math.max(25, e.maxHp * 0.5);
        }
        this.spawnFloatingText(pu.x, pu.y - 20, '☢ DEVASTAÇÃO! ☢', '#a855f7');
        this.triggerShake(10, 0.5);
        this.triggerHitStop(0.08);
        for (let i = st.enemies.length - 1; i >= 0; i--) {
          if (st.enemies[i].hp <= 0) this.killEnemy(st.enemies[i], i);
        }
        break;
      }
    }
    // Signal for audio feedback (consumed by main loop)
    (st as any)._powerupCaughtType = pu.type;
  }

  /** Spawn an ally turret (used by Reanimação, Enxame Morto, Controle Mental) */
  private spawnAllyTurret(x: number, y: number, life: number, damage: number, fireRate: number, color: string): void {
    if (this.state.allyTurrets.length >= 6) return; // sane cap
    this.state.allyTurrets.push({
      id: `ally_${this.nextAllyId++}`, x, y, life, damage, fireRate, timer: 0, color,
    });
  }

  private updateAllyTurrets(dt: number): void {
    const turrets = this.state.allyTurrets;
    for (let i = turrets.length - 1; i >= 0; i--) {
      const t = turrets[i];
      t.life -= dt;
      if (t.life <= 0) { turrets.splice(i, 1); continue; }

      t.timer -= dt;
      if (t.timer <= 0 && this.state.enemies.length > 0) {
        t.timer = 1 / t.fireRate;
        // Fire at the nearest enemy
        let nearest = this.state.enemies[0];
        let nearDist = Infinity;
        for (const e of this.state.enemies) {
          if (e.phased) continue;
          const d = Math.hypot(e.x - t.x, e.y - t.y);
          if (d < nearDist) { nearDist = d; nearest = e; }
        }
        const dx = nearest.x - t.x, dy = nearest.y - t.y;
        const dist = Math.max(1, Math.hypot(dx, dy));
        const speed = 500;
        this.state.projectiles.push({
          id: `proj_ally_${this.nextProjectileId++}`,
          x: t.x, y: t.y,
          vx: (dx / dist) * speed, vy: (dy / dist) * speed,
          damage: t.damage, piercing: 0, aoeRadius: 0,
          tags: [], alive: true, trail: [],
        });
      }
    }
  }

  /** Anti-Matéria (Dr. Eon): player projectiles collide with and cancel enemy projectiles */
  private checkAntiMatter(): void {
    for (const p of this.state.projectiles) {
      if (!p.alive) continue;
      for (const ep of this.state.enemyProjectiles) {
        if (!ep.alive) continue;
        if (this.rectCollision(p.x - 4, p.y - 4, 8, 8, ep.x - 5, ep.y - 5, 10, 10)) {
          ep.alive = false;
          if (p.piercing > 0) p.piercing--;
          else p.alive = false;
          this.spawnParticleBurst(ep.x, ep.y);
          break;
        }
      }
    }
  }

  /** Tiny visual sparkle for anti-matter cancellations (reuses floating text as a marker) */
  private spawnParticleBurst(x: number, y: number): void {
    this.spawnFloatingText(x, y, '✦', '#a78bfa');
  }

  private updateEnemyProjectiles(dt: number): void {
    // Ventilador: continuously decelerates incoming enemy projectiles
    let windDrag = 0;
    for (const it of this.backpack.getAllItems()) {
      if (it.definition.id === 'wind_fan') windDrag += 0.25;
    }
    for (const p of this.state.enemyProjectiles) {
      if (!p.alive) continue;
      if (windDrag > 0 && p.vy > 0) {
        p.vy *= Math.max(0.4, 1 - windDrag * dt);
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      // Bomb (Zepelim): detonates on the ground line with splash damage
      if (p.bomb && p.y >= this.arenaHeight - 45) {
        p.alive = false;
        if (Math.abs(this.state.playerX - p.x) < 85) {
          this.damagePlayer(p.damage);
        }
        this.triggerShake(4, 0.2);
        this.spawnFloatingText(p.x, this.arenaHeight - 60, '💥', '#f97316');
        continue;
      }

      // Bounce off left/right walls
      if (p.bounces && p.bounces > 0) {
        if (p.x < 5 || p.x > this.arenaWidth - 5) {
          p.vx = -p.vx;
          p.x = Math.max(5, Math.min(this.arenaWidth - 5, p.x));
          p.bounces--;
        }
        // Only kill if off top/bottom
        if (p.y > this.arenaHeight + 20 || p.y < -20) {
          p.alive = false;
        }
      } else {
        if (p.y > this.arenaHeight + 20 || p.y < -20 || p.x < -20 || p.x > this.arenaWidth + 20) {
          p.alive = false;
        }
      }
    }
    this.state.enemyProjectiles = this.state.enemyProjectiles.filter(p => p.alive);
  }

  private checkEnemyProjectileHits(): void {
    const playerW = 28; // Hitbox smaller than visual (forgiving)
    const playerH = 28;
    const playerY = this.arenaHeight - 48;

    // Matriz de Reflexão: chance to bounce enemy shots back as friendly fire
    let reflectCh = 0;
    for (const it of this.backpack.getAllItems()) {
      reflectCh += (it.state as any).reflectChance ?? 0;
    }

    for (const p of this.state.enemyProjectiles) {
      if (!p.alive) continue;
      if (this.rectCollision(
        p.x - 4, p.y - 4, 8, 8,
        this.state.playerX - playerW / 2, playerY, playerW, playerH
      )) {
        p.alive = false;
        if (reflectCh > 0 && Math.random() < Math.min(0.6, reflectCh)) {
          this.state.projectiles.push({
            id: `proj_reflect_${this.nextProjectileId++}`,
            x: p.x, y: p.y,
            vx: p.vx * 0.5, vy: -Math.abs(p.vy) * 1.5,
            damage: p.damage * 1.5, piercing: 0, aoeRadius: 0,
            tags: [], alive: true, trail: [],
          });
          this.spawnFloatingText(p.x, p.y - 10, '↩ REFLETIDO', '#a78bfa');
          continue;
        }
        this.damagePlayer(p.damage);
      }
    }

    // CO-OP: P2 has no backpack/character, so no defenses apply — just raw damage.
    if (this.state.player2Active && this.state.player2X !== undefined) {
      for (const p of this.state.enemyProjectiles) {
        if (!p.alive) continue;
        if (this.rectCollision(
          p.x - 4, p.y - 4, 8, 8,
          this.state.player2X - playerW / 2, playerY, playerW, playerH
        )) {
          p.alive = false;
          this.damagePlayer2(p.damage);
        }
      }
    }
  }

  /** CO-OP: damage Player 2. No backpack/relics/character passives apply — P2 is a bare HP pool. */
  private damagePlayer2(amount: number): void {
    if (!this.state.player2Active || this.state.player2Hp === undefined) return;
    this.state.player2Hp = Math.max(0, this.state.player2Hp - amount);
    this.triggerPlayerFlash();
    this.spawnFloatingText(this.state.player2X ?? this.state.playerX, this.arenaHeight - 60, `-${Math.round(amount)}`, '#ef4444');
    if (this.state.player2Hp <= 0) {
      this.spawnFloatingText(this.state.player2X ?? this.state.playerX, this.arenaHeight - 90, 'P2 CAIU!', '#ef4444');
      this.state.player2Active = false;
    }
  }

  private damagePlayer(amount: number): void {
    // Phase Shift immunity (set by skill system)
    if ((this as any)._phaseShiftActive) {
      this.spawnFloatingText(this.state.playerX, this.arenaHeight - 60, 'FASE!', '#a78bfa');
      return;
    }

    // Void Walker passive: 12% chance to go intangible and ignore damage
    if (this.backpack.config.characterId === 'void_walker' && Math.random() < 0.12) {
      this.spawnFloatingText(this.state.playerX, this.arenaHeight - 65, 'INTANGÍVEL!', '#a78bfa');
      this.triggerShake(2, 0.1);
      return;
    }

    // Firefighter (Fênix): -25% damage taken while above 50% HP (guardian armor)
    if (this.backpack.config.characterId === 'firefighter') {
      if (this.state.playerHp > this.state.playerMaxHp * 0.5) {
        amount *= 0.75;
      }
    }

    // ── Item defenses (Deslocador de Fase, Ventilador, Golem, Coroa) ──────
    let itemDodge = (this as any)._relicDodge ?? 0;
    let itemReduction = 1 - ((this as any)._relicDR ?? 0);
    let thornRatio = 0;
    let itemArmor = 0;
    for (const it of this.backpack.getAllItems()) {
      const st = it.state as any;
      if (st.dodgeChance) itemDodge += st.dodgeChance;
      if (st.damageReduction) itemReduction *= 1 - st.damageReduction; // Ventilador
      if (st.damageAbsorb) itemReduction *= 1 - st.damageAbsorb;       // Golem de Cristal
      if (st.thornDamage) thornRatio = Math.max(thornRatio, st.thornDamage);
      itemArmor += it.stats.armorBonus ?? 0; // Armadura de Espinhos, Escudo de Seiva, etc.
    }
    if (itemDodge > 0 && Math.random() < Math.min(0.5, itemDodge)) {
      this.spawnFloatingText(this.state.playerX, this.arenaHeight - 65, 'ESQUIVA!', '#67e8f9');
      return;
    }
    // Armor was granted by several cards (Armadura de Espinhos, Escudo de Seiva,
    // Escudo de Brasas) via item.stats.armorBonus, but nothing ever read that
    // stat — those cards' "+X armadura" clause was pure flavor text. Diminishing
    // returns (rather than a flat subtraction) keeps a fully-stacked backpack
    // from trivializing damage while still making every point of armor matter.
    if (itemArmor > 0) itemReduction *= 50 / (50 + itemArmor);
    amount *= itemReduction;
    // Coroa de Espinhos: return a share of the damage to a random enemy
    if (thornRatio > 0 && this.state.enemies.length > 0) {
      const t = this.state.enemies[Math.floor(Math.random() * this.state.enemies.length)];
      const thornDmg = amount * thornRatio;
      t.hp -= thornDmg;
      this.spawnFloatingText(t.x, t.y - 10, `↩${Math.floor(thornDmg)}`, '#4ade80');
    }

    // Shield absorbs damage first
    let remaining = amount;
    if (this.state.playerShield > 0) {
      const absorbed = Math.min(this.state.playerShield, remaining);
      this.state.playerShield -= absorbed;
      remaining -= absorbed;
      if (absorbed >= 1 && remaining === 0 && this._dmgPopupCooldown <= 0) {
        this.spawnFloatingText(this.state.playerX + 20, this.arenaHeight - 50, `🛡-${Math.round(absorbed)}`, '#38bdf8');
        this._dmgPopupCooldown = 0.25;
      }
    }

    if (remaining > 0) {
      this.state.playerHp -= remaining;
      this.state.damageTakenThisWave += remaining;
    }

    // Reset shield regen delay
    this.state.shieldRegenDelay = 3.0;

    // Score multiplier drops on damage
    this.state.scoreMultiplier = Math.max(1.0, this.state.scoreMultiplier - 0.3);

    // Gold per hit (Ouro Sangrento card)
    if ((this as any)._goldPerHitActive) {
      this.state.gold += (this as any)._goldPerHitAmount ?? 2;
    }

    // Second Wind: revive at 0 HP once per wave
    if (this.state.playerHp <= 0 && (this as any)._secondWindActive && !(this as any)._secondWindUsed) {
      this.state.playerHp = 30;
      (this as any)._secondWindUsed = true;
      this.spawnFloatingText(this.state.playerX, this.arenaHeight - 80, 'SEGUNDO FÔLEGO!', '#4ade80');
      this.triggerShake(8, 0.3);
    }

    // Rift Walk (Dr. Eon): teleport away from death, survive at 1 HP, 1x/wave
    if (this.state.playerHp <= 0 && (this as any)._riftWalkActive && !(this as any)._riftWalkUsed) {
      this.state.playerHp = 1;
      (this as any)._riftWalkUsed = true;
      this.state.playerX = 60 + Math.random() * (this.arenaWidth - 120);
      this.spawnFloatingText(this.state.playerX, this.arenaHeight - 80, 'RIFT WALK!', '#a78bfa');
      this.triggerShake(6, 0.3);
    }

    // Renascimento da Fênix (Kagutsuchi): revive at 30 HP, once per RUN
    if (this.state.playerHp <= 0 && (this as any)._phoenixReviveActive && !this._phoenixReviveUsed) {
      this.state.playerHp = 30;
      this._phoenixReviveUsed = true;
      this.spawnFloatingText(this.state.playerX, this.arenaHeight - 80, '🔥 RENASCIMENTO! 🔥', '#f97316');
      this.triggerShake(10, 0.4);
      this.triggerHitStop(0.15);
    }

    // Colapso Nuclear (Frank): wipe the wave, revive at 1 HP, once per RUN
    if (this.state.playerHp <= 0 && (this as any)._nuclearReviveActive && !this._nuclearReviveUsed) {
      this.state.playerHp = 1;
      this._nuclearReviveUsed = true;
      this.spawnFloatingText(this.state.playerX, this.arenaHeight - 80, '☢ COLAPSO NUCLEAR! ☢', '#a3e635');
      this.triggerShake(16, 0.6);
      this.triggerHitStop(0.2);
      for (let i = this.state.enemies.length - 1; i >= 0; i--) {
        this.killEnemy(this.state.enemies[i], i);
      }
    }

    this.triggerPlayerFlash();
    this.triggerShake(5, 0.2);
    // Fold per-frame DoT ticks into one readable popup instead of 60/s
    this._dmgPopupAccum += amount;
    if (this._dmgPopupCooldown <= 0 && this._dmgPopupAccum >= 1) {
      this.spawnFloatingText(this.state.playerX, this.arenaHeight - 60,
        `-${Math.round(this._dmgPopupAccum)}`, '#ef4444');
      this._dmgPopupAccum = 0;
      this._dmgPopupCooldown = 0.25;
    }
  }

  private checkCollisions(dt: number): void {
    const charId = this.backpack.config.characterId;

    for (const p of this.state.projectiles) {
      if (!p.alive) continue;

      // Looked up once per projectile (not once per enemy below) — used both
      // to size the hitbox here (Size Enhancer) and for the per-item hit
      // effects further down, so there's a single source of truth per shot.
      const ownerItem = p.ownerId ? this.backpack.getItem(p.ownerId) : undefined;

      // Swept hitbox spanning this frame's whole travel path, not just its
      // current point. At normal speeds (a few px/frame) this is the same
      // ~8x8 box as before — invisible change. But very fast shots (the
      // laser's ~9999px/s bolt covers ~165px in one frame) used to tunnel
      // straight through anything between last frame's position and this
      // one's, since a point-sized box can't catch what it jumped over.
      // Size Enhancer (Amplificador de Tamanho) grows this same margin —
      // its state.projectileSizeBonus used to be set and never read anywhere.
      const sizeBonus = (ownerItem?.state as any)?.projectileSizeBonus ?? 1;
      const margin = 4 * sizeBonus;
      const travelX = p.vx * dt;
      const travelY = p.vy * dt;
      const hbX = Math.min(p.x, p.x - travelX) - margin;
      const hbY = Math.min(p.y, p.y - travelY) - margin;
      const hbW = Math.abs(travelX) + margin * 2;
      const hbH = Math.abs(travelY) + margin * 2;

      for (let i = this.state.enemies.length - 1; i >= 0; i--) {
        const e = this.state.enemies[i];

        // Skip phased enemies (they are invulnerable while phased)
        if (e.phased) continue;

        const hit = this.rectCollision(
          hbX, hbY, hbW, hbH,
          e.x - e.width / 2, e.y - e.height / 2, e.width, e.height
        );

        if (hit) {
          let damage = p.damage;

          // Caçador de Chefes / Caçador de Elites cards
          if (e.isBoss) damage *= (this as any)._bossDamageMult ?? 1;
          if ((e as any).isElite) damage *= (this as any)._eliteDamageMult ?? 1;

          // Armor system: reduce incoming hits
          if (e.armorHits !== undefined && e.armorHits > 0) {
            e.armorHits--;
            // Munição Perfurante card: blends the 0.3x armored penalty back
            // toward full damage (0 pierce = old 0.3x, 1.0 pierce = no penalty)
            const armorPierce = Math.min(1, (this as any)._armorPierce ?? 0);
            damage *= 0.3 + 0.7 * armorPierce;
            this.spawnFloatingText(e.x, e.y - e.height / 2, 'ARMORED', '#94a3b8');
          }

          // Pulso (storm_runner): electric items ignore armor
          if (charId === 'storm_runner' && p.tags.includes('Elétrico')) {
            damage = p.damage; // Restore full damage (ignore armor)
          }

          // ─── Elemental Resistance System ───────────────────────────────
          let elementalMultiplier = 1;
          let elementalColor: string | null = null;

          // Super effective (2x)
          if (p.tags.includes('Fogo') && (e.tags.includes('Orgânico') || e.tags.includes('Planta'))) {
            elementalMultiplier = 2;
            elementalColor = '#f97316'; // orange
          } else if ((p.tags.includes('Água') || p.tags.includes('Gelo')) && e.tags.includes('Fogo')) {
            elementalMultiplier = 2;
            elementalColor = '#38bdf8'; // blue
          } else if (p.tags.includes('Elétrico') && e.tags.includes('Água')) {
            elementalMultiplier = 2;
            elementalColor = '#facc15'; // yellow
          } else if (p.tags.includes('Veneno') && e.tags.includes('Orgânico')) {
            elementalMultiplier = 2;
            elementalColor = '#a855f7'; // purple
          }
          // Effective (1.5x)
          else if (p.tags.includes('Orgânico') && e.tags.includes('Água')) {
            elementalMultiplier = 1.5;
            elementalColor = '#4ade80'; // green
          }
          // Resistance (0.5x)
          else if (p.tags.includes('Fogo') && e.tags.includes('Fogo')) {
            elementalMultiplier = 0.5;
            elementalColor = '#9ca3af'; // gray
          } else if (p.tags.includes('Água') && e.tags.includes('Água')) {
            elementalMultiplier = 0.5;
            elementalColor = '#9ca3af'; // gray
          } else if (p.tags.includes('Elétrico') && e.tags.includes('Elétrico')) {
            elementalMultiplier = 0.5;
            elementalColor = '#9ca3af'; // gray
          } else if (p.tags.includes('Veneno') && e.tags.includes('Veneno')) {
            elementalMultiplier = 0.5;
            elementalColor = '#9ca3af'; // gray
          }

          damage *= elementalMultiplier;
          // ─── End Elemental System ──────────────────────────────────────

          // ─── Critical Hit System ────────────────────────────────────────
          let isCrit = false;
          const critChance = this.getCritChance();
          if (Math.random() < critChance) {
            // Núcleo Crítico promises "3x dano" but this used to be a flat
            // *2 that never looked at state.critMultiplier at all — use the
            // strongest multiplier granted by any item, default to the
            // original 2x when nothing sets one (e.g. Void Walker's passive
            // crit chance, which carries no multiplier of its own).
            damage *= this.getCritMultiplier();
            isCrit = true;
            this.triggerHitStop(0.03); // Micro freeze on crit
            // Kagutsuchi: crits ignite the target (burn DoT)
            if (charId === 'fire_lord') {
              (e as any).poisonTimer = Math.max((e as any).poisonTimer ?? 0, 2.5);
              (e as any).poisonDamage = Math.max((e as any).poisonDamage ?? 0, damage * 0.3);
              this.spawnFloatingText(e.x, e.y - e.height / 2 - 8, '🔥', '#f97316');
            }
          }
          // ─── End Crit System ────────────────────────────────────────────

          // Rage mode bonus
          if ((this as any)._rageDamageBonus) {
            damage *= (1 + (this as any)._rageDamageBonus);
          }

          // Last Stand: +80% damage when below 25% HP
          if ((this as any)._lastStandActive) {
            const hpPct = this.state.playerHp / this.state.playerMaxHp;
            if (hpPct < 0.25) {
              damage *= 1.8;
            }
          }

          // Mestre do Combo: +5% dano por hit no combo (max 50%)
          const comboDmgPerHit = (this as any)._comboDmgPerHit ?? 0;
          if (comboDmgPerHit > 0) {
            damage *= 1 + Math.min(0.5, this.state.combo * comboDmgPerHit);
          }

          // Shield aura (Égide): a nearby shielder soaks part of the hit.
          // The shielder never protects itself — killing it is the answer.
          let auraSoak = 0;
          for (const sh of this.state.enemies) {
            if (sh === e || sh.hp <= 0 || sh.special?.type !== 'shield_aura') continue;
            if (Math.hypot(sh.x - e.x, sh.y - e.y) < sh.special.range) {
              auraSoak = Math.max(auraSoak, sh.special.reduction);
            }
          }
          if (auraSoak > 0) damage *= 1 - auraSoak;

          // Motor de Momentum: +5%/hit while the weapon keeps landing shots,
          // decaying back to zero after a gap with no hits (approximates
          // "reseta ao errar" — this engine has no explicit per-shot miss
          // event to hook, so a short idle window stands in for a miss).
          // state.momentumActive/momentumPerHit used to be set and never
          // read anywhere — this weapon did literally nothing before.
          if (ownerItem?.state.momentumActive) {
            const os = ownerItem.state as any;
            const perHit = os.momentumPerHit ?? 0.05;
            const lastHit = os.momentumLastHitTime ?? -999;
            if (this.state.waveTime - lastHit > 1.5) os.momentumStacks = 0;
            const stacks = os.momentumStacks ?? 0;
            damage *= 1 + stacks * perHit;
            os.momentumStacks = Math.min(20, stacks + 1);
            os.momentumLastHitTime = this.state.waveTime;
          }

          e.hp -= damage;
          e.hitFlash = 0.08;
          // Knockback (push enemy up slightly on hit) — bosses are too heavy;
          // sustained fire used to juggle them above the hover cap and off-screen
          if (!e.isBoss) e.y -= 2;
          this.state.damageDealtThisSecond += damage;

          // Maré (aqua_sage): water projectiles slow enemies
          if (charId === 'aqua_sage' && p.tags.includes('Água')) {
            e.slowTimer = 2.0;
            e.slowAmount = 0.7; // 30% slower
          }

          // Poison DoT: [Veneno] projectiles apply damage over time
          if (p.tags.includes('Veneno')) {
            const poisonDps = damage * 0.5;
            (e as any).poisonTimer = Math.max((e as any).poisonTimer ?? 0, 3.0);
            (e as any).poisonDamage = Math.max((e as any).poisonDamage ?? 0, poisonDps);
          }

          // Freeze on hit (Gelo Negro card etc.)
          if (p.tags.includes('Gelo') || p.tags.includes('Água')) {
            const freeze = 0.5; // base freeze
            e.slowTimer = Math.max(e.slowTimer ?? 0, freeze);
            e.slowAmount = Math.min(e.slowAmount ?? 1, 0.3); // near freeze
          }

          // slow_on_hit: hitting this enemy triggers a retaliation slow on the player
          if (e.special?.type === 'slow_on_hit') {
            this.state.playerSlowTimer = Math.max(this.state.playerSlowTimer, e.special.duration);
            this.spawnFloatingText(this.state.playerX, this.arenaHeight - 70, 'LENTO!', '#67e8f9');
          }

          // reflect (Espelhar): chance to bounce a shot straight back
          if (e.special?.type === 'reflect' && !e.phased && Math.random() < e.special.chance) {
            const rdx = this.state.playerX - e.x;
            const rdy = (this.arenaHeight - 45) - e.y;
            const rdist = Math.max(1, Math.hypot(rdx, rdy));
            const rSpeed = e.special.projectileSpeed * ((this as any)._enemyProjSlow ?? 1);
            this.state.enemyProjectiles.push({
              id: `eproj_${this.nextEnemyProjId++}`,
              x: e.x, y: e.y + e.height / 2,
              vx: (rdx / rdist) * rSpeed,
              vy: (rdy / rdist) * rSpeed,
              damage: Math.ceil(e.damage * 0.6),
              alive: true,
              tags: e.tags,
            });
            e.hitFlash = 0.12;
          }

          // ─── Per-item hit effects (cards that buff a specific weapon) ────
          if (ownerItem) {
            // Onda de Pressão (Mazu): water shots push enemies back (bosses resist)
            const pushback = ownerItem.state.pushback as number | undefined;
            if (pushback && !e.isBoss) e.y -= pushback;

            // Gelo Negro (Mazu): stronger, controllable freeze than passive water chill
            const freezeDur = ownerItem.state.freezeDuration as number | undefined;
            if (freezeDur) {
              e.slowTimer = Math.max(e.slowTimer ?? 0, freezeDur);
              e.slowAmount = Math.min(e.slowAmount ?? 1, 0.05);
            }

            // Fenda Menor (Dr. Eon): shots teleport the target (25% per hit, avoids spam-lock)
            if (ownerItem.state.teleportOnHit && !e.isBoss && Math.random() < 0.25) {
              e.x = 40 + Math.random() * (this.arenaWidth - 80);
              e.y = Math.max(20, e.y - 60);
              this.spawnFloatingText(e.x, e.y - e.height / 2 - 10, '✨', '#a78bfa');
            }

            const os = ownerItem.state as any;
            // Canhão Sônico: knockback + brief stun (bosses resist knockback)
            if (os.knockback && !e.isBoss) e.y -= 12 * os.knockback;
            if (os.stunDuration && Math.random() < 0.35) {
              e.slowTimer = Math.max(e.slowTimer ?? 0, os.stunDuration);
              e.slowAmount = 0.02;
            }
            // Arpão: drags the target downward into kill range
            if (os.pullEffect) e.y += 25 * os.pullEffect;
            // Canhão do Vazio: impact pulls nearby enemies toward the hit point
            if (os.gravityPull) {
              for (const other of this.state.enemies) {
                if (other === e || other.phased) continue;
                const gdx = p.x - other.x, gdy = p.y - other.y;
                const gd = Math.hypot(gdx, gdy);
                if (gd > 1 && gd < 100) {
                  other.x += (gdx / gd) * 30 * os.gravityPull;
                  other.y += (gdy / gd) * 30 * os.gravityPull;
                }
              }
            }
            // Sanguessuga Vital: heal a fraction of damage dealt by this item
            if (os.leechRatio) {
              this.state.playerHp = Math.min(this.state.playerMaxHp,
                this.state.playerHp + damage * os.leechRatio);
            }
            // Trava Multi-alvo: the shot splits into 2 on its first hit only —
            // state.splitOnHit used to be set by the modifier and never read
            // anywhere, so the weapon just ate the -15% damage penalty next
            // to it for nothing. Children carry no ownerId (same convention
            // as Arma de Fragmentos' kill-shatter shards) so they can't
            // re-split or re-trigger this same effect.
            if (os.splitOnHit && !p.hasSplit) {
              p.hasSplit = true;
              const baseAngle = Math.atan2(p.vy, p.vx);
              const speed = Math.hypot(p.vx, p.vy);
              for (const off of [-0.35, 0.35]) {
                const ang = baseAngle + off;
                this.state.projectiles.push({
                  id: `proj_split_${this.nextProjectileId++}`,
                  x: p.x, y: p.y,
                  vx: Math.cos(ang) * speed, vy: Math.sin(ang) * speed,
                  damage: p.damage, piercing: 0, aoeRadius: 0,
                  tags: [...p.tags], alive: true, trail: [],
                });
              }
            }
          }

          // Floating damage number
          const textColor = isCrit ? '#ff6b6b' : elementalColor || '#fbbf24';
          const displayText = isCrit
            ? `CRIT ${Math.floor(damage)}!`
            : elementalMultiplier >= 2
              ? `${Math.floor(damage)}!`
              : elementalMultiplier < 1
                ? `${Math.floor(damage)}...`
                : Math.floor(damage).toString();
          this.spawnFloatingText(
            e.x + (Math.random() - 0.5) * 10,
            e.y - e.height / 2,
            displayText,
            textColor
          );

          if (p.aoeRadius > 0) {
            // Inferno (fire_lord): AoE radius +30%
            const aoeBonus = charId === 'fire_lord' ? 1.3 : 1;
            this.applyAoE(p.x, p.y, p.aoeRadius * aoeBonus, damage * 0.5);
          }

          if (p.piercing > 0) {
            p.piercing--;
          } else {
            p.alive = false;
          }

          // Boss phase 2 trigger (HP drops below 50%)
          if (e.isBoss && !e.boss2ndPhaseActive && e.hp > 0 && e.hp <= e.maxHp * 0.5) {
            e.boss2ndPhaseActive = true;
            e.speed     = e.baseSpeed * 1.55;
            e.baseSpeed = e.speed;
            if (e.special?.type === 'shoot') {
              e.special.fireRate        *= 1.8;
              e.special.projectileSpeed *= 1.25;
            }
            e.shootTimer = 0;
            this.state.bossPhaseTransitionTimer = 2.5;
            this.triggerShake(14, 0.9);
            this.triggerHitStop(0.12);
            this.spawnFloatingText(e.x, e.y - 50, '⚠ FASE 2! ⚠', '#ef4444');
            this.spawnFloatingText(e.x, e.y - 20, 'ENRAIVECIDO!',  '#f97316');
          }

          if (e.hp <= 0) {
            // Sifão Vampírico: heal a flat amount on kill — state.vampiricHeal
            // used to be set by the modifier and never read anywhere, so
            // equipping it healed exactly 0 HP over an entire run.
            if (ownerItem?.state.vampiricHeal) {
              this.state.playerHp = Math.min(this.state.playerMaxHp,
                this.state.playerHp + ownerItem.state.vampiricHeal);
            }
            // Curto-Circuito (Frank): chance to chain lightning to a nearby enemy on kill.
            // Resolve the chain target BEFORE splicing `e` out (indices below `i` would
            // shift and invalidate `i`), but apply/kill it AFTER — using a fresh indexOf,
            // since killing `e` first is what keeps `i` valid for e's own splice.
            const chainChance = ownerItem?.state.chainChance as number | undefined;
            let chainTarget: Enemy | null = null;
            if (chainChance && Math.random() < chainChance) {
              let nearDist = Infinity;
              for (const other of this.state.enemies) {
                if (other === e || other.phased) continue;
                const d = Math.hypot(other.x - e.x, other.y - e.y);
                if (d < nearDist && d < 150) { nearDist = d; chainTarget = other; }
              }
            }
            // Arma de Fragmentos: the killing shot shatters into shards
            const shatter = ownerItem ? ((ownerItem.state as any).shatterCount ?? 0) : 0;
            if (shatter > 0) {
              for (let sh = 0; sh < shatter; sh++) {
                const ang = -Math.PI / 2 + (sh - (shatter - 1) / 2) * 0.6;
                this.state.projectiles.push({
                  id: `proj_shard_${this.nextProjectileId++}`,
                  x: e.x, y: e.y,
                  vx: Math.cos(ang) * 350, vy: Math.sin(ang) * 350,
                  damage: damage * 0.35, piercing: 0, aoeRadius: 0,
                  tags: [], alive: true, trail: [],
                  // no ownerId: shards must not re-shatter
                });
              }
            }
            this.killEnemy(e, i);
            if (chainTarget) {
              chainTarget.hp -= damage * 0.6;
              this.spawnFloatingText(chainTarget.x, chainTarget.y - 10, `⚡${Math.floor(damage * 0.6)}`, '#facc15');
              if (chainTarget.hp <= 0) {
                const chainIdx = this.state.enemies.indexOf(chainTarget);
                if (chainIdx >= 0) this.killEnemy(chainTarget, chainIdx);
              }
            }
          }
          // Stop checking further enemies for this shot only once it's
          // actually spent (piercing exhausted). A piercing shot — bone_spear,
          // sniper, or the laser's swept hitbox spanning many enemies in one
          // frame — must keep scanning so it can hit everything in its box
          // this frame instead of trickling out one enemy per frame.
          if (!p.alive) break;
        }
      }
    }
  }

  /** Handle enemy death — gold, score, combo, split, explode */
  /**
   * Kill an enemy from outside the normal collision pipeline (skills, external
   * AoE sources) while still running the full killEnemy reward/effect chain —
   * combo, gold scaling, power-up drops, elite affix triggers, boss fanfare,
   * card mechanics like Reanimação/Necrose/Curto-Circuito, etc.
   */
  killEnemyExternal(e: Enemy): void {
    const idx = this.state.enemies.indexOf(e);
    if (idx >= 0) this.killEnemy(e, idx);
  }

  /**
   * Diana's "Reanimar" skill: bring back the strongest non-boss enemy killed
   * so far this wave as a temporary ally turret. Returns false (no-op) if
   * nothing has died yet this wave, or the same kill was already reanimated.
   */
  reanimateStrongestKill(): boolean {
    const target = this._strongestKillThisWave;
    if (!target) return false;
    this._strongestKillThisWave = null; // consumed — can't reanimate the same corpse twice
    this.spawnAllyTurret(target.x, target.y, 8, Math.max(6, target.damage * 0.8), 1.0, '#4ade80');
    this.spawnFloatingText(target.x, target.y - 15, '💚 REANIMADO!', '#4ade80');
    return true;
  }

  private killEnemy(e: Enemy, index: number): void {
    // Copycat: defeating the mirror doesn't end the wave outright — a short
    // survive-only Adrenaline finale runs first (skipped entirely when the
    // duration is 0, i.e. playing as a full alien character; see startWave).
    if (e.isCopycat && this.state.copycatAdrenalineTotal > 0) {
      this.state.copycatAdrenalineActive = true;
      this.state.copycatAdrenalineTimer = this.state.copycatAdrenalineTotal;
      this.state.copycatAdrenalineBurstTimer = 0;
      this.spawnFloatingText(e.x, e.y - 40, '⚡ ADRENALINA! SOBREVIVA! ⚡', '#facc15');
      this.triggerShake(10, 0.6);
    }

    // Track for codex
    this.state.killedEnemyIds.push(e.defId);

    // Track the strongest kill this wave for Diana's "Reanimar" skill (bosses
    // excluded — reviving a boss-tier ally would be a different balance tier)
    if (!e.isBoss && (!this._strongestKillThisWave || e.maxHp > this._strongestKillThisWave.maxHp)) {
      this._strongestKillThisWave = { x: e.x, y: e.y, damage: e.damage, maxHp: e.maxHp };
    }

    // Gold reward scales with wave + combo bonus
    const comboBonus = 1 + Math.min(this.state.combo * 0.05, 1.0); // max +100% at 20 combo
    // Early game gold boost (waves 1-6 give +50% gold)
    const earlyBoost = this.state.wave <= 6 ? 1.5 : 1.0;
    let goldReward = Math.floor((e.goldReward + this.state.wave * 0.5) * comboBonus * earlyBoost);

    // Card: Drops de Sorte / gold_harvest (+gold per kill)
    const goldPerKill = (this as any)._goldPerKillAmount ?? (this as any)._goldPerKill ?? 0;
    if (goldPerKill > 0) goldReward += goldPerKill;

    // ── Item gold & on-kill effects ────────────────────────────────────────
    this._soulKills++; // Coletor de Almas accumulator (harmless if not equipped)
    let itemGoldFlat = 0;
    let itemGoldMult = 1;
    let goldDoubleCh = 0;
    for (const it of this.backpack.getAllItems()) {
      const st = it.state as any;
      if (st.goldPerKill) itemGoldFlat += st.goldPerKill;   // Detector de Ouro
      if (st.goldSteal) itemGoldFlat += st.goldSteal;       // Morcego das Sombras
      if (st.goldBonus) itemGoldMult *= 1 + st.goldBonus;   // Ímã de Ouro
      if (st.goldDoubleChance) goldDoubleCh += st.goldDoubleChance; // Duplicador
      // Núcleo Explosivo: deaths splash nearby enemies
      if (st.deathExplosionDamage) {
        for (const other of this.state.enemies) {
          if (other === e || other.phased) continue;
          const edx = other.x - e.x, edy = other.y - e.y;
          if (Math.hypot(edx, edy) < (st.deathExplosionRadius ?? 40)) {
            other.hp -= st.deathExplosionDamage;
            this.state.damageDealtThisSecond += st.deathExplosionDamage;
          }
        }
      }
    }
    goldReward = Math.floor(goldReward * itemGoldMult) + itemGoldFlat;
    if (goldDoubleCh > 0 && Math.random() < Math.min(0.5, goldDoubleCh)) {
      goldReward *= 2;
      this.spawnFloatingText(e.x, e.y - 14, '💰 2X!', '#fbbf24');
    }

    this.state.gold += goldReward;
    this.state.score += Math.floor(goldReward * 10 * this.state.scoreMultiplier);

    // Combo
    this.state.combo++;
    this.state.comboTimer = 2.0;
    // Score multiplier increases with kills (max x5)
    this.state.scoreMultiplier = Math.min(5.0, this.state.scoreMultiplier + 0.05);
    if (this.state.combo > (this.state as any).maxCombo) {
      (this.state as any).maxCombo = this.state.combo;
    }
    // Combo milestone: reset all skill cooldowns at 20 combo
    if (this.state.combo === 20) {
      (this.state as any)._comboSkillReset = true;
      this.spawnFloatingText(this.state.playerX, this.arenaHeight - 100, 'SKILLS RESET!', '#a78bfa');
      this.triggerShake(6, 0.3);
    }

    // Card: Modo Fúria — +damage per kill this wave
    if ((this as any)._rageModePerKill) {
      (this as any)._rageDamageBonus = Math.min(1.0, ((this as any)._rageDamageBonus ?? 0) + (this as any)._rageModePerKill);
    }

    // Card: Absorção Vital — chance to heal a flat amount per kill
    const healOnKillChance = (this as any)._healOnKillChance ?? 0;
    if (healOnKillChance > 0 && Math.random() < healOnKillChance && this.state.playerHp < this.state.playerMaxHp) {
      const healAmt = (this as any)._healOnKillAmount ?? 0;
      this.state.playerHp = Math.min(this.state.playerMaxHp, this.state.playerHp + healAmt);
    }

    // Floating gold text
    const goldText = comboBonus > 1.1 ? `+${goldReward}g (x${comboBonus.toFixed(1)})` : `+${goldReward}g`;
    this.spawnFloatingText(e.x, e.y, goldText, '#4ade80');

    // Power-up drop chance (bosses always drop one; Suprimentos event triples it)
    const dropMult = (this as any)._dropChanceMult ?? 1;
    if (e.isBoss || (Math.random() < 0.07 * dropMult && this.state.powerUps.length < 4)) {
      this.spawnPowerUp(e.x, e.y);
    }

    const charId = this.backpack.config.characterId;

    // Kagutsuchi (fire_lord): 20% chance kills explode in flames
    if (charId === 'fire_lord' && Math.random() < 0.2) {
      const blastDmg = 12 + this.state.wave * 0.5;
      for (const other of this.state.enemies) {
        if (other === e || other.phased) continue;
        const dx = other.x - e.x;
        const dy = other.y - e.y;
        if (Math.sqrt(dx * dx + dy * dy) < 55) {
          other.hp -= blastDmg;
          this.state.damageDealtThisSecond += blastDmg;
        }
      }
      this.spawnFloatingText(e.x, e.y - 10, '🔥BOOM', '#f97316');
    }

    // Frank (storm_runner): every 10 kills, radioactive pulse hits everything
    if (charId === 'storm_runner' && this.state.killedEnemyIds.length % 10 === 0) {
      const pulseDmg = 10 + this.state.wave * 0.6;
      for (const other of this.state.enemies) {
        if (other.phased) continue;
        other.hp -= pulseDmg;
        this.state.damageDealtThisSecond += pulseDmg;
      }
      this.spawnFloatingText(this.state.playerX, this.arenaHeight - 100, '☢ PULSO RADIOATIVO!', '#a3e635');
      this.triggerShake(5, 0.25);
    }

    // Explode on death (enemy's own explode ability) — only hits the player
    // if actually within blast radius; previously ignored radius entirely
    // and always hit the player no matter how far away the enemy died.
    if (e.explodeOnDeath && e.special?.type === 'explode') {
      const playerY = this.arenaHeight - 45;
      const dist = Math.hypot(this.state.playerX - e.x, playerY - e.y);
      if (dist < e.special.radius) {
        this.damagePlayer(e.special.damage);
      }
      this.triggerShake(6, 0.3);
      this.spawnFloatingText(e.x, e.y, 'BOOM!', '#ef4444');
    }

    // Elite affix: volatile — bursts into a fan of projectiles on death
    if ((e as any).affix === 'volatile') {
      for (let a = 0; a < 3; a++) {
        const ang = Math.PI * (0.3 + 0.2 * a); // downward fan
        this.state.enemyProjectiles.push({
          id: `eproj_${this.nextEnemyProjId++}`,
          x: e.x,
          y: e.y,
          vx: Math.cos(ang) * 150,
          vy: Math.sin(ang) * 150,
          damage: Math.ceil(e.damage * 0.35),
          alive: true,
          tags: e.tags,
        });
      }
      this.spawnFloatingText(e.x, e.y - 10, '💥 VOLÁTIL', '#f97316');
    }

    // Elite affix: split — bursts into two weaker copies on death
    if ((e as any).affix === 'split' && this.state.enemies.length < 60) {
      for (let s = -1; s <= 1; s += 2) {
        this.state.enemies.push({
          ...e,
          id: `enemy_${this.nextEnemyId++}`,
          x: Math.max(20, Math.min(this.arenaWidth - 20, e.x + s * 30)),
          hp: Math.max(1, Math.floor(e.maxHp * 0.3)),
          maxHp: Math.max(1, Math.floor(e.maxHp * 0.3)),
          width: Math.floor(e.width * 0.7),
          height: Math.floor(e.height * 0.7),
          goldReward: Math.max(1, Math.floor(e.goldReward * 0.3)),
          speed: e.baseSpeed * 1.2,
          baseSpeed: e.baseSpeed * 1.2,
          moveDir: s,
        } as Enemy);
        const copy = this.state.enemies[this.state.enemies.length - 1] as any;
        copy.affix = undefined;
        copy.isElite = false;
        this.state.totalEnemies++;
      }
      this.spawnFloatingText(e.x, e.y - 10, '🧬 DIVISÃO!', '#f472b6');
    }

    // Card: Kills Explosivas (all kills explode)
    const explodeDmg = (this as any)._explodeOnKillDamage ?? (this as any)._explodeOnKill ?? 0;
    if (explodeDmg > 0) {
      const aoeRadius = 60;
      for (const other of this.state.enemies) {
        if (other === e) continue;
        const dx = other.x - e.x;
        const dy = other.y - e.y;
        if (Math.sqrt(dx * dx + dy * dy) < aoeRadius) {
          other.hp -= explodeDmg;
          this.state.damageDealtThisSecond += explodeDmg;
        }
      }
    }

    // Split on death
    if (e.special?.type === 'split') {
      for (let s = 0; s < e.special.count; s++) {
        this.spawnChild(e, e.special.childId);
      }
    }

    // Boss kill = big feedback
    if (e.isBoss) {
      this.triggerHitStop(0.12);
      this.triggerShake(15, 0.8);
      // Dissecação (Diana): boss gold bonus multiplies further
      const bossGoldMult = (this as any)._bossGoldMult ?? 1;
      const bossBonus = Math.floor(goldReward * 3 * bossGoldMult);
      this.spawnFloatingText(e.x, e.y - 30, '★ BOSS DERROTADO! ★', '#fbbf24');
      this.spawnFloatingText(e.x, e.y, `+${bossBonus}g BONUS!`, '#fbbf24');
      this.state.gold += bossBonus;
      this.state.score += 500;
      (this.state as any)._bossKilledEffect = { x: e.x, y: e.y, timer: 1.0 };
    }

    // Necrose (Diana): death poisons nearby enemies
    const deathPoisonDur = (this as any)._deathPoison ?? 0;
    if (deathPoisonDur > 0) {
      const poisonDmg = 4 + this.state.wave * 0.3;
      for (const other of this.state.enemies) {
        if (other === e) continue;
        const dx = other.x - e.x, dy = other.y - e.y;
        if (Math.sqrt(dx * dx + dy * dy) < 70) {
          (other as any).poisonTimer = Math.max((other as any).poisonTimer ?? 0, deathPoisonDur);
          (other as any).poisonDamage = Math.max((other as any).poisonDamage ?? 0, poisonDmg);
        }
      }
    }

    // Reanimação (Diana): chance the corpse fights alongside you for 5s
    const reanimateChance = (this as any)._reanimate ?? 0;
    if (reanimateChance > 0 && !e.isBoss && Math.random() < reanimateChance) {
      this.spawnAllyTurret(e.x, e.y, 5, Math.max(5, e.damage * 0.6), 0.8, '#4ade80');
      this.spawnFloatingText(e.x, e.y - 15, '💀 REANIMADO', '#4ade80');
    }

    // Enxame Morto (Diana): every N kills, summon a permanent drone for the wave
    const dronePerKills = (this as any)._dronePerKills ?? 0;
    if (dronePerKills > 0) {
      this._droneKillCounter++;
      if (this._droneKillCounter >= dronePerKills) {
        this._droneKillCounter = 0;
        this.spawnAllyTurret(
          this.state.playerX + (Math.random() - 0.5) * 80, this.arenaHeight - 160,
          Infinity, 8 + this.state.wave * 0.4, 1.0, '#fbbf24'
        );
        this.spawnFloatingText(this.state.playerX, this.arenaHeight - 110, '🤖 DRONE!', '#fbbf24');
      }
    }

    // Fragmentação (Dr. Eon): death spawns friendly projectiles
    const deathProjCount = (this as any)._deathProjectiles ?? 0;
    if (deathProjCount > 0) {
      for (let dp = 0; dp < deathProjCount; dp++) {
        const ang = -Math.PI / 2 + (Math.random() - 0.5) * 1.4; // upward-ish spread
        this.state.projectiles.push({
          id: `proj_frag_${this.nextProjectileId++}`,
          x: e.x, y: e.y,
          vx: Math.cos(ang) * 320, vy: Math.sin(ang) * 320,
          damage: 6 + this.state.wave * 0.4, piercing: 0, aoeRadius: 0,
          tags: [], alive: true, trail: [],
        });
      }
    }

    // Combo streak messages
    if (this.state.combo === 5)  this.spawnFloatingText(this.state.playerX, this.arenaHeight - 90, 'FRENESI!', '#f97316');
    if (this.state.combo === 10) this.spawnFloatingText(this.state.playerX, this.arenaHeight - 90, 'IMPARÁVEL!', '#ef4444');
    if (this.state.combo === 15) this.spawnFloatingText(this.state.playerX, this.arenaHeight - 90, 'DEVASTADOR!', '#a855f7');
    if (this.state.combo === 25) this.spawnFloatingText(this.state.playerX, this.arenaHeight - 90, 'GENOCÍDIO!', '#fbbf24');
    if (this.state.combo === 35) this.spawnFloatingText(this.state.playerX, this.arenaHeight - 90, 'EXTERMINADOR!', '#f97316');
    if (this.state.combo === 50) this.spawnFloatingText(this.state.playerX, this.arenaHeight - 90, '★ LENDÁRIO! ★', '#fbbf24');
    if (this.state.combo === 75) this.spawnFloatingText(this.state.playerX, this.arenaHeight - 90, '⚡ CALAMIDADE! ⚡', '#facc15');
    if (this.state.combo === 100) this.spawnFloatingText(this.state.playerX, this.arenaHeight - 90, '☠ APOCALIPSE! ☠', '#ef4444');

    this.state.enemies.splice(index, 1);
  }

  private applyAoE(x: number, y: number, radius: number, damage: number): void {
    for (const e of this.state.enemies) {
      if (e.phased) continue; // Skip phased enemies
      const dx = e.x - x;
      const dy = e.y - y;
      if (Math.sqrt(dx * dx + dy * dy) < radius) {
        e.hp -= damage;
        this.state.damageDealtThisSecond += damage;
      }
    }
    // Remove dead
    for (let i = this.state.enemies.length - 1; i >= 0; i--) {
      if (this.state.enemies[i].hp <= 0) {
        this.killEnemy(this.state.enemies[i], i);
      }
    }
  }

  private checkEnemyReachBottom(): void {
    for (let i = this.state.enemies.length - 1; i >= 0; i--) {
      const enemy = this.state.enemies[i];
      // Bosses never despawn at the bottom — diving bosses dip low on purpose
      // and must return, not get removed with a free damage tick.
      if (enemy.isBoss) continue;
      if (enemy.y > this.arenaHeight - 30) {
        // Card: Escudo Ofensivo — enemies take damage when touching player
        if ((this as any)._contactDamageAmount) {
          enemy.hp -= (this as any)._contactDamageAmount;
          this.spawnFloatingText(enemy.x, enemy.y - 10, `${(this as any)._contactDamageAmount}`, '#fbbf24');
          if (enemy.hp <= 0) {
            this.killEnemy(enemy, i);
            continue;
          }
        }
        // CO-OP: whichever player the enemy is closer to takes the hit
        if (this.state.player2Active && this.state.player2X !== undefined &&
            Math.abs(enemy.x - this.state.player2X) < Math.abs(enemy.x - this.state.playerX)) {
          this.damagePlayer2(enemy.damage);
        } else {
          this.damagePlayer(enemy.damage);
        }
        this.state.enemies.splice(i, 1);
      }
    }
  }

  private applyHealing(dt: number): void {
    const power = this.backpack.calculateBackpackPower();
    // Item-based healing (Dr. Eon: all healing halved — body barely anchored to this plane)
    if (power.totalHeal > 0) {
      let healMult = this.backpack.config.characterId === 'void_walker' ? 0.5 : 1;
      // Santo Graal: multiplies all item-sourced healing (1.2 = +20%)
      for (const it of this.backpack.getAllItems()) {
        if ((it.state as any).healBonus) healMult *= (it.state as any).healBonus;
      }
      this.state.playerHp = Math.min(this.state.playerMaxHp, this.state.playerHp + power.totalHeal * healMult * dt);
    }

    // Shield regeneration (after 3s without taking damage)
    if (this.state.shieldRegenDelay > 0) {
      this.state.shieldRegenDelay -= dt;
    } else if (this.state.playerShield < this.state.playerMaxShield) {
      // Barreira Extra / Fôlego Extra cards: faster and/or flat-boosted regen
      const regenMult = (this as any)._shieldRegenMult ?? 1;
      const regenFlat = (this as any)._shieldRegenFlat ?? 0;
      this.state.playerShield = Math.min(
        this.state.playerMaxShield,
        this.state.playerShield + (5 * regenMult + regenFlat) * dt // base 5 shield/s regen
      );
    }

    // Escudo Regenerativo: emergency shield once per wave when HP drops low
    const regenShieldAmount = (this as any)._regenShield ?? 0;
    if (regenShieldAmount > 0 && !this.state.regenShieldUsed &&
        this.state.playerHp / this.state.playerMaxHp < 0.3) {
      this.state.regenShieldUsed = true;
      this.state.playerShield = Math.min(this.state.playerMaxShield + regenShieldAmount, this.state.playerShield + regenShieldAmount);
      this.state.playerMaxShield = Math.max(this.state.playerMaxShield, this.state.playerShield);
      this.spawnFloatingText(this.state.playerX, this.arenaHeight - 90, '🛡 ESCUDO DE EMERGÊNCIA!', '#38bdf8');
      this.triggerShake(4, 0.2);
    }
  }

  /** Apply character-specific passive effects each tick */
  private applyCharacterPassives(dt: number): void {
    const charId = this.backpack.config.characterId;

    switch (charId) {
      case 'fire_lord':
        // Passive drain never kills on its own (stops at 1 HP)
        this.state.playerHp = Math.max(1, this.state.playerHp - 1 * dt);
        break;
      case 'aqua_sage': {
        const regenRate = this.state.playerHp / this.state.playerMaxHp < 0.5 ? 4 : 2;
        this.state.playerHp = Math.min(this.state.playerMaxHp, this.state.playerHp + regenRate * dt);
        break;
      }
      case 'void_walker':
        this.state.playerHp = Math.max(1, this.state.playerHp - 1.5 * dt);
        break;
      case 'grass_man': {
        // Rômulo: each [Planta] item heals 1 HP/s
        const plantas = this.backpack.getAllItems().filter(i => i.definition.tags.includes('Planta')).length;
        if (plantas > 0) {
          this.state.playerHp = Math.min(this.state.playerMaxHp, this.state.playerHp + plantas * dt);
        }
        break;
      }
    }

    // Permanent heal per second from cards (_permanentHealPerSec)
    const permHeal = (this as any)._permanentHealPerSec ?? 0;
    if (permHeal !== 0) {
      this.state.playerHp = Math.max(1, Math.min(this.state.playerMaxHp, this.state.playerHp + permHeal * dt));
    }

    // Heat Wave card: inimigos perdem HP/s
    const heatDps = (this as any)._heatWaveDps ?? 0;
    if (heatDps > 0) {
      for (const e of this.state.enemies) {
        e.hp -= heatDps * dt;
      }
    }

    // Aura DPS (Radiação Passiva card)
    const auraDps = (this as any)._auraBaseDps ?? 0;
    if (auraDps > 0) {
      const auraRadius = 150;
      for (const e of this.state.enemies) {
        const dx = e.x - this.state.playerX;
        const dy = e.y - (this.arenaHeight - 40);
        if (Math.sqrt(dx * dx + dy * dy) < auraRadius) {
          e.hp -= auraDps * dt;
        }
      }
    }

    // Gravity Pull card
    const gravPull = (this as any)._gravityPull ?? 0;
    if (gravPull > 0) {
      const cx = this.arenaWidth / 2;
      const cy = this.arenaHeight * 0.4;
      for (const e of this.state.enemies) {
        const dx = cx - e.x;
        const dy = cy - e.y;
        const dist = Math.max(1, Math.sqrt(dx * dx + dy * dy));
        e.x += (dx / dist) * gravPull * dt;
        e.y += (dy / dist) * gravPull * dt;
      }
    }

    // Singularidade (Dr. Eon): periodic black hole pulse — strong pull for a burst
    const blackHoleInterval = (this as any)._blackHoleInterval ?? 0;
    if (blackHoleInterval > 0) {
      this._blackHoleTimer += dt;
      if (this._blackHoleTimer >= blackHoleInterval) {
        this._blackHoleTimer = 0;
        this._blackHoleActive = 2.0;
        this.spawnFloatingText(this.state.playerX, this.arenaHeight - 100, '🕳 SINGULARIDADE!', '#a855f7');
        this.triggerShake(6, 0.4);
      }
    }
    if (this._blackHoleActive > 0) {
      this._blackHoleActive -= dt;
      const cx = this.arenaWidth / 2;
      const cy = this.arenaHeight * 0.35;
      for (const e of this.state.enemies) {
        const dx = cx - e.x, dy = cy - e.y;
        const dist = Math.max(1, Math.sqrt(dx * dx + dy * dy));
        e.x += (dx / dist) * 120 * dt;
        e.y += (dy / dist) * 120 * dt;
      }
    }

    // Execute threshold (Olhar do Vazio card)
    const execThresh = (this as any)._executeThreshold ?? 0;
    if (execThresh > 0) {
      for (let i = this.state.enemies.length - 1; i >= 0; i--) {
        const e = this.state.enemies[i];
        if (!e.isBoss && e.hp / e.maxHp < execThresh) {
          this.killEnemy(e, i);
        }
      }
    }

    // EMP card (pulso_emp): paralyze all enemies every N seconds
    const empInterval = (this as any)._empInterval ?? 0;
    if (empInterval > 0) {
      (this as any)._empTimer = ((this as any)._empTimer ?? 0) + dt;
      if ((this as any)._empTimer >= empInterval) {
        (this as any)._empTimer = 0;
        for (const e of this.state.enemies) {
          e.slowTimer = 1.0;
          e.slowAmount = 0.05;
        }
        this.spawnFloatingText(this.state.playerX, this.arenaHeight - 80, 'EMP!', '#facc15');
        this.triggerShake(3, 0.2);
      }
    }

    // Lightning interval card (tempestade)
    const lightningInterval = (this as any)._lightningInterval ?? 0;
    if (lightningInterval > 0) {
      (this as any)._lightningTimer = ((this as any)._lightningTimer ?? 0) + dt;
      if ((this as any)._lightningTimer >= lightningInterval) {
        (this as any)._lightningTimer = 0;
        for (let bolt = 0; bolt < 3; bolt++) {
          const target = this.state.enemies[Math.floor(Math.random() * this.state.enemies.length)];
          if (target) {
            const dmg = 15 + this.state.wave;
            target.hp -= dmg;
            this.spawnFloatingText(target.x, target.y - 10, `⚡${dmg}`, '#facc15');
          }
        }
      }
    }

    // Global slow applied to enemies (from _globalSlow flag set by cards/startCombat)
    const slowMult = (this as any)._globalSlowMult ?? 1;
    if (slowMult < 1) {
      for (const e of this.state.enemies) {
        e.speed = e.baseSpeed * slowMult;
      }
    }

    // Damage reflect (Inversão card)
    const reflect = (this as any)._damageReflect ?? 0;
    if (reflect > 0 && this.state.playerFlashTimer > 0.14) {
      const reflectDmg = 5 * reflect;
      const nearest = this.state.enemies[0];
      if (nearest) {
        nearest.hp -= reflectDmg;
        this.spawnFloatingText(nearest.x, nearest.y, `↩${Math.floor(reflectDmg)}`, '#a78bfa');
      }
    }

    // Poison DoT processing
    for (let i = this.state.enemies.length - 1; i >= 0; i--) {
      const e = this.state.enemies[i];
      if ((e as any).poisonTimer > 0) {
        (e as any).poisonTimer -= dt;
        const poisonDmg = ((e as any).poisonDamage ?? 2) * dt;
        e.hp -= poisonDmg;
        this.state.damageDealtThisSecond += poisonDmg;
        if (e.hp <= 0) this.killEnemy(e, i);
      }
    }

    // Dead enemy cleanup after passives
    for (let i = this.state.enemies.length - 1; i >= 0; i--) {
      if (this.state.enemies[i].hp <= 0) this.killEnemy(this.state.enemies[i], i);
    }
  }

  /** Apply special passive effects from items in the backpack */
  private itemPassiveTimer = 0;
  private applyItemPassives(dt: number): void {
    this.itemPassiveTimer += dt;

    const items = this.backpack.getAllItems();
    for (const item of items) {
      // EMP Generator: paralyze all enemies periodically
      if (item.state.empInterval && item.state.empInterval > 0) {
        if (this.itemPassiveTimer % item.state.empInterval < dt) {
          const duration = item.state.empDuration ?? 1;
          for (const e of this.state.enemies) {
            e.slowTimer = duration;
            e.slowAmount = 0.05; // Near-frozen
          }
          this.spawnFloatingText(this.state.playerX, this.arenaHeight - 80, 'EMP!', '#facc15');
          this.triggerShake(3, 0.1);
        }
      }

      // Mina de Ouro: passive gold generation during combat
      if (item.state.goldPerSecond) {
        item.state.goldAccum = (item.state.goldAccum ?? 0) + item.state.goldPerSecond * dt;
        if (item.state.goldAccum >= 1) {
          const whole = Math.floor(item.state.goldAccum);
          item.state.goldAccum -= whole;
          this.state.gold += whole;
        }
      }

      // Reparo de Emergência: below 20% HP, heal 30 (once per wave)
      if (item.state.emergencyHeal && item.state.emergencyThreshold &&
          !(item.state as any)._emergencyHealUsed &&
          this.state.playerHp / this.state.playerMaxHp < item.state.emergencyThreshold) {
        (item.state as any)._emergencyHealUsed = 1;
        this.state.playerHp = Math.min(this.state.playerMaxHp, this.state.playerHp + item.state.emergencyHeal);
        this.spawnFloatingText(this.state.playerX, this.arenaHeight - 95, '🔧 REPARO!', '#4ade80');
      }

      // Gravity Anchor: slow enemies near player
      if (item.state.slowAura && item.state.slowRadius) {
        for (const e of this.state.enemies) {
          const dx = e.x - this.state.playerX;
          const dy = e.y - (this.arenaHeight - 40);
          if (Math.sqrt(dx * dx + dy * dy) < item.state.slowRadius) {
            e.speed = e.baseSpeed * (1 - item.state.slowAura);
          }
        }
      }

      // Fire Shield: damage enemies when player takes damage (tracked via flash)
      if (item.state.reflectDamage && this.state.playerFlashTimer > 0.14) {
        for (const e of this.state.enemies) {
          const dx = e.x - this.state.playerX;
          const dy = e.y - (this.arenaHeight - 40);
          if (Math.sqrt(dx * dx + dy * dy) < (item.state.reflectRadius ?? 60)) {
            e.hp -= item.state.reflectDamage * dt * 10;
          }
        }
      }

      // Emergency Shield: auto-shield at low HP
      if (item.state.emergencyThreshold && item.state.shieldAmount) {
        const hpPct = this.state.playerHp / this.state.playerMaxHp;
        if (hpPct < item.state.emergencyThreshold && !item.state.shieldUsed) {
          this.state.playerHp += item.state.shieldAmount;
          this.state.playerMaxHp += item.state.shieldAmount;
          item.state.shieldUsed = 1;
          this.spawnFloatingText(this.state.playerX, this.arenaHeight - 100, 'ESCUDO!', '#6366f1');
        }
      }

      // Golden Egg: +5 gold at wave start (only once per wave)
      if (item.state.waveStartGold && !item.state.waveGoldGiven && this.state.waveTime < 0.5) {
        this.state.gold += item.state.waveStartGold;
        item.state.waveGoldGiven = 1;
        this.spawnFloatingText(this.state.playerX + 30, this.arenaHeight - 60, `+${item.state.waveStartGold}g`, '#fbbf24');
      }

      // Overload Capacitor: discharge after kills
      if (item.state.killsToDischarge && item.state.dischargeDamage) {
        const killsSinceStart = this.state.killedEnemyIds.length;
        if (killsSinceStart > 0 && killsSinceStart % item.state.killsToDischarge === 0 &&
            this.state.waveTime - (item.state.lastDischarge ?? 0) > 1) {
          item.state.lastDischarge = this.state.waveTime;
          // Damage all enemies
          for (const e of this.state.enemies) {
            e.hp -= item.state.dischargeDamage;
          }
          // Remove dead
          for (let i = this.state.enemies.length - 1; i >= 0; i--) {
            if (this.state.enemies[i].hp <= 0) {
              this.killEnemy(this.state.enemies[i], i);
            }
          }
          this.spawnFloatingText(this.state.playerX, this.arenaHeight - 100, 'DESCARGA!', '#facc15');
          this.triggerShake(5, 0.2);
        }
      }
    }
  }

  private updateFloatingTexts(dt: number): void {
    for (let i = this.state.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.state.floatingTexts[i];
      ft.y -= 40 * dt;
      ft.life -= dt;
      if (ft.life <= 0) {
        this.state.floatingTexts.splice(i, 1);
      }
    }
  }

  private updateShake(dt: number): void {
    if (this.state.shakeDuration > 0) {
      this.state.shakeTimer += dt;
      if (this.state.shakeTimer >= this.state.shakeDuration) {
        this.state.shakeDuration = 0;
        this.state.shakeTimer = 0;
        this.state.shakeIntensity = 0;
      }
    }
  }

  spawnFloatingText(x: number, y: number, text: string, color: string): void {
    // Cap floating texts to avoid memory issues
    if (this.state.floatingTexts.length > 30) {
      this.state.floatingTexts.shift();
    }
    this.state.floatingTexts.push({ x, y, text, color, life: 1.0, maxLife: 1.0 });
  }

  private rectCollision(
    x1: number, y1: number, w1: number, h1: number,
    x2: number, y2: number, w2: number, h2: number
  ): boolean {
    return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
  }

  /** Calculate total crit chance from all items */
  private getCritChance(): number {
    let crit = 0;
    for (const item of this.backpack.getAllItems()) {
      if (item.state.critChance) {
        crit += item.state.critChance;
      }
    }
    // Void Walker passive: +20% crit chance
    if (this.backpack.config.characterId === 'void_walker') crit += 0.20;
    // Wave event crit bonus
    crit += (this as any)._waveEventCritBonus ?? 0;
    // Relic crit bonus (Broca do Sargento)
    crit += (this as any)._relicCrit ?? 0;
    return Math.min(0.8, crit); // Cap at 80%
  }

  /** Strongest crit multiplier granted by any item (Núcleo Crítico sets 3);
   * falls back to the original flat 2x when nothing in the backpack sets one. */
  private getCritMultiplier(): number {
    let mult = 2;
    for (const item of this.backpack.getAllItems()) {
      if (item.state.critMultiplier) {
        mult = Math.max(mult, item.state.critMultiplier);
      }
    }
    return mult;
  }

  /** Spawn position for enemy #i in a given formation (above the arena) */
  private formationPos(formation: string, i: number): { x: number; y: number } {
    const W = this.arenaWidth;
    const cx = W / 2;
    const jitter = Math.random() * 16 - 8;
    let x: number, y: number;
    switch (formation) {
      case 'v': { // wedge opening downward, tip first
        const row = Math.floor(i / 2);
        const side = i % 2 === 0 ? -1 : 1;
        x = cx + side * (36 + row * 46);
        y = -40 - row * 50;
        break;
      }
      case 'wall': { // broad rows marching together
        const perRow = 14;
        x = 60 + (i % perRow) * ((W - 120) / (perRow - 1));
        y = -40 - Math.floor(i / perRow) * 120;
        break;
      }
      case 'pincer': { // two tight flanking columns
        const side = i % 2 === 0 ? -1 : 1;
        const idx = Math.floor(i / 2);
        x = side === -1 ? 80 + (idx % 2) * 64 : W - 80 - (idx % 2) * 64;
        y = -40 - Math.floor(idx / 2) * 62;
        break;
      }
      case 'columns': { // four lanes down the middle
        x = cx + ((i % 4) - 1.5) * 150;
        y = -40 - Math.floor(i / 4) * 58;
        break;
      }
      default: { // grid — the classic
        x = 80 + (i % 10) * Math.floor((W - 160) / 10) + Math.random() * 20;
        y = -40 - Math.floor(i / 10) * 70 - Math.random() * 30;
        break;
      }
    }
    return { x: Math.max(40, Math.min(W - 40, x + jitter)), y };
  }

  private generateWave(
    totalMonths: number, isBossMonth: boolean = false, isMegaBossMonth: boolean = false,
    normalVariant: string | null = null, bossVariant: string | null = null, characterId: string = '',
  ): Enemy[] {
    // Copycat: a single mirror enemy built from the player's own build —
    // skip the entire trash-mob/boss spawn pipeline below, this wave is a
    // pure 1v1.
    if (isBossMonth && !isMegaBossMonth && bossVariant === 'copycat') {
      return [this.generateCopycatMirror(totalMonths, characterId)];
    }

    const enemies: Enemy[] = [];

    // Map totalMonths to a "virtual wave" for enemy pool access
    // Month 1-6: only basic enemies (minWave 1-3)
    // Month 7-12: introduce elementals, shooters (minWave 4-6)
    // Year 2: all types (minWave 7-8)
    // Year 3+: everything
    const virtualWave = Math.min(20, Math.ceil(totalMonths * 0.6));
    let available = getEnemiesForWave(virtualWave);

    // Frostbite: everything on screen this wave reads as an ice enemy. The
    // canon "Gelo"-tagged roster is only 2 entries (too thin to fill a whole
    // wave on its own), so they're weighted heavily and the rest of the
    // usual pool fills the gaps — the renderer applies a frost tint to every
    // enemy this wave regardless of source, so it still reads as "only ice".
    const iceEnemies = available.filter(e => e.tags.includes('Gelo'));
    if (normalVariant === 'frostbite' && iceEnemies.length > 0) {
      available = [...iceEnemies, ...iceEnemies, ...iceEnemies, ...available];
    }

    // Difficulty curve based on timeline era
    const year = Math.ceil(totalMonths / 12);
    const monthInYear = ((totalMonths - 1) % 12) + 1;

    // Enemy count scales: more enemies as time passes. Year 2+ follows a
    // continuous accelerating curve anchored to month 12 (see
    // continuousYearScale) so there's no discontinuity at year boundaries.
    let count = computeWaveCount(totalMonths);
    count = Math.floor(count * ((this as any)._anomalyCountMult ?? 1));

    // Spawn formation: readable shape variety instead of always the same
    // 10-wide grid. Deep shapes are only used for small/medium waves.
    const formationPool = count > 34 ? ['grid', 'grid', 'wall']
      : count > 24 ? ['grid', 'grid', 'wall', 'pincer', 'columns']
      : ['grid', 'grid', 'v', 'wall', 'pincer', 'columns'];
    const formation = formationPool[Math.floor(Math.random() * formationPool.length)];

    // HP scaling based on era. Year 2+ follows the same continuous
    // accelerating curve as enemy count, anchored to month 12, so there's
    // no spike or regression at year boundaries (e.g. the old formula
    // spiked +38% at month 24→25 and then regressed at every boundary
    // from month 36→37 onward).
    let hpScale: number;
    if (totalMonths <= 6) {
      hpScale = 1 + totalMonths * 0.1; // 1.1 - 1.6
    } else if (totalMonths <= 12) {
      hpScale = 1.5 + (totalMonths - 6) * 0.2; // 1.7 - 2.7
    } else {
      hpScale = continuousYearScale(totalMonths, 12, 2.7, 0.3, 0.1);
    }
    hpScale *= (this as any)._anomalyHpMult ?? 1;

    // Weighted random selection
    const weightedPool: EnemyDefinition[] = [];
    for (const def of available) {
      for (let i = 0; i < def.weight; i++) {
        weightedPool.push(def);
      }
    }

    for (let i = 0; i < count; i++) {
      const def = weightedPool.length > 0
        ? weightedPool[Math.floor(Math.random() * weightedPool.length)]
        : available[0] || {
          id: 'scout', name: 'Scout', tags: [] as Tag[], hp: 10, speed: 40,
          damage: 5, width: 16, height: 16, goldReward: 2, armor: 0,
          movement: 'straight' as const, spriteId: 'scout', minWave: 1, weight: 10,
        };

      // Speed: slower in early months, ramps up
      let baseSpeed: number;
      if (totalMonths <= 6) {
        baseSpeed = Math.max(20, def.speed * 0.5);
      } else if (totalMonths <= 12) {
        baseSpeed = def.speed * (0.7 + (totalMonths - 6) * 0.05);
      } else {
        baseSpeed = def.speed * (1 + (year - 1) * 0.1);
      }
      baseSpeed *= (this as any)._anomalySpeedMult ?? 1;

      // Elite chance: 10% per enemy after month 6, increases over time
      const eliteChance = (totalMonths > 6 ? Math.min(0.25, 0.05 + totalMonths * 0.005) : 0)
        + ((this as any)._anomalyEliteBonus ?? 0);
      const isElite = Math.random() < eliteChance;
      const eliteMult = isElite ? 2.5 : 1;
      const eliteGoldMult = isElite ? 3 : 1;

      const pos = this.formationPos(formation, i);
      enemies.push({
        id: `enemy_${this.nextEnemyId++}`,
        x: pos.x,
        y: pos.y,
        hp: Math.floor(def.hp * hpScale * eliteMult),
        maxHp: Math.floor(def.hp * hpScale * eliteMult),
        speed: baseSpeed * (isElite ? 1.2 : 1),
        damage: (def.damage + Math.floor(totalMonths * 0.4)) * (isElite ? 1.5 : 1),
        tags: [...def.tags],
        width: Math.floor(def.width * (isElite ? 1.3 : 1)),
        height: Math.floor(def.height * (isElite ? 1.3 : 1)),
        goldReward: Math.floor(def.goldReward * eliteGoldMult * ((this as any)._anomalyGoldMult ?? 1)),
        shootTimer: def.special?.type === 'shoot' ? 1 / def.special.fireRate : 2,
        special: def.special,
        isBoss: false,
        movement: def.movement,
        armorHits: def.special?.type === 'armor' ? (def.special.hits + (isElite ? 2 : 0)) : undefined,
        phased: false,
        phaseTimer: def.special?.type === 'phase' ? 1.5 + Math.random() * 2.0 : undefined,
        spawnTimer: def.special?.type === 'spawn' ? def.special.interval : undefined,
        moveTimer: Math.random() * 5,
        moveDir: Math.random() > 0.5 ? 1 : -1,
        explodeOnDeath: def.special?.type === 'explode',
        baseSpeed: baseSpeed * (isElite ? 1.2 : 1),
        defId: def.id,
        ...(isElite ? { charging: false } : {}), // Elite flag via charging field reuse
      } as any);
      // Mark elite in state for rendering + roll a visible affix
      if (isElite) {
        const elite = enemies[enemies.length - 1] as any;
        elite.isElite = true;
        const affixes = ['regen', 'armored', 'volatile', 'swift', 'split'];
        elite.affix = affixes[Math.floor(Math.random() * affixes.length)];
        if (elite.affix === 'armored') {
          elite.armorHits = (elite.armorHits ?? 0) + 3;
        }
        if (elite.affix === 'swift') {
          elite.speed *= 1.5;
          elite.baseSpeed *= 1.5;
        }
      }
    }

    // Boss spawning: uses timeline schedule. Regular boss months (3/6/9) and
    // the mega-boss month (12) draw from separate pools with independent
    // encounter counters, so rotating through REGULAR_BOSSES doesn't skip
    // entries just because Zyr-Goth also showed up that year, and Zyr-Goth's
    // own repeat-mutation escalation doesn't depend on how many regular
    // bosses have been fought.
    if (isBossMonth) {
      let bossSource: EnemyDefinition;
      let encounterCount: number;
      let lapDivisor: number;
      if (isMegaBossMonth) {
        this._megaBossEncounterCount++;
        encounterCount = this._megaBossEncounterCount;
        bossSource = getMegaBossForEncounter(encounterCount);
        lapDivisor = MEGA_BOSSES.length;
      } else {
        this._bossEncounterCount++;
        encounterCount = this._bossEncounterCount;
        bossSource = getBossForEncounter(encounterCount);
        lapDivisor = REGULAR_BOSSES.length;
      }
      if (bossSource) {
        // Past the first full lap through the pool, apply a mutation so
        // repeats feel different instead of just numerically bigger. Each
        // further lap escalates that SAME mutation's own multipliers too —
        // otherwise a lap-1 and a lap-10 fight are mechanically identical,
        // just with bigger HP from the ambient year scaling above. Capped at
        // +4 stacks (lap 5+) so it stays fair instead of spiraling forever.
        // (With only one mega boss in the pool today, every repeat year is
        // its own lap — Zyr-Goth mutates every single return until more
        // mega bosses join MEGA_BOSSES and dilute the rotation.)
        const lap = Math.floor((encounterCount - 1) / lapDivisor);
        const mutation = lap >= 1 ? BOSS_MUTATIONS[Math.floor(Math.random() * BOSS_MUTATIONS.length)] : null;
        const mutationTier = mutation ? Math.min(4, lap - 1) : 0;
        const mutationEsc = 1 + mutationTier * 0.12;

        // Exponential HP scaling: each year multiplies base by ~1.4x
        const baseHp = Math.floor(300 + totalMonths * 55 + (year - 1) * totalMonths * 18);
        const baseDamage = bossSource.damage + Math.floor(totalMonths * 0.8);
        const baseSpeed = bossSource.speed * (1 + (year - 1) * 0.1);
        const bossHp = mutation ? Math.floor(baseHp * mutation.hpMult * mutationEsc) : baseHp;
        const bossDamage = mutation ? Math.floor(baseDamage * mutation.dmgMult * mutationEsc) : baseDamage;
        // Speed escalates gently (half rate) — a boss that's both faster
        // AND stacked-tough shouldn't also outrun the player's dash
        const bossSpeed = mutation ? baseSpeed * mutation.speedMult * (1 + mutationTier * 0.06) : baseSpeed;
        const baseArmor = bossSource.special?.type === 'armor' ? bossSource.special.hits : 0;
        const totalArmor = baseArmor + (mutation ? mutation.extraArmor + mutationTier * 2 : 0);

        enemies.push({
          id: `enemy_${this.nextEnemyId++}`,
          x: this.arenaWidth / 2,
          y: -60,
          hp: bossHp,
          maxHp: bossHp,
          speed: bossSpeed,
          damage: bossDamage,
          tags: [...bossSource.tags],
          width: bossSource.width,
          height: bossSource.height,
          goldReward: Math.floor((bossSource.goldReward + totalMonths * 2) * (mutation ? 1.5 + mutationTier * 0.15 : 1)),
          shootTimer: bossSource.special?.type === 'shoot' ? 1 / bossSource.special.fireRate : 2,
          special: bossSource.special,
          isBoss: true,
          movement: bossSource.movement,
          armorHits: totalArmor > 0 ? totalArmor : undefined,
          phased: false,
          phaseTimer: bossSource.special?.type === 'phase' ? 3.0 : undefined,
          spawnTimer: bossSource.special?.type === 'spawn' ? bossSource.special.interval : undefined,
          moveTimer: 0,
          moveDir: 1,
          explodeOnDeath: bossSource.special?.type === 'explode',
          baseSpeed: bossSpeed,
          defId: bossSource.id,
        });

        // Always show the boss's lore name in combat (the Renderer's fallback
        // is the English defId, which clashes with the PT-BR universe)
        const spawned = enemies[enemies.length - 1] as any;
        spawned.displayName = bossSource.name.toUpperCase();
        if (mutation) {
          spawned.affix = mutation.affix;
          const stars = mutationTier > 0 ? ' ' + '★'.repeat(mutationTier) : '';
          spawned.displayName = `${bossSource.name.toUpperCase()} (${mutation.suffix}${stars})`;
        }

        // Zyr-Goth is a screen-tall colossus: parked in the upper-center with
        // a hitbox covering his torso/head, never moving — his brood does the
        // chasing. The entrance cutscene freezes combat while he rises.
        if (bossSource.id === 'boss_epoch') {
          spawned.y = 250;
          spawned.speed = 0;
          spawned.baseSpeed = 0;
          spawned.width = 360;
          spawned.height = 380;
          spawned.explodeOnDeath = false;
          this.bossCinematic = 3.4;
          this.bossCinematicTotal = 3.4;
        }
      }
    }

    return enemies;
  }

  /** Copycat boss variant: a single enemy mirroring the player's own
   * character and current backpack build — 1.5x the player's max HP, damage
   * output derived from the player's own estimated DPS so the fight feels
   * like an even duel instead of a normal stat-scaled boss. */
  private generateCopycatMirror(totalMonths: number, characterId: string): Enemy {
    const power = this.backpack.calculateBackpackPower();
    const emitterCount = Math.max(1, power.emitters.length);
    const estDps = power.totalDamage * (power.totalFireRate / emitterCount) * power.totalProjectiles;
    const fireRate = Math.min(3, Math.max(0.5, power.totalFireRate / emitterCount));
    const perShotDamage = Math.max(4, estDps / Math.max(0.5, fireRate));
    const mirrorMaxHp = Math.floor(this.state.playerMaxHp * 1.5);

    const enemy: Enemy = {
      id: `enemy_${this.nextEnemyId++}`,
      x: this.arenaWidth / 2,
      y: 120,
      hp: mirrorMaxHp,
      maxHp: mirrorMaxHp,
      speed: 110,
      damage: Math.floor(perShotDamage),
      tags: [],
      width: 44,
      height: 60,
      goldReward: Math.floor(90 + totalMonths * 4),
      shootTimer: 1 / fireRate,
      special: { type: 'shoot', fireRate, projectileSpeed: 260 },
      isBoss: true,
      movement: 'zigzag',
      phased: false,
      moveTimer: 0,
      moveDir: Math.random() > 0.5 ? 1 : -1,
      baseSpeed: 110,
      // "boss_" prefix so the existing relic-drop / bossesKilled stat
      // tracking (which key off that prefix) picks this up like any other
      // boss kill, without needing a dedicated codex/lore entry.
      defId: 'boss_copycat',
      isCopycat: true,
    };
    (enemy as any).displayName = 'CÓPIA SOMBRIA';
    (enemy as any).copycatCharacterId = characterId;
    return enemy;
  }
}
