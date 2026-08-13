import * as THREE from 'three';
import { WagonKind, WagonState } from '../types';

export const WAGON_LENGTH = 6;
export const WAGON_GAP = 0.7;
export const WAGON_SPACING = WAGON_LENGTH + WAGON_GAP;
export const WAGON_WIDTH = 2.6;
export const WAGON_ROOF_HALF = WAGON_WIDTH / 2 - 0.35;

const KIND_COLOR: Record<WagonKind, number> = {
  engine: 0x2b3550,
  cargo: 0x6b4a2f,
  passenger: 0x35506b,
  tank: 0x4a4a52,
  flat: 0x555f42,
};

let wagonIdSeq = 1;

export class Train {
  group = new THREE.Group();
  wagons: WagonState[] = [];
  meshes = new Map<number, THREE.Group>();
  z = 0; // world z of the engine's front face; train travels toward +z
  speed = 15;
  baseSpeed = 15;
  maxSpeed = 34;

  constructor(private scene: THREE.Scene) {
    scene.add(this.group);
    this.addWagon('engine');
    this.addWagon('cargo');
    this.addWagon('cargo');
  }

  get length() {
    return this.wagons.length * WAGON_SPACING;
  }

  get tailZ() {
    // z of the very back of the last wagon
    const last = this.wagons[this.wagons.length - 1];
    return this.wagonFrontZ(last) + WAGON_LENGTH;
  }

  wagonFrontZ(w: WagonState) {
    return this.z + w.index * WAGON_SPACING;
  }

  wagonCenterZ(w: WagonState) {
    return this.wagonFrontZ(w) + WAGON_LENGTH / 2;
  }

  addWagon(kind: WagonKind) {
    const index = this.wagons.length;
    const state: WagonState = {
      id: wagonIdSeq++,
      index,
      kind,
      hp: 100,
      maxHp: 100,
      fire: 0,
      raider: false,
      raiderHp: 0,
      z: 0,
      resources: 0,
      destroyed: false,
    };
    this.wagons.push(state);
    const mesh = this.buildWagonMesh(state);
    this.meshes.set(state.id, mesh);
    this.group.add(mesh);
    return state;
  }

  private buildWagonMesh(w: WagonState): THREE.Group {
    const g = new THREE.Group();
    const bodyMat = new THREE.MeshStandardMaterial({ color: KIND_COLOR[w.kind], roughness: 0.7, metalness: 0.25 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(WAGON_WIDTH, 1.8, WAGON_LENGTH), bodyMat);
    body.position.y = 1.4;
    body.castShadow = true;
    body.receiveShadow = true;
    g.add(body);

    // roof walkway (slightly darker, flat, is where players run)
    const roof = new THREE.Mesh(
      new THREE.BoxGeometry(WAGON_WIDTH - 0.2, 0.12, WAGON_LENGTH - 0.2),
      new THREE.MeshStandardMaterial({ color: 0x1c2333, roughness: 0.9 })
    );
    roof.position.y = 2.36;
    roof.receiveShadow = true;
    g.add(roof);

    // wheels
    const wheelGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.25, 12);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111318, metalness: 0.5, roughness: 0.5 });
    for (const dx of [-1, 1]) {
      for (const dz of [-1.8, 1.8]) {
        const wheel = new THREE.Mesh(wheelGeo, wheelMat);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(dx * (WAGON_WIDTH / 2), 0.5, dz);
        g.add(wheel);
      }
    }

    if (w.kind === 'engine') {
      const nose = new THREE.Mesh(
        new THREE.ConeGeometry(1.5, 2, 4),
        new THREE.MeshStandardMaterial({ color: 0x3a4666, metalness: 0.4, roughness: 0.5 })
      );
      nose.rotation.x = Math.PI / 2;
      nose.rotation.y = Math.PI / 4;
      nose.position.set(0, 1.4, -WAGON_LENGTH / 2 - 0.6);
      g.add(nose);
      const chimney = new THREE.Mesh(
        new THREE.CylinderGeometry(0.25, 0.3, 1.2, 8),
        new THREE.MeshStandardMaterial({ color: 0x222222 })
      );
      chimney.position.set(0, 3, -1.5);
      g.add(chimney);
    }

    // fire sprite (billboard-ish cone group), hidden until fire > 0
    const fire = new THREE.PointLight(0xff6a1a, 0, 8, 2);
    fire.position.set(0, 2.8, 0);
    fire.name = 'firelight';
    g.add(fire);
    const fireMesh = new THREE.Mesh(
      new THREE.ConeGeometry(0.5, 1.1, 6),
      new THREE.MeshBasicMaterial({ color: 0xff5522, transparent: true, opacity: 0 })
    );
    fireMesh.position.set(0, 3.0, 0);
    fireMesh.name = 'fireMesh';
    g.add(fireMesh);

    return g;
  }

  syncMeshes(elapsed: number) {
    for (const w of this.wagons) {
      const mesh = this.meshes.get(w.id);
      if (!mesh) continue;
      const centerZ = this.wagonCenterZ(w);
      mesh.position.set(0, 0, centerZ);
      mesh.visible = !w.destroyed;
      const wobble = w.fire > 0 ? Math.sin(elapsed * 40) * 0.02 : 0;
      mesh.position.x = wobble;

      const fireMesh = mesh.getObjectByName('fireMesh') as THREE.Mesh | undefined;
      const fireLight = mesh.getObjectByName('firelight') as THREE.PointLight | undefined;
      if (fireMesh) {
        const mat = fireMesh.material as THREE.MeshBasicMaterial;
        mat.opacity = w.fire > 0 ? 0.85 : 0;
        fireMesh.scale.setScalar(0.6 + (w.fire / 100) * 1.2 + Math.sin(elapsed * 25) * 0.08);
      }
      if (fireLight) fireLight.intensity = w.fire > 0 ? 1.5 + (w.fire / 100) * 3 : 0;

      const body = mesh.children[0] as THREE.Mesh;
      if (body && body.material) {
        const mat = body.material as THREE.MeshStandardMaterial;
        const dmg = 1 - w.hp / w.maxHp;
        mat.color.setRGB(
          (KIND_COLOR[w.kind] >> 16 & 0xff) / 255 * (1 - dmg * 0.5) + dmg * 0.15,
          (KIND_COLOR[w.kind] >> 8 & 0xff) / 255 * (1 - dmg * 0.5),
          (KIND_COLOR[w.kind] & 0xff) / 255 * (1 - dmg * 0.5)
        );
      }
    }
  }

  /** Removes the last wagon (voluntary detach or destroyed by damage/fire). Returns lost resources. */
  detachLast(): { wagon: WagonState; lostResources: number } | null {
    if (this.wagons.length <= 1) return null; // never lose the engine
    const w = this.wagons.pop()!;
    w.destroyed = true;
    const mesh = this.meshes.get(w.id);
    if (mesh) {
      this.group.remove(mesh);
      this.meshes.delete(w.id);
    }
    return { wagon: w, lostResources: w.resources };
  }

  totalHp() {
    return this.wagons.reduce((s, w) => s + w.hp, 0);
  }
}
