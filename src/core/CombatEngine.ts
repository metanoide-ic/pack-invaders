/**
 * COMBAT ENGINE — Space Invaders loop.
 * Processa emissores da mochila, gerencia projéteis, inimigos, e colisões.
 * Now with: player movement, enemy projectiles, difficulty curve, combo system.
 */

import { BackpackGrid, CombatPower } from './BackpackGrid';
import { ProjectileData, PlacedItem, Tag } from './ItemSystem';
import { getEnemiesForWave, getBossForWave, EnemyDefinition, ALL_ENEMIES } from '../data/enemies';

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
  // Co-op Player 2 state
  player2Active?: boolean;
  player2X?: number;
  player2Hp?: number;
  player2MaxHp?: number;
  player2DashCooldown?: number;
  player2DashVelocity?: number;
}

// ─── Combat Engine ───────────────────────────────────────────────────────────

export class CombatEngine {
  state: CombatState;
  private backpack: BackpackGrid;
  private nextProjectileId = 0;
  private nextEnemyId = 0;
  private nextEnemyProjId = 0;
  readonly arenaWidth = 1280;
  readonly arenaHeight = 720;
  private playerSpeed = 350;
  /** Dash cooldown */
  private dashCooldown = 0;
  private dashActive = 0;
  private playerVelocity2 = 0;

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

  startWave(wave: number, isBossMonth: boolean = false): void {
    this.state.wave = wave;
    this.state.isActive = true;
    this.state.waveCleared = false;
    this.state.enemies = this.generateWave(wave, isBossMonth);
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

    // 5. Move enemy projectiles
    this.updateEnemyProjectiles(dt);

    // 6. Check collisions (projectile vs enemy)
    this.checkCollisions();

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

    // 12. Update floating texts
    this.updateFloatingTexts(dt);

    // 13. Update shake
    this.updateShake(dt);

    // 13. Check win/lose
    if (this.state.enemies.length === 0) {
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
    const maxSpeed = this.playerSpeed * (this.dashActive > 0 ? 2.5 : 1);
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
      this.dashCooldown = 1.0;
      // Instant velocity boost in current direction
      if (this.playerVelocity !== 0) {
        this.playerVelocity = Math.sign(this.playerVelocity) * this.playerSpeed * 2.5;
      } else {
        // If standing still, dash in last input direction or right
        this.playerVelocity = this.playerSpeed * 2;
      }
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
    const emitters = this.backpack.getAllItems().filter(i =>
      i.definition.tags.includes('Emissor') || i.definition.tags.includes('Arma')
    );

    // Void Walker dynamic damage bonus based on missing HP
    let voidBonus = 1;
    if (this.backpack.config.characterId === 'void_walker') {
      const missingHp = this.state.playerMaxHp - this.state.playerHp;
      const bonusStacks = Math.min(10, Math.floor(missingHp / 10));
      voidBonus = 1 + bonusStacks * 0.1; // max +100%
    }

    // Skill-based multipliers (set externally by GameManager)
    const skillDmgMult = (this as any)._skillDamageMult ?? 1;
    const skillRateMult = (this as any)._skillFireRateMult ?? 1;

    for (const emitter of emitters) {
      if (emitter.definition.onTick) {
        // Apply skill rate multiplier temporarily
        const origRate = emitter.stats.fireRateMultiplier;
        emitter.stats.fireRateMultiplier *= skillRateMult;

        emitter.definition.onTick(emitter, dt, (proj) => {
          this.state.projectiles.push({
            id: `proj_${this.nextProjectileId++}`,
            x: this.state.playerX + (proj.x - 400) * 0.05,
            y: this.arenaHeight - 45,
            vx: proj.vx,
            vy: proj.vy,
            damage: proj.damage * voidBonus * skillDmgMult,
            piercing: proj.piercing,
            aoeRadius: proj.aoeRadius,
            tags: [...proj.tags],
            alive: true,
            trail: [],
          });
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
    for (const p of this.state.projectiles) {
      if (!p.alive) continue;

      // Store trail position
      p.trail.push({ x: p.x, y: p.y });
      if (p.trail.length > 3) p.trail.shift();

      // Homing behavior
      if (this._homingActive) {
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

      // Bouncy shots: bounce off left/right walls
      if ((this as any)._bouncyShots > 0) {
        if (p.x < 5) {
          p.x = 5;
          p.vx = Math.abs(p.vx);
          (p as any)._bounces = ((p as any)._bounces ?? 0) + 1;
        } else if (p.x > this.arenaWidth - 5) {
          p.x = this.arenaWidth - 5;
          p.vx = -Math.abs(p.vx);
          (p as any)._bounces = ((p as any)._bounces ?? 0) + 1;
        }
        // Kill after max bounces
        if (((p as any)._bounces ?? 0) > (this as any)._bouncyShots) {
          // Don't bounce anymore, let normal OOB check handle it
        }
      }

      // Remove if off-screen
      if (p.y < -20 || p.y > this.arenaHeight + 20 || p.x < -20 || p.x > this.arenaWidth + 20) {
        p.alive = false;
      }
    }
    this.state.projectiles = this.state.projectiles.filter(p => p.alive);
  }

  private updateEnemies(dt: number): void {
    for (const e of this.state.enemies) {
      e.moveTimer += dt;

      // Update slow timer
      if (e.slowTimer && e.slowTimer > 0) {
        e.slowTimer -= dt;
        if (e.slowTimer <= 0) {
          e.slowTimer = 0;
          e.slowAmount = undefined;
        }
      }

      // Update phase timer (for 'phase' special)
      if (e.phaseTimer !== undefined) {
        e.phaseTimer -= dt;
        if (e.phaseTimer <= 0) {
          e.phased = !e.phased;
          e.phaseTimer = e.phased ? 1.0 + Math.random() * 0.5 : 1.5 + Math.random() * 1.0;
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
      const speed = e.speed * slowMult * globalSlowMult;

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
          // Moves down slowly until reaching y=150, then charges toward player
          if (!e.charging && e.y < 150) {
            e.y += speed * 0.4 * dt;
          } else if (!e.charging) {
            // Lock onto player and begin charge
            e.charging = true;
            e.chargeTargetX = this.state.playerX;
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

      // Boss special movement: strafe at top while shooting
      if (e.isBoss && e.y > 60) {
        // Bosses hover at top area and strafe
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
            vx,
            vy,
            damage: Math.ceil(e.damage * 0.5),
            alive: true,
          });

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
                vx: Math.cos(spreadAngle) * spec.projectileSpeed,
                vy: Math.sin(spreadAngle) * spec.projectileSpeed,
                damage: Math.ceil(e.damage * 0.4),
                alive: true,
                bounces: 2, // Boss projectiles bounce off walls twice
              });
            }
          }
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
          const projSpeed = 180;
          this.state.enemyProjectiles.push({
            id: `eproj_${this.nextEnemyProjId++}`,
            x: e.x,
            y: e.y + e.height / 2,
            vx: dist > 0 ? (dx / dist) * projSpeed : 0,
            vy: dist > 0 ? (dy / dist) * projSpeed : projSpeed,
            damage: Math.ceil(e.damage * 0.4),
            alive: true,
          });
        }
      }
    }
  }

  private updateEnemyProjectiles(dt: number): void {
    for (const p of this.state.enemyProjectiles) {
      if (!p.alive) continue;
      p.x += p.vx * dt;
      p.y += p.vy * dt;

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
    const playerW = 32;
    const playerH = 32;
    const playerY = this.arenaHeight - 45;

    for (const p of this.state.enemyProjectiles) {
      if (!p.alive) continue;
      if (this.rectCollision(
        p.x - 4, p.y - 4, 8, 8,
        this.state.playerX - playerW / 2, playerY, playerW, playerH
      )) {
        p.alive = false;
        this.damagePlayer(p.damage);
      }
    }
  }

  private damagePlayer(amount: number): void {
    // Phase Shift immunity (set by skill system)
    if ((this as any)._phaseShiftActive) {
      this.spawnFloatingText(this.state.playerX, this.arenaHeight - 60, 'FASE!', '#a78bfa');
      return;
    }

    // Firefighter (Fênix): -25% damage taken while above 50% HP (guardian armor)
    if (this.backpack.config.characterId === 'firefighter') {
      if (this.state.playerHp > this.state.playerMaxHp * 0.5) {
        amount *= 0.75;
      }
    }

    // Shield absorbs damage first
    let remaining = amount;
    if (this.state.playerShield > 0) {
      const absorbed = Math.min(this.state.playerShield, remaining);
      this.state.playerShield -= absorbed;
      remaining -= absorbed;
      if (absorbed > 0 && remaining === 0) {
        this.spawnFloatingText(this.state.playerX + 20, this.arenaHeight - 50, `🛡-${absorbed}`, '#38bdf8');
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

    this.triggerPlayerFlash();
    this.triggerShake(5, 0.2);
    this.spawnFloatingText(this.state.playerX, this.arenaHeight - 60, `-${amount}`, '#ef4444');
  }

  private checkCollisions(): void {
    const charId = this.backpack.config.characterId;

    for (const p of this.state.projectiles) {
      if (!p.alive) continue;

      for (let i = this.state.enemies.length - 1; i >= 0; i--) {
        const e = this.state.enemies[i];

        // Skip phased enemies (they are invulnerable while phased)
        if (e.phased) continue;

        const hit = this.rectCollision(
          p.x - 4, p.y - 4, 8, 8,
          e.x - e.width / 2, e.y - e.height / 2, e.width, e.height
        );

        if (hit) {
          let damage = p.damage;

          // Armor system: reduce incoming hits
          if (e.armorHits !== undefined && e.armorHits > 0) {
            e.armorHits--;
            damage *= 0.3; // Heavily reduced damage while armored
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
            damage *= 2;
            isCrit = true;
            this.triggerHitStop(0.03); // Micro freeze on crit
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

          e.hp -= damage;
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

          // slow_on_hit special: this enemy slows projectiles/other enemies on hit
          if (e.special?.type === 'slow_on_hit') {
            // Slow the player (reduce player speed temporarily by applying a debuff)
            // For now we'll just note it as a slow on the floating text
            this.spawnFloatingText(e.x, e.y - e.height / 2, 'SLOW', '#67e8f9');
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
            this.killEnemy(e, i);
          }
          break;
        }
      }
    }
  }

  /** Handle enemy death — gold, score, combo, split, explode */
  private killEnemy(e: Enemy, index: number): void {
    // Track for codex
    this.state.killedEnemyIds.push(e.defId);

    // Gold reward scales with wave + combo bonus
    const comboBonus = 1 + Math.min(this.state.combo * 0.05, 1.0); // max +100% at 20 combo
    // Early game gold boost (waves 1-6 give +50% gold)
    const earlyBoost = this.state.wave <= 6 ? 1.5 : 1.0;
    let goldReward = Math.floor((e.goldReward + this.state.wave * 0.5) * comboBonus * earlyBoost);

    // Card: Drops de Sorte / gold_harvest (+gold per kill)
    const goldPerKill = (this as any)._goldPerKillAmount ?? (this as any)._goldPerKill ?? 0;
    if (goldPerKill > 0) goldReward += goldPerKill;

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

    // Floating gold text
    const goldText = comboBonus > 1.1 ? `+${goldReward}g (x${comboBonus.toFixed(1)})` : `+${goldReward}g`;
    this.spawnFloatingText(e.x, e.y, goldText, '#4ade80');

    // Explode on death (enemy's own explode ability)
    if (e.explodeOnDeath && e.special?.type === 'explode') {
      this.damagePlayer(e.special.damage);
      this.triggerShake(6, 0.3);
      this.spawnFloatingText(e.x, e.y, 'BOOM!', '#ef4444');
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
      this.spawnFloatingText(e.x, e.y - 30, '★ BOSS DERROTADO! ★', '#fbbf24');
      this.spawnFloatingText(e.x, e.y, `+${goldReward * 3}g BONUS!`, '#fbbf24');
      this.state.gold += goldReward * 3; // Triple gold bonus for boss
      this.state.score += 500;
      (this.state as any)._bossKilledEffect = { x: e.x, y: e.y, timer: 1.0 };
    }

    // Combo streak messages
    if (this.state.combo === 5) this.spawnFloatingText(this.state.playerX, this.arenaHeight - 90, 'FRENESI!', '#f97316');
    if (this.state.combo === 10) this.spawnFloatingText(this.state.playerX, this.arenaHeight - 90, 'IMPARÁVEL!', '#ef4444');
    if (this.state.combo === 15) this.spawnFloatingText(this.state.playerX, this.arenaHeight - 90, 'DEVASTADOR!', '#a855f7');
    if (this.state.combo === 25) this.spawnFloatingText(this.state.playerX, this.arenaHeight - 90, 'GENOCÍDIO!', '#fbbf24');

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
        this.damagePlayer(enemy.damage);
        this.state.enemies.splice(i, 1);
      }
    }
  }

  private applyHealing(dt: number): void {
    const power = this.backpack.calculateBackpackPower();
    // Item-based healing (from backpack stats)
    if (power.totalHeal > 0) {
      this.state.playerHp = Math.min(this.state.playerMaxHp, this.state.playerHp + power.totalHeal * dt);
    }

    // Shield regeneration (after 3s without taking damage)
    if (this.state.shieldRegenDelay > 0) {
      this.state.shieldRegenDelay -= dt;
    } else if (this.state.playerShield < this.state.playerMaxShield) {
      this.state.playerShield = Math.min(
        this.state.playerMaxShield,
        this.state.playerShield + 5 * dt // 5 shield/s regen
      );
    }
  }

  /** Apply character-specific passive effects each tick */
  private applyCharacterPassives(dt: number): void {
    const charId = this.backpack.config.characterId;

    switch (charId) {
      case 'fire_lord':
        this.state.playerHp -= 1 * dt;
        break;
      case 'aqua_sage':
        this.state.playerHp = Math.min(this.state.playerMaxHp, this.state.playerHp + 2 * dt);
        break;
      case 'void_walker':
        this.state.playerHp -= 3 * dt;
        break;
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

  private spawnFloatingText(x: number, y: number, text: string, color: string): void {
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
    return Math.min(0.8, crit); // Cap at 80%
  }

  private generateWave(totalMonths: number, isBossMonth: boolean = false): Enemy[] {
    const enemies: Enemy[] = [];

    // Map totalMonths to a "virtual wave" for enemy pool access
    // Month 1-6: only basic enemies (minWave 1-3)
    // Month 7-12: introduce elementals, shooters (minWave 4-6)
    // Year 2: all types (minWave 7-8)
    // Year 3+: everything
    const virtualWave = Math.min(20, Math.ceil(totalMonths * 0.6));
    const available = getEnemiesForWave(virtualWave);

    // Difficulty curve based on timeline era
    const year = Math.ceil(totalMonths / 12);
    const monthInYear = ((totalMonths - 1) % 12) + 1;

    // Enemy count scales: more enemies as time passes
    let count: number;
    if (totalMonths <= 6) {
      count = 4 + totalMonths * 1.5; // 5-13
    } else if (totalMonths <= 12) {
      count = 10 + (totalMonths - 6) * 2; // 12-22
    } else if (year === 2) {
      count = 18 + monthInYear * 1.5; // 19-36
    } else {
      count = Math.min(50, 30 + (year - 2) * 5 + monthInYear); // 36+
    }
    count = Math.floor(count);

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

      // HP scaling based on era
      let hpScale: number;
      if (totalMonths <= 6) {
        hpScale = 1 + totalMonths * 0.1; // 1.1 - 1.6
      } else if (totalMonths <= 12) {
        hpScale = 1.5 + (totalMonths - 6) * 0.2; // 1.7 - 2.7
      } else if (year === 2) {
        hpScale = 2.5 + monthInYear * 0.3; // 2.8 - 6.1
      } else {
        // Year 3+: massive HP scaling
        hpScale = 5 + (year - 2) * 3 + monthInYear * 0.4;
      }

      // Speed: slower in early months, ramps up
      let baseSpeed: number;
      if (totalMonths <= 6) {
        baseSpeed = Math.max(20, def.speed * 0.5);
      } else if (totalMonths <= 12) {
        baseSpeed = def.speed * (0.7 + (totalMonths - 6) * 0.05);
      } else {
        baseSpeed = def.speed * (1 + (year - 1) * 0.1);
      }

      // Elite chance: 10% per enemy after month 6, increases over time
      const eliteChance = totalMonths > 6 ? Math.min(0.25, 0.05 + totalMonths * 0.005) : 0;
      const isElite = Math.random() < eliteChance;
      const eliteMult = isElite ? 2.5 : 1;
      const eliteGoldMult = isElite ? 3 : 1;

      enemies.push({
        id: `enemy_${this.nextEnemyId++}`,
        x: 80 + (i % 10) * Math.floor((this.arenaWidth - 160) / 10) + Math.random() * 20,
        y: -40 - Math.floor(i / 10) * 70 - Math.random() * 30,
        hp: Math.floor(def.hp * hpScale * eliteMult),
        maxHp: Math.floor(def.hp * hpScale * eliteMult),
        speed: baseSpeed * (isElite ? 1.2 : 1),
        damage: (def.damage + Math.floor(totalMonths * 0.4)) * (isElite ? 1.5 : 1),
        tags: [...def.tags],
        width: Math.floor(def.width * (isElite ? 1.3 : 1)),
        height: Math.floor(def.height * (isElite ? 1.3 : 1)),
        goldReward: Math.floor(def.goldReward * eliteGoldMult),
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
      // Mark elite in state for rendering
      if (isElite) {
        (enemies[enemies.length - 1] as any).isElite = true;
      }
    }

    // Boss spawning: uses timeline schedule
    if (isBossMonth) {
      const boss = getBossForWave(totalMonths);
      const bossSource = boss || getBossForWave(5)!; // fallback to first boss
      if (bossSource) {
        const bossHp = 250 + totalMonths * 50 + (year - 1) * 200;
        enemies.push({
          id: `enemy_${this.nextEnemyId++}`,
          x: this.arenaWidth / 2,
          y: -60,
          hp: bossHp,
          maxHp: bossHp,
          speed: bossSource.speed * (1 + (year - 1) * 0.1),
          damage: bossSource.damage + Math.floor(totalMonths * 0.8),
          tags: [...bossSource.tags],
          width: bossSource.width,
          height: bossSource.height,
          goldReward: bossSource.goldReward + totalMonths * 2,
          shootTimer: bossSource.special?.type === 'shoot' ? 1 / bossSource.special.fireRate : 2,
          special: bossSource.special,
          isBoss: true,
          movement: bossSource.movement,
          armorHits: bossSource.special?.type === 'armor' ? bossSource.special.hits : undefined,
          phased: false,
          phaseTimer: bossSource.special?.type === 'phase' ? 3.0 : undefined,
          spawnTimer: bossSource.special?.type === 'spawn' ? bossSource.special.interval : undefined,
          moveTimer: 0,
          moveDir: 1,
          explodeOnDeath: bossSource.special?.type === 'explode',
          baseSpeed: bossSource.speed * (1 + (year - 1) * 0.1),
          defId: bossSource.id,
        });
      }
    }

    return enemies;
  }
}
