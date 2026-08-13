import * as THREE from 'three';
import { WagonKind, WagonState } from '../types';
import { toonMat } from './ToonMaterial';

export const WAGON_LENGTH = 6;
export const WAGON_GAP = 0.7;
export const WAGON_SPACING = WAGON_LENGTH + WAGON_GAP;
export const WAGON_WIDTH = 2.6;
export const WAGON_ROOF_HALF = WAGON_WIDTH / 2 - 0.35;

// bright, toy-train palette — every wagon kind reads as a distinct building block
const KIND_COLOR: Record<WagonKind, number> = {
  engine: 0x3d5af1,
  cargo: 0xf2994a,
  passenger: 0xffd166,
  tank: 0x9ad1d4,
  flat: 0x8bc34a,
};
const KIND_ACCENT: Record<WagonKind, number> = {
  engine: 0xff4d4d,
  cargo: 0x8a5a34,
  passenger: 0x56ccf2,
  tank: 0x4d7ea8,
  flat: 0x5a7d2a,
};

let wagonIdSeq = 1;

export class Train {
  group = new THREE.Group();
  wagons: WagonState[] = [];
  meshes = new Map<number, THREE.Group>();
  private spawnAnim = new Map<number, number>(); // id -> time since spawn, drives the snap-in bounce
  z = 0; // world z of the engine's front face; train travels toward +z
  speed = 15;
  baseSpeed = 15;
  maxSpeed = 34;

  constructor(private scene: THREE.Scene) {
    scene.add(this.group);
    this.addWagon('engine');
    this.addWagon('cargo');
    this.addWagon('cargo');
    // the starting wagons shouldn't play the snap-in bounce
    this.spawnAnim.clear();
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
    if (index > 0) this.spawnAnim.set(state.id, 0);
    return state;
  }

  private buildWagonMesh(w: WagonState): THREE.Group {
    const g = new THREE.Group();
    const bodyMat = toonMat(KIND_COLOR[w.kind]);
    const body = new THREE.Mesh(new THREE.BoxGeometry(WAGON_WIDTH, 1.8, WAGON_LENGTH), bodyMat);
    body.position.y = 1.4;
    body.castShadow = true;
    body.receiveShadow = true;
    g.add(body);

    // roof walkway (slightly darker, flat, is where players run)
    const roof = new THREE.Mesh(new THREE.BoxGeometry(WAGON_WIDTH - 0.2, 0.12, WAGON_LENGTH - 0.2), toonMat(0x2b2f3a));
    roof.position.y = 2.36;
    roof.receiveShadow = true;
    g.add(roof);

    // chunky couplers front & back so the train visibly snaps together like building blocks
    const couplerMat = toonMat(0x2b2f3a);
    for (const dz of [-WAGON_LENGTH / 2 - 0.35, WAGON_LENGTH / 2 + 0.35]) {
      const coupler = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.3, 0.5), couplerMat);
      coupler.position.set(0, 0.9, dz);
      g.add(coupler);
    }

    // wheels
    const wheelGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.25, 12);
    const wheelMat = toonMat(0x232733);
    for (const dx of [-1, 1]) {
      for (const dz of [-1.8, 1.8]) {
        const wheel = new THREE.Mesh(wheelGeo, wheelMat);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(dx * (WAGON_WIDTH / 2), 0.5, dz);
        g.add(wheel);
      }
    }

    this.addKindModule(g, w);

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

  /** Distinct silhouette "modules" per wagon kind, so each block reads instantly at a glance. */
  private addKindModule(g: THREE.Group, w: WagonState) {
    const accent = toonMat(KIND_ACCENT[w.kind]);
    if (w.kind === 'engine') {
      const nose = new THREE.Mesh(new THREE.ConeGeometry(1.5, 2, 4), accent);
      nose.rotation.x = Math.PI / 2;
      nose.rotation.y = Math.PI / 4;
      nose.position.set(0, 1.4, -WAGON_LENGTH / 2 - 0.6);
      g.add(nose);
      const chimney = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.3, 1.2, 8), toonMat(0x232733));
      chimney.position.set(0, 3, -1.5);
      g.add(chimney);
    } else if (w.kind === 'cargo') {
      // stacked crates poking above the deck
      for (const dx of [-0.7, 0.7]) {
        const crate = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.9, 0.9), accent);
        crate.position.set(dx, 2.75, 0);
        g.add(crate);
      }
    } else if (w.kind === 'passenger') {
      // row of bright window squares
      for (let i = -2; i <= 2; i++) {
        const win = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.55, 0.05), accent);
        win.position.set(WAGON_WIDTH / 2 + 0.03, 1.55, i * 0.95);
        win.rotation.y = Math.PI / 2;
        g.add(win);
        const win2 = win.clone();
        win2.position.x = -WAGON_WIDTH / 2 - 0.03;
        g.add(win2);
      }
    } else if (w.kind === 'tank') {
      const tank = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, WAGON_LENGTH - 0.6, 12), accent);
      tank.rotation.z = Math.PI / 2;
      tank.position.y = 2.35;
      g.add(tank);
    } else if (w.kind === 'flat') {
      for (const dz of [-1.6, 0, 1.6]) {
        const box = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.7, 1.1), accent);
        box.position.set(0, 2.5, dz);
        box.rotation.y = (Math.random() - 0.5) * 0.3;
        g.add(box);
      }
    }
  }

  syncMeshes(elapsed: number, dt: number) {
    for (const w of this.wagons) {
      const mesh = this.meshes.get(w.id);
      if (!mesh) continue;
      const centerZ = this.wagonCenterZ(w);
      mesh.position.set(0, 0, centerZ);
      mesh.visible = !w.destroyed;
      const wobble = w.fire > 0 ? Math.sin(elapsed * 40) * 0.02 : 0;
      mesh.position.x = wobble;

      // playful, exaggerated snap-in bounce when a wagon is freshly coupled on
      const spawnT = this.spawnAnim.get(w.id);
      if (spawnT !== undefined) {
        const t = spawnT + dt;
        if (t < 0.5) {
          const p = t / 0.5;
          const bounce = 1 + Math.sin(p * Math.PI) * 0.35 * (1 - p);
          mesh.scale.set(bounce, 2 - bounce, bounce);
          this.spawnAnim.set(w.id, t);
        } else {
          mesh.scale.set(1, 1, 1);
          this.spawnAnim.delete(w.id);
        }
      }

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
        const mat = body.material as THREE.MeshToonMaterial;
        const dmg = 1 - w.hp / w.maxHp;
        mat.color.setRGB(
          ((KIND_COLOR[w.kind] >> 16) & 0xff) / 255 * (1 - dmg * 0.5) + dmg * 0.15,
          ((KIND_COLOR[w.kind] >> 8) & 0xff) / 255 * (1 - dmg * 0.5),
          (KIND_COLOR[w.kind] & 0xff) / 255 * (1 - dmg * 0.5)
        );
      }
    }
  }

  /**
   * Removes the last wagon (voluntary detach or destroyed by damage/fire).
   * The mesh is handed back (not disposed) so the caller can play an
   * exaggerated tumble-away wreck animation before discarding it.
   */
  detachLast(): { wagon: WagonState; mesh: THREE.Group; lostResources: number } | null {
    if (this.wagons.length <= 1) return null; // never lose the engine
    const w = this.wagons.pop()!;
    w.destroyed = true;
    const mesh = this.meshes.get(w.id)!;
    this.group.remove(mesh);
    this.meshes.delete(w.id);
    this.spawnAnim.delete(w.id);
    return { wagon: w, mesh, lostResources: w.resources };
  }

  totalHp() {
    return this.wagons.reduce((s, w) => s + w.hp, 0);
  }
}
