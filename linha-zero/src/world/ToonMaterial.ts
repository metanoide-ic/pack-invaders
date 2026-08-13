import * as THREE from 'three';

/**
 * A tiny stepped-gradient texture that turns any THREE.MeshToonMaterial into
 * flat, poster-like cel shading — the "stylized, no realism" look the game
 * wants instead of photoreal PBR lighting.
 */
let gradientTexture: THREE.DataTexture | null = null;

function getGradient(): THREE.DataTexture {
  if (gradientTexture) return gradientTexture;
  const steps = new Uint8Array([60, 130, 200, 255]);
  const tex = new THREE.DataTexture(steps, steps.length, 1, THREE.RedFormat);
  tex.needsUpdate = true;
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.generateMipmaps = false;
  gradientTexture = tex;
  return tex;
}

export function toonMat(color: number, opts: { emissive?: number } = {}): THREE.MeshToonMaterial {
  return new THREE.MeshToonMaterial({
    color,
    gradientMap: getGradient(),
    emissive: opts.emissive ?? 0x000000,
  });
}
