import type { ShapeDef } from '../render/shapes';
import { CANVAS_W, CANVAS_H, ITEM_CX, ITEM_CY, trackPointer, tinyBeep, drawWorkbench } from './common';

interface FlyPart {
  id: string;
  x: number;
  y: number;
  t: number;
  angle: number;
}

export function runDisassemble(
  canvas: HTMLCanvasElement,
  shape: ShapeDef,
  baseColor: string,
  onProgress: (pct: number) => void,
  onComplete: () => void
): () => void {
  const ctx = canvas.getContext('2d')!;
  const removed = new Set<string>();
  const flying: FlyPart[] = [];
  let done = false;
  let raf = 0;
  let hoverId: string | null = null;

  const render = () => {
    drawWorkbench(ctx);
    ctx.fillStyle = baseColor;
    shape.drawSilhouette(ctx, ITEM_CX, ITEM_CY, baseColor);
    shape.drawDetails(ctx, ITEM_CX, ITEM_CY, 'rgba(0,0,0,0.35)');

    for (const p of shape.parts) {
      if (removed.has(p.id)) continue;
      const pulse = 1 + Math.sin(performance.now() / 260 + p.x) * 0.08;
      ctx.beginPath();
      ctx.arc(ITEM_CX + p.x, ITEM_CY + p.y, p.r * pulse, 0, Math.PI * 2);
      ctx.strokeStyle = hoverId === p.id ? '#ffd67a' : 'rgba(255,255,255,0.7)';
      ctx.lineWidth = hoverId === p.id ? 3 : 2;
      ctx.setLineDash([5, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    for (let i = flying.length - 1; i >= 0; i--) {
      const f = flying[i];
      f.t += 1 / 60;
      const dx = Math.cos(f.angle) * f.t * 140;
      const dy = Math.sin(f.angle) * f.t * 140 - f.t * f.t * 60;
      ctx.save();
      ctx.globalAlpha = Math.max(0, 1 - f.t * 1.2);
      ctx.fillStyle = '#d9cba8';
      ctx.beginPath();
      ctx.arc(f.x + dx, f.y - dy, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      if (f.t > 1) flying.splice(i, 1);
    }

    if (!done) raf = requestAnimationFrame(render);
  };
  render();

  const findPart = (x: number, y: number) => {
    for (const p of shape.parts) {
      if (removed.has(p.id)) continue;
      const dx = x - (ITEM_CX + p.x);
      const dy = y - (ITEM_CY + p.y);
      if (dx * dx + dy * dy <= (p.r + 6) * (p.r + 6)) return p;
    }
    return null;
  };

  const stop = trackPointer(canvas, (pos, pressed) => {
    const hovered = findPart(pos.x, pos.y);
    hoverId = hovered ? hovered.id : null;
    if (!pressed) return;
    if (hovered) {
      removed.add(hovered.id);
      flying.push({
        id: hovered.id,
        x: ITEM_CX + hovered.x,
        y: ITEM_CY + hovered.y,
        t: 0,
        angle: -Math.PI / 3 + Math.random() * (Math.PI / 1.5),
      });
      tinyBeep(320 + Math.random() * 120, 0.08, 'triangle', 0.04);
      const pct = removed.size / shape.parts.length;
      onProgress(pct);
      if (pct >= 1 && !done) {
        done = true;
        setTimeout(onComplete, 500);
      }
    }
  });

  return () => {
    stop();
    cancelAnimationFrame(raf);
  };
}
