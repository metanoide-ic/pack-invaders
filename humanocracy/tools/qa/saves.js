/* QA DO ARQUIVO: instantâneo do dia, 8 cadernetas e a morte que devolve o
   inspetor à manhã do mesmo dia. */
const { chromium } = require('playwright');
const path = require('path');
const U = process.env.HUMANOCRACY_URL || 'file://' + path.resolve(__dirname, '../../humanocracy-standalone.html');
const OUT = process.env.QA_OUT || '/tmp/claude-0/-home-user-pack-invaders/3c829368-3609-517f-b09c-9b887c069402/scratchpad';

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
  const sign = async () => {
    await dismissTV();
    for (let i = 0; i < 8; i++) {
      const has = await p.evaluate(() => !!document.querySelector('#modal-overlay.active #modal-actions button'));
      if (!has) break;
      await p.evaluate(() => document.querySelector('#modal-overlay.active #modal-actions button').click());
      await p.waitForTimeout(300);
    }
    await dismissTV();
  };

  await p.goto(U);
  await p.waitForSelector('#screen-title.active'); await p.waitForTimeout(400);
  await p.evaluate(() => { try { localStorage.clear(); } catch (e) {} });
  await p.evaluate(() => showModeSelect()); await p.waitForTimeout(200);
  await p.evaluate(() => { MS.idx = 0; msConfirm(); }); await p.waitForTimeout(400);
  await sign();

  // ---- 1. instantâneo do dia
  await p.evaluate(() => { S.day = 22; S.money = 777; startDay(); });
  await p.waitForTimeout(900); await sign(); await p.waitForTimeout(600);
  console.log('SNAP:', await p.evaluate(() => { const x = loadDaySnap(); return x ? { day: x.day, money: x.state.money } : null; }));

  // ---- 2. cadernetas: grava em 3, regrava, descarta
  await p.evaluate(() => { openSlots('jogo'); });
  await p.waitForTimeout(500);
  await p.screenshot({ path: path.join(OUT, 'cadernetas-vazio.png') });
  await p.evaluate(() => { slotWrite(0); slotWrite(2); S.day = 31; S.money = 120; slotWrite(4); });
  await p.waitForTimeout(400);
  console.log('SLOTS:', await p.evaluate(() => slotsRead().map((x, i) => x ? `${i}:d${x.day}/${x.money}` : `${i}:—`).join(' ')));
  await p.evaluate(() => renderSlots());
  await p.waitForTimeout(400);
  await p.screenshot({ path: path.join(OUT, 'cadernetas.png') });
  await p.evaluate(() => slotClear(2));
  console.log('APÓS DESCARTE:', await p.evaluate(() => slotsRead().filter(Boolean).length + ' cadernetas'));

  // ---- 3. carregar uma caderneta
  await p.evaluate(() => { S.day = 9; slotLoad(0); });
  await p.waitForTimeout(1200);
  console.log('CARREGOU:', await p.evaluate(() => ({ day: S.day, money: S.money, tela: [...document.querySelectorAll('.screen.active')].map(s => s.id).join(',') })));

  // ---- 4. morrer e reabrir o dia
  await p.evaluate(() => { S.day = 27; S.money = 404; startDay(); });
  await p.waitForTimeout(900); await sign(); await p.waitForTimeout(900);
  await p.evaluate(() => { S.money = 11; try { finishGame('morto'); } catch (e) {} });
  await p.waitForTimeout(1400);
  const morte = await p.evaluate(() => ({
    tela: [...document.querySelectorAll('.screen.active')].map(s => s.id).join(','),
    botao: (document.getElementById('btn-reopen') || {}).textContent,
    visivel: !!(document.getElementById('btn-reopen') && document.getElementById('btn-reopen').style.display !== 'none'),
  }));
  console.log('MORTE:', JSON.stringify(morte));
  await p.screenshot({ path: path.join(OUT, 'morte-reabrir.png') });
  await p.evaluate(() => document.getElementById('btn-reopen').click());
  await p.waitForTimeout(1200); await sign(); await p.waitForTimeout(900);
  console.log('REABRIU:', await p.evaluate(() => ({
    day: S.day, money: S.money, rodando: !!shift.running,
    tela: [...document.querySelectorAll('.screen.active')].map(s => s.id).join(','),
  })));

  // ---- 5. finais de escolha NÃO oferecem reabrir
  await p.evaluate(() => { try { finishGame('prisao'); } catch (e) {} });
  await p.waitForTimeout(1200);
  console.log('PRISÃO reabrir visível:', await p.evaluate(() => {
    const r = document.getElementById('btn-reopen'); return !!(r && r.style.display !== 'none');
  }));

  console.log('PAGEERRORS:', JSON.stringify(errs.slice(0, 6)));
  await b.close();
})();
