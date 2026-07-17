/* ============================================================
   HUMANOCRACY — photochar.js
   Usa os personagens photobash+VHS (characters.js) no guichê.
   Cada imagem base vira "quase infinitos" cidadãos: flip
   horizontal + variação sutil de matiz/brilho por pessoa.
   Degrada para o retrato SVG se não houver foto adequada.
   ============================================================ */
'use strict';

const PHOTOS = { ready: false, img: {}, list: [] };
(function loadPhotos() {
  if (typeof PHOTO_CHARS === 'undefined' || !PHOTO_CHARS.length) return;
  PHOTOS.list = PHOTO_CHARS;
  let n = 0;
  const done = () => {
    if (++n < PHOTO_CHARS.length) return;
    PHOTOS.ready = true;
    // rede de segurança: se um cidadão já estava na tela antes das fotos
    // decodificarem, re-renderiza agora.
    try {
      if (window.shift && shift.citizen && shift.running) applyActorPhoto(shift.citizen);
    } catch (e) {}
  };
  PHOTO_CHARS.forEach(rec => {
    const im = new Image();
    im.onload = done; im.onerror = done;
    im.src = rec.data;
    PHOTOS.img[rec.id] = im;
  });
})();

/* evita repetir o mesmo rosto duas vezes seguidas (com pool pequeno,
   isso é o que mais entrega "tá repetindo" — mais importante que ter
   muitas fotos é nunca mostrar a MESMA logo depois da anterior) */
const RECENT = [];
function _rememberAndFilter(cands) {
  if (cands.length <= 1) return cands;
  const fresh = cands.filter(r => !RECENT.includes(r.id));
  return fresh.length ? fresh : cands;
}
function _remember(id) {
  RECENT.push(id);
  if (RECENT.length > 2) RECENT.shift();
}
function _photoBy(pred) {
  const c = _rememberAndFilter(PHOTOS.list.filter(pred));
  return c.length ? c[Math.floor(Math.random() * c.length)] : null;
}
function _humanBySex(sex) {
  return _photoBy(r => r.kind === 'human' && (r.sex === sex || r.sex === '-'))
      || _photoBy(r => r.kind === 'human');
}

function pickPhotoFor(cz) {
  if (!PHOTOS.list.length) return null;
  if (cz.photoId) return PHOTOS.list.find(r => r.id === cz.photoId) || null;
  let rec = null;
  if (cz.isSilente) {
    rec = _photoBy(r => r.kind === 'silente') || _photoBy(r => r.kind === 'alt');
  } else if (cz.isAlternado) {
    const r = Math.random();
    if (r < 0.5) rec = _photoBy(p => p.kind === 'alt') || _humanBySex(cz.sexo);
    else if (r < 0.6) rec = _photoBy(p => p.kind === 'dog') || _humanBySex(cz.sexo);
    else rec = _humanBySex(cz.sexo);
  } else {
    if (cz.etnia === 'bahari' && Math.random() < 0.55) rec = _photoBy(r => r.tag === 'coberta');
    rec = rec || _humanBySex(cz.sexo);
  }
  if (!rec) rec = PHOTOS.list[0];
  _remember(rec.id);
  cz.photoId = rec.id;
  // variação por cidadão para multiplicar a variedade aparente
  cz.photoFlip = Math.random() < 0.5;
  const wild = rec.kind === 'alt' || rec.kind === 'silente';
  cz.photoHue = (Math.random() * 2 - 1) * (wild ? 26 : 12) | 0;
  cz.photoBri = (0.9 + Math.random() * 0.18).toFixed(3);
  cz.photoSat = wild ? 1 : (0.92 + Math.random() * 0.16).toFixed(3);
  // leve zoom/pan por pessoa: mesma foto nunca enquadra igual duas vezes.
  // pan em px fixos (não fração de W) — fotos já viram bustos bem largos
  // (paisagem) depois do recorte, então uma fração de W vira deslocamento
  // grande demais e empurra o rosto pra fora da janela.
  cz.photoZoom = (1.02 + Math.random() * 0.07).toFixed(3);
  cz.photoPanX = (Math.random() * 2 - 1) * 9;
  return rec;
}

function applyActorPhoto(cz) {
  const actor = document.getElementById('npc-actor');
  const cv = document.getElementById('npc-photo');
  if (!actor || !cv) return false;
  const rec = cz ? pickPhotoFor(cz) : null;
  const img = rec && PHOTOS.img[rec.id];
  if (!rec || !img || !img.complete || !img.naturalWidth) {
    actor.classList.remove('use-photo');
    return false;
  }
  const H = 360, W = Math.max(1, Math.round(H * img.naturalWidth / img.naturalHeight));
  cv.width = W; cv.height = H;
  const ctx = cv.getContext('2d');
  ctx.clearRect(0, 0, W, H);
  ctx.save();
  ctx.filter = `hue-rotate(${cz.photoHue || 0}deg) brightness(${cz.photoBri || 1}) saturate(${cz.photoSat || 1})`;
  if (cz.photoFlip) { ctx.translate(W, 0); ctx.scale(-1, 1); }
  // zoom/pan por instância: a mesma foto nunca enquadra igual duas vezes
  const z = cz.photoZoom || 1, panX = cz.photoPanX || 0;
  const dw = W * z, dh = H * z;
  ctx.drawImage(img, -((dw - W) / 2) + panX, -(dh - H), dw, dh);
  ctx.restore();
  actor.classList.add('use-photo');
  return true;
}

function clearActorPhoto() {
  const actor = document.getElementById('npc-actor');
  if (actor) actor.classList.remove('use-photo');
}

window.pickPhotoFor = pickPhotoFor;
window.applyActorPhoto = applyActorPhoto;
window.clearActorPhoto = clearActorPhoto;
window.PHOTOS = PHOTOS;
