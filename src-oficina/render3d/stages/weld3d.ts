import * as THREE from 'three';
import type { WorkshopScene } from '../WorkshopScene';
import type { ItemInstance } from '../types';
import { trackClick3D, tinyBeep } from './common';

function reattach(instance: ItemInstance) {
  for (const part of instance.partsById.values()) {
    if (!part.removed) continue;
    const mesh = part.object as THREE.Mesh;
    mesh.visible = true;
    mesh.userData.removed = false;
    const mat = mesh.material as THREE.MeshStandardMaterial;
    const from = mesh.position.clone();
    const to = part.originalPosition.clone();
    const fromQ = mesh.quaternion.clone();
    const toQ = part.originalQuaternion.clone();
    const start = performance.now();
    const dur = 500;
    const step = () => {
      const t = Math.min(1, (performance.now() - start) / dur);
      const ease = t * t * (3 - 2 * t);
      mesh.position.lerpVectors(from, to, ease);
      mesh.quaternion.slerpQuaternions(fromQ, toQ, ease);
      mat.opacity = ease;
      if (t < 1) requestAnimationFrame(step);
      else {
        mat.opacity = 1;
        part.removed = false;
      }
    };
    requestAnimationFrame(step);
  }
}

function spark(scene: WorkshopScene, position: THREE.Vector3) {
  const group = new THREE.Group();
  for (let i = 0; i < 10; i++) {
    const m = new THREE.Mesh(
      new THREE.SphereGeometry(0.015, 6, 6),
      new THREE.MeshBasicMaterial({ color: '#ffd67a' })
    );
    group.add(m);
  }
  group.position.copy(position);
  scene.scene.add(group);
  const dirs = group.children.map(() => new THREE.Vector3(Math.random() - 0.5, Math.random() * 0.8, Math.random() - 0.5));
  const start = performance.now();
  const step = () => {
    const t = (performance.now() - start) / 500;
    group.children.forEach((c, i) => {
      c.position.copy(dirs[i]).multiplyScalar(t * 0.4);
      (c as THREE.Mesh).scale.setScalar(Math.max(0, 1 - t));
    });
    if (t < 1) requestAnimationFrame(step);
    else scene.scene.remove(group);
  };
  requestAnimationFrame(step);
}

export function runWeld3D(
  scene: WorkshopScene,
  instance: ItemInstance,
  hud: HTMLElement,
  onProgress: (pct: number) => void,
  onComplete: () => void,
  onHint?: (msg: string) => void
): () => void {
  scene.setRequiredTool('torch');
  const weldParts = [...instance.partsById.values()].filter((p) => p.spec.role === 'weld');
  let doneCount = 0;
  let done = false;

  const bar = document.createElement('div');
  bar.className = 'weld-bar';
  const zone = document.createElement('div');
  zone.className = 'weld-bar-zone';
  const cursorEl = document.createElement('div');
  cursorEl.className = 'weld-bar-cursor';
  bar.append(zone, cursorEl);
  const label = document.createElement('div');
  label.className = 'weld-bar-label';
  label.textContent = 'Aponte o maçarico para o ponto em destaque e solde no tempo certo';
  hud.append(label, bar);

  let zoneStart = 0.4;
  let zoneWidth = 0.24;
  let cursor = 0;
  let dir = 1;
  let speed = 0.55;
  let raf = 0;
  let last = performance.now();

  const newZone = () => {
    zoneWidth = Math.max(0.15, 0.26 - doneCount * 0.02);
    zoneStart = Math.random() * (1 - zoneWidth);
    zone.style.left = `${zoneStart * 100}%`;
    zone.style.width = `${zoneWidth * 100}%`;
  };
  newZone();

  const tick = (now: number) => {
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
    cursorEl.style.left = `${cursor * 100}%`;
    if (!done) raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);

  let lastHint = 0;
  const stop = trackClick3D(scene.canvas, (pos) => {
    if (done) return;
    if (scene.equipped !== 'torch') {
      const now = performance.now();
      if (now - lastHint > 1500) {
        lastHint = now;
        onHint?.('Pegue o maçarico na bancada para soldar.');
      }
      return;
    }
    const hit = scene.raycastItem(pos.x, pos.y, ['weld']);
    if (!hit) return;
    const target = weldParts[doneCount];
    if (!target || hit.object !== target.object) {
      onHint?.('Solde os pontos na ordem indicada.');
      return;
    }
    const inZone = cursor >= zoneStart && cursor <= zoneStart + zoneWidth;
    if (!inZone) {
      tinyBeep(120, 0.08, 'square', 0.03);
      return;
    }
    spark(scene, target.object.position.clone());
    tinyBeep(180, 0.15, 'sawtooth', 0.05);
    const mat = (target.object as THREE.Mesh).material as THREE.MeshStandardMaterial;
    mat.color.set('#8a8a8a');
    mat.emissiveIntensity = 0;
    doneCount++;
    speed = Math.min(0.9, speed + 0.05);
    onProgress(doneCount / weldParts.length);
    if (doneCount >= weldParts.length) {
      done = true;
      cancelAnimationFrame(raf);
      bar.remove();
      label.remove();
      reattach(instance);
      onProgress(1);
      setTimeout(onComplete, 700);
    } else {
      newZone();
    }
  });

  return () => {
    stop();
    cancelAnimationFrame(raf);
    bar.remove();
    label.remove();
    scene.setRequiredTool(null);
  };
}
