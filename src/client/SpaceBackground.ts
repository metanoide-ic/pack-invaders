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

interface Craft {
  x: number;
  y: number;
  speed: number;
  scale: number;
  phase: number;
}

interface SkyTheme {
  top: string;
  mid: string;
  horizon: string;
  glow: string;      // rgba horizon glow
  nebula1: string;
  nebula2: string;
  moon: string;      // distant moon/planet body color
  moonGlow: string;  // rgba halo around the moon
  beam: string;      // rgba city searchlight beam
  craft: string;     // distant alien craft blink color
}

const THEMES: SkyTheme[] = [
  { // Year 1 — quiet indigo night
    top: '#04050e', mid: '#0a1024', horizon: '#1b2447',
    glow: 'rgba(76, 96, 190, 0.30)',
    nebula1: '#2a3f88', nebula2: '#1d5486',
    moon: '#8493c4', moonGlow: 'rgba(120, 145, 220, 0.20)',
    beam: 'rgba(120, 150, 240, 0.05)', craft: '#7fdcff',
  },
  { // Year 2 — violet alien sky
    top: '#070312', mid: '#170a2e', horizon: '#37175c',
    glow: 'rgba(140, 82, 220, 0.30)',
    nebula1: '#4a2790', nebula2: '#6a237a',
    moon: '#a678c8', moonGlow: 'rgba(170, 110, 230, 0.20)',
    beam: 'rgba(180, 120, 240, 0.05)', craft: '#e07fff',
  },
  { // Year 3 — crimson dusk, invasion deepens
    top: '#0d0308', mid: '#24081a', horizon: '#54142c',
    glow: 'rgba(220, 70, 90, 0.28)',
    nebula1: '#751d47', nebula2: '#8a361b',
    moon: '#c47a7a', moonGlow: 'rgba(220, 90, 110, 0.20)',
    beam: 'rgba(240, 120, 130, 0.05)', craft: '#ff9d7f',
  },
  { // Year 4+ — burnt ember apocalypse
    top: '#0a0404', mid: '#1f0d08', horizon: '#4a1f0d',
    glow: 'rgba(240, 120, 40, 0.28)',
    nebula1: '#743a15', nebula2: '#4d2012',
    moon: '#c89060', moonGlow: 'rgba(240, 150, 70, 0.22)',
    beam: 'rgba(255, 160, 70, 0.06)', craft: '#ffc27f',
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
  private moonCache = new Map<number, HTMLCanvasElement>();
  private skylineFar!: HTMLCanvasElement;
  private skylineMid!: HTMLCanvasElement;
  private skylineNear!: HTMLCanvasElement;
  private windowPositions: { x: number; y: number }[] = [];
  private beamPositions: number[] = [];
  private craft: Craft[] = [];
  private skyGradCache = new Map<string, CanvasGradient>();

  private shooting: { x: number; y: number; vx: number; vy: number; life: number } | null = null;
  private nextShootingIn = 4;
  // Distant artillery flak bursts flashing over the city horizon (combat only)
  private flak: { x: number; y: number; life: number; max: number; r: number }[] = [];
  private nextFlakIn = 1.5;
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

    // Distant alien craft drifting across the upper sky (combat only). Small
    // silhouettes with a blinking underbelly light — cheap sense of "the
    // invasion is everywhere, not just in front of you".
    for (let i = 0; i < 4; i++) {
      this.craft.push({
        x: rng() * w,
        y: 40 + rng() * (h * 0.34),
        speed: (rng() < 0.5 ? -1 : 1) * (6 + rng() * 10),
        scale: 0.7 + rng() * 0.9,
        phase: rng() * Math.PI * 2,
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
      const count = Math.floor(r * r * 0.62);
      for (let i = 0; i < count; i++) {
        const ang = rng() * Math.PI * 2;
        const dist = Math.pow(rng(), 0.6) * r; // bias toward center
        const px = Math.floor(cx + Math.cos(ang) * dist * 1.8); // wider than tall
        const py = Math.floor(cy + Math.sin(ang) * dist * 0.75);
        const roll = rng();
        const size = roll < 0.55 ? 2 : roll < 0.8 ? 3 : 1;
        ctx.globalAlpha = 0.07 + rng() * 0.11;
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

    // A broad band sweeping across the whole sky (not just the middle), so the
    // upper reaches no longer read as flat black. Bigger, brighter cores.
    blob(60, 38, 44, theme.nebula1);
    blob(95, 55, 26, theme.nebula2);
    blob(245, 90, 50, theme.nebula2);
    blob(220, 72, 28, theme.nebula1);
    blob(160, 130, 32, theme.nebula1);
    blob(300, 26, 30, theme.nebula2);
    blob(30, 100, 24, theme.nebula2);
    blob(180, 40, 22, theme.nebula1);
    blob(130, 90, 20, theme.nebula2);

    this.nebulaCache.set(themeIdx, c);
    return c;
  }

  /** Distant hazy moon/planet — a focal anchor low in the sky behind the city.
   * Pre-rendered per theme; a cratered disc with a soft lit terminator. */
  private getMoon(themeIdx: number): HTMLCanvasElement {
    const cached = this.moonCache.get(themeIdx);
    if (cached) return cached;
    const theme = THEMES[themeIdx];
    const R = 150;
    const c = document.createElement('canvas');
    c.width = R * 2;
    c.height = R * 2;
    const ctx = c.getContext('2d')!;
    const rng = mulberry(808 + themeIdx * 31);

    // Body with a soft light-to-dark shading from upper-left
    const body = ctx.createRadialGradient(R * 0.7, R * 0.7, R * 0.1, R, R, R);
    body.addColorStop(0, theme.moon);
    body.addColorStop(0.6, theme.moon);
    body.addColorStop(1, '#0c0c18');
    ctx.save();
    ctx.beginPath();
    ctx.arc(R, R, R - 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.fillStyle = body;
    ctx.fillRect(0, 0, R * 2, R * 2);
    // Craters / surface mottling
    for (let i = 0; i < 40; i++) {
      const cr = 4 + rng() * 22;
      const cx = rng() * R * 2;
      const cy = rng() * R * 2;
      ctx.globalAlpha = 0.06 + rng() * 0.08;
      ctx.fillStyle = rng() < 0.5 ? '#000000' : '#ffffff';
      ctx.beginPath();
      ctx.arc(cx, cy, cr, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.restore();

    this.moonCache.set(themeIdx, c);
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

    this.skylineFar = buildLayer(140, 9001, '#0c1120', 30, 96, false);
    this.skylineMid = buildLayer(118, 4519, '#080b16', 26, 104, false);
    this.windowPositions = [];
    this.skylineNear = buildLayer(108, 7331, '#04060d', 24, 104, true);

    // A few searchlight beams rising from the tallest near buildings — the
    // survivors sweeping the sky for incoming craft.
    const brng = mulberry(2024);
    for (let i = 0; i < 4; i++) {
      this.beamPositions.push(Math.floor((0.12 + 0.72 * (i / 3) + (brng() - 0.5) * 0.08) * this.w));
    }
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
    ctx.globalAlpha = 0.92;
    ctx.drawImage(neb, nebX - 400, 0, 1280, 720);
    ctx.drawImage(neb, nebX + w + 0, 0, 1280, 720);
    ctx.globalAlpha = 1;

    // 2b. Distant moon low behind the city (combat only — the inventory screen
    // has its own big planet, we don't want two competing focal bodies)
    if (combatMode) {
      const moon = this.getMoon(themeIdx);
      const mR = 150;
      const mCx = Math.floor(w * 0.74);
      const mCy = h - 92;            // most of the disc rides behind the skyline
      ctx.globalAlpha = 0.30;
      ctx.fillStyle = theme.moonGlow;
      ctx.beginPath();
      ctx.arc(mCx, mCy, mR * 1.35, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 0.72;
      ctx.drawImage(moon, mCx - mR, mCy - mR, mR * 2, mR * 2);
      ctx.globalAlpha = 1;
    }
    ctx.imageSmoothingEnabled = prevSmooth;

    // 3. Starfield — three parallax layers, drifting downward
    this.scroll.far = (this.scroll.far + dt * 5 * speedMult) % h;
    this.scroll.mid = (this.scroll.mid + dt * 13 * speedMult) % h;
    this.scroll.near = (this.scroll.near + dt * 26 * speedMult) % h;

    this.drawStarLayer(ctx, this.starsFar, this.scroll.far, 0.5);
    this.drawStarLayer(ctx, this.starsMid, this.scroll.mid, 0.75);
    this.drawStarLayer(ctx, this.starsNear, this.scroll.near, 1);

    // 3b. Distant alien craft drifting across the upper sky (combat only)
    if (combatMode) {
      const prevS = ctx.imageSmoothingEnabled;
      ctx.imageSmoothingEnabled = false;
      for (const cr of this.craft) {
        cr.x += cr.speed * dt;
        if (cr.x < -40) cr.x = w + 40;
        if (cr.x > w + 40) cr.x = -40;
        const s = cr.scale;
        const bx = Math.floor(cr.x), by = Math.floor(cr.y);
        // Saucer hull silhouette
        ctx.fillStyle = 'rgba(10, 12, 24, 0.85)';
        ctx.fillRect(bx - Math.round(11 * s), by, Math.round(22 * s), Math.round(3 * s));
        ctx.fillRect(bx - Math.round(6 * s), by - Math.round(3 * s), Math.round(12 * s), Math.round(3 * s));
        // Blinking underbelly light
        const blink = 0.4 + Math.sin(this.time * 3 + cr.phase) * 0.6;
        if (blink > 0.5) {
          ctx.globalAlpha = (blink - 0.5) * 2;
          ctx.fillStyle = theme.craft;
          ctx.fillRect(bx - 1, by + Math.round(3 * s), Math.max(2, Math.round(2 * s)), Math.max(2, Math.round(2 * s)));
          ctx.globalAlpha = 1;
        }
      }
      ctx.imageSmoothingEnabled = prevS;
    }

    // 4. Shooting star
    this.updateShootingStar(ctx, dt);

    // 5. Horizon glow above the skyline (cached per theme — only the year
    // changes which one is picked, the gradient itself never needs rebuilding)
    const glowH = Math.floor(h * 0.28);
    const glowKey = `glow_${themeIdx}_${h}`;
    let glowGrad = this.skyGradCache.get(glowKey);
    if (!glowGrad) {
      glowGrad = ctx.createLinearGradient(0, h - glowH, 0, h);
      glowGrad.addColorStop(0, 'rgba(0,0,0,0)');
      glowGrad.addColorStop(1, theme.glow);
      this.skyGradCache.set(glowKey, glowGrad);
    }
    ctx.fillStyle = glowGrad;
    ctx.fillRect(0, h - glowH, w, glowH);

    // 5b. Searchlight beams sweeping up from the city (combat only) — wide,
    // faint triangles that slowly fan back and forth.
    if (combatMode) {
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < this.beamPositions.length; i++) {
        const baseX = this.beamPositions[i];
        const baseY = h - 96;
        const sway = Math.sin(this.time * 0.4 + i * 1.7) * 0.35; // radians from vertical
        const len = h * 0.72;
        const halfW = 26 + (i % 2) * 10;
        const tipX = baseX + Math.sin(sway) * len;
        const tipY = baseY - Math.cos(sway) * len;
        const bg = ctx.createLinearGradient(baseX, baseY, tipX, tipY);
        bg.addColorStop(0, theme.beam);
        bg.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = bg;
        ctx.beginPath();
        ctx.moveTo(baseX - 3, baseY);
        ctx.lineTo(baseX + 3, baseY);
        ctx.lineTo(tipX + halfW, tipY);
        ctx.lineTo(tipX - halfW, tipY);
        ctx.closePath();
        ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';
    }

    // 6. City skyline — three depth layers (far/mid/near) stacked toward the
    // bottom so the ruined city occupies more of the frame.
    ctx.drawImage(this.skylineFar, 0, h - 168);
    ctx.drawImage(this.skylineMid, 0, h - 128);
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

    // 6b. Distant artillery flak over the horizon (combat only) — brief orange
    // flashes among the far buildings, the war raging beyond your street.
    if (combatMode) {
      this.nextFlakIn -= dt;
      if (this.nextFlakIn <= 0 && this.flak.length < 4) {
        this.flak.push({
          x: Math.random() * w,
          y: h - 120 - Math.random() * 60,
          life: 0.5, max: 0.5, r: 6 + Math.random() * 10,
        });
        this.nextFlakIn = 0.6 + Math.random() * 2.2;
      }
      ctx.globalCompositeOperation = 'lighter';
      for (let i = this.flak.length - 1; i >= 0; i--) {
        const f = this.flak[i];
        f.life -= dt;
        if (f.life <= 0) { this.flak.splice(i, 1); continue; }
        const p = f.life / f.max;
        const rad = f.r * (1 + (1 - p) * 1.4);
        ctx.globalAlpha = p * 0.55;
        ctx.fillStyle = theme.glow.replace(/[\d.]+\)$/, '1)');
        ctx.beginPath();
        ctx.arc(f.x, f.y, rad, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = p * 0.9;
        ctx.fillStyle = '#ffe6b0';
        ctx.beginPath();
        ctx.arc(f.x, f.y, rad * 0.35, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
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
