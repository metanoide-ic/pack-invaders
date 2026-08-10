/* QA de fechamento: joga DIAS INTEIROS de verdade — decide, usa ferramentas,
   encerra turno, dorme, amanhece — caçando pageerrors e travas de fluxo. */
const { chromium } = require('playwright');
const U = process.env.HUMANOCRACY_URL || 'file://' + require('path').resolve(__dirname, '../../humanocracy-standalone.html');
const DIR = require('os').tmpdir() + '/';
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'] });
  const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
  const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 160)));
  const clickText = async (re) => { const bs = await p.$$('button'); for (const v of bs) { try { if (await v.isVisible() && re.test((await v.textContent()) || '')) { await v.click(); return true; } } catch (e) {} } return false; };
  const dismissModal = async () => { const mb = await p.$('#modal-overlay.active #modal-actions button'); if (mb) { await mb.click(); await p.waitForTimeout(250); return true; } return false; };

  await p.goto(U);
  await p.waitForSelector('#screen-title.active'); await p.waitForTimeout(400);
  await p.evaluate(() => { try { localStorage.clear(); } catch (e) {} });
  await p.evaluate(() => showModeSelect()); await p.waitForTimeout(200);
  await p.evaluate(() => { MS.idx = 0; msConfirm(); }); await p.waitForTimeout(300);
  await clickText(/ASSINAR/i); await p.waitForTimeout(800);

  const DAYS = 4;
  for (let day = 1; day <= DAYS; day++) {
    // manhã → trabalho
    for (let i = 0; i < 8; i++) { const go = await p.$('#btn-gowork'); if (go && await go.isVisible()) { await go.click(); break; } await dismissModal(); await p.waitForTimeout(300); }
    await p.waitForTimeout(900); await clickText(/CIÊNCIA|ENTENDIDO/i); await p.waitForTimeout(1500);
    // processa a fila inteira (com ferramentas de vez em quando)
    for (let c = 0; c < 20; c++) {
      await dismissModal();
      const st = await p.evaluate(() => ({ cz: !!(shift && shift.citizen), running: !!(shift && shift.running), clock: shift && shift.clock }));
      if (!st.running) break;
      if (!st.cz) { await p.waitForTimeout(700); const st2 = await p.evaluate(() => !!(shift && shift.citizen)); if (!st2) break; }
      if (c % 3 === 0) await p.evaluate(() => { try { scan('thermo'); } catch (e) { window.__qaerr = String(e); } });
      if (c % 4 === 1) { await p.evaluate(() => { try { openExam(); } catch (e) { window.__qaerr = String(e); } }); await p.waitForTimeout(250); await clickText(/FECHAR|CLOSE/i); }
      if (c % 5 === 2) await p.evaluate(() => { try { scan('pulse'); } catch (e) { window.__qaerr = String(e); } });
      // decide (APV na maioria; REJ às vezes; DET se habilitado de vez em quando)
      // APV/REJ viraram carimbos arrastáveis; o driver decide direto na API
      const det = await p.$('#btn-detain:not([disabled])');
      if (det && c % 6 === 5) await det.click();
      else if (c % 3 === 2) await p.evaluate(() => { try { decide('reject'); } catch (e) { window.__qaerr = String(e); } });
      else await p.evaluate(() => { try { decide('approve'); } catch (e) { window.__qaerr = String(e); } });
      await p.waitForTimeout(1400);
      await dismissModal();
    }
    // encerra o turno (se ainda rodando) e vai pra casa
    await clickText(/ENCERRAR TURNO|END SHIFT/i); await p.waitForTimeout(1200);
    await dismissModal();
    const gohome = await p.$('#btn-gohome'); if (gohome && await gohome.isVisible()) await gohome.click();
    await p.waitForTimeout(1400);
    // na casa: dorme direto (afterNight) — pode cair numa batida na porta
    const inHouse = await p.evaluate(() => document.getElementById('screen-house').classList.contains('active'));
    if (inHouse) await p.evaluate(() => { try { hClose(); houseSleepNow ? houseSleepNow() : afterNight(); } catch (e) { try { afterNight(); } catch (e2) { window.__qaerr = String(e2); } } });
    await p.waitForTimeout(1200);
    // evento da noite? escolhe a primeira opção
    const night = await p.evaluate(() => document.getElementById('screen-night').classList.contains('active'));
    if (night) { const nb = await p.$('#night-choices button'); if (nb) await nb.click(); await p.waitForTimeout(1400); }
    await dismissModal();
    const state = await p.evaluate(() => ({ day: S && S.day, money: S && S.money, screen: [...document.querySelectorAll('.screen.active')].map(s => s.id).join(','), qaerr: window.__qaerr || null }));
    console.log(`fim do dia ${day}:`, JSON.stringify(state), 'errs:', errs.length);
    if (state.qaerr) { console.log('QAERR:', state.qaerr); break; }
    if (!/morning|ending/.test(state.screen)) { console.log('FLUXO TRAVADO em', state.screen); await p.screenshot({ path: DIR + 'qa_stuck.png' }); break; }
    if (/ending/.test(state.screen)) { console.log('FINAL alcançado (família/prisão?)'); break; }
  }
  // salvar/recarregar: RETOMAR aparece?
  await p.reload(); await p.waitForSelector('#screen-title.active'); await p.waitForTimeout(800);
  const resume = await p.evaluate(() => { const s = document.querySelector('#title-slots .title-slot[data-act="continue"]'); return s && s.style.display !== 'none'; });
  console.log('RETOMAR visível após reload:', resume);
  console.log('PAGEERRORS:', JSON.stringify([...new Set(errs)].slice(0, 8)));
  await b.close();
})();
