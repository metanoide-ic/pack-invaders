/* ============================================================
   HUMANOCRACY — house3d.js (EXPERIMENTAL)
   A casa em 3D DE VERDADE: Three.js renderizando a MESMA planta,
   as MESMAS texturas de canvas e os MESMOS sprites — mas como
   cena de malhas com luz real (paredes, móveis-caixa, retratos,
   família em planos direcionais, lâmpadas como PointLight).
   A lógica do houseLoop (movimento, colisão, interação, diálogo)
   não muda: só o RENDER troca. Ativa com #casa3d na URL; sem a
   flag — ou se o WebGL falhar — o raycaster segue sendo o padrão.
   ============================================================ */
'use strict';

let GL = null;

function gl3Init() {
  const host = $('house-canvas');
  const cv = document.createElement('canvas');
  cv.id = 'house-gl';
  cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%';
  host.parentElement.insertBefore(cv, host);        // o canvas 2D fica POR CIMA (transparente) só pro input

  const renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: false });
  renderer.setPixelRatio(1);
  renderer.outputEncoding = THREE.sRGBEncoding;
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x060504, 0.13);    // a escuridão da casa come o fundo
  scene.background = new THREE.Color(0x060504);
  const cam = new THREE.PerspectiveCamera(66, 1, .05, 60);

  const texCache = new Map();
  const tex = (canvas, srgb) => {
    let t = texCache.get(canvas);
    if (!t) {
      t = new THREE.CanvasTexture(canvas);
      t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter;
      if (srgb !== false) t.encoding = THREE.sRGBEncoding;
      texCache.set(canvas, t);
    }
    return t;
  };
  const matCache = new Map();
  const lamMat = (canvas) => {
    let m = matCache.get(canvas);
    if (!m) { m = new THREE.MeshLambertMaterial({ map: tex(canvas) }); matCache.set(canvas, m); }
    return m;
  };

  // ---- PAREDES: uma caixa por célula de parede encostada em área andável ----
  const box = new THREE.BoxGeometry(1, 1, 1);
  for (let my = 0; my < CUR.h; my++) for (let mx = 0; mx < CUR.w; mx++) {
    const t = (CUR.map[my] && CUR.map[my][mx]) || 0;
    if (!t) continue;
    let nearOpen = false;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const r = CUR.map[my + dy]; if (r && r[mx + dx] === 0) { nearOpen = true; break; } }
    if (!nearOpen) continue;
    const m = new THREE.Mesh(box, lamMat(texAt(mx, my, t)));
    m.position.set(mx + .5, .5, my + .5);
    if (t === 2) m.scale.x = .45;                    // a PORTA é fina, embutida na parede
    scene.add(m);
  }

  // ---- CHÃO e TETO com as texturas do raycaster, repetidas ----
  const ftx = tex(TEX.floor); ftx.wrapS = ftx.wrapT = THREE.RepeatWrapping; ftx.repeat.set(CUR.w, CUR.h);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(CUR.w, CUR.h), new THREE.MeshLambertMaterial({ map: ftx }));
  floor.rotation.x = -Math.PI / 2; floor.position.set(CUR.w / 2, 0, CUR.h / 2);
  scene.add(floor);
  const ctx2 = tex(TEX.ceil); ctx2.wrapS = ctx2.wrapT = THREE.RepeatWrapping; ctx2.repeat.set(CUR.w, CUR.h);
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(CUR.w, CUR.h), new THREE.MeshLambertMaterial({ map: ctx2 }));
  ceil.rotation.x = Math.PI / 2; ceil.position.set(CUR.w / 2, 1, CUR.h / 2);
  scene.add(ceil);

  // ---- MÓVEIS: as mesmas caixas do raycaster, agora malhas com face de topo ----
  // O tampo ganha textura de verdade: o topo do próprio sprite esticado, com
  // um tinte da cor do móvel — nada de face chapada.
  const topTexOf = (spr, tint) => {
    const c = document.createElement('canvas'); c.width = 32; c.height = 32;
    const g = c.getContext('2d');
    g.imageSmoothingEnabled = false;
    g.drawImage(spr, 0, 0, spr.width, Math.max(2, spr.height * .18), 0, 0, 32, 32);
    g.globalAlpha = .45; g.fillStyle = tint; g.fillRect(0, 0, 32, 32);       // rebaixa pro tom do móvel
    g.globalAlpha = .16; g.fillStyle = '#000';                               // sujeira/veio no tampo
    for (let i = 0; i < 26; i++) g.fillRect(Math.random() * 32 | 0, Math.random() * 32 | 0, 3, 1);
    return new THREE.MeshLambertMaterial({ map: tex(c) });
  };
  for (const b of BOXES) {
    const spr = SPR[b.spr]; if (!spr) continue;
    const w = b.x1 - b.x0, d = b.y1 - b.y0;
    const side = lamMat(spr);
    const top = topTexOf(spr, b.top);
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, b.h, d), [side, side, top, top, side, side]);
    m.position.set((b.x0 + b.x1) / 2, b.h / 2, (b.y0 + b.y1) / 2);
    scene.add(m);
  }

  // ---- GENTE e decoração: planos com o sprite, billboard só no eixo Y ----
  const bills = [];
  for (const e of ENTS) {
    if (!e.spr || BOX_DEFS[e.spr]) continue;
    const spr = SPR[e.spr]; if (!spr) continue;
    const h = Math.max(.12, e.sc), w = h * (spr.width / spr.height);
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshLambertMaterial({ map: tex(spr), transparent: true, alphaTest: .45, side: THREE.DoubleSide })
    );
    m.position.set(e.x, (e.lift || 0) + h / 2, e.y);
    scene.add(m);
    bills.push({ m, e, h });
  }

  // ---- LUZ: ambiente fraca + lâmpadas quentes + a lanterna do inspetor ----
  // Decaimento físico (decay 2) estoura o que está perto; usamos decay 1 com
  // alcance curto: a luz cai rápido mas não queima a parede em que encostamos.
  scene.add(new THREE.AmbientLight(0x3a3426, .55));
  const lamps = [];
  for (const e of ENTS) {
    if (!e.glowWarm || lamps.length >= 12) continue;
    const L = new THREE.PointLight(0xe8be78, .8, 6.5, 1);
    L.position.set(e.x, .84, e.y);
    scene.add(L); lamps.push({ L, x: e.x, y: e.y, base: .8 });
  }
  // globo visível da lâmpada (senão a luz vem do nada)
  const bulbGeo = new THREE.SphereGeometry(.045, 8, 6);
  const bulbMat = new THREE.MeshBasicMaterial({ color: 0xf6e0a8 });
  for (const l of lamps) {
    const bulb = new THREE.Mesh(bulbGeo, bulbMat);
    bulb.position.set(l.x, .84, l.y); scene.add(bulb);
    const cord = new THREE.Mesh(new THREE.CylinderGeometry(.006, .006, .16, 4), new THREE.MeshBasicMaterial({ color: 0x15130d }));
    cord.position.set(l.x, .93, l.y); scene.add(cord);
  }
  const lantern = new THREE.PointLight(0xcfc09a, .42, 3.4, 1);
  scene.add(lantern);

  // luz azulada da TV, pulsando (a mãe assiste no escuro)
  const tvEnt = ENTS.find(e => e.glow);
  const tvLight = tvEnt ? new THREE.PointLight(0x6f9cc0, .5, 4.2, 1) : null;
  if (tvLight) { tvLight.position.set(tvEnt.x, .45, tvEnt.y); scene.add(tvLight); }

  GL = { renderer, scene, cam, bills, lantern, lamps, tvLight, cv, texCache };
  return GL;
}

function renderHouse3() {
  try {
    if (!GL) gl3Init();
    const cv2 = $('house-canvas');
    const c2d = cv2.getContext('2d');
    c2d.clearRect(0, 0, cv2.width, cv2.height);      // o 2D vira só a camada de input
    const w = cv2.clientWidth || 640, h = cv2.clientHeight || 400;
    if (GL.cv.width !== w || GL.cv.height !== h) {
      GL.renderer.setSize(w, h, false);
      GL.cam.aspect = w / h; GL.cam.updateProjectionMatrix();
    }
    const eye = .52 + (HOUSE.bobY || 0) * .0022;
    GL.cam.position.set(HOUSE.x, eye, HOUSE.y);
    const ty = eye + Math.tan((HOUSE.pitch || 0) * .012);
    GL.cam.lookAt(HOUSE.x + Math.cos(HOUSE.ang), ty, HOUSE.y + Math.sin(HOUSE.ang));
    GL.lantern.position.set(HOUSE.x, .6, HOUSE.y);
    // vida na cena: lâmpadas oscilam de leve, TV pulsa, e o "dim" do horror
    // (HOUSE.fx.dim) apaga tudo por alguns segundos, como no raycaster
    const dimmed = HOUSE.fx && HOUSE.t < HOUSE.fx.dim ? .42 : 1;
    for (const l of GL.lamps) l.L.intensity = l.base * dimmed * (.93 + Math.sin(HOUSE.t * 7.3 + l.x) * .07);
    if (GL.tvLight) {
      const tvOn = HOUSE.t > (HOUSE.fx ? HOUSE.fx.tvOff : 0);
      GL.tvLight.intensity = tvOn ? (.34 + Math.random() * .26) * dimmed : 0;
    }
    // billboards: giram só no eixo Y + troca frente/costas (direcional)
    for (const b of GL.bills) {
      const e = b.e;
      const m2 = e.spot ? S.family[e.spot] : null;
      b.m.visible = !(m2 && !m2.alive) && !(e.spr === 'shadow' && HOUSE.fx && HOUSE.fx.shadowGone);
      if (!b.m.visible) continue;
      b.m.rotation.y = Math.atan2(HOUSE.x - e.x, HOUSE.y - e.y);
      if (e.dir != null && SPR[e.spr + '_b']) {
        const va = Math.atan2(HOUSE.y - e.y, HOUSE.x - e.x);
        const want = Math.cos(va - e.dir) < -0.15 ? SPR[e.spr + '_b'] : SPR[e.spr];
        if (b.m.material.map.image !== want) {
          b.m.material.map = new THREE.CanvasTexture(want);
          b.m.material.map.magFilter = THREE.NearestFilter; b.m.material.map.minFilter = THREE.NearestFilter;
          b.m.material.map.encoding = THREE.sRGBEncoding;
          b.m.material.needsUpdate = true;
        }
      }
    }
    GL.renderer.render(GL.scene, GL.cam);
  } catch (e) {
    console.warn('3D desligado (fallback raycaster):', e);
    HOUSE.gl = false;
    if (GL && GL.cv) GL.cv.style.display = 'none';
    GL = null;
  }
}

/* O 3D é o PADRÃO. Desliga com #2d na URL, com a opção "CASA EM 3D" no menu,
   ou automaticamente se o WebGL não existir/falhar (fallback pro raycaster).
   O Dia 48 (espelho) segue no raycaster: aquela cena é do outro motor. */
function gl3Wanted() {
  if (typeof THREE === 'undefined') return false;
  if (HOUSE.mode === 'mirror') return false;
  if (/2d/i.test(location.hash)) return false;          // #2d / #casa2d força o clássico
  if (typeof SETTINGS !== 'undefined' && SETTINGS.house3d === false) return false;
  try {                                        // sem WebGL, nem tenta
    const c = document.createElement('canvas');
    if (!(c.getContext('webgl2') || c.getContext('webgl'))) return false;
  } catch (e) { return false; }
  return true;
}
window.renderHouse3 = renderHouse3;
window.gl3Wanted = gl3Wanted;
