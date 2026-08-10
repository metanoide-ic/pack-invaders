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

  console.log('PAGEERRORS:', JSON.stringify(errs.slice(0, 6)));
  await b.close();
})();
