import * as THREE from 'three';
import type { ItemDef } from '../core/types';
import type { ItemInstance, ToolId } from './types';
import { buildItemGroup } from './buildItem';
import { TOOLS, TOOLS_ORDER } from './tools3d';

interface ToolSlot {
  id: ToolId;
  group: THREE.Group;
  baseY: number;
}

export class WorkshopScene {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  container: HTMLElement;
  canvas: HTMLCanvasElement;

  itemAnchor: THREE.Group;
  current: ItemInstance | null = null;

  toolSlots: ToolSlot[] = [];
  equipped: ToolId | null = null;
  requiredTool: ToolId | null = null;

  private raycaster = new THREE.Raycaster();
  private pointerNDC = new THREE.Vector2();
  private raf = 0;
  private clock = new THREE.Clock();
  private orbitDragging = false;
  private orbitAzimuth = 0;
  private orbitElevation = 0.46;
  private orbitRadius = 4.0;
  private target = new THREE.Vector3(0, 0.5, 0.1);

  onFrame: ((dt: number, t: number) => void) | null = null;

  constructor(container: HTMLElement) {
    this.container = container;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#2a1d14');
    this.scene.fog = new THREE.Fog('#2a1d14', 6, 12);

    this.camera = new THREE.PerspectiveCamera(42, 1, 0.1, 50);
    this.updateCameraFromOrbit();

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.canvas = this.renderer.domElement;
    this.canvas.style.touchAction = 'none';
    container.appendChild(this.canvas);

    this.buildLighting();
    this.buildWorkbench();

    this.itemAnchor = new THREE.Group();
    this.scene.add(this.itemAnchor);

    this.buildToolRack();

    this.resize();
    requestAnimationFrame(() => this.resize());
    window.addEventListener('resize', this.resize);
    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    this.canvas.addEventListener('pointerdown', this.onOrbitDown);
    this.canvas.addEventListener('pointerdown', this.onEquipClick);
    window.addEventListener('pointermove', this.onOrbitMove);
    window.addEventListener('pointerup', this.onOrbitUp);

    this.animate();
  }

  private buildLighting() {
    const hemi = new THREE.HemisphereLight('#fff3d6', '#402a1a', 0.75);
    this.scene.add(hemi);
    const key = new THREE.DirectionalLight('#ffe3b0', 1.4);
    key.position.set(2.2, 3.4, 2.0);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.left = -3;
    key.shadow.camera.right = 3;
    key.shadow.camera.top = 3;
    key.shadow.camera.bottom = -3;
    this.scene.add(key);
    const fill = new THREE.DirectionalLight('#7d9dc9', 0.35);
    fill.position.set(-2.5, 1.5, -1.5);
    this.scene.add(fill);
    const lamp = new THREE.PointLight('#ffb347', 0.6, 6, 2);
    lamp.position.set(0, 2.2, 1.2);
    this.scene.add(lamp);
  }

  private buildWorkbench() {
    const top = new THREE.Mesh(
      new THREE.BoxGeometry(5, 0.15, 3.2),
      new THREE.MeshStandardMaterial({ color: '#6b4e36', roughness: 0.9 })
    );
    top.position.y = -0.075;
    top.receiveShadow = true;
    this.scene.add(top);

    const grid = new THREE.GridHelper(5, 20, 0x000000, 0x000000);
    (grid.material as THREE.Material).transparent = true;
    (grid.material as THREE.Material).opacity = 0.06;
    grid.position.y = 0.001;
    this.scene.add(grid);
  }

  private buildToolRack() {
    const n = TOOLS_ORDER.length;
    const spacing = 0.68;
    const startX = -((n - 1) * spacing) / 2;
    TOOLS_ORDER.forEach((tool, i) => {
      const pedestal = new THREE.Mesh(
        new THREE.CylinderGeometry(0.24, 0.26, 0.08, 20),
        new THREE.MeshStandardMaterial({ color: '#4a3626', roughness: 0.9 })
      );
      const toolMesh = tool.build();
      toolMesh.position.y = 0.22;
      const holder = new THREE.Group();
      holder.add(pedestal, toolMesh);
      holder.position.set(startX + i * spacing, 0.04, 1.1);
      holder.userData.toolId = tool.id;
      holder.traverse((o) => {
        o.userData.toolId = tool.id;
      });
      this.scene.add(holder);
      this.toolSlots.push({ id: tool.id, group: holder, baseY: holder.position.y });
    });
  }

  private updateCameraFromOrbit() {
    const x = this.target.x + this.orbitRadius * Math.sin(this.orbitAzimuth) * Math.cos(this.orbitElevation);
    const y = this.target.y + this.orbitRadius * Math.sin(this.orbitElevation);
    const z = this.target.z + this.orbitRadius * Math.cos(this.orbitAzimuth) * Math.cos(this.orbitElevation);
    this.camera.position.set(x, y, z);
    this.camera.lookAt(this.target);
  }

  private onOrbitDown = (e: PointerEvent) => {
    if (e.button === 2) {
      this.orbitDragging = true;
    }
  };
  private onOrbitMove = (e: PointerEvent) => {
    if (!this.orbitDragging) return;
    this.orbitAzimuth -= e.movementX * 0.006;
    this.orbitElevation = Math.min(1.1, Math.max(0.3, this.orbitElevation - e.movementY * 0.004));
    this.updateCameraFromOrbit();
  };
  private onOrbitUp = () => {
    this.orbitDragging = false;
  };

  onEquip: ((tool: ToolId) => void) | null = null;
  private onEquipClick = (e: PointerEvent) => {
    if (e.button !== 0) return;
    const tool = this.raycastTools(e.clientX, e.clientY);
    if (tool) {
      this.equip(tool);
      this.onEquip?.(tool);
    }
  };

  resize = () => {
    const w = this.container.clientWidth || 640;
    const h = this.container.clientHeight || 400;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h, true);
  };

  loadItem(item: ItemDef): ItemInstance {
    if (this.current) {
      this.itemAnchor.remove(this.current.group);
    }
    const instance = buildItemGroup(item);
    instance.group.position.set(0, 0, -0.25);
    this.itemAnchor.add(instance.group);
    this.current = instance;
    return instance;
  }

  setRequiredTool(tool: ToolId | null) {
    this.requiredTool = tool;
  }

  equip(tool: ToolId) {
    this.equipped = tool;
  }

  private pointerToNDC(clientX: number, clientY: number) {
    const rect = this.canvas.getBoundingClientRect();
    this.pointerNDC.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    this.pointerNDC.y = -((clientY - rect.top) / rect.height) * 2 + 1;
  }

  raycastTools(clientX: number, clientY: number): ToolId | null {
    this.pointerToNDC(clientX, clientY);
    this.raycaster.setFromCamera(this.pointerNDC, this.camera);
    const hits = this.raycaster.intersectObjects(
      this.toolSlots.map((s) => s.group),
      true
    );
    if (hits.length === 0) return null;
    return (hits[0].object.userData.toolId as ToolId) ?? null;
  }

  raycastItem(clientX: number, clientY: number, roles?: string[]): THREE.Intersection | null {
    if (!this.current) return null;
    this.pointerToNDC(clientX, clientY);
    this.raycaster.setFromCamera(this.pointerNDC, this.camera);
    const meshes: THREE.Object3D[] = [];
    this.current.group.traverse((o) => {
      if (!(o as THREE.Mesh).isMesh) return;
      if (roles && !roles.includes(o.userData.role)) return;
      if (o.userData.removed) return;
      meshes.push(o);
    });
    const hits = this.raycaster.intersectObjects(meshes, false);
    return hits.length > 0 ? hits[0] : null;
  }

  private animate = () => {
    this.raf = requestAnimationFrame(this.animate);
    const dt = this.clock.getDelta();
    const t = this.clock.elapsedTime;

    for (const slot of this.toolSlots) {
      const isRequired = slot.id === this.requiredTool;
      const isEquipped = slot.id === this.equipped;
      const bob = isRequired ? Math.sin(t * 4) * 0.03 : 0;
      slot.group.position.y = slot.baseY + bob + (isEquipped ? 0.08 : 0);
      const scale = isEquipped ? 1.15 : 1;
      slot.group.scale.setScalar(scale);
    }

    this.onFrame?.(dt, t);
    this.renderer.render(this.scene, this.camera);
  };

  dispose() {
    cancelAnimationFrame(this.raf);
    window.removeEventListener('resize', this.resize);
    window.removeEventListener('pointermove', this.onOrbitMove);
    window.removeEventListener('pointerup', this.onOrbitUp);
    this.canvas.removeEventListener('pointerdown', this.onOrbitDown);
    this.canvas.removeEventListener('pointerdown', this.onEquipClick);
    this.renderer.dispose();
    this.canvas.remove();
  }
}
