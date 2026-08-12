// Ilha Paulista-Carioca — Fase 2: terreno, zonas, cidade e locomoção
import * as THREE from 'three';
import { groundY, terrainGrid, zoneAt, fbm, clamp, CORES, R_ILHA, SIZE, SEG } from './world.js';
import { buildCity } from './city.js';

// ---------------------------------------------------------------- cena
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87c9f2);
scene.fog = new THREE.Fog(0x87c9f2, 1100, 3600);

const camera = new THREE.PerspectiveCamera(62, innerWidth / innerHeight, 0.5, 8000);

const sol = new THREE.DirectionalLight(0xfff2d0, 2.1);
sol.position.set(600, 900, 300);
sol.castShadow = true;
sol.shadow.mapSize.set(2048, 2048);
sol.shadow.camera.left = -160; sol.shadow.camera.right = 160;
sol.shadow.camera.top = 160; sol.shadow.camera.bottom = -160;
sol.shadow.camera.far = 3000;
sol.shadow.bias = -0.0008;
scene.add(sol, sol.target);
scene.add(new THREE.HemisphereLight(0xbfe3ff, 0x4e7f3a, 0.95));

// gradient map de 3 tons — base do visual cel-shaded
const tones = new Uint8Array([70, 160, 255]);
const gradientMap = new THREE.DataTexture(tones, 3, 1, THREE.RedFormat);
gradientMap.needsUpdate = true;
const toon = (opts) => new THREE.MeshToonMaterial({ gradientMap, ...opts });

// ---------------------------------------------------------------- terreno
const terraGeo = new THREE.PlaneGeometry(SIZE, SIZE, SEG, SEG);
terraGeo.rotateX(-Math.PI / 2);
{
  const pos = terraGeo.attributes.position;
  const grid = terrainGrid();
  const cores = new Float32Array(pos.count * 3);
  const c = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i);
    const h = grid.arr[i];
    pos.setY(i, h);
    const zona = zoneAt(x, z, h);
    c.setHex(zona.tipo === 'agua' ? 0x4a6a3a : zona.cor);
    const v = 1 + fbm(x * 0.01, z * 0.01) * 0.06;
    cores[i * 3] = c.r * v; cores[i * 3 + 1] = c.g * v; cores[i * 3 + 2] = c.b * v;
  }
  terraGeo.setAttribute('color', new THREE.BufferAttribute(cores, 3));
  terraGeo.computeVertexNormals();
}
const terra = new THREE.Mesh(terraGeo, toon({ vertexColors: true }));
terra.receiveShadow = true;
scene.add(terra);

const mar = new THREE.Mesh(
  new THREE.PlaneGeometry(20000, 20000).rotateX(-Math.PI / 2),
  toon({ color: CORES.mar, transparent: true, opacity: 0.92 })
);
mar.position.y = 0.4;
scene.add(mar);

// ---------------------------------------------------------------- cidade
const cidade = buildCity(scene, gradientMap);
window.__dbg = { scene, cidade, THREE, groundY, player: null };

// ---------------------------------------------------------------- vegetação
function scatter(count, testFn, makeFn) {
  let placed = 0, tries = 0;
  while (placed < count && tries < count * 30) {
    tries++;
    const x = (Math.random() * 2 - 1) * (R_ILHA - 60);
    const z = (Math.random() * 2 - 1) * (R_ILHA - 60);
    const y = groundY(x, z);
    const zona = zoneAt(x, z, y);
    if (!testFn(zona, x, z)) continue;
    makeFn(x, y, z, placed);
    placed++;
  }
}
{
  const tronco = new THREE.CylinderGeometry(0.5, 0.8, 5, 5);
  const copa = new THREE.ConeGeometry(4, 9, 6);
  const nTrees = 900;
  const iTronco = new THREE.InstancedMesh(tronco, toon({ color: 0x6b4a2a }), nTrees);
  const iCopa = new THREE.InstancedMesh(copa, toon({ color: 0x1d6b30 }), nTrees);
  const m = new THREE.Matrix4();
  let idx = 0;
  scatter(nTrees, (z) => z.tipo === 'floresta' || (z.tipo === 'campo' && Math.random() < 0.25) || (z.tipo === 'pantano' && Math.random() < 0.3),
    (x, y, zc) => {
      const s = 0.8 + Math.random() * 0.9;
      m.makeScale(s, s, s).setPosition(x, y + 2.5 * s, zc); iTronco.setMatrixAt(idx, m);
      m.makeScale(s, s, s).setPosition(x, y + 9.5 * s, zc); iCopa.setMatrixAt(idx, m);
      idx++;
    });
  iTronco.count = iCopa.count = idx;
  scene.add(iTronco, iCopa);
}
{
  const inst = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.7, 0.9, 6, 6), toon({ color: 0x3f7d3f }), 120);
  const m = new THREE.Matrix4();
  let idx = 0;
  scatter(120, (z) => z.tipo === 'deserto', (x, y, zc) => {
    const s = 0.6 + Math.random();
    m.makeScale(s, s, s).setPosition(x, y + 3 * s, zc);
    inst.setMatrixAt(idx++, m);
  });
  inst.count = idx;
  scene.add(inst);
}
// palmeiras na orla carioca
{
  const tronco = new THREE.CylinderGeometry(0.3, 0.5, 11, 5);
  const folha = new THREE.ConeGeometry(3.2, 3, 5);
  const N = 260;
  const iT = new THREE.InstancedMesh(tronco, toon({ color: 0x9c8259 }), N);
  const iF = new THREE.InstancedMesh(folha, toon({ color: 0x2f8f45 }), N);
  const m = new THREE.Matrix4();
  let idx = 0;
  scatter(N, (z, x) => z.tipo === 'praia' && x > 600, (x, y, zc) => {
    m.makeScale(1, 1, 1).setPosition(x, y + 5.5, zc); iT.setMatrixAt(idx, m);
    m.makeScale(1, -1, 1).setPosition(x, y + 12, zc); iF.setMatrixAt(idx, m);
    idx++;
  });
  iT.count = iF.count = idx;
  scene.add(iT, iF);
}

// ---------------------------------------------------------------- jogador
const player = new THREE.Group();
{
  const corpo = new THREE.Mesh(new THREE.CapsuleGeometry(0.45, 1.1, 4, 10), toon({ color: 0xe0662e }));
  corpo.position.y = 1.05; corpo.castShadow = true;
  const cabeca = new THREE.Mesh(new THREE.SphereGeometry(0.34, 12, 10), toon({ color: 0xf2c49a }));
  cabeca.position.y = 2.15; cabeca.castShadow = true;
  const outMat = new THREE.MeshBasicMaterial({ color: 0x101010, side: THREE.BackSide });
  const oc = new THREE.Mesh(corpo.geometry, outMat); oc.scale.setScalar(1.08); oc.position.copy(corpo.position);
  const oh = new THREE.Mesh(cabeca.geometry, outMat); oh.scale.setScalar(1.12); oh.position.copy(cabeca.position);
  player.add(oc, oh, corpo, cabeca);
}
// nasce numa rua livre da Paulista
{
  let sx = -250, sz = 300;
  for (let r = 0; r < 60 && cidade.colliders.resolve(sx, sz, 1.2, groundY(sx, sz) + 1); r++) {
    const a = r * 2.4;
    sx = -250 + Math.cos(a) * r * 3;
    sz = 300 + Math.sin(a) * r * 3;
  }
  player.position.set(sx, groundY(sx, sz), sz);
}
scene.add(player);

// ---------------------------------------------------------------- input
const keys = {};
addEventListener('keydown', (e) => keys[e.code] = true);
addEventListener('keyup', (e) => keys[e.code] = false);
let yaw = Math.PI, pitch = 0.32, camDist = 13;
renderer.domElement.addEventListener('click', () => renderer.domElement.requestPointerLock());
addEventListener('mousemove', (e) => {
  if (document.pointerLockElement !== renderer.domElement) return;
  yaw -= e.movementX * 0.0028;
  pitch = clamp(pitch + e.movementY * 0.0022, -0.2, 1.2);
});
addEventListener('wheel', (e) => camDist = clamp(camDist + e.deltaY * 0.02, 6, 40));
addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

// ---------------------------------------------------------------- minimapa
const mm = document.getElementById('minimap');
const mmCtx = mm.getContext('2d');
let mmBase = null;
{
  const img = mmCtx.createImageData(200, 200);
  const c = new THREE.Color();
  for (let py = 0; py < 200; py++) for (let px = 0; px < 200; px++) {
    const x = (px / 200 - 0.5) * SIZE, z = (py / 200 - 0.5) * SIZE;
    c.setHex(zoneAt(x, z, groundY(x, z)).cor);
    const o = (py * 200 + px) * 4;
    img.data[o] = c.r * 255; img.data[o + 1] = c.g * 255; img.data[o + 2] = c.b * 255; img.data[o + 3] = 255;
  }
  mmCtx.putImageData(img, 0, 0);
  const url = mm.toDataURL();
  mmBase = new Image();
  mmBase.src = url;
}
function drawMinimap() {
  if (!mmBase.complete) return;
  mmCtx.drawImage(mmBase, 0, 0);
  const px = (player.position.x / SIZE + 0.5) * 200;
  const py = (player.position.z / SIZE + 0.5) * 200;
  mmCtx.fillStyle = '#ff2222'; mmCtx.strokeStyle = '#fff'; mmCtx.lineWidth = 1.5;
  mmCtx.beginPath(); mmCtx.arc(px, py, 4, 0, Math.PI * 2); mmCtx.fill(); mmCtx.stroke();
}

// ---------------------------------------------------------------- loop
const hudZone = document.getElementById('hud-zone');
const hudRegion = document.getElementById('hud-region');
let lastZone = '';
const clock = new THREE.Clock();

function move(dt) {
  let mx = 0, mz = 0;
  if (keys.KeyW) mz -= 1; if (keys.KeyS) mz += 1;
  if (keys.KeyA) mx -= 1; if (keys.KeyD) mx += 1;
  const len = Math.hypot(mx, mz);
  if (len > 0) {
    const vel = keys.ShiftLeft || keys.ShiftRight ? 26 : 11;
    const ang = Math.atan2(mx / len, mz / len) + yaw;
    let nx = player.position.x + Math.sin(ang) * vel * dt;
    let nz = player.position.z + Math.cos(ang) * vel * dt;
    for (let i = 0; i < 2; i++) {
      const fix = cidade.colliders.resolve(nx, nz, 0.6, player.position.y + 1);
      if (!fix) break;
      nx = fix.x; nz = fix.z;
    }
    if (groundY(nx, nz) > 0.3) { player.position.x = nx; player.position.z = nz; }
    player.rotation.y = ang + Math.PI;
  }
  player.position.y = Math.max(groundY(player.position.x, player.position.z), 0.3);
}

function placeCamera() {
  // aproxima a câmera se ela ficaria dentro de um prédio
  let dist = camDist;
  for (let t = 1; t > 0.25; t -= 0.12) {
    const d = camDist * t;
    const cx = player.position.x + Math.sin(yaw) * Math.cos(pitch) * d;
    const cz = player.position.z + Math.cos(yaw) * Math.cos(pitch) * d;
    const cy = player.position.y + 2 + Math.sin(pitch) * d;
    if (!cidade.colliders.resolve(cx, cz, 0.4, cy)) { dist = d; break; }
  }
  camera.position.set(
    player.position.x + Math.sin(yaw) * Math.cos(pitch) * dist,
    player.position.y + 2 + Math.sin(pitch) * dist,
    player.position.z + Math.cos(yaw) * Math.cos(pitch) * dist
  );
  const chao = groundY(camera.position.x, camera.position.z) + 1.2;
  if (camera.position.y < chao) camera.position.y = chao;
  camera.lookAt(player.position.x, player.position.y + 2, player.position.z);
}

// ferramenta de desenvolvimento: teleporta e ajusta a câmera
window.__dbg.tp = (x, z, dist = 13, p = 0.32, y = Math.PI) => {
  player.position.set(x, groundY(x, z), z);
  camDist = dist; pitch = p; yaw = y;
};
window.__dbg.player = player;

function tick() {
  requestAnimationFrame(tick);
  const dt = Math.min(clock.getDelta(), 0.05);
  move(dt);
  placeCamera();

  sol.position.set(player.position.x + 600, player.position.y + 900, player.position.z + 300);
  sol.target.position.copy(player.position);

  const zona = zoneAt(player.position.x, player.position.z, player.position.y);
  if (zona.nome !== lastZone) {
    lastZone = zona.nome;
    hudZone.textContent = zona.nome;
    hudRegion.textContent = zona.regiao;
  }
  drawMinimap();
  renderer.render(scene, camera);
}
tick();
