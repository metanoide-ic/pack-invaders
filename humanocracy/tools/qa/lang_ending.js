/* QA: troca de idioma (EN/ES) + visual da tela de final com a fonte nova. */
const { chromium } = require('playwright');
const U = process.env.HUMANOCRACY_URL || 'file://' + require('path').resolve(__dirname, '../../humanocracy-standalone.html');
const DIR = require('os').tmpdir() + '/';
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'] });
  const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
  const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 140)));
  const badge = () => p.evaluate(() => ({
    play: document.querySelector('#title-slots .title-slot[data-act="play"] .ms-badge').textContent,
    ach: document.querySelector('#title-slots .title-slot[data-act="achievements"] .ms-badge').textContent,
  }));
  await p.goto(U); await p.waitForSelector('#screen-title.active'); await p.waitForTimeout(500);
  await p.evaluate(() => { try { localStorage.clear(); } catch (e) {} SETTINGS.lang = 'en'; saveSettings(); location.reload(); });
  await p.waitForSelector('#screen-title.active'); await p.waitForTimeout(700);
  console.log('EN:', JSON.stringify(await badge()));
  await p.screenshot({ path: DIR + 'qa_title_en.png' });
  await p.evaluate(() => { SETTINGS.lang = 'es'; saveSettings(); location.reload(); });
  await p.waitForSelector('#screen-title.active'); await p.waitForTimeout(700);
  console.log('ES:', JSON.stringify(await badge()));
  // volta pra PT e força um FINAL pra ver o visual
  await p.evaluate(() => { SETTINGS.lang = 'pt'; saveSettings(); location.reload(); });
  await p.waitForSelector('#screen-title.active'); await p.waitForTimeout(600);
  await p.evaluate(() => showModeSelect());
  await p.waitForTimeout(200);
  await p.evaluate(() => { MS.idx = 0; msConfirm(); });
  await p.waitForTimeout(300);
  const bs = await p.$$('#modal-actions button'); if (bs[0]) await bs[0].click();
  await p.waitForTimeout(800);
  await p.evaluate(() => { try { finishGame(); } catch (e) { window.__qaerr = String(e); } });
  await p.waitForTimeout(1800);
  const st = await p.evaluate(() => ({ screen: [...document.querySelectorAll('.screen.active')].map(s => s.id).join(','), qaerr: window.__qaerr || null, title: (document.querySelector('.ending-title') || {}).textContent }));
  console.log('ENDING:', JSON.stringify(st));
  await p.screenshot({ path: DIR + 'qa_ending.png' });
  console.log('PAGEERRORS:', JSON.stringify([...new Set(errs)].slice(0, 6)));
  await b.close();
})();
