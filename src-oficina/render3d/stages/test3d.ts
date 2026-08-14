import * as THREE from 'three';
import type { WorkshopScene } from '../WorkshopScene';
import type { ItemInstance } from '../types';
import { trackClick3D, tinyBeep } from './common';

export function runTest3D(
  scene: WorkshopScene,
  instance: ItemInstance,
  onProgress: (pct: number) => void,
  onComplete: () => void,
  onHint?: (msg: string) => void
): () => void {
  scene.setRequiredTool('hand');
  const objectMap = new Map<string, THREE.Object3D>();
  for (const [id, p] of instance.partsById) objectMap.set(id, p.object);

  let activated = false;
  let activeT = 0;
  let beeped = false;
  let lastHint = 0;

  scene.onFrame = (dt) => {
    if (!activated) return;
    activeT += dt;
    instance.shape.testAnimate(objectMap, activeT);
    if (!beeped && activeT > 0.1) {
      beeped = true;
      tinyBeep(660, 0.2, 'sine', 0.05);
    }
    if (activeT >= 2.2) {
      scene.onFrame = null;
      onProgress(1);
      setTimeout(onComplete, 300);
    }
  };

  const stop = trackClick3D(scene.canvas, (pos) => {
    if (activated) return;
    if (scene.equipped !== 'hand') {
      const now = performance.now();
      if (now - lastHint > 1500) {
        lastHint = now;
        onHint?.('Use a mão para acionar o objeto.');
      }
      return;
    }
    const hit = scene.raycastItem(pos.x, pos.y, ['switch']);
    if (!hit) return;
    activated = true;
    onProgress(0.5);
    tinyBeep(440, 0.15, 'sine', 0.06);
  });

  return () => {
    stop();
    scene.onFrame = null;
    scene.setRequiredTool(null);
  };
}
