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

export function runPaint(
  canvas: HTMLCanvasElement,
  shape: ShapeDef,
  paintColor: string,
  onProgress: (pct: number) => void,
  onComplete: () => void
): () => void {
  const ctx = canvas.getContext('2d')!;
  const mask = buildMask(shape);
  const maskTotal = maskAlphaTotal(mask);

  const primer = makeLayer();
  const primerCtx = primer.getContext('2d')!;
  primerCtx.fillStyle = '#9a9a92';
  shape.drawSilhouette(primerCtx, ITEM_CX, ITEM_CY, '#9a9a92');
  shape.drawDetails(primerCtx, ITEM_CX, ITEM_CY, 'rgba(0,0,0,0.3)');

  const paintLayer = makeLayer();
  const paintCtx = paintLayer.getContext('2d')!;

  let done = false;
  let raf = 0;
  const render = () => {
    drawWorkbench(ctx);
    ctx.drawImage(primer, 0, 0);
    ctx.drawImage(paintLayer, 0, 0);
    if (!done) {
      ctx.save();
      ctx.globalAlpha = 0.55;
      shape.drawDetails(ctx, ITEM_CX, ITEM_CY, 'rgba(0,0,0,0.25)');
      ctx.restore();
    } else {
      shape.drawDetails(ctx, ITEM_CX, ITEM_CY, 'rgba(0,0,0,0.35)');
    }
    raf = requestAnimationFrame(render);
  };
  render();

  let lastCheck = 0;
  const stop = trackPointer(canvas, (pos) => {
    if (done) return;
    paintCtx.fillStyle = paintColor;
    paintCtx.beginPath();
    paintCtx.arc(pos.x, pos.y, 20, 0, Math.PI * 2);
    paintCtx.fill();
    clipToMask(paintCtx, mask);

    const now = performance.now();
    if (now - lastCheck > 80) {
      lastCheck = now;
      const painted = layerAlphaTotal(paintLayer);
      const pct = Math.min(1, painted / maskTotal);
      onProgress(pct);
      if (pct >= 0.9 && !done) {
        done = true;
        paintCtx.fillStyle = paintColor;
        shape.drawSilhouette(paintCtx, ITEM_CX, ITEM_CY, paintColor);
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
