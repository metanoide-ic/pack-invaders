/* VARREDURA VISUAL: fotografa cada tela e cada sobreposição do jogo num só
   passe, para caçar o que ainda está feio. Sai em QA_OUT. */
const { chromium } = require('playwright');
const path = require('path');
const U = process.env.HUMANOCRACY_URL || 'file://' + path.resolve(__dirname, '../../humanocracy-standalone.html');
const OUT = process.env.QA_OUT || '/tmp/claude-0/-home-user-pack-invaders/3c829368-3609-517f-b09c-9b887c069402/scratchpad/sweep';

(async () => {
  require('fs').mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'] });
  const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
  const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 140)));
  const shot = async (n) => { await p.screenshot({ path: path.join(OUT, n + '.png') }); console.log('·', n); };
  const signAll = async () => { for (let i = 0; i < 8; i++) { const m = await p.$('#modal-overlay.active #modal-actions button'); if (!m) break; await m.click(); await p.waitForTimeout(380); } };

  await p.goto(U);
  await p.waitForSelector('#screen-title.active'); await p.waitForTimeout(700);
  await p.evaluate(() => { try { localStorage.clear(); } catch (e) {} });
  await shot('01-titulo');
  await p.evaluate(() => showModeSelect()); await p.waitForTimeout(500);
  await shot('02-modos');
  await p.evaluate(() => { MS.idx = 0; msConfirm(); }); await p.waitForTimeout(600); await signAll();

  // um dia adiantado, com todas as ferramentas na mesa
  await p.evaluate(() => { S.day = 20; startDay(); }); await p.waitForTimeout(1100); await signAll(); await p.waitForTimeout(2600);
  await shot('03-turno');
  await p.evaluate(() => openExam()); await p.waitForTimeout(700); await shot('04-exame');
  await p.evaluate(() => { $('exam-overlay').classList.remove('active'); openBag(); }); await p.waitForTimeout(700); await shot('05-bagagem');
  await p.evaluate(() => { $('bag-overlay').classList.remove('active'); openLifeline(); }); await p.waitForTimeout(700); await shot('06-dossie');
  await signAll();
  await p.evaluate(() => { openMap(); }); await p.waitForTimeout(700); await shot('07-mapa');
  await p.evaluate(() => { $('map-overlay').classList.remove('active'); }); await p.waitForTimeout(200);
  await p.evaluate(() => togglePause && togglePause()); await p.waitForTimeout(600); await shot('08-pausa');
  await p.evaluate(() => togglePause && togglePause()); await p.waitForTimeout(400);

  // fim de expediente → relatório → casa → noite
  await p.evaluate(() => { const t = $('btn-endshift'); if (t) t.click(); }); await p.waitForTimeout(2200); await signAll();
  await p.waitForTimeout(600); await shot('09-relatorio');
  for (let i = 0; i < 12; i++) { const g = await p.$('#btn-gohome'); if (g && await g.isVisible()) { await g.click(); break; } await p.waitForTimeout(300); }
  await p.waitForTimeout(1600); await shot('10-casa');
  await p.evaluate(() => { try { hClose(); (typeof houseSleepNow === 'function') ? houseSleepNow() : afterNight(); } catch (e) { try { afterNight(); } catch (e2) {} } });
  await p.waitForTimeout(1500); await shot('11-noite');
  const nb = await p.$('#night-choices button'); if (nb) { await nb.click(); await p.waitForTimeout(1400); }
  await signAll(); await p.waitForTimeout(600); await shot('12-manha');

  // um final, para ver a tela de encerramento
  await p.evaluate(() => { try { finishGame('prisao'); } catch (e) {} }); await p.waitForTimeout(1600); await shot('13-final');

  console.log('PAGEERRORS:', JSON.stringify(errs.slice(0, 6)));
  await b.close();
})();
