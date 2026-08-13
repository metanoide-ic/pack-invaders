import * as THREE from 'three';
import { PlayerInput } from '../types';
import { Train, WAGON_ROOF_HALF } from '../world/Train';

const PLAYER_COLORS = [0xff8a3d, 0x3ddbff, 0x8bff6a, 0xff5ba0];
const PLAYER_NAMES = ['P1', 'P2', 'P3', 'P4'];

export type CarryKind = 'resource' | 'passenger' | 'animal' | null;

export class Player {
  mesh = new THREE.Group();
  color: number;
  name: string;

  onTrain = true;
  trainOffsetZ = 4; // relative position along the whole train roof, world z = train.z + offset (approx, per-wagon)
  x = 0;
  z = 0; // world z, used only meaningfully while off-train
  y = 0;
  runSpeed = 19;

  carry: CarryKind = null;
  carryValue = 0;

  alive = true;
  respawnTimer = 0;
  missedFlashTimer = 0;
  actionCooldown = 0;

  constructor(public index: number, train: Train) {
    this.color = PLAYER_COLORS[index % 4];
    this.name = PLAYER_NAMES[index % 4];
    this.trainOffsetZ = 3 + index * 2.4;
    this.buildMesh();
  }

  private buildMesh() {
    const body = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.32, 0.6, 4, 10),
      new THREE.MeshStandardMaterial({ color: this.color, roughness: 0.5 })
    );
    body.position.y = 0.75;
    body.castShadow = true;
    this.mesh.add(body);
    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.24, 12, 10),
      new THREE.MeshStandardMaterial({ color: 0xf0d0a0 })
    );
    head.position.y = 1.28;
    this.mesh.add(head);
    const marker = new THREE.Mesh(
      new THREE.ConeGeometry(0.15, 0.35, 6),
      new THREE.MeshBasicMaterial({ color: this.color })
    );
    marker.position.y = 1.9;
    this.mesh.add(marker);
  }

  get worldZ(): number {
    return this.z;
  }

  updateOnTrainPosition(train: Train) {
    this.trainOffsetZ = THREE.MathUtils.clamp(this.trainOffsetZ, 0.5, train.length - 0.5);
    this.z = train.z + this.trainOffsetZ;
  }

  applyInput(dt: number, input: PlayerInput, train: Train) {
    if (!this.alive) return;
    this.x += input.moveX * 6.2 * dt;

    if (this.onTrain) {
      this.trainOffsetZ += input.moveZ * 7 * dt;
      this.x = THREE.MathUtils.clamp(this.x, -WAGON_ROOF_HALF, WAGON_ROOF_HALF);
      this.updateOnTrainPosition(train);
      this.y = 2.42 + Math.sin(performance.now() * 0.02 + this.index) * 0.0;
    } else {
      // sprinting forward must be able to out-pace the train's baseline speed, or
      // "run back and jump on at the last second" would never be winnable. Idle or
      // moving backward, you simply fall behind.
      const forward = Math.max(0, input.moveZ);
      this.z += (0.35 + forward * 1.0) * this.runSpeed * dt + Math.min(0, input.moveZ) * this.runSpeed * 0.6 * dt;
      this.x = THREE.MathUtils.clamp(this.x, -12, 12);
      this.y = 0;
    }

    if (this.actionCooldown > 0) this.actionCooldown -= dt;
    if (this.missedFlashTimer > 0) this.missedFlashTimer -= dt;
  }

  syncMesh() {
    this.mesh.position.set(this.x, this.y, this.z);
    this.mesh.visible = this.alive;
    const carryMarker = this.carry ? 1.15 : 1.0;
    this.mesh.scale.set(carryMarker, carryMarker, carryMarker);
  }
}
