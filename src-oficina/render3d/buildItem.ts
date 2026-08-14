import * as THREE from 'three';
import type { ItemDef } from '../core/types';
import type { Shape3D, PartInstance, ItemInstance, BodyPaintable } from './types';
import { SHAPES3D } from './shapes3d';
import { drawWoodGrain, drawPlainBase } from './texturePatterns';

export const BODY_TEX_SIZE = 512;

export function buildItemGroup(item: ItemDef): ItemInstance {
  const shape: Shape3D = SHAPES3D[item.shape];
  const group = new THREE.Group();
  const partsById = new Map<string, PartInstance>();
  const bodies: BodyPaintable[] = [];

  for (const spec of shape.parts) {
    const geometry = spec.geo();
    let material: THREE.Material;

    if (spec.role === 'body') {
      const canvas = document.createElement('canvas');
      canvas.width = BODY_TEX_SIZE;
      canvas.height = BODY_TEX_SIZE;
      const ctx = canvas.getContext('2d')!;
      if (spec.bodyStyle === 'wood') drawWoodGrain(ctx, BODY_TEX_SIZE, BODY_TEX_SIZE, item.baseColor);
      else drawPlainBase(ctx, BODY_TEX_SIZE, BODY_TEX_SIZE, item.baseColor);
      const texture = new THREE.CanvasTexture(canvas);
      material = new THREE.MeshStandardMaterial({ map: texture, roughness: 0.85, metalness: 0.05 });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(...spec.position);
      if (spec.rotation) mesh.rotation.set(...spec.rotation);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.userData.partId = spec.id;
      mesh.userData.role = spec.role;
      group.add(mesh);
      bodies.push({ mesh, canvas, ctx, texture });
      partsById.set(spec.id, {
        spec,
        object: mesh,
        removed: false,
        originalPosition: mesh.position.clone(),
        originalQuaternion: mesh.quaternion.clone(),
      });
      continue;
    }

    if (spec.textureFn) {
      const [aw, ah] = spec.textureAspect ?? [256, 256];
      const tcanvas = document.createElement('canvas');
      tcanvas.width = aw;
      tcanvas.height = ah;
      spec.textureFn(tcanvas.getContext('2d')!, aw, ah);
      const map = new THREE.CanvasTexture(tcanvas);
      material = new THREE.MeshStandardMaterial({ map, roughness: 0.55, metalness: spec.metalness ?? 0.1 });
    } else {
      material = new THREE.MeshStandardMaterial({
        color: spec.color ?? '#8a8a8a',
        metalness: spec.metalness ?? 0.1,
        roughness: spec.roughness ?? 0.6,
      });
    }
    if (spec.role === 'weld') {
      material = new THREE.MeshStandardMaterial({
        color: spec.color ?? '#ffb347',
        emissive: new THREE.Color(spec.color ?? '#ffb347'),
        emissiveIntensity: 0.5,
      });
    }
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(...spec.position);
    if (spec.rotation) mesh.rotation.set(...spec.rotation);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData.partId = spec.id;
    mesh.userData.role = spec.role;
    group.add(mesh);
    partsById.set(spec.id, {
      spec,
      object: mesh,
      removed: false,
      originalPosition: mesh.position.clone(),
      originalQuaternion: mesh.quaternion.clone(),
    });
  }

  return { group, partsById, bodies, shape };
}
