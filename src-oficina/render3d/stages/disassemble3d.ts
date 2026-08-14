import * as THREE from 'three';
import type { WorkshopScene } from '../WorkshopScene';
import type { ItemInstance } from '../types';
import { trackClick3D, tinyBeep } from './common';

function ensureTransparent(mesh: THREE.Mesh) {
  const mat = mesh.material as THREE.MeshStandardMaterial;
  mat.transparent = true;
}

function animateDetach(mesh: THREE.Mesh, dir: THREE.Vector3) {
  ensureTransparent(mesh);
  const from = mesh.position.clone();
  const to = from.clone().add(dir.clone().multiplyScalar(1.1));
  const start = performance.now();
  const dur = 550;
  const step = () => {
    const t = Math.min(1, (performance.now() - start) / dur);
    const ease = 1 - Math.pow(1 - t, 3);
    mesh.position.lerpVectors(from, to, ease);
    mesh.rotation.x += 0.12;
    mesh.rotation.y += 0.08;
    (mesh.material as THREE.MeshStandardMaterial).opacity = 1 - ease;
    if (t < 1) requestAnimationFrame(step);
    else mesh.visible = false;
  };
  requestAnimationFrame(step);
}

export function runDisassemble3D(
  scene: WorkshopScene,
  instance: ItemInstance,
  onProgress: (pct: number) => void,
  onComplete: () => void,
  onHint?: (msg: string) => void
): () => void {
  scene.setRequiredTool('wrench');
  const removableIds = [...instance.partsById.values()]
    .filter((p) => p.spec.role === 'removable')
    .map((p) => p.spec.id);
  let removedCount = 0;
  let done = false;
  let lastHint = 0;

  const stop = trackClick3D(scene.canvas, (pos) => {
    if (done) return;
    if (scene.equipped !== 'wrench') {
      const now = performance.now();
      if (now - lastHint > 1500) {
        lastHint = now;
        onHint?.('Pegue a chave de fenda na bancada para desmontar as peças.');
      }
      return;
    }
    const hit = scene.raycastItem(pos.x, pos.y, ['removable']);
    if (!hit) return;
    const mesh = hit.object as THREE.Mesh;
    const id = mesh.userData.partId as string;
    const part = instance.partsById.get(id);
    if (!part || part.removed) return;
    part.removed = true;
    mesh.userData.removed = true;
    const dir = new THREE.Vector3(...(part.spec.detachDir ?? [0, 1, 0])).normalize();
    animateDetach(mesh, dir);
    tinyBeep(320 + Math.random() * 120, 0.08, 'triangle', 0.04);

    removedCount++;
    const pct = removedCount / removableIds.length;
    onProgress(pct);
    if (pct >= 1 && !done) {
      done = true;
      setTimeout(onComplete, 650);
    }
  });

  return () => {
    stop();
    scene.setRequiredTool(null);
  };
}
