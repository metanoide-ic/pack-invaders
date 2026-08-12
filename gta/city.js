// Geração da malha urbana: ruas, calçadas e prédios por bairro.
import * as THREE from 'three';
import { groundY, zoneAt, DISTRICTS, CORES, R_ILHA } from './world.js';

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Textura de fachada: parede clara com uma janela por tile de UV.
function facadeTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d');
  g.fillStyle = '#ffffff'; g.fillRect(0, 0, 64, 64);
  g.fillStyle = '#6f8496'; g.fillRect(14, 12, 36, 30);
  g.fillStyle = '#8fa4b4'; g.fillRect(14, 12, 36, 8);
  g.fillStyle = '#d8d4c8'; g.fillRect(10, 46, 44, 5);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.magFilter = THREE.NearestFilter;
  return t;
}

// ------------------------------------------------- acumuladores de geometria
function newMesh() { return { pos: [], nor: [], uv: [], col: [], idx: [] }; }

function pushQuad(m, verts, n, uvs, color) {
  const base = m.pos.length / 3;
  for (let i = 0; i < 4; i++) {
    m.pos.push(verts[i][0], verts[i][1], verts[i][2]);
    m.nor.push(n[0], n[1], n[2]);
    if (m.uv) m.uv.push(uvs[i][0], uvs[i][1]);
    if (m.col) m.col.push(color[0], color[1], color[2]);
  }
  m.idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
}

// Caixa rotacionada em Y. UV das laterais escala com o tamanho (1 janela / 4 m).
function pushBox(m, cx, cy, cz, hw, hh, hd, ang, color, uvOn = true) {
  const cs = Math.cos(ang), sn = Math.sin(ang);
  const R = (x, z) => [cx + x * cs - z * sn, cz + x * sn + z * cs];
  const P = (x, y, z) => { const [wx, wz] = R(x, z); return [wx, cy + y, wz]; };
  const N = (x, z) => [x * cs - z * sn, 0, x * sn + z * cs];
  const uw = uvOn ? hw * 2 / 4 : 0.02, ud = uvOn ? hd * 2 / 4 : 0.02, uh = uvOn ? hh * 2 / 4 : 0.02;
  const flat = [[0, 0], [0.02, 0], [0.02, 0.02], [0, 0.02]];
  const face = (a, b) => [[0, 0], [a, 0], [a, b], [0, b]];
  // +Z / -Z
  pushQuad(m, [P(-hw, -hh, hd), P(hw, -hh, hd), P(hw, hh, hd), P(-hw, hh, hd)], N(0, 1), face(uw, uh), color);
  pushQuad(m, [P(hw, -hh, -hd), P(-hw, -hh, -hd), P(-hw, hh, -hd), P(hw, hh, -hd)], N(0, -1), face(uw, uh), color);
  // +X / -X
  pushQuad(m, [P(hw, -hh, hd), P(hw, -hh, -hd), P(hw, hh, -hd), P(hw, hh, hd)], N(1, 0), face(ud, uh), color);
  pushQuad(m, [P(-hw, -hh, -hd), P(-hw, -hh, hd), P(-hw, hh, hd), P(-hw, hh, -hd)], N(-1, 0), face(ud, uh), color);
  // topo (sem janelas)
  pushQuad(m, [P(-hw, hh, hd), P(hw, hh, hd), P(hw, hh, -hd), P(-hw, hh, -hd)], [0, 1, 0], flat, color);
}

function toGeometry(m, withUv, withColor) {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(m.pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(m.nor, 3));
  if (withUv) g.setAttribute('uv', new THREE.Float32BufferAttribute(m.uv, 2));
  if (withColor) g.setAttribute('color', new THREE.Float32BufferAttribute(m.col, 3));
  g.setIndex(new THREE.BufferAttribute(new Uint32Array(m.idx), 1));
  g.computeBoundingSphere();
  return g;
}

// lotes por quarteirão conforme o estilo do bairro
function lotsFor(style, rnd) {
  switch (style) {
    case 'tower': case 'beachfront': return { k: 1, fill: 0.78 };
    case 'midrise': return { k: rnd() < 0.5 ? 1 : 2, fill: 0.82 };
    case 'warehouse': return { k: 1, fill: 0.88 };
    case 'mansion': return { k: 1, fill: 0.5 };
    case 'favela': return { k: 3, fill: 0.9 };
    case 'shack': return { k: 2, fill: 0.35 };
    default: return { k: 2, fill: 0.62 };
  }
}

// Alcance real de cada bairro: a maior distância do seu centro até um ponto do
// seu próprio território. Sem isso, as bordas do mapa ficam sem construção.
function districtReach() {
  const reach = new Map(DISTRICTS.map((d) => [d.nome, 0]));
  const byName = new Map(DISTRICTS.map((d) => [d.nome, d]));
  for (let x = -R_ILHA; x <= R_ILHA; x += 40) {
    for (let z = -R_ILHA; z <= R_ILHA; z += 40) {
      const h = groundY(x, z);
      if (h < 5) continue;
      const nome = zoneAt(x, z, h).nome;
      const d = byName.get(nome);
      if (!d) continue;
      reach.set(nome, Math.max(reach.get(nome), Math.hypot(x - d.x, z - d.z)));
    }
  }
  return reach;
}

export function buildCity(scene, gradientMap) {
  const buildings = [];
  const colliders = [];
  const road = newMesh(); road.uv = null;
  const doors = newMesh(); doors.uv = null;
  const facade = facadeTexture();
  const cor = new THREE.Color();
  const asf = new THREE.Color(CORES.asfalto), cal = new THREE.Color(CORES.calcada);
  const asfC = [asf.r, asf.g, asf.b], calC = [cal.r, cal.g, cal.b];

  const reach = districtReach();
  DISTRICTS.forEach((d, di) => {
    const rnd = mulberry32(1000 + di * 77);
    const alcance = reach.get(d.nome) + d.block;
    const cs = Math.cos(d.angle), sn = Math.sin(d.angle);
    const toWorld = (lx, lz) => [d.x + lx * cs - lz * sn, d.z + lx * sn + lz * cs];
    const step = d.block + d.road;
    const n = Math.ceil(alcance / step);
    const build = newMesh();
    const outline = newMesh(); outline.uv = null; outline.col = null;

    // ---- ruas (linhas da grade nos dois sentidos)
    const stripe = (ax, az, bx, bz, w, color, lift) => {
      const dx = bx - ax, dz = bz - az, len = Math.hypot(dx, dz);
      const px = (-dz / len) * w, pz = (dx / len) * w;
      // sentido anti-horário visto de cima, senão o quad é descartado por culling
      const c = [[ax + px, az + pz], [bx + px, bz + pz], [bx - px, bz - pz], [ax - px, az - pz]];
      const v = c.map(([x, z]) => [x, groundY(x, z) + lift, z]);
      pushQuad(road, v, [0, 1, 0], null, color);
    };
    for (let axis = 0; axis < 2; axis++) {
      for (let k = -n; k <= n; k++) {
        for (let s = -n; s < n; s++) {
          const a = axis === 0 ? [s * step, k * step] : [k * step, s * step];
          const b = axis === 0 ? [(s + 1) * step, k * step] : [k * step, (s + 1) * step];
          const mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
          if (Math.hypot(mid[0], mid[1]) > alcance) continue;
          const [ax, az] = toWorld(a[0], a[1]);
          const [bx, bz] = toWorld(b[0], b[1]);
          const ha = groundY(ax, az), hb2 = groundY(bx, bz);
          if (ha < 5 || hb2 < 5) continue;
          const [mwx, mwz] = toWorld(mid[0], mid[1]);
          if (zoneAt(mwx, mwz, groundY(mwx, mwz)).nome !== d.nome) continue;
          stripe(ax, az, bx, bz, d.road / 2 + 3.5, calC, 0.14);
          stripe(ax, az, bx, bz, d.road / 2, asfC, 0.26);
        }
      }
    }

    // ---- prédios nos quarteirões
    for (let i = -n; i < n; i++) {
      for (let j = -n; j < n; j++) {
        const blx = (i + 0.5) * step, blz = (j + 0.5) * step;
        if (Math.hypot(blx, blz) > alcance) continue;
        const [bwx, bwz] = toWorld(blx, blz);
        const bwh = groundY(bwx, bwz);
        if (bwh < 5 || zoneAt(bwx, bwz, bwh).nome !== d.nome) continue;
        const { k, fill } = lotsFor(d.style, rnd);
        const lot = d.block / k;
        for (let li = 0; li < k; li++) for (let lj = 0; lj < k; lj++) {
          if (rnd() > d.dens) continue;
          const lx = blx - d.block / 2 + lot * (li + 0.5);
          const lz = blz - d.block / 2 + lot * (lj + 0.5);
          let hw = (lot / 2) * fill * (0.8 + rnd() * 0.4);
          let hd = (lot / 2) * fill * (0.8 + rnd() * 0.4);
          if (d.style === 'warehouse') { hw *= 1.05; hd *= 0.75; }
          const [wx, wz] = toWorld(lx, lz);
          const hc = groundY(wx, wz);
          if (hc < 5) continue;
          // base acompanha o terreno (importante nas encostas do Vidigal)
          let lo = hc, hi = hc;
          for (const [ox, oz] of [[-hw, -hd], [hw, -hd], [-hw, hd], [hw, hd]]) {
            const h2 = groundY(wx + ox * cs - oz * sn, wz + ox * sn + oz * cs);
            lo = Math.min(lo, h2); hi = Math.max(hi, h2);
          }
          if (lo < 3) continue;
          let bh = d.h[0] + rnd() * (d.h[1] - d.h[0]);
          bh = Math.max(3, Math.round(bh / 3) * 3);           // andares de 3 m
          const top = hi + bh, bot = lo - 2.5;
          const cy = (top + bot) / 2, hh = (top - bot) / 2;
          const ang = d.angle + (d.style === 'favela' ? (rnd() - 0.5) * 0.5 : 0);
          cor.setHex(d.pal[(rnd() * d.pal.length) | 0]);
          const v = 0.9 + rnd() * 0.2;
          const rgb = [cor.r * v, cor.g * v, cor.b * v];
          pushBox(build, wx, cy, wz, hw, hh, hd, ang, rgb, true);
          const mg = Math.min(0.35, Math.max(0.1, Math.min(hw, hd) * 0.05));
          pushBox(outline, wx, cy, wz, hw + mg, hh + mg, hd + mg, ang, null, false);

          // porta virada para a rua mais próxima do lote
          const ox = lx - blx, oz = lz - blz;
          let dnx = 0, dnz = 0;
          if (Math.abs(ox) >= Math.abs(oz)) dnx = Math.sign(ox) || 1; else dnz = Math.sign(oz) || 1;
          const off = dnx !== 0 ? hw : hd;
          const dcs = Math.cos(ang), dsn = Math.sin(ang);
          const lxw = dnx * off, lzw = dnz * off;
          const dx = wx + lxw * dcs - lzw * dsn, dz = wz + lxw * dsn + lzw * dcs;
          const doorY = hi + 1.3;
          pushBox(doors, dx, doorY, dz, dnx !== 0 ? 0.25 : 0.9, 1.3, dnx !== 0 ? 0.9 : 0.25, ang,
            [0.16, 0.12, 0.10], false);

          buildings.push({
            x: wx, z: wz, base: hi, w: hw * 2, d: hd * 2, h: bh, ang,
            bairro: d.nome, style: d.style, cor: cor.getHex(),
            door: { x: dx, y: hi, z: dz, nx: dnx * dcs - dnz * dsn, nz: dnx * dsn + dnz * dcs },
          });
          colliders.push({ x: wx, z: wz, hw, hd, top, cs: Math.cos(ang), sn: Math.sin(ang) });
        }
      }
    }

    if (build.pos.length) {
      const mat = new THREE.MeshToonMaterial({ gradientMap, vertexColors: true, map: facade });
      const mesh = new THREE.Mesh(toGeometry(build, true, true), mat);
      mesh.castShadow = mesh.receiveShadow = true;
      const om = new THREE.Mesh(toGeometry(outline, false, false),
        new THREE.MeshBasicMaterial({ color: 0x0e0e10, side: THREE.BackSide }));
      scene.add(mesh, om);
    }
  });

  scene.add(new THREE.Mesh(toGeometry(road, false, true),
    new THREE.MeshToonMaterial({ gradientMap, vertexColors: true })));
  scene.add(new THREE.Mesh(toGeometry(doors, false, true),
    new THREE.MeshToonMaterial({ gradientMap, vertexColors: true })));

  return { buildings, colliders: buildHash(colliders) };
}

// ------------------------------------------------- colisão (hash espacial)
const CELL = 40;
function buildHash(list) {
  const map = new Map();
  for (const c of list) {
    const x0 = Math.floor((c.x - c.hw - c.hd) / CELL), x1 = Math.floor((c.x + c.hw + c.hd) / CELL);
    const z0 = Math.floor((c.z - c.hw - c.hd) / CELL), z1 = Math.floor((c.z + c.hw + c.hd) / CELL);
    for (let i = x0; i <= x1; i++) for (let j = z0; j <= z1; j++) {
      const key = i + ',' + j;
      let arr = map.get(key);
      if (!arr) map.set(key, arr = []);
      arr.push(c);
    }
  }
  return {
    // devolve posição corrigida (ou null se livre). y acima do telhado não colide.
    resolve(x, z, radius, y) {
      const arr = map.get(Math.floor(x / CELL) + ',' + Math.floor(z / CELL));
      if (!arr) return null;
      for (const c of arr) {
        if (y !== undefined && y > c.top) continue;
        const dx = x - c.x, dz = z - c.z;
        const lx = dx * c.cs + dz * c.sn, lz = -dx * c.sn + dz * c.cs;
        const ex = c.hw + radius, ez = c.hd + radius;
        if (Math.abs(lx) < ex && Math.abs(lz) < ez) {
          const px = ex - Math.abs(lx), pz = ez - Math.abs(lz);
          let nlx = lx, nlz = lz;
          if (px < pz) nlx = Math.sign(lx || 1) * ex; else nlz = Math.sign(lz || 1) * ez;
          return { x: c.x + nlx * c.cs - nlz * c.sn, z: c.z + nlx * c.sn + nlz * c.cs };
        }
      }
      return null;
    },
  };
}
