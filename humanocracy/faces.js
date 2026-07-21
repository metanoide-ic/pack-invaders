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
const F_SKIN = [
  { b: [214, 183, 150], s: [150, 118, 92] },
  { b: [199, 158, 116], s: [136, 100, 70] },
  { b: [180, 133, 92],  s: [118, 82, 52] },
  { b: [152, 108, 76],  s: [96, 64, 40] },
  { b: [124, 84, 58],   s: [76, 48, 30] },
  { b: [224, 196, 168], s: [160, 132, 106] },
];
const F_HAIR = [
  [32, 25, 18], [58, 44, 28], [96, 68, 40], [128, 100, 62],
  [98, 98, 96], [22, 22, 22], [110, 48, 28], [168, 168, 156],
];
const F_IRIS = [[42, 38, 30], [52, 82, 66], [84, 64, 38]];

function rgb(c, a) { return `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a == null ? 1 : a})`; }
function mix(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }
function lighten(c, t) { return mix(c, [255, 250, 238], t); }
function darken(c, t) { return mix(c, [10, 8, 6], t); }

/* ---------- geometria do rosto (tudo do PRNG + features) ---------- */
function faceLayout(f) {
  const r = faceRng(faceSeedOf(f));
  const fem = f.sexo === 'f';
  const fw = 19 + f.faceW * 2.4 + r() * 2 - (fem ? 1.6 : 0);      // meia-largura nas bochechas
  const jw = fw * (fem ? 0.78 : 0.82) + r() * 1.6;                // meia-largura do maxilar
  const chinY = 73.5 + r() * 3.5 + (f.idade > 52 ? 1.5 : 0);
  const eyeY = 47 + (r() - 0.5) * 2.4;
  const eyeDX = 10.5 + f.faceW * 0.8 + r() * 1.4;
  const eyeW = 5.8 + r() * 0.9, eyeH = 2.3 + r() * 0.7;
  const browY = eyeY - (5 + r() * 2.4) - (f.brow ? 1.2 : 0);
  const noseTip = 58.5 + r() * 2.4;
  const noseW = 4.4 + r() * 1.8 - (fem ? 0.6 : 0);
  const mouthY = 66.5 + r() * 1.8;
  const mouthW = 8.2 + r() * 2.2;
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
    r, fem, fw, jw, chinY, eyeY, eyeDX: eyeDX + eyeApart, eyeW, eyeH,
    browY, noseTip, noseW, mouthY, mouthW, ax, tilt,
    uncanny, pupilSkew, cornerUp,
    skin: F_SKIN[f.skin % F_SKIN.length], hair: F_HAIR[f.hair % F_HAIR.length],
    iris: F_IRIS[f.eyes % F_IRIS.length],
  };
}

/* ---------- traçado da cabeça ---------- */
function headPath(ctx, L) {
  const cx = 50, topY = 21;
  ctx.beginPath();
  ctx.moveTo(cx - L.fw + 0.6, 46);
  ctx.bezierCurveTo(cx - L.fw - 0.4, topY + 8, cx - L.fw * 0.62, topY - 1.5, cx, topY - 1.5);
  ctx.bezierCurveTo(cx + L.fw * 0.62, topY - 1.5, cx + L.fw + 0.4 + L.ax, topY + 8, cx + L.fw - 0.6 + L.ax, 46);
  ctx.bezierCurveTo(cx + L.fw - 0.2 + L.ax, 56, cx + L.jw + 0.8 + L.ax, 62, cx + L.jw * 0.82 + L.ax, L.chinY - 6);
  ctx.quadraticCurveTo(cx + L.jw * 0.5, L.chinY + 1.8, cx, L.chinY + 2.2);
  ctx.quadraticCurveTo(cx - L.jw * 0.5, L.chinY + 1.8, cx - L.jw * 0.82, L.chinY - 6);
  ctx.bezierCurveTo(cx - L.jw - 0.8, 62, cx - L.fw + 0.2, 56, cx - L.fw + 0.6, 46);
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

  /* casaco e ombros */
  ctx.fillStyle = 'rgb(34,35,29)';
  ctx.beginPath();
  ctx.moveTo(10, 122); ctx.bezierCurveTo(11, 94, 30, 86, 50, 85);
  ctx.bezierCurveTo(70, 86, 89, 94, 90, 122); ctx.closePath(); ctx.fill();
  // lapelas / gola pegando a luz
  ctx.strokeStyle = 'rgba(120,118,100,.28)'; ctx.lineWidth = 0.8;
  ctx.beginPath(); ctx.moveTo(41, 92); ctx.lineTo(46, 104); ctx.moveTo(59, 92); ctx.lineTo(54, 104); ctx.stroke();
  soft(ctx, 50, 96, 26, 7, 'rgba(0,0,0,.35)', 2.4);
  // luz de recorte nos ombros (separa do fundo escuro)
  ctx.strokeStyle = 'rgba(210,215,190,.14)'; ctx.lineWidth = 0.9;
  ctx.beginPath(); ctx.moveTo(20, 103); ctx.bezierCurveTo(26, 92, 38, 88.5, 49, 88); ctx.stroke();

  /* a cabeça inteira levemente inclinada — mugshot de verdade nunca é reto */
  ctx.save();
  ctx.translate(50, 62); ctx.rotate(L.tilt); ctx.translate(-50, -62);

  /* orelhas (por trás da cabeça) */
  ctx.fillStyle = rgb(mix(SK, SH, 0.3));
  ctx.beginPath(); ctx.ellipse(cx - L.fw - 0.5, 52, 2.4, 4, -0.12, 0, 6.29); ctx.fill();
  ctx.beginPath(); ctx.ellipse(cx + L.fw + 0.5 + L.ax, 52, 2.4, 4, 0.12, 0, 6.29); ctx.fill();
  soft(ctx, cx - L.fw - 0.5, 52.5, 1.1, 2, rgb(darken(SH, 0.25), 0.5), 0.8);
  soft(ctx, cx + L.fw + 0.5 + L.ax, 52.5, 1.1, 2, rgb(darken(SH, 0.25), 0.5), 0.8);

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
  // rosto cai em sombra franca — é isso que faz a foto parecer foto
  const chiar = ctx.createLinearGradient(cx - L.fw, 0, cx + L.fw, 0);
  chiar.addColorStop(0, 'rgba(255,242,214,.14)');
  chiar.addColorStop(0.42, 'rgba(0,0,0,0)');
  chiar.addColorStop(0.72, rgb(darken(SH, 0.08), 0.28));
  chiar.addColorStop(1, rgb(darken(SH, 0.22), 0.62));
  ctx.fillStyle = chiar; ctx.fillRect(0, 0, 100, 120);

  // planos laterais
  soft(ctx, cx - L.fw + 1, 56, 7, 22, rgb(SH, 0.45), 1.8);
  soft(ctx, cx + L.fw - 1 + L.ax, 56, 8, 23, rgb(darken(SH, 0.12), 0.7), 1.8);
  // têmporas
  soft(ctx, cx - L.fw + 4, 40, 4, 6, rgb(SH, 0.4), 1.6);
  soft(ctx, cx + L.fw - 4 + L.ax, 40, 4.4, 6, rgb(darken(SH, 0.1), 0.5), 1.6);

  // luz principal: lâmpada acima-esquerda, contida (não lava o lado sombrio)
  const key = ctx.createRadialGradient(cx - 9, 33, 3, cx - 9, 38, 32);
  key.addColorStop(0, 'rgba(255,244,216,.42)'); key.addColorStop(0.5, 'rgba(255,244,216,.13)');
  key.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = key; ctx.fillRect(0, 0, 100, 120);
  soft(ctx, cx - 7, 30, 10, 6, 'rgba(255,246,222,.26)', 1.8); // testa

  // órbitas
  soft(ctx, cx - L.eyeDX, L.eyeY - 0.6, 7, 4.4, rgb(darken(SH, 0.16), 0.55), 1.9);
  soft(ctx, cx + L.eyeDX + L.ax * 0.5, L.eyeY - 0.6, 7, 4.4, rgb(darken(SH, 0.16), 0.6), 1.9);

  // nariz: sombras da ponte + SOMBRA PROJETADA (lâmpada à esquerda joga a
  // sombra do nariz pra direita e pra baixo — sem ela o nariz não existe)
  soft(ctx, cx - 2.6, 53, 1.7, 7.5, rgb(darken(SH, 0.1), 0.5), 1.1);
  soft(ctx, cx + 2.6, 53, 1.9, 7.5, rgb(darken(SH, 0.18), 0.62), 1.1);
  soft(ctx, cx - 0.4, 52, 1.1, 6, rgb(lighten(SK, 0.32), 0.55), 0.9); // dorso pega luz
  soft(ctx, cx, L.noseTip - 3, 2, 4, rgb(lighten(SK, 0.36), 0.65), 1);
  ctx.save();
  try { ctx.filter = `blur(${(0.9 * F_SCALE * 0.55).toFixed(1)}px)`; } catch (e) {}
  ctx.fillStyle = rgb(darken(SH, 0.22), 0.5);
  ctx.beginPath(); ctx.ellipse(cx + 2.8, L.noseTip + 2.6, 3.6, 1.8, 0.35, 0, 6.29); ctx.fill();
  ctx.restore();
  ctx.fillStyle = rgb(darken(SH, 0.4), 0.75);
  ctx.beginPath(); ctx.ellipse(cx - L.noseW * 0.55, L.noseTip + 0.8, 1.15, 0.75, 0.3, 0, 6.29); ctx.fill();
  ctx.beginPath(); ctx.ellipse(cx + L.noseW * 0.55, L.noseTip + 0.8, 1.15, 0.75, -0.3, 0, 6.29); ctx.fill();
  // asas do nariz
  soft(ctx, cx - L.noseW * 0.9, L.noseTip - 0.4, 1.2, 1.4, rgb(SH, 0.4), 0.8);
  soft(ctx, cx + L.noseW * 0.9, L.noseTip - 0.4, 1.3, 1.5, rgb(darken(SH, 0.1), 0.5), 0.8);

  // bochechas / encovado de quem come pouco
  const hollow = f.idade > 46 || r() < 0.35;
  if (hollow) {
    soft(ctx, cx - L.fw + 6, 62, 4, 7, rgb(SH, 0.30), 2.6);
    soft(ctx, cx + L.fw - 6 + L.ax, 62, 4, 7, rgb(SH, 0.34), 2.6);
  }
  soft(ctx, cx - L.fw + 5, 55, 3.4, 2, 'rgba(255,244,222,.14)', 2);
  soft(ctx, cx + L.fw - 5 + L.ax, 55, 3.4, 2, 'rgba(255,244,222,.10)', 2);

  // boca: lábios de verdade — superior em sombra, inferior pega luz
  const my = L.mouthY, mw = L.mouthW;
  const droop = f.mouth === 1 ? 1.2 : f.mouth === 2 ? -0.4 : 0.5;
  const lipTone = mix(SH, [130, 66, 56], L.fem ? 0.6 : 0.3);
  // filtro do lábio (sulco acima)
  soft(ctx, cx, my - 3.2, 1.2, 1.8, rgb(SH, 0.35), 1);
  // lábio superior
  ctx.fillStyle = rgb(darken(lipTone, 0.22), 0.95);
  ctx.beginPath();
  ctx.moveTo(cx - mw, my + droop * 0.5 - L.cornerUp);
  ctx.quadraticCurveTo(cx - mw * 0.45, my - 2, cx - 1.2, my - 1.7);
  ctx.quadraticCurveTo(cx, my - 1.2, cx + 1.2, my - 1.7);
  ctx.quadraticCurveTo(cx + mw * 0.45, my - 2, cx + mw, my + droop * 0.5 - L.cornerUp);
  ctx.quadraticCurveTo(cx, my + 0.8, cx - mw, my + droop * 0.5 - L.cornerUp);
  ctx.closePath(); ctx.fill();
  // lábio inferior
  ctx.fillStyle = rgb(lipTone, 0.8);
  ctx.beginPath();
  ctx.moveTo(cx - mw * 0.82, my + 0.4);
  ctx.quadraticCurveTo(cx, my + 1, cx + mw * 0.82, my + 0.4);
  ctx.quadraticCurveTo(cx + mw * 0.5, my + 3.4, cx, my + 3.6);
  ctx.quadraticCurveTo(cx - mw * 0.5, my + 3.4, cx - mw * 0.82, my + 0.4);
  ctx.closePath(); ctx.fill();
  soft(ctx, cx - 1, my + 2.2, mw * 0.42, 1, 'rgba(255,240,220,.4)', 0.9); // brilho no lábio inferior
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
    // barba por fazer
    if (!L.fem && f.beard === 0 && r() < 0.5) {
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
  for (const sgn of [-1, 1]) {
    const ex = cx + sgn * L.eyeDX + (sgn > 0 ? L.ax * 0.5 : 0);
    const ey = L.eyeY + (sgn > 0 ? L.ax * 0.35 : 0);
    const ew = L.eyeW, eh = L.eyeH;
    if (eyes === 'closed') {
      ctx.strokeStyle = rgb(darken(SH, 0.35), 0.9); ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.moveTo(ex - ew, ey + 0.4);
      ctx.quadraticCurveTo(ex, ey + eh * 0.8, ex + ew, ey + 0.4); ctx.stroke();
      soft(ctx, ex, ey - 1, ew * 0.9, 2, rgb(mix(SK, SH, 0.3), 0.8), 1.2);
      continue;
    }
    // esclera (nunca branca — olho de gente cansada)
    ctx.fillStyle = opts.brightSclera ? 'rgb(234,232,220)' : 'rgb(196,188,166)';
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
    if (opts.veins) {
      ctx.strokeStyle = 'rgba(150,44,32,.6)'; ctx.lineWidth = 0.32;
      for (let i = 0; i < 4; i++) {
        ctx.beginPath(); ctx.moveTo(ex - sgn * ew * 0.9, ey + (r() - 0.5) * eh);
        ctx.quadraticCurveTo(ex - sgn * ew * 0.3, ey + (r() - 0.5) * eh, ex - sgn * 1, ey + (r() - 0.5) * 1.4);
        ctx.stroke();
      }
    }
    // íris GRANDE, cortada em cima pela pálpebra — olhar pesado, não arregalado
    const ir = 2.9 + r() * 0.4;
    const pr = 1.45 + (sgn > 0 ? L.pupilSkew : 0);
    const iy = ey - 0.3;
    const ig = ctx.createRadialGradient(ex, iy, 0.4, ex, iy, ir);
    ig.addColorStop(0, rgb(darken(L.iris, 0.3)));
    ig.addColorStop(0.65, rgb(L.iris));
    ig.addColorStop(1, rgb(darken(L.iris, 0.6)));
    ctx.fillStyle = ig;
    ctx.beginPath(); ctx.arc(ex, iy, ir, 0, 6.29); ctx.fill();
    ctx.fillStyle = 'rgb(8,6,5)';
    ctx.beginPath(); ctx.arc(ex, iy, pr, 0, 6.29); ctx.fill();
    ctx.fillStyle = 'rgba(255,252,244,.8)';
    ctx.beginPath(); ctx.arc(ex - 0.9, iy - 0.9, 0.4, 0, 6.29); ctx.fill();
    // a pálpebra superior COBRE o topo da íris (sombra + oclusão)
    const lg = ctx.createLinearGradient(0, ey - eh - 0.5, 0, ey - eh * 0.1);
    lg.addColorStop(0, 'rgba(44,32,24,.85)'); lg.addColorStop(1, 'rgba(44,32,24,0)');
    ctx.fillStyle = lg; ctx.fillRect(ex - ew, ey - eh - 1, ew * 2, eh + 1.4);
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
    ctx.strokeStyle = rgb(SH, 0.45); ctx.lineWidth = 0.4;
    ctx.beginPath(); ctx.moveTo(ex - ew * 0.7, ey + eh - 0.2);
    ctx.quadraticCurveTo(ex, ey + eh + 0.4, ex + ew * 0.8, ey + eh - 0.4); ctx.stroke();
    // canto interno
    ctx.fillStyle = rgb(mix(SH, [130, 60, 50], 0.5), 0.6);
    ctx.beginPath(); ctx.arc(ex - sgn * ew, ey + 0.2, 0.5, 0, 6.29); ctx.fill();
  }

  /* sobrancelhas: massa sombreada + fios por cima */
  for (const sgn of [-1, 1]) {
    const ex = cx + sgn * L.eyeDX, by = L.browY + (sgn > 0 ? L.ax * 0.5 : 0);
    // massa base (garante presença mesmo depois do downscale + dither)
    ctx.save();
    try { ctx.filter = `blur(${(0.5 * F_SCALE).toFixed(1)}px)`; } catch (e) {}
    ctx.strokeStyle = rgb(darken(L.hair, 0.2), L.fem ? 0.6 : 0.8);
    ctx.lineWidth = L.fem ? 1.1 : 1.7;
    ctx.beginPath();
    ctx.moveTo(ex - sgn * (L.eyeW + 0.8), by + 1.2);
    ctx.quadraticCurveTo(ex, by - (f.brow ? 1.6 : 0.7), ex + sgn * (L.eyeW + 0.6), by + (f.brow ? 0.2 : 0.8));
    ctx.stroke();
    ctx.restore();
    // fios
    const n = L.fem ? 10 : 16;
    ctx.strokeStyle = rgb(darken(L.hair, 0.35), L.fem ? 0.6 : 0.75);
    ctx.lineWidth = 0.5;
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1);
      const bx = ex - sgn * (L.eyeW + 0.6) + sgn * t * (L.eyeW * 2 + 1);
      const yy = by + 1 - Math.sin(t * 2.6) * (f.brow ? 1.6 : 0.9) + r() * 0.5;
      ctx.beginPath(); ctx.moveTo(bx, yy + 0.8);
      ctx.lineTo(bx + sgn * (0.7 + t * 0.8), yy - 0.8 - r() * 0.4); ctx.stroke();
    }
  }

  /* ---------- cabelo ---------- */
  const HC = L.hair;
  if (f.hat !== 2) {
    ctx.save();
    const hs = f.hairStyle;
    const topY = 17, hlY = [33, 29, 25, 27][hs] + r() * 2; // linha do cabelo
    // massa base
    ctx.fillStyle = rgb(HC);
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
    } else if (hs === 1) { // cheio
      ctx.lineTo(cx + L.fw * 0.98 + L.ax, hlY + 4);
      ctx.quadraticCurveTo(cx + L.fw * 0.35, hlY - 2, cx - L.fw * 0.2, hlY + 1.5);
      ctx.quadraticCurveTo(cx - L.fw * 0.8, hlY + 3.5, cx - L.fw * 0.98, hlY + 5);
    } else { // repartido de lado
      ctx.lineTo(cx + L.fw * 0.97 + L.ax, hlY + 2);
      ctx.quadraticCurveTo(cx + L.fw * 0.3, hlY + 4.5, cx - L.fw * 0.35, hlY - 1.5);
      ctx.quadraticCurveTo(cx - L.fw * 0.75, hlY, cx - L.fw * 0.97, hlY + 3);
    }
    ctx.closePath(); ctx.fill();
    if (hs === 2 && f.idade >= 50) { // couro aparecendo
      ctx.fillStyle = rgb(SK, 0.28);
      ctx.beginPath(); ctx.ellipse(cx, topY + 4, L.fw * 0.5, 5, 0, 0, 6.29); ctx.fill();
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
    // fios: textura direcional (grossos o bastante pra sobreviver ao dither)
    for (let i = 0; i < 120; i++) {
      const t = r();
      const hx = cx + (t - 0.5) * L.fw * 1.9;
      const hy = topY - 2 + r() * (hs === 2 ? 6 : 13);
      const tone = r();
      ctx.lineWidth = 0.55 + r() * 0.35;
      ctx.strokeStyle = tone < 0.55 ? rgb(darken(HC, 0.45), 0.6) : rgb(lighten(HC, 0.35), 0.45);
      ctx.beginPath(); ctx.moveTo(hx, hy);
      if (hs === 3) ctx.quadraticCurveTo(hx + 1, hy + 3.5, hx + 0.5, hy + 7);
      else ctx.quadraticCurveTo(hx + (t - 0.5) * 4, hy + 3, hx + (t - 0.5) * 7, hy + 5.5);
      ctx.stroke();
    }
    if (L.fem) {
      for (let i = 0; i < 40; i++) {
        const sgn = r() < 0.5 ? -1 : 1;
        const hx = cx + sgn * (L.fw + r() * 3.4 - 1);
        const hy = 42 + r() * 30;
        ctx.lineWidth = 0.5 + r() * 0.3;
        ctx.strokeStyle = r() < 0.5 ? rgb(darken(HC, 0.4), 0.55) : rgb(lighten(HC, 0.3), 0.4);
        ctx.beginPath(); ctx.moveTo(hx, hy);
        ctx.quadraticCurveTo(hx + sgn * 1.2, hy + 5, hx + sgn * 0.5, hy + 10); ctx.stroke();
      }
    }
    // brilho de lâmpada no topo
    soft(ctx, cx - 5, topY + 2, L.fw * 0.55, 3, 'rgba(255,246,224,.26)', 1.6);
    ctx.restore();
  }

  /* barba / bigode */
  if (f.beard === 1) {
    ctx.save();
    ctx.fillStyle = rgb(darken(HC, 0.05), 0.9);
    ctx.beginPath();
    ctx.moveTo(cx - L.fw + 1, 54);
    ctx.quadraticCurveTo(cx - L.jw - 1, 70, cx - L.jw * 0.5, L.chinY + 4);
    ctx.quadraticCurveTo(cx, L.chinY + 9, cx + L.jw * 0.5, L.chinY + 4);
    ctx.quadraticCurveTo(cx + L.jw + 1 + L.ax, 70, cx + L.fw - 1 + L.ax, 54);
    ctx.lineTo(cx + L.fw - 4 + L.ax, 60);
    ctx.quadraticCurveTo(cx + mwSafe(L) * 1.5, L.mouthY - 2.5, cx, L.mouthY - 2.5);
    ctx.quadraticCurveTo(cx - mwSafe(L) * 1.5, L.mouthY - 2.5, cx - L.fw + 4, 60);
    ctx.closePath(); ctx.fill();
    // boca reaparece
    ctx.strokeStyle = 'rgba(30,20,16,.8)'; ctx.lineWidth = 0.7;
    ctx.beginPath(); ctx.moveTo(cx - L.mouthW * 0.7, L.mouthY);
    ctx.quadraticCurveTo(cx, L.mouthY + 1, cx + L.mouthW * 0.7, L.mouthY); ctx.stroke();
    // fios da barba
    for (let i = 0; i < 60; i++) {
      const bx = cx + (r() - 0.5) * L.jw * 2.1;
      const by2 = 62 + r() * (L.chinY - 56);
      ctx.strokeStyle = r() < 0.5 ? rgb(darken(HC, 0.4), 0.4) : rgb(lighten(HC, 0.25), 0.3);
      ctx.lineWidth = 0.4;
      ctx.beginPath(); ctx.moveTo(bx, by2); ctx.lineTo(bx + (r() - 0.5) * 1.6, by2 + 2 + r() * 2); ctx.stroke();
    }
    ctx.restore();
  } else if (f.beard === 2) {
    ctx.strokeStyle = rgb(darken(HC, 0.1), 0.85); ctx.lineWidth = 0.5;
    for (let i = 0; i < 22; i++) {
      const t = i / 21;
      const bx = cx - L.mouthW * 0.9 + t * L.mouthW * 1.8;
      const by2 = L.mouthY - 2.6 - Math.sin(t * 3.14) * 1.2;
      ctx.beginPath(); ctx.moveTo(bx, by2); ctx.lineTo(bx + (t - 0.5) * 1.4, by2 + 1.8); ctx.stroke();
    }
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
    hc.translate(50, o.focusY || 50);
    hc.scale(o.zoom, o.zoom);
    hc.translate(-50, -(o.focusY || 50));
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

window.portraitSVG = portraitSVG;
window.examSVG = examSVG;
window.silenteSVG = silenteSVG;
window.renderActorBust = renderActorBust;
window.renderPortraitCanvas = renderPortraitCanvas;
window.analogPostCanvas = analogPostCanvas;
