/**
 * VERSUS ENGINE — Powers both "Versus Ships" and "PvP Puro" modes.
 * Two ships, local co-op, split controls: P1 = WASD + Space, P2 = Arrows + Enter.
 */

export type VersusPhase = 'playing' | 'p1_wins' | 'p2_wins' | 'draw';
export type VersusMode  = 'ships' | 'pvp';

export interface VShip {
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  vx: number;
  fireTimer: number;
  fireRate: number;   // shots/second
  alive: boolean;
  invTimer: number;   // invincibility frames after hit
  kills: number;
  score: number;
}

export interface VProjectile {
  x: number;
  y: number;
  vx: number;
  vy: number;
  owner: 1 | 2 | 0;  // 0 = enemy
  damage: number;
  alive: boolean;
  size: number;
}

export interface VEnemy {
  x: number;
  y: number;
  speed: number;
  hp: number;
  maxHp: number;
  width: number;
  moveTimer: number;
  moveDir: number;
  alive: boolean;
  reward: number;
}

export interface FloatingScore {
  x: number; y: number; text: string; life: number; maxLife: number; color: string;
}

export interface VersusState {
  p1: VShip;
  p2: VShip;
  projectiles: VProjectile[];
  enemies: VEnemy[];
  floats: FloatingScore[];
  phase: VersusPhase;
  mode: VersusMode;
  wave: number;
  waveTimer: number;
  spawnTimer: number;
  roundTimer: number;   // countdown timer (PvP: 90s; Ships: unlimited)
  shakeTimer: number;
  winTimer: number;     // delay before showing result
  enemyProjectiles: VProjectile[];
}

const W = 1280;
const H = 720;
const SHIP_Y_BASE = H - 80;
const SHIP_SPEED = 280;
const SHIP_W = 28;
const SHIP_H = 24;
const PROJ_SPEED = 480;
const ENEMY_PROJ_SPEED = 200;

function makeShip(x: number): VShip {
  return {
    x, y: SHIP_Y_BASE,
    hp: 100, maxHp: 100,
    vx: 0, fireTimer: 0, fireRate: 2.5,
    alive: true, invTimer: 0, kills: 0, score: 0,
  };
}

function spawnEnemy(wave: number): VEnemy {
  const x = 50 + Math.random() * (W - 100);
  const speed = 60 + wave * 12 + Math.random() * 30;
  const hp = 15 + wave * 5;
  return {
    x, y: -20,
    speed, hp, maxHp: hp,
    width: 22, moveTimer: 0, moveDir: Math.random() > 0.5 ? 1 : -1,
    alive: true, reward: 1 + Math.floor(wave * 0.5),
  };
}

function circleRect(cx: number, cy: number, r: number, rx: number, ry: number, rw: number, rh: number): boolean {
  const nearX = Math.max(rx, Math.min(cx, rx + rw));
  const nearY = Math.max(ry, Math.min(cy, ry + rh));
  return (cx - nearX) ** 2 + (cy - nearY) ** 2 < r * r;
}

export class VersusEngine {
  state: VersusState;

  constructor(mode: VersusMode) {
    this.state = {
      p1: makeShip(W * 0.28),
      p2: makeShip(W * 0.72),
      projectiles: [],
      enemies: [],
      floats: [],
      phase: 'playing',
      mode,
      wave: 1,
      waveTimer: 0,
      spawnTimer: 1.5,
      roundTimer: mode === 'pvp' ? 90 : Infinity,
      shakeTimer: 0,
      winTimer: 0,
      enemyProjectiles: [],
    };
  }

  reset(): void {
    const mode = this.state.mode;
    this.state = {
      p1: makeShip(W * 0.28),
      p2: makeShip(W * 0.72),
      projectiles: [], enemies: [], floats: [],
      phase: 'playing', mode,
      wave: 1, waveTimer: 0, spawnTimer: 1.5,
      roundTimer: mode === 'pvp' ? 90 : Infinity,
      shakeTimer: 0, winTimer: 0,
      enemyProjectiles: [],
    };
  }

  // ── Input actions ─────────────────────────────────────────────────────────

  moveP1(dir: number, dt: number): void {
    const s = this.state.p1;
    if (!s.alive) return;
    s.x = Math.max(SHIP_W / 2, Math.min(W - SHIP_W / 2, s.x + dir * SHIP_SPEED * dt));
  }

  moveP2(dir: number, dt: number): void {
    const s = this.state.p2;
    if (!s.alive) return;
    s.x = Math.max(SHIP_W / 2, Math.min(W - SHIP_W / 2, s.x + dir * SHIP_SPEED * dt));
  }

  tryFireP1(): void {
    const s = this.state.p1;
    if (!s.alive || s.fireTimer > 0) return;
    s.fireTimer = 1 / s.fireRate;
    // Main shot upward
    this.state.projectiles.push({
      x: s.x, y: s.y - SHIP_H / 2,
      vx: 0, vy: -PROJ_SPEED,
      owner: 1, damage: 18, alive: true, size: 4,
    });
    // Spread (ships mode gets triple shot at wave 3+)
    if (this.state.mode === 'ships' && this.state.wave >= 3) {
      this.state.projectiles.push(
        { x: s.x - 8, y: s.y - SHIP_H / 2, vx: -40, vy: -PROJ_SPEED, owner: 1, damage: 12, alive: true, size: 3 },
        { x: s.x + 8, y: s.y - SHIP_H / 2, vx:  40, vy: -PROJ_SPEED, owner: 1, damage: 12, alive: true, size: 3 },
      );
    }
    // PvP: also fire a downward shot toward P2
    if (this.state.mode === 'pvp') {
      const p2 = this.state.p2;
      const dx = p2.x - s.x;
      const dy = p2.y - s.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      this.state.projectiles.push({
        x: s.x, y: s.y,
        vx: (dx / dist) * PROJ_SPEED * 0.7,
        vy: (dy / dist) * PROJ_SPEED * 0.7,
        owner: 1, damage: 22, alive: true, size: 5,
      });
    }
  }

  tryFireP2(): void {
    const s = this.state.p2;
    if (!s.alive || s.fireTimer > 0) return;
    s.fireTimer = 1 / s.fireRate;
    // Main shot upward
    this.state.projectiles.push({
      x: s.x, y: s.y - SHIP_H / 2,
      vx: 0, vy: -PROJ_SPEED,
      owner: 2, damage: 18, alive: true, size: 4,
    });
    if (this.state.mode === 'ships' && this.state.wave >= 3) {
      this.state.projectiles.push(
        { x: s.x - 8, y: s.y - SHIP_H / 2, vx: -40, vy: -PROJ_SPEED, owner: 2, damage: 12, alive: true, size: 3 },
        { x: s.x + 8, y: s.y - SHIP_H / 2, vx:  40, vy: -PROJ_SPEED, owner: 2, damage: 12, alive: true, size: 3 },
      );
    }
    if (this.state.mode === 'pvp') {
      const p1 = this.state.p1;
      const dx = p1.x - s.x;
      const dy = p1.y - s.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      this.state.projectiles.push({
        x: s.x, y: s.y,
        vx: (dx / dist) * PROJ_SPEED * 0.7,
        vy: (dy / dist) * PROJ_SPEED * 0.7,
        owner: 2, damage: 22, alive: true, size: 5,
      });
    }
  }

  // ── Main tick ─────────────────────────────────────────────────────────────

  tick(dt: number): void {
    const st = this.state;
    if (st.phase !== 'playing') {
      if (st.winTimer > 0) st.winTimer -= dt;
      return;
    }

    st.shakeTimer = Math.max(0, st.shakeTimer - dt);
    st.roundTimer -= dt;

    // Fire timers
    if (st.p1.fireTimer > 0) st.p1.fireTimer -= dt;
    if (st.p2.fireTimer > 0) st.p2.fireTimer -= dt;
    if (st.p1.invTimer > 0) st.p1.invTimer -= dt;
    if (st.p2.invTimer > 0) st.p2.invTimer -= dt;

    // Auto-fire in Ships mode (continuous stream)
    if (st.mode === 'ships') {
      if (st.p1.alive && st.p1.fireTimer <= 0) this.tryFireP1();
      if (st.p2.alive && st.p2.fireTimer <= 0) this.tryFireP2();
    }

    // Update projectiles
    for (const p of st.projectiles) {
      if (!p.alive) continue;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.x < -20 || p.x > W + 20 || p.y < -60 || p.y > H + 20) {
        p.alive = false;
        continue;
      }

      // Hit enemy (ships mode)
      if (st.mode === 'ships' && (p.owner === 1 || p.owner === 2)) {
        for (const e of st.enemies) {
          if (!e.alive) continue;
          if (circleRect(p.x, p.y, p.size + 4, e.x - e.width / 2, e.y - 10, e.width, 20)) {
            e.hp -= p.damage;
            p.alive = false;
            if (e.hp <= 0) {
              e.alive = false;
              const scorer = p.owner === 1 ? st.p1 : st.p2;
              scorer.kills++;
              scorer.score += e.reward * 10;
              st.floats.push({ x: e.x, y: e.y, text: `+${e.reward * 10}`, life: 1.2, maxLife: 1.2, color: p.owner === 1 ? '#4ade80' : '#38bdf8' });
            }
            break;
          }
        }
        if (!p.alive) continue;
      }

      // Hit opponent ships (PvP & ships mode)
      if (p.owner === 1 && st.p2.alive && st.p2.invTimer <= 0) {
        const dx = p.x - st.p2.x; const dy = p.y - (st.p2.y - 8);
        if (dx * dx + dy * dy < (16 + p.size) ** 2) {
          this.hitShip(st.p2, p.damage, 2);
          p.alive = false;
        }
      }
      if (p.owner === 2 && st.p1.alive && st.p1.invTimer <= 0) {
        const dx = p.x - st.p1.x; const dy = p.y - (st.p1.y - 8);
        if (dx * dx + dy * dy < (16 + p.size) ** 2) {
          this.hitShip(st.p1, p.damage, 1);
          p.alive = false;
        }
      }
    }

    // Spawn enemies (ships mode only)
    if (st.mode === 'ships') {
      st.spawnTimer -= dt;
      if (st.spawnTimer <= 0) {
        const count = 1 + Math.floor(Math.random() * (1 + Math.floor(st.wave / 3)));
        for (let i = 0; i < count; i++) {
          st.enemies.push(spawnEnemy(st.wave));
        }
        st.spawnTimer = Math.max(0.6, 2.2 - st.wave * 0.12);
      }
      st.waveTimer += dt;
      if (st.waveTimer > 30) { st.waveTimer = 0; st.wave++; }

      // Update enemies
      for (const e of st.enemies) {
        if (!e.alive) continue;
        e.moveTimer += dt;
        const sinOff = Math.sin(e.moveTimer * 1.8) * 55;
        e.x = Math.max(30, Math.min(W - 30, e.x + e.moveDir * sinOff * 0.04));
        e.y += e.speed * dt;

        // Enemy reach bottom — damage nearest ship
        if (e.y > H - 30) {
          e.alive = false;
          const d1 = Math.abs(e.x - st.p1.x);
          const d2 = Math.abs(e.x - st.p2.x);
          if (d1 < d2 && st.p1.alive) this.hitShip(st.p1, 15, 1);
          else if (st.p2.alive) this.hitShip(st.p2, 15, 2);
        }

        // Enemy shooting (rare)
        e.moveTimer += dt * 0.1;
        if (Math.random() < 0.002 * st.wave) {
          const target = (st.p1.alive && st.p2.alive)
            ? (Math.random() > 0.5 ? st.p1 : st.p2)
            : (st.p1.alive ? st.p1 : st.p2);
          if (target) {
            const dx2 = target.x - e.x;
            const dy2 = target.y - e.y;
            const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2) || 1;
            st.projectiles.push({
              x: e.x, y: e.y + 10,
              vx: (dx2 / dist2) * ENEMY_PROJ_SPEED,
              vy: (dy2 / dist2) * ENEMY_PROJ_SPEED,
              owner: 0, damage: 8, alive: true, size: 3,
            });
          }
        }
      }

      // Enemy projectiles hit ships
      for (const p of st.projectiles) {
        if (p.owner !== 0 || !p.alive) continue;
        for (const ship of [st.p1, st.p2]) {
          if (!ship.alive || ship.invTimer > 0) continue;
          const dx = p.x - ship.x; const dy = p.y - (ship.y - 8);
          if (dx * dx + dy * dy < 18 ** 2) {
            this.hitShip(ship, p.damage, ship === st.p1 ? 1 : 2);
            p.alive = false;
          }
        }
      }
    }

    // Floating scores
    for (const f of st.floats) { f.y -= 35 * dt; f.life -= dt; }

    // Clean dead objects
    st.projectiles = st.projectiles.filter(p => p.alive);
    st.enemies     = st.enemies.filter(e => e.alive);
    st.floats      = st.floats.filter(f => f.life > 0);

    // Win conditions
    const p1Dead = !st.p1.alive;
    const p2Dead = !st.p2.alive;
    const timeUp = st.roundTimer <= 0;

    if (p1Dead && p2Dead) { st.phase = 'draw'; st.winTimer = 3; }
    else if (p1Dead)       { st.phase = 'p2_wins'; st.winTimer = 3; }
    else if (p2Dead)       { st.phase = 'p1_wins'; st.winTimer = 3; }
    else if (timeUp) {
      // Score tiebreak
      if (st.p1.score > st.p2.score)      st.phase = 'p1_wins';
      else if (st.p2.score > st.p1.score) st.phase = 'p2_wins';
      else                                  st.phase = 'draw';
      st.winTimer = 3;
    }
  }

  private hitShip(ship: VShip, damage: number, player: 1 | 2): void {
    ship.hp -= damage;
    ship.invTimer = 1.2;
    this.state.shakeTimer = 0.25;
    const label = `-${damage}`;
    this.state.floats.push({ x: ship.x, y: ship.y - 30, text: label, life: 1, maxLife: 1, color: '#ef4444' });
    if (ship.hp <= 0) {
      ship.hp = 0;
      ship.alive = false;
      this.state.shakeTimer = 0.5;
    }
    const other = player === 1 ? this.state.p2 : this.state.p1;
    other.score += Math.floor(damage * 0.5);
  }
}
