import * as THREE from 'three';
import { Pickup, RescueTarget, WorldZone, ZoneKind } from '../types';
import { WAGON_WIDTH } from './Train';
import { toonMat } from './ToonMaterial';

const RAIL_GAUGE = 1.4;
const SPAWN_AHEAD = 220; // generate zones/props up to this far ahead of the engine
const CULL_BEHIND = 40; // remove props once this far behind the caboose

// bright, saturated, toy-box palette — legible at a glance, not realistic
const RAIL_COLOR = 0xe8edf5;
const TIE_COLOR = 0x8a5a34;
const PLATFORM_COLOR = 0xf2c94c;
const BUILDING_COLORS = [0xff6f61, 0x56ccf2, 0xbb6bd9, 0xf2994a, 0x6fcf97];
const CRATE_COLOR = 0xf2994a;
const RESCUE_GROUND_COLOR = 0x9fd989;
const PASSENGER_OUTFITS = [0xffd166, 0x56ccf2, 0xbb6bd9, 0xff6f61, 0x6fcf97];
const ANIMAL_COLORS = [0xd88c4e, 0xf2f2f2, 0x6b4a30, 0xe0c097];

interface Biome {
  name: string;
  ground: number;
  sky: number;
  rock: number;
  scenery: 'pine' | 'cactus' | 'snowpine';
  leaf: number;
  trunk: number;
}

// the world cycles through these forever — long runs keep seeing new scenery
// instead of the same forest for 10 straight minutes
const BIOMES: Biome[] = [
  { name: 'pradaria', ground: 0x6fcf6a, sky: 0x8fd8ff, rock: 0x8d6e63, scenery: 'pine', leaf: 0x3fae4a, trunk: 0x7a4a2b },
  { name: 'deserto', ground: 0xe0c068, sky: 0xffdfa3, rock: 0xc97b5a, scenery: 'cactus', leaf: 0x4a9e5c, trunk: 0x3a7d48 },
  { name: 'nevado', ground: 0xe8f0f5, sky: 0xcfe3ee, rock: 0x8a97a3, scenery: 'snowpine', leaf: 0xeaf3f7, trunk: 0x5c4a3a },
];
const BIOME_PERIOD = 900; // world units of track per biome before cycling to the next

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
  private groundMesh!: THREE.Mesh;

  constructor(private scene: THREE.Scene) {
    scene.add(this.group);
    this.buildGround();
    this.group.add(this.tieGroup);
  }

  private biomeAt(z: number): Biome {
    const idx = Math.floor(Math.max(0, z) / BIOME_PERIOD) % BIOMES.length;
    return BIOMES[idx];
  }

  /** Read by Game.ts to blend the sky/fog toward whatever biome the train is currently passing through. */
  getBiomeSkyColor(z: number): THREE.Color {
    return new THREE.Color(this.biomeAt(z).sky);
  }

  private buildGround() {
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(400, 4000, 1, 1), toonMat(BIOMES[0].ground));
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(0, -0.02, 1800);
    ground.receiveShadow = true;
    this.group.add(ground);
    this.groundMesh = ground;

    for (const side of [-1, 1]) {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.15, 4000), toonMat(RAIL_COLOR));
      rail.position.set(side * RAIL_GAUGE, 0.05, 1800);
      this.group.add(rail);
    }
  }

  private ensureTies(engineZ: number) {
    const spacing = 2.2;
    while (this.ties.length < 260) {
      const tie = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.14, 0.5), toonMat(TIE_COLOR));
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

  update(engineZ: number, tailZ: number, dt = 1 / 60) {
    this.ensureTies(engineZ);

    const groundMat = this.groundMesh.material as THREE.MeshToonMaterial;
    groundMat.color.lerp(new THREE.Color(this.biomeAt(engineZ).ground), Math.min(1, dt * 0.6));

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

  /** One of four distinct building silhouettes, picked at random, so a skyline never looks copy-pasted. */
  private buildCityBuilding(bx: number, bz: number) {
    const color = BUILDING_COLORS[Math.floor(Math.random() * BUILDING_COLORS.length)];
    const trim = toonMat(0xffffff);
    const archetype = Math.floor(Math.random() * 4);
    const g = new THREE.Group();

    if (archetype === 0) {
      // tower: tall box, pyramid-cap roof
      const h = 6 + Math.random() * 8;
      const body = new THREE.Mesh(new THREE.BoxGeometry(3 + Math.random(), h, 3 + Math.random()), toonMat(color));
      body.position.y = h / 2;
      g.add(body);
      const roof = new THREE.Mesh(new THREE.ConeGeometry(2.4, 1.6, 4), trim);
      roof.rotation.y = Math.PI / 4;
      roof.position.y = h + 0.8;
      g.add(roof);
    } else if (archetype === 1) {
      // warehouse: low, wide, flat roof with a bright stripe
      const h = 3 + Math.random() * 1.5;
      const w = 5 + Math.random() * 2.5;
      const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, 4 + Math.random() * 1.5), toonMat(color));
      body.position.y = h / 2;
      g.add(body);
      const stripe = new THREE.Mesh(new THREE.BoxGeometry(w + 0.05, 0.5, 0.1), trim);
      stripe.position.set(0, h * 0.6, 2.05);
      g.add(stripe);
    } else if (archetype === 2) {
      // shop: small cube with a triangular awning over the "door" side
      const h = 2.4 + Math.random() * 1.2;
      const body = new THREE.Mesh(new THREE.BoxGeometry(2.6, h, 2.6), toonMat(color));
      body.position.y = h / 2;
      g.add(body);
      const awning = new THREE.Mesh(new THREE.ConeGeometry(2, 0.9, 4), trim);
      awning.rotation.y = Math.PI / 4;
      awning.position.y = h + 0.3;
      g.add(awning);
    } else {
      // silo: cylinder with a domed cap — breaks up the all-box skyline
      const h = 4 + Math.random() * 5;
      const r = 1.4 + Math.random() * 0.6;
      const body = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 12), toonMat(color));
      body.position.y = h / 2;
      g.add(body);
      const dome = new THREE.Mesh(new THREE.SphereGeometry(r, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), trim);
      dome.position.y = h;
      g.add(dome);
    }

    g.position.set(bx, 0, bz);
    g.rotation.y = Math.random() * Math.PI * 2;
    this.group.add(g);
    this.props.push({ z: bz, mesh: g });
  }

  private buildCityZone(zone: WorldZone) {
    const x = this.platformX(zone.side);
    // platform slab
    const platform = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.5, zone.endZ - zone.startZ), toonMat(PLATFORM_COLOR));
    platform.position.set(x, 0.25, (zone.startZ + zone.endZ) / 2);
    this.group.add(platform);
    this.props.push({ z: zone.endZ, mesh: platform });

    // a skyline of mixed building archetypes, so every city reads differently
    const buildingCount = 5 + Math.floor(Math.random() * 4);
    for (let i = 0; i < buildingCount; i++) {
      const bx = x + zone.side * (5 + Math.random() * 7);
      const bz = zone.startZ + Math.random() * (zone.endZ - zone.startZ);
      this.buildCityBuilding(bx, bz);
    }

    // resource crates along the platform
    const crateCount = 4 + Math.floor(Math.random() * 3);
    for (let i = 0; i < crateCount; i++) {
      const z = zone.startZ + 6 + (i / crateCount) * (zone.endZ - zone.startZ - 10) + (Math.random() - 0.5) * 4;
      const crate: Pickup = { id: idSeq++, x, z, taken: false, value: 5 + Math.floor(Math.random() * 6) };
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.7, 0.7), toonMat(CRATE_COLOR));
      mesh.position.set(x, 0.85, z);
      crate.mesh = mesh;
      this.group.add(mesh);
      zone.pickups.push(crate);
    }
  }

  private buildRescueZone(zone: WorldZone) {
    const x = this.platformX(zone.side) - 0.6;
    const ground = new THREE.Mesh(new THREE.BoxGeometry(3, 0.3, zone.endZ - zone.startZ), toonMat(RESCUE_GROUND_COLOR));
    ground.position.set(x, 0.15, (zone.startZ + zone.endZ) / 2);
    this.group.add(ground);
    this.props.push({ z: zone.endZ, mesh: ground });

    const count = 1 + Math.floor(Math.random() * 3);
    for (let i = 0; i < count; i++) {
      const z = zone.startZ + 6 + (i / count) * (zone.endZ - zone.startZ - 10);
      const kind: 'passenger' | 'animal' = Math.random() < 0.5 ? 'passenger' : 'animal';
      const target: RescueTarget = { id: idSeq++, x, z, kind, rescued: false, lost: false };
      const mesh = this.buildRescueFigure(kind);
      mesh.position.set(x, 0, z);
      target.mesh = mesh;
      this.group.add(mesh);
      zone.rescues.push(target);
    }
  }

  /** Passengers vary by outfit color; animals come in three distinct silhouettes — nobody looks copy-pasted. */
  private buildRescueFigure(kind: 'passenger' | 'animal'): THREE.Group {
    const mesh = new THREE.Group();

    if (kind === 'passenger') {
      const outfit = PASSENGER_OUTFITS[Math.floor(Math.random() * PASSENGER_OUTFITS.length)];
      const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.28, 0.7, 4, 8), toonMat(outfit));
      body.position.y = 1.0;
      mesh.add(body);
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.24, 10, 8), toonMat(0xffe0b0));
      head.position.y = 1.55;
      mesh.add(head);
      const flag = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.4, 6), toonMat(0xff4d4d));
      flag.position.y = 2.1;
      flag.name = 'flag';
      mesh.add(flag);
      return mesh;
    }

    const archetype = Math.floor(Math.random() * 3);
    const color = ANIMAL_COLORS[Math.floor(Math.random() * ANIMAL_COLORS.length)];
    const bodyMat = toonMat(color);
    let flagY = 1.3;

    if (archetype === 0) {
      // dog: compact body, perky triangular ears, a wagging tail
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.42, 0.34), bodyMat);
      body.position.y = 0.36;
      mesh.add(body);
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 8), bodyMat);
      head.position.set(0, 0.55, 0.32);
      mesh.add(head);
      for (const dx of [-0.12, 0.12]) {
        const ear = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.18, 4), bodyMat);
        ear.position.set(dx, 0.72, 0.32);
        mesh.add(ear);
      }
      const tail = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.32, 6), bodyMat);
      tail.rotation.x = Math.PI / 2.4;
      tail.position.set(0, 0.5, -0.32);
      mesh.add(tail);
      flagY = 1.1;
    } else if (archetype === 1) {
      // cat: smaller, sleeker, tall pointed ears
      const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.16, 0.32, 4, 8), bodyMat);
      body.rotation.z = Math.PI / 2;
      body.position.y = 0.24;
      mesh.add(body);
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 8), bodyMat);
      head.position.set(0, 0.36, 0.24);
      mesh.add(head);
      for (const dx of [-0.09, 0.09]) {
        const ear = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.14, 4), bodyMat);
        ear.position.set(dx, 0.48, 0.24);
        mesh.add(ear);
      }
      flagY = 0.9;
    } else {
      // a larger farm animal (cow-like) — bigger, needs a proportionally bigger flag
      const body = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.62, 0.5), bodyMat);
      body.position.y = 0.5;
      mesh.add(body);
      const head = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 0.4), bodyMat);
      head.position.set(0, 0.6, 0.5);
      mesh.add(head);
      const spotMat = toonMat(0xffffff);
      const spot = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.25, 0.05), spotMat);
      spot.position.set(0.2, 0.55, 0.53);
      mesh.add(spot);
      flagY = 1.6;
    }

    const flag = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.4, 6), toonMat(0xff4d4d));
    flag.position.y = flagY;
    flag.name = 'flag';
    mesh.add(flag);
    return mesh;
  }

  private buildRaidMarker(zone: WorldZone) {
    // visual dust/warning marker along the track to telegraph danger
    const rockColor = this.biomeAt(zone.startZ).rock;
    for (let i = 0; i < 3; i++) {
      const z = zone.startZ + (i / 3) * (zone.endZ - zone.startZ);
      const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.6 + Math.random() * 0.5), toonMat(rockColor));
      rock.position.set((Math.random() < 0.5 ? -1 : 1) * (4 + Math.random() * 3), 0.5, z);
      this.group.add(rock);
      this.props.push({ z, mesh: rock });
    }
  }

  private maybeSpawnScenery(aheadZ: number) {
    const side = Math.random() < 0.5 ? -1 : 1;
    const x = side * (7 + Math.random() * 10);
    const z = aheadZ + Math.random() * 20;
    const biome = this.biomeAt(z);
    const tree = new THREE.Group();

    if (biome.scenery === 'cactus') {
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.4, 2.2 + Math.random(), 8), toonMat(biome.leaf));
      trunk.position.y = 1.2;
      tree.add(trunk);
      for (const side2 of [-1, 1]) {
        if (Math.random() < 0.7) {
          const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.22, 1, 6), toonMat(biome.leaf));
          arm.position.set(side2 * 0.4, 1.6, 0);
          arm.rotation.z = side2 * 0.5;
          tree.add(arm);
        }
      }
    } else {
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.24, 1.1, 6), toonMat(biome.trunk));
      trunk.position.y = 0.55;
      tree.add(trunk);
      const leaves = new THREE.Mesh(new THREE.ConeGeometry(1 + Math.random(), 3 + Math.random() * 3, 7), toonMat(biome.leaf));
      leaves.position.y = 2.4;
      tree.add(leaves);
      if (biome.scenery === 'snowpine') {
        const cap = new THREE.Mesh(new THREE.ConeGeometry(0.55 + Math.random() * 0.3, 0.8, 7), toonMat(0xffffff));
        cap.position.y = 3.6 + Math.random();
        tree.add(cap);
      }
    }

    tree.position.set(x, 0, z);
    tree.scale.setScalar(0.8 + Math.random() * 0.6);
    this.group.add(tree);
    this.props.push({ z, mesh: tree });
  }

  zoneAt(z: number): WorldZone | undefined {
    return this.zones.find((zn) => z >= zn.startZ && z <= zn.endZ);
  }
}
