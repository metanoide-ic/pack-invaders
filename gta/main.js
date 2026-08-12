// Ilha Paulista-Carioca — Fase 2: terreno, zonas, cidade e locomoção
import * as THREE from 'three';
import { groundY, terrainGrid, zoneAt, fbm, clamp, CORES, R_ILHA, SIZE, SEG } from './world.js';
import { buildCity, buildHash } from './city.js';
import { buildInterior, FLOOR_Y } from './interior.js';
import { createCrowd } from './npc.js';

// ---------------------------------------------------------------- cena
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const CEU = new THREE.Color(0x87c9f2);
const NEVOA_CEU = new THREE.Fog(0x87c9f2, 1100, 3600);
scene.background = CEU;
scene.fog = NEVOA_CEU;

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
const hemi = new THREE.HemisphereLight(0xbfe3ff, 0x4e7f3a, 0.95);
scene.add(hemi);

// gradient map de 3 tons — base do visual cel-shaded
const tones = new Uint8Array([70, 160, 255]);
const gradientMap = new THREE.DataTexture(tones, 3, 1, THREE.RedFormat);
gradientMap.needsUpdate = true;
const toon = (opts) => new THREE.MeshToonMaterial({ gradientMap, ...opts });

// ---------------------------------------------------------------- terreno
// Fatiado em pedaços para o descarte por frustum funcionar: uma malha única de
// 6,8 km seria desenhada inteira mesmo com quase tudo fora da tela.
{
  const grid = terrainGrid();
  const cell = SIZE / SEG;
  const PED = 8, passo = SEG / PED;                 // 8x8 pedaços
  const matTerra = toon({ vertexColors: true });
  const cor = new THREE.Color();
  const alt = (ix, iz) => grid.arr[clamp(ix, 0, SEG) + grid.n * clamp(iz, 0, SEG)];

  for (let pz = 0; pz < PED; pz++) for (let px = 0; px < PED; px++) {
    const ix0 = px * passo, iz0 = pz * passo;
    const n = passo + 1;
    const pos = new Float32Array(n * n * 3);
    const nor = new Float32Array(n * n * 3);
    const col = new Float32Array(n * n * 3);
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
      const ix = ix0 + i, iz = iz0 + j, k = (i + j * n) * 3;
      const x = -SIZE / 2 + ix * cell, z = -SIZE / 2 + iz * cell;
      const h = alt(ix, iz);
      pos[k] = x; pos[k + 1] = h; pos[k + 2] = z;
      // normal pelo gradiente da grade: contínua entre pedaços, sem costura
      const nx = alt(ix - 1, iz) - alt(ix + 1, iz);
      const nz = alt(ix, iz - 1) - alt(ix, iz + 1);
      const inv = 1 / Math.hypot(nx, 2 * cell, nz);
      nor[k] = nx * inv; nor[k + 1] = 2 * cell * inv; nor[k + 2] = nz * inv;
      const zona = zoneAt(x, z, h);
      cor.setHex(zona.tipo === 'agua' ? 0x4a6a3a : zona.cor);
      const v = 1 + fbm(x * 0.01, z * 0.01) * 0.06;
      col[k] = cor.r * v; col[k + 1] = cor.g * v; col[k + 2] = cor.b * v;
    }
    // mesma triangulação do PlaneGeometry, para casar com groundY()
    const idx = new Uint32Array(passo * passo * 6);
    let t = 0;
    for (let j = 0; j < passo; j++) for (let i = 0; i < passo; i++) {
      const a = i + j * n, b = i + (j + 1) * n, c = (i + 1) + (j + 1) * n, d = (i + 1) + j * n;
      idx[t++] = a; idx[t++] = b; idx[t++] = d;
      idx[t++] = b; idx[t++] = c; idx[t++] = d;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    g.setIndex(new THREE.BufferAttribute(idx, 1));
    g.computeBoundingSphere();
    const m = new THREE.Mesh(g, matTerra);
    m.receiveShadow = true;
    scene.add(m);
  }
}

const mar = new THREE.Mesh(
  new THREE.PlaneGeometry(20000, 20000).rotateX(-Math.PI / 2),
  toon({ color: CORES.mar, transparent: true, opacity: 0.92 })
);
mar.position.y = 0.4;
scene.add(mar);

// ---------------------------------------------------------------- cidade
const cidade = buildCity(scene, gradientMap);
window.__dbg = { scene, cidade, THREE, groundY, player: null, povoAtivo: true, renderer, sol, minimapaAtivo: true, povo: null };

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
  const nTrees = 2000;
  const iTronco = new THREE.InstancedMesh(tronco, toon({ color: 0x6b4a2a }), nTrees);
  const iCopa = new THREE.InstancedMesh(copa, toon({ color: 0x1d6b30 }), nTrees);
  const m = new THREE.Matrix4();
  let idx = 0;
  scatter(nTrees, (z) => z.tipo === 'floresta' || (z.tipo === 'campo' && Math.random() < 0.12) || (z.tipo === 'pantano' && Math.random() < 0.25),
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

// ---------------------------------------------------------------- habitantes
const povo = createCrowd(scene, gradientMap, cidade.colliders);
window.__dbg.povo = povo;

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

// ------------------------------------------------------- entrar e sair de prédios
const objetosMundo = scene.children.filter((o) => o.isMesh || o.isInstancedMesh);
const RUA = {
  ground: groundY,
  colliders: cidade.colliders,
  podeAndar: (x, z) => groundY(x, z) > 0.3,
};
let amb = RUA;
let interior = null;

function entrar(b) {
  const it = buildInterior(b, gradientMap);
  scene.add(it.grupo);
  for (const o of objetosMundo) o.visible = false;
  interior = it;
  interior.retorno = { x: b.door.x + b.door.nx * 1.8, z: b.door.z + b.door.nz * 1.8 };
  interior.camAntes = camDist;
  interior.luzAntes = [sol.intensity, hemi.intensity];
  sol.intensity = 0.45; hemi.intensity = 0.3;
  const hash = buildHash(it.colliders);
  amb = { ground: () => FLOOR_Y, colliders: hash, podeAndar: () => true };
  player.position.set(it.spawn.x, FLOOR_Y, it.spawn.z);
  camDist = 6; yaw = Math.PI; pitch = 0.30;
  scene.background = new THREE.Color(0x14161a);
  scene.fog = new THREE.Fog(0x14161a, 8, 46);
}

function sair() {
  scene.remove(interior.grupo);
  interior.grupo.traverse((o) => { if (o.geometry) o.geometry.dispose(); });
  for (const o of objetosMundo) o.visible = true;
  const r = interior.retorno;
  camDist = interior.camAntes;
  sol.intensity = interior.luzAntes[0]; hemi.intensity = interior.luzAntes[1];
  player.position.set(r.x, groundY(r.x, r.z), r.z);
  amb = RUA;
  interior = null;
  scene.background = CEU;
  scene.fog = NEVOA_CEU;
}

function alternarPorta() {
  if (interior) {
    const d = Math.hypot(player.position.x - interior.saida.x, player.position.z - interior.saida.z);
    if (d < 2.6) sair();
    return;
  }
  const b = cidade.nearDoor(player.position.x, player.position.z, 3.4);
  if (b) entrar(b);
}

// ---------------------------------------------------------------- input
const keys = {};
addEventListener('keydown', (e) => {
  keys[e.code] = true;
  if (e.code === 'KeyE' && !e.repeat) alternarPorta();
});
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
const hudPrompt = document.getElementById('prompt');
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
      const fix = amb.colliders.resolve(nx, nz, 0.6, player.position.y + 1);
      if (!fix) break;
      nx = fix.x; nz = fix.z;
    }
    if (amb.podeAndar(nx, nz)) { player.position.x = nx; player.position.z = nz; }
    player.rotation.y = ang + Math.PI;
  }
  const chaoY = amb.ground(player.position.x, player.position.z);
  player.position.y = interior ? chaoY : Math.max(chaoY, 0.3);
}

function placeCamera() {
  // aproxima a câmera se ela ficaria dentro de um prédio
  let dist = camDist;
  for (let t = 1; t > 0.25; t -= 0.12) {
    const d = camDist * t;
    const cx = player.position.x + Math.sin(yaw) * Math.cos(pitch) * d;
    const cz = player.position.z + Math.cos(yaw) * Math.cos(pitch) * d;
    const cy = player.position.y + 2 + Math.sin(pitch) * d;
    if (!amb.colliders.resolve(cx, cz, 0.4, cy)) { dist = d; break; }
  }
  camera.position.set(
    player.position.x + Math.sin(yaw) * Math.cos(pitch) * dist,
    player.position.y + 2 + Math.sin(pitch) * dist,
    player.position.z + Math.cos(yaw) * Math.cos(pitch) * dist
  );
  const chao = amb.ground(camera.position.x, camera.position.z) + 1.2;
  if (camera.position.y < chao) camera.position.y = chao;
  if (interior) camera.position.y = Math.min(camera.position.y, FLOOR_Y + interior.peDireito - 0.45);
  camera.lookAt(player.position.x, player.position.y + 2, player.position.z);
}

// ferramenta de desenvolvimento: teleporta e ajusta a câmera
window.__dbg.tp = (x, z, dist = 13, p = 0.32, y = Math.PI) => {
  if (interior) sair();
  player.position.set(x, groundY(x, z), z);
  camDist = dist; pitch = p; yaw = y;
};
window.__dbg.player = player;

// os contornos pretos só valem de perto; longe, é geometria desperdiçada
let quadro = 0;
function atualizarContornos() {
  const p = player.position;
  for (const om of cidade.contornos) {
    const c = om.geometry.boundingSphere.center;
    om.visible = !interior && Math.hypot(c.x - p.x, c.z - p.z) < 430;
  }
  for (const pm of cidade.portas) {
    const c = pm.geometry.boundingSphere.center;
    pm.visible = !interior && Math.hypot(c.x - p.x, c.z - p.z) < 190;
  }
}

function tick() {
  requestAnimationFrame(tick);
  const dt = Math.min(clock.getDelta(), 0.05);
  if ((quadro++ % 15) === 0) atualizarContornos();
  move(dt);
  placeCamera();
  povo.update(dt, player.position, !interior && window.__dbg.povoAtivo);

  sol.position.set(player.position.x + 600, player.position.y + 900, player.position.z + 300);
  sol.target.position.copy(player.position);

  if (interior) {
    if (lastZone !== interior.titulo) {
      lastZone = interior.titulo;
      hudZone.textContent = interior.predio.bairro;
      hudRegion.textContent = interior.titulo.split(' · ')[0];
    }
    const d = Math.hypot(player.position.x - interior.saida.x, player.position.z - interior.saida.z);
    hudPrompt.textContent = d < 2.6 ? 'E — sair' : '';
  } else {
    const zona = zoneAt(player.position.x, player.position.z, player.position.y);
    if (zona.nome !== lastZone) {
      lastZone = zona.nome;
      hudZone.textContent = zona.nome;
      hudRegion.textContent = zona.regiao;
    }
    hudPrompt.textContent = cidade.nearDoor(player.position.x, player.position.z, 3.4) ? 'E — entrar' : '';
    if (window.__dbg.minimapaAtivo) drawMinimap();
  }
  renderer.render(scene, camera);
}
tick();
