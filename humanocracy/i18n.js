/* ============================================================
   HUMANOCRACY — i18n.js
   Arquitetura de idiomas: português é a fonte da verdade (chave),
   inglês é o primeiro idioma adicional (I18N_EN). T(s) devolve a
   tradução se existir e o idioma ativo não for 'pt'; senão devolve
   s sem alteração — nunca quebra se uma string não estiver traduzida.

   Cobertura desta versão: toda a interface estática (título, HUD,
   ferramentas, telas de pausa/exame/bagagem/casa), REGIME_LABEL,
   MASTHEAD e os 8 finais (ENDINGS) — o conteúdo de maior peso
   narrativo. NÃO cobre ainda: diálogo procedural da fila/casa,
   rádio, jornal de preenchimento, encontros roteirizados — o grosso
   do texto dinâmico do jogo, que fica como trabalho futuro (o
   dicionário abaixo é só crescer: adicionar entradas não quebra nada).
   ============================================================ */
'use strict';

const I18N_EN = {
  /* ---- título ---- */
  'MINISTÉRIO DE TRIAGEM E FRONTEIRAS — REPÚBLICA DE OSTERIA': 'MINISTRY OF SCREENING AND BORDERS — REPUBLIC OF OSTERIA',
  '"A verdade existe. Você só nunca terá acesso completo a ela."': '"The truth exists. You just never get full access to it."',
  'INICIAR SERVIÇO': 'BEGIN SERVICE',
  'RETOMAR TURNO': 'RESUME SHIFT',
  '↻ SEGUNDA LEITURA (mesma campanha)': '↻ SECOND READING (same campaign)',
  'Nova campanha, mesma seed: os mesmos cidadãos passam pelo seu guichê, nos mesmos dias. Você é que já não é o mesmo.':
    'New campaign, same seed: the same citizens pass through your booth, on the same days. You are the one who is no longer the same.',
  '⛶ TELA CHEIA (F)': '⛶ FULLSCREEN (F)',
  'MODO ARQUIVISTA (sem relógio)': 'ARCHIVIST MODE (no clock)',
  'O relógio do turno não avança sozinho — só quando você usa ferramentas. Pense com calma; a fila mesmo assim é finita.':
    "The shift clock doesn't move on its own — only when you use tools. Take your time; the queue is still finite.",
  'Este jogo retrata mecanismos de regimes totalitários — propaganda, pseudociência e perseguição — com o objetivo de criticá-los. Nada aqui é uma resposta. Nem mesmo isto.':
    'This game depicts the mechanisms of totalitarian regimes — propaganda, pseudoscience, and persecution — in order to critique them. Nothing here is an answer. Not even this.',
  'v1.0 — 48 dias — Posto de Triagem Nº 7, Fronteira Leste': 'v1.0 — 48 days — Screening Post No. 7, Eastern Border',

  /* ---- manhã ---- */
  'SEU APARTAMENTO — BLOCO 14, VALGRADO': 'YOUR APARTMENT — BLOCK 14, VALGRADO',
  'IR AO TRABALHO →': 'GO TO WORK →',

  /* ---- turno: HUD e ferramentas ---- */
  'COMUNICADO': 'BULLETIN',
  'ENCERRAR TURNO': 'END SHIFT',
  'Música ligada/desligada': 'Music on/off',
  'Aprovar': 'Approve', 'Rejeitar': 'Reject', 'Deter': 'Detain',
  'APV': 'APR',
  'Documentos': 'Documents', 'Carimbo': 'Stamp',
  'Aguardando próximo cidadão…': 'Awaiting next citizen…',
  'A FILA DE HOJE ACABOU.': "TODAY'S QUEUE IS OVER.",
  '🔍 INSPEÇÃO': '🔍 INSPECTION',
  '👁 EXAME FÍSICO': '👁 PHYSICAL EXAM',
  'Exame Físico aproximado (10 min)': 'Close physical exam (10 min)',
  '🧳 BAGAGEM': '🧳 LUGGAGE',
  'Revistar bagagem (10 min)': 'Search luggage (10 min)',
  '📜 LINHA DA VIDA': '📜 LIFE TIMELINE',
  'Organizar a vida documentada em cronologia (10 min)': 'Organize the documented life into a timeline (10 min)',
  '🌡 TÉRMICO': '🌡 THERMAL',
  'Scanner Térmico (15 min)': 'Thermal Scanner (15 min)',
  '📈 PULSAÇÃO': '📈 PULSE',
  'Scanner de Pulsação (15 min)': 'Pulse Scanner (15 min)',
  '🧬 BIOLÓGICO': '🧬 BIOLOGICAL',
  'Detector Biológico (30 min)': 'Biological Detector (30 min)',
  'REGULAMENTO DO DIA': "TODAY'S REGULATIONS",
  'REFERÊNCIA DE PAÍSES': 'COUNTRY REFERENCE',
  'Ligar/desligar o rádio do posto': "Turn the post's radio on/off",
  '…o rádio do posto aquece as válvulas…': "…the post's radio warms up its tubes…",

  /* ---- fim de dia / fim de jogo ---- */
  'FIM DO EXPEDIENTE': 'END OF SHIFT',
  'VOLTAR PARA CASA — 20:30 →': 'GO HOME — 20:30 →',
  'COMEÇAR DE NOVO': 'START OVER',

  /* ---- casa ---- */
  'WASD/setas andar · clique e mexa o mouse para olhar · E interagir · ESC solta o mouse':
    'WASD/arrows to walk · click and move mouse to look · E to interact · ESC to release mouse',
  'clique / E para continuar': 'click / E to continue',

  /* ---- exame / bagagem ---- */
  'EXAME FÍSICO APROXIMADO — clique nas regiões': 'CLOSE PHYSICAL EXAM — click on regions',
  'FECHAR': 'CLOSE',
  'REVISTA DE BAGAGEM — objetos contam histórias': 'LUGGAGE SEARCH — objects tell stories',
  'No modo INSPEÇÃO, um objeto pode ser comparado com um campo de documento.':
    'In INSPECTION mode, an object can be compared with a document field.',

  /* ---- pausa ---- */
  '— PAUSA —': '— PAUSED —',
  'CONTINUAR': 'RESUME',
  'MÚSICA: LIGADA': 'MUSIC: ON', 'MÚSICA: DESLIGADA': 'MUSIC: OFF',
  'SONS: LIGADOS': 'SOUND: ON', 'SONS: DESLIGADOS': 'SOUND: OFF',
  'TELA CHEIA (F)': 'FULLSCREEN (F)',
  'SALVAR E VOLTAR AO TÍTULO': 'SAVE AND RETURN TO TITLE',
  'O posto não pausa por você. Este menu, sim.': "The post doesn't pause for you. This menu does.",

  /* ---- citação / notificação ---- */
  '⚠ MINISTÉRIO DE TRIAGEM — NOTIFICAÇÃO': '⚠ MINISTRY OF SCREENING — NOTICE',

  /* ---- regimes / jornal (data.js) ---- */
  'REPÚBLICA DE OSTERIA': 'REPUBLIC OF OSTERIA',
  'ESTADO NACIONAL MEHRVOLK': 'MEHRVOLK NATIONAL STATE',
  'CONSELHO POPULAR DE OSTERIA': "OSTERIA PEOPLE'S COUNCIL",
  '— AUTORIDADE DESCONHECIDA —': '— UNKNOWN AUTHORITY —',
  'A VOZ DE OSTERIA': 'THE VOICE OF OSTERIA',
  'O CLARIM DA PUREZA': 'THE CLARION OF PURITY',
  'O TRABALHADOR UNIDO': 'THE UNITED WORKER',
  'FOLHA AVULSA': 'LOOSE SHEET',

  /* ---- modais de abertura de campanha ---- */
  'CONTRATO DE SERVIÇO — MINISTÉRIO DE TRIAGEM': 'SERVICE CONTRACT — MINISTRY OF SCREENING',
  'ASSINAR': 'SIGN',
  'CONTRATO DE SERVIÇO — MINISTÉRIO DE TRIAGEM (SEGUNDA LEITURA)': 'SERVICE CONTRACT — MINISTRY OF SCREENING (SECOND READING)',
  'O mesmo posto. Os mesmos 48 dias. Os mesmos cidadãos vão cruzar o seu guichê, pelas mesmas portas, nas mesmas horas.\n\nVocê não. Assine de novo — e descubra o quanto isso muda.':
    "The same post. The same 48 days. The same citizens will cross your booth, through the same doors, at the same hours.\n\nYou won't. Sign again — and find out how much that changes.",

  /* ---- REGIMES (rótulo curto usado no cabeçalho do turno) ---- */
  'DIA': 'DAY',
  'ASSINAR CIÊNCIA': 'ACKNOWLEDGE AND SIGN',
  'GUARDAR': 'KEEP', 'QUEIMAR': 'BURN',
  'UM BILHETE FICOU NA BANDEJA': 'A NOTE WAS LEFT ON THE TRAY',
  'A fila acabou. Do outro lado do vidro, só a neve e as pegadas de quem passou.':
    'The line is over. On the other side of the glass, only the snow and the footprints of those who passed.',

  /* ---- rótulos de campos de documento (fld()) ---- */
  'NOME': 'NAME', 'NASC.': 'BORN', 'SEXO': 'SEX', 'PAÍS': 'COUNTRY',
  'EMISSÃO': 'ISSUED', 'Nº': 'NO.', 'VALIDADE': 'VALID UNTIL', 'REVALIDAÇÃO': 'RENEWAL',
  'DISTRITO': 'DISTRICT', 'Nº PASSAPORTE': 'PASSPORT NO.', 'MOTIVO': 'REASON',
  'FUNÇÃO': 'OCCUPATION', 'VACINAS': 'VACCINES', 'LINHAGEM': 'LINEAGE',
  'ORIGEM': 'ORIGIN', 'CONVENÇÃO': 'CONVENTION',

  /* ---- nomes de tipo de documento ---- */
  'PASSAPORTE': 'PASSPORT', 'CARTÃO DE IDENTIDADE': 'IDENTITY CARD',
  'PERMISSÃO DE ENTRADA': 'ENTRY PERMIT', 'PERMISSÃO DE TRABALHO': 'WORK PERMIT',
  'CARTEIRA SANITÁRIA': 'HEALTH CARD', 'CERT. DE ANCESTRALIDADE': 'ANCESTRY CERT.',
  'CARTÃO DE REFÚGIO': 'REFUGEE CARD',

  /* ---- perguntas de interrogatório ---- */
  'Motivo?': 'Reason?', 'Onde nasceu?': 'Where born?', 'Profissão?': 'Occupation?', 'Quanto tempo?': 'How long?',
  'Motivo da viagem?': 'Reason for travel?', 'Duração da estadia?': 'Length of stay?',
  'Quem espera você?': 'Who is waiting for you?', 'Nome da sua rua?': 'Name of your street?',
  'Quem assina seu contrato?': 'Who signs your contract?', 'E a volta? Como volta?': 'And the return? How do you get back?',

  /* ---- OS 8 FINAIS (data.js ENDINGS) ---- */
  'FIM — O QUE OLHA DE VOLTA': 'END — WHAT LOOKS BACK',
  'Você chamou os guardas. Ou olhou perto demais. Ou deixou o tempo decidir por você.\n\nNão houve barulho. É isso que ninguém conta sobre o fim: não há barulho nenhum.\n\nOs guardas ficaram parados onde estavam, educados, de costas. O rádio virou estática. A fila lá fora continuou andando — para frente, para o posto, como se o posto ainda fosse seu.\n\nA última coisa que você registra é o próprio carimbo, na própria mão, descendo devagar na direção do seu próprio pulso.\n\nAPROVADO.\n\nAlguém vai sentar na sua cadeira amanhã. Alguém com o seu rosto. A família nem vai perceber. Você também não percebeu, da outra vez.\n\n— Havia regras. O menino tentou avisar. Não olhe de perto. Não chame ninguém. Carimbe qualquer coisa. E deixe ir. —':
    'You called the guards. Or looked too closely. Or let time decide for you.\n\nThere was no sound. That\'s the thing nobody tells you about the end: there is no sound at all.\n\nThe guards stayed right where they were, polite, backs turned. The radio turned to static. The line outside kept moving — forward, toward the post, as if the post were still yours.\n\nThe last thing you register is your own stamp, in your own hand, descending slowly toward your own pulse.\n\nAPPROVED.\n\nSomeone will sit in your chair tomorrow. Someone with your face. The family won\'t even notice. You didn\'t either, the last time.\n\n— There were rules. The boy tried to warn you. Don\'t look too closely. Don\'t call anyone. Stamp anything. And let it go. —',

  'FINAL — O FORMULÁRIO 77-B': 'ENDING — FORM 77-B',
  'Vieram buscá-lo no meio do turno. As acusações mudaram três vezes durante a leitura: negligência, sabotagem, "inconsistência epistemológica". A cela é fria e o processo, eterno.\n\nNo interrogatório, o agente folheia seu histórico completo — cada carimbo, cada hesitação, cada segundo a mais que você gastou olhando um rosto.\n\n"O senhor entende", diz ele sem levantar os olhos, "que nós também estávamos inspecionando você. Desde o primeiro dia."\n\nVocê entende. Agora entende.':
    'They came for you in the middle of the shift. The charges changed three times during the reading: negligence, sabotage, "epistemological inconsistency." The cell is cold and the process, eternal.\n\nDuring the interrogation, the agent leafs through your entire record — every stamp, every hesitation, every extra second you spent looking at a face.\n\n"You understand," he says without looking up, "that we were inspecting you too. Since the first day."\n\nYou understand. Now you understand.',

  'FINAL — A CASA VAZIA': 'ENDING — THE EMPTY HOUSE',
  'O posto continua lá. Você continua nele. Carimba, aprova, rejeita, com uma precisão que virou lenda entre os guardas.\n\nEm casa, ninguém espera. A mesa posta para um. O silêncio, pontual como você.\n\nDizem que você é o melhor inspetor que a fronteira já teve. Dizem que você nunca erra.\n\nErrou uma vez. As vezes que importavam.':
    'The post is still there. You\'re still in it. You stamp, approve, reject, with a precision that has become legend among the guards.\n\nAt home, no one waits. The table set for one. The silence, punctual as you are.\n\nThey say you\'re the best inspector the border has ever had. They say you never make mistakes.\n\nYou made one. The times that mattered.',

  'FINAL — A ROTA DO BARBEIRO': 'ENDING — THE BARBER\'S ROUTE',
  'Na madrugada do dia 49, alguém bate três vezes na sua porta. Depois duas. Depois uma.\n\nO barbeiro envelheceu dez anos em dez dias. "Tem lugar para a sua família na rota do sul. Sem documentos. Sem carimbos. Sem perguntas."\n\nVocê, que passou 48 dias exigindo papéis, atravessa a fronteira sem nenhum.\n\nDo outro lado, uma mulher da rota aperta sua mão e sorri um segundo a mais do que devia. Você decide não pensar nisso. Você decide isso todos os dias, pelo resto da vida.':
    'In the early hours of day 49, someone knocks three times on your door. Then two. Then one.\n\nThe barber has aged ten years in ten days. "There\'s room for your family on the southern route. No papers. No stamps. No questions."\n\nYou, who spent 48 days demanding papers, cross the border without a single one.\n\nOn the other side, a woman from the route shakes your hand and smiles a second longer than she should. You decide not to think about it. You decide that, every day, for the rest of your life.',

  'FINAL — A CIDADE SILENCIOSA': 'ENDING — THE SILENT CITY',
  'A guerra não veio. O colapso passou, como passam as tempestades.\n\nA cidade se reconstrói com uma eficiência que ninguém lembra de ter visto antes. Os vizinhos são gentis. As filas, ordeiras. Ninguém grita, ninguém rouba, ninguém chora alto.\n\nÀ noite, você conta nos dedos quantos você deixou passar. Para de contar quando os dedos acabam.\n\nSua esposa dorme serena ao seu lado. A respiração dela é perfeita. Perfeitamente regular. Perfeita demais?\n\nVocê fecha os olhos. É mais fácil assim.':
    'The war never came. The collapse passed, the way storms do.\n\nThe city rebuilds itself with an efficiency no one remembers ever seeing before. The neighbors are kind. The lines, orderly. No one shouts, no one steals, no one cries out loud.\n\nAt night, you count on your fingers how many you let through. You stop counting when you run out of fingers.\n\nYour wife sleeps peacefully beside you. Her breathing is perfect. Perfectly regular. Too perfect?\n\nYou close your eyes. It\'s easier that way.',

  'FINAL — A MEDALHA': 'ENDING — THE MEDAL',
  'Sobrou gente suficiente para uma cerimônia. Um homem de casaco cinza prende uma medalha no seu peito: "Servidor Exemplar — 48 dias sem desvio".\n\nAs mãos dele estão frias. Todas as mãos estão frias em novembro, você pensa. Todas.\n\n"O Estado agradece", diz ele. Qual Estado, você não pergunta. A medalha não especifica.\n\nNo verso dela, minúsculo, o número de série: o mesmo do seu carimbo. Você foi, no fim, a peça que melhor funcionou.\n\nA máquina é que talvez nunca tenha existido.':
    'Enough people were left for a ceremony. A man in a gray coat pins a medal to your chest: "Exemplary Servant — 48 days without deviation."\n\nHis hands are cold. All hands are cold in November, you think. All of them.\n\n"The State thanks you," he says. Which State, you don\'t ask. The medal doesn\'t specify.\n\nOn the back, tiny, the serial number: the same as your stamp. You were, in the end, the part that worked best.\n\nThe machine, perhaps, never existed at all.',

  'FINAL — O ESPELHO': 'ENDING — THE MIRROR',
  'Dia 49. O posto amanhece sem fila. Sem guardas. Sem ordens.\n\nVocê senta na cadeira mesmo assim — quarenta e oito dias criam sulcos — e percebe que há alguém do outro lado do vidro.\n\nÉ o seu reflexo. Claro que é. O vidro sempre refletiu.\n\nVocê desliza os seus próprios documentos pela bandeja, por hábito, por piada, por desespero. Nome. Foto. Assinatura.\n\nA assinatura está correta. Você acha. Você assinava assim há 48 dias?\n\nO reflexo espera, paciente, a sua decisão.':
    'Day 49. The post dawns without a line. Without guards. Without orders.\n\nYou sit in the chair anyway — forty-eight days carve grooves — and notice there\'s someone on the other side of the glass.\n\nIt\'s your reflection. Of course it is. The glass always reflected.\n\nYou slide your own documents across the tray, out of habit, out of a joke, out of desperation. Name. Photo. Signature.\n\nThe signature is correct. You think. Did you sign like this, 48 days ago?\n\nThe reflection waits, patiently, for your decision.',
};

function normSpace(s) { return String(s).replace(/\s+/g, ' ').trim(); }

function T(s) {
  if (SETTINGS.lang !== 'en') return s;
  if (Object.prototype.hasOwnProperty.call(I18N_EN, s)) return I18N_EN[s];
  const n = normSpace(s);
  return Object.prototype.hasOwnProperty.call(I18N_EN, n) ? I18N_EN[n] : s;
}

/* Elementos de interface ESTÁTICA (não regenerados por game.js/house.js):
   captura o texto/title original em data-pt na primeira passada, e a
   partir daí só troca entre o original e a tradução — nunca perde o PT. */
const I18N_STATIC_SELECTORS = [
  '.title-sub', '.title-quote', '#btn-new', '#btn-continue', '#btn-second-reading',
  '#btn-fullscreen', '.title-warning', '.title-version',
  '.home-title', '#btn-gowork', '#btn-bulletin', '#btn-endshift',
  '#btn-music', '#btn-approve', '#btn-reject', '#btn-detain',
  '.bc-doc', '.bc-stamp', '#desk-hint',
  '#btn-inspect', '#btn-exam', '#btn-bag', '#btn-lifeline',
  '#btn-scan-thermo', '#btn-scan-pulse', '#btn-scan-bio',
  '.rulebook .rb-title', '#btn-radio', '#radio-line',
  '#endday-title', '#btn-gohome', '#btn-restart',
  '.house-help', '#hd-hint',
  '.exam-head span', '#btn-exam-close', '.bag-hint',
  '.pause-title', '#pz-continue', '#pz-music', '#pz-sfx', '#pz-fullscreen', '#pz-title', '.pause-note',
  '.citation-head',
];

function applyStaticI18n() {
  I18N_STATIC_SELECTORS.forEach(sel => {
    document.querySelectorAll(sel).forEach(el => {
      if (el.dataset.pt === undefined) el.dataset.pt = el.textContent;
      el.textContent = T(el.dataset.pt);
      if (el.title) {
        if (el.dataset.ptTitle === undefined) el.dataset.ptTitle = el.title;
        el.title = T(el.dataset.ptTitle);
      }
    });
  });
}

window.T = T;
window.applyStaticI18n = applyStaticI18n;
