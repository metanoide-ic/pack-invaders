/**
 * SpaceBackground — layered parallax pixel-art backdrop.
 *
 * Composition (back to front):
 *   1. Sky gradient that shifts hue as the years pass (indigo → violet → crimson)
 *   2. Dithered pixel nebula clouds, drifting slowly
 *   3. Three parallax starfield layers with twinkle
 *   4. Occasional shooting star
 *   5. Horizon atmosphere glow
 *   6. Ruined city skyline (two depth layers, flickering windows)
 *   7. Ambient floating dust motes (combat only)
 *
 * Everything static is pre-rendered to offscreen canvases at startup.
 */

interface Star {
  x: number;
  y: number;
  size: number;
  speed: number;
  phase: number;
  color: string;
}

interface Mote {
  x: number;
  y: number;
  speed: number;
  drift: number;
  phase: number;
  size: number;
}

interface SkyTheme {
  top: string;
  mid: string;
  horizon: string;
  glow: string;      // rgba horizon glow
  nebula1: string;
  nebula2: string;
}

const THEMES: SkyTheme[] = [
  { // Year 1 — quiet indigo night
    top: '#04050e', mid: '#0a1024', horizon: '#1b2447',
    glow: 'rgba(76, 96, 190, 0.22)',
    nebula1: '#1c2b5e', nebula2: '#12395e',
  },
  { // Year 2 — violet alien sky
    top: '#070312', mid: '#170a2e', horizon: '#37175c',
    glow: 'rgba(140, 82, 220, 0.22)',
    nebula1: '#331a5e', nebula2: '#4a1a52',
  },
  { // Year 3 — crimson dusk, invasion deepens
    top: '#0d0308', mid: '#24081a', horizon: '#54142c',
    glow: 'rgba(220, 70, 90, 0.20)',
    nebula1: '#4d1430', nebula2: '#5e2412',
  },
  { // Year 4+ — burnt ember apocalypse
    top: '#0a0404', mid: '#1f0d08', horizon: '#4a1f0d',
    glow: 'rgba(240, 120, 40, 0.20)',
    nebula1: '#4d260e', nebula2: '#33150c',
  },
];

const STAR_COLORS = ['#ffffff', '#dbe6ff', '#ffe9c4', '#c4f2ff', '#f0d9ff'];

function mulberry(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export class SpaceBackground {
  private starsFar: Star[] = [];
  private starsMid: Star[] = [];
  private starsNear: Star[] = [];
  private motes: Mote[] = [];
  private scroll = { far: 0, mid: 0, near: 0 };

  private nebulaCache = new Map<number, HTMLCanvasElement>();
  private skylineFar!: HTMLCanvasElement;
  private skylineNear!: HTMLCanvasElement;
  private windowPositions: { x: number; y: number }[] = [];
  private skyGradCache = new Map<string, CanvasGradient>();

  private shooting: { x: number; y: number; vx: number; vy: number; life: number } | null = null;
  private nextShootingIn = 4;
  private time = 0;

  constructor(private w: number = 1280, private h: number = 720) {
    const rng = mulberry(1337);
    const mkStars = (count: number, sizeMin: number, sizeMax: number, speed: number): Star[] => {
      const out: Star[] = [];
      for (let i = 0; i < count; i++) {
        out.push({
          x: Math.floor(rng() * w),
          y: Math.floor(rng() * h),
          size: sizeMin + Math.floor(rng() * (sizeMax - sizeMin + 1)),
          speed,
          phase: rng() * Math.PI * 2,
          color: STAR_COLORS[Math.floor(rng() * STAR_COLORS.length)],
        });
      }
      return out;
    };
    this.starsFar = mkStars(110, 1, 1, 5);
    this.starsMid = mkStars(55, 1, 2, 13);
    this.starsNear = mkStars(22, 2, 2, 26);

    for (let i = 0; i < 14; i++) {
      this.motes.push({
        x: rng() * w,
        y: rng() * h,
        speed: 8 + rng() * 14,
        drift: (rng() - 0.5) * 12,
        phase: rng() * Math.PI * 2,
        size: 1 + Math.floor(rng() * 2),
      });
    }

    this.buildSkylines();
  }

  // ─── Pre-rendered layers ────────────────────────────────────────────────

  /** Dithered nebula clouds, cached per theme */
  private getNebula(themeIdx: number): HTMLCanvasElement {
    const cached = this.nebulaCache.get(themeIdx);
    if (cached) return cached;

    const theme = THEMES[themeIdx];
    const c = document.createElement('canvas');
    // Rendered small, drawn scaled 4x for chunky pixels
    c.width = 320;
    c.height = 180;
    const ctx = c.getContext('2d')!;
    const rng = mulberry(4242 + themeIdx * 100);

    const blob = (cx: number, cy: number, r: number, color: string): void => {
      ctx.fillStyle = color;
      // Overlapping translucent chunks accumulate into a dense cloud core
      // that fades naturally toward the edges.
      const count = Math.floor(r * r * 0.5);
      for (let i = 0; i < count; i++) {
        const ang = rng() * Math.PI * 2;
        const dist = Math.pow(rng(), 0.6) * r; // bias toward center
        const px = Math.floor(cx + Math.cos(ang) * dist * 1.8); // wider than tall
        const py = Math.floor(cy + Math.sin(ang) * dist * 0.75);
        const roll = rng();
        const size = roll < 0.55 ? 2 : roll < 0.8 ? 3 : 1;
        ctx.globalAlpha = 0.05 + rng() * 0.08;
        ctx.fillRect(px, py, size, size);
      }
      // Sparse dither halo at the rim
      const haloCount = Math.floor(r * 3);
      for (let i = 0; i < haloCount; i++) {
        const ang = rng() * Math.PI * 2;
        const dist = r * (0.85 + rng() * 0.35);
        const px = Math.floor(cx + Math.cos(ang) * dist * 1.8);
        const py = Math.floor(cy + Math.sin(ang) * dist * 0.75);
        if ((px + py) % 2 === 0) continue;
        ctx.globalAlpha = 0.05;
        ctx.fillRect(px, py, 1, 1);
      }
      ctx.globalAlpha = 1;
    };

    blob(75, 50, 36, theme.nebula1);
    blob(95, 60, 20, theme.nebula2);
    blob(245, 95, 44, theme.nebula2);
    blob(225, 80, 22, theme.nebula1);
    blob(160, 145, 26, theme.nebula1);
    blob(305, 30, 22, theme.nebula2);

    this.nebulaCache.set(themeIdx, c);
    return c;
  }

  /** Ruined city silhouettes — the thing the player defends */
  private buildSkylines(): void {
    const buildLayer = (
      height: number, seed: number, color: string,
      minH: number, maxH: number, withWindows: boolean
    ): HTMLCanvasElement => {
      const c = document.createElement('canvas');
      c.width = this.w;
      c.height = height;
      const ctx = c.getContext('2d')!;
      const rng = mulberry(seed);

      let x = -10;
      while (x < this.w + 10) {
        const bw = 24 + Math.floor(rng() * 56);
        const bh = minH + Math.floor(rng() * (maxH - minH));
        const top = height - bh;

        ctx.fillStyle = color;
        if (rng() < 0.35) {
          // Broken building: jagged stepped top
          const steps = 2 + Math.floor(rng() * 3);
          const stepW = Math.floor(bw / steps);
          for (let s = 0; s < steps; s++) {
            const dropoff = Math.floor(rng() * bh * 0.4);
            ctx.fillRect(x + s * stepW, top + dropoff, stepW, bh - dropoff);
          }
        } else {
          ctx.fillRect(x, top, bw, bh);
          // Antenna spike on some intact roofs
          if (rng() < 0.4) {
            const ax = x + 4 + Math.floor(rng() * (bw - 8));
            const ah = 6 + Math.floor(rng() * 14);
            ctx.fillRect(ax, top - ah, 2, ah);
            if (rng() < 0.5) ctx.fillRect(ax - 2, top - Math.floor(ah * 0.6), 6, 1);
          }
        }

        // Windows: rare surviving lights
        if (withWindows) {
          const cols = Math.floor(bw / 8);
          const rows = Math.floor(bh / 10);
          for (let wc = 0; wc < cols; wc++) {
            for (let wr = 0; wr < rows; wr++) {
              if (rng() < 0.08) {
                const wx = x + 3 + wc * 8;
                const wy = top + 4 + wr * 10;
                if (wy > top + 2 && wy < height - 4) {
                  ctx.fillStyle = '#3a2c10';
                  ctx.fillRect(wx, wy, 2, 3);
                  this.windowPositions.push({ x: wx, y: wy });
                }
              }
            }
          }
          ctx.fillStyle = color;
        }

        x += bw + (rng() < 0.25 ? 4 + Math.floor(rng() * 10) : 0);
      }
      return c;
    };

    this.skylineFar = buildLayer(120, 9001, '#0c1120', 24, 78, false);
    this.windowPositions = [];
    this.skylineNear = buildLayer(96, 7331, '#050810', 20, 88, true);
  }

  private getSkyGradient(ctx: CanvasRenderingContext2D, themeIdx: number): CanvasGradient {
    const key = `${themeIdx}_${this.h}`;
    const cached = this.skyGradCache.get(key);
    if (cached) return cached;
    const t = THEMES[themeIdx];
    const g = ctx.createLinearGradient(0, 0, 0, this.h);
    g.addColorStop(0, t.top);
    g.addColorStop(0.55, t.mid);
    g.addColorStop(0.92, t.horizon);
    this.skyGradCache.set(key, g);
    return g;
  }

  // ─── Frame render ───────────────────────────────────────────────────────

  render(ctx: CanvasRenderingContext2D, dt: number, year: number, combatMode: boolean): void {
    this.time += dt;
    const w = this.w;
    const h = this.h;
    const themeIdx = Math.min(THEMES.length - 1, Math.max(0, year - 1));
    const theme = THEMES[themeIdx];
    const speedMult = combatMode ? 1.6 : 1;

    // 1. Sky
    ctx.fillStyle = this.getSkyGradient(ctx, themeIdx);
    ctx.fillRect(0, 0, w, h);

    // 2. Nebula (slow horizontal drift, wraps)
    const neb = this.getNebula(themeIdx);
    const nebX = -((this.time * 3) % (w + 400)) + 200;
    const prevSmooth = ctx.imageSmoothingEnabled;
    ctx.imageSmoothingEnabled = false;
    ctx.globalAlpha = 0.8;
    ctx.drawImage(neb, nebX - 400, 0, 1280, 720);
    ctx.drawImage(neb, nebX + w + 0, 0, 1280, 720);
    ctx.globalAlpha = 1;
    ctx.imageSmoothingEnabled = prevSmooth;

    // 3. Starfield — three parallax layers, drifting downward
    this.scroll.far = (this.scroll.far + dt * 5 * speedMult) % h;
    this.scroll.mid = (this.scroll.mid + dt * 13 * speedMult) % h;
    this.scroll.near = (this.scroll.near + dt * 26 * speedMult) % h;

    this.drawStarLayer(ctx, this.starsFar, this.scroll.far, 0.5);
    this.drawStarLayer(ctx, this.starsMid, this.scroll.mid, 0.75);
    this.drawStarLayer(ctx, this.starsNear, this.scroll.near, 1);

    // 4. Shooting star
    this.updateShootingStar(ctx, dt);

    // 5. Horizon glow above the skyline
    const glowH = Math.floor(h * 0.28);
    const glowGrad = ctx.createLinearGradient(0, h - glowH, 0, h);
    glowGrad.addColorStop(0, 'rgba(0,0,0,0)');
    glowGrad.addColorStop(1, theme.glow);
    ctx.fillStyle = glowGrad;
    ctx.fillRect(0, h - glowH, w, glowH);

    // 6. City skyline (far layer offset up, near layer at bottom)
    ctx.drawImage(this.skylineFar, 0, h - 150);
    ctx.drawImage(this.skylineNear, 0, h - 100);

    // Flickering window lights
    if (this.windowPositions.length > 0) {
      for (let i = 0; i < this.windowPositions.length; i++) {
        const flicker = Math.sin(this.time * (1.5 + (i % 5) * 0.7) + i * 2.1);
        if (flicker > 0.3) {
          const wp = this.windowPositions[i];
          ctx.globalAlpha = 0.35 + flicker * 0.4;
          ctx.fillStyle = i % 3 === 0 ? '#ffb340' : '#ffd97a';
          ctx.fillRect(wp.x, h - 100 + wp.y, 2, 3);
        }
      }
      ctx.globalAlpha = 1;
    }

    // 7. Ambient motes during combat — dust drifting up through the battlefield
    if (combatMode) {
      ctx.globalCompositeOperation = 'lighter';
      for (const m of this.motes) {
        m.y -= m.speed * dt;
        m.x += Math.sin(this.time * 0.7 + m.phase) * m.drift * dt;
        if (m.y < -4) { m.y = h + 4; m.x = Math.random() * w; }
        const tw = 0.5 + Math.sin(this.time * 2 + m.phase) * 0.3;
        ctx.globalAlpha = 0.10 * tw;
        ctx.fillStyle = '#8fb8ff';
        ctx.fillRect(Math.floor(m.x), Math.floor(m.y), m.size, m.size);
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    }
  }

  private drawStarLayer(ctx: CanvasRenderingContext2D, stars: Star[], scroll: number, brightness: number): void {
    const h = this.h;
    for (let i = 0; i < stars.length; i++) {
      const s = stars[i];
      const y = (s.y + scroll) % h;
      const twinkle = 0.55 + Math.sin(this.time * 1.8 + s.phase) * 0.45;
      ctx.globalAlpha = brightness * (0.35 + twinkle * 0.65);
      ctx.fillStyle = s.color;
      ctx.fillRect(Math.floor(s.x), Math.floor(y), s.size, s.size);
      // Cross glint on the brightest near stars
      if (s.size >= 2 && twinkle > 0.85) {
        ctx.globalAlpha = brightness * 0.4;
        ctx.fillRect(Math.floor(s.x) - 1, Math.floor(y) + 0, 4, 1);
        ctx.fillRect(Math.floor(s.x) + 0, Math.floor(y) - 1, 1, 4);
      }
    }
    ctx.globalAlpha = 1;
  }

  private updateShootingStar(ctx: CanvasRenderingContext2D, dt: number): void {
    if (!this.shooting) {
      this.nextShootingIn -= dt;
      if (this.nextShootingIn <= 0) {
        const fromLeft = Math.random() < 0.5;
        this.shooting = {
          x: fromLeft ? -20 : this.w * (0.3 + Math.random() * 0.7),
          y: Math.random() * this.h * 0.3,
          vx: (fromLeft ? 1 : (Math.random() < 0.5 ? 1 : -1)) * (400 + Math.random() * 300),
          vy: 150 + Math.random() * 120,
          life: 0.7,
        };
        this.nextShootingIn = 5 + Math.random() * 10;
      }
      return;
    }
    const st = this.shooting;
    st.x += st.vx * dt;
    st.y += st.vy * dt;
    st.life -= dt;
    if (st.life <= 0 || st.y > this.h * 0.7) { this.shooting = null; return; }

    const alpha = Math.min(1, st.life * 2.5);
    const len = 32;
    const nx = st.vx / Math.hypot(st.vx, st.vy);
    const ny = st.vy / Math.hypot(st.vx, st.vy);
    ctx.globalCompositeOperation = 'lighter';
    const grad = ctx.createLinearGradient(st.x, st.y, st.x - nx * len, st.y - ny * len);
    grad.addColorStop(0, `rgba(255,255,255,${0.9 * alpha})`);
    grad.addColorStop(1, 'rgba(140,180,255,0)');
    ctx.strokeStyle = grad;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(st.x, st.y);
    ctx.lineTo(st.x - nx * len, st.y - ny * len);
    ctx.stroke();
    ctx.globalCompositeOperation = 'source-over';
  }
}
