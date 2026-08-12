// Geografia da ilha: relevo, zonas e definição dos bairros.

function n2(x, z) {
  return Math.sin(x * 1.7 + Math.sin(z * 1.3) * 2.1) * Math.cos(z * 1.1 + Math.sin(x * 0.7) * 1.9);
}
export function fbm(x, z) {
  return n2(x, z) * 0.6 + n2(x * 2.1 + 5, z * 2.3 + 7) * 0.3 + n2(x * 4.7 + 11, z * 4.3 + 3) * 0.1;
}
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
export const lerp = (a, b, t) => a + (b - a) * t;
const gauss = (x, z, cx, cz, r) => Math.exp(-((x - cx) ** 2 + (z - cz) ** 2) / (r * r));

export const R_ILHA = 2900;
export const SIZE = 6800;
const GOV = { x: 2350, z: -1550, r: 380 };
const TOWN = { x: -1250, z: 1250, r: 420 };
const SWAMP = { x: -350, z: 2100, r: 500 };

// ------------------------------------------------------------- paletas
const PAL = {
  concreto: [0xbfc3c7, 0xa9adb2, 0xd6d2c8, 0x8f959c, 0xc8bfae],
  liberdade: [0xd94f4f, 0xe8dcc8, 0xc23b3b, 0xf0e4d0, 0xa33030],
  vidro: [0x7fa8c9, 0x5f8fb8, 0x9ec4dd, 0x6d7f8c, 0xa8c8dc],
  graffiti: [0xf2a03d, 0x4fb0a5, 0xe05c6e, 0x7bc24a, 0xf2d24a, 0x9b6bd6],
  pastel: [0xf0e6d2, 0xdcd0b8, 0xe8d8c0, 0xcfc0a4],
  tijolo: [0xa8563c, 0x8f4632, 0xc06a48, 0x7d3f2e, 0xb5705a],
  favela: [0xe8763c, 0xf0b83c, 0x5ba8c9, 0xd94f6e, 0x7bbd52, 0xe0d0a8, 0xc95fa8],
  branco: [0xf2efe6, 0xe6e2d6, 0xdcd8cc, 0xf5f0e0],
  moderno: [0x9fb0bc, 0x7d8f9e, 0xc0ccd4, 0x6b7d8a],
  madeira: [0xc9a86e, 0xb08d54, 0xd9c08a, 0x9c7a48],
};

// angle = direção dos quarteirões; block/road em metros; o alcance de cada
// bairro é calculado em city.js a partir do próprio território (Voronoi).
// h = faixa de altura dos prédios; dens = ocupação dos lotes
export const DISTRICTS = [
  // ---- São Paulo
  { nome: 'Centro', x: 0, z: 0, regiao: 'Zona Paulistana', angle: 0.25, block: 42, road: 16, style: 'midrise', h: [22, 54], dens: 0.95, pal: PAL.concreto },
  { nome: 'Liberdade', x: 150, z: 250, regiao: 'Zona Paulistana', angle: 0.25, block: 34, road: 13, style: 'midrise', h: [14, 32], dens: 0.95, pal: PAL.liberdade },
  { nome: 'Paulista', x: -250, z: 300, regiao: 'Zona Paulistana', angle: 0.95, block: 48, road: 20, style: 'tower', h: [48, 118], dens: 0.9, pal: PAL.vidro },
  { nome: 'Vila Madalena', x: -650, z: 50, regiao: 'Zona Paulistana', angle: 0.5, block: 28, road: 11, style: 'house', h: [7, 15], dens: 0.9, pal: PAL.graffiti },
  { nome: 'Itaim', x: -100, z: 700, regiao: 'Zona Paulistana', angle: 0.2, block: 46, road: 18, style: 'tower', h: [36, 84], dens: 0.8, pal: PAL.moderno },
  { nome: 'Morumbi', x: -750, z: 800, regiao: 'Zona Paulistana', angle: 0.1, block: 62, road: 14, style: 'mansion', h: [8, 17], dens: 0.5, pal: PAL.pastel },
  { nome: 'Mooca', x: 450, z: 150, regiao: 'Zona Paulistana', angle: 0.15, block: 52, road: 16, style: 'warehouse', h: [9, 20], dens: 0.7, pal: PAL.tijolo },
  { nome: 'Tatuapé', x: 650, z: -150, regiao: 'Zona Paulistana', angle: 0.15, block: 44, road: 16, style: 'midrise', h: [24, 56], dens: 0.8, pal: PAL.concreto },
  { nome: 'Capão Redondo', x: -800, z: 1250, regiao: 'Zona Paulistana', angle: 0.4, block: 28, road: 10, style: 'favela', h: [5, 12], dens: 1.0, pal: PAL.favela },
  { nome: 'Interlagos', x: -200, z: 1300, regiao: 'Zona Paulistana', angle: 0.05, block: 48, road: 16, style: 'house', h: [7, 16], dens: 0.55, pal: PAL.pastel },
  // ---- Rio de Janeiro
  { nome: 'Botafogo', x: 1750, z: -350, regiao: 'Zona Carioca', angle: -0.4, block: 40, road: 16, style: 'midrise', h: [24, 52], dens: 0.9, pal: PAL.concreto },
  { nome: 'Urca', x: 2100, z: -250, regiao: 'Zona Carioca', angle: -0.2, block: 32, road: 12, style: 'house', h: [8, 17], dens: 0.6, pal: PAL.pastel },
  { nome: 'Copacabana', x: 2100, z: 150, regiao: 'Zona Carioca', angle: -0.15, block: 36, road: 16, style: 'beachfront', h: [32, 60], dens: 1.0, pal: PAL.branco },
  { nome: 'Ipanema', x: 1950, z: 500, regiao: 'Zona Carioca', angle: -0.3, block: 38, road: 16, style: 'beachfront', h: [26, 48], dens: 0.95, pal: PAL.branco },
  { nome: 'Leblon', x: 1800, z: 700, regiao: 'Zona Carioca', angle: -0.35, block: 38, road: 16, style: 'beachfront', h: [24, 44], dens: 0.9, pal: PAL.branco },
  { nome: 'Vidigal', x: 1700, z: 1050, regiao: 'Zona Carioca', angle: 0.6, block: 20, road: 8, style: 'favela', h: [4, 10], dens: 1.0, pal: PAL.favela },
  { nome: 'São Conrado', x: 1550, z: 1300, regiao: 'Zona Carioca', angle: 0.2, block: 46, road: 16, style: 'tower', h: [30, 72], dens: 0.6, pal: PAL.moderno },
  { nome: 'Barra', x: 1400, z: 1700, regiao: 'Zona Carioca', angle: 0.35, block: 62, road: 22, style: 'tower', h: [34, 88], dens: 0.55, pal: PAL.vidro },
  { nome: 'Recreio', x: 1100, z: 1980, regiao: 'Zona Carioca', angle: 0.4, block: 44, road: 14, style: 'house', h: [8, 19], dens: 0.5, pal: PAL.branco },
  { nome: 'Prainha', x: 780, z: 2250, regiao: 'Zona Carioca', angle: 0.5, block: 40, road: 10, style: 'shack', h: [4, 8], dens: 0.25, pal: PAL.madeira },
  { nome: 'Ilha do Governador', x: GOV.x, z: GOV.z, regiao: 'Zona Carioca', angle: 0.3, block: 40, road: 14, style: 'midrise', h: [10, 30], dens: 0.7, pal: PAL.pastel },
  // ---- interior
  { nome: 'Vila do Interior', x: TOWN.x, z: TOWN.z, regiao: 'Zona Rural', angle: 0.15, block: 44, road: 12, style: 'house', h: [6, 13], dens: 0.4, pal: PAL.madeira },
];

const SP = DISTRICTS.filter((d) => d.regiao === 'Zona Paulistana');
const RJ = DISTRICTS.filter((d) => d.regiao === 'Zona Carioca' && d.nome !== 'Ilha do Governador');

function maskSnow(x, z) { return smooth(-1350, -1750, z) * smooth(1000, 700, x) * smooth(-2300, -1900, x); }
function maskDesert(x, z) { return smooth(-1300, -1650, x) * smooth(-1250, -950, z) * smooth(800, 500, z); }
function maskTown(x, z) { return smooth(TOWN.r, TOWN.r * 0.55, Math.hypot(x - TOWN.x, z - TOWN.z)); }
function maskSwamp(x, z) { return smooth(SWAMP.r, SWAMP.r * 0.55, Math.hypot(x - SWAMP.x, z - SWAMP.z)); }
function maskForest(x, z) {
  return smooth(1400, 1600, z) * smooth(2350, 2150, z) * smooth(50, 250, x) * smooth(1050, 850, x);
}
function inSPRect(x, z) { return x > -1050 && x < 850 && z > -350 && z < 1450; }

function nearest(list, x, z) {
  let best = null, bd = Infinity;
  for (const d of list) {
    const dist = Math.hypot(x - d.x, z - d.z);
    if (dist < bd) { bd = dist; best = d; }
  }
  return [best, bd];
}

export function height(x, z) {
  const d = Math.hypot(x, z);
  let h = lerp(-38, 10, smooth(R_ILHA, R_ILHA - 300, d));
  const dg = Math.hypot(x - GOV.x, z - GOV.z);
  h = Math.max(h, lerp(-38, 9, smooth(GOV.r, GOV.r * 0.55, dg)));
  const land = smooth(-6, 4, h);
  h += fbm(x * 0.0016, z * 0.0016) * 7 * land;
  const ms = maskSnow(x, z) * land;
  h += ms * (140 + 260 * (0.5 + 0.5 * fbm(x * 0.0026 + 3, z * 0.0026)));
  h += maskDesert(x, z) * land * (4 + Math.abs(fbm(x * 0.004, z * 0.004)) * 14);
  let flat = 0;
  if (inSPRect(x, z)) flat = Math.max(flat, 0.92);
  const [, dRJ] = nearest(RJ, x, z);
  flat = Math.max(flat, smooth(520, 340, dRJ) * 0.9, maskTown(x, z) * 0.9);
  h = lerp(h, 8, flat * land);
  h = lerp(h, 1.6, maskSwamp(x, z) * land);
  h += gauss(x, z, 1700, 1050, 190) * 150;   // morro do Vidigal
  h += gauss(x, z, 2140, -420, 150) * 160;   // Pão de Açúcar (Urca)
  h += gauss(x, z, 1430, 1420, 160) * 120;   // pedra de São Conrado
  h += gauss(x, z, -820, 880, 260) * 45;     // colinas do Morumbi
  return h;
}

// ------------------------------------------------------------- grade do relevo
// A malha do terreno é uma grade regular; tudo que se apoia no chão precisa usar
// a altura *interpolada da malha*, não a função contínua, senão afunda nela.
export const SEG = 300;
const CELL = SIZE / SEG;
let GRID = null;

export function terrainGrid() {
  if (GRID) return GRID;
  const arr = new Float32Array((SEG + 1) * (SEG + 1));
  for (let iz = 0; iz <= SEG; iz++) {
    const z = -SIZE / 2 + iz * CELL;
    for (let ix = 0; ix <= SEG; ix++) {
      arr[ix + (SEG + 1) * iz] = height(-SIZE / 2 + ix * CELL, z);
    }
  }
  GRID = { arr, n: SEG + 1, cell: CELL };
  return GRID;
}

export function groundY(x, z) {
  const g = terrainGrid();
  const fx = (x + SIZE / 2) / CELL, fz = (z + SIZE / 2) / CELL;
  const ix = clamp(Math.floor(fx), 0, SEG - 1), iz = clamp(Math.floor(fz), 0, SEG - 1);
  const u = clamp(fx - ix, 0, 1), v = clamp(fz - iz, 0, 1);
  const i = ix + g.n * iz;
  const ha = g.arr[i], hb = g.arr[i + g.n], hc = g.arr[i + g.n + 1], hd = g.arr[i + 1];
  // triangulação do PlaneGeometry: diagonal de (0,1) a (1,0)
  return u + v <= 1
    ? ha + (hd - ha) * u + (hb - ha) * v
    : hc + (hb - hc) * (1 - u) + (hd - hc) * (1 - v);
}

export const CORES = {
  neve: 0xf2f6fa, rocha: 0x8a8f99, deserto: 0xe8c56a, pantano: 0x4a5f3a,
  floresta: 0x1e5c2a, campo: 0x6faf4e, praia: 0xf0dc9a, cidade: 0x9aa0a6,
  cidadeRJ: 0xb9b0a0, town: 0xc9a86e, mar: 0x1a6fb8, asfalto: 0x3a3d42,
  calcada: 0xb8b4a8,
};

export function zoneAt(x, z, hKnown) {
  const h = hKnown !== undefined ? hKnown : height(x, z);
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
    const [d] = nearest(SP, x, z);
    return { nome: d.nome, regiao: 'Zona Paulistana', cor: CORES.cidade, tipo: 'cidade' };
  }
  const [dRJ, dist] = nearest(RJ, x, z);
  if (x > 850 && dist < 520) return { nome: dRJ.nome, regiao: 'Zona Carioca', cor: CORES.cidadeRJ, tipo: 'cidade' };
  return { nome: 'Campos da Ilha', regiao: 'Interior', cor: CORES.campo, tipo: 'campo' };
}
