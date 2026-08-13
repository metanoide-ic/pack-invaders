import * as THREE from 'three';
import { PlayerInput } from '../types';
import { Train, WAGON_GAP, WAGON_ROOF_HALF } from '../world/Train';
import { toonMat } from '../world/ToonMaterial';

const PLAYER_COLORS = [0xff8a3d, 0x3ddbff, 0x8bff6a, 0xff5ba0];
const PLAYER_NAMES = ['P1', 'P2', 'P3', 'P4'];
type HatKind = 'cone' | 'box' | 'dome' | 'ring';
const PLAYER_HATS: HatKind[] = ['cone', 'box', 'dome', 'ring'];

const GRAVITY = -26;
const JUMP_SPEED = 9.5;
const GROUND_Y_TRAIN = 2.42;
const GROUND_Y_OFF = 0;

export type CarryKind = 'resource' | 'passenger' | 'animal' | null;

export class Player {
  mesh = new THREE.Group();
  private squashRig = new THREE.Group();
  color: number;
  hat: HatKind;
  name: string;

  onTrain = true;
  trainOffsetZ = 4; // relative position along the whole train roof, world z = train.z + offset (approx, per-wagon)
  x = 0;
  z = 0; // world z, used only meaningfully while off-train
  y = 0;
  vy = 0;
  grounded = true;
  runSpeed = 19;

  carry: CarryKind = null;
  carryValue = 0;

  alive = true;
  respawnTimer = 0;
  missedFlashTimer = 0;
  actionCooldown = 0;

  // exaggerated "cartoon accident" tumble, played while missing the train
  private tumbleTime = 0;
  private tumbleAxis = new THREE.Vector3(1, 0, 0);
  private landingSquash = 0; // 0..1, decays after any hard landing — big springy squash & stretch

  constructor(public index: number, train: Train) {
    this.color = PLAYER_COLORS[index % 4];
    this.hat = PLAYER_HATS[index % 4];
    this.name = PLAYER_NAMES[index % 4];
    this.trainOffsetZ = 3 + index * 2.4;
    this.buildMesh();
  }

  private buildMesh() {
    this.mesh.add(this.squashRig);

    // chibi proportions: small stubby body, big expressive head — reads at a
    // distance and keeps the "toy figurine", not-realistic silhouette.
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.26, 0.32, 4, 10), toonMat(this.color));
    body.position.y = 0.5;
    body.castShadow = true;
    this.squashRig.add(body);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.4, 14, 12), toonMat(0xffe0b0));
    head.position.y = 1.08;
    this.squashRig.add(head);

    // simple expressive face: two dot eyes + a little smile
    const eyeMat = toonMat(0x222233);
    for (const dx of [-0.15, 0.15]) {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), eyeMat);
      eye.position.set(dx, 1.1, 0.36);
      this.squashRig.add(eye);
    }
    const smile = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.018, 6, 10, Math.PI), eyeMat);
    smile.position.set(0, 1.0, 0.37);
    smile.rotation.x = Math.PI;
    smile.rotation.z = Math.PI;
    this.squashRig.add(smile);

    // customizable hat — a quick silhouette identifier per player slot
    const hatMat = toonMat(this.color === 0xffffff ? 0x333333 : 0x222233);
    let hatMesh: THREE.Mesh;
    switch (this.hat) {
      case 'box':
        hatMesh = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.22, 0.34), hatMat);
        hatMesh.position.y = 1.5;
        break;
      case 'dome':
        hatMesh = new THREE.Mesh(new THREE.SphereGeometry(0.28, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2), hatMat);
        hatMesh.position.y = 1.42;
        break;
      case 'ring':
        hatMesh = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.06, 8, 16), hatMat);
        hatMesh.position.y = 1.5;
        hatMesh.rotation.x = Math.PI / 2;
        break;
      default:
        hatMesh = new THREE.Mesh(new THREE.ConeGeometry(0.26, 0.5, 10), hatMat);
        hatMesh.position.y = 1.62;
    }
    this.squashRig.add(hatMesh);
  }

  get worldZ(): number {
    return this.z;
  }

  updateOnTrainPosition(train: Train) {
    // clamp to the *actual* roof span, not the coupler gap past it — otherwise
    // standing at the very back of the caboose lands you just past its edge,
    // where no wagon claims you and every action (repair/fight/detach) goes dead.
    this.trainOffsetZ = THREE.MathUtils.clamp(this.trainOffsetZ, 0.5, train.length - WAGON_GAP - 0.3);
    this.z = train.z + this.trainOffsetZ;
  }

  /** Cosmetic hop: doesn't affect gameplay collision, just makes movement feel bouncy and fun. */
  hop() {
    if (this.grounded) {
      this.vy = JUMP_SPEED;
      this.grounded = false;
      this.landingSquash = 0.6; // anticipation stretch on launch
    }
  }

  startTumble() {
    this.tumbleTime = 0.001;
    this.tumbleAxis.set(Math.random() - 0.5, Math.random() * 0.4, Math.random() - 0.5).normalize();
  }

  /** A startled little hop-and-stumble reaction, e.g. when your wagon is suddenly cut loose. */
  jolt() {
    this.vy = JUMP_SPEED * 0.55;
    this.grounded = false;
    this.landingSquash = 0.5;
  }

  applyInput(dt: number, input: PlayerInput, train: Train) {
    if (!this.alive) {
      this.tumbleTime += dt;
      return;
    }
    this.x += input.moveX * 6.2 * dt;

    if (input.jumpPressed) this.hop();

    if (!this.grounded) {
      this.vy += GRAVITY * dt;
      this.y += this.vy * dt;
      if (this.y <= 0) {
        this.y = 0;
        this.grounded = true;
        this.vy = 0;
        this.landingSquash = 0.85; // big springy squash on touchdown
      }
    } else {
      this.y = 0;
    }

    if (this.onTrain) {
      this.trainOffsetZ += input.moveZ * 7 * dt;
      this.x = THREE.MathUtils.clamp(this.x, -WAGON_ROOF_HALF, WAGON_ROOF_HALF);
      this.updateOnTrainPosition(train);
    } else {
      // sprinting forward must be able to out-pace the train's baseline speed, or
      // "run back and jump on at the last second" would never be winnable. Idle or
      // moving backward, you simply fall behind.
      const forward = Math.max(0, input.moveZ);
      this.z += (0.35 + forward * 1.0) * this.runSpeed * dt + Math.min(0, input.moveZ) * this.runSpeed * 0.6 * dt;
      this.x = THREE.MathUtils.clamp(this.x, -12, 12);
    }

    if (this.actionCooldown > 0) this.actionCooldown -= dt;
    if (this.missedFlashTimer > 0) this.missedFlashTimer -= dt;
    if (this.landingSquash > 0) this.landingSquash = Math.max(0, this.landingSquash - dt * 3.2);
  }

  syncMesh() {
    const baseY = this.onTrain ? GROUND_Y_TRAIN : GROUND_Y_OFF;
    this.mesh.position.set(this.x, baseY + this.y, this.z);
    this.mesh.visible = true;

    if (!this.alive) {
      // exaggerated cartoon pratfall: fast spin + flatten to the ground + fade
      const spin = Math.min(1, this.tumbleTime * 3.2);
      this.squashRig.setRotationFromAxisAngle(this.tumbleAxis, this.tumbleTime * 14);
      const flatten = 1 - Math.min(0.72, this.tumbleTime * 1.6);
      this.squashRig.scale.set(1 + (1 - flatten) * 0.6, flatten, 1 + (1 - flatten) * 0.6);
      const mat = (this.squashRig.children[0] as THREE.Mesh).material as THREE.MeshToonMaterial;
      mat.transparent = true;
      mat.opacity = Math.max(0.15, 1 - spin * 0.6);
      return;
    }

    this.squashRig.rotation.set(0, 0, 0);
    const bodyMat = (this.squashRig.children[0] as THREE.Mesh).material as THREE.MeshToonMaterial;
    if (bodyMat.opacity !== 1) bodyMat.opacity = 1;
    const carryPop = this.carry ? 1.08 : 1.0;
    // spring squash & stretch: stretched tall on launch, squashed flat on landing
    let sx = carryPop;
    let sy = carryPop;
    let sz = carryPop;
    if (!this.grounded && this.vy > 0) {
      sy *= 1 + Math.min(0.35, this.vy / JUMP_SPEED) * 0.35;
      sx *= 1 - Math.min(0.35, this.vy / JUMP_SPEED) * 0.15;
      sz *= 1 - Math.min(0.35, this.vy / JUMP_SPEED) * 0.15;
    } else if (this.landingSquash > 0) {
      sy *= 1 - this.landingSquash * 0.4;
      sx *= 1 + this.landingSquash * 0.25;
      sz *= 1 + this.landingSquash * 0.25;
    }
    this.squashRig.scale.set(sx, sy, sz);
  }
}
