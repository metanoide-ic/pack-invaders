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
/* Íris: castanho, âmbar-mel, verde-acinzentado, azul-cinza, castanho-claro. */
const F_IRIS = [[58, 40, 26], [120, 82, 40], [70, 92, 74], [78, 96, 112], [96, 70, 44]];

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
  let fw = 19 + f.faceW * 2.4 + r() * 2 - (fem ? 1.6 : 0);        // meia-largura nas bochechas
  let jw = fw * (fem ? 0.78 : 0.82) + r() * 1.6 + E.jaw * 0.6;    // meia-largura do maxilar
  let chinY = 73.5 + r() * 3.5 + (f.idade > 52 ? 1.5 : 0);
  let eyeY = 47 + (r() - 0.5) * 2.4;
  const eyeDX = 10.5 + f.faceW * 0.8 + r() * 1.4;
  const eyeW = 5.05 + r() * 0.8;                      // um pouco menores
  let eyeH = 2.05 + r() * 0.6 + E.eyeH;
  let browY = eyeY - (5 + r() * 2.4) - (f.brow ? 1.2 : 0);
  const noseTip = 58.5 + r() * 2.4;
  let noseW = 4.4 + r() * 1.8 - (fem ? 0.6 : 0) + E.nose;
  const mouthY = 66.5 + r() * 1.8;
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
  const chinW = jw * (fem ? 0.5 : child ? 0.55 : 0.62);          // meia-largura do queixo
  const crownW = fw * (fem ? 0.62 : 0.66);         // largura do topo do crânio
  const ax = (r() - 0.5) * 1.6;                                    // assimetria global
  const tilt = (r() - 0.5) * 0.07;                                 // ninguém posa reto de verdade
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
    cheekY, templeW, gonialY, jawSquare, chinW, crownW,
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
  const SK = L.skin.b, SH = L.skin.s;
  opts = opts || {};

  /* pescoço primeiro — a gola do casaco cobre a base depois */
  ctx.fillStyle = rgb(mix(SK, SH, 0.4));
  ctx.beginPath();
  ctx.moveTo(cx - 9, 66); ctx.quadraticCurveTo(cx - 10, 82, cx - 12, 92);
  ctx.lineTo(cx + 12, 92); ctx.quadraticCurveTo(cx + 10, 82, cx + 9, 66);
  ctx.closePath(); ctx.fill();
  soft(ctx, cx, 88, 9, 4, rgb(darken(SH, 0.2), 0.4), 1.6);

  /* casaco e ombros — lã pesada com trama, dobras e gola de verdade */
  const coatPath = () => {
    ctx.beginPath();
    ctx.moveTo(10, 122); ctx.bezierCurveTo(11, 94, 30, 86, 50, 85);
    ctx.bezierCurveTo(70, 86, 89, 94, 90, 122); ctx.closePath();
  };
  coatPath();
  ctx.fillStyle = opts.coat || 'rgb(45,46,38)';
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
  // abertura central: camisa e botão
  ctx.fillStyle = 'rgba(12,11,8,.85)';
  ctx.beginPath(); ctx.moveTo(46, 96); ctx.lineTo(54, 96); ctx.lineTo(53, 122); ctx.lineTo(47, 122); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgb(148,140,116)';
  ctx.beginPath(); ctx.moveTo(47.5, 96); ctx.lineTo(52.5, 96); ctx.lineTo(51.8, 122); ctx.lineTo(48.2, 122); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(70,62,44,.9)';
  for (const by of [103, 112, 120]) { ctx.beginPath(); ctx.arc(50, by, 0.8, 0, 6.29); ctx.fill(); }
  // gola dobrada (duas abas pegando luz de jeitos diferentes)
  ctx.fillStyle = rgb(mix([45, 46, 38], [235, 238, 210], 0.10));
  ctx.beginPath(); ctx.moveTo(38, 90); ctx.lineTo(47, 95.5); ctx.lineTo(42, 101); ctx.lineTo(33, 93.5); ctx.closePath(); ctx.fill();
  ctx.fillStyle = rgb(mix([45, 46, 38], [10, 10, 8], 0.35));
  ctx.beginPath(); ctx.moveTo(62, 90); ctx.lineTo(53, 95.5); ctx.lineTo(58, 101); ctx.lineTo(67, 93.5); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,.5)'; ctx.lineWidth = 0.5;
  ctx.beginPath(); ctx.moveTo(38, 90); ctx.lineTo(47, 95.5); ctx.lineTo(42, 101); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(62, 90); ctx.lineTo(53, 95.5); ctx.lineTo(58, 101); ctx.stroke();
  ctx.restore();
  // sombra da cabeça caindo no peito
  soft(ctx, 50, 92, 15, 5, 'rgba(0,0,0,.45)', 2.6);
  // luz de recorte nos ombros (separa do fundo escuro)
  ctx.strokeStyle = 'rgba(210,215,190,.16)'; ctx.lineWidth = 0.9;
  ctx.beginPath(); ctx.moveTo(20, 103); ctx.bezierCurveTo(26, 92, 38, 88.5, 49, 88); ctx.stroke();

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
  chiar.addColorStop(0.93, rgb(darken(SH, 0.24), 0.64));            // núcleo da sombra
  chiar.addColorStop(1, rgb(mix(SH, [90, 96, 120], 0.5), 0.34));    // bounce frio na borda
  ctx.fillStyle = chiar; ctx.fillRect(0, 0, 100, 120);

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
  soft(ctx, cx - 0.7, nTip - 1.1, 2.2, 1.9, rgb(lighten(SK, 0.34), 0.6), 1.0);
  soft(ctx, cx + 0.3, nTip + 1.9, 2.6, 1.3, rgb(darken(SH, 0.26), 0.6), 1.1); // base (underside)
  // asas + narinas
  for (const s of [-1, 1]) {
    const axx = cx + s * (nw * 0.82) + (s > 0 ? L.ax * 0.3 : 0);
    soft(ctx, axx, nTip - 0.2, 1.5, 1.7, rgb(s < 0 ? lighten(SK, 0.08) : darken(SH, 0.08), s < 0 ? 0.3 : 0.5), 0.9); // corpo da asa
    soft(ctx, axx + s * 1.2, nTip - 0.5, 0.8, 1.6, rgb(darken(SH, 0.2), s < 0 ? 0.4 : 0.55), 0.7);                  // vinco alar
    ctx.fillStyle = rgb(darken(SH, 0.5), 0.82);                                                                     // narina
    ctx.beginPath(); ctx.ellipse(cx + s * (nw * 0.48), nTip + 1.15, 0.85, 0.62, s * 0.4, 0, 6.29); ctx.fill();
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
    // dentes inferiores espiando (só com a boca bem aberta)
    if (op > 0.55) {
      const y1 = my + openH - 1.6;
      ctx.fillStyle = opts.teethPerfect ? 'rgb(226,222,212)' : 'rgb(196,180,142)';
      for (let i = 0; i < nT; i++) {
        const tx = x0 + i * tw;
        const th = opts.teethPerfect ? 1.4 : 0.9 + rT() * 0.7;
        ctx.fillRect(tx + 0.2, y1 - th + 1.6, tw - 0.4, th);
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
  } else {
  // lábio superior
  ctx.fillStyle = rgb(darken(lipTone, 0.22), 0.95);
  ctx.beginPath();
  ctx.moveTo(cx - mw, my + droop * 0.5 - L.cornerUp);
  ctx.quadraticCurveTo(cx - mw * 0.45, my - 2 - lipFull * 0.5, cx - 1.2, my - 1.7 - lipFull * 0.6);
  ctx.quadraticCurveTo(cx, my - 1.2 - lipFull * 0.4, cx + 1.2, my - 1.7 - lipFull * 0.6);
  ctx.quadraticCurveTo(cx + mw * 0.45, my - 2 - lipFull * 0.5, cx + mw, my + droop * 0.5 - L.cornerUp);
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
  soft(ctx, cx - 1, my + 2.2 + lipFull * 0.5, mw * 0.42, 1 + lipFull * 0.4, 'rgba(255,240,220,.4)', 0.9); // brilho no lábio inferior
  // vinco da boca (a linha mais escura do rosto)
  ctx.strokeStyle = 'rgba(28,16,12,.85)'; ctx.lineWidth = 0.75;
  ctx.beginPath();
  ctx.moveTo(cx - mw, my + droop * 0.5 - L.cornerUp);
  ctx.quadraticCurveTo(cx, my + droop, cx + mw, my + droop * 0.5 - L.cornerUp);
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

  /* ---------- olhos ---------- */
  const eyes = opts.eyesClosed ? 'closed' : 'open';
  const wide = opts.eyesWide ? 1 : 0;       // "abra bem os olhos."
  const lookX = opts.lookX || 0;            // "agora olhe para a esquerda."
  for (const sgn of [-1, 1]) {
    const ex = cx + sgn * L.eyeDX + (sgn > 0 ? L.ax * 0.5 : 0);
    const ey = L.eyeY + (sgn > 0 ? L.ax * 0.35 : 0);
    const ew = L.eyeW, eh = L.eyeH * (1 + wide * 0.65);
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
    const scleraBase = opts.brightSclera ? [234, 232, 220] : [196, 188, 166];
    ctx.fillStyle = rgb(sgn > 0 ? darken(scleraBase, 0.34) : scleraBase);
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
    const pr = 1.45 + (sgn > 0 ? L.pupilSkew : 0);
    const ixx = ex + lookX * 1.25;
    const iy = ey - 0.3 + wide * 0.4;
    const irisC = sgn > 0 ? darken(L.iris, 0.28) : L.iris; // íris do lado sombrio mais escura
    const ig = ctx.createRadialGradient(ixx - 0.6, iy - 0.6, 0.4, ixx, iy, ir);
    ig.addColorStop(0, rgb(lighten(irisC, 0.12)));  // borda superior-esquerda pega luz
    ig.addColorStop(0.55, rgb(irisC));
    ig.addColorStop(0.9, rgb(darken(irisC, 0.55)));
    ig.addColorStop(1, rgb(darken(irisC, 0.7)));    // anel escuro (limbo)
    ctx.fillStyle = ig;
    ctx.beginPath(); ctx.arc(ixx, iy, ir, 0, 6.29); ctx.fill();
    ctx.fillStyle = 'rgb(8,6,5)';
    ctx.beginPath(); ctx.arc(ixx, iy, pr, 0, 6.29); ctx.fill();
    // catchlight: forte no olho da luz, fraco no da sombra
    ctx.fillStyle = `rgba(255,252,244,${sgn < 0 ? 0.85 : 0.4})`;
    ctx.beginPath(); ctx.arc(ixx - 0.9, iy - 0.9, sgn < 0 ? 0.45 : 0.32, 0, 6.29); ctx.fill();
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
      // o dedo que puxa a pálpebra (do próprio examinado, contra o vidro)
      const ftone = mix(SK, SH, 0.3);
      ctx.fillStyle = rgb(ftone);
      ctx.beginPath();
      ctx.moveTo(ex - 2.6, ey + eh + 1.6);
      ctx.quadraticCurveTo(ex - 2.9, ey + eh + 0.9, ex - 1.2, ey + eh + 0.8);
      ctx.lineTo(ex + 2.2, ey + eh + 1);
      ctx.quadraticCurveTo(ex + 3, ey + eh + 1.6, ex + 2.8, ey + eh + 3.4);
      ctx.lineTo(ex + 2.4, ey + eh + 12);
      ctx.lineTo(ex - 2.2, ey + eh + 12);
      ctx.closePath(); ctx.fill();
      soft(ctx, ex, ey + eh + 2.4, 1.8, 1, rgb(lighten(SK, 0.4), 0.5), 0.8); // polpa contra o vidro
      ctx.strokeStyle = rgb(darken(SH, 0.2), 0.5); ctx.lineWidth = 0.4;
      ctx.beginPath(); ctx.moveTo(ex - 2, ey + eh + 5.5); ctx.lineTo(ex + 2.2, ey + eh + 5.2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(ex - 1.8, ey + eh + 8.4); ctx.lineTo(ex + 2, ey + eh + 8.1); ctx.stroke();
    }
    // canto interno
    ctx.fillStyle = rgb(mix(SH, [130, 60, 50], 0.5), 0.6);
    ctx.beginPath(); ctx.arc(ex - sgn * ew, ey + 0.2, 0.5, 0, 6.29); ctx.fill();
  }

  /* sobrancelhas: FORMA preenchida e afilada (grossa no meio, fina na cauda),
     seguindo a arcada — não um risco. A do lado da sombra é mais escura. */
  for (const sgn of [-1, 1]) {
    const ex = cx + sgn * L.eyeDX, by = L.browY + (sgn > 0 ? L.ax * 0.5 : 0);
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
    // fios por cima (seguem o arco, apontam pra cauda)
    const n = L.fem ? 13 : 19;
    ctx.lineWidth = 0.42;
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1);
      const bx = inX + (tlX - inX) * t;
      const yy = by + 1 - Math.sin(t * 2.6) * (f.brow ? 1.6 : 0.9) + (r() - 0.5) * 0.5;
      ctx.strokeStyle = rgb(r() < 0.5 ? darken(L.hair, 0.4) : lighten(L.hair, 0.28), dark ? 0.5 : 0.72);
      ctx.beginPath(); ctx.moveTo(bx, yy + 0.9);
      ctx.lineTo(bx + sgn * (0.7 + t * 0.8), yy - 0.7 - r() * 0.4); ctx.stroke();
    }
  }

  /* ---------- cabelo ---------- */
  const HC = L.hair;
  if (f.hat !== 2) {
    ctx.save();
    const hs = f.hairStyle;
    const topY = 17, hlY = [33, 29, 25, 27][hs] + r() * 2; // linha do cabelo
    // massa base — traçado reutilizável (preenche E recorta os fios, para
    // nenhum fio escapar pra testa como "garra")
    const hairMass = () => {
      ctx.beginPath();
      ctx.moveTo(cx - L.fw - 0.6, 48);
      ctx.bezierCurveTo(cx - L.fw - 2, topY + 2, cx - L.fw * 0.5, topY - 4.5, cx, topY - 4.5);
      ctx.bezierCurveTo(cx + L.fw * 0.5, topY - 4.5, cx + L.fw + 2 + L.ax, topY + 2, cx + L.fw + 0.6 + L.ax, 48);
      // recorte da testa (linha do cabelo por estilo)
      if (hs === 2) { // recuado / calvície
        ctx.lineTo(cx + L.fw * 0.92, hlY - 3);
        ctx.quadraticCurveTo(cx + L.fw * 0.5, hlY + 5, cx, hlY - 8 + (f.idade > 55 ? 3 : 0));
        ctx.quadraticCurveTo(cx - L.fw * 0.5, hlY + 5, cx - L.fw * 0.92, hlY - 3);
      } else if (hs === 3) { // penteado pra trás
        ctx.lineTo(cx + L.fw * 0.96 + L.ax, hlY);
        ctx.quadraticCurveTo(cx, hlY - 4, cx - L.fw * 0.96, hlY);
      } else if (hs === 1) { // cheio, com franja recortada (dá "bico" de franja)
        ctx.lineTo(cx + L.fw * 0.98 + L.ax, hlY + 4);
        for (let k = 5; k >= 0; k--) { // borda de franja denteada (mechas)
          const fx = cx + (k / 5 - 0.5) * L.fw * 1.7;
          ctx.quadraticCurveTo(fx + L.fw * 0.08, hlY + 6.5, fx, hlY + (k % 2 ? 2.5 : 5.5));
        }
        ctx.lineTo(cx - L.fw * 0.98, hlY + 5);
      } else { // repartido de lado
        ctx.lineTo(cx + L.fw * 0.97 + L.ax, hlY + 2);
        ctx.quadraticCurveTo(cx + L.fw * 0.3, hlY + 4.5, cx - L.fw * 0.35, hlY - 1.5);
        ctx.quadraticCurveTo(cx - L.fw * 0.75, hlY, cx - L.fw * 0.97, hlY + 3);
      }
      ctx.closePath();
    };
    ctx.fillStyle = rgb(HC);
    hairMass(); ctx.fill();
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
    for (let i = 0; i < 150; i++) {
      const t = r();
      const hx = cx + (t - 0.5) * L.fw * 2.1;
      const hy = topY - 4 + r() * (hs === 2 ? 8 : 16);
      const tone = r();
      ctx.lineWidth = 0.55 + r() * 0.4;
      ctx.strokeStyle = tone < 0.5 ? rgb(darken(HC, 0.5), 0.55) : rgb(lighten(HC, 0.4), 0.42);
      ctx.beginPath(); ctx.moveTo(hx, hy);
      if (hs === 3) ctx.quadraticCurveTo(hx + 1, hy + 4, hx + 0.5, hy + 8);        // pra trás
      else if (hs === 1) ctx.quadraticCurveTo(hx + (t - 0.5) * 2, hy + 4, hx + (t - 0.5) * 3, hy + 8); // franja pra baixo
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
  }

  ctx.restore(); // fim da inclinação da cabeça
}
function mwSafe(L) { return Math.max(6, L.mouthW * 0.9); }

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
    rr *= 1.045; gg *= 1.03; bb *= 0.90;
    rr = (rr - 118) * con + 118 - 6; gg = (gg - 118) * con + 118 - 6; bb = (bb - 118) * con + 118 - 6;
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
  hi.width = Math.round(100 * S); hi.height = Math.round(120 * S);
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
const PORTRAIT_POST = { levels: 8, ditherAmp: 0.9, grain: 12, aberr: 1, scan: 0.09, vig: 0.4, sat: 0.45 };
function portraitSVG(f) {
  const cv = renderPortraitCanvas(f, { w: 160, h: 192, bg: '#8a8778', post: PORTRAIT_POST });
  return `<image href="${cv.toDataURL()}" width="100" height="120" style="image-rendering:pixelated" preserveAspectRatio="none"/>`;
}

/* close-up do exame: mesmo rosto, mais perto, marcas do corpo visíveis */
function examSVG(f, phys) {
  phys = phys || {};
  const o = {
    w: 400, h: 480, bg: '#12130f',
    zoom: 1.55, focusY: 50, paintScale: 4,
    waxy: !!phys.pele, veins: !!phys.olhos, brightSclera: !!phys.piscar,
    post: { levels: 13, ditherAmp: 0.6, grain: 8, aberr: 2, scan: 0.13, vig: 0.55, tears: 1, sat: 0.34 },
  };
  const open = renderPortraitCanvas(f, o).toDataURL();
  let s = `<image href="${open}" width="200" height="240" preserveAspectRatio="none"/>`;
  if (!phys.piscar) {
    // humanos piscam: um segundo frame com os olhos fechados cruza por cima.
    // quem não pisca, não pisca — o frame simplesmente não existe.
    const closed = renderPortraitCanvas(f, Object.assign({}, o, { eyesClosed: true, postSeed: 0 })).toDataURL();
    const dur = (3.2 + (faceSeedOf(f) % 5) * 0.55).toFixed(2);
    s += `<image href="${closed}" width="200" height="240" preserveAspectRatio="none" opacity="0">` +
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
  const SK = L.skin.b, SH = L.skin.s;
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
    // cera: planícies lisas, um lustre que pele não deveria ter
    soft(ctx, 38 + j, 44, 30, 22, 'rgba(255,252,240,.16)', 4);
    soft(ctx, 62 + j, 78, 26, 18, 'rgba(255,250,238,.10)', 4);
    soft(ctx, 50, 60, 44, 40, rgb(lighten(SK, 0.08), 0.5), 5);
    // nem um poro. conte. nem um.
  } else {
    // poros
    ctx.fillStyle = rgb(darken(SH, 0.2), 0.16);
    for (let i = 0; i < 620; i++) {
      const x = r() * 100, y = r() * 120;
      ctx.fillRect(x, y, 0.45 + r() * 0.35, 0.45 + r() * 0.35);
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
  // fundo: o guichê escuro atrás do vidro
  const bg = ctx.createRadialGradient(50, 52, 8, 50, 60, 95);
  bg.addColorStop(0, '#20221a'); bg.addColorStop(1, '#070806');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, 100, 120);
  // um vulto do dono da mão, desfocado, atrás
  soft(ctx, 50, 34, 20, 26, 'rgba(16,14,10,.9)', 5);
  soft(ctx, 50, 22, 11, 12, rgb(mix(SK, SH, 0.6), 0.25), 5);

  const far = mode === 'palm-far';
  const dorsal = mode === 'dorsal';
  const sc = far ? 0.62 : 1;              // aproximando do vidro
  const cy = far ? 74 : 66;               // centro da palma
  const fingerLen = (anom ? 30 : 23) * sc; // "dedos compridos demais para as mãos"
  const palmW = 17 * sc, palmH = 21 * sc;
  const tone = mix(SK, [255, 250, 240], far ? 0 : 0.10); // prensada = mais pálida
  ctx.save();
  ctx.translate(50 + (far ? 4 : 0), 0);
  ctx.rotate((r() - 0.5) * 0.06);
  // dedos (4) — colunas com juntas
  for (let i = 0; i < 4; i++) {
    const fx = -palmW + 2.6 + i * ((palmW * 2 - 5) / 3);
    const fw2 = (3.4 - Math.abs(i - 1.6) * 0.34) * sc;
    const fl = fingerLen * (i === 0 ? 0.82 : i === 1 ? 1 : i === 2 ? 0.96 : 0.78);
    const top = cy - palmH * 0.85 - fl;
    ctx.fillStyle = rgb(tone);
    ctx.beginPath();
    ctx.moveTo(fx - fw2, cy - palmH * 0.5);
    ctx.lineTo(fx - fw2 * 0.92, top + fw2);
    ctx.quadraticCurveTo(fx, top - fw2 * 0.5, fx + fw2 * 0.92, top + fw2);
    ctx.lineTo(fx + fw2, cy - palmH * 0.5);
    ctx.closePath(); ctx.fill();
    // sombra lateral do dedo (lâmpada à esquerda)
    ctx.fillStyle = rgb(darken(SH, 0.1), 0.35);
    ctx.fillRect(fx + fw2 * 0.4, top + fw2, fw2 * 0.55, fl);
    if (dorsal) {
      // unhas: com meia-lua (normal) ou ovais idênticas sem meia-lua (anômalo)
      const nw = fw2 * 0.72, nh = anom ? fw2 * 1.5 : fw2 * 1.15;
      ctx.fillStyle = anom ? 'rgb(214,206,196)' : rgb(mix(tone, [235, 220, 200], 0.6));
      ctx.beginPath(); ctx.ellipse(fx, top + fw2 * 1.5, nw, nh, 0, 0, 6.29); ctx.fill();
      ctx.strokeStyle = rgb(darken(SH, 0.25), 0.5); ctx.lineWidth = 0.35;
      ctx.beginPath(); ctx.ellipse(fx, top + fw2 * 1.5, nw, nh, 0, 0, 6.29); ctx.stroke();
      if (!anom) {
        // a meia-lua
        ctx.fillStyle = 'rgba(245,242,232,.8)';
        ctx.beginPath(); ctx.ellipse(fx, top + fw2 * 1.5 + nh * 0.55, nw * 0.66, nh * 0.3, 0, 0, 6.29); ctx.fill();
        if (i === 2) { // uma unha machucada — vida real
          ctx.fillStyle = 'rgba(64,40,60,.55)';
          ctx.beginPath(); ctx.ellipse(fx - nw * 0.2, top + fw2 * 1.4, nw * 0.5, nh * 0.4, 0.4, 0, 6.29); ctx.fill();
        }
      }
      // juntas do dorso: vincos + pele esticada
      ctx.strokeStyle = rgb(darken(SH, 0.2), anom ? 0.18 : 0.5); ctx.lineWidth = 0.4;
      for (const t of [0.42, 0.72]) {
        const jy = top + fl * t;
        ctx.beginPath(); ctx.moveTo(fx - fw2 * 0.8, jy);
        ctx.quadraticCurveTo(fx, jy + 1, fx + fw2 * 0.8, jy); ctx.stroke();
      }
    } else {
      // palma contra o vidro: polpas prensadas, mais claras
      ctx.fillStyle = rgb(lighten(tone, 0.35), far ? 0.2 : 0.75);
      ctx.beginPath(); ctx.ellipse(fx, top + fw2 * 1.6, fw2 * 0.8, fw2 * 1.1, 0, 0, 6.29); ctx.fill();
      // vincos das falanges
      ctx.strokeStyle = rgb(darken(SH, 0.25), anom ? 0.15 : 0.55); ctx.lineWidth = 0.45;
      for (const t of [0.38, 0.68]) {
        const jy = top + fl * t;
        ctx.beginPath(); ctx.moveTo(fx - fw2 * 0.85, jy);
        ctx.quadraticCurveTo(fx, jy + 1.2, fx + fw2 * 0.85, jy); ctx.stroke();
      }
    }
  }
  // polegar
  ctx.fillStyle = rgb(tone);
  ctx.beginPath();
  ctx.moveTo(-palmW - 1, cy + 2);
  ctx.quadraticCurveTo(-palmW - 8 * sc, cy - 4, -palmW - 9 * sc, cy - 12 * sc);
  ctx.quadraticCurveTo(-palmW - 8.5 * sc, cy - 16 * sc, -palmW - 5.5 * sc, cy - 15 * sc);
  ctx.quadraticCurveTo(-palmW - 1.5, cy - 8, -palmW + 2, cy - 2);
  ctx.closePath(); ctx.fill();
  // palma / dorso
  ctx.fillStyle = rgb(tone);
  ctx.beginPath(); ctx.ellipse(0, cy, palmW, palmH, 0, 0, 6.29); ctx.fill();
  const shade = ctx.createLinearGradient(-palmW, 0, palmW, 0);
  shade.addColorStop(0, 'rgba(255,246,224,.12)');
  shade.addColorStop(0.6, 'rgba(0,0,0,0)');
  shade.addColorStop(1, rgb(darken(SH, 0.15), 0.4));
  ctx.fillStyle = shade;
  ctx.beginPath(); ctx.ellipse(0, cy, palmW, palmH, 0, 0, 6.29); ctx.fill();
  if (!dorsal && !far) {
    // área de contato: um halo de condensação em volta da carne prensada
    soft(ctx, 0, cy - 2, palmW * 1.5, palmH * 1.3, 'rgba(224,230,214,.10)', 4);
    soft(ctx, 0, cy - 1, palmW * 0.8, palmH * 0.7, rgb(lighten(tone, 0.3), 0.5), 3);
    if (anom) {
      // palma SEM linhas. ninguém repara até reparar.
      soft(ctx, 0, cy, palmW * 0.7, palmH * 0.6, rgb(lighten(tone, 0.15), 0.5), 3);
    } else {
      // as três linhas que toda palma tem
      ctx.strokeStyle = rgb(darken(SH, 0.3), 0.6); ctx.lineWidth = 0.6;
      ctx.beginPath(); ctx.moveTo(-palmW * 0.7, cy - palmH * 0.35);
      ctx.quadraticCurveTo(0, cy - palmH * 0.05, palmW * 0.75, cy - palmH * 0.3); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-palmW * 0.75, cy + palmH * 0.05);
      ctx.quadraticCurveTo(-palmW * 0.1, cy + palmH * 0.3, palmW * 0.7, cy + palmH * 0.12) ; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-palmW * 0.5, cy + palmH * 0.8);
      ctx.quadraticCurveTo(-palmW * 0.55, cy + palmH * 0.3, -palmW * 0.25, cy - palmH * 0.5); ctx.stroke();
      // calos na base dos dedos
      for (let i = 0; i < 4; i++) {
        const fx = -palmW + 2.6 + i * ((palmW * 2 - 5) / 3);
        soft(ctx, fx, cy - palmH * 0.62, 1.8, 1.2, rgb(mix(tone, [200, 170, 130], 0.5), 0.5), 1);
      }
    }
  }
  if (dorsal && !anom) {
    // a aliança apertada demais para sair (dedo anelar)
    const fx = -palmW + 2.6 + 2 * ((palmW * 2 - 5) / 3);
    const ry = cy - palmH * 0.85 - fingerLen * 0.96 * 0.30;
    ctx.fillStyle = 'rgb(158,132,72)';
    ctx.fillRect(fx - 3.2, ry, 6.4, 1.7);
    ctx.fillStyle = 'rgba(255,246,214,.75)';
    ctx.fillRect(fx - 2.2, ry + 0.3, 1.6, 0.55);
    // a carne levemente inchada dos dois lados do anel
    soft(ctx, fx, ry - 1.2, 3, 1, rgb(mix(SK, [180, 100, 90], 0.3), 0.4), 0.8);
    soft(ctx, fx, ry + 2.6, 3, 1, rgb(mix(SK, [180, 100, 90], 0.3), 0.4), 0.8);
  }
  if (dorsal) {
    // veias do dorso (fracas no anômalo — pele lisa demais)
    ctx.strokeStyle = `rgba(86,96,110,${anom ? 0.12 : 0.4})`; ctx.lineWidth = 0.7;
    for (let i = 0; i < 3; i++) {
      const x0 = -palmW * 0.6 + i * palmW * 0.55;
      ctx.beginPath(); ctx.moveTo(x0, cy + palmH * 0.75);
      ctx.quadraticCurveTo(x0 + 2, cy - palmH * 0.2, x0 + 1 + i, cy - palmH * 0.8); ctx.stroke();
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
    out += `<image href="${fr.url}" width="200" height="240" preserveAspectRatio="none" opacity="${i === 0 ? 1 : 0}">` +
      `<animate attributeName="opacity" calcMode="discrete" ${anim} dur="${dur}s" repeatCount="indefinite"/></image>`;
  });
  return out;
}

/* a cena de cada zona do exame */
function examZoneSVG(f, phys, zone) {
  phys = phys || {};
  const seed = faceSeedOf(f);
  const base = {
    w: 260, h: 312, bg: '#101208', paintScale: 2.7,
    waxy: !!phys.pele, veins: !!phys.olhos, brightSclera: !!phys.piscar,
    post: { levels: 12, ditherAmp: 0.65, grain: 9, aberr: 2, scan: 0.13, vig: 0.5, sat: 0.34 },
  };
  const F = (o) => renderPortraitCanvas(f, Object.assign({}, base, o)).toDataURL();

  if (zone === 'olhos') {
    const zo = { zoom: 2.9, focusY: 47 };
    const frames = [{ url: F(zo), len: 1.5 }];
    if (!phys.piscar) { // humanos piscam. o frame existe.
      frames.push({ url: F(Object.assign({ eyesClosed: true }, zo)), len: 0.16 });
      frames.push({ url: F(zo), len: 0.8 });
    } else {
      frames.push({ url: F(Object.assign({}, zo, { postSeed: 3 })), len: 0.96 }); // ...ele não pisca
    }
    frames.push({ url: F(Object.assign({ eyesWide: true, pullLid: true }, zo)), len: 2.3 });
    frames.push({ url: F(Object.assign({ eyesWide: true, pullLid: true, lookX: -1 }, zo)), len: 1.5 });
    return seqSVG(frames);
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
    const mkF = (sh) => renderScene((c) => paintSkinMacro(c, f, phys, sh), seed ^ (0x51 + sh), {
      w: 260, h: 312, paintScale: 2.7,
      post: { levels: 11, ditherAmp: 0.7, grain: 11, aberr: 2, scan: 0.13, vig: 0.4, sat: 0.4 },
    }).toDataURL();
    return seqSVG([{ url: mkF(0), len: 1.9 }, { url: mkF(1), len: 1.9 }]);
  }
  if (zone === 'maos') {
    const mkF = (mode, ps) => renderScene((c) => paintHandScene(c, f, phys, mode), seed ^ ps, {
      w: 260, h: 312, paintScale: 2.7,
      post: { levels: 12, ditherAmp: 0.6, grain: 10, aberr: 2, scan: 0.13, vig: 0.5, sat: 0.36 },
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
    return `<image href="${url}" width="200" height="240" preserveAspectRatio="none"/>${pulse}`;
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
function renderActorBust(cz, cv) {
  const W = cv.width, H = cv.height; // 220x380
  const ctx = cv.getContext('2d');
  ctx.clearRect(0, 0, W, H);
  let src;
  if (cz && cz.isSilente) {
    src = silentePortraitCanvas({ w: 260, h: 312 });
  } else {
    src = renderPortraitCanvas(cz.features, {
      w: 260, h: 312, paintScale: 3.6,
      post: { levels: 14, ditherAmp: 0.55, grain: 9, aberr: 1, scan: 0.10, tears: 1, sat: 0.38 },
    });
  }
  // busto ancorado na base do ator (cabeça grande, ombros cortando o limite)
  const scale = W / src.width * 1.32;
  const dw = src.width * scale, dh = src.height * scale;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(src, (W - dw) / 2, H - dh + 6, dw, dh);
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
    const set = (k, cv) => doc.style.setProperty(k, `url(${cv.toDataURL()})`);
    const mk2 = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
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
    set('--tex-panel', m);

    // a mesa: tábuas com veio, nós, marcas de caneca
    const w = mk2(240, 160); const wx = w.getContext('2d');
    for (let plank = 0; plank < 4; plank++) {
      const y0 = plank * 40;
      const tone = 62 + Math.floor(r() * 14);
      wx.fillStyle = `rgb(${tone + 14},${tone - 4},${tone - 26})`;
      wx.fillRect(0, y0, 240, 40);
      for (let i = 0; i < 9; i++) { // veio
        const yy = y0 + 3 + r() * 34;
        wx.strokeStyle = `rgba(30,20,10,${0.10 + r() * 0.12})`;
        wx.lineWidth = 0.6 + r() * 0.8;
        wx.beginPath(); wx.moveTo(0, yy);
        for (let x = 0; x <= 240; x += 30) wx.lineTo(x, yy + Math.sin(x * 0.05 + plank + i) * 2.2);
        wx.stroke();
      }
      if (r() < 0.7) { // nó
        const kx = r() * 240, ky = y0 + 8 + r() * 24;
        wx.strokeStyle = 'rgba(28,18,8,.5)'; wx.lineWidth = 1;
        for (let k = 1; k < 4; k++) { wx.beginPath(); wx.ellipse(kx, ky, k * 2.4, k * 1.4, 0.2, 0, 6.29); wx.stroke(); }
      }
      wx.fillStyle = 'rgba(0,0,0,.4)'; wx.fillRect(0, y0 + 38.6, 240, 1.4); // vão entre tábuas
      wx.fillStyle = 'rgba(255,240,210,.05)'; wx.fillRect(0, y0, 240, 1);   // canto pega luz
    }
    // marca de caneca — o círculo que nunca sai
    wx.strokeStyle = 'rgba(20,12,6,.35)'; wx.lineWidth = 2.4;
    wx.beginPath(); wx.arc(178, 66, 13, 0, 6.29); wx.stroke();
    set('--tex-wood', w);
  } catch (e) {}
})();

window.portraitSVG = portraitSVG;
window.examSVG = examSVG;
window.examZoneSVG = examZoneSVG;
window.silenteSVG = silenteSVG;
window.renderActorBust = renderActorBust;
window.renderPortraitCanvas = renderPortraitCanvas;
window.analogPostCanvas = analogPostCanvas;
