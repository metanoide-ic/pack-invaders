import * as THREE from 'three';
import type { WorkshopScene } from '../WorkshopScene';
import type { ItemInstance } from '../types';
import { BODY_TEX_SIZE } from '../buildItem';
import { trackPointer3D, layerAlpha } from './common';
import { drawWoodGrain, drawPlainBase } from '../texturePatterns';

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

export function runClean3D(
  scene: WorkshopScene,
  instance: ItemInstance,
  baseColor: string,
  onProgress: (pct: number) => void,
  onComplete: () => void,
  onHint?: (msg: string) => void
): () => void {
  scene.setRequiredTool('sponge');
  const S = BODY_TEX_SIZE;

  const dirtLayers = instance.bodies.map((body, idx) => {
    const bodyStyle = instance.partsById.get(body.mesh.userData.partId)?.spec.bodyStyle;
    const dirt = document.createElement('canvas');
    dirt.width = S;
    dirt.height = S;
    const dctx = dirt.getContext('2d')!;
    const rnd = mulberry32(idx * 7919 + 13);
    for (let i = 0; i < 220; i++) {
      const x = rnd() * S;
      const y = rnd() * S;
      const r = (8 + rnd() * 22) * (S / 256);
      const shade = 30 + rnd() * 40;
      dctx.fillStyle = `rgba(${shade},${shade * 0.8},${shade * 0.6},${0.55 + rnd() * 0.35})`;
      dctx.beginPath();
      dctx.arc(x, y, r, 0, Math.PI * 2);
      dctx.fill();
    }
    const paintBase = () =>
      bodyStyle === 'wood' ? drawWoodGrain(body.ctx, S, S, baseColor) : drawPlainBase(body.ctx, S, S, baseColor);
    paintBase();
    return { body, dirt, dctx, paintBase, initial: layerAlpha(dirt) || 1 };
  });

  let done = false;
  const redraw = () => {
    for (const layer of dirtLayers) {
      layer.paintBase();
      layer.body.ctx.drawImage(layer.dirt, 0, 0);
      layer.body.texture.needsUpdate = true;
    }
  };
  redraw();

  let lastCheck = 0;
  let lastHint = 0;
  const stop = trackPointer3D(scene.canvas, (pos, pressed) => {
    if (done || !pressed) return;
    if (scene.equipped !== 'sponge') {
      const now = performance.now();
      if (now - lastHint > 1500) {
        lastHint = now;
        onHint?.('Pegue a esponja na bancada para limpar.');
      }
      return;
    }
    const hit = scene.raycastItem(pos.x, pos.y, ['body']);
    if (!hit || !hit.uv) return;
    const mesh = hit.object as THREE.Mesh;
    const layer = dirtLayers.find((l) => l.body.mesh === mesh);
    if (!layer) return;
    const u = hit.uv.x * S;
    const v = (1 - hit.uv.y) * S;
    layer.dctx.save();
    layer.dctx.globalCompositeOperation = 'destination-out';
    layer.dctx.beginPath();
    layer.dctx.arc(u, v, 26 * (S / 256), 0, Math.PI * 2);
    layer.dctx.fill();
    layer.dctx.restore();
    redraw();

    const now = performance.now();
    if (now - lastCheck > 90) {
      lastCheck = now;
      let remaining = 0;
      let initial = 0;
      for (const l of dirtLayers) {
        remaining += layerAlpha(l.dirt);
        initial += l.initial;
      }
      const pct = Math.min(1, Math.max(0, 1 - remaining / initial));
      onProgress(pct);
      if (pct >= 0.9 && !done) {
        done = true;
        for (const l of dirtLayers) l.dctx.clearRect(0, 0, S, S);
        redraw();
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
