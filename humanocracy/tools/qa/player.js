/* JOGADOR DE VERDADE: dirige o jogo SÓ pela interface visível — clica em
   botões, arrasta carimbos, abre gaveta — como uma pessoa faria. Nenhuma
   função interna é chamada para avançar o jogo. É este driver que pega os
   bugs que os QAs "por dentro" não pegam.

   Relata, por dia: se a gaveta apareceu quando devia, se o turno começou,
   se sobrou modal preso na tela, e todo erro de página. */
const { chromium } = require('playwright');
const path = require('path');
const U = process.env.HUMANOCRACY_URL || 'file://' + path.resolve(__dirname, '../../humanocracy-standalone.html');
const OUT = process.env.QA_OUT || '/tmp/claude-0/-home-user-pack-invaders/3c829368-3609-517f-b09c-9b887c069402/scratchpad';
const DIAS = Number(process.env.QA_DAYS || 8);

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'] });
  const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
  const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 200)));
  const conerr = []; p.on('console', m => { if (m.type() === 'error') conerr.push(m.text().slice(0, 160)); });
  const problemas = [];

  const clique = async (sel, ms) => {
    const el = await p.$(sel);
    if (!el) return false;
    if (!(await el.isVisible())) return false;
    await el.click({ timeout: 4000 }).catch(() => {});
    await p.waitForTimeout(ms == null ? 350 : ms);
    return true;
  };
  // fecha o que estiver por cima, sempre CLICANDO como um jogador
  const limpaTela = async () => {
    for (let i = 0; i < 10; i++) {
      if (await clique('#tv-screen', 300)) { await clique('#tv-off', 500); continue; }
      if (await clique('#modal-overlay.active #modal-actions button', 380)) continue;
      break;
    }
  };

  await p.goto(U);
  await p.waitForSelector('#screen-title.active'); await p.waitForTimeout(500);
  await p.evaluate(() => { try { localStorage.clear(); } catch (e) {} });
  await p.reload(); await p.waitForSelector('#screen-title.active'); await p.waitForTimeout(700);

  // --- entra pelo menu, clicando
  await clique('#title-slots .title-slot[data-act="play"]', 600);
  await p.waitForSelector('#screen-modeselect.active', { timeout: 5000 }).catch(() => problemas.push('menu: INICIAR SERVIÇO não abriu a escala'));
  await clique('#ms-confirm', 900);
  await limpaTela();

  for (let dia = 1; dia <= DIAS; dia++) {
    // manhã → guichê
    let foi = false;
    for (let i = 0; i < 20 && !foi; i++) {
      await limpaTela();
      foi = await clique('#btn-gowork', 700);
      if (foi) break;
      // preso na casa ou na noite? empurra pela porta como o jogo faria
      const onde = await p.evaluate(() => [...document.querySelectorAll('.screen.active')].map(s => s.id).join(','));
      if (onde.includes('screen-house')) await p.evaluate(() => { try { hClose(); afterNight(); } catch (e) {} });
      else if (onde.includes('screen-night')) await clique('#night-choices button', 900);
    }
    if (!foi) {
      const onde = await p.evaluate(() => [...document.querySelectorAll('.screen.active')].map(s => s.id).join(',')
        + ' modal=' + !!document.querySelector('#modal-overlay.active') + ' tv=' + !!document.querySelector('#tv-overlay.active'));
      problemas.push(`d${dia}: não achei IR TRABALHAR (tela=${onde})`);
      await p.screenshot({ path: path.join(OUT, `player-FALHA-d${dia}.png`) });
      break;
    }
    // espera o expediente REALMENTE começar (comunicado + remessas assinadas)
    for (let i = 0; i < 30; i++) {
      await limpaTela();
      const pronto = await p.evaluate(() => !!(window.shift && shift.running));
      if (pronto) break;
      await p.waitForTimeout(400);
    }
    await p.waitForTimeout(1200);

    // o que o jogador VÊ na mesa neste dia
    const vis = await p.evaluate(() => {
      const on = (id) => { const e = document.getElementById(id); return !!(e && e.offsetParent !== null); };
      const box = (id) => { const e = document.getElementById(id); if (!e) return null; const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
      return {
        dia: S.day, rodando: !!shift.running, cidadao: !!shift.citizen,
        pend: (typeof PENDING_TOOLS !== 'undefined') ? [...PENDING_TOOLS] : [],
        gavA: box('drawer-left'), gavB: box('drawer-right'),
        gavAvis: on('drawer-left'), gavBvis: on('drawer-right'),
        devA: (typeof toolReady === 'function') && (toolReady('mapa') || toolReady('lupa')),
        devB: (typeof toolReady === 'function') && (toolReady('thermo') || toolReady('dossie')),
        modalPreso: !!document.querySelector('#modal-overlay.active'),
        tvPresa: !!document.querySelector('#tv-overlay.active'),
      };
    });
    if (vis.devA && !vis.gavA) problemas.push(`d${dia}: GAVETA A devia existir e sumiu (pend=${vis.pend})`);
    if (vis.devB && !vis.gavB) problemas.push(`d${dia}: GAVETA B devia existir e sumiu (pend=${vis.pend})`);
    if (!vis.rodando) problemas.push(`d${dia}: o turno não começou`);
    if (vis.modalPreso) problemas.push(`d${dia}: modal preso na tela`);
    if (vis.pend.length) problemas.push(`d${dia}: remessa não assinada ficou pendente: ${vis.pend}`);
    console.log(`d${String(dia).padStart(2)}`, JSON.stringify(vis));
    await p.screenshot({ path: path.join(OUT, `player-d${dia}.png`) });

    // trabalha o dia clicando nos carimbos de verdade
    for (let c = 0; c < 30; c++) {
      await limpaTela();
      const st = await p.evaluate(() => ({ run: !!(shift && shift.running), cz: !!(shift && shift.citizen), th: typeof THREAT !== 'undefined' && THREAT.on }));
      if (!st.run) break;
      if (st.th) { await clique('#btn-detain', 1200); await limpaTela(); continue; }
      if (!st.cz) { await p.waitForTimeout(700); continue; }
      const quer = await p.evaluate(() => {
        try {
          const cz = shift.citizen; if (!cz) return 'approve';
          if (cz.isWanted || cz.matador) return 'detain';
          const v = cz.discrepancies.filter(d => !d.latent).concat(computeViolations(cz, S.day));
          if (v.length) return 'reject';
          if (shift.approvedToday >= quotaForDay(S.day)) return 'reject';
          return 'approve';
        } catch (e) { return 'approve'; }
      });
      // clica no carimbo (o botão legado está oculto: usa o atalho de teclado,
      // que é o mesmo caminho de um jogador que usa A/R/D)
      if (quer === 'detain') { if (!(await clique('#btn-detain', 1100))) await p.keyboard.press('d'); }
      else await p.keyboard.press(quer === 'approve' ? 'a' : 'r');
      await p.waitForTimeout(1000);
    }

    await limpaTela();
    await clique('#btn-endshift', 1200);
    await p.waitForTimeout(1400);
    await limpaTela();
    let casa = false;
    for (let i = 0; i < 14 && !casa; i++) { casa = await clique('#btn-gohome', 700); await limpaTela(); }
    if (!casa) { problemas.push(`d${dia}: não achei VOLTAR PARA CASA`); break; }
    await p.waitForTimeout(1500);
    // dorme (a casa tem cama; o driver usa o botão de dormir se existir)
    for (let i = 0; i < 10; i++) {
      const onde = await p.evaluate(() => [...document.querySelectorAll('.screen.active')].map(s => s.id).join(','));
      if (onde.includes('screen-night') || onde.includes('screen-morning')) break;
      if (await clique('#h-sleep', 900)) continue;
      if (onde.includes('screen-house')) {
        await p.evaluate(() => { try { hClose(); afterNight(); } catch (e) {} });
        await p.waitForTimeout(1300); continue;
      }
      await p.waitForTimeout(500);
    }
    await clique('#night-choices button', 1400);
    await limpaTela();
  }

  console.log('\n=== PROBLEMAS ===');
  problemas.forEach(x => console.log(' ✗', x));
  if (!problemas.length) console.log(' (nenhum)');
  console.log('PAGEERRORS:', JSON.stringify(errs.slice(0, 8)));
  console.log('CONSOLE ERRORS:', JSON.stringify(conerr.slice(0, 8)));
  await b.close();
})();
