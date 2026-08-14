function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shade(hex: string, amt: number): string {
  const c = hex.replace('#', '');
  const num = parseInt(c.length === 3 ? c.split('').map((x) => x + x).join('') : c, 16);
  let r = (num >> 16) + amt;
  let g = ((num >> 8) & 0xff) + amt;
  let b = (num & 0xff) + amt;
  r = Math.max(0, Math.min(255, r));
  g = Math.max(0, Math.min(255, g));
  b = Math.max(0, Math.min(255, b));
  return `rgb(${r},${g},${b})`;
}

/** Fills the canvas with a warm procedural wood-grain pattern based on a base color. */
export function drawWoodGrain(ctx: CanvasRenderingContext2D, w: number, h: number, base: string) {
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, w, h);

  const rnd = mulberry32(hashStr(base));
  // broad soft bands
  for (let i = 0; i < 10; i++) {
    const y = rnd() * h;
    const bandH = h * (0.06 + rnd() * 0.12);
    const g = ctx.createLinearGradient(0, y, 0, y + bandH);
    const tone = shade(base, (rnd() - 0.5) * 28);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(0.5, tone);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.globalAlpha = 0.35;
    ctx.fillRect(0, y, w, bandH);
  }
  ctx.globalAlpha = 1;

  // fine grain streaks (wavy horizontal lines)
  for (let i = 0; i < 60; i++) {
    const y = rnd() * h;
    const amp = 2 + rnd() * 5;
    const dark = rnd() > 0.5;
    ctx.strokeStyle = dark ? 'rgba(30,18,10,0.18)' : 'rgba(255,235,200,0.10)';
    ctx.lineWidth = 0.6 + rnd() * 1.2;
    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let x = 0; x <= w; x += 16) {
      ctx.lineTo(x, y + Math.sin((x / w) * Math.PI * (2 + rnd() * 2)) * amp);
    }
    ctx.stroke();
  }

  // subtle vignette for depth
  const vg = ctx.createRadialGradient(w / 2, h / 2, w * 0.2, w / 2, h / 2, w * 0.7);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, 'rgba(0,0,0,0.22)');
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, w, h);
}

/** Fills the canvas with a plain, softly shaded base color (used for non-wood bodies). */
export function drawPlainBase(ctx: CanvasRenderingContext2D, w: number, h: number, base: string) {
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, w, h);
  const vg = ctx.createRadialGradient(w / 2, h / 2, w * 0.15, w / 2, h / 2, w * 0.7);
  vg.addColorStop(0, 'rgba(255,255,255,0.05)');
  vg.addColorStop(1, 'rgba(0,0,0,0.18)');
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, w, h);
}

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return h >>> 0;
}

/** Draws a tuning-dial face: frequency ticks, small numerals, and a warm glow. */
export function drawDialFace(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = '#e8dcb8';
  ctx.fillRect(0, 0, w, h);
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, 'rgba(255,244,214,0.9)');
  g.addColorStop(1, 'rgba(198,178,120,0.9)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  ctx.strokeStyle = 'rgba(60,40,20,0.7)';
  ctx.lineWidth = Math.max(1, w * 0.01);
  const n = 14;
  for (let i = 0; i <= n; i++) {
    const x = (w / n) * i;
    const tall = i % 2 === 0;
    ctx.beginPath();
    ctx.moveTo(x, h * (tall ? 0.15 : 0.3));
    ctx.lineTo(x, h * 0.5);
    ctx.stroke();
  }
  ctx.fillStyle = 'rgba(60,40,20,0.85)';
  ctx.font = `${Math.round(h * 0.22)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('AM', w * 0.28, h * 0.85);
  ctx.fillText('FM', w * 0.72, h * 0.85);
  ctx.strokeStyle = '#c9432a';
  ctx.lineWidth = Math.max(1, w * 0.015);
  ctx.beginPath();
  ctx.moveTo(w * 0.55, h * 0.1);
  ctx.lineTo(w * 0.55, h * 0.92);
  ctx.stroke();
}
