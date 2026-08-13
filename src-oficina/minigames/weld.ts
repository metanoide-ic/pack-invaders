import type { ShapeDef } from '../render/shapes';
import { CANVAS_W, CANVAS_H, ITEM_CX, ITEM_CY, tinyBeep, drawWorkbench } from './common';

interface Spark {
  x: number;
  y: number;
  t: number;
}

const BAR_X = CANVAS_W / 2 - 140;
const BAR_Y = CANVAS_H - 46;
const BAR_W = 280;
const BAR_H = 18;

export function runWeld(
  canvas: HTMLCanvasElement,
  shape: ShapeDef,
  baseColor: string,
  onProgress: (pct: number) => void,
  onComplete: () => void
): () => void {
  const ctx = canvas.getContext('2d')!;
  const points = shape.weldPoints;
  let doneCount = 0;
  let done = false;
  let raf = 0;
  const sparks: Spark[] = [];

  let zoneStart = 0.4;
  let zoneWidth = 0.22;
  let cursor = 0;
  let dir = 1;
  let speed = 0.55; // fraction of bar per second

  const newZone = () => {
    zoneWidth = Math.max(0.14, 0.24 - doneCount * 0.015);
    zoneStart = Math.random() * (1 - zoneWidth);
  };
  newZone();

  let last = performance.now();
  const render = (now: number) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    cursor += dir * speed * dt;
    if (cursor > 1) {
      cursor = 1;
      dir = -1;
    } else if (cursor < 0) {
      cursor = 0;
      dir = 1;
    }

    drawWorkbench(ctx);
    ctx.fillStyle = baseColor;
    shape.drawSilhouette(ctx, ITEM_CX, ITEM_CY, baseColor);
    shape.drawDetails(ctx, ITEM_CX, ITEM_CY, 'rgba(0,0,0,0.35)');

    points.forEach((p, i) => {
      ctx.beginPath();
      ctx.arc(ITEM_CX + p.x, ITEM_CY + p.y, 10, 0, Math.PI * 2);
      if (i < doneCount) {
        ctx.fillStyle = '#c7c7cf';
        ctx.fill();
        ctx.strokeStyle = '#5a5a63';
        ctx.lineWidth = 2;
        ctx.stroke();
      } else if (i === doneCount) {
        ctx.strokeStyle = '#ffb347';
        ctx.lineWidth = 3;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
      } else {
        ctx.strokeStyle = 'rgba(255,255,255,0.4)';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });

    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i];
      s.t += dt;
      ctx.save();
      ctx.globalAlpha = Math.max(0, 1 - s.t * 2);
      ctx.fillStyle = '#ffd67a';
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(s.x + Math.cos(a) * s.t * 40, s.y + Math.sin(a) * s.t * 40, 3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      if (s.t > 0.6) sparks.splice(i, 1);
    }

    if (!done) {
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fillRect(BAR_X, BAR_Y, BAR_W, BAR_H);
      ctx.fillStyle = 'rgba(120,220,150,0.55)';
      ctx.fillRect(BAR_X + zoneStart * BAR_W, BAR_Y, zoneWidth * BAR_W, BAR_H);
      ctx.fillStyle = '#ffb347';
      ctx.fillRect(BAR_X + cursor * BAR_W - 2, BAR_Y - 4, 4, BAR_H + 8);
      ctx.fillStyle = '#2a1c10';
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('clique ou toque para soldar', CANVAS_W / 2, BAR_Y - 12);
      ctx.textAlign = 'left';
    }

    if (!done) raf = requestAnimationFrame(render);
  };
  raf = requestAnimationFrame(render);

  const attempt = () => {
    if (done) return;
    const inZone = cursor >= zoneStart && cursor <= zoneStart + zoneWidth;
    if (inZone) {
      const p = points[doneCount];
      sparks.push({ x: ITEM_CX + p.x, y: ITEM_CY + p.y, t: 0 });
      tinyBeep(180, 0.15, 'sawtooth', 0.05);
      doneCount++;
      speed = Math.min(0.9, speed + 0.05);
      onProgress(doneCount / points.length);
      if (doneCount >= points.length) {
        done = true;
        setTimeout(onComplete, 500);
      } else {
        newZone();
      }
    } else {
      tinyBeep(120, 0.08, 'square', 0.03);
    }
  };

  const onDown = () => attempt();
  const onKey = (e: KeyboardEvent) => {
    if (e.code === 'Space' || e.code === 'Enter') attempt();
  };
  canvas.addEventListener('pointerdown', onDown);
  window.addEventListener('keydown', onKey);

  return () => {
    canvas.removeEventListener('pointerdown', onDown);
    window.removeEventListener('keydown', onKey);
    cancelAnimationFrame(raf);
  };
}
