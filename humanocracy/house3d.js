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
  for (const b of BOXES) {
    const spr = SPR[b.spr]; if (!spr) continue;
    const w = b.x1 - b.x0, d = b.y1 - b.y0;
    const side = lamMat(spr);
    const top = new THREE.MeshLambertMaterial({ color: new THREE.Color(b.top) });
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
  scene.add(new THREE.AmbientLight(0x35301f, .7));
  let nLamp = 0;
  for (const e of ENTS) {
    if (!e.glowWarm || nLamp >= 10) continue;
    const L = new THREE.PointLight(0xe8be78, .55, 5.5, 2);
    L.position.set(e.x, .86, e.y);
    scene.add(L); nLamp++;
  }
  const lantern = new THREE.PointLight(0xd8c9a0, .5, 4.5, 2);
  scene.add(lantern);

  GL = { renderer, scene, cam, bills, lantern, cv, texCache };
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

/* liga a flag: #casa3d / #house3d / #3d na URL (o raycaster é o padrão) */
function gl3Wanted() {
  return /3d/i.test(location.hash) && typeof THREE !== 'undefined' && HOUSE.mode !== 'mirror';
}
window.renderHouse3 = renderHouse3;
window.gl3Wanted = gl3Wanted;
