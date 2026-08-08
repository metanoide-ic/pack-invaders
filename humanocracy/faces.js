/* ============================================================
   HUMANOCRACY — faces.js
   Motor de retratos procedurais analog-horror.

   Substitui o pipeline photobash (characters.js, descartado) e os
   retratos SVG cartunescos: cada rosto é PINTADO em canvas — crânio,
   planos de luz, órbitas, cabelo fio a fio — e depois degradado por
   uma cadeia de pós-processamento VHS (dessaturação, curva de
   contraste, aberração cromática, dithering ordenado, scanlines,
   grão, rasgos de tracking).

   Determinismo: TODO o desenho sai de um PRNG local semeado por
   f.fseed (gerado em genFeatures dentro do bloco seedado do cidadão).
   Nada aqui toca o stream global de RNG do jogo — chamar um render a
   mais ou a menos nunca muda a campanha (Modo Segunda Leitura).
   A mesma pessoa rende o MESMO rosto na foto do documento, no guichê
   e no exame; mutateFeatures copia o fseed, então a "foto divergente"
   é a mesma pessoa com atributos trocados — não um estranho.
   ============================================================ */
'use strict';

/* ---------- PRNG local (independente do game.js) ---------- */
function faceRng(seed) {
  let s = Math.abs(Math.floor(seed)) % 2147483647; if (s <= 0) s = 1;
  return function () { s = (s * 48271) % 2147483647; return (s - 1) / 2147483646; };
}
function faceSeedOf(f) {
  if (f && f.fseed) return f.fseed;
  // fallback pra features antigas sem fseed: hash estável dos campos
  let h = 2166136261 >>> 0;
  const str = [f.skin, f.hair, f.hairStyle, f.eyes, f.mouth, f.beard, f.faceW, f.sexo, f.idade].join('|');
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  return h >>> 0;
}

/* ---------- paletas (mesmos comprimentos de SKINS/HAIRC do game.js) ---------- */
/* Pele: a SOMBRA (s) puxa pro vermelho/laranja (subsurface scattering) em vez
   de só escurecer — é o que dá pele viva em vez de plástico. Bases um pouco
   menos alaranjadas, com undertones variados (rosada, oliva, dourada). */
const F_SKIN = [
  { b: [226, 193, 167], s: [160, 104, 88] },   // clara rosada
  { b: [208, 168, 132], s: [146, 96, 74] },    // clara oliva
  { b: [184, 139, 101], s: [124, 78, 58] },    // média dourada
  { b: [154, 111, 80],  s: [102, 62, 46] },    // morena
  { b: [120, 83, 60],   s: [78, 44, 34] },     // escura quente
  { b: [232, 203, 179], s: [168, 120, 104] },  // muito clara
];
/* Cabelo: tons mais ricos e distintos (o pós-VHS dessatura, então a fonte
   compensa). 0 castanho quase-preto · 1 castanho escuro · 2 castanho médio ·
   3 loiro escuro/cinza-de-rato · 4 sal-e-pimenta · 5 preto (levemente frio) ·
   6 ruivo/acaju · 7 grisalho/prata. */
const F_HAIR = [
  [42, 31, 22], [78, 54, 34], [116, 82, 48], [156, 126, 80],
  [116, 110, 102], [28, 26, 30], [128, 60, 34], [190, 187, 176],
];
/* Íris: 0 castanho · 1 âmbar-mel · 2 verde · 3 azul-cinza (escuro) ·
   4 castanho-claro (avelã) · 5 azul claro/gelo. */
const F_IRIS = [[58, 40, 26], [124, 84, 38], [64, 104, 72], [80, 100, 120], [104, 76, 46], [122, 156, 186]];

/* ---------- etnia → estrutura (sutil, com sobreposição deliberada) ----------
   Os "manuais de fenotipia" dos regimes existem NA FICÇÃO — e são
   pseudociência. Estes desvios só garantem coerência de mundo (uma
   família parece família, Baharzad não parece Kranton), com faixas que
   se SOBREPÕEM de propósito: nenhum rosto prova etnia nenhuma. O manual
   do guichê funciona exatamente como os manuais reais funcionavam: mal. */
const ETHNIC_SHAPE = {
  osano:   { nose: 0.3,  jaw: 0.4,  eyeH: 0,     lip: 0,   cheek: 0 },
  nulio:   { nose: -0.5, jaw: -0.5, eyeH: 0.25,  lip: 0,   cheek: 0 },
  mestico: { nose: 0,    jaw: 0,    eyeH: 0,     lip: 0.2, cheek: 0.2 },
  bahari:  { nose: 0.7,  jaw: 0.1,  eyeH: 0,     lip: 0.6, cheek: 0 },
  cantalo: { nose: -0.2, jaw: 0.1,  eyeH: 0.1,   lip: 0.1, cheek: 0, sardas: true },
  tarano:  { nose: 0.2,  jaw: 0.7,  eyeH: -0.35, lip: 0,   cheek: 0.8 },
};
const ETHNIC_NEUTRAL = { nose: 0, jaw: 0, eyeH: 0, lip: 0, cheek: 0 };

function toRGB(c) { if (Array.isArray(c)) return c; const n = parseInt(String(c).slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
function rgb(c, a) { return `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a == null ? 1 : a})`; }
function mix(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }
function lighten(c, t) { return mix(c, [255, 250, 238], t); }
function darken(c, t) { return mix(c, [10, 8, 6], t); }

/* ---------- geometria do rosto (tudo do PRNG + features) ---------- */
function faceLayout(f) {
  const r = faceRng(faceSeedOf(f));
  const fem = f.sexo === 'f';
  const E = ETHNIC_SHAPE[f.etnia] || ETHNIC_NEUTRAL;
  const child = f.idade != null && f.idade <= 12;                  // Tomi e afins
  const girth = Math.max(0, f.girth || 0);                        // massa corporal → cara mais cheia
  let fw = 19 + f.faceW * 2.4 + r() * 2 - (fem ? 1.6 : 0) + girth * 2.6; // meia-largura nas bochechas
  let jw = fw * (fem ? 0.78 : 0.82) + r() * 1.6 + E.jaw * 0.6 + girth * 1.4; // meia-largura do maxilar
  let chinY = 73.5 + r() * 3.5 + (f.idade > 52 ? 1.5 : 0);
  let eyeY = 47 + (r() - 0.5) * 2.4;
  const eyeDX = 10.5 + f.faceW * 0.8 + r() * 1.4;
  const eyeW = 5.05 + r() * 0.8;                      // um pouco menores
  let eyeH = 2.05 + r() * 0.6 + E.eyeH;
  let browY = eyeY - (5 + r() * 2.4) - (f.brow ? 1.2 : 0);
  const noseTip = 56.8 + r() * 2.2;                    // nariz um pouco mais curto (termina mais alto)
  let noseW = 3.9 + r() * 1.5 - (fem ? 0.6 : 0) + E.nose; // e um pouco mais estreito
  const mouthY = 64 + r() * 1.6;                       // boca mais alta: sobra espaço até o queixo
  let mouthW = 8.2 + r() * 2.2;
  if (child) { // proporções infantis: crânio grande, rosto curto, olho grande
    fw *= 0.88; jw *= 0.78; chinY -= 5.5; eyeY += 1.4; eyeH += 0.55;
    noseW *= 0.72; mouthW *= 0.82; browY += 1.4;
  }
  /* ---- estrutura do crânio (Loomis): a testa NÃO é um ovo ----
     O ponto mais largo é o zigomático (maçã do rosto), no nível dos olhos;
     a têmpora acima é mais estreita; o maxilar desce em plano quase reto
     até o ângulo gonial e daí ao queixo. Homem: mandíbula larga e angular,
     queixo chato; mulher/criança: mais estreito e afilado. */
  const cheekY = eyeY + 4.5;                       // zigomático (largura máxima)
  const templeW = fw * (fem ? 0.85 : 0.88);        // têmpora, mais estreita que a maçã
  const gonialY = eyeY + (fem ? 13.5 : 15) + (child ? -3 : 0); // ângulo do maxilar
  const jawSquare = fem ? 0.28 : (child ? 0.2 : 0.62) + (f.faceW * 0.06); // dureza do canto
  const chinW = jw * (fem ? 0.5 : child ? 0.55 : 0.62) + girth * 1.1; // meia-largura do queixo (papada alarga)
  const crownW = fw * (fem ? 0.62 : 0.66);         // largura do topo do crânio
  const ax = (r() - 0.5) * 1.6;                                    // assimetria global
  const tilt = (r() - 0.5) * 0.07;                                 // ninguém posa reto de verdade
  // ASSIMETRIA POR TRAÇO: rosto perfeitamente espelhado é a maior "cara de
  // IA". Todo rosto real tem um olho um tico mais alto, uma sobrancelha que
  // sobe mais, um canto de boca que puxa. Pequeno mas SEMPRE presente.
  const asymEye = (r() - 0.5) * 1.5;         // olho direito sobe/desce
  const asymEyeH = 1 + (r() - 0.5) * 0.16;   // e um pouco maior/menor
  const asymBrow = (r() - 0.5) * 2.0;         // sobrancelha direita mais alta/baixa
  const asymMouth = (r() - 0.5) * 1.4;        // canto direito da boca puxa
  // fator uncanny: distribuído por TODO MUNDO (humano ou não — nunca
  // existe "cara de Alternado garantida"; o mundo inteiro sai errado
  // na fita). ~12% dos rostos carregam um detalhe fora do lugar.
  const u = r();
  const uncanny = u > 0.88;
  const pupilSkew = uncanny && r() < 0.5 ? 0.7 : 0;
  const eyeApart = uncanny && r() < 0.5 ? 1.6 : 0;
  const cornerUp = uncanny && r() < 0.4 ? 0.9 : 0;
  return {
    r, fem, child, fw, jw, chinY, eyeY, eyeDX: eyeDX + eyeApart, eyeW, eyeH,
    browY, noseTip, noseW, mouthY, mouthW, ax, tilt,
    asymEye, asymEyeH, asymBrow, asymMouth,
    cheekY, templeW, gonialY, jawSquare, chinW, crownW, girth,
    uncanny, pupilSkew, cornerUp,
    lip: E.lip, cheek: E.cheek, sardas: !!E.sardas && f.skin <= 1,
    skin: F_SKIN[f.skin % F_SKIN.length], hair: F_HAIR[f.hair % F_HAIR.length],
    iris: F_IRIS[f.eyes % F_IRIS.length],
  };
}

/* ---------- traçado da cabeça (crânio estruturado, não um ovo) ----------
   Segue os marcos de Loomis: crânio → têmpora (estreita) → zigomático
   (largura máxima, nível dos olhos) → plano reto do maxilar → ângulo
   gonial → queixo. É a QUEBRA de plano nesses pontos — e não uma curva
   contínua — que faz a cabeça deixar de parecer uma bola. */
function headPath(ctx, L) {
  const cx = 50, topY = 20;
  const a = L.ax; // assimetria só do lado direito (como antes)
  const cheekY = L.cheekY, gonialY = L.gonialY, chinY = L.chinY;
  // controle do canto gonial: quanto maior jawSquare, mais baixo/anguloso o canto
  const gPull = 3 + L.jawSquare * 5;
  ctx.beginPath();
  // ---- lado esquerdo (iluminado), de baixo pra cima ----
  ctx.moveTo(cx, chinY + 2.2);
  ctx.quadraticCurveTo(cx - L.chinW, chinY + 1.4, cx - L.chinW - 0.6, chinY - 3.5); // base do queixo
  ctx.quadraticCurveTo(cx - L.jw + 0.4, gonialY + gPull, cx - L.jw, gonialY);       // sobe ao ângulo gonial
  ctx.lineTo(cx - L.fw + 0.3, cheekY);                                              // plano reto do maxilar → maçã
  ctx.quadraticCurveTo(cx - L.fw - 0.4, cheekY - 8, cx - L.templeW, topY + 13);     // maçã → têmpora
  ctx.quadraticCurveTo(cx - L.templeW - 0.2, topY + 3, cx - L.crownW, topY - 0.5);   // têmpora → topo
  ctx.quadraticCurveTo(cx - L.crownW * 0.55, topY - 1.6, cx, topY - 1.7);            // calota (mais chata)
  // ---- lado direito (sombra), de cima pra baixo ----
  ctx.quadraticCurveTo(cx + L.crownW * 0.55, topY - 1.6, cx + L.crownW + a, topY - 0.5);
  ctx.quadraticCurveTo(cx + L.templeW + 0.2 + a, topY + 4, cx + L.templeW + a, topY + 13);
  ctx.quadraticCurveTo(cx + L.fw + 0.4 + a, cheekY - 8, cx + L.fw - 0.3 + a, cheekY);
  ctx.lineTo(cx + L.jw + a, gonialY);
  ctx.quadraticCurveTo(cx + L.jw - 0.4 + a, gonialY + gPull, cx + L.chinW + 0.6 + a, chinY - 3.5);
  ctx.quadraticCurveTo(cx + L.chinW + a, chinY + 1.4, cx, chinY + 2.2);
  ctx.closePath();
}

/* mancha suave (sombra/luz aerografada).
   O blur do canvas é aplicado em px de DISPOSITIVO, não no espaço lógico
   escalado — sem multiplicar pela escala de pintura, toda a modelagem
   facial some. F_SCALE é setado por renderPortraitCanvas antes de pintar. */
let F_SCALE = 3.2;
function soft(ctx, x, y, rx, ry, color, blur) {
  ctx.save();
  // blur moderado: difuso demais dilui a alpha e o rosto vira manequim de cera
  try { ctx.filter = `blur(${((blur || 1.6) * F_SCALE * 0.55).toFixed(1)}px)`; } catch (e) {}
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, 6.29); ctx.fill();
  ctx.restore();
}

/* ---------- pintura do busto (espaço lógico 100x120) ---------- */
function paintBust(ctx, f, opts) {
  const L = faceLayout(f);
  const r = L.r, cx = 50;
  let SK = L.skin.b, SH = L.skin.s;
  opts = opts || {};
  /* ANOMALIAS de Alternado (visíveis ao vivo/exame, nunca na foto do
     documento): pele com desvio doentio (azulada/cerosa), sorriso medonho,
     dentes brancos demais, olhar morto. opts.skinShift 0..1. */
  if (opts.skinShift) {
    const tgt = opts.skinTone || [72, 116, 176];         // azul doentio, nítido
    SK = mix(SK, tgt, opts.skinShift);
    SH = mix(SH, darken(tgt, 0.4), opts.skinShift);
  }

  /* pescoço primeiro — mais estreito e cilíndrico; a gola do casaco abraça a
     base depois (o pescoço ENTRA na roupa, não fica atrás dela). */
  ctx.fillStyle = rgb(mix(SK, SH, 0.32));
  ctx.beginPath();
  ctx.moveTo(cx - 7, 62); ctx.quadraticCurveTo(cx - 8, 80, cx - 8.5, 95);
  ctx.lineTo(cx + 8.5, 95); ctx.quadraticCurveTo(cx + 8, 80, cx + 7, 62);
  ctx.closePath(); ctx.fill();
  // sombra cilíndrica nas laterais (dá volume de tubo) + sombra do queixo no pescoço
  soft(ctx, cx - 5.6, 80, 2.4, 12, rgb(darken(SH, 0.24), 0.36), 2);
  soft(ctx, cx + 5.6, 80, 2.4, 12, rgb(darken(SH, 0.34), 0.4), 2);
  soft(ctx, cx, 67, 8, 3, 'rgba(0,0,0,.28)', 2.2);
  soft(ctx, cx, 74, 4.5, 6, rgb(lighten(SK, 0.12), 0.34), 2); // realce central do pescoço (tubo)

  /* JUNTA no pescoço: a linha onde a cabeça trocada se prende ao corpo.
     Sutil ao vivo (a fita VHS embaralha), nítida no exame do PESCOÇO. */
  if (opts.neckSeam) {
    const sy = 82;
    ctx.save(); ctx.lineCap = 'round';
    // faixa de pele descolorida na altura da junta (faz a linha "aparecer" mesmo pequena)
    soft(ctx, cx, sy, 9, 2.4, rgb(mix(SH, [150, 140, 140], 0.5), 0.28), 1.4);
    ctx.strokeStyle = rgb(darken(SH, 0.55), 0.85); ctx.lineWidth = 1.2;    // sulco fundo
    ctx.beginPath(); ctx.moveTo(cx - 8.5, sy - 0.5); ctx.quadraticCurveTo(cx, sy + 1.6, cx + 8.5, sy - 1); ctx.stroke();
    ctx.strokeStyle = 'rgba(220,196,184,0.3)'; ctx.lineWidth = 0.6;        // borda de pele repuxada acima
    ctx.beginPath(); ctx.moveTo(cx - 8, sy - 1.8); ctx.quadraticCurveTo(cx, sy - 0.2, cx + 8, sy - 2.2); ctx.stroke();
    ctx.strokeStyle = rgb(darken(SH, 0.62), 0.7); ctx.lineWidth = 0.7;     // pontos de sutura (diagonais)
    for (let i = -3; i <= 3; i++) { const px = cx + i * 2.5, py = sy + 0.5 + (1 - Math.abs(i / 3)) * 1.1; ctx.beginPath(); ctx.moveTo(px - 1.3, py - 1.7); ctx.lineTo(px + 1.3, py + 1.7); ctx.stroke(); }
    ctx.restore();
  }

  /* casaco e ombros — lã pesada com trama, dobras e gola de verdade.
     Criança: ombros estreitos e caídos (senão o cabeção fica em corpo de
     adulto e a criança vira anão). */
  /* OMBROS LARGOS + DECOTE: a linha do ombro é ampla e quase reta no topo, sobe
     até a base do pescoço e ali abre um decote (gola) onde o pescoço entra —
     antes era um morro arredondado que parecia "sem ombros". */
  const coatPath = () => {
    ctx.beginPath();
    if (L.child) {
      ctx.moveTo(20, 122);
      ctx.lineTo(23, 104);
      ctx.quadraticCurveTo(26, 96, 38, 94);
      ctx.quadraticCurveTo(44, 93.2, 46, 94.6);
      ctx.quadraticCurveTo(50, 96.6, 54, 94.6);
      ctx.quadraticCurveTo(56, 93.2, 62, 94);
      ctx.quadraticCurveTo(74, 96, 77, 104);
      ctx.lineTo(80, 122); ctx.closePath();
    } else {
      ctx.moveTo(3, 122);
      ctx.lineTo(7, 100);
      ctx.quadraticCurveTo(10, 93.5, 26, 91.5);     // ombro esquerdo: largo e alto
      ctx.quadraticCurveTo(37, 90.5, 43, 92.5);     // sobe até a base do pescoço
      ctx.quadraticCurveTo(50, 95.2, 57, 92.5);     // DECOTE — a gola abraça o pescoço
      ctx.quadraticCurveTo(63, 90.5, 74, 91.5);     // base do pescoço → ombro direito
      ctx.quadraticCurveTo(90, 93.5, 93, 100);      // ombro direito: largo e alto
      ctx.lineTo(97, 122); ctx.closePath();
    }
  };
  coatPath();
  // opts.coat vence (família/casa); senão o casaco próprio da pessoa (f.coat);
  // senão o verde padrão. Assim cada cidadão tem o SEU casaco em todo contexto.
  const coatCol = opts.coat || (f.coat && !f.uniform ? (Array.isArray(f.coat) ? rgb(f.coat) : f.coat) : 'rgb(45,46,38)');
  ctx.fillStyle = coatCol;
  ctx.fill();
  ctx.save();
  coatPath(); ctx.clip();
  // luz da lâmpada no ombro esquerdo, sombra no direito
  const cg2 = ctx.createLinearGradient(14, 0, 88, 0);
  cg2.addColorStop(0, 'rgba(235,238,210,.10)');
  cg2.addColorStop(0.45, 'rgba(0,0,0,0)');
  cg2.addColorStop(1, 'rgba(0,0,0,.42)');
  ctx.fillStyle = cg2; ctx.fillRect(8, 82, 84, 42);
  // trama do tecido (fios horizontais irregulares)
  for (let i = 0; i < 150; i++) {
    const tx = 11 + r() * 78, ty = 87 + r() * 35;
    ctx.strokeStyle = r() < 0.5 ? 'rgba(0,0,0,.13)' : 'rgba(210,212,190,.05)';
    ctx.lineWidth = 0.4;
    ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(tx + 1.5 + r() * 2.5, ty + (r() - 0.5)); ctx.stroke();
  }
  // dobras dos braços
  soft(ctx, 22, 108, 3, 13, 'rgba(0,0,0,.30)', 2.2);
  soft(ctx, 78, 108, 3, 13, 'rgba(0,0,0,.38)', 2.2);
  soft(ctx, 33, 114, 2.4, 9, 'rgba(0,0,0,.22)', 2);
  if (f.uniform) {
    /* UNIFORME militar (gymnastyorka): gola alta com vivo, patas de gola com
       estrela, fileira de botões e ombreiras — o "soviético" da lore. */
    const uc = f.uniformColor || [58, 66, 48];
    const utrim = f.uniformTrim || [150, 40, 34];
    const star = (sx, sy, rad, col) => { // estrela de 5 pontas
      ctx.fillStyle = col; ctx.beginPath();
      for (let k = 0; k < 5; k++) {
        const a1 = -Math.PI / 2 + k * 2.513, a2 = a1 + 1.2566;
        ctx.lineTo(sx + Math.cos(a1) * rad, sy + Math.sin(a1) * rad);
        ctx.lineTo(sx + Math.cos(a2) * rad * 0.42, sy + Math.sin(a2) * rad * 0.42);
      }
      ctx.closePath(); ctx.fill();
    };
    // recobre o peito com a cor do uniforme (o casaco base era escuro)
    ctx.fillStyle = rgb(uc); ctx.fillRect(20, 92, 60, 32);
    const ug = ctx.createLinearGradient(20, 0, 80, 0);
    ug.addColorStop(0, 'rgba(235,238,210,.10)'); ug.addColorStop(0.5, 'rgba(0,0,0,0)'); ug.addColorStop(1, 'rgba(0,0,0,.4)');
    ctx.fillStyle = ug; ctx.fillRect(20, 92, 60, 32);
    // placket central (abotoamento lateral) + fileira de botões
    ctx.strokeStyle = rgb(darken(uc, 0.3), 0.8); ctx.lineWidth = 0.6;
    ctx.beginPath(); ctx.moveTo(46, 96); ctx.lineTo(45, 124); ctx.stroke();
    for (const by of [100, 106, 112, 118]) {
      ctx.fillStyle = rgb(lighten(uc, 0.35)); ctx.beginPath(); ctx.arc(46, by, 0.95, 0, 6.29); ctx.fill();
      ctx.fillStyle = 'rgba(0,0,0,.4)'; ctx.beginPath(); ctx.arc(46.2, by + 0.3, 0.45, 0, 6.29); ctx.fill();
    }
    // gola alta (stand collar) com vivo colorido
    ctx.fillStyle = rgb(darken(uc, 0.08));
    ctx.beginPath(); ctx.moveTo(37, 93); ctx.quadraticCurveTo(50, 88.5, 63, 93);
    ctx.lineTo(63, 98); ctx.quadraticCurveTo(50, 94, 37, 98); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = rgb(utrim, 0.95); ctx.lineWidth = 0.7;
    ctx.beginPath(); ctx.moveTo(37, 97.4); ctx.quadraticCurveTo(50, 93.4, 63, 97.4); ctx.stroke();
    // patas de gola com estrela
    for (const s of [-1, 1]) {
      const tx = 50 + s * 8.5;
      ctx.save(); ctx.translate(tx, 94.2); ctx.rotate(s * 0.12);
      ctx.fillStyle = rgb(utrim); ctx.fillRect(-3.2, -1.7, 6.4, 3.4);
      ctx.strokeStyle = 'rgba(240,230,200,.5)'; ctx.lineWidth = 0.3; ctx.strokeRect(-3.2, -1.7, 6.4, 3.4);
      ctx.restore();
      star(tx, 94.2, 1.5, 'rgba(244,232,180,.95)');
    }
    // ombreiras (shoulder boards) com vivo e pip
    for (const s of [-1, 1]) {
      const ox = 50 + s * 21;
      ctx.save(); ctx.translate(ox, 90.5); ctx.rotate(s * 0.22);
      ctx.fillStyle = rgb(utrim); ctx.fillRect(-4, -2.2, 8, 4.4);
      ctx.strokeStyle = 'rgba(240,220,150,.7)'; ctx.lineWidth = 0.35; ctx.strokeRect(-4, -2.2, 8, 4.4);
      ctx.fillStyle = 'rgba(244,228,150,.9)'; ctx.beginPath(); ctx.arc(0, 0, 0.7, 0, 6.29); ctx.fill();
      ctx.restore();
    }
    // emblema do PAÍS no peito (o selo nacional em disco de metal)
    if (f.seal) {
      ctx.fillStyle = rgb(darken(utrim, 0.2)); ctx.beginPath(); ctx.arc(60, 106, 3.4, 0, 6.29); ctx.fill();
      ctx.strokeStyle = 'rgba(244,228,150,.7)'; ctx.lineWidth = 0.4; ctx.stroke();
      ctx.fillStyle = 'rgba(246,236,196,.95)';
      ctx.font = '4.4px "VT323", monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(f.seal, 60, 106.3);
    }
  } else {
    // camisa em V aparecendo sob a gola + fileira de botões
    ctx.fillStyle = 'rgb(150,142,118)';
    ctx.beginPath(); ctx.moveTo(45.5, 95); ctx.lineTo(54.5, 95); ctx.lineTo(51.5, 122); ctx.lineTo(48.5, 122); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(44,38,26,.42)';   // vão discreto entre as pregas da camisa (sutil: não pode virar barra preta no pescoço)
    ctx.beginPath(); ctx.moveTo(48.8, 100); ctx.lineTo(51.2, 100); ctx.lineTo(50.5, 118); ctx.lineTo(49.5, 118); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(70,62,44,.9)';
    for (const by of [104, 112, 120]) { ctx.beginPath(); ctx.arc(50, by, 0.85, 0, 6.29); ctx.fill(); }
    // gola do casaco: duas abas emoldurando o pescoço, encontrando no decote
    ctx.fillStyle = 'rgba(0,0,0,.24)';
    ctx.beginPath(); ctx.moveTo(41, 92.6); ctx.lineTo(50, 96.4); ctx.lineTo(45, 101); ctx.lineTo(36.5, 94.6); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(59, 92.6); ctx.lineTo(50, 96.4); ctx.lineTo(55, 101); ctx.lineTo(63.5, 94.6); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(255,246,220,.18)'; ctx.lineWidth = 1; ctx.lineJoin = 'round';  // aresta de luz na dobra
    ctx.beginPath(); ctx.moveTo(36.5, 94.4); ctx.lineTo(41, 92.7); ctx.lineTo(49.6, 96.2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(63.5, 94.4); ctx.lineTo(59, 92.7); ctx.lineTo(50.4, 96.2); ctx.stroke();
    // cachecol de lã ocasional (civil, no frio) — enrolado no pescoço
    if (f.scarf) {
      const sc = toRGB(f.scarf);
      // volta principal (mais grossa e mais clara pra ler bem)
      ctx.fillStyle = rgb(sc);
      ctx.beginPath(); ctx.moveTo(35, 88); ctx.quadraticCurveTo(50, 95, 65, 88);
      ctx.lineTo(65, 96); ctx.quadraticCurveTo(50, 103, 35, 96); ctx.closePath(); ctx.fill();
      // luz/sombra na lã
      ctx.fillStyle = rgb(lighten(sc, 0.22), 0.5); ctx.beginPath(); ctx.moveTo(35, 89); ctx.quadraticCurveTo(46, 94, 50, 94.5); ctx.lineTo(50, 91); ctx.quadraticCurveTo(44, 90.5, 35, 88.5); ctx.closePath(); ctx.fill();
      ctx.fillStyle = rgb(darken(sc, 0.28), 0.5); ctx.beginPath(); ctx.moveTo(65, 89); ctx.quadraticCurveTo(56, 94, 50, 94.5); ctx.lineTo(50, 91); ctx.quadraticCurveTo(58, 90.5, 65, 88.5); ctx.closePath(); ctx.fill();
      // ponta pendurada
      ctx.fillStyle = rgb(darken(sc, 0.1)); ctx.fillRect(44, 95, 6, 16);
      ctx.fillStyle = rgb(lighten(sc, 0.15), 0.5); ctx.fillRect(44.5, 95, 2, 16);
      // trama tricô
      ctx.strokeStyle = rgb(darken(sc, 0.3), 0.5); ctx.lineWidth = 0.35;
      for (let i = 0; i < 6; i++) { const yy = 89 + i * 1.3; ctx.beginPath(); ctx.moveTo(36, yy); ctx.lineTo(64, yy); ctx.stroke(); }
      for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(44.5, 96 + i * 3.2); ctx.lineTo(49.5, 96 + i * 3.2); ctx.stroke(); }
    }
  }
  ctx.restore();
  // papada: segunda dobra de sombra + rolo de carne sob o queixo (pesados)
  if (L.girth > 0.32) {
    const gg = Math.min(L.girth, 0.8);
    soft(ctx, 50, L.chinY + 2.5, L.chinW + 2 + gg * 3, 2 + gg * 2, rgb(mix(SK, SH, 0.55), 0.5), 2.2);
    soft(ctx, 50, L.chinY + 4.5 + gg * 2, L.chinW + gg * 2, 1.4 + gg * 1.5, 'rgba(0,0,0,.28)', 2);
    soft(ctx, 50, L.chinY + 1, L.chinW * 0.8, 1.2, rgb(lighten(SK, 0.14), 0.4), 1.4); // brilho no topo do rolo
  }
  // sombra da cabeça caindo no colarinho (mais estreita, sob o pescoço)
  soft(ctx, 50, 92, 7, 2.2, 'rgba(0,0,0,.22)', 2.2);
  // luz de recorte nos ombros (separa o casaco preto do fundo preto):
  // ombro esquerdo pega a key (morna), ombro direito pega o rim (frio).
  ctx.lineCap = 'round';
  ctx.strokeStyle = 'rgba(226,220,190,.36)'; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(7, 105); ctx.quadraticCurveTo(12, 94, 28, 91.4); ctx.quadraticCurveTo(38, 90.5, 44, 92); ctx.stroke();
  ctx.strokeStyle = 'rgba(150,178,214,.32)'; ctx.lineWidth = 1.1;
  ctx.beginPath(); ctx.moveTo(93, 105); ctx.quadraticCurveTo(88, 94, 72, 91.4); ctx.quadraticCurveTo(62, 90.5, 56, 92); ctx.stroke();

  /* BRAÇOS PENDENTES (reais, não cruzados): um de cada lado, descendo do ombro
     ao longo do tronco e terminando numa MÃO visível na base. Separados do
     tronco por uma cava (sombra) e com aresta de luz na frente. Some só no bebê
     de colo (lá os braços já embalam o cobertor). */
  if (!opts.companion) {
    const kid = L.child;
    const aTop = kid ? 99 : 96, aBot = kid ? 120 : 122;   // braço desce até a borda do busto (recortado pelo quadro)
    for (const s of [-1, 1]) {
      const shX = 50 + s * (kid ? 19 : 27);   // topo da manga (no ombro)
      const wrX = 50 + s * (kid ? 17 : 24);   // punho (quase reto pra baixo)
      const wO = kid ? 5 : 6.5, wI = kid ? 3.6 : 5;   // largura externa/interna da manga
      const midY = (aTop + aBot) / 2;
      ctx.save(); ctx.lineJoin = 'round';
      const sleevePath = () => {
        ctx.beginPath();
        ctx.moveTo(shX + s * wO, aTop);
        ctx.quadraticCurveTo(shX + s * (wO + 1), midY, wrX + s * wI, aBot);
        ctx.lineTo(wrX - s * wI, aBot);
        ctx.quadraticCurveTo(shX - s * (wI + 0.5), midY, shX - s * wI, aTop);
        ctx.closePath();
      };
      // manga na cor do casaco, mas ESCURECIDA — assim o braço lê como volume
      // próprio, separado do tronco (antes era a mesma cor e sumia, só a mão
      // aparecia como um borrão solto na base).
      ctx.fillStyle = f.uniform ? rgb(f.uniformColor || [58, 66, 48]) : coatCol;
      sleevePath(); ctx.fill();
      ctx.fillStyle = 'rgba(0,0,0,.26)'; sleevePath(); ctx.fill();
      // cava funda separando o braço do tronco (lado interno)
      ctx.lineCap = 'round'; ctx.strokeStyle = 'rgba(0,0,0,.5)'; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(shX - s * wI, aTop + 1); ctx.quadraticCurveTo(shX - s * wI, midY, wrX - s * (wI - 0.6), aBot - 1); ctx.stroke();
      // aresta de luz na frente do braço (define o tubo)
      ctx.strokeStyle = 'rgba(240,240,218,.16)'; ctx.lineWidth = 1.1;
      ctx.beginPath(); ctx.moveTo(shX + s * (wO - 0.8), aTop + 2); ctx.quadraticCurveTo(shX + s * (wO + 0.3), midY, wrX + s * (wI - 0.7), aBot - 2); ctx.stroke();
      // fecho arredondado na base da manga (o punho) — sem MÃO de pele: num
      // busto peito-para-cima a mão cai bem na borda do quadro e vira um borrão
      // solto. Os braços pendentes já entregam os "membros"; a mão aparece de
      // corpo inteiro só no exame (paintHandScene).
      ctx.lineCap = 'round'; ctx.strokeStyle = 'rgba(0,0,0,.4)'; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(wrX - s * (wI - 0.4), aBot - 2.4); ctx.lineTo(wrX + s * (wI - 0.4), aBot - 2.4); ctx.stroke();
      ctx.restore();
    }
  }

  /* a cabeça inteira levemente inclinada — mugshot de verdade nunca é reto */
  ctx.save();
  ctx.translate(50, 62); ctx.rotate(L.tilt); ctx.translate(-50, -62);

  /* orelhas (por trás da cabeça) — menores, coladas, com sombra de contato
     atrás para não "saltarem" rosadas do crânio */
  const earY = L.eyeY + 4;
  for (const s of [-1, 1]) {
    const ex0 = cx + s * (L.fw - 0.3) + (s > 0 ? L.ax : 0);
    soft(ctx, ex0 + s * 1.4, earY + 0.5, 1.6, 3.2, 'rgba(0,0,0,.28)', 1.4); // sombra de contato atrás
    ctx.fillStyle = rgb(mix(SK, SH, 0.35));
    ctx.beginPath(); ctx.ellipse(ex0, earY, 2, 3.4, s * 0.12, 0, 6.29); ctx.fill();
    // hélix (borda) pega luz de leve no lado da lâmpada; concha em sombra
    soft(ctx, ex0 - s * 0.6, earY - 0.3, 0.7, 2.4, rgb(s < 0 ? lighten(SK, 0.15) : darken(SH, 0.05), 0.4), 0.7);
    soft(ctx, ex0 + s * 0.5, earY + 0.4, 0.9, 1.8, rgb(darken(SH, 0.3), 0.55), 0.7); // interior (concha)
    // TRANSLUCIDEZ (subsurface): a cartilagem fina da orelha deixa a luz
    // atravessar e acende vermelho-quente na borda superior. Renders de IA
    // esquecem disso — orelha vira plástico opaco. Mais forte no lado da luz.
    soft(ctx, ex0 - s * 0.3, earY - 1.4, 1.2, 1.8, rgb(mix(SK, [206, 92, 74], 0.6), s < 0 ? 0.34 : 0.16), 0.9);
  }

  /* cabeça: base + modelagem clipada */
  headPath(ctx, L);
  ctx.fillStyle = rgb(SK); ctx.fill();

  ctx.save();
  headPath(ctx, L); ctx.clip();

  // gradiente vertical geral (queixo mais escuro)
  const gv = ctx.createLinearGradient(0, 20, 0, L.chinY + 3);
  gv.addColorStop(0, 'rgba(0,0,0,0)'); gv.addColorStop(1, rgb(darken(SH, 0.1), 0.38));
  ctx.fillStyle = gv; ctx.fillRect(0, 0, 100, 120);

  // CHIAROSCURO lateral: a lâmpada vem da esquerda; o lado direito do
  // rosto cai em sombra franca — é isso que faz a foto parecer foto.
  // O TERMINADOR (transição) leva um toque quente, e a borda extrema da
  // sombra recebe LUZ REFLETIDA fria (bounce) — é o que faz a forma "virar"
  // em vez de parecer cera chapada.
  const chiar = ctx.createLinearGradient(cx - L.fw, 0, cx + L.fw + L.ax, 0);
  chiar.addColorStop(0, 'rgba(255,242,214,.15)');
  chiar.addColorStop(0.4, 'rgba(0,0,0,0)');
  chiar.addColorStop(0.58, rgb(mix(SH, [150, 70, 40], 0.35), 0.14)); // terminador quente
  chiar.addColorStop(0.74, rgb(darken(SH, 0.08), 0.3));
  chiar.addColorStop(0.93, rgb(darken(SH, 0.18), 0.56));           // núcleo da sombra (menos fundo)
  chiar.addColorStop(1, rgb(mix(SH, [90, 96, 120], 0.5), 0.32));   // bounce frio na borda
  ctx.fillStyle = chiar; ctx.fillRect(0, 0, 100, 120);
  // FILL LIGHT ambiente: o lado da sombra recebe um respiro de luz (a sala
  // não é um vazio) — nenhum plano cai a preto puro, e peles mais escuras
  // param de sumir no fundo.
  const fillg = ctx.createLinearGradient(cx + L.fw + L.ax, 0, cx - L.fw * 0.1, 0);
  fillg.addColorStop(0, rgb(lighten(SK, 0.12), 0.18));
  fillg.addColorStop(0.65, 'rgba(0,0,0,0)');
  ctx.fillStyle = fillg; ctx.fillRect(0, 0, 100, 120);

  /* SIDE PLANES do maxilar (mais duros que antes: um plano, não um borrão).
     Do zigomático até o ângulo gonial, no lado da sombra bem mais fundo. */
  soft(ctx, cx - L.fw + 2, (L.cheekY + L.gonialY) / 2, 4.5, (L.gonialY - L.cheekY) / 2 + 5, rgb(SH, 0.4), 1.4);
  soft(ctx, cx + L.fw - 2 + L.ax, (L.cheekY + L.gonialY) / 2, 5.5, (L.gonialY - L.cheekY) / 2 + 6, rgb(darken(SH, 0.14), 0.72), 1.4);
  // têmporas (recuo acima do zigomático)
  soft(ctx, cx - L.templeW + 2.5, L.browY - 1, 3, 5.5, rgb(SH, 0.4), 1.4);
  soft(ctx, cx + L.templeW - 2.5 + L.ax, L.browY - 1, 3.4, 5.5, rgb(darken(SH, 0.1), 0.55), 1.4);

  // luz principal: lâmpada acima-esquerda, contida (não lava o lado sombrio)
  const key = ctx.createRadialGradient(cx - 9, 33, 3, cx - 9, 38, 32);
  key.addColorStop(0, 'rgba(255,244,216,.42)'); key.addColorStop(0.5, 'rgba(255,244,216,.13)');
  key.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = key; ctx.fillRect(0, 0, 100, 120);

  /* CRÂNIO COMO ESFERA — sem isto, testa/calva viram um domo pálido chapado
     (o pior tell de "cabeça de ovo"). A calota é uma bola: escurece no topo
     e desce nas laterais altas; a testa pega um highlight CURVO, deslocado
     para o lado da luz, não uma faixa reta. */
  const crownTop = 22;
  // sombra de contorno do alto do crânio (a bola some pra cima)
  soft(ctx, cx + 1, crownTop + 1, L.crownW * 1.15, 3.5, rgb(darken(SH, 0.05), 0.32), 2.6);
  // laterais altas do crânio (acima da têmpora) caindo em sombra
  soft(ctx, cx - L.templeW + 1, L.browY - 5, 3, 7, rgb(SH, 0.34), 2);
  soft(ctx, cx + L.templeW - 1 + L.ax, L.browY - 5, 3.4, 7.5, rgb(darken(SH, 0.12), 0.5), 2);
  // highlight curvo da testa/calota (lado da luz), some para os cantos
  soft(ctx, cx - 6, 30, 8.5, 7, 'rgba(255,246,222,.26)', 2.4);
  soft(ctx, cx - 4, 24, 6, 4, 'rgba(255,248,226,.20)', 2.2);
  // reflexo especular pequeno no alto (pele/couro pega a lâmpada)
  soft(ctx, cx - 5, 26, 2.6, 1.6, 'rgba(255,250,232,.28)', 1.4);

  /* MAÇÃS DO ROSTO: highlight no zigomático + a concavidade DIAGONAL logo
     abaixo (a sombra que dá estrutura de bochecha, não bola de gude). */
  for (const s of [-1, 1]) {
    const zx = cx + s * (L.fw - 4) + (s > 0 ? L.ax : 0);
    // highlight na crista da maçã (mais forte do lado da luz)
    soft(ctx, zx, L.cheekY - 0.5, 3.6, 2.6, rgb(lighten(SK, 0.24), s < 0 ? 0.4 : 0.18), 1.6);
    // rubor quente na maçã: sangue sob a pele. É o que separa pele viva de
    // massa de cera — sutil, mais forte do lado da luz.
    soft(ctx, zx + s * 0.4, L.cheekY + 1.2, 3.2, 2.4, rgb(mix(SK, [208, 116, 102], 0.5), s < 0 ? 0.2 : 0.13), 2);
    // hollow diagonal descendo para o canto da boca
    const hx = cx + s * (L.fw - 5.5), hy = L.cheekY + 4.5;
    soft(ctx, hx - s * 1, hy, 3.2, 4.2, rgb(darken(SH, 0.06), s < 0 ? 0.28 : 0.42), 2.2);
  }
  // BROW RIDGE: sombra fina sob a arcada, jogada para dentro das órbitas
  soft(ctx, cx - L.eyeDX, L.browY + 2.4, 5, 1.6, rgb(darken(SH, 0.12), 0.4), 1.4);
  soft(ctx, cx + L.eyeDX + L.ax * 0.5, L.browY + 2.4, 5, 1.7, rgb(darken(SH, 0.2), 0.5), 1.4);

  // órbitas
  soft(ctx, cx - L.eyeDX, L.eyeY - 0.6, 7, 4.4, rgb(darken(SH, 0.16), 0.55), 1.9);
  soft(ctx, cx + L.eyeDX + L.ax * 0.5, L.eyeY - 0.6, 7, 4.4, rgb(darken(SH, 0.16), 0.6), 1.9);

  /* NARIZ como FORMA (não uma mancha vertical): dorso estreito com highlight
     no lado da luz e sombra dura no lado oposto; a BOLA da ponta com brilho
     redondo e a base voltada pra baixo em sombra; asas (alae) com vinco;
     narinas como aberturas tucked POR BAIXO; e a sombra projetada. O
     contraste se concentra na ponta — é isso que encurta o nariz "longo". */
  const nTip = L.noseTip, nTop = L.browY + 4, nw = L.noseW, nMidY = (nTop + nTip) / 2;
  // dorso: fio de luz no topo (lado esquerdo) + faixa de sombra no lado direito
  soft(ctx, cx - 0.9, nMidY - 1, 1.1, (nTip - nTop) / 2, rgb(lighten(SK, 0.26), 0.5), 0.9);
  soft(ctx, cx + 1.9, nMidY, 1.5, (nTip - nTop) / 2 + 1, rgb(darken(SH, 0.14), 0.55), 1.0);
  // raiz do nariz (entre as sobrancelhas), sombra suave
  soft(ctx, cx + 0.6, nTop, 1.6, 1.6, rgb(darken(SH, 0.08), 0.32), 1.2);
  // a BOLA da ponta: highlight redondo + base em sombra (o nariz "vira")
  soft(ctx, cx, nTip, 2, 1.5, rgb(mix(SK, [208, 116, 102], 0.5), 0.12), 1.2); // calor na ponta do nariz
  soft(ctx, cx - 0.7, nTip - 1.1, 2.2, 1.9, rgb(lighten(SK, 0.34), 0.6), 1.0);
  soft(ctx, cx + 0.3, nTip + 1.9, 2.6, 1.3, rgb(darken(SH, 0.26), 0.6), 1.1); // base (underside)
  // asas + narinas
  for (const s of [-1, 1]) {
    const axx = cx + s * (nw * 0.82) + (s > 0 ? L.ax * 0.3 : 0);
    soft(ctx, axx, nTip - 0.2, 1.5, 1.7, rgb(s < 0 ? lighten(SK, 0.08) : darken(SH, 0.08), s < 0 ? 0.3 : 0.5), 0.9); // corpo da asa
    soft(ctx, axx + s * 1.2, nTip - 0.5, 0.8, 1.6, rgb(darken(SH, 0.2), s < 0 ? 0.4 : 0.55), 0.7);                  // vinco alar
    ctx.fillStyle = rgb(darken(SH, 0.5), 0.82);                                                                     // narina
    ctx.beginPath(); ctx.ellipse(cx + s * (nw * 0.48), nTip + 1.15, 0.85, 0.62, s * 0.4, 0, 6.29); ctx.fill();
    // asa fina também translúcida: um calor rosado na borda da narina
    soft(ctx, axx + s * 0.4, nTip + 0.6, 0.9, 1.0, rgb(mix(SK, [200, 96, 82], 0.5), 0.2), 0.7);
  }
  // sombra projetada do nariz (lâmpada à esquerda → direita e pra baixo)
  ctx.save();
  try { ctx.filter = `blur(${(0.8 * F_SCALE * 0.55).toFixed(1)}px)`; } catch (e) {}
  ctx.fillStyle = rgb(darken(SH, 0.24), 0.5);
  ctx.beginPath(); ctx.ellipse(cx + nw * 0.7, nTip + 2.5, 3.2, 1.5, 0.32, 0, 6.29); ctx.fill();
  ctx.restore();

  // bochechas / encovado de quem come pouco
  const hollow = f.idade > 46 || r() < 0.35;
  if (hollow) {
    soft(ctx, cx - L.fw + 6, 62, 4, 7, rgb(SH, 0.30), 2.6);
    soft(ctx, cx + L.fw - 6 + L.ax, 62, 4, 7, rgb(SH, 0.34), 2.6);
  }
  soft(ctx, cx - L.fw + 5, 55, 3.4, 2, 'rgba(255,244,222,.14)', 2);
  soft(ctx, cx + L.fw - 5 + L.ax, 55, 3.4, 2, 'rgba(255,244,222,.10)', 2);
  // maçãs do rosto altas (estrutura por etnia — sutil, some no VHS de longe)
  if (L.cheek) {
    soft(ctx, cx - L.fw + 4.5, 52.5, 3.6, 2.2, rgb(lighten(SK, 0.3), 0.22 * L.cheek), 1.8);
    soft(ctx, cx + L.fw - 4.5 + L.ax, 52.5, 3.6, 2.2, rgb(lighten(SK, 0.22), 0.14 * L.cheek), 1.8);
    soft(ctx, cx - L.fw + 5.5, 57.5, 3.4, 2.4, rgb(darken(SH, 0.06), 0.2 * L.cheek), 2);
    soft(ctx, cx + L.fw - 5.5 + L.ax, 57.5, 3.4, 2.4, rgb(darken(SH, 0.12), 0.24 * L.cheek), 2);
  }

  // boca: lábios de verdade — superior em sombra, inferior pega luz
  const my = L.mouthY, mw = L.mouthW;
  const droop = f.mouth === 1 ? 1.2 : f.mouth === 2 ? -0.4 : 0.5;
  const lipFull = L.lip || 0;
  const lipTone = mix(SH, [130, 66, 56], L.fem ? 0.6 : 0.3);
  // filtro do lábio (sulco acima)
  soft(ctx, cx, my - 3.2, 1.2, 1.8, rgb(SH, 0.35), 1);
  const op = opts.mouthOpen || 0;
  if (op > 0) {
    /* BOCA ABERTA (exame): "abra a boca, por favor." — dentes um a um.
       Normal: dentes gastos, amarelados, um canino lascado, gengiva viva.
       opts.teethPerfect: dentição perfeita DEMAIS, gengiva pálida — o
       achado do TELLS 'dentes' pintado, não descrito. */
    const openH = 2.6 + op * 6.2;
    // cavidade
    ctx.fillStyle = 'rgb(24,11,9)';
    ctx.beginPath();
    ctx.moveTo(cx - mw * 0.92, my - 0.6);
    ctx.quadraticCurveTo(cx, my - 2.4, cx + mw * 0.92, my - 0.6);
    ctx.quadraticCurveTo(cx + mw * 0.8, my + openH * 0.85, cx, my + openH);
    ctx.quadraticCurveTo(cx - mw * 0.8, my + openH * 0.85, cx - mw * 0.92, my - 0.6);
    ctx.closePath(); ctx.fill();
    ctx.save();
    ctx.beginPath(); // clip da cavidade
    ctx.moveTo(cx - mw * 0.92, my - 0.6);
    ctx.quadraticCurveTo(cx, my - 2.4, cx + mw * 0.92, my - 0.6);
    ctx.quadraticCurveTo(cx + mw * 0.8, my + openH * 0.85, cx, my + openH);
    ctx.quadraticCurveTo(cx - mw * 0.8, my + openH * 0.85, cx - mw * 0.92, my - 0.6);
    ctx.closePath(); ctx.clip();
    // língua ao fundo
    soft(ctx, cx, my + openH - 1, mw * 0.5, 2.2, 'rgba(120,48,44,.8)', 1.4);
    // gengiva superior
    const gum = opts.teethPerfect ? 'rgb(198,176,172)' : 'rgb(148,72,64)';
    ctx.fillStyle = gum;
    ctx.beginPath();
    ctx.moveTo(cx - mw * 0.92, my - 0.8);
    ctx.quadraticCurveTo(cx, my - 2.6, cx + mw * 0.92, my - 0.8);
    ctx.lineTo(cx + mw * 0.92, my + 0.9); ctx.lineTo(cx - mw * 0.92, my + 0.9);
    ctx.closePath(); ctx.fill();
    // dentes superiores, um a um
    const nT = 8, x0 = cx - mw * 0.82, tw = (mw * 1.64) / nT;
    const rT = faceRng(faceSeedOf(f) ^ 0xD3);
    for (let i = 0; i < nT; i++) {
      const tx = x0 + i * tw;
      let th = opts.teethPerfect ? 2.6 : 1.9 + rT() * 1.0;
      const chip = !opts.teethPerfect && i === 5;         // o canino lascado
      if (chip) th *= 0.55;
      const tone = opts.teethPerfect
        ? [242, 240, 232]
        : mix([222, 206, 164], [188, 168, 122], rT() * 0.6);
      ctx.fillStyle = rgb(tone);
      ctx.beginPath();
      ctx.moveTo(tx + 0.12, my - 0.4);
      ctx.lineTo(tx + tw - 0.12, my - 0.4);
      ctx.lineTo(tx + tw - 0.28, my - 0.4 + th);
      ctx.quadraticCurveTo(tx + tw * 0.5, my + th, tx + 0.28, my - 0.4 + th);
      ctx.closePath(); ctx.fill();
      // sombra entre dentes (fraca demais na dentição "perfeita")
      ctx.strokeStyle = `rgba(60,36,28,${opts.teethPerfect ? 0.16 : 0.5})`;
      ctx.lineWidth = 0.28;
      ctx.beginPath(); ctx.moveTo(tx, my - 0.3); ctx.lineTo(tx, my - 0.4 + th * 0.9); ctx.stroke();
      // lado direito de cada dente em sombra (mesma lâmpada de sempre)
      ctx.fillStyle = 'rgba(90,66,44,.18)';
      ctx.fillRect(tx + tw * 0.62, my - 0.3, tw * 0.3, th * 0.8);
    }
    // esmalte MOLHADO: uma banda de brilho horizontal atravessa os dentes de
    // cima (saliva pega a lâmpada). Na dentição 'perfeita' fica dura e vítrea.
    soft(ctx, cx - mw * 0.15, my + 0.4, mw * 0.6, 0.5, opts.teethPerfect ? 'rgba(255,255,255,.5)' : 'rgba(255,250,235,.28)', opts.teethPerfect ? 0.4 : 0.7);
    // dentes inferiores espiando (só com a boca bem aberta)
    if (op > 0.55) {
      const y1 = my + openH - 1.6;
      ctx.fillStyle = opts.teethPerfect ? 'rgb(226,222,212)' : 'rgb(196,180,142)';
      for (let i = 0; i < nT; i++) {
        const tx = x0 + i * tw;
        const th = opts.teethPerfect ? 1.4 : 0.9 + rT() * 0.7;
        // cantos arredondados (dente não é tijolo): topo reto, base com raio
        const bx = tx + 0.2, bw = tw - 0.4, byT = y1 - th + 1.6;
        ctx.beginPath();
        ctx.moveTo(bx, byT); ctx.lineTo(bx + bw, byT);
        ctx.lineTo(bx + bw, byT + th * 0.5);
        ctx.quadraticCurveTo(bx + bw * 0.5, byT + th + 0.4, bx, byT + th * 0.5);
        ctx.closePath(); ctx.fill();
        ctx.strokeStyle = 'rgba(60,36,28,.35)'; ctx.lineWidth = 0.24;
        ctx.beginPath(); ctx.moveTo(tx, y1 + 0.2); ctx.lineTo(tx, y1 - th + 1.7); ctx.stroke();
      }
    }
    // sombra da cavidade sobre os dentes (profundidade)
    const cav = ctx.createLinearGradient(0, my - 1, 0, my + openH);
    cav.addColorStop(0, 'rgba(0,0,0,0)'); cav.addColorStop(1, 'rgba(10,4,3,.55)');
    ctx.fillStyle = cav; ctx.fillRect(cx - mw, my - 1, mw * 2, openH + 2);
    ctx.restore();
    // anel dos lábios em volta da abertura
    ctx.strokeStyle = rgb(darken(lipTone, 0.18), 0.95); ctx.lineWidth = 1.5 + lipFull * 0.6;
    ctx.beginPath();
    ctx.moveTo(cx - mw * 0.92, my - 0.6);
    ctx.quadraticCurveTo(cx, my - 2.6, cx + mw * 0.92, my - 0.6);
    ctx.quadraticCurveTo(cx + mw * 0.8, my + openH * 0.85, cx, my + openH + 0.3);
    ctx.quadraticCurveTo(cx - mw * 0.8, my + openH * 0.85, cx - mw * 0.92, my - 0.6);
    ctx.closePath(); ctx.stroke();
    soft(ctx, cx, my + openH + 1.6, mw * 0.5, 1.2, 'rgba(255,240,220,.28)', 0.9); // lábio inferior pega luz
    soft(ctx, cx, my + openH + 4, mw * 0.7, 2, rgb(darken(SH, 0.14), 0.5), 1.5);  // queixo caído
  } else if (opts.smile > 0) {
    /* SORRISO MEDONHO: cantos puxados alto/largo demais, uma fileira reta de
       dentes brancos demais — um sorriso que nunca alcança os olhos. */
    const smile = opts.smile, sw = mw * (1 + smile * 0.45), sy = my - smile * 1.0, lift = smile * 3.2;
    ctx.fillStyle = 'rgb(18,9,8)'; // fenda escura
    ctx.beginPath();
    ctx.moveTo(cx - sw, sy); ctx.quadraticCurveTo(cx, sy + 2.6, cx + sw, sy);
    ctx.quadraticCurveTo(cx, sy - lift, cx - sw, sy); ctx.closePath(); ctx.fill();
    ctx.save(); // clip pra fileira de dentes
    ctx.beginPath();
    ctx.moveTo(cx - sw * 0.94, sy); ctx.quadraticCurveTo(cx, sy + 2.2, cx + sw * 0.94, sy);
    ctx.quadraticCurveTo(cx, sy - lift * 0.5, cx - sw * 0.94, sy); ctx.closePath(); ctx.clip();
    const nTs = 11, x0s = cx - sw * 0.9, tws = sw * 1.8 / nTs;
    for (let i = 0; i < nTs; i++) {
      ctx.fillStyle = opts.teethBright ? 'rgb(251,251,248)' : 'rgb(230,224,208)';
      ctx.fillRect(x0s + i * tws + 0.15, sy - 2.6, tws - 0.3, 3.4);
      ctx.strokeStyle = opts.teethBright ? 'rgba(120,150,170,.25)' : 'rgba(90,70,50,.35)';
      ctx.lineWidth = 0.2; ctx.beginPath(); ctx.moveTo(x0s + i * tws, sy - 2.6); ctx.lineTo(x0s + i * tws, sy + 0.8); ctx.stroke();
    }
    if (opts.teethBright) soft(ctx, cx - 1, sy - 1.4, sw * 0.5, 1, 'rgba(255,255,255,.4)', 0.8); // esmalte brilhante demais
    ctx.restore();
    // lábios finos em volta
    ctx.strokeStyle = rgb(darken(lipTone, 0.15), 0.9); ctx.lineWidth = 1.1;
    ctx.beginPath(); ctx.moveTo(cx - sw, sy); ctx.quadraticCurveTo(cx, sy - lift, cx + sw, sy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx - sw, sy); ctx.quadraticCurveTo(cx, sy + 3.4, cx + sw, sy); ctx.stroke();
    // o sorriso que vai longe demais (vinco extra nos cantos)
    ctx.strokeStyle = rgb(darken(SH, 0.2), 0.45); ctx.lineWidth = 0.4;
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(cx + s * sw, sy - 0.3); ctx.lineTo(cx + s * (sw + 2.6), sy - lift * 0.7); ctx.stroke(); }
  } else {
  // lábio superior
  ctx.fillStyle = rgb(darken(lipTone, 0.22), 0.95);
  ctx.beginPath();
  ctx.moveTo(cx - mw, my + droop * 0.5 - L.cornerUp);
  ctx.quadraticCurveTo(cx - mw * 0.45, my - 2 - lipFull * 0.5, cx - 1.2, my - 1.7 - lipFull * 0.6);
  ctx.quadraticCurveTo(cx, my - 1.2 - lipFull * 0.4, cx + 1.2, my - 1.7 - lipFull * 0.6);
  ctx.quadraticCurveTo(cx + mw * 0.45, my - 2 - lipFull * 0.5, cx + mw, my + droop * 0.5 - L.cornerUp + L.asymMouth);
  ctx.quadraticCurveTo(cx, my + 0.8, cx - mw, my + droop * 0.5 - L.cornerUp);
  ctx.closePath(); ctx.fill();
  // lábio inferior
  ctx.fillStyle = rgb(lipTone, 0.8);
  ctx.beginPath();
  ctx.moveTo(cx - mw * 0.82, my + 0.4);
  ctx.quadraticCurveTo(cx, my + 1, cx + mw * 0.82, my + 0.4);
  ctx.quadraticCurveTo(cx + mw * 0.5, my + 3.4 + lipFull, cx, my + 3.6 + lipFull);
  ctx.quadraticCurveTo(cx - mw * 0.5, my + 3.4 + lipFull, cx - mw * 0.82, my + 0.4);
  ctx.closePath(); ctx.fill();
  soft(ctx, cx - 1, my + 2.2 + lipFull * 0.5, mw * 0.42, 1 + lipFull * 0.4, 'rgba(255,240,220,.44)', 0.9); // brilho no lábio inferior
  soft(ctx, cx - 1.6, my + 2.1 + lipFull * 0.5, mw * 0.14, 0.5, 'rgba(255,250,238,.4)', 0.5);            // faísca úmida (lado da luz)
  soft(ctx, cx - 0.6, my - 1.4 - lipFull * 0.4, mw * 0.3, 0.55, 'rgba(255,238,220,.16)', 0.7);           // sheen do lábio superior (arco do cupido)
  // vinco da boca (a linha mais escura do rosto)
  ctx.strokeStyle = 'rgba(28,16,12,.85)'; ctx.lineWidth = 0.75;
  ctx.beginPath();
  ctx.moveTo(cx - mw, my + droop * 0.5 - L.cornerUp);
  ctx.quadraticCurveTo(cx, my + droop, cx + mw, my + droop * 0.5 - L.cornerUp + L.asymMouth);
  ctx.stroke();
  soft(ctx, cx, my + 5.4, mw * 0.7, 1.7, rgb(darken(SH, 0.1), 0.45), 1.3); // sombra sob o lábio
  soft(ctx, cx - 1, L.chinY - 4.5, 4, 2.4, 'rgba(255,246,226,.16)', 1.4);  // bola do queixo
  if (f.idade > 50) { // vincos verticais de lábio de idoso
    ctx.strokeStyle = rgb(darken(SH, 0.2), 0.3); ctx.lineWidth = 0.4;
    for (let i = 0; i < 5; i++) {
      const t = (i / 4 - 0.5) * mw * 1.3;
      ctx.beginPath(); ctx.moveTo(cx + t, my - 2.2); ctx.lineTo(cx + t * 1.05, my - 0.6); ctx.stroke();
    }
  }
  }

  // rugas
  if (f.rugas) {
    ctx.strokeStyle = rgb(darken(SH, 0.2), 0.30); ctx.lineWidth = 0.55;
    for (let i = 0; i < 3; i++) {
      const y = 28 + i * 3.4 + r() * 1.4;
      ctx.beginPath(); ctx.moveTo(cx - 11 + r() * 3, y);
      ctx.quadraticCurveTo(cx, y - 1.6, cx + 11 - r() * 3, y); ctx.stroke();
    }
    ctx.beginPath(); ctx.moveTo(cx - L.noseW - 1.2, L.noseTip + 1);
    ctx.quadraticCurveTo(cx - mw - 1.5, my - 3, cx - mw - 0.5, my + 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx + L.noseW + 1.2, L.noseTip + 1);
    ctx.quadraticCurveTo(cx + mw + 1.5, my - 3, cx + mw + 0.5, my + 2); ctx.stroke();
    // pés de galinha
    for (const sgn of [-1, 1]) {
      const ex = cx + sgn * (L.eyeDX + L.eyeW - 1);
      ctx.beginPath(); ctx.moveTo(ex, L.eyeY);
      ctx.quadraticCurveTo(ex + sgn * 3, L.eyeY + 1, ex + sgn * 4, L.eyeY + 3); ctx.stroke();
    }
  }
  // olheiras
  if (f.idade > 42 || r() < 0.3) {
    soft(ctx, cx - L.eyeDX, L.eyeY + 4.2, 4.6, 1.8, rgb(mix(SH, [70, 60, 78], 0.4), 0.35), 1.8);
    soft(ctx, cx + L.eyeDX, L.eyeY + 4.2, 4.6, 1.8, rgb(mix(SH, [70, 60, 78], 0.4), 0.38), 1.8);
  }

  // textura de pele: poros, manchas, cicatriz ocasional
  if (!opts.waxy) {
    ctx.fillStyle = rgb(darken(SH, 0.15), 0.10);
    for (let i = 0; i < 90; i++) {
      const x = 50 + (r() - 0.5) * L.fw * 2, y = 30 + r() * (L.chinY - 30);
      ctx.fillRect(x, y, 0.5, 0.5);
    }
    for (let i = 0; i < 3; i++) {
      if (r() < 0.5) soft(ctx, 50 + (r() - 0.5) * L.fw * 1.7, 34 + r() * 38, 1 + r(), 1 + r(), rgb(darken(SH, 0.1), 0.20), 1);
    }
    if (r() < 0.18) { // cicatriz antiga
      ctx.strokeStyle = rgb(lighten(SK, 0.25), 0.5); ctx.lineWidth = 0.5;
      const sx = cx + (r() - 0.5) * L.fw * 1.4, sy = 58 + r() * 14;
      ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx + 3 + r() * 3, sy + 2); ctx.stroke();
    }
    // PINTA / sinal: ~28% das pessoas têm uma. Individualiza — dois rostos
    // gerados nunca mais parecem "o mesmo modelo". Local plausível (bochecha,
    // maçã, acima do lábio, têmpora), com relevo mínimo (sombra + realce).
    if (r() < 0.28 && !L.child) {
      const spots = [[cx - L.fw * 0.5, L.cheekY + 3], [cx + L.fw * 0.42, L.cheekY + 6], [cx + 3.5, L.mouthY - 3.5], [cx - L.eyeDX - 1, L.eyeY - 6], [cx - 4, L.chinY - 6]];
      const sp = spots[(r() * spots.length) | 0];
      const mr = 0.5 + r() * 0.5;
      soft(ctx, sp[0] + 0.25, sp[1] + 0.25, mr * 1.4, mr * 1.2, 'rgba(20,10,6,.3)', 0.6); // sombra de relevo
      ctx.fillStyle = rgb(mix([70, 44, 30], SH, r() * 0.3), 0.9);
      ctx.beginPath(); ctx.ellipse(sp[0], sp[1], mr, mr * 0.9, 0, 0, 6.29); ctx.fill();
      ctx.fillStyle = 'rgba(255,240,220,.2)';
      ctx.beginPath(); ctx.arc(sp[0] - mr * 0.35, sp[1] - mr * 0.35, mr * 0.3, 0, 6.29); ctx.fill(); // micro-realce
    }
    // sardas (cantalos de pele clara, quase sempre)
    if (L.sardas && r() < 0.8) {
      ctx.fillStyle = rgb(mix(SH, [122, 74, 44], 0.5), 0.3);
      for (let i = 0; i < 26; i++) {
        const x = cx + (r() - 0.5) * L.fw * 1.5;
        const y = 50 + r() * 10 - Math.abs(x - cx) * 0.12;
        ctx.fillRect(x, y, 0.55 + r() * 0.3, 0.55 + r() * 0.3);
      }
    }
    // barba por fazer
    if (!L.fem && f.beard === 0 && !L.child && r() < 0.5) {
      soft(ctx, cx, L.chinY - 7, L.jw * 0.85, 9, rgb(darken(SH, 0.3), 0.13), 2.6);
    }
  } else {
    soft(ctx, cx, 52, L.fw * 0.8, 26, 'rgba(255,252,244,.12)', 3);
  }

  ctx.restore(); // fim do clip da cabeça

  /* contorno suave da cabeça (aterra o rosto) */
  headPath(ctx, L);
  ctx.strokeStyle = rgb(darken(SH, 0.3), 0.4); ctx.lineWidth = 0.7; ctx.stroke();
  // luz de recorte no lado direito (separa a cabeça do fundo)
  ctx.save();
  headPath(ctx, L); ctx.clip();
  ctx.strokeStyle = 'rgba(235,238,215,.14)'; ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.moveTo(cx + L.fw - 1 + L.ax, 40);
  ctx.bezierCurveTo(cx + L.fw + L.ax, 54, cx + L.jw + L.ax, 62, cx + L.jw * 0.8 + L.ax, L.chinY - 5);
  ctx.stroke();
  ctx.restore();

  /* sombra forte sob o queixo */
  soft(ctx, cx, L.chinY + 7, 8.5, 3, 'rgba(8,6,4,.42)', 2);

  /* ESPECULARES: brilhos pequenos e "molhados" nos pontos altos, do lado da
     luz. Fazem a pele parecer viva e esculpida em vez de fosco de manequim.
     Contidos — é gente cansada, não editorial de revista. */
  if (f.hat !== 2) {
    const nT = L.noseTip, nTp = L.browY + 4, nMid = (nTp + nT) / 2;
    const hl = (x, y, rx, ry, al, bl) => soft(ctx, x, y, rx, ry, `rgba(255,250,236,${al})`, bl);
    hl(cx - 5.5, 30, 4.2, 3, 0.15, 2);                        // testa (lado da luz)
    hl(cx - 0.8, nMid, 0.7, (nT - nTp) / 2.6, 0.2, 0.6);      // cavalete do nariz (fio de luz)
    hl(cx - 0.7, nT - 1, 1.0, 0.9, 0.34, 0.55);               // ponta do nariz (hot spot)
    hl(cx - L.fw + 4.8, L.cheekY - 0.6, 2.3, 1.5, 0.19, 1.3); // crista da maçã (luz)
    hl(cx - L.eyeDX, L.browY - 0.7, 3, 1.1, 0.12, 1.4);       // osso da sobrancelha
    hl(cx - 0.5, L.mouthY + 1.9, L.mouthW * 0.36, 0.8, 0.2, 0.7); // lábio inferior (úmido)
    hl(cx - 1.5, L.chinY - 2.6, 2.2, 1.4, 0.13, 1.6);         // queixo
  }

  /* ---------- olhos ---------- */
  const eyes = opts.eyesClosed ? 'closed' : 'open';
  const wide = opts.eyesWide ? 1 : 0;       // "abra bem os olhos."
  const lookX = opts.lookX || 0;            // "agora olhe para a esquerda."
  for (const sgn of [-1, 1]) {
    const ex = cx + sgn * L.eyeDX + (sgn > 0 ? L.ax * 0.5 : 0);
    const ey = L.eyeY + (sgn > 0 ? L.ax * 0.35 + L.asymEye : 0);   // olho direito nunca no mesmo nível
    const ew = L.eyeW, eh = L.eyeH * (1 + wide * 0.65) * (sgn > 0 ? L.asymEyeH : 1);
    const pull = opts.pullLid && sgn === 1; // a pálpebra inferior puxada pelo dedo
    if (eyes === 'closed') {
      ctx.strokeStyle = rgb(darken(SH, 0.35), 0.9); ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.moveTo(ex - ew, ey + 0.4);
      ctx.quadraticCurveTo(ex, ey + eh * 0.8, ex + ew, ey + 0.4); ctx.stroke();
      soft(ctx, ex, ey - 1, ew * 0.9, 2, rgb(mix(SK, SH, 0.3), 0.8), 1.2);
      continue;
    }
    // esclera (nunca branca — olho de gente cansada). O olho do lado da
    // SOMBRA é mais escuro: dois olhos idênticos e igualmente claros é o que
    // dava o ar de "olhos colados na cara".
    const scleraBase = opts.blackSclera ? [18, 15, 20] : (opts.brightSclera ? [234, 232, 220] : [196, 188, 166]);
    ctx.fillStyle = rgb(sgn > 0 ? darken(scleraBase, 0.26) : scleraBase);
    ctx.beginPath();
    ctx.moveTo(ex - ew, ey);
    ctx.quadraticCurveTo(ex - ew * 0.3, ey - eh - 0.6, ex + ew * 0.5, ey - eh + 0.2);
    ctx.quadraticCurveTo(ex + ew, ey - eh * 0.3, ex + ew, ey + 0.2);
    ctx.quadraticCurveTo(ex + ew * 0.3, ey + eh, ex - ew * 0.5, ey + eh - 0.4);
    ctx.quadraticCurveTo(ex - ew, ey + eh * 0.4, ex - ew, ey);
    ctx.closePath(); ctx.fill();
    ctx.save(); ctx.clip();
    // cantos do olho na sombra (o olho é uma esfera dentro de um buraco)
    const cg = ctx.createLinearGradient(ex - ew, 0, ex + ew, 0);
    cg.addColorStop(0, 'rgba(58,44,34,.5)'); cg.addColorStop(0.3, 'rgba(58,44,34,0)');
    cg.addColorStop(0.7, 'rgba(58,44,34,0)'); cg.addColorStop(1, 'rgba(58,44,34,.55)');
    ctx.fillStyle = cg; ctx.fillRect(ex - ew, ey - eh - 1, ew * 2, eh * 2 + 2);
    // CRESCENTE: sombra que a pálpebra superior projeta na esclera — assenta
    // o globo dentro da órbita (o cue mais forte de "olho de verdade")
    if (!wide) {
      ctx.fillStyle = 'rgba(36,26,18,.45)';
      ctx.beginPath();
      ctx.moveTo(ex - ew, ey - eh * 0.1);
      ctx.quadraticCurveTo(ex, ey - eh - 0.8, ex + ew, ey - eh * 0.1);
      ctx.quadraticCurveTo(ex, ey - eh * 0.5 + 1.6, ex - ew, ey - eh * 0.1);
      ctx.closePath(); ctx.fill();
    }
    // esclera cansada de TODO MUNDO: nunca é branca de pôster. Uma leve tinta
    // quente e um ou dois vasinhos finos no canto externo — quem trabalha na
    // fronteira dorme mal. (opts.veins é a versão FORTE, de Alternado.)
    const carY = ctx.createLinearGradient(ex - ew, 0, ex + ew, 0);
    const inSide = sgn < 0 ? 1 : 0; // canto interno (perto do nariz)
    carY.addColorStop(0, inSide ? 'rgba(196,132,120,.16)' : 'rgba(150,60,48,.10)');
    carY.addColorStop(0.5, 'rgba(0,0,0,0)');
    carY.addColorStop(1, inSide ? 'rgba(150,60,48,.10)' : 'rgba(196,132,120,.16)');
    ctx.fillStyle = carY; ctx.fillRect(ex - ew, ey - eh - 1, ew * 2, eh * 2 + 2);
    if (!opts.veins) {
      ctx.strokeStyle = 'rgba(158,72,58,.28)'; ctx.lineWidth = 0.24;
      for (let i = 0; i < 2; i++) {
        const oy = ey + (r() - 0.5) * eh * 0.9;
        ctx.beginPath(); ctx.moveTo(ex + sgn * ew * 0.92, oy);
        ctx.quadraticCurveTo(ex + sgn * ew * 0.5, oy + (r() - 0.5) * 1.4, ex + sgn * ew * 0.25, ey + (r() - 0.5) * 1.2);
        ctx.stroke();
      }
    }
    if (opts.veins) {
      ctx.strokeStyle = 'rgba(150,44,32,.6)'; ctx.lineWidth = 0.32;
      for (let i = 0; i < 4; i++) {
        ctx.beginPath(); ctx.moveTo(ex - sgn * ew * 0.9, ey + (r() - 0.5) * eh);
        ctx.quadraticCurveTo(ex - sgn * ew * 0.3, ey + (r() - 0.5) * eh, ex - sgn * 1, ey + (r() - 0.5) * 1.4);
        ctx.stroke();
      }
    }
    // íris GRANDE, cortada em cima pela pálpebra — olhar pesado, não arregalado.
    // No modo "arregalado" do exame a íris fica INTEIRA visível, com esclera
    // em volta — é exatamente isso que perturba.
    const ir = (2.9 + r() * 0.4) * (L.child ? 1.12 : 1) * (wide ? 0.92 : 1);
    // olhar morto: pupila dilatada fixa (o Alternado não acomoda à luz)
    const pr = (1.45 + (sgn > 0 ? L.pupilSkew : 0)) * (opts.deadStare ? 1.5 : 1) * (opts.anisocoria && sgn > 0 ? 2.3 : 1); // anisocoria: uma pupila dilatada
    const ixx = ex + lookX * 1.25;
    const iy = ey - 0.3 + wide * 0.4;
    const irisC = sgn > 0 ? darken(L.iris, 0.15) : L.iris; // sombra escurece de leve (sem matar a cor)
    const ig = ctx.createRadialGradient(ixx - 0.6, iy - 0.6, 0.4, ixx, iy, ir);
    ig.addColorStop(0, rgb(lighten(irisC, 0.12)));  // borda superior-esquerda pega luz
    ig.addColorStop(0.55, rgb(irisC));
    ig.addColorStop(0.9, rgb(darken(irisC, 0.55)));
    ig.addColorStop(1, rgb(darken(irisC, 0.7)));    // anel escuro (limbo)
    ctx.fillStyle = ig;
    ctx.beginPath(); ctx.arc(ixx, iy, ir, 0, 6.29); ctx.fill();
    // FIBRAS da íris + anel límbico + brilho inferior (luz atravessa) — o que
    // separa um olho vivo de um disco chapado. Só quando a íris é grande o bastante.
    if (!opts.blackSclera && ir > 2) {
      ctx.save(); ctx.beginPath(); ctx.arc(ixx, iy, ir, 0, 6.29); ctx.clip();
      for (let k = 0; k < 16; k++) {
        const a = k / 16 * 6.28 + (r() - 0.5) * 0.22;
        const r0 = pr + 0.3, r1 = ir * (0.7 + r() * 0.3);
        ctx.strokeStyle = k % 2 ? rgb(lighten(irisC, 0.32), 0.32) : rgb(darken(irisC, 0.5), 0.4);
        ctx.lineWidth = 0.32;
        ctx.beginPath(); ctx.moveTo(ixx + Math.cos(a) * r0, iy + Math.sin(a) * r0);
        ctx.lineTo(ixx + Math.cos(a) * r1, iy + Math.sin(a) * r1); ctx.stroke();
      }
      soft(ctx, ixx + 0.3, iy + ir * 0.5, ir * 0.6, ir * 0.34, rgb(lighten(irisC, 0.28), sgn < 0 ? 0.32 : 0.18), 0.7);
      ctx.strokeStyle = rgb(darken(irisC, 0.62), 0.55); ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.arc(ixx, iy, ir - 0.3, 0, 6.29); ctx.stroke();
      ctx.restore();
    }
    ctx.fillStyle = 'rgb(8,6,5)';
    if (opts.slitPupil) { // pupila em fenda vertical (réptil) — inequivocamente não-humano
      ctx.save(); ctx.translate(ixx, iy); ctx.scale(0.42, 2.15);
      ctx.beginPath(); ctx.arc(0, 0, pr * 1.05, 0, 6.29); ctx.fill(); ctx.restore();
    } else { ctx.beginPath(); ctx.arc(ixx, iy, pr, 0, 6.29); ctx.fill(); }
    // catchlight: forte no olho da luz, fraco no da sombra. No olhar morto os
    // DOIS reflexos são idênticos e vidrados (nada por trás dos olhos).
    if (opts.deadStare) {
      ctx.fillStyle = 'rgba(255,255,250,.85)';
      ctx.beginPath(); ctx.arc(ixx - 0.9, iy - 0.9, 0.42, 0, 6.29); ctx.fill();
      soft(ctx, ixx + 0.4, iy + 0.6, ir * 0.7, ir * 0.5, 'rgba(200,220,235,.16)', 0.7); // película vidrada fria
    } else {
      ctx.fillStyle = `rgba(255,253,246,${sgn < 0 ? 0.92 : 0.5})`;
      ctx.beginPath(); ctx.arc(ixx - 0.95, iy - 0.95, sgn < 0 ? 0.52 : 0.38, 0, 6.29); ctx.fill();
      // segunda faísca minúscula do lado oposto — umidade do globo
      ctx.fillStyle = `rgba(255,255,252,${sgn < 0 ? 0.5 : 0.28})`;
      ctx.beginPath(); ctx.arc(ixx + 0.55, iy + 0.45, 0.2, 0, 6.29); ctx.fill();
    }
    if (!wide) {
      // a pálpebra superior COBRE o topo da íris (sombra + oclusão)
      const lg = ctx.createLinearGradient(0, ey - eh - 0.5, 0, ey - eh * 0.1);
      lg.addColorStop(0, 'rgba(44,32,24,.85)'); lg.addColorStop(1, 'rgba(44,32,24,0)');
      ctx.fillStyle = lg; ctx.fillRect(ex - ew, ey - eh - 1, ew * 2, eh + 1.4);
    }
    if (pull) {
      // o interior da pálpebra inferior exposto — vermelho úmido
      ctx.fillStyle = 'rgb(164,80,72)';
      ctx.beginPath(); ctx.ellipse(ex, ey + eh + 0.7, ew * 0.62, 1.25, 0, 0, 6.29); ctx.fill();
      soft(ctx, ex, ey + eh + 0.6, ew * 0.4, 0.6, 'rgba(255,220,210,.5)', 0.6);
    }
    ctx.restore();
    // linha da pálpebra superior + cílios
    ctx.strokeStyle = 'rgba(30,20,14,.9)'; ctx.lineWidth = 0.85;
    ctx.beginPath(); ctx.moveTo(ex - ew - 0.4, ey - 0.2);
    ctx.quadraticCurveTo(ex - ew * 0.2, ey - eh - 0.8, ex + ew * 0.6, ey - eh + 0.1);
    ctx.quadraticCurveTo(ex + ew + 0.2, ey - eh * 0.4, ex + ew + (L.fem ? 1 : 0.4), ey);
    ctx.stroke();
    // dobra da pálpebra acima da linha
    ctx.strokeStyle = rgb(darken(SH, 0.1), 0.4); ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.moveTo(ex - ew * 0.7, ey - eh - 1.3);
    ctx.quadraticCurveTo(ex, ey - eh - 2, ex + ew * 0.7, ey - eh - 1.1); ctx.stroke();
    // pálpebra inferior discreta
    if (!pull) {
      ctx.strokeStyle = rgb(SH, 0.45); ctx.lineWidth = 0.4;
      ctx.beginPath(); ctx.moveTo(ex - ew * 0.7, ey + eh - 0.2);
      ctx.quadraticCurveTo(ex, ey + eh + 0.4, ex + ew * 0.8, ey + eh - 0.4); ctx.stroke();
    } else {
      // o dedo que puxa a pálpebra (do próprio examinado). Uma ponta de dedo
      // DE VERDADE: pad arredondado sob a pálpebra, corpo que afina e some pra
      // baixo, unha com meia-lua. (antes era uma barra chapada de canto reto.)
      const yb = ey + eh;
      // sombra de contato: onde a polpa empurra a pele, logo acima
      soft(ctx, ex + 0.3, yb + 0.4, 3.2, 1.4, rgb(darken(SH, 0.28), 0.5), 1.2);
      const ftone = mix(SK, SH, 0.28);
      // corpo do dedo (afinando pra baixo, cantos redondos, sem base reta)
      const fg = ctx.createLinearGradient(ex - 3, 0, ex + 3.2, 0);
      fg.addColorStop(0, rgb(darken(ftone, 0.22))); fg.addColorStop(0.4, rgb(lighten(ftone, 0.06)));
      fg.addColorStop(0.7, rgb(ftone)); fg.addColorStop(1, rgb(darken(ftone, 0.3)));
      ctx.fillStyle = fg;
      ctx.beginPath();
      ctx.moveTo(ex - 3, yb + 2.2);
      ctx.quadraticCurveTo(ex - 3.2, yb + 0.6, ex, yb + 0.4);          // pad topo-esq (arredondado)
      ctx.quadraticCurveTo(ex + 3.2, yb + 0.6, ex + 3.1, yb + 2.4);    // pad topo-dir
      ctx.quadraticCurveTo(ex + 2.9, yb + 8, ex + 2.2, yb + 13);       // lado direito afinando
      ctx.quadraticCurveTo(ex + 0.2, yb + 15.5, ex - 1.8, yb + 13);    // ponta baixa arredondada
      ctx.quadraticCurveTo(ex - 2.8, yb + 8, ex - 3, yb + 2.2);        // lado esquerdo
      ctx.closePath(); ctx.fill();
      // realce da polpa (luz da lâmpada na carne apertada)
      soft(ctx, ex - 0.6, yb + 3.4, 1.9, 2.6, rgb(lighten(SK, 0.34), 0.5), 1.2);
      // unha: meia-lua clara mais abaixo, no dorso do dedo
      ctx.fillStyle = rgb(lighten(mix(SK, [230, 214, 206], 0.5), 0.1), 0.7);
      ctx.beginPath(); ctx.ellipse(ex + 0.2, yb + 9.5, 1.7, 2.4, 0.05, 0, 6.29); ctx.fill();
      ctx.fillStyle = 'rgba(255,250,244,.35)';
      ctx.beginPath(); ctx.ellipse(ex - 0.1, yb + 8.2, 1.2, 0.8, 0, 0, 6.29); ctx.fill(); // lúnula
      // prega da junta
      ctx.strokeStyle = rgb(darken(SH, 0.22), 0.45); ctx.lineWidth = 0.4;
      ctx.beginPath(); ctx.moveTo(ex - 2.4, yb + 6); ctx.quadraticCurveTo(ex, yb + 6.6, ex + 2.6, yb + 6); ctx.stroke();
    }
    // canto interno
    ctx.fillStyle = rgb(mix(SH, [130, 60, 50], 0.5), 0.6);
    ctx.beginPath(); ctx.arc(ex - sgn * ew, ey + 0.2, 0.5, 0, 6.29); ctx.fill();
  }

  /* sobrancelhas: FORMA preenchida e afilada (grossa no meio, fina na cauda),
     seguindo a arcada — não um risco. A do lado da sombra é mais escura. */
  for (const sgn of [-1, 1]) {
    const ex = cx + sgn * L.eyeDX, by = L.browY + (sgn > 0 ? L.ax * 0.5 + L.asymBrow : 0);
    const dark = sgn > 0;
    const inX = ex - sgn * (L.eyeW * 0.92), inY = by + 1.5;          // cabeça (perto do nariz)
    const arX = ex - sgn * (L.eyeW * 0.05), arY = by - (f.brow ? 1.8 : 0.9); // arco (pico)
    const tlX = ex + sgn * (L.eyeW * 1.12), tlY = by + (f.brow ? 0.7 : 1.2); // cauda
    const th = (L.fem ? 1.0 : 1.7) * (f.brow ? 1.15 : 1);
    // forma preenchida
    ctx.fillStyle = rgb(darken(L.hair, dark ? 0.3 : 0.16), L.fem ? 0.72 : 0.9);
    ctx.beginPath();
    ctx.moveTo(inX, inY);
    ctx.quadraticCurveTo(arX, arY, tlX, tlY);
    ctx.quadraticCurveTo(arX, arY + th, inX + sgn * 0.3, inY + th * 0.85);
    ctx.closePath(); ctx.fill();
    // sombra que a sobrancelha projeta na órbita (logo abaixo)
    soft(ctx, arX, by + th + 0.6, L.eyeW * 0.9, 0.9, rgb(darken(SH, 0.14), 0.3), 1.1);
    // fios por cima: NÃO um pente. Posição sorteada (não igual espaçada),
    // comprimento e grossura variados, e a DIREÇÃO segue o fluxo real da
    // sobrancelha — na cabeça os fios sobem, no arco abrem, na cauda descem.
    const n = L.fem ? 17 : 26;
    for (let i = 0; i < n; i++) {
      const t = (i + (r() - 0.5) * 0.9) / (n - 1);
      if (t < -0.02 || t > 1.04) continue;
      const bx = inX + (tlX - inX) * t + (r() - 0.5) * 0.7;
      const yy = by + 1 - Math.sin(t * 2.6) * (f.brow ? 1.6 : 0.9) + (r() - 0.5) * 1.0;
      const len = 1.2 + (t < 0.45 ? 0.5 : 1.1) + r() * 0.9;    // cauda tem fios mais longos
      const vdir = -1.0 + t * 2.0 + (r() - 0.5) * 0.5;          // cabeça sobe (−), cauda desce (+)
      ctx.lineWidth = 0.28 + r() * 0.3;
      ctx.strokeStyle = rgb(r() < 0.5 ? darken(L.hair, 0.4) : lighten(L.hair, 0.28), dark ? 0.5 : 0.72);
      ctx.beginPath(); ctx.moveTo(bx, yy + 0.9);
      ctx.quadraticCurveTo(bx + sgn * len * 0.5, yy + 0.9 + vdir * 0.35, bx + sgn * len, yy + 0.9 + vdir);
      ctx.stroke();
    }
  }

  /* ---------- cabelo ---------- */
  const HC = L.hair;
  if (f.hat !== 2) {
    ctx.save();
    const hs = f.hairStyle;
    const topY = 17, hlY = [32, 30, 29, 30][hs] + r() * 1.6; // linha do cabelo (mais baixa = menos testa)
    // massa base — traçado reutilizável (preenche E recorta os fios, para
    // nenhum fio escapar pra testa como "garra")
    const hairMass = () => {
      ctx.beginPath();
      ctx.moveTo(cx - L.fw - 0.6, 48);
      ctx.bezierCurveTo(cx - L.fw - 2, topY + 2, cx - L.fw * 0.5, topY - 4.5, cx, topY - 4.5);
      ctx.bezierCurveTo(cx + L.fw * 0.5, topY - 4.5, cx + L.fw + 2 + L.ax, topY + 2, cx + L.fw + 0.6 + L.ax, 48);
      // recorte da testa (linha do cabelo por estilo)
      if (hs === 2) { // ENTRADAS suaves: têmporas recuam, forelock central desce;
        // ainda há cabelo no topo (calvície de verdade só em idoso)
        const rec = f.idade > 55 ? 3.5 : 1.5;
        const fore = f.idade > 55 ? -0.5 : 1.5;            // quanto o forelock desce
        ctx.lineTo(cx + L.fw * 0.9 + L.ax, hlY);
        ctx.quadraticCurveTo(cx + L.fw * 0.62, hlY - 2 - rec, cx + L.fw * 0.3, hlY - 1); // entrada dir
        ctx.quadraticCurveTo(cx + L.fw * 0.12, hlY + fore, cx, hlY + fore);              // forelock (pico central)
        ctx.quadraticCurveTo(cx - L.fw * 0.12, hlY + fore, cx - L.fw * 0.3, hlY - 1);
        ctx.quadraticCurveTo(cx - L.fw * 0.62, hlY - 2 - rec, cx - L.fw * 0.9, hlY);      // entrada esq
      } else if (hs === 3) { // penteado pra trás, com volume no topo (não é calvo)
        ctx.lineTo(cx + L.fw * 0.95 + L.ax, hlY + 1);
        ctx.quadraticCurveTo(cx, hlY - 1.5, cx - L.fw * 0.95, hlY + 1);
      } else if (hs === 1) { // franja varrida de lado: alta na repartição, cai cruzando a testa
        // NÃO é um arco chapado ("cuia") — um lado revela a testa, o outro pesa.
        const sw = L.ax >= 0 ? 1 : -1;           // lado da repartição (fica mais alto)
        const dR = sw > 0 ? 0.8 : 5.2;           // profundidade na borda direita
        const dL = sw > 0 ? 5.2 : 0.8;           // profundidade na borda esquerda
        ctx.lineTo(cx + L.fw * 0.98 + L.ax, hlY + dR);
        // ponta da franja mergulha no lado oposto à repartição (diagonal, não simétrico)
        ctx.quadraticCurveTo(cx - sw * L.fw * 0.28, hlY + 6.5, cx - sw * L.fw * 0.66, hlY + 5.4);
        ctx.quadraticCurveTo(cx - sw * L.fw * 0.86, hlY + 4.6, cx - L.fw * 0.98, hlY + dL);
      } else { // repartido de lado
        ctx.lineTo(cx + L.fw * 0.97 + L.ax, hlY + 2);
        ctx.quadraticCurveTo(cx + L.fw * 0.3, hlY + 4.5, cx - L.fw * 0.35, hlY - 1.5);
        ctx.quadraticCurveTo(cx - L.fw * 0.75, hlY, cx - L.fw * 0.97, hlY + 3);
      }
      ctx.closePath();
    };
    ctx.fillStyle = rgb(HC);
    hairMass(); ctx.fill();
    // VOLUME do cabelo: sombreado de forma pra não virar um capacete chapado.
    // Escurece raízes e bordas; abre uma banda de brilho anisotrópico na copa
    // do lado da luz. É o que transforma "mancha de cor" em cabelo com volume.
    ctx.save(); hairMass(); ctx.clip();
    const hg = ctx.createLinearGradient(cx - L.fw, topY - 6, cx + L.fw + L.ax, 54);
    hg.addColorStop(0, rgb(lighten(HC, 0.32), 0.4));
    hg.addColorStop(0.42, 'rgba(0,0,0,0)');
    hg.addColorStop(1, rgb(darken(HC, 0.5), 0.42));
    ctx.fillStyle = hg; ctx.fillRect(0, 0, 100, 120);
    soft(ctx, cx, hlY - 2, L.fw * 0.9, 3, rgb(darken(HC, 0.55), 0.38), 2.4);            // raiz (contato com a testa)
    soft(ctx, cx - L.fw + 1, 38, 3, 10, rgb(darken(HC, 0.5), 0.36), 2.4);               // borda esq (o cabelo vira)
    soft(ctx, cx + L.fw - 1 + L.ax, 38, 3.2, 10, rgb(darken(HC, 0.55), 0.42), 2.4);     // borda dir (sombra)
    soft(ctx, cx - L.fw * 0.3, topY + 2, L.fw * 0.62, 2.2, rgb(lighten(HC, 0.6), 0.48), 1.6);  // banda de brilho (copa)
    soft(ctx, cx - L.fw * 0.14, topY + 4.6, L.fw * 0.46, 1.1, rgb(lighten(HC, 0.78), 0.4), 1.1); // núcleo do brilho
    ctx.restore();
    // sombra do cabelo caindo na testa (aterra o cabelo e quebra a testa chapada)
    ctx.save();
    try { ctx.filter = `blur(${(1.1 * F_SCALE * 0.55).toFixed(1)}px)`; } catch (e) {}
    ctx.fillStyle = rgb(darken(SH, 0.16), hs === 2 ? 0.2 : 0.34);
    ctx.beginPath();
    ctx.moveTo(cx - L.fw * 0.82, hlY + 1);
    ctx.quadraticCurveTo(cx, hlY + (hs === 2 ? -2 : 4.5), cx + L.fw * 0.82, hlY + 1);
    ctx.lineTo(cx + L.fw * 0.82, hlY - 3); ctx.lineTo(cx - L.fw * 0.82, hlY - 3);
    ctx.closePath(); ctx.fill();
    ctx.restore();
    if (hs === 2) { // recuo mantém cabelo temporal nos lados (não é calvície total)
      ctx.fillStyle = rgb(darken(HC, 0.04));
      for (const s of [-1, 1]) {
        const ox = s > 0 ? L.ax : 0;
        ctx.beginPath();
        ctx.moveTo(cx + s * (L.fw + 0.4) + ox, 47);
        ctx.quadraticCurveTo(cx + s * (L.fw + 1.5) + ox, hlY + 3, cx + s * (L.fw * 0.84) + ox, hlY + 4);
        ctx.quadraticCurveTo(cx + s * (L.fw * 0.66) + ox, hlY - 1, cx + s * (L.fw * 0.72) + ox, 49);
        ctx.closePath(); ctx.fill();
      }
      if (f.idade >= 50) { // couro aparecendo no alto
        ctx.fillStyle = rgb(SK, 0.28);
        ctx.beginPath(); ctx.ellipse(cx, topY + 4, L.fw * 0.5, 5, 0, 0, 6.29); ctx.fill();
      }
    }
    // cabelo comprido feminino: massas laterais
    if (L.fem) {
      ctx.fillStyle = rgb(darken(HC, 0.08));
      ctx.beginPath();
      ctx.moveTo(cx - L.fw - 0.5, 40);
      ctx.quadraticCurveTo(cx - L.fw - 4.5, 58, cx - L.fw - 3, 76 + r() * 6);
      ctx.lineTo(cx - L.fw + 3.5, 78);
      ctx.quadraticCurveTo(cx - L.fw + 0.5, 58, cx - L.fw + 1.5, 44);
      ctx.closePath(); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(cx + L.fw + 0.5 + L.ax, 40);
      ctx.quadraticCurveTo(cx + L.fw + 4.5, 58, cx + L.fw + 3, 74 + r() * 6);
      ctx.lineTo(cx + L.fw - 3.5, 78);
      ctx.quadraticCurveTo(cx + L.fw - 0.5, 58, cx + L.fw - 1.5, 44);
      ctx.closePath(); ctx.fill();
    }
    // fios: textura direcional, RECORTADA à massa (nenhum fio escapa pra testa)
    ctx.save(); hairMass();
    if (L.fem) { // inclui as mechas laterais no clip do cabelo feminino
      ctx.moveTo(cx - L.fw + 3.5, 78); ctx.lineTo(cx - L.fw - 3, 76);
      ctx.lineTo(cx - L.fw - 0.5, 40); ctx.lineTo(cx - L.fw + 1.5, 44);
      ctx.moveTo(cx + L.fw - 3.5, 78); ctx.lineTo(cx + L.fw + 3, 74);
      ctx.lineTo(cx + L.fw + 0.5, 40); ctx.lineTo(cx + L.fw - 1.5, 44);
    }
    ctx.clip();
    for (let i = 0; i < 210; i++) {
      const t = r();
      const hx = cx + (t - 0.5) * L.fw * 2.1;
      const hy = topY - 4 + r() * (hs === 2 ? 8 : 16);
      const tone = r();
      ctx.lineWidth = 0.32 + r() * 0.34;
      ctx.strokeStyle = tone < 0.5 ? rgb(darken(HC, 0.5), 0.4) : rgb(lighten(HC, 0.45), 0.34);
      ctx.beginPath(); ctx.moveTo(hx, hy);
      if (hs === 3) ctx.quadraticCurveTo(hx + 1, hy + 4, hx + 0.5, hy + 8);        // pra trás
      else if (hs === 1) { const sw = L.ax >= 0 ? 1 : -1; ctx.quadraticCurveTo(hx + sw * 1.8, hy + 4, hx + sw * 3.4 + (t - 0.5) * 1.6, hy + 7); } // franja varrida de lado (diagonal, não barras)
      else ctx.quadraticCurveTo(hx + (t - 0.5) * 4, hy + 3, hx + (t - 0.5) * 7, hy + 5.5);
      ctx.stroke();
    }
    if (L.fem) {
      for (let i = 0; i < 60; i++) {
        const sgn = r() < 0.5 ? -1 : 1;
        const hx = cx + sgn * (L.fw + r() * 3.4 - 1.5);
        const hy = 42 + r() * 34;
        ctx.lineWidth = 0.5 + r() * 0.35;
        ctx.strokeStyle = r() < 0.5 ? rgb(darken(HC, 0.42), 0.5) : rgb(lighten(HC, 0.32), 0.38);
        ctx.beginPath(); ctx.moveTo(hx, hy);
        ctx.quadraticCurveTo(hx + sgn * 1.2, hy + 6, hx + sgn * 0.5, hy + 12); ctx.stroke();
      }
    }
    // brilho de lâmpada no topo (banda especular do cabelo, no lado da luz)
    soft(ctx, cx - L.fw * 0.35, topY + 1, L.fw * 0.5, 2.6, rgb(lighten(HC, 0.55), 0.4), 1.6);
    ctx.restore();
    // FIOS SOLTOS (flyaways): agora SEM recorte — quebram a silhueta limpa
    // demais (capacete). Poucos, finos, saindo da coroa e das bordas. É o que
    // separa "peruca renderizada" de cabelo de gente.
    ctx.lineCap = 'round';
    const nFly = L.fem ? 26 : 16;
    for (let i = 0; i < nFly; i++) {
      const edge = r();
      let hx, hy, dirx, dl;
      if (edge < 0.45) {                       // coroa / topo: sobem e caem
        hx = cx + (r() - 0.5) * L.fw * 1.7; hy = topY - 3 + r() * 2; dirx = (r() - 0.5) * 3; dl = 3 + r() * 4;
      } else {                                  // laterais: escapam pros lados
        const sgn = r() < 0.5 ? -1 : 1;
        hx = cx + sgn * (L.fw - 0.5); hy = topY + 6 + r() * (L.fem ? 40 : 14); dirx = sgn * (1.5 + r() * 3); dl = 4 + r() * 6;
      }
      ctx.lineWidth = 0.22 + r() * 0.26;
      ctx.strokeStyle = rgb(r() < 0.5 ? darken(HC, 0.35) : lighten(HC, 0.3), 0.22 + r() * 0.2);
      ctx.beginPath(); ctx.moveTo(hx, hy);
      ctx.quadraticCurveTo(hx + dirx * 0.5, hy + dl * 0.4 - 1, hx + dirx + (r() - 0.5) * 2, hy + dl);
      ctx.stroke();
    }
    ctx.restore();
  }

  /* ---------- barba ----------
     A "linha da barba" natural: costeleta alta perto da orelha, DESCE pela
     bochecha (a maçã fica livre), sobe no canto da boca até o bigode sobre o
     lábio; o contorno externo segue mandíbula → queixo. Preenchida com
     gradiente (topo pega luz), fios direcionais recortados, e os LÁBIOS
     reaparecem por cima (a barba se abre na boca). */
  if (f.beard === 1) {
    ctx.save();
    const mw2 = L.mouthW, ax2 = L.ax;
    const beardPath = () => {
      ctx.beginPath();
      ctx.moveTo(cx - L.fw + 0.5, L.cheekY - 1);                                        // costeleta esq
      ctx.quadraticCurveTo(cx - L.fw + 1, L.mouthY - 2.5, cx - mw2 - 1.5, L.mouthY - 1.5); // linha da barba na bochecha
      ctx.quadraticCurveTo(cx - mw2 * 0.4, L.mouthY - 3.6, cx, L.mouthY - 3.2);           // bigode (metade esq)
      ctx.quadraticCurveTo(cx + mw2 * 0.4, L.mouthY - 3.6, cx + mw2 + 1.5, L.mouthY - 1.5); // bigode (metade dir)
      ctx.quadraticCurveTo(cx + L.fw - 1 + ax2, L.mouthY - 2.5, cx + L.fw - 0.5 + ax2, L.cheekY - 1); // costeleta dir
      ctx.quadraticCurveTo(cx + L.jw + 0.5 + ax2, L.gonialY + 1, cx + L.chinW + 1 + ax2, L.chinY - 1); // mandíbula dir
      ctx.quadraticCurveTo(cx, L.chinY + 6, cx - L.chinW - 1, L.chinY - 1);               // queixo
      ctx.quadraticCurveTo(cx - L.jw - 0.5, L.gonialY + 1, cx - L.fw + 0.5, L.cheekY - 1); // mandíbula esq
      ctx.closePath();
    };
    beardPath();
    const bg = ctx.createLinearGradient(0, L.cheekY, 0, L.chinY + 6);
    bg.addColorStop(0, rgb(darken(HC, 0.04), 0.9));
    bg.addColorStop(1, rgb(darken(HC, 0.26), 0.96));
    ctx.fillStyle = bg; ctx.fill();
    ctx.save(); beardPath(); ctx.clip();
    // luz partida na barba (lado da lâmpada mais claro)
    const bsplit = ctx.createLinearGradient(cx - L.fw, 0, cx + L.fw, 0);
    bsplit.addColorStop(0, rgb(lighten(HC, 0.3), 0.22));
    bsplit.addColorStop(0.5, 'rgba(0,0,0,0)');
    bsplit.addColorStop(1, 'rgba(0,0,0,.32)');
    ctx.fillStyle = bsplit; ctx.fillRect(cx - L.fw, L.cheekY - 3, L.fw * 2, L.chinY - L.cheekY + 12);
    // fios: densos, finos, apontando pra baixo com leve leque
    for (let i = 0; i < 170; i++) {
      const bx = cx + (r() - 0.5) * L.jw * 2.1;
      const by2 = L.cheekY - 1 + r() * (L.chinY - L.cheekY + 6);
      const fan = (bx - cx) * 0.06;
      ctx.strokeStyle = bx < cx ? rgb(lighten(HC, 0.34), 0.32) : rgb(darken(HC, 0.5), 0.42);
      ctx.lineWidth = 0.35 + r() * 0.25;
      ctx.beginPath(); ctx.moveTo(bx, by2);
      ctx.quadraticCurveTo(bx + fan, by2 + 1.6, bx + fan * 1.6 + (r() - 0.5) * 0.8, by2 + 3 + r() * 1.6);
      ctx.stroke();
    }
    ctx.restore();
    // LÁBIOS reaparecem (a barba se abre na boca)
    const lipTone2 = mix(SH, [128, 66, 56], L.fem ? 0.5 : 0.35);
    ctx.fillStyle = rgb(darken(lipTone2, 0.15), 0.7);
    ctx.beginPath();
    ctx.moveTo(cx - mw2 * 0.55, L.mouthY + 0.4);
    ctx.quadraticCurveTo(cx, L.mouthY + 1.1, cx + mw2 * 0.55, L.mouthY + 0.4);
    ctx.quadraticCurveTo(cx, L.mouthY + 2.8, cx - mw2 * 0.55, L.mouthY + 0.4);
    ctx.closePath(); ctx.fill();
    soft(ctx, cx - 0.5, L.mouthY + 1.4, mw2 * 0.4, 0.7, 'rgba(255,238,218,.32)', 0.8);
    ctx.strokeStyle = 'rgba(22,13,9,.85)'; ctx.lineWidth = 0.7;
    ctx.beginPath(); ctx.moveTo(cx - mw2 * 0.62, L.mouthY);
    ctx.quadraticCurveTo(cx, L.mouthY + 0.5, cx + mw2 * 0.62, L.mouthY); ctx.stroke();
    ctx.restore();
  } else if (f.beard === 2) {
    /* bigode preenchido (não só fios soltos) */
    ctx.save();
    ctx.fillStyle = rgb(darken(HC, 0.1), 0.92);
    ctx.beginPath();
    ctx.moveTo(cx - L.mouthW - 0.5, L.mouthY - 1);
    ctx.quadraticCurveTo(cx - L.mouthW * 0.4, L.mouthY - 3.4, cx, L.mouthY - 3);
    ctx.quadraticCurveTo(cx + L.mouthW * 0.4, L.mouthY - 3.4, cx + L.mouthW + 0.5, L.mouthY - 1);
    ctx.quadraticCurveTo(cx + L.mouthW * 0.5, L.mouthY - 0.6, cx, L.mouthY - 1);
    ctx.quadraticCurveTo(cx - L.mouthW * 0.5, L.mouthY - 0.6, cx - L.mouthW - 0.5, L.mouthY - 1);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = rgb(darken(HC, 0.3), 0.7); ctx.lineWidth = 0.35;
    for (let i = 0; i < 26; i++) {
      const t = i / 25, bx = cx - L.mouthW + t * L.mouthW * 2;
      const by2 = L.mouthY - 2.8 - Math.sin(t * 3.14) * 1.1;
      ctx.beginPath(); ctx.moveTo(bx, by2); ctx.lineTo(bx + (t - 0.5) * 1.2, by2 + 2.2); ctx.stroke();
    }
    ctx.restore();
  }

  /* óculos */
  if (f.glasses) {
    const gy = L.eyeY, gr = 5.6;
    ctx.strokeStyle = 'rgba(22,20,16,.92)'; ctx.lineWidth = 0.8;
    for (const sgn of [-1, 1]) {
      const gx = cx + sgn * L.eyeDX;
      ctx.beginPath(); ctx.arc(gx, gy, gr, 0, 6.29); ctx.stroke();
      // reflexo diagonal da lente
      ctx.save();
      ctx.beginPath(); ctx.arc(gx, gy, gr - 0.5, 0, 6.29); ctx.clip();
      ctx.strokeStyle = 'rgba(255,250,235,.16)'; ctx.lineWidth = 2.2;
      ctx.beginPath(); ctx.moveTo(gx - 4, gy + 4); ctx.lineTo(gx + 3, gy - 4.5); ctx.stroke();
      ctx.restore();
      ctx.strokeStyle = 'rgba(22,20,16,.92)'; ctx.lineWidth = 0.7;
      ctx.beginPath(); ctx.moveTo(gx + sgn * gr, gy - 0.5);
      ctx.lineTo(cx + sgn * (L.fw - 0.4), 51); ctx.stroke(); // hastes
    }
    ctx.beginPath(); ctx.moveTo(cx - L.eyeDX + gr, gy - 1);
    ctx.quadraticCurveTo(cx, gy - 2.4, cx + L.eyeDX - gr, gy - 1); ctx.stroke();
  }

  /* brincos */
  if (f.earring && f.hat !== 2) {
    for (const sgn of [-1, 1]) {
      const exx = cx + sgn * (L.fw + 0.8);
      ctx.fillStyle = 'rgb(150,128,74)';
      ctx.beginPath(); ctx.arc(exx, 57.5, 0.9, 0, 6.29); ctx.fill();
      ctx.fillStyle = 'rgba(255,246,214,.9)';
      ctx.beginPath(); ctx.arc(exx - 0.25, 57.2, 0.3, 0, 6.29); ctx.fill();
    }
  }

  /* chapéu (m) / lenço (f) */
  if (f.hat === 1) {
    const bw = L.fw + 5;
    ctx.fillStyle = 'rgb(28,24,18)';
    ctx.beginPath(); ctx.ellipse(cx, 29, bw, 3.4, 0, 0, 6.29); ctx.fill(); // aba
    ctx.beginPath();
    ctx.moveTo(cx - L.fw * 0.86, 29);
    ctx.bezierCurveTo(cx - L.fw * 0.9, 13, cx - L.fw * 0.4, 9.5, cx, 9.5);
    ctx.bezierCurveTo(cx + L.fw * 0.4, 9.5, cx + L.fw * 0.9, 13, cx + L.fw * 0.86, 29);
    ctx.closePath(); ctx.fill();
    // vinco da copa + fita + luz
    ctx.fillStyle = 'rgb(16,13,10)';
    ctx.fillRect(cx - L.fw * 0.86, 24.4, L.fw * 1.72, 3.2);
    soft(ctx, cx - 6, 14, 8, 3, 'rgba(255,244,220,.10)', 2);
    soft(ctx, cx, 33, L.fw * 0.9, 2.6, 'rgba(6,5,4,.5)', 2); // sombra da aba na testa
  } else if (f.hat === 2) {
    ctx.fillStyle = 'rgb(96,70,58)';
    ctx.beginPath();
    ctx.moveTo(cx - L.fw - 2.5, 55);
    ctx.bezierCurveTo(cx - L.fw - 4, 17, cx - L.fw * 0.4, 12, cx, 12);
    ctx.bezierCurveTo(cx + L.fw * 0.4, 12, cx + L.fw + 4, 17, cx + L.fw + 2.5, 55);
    ctx.quadraticCurveTo(cx + L.fw + 2, 66, cx + 7, 74);
    ctx.lineTo(cx + 5, 70);
    ctx.quadraticCurveTo(cx + L.fw - 1, 58, cx + L.fw - 1, 42);
    ctx.quadraticCurveTo(cx, 24, cx - L.fw + 1, 42);
    ctx.quadraticCurveTo(cx - L.fw + 1, 58, cx - 5, 70);
    ctx.lineTo(cx - 7, 74);
    ctx.quadraticCurveTo(cx - L.fw - 2, 66, cx - L.fw - 2.5, 55);
    ctx.closePath(); ctx.fill();
    // dobras do tecido
    ctx.strokeStyle = 'rgba(40,26,20,.5)'; ctx.lineWidth = 0.6;
    for (let i = 0; i < 5; i++) {
      const t = i / 4;
      ctx.beginPath();
      ctx.moveTo(cx - L.fw + 2 + t * 6, 20 + t * 8);
      ctx.quadraticCurveTo(cx - L.fw + t * 8, 40, cx - L.fw + 1 + t * 5, 58 + t * 6);
      ctx.stroke();
    }
    soft(ctx, cx - 5, 17, 9, 3.4, 'rgba(255,240,214,.14)', 2.2);
    // nó sob o queixo
    ctx.fillStyle = 'rgb(82,58,48)';
    ctx.beginPath(); ctx.ellipse(cx - 3, 82, 3.2, 2.2, 0.5, 0, 6.29); ctx.fill();
  } else if (f.hat === 3) {
    /* BONÉ MILITAR de pala (peaked cap) — para os uniformizados */
    const uc = f.uniformColor || [58, 66, 48], utrim = f.uniformTrim || [150, 40, 34];
    const bw = L.fw + 3.5;
    // pala (aba dura, escura, brilhante)
    ctx.fillStyle = 'rgb(18,16,13)';
    ctx.beginPath(); ctx.ellipse(cx, 30.5, bw * 0.82, 3, 0, 0.05, 3.14 - 0.05); ctx.fill();
    ctx.fillStyle = 'rgba(80,80,74,.5)'; // brilho da pala
    ctx.beginPath(); ctx.ellipse(cx - 3, 30, bw * 0.5, 1, 0, 3.2, 6.2); ctx.fill();
    // faixa (cinta) da cor do vivo
    ctx.fillStyle = rgb(darken(utrim, 0.1));
    ctx.beginPath(); ctx.moveTo(cx - bw * 0.8, 27); ctx.lineTo(cx + bw * 0.8, 27); ctx.lineTo(cx + bw * 0.78, 24); ctx.lineTo(cx - bw * 0.78, 24); ctx.closePath(); ctx.fill();
    // copa (crown) alta e um pouco caída à frente
    ctx.fillStyle = rgb(uc);
    ctx.beginPath();
    ctx.moveTo(cx - bw * 0.78, 24.5);
    ctx.bezierCurveTo(cx - bw * 0.9, 14, cx - bw * 0.5, 10.5, cx, 10.5);
    ctx.bezierCurveTo(cx + bw * 0.55, 10.5, cx + bw * 0.95, 14, cx + bw * 0.82, 24.5);
    ctx.closePath(); ctx.fill();
    // modelagem da copa (luz esquerda, sombra direita)
    const cpg = ctx.createLinearGradient(cx - bw, 0, cx + bw, 0);
    cpg.addColorStop(0, 'rgba(235,238,210,.14)'); cpg.addColorStop(0.5, 'rgba(0,0,0,0)'); cpg.addColorStop(1, 'rgba(0,0,0,.4)');
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(cx - bw * 0.78, 24.5); ctx.bezierCurveTo(cx - bw * 0.9, 14, cx - bw * 0.5, 10.5, cx, 10.5);
    ctx.bezierCurveTo(cx + bw * 0.55, 10.5, cx + bw * 0.95, 14, cx + bw * 0.82, 24.5); ctx.closePath(); ctx.clip();
    ctx.fillStyle = cpg; ctx.fillRect(cx - bw, 9, bw * 2, 18);
    ctx.restore();
    // emblema: estrela na frente da cinta
    ctx.save(); ctx.fillStyle = 'rgba(244,232,180,.95)';
    ctx.beginPath();
    for (let k = 0; k < 5; k++) {
      const a1 = -Math.PI / 2 + k * 2.513, a2 = a1 + 1.2566, R = 2;
      ctx.lineTo(cx + Math.cos(a1) * R, 25.2 + Math.sin(a1) * R);
      ctx.lineTo(cx + Math.cos(a2) * R * 0.42, 25.2 + Math.sin(a2) * R * 0.42);
    }
    ctx.closePath(); ctx.fill(); ctx.restore();
    soft(ctx, cx, 32.5, L.fw * 0.85, 2.4, 'rgba(6,5,4,.5)', 2); // sombra da pala na testa
  }

  /* RIM / LUZ DE SEPARAÇÃO: um fio de luz na borda de SOMBRA (direita) do
     crânio→maçã→maxilar. Descola a cabeça do fundo preto e faz a forma "virar".
     Fria (kicker por trás), contrastando com a key morna da esquerda. Mora
     DENTRO da silhueta (clip) pra virar aresta de luz, não halo. */
  if (f.hat !== 2) {
    const a = L.ax, gPull = 3 + L.jawSquare * 5;
    ctx.save();
    headPath(ctx, L); ctx.clip();
    try { ctx.filter = `blur(${(0.75 * F_SCALE * 0.55).toFixed(1)}px)`; } catch (e) {}
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.strokeStyle = 'rgba(150,178,214,0.5)'; ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx + L.crownW * 0.5, 18.4);
    ctx.quadraticCurveTo(cx + L.crownW * 0.55, 18.4, cx + L.crownW + a, 19.5);
    ctx.quadraticCurveTo(cx + L.templeW + 0.2 + a, 24, cx + L.templeW + a, 33);
    ctx.quadraticCurveTo(cx + L.fw + 0.4 + a, L.cheekY - 8, cx + L.fw - 0.3 + a, L.cheekY);
    ctx.lineTo(cx + L.jw + a, L.gonialY);
    ctx.quadraticCurveTo(cx + L.jw - 0.4 + a, L.gonialY + gPull, cx + L.chinW + 0.6 + a, L.chinY - 3.5);
    ctx.stroke();
    // um segundo fio, mais fino e brilhante, no núcleo da aresta (maçã→maxilar)
    ctx.strokeStyle = 'rgba(196,214,236,0.4)'; ctx.lineWidth = 0.7;
    ctx.beginPath();
    ctx.moveTo(cx + L.fw + 0.2 + a, L.cheekY - 6);
    ctx.quadraticCurveTo(cx + L.fw - 0.2 + a, L.cheekY, cx + L.jw + a, L.gonialY);
    ctx.stroke();
    ctx.restore();
  }

  ctx.restore(); // fim da inclinação da cabeça
  // MÃOS NO BALCÃO (só no busto ao vivo do guichê): as mãos da pessoa apoiadas
  // na beira da bancada, à frente do casaco. Dá presença corporal — a pessoa
  // TEM braços — sem sair do enquadramento de busto. Precisa de opts.paintH>120.
  if (opts.counterHands) {
    const hy = 126, foreCol = rgb(mix(SK, SH, 0.35)), skC = rgb(SK), shC = rgb(SH, 0.5);
    ctx.save();
    // BEIRA DO BALCÃO: uma faixa horizontal onde as mãos se apoiam
    ctx.fillStyle = 'rgba(30,26,20,.9)'; ctx.fillRect(0, hy + 3, 100, 12);
    ctx.fillStyle = 'rgba(200,190,160,.10)'; ctx.fillRect(0, hy + 3, 100, 1.2);            // aresta iluminada da bancada
    ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.fillRect(0, hy + 1.5, 100, 2);                    // sombra de contato sob as mãos
    const coatC = opts.coat || (f.coat && !f.uniform ? (Array.isArray(f.coat) ? rgb(f.coat) : f.coat) : 'rgb(45,46,38)');
    const hand = (hx, s) => {
      // MANGA DO CASACO: sai do ombro e afunila até o punho — braço VESTIDO,
      // não um tubo de pele. Com sombra na lateral e punho (cuff) na base.
      ctx.fillStyle = coatC;
      ctx.beginPath();
      ctx.moveTo(hx - s * 17, 93);                                     // ombro
      ctx.quadraticCurveTo(hx - s * 14, 106, hx - s * 5, hy - 7);      // lado de fora
      ctx.lineTo(hx + s * 4.6, hy - 7);
      ctx.quadraticCurveTo(hx - s * 1, 104, hx - s * 9, 92);           // lado de dentro
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(0,0,0,.24)';                               // sombra na lateral da manga
      ctx.beginPath();
      ctx.moveTo(hx + s * 4.6, hy - 7);
      ctx.quadraticCurveTo(hx - s * 1, 104, hx - s * 9, 92);
      ctx.lineTo(hx - s * 6.5, 92);
      ctx.quadraticCurveTo(hx + s * 1, 104, hx + s * 2, hy - 7);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillRect(hx - 5.6, hy - 9.4, 11.2, 2.6);  // PUNHO da manga
      ctx.fillStyle = 'rgba(236,240,246,.08)'; ctx.fillRect(hx - 5.6, hy - 9.4, 11.2, 1);
      // PULSO de pele entre punho e mão
      ctx.fillStyle = skC; ctx.fillRect(hx - 4, hy - 7, 8, 4);
      // DORSO da mão pousado na beira
      ctx.fillStyle = skC;
      ctx.beginPath();
      ctx.moveTo(hx - 7, hy - 3.5); ctx.quadraticCurveTo(hx - 8, hy + 1, hx - 6.5, hy + 1.6);
      ctx.lineTo(hx + 6.5, hy + 1.6); ctx.quadraticCurveTo(hx + 8, hy + 1, hx + 7, hy - 3.5);
      ctx.quadraticCurveTo(hx, hy - 5.5, hx - 7, hy - 3.5); ctx.closePath(); ctx.fill();
      // 4 DEDOS curvando sobre a aresta (afilando pro mindinho)
      ctx.lineCap = 'round';
      for (let i = 0; i < 4; i++) {
        const fx = hx + (i - 1.5) * 3.1 * s;
        const fw = 2.5 - Math.abs(i - 1.2) * 0.25;                     // indicador mais grosso
        ctx.strokeStyle = skC; ctx.lineWidth = fw;
        ctx.beginPath(); ctx.moveTo(fx, hy); ctx.quadraticCurveTo(fx + s * .3, hy + 3.4, fx + s * .6, hy + 5.4 - i * .35); ctx.stroke();
      }
      // POLEGAR: pra dentro, mais grosso e curto
      ctx.strokeStyle = skC; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(hx - s * 6.5, hy - 2); ctx.quadraticCurveTo(hx - s * 8, hy + 1.5, hx - s * 5.5, hy + 3.4); ctx.stroke();
      // NÓS dos dedos (3 pontinhos de luz) + vincos + sombra sob a mão
      ctx.fillStyle = rgb(lighten(SK, 0.16), 0.55);
      for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(hx + (i - 1) * 3.1 * s, hy - 2.4, 0.9, 0, 6.29); ctx.fill(); }
      ctx.strokeStyle = shC; ctx.lineWidth = 0.6;
      for (let i = 0; i < 3; i++) { const fx = hx + (i - 1) * 3.1 * s + s * 1.55; ctx.beginPath(); ctx.moveTo(fx, hy + .4); ctx.lineTo(fx + s * .4, hy + 4); ctx.stroke(); }
      ctx.strokeStyle = rgb(darken(SH, 0.2), 0.4); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(hx - 6, hy + 1.8); ctx.lineTo(hx + 6, hy + 1.8); ctx.stroke();
    };
    hand(30, 1); hand(70, -1);
    ctx.restore();
  }
  // ACOMPANHANTE: bebê de colo ou criança agarrada ao lado — na altura do
  // peito, por cima do busto (não tomba com a cabeça). Famílias na fronteira.
  if (opts.companion) paintCompanion(ctx, opts.companion);
}
function mwSafe(L) { return Math.max(6, L.mouthW * 0.9); }
/* acompanhante no guichê (bebê no colo / criança ao lado do adulto) */
function paintCompanion(ctx, comp) {
  const anom = comp.anom || {};
  const alien = !!(anom.slitPupil || anom.blackSclera);
  let sk = comp.feat ? F_SKIN[comp.feat.skin % F_SKIN.length].b : [222, 186, 160];
  let sh = comp.feat ? F_SKIN[comp.feat.skin % F_SKIN.length].s : [150, 110, 90];
  if (anom.skinShift) { const tgt = [72, 116, 176]; sk = mix(sk, tgt, anom.skinShift); sh = mix(sh, darken(tgt, 0.4), anom.skinShift); }
  const skC = rgb(sk), shC = rgb(sh), skLit = rgb(lighten(sk, 0.14));
  const hc = comp.feat ? rgb(F_HAIR[comp.feat.hair % F_HAIR.length]) : 'rgb(58,42,30)';
  const hcD = comp.feat ? rgb(darken(F_HAIR[comp.feat.hair % F_HAIR.length], 0.3)) : 'rgb(40,28,20)';
  const sclera = anom.blackSclera ? 'rgb(16,14,18)' : 'rgb(244,236,220)';
  const pupilC = anom.blackSclera ? 'rgb(4,3,6)' : 'rgb(30,20,14)';
  let R = comp.seed || 1; const rnd = () => { R = (R * 48271) % 2147483647; return R / 2147483647; };
  // par de olhos infantis, com direção do olhar (gx,gy), abertura (lid) e sobrancelha (brow)
  const eyes = (ex, ey, s, gx, gy, lid, brow) => {
    gx = gx || 0; gy = gy || 0; lid = lid == null ? 1 : lid;
    for (const side of [-1, 1]) {
      const cx0 = ex + side * 2.9 * s;
      // órbita clara
      ctx.fillStyle = sclera; ctx.beginPath(); ctx.ellipse(cx0, ey, 2.0 * s, 1.7 * s * lid, 0, 0, 6.29); ctx.fill();
      // íris/pupila grande (olho de criança) na direção do olhar
      const ix = cx0 + gx * 0.9, iy = ey + gy * 0.8;
      ctx.fillStyle = pupilC;
      if (anom.slitPupil) { ctx.save(); ctx.translate(ix, iy); ctx.scale(0.42, 2.0); ctx.beginPath(); ctx.arc(0, 0, 1.3 * s, 0, 6.29); ctx.fill(); ctx.restore(); }
      else { ctx.beginPath(); ctx.arc(ix, iy, 1.35 * s * (0.6 + lid * 0.4), 0, 6.29); ctx.fill(); }
      if (!alien) { ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.beginPath(); ctx.arc(ix - 0.5 * s, iy - 0.5 * s, 0.45 * s, 0, 6.29); ctx.fill(); } // brilho
      // pálpebra superior (fecha por lid)
      if (lid < 0.98) { ctx.fillStyle = skC; ctx.fillRect(cx0 - 2.2 * s, ey - 2 * s, 4.4 * s, 2 * s * (1 - lid) + 0.3); }
      // sobrancelha
      if (brow) { ctx.strokeStyle = hcD; ctx.lineWidth = 0.7 * s; ctx.beginPath(); const by = ey - 2.6 * s + (brow === 'worry' ? side * 0.6 : 0); ctx.moveTo(cx0 - 1.8 * s, by + (brow === 'worry' ? 0.6 : 0)); ctx.lineTo(cx0 + 1.8 * s, by - (brow === 'up' ? 0.5 : 0)); ctx.stroke(); }
    }
  };

  if (comp.kind === 'baby') {
    ctx.save();
    // braços do adulto embalando (dois antebraços em concha)
    ctx.fillStyle = 'rgba(16,16,12,.96)';
    ctx.beginPath(); ctx.moveTo(22, 110); ctx.quadraticCurveTo(50, 126, 80, 110); ctx.lineTo(82, 124); ctx.lineTo(20, 124); ctx.closePath(); ctx.fill();
    ctx.translate(50, 102); ctx.rotate(-0.22);
    // COBERTOR enrolado (cocoon) — corpo do bebê
    const blk = comp.blanket || '#7a6a50';
    const bg = ctx.createLinearGradient(-16, -14, 14, 14);
    bg.addColorStop(0, blk); bg.addColorStop(1, 'rgba(0,0,0,.5)');
    ctx.fillStyle = bg;
    ctx.beginPath(); ctx.moveTo(-14, 12); ctx.quadraticCurveTo(-19, -4, -9, -11); ctx.quadraticCurveTo(0, -15, 9, -11); ctx.quadraticCurveTo(19, -4, 14, 12); ctx.quadraticCurveTo(0, 17, -14, 12); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,.28)'; ctx.lineWidth = 0.7;
    ctx.beginPath(); ctx.moveTo(-9, 0); ctx.quadraticCurveTo(0, 9, 11, 3); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-8, 6); ctx.quadraticCurveTo(0, 12, 9, 8); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,246,220,.08)'; ctx.beginPath(); ctx.moveTo(-11, -6); ctx.quadraticCurveTo(0, -12, 11, -6); ctx.stroke();
    // CABEÇA grande e redonda (bebê = cabeção)
    const hy = -6;
    ctx.fillStyle = skC; ctx.beginPath(); ctx.arc(0, hy, 8.6, 0, 6.29); ctx.fill();
    ctx.beginPath(); ctx.ellipse(0, hy + 3, 7.8, 6.6, 0, 0, Math.PI); ctx.fill(); // bochechas gordas
    ctx.fillStyle = shC; ctx.globalAlpha = 0.32; ctx.beginPath(); ctx.arc(2.2, hy, 8.6, Math.PI * 1.66, Math.PI * 0.42); ctx.fill(); ctx.globalAlpha = 1;
    soft(ctx, -3.4, hy - 3.5, 3, 2.4, 'rgba(255,246,224,.5)', 1.4); // testa na luz
    // bochechas coradas
    soft(ctx, -3.6, hy + 3.6, 2.2, 1.5, 'rgba(228,120,104,.28)', 1);
    soft(ctx, 3.6, hy + 3.6, 2.2, 1.5, 'rgba(228,120,104,.28)', 1);
    // TOUCA ou tufo de cabelo
    if (comp.bonnet) {
      ctx.fillStyle = rgb(darken(toRGB(blk), 0.15));
      ctx.beginPath(); ctx.arc(0, hy - 0.5, 9.4, Math.PI * 1.02, Math.PI * 1.98); ctx.fill();
      ctx.beginPath(); ctx.moveTo(-9.2, hy - 1); ctx.quadraticCurveTo(-10, hy + 6, -6.5, hy + 8); ctx.lineTo(-6.5, hy + 4); ctx.quadraticCurveTo(-8.4, hy + 2, -7.8, hy - 1); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,.2)'; ctx.lineWidth = 0.6; ctx.beginPath(); ctx.arc(0, hy - 0.5, 9, Math.PI * 1.06, Math.PI * 1.94); ctx.stroke();
    } else {
      ctx.strokeStyle = hc; ctx.lineWidth = 0.5;
      for (let i = 0; i < 7; i++) { const a = Math.PI * (1.15 + i * 0.1); ctx.beginPath(); ctx.moveTo(Math.cos(a) * 7, hy + Math.sin(a) * 7); ctx.quadraticCurveTo(Math.cos(a) * 8.5, hy + Math.sin(a) * 8.5 - 1, Math.cos(a) * 8 + (rnd() - 0.5), hy + Math.sin(a) * 8.5 - 2.5); ctx.stroke(); }
    }
    // OLHOS (dorme = fechados com cílios; acordado/alienígena = abertos grandes)
    if (comp.asleep && !alien) {
      ctx.strokeStyle = 'rgba(40,26,18,.85)'; ctx.lineWidth = 0.7;
      for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(s * 4.2, hy + 0.4); ctx.quadraticCurveTo(s * 2.6, hy + 1.8, s * 1.2, hy + 0.6); ctx.stroke(); }
    } else {
      eyes(0, hy + 0.6, 0.92, 0, alien ? 0 : 0.3, 1, null);
    }
    // narizinho + boca
    ctx.fillStyle = shC; ctx.globalAlpha = 0.5; ctx.beginPath(); ctx.arc(0, hy + 3, 0.9, 0, 6.29); ctx.fill(); ctx.globalAlpha = 1;
    ctx.strokeStyle = 'rgba(150,70,60,.7)'; ctx.lineWidth = 0.7;
    ctx.beginPath();
    if (alien) { ctx.moveTo(-1.8, hy + 5.4); ctx.lineTo(1.8, hy + 5.4); } // linha reta, errada
    else { ctx.arc(0, hy + 4.4, 1.6, 0.2, Math.PI - 0.2); } // boquinha
    ctx.stroke();
    // punho pra fora do cobertor
    ctx.fillStyle = skC; ctx.beginPath(); ctx.arc(-10, 4, 2.6, 0, 6.29); ctx.fill();
    ctx.fillStyle = shC; ctx.globalAlpha = 0.3; ctx.beginPath(); ctx.arc(-9.2, 4, 2.6, Math.PI * 1.7, Math.PI * 0.4); ctx.fill(); ctx.globalAlpha = 1;
    ctx.restore();
  } else {
    // CRIANÇA agarrada ao lado — cabeça grande, expressão conforme o humor
    const side = comp.side || -1;
    const x0 = side < 0 ? 21 : 79, y0 = 108;
    // humor → olhar (gx,gy), abertura, sobrancelha, boca
    const inward = -side; // olhar pro adulto = pra dentro da tela
    let gx = 0, gy = -0.8, lid = 1, brow = null, mouth = 'neutral';
    if (!alien) {
      switch (comp.mood) {
        case 'shy': gx = side * 1.2; gy = 0.5; brow = null; mouth = 'small'; break;
        case 'curious': gy = -1.1; brow = 'up'; mouth = 'o'; break;
        case 'scared': gy = -0.6; brow = 'worry'; mouth = 'frown'; break;
        case 'tired': lid = 0.55; gy = 0; mouth = 'neutral'; break;
        case 'clingy': gx = inward * 1.3; gy = -0.3; mouth = 'neutral'; break;
        default: gy = -0.8;
      }
    } else { gx = 0; gy = 0; mouth = 'flat'; }
    ctx.save();
    // casaquinho subindo do rodapé
    ctx.fillStyle = comp.coat || 'rgb(70,84,98)';
    ctx.beginPath(); ctx.moveTo(x0 - 10, 123); ctx.quadraticCurveTo(x0 - 8.5, 112, x0, 111); ctx.quadraticCurveTo(x0 + 8.5, 112, x0 + 10, 123); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255,246,220,.06)'; ctx.fillRect(x0 - 10, 111.5, 20, 1);
    if (comp.headwear === 'scarf') { ctx.fillStyle = 'rgba(120,60,52,.8)'; ctx.fillRect(x0 - 7, y0 + 5, 14, 4); }
    // sombra de contato do adulto + cabeça
    soft(ctx, x0 + side * 3, y0 + 1, 7, 8, 'rgba(0,0,0,.45)', 3);
    ctx.fillStyle = skC; ctx.beginPath(); ctx.arc(x0, y0, 8, 0, 6.29); ctx.fill();
    ctx.beginPath(); ctx.ellipse(x0, y0 + 3, 6.4, 5.6, 0, 0, Math.PI); ctx.fill(); // bochechas
    ctx.fillStyle = shC; ctx.globalAlpha = 0.34; ctx.beginPath(); ctx.arc(x0 + side * 1.8, y0, 8, side < 0 ? Math.PI * 1.66 : Math.PI * 0.34, side < 0 ? Math.PI * 0.42 : Math.PI * 1.34, side > 0); ctx.fill(); ctx.globalAlpha = 1;
    soft(ctx, x0 - side * 2.4, y0 - 3, 2.6, 2, 'rgba(255,246,224,.4)', 1.4);
    // CABELO com franja / penteado (varia) + touca
    ctx.fillStyle = hc;
    if (comp.hairStyle === 1) { // franjinha reta
      ctx.beginPath(); ctx.arc(x0, y0 - 1, 8.4, Math.PI, 0); ctx.lineTo(x0 + 8, y0 + 1); ctx.quadraticCurveTo(x0, y0 - 1.5, x0 - 8, y0 + 1); ctx.closePath(); ctx.fill();
    } else { // repartido
      ctx.beginPath(); ctx.arc(x0, y0 - 1, 8.4, Math.PI * 1.02, Math.PI * 2.02); ctx.fill();
      ctx.beginPath(); ctx.moveTo(x0 - 8, y0 - 1); ctx.quadraticCurveTo(x0 - 3, y0 - 5, x0 + 2, y0 - 3); ctx.quadraticCurveTo(x0 - 2, y0 - 1, x0 - 8, y0 + 1); ctx.closePath(); ctx.fill();
    }
    if (comp.headwear === 'bonnet') { ctx.fillStyle = 'rgba(180,170,140,.9)'; ctx.beginPath(); ctx.arc(x0, y0 - 2, 8.8, Math.PI * 1.05, Math.PI * 1.95); ctx.fill(); }
    else if (comp.headwear === 'cap') { ctx.fillStyle = '#3a3830'; ctx.beginPath(); ctx.arc(x0, y0 - 2, 8.6, Math.PI, 0); ctx.fill(); ctx.fillRect(x0 - 9, y0 - 2.4, 12, 1.8); }
    else if (comp.headwear === 'bow') { ctx.fillStyle = 'rgba(150,60,54,.9)'; ctx.beginPath(); ctx.moveTo(x0 - 6, y0 - 7); ctx.lineTo(x0 - 1, y0 - 8.5); ctx.lineTo(x0 - 1, y0 - 5.5); ctx.closePath(); ctx.moveTo(x0 - 1, y0 - 8.5); ctx.lineTo(x0 + 4, y0 - 7); ctx.lineTo(x0 - 1, y0 - 5.5); ctx.closePath(); ctx.fill(); }
    // sardas
    if (comp.freckles && !alien) { ctx.fillStyle = rgb(darken(sk, 0.22), 0.5); for (let i = 0; i < 5; i++) ctx.fillRect(x0 - 3.5 + rnd() * 7, y0 + 1.5 + rnd() * 2.5, 0.7, 0.7); }
    // OLHOS + expressão
    eyes(x0, y0 + 0.6, 1, gx, gy, lid, brow);
    // narizinho
    ctx.strokeStyle = shC; ctx.lineWidth = 0.5; ctx.beginPath(); ctx.moveTo(x0 - 0.5, y0 + 2.4); ctx.lineTo(x0 - 0.9, y0 + 3.6); ctx.lineTo(x0 + 0.2, y0 + 3.8); ctx.stroke();
    // BOCA por humor
    ctx.strokeStyle = alien ? 'rgba(90,120,140,.8)' : 'rgba(150,70,60,.8)'; ctx.lineWidth = 0.8; ctx.fillStyle = 'rgba(120,50,44,.5)';
    const my = y0 + 5.2; ctx.beginPath();
    if (mouth === 'o') { ctx.arc(x0, my, 1.1, 0, 6.29); ctx.fillStyle = 'rgba(80,30,26,.6)'; ctx.fill(); }
    else if (mouth === 'frown') { ctx.moveTo(x0 - 1.8, my + 0.6); ctx.quadraticCurveTo(x0, my - 0.6, x0 + 1.8, my + 0.6); ctx.stroke(); }
    else if (mouth === 'small') { ctx.moveTo(x0 - 1.2, my); ctx.lineTo(x0 + 1.2, my); ctx.stroke(); }
    else if (mouth === 'flat') { ctx.moveTo(x0 - 2, my); ctx.lineTo(x0 + 2, my); ctx.stroke(); }
    else { ctx.moveTo(x0 - 1.8, my); ctx.quadraticCurveTo(x0, my + 0.7, x0 + 1.8, my); ctx.stroke(); }
    // lágrima do assustado
    if (comp.mood === 'scared' && !alien) { ctx.fillStyle = 'rgba(180,210,230,.7)'; ctx.beginPath(); ctx.ellipse(x0 - 2.9, y0 + 2.4, 0.6, 1.1, 0, 0, 6.29); ctx.fill(); }
    ctx.restore();
  }
}

/* ============================================================
   PÓS-PROCESSAMENTO ANALÓGICO
   ============================================================ */
const BAYER4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
function analogPost(ctx, w, h, seed, o) {
  o = o || {};
  const sat = o.sat != null ? o.sat : 0.35;
  const con = o.contrast != null ? o.contrast : 1.24;
  const aberr = o.aberr != null ? o.aberr : 1;
  const bleed = o.bleed != null ? o.bleed : 0.22;
  const levels = o.levels != null ? o.levels : 12;
  const dAmp = (255 / levels) * (o.ditherAmp != null ? o.ditherAmp : 0.75);
  const scan = o.scan != null ? o.scan : 0.11;
  const grain = o.grain != null ? o.grain : 10;
  const tears = o.tears != null ? o.tears : 0;
  const vig = o.vig != null ? o.vig : 0;
  const r = faceRng(seed || 1);

  const img = ctx.getImageData(0, 0, w, h);
  const D = img.data;
  const N = w * h * 4;

  // 1) cor: dessatura, cast verde-âmbar doentio, contraste, esmaga pretos
  for (let i = 0; i < N; i += 4) {
    if (D[i + 3] === 0) continue;
    const lum = D[i] * 0.299 + D[i + 1] * 0.587 + D[i + 2] * 0.114;
    let rr = lum + (D[i] - lum) * sat;
    let gg = lum + (D[i + 1] - lum) * sat;
    let bb = lum + (D[i + 2] - lum) * sat;
    // grade âmbar-morno (pele saudável), não olive/verde-doentio: vermelho
    // domina, verde fica neutro, azul cai de leve. O cast verde ficava zumbi.
    rr *= 1.05; gg *= 0.995; bb *= 0.93;
    rr = (rr - 118) * con + 118 - 3; gg = (gg - 118) * con + 118 - 3; bb = (bb - 118) * con + 118 - 4;
    // SPLIT-TONE: sombras mornas (tungstênio), luzes levemente frias. Dá
    // profundidade cinematográfica sem mexer no grão/scanline da fita.
    const nl = lum / 255;
    const shT = nl < 0.5 ? (0.5 - nl) * 2 : 0;      // 1 no preto → 0 no meio-tom
    const hiT = nl > 0.55 ? (nl - 0.55) / 0.45 : 0; // 0 no meio → 1 no branco
    rr += shT * 8.5 - hiT * 3.0;
    gg += shT * 1.4 - hiT * 1.0;                    // menos verde na sombra (era 3.0)
    bb += shT * -5.5 + hiT * 8.0;
    D[i] = rr < 0 ? 0 : rr > 255 ? 255 : rr;
    D[i + 1] = gg < 0 ? 0 : gg > 255 ? 255 : gg;
    D[i + 2] = bb < 0 ? 0 : bb > 255 ? 255 : bb;
  }

  // 2) aberração cromática + sangramento horizontal (na cópia)
  const C = new Uint8ClampedArray(D);
  const a = Math.round(aberr);
  for (let y = 0; y < h; y++) {
    const row = y * w * 4;
    for (let x = 0; x < w; x++) {
      const i = row + x * 4;
      if (C[i + 3] === 0 && a === 0) continue;
      const xr = Math.min(w - 1, x + a), xb = Math.max(0, x - a);
      D[i] = C[row + xr * 4];
      D[i + 2] = C[row + xb * 4 + 2];
      if (bleed && x > 1) {
        const l = row + (x - 2) * 4;
        D[i] = D[i] * (1 - bleed) + C[l] * bleed;
        D[i + 1] = D[i + 1] * (1 - bleed * 0.8) + C[l + 1] * bleed * 0.8;
        D[i + 2] = D[i + 2] * (1 - bleed) + C[l + 2] * bleed;
      }
    }
  }

  // 3) dither ordenado + quantização + scanlines + grão + vinheta
  const q = 255 / (levels - 1);
  for (let y = 0; y < h; y++) {
    const dark = (y & 1) ? 1 - scan : 1;
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      if (D[i + 3] === 0) continue;
      const bd = (BAYER4[(y & 3) * 4 + (x & 3)] / 15 - 0.5) * dAmp;
      const g = (r() - 0.5) * 2 * grain;
      let vf = 1;
      if (vig) {
        const dx = (x / w - 0.5) * 2, dy = (y / h - 0.5) * 2;
        vf = 1 - Math.max(0, (Math.sqrt(dx * dx + dy * dy) - 0.62)) * vig;
      }
      for (let c = 0; c < 3; c++) {
        let v = (D[i + c] + bd + g) * dark * vf;
        v = Math.round(v / q) * q;
        D[i + c] = v < 0 ? 0 : v > 255 ? 255 : v;
      }
    }
  }
  ctx.putImageData(img, 0, 0);

  // 4) rasgos de tracking
  for (let t = 0; t < tears; t++) {
    const ty = Math.floor(r() * h * 0.9);
    const th = 2 + Math.floor(r() * 3);
    const dx = Math.floor((r() - 0.5) * 14);
    const band = ctx.getImageData(0, ty, w, th);
    ctx.putImageData(band, dx, ty);
    ctx.fillStyle = `rgba(230,228,214,${0.05 + r() * 0.08})`;
    ctx.fillRect(0, ty + th - 1, w, 1);
  }
}
/* aplica o mesmo tratamento a um canvas pronto (usado pelos rostos da casa) */
function analogPostCanvas(cv, seed, o) {
  try { analogPost(cv.getContext('2d'), cv.width, cv.height, seed || 7, o || { levels: 8, grain: 14, aberr: 1, scan: 0.14 }); } catch (e) {}
}

/* ============================================================
   RENDERS
   ============================================================ */
function renderPortraitCanvas(f, o) {
  o = o || {};
  const W = o.w || 160, H = o.h || 192;
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const hi = document.createElement('canvas');
  const S = o.paintScale || 3.2;
  hi.width = Math.round(100 * S); hi.height = Math.round((o.paintH || 120) * S);
  const hc = hi.getContext('2d');
  if (o.bg) {
    // fundo de estúdio de repartição: gradiente vertical, não chapado
    const bgy = hc.createLinearGradient(0, 0, 0, hi.height);
    bgy.addColorStop(0, o.bg); bgy.addColorStop(1, '#55534a');
    hc.fillStyle = o.bgFlat ? o.bg : bgy;
    hc.fillRect(0, 0, hi.width, hi.height);
  }
  hc.save();
  F_SCALE = S;
  hc.scale(S, S);
  if (o.zoom) { // aproxima no rosto (exame / busto do guichê)
    hc.translate(o.focusX || 50, o.focusY || 50);
    hc.scale(o.zoom, o.zoom);
    hc.translate(-(o.focusX || 50), -(o.focusY || 50));
  }
  paintBust(hc, f, o);
  hc.restore();
  const ctx = cv.getContext('2d');
  ctx.drawImage(hi, 0, 0, W, H);
  analogPost(ctx, W, H, faceSeedOf(f) ^ (o.postSeed || 0), o.post || {});
  return cv;
}

/* foto de documento / retrato pequeno — look de impressão barata */
/* FOTO DE DOCUMENTO: é PAPEL IMPRESSO, não vídeo. Sem scanline nem aberração
   cromática (isso é da fita/lente); em vez disso, quase monocromático (tinta
   barata), contraste alto de impressão ruim, grão de papel e posterização
   grosseira. Assim a foto do passaporte deixa de ser gêmea do feed ao vivo do
   guichê — e a comparação foto×rosto fica mais legível como fic­ção. */
const PORTRAIT_POST = { levels: 6, ditherAmp: 0.26, grain: 5, aberr: 0, bleed: 0.05, scan: 0, vig: 0.34, sat: 0.28, contrast: 1.18 };
function portraitSVG(f) {
  const cv = renderPortraitCanvas(f, { w: 84, h: 100, bg: '#8a8778', post: PORTRAIT_POST });
  return `<image href="${cv.toDataURL()}" width="100" height="120" style="image-rendering:pixelated" preserveAspectRatio="none"/>`;
}

/* close-up do exame: mesmo rosto, mais perto, marcas do corpo visíveis */
function physAnomOpts(phys) {
  const a = (phys && phys.anom) || {};
  return { skinShift: a.skinShift || 0, skinTone: a.skinTone, smile: a.smile || 0, teethBright: !!a.teethBright, deadStare: !!a.deadStare, slitPupil: !!a.slitPupil, blackSclera: !!a.blackSclera, neckSeam: !!a.neckSeam, anisocoria: !!a.anisocoria };
}
function examSVG(f, phys) {
  phys = phys || {};
  const o = Object.assign({
    w: 150, h: 180, bg: '#12130f',
    zoom: 1.55, focusY: 50, paintScale: 4,
    waxy: !!phys.pele, veins: !!phys.olhos, brightSclera: !!phys.piscar,
    post: { levels: 6, ditherAmp: 0.14, grain: 3, aberr: 0, scan: 0.06, vig: 0.55, tears: 0, sat: 0.4 },
  }, physAnomOpts(phys));
  const open = renderPortraitCanvas(f, o).toDataURL();
  let s = `<image href="${open}" width="200" height="240" preserveAspectRatio="none" style="image-rendering:pixelated"/>`;
  if (!phys.piscar) {
    // humanos piscam: um segundo frame com os olhos fechados cruza por cima.
    // quem não pisca, não pisca — o frame simplesmente não existe.
    const closed = renderPortraitCanvas(f, Object.assign({}, o, { eyesClosed: true, postSeed: 0 })).toDataURL();
    const dur = (3.2 + (faceSeedOf(f) % 5) * 0.55).toFixed(2);
    s += `<image href="${closed}" width="200" height="240" preserveAspectRatio="none" style="image-rendering:pixelated" opacity="0">` +
      `<animate attributeName="opacity" values="0;0;1;0" keyTimes="0;0.94;0.965;1" dur="${dur}s" repeatCount="indefinite"/></image>`;
  }
  return s;
}

/* ============================================================
   EXAME POR ZONA — mini-cenas animadas (No, I'm Not a Human)
   Cada zona clicada vira uma SEQUÊNCIA de frames pintados
   (aproximar → obedecer à ordem → segurar), animada por opacidade
   discreta no SVG. Nada aqui toca o RNG global.
   ============================================================ */
function renderScene(paintFn, seed, o) {
  o = o || {};
  const W = o.w || 260, H = o.h || 312;
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const S = o.paintScale || 2.6;
  const hi = document.createElement('canvas');
  hi.width = Math.round(100 * S); hi.height = Math.round(120 * S);
  const hc = hi.getContext('2d');
  if (o.bg) {
    const g = hc.createLinearGradient(0, 0, 0, hi.height);
    g.addColorStop(0, o.bg); g.addColorStop(1, '#0a0b07');
    hc.fillStyle = g; hc.fillRect(0, 0, hi.width, hi.height);
  }
  hc.save(); F_SCALE = S; hc.scale(S, S); paintFn(hc); hc.restore();
  const ctx = cv.getContext('2d');
  ctx.drawImage(hi, 0, 0, W, H);
  analogPost(ctx, W, H, seed, o.post || {});
  return cv;
}

/* pele em macro: um campo de pele preenchendo o quadro.
   Normal: poros, rachaduras de frio, descamação, pelos, a cicatriz antiga.
   phys.pele: cerosa — lisa DEMAIS, um brilho de vela, nada de poros. */
function paintSkinMacro(ctx, f, phys, shift) {
  const L = faceLayout(f);
  const r = faceRng(faceSeedOf(f) ^ (0xA5 + (shift || 0)));
  let SK = L.skin.b, SH = L.skin.s;
  // ANOMALIA: o desvio de pele (azul/ceroso) também tinge o close — antes não
  // tingia, então o zoom "PELE" mostrava tom normal mesmo num Alternado azul.
  const anom = (phys && phys.anom) || {};
  if (anom.skinShift) { const tgt = anom.skinTone || [72, 116, 176]; SK = mix(SK, tgt, anom.skinShift); SH = mix(SH, darken(tgt, 0.4), anom.skinShift); }
  const g = ctx.createLinearGradient(0, 0, 100, 120);
  g.addColorStop(0, rgb(lighten(SK, 0.12)));
  g.addColorStop(0.55, rgb(SK));
  g.addColorStop(1, rgb(mix(SK, SH, 0.55)));
  ctx.fillStyle = g; ctx.fillRect(0, 0, 100, 120);
  // a lâmpada de sempre, vinda da esquerda
  const key = ctx.createRadialGradient(22, 30, 4, 26, 38, 90);
  key.addColorStop(0, 'rgba(255,244,214,.30)'); key.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = key; ctx.fillRect(0, 0, 100, 120);
  const j = (shift || 0) * 3.5; // deriva de "câmera na mão" entre frames
  if (phys && phys.pele) {
    // CERA: liso demais, com um lustre que pele viva não tem — e, se olhar de
    // muito perto, uma malha celular regular DEMAIS. errado de um jeito difícil
    // de nomear. (o poro humano é caótico; este é fabricado.)
    soft(ctx, 50, 60, 46, 42, rgb(lighten(SK, 0.06), 0.5), 6);
    // sub-superfície fria/azulada em placas (livor) — mais forte se há desvio
    const livor = anom.skinShift ? [58, 108, 176] : [150, 150, 165];
    const livA = anom.skinShift ? 0.2 : 0.1;
    for (let i = 0; i < 6; i++) soft(ctx, 18 + r() * 64, 16 + r() * 88, 10 + r() * 14, 8 + r() * 11, rgb(mix(SK, livor, 0.6), livA), 5);
    // malha celular regular (padrão hexagonal frouxo — bom demais para ser real)
    ctx.strokeStyle = rgb(darken(SH, 0.12), 0.14); ctx.lineWidth = 0.3;
    for (let y = 8; y < 120; y += 7) {
      for (let x = 6; x < 100; x += 8) {
        const ox = (Math.floor(y / 7) % 2) * 4;
        ctx.beginPath(); ctx.arc(x + ox, y, 2.6, 0, 6.29); ctx.stroke();
      }
    }
    // lustre plástico: dois destaques duros de borda nítida (não é suor)
    soft(ctx, 38 + j, 42, 20, 14, 'rgba(255,253,244,.22)', 3);
    ctx.fillStyle = 'rgba(255,255,250,.5)'; ctx.beginPath(); ctx.ellipse(34 + j, 40, 5, 3, -0.5, 0, 6.29); ctx.fill();
    soft(ctx, 66 + j, 80, 16, 12, 'rgba(255,250,240,.14)', 3);
    // uma emenda: onde a pele foi "fechada". quase invisível.
    ctx.strokeStyle = rgb(darken(SH, 0.2), 0.22); ctx.lineWidth = 0.4;
    ctx.beginPath(); ctx.moveTo(28 + j, 12); ctx.quadraticCurveTo(40 + j, 60, 34 + j, 116); ctx.stroke();
  } else {
    // mosqueado de tom: manchas frouxas quentes/frias sob os poros, pra pele
    // não ficar de um só tom (o que denuncia "pintado"). humano é irregular.
    for (let i = 0; i < 22; i++) {
      const warm = r() < 0.6;
      const tint = warm ? [176, 96, 78] : [96, 110, 132];
      soft(ctx, r() * 100, r() * 120, 6 + r() * 12, 5 + r() * 10, rgb(mix(SK, tint, 0.5), 0.05 + r() * 0.05), 4);
    }
    // poros — em duas escalas: muitos finos + alguns maiores e mais fundos,
    // e uns poucos com micro-brilho de sebo na borda. distribuição caótica.
    ctx.fillStyle = rgb(darken(SH, 0.2), 0.16);
    for (let i = 0; i < 680; i++) {
      const x = r() * 100, y = r() * 120;
      ctx.fillRect(x, y, 0.4 + r() * 0.3, 0.4 + r() * 0.3);
    }
    ctx.fillStyle = rgb(darken(SH, 0.34), 0.22);
    for (let i = 0; i < 90; i++) {
      const x = r() * 100, y = r() * 120, s = 0.7 + r() * 0.6;
      ctx.fillRect(x, y, s, s);
      if (r() < 0.4) { ctx.fillStyle = rgb(lighten(SK, 0.25), 0.18); ctx.fillRect(x - 0.4, y - 0.4, 0.4, 0.4); ctx.fillStyle = rgb(darken(SH, 0.34), 0.22); }
    }
    // rachaduras de frio (linhas finas em rede)
    ctx.strokeStyle = rgb(darken(SH, 0.28), 0.30); ctx.lineWidth = 0.35;
    for (let i = 0; i < 26; i++) {
      const x = r() * 100, y = r() * 120, a = r() * 6.29, len = 3 + r() * 7;
      ctx.beginPath(); ctx.moveTo(x, y);
      ctx.quadraticCurveTo(x + Math.cos(a) * len * 0.5 + (r() - 0.5) * 2, y + Math.sin(a) * len * 0.5,
        x + Math.cos(a) * len, y + Math.sin(a) * len);
      ctx.stroke();
    }
    // manchas de vento norte
    for (let i = 0; i < 5; i++) {
      soft(ctx, r() * 100, r() * 120, 5 + r() * 8, 4 + r() * 6, rgb(mix(SH, [150, 66, 52], 0.5), 0.10), 3);
    }
    // descamação (escamas claras levantadas)
    ctx.fillStyle = rgb(lighten(SK, 0.4), 0.30);
    for (let i = 0; i < 34; i++) {
      const x = 20 + r() * 60, y = 20 + r() * 80;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 1.6, y + 0.4); ctx.lineTo(x + 0.7, y + 1.4);
      ctx.closePath(); ctx.fill();
    }
    // pelos finos
    ctx.strokeStyle = rgb(darken(L.hair, 0.2), 0.35); ctx.lineWidth = 0.3;
    for (let i = 0; i < 40; i++) {
      const x = r() * 100, y = r() * 120;
      ctx.beginPath(); ctx.moveTo(x, y);
      ctx.quadraticCurveTo(x + 1, y + 1.6, x + 1.2 + r(), y + 3.2); ctx.stroke();
    }
    // a cicatriz antiga no queixo (TELLS 'pele', linha normal)
    ctx.strokeStyle = rgb(lighten(SK, 0.35), 0.7); ctx.lineWidth = 1.1;
    ctx.beginPath(); ctx.moveTo(58 + j, 88); ctx.quadraticCurveTo(66 + j, 91, 74 + j, 90); ctx.stroke();
    ctx.strokeStyle = rgb(darken(SH, 0.15), 0.4); ctx.lineWidth = 0.4;
    for (let i = 0; i < 4; i++) {
      const x = 60 + j + i * 4;
      ctx.beginPath(); ctx.moveTo(x, 86.6); ctx.lineTo(x + 0.6, 92.4); ctx.stroke();
    }
  }
  // vinheta local + grão de proximidade
  const vg = ctx.createRadialGradient(50, 60, 30, 50, 60, 85);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(4,3,2,.5)');
  ctx.fillStyle = vg; ctx.fillRect(0, 0, 100, 120);
}

/* mãos contra o vidro: "as palmas. agora o dorso."
   Normal: calos, linhas fundas, unhas com meia-lua, a aliança apertada.
   phys.maos: dedos compridos demais, palma sem linhas, unhas sem meia-lua. */
function paintHandScene(ctx, f, phys, mode) {
  const L = faceLayout(f);
  const r = faceRng(faceSeedOf(f) ^ 0xB7);
  const SK = L.skin.b, SH = L.skin.s;
  const anom = !!(phys && phys.maos);
  const sixth = !!(phys && phys.sextoDedo);   // um dedo a mais — só no exame das mãos
  // fundo: o guichê escuro atrás do vidro
  const bg = ctx.createRadialGradient(50, 52, 8, 50, 60, 95);
  bg.addColorStop(0, '#20221a'); bg.addColorStop(1, '#070806');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, 100, 120);
  // um vulto do dono da mão, desfocado, atrás
  soft(ctx, 50, 34, 20, 26, 'rgba(16,14,10,.9)', 5);
  soft(ctx, 50, 22, 11, 12, rgb(mix(SK, SH, 0.6), 0.25), 5);

  const far = mode === 'palm-far';
  const dorsal = mode === 'dorsal';
  const sc = far ? 0.72 : 1.24;           // aproximando do vidro (mão enche mais o quadro)
  const cy = far ? 70 : 60;               // centro da palma
  const fingerLen = (anom ? 38 : 27) * sc; // comprimento base dos dedos
  const palmW = 15 * sc, palmH = 19 * sc;   // palma
  const tone = mix(SK, [255, 238, 214], far ? 0.02 : 0.06); // pele quente (prensada = um tico mais pálida)
  ctx.save();
  ctx.translate(50 + (far ? 4 : 0), 0);
  ctx.rotate((r() - 0.5) * 0.06);
  // pulso + PUNHO do casaco: a mão sai de um braço, não flutua no preto
  if (!far) {
    ctx.fillStyle = rgb(mix(tone, SH, 0.28));
    ctx.fillRect(-palmW * 0.7, cy + palmH * 0.3, palmW * 1.4, 44);
    ctx.fillStyle = 'rgb(40,38,31)';
    ctx.beginPath();
    ctx.moveTo(-palmW * 0.92, cy + palmH * 0.95); ctx.lineTo(palmW * 0.92, cy + palmH * 0.95);
    ctx.lineTo(palmW * 0.8, 128); ctx.lineTo(-palmW * 0.8, 128); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(210,215,190,.12)'; ctx.lineWidth = 0.7;
    ctx.beginPath(); ctx.moveTo(-palmW * 0.92, cy + palmH * 0.95); ctx.lineTo(palmW * 0.92, cy + palmH * 0.95); ctx.stroke();
    // botão do punho
    ctx.fillStyle = 'rgba(70,62,44,.9)'; ctx.beginPath(); ctx.arc(palmW * 0.5, cy + palmH * 1.3, 1.1, 0, 6.29); ctx.fill();
  }
  // GEOMETRIA DOS DEDOS — compartilhada pela silhueta e pelos detalhes.
  // normal: 4 dedos. anômalo (sextoDedo): 5 espremidos.
  const nFing = sixth ? 5 : 4;
  const flenP = sixth ? [0.8, 0.95, 1, 0.94, 0.76] : [0.82, 1, 0.96, 0.78];
  const palmTop = cy - palmH * 0.82;       // linha dos nós (base dos dedos)
  const palmBot = cy + palmH * 1.02;       // punho
  const spanL = -palmW + 2.4, spanR = palmW - 2.4;
  const fing = [];
  for (let i = 0; i < nFing; i++) {
    const fx = spanL + i * ((spanR - spanL) / (nFing - 1));
    const fw2 = (3.4 - Math.abs(i - (sixth ? 1.9 : 1.55)) * 0.34) * sc * (sixth ? 0.86 : 1);
    const fl = fingerLen * flenP[i];
    fing.push({ x: fx, w: fw2, len: fl, ty: palmTop - fl });
  }
  const valleyY = palmTop - fingerLen * 0.22;  // reentrância (membrana) entre dedos

  // SILHUETA ÚNICA: palma + dedos num só contorno. Os dedos NASCEM da palma
  // (com membrana entre eles), em vez de flutuarem como colunas atrás de uma
  // elipse. É isso que faz a mão ler como mão de verdade.
  const handOutline = () => {
    ctx.beginPath();
    ctx.moveTo(-palmW * 0.8, palmBot);                                          // punho esq.
    ctx.quadraticCurveTo(-palmW * 1.06, cy, fing[0].x - fing[0].w, palmTop);    // borda esq. sobe até a base do 1º dedo
    for (let i = 0; i < nFing; i++) {
      const t = fing[i];
      ctx.lineTo(t.x - t.w, t.ty + t.w);                                        // sobe pelo lado esq. do dedo
      ctx.quadraticCurveTo(t.x, t.ty - t.w * 0.7, t.x + t.w, t.ty + t.w);       // ponta arredondada
      if (i < nFing - 1) {
        ctx.lineTo(t.x + t.w, valleyY);                                         // desce pro vale
        ctx.lineTo(fing[i + 1].x - fing[i + 1].w, valleyY);                     // membrana até o próximo dedo
      } else {
        ctx.lineTo(t.x + t.w, palmTop);
      }
    }
    ctx.quadraticCurveTo(palmW * 1.06, cy, palmW * 0.8, palmBot);               // borda dir. desce até o punho
    ctx.closePath();
  };
  // POLEGAR: massa própria que se funde à base da palma (canto inf. esq.)
  const thumbOutline = () => {
    ctx.beginPath();
    ctx.moveTo(-palmW * 0.5, cy + palmH * 0.5);
    ctx.quadraticCurveTo(-palmW - 5 * sc, cy + palmH * 0.35, -palmW - 8.5 * sc, cy - palmH * 0.3);
    ctx.quadraticCurveTo(-palmW - 10 * sc, cy - palmH * 0.7, -palmW - 6 * sc, cy - palmH * 0.82);
    ctx.quadraticCurveTo(-palmW - 3 * sc, cy - palmH * 0.72, -palmW - 1.5 * sc, cy - palmH * 0.18);
    ctx.quadraticCurveTo(-palmW - 0.3 * sc, cy + palmH * 0.12, -palmW * 0.5, cy + palmH * 0.5);
    ctx.closePath();
  };

  // preenche a mão inteira de uma vez (polegar + palma/dedos), tudo na mesma cor
  ctx.fillStyle = rgb(tone);
  thumbOutline(); ctx.fill();
  handOutline(); ctx.fill();

  // MODELAGEM: luz da esquerda, sombra à direita — recortada ao contorno da mão
  ctx.save(); handOutline(); ctx.clip();
  const shade = ctx.createLinearGradient(-palmW, 0, palmW * 1.15, 0);
  shade.addColorStop(0, 'rgba(255,246,224,.14)');
  shade.addColorStop(0.55, 'rgba(0,0,0,0)');
  shade.addColorStop(1, rgb(darken(SH, 0.15), 0.42));
  ctx.fillStyle = shade; ctx.fillRect(-palmW * 2, 0, palmW * 4, 130);
  soft(ctx, palmW * 0.2, palmTop + 1, palmW * 1.2, 2.5, rgb(darken(SH, 0.2), 0.28), 3); // sombra na dobra dedo-palma
  ctx.restore();

  // fenda escura entre dedos (reforça a separação sem quebrar a silhueta)
  ctx.strokeStyle = rgb(darken(SH, 0.32), 0.5); ctx.lineWidth = 0.55 * sc;
  for (let i = 0; i < nFing - 1; i++) {
    const mx = (fing[i].x + fing[i].w + fing[i + 1].x - fing[i + 1].w) / 2;
    ctx.beginPath(); ctx.moveTo(mx, valleyY); ctx.lineTo(mx, valleyY + fingerLen * 0.16); ctx.stroke();
  }

  // DETALHE por dedo: unhas (dorso) ou polpas + vincos das falanges (palma)
  for (let i = 0; i < nFing; i++) {
    const t = fing[i], fx = t.x, fw2 = t.w, fl = t.len, top = t.ty;
    if (dorsal) {
      const nw = fw2 * 0.72, nh = anom ? fw2 * 1.5 : fw2 * 1.15;
      ctx.fillStyle = anom ? 'rgb(214,206,196)' : rgb(mix(tone, [235, 220, 200], 0.6));
      ctx.beginPath(); ctx.ellipse(fx, top + fw2 * 1.5, nw, nh, 0, 0, 6.29); ctx.fill();
      ctx.strokeStyle = rgb(darken(SH, 0.25), 0.5); ctx.lineWidth = 0.35;
      ctx.beginPath(); ctx.ellipse(fx, top + fw2 * 1.5, nw, nh, 0, 0, 6.29); ctx.stroke();
      if (!anom) {
        ctx.fillStyle = 'rgba(245,242,232,.8)';
        ctx.beginPath(); ctx.ellipse(fx, top + fw2 * 1.5 + nh * 0.55, nw * 0.66, nh * 0.3, 0, 0, 6.29); ctx.fill();
        if (i === 2) { ctx.fillStyle = 'rgba(64,40,60,.55)'; ctx.beginPath(); ctx.ellipse(fx - nw * 0.2, top + fw2 * 1.4, nw * 0.5, nh * 0.4, 0.4, 0, 6.29); ctx.fill(); }
      }
      ctx.strokeStyle = rgb(darken(SH, 0.2), anom ? 0.18 : 0.5); ctx.lineWidth = 0.4;
      for (const tt of [0.42, 0.72]) { const jy = top + fl * tt; ctx.beginPath(); ctx.moveTo(fx - fw2 * 0.8, jy); ctx.quadraticCurveTo(fx, jy + 1, fx + fw2 * 0.8, jy); ctx.stroke(); }
    } else {
      ctx.fillStyle = rgb(lighten(tone, 0.32), far ? 0.18 : 0.55);
      ctx.beginPath(); ctx.ellipse(fx, top + fw2 * 1.6, fw2 * 0.8, fw2 * 1.1, 0, 0, 6.29); ctx.fill();
      ctx.strokeStyle = rgb(darken(SH, 0.25), anom ? 0.15 : 0.5); ctx.lineWidth = 0.45;
      for (const tt of [0.4, 0.7]) { const jy = top + fl * tt; ctx.beginPath(); ctx.moveTo(fx - fw2 * 0.82, jy); ctx.quadraticCurveTo(fx, jy + 1.2, fx + fw2 * 0.82, jy); ctx.stroke(); }
    }
  }

  // PALMA: linhas da mão + calos (só na vista palmar)
  if (!dorsal && !far) {
    soft(ctx, 0, cy - 1, palmW * 1.1, palmH * 0.9, rgb(lighten(tone, 0.28), 0.4), 4);
    if (anom) {
      soft(ctx, 0, cy, palmW * 0.7, palmH * 0.6, rgb(lighten(tone, 0.15), 0.5), 3);
    } else {
      ctx.strokeStyle = rgb(darken(SH, 0.3), 0.55); ctx.lineWidth = 0.6 * sc;
      ctx.beginPath(); ctx.moveTo(-palmW * 0.7, cy - palmH * 0.3); ctx.quadraticCurveTo(0, cy - palmH * 0.02, palmW * 0.75, cy - palmH * 0.28); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-palmW * 0.75, cy + palmH * 0.1); ctx.quadraticCurveTo(-palmW * 0.1, cy + palmH * 0.32, palmW * 0.7, cy + palmH * 0.15); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-palmW * 0.5, cy + palmH * 0.85); ctx.quadraticCurveTo(-palmW * 0.55, cy + palmH * 0.3, -palmW * 0.25, cy - palmH * 0.4); ctx.stroke();
      for (let i = 0; i < nFing; i++) soft(ctx, fing[i].x, palmTop + 1.5, 1.8, 1.2, rgb(mix(tone, [200, 170, 130], 0.5), 0.5), 1);
    }
  }

  // ALIANÇA apertada demais (dedo anelar, vista dorsal)
  if (dorsal && !anom && !sixth) {
    const t = fing[2], fx = t.x, ry = t.ty + t.len * 0.32;
    ctx.fillStyle = 'rgb(158,132,72)'; ctx.fillRect(fx - 3.2, ry, 6.4, 1.7);
    ctx.fillStyle = 'rgba(255,246,214,.75)'; ctx.fillRect(fx - 2.2, ry + 0.3, 1.6, 0.55);
    soft(ctx, fx, ry - 1.2, 3, 1, rgb(mix(SK, [180, 100, 90], 0.3), 0.4), 0.8);
    soft(ctx, fx, ry + 2.6, 3, 1, rgb(mix(SK, [180, 100, 90], 0.3), 0.4), 0.8);
  }

  // VEIAS do dorso (fracas no anômalo — pele lisa demais)
  if (dorsal) {
    ctx.strokeStyle = `rgba(86,96,110,${anom ? 0.12 : 0.4})`; ctx.lineWidth = 0.7;
    for (let i = 0; i < 3; i++) {
      const x0 = -palmW * 0.55 + i * palmW * 0.5;
      ctx.beginPath(); ctx.moveTo(x0, cy + palmH * 0.7); ctx.quadraticCurveTo(x0 + 2, cy - palmH * 0.2, x0 + 1 + i, palmTop + 2); ctx.stroke();
    }
  }
  ctx.restore();
  // o vidro: reflexo diagonal + sujeira de mil mãos anteriores
  ctx.strokeStyle = 'rgba(235,240,225,.07)'; ctx.lineWidth = 6;
  ctx.beginPath(); ctx.moveTo(8, 116); ctx.lineTo(88, 10); ctx.stroke();
  ctx.strokeStyle = 'rgba(235,240,225,.05)'; ctx.lineWidth = 2.4;
  ctx.beginPath(); ctx.moveTo(30, 118); ctx.lineTo(98, 30); ctx.stroke();
  const rr = faceRng(1177);
  ctx.fillStyle = 'rgba(210,214,196,.05)';
  for (let i = 0; i < 26; i++) {
    ctx.beginPath(); ctx.ellipse(rr() * 100, rr() * 120, 1 + rr() * 3, 0.8 + rr() * 2, rr(), 0, 6.29); ctx.fill();
  }
}

/* sequência de frames → SVG com opacidade discreta (loop) */
function seqSVG(frames) {
  const total = frames.reduce((a, fr) => a + fr.len, 0);
  const dur = total.toFixed(2);
  let acc = 0, out = '';
  frames.forEach((fr, i) => {
    const t0 = acc / total, t1 = (acc + fr.len) / total; acc += fr.len;
    let anim;
    if (i === 0) anim = `values="1;0" keyTimes="0;${t1.toFixed(4)}"`;
    else if (t1 >= 0.9999) anim = `values="0;1" keyTimes="0;${t0.toFixed(4)}"`;
    else anim = `values="0;1;0" keyTimes="0;${t0.toFixed(4)};${t1.toFixed(4)}"`;
    out += `<image href="${fr.url}" width="200" height="240" preserveAspectRatio="none" style="image-rendering:pixelated" opacity="${i === 0 ? 1 : 0}">` +
      `<animate attributeName="opacity" calcMode="discrete" ${anim} dur="${dur}s" repeatCount="indefinite"/></image>`;
  });
  return out;
}

/* ---------- MACRO DO OLHO (No I'm Not a Human): um olho enche a tela,
   se mexe em sacadas e pisca. Olhar morto / dilatado / sem piscar = tell. */
function paintEyeMacro(ctx, f, phys, gaze) {
  gaze = gaze || {};
  const L = faceLayout(f);
  const r = faceRng(faceSeedOf(f) ^ 0x1CE);
  let SK = L.skin.b, SH = L.skin.s;
  const anom = (phys && phys.anom) || {};
  if (anom.skinShift) { const tgt = anom.skinTone || [72, 116, 176]; SK = mix(SK, tgt, anom.skinShift); SH = mix(SH, darken(tgt, 0.4), anom.skinShift); }
  const cx = 50, cy = 54, hw = 27, hh = 12.5;
  const bg = ctx.createLinearGradient(0, 10, 0, 120);
  bg.addColorStop(0, rgb(mix(SK, SH, 0.3))); bg.addColorStop(0.45, rgb(SK)); bg.addColorStop(1, rgb(mix(SK, SH, 0.55)));
  ctx.fillStyle = bg; ctx.fillRect(0, 0, 100, 120);
  const key = ctx.createRadialGradient(28, 26, 4, 34, 40, 86); key.addColorStop(0, 'rgba(255,244,214,.26)'); key.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = key; ctx.fillRect(0, 0, 100, 120);
  // sobrancelha
  ctx.save(); try { ctx.filter = `blur(${(0.5 * F_SCALE).toFixed(1)}px)`; } catch (e) {}
  ctx.strokeStyle = rgb(darken(L.hair, 0.2), 0.85); ctx.lineWidth = 3.4;
  ctx.beginPath(); ctx.moveTo(cx - hw - 2, cy - hh - 9); ctx.quadraticCurveTo(cx, cy - hh - 15, cx + hw + 2, cy - hh - 8); ctx.stroke(); ctx.restore();
  ctx.strokeStyle = rgb(darken(L.hair, 0.35), 0.7); ctx.lineWidth = 0.6;
  for (let i = 0; i < 40; i++) { const t = i / 39, bx = cx - hw - 2 + t * (hw * 2 + 4), by = cy - hh - 11 - Math.sin(t * 3.14) * 3; ctx.beginPath(); ctx.moveTo(bx, by + 1.5); ctx.lineTo(bx + 1.5, by - 1.5 - r() * 0.6); ctx.stroke(); }
  soft(ctx, cx, cy - hh - 1, hw, 4, rgb(darken(SH, 0.1), 0.4), 3.5);
  soft(ctx, cx, cy, hw + 4, hh + 7, rgb(darken(SH, 0.08), 0.28), 5);
  soft(ctx, cx, cy + hh + 4, hw * 0.8, 4, rgb(mix(SH, [70, 60, 78], 0.4), 0.34), 4); // olheira
  const almond = () => {
    ctx.beginPath();
    ctx.moveTo(cx - hw, cy + 0.5);
    ctx.quadraticCurveTo(cx - hw * 0.45, cy - hh - 2.5, cx + hw * 0.2, cy - hh);
    ctx.quadraticCurveTo(cx + hw * 0.75, cy - hh * 0.5, cx + hw, cy - 0.5);
    ctx.quadraticCurveTo(cx + hw * 0.4, cy + hh, cx - hw * 0.4, cy + hh * 0.85);
    ctx.quadraticCurveTo(cx - hw, cy + hh * 0.4, cx - hw, cy + 0.5); ctx.closePath();
  };
  if (gaze.closed) {
    ctx.fillStyle = rgb(mix(SK, SH, 0.25)); almond(); ctx.fill();
    ctx.strokeStyle = rgb(darken(SH, 0.3), 0.9); ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(cx - hw, cy + 0.5); ctx.quadraticCurveTo(cx, cy + hh * 0.7, cx + hw, cy - 0.5); ctx.stroke();
    ctx.strokeStyle = 'rgba(20,14,10,.85)'; ctx.lineWidth = 0.5;
    for (let i = 0; i < 16; i++) { const t = i / 15, lx = cx - hw + t * hw * 2, ly = cy + hh * 0.5 - Math.sin(t * 3.14) * hh * 0.4 + 2; ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(lx - 0.5, ly + 2.5); ctx.stroke(); }
    return;
  }
  almond(); ctx.fillStyle = anom.deadStare ? 'rgb(230,230,224)' : (phys && phys.olhos ? 'rgb(222,204,188)' : 'rgb(212,204,184)'); ctx.fill();
  ctx.save(); almond(); ctx.clip();
  const lidSh = ctx.createLinearGradient(0, cy - hh - 1, 0, cy + hh * 0.2); lidSh.addColorStop(0, 'rgba(38,26,18,.65)'); lidSh.addColorStop(1, 'rgba(38,26,18,0)');
  ctx.fillStyle = lidSh; ctx.fillRect(cx - hw, cy - hh - 2, hw * 2, hh + 2);
  const cor = ctx.createLinearGradient(cx - hw, 0, cx + hw, 0); cor.addColorStop(0, 'rgba(60,44,34,.55)'); cor.addColorStop(0.25, 'rgba(0,0,0,0)'); cor.addColorStop(0.75, 'rgba(0,0,0,0)'); cor.addColorStop(1, 'rgba(60,44,34,.5)');
  ctx.fillStyle = cor; ctx.fillRect(cx - hw, cy - hh, hw * 2, hh * 2);
  const nv = (phys && phys.olhos) ? 18 : 6; // veias (injetadas = tell)
  ctx.strokeStyle = `rgba(150,44,32,${(phys && phys.olhos) ? 0.6 : 0.3})`;
  for (let i = 0; i < nv; i++) { const side = r() < 0.5 ? -1 : 1; let px = cx + side * hw * 0.95, py = cy + (r() - 0.5) * hh * 1.4; ctx.lineWidth = 0.3 + r() * 0.3; ctx.beginPath(); ctx.moveTo(px, py); for (let k = 0; k < 3; k++) { px -= side * (2 + r() * 3); py += (r() - 0.5) * 2; ctx.lineTo(px, py); } ctx.stroke(); }
  // íris na posição do gaze
  const gx = cx + (gaze.x || 0), gy = cy - 1 + (gaze.y || 0), ir = 9.5, ic = L.iris;
  const ig = ctx.createRadialGradient(gx - 2, gy - 2, 1, gx, gy, ir);
  ig.addColorStop(0, rgb(lighten(ic, 0.15))); ig.addColorStop(0.5, rgb(ic)); ig.addColorStop(0.85, rgb(darken(ic, 0.5))); ig.addColorStop(1, rgb(darken(ic, 0.72)));
  ctx.fillStyle = ig; ctx.beginPath(); ctx.arc(gx, gy, ir, 0, 6.29); ctx.fill();
  ctx.strokeStyle = rgb(darken(ic, 0.4), 0.4); ctx.lineWidth = 0.3;
  for (let i = 0; i < 26; i++) { const a = i / 26 * 6.29; ctx.beginPath(); ctx.moveTo(gx + Math.cos(a) * 3, gy + Math.sin(a) * 3); ctx.lineTo(gx + Math.cos(a) * ir * 0.92, gy + Math.sin(a) * ir * 0.92); ctx.stroke(); }
  ctx.strokeStyle = rgb(darken(ic, 0.7), 0.7); ctx.lineWidth = 0.8; ctx.beginPath(); ctx.arc(gx, gy, ir, 0, 6.29); ctx.stroke();
  const pr = (anom.deadStare || anom.anisocoria) ? 6.4 : 3.6; // pupila dilatada = tell
  ctx.fillStyle = 'rgb(6,5,5)'; ctx.beginPath(); ctx.arc(gx, gy, pr, 0, 6.29); ctx.fill();
  if (anom.deadStare) { ctx.fillStyle = 'rgba(255,255,250,.9)'; ctx.beginPath(); ctx.arc(gx - 2.4, gy - 2.4, 1.4, 0, 6.29); ctx.fill(); soft(ctx, gx + 1, gy + 1, ir * 0.7, ir * 0.5, 'rgba(200,220,235,.14)', 1); }
  else { ctx.fillStyle = 'rgba(255,252,244,.92)'; ctx.beginPath(); ctx.arc(gx - 2.6, gy - 2.6, 1.7, 0, 6.29); ctx.fill(); ctx.fillStyle = 'rgba(255,252,244,.35)'; ctx.beginPath(); ctx.arc(gx + 1.6, gy + 2, 0.7, 0, 6.29); ctx.fill(); }
  ctx.restore();
  // pálpebra superior linha + cílios
  ctx.strokeStyle = 'rgba(24,16,11,.9)'; ctx.lineWidth = 1.1;
  ctx.beginPath(); ctx.moveTo(cx - hw - 0.5, cy + 0.5); ctx.quadraticCurveTo(cx - hw * 0.4, cy - hh - 2.5, cx + hw * 0.2, cy - hh); ctx.quadraticCurveTo(cx + hw * 0.75, cy - hh * 0.5, cx + hw + 0.5, cy - 0.5); ctx.stroke();
  ctx.strokeStyle = 'rgba(16,10,8,.9)'; ctx.lineWidth = 0.5;
  for (let i = 0; i < 22; i++) { const t = i / 21, lx = cx - hw * 0.9 + t * hw * 1.8, ly = cy - hh + (1 - Math.sin(t * 3.14)) * hh * 0.3 - 1.5; ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(lx + (t - 0.5) * 2, ly - 2.5 - r() * 0.8); ctx.stroke(); }
  ctx.strokeStyle = rgb(darken(SH, 0.12), 0.4); ctx.lineWidth = 0.6;
  ctx.beginPath(); ctx.moveTo(cx - hw * 0.7, cy - hh - 3); ctx.quadraticCurveTo(cx, cy - hh - 5, cx + hw * 0.7, cy - hh - 2.5); ctx.stroke();
  ctx.strokeStyle = rgb(SH, 0.5); ctx.lineWidth = 0.5;
  ctx.beginPath(); ctx.moveTo(cx - hw * 0.6, cy + hh * 0.75); ctx.quadraticCurveTo(cx, cy + hh + 1, cx + hw * 0.5, cy + hh * 0.6); ctx.stroke();
  ctx.fillStyle = rgb(mix(SH, [150, 80, 70], 0.6), 0.7); ctx.beginPath(); ctx.arc(cx - hw + 1, cy + 0.5, 1.6, 0, 6.29); ctx.fill(); // carúncula
}
function eyeMacroSVG(f, phys) {
  const anom = (phys && phys.anom) || {};
  const dead = !!anom.deadStare, noBlink = !!(phys && phys.piscar);
  const seed = faceSeedOf(f);
  const mk = (gaze, ps) => renderScene((c) => paintEyeMacro(c, f, phys, gaze), seed ^ ps, { w: 150, h: 180, paintScale: 3.4, post: { levels: 8, ditherAmp: 0.18, grain: 3, aberr: 0, scan: 0.06, vig: 0.5, sat: 0.4 } }).toDataURL();
  const C = { x: 0, y: 0 }, Lp = { x: -6, y: 1 }, Rp = { x: 6, y: 0.5 }, Up = { x: -1, y: -3 }, Dp = { x: 1, y: 2.6 };
  let frames;
  if (dead) {
    // olhar morto: fixa, dilatado, não pisca — imobilidade que perturba
    frames = [{ url: mk(C, 1), len: 3.4 }, { url: mk({ x: 0.6, y: 0 }, 2), len: 0.14 }, { url: mk(C, 3), len: 3.2 }];
  } else {
    const bl = noBlink ? null : { url: mk({ closed: true }, 9), len: 0.13 };
    frames = [{ url: mk(C, 1), len: 1.3 }, { url: mk(Lp, 2), len: 0.5 }, { url: mk(C, 3), len: 0.7 }];
    if (bl) frames.push(bl);
    frames.push({ url: mk(C, 4), len: 0.5 }, { url: mk(Rp, 5), len: 0.5 }, { url: mk(Up, 6), len: 0.4 }, { url: mk(C, 7), len: 0.9 }, { url: mk(Dp, 8), len: 0.4 }, { url: mk(C, 10), len: 1.0 });
    if (bl) frames.push(bl);
  }
  return seqSVG(frames);
}

/* ---------- FÍSICO do personagem (determinístico por fseed + sexo/build) ----
   O corpo é DAQUELA pessoa: ombro/quadril por sexo, largura por biotipo,
   altura, pescoço. Usado pelo scanner de corpo (e reutilizável). */
function bodyLayout(f) {
  const r = faceRng(faceSeedOf(f) ^ 0xB0D9);
  // o CORPO segue o sexo biológico (bodySex); o ROSTO segue a apresentação
  // (f.sexo). Quando diferem, a silhueta trai o disfarce — só o exame vê.
  const bsex = f.bodySex || f.sexo;
  const fem = bsex === 'f';
  const mismatch = !!(f.bodySex && f.bodySex !== f.sexo);
  const build = f.build != null ? f.build : 1;         // 0 magro 1 médio 2 forte
  const bw = [-2.2, 0, 2.6][build] + (r() - 0.5) * 1.2; // desvio de largura
  const girth = Math.max(0, f.girth || 0);             // 0 magro .. ~0.8 pesado (barriga)
  const gw = girth * 9;                                // quanto a massa alarga o meio
  const L = faceLayout(f);
  // PROPORÇÃO POR IDADE: a cabeça cresce cedo e quase para (aos ~2 anos já tem
  // ~85-90% do tamanho adulto), enquanto o corpo continua crescendo por mais de
  // uma década. Então quanto mais novo, MAIOR a cabeça em relação ao corpo — o
  // "cabeção" de criança. childF: 0 = adulto (16+) → ~1 = bebê. A cabeça encolhe
  // pouquíssimo; as larguras e o comprimento do corpo é que despencam.
  const age = f.idade != null ? f.idade : 30;
  const childF = age >= 16 ? 0 : Math.min(1, (16 - age) / 15.5);
  const headK = 1 - childF * 0.14;     // cabeça: quase constante
  const bodyK = 1 - childF * 0.44;     // larguras do corpo: bem menores na criança
  const neckK = 1 - childF * 0.34;
  const headR = ((L.fw + L.jw) * 0.28 + 3.4 + girth * 1.4) * headK; // cara mais cheia se pesado
  const shoulder = ((fem ? 15 : 18) + bw + (fem ? 0 : 1) + girth * 2) * bodyK;
  const hip = ((fem ? 14 : 12.5) + bw * 0.8 + gw * 0.7) * bodyK;
  const waist = ((fem ? 10.5 : 11) + bw * 0.9 + gw) * bodyK;     // a cintura é onde a massa mais aparece
  const chest = ((fem ? 12.5 : 13.5) + bw + gw * 0.6) * bodyK;
  const neckW = ((fem ? 2.6 : 3.4) + build * 0.3 + girth * 1.2) * neckK;
  const height = f.height || 0;                        // -0.9..0.9
  // footY é fixo (116) e todos os marcos descem de topY: subir topY (mais alto)
  // já estica as pernas junto — não precisa escalar segmentos à parte.
  const topY = 8 - height * 5;
  // comprimento do tronco+pernas encolhe com a idade (corpo mais curto), mas a
  // cabeça mantém o tamanho → cabeça ocupa fração bem maior da altura total.
  const bodyLen = 1 - childF * 0.4;
  return { r, fem, build, girth, height, mismatch, apparentFem: f.sexo === 'f', headR, shoulder, hip, waist, chest, neckW, topY,
    childF, bodyLen, age, child: childF > 0.05,
    hasCap: f.hat === 3 || f.hat === 1, scarf: !!f.scarf, uniform: !!f.uniform };
}
/* EXAME FÍSICO — CORPO INTEIRO DESPIDO. É a mecânica de verificação de sexo
   biológico do posto (satiriza a inspeção corporal invasiva dos regimes): o
   corpo segue o sexo BIOLÓGICO (bodySex), o rosto/documento seguem a
   apresentação (f.sexo). Quando divergem, a anatomia denuncia o disfarce —
   e só este exame vê. Registro clínico/frio, anatômico e esquemático, não
   erótico: o horror aqui é o Estado exigir tirar a roupa de todo mundo. */
function paintBodyNude(ctx, f, phys) {
  const cold = !!(phys && phys.pescoco);
  const conceal = !!(phys && phys.concealed);
  const B = bodyLayout(f);
  const cx = 50;
  const pal = F_SKIN[(f.skin || 0) % F_SKIN.length];
  let SK = pal.b.slice(), SH = pal.s.slice();
  if (cold) { SK = mix(SK, [86, 128, 172], 0.5); SH = mix(SH, [40, 70, 110], 0.5); }  // corpo frio: lívido/azulado
  const hairC = F_HAIR[(f.hair || 0) % F_HAIR.length];
  const fem = B.fem;                    // sexo BIOLÓGICO
  // fundo de sala de exame: preto esverdeado, grade fraca do scanner
  ctx.fillStyle = '#0a0f0d'; ctx.fillRect(0, 0, 100, 120);
  ctx.strokeStyle = 'rgba(70,150,120,.07)'; ctx.lineWidth = 0.3;
  for (let x = 0; x <= 100; x += 8) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 120); ctx.stroke(); }
  for (let y = 0; y <= 120; y += 8) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(100, y); ctx.stroke(); }

  // marcos verticais (do físico desta pessoa). O tronco+pernas encolhem com a
  // idade (bodyLen), mas a cabeça mantém o tamanho → a criança fica cabeçuda,
  // como de verdade. Adulto: bl=1 (marcos originais).
  const bl = B.bodyLen || 1;
  const headCy = B.topY + B.headR + 1, chinY = headCy + B.headR, neckY = chinY + 1.5;
  const shoulderY = neckY + 5 * bl, chestY = shoulderY + 13 * bl, waistY = chestY + 15 * bl, hipY = waistY + 9 * bl;
  const footY = neckY + (115 - neckY) * bl;   // pernas encolhem junto (base dos pés sobe na criança)
  const sh = B.shoulder, chest = B.chest, waist = B.waist, hip = B.hip;

  // SALVAGUARDA: o exame corporal DESPIDO (verificação de sexo) é SÓ para
  // adultos. Qualquer MENOR de 18 jamais é mostrado nu — rende-se vestido, com
  // aviso clínico de que o exame corporal é dispensado por lei. (É o único
  // limite que a sátira do regime não cruza aqui.)
  if (B.age < 18) {
    const coat = '#3a4652';
    // pernas/calça
    ctx.fillStyle = '#26282a';
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(cx + s * 1, hipY); ctx.lineTo(cx + s * (hip - 1), hipY); ctx.lineTo(cx + s * (waist * 0.5 + 2), footY); ctx.lineTo(cx + s * 1, footY); ctx.closePath(); ctx.fill(); }
    ctx.fillStyle = '#141310'; for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(cx + s * (waist * 0.5 + 2.5), footY + 1.5, 3.6, 2.2, 0, 0, 6.29); ctx.fill(); }
    // braços do casaco (sempre presentes)
    ctx.strokeStyle = coat; ctx.lineWidth = 5; ctx.lineCap = 'round';
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(cx + s * (sh - 2), shoulderY + 2); ctx.quadraticCurveTo(cx + s * (chest + 2), chestY + 4, cx + s * (waist + 3), hipY - 1); ctx.stroke(); }
    ctx.lineCap = 'butt';
    // mãos
    ctx.fillStyle = rgb(SK); for (const s of [-1, 1]) { ctx.beginPath(); ctx.arc(cx + s * (waist + 3), hipY + 1, 2.4, 0, 6.29); ctx.fill(); }
    // tronco vestido (casaco abotoado)
    ctx.fillStyle = coat; ctx.beginPath();
    ctx.moveTo(cx - B.neckW - 1, neckY); ctx.quadraticCurveTo(cx - sh, shoulderY, cx - chest, chestY);
    ctx.lineTo(cx - waist - 1, hipY + 1); ctx.lineTo(cx + waist + 1, hipY + 1); ctx.lineTo(cx + chest, chestY);
    ctx.quadraticCurveTo(cx + sh, shoulderY, cx + B.neckW + 1, neckY); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,.4)'; ctx.lineWidth = 0.6; ctx.beginPath(); ctx.moveTo(cx, neckY + 2); ctx.lineTo(cx, hipY); ctx.stroke();
    ctx.fillStyle = 'rgba(230,230,220,.5)'; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(cx, chestY - 2 + i * 5, 0.8, 0, 6.29); ctx.fill(); }
    // pescoço + cabeça (grande: cabeção de criança)
    ctx.fillStyle = rgb(mix(SK, SH, 0.15)); ctx.fillRect(cx - B.neckW, chinY - 0.5, B.neckW * 2, neckY - chinY + 3);
    ctx.fillStyle = rgb(SK); ctx.beginPath(); ctx.ellipse(cx, headCy, B.headR * 0.84, B.headR, 0, 0, 6.29); ctx.fill();
    soft(ctx, cx - B.headR * 0.3, headCy - 1, B.headR * 0.4, B.headR * 0.5, rgb(lighten(SK, 0.14), 0.5), 3);
    ctx.fillStyle = rgb(SH, 0.36); ctx.beginPath(); ctx.ellipse(cx + B.headR * 0.34, headCy + 1, B.headR * 0.34, B.headR * 0.68, 0, 0, 6.29); ctx.fill();
    ctx.fillStyle = rgb(hairC); ctx.beginPath(); ctx.ellipse(cx, headCy - B.headR * 0.44, B.headR * 0.86, B.headR * 0.72, 0, Math.PI, 2 * Math.PI); ctx.fill();
    ctx.fillRect(cx - B.headR * 0.86, headCy - B.headR * 0.5, B.headR * 1.72, B.headR * 0.28);
    ctx.fillStyle = rgb(darken(SH, 0.3), 0.7); ctx.beginPath(); ctx.ellipse(cx - B.headR * 0.3, headCy + 1, 1.1, 0.8, 0, 0, 6.29); ctx.ellipse(cx + B.headR * 0.3, headCy + 1, 1.1, 0.8, 0, 0, 6.29); ctx.fill();
    // aviso clínico
    ctx.fillStyle = 'rgba(120,255,200,.9)'; ctx.font = '4px "VT323", monospace'; ctx.textAlign = 'left';
    ctx.fillText('EXAME FISICO', 6, 9); ctx.fillText('IDADE ' + Math.round(B.age) + ' — MENOR', 6, 14);
    ctx.fillStyle = 'rgba(255,220,120,.95)'; ctx.textAlign = 'center';
    ctx.fillText('MENOR DE IDADE', cx, footY + 8); ctx.fillText('EXAME CORPORAL DISPENSADO', cx, footY + 13);
    ctx.textAlign = 'left';
    return;
  }

  const fillSkin = () => { ctx.fillStyle = rgb(SK); ctx.fill(); };
  // ---- PERNAS (atrás do tronco) ----
  const legTop = hipY - 1;
  const legLen = footY - legTop;                 // comprimento real (curto na criança)
  const kneeY = legTop + legLen * 0.52, thighY = legTop + legLen * 0.42;
  for (const s of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(cx + s * 1.2, legTop);
    ctx.lineTo(cx + s * (hip - 0.5), legTop + 1);
    ctx.quadraticCurveTo(cx + s * (hip - 1), thighY, cx + s * (waist * 0.42 + 2), kneeY); // coxa→joelho
    ctx.quadraticCurveTo(cx + s * (waist * 0.34 + 1.5), footY - legLen * 0.14, cx + s * (waist * 0.36 + 2.4), footY); // panturrilha→tornozelo
    ctx.lineTo(cx + s * 1.2, footY);
    ctx.closePath(); fillSkin();
    // sombra interna da coxa (volume)
    ctx.fillStyle = rgb(SH, 0.28); ctx.beginPath();
    ctx.moveTo(cx + s * 1.2, legTop + 4); ctx.lineTo(cx + s * 3.5, legTop + 4);
    ctx.quadraticCurveTo(cx + s * 3, footY - legLen * 0.1, cx + s * 3, footY - 4); ctx.lineTo(cx + s * 1.2, footY - 4); ctx.closePath(); ctx.fill();
    // joelho + pé
    soft(ctx, cx + s * (waist * 0.42 + 2), kneeY, 2.4, 2.2, rgb(lighten(SK, 0.1), 0.5), 1.6);
    ctx.fillStyle = rgb(SH); ctx.beginPath(); ctx.ellipse(cx + s * (waist * 0.36 + 3.5), footY + 1.5, 4, 2.4, 0, 0, 6.29); ctx.fill();
  }
  // vão entre as pernas
  ctx.fillStyle = '#0a0f0d'; ctx.beginPath();
  ctx.moveTo(cx - 1, hipY + 5); ctx.lineTo(cx + 1, hipY + 5); ctx.lineTo(cx + 1, footY); ctx.lineTo(cx - 1, footY); ctx.closePath(); ctx.fill();

  // ---- BRAÇOS (SEMPRE presentes, caídos ao lado do corpo) ----
  for (const s of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(cx + s * (sh - 1), shoulderY);
    ctx.quadraticCurveTo(cx + s * (sh + 1.5), chestY - 2, cx + s * (chest + 1), chestY + 3);   // ombro→bíceps
    ctx.quadraticCurveTo(cx + s * (waist + 3), waistY, cx + s * (waist + 2.5), hipY - 1);       // cotovelo→antebraço
    ctx.lineTo(cx + s * (waist - 1), hipY - 2);
    ctx.quadraticCurveTo(cx + s * (chest - 2), chestY + 2, cx + s * (sh - 3), shoulderY + 2);
    ctx.closePath(); fillSkin();
    ctx.fillStyle = rgb(SH, 0.3); ctx.beginPath();   // sombra interna do braço
    ctx.moveTo(cx + s * (waist - 1), hipY - 2); ctx.quadraticCurveTo(cx + s * (chest - 2), chestY + 2, cx + s * (sh - 3), shoulderY + 2);
    ctx.lineTo(cx + s * (sh - 5), shoulderY + 3); ctx.quadraticCurveTo(cx + s * (chest - 4), chestY + 4, cx + s * (waist - 3), hipY - 2); ctx.closePath(); ctx.fill();
    // mão
    ctx.fillStyle = rgb(SK); ctx.beginPath(); ctx.ellipse(cx + s * (waist + 2), hipY + 2, 2.6, 4, s * 0.15, 0, 6.29); ctx.fill();
    ctx.strokeStyle = rgb(SH, 0.5); ctx.lineWidth = 0.4;
    for (let i = -1; i <= 2; i++) { ctx.beginPath(); ctx.moveTo(cx + s * (waist + 0.6), hipY + 3 + i * 1.1); ctx.lineTo(cx + s * (waist + 3.6), hipY + 3.4 + i * 1.1); ctx.stroke(); }
  }

  // ---- TRONCO ----
  ctx.beginPath();
  ctx.moveTo(cx - B.neckW, neckY);
  ctx.quadraticCurveTo(cx - sh * 0.7, shoulderY - 2, cx - sh, shoulderY + 1);      // ombro esq
  ctx.quadraticCurveTo(cx - chest - 1, chestY, cx - waist, waistY);                // flanco → cintura
  ctx.quadraticCurveTo(cx - hip - 1, hipY - 3, cx - hip, hipY + 2);                // quadril
  ctx.quadraticCurveTo(cx - hip * 0.6, hipY + 6, cx, hipY + 6);                    // virilha
  ctx.quadraticCurveTo(cx + hip * 0.6, hipY + 6, cx + hip, hipY + 2);
  ctx.quadraticCurveTo(cx + hip + 1, hipY - 3, cx + waist, waistY);
  ctx.quadraticCurveTo(cx + chest + 1, chestY, cx + sh, shoulderY + 1);
  ctx.quadraticCurveTo(cx + sh * 0.7, shoulderY - 2, cx + B.neckW, neckY);
  ctx.closePath(); fillSkin();
  // modelagem: luz vinda de cima-esquerda, sombra à direita e nas laterais
  ctx.save(); ctx.beginPath();
  ctx.moveTo(cx - B.neckW, neckY); ctx.quadraticCurveTo(cx - sh * 0.7, shoulderY - 2, cx - sh, shoulderY + 1);
  ctx.quadraticCurveTo(cx - chest - 1, chestY, cx - waist, waistY); ctx.quadraticCurveTo(cx - hip - 1, hipY - 3, cx - hip, hipY + 2);
  ctx.quadraticCurveTo(cx - hip * 0.6, hipY + 6, cx, hipY + 6); ctx.quadraticCurveTo(cx + hip * 0.6, hipY + 6, cx + hip, hipY + 2);
  ctx.quadraticCurveTo(cx + hip + 1, hipY - 3, cx + waist, waistY); ctx.quadraticCurveTo(cx + chest + 1, chestY, cx + sh, shoulderY + 1);
  ctx.quadraticCurveTo(cx + sh * 0.7, shoulderY - 2, cx + B.neckW, neckY); ctx.closePath(); ctx.clip();
  const gl = ctx.createLinearGradient(cx - sh, 0, cx + sh, 0);
  gl.addColorStop(0, rgb(lighten(SK, 0.14), 0.5)); gl.addColorStop(0.5, 'rgba(0,0,0,0)'); gl.addColorStop(1, rgb(SH, 0.42));
  ctx.fillStyle = gl; ctx.fillRect(0, 0, 100, 120);
  // clavículas + esterno + linha alba + navel
  ctx.strokeStyle = rgb(SH, 0.4); ctx.lineWidth = 0.5;
  ctx.beginPath(); ctx.moveTo(cx - sh * 0.5, shoulderY + 2); ctx.quadraticCurveTo(cx, shoulderY + 4, cx + sh * 0.5, shoulderY + 2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx, chestY - 1); ctx.lineTo(cx, waistY + 3); ctx.stroke();
  ctx.fillStyle = rgb(SH, 0.6); ctx.beginPath(); ctx.ellipse(cx, waistY + 1, 0.9, 1.3, 0, 0, 6.29); ctx.fill();  // umbigo
  if (!fem) { // leve definição peitoral/abdominal masculina
    soft(ctx, cx - chest * 0.5, chestY, chest * 0.42, 3, rgb(SH, 0.3), 2);
    soft(ctx, cx + chest * 0.5, chestY, chest * 0.42, 3, rgb(SH, 0.3), 2);
    for (let i = 0; i < 2; i++) { soft(ctx, cx - 3.5, chestY + 5 + i * 4, 2.2, 1.4, rgb(SH, 0.22), 1.6); soft(ctx, cx + 3.5, chestY + 5 + i * 4, 2.2, 1.4, rgb(SH, 0.22), 1.6); }
  }
  ctx.restore();

  // ---- CARACTERES SEXUAIS ----
  if (fem) {
    // seios: dois volumes com sombra inferior, aréola e mamilo
    for (const s of [-1, 1]) {
      const bx = cx + s * chest * 0.44, by = chestY + 1.5, br = chest * 0.4 + 1;
      const rgd = ctx.createRadialGradient(bx - s * 1.5, by - 1.5, 1, bx, by + 1, br);
      rgd.addColorStop(0, rgb(lighten(SK, 0.16))); rgd.addColorStop(0.7, rgb(SK)); rgd.addColorStop(1, rgb(SH, 0.85));
      ctx.fillStyle = rgd; ctx.beginPath(); ctx.ellipse(bx, by, br, br * 1.02, 0, 0, 6.29); ctx.fill();
      soft(ctx, bx, by + br * 0.7, br * 0.9, 1.6, rgb(SH, 0.5), 2);            // dobra inframamária
      ctx.fillStyle = rgb(mix(SH, [150, 80, 78], 0.5), 0.75); ctx.beginPath(); ctx.ellipse(bx + s * 0.4, by + 1.5, 1.9, 1.7, 0, 0, 6.29); ctx.fill(); // aréola
      ctx.fillStyle = rgb(darken([150, 80, 78], 0.2)); ctx.beginPath(); ctx.ellipse(bx + s * 0.4, by + 1.5, 0.8, 0.8, 0, 0, 6.29); ctx.fill(); // mamilo
    }
    // pube + vulva (esquemático)
    const py = hipY + 3.5;
    ctx.fillStyle = rgb(darken(hairC, 0.05), 0.92); ctx.beginPath();
    ctx.moveTo(cx - 4, py - 1.5); ctx.lineTo(cx + 4, py - 1.5); ctx.lineTo(cx, py + 3.5); ctx.closePath(); ctx.fill();  // triângulo púbico
    ctx.strokeStyle = rgb(SH, 0.7); ctx.lineWidth = 0.7; ctx.beginPath(); ctx.moveTo(cx, py + 2); ctx.lineTo(cx, py + 5.5); ctx.stroke(); // fenda
  } else {
    // mamilos masculinos
    ctx.fillStyle = rgb(mix(SH, [140, 84, 78], 0.4), 0.7);
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(cx + s * chest * 0.5, chestY + 1, 1, 1, 0, 0, 6.29); ctx.fill(); }
    // pube + pênis/escroto (esquemático, pendente)
    const py = hipY + 3;
    ctx.fillStyle = rgb(darken(hairC, 0.05), 0.92); ctx.beginPath();
    ctx.moveTo(cx - 4, py - 1.5); ctx.quadraticCurveTo(cx, py + 1, cx + 4, py - 1.5); ctx.lineTo(cx + 3, py + 1.5); ctx.lineTo(cx - 3, py + 1.5); ctx.closePath(); ctx.fill();
    ctx.fillStyle = rgb(mix(SK, SH, 0.35)); ctx.beginPath();     // haste
    ctx.moveTo(cx - 1.4, py + 1); ctx.lineTo(cx + 1.4, py + 1); ctx.lineTo(cx + 1.1, py + 6.5); ctx.quadraticCurveTo(cx, py + 8, cx - 1.1, py + 6.5); ctx.closePath(); ctx.fill();
    ctx.fillStyle = rgb(darken(mix(SK, SH, 0.35), 0.12)); ctx.beginPath(); ctx.ellipse(cx, py + 7, 1.4, 1.6, 0, 0, 6.29); ctx.fill(); // glande
    ctx.fillStyle = rgb(mix(SK, SH, 0.5)); ctx.beginPath(); ctx.ellipse(cx - 1.6, py + 4.5, 1.7, 2.2, 0.2, 0, 6.29); ctx.ellipse(cx + 1.6, py + 4.8, 1.7, 2.2, -0.2, 0, 6.29); ctx.fill(); // escroto
  }

  // ---- CABEÇA (oval simples com cabelo; o rosto detalhado é a zona 'olhos') ----
  ctx.fillStyle = rgb(SK); ctx.beginPath(); ctx.ellipse(cx, headCy, B.headR * 0.82, B.headR, 0, 0, 6.29); ctx.fill();
  soft(ctx, cx - B.headR * 0.3, headCy - 1, B.headR * 0.4, B.headR * 0.5, rgb(lighten(SK, 0.14), 0.5), 3);
  ctx.fillStyle = rgb(SH, 0.4); ctx.beginPath(); ctx.ellipse(cx + B.headR * 0.34, headCy + 1, B.headR * 0.36, B.headR * 0.7, 0, 0, 6.29); ctx.fill();
  if (!B.hasCap) { // cabelo (calota)
    ctx.fillStyle = rgb(hairC); ctx.beginPath();
    ctx.ellipse(cx, headCy - B.headR * 0.42, B.headR * 0.84, B.headR * 0.72, 0, Math.PI, 2 * Math.PI); ctx.fill();
    ctx.fillRect(cx - B.headR * 0.84, headCy - B.headR * 0.5, B.headR * 1.68, B.headR * 0.3);
  }
  // olhos/traços mínimos (só pra ler como pessoa, não como manequim)
  ctx.fillStyle = rgb(darken(SH, 0.3), 0.7);
  ctx.beginPath(); ctx.ellipse(cx - B.headR * 0.32, headCy + 0.5, 1, 0.7, 0, 0, 6.29); ctx.ellipse(cx + B.headR * 0.32, headCy + 0.5, 1, 0.7, 0, 0, 6.29); ctx.fill();
  // pescoço
  ctx.fillStyle = rgb(mix(SK, SH, 0.15)); ctx.fillRect(cx - B.neckW, chinY - 0.5, B.neckW * 2, neckY - chinY + 4);
  soft(ctx, cx, chinY + 2, B.neckW * 1.4, 1.6, rgb(SH, 0.4), 1.6);   // sombra do queixo

  // contorno geral fino (define a silhueta contra o preto)
  ctx.strokeStyle = cold ? 'rgba(150,200,225,.5)' : rgb(lighten(SK, 0.2), 0.45); ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(cx - B.neckW, neckY); ctx.quadraticCurveTo(cx - sh * 0.7, shoulderY - 2, cx - sh, shoulderY + 1);
  ctx.quadraticCurveTo(cx - chest - 1, chestY, cx - waist, waistY); ctx.quadraticCurveTo(cx - hip - 1, hipY - 3, cx - hip, hipY + 2);
  ctx.stroke();

  // objeto denso escondido (contrabando na virilha/cintura)
  if (conceal) {
    const ox = cx - 7, oy = waistY - 4;
    ctx.fillStyle = 'rgba(16,26,34,.85)'; ctx.fillRect(ox, oy, 14, 8);
    ctx.strokeStyle = 'rgba(120,255,200,.9)'; ctx.lineWidth = 0.7; ctx.strokeRect(ox, oy, 14, 8);
    ctx.fillStyle = 'rgba(255,70,70,.95)'; ctx.beginPath(); ctx.arc(ox + 16, oy - 1, 1.4, 0, 6.29); ctx.fill();
  }

  // DISCREPÂNCIA: a anatomia contradiz o sexo declarado → marcas do scanner
  if (B.mismatch) {
    const cross = 'rgba(255,70,70,.9)';
    const mark = (x, y, w) => { ctx.strokeStyle = cross; ctx.lineWidth = 0.7; ctx.beginPath(); ctx.moveTo(x - w, y - w); ctx.lineTo(x + w, y + w); ctx.moveTo(x + w, y - w); ctx.lineTo(x - w, y + w); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,70,70,.45)'; ctx.beginPath(); ctx.arc(x, y, w + 1.5, 0, 6.29); ctx.stroke(); };
    mark(cx, chestY + 2, 3);            // peito
    mark(cx, hipY + 4, 2.6);            // virilha
    mark(cx + sh - 1, shoulderY + 1, 2.4);
  }

  // ---- LEITURAS CLÍNICAS ----
  ctx.fillStyle = 'rgba(120,255,200,.85)'; ctx.font = '4px "VT323", monospace'; ctx.textAlign = 'left';
  ctx.fillText('EXAME FISICO', 6, 9);
  ctx.fillText(cold ? 'TERM ..,. C' : 'TERM 36,6 C', 6, 14);
  const biotermo = B.girth > 0.5 ? 'PESADO' : (B.girth > 0.28 ? 'CHEIO' : ['MAGRO', 'MEDIO', 'FORTE'][B.build]);
  const altura = B.height > 0.4 ? ' ALTO' : (B.height < -0.4 ? ' BAIXO' : '');
  const bio = biotermo + (fem ? ' F' : ' M') + altura;
  if (B.mismatch) {
    ctx.fillStyle = 'rgba(255,80,80,.95)'; ctx.fillText('DECL: ' + (B.apparentFem ? 'F' : 'M'), 6, 111);
    ctx.fillText('ANAT: ' + (fem ? 'F' : 'M') + ' !! ' + bio, 6, 116);
  } else {
    ctx.fillStyle = 'rgba(120,255,200,.85)'; ctx.fillText('SEXO ' + (fem ? 'F' : 'M') + ' · ' + bio, 6, 116);
  }
  ctx.textAlign = 'right'; ctx.fillStyle = 'rgba(120,255,200,.85)';
  ctx.fillText(conceal ? 'OBJ: 1 !!' : 'OBJ: --', 94, 116);
}
/* SCANNER DE CORPO (térmico/raio-X): a silhueta É a pessoa; revela volume
   oculto sob o casaco e a assinatura térmica (fraca = corpo frio de Alternado). */
function paintBodyScan(ctx, f, phys) {
  const cold = !!(phys && phys.pescoco);
  const conceal = !!(phys && phys.concealed);
  const B = bodyLayout(f);
  const cx = 50;
  ctx.fillStyle = '#06120f'; ctx.fillRect(0, 0, 100, 120);
  ctx.strokeStyle = 'rgba(60,180,140,.08)'; ctx.lineWidth = 0.3;
  for (let x = 0; x <= 100; x += 8) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 120); ctx.stroke(); }
  for (let y = 0; y <= 120; y += 8) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(100, y); ctx.stroke(); }
  // marcos verticais do corpo desta pessoa
  const headCy = B.topY + B.headR + 2, chinY = headCy + B.headR, neckY = chinY + 2;
  const shoulderY = neckY + 4, chestY = shoulderY + 14, waistY = chestY + 16, hipY = waistY + 10, footY = 116;
  const bodyPath = () => {
    ctx.beginPath();
    // cabeça
    ctx.moveTo(cx - B.neckW, neckY);
    ctx.lineTo(cx - B.neckW - 0.5, chinY);
    ctx.quadraticCurveTo(cx - B.headR, chinY, cx - B.headR, headCy);
    ctx.quadraticCurveTo(cx - B.headR, B.topY + 1, cx, B.topY);
    ctx.quadraticCurveTo(cx + B.headR, B.topY + 1, cx + B.headR, headCy);
    ctx.quadraticCurveTo(cx + B.headR, chinY, cx + B.neckW + 0.5, chinY);
    ctx.lineTo(cx + B.neckW, neckY);
    // ombro dir → tronco → quadril → perna
    ctx.quadraticCurveTo(cx + B.shoulder * 0.6, shoulderY - 1, cx + B.shoulder, shoulderY + 2);
    ctx.quadraticCurveTo(cx + B.chest + 1, chestY, cx + B.waist, waistY);
    ctx.quadraticCurveTo(cx + B.hip + 1, hipY, cx + B.hip, hipY + 3);
    ctx.lineTo(cx + B.waist * 0.5, footY);              // perna dir
    ctx.lineTo(cx + 1.5, footY); ctx.lineTo(cx + 1.5, hipY + 4);
    ctx.lineTo(cx - 1.5, hipY + 4); ctx.lineTo(cx - 1.5, footY); // entreperna
    ctx.lineTo(cx - B.waist * 0.5, footY);              // perna esq
    ctx.lineTo(cx - B.hip, hipY + 3);
    ctx.quadraticCurveTo(cx - B.hip - 1, hipY, cx - B.waist, waistY);
    ctx.quadraticCurveTo(cx - B.chest - 1, chestY, cx - B.shoulder, shoulderY + 2);
    ctx.quadraticCurveTo(cx - B.shoulder * 0.6, shoulderY - 1, cx - B.neckW, neckY);
    ctx.closePath();
  };
  // braços (linhas grossas ao lado do tronco)
  const armPath = () => {
    for (const s of [-1, 1]) {
      ctx.moveTo(cx + s * (B.shoulder - 1), shoulderY + 3);
      ctx.quadraticCurveTo(cx + s * (B.chest + 3), chestY + 4, cx + s * (B.waist + 2), waistY + 4);
      ctx.lineTo(cx + s * (B.waist + 3.5), hipY + 2);
    }
  };
  ctx.save();
  ctx.fillStyle = cold ? 'rgba(40,90,120,.5)' : 'rgba(120,60,40,.5)'; bodyPath(); ctx.fill();
  ctx.strokeStyle = cold ? 'rgba(40,90,120,.5)' : 'rgba(120,60,40,.5)'; ctx.lineWidth = 4; ctx.lineCap = 'round'; armPath(); ctx.stroke();
  bodyPath(); ctx.clip();
  if (cold) {
    const g = ctx.createRadialGradient(cx, chestY, 4, cx, chestY + 8, 60); g.addColorStop(0, 'rgba(70,150,180,.55)'); g.addColorStop(1, 'rgba(20,50,80,.55)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 100, 120);
  } else {
    const g = ctx.createRadialGradient(cx, chestY, 4, cx, chestY + 6, 42); g.addColorStop(0, 'rgba(255,224,130,.8)'); g.addColorStop(0.5, 'rgba(224,96,44,.62)'); g.addColorStop(1, 'rgba(120,40,30,.3)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 100, 120);
    soft(ctx, cx, neckY + 1, 4, 3, 'rgba(255,180,90,.6)', 2);       // pulso quente no pescoço
    soft(ctx, cx, chestY + 2, B.chest * 0.6, 6, 'rgba(255,200,110,.4)', 3); // coração/pulmões
  }
  ctx.restore();
  ctx.strokeStyle = cold ? 'rgba(90,190,215,.7)' : 'rgba(255,180,120,.6)'; ctx.lineWidth = 0.6; bodyPath(); ctx.stroke();
  // esqueleto fraco (coluna + costelas)
  ctx.strokeStyle = 'rgba(200,230,220,.14)'; ctx.lineWidth = 0.4;
  ctx.beginPath(); ctx.moveTo(cx, neckY); ctx.lineTo(cx, hipY); ctx.stroke();
  for (let i = 0; i < 5; i++) { const yy = chestY + i * 2.6; ctx.beginPath(); ctx.moveTo(cx - B.chest * 0.7, yy + 1); ctx.quadraticCurveTo(cx, yy - 1, cx + B.chest * 0.7, yy + 1); ctx.stroke(); }
  if (conceal) { // objeto denso escondido na cintura/tronco
    const ox = cx - 7, oy = waistY - 5;
    ctx.fillStyle = 'rgba(16,26,34,.92)'; ctx.fillRect(ox, oy, 15, 9);
    ctx.strokeStyle = 'rgba(120,255,200,.9)'; ctx.lineWidth = 0.8; ctx.strokeRect(ox, oy, 15, 9);
    ctx.beginPath(); ctx.moveTo(ox + 4, oy); ctx.lineTo(ox + 4, oy - 4); ctx.lineTo(ox + 11, oy - 4); ctx.lineTo(ox + 11, oy); ctx.stroke();
    ctx.fillStyle = 'rgba(255,70,70,.95)'; ctx.beginPath(); ctx.arc(ox + 17, oy - 2, 1.5, 0, 6.29); ctx.fill();
  }
  // DISCREPÂNCIA DE BIOTIPO: quando o corpo não bate com o sexo declarado,
  // o scanner marca os pontos que traem o disfarce (ombros/quadril/densidade).
  if (B.mismatch) {
    const cross = 'rgba(255,70,70,.9)';
    ctx.strokeStyle = cross; ctx.lineWidth = 0.7;
    const mark = (x, y, w) => { ctx.beginPath(); ctx.moveTo(x - w, y - w); ctx.lineTo(x + w, y + w); ctx.moveTo(x + w, y - w); ctx.lineTo(x - w, y + w); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,70,70,.45)'; ctx.beginPath(); ctx.arc(x, y, w + 1.5, 0, 6.29); ctx.stroke(); ctx.strokeStyle = cross; };
    mark(cx - B.shoulder + 1, shoulderY + 2, 2.4);   // largura de ombro
    mark(cx + B.shoulder - 1, shoulderY + 2, 2.4);
    mark(cx + B.hip - 1, hipY, 2.2);                 // estreiteza de quadril
    ctx.setLineDash([1.5, 1.5]); ctx.strokeStyle = 'rgba(255,90,90,.55)';
    ctx.beginPath(); ctx.moveTo(cx - B.shoulder, shoulderY + 2); ctx.lineTo(cx + B.shoulder, shoulderY + 2); ctx.stroke();
    ctx.setLineDash([]);
  }
  ctx.fillStyle = 'rgba(120,255,200,.85)'; ctx.font = '4px "VT323", monospace'; ctx.textAlign = 'left';
  ctx.fillText(cold ? 'TERM ..,. C' : 'TERM 36,6 C', 6, 10);
  const biotermo = B.girth > 0.5 ? 'PESADO' : (B.girth > 0.28 ? 'CHEIO' : ['MAGRO', 'MEDIO', 'FORTE'][B.build]);
  const altura = B.height > 0.4 ? ' ALTO' : (B.height < -0.4 ? ' BAIXO' : '');
  const bio = biotermo + (B.fem ? ' F' : ' M') + altura;
  if (B.mismatch) {
    ctx.fillStyle = 'rgba(255,80,80,.95)'; ctx.fillText('DECL: ' + (B.apparentFem ? 'F' : 'M'), 6, 111);
    ctx.fillText('BIO: ' + bio + ' !!', 6, 116);
  } else {
    ctx.fillText(bio, 6, 116);
  }
  ctx.textAlign = 'right';
  ctx.fillStyle = 'rgba(120,255,200,.85)';
  ctx.fillText(conceal ? 'OBJ: 1 !!' : 'OBJ: --', 94, 116);
}

/* a cena de cada zona do exame */
function examZoneSVG(f, phys, zone) {
  phys = phys || {};
  const seed = faceSeedOf(f);
  const base = Object.assign({
    w: 132, h: 158, bg: '#101208', paintScale: 2.7,
    waxy: !!phys.pele, veins: !!phys.olhos, brightSclera: !!phys.piscar,
    post: { levels: 6, ditherAmp: 0.14, grain: 3, aberr: 0, scan: 0.06, vig: 0.5, sat: 0.34 },
  }, physAnomOpts(phys));
  const F = (o) => renderPortraitCanvas(f, Object.assign({}, base, o)).toDataURL();

  if (zone === 'olhos') {
    // um olho enche a tela e se mexe (sacadas + piscada); olhar morto/dilatado
    // ou ausência de piscada = Alternado.
    return eyeMacroSVG(f, phys);
  }
  if (zone === 'corpo') {
    // EXAME FÍSICO: o corpo inteiro despido desta pessoa (verificação de sexo
    // biológico), com o feixe do scanner descendo. A anatomia denuncia o
    // disfarce de gênero — e um objeto de contrabando escondido na cintura.
    const url = renderScene((c) => paintBodyNude(c, f, phys), seed ^ 0xB0D, { w: 150, h: 180, paintScale: 2.7, post: { levels: 8, ditherAmp: 0.16, grain: 3, aberr: 0, scan: 0.06, sat: 0.7 } }).toDataURL();
    return `<image href="${url}" width="200" height="240" preserveAspectRatio="none" style="image-rendering:pixelated"/>` +
      `<rect x="0" y="0" width="200" height="2.5" fill="rgba(120,255,200,.5)"><animate attributeName="y" values="0;238;0" dur="2.6s" repeatCount="indefinite"/></rect>`;
  }
  if (zone === 'boca') {
    const zo = { zoom: 2.9, focusY: 63 };
    const tp = !!phys.dentes;
    return seqSVG([
      { url: F(zo), len: 1.2 },
      { url: F(Object.assign({ mouthOpen: 0.45, teethPerfect: tp }, zo)), len: 0.5 },
      { url: F(Object.assign({ mouthOpen: 1, teethPerfect: tp }, zo)), len: 2.9 },
      { url: F(Object.assign({ mouthOpen: 1, teethPerfect: tp, postSeed: 5 }, zo)), len: 1.5 },
    ]);
  }
  if (zone === 'pele') {
    // sat mais alta aqui: a cor da pele (azul/livor) É a informação; a
    // dessaturação padrão do VHS estava apagando o desvio.
    const mkF = (sh) => renderScene((c) => paintSkinMacro(c, f, phys, sh), seed ^ (0x51 + sh), {
      w: 132, h: 158, paintScale: 2.7,
      post: { levels: 6, ditherAmp: 0.14, grain: 3, aberr: 0, scan: 0.06, vig: 0.4, sat: 0.62 },
    }).toDataURL();
    return seqSVG([{ url: mkF(0), len: 1.9 }, { url: mkF(1), len: 1.9 }]);
  }
  if (zone === 'maos') {
    const mkF = (mode, ps) => renderScene((c) => paintHandScene(c, f, phys, mode), seed ^ ps, {
      w: 132, h: 158, paintScale: 2.7,
      post: { levels: 6, ditherAmp: 0.14, grain: 3, aberr: 0, scan: 0.06, vig: 0.5, sat: 0.4 },
    }).toDataURL();
    return seqSVG([
      { url: mkF('palm-far', 0x91), len: 0.9 },
      { url: mkF('palm', 0x92), len: 2.7 },
      { url: mkF('dorsal', 0x93), len: 2.7 },
    ]);
  }
  if (zone === 'pescoco') {
    const z = 2.0, fx = 50, fy = 71;
    const url = F({ zoom: z, focusX: fx, focusY: fy });
    const mapX = (x) => (((x - fx) * z + fx) * 2).toFixed(1);
    const mapY = (y) => (((y - fy) * z + fy) * 2).toFixed(1);
    // o pulso na carótida: normal ~84bpm; anômalo, 6 POR MINUTO —
    // você espera dez segundos pela próxima batida. ela vem.
    const per = phys.pescoco ? 10 : 0.72;
    const pulse =
      `<ellipse cx="${mapX(44.5)}" cy="${mapY(76)}" rx="9" ry="13" fill="rgb(188,124,106)" opacity="0">` +
      `<animate attributeName="opacity" values="0;.26;0" keyTimes="0;.06;.16" dur="${per}s" repeatCount="indefinite"/></ellipse>` +
      `<ellipse cx="${mapX(44.5)}" cy="${mapY(76)}" rx="4.5" ry="7" fill="rgb(210,150,128)" opacity="0">` +
      `<animate attributeName="opacity" values="0;.3;0" keyTimes="0;.06;.14" dur="${per}s" repeatCount="indefinite"/></ellipse>`;
    return `<image href="${url}" width="200" height="240" preserveAspectRatio="none" style="image-rendering:pixelated"/>${pulse}`;
  }
  return examSVG(f, phys);
}

/* ---------- O Silente: o único retrato deliberadamente errado ---------- */
function paintSilente(ctx) {
  const cx = 50;
  ctx.fillStyle = 'rgb(12,12,14)';
  ctx.beginPath();
  ctx.moveTo(12, 122); ctx.bezierCurveTo(13, 88, 32, 80, 50, 79);
  ctx.bezierCurveTo(68, 80, 87, 88, 88, 122); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgb(208,203,188)';
  ctx.fillRect(cx - 5, 60, 10, 22);
  // cabeça comprida demais
  ctx.fillStyle = 'rgb(222,217,202)';
  ctx.beginPath(); ctx.ellipse(cx, 42, 19, 30, 0, 0, 6.29); ctx.fill();
  // sem modelagem — a ausência de planos é o que perturba
  soft(ctx, cx, 24, 12, 8, 'rgba(255,255,248,.5)', 3);
  // olhos: buracos, baixos demais
  ctx.fillStyle = 'rgb(4,4,5)';
  ctx.beginPath(); ctx.ellipse(cx - 8, 46, 4.4, 6.2, 0, 0, 6.29); ctx.fill();
  ctx.beginPath(); ctx.ellipse(cx + 8, 46, 4.4, 6.2, 0, 0, 6.29); ctx.fill();
  // a linha onde deveria haver uma boca
  ctx.strokeStyle = 'rgba(120,115,100,.8)'; ctx.lineWidth = 0.8;
  ctx.beginPath(); ctx.moveTo(cx - 7, 64); ctx.lineTo(cx + 7, 64); ctx.stroke();
  // chapéu de aba baixa
  ctx.fillStyle = 'rgb(10,10,12)';
  ctx.beginPath(); ctx.ellipse(cx, 21, 25, 5, 0, 0, 6.29); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx - 15, 21); ctx.bezierCurveTo(cx - 15, 6, cx + 15, 6, cx + 15, 21);
  ctx.closePath(); ctx.fill();
}
function silentePortraitCanvas(o) {
  o = o || {};
  const W = o.w || 160, H = o.h || 192;
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const hi = document.createElement('canvas'); hi.width = 320; hi.height = 384;
  const hc = hi.getContext('2d');
  if (o.bg) { hc.fillStyle = o.bg; hc.fillRect(0, 0, 320, 384); }
  F_SCALE = 3.2;
  hc.scale(3.2, 3.2);
  paintSilente(hc);
  const ctx = cv.getContext('2d');
  ctx.drawImage(hi, 0, 0, W, H);
  analogPost(ctx, W, H, 665599, { sat: 0.12, aberr: 3, levels: 9, grain: 22, scan: 0.2, tears: 3, bleed: 0.4 });
  return cv;
}
function silenteSVG() {
  return `<image href="${silentePortraitCanvas().toDataURL()}" width="100" height="120" style="image-rendering:pixelated" preserveAspectRatio="none"/>`;
}

/* ---------- busto grande do guichê (substitui o photobash) ---------- */
/* opções de anomalia do cidadão vivo (nunca vão pra foto do documento) */
function actorAnomOpts(cz) {
  const a = (cz && cz.anom) || {};
  return {
    skinShift: a.skinShift || 0, skinTone: a.skinTone,
    smile: a.smile || 0, teethBright: !!a.teethBright, deadStare: !!a.deadStare,
    slitPupil: !!a.slitPupil, blackSclera: !!a.blackSclera, neckSeam: !!a.neckSeam, anisocoria: !!a.anisocoria,
    waxy: !!(cz && cz.phys && cz.phys.pele), veins: !!(cz && cz.phys && cz.phys.olhos),
  };
}
// PIXEL-ART: rendemos numa resolução BAIXA (64×77) e deixamos o blitActor
// ampliar com nearest-neighbor. O look é assumidamente pixelado — mão-de-obra
// humana de serigrafia/8-bit, o oposto do airbrush liso de imagem-de-IA.
// Sem aberração/tears/dither pesado: isso vira lama nesse tamanho de pixel.
function renderActorFrame(cz, eyesClosed) {
  if (cz && cz.isSilente) return silentePortraitCanvas({ w: 72, h: 86 });
  return renderPortraitCanvas(cz.features, Object.assign({
    // 72px: pixel-art chunky, mas com resolução suficiente pros olhos lerem
    // vivos (a 64 alguns viravam órbitas escuras). paintH maior (134) abre
    // espaço embaixo pras MÃOS apoiadas no balcão — a pessoa tem braços.
    w: 72, h: 96, paintH: 134, eyesClosed: !!eyesClosed, companion: cz && cz.companion,
    counterHands: !(cz && cz.companion),   // quem segura bebê/criança está de mãos ocupadas
    post: { levels: 8, ditherAmp: 0.08, grain: 1.5, aberr: 0, scan: 0.06, tears: 0, sat: 0.58, contrast: 1.22 },
  }, actorAnomOpts(cz)));
}
function blitActor(cv, src) {
  const W = cv.width, H = cv.height, ctx = cv.getContext('2d');
  ctx.clearRect(0, 0, W, H);
  const scale = W / src.width * 1.32;
  const dw = src.width * scale, dh = src.height * scale;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(src, (W - dw) / 2, H - dh + 6, dw, dh);
}
function renderActorBust(cz, cv) { blitActor(cv, renderActorFrame(cz, false)); }

/* ---------- PISCAR AO VIVO no guichê ----------
   O busto pisca sozinho em ritmo humano. Quem NÃO pisca (Alternado com o
   tell 'piscar', ou o Silente) simplesmente nunca fecha os olhos — dá pra
   perceber ali, sem exame. Determinístico visualmente, sem tocar o RNG. */
let _blinkRAF = null, _blinkState = null, _blinkLastCv = null;
function startActorBlink(cz, cv) {
  stopActorBlink();
  _blinkLastCv = cv;
  cv.style.transformOrigin = '50% 100%';     // pivô nos pés: balança como quem está de pé
  const open = renderActorFrame(cz, false);
  blitActor(cv, open);
  const a = (cz && cz.anom) || {};
  const noBlink = (cz && cz.isSilente) || (cz && cz.phys && cz.phys.piscar);
  // MOVIMENTO VIVO (transform barato, sem re-render): respiração e leve balanço
  // dão vida; o nervoso treme; o não-humano fica parado DEMAIS e dá um espasmo
  // errado de vez em quando — dá pra desconfiar ali, sem exame.
  const still = !!(a.deadStare || a.clearlyNonHuman) || (cz && cz.isSilente);
  const breatheAmp = still ? 0 : 1;
  const tremor = (cz && cz.nervous && !still) ? 1 : 0;
  const t0 = performance.now();
  const closed = noBlink ? null : renderActorFrame(cz, true);
  const st = {
    cv, open, closed, showing: 'open', still, breatheAmp, tremor,
    next: t0 + 2200 + Math.random() * 3600, closedUntil: 0,
    twitchAt: still ? t0 + 4000 + Math.random() * 5000 : Infinity, twitchUntil: 0,
    tx: 0, ty: 0,
  };
  _blinkState = st;
  const loop = (t) => {
    if (_blinkState !== st) return;           // trocou de cidadão
    // --- piscar ---
    if (closed) {
      if (st.showing === 'open' && t >= st.next) {
        blitActor(cv, closed); st.showing = 'closed'; st.closedUntil = t + 95 + Math.random() * 70;
      } else if (st.showing === 'closed' && t >= st.closedUntil) {
        blitActor(cv, open); st.showing = 'open';
        st.next = t + 2200 + Math.random() * 3800 + (Math.random() < 0.2 ? -1600 : 0);
      }
    }
    // --- movimento (transform) ---
    const s = (t - t0) / 1000;
    let ox = 0, oy = 0, rot = 0, sc = 1;
    if (st.breatheAmp) {
      oy = Math.sin(s * 1.05) * 1.5 + Math.sin(s * 0.37) * 0.7;   // respiração + micro-deriva
      ox = Math.sin(s * 0.53 + 1) * 0.9;
      sc = 1 + (Math.sin(s * 1.05) + 1) * 0.0026;                 // peito enche de leve
      rot = Math.sin(s * 0.41) * 0.16;
    }
    if (st.tremor) {
      // tremor orgânico: soma de senóides rápidas incomensuráveis + deriva suave
      // (não é ruído digital por quadro — treme como mão de gente com frio/medo)
      ox += Math.sin(s * 17.3) * 0.55 + Math.sin(s * 11.1 + 2) * 0.35;
      oy += Math.sin(s * 19.7 + 1) * 0.45 + Math.sin(s * 13.3) * 0.3;
      rot += Math.sin(s * 15.0) * 0.14;
    }
    if (st.still) {
      // espasmo abrupto: alguns quadros de deslocamento errado, e volta seco
      if (t >= st.twitchAt) { st.twitchUntil = t + 70 + Math.random() * 60; st.twitchAt = t + 3500 + Math.random() * 6000; st._tw = (Math.random() - 0.5) * 5; st._ty = (Math.random() - 0.5) * 3; }
      if (t < st.twitchUntil) { ox += st._tw; oy += st._ty; rot += st._tw * 0.15; }
    }
    cv.style.transform = `translate(${ox.toFixed(2)}px,${oy.toFixed(2)}px) rotate(${rot.toFixed(2)}deg) scale(${sc.toFixed(4)})`;
    _blinkRAF = requestAnimationFrame(loop);
  };
  _blinkRAF = requestAnimationFrame(loop);
}
function stopActorBlink() {
  if (_blinkRAF) cancelAnimationFrame(_blinkRAF);
  _blinkRAF = null; _blinkState = null;
  if (_blinkLastCv) { try { _blinkLastCv.style.transform = ''; } catch (e) {} }
}

/* ============================================================
   CAMADA CRT GLOBAL (grão + scanlines + roll sobre o app inteiro)
   ============================================================ */
(function crtInit() {
  try {
    if (document.getElementById('crt-overlay')) return;
    const tile = document.createElement('canvas');
    tile.width = tile.height = 144;
    const tc = tile.getContext('2d');
    const im = tc.createImageData(144, 144);
    const rr = faceRng(424242);
    for (let i = 0; i < im.data.length; i += 4) {
      const v = 118 + Math.floor(rr() * 96);
      im.data[i] = im.data[i + 1] = im.data[i + 2] = v;
      im.data[i + 3] = Math.floor(rr() * 30);
    }
    tc.putImageData(im, 0, 0);
    const d = document.createElement('div');
    d.id = 'crt-overlay';
    d.style.backgroundImage = `url(${tile.toDataURL()})`;
    document.body.appendChild(d);
  } catch (e) {}
})();

/* ============================================================
   TEXTURAS DE UI (papel, painel, madeira) — geradas em runtime e
   entregues ao CSS como custom properties (--tex-*). Nenhum asset.
   ============================================================ */
(function uiTextures() {
  try {
    const doc = document.documentElement;
    const mk2 = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
    // PIXELA a textura: reduz e amplia sem suavização — blocos visíveis de
    // ~3px, casando com a fonte/bustos pixelados (nada de grão fino "liso")
    const pixelate = (cv, f) => {
      const s = mk2(Math.max(2, cv.width / f | 0), Math.max(2, cv.height / f | 0));
      s.getContext('2d').drawImage(cv, 0, 0, s.width, s.height);
      const o = mk2(cv.width, cv.height), g = o.getContext('2d');
      g.imageSmoothingEnabled = false; g.drawImage(s, 0, 0, o.width, o.height);
      return o;
    };
    const set = (k, cv, f) => doc.style.setProperty(k, `url(${pixelate(cv, f || 3).toDataURL()})`);
    const r = faceRng(515151);

    // papel de repartição: fibras, pontinhos, manchas de caneca
    const p = mk2(220, 220); const px = p.getContext('2d');
    px.fillStyle = '#d8d2bd'; px.fillRect(0, 0, 220, 220);
    for (let i = 0; i < 900; i++) { // fibras
      const x = r() * 220, y = r() * 220, a = r() * 6.29, l = 2 + r() * 6;
      px.strokeStyle = r() < 0.5 ? 'rgba(120,108,80,.05)' : 'rgba(250,248,238,.07)';
      px.lineWidth = 0.5;
      px.beginPath(); px.moveTo(x, y); px.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); px.stroke();
    }
    for (let i = 0; i < 260; i++) { // pontinhos de polpa
      px.fillStyle = `rgba(96,84,58,${0.03 + r() * 0.05})`;
      px.fillRect(r() * 220, r() * 220, 1, 1);
    }
    for (let i = 0; i < 4; i++) { // manchas fantasma
      const x = r() * 220, y = r() * 220, rad = 14 + r() * 26;
      const g = px.createRadialGradient(x, y, rad * 0.4, x, y, rad);
      g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(110,92,54,.045)');
      px.fillStyle = g; px.beginPath(); px.arc(x, y, rad, 0, 6.29); px.fill();
    }
    set('--tex-paper', p);

    // painel do posto: chapa escura escovada, riscos de uso
    const m = mk2(200, 200); const mx = m.getContext('2d');
    mx.fillStyle = '#22241d'; mx.fillRect(0, 0, 200, 200);
    for (let i = 0; i < 200; i++) { // escovado vertical
      const x = r() * 200;
      mx.strokeStyle = r() < 0.5 ? 'rgba(0,0,0,.06)' : 'rgba(190,190,168,.025)';
      mx.lineWidth = 0.6 + r();
      mx.beginPath(); mx.moveTo(x, 0); mx.lineTo(x + (r() - 0.5) * 4, 200); mx.stroke();
    }
    for (let i = 0; i < 30; i++) { // riscos de caneta/carimbo/tédio
      const x = r() * 200, y = r() * 200, a = r() * 6.29, l = 3 + r() * 14;
      mx.strokeStyle = `rgba(0,0,0,${0.05 + r() * 0.08})`; mx.lineWidth = 0.5;
      mx.beginPath(); mx.moveTo(x, y); mx.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); mx.stroke();
    }
    for (let i = 0; i < 500; i++) {
      mx.fillStyle = `rgba(0,0,0,${0.04 + r() * 0.05})`;
      mx.fillRect(r() * 200, r() * 200, 1, 1);
    }
    // estrias horizontais finíssimas (a chapa foi escovada; ladrilha sem emenda)
    for (let i = 0; i < 26; i++) {
      const y = r() * 200;
      mx.strokeStyle = r() < 0.5 ? 'rgba(0,0,0,.05)' : 'rgba(196,196,172,.03)';
      mx.lineWidth = 0.5 + r() * 0.6;
      mx.beginPath(); mx.moveTo(0, y); mx.lineTo(200, y + (r() - 0.5) * 1.5); mx.stroke();
    }
    // alguns fios de escovado mais claros, dão a leitura de metal, não papel
    for (let i = 0; i < 8; i++) {
      const x = r() * 200;
      mx.strokeStyle = 'rgba(210,210,186,.045)'; mx.lineWidth = 0.7;
      mx.beginPath(); mx.moveTo(x, 0); mx.lineTo(x + (r() - 0.5) * 3, 200); mx.stroke();
    }
    set('--tex-panel', m);

    // a mesa: tábuas de carvalho envernizado, veio profundo, nós, chanfros,
    // parafusos de repartição e as marcas de anos de caneca e caneca de café
    const w = mk2(240, 160); const wx = w.getContext('2d');
    const plankH = 40;
    for (let plank = 0; plank < 4; plank++) {
      const y0 = plank * plankH;
      const tone = 58 + Math.floor(r() * 16);
      // base com leve gradiente ao longo da tábua (não é cor chapada)
      const bg = wx.createLinearGradient(0, y0, 240, y0);
      bg.addColorStop(0, `rgb(${tone + 12},${tone - 6},${tone - 28})`);
      bg.addColorStop(0.5, `rgb(${tone + 16},${tone - 2},${tone - 24})`);
      bg.addColorStop(1, `rgb(${tone + 10},${tone - 7},${tone - 29})`);
      wx.fillStyle = bg; wx.fillRect(0, y0, 240, plankH);
      // cerne: faixas largas de tom quente
      for (let i = 0; i < 3; i++) {
        const yy = y0 + 6 + r() * 28, hgt = 3 + r() * 6;
        wx.fillStyle = `rgba(${tone + 26},${tone + 2},${tone - 20},${0.06 + r() * 0.05})`;
        wx.beginPath(); wx.moveTo(0, yy);
        for (let x = 0; x <= 240; x += 24) wx.lineTo(x, yy + Math.sin(x * 0.045 + plank * 1.7 + i) * 2.6);
        for (let x = 240; x >= 0; x -= 24) wx.lineTo(x, yy + hgt + Math.sin(x * 0.045 + plank * 1.7 + i) * 2.6);
        wx.closePath(); wx.fill();
      }
      for (let i = 0; i < 14; i++) { // veio fino
        const yy = y0 + 2 + r() * 36;
        wx.strokeStyle = `rgba(26,16,8,${0.08 + r() * 0.14})`;
        wx.lineWidth = 0.4 + r() * 0.9;
        wx.beginPath(); wx.moveTo(0, yy);
        for (let x = 0; x <= 240; x += 24) wx.lineTo(x, yy + Math.sin(x * 0.05 + plank + i) * 2.2);
        wx.stroke();
      }
      if (r() < 0.75) { // nó, com desvio do veio ao redor
        const kx = 20 + r() * 200, ky = y0 + 10 + r() * 20;
        wx.fillStyle = 'rgba(24,15,7,.28)'; wx.beginPath(); wx.ellipse(kx, ky, 3.4, 2.2, 0.2, 0, 6.29); wx.fill();
        wx.strokeStyle = 'rgba(20,12,6,.5)'; wx.lineWidth = 0.9;
        for (let k = 1; k < 5; k++) { wx.beginPath(); wx.ellipse(kx, ky, k * 2.6, k * 1.5, 0.2, 0, 6.29); wx.stroke(); }
      }
      // chanfro entre tábuas: sombra funda embaixo + fio de luz em cima da próxima
      wx.fillStyle = 'rgba(0,0,0,.5)'; wx.fillRect(0, y0 + plankH - 1.6, 240, 1.6);
      wx.fillStyle = 'rgba(255,240,210,.07)'; wx.fillRect(0, y0 + 0.4, 240, 0.8);
      // parafusos de latão nas pontas da tábua (mesa de repartição)
      for (const sx of [7, 233]) {
        const sy = y0 + plankH / 2;
        wx.fillStyle = '#6b5a34'; wx.beginPath(); wx.arc(sx, sy, 2.2, 0, 6.29); wx.fill();
        wx.strokeStyle = 'rgba(0,0,0,.5)'; wx.lineWidth = 0.5; wx.beginPath(); wx.moveTo(sx - 1.5, sy); wx.lineTo(sx + 1.5, sy); wx.stroke();
        wx.fillStyle = 'rgba(255,240,200,.4)'; wx.fillRect(sx - 1.6, sy - 1.8, 1.4, 0.8);
      }
    }
    // (sem marca de caneca no tile — ela ladrilharia numa grade artificial;
    //  o desgaste do centro fica por conta do brilho não-repetido do CSS)
    // arranhões e respingos de tinta de carimbo
    for (let i = 0; i < 40; i++) {
      const x = r() * 240, y = r() * 160, a = r() * 6.29, l = 2 + r() * 16;
      wx.strokeStyle = `rgba(10,6,3,${0.05 + r() * 0.1})`; wx.lineWidth = 0.4;
      wx.beginPath(); wx.moveTo(x, y); wx.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); wx.stroke();
    }
    for (let i = 0; i < 10; i++) { wx.fillStyle = `rgba(${20 + r() * 40 | 0},${10},${8},${0.1 + r() * 0.2})`; wx.beginPath(); wx.arc(r() * 240, r() * 160, 0.5 + r() * 1.1, 0, 6.29); wx.fill(); }
    set('--tex-wood', w);

    // guilhochê de segurança: curvas espirográficas finas e ENTRELAÇADAS
    // (marca d'água densa de documento oficial). Duas famílias de anéis com
    // fases opostas se cruzam; roseta central; rosetas aninhadas nos cantos.
    const gl = mk2(220, 220); const glx = gl.getContext('2d');
    const cxg = 110, cyg = 110;
    const rosace = (ox2, oy2, R0, petals, amp, layers, alpha) => {
      for (let ring = 0; ring < layers; ring++) {
        const R = R0 + ring * (amp * 0.55), k = petals + ring, ph = (ring % 2) * (Math.PI / petals);
        glx.strokeStyle = `rgba(58,48,28,${alpha})`; glx.lineWidth = 0.32;
        glx.beginPath();
        for (let a = 0; a <= 6.2832; a += 0.018) {
          const rad = R + Math.sin(a * k + ph) * amp;
          const x = ox2 + Math.cos(a) * rad, y = oy2 + Math.sin(a) * rad * 0.97;
          if (a === 0) glx.moveTo(x, y); else glx.lineTo(x, y);
        }
        glx.stroke();
      }
    };
    // roseta central grande — duas famílias entrelaçadas
    rosace(cxg, cyg, 26, 6, 8, 6, 0.42);
    rosace(cxg, cyg, 34, 11, 5, 4, 0.3);
    // anel externo com micro-ondulação (borda do documento)
    glx.strokeStyle = 'rgba(58,48,28,.34)'; glx.lineWidth = 0.34;
    glx.beginPath();
    for (let a = 0; a <= 6.2832; a += 0.012) { const rad = 96 + Math.sin(a * 40) * 2.2; const x = cxg + Math.cos(a) * rad, y = cyg + Math.sin(a) * rad * 0.97; if (a === 0) glx.moveTo(x, y); else glx.lineTo(x, y); }
    glx.stroke();
    // rosetas aninhadas nos cantos
    for (const [ox2, oy2] of [[42, 42], [178, 42], [42, 178], [178, 178]]) {
      rosace(ox2, oy2, 10, 7, 4, 3, 0.4);
      rosace(ox2, oy2, 4, 5, 2.4, 2, 0.3);
    }
    set('--tex-guilloche', gl);
  } catch (e) {}
})();

window.portraitSVG = portraitSVG;
window.examSVG = examSVG;
window.examZoneSVG = examZoneSVG;
window.silenteSVG = silenteSVG;
window.renderActorBust = renderActorBust;
window.startActorBlink = startActorBlink;
window.stopActorBlink = stopActorBlink;
window.renderPortraitCanvas = renderPortraitCanvas;
window.analogPostCanvas = analogPostCanvas;
