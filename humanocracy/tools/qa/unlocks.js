/* QA das REMESSAS: no dia 1 a mesa tem o essencial e nada mais; cada
   ferramenta só aparece no dia em que o Ministério a manda. Pula direto para
   um dia (QA_DAY) e fotografa o tampo. */
const { chromium } = require('playwright');
const path = require('path');
const U = process.env.HUMANOCRACY_URL || 'file://' + path.resolve(__dirname, '../../humanocracy-standalone.html');
const OUT = process.env.QA_OUT || '/tmp/claude-0/-home-user-pack-invaders/3c829368-3609-517f-b09c-9b887c069402/scratchpad';

const vis = () => {
  const on = (id) => { const e = document.getElementById(id); return !!(e && e.offsetParent !== null); };
  return {
    day: S.day,
    gavA: on('drawer-left'), gavB: on('drawer-right'),
    mapa: on('dt-mapa'), lupa: on('dt-lupa'), termo: on('inst-thermo'),
    dossie: on('dt-linha'), pulso: on('inst-pulse'), bio: on('inst-bio'),
    arma: on('gun-obj'),
    zonas: (typeof EXAM_ZONES !== 'undefined' ? EXAM_ZONES.filter(z => toolReady(z.un)).map(z => z.id) : []),
    bagagem: toolReady('bag'),
  };
};

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'] });
  const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
  const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 160)));
  const dismissTV = async () => {
    const on = await p.evaluate(() => { const t = document.getElementById('tv-overlay'); return !!(t && t.classList.contains('active')); });
    if (!on) return;
    await p.evaluate(() => { const c = document.getElementById('tv-screen'); if (c && c.onclick) c.onclick(); });
    await p.waitForTimeout(250);
    await p.evaluate(() => { const x = document.getElementById('tv-off'); if (x) x.click(); });
    await p.waitForTimeout(400);
  };
  const signAll = async () => {              // assina todos os ofícios da manhã
    for (let i = 0; i < 8; i++) {
      const btn = await p.$('#modal-overlay.active #modal-actions button');
      if (!btn) break;
      await btn.click(); await p.waitForTimeout(450);
    }
  };

  await p.goto(U);
  await p.waitForSelector('#screen-title.active'); await p.waitForTimeout(400);
  await p.evaluate(() => { try { localStorage.clear(); } catch (e) {} });
  await p.evaluate(() => showModeSelect()); await p.waitForTimeout(200);
  await p.evaluate(() => { MS.idx = 0; msConfirm(); }); await p.waitForTimeout(400);
  await dismissTV(); await signAll();

  const DIAS = (process.env.QA_DAYS || '1,2,3,5,7,10,12,15').split(',').map(Number);
  for (const d of DIAS) {
    await p.evaluate((day) => { S.day = day; startDay(); }, d);
    await p.waitForTimeout(900); await dismissTV(); await signAll(); await p.waitForTimeout(700);
    const st = await p.evaluate(vis);
    console.log('dia', String(d).padStart(2), JSON.stringify(st));
    await p.screenshot({ path: path.join(OUT, `unlock-d${d}.png`) });
  }
  console.log('PAGEERRORS:', JSON.stringify(errs.slice(0, 6)));
  await b.close();
})();
