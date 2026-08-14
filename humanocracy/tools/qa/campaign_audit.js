/* AUDITORIA DO ROTEIRO: percorre os 48 dias sem jogar a fila e confere que a
   espinha da campanha existe e é acionável — os quatro regimes (República,
   o partido extremista Mehrvolk, o Conselho Popular comunista e o Colapso),
   as regras que entram e saem, os encontros roteirizados, as noites, o dia
   47 (sem REJEITAR) e o dia 48 (o espelho). Não substitui jogar: prova que
   cada peça está ligada ao dia certo. */
const { chromium } = require('playwright');
const U = process.env.HUMANOCRACY_URL || 'file://' + require('path').resolve(__dirname, '../../humanocracy-standalone.html');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
  const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
  const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 160)));
  await p.goto(U); await p.waitForSelector('#screen-title.active'); await p.waitForTimeout(500);

  const rep = await p.evaluate(() => {
    const out = { days: [], regimes: {}, missing: [], counts: {} };
    S = freshState();
    for (let d = 1; d <= 48; d++) {
      const reg = regimeOfDay(d);
      out.regimes[reg] = (out.regimes[reg] || 0) + 1;
      const rules = rulesForDay(d);
      const enc = ENCOUNTERS[d] || null;
      const news = (typeof SCRIPTED_NEWS !== 'undefined') ? SCRIPTED_NEWS[d] : undefined;
      const home = (typeof HOME_EVENTS !== 'undefined') ? HOME_EVENTS[d] : undefined;
      const night = (typeof NIGHT_EVENTS !== 'undefined') ? NIGHT_EVENTS[d] : undefined;
      const atk = (typeof ATTACK_DAYS !== 'undefined') ? ATTACK_DAYS[d] : undefined;
      out.days.push({
        d, reg, label: REGIME_LABEL[reg], masthead: MASTHEAD[reg],
        rules: rules.length, quota: quotaForDay(d), salary: salaryForDay(d),
        enc: enc ? (enc.id || enc.nome || 'sim') : null,
        news: news === undefined ? null : (news === null ? 'sem jornal' : 'sim'),
        home: home ? 'sim' : null, night: night ? 'sim' : null, attack: atk || null,
      });
      if (!rules.length) out.missing.push('dia ' + d + ' sem regras');
      if (!REGIME_LABEL[reg]) out.missing.push('dia ' + d + ' sem rótulo de regime');
    }
    out.counts.encontros = out.days.filter(x => x.enc).length;
    out.counts.noticias = out.days.filter(x => x.news).length;
    out.counts.casa = out.days.filter(x => x.home).length;
    out.counts.noites = out.days.filter(x => x.night).length;
    out.counts.atentados = out.days.filter(x => x.attack).length;
    return out;
  });

  // o posto se equipa com o tempo: em que dia cada ferramenta/permissão chega
  const remessas = await p.evaluate(() => Object.keys(TOOL_UNLOCK)
    .sort((a, b) => TOOL_UNLOCK[a].day - TOOL_UNLOCK[b].day)
    .map(k => `d${TOOL_UNLOCK[k].day}:${k}`).join(' '));
  console.log('REMESSAS:', remessas);
  console.log('REGIMES (dias por fase):', JSON.stringify(rep.regimes));
  console.log('COBERTURA:', JSON.stringify(rep.counts));
  const marcos = [1, 7, 12, 14, 27, 30, 33, 37, 41, 43, 47, 48];
  for (const d of marcos) {
    const x = rep.days[d - 1];
    console.log(` dia ${String(d).padStart(2)} · ${x.label.padEnd(32)} regras:${String(x.rules).padStart(2)} cota:${String(x.quota).padStart(3)} ` +
      `enc:${(x.enc || '—').padEnd(12)} jornal:${(x.news || '—').padEnd(10)} casa:${x.home || '—'} noite:${x.night || '—'} atentado:${x.attack || '—'}`);
  }
  if (rep.missing.length) console.log('FALHAS:', rep.missing.join(' | '));

  // dia 47: o botão REJEITAR sai da mesa; dia 48: o espelho
  const d47 = await p.evaluate(() => {
    S = freshState(); S.day = 47; startDay();
    return { rej: document.getElementById('btn-reject').classList.contains('hidden'),
             stampRej: document.getElementById('st-rej').classList.contains('hidden'),
             rules: rulesForDay(47) };
  });
  await p.waitForTimeout(600);
  console.log('dia 47 → REJEITAR escondido:', d47.rej, '· carimbo REJ escondido:', d47.stampRej, '· regra:', JSON.stringify(d47.rules));
  await p.evaluate(() => { S = freshState(); S.day = 48; startDay(); });
  await p.waitForTimeout(900);
  // o comunicado do dia é datilografado: revela e assina para chegar ao espelho
  await p.evaluate(() => { const bd = document.getElementById('modal-body'); if (bd && bd.onclick) bd.onclick(); });
  await p.waitForTimeout(300);
  const btn = await p.$('#modal-overlay.active #modal-actions button'); if (btn) await btn.click();
  await p.waitForTimeout(2200);
  const mirror = await p.evaluate(() => ({ mode: (typeof HOUSE !== 'undefined' ? HOUSE.mode : null),
    screen: [...document.querySelectorAll('.screen.active')].map(s => s.id).join(',') }));
  console.log('dia 48 → tela:', mirror.screen, '· modo da casa:', mirror.mode);

  /* O ESPELHO TEM QUE SER TERMINÁVEL. Chegar até ele não basta — em 2026 o
     jogo chegou a ficar com o espelho travado (shift.running desligado e
     shift.citizen nunca setado bloqueavam o carimbo de teclado E o
     arrastado, o único jeito de terminar a campanha inteira). Testa os dois
     caminhos: tecla (REJEITAR) e arrastar o carimbo físico (APROVAR). */
  const rejeitar = await p.evaluate(() => {
    S = freshState(); S.day = 48; showScreen('screen-shift'); presentMirror();
    const before = { running: shift.running, mirrorActive: shift.mirrorActive, hasCitizen: !!shift.citizen };
    decide('reject');
    return { before, screen: [...document.querySelectorAll('.screen.active')].map(s => s.id).join(','),
      title: (document.getElementById('ending-title') || {}).textContent };
  });
  console.log('espelho → REJEITAR via decide():', JSON.stringify(rejeitar));
  if (rejeitar.screen !== 'screen-ending' || rejeitar.title !== 'FINAL — O ESPELHO') {
    console.log('FALHA CRÍTICA: rejeitar no espelho não terminou o jogo (regressão do bug de 2026)');
  }
  await p.evaluate(() => { S = freshState(); S.day = 48; showScreen('screen-shift'); presentMirror(); });
  await p.waitForTimeout(300);
  // arrasta o carimbo físico de verdade (mouse real do Playwright, não
  // evento sintético dentro de evaluate() — o handler usa setPointerCapture
  // e um listener de 'pointerup' no document, que não reagem do mesmo jeito
  // a um PointerEvent despachado à mão)
  const stampBox = await p.$eval('#st-apv', el => { const r = el.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; });
  const docBox = await p.$eval('#desk .document', el => { const r = el.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; });
  await p.mouse.move(stampBox.x, stampBox.y);
  await p.mouse.down();
  await p.mouse.move(docBox.x, docBox.y, { steps: 12 });
  await p.mouse.up();
  await p.waitForTimeout(900);
  const aprovResult = await p.evaluate(() => ({ screen: [...document.querySelectorAll('.screen.active')].map(s => s.id).join(','),
    title: (document.getElementById('ending-title') || {}).textContent }));
  console.log('espelho → APROVAR via carimbo arrastado:', JSON.stringify(aprovResult));
  if (aprovResult.screen !== 'screen-ending') console.log('FALHA CRÍTICA: aprovar no espelho (carimbo arrastado) não terminou o jogo');

  console.log('PAGEERRORS:', JSON.stringify(errs.slice(0, 6)));
  await b.close();
})();
