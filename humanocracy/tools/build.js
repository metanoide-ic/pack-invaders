/* Build de personagens: art_src/*.png -> characters.js (data URIs VHS).
   Roda em Chromium headless (Playwright). Uso:
     node tools/build.js            (a partir de humanocracy/, com playwright no PATH)
   Regenere sempre que adicionar imagens novas em art_src/. */
const { chromium } = require(process.env.PW || 'playwright');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'art_src');

// metadados por arquivo (kind: human|alt|silente|dog ; sex: m|f|-)
// bustFrom/bustTo: fatia vertical do corpo (0=topo da cabeça, 1=base dos pés)
// mantida no recorte final — janela de guichê, nunca corpo inteiro.
const META = {
  'homem_terno.png':     { kind: 'human', sex: 'm', tag: 'formal',  bustTo: 0.30 },
  'homem_camiseta.png':  { kind: 'human', sex: 'm', tag: 'casual',  bustTo: 0.30 },
  'extra12.png':         { kind: 'human', sex: 'f', tag: 'casual',  bustFrom: 0.22, bustTo: 0.55 },
  'mulher_vestido.png':  { kind: 'human', sex: 'f', tag: 'formal',  bustTo: 0.30 },
  'extra11.png':         { kind: 'human', sex: 'f', tag: 'coberta', bustTo: 0.38 },
  'alternado_jovem.png': { kind: 'alt',   sex: 'm', tag: 'uncanny', bustTo: 0.36 },
  'extra9.png':          { kind: 'silente', sex: '-', tag: 'silente', bustTo: 0.46 },
  'cao.png':             { kind: 'dog',   sex: '-', tag: 'dog', bustTo: 0.34 },
  'extra10.png':         { kind: 'dog',   sex: '-', tag: 'dog', bustTo: 0.30 },
};
const DEFAULT_BUST = { human: 0.32, alt: 0.36, silente: 0.46, dog: 0.32 };

(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
  await page.addScriptTag({ path: path.join(ROOT, 'tools', 'process.js') });

  // qualquer .png em art_src entra; nome pode carregar dica de tipo/sexo
  // (ex.: "alt_homem_zé.png", "f_maria.png", "dog_rex.png", "silente_x.png")
  const all = fs.readdirSync(SRC).filter(f => /\.png$/i.test(f));
  all.forEach(f => {
    if (META[f]) return;
    const l = f.toLowerCase();
    const kind = /silente/.test(l) ? 'silente' : /(alt|alien|altern)/.test(l) ? 'alt' : /(dog|cao|cão|gato|cat)/.test(l) ? 'dog' : 'human';
    const sex = /(^|_)f(_|\b)|mulher|fem|woman|girl/.test(l) ? 'f' : /(^|_)m(_|\b)|homem|masc|man|boy/.test(l) ? 'm' : '-';
    META[f] = { kind, sex, tag: 'auto' };
  });
  const files = all.filter(f => META[f]);
  const out = [];
  for (const f of files) {
    const b64 = fs.readFileSync(path.join(SRC, f)).toString('base64');
    const url = 'data:image/png;base64,' + b64;
    const m = META[f];
    const bustTo = m.bustTo ?? DEFAULT_BUST[m.kind] ?? 0.34;
    const bustFrom = m.bustFrom ?? 0;
    const res = await page.evaluate(async ({ u, bustFrom, bustTo }) => {
      const img = new Image();
      img.src = u;
      await img.decode();
      const r = window.processImage(img, { bustFrom, bustTo });
      return r;
    }, { u: url, bustFrom, bustTo });
    out.push({ id: f.replace('.png', ''), kind: m.kind, sex: m.sex, tag: m.tag, w: res.w, h: res.h, data: res.dataURL });
    console.log(`[ok] ${f} -> ${res.w}x${res.h}, ${(res.dataURL.length / 1024 | 0)}KB`);
  }

  // manifest
  const js = 'const PHOTO_CHARS = ' + JSON.stringify(out) + ';\n';
  fs.writeFileSync(path.join(ROOT, 'characters.js'), js);
  console.log(`\ncharacters.js: ${files.length} personagens, ${(js.length / 1024 | 0)}KB total`);

  // contact sheet para conferência visual
  await page.setContent(`<body style="margin:0;background:#15140f;display:flex;flex-wrap:wrap;gap:6px;padding:10px">
    ${out.map(o => `<div style="text-align:center;color:#c9b46a;font:10px monospace">
      <img src="${o.data}" style="height:200px;display:block;background:#0a0a08"/>${o.id} [${o.kind}/${o.sex}]</div>`).join('')}
  </body>`);
  await page.waitForTimeout(200);
  await page.screenshot({ path: process.env.SHEET || '/tmp/contact.png', fullPage: true });
  await browser.close();
})().catch(e => { console.error('FALHA:', e.message); process.exit(1); });
