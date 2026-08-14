import * as THREE from 'three';
import type { ToolSpec } from './types';

function group(...objs: THREE.Object3D[]) {
  const g = new THREE.Group();
  for (const o of objs) g.add(o);
  return g;
}

function mesh(geo: THREE.BufferGeometry, color: string, opts: Partial<THREE.MeshStandardMaterialParameters> = {}) {
  return new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color, ...opts }));
}

const TOOLS_LIST: ToolSpec[] = [
  {
    id: 'sponge',
    label: 'Esponja',
    icon: '🧽',
    build: () => {
      const m = mesh(new THREE.BoxGeometry(0.34, 0.16, 0.24), '#d8c95a', { roughness: 0.9 });
      m.castShadow = true;
      return m;
    },
  },
  {
    id: 'wrench',
    label: 'Chave de fenda',
    icon: '🔧',
    build: () => {
      const handle = mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.34, 10), '#c9432a', { roughness: 0.6 });
      handle.rotation.z = Math.PI / 2;
      const shaft = mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.22, 8), '#c9c9c9', {
        metalness: 0.8,
        roughness: 0.3,
      });
      shaft.rotation.z = Math.PI / 2;
      shaft.position.x = 0.27;
      return group(handle, shaft);
    },
  },
  {
    id: 'torch',
    label: 'Maçarico',
    icon: '⚡',
    build: () => {
      const grip = mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.28, 12), '#3a3a3a', { roughness: 0.7 });
      const tip = mesh(new THREE.ConeGeometry(0.045, 0.16, 12), '#ffb347', {
        emissive: new THREE.Color('#ff8a3a'),
        emissiveIntensity: 0.4,
      });
      tip.position.y = 0.21;
      return group(grip, tip);
    },
  },
  {
    id: 'brush',
    label: 'Pincel',
    icon: '🎨',
    build: () => {
      const handle = mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.3, 10), '#8a5a34', { roughness: 0.8 });
      const ferrule = mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.06, 10), '#c9c9c9', { metalness: 0.6 });
      ferrule.position.y = 0.17;
      const tip = mesh(new THREE.ConeGeometry(0.05, 0.14, 10), '#d9622b', { roughness: 0.9 });
      tip.position.y = 0.27;
      return group(handle, ferrule, tip);
    },
  },
  {
    id: 'hand',
    label: 'Mão',
    icon: '🖐️',
    build: () => {
      const palm = mesh(new THREE.SphereGeometry(0.13, 14, 14), '#e8b98a', { roughness: 0.7 });
      palm.scale.set(1, 0.7, 0.6);
      return palm;
    },
  },
];

export const TOOLS: Record<string, ToolSpec> = Object.fromEntries(TOOLS_LIST.map((t) => [t.id, t]));
export const TOOLS_ORDER: ToolSpec[] = TOOLS_LIST;
