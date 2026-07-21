/* ============================================================
   HUMANOCRACY — photochar.js
   Adaptador do busto do guichê para o motor procedural (faces.js).
   O pipeline photobash (characters.js) foi descartado: o busto
   grande agora é o MESMO rosto determinístico do documento e do
   exame, renderizado maior e com o VHS mais pesado — a identidade
   visual do cidadão é uma só em todos os contextos.
   ============================================================ */
'use strict';

function applyActorPhoto(cz) {
  const actor = document.getElementById('npc-actor');
  const cv = document.getElementById('npc-photo');
  if (!actor || !cv || !cz || typeof renderActorBust !== 'function') return false;
  if (!cz.isSilente && !cz.features) return false;
  try {
    renderActorBust(cz, cv);
  } catch (e) {
    actor.classList.remove('use-photo');
    return false;
  }
  actor.classList.add('use-photo');
  return true;
}

function clearActorPhoto() {
  const actor = document.getElementById('npc-actor');
  if (actor) actor.classList.remove('use-photo');
}

window.applyActorPhoto = applyActorPhoto;
window.clearActorPhoto = clearActorPhoto;
