import * as THREE from 'three';
import { Pickup, RescueTarget, WorldZone, ZoneKind } from '../types';
import { WAGON_WIDTH } from './Train';

const RAIL_GAUGE = 1.4;
const SPAWN_AHEAD = 220; // generate zones/props up to this far ahead of the engine
const CULL_BEHIND = 40; // remove props once this far behind the caboose

let idSeq = 1;

interface Prop {
  z: number;
  mesh: THREE.Object3D;
}

export class Track {
  group = new THREE.Group();
  zones: WorldZone[] = [];
  private props: Prop[] = [];
  private nextZoneZ = 60;
  private tieGroup = new THREE.Group();
  private ties: THREE.Mesh[] = [];
  private difficulty = 0;

  constructor(private scene: THREE.Scene) {
    scene.add(this.group);
    this.buildGround();
    this.group.add(this.tieGroup);
  }

  private buildGround() {
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(400, 4000, 1, 1),
      new THREE.MeshStandardMaterial({ color: 0x3a4c34, roughness: 1 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(0, -0.02, 1800);
    ground.receiveShadow = true;
    this.group.add(ground);

    for (const side of [-1, 1]) {
      const rail = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 0.15, 4000),
        new THREE.MeshStandardMaterial({ color: 0x8a8f99, metalness: 0.8, roughness: 0.3 })
      );
      rail.position.set(side * RAIL_GAUGE, 0.05, 1800);
      this.group.add(rail);
    }
  }

  private ensureTies(engineZ: number) {
    const spacing = 2.2;
    while (this.ties.length < 260) {
      const tie = new THREE.Mesh(
        new THREE.BoxGeometry(2.2, 0.14, 0.5),
        new THREE.MeshStandardMaterial({ color: 0x3c2a1d, roughness: 1 })
      );
      this.ties.push(tie);
      this.tieGroup.add(tie);
    }
    const startIndex = Math.floor((engineZ - 20) / spacing);
    for (let i = 0; i < this.ties.length; i++) {
      this.ties[i].position.set(0, 0, (startIndex + i) * spacing);
    }
  }

  setDifficulty(d: number) {
    this.difficulty = d;
  }

  update(engineZ: number, tailZ: number) {
    this.ensureTies(engineZ);

    // spawn new zones ahead
    while (this.nextZoneZ < engineZ + SPAWN_AHEAD) {
      const gap = 55 + Math.random() * 45;
      this.nextZoneZ += gap;
      this.spawnZone(this.nextZoneZ);
      this.nextZoneZ += this.zoneLength(this.zones[this.zones.length - 1]);
    }

    // cull old zones/props behind the train
    const cullZ = tailZ - CULL_BEHIND;
    for (const zone of this.zones) {
      if (zone.endZ < cullZ && !(zone as any)._cleaned) {
        this.cleanupZone(zone);
      }
    }
    this.zones = this.zones.filter((z) => z.endZ >= cullZ);
    for (const p of this.props) {
      if (p.z < cullZ) this.group.remove(p.mesh);
    }
    this.props = this.props.filter((p) => p.z >= cullZ);

    // scatter ambient scenery opportunistically
    if (Math.random() < 0.4) this.maybeSpawnScenery(engineZ + SPAWN_AHEAD);
  }

  private zoneLength(z: WorldZone) {
    return z.endZ - z.startZ;
  }

  private pickZoneKind(): ZoneKind {
    const r = Math.random();
    if (r < 0.32) return 'city';
    if (r < 0.55) return 'rescue';
    if (r < 0.55 + Math.min(0.3, 0.12 + this.difficulty * 0.03)) return 'raid';
    return 'calm';
  }

  private spawnZone(startZ: number) {
    const kind = this.pickZoneKind();
    const side: 1 | -1 = Math.random() < 0.5 ? 1 : -1;
    const length = kind === 'city' ? 46 : kind === 'rescue' ? 30 : kind === 'raid' ? 40 : 24;
    const zone: WorldZone = {
      id: idSeq++,
      kind,
      startZ,
      endZ: startZ + length,
      side,
      spent: false,
      pickups: [],
      rescues: [],
    };
    this.zones.push(zone);

    if (kind === 'city') this.buildCityZone(zone);
    else if (kind === 'rescue') this.buildRescueZone(zone);
    else if (kind === 'raid') this.buildRaidMarker(zone);
  }

  private cleanupZone(zone: WorldZone) {
    (zone as any)._cleaned = true;
    for (const p of zone.pickups) if (p.mesh) this.group.remove(p.mesh);
    for (const r of zone.rescues) if (r.mesh) this.group.remove(r.mesh);
  }

  private platformX(side: number) {
    return side * (WAGON_WIDTH / 2 + 2.4);
  }

  private buildCityZone(zone: WorldZone) {
    const x = this.platformX(zone.side);
    // platform slab
    const platform = new THREE.Mesh(
      new THREE.BoxGeometry(2.8, 0.5, zone.endZ - zone.startZ),
      new THREE.MeshStandardMaterial({ color: 0x5a5f66, roughness: 0.9 })
    );
    platform.position.set(x, 0.25, (zone.startZ + zone.endZ) / 2);
    this.group.add(platform);
    this.props.push({ z: zone.endZ, mesh: platform });

    // buildings behind the platform for skyline flavor
    const buildingCount = 4 + Math.floor(Math.random() * 3);
    for (let i = 0; i < buildingCount; i++) {
      const h = 4 + Math.random() * 10;
      const b = new THREE.Mesh(
        new THREE.BoxGeometry(3 + Math.random() * 2, h, 3 + Math.random() * 2),
        new THREE.MeshStandardMaterial({ color: 0x293042 + Math.floor(Math.random() * 0x050505), roughness: 0.8 })
      );
      b.position.set(x + zone.side * (5 + Math.random() * 6), h / 2, zone.startZ + Math.random() * (zone.endZ - zone.startZ));
      this.group.add(b);
      this.props.push({ z: b.position.z, mesh: b });
    }

    // resource crates along the platform
    const crateCount = 4 + Math.floor(Math.random() * 3);
    for (let i = 0; i < crateCount; i++) {
      const z = zone.startZ + 6 + (i / crateCount) * (zone.endZ - zone.startZ - 10) + (Math.random() - 0.5) * 4;
      const crate: Pickup = { id: idSeq++, x, z, taken: false, value: 5 + Math.floor(Math.random() * 6) };
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.7, 0.7, 0.7),
        new THREE.MeshStandardMaterial({ color: 0xd9a441, roughness: 0.6 })
      );
      mesh.position.set(x, 0.85, z);
      crate.mesh = mesh;
      this.group.add(mesh);
      zone.pickups.push(crate);
    }
  }

  private buildRescueZone(zone: WorldZone) {
    const x = this.platformX(zone.side) - 0.6;
    const ground = new THREE.Mesh(
      new THREE.BoxGeometry(3, 0.3, zone.endZ - zone.startZ),
      new THREE.MeshStandardMaterial({ color: 0x4a5334, roughness: 1 })
    );
    ground.position.set(x, 0.15, (zone.startZ + zone.endZ) / 2);
    this.group.add(ground);
    this.props.push({ z: zone.endZ, mesh: ground });

    const count = 1 + Math.floor(Math.random() * 3);
    for (let i = 0; i < count; i++) {
      const z = zone.startZ + 6 + (i / count) * (zone.endZ - zone.startZ - 10);
      const kind: 'passenger' | 'animal' = Math.random() < 0.5 ? 'passenger' : 'animal';
      const target: RescueTarget = { id: idSeq++, x, z, kind, rescued: false, lost: false };
      const mesh = new THREE.Group();
      const bodyColor = kind === 'passenger' ? 0xffd27f : 0xb5723c;
      const body = new THREE.Mesh(
        kind === 'passenger' ? new THREE.CapsuleGeometry(0.28, 0.7, 4, 8) : new THREE.BoxGeometry(0.9, 0.5, 0.4),
        new THREE.MeshStandardMaterial({ color: bodyColor })
      );
      body.position.y = kind === 'passenger' ? 1.0 : 0.4;
      mesh.add(body);
      mesh.position.set(x, 0, z);
      target.mesh = mesh;
      this.group.add(mesh);
      zone.rescues.push(target);
    }
  }

  private buildRaidMarker(zone: WorldZone) {
    // visual dust/warning marker along the track to telegraph danger
    for (let i = 0; i < 3; i++) {
      const z = zone.startZ + (i / 3) * (zone.endZ - zone.startZ);
      const rock = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.6 + Math.random() * 0.5),
        new THREE.MeshStandardMaterial({ color: 0x3a2f28, roughness: 1 })
      );
      rock.position.set((Math.random() < 0.5 ? -1 : 1) * (4 + Math.random() * 3), 0.5, z);
      this.group.add(rock);
      this.props.push({ z, mesh: rock });
    }
  }

  private maybeSpawnScenery(aheadZ: number) {
    const side = Math.random() < 0.5 ? -1 : 1;
    const x = side * (7 + Math.random() * 10);
    const z = aheadZ + Math.random() * 20;
    const tree = new THREE.Mesh(
      new THREE.ConeGeometry(1 + Math.random(), 3 + Math.random() * 3, 6),
      new THREE.MeshStandardMaterial({ color: 0x2f5d34, roughness: 1 })
    );
    tree.position.set(x, 1.8, z);
    this.group.add(tree);
    this.props.push({ z, mesh: tree });
  }

  zoneAt(z: number): WorldZone | undefined {
    return this.zones.find((zn) => z >= zn.startZ && z <= zn.endZ);
  }
}
