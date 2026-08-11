/* QA DOS ROSTOS QUE VOLTAM: força cada aparição especial ao vidro, fotografa
   o busto e confere que a fala, os papéis e o look chegaram. Também dispara
   O Contador para ver o rosto simétrico dele. */
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const U = process.env.HUMANOCRACY_URL || 'file://' + path.resolve(__dirname, '../../humanocracy-standalone.html');
const OUT = process.env.QA_OUT || '/tmp/claude-0/-home-user-pack-invaders/3c829368-3609-517f-b09c-9b887c069402/scratchpad/specials';

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'] });
  const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
  const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 160)));
  await p.goto(U);
  await p.waitForSelector('#screen-title.active'); await p.waitForTimeout(400);
  await p.evaluate(() => { try { localStorage.clear(); } catch (e) {} });
  await p.evaluate(() => showModeSelect()); await p.waitForTimeout(200);
  await p.evaluate(() => { MS.idx = 0; msConfirm(); }); await p.waitForTimeout(400);
  const dismissTV = async () => {
    const on = await p.evaluate(() => { const t = document.getElementById('tv-overlay'); return !!(t && t.classList.contains('active')); });
    if (!on) return;
    await p.evaluate(() => { const c = document.getElementById('tv-screen'); if (c && c.onclick) c.onclick(); });
    await p.waitForTimeout(250);
    await p.evaluate(() => { const x = document.getElementById('tv-off'); if (x) x.click(); });
    await p.waitForTimeout(400);
  };
  const sign = async () => {
    await dismissTV();
    for (let i = 0; i < 8; i++) {
      const has = await p.evaluate(() => !!document.querySelector('#modal-overlay.active #modal-actions button'));
      if (!has) break;
      await p.evaluate(() => document.querySelector('#modal-overlay.active #modal-actions button').click());
      await p.waitForTimeout(320);
    }
    await dismissTV();
  };
  await sign();

  // calendário completo das aparições
  const cal = await p.evaluate(() => {
    const o = [];
    for (let d = 1; d <= 48; d++) for (const x of specialsForDay(d)) o.push(`d${d}:${x.id}`);
    return o;
  });
  console.log('APARIÇÕES:', cal.join(' '));

  // força cada uma ao vidro
  const alvos = await p.evaluate(() => {
    const o = [];
    for (let d = 1; d <= 48; d++) for (const x of specialsForDay(d)) o.push({ day: d, id: x.id });
    return o;
  });
  for (const a of alvos) {
    const info = await p.evaluate(({ day, id }) => {
      S.day = day; startDay();
      const x = specialsForDay(day).find(y => y.id === id);
      shift.special = x; shift.specialSlot = 0; shift.specialDone = false;
      return null;
    }, a);
    await p.waitForTimeout(700); await sign(); await p.waitForTimeout(1900);
    const st = await p.evaluate(() => {
      const cz = shift.citizen;
      if (!cz) return { erro: 'sem cidadao' };
      return {
        esp: cz.especial || null, nome: cz.nome,
        fala: (document.getElementById('speech').textContent || '').slice(0, 46),
        docs: Object.keys(cz.docs || {}).length,
        disc: (cz.discrepancies || []).length,
        look: ['batom', 'kohl', 'suado', 'feridas', 'olheiras', 'colarinho', 'simetrico', 'semPiscar', 'peleFria']
          .filter(k => cz.features && cz.features[k]),
      };
    });
    console.log(`d${String(a.day).padStart(2)} ${a.id.padEnd(9)}`, JSON.stringify(st));
    if (st.esp === a.id) {
      const el = await p.$('#booth'); if (el) await el.screenshot({ path: path.join(OUT, `${a.id}-d${a.day}.png`) });
    }
  }

  // O CONTADOR: convocado por dois Alternados num só turno
  await p.evaluate(() => {
    S.day = 20; startDay();
    S.flags.contadorDay = 20; S.flags.contadorFonte = 17;
    const x = specialForToday();
    shift.special = x; shift.specialSlot = 0; shift.specialDone = false;
  });
  await p.waitForTimeout(700); await sign(); await p.waitForTimeout(1900);
  const ct = await p.evaluate(() => {
    const cz = shift.citizen;
    return cz ? { nome: cz.nome, matador: !!cz.matador, alt: !!cz.isAlternado,
                  fala: (document.getElementById('speech').textContent || '').slice(0, 60),
                  look: Object.keys(cz.features).filter(k => ['simetrico', 'semPiscar', 'peleFria'].includes(k)) } : null;
  });
  console.log('CONTADOR', JSON.stringify(ct));
  const bo = await p.$('#booth'); if (bo) await bo.screenshot({ path: path.join(OUT, 'contador.png') });
  // e carimbar mata
  await p.evaluate(() => { try { decide('approve'); } catch (e) {} });
  await p.waitForTimeout(3600);
  console.log('APÓS CARIMBAR:', await p.evaluate(() => [...document.querySelectorAll('.screen.active')].map(s => s.id).join(',')),
    await p.evaluate(() => (document.getElementById('ending-title') || {}).textContent));
  console.log('PAGEERRORS:', JSON.stringify(errs.slice(0, 6)));
  await b.close();
})();
