// Interiores gerados sob demanda: qualquer prédio da ilha pode ser entrado.
// O interior é montado num "limbo" abaixo do mapa e descartado ao sair.
import * as THREE from 'three';
import { mulberry32 } from './city.js';

export const FLOOR_Y = -800;
const T = 0.18;     // espessura de parede
const VAO = 1.3;    // largura dos vãos de passagem

const CORES = {
  piso: [0x8a6a4a, 0x9c8464, 0x7a7a80, 0xa89878],
  parede: [0xe8e2d4, 0xdcd8cc, 0xe0d8c0, 0xd8dce0],
  teto: 0xf0ece0,
  madeira: 0x8a5a34, tecido: 0x3f6f9c, metal: 0x8f959c,
  cama: 0xd8dce8, verde: 0x3f7d4a, papel: 0xc8b88a,
};

const ACERVO = {
  casa: [
    ['cama', 1.0, 0.3, 1.05, CORES.cama], ['armário', 0.6, 1.0, 0.3, CORES.madeira],
    ['mesa', 0.7, 0.38, 0.5, CORES.madeira], ['sofá', 1.05, 0.4, 0.45, CORES.tecido],
    ['fogão', 0.35, 0.45, 0.3, CORES.metal], ['tv', 0.6, 0.35, 0.08, 0x24282c],
    ['estante', 0.5, 0.9, 0.22, CORES.madeira], ['planta', 0.22, 0.5, 0.22, CORES.verde],
    ['cadeira', 0.24, 0.45, 0.24, CORES.madeira], ['tapete', 1.1, 0.02, 0.8, 0xa04848],
  ],
  lobby: [
    ['balcão', 1.5, 0.55, 0.4, CORES.madeira], ['sofá', 1.1, 0.4, 0.45, CORES.tecido],
    ['planta', 0.28, 0.7, 0.28, CORES.verde], ['mesa', 0.5, 0.3, 0.5, 0x2c3034],
    ['elevador', 0.9, 1.1, 0.14, CORES.metal], ['quadro', 0.6, 0.45, 0.06, CORES.papel],
    ['poltrona', 0.42, 0.42, 0.42, CORES.tecido],
  ],
  galpao: [
    ['prateleira', 2.0, 1.6, 0.5, CORES.metal], ['caixas', 0.6, 0.6, 0.6, CORES.papel],
    ['palete', 0.8, 0.12, 0.6, CORES.madeira], ['tambor', 0.3, 0.5, 0.3, 0xc25a2a],
    ['engradado', 0.45, 0.45, 0.45, CORES.madeira],
  ],
  mansao: [
    ['sofá', 1.4, 0.42, 0.5, CORES.tecido], ['mesa', 1.2, 0.4, 0.7, CORES.madeira],
    ['estante', 0.9, 1.2, 0.25, CORES.madeira], ['piano', 0.8, 0.55, 0.6, 0x1c1c20],
    ['planta', 0.3, 0.8, 0.3, CORES.verde], ['lareira', 0.8, 0.6, 0.25, 0x8a8f99],
    ['poltrona', 0.45, 0.45, 0.45, CORES.tecido],
  ],
};

function tipoDe(style) {
  if (style === 'warehouse') return { nome: 'Galpão', acervo: ACERVO.galpao, pe: 5.4 };
  if (style === 'mansion') return { nome: 'Mansão', acervo: ACERVO.mansao, pe: 3.6 };
  if (style === 'tower' || style === 'beachfront' || style === 'midrise') {
    return { nome: 'Prédio', acervo: ACERVO.lobby, pe: 3.6 };
  }
  if (style === 'favela' || style === 'shack') return { nome: 'Barraco', acervo: ACERVO.casa, pe: 2.6 };
  return { nome: 'Casa', acervo: ACERVO.casa, pe: 3.0 };
}

export function buildInterior(b, gradientMap) {
  const rnd = mulberry32(Math.floor(Math.abs(b.x) * 73 + Math.abs(b.z) * 131) | 0);
  const tipo = tipoDe(b.style);
  const PE = tipo.pe;
  const grupo = new THREE.Group();
  const colliders = [];
  const toon = (cor) => new THREE.MeshToonMaterial({ gradientMap, color: cor });
  const W = Math.max(4.5, b.w - 0.5), D = Math.max(4.5, b.d - 0.5);

  const outMat = new THREE.MeshBasicMaterial({ color: 0x101010, side: THREE.BackSide });
  function caixa(cx, cy, cz, hw, hh, hd, cor, solido = true, contorno = true) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(hw * 2, hh * 2, hd * 2), toon(cor));
    m.position.set(cx, cy, cz);
    grupo.add(m);
    if (contorno) {
      const o = new THREE.Mesh(m.geometry, outMat);
      o.position.copy(m.position);
      o.scale.setScalar(1 + Math.min(0.12, 0.05 / Math.min(hw, hh, hd)));
      grupo.add(o);
    }
    if (solido && hh > 0.35) colliders.push({ x: cx, z: cz, hw, hd, top: FLOOR_Y + cy + hh, cs: 1, sn: 0 });
  }

  function parede(x0, z0, x1, z1, comVao) {
    const horiz = Math.abs(x1 - x0) > Math.abs(z1 - z0);
    const comp = horiz ? Math.abs(x1 - x0) : Math.abs(z1 - z0);
    const cor = CORES.parede[(rnd() * CORES.parede.length) | 0];
    const mx = (x0 + x1) / 2, mz = (z0 + z1) / 2;
    if (!comVao || comp < VAO + 1.2) {
      caixa(mx, PE / 2, mz, horiz ? comp / 2 : T, PE / 2, horiz ? T : comp / 2, cor, true, false);
      return;
    }
    const lado = (comp - VAO) / 2;
    for (const s of [-1, 1]) {
      const off = s * (VAO / 2 + lado / 2);
      caixa(horiz ? mx + off : mx, PE / 2, horiz ? mz : mz + off,
        horiz ? lado / 2 : T, PE / 2, horiz ? T : lado / 2, cor, true, false);
    }
    caixa(mx, PE - 0.4, mz, horiz ? VAO / 2 : T, 0.4, horiz ? T : VAO / 2, cor, false, false);
  }

  // piso e teto
  caixa(0, -0.1, 0, W / 2 + T, 0.1, D / 2 + T, CORES.piso[(rnd() * CORES.piso.length) | 0], false, false);
  caixa(0, PE + 0.1, 0, W / 2 + T, 0.1, D / 2 + T, CORES.teto, false, false);

  // perímetro, com o vão de entrada na parede sul
  parede(-W / 2, -D / 2, W / 2, -D / 2, true);
  parede(-W / 2, D / 2, W / 2, D / 2, false);
  parede(-W / 2, -D / 2, -W / 2, D / 2, false);
  parede(W / 2, -D / 2, W / 2, D / 2, false);

  // divisão em cômodos (galpão fica aberto, como galpão de verdade)
  const comodos = [];
  const maxProf = b.style === 'warehouse' ? 0 : 2;
  (function dividir(x0, z0, x1, z1, prof) {
    const larg = x1 - x0, fund = z1 - z0;
    if (prof >= maxProf || larg * fund < 46 || Math.min(larg, fund) < 4.5) {
      comodos.push({ x0, z0, x1, z1 });
      return;
    }
    if (larg >= fund) {
      const cx = x0 + larg * (0.4 + rnd() * 0.2);
      parede(cx, z0, cx, z1, true);
      dividir(x0, z0, cx, z1, prof + 1);
      dividir(cx, z0, x1, z1, prof + 1);
    } else {
      const cz = z0 + fund * (0.4 + rnd() * 0.2);
      parede(x0, cz, x1, cz, true);
      dividir(x0, z0, x1, cz, prof + 1);
      dividir(x0, cz, x1, z1, prof + 1);
    }
  })(-W / 2, -D / 2, W / 2, D / 2, 0);

  // mobília e iluminação por cômodo
  const luzes = [];
  const livre = { x: 0, z: -D / 2 + Math.min(3.2, D * 0.3) };   // não entulhar a entrada
  for (const c of comodos) {
    const larg = c.x1 - c.x0, fund = c.z1 - c.z0, area = larg * fund;
    const qtd = Math.min(40, Math.max(2, Math.round(area / 11)));
    for (let i = 0; i < qtd; i++) {
      const [, hw, hh, hd, cor] = tipo.acervo[(rnd() * tipo.acervo.length) | 0];
      if (larg < 2 * hw + 1.2 || fund < 2 * hd + 1.2) continue;
      // a maioria encostada na parede, o resto solto pelo cômodo
      let mx, mz;
      if (rnd() < (b.style === 'warehouse' ? 0.35 : 0.75)) {
        const lado = (rnd() * 4) | 0, m = 0.3;
        const faixaX = Math.max(0, larg - 2 * hw - 2 * m), faixaZ = Math.max(0, fund - 2 * hd - 2 * m);
        if (lado === 0) { mz = c.z0 + hd + m; mx = c.x0 + hw + m + rnd() * faixaX; }
        else if (lado === 1) { mz = c.z1 - hd - m; mx = c.x0 + hw + m + rnd() * faixaX; }
        else if (lado === 2) { mx = c.x0 + hw + m; mz = c.z0 + hd + m + rnd() * faixaZ; }
        else { mx = c.x1 - hw - m; mz = c.z0 + hd + m + rnd() * faixaZ; }
      } else {
        mx = c.x0 + hw + 0.6 + rnd() * Math.max(0, larg - 2 * hw - 1.2);
        mz = c.z0 + hd + 0.6 + rnd() * Math.max(0, fund - 2 * hd - 1.2);
      }
      if (Math.hypot(mx - livre.x, mz - livre.z) < 1.8) continue;
      caixa(mx, hh, mz, hw, hh, hd, cor);
    }
    // luminárias distribuídas em grade, uma a cada ~7 m
    const nx = Math.min(3, Math.max(1, Math.round(larg / 7)));
    const nz = Math.min(3, Math.max(1, Math.round(fund / 7)));
    for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) {
      const lx = c.x0 + larg * (i + 0.5) / nx, lz = c.z0 + fund * (j + 0.5) / nz;
      const luz = new THREE.PointLight(0xffe9c0, 6, Math.max(larg / nx, fund / nz) * 3.5, 1.5);
      luz.position.set(lx, PE - 0.45, lz);
      grupo.add(luz);
      luzes.push(luz);
      caixa(lx, PE - 0.12, lz, 0.3, 0.06, 0.3, 0xfff2d0, false, false);
    }
  }

  // batente da porta de saída
  const alturaPorta = Math.min(2.2, PE - 0.3);
  const marco = new THREE.Mesh(
    new THREE.BoxGeometry(VAO, alturaPorta, 0.1),
    new THREE.MeshBasicMaterial({ color: 0x2a2f36 })
  );
  marco.position.set(0, alturaPorta / 2, -D / 2 - T);
  grupo.add(marco);

  grupo.position.set(0, FLOOR_Y, 0);
  return {
    grupo, colliders, luzes, peDireito: PE,
    spawn: { x: livre.x, z: livre.z },
    saida: { x: 0, z: -D / 2 + 0.7 },
    titulo: `${tipo.nome} · ${b.bairro}`,
    predio: b,
  };
}
