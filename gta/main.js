// Ilha Paulista-Carioca — Fase 1: terreno, zonas e locomoção
import * as THREE from 'three';

// ---------------------------------------------------------------- util/ruído
function n2(x, z) {
  // ruído determinístico barato em [-1,1]
  return Math.sin(x * 1.7 + Math.sin(z * 1.3) * 2.1) * Math.cos(z * 1.1 + Math.sin(x * 0.7) * 1.9);
}
function fbm(x, z) {
  return n2(x, z) * 0.6 + n2(x * 2.1 + 5, z * 2.3 + 7) * 0.3 + n2(x * 4.7 + 11, z * 4.3 + 3) * 0.1;
}
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const lerp = (a, b, t) => a + (b - a) * t;
const gauss = (x, z, cx, cz, r) => Math.exp(-((x - cx) ** 2 + (z - cz) ** 2) / (r * r));

// ---------------------------------------------------------------- geografia
export const R_ILHA = 2900;
const GOV = { x: 2350, z: -1550, r: 380 };           // Ilha do Governador
const TOWN = { x: -1250, z: 1250, r: 420 };          // cidadezinha do interior
const SWAMP = { x: -350, z: 2100, r: 500 };          // pântano

// máscaras de região (0..1)
function maskSnow(x, z) { return smooth(-1350, -1750, z) * smooth(1000, 700, x) * smooth(-2300, -1900, x); }
function maskDesert(x, z) { return smooth(-1300, -1650, x) * smooth(-1250, -950, z) * smooth(800, 500, z); }
function maskTown(x, z) { return smooth(TOWN.r, TOWN.r * 0.55, Math.hypot(x - TOWN.x, z - TOWN.z)); }
function maskSwamp(x, z) { return smooth(SWAMP.r, SWAMP.r * 0.55, Math.hypot(x - SWAMP.x, z - SWAMP.z)); }
function maskForest(x, z) {
  return smooth(1400, 1600, z) * smooth(2350, 2150, z) * smooth(50, 250, x) * smooth(1050, 850, x);
}
function inSPRect(x, z) { return x > -1050 && x < 850 && z > -350 && z < 1450; }

const SP = [
  ['Centro', 0, 0], ['Liberdade', 150, 250], ['Paulista', -250, 300],
  ['Vila Madalena', -650, 50], ['Itaim', -100, 700], ['Morumbi', -750, 800],
  ['Mooca', 450, 150], ['Tatuapé', 650, -150], ['Capão Redondo', -800, 1250],
  ['Interlagos', -200, 1300],
];
const RJ = [
  ['Botafogo', 1750, -350], ['Urca', 2100, -250], ['Copacabana', 2100, 150],
  ['Ipanema', 1950, 500], ['Leblon', 1800, 700], ['Vidigal', 1700, 1050],
  ['São Conrado', 1550, 1300], ['Barra', 1400, 1700], ['Recreio', 1100, 1980],
  ['Prainha', 780, 2250],
];
function nearest(list, x, z) {
  let best = null, bd = Infinity;
  for (const [nome, cx, cz] of list) {
    const d = Math.hypot(x - cx, z - cz);
    if (d < bd) { bd = d; best = nome; }
  }
  return [best, bd];
}

export function height(x, z) {
  const d = Math.hypot(x, z);
  let h = lerp(-38, 10, smooth(R_ILHA, R_ILHA - 300, d));
  // Ilha do Governador (ilhota separada)
  const dg = Math.hypot(x - GOV.x, z - GOV.z);
  h = Math.max(h, lerp(-38, 9, smooth(GOV.r, GOV.r * 0.55, dg)));
  const land = smooth(-6, 4, h);
  // colinas suaves
  h += fbm(x * 0.0016, z * 0.0016) * 7 * land;
  // montanhas de neve (norte)
  const ms = maskSnow(x, z) * land;
  h += ms * (140 + 260 * (0.5 + 0.5 * fbm(x * 0.0026 + 3, z * 0.0026)));
  // dunas do deserto
  h += maskDesert(x, z) * land * (4 + Math.abs(fbm(x * 0.004, z * 0.004)) * 14);
  // aplaina cidade SP + faixa RJ + cidadezinha
  let flat = 0;
  if (inSPRect(x, z)) flat = Math.max(flat, 0.92);
  const [, dRJ] = nearest(RJ, x, z);
  flat = Math.max(flat, smooth(430, 300, dRJ) * 0.9, maskTown(x, z) * 0.9);
  h = lerp(h, 8, flat * land);
  // pântano baixo
  h = lerp(h, 1.6, maskSwamp(x, z) * land);
  // morros cariocas (depois do aplainamento, como no Rio de verdade)
  h += gauss(x, z, 1700, 1050, 190) * 150;   // Vidigal
  h += gauss(x, z, 2140, -420, 150) * 160;   // Urca (Pão de Açúcar)
  h += gauss(x, z, 1430, 1420, 160) * 120;   // Pedra de São Conrado
  h += gauss(x, z, -820, 880, 260) * 45;     // colinas do Morumbi
  return h;
}

const CORES = {
  neve: 0xf2f6fa, rocha: 0x8a8f99, deserto: 0xe8c56a, pantano: 0x4a5f3a,
  floresta: 0x1e5c2a, campo: 0x6faf4e, praia: 0xf0dc9a, cidade: 0x9aa0a6,
  cidadeRJ: 0xb9b0a0, town: 0xc9a86e, mar: 0x1a6fb8,
};

// zona em (x,z) -> { nome, regiao, cor, tipo }
export function zoneAt(x, z) {
  const h = height(x, z);
  if (h < 0.5) return { nome: 'Oceano', regiao: '', cor: CORES.mar, tipo: 'agua' };
  const dg = Math.hypot(x - GOV.x, z - GOV.z);
  if (dg < GOV.r) return { nome: 'Ilha do Governador', regiao: 'Zona Carioca', cor: CORES.cidadeRJ, tipo: 'cidade' };
  if (maskSnow(x, z) > 0.45) return { nome: 'Serra Nevada', regiao: 'Área de Esqui', cor: h > 150 ? CORES.neve : CORES.rocha, tipo: 'neve' };
  if (maskDesert(x, z) > 0.5) return { nome: 'Deserto do Oeste', regiao: 'Sertão', cor: CORES.deserto, tipo: 'deserto' };
  if (maskTown(x, z) > 0.45) return { nome: 'Vila do Interior', regiao: 'Zona Rural', cor: CORES.town, tipo: 'town' };
  if (maskSwamp(x, z) > 0.45) return { nome: 'Pântano do Sul', regiao: 'Brejo', cor: CORES.pantano, tipo: 'pantano' };
  if (maskForest(x, z) > 0.5) return { nome: 'Mata Fechada', regiao: 'Floresta', cor: CORES.floresta, tipo: 'floresta' };
  if (h < 4) return { nome: 'Praia', regiao: 'Litoral', cor: CORES.praia, tipo: 'praia' };
  if (inSPRect(x, z)) {
    const [nome] = nearest(SP, x, z);
    return { nome, regiao: 'Zona Paulistana', cor: CORES.cidade, tipo: 'cidade' };
  }
  const [nomeRJ, dRJ] = nearest(RJ, x, z);
  if (x > 850 && dRJ < 430) return { nome: nomeRJ, regiao: 'Zona Carioca', cor: CORES.cidadeRJ, tipo: 'cidade' };
  return { nome: 'Campos da Ilha', regiao: 'Interior', cor: CORES.campo, tipo: 'campo' };
}

// ---------------------------------------------------------------- cena
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87c9f2);
scene.fog = new THREE.Fog(0x87c9f2, 900, 3400);

const camera = new THREE.PerspectiveCamera(62, innerWidth / innerHeight, 0.5, 8000);

const sol = new THREE.DirectionalLight(0xfff2d0, 2.2);
sol.position.set(600, 900, 300);
sol.castShadow = true;
sol.shadow.mapSize.set(2048, 2048);
sol.shadow.camera.left = -120; sol.shadow.camera.right = 120;
sol.shadow.camera.top = 120; sol.shadow.camera.bottom = -120;
sol.shadow.camera.far = 3000;
scene.add(sol, sol.target);
scene.add(new THREE.HemisphereLight(0xbfe3ff, 0x4e7f3a, 0.9));

// gradient map de 3 tons para o toon shading (estilo Borderlands)
const tones = new Uint8Array([70, 160, 255]);
const gradientMap = new THREE.DataTexture(tones, 3, 1, THREE.RedFormat);
gradientMap.needsUpdate = true;
const toon = (opts) => new THREE.MeshToonMaterial({ gradientMap, ...opts });

// ---------------------------------------------------------------- terreno
const SEG = 300, SIZE = 6800;
const terraGeo = new THREE.PlaneGeometry(SIZE, SIZE, SEG, SEG);
terraGeo.rotateX(-Math.PI / 2);
{
  const pos = terraGeo.attributes.position;
  const cores = new Float32Array(pos.count * 3);
  const c = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i);
    const h = height(x, z);
    pos.setY(i, h);
    const zona = zoneAt(x, z);
    c.setHex(zona.tipo === 'agua' ? 0x4a6a3a : zona.cor);
    // variação sutil para quebrar chapado
    const v = 1 + fbm(x * 0.01, z * 0.01) * 0.06;
    cores[i * 3] = c.r * v; cores[i * 3 + 1] = c.g * v; cores[i * 3 + 2] = c.b * v;
  }
  terraGeo.setAttribute('color', new THREE.BufferAttribute(cores, 3));
  terraGeo.computeVertexNormals();
}
const terra = new THREE.Mesh(terraGeo, toon({ vertexColors: true }));
terra.receiveShadow = true;
scene.add(terra);

// mar
const mar = new THREE.Mesh(
  new THREE.PlaneGeometry(20000, 20000).rotateX(-Math.PI / 2),
  new THREE.MeshToonMaterial({ gradientMap, color: CORES.mar, transparent: true, opacity: 0.92 })
);
mar.position.y = 0.4;
scene.add(mar);

// ---------------------------------------------------------------- vegetação
function scatter(count, testFn, makeFn) {
  let placed = 0, tries = 0;
  while (placed < count && tries < count * 30) {
    tries++;
    const x = (Math.random() * 2 - 1) * (R_ILHA - 60);
    const z = (Math.random() * 2 - 1) * (R_ILHA - 60);
    const zona = zoneAt(x, z);
    if (!testFn(zona, x, z)) continue;
    makeFn(x, height(x, z), z, placed);
    placed++;
  }
}
{
  // árvores (floresta densa + campos esparsos)
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
      m.makeScale(s, s, s).setPosition(x, y + (5 + 4.5) * s, zc); iCopa.setMatrixAt(idx, m);
      idx++;
    });
  iTronco.count = iCopa.count = idx;
  scene.add(iTronco, iCopa);
}
{
  // cactos no deserto
  const geo = new THREE.CylinderGeometry(0.7, 0.9, 6, 6);
  const inst = new THREE.InstancedMesh(geo, toon({ color: 0x3f7d3f }), 120);
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

// ---------------------------------------------------------------- jogador
const player = new THREE.Group();
{
  const corpo = new THREE.Mesh(new THREE.CapsuleGeometry(0.45, 1.1, 4, 10), toon({ color: 0xe0662e }));
  corpo.position.y = 1.05;
  corpo.castShadow = true;
  const cabeca = new THREE.Mesh(new THREE.SphereGeometry(0.34, 12, 10), toon({ color: 0xf2c49a }));
  cabeca.position.y = 2.15;
  cabeca.castShadow = true;
  // contorno preto (casco invertido) — assinatura do estilo Borderlands
  const outMat = new THREE.MeshBasicMaterial({ color: 0x101010, side: THREE.BackSide });
  const oc = new THREE.Mesh(corpo.geometry, outMat); oc.scale.setScalar(1.08); oc.position.copy(corpo.position);
  const oh = new THREE.Mesh(cabeca.geometry, outMat); oh.scale.setScalar(1.12); oh.position.copy(cabeca.position);
  player.add(oc, oh, corpo, cabeca);
}
player.position.set(-250, height(-250, 300), 300); // nasce na Paulista
scene.add(player);

// ---------------------------------------------------------------- input
const keys = {};
addEventListener('keydown', (e) => keys[e.code] = true);
addEventListener('keyup', (e) => keys[e.code] = false);
let yaw = Math.PI, pitch = 0.35, camDist = 14;
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
{
  const mm = document.getElementById('minimap');
  const ctx = mm.getContext('2d');
  const img = ctx.createImageData(200, 200);
  const c = new THREE.Color();
  for (let py = 0; py < 200; py++) for (let px = 0; px < 200; px++) {
    const x = (px / 200 - 0.5) * SIZE, z = (py / 200 - 0.5) * SIZE;
    const zona = zoneAt(x, z);
    c.setHex(zona.cor);
    const o = (py * 200 + px) * 4;
    img.data[o] = c.r * 255; img.data[o + 1] = c.g * 255; img.data[o + 2] = c.b * 255; img.data[o + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  window._mmBase = mm.toDataURL();
  const base = new Image(); base.src = window._mmBase;
  window._mmDraw = () => {
    ctx.drawImage(base, 0, 0);
    const px = (player.position.x / SIZE + 0.5) * 200;
    const py = (player.position.z / SIZE + 0.5) * 200;
    ctx.fillStyle = '#ff2222'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(px, py, 4, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  };
}

// ---------------------------------------------------------------- loop
const hudZone = document.getElementById('hud-zone');
const hudRegion = document.getElementById('hud-region');
let lastZone = '', clock = new THREE.Clock();

function tick() {
  requestAnimationFrame(tick);
  const dt = Math.min(clock.getDelta(), 0.05);

  // movimento relativo à câmera
  let mx = 0, mz = 0;
  if (keys.KeyW) mz -= 1; if (keys.KeyS) mz += 1;
  if (keys.KeyA) mx -= 1; if (keys.KeyD) mx += 1;
  const len = Math.hypot(mx, mz);
  if (len > 0) {
    const vel = keys.ShiftLeft || keys.ShiftRight ? 26 : 11;
    const ang = Math.atan2(mx / len, mz / len) + yaw;
    const nx = player.position.x + Math.sin(ang) * vel * dt;
    const nz = player.position.z + Math.cos(ang) * vel * dt;
    if (height(nx, nz) > 0.3) { player.position.x = nx; player.position.z = nz; }
    player.rotation.y = ang + Math.PI;
  }
  player.position.y = Math.max(height(player.position.x, player.position.z), 0.3);

  // câmera orbital
  const cd = camDist;
  camera.position.set(
    player.position.x + Math.sin(yaw) * Math.cos(pitch) * cd,
    player.position.y + 2 + Math.sin(pitch) * cd,
    player.position.z + Math.cos(yaw) * Math.cos(pitch) * cd
  );
  const groundCam = height(camera.position.x, camera.position.z) + 1.2;
  if (camera.position.y < groundCam) camera.position.y = groundCam;
  camera.lookAt(player.position.x, player.position.y + 2, player.position.z);

  // sombra segue o jogador
  sol.position.set(player.position.x + 600, player.position.y + 900, player.position.z + 300);
  sol.target.position.copy(player.position);

  // HUD
  const zona = zoneAt(player.position.x, player.position.z);
  if (zona.nome !== lastZone) {
    lastZone = zona.nome;
    hudZone.textContent = zona.nome;
    hudRegion.textContent = zona.regiao;
    hudZone.style.animation = 'none'; void hudZone.offsetWidth;
  }
  window._mmDraw();
  renderer.render(scene, camera);
}
tick();
