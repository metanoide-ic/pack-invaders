/* ============================================================
   HUMANOCRACY — house.js
   20:30. Você chega em casa. Eles estão lá. Provavelmente
   são eles.
   Sala: sua mãe e a TV que não desliga. Cozinha: Vessa e as
   fofocas. Quarto do Tomi: as visões. Quarto do Dario: o
   amigo que ninguém sabe de onde vem.
   ============================================================ */
'use strict';

const WORLD_W = 2400;
const HOUSE = {
  active: false, px: 140, vx: 0, targetX: null, facing: 1,
  clockMin: 1230, acc: 0, lastTs: 0, raf: null,
  spoke: {}, knock: null, pendingInteract: null, forcedSleep: false,
};
const KEYS = {};

/* ---------- LAYOUT ---------- */
const H_ROOMS = [
  { x: 0, w: 640, label: 'sala' },
  { x: 640, w: 540, label: 'cozinha' },
  { x: 1180, w: 520, label: 'quarto de tomi' },
  { x: 1700, w: 420, label: 'quarto de dario' },
  { x: 2120, w: 280, label: 'seu quarto' },
];
const H_SPOTS = {
  door: { x: 70, label: 'A PORTA' },
  mae: { x: 470, label: 'MÃE' },
  vessa: { x: 930, label: 'VESSA' },
  tomi: { x: 1390, label: 'TOMI' },
  dario: { x: 1965, label: 'DARIO' },
  bed: { x: 2250, label: 'DORMIR' },
};

/* ---------- FIGURAS ---------- */
function hFig(kind, m) {
  // figuras de corpo inteiro, minimalistas, tristes na medida certa
  if (kind === 'mae') return `<svg viewBox="0 0 60 90" width="60" height="90"><g class="breath">
    <path d="M12 88 L14 52 Q30 44 46 52 L48 88 Z" fill="#3a332a"/>
    <path d="M10 58 Q30 46 50 58 L50 66 Q30 56 10 66 Z" fill="#4a4036"/>
    <circle cx="30" cy="38" r="9" fill="#e0c09a"/>
    <circle cx="30" cy="29" r="5" fill="#b5b5a5"/>
    <path d="M22 36 Q30 30 38 36" stroke="#b5b5a5" stroke-width="3" fill="none"/>
    ${m && m.sick ? '<path d="M12 60 Q30 50 48 60 L48 74 Q30 64 12 74 Z" fill="#55432e"/>' : ''}
  </g></svg>`;
  if (kind === 'vessa') return `<svg viewBox="0 0 50 100" width="50" height="100"><g class="breath">
    <rect x="17" y="42" width="16" height="46" fill="#3d3630"/>
    <path d="M17 52 L33 52 L31 84 L19 84 Z" fill="#7a6a4f"/>
    <rect x="14" y="40" width="22" height="16" rx="4" fill="#42392f"/>
    <circle cx="25" cy="30" r="8.5" fill="#e8c39e"/>
    <path d="M17 28 Q25 18 33 28 L33 34 Q25 26 17 34 Z" fill="#40301e"/>
    <rect x="30" y="46" width="12" height="4" rx="2" fill="#e8c39e" transform="rotate(18 30 46)"/>
    ${m && m.sick ? '<rect x="12" y="44" width="26" height="10" fill="#55432e"/>' : ''}
  </g></svg>`;
  if (kind === 'tomi') return `<svg viewBox="0 0 46 70" width="46" height="70"><g class="rocking">
    <rect x="14" y="30" width="18" height="26" rx="4" fill="#4a5a6a"/>
    <rect x="14" y="52" width="7" height="16" fill="#3a4652"/><rect x="25" y="52" width="7" height="16" fill="#3a4652"/>
    <circle cx="23" cy="20" r="8" fill="#ecd0ae"/>
    <path d="M15 18 Q23 10 31 18 L31 21 Q23 15 15 21 Z" fill="#54432a"/>
    <circle cx="20" cy="20" r="1" fill="#222"/><circle cx="26" cy="20" r="1" fill="#222"/>
    ${m && m.sick ? '<rect x="10" y="34" width="26" height="10" fill="#55432e"/>' : ''}
  </g></svg>`;
  if (kind === 'dario') return `<svg viewBox="0 0 46 100" width="46" height="100"><g class="breath">
    <rect x="15" y="34" width="16" height="40" rx="3" fill="#2e3230"/>
    <rect x="16" y="72" width="6" height="24" fill="#26292a"/><rect x="24" y="72" width="6" height="24" fill="#26292a"/>
    <circle cx="23" cy="24" r="8.5" fill="#a9744f"/>
    <path d="M14 24 Q14 12 23 13 Q32 12 32 24 Q28 18 23 18 Q18 18 14 24 Z" fill="#191919"/>
    ${m && m.sick ? '<rect x="12" y="38" width="24" height="10" fill="#55432e"/>' : ''}
  </g></svg>`;
  if (kind === 'player') return `<svg viewBox="0 0 44 96" width="44" height="96">
    <g class="legs">
      <rect class="leg legL" x="15" y="62" width="6" height="32" fill="#24211b"/>
      <rect class="leg legR" x="23" y="62" width="6" height="32" fill="#1e1c17"/>
    </g>
    <g class="body">
      <path d="M12 64 L13 30 Q22 24 31 30 L32 64 Z" fill="#2c2820"/>
      <rect x="10" y="30" width="24" height="9" fill="#332e24"/>
      <circle cx="22" cy="20" r="8" fill="#e0bd96"/>
      <path d="M13 17 L31 17 L30 12 Q22 8 14 12 Z" fill="#211d17"/>
      <rect x="12" y="16" width="20" height="2.4" fill="#191611"/>
    </g>
  </svg>`;
  return '';
}

/* ---------- MOBÍLIA ---------- */
function hFurniture() {
  const F = S.family;
  let w = '';
  // quartos
  H_ROOMS.forEach(r => {
    w += `<div class="room" style="left:${r.x}px;width:${r.w}px"><span class="room-label">${r.label}</span></div>`;
  });
  w += `<div class="room-floor" style="width:${WORLD_W}px"></div>`;
  // ------- porta de entrada -------
  w += `<div class="hdoor" id="h-door" data-spot="door" style="left:34px;bottom:11%;width:64px;height:150px">
    <svg viewBox="0 0 64 150" width="64" height="150">
      <rect x="6" y="4" width="52" height="146" fill="#241f16" stroke="#171310" stroke-width="3"/>
      <rect x="12" y="12" width="40" height="60" fill="#1d1912"/><rect x="12" y="80" width="40" height="60" fill="#1d1912"/>
      <circle cx="50" cy="78" r="3" fill="#8a734d"/>
      <circle cx="32" cy="52" r="2.4" fill="#0a0908" stroke="#3a3324"/>
    </svg></div>`;
  // ------- SALA: TV + sofá + mãe -------
  w += `<div class="furn" style="left:150px;bottom:11%;width:90px;height:88px">
    <svg viewBox="0 0 90 88" width="90" height="88">
      <rect x="14" y="6" width="62" height="48" rx="4" fill="#141610" stroke="#2a2c22" stroke-width="3"/>
      <rect x="20" y="12" width="50" height="36" fill="#25302c"/>
      <rect x="40" y="54" width="10" height="18" fill="#211e16"/><rect x="26" y="72" width="38" height="5" fill="#211e16"/>
    </svg></div>`;
  w += `<div class="tv-glow" style="left:180px;bottom:12%;width:420px;height:150px"></div>`;
  w += `<div class="furn" style="left:380px;bottom:11%;width:200px;height:74px">
    <svg viewBox="0 0 200 74" width="200" height="74">
      <rect x="4" y="26" width="192" height="40" rx="8" fill="#3d3327"/>
      <rect x="4" y="10" width="26" height="56" rx="8" fill="#463b2c"/><rect x="170" y="10" width="26" height="56" rx="8" fill="#463b2c"/>
      <rect x="30" y="18" width="140" height="16" rx="6" fill="#463b2c"/>
      <rect x="8" y="64" width="8" height="8" fill="#221d14"/><rect x="184" y="64" width="8" height="8" fill="#221d14"/>
    </svg></div>`;
  if (F.mae.alive) w += `<div class="hchar" id="h-mae" data-spot="mae" style="left:440px;bottom:14%">${hFig('mae', F.mae)}</div>`;
  // ------- COZINHA: mesa + fogão + Vessa -------
  w += `<div class="furn" style="left:700px;bottom:11%;width:150px;height:60px">
    <svg viewBox="0 0 150 60" width="150" height="60">
      <rect x="6" y="14" width="138" height="8" fill="#4a3d2b"/>
      <rect x="16" y="22" width="8" height="36" fill="#3a3021"/><rect x="126" y="22" width="8" height="36" fill="#3a3021"/>
      <rect x="52" y="4" width="24" height="10" rx="2" fill="#2c2820"/>
    </svg></div>`;
  w += `<div class="furn" style="left:960px;bottom:11%;width:90px;height:78px">
    <svg viewBox="0 0 90 78" width="90" height="78">
      <rect x="6" y="22" width="78" height="54" fill="#33302a" stroke="#211e18" stroke-width="2"/>
      <rect x="14" y="30" width="30" height="24" fill="#221f19"/>
      <circle cx="24" cy="26" r="2" fill="#8a734d"/><circle cx="34" cy="26" r="2" fill="#8a734d"/>
      <rect x="52" y="12" width="26" height="12" rx="5" fill="#26231d"/>
    </svg></div>`;
  w += `<div class="steam" style="left:1018px;bottom:22%"></div><div class="steam s2" style="left:1018px;bottom:22%"></div>`;
  w += `<div class="lamp-glow" style="left:860px;bottom:14%;width:220px;height:140px"></div>`;
  if (F.vessa.alive) w += `<div class="hchar" id="h-vessa" data-spot="vessa" style="left:905px;bottom:12%">${hFig('vessa', F.vessa)}</div>`;
  // ------- QUARTO DO TOMI -------
  w += `<div class="furn" style="left:1290px;bottom:11%;width:180px;height:58px">
    <svg viewBox="0 0 180 58" width="180" height="58">
      <rect x="4" y="26" width="172" height="24" rx="4" fill="#3a4652"/>
      <rect x="4" y="10" width="20" height="42" rx="4" fill="#2e3a44"/>
      <rect x="26" y="20" width="34" height="12" rx="5" fill="#c9c2ab"/>
      <rect x="8" y="50" width="8" height="6" fill="#221d14"/><rect x="164" y="50" width="8" height="6" fill="#221d14"/>
    </svg></div>`;
  // desenhos na parede — um deles tem o pai com dois rostos
  w += `<div class="furn" style="left:1230px;bottom:52%;width:130px;height:44px">
    <svg viewBox="0 0 130 44" width="130" height="44">
      <rect x="2" y="4" width="34" height="36" fill="#d8d2bd" transform="rotate(-3 2 4)"/>
      <circle cx="19" cy="16" r="5" fill="none" stroke="#8a4a3a" stroke-width="1.4"/><line x1="19" y1="21" x2="19" y2="34" stroke="#8a4a3a" stroke-width="1.4"/>
      <rect x="48" y="2" width="34" height="36" fill="#d8d2bd" transform="rotate(2 48 2)"/>
      <circle cx="63" cy="14" r="5" fill="none" stroke="#3a5a8a" stroke-width="1.4"/><circle cx="71" cy="14" r="5" fill="none" stroke="#3a5a8a" stroke-width="1.4"/><line x1="67" y1="19" x2="67" y2="34" stroke="#3a5a8a" stroke-width="1.4"/>
      <rect x="94" y="5" width="34" height="36" fill="#d8d2bd" transform="rotate(-2 94 5)"/>
      <path d="M100 34 L110 14 L120 34 Z" fill="none" stroke="#4a7a4a" stroke-width="1.4"/>
    </svg></div>`;
  w += `<div class="lamp-glow" style="left:1330px;bottom:13%;width:180px;height:120px"></div>`;
  if (F.tomi.alive) w += `<div class="hchar" id="h-tomi" data-spot="tomi" style="left:1368px;bottom:16%">${hFig('tomi', F.tomi)}</div>`;
  // ------- QUARTO DO DARIO -------
  w += `<div class="furn" style="left:1740px;bottom:11%;width:170px;height:54px">
    <svg viewBox="0 0 170 54" width="170" height="54">
      <rect x="4" y="24" width="162" height="22" rx="4" fill="#33302a"/>
      <rect x="4" y="10" width="18" height="38" rx="4" fill="#2a2722"/>
      <rect x="24" y="18" width="30" height="10" rx="4" fill="#b5ae9c"/>
    </svg></div>`;
  // janela tapada com tábuas
  w += `<div class="furn" style="left:2020px;bottom:44%;width:70px;height:80px">
    <svg viewBox="0 0 70 80" width="70" height="80">
      <rect x="6" y="4" width="58" height="72" fill="#0a0c10" stroke="#241f16" stroke-width="4"/>
      <rect x="0" y="18" width="70" height="9" fill="#3a3021" transform="rotate(-6 0 18)"/>
      <rect x="0" y="44" width="70" height="9" fill="#352c1e" transform="rotate(4 0 44)"/>
    </svg></div>`;
  w += `<div class="corner-shadow" style="left:1950px;bottom:11%;width:170px;height:220px"></div>`;
  if (F.dario.alive) w += `<div class="hchar" id="h-dario" data-spot="dario" style="left:1942px;bottom:12%">${hFig('dario', F.dario)}</div>`;
  // ------- SEU QUARTO -------
  w += `<div class="furn" id="h-bed" data-spot="bed" style="left:2190px;bottom:11%;width:190px;height:64px;cursor:pointer">
    <svg viewBox="0 0 190 64" width="190" height="64">
      <rect x="4" y="28" width="182" height="28" rx="4" fill="#4a4036"/>
      <rect x="4" y="12" width="22" height="46" rx="4" fill="#3a332a"/>
      <rect x="28" y="22" width="40" height="14" rx="6" fill="#c9c2ab"/>
      <rect x="70" y="24" width="112" height="14" fill="#55432e"/>
      <rect x="8" y="56" width="8" height="6" fill="#221d14"/><rect x="172" y="56" width="8" height="6" fill="#221d14"/>
    </svg></div>`;
  w += `<div class="lamp-glow" style="left:2200px;bottom:13%;width:160px;height:110px"></div>`;
  return w;
}

/* ---------- DIÁLOGOS ---------- */
const H_LINES = {
  mae: {
    republica: [
      'Sente um pouco, filho. A televisão passou o dia inteiro falando dessa fila sua. Dizem que tem gente dormindo na calçada.',
      'Fiz chá. Esfriou. Faço outro amanhã. — Ela não desgruda os olhos da TV. — Esse apresentador novo pisca demais. Ou de menos. Um dos dois.',
      'Sua avó dizia: "quem vigia a porta esquece a janela". Eu nunca entendi. Agora entendo um pouco.',
    ],
    mehrvolk: [
      'Trocaram o hino de novo. Eu cantava o antigo pra você dormir... Agora dizem que o antigo é crime. Cantar baixinho também é?',
      'A vizinha do 11 denunciou o próprio genro, filho. GENRO. A televisão deu parabéns pra ela. Parabéns.',
      'Rasguei um papel essa semana. Não me arrependo. — Ela aumenta o volume da TV. — Não me arrependo.',
    ],
    conselho: [
      'Agora a televisão diz que os Alternados nunca existiram. Semana passada existiam demais. Eu já vivi muito pra acreditar em televisão, filho.',
      'Levaram o retrato antigo do corredor do prédio. Puseram outro. O rosto é diferente mas a moldura... a moldura é a mesma.',
      'Aquela família que mora no seu... quer dizer, NOSSO apartamento agora. Eles não fazem barulho nenhum. Nenhum. Nem os passos.',
    ],
    colapso: [
      'A televisão só dá chuvisco. Eu deixo ligada mesmo assim. A luz dela... faz companhia. Você acha que tem alguém do outro lado do chuvisco?',
      'Hoje eu fui andar. Eu sei que eu odeio andar. Mas alguma coisa em mim quis andar. Voltei, ué. Eu sempre volto. — Ela sorri. Demora um segundo a mais que o normal.',
      'Se um dia eu voltar diferente, filho... não abre a porta. Nem pra mim. Promete? — A TV chia. — Promete.',
    ],
    curto: ['Vai dormir, filho. Amanhã tem fila.', 'Shhh. Agora é a novela.', 'O chá esfriou de novo.'],
    doente: 'Ela está enrolada na manta, ardendo em febre. "Não gasta dinheiro comigo, filho. Gasta com os meninos." A TV continua ligada.',
  },
  vessa: {
    republica: [
      'Chegou... — Ela mexe a panela sem olhar. — A Marta veio aqui hoje. Aquela boca não para. Mas escuta, às vezes sai coisa útil do meio da fofoca.',
      'Sobrou pão de ontem. Amanhã eu dou um jeito no jantar. A gente sempre dá um jeito, não é?',
      'O arquivo tá estranho. Pastas que eu organizei... amanhecem em outra ordem. Deve ser o turno da noite. Deve ser.',
    ],
    mehrvolk: [
      'Me fizeram assinar um termo hoje. "Confiabilidade". A caneta era deles, o papel era deles, a mão era minha. Por enquanto a mão era minha.',
      'A Lena parou de vir. O marido dela achou "arriscado" a amizade. Amizade agora tem risco, entende?',
      'Cuidado com o que você carimba, meu amor. As paredes do arquivo ouvem. As daqui de casa eu já não sei.',
    ],
    conselho: [
      'Os realocados pediram sal DE NOVO. Terceira vez. O que é que eles cozinham que não faz cheiro, hein? Me diz.',
      'Fofoca do dia: dizem que quem trabalhou pro governo antigo tá sumindo. Você trabalhou pros dois, amor. Você trabalha pra qualquer um que mande. Isso salva ou condena?',
      'Eu guardei umas coisas numa mala. Não me olha assim. É só... por precaução. Todo mundo tem uma mala agora.',
    ],
    colapso: [
      'Não tem mais fofoca. As amigas... cada uma sumiu de um jeito. A Marta foi pro norte. Do norte não chega notícia. Nem ruim.',
      'Hoje eu vi a fila do seu posto de longe. Tanta gente, meu amor. E você lá dentro, decidindo. Como é que você dorme? — Ela para. — Desculpa. Eu sei como você dorme. Eu ouço.',
      'Quando isso acabar a gente atravessa também. Pro lado de lá. Deve ser igual. Mas pelo menos é LONGE.',
    ],
    curto: ['O jantar já foi. Te deixei um prato.', 'Amanhã eu te conto o resto.', 'Vai ver os meninos antes de dormir.'],
    doente: 'Ela está sentada no chão da cozinha, encostada no fogão apagado. "Já passa. Vai ver os meninos." Não passa.',
  },
  tomi: {
    republica: [
      'Pai! Eu desenhei a família. A professora gostou. Só perguntou por que eu desenhei você com dois rostos. Eu não lembro de ter desenhado o segundo.',
      'Pai, na fila da sua fronteira... as pessoas más têm cara de quê? Todo mundo tem cara de gente, não tem? Aí como é que você sabe?',
      'Eu sonhei com números. Um monte. Carimbados na testa das pessoas. O seu era bonito, pai. O seu era quase igual ao de verdade.',
    ],
    mehrvolk: [
      'A escola ensinou uma música nova. É legal mas... quando a gente canta todo mundo junto, parece que a sala fica escura. Pode ficar escuro de música, pai?',
      'Mandaram a gente desenhar "o inimigo". Eu desenhei um quadrado vazio. A professora ficou me olhando um tempão. Depois deu nota máxima.',
      'O Dario tá esquisito. Ele conversa sozinho no quarto. Só que... pai... às vezes a outra voz responde.',
    ],
    conselho: [
      'Trocaram os livros de novo. O herói do livro velho agora é o vilão do novo. Eu perguntei qual era o de verdade. Me mandaram sentar.',
      'Eu sonhei que batiam na porta a noite inteira. E quando eu abria, era eu do lado de fora. Eu pedindo pra entrar. Qual dos dois eu era, pai?',
      'A senhora do 7 sumiu, né? Eu vi os móveis saindo. Móvel não anda sozinho. Quer dizer... antigamente não andava.',
    ],
    colapso: [
      'A escola fechou. Eu fico olhando pela janela. Tem um cachorro que atravessa a rua sempre no mesmo lugar, na mesma hora. TODO dia. Igualzinho. Cachorro de verdade faz isso?',
      'Pai, se trocarem você, eu vou perceber? — Ele não está brincando. — Eu ia perceber. Eu IA. Pelo cheiro. Você tem cheiro de carimbo.',
      'Eu não tenho mais medo do escuro. O escuro é sempre igual. Eu tenho medo das coisas que ficam iguais DEMAIS.',
    ],
    curto: ['Boa noite, pai. Deixa a porta encostada?', 'Amanhã você me conta da fila?', 'Zzz... não... o carimbo não...'],
    doente: 'Ele está deitado, pequeno demais na cama. "Pai, eu sonhei que o remédio vinha voando pela janela." Tosse. "Remédio voa?"',
  },
  dario: {
    republica: [
      '...oi. — Ele não vira. Está de frente pro canto do quarto. — Eu tava conversando. Não. Ninguém. Esquece.',
      'A escola tá um saco. Perguntaram da minha mãe de novo. A minha mãe DE VERDADE. Eu disse que não lembro do rosto dela. Mentira. Eu lembro todo dia.',
      'O amigo diz que você é dos bons, pai. Eu falei que você é só... você. Ele riu. Ele acha você engraçado.',
    ],
    mehrvolk: [
      'A escola pediu meu "certificado de ancestralidade". A diretora olhou pra minha cara e disse "você entende, não é?". EU ENTENDO. É isso que dá ser filho da mulher errada, né, pai?',
      'Me chamaram de "mistura" no pátio. O professor ouviu. O professor CONCORDOU. — Ele soca a parede de leve, ritmado. — O amigo disse pra eu não revidar. Que logo não vai mais importar.',
      'O amigo disse que essas leis não são pra pegar os de fora. São pra treinar os de dentro. Treinar a gente a apontar. Ele fala umas coisas, pai...',
    ],
    conselho: [
      'Agora dizem que raça não existe e que era tudo mentira do governo velho. Ontem eu era "mistura", hoje eu sou "camarada". Amanhã eu sou o quê? Quem decide o que eu sou?',
      'O amigo não gosta dos realocados. Ele fica quieto quando eles cozinham. É a única hora que ele fica quieto.',
      'Você nunca pergunta com quem eu falo. Todo mundo pergunta. Você não. — Pausa. — Valeu. Acho.',
    ],
    colapso: [
      'O amigo tá diferente. Antes ele contava coisas. Agora ele só... espera. Fica esperando comigo. Esperando o quê, eu não sei.',
      'Se a gente for embora, ele disse que não pode ir junto. Que ele é DAQUI. Daqui tipo... da casa? Da cidade? Ele não explica.',
      'Pai. Uma vez. Só uma. Ele errou meu nome. Me chamou pelo SEU nome. E depois pediu desculpa como quem tinha visto uma coisa que ainda não aconteceu.',
    ],
    curto: ['...boa noite. — Ele volta a olhar pro canto.', 'A gente conversa amanhã, tô no meio de uma coisa.', 'Ele diz boa noite também. Brincadeira. Vai dormir, pai.'],
    doente: 'Ele está na cama, virado pra parede. "O amigo disse que eu vou melhorar. Ele nunca erra essas coisas. Nunca."',
  },
};

/* Falas especiais por dia (sobrepõem a fala-base quando existem) */
const H_SPECIAL = {
  44: { vessa: 'Eu não saí de casa hoje. — Ela diz isso antes de você perguntar qualquer coisa. Ela não para de mexer a panela vazia. — Por que você está me olhando assim? EU NÃO SAÍ DE CASA HOJE.' },
  47: { tomi: 'Você usava uma caneca azul hoje, pai? Lascada? — Ele não olha pra você. — O homem do meu sonho disse "obrigado pelo carimbo duplo". Ele mandou lembrança.' },
  20: { tomi: 'A professora elogiou meu desenho de novo. O da família. Pai... eu desenhei a gente com CINCO pessoas. Nós não somos quatro mais a vovó? Quem é o quinto? Eu não lembro de desenhar o quinto.' },
  17: { mae: 'Eu rasguei o formulário. — Ela olha pra você pela primeira vez na noite. — Eu SEI quem eu sou. Escreve aí no teu posto: a Odila sabe quem é. Poucos nesse país podem dizer o mesmo.' },
  15: { dario: 'A escola não me deixou entrar hoje sem o certificado. Fiquei no portão que nem cachorro. O amigo ficou comigo o tempo todo. Ele disse: "guarda os rostos de quem fechou o portão". Eu guardei, pai. Eu guardei.' },
};

/* ---------- INFORMAÇÕES (o valor de jogo das conversas) ---------- */
function infoVessa() {
  const r = rumorForDay(S.day + 1);
  if (!r) return 'A Marta não veio hoje. Sem fofoca, sem notícia. O silêncio das amigas é a pior notícia que existe.';
  const verdade = TELLS[r.tell].altBonus > 0;
  const acerta = chance(.75);
  const diz = acerta ? verdade : !verdade;
  return diz
    ? `Fofoca com fundamento: a Marta jurou que essa história de ${TELL_LABEL[r.tell]}... é VERDADE. O cunhado dela trabalha num posto do norte e viu. Amanhã deve chegar esse boato aí na sua fronteira. Fica esperto.`
    : `A Lena me contou: essa conversa de ${TELL_LABEL[r.tell]} é INVENÇÃO. Espalharam pra vender scanner, pra vender medo. Se aparecer no teu comunicado amanhã, pensa duas vezes antes de estragar a vida de alguém por isso.`;
}
function infoMae() {
  const n = SCRIPTED_NEWS[S.day + 1];
  if (n === null) return 'A moça da televisão despediu-se hoje com "até amanhã, se houver amanhã". Depois riu. Ninguém no estúdio riu junto.';
  if (n) return `A televisão adiantou o jornal de amanhã, filho: "${n.h.toLowerCase()}". Ou eu sonhei que adiantou. Na minha idade a televisão e o sonho passam no mesmo canal.`;
  return 'A televisão disse que está tudo sob controle. Foi a quarta vez que disseram essa frase hoje. Quem conta quatro vezes, não controla nada.';
}
const H_VISIONS = {
  3: 'Sonhei que um moço dormia na nossa escada abraçado num cobertor. Ele tinha frio DE DENTRO, pai. Dá pra ter frio de dentro?',
  6: 'Sonhei com dois homens de casaco comprido parados na porta. Eles não tinham prancheta de verdade. Era só pra segurar alguma coisa nas mãos.',
  10: 'Tem um bebê no meu sonho que não chora. A mãe pede água. Dá água pra ela, pai. Mesmo assim... não deixa ela entrar.',
  13: 'Sonhei com botas no corredor. Muitas. Eu contei, pai. Subiam seis. Desciam SETE.',
  19: 'Uma mão girando a maçaneta. Devagarinho. Com educação. No sonho eu sabia: quem gira assim não quer entrar. Quer saber se VOCÊ vai abrir.',
  22: 'Tem um menino que quer brincar comigo. Ele bate na porta bem baixinho, na altura do meu joelho. Ele diz que se chama Nico. Pai... eu NUNCA te contei o nome dele. Como é que eu sei o nome dele?',
  28: 'Sonhei com um homem de casaco cinza que anotava numa pasta. Ele já sabia as respostas. Ele só queria ver a sua cara enquanto você mentia.',
  32: 'Sonhei que a moça de lá do quarto pedia sal. Aí ela devolvia o pote cheio. Do MESMO jeitinho. Sal não volta sozinho, né, pai?',
  39: 'Sonhei com o seu carimbo indo embora dentro de um jornal. Ele voltava cheirando diferente. Carimbo tem saudade de casa?',
  43: 'Vai bater na porta a noite toda. Não vai ter ninguém. Aí a última batida... a última vem de dentro. Dorme com a luz acesa hoje, pai. Por mim.',
  46: 'Sonhei com a voz da vovó do lado de fora pedindo pra entrar. Mas a vovó tava dormindo aqui dentro. Pai... quem é que guarda a voz das pessoas quando elas dormem?',
};
function infoTomi() {
  if (H_VISIONS[S.day + 1] && NIGHT_EVENTS[S.day + 1]) return 'Pai, eu tive um daqueles sonhos... ' + H_VISIONS[S.day + 1];
  if (H_VISIONS[S.day]) return 'Lembra do sonho que eu ia te contar? ' + H_VISIONS[S.day];
  return pick([
    'Sonhei que a fila do seu trabalho dava volta no mundo e terminava aqui na nossa porta.',
    'Sonhei com o carimbo verde. Ele fazia as pessoas felizes. Aí eu virava o carimbo e atrás dele tinha outro carimbo.',
    'Hoje não sonhei nada, pai. O nada também conta como sonho?',
  ]);
}
function infoDario() {
  if (S.day >= 44) return 'O amigo parou de falar. Desde ontem. Ele só senta ali no canto e espera comigo. Eu perguntei "esperar o quê". Ele olhou pra porta.';
  if (S.day + 1 === 46) return '"A partir de agora eles não erram mais." Foi isso que ele disse. Palavra por palavra. E depois: "diz pro teu pai que não foi culpa dele. Diz ANTES."';
  if (WANTED_DAYS[S.day + 1]) return 'O amigo mandou um recado pra você. Sério. Ele disse: "amanhã passa alguém com o nome errado na lista dele. Que ele leia a lista com calma antes de carimbar qualquer coisa." Eu só tô repetindo, pai. Não me olha assim.';
  if (NIGHT_EVENTS[S.day + 1]) return 'O amigo avisou: amanhã à noite, quando baterem — porque VÃO bater — olha primeiro. E mesmo depois de olhar... pensa se vale abrir.';
  return pick([
    'O amigo perguntou de você hoje. Pelo nome. Pai... eu nunca disse seu nome pra ele.',
    'Perguntei de onde ele vem. Ele disse "de perto". Perguntei perto de quê. Ele disse "de você".',
    'O amigo não aparece em foto. A gente tentou. Não é que ele saia borrado. É que a foto sai... sem o canto do quarto.',
  ]);
}

/* ---------- BATIDAS NA PORTA ---------- */
function scheduleKnock() {
  HOUSE.knock = null;
  const ev = NIGHT_EVENTS[S.day];
  if (ev && !S.flags['night_' + S.day]) {
    HOUSE.knock = { type: 'scripted', ev, at: 1260 + ri(0, 40), active: false, answered: false };
  } else if (S.day >= 5 && S.day <= 46 && chance(.30)) {
    const roll = rnd();
    const type = roll < .5 ? 'gov' : roll < .8 ? 'vizinho' : 'estranho';
    HOUSE.knock = { type, at: 1265 + ri(0, 55), expire: 45, active: false, answered: false };
  }
}
function knockActivate() {
  const k = HOUSE.knock;
  k.active = true;
  k.lastSfx = HOUSE.clockMin;
  $('h-door').classList.add('knocking');
  sfx('knock');
}
function knockExpire() {
  const k = HOUSE.knock;
  HOUSE.knock = null;
  $('h-door').classList.remove('knocking');
  if (k.type === 'gov') {
    S.citTotal++;
    S.pendingNews.push({ day: S.day + 1, text: 'NOTA OFICIAL: um servidor público deixou de atender fiscalização domiciliar. A advertência consta do seu prontuário. O Estado bate uma vez.' });
    hSay('A PORTA', ['As batidas param. Passos descem a escada — devagar, sem pressa, como quem anota.',
      'De manhã você encontrará um papel colado na porta: "NOTIFICAÇÃO DE AUSÊNCIA — advertência registrada". O Estado também inspeciona quem inspeciona.']);
  } else if (k.type === 'estranho') {
    hSay('A PORTA', ['As batidas simplesmente param. Nenhum passo se afasta.', 'Você percebe que passou os últimos minutos sem piscar.']);
  } else {
    hSay('A PORTA', ['Quem quer que fosse, desistiu. Vizinhos desistem rápido, nos dias de hoje.']);
  }
}
function answerDoor() {
  const k = HOUSE.knock;
  if (!k || !k.active) {
    hSay('A PORTA', ['O olho mágico mostra o corredor vazio. O corredor mostra o olho mágico de volta.']);
    return;
  }
  k.answered = true;
  $('h-door').classList.remove('knocking');
  if (k.type === 'scripted') {
    S.flags['night_' + S.day] = true;
    HOUSE.knock = null;
    housePause();
    showNight(S.day, k.ev);
    return;
  }
  HOUSE.knock = null;
  if (k.type === 'gov') {
    hSay('FISCAL DO MINISTÉRIO', [
      'Um homem de casaco cinza, prancheta na mão. "Fiscalização de rotina, inspetor. Confirmando residência, composição familiar e... disposição."',
      'Ele olha por cima do seu ombro para dentro da casa. Conta as pessoas com os olhos. Anota.',
      '"Tudo conforme. Por enquanto." Ele desce a escada sem se despedir. Você fecha a porta com as duas mãos.',
    ]);
  } else if (k.type === 'vizinho') {
    hSay('UM VIZINHO', [
      'É o velho Ansel, do 3. "Desculpa a hora. É que... vocês têm fósforo? A luz caiu no meu lado e a minha caixa acabou."',
      'Você entrega a caixa de fósforos. Ele agradece três vezes e desce contando os degraus em voz alta. Todo mundo tem seus rituais agora.',
    ]);
  } else {
    hSay('…', [
      'Não há ninguém. Há um embrulho pequeno no capacho: dentro, um botão de casaco. Do SEU casaco — você confere a manga: não falta nenhum.',
      'Você olha o botão por um longo tempo. Depois olha a manga de novo. Depois decide que não vai contar isso pra ninguém.',
    ]);
  }
}

/* ---------- DIÁLOGO (typewriter) ---------- */
const HD = { open: false, lines: [], idx: 0, typing: null, chars: 0 };
function hSay(nome, lines, choices) {
  HD.open = true; HD.lines = lines.slice(); HD.idx = 0;
  $('hd-name').textContent = nome;
  $('hd-choices').innerHTML = '';
  $('house-dialog').classList.add('on');
  if (choices) HD.pendingChoices = choices; else HD.pendingChoices = null;
  hType();
}
function hType() {
  const text = HD.lines[HD.idx];
  HD.chars = 0;
  clearInterval(HD.typing);
  $('hd-text').textContent = '';
  HD.typing = setInterval(() => {
    HD.chars += 2;
    $('hd-text').textContent = text.slice(0, HD.chars);
    if (HD.chars >= text.length) { clearInterval(HD.typing); HD.typing = null; }
  }, 18);
}
function hAdvance() {
  if (!HD.open) return;
  if (HD.typing) { clearInterval(HD.typing); HD.typing = null; $('hd-text').textContent = HD.lines[HD.idx]; return; }
  HD.idx++;
  if (HD.idx < HD.lines.length) { hType(); return; }
  if (HD.pendingChoices) {
    const box = $('hd-choices');
    HD.pendingChoices.forEach(c => {
      const b = document.createElement('button');
      b.textContent = c.label;
      b.onclick = (e) => { e.stopPropagation(); hClose(); if (c.fn) c.fn(); };
      box.appendChild(b);
    });
    HD.pendingChoices = null;
    return;
  }
  hClose();
}
function hClose() {
  HD.open = false;
  clearInterval(HD.typing); HD.typing = null;
  $('house-dialog').classList.remove('on');
}

/* ---------- CONVERSAS ---------- */
function talkTo(id) {
  const ph = regimeOfDay(S.day);
  const L = H_LINES[id];
  const m = S.family[id];
  const nome = { mae: 'ODILA — sua mãe', vessa: 'VESSA — sua esposa', tomi: 'TOMI — 8 anos', dario: 'DARIO — 15 anos' }[id];
  if (!m.alive) return;
  if (m.sick) { hSay(nome, [L.doente]); HOUSE.spoke[id] = true; return; }
  if (HOUSE.spoke[id]) { hSay(nome, [pick(L.curto)]); return; }
  HOUSE.spoke[id] = true;
  const lines = [];
  const sp = H_SPECIAL[S.day];
  if (sp && sp[id]) lines.push(sp[id]);
  else lines.push(pick(L[ph]));
  const info = { mae: infoMae, vessa: infoVessa, tomi: infoTomi, dario: infoDario }[id]();
  lines.push(info);
  hSay(nome, lines);
}

/* ---------- LOOP ---------- */
function enterHouse() {
  setRegimeClass(S.day);
  document.body.classList.add('at-home');
  const world = $('house-world');
  world.innerHTML = hFurniture() + `<div id="house-player">${hFig('player')}</div>`;
  HOUSE.active = true; HOUSE.px = 140; HOUSE.vx = 0; HOUSE.targetX = null;
  HOUSE.clockMin = 1230; HOUSE.acc = 0; HOUSE.lastTs = 0;
  HOUSE.spoke = {}; HOUSE.forcedSleep = false;
  $('house-fade').classList.remove('on');
  hClose();
  scheduleKnock();
  showScreen('screen-house');
  startAmbience();
  cancelAnimationFrame(HOUSE.raf);
  HOUSE.raf = requestAnimationFrame(houseLoop);
  // primeira noite: uma linha de contexto
  if (S.day === 1) setTimeout(() => hSay('SUA CASA', [
    '20:30. O apartamento cheira a sopa rala e a aquecedor velho. Eles estão todos aqui. Sua mãe na sala. Vessa na cozinha. Os meninos nos quartos.',
    'Fale com eles. Eles sabem coisas que o posto não sabe. E durma na sua cama quando terminar — amanhã tem fila.',
  ]), 900);
}
function housePause() {
  HOUSE.active = false;
  cancelAnimationFrame(HOUSE.raf);
}
function houseResume() {
  HOUSE.active = true;
  HOUSE.lastTs = 0;
  cancelAnimationFrame(HOUSE.raf);
  HOUSE.raf = requestAnimationFrame(houseLoop);
}
function houseSleep(forced) {
  housePause();
  hClose();
  $('house-fade').classList.add('on');
  // batida do governo ignorada e você foi dormir? o papel na porta não perdoa
  if (HOUSE.knock && HOUSE.knock.active && HOUSE.knock.type === 'gov' && !HOUSE.knock.answered) knockExpireSilent();
  setTimeout(() => {
    document.body.classList.remove('at-home');
    afterNight();
    $('house-fade').classList.remove('on');
  }, 1700);
}
function knockExpireSilent() {
  S.citTotal++;
  S.pendingNews.push({ day: S.day + 1, text: 'NOTA OFICIAL: fiscalização domiciliar não atendida. Advertência registrada no prontuário do servidor.' });
  HOUSE.knock = null;
}
function houseLoop(ts) {
  if (!HOUSE.active) return;
  if (!HOUSE.lastTs) HOUSE.lastTs = ts;
  const dt = Math.min(50, ts - HOUSE.lastTs);
  HOUSE.lastTs = ts;

  // relógio: 1s real = 1 min
  if (!HD.open) {
    HOUSE.acc += dt;
    while (HOUSE.acc >= 1000) { HOUSE.acc -= 1000; HOUSE.clockMin++; houseMinute(); }
  }

  // movimento
  const player = $('house-player');
  let moving = false;
  if (!HD.open) {
    let dir = 0;
    if (KEYS.ArrowLeft || KEYS.a || KEYS.A) dir = -1;
    if (KEYS.ArrowRight || KEYS.d || KEYS.D) dir = 1;
    if (dir !== 0) { HOUSE.targetX = null; HOUSE.px += dir * dt * .22; HOUSE.facing = dir; moving = true; }
    else if (HOUSE.targetX !== null) {
      const d = HOUSE.targetX - HOUSE.px;
      if (Math.abs(d) > 4) { HOUSE.px += Math.sign(d) * dt * .22; HOUSE.facing = Math.sign(d); moving = true; }
      else {
        HOUSE.px = HOUSE.targetX; HOUSE.targetX = null;
        if (HOUSE.pendingInteract) { const p = HOUSE.pendingInteract; HOUSE.pendingInteract = null; interactWith(p); }
      }
    }
  }
  HOUSE.px = Math.max(40, Math.min(WORLD_W - 60, HOUSE.px));
  player.style.left = (HOUSE.px - 22) + 'px';
  player.classList.toggle('walking', moving);
  player.classList.toggle('flip', HOUSE.facing < 0);

  // câmera
  const vw = $('house-viewport').clientWidth;
  const cam = Math.max(0, Math.min(WORLD_W - vw, HOUSE.px - vw / 2));
  $('house-world').style.transform = `translate3d(${-cam}px,0,0)`;

  // prompt do interagível mais próximo
  const near = nearestSpot();
  const prompt = $('house-prompt');
  if (near && !HD.open) {
    prompt.classList.add('on');
    const label = near.id === 'door'
      ? (HOUSE.knock && HOUSE.knock.active ? '[E] ATENDER A PORTA' : '[E] Olhar pelo olho mágico')
      : near.id === 'bed' ? '[E] Dormir' : `[E] Falar com ${H_SPOTS[near.id].label}`;
    prompt.textContent = label;
    prompt.style.left = (H_SPOTS[near.id].x - cam) + 'px';
    prompt.style.top = '30%';
  } else prompt.classList.remove('on');

  HOUSE.raf = requestAnimationFrame(houseLoop);
}
function houseMinute() {
  const h = Math.floor(HOUSE.clockMin / 60) % 24, m = HOUSE.clockMin % 60;
  $('house-clock').textContent = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  const k = HOUSE.knock;
  if (k && !k.active && HOUSE.clockMin >= k.at) knockActivate();
  if (k && k.active && !k.answered) {
    if (HOUSE.clockMin - k.lastSfx >= 12) { k.lastSfx = HOUSE.clockMin; sfx('knock'); }
    if (k.expire && HOUSE.clockMin > k.at + k.expire) knockExpire();
  }
  // 23:30 — o corpo pede; 00:00 — o corpo decide
  if (HOUSE.clockMin >= 1440) { houseSleep(true); return; }
  if (HOUSE.clockMin >= 1410 && !HOUSE.forcedSleep) {
    HOUSE.forcedSleep = true;
    hSay('VOCÊ', ['Os olhos pesam. Quarenta e oito dias não se atravessam sem dormir.'], [
      { label: 'IR PARA A CAMA', fn: () => houseSleep(true) },
    ]);
  }
}
function nearestSpot() {
  let best = null, bd = 75;
  for (const id in H_SPOTS) {
    const m = S.family[id];
    if (m && !m.alive) continue;
    const d = Math.abs(H_SPOTS[id].x - HOUSE.px);
    if (d < bd) { bd = d; best = { id, d }; }
  }
  return best;
}
function interactWith(id) {
  if (id === 'door') { answerDoor(); return; }
  if (id === 'bed') {
    hSay('VOCÊ', ['Encerrar o dia?'], [
      { label: 'DORMIR', fn: () => houseSleep(false) },
      { label: 'AINDA NÃO', fn: () => {} },
    ]);
    return;
  }
  talkTo(id);
}

/* ---------- INPUT ---------- */
document.addEventListener('keydown', (e) => {
  KEYS[e.key] = true;
  if (!HOUSE.active && !HD.open) return;
  if (e.key === 'e' || e.key === 'E' || e.key === 'Enter') {
    if (HD.open) { hAdvance(); return; }
    const near = nearestSpot();
    if (near) interactWith(near.id);
  }
});
document.addEventListener('keyup', (e) => { KEYS[e.key] = false; });
$('house-viewport').addEventListener('click', (e) => {
  if (!HOUSE.active) return;
  if (HD.open) { hAdvance(); return; }
  const spotEl = e.target.closest('[data-spot]');
  const vw = $('house-viewport').clientWidth;
  const cam = Math.max(0, Math.min(WORLD_W - vw, HOUSE.px - vw / 2));
  if (spotEl) {
    const id = spotEl.dataset.spot;
    const d = Math.abs(H_SPOTS[id].x - HOUSE.px);
    if (d < 75) interactWith(id);
    else { HOUSE.targetX = H_SPOTS[id].x - 20; HOUSE.pendingInteract = id; }
    return;
  }
  const rect = $('house-viewport').getBoundingClientRect();
  HOUSE.targetX = e.clientX - rect.left + cam;
  HOUSE.pendingInteract = null;
});
$('house-dialog').addEventListener('click', (e) => { if (!e.target.closest('button')) hAdvance(); });
