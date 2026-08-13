import type { ShapeDef } from '../render/shapes';
import { CANVAS_W, CANVAS_H, ITEM_CX, ITEM_CY, tinyBeep, trackPointer, drawWorkbench } from './common';

const LEVER_X = CANVAS_W / 2 - 90;
const LEVER_Y = CANVAS_H - 40;
const LEVER_W = 180;

export function runTest(
  canvas: HTMLCanvasElement,
  shape: ShapeDef,
  finalColor: string,
  onProgress: (pct: number) => void,
  onComplete: () => void
): () => void {
  const ctx = canvas.getContext('2d')!;
  let power = 0;
  let activated = false;
  let activeT = 0;
  let raf = 0;
  let last = performance.now();

  const render = (now: number) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;

    drawWorkbench(ctx);
    ctx.fillStyle = finalColor;
    shape.drawSilhouette(ctx, ITEM_CX, ITEM_CY, finalColor);
    shape.drawDetails(ctx, ITEM_CX, ITEM_CY, 'rgba(0,0,0,0.35)');

    if (activated) {
      activeT += dt;
      shape.testAnim(ctx, ITEM_CX, ITEM_CY, activeT);
      if (activeT > 0.15 && activeT < 0.2) tinyBeep(660, 0.2, 'sine', 0.05);
      if (activeT >= 2 && !done) {
        done = true;
        setTimeout(onComplete, 400);
      }
    } else {
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fillRect(LEVER_X, LEVER_Y, LEVER_W, 16);
      ctx.fillStyle = '#8fd19e';
      ctx.fillRect(LEVER_X, LEVER_Y, LEVER_W * power, 16);
      ctx.beginPath();
      ctx.arc(LEVER_X + LEVER_W * power, LEVER_Y + 8, 12, 0, Math.PI * 2);
      ctx.fillStyle = '#ffd67a';
      ctx.fill();
      ctx.fillStyle = '#2a1c10';
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('arraste para ligar', CANVAS_W / 2, LEVER_Y - 10);
      ctx.textAlign = 'left';
    }

    raf = requestAnimationFrame(render);
  };
  let done = false;
  raf = requestAnimationFrame(render);

  const stop = trackPointer(canvas, (pos) => {
    if (activated) return;
    const pct = Math.min(1, Math.max(0, (pos.x - LEVER_X) / LEVER_W));
    power = pct;
    onProgress(pct * 0.6);
    if (pct >= 0.97 && !activated) {
      activated = true;
      activeT = 0;
      onProgress(1);
      tinyBeep(440, 0.15, 'sine', 0.06);
    }
  });

  return () => {
    stop();
    cancelAnimationFrame(raf);
  };
}
