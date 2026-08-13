import type { ShapeDef } from '../render/shapes';
import {
  CANVAS_W,
  CANVAS_H,
  ITEM_CX,
  ITEM_CY,
  makeLayer,
  buildMask,
  clipToMask,
  maskAlphaTotal,
  layerAlphaTotal,
  trackPointer,
  drawWorkbench,
} from './common';

export function runClean(
  canvas: HTMLCanvasElement,
  shape: ShapeDef,
  baseColor: string,
  onProgress: (pct: number) => void,
  onComplete: () => void
): () => void {
  const ctx = canvas.getContext('2d')!;
  const mask = buildMask(shape);
  const maskTotal = maskAlphaTotal(mask);

  const base = makeLayer();
  const baseCtx = base.getContext('2d')!;
  baseCtx.fillStyle = baseColor;
  shape.drawSilhouette(baseCtx, ITEM_CX, ITEM_CY, baseColor);
  shape.drawDetails(baseCtx, ITEM_CX, ITEM_CY, 'rgba(0,0,0,0.35)');

  const dirt = makeLayer();
  const dirtCtx = dirt.getContext('2d')!;
  const rnd = mulberry32(hashStr(shape === shape ? 'dirt' : 'dirt'));
  for (let i = 0; i < 260; i++) {
    const x = rnd() * CANVAS_W;
    const y = rnd() * CANVAS_H;
    const r = 6 + rnd() * 16;
    const shade = 40 + rnd() * 40;
    dirtCtx.fillStyle = `rgba(${shade},${shade * 0.8},${shade * 0.6},${0.5 + rnd() * 0.4})`;
    dirtCtx.beginPath();
    dirtCtx.arc(x, y, r, 0, Math.PI * 2);
    dirtCtx.fill();
  }
  clipToMask(dirtCtx, mask);

  let done = false;
  let raf = 0;
  const render = () => {
    drawWorkbench(ctx);
    ctx.drawImage(base, 0, 0);
    ctx.drawImage(dirt, 0, 0);
    raf = requestAnimationFrame(render);
  };
  render();

  let lastCheck = 0;
  const stop = trackPointer(canvas, (pos) => {
    if (done) return;
    dirtCtx.save();
    dirtCtx.globalCompositeOperation = 'destination-out';
    dirtCtx.beginPath();
    dirtCtx.arc(pos.x, pos.y, 22, 0, Math.PI * 2);
    dirtCtx.fill();
    dirtCtx.restore();

    const now = performance.now();
    if (now - lastCheck > 80) {
      lastCheck = now;
      const remaining = layerAlphaTotal(dirt);
      const pct = Math.min(1, Math.max(0, 1 - remaining / maskTotal));
      onProgress(pct);
      if (pct >= 0.92 && !done) {
        done = true;
        dirtCtx.clearRect(0, 0, CANVAS_W, CANVAS_H);
        onProgress(1);
        setTimeout(onComplete, 250);
      }
    }
  });

  return () => {
    stop();
    cancelAnimationFrame(raf);
  };
}

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return h >>> 0;
}
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
