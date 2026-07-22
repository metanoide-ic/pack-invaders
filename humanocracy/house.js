/* ============================================================
   HUMANOCRACY — house.js
   20:30. Você chega em casa. PRIMEIRA PESSOA.
   Ande (WASD/setas), olhe ao redor (mouse), aproxime-se deles.
   Sala: sua mãe e a TV. Cozinha: Vessa. Quarto do Tomi: as
   visões. Quarto do Dario: o amigo no canto. E a porta.
   ============================================================ */
'use strict';

/* ---------- ESTADO ---------- */
const FP = { W: 480, H: 270, FOV: Math.PI / 3 };
const HOUSE = {
  active: false, x: 2.5, y: 6.0, ang: 0, pitch: 0,
  bobPhase: 0, bobY: 0, stepAcc: 0, moving: false,
  clockMin: 1230, acc: 0, lastTs: 0, raf: null, t: 0,
  spoke: {}, knock: null, forcedSleep: false,
};
const KEYS = {};

/* ---------- MAPA (grade; 0=chão, 1=parede, 2=porta de entrada) ----------
   A planta: você entra pela porta oeste no corredor central.
   ESQUERDA (norte): quarto do Tomi (1º), hóspedes 1, hóspedes 2, cozinha.
   DIREITA (sul): quarto da sua mãe (1º), quarto do Dario (ao lado), seu quarto.
   FIM DO CORREDOR: a sala — onde sua mãe está, no sofá, diante da TV. */
const MAPW = 33, MAPH = 13;
const MAP = [];
(function buildMap() {
  for (let y = 0; y < MAPH; y++) MAP.push(new Array(MAPW).fill(1));
  const carve = (x0, y0, x1, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) MAP[y][x] = 0; };
  carve(1, 5, 24, 7);    // corredor central
  carve(25, 2, 31, 10);  // sala, no fim do corredor
  carve(2, 1, 6, 3);     // ESQ 1: quarto do Tomi
  carve(8, 1, 12, 3);    // ESQ 2: quarto de hóspedes 1
  carve(14, 1, 18, 3);   // ESQ 3: quarto de hóspedes 2
  carve(20, 1, 24, 3);   // ESQ 4: cozinha
  carve(2, 9, 6, 11);    // DIR 1: quarto da sua mãe
  carve(8, 9, 12, 11);   // DIR 2: quarto do Dario
  carve(14, 9, 18, 11);  // DIR 3: seu quarto
  [[4, 4], [10, 4], [16, 4], [22, 4]].forEach(([x, y]) => MAP[y][x] = 0); // vãos norte
  [[4, 8], [10, 8], [16, 8]].forEach(([x, y]) => MAP[y][x] = 0);          // vãos sul
  MAP[6][0] = 2; // a porta de entrada, na parede oeste
})();
const ROOMS = [
  { x0: 2, y0: 1, x1: 6, y1: 3, nome: 'QUARTO DE TOMI', tint: [70, 80, 92] },
  { x0: 8, y0: 1, x1: 12, y1: 3, nome: 'QUARTO DE HÓSPEDES 1', tint: [64, 62, 58] },
  { x0: 14, y0: 1, x1: 18, y1: 3, nome: 'QUARTO DE HÓSPEDES 2', tint: [64, 62, 58] },
  { x0: 20, y0: 1, x1: 24, y1: 3, nome: 'COZINHA', tint: [78, 88, 70] },
  { x0: 2, y0: 9, x1: 6, y1: 11, nome: 'QUARTO DA SUA MÃE', tint: [86, 76, 62] },
  { x0: 8, y0: 9, x1: 12, y1: 11, nome: 'QUARTO DE DARIO', tint: [58, 58, 64] },
  { x0: 14, y0: 9, x1: 18, y1: 11, nome: 'SEU QUARTO', tint: [88, 74, 58] },
  { x0: 25, y0: 2, x1: 31, y1: 10, nome: 'SALA', tint: [96, 84, 66] },
  { x0: 1, y0: 5, x1: 24, y1: 7, nome: 'CORREDOR', tint: [72, 68, 58] },
];
/* Mapa do Dia 48: a pista da fila, sem fila, até o seu próprio guichê */
const MAP48 = [];
(function buildMap48() {
  for (let y = 0; y < 14; y++) MAP48.push(new Array(5).fill(1));
  for (let y = 1; y <= 12; y++) for (let x = 1; x <= 3; x++) MAP48[y][x] = 0;
})();
/* cena atual: a casa por padrão; o espelho no dia 48 */
const CUR = { map: MAP, w: MAPW, h: MAPH, rooms: ROOMS };
function roomAt(x, y) { return CUR.rooms.find(r => x >= r.x0 && x <= r.x1 + 1 && y >= r.y0 && y <= r.y1 + 1); }
function tintAt(mx, my) {
  if (MAP[my] && MAP[my][mx] === 2) return [150, 104, 52];
  // paredes herdam o tom do cômodo adjacente mais próximo
  const r = roomAt(mx, my) || roomAt(mx, my + 1) || roomAt(mx, my - 1) || roomAt(mx + 1, my) || roomAt(mx - 1, my);
  return r ? r.tint : [66, 64, 56];
}

/* ---------- SPRITES (pintados em canvas, sem assets externos) ---------- */
function mk(w, h, fn) { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d')); return c; }
const SPR = {};

/* ---------- A FAMÍLIA — mesmas feições em TODO lugar ----------
   Fisionomias fixas (fseed constante): o rosto que aparece no diálogo é
   o MESMO que anda pela casa em 3D, pintado pelo mesmo motor procedural
   dos cidadãos do guichê (faces.js). A família é osana, de Valgrado —
   coerente com os documentos da campanha. */
const FAM_FEATURES = {
  mae:   { skin: 0, hair: 7, hairStyle: 1, eyes: 0, mouth: 1, beard: 0, glasses: false, brow: 0, faceW: 1, sexo: 'f', hat: 0, earring: false, idade: 64, rugas: true,  etnia: 'osano', fseed: 811001 },
  vessa: { skin: 1, hair: 1, hairStyle: 1, eyes: 1, mouth: 0, beard: 0, glasses: false, brow: 0, faceW: 1, sexo: 'f', hat: 0, earring: true,  idade: 38, rugas: false, etnia: 'osano', fseed: 811002 },
  tomi:  { skin: 0, hair: 2, hairStyle: 1, eyes: 1, mouth: 0, beard: 0, glasses: false, brow: 0, faceW: 0, sexo: 'm', hat: 0, earring: false, idade: 8,  rugas: false, etnia: 'osano', fseed: 811003 },
  dario: { skin: 2, hair: 5, hairStyle: 0, eyes: 0, mouth: 1, beard: 2, glasses: false, brow: 1, faceW: 1, sexo: 'm', hat: 0, earring: false, idade: 24, rugas: false, etnia: 'osano', fseed: 811004 },
};
const FAM_COAT = { mae: 'rgb(74,64,54)', vessa: 'rgb(66,57,47)', tomi: 'rgb(74,90,106)', dario: 'rgb(46,50,48)' };

/* sprite de corpo inteiro 64×128: busto procedural + corpo pintado abaixo */
function famSprite(who) {
  const f = FAM_FEATURES[who], coat = FAM_COAT[who];
  const child = f.idade <= 12;
  return mk(64, 128, (x) => {
    const headY = child ? 26 : 2;                 // criança: mais baixa no quadro
    const bustH = child ? 62 : 77;
    // pernas primeiro (o busto cobre a cintura)
    const legTone = 'rgba(28,26,22,1)';
    x.fillStyle = legTone;
    if (f.sexo === 'f') { // saia longa + sapatos
      x.beginPath();
      x.moveTo(16, headY + bustH - 8); x.lineTo(48, headY + bustH - 8);
      x.lineTo(52, 120); x.lineTo(12, 120); x.closePath();
      x.fillStyle = coat; x.fill();
      x.fillStyle = 'rgba(0,0,0,.3)'; x.fillRect(12, 116, 40, 4);
      x.fillStyle = '#1c1914'; x.fillRect(20, 120, 9, 6); x.fillRect(36, 120, 9, 6);
    } else {
      x.fillStyle = child ? '#3a4652' : '#26282a';
      x.fillRect(22, headY + bustH - 10, 8, child ? 34 : 52);
      x.fillRect(34, headY + bustH - 10, 8, child ? 34 : 52);
      x.fillStyle = '#17150f';
      x.fillRect(20, child ? 118 : 120, 11, 6); x.fillRect(33, child ? 118 : 120, 11, 6);
    }
    // sombra no chão
    const g = x.createRadialGradient(32, 124, 2, 32, 124, 16);
    g.addColorStop(0, 'rgba(0,0,0,.5)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = g; x.beginPath(); x.ellipse(32, 124, 16, 4, 0, 0, 6.29); x.fill();
    // busto do motor procedural (transparente fora da figura)
    if (typeof renderPortraitCanvas === 'function') {
      const bust = renderPortraitCanvas(f, {
        w: 64, h: bustH, paintScale: 2.2, coat,
        post: { levels: 10, grain: 9, aberr: 1, scan: 0.1, sat: 0.42 },
      });
      x.drawImage(bust, 0, headY);
    }
    // avental da Vessa por cima do casaco
    if (who === 'vessa') {
      x.fillStyle = 'rgba(122,106,79,.9)';
      x.beginPath();
      x.moveTo(24, headY + bustH - 18); x.lineTo(40, headY + bustH - 18);
      x.lineTo(44, 104); x.lineTo(20, 104); x.closePath(); x.fill();
      x.strokeStyle = 'rgba(0,0,0,.25)'; x.lineWidth = 1;
      x.beginPath(); x.moveTo(24, headY + bustH - 12); x.lineTo(40, headY + bustH - 12); x.stroke();
    }
    // passa o corpo pintado pela mesma fita (leve — o busto já veio degradado)
    if (window.analogPostCanvas) analogPostCanvas(x.canvas, f.fseed, { levels: 12, grain: 6, aberr: 0, scan: 0.06, sat: 0.6 });
  });
}
function buildSprites() {
  if (SPR.mae) return;
  const R = (ctx, x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); };
  const C = (ctx, x, y, r, c) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.29); ctx.fill(); };
  SPR.mae = famSprite('mae');
  SPR.vessa = famSprite('vessa');
  SPR.tomi = famSprite('tomi');
  SPR.dario = mk(64, 128, (x) => { // de costas — ele olha para o canto. sempre.
    const f = FAM_FEATURES.dario;
    // pernas
    R(x, 25, 100, 7, 26, '#26292a'); R(x, 33, 100, 7, 26, '#26292a');
    R(x, 23, 124, 10, 4, '#141310'); R(x, 32, 124, 10, 4, '#141310');
    // casaco (costas: costura central, ombros caídos)
    x.fillStyle = FAM_COAT.dario;
    x.beginPath();
    x.moveTo(18, 108); x.lineTo(17, 60); x.quadraticCurveTo(18, 48, 32, 47);
    x.quadraticCurveTo(46, 48, 47, 60); x.lineTo(46, 108); x.closePath(); x.fill();
    x.strokeStyle = 'rgba(0,0,0,.4)'; x.lineWidth = 1;
    x.beginPath(); x.moveTo(32, 50); x.lineTo(32, 106); x.stroke(); // costura
    x.strokeStyle = 'rgba(200,205,190,.08)'; x.lineWidth = 1.4;
    x.beginPath(); x.moveTo(19, 62); x.quadraticCurveTo(22, 52, 32, 50); x.stroke(); // luz de recorte
    // pescoço + nuca
    R(x, 28, 40, 8, 9, '#8c6b4e');
    // cabeça POR TRÁS: só cabelo — fio a fio, como o motor faz
    x.fillStyle = '#141414';
    x.beginPath(); x.ellipse(32, 32, 11, 12.5, 0, 0, 6.29); x.fill();
    for (let i = 0; i < 70; i++) {
      const t = i / 70, hx = 22 + t * 20, hy = 22 + Math.abs(Math.sin(i * 3.7)) * 4;
      x.strokeStyle = (i % 3) ? 'rgba(6,6,6,.7)' : 'rgba(70,70,66,.35)';
      x.lineWidth = 0.6;
      x.beginPath(); x.moveTo(hx, hy);
      x.quadraticCurveTo(hx + (t - 0.5) * 3, hy + 9, hx + (t - 0.5) * 6, hy + 17);
      x.stroke();
    }
    // orelha esquerda aparecendo — a única prova de que há um rosto do outro lado
    C(x, 20.5, 34, 2.2, '#8c6b4e');
    x.fillStyle = 'rgba(0,0,0,.3)'; x.beginPath(); x.ellipse(20.5, 34.4, 1, 1.5, 0, 0, 6.29); x.fill();
    // sombra no chão
    const g = x.createRadialGradient(32, 124, 2, 32, 124, 16);
    g.addColorStop(0, 'rgba(0,0,0,.5)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = g; x.beginPath(); x.ellipse(32, 124, 16, 4, 0, 0, 6.29); x.fill();
    if (window.analogPostCanvas) analogPostCanvas(x.canvas, 811004, { levels: 10, grain: 9, aberr: 0, scan: 0.1, sat: 0.42 });
  });
  SPR.sofa = mk(96, 64, (x) => {
    R(x, 4, 24, 88, 34, '#3d3327'); R(x, 0, 10, 14, 48, '#463b2c'); R(x, 82, 10, 14, 48, '#463b2c');
    R(x, 12, 16, 72, 14, '#463b2c'); R(x, 6, 58, 8, 6, '#221d14'); R(x, 82, 58, 8, 6, '#221d14');
  });
  SPR.tv = mk(64, 80, (x) => {
    R(x, 6, 4, 52, 40, '#141610'); R(x, 12, 10, 40, 28, '#2c3a34');
    R(x, 14, 12, 36, 3, '#4a5e56'); R(x, 14, 22, 36, 2, '#405248');
    R(x, 27, 44, 10, 22, '#211e16'); R(x, 14, 66, 36, 5, '#211e16');
  });
  SPR.stove = mk(64, 80, (x) => {
    R(x, 6, 24, 52, 52, '#33302a'); R(x, 12, 32, 22, 20, '#221f19');
    C(x, 18, 27, 2, '#8a734d'); C(x, 28, 27, 2, '#8a734d');
    R(x, 36, 12, 20, 10, '#26231d'); R(x, 38, 8, 16, 5, '#1d1a15');
  });
  SPR.bedT = mk(96, 56, (x) => {
    R(x, 2, 22, 92, 24, '#3a4652'); R(x, 2, 8, 12, 38, '#2e3a44'); R(x, 16, 16, 24, 10, '#c9c2ab');
  });
  SPR.bedD = mk(96, 56, (x) => {
    R(x, 2, 24, 92, 22, '#33302a'); R(x, 2, 10, 10, 36, '#2a2722'); R(x, 14, 18, 22, 8, '#b5ae9c');
  });
  SPR.bedQ = mk(112, 60, (x) => {
    R(x, 2, 24, 108, 28, '#4a4036'); R(x, 2, 8, 14, 44, '#3a332a');
    R(x, 18, 16, 26, 10, '#c9c2ab'); R(x, 46, 18, 62, 10, '#55432e');
  });
  SPR.clock = mk(36, 84, (x) => {
    R(x, 4, 2, 28, 80, '#2c2115'); C(x, 18, 18, 10, '#c9c2ab');
    x.strokeStyle = '#241f16'; x.lineWidth = 1.6;
    x.beginPath(); x.moveTo(18, 18); x.lineTo(18, 11); x.stroke();
    x.beginPath(); x.moveTo(18, 18); x.lineTo(23, 18); x.stroke();
    R(x, 10, 32, 16, 44, '#0f0b07'); R(x, 16, 34, 3, 30, '#8a734d'); C(x, 17.5, 66, 4, '#8a734d');
  });
  SPR.retrato = mk(48, 64, (x) => {
    R(x, 0, 0, 48, 64, '#241f16'); R(x, 5, 5, 38, 54, '#c9c2ab');
    C(x, 13, 24, 4, '#3a332a'); R(x, 10, 28, 7, 14, '#3a332a');
    C(x, 23, 22, 4.4, '#3a332a'); R(x, 19, 27, 8, 16, '#3a332a');
    C(x, 33, 25, 3.6, '#3a332a'); R(x, 30, 29, 7, 12, '#3a332a');
    C(x, 18, 42, 3, '#3a332a'); R(x, 15, 45, 6, 9, '#3a332a');
    x.globalAlpha = .35; C(x, 38, 44, 2.8, '#3a332a'); R(x, 35, 47, 6, 8, '#3a332a'); x.globalAlpha = 1;
  });
  SPR.janela = mk(64, 80, (x) => {
    R(x, 0, 0, 64, 80, '#241f16'); R(x, 6, 6, 52, 68, '#05070c');
    R(x, 30, 6, 4, 68, '#241f16'); R(x, 6, 38, 52, 4, '#241f16');
    x.fillStyle = 'rgba(215,215,208,.7)';
    [[12, 14], [22, 30], [44, 20], [50, 52], [16, 58], [38, 64]].forEach(([a, b]) => x.fillRect(a, b, 2, 2));
  });
  SPR.realocados = mk(80, 128, (x) => { // os dois. de pé. de costas. sempre.
    [[22, '#26292b'], [56, '#2b2e30']].forEach(([cx, cor]) => {
      x.fillStyle = cor; x.fillRect(cx - 9, 44, 18, 52);
      x.fillRect(cx - 8, 94, 6, 30); x.fillRect(cx + 2, 94, 6, 30);
      x.fillStyle = '#9c8468'; x.beginPath(); x.arc(cx, 34, 9, 0, 6.29); x.fill();
      x.fillStyle = '#141414'; x.beginPath(); x.arc(cx, 32, 10, Math.PI * .95, Math.PI * 2.05); x.fill();
      x.fillRect(cx - 9, 30, 18, 9);
    });
  });
  SPR.booth = mk(96, 128, (x) => { // o seu guichê, visto do lado errado
    x.fillStyle = '#23251d'; x.fillRect(4, 20, 88, 108);
    x.fillStyle = '#0d0f0c'; x.fillRect(14, 32, 68, 52);
    const g = x.createRadialGradient(48, 58, 4, 48, 58, 40);
    g.addColorStop(0, 'rgba(201,180,120,.35)'); g.addColorStop(1, 'rgba(201,180,120,0)');
    x.fillStyle = g; x.fillRect(14, 32, 68, 52);
    x.fillStyle = '#3a3c33'; x.fillRect(10, 84, 76, 8);   // bandeja
    x.fillStyle = '#c9c2ab'; x.fillRect(38, 86, 20, 4);   // seus documentos, esperando
    x.fillStyle = '#2c2115'; x.fillRect(0, 10, 96, 10);
    x.fillStyle = '#8a734d'; x.font = 'bold 8px monospace'; x.fillText('POSTO 7', 30, 18);
  });
  SPR.lamp = mk(32, 64, (x) => {
    x.fillStyle = '#1d1a15'; x.fillRect(14, 0, 4, 34);
    x.fillStyle = '#2c261c'; x.fillRect(6, 30, 20, 8);
    const g = x.createRadialGradient(16, 46, 2, 16, 46, 12);
    g.addColorStop(0, '#e8d8a0'); g.addColorStop(1, '#6a5a30');
    x.fillStyle = g; x.beginPath(); x.arc(16, 46, 9, 0, 6.29); x.fill();
  });
  SPR.shadow = mk(96, 128, (x) => {
    const g = x.createRadialGradient(48, 70, 6, 48, 70, 60);
    g.addColorStop(0, 'rgba(0,0,0,.92)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = g; x.fillRect(0, 0, 96, 128);
  });
}

/* ---------- TEXTURAS DE PAREDE (64×64, pintadas à mão) ---------- */
const TEX = {};
function buildTextures() {
  if (TEX.corr) return;
  const base = (x, c) => { x.fillStyle = c; x.fillRect(0, 0, 64, 64); };
  const board = (x, c) => { x.fillStyle = c; x.fillRect(0, 54, 64, 10); x.fillStyle = 'rgba(0,0,0,.35)'; x.fillRect(0, 53, 64, 2); };
  const stains = (x, n, a) => { x.fillStyle = `rgba(0,0,0,${a})`; for (let i = 0; i < n; i++) { const s = 2 + (i * 7) % 9; x.fillRect((i * 23) % 60, (i * 13) % 48, s, s); } };
  TEX.sala = mk(64, 64, (x) => { // papel listrado, já cansado
    base(x, '#5e5340');
    x.fillStyle = '#554a39'; for (let i = 0; i < 8; i++) x.fillRect(i * 8, 0, 4, 54);
    stains(x, 3, .12); board(x, '#3a3021');
  });
  TEX.coz = mk(64, 64, (x) => { // azulejo antigo
    base(x, '#4e5844');
    x.strokeStyle = '#414a39'; x.lineWidth = 2;
    for (let i = 0; i <= 4; i++) { x.beginPath(); x.moveTo(0, i * 13); x.lineTo(64, i * 13); x.stroke(); }
    for (let i = 0; i <= 4; i++) { x.beginPath(); x.moveTo(i * 16, 0); x.lineTo(i * 16, 52); x.stroke(); }
    stains(x, 2, .15); board(x, '#33302a');
  });
  TEX.tomi = mk(64, 64, (x) => { // estrelinhas de papel de criança
    base(x, '#46505c');
    x.fillStyle = '#525e6c';
    [[8, 10], [30, 22], [50, 8], [18, 36], [44, 40]].forEach(([a, b]) => {
      x.fillRect(a, b, 3, 3); x.fillRect(a + 1, b - 2, 1, 7); x.fillRect(a - 2, b + 1, 7, 1);
    });
    board(x, '#33302a');
  });
  TEX.dario = mk(64, 64, (x) => { // o papel mais velho da casa. ninguém troca.
    base(x, '#3c3c42');
    x.fillStyle = '#36363c'; for (let i = 0; i < 8; i++) x.fillRect(i * 8, 0, 4, 54);
    stains(x, 6, .22); board(x, '#26262a');
  });
  TEX.casal = mk(64, 64, (x) => { // losangos discretos
    base(x, '#5a4c3c');
    x.strokeStyle = 'rgba(0,0,0,.18)'; x.lineWidth = 1.6;
    for (let i = -2; i < 6; i++) {
      x.beginPath(); x.moveTo(i * 16, 0); x.lineTo(i * 16 + 27, 54); x.stroke();
      x.beginPath(); x.moveTo(i * 16 + 27, 0); x.lineTo(i * 16, 54); x.stroke();
    }
    board(x, '#3a3021');
  });
  TEX.corr = mk(64, 64, (x) => { // reboco nu do corredor
    base(x, '#4a463c'); stains(x, 5, .16);
    x.fillStyle = 'rgba(0,0,0,.12)'; x.fillRect(0, 0, 64, 6);
    board(x, '#302c24');
  });
  TEX.muro = mk(64, 64, (x) => { // o muro do posto, do lado de quem espera
    base(x, '#3e3d38');
    stains(x, 7, .22);
    x.strokeStyle = 'rgba(0,0,0,.3)'; x.lineWidth = 1;
    x.beginPath(); x.moveTo(0, 21); x.lineTo(64, 21); x.stroke();
    x.beginPath(); x.moveTo(0, 42); x.lineTo(64, 42); x.stroke();
    // riscos de quem contou os dias esperando
    x.strokeStyle = 'rgba(0,0,0,.4)';
    for (let i = 0; i < 5; i++) { x.beginPath(); x.moveTo(10 + i * 4, 28); x.lineTo(10 + i * 4, 36); x.stroke(); }
    x.beginPath(); x.moveTo(8, 36); x.lineTo(28, 28); x.stroke();
  });
  TEX.door = mk(64, 64, (x) => { // a porta. madeira, almofadas, maçaneta — e o olho mágico
    base(x, '#3a2c1a');
    x.fillStyle = 'rgba(0,0,0,.25)'; [16, 32, 48].forEach(px => x.fillRect(px, 0, 2, 64));
    x.fillStyle = '#241b0e'; x.fillRect(8, 8, 48, 20); x.fillRect(8, 34, 48, 22);
    x.fillStyle = '#8a734d'; x.fillRect(50, 29, 5, 5);
    x.fillStyle = '#0a0908'; x.beginPath(); x.arc(32, 22, 2.6, 0, 6.29); x.fill();
    x.strokeStyle = '#8a734d'; x.lineWidth = 1; x.beginPath(); x.arc(32, 22, 3.6, 0, 6.29); x.stroke();
  });
}
function texAt(mx, my, tile) {
  if (HOUSE.mode === 'mirror') return TEX.muro;
  if (tile === 2) return TEX.door;
  const r = roomAt(mx, my) || roomAt(mx, my + 1) || roomAt(mx, my - 1) || roomAt(mx + 1, my) || roomAt(mx - 1, my);
  if (!r) return TEX.corr;
  return {
    'SALA': TEX.sala, 'COZINHA': TEX.coz, 'QUARTO DE TOMI': TEX.tomi,
    'QUARTO DE DARIO': TEX.dario, 'SEU QUARTO': TEX.casal, 'CORREDOR': TEX.corr,
    'QUARTO DE HÓSPEDES 1': TEX.dario, 'QUARTO DE HÓSPEDES 2': TEX.corr,
    'QUARTO DA SUA MÃE': TEX.casal,
  }[r.nome] || TEX.corr;
}

/* ---------- ROSTOS EM CLOSE (caixa de diálogo) ----------
   O MESMO motor procedural dos cidadãos (faces.js), com as MESMAS
   fisionomias dos sprites 3D — a pessoa do corredor é a pessoa do
   diálogo. Dario é a exceção diegética: sempre de costas. */
const FACES = {};
function buildFaces() {
  if (FACES.mae) return;
  const famClose = (who) => {
    const cv = mk(72, 72, () => {});
    if (typeof renderPortraitCanvas !== 'function') return cv;
    const p = renderPortraitCanvas(FAM_FEATURES[who], {
      w: 72, h: 86, zoom: 1.4, focusY: 48, paintScale: 2.6,
      bg: '#0a0a08', coat: FAM_COAT[who],
      post: { levels: 9, grain: 14, aberr: 1, scan: 0.15, sat: 0.4, vig: 0.5 },
    });
    cv.getContext('2d').drawImage(p, 0, -7);
    return cv;
  };
  FACES.mae = famClose('mae');
  FACES.vessa = famClose('vessa');
  FACES.tomi = famClose('tomi');
  FACES.dario = mk(72, 72, (x) => {
    // sempre de costas. sempre. — mas com a nuca do motor: cabelo fio a fio
    x.fillStyle = '#0a0a08'; x.fillRect(0, 0, 72, 72);
    x.fillStyle = FAM_COAT.dario; x.fillRect(12, 52, 48, 20);
    x.strokeStyle = 'rgba(0,0,0,.4)'; x.lineWidth = 1.4;
    x.beginPath(); x.moveTo(36, 54); x.lineTo(36, 72); x.stroke();
    x.fillStyle = '#8c6b4e'; x.fillRect(30, 44, 12, 12); // pescoço
    x.fillStyle = '#141414';
    x.beginPath(); x.ellipse(36, 30, 17, 20, 0, 0, 6.29); x.fill();
    for (let i = 0; i < 110; i++) {
      const t = i / 110, hx = 21 + t * 30, hy = 13 + Math.abs(Math.sin(i * 2.9)) * 6;
      x.strokeStyle = (i % 3) ? 'rgba(5,5,5,.75)' : 'rgba(74,74,70,.4)';
      x.lineWidth = 0.7;
      x.beginPath(); x.moveTo(hx, hy);
      x.quadraticCurveTo(hx + (t - 0.5) * 5, hy + 15, hx + (t - 0.5) * 10, hy + 30);
      x.stroke();
    }
    // luz de recorte à esquerda — a lâmpada do corredor atrás dele
    x.strokeStyle = 'rgba(210,205,185,.14)'; x.lineWidth = 2;
    x.beginPath(); x.arc(36, 31, 17.5, Math.PI * 0.75, Math.PI * 1.25); x.stroke();
    if (window.analogPostCanvas) analogPostCanvas(x.canvas, 9104, { levels: 8, grain: 16, aberr: 1, scan: 0.16, sat: 0.4 });
  });
}

/* ---------- ENTIDADES ---------- */
let ENTS = [];
function buildEnts() {
  const F = S.family;
  ENTS = [
    // ESQ 1 — quarto do Tomi
    { spr: 'bedT', x: 5.0, y: 1.8, sc: .38 },
    F.tomi.alive && { spr: 'tomi', spot: 'tomi', x: 3.4, y: 2.1, sc: .52 },
    // ESQ 2 — hóspedes 1: vazio... até o Conselho realocar alguém
    { spr: 'bedD', x: 11.2, y: 1.8, sc: .36 },
    S.day >= 31 && { spr: 'realocados', spot: 'hosp1', x: 9.6, y: 1.9, sc: .7 },
    S.day < 31 && { spot: 'hosp1', x: 10, y: 2 },
    // ESQ 3 — hóspedes 2: o quarto que ninguém usa
    { spr: 'bedD', x: 17.2, y: 1.8, sc: .36 },
    { spot: 'hosp2', x: 16, y: 2 },
    // ESQ 4 — cozinha
    { spr: 'clock', x: 20.6, y: 1.24, sc: .5, lift: .28 },
    { spr: 'stove', x: 23.2, y: 1.7, sc: .46 },
    F.vessa.alive && { spr: 'vessa', spot: 'vessa', x: 21.8, y: 2.1, sc: .7 },
    // DIR 1 — quarto da sua mãe (ela não está aqui. ela está na sala.)
    { spr: 'bedQ', x: 4.6, y: 10.2, sc: .4 },
    { spot: 'quartoMae', x: 4, y: 10 },
    // DIR 2 — quarto do Dario, ao lado do da mãe
    { spr: 'bedD', x: 11.4, y: 10.2, sc: .36 },
    { spr: 'shadow', x: 11.6, y: 10.7, sc: .95, alpha: .85 },
    F.dario.alive && { spr: 'dario', spot: 'dario', x: 10.4, y: 10.4, sc: .7 },
    // DIR 3 — seu quarto
    { spr: 'bedQ', spot: 'bed', x: 16.4, y: 10.2, sc: .44 },
    // SALA — no fim do corredor
    { spr: 'retrato', spot: 'retrato', x: 26.0, y: 2.28, sc: .34, lift: .42 },
    { spr: 'tv', x: 26.2, y: 6.4, sc: .38, glow: true },
    { spr: 'sofa', x: 29.4, y: 6.4, sc: .4 },
    F.mae.alive && { spr: 'mae', spot: 'mae', x: 29.4, y: 5.9, sc: .68 },
    { spr: 'janela', x: 30.6, y: 2.24, sc: .44, lift: .34 },
    { spot: 'door', x: 1.0, y: 6.0 }, // invisível: a porta é a parede oeste
    // lâmpadas de teto: pouca luz, muita sombra
    ...[[4, 2], [10, 2], [16, 2], [22, 2], [4, 10], [10, 10], [16, 10], [6, 6], [13, 6], [20, 6], [28, 6]]
      .map(([lx, ly]) => ({ spr: 'lamp', x: lx, y: ly, sc: .16, lift: .74, glowWarm: true })),
  ].filter(Boolean);
}

/* ---------- DIÁLOGOS ---------- */
const H_LINES = {
  mae: {
    republica: [
      'Sente um pouco, filho. A televisão passou o dia inteiro falando dessa fila sua. Dizem que tem gente dormindo na calçada.',
      'Fiz chá. Esfriou. Faço outro amanhã. — Ela não desgruda os olhos da TV. — Esse apresentador novo pisca demais. Ou de menos. Um dos dois.',
      'Sua avó dizia: "quem vigia a porta esquece a janela". Eu nunca entendi. Agora entendo um pouco.',
    ],
    mehrvolk: [
      'Trocaram o hino de novo. Eu cantava o antigo pra você dormir... Agora dizem que o antigo é crime. Cantar baixinho também é?',
      'A vizinha do 11 denunciou o próprio genro, filho. GENRO. A televisão deu parabéns pra ela. Parabéns.',
      'Rasguei um papel essa semana. Não me arrependo. — Ela aumenta o volume da TV. — Não me arrependo.',
    ],
    conselho: [
      'Agora a televisão diz que os Alternados nunca existiram. Semana passada existiam demais. Eu já vivi muito pra acreditar em televisão, filho.',
      'Levaram o retrato antigo do corredor do prédio. Puseram outro. O rosto é diferente mas a moldura... a moldura é a mesma.',
      'Aquela família que mora no seu... quer dizer, NOSSO apartamento agora. Eles não fazem barulho nenhum. Nenhum. Nem os passos.',
    ],
    colapso: [
      'A televisão só dá chuvisco. Eu deixo ligada mesmo assim. A luz dela... faz companhia. Você acha que tem alguém do outro lado do chuvisco?',
      'Hoje eu fui andar. Eu sei que eu odeio andar. Mas alguma coisa em mim quis andar. Voltei, ué. Eu sempre volto. — Ela sorri. Demora um segundo a mais que o normal.',
      'Se um dia eu voltar diferente, filho... não abre a porta. Nem pra mim. Promete? — A TV chia. — Promete.',
    ],
    curto: ['Vai dormir, filho. Amanhã tem fila.', 'Shhh. Agora é a novela.', 'O chá esfriou de novo.'],
    doente: 'Ela está enrolada na manta, ardendo em febre. "Não gasta dinheiro comigo, filho. Gasta com os meninos." A TV continua ligada.',
  },
  vessa: {
    republica: [
      'Chegou... — Ela mexe a panela sem olhar. — A Marta veio aqui hoje. Aquela boca não para. Mas escuta, às vezes sai coisa útil do meio da fofoca.',
      'Sobrou pão de ontem. Amanhã eu dou um jeito no jantar. A gente sempre dá um jeito, não é?',
      'O arquivo tá estranho. Pastas que eu organizei... amanhecem em outra ordem. Deve ser o turno da noite. Deve ser.',
    ],
    mehrvolk: [
      'Me fizeram assinar um termo hoje. "Confiabilidade". A caneta era deles, o papel era deles, a mão era minha. Por enquanto a mão era minha.',
      'A Lena parou de vir. O marido dela achou "arriscado" a amizade. Amizade agora tem risco, entende?',
      'Cuidado com o que você carimba, meu amor. As paredes do arquivo ouvem. As daqui de casa eu já não sei.',
    ],
    conselho: [
      'Os realocados pediram sal DE NOVO. Terceira vez. O que é que eles cozinham que não faz cheiro, hein? Me diz.',
      'Fofoca do dia: dizem que quem trabalhou pro governo antigo tá sumindo. Você trabalhou pros dois, amor. Você trabalha pra qualquer um que mande. Isso salva ou condena?',
      'Eu guardei umas coisas numa mala. Não me olha assim. É só... por precaução. Todo mundo tem uma mala agora.',
    ],
    colapso: [
      'Não tem mais fofoca. As amigas... cada uma sumiu de um jeito. A Marta foi pro norte. Do norte não chega notícia. Nem ruim.',
      'Hoje eu vi a fila do seu posto de longe. Tanta gente, meu amor. E você lá dentro, decidindo. Como é que você dorme? — Ela para. — Desculpa. Eu sei como você dorme. Eu ouço.',
      'Quando isso acabar a gente atravessa também. Pro lado de lá. Deve ser igual. Mas pelo menos é LONGE.',
    ],
    curto: ['O jantar já foi. Te deixei um prato.', 'Amanhã eu te conto o resto.', 'Vai ver os meninos antes de dormir.'],
    doente: 'Ela está sentada no chão da cozinha, encostada no fogão apagado. "Já passa. Vai ver os meninos." Não passa.',
  },
  tomi: {
    republica: [
      'Pai! Eu desenhei a família. A professora gostou. Só perguntou por que eu desenhei você com dois rostos. Eu não lembro de ter desenhado o segundo.',
      'Pai, na fila da sua fronteira... as pessoas más têm cara de quê? Todo mundo tem cara de gente, não tem? Aí como é que você sabe?',
      'Eu sonhei com números. Um monte. Carimbados na testa das pessoas. O seu era bonito, pai. O seu era quase igual ao de verdade.',
    ],
    mehrvolk: [
      'A escola ensinou uma música nova. É legal mas... quando a gente canta todo mundo junto, parece que a sala fica escura. Pode ficar escuro de música, pai?',
      'Mandaram a gente desenhar "o inimigo". Eu desenhei um quadrado vazio. A professora ficou me olhando um tempão. Depois deu nota máxima.',
      'O Dario tá esquisito. Ele conversa sozinho no quarto. Só que... pai... às vezes a outra voz responde.',
    ],
    conselho: [
      'Trocaram os livros de novo. O herói do livro velho agora é o vilão do novo. Eu perguntei qual era o de verdade. Me mandaram sentar.',
      'Eu sonhei que batiam na porta a noite inteira. E quando eu abria, era eu do lado de fora. Eu pedindo pra entrar. Qual dos dois eu era, pai?',
      'A senhora do 7 sumiu, né? Eu vi os móveis saindo. Móvel não anda sozinho. Quer dizer... antigamente não andava.',
    ],
    colapso: [
      'A escola fechou. Eu fico olhando pela janela. Tem um cachorro que atravessa a rua sempre no mesmo lugar, na mesma hora. TODO dia. Igualzinho. Cachorro de verdade faz isso?',
      'Pai, se trocarem você, eu vou perceber? — Ele não está brincando. — Eu ia perceber. Eu IA. Pelo cheiro. Você tem cheiro de carimbo.',
      'Eu não tenho mais medo do escuro. O escuro é sempre igual. Eu tenho medo das coisas que ficam iguais DEMAIS.',
    ],
    curto: ['Boa noite, pai. Deixa a porta encostada?', 'Amanhã você me conta da fila?', 'Zzz... não... o carimbo não...'],
    doente: 'Ele está deitado, pequeno demais na cama. "Pai, eu sonhei que o remédio vinha voando pela janela." Tosse. "Remédio voa?"',
  },
  dario: {
    republica: [
      '...oi. — Ele não vira. Está de frente pro canto do quarto. — Eu tava conversando. Não. Ninguém. Esquece.',
      'A escola tá um saco. Perguntaram da minha mãe de novo. A minha mãe DE VERDADE. Eu disse que não lembro do rosto dela. Mentira. Eu lembro todo dia.',
      'O amigo diz que você é dos bons, pai. Eu falei que você é só... você. Ele riu. Ele acha você engraçado.',
    ],
    mehrvolk: [
      'A escola pediu meu "certificado de ancestralidade". A diretora olhou pra minha cara e disse "você entende, não é?". EU ENTENDO. É isso que dá ser filho da mulher errada, né, pai?',
      'Me chamaram de "mistura" no pátio. O professor ouviu. O professor CONCORDOU. — Ele soca a parede de leve, ritmado. — O amigo disse pra eu não revidar. Que logo não vai mais importar.',
      'O amigo disse que essas leis não são pra pegar os de fora. São pra treinar os de dentro. Treinar a gente a apontar. Ele fala umas coisas, pai...',
    ],
    conselho: [
      'Agora dizem que raça não existe e que era tudo mentira do governo velho. Ontem eu era "mistura", hoje eu sou "camarada". Amanhã eu sou o quê? Quem decide o que eu sou?',
      'O amigo não gosta dos realocados. Ele fica quieto quando eles cozinham. É a única hora que ele fica quieto.',
      'Você nunca pergunta com quem eu falo. Todo mundo pergunta. Você não. — Pausa. — Valeu. Acho.',
    ],
    colapso: [
      'O amigo tá diferente. Antes ele contava coisas. Agora ele só... espera. Fica esperando comigo. Esperando o quê, eu não sei.',
      'Se a gente for embora, ele disse que não pode ir junto. Que ele é DAQUI. Daqui tipo... da casa? Da cidade? Ele não explica.',
      'Pai. Uma vez. Só uma. Ele errou meu nome. Me chamou pelo SEU nome. E depois pediu desculpa como quem tinha visto uma coisa que ainda não aconteceu.',
    ],
    curto: ['...boa noite. — Ele volta a olhar pro canto.', 'A gente conversa amanhã, tô no meio de uma coisa.', 'Ele diz boa noite também. Brincadeira. Vai dormir, pai.'],
    doente: 'Ele está na cama, virado pra parede. "O amigo disse que eu vou melhorar. Ele nunca erra essas coisas. Nunca."',
  },
};
const H_SPECIAL = {
  44: { vessa: 'Eu não saí de casa hoje. — Ela diz isso antes de você perguntar qualquer coisa. Ela não para de mexer a panela vazia. — Por que você está me olhando assim? EU NÃO SAÍ DE CASA HOJE.' },
  47: { tomi: 'Você usava uma caneca azul hoje, pai? Lascada? — Ele não olha pra você. — O homem do meu sonho disse "obrigado pelo carimbo duplo". Ele mandou lembrança.' },
  20: { tomi: 'A professora elogiou meu desenho de novo. O da família. Pai... eu desenhei a gente com CINCO pessoas. Nós não somos quatro mais a vovó? Quem é o quinto? Eu não lembro de desenhar o quinto.' },
  17: { mae: 'Eu rasguei o formulário. — Ela olha pra você pela primeira vez na noite. — Eu SEI quem eu sou. Escreve aí no teu posto: a Odila sabe quem é. Poucos nesse país podem dizer o mesmo.' },
  15: { dario: 'A escola não me deixou entrar hoje sem o certificado. Fiquei no portão que nem cachorro. O amigo ficou comigo o tempo todo. Ele disse: "guarda os rostos de quem fechou o portão". Eu guardei, pai. Eu guardei.' },
};

/* ---------- INFORMAÇÕES (o valor de jogo das conversas) ---------- */
function infoVessa() {
  const r = rumorForDay(S.day + 1);
  if (!r) return T('A Marta não veio hoje. Sem fofoca, sem notícia. O silêncio das amigas é a pior notícia que existe.');
  const verdade = TELLS[r.tell].altBonus > 0;
  const diz = chance(.75) ? verdade : !verdade;
  return diz
    ? `${T('Fofoca com fundamento: a Marta jurou que essa história de ')}${T(TELL_LABEL[r.tell])}${T('... é VERDADE. O cunhado dela trabalha num posto do norte e viu. Amanhã deve chegar esse boato aí na sua fronteira. Fica esperto.')}`
    : `${T('A Lena me contou: essa conversa de ')}${T(TELL_LABEL[r.tell])}${T(' é INVENÇÃO. Espalharam pra vender scanner, pra vender medo. Se aparecer no teu comunicado amanhã, pensa duas vezes antes de estragar a vida de alguém por isso.')}`;
}
function infoMae() {
  const n = SCRIPTED_NEWS[S.day + 1];
  if (n === null) return T('A moça da televisão despediu-se hoje com "até amanhã, se houver amanhã". Depois riu. Ninguém no estúdio riu junto.');
  if (n) return `${T('A televisão adiantou o jornal de amanhã, filho: "')}${T(n.h).toLowerCase()}${T('". Ou eu sonhei que adiantou. Na minha idade a televisão e o sonho passam no mesmo canal.')}`;
  return T('A televisão disse que está tudo sob controle. Foi a quarta vez que disseram essa frase hoje. Quem conta quatro vezes, não controla nada.');
}
const H_VISIONS = {
  3: 'Sonhei que um moço dormia na nossa escada abraçado num cobertor. Ele tinha frio DE DENTRO, pai. Dá pra ter frio de dentro?',
  6: 'Sonhei com dois homens de casaco comprido parados na porta. Eles não tinham prancheta de verdade. Era só pra segurar alguma coisa nas mãos.',
  10: 'Tem um bebê no meu sonho que não chora. A mãe pede água. Dá água pra ela, pai. Mesmo assim... não deixa ela entrar.',
  13: 'Sonhei com botas no corredor. Muitas. Eu contei, pai. Subiam seis. Desciam SETE.',
  19: 'Uma mão girando a maçaneta. Devagarinho. Com educação. No sonho eu sabia: quem gira assim não quer entrar. Quer saber se VOCÊ vai abrir.',
  22: 'Tem um menino que quer brincar comigo. Ele bate na porta bem baixinho, na altura do meu joelho. Ele diz que se chama Nico. Pai... eu NUNCA te contei o nome dele. Como é que eu sei o nome dele?',
  28: 'Sonhei com um homem de casaco cinza que anotava numa pasta. Ele já sabia as respostas. Ele só queria ver a sua cara enquanto você mentia.',
  32: 'Sonhei que a moça de lá do quarto pedia sal. Aí ela devolvia o pote cheio. Do MESMO jeitinho. Sal não volta sozinho, né, pai?',
  39: 'Sonhei com o seu carimbo indo embora dentro de um jornal. Ele voltava cheirando diferente. Carimbo tem saudade de casa?',
  43: 'Vai bater na porta a noite toda. Não vai ter ninguém. Aí a última batida... a última vem de dentro. Dorme com a luz acesa hoje, pai. Por mim.',
  46: 'Sonhei com a voz da vovó do lado de fora pedindo pra entrar. Mas a vovó tava dormindo aqui dentro. Pai... quem é que guarda a voz das pessoas quando elas dormem?',
};
function infoTomi() {
  if (H_VISIONS[S.day + 1] && NIGHT_EVENTS[S.day + 1]) return T('Pai, eu tive um daqueles sonhos... ') + T(H_VISIONS[S.day + 1]);
  if (H_VISIONS[S.day]) return T('Lembra do sonho que eu ia te contar? ') + T(H_VISIONS[S.day]);
  return T(pick([
    'Sonhei que a fila do seu trabalho dava volta no mundo e terminava aqui na nossa porta.',
    'Sonhei com o carimbo verde. Ele fazia as pessoas felizes. Aí eu virava o carimbo e atrás dele tinha outro carimbo.',
    'Hoje não sonhei nada, pai. O nada também conta como sonho?',
  ]));
}
function maybeAmigoAchievement() {
  if (S.flags.avisoSilente && S.flags.avisoNaoErram && S.flags.avisoWanted && S.flags.avisoNoite) unlockAchievement('ACH_AMIGO');
}
function infoDario() {
  // ACH_AMIGO: os 4 tipos de aviso concreto do amigo (silente/eleição errada na
  // lista/batida noturna/profecia do dia 46) — "parou de falar" é atmosfera, não conta.
  if ((S.silenteDays || []).includes(S.day + 1)) { S.flags.avisoSilente = true; maybeAmigoAchievement(); return T('Pai. Escuta. O amigo NUNCA usou esse tom antes. Ele disse: "amanhã vem um que não é um deles nem um de vocês. NÃO OLHE DE PERTO. NÃO CHAME NINGUÉM — nem quando a máquina implorar. Carimbe qualquer coisa, rápido, e deixe ir." Ele repetiu três vezes, pai. Ele nunca repete.'); }
  if (S.day + 1 === 46) { S.flags.avisoNaoErram = true; maybeAmigoAchievement(); return T('"A partir de agora eles não erram mais." Foi isso que ele disse. Palavra por palavra. E depois: "diz pro teu pai que não foi culpa dele. Diz ANTES."'); }
  if (S.day >= 44) return T('O amigo parou de falar. Desde ontem. Ele só senta ali no canto e espera comigo. Eu perguntei "esperar o quê". Ele olhou pra porta.');
  if (WANTED_DAYS[S.day + 1]) { S.flags.avisoWanted = true; maybeAmigoAchievement(); return T('O amigo mandou um recado pra você. Sério. Ele disse: "amanhã passa alguém com o nome errado na lista dele. Que ele leia a lista com calma antes de carimbar qualquer coisa." Eu só tô repetindo, pai. Não me olha assim.'); }
  if (NIGHT_EVENTS[S.day + 1]) { S.flags.avisoNoite = true; maybeAmigoAchievement(); return T('O amigo avisou: amanhã à noite, quando baterem — porque VÃO bater — olha primeiro. E mesmo depois de olhar... pensa se vale abrir.'); }
  return T(pick([
    'O amigo perguntou de você hoje. Pelo nome. Pai... eu nunca disse seu nome pra ele.',
    'Perguntei de onde ele vem. Ele disse "de perto". Perguntei perto de quê. Ele disse "de você".',
    'O amigo não aparece em foto. A gente tentou. Não é que ele saia borrado. É que a foto sai... sem o canto do quarto.',
  ]));
}

/* ---------- BATIDAS NA PORTA ---------- */
function scheduleKnock() {
  HOUSE.knock = null;
  const ev = NIGHT_EVENTS[S.day];
  if (ev && !S.flags['night_' + S.day]) {
    HOUSE.knock = { type: 'scripted', ev, at: 1260 + ri(0, 40), active: false, answered: false };
  } else if (S.day >= 5 && S.day <= 46 && chance(.30)) {
    const roll = rnd();
    const type = roll < .5 ? 'gov' : roll < .8 ? 'vizinho' : 'estranho';
    HOUSE.knock = { type, at: 1265 + ri(0, 55), expire: 45, active: false, answered: false };
  }
}
function knockActivate() {
  const k = HOUSE.knock;
  k.active = true;
  k.lastSfx = HOUSE.clockMin;
  sfx('knock');
}
function knockExpire() {
  const k = HOUSE.knock;
  HOUSE.knock = null;
  if (k.type === 'gov') {
    S.citTotal++;
    S.pendingNews.push({ day: S.day + 1, text: T('NOTA OFICIAL: um servidor público deixou de atender fiscalização domiciliar. A advertência consta do seu prontuário. O Estado bate uma vez.') });
    hSay('A PORTA', ['As batidas param. Passos descem a escada — devagar, sem pressa, como quem anota.',
      'De manhã você encontrará um papel colado na porta: "NOTIFICAÇÃO DE AUSÊNCIA — advertência registrada". O Estado também inspeciona quem inspeciona.']);
  } else if (k.type === 'estranho') {
    hSay('A PORTA', ['As batidas simplesmente param. Nenhum passo se afasta.', 'Você percebe que passou os últimos minutos sem piscar.']);
  } else {
    hSay('A PORTA', ['Quem quer que fosse, desistiu. Vizinhos desistem rápido, nos dias de hoje.']);
  }
}
function answerDoor() {
  const k = HOUSE.knock;
  if (!k || !k.active) {
    hSay('A PORTA', ['O olho mágico mostra o corredor do prédio, vazio. O corredor mostra o olho mágico de volta.']);
    return;
  }
  k.answered = true;
  if (k.type === 'scripted') {
    S.flags['night_' + S.day] = true;
    HOUSE.knock = null;
    housePause();
    showNight(S.day, k.ev);
    return;
  }
  HOUSE.knock = null;
  if (k.type === 'gov') {
    hSay('FISCAL DO MINISTÉRIO', [
      'Um homem de casaco cinza, prancheta na mão. "Fiscalização de rotina, inspetor. Confirmando residência, composição familiar e... disposição."',
      'Ele olha por cima do seu ombro para dentro da casa. Conta as pessoas com os olhos. Anota.',
      '"Tudo conforme. Por enquanto." Ele desce a escada sem se despedir. Você fecha a porta com as duas mãos.',
    ]);
  } else if (k.type === 'vizinho') {
    hSay('UM VIZINHO', [
      'É o velho Ansel, do 3. "Desculpa a hora. É que... vocês têm fósforo? A luz caiu no meu lado e a minha caixa acabou."',
      'Você entrega a caixa de fósforos. Ele agradece três vezes e desce contando os degraus em voz alta. Todo mundo tem seus rituais agora.',
    ]);
  } else {
    hSay('…', [
      'Não há ninguém. Há um embrulho pequeno no capacho: dentro, um botão de casaco. Do SEU casaco — você confere a manga: não falta nenhum.',
      'Você olha o botão por um longo tempo. Depois olha a manga de novo. Depois decide que não vai contar isso pra ninguém.',
    ]);
  }
}

/* ---------- DIÁLOGO (typewriter) ---------- */
const HD = { open: false, lines: [], idx: 0, typing: null, chars: 0, pendingChoices: null };
function hSay(nome, lines, choices, face) {
  try { document.exitPointerLock(); } catch (e) {}
  HD.open = true; HD.lines = lines.map(T); HD.idx = 0;
  $('hd-name').textContent = T(nome);
  $('hd-choices').innerHTML = '';
  $('house-dialog').classList.add('on');
  HD.pendingChoices = choices || null;
  const fc = $('hd-face');
  if (face && FACES[face]) {
    fc.classList.remove('off');
    const cx = fc.getContext('2d');
    cx.clearRect(0, 0, 72, 72);
    cx.drawImage(FACES[face], 0, 0);
  } else fc.classList.add('off');
  HD.pitch = { mae: 145, vessa: 185, tomi: 265, dario: 96 }[face] || 125;
  hType();
}
function hType() {
  const text = HD.lines[HD.idx];
  HD.chars = 0;
  clearInterval(HD.typing);
  $('hd-text').textContent = '';
  mumble(HD.pitch || 125, Math.min(8, Math.max(3, (text.length / 22) | 0)));
  HD.typing = setInterval(() => {
    HD.chars += 2;
    $('hd-text').textContent = text.slice(0, HD.chars);
    if (HD.chars >= text.length) { clearInterval(HD.typing); HD.typing = null; }
  }, 18);
}
function hAdvance() {
  if (!HD.open) return;
  if (HD.typing) { clearInterval(HD.typing); HD.typing = null; $('hd-text').textContent = HD.lines[HD.idx]; return; }
  HD.idx++;
  if (HD.idx < HD.lines.length) { hType(); return; }
  if (HD.pendingChoices) {
    const box = $('hd-choices');
    HD.pendingChoices.forEach(c => {
      const b = document.createElement('button');
      b.textContent = T(c.label);
      b.onclick = (e) => { e.stopPropagation(); hClose(); if (c.fn) c.fn(); };
      box.appendChild(b);
    });
    HD.pendingChoices = null;
    return;
  }
  hClose();
}
function hClose() {
  HD.open = false;
  HD.pendingChoices = null;
  clearInterval(HD.typing); HD.typing = null;
  $('house-dialog').classList.remove('on');
}

/* ---------- CONVERSAS ---------- */
function talkTo(id) {
  const ph = regimeOfDay(S.day);
  const L = H_LINES[id];
  const m = S.family[id];
  const nome = { mae: 'ODILA — sua mãe', vessa: 'VESSA — sua esposa', tomi: 'TOMI — 8 anos', dario: 'DARIO — 15 anos' }[id];
  if (!m.alive) return;
  if (m.sick) { hSay(nome, [L.doente], null, id); HOUSE.spoke[id] = true; return; }
  if (HOUSE.spoke[id]) { hSay(nome, [pick(L.curto)], null, id); return; }
  HOUSE.spoke[id] = true;
  const lines = [];
  const sp = H_SPECIAL[S.day];
  if (sp && sp[id]) lines.push(sp[id]);
  else lines.push(pick(L[ph]));
  lines.push({ mae: infoMae, vessa: infoVessa, tomi: infoTomi, dario: infoDario }[id]());
  hSay(nome, lines, null, id);
}
function interactWith(id) {
  if (id === 'guiche') {
    housePause();
    showScreen('screen-shift');
    presentMirror();
    return;
  }
  if (id === 'door') { answerDoor(); return; }
  if (id === 'retrato') {
    if (HOUSE.spoke.retrato) { hSay('O RETRATO', ['Cinco silhuetas. Como sempre. Pare de contar.']); return; }
    HOUSE.spoke.retrato = true;
    S.counters.retratoNights = (S.counters.retratoNights || 0) + 1; // ACH_CINCO: duas noites distintas
    if (S.counters.retratoNights >= 2) unlockAchievement('ACH_CINCO');
    hSay('O RETRATO DA FAMÍLIA', [
      'Cinco silhuetas atrás do vidro empoeirado: Vessa, Dario, você, sua mãe, Tomi. Cinco. A conta fecha.',
      'Você percebe que contou nos dedos. Você percebe que era a segunda vez que contava.',
      S.day >= 20 ? 'A quinta silhueta — a menorzinha, do canto — está mais clara que as outras. Sempre esteve? Fotografias desbotam do canto para o centro. É física. Deve ser física.' : 'A moldura está torta meio centímetro. Você não arruma. Arrumar seria admitir que mediu.',
    ]);
    return;
  }
  if (id === 'quartoMae') {
    if (HOUSE.spoke.quartoMae) { hSay('O QUARTO DA SUA MÃE', ['Está como você deixou. Tudo nesta casa fica como você deixou. Quase tudo.']); return; }
    HOUSE.spoke.quartoMae = true;
    if (S.day >= 43) {
      hSay('O QUARTO DA SUA MÃE', [
        'A cama está feita. Feita demais. O travesseiro não tem amassado nenhum — nem o vinco de uma cabeça, nem o calor de um corpo.',
        'Ela dorme aqui? Dormiu alguma vez? Você tenta lembrar da última vez que a viu deitada e a memória devolve só a poltrona, a TV, a luz azul.',
        'Você ajeita um travesseiro que não precisava ser ajeitado e sai sem fazer barulho. Para não acordar ninguém. Não há ninguém.',
      ], null, 'mae');
    } else if (S.day >= 17) {
      hSay('O QUARTO DA SUA MÃE', [
        'Na gaveta, embaixo das meias de lã: o formulário de ancestralidade — rasgado ao meio e colado de volta com fita, letra por letra alinhada.',
        'Foi a Vessa que colou, de madrugada. Sua mãe finge que não sabe. A fita finge que segura. Todo mundo nesta casa é muito bom em fingir.',
        'Você fecha a gaveta exatamente como estava. Isso também é um tipo de fita.',
      ], null, 'mae');
    } else {
      hSay('O QUARTO DA SUA MÃE', [
        'Cheiro de lavanda velha e naftalina. O terço no criado-mudo. E, embaixo do travesseiro, dobradas em quatro: ₴ 2 — "emergência", ela sempre diz.',
      ], [
        { label: 'PEGAR AS ₴ 2', fn: () => { S.money += 2; S.flags.maeRoubada = true; hSay('VOCÊ', ['Você pega. Emergência é um conceito flexível.', 'Ela vai perceber. Ela percebe tudo. Ela não vai dizer nada — e isso vai ser pior que qualquer coisa que ela pudesse dizer.']); } },
        { label: 'DEIXAR', fn: () => hSay('VOCÊ', ['Você deixa. Alguma coisa nesta casa ainda precisa ficar no lugar.']) },
      ], 'mae');
    }
    return;
  }
  if (id === 'hosp1') {
    if (S.day < 31) {
      hSay('QUARTO DE HÓSPEDES 1', [HOUSE.spoke.hosp1 ? 'Continua vazio. Por enquanto.' : 'Um colchão nu, uma cadeira, poeira em suspensão na luz da lâmpada. Ninguém visita mais ninguém neste país.']);
      HOUSE.spoke.hosp1 = true;
      return;
    }
    if (HOUSE.spoke.hosp1) { hSay('OS REALOCADOS', ['Eles não se viraram. Eles nunca se viram. Você já reparou que nunca viu o rosto deles?']); return; }
    HOUSE.spoke.hosp1 = true;
    if (chance(.2)) {
      S.money += 2;
      hSay('OS REALOCADOS', [
        'Os dois estão de pé, de costas, imóveis — como sempre. Sem virar, o homem estende o braço para trás: ₴ 2 dobradas entre os dedos.',
        '"Pelo incômodo", diz a mulher. A voz vem do lugar errado do quarto.',
        'Você aceita. Recusar exigiria uma conversa, e conversa exigiria que eles se virassem.',
      ]);
    } else {
      hSay('OS REALOCADOS', pick([
        ['Os dois de pé, de costas, no escuro. Não acenderam a lâmpada. "Economia", diria o Conselho. Eles não precisam, diria o seu estômago.',
         'Você fecha a porta devagar. No último centímetro de fresta, tem certeza de que um deles começou a virar a cabeça.'],
        ['O quarto cheira a nada. Comida sem cheiro, roupa sem cheiro, gente sem cheiro.',
         '"Boa noite, camarada inspetor", dizem os dois. Ao mesmo tempo. Na mesma nota.'],
        ['O pote de sal da Vessa está no parapeito. Cheio. Exatamente como estava na prateleira da cozinha. Você não pergunta como ele atravessou o corredor sozinho.'],
      ]));
    }
    return;
  }
  if (id === 'hosp2') {
    if (HOUSE.spoke.hosp2) { hSay('QUARTO DE HÓSPEDES 2', ['Você já vasculhou hoje. O quarto ganhou aquele ar ofendido dos lugares revirados.']); return; }
    HOUSE.spoke.hosp2 = true;
    const r = rnd();
    if (S.day >= 40 && r < .15) {
      S.flags.travesseiroQuente = true; unlockAchievement('ACH_QUENTE');
      hSay('QUARTO DE HÓSPEDES 2', [
        'O colchão nu, a cadeira, a poeira. Tudo no lugar. Só que o travesseiro—',
        'O travesseiro está quente.',
        'Ninguém dorme neste quarto. Ninguém NUNCA dormiu neste quarto. Você encosta a mão de novo para ter certeza e se arrepende de ter certeza.',
      ]);
    } else if (r < .35) {
      const achou = ri(1, 3);
      S.money += achou;
      hSay('QUARTO DE HÓSPEDES 2', [
        `${T('Vasculhando o armário vazio: ')}${MOEDA} ${achou}${T(' em moedas antigas, esquecidas num casaco que ninguém lembra de quem foi.')}`,
        'Dinheiro de morto ou de emigrado. Nesta economia, é tudo dinheiro.',
      ]);
    } else if (r < .43) {
      const doente = Object.keys(S.family).find(k => S.family[k].alive && S.family[k].sick);
      if (doente) {
        S.family[doente].sick = false; S.family[doente].sickDays = 0;
        hSay('QUARTO DE HÓSPEDES 2', [
          'No fundo da gaveta: um frasco de remédio LACRADO, dentro do prazo. De quem? De quando? Não importa.',
          `${T('Você o leva para ')}${S.family[doente].nome.split(' ')[0].replace(',', '')}${T('. Esta noite, a casa tosse menos.')}`,
        ]);
      } else {
        S.money += 4;
        hSay('QUARTO DE HÓSPEDES 2', ['Um frasco de remédio lacrado, esquecido na gaveta. Ninguém precisa dele agora — o farmacêutico do beco paga ₴ 4 sem perguntar de onde veio.']);
      }
    } else {
      hSay('QUARTO DE HÓSPEDES 2', ['Colchão nu. Cadeira. Poeira. O quarto que a casa mantém vazio como quem guarda um lugar à mesa para alguém que não avisou se volta.']);
    }
    return;
  }
  if (id === 'bed') {
    hSay('VOCÊ', ['Encerrar o dia?'], [
      { label: 'DORMIR', fn: () => houseSleep(false) },
      { label: 'AINDA NÃO', fn: () => {} },
    ]);
    return;
  }
  talkTo(id);
}

/* ---------- ENTRADA / SAÍDA ---------- */
/* ---------- DIA 48: você, do lado de fora do seu próprio posto ---------- */
function enterMirror48() {
  shift.running = false;
  clearInterval(shift.tickId);
  clearInterval(radioTimer);
  cancelAnimationFrame(Q.raf);
  buildSprites(); buildTextures(); buildFaces();
  CUR.map = MAP48; CUR.w = 5; CUR.h = 14;
  CUR.rooms = [{ x0: 1, y0: 1, x1: 3, y1: 12, nome: 'A PISTA DA FILA — VAZIA', tint: [62, 61, 56] }];
  ENTS = [
    { spr: 'booth', spot: 'guiche', x: 2, y: 1.55, sc: .8 },
    { spr: 'lamp', x: 2, y: 5, sc: .16, lift: .74, glowWarm: true },
    { spr: 'lamp', x: 2, y: 9, sc: .16, lift: .74, glowWarm: true },
  ];
  HOUSE.mode = 'mirror';
  HOUSE.active = true;
  HOUSE.x = 2; HOUSE.y = 11.5; HOUSE.ang = -Math.PI / 2; HOUSE.pitch = 0;
  HOUSE.lastTs = 0; HOUSE.t = 0; HOUSE.knock = null; HOUSE.spoke = {};
  HOUSE.fx = { tvOff: 0, dim: 0, shadowGone: false, count: 9 };
  $('house-clock').textContent = '—:—';
  $('house-fade').classList.remove('on');
  hClose();
  showScreen('screen-house');
  startAmbience();
  cancelAnimationFrame(HOUSE.raf);
  HOUSE.raf = requestAnimationFrame(houseLoop);
  setTimeout(() => hSay('DIA 48', [
    'Não há fila. Não há guardas. Há um vento que parou no meio do caminho, como quem esqueceu o que ia dizer.',
    'Você está do lado de fora do seu próprio posto. Do lado de quem espera. Quarenta e oito dias e você nunca tinha visto o muro deste ângulo — os risquinhos contando dias que alguém raspou na pedra.',
    'Caminhe até o guichê. Há documentos na bandeja. São os seus.',
  ]), 800);
}

function enterHouse() {
  setRegimeClass(S.day);
  buildSprites();
  buildTextures();
  buildFaces();
  buildEnts();
  HOUSE.mode = 'house';
  CUR.map = MAP; CUR.w = MAPW; CUR.h = MAPH; CUR.rooms = ROOMS;
  // horror ambiental da noite: nunca explicado, nunca repetido demais
  HOUSE.fx = { tvOff: 0, dim: 0, shadowGone: S.day >= 30 && chance(.15), count: 0 };
  HOUSE.active = true;
  HOUSE.x = 2.5; HOUSE.y = 6.0; HOUSE.ang = 0; HOUSE.pitch = 0;
  HOUSE.clockMin = 1230; HOUSE.acc = 0; HOUSE.lastTs = 0; HOUSE.t = 0;
  HOUSE.spoke = {}; HOUSE.forcedSleep = false;
  $('house-fade').classList.remove('on');
  hClose();
  scheduleKnock();
  showScreen('screen-house');
  startAmbience();
  cancelAnimationFrame(HOUSE.raf);
  HOUSE.raf = requestAnimationFrame(houseLoop);
  if (S.day === 1) setTimeout(() => hSay('SUA CASA', [
    '20:30. O apartamento cheira a sopa rala e a aquecedor velho. Estão todos aqui: sua mãe na sala, Vessa na cozinha, os meninos nos quartos.',
    'Ande com WASD ou setas. Clique na tela e mexa o mouse para olhar ao redor. Aproxime-se de alguém e aperte E para conversar — eles sabem coisas que o posto não sabe.',
    'Quando terminar, durma na sua cama, no último quarto. Amanhã tem fila.',
  ]), 900);
}
function housePause() { HOUSE.active = false; cancelAnimationFrame(HOUSE.raf); try { document.exitPointerLock(); } catch (e) {} }
function houseResume() {
  HOUSE.active = true;
  HOUSE.lastTs = 0;
  showScreen('screen-house');
  cancelAnimationFrame(HOUSE.raf);
  HOUSE.raf = requestAnimationFrame(houseLoop);
}
function houseSleep(forced) {
  housePause();
  hClose();
  $('house-fade').classList.add('on');
  if (HOUSE.knock && HOUSE.knock.active && HOUSE.knock.type === 'gov' && !HOUSE.knock.answered) knockExpireSilent();
  setTimeout(() => {
    afterNight();
    $('house-fade').classList.remove('on');
  }, 1700);
}
function knockExpireSilent() {
  S.citTotal++;
  S.pendingNews.push({ day: S.day + 1, text: T('NOTA OFICIAL: fiscalização domiciliar não atendida. Advertência registrada no prontuário do servidor.') });
  HOUSE.knock = null;
}
function houseTeleport(spot) { // depuração e testes
  const e = ENTS.find(t => t.spot === spot);
  if (!e) return;
  HOUSE.x = e.x; HOUSE.y = Math.min(e.y + 1.1, CUR.h - 1.5);
  HOUSE.ang = Math.atan2(e.y - HOUSE.y, e.x - HOUSE.x);
}

/* ---------- RELÓGIO ---------- */
function houseMinute() {
  if (HOUSE.mode === 'mirror') return; // o tempo acabou ontem
  const h = Math.floor(HOUSE.clockMin / 60) % 24, m = HOUSE.clockMin % 60;
  $('house-clock').textContent = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  const k = HOUSE.knock;
  if (k && !k.active && HOUSE.clockMin >= k.at) knockActivate();
  if (k && k.active && !k.answered) {
    if (HOUSE.clockMin - k.lastSfx >= 12) { k.lastSfx = HOUSE.clockMin; sfx('knock'); }
    if (k.expire && HOUSE.clockMin > k.at + k.expire) knockExpire();
  }
  // pequenos eventos que a casa não explica
  if (!HD.open && HOUSE.fx && HOUSE.fx.count < 2 && chance(.018)) {
    HOUSE.fx.count++;
    const pool = ['dim'];
    if (S.day >= 5) pool.push('tv');
    if (S.day >= 18) pool.push('whisper');
    if (S.day >= 43) pool.push('inknock');
    const fx = pick(pool);
    if (fx === 'tv') HOUSE.fx.tvOff = HOUSE.t + 4;         // a TV descansa. ela nunca descansa.
    else if (fx === 'dim') { HOUSE.fx.dim = HOUSE.t + 3.5; sfx('buzz'); }
    else if (fx === 'whisper') whisper();
    else if (fx === 'inknock') sfx('knock1');               // uma batida. de dentro.
  }
  if (HOUSE.clockMin >= 1440) { houseSleep(true); return; }
  if (HOUSE.clockMin >= 1410 && !HOUSE.forcedSleep) {
    HOUSE.forcedSleep = true;
    hSay('VOCÊ', ['Os olhos pesam. Quarenta e oito dias não se atravessam sem dormir.'], [
      { label: 'IR PARA A CAMA', fn: () => houseSleep(true) },
    ]);
  }
}

/* ---------- MOVIMENTO ---------- */
function tryMove(nx, ny) {
  const r = .22;
  const ok = (x, y) => CUR.map[Math.floor(y)] && CUR.map[Math.floor(y)][Math.floor(x)] === 0;
  if (ok(nx + r, HOUSE.y) && ok(nx - r, HOUSE.y)) HOUSE.x = nx;
  if (ok(HOUSE.x, ny + r) && ok(HOUSE.x, ny - r)) HOUSE.y = ny;
}
function interactTarget() {
  let best = null, bd = 1.6;
  for (const e of ENTS) {
    if (!e.spot) continue;
    const m = S.family[e.spot];
    if (m && !m.alive) continue;
    const dx = e.x - HOUSE.x, dy = e.y - HOUSE.y;
    const d = Math.hypot(dx, dy);
    if (d > bd) continue;
    const rel = Math.atan2(dy, dx) - HOUSE.ang;
    if (Math.cos(rel) < .45 && d > .6) continue; // precisa estar olhando (ou colado)
    bd = d; best = e;
  }
  return best;
}

/* ---------- LOOP + RENDER ---------- */
function houseLoop(ts) {
  if (!HOUSE.active) return;
  if (!HOUSE.lastTs) HOUSE.lastTs = ts;
  const dt = Math.min(50, ts - HOUSE.lastTs);
  HOUSE.lastTs = ts;
  HOUSE.t += dt / 1000;

  // gamepad (Steam Deck / controle): stick esq anda, stick dir olha, A interage, Start pausa
  let gpFwd = 0, gpStr = 0, gpA = false, gpStart = false;
  try {
    const gp = navigator.getGamepads && navigator.getGamepads()[0];
    if (gp) {
      const dz = (v) => Math.abs(v || 0) > .25 ? v : 0;
      gpFwd = -dz(gp.axes[1]); gpStr = dz(gp.axes[0]);
      if (!HD.open && !PAUSE.open) {
        HOUSE.ang += dz(gp.axes[2]) * dt * .0032;
        HOUSE.pitch = Math.max(-90, Math.min(90, HOUSE.pitch - dz(gp.axes[3]) * dt * .28));
      }
      gpA = !!(gp.buttons[0] && gp.buttons[0].pressed);
      gpStart = !!(gp.buttons[9] && gp.buttons[9].pressed);
    }
  } catch (e) {}
  if (gpA && !HOUSE.gpA) {
    if (HD.open) hAdvance();
    else { const t = interactTarget(); if (t) interactWith(t.spot); }
  }
  if (gpStart && !HOUSE.gpStart) togglePause();
  HOUSE.gpA = gpA; HOUSE.gpStart = gpStart;

  if (!HD.open) {
    HOUSE.acc += dt;
    while (HOUSE.acc >= 1000) { HOUSE.acc -= 1000; HOUSE.clockMin++; houseMinute(); }
    // teclas
    const K = (k) => KEYS[k];
    let fwd = 0, str = 0;
    if (K('w') || K('W') || K('ArrowUp')) fwd = 1;
    if (K('s') || K('S') || K('ArrowDown')) fwd = -1;
    if (K('a') || K('A')) str = -1;
    if (K('d') || K('D')) str = 1;
    fwd += gpFwd; str += gpStr;
    fwd = Math.max(-1, Math.min(1, fwd)); str = Math.max(-1, Math.min(1, str));
    if (K('ArrowLeft')) HOUSE.ang -= dt * .0024;
    if (K('ArrowRight')) HOUSE.ang += dt * .0024;
    HOUSE.moving = Math.abs(fwd) > .05 || Math.abs(str) > .05;
    if (HOUSE.moving) {
      const sp = dt * .0028;
      const dx = (Math.cos(HOUSE.ang) * fwd + Math.cos(HOUSE.ang + Math.PI / 2) * str) * sp;
      const dy = (Math.sin(HOUSE.ang) * fwd + Math.sin(HOUSE.ang + Math.PI / 2) * str) * sp;
      tryMove(HOUSE.x + dx, HOUSE.y + dy);
      HOUSE.bobPhase += dt * .011;
      HOUSE.stepAcc += Math.hypot(dx, dy);
      if (HOUSE.stepAcc > .55) { HOUSE.stepAcc = 0; sfx('step'); }
    }
    HOUSE.bobY = HOUSE.moving ? Math.sin(HOUSE.bobPhase) * 3 : HOUSE.bobY * .9;
  }

  renderHouse();

  // prompt + cômodo
  const room = roomAt(HOUSE.x, HOUSE.y);
  $('house-room').textContent = room ? T(room.nome) : '';
  const tgt = HD.open ? null : interactTarget();
  const prompt = $('house-prompt');
  if (tgt) {
    prompt.classList.add('on');
    prompt.textContent = tgt.spot === 'guiche' ? T('E — Deslizar seus documentos pela bandeja')
      : tgt.spot === 'door'
      ? T(HOUSE.knock && HOUSE.knock.active ? 'E — ATENDER A PORTA' : 'E — Olhar pelo olho mágico')
      : tgt.spot === 'bed' ? T('E — Dormir')
      : tgt.spot === 'retrato' ? T('E — Olhar o retrato da família')
      : tgt.spot === 'quartoMae' ? T('E — Olhar o quarto da sua mãe')
      : tgt.spot === 'hosp1' ? T(S.day >= 31 ? 'E — Os realocados' : 'E — Quarto de hóspedes vazio')
      : tgt.spot === 'hosp2' ? T('E — Vasculhar o quarto de hóspedes')
      : T('E — Falar com ') + T({ mae: 'sua mãe', vessa: 'Vessa', tomi: 'Tomi', dario: 'Dario' }[tgt.spot]);
  } else prompt.classList.remove('on');

  HOUSE.raf = requestAnimationFrame(houseLoop);
}

function renderHouse() {
  const cv = $('house-canvas');
  if (cv.width !== FP.W) { cv.width = FP.W; cv.height = FP.H; }
  const ctx = cv.getContext('2d');
  const W = FP.W, H = FP.H;
  const horizon = H / 2 + HOUSE.pitch + HOUSE.bobY;
  // teto e chão
  ctx.fillStyle = '#080807'; ctx.fillRect(0, 0, W, Math.max(0, horizon));
  const fg = ctx.createLinearGradient(0, horizon, 0, H);
  fg.addColorStop(0, '#0a0805'); fg.addColorStop(1, '#181209');
  ctx.fillStyle = fg; ctx.fillRect(0, Math.max(0, horizon), W, H);

  const zbuf = new Float32Array(W);
  const tanF = Math.tan(FP.FOV / 2);
  const pulse = HOUSE.knock && HOUSE.knock.active ? .5 + .5 * Math.sin(HOUSE.t * 6) : 0;
  const tvOn = HOUSE.t > (HOUSE.fx ? HOUSE.fx.tvOff : 0);
  const dimF = HOUSE.fx && HOUSE.t < HOUSE.fx.dim ? .42 : 1;
  const tvFlick = tvOn ? .85 + Math.random() * .3 : 0;

  for (let col = 0; col < W; col++) {
    const camX = 2 * col / W - 1;
    const rayA = HOUSE.ang + Math.atan(camX * tanF);
    const rdx = Math.cos(rayA), rdy = Math.sin(rayA);
    let mapX = Math.floor(HOUSE.x), mapY = Math.floor(HOUSE.y);
    const dDx = Math.abs(1 / (rdx || 1e-9)), dDy = Math.abs(1 / (rdy || 1e-9));
    let stepX, stepY, sideX, sideY;
    if (rdx < 0) { stepX = -1; sideX = (HOUSE.x - mapX) * dDx; } else { stepX = 1; sideX = (mapX + 1 - HOUSE.x) * dDx; }
    if (rdy < 0) { stepY = -1; sideY = (HOUSE.y - mapY) * dDy; } else { stepY = 1; sideY = (mapY + 1 - HOUSE.y) * dDy; }
    let side = 0, tile = 1, guard = 0;
    while (guard++ < 64) {
      if (sideX < sideY) { sideX += dDx; mapX += stepX; side = 0; } else { sideY += dDy; mapY += stepY; side = 1; }
      tile = (CUR.map[mapY] && CUR.map[mapY][mapX] !== undefined) ? CUR.map[mapY][mapX] : 1;
      if (tile !== 0) break;
    }
    const raw = side === 0 ? sideX - dDx : sideY - dDy;
    const dist = Math.max(.01, raw * Math.cos(rayA - HOUSE.ang));
    zbuf[col] = dist;
    const lineH = H / dist;
    const top = horizon - lineH * .5;
    // coordenada da textura no ponto exato do impacto
    let u = side === 0 ? HOUSE.y + raw * rdy : HOUSE.x + raw * rdx;
    u -= Math.floor(u);
    const tex = texAt(mapX, mapY, tile);
    ctx.drawImage(tex, Math.min(63, (u * 64) | 0), 0, 1, 64, col, top, 1, lineH);
    // escuridão por cima da textura
    const lant = .58 + .42 * Math.cos((col / W - .5) * 2.4);
    let lum = Math.min(1, 1.7 / (1 + dist * dist * .15)) * lant * dimF;
    if (side === 1) lum *= .72;
    lum = Math.max(.04, lum);
    ctx.fillStyle = `rgba(0,0,0,${(1 - lum).toFixed(3)})`;
    ctx.fillRect(col, top, 1, lineH);
    if (tile === 2 && pulse) { ctx.fillStyle = `rgba(224,150,60,${(pulse * .22).toFixed(3)})`; ctx.fillRect(col, top, 1, lineH); }
  }

  // sprites (longe → perto)
  const vis = [];
  for (const e of ENTS) {
    if (!e.spr) continue;
    if (e.spr === 'shadow' && HOUSE.fx && HOUSE.fx.shadowGone) continue; // hoje o canto está vazio. isso é pior.
    const m = e.spot ? S.family[e.spot] : null;
    if (m && !m.alive) continue;
    const dx = e.x - HOUSE.x, dy = e.y - HOUSE.y;
    const dist = Math.hypot(dx, dy);
    if (dist < .25 || dist > 18) continue;
    let rel = Math.atan2(dy, dx) - HOUSE.ang;
    while (rel > Math.PI) rel -= 2 * Math.PI;
    while (rel < -Math.PI) rel += 2 * Math.PI;
    if (Math.abs(rel) > FP.FOV * .75) continue;
    vis.push({ e, dist, rel });
  }
  vis.sort((a, b) => b.dist - a.dist);
  for (const v of vis) {
    const { e, dist, rel } = v;
    const spr = SPR[e.spr];
    const corr = dist * Math.cos(rel);
    const sh = (H / corr) * e.sc;
    const sw = sh * (spr.width / spr.height);
    const screenX = (0.5 + Math.tan(rel) / (2 * tanF)) * W;
    const wallB = horizon + (H / corr) * .5;
    const lift = e.lift || 0;
    const bottom = wallB - (H / corr) * lift;
    const top = bottom - sh;
    let lum = Math.min(1, 1.7 / (1 + corr * corr * .14)) * dimF;
    if (e.glow && tvOn) lum = Math.min(1, lum * 1.7 * tvFlick);
    ctx.filter = `brightness(${Math.max(.06, lum).toFixed(2)})`;
    if (e.alpha) ctx.globalAlpha = e.alpha;
    const x0 = Math.floor(screenX - sw / 2);
    for (let sx = 0; sx < sw; sx++) {
      const col = x0 + sx;
      if (col < 0 || col >= W) continue;
      if (corr >= zbuf[col]) continue;
      ctx.drawImage(spr, sx / sw * spr.width, 0, Math.max(1, spr.width / sw), spr.height, col, top, 1, sh);
    }
    ctx.globalAlpha = 1;
    ctx.filter = 'none';
    // brilho da TV
    if (e.glow && tvOn) {
      const gx = screenX, gy = (top + bottom) / 2;
      const gr = ctx.createRadialGradient(gx, gy, 2, gx, gy, sh * 1.4);
      gr.addColorStop(0, `rgba(120,160,190,${.10 * tvFlick})`); gr.addColorStop(1, 'rgba(120,160,190,0)');
      ctx.fillStyle = gr;
      ctx.fillRect(gx - sh * 1.4, gy - sh * 1.4, sh * 2.8, sh * 2.8);
    }
    // halo morno das lâmpadas
    if (e.glowWarm) {
      const gx = screenX, gy = (top + bottom) / 2;
      const wob = .05 + Math.sin(HOUSE.t * 9 + e.x) * .012;
      const gr = ctx.createRadialGradient(gx, gy, 1, gx, gy, sh * 2.2);
      gr.addColorStop(0, `rgba(220,190,120,${(wob * dimF).toFixed(3)})`); gr.addColorStop(1, 'rgba(220,190,120,0)');
      ctx.fillStyle = gr;
      ctx.fillRect(gx - sh * 2.2, gy - sh * 2.2, sh * 4.4, sh * 4.4);
    }
  }

  // mira
  ctx.fillStyle = 'rgba(201,180,106,.6)';
  ctx.fillRect(W / 2 - 1, H / 2 - 1, 2, 2);
}

/* ---------- INPUT ---------- */
document.addEventListener('keydown', (e) => {
  KEYS[e.key] = true;
  if (!HOUSE.active && !HD.open) return;
  if (e.key === 'e' || e.key === 'E' || e.key === 'Enter') {
    if (HD.open) { hAdvance(); return; }
    const t = interactTarget();
    if (t) interactWith(t.spot);
  }
});
document.addEventListener('keyup', (e) => { KEYS[e.key] = false; });
document.addEventListener('pointerlockchange', () => {});
document.addEventListener('mousemove', (e) => {
  if (document.pointerLockElement !== $('house-canvas')) return;
  HOUSE.ang += e.movementX * .0028;
  HOUSE.pitch = Math.max(-90, Math.min(90, HOUSE.pitch - e.movementY * .35));
});
$('house-canvas').addEventListener('click', () => {
  if (!HOUSE.active) return;
  if (HD.open) { hAdvance(); return; }
  if (document.pointerLockElement !== $('house-canvas')) {
    $('house-canvas').requestPointerLock();
    return;
  }
  const t = interactTarget();
  if (t) interactWith(t.spot);
});
$('house-dialog').addEventListener('click', (e) => { if (!e.target.closest('button')) hAdvance(); });

/* ---------- TOQUE (celular) ---------- */
document.querySelectorAll('.tc-pad button').forEach(b => {
  const k = b.dataset.tk;
  const on = (e) => { e.preventDefault(); KEYS[k] = true; };
  const off = (e) => { e.preventDefault(); KEYS[k] = false; };
  b.addEventListener('touchstart', on); b.addEventListener('touchend', off); b.addEventListener('touchcancel', off);
  b.addEventListener('mousedown', on); b.addEventListener('mouseup', off); b.addEventListener('mouseleave', off);
});
const tcE = $('tc-e');
if (tcE) tcE.addEventListener('touchstart', (e) => {
  e.preventDefault();
  if (HD.open) { hAdvance(); return; }
  const t = interactTarget();
  if (t) interactWith(t.spot);
});
/* arrastar o dedo na tela = olhar ao redor */
let lastTouch = null;
$('house-canvas').addEventListener('touchstart', (e) => { lastTouch = e.touches[0]; }, { passive: true });
$('house-canvas').addEventListener('touchmove', (e) => {
  if (!lastTouch || !HOUSE.active || HD.open) return;
  const t = e.touches[0];
  HOUSE.ang += (t.clientX - lastTouch.clientX) * .006;
  HOUSE.pitch = Math.max(-90, Math.min(90, HOUSE.pitch - (t.clientY - lastTouch.clientY) * .4));
  lastTouch = t;
}, { passive: true });
$('house-canvas').addEventListener('touchend', () => { lastTouch = null; }, { passive: true });
