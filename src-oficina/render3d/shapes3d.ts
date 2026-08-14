import * as THREE from 'three';
import type { ShapeId } from '../core/types';
import type { Shape3D, Part3DSpec } from './types';
import { drawDialFace } from './texturePatterns';

const box = (w: number, h: number, d: number) => () => new THREE.BoxGeometry(w, h, d);
const cyl = (rt: number, rb: number, h: number, seg = 16) => () =>
  new THREE.CylinderGeometry(rt, rb, h, seg);
const sph = (r: number, seg = 16) => () => new THREE.SphereGeometry(r, seg, seg);
const torus = (r: number, tube: number, seg = 20) => () => new THREE.TorusGeometry(r, tube, 8, seg);

function rotY(obj: { rotation: THREE.Euler }, a: number) {
  obj.rotation.y = a;
}

// ---------------------------------------------------------------- RADIO
// A 1950s-style tabletop valve radio: walnut cabinet, wood-slat speaker grille,
// a lit tuning dial, twin knobs and a telescoping antenna.
const GRILLE_CX = -0.48;
const GRILLE_CY = 0.47;
const GRILLE_Z = 0.565;
const grilleSlats: Part3DSpec[] = Array.from({ length: 7 }, (_, i) => {
  const t = i / 6 - 0.5; // -0.5..0.5
  return {
    id: `grille-slat-${i}`,
    role: 'detail' as const,
    geo: box(0.025, 0.52, 0.02),
    position: [GRILLE_CX + t * 0.5, GRILLE_CY, GRILLE_Z] as [number, number, number],
    color: '#5a4028',
    roughness: 0.75,
  };
});

const feetOffsets: [number, number][] = [
  [-0.68, -0.42],
  [0.68, -0.42],
  [-0.68, 0.42],
  [0.68, 0.42],
];
const feet: Part3DSpec[] = feetOffsets.map(([x, z], i) => ({
  id: `foot-${i}`,
  role: 'detail' as const,
  geo: cyl(0.045, 0.06, 0.08, 10),
  position: [x, 0.04, z] as [number, number, number],
  color: '#1c130a',
  roughness: 0.8,
}));

const radioParts: Part3DSpec[] = [
  { id: 'chassis', role: 'body', bodyStyle: 'wood', geo: box(1.7, 0.85, 1.05), position: [0, 0.425, 0] },
  ...feet,
  {
    id: 'front-panel',
    role: 'detail',
    geo: box(1.52, 0.74, 0.03),
    position: [0, 0.46, 0.535],
    color: '#20130a',
    roughness: 0.65,
  },
  {
    id: 'grille-backing',
    role: 'detail',
    geo: cyl(0.31, 0.31, 0.03, 28),
    position: [GRILLE_CX, GRILLE_CY, GRILLE_Z - 0.01],
    rotation: [Math.PI / 2, 0, 0],
    color: '#0d0805',
  },
  ...grilleSlats,
  {
    id: 'grille-ring',
    role: 'detail',
    geo: torus(0.32, 0.018, 16),
    position: [GRILLE_CX, GRILLE_CY, GRILLE_Z - 0.01],
    color: '#c9a24a',
    metalness: 0.7,
    roughness: 0.35,
  },
  {
    id: 'dial',
    role: 'detail',
    geo: box(0.44, 0.25, 0.025),
    position: [0.4, 0.63, 0.545],
    textureFn: drawDialFace,
    textureAspect: [256, 146],
  },
  {
    id: 'dial-needle',
    role: 'detail',
    geo: box(0.16, 0.012, 0.01),
    position: [0.42, 0.61, 0.56],
    color: '#c9432a',
    roughness: 0.4,
  },
  {
    id: 'knob',
    role: 'removable',
    geo: cyl(0.1, 0.1, 0.13, 24),
    position: [0.26, 0.26, 0.58],
    rotation: [Math.PI / 2, 0, 0],
    color: '#1c130a',
    detachDir: [0.2, 0.1, 1],
  },
  {
    id: 'knob-notch',
    role: 'detail',
    geo: box(0.02, 0.06, 0.02),
    position: [0.26, 0.34, 0.63],
    color: '#c9a24a',
    metalness: 0.6,
  },
  {
    id: 'knob2',
    role: 'detail',
    geo: cyl(0.09, 0.09, 0.12, 24),
    position: [0.58, 0.26, 0.575],
    rotation: [Math.PI / 2, 0, 0],
    color: '#1c130a',
  },
  {
    id: 'antenna',
    role: 'removable',
    geo: cyl(0.013, 0.045, 1.15, 12),
    position: [0.68, 1.05, -0.34],
    rotation: [0, 0, -0.32],
    color: '#d8d8d8',
    metalness: 0.85,
    roughness: 0.25,
    detachDir: [0.35, 1, -0.35],
  },
  {
    id: 'antenna-collar',
    role: 'detail',
    geo: cyl(0.055, 0.06, 0.05, 16),
    position: [0.62, 0.62, -0.3],
    color: '#8a8a8a',
    metalness: 0.6,
    roughness: 0.4,
  },
  {
    id: 'backpanel',
    role: 'removable',
    geo: box(1.34, 0.66, 0.05),
    position: [0, 0.46, -0.545],
    color: '#241708',
    roughness: 0.85,
    detachDir: [0, 0.2, -1],
  },
  { id: 'weld-left', role: 'weld', geo: sph(0.1, 14), position: [-0.85, 0.42, 0], color: '#ffb347' },
  { id: 'weld-right', role: 'weld', geo: sph(0.1, 14), position: [0.85, 0.42, 0], color: '#ffb347' },
  {
    id: 'power-button',
    role: 'switch',
    geo: cyl(0.055, 0.055, 0.04, 16),
    position: [0.78, 0.68, 0.535],
    rotation: [Math.PI / 2, 0, 0],
    color: '#c9432a',
  },
];

const radio: Shape3D = {
  parts: radioParts,
  testAnimate(parts, t) {
    const knob = parts.get('knob');
    if (knob) knob.rotation.z = t * 6;
    const notch = parts.get('knob-notch');
    if (notch) {
      const a = t * 6;
      notch.position.set(0.26 + Math.sin(a) * 0.08, 0.26 + Math.cos(a) * 0.08, 0.63);
    }
    const needle = parts.get('dial-needle');
    if (needle) needle.rotation.z = Math.sin(t * 2.4) * 0.2;
    const btn = parts.get('power-button');
    if (btn) {
      const mat = (btn as THREE.Mesh).material as THREE.MeshStandardMaterial;
      if (!mat.emissive) mat.emissive = new THREE.Color('#ff6a3a');
      mat.emissiveIntensity = 0.4 + Math.sin(t * 8) * 0.3;
    }
  },
};

// ---------------------------------------------------------------- MUSIC BOX
const musicboxParts: Part3DSpec[] = [
  { id: 'base', role: 'body', geo: box(1.4, 0.5, 1), position: [0, 0.25, 0] },
  { id: 'lid', role: 'body', geo: box(1.4, 0.08, 1), position: [0, 0.53, -0.42], rotation: [-0.5, 0, 0] },
  {
    id: 'figurine',
    role: 'detail',
    geo: sph(0.09, 16),
    position: [0, 0.62, 0.15],
    color: '#e8d3a3',
  },
  {
    id: 'crank',
    role: 'switch',
    geo: cyl(0.05, 0.05, 0.28, 10),
    position: [0.75, 0.35, 0.3],
    rotation: [0, 0, Math.PI / 2],
    color: '#c9a24a',
    metalness: 0.7,
    roughness: 0.4,
  },
];

const musicbox: Shape3D = {
  parts: musicboxParts,
  testAnimate(parts, t) {
    const crank = parts.get('crank');
    if (crank) crank.rotation.x = t * 5;
    const fig = parts.get('figurine');
    if (fig) fig.rotation.y = t * 2;
  },
};

// ---------------------------------------------------------------- BIKE
const bikeParts: Part3DSpec[] = [
  {
    id: 'frame-top',
    role: 'body',
    geo: box(1.7, 0.13, 0.13),
    position: [0, 0.85, 0],
    rotation: [0, 0, 0.32],
  },
  {
    id: 'frame-seat',
    role: 'body',
    geo: box(0.95, 0.11, 0.11),
    position: [-0.35, 0.95, 0],
    rotation: [0, 0, -1.0],
  },
  {
    id: 'front-wheel',
    role: 'removable',
    geo: torus(0.42, 0.06, 24),
    position: [0.85, 0.45, 0],
    rotation: [0, Math.PI / 2, 0],
    color: '#20201f',
    detachDir: [1, 0.4, 0.2],
  },
  {
    id: 'back-wheel',
    role: 'removable',
    geo: torus(0.42, 0.06, 24),
    position: [-0.85, 0.45, 0],
    rotation: [0, Math.PI / 2, 0],
    color: '#20201f',
    detachDir: [-1, 0.4, -0.2],
  },
  {
    id: 'seat',
    role: 'removable',
    geo: cyl(0.13, 0.11, 0.22, 16),
    position: [-0.55, 1.28, 0],
    color: '#2a1c10',
    detachDir: [0, 1, 0],
  },
  {
    id: 'chain',
    role: 'removable',
    geo: torus(0.16, 0.025, 16),
    position: [0, 0.45, 0],
    rotation: [Math.PI / 2, 0, 0],
    color: '#4a4a4a',
    metalness: 0.7,
    detachDir: [0, -1, 0.4],
  },
  {
    id: 'bell',
    role: 'switch',
    geo: sph(0.08, 16),
    position: [0.75, 1.0, 0.15],
    color: '#d9622b',
    metalness: 0.5,
  },
  { id: 'weld-front', role: 'weld', geo: sph(0.1, 14), position: [0.55, 0.55, 0], color: '#ffb347' },
  { id: 'weld-back', role: 'weld', geo: sph(0.1, 14), position: [-0.55, 0.55, 0], color: '#ffb347' },
  { id: 'weld-seat', role: 'weld', geo: sph(0.1, 14), position: [-0.35, 1.1, 0], color: '#ffb347' },
];

const bike: Shape3D = {
  parts: bikeParts,
  testAnimate(parts, t) {
    const angle = t * 8;
    const fw = parts.get('front-wheel');
    const bw = parts.get('back-wheel');
    if (fw) fw.rotation.x = angle;
    if (bw) bw.rotation.x = angle;
    const bell = parts.get('bell');
    if (bell) bell.position.y = 1.0 + Math.sin(t * 20) * 0.02;
  },
};

// ---------------------------------------------------------------- TYPEWRITER
const typewriterParts: Part3DSpec[] = [
  { id: 'base', role: 'body', geo: box(1.6, 0.3, 1.1), position: [0, 0.15, 0] },
  { id: 'deck', role: 'body', geo: box(1.3, 0.28, 0.85), position: [0, 0.44, -0.05] },
  {
    id: 'roller',
    role: 'removable',
    geo: cyl(0.12, 0.12, 1.35, 16),
    position: [0, 0.72, -0.42],
    rotation: [0, 0, Math.PI / 2],
    color: '#1c1c1c',
    detachDir: [0, 1, -0.4],
  },
  {
    id: 'keys',
    role: 'removable',
    geo: box(1.0, 0.1, 0.55),
    position: [0, 0.5, 0.18],
    color: '#141414',
    detachDir: [0, 1, 0.6],
  },
  {
    id: 'ribbon',
    role: 'removable',
    geo: cyl(0.1, 0.1, 0.16, 14),
    position: [0.55, 0.53, -0.28],
    color: '#5a1c2a',
    detachDir: [0.6, 0.8, 0],
  },
  {
    id: 'lever',
    role: 'switch',
    geo: box(0.5, 0.06, 0.06),
    position: [0.78, 0.76, -0.42],
    color: '#b8b8b8',
    metalness: 0.7,
    roughness: 0.3,
  },
  { id: 'weld-left', role: 'weld', geo: sph(0.09, 14), position: [-0.65, 0.32, 0.35], color: '#ffb347' },
  { id: 'weld-right', role: 'weld', geo: sph(0.09, 14), position: [0.65, 0.32, 0.35], color: '#ffb347' },
];

const typewriter: Shape3D = {
  parts: typewriterParts,
  testAnimate(parts, t) {
    const lever = parts.get('lever');
    if (lever) lever.position.x = 0.78 - Math.min(0.35, (t % 1) * 0.7);
  },
};

// ---------------------------------------------------------------- CLOCK
const clockParts: Part3DSpec[] = [
  {
    id: 'case',
    role: 'body',
    geo: cyl(0.62, 0.62, 0.16, 32),
    position: [0, 0.95, 0],
    rotation: [Math.PI / 2, 0, 0],
  },
  {
    id: 'pendulum-box',
    role: 'detail',
    geo: box(0.34, 0.4, 0.16),
    position: [0, 0.38, 0.02],
    color: '#4a3020',
  },
  { id: 'hour-hand', role: 'detail', geo: box(0.28, 0.045, 0.02), position: [0.14, 0.95, 0.1], color: '#1a1a1a' },
  { id: 'minute-hand', role: 'detail', geo: box(0.4, 0.03, 0.02), position: [0.2, 0.95, 0.11], color: '#1a1a1a' },
  {
    id: 'pendulum-rod',
    role: 'detail',
    geo: cyl(0.012, 0.012, 0.45, 8),
    position: [0, 0.2, 0.1],
    color: '#c9a24a',
    metalness: 0.6,
  },
  {
    id: 'weld-hanger',
    role: 'weld',
    geo: sph(0.1, 14),
    position: [0, 1.45, 0],
    color: '#ffb347',
  },
  {
    id: 'weld-door',
    role: 'weld',
    geo: sph(0.1, 14),
    position: [0, 0.55, 0.1],
    color: '#ffb347',
  },
  {
    id: 'key',
    role: 'switch',
    geo: cyl(0.05, 0.05, 0.16, 12),
    position: [0.55, 1.05, 0.14],
    color: '#c9a24a',
    metalness: 0.7,
  },
];

const clock: Shape3D = {
  parts: clockParts,
  testAnimate(parts, t) {
    const hour = parts.get('hour-hand');
    const minute = parts.get('minute-hand');
    if (hour) hour.rotation.z = -t * 0.2;
    if (minute) minute.rotation.z = -t * 1.4;
    const rod = parts.get('pendulum-rod');
    if (rod) rod.rotation.x = Math.sin(t * 3) * 0.35;
  },
};

export const SHAPES3D: Record<ShapeId, Shape3D> = { radio, musicbox, bike, typewriter, clock };
export { rotY };
