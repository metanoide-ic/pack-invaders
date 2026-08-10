/* QA parte 2: save/retomar no MEIO do jogo + modo infinito por 3 turnos. */
const { chromium } = require('playwright');
const U = process.env.HUMANOCRACY_URL || 'file://' + require('path').resolve(__dirname, '../../humanocracy-standalone.html');
const DIR = require('os').tmpdir() + '/';
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'] });
  const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
  const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 160)));
  const clickText = async (re) => { const bs = await p.$$('button'); for (const v of bs) { try { if (await v.isVisible() && re.test((await v.textContent()) || '')) { await v.click(); return true; } } catch (e) {} } return false; };
  const dismissModal = async () => { const mb = await p.$('#modal-overlay.active #modal-actions button'); if (mb) { await mb.click(); await p.waitForTimeout(250); return true; } return false; };
  const playDay = async (approveOnly) => {
    for (let i = 0; i < 8; i++) { const go = await p.$('#btn-gowork'); if (go && await go.isVisible()) { await go.click(); break; } await dismissModal(); await p.waitForTimeout(300); }
    await p.waitForTimeout(900); await clickText(/CIÊNCIA|ENTENDIDO/i); await p.waitForTimeout(1500);
    for (let c = 0; c < 18; c++) {
      await dismissModal();
      const st = await p.evaluate(() => ({ cz: !!(shift && shift.citizen), running: !!(shift && shift.running) }));
      if (!st.running) break;
      if (!st.cz) { await p.waitForTimeout(700); if (!await p.evaluate(() => !!(shift && shift.citizen))) break; }
      const want = await p.evaluate(() => {
        const cz = shift.citizen; if (!cz) return 'approve';
        try {
          if (cz.isWanted) return 'detain';
          const viols = cz.discrepancies.filter(d => !d.latent).concat(computeViolations(cz, S.day));
          if (viols.length) return 'reject';
          if (shift.approvedToday >= quotaForDay(S.day)) return 'reject';
          return 'approve';
        } catch (e) { return 'approve'; }
      });
      if (want === 'detain') { const det = await p.$('#btn-detain:not([disabled])'); if (det) await det.click(); else await p.evaluate(() => { try { decide('reject'); } catch (e) {} }); }
      else await p.evaluate((w) => { try { decide(w); } catch (e) { window.__qaerr = String(e); } }, want);
      await p.waitForTimeout(1300); await dismissModal();
    }
    await clickText(/ENCERRAR TURNO|END SHIFT/i); await p.waitForTimeout(1100); await dismissModal();
    const gh = await p.$('#btn-gohome'); if (gh && await gh.isVisible()) await gh.click();
    await p.waitForTimeout(1300);
    if (await p.evaluate(() => document.getElementById('screen-house').classList.contains('active')))
      await p.evaluate(() => { try { hClose(); afterNight(); } catch (e) { window.__qaerr = String(e); } });
    await p.waitForTimeout(1100);
    if (await p.evaluate(() => document.getElementById('screen-night').classList.contains('active'))) {
      const nb = await p.$('#night-choices button'); if (nb) await nb.click(); await p.waitForTimeout(1300);
    }
    await dismissModal();
  };

  // ---- B) INFINITO: 3 turnos, sem finais, placar sobe ----
  await p.goto(U); await p.waitForSelector('#screen-title.active'); await p.waitForTimeout(700);
  await p.evaluate(() => showModeSelect()); await p.waitForTimeout(200);
  await p.evaluate(() => { MS.idx = 1; msConfirm(); }); await p.waitForTimeout(300);
  await clickText(/ASSUMIR/i); await p.waitForTimeout(800);
  for (let turn = 1; turn <= 3; turn++) {
    await playDay(true);
    const st = await p.evaluate(() => ({ infDay: S && S.infDay, infScore: S && S.infScore, day: S && S.day, screen: [...document.querySelectorAll('.screen.active')].map(s => s.id).join(','), hdr: (document.getElementById('shift-day') || {}).textContent }));
    console.log(`B) turno ${turn}:`, JSON.stringify(st), 'errs:', errs.length);
    if (!/morning/.test(st.screen)) { await p.screenshot({ path: DIR + 'qa2_stuck.png' }); break; }
  }
  console.log('PAGEERRORS:', JSON.stringify([...new Set(errs)].slice(0, 8)));
  await b.close();
})();
