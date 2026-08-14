import * as THREE from 'three';
import type { ItemDef } from '../core/types';
import { buildItemGroup } from './buildItem';
import { drawWoodGrain, drawPlainBase } from './texturePatterns';

export function mountPreview(container: HTMLElement, item: ItemDef): () => void {
  const scene = new THREE.Scene();
  scene.background = null;

  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 20);
  camera.position.set(1.6, 1.4, 2.2);
  camera.lookAt(0, 0.5, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
  container.appendChild(renderer.domElement);

  const hemi = new THREE.HemisphereLight('#fff3d6', '#402a1a', 0.9);
  scene.add(hemi);
  const key = new THREE.DirectionalLight('#ffe3b0', 1.2);
  key.position.set(2, 3, 2);
  scene.add(key);

  const instance = buildItemGroup(item);
  instance.group.position.y = -0.55;
  scene.add(instance.group);

  // Show the item pre-repair: a dusty, dim version of its color.
  for (const body of instance.bodies) {
    const bodyStyle = instance.partsById.get(body.mesh.userData.partId)?.spec.bodyStyle;
    if (bodyStyle === 'wood') drawWoodGrain(body.ctx, body.canvas.width, body.canvas.height, '#4a3a2c');
    else drawPlainBase(body.ctx, body.canvas.width, body.canvas.height, '#4a3a2c');
    body.texture.needsUpdate = true;
  }

  const resize = () => {
    const w = container.clientWidth || 260;
    const h = container.clientHeight || 200;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, true);
  };
  resize();
  window.addEventListener('resize', resize);

  let raf = 0;
  const animate = () => {
    raf = requestAnimationFrame(animate);
    instance.group.rotation.y += 0.006;
    renderer.render(scene, camera);
  };
  animate();

  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener('resize', resize);
    renderer.dispose();
    renderer.domElement.remove();
  };
}
