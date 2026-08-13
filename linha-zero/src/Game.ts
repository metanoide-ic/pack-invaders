import * as THREE from 'three';
import { InputManager } from './input/InputManager';
import { Train, WAGON_LENGTH, WAGON_SPACING, WAGON_ROOF_HALF } from './world/Train';
import { detachFrom } from './world/TrainExt';
import { Track } from './world/Track';
import { Player } from './entities/Player';
import { HUD } from './hud/HUD';
import { RunStats, WagonState } from './types';

const MISS_DISTANCE = 20;
const BOARD_MARGIN = 2.2;
const FIRE_GROWTH = 6.5; // per second
const FIRE_EXTINGUISH = 26; // per second while a player fights it
const FIRE_DAMAGE = 3.4; // wagon hp/sec while burning
const RAIDER_DAMAGE = 5.5; // wagon hp/sec while a raider clings on
const RAIDER_FIGHT = 30; // raider hp/sec removed while a player fights back
const REPAIR_RATE = 9; // wagon hp/sec
const REPAIR_COST = 3; // resources/sec
const GRACE_PERIOD = 22; // seconds before hazards can start appearing

export class Game {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private clock = new THREE.Clock();

  private input = new InputManager();
  private train: Train;
  private track: Track;
  private players: Player[] = [];
  private hud = new HUD();

  private stats: RunStats = { distance: 0, resources: 0, passengersSaved: 0, wagonsLost: 0, wagonsBuilt: 0 };
  private nextWagonCost = 45;
  private running = false;
  private gameOver = false;
  private elapsedRunTime = 0;

  private camLook = new THREE.Vector3();
  private camPos = new THREE.Vector3();

  constructor(private canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;

    this.camera = new THREE.PerspectiveCamera(62, window.innerWidth / window.innerHeight, 0.1, 500);

    this.scene.background = new THREE.Color(0x1b2740);
    this.scene.fog = new THREE.Fog(0x1b2740, 70, 260);

    const hemi = new THREE.HemisphereLight(0x9fb4ff, 0x2a1f10, 1.15);
    this.scene.add(hemi);
    const sun = new THREE.DirectionalLight(0xffe3b0, 1.5);
    sun.position.set(-30, 40, -20);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    this.scene.add(sun);

    this.train = new Train(this.scene);
    this.track = new Track(this.scene);

    this.camPos.set(0, 8.5, this.train.z - 15.5);
    this.camLook.set(0, 2.4, this.train.z + 12);
    this.camera.position.copy(this.camPos);
    this.camera.lookAt(this.camLook);

    window.addEventListener('resize', () => this.onResize());
    this.onResize();
  }

  private onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  start() {
    this.running = true;
    this.gameOver = false;
    this.hud.show();
    this.spawnInitialPlayers();
    this.clock.start();
    requestAnimationFrame(() => this.loop());
  }

  private spawnInitialPlayers() {
    const count = this.input.getPlayerCount();
    for (let i = 0; i < count; i++) this.addPlayer(i);
  }

  private addPlayer(i: number) {
    if (this.players[i]) return;
    const p = new Player(i, this.train);
    this.scene.add(p.mesh);
    this.players[i] = p;
  }

  private loop = () => {
    if (!this.running) return;
    const dt = Math.min(this.clock.getDelta(), 0.06);
    this.update(dt);
    this.render();
    if (!this.gameOver) requestAnimationFrame(this.loop);
  };

  private update(dt: number) {
    this.input.update();

    // dynamic co-op join: a controller plugged in mid-run adds a crew member
    for (let i = 0; i < this.input.connectedPads; i++) this.addPlayer(i);
    if (this.players.length === 0) this.addPlayer(0);

    const difficulty = this.stats.distance / 3200;
    this.track.setDifficulty(difficulty);
    this.train.speed = Math.min(this.train.maxSpeed, this.train.baseSpeed + difficulty * 5.5);

    this.train.z += this.train.speed * dt;
    this.stats.distance += this.train.speed * dt;

    this.track.update(this.train.z, this.train.tailZ);
    this.updateHazards(dt, difficulty);

    for (let i = 0; i < this.players.length; i++) this.updatePlayer(i, dt);

    this.maybeExpandTrain();
    this.checkGameOver();

    const elapsed = performance.now() / 1000;
    this.train.syncMeshes(elapsed);
    for (const p of this.players) p.syncMesh();
    this.updateCamera(dt);
    this.hud.update(dt, this.stats, this.train, this.players);
  }

  // ---- hazards: fire spreading, raiders latching onto the caboose ----
  private updateHazards(dt: number, difficulty: number) {
    this.elapsedRunTime += dt;
    if (this.elapsedRunTime < GRACE_PERIOD) return; // let the crew get their bearings first

    const fireChance = (0.007 + difficulty * 0.008) * dt;
    const raiderChance = (0.004 + difficulty * 0.007) * dt;

    for (const w of this.train.wagons) {
      if (w.destroyed) continue;
      if (w.fire <= 0 && w.kind !== 'engine' && Math.random() < fireChance) {
        w.fire = 10;
        this.hud.banner_show(`🔥 Fogo no vagão ${w.index + 1}! Alguém precisa apagar!`);
      }
      if (w.fire > 0) {
        const beingFought = this.playerFightingFire(w);
        if (!beingFought) w.fire = Math.min(100, w.fire + FIRE_GROWTH * dt);
        w.hp -= FIRE_DAMAGE * (w.fire / 100) * dt;
      }
    }

    const last = this.train.wagons[this.train.wagons.length - 1];
    if (last && !last.raider && !last.destroyed && Math.random() < raiderChance) {
      last.raider = true;
      last.raiderHp = 40 + difficulty * 10;
      this.hud.banner_show('⚠️ Um saqueador se agarrou ao último vagão!');
    }
    if (last && last.raider) {
      const fought = this.playerFightingRaider(last);
      if (!fought) last.hp -= RAIDER_DAMAGE * dt;
    }

    // resolve destroyed wagons (structural failure severs everything behind it)
    for (const w of [...this.train.wagons]) {
      if (!w.destroyed && w.hp <= 0) {
        this.severFrom(w.index, 'estrutural');
        break; // train array mutated, re-evaluate next frame
      }
    }
  }

  private playerFightingFire(w: WagonState): boolean {
    return this.players.some((p) => p.alive && p.onTrain && this.wagonUnderPlayer(p) === w && this.currentInputFor(p).interact);
  }
  private playerFightingRaider(w: WagonState): boolean {
    return this.players.some((p) => p.alive && p.onTrain && this.wagonUnderPlayer(p) === w && this.currentInputFor(p).interact);
  }

  private currentInputFor(p: Player) {
    return this.input.getInput(p.index);
  }

  private wagonUnderPlayer(p: Player): WagonState | undefined {
    return this.train.wagons.find(
      (w) => p.trainOffsetZ >= w.index * WAGON_SPACING && p.trainOffsetZ <= w.index * WAGON_SPACING + WAGON_LENGTH
    );
  }

  private severFrom(index: number, reason: string) {
    const affectedPlayers = this.players.filter((p) => p.alive && p.onTrain && p.trainOffsetZ >= index * WAGON_SPACING);
    const { removed, lostResources } = detachFrom(this.train, index);
    if (removed.length === 0) return;
    this.stats.wagonsLost += removed.length;
    this.hud.banner_show(`💥 ${removed.length} vagão(ões) perdidos (${reason})! -${lostResources} recursos`);
    for (const p of affectedPlayers) {
      p.onTrain = false;
      p.z = this.train.z + p.trainOffsetZ; // stranded exactly where the wreck fell behind
    }
  }

  private updatePlayer(i: number, dt: number) {
    const p = this.players[i];
    if (!p) return;
    const input = this.input.getInput(i);

    if (!p.alive) {
      p.respawnTimer -= dt;
      if (p.respawnTimer <= 0) {
        p.alive = true;
        p.onTrain = true;
        p.carry = null;
        p.trainOffsetZ = Math.max(0.5, this.train.length - 1.5);
        p.x = 0;
        this.hud.banner_show(`${p.name} foi puxado de volta a bordo!`, 2);
      }
      return;
    }

    p.applyInput(dt, input, this.train);

    if (p.onTrain) {
      this.handleOnTrainActions(p, input, dt);
    } else {
      this.handleOffTrainActions(p, input);
      // missed the train entirely
      if (this.train.tailZ - p.z > MISS_DISTANCE) {
        this.loseCarry(p);
        p.alive = false;
        p.respawnTimer = 2.4;
        this.hud.banner_show(`😱 ${p.name} perdeu o trem!`, 2.6);
      }
    }
  }

  private handleOnTrainActions(p: Player, input: import('./types').PlayerInput, dt: number) {
    // deliberately leap off the roof edge to reach a city/rescue platform
    if (input.jumpPressed && Math.abs(p.x) >= WAGON_ROOF_HALF - 0.12) {
      p.onTrain = false;
      p.z = this.train.z + p.trainOffsetZ;
      p.x = Math.sign(p.x || 1) * (WAGON_ROOF_HALF + 0.8);
      this.hud.hint(`${p.name} saltou do trem!`);
      return;
    }

    const zone = this.track.zoneAt(p.z);
    if (zone && (zone.kind === 'city' || zone.kind === 'rescue') && Math.abs(p.x) < WAGON_ROOF_HALF - 0.3) {
      const dir = zone.side > 0 ? 'direita (D)' : 'esquerda (A)';
      this.hud.hint(`${zone.kind === 'city' ? 'Cidade' : 'Sobreviventes'} à ${dir}! Vá até a borda e pule (Espaço)`);
    }

    const w = this.wagonUnderPlayer(p);
    if (!w) return;

    if (input.interact) {
      if (w.fire > 0) {
        w.fire = Math.max(0, w.fire - FIRE_EXTINGUISH * dt);
      } else if (w.raider) {
        w.raiderHp -= RAIDER_FIGHT * dt;
        if (w.raiderHp <= 0) {
          w.raider = false;
          this.hud.banner_show('✅ Saqueador repelido!', 2);
        }
      } else if (w.hp < w.maxHp && this.stats.resources > 0) {
        const cost = REPAIR_COST * dt;
        if (this.stats.resources >= cost) {
          this.stats.resources -= cost;
          w.hp = Math.min(w.maxHp, w.hp + REPAIR_RATE * dt);
        }
      }
    }

    if (input.detachPressed) {
      const last = this.train.wagons[this.train.wagons.length - 1];
      if (last && last.id === w.id && this.train.wagons.length > 1) {
        this.hud.hint('Vagão desacoplado!');
        this.severFrom(last.index, 'decisão da tripulação');
      } else if (this.train.wagons.length <= 1) {
        this.hud.hint('Não dá pra desacoplar a locomotiva!');
      } else {
        this.hud.hint('Só o último vagão pode ser desacoplado — corra até lá!');
      }
    }
  }

  private handleOffTrainActions(p: Player, input: import('./types').PlayerInput) {
    const zone = this.track.zoneAt(p.z);
    if (zone && zone.kind === 'city' && !p.carry) {
      for (const pk of zone.pickups) {
        if (pk.taken) continue;
        if (Math.hypot(pk.x - p.x, pk.z - p.z) < 1.3) {
          pk.taken = true;
          if (pk.mesh) pk.mesh.visible = false;
          p.carry = 'resource';
          p.carryValue = pk.value;
          this.hud.hint(`Recurso coletado (+${pk.value})! Volte pro trem!`);
          break;
        }
      }
    }
    if (zone && zone.kind === 'rescue' && !p.carry) {
      for (const r of zone.rescues) {
        if (r.rescued || r.lost) continue;
        if (Math.hypot(r.x - p.x, r.z - p.z) < 1.4) {
          r.rescued = true;
          if (r.mesh) r.mesh.visible = false;
          p.carry = r.kind;
          this.hud.hint('Resgatado! Corra e salte de volta pro trem!');
          break;
        }
      }
    }

    // try to board any reachable wagon roof
    for (const w of this.train.wagons) {
      if (w.destroyed) continue;
      const frontZ = this.train.wagonFrontZ(w);
      const inZ = p.z >= frontZ - BOARD_MARGIN && p.z <= frontZ + WAGON_LENGTH + BOARD_MARGIN;
      const inX = Math.abs(p.x) < WAGON_ROOF_HALF + BOARD_MARGIN;
      if (inZ && inX && !input.jumpPressed) this.hud.hint(`${p.name}: pressione Espaço para saltar de volta!`);
      if (inZ && inX && input.jumpPressed) {
        p.onTrain = true;
        p.trainOffsetZ = THREE.MathUtils.clamp(p.z - this.train.z, 0.5, this.train.length - 0.5);
        p.x = THREE.MathUtils.clamp(p.x, -WAGON_ROOF_HALF, WAGON_ROOF_HALF);
        this.deliverCarry(p, w);
        break;
      }
    }
  }

  private deliverCarry(p: Player, w: WagonState) {
    if (p.carry === 'resource') {
      this.stats.resources += p.carryValue;
      w.resources += p.carryValue;
      this.hud.hint(`+${p.carryValue} recursos entregues!`);
    } else if (p.carry === 'passenger' || p.carry === 'animal') {
      this.stats.passengersSaved++;
      w.hp = Math.min(w.maxHp, w.hp + 8);
      this.hud.banner_show(`🎉 ${p.name} trouxe alguém a bordo em segurança!`, 2.4);
    }
    p.carry = null;
    p.carryValue = 0;
  }

  private loseCarry(p: Player) {
    p.carry = null;
    p.carryValue = 0;
  }

  private maybeExpandTrain() {
    if (this.stats.resources >= this.nextWagonCost) {
      this.stats.resources -= this.nextWagonCost;
      const kinds: Array<WagonState['kind']> = ['cargo', 'passenger', 'tank', 'flat'];
      this.train.addWagon(kinds[Math.floor(Math.random() * kinds.length)]);
      this.stats.wagonsBuilt++;
      this.nextWagonCost = Math.round(this.nextWagonCost * 1.55);
      this.hud.banner_show('🚃 Novo vagão acoplado à composição!', 2.6);
    }
  }

  private checkGameOver() {
    const engine = this.train.wagons[0];
    if (!engine || engine.hp <= 0) {
      this.endRun();
    }
  }

  private endRun() {
    this.running = false;
    this.gameOver = true;
    this.hud.hide();
    const goDistance = document.getElementById('go-distance')!;
    const goResources = document.getElementById('go-resources')!;
    const goPassengers = document.getElementById('go-passengers')!;
    const goWagons = document.getElementById('go-wagons')!;
    goDistance.textContent = `${Math.floor(this.stats.distance / 10)} m`;
    goResources.textContent = `${Math.floor(this.stats.resources)}`;
    goPassengers.textContent = `${this.stats.passengersSaved}`;
    goWagons.textContent = `${this.train.wagons.length}`;
    document.getElementById('gameover')!.classList.remove('hidden');
  }

  /** Lightweight state snapshot used by smoke tests / debugging only. */
  debugState() {
    return {
      distance: this.stats.distance,
      resources: this.stats.resources,
      passengersSaved: this.stats.passengersSaved,
      wagons: this.train.wagons.map((w) => ({ index: w.index, kind: w.kind, hp: w.hp, fire: w.fire, raider: w.raider })),
      players: this.players.map((p) => ({
        i: p.index, x: p.x, z: p.z, onTrain: p.onTrain, alive: p.alive, carry: p.carry,
      })),
      trainZ: this.train.z,
      tailZ: this.train.tailZ,
    };
  }

  private updateCamera(dt: number) {
    const targetPos = new THREE.Vector3(0, 8.5, this.train.z - 15.5);
    const targetLook = new THREE.Vector3(0, 2.4, this.train.z + 12);
    this.camPos.lerp(targetPos, Math.min(1, dt * 3.2));
    this.camLook.lerp(targetLook, Math.min(1, dt * 4));
    this.camera.position.copy(this.camPos);
    this.camera.lookAt(this.camLook);
  }

  private render() {
    this.renderer.render(this.scene, this.camera);
  }
}
