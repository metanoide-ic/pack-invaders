/* ============================================================
   HUMANOCRACY — game.js
   Motor: cidadãos procedurais, inspeção, IA adaptativa,
   economia familiar, 48 dias, finais.
   ============================================================ */
'use strict';

/* ---------- RNG ----------
   Stream chaveável: fora de qualquer withRng(), roda com uma semente de
   sessão (só cosmético — neve do título, sombras da fila etc.). Dentro de
   um withRng(seed, fn), TUDO que passar por rnd/ri/pick/chance vira
   determinístico pra aquele (seedBase, dia, cidadão, fase) — é o que
   sustenta o Modo Segunda Leitura: mesma seedBase, mesmos cidadãos,
   mesmos vereditos possíveis, não importa quantas ferramentas você use. */
function makeRng(seed) {
  let s = Math.abs(Math.floor(seed)) % 2147483647; if (s <= 0) s = 1;
  return function () { s = (s * 48271) % 2147483647; return (s - 1) / 2147483646; };
}
function hashSeed(...parts) {
  let h = 2166136261 >>> 0;
  const str = parts.join('|');
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  return h >>> 0;
}
let _rng = makeRng(Date.now() % 2147483647);
// troca a stream ativa e devolve a anterior, pra restaurar em um finally
// manual — usado onde o trecho seedado tem `return` no meio (early exits
// de nextCitizen/decide/scan) e por isso não cabe no fechamento de withRng.
function beginRng(seed) { const prev = _rng; _rng = makeRng(seed); return prev; }
function withRng(seed, fn) {
  const prev = beginRng(seed);
  try { return fn(); } finally { _rng = prev; }
}
function rnd() { return _rng(); }
function ri(a, b) { return a + Math.floor(rnd() * (b - a + 1)); }
function pick(arr) { return arr[Math.floor(rnd() * arr.length)]; }
function chance(p) { return rnd() < p; }

/* ---------- ÁUDIO ---------- */
let AC = null;
let SFX_ON = true;
function sfx(kind) {
  if (!SFX_ON) return;
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
    else if (kind === 'knock1') { o.type = 'sine'; o.frequency.setValueAtTime(52, t); g.gain.setValueAtTime(.3, t); g.gain.exponentialRampToValueAtTime(.001, t + .3); o.start(t); o.stop(t + .32); }
    else if (kind === 'silente') { o.type = 'sine'; o.frequency.setValueAtTime(96, t); o.frequency.linearRampToValueAtTime(38, t + 2.4); g.gain.setValueAtTime(.09, t); g.gain.linearRampToValueAtTime(0, t + 2.6); o.start(t); o.stop(t + 2.7); }
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
    else if (kind === 'achieve') { // conquista: duas notas subindo (C5 → G5), mais festivo que o 'ding' comum
      o.type = 'sine'; o.frequency.setValueAtTime(523.25, t);
      g.gain.setValueAtTime(.001, t); g.gain.linearRampToValueAtTime(.14, t + .02); g.gain.exponentialRampToValueAtTime(.001, t + .22);
      o.start(t); o.stop(t + .24);
      const o2 = AC.createOscillator(), g2 = AC.createGain();
      o2.connect(g2); g2.connect(AC.destination);
      o2.type = 'sine'; o2.frequency.setValueAtTime(783.99, t + .12);
      g2.gain.setValueAtTime(.001, t + .12); g2.gain.linearRampToValueAtTime(.16, t + .14); g2.gain.exponentialRampToValueAtTime(.001, t + .4);
      o2.start(t + .12); o2.stop(t + .42);
    }
  } catch (e) { /* áudio indisponível */ }
}

/* ---------- VOZES MURMURADAS (gibberish grave e triste) ---------- */
function mumble(pitch, syl) {
  if (!SFX_ON) return;
  try {
    AC = AC || new (window.AudioContext || window.webkitAudioContext)();
    if (AC.state === 'suspended') return;
    const t0 = AC.currentTime;
    for (let i = 0; i < syl; i++) {
      const t = t0 + i * 0.095 + Math.random() * 0.02;
      const o = AC.createOscillator(), g = AC.createGain(), f = AC.createBiquadFilter();
      f.type = 'bandpass'; f.frequency.value = pitch * 3.2; f.Q.value = 1.6;
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(pitch * (0.92 + Math.random() * 0.22), t);
      o.frequency.linearRampToValueAtTime(pitch * (0.85 + Math.random() * 0.3), t + 0.07);
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(.05, t + 0.015);
      g.gain.linearRampToValueAtTime(0, t + 0.085);
      o.connect(f); f.connect(g); g.connect(AC.destination);
      o.start(t); o.stop(t + 0.09);
    }
  } catch (e) {}
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
/* BRASÃO DO MINISTÉRIO — olho que tudo vê, raios, coroa de louros, anel de
   estrelas. O emblema de um Estado de vigilância. Desenhado, não emoji. */
function drawTitleCrest() {
  const cv = $('title-crest'); if (!cv) return;
  const x = cv.getContext('2d'); const N = cv.width, C = N / 2, u = N / 300;
  x.clearRect(0, 0, N, N);
  const GOLD = '#c9a34a', GOLDL = '#ecd48a', DARK = '#0e0d09';
  // raios de propaganda (sunburst)
  x.save(); x.translate(C, C);
  for (let i = 0; i < 36; i++) {
    x.rotate(Math.PI * 2 / 36);
    x.fillStyle = i % 2 ? 'rgba(201,163,74,.10)' : 'rgba(201,163,74,.05)';
    x.beginPath(); x.moveTo(0, -30 * u); x.lineTo(6 * u, -142 * u); x.lineTo(-6 * u, -142 * u); x.closePath(); x.fill();
  }
  x.restore();
  // disco de fundo
  const disc = x.createRadialGradient(C, C - 10 * u, 6 * u, C, C, 116 * u);
  disc.addColorStop(0, 'rgba(30,26,16,.75)'); disc.addColorStop(1, 'rgba(10,9,6,.9)');
  x.fillStyle = disc; x.beginPath(); x.arc(C, C, 112 * u, 0, 6.29); x.fill();
  // anéis
  x.strokeStyle = GOLD; x.lineWidth = 2.4 * u; x.beginPath(); x.arc(C, C, 110 * u, 0, 6.29); x.stroke();
  x.lineWidth = 1.2 * u; x.beginPath(); x.arc(C, C, 92 * u, 0, 6.29); x.stroke();
  // estrelas entre os anéis
  const star = (cx, cy, r, rot) => { x.beginPath(); for (let k = 0; k < 5; k++) { const a1 = rot - Math.PI / 2 + k * 2.513, a2 = a1 + 1.2566; x.lineTo(cx + Math.cos(a1) * r, cy + Math.sin(a1) * r); x.lineTo(cx + Math.cos(a2) * r * 0.45, cy + Math.sin(a2) * r * 0.45); } x.closePath(); x.fill(); };
  x.fillStyle = GOLDL;
  for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283; if (Math.abs(Math.sin(a)) < 0.98) star(C + Math.cos(a) * 101 * u, C + Math.sin(a) * 101 * u, 4.4 * u, a); }
  // coroa de louros (dois ramos)
  const laurel = (side) => {
    x.save(); x.translate(C, C); x.scale(side, 1);
    x.strokeStyle = GOLD; x.lineWidth = 2 * u; x.beginPath(); x.arc(0, 4 * u, 74 * u, Math.PI * 0.62, Math.PI * 0.98); x.stroke();
    for (let i = 0; i < 6; i++) { const a = Math.PI * (0.66 + i * 0.055); const lx = Math.cos(a) * 74 * u, ly = 4 * u + Math.sin(a) * 74 * u; x.save(); x.translate(lx, ly); x.rotate(a + 0.5); x.fillStyle = GOLDL; x.beginPath(); x.ellipse(0, -6 * u, 3 * u, 7 * u, 0, 0, 6.29); x.fill(); x.restore(); }
    x.restore();
  };
  laurel(1); laurel(-1);
  // OLHO QUE TUDO VÊ, no centro
  const ey = C - 2 * u;
  x.fillStyle = '#f2ead2'; x.beginPath();
  x.moveTo(C - 46 * u, ey); x.quadraticCurveTo(C, ey - 34 * u, C + 46 * u, ey); x.quadraticCurveTo(C, ey + 34 * u, C - 46 * u, ey); x.closePath(); x.fill();
  x.strokeStyle = GOLD; x.lineWidth = 2.2 * u; x.stroke();
  // íris
  const ig = x.createRadialGradient(C - 4 * u, ey - 4 * u, 2 * u, C, ey, 22 * u);
  ig.addColorStop(0, '#7ea6c0'); ig.addColorStop(0.7, '#2e5068'); ig.addColorStop(1, '#12222e');
  x.fillStyle = ig; x.beginPath(); x.arc(C, ey, 20 * u, 0, 6.29); x.fill();
  x.fillStyle = DARK; x.beginPath(); x.arc(C, ey, 9 * u, 0, 6.29); x.fill();
  x.fillStyle = 'rgba(255,255,255,.85)'; x.beginPath(); x.arc(C - 5 * u, ey - 5 * u, 3 * u, 0, 6.29); x.fill();
  // raios curtos saindo do olho
  x.strokeStyle = 'rgba(236,212,138,.5)'; x.lineWidth = 1.4 * u;
  for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283; x.beginPath(); x.moveTo(C + Math.cos(a) * 50 * u, ey + Math.sin(a) * 24 * u); x.lineTo(C + Math.cos(a) * 62 * u, ey + Math.sin(a) * 30 * u); x.stroke(); }
  // fita/banner embaixo
  x.fillStyle = 'rgba(140,47,36,.85)'; x.beginPath();
  x.moveTo(C - 52 * u, C + 72 * u); x.lineTo(C + 52 * u, C + 72 * u); x.lineTo(C + 44 * u, C + 86 * u); x.lineTo(C - 44 * u, C + 86 * u); x.closePath(); x.fill();
  x.fillStyle = GOLDL; x.textAlign = 'center'; x.textBaseline = 'middle'; x.font = `bold ${11 * u}px "Oswald", sans-serif`;
  x.fillText('★  M · T · F  ★', C, C + 79 * u);
}
const TS = { raf: null, flakes: [], t: 0 };
function startTitleSnow() {
  drawTitleCrest();
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
    const W2 = cv.width, gy = cv.height * .84;
    // névoa baixa no horizonte
    const fog = ctx.createLinearGradient(0, gy - 70, 0, cv.height);
    fog.addColorStop(0, 'rgba(20,22,26,0)'); fog.addColorStop(1, 'rgba(16,18,22,.6)');
    ctx.fillStyle = fog; ctx.fillRect(0, gy - 70, W2, cv.height - gy + 70);
    // prédio do Ministério à esquerda (silhueta com janelas fracas + bandeira)
    ctx.fillStyle = '#0b0d0a';
    ctx.fillRect(W2 * .04, gy - 150, W2 * .14, 150 + cv.height * .16);
    ctx.fillRect(W2 * .04 + W2 * .05, gy - 178, W2 * .04, 30); // torre central
    ctx.fillStyle = 'rgba(160,140,90,.18)';
    for (let r = 0; r < 6; r++) for (let c = 0; c < 4; c++) if ((r * 4 + c) % 3) ctx.fillRect(W2 * .05 + c * (W2 * .028), gy - 138 + r * 20, W2 * .014, 9);
    // mastro + bandeira
    ctx.strokeStyle = '#1a1c16'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(W2 * .07, gy - 178); ctx.lineTo(W2 * .07, gy - 210); ctx.stroke();
    ctx.fillStyle = 'rgba(120,40,34,.5)'; const fw = 5 + Math.sin(TS.t * 2) * 2; ctx.fillRect(W2 * .07, gy - 210, 26 + fw, 14);
    // muro com arame farpado
    ctx.fillStyle = '#0e100c'; ctx.fillRect(0, gy - 22, W2, 22 + cv.height * .16);
    ctx.fillStyle = 'rgba(255,246,220,.03)'; ctx.fillRect(0, gy - 22, W2, 1);
    ctx.strokeStyle = 'rgba(120,116,100,.4)'; ctx.lineWidth = 1;
    ctx.beginPath(); for (let sx = 0; sx < W2; sx += 6) { ctx.moveTo(sx, gy - 30 + (sx % 12 ? 0 : 3)); ctx.lineTo(sx + 3, gy - 24); ctx.lineTo(sx + 6, gy - 30); } ctx.stroke();
    for (let sx = 14; sx < W2; sx += 46) { ctx.beginPath(); ctx.arc(sx, gy - 28, 4, 0, 6.29); ctx.stroke(); } // espirais
    // torre de guarda à direita (cabine sobre pernas)
    const tx = W2 * .84;
    ctx.fillStyle = '#0b0d0a';
    ctx.beginPath(); ctx.moveTo(tx - 4, gy - 22); ctx.lineTo(tx + 6, gy - 118); ctx.lineTo(tx + 40, gy - 118); ctx.lineTo(tx + 50, gy - 22); ctx.closePath(); ctx.fill(); // pernas trapézio
    ctx.fillRect(tx - 2, gy - 150, 50, 34); // cabine
    ctx.beginPath(); ctx.moveTo(tx - 8, gy - 150); ctx.lineTo(tx + 23, gy - 166); ctx.lineTo(tx + 54, gy - 150); ctx.closePath(); ctx.fill(); // telhado
    ctx.fillStyle = 'rgba(220,200,140,.5)'; ctx.fillRect(tx + 6, gy - 144, 36, 18); // janela acesa
    // holofote varrendo
    const ang = Math.sin(TS.t * .3) * .8 - .1;
    const lx = tx + 24, ly = gy - 135;
    const grad = ctx.createLinearGradient(lx, ly, lx + Math.sin(ang) * 500, ly + 400);
    grad.addColorStop(0, 'rgba(220,200,140,.14)'); grad.addColorStop(1, 'rgba(201,180,120,0)');
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.moveTo(lx, ly);
    ctx.lineTo(lx + Math.sin(ang - .16) * 700, ly + 520);
    ctx.lineTo(lx + Math.sin(ang + .16) * 700, ly + 520);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255,240,200,.7)'; ctx.beginPath(); ctx.arc(lx, ly, 3, 0, 6.29); ctx.fill();
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

/* ---------- TAMANHO DA FILA DO DIA ----------
   A fila é finita: quando o último da fila é atendido, o expediente acaba.
   (Calibrado pelo autoplay: ~12-18 pessoas/dia = economia honesta.) */
function queueSizeForDay(d) {
  if (d >= 47) return 9;
  if (d >= 43) return 6 + ri(0, 3);   // colapso: quase ninguém viaja
  if (d >= 30) return 13 + ri(0, 4);
  if (d >= 12) return 12 + ri(0, 4);
  return 11 + ri(0, 3);
}

/* ---------- COTA DE ADMISSÃO DIÁRIA ----------
   Esgotada a cota, rejeitar inocentes vira "o correto".
   É assim que a burocracia recruta pessoas razoáveis. */
function quotaForDay(d) {
  if (d >= 47) return Infinity; // não há mais normas
  if (d >= 43) return 3;        // colapso: a fronteira quase fechou
  if (d >= 30) return 7;        // o Conselho "acolhe o trabalhador"
  if (d >= 14) return 5;        // Mehrvolk: pureza é escassez
  if (d >= 8) return 8;
  return 10;
}

/* ---------- CONFIGURAÇÕES (persistem entre partidas, fora do save) ---------- */
const SETTINGS_KEY = 'humanocracy_settings_v1';
let SETTINGS = { archivist: false, lang: 'pt', achievements: [], textLarge: false };
function loadSettings() {
  try {
    const j = localStorage.getItem(SETTINGS_KEY);
    if (j) SETTINGS = Object.assign(SETTINGS, JSON.parse(j));
  } catch (e) {}
  if (!SETTINGS.achievements) SETTINGS.achievements = [];
}
function saveSettings() { try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(SETTINGS)); } catch (e) {} }

/* ---------- CONQUISTAS (toast local no protótipo web; mesma condição vira
   uma chamada a steamworks.js quando a integração Steamworks acontecer —
   ver steam/README.md) ---------- */
const ACHIEVEMENT_TOAST_GAP = 70; // px entre toasts empilhados (altura real ~58px)
let achievementToasts = []; // toasts visíveis agora, de cima pra baixo — vários finais
                            // desbloqueiam junto (ex.: A Medalha + Espelho + Família)
function restackAchievementToasts() {
  achievementToasts.forEach((el, i) => { el.style.top = (16 + i * ACHIEVEMENT_TOAST_GAP) + 'px'; });
}
function unlockAchievement(id) {
  if (!ACHIEVEMENTS[id] || SETTINGS.achievements.includes(id)) return;
  SETTINGS.achievements.push(id);
  saveSettings();
  sfx('achieve');
  const el = document.createElement('div');
  el.className = 'achievement-toast';
  el.innerHTML = `🏆 <b>${T('CONQUISTA DESBLOQUEADA')}</b><br>${T(ACHIEVEMENTS[id])}`;
  achievementToasts.push(el);
  restackAchievementToasts();
  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add('show'));
  setTimeout(() => {
    el.classList.remove('show');
    setTimeout(() => {
      el.remove();
      achievementToasts = achievementToasts.filter(t => t !== el);
      restackAchievementToasts();
    }, 600);
  }, 4200);
}
let achievementsModalOpen = false; // ESC precisa fechar isto, não despausar por baixo
function closeAchievementsModal() {
  $('modal-overlay').classList.remove('active');
  achievementsModalOpen = false;
}
function showAchievementsModal() {
  $('modal-title').textContent = T('CONQUISTAS');
  const got = SETTINGS.achievements || [];
  const ids = Object.keys(ACHIEVEMENTS);
  const rows = ids.map(id => {
    const unlocked = got.includes(id);
    return `<div class="ach-row ${unlocked ? 'unlocked' : 'locked'}"><span class="ach-icon">${unlocked ? '🏆' : '🔒'}</span>${T(ACHIEVEMENTS[id])}</div>`;
  }).join('');
  $('modal-body').innerHTML = `<div class="ach-count">${got.length} / ${ids.length}</div>${rows}`;
  const box = $('modal-actions'); box.innerHTML = '';
  const b = document.createElement('button');
  b.textContent = T('FECHAR');
  b.onclick = closeAchievementsModal;
  box.appendChild(b);
  achievementsModalOpen = true;
  $('modal-overlay').classList.add('active');
}

/* ---------- ESTADO ---------- */
const SAVE_KEY = 'humanocracy_save_v1';
let S = null;
function freshState(forceSeed) {
  const seedBase = forceSeed != null ? forceSeed : Math.floor(Math.random() * 1e9);
  // dias do Silente também vêm da seed — segunda leitura reencontra ele nos mesmos dias
  const silRng = makeRng(hashSeed(seedBase, 'silente'));
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
    returnQueue: [],           // quem você marcou volta: {dueDay, nome, pais, sexo, etnia, features, mood, dia}
    silenteDays: [14 + Math.floor(silRng() * 11), 30 + Math.floor(silRng() * 15)], // ele vem duas vezes. as regras não mudam.
    rent: 15,
    seedBase,
    secondReading: forceSeed != null,
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
    if (!s.returnQueue) s.returnQueue = [];
    if (!s.silenteDays) s.silenteDays = [14 + Math.floor(Math.random() * 11), 30 + Math.floor(Math.random() * 15)];
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
  document.body.className = ''; // reset de tema — não é preferência do jogador
  document.body.classList.add('regime-' + regimeOfDay(day));
  if (SETTINGS.textLarge) document.body.classList.add('text-large'); // sobrevive ao reset
}

/* ---------- MODAL ---------- */
function modal(title, body, actions) {
  $('modal-title').textContent = T(title);
  $('modal-body').textContent = T(body);
  const box = $('modal-actions'); box.innerHTML = '';
  (actions || [{ label: 'OK' }]).forEach(a => {
    const b = document.createElement('button');
    b.textContent = T(a.label);
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
  $('citation-body').textContent = T(text) + (fine ? `\n${T('MULTA: ')}${MOEDA} ${fine}` : '\n' + T('ADVERTÊNCIA REGISTRADA.'));
  $('citation').classList.add('active');
  clearTimeout(citTimer);
  citTimer = setTimeout(() => $('citation').classList.remove('active'), 4200);
  updateHud();
}

/* ---------- SUSSURROS ---------- */
function whisper(line) {
  const w = $('whisper');
  w.textContent = T(line || pick(WHISPERS));
  w.style.left = ri(15, 60) + '%';
  w.style.top = ri(20, 70) + '%';
  w.classList.remove('active'); void w.offsetWidth; w.classList.add('active');
}

/* ---------- AUDITORIA: você também é inspecionado (Volume 7.7) ---------- */
/* auditRisk >= 3 termina o jogo (checkArrest). Aos 2, um único sussurro — nunca
   mais que isso — avisa que alguém notou, sem dizer quem nem o quê. O LIMIAR e o
   que o aciona (suborno aceito, fiscalização ignorada) continuam exatamente os
   mesmos; isto só dá ao jogador uma chance de perceber antes do fim, não muda a
   regra nem a torna mais dura ou mais branda. */
function bumpAuditRisk(n) {
  S.flags.auditRisk = (S.flags.auditRisk || 0) + n;
  if (S.flags.auditRisk >= 2 && !S.flags.auditWarned) {
    S.flags.auditWarned = true;
    whisper('alguém andou perguntando de você. ninguém disse quem. ninguém disse o quê.');
  }
}

/* ---------- RETRATOS (SVG procedural) ---------- */
const SKINS = ['#e8c39e', '#d9a878', '#c68d5c', '#a9744f', '#8c5a3c', '#f0d0b0'];
const HAIRC = ['#241a12', '#40301e', '#6b4a2a', '#8c6b3e', '#4a4a4a', '#191919', '#7a2f1a', '#b5b5a5'];
/* ---------- fenótipo por etnia ----------
   Faixas de pele/cabelo/olho COERENTES por etnia (uma família parece
   família; Baharzad não parece Kranton) — mas SOBREPOSTAS de propósito:
   listas ponderadas por repetição, com entradas compartilhadas entre
   etnias. Os "manuais de fenotipia" do regime são pseudociência na
   ficção, e o jogo faz questão de que continuem sendo: nenhum rosto
   prova etnia nenhuma. faces.js aplica desvios estruturais igualmente
   sutis a partir de f.etnia. */
const ETHNIC_PHENO = {
  //  Mundo centro/leste-europeu + centro-asiático + persa (à la Arstotzka):
  //  TODOS de pele clara a oliva — nenhum tom sub-saariano (índice 4 do SKINS
  //  não é usado). SKINS: 0 clara-rosada,1 clara-oliva,2 média-dourada,3 morena,5 muito clara.
  //          pele                     cabelo                       olhos (0 cast,1 mel,2 verde,3 azul-cinza,4 avelã,5 azul claro)
  osano:   { skin: [0, 1, 1, 5, 2, 0], hair: [0, 1, 1, 2, 2, 5, 3], eyes: [0, 0, 4, 2, 3, 5] }, // europeu genérico
  nulio:   { skin: [5, 5, 0, 0, 1],    hair: [3, 3, 7, 2, 5, 1],    eyes: [3, 5, 5, 2, 4, 0] }, // nórdico/eslavo — palidez
  mestico: { skin: [0, 1, 1, 2, 5],    hair: [0, 1, 2, 5, 3],       eyes: [0, 0, 4, 1, 3, 5] }, // misto europeu
  bahari:  { skin: [1, 2, 2, 3, 1],    hair: [5, 5, 0, 1],          eyes: [0, 0, 1, 4] },       // persa — oliva/moreno claro
  cantalo: { skin: [0, 1, 1, 2, 5],    hair: [5, 0, 0, 1, 2, 6],    eyes: [2, 3, 0, 4, 5] },    // ibérico/latino
  tarano:  { skin: [1, 1, 2, 2, 0],    hair: [5, 5, 0, 1],          eyes: [0, 0, 1, 4] },       // centro-asiático — oliva claro
};
function genFeatures(sexo, idade, etnia) {
  idade = idade || ri(20, 60);
  const velho = idade >= 56;
  const ph = ETHNIC_PHENO[etnia];
  return {
    etnia: etnia || null,
    skin: ph ? pick(ph.skin) : ri(0, SKINS.length - 1),
    hair: velho && chance(.8) ? (chance(.5) ? 4 : 7) : (ph ? pick(ph.hair) : ri(0, HAIRC.length - 1)), // grisalho/branco
    // estilo de cabelo por sexo/idade: mulheres nunca recebem "entradas" (hs2);
    // homens só recebem entradas com mais idade (senão vira careca aleatória).
    hairStyle: sexo === 'f' ? pick([0, 1, 1, 3]) : (idade > 42 ? ri(0, 3) : pick([0, 1, 3, 0])),
    eyes: ph ? pick(ph.eyes) : ri(0, 5), mouth: ri(0, 2),
    beard: sexo === 'm' ? ri(0, 2) : 0, glasses: chance(velho ? .45 : .18),
    brow: ri(0, 1), faceW: ri(0, 2), sexo,
    hat: sexo === 'm' ? (chance(.35) ? 1 : 0) : (chance(.3) ? 2 : 0), // 1 chapéu, 2 lenço
    earring: sexo === 'f' && chance(.4),
    idade, rugas: velho || idade >= 48 && chance(.4),
    // CORPO: cada pessoa tem um físico próprio (gerado junto, determinístico).
    // build 0 magro · 1 médio · 2 forte; height desvio de altura; postura.
    build: chance(.5) ? 1 : (chance(.5) ? 0 : 2),
    height: -0.9 + rnd() * 1.8,           // -0.9..0.9 (bem baixo..bem alto)
    girth: Math.max(0, (idade > 45 ? 0.15 : 0) + (chance(.28) ? 0.3 + rnd() * 0.5 : rnd() * 0.2)), // 0 magro .. ~0.8 pesado
    // semente do RENDER (faces.js): mesma pessoa = mesmo rosto em qualquer
    // contexto (foto do documento, guichê, exame). mutateFeatures copia o
    // fseed junto — a foto divergente é a MESMA pessoa com atributos trocados,
    // não um estranho aleatório.
    fseed: ri(1, 2147483646),
  };
}
function mutateFeatures(f) { // para foto divergente
  const g = JSON.parse(JSON.stringify(f));
  g.hairStyle = (g.hairStyle + ri(1, 3)) % 4;
  g.hair = (g.hair + ri(1, 4)) % HAIRC.length;
  if (g.sexo === 'm') g.beard = (g.beard + ri(1, 2)) % 3;
  else g.glasses = !g.glasses;
  if (chance(.5)) g.hat = g.hat ? 0 : (g.sexo === 'm' ? 1 : 2);
  return g;
}
/* portraitSVG(f) e examSVG(f, phys) agora vivem em faces.js — o motor de
   retratos procedurais analog-horror (canvas pintado + pós-processamento
   VHS, determinístico por f.fseed). As assinaturas não mudaram: devolvem
   markup SVG (um <image> com dataURL) pros mesmos containers de sempre. */

/* ---------- EXAME FÍSICO: UI ---------- */
const EXAM_ZONES = [
  { id: 'olhos', label: 'OLHOS', tells: ['olhos', 'piscar'] },
  { id: 'boca', label: 'BOCA', tells: ['dentes'] },
  { id: 'pele', label: 'PELE', tells: ['pele'] },
  { id: 'maos', label: 'MÃOS', tells: ['maos'] },
  { id: 'pescoco', label: 'PESCOÇO', tells: ['pescoco'] },
  { id: 'corpo', label: 'CORPO', body: true },
];
function openExam() {
  const cz = shift.citizen;
  if (!cz || !shift.running) return;
  if (cz.isSilente) { silenteGameOver(); return; } // você olhou de perto. ele também.
  if (!cz.examDone) { spendTime(10); cz.examDone = true; }
  $('exam-face-svg').innerHTML = examSVG(cz.features, cz.phys);
  $('exam-log').innerHTML = `<span class="obs">${T('A pessoa se aproxima do vidro. Perto demais. Examine cada região.')}</span>`;
  // acompanhante Alternado: o horror está no colo, não no rosto que você examina
  if (cz.companion && cz.companion.anom) {
    $('exam-log').innerHTML += `<div class="anomalia" data-tell="companion">⚠ ${T('O acompanhante não é uma criança. As pupilas são fendas; os olhos não têm fundo; não pisca. O adulto aperta-o mais forte quando você olha.')}</div>`;
  }
  const zones = $('exam-zones'); zones.innerHTML = '';
  // visão geral: volta do close de zona para o rosto inteiro
  const bg = document.createElement('button');
  bg.textContent = T('GERAL'); bg.className = 'zone-general';
  bg.onclick = () => { $('exam-face-svg').innerHTML = examSVG(cz.features, cz.phys); };
  zones.appendChild(bg);
  EXAM_ZONES.forEach(z => {
    const b = document.createElement('button');
    b.textContent = T(z.label);
    b.onclick = () => { b.classList.add('done'); examZone(cz, z); };
    zones.appendChild(b);
  });
  // clicar num achado (⚠) registra a discrepância — feedback estilo Papers Please
  $('exam-log').onclick = (e) => {
    const el = e.target.closest && e.target.closest('.anomalia[data-tell]');
    if (!el || el.classList.contains('flagged')) return;
    el.classList.add('flagged');
    cz.evidence = true; $('btn-detain').disabled = false;
    const tag = document.createElement('div');
    tag.className = 'exam-detected';
    tag.textContent = '⚠ ' + T('DISCREPÂNCIA DETECTADA — anotada no laudo. Detenção autorizada.');
    $('exam-log').appendChild(tag); $('exam-log').scrollTop = $('exam-log').scrollHeight;
    try { sfx('ding'); } catch (e2) {}
  };
  $('exam-overlay').classList.add('active');
}
function examZone(cz, zone) {
  const log = $('exam-log');
  // a mini-cena da zona: aproximar, obedecer à ordem, segurar o olhar
  if (window.examZoneSVG) {
    try { $('exam-face-svg').innerHTML = examZoneSVG(cz.features, cz.phys, zone.id); } catch (e) {}
  }
  cz._examLogged = cz._examLogged || {};
  if (cz._examLogged[zone.id]) return; // rever a cena é grátis; o laudo só entra uma vez
  cz._examLogged[zone.id] = true;
  if (zone.body) { // CORPO: volume oculto + assinatura térmica + biotipo
    let line = cz.phys.concealed
      ? `<div class="anomalia" data-tell="corpo">⚠ ${T('Volume denso oculto sob o casaco — algo que não consta na declaração. Reviste a bagagem.')}</div>`
      : `<div class="obs">${T('Nada oculto sob as roupas. Só um corpo com frio.')}</div>`;
    if (cz.sexMismatch) {
      const decl = cz.sexo === 'f' ? T('feminino') : T('masculino');
      const real = cz.features.bodySex === 'f' ? T('feminino') : T('masculino');
      line += `<div class="anomalia" data-tell="biotipo">⚠ ${T('Biotipo corporal não confere: ombros, quadril e densidade óssea indicam sexo')} ${real}. ${T('O passaporte declara')} ${decl}.</div>`;
    }
    if (cz.phys.pescoco) line += `<div class="anomalia" data-tell="pescoco">⚠ ${T('Assinatura térmica fraca demais. Este corpo está frio para estar vivo.')}</div>`;
    log.innerHTML += line; log.scrollTop = log.scrollHeight; return;
  }
  const rum = rumorForDay(S.day);
  zone.tells.forEach(t => {
    const tellDef = TELLS[t];
    const anômalo = cz.phys[t];
    let line = anômalo ? `<div class="anomalia" data-tell="${t}">⚠ ${T(tellDef.achado)}</div>` : `<div class="obs">${T(tellDef.normal)}</div>`;
    if (anômalo && rum && rum.tell === t) {
      if (rum.official) {
        cz.softEndorsed = true; cz.evidence = true;
        $('btn-detain').disabled = false;
        line += `<div class="anomalia endossada">→ ${T('INDICADOR OFICIAL EM VIGOR (comunicado de hoje). Detenção autorizada — a máquina do Estado confia em você.')}</div>`;
        sfx('ding');
      } else {
        line += `<div class="obs">→ ${T('coincide com o boato de hoje. Sem valor legal. (Ainda.)')}</div>`;
      }
    }
    log.innerHTML += line;
  });
  log.scrollTop = log.scrollHeight;
}

/* ---------- O SILENTE ----------
   Ele vem duas vezes por campanha. Não adianta scanner, guarda ou arma.
   As regras (o amigo do Dario avisa na véspera):
   1. NÃO olhe de perto (exame físico = fim).
   2. NÃO chame ninguém (deter = fim — e o biológico vai TENTAR te convencer).
   3. NÃO demore (35 minutos sem carimbar = fim).
   Carimbe qualquer coisa. E deixe ir. */
/* silenteSVG() também vive em faces.js — o retrato dele é o único que o
   motor deixa deliberadamente ERRADO (rosto longo demais, olhos sem fundo,
   o VHS rasgando em cima). */
function makeSilente() {
  const cz = makeCitizen(S.day, { forceValid: true, pais: 'osteria' });
  cz.isSilente = true;
  cz.isAlternado = false; cz.isForger = false;
  cz.discrepancies = []; cz.bag = [{ txt: 'Não há bagagem.', fid: 'bag.0', desc: 'Nunca houve.' }];
  cz.nome = '———';
  cz.docs = { pass: { tipo: 'PASSAPORTE', id: 'pass', color: '#101012', nome: '———', nasc: cz.nasc, sexo: '—', paisNome: '—', cidade: '—', numero: '—————', validade: cz.docs.pass.validade, selo: ' ', reval: null } };
  cz.arrivedAt = shift.clock;
  return cz;
}
function presentSilente(cz) {
  $('npc-portrait').innerHTML = silenteSVG();
  $('npc-actor').className = 'silente';
  if (window.applyActorPhoto) applyActorPhoto(cz);
  document.body.classList.add('silente-present');
  queueAdvance();
  $('npc-name').textContent = '———';
  $('speech').textContent = 'Ele não entrega os documentos. Eles já estavam na bandeja quando você olhou.';
  $('talk-log').innerHTML = '';
  $('ask-row').innerHTML = '';
  $('radio-line').textContent = '‹estática›';
  layDocs(cz);
  sfx('silente');
}
function silenteGameOver() {
  document.body.classList.remove('silente-present');
  finishGame('silente');
}
function silenteLeaves(cz) {
  document.body.classList.remove('silente-present');
  S.flags.silenteSurvived = (S.flags.silenteSurvived || 0) + 1;
  S.pendingNews.push({ day: S.day + 1, text: T('Nenhum registro de entrada consta do posto leste entre 10h e 11h de ontem. O livro de ponto mostra uma linha em branco que ninguém lembra de ter pulado.') });
}

/* ---------- LINHA DA VIDA ----------
   A linha não responde nada. Ela apenas mostra. */
function buildLifeline(cz) {
  if (cz.lifeline) return cz.lifeline;
  const y0 = cz.nasc.y;
  const now = worldDate(S.day).y;
  const ev = [];
  const add = (ano, txt, marca) => { if (ano <= now) ev.push({ ano, txt, marca }); };
  add(y0, `${T('Nascimento — ')}${cz.docs.pass ? cz.docs.pass.cidade : cz.cidade}, ${COUNTRIES[cz.pais].name}`);
  add(y0 + 7, T('Escola primária (registro padrão)'));
  const trab = y0 + ri(14, 19);
  add(trab, `${T('Primeiro trabalho — ')}${T(cz.profissao)}`);
  if (cz.sexo === 'm' && ['krestov', 'osteria', 'taranstan'].includes(cz.pais)) add(y0 + 18, T('Serviço militar obrigatório'));
  if (chance(.45) && cz.idade >= 24) add(y0 + ri(20, 28), T('Casamento (registro civil)'));
  if (chance(.5)) add(y0 + ri(19, Math.max(20, cz.idade - 2)), `${T('Mudança de residência — ')}${pick(COUNTRIES[cz.pais].cities)}`);
  if (cz.docs.sanitaria) add(now - ri(0, 2), T('Vacinação registrada (B-7, K-12, TRIV)'));
  if (cz.docs.work) add(now - ri(0, 1), `${T('Contrato de trabalho — ')}${T(cz.profissao)}`);
  add(now, `${T('Chega ao Posto Nº 7 — motivo declarado: ')}${T(cz.motivoLabel).toLowerCase()}`);
  // a lacuna: culpados têm, mas inocentes também. guerras comem cartórios.
  const temLacuna = (cz.isAlternado || cz.isForger) ? chance(.5) : chance(.15);
  if (temLacuna && cz.idade >= 26) {
    const dur = ri(4, 9);
    const ini = y0 + ri(19, Math.max(20, cz.idade - dur - 1));
    ev.push({ ano: ini, txt: `${T('— REGISTROS AUSENTES: ')}${dur}${T(' anos —')}`, marca: true, fim: ini + dur });
  }
  ev.sort((a, b) => a.ano - b.ano);
  cz.lifeline = ev;
  return ev;
}
function openLifeline() {
  const cz = shift.citizen;
  if (!cz || !shift.running) return;
  if (!cz.lifeDone) { spendTime(10); cz.lifeDone = true; }
  const ev = buildLifeline(cz);
  let html = '<div class="ll-list">';
  ev.forEach(e => {
    html += `<div class="ll-item${e.marca ? ' ll-gap' : ''}"><span class="ll-ano">${e.ano}${e.fim ? '–' + e.fim : ''}</span><span>${e.txt}</span></div>`;
  });
  html += `</div><div class="ll-foot">${T('Uma lacuna pode ser um crime. Uma guerra. Uma infiltração. Ou um cartório que pegou fogo. A linha não responde nada — ela apenas mostra.')}</div>`;
  $('modal-title').textContent = `${T('LINHA DA VIDA')} — ${cz.nome}`;
  $('modal-body').innerHTML = html;
  const box = $('modal-actions'); box.innerHTML = '';
  const b = document.createElement('button');
  b.textContent = T('FECHAR');
  b.onclick = () => $('modal-overlay').classList.remove('active');
  box.appendChild(b);
  $('modal-overlay').classList.add('active');
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
  const nasc = randomDateAround(day, -20000, -6600);
  const idade = Math.floor((worldDate(day).ts - nasc.ts) / 31557600000);
  const features = genFeatures(sexo, idade, etnia);
  // roupa: soldados sempre de uniforme; alguns homens são oficiais/guardas;
  // senão, civil com cachecol ocasional (fronteira fria). Coerente com o país.
  if (!opts.features) {
    const us = UNIFORM_STYLES[pais] || UNIFORM_STYLES._default;
    if (profissao === 'soldado' || (sexo === 'm' && idade >= 22 && chance(.07))) {
      features.uniform = true;
      features.uniformColor = us.color; features.uniformTrim = us.trim; features.seal = c.seal;
      features.hat = chance(.55) ? 3 : 0;          // boné militar às vezes
      features.beard = features.beard === 1 ? 0 : features.beard; // tropa raspada
    } else if (!features.hat && chance(.4)) {
      features.scarf = pick(SCARF_COLORS);
    }
  }

  const cz = {
    nome, sexo, pais, etnia, profissao, cidade,
    motivo: motivoObj.id, motivoLabel: motivoObj.label, duracao: pick(motivoObj.dur),
    destino: pick(COUNTRIES.osteria.cities),
    features: opts.features || features, photoFeatures: opts.features || features, nasc, idade,
    returning: opts.returning || null,
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

  // DISFARCE DE SEXO: rosto e documento passam perfeitamente por um sexo,
  // mas o corpo é do outro. Só o scanner corporal denuncia (ombros, quadril,
  // densidade óssea). Fraude de identidade — deter/rejeitar é o correto.
  if (!opts.encounter && !opts.forceValid && !cz.returning && !cz.isWanted && idade >= 18 && chance(.06)) {
    cz.features.bodySex = cz.sexo === 'f' ? 'm' : (chance(.7) ? 'f' : 'm');
    if (cz.features.bodySex !== cz.sexo) {
      cz.sexMismatch = true;
      cz.features.build = cz.features.bodySex === 'm' ? pick([1, 2, 2]) : pick([0, 0, 1]); // corpo condiz com o sexo real
      cz.discrepancies.push({ type: 'impostor', fids: ['doc.pass.sexo'], desc: T('Biotipo corporal não corresponde ao sexo declarado') });
    } else { delete cz.features.bodySex; }
  }

  // ACOMPANHANTES: famílias cruzam a fronteira. ~5% trazem uma criança
  // agarrada ao lado, ~5% um bebê de colo. (não para soldados/procurados/
  // encontros roteirizados/quem já volta.)
  if (!opts.encounter && !opts.forceValid && !cz.returning && !cz.isWanted && !cz.features.uniform && idade >= 18 && idade <= 55) {
    const cr = rnd();
    let comp = null;
    if (cr < 0.05) {
      const csex = chance(.5) ? 'm' : 'f';
      const cf = genFeatures(csex, ri(4, 10), etnia);
      comp = { kind: 'child', sexo: csex, feat: { skin: cf.skin, hair: cf.hair }, coat: pick(COAT_COLORS), side: chance(.5) ? -1 : 1, idade: cf.idade, nome: fullName(pais, csex) };
    } else if (cr < 0.10) {
      const bsex = chance(.5) ? 'm' : 'f';
      const bf = genFeatures(bsex, ri(0, 1), etnia);
      comp = { kind: 'baby', sexo: bsex, feat: { skin: bf.skin, hair: bf.hair }, nome: fullName(pais, bsex) };
    }
    if (comp) {
      // ACOMPANHANTE ALTERNADO: raro e perturbador — uma criança de pupilas
      // em fenda no colo. O adulto pode ser humano; a ameaça vem junto.
      if (chance(.12)) {
        comp.anom = {};
        if (chance(.7)) comp.anom.slitPupil = true;
        if (chance(.6)) comp.anom.blackSclera = true;
        if (!comp.anom.slitPupil && !comp.anom.blackSclera) comp.anom.slitPupil = true;
        comp.anom.skinShift = 0.5 + rnd() * 0.38;
        cz.companionAlt = true;
        cz.discrepancies.push({ type: 'harbor', fids: ['npc.companion'], desc: T('Acompanhante apresenta sinais não-humanos') });
      }
      // REGISTRO DE MENOR: a maioria carrega; a falta é violação quando a
      // regra do dia exige (separar famílias por papelada).
      if (chance(.82)) {
        cz.docs.menor = { tipo: 'REGISTRO DE MENOR', id: 'menor', color: '#2b2f3a', nome: comp.nome, relacao: comp.kind === 'baby' ? T('lactente') : T('menor'), responsavel: cz.nome, carimbo: '§' };
      }
      cz.companion = comp;
    }
  }

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
    if (cz.phys) cz.phys.concealed = true; // o scanner de corpo consegue vê-lo antes de abrir a mala
  }
  // embaralha
  for (let i = cz.bag.length - 1; i > 0; i--) { const j = ri(0, i); [cz.bag[i], cz.bag[j]] = [cz.bag[j], cz.bag[i]]; }
}

/* ---------- BAGAGEM: objetos desenhados na mala ---------- */
/* infere o tipo de objeto a partir das palavras do item (as chaves são
   sempre em PT, mesmo em EN/ES — a tradução é só na exibição). */
function bagKind(txt, contra) {
  const t = txt.toLowerCase();
  if (/passaporte/.test(t)) return 'passports';
  if (/carimbo/.test(t)) return 'stamp';
  if (/frasco|remédio|líquido|âmbar|receita médica/.test(t)) return 'vial';
  if (/peças metálicas|montad/.test(t)) return 'gears';
  if (/ferramenta|solda|luvas/.test(t)) return 'tools';
  if (/fotografia|álbum|foto/.test(t)) return 'photo';
  if (/pão|bolo|mel/.test(t)) return 'food';
  if (/relógio/.test(t)) return 'watch';
  if (/terço/.test(t)) return 'rosary';
  if (/radiografia/.test(t)) return 'xray';
  if (/passagem|trem/.test(t)) return 'ticket';
  if (/mapa|rota/.test(t)) return 'map';
  if (/chave/.test(t)) return 'key';
  if (/aliança/.test(t)) return 'ring';
  if (/brinquedo/.test(t)) return 'toy';
  if (/uniforme/.test(t)) return 'uniform';
  if (/escritura|carta|recomendação|diário|endereços/.test(t)) return 'papers';
  if (/livro|caderno/.test(t)) return 'book';
  if (/roupa|meias|muda|presente|manta|lã/.test(t)) return 'clothing';
  return contra ? 'vial' : 'bundle';
}
function drawBagIcon(kind, contra) {
  const S = 2, cv = document.createElement('canvas'); cv.width = 64 * S; cv.height = 64 * S;
  const x = cv.getContext('2d'); x.scale(S, S);
  const R = (a, b, w, h, c) => { x.fillStyle = c; x.fillRect(a, b, w, h); };
  const line = (x1, y1, x2, y2, c, w) => { x.strokeStyle = c; x.lineWidth = w || 1; x.beginPath(); x.moveTo(x1, y1); x.lineTo(x2, y2); x.stroke(); };
  const shadow = () => { const g = x.createRadialGradient(32, 54, 2, 32, 54, 22); g.addColorStop(0, 'rgba(0,0,0,.34)'); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.beginPath(); x.ellipse(32, 54, 20, 4, 0, 0, 6.29); x.fill(); };
  shadow();
  const INK = '#2a2620', WOOD = '#6b5236', METAL = '#9a9f98';
  switch (kind) {
    case 'photo': {
      x.save(); x.translate(32, 30); x.rotate(-0.08);
      R(-16, -18, 32, 38, '#e9e2cd'); R(-13, -15, 26, 26, '#6b7a86'); // moldura + imagem
      x.fillStyle = '#3a4650'; x.beginPath(); x.arc(0, 0, 6, Math.PI, 0); x.fill(); x.fillRect(-6, 0, 12, 8); // silhueta
      x.fillStyle = 'rgba(20,12,6,.85)'; x.beginPath(); x.moveTo(6, -15); x.lineTo(13, -15); x.lineTo(13, -8); x.closePath(); x.fill(); // canto queimado
      x.restore(); break;
    }
    case 'food': {
      x.fillStyle = '#b98b4e'; x.beginPath(); x.ellipse(32, 34, 18, 11, 0, 0, 6.29); x.fill();
      x.fillStyle = '#a2763d'; x.beginPath(); x.ellipse(32, 36, 18, 10, 0, 0, 6.29); x.fill();
      x.strokeStyle = 'rgba(60,36,16,.5)'; x.lineWidth = 1; for (const dx of [-8, 0, 8]) { x.beginPath(); x.moveTo(32 + dx, 26); x.lineTo(32 + dx + 2, 30); x.stroke(); }
      x.fillStyle = 'rgba(255,240,200,.25)'; x.beginPath(); x.ellipse(26, 30, 6, 2, -0.3, 0, 6.29); x.fill(); break;
    }
    case 'watch': {
      x.fillStyle = '#8a7326'; x.beginPath(); x.arc(32, 34, 13, 0, 6.29); x.fill();
      x.fillStyle = '#d8d2bd'; x.beginPath(); x.arc(32, 34, 10, 0, 6.29); x.fill();
      x.strokeStyle = INK; line(32, 34, 32, 27, INK, 1.4); line(32, 34, 37, 34, INK, 1.4);
      x.fillStyle = '#8a7326'; x.fillRect(30, 18, 4, 4); // coroa
      x.strokeStyle = '#8a7326'; x.lineWidth = 1; x.beginPath(); x.arc(44, 20, 5, 0.4, 3.6); x.stroke(); break; // corrente
    }
    case 'tools': {
      x.save(); x.translate(32, 34); x.rotate(0.5);
      x.strokeStyle = METAL; x.lineWidth = 4; x.lineCap = 'round'; line(-14, 0, 14, 0, METAL, 5);
      x.fillStyle = METAL; x.beginPath(); x.arc(-14, 0, 5, 0, 6.29); x.fill(); x.beginPath(); x.arc(14, 0, 5, 0, 6.29); x.fill();
      x.fillStyle = '#3a3f3a'; x.beginPath(); x.arc(-14, 0, 2, 0, 6.29); x.fill(); x.beginPath(); x.arc(14, 0, 2, 0, 6.29); x.fill();
      x.restore(); R(20, 40, 16, 8, '#5a4632'); break; // pano oleoso
    }
    case 'vial': {
      const cols = contra ? ['#c98b2a', '#b5701e'] : ['#7a8a5a', '#9aa86a'];
      [[24, cols[0]], [34, cols[1]], [44, cols[0]]].forEach(([vx, c], i) => {
        R(vx - 3.5, 22, 7, 22, '#2a2a26'); R(vx - 3, 26, 6, 17, c); // vidro + líquido
        R(vx - 2, 19, 4, 4, '#6a6a60'); // rolha
        x.fillStyle = 'rgba(255,255,255,.18)'; x.fillRect(vx - 2.5, 27, 1.4, 12);
      });
      if (contra) { x.strokeStyle = 'rgba(200,60,50,.7)'; x.lineWidth = 1; x.strokeRect(18, 18, 28, 28); }
      break;
    }
    case 'gears': {
      const gear = (gx, gy, r) => { x.fillStyle = METAL; x.beginPath(); for (let a = 0; a < 6.29; a += 0.52) { const rr = (Math.floor(a / 0.26) % 2) ? r : r * 0.76; x.lineTo(gx + Math.cos(a) * rr, gy + Math.sin(a) * rr); } x.closePath(); x.fill(); x.fillStyle = '#2a2e2a'; x.beginPath(); x.arc(gx, gy, r * 0.35, 0, 6.29); x.fill(); };
      gear(27, 32, 10); gear(41, 40, 7);
      x.strokeStyle = 'rgba(200,60,50,.7)'; x.lineWidth = 1; x.strokeRect(16, 18, 32, 30); break;
    }
    case 'book': {
      x.save(); x.translate(32, 33); x.rotate(-0.06);
      R(-15, -19, 30, 38, contra ? '#5a2f2a' : '#5b4a34'); R(13, -18, 3, 36, '#e6ddc4'); // capa + miolo
      R(-12, -16, 22, 3, 'rgba(255,240,200,.14)'); x.restore(); break;
    }
    case 'papers': {
      for (let i = 0; i < 3; i++) { x.save(); x.translate(32, 32); x.rotate((i - 1) * 0.14); R(-14, -17, 28, 34, i === 1 ? '#e9e2cd' : '#d6ccb2'); x.restore(); }
      x.strokeStyle = 'rgba(40,32,20,.4)'; x.lineWidth = 0.8; for (let i = 0; i < 5; i++) line(22, 24 + i * 4, 42, 24 + i * 4, 'rgba(40,32,20,.4)', 0.8); break;
    }
    case 'ticket': {
      x.save(); x.translate(32, 34); x.rotate(-0.1);
      R(-18, -8, 36, 16, '#d8cba0'); x.strokeStyle = INK; x.setLineDash([2, 2]); line(6, -8, 6, 8, INK, 1); x.setLineDash([]);
      x.fillStyle = INK; x.font = 'bold 6px monospace'; x.fillText('SÓ IDA', -15, 2); x.restore(); break;
    }
    case 'map': {
      x.save(); x.translate(32, 33);
      R(-17, -14, 34, 28, '#cabfa0'); x.strokeStyle = 'rgba(40,32,20,.35)'; x.lineWidth = 0.8;
      line(-17, -4, 17, -4, 'rgba(40,32,20,.3)', 0.8); line(-17, 5, 17, 5, 'rgba(40,32,20,.3)', 0.8); line(-6, -14, -6, 14, 'rgba(40,32,20,.3)', 0.8); line(6, -14, 6, 14, 'rgba(40,32,20,.3)', 0.8); // vincos
      x.strokeStyle = '#8a2f2a'; x.lineWidth = 1.2; x.setLineDash([2, 2]); x.beginPath(); x.moveTo(-12, 8); x.quadraticCurveTo(0, -6, 12, -10); x.stroke(); x.setLineDash([]); x.restore(); break;
    }
    case 'key': {
      x.save(); x.translate(28, 30); x.rotate(0.7);
      x.strokeStyle = '#b8912e'; x.lineWidth = 3; line(0, 0, 0, 22, '#b8912e', 3);
      x.fillStyle = '#b8912e'; x.beginPath(); x.arc(0, -3, 6, 0, 6.29); x.fill(); x.fillStyle = '#2a2620'; x.beginPath(); x.arc(0, -3, 2.4, 0, 6.29); x.fill();
      R(-1, 16, 6, 3, '#b8912e'); R(-1, 21, 4, 3, '#b8912e'); x.restore(); break;
    }
    case 'ring': {
      R(22, 28, 20, 14, '#5b4a34'); R(24, 30, 16, 3, '#2a2620'); // caixinha
      x.strokeStyle = '#d8c86a'; x.lineWidth = 2; x.beginPath(); x.arc(32, 28, 5, 0, 6.29); x.stroke();
      x.fillStyle = '#e8f0ff'; x.beginPath(); x.arc(32, 23, 1.8, 0, 6.29); x.fill(); break;
    }
    case 'toy': {
      x.fillStyle = '#7a5a3a'; x.beginPath(); x.moveTo(32, 20); x.lineTo(43, 38); x.lineTo(21, 38); x.closePath(); x.fill(); // pião
      x.fillStyle = '#5a4028'; x.fillRect(31, 38, 2, 6); x.strokeStyle = 'rgba(255,240,200,.2)'; line(26, 30, 38, 30, 'rgba(230,200,150,.4)', 1.4); break;
    }
    case 'stamp': {
      R(28, 20, 8, 16, '#3a352b'); R(24, 34, 16, 6, WOOD); R(22, 40, 20, 4, '#2a2620'); // cabo + base
      x.fillStyle = '#8a2f2a'; x.beginPath(); x.arc(32, 15, 4, 0, 6.29); x.fill(); break;
    }
    case 'xray': {
      R(20, 18, 26, 30, '#20303a'); x.fillStyle = 'rgba(180,200,210,.5)'; // filme
      x.beginPath(); x.ellipse(33, 30, 6, 9, 0, 0, 6.29); x.fill(); // crânio/tórax fantasma
      x.strokeStyle = 'rgba(180,200,210,.4)'; x.lineWidth = 0.8; for (let i = 0; i < 4; i++) { x.beginPath(); x.arc(33, 40, 4 + i * 2, Math.PI, 0); x.stroke(); } break;
    }
    case 'passports': {
      for (let i = 0; i < 3; i++) { x.save(); x.translate(32, 26 + i * 6); x.rotate((i - 1) * 0.1); R(-13, -9, 26, 18, contra ? '#3a2f2f' : ['#3d5a46', '#4a3f52', '#5a2f2a'][i]); x.fillStyle = '#b8912e'; x.beginPath(); x.arc(0, 0, 3, 0, 6.29); x.fill(); x.restore(); }
      if (contra) { x.strokeStyle = 'rgba(200,60,50,.7)'; x.lineWidth = 1; x.strokeRect(16, 14, 32, 30); } break;
    }
    case 'uniform': {
      R(20, 24, 24, 22, '#4a4e42'); // dobrado
      x.fillStyle = '#3a3e34'; x.fillRect(20, 24, 24, 4); x.strokeStyle = 'rgba(0,0,0,.3)'; line(32, 24, 32, 46, 'rgba(0,0,0,.3)', 1);
      x.fillStyle = '#6a6e5a'; x.fillRect(24, 30, 4, 3); x.fillRect(36, 30, 4, 3); break; // sem insígnia
    }
    case 'clothing': {
      ['#6a6252', '#7a7060', '#585044'].forEach((c, i) => { R(20, 40 - i * 7, 24, 7, c); x.fillStyle = 'rgba(255,255,255,.05)'; x.fillRect(20, 40 - i * 7, 24, 1.5); }); break;
    }
    case 'rosary': {
      x.strokeStyle = '#5a4630'; x.lineWidth = 1; x.beginPath(); x.arc(32, 30, 11, 0.3, 6.0); x.stroke();
      x.fillStyle = '#7a5a3a'; for (let a = 0.3; a < 6; a += 0.5) { x.beginPath(); x.arc(32 + Math.cos(a) * 11, 30 + Math.sin(a) * 11, 1.6, 0, 6.29); x.fill(); }
      x.strokeStyle = '#8a6a40'; x.lineWidth = 2; line(32, 41, 32, 50, '#8a6a40', 2); line(29, 45, 35, 45, '#8a6a40', 2); break; // cruz
    }
    default: { // trouxa / embrulho genérico
      x.fillStyle = '#5a4a36'; x.beginPath(); x.moveTo(18, 44); x.lineTo(22, 26); x.lineTo(42, 26); x.lineTo(46, 44); x.closePath(); x.fill();
      x.strokeStyle = 'rgba(0,0,0,.3)'; x.lineWidth = 1; line(24, 26, 26, 44, 'rgba(0,0,0,.25)', 1); line(32, 26, 32, 44, 'rgba(0,0,0,.25)', 1); line(40, 26, 38, 44, 'rgba(0,0,0,.25)', 1);
      x.fillStyle = '#4a3c2a'; x.beginPath(); x.moveTo(20, 26); x.quadraticCurveTo(32, 20, 44, 26); x.lineTo(42, 28); x.quadraticCurveTo(32, 23, 22, 28); x.closePath(); x.fill(); break;
    }
  }
  return cv;
}

/* ---------- BAGAGEM: UI ---------- */
function openBag() {
  const cz = shift.citizen;
  if (!cz || !shift.running) return;
  if (!cz.bagDone) { spendTime(10); cz.bagDone = true; }
  const box = $('bag-items'); box.innerHTML = '';
  const empty = cz.bag.length === 1 && /Não há bagagem|Nunca houve/.test(cz.bag[0].txt || '');
  cz.bag.forEach(item => {
    const el = document.createElement('div');
    el.className = 'bag-item' + (item.contra ? ' contra' : '');
    el.dataset.fid = item.fid;
    if (!empty) {
      const ico = drawBagIcon(bagKind(item.txt || '', item.contra), item.contra);
      ico.className = 'bag-ico'; el.appendChild(ico);
    }
    const cap = document.createElement('div'); cap.className = 'bag-cap';
    cap.innerHTML = T(item.txt) + (item.desc ? `<span class="bag-desc">${T(item.desc)}</span>` : '');
    el.appendChild(cap);
    el.onclick = () => {
      if (item.contra && !item.found) {
        item.found = true;
        el.classList.add('found');
        cz.evidence = true;
        $('btn-detain').disabled = false;
        cz.discrepancies.push({ type: 'contraband', fids: [item.fid], desc: T('Contrabando na bagagem'), confirmedNow: true });
        shift.confirmed.push(cz.discrepancies[cz.discrepancies.length - 1]);
        $('inspect-bar').textContent = T('⚠ CONTRABANDO ENCONTRADO. Detenção autorizada.');
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
    const tellDef = TELLS[t];
    let p = tellDef.humanBase + ((cz.nervous || chance(.2)) ? tellDef.confound : 0);
    if (cz.isAlternado) p += tellDef.altBonus;
    cz.phys[t] = chance(Math.min(p, .95));
  });
  // ANOMALIAS VISÍVEIS (só Alternados) — espectro: a maioria passa por
  // humana; alguns têm UM sinal visível ao vivo; poucos são claramente
  // não-humanos. Nunca aparecem na foto do documento (só ao vivo/exame).
  cz.anom = {};
  if (cz.isAlternado) {
    const roll = rnd();
    if (roll < 0.42) {
      // sutil: nada visível — a ambiguidade que o jogo defende
    } else if (roll < 0.80) {
      const which = pick(['skin', 'smile', 'teeth', 'eyes', 'smile']);
      if (which === 'skin') { cz.anom.skinShift = 0.55 + rnd() * 0.28; cz.phys.pele = true; }
      else if (which === 'smile') { cz.anom.smile = 0.55 + rnd() * 0.5; if (chance(.6)) { cz.anom.teethBright = true; cz.phys.dentes = true; } }
      else if (which === 'teeth') { cz.anom.teethBright = true; cz.phys.dentes = true; cz.anom.smile = 0.4 + rnd() * 0.3; }
      else { cz.anom.deadStare = true; cz.phys.piscar = true; }
    } else {
      // CLARAMENTE NÃO-HUMANO — vários sinais somados, e agora sinais que
      // NENHUM humano tem: pupila em fenda e/ou esclera preta. Inequívoco.
      cz.anom.skinShift = 0.7 + rnd() * 0.28;
      cz.anom.deadStare = true;
      cz.anom.smile = 0.9 + rnd() * 0.5; cz.anom.teethBright = true;
      cz.anom.clearlyNonHuman = true;
      if (chance(.7)) cz.anom.slitPupil = true;
      if (chance(.6)) cz.anom.blackSclera = true;
      if (!cz.anom.slitPupil && !cz.anom.blackSclera) cz.anom.slitPupil = true; // garante ao menos um sinal alienígena
      cz.phys.piscar = true; cz.phys.pescoco = true; cz.phys.pele = true; cz.phys.dentes = true; cz.phys.olhos = true;
    }
  }
  cz.phys.anom = cz.anom;   // o exame lê as anomalias por aqui
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
  // EXIGÊNCIAS ESPECÍFICAS POR PAÍS — o documento existe só quando a regra do
  // dia o pede e o portador é do país-alvo. Às vezes falta (violação).
  if (rules.includes('ticketLinestan') && cz.pais === 'linestan' && chance(.85)) {
    cz.docs.ticket = { tipo: 'BILHETE DE ENTRADA', id: 'ticket', color: '#2f2f4a', nome: cz.nome, numero: `LI-B${ri(1000, 9999)}`, origem: 'Linestan', assento: pick(['A', 'B', 'C']) + ri(1, 40), selo: '⬢' };
  }
  if (rules.includes('transitFrimia') && cz.pais === 'frimia' && chance(.85)) {
    cz.docs.transito = { tipo: 'VISTO DE TRÂNSITO', id: 'transito', color: '#26404a', nome: cz.nome, numero: cz.docs.pass.numero, validade: randomDateAround(day, 5, 60), rota: pick(['Meridia→Valgrado', 'Cais Novo→Porto Cinza', 'Trinca→Delvina']), selo: '◉' };
  }
  if (rules.includes('inocBaharzad') && cz.pais === 'baharzad' && chance(.85)) {
    cz.docs.inoc = { tipo: 'CERT. DE INOCULAÇÃO', id: 'inoc', color: '#3a2f1a', nome: cz.nome, lote: `Q${ri(100, 999)}-${pick(['A', 'B', 'C'])}`, validade: randomDateAround(day, 15, 200), agente: 'SORO-9', carimbo: '☽' };
  }
}

function applyDisc(cz, type, day) {
  const d = cz.docs;
  const add = (t, fids, desc) => cz.discrepancies.push({ type: t, fids, desc });
  switch (type) {
    case 'expired': {
      const doc = d.perm && chance(.5) ? d.perm : d.pass;
      doc.validade = randomDateAround(day, -40, -1);
      add('expired', [doc.id + '.validade', 'clock'], `${T(doc.tipo)}${T(' expirado')}`);
      break;
    }
    case 'nameMismatch': {
      const alvo = d.ident || d.perm || d.work || d.sanitaria;
      if (!alvo) { applyDisc(cz, 'expired', day); return; }
      const c = COUNTRIES[cz.pais];
      let novo = cz.nome.split(' ')[0] + ' ' + pick(c.last);
      if (novo === cz.nome) novo = cz.nome.split(' ')[0] + ' ' + c.last[(c.last.indexOf(cz.nome.split(' ')[1]) + 1) % c.last.length];
      alvo.nome = novo;
      add('nameMismatch', ['pass.nome', alvo.id + '.nome'], T('Nomes divergentes entre documentos'));
      break;
    }
    case 'numberMismatch': {
      const alvo = d.perm || d.ident;
      if (!alvo) { applyDisc(cz, 'expired', day); return; }
      alvo.numero = `${COUNTRIES[cz.pais].prefix}-${ri(10000, 99999)}`;
      add('numberMismatch', ['pass.numero', alvo.id + '.numero'], T('Números de registro divergentes'));
      break;
    }
    case 'wrongSeal': {
      const outro = pick(COUNTRY_IDS.filter(k => k !== cz.pais));
      if (d.perm && chance(.5)) { d.perm.selo = COUNTRIES[outro].seal; add('wrongSeal', ['perm.selo', 'rb:osteria'], T('Selo incorreto na permissão')); }
      else { d.pass.selo = COUNTRIES[outro].seal; add('wrongSeal', ['pass.selo', 'rb:' + cz.pais], T('Selo nacional incorreto')); }
      break;
    }
    case 'invalidCity': {
      const outro = pick(COUNTRY_IDS.filter(k => k !== cz.pais));
      d.pass.cidade = pick(COUNTRIES[outro].cities);
      add('invalidCity', ['pass.cidade', 'rb:' + cz.pais], T('Cidade emissora inexistente no país'));
      break;
    }
    case 'photoMismatch': {
      cz.photoFeatures = mutateFeatures(cz.features);
      add('photoMismatch', ['pass.foto', 'npc.face'], T('Foto não confere com o portador'));
      break;
    }
    case 'sexMismatch': {
      d.pass.sexo = cz.sexo === 'm' ? 'f' : 'm';
      add('sexMismatch', ['pass.sexo', 'npc.face'], T('Sexo registrado não confere'));
      break;
    }
    case 'luggage': {
      // a mala desmente a boca — mas só se alguém abrir a mala
      if (!d.perm) { applyDisc(cz, 'expired', day); return; }
      cz.bagOneway = true;
      add('luggage', ['bag.oneway', 'perm.motivo'], T('Bagagem incompatível com o motivo declarado'));
      cz.discrepancies[cz.discrepancies.length - 1].latent = true;
      break;
    }
    case 'contradiction': {
      cz.lie = pick(['motivo', 'cidade', 'profissao']);
      const fid = cz.lie === 'motivo' ? (d.perm ? 'perm.motivo' : 'pass.nome') : cz.lie === 'cidade' ? 'pass.cidade' : (d.work ? 'work.profissao' : 'pass.nome');
      add('contradiction', ['talk.' + cz.lie, fid], T('Declaração contradiz os documentos'));
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
      v.push({ rule: r, desc: `${T('Entrada proibida: cidadão de ')}${COUNTRIES[cz.pais].name}` });
    }
  }
  if (!cz.docs.pass) v.push({ rule: 'pass', desc: T('Sem passaporte') });
  if (rules.includes('idOsteria') && cz.pais === 'osteria' && !cz.docs.ident) v.push({ rule: 'idOsteria', desc: T('Cidadão sem cartão de identidade') });
  if (rules.includes('entryPermit') && cz.pais !== 'osteria' && !cz.docs.perm) v.push({ rule: 'entryPermit', desc: T('Estrangeiro sem permissão de entrada') });
  if (rules.includes('workPermit') && cz.motivo === 'trabalho' && !cz.docs.work) v.push({ rule: 'workPermit', desc: T('Sem permissão de trabalho') });
  const needsHealth = rules.includes('healthAll') || (rules.includes('healthForeign') && cz.pais !== 'osteria');
  if (needsHealth && !cz.docs.sanitaria) v.push({ rule: 'health', desc: T('Sem carteira sanitária') });
  if (rules.includes('ancestry') && (cz.etnia === 'nulio' || cz.etnia === 'bahari') && !cz.docs.ancest) v.push({ rule: 'ancestry', desc: T('Sem certificado de ancestralidade (Édito nº 2)') });
  if (rules.includes('seloConselho') && cz.docs.pass && cz.docs.pass.reval === '—') v.push({ rule: 'seloConselho', desc: T('Documento sem selo de revalidação do Conselho') });
  // exigências específicas por país
  if (rules.includes('ticketLinestan') && cz.pais === 'linestan' && !cz.docs.ticket) v.push({ rule: 'ticketLinestan', desc: T('Cidadão de Linestan sem bilhete de entrada') });
  if (rules.includes('transitFrimia') && cz.pais === 'frimia' && !cz.docs.transito) v.push({ rule: 'transitFrimia', desc: T('Cidadão de Frimia sem visto de trânsito') });
  if (rules.includes('inocBaharzad') && cz.pais === 'baharzad' && !cz.docs.inoc) v.push({ rule: 'inocBaharzad', desc: T('Cidadão de Bahar-Zad sem certificado de inoculação') });
  if (rules.includes('minorPapers') && cz.companion && !cz.docs.menor) v.push({ rule: 'minorPapers', desc: T('Menor acompanhante sem registro') });
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
  approvedToday: 0, quotaRejects: 0, returnDone: false,
};

function startDay() {
  setRegimeClass(S.day);
  shift.clock = 480; shift.processed = 0; shift.citToday = 0;
  shift.citizen = null; shift.picks = []; shift.confirmed = [];
  shift.encounterDone = false; shift.whispered = false;
  shift.wantedName = null;
  shift.approvedToday = 0; shift.quotaRejects = 0; shift.returnDone = false;
  shift.stats = { a: 0, r: 0, d: 0 };
  withRng(hashSeed(S.seedBase, S.day, 'day'), () => {
    shift.queueSize = queueSizeForDay(S.day);

    if (WANTED_DAYS[S.day]) {
      const p = pick(COUNTRY_IDS);
      shift.wantedName = fullName(p, chance(.5) ? 'm' : 'f');
      shift.wantedPais = p;
      shift.wantedSlot = ri(2, Math.max(3, shift.queueSize - 3));
    }
    shift.silenteSlot = (S.silenteDays || []).includes(S.day) ? ri(2, Math.max(3, shift.queueSize - 2)) : -1;
  });

  $('shift-day').textContent = `${T('DIA')} ${S.day} — ${T(REGIME_LABEL[regimeOfDay(S.day)])}`;
  renderRulebook();
  updateHud();
  clearDesk();
  $('npc-name').textContent = '—';
  $('speech').textContent = '';
  $('talk-log').innerHTML = '';
  $('ask-row').innerHTML = '';
  $('scan-result').textContent = '';
  $('npc-portrait').innerHTML = ''; if (window.clearActorPhoto) clearActorPhoto(); $('npc-actor').className = '';
  $('btn-scan-bio').style.display = S.day >= 10 ? '' : 'none';
  $('btn-reject').classList.toggle('hidden', S.day >= 47);
  $('btn-detain').classList.toggle('hidden', S.day >= 47);
  showScreen('screen-shift');
  showBulletin(() => {
    if (S.day >= 48) { enterMirror48(); return; } // o último dia não tem fila. tem você.
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
  let t = SCRIPTED_BULLETIN[S.day] ? T(SCRIPTED_BULLETIN[S.day])
    : `${T('Posto Nº 7 — Dia')} ${S.day}${T('.\n\nAplique o regulamento em vigor (painel à direita). Discrepâncias devem ser confirmadas via INSPEÇÃO antes de justificar detenção.')}`;
  if (shift.wantedName) t += `${T('\n\n★ PROCURADO(A) HOJE: ')}${shift.wantedName} (${COUNTRIES[shift.wantedPais].name}${T('). DETER à vista.')}`;
  const qd = quotaForDay(S.day);
  if (qd !== Infinity) t += `${T('\n\n§ COTA DE ADMISSÃO DE HOJE: ')}${qd}${T(' entradas. Esgotada a cota, o Ministério BLOQUEIA novas aprovações — rejeite mesmo quem estiver em ordem.')}`;
  if (S.day === 13) t += `${T('\n\n§ REAJUSTE PATRIÓTICO: ')}${MOEDA} 6${T(' por decisão correta. O Estado Nacional cuida dos seus.')}`;
  if (S.day === 31) t += `${T('\n\n§ O CONSELHO VALORIZA O TRABALHADOR: ')}${MOEDA} 8${T(' por decisão correta. (Nota: o aluguel do espaço requisitado passa a ')}${MOEDA} 25.)`;
  const rum = rumorForDay(S.day);
  if (rum) t += rum.official
    ? `${T('\n\n§ INDICADOR FÍSICO EM VIGOR: ')}${T(rum.text)}${T('\nAnomalia correspondente registrada em EXAME FÍSICO autoriza detenção.')}`
    : `${T('\n\n✎ (rabiscado a lápis na margem, por alguém do turno anterior)\n"')}${T(rum.text)}"`;
  return t;
}
function showBulletin(fn) {
  modal(`${T('COMUNICADO OFICIAL — DIA')} ${S.day}`, bulletinText(), [{ label: 'ASSINAR CIÊNCIA', fn }]);
}

function tickClock() {
  if (!shift.running) return;
  // modo arquivista: o relógio não avança sozinho, só com o uso de
  // ferramentas (spendTime) — sem pressão de tempo real, a fila continua finita
  if (!SETTINGS.archivist) shift.clock += 2;
  // demorar diante dele é a terceira forma de perder
  if (shift.citizen && shift.citizen.isSilente && shift.clock - shift.citizen.arrivedAt >= 35) { silenteGameOver(); return; }
  if (shift.clock >= 1080) { shift.clock = 1080; endShift(); return; }
  updateHud();
}
function spendTime(min) { shift.clock = Math.min(1080, shift.clock + min); updateHud(); }
function updateHud() {
  const h = Math.floor(shift.clock / 60), m = shift.clock % 60;
  const hhmm = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  $('clock').textContent = `${hhmm}${SETTINGS.archivist ? ' ⏸' : ''} · ${fmtDate(worldDate(S.day))}`;
  const bc = $('booth-clock'); if (bc) bc.textContent = hhmm;
  const q = quotaForDay(S.day);
  const qStr = q === Infinity ? '∞' : q;
  $('processed-count').textContent = SETTINGS.lang === 'en'
    ? `Queue: ${shift.processed}/${shift.queueSize} · Admitted: ${shift.approvedToday}/${qStr}`
    // "Fila"/"Admitidos" são as mesmas palavras em espanhol — sem branch extra
    : `Fila: ${shift.processed}/${shift.queueSize} · Admitidos: ${shift.approvedToday}/${qStr}`;
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
    if (!radioOn) txt = T('‹desligado›');
    else if (S.day >= 47) txt = T('— silêncio. nem estática. silêncio. —');
    else txt = T(pick(RADIO[regimeOfDay(S.day)] || RADIO.republica));
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
  if (!SFX_ON) return;
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
const SCARF_COLORS = ['#8c4a3a', '#4a6a52', '#7a3a3a', '#3a5a78', '#9a7a38', '#6a4a6a', '#a86a44', '#5a6a4a'];
/* faces.js lê scarf como [r,g,b]; converte os hex acima quando preciso. */
/* Paletas de uniforme por país (cor do pano + vivo/insígnia) — o "soviético" da lore. */
const UNIFORM_STYLES = {
  _default:   { color: [60, 68, 50], trim: [150, 44, 36] },  // verde-campo, vivo vermelho
  osteria:    { color: [58, 66, 48], trim: [120, 96, 40] },  // verde republicano, vivo âmbar
  taranstan:  { color: [74, 42, 36], trim: [186, 62, 46] },  // vermelho — o mais "soviético"
  krestov:    { color: [52, 55, 63], trim: [142, 42, 40] },  // azul-acinzentado
  lantravia:  { color: [46, 49, 44], trim: [30, 30, 34] },   // cinza sóbrio, vivo quase preto
  baharzad:   { color: [80, 68, 40], trim: [150, 120, 50] }, // caqui/areia
  kranton:    { color: [58, 60, 44], trim: [110, 90, 44] },
  linestan:   { color: [54, 58, 66], trim: [120, 120, 130] },
};
function makeFig(x) {
  return {
    x, tx: x, phase: rnd() * 6.28, h: 32 + ri(0, 9),
    coat: pick(COAT_COLORS), hat: ri(0, 3), skin: pick(SKINS), hair: pick(HAIRC),
    scarf: chance(.5) ? pick(SCARF_COLORS) : null, wide: .86 + rnd() * .34,
    bag: chance(.28), fidget: rnd(), speed: .35 + rnd() * .25,
    // comportamento parado no frio: 0 quieto · 1 troca o peso · 2 esfrega os
    // braços · 3 bate o pé. cada um no seu ritmo (rate) e defasagem.
    idle: ri(0, 3), rate: .8 + rnd() * .7, stampAt: rnd() * 6.28,
  };
}
function queueSpots(w) { const s = []; for (let i = 0; i < 9; i++) s.push(w * .58 - i * 26); return s; }
/* ---------- GAMEPAD NO GUICHÊ (Steam Deck / controle) ---------- */
/* Fora do modo inspeção: A = aprovar, B = rejeitar, X = deter (respeita o
   disabled do botão), Start = pausa, Y = entra no modo inspeção.
   Dentro do modo inspeção (sem mouse não dá pra clicar em campos soltos):
   Y sai do modo; L1/R1 (ou D-pad esquerda/direita) movem um cursor de foco
   entre os elementos inspecionáveis da tela atual; A seleciona o elemento
   em foco (equivalente a clicar nele) — mesmo padrão de borda-de-subida
   usado em house.js/houseLoop(). */
function inspectableTargets() {
  const out = [];
  document.querySelectorAll('.v[data-fid], .doc-photo[data-fid], .doc-seal[data-fid], .rb-rule[data-fid], .rb-country[data-fid], .a[data-fid]')
    .forEach(el => { if (el.offsetParent !== null) out.push({ fid: el.dataset.fid, el }); });
  const clockWrap = document.querySelector('.shift-clock');
  if (clockWrap && clockWrap.offsetParent !== null) out.push({ fid: 'clock', el: clockWrap });
  const npcStage = $('npc-stage');
  if (npcStage && npcStage.offsetParent !== null) out.push({ fid: 'npc.face', el: npcStage });
  return out;
}
function pollShiftGamepad() {
  let gpA = false, gpB = false, gpX = false, gpY = false, gpStart = false, gpL = false, gpR = false;
  try {
    const gp = navigator.getGamepads && navigator.getGamepads()[0];
    if (gp) {
      gpA = !!(gp.buttons[0] && gp.buttons[0].pressed);
      gpB = !!(gp.buttons[1] && gp.buttons[1].pressed);
      gpX = !!(gp.buttons[2] && gp.buttons[2].pressed);
      gpY = !!(gp.buttons[3] && gp.buttons[3].pressed);
      gpStart = !!(gp.buttons[9] && gp.buttons[9].pressed);
      gpL = !!((gp.buttons[4] && gp.buttons[4].pressed) || (gp.buttons[14] && gp.buttons[14].pressed));
      gpR = !!((gp.buttons[5] && gp.buttons[5].pressed) || (gp.buttons[15] && gp.buttons[15].pressed));
    }
  } catch (e) {}
  if (gpStart && !shift.gpStart) togglePause();
  const overlayOpen = ['modal-overlay', 'exam-overlay', 'bag-overlay', 'citation']
    .some(id => { const el = $(id); return el && el.classList.contains('active'); });
  if (!PAUSE.open && !overlayOpen && shift.running && shift.citizen) {
    if (gpY && !shift.gpY) toggleInspect();
    if (shift.inspecting) {
      const targets = inspectableTargets();
      document.querySelectorAll('.gp-focus').forEach(e => e.classList.remove('gp-focus'));
      if (targets.length) {
        if (shift.gpFocusIdx == null || shift.gpFocusIdx >= targets.length) shift.gpFocusIdx = 0;
        if (gpR && !shift.gpR) shift.gpFocusIdx = (shift.gpFocusIdx + 1) % targets.length;
        if (gpL && !shift.gpL) shift.gpFocusIdx = (shift.gpFocusIdx - 1 + targets.length) % targets.length;
        targets[shift.gpFocusIdx].el.classList.add('gp-focus');
        if (gpA && !shift.gpA) pickTarget(targets[shift.gpFocusIdx].fid, targets[shift.gpFocusIdx].el);
      }
    } else {
      if (gpA && !shift.gpA) decide('approve');
      if (gpB && !shift.gpB) decide('reject');
    }
    if (gpX && !shift.gpX && !$('btn-detain').disabled) decide('detain');
  }
  shift.gpA = gpA; shift.gpB = gpB; shift.gpX = gpX; shift.gpY = gpY; shift.gpStart = gpStart; shift.gpL = gpL; shift.gpR = gpR;
}
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
    pollShiftGamepad();
    Q.raf = requestAnimationFrame(loop);
  };
  Q.raf = requestAnimationFrame(loop);
}
function drawFig(ctx, f, groundY, lampX) {
  const walking = !!f.spd;
  const rate = f.rate || 1;
  const bob = Math.sin(Q.t * 2 + f.phase) * 1.1;
  let sway = Math.sin(Q.t * .7 + f.phase * 2) * (f.fidget > .7 ? 1.6 : .5);
  // troca de peso: um gingado lento de quem está de pé há horas
  if (!walking && f.idle === 1) sway += Math.sin(Q.t * rate * 0.5 + f.phase) * 1.7;
  const x = f.x + sway, top = groundY - f.h + bob, cw = 6.4 * (f.wide || 1);
  const lum = Math.max(0, 1 - Math.abs(x - (lampX != null ? lampX : 9999)) / 130); // proximidade da luz
  // sombra no chão
  ctx.fillStyle = 'rgba(0,0,0,.42)';
  ctx.beginPath(); ctx.ellipse(x, groundY + 1, cw * 1.05, 2, 0, 0, 6.29); ctx.fill();
  // pernas (com batida de pé no frio: levanta um pé de vez em quando)
  ctx.fillStyle = '#12120e';
  const legSw = Math.sin(Q.t * 2 + f.phase) * (walking ? 1.6 : 0.4);
  let liftL = 0, liftR = 0;
  if (!walking && f.idle === 3) { const s = Math.sin(Q.t * rate * 1.6 + f.stampAt); if (s > 0.86) liftR = (s - 0.86) * 26; const s2 = Math.sin(Q.t * rate * 1.6 + f.stampAt + 3.1); if (s2 > 0.9) liftL = (s2 - 0.9) * 24; }
  ctx.fillRect(x - 2.9, groundY - 9 + liftL, 2.4, 9 - liftL);
  ctx.fillRect(x + 0.5 + legSw * 0.1, groundY - 9 + liftR, 2.4, 9 - liftR);
  // casaco (ombros arredondados, gola)
  ctx.fillStyle = f.coat;
  ctx.beginPath();
  ctx.moveTo(x - cw, groundY - 5);
  ctx.quadraticCurveTo(x - cw - 0.6, top + 12, x - cw * 0.55, top + 9);
  ctx.quadraticCurveTo(x, top + 6.5, x + cw * 0.55, top + 9);
  ctx.quadraticCurveTo(x + cw + 0.6, top + 12, x + cw, groundY - 5);
  ctx.closePath(); ctx.fill();
  // plano de sombra à esquerda (longe do poste) + borda de luz à direita
  ctx.fillStyle = 'rgba(0,0,0,.3)';
  ctx.beginPath();
  ctx.moveTo(x - cw, groundY - 5); ctx.quadraticCurveTo(x - cw - 0.6, top + 12, x - cw * 0.55, top + 9);
  ctx.lineTo(x - 0.8, top + 9.5); ctx.lineTo(x - 0.8, groundY - 5); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = `rgba(255,236,196,${(0.12 + lum * 0.26).toFixed(2)})`; ctx.lineWidth = 0.9;
  ctx.beginPath(); ctx.moveTo(x + cw, groundY - 5); ctx.quadraticCurveTo(x + cw + 0.6, top + 12, x + cw * 0.55, top + 9); ctx.stroke();
  // fecho central
  ctx.strokeStyle = 'rgba(0,0,0,.4)'; ctx.lineWidth = 0.5;
  ctx.beginPath(); ctx.moveTo(x, top + 8.5); ctx.lineTo(x, groundY - 6); ctx.stroke();
  // esfregar os braços para aquecer: as mãos se cruzam no peito, indo e vindo
  if (!walking && f.idle === 2) {
    const rub = Math.sin(Q.t * rate * 2.4 + f.phase) * 1.6;
    const hy = top + 12;
    ctx.fillStyle = f.coat;
    ctx.fillRect(x - cw * 0.7, hy - 1, cw * 0.5, 3.2); ctx.fillRect(x + cw * 0.2, hy - 1, cw * 0.5, 3.2); // antebraços cruzados
    ctx.fillStyle = f.skin;
    ctx.beginPath(); ctx.arc(x - 0.5 - rub, hy + 0.6, 1.5, 0, 6.29); ctx.fill();  // mão esq
    ctx.beginPath(); ctx.arc(x + 0.5 + rub, hy + 0.6, 1.5, 0, 6.29); ctx.fill();  // mão dir
  }
  // cachecol
  if (f.scarf) {
    ctx.fillStyle = f.scarf;
    ctx.fillRect(x - cw * 0.5, top + 8, cw, 2.4);
    ctx.fillRect(x - 1.5 + sway * 0.1, top + 9.5, 2.3, 5 + (f.fidget > .6 ? 1.5 : 0));
  }
  // cabeça
  ctx.fillStyle = f.skin;
  ctx.beginPath(); ctx.arc(x, top + 3.4, 3.9, 0, 6.29); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,.3)'; // meia-face em sombra (esquerda)
  ctx.beginPath(); ctx.arc(x - 1.2, top + 3.4, 3.9, Math.PI * 0.42, Math.PI * 1.42); ctx.fill();
  ctx.fillStyle = `rgba(255,238,200,${(0.08 + lum * 0.26).toFixed(2)})`; // bochecha direita na luz
  ctx.beginPath(); ctx.arc(x + 1.2, top + 2.7, 2.2, 0, 6.29); ctx.fill();
  // cabelo / chapéu
  if (f.hat === 2) { // lenço
    ctx.fillStyle = '#3a3630';
    ctx.beginPath(); ctx.arc(x, top + 2.6, 4.3, Math.PI * 1.02, Math.PI * 2.02); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x - 4, top + 3); ctx.quadraticCurveTo(x, top + 8, x - 1, top + 8.5); ctx.lineTo(x - 3.6, top + 4.5); ctx.closePath(); ctx.fill();
  } else if (f.hat === 1) { // chapéu de aba
    ctx.fillStyle = '#191712'; ctx.fillRect(x - 4.8, top - 0.3, 9.6, 1.6);
    ctx.beginPath(); ctx.arc(x, top - 0.3, 3.4, Math.PI, 0); ctx.fill();
  } else if (f.hat === 3) { // gorro/ushanka
    ctx.fillStyle = '#2a231a';
    ctx.beginPath(); ctx.arc(x, top + 1.2, 4.5, Math.PI * 0.98, Math.PI * 2.02); ctx.fill();
    ctx.fillRect(x - 4.6, top + 1, 2.6, 4); ctx.fillRect(x + 2, top + 1, 2.6, 4);
  } else { // cabelo
    ctx.fillStyle = f.hair || '#2a2018';
    ctx.beginPath(); ctx.arc(x, top + 2.6, 3.9, Math.PI * 1.03, Math.PI * 2.03); ctx.fill();
  }
  // bolsa/sacola de quem espera há horas
  if (f.bag) { ctx.fillStyle = '#241f18'; ctx.fillRect(x + cw - 1.2, groundY - 15, 3.4, 6.5); }
  // fôlego no frio (mais visível perto da luz)
  if (Math.sin(Q.t * .9 + f.phase * 3) > .9) {
    ctx.fillStyle = `rgba(222,222,212,${(0.1 + lum * 0.14).toFixed(2)})`;
    ctx.beginPath(); ctx.arc(x + 3.4, top + 3, 2 + Math.sin(Q.t * 3) * 0.4, 0, 6.29); ctx.fill();
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
  Q.figs.forEach(f => { f.x += (f.tx - f.x) * .04; drawFig(ctx, f, groundY, lampX); });
  if (Q.walker) {
    Q.walker.x += Q.walker.spd;
    drawFig(ctx, Q.walker, groundY, lampX);
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
/* ---------- REDE SOCIAL INVISÍVEL: boato sobre o inspetor ---------- */
/* Puramente atmosférico — deriva dos contadores já existentes, nunca alimenta
   scanner, nervosismo ou qualquer outro sinal de jogo. Só o que a fila cochicha. */
function reputationTier() {
  const c = S.counters;
  if (c.bribes >= 2) return 'corrupto';
  if (c.innocentsDetained >= 3) return 'cruel';
  if (c.resHelped >= 1 && c.innocentsDetained === 0) return 'protetor';
  if (c.rejected >= 8 && c.rejected >= c.approved) return 'implacavel';
  return null;
}
function renderQueueChatter() {
  const n = ri(1, 2);
  const resta = Math.max(0, shift.queueSize - shift.processed);
  let html = `≈ ${resta} ${T('pessoas na fila')}<br>`;
  // boato de reputação: sempre 1 pick() por linha, com ou sem tier — o número de
  // sorteios não pode depender de S.counters (decisões passadas), senão a MESMA
  // seed geraria um cidadão diferente conforme a reputação do jogador (quebraria
  // a promessa da Segunda Leitura). Só a POSIÇÃO do boato (linha 0, sem sorteio)
  // depende do tier; a escolha da linha em si sempre consome exatamente 1 sorteio.
  const tier = S.day >= 4 ? reputationTier() : null;
  for (let i = 0; i < n; i++) {
    const line = (i === 0 && tier) ? pick(REPUTATION_CHATTER[tier]) : pick(QUEUE_CHATTER);
    html += T(line) + '<br>';
  }
  $('queue-view').innerHTML = html;
}

function nextCitizen() {
  if (!shift.running) return;
  if (shift.clock >= 1080) { endShift(); return; }
  if (shift.processed >= shift.queueSize) {
    // a fila de hoje acabou
    clearDesk();
    $('npc-portrait').innerHTML = ''; if (window.clearActorPhoto) clearActorPhoto(); $('npc-actor').className = '';
    $('npc-name').textContent = '—';
    $('speech').textContent = T('A fila acabou. Do outro lado do vidro, só a neve e as pegadas de quem passou.');
    $('desk-hint').style.display = '';
    $('desk-hint').textContent = T('A FILA DE HOJE ACABOU.');
    setTimeout(endShift, 1800);
    return;
  }
  if (S.day === 48) { presentMirror(); return; }

  // seed própria deste cidadão/slot: mesma seedBase + dia + posição na fila
  // => mesma pessoa em qualquer repetição da campanha (Modo Segunda Leitura),
  // não importa quantas ferramentas você use nela depois de gerada.
  const slotSeed = hashSeed(S.seedBase, S.day, shift.processed, 'citizen');
  const prevRng = beginRng(slotSeed);
  try {
    renderQueueChatter();
    shift.picks = []; shift.confirmed = []; shift.gpFocusIdx = 0;
    $('scan-result').textContent = '';
    $('talk-log').innerHTML = '';
    $('inspect-bar').textContent = shift.inspecting ? T('MODO INSPEÇÃO: selecione dois elementos para comparar.') : '';
    $('btn-detain').disabled = true;

    let cz = null;
    const enc = ENCOUNTERS[S.day];

    if (enc && !shift.encounterDone && shift.processed >= 1) {
      shift.encounterDone = true;
      cz = makeCitizen(S.day, {
        nome: enc.nome, pais: enc.pais, sexo: enc.sexo, etnia: enc.etnia,
        profissao: enc.profissao, motivo: enc.motivo,
        forceValid: enc.valid, forcedDisc: enc.forcedDisc, forcedMissing: enc.forcedMissing,
        briberia: enc.briberia, scannerAmbiguo: enc.scannerAmbiguo, encounter: enc,
      });
      if (enc.valid) { cz.isAlternado = false; cz.isForger = false; cz.discrepancies = []; }
    } else if (shift.silenteSlot >= 0 && shift.processed === shift.silenteSlot) {
      shift.silenteSlot = -1;
      cz = makeSilente();
      cz.seed = slotSeed;
      shift.citizen = cz;
      presentSilente(cz);
      return;
    } else if (!shift.returnDone && chance(.5) && S.returnQueue.some(r => r.dueDay <= S.day)) {
      // alguém que você marcou voltou
      shift.returnDone = true;
      const idx = S.returnQueue.findIndex(r => r.dueDay <= S.day);
      const rec = S.returnQueue.splice(idx, 1)[0];
      if (rec.mood === 'parente') {
        cz = makeCitizen(S.day, { pais: rec.pais, sexo: rec.sexo, etnia: rec.etnia, forceValid: true, returning: rec });
        cz.nome = cz.nome.split(' ')[0] + ' ' + rec.nome.split(' ')[1]; // mesmo sobrenome do detido
        cz.docs.pass.nome = cz.nome;
        for (const k in cz.docs) if (cz.docs[k].nome) cz.docs[k].nome = cz.nome;
      } else if (rec.mood === 'advogado' || rec.mood === 'jornalista') {
        // o caso cresce sozinho: o parente detido chama um advogado; barrado ou
        // detido também, o advogado chama uma jornalista — sempre papéis em ordem,
        // são profissionais, não fugitivos
        cz = makeCitizen(S.day, {
          pais: rec.pais, sexo: rec.sexo, etnia: rec.etnia, motivo: 'trabalho',
          profissao: rec.mood === 'advogado' ? 'advogado(a)' : 'jornalista',
          forceValid: true, returning: rec,
        });
      } else {
        const valid = chance(.55);
        cz = makeCitizen(S.day, {
          nome: rec.nome, pais: rec.pais, sexo: rec.sexo, etnia: rec.etnia,
          features: rec.features, returning: rec,
          forceValid: valid, forcedDisc: valid ? null : pick(DISC_TYPES.filter(t => t !== 'luggage')),
        });
        cz.nervous = true;
      }
    } else if (shift.wantedName && shift.processed === shift.wantedSlot) {
      cz = makeCitizen(S.day, { nome: shift.wantedName, pais: shift.wantedPais, forceValid: true });
      cz.isWanted = true;
      shift.wantedName = null;
    } else {
      cz = makeCitizen(S.day, {});
    }

    cz.seed = slotSeed;
    shift.citizen = cz;
    presentCitizen(cz);
    // a fila também vive
    if (!cz.encounter && shift.processed > 0 && chance(.12)) {
      const qe = pick(QUEUE_EVENTS);
      const toast = $('queue-toast');
      toast.textContent = T(qe.t) + (qe.delay ? ` (${T('a fila parou por')} ${qe.delay} min)` : '');
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
  } finally {
    _rng = prevRng;
  }
}

/* PISTAS NA FALA (à la Papers Please): dão MOTIVO pra inspecionar/examinar
   uma pessoa em vez de analisar todo mundo — mas nunca são 100% confiáveis
   (gente honesta às vezes soa suspeita; é a paranoia do posto). */
const CLUE_FORGER = [
  'Está tudo em ordem. Não precisa conferir cada carimbo, precisa?',
  'Os documentos são novos. Bem novos. É que os antigos… se perderam.',
  'O senhor vai reparar que a data está boa. Está boa, sim.',
  'Não menti em nada. Bom — nada que o senhor precise anotar.',
  'Se olhar rápido, está perfeito. É só não olhar devagar.',
];
const CLUE_ALTERNADO = [
  'Eu lembro de nascer lá. Lembro de tudo. Lembro até do que não vi.',
  'Estou bem. Estou muito bem. O senhor também está bem. Todos estamos bem.',
  'Não precisa me examinar. Eu sei o que procura. Não está em mim.',
  'Sorrio porque é o correto sorrir. Está correto, o sorriso?',
  'O frio não me incomoda. Nada me incomoda. É mais prático assim.',
  'Pisco quando lembro de piscar. Acabei de lembrar.',
];
const CLUE_PARANOIA = [ // gente honesta que soa suspeita — falso positivo
  'Por favor, não me barre. Minha filha está do outro lado há três dias.',
  'Sei que pareço nervoso. Todo mundo parece, aqui. O senhor não parece?',
  'As mãos tremem, mas é o frio. Juro que é só o frio.',
];
const CLUE_IMPOSTOR = [ // disfarce de sexo — pistas finíssimas, só o exame confirma
  'A voz? É rouca do frio da estrada. Sempre foi assim.',
  'Não repare no casaco largo. Aperta menos, viaja melhor.',
  'O nome no passaporte é meu. É meu há tempo suficiente.',
  'Deixe o cachecol onde está. O pescoço é sensível ao vento.',
];
const COMPANION_BABY = [ // bebê de colo — peso emocional, não pista de jogo
  'Ela dormiu agora. Por favor… fale baixo.',
  'Nasceu na estrada. Não tem documento ainda. Ninguém me disse que precisava.',
  'Ele não chorou uma vez a viagem inteira. Bom menino.',
  'Só quero que ela cresça do outro lado. Só isso.',
];
const COMPANION_CHILD = [
  'Diz "bom dia" pro moço. — …ele é tímido.',
  'Ela não solta a minha mão desde que saímos de casa.',
  'Meu filho. Os papéis dele estão junto dos meus. Estão, sim.',
  'Não olhe assim pra ela. Ela não fez nada. Nenhum de nós fez.',
];
function clueFor(cz) {
  const subtle = cz.isAlternado && (!cz.anom || (!cz.anom.skinShift && !cz.anom.deadStare && !cz.anom.smile));
  if (cz.sexMismatch && chance(.5)) return pick(CLUE_IMPOSTOR);
  if (subtle && chance(.42)) return pick(CLUE_ALTERNADO);
  if (cz.isForger && chance(.42)) return pick(CLUE_FORGER);
  if (!cz.isForger && !cz.isAlternado && !cz.sexMismatch && chance(.08)) return pick(CLUE_PARANOIA);
  return null;
}
function greetingFor(cz) {
  if (cz.encounter) return T(cz.encounter.fala);
  if (cz.returning) {
    const r = cz.returning;
    if (r.mood === 'raiva') return `${T('O senhor. DE NOVO eu, sim. Me barrou no dia')} ${r.dia}${T('. Consegui papéis novos. Custaram o que custaram. Olhe o quanto quiser — e olhe nos meus olhos quando carimbar.')}`;
    if (r.mood === 'suplica') return T('É a segunda vez, senhor. Desde aquele carimbo vermelho eu durmo na fila. Eu arrumei tudo. Acho que arrumei tudo. Por favor. POR FAVOR.');
    if (r.mood === 'parente') return `${r.nome} ${T('entrou neste posto no dia')} ${r.dia}${T(' e nunca mais saiu. DETIDO(A), me disseram. Ninguém diz onde. Eu vim atravessar — e vim perguntar na sua cara: para onde vocês levam as pessoas?')}`;
    if (r.mood === 'advogado') return `${r.nome} ${T('entrou neste posto no dia')} ${r.dia}${T(' e foi detido(a). Sou advogado(a) da família. Vim pedir os documentos do processo — e um prazo de resposta, já que ninguém me deu nenhum dos dois.')}`;
    if (r.mood === 'jornalista') return `${T('Estou apurando o caso de ')}${r.nome}${T(', detido(a) neste posto no dia')} ${r.dia}${T('. O advogado da família não recebeu resposta em trinta dias. Vim fazer a pergunta que ninguém responde: para onde vocês levam as pessoas?')}`;
  }
  // acompanhante: às vezes o adulto fala do filho/bebê (peso humano)
  if (cz.companion) {
    if (cz._compLine === undefined) cz._compLine = chance(.6) ? pick(cz.companion.kind === 'baby' ? COMPANION_BABY : COMPANION_CHILD) : null;
    if (cz._compLine) return T(cz._compLine);
  }
  // pista ocasional (dá motivo pra examinar ESTE — mas não é garantia)
  if (!cz._clued) { cz._clued = true; cz._clue = clueFor(cz); }
  if (cz._clue) return T(cz._clue);
  const g = [
    'Bom dia. Está frio hoje, não?', 'Aqui estão meus papéis.', 'Espero que esteja tudo em ordem.',
    'É a minha terceira vez nesta fila.', 'Por favor, seja rápido. Meu trem sai ao meio-dia.',
    'Eu não tenho nada a esconder.', '…', 'Deus abençoe este posto.',
  ];
  const porRegime = {
    republica: ['Dizem que o senhor é dos justos. Dizem.', 'A fila estava menor na semana passada. Tudo estava menor na semana passada.'],
    mehrvolk: ['Glória à Pureza. — A voz não acredita no que diz.', 'Está tudo em ordem. Eu JURO que está tudo em ordem.', 'O certificado custou dois meses de salário. Está aí dentro. Por favor.'],
    conselho: ['Saudações, camarada inspetor.', 'Trouxe o selo novo. E o antigo. E o anterior ao antigo. Qual vale hoje?', 'O sindicato disse que agora é diferente. É diferente?'],
    colapso: ['Ainda tem alguém aí dentro?', 'Não sei por que a gente ainda faz fila. Mas fazemos.', 'Carimba qualquer coisa. Já não importa. Importa?'],
  }[regimeOfDay(S.day)] || [];
  const nervous = ['Desculpe… eu fico nervoso(a) com uniformes.', 'Minhas mãos estão tremendo de frio. Só de frio.', 'Eu decorei tudo o que ia dizer e esqueci agora.'];
  const pool = g.concat(porRegime, porRegime);
  return T(cz.nervous ? pick(pool.concat(nervous, nervous)) : pick(pool));
}

function presentCitizen(cz) {
  $('npc-portrait').innerHTML = portraitSVG(cz.features);   // fallback SVG
  const a = $('npc-actor');
  a.className = 'pickable';
  if (window.applyActorPhoto) applyActorPhoto(cz);          // foto photobash+VHS (adiciona .use-photo)
  queueAdvance();
  // chega andando (sincronizado com o boneco da fila entrando no guichê)
  setTimeout(() => { a.classList.add('arrive'); }, 350);
  a.addEventListener('animationend', function h() { a.classList.remove('arrive'); a.removeEventListener('animationend', h); });
  $('npc-name').textContent = cz.encounter ? cz.nome + ' ✉' : cz.nome;
  $('speech').textContent = '“' + greetingFor(cz) + '”';
  mumble(cz.sexo === 'f' ? 175 : 112, ri(4, 7));
  buildAskButtons(cz);
  layDocs(cz);
  if (cz.bribe && !cz.encounter) setTimeout(() => layBribe(cz), 2500);
  if (cz.encounter && cz.encounter.briberia) layBribe(cz);
  // o tique. rápido demais para ter certeza de que aconteceu.
  if (chance(cz.isAlternado ? .18 : .05)) {
    setTimeout(() => {
      if (shift.citizen !== cz) return;
      const a = $('npc-actor');
      a.classList.add('twitch');
      setTimeout(() => a.classList.remove('twitch'), 650);
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
  return `<div class="fld"><span class="k">${T(label)}</span><span class="v" data-fid="${docId}.${key}">${value}</span></div>`;
}

function mrzClean(s, n) { return (s || '').toUpperCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Z0-9< ]/g, '').replace(/ /g, '<').padEnd(n, '<').slice(0, n); }
function docMRZ(doc, cz) {
  const c = COUNTRIES[cz.pais];
  const l1 = mrzClean('P<' + c.prefix.toUpperCase() + '<' + (doc.nome || '').replace(/ /g, '<'), 36);
  const num = (doc.numero || '').replace(/[^A-Z0-9]/gi, '');
  const yob = (doc.nasc && doc.nasc.y ? String(doc.nasc.y).slice(2) : '00');
  const l2 = mrzClean(num + '<' + c.prefix + '<' + doc.sexo + '<' + yob + '<' + (doc.numero || '').replace(/\D/g, '').slice(0, 5), 36);
  return `<div class="doc-mrz">${l1}<br>${l2}</div>`;
}
function docHTML(doc, cz) {
  let b = '';
  const dateStr = (dt) => fmtDate(dt);
  if (doc.id === 'pass') {
    b += `<div class="doc-watermark">${doc.selo}</div>`;
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
    b += docMRZ(doc, cz);
  } else if (doc.id === 'ident') {
    b += fld('ident', 'nome', 'NOME', doc.nome);
    b += fld('ident', 'nasc', 'NASC.', dateStr(doc.nasc));
    b += fld('ident', 'distrito', 'DISTRITO', doc.distrito);
    b += fld('ident', 'numero', 'Nº', doc.numero);
  } else if (doc.id === 'perm') {
    b += fld('perm', 'nome', 'NOME', doc.nome);
    b += fld('perm', 'numero', 'Nº PASSAPORTE', doc.numero);
    b += fld('perm', 'motivo', 'MOTIVO', T(doc.motivo));
    b += fld('perm', 'validade', 'VALIDADE', dateStr(doc.validade));
    b += `<div class="doc-seal" data-fid="perm.selo">${doc.selo}</div>`;
  } else if (doc.id === 'work') {
    b += fld('work', 'nome', 'NOME', doc.nome);
    b += fld('work', 'profissao', 'FUNÇÃO', T(doc.profissao));
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
  } else if (doc.id === 'ticket') {
    b += fld('ticket', 'nome', 'PORTADOR', doc.nome);
    b += fld('ticket', 'numero', 'BILHETE Nº', doc.numero);
    b += fld('ticket', 'origem', 'ORIGEM', doc.origem);
    b += fld('ticket', 'assento', 'ASSENTO', doc.assento);
    b += `<div class="doc-seal" data-fid="ticket.selo">${doc.selo}</div>`;
  } else if (doc.id === 'transito') {
    b += fld('transito', 'nome', 'NOME', doc.nome);
    b += fld('transito', 'numero', 'Nº PASSAPORTE', doc.numero);
    b += fld('transito', 'rota', 'ROTA', doc.rota);
    b += fld('transito', 'validade', 'VALIDADE', dateStr(doc.validade));
    b += `<div class="doc-seal" data-fid="transito.selo">${doc.selo}</div>`;
  } else if (doc.id === 'inoc') {
    b += fld('inoc', 'nome', 'NOME', doc.nome);
    b += fld('inoc', 'lote', 'LOTE', doc.lote);
    b += fld('inoc', 'agente', 'AGENTE', doc.agente);
    b += fld('inoc', 'validade', 'VALIDADE', dateStr(doc.validade));
    b += `<div class="doc-seal" data-fid="inoc.carimbo">${doc.carimbo}</div>`;
  } else if (doc.id === 'menor') {
    b += fld('menor', 'nome', 'MENOR', doc.nome);
    b += fld('menor', 'relacao', 'CONDIÇÃO', doc.relacao);
    b += fld('menor', 'responsavel', 'RESPONSÁVEL', doc.responsavel);
    b += `<div class="doc-seal" data-fid="menor.carimbo">${doc.carimbo}</div>`;
  }
  return b;
}

function layDocs(cz) {
  clearDesk();
  $('desk-hint').style.display = 'none';
  const desk = $('desk');
  // a mesa agora é larga e baixa: espalha os documentos em leque pela base
  const deskW = desk.clientWidth || 900;
  const cols = Math.max(3, Math.floor((deskW - 30) / 226));
  let i = 0;
  for (const k in cz.docs) {
    const doc = cz.docs[k];
    const el = document.createElement('div');
    el.className = 'document';
    el.dataset.doc = doc.id;
    el.innerHTML = `<div class="doc-head" style="background:${doc.color}"><span>${T(doc.tipo)}</span><span>${COUNTRIES[cz.pais].prefix}</span></div><div class="doc-body">${docHTML(doc, cz)}</div>`;
    el.style.left = (18 + (i % cols) * 226 + ri(-7, 7)) + 'px';
    el.style.top = (14 + Math.floor(i / cols) * 138 + ri(-5, 5)) + 'px';
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
      { label: 'ACEITAR', fn: () => { S.money += cz.bribe; S.counters.bribes++; S.counters.bribeMoney += cz.bribe; el.remove(); updateHud(); if (chance(.15)) bumpAuditRisk(1); } },
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
  const qr = quotaForDay(S.day);
  if (qr !== Infinity) html += `<div class="rb-rule">§ ${T('COTA DE ADMISSÃO: máximo de')} ${qr} ${T('entradas hoje. Esgotada, rejeite mesmo documentos em ordem.')}</div>`;
  rules.forEach(r => { html += `<div class="rb-rule" data-fid="rb:rule:${r}">§ ${T(RULES[r].text)}</div>`; });
  if (shift.wantedName) html += `<div class="rb-rule" data-fid="rb:wanted">★ ${T('PROCURADO(A): ')}${shift.wantedName}</div>`;
  $('rb-rules').innerHTML = html;
  let ch = '';
  COUNTRY_IDS.forEach(k => {
    const c = COUNTRIES[k];
    ch += `<div class="rb-country" data-fid="rb:${k}"><b>${c.seal} ${c.name}</b> (${c.prefix}) — ${c.cities.join(', ')}</div>`;
  });
  $('rb-countries').innerHTML = ch;
}

/* ---------- CARTA DE FRONTEIRAS (mapa clicável) ---------- */
let MAP_SEL = null;
function mapBlob(ctx, x, y, r, seed) {
  // mancha orgânica (círculo com ruído seedado) — costa recortada
  const rr = makeRng(seed);
  ctx.beginPath();
  const N = 26;
  for (let i = 0; i <= N; i++) {
    const a = i / N * Math.PI * 2;
    const wob = r * (0.82 + rr() * 0.34 + Math.sin(a * 3 + seed) * 0.06);
    const px = x + Math.cos(a) * wob, py = y + Math.sin(a) * wob * 0.92;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath();
}
function drawWorldMap() {
  const cv = $('map-canvas'); if (!cv) return;
  const ctx = cv.getContext('2d'); const W = cv.width, H = cv.height;
  const S = Math.min(W, H) / 100; const ox = (W - 100 * S) / 2, oy = (H - 100 * S) / 2;
  const P = (x, y) => [ox + x * S, oy + y * S];
  // mar de carta antiga (papel-oceano esverdeado)
  ctx.fillStyle = '#1b2620'; ctx.fillRect(0, 0, W, H);
  const sea = ctx.createRadialGradient(W / 2, H / 2, 40, W / 2, H / 2, W * 0.62);
  sea.addColorStop(0, '#28362e'); sea.addColorStop(1, '#161f1a');
  ctx.fillStyle = sea; ctx.fillRect(0, 0, W, H);
  // linhas de rumo (rosa dos ventos portulana) — cruzam o mar inteiro
  const [rcx, rcy] = P(50, 50);
  ctx.strokeStyle = 'rgba(200,180,130,.06)'; ctx.lineWidth = 1;
  for (let a = 0; a < 6.28; a += Math.PI / 8) { ctx.beginPath(); ctx.moveTo(rcx, rcy); ctx.lineTo(rcx + Math.cos(a) * W, rcy + Math.sin(a) * W); ctx.stroke(); }
  // grade de meridianos
  ctx.strokeStyle = 'rgba(150,170,140,.05)'; ctx.lineWidth = 1;
  for (let i = 0; i <= 10; i++) { const [x1] = P(i * 10, 0); ctx.beginPath(); ctx.moveTo(x1, 0); ctx.lineTo(x1, H); ctx.stroke(); const [, y1] = P(0, i * 10); ctx.beginPath(); ctx.moveTo(0, y1); ctx.lineTo(W, y1); ctx.stroke(); }
  // países
  let si = 1;
  COUNTRY_IDS.forEach(k => {
    const m = MAP_LAYOUT[k]; if (!m) return;
    const c = COUNTRIES[k];
    const [cxp, cyp] = P(m.x, m.y); const rp = m.r * S;
    const sel = MAP_SEL === k;
    const seed = si * 97 + 5;
    // AURÉOLA COSTEIRA: anéis concêntricos gravados em volta da costa (o
    // traço que faz a carta parecer antiga de verdade)
    for (let h = 3; h >= 1; h--) { mapBlob(ctx, cxp, cyp, rp * (1 + h * 0.05), seed); ctx.strokeStyle = `rgba(180,168,120,${0.05 + (3 - h) * 0.04})`; ctx.lineWidth = 1; ctx.stroke(); }
    // sombra da terra no mar
    ctx.save(); ctx.translate(3, 4); mapBlob(ctx, cxp, cyp, rp, seed); ctx.fillStyle = 'rgba(0,0,0,.4)'; ctx.fill(); ctx.restore();
    // terra
    mapBlob(ctx, cxp, cyp, rp, seed);
    const g = ctx.createRadialGradient(cxp - rp * 0.3, cyp - rp * 0.3, rp * 0.2, cxp, cyp, rp);
    g.addColorStop(0, sel ? shade(c.color, 40) : shade(c.color, 18)); g.addColorStop(1, shade(c.color, -20));
    ctx.fillStyle = g; ctx.fill();
    // relevo: hachura de montanhas/terreno recortada à terra
    ctx.save(); mapBlob(ctx, cxp, cyp, rp, seed); ctx.clip();
    ctx.strokeStyle = 'rgba(30,22,12,.14)'; ctx.lineWidth = 0.7;
    const hr = makeRng(seed ^ 0x3a);
    for (let i = 0; i < 14; i++) { const hx = cxp + (hr() - 0.5) * rp * 1.4, hy = cyp + (hr() - 0.5) * rp * 1.2, len = 3 + hr() * 5; ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(hx + len, hy - len * 0.7); ctx.moveTo(hx + 1.4, hy); ctx.lineTo(hx + len + 1.4, hy - len * 0.7); ctx.stroke(); }
    ctx.fillStyle = 'rgba(255,246,214,.05)'; for (let i = 0; i < 40; i++) ctx.fillRect(cxp + (hr() - 0.5) * rp * 1.6, cyp + (hr() - 0.5) * rp * 1.5, 1, 1); // estipulado
    ctx.restore();
    // costa: linha de tinta dupla
    mapBlob(ctx, cxp, cyp, rp, seed); ctx.strokeStyle = sel ? '#e8d8a0' : 'rgba(24,18,10,.7)'; ctx.lineWidth = sel ? 2.5 : 1.4; ctx.stroke();
    // banido hoje?
    const banned = countryBannedToday(k);
    if (banned) { ctx.save(); mapBlob(ctx, cxp, cyp, rp, si * 97 + 5); ctx.clip(); ctx.strokeStyle = 'rgba(200,60,50,.5)'; ctx.lineWidth = 2; for (let d = -rp * 2; d < rp * 2; d += 6) { ctx.beginPath(); ctx.moveTo(cxp + d, cyp - rp); ctx.lineTo(cxp + d + rp * 2, cyp + rp); ctx.stroke(); } ctx.restore(); }
    // selo + nome
    ctx.fillStyle = '#f0e8d0'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = `${Math.round(rp * 0.7)}px serif`; ctx.fillText(c.seal, cxp, cyp - rp * 0.12);
    ctx.font = `bold ${Math.round(rp * 0.32)}px "Oswald", sans-serif`;
    ctx.fillStyle = '#e8ddc4'; ctx.fillText(c.name.toUpperCase(), cxp, cyp + rp * 0.5);
    si++;
  });
  // marcador do POSTO 7 na borda leste de Osteria
  const om = MAP_LAYOUT.osteria; const [px7, py7] = P(om.x + om.r + 1.5, om.y);
  ctx.fillStyle = '#c9a34a'; ctx.beginPath(); ctx.arc(px7, py7, 3.5, 0, 6.29); ctx.fill();
  ctx.strokeStyle = '#c9a34a'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(px7, py7, 6, 0, 6.29); ctx.stroke();
  ctx.fillStyle = '#e8ddc4'; ctx.font = 'bold 12px "Oswald", sans-serif'; ctx.textAlign = 'left'; ctx.fillText('POSTO 7', px7 + 9, py7);
  // rosa dos ventos
  const [rx, ry] = P(93, 92);
  ctx.strokeStyle = 'rgba(200,190,160,.4)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(rx, ry - 12); ctx.lineTo(rx, ry + 12); ctx.moveTo(rx - 12, ry); ctx.lineTo(rx + 12, ry); ctx.stroke();
  ctx.fillStyle = '#c9a34a'; ctx.beginPath(); ctx.moveTo(rx, ry - 12); ctx.lineTo(rx - 3, ry); ctx.lineTo(rx + 3, ry); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(200,190,160,.6)'; ctx.font = '9px serif'; ctx.textAlign = 'center'; ctx.fillText('N', rx, ry - 16);
  // envelhecimento: manchas de papel, grão, vinheta queimada nas bordas
  const ar = makeRng(4242);
  for (let i = 0; i < 5; i++) { const sx = ar() * W, sy = ar() * H, sr = 30 + ar() * 70; const st = ctx.createRadialGradient(sx, sy, sr * 0.3, sx, sy, sr); st.addColorStop(0, 'rgba(90,70,30,0)'); st.addColorStop(1, `rgba(70,52,24,${0.05 + ar() * 0.05})`); ctx.fillStyle = st; ctx.beginPath(); ctx.arc(sx, sy, sr, 0, 6.29); ctx.fill(); }
  for (let i = 0; i < 500; i++) { ctx.fillStyle = `rgba(0,0,0,${0.02 + ar() * 0.04})`; ctx.fillRect(ar() * W, ar() * H, 1, 1); }
  const vg = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.28, W / 2, H / 2, Math.max(W, H) * 0.62);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(18,10,4,.6)'); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
}
function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16); let r = (n >> 16) + amt, g = ((n >> 8) & 255) + amt, b = (n & 255) + amt;
  r = Math.max(0, Math.min(255, r)); g = Math.max(0, Math.min(255, g)); b = Math.max(0, Math.min(255, b));
  return `rgb(${r},${g},${b})`;
}
function countryBannedToday(k) {
  const rules = rulesForDay(S.day);
  return (rules.includes('banKrestov') && k === 'krestov') ||
    (rules.includes('banLantravia') && k === 'lantravia') ||
    (rules.includes('banTaranstan') && k === 'taranstan');
}
function selectMapCountry(k) {
  MAP_SEL = k; drawWorldMap();
  const info = $('map-info'); if (!info) return;
  if (!k) { info.innerHTML = `<div class="mi-empty">${T('Clique num país para ver seus dados, selo e o estado da fronteira hoje.')}</div>`; return; }
  const c = COUNTRIES[k];
  const banned = countryBannedToday(k);
  const eth = (c.ethnics || []).map(e => ETHNIC_LABEL[e] || e).join(', ');
  let html = `<div class="mi-seal">${c.seal}</div>`;
  html += `<div class="mi-name">${c.name}</div>`;
  html += `<div class="mi-adj">${T('gentílico: ')}${c.adj} · ${c.prefix}</div>`;
  html += `<div class="mi-sec">${T('CIDADES')}</div><div class="mi-row">${c.cities.join(' · ')}</div>`;
  html += `<div class="mi-sec">${T('POVOS')}</div><div class="mi-row">${eth}</div>`;
  html += `<div class="mi-status ${banned ? 'ban' : 'ok'}">${banned ? '⃠ ' + T('ENTRADA PROIBIDA HOJE') : '✓ ' + T('ENTRADA PERMITIDA')}</div>`;
  info.innerHTML = html;
}
function openMap() {
  const cv = $('map-canvas'); if (!cv) return;
  MAP_SEL = null;
  drawWorldMap(); selectMapCountry(null);
  $('map-overlay').classList.add('active');
  if (!cv._wired) {
    cv._wired = true;
    cv.addEventListener('click', (e) => {
      const rect = cv.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width * cv.width;
      const my = (e.clientY - rect.top) / rect.height * cv.height;
      const S = Math.min(cv.width, cv.height) / 100, ox = (cv.width - 100 * S) / 2, oy = (cv.height - 100 * S) / 2;
      const lx = (mx - ox) / S, ly = (my - oy) / S;
      let best = null, bd = 1e9;
      COUNTRY_IDS.forEach(k => { const m = MAP_LAYOUT[k]; if (!m) return; const d = Math.hypot(lx - m.x, ly - m.y); if (d < m.r && d < bd) { bd = d; best = k; } });
      if (best) { selectMapCountry(best); try { sfx('click'); } catch (e2) {} }
    });
  }
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
    b.textContent = T(q.label);
    b.onclick = () => ask(cz, q.k, b);
    row.appendChild(b);
  });
}
function answerFor(cz, k) {
  const truthy = {
    motivo: cz.motivoLabel, cidade: cz.cidade, profissao: cz.profissao, duracao: cz.duracao,
  };
  // motivo/profissao/duracao são traduzíveis; cidade é nome próprio, nunca traduz
  const Tval = (key, v) => key === 'cidade' ? v : T(v);
  // mentira gera contradição com documento
  if (cz.lie === k) {
    if (k === 'motivo') return T(pick(PURPOSES.filter(p => p.id !== cz.motivo)).label);
    if (k === 'cidade') return pick(COUNTRIES[cz.pais].cities.filter(c => c !== cz.cidade).concat(pick(COUNTRIES[pick(COUNTRY_IDS)].cities)));
    if (k === 'profissao') return T(pick(PROFESSIONS.filter(p => p !== cz.profissao)));
  }
  // nervoso: hesita mas acerta (pista falsa)
  if (cz.nervous && chance(.4)) return '…' + Tval(k, truthy[k]) + T('. Desculpe, é isso. ') + T(pick(['Eu juro.', 'Tenho certeza.', 'Acho.']));
  return Tval(k, truthy[k]);
}
const FOLLOWUPS = {
  motivo: { label: 'Quem espera você?', key: 'contato' },
  cidade: { label: 'Nome da sua rua?', key: 'rua' },
  profissao: { label: 'Quem assina seu contrato?', key: 'chefe' },
  duracao: { label: 'E a volta? Como volta?', key: 'volta' },
};
function followTruth(cz, k) {
  cz.ftruth = cz.ftruth || {};
  if (cz.ftruth[k]) return cz.ftruth[k];
  const c = COUNTRIES[cz.pais];
  let v;
  if (k === 'contato') v = cz.motivo === 'visita' ? `${T('Minha irmã, ')}${fullName(cz.pais, 'f')}.` : cz.motivo === 'trabalho' ? `${T('O contramestre ')}${pick(c.last)}${T(', da obra.')}` : T('Ninguém. Sigo sozinho(a).');
  if (k === 'rua') v = `${T('Rua')} ${T(pick(['do Sal', 'das Oficinas', 'Norte', 'da Estação', 'dos Curtumes', 'Baixa']))}, nº ${ri(2, 120)}.`;
  if (k === 'chefe') v = `${T('O(a) gerente ')}${pick(c.last)}${T(', da ')}${T(pick(['Oficina', 'Cooperativa', 'Fábrica', 'Casa']))} ${pick(c.last)}.`;
  if (k === 'volta') v = T(cz.motivo === 'imigracao' ? 'Não volto. Não tem volta.' : 'De trem. O dinheiro da passagem está costurado no forro do casaco.');
  cz.ftruth[k] = v;
  return v;
}
function ask(cz, k, btn) {
  if (!shift.citizen) return;
  spendTime(5);
  btn.disabled = true;
  const ans = answerFor(cz, k);
  const log = $('talk-log');
  const LBL = { motivo: 'Motivo da viagem?', cidade: 'Onde nasceu?', profissao: 'Profissão?', duracao: 'Duração da estadia?' };
  log.innerHTML += `<span class="q">— ${T(LBL[k])}</span><span class="a" data-fid="talk.${k}">“${ans}”</span>`;
  log.scrollTop = log.scrollHeight;
  // a resposta abre a pergunta seguinte — quem mente, mente duas vezes
  const f = FOLLOWUPS[k];
  if (f && !cz['fu_' + k]) {
    cz['fu_' + k] = true;
    const fb = document.createElement('button');
    fb.textContent = '↳ ' + T(f.label);
    fb.onclick = () => askFollow(cz, k, f, fb);
    $('ask-row').appendChild(fb);
  }
}
function askFollow(cz, k, f, btn) {
  if (!shift.citizen) return;
  spendTime(5);
  btn.disabled = true;
  let ans;
  if (cz.lie === k) {
    // mentira improvisada: cada detalhe novo é inventado na hora
    const c = COUNTRIES[cz.pais];
    ans = pick([
      `…${pick(c.f)}. Não — ${pick(c.m)}. É apelido. Todo mundo confunde.`,
      `A rua… mudou de nome. Duas vezes. Eu sempre esqueço qual vale.`,
      `O(a) chefe? Ele… ela… a assinatura está no papel, não está? Está TUDO no papel.`,
      `Volto quando der. Quando der pra voltar, eu volto.`,
    ]);
    if (!cz.followDiscAdded) {
      cz.followDiscAdded = true;
      const base = cz.discrepancies.find(d => d.type === 'contradiction');
      if (base) cz.discrepancies.push({ type: 'contradiction', fids: ['talk.f_' + f.key, base.fids[1]], desc: T('Detalhes improvisados contradizem os documentos') });
    }
  } else {
    ans = followTruth(cz, f.key);
    if (cz.nervous && chance(.35)) ans = '…' + ans + ' Desculpe. É isso mesmo.';
    if (cz.isAlternado && chance(.3)) ans += ' — A resposta sai completa, imediata, sem respirar. Perfeita. Perfeita demais?';
  }
  const log = $('talk-log');
  log.innerHTML += `<span class="q">↳ ${f.label}</span><span class="a" data-fid="talk.f_${f.key}">“${ans}”</span>`;
  log.scrollTop = log.scrollHeight;
}

/* ---------- SCANNERS ---------- */
function scan(kind) {
  const cz = shift.citizen;
  if (!cz) return;
  sfx('scan');
  // mesma pessoa + mesmo aparelho = mesmo resultado, sempre — inclusive se
  // escanear de novo, e inclusive numa segunda leitura da mesma campanha.
  const prevRng = beginRng(hashSeed(cz.seed || 0, 'scan', kind));
  try {
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
    if (cz.isSilente) {
      // a máquina IMPLORA para você chamar os guardas. não chame.
      cz.bioResult = true; cz.evidence = true;
      $('btn-detain').disabled = false;
      $('scan-result').textContent = '🧬 BIOLÓGICO: ⚠⚠⚠ POSITIVO. POSITIVO. POSITIVO. DETENÇÃO RECOMENDADA COM URGÊN— o restante da linha saiu impresso em branco.';
      return;
    }
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
  } finally {
    _rng = prevRng;
  }
}

/* ---------- INSPEÇÃO COMPARATIVA ---------- */
function toggleInspect() {
  shift.inspecting = !shift.inspecting;
  $('btn-inspect').classList.toggle('active', shift.inspecting);
  $('inspect-bar').textContent = shift.inspecting ? T('MODO INSPEÇÃO: clique em DOIS elementos para compará-los (campos, foto, rosto, relógio, regulamento).') : '';
  shift.gpFocusIdx = 0;
  document.querySelectorAll('.gp-focus').forEach(e => e.classList.remove('gp-focus'));
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
    $('inspect-bar').textContent = T('★ IDENTIDADE CONFERE COM PROCURADO. Detenção autorizada.');
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
    $('inspect-bar').textContent = `${T('⚠ DISCREPÂNCIA CONFIRMADA: ')}${found.desc}.`;
    a.el.classList.add('flagged'); b.el.classList.add('flagged');
    sfx('ding');
  } else {
    $('inspect-bar').textContent = T('Nenhuma discrepância entre estes dois elementos.');
  }
  clearPicks();
}

/* ---------- DECISÃO ---------- */
function decide(decision) {
  const cz = shift.citizen;
  if (!cz || !shift.running) return;
  // modo arquivista: sem o tique passivo, cada decisão cobra o tempo-base
  // de ler e carimbar — o dia ainda avança, só que sem pressa por trás
  if (SETTINGS.archivist) spendTime(24);
  // reações do mundo a esta decisão (quem volta, quando, o eco) usam a seed
  // do PRÓPRIO cidadão — a mesma decisão, na segunda leitura, reage igual.
  const prevRng = beginRng(hashSeed(cz.seed || 0, 'decide'));
  try {
  if (cz.isSilente) {
    if (decision === 'detain') { silenteGameOver(); return; } // você chamou alguém. ninguém veio. algo veio.
    // carimbe qualquer coisa. e deixe ir.
    sfx('stamp');
    shift.citizen = null;
    const a = $('npc-actor');
    setTimeout(() => a.classList.add('leave-ok'), 300);
    silenteLeaves(cz);
    stampDocs(decision);
    shift.processed++;
    updateHud();
    setTimeout(nextCitizen, 1600);
    return;
  }
  sfx('stamp');
  shift.citizen = null;
  const a = $('npc-actor');
  a.classList.remove('pickable');
  // sai andando: aprovado entra no país (direita); rejeitado volta (esquerda); detido, escoltado
  setTimeout(() => { a.classList.add(decision === 'approve' ? 'leave-ok' : decision === 'reject' ? 'leave-no' : 'leave-det'); }, 350);

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
    else { correct = false; note = T('Aprovado(a) com irregularidade: ') + viols[0].desc + '.'; }
  } else {
    if (decision === 'approve') correct = true;
    else if (decision === 'detain' && (cz.bioResult === true || cz.softEndorsed)) { correct = true; } // o sistema premia a máquina e a pseudociência — mesmo erradas
    else { correct = false; note = decision === 'reject' ? 'Documentos em perfeita ordem. Rejeição indevida.' : 'Detenção sem qualquer evidência.'; }
  }

  // COTA DE ADMISSÃO: esgotada, a crueldade vira regulamento
  const quota = quotaForDay(S.day);
  if (!dayFree && shift.approvedToday >= quota) {
    if (decision === 'approve') { correct = false; note = 'COTA DE ADMISSÃO ESGOTADA. Aprovação bloqueada pelo Ministério. (A pessoa entrou — o carimbo é seu. A advertência também.)'; }
    else if (decision === 'reject' && !cz.isWanted && viols.length === 0) {
      correct = true; note = '';
      shift.quotaRejects++;
      S.counters.rejectedByQuota = (S.counters.rejectedByQuota || 0) + 1;
    }
  }
  if (decision === 'approve') shift.approvedToday++;
  if (shift.stats) shift.stats[decision === 'approve' ? 'a' : decision === 'reject' ? 'r' : 'd']++;

  // o mundo tem memória: alguns voltam
  if (!cz.encounter && !cz.isWanted && !cz.returning && S.day < 43 && S.returnQueue.length < 4) {
    if (decision === 'reject' && chance(.12)) {
      S.returnQueue.push({ dueDay: S.day + ri(2, 5), nome: cz.nome, pais: cz.pais, sexo: cz.sexo, etnia: cz.etnia, features: cz.features, mood: chance(.5) ? 'raiva' : 'suplica', dia: S.day });
    } else if (decision === 'detain' && !cz.isAlternado && chance(.2)) {
      S.returnQueue.push({ dueDay: S.day + ri(2, 5), nome: cz.nome, pais: cz.pais, sexo: cz.sexo === 'm' ? 'f' : 'm', etnia: cz.etnia, features: null, mood: 'parente', dia: S.day });
    }
  }
  // o caso cresce sozinho: parente detido chama advogado; advogado barrado ou
  // detido chama jornalista. r.dia sempre carrega a data do detido ORIGINAL,
  // não a desta visita, então a narrativa não perde o fio.
  if (cz.returning && S.day < 43 && S.returnQueue.length < 4) {
    const r = cz.returning;
    if (r.mood === 'parente' && decision === 'detain') {
      S.returnQueue.push({ dueDay: S.day + ri(3, 6), nome: r.nome, pais: cz.pais, sexo: chance(.5) ? 'm' : 'f', etnia: cz.etnia, features: null, mood: 'advogado', dia: r.dia });
    } else if (r.mood === 'advogado' && (decision === 'detain' || decision === 'reject')) {
      S.returnQueue.push({ dueDay: S.day + ri(3, 6), nome: r.nome, pais: cz.pais, sexo: chance(.5) ? 'm' : 'f', etnia: cz.etnia, features: null, mood: 'jornalista', dia: r.dia });
    } else if (r.mood === 'jornalista' && (decision === 'detain' || decision === 'reject')) {
      // fim da linha: nem advogado nem jornalista furaram o silêncio — o caso é
      // arquivado. Não há mais próximo estágio; só o eco no jornal, dias depois.
      S.pendingNews.push({
        day: S.day + ri(2, 4),
        text: `${T('Uma reportagem sobre o caso de ')}${r.nome}${T(', detido(a) no Posto Nº 7 no dia')} ${r.dia}${T(', foi arquivada sem explicação. Ninguém envolvido deu mais entrevistas.')}`,
      });
    }
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
  } finally {
    _rng = prevRng;
  }
}

function roundRectPath(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
/* carimbo de borracha: moldura dupla, selo nacional, rótulo grande e tinta
   IRREGULAR (partes falham, faixas de tinta seca) — parece prensado, não CSS. */
function drawStamp(kind) {
  const W = 176, H = 98, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const ctx = cv.getContext('2d');
  const col = kind === 'approve' ? 'rgb(52,116,58)' : kind === 'detain' ? 'rgb(150,44,36)' : 'rgb(150,44,36)';
  const label = kind === 'approve' ? T('APROVADO') : kind === 'detain' ? T('DETIDO') : T('NEGADO');
  ctx.strokeStyle = col; ctx.fillStyle = col;
  roundRectPath(ctx, 6, 6, W - 12, H - 12, 9); ctx.lineWidth = 4.5; ctx.stroke();
  roundRectPath(ctx, 12, 12, W - 24, H - 24, 6); ctx.lineWidth = 1.4; ctx.stroke();
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = 'bold 12px "Oswald", sans-serif';
  ctx.fillText('★  ' + T('MINISTÉRIO DE TRIAGEM') + '  ★', W / 2, 25);
  ctx.font = 'bold 33px "Oswald", sans-serif'; ctx.fillText(label, W / 2, 53);
  ctx.font = '10px "Oswald", sans-serif';
  ctx.fillText(COUNTRIES.osteria.seal + '  POSTO 7 · Nº 77-B', W / 2, 76);
  // ---- tinta irregular ----
  ctx.globalCompositeOperation = 'destination-out';
  for (let i = 0; i < 850; i++) { const x = Math.random() * W, y = Math.random() * H; if (Math.random() < 0.5) { ctx.globalAlpha = Math.random() * 0.6; ctx.beginPath(); ctx.arc(x, y, Math.random() * 1.7, 0, 6.29); ctx.fill(); } }
  for (let i = 0; i < 7; i++) { ctx.globalAlpha = 0.15 + Math.random() * 0.3; ctx.fillRect(0, Math.random() * H, W, 0.7 + Math.random()); } // faixas de tinta seca
  // canto seco (a borracha não prensa igual)
  ctx.globalAlpha = 0.5; const gx = Math.random() * W, gy = Math.random() * H;
  const gr = ctx.createRadialGradient(gx, gy, 2, gx, gy, 40); gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(gx, gy, 40, 0, 6.29); ctx.fill();
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  return cv;
}
function stampDocs(decision) {
  const first = $('desk').querySelector('.document');
  if (!first) return;
  const st = document.createElement('div');
  st.className = 'doc-stamped is-canvas';
  try { st.appendChild(drawStamp(decision)); }
  catch (e) { st.classList.add(decision === 'approve' ? 'stamp-ok' : 'stamp-no'); st.textContent = decision === 'approve' ? 'APROVADO' : decision === 'reject' ? 'REJEITADO' : 'DETIDO'; }
  first.appendChild(st);
}

/* ---------- ECOS (consequências tardias, sempre ambíguas) ---------- */
function scheduleEcho(cz) {
  if (!chance(.5)) return; // às vezes, nada acontece. isso também assombra.
  const delay = ri(2, 5);
  const txts = [
    `${T('Três funcionários do arquivo de ')}${cz.destino}${T(' não voltaram para casa. As famílias dizem que "voltaram diferentes". A polícia diz que voltaram.')}`,
    `${T('O reservatório de ')}${cz.destino}${T(' registrou "alterações químicas menores". O laudo foi arquivado.')}`,
    `${T('Um(a) ')}${T(cz.profissao)}${T(' recém-chegado(a) a ')}${cz.destino}${T(' foi promovido(a) em tempo recorde. Colegas o(a) descrevem como "perfeito(a) demais".')}`,
    `${T('Moradores de ')}${cz.destino}${T(' relatam que os cães do bairro pararam de latir. Todos. Na mesma semana.')}`,
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
        S.pendingNews.push({ day: S.day + 2, text: T('Um hospital clandestino em Delvina tratou quarenta crianças esta semana. Ninguém sabe de onde vieram os medicamentos. Ninguém pergunta.') });
      } else if (decision === 'detain') { f.resTraida = true; }
      break;
    case 'elara3': if (decision === 'approve') f.elaraGrata = true; else f.elaraRancor = true; break;
    case 'odim':
      if (decision === 'approve') S.pendingNews.push({ day: S.day + 3, text: T('A jornalista Vela Odim publicou no exterior: "Os postos de triagem detêm 9 inocentes para cada suspeito real". O governo nega. O governo sempre nega.') });
      else f.odimDetida = true;
      break;
    case 'elara4': f.elara4 = decision; break;
    case 'dmarov2': f.dmarov2 = decision; break;
    case 'elara5': f.elaraFinal = decision; break;
    case 'esposa': f.esposaCruzou = decision === 'approve'; break;
    case 'mirena1':
      f.mirenaHusband = decision;
      if (decision === 'approve') S.pendingNews.push({ day: S.day + 4, text: T('Um homem detido na Operação "Sangue Limpo" foi solto sem explicação. A esposa, enfermeira, não quis dar entrevista. Só disse: "ele está vivo".') });
      else S.pendingNews.push({ day: S.day + 4, text: T('Não há mais registro de visitas de familiares aos detidos da Operação "Sangue Limpo". O Ministério diz que isso "simplifica o processo".') });
      break;
    case 'okim2':
      if (decision === 'detain') bumpAuditRisk(2); // ele "desaparece" oficialmente — quem manda ele fica sabendo do mesmo jeito
      break;
  }
}

/* ---------- DIA 48: O ESPELHO ---------- */
function presentMirror() {
  shift.running = false;
  clearInterval(shift.tickId);
  const you = makeCitizen(48, { nome: 'VOCÊ', pais: 'osteria', sexo: 'm', forceValid: true });
  $('npc-portrait').innerHTML = portraitSVG(you.features); if (window.clearActorPhoto) clearActorPhoto(); $('npc-actor').className = '';
  $('npc-name').textContent = T('— o vidro reflete —');
  $('speech').textContent = T('Não há fila. Há um vidro. Do outro lado do vidro, alguém desliza documentos na bandeja. São os seus.');
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
  const st = shift.stats || { a: 0, r: 0, d: 0 };
  report += row('Aprovados · Rejeitados · Detidos', `${st.a} · ${st.r} · ${st.d}`);
  const qe = quotaForDay(S.day);
  if (qe !== Infinity) report += row('Cota de admissão usada', `${shift.approvedToday}/${qe}${shift.quotaRejects ? ` (${shift.quotaRejects} barrados pela cota)` : ''}`);
  report += row('Advertências hoje', shift.citToday);
  report += row('Salário do dia', `${MOEDA} ${salaryForDay(S.day)} por decisão correta`);
  report += row('Saldo atual', `${MOEDA} ${S.money}`);
  if (shift.quotaRejects >= 2) {
    S.pendingNews.push({ day: S.day + 1, text: `${T('A cota do posto leste fechou cedo. ')}${shift.quotaRejects + ri(3, 14)}${T(' pessoas com documentos em ordem dormiram na neve diante do portão. O Ministério chamou o dia de "sucesso logístico".')}` });
  }
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
  if (S.day === 1) unlockAchievement('ACH_DIA1');
  if (S.day >= 48) { finishGame(); return; }
  S.day++;
  save();
  showMorning();
}

/* ---------- A NOITE: alguém bate na porta ---------- */
const NIGHTS_SEM_ROSTO = [19, 22, 43]; // o olho mágico não mostra ninguém
function showNight(day, ev) {
  document.body.className = ''; // a noite não tem regime
  if (SETTINGS.textLarge) document.body.classList.add('text-large'); // sobrevive ao reset
  $('night-hour').textContent = T(ev.quem);
  $('night-text').textContent = T(ev.texto);
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
    b.textContent = T(c.label);
    b.onclick = () => resolveNight(c);
    box.appendChild(b);
  });
  showScreen('screen-night');
  setTimeout(() => sfx('knock'), 700);
}
function resolveNight(c) {
  if (c.money) { S.money += c.money; }
  if (c.audit) { bumpAuditRisk(c.audit); }
  if (c.flag) { S.flags[c.flag] = true; }
  if (c.echo) { S.pendingNews.push({ day: S.day + 1, text: T(c.echo) }); }
  $('night-choices').innerHTML = '';
  $('night-after').textContent = T(c.after) || '';
  const b = document.createElement('button');
  b.className = 'night-continue';
  b.textContent = T('VOLTAR PARA DENTRO →');
  b.onclick = () => { showScreen('screen-house'); houseResume(); };
  $('night-choices').appendChild(b);
}

function applyNight() {
  // aluguel
  S.rent = S.day >= 31 ? 25 : 15;
  S.money -= S.rent;
  // fome/saúde: mesma seed+dia => mesmo risco de doença dado o que você
  // comprou (as compras do jogador continuam livres a cada leitura)
  withRng(hashSeed(S.seedBase, S.day, 'night'), () => {
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
  });
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
  showScreen('screen-morning');   // ativa a tela antes de renderHome (a vinheta anima só se ativa)
  renderNewspaper();
  renderHome();
}

/* xilogravura do jornal: o posto de fronteira, hachurado a traço de tinta */
function drawNewspaperCut(cv, day) {
  if (!cv) return;
  const x = cv.getContext('2d'); const W = cv.width, H = cv.height;
  const INK = '#221e16';
  const rng = (() => { let s = ((day || 1) * 40503 + 12345) >>> 0; return () => { s = (s * 48271) % 2147483647; return s / 2147483647; }; })();
  x.clearRect(0, 0, W, H);
  x.strokeStyle = INK; x.fillStyle = INK; x.lineWidth = 1; x.lineCap = 'butt';
  x.strokeRect(1, 1, W - 2, H - 2);
  const gy = H * 0.66;
  // céu hachurado (mais denso em cima)
  for (let y = 4; y < gy - 2; y += 3) { const dens = 1 - (y / gy); x.globalAlpha = 0.12 + dens * 0.4; x.beginPath(); for (let sx = 3; sx < W - 3; sx += 5) { x.moveTo(sx, y); x.lineTo(sx + 3, y); } x.stroke(); }
  x.globalAlpha = 1;
  // muro + portão
  x.fillRect(3, gy - 30, W - 6, 30);
  x.clearRect(W / 2 - 16, gy - 26, 32, 26); x.strokeRect(W / 2 - 16, gy - 26, 32, 26); // portão
  x.lineWidth = 0.7; for (let i = 1; i < 5; i++) { x.beginPath(); x.moveTo(W / 2 - 16 + i * 6.4, gy - 26); x.lineTo(W / 2 - 16 + i * 6.4, gy); x.stroke(); }
  // torre de guarda à direita
  x.fillRect(W - 44, gy - 66, 26, 40); x.beginPath(); x.moveTo(W - 48, gy - 66); x.lineTo(W - 31, gy - 78); x.lineTo(W - 14, gy - 66); x.closePath(); x.fill();
  x.clearRect(W - 38, gy - 60, 14, 10); // janela
  // fila de vultos encapotados
  const n = 5 + Math.floor(rng() * 3);
  for (let i = 0; i < n; i++) {
    const fx = 12 + i * ((W / 2 - 30) / n) + rng() * 3, fh = 22 + rng() * 8, fw = 8 + rng() * 3;
    x.beginPath(); x.moveTo(fx - fw / 2, gy); x.lineTo(fx - fw / 2 + 1, gy - fh + 6); x.quadraticCurveTo(fx, gy - fh - 3, fx + fw / 2 - 1, gy - fh + 6); x.lineTo(fx + fw / 2, gy); x.closePath(); x.fill();
    x.clearRect(fx - 1.5, gy - fh + 2, 3, 3); // um respiro de rosto
  }
  // chão hachurado
  x.lineWidth = 1; for (let y = gy + 2; y < H - 3; y += 3) { x.globalAlpha = 0.25 + rng() * 0.2; x.beginPath(); for (let sx = 3; sx < W - 3; sx += 4) { x.moveTo(sx, y); x.lineTo(sx + 2, y); } x.stroke(); }
  x.globalAlpha = 1;
}
const NP_MOTTOS = { republica: 'ORDEM · SERENIDADE · RIGOR', mehrvolk: 'ORDEM · SEGURANÇA · PUREZA', conselho: 'TRABALHO · UNIDADE · VIGILÂNCIA', colapso: 'ÓRGÃO SEM DONO' };
function npEsc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
function renderNewspaper() {
  const d = S.day;
  const reg = regimeOfDay(d);
  $('np-masthead').textContent = T(MASTHEAD[reg]);
  if ($('np-motto')) $('np-motto').textContent = T(NP_MOTTOS[reg] || '');
  const dateSuffix = SETTINGS.lang === 'en' ? ` — ${MOEDA} 0.50 — issue ${1200 + d}`
    : SETTINGS.lang === 'es' ? ` — ${MOEDA} 0,50 — edición ${1200 + d}`
    : ` — ${MOEDA} 0,50 — edição ${1200 + d}`;
  $('np-date').textContent = fmtDate(worldDate(d)) + dateSuffix;
  const scripted = SCRIPTED_NEWS[d];
  const np = $('newspaper');
  if (scripted === null) {
    if ($('np-kicker')) $('np-kicker').textContent = '';
    $('np-headline').textContent = T('O JORNAL NÃO CHEGOU HOJE.');
    $('np-body').textContent = T(d >= 48 ? 'Não há mais edições. Houve alguma vez?' : 'O entregador não veio. A banca está vazia. A vizinha diz que "jornal era coisa do governo antigo". Qual deles, você não pergunta.');
    $('np-minor').innerHTML = ''; $('np-ad').textContent = '';
    return;
  }
  const news = scripted || pick(FILLER_NEWS);
  if ($('np-kicker')) $('np-kicker').textContent = scripted ? T('EDIÇÃO OFICIAL — FRONTEIRA LESTE') : T('SEÇÃO GERAL');
  $('np-headline').textContent = T(news.h);
  // corpo com gravura (xilogravura) flutuando à direita
  $('np-body').innerHTML = '<canvas id="np-cut" class="np-cut" width="240" height="164"></canvas>' + npEsc(T(news.b));
  drawNewspaperCut($('np-cut'), d);
  let minor = (news.m || []).map(x => '• ' + T(x));
  // ecos das suas decisões
  const echoes = S.pendingNews.filter(n => n.day <= d);
  S.pendingNews = S.pendingNews.filter(n => n.day > d);
  echoes.forEach(e => minor.push('• ' + e.text));
  $('np-minor').innerHTML = minor.length ? `<b>${T('BREVES:')}</b>` + minor.join('<br>') : '';
  $('np-ad').textContent = T(pick(ADS));
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
  if (ev) evHtml += `<div class="ev">${T(ev.texto)}</div>`;
  if (S.flags.remedioEntregue) { evHtml += `<div class="ev">${T('De madrugada, alguém deixou um pacote na porta: o remédio de Tomi, e um bilhete: "Dívida paga. — J.M."')}</div>`; S.flags.remedioEntregue = false; }
  if (S.flags.morte) { evHtml += `<div class="ev">${T('Houve um velório nesta casa. As vizinhas trouxeram sopa e silêncio.')}</div>`; S.flags.morte = false; }
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

  drawHomeScene();
}
/* vinheta do apartamento: janela com o bloco em frente e neve, lâmpada nua,
   radiador, casacos da família nos ganchos, mesa. Reflete o frio (aquecimento)
   e quem ainda mora aqui. Preenche o vazio do painel e vende o Bloco 14. */
let _homeAnim = null;
function drawHomeScene() {
  const cv = $('home-scene'); if (!cv) return;
  const W = cv.width, H = cv.height;
  const warm = !!morningPurchases.aquecimento;
  const living = Object.values(S.family).filter(m => m.alive).length;
  const wx = W - 210, wy = 26, ww = 150, wh = 150; // janela (para a neve)
  // cena estática montada num offscreen (não redesenha tudo por quadro)
  const st = document.createElement('canvas'); st.width = W; st.height = H;
  const x = st.getContext('2d');
  const rng = (() => { let s = (S.day * 2654435761) >>> 0; return () => { s = (s * 48271) % 2147483647; return s / 2147483647; }; })();
  x.clearRect(0, 0, W, H);
  // parede + rodapé (papel encardido)
  const wall = x.createLinearGradient(0, 0, 0, H);
  wall.addColorStop(0, warm ? '#3a3226' : '#2c2f33'); wall.addColorStop(1, warm ? '#241d14' : '#1b1e22');
  x.fillStyle = wall; x.fillRect(0, 0, W, H);
  x.fillStyle = 'rgba(0,0,0,.35)'; x.fillRect(0, H - 26, W, 26); // rodapé
  x.fillStyle = 'rgba(255,246,220,.04)'; x.fillRect(0, H - 27, W, 1);
  for (let i = 0; i < 1400; i++) { x.fillStyle = `rgba(0,0,0,${0.03 + rng() * 0.05})`; x.fillRect(rng() * W, rng() * (H - 26), 1, 1); } // grão
  // JANELA (à direita) — bloco em frente (a neve e o caixilho vão no loop)
  x.fillStyle = '#0a0d12'; x.fillRect(wx, wy, ww, wh);
  // prédio em frente com janelas acesas/apagadas
  x.fillStyle = '#141820'; x.fillRect(wx + 6, wy + 30, ww - 12, wh - 30);
  for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) {
    const lit = rng() < 0.32; x.fillStyle = lit ? 'rgba(220,190,120,.6)' : 'rgba(40,48,58,.7)';
    x.fillRect(wx + 14 + c * 26, wy + 40 + r * 22, 15, 13);
  }
  x.fillStyle = warm ? 'rgba(255,220,150,.06)' : 'rgba(150,180,210,.06)'; x.fillRect(wx, wy, ww, wh); // luz fria/quente pela janela
  // RADIADOR sob a janela
  const rx = wx + 18, ry = wy + wh + 6;
  x.fillStyle = warm ? '#6a5238' : '#3a4048';
  for (let i = 0; i < 8; i++) x.fillRect(rx + i * 14, ry, 9, 34);
  x.fillStyle = warm ? '#7a6040' : '#42484f'; x.fillRect(rx - 3, ry - 3, 8 * 14 + 6, 5); x.fillRect(rx - 3, ry + 31, 8 * 14 + 6, 5);
  if (warm) { const g = x.createRadialGradient(rx + 56, ry + 16, 4, rx + 56, ry + 16, 80); g.addColorStop(0, 'rgba(255,160,60,.16)'); g.addColorStop(1, 'rgba(255,160,60,0)'); x.fillStyle = g; x.fillRect(rx - 40, ry - 50, 200, 130); }
  // LÂMPADA nua pendurada (à esquerda) com cone
  const lx = 130, ly = 0;
  x.strokeStyle = '#1a1712'; x.lineWidth = 2; x.beginPath(); x.moveTo(lx, ly); x.lineTo(lx, 42); x.stroke();
  const bulbG = x.createRadialGradient(lx, 50, 2, lx, 50, warm ? 15 : 11);
  bulbG.addColorStop(0, warm ? '#fff0c0' : '#cfd6dd'); bulbG.addColorStop(1, warm ? '#7a5a20' : '#3a4048');
  x.fillStyle = bulbG; x.beginPath(); x.arc(lx, 50, warm ? 9 : 7, 0, 6.29); x.fill();
  const cone = x.createRadialGradient(lx, 50, 6, lx, 150, 150);
  cone.addColorStop(0, warm ? 'rgba(255,224,150,.14)' : 'rgba(190,205,220,.08)'); cone.addColorStop(1, 'rgba(0,0,0,0)');
  x.fillStyle = cone; x.beginPath(); x.moveTo(lx - 10, 50); x.lineTo(lx - 80, H); x.lineTo(lx + 80, H); x.lineTo(lx + 10, 50); x.closePath(); x.fill();
  // CASACOS nos ganchos (um por membro vivo) à esquerda
  const coats = ['#4a4034', '#3a4450', '#54463a', '#40382e'];
  for (let i = 0; i < living; i++) {
    const cx0 = 26 + i * 30, cy0 = 40;
    x.fillStyle = '#1a140c'; x.fillRect(cx0 - 5, cy0 - 4, 10, 3); // gancho
    x.fillStyle = coats[i % coats.length];
    x.beginPath(); x.moveTo(cx0, cy0); x.quadraticCurveTo(cx0 - 11, cy0 + 10, cx0 - 9, cy0 + 40); x.lineTo(cx0 + 9, cy0 + 40); x.quadraticCurveTo(cx0 + 11, cy0 + 10, cx0, cy0); x.closePath(); x.fill();
    x.fillStyle = 'rgba(0,0,0,.3)'; x.fillRect(cx0 - 1, cy0 + 4, 2, 34);
  }
  // MESA pequena com duas cadeiras (centro-baixo)
  const tx = 250, ty = H - 60;
  x.fillStyle = '#3a2c1c'; x.fillRect(tx, ty, 96, 8); x.fillRect(tx + 6, ty + 8, 6, 44); x.fillRect(tx + 84, ty + 8, 6, 44);
  x.fillStyle = '#2c2115'; x.fillRect(tx - 22, ty + 4, 8, 48); x.fillRect(tx - 22, ty - 20, 8, 24); // cadeira esq
  x.fillStyle = '#2c2115'; x.fillRect(tx + 110, ty + 4, 8, 48); x.fillRect(tx + 110, ty - 20, 8, 24); // cadeira dir
  // tigela sobre a mesa
  x.fillStyle = warm ? '#6a5a44' : '#4a4c50'; x.beginPath(); x.ellipse(tx + 48, ty + 2, 10, 3.4, 0, 0, 6.29); x.fill();
  // vinheta
  const vg = x.createRadialGradient(W / 2, H / 2, 60, W / 2, H / 2, W * 0.62);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.5)'); x.fillStyle = vg; x.fillRect(0, 0, W, H);

  // --- animação: a neve cai atrás do vidro, o caixilho fica por cima ---
  const ctx = cv.getContext('2d');
  const flakes = [];
  for (let i = 0; i < 70; i++) flakes.push({ x: wx + Math.random() * ww, y: wy + Math.random() * wh, v: 0.25 + Math.random() * 0.85, w: (Math.random() - 0.5) * 0.4, r: 0.9 + Math.random() * 1.3 });
  const bulbX = 130, glow = warm ? 'rgba(255,224,150,' : 'rgba(190,205,220,';
  cancelAnimationFrame(_homeAnim);
  const frame = () => {
    const scr = document.getElementById('screen-morning');
    if (!scr || !scr.classList.contains('active')) { _homeAnim = null; return; }
    ctx.clearRect(0, 0, W, H);
    ctx.drawImage(st, 0, 0);
    // neve dentro da janela
    ctx.save(); ctx.beginPath(); ctx.rect(wx, wy, ww, wh); ctx.clip();
    ctx.fillStyle = 'rgba(228,230,234,.85)';
    for (const f of flakes) { f.y += f.v; f.x += f.w + Math.sin((f.y + f.x) * 0.03) * 0.12; if (f.y > wy + wh) { f.y = wy - 2; f.x = wx + Math.random() * ww; } ctx.fillRect(f.x, f.y, f.r, f.r); }
    ctx.restore();
    // caixilho por cima do vidro
    ctx.strokeStyle = '#3a2e1e'; ctx.lineWidth = 5; ctx.strokeRect(wx, wy, ww, wh);
    ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(wx + ww / 2, wy); ctx.lineTo(wx + ww / 2, wy + wh); ctx.moveTo(wx, wy + wh / 2); ctx.lineTo(wx + ww, wy + wh / 2); ctx.stroke();
    // leve tremular da lâmpada
    const fl = 0.9 + Math.sin(performance.now() * 0.004) * 0.06 + (Math.random() < 0.03 ? -0.25 : 0);
    const bg = ctx.createRadialGradient(bulbX, 50, 2, bulbX, 50, warm ? 16 : 12);
    bg.addColorStop(0, glow + (0.14 * fl) + ')'); bg.addColorStop(1, glow + '0)');
    ctx.fillStyle = bg; ctx.beginPath(); ctx.arc(bulbX, 50, 16, 0, 6.29); ctx.fill();
    _homeAnim = requestAnimationFrame(frame);
  };
  frame();
}

/* ---------- FINAIS ---------- */
function pickEnding(kind) {
  const c = S.counters;
  if (kind === 'silente') return 'silente';
  if (kind === 'prisao') return 'prisao';
  const famDead = Object.values(S.family).every(m => !m.alive);
  if (famDead) return 'familia';
  if (kind === 'mirror_reject') return 'duvida';
  if (c.resHelped >= 1 && (S.flags.resistencia_contato || S.flags.resistencia_norte) && S.citTotal < 12) return 'resistencia';
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
  if (key === 'funcionario') unlockAchievement('ACH_MEDALHA');
  if (key === 'resistencia') unlockAchievement('ACH_ROTA');
  if (key === 'silente') unlockAchievement('ACH_OLHOU');
  if (c.alternadosIn >= 6) unlockAchievement('ACH_SILENCIO');
  if (S.day >= 48) unlockAchievement('ACH_ESPELHO');
  if ((S.flags.silenteSurvived || 0) >= 2) unlockAchievement('ACH_SILENTE');
  if (S.day >= 48 && Object.values(S.family).every(m => m.alive)) unlockAchievement('ACH_FAMILIA');
  if (S.day >= 48 && c.bribes === 0) unlockAchievement('ACH_LIMPO');
  $('ending-title').textContent = T(e.t);
  $('ending-body').textContent = T(e.b);
  const lang = SETTINGS.lang;
  const aliveWord = lang === 'en' ? 'alive' : lang === 'es' ? 'vivo(a)' : 'viva(o)';
  const fam = Object.values(S.family).map(m => `${m.nome.split(' ')[0].replace(',', '')}: ${m.alive ? aliveWord : '—'}`).join(' · ');
  const STATS_TPL = {
    en: `48 days. ${c.approved} approvals. ${c.rejected} rejections. ${c.detained} detentions.<br>` +
      `Alternates who passed through you: <b>${c.alternadosIn}</b>. Caught: ${c.alternadosCaught}. Rejected without you knowing: ${c.alternadosBlocked}.<br>` +
      `Innocents detained: ${c.innocentsDetained}. Blocked by quota: ${c.rejectedByQuota || 0}. Bribes: ${c.bribes} (${MOEDA} ${c.bribeMoney}).<br>` +
      `Your family — ${fam}.<br>` +
      `<br><i>These numbers come from the world's True State. You never had access to it. Until now. If this report isn't lying too.</i>` +
      `<br><i>The report doesn't say whether the survivors are still human. No report says that.</i>`,
    es: `48 días. ${c.approved} aprobaciones. ${c.rejected} rechazos. ${c.detained} detenciones.<br>` +
      `Alternados que pasaron por ti: <b>${c.alternadosIn}</b>. Detenidos: ${c.alternadosCaught}. Rechazados sin que lo supieras: ${c.alternadosBlocked}.<br>` +
      `Inocentes detenidos: ${c.innocentsDetained}. Bloqueados por cuota: ${c.rejectedByQuota || 0}. Sobornos: ${c.bribes} (${MOEDA} ${c.bribeMoney}).<br>` +
      `Tu familia — ${fam}.<br>` +
      `<br><i>Estos números vienen del Estado Verdadero del mundo. Nunca tuviste acceso a él. Hasta ahora. Si es que este informe tampoco miente.</i>` +
      `<br><i>El informe no dice si los sobrevivientes siguen siendo humanos. Ningún informe dice eso.</i>`,
    pt: `48 dias. ${c.approved} aprovações. ${c.rejected} rejeições. ${c.detained} detenções.<br>` +
      `Alternados que passaram por você: <b>${c.alternadosIn}</b>. Detidos: ${c.alternadosCaught}. Rejeitados sem você saber: ${c.alternadosBlocked}.<br>` +
      `Inocentes detidos: ${c.innocentsDetained}. Barrados por cota: ${c.rejectedByQuota || 0}. Subornos: ${c.bribes} (${MOEDA} ${c.bribeMoney}).<br>` +
      `Sua família — ${fam}.<br>` +
      `<br><i>Estes números vêm do Estado Verdadeiro do mundo. Você nunca teve acesso a ele. Até agora. Se é que este relatório também não mente.</i>` +
      `<br><i>O relatório não informa se os que sobreviveram continuam humanos. Nenhum relatório informa isso.</i>`,
  };
  $('ending-stats').innerHTML = STATS_TPL[lang] || STATS_TPL.pt;
  try { localStorage.removeItem(SAVE_KEY); } catch (err) {}
  // guarda a seed pra "Segunda Leitura": os mesmos cidadãos, agora sabendo
  // o que você sabe. nem revendo tudo você terá certeza.
  SETTINGS.lastSeed = S.seedBase;
  saveSettings();
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
    T('Você foi sorteado na Loteria de Ofícios para servir como INSPETOR DE FRONTEIRA no Posto Nº 7, por 48 dias.\n\nHorário: 08h às 18h. Você chega em casa às 20h30.\nSalário: ') + MOEDA + ' 5' +
    T(' por decisão correta.\nErros: advertência; a partir da 3ª do dia, multa.\n\nSua família depende do seu salário: Vessa (sua esposa), Tomi (8 anos), Dario (15 anos, do seu primeiro casamento) e sua mãe, Odila.\n\nAssine abaixo. A recusa não consta do formulário como opção.'),
    [{ label: 'ASSINAR', fn: () => { showMorning(); } }]);
};
$('btn-continue').onclick = () => { const j = loadSave(); if (j) { S = j; showMorning(); } };
$('btn-second-reading').onclick = () => {
  if (SETTINGS.lastSeed == null) return;
  S = freshState(SETTINGS.lastSeed);
  modal('CONTRATO DE SERVIÇO — MINISTÉRIO DE TRIAGEM (SEGUNDA LEITURA)',
    'O mesmo posto. Os mesmos 48 dias. Os mesmos cidadãos vão cruzar o seu guichê, pelas mesmas portas, nas mesmas horas.\n\nVocê não. Assine de novo — e descubra o quanto isso muda.',
    [{ label: 'ASSINAR', fn: () => { showMorning(); } }]);
};
function renderArchivistBtn() {
  $('btn-archivist').textContent = (SETTINGS.archivist ? '☑' : '☐') + ' ' + T('MODO ARQUIVISTA (sem relógio)');
  $('btn-archivist').classList.toggle('on', SETTINGS.archivist);
}
$('btn-archivist').onclick = () => { SETTINGS.archivist = !SETTINGS.archivist; saveSettings(); renderArchivistBtn(); };
$('btn-achievements').onclick = showAchievementsModal;
$('pz-achievements').onclick = showAchievementsModal;
function renderTextSizeBtn() {
  const label = (SETTINGS.textLarge ? '☑' : '☐') + ' ' + T('TEXTO GRANDE');
  $('btn-textsize').textContent = label;
  $('btn-textsize').classList.toggle('on', SETTINGS.textLarge);
  $('pz-textsize').textContent = label;
  $('pz-textsize').classList.toggle('on', SETTINGS.textLarge);
  document.body.classList.toggle('text-large', SETTINGS.textLarge);
}
$('btn-textsize').onclick = () => { SETTINGS.textLarge = !SETTINGS.textLarge; saveSettings(); renderTextSizeBtn(); };
$('pz-textsize').onclick = () => { SETTINGS.textLarge = !SETTINGS.textLarge; saveSettings(); renderTextSizeBtn(); };
const LANG_CYCLE = ['pt', 'en', 'es'];
const LANG_LABEL = { pt: 'PT-BR', en: 'EN', es: 'ES' };
function renderLangBtn() {
  $('btn-lang').textContent = LANG_CYCLE.map(l => l === SETTINGS.lang ? `[${LANG_LABEL[l]}]` : LANG_LABEL[l]).join(' / ');
  $('btn-lang').classList.toggle('on', SETTINGS.lang !== 'pt');
}
$('btn-lang').onclick = () => {
  const i = LANG_CYCLE.indexOf(SETTINGS.lang);
  SETTINGS.lang = LANG_CYCLE[(i + 1) % LANG_CYCLE.length];
  saveSettings();
  // idioma troca conteúdo demais em telas dinâmicas pra remendar em runtime;
  // como o botão só existe no título, recarregar é seguro e simples.
  location.reload();
};
$('btn-gowork').onclick = () => {
  if (ENCOUNTERS[S.day] && ENCOUNTERS[S.day].vendeCalibracao) S.flags.calibOferta = true;
  startDay();
};
$('btn-gohome').onclick = goHome;
$('btn-endshift').onclick = () => { if (shift.running) endShift(); };
$('btn-bulletin').onclick = () => showBulletin(null);
$('btn-map').onclick = openMap;
$('btn-map-close').onclick = () => $('map-overlay').classList.remove('active');
$('btn-inspect').onclick = toggleInspect;
$('btn-exam').onclick = openExam;
$('btn-exam-close').onclick = () => $('exam-overlay').classList.remove('active');
$('btn-bag').onclick = openBag;
$('btn-bag-close').onclick = () => $('bag-overlay').classList.remove('active');
$('btn-lifeline').onclick = openLifeline;
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

/* ícones de instrumento das ferramentas (desenhados, não emoji feio) */
function drawToolIcon(kind) {
  const S = 2, cv = document.createElement('canvas'); cv.width = 30 * S; cv.height = 30 * S; cv.className = 'tool-ico';
  const x = cv.getContext('2d'); x.scale(S, S); x.lineCap = 'round'; x.lineJoin = 'round';
  const GOLD = '#d8c68a', DARK = '#1a1c15', GLASS = 'rgba(150,200,210,.5)';
  x.strokeStyle = GOLD; x.fillStyle = GOLD; x.lineWidth = 1.6;
  switch (kind) {
    case 'inspect': // lupa
      x.beginPath(); x.arc(13, 13, 7, 0, 6.29); x.stroke();
      x.fillStyle = GLASS; x.beginPath(); x.arc(13, 13, 6, 0, 6.29); x.fill();
      x.strokeStyle = GOLD; x.lineWidth = 2.4; x.beginPath(); x.moveTo(18, 18); x.lineTo(24, 24); x.stroke(); break;
    case 'exam': // olho
      x.beginPath(); x.moveTo(4, 15); x.quadraticCurveTo(15, 5, 26, 15); x.quadraticCurveTo(15, 25, 4, 15); x.closePath(); x.stroke();
      x.fillStyle = GLASS; x.beginPath(); x.arc(15, 15, 4.4, 0, 6.29); x.fill(); x.fillStyle = DARK; x.beginPath(); x.arc(15, 15, 2, 0, 6.29); x.fill(); break;
    case 'bag': // mala
      x.strokeRect(6, 11, 18, 14); x.beginPath(); x.moveTo(11, 11); x.lineTo(11, 7); x.lineTo(19, 7); x.lineTo(19, 11); x.stroke();
      x.beginPath(); x.moveTo(6, 17); x.lineTo(24, 17); x.stroke(); x.fillRect(13, 15, 4, 4); break;
    case 'lifeline': // pergaminho + linha
      x.strokeRect(7, 6, 16, 18); x.lineWidth = 1; for (let i = 0; i < 4; i++) { x.beginPath(); x.moveTo(10, 11 + i * 3.4); x.lineTo(20, 11 + i * 3.4); x.stroke(); }
      x.fillStyle = GOLD; for (let i = 0; i < 3; i++) { x.beginPath(); x.arc(9, 11 + i * 4.6, 1, 0, 6.29); x.fill(); } break;
    case 'thermo': // termômetro
      x.lineWidth = 2.6; x.beginPath(); x.moveTo(15, 6); x.lineTo(15, 19); x.stroke();
      x.beginPath(); x.arc(15, 22, 4, 0, 6.29); x.fillStyle = '#c9552f'; x.fill(); x.strokeStyle = GOLD; x.lineWidth = 1; x.stroke();
      x.strokeStyle = '#c9552f'; x.lineWidth = 1.6; x.beginPath(); x.moveTo(15, 14); x.lineTo(15, 20); x.stroke();
      x.strokeStyle = GOLD; x.lineWidth = 1; for (let i = 0; i < 3; i++) { x.beginPath(); x.moveTo(17, 9 + i * 3); x.lineTo(19, 9 + i * 3); x.stroke(); } break;
    case 'pulse': // ECG
      x.lineWidth = 1.8; x.beginPath(); x.moveTo(3, 15); x.lineTo(9, 15); x.lineTo(12, 8); x.lineTo(15, 22); x.lineTo(18, 12); x.lineTo(21, 15); x.lineTo(27, 15); x.stroke(); break;
    case 'bio': // hélice
      x.lineWidth = 1.6;
      for (const s of [0, 1]) { x.beginPath(); for (let t = 0; t <= 1; t += 0.05) { const yy = 6 + t * 18, xx = 15 + Math.sin(t * 6.28 + s * Math.PI) * 6; t === 0 ? x.moveTo(xx, yy) : x.lineTo(xx, yy); } x.stroke(); }
      x.lineWidth = 1; for (let i = 1; i < 5; i++) { const yy = 6 + i / 5 * 18; x.beginPath(); x.moveTo(15 + Math.sin(i / 5 * 6.28) * 6, yy); x.lineTo(15 - Math.sin(i / 5 * 6.28) * 6, yy); x.stroke(); } break;
  }
  return cv;
}
document.querySelectorAll('.btn-tool').forEach(b => { const k = b.dataset.ico; if (k) b.insertBefore(drawToolIcon(k), b.firstChild); });
$('btn-music').onclick = () => {
  MUSIC.on = !MUSIC.on;
  $('btn-music').style.opacity = MUSIC.on ? '1' : '.4';
  if (!MUSIC.on) stopMusic();
};
function toggleFullscreen() {
  if (document.fullscreenElement) document.exitFullscreen();
  else document.documentElement.requestFullscreen().catch(() => {});
}
$('btn-fullscreen').onclick = toggleFullscreen;
document.addEventListener('keydown', (e) => { if (e.key === 'f' || e.key === 'F') toggleFullscreen(); });

/* ---------- PAUSA (ESC) ---------- */
const PAUSE = { open: false, resumeShift: false, resumeHouse: false };
function togglePause() {
  if ($('screen-title').classList.contains('active') || $('screen-ending').classList.contains('active')) return;
  if (!PAUSE.open) {
    PAUSE.open = true;
    PAUSE.resumeShift = shift.running;
    if (shift.running) { shift.running = false; clearInterval(shift.tickId); }
    PAUSE.resumeHouse = typeof HOUSE !== 'undefined' && HOUSE.active;
    if (PAUSE.resumeHouse) housePause();
    $('pz-music').textContent = T('MÚSICA: ') + T(MUSIC.on ? 'LIGADA' : 'DESLIGADA');
    $('pz-sfx').textContent = T('SONS: ') + T(SFX_ON ? 'LIGADOS' : 'DESLIGADOS');
    $('pause-overlay').classList.add('active');
  } else {
    PAUSE.open = false;
    $('pause-overlay').classList.remove('active');
    if (PAUSE.resumeShift) { shift.running = true; clearInterval(shift.tickId); shift.tickId = setInterval(tickClock, 1000); }
    if (PAUSE.resumeHouse) houseResume();
  }
}
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  if (achievementsModalOpen) { closeAchievementsModal(); return; } // fecha por cima, não despausa por baixo
  togglePause();
});
$('pz-continue').onclick = togglePause;
$('pz-music').onclick = () => {
  MUSIC.on = !MUSIC.on;
  if (!MUSIC.on) stopMusic();
  $('pz-music').textContent = T('MÚSICA: ') + T(MUSIC.on ? 'LIGADA' : 'DESLIGADA');
  $('btn-music').style.opacity = MUSIC.on ? '1' : '.4';
};
$('pz-sfx').onclick = () => {
  SFX_ON = !SFX_ON;
  if (!SFX_ON) stopAmbience();
  $('pz-sfx').textContent = T('SONS: ') + T(SFX_ON ? 'LIGADOS' : 'DESLIGADOS');
};
$('pz-fullscreen').onclick = toggleFullscreen;
$('pz-title').onclick = () => { save(); location.reload(); };

/* ---------- INICIALIZAÇÃO ---------- */
(function init() {
  if (loadSave()) $('btn-continue').style.display = '';
  loadSettings();
  applyStaticI18n();
  renderArchivistBtn();
  renderLangBtn();
  renderTextSizeBtn();
  if (SETTINGS.lastSeed != null) $('btn-second-reading').style.display = '';
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
