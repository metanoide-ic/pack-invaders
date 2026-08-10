/* QA de PROGRESSÃO: um inspetor competente precisa chegar fundo na campanha.
   Joga corretamente (usa o veredito interno do jogo), atravessa vários dias e
   confirma que o atentado do dia 13 acontece e pode ser resolvido — sem que a
   campanha termine antes da hora. QA_DAYS controla quantos dias percorrer. */
const { chromium } = require('playwright');
const U = process.env.HUMANOCRACY_URL || 'file://' + require('path').resolve(__dirname, '../../humanocracy-standalone.html');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'] });
  const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
  const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 160)));
  // a transmissão oficial (televisor) entra no lugar do papel em dias de virada
  const dismissTV = async () => {
    const on = await p.evaluate(() => document.getElementById('tv-overlay') && document.getElementById('tv-overlay').classList.contains('active'));
    if (!on) return false;
    await p.evaluate(() => { const c = document.getElementById('tv-screen'); if (c && c.onclick) c.onclick(); });
    await p.waitForTimeout(250);
    await p.evaluate(() => { const b2 = document.getElementById('tv-off'); if (b2) b2.click(); });
    await p.waitForTimeout(400);
    return true;
  };
  const dismissModal = async () => { const mb = await p.$('#modal-overlay.active #modal-actions button'); if (mb) { await mb.click(); await p.waitForTimeout(200); return true; } return false; };

  await p.goto(U);
  await p.waitForSelector('#screen-title.active'); await p.waitForTimeout(400);
  await p.evaluate(() => { try { localStorage.clear(); } catch (e) {} });
  await p.evaluate(() => showModeSelect()); await p.waitForTimeout(200);
  await p.evaluate(() => { MS.idx = 0; msConfirm(); }); await p.waitForTimeout(300);
  await dismissTV(); await dismissModal(); await p.waitForTimeout(600);

  const DAYS = Number(process.env.QA_DAYS || 14);
  let attacksSeen = 0;
  for (let day = 1; day <= DAYS; day++) {
    for (let i = 0; i < 10; i++) { const go = await p.$('#btn-gowork'); if (go && await go.isVisible()) { await go.click(); break; } await dismissTV(); await dismissModal(); await p.waitForTimeout(300); }
    await p.waitForTimeout(700); await dismissTV(); await dismissModal(); await p.waitForTimeout(1200);
    for (let c = 0; c < 26; c++) {
      await dismissTV(); await dismissModal();
      const st = await p.evaluate(() => ({ run: !!(shift && shift.running), cz: !!(shift && shift.citizen), threat: typeof THREAT !== 'undefined' && THREAT.on }));
      if (!st.run) break;
      if (st.threat) {   // atentado: detém antes que ele use o que trouxe
        attacksSeen++;
        await p.evaluate(() => { const d = document.getElementById('btn-detain'); if (d) { d.disabled = false; d.click(); } });
        await p.waitForTimeout(900); await dismissTV(); await dismissModal(); await p.waitForTimeout(900);
        continue;
      }
      if (!st.cz) { await p.waitForTimeout(600); const again = await p.evaluate(() => !!(shift && shift.citizen)); if (!again) break; }
      // decide pelo veredito interno (inspetor competente, respeitando a cota)
      const want = await p.evaluate(() => {
        try {
          const cz = shift.citizen; if (!cz) return 'approve';
          if (cz.isWanted) return 'detain';
          const viols = cz.discrepancies.filter(d => !d.latent).concat(computeViolations(cz, S.day));
          if (viols.length) return 'reject';
          if (shift.approvedToday >= quotaForDay(S.day)) return 'reject';
          return 'approve';
        } catch (e) { return 'approve'; }
      });
      if (want === 'detain') { const det = await p.$('#btn-detain:not([disabled])'); if (det) await det.click(); else await p.evaluate(() => { try { decide('reject'); } catch (e) {} }); }
      else await p.evaluate((w) => { try { decide(w); } catch (e) { window.__qaerr = String(e); } }, want);
      await p.waitForTimeout(1100);
      await dismissTV(); await dismissModal();
    }
    const t = await p.$('#btn-endshift'); if (t && await t.isVisible()) await t.click();
    await p.waitForTimeout(900); await dismissTV(); await dismissModal();
    for (let w = 0; w < 12; w++) { const g = await p.$('#btn-gohome'); if (g && await g.isVisible()) { await g.click(); break; } await p.waitForTimeout(300); }
    await p.waitForTimeout(1200);
    const inHouse = await p.evaluate(() => document.getElementById('screen-house').classList.contains('active'));
    if (inHouse) await p.evaluate(() => { try { hClose(); houseSleepNow ? houseSleepNow() : afterNight(); } catch (e) { try { afterNight(); } catch (e2) {} } });
    await p.waitForTimeout(1000);
    const night = await p.evaluate(() => document.getElementById('screen-night').classList.contains('active'));
    if (night) { const nb = await p.$('#night-choices button'); if (nb) await nb.click(); await p.waitForTimeout(1200); }
    await dismissTV(); await dismissModal();
    const state = await p.evaluate(() => ({ day: S && S.day, money: S && S.money, risk: S && S.citRisk,
      screen: [...document.querySelectorAll('.screen.active')].map(s => s.id).join(',') }));
    console.log(`dia ${day} →`, JSON.stringify(state), 'errs:', errs.length);
    if (state.screen.includes('screen-ending')) { console.log('CAMPANHA TERMINOU CEDO no dia', day); break; }
  }
  console.log('ATENTADOS enfrentados:', attacksSeen);
  console.log('PAGEERRORS:', JSON.stringify(errs.slice(0, 6)));
  await b.close();
})();
