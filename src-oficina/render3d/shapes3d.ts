import * as THREE from 'three';
import type { ShapeId } from '../core/types';
import type { Shape3D, Part3DSpec } from './types';
import { drawDialFace, drawCarvedPanel, drawKeyRows, drawBlankPaper, drawTypedPaper, drawClockFace } from './texturePatterns';

const box = (w: number, h: number, d: number) => () => new THREE.BoxGeometry(w, h, d);
const cyl = (rt: number, rb: number, h: number, seg = 16) => () =>
  new THREE.CylinderGeometry(rt, rb, h, seg);
const sph = (r: number, seg = 16) => () => new THREE.SphereGeometry(r, seg, seg);
const torus = (r: number, tube: number, seg = 20) => () => new THREE.TorusGeometry(r, tube, 8, seg);
/** A box whose pivot sits at one end (x=0) instead of the center — for hand/needle-style parts. */
const pivotBox = (len: number, h: number, d: number) => () => new THREE.BoxGeometry(len, h, d).translate(len / 2, 0, 0);
/** A cylinder whose pivot sits at its top (y=0) instead of the center — for hanging parts. */
const pivotCyl = (r: number, len: number, seg = 8) => () =>
  new THREE.CylinderGeometry(r, r, len, seg).translate(0, -len / 2, 0);

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
// A hand-carved wooden music box with a dancing figurine under the open lid.
const mbFeet: Part3DSpec[] = ([[-0.58, -0.35], [0.58, -0.35], [-0.58, 0.35], [0.58, 0.35]] as [number, number][]).map(
  ([x, z], i) => ({
    id: `mb-foot-${i}`,
    role: 'detail' as const,
    geo: cyl(0.04, 0.05, 0.06, 10),
    position: [x, 0.03, z] as [number, number, number],
    color: '#2a1c10',
  })
);

const musicboxParts: Part3DSpec[] = [
  { id: 'base', role: 'body', bodyStyle: 'wood', geo: box(1.4, 0.55, 1), position: [0, 0.275, 0] },
  ...mbFeet,
  {
    id: 'carved-panel',
    role: 'detail',
    geo: box(1.16, 0.4, 0.02),
    position: [0, 0.3, 0.512],
    textureFn: drawCarvedPanel,
    textureAspect: [200, 140],
  },
  {
    id: 'lid',
    role: 'body',
    bodyStyle: 'wood',
    geo: box(1.4, 0.07, 1),
    position: [0, 0.58, -0.4],
    rotation: [-0.55, 0, 0],
  },
  { id: 'hinge-left', role: 'detail', geo: cyl(0.03, 0.03, 0.12, 10), position: [-0.55, 0.55, -0.47], rotation: [0, 0, Math.PI / 2], color: '#c9a24a', metalness: 0.6 },
  { id: 'hinge-right', role: 'detail', geo: cyl(0.03, 0.03, 0.12, 10), position: [0.55, 0.55, -0.47], rotation: [0, 0, Math.PI / 2], color: '#c9a24a', metalness: 0.6 },
  {
    id: 'figurine-skirt',
    role: 'detail',
    geo: cyl(0.001, 0.08, 0.16, 16),
    position: [0, 0.68, 0.05],
    color: '#e8b98a',
  },
  {
    id: 'figurine-head',
    role: 'detail',
    geo: sph(0.05, 14),
    position: [0, 0.81, 0.05],
    color: '#f0c8a0',
  },
  {
    id: 'figurine-partner-skirt',
    role: 'detail',
    geo: cyl(0.001, 0.075, 0.15, 16),
    position: [0, 0.675, -0.16],
    color: '#d9622b',
  },
  {
    id: 'figurine-partner-head',
    role: 'detail',
    geo: sph(0.048, 14),
    position: [0, 0.8, -0.16],
    color: '#f0c8a0',
  },
  {
    id: 'crank',
    role: 'switch',
    geo: cyl(0.05, 0.05, 0.26, 10),
    position: [0.76, 0.32, 0.3],
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
    for (const id of ['figurine-skirt', 'figurine-head', 'figurine-partner-skirt', 'figurine-partner-head']) {
      const p = parts.get(id);
      if (p) p.rotation.y = t * 2;
    }
    const lid = parts.get('lid');
    if (lid) lid.rotation.x = -0.55 + Math.sin(t * 3) * 0.02;
  },
};

// ---------------------------------------------------------------- BIKE
// A messenger bicycle with a proper diamond frame: two axles, a bottom bracket,
// a seat point and a head-tube point, connected by six straight tubes.
const REAR_AXLE: [number, number] = [-0.85, 0.45];
const FRONT_AXLE: [number, number] = [0.85, 0.45];
const BOTTOM_BRACKET: [number, number] = [0, 0.45];
const SEAT_TOP: [number, number] = [-0.32, 1.16];
const HEAD_TOP: [number, number] = [0.72, 0.92];

function frameBar(id: string, p1: [number, number], p2: [number, number], thick = 0.095): Part3DSpec {
  const dx = p2[0] - p1[0];
  const dy = p2[1] - p1[1];
  const len = Math.hypot(dx, dy);
  const angle = Math.atan2(dy, dx);
  return {
    id,
    role: 'body',
    geo: box(len, thick, thick),
    position: [(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2, 0],
    rotation: [0, 0, angle],
  };
}

const bikeFrame: Part3DSpec[] = [
  frameBar('chain-stay', REAR_AXLE, BOTTOM_BRACKET),
  frameBar('seat-stay', REAR_AXLE, SEAT_TOP, 0.06),
  frameBar('seat-tube', BOTTOM_BRACKET, SEAT_TOP),
  frameBar('top-tube', SEAT_TOP, HEAD_TOP),
  frameBar('down-tube', BOTTOM_BRACKET, HEAD_TOP),
  frameBar('fork', HEAD_TOP, FRONT_AXLE, 0.075),
];

const bikeParts: Part3DSpec[] = [
  ...bikeFrame,
  {
    id: 'handlebar',
    role: 'detail',
    geo: box(0.42, 0.035, 0.035),
    position: [HEAD_TOP[0] + 0.14, HEAD_TOP[1] + 0.14, 0],
    rotation: [0, 0, 0.5],
    color: '#2a2a2a',
    metalness: 0.5,
  },
  {
    id: 'headlight',
    role: 'detail',
    geo: cyl(0.05, 0.05, 0.045, 14),
    position: [HEAD_TOP[0] + 0.05, HEAD_TOP[1] + 0.03, 0.09],
    rotation: [Math.PI / 2, 0, 0],
    color: '#e8dcb8',
    roughness: 0.3,
  },
  {
    id: 'kickstand',
    role: 'detail',
    geo: box(0.035, 0.32, 0.035),
    position: [BOTTOM_BRACKET[0] - 0.08, 0.18, 0.14],
    rotation: [0, 0, 0.2],
    color: '#1c1c1c',
    metalness: 0.5,
  },
  {
    id: 'crank-axle',
    role: 'detail',
    geo: cyl(0.05, 0.05, 0.16, 14),
    position: [BOTTOM_BRACKET[0], BOTTOM_BRACKET[1], 0],
    rotation: [Math.PI / 2, 0, 0],
    color: '#2a2a2a',
    metalness: 0.6,
  },
  {
    id: 'pedal-a',
    role: 'detail',
    geo: box(0.13, 0.03, 0.085),
    position: [BOTTOM_BRACKET[0] + 0.17, BOTTOM_BRACKET[1], 0],
    color: '#1c1c1c',
  },
  {
    id: 'pedal-b',
    role: 'detail',
    geo: box(0.13, 0.03, 0.085),
    position: [BOTTOM_BRACKET[0] - 0.17, BOTTOM_BRACKET[1], 0],
    color: '#1c1c1c',
  },
  {
    id: 'front-wheel',
    role: 'removable',
    geo: torus(0.42, 0.06, 24),
    position: [FRONT_AXLE[0], FRONT_AXLE[1], 0],
    rotation: [0, Math.PI / 2, 0],
    color: '#20201f',
    detachDir: [1, 0.4, 0.2],
  },
  {
    id: 'back-wheel',
    role: 'removable',
    geo: torus(0.42, 0.06, 24),
    position: [REAR_AXLE[0], REAR_AXLE[1], 0],
    rotation: [0, Math.PI / 2, 0],
    color: '#20201f',
    detachDir: [-1, 0.4, -0.2],
  },
  {
    id: 'seat',
    role: 'removable',
    geo: cyl(0.12, 0.1, 0.24, 16),
    position: [SEAT_TOP[0], SEAT_TOP[1] + 0.13, 0],
    color: '#2a1c10',
    detachDir: [0, 1, 0],
  },
  {
    id: 'chain',
    role: 'removable',
    geo: torus(0.16, 0.02, 16),
    position: [BOTTOM_BRACKET[0], BOTTOM_BRACKET[1], 0],
    rotation: [Math.PI / 2, 0, 0],
    color: '#4a4a4a',
    metalness: 0.7,
    detachDir: [0, -1, 0.4],
  },
  {
    id: 'bell',
    role: 'switch',
    geo: sph(0.07, 16),
    position: [HEAD_TOP[0] + 0.24, HEAD_TOP[1] + 0.12, 0.1],
    color: '#d9622b',
    metalness: 0.5,
  },
  { id: 'weld-bb', role: 'weld', geo: sph(0.09, 14), position: [BOTTOM_BRACKET[0], BOTTOM_BRACKET[1] - 0.14, 0], color: '#ffb347' },
  { id: 'weld-head', role: 'weld', geo: sph(0.09, 14), position: [HEAD_TOP[0] + 0.04, HEAD_TOP[1] + 0.04, 0], color: '#ffb347' },
  { id: 'weld-seat', role: 'weld', geo: sph(0.09, 14), position: [SEAT_TOP[0], SEAT_TOP[1] + 0.04, 0], color: '#ffb347' },
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
    if (bell) bell.position.y = HEAD_TOP[1] + 0.12 + Math.sin(t * 20) * 0.02;
    const axle = parts.get('crank-axle');
    if (axle) axle.rotation.y = angle * 0.6;
    const pa = parts.get('pedal-a');
    const pb = parts.get('pedal-b');
    if (pa) {
      pa.position.x = BOTTOM_BRACKET[0] + Math.cos(angle * 0.6) * 0.17;
      pa.position.y = BOTTOM_BRACKET[1] + Math.sin(angle * 0.6) * 0.17;
    }
    if (pb) {
      pb.position.x = BOTTOM_BRACKET[0] + Math.cos(angle * 0.6 + Math.PI) * 0.17;
      pb.position.y = BOTTOM_BRACKET[1] + Math.sin(angle * 0.6 + Math.PI) * 0.17;
    }
  },
};

// ---------------------------------------------------------------- TYPEWRITER
const TYPED_TEXT = 'a oficina continua...';
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
    id: 'roller-knob-l',
    role: 'detail',
    geo: cyl(0.09, 0.09, 0.06, 14),
    position: [-0.7, 0.72, -0.42],
    rotation: [0, 0, Math.PI / 2],
    color: '#1c1c1c',
  },
  {
    id: 'roller-knob-r',
    role: 'detail',
    geo: cyl(0.09, 0.09, 0.06, 14),
    position: [0.7, 0.72, -0.42],
    rotation: [0, 0, Math.PI / 2],
    color: '#1c1c1c',
  },
  {
    id: 'paper',
    role: 'detail',
    geo: box(0.82, 0.55, 0.015),
    position: [0, 1.02, -0.48],
    rotation: [-0.12, 0, 0],
    textureFn: drawBlankPaper,
    textureAspect: [220, 150],
  },
  {
    id: 'keys',
    role: 'removable',
    geo: box(1.0, 0.1, 0.55),
    position: [0, 0.5, 0.18],
    textureFn: drawKeyRows,
    textureAspect: [220, 44],
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
    id: 'ribbon-spool-2',
    role: 'detail',
    geo: cyl(0.1, 0.1, 0.16, 14),
    position: [-0.55, 0.53, -0.28],
    color: '#3a1c2a',
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
    const paper = parts.get('paper') as THREE.Mesh | undefined;
    if (paper) {
      const mat = paper.material as THREE.MeshStandardMaterial;
      const tex = mat.map;
      const canvas = tex?.image as HTMLCanvasElement | undefined;
      if (canvas) {
        const chars = Math.min(TYPED_TEXT.length, Math.floor(t * 5));
        drawTypedPaper(canvas.getContext('2d')!, canvas.width, canvas.height, TYPED_TEXT, chars);
        tex!.needsUpdate = true;
      }
    }
  },
};

// ---------------------------------------------------------------- CLOCK
// A wall clock with a printed face, swinging pendulum and a brass winding key.
const CLOCK_CX = 0;
const CLOCK_CY = 0.95;
const PENDULUM_PIVOT: [number, number, number] = [0, 0.42, 0.06];
const PENDULUM_LEN = 0.4;

const clockParts: Part3DSpec[] = [
  {
    id: 'case',
    role: 'body',
    bodyStyle: 'wood',
    geo: cyl(0.62, 0.62, 0.16, 32),
    position: [CLOCK_CX, CLOCK_CY, 0],
    rotation: [Math.PI / 2, 0, 0],
  },
  {
    id: 'crown',
    role: 'detail',
    geo: sph(0.07, 16),
    position: [0, 1.43, 0],
    color: '#c9a24a',
    metalness: 0.6,
  },
  {
    id: 'face',
    role: 'detail',
    geo: cyl(0.54, 0.54, 0.02, 32),
    position: [CLOCK_CX, CLOCK_CY, 0.1],
    rotation: [Math.PI / 2, 0, 0],
    textureFn: drawClockFace,
    textureAspect: [220, 220],
  },
  {
    id: 'pendulum-box',
    role: 'detail',
    geo: box(0.34, 0.4, 0.16),
    position: [0, 0.38, 0.02],
    color: '#4a3020',
  },
  {
    id: 'hour-hand',
    role: 'detail',
    geo: pivotBox(0.24, 0.045, 0.015),
    position: [CLOCK_CX, CLOCK_CY, 0.13],
    color: '#1a1a1a',
  },
  {
    id: 'minute-hand',
    role: 'detail',
    geo: pivotBox(0.34, 0.03, 0.015),
    position: [CLOCK_CX, CLOCK_CY, 0.14],
    color: '#1a1a1a',
  },
  {
    id: 'pendulum-rod',
    role: 'detail',
    geo: pivotCyl(0.012, PENDULUM_LEN, 8),
    position: PENDULUM_PIVOT,
    color: '#c9a24a',
    metalness: 0.6,
  },
  {
    id: 'pendulum-bob',
    role: 'detail',
    geo: sph(0.08, 16),
    position: [PENDULUM_PIVOT[0], PENDULUM_PIVOT[1] - PENDULUM_LEN, PENDULUM_PIVOT[2]],
    color: '#c9a24a',
    metalness: 0.65,
    roughness: 0.3,
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
    const bob = parts.get('pendulum-bob');
    const angle = Math.sin(t * 3) * 0.3;
    if (rod) rod.rotation.z = angle;
    if (bob) {
      bob.position.set(
        PENDULUM_PIVOT[0] + Math.sin(angle) * PENDULUM_LEN,
        PENDULUM_PIVOT[1] - Math.cos(angle) * PENDULUM_LEN,
        PENDULUM_PIVOT[2]
      );
    }
  },
};

export const SHAPES3D: Record<ShapeId, Shape3D> = { radio, musicbox, bike, typewriter, clock };
