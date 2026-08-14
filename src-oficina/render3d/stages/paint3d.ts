import * as THREE from 'three';
import type { WorkshopScene } from '../WorkshopScene';
import type { ItemInstance } from '../types';
import { BODY_TEX_SIZE } from '../buildItem';
import { trackPointer3D, layerAlpha } from './common';

export function runPaint3D(
  scene: WorkshopScene,
  instance: ItemInstance,
  paintColor: string,
  onProgress: (pct: number) => void,
  onComplete: () => void,
  onHint?: (msg: string) => void
): () => void {
  scene.setRequiredTool('brush');
  const S = BODY_TEX_SIZE;

  const layers = instance.bodies.map((body) => {
    const paintLayer = document.createElement('canvas');
    paintLayer.width = S;
    paintLayer.height = S;
    const pctx = paintLayer.getContext('2d')!;
    body.ctx.fillStyle = '#9a9a92';
    body.ctx.fillRect(0, 0, S, S);
    body.texture.needsUpdate = true;
    return { body, paintLayer, pctx };
  });

  let done = false;
  let lastCheck = 0;
  let lastHint = 0;
  const stop = trackPointer3D(scene.canvas, (pos, pressed) => {
    if (done || !pressed) return;
    if (scene.equipped !== 'brush') {
      const now = performance.now();
      if (now - lastHint > 1500) {
        lastHint = now;
        onHint?.('Pegue o pincel na bancada para pintar.');
      }
      return;
    }
    const hit = scene.raycastItem(pos.x, pos.y, ['body']);
    if (!hit || !hit.uv) return;
    const mesh = hit.object as THREE.Mesh;
    const layer = layers.find((l) => l.body.mesh === mesh);
    if (!layer) return;
    const u = hit.uv.x * S;
    const v = (1 - hit.uv.y) * S;
    layer.pctx.fillStyle = paintColor;
    layer.pctx.beginPath();
    layer.pctx.arc(u, v, 46 * (S / 256), 0, Math.PI * 2);
    layer.pctx.fill();
    layer.body.ctx.drawImage(layer.paintLayer, 0, 0);
    layer.body.texture.needsUpdate = true;

    const now = performance.now();
    if (now - lastCheck > 90) {
      lastCheck = now;
      let painted = 0;
      for (const l of layers) painted += layerAlpha(l.paintLayer);
      const pct = Math.min(1, painted / (S * S * 255 * layers.length * 0.55));
      onProgress(pct);
      if (pct >= 0.85 && !done) {
        done = true;
        for (const l of layers) {
          l.body.ctx.fillStyle = paintColor;
          l.body.ctx.fillRect(0, 0, S, S);
          l.body.texture.needsUpdate = true;
        }
        onProgress(1);
        setTimeout(onComplete, 300);
      }
    }
  });

  return () => {
    stop();
    scene.setRequiredTool(null);
  };
}
