/* ============================================================
   HUMANOCRACY — pipeline de personagens (roda no <canvas>)
   Entrada: PNG photobash com fundo liso (branco/ciano/etc).
   Saída: cutout com fundo removido, grade (brilho-, contraste+)
   e VHS "assado", downscalado, como data URI.
   Usado tanto no build (tools/build.js via Playwright) quanto
   — se quiser — ao vivo. Aqui só a função pura de processamento.
   ============================================================ */
(function (global) {
  'use strict';

  function processImage(img, opts) {
    opts = opts || {};
    const MAX = opts.max || 300;          // maior lado final
    const brightness = opts.brightness ?? 0.9;
    const contrast = opts.contrast ?? 1.18;  // multiplicador em torno do pivô 0.5
    const sat = opts.sat ?? 0.92;
    const aberr = opts.aberr ?? 1.4;      // aberração cromática (px)
    const grain = opts.grain ?? 12;       // ruído VHS
    const scan = opts.scan ?? 0.14;       // força das scanlines
    const bleed = opts.bleed ?? 0.4;      // sangramento horizontal

    let w = img.naturalWidth || img.width;
    let h = img.naturalHeight || img.height;
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const ctx = c.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(img, 0, 0);
    const im = ctx.getImageData(0, 0, w, h);
    const d = im.data;

    /* ---- 1. cor de fundo = média dos 4 cantos ---- */
    function corner(px, py) {
      let r = 0, g = 0, b = 0, n = 0;
      for (let y = 0; y < 12; y++) for (let x = 0; x < 12; x++) {
        const i = ((py + y) * w + (px + x)) * 4;
        r += d[i]; g += d[i + 1]; b += d[i + 2]; n++;
      }
      return [r / n, g / n, b / n];
    }
    const cs = [corner(0, 0), corner(w - 12, 0), corner(0, h - 12), corner(w - 12, h - 12)];
    const bg = [0, 1, 2].map(k => cs.reduce((a, v) => a + v[k], 0) / cs.length);
    const dist2 = (i) => {
      const dr = d[i] - bg[0], dg = d[i + 1] - bg[1], db = d[i + 2] - bg[2];
      return dr * dr + dg * dg + db * db;
    };

    /* ---- 2. flood fill a partir das bordas ---- */
    const TH = (opts.bgThreshold ?? 96) ** 2;
    const isBg = new Uint8Array(w * h);
    const stack = [];
    for (let x = 0; x < w; x++) { stack.push(x); stack.push((h - 1) * w + x); }
    for (let y = 0; y < h; y++) { stack.push(y * w); stack.push(y * w + w - 1); }
    while (stack.length) {
      const p = stack.pop();
      if (isBg[p]) continue;
      if (dist2(p * 4) > TH) continue;
      isBg[p] = 1;
      const px = p % w, py = (p / w) | 0;
      if (px > 0) stack.push(p - 1);
      if (px < w - 1) stack.push(p + 1);
      if (py > 0) stack.push(p - w);
      if (py < h - 1) stack.push(p + w);
    }
    // alpha: fundo transparente; feather de 1px nas bordas
    for (let p = 0; p < w * h; p++) {
      if (isBg[p]) { d[p * 4 + 3] = 0; continue; }
      // suaviza borda: se algum vizinho é fundo, reduz alpha
      const px = p % w, py = (p / w) | 0;
      let nb = 0;
      if (px > 0 && isBg[p - 1]) nb++;
      if (px < w - 1 && isBg[p + 1]) nb++;
      if (py > 0 && isBg[p - w]) nb++;
      if (py < h - 1 && isBg[p + w]) nb++;
      if (nb) d[p * 4 + 3] = 150;
    }
    ctx.putImageData(im, 0, 0);

    /* ---- 3. bounding box do que sobrou ---- */
    let minx = w, miny = h, maxx = 0, maxy = 0;
    for (let p = 0; p < w * h; p++) {
      if (d[p * 4 + 3] > 20) {
        const px = p % w, py = (p / w) | 0;
        if (px < minx) minx = px; if (px > maxx) maxx = px;
        if (py < miny) miny = py; if (py > maxy) maxy = py;
      }
    }
    if (maxx <= minx || maxy <= miny) { minx = 0; miny = 0; maxx = w - 1; maxy = h - 1; }
    const pad = 6;
    minx = Math.max(0, minx - pad); miny = Math.max(0, miny - pad);
    maxx = Math.min(w - 1, maxx + pad); maxy = Math.min(h - 1, maxy + pad);
    const cw = maxx - minx + 1, chh = maxy - miny + 1;

    /* ---- 4. downscale para o maior lado = MAX ---- */
    const scaleF = MAX / Math.max(cw, chh);
    const fw = Math.max(1, Math.round(cw * scaleF));
    const fh = Math.max(1, Math.round(chh * scaleF));
    const cut = document.createElement('canvas');
    cut.width = fw; cut.height = fh;
    const cx = cut.getContext('2d', { willReadFrequently: true });
    cx.imageSmoothingQuality = 'high';
    cx.drawImage(c, minx, miny, cw, chh, 0, 0, fw, fh);

    /* ---- 5. grade de cor: brilho-, contraste+, dessatura ---- */
    const gi = cx.getImageData(0, 0, fw, fh);
    const g = gi.data;
    const grade = (v) => {
      v *= brightness;                       // brilho
      v = ((v / 255 - 0.5) * contrast + 0.5) * 255; // contraste em torno do pivô
      return v;
    };
    for (let i = 0; i < g.length; i += 4) {
      if (g[i + 3] === 0) continue;
      let r = grade(g[i]), gg = grade(g[i + 1]), b = grade(g[i + 2]);
      // dessatura leve
      const lum = 0.3 * r + 0.59 * gg + 0.11 * b;
      r = lum + (r - lum) * sat; gg = lum + (gg - lum) * sat; b = lum + (b - lum) * sat;
      // leve viés frio só nas sombras (tom de fita)
      const shade = 1 - Math.min(1, lum / 200);
      b += shade * 6; r -= shade * 3;
      g[i] = Math.max(0, Math.min(255, r));
      g[i + 1] = Math.max(0, Math.min(255, gg));
      g[i + 2] = Math.max(0, Math.min(255, b));
    }
    cx.putImageData(gi, 0, 0);

    /* ---- 6. VHS assado: aberração cromática + bleed ---- */
    const out = document.createElement('canvas');
    out.width = fw; out.height = fh;
    const ox = out.getContext('2d', { willReadFrequently: true });
    // canal verde base
    ox.globalCompositeOperation = 'source-over';
    ox.drawImage(cut, 0, 0);
    // reprocessa por pixel para separar canais com deslocamento
    const base = cx.getImageData(0, 0, fw, fh).data;
    const fin = ox.getImageData(0, 0, fw, fh);
    const F = fin.data;
    const A = Math.round(aberr);
    for (let y = 0; y < fh; y++) {
      for (let x = 0; x < fw; x++) {
        const i = (y * fw + x) * 4;
        if (base[i + 3] === 0) { F[i + 3] = 0; continue; }
        const rx = Math.min(fw - 1, x + A), bx = Math.max(0, x - A);
        const ri = (y * fw + rx) * 4, bi = (y * fw + bx) * 4;
        F[i] = base[ri + 3] ? base[ri] : base[i];       // R deslocado
        F[i + 1] = base[i + 1];                          // G base
        F[i + 2] = base[bi + 3] ? base[bi + 2] : base[i + 2]; // B deslocado
        // sangramento horizontal (média com pixel anterior)
        if (bleed && x > 0) {
          const pi = (y * fw + x - 1) * 4;
          F[i] = F[i] * (1 - bleed * .4) + base[pi] * bleed * .4;
        }
        F[i + 3] = base[i + 3];
        // scanline
        if (y % 2 === 0) { F[i] *= (1 - scan); F[i + 1] *= (1 - scan); F[i + 2] *= (1 - scan); }
        // grão
        if (grain) {
          const n = (Math.random() - 0.5) * grain;
          F[i] += n; F[i + 1] += n; F[i + 2] += n;
        }
      }
    }
    ox.putImageData(fin, 0, 0);

    return { dataURL: out.toDataURL('image/png'), w: fw, h: fh };
  }

  global.processImage = processImage;
})(typeof window !== 'undefined' ? window : globalThis);
