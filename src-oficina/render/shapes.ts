import type { ShapeId } from '../core/types';

export interface PartHotspot {
  id: string;
  x: number; // offset from center
  y: number;
  r: number;
  label: string;
}

export interface WeldPoint {
  x: number;
  y: number;
}

export interface ShapeDef {
  /** Fills the full silhouette with the given color. Used both for rendering and as a clip mask. */
  drawSilhouette(ctx: CanvasRenderingContext2D, cx: number, cy: number, color: string): void;
  /** Extra linework drawn on top once the base/paint layer is composited. */
  drawDetails(ctx: CanvasRenderingContext2D, cx: number, cy: number, dark: string): void;
  parts: PartHotspot[];
  weldPoints: WeldPoint[];
  /** Looping "it works!" flourish, t = seconds since activated. */
  testAnim(ctx: CanvasRenderingContext2D, cx: number, cy: number, t: number): void;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

const radio: ShapeDef = {
  drawSilhouette(ctx, cx, cy, color) {
    ctx.fillStyle = color;
    roundRect(ctx, cx - 90, cy - 45, 180, 90, 14);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx - 45, cy, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.save();
    ctx.translate(cx + 65, cy - 45);
    ctx.rotate(-0.5);
    roundRect(ctx, -4, -55, 8, 55, 4);
    ctx.fill();
    ctx.restore();
  },
  drawDetails(ctx, cx, cy, dark) {
    ctx.strokeStyle = dark;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx - 45, cy, 30, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx - 45, cy, 18, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx + 40, cy + 20, 8, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx + 62, cy + 20, 8, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeRect(cx - 5, cy - 30, 60, 12);
  },
  parts: [
    { id: 'antenna', x: 65, y: -85, r: 14, label: 'Antena' },
    { id: 'backpanel', x: -45, y: 0, r: 32, label: 'Painel traseiro' },
    { id: 'knob', x: 40, y: 20, r: 12, label: 'Botão' },
  ],
  weldPoints: [
    { x: -85, y: 0 },
    { x: 85, y: 0 },
  ],
  testAnim(ctx, cx, cy, t) {
    ctx.save();
    ctx.strokeStyle = `rgba(255,214,120,${0.8 - (t % 1)})`;
    ctx.lineWidth = 3;
    for (let i = 0; i < 3; i++) {
      const rr = 10 + ((t * 40 + i * 20) % 60);
      ctx.beginPath();
      ctx.arc(cx - 45, cy, rr, -0.9, 0.9);
      ctx.stroke();
    }
    ctx.restore();
  },
};

const musicbox: ShapeDef = {
  drawSilhouette(ctx, cx, cy, color) {
    ctx.fillStyle = color;
    roundRect(ctx, cx - 70, cy - 10, 140, 55, 8);
    ctx.fill();
    ctx.save();
    ctx.translate(cx, cy - 10);
    ctx.beginPath();
    ctx.moveTo(-70, 0);
    ctx.lineTo(70, 0);
    ctx.lineTo(55, -45);
    ctx.lineTo(-55, -45);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  },
  drawDetails(ctx, cx, cy, dark) {
    ctx.strokeStyle = dark;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy - 35, 8, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeRect(cx - 55, cy - 5, 110, 40);
    ctx.beginPath();
    ctx.moveTo(cx - 30, cy - 45);
    ctx.lineTo(cx - 30, cy);
    ctx.moveTo(cx + 30, cy - 45);
    ctx.lineTo(cx + 30, cy);
    ctx.stroke();
  },
  parts: [
    { id: 'lid', x: 0, y: -25, r: 34, label: 'Tampa' },
    { id: 'crank', x: 62, y: 25, r: 12, label: 'Manivela' },
  ],
  weldPoints: [
    { x: -60, y: 5 },
    { x: 60, y: 5 },
  ],
  testAnim(ctx, cx, cy, t) {
    ctx.save();
    ctx.fillStyle = '#f4d8a0';
    for (let i = 0; i < 3; i++) {
      const phase = (t * 1.2 + i * 0.7) % 2;
      const y = cy - 40 - phase * 35;
      const x = cx - 10 + i * 18 + Math.sin(phase * 6) * 6;
      ctx.globalAlpha = Math.max(0, 1 - phase / 2);
      ctx.font = '18px sans-serif';
      ctx.fillText('♪', x, y);
    }
    ctx.restore();
  },
};

const bike: ShapeDef = {
  drawSilhouette(ctx, cx, cy, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(cx - 65, cy + 35, 34, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx + 65, cy + 35, 34, 0, Math.PI * 2);
    ctx.stroke();
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(cx - 65, cy + 35);
    ctx.lineTo(cx - 5, cy - 15);
    ctx.lineTo(cx + 65, cy + 35);
    ctx.lineTo(cx - 5, cy - 15);
    ctx.lineTo(cx - 25, cy - 45);
    ctx.moveTo(cx - 5, cy - 15);
    ctx.lineTo(cx + 25, cy - 40);
    ctx.stroke();
  },
  drawDetails(ctx, cx, cy, dark) {
    ctx.strokeStyle = dark;
    ctx.lineWidth = 1.5;
    for (const [wx] of [[-65], [65]] as [number][]) {
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(cx + wx, cy + 35);
        ctx.lineTo(cx + wx + Math.cos(a) * 30, cy + 35 + Math.sin(a) * 30);
        ctx.stroke();
      }
    }
  },
  parts: [
    { id: 'front-wheel', x: 65, y: 35, r: 22, label: 'Roda dianteira' },
    { id: 'back-wheel', x: -65, y: 35, r: 22, label: 'Roda traseira' },
    { id: 'seat', x: -25, y: -45, r: 12, label: 'Selim' },
    { id: 'chain', x: 0, y: 35, r: 14, label: 'Corrente' },
  ],
  weldPoints: [
    { x: -35, y: -5 },
    { x: 35, y: -5 },
    { x: 0, y: 35 },
  ],
  testAnim(ctx, cx, cy, t) {
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.lineWidth = 1.5;
    const angle = t * 8;
    for (const wx of [-65, 65]) {
      for (let i = 0; i < 4; i++) {
        const a = angle + (i / 4) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(cx + wx, cy + 35);
        ctx.lineTo(cx + wx + Math.cos(a) * 24, cy + 35 + Math.sin(a) * 24);
        ctx.stroke();
      }
    }
    ctx.restore();
  },
};

const typewriter: ShapeDef = {
  drawSilhouette(ctx, cx, cy, color) {
    ctx.fillStyle = color;
    roundRect(ctx, cx - 75, cy - 5, 150, 45, 10);
    ctx.fill();
    roundRect(ctx, cx - 60, cy - 45, 120, 40, 8);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + 58, cy - 35, 12, 0, Math.PI * 2);
    ctx.fill();
  },
  drawDetails(ctx, cx, cy, dark) {
    ctx.strokeStyle = dark;
    ctx.lineWidth = 1.5;
    for (let row = 0; row < 2; row++) {
      for (let i = 0; i < 8; i++) {
        ctx.strokeRect(cx - 55 + i * 14, cy + row * 14, 10, 10);
      }
    }
    ctx.strokeRect(cx - 50, cy - 40, 100, 30);
  },
  parts: [
    { id: 'keys', x: 0, y: 15, r: 40, label: 'Teclado' },
    { id: 'roller', x: 0, y: -25, r: 18, label: 'Rolo de papel' },
    { id: 'lever', x: 58, y: -35, r: 12, label: 'Alavanca' },
  ],
  weldPoints: [
    { x: -60, y: 15 },
    { x: 60, y: 15 },
  ],
  testAnim(ctx, cx, cy, t) {
    ctx.save();
    ctx.fillStyle = '#f4ede0';
    ctx.fillRect(cx - 45, cy - 100, 90, 55);
    ctx.fillStyle = '#333';
    ctx.font = '10px monospace';
    const text = 'a oficina continua...';
    const n = Math.min(text.length, Math.floor((t * 6) % (text.length + 10)));
    ctx.fillText(text.slice(0, n), cx - 40, cy - 70);
    ctx.restore();
  },
};

const clock: ShapeDef = {
  drawSilhouette(ctx, cx, cy, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(cx, cy - 5, 58, 0, Math.PI * 2);
    ctx.fill();
    roundRect(ctx, cx - 15, cy + 45, 30, 28, 4);
    ctx.fill();
  },
  drawDetails(ctx, cx, cy, dark) {
    ctx.strokeStyle = dark;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy - 5, 46, 0, Math.PI * 2);
    ctx.stroke();
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * 40, cy - 5 + Math.sin(a) * 40);
      ctx.lineTo(cx + Math.cos(a) * 46, cy - 5 + Math.sin(a) * 46);
      ctx.stroke();
    }
  },
  parts: [
    { id: 'face', x: 0, y: -5, r: 40, label: 'Mostrador' },
    { id: 'pendulum', x: 0, y: 58, r: 16, label: 'Portinha do pêndulo' },
    { id: 'key', x: 42, y: -40, r: 10, label: 'Chave de corda' },
  ],
  weldPoints: [
    { x: 0, y: 48 },
    { x: 0, y: -58 },
  ],
  testAnim(ctx, cx, cy, t) {
    ctx.save();
    ctx.strokeStyle = '#2a2a2a';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    const minA = t * 1.2;
    const hourA = t * 0.15;
    ctx.beginPath();
    ctx.moveTo(cx, cy - 5);
    ctx.lineTo(cx + Math.cos(hourA) * 22, cy - 5 + Math.sin(hourA) * 22);
    ctx.stroke();
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy - 5);
    ctx.lineTo(cx + Math.cos(minA) * 34, cy - 5 + Math.sin(minA) * 34);
    ctx.stroke();
    const swing = Math.sin(t * 3) * 18;
    ctx.beginPath();
    ctx.moveTo(cx, cy + 50);
    ctx.lineTo(cx + swing, cy + 85);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx + swing, cy + 88, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#caa24a';
    ctx.fill();
    ctx.restore();
  },
};

export const SHAPES: Record<ShapeId, ShapeDef> = { radio, musicbox, bike, typewriter, clock };
