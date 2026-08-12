// População da ilha. Os habitantes existem num raio ao redor do jogador e são
// reaproveitados conforme ele se desloca, com densidade própria de cada zona.
import * as THREE from 'three';
import { groundY, zoneAt } from './world.js';

const RAIO = 135;        // além disso, o habitante é realocado
const ANEL = [14, 118];  // faixa onde ele reaparece
const TOTAL = 300;

// quanta gente cada tipo de terreno comporta
const DENSIDADE = {
  cidade: 1.0, praia: 0.32, town: 0.4, campo: 0.06,
  floresta: 0.05, pantano: 0.03, deserto: 0.03, neve: 0.035, agua: 0,
};

const ROUPAS = [
  0xe0662e, 0x3f6f9c, 0x4a8f5a, 0xc9a33d, 0xa8496b, 0x6b5ba8, 0xd9d4c6,
  0x2f6f7d, 0xb85a3a, 0x7d8f4a, 0xcf5f5f, 0x4c5a6b,
];
const PELES = [0xf2c49a, 0xd9a273, 0xb07c4e, 0x8a5a34, 0x63422a];

export function createCrowd(scene, gradientMap, colliders) {
  const corpoGeo = new THREE.CapsuleGeometry(0.42, 1.0, 2, 6);
  const cabecaGeo = new THREE.SphereGeometry(0.31, 6, 5);
  // o contorno reusa a mesma matriz: a folga vai na própria geometria
  const corpoOut = corpoGeo.clone().scale(1.11, 1.07, 1.11);
  const cabecaOut = cabecaGeo.clone().scale(1.16, 1.16, 1.16);
  const outMat = new THREE.MeshBasicMaterial({ color: 0x101010, side: THREE.BackSide });

  const corpo = new THREE.InstancedMesh(corpoGeo, new THREE.MeshToonMaterial({ gradientMap }), TOTAL);
  const cabeca = new THREE.InstancedMesh(cabecaGeo, new THREE.MeshToonMaterial({ gradientMap }), TOTAL);
  const corpoO = new THREE.InstancedMesh(corpoOut, outMat, TOTAL);
  const cabecaO = new THREE.InstancedMesh(cabecaOut, outMat, TOTAL);
  for (const m of [corpo, cabeca, corpoO, cabecaO]) {
    m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    m.frustumCulled = false;
    scene.add(m);
  }

  const cor = new THREE.Color();
  const gente = [];
  for (let i = 0; i < TOTAL; i++) {
    gente.push({ x: 0, z: 0, ang: 0, vel: 0, fase: Math.random() * 9, ativo: false, escala: 1 });
    cor.setHex(ROUPAS[(Math.random() * ROUPAS.length) | 0]);
    corpo.setColorAt(i, cor);
    cor.setHex(PELES[(Math.random() * PELES.length) | 0]);
    cabeca.setColorAt(i, cor);
  }
  corpo.instanceColor.needsUpdate = true;
  cabeca.instanceColor.needsUpdate = true;

  const densPonto = (x, z) => {
    const y = groundY(x, z);
    return y < 1.2 ? 0 : (DENSIDADE[zoneAt(x, z, y).tipo] ?? 0.2);
  };

  // quanta gente cabe na região onde o jogador está agora
  function densidadeLocal(px, pz) {
    let soma = 0;
    for (let i = 0; i < 16; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = ANEL[0] + Math.random() * (ANEL[1] - ANEL[0]);
      soma += densPonto(px + Math.cos(a) * r, pz + Math.sin(a) * r);
    }
    return soma / 16;
  }

  // procura um lugar plausível para alguém morar/circular perto do jogador
  function realocar(p, px, pz) {
    for (let t = 0; t < 8; t++) {
      const a = Math.random() * Math.PI * 2;
      const r = ANEL[0] + Math.random() * (ANEL[1] - ANEL[0]);
      const x = px + Math.cos(a) * r, z = pz + Math.sin(a) * r;
      const y = groundY(x, z);
      if (y < 1.2) continue;
      // as primeiras tentativas preferem o terreno mais povoado da vizinhança
      if (t < 6 && Math.random() > densPonto(x, z)) continue;
      if (colliders.resolve(x, z, 0.5, y + 1)) continue;
      p.x = x; p.z = z;
      p.ang = Math.random() * Math.PI * 2;
      p.vel = 0.8 + Math.random() * 1.5;
      p.escala = 0.9 + Math.random() * 0.22;
      p.ativo = true;
      return true;
    }
    p.ativo = false;
    return false;
  }

  const m4 = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const eixo = new THREE.Vector3(0, 1, 0);
  const pos = new THREE.Vector3();
  const esc = new THREE.Vector3();
  let relogio = 0;
  let densMedia = 0.5, proxAmostra = 0, nAtivos = 0;

  function update(dt, jogador, visivel) {
    for (const m of [corpo, cabeca, corpoO, cabecaO]) m.visible = visivel;
    if (!visivel) return;
    relogio += dt;
    const px = jogador.x, pz = jogador.z;
    let realocados = 0;

    if (relogio > proxAmostra) {
      proxAmostra = relogio + 0.4;
      densMedia += (densidadeLocal(px, pz) - densMedia) * 0.35;
    }
    // é a densidade da região que define quantos habitantes existem por perto
    const alvo = Math.round(TOTAL * densMedia);

    for (let i = 0; i < TOTAL; i++) {
      const p = gente[i];
      if (p.ativo && Math.hypot(p.x - px, p.z - pz) > RAIO) { p.ativo = false; nAtivos--; }
      if (!p.ativo) {
        // poucos por quadro, para não travar quando se atravessa o mapa
        if (nAtivos < alvo && realocados < 30) {
          realocados++;
          if (realocar(p, px, pz)) nAtivos++;
        }
        if (!p.ativo) { esc.set(0, 0, 0); m4.compose(pos.set(0, -9999, 0), q, esc); setar(i); continue; }
      }

      // caminhada: segue em frente e desvia ao esbarrar
      const nx = p.x + Math.sin(p.ang) * p.vel * dt;
      const nz = p.z + Math.cos(p.ang) * p.vel * dt;
      const y = groundY(nx, nz);
      if (y < 1.0 || colliders.resolve(nx, nz, 0.5, y + 1)) {
        p.ang += 1.6 + Math.random();
      } else {
        p.x = nx; p.z = nz;
        if (Math.random() < 0.006) p.ang += (Math.random() - 0.5) * 1.2;
      }

      const chao = groundY(p.x, p.z);
      const passo = Math.sin(relogio * 7 * p.vel + p.fase);
      const s = p.escala;
      q.setFromAxisAngle(eixo, p.ang);
      esc.set(s, s, s);
      m4.compose(pos.set(p.x, chao + 0.95 * s + Math.abs(passo) * 0.05, p.z), q, esc);
      corpo.setMatrixAt(i, m4);
      corpoO.setMatrixAt(i, m4);
      m4.compose(pos.set(p.x, chao + 1.86 * s + Math.abs(passo) * 0.05, p.z), q, esc);
      cabeca.setMatrixAt(i, m4);
      cabecaO.setMatrixAt(i, m4);
    }
    for (const m of [corpo, cabeca, corpoO, cabecaO]) m.instanceMatrix.needsUpdate = true;

    function setar(i) {
      corpo.setMatrixAt(i, m4); corpoO.setMatrixAt(i, m4);
      cabeca.setMatrixAt(i, m4); cabecaO.setMatrixAt(i, m4);
    }
  }

  return { update, malhas: [corpo, cabeca, corpoO, cabecaO], censo: () => ({ ativos: nAtivos, dens: +densMedia.toFixed(3) }) };
}
