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
  cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;image-rendering:pixelated';
  host.parentElement.insertBefore(cv, host);        // o canvas 2D fica POR CIMA (transparente) só pro input

  const renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: false });
  renderer.setPixelRatio(1);
  renderer.outputEncoding = THREE.sRGBEncoding;
  const scene = new THREE.Scene();
  /* A casa é escura de propósito, mas escuro não é o mesmo que ILEGÍVEL: com
     0.13 de névoa e 55% de ambiente o corredor virava um túnel preto onde o
     chão ocupava meia tela e nada mais se lia. A dose certa deixa a planta
     visível e continua engolindo o fundo. */
  scene.fog = new THREE.FogExp2(0x070605, 0.105);   // a escuridão da casa come o fundo
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
  ceil.rotation.x = Math.PI / 2; ceil.position.set(CUR.w / 2, .92, CUR.h / 2);   // pé-direito baixo de bloco popular
  scene.add(ceil);

  // ---- MÓVEIS COMPOSTOS: cada peça é um conjunto de volumes de verdade ----
  // (cama = estrado+colchão+travesseiro+cabeceira; sofá = assento+encosto+
  // braços+almofadas; etc.) Cores chapadas de paleta — nada de sprite esticado
  // colado na lateral, que ficava horrível.
  const solid = (c) => { let m = matCache.get('c' + c); if (!m) { m = new THREE.MeshLambertMaterial({ color: new THREE.Color(c) }); matCache.set('c' + c, m); } return m; };
  const P = (g, w, h, d, x, y, z, c) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), solid(c)); m.position.set(x, y, z); g.add(m); return m; };
  const CY = (g, r, h, x, y, z, c, seg) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg || 8), solid(c)); m.position.set(x, y, z); g.add(m); return m; };
  const LEGS4 = (g, w, d, lh, c, r) => { const ox = w / 2 - (r || .025), oz = d / 2 - (r || .025); for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) P(g, (r || .025) * 2, lh, (r || .025) * 2, sx * ox, lh / 2, sz * oz, c); };
  const WOOD = '#4a3423', WOODD = '#33241a', CLOTH = '#c9c2ab';
  function buildFurn(b) {
    const w = b.x1 - b.x0, d = b.y1 - b.y0, h = b.h;
    const g = new THREE.Group();
    const hs = ((b.y0 + b.y1) / 2) < 6 ? -1 : 1;                 // lado da parede (cabeceiras)
    switch (b.spr) {
      case 'bedT': case 'bedD': case 'bedQ': {
        const mat = b.spr === 'bedT' ? '#54677a' : b.spr === 'bedD' ? '#5b5443' : '#6d5a45';
        P(g, w, h * .42, d, 0, h * .21, 0, WOOD);                              // estrado
        P(g, w * .96, h * .34, d * .92, 0, h * .58, 0, mat);                   // colchão
        P(g, w * .96, h * .1, d * .92, 0, h * .78, hs * d * .1, darken3(mat)); // dobra da colcha
        P(g, w * .5, h * .22, d * .2, 0, h * .82, hs * d * .32, CLOTH);        // travesseiro
        P(g, w, h * 1.6, .05, 0, h * .8, hs * (d / 2 - .02), WOODD);           // cabeceira
        LEGS4(g, w, d, h * .12, WOODD);
        break;
      }
      case 'sofa': {
        P(g, w, h * .42, d * .82, 0, h * .3, -d * .07, '#4c4030');             // assento
        P(g, w * .46, h * .14, d * .74, -w * .24, h * .58, -d * .07, '#564936'); // almofadas
        P(g, w * .46, h * .14, d * .74, w * .24, h * .58, -d * .07, '#514432');
        P(g, w, h * .95, d * .2, 0, h * .55, d / 2 - d * .1, '#463b2c');       // encosto
        P(g, w * .1, h * .8, d, -w / 2 + w * .05, h * .45, 0, '#463b2c');      // braços
        P(g, w * .1, h * .8, d, w / 2 - w * .05, h * .45, 0, '#463b2c');
        LEGS4(g, w, d, h * .1, WOODD);
        break;
      }
      case 'tv': {
        P(g, w, h * .68, d, 0, h * .5, 0, '#1a1c16');                          // gabinete
        P(g, w * .68, h * .44, .02, -w * .05, h * .52, -d / 2 - .005, '#2c3a34'); // tela (pro oeste)
        CY(g, .014, h * .07, w * .38, h * .5, -d / 2 - .01, '#7a8a80', 6);     // knobs
        CY(g, .014, h * .07, w * .38, h * .36, -d / 2 - .01, '#5a6a60', 6);
        P(g, w * .3, h * .16, d * .3, 0, h * .92, 0, '#2a271d');               // antena/base
        LEGS4(g, w, d, h * .14, WOODD);
        break;
      }
      case 'stove': {
        P(g, w, h * .9, d, 0, h * .45 + h * .1, 0, '#33302a');                 // corpo esmaltado
        P(g, w * .56, h * .42, .02, 0, h * .48, d / 2 + .005, '#221f19');      // porta do forno
        P(g, w * .4, h * .05, .025, 0, h * .58, d / 2 + .012, '#3a352b');      // puxador
        CY(g, .016, .02, -w * .22, h * .92, d / 2 - .02, '#8a734d', 6);        // botões em cima
        CY(g, .016, .02, w * .22, h * .92, d / 2 - .02, '#8a734d', 6);
        P(g, w * .8, .015, d * .8, 0, h + .008, 0, '#1c1a15');                 // chapa
        CY(g, w * .18, .012, -w * .2, h + .02, -d * .15, '#141210', 10);       // bocas
        CY(g, w * .18, .012, w * .2, h + .02, d * .15, '#141210', 10);
        break;
      }
      case 'clock': {
        P(g, w, h, d, 0, h / 2, 0, '#2c2115');                                 // caixa
        P(g, w * .8, h * .94, d * .5, 0, h / 2, d * .18, '#241b10');           // corpo recuado
        CY(g, w * .34, .015, 0, h * .82, d / 2, CLOTH, 12);                    // mostrador
        CY(g, w * .05, .018, 0, h * .82, d / 2 + .005, '#241f16', 6);         // eixo
        P(g, .02, h * .4, .012, 0, h * .38, d / 2 - .01, '#8a734d');          // pêndulo
        CY(g, .035, .015, 0, h * .2, d / 2 - .008, '#8a734d', 8);
        break;
      }
      case 'nightstand': {
        P(g, w, h * .82, d, 0, h * .48, 0, WOOD);
        P(g, w * .8, h * .3, .015, 0, h * .58, d / 2 + .005, WOODD);           // gaveta
        CY(g, .012, .015, 0, h * .58, d / 2 + .015, '#c9a34a', 6);            // puxador
        LEGS4(g, w, d, h * .14, WOODD);
        break;
      }
      case 'dresser': {
        P(g, w, h * .9, d, 0, h * .5, 0, WOOD);
        for (let i = 0; i < 3; i++) {
          P(g, w * .84, h * .2, .015, 0, h * (.28 + i * .26), d / 2 + .005, WOODD);
          CY(g, .012, .015, 0, h * (.28 + i * .26), d / 2 + .015, '#c9a34a', 6);
        }
        LEGS4(g, w, d, h * .08, WOODD);
        break;
      }
      case 'chair': {
        P(g, w, h * .1, d, 0, h * .5, 0, WOOD);                                // assento
        P(g, w, h * .55, .04, 0, h * .82, hs * (d / 2 - .02), '#3d3327');      // encosto
        LEGS4(g, w, d, h * .48, WOODD, .02);
        break;
      }
      case 'shelf': {
        P(g, .04, h, d, -w / 2 + .02, h / 2, 0, WOOD);                         // laterais
        P(g, .04, h, d, w / 2 - .02, h / 2, 0, WOOD);
        P(g, w, .03, d, 0, h - .015, 0, WOOD);                                 // topo
        const BOOKS = ['#5a2f2a', '#3a3a5a', '#2a4a2a', '#5a4a1f', '#4a4a2f'];
        for (let s2 = 0; s2 < 3; s2++) {
          const sy = h * (.22 + s2 * .27);
          P(g, w - .06, .025, d * .9, 0, sy, 0, WOODD);                        // prateleira
          let bx = -w / 2 + .07;
          for (let k = 0; k < 5 && bx < w / 2 - .1; k++) {                     // livros
            const bw = .035 + ((s2 * 7 + k * 3) % 3) * .012, bh = .1 + ((s2 + k) % 3) * .02;
            P(g, bw, bh, d * .6, bx + bw / 2, sy + bh / 2 + .012, 0, BOOKS[(s2 * 2 + k) % BOOKS.length]);
            bx += bw + .012;
          }
        }
        break;
      }
      case 'crate': {
        P(g, w, h, d, 0, h / 2, 0, '#4a3d2b');
        P(g, w + .015, .02, d + .015, 0, h * .96, 0, '#5c4c36');               // borda do tampo
        P(g, w + .01, .018, d * .16, 0, h * .5, 0, '#3b3122');                 // ripas
        P(g, w * .16, .018, d + .01, 0, h * .5, 0, '#3b3122');
        break;
      }
      case 'counter': {
        P(g, w, h * .86, d, 0, h * .43, 0, '#494439');                         // corpo
        P(g, w + .03, .03, d + .03, 0, h * .9, 0, '#5a554a');                  // tampo
        P(g, w * .4, .02, d * .5, -w * .18, h * .93, 0, '#3a362e');            // cuba
        CY(g, .01, .09, w * .04, h * .97, 0, '#8f9296', 6);                    // torneira
        P(g, w * .4, h * .3, .015, w * .22, h * .5, d / 2 + .005, '#3a362e');  // portinha
        break;
      }
      case 'lowtable': {
        P(g, w, .035, d, 0, h * .9, 0, WOOD);                                  // tampo
        P(g, w * .8, .02, d * .7, 0, h * .38, 0, WOODD);                       // prateleira baixa
        LEGS4(g, w, d, h * .86, WOODD, .02);
        break;
      }
      default:
        P(g, w, h, d, 0, h / 2, 0, b.top || '#3a2f22');
    }
    g.position.set((b.x0 + b.x1) / 2, 0, (b.y0 + b.y1) / 2);
    return g;
  }
  function darken3(hex) {
    const n = parseInt(hex.slice(1), 16);
    const f2 = (v) => Math.max(0, (v * .72) | 0);
    return '#' + ((f2(n >> 16) << 16) | (f2((n >> 8) & 255) << 8) | f2(n & 255)).toString(16).padStart(6, '0');
  }
  for (const b of BOXES) scene.add(buildFurn(b));

  /* ---- QUADROS, CARTAZES E JANELAS: presos na parede, não no jogador ----
     Antes eram billboards como qualquer outro sprite — giravam no eixo Y
     para sempre encarar a câmera, e um retrato ou um ESTANDARTE fazendo
     isso lê como banner perseguindo quem anda pelo corredor. Um quadro
     pendurado não faz isso: fica preso na parede, encarando pra sempre a
     mesma direção. wallFacing() acha a parede mais perto (norte/sul/
     leste/oeste) e devolve pra que lado o objeto deve olhar; a orientação
     é calculada uma vez, na hora de montar a cena — não a cada quadro. */
  function wallFacing(x, y) {
    const cx = Math.floor(x), cy = Math.floor(y);
    const solidAt = (mx, my) => { const r = CUR.map[my]; return !r || r[mx] !== 0; };
    const cands = [];
    if (solidAt(cx, cy - 1)) cands.push({ dx: 0, dy: 1, dist: y - cy });          // parede ao norte → encara sul
    if (solidAt(cx, cy + 1)) cands.push({ dx: 0, dy: -1, dist: (cy + 1) - y });   // parede ao sul → encara norte
    if (solidAt(cx - 1, cy)) cands.push({ dx: 1, dy: 0, dist: x - cx });          // parede a oeste → encara leste
    if (solidAt(cx + 1, cy)) cands.push({ dx: -1, dy: 0, dist: (cx + 1) - x });   // parede a leste → encara oeste
    cands.sort((a, b) => a.dist - b.dist);
    return cands[0] || { dx: 0, dy: 1 };
  }
  const WALL_DECOR = { retrato: 1, poster: 1, tapestry: 1, janela: 1 };
  function buildWallDecor(e) {
    const spr = SPR[e.spr]; if (!spr) return null;
    const h = Math.max(.12, e.sc), w = h * (spr.width / spr.height);
    const g = new THREE.Group();
    const isWindow = e.spr === 'janela';
    const depth = isWindow ? .09 : .032;
    const frameCol = isWindow ? '#1c1712' : e.spr === 'tapestry' ? '#241a10' : '#1d160d';
    P(g, w * 1.08, h * 1.1, depth, 0, 0, -depth * .55, frameCol);          // moldura funda, dá sombra real
    const picMat = new THREE.MeshLambertMaterial({ map: tex(spr), transparent: true, alphaTest: .04, side: THREE.DoubleSide });
    const pic = new THREE.Mesh(new THREE.PlaneGeometry(w, h), picMat);
    pic.position.z = isWindow ? -depth * .35 : .008;                        // janela: vidro recuado no vão
    g.add(pic);
    if (isWindow) {                                                        // caixilho cruzado na frente do vidro
      P(g, w * .05, h * .96, .012, 0, 0, .01, frameCol);
      P(g, w * .92, h * .05, .012, 0, 0, .01, frameCol);
    }
    const f = wallFacing(e.x, e.y);
    g.position.set(e.x - f.dx * .015, (e.lift || 0) + h / 2, e.y - f.dy * .015);
    g.rotation.y = Math.atan2(f.dx, f.dy);
    return g;
  }

  /* ---- PLANTA e CABIDEIRO: viraram peças de verdade (vaso+folhagem em
     volume, cabide com gancho e casaco) — o mesmo tratamento que já vale
     pros móveis, só que soltos no chão em vez de presos numa caixa. ---- */
  const plantLeafGeo = new THREE.SphereGeometry(1, 6, 5);   // uma esfera achatada, reaproveitada por toda folha
  function buildPlant(e) {
    const h = Math.max(.14, e.sc);
    const g = new THREE.Group();
    const potH = h * .30;
    CY(g, h * .21, potH, 0, potH / 2, 0, '#4a3a28', 8);
    CY(g, h * .165, potH * .12, 0, potH * .94, 0, '#5a4632', 8);
    CY(g, h * .022, h * .40, 0, potH + h * .18, 0, '#2f3b24', 5);          // caule
    /* copa em CACHOS de esferas achatadas — não cones pontudos (aquilo lia
       como guarda-chuva, não planta). Verde escuro e saturado de propósito:
       perto da lanterna do jogador, um verde claro estoura pra creme. */
    const seed = Math.abs(Math.sin(e.x * 12.9898 + e.y * 78.233) * 43758.5453) % 1;
    const leafCols = ['#2c3a20', '#334423', '#243318', '#3a4a28'];
    const n = 13;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + seed * 6.28;
      const ring = i % 3;
      const ry = potH + h * (.30 + ring * .16 + ((i * 5) % 3) * .025);
      const rr = h * (.05 + ring * .028);
      const rad = h * (.10 + ((i * 3 + seed * 7) % 4) * .022);
      const leaf = new THREE.Mesh(plantLeafGeo, solid(leafCols[i % leafCols.length]));
      leaf.scale.set(rad, rad * .58, rad);
      leaf.position.set(Math.cos(a) * rr, ry, Math.sin(a) * rr);
      g.add(leaf);
    }
    g.position.set(e.x, 0, e.y);
    return g;
  }
  function buildCoatrack(e) {
    const h = Math.max(.14, e.sc);
    const g = new THREE.Group();
    CY(g, h * .11, h * .025, 0, h * .015, 0, '#1d160d', 12);                // base
    CY(g, h * .017, h * .84, 0, h * .45, 0, '#2c2115', 8);                  // haste
    CY(g, h * .05, h * .02, 0, h * .87, 0, '#3a2c1c', 10);                  // topo torneado
    for (const ang of [0, 2.1, 4.2, 1.05]) {
      const hook = new THREE.Mesh(new THREE.TorusGeometry(h * .05, h * .009, 5, 8, Math.PI * 1.25), solid('#3a2c1c'));
      hook.position.set(Math.cos(ang) * h * .018, h * (ang % 2 ? .62 : .74), Math.sin(ang) * h * .018);
      hook.rotation.y = ang; hook.rotation.x = Math.PI / 2;
      g.add(hook);
    }
    // o casaco pendurado: dois volumes afunilados (ombro largo, barra estreita).
    // Tom bem escuro de propósito — de perto, junto da lanterna do jogador,
    // um tecido claro estoura pra quase branco; escuro segura melhor a cor.
    const coat = new THREE.Mesh(new THREE.CylinderGeometry(h * .095, h * .155, h * .40, 10, 1, true), solid('#20241f'));
    coat.material.side = THREE.DoubleSide;
    coat.position.set(0, h * .48, 0);
    g.add(coat);
    P(g, h * .19, h * .05, h * .05, 0, h * .70, 0, '#20241f');              // ombros
    g.position.set(e.x, 0, e.y);
    return g;
  }

  // ---- GENTE: planos com o sprite procedural, billboard no eixo Y — só
  // quem é GENTE deve girar pra encarar o jogador (quadro na parede, não).
  const bills = [];
  for (const e of ENTS) {
    if (!e.spr || BOX_DEFS[e.spr]) continue;
    if (WALL_DECOR[e.spr]) { const d = buildWallDecor(e); if (d) scene.add(d); continue; }
    if (e.spr === 'plant') { scene.add(buildPlant(e)); continue; }
    if (e.spr === 'coatrack') { scene.add(buildCoatrack(e)); continue; }
    if (e.spr === 'lamp') continue;                     // vira luminária de verdade, abaixo
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
  scene.add(new THREE.AmbientLight(0x453d2c, .72));   // ambiente quente de lâmpada fraca
  const lamps = [];
  for (const e of ENTS) {
    if (!e.glowWarm || lamps.length >= 12) continue;
    const L = new THREE.PointLight(0xe8be78, .8, 6.5, 1);
    L.position.set(e.x, .80, e.y);
    scene.add(L); lamps.push({ L, x: e.x, y: e.y, base: .8 });
  }
  // globo visível da lâmpada + cúpula cônica de verdade (senão a luz vem do nada)
  const bulbGeo = new THREE.SphereGeometry(.045, 8, 6);
  const bulbMat = new THREE.MeshBasicMaterial({ color: 0xf6e0a8 });
  const shadeMat = new THREE.MeshLambertMaterial({ color: 0x241c12, side: THREE.DoubleSide });
  const shadeRimMat = new THREE.MeshBasicMaterial({ color: 0x6a5228 });
  for (const l of lamps) {
    const bulb = new THREE.Mesh(bulbGeo, bulbMat);
    bulb.position.set(l.x, .80, l.y); scene.add(bulb);
    const cord = new THREE.Mesh(new THREE.CylinderGeometry(.006, .006, .16, 4), new THREE.MeshBasicMaterial({ color: 0x15130d }));
    cord.position.set(l.x, .87, l.y); scene.add(cord);
    const shade = new THREE.Mesh(new THREE.CylinderGeometry(.018, .085, .11, 12, 1, true), shadeMat);
    shade.position.set(l.x, .885, l.y); scene.add(shade);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(.085, .006, 5, 12), shadeRimMat);
    rim.rotation.x = Math.PI / 2; rim.position.set(l.x, .83, l.y); scene.add(rim);
  }
  const lantern = new THREE.PointLight(0xcfc09a, .56, 4.6, 1);   // a luz que o próprio corpo carrega
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
    // PIXELADO: renderiza em ~40% e amplia sem suavização — o 3D ganha o
    // mesmo grão do resto do jogo (nada de render liso "de engine")
    const RES = .42;
    const w = Math.max(2, ((cv2.clientWidth || 640) * RES) | 0), h = Math.max(2, ((cv2.clientHeight || 400) * RES) | 0);
    if (GL.cv.width !== w || GL.cv.height !== h) {
      GL.renderer.setSize(w, h, false);
      GL.cam.aspect = w / h; GL.cam.updateProjectionMatrix();
    }
    const eye = .58 + (HOUSE.bobY || 0) * .0022;   // olho de gente em pé, quase no forro
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
