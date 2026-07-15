/* ============================================================
   HUMANOCRACY — game.js
   Motor: cidadãos procedurais, inspeção, IA adaptativa,
   economia familiar, 48 dias, finais.
   ============================================================ */
'use strict';

/* ---------- RNG ---------- */
let _seed = Date.now() % 2147483647;
function rnd() { _seed = (_seed * 48271) % 2147483647; return (_seed - 1) / 2147483646; }
function ri(a, b) { return a + Math.floor(rnd() * (b - a + 1)); }
function pick(arr) { return arr[Math.floor(rnd() * arr.length)]; }
function chance(p) { return rnd() < p; }

/* ---------- ÁUDIO ---------- */
let AC = null;
function sfx(kind) {
  try {
    AC = AC || new (window.AudioContext || window.webkitAudioContext)();
    const t = AC.currentTime;
    const o = AC.createOscillator(), g = AC.createGain();
    o.connect(g); g.connect(AC.destination);
    if (kind === 'stamp') { o.type = 'square'; o.frequency.setValueAtTime(70, t); g.gain.setValueAtTime(.25, t); g.gain.exponentialRampToValueAtTime(.001, t + .18); o.start(t); o.stop(t + .2); }
    else if (kind === 'buzz') { o.type = 'sawtooth'; o.frequency.setValueAtTime(120, t); g.gain.setValueAtTime(.12, t); g.gain.exponentialRampToValueAtTime(.001, t + .5); o.start(t); o.stop(t + .5); }
    else if (kind === 'ding') { o.type = 'sine'; o.frequency.setValueAtTime(660, t); g.gain.setValueAtTime(.12, t); g.gain.exponentialRampToValueAtTime(.001, t + .4); o.start(t); o.stop(t + .4); }
    else if (kind === 'scan') { o.type = 'sine'; o.frequency.setValueAtTime(220, t); o.frequency.linearRampToValueAtTime(440, t + .35); g.gain.setValueAtTime(.08, t); g.gain.exponentialRampToValueAtTime(.001, t + .4); o.start(t); o.stop(t + .4); }
    else if (kind === 'step') { o.type = 'sine'; o.frequency.setValueAtTime(44 + Math.random() * 10, t); g.gain.setValueAtTime(.05, t); g.gain.exponentialRampToValueAtTime(.001, t + .09); o.start(t); o.stop(t + .1); }
    else if (kind === 'knock') {
      for (let i = 0; i < 3; i++) {
        const o2 = AC.createOscillator(), g2 = AC.createGain();
        o2.connect(g2); g2.connect(AC.destination);
        const tt = t + i * .5;
        o2.type = 'sine'; o2.frequency.setValueAtTime(58, tt);
        g2.gain.setValueAtTime(.28, tt); g2.gain.exponentialRampToValueAtTime(.001, tt + .22);
        o2.start(tt); o2.stop(tt + .25);
      }
    }
  } catch (e) { /* áudio indisponível */ }
}

/* ---------- MÚSICA (trilha melancólica procedural) ---------- */
const MUSIC = { on: true, playing: false, timer: null };
const M_NOTES = [110, 130.81, 146.83, 164.81, 196, 220]; // lá menor, esparso
function musicNote() {
  if (!MUSIC.on || !MUSIC.playing) return;
  try {
    AC = AC || new (window.AudioContext || window.webkitAudioContext)();
    if (AC.state === 'suspended') return;
    const t = AC.currentTime;
    const f = pick(M_NOTES) * (chance(.3) ? 2 : 1);
    const lp = AC.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 700;
    const g = AC.createGain(); g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(.032, t + 1.3);
    g.gain.linearRampToValueAtTime(0, t + 4.6);
    lp.connect(g); g.connect(AC.destination);
    [f, f * 1.003].forEach(fr => {
      const o = AC.createOscillator(); o.type = 'triangle'; o.frequency.value = fr;
      o.connect(lp); o.start(t); o.stop(t + 4.8);
    });
  } catch (e) {}
}
function startMusic() {
  if (MUSIC.playing) return;
  MUSIC.playing = true;
  clearInterval(MUSIC.timer);
  MUSIC.timer = setInterval(musicNote, 3200);
  musicNote();
}
function stopMusic() {
  MUSIC.playing = false;
  clearInterval(MUSIC.timer);
}

/* ---------- NEVE DO TÍTULO ---------- */
const TS = { raf: null, flakes: [], t: 0 };
function startTitleSnow() {
  const cv = $('title-snow');
  if (!cv) return;
  cv.width = innerWidth; cv.height = innerHeight;
  const ctx = cv.getContext('2d');
  TS.flakes = [];
  for (let i = 0; i < 90; i++) TS.flakes.push({ x: Math.random() * cv.width, y: Math.random() * cv.height, v: .4 + Math.random() * 1.1, w: Math.random() * .6 - .3, r: .8 + Math.random() * 1.4 });
  cancelAnimationFrame(TS.raf);
  const loop = () => {
    if (!$('screen-title').classList.contains('active')) { TS.raf = null; return; }
    TS.t += .016;
    ctx.clearRect(0, 0, cv.width, cv.height);
    const gy = cv.height * .86;
    // muro e torre do posto no horizonte
    ctx.fillStyle = '#0e100c';
    ctx.fillRect(0, gy - 26, cv.width, 26 + cv.height * .14);
    const tx = cv.width * .82;
    ctx.fillRect(tx, gy - 120, 34, 120);
    ctx.fillRect(tx - 8, gy - 132, 50, 14);
    // luz da torre varrendo
    const ang = Math.sin(TS.t * .35) * .9;
    const lx = tx + 17, ly = gy - 126;
    const grad = ctx.createLinearGradient(lx, ly, lx + Math.sin(ang) * 500, ly + 400);
    grad.addColorStop(0, 'rgba(201,180,120,.10)'); grad.addColorStop(1, 'rgba(201,180,120,0)');
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.moveTo(lx, ly);
    ctx.lineTo(lx + Math.sin(ang - .18) * 620, ly + 480);
    ctx.lineTo(lx + Math.sin(ang + .18) * 620, ly + 480);
    ctx.closePath(); ctx.fill();
    // neve
    ctx.fillStyle = 'rgba(215,215,208,.55)';
    TS.flakes.forEach(s => {
      s.y += s.v; s.x += s.w + Math.sin(TS.t + s.y * .01) * .2;
      if (s.y > cv.height) { s.y = -3; s.x = Math.random() * cv.width; }
      ctx.fillRect(s.x, s.y, s.r, s.r);
    });
    TS.raf = requestAnimationFrame(loop);
  };
  TS.raf = requestAnimationFrame(loop);
}

/* ---------- SALÁRIO POR REGIME (os reajustes que a inflação come) ---------- */
function salaryForDay(d) { return d >= 31 ? 8 : d >= 13 ? 6 : 5; }

/* ---------- ESTADO ---------- */
const SAVE_KEY = 'humanocracy_save_v1';
let S = null;
function freshState() {
  return {
    day: 1, money: 30, citTotal: 0,
    family: {
      vessa: { nome: 'Vessa (esposa)', alive: true, sick: false, sickDays: 0, hunger: 0 },
      tomi: { nome: 'Tomi (filho, 8 anos)', alive: true, sick: false, sickDays: 0, hunger: 0 },
      dario: { nome: 'Dario (filho, 15 — do seu primeiro casamento)', alive: true, sick: false, sickDays: 0, hunger: 0 },
      mae: { nome: 'Sua mãe, Odila', alive: true, sick: false, sickDays: 0, hunger: 0 },
    },
    flags: {}, counters: {
      approved: 0, rejected: 0, detained: 0, correct: 0, wrong: 0,
      alternadosIn: 0, alternadosCaught: 0, alternadosBlocked: 0,
      innocentsDetained: 0, bribes: 0, bribeMoney: 0, resHelped: 0,
    },
    ai: { det: {} },           // IA adaptativa: quantas vezes cada discrepância foi detectada
    bioCalibrated: false,
    pendingNews: [],           // consequências tardias {day, text}
    rent: 15,
    seedBase: Math.floor(Math.random() * 1e9),
  };
}
function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) {} }
function loadSave() {
  try {
    const j = localStorage.getItem(SAVE_KEY);
    if (!j) return null;
    const s = JSON.parse(j);
    // migração: saves antigos não tinham o Dario
    if (s.family && !s.family.dario) s.family.dario = { nome: 'Dario (filho, 15 — do seu primeiro casamento)', alive: true, sick: false, sickDays: 0, hunger: 0 };
    return s;
  } catch (e) { return null; }
}

/* ---------- DATAS DO MUNDO ---------- */
const MONTHS = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
function worldDate(day) { // dia 1 = 3 OUT 1957
  const d = new Date(1957, 9, 2 + day);
  return { d: d.getDate(), m: d.getMonth(), y: d.getFullYear(), ts: d.getTime() };
}
function fmtDate(dt) { return `${dt.d} ${MONTHS[dt.m]} ${dt.y}`; }
function randomDateAround(day, minOff, maxOff) { // offset em dias
  const base = new Date(1957, 9, 2 + day + ri(minOff, maxOff));
  return { d: base.getDate(), m: base.getMonth(), y: base.getFullYear(), ts: base.getTime() };
}

/* ---------- DOM ---------- */
const $ = (id) => document.getElementById(id);
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  $(id).classList.add('active');
  // trilha: toca fora do expediente; no posto, só o drone e o rádio
  if (id === 'screen-shift' || id === 'screen-night') stopMusic();
  else if (MUSIC.on) startMusic();
}
function setRegimeClass(day) {
  document.body.className = '';
  document.body.classList.add('regime-' + regimeOfDay(day));
}

/* ---------- MODAL ---------- */
function modal(title, body, actions) {
  $('modal-title').textContent = title;
  $('modal-body').textContent = body;
  const box = $('modal-actions'); box.innerHTML = '';
  (actions || [{ label: 'OK' }]).forEach(a => {
    const b = document.createElement('button');
    b.textContent = a.label;
    b.onclick = () => { $('modal-overlay').classList.remove('active'); if (a.fn) a.fn(); };
    box.appendChild(b);
  });
  $('modal-overlay').classList.add('active');
}

/* ---------- CITAÇÃO ---------- */
let citTimer = null;
function citation(text) {
  sfx('buzz');
  S.citTotal++;
  shift.citToday++;
  let fine = 0;
  if (shift.citToday > 2) { fine = 5; S.money = Math.max(-50, S.money - 5); }
  $('citation-body').textContent = text + (fine ? `\nMULTA: ${MOEDA} ${fine}` : '\nADVERTÊNCIA REGISTRADA.');
  $('citation').classList.add('active');
  clearTimeout(citTimer);
  citTimer = setTimeout(() => $('citation').classList.remove('active'), 4200);
  updateHud();
}

/* ---------- SUSSURROS ---------- */
function whisper() {
  const w = $('whisper');
  w.textContent = pick(WHISPERS);
  w.style.left = ri(15, 60) + '%';
  w.style.top = ri(20, 70) + '%';
  w.classList.remove('active'); void w.offsetWidth; w.classList.add('active');
}

/* ---------- RETRATOS (SVG procedural) ---------- */
const SKINS = ['#e8c39e', '#d9a878', '#c68d5c', '#a9744f', '#8c5a3c', '#f0d0b0'];
const HAIRC = ['#241a12', '#40301e', '#6b4a2a', '#8c6b3e', '#4a4a4a', '#191919', '#7a2f1a', '#b5b5a5'];
function genFeatures(sexo) {
  return {
    skin: ri(0, SKINS.length - 1), hair: ri(0, HAIRC.length - 1),
    hairStyle: ri(0, 3), eyes: ri(0, 2), mouth: ri(0, 2),
    beard: sexo === 'm' ? ri(0, 2) : 0, glasses: chance(.22),
    brow: ri(0, 1), faceW: ri(0, 2), sexo,
  };
}
function mutateFeatures(f) { // para foto divergente
  const g = JSON.parse(JSON.stringify(f));
  g.hairStyle = (g.hairStyle + ri(1, 3)) % 4;
  g.hair = (g.hair + ri(1, 4)) % HAIRC.length;
  if (g.sexo === 'm') g.beard = (g.beard + ri(1, 2)) % 3;
  else g.glasses = !g.glasses;
  return g;
}
function portraitSVG(f, w) {
  const skin = SKINS[f.skin], hair = HAIRC[f.hair];
  const fw = 26 + f.faceW * 3;
  let s = '';
  // ombros
  s += `<path d="M15 120 Q15 92 50 90 Q85 92 85 120 Z" fill="#3a3c33"/>`;
  // pescoço
  s += `<rect x="43" y="72" width="14" height="22" fill="${skin}"/>`;
  // cabeça
  s += `<ellipse cx="50" cy="52" rx="${fw}" ry="30" fill="${skin}"/>`;
  // cabelo
  const hs = f.hairStyle;
  if (hs === 0) s += `<path d="M${50 - fw} 52 Q${50 - fw} 20 50 20 Q${50 + fw} 20 ${50 + fw} 52 L${50 + fw} 40 Q50 26 ${50 - fw} 40 Z" fill="${hair}"/>`;
  if (hs === 1) s += `<path d="M${50 - fw} 55 Q${50 - fw - 4} 14 50 16 Q${50 + fw + 4} 14 ${50 + fw} 55 Q${50 + fw - 6} 34 50 32 Q${50 - fw + 6} 34 ${50 - fw} 55 Z" fill="${hair}"/>`;
  if (hs === 2) s += `<ellipse cx="50" cy="32" rx="${fw - 4}" ry="12" fill="${hair}"/>`;
  if (hs === 3) s += `<path d="M${50 - fw} 50 Q50 8 ${50 + fw} 50 L${50 + fw} 62 Q${50 + fw - 8} 44 50 44 Q${50 - fw + 8} 44 ${50 - fw} 62 Z" fill="${hair}"/>`;
  // sobrancelhas
  const by = f.brow ? 43 : 45;
  s += `<rect x="${38 - f.faceW}" y="${by}" width="10" height="2.4" fill="${hair}"/><rect x="${52 + f.faceW}" y="${by}" width="10" height="2.4" fill="${hair}"/>`;
  // olhos
  const ey = 50, eo = ['#2b2820', '#3a5a4a', '#54432a'][f.eyes];
  s += `<circle cx="${42 - f.faceW}" cy="${ey}" r="2.6" fill="${eo}"/><circle cx="${58 + f.faceW}" cy="${ey}" r="2.6" fill="${eo}"/>`;
  // nariz
  s += `<path d="M50 52 L48 60 L52 60" stroke="${HAIRC[0]}" stroke-width="1" fill="none" opacity=".5"/>`;
  // boca
  const my = 68;
  if (f.mouth === 0) s += `<line x1="44" y1="${my}" x2="56" y2="${my}" stroke="#7a4a3a" stroke-width="2"/>`;
  if (f.mouth === 1) s += `<path d="M44 ${my} Q50 ${my + 3} 56 ${my}" stroke="#7a4a3a" stroke-width="2" fill="none"/>`;
  if (f.mouth === 2) s += `<path d="M44 ${my + 2} Q50 ${my - 2} 56 ${my + 2}" stroke="#7a4a3a" stroke-width="2" fill="none"/>`;
  // barba
  if (f.beard === 1) s += `<path d="M${50 - fw + 6} 60 Q50 86 ${50 + fw - 6} 60 L${50 + fw - 6} 66 Q50 92 ${50 - fw + 6} 66 Z" fill="${hair}" opacity=".85"/>`;
  if (f.beard === 2) s += `<rect x="42" y="62" width="16" height="3" fill="${hair}"/>`;
  // óculos
  if (f.glasses) s += `<circle cx="${42 - f.faceW}" cy="${ey}" r="6" stroke="#222" fill="none" stroke-width="1.4"/><circle cx="${58 + f.faceW}" cy="${ey}" r="6" stroke="#222" fill="none" stroke-width="1.4"/><line x1="${48 - f.faceW}" y1="${ey}" x2="${52 + f.faceW}" y2="${ey}" stroke="#222" stroke-width="1.4"/>`;
  return s;
}

/* ---------- CLOSE-UP DO EXAME FÍSICO ---------- */
function examSVG(f, phys) {
  const skin = SKINS[f.skin], hair = HAIRC[f.hair];
  const fw = Math.round((26 + f.faceW * 3) * 1.75);
  const ex1 = 100 - (16 + f.faceW * 2), ex2 = 100 + (16 + f.faceW * 2), ey = 92;
  let s = '';
  // ombros e pescoço
  s += `<path d="M30 240 Q30 190 100 184 Q170 190 170 240 Z" fill="#2c2e26"/>`;
  s += `<rect x="86" y="146" width="28" height="44" fill="${skin}"/>`;
  // pulso no pescoço (sempre desenhado; o achado é textual)
  s += `<line x1="92" y1="158" x2="94" y2="170" stroke="rgba(0,0,0,.12)" stroke-width="2"/>`;
  // cabeça
  s += `<ellipse cx="100" cy="100" rx="${fw}" ry="58" fill="${skin}"/>`;
  // textura de pele: humanos comuns têm marcas; pele "cerosa" é lisa demais
  if (!phys.pele) {
    s += `<circle cx="${ex1 - 14}" cy="118" r="1.6" fill="rgba(0,0,0,.14)"/>`;
    s += `<circle cx="${ex2 + 10}" cy="86" r="1.2" fill="rgba(0,0,0,.12)"/>`;
    s += `<path d="M${100 + fw - 16} 128 l7 5" stroke="rgba(0,0,0,.2)" stroke-width="1.4"/>`;
    s += `<path d="M${ex1 - 8} 70 q4 -2 8 0" stroke="rgba(0,0,0,.08)" stroke-width="1"/>`;
  } else {
    s += `<ellipse cx="100" cy="96" rx="${fw - 6}" ry="50" fill="rgba(255,255,255,.05)"/>`;
  }
  // cabelo
  const hs = f.hairStyle;
  if (hs === 0) s += `<path d="M${100 - fw} 100 Q${100 - fw} 38 100 38 Q${100 + fw} 38 ${100 + fw} 100 L${100 + fw} 76 Q100 50 ${100 - fw} 76 Z" fill="${hair}"/>`;
  if (hs === 1) s += `<path d="M${100 - fw} 106 Q${100 - fw - 8} 28 100 30 Q${100 + fw + 8} 28 ${100 + fw} 106 Q${100 + fw - 12} 66 100 62 Q${100 - fw + 12} 66 ${100 - fw} 106 Z" fill="${hair}"/>`;
  if (hs === 2) s += `<ellipse cx="100" cy="60" rx="${fw - 8}" ry="22" fill="${hair}"/>`;
  if (hs === 3) s += `<path d="M${100 - fw} 96 Q100 16 ${100 + fw} 96 L${100 + fw} 118 Q${100 + fw - 16} 84 100 84 Q${100 - fw + 16} 84 ${100 - fw} 118 Z" fill="${hair}"/>`;
  // sobrancelhas
  s += `<rect x="${ex1 - 11}" y="${ey - 14}" width="22" height="4" fill="${hair}"/><rect x="${ex2 - 11}" y="${ey - 14}" width="22" height="4" fill="${hair}"/>`;
  // olhos: esclera + íris + veias
  const iris = ['#2b2820', '#3a5a4a', '#54432a'][f.eyes];
  [ex1, ex2].forEach(x => {
    s += `<ellipse cx="${x}" cy="${ey}" rx="13" ry="8" fill="#e9e5d6"/>`;
    if (phys.olhos) {
      s += `<path d="M${x - 11} ${ey - 3} q5 2 8 2" stroke="#a2412f" stroke-width=".9" fill="none"/>`;
      s += `<path d="M${x + 10} ${ey + 3} q-5 1 -8 0" stroke="#a2412f" stroke-width=".9" fill="none"/>`;
      s += `<path d="M${x - 9} ${ey + 4} q4 0 6 -1" stroke="#8c2f24" stroke-width=".7" fill="none"/>`;
    }
    s += `<circle cx="${x}" cy="${ey}" r="4.6" fill="${iris}"/><circle cx="${x}" cy="${ey}" r="2" fill="#0c0a07"/>`;
    s += `<circle cx="${x + 1.4}" cy="${ey - 1.6}" r=".8" fill="#fff" opacity=".8"/>`;
    // pálpebra: humanos piscam. quem não pisca, não pisca.
    if (!phys.piscar) {
      s += `<rect x="${x - 13}" y="${ey - 8}" width="26" height="16" fill="${skin}" opacity="0">` +
           `<animate attributeName="opacity" values="0;0;1;0" keyTimes="0;0.94;0.965;1" dur="${(3.4 + (x % 3) * .7).toFixed(1)}s" repeatCount="indefinite"/></rect>`;
    }
  });
  // óculos
  if (f.glasses) s += `<circle cx="${ex1}" cy="${ey}" r="15" stroke="#1d1d1d" fill="none" stroke-width="2"/><circle cx="${ex2}" cy="${ey}" r="15" stroke="#1d1d1d" fill="none" stroke-width="2"/><line x1="${ex1 + 15}" y1="${ey}" x2="${ex2 - 15}" y2="${ey}" stroke="#1d1d1d" stroke-width="2"/>`;
  // nariz
  s += `<path d="M100 100 L96 120 L104 120" stroke="rgba(0,0,0,.4)" stroke-width="1.6" fill="none"/>`;
  // boca entreaberta com dentes
  const my = 136;
  s += `<path d="M84 ${my} Q100 ${my + 8} 116 ${my} Q100 ${my + 16} 84 ${my} Z" fill="#4a2b24"/>`;
  for (let i = 0; i < 6; i++) {
    const tx = 87 + i * 4.6;
    if (phys.dentes) s += `<rect x="${tx}" y="${my + 1}" width="3.8" height="5.5" rx=".6" fill="#f4f1e6"/>`;
    else {
      const h = 4 + ((i * 7) % 3);
      const cor = i === 4 ? '#8a734d' : '#ded8c2';
      s += `<rect x="${tx}" y="${my + 1}" width="3.8" height="${h}" rx=".6" fill="${cor}"/>`;
    }
  }
  // barba
  if (f.beard === 1) s += `<path d="M${100 - fw + 12} 118 Q100 172 ${100 + fw - 12} 118 L${100 + fw - 12} 132 Q100 184 ${100 - fw + 12} 132 Z" fill="${hair}" opacity=".85"/>`;
  if (f.beard === 2) s += `<rect x="86" y="126" width="28" height="5" fill="${hair}"/>`;
  return s;
}

/* ---------- EXAME FÍSICO: UI ---------- */
const EXAM_ZONES = [
  { id: 'olhos', label: 'OLHOS', tells: ['olhos', 'piscar'] },
  { id: 'boca', label: 'BOCA', tells: ['dentes'] },
  { id: 'pele', label: 'PELE', tells: ['pele'] },
  { id: 'maos', label: 'MÃOS', tells: ['maos'] },
  { id: 'pescoco', label: 'PESCOÇO', tells: ['pescoco'] },
];
function openExam() {
  const cz = shift.citizen;
  if (!cz || !shift.running) return;
  if (!cz.examDone) { spendTime(10); cz.examDone = true; }
  $('exam-face-svg').innerHTML = examSVG(cz.features, cz.phys);
  $('exam-log').innerHTML = '<span class="obs">A pessoa se aproxima do vidro. Perto demais. Examine cada região.</span>';
  const zones = $('exam-zones'); zones.innerHTML = '';
  EXAM_ZONES.forEach(z => {
    const b = document.createElement('button');
    b.textContent = z.label;
    b.onclick = () => { b.classList.add('done'); b.disabled = true; examZone(cz, z); };
    zones.appendChild(b);
  });
  $('exam-overlay').classList.add('active');
}
function examZone(cz, zone) {
  const log = $('exam-log');
  const rum = rumorForDay(S.day);
  zone.tells.forEach(t => {
    const T = TELLS[t];
    const anômalo = cz.phys[t];
    let line = anômalo ? `<div class="anomalia">⚠ ${T.achado}</div>` : `<div class="obs">${T.normal}</div>`;
    if (anômalo && rum && rum.tell === t) {
      if (rum.official) {
        cz.softEndorsed = true; cz.evidence = true;
        $('btn-detain').disabled = false;
        line += `<div class="anomalia endossada">→ INDICADOR OFICIAL EM VIGOR (comunicado de hoje). Detenção autorizada — a máquina do Estado confia em você.</div>`;
        sfx('ding');
      } else {
        line += `<div class="obs">→ coincide com o boato de hoje. Sem valor legal. (Ainda.)</div>`;
      }
    }
    log.innerHTML += line;
  });
  log.scrollTop = log.scrollHeight;
}

/* ---------- GERAÇÃO DE CIDADÃOS ---------- */
const DISC_TYPES = ['expired', 'nameMismatch', 'numberMismatch', 'wrongSeal', 'invalidCity', 'photoMismatch', 'sexMismatch', 'contradiction', 'luggage'];

function fullName(pais, sexo) {
  const c = COUNTRIES[pais];
  return `${pick(sexo === 'm' ? c.m : c.f)} ${pick(c.last)}`;
}

function alternadoDiscWeights() {
  // IA adaptativa: Alternados evitam o que o jogador mais detecta.
  const w = {};
  let avg = 0, n = 0;
  DISC_TYPES.forEach(t => { const d = S.ai.det[t] || 0; w[t] = 1 / (1 + d * d); avg += d; n++; });
  return { w, avgDet: avg / n };
}
function weightedPick(weights) {
  let tot = 0; for (const k in weights) tot += weights[k];
  let r = rnd() * tot;
  for (const k in weights) { r -= weights[k]; if (r <= 0) return k; }
  return Object.keys(weights)[0];
}

function makeCitizen(day, opts) {
  opts = opts || {};
  const pais = opts.pais || (chance(.3) ? 'osteria' : pick(COUNTRY_IDS));
  const c = COUNTRIES[pais];
  const sexo = opts.sexo || (chance(.5) ? 'm' : 'f');
  const nome = opts.nome || fullName(pais, sexo);
  const etnia = opts.etnia || pick(c.ethnics);
  const motivoObj = opts.motivo ? PURPOSES.find(p => p.id === opts.motivo) : pick(PURPOSES);
  const profissao = opts.profissao || pick(PROFESSIONS);
  const cidade = pick(c.cities);
  const features = genFeatures(sexo);
  const nasc = randomDateAround(day, -20000, -6600);

  const cz = {
    nome, sexo, pais, etnia, profissao, cidade,
    motivo: motivoObj.id, motivoLabel: motivoObj.label, duracao: pick(motivoObj.dur),
    destino: pick(COUNTRIES.osteria.cities),
    features, photoFeatures: features, nasc,
    isAlternado: false, isForger: false, isWanted: false, refugee: false,
    discrepancies: [], docs: {}, bribe: 0, encounter: opts.encounter || null,
    nervous: chance(.3), scannerAmbiguo: !!opts.scannerAmbiguo,
    bioResult: null, evidence: false,
  };

  // arquétipo (encontros scriptados nunca sorteiam arquétipo)
  if (opts.forceValid || opts.encounter) { if (opts.forcedDisc) cz.isForger = true; }
  else if (opts.forcedDisc) { cz.isForger = true; }
  else {
    const pAlt = Math.min(.10 + day * .004, .3);
    if (chance(pAlt)) cz.isAlternado = true;
    else if (chance(.22)) cz.isForger = true;
  }
  if (day >= 20 && day <= 26 && pais === 'taranstan' && chance(.5)) cz.refugee = true;

  buildDocs(cz, day);

  // discrepâncias
  if (opts.forcedDisc) applyDisc(cz, opts.forcedDisc, day);
  else if (cz.isAlternado) {
    const { w, avgDet } = alternadoDiscWeights();
    let pPerfect = Math.min(.15 + day * .012 + avgDet * .02, .8);
    if (day >= 46) pPerfect = .95;
    if (!chance(pPerfect)) applyDisc(cz, weightedPick(w), day);
  } else if (cz.isForger) {
    applyDisc(cz, pick(DISC_TYPES), day);
  }
  if (opts.forcedMissing) delete cz.docs[opts.forcedMissing];

  // suborno
  if (opts.briberia) cz.bribe = opts.briberia;
  else if ((cz.isForger || cz.isAlternado) && chance(.25)) cz.bribe = ri(8, 20);

  // corpo: sinais físicos (alguns reais, alguns lenda — nunca dizemos quais)
  genPhysical(cz);
  if (opts.scannerAmbiguo) cz.phys.piscar = true; // ela não piscou. ou você não viu.

  // bagagem
  buildBaggage(cz);

  return cz;
}

function buildBaggage(cz) {
  cz.bag = [];
  cz.bagDone = false;
  const push = (txt, extra) => cz.bag.push(Object.assign({ txt, fid: 'bag.' + cz.bag.length }, extra));
  push(pick(BAG_POOLS.comum));
  if (chance(.6)) push(pick(BAG_POOLS.comum));
  const pool = BAG_POOLS[cz.motivo];
  if (pool && chance(.8)) push(pick(pool));
  if (chance(.18)) push(pick(BAG_HERRINGS)); // pistas falsas: tristeza não é crime
  if (cz.bagOneway) push(BAG_ONEWAY.txt, { fid: 'bag.oneway', desc: BAG_ONEWAY.desc });
  if ((cz.isForger || cz.isAlternado) && chance(.12) && !cz.encounter) {
    push(pick(BAG_CONTRABAND), { contra: true, desc: 'Isto não deveria estar aqui. Isto não tem explicação boa.' });
  }
  // embaralha
  for (let i = cz.bag.length - 1; i > 0; i--) { const j = ri(0, i); [cz.bag[i], cz.bag[j]] = [cz.bag[j], cz.bag[i]]; }
}

/* ---------- BAGAGEM: UI ---------- */
function openBag() {
  const cz = shift.citizen;
  if (!cz || !shift.running) return;
  if (!cz.bagDone) { spendTime(10); cz.bagDone = true; }
  const box = $('bag-items'); box.innerHTML = '';
  cz.bag.forEach(item => {
    const el = document.createElement('div');
    el.className = 'bag-item' + (item.contra ? ' contra' : '');
    el.dataset.fid = item.fid;
    el.innerHTML = item.txt + (item.desc ? `<span class="bag-desc">${item.desc}</span>` : '');
    el.onclick = () => {
      if (item.contra && !item.found) {
        item.found = true;
        el.classList.add('found');
        cz.evidence = true;
        $('btn-detain').disabled = false;
        cz.discrepancies.push({ type: 'contraband', fids: [item.fid], desc: 'Contrabando na bagagem', confirmedNow: true });
        shift.confirmed.push(cz.discrepancies[cz.discrepancies.length - 1]);
        $('inspect-bar').textContent = '⚠ CONTRABANDO ENCONTRADO. Detenção autorizada.';
        sfx('ding');
        return;
      }
      if (shift.inspecting) pickTarget(item.fid, el);
    };
    box.appendChild(el);
  });
  $('bag-overlay').classList.add('active');
}

function genPhysical(cz) {
  cz.phys = {};
  TELL_IDS.forEach(t => {
    const T = TELLS[t];
    let p = T.humanBase + ((cz.nervous || chance(.2)) ? T.confound : 0);
    if (cz.isAlternado) p += T.altBonus;
    cz.phys[t] = chance(Math.min(p, .95));
  });
  cz.examDone = false;
  cz.softEndorsed = false;
}

function buildDocs(cz, day) {
  const c = COUNTRIES[cz.pais];
  const dt = worldDate(day);
  const passVal = randomDateAround(day, 60, 900);
  cz.docs.pass = {
    tipo: 'PASSAPORTE', id: 'pass', color: c.color,
    nome: cz.nome, nasc: cz.nasc, sexo: cz.sexo, paisNome: c.name,
    cidade: cz.cidade, numero: `${c.prefix}-${ri(10000, 99999)}`,
    validade: passVal, selo: c.seal, seloPais: cz.pais,
    reval: (day >= 30 && day <= 42) ? (chance(.8) ? '★' : '—') : null,
  };
  if (cz.pais === 'osteria' && day >= 2) {
    cz.docs.ident = { tipo: 'CARTÃO DE IDENTIDADE', id: 'ident', color: '#2b3a2b', nome: cz.nome, nasc: cz.nasc, distrito: cz.cidade, numero: cz.docs.pass.numero };
  }
  if (cz.pais !== 'osteria' && day >= 3) {
    cz.docs.perm = { tipo: 'PERMISSÃO DE ENTRADA', id: 'perm', color: '#3a3326', nome: cz.nome, numero: cz.docs.pass.numero, validade: randomDateAround(day, 10, 200), selo: '✦', motivo: cz.motivoLabel };
  }
  if (cz.motivo === 'trabalho' && day >= 4) {
    cz.docs.work = { tipo: 'PERMISSÃO DE TRABALHO', id: 'work', color: '#33261f', nome: cz.nome, profissao: cz.profissao, validade: randomDateAround(day, 30, 400) };
  }
  const rules = rulesForDay(day);
  const needsHealth = rules.includes('healthAll') || (rules.includes('healthForeign') && cz.pais !== 'osteria');
  if (needsHealth && chance(.88)) {
    cz.docs.sanitaria = { tipo: 'CARTEIRA SANITÁRIA', id: 'sanitaria', color: '#26332b', nome: cz.nome, validade: randomDateAround(day, 20, 300), vacinas: 'B-7, K-12, TRIV' };
  }
  if (rules.includes('ancestry') && (cz.etnia === 'nulio' || cz.etnia === 'bahari') && chance(.7)) {
    cz.docs.ancest = { tipo: 'CERT. DE ANCESTRALIDADE', id: 'ancest', color: '#3a1f1a', nome: cz.nome, linhagem: ETHNIC_LABEL[cz.etnia], carimbo: '❖' };
  }
  if (cz.refugee) {
    cz.docs.refugio = { tipo: 'CARTÃO DE REFÚGIO', id: 'refugio', color: '#1f2e3a', nome: cz.nome, origem: COUNTRIES[cz.pais].name, convencao: 'ALCORTE-9' };
  }
}

function applyDisc(cz, type, day) {
  const d = cz.docs;
  const add = (t, fids, desc) => cz.discrepancies.push({ type: t, fids, desc });
  switch (type) {
    case 'expired': {
      const doc = d.perm && chance(.5) ? d.perm : d.pass;
      doc.validade = randomDateAround(day, -40, -1);
      add('expired', [doc.id + '.validade', 'clock'], `${doc.tipo} expirado`);
      break;
    }
    case 'nameMismatch': {
      const alvo = d.ident || d.perm || d.work || d.sanitaria;
      if (!alvo) { applyDisc(cz, 'expired', day); return; }
      const c = COUNTRIES[cz.pais];
      let novo = cz.nome.split(' ')[0] + ' ' + pick(c.last);
      if (novo === cz.nome) novo = cz.nome.split(' ')[0] + ' ' + c.last[(c.last.indexOf(cz.nome.split(' ')[1]) + 1) % c.last.length];
      alvo.nome = novo;
      add('nameMismatch', ['pass.nome', alvo.id + '.nome'], 'Nomes divergentes entre documentos');
      break;
    }
    case 'numberMismatch': {
      const alvo = d.perm || d.ident;
      if (!alvo) { applyDisc(cz, 'expired', day); return; }
      alvo.numero = `${COUNTRIES[cz.pais].prefix}-${ri(10000, 99999)}`;
      add('numberMismatch', ['pass.numero', alvo.id + '.numero'], 'Números de registro divergentes');
      break;
    }
    case 'wrongSeal': {
      const outro = pick(COUNTRY_IDS.filter(k => k !== cz.pais));
      if (d.perm && chance(.5)) { d.perm.selo = COUNTRIES[outro].seal; add('wrongSeal', ['perm.selo', 'rb:osteria'], 'Selo incorreto na permissão'); }
      else { d.pass.selo = COUNTRIES[outro].seal; add('wrongSeal', ['pass.selo', 'rb:' + cz.pais], 'Selo nacional incorreto'); }
      break;
    }
    case 'invalidCity': {
      const outro = pick(COUNTRY_IDS.filter(k => k !== cz.pais));
      d.pass.cidade = pick(COUNTRIES[outro].cities);
      add('invalidCity', ['pass.cidade', 'rb:' + cz.pais], 'Cidade emissora inexistente no país');
      break;
    }
    case 'photoMismatch': {
      cz.photoFeatures = mutateFeatures(cz.features);
      add('photoMismatch', ['pass.foto', 'npc.face'], 'Foto não confere com o portador');
      break;
    }
    case 'sexMismatch': {
      d.pass.sexo = cz.sexo === 'm' ? 'f' : 'm';
      add('sexMismatch', ['pass.sexo', 'npc.face'], 'Sexo registrado não confere');
      break;
    }
    case 'luggage': {
      // a mala desmente a boca — mas só se alguém abrir a mala
      if (!d.perm) { applyDisc(cz, 'expired', day); return; }
      cz.bagOneway = true;
      add('luggage', ['bag.oneway', 'perm.motivo'], 'Bagagem incompatível com o motivo declarado');
      cz.discrepancies[cz.discrepancies.length - 1].latent = true;
      break;
    }
    case 'contradiction': {
      cz.lie = pick(['motivo', 'cidade', 'profissao']);
      const fid = cz.lie === 'motivo' ? (d.perm ? 'perm.motivo' : 'pass.nome') : cz.lie === 'cidade' ? 'pass.cidade' : (d.work ? 'work.profissao' : 'pass.nome');
      add('contradiction', ['talk.' + cz.lie, fid], 'Declaração contradiz os documentos');
      break;
    }
  }
}

/* ---------- VIOLAÇÕES DE REGRA (além das discrepâncias) ---------- */
function computeViolations(cz, day) {
  const rules = rulesForDay(day);
  const v = [];
  if (day >= 47) return v;
  const bans = { banKrestov: 'krestov', banLantravia: 'lantravia', banTaranstan: 'taranstan' };
  for (const r in bans) {
    if (rules.includes(r) && cz.pais === bans[r]) {
      if (cz.refugee && cz.docs.refugio && rules.includes('refugeeProtect')) continue; // contradição legal resolvida pró-refúgio
      v.push({ rule: r, desc: `Entrada proibida: cidadão de ${COUNTRIES[cz.pais].name}` });
    }
  }
  if (!cz.docs.pass) v.push({ rule: 'pass', desc: 'Sem passaporte' });
  if (rules.includes('idOsteria') && cz.pais === 'osteria' && !cz.docs.ident) v.push({ rule: 'idOsteria', desc: 'Cidadão sem cartão de identidade' });
  if (rules.includes('entryPermit') && cz.pais !== 'osteria' && !cz.docs.perm) v.push({ rule: 'entryPermit', desc: 'Estrangeiro sem permissão de entrada' });
  if (rules.includes('workPermit') && cz.motivo === 'trabalho' && !cz.docs.work) v.push({ rule: 'workPermit', desc: 'Sem permissão de trabalho' });
  const needsHealth = rules.includes('healthAll') || (rules.includes('healthForeign') && cz.pais !== 'osteria');
  if (needsHealth && !cz.docs.sanitaria) v.push({ rule: 'health', desc: 'Sem carteira sanitária' });
  if (rules.includes('ancestry') && (cz.etnia === 'nulio' || cz.etnia === 'bahari') && !cz.docs.ancest) v.push({ rule: 'ancestry', desc: 'Sem certificado de ancestralidade (Édito nº 2)' });
  if (rules.includes('seloConselho') && cz.docs.pass && cz.docs.pass.reval === '—') v.push({ rule: 'seloConselho', desc: 'Documento sem selo de revalidação do Conselho' });
  return v;
}

/* ============================================================
   TURNO
   ============================================================ */
const shift = {
  clock: 480, running: false, citizen: null, processed: 0,
  citToday: 0, wantedName: null, queue: 0, tickId: null,
  picks: [], inspecting: false, confirmed: [], zTop: 10,
  encounterDone: false, whispered: false,
};

function startDay() {
  setRegimeClass(S.day);
  shift.clock = 480; shift.processed = 0; shift.citToday = 0;
  shift.citizen = null; shift.picks = []; shift.confirmed = [];
  shift.encounterDone = false; shift.whispered = false;
  shift.wantedName = null;

  if (WANTED_DAYS[S.day]) {
    const p = pick(COUNTRY_IDS);
    shift.wantedName = fullName(p, chance(.5) ? 'm' : 'f');
    shift.wantedPais = p;
    shift.wantedSlot = ri(3, 6);
  }

  $('shift-day').textContent = `DIA ${S.day} — ${REGIME_LABEL[regimeOfDay(S.day)]}`;
  renderRulebook();
  updateHud();
  clearDesk();
  $('npc-name').textContent = '—';
  $('speech').textContent = '';
  $('talk-log').innerHTML = '';
  $('ask-row').innerHTML = '';
  $('scan-result').textContent = '';
  $('npc-portrait').innerHTML = '';
  $('btn-scan-bio').style.display = S.day >= 10 ? '' : 'none';
  $('btn-reject').classList.toggle('hidden', S.day >= 47);
  $('btn-detain').classList.toggle('hidden', S.day >= 47);
  showScreen('screen-shift');
  showBulletin(() => {
    shift.running = true;
    clearInterval(shift.tickId);
    shift.tickId = setInterval(tickClock, 1000);
    startAmbience();
    startRadio();
    initQueueCanvas();
    nextCitizen();
  });
}

function bulletinText() {
  let t = SCRIPTED_BULLETIN[S.day] || `Posto Nº 7 — Dia ${S.day}.\n\nAplique o regulamento em vigor (painel à direita). Discrepâncias devem ser confirmadas via INSPEÇÃO antes de justificar detenção.`;
  if (shift.wantedName) t += `\n\n★ PROCURADO(A) HOJE: ${shift.wantedName} (${COUNTRIES[shift.wantedPais].name}). DETER à vista.`;
  if (S.day === 13) t += `\n\n§ REAJUSTE PATRIÓTICO: ${MOEDA} 6 por decisão correta. O Estado Nacional cuida dos seus.`;
  if (S.day === 31) t += `\n\n§ O CONSELHO VALORIZA O TRABALHADOR: ${MOEDA} 8 por decisão correta. (Nota: o aluguel do espaço requisitado passa a ${MOEDA} 25.)`;
  const rum = rumorForDay(S.day);
  if (rum) t += rum.official
    ? `\n\n§ INDICADOR FÍSICO EM VIGOR: ${rum.text}\nAnomalia correspondente registrada em EXAME FÍSICO autoriza detenção.`
    : `\n\n✎ (rabiscado a lápis na margem, por alguém do turno anterior)\n"${rum.text}"`;
  return t;
}
function showBulletin(fn) {
  modal(`COMUNICADO OFICIAL — DIA ${S.day}`, bulletinText(), [{ label: 'ASSINAR CIÊNCIA', fn }]);
}

function tickClock() {
  if (!shift.running) return;
  shift.clock += 2;
  if (shift.clock >= 1080) { shift.clock = 1080; endShift(); return; }
  updateHud();
}
function spendTime(min) { shift.clock = Math.min(1080, shift.clock + min); updateHud(); }
function updateHud() {
  const h = Math.floor(shift.clock / 60), m = shift.clock % 60;
  $('clock').textContent = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')} · ${fmtDate(worldDate(S.day))}`;
  $('processed-count').textContent = `Atendidos: ${shift.processed}`;
  $('money-hud').textContent = `${MOEDA} ${S.money}`;
}

/* ---------- RÁDIO DO POSTO ---------- */
let radioOn = true, radioTimer = null;
function radioTick() {
  if (!shift.running) return;
  const line = $('radio-line');
  line.classList.add('fade');
  setTimeout(() => {
    let txt;
    if (!radioOn) txt = '‹desligado›';
    else if (S.day >= 47) txt = '— silêncio. nem estática. silêncio. —';
    else txt = pick(RADIO[regimeOfDay(S.day)] || RADIO.republica);
    line.textContent = txt;
    line.classList.remove('fade');
  }, 800);
}
function startRadio() {
  clearInterval(radioTimer);
  radioTimer = setInterval(radioTick, 16000);
  setTimeout(radioTick, 2500);
}

/* ---------- AMBIÊNCIA (drone de válvulas, quase inaudível) ---------- */
let droneNodes = null;
function startAmbience() {
  try {
    AC = AC || new (window.AudioContext || window.webkitAudioContext)();
    if (AC.state === 'suspended') AC.resume();
    if (droneNodes) return;
    const g = AC.createGain(); g.gain.value = .012; g.connect(AC.destination);
    const o1 = AC.createOscillator(); o1.type = 'sine'; o1.frequency.value = 50;
    const o2 = AC.createOscillator(); o2.type = 'sine'; o2.frequency.value = 50.7;
    o1.connect(g); o2.connect(g); o1.start(); o2.start();
    droneNodes = { o1, o2, g };
  } catch (e) { /* sem áudio */ }
}
function stopAmbience() {
  if (!droneNodes) return;
  try { droneNodes.o1.stop(); droneNodes.o2.stop(); } catch (e) {}
  droneNodes = null;
}

/* ---------- FILA VIVA (canvas) ---------- */
const Q = { figs: [], snow: [], raf: null, t: 0, walker: null };
const COAT_COLORS = ['#2e2a24', '#33302a', '#3a3128', '#2a2e33', '#38332e', '#403428', '#2c3230'];
function makeFig(x) {
  return {
    x, tx: x, phase: rnd() * 6.28, h: 30 + ri(0, 8),
    coat: pick(COAT_COLORS), hat: chance(.5), skin: pick(SKINS),
    fidget: rnd(), speed: .35 + rnd() * .25,
  };
}
function queueSpots(w) { const s = []; for (let i = 0; i < 9; i++) s.push(w * .58 - i * 26); return s; }
function initQueueCanvas() {
  const cv = $('queue-canvas');
  const win = cv.parentElement;
  cv.width = win.clientWidth; cv.height = win.clientHeight;
  const spots = queueSpots(cv.width);
  Q.figs = spots.map(x => makeFig(x - ri(0, 6)));
  Q.snow = [];
  for (let i = 0; i < 26; i++) Q.snow.push({ x: rnd() * cv.width, y: rnd() * cv.height, v: .3 + rnd() * .6, w: rnd() * .5 - .25 });
  Q.walker = null;
  cancelAnimationFrame(Q.raf);
  const ctx = cv.getContext('2d');
  const loop = () => {
    Q.t += .016;
    drawQueue(ctx, cv.width, cv.height);
    Q.raf = requestAnimationFrame(loop);
  };
  Q.raf = requestAnimationFrame(loop);
}
function drawFig(ctx, f, groundY) {
  const bob = Math.sin(Q.t * 2 + f.phase) * 1.1;
  const sway = Math.sin(Q.t * .7 + f.phase * 2) * (f.fidget > .7 ? 1.6 : .5);
  const x = f.x + sway, top = groundY - f.h + bob;
  ctx.fillStyle = f.coat;
  ctx.beginPath(); // corpo (casaco)
  ctx.moveTo(x - 6, groundY); ctx.lineTo(x - 5, top + 10); ctx.quadraticCurveTo(x, top + 6, x + 5, top + 10); ctx.lineTo(x + 6, groundY); ctx.closePath(); ctx.fill();
  ctx.fillStyle = f.skin; // cabeça
  ctx.beginPath(); ctx.arc(x, top + 4, 4.2, 0, 6.29); ctx.fill();
  if (f.hat) { ctx.fillStyle = '#1d1a16'; ctx.fillRect(x - 5, top - 2, 10, 3); ctx.fillRect(x - 3.4, top - 6, 6.8, 5); }
  // fôlego no frio
  if (Math.sin(Q.t * .9 + f.phase * 3) > .93) {
    ctx.fillStyle = 'rgba(220,220,210,.12)';
    ctx.beginPath(); ctx.arc(x + 6, top + 3, 2.5, 0, 6.29); ctx.fill();
  }
}
function drawQueue(ctx, w, h) {
  const groundY = h - 14;
  ctx.clearRect(0, 0, w, h);
  // céu / muro
  ctx.fillStyle = '#0b0d0a'; ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#14161178'; ctx.fillRect(0, h * .35, w, h);
  // arame no alto do muro
  ctx.strokeStyle = '#1e201a'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, h * .35); ctx.lineTo(w, h * .35); ctx.stroke();
  for (let x = 6; x < w; x += 12) { ctx.beginPath(); ctx.moveTo(x, h * .35 - 3); ctx.lineTo(x + 4, h * .35 + 3); ctx.stroke(); }
  // poste com cone de luz sobre a frente da fila
  const lampX = w * .68;
  ctx.strokeStyle = '#23251d'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(lampX, groundY); ctx.lineTo(lampX, 8); ctx.lineTo(lampX - 14, 8); ctx.stroke();
  const flick = .05 + Math.max(0, Math.sin(Q.t * 13) * .012) + (chance(.005) ? -.03 : 0);
  const grad = ctx.createRadialGradient(lampX - 14, 12, 4, lampX - 14, 12, h * .95);
  grad.addColorStop(0, `rgba(201,180,120,${.16 + flick})`); grad.addColorStop(1, 'rgba(201,180,120,0)');
  ctx.fillStyle = grad;
  ctx.beginPath(); ctx.moveTo(lampX - 14, 10); ctx.lineTo(lampX - 58, groundY); ctx.lineTo(lampX + 34, groundY); ctx.closePath(); ctx.fill();
  // chão
  ctx.fillStyle = '#181a14'; ctx.fillRect(0, groundY, w, 14);
  // figuras
  Q.figs.forEach(f => { f.x += (f.tx - f.x) * .04; drawFig(ctx, f, groundY); });
  if (Q.walker) {
    Q.walker.x += Q.walker.spd;
    drawFig(ctx, Q.walker, groundY);
    if (Q.walker.x > w + 12) Q.walker = null;
  }
  // neve
  ctx.fillStyle = 'rgba(220,220,215,.5)';
  Q.snow.forEach(s => {
    s.y += s.v; s.x += s.w + Math.sin(Q.t + s.y * .02) * .15;
    if (s.y > h) { s.y = -2; s.x = rnd() * w; }
    ctx.fillRect(s.x, s.y, 1.4, 1.4);
  });
}
function queueAdvance() {
  // o primeiro da fila caminha até o guichê; os outros avançam; chega gente atrás
  const cv = $('queue-canvas');
  if (!cv.width) return;
  const spots = queueSpots(cv.width);
  const front = Q.figs.shift();
  if (front) { front.spd = 1.1 + rnd() * .4; Q.walker = front; }
  Q.figs.forEach((f, i) => { f.tx = spots[i] - ri(0, 6); });
  const last = Q.figs[Q.figs.length - 1];
  Q.figs.push(makeFig((last ? last.tx : spots[0]) - 26 - ri(0, 10)));
}
function renderQueueChatter() {
  const n = ri(1, 2);
  let html = `≈ ${ri(8, 60)} pessoas na fila<br>`;
  for (let i = 0; i < n; i++) html += pick(QUEUE_CHATTER) + '<br>';
  $('queue-view').innerHTML = html;
}

function nextCitizen() {
  if (!shift.running) return;
  if (shift.clock >= 1080) { endShift(); return; }
  renderQueueChatter();
  shift.picks = []; shift.confirmed = [];
  $('scan-result').textContent = '';
  $('talk-log').innerHTML = '';
  $('inspect-bar').textContent = shift.inspecting ? 'MODO INSPEÇÃO: selecione dois elementos para comparar.' : '';
  $('btn-detain').disabled = true;

  let cz = null;
  const enc = ENCOUNTERS[S.day];

  if (S.day === 48) { presentMirror(); return; }

  if (enc && !shift.encounterDone && shift.processed >= 1) {
    shift.encounterDone = true;
    cz = makeCitizen(S.day, {
      nome: enc.nome, pais: enc.pais, sexo: enc.sexo, etnia: enc.etnia,
      profissao: enc.profissao, motivo: enc.motivo,
      forceValid: enc.valid, forcedDisc: enc.forcedDisc, forcedMissing: enc.forcedMissing,
      briberia: enc.briberia, scannerAmbiguo: enc.scannerAmbiguo, encounter: enc,
    });
    if (enc.valid) { cz.isAlternado = false; cz.isForger = false; cz.discrepancies = []; }
  } else if (shift.wantedName && shift.processed === shift.wantedSlot) {
    cz = makeCitizen(S.day, { nome: shift.wantedName, pais: shift.wantedPais, forceValid: true });
    cz.isWanted = true;
    shift.wantedName = null;
  } else {
    cz = makeCitizen(S.day, {});
  }

  shift.citizen = cz;
  presentCitizen(cz);
  // a fila também vive
  if (!cz.encounter && shift.processed > 0 && chance(.12)) {
    const qe = pick(QUEUE_EVENTS);
    const toast = $('queue-toast');
    toast.textContent = qe.t + (qe.delay ? ` (a fila parou por ${qe.delay} min)` : '');
    toast.classList.add('on');
    if (qe.delay) spendTime(qe.delay);
    setTimeout(() => toast.classList.remove('on'), 5200);
  }
  // apagão no colapso
  if (S.day >= 43 && S.day <= 46 && chance(.25)) {
    document.body.classList.add('blackout');
    setTimeout(() => document.body.classList.remove('blackout'), 9000);
  }
  // sussurro
  if (S.day >= 18 && !shift.whispered && chance(.4)) { shift.whispered = true; setTimeout(whisper, ri(4000, 20000)); }
}

function greetingFor(cz) {
  if (cz.encounter) return cz.encounter.fala;
  const g = [
    'Bom dia. Está frio hoje, não?', 'Aqui estão meus papéis.', 'Espero que esteja tudo em ordem.',
    'É a minha terceira vez nesta fila.', 'Por favor, seja rápido. Meu trem sai ao meio-dia.',
    'Eu não tenho nada a esconder.', '…', 'Deus abençoe este posto.',
  ];
  const nervous = ['Desculpe… eu fico nervoso(a) com uniformes.', 'Minhas mãos estão tremendo de frio. Só de frio.', 'Eu decorei tudo o que ia dizer e esqueci agora.'];
  return cz.nervous ? pick(g.concat(nervous, nervous)) : pick(g);
}

function presentCitizen(cz) {
  const p = $('npc-portrait');
  p.innerHTML = portraitSVG(cz.features);
  p.setAttribute('class', 'pickable'); // svg: className é somente-leitura
  queueAdvance();
  // chega andando (sincronizado com o boneco da fila entrando no guichê)
  setTimeout(() => { p.classList.add('arrive'); }, 350);
  p.addEventListener('animationend', function h() { p.classList.remove('arrive'); p.removeEventListener('animationend', h); });
  $('npc-name').textContent = cz.encounter ? cz.nome + ' ✉' : cz.nome;
  $('speech').textContent = '“' + greetingFor(cz) + '”';
  buildAskButtons(cz);
  layDocs(cz);
  if (cz.bribe && !cz.encounter) setTimeout(() => layBribe(cz), 2500);
  if (cz.encounter && cz.encounter.briberia) layBribe(cz);
  // o tique. rápido demais para ter certeza de que aconteceu.
  if (chance(cz.isAlternado ? .18 : .05)) {
    setTimeout(() => {
      if (shift.citizen !== cz) return;
      const p = $('npc-portrait');
      p.classList.add('twitch');
      setTimeout(() => p.classList.remove('twitch'), 650);
    }, ri(3000, 16000));
  }
}

/* ---------- DOCUMENTOS NA MESA ---------- */
function clearDesk() {
  const desk = $('desk');
  desk.querySelectorAll('.document, .bribe-note').forEach(e => e.remove());
  $('desk-hint').style.display = '';
}

function fld(docId, key, label, value, clickable) {
  return `<div class="fld"><span class="k">${label}</span><span class="v" data-fid="${docId}.${key}">${value}</span></div>`;
}

function docHTML(doc, cz) {
  let b = '';
  const dateStr = (dt) => fmtDate(dt);
  if (doc.id === 'pass') {
    b += `<div class="doc-photo" data-fid="pass.foto"><svg viewBox="0 0 100 120">${portraitSVG(cz.photoFeatures)}</svg></div>`;
    b += fld('pass', 'nome', 'NOME', doc.nome);
    b += fld('pass', 'nasc', 'NASC.', dateStr(doc.nasc));
    b += fld('pass', 'sexo', 'SEXO', doc.sexo.toUpperCase());
    b += fld('pass', 'pais', 'PAÍS', doc.paisNome);
    b += fld('pass', 'cidade', 'EMISSÃO', doc.cidade);
    b += fld('pass', 'numero', 'Nº', doc.numero);
    b += fld('pass', 'validade', 'VALIDADE', dateStr(doc.validade));
    if (doc.reval !== null) b += fld('pass', 'reval', 'REVALIDAÇÃO', doc.reval);
    b += `<div class="doc-seal" data-fid="pass.selo">${doc.selo}</div>`;
  } else if (doc.id === 'ident') {
    b += fld('ident', 'nome', 'NOME', doc.nome);
    b += fld('ident', 'nasc', 'NASC.', dateStr(doc.nasc));
    b += fld('ident', 'distrito', 'DISTRITO', doc.distrito);
    b += fld('ident', 'numero', 'Nº', doc.numero);
  } else if (doc.id === 'perm') {
    b += fld('perm', 'nome', 'NOME', doc.nome);
    b += fld('perm', 'numero', 'Nº PASSAPORTE', doc.numero);
    b += fld('perm', 'motivo', 'MOTIVO', doc.motivo);
    b += fld('perm', 'validade', 'VALIDADE', dateStr(doc.validade));
    b += `<div class="doc-seal" data-fid="perm.selo">${doc.selo}</div>`;
  } else if (doc.id === 'work') {
    b += fld('work', 'nome', 'NOME', doc.nome);
    b += fld('work', 'profissao', 'FUNÇÃO', doc.profissao);
    b += fld('work', 'validade', 'VALIDADE', dateStr(doc.validade));
  } else if (doc.id === 'sanitaria') {
    b += fld('sanitaria', 'nome', 'NOME', doc.nome);
    b += fld('sanitaria', 'vacinas', 'VACINAS', doc.vacinas);
    b += fld('sanitaria', 'validade', 'VALIDADE', dateStr(doc.validade));
  } else if (doc.id === 'ancest') {
    b += fld('ancest', 'nome', 'NOME', doc.nome);
    b += fld('ancest', 'linhagem', 'LINHAGEM', doc.linhagem);
    b += `<div class="doc-seal" data-fid="ancest.carimbo">${doc.carimbo}</div>`;
  } else if (doc.id === 'refugio') {
    b += fld('refugio', 'nome', 'NOME', doc.nome);
    b += fld('refugio', 'origem', 'ORIGEM', doc.origem);
    b += fld('refugio', 'convencao', 'CONVENÇÃO', doc.convencao);
  }
  return b;
}

function layDocs(cz) {
  clearDesk();
  $('desk-hint').style.display = 'none';
  const desk = $('desk');
  let i = 0;
  for (const k in cz.docs) {
    const doc = cz.docs[k];
    const el = document.createElement('div');
    el.className = 'document';
    el.dataset.doc = doc.id;
    el.innerHTML = `<div class="doc-head" style="background:${doc.color}"><span>${doc.tipo}</span><span>${COUNTRIES[cz.pais].prefix}</span></div><div class="doc-body">${docHTML(doc, cz)}</div>`;
    el.style.left = (20 + (i % 3) * 200 + ri(-8, 8)) + 'px';
    el.style.top = (20 + Math.floor(i / 3) * 150 + ri(-6, 6)) + 'px';
    el.style.zIndex = ++shift.zTop;
    el.style.animationDelay = (i * 0.1) + 's'; // cartas dadas uma a uma
    makeDraggable(el);
    desk.appendChild(el);
    i++;
  }
}

function layBribe(cz) {
  if (!shift.citizen || shift.citizen !== cz) return;
  const desk = $('desk');
  if (desk.querySelector('.bribe-note')) return;
  const el = document.createElement('div');
  el.className = 'bribe-note';
  el.textContent = `“Um agrado. ${MOEDA} ${cz.bribe}. Ninguém precisa saber.”`;
  el.style.left = ri(40, 300) + 'px';
  el.style.bottom = '20px';
  el.style.zIndex = ++shift.zTop;
  el.onclick = () => {
    modal('UM ENVELOPE DISCRETO', `Há ${MOEDA} ${cz.bribe} dentro. A fila observa. Ou não.`, [
      { label: 'ACEITAR', fn: () => { S.money += cz.bribe; S.counters.bribes++; S.counters.bribeMoney += cz.bribe; el.remove(); updateHud(); if (chance(.15)) S.flags.auditRisk = (S.flags.auditRisk || 0) + 1; } },
      { label: 'DEVOLVER', fn: () => { el.remove(); } },
    ]);
  };
  desk.appendChild(el);
}

function makeDraggable(el) {
  let sx, sy, ox, oy, dragging = false;
  el.addEventListener('pointerdown', (e) => {
    if (e.target.classList.contains('v') || e.target.closest('.doc-photo') || e.target.classList.contains('doc-seal')) return;
    dragging = true; el.setPointerCapture(e.pointerId);
    sx = e.clientX; sy = e.clientY; ox = el.offsetLeft; oy = el.offsetTop;
    el.style.zIndex = ++shift.zTop;
  });
  el.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    el.style.left = (ox + e.clientX - sx) + 'px';
    el.style.top = (oy + e.clientY - sy) + 'px';
  });
  el.addEventListener('pointerup', () => dragging = false);
}

/* ---------- REGULAMENTO ---------- */
function renderRulebook() {
  const rules = rulesForDay(S.day);
  let html = '';
  rules.forEach(r => { html += `<div class="rb-rule" data-fid="rb:rule:${r}">§ ${RULES[r].text}</div>`; });
  if (shift.wantedName) html += `<div class="rb-rule" data-fid="rb:wanted">★ PROCURADO(A): ${shift.wantedName}</div>`;
  $('rb-rules').innerHTML = html;
  let ch = '';
  COUNTRY_IDS.forEach(k => {
    const c = COUNTRIES[k];
    ch += `<div class="rb-country" data-fid="rb:${k}"><b>${c.seal} ${c.name}</b> (${c.prefix}) — ${c.cities.join(', ')}</div>`;
  });
  $('rb-countries').innerHTML = ch;
}

/* ---------- INTERROGATÓRIO ---------- */
function buildAskButtons(cz) {
  const row = $('ask-row'); row.innerHTML = '';
  const qs = [
    { k: 'motivo', label: 'Motivo?' },
    { k: 'cidade', label: 'Onde nasceu?' },
    { k: 'profissao', label: 'Profissão?' },
    { k: 'duracao', label: 'Quanto tempo?' },
  ];
  qs.forEach(q => {
    const b = document.createElement('button');
    b.textContent = q.label;
    b.onclick = () => ask(cz, q.k, b);
    row.appendChild(b);
  });
}
function answerFor(cz, k) {
  const truthy = {
    motivo: cz.motivoLabel, cidade: cz.cidade, profissao: cz.profissao, duracao: cz.duracao,
  };
  // mentira gera contradição com documento
  if (cz.lie === k) {
    if (k === 'motivo') return pick(PURPOSES.filter(p => p.id !== cz.motivo)).label;
    if (k === 'cidade') return pick(COUNTRIES[cz.pais].cities.filter(c => c !== cz.cidade).concat(pick(COUNTRIES[pick(COUNTRY_IDS)].cities)));
    if (k === 'profissao') return pick(PROFESSIONS.filter(p => p !== cz.profissao));
  }
  // nervoso: hesita mas acerta (pista falsa)
  if (cz.nervous && chance(.4)) return '…' + truthy[k] + '. Desculpe, é isso. ' + pick(['Eu juro.', 'Tenho certeza.', 'Acho.']);
  return truthy[k];
}
function ask(cz, k, btn) {
  if (!shift.citizen) return;
  spendTime(5);
  btn.disabled = true;
  const ans = answerFor(cz, k);
  const log = $('talk-log');
  const LBL = { motivo: 'Motivo da viagem?', cidade: 'Onde nasceu?', profissao: 'Profissão?', duracao: 'Duração da estadia?' };
  log.innerHTML += `<span class="q">— ${LBL[k]}</span><span class="a" data-fid="talk.${k}">“${ans}”</span>`;
  log.scrollTop = log.scrollHeight;
}

/* ---------- SCANNERS ---------- */
function scan(kind) {
  const cz = shift.citizen;
  if (!cz) return;
  sfx('scan');
  let out = '';
  if (kind === 'thermo') {
    spendTime(15);
    const anom = cz.isAlternado ? chance(.35) : chance(cz.nervous ? .2 : .08);
    out = anom ? '🌡 TÉRMICO: assimetria térmica detectada. (Nota: febre, frio e má calibração produzem o mesmo resultado.)' : '🌡 TÉRMICO: padrão dentro da faixa humana comum.';
  } else if (kind === 'pulse') {
    spendTime(15);
    const calm = cz.isAlternado ? chance(.7) : chance(cz.nervous ? .1 : .5);
    out = calm ? '📈 PULSAÇÃO: ritmo extremamente estável. (Pessoas calmas também existem.)' : '📈 PULSAÇÃO: estresse elevado. (Compatível com medo, trauma, luto, filas.)';
  } else if (kind === 'bio') {
    spendTime(30);
    if (S.day >= 43 && !S.bioCalibrated) { $('scan-result').textContent = '🧬 BIOLÓGICO: SEM ENERGIA / FORA DE SERVIÇO.'; return; }
    if (cz.scannerAmbiguo) { $('scan-result').textContent = '🧬 BIOLÓGICO: INCONCLUSIVO. Repetição do exame: INCONCLUSIVO.'; return; }
    const decal = S.day >= 31 && !S.bioCalibrated;
    const tp = decal ? .5 : .8, fp = decal ? .3 : .1;
    const positive = cz.isAlternado ? chance(tp) : chance(fp);
    cz.bioResult = positive;
    if (positive) {
      cz.evidence = true;
      $('btn-detain').disabled = false;
      out = '🧬 BIOLÓGICO: ⚠ MARCADOR K-7 POSITIVO. Resultado habilita DETENÇÃO. (O fabricante nega falsos positivos. O fabricante vende scanners.)';
    } else out = '🧬 BIOLÓGICO: negativo para marcador K-7.' + (decal ? ' (Unidade sem calibração há 12 dias.)' : '');
  }
  $('scan-result').textContent = out;
}

/* ---------- INSPEÇÃO COMPARATIVA ---------- */
function toggleInspect() {
  shift.inspecting = !shift.inspecting;
  $('btn-inspect').classList.toggle('active', shift.inspecting);
  $('inspect-bar').textContent = shift.inspecting ? 'MODO INSPEÇÃO: clique em DOIS elementos para compará-los (campos, foto, rosto, relógio, regulamento).' : '';
  clearPicks();
}
function clearPicks() {
  shift.picks = [];
  document.querySelectorAll('.picked').forEach(e => e.classList.remove('picked'));
}
function pickTarget(fid, el) {
  if (!shift.inspecting || !shift.citizen) return;
  if (shift.picks.find(p => p.fid === fid)) return;
  el.classList.add('picked');
  shift.picks.push({ fid, el });
  if (shift.picks.length === 2) {
    const [a, b] = shift.picks;
    setTimeout(() => evaluatePair(a, b), 150);
  }
}
function evaluatePair(a, b) {
  const cz = shift.citizen;
  const set = [a.fid, b.fid];
  let found = null;
  // procurado: nome × lista
  if (cz.isWanted && set.includes('pass.nome') && set.includes('rb:wanted')) {
    cz.evidence = true;
    $('btn-detain').disabled = false;
    $('inspect-bar').textContent = '★ IDENTIDADE CONFERE COM PROCURADO. Detenção autorizada.';
    sfx('ding'); clearPicks(); return;
  }
  for (const d of cz.discrepancies) {
    if (d.fids.every(f => set.includes(f))) { found = d; break; }
  }
  if (found && !shift.confirmed.includes(found)) {
    shift.confirmed.push(found);
    cz.evidence = true;
    S.ai.det[found.type] = (S.ai.det[found.type] || 0) + 1; // a espécie observa você
    $('btn-detain').disabled = false;
    $('inspect-bar').textContent = `⚠ DISCREPÂNCIA CONFIRMADA: ${found.desc}.`;
    a.el.classList.add('flagged'); b.el.classList.add('flagged');
    sfx('ding');
  } else {
    $('inspect-bar').textContent = 'Nenhuma discrepância entre estes dois elementos.';
  }
  clearPicks();
}

/* ---------- DECISÃO ---------- */
function decide(decision) {
  const cz = shift.citizen;
  if (!cz || !shift.running) return;
  sfx('stamp');
  shift.citizen = null;
  const p = $('npc-portrait');
  p.classList.remove('pickable');
  // sai andando: aprovado entra no país (direita); rejeitado volta (esquerda); detido, escoltado
  setTimeout(() => { p.classList.add(decision === 'approve' ? 'leave-ok' : decision === 'reject' ? 'leave-no' : 'leave-det'); }, 350);

  // discrepâncias latentes (bagagem) só contam se foram descobertas
  const viols = cz.discrepancies.filter(d => !d.latent || shift.confirmed.includes(d)).concat(computeViolations(cz, S.day));
  const dayFree = S.day >= 47;
  let correct, note = '';

  if (dayFree) correct = true;
  else if (cz.isWanted) {
    correct = decision === 'detain';
    if (!correct) note = decision === 'approve' ? 'Procurado(a) foi APROVADO(A).' : 'Procurado(a) deveria ser DETIDO(A), não rejeitado(a).';
  } else if (viols.length > 0) {
    if (decision === 'reject') correct = true;
    else if (decision === 'detain') { correct = cz.evidence; if (!correct) note = 'Detenção sem evidência confirmada.'; }
    else { correct = false; note = 'Aprovado(a) com irregularidade: ' + viols[0].desc + '.'; }
  } else {
    if (decision === 'approve') correct = true;
    else if (decision === 'detain' && (cz.bioResult === true || cz.softEndorsed)) { correct = true; } // o sistema premia a máquina e a pseudociência — mesmo erradas
    else { correct = false; note = decision === 'reject' ? 'Documentos em perfeita ordem. Rejeição indevida.' : 'Detenção sem qualquer evidência.'; }
  }

  // contadores e consequências invisíveis
  if (decision === 'approve') {
    S.counters.approved++;
    if (cz.isAlternado) { S.counters.alternadosIn++; scheduleEcho(cz); }
    if (cz.encounter) encounterOutcome(cz.encounter, 'approve');
  } else if (decision === 'reject') {
    S.counters.rejected++;
    if (cz.isAlternado) S.counters.alternadosBlocked++;
    if (cz.encounter) encounterOutcome(cz.encounter, 'reject');
  } else {
    S.counters.detained++;
    if (cz.isAlternado) { S.counters.alternadosCaught++; S.money += 10; note = ''; }
    else if (!cz.isWanted) S.counters.innocentsDetained++;
    if (cz.encounter) encounterOutcome(cz.encounter, 'detain');
  }

  if (correct) { S.counters.correct++; S.money += salaryForDay(S.day); }
  else { S.counters.wrong++; citation(note || 'Decisão em desacordo com o regulamento.'); }

  stampDocs(decision);
  shift.processed++;
  updateHud();
  const enc = cz.encounter;
  setTimeout(() => {
    if (enc && enc.nota) {
      modal('UM BILHETE FICOU NA BANDEJA', enc.nota.texto, [{ label: 'GUARDAR', fn: () => { S.flags[enc.nota.tipo] = true; nextCitizen(); } }, { label: 'QUEIMAR', fn: nextCitizen }]);
    } else nextCitizen();
  }, 1100);
}

function stampDocs(decision) {
  const first = $('desk').querySelector('.document');
  if (!first) return;
  const st = document.createElement('div');
  st.className = 'doc-stamped ' + (decision === 'approve' ? 'stamp-ok' : 'stamp-no');
  st.textContent = decision === 'approve' ? 'APROVADO' : decision === 'reject' ? 'REJEITADO' : 'DETIDO';
  first.appendChild(st);
}

/* ---------- ECOS (consequências tardias, sempre ambíguas) ---------- */
function scheduleEcho(cz) {
  if (!chance(.5)) return; // às vezes, nada acontece. isso também assombra.
  const delay = ri(2, 5);
  const txts = [
    `Três funcionários do arquivo de ${cz.destino} não voltaram para casa. As famílias dizem que "voltaram diferentes". A polícia diz que voltaram.`,
    `O reservatório de ${cz.destino} registrou "alterações químicas menores". O laudo foi arquivado.`,
    `Um(a) ${cz.profissao} recém-chegado(a) a ${cz.destino} foi promovido(a) em tempo recorde. Colegas o(a) descrevem como "perfeito(a) demais".`,
    `Moradores de ${cz.destino} relatam que os cães do bairro pararam de latir. Todos. Na mesma semana.`,
  ];
  S.pendingNews.push({ day: S.day + delay, text: pick(txts) });
}

/* ---------- ENCONTROS: DESFECHOS ---------- */
function encounterOutcome(enc, decision) {
  const f = S.flags;
  switch (enc.id) {
    case 'elara1': f.elara = decision; break;
    case 'zubrek':
      if (decision === 'approve' && f.suborno_oferta) f.dmarovDeal = true; // o envelope na mesa é o pagamento
      break;
    case 'elara2': f.elara2 = decision; if (decision === 'approve') f.elaraGrata = true; break;
    case 'courier':
      if (decision === 'approve') {
        S.counters.resHelped++;
        f.remedioProometido = true;
        S.pendingNews.push({ day: S.day + 2, text: 'Um hospital clandestino em Delvina tratou quarenta crianças esta semana. Ninguém sabe de onde vieram os medicamentos. Ninguém pergunta.' });
      } else if (decision === 'detain') { f.resTraida = true; }
      break;
    case 'elara3': if (decision === 'approve') f.elaraGrata = true; else f.elaraRancor = true; break;
    case 'odim':
      if (decision === 'approve') S.pendingNews.push({ day: S.day + 3, text: 'A jornalista Vela Odim publicou no exterior: "Os postos de triagem detêm 9 inocentes para cada suspeito real". O governo nega. O governo sempre nega.' });
      else f.odimDetida = true;
      break;
    case 'elara4': f.elara4 = decision; break;
    case 'dmarov2': f.dmarov2 = decision; break;
    case 'elara5': f.elaraFinal = decision; break;
    case 'esposa': f.esposaCruzou = decision === 'approve'; break;
  }
}

/* ---------- DIA 48: O ESPELHO ---------- */
function presentMirror() {
  shift.running = false;
  clearInterval(shift.tickId);
  const you = makeCitizen(48, { nome: 'VOCÊ', pais: 'osteria', sexo: 'm', forceValid: true });
  $('npc-portrait').innerHTML = portraitSVG(you.features);
  $('npc-name').textContent = '— o vidro reflete —';
  $('speech').textContent = 'Não há fila. Há um vidro. Do outro lado do vidro, alguém desliza documentos na bandeja. São os seus.';
  layDocs(you);
  $('ask-row').innerHTML = '';
  $('btn-reject').classList.remove('hidden');
  $('btn-detain').classList.add('hidden');
  $('btn-approve').onclick = () => finishGame('mirror_approve');
  $('btn-reject').onclick = () => finishGame('mirror_reject');
}

/* ---------- FIM DO TURNO ---------- */
function endShift() {
  if (!shift.running) return;
  shift.running = false;
  clearInterval(shift.tickId);
  clearInterval(radioTimer);
  stopAmbience();
  cancelAnimationFrame(Q.raf);
  $('bag-overlay').classList.remove('active');
  $('exam-overlay').classList.remove('active');
  const salary = null; // já pago por decisão
  let report = '';
  const row = (k, v) => `<div class="row"><span>${k}</span><span>${v}</span></div>`;
  report += row('Cidadãos atendidos', shift.processed);
  report += row('Advertências hoje', shift.citToday);
  report += row('Saldo atual', `${MOEDA} ${S.money}`);
  $('endday-report').innerHTML = report + `<p style="margin-top:12px;color:var(--ink-dim)">${endShiftFlavor()}</p>`;
  $('endday-title').textContent = `FIM DO EXPEDIENTE — DIA ${S.day}`;
  showScreen('screen-endday');
  save();
}
function endShiftFlavor() {
  if (S.day >= 43) return 'Você tranca o posto. Não sabe para quem está trancando.';
  if (S.day >= 30) return 'O retrato na parede mudou de novo. A moldura é a mesma.';
  if (S.day >= 12) return 'No caminho de casa, os alto-falantes repetem o hino novo. As crianças já sabem a letra.';
  return 'A fila que ficou para amanhã já começou a dormir na calçada.';
}

/* ---------- CASA / MANHÃ ---------- */
const COSTS = { comida: 8, aquecimento: 6, remedio: 12, presente: 5 };
let morningPurchases = {};

function goHome() {
  // 20:30 — a casa (house.js). Dormir chama afterNight().
  enterHouse();
}
function afterNight() {
  applyNight();
  if (checkArrest()) return;
  if (S.day >= 48) { finishGame(); return; }
  S.day++;
  save();
  showMorning();
}

/* ---------- A NOITE: alguém bate na porta ---------- */
const NIGHTS_SEM_ROSTO = [19, 22, 43]; // o olho mágico não mostra ninguém
function showNight(day, ev) {
  document.body.className = ''; // a noite não tem regime
  $('night-hour').textContent = ev.quem;
  $('night-text').textContent = ev.texto;
  $('night-after').textContent = '';
  const peep = $('peephole');
  if (NIGHTS_SEM_ROSTO.includes(day)) {
    peep.classList.add('empty');
    $('night-portrait').innerHTML = '';
  } else {
    peep.classList.remove('empty');
    $('night-portrait').innerHTML = portraitSVG(genFeatures(ev.sexo || 'm'));
  }
  const box = $('night-choices'); box.innerHTML = '';
  ev.escolhas.forEach(c => {
    const b = document.createElement('button');
    b.textContent = c.label;
    b.onclick = () => resolveNight(c);
    box.appendChild(b);
  });
  showScreen('screen-night');
  setTimeout(() => sfx('knock'), 700);
}
function resolveNight(c) {
  if (c.money) { S.money += c.money; }
  if (c.audit) { S.flags.auditRisk = (S.flags.auditRisk || 0) + c.audit; }
  if (c.flag) { S.flags[c.flag] = true; }
  if (c.echo) { S.pendingNews.push({ day: S.day + 1, text: c.echo }); }
  $('night-choices').innerHTML = '';
  $('night-after').textContent = c.after || '';
  const b = document.createElement('button');
  b.className = 'night-continue';
  b.textContent = 'VOLTAR PARA DENTRO →';
  b.onclick = () => { showScreen('screen-house'); houseResume(); };
  $('night-choices').appendChild(b);
}

function applyNight() {
  // aluguel
  S.rent = S.day >= 31 ? 25 : 15;
  S.money -= S.rent;
  // fome/saúde
  const fed = morningPurchases.comida;
  const heated = morningPurchases.aquecimento;
  for (const k in S.family) {
    const m = S.family[k];
    if (!m.alive) continue;
    m.hunger = fed ? 0 : m.hunger + 1;
    if (m.hunger >= 2 && !m.sick) m.sick = chance(.5);
    if (!heated && chance(.15)) m.sick = true;
    if (m.sick) {
      if (morningPurchases['remedio_' + k]) { m.sick = false; m.sickDays = 0; }
      else { m.sickDays++; if (m.sickDays >= 4) { m.alive = false; S.flags.morte = true; } }
    }
  }
  morningPurchases = {};
  // eventos de roteiro
  const ev = HOME_EVENTS[S.day];
  if (ev && ev.efeito === 'filho_doente') S.family.tomi.sick = true;
  if (S.flags.remedioProometido) { S.family.tomi.sick = false; S.family.tomi.sickDays = 0; S.flags.remedioProometido = false; S.flags.remedioEntregue = true; }
}

function checkArrest() {
  if (S.citTotal >= 12 || (S.flags.auditRisk || 0) >= 3) { finishGame('prisao'); return true; }
  return false;
}

function showMorning() {
  setRegimeClass(S.day);
  renderNewspaper();
  renderHome();
  showScreen('screen-morning');
}

function renderNewspaper() {
  const d = S.day;
  $('np-masthead').textContent = MASTHEAD[regimeOfDay(d)];
  $('np-date').textContent = fmtDate(worldDate(d)) + ` — ${MOEDA} 0,50 — edição ${1200 + d}`;
  const scripted = SCRIPTED_NEWS[d];
  const np = $('newspaper');
  if (scripted === null) {
    $('np-headline').textContent = 'O JORNAL NÃO CHEGOU HOJE.';
    $('np-body').textContent = d >= 48 ? 'Não há mais edições. Houve alguma vez?' : 'O entregador não veio. A banca está vazia. A vizinha diz que "jornal era coisa do governo antigo". Qual deles, você não pergunta.';
    $('np-minor').innerHTML = ''; $('np-ad').textContent = '';
    return;
  }
  const news = scripted || pick(FILLER_NEWS);
  $('np-headline').textContent = news.h;
  $('np-body').textContent = news.b;
  let minor = (news.m || []).map(x => '• ' + x);
  // ecos das suas decisões
  const echoes = S.pendingNews.filter(n => n.day <= d);
  S.pendingNews = S.pendingNews.filter(n => n.day > d);
  echoes.forEach(e => minor.push('• ' + e.text));
  $('np-minor').innerHTML = minor.length ? '<b>BREVES:</b>' + minor.join('<br>') : '';
  $('np-ad').textContent = pick(ADS);
}

function renderHome() {
  // status família
  let html = '';
  for (const k in S.family) {
    const m = S.family[k];
    const cls = !m.alive ? 'fam-status-dead' : m.sick ? 'fam-status-bad' : 'fam-status-ok';
    const st = !m.alive ? 'falecido(a)' : m.sick ? `DOENTE (${m.sickDays}d)` : m.hunger > 0 ? 'com fome' : 'bem';
    html += `<div class="fam-row"><span>${m.nome}</span><span class="${cls}">${st}</span></div>`;
  }
  $('family-status').innerHTML = html;

  // eventos
  const ev = HOME_EVENTS[S.day];
  let evHtml = '';
  if (ev) evHtml += `<div class="ev">${ev.texto}</div>`;
  if (S.flags.remedioEntregue) { evHtml += `<div class="ev">De madrugada, alguém deixou um pacote na porta: o remédio de Tomi, e um bilhete: "Dívida paga. — J.M."</div>`; S.flags.remedioEntregue = false; }
  if (S.flags.morte) { evHtml += `<div class="ev">Houve um velório nesta casa. As vizinhas trouxeram sopa e silêncio.</div>`; S.flags.morte = false; }
  $('home-events').innerHTML = evHtml;

  // orçamento
  $('home-budget').innerHTML =
    `<div class="row"><span>Saldo</span><span>${MOEDA} ${S.money}</span></div>` +
    `<div class="row"><span>Aluguel (descontado à noite)</span><span>${MOEDA} ${S.day >= 31 ? 25 : 15}</span></div>`;

  // loja
  const shop = $('home-shop'); shop.innerHTML = '';
  const buyBtn = (key, label, cost) => {
    const b = document.createElement('button');
    b.textContent = `${label} — ${MOEDA} ${cost}`;
    b.onclick = () => {
      if (morningPurchases[key]) return;
      if (S.money < cost) { b.textContent = 'SEM SALDO'; setTimeout(() => b.textContent = `${label} — ${MOEDA} ${cost}`, 900); return; }
      S.money -= cost; morningPurchases[key] = true; b.disabled = true; renderHome();
    };
    shop.appendChild(b);
  };
  buyBtn('comida', 'Comida p/ família', COSTS.comida);
  buyBtn('aquecimento', 'Aquecimento', COSTS.aquecimento);
  for (const k in S.family) {
    const m = S.family[k];
    if (m.alive && m.sick) buyBtn('remedio_' + k, `Remédio (${m.nome.split(' ')[0]})`, COSTS.remedio);
  }
  // calibração do mercador (dia 38+)
  if (S.flags.calibOferta && !S.bioCalibrated) buyBtn('calib', 'Calibração do detector (mercado negro)', 40);
  if (morningPurchases.calib) S.bioCalibrated = true;
}

/* ---------- FINAIS ---------- */
function pickEnding(kind) {
  const c = S.counters;
  if (kind === 'prisao') return 'prisao';
  const famDead = Object.values(S.family).every(m => !m.alive);
  if (famDead) return 'familia';
  if (kind === 'mirror_reject') return 'duvida';
  if (c.resHelped >= 1 && S.flags.resistencia_contato && S.citTotal < 12) return 'resistencia';
  if (c.alternadosIn >= 6) return 'silencio';
  if (S.citTotal <= 4 && c.bribes === 0) return 'funcionario';
  return 'duvida';
}

function finishGame(kind) {
  shift.running = false;
  clearInterval(shift.tickId);
  clearInterval(radioTimer);
  stopAmbience();
  const key = pickEnding(kind);
  const e = ENDINGS[key];
  const c = S.counters;
  $('ending-title').textContent = e.t;
  $('ending-body').textContent = e.b;
  $('ending-stats').innerHTML =
    `48 dias. ${c.approved} aprovações. ${c.rejected} rejeições. ${c.detained} detenções.<br>` +
    `Alternados que passaram por você: <b>${c.alternadosIn}</b>. Detidos: ${c.alternadosCaught}. Rejeitados sem você saber: ${c.alternadosBlocked}.<br>` +
    `Inocentes detidos: ${c.innocentsDetained}. Subornos: ${c.bribes} (${MOEDA} ${c.bribeMoney}).<br>` +
    `<br><i>Estes números vêm do Estado Verdadeiro do mundo. Você nunca teve acesso a ele. Até agora. Se é que este relatório também não mente.</i>`;
  try { localStorage.removeItem(SAVE_KEY); } catch (err) {}
  showScreen('screen-ending');
}

/* ---------- EVENTOS GLOBAIS DE CLIQUE (inspeção) ---------- */
document.addEventListener('click', (e) => {
  if (!shift.inspecting) return;
  const t = e.target;
  if (t.classList.contains('v') && t.dataset.fid) return pickTarget(t.dataset.fid, t);
  const photo = t.closest('.doc-photo');
  if (photo) return pickTarget(photo.dataset.fid, photo);
  if (t.classList.contains('doc-seal')) return pickTarget(t.dataset.fid, t);
  if (t.classList.contains('rb-rule') || t.classList.contains('rb-country')) return pickTarget(t.dataset.fid, t);
  if (t.classList.contains('a') && t.dataset.fid) return pickTarget(t.dataset.fid, t);
  if (t.id === 'clock' || t.closest('.shift-clock')) return pickTarget('clock', t.closest('.shift-clock'));
  if (t.id === 'npc-portrait' || t.closest('#npc-stage')) return pickTarget('npc.face', $('npc-stage'));
});

/* ---------- BOTÕES ---------- */
$('btn-new').onclick = () => {
  S = freshState();
  modal('CONTRATO DE SERVIÇO — MINISTÉRIO DE TRIAGEM',
    'Você foi sorteado na Loteria de Ofícios para servir como INSPETOR DE FRONTEIRA no Posto Nº 7, por 48 dias.\n\nHorário: 08h às 18h. Você chega em casa às 20h30.\nSalário: ' + MOEDA + ' 5 por decisão correta.\nErros: advertência; a partir da 3ª do dia, multa.\n\nSua família depende do seu salário: Vessa (sua esposa), Tomi (8 anos), Dario (15 anos, do seu primeiro casamento) e sua mãe, Odila.\n\nAssine abaixo. A recusa não consta do formulário como opção.',
    [{ label: 'ASSINAR', fn: () => { showMorning(); } }]);
};
$('btn-continue').onclick = () => { const j = loadSave(); if (j) { S = j; showMorning(); } };
$('btn-gowork').onclick = () => {
  if (ENCOUNTERS[S.day] && ENCOUNTERS[S.day].vendeCalibracao) S.flags.calibOferta = true;
  startDay();
};
$('btn-gohome').onclick = goHome;
$('btn-endshift').onclick = () => { if (shift.running) endShift(); };
$('btn-bulletin').onclick = () => showBulletin(null);
$('btn-inspect').onclick = toggleInspect;
$('btn-exam').onclick = openExam;
$('btn-exam-close').onclick = () => $('exam-overlay').classList.remove('active');
$('btn-bag').onclick = openBag;
$('btn-bag-close').onclick = () => $('bag-overlay').classList.remove('active');
$('btn-radio').onclick = () => {
  radioOn = !radioOn;
  $('radio-bar').classList.toggle('radio-off', !radioOn);
  radioTick();
};
$('btn-scan-thermo').onclick = () => scan('thermo');
$('btn-scan-pulse').onclick = () => scan('pulse');
$('btn-scan-bio').onclick = () => scan('bio');
$('btn-approve').onclick = () => decide('approve');
$('btn-reject').onclick = () => decide('reject');
$('btn-detain').onclick = () => decide('detain');
$('btn-restart').onclick = () => { location.reload(); };
$('btn-music').onclick = () => {
  MUSIC.on = !MUSIC.on;
  $('btn-music').style.opacity = MUSIC.on ? '1' : '.4';
  if (!MUSIC.on) stopMusic();
};

/* ---------- INICIALIZAÇÃO ---------- */
(function init() {
  if (loadSave()) $('btn-continue').style.display = '';
  showScreen('screen-title');
  startTitleSnow();
  // o primeiro clique em qualquer lugar destrava o áudio do navegador
  document.addEventListener('pointerdown', function unlock() {
    try {
      AC = AC || new (window.AudioContext || window.webkitAudioContext)();
      if (AC.state === 'suspended') AC.resume();
    } catch (e) {}
    if (MUSIC.on && !$('screen-shift').classList.contains('active')) startMusic();
    document.removeEventListener('pointerdown', unlock);
  });
})();
