/* ============================================================
   HUMANOCRACY — house.js
   20:30. Você chega em casa. PRIMEIRA PESSOA.
   Ande (WASD/setas), olhe ao redor (mouse), aproxime-se deles.
   Sala: sua mãe e a TV. Cozinha: Vessa. Quarto do Tomi: as
   visões. Quarto do Dario: o amigo no canto. E a porta.
   ============================================================ */
'use strict';

/* ---------- ESTADO ---------- */
const FP = { W: 640, H: 360, FOV: Math.PI / 3 };
let FLOORPIX = null; // pixels do assoalho, extraídos uma vez para o floor casting
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
    // criança: cabeça grande (proporção infantil) + corpo curto e atarracado.
    const headY = child ? 12 : 2;                 // sobe o busto: cabeça maior no quadro
    const bustH = child ? 78 : 77;                // busto tão alto quanto o do adulto = cabeção
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
        // sem franja cromática no rosto da família (o grão/scanline mantém o clima)
        post: { levels: 11, grain: 8, aberr: 0, scan: 0.09, sat: 0.46 },
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
  // retângulo modelado: luz no topo, sombra embaixo — dá volume ao móvel chapado
  const Rs = (ctx, x, y, w, h, c, lit = 0.16, dark = 0.34) => {
    const g = ctx.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, `rgba(255,246,220,${lit})`); g.addColorStop(0.18, 'rgba(0,0,0,0)');
    g.addColorStop(0.7, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${dark})`);
    ctx.fillStyle = c; ctx.fillRect(x, y, w, h);
    ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
  };
  // friso de luz numa aresta (top ou left)
  const edge = (ctx, x, y, w, h, side = 'top') => {
    ctx.fillStyle = 'rgba(255,246,220,.10)';
    if (side === 'top') ctx.fillRect(x, y, w, 1); else ctx.fillRect(x, y, 1, h);
  };
  const Ln = (ctx, x1, y1, x2, y2, c, w) => { ctx.strokeStyle = c; ctx.lineWidth = w || 1; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); };
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
    // pescoço + nuca (mais cheio: adulto, não pescoço de palito)
    R(x, 27, 41, 10, 8, '#8c6b4e');
    // cabeça POR TRÁS: só cabelo — fio a fio, como o motor faz. maior, para
    // não virar uma cabecinha perdida sobre o casacão.
    x.fillStyle = '#141414';
    x.beginPath(); x.ellipse(32, 30, 13, 14.5, 0, 0, 6.29); x.fill();
    for (let i = 0; i < 80; i++) {
      const t = i / 80, hx = 19 + t * 26, hy = 19 + Math.abs(Math.sin(i * 3.7)) * 4.5;
      x.strokeStyle = (i % 3) ? 'rgba(6,6,6,.7)' : 'rgba(70,70,66,.35)';
      x.lineWidth = 0.6;
      x.beginPath(); x.moveTo(hx, hy);
      x.quadraticCurveTo(hx + (t - 0.5) * 3.4, hy + 10, hx + (t - 0.5) * 6.6, hy + 19);
      x.stroke();
    }
    // orelha esquerda aparecendo — a única prova de que há um rosto do outro lado
    C(x, 19, 33, 2.4, '#8c6b4e');
    x.fillStyle = 'rgba(0,0,0,.3)'; x.beginPath(); x.ellipse(19, 33.4, 1.1, 1.6, 0, 0, 6.29); x.fill();
    // sombra no chão
    const g = x.createRadialGradient(32, 124, 2, 32, 124, 16);
    g.addColorStop(0, 'rgba(0,0,0,.5)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = g; x.beginPath(); x.ellipse(32, 124, 16, 4, 0, 0, 6.29); x.fill();
    if (window.analogPostCanvas) analogPostCanvas(x.canvas, 811004, { levels: 10, grain: 9, aberr: 0, scan: 0.1, sat: 0.42 });
  });
  SPR.sofa = mk(96, 64, (x) => {
    Rs(x, 0, 10, 14, 48, '#463b2c'); Rs(x, 82, 10, 14, 48, '#463b2c');   // braços
    Rs(x, 12, 14, 72, 18, '#4c4030', .2, .3);                            // encosto
    Rs(x, 4, 24, 88, 34, '#3d3327', .22, .38);                           // assento
    // vinco entre almofadas + costura de luz
    x.fillStyle = 'rgba(0,0,0,.3)'; x.fillRect(47, 26, 2, 30);
    edge(x, 12, 14, 72); edge(x, 4, 24, 88);
    R(x, 6, 58, 8, 6, '#221d14'); R(x, 82, 58, 8, 6, '#221d14');          // pés
  });
  SPR.tv = mk(64, 80, (x) => {
    Rs(x, 4, 2, 56, 44, '#1a1c16', .1, .4);                              // gabinete
    R(x, 6, 4, 52, 40, '#141610'); R(x, 12, 10, 40, 28, '#2c3a34');      // tela
    // brilho curvo do tubo + varredura
    const g = x.createRadialGradient(30, 20, 2, 30, 24, 26);
    g.addColorStop(0, 'rgba(120,150,140,.35)'); g.addColorStop(1, 'rgba(40,58,52,0)');
    x.fillStyle = g; x.fillRect(12, 10, 40, 28);
    R(x, 14, 12, 36, 3, '#4a5e56'); R(x, 14, 22, 36, 2, '#405248');
    C(x, 54, 14, 1.2, '#7a8a80'); C(x, 54, 20, 1.2, '#5a6a60');          // botões/knobs
    Rs(x, 27, 44, 10, 22, '#2a271d', .1, .3); R(x, 14, 66, 36, 5, '#211e16');
  });
  SPR.stove = mk(64, 80, (x) => {
    Rs(x, 6, 24, 52, 52, '#33302a', .14, .4);                            // corpo esmaltado
    R(x, 12, 32, 22, 20, '#221f19');                                     // porta do forno
    x.strokeStyle = 'rgba(255,246,220,.08)'; x.lineWidth = 1; x.strokeRect(12.5, 32.5, 21, 19);
    R(x, 15, 34, 16, 3, '#3a352b');                                      // puxador
    C(x, 18, 27, 2, '#8a734d'); C(x, 28, 27, 2, '#8a734d');              // botões
    C(x, 18, 27, 0.7, '#e8d8a0'); C(x, 28, 27, 0.7, '#e8d8a0');
    Rs(x, 36, 12, 20, 10, '#26231d', .1, .3); R(x, 38, 8, 16, 5, '#1d1a15'); // exaustor/panela
  });
  SPR.bedT = mk(96, 56, (x) => {
    Rs(x, 2, 22, 92, 24, '#3a4652', .16, .34); Rs(x, 2, 8, 12, 38, '#2e3a44', .12, .3);
    R(x, 16, 16, 24, 10, '#c9c2ab');                                     // travesseiro
    x.fillStyle = 'rgba(0,0,0,.18)'; x.fillRect(2, 34, 92, 2); x.fillRect(2, 40, 92, 1); // dobras
  });
  SPR.bedD = mk(96, 56, (x) => {
    Rs(x, 2, 24, 92, 22, '#33302a', .1, .4); Rs(x, 2, 10, 10, 36, '#2a2722', .08, .34);
    R(x, 14, 18, 22, 8, '#b5ae9c');
    x.fillStyle = 'rgba(0,0,0,.22)'; x.fillRect(2, 36, 92, 2);           // colcha amassada
  });
  SPR.bedQ = mk(112, 60, (x) => {
    Rs(x, 2, 24, 108, 28, '#4a4036', .16, .36); Rs(x, 2, 8, 14, 44, '#3a332a', .12, .3);
    R(x, 18, 16, 26, 10, '#c9c2ab'); R(x, 46, 18, 62, 10, '#55432e');    // dois travesseiros
    x.fillStyle = 'rgba(0,0,0,.18)'; x.fillRect(2, 38, 108, 2); x.fillRect(2, 44, 108, 1);
  });
  SPR.clock = mk(36, 84, (x) => {
    Rs(x, 4, 2, 28, 80, '#2c2115', .14, .4);                             // caixa de pêndulo
    x.strokeStyle = 'rgba(0,0,0,.4)'; x.lineWidth = 1; x.strokeRect(4.5, 2.5, 27, 79);
    C(x, 18, 18, 10, '#1a150e'); C(x, 18, 18, 9, '#c9c2ab');             // mostrador
    x.fillStyle = '#241f16'; for (let i = 0; i < 12; i++) { const a = i / 12 * 6.29; x.fillRect(18 + Math.cos(a) * 7.5 - .5, 18 + Math.sin(a) * 7.5 - .5, 1, 1); }
    x.strokeStyle = '#241f16'; x.lineWidth = 1.6;
    x.beginPath(); x.moveTo(18, 18); x.lineTo(18, 11); x.stroke();
    x.beginPath(); x.moveTo(18, 18); x.lineTo(23, 18); x.stroke();
    R(x, 10, 32, 16, 44, '#0f0b07'); R(x, 16, 34, 3, 30, '#8a734d'); C(x, 17.5, 66, 4, '#8a734d'); // pêndulo
    C(x, 17.5, 66, 1.4, '#e8d8a0');
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
  /* ---- móveis extras: fazem os cômodos parecerem habitados ---- */
  SPR.nightstand = mk(56, 60, (x) => {
    Rs(x, 6, 14, 44, 44, '#3a2f22', .16, .38);
    R(x, 10, 22, 36, 12, '#2c241a'); R(x, 10, 38, 36, 12, '#2c241a');   // gavetas
    C(x, 28, 28, 1.6, '#b8912e'); C(x, 28, 44, 1.6, '#b8912e');         // puxadores
    R(x, 4, 12, 48, 4, '#463a2a'); edge(x, 4, 12, 48);                  // tampo
    R(x, 10, 54, 6, 6, '#1d160f'); R(x, 40, 54, 6, 6, '#1d160f');       // pés
    R(x, 22, 5, 8, 8, '#6a6258'); C(x, 26, 4, 1.3, '#e8d8a0');          // xícara/vela
  });
  SPR.dresser = mk(72, 74, (x) => {
    Rs(x, 6, 10, 60, 60, '#3d3226', .16, .4);
    for (let r = 0; r < 3; r++) { R(x, 10, 16 + r * 18, 52, 14, '#2c241a'); C(x, 24, 23 + r * 18, 1.6, '#b8912e'); C(x, 48, 23 + r * 18, 1.6, '#b8912e'); }
    R(x, 4, 8, 64, 4, '#4a3d2c'); edge(x, 4, 8, 64);
    R(x, 10, 70, 8, 4, '#1d160f'); R(x, 54, 70, 8, 4, '#1d160f');
  });
  SPR.chair = mk(48, 84, (x) => {
    Rs(x, 12, 6, 24, 40, '#4a3a26', .14, .3);                          // encosto
    R(x, 15, 10, 4, 32, '#3a2c1c'); R(x, 29, 10, 4, 32, '#3a2c1c');    // ripas
    Rs(x, 8, 44, 32, 10, '#3d3020', .18, .3);                          // assento
    R(x, 10, 54, 4, 28, '#2c2115'); R(x, 34, 54, 4, 28, '#2c2115');    // pernas frente
    R(x, 16, 54, 3, 26, '#241a10'); R(x, 30, 54, 3, 26, '#241a10');    // pernas trás
  });
  SPR.shelf = mk(64, 100, (x) => {
    Rs(x, 4, 2, 56, 96, '#3a2f22', .12, .4);
    for (let s = 0; s < 4; s++) {
      const yy = 10 + s * 22;
      R(x, 8, yy + 18, 48, 3, '#241a10');                              // prateleira
      const cols = ['#5a2f2a', '#3d5a46', '#4a3f52', '#6b5236', '#2c4a5a'];
      let bx = 9; while (bx < 54) { const bw = 3 + (s * 7 + bx) % 4; x.fillStyle = cols[(bx + s) % 5]; x.fillRect(bx, yy + 4, bw, 14); x.fillStyle = 'rgba(255,246,220,.08)'; x.fillRect(bx, yy + 4, bw, 1); bx += bw + 1; }
    }
    R(x, 6, 96, 6, 4, '#1d160f'); R(x, 52, 96, 6, 4, '#1d160f');
  });
  SPR.plant = mk(52, 84, (x) => {
    Rs(x, 16, 58, 20, 24, '#5a4632', .2, .3);                          // vaso
    Ln(x, 26, 58, 26, 30, '#3a4a30', 2);                               // caule
    x.fillStyle = '#3f4a30';
    for (const [lx, ly, r] of [[26, 26, -0.6], [26, 30, 0.6], [26, 20, -0.2], [26, 34, 0.2], [26, 16, 0.1]]) {
      x.save(); x.translate(lx, ly); x.rotate(r); x.beginPath(); x.ellipse(0, -8, 4, 12, 0, 0, 6.29); x.fill(); x.restore();
    }
  });
  SPR.crate = mk(64, 60, (x) => {
    Rs(x, 4, 20, 34, 34, '#5a452c', .16, .34);
    x.strokeStyle = 'rgba(0,0,0,.35)'; x.lineWidth = 1; x.strokeRect(4.5, 20.5, 33, 33);
    Ln(x, 6, 37, 36, 37, 'rgba(255,246,220,.06)', 1);
    Rs(x, 34, 6, 26, 26, '#6b5236', .16, .34);
    x.strokeStyle = 'rgba(0,0,0,.35)'; x.strokeRect(34.5, 6.5, 25, 25);
  });
  SPR.coatrack = mk(40, 104, (x) => {
    R(x, 18, 8, 4, 84, '#2c2115'); R(x, 8, 90, 24, 6, '#241a10');       // haste + base
    for (const [px, py, s] of [[18, 14, -1], [22, 14, 1], [18, 22, -1], [22, 22, 1]]) Ln(x, px, py, px + s * 6, py + 4, '#3a2c1c', 2);
    x.fillStyle = '#3a4038'; x.beginPath(); x.moveTo(12, 20); x.quadraticCurveTo(8, 44, 14, 60); x.lineTo(24, 60); x.quadraticCurveTo(28, 40, 24, 20); x.closePath(); x.fill(); // casaco
  });
  SPR.counter = mk(76, 62, (x) => { // pia/bancada da cozinha
    Rs(x, 4, 18, 68, 40, '#33302a', .14, .4);                          // armário
    R(x, 10, 26, 22, 24, '#242019'); R(x, 44, 26, 22, 24, '#242019');  // portas
    x.strokeStyle = 'rgba(255,246,220,.06)'; x.strokeRect(10.5, 26.5, 21, 23); x.strokeRect(44.5, 26.5, 21, 23);
    R(x, 2, 14, 72, 5, '#454036'); edge(x, 2, 14, 72);                  // tampo esmaltado
    R(x, 28, 10, 24, 8, '#1c1e18'); x.fillStyle = '#2a2c26'; x.fillRect(29, 11, 22, 6); // cuba
    x.fillStyle = 'rgba(180,192,186,.14)'; x.fillRect(30, 12, 20, 2);   // brilho d'água
    x.strokeStyle = '#8a8f88'; x.lineWidth = 2; x.beginPath(); x.moveTo(46, 11); x.lineTo(46, 3); x.quadraticCurveTo(46, 1, 42, 1.6); x.stroke(); // torneira
    C(x, 14, 27, 1.4, '#8a734d'); C(x, 62, 27, 1.4, '#8a734d');         // puxadores
  });
  SPR.lowtable = mk(64, 46, (x) => { // mesa de centro da sala
    R(x, 4, 12, 56, 7, '#4a3a26'); edge(x, 4, 12, 56);                  // tampo
    R(x, 7, 19, 4, 22, '#2c2115'); R(x, 53, 19, 4, 22, '#2c2115');      // pernas frente
    R(x, 22, 19, 3, 22, '#241a10'); R(x, 41, 19, 3, 22, '#241a10');     // pernas fundo
    R(x, 22, 6, 15, 6, '#c9c2ab'); Ln(x, 24, 9, 35, 9, 'rgba(40,32,20,.4)', 0.6); // jornal dobrado
    C(x, 46, 9, 3, '#6a6258'); C(x, 46, 8, 1, '#e8d8a0');               // xícara
  });
  SPR.poster = mk(48, 66, (x) => { // cartaz de propaganda do regime
    R(x, 2, 2, 44, 62, '#241a10'); R(x, 5, 5, 38, 56, '#6a2a24');       // moldura + campo vermelho
    x.fillStyle = 'rgba(200,170,90,.16)'; x.save(); x.translate(24, 26); // raios
    for (let a = 0; a < 6.28; a += 0.5) { x.beginPath(); x.moveTo(0, 0); x.lineTo(Math.cos(a) * 30, Math.sin(a) * 30); x.lineTo(Math.cos(a + 0.22) * 30, Math.sin(a + 0.22) * 30); x.closePath(); x.fill(); } x.restore();
    x.fillStyle = '#d8c98a'; x.beginPath(); x.ellipse(24, 26, 10, 6, 0, 0, 6.29); x.fill();  // olho
    x.fillStyle = '#1a1510'; x.beginPath(); x.arc(24, 26, 3.4, 0, 6.29); x.fill();
    x.fillStyle = '#c9b878'; x.beginPath(); x.arc(23.4, 25.2, 1.1, 0, 6.29); x.fill();
    R(x, 8, 46, 32, 9, '#241a10'); x.fillStyle = '#c9b878'; for (let i = 0; i < 5; i++) x.fillRect(11 + i * 6, 49, 4, 2); // slogan
  });
  SPR.tapestry = mk(64, 100, (x) => { // estandarte do Ministério na sala
    R(x, 4, 2, 56, 4, '#3a2f22'); R(x, 8, 4, 48, 84, '#2e3d33');        // varão + pano
    x.strokeStyle = '#8a6a30'; x.lineWidth = 2; x.strokeRect(11, 8, 42, 76);
    x.strokeStyle = '#b8912e'; x.lineWidth = 2; x.beginPath(); x.arc(32, 42, 15, 0, 6.29); x.stroke();
    x.strokeStyle = 'rgba(184,145,46,.5)'; x.lineWidth = 1; for (let a = 0; a < 6.28; a += 0.52) { x.beginPath(); x.moveTo(32 + Math.cos(a) * 17, 42 + Math.sin(a) * 17); x.lineTo(32 + Math.cos(a) * 22, 42 + Math.sin(a) * 22); x.stroke(); }
    x.fillStyle = '#d8c98a'; x.beginPath(); x.ellipse(32, 42, 10, 6, 0, 0, 6.29); x.fill();  // olho
    x.fillStyle = '#1a1510'; x.beginPath(); x.arc(32, 42, 3.4, 0, 6.29); x.fill();
    x.fillStyle = '#8a6a30'; for (let i = 0; i < 12; i++) x.fillRect(9 + i * 4, 84, 2, 5);    // franja
  });
}

/* ---------- TEXTURAS DE PAREDE (64×64, pintadas à mão) ---------- */
const TEX = {};
function buildTextures() {
  if (TEX.corr) return;
  let _s = 20260724;
  const rnd = () => { _s = (_s * 48271) % 2147483647; return (_s - 1) / 2147483646; };
  const base = (x, c) => { x.fillStyle = c; x.fillRect(0, 0, 64, 64); };
  const board = (x, c) => { x.fillStyle = c; x.fillRect(0, 54, 64, 10); x.fillStyle = 'rgba(0,0,0,.35)'; x.fillRect(0, 53, 64, 2); };
  // grão fino de reboco
  const grain = (x, a) => { for (let i = 0; i < 360; i++) { const v = rnd() < 0.5 ? 0 : 255; x.fillStyle = `rgba(${v},${v},${v},${rnd() * a})`; x.fillRect(rnd() * 64, rnd() * 52, 1, 1); } };
  // mancha de umidade orgânica (radial irregular)
  const blot = (x, cx, cy, r, rr, gg, bb, al) => {
    const g = x.createRadialGradient(cx, cy, 1, cx, cy, r);
    g.addColorStop(0, `rgba(${rr},${gg},${bb},${al})`); g.addColorStop(0.65, `rgba(${rr},${gg},${bb},${al * 0.35})`); g.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = g; x.beginPath();
    for (let a = 0; a < 6.29; a += 0.5) { const rad = r * (0.65 + rnd() * 0.6); const px = cx + Math.cos(a) * rad, py = cy + Math.sin(a) * rad; a === 0 ? x.moveTo(px, py) : x.lineTo(px, py); }
    x.closePath(); x.fill();
    x.strokeStyle = `rgba(${rr * 0.6 | 0},${gg * 0.6 | 0},${bb * 0.6 | 0},${al * 0.5})`; x.lineWidth = 0.5; x.stroke(); // anel de tide-line
  };
  // rachadura ramificada
  const crack = (x, sx, sy, steps, ang) => {
    x.strokeStyle = 'rgba(0,0,0,.4)'; x.lineWidth = 0.6;
    const walk = (px, py, a, n) => { x.beginPath(); x.moveTo(px, py); for (let i = 0; i < n; i++) { a += (rnd() - 0.5) * 0.7; px += Math.cos(a) * 2.2; py += Math.sin(a) * 2.2; x.lineTo(px, py); if (rnd() < 0.12 && n > 4) walk(px, py, a + (rnd() < 0.5 ? 1 : -1), (n * 0.5) | 0); } x.stroke(); };
    walk(sx, sy, ang, steps);
  };
  // rodapé (wainscot) com friso e grão vertical
  const wain = (x, col) => {
    x.fillStyle = col; x.fillRect(0, 50, 64, 14);
    x.fillStyle = 'rgba(0,0,0,.4)'; x.fillRect(0, 49, 64, 1.6);
    x.fillStyle = 'rgba(255,246,220,.05)'; x.fillRect(0, 51, 64, 1);
    x.strokeStyle = 'rgba(0,0,0,.18)'; x.lineWidth = 0.6;
    for (let i = 0; i < 8; i++) { x.beginPath(); x.moveTo(i * 8 + 3, 52); x.lineTo(i * 8 + 3, 63); x.stroke(); }
  };
  // vinheta (bordas mais escuras — dá profundidade no raycast)
  const vign = (x) => { const g = x.createRadialGradient(32, 26, 8, 32, 30, 46); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.32)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); };
  // papel de parede descascando (mostra o reboco por baixo)
  const peel = (x, px, py, w, h, under) => { x.fillStyle = under; x.beginPath(); x.moveTo(px, py); x.lineTo(px + w, py - 1.5); x.lineTo(px + w - 1, py + h); x.lineTo(px + 1, py + h + 2); x.closePath(); x.fill(); x.strokeStyle = 'rgba(0,0,0,.35)'; x.lineWidth = 0.5; x.stroke(); x.strokeStyle = 'rgba(255,246,220,.08)'; x.beginPath(); x.moveTo(px, py); x.lineTo(px + w, py - 1.5); x.stroke(); };

  TEX.sala = mk(64, 64, (x) => { // papel listrado, já cansado, manchado de umidade
    base(x, '#5e5340');
    x.fillStyle = '#564b3a'; for (let i = 0; i < 8; i++) x.fillRect(i * 8, 0, 4, 52);
    x.fillStyle = 'rgba(120,100,60,.10)'; for (let i = 0; i < 8; i++) x.fillRect(i * 8 + 2, 0, 1, 52);
    blot(x, 14, 16, 18, 60, 48, 24, 0.5); blot(x, 48, 34, 14, 40, 32, 18, 0.4);
    peel(x, 40, 4, 12, 16, '#4a4133'); crack(x, 20, 8, 10, 1.4);
    grain(x, 0.1); wain(x, '#3a3021'); vign(x);
  });
  TEX.coz = mk(64, 64, (x) => { // azulejo antigo, rejunte encardido
    base(x, '#4e5844');
    for (let a = 0; a < 4; a++) for (let b = 0; b < 4; b++) { x.fillStyle = `rgba(255,255,255,${0.02 + rnd() * 0.04})`; x.fillRect(a * 16 + 1, b * 13 + 1, 14, 11); }
    x.strokeStyle = '#3a4234'; x.lineWidth = 2;
    for (let i = 0; i <= 4; i++) { x.beginPath(); x.moveTo(0, i * 13); x.lineTo(64, i * 13); x.stroke(); }
    for (let i = 0; i <= 4; i++) { x.beginPath(); x.moveTo(i * 16, 0); x.lineTo(i * 16, 52); x.stroke(); }
    // brilho especular em alguns azulejos
    for (let i = 0; i < 4; i++) { x.fillStyle = 'rgba(255,255,255,.06)'; x.fillRect((rnd() * 4 | 0) * 16 + 2, (rnd() * 4 | 0) * 13 + 2, 5, 3); }
    blot(x, 30, 40, 12, 50, 44, 26, 0.4); grain(x, 0.07); wain(x, '#33302a'); vign(x);
  });
  TEX.tomi = mk(64, 64, (x) => { // estrelinhas de papel de criança, descolando num canto
    base(x, '#46505c');
    x.fillStyle = '#525e6c';
    [[8, 10], [30, 22], [50, 8], [18, 36], [44, 40], [58, 30]].forEach(([a, b]) => { x.fillRect(a, b, 3, 3); x.fillRect(a + 1, b - 2, 1, 7); x.fillRect(a - 2, b + 1, 7, 1); });
    peel(x, 2, 6, 10, 20, '#3c434c'); blot(x, 52, 44, 10, 40, 44, 52, 0.35);
    grain(x, 0.08); wain(x, '#33302a'); vign(x);
  });
  TEX.dario = mk(64, 64, (x) => { // o papel mais velho da casa. ninguém troca. mofo.
    base(x, '#3c3c42');
    x.fillStyle = '#36363c'; for (let i = 0; i < 8; i++) x.fillRect(i * 8, 0, 4, 52);
    blot(x, 16, 14, 20, 24, 30, 22, 0.6); blot(x, 46, 26, 16, 20, 26, 20, 0.55); blot(x, 30, 44, 12, 18, 22, 18, 0.5);
    crack(x, 40, 6, 14, 1.7); crack(x, 12, 30, 10, 0.4); peel(x, 24, 4, 14, 22, '#2e2e34');
    grain(x, 0.14); wain(x, '#26262a'); vign(x);
  });
  TEX.casal = mk(64, 64, (x) => { // losangos discretos, encardidos
    base(x, '#5a4c3c');
    x.strokeStyle = 'rgba(0,0,0,.16)'; x.lineWidth = 1.4;
    for (let i = -2; i < 6; i++) { x.beginPath(); x.moveTo(i * 16, 0); x.lineTo(i * 16 + 27, 54); x.stroke(); x.beginPath(); x.moveTo(i * 16 + 27, 0); x.lineTo(i * 16, 54); x.stroke(); }
    x.fillStyle = 'rgba(180,150,90,.06)'; for (let i = -1; i < 5; i++) x.fillRect(i * 16 + 12, 12, 2, 2);
    blot(x, 44, 18, 14, 60, 48, 26, 0.4); grain(x, 0.09); wain(x, '#3a3021'); vign(x);
  });
  TEX.corr = mk(64, 64, (x) => { // reboco nu do corredor, manchado, rachado
    base(x, '#4a463c');
    blot(x, 18, 20, 16, 44, 40, 28, 0.4); blot(x, 46, 40, 14, 40, 36, 24, 0.4);
    crack(x, 30, 6, 16, 1.5); crack(x, 8, 26, 9, 0.3);
    x.fillStyle = 'rgba(0,0,0,.14)'; x.fillRect(0, 0, 64, 5); // sombra do teto
    peel(x, 50, 10, 10, 18, '#403c33');
    grain(x, 0.12); wain(x, '#302c24'); vign(x);
  });
  TEX.muro = mk(64, 64, (x) => { // o muro do posto, do lado de quem espera
    base(x, '#3e3d38');
    // blocos de concreto com juntas
    x.strokeStyle = 'rgba(0,0,0,.32)'; x.lineWidth = 1;
    x.beginPath(); x.moveTo(0, 21); x.lineTo(64, 21); x.stroke();
    x.beginPath(); x.moveTo(0, 42); x.lineTo(64, 42); x.stroke();
    x.beginPath(); x.moveTo(32, 0); x.lineTo(32, 21); x.stroke();
    x.beginPath(); x.moveTo(0, 42); x.lineTo(0, 64); x.moveTo(16, 21); x.lineTo(16, 42); x.moveTo(48, 21); x.lineTo(48, 42); x.stroke();
    // luz raspada no topo de cada bloco
    x.fillStyle = 'rgba(255,246,220,.05)'; x.fillRect(0, 22, 64, 1); x.fillRect(0, 43, 64, 1);
    blot(x, 22, 12, 15, 30, 34, 40, 0.45); blot(x, 50, 50, 14, 26, 30, 36, 0.4);
    crack(x, 40, 24, 12, 1.6); grain(x, 0.12);
    // riscos de quem contou os dias esperando
    x.strokeStyle = 'rgba(0,0,0,.45)'; x.lineWidth = 0.8;
    for (let i = 0; i < 5; i++) { x.beginPath(); x.moveTo(10 + i * 4, 28); x.lineTo(10 + i * 4, 36); x.stroke(); }
    x.beginPath(); x.moveTo(8, 36); x.lineTo(28, 28); x.stroke();
    vign(x);
  });
  TEX.door = mk(64, 64, (x) => { // a porta. madeira, almofadas, maçaneta — e o olho mágico
    base(x, '#3a2c1a');
    // veios de madeira
    x.strokeStyle = 'rgba(0,0,0,.14)'; x.lineWidth = 0.6;
    for (let i = 0; i < 10; i++) { const yy = i * 6 + rnd() * 3; x.beginPath(); x.moveTo(0, yy); x.bezierCurveTo(20, yy + (rnd() - .5) * 4, 44, yy + (rnd() - .5) * 4, 64, yy); x.stroke(); }
    x.fillStyle = 'rgba(0,0,0,.28)'; [16, 32, 48].forEach(px => x.fillRect(px, 0, 2, 64));
    // almofadas rebaixadas com chanfro
    [[8, 8, 48, 20], [8, 34, 48, 22]].forEach(([ax, ay, aw, ah]) => {
      x.fillStyle = '#241b0e'; x.fillRect(ax, ay, aw, ah);
      x.strokeStyle = 'rgba(0,0,0,.4)'; x.lineWidth = 1; x.strokeRect(ax + .5, ay + .5, aw - 1, ah - 1);
      x.strokeStyle = 'rgba(255,246,220,.06)'; x.beginPath(); x.moveTo(ax + 2, ay + ah - 2); x.lineTo(ax + 2, ay + 2); x.lineTo(ax + aw - 2, ay + 2); x.stroke();
    });
    x.fillStyle = '#8a734d'; x.fillRect(50, 29, 5, 5);
    x.fillStyle = 'rgba(255,246,220,.3)'; x.fillRect(50, 29, 2, 1);
    x.fillStyle = '#0a0908'; x.beginPath(); x.arc(32, 22, 2.6, 0, 6.29); x.fill();
    x.strokeStyle = '#8a734d'; x.lineWidth = 1; x.beginPath(); x.arc(32, 22, 3.6, 0, 6.29); x.stroke();
    vign(x);
  });
  TEX.floor = mk(64, 64, (x) => { // assoalho de madeira (usado pelo floor casting)
    base(x, '#3a2a19');
    const plankH = 16;
    for (let p = 0; p < 4; p++) {
      const y0 = p * plankH;
      x.fillStyle = `rgb(${56 + ((p * 9) % 14)},${40 + ((p * 5) % 9)},${24 + ((p * 3) % 6)})`;
      x.fillRect(0, y0, 64, plankH);
      x.strokeStyle = 'rgba(0,0,0,.16)'; x.lineWidth = 0.5;      // veios
      for (let i = 0; i < 6; i++) { const yy = y0 + 2 + i * 2.3 + Math.sin(i + p) * 0.6; x.beginPath(); x.moveTo(0, yy); x.bezierCurveTo(20, yy + Math.sin(i * 3) * 1, 44, yy - Math.sin(i * 2) * 1, 64, yy); x.stroke(); }
      for (let i = 0; i < 3; i++) { x.fillStyle = 'rgba(0,0,0,.12)'; x.fillRect(rnd() * 60, y0 + 3 + rnd() * 9, 1.4, 1.4); } // nós
      x.fillStyle = 'rgba(0,0,0,.45)'; x.fillRect(0, y0, 64, 1);         // junta entre tábuas
      x.fillStyle = 'rgba(255,240,210,.05)'; x.fillRect(0, y0 + 1, 64, 1); // brilho no topo
      x.fillStyle = 'rgba(0,0,0,.4)'; x.fillRect((p % 2 ? 20 : 44), y0, 1, plankH); // junta vertical deslocada
    }
    grain(x, 0.06);
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
    // ---- móveis: dão vida aos cômodos (não bloqueiam a passagem) ----
    { spr: 'nightstand', x: 5.6, y: 1.55, sc: .4 }, { spr: 'chair', x: 2.5, y: 2.6, sc: .46 },        // quarto do Tomi
    { spr: 'dresser', x: 8.6, y: 1.6, sc: .52 }, { spr: 'crate', x: 8.6, y: 2.6, sc: .46 },           // hóspedes 1
    { spr: 'crate', x: 14.6, y: 1.6, sc: .46 }, { spr: 'chair', x: 15.2, y: 2.6, sc: .46 },           // hóspedes 2
    { spr: 'chair', x: 22.6, y: 2.6, sc: .46 }, { spr: 'counter', x: 20.6, y: 2.6, sc: .5 },            // cozinha
    { spr: 'nightstand', x: 2.5, y: 9.5, sc: .4 }, { spr: 'dresser', x: 5.5, y: 9.5, sc: .52 },        // quarto da mãe
    { spr: 'shelf', x: 8.5, y: 9.5, sc: .78 }, { spr: 'chair', x: 8.6, y: 10.6, sc: .46 },             // quarto do Dario
    { spr: 'nightstand', x: 14.5, y: 9.5, sc: .4 }, { spr: 'dresser', x: 17.5, y: 9.5, sc: .52 },      // seu quarto
    { spr: 'plant', x: 25.7, y: 9.5, sc: .58 }, { spr: 'shelf', x: 30.6, y: 9.4, sc: .78 },            // sala
    { spr: 'lowtable', x: 28.2, y: 6.4, sc: .34 },                                                      // mesa de centro (sala)
    { spr: 'coatrack', x: 1.7, y: 5.4, sc: .72 }, { spr: 'plant', x: 23.4, y: 6.6, sc: .55 },          // corredor
    // quadros e cartazes nas paredes do corredor (montados alto, entre os vãos)
    { spr: 'poster', x: 7, y: 5.16, sc: .3, lift: .5 }, { spr: 'retrato', x: 13, y: 5.16, sc: .26, lift: .52 }, { spr: 'poster', x: 19, y: 5.16, sc: .3, lift: .5 },
    { spr: 'retrato', x: 13, y: 6.84, sc: .26, lift: .52 },
    { spr: 'tapestry', x: 28, y: 2.34, sc: .72, lift: .38 }, // estandarte do Ministério na sala
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
  const cg = ctx.createLinearGradient(0, 0, 0, Math.max(1, horizon));
  cg.addColorStop(0, '#050403'); cg.addColorStop(1, '#0d0a06');
  ctx.fillStyle = cg; ctx.fillRect(0, 0, W, Math.max(0, horizon));
  const tanF = Math.tan(FP.FOV / 2);
  const dimF0 = HOUSE.fx && HOUSE.t < HOUSE.fx.dim ? .42 : 1;
  // CHÃO por FLOOR-CASTING: assoalho de madeira com perspectiva real (o maior
  // salto visual da casa). Recai pro degradê antigo se a textura não carregou.
  const hInt = Math.max(0, Math.min(H, Math.round(horizon)));
  if (!FLOORPIX && TEX.floor) { try { FLOORPIX = TEX.floor.getContext('2d').getImageData(0, 0, 64, 64).data; } catch (e) {} }
  if (FLOORPIX && hInt < H) {
    const dirX = Math.cos(HOUSE.ang), dirY = Math.sin(HOUSE.ang);
    const planeX = -Math.sin(HOUSE.ang) * tanF, planeY = Math.cos(HOUSE.ang) * tanF;
    const rd0x = dirX - planeX, rd0y = dirY - planeY, rd1x = dirX + planeX, rd1y = dirY + planeY;
    const posZ = 0.5 * H, fld = ctx.createImageData(W, H - hInt), fd = fld.data;
    for (let y = hInt; y < H; y++) {
      const p = y - horizon, rowDist = posZ / (p < 0.5 ? 0.5 : p);
      const stepX = rowDist * (rd1x - rd0x) / W, stepY = rowDist * (rd1y - rd0y) / W;
      let fx = HOUSE.x + rowDist * rd0x, fy = HOUSE.y + rowDist * rd0y;
      let lum = Math.min(1, 2.05 / (1 + rowDist * rowDist * .11)) * dimF0;
      lum = Math.max(.07, lum) * 0.85;                 // chão um tico mais escuro que a parede
      const rowOff = (y - hInt) * W * 4;
      for (let xx = 0; xx < W; xx++) {
        const ti = ((((fy - Math.floor(fy)) * 64) | 0) * 64 + (((fx - Math.floor(fx)) * 64) | 0)) * 4;
        const L = lum * (.62 + .38 * Math.cos((xx / W - .5) * 2.4)), iL = 1 - L, di = rowOff + xx * 4;
        fd[di] = FLOORPIX[ti] * L + 6 * iL;
        fd[di + 1] = FLOORPIX[ti + 1] * L + 4 * iL;
        fd[di + 2] = FLOORPIX[ti + 2] * L + 2 * iL;
        fd[di + 3] = 255;
        fx += stepX; fy += stepY;
      }
    }
    ctx.putImageData(fld, 0, hInt);
  } else {
    const fg = ctx.createLinearGradient(0, horizon, 0, H);
    fg.addColorStop(0, '#171008'); fg.addColorStop(.5, '#20160b'); fg.addColorStop(1, '#100b06');
    ctx.fillStyle = fg; ctx.fillRect(0, Math.max(0, horizon), W, H);
  }

  const zbuf = new Float32Array(W);
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
    // escuridão por cima da textura — lanterna do jogador (foco no centro) +
    // um pouco de luz ambiente morna pra que o cômodo imediato seja legível
    const lant = .62 + .38 * Math.cos((col / W - .5) * 2.4);
    let lum = Math.min(1, 2.05 / (1 + dist * dist * .11)) * lant * dimF;
    if (side === 1) lum *= .74;
    lum = Math.max(.09, lum);
    // a sombra "morna" (não preto puro) faz o tungstênio da casa aparecer
    ctx.fillStyle = `rgba(6,4,2,${(1 - lum).toFixed(3)})`;
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

  // vinheta cinematográfica (aterra a cena, foca o centro)
  const vg = ctx.createRadialGradient(W / 2, H * .52, H * .28, W / 2, H * .52, H * .85);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, 'rgba(0,0,0,.55)');
  ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);

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
