import * as THREE from 'three';
import type { StageType } from '../core/types';

export type PartRole = 'body' | 'removable' | 'weld' | 'switch' | 'detail';

export interface Part3DSpec {
  id: string;
  role: PartRole;
  geo: () => THREE.BufferGeometry;
  position: [number, number, number];
  rotation?: [number, number, number];
  color?: string;
  /** World-space direction the part flies off to when detached (disassemble stage). */
  detachDir?: [number, number, number];
  metalness?: number;
  roughness?: number;
  /** Only meaningful for role 'body': how the surface base is procedurally rendered. */
  bodyStyle?: 'wood' | 'plain';
  /** Optional procedural decal for non-body parts (dials, labels, grilles). Overrides `color` as a flat map. */
  textureFn?: (ctx: CanvasRenderingContext2D, w: number, h: number) => void;
  textureAspect?: [number, number];
}

export interface Shape3D {
  parts: Part3DSpec[];
  /** Looping "it works!" flourish. t = seconds since the test stage was activated. */
  testAnimate: (partsById: Map<string, THREE.Object3D>, t: number) => void;
}

export interface BodyPaintable {
  mesh: THREE.Mesh;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  texture: THREE.CanvasTexture;
}

export interface PartInstance {
  spec: Part3DSpec;
  object: THREE.Object3D;
  removed: boolean;
  originalPosition: THREE.Vector3;
  originalQuaternion: THREE.Quaternion;
}

export interface ItemInstance {
  group: THREE.Group;
  partsById: Map<string, PartInstance>;
  bodies: BodyPaintable[];
  shape: Shape3D;
}

export type ToolId = 'sponge' | 'wrench' | 'torch' | 'brush' | 'hand';

export const STAGE_TOOL: Record<StageType, ToolId> = {
  clean: 'sponge',
  disassemble: 'wrench',
  weld: 'torch',
  paint: 'brush',
  test: 'hand',
};

export interface ToolSpec {
  id: ToolId;
  label: string;
  icon: string;
  build: () => THREE.Object3D;
}
