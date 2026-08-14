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

/** Carved decoration for the music box lid: two small figures holding hands, framed by flowers. */
export function drawCarvedPanel(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = '#6b4226';
  ctx.fillRect(0, 0, w, h);
  const g = ctx.createRadialGradient(w / 2, h / 2, 4, w / 2, h / 2, w * 0.6);
  g.addColorStop(0, 'rgba(255,220,170,0.16)');
  g.addColorStop(1, 'rgba(0,0,0,0.28)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  ctx.strokeStyle = 'rgba(30,18,10,0.6)';
  ctx.lineWidth = Math.max(1, w * 0.012);
  ctx.strokeRect(w * 0.06, h * 0.1, w * 0.88, h * 0.8);

  // two small figures holding hands
  const figure = (cx: number) => {
    ctx.beginPath();
    ctx.arc(cx, h * 0.4, h * 0.09, 0, Math.PI * 2); // head
    ctx.moveTo(cx, h * 0.49);
    ctx.lineTo(cx, h * 0.72); // body
    ctx.moveTo(cx - w * 0.05, h * 0.85);
    ctx.lineTo(cx, h * 0.72);
    ctx.lineTo(cx + w * 0.05, h * 0.85); // legs
    ctx.stroke();
  };
  ctx.strokeStyle = 'rgba(255,228,190,0.75)';
  ctx.lineWidth = Math.max(1, w * 0.014);
  ctx.lineCap = 'round';
  figure(w * 0.4);
  figure(w * 0.6);
  ctx.beginPath();
  ctx.moveTo(w * 0.44, h * 0.62);
  ctx.lineTo(w * 0.56, h * 0.62); // held hands
  ctx.stroke();

  // small flower flourishes in the corners
  ctx.fillStyle = 'rgba(255,228,190,0.55)';
  const petals = (cx: number, cy: number, r: number) => {
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(cx + Math.cos(a) * r, cy + Math.sin(a) * r, r * 0.7, 0, Math.PI * 2);
      ctx.fill();
    }
  };
  petals(w * 0.16, h * 0.22, w * 0.035);
  petals(w * 0.84, h * 0.22, w * 0.035);
}

/** Round key caps for a typewriter keyboard block, drawn in two staggered rows. */
export function drawKeyRows(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = '#141414';
  ctx.fillRect(0, 0, w, h);
  const cols = 10;
  const rows = 2;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cx = ((c + 0.5 + (r % 2) * 0.5) / (cols + 0.5)) * w;
      const cy = ((r + 0.5) / rows) * h;
      const rad = (w / cols) * 0.32;
      const g = ctx.createRadialGradient(cx - rad * 0.3, cy - rad * 0.3, 1, cx, cy, rad);
      g.addColorStop(0, '#3a3a3a');
      g.addColorStop(1, '#0c0c0c');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy, rad, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.12)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }
}

/** Blank sheet of paper. Reused as the base for the progressive typing animation. */
export function drawBlankPaper(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = '#f4ede0';
  ctx.fillRect(0, 0, w, h);
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, 'rgba(0,0,0,0.08)');
  g.addColorStop(0.15, 'rgba(0,0,0,0)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

/** Redraws the paper with `text` typed up to `chars` characters, monospaced. */
export function drawTypedPaper(ctx: CanvasRenderingContext2D, w: number, h: number, text: string, chars: number) {
  drawBlankPaper(ctx, w, h);
  ctx.fillStyle = '#2a2a2a';
  ctx.font = `${Math.round(h * 0.11)}px monospace`;
  ctx.textAlign = 'left';
  ctx.fillText(text.slice(0, chars), w * 0.08, h * 0.4);
  if (chars < text.length && Math.floor(chars * 3) % 2 === 0) {
    const caretX = w * 0.08 + ctx.measureText(text.slice(0, chars)).width;
    ctx.fillRect(caretX, h * 0.28, w * 0.012, h * 0.14);
  }
}

/** Clock face: printed numerals and minute ticks around the rim. */
export function drawClockFace(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const r = w / 2;
  ctx.fillStyle = '#f4ede0';
  ctx.beginPath();
  ctx.arc(r, r, r, 0, Math.PI * 2);
  ctx.fill();
  const g = ctx.createRadialGradient(r, r, r * 0.5, r, r, r);
  g.addColorStop(0, 'rgba(255,255,255,0.05)');
  g.addColorStop(1, 'rgba(80,50,20,0.25)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(r, r, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#2a1c10';
  ctx.fillStyle = '#2a1c10';
  for (let i = 0; i < 60; i++) {
    const a = (i / 60) * Math.PI * 2;
    const isHour = i % 5 === 0;
    ctx.lineWidth = isHour ? r * 0.025 : r * 0.01;
    const rOuter = r * 0.92;
    const rInner = r * (isHour ? 0.8 : 0.86);
    ctx.beginPath();
    ctx.moveTo(r + Math.cos(a) * rOuter, r + Math.sin(a) * rOuter);
    ctx.lineTo(r + Math.cos(a) * rInner, r + Math.sin(a) * rInner);
    ctx.stroke();
  }
  ctx.font = `${Math.round(r * 0.24)}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (let n = 1; n <= 12; n++) {
    const a = (n / 12) * Math.PI * 2 - Math.PI / 2;
    const rn = r * 0.64;
    ctx.fillText(String(n), r + Math.cos(a) * rn, r + Math.sin(a) * rn);
  }
  ctx.beginPath();
  ctx.arc(r, r, r * 0.04, 0, Math.PI * 2);
  ctx.fill();
}
