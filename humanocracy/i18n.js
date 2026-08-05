/* ============================================================
   HUMANOCRACY — i18n.js
   Arquitetura de idiomas: português é a fonte da verdade (chave),
   inglês (I18N_EN) e espanhol (I18N_ES) são os idiomas adicionais.
   T(s) devolve a tradução na tabela do idioma ativo (SETTINGS.lang);
   se a chave não existir na tabela, ou o idioma for 'pt'/desconhecido,
   devolve s sem alteração — nunca quebra se uma string não estiver
   traduzida. Para adicionar um idioma novo: copie I18N_ES, traduza os
   valores, registre em I18N_TABLES.

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
  'TEXTO GRANDE': 'LARGE TEXT',
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
  'INSPEÇÃO': 'INSPECTION', 'EXAME': 'EXAM', 'BAGAGEM': 'LUGGAGE',
  'TÉRMICO': 'THERMAL', 'PULSAÇÃO': 'PULSE', 'BIOLÓGICO': 'BIOLOGICAL',
  'INTERROGATÓRIO': 'INTERROGATION', 'FERRAMENTAS': 'TOOLS',
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
  'WASD/setas andar · arraste o mouse para olhar · E interagir':
    'WASD/arrows to walk · drag the mouse to look · E to interact',
  'clique / E para continuar': 'click / E to continue',

  /* ---- exame / bagagem ---- */
  'EXAME FÍSICO APROXIMADO — clique nas regiões': 'CLOSE PHYSICAL EXAM — click on regions',
  'FECHAR': 'CLOSE',
  '🗺 MAPA': '🗺 MAP',
  'Carta de fronteiras': 'Border chart',
  'REVISTA DE BAGAGEM — objetos contam histórias': 'LUGGAGE SEARCH — objects tell stories',
  'No modo INSPEÇÃO, um objeto pode ser comparado com um campo de documento.':
    'In INSPECTION mode, an object can be compared with a document field.',

  /* ---- pausa ---- */
  '— PAUSA —': '— PAUSED —',
  'CONTINUAR': 'RESUME',
  'MÚSICA: ': 'MUSIC: ', 'SONS: ': 'SOUND: ',
  'LIGADA': 'ON', 'DESLIGADA': 'OFF', 'LIGADOS': 'ON', 'DESLIGADOS': 'OFF',
  'TELA CHEIA (F)': 'FULLSCREEN (F)',
  'SALVAR E VOLTAR AO TÍTULO': 'SAVE AND RETURN TO TITLE',
  'O posto não pausa por você. Este menu, sim.': "The post doesn't pause for you. This menu does.",
  '🏆 CONQUISTAS': '🏆 ACHIEVEMENTS',
  'CONQUISTAS': 'ACHIEVEMENTS',

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
  'ORDEM · SERENIDADE · RIGOR': 'ORDER · SERENITY · RIGOR',
  'ORDEM · SEGURANÇA · PUREZA': 'ORDER · SECURITY · PURITY',
  'TRABALHO · UNIDADE · VIGILÂNCIA': 'LABOR · UNITY · VIGILANCE',
  'ÓRGÃO SEM DONO': 'AN ORGAN WITH NO OWNER',
  'EDIÇÃO OFICIAL — FRONTEIRA LESTE': 'OFFICIAL EDITION — EASTERN BORDER',
  'SEÇÃO GERAL': 'GENERAL SECTION',

  /* ---- modais de abertura de campanha ---- */
  'CONTRATO DE SERVIÇO — MINISTÉRIO DE TRIAGEM': 'SERVICE CONTRACT — MINISTRY OF SCREENING',
  'ASSINAR': 'SIGN',
  'Você foi sorteado na Loteria de Ofícios para servir como INSPETOR DE FRONTEIRA no Posto Nº 7, por 48 dias.\n\nHorário: 08h às 18h. Você chega em casa às 20h30.\nSalário: ':
    'You were drafted by the Office Lottery to serve as BORDER INSPECTOR at Post No. 7, for 48 days.\n\nHours: 8am to 6pm. You arrive home at 8:30pm.\nSalary: ',
  ' por decisão correta.\nErros: advertência; a partir da 3ª do dia, multa.\n\nSua família depende do seu salário: Vessa (sua esposa), Tomi (8 anos), Dario (15 anos, do seu primeiro casamento) e sua mãe, Odila.\n\nAssine abaixo. A recusa não consta do formulário como opção.':
    ' per correct decision.\nMistakes: a warning; from the 3rd one of the day on, a fine.\n\nYour family depends on your salary: Vessa (your wife), Tomi (8 years old), Dario (15, from your first marriage), and your mother, Odila.\n\nSign below. Refusal is not listed on the form as an option.',
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
  'PORTADOR': 'BEARER', 'BILHETE Nº': 'TICKET NO.', 'ASSENTO': 'SEAT', 'ROTA': 'ROUTE',
  'LOTE': 'BATCH', 'AGENTE': 'AGENT', 'MENOR': 'MINOR', 'CONDIÇÃO': 'STATUS', 'RESPONSÁVEL': 'GUARDIAN',
  'lactente': 'infant', 'menor': 'minor',

  /* ---- nomes de tipo de documento ---- */
  'PASSAPORTE': 'PASSPORT', 'CARTÃO DE IDENTIDADE': 'IDENTITY CARD',
  'PERMISSÃO DE ENTRADA': 'ENTRY PERMIT', 'PERMISSÃO DE TRABALHO': 'WORK PERMIT',
  'CARTEIRA SANITÁRIA': 'HEALTH CARD', 'CERT. DE ANCESTRALIDADE': 'ANCESTRY CERT.',
  'CARTÃO DE REFÚGIO': 'REFUGEE CARD',
  'BILHETE DE ENTRADA': 'ENTRY TICKET', 'VISTO DE TRÂNSITO': 'TRANSIT VISA',
  'CERT. DE INOCULAÇÃO': 'INOCULATION CERT.', 'REGISTRO DE MENOR': 'MINOR REGISTRY',

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

  /* ---- SUSSURROS (WHISPERS) ---- */
  'aquela assinatura… você já viu antes. não viu?': 'that signature… you\'ve seen it before. haven\'t you?',
  'ele piscou os dois olhos ao mesmo tempo. todo mundo pisca assim. certo?': 'he blinked both eyes at the same time. everyone blinks like that. right?',
  'o relógio atrasou dois minutos. ou você que adiantou.': 'the clock ran two minutes slow. or you ran fast.',
  'quantas pessoas você aprovou ontem? tem certeza do número?': 'how many people did you approve yesterday? are you sure of the number?',
  'sua esposa mexeu no seu carimbo. por quê?': 'your wife touched your stamp. why?',
  'o café de hoje tinha o mesmo gosto de sempre. exatamente o mesmo.': 'today\'s coffee tasted the same as always. exactly the same.',
  'a foto 3×4 sorriu. não. não sorriu.': 'the 3x4 photo smiled. no. it didn\'t.',
  'você trancou a porta ao sair de casa. você sempre tranca. sempre?': 'you locked the door when you left home. you always lock it. always?',
  'alguém andou perguntando de você. ninguém disse quem. ninguém disse o quê.':
    'someone\'s been asking about you. no one said who. no one said what.',

  /* ---- CONVERSA DA FILA (QUEUE_CHATTER) ---- */
  '"…três dias nessa fila…"': '"…three days in this line…"',
  '"…dizem que o scanner morde…"': '"…they say the scanner bites…"',
  '"…meu primo passou ontem…"': '"…my cousin got through yesterday…"',
  '"…ela não era ela, eu juro…"': '"…she wasn\'t herself, I swear…"',
  '"…vendo pão, meia ostra…"': '"…selling bread, half an oyster…"',
  '"…não olha nos olhos dele…"': '"…don\'t look him in the eye…"',
  '"…o inspetor de sexta é pior…"': '"…the Friday inspector is worse…"',
  '"…açúcar. eles odeiam açúcar…"': '"…sugar. they hate sugar…"',
  '"…quieto, tem gente ouvindo…"': '"…quiet, people are listening…"',

  /* ---- EVENTOS DA FILA (QUEUE_EVENTS) ---- */
  'Uma mulher desmaiou na fila. Os guardas afastam os curiosos com a coronha.':
    'A woman fainted in line. The guards push the onlookers back with their rifle butts.',
  'Discussão lá fora. Um nome gritado três vezes. Depois, um silêncio pior que o grito.':
    'An argument outside. A name shouted three times. Then, a silence worse than the shout.',
  'Um vendedor de pão quente passa pela fila. Por um minuto, todo mundo parece gente de novo.':
    'A hot bread vendor passes by the line. For a minute, everyone looks human again.',
  'Alguém tentou furar a fila. A própria fila resolveu. Os guardas nem se mexeram.':
    'Someone tried to cut in line. The line itself handled it. The guards didn\'t even move.',
  'Uma criança na fila acena para você. A mãe abaixa o braço dela devagar, sem tirar os olhos do guichê.':
    'A child in line waves at you. The mother slowly lowers her arm, without taking her eyes off the booth.',
  'Duas pessoas na fila trocaram de casaco discretamente. Você viu. Você acha que viu.':
    'Two people in line discreetly swapped coats. You saw it. You think you saw it.',
  'Um velho desistiu. Dobrou os documentos com cuidado de quem dobra uma bandeira e foi embora.':
    'An old man gave up. He folded his documents with the care of someone folding a flag, and left.',
  'A fila inteira olhou para o mesmo ponto do céu ao mesmo tempo. Você não viu nada lá. A fila voltou a olhar para frente.':
    'The whole line looked at the same point in the sky at the same time. You saw nothing there. The line went back to looking forward.',
  'Um guarda novo pergunta ao antigo se "é sempre assim". O antigo não responde. É sempre assim.':
    'A new guard asks the veteran if "it\'s always like this." The veteran doesn\'t answer. It\'s always like this.',
  'a fila parou por': 'the line stopped for',
  'pessoas na fila': 'people in line',

  /* ---- ANÚNCIOS (ADS) ---- */
  'VERITAS-9 — porque sua família merece a verdade. (LumenCorp)': 'VERITAS-9 — because your family deserves the truth. (LumenCorp)',
  'Café Fronteira — aberto mesmo durante apagões.': 'Border Café — open even during blackouts.',
  'Formulário 77-B: agora com apenas 9 páginas!': 'Form 77-B: now with only 9 pages!',
  'Aulas de caligrafia oficial. Assine como um patriota.': 'Official calligraphy classes. Sign like a patriot.',
  'Compra-se ouro, relógios e memórias de família. Beco do Sal, 3.': 'Buying gold, watches, and family heirlooms. Salt Alley, 3.',
  'Perdeu seus documentos? A fila do Cartório começa às 4h.': 'Lost your documents? The Registry line starts at 4am.',

  /* ---- RÁDIO ---- */
  '[ESTATAL] O ministro pede calma e confiança nos processos de triagem.': '[STATE] The minister asks for calm and confidence in the screening process.',
  '[LIVRE] Cartas dos ouvintes: "meu vizinho voltou de viagem estranho". Encaminhamos ao Instituto. Não responderam.': '[FREE] Listener mail: "my neighbor came back from a trip strange." We forwarded it to the Institute. No reply.',
  '[CLANDESTINA] …conta os dedos. sempre conta os dedos. às vezes é tudo que a gente tem…': '[CLANDESTINE] …count the fingers. always count the fingers. sometimes it\'s all we have…',
  '[ESTATAL] Novo horário do juramento: 21h. A ausência é anotada. A presença também.': '[STATE] New oath time: 9pm. Absence is noted. So is presence.',
  '[CLANDESTINA] …se o pescoço mostra a costura, não hesita. eles contam com a sua hesitação…': '[CLANDESTINE] …if the neck shows the seam, don\'t hesitate. they count on your hesitation…',
  '[ESTATAL] A História foi revisada para a sua conveniência. Descarte as edições anteriores da sua memória.': '[STATE] History has been revised for your convenience. Discard the previous editions from your memory.',
  '[CLANDESTINA] …a família do quarto ao lado não projeta sombra sob a lâmpada. repara da próxima vez…': '[CLANDESTINE] …the family next door casts no shadow under the bulb. look next time…',
  '[?] …se você ainda conta as batidas do coração de quem ama… continua contando… ‹corte›': '[?] …if you still count the heartbeats of the one you love… keep counting… ‹cut›',
  '‹uma voz lendo nomes, devagar, sem parar. o seu ainda não veio›': '‹a voice reading names, slowly, without stopping. yours hasn\'t come yet›',
  '[LIVRE] Coluna "Aprenda a Ver": o retrato mente devagar; o rosto, ao vivo, mente rápido. Compare os dois.': '[FREE] "Learn to See" column: the photo lies slowly; the face, live, lies fast. Compare the two.',
  '[CLANDESTINA] …um lado da cara nunca é igualzinho ao outro. quando batem certo demais, desconfia…': '[CLANDESTINE] …one side of a face is never quite the other. when they match too perfectly, be suspicious…',
  '[ESTATAL] Lembrete: relatar um vizinho é um gesto de amor à Pátria. E o amor, cidadão, é obrigatório.': '[STATE] Reminder: reporting a neighbor is an act of love for the Fatherland. And love, citizen, is mandatory.',
  '[CLANDESTINA] …pele boa demais é pele que fecharam. procura o brilho errado, o de cera, não o de suor…': '[CLANDESTINE] …skin too good is skin they sealed. look for the wrong shine — the waxy one, not sweat…',
  '[ESTATAL] Produtividade é felicidade. A felicidade será medida ao fim do turno, e comparada com a de ontem.': '[STATE] Productivity is happiness. Happiness will be measured at shift\'s end, and compared to yesterday\'s.',
  '[CLANDESTINA] …repara quem não pisca. a gente pisca sem pensar; eles precisam lembrar de piscar…': '[CLANDESTINE] …watch who doesn\'t blink. we blink without thinking; they have to remember to…',
  '[ESTATAL] Comunicado: a fila é um privilégio, cidadão. Agradeça a fila.': '[STATE] Notice: the queue is a privilege, citizen. Be grateful for the queue.',
  '[LIVRE] Economia: o pão subiu de novo. O Ministério respondeu subindo a definição de "pão".': '[FREE] Economy: bread is up again. The Ministry responded by raising the definition of "bread".',
  '[CLANDESTINA] …o olho deles brilha seco. olho de gente reflete úmido; repara na luz da lâmpada…': '[CLANDESTINE] …their eye shines dry. a human eye reflects wet; watch it under the lamp…',
  '[ESTATAL] O cidadão modelo desta semana denunciou a própria mãe. Repita o gesto com orgulho.': '[STATE] This week\'s model citizen reported their own mother. Repeat the gesture with pride.',
  '[CLANDESTINA] …a resposta sai rápida demais e certa demais. gente de verdade gagueja no medo…': '[CLANDESTINE] …the answer comes too fast and too right. real people stammer when afraid…',
  '[ESTATAL] Racionamento é solidariedade, trabalhador. Quem tem fome tem, ao menos, companhia.': '[STATE] Rationing is solidarity, worker. The hungry have, at least, company.',
  '[CLANDESTINA] …a mão fria não é do frio. aperta a mão deles e conta até três — o calor não vem…': '[CLANDESTINE] …the cold hand isn\'t from the cold. shake their hand and count to three — the warmth never comes…',
  '[?] …os que você deixou passar lembram do seu rosto. só do seu… ‹corte›': '[?] …the ones you let through remember your face. only yours… ‹cut›',
  '‹alguém respira do outro lado do rádio. está esperando você desligar primeiro›': '‹someone breathes on the other side of the radio. they\'re waiting for you to switch off first›',
  'Alguém na fila repete os próprios documentos em voz baixa, de novo e de novo, como uma reza esquecida no meio.': 'Someone in line repeats their own documents under their breath, over and over, like a prayer forgotten halfway through.',
  'Um homem encara o próprio reflexo no vidro do posto por tempo demais. Depois pede desculpa ao reflexo, baixinho.': 'A man stares at his own reflection in the post\'s glass too long. Then he apologizes to the reflection, quietly.',
  '[ESTATAL] Previsão do tempo: frio, com possibilidade de mais frio.': '[STATE] Weather forecast: cold, with a chance of more cold.',
  '[LIVRE] Análise: o que o governo não diz sobre as filas do posto leste.': '[FREE] Analysis: what the government isn\'t saying about the east post lines.',
  '[LIVRE] Esportes: Valgrado empata em casa; a torcida culpa o juiz. Ou um substituto do juiz.': '[FREE] Sports: Valgrado draws at home; fans blame the referee. Or a substitute referee.',
  '[CLANDESTINA] …se está ouvindo isto, o térmico do posto 7 está descalibrado desde terça…': '[UNDERGROUND] …if you\'re hearing this, post 7\'s thermal scanner has been miscalibrated since Tuesday…',
  '[ESTATAL] Música: "Manhãs de Ostra Velha", com a Orquestra Nacional.': '[STATE] Music: "Mornings in Ostra Velha," with the National Orchestra.',
  '[LIVRE] Entrevista: "falso positivo destruiu minha família", diz operário.': '[FREE] Interview: "a false positive destroyed my family," says worker.',
  '[ESTATAL] Hoje celebramos mais uma semana de PUREZA e ORDEM.': '[STATE] Today we celebrate another week of PURITY and ORDER.',
  '[ESTATAL] Aprendam com as crianças da Escola 4: "Quem cala, protege!"': '[STATE] Learn from the children of School 4: "Silence protects!"',
  '[ESTATAL] O Instituto confirma: os indicadores funcionam. Os números não serão divulgados.': '[STATE] The Institute confirms: the indicators work. The numbers will not be released.',
  '[CLANDESTINA] …os números vazaram: nove inocentes por captura. repasse antes que cortem…': '[UNDERGROUND] …the numbers leaked: nine innocents per capture. pass it on before they cut the line…',
  '[CLANDESTINA] …não usem as palavras deles. "substituído" é uma palavra deles…': '[UNDERGROUND] …don\'t use their words. "replaced" is one of their words…',
  '[ESTATAL] Marcha "Filhos do Amanhã Limpo" — a pedido dos ouvintes. De todos eles.': '[STATE] March "Children of the Clean Tomorrow" — by listener request. All of them.',
  '[ESTATAL] Trabalhadores: os "Alternados" eram o medo que o capital vendia. Sigam produzindo.': '[STATE] Workers: the "Alternates" were the fear capital was selling. Keep producing.',
  '[ESTATAL] A cota de otimismo desta semana foi CUMPRIDA.': '[STATE] This week\'s optimism quota has been MET.',
  '[CLANDESTINA] …o laboratório da Usina 9 recebeu caminhões de novo esta noite…': '[UNDERGROUND] …the Plant 9 lab received trucks again tonight…',
  '[ESTATAL] Informe: o açúcar voltará às prateleiras quando você merecer. Correção: quando houver estoque.': '[STATE] Notice: sugar will return to shelves when you deserve it. Correction: when there\'s stock.',
  '[CLANDESTINA] …eles trocaram a bandeira do prédio, não o que acontece no porão…': '[UNDERGROUND] …they changed the building\'s flag, not what happens in the basement…',
  '‹estática›': '‹static›',
  '‹estática, e por baixo dela, quase uma voz›': '‹static, and beneath it, almost a voice›',
  '[?] …alguém aí? câmbio… …alguém… câmbio…': '[?] …anyone there? over… …anyone… over…',
  '‹o hino antigo, tocando sozinho, em loop, num estúdio vazio›': '‹the old anthem, playing alone, on loop, in an empty studio›',
  '[?] …não abram para quem já mora com vocês… ‹corte›': '[?] …don\'t open for who already lives with you… ‹cut›',
  '‹desligado›': '‹off›',
  '— silêncio. nem estática. silêncio. —': '— silence. not even static. silence. —',

  /* ---- DIA 48: O ESPELHO ---- */
  '— o vidro reflete —': '— the glass reflects —',
  'Não há fila. Há um vidro. Do outro lado do vidro, alguém desliza documentos na bandeja. São os seus.':
    'There is no line. There is a glass. On the other side of the glass, someone slides documents onto the tray. They are yours.',

  /* ---- ECOS DE ENCONTROS (encounterOutcome) ---- */
  'Um hospital clandestino em Delvina tratou quarenta crianças esta semana. Ninguém sabe de onde vieram os medicamentos. Ninguém pergunta.':
    'An underground hospital in Delvina treated forty children this week. No one knows where the medicine came from. No one asks.',
  'A jornalista Vela Odim publicou no exterior: "Os postos de triagem detêm 9 inocentes para cada suspeito real". O governo nega. O governo sempre nega.':
    'Journalist Vela Odim published abroad: "Screening posts detain 9 innocents for every real suspect." The government denies it. The government always denies it.',

  /* ---- ENCONTROS (ENCOUNTERS: fala + nota) ---- */
  'Vou cuidar da minha mãe em Kranton. Ela piorou no inverno. Volto em duas semanas, prometo. Digo… não que eu precise prometer nada ao senhor.':
    "I'm going to take care of my mother in Kranton. She got worse over the winter. I'll be back in two weeks, I promise. I mean… not that I need to promise you anything, sir.",
  'Inspetor. Meu primo passa por aqui amanhã. Volkan Zubrek, de Krestov. Os papéis dele estão… quase em ordem. Feche um olho e a metade do que ele paga é sua. Pense com calma. Eu volto sempre.':
    'Inspector. My cousin comes through here tomorrow. Volkan Zubrek, from Krestov. His papers are… almost in order. Close one eye and half of what he pays is yours. Think it over. I always come back.',
  'AMANHÃ: Volkan Zubrek. Aprove. — R.D.': 'TOMORROW: Volkan Zubrek. Approve. — R.D.',
  'O sargento falou com você, não falou? Está tudo… combinado.': "The sergeant talked to you, didn't he? It's all… arranged.",
  'Corto o cabelo de metade desta fila, sabia? A gente ouve coisas. Por exemplo: que o senhor tem um filho doente. E que gente como nós vai precisar de gente como o senhor. Guarde meu nome.':
    'I cut the hair of half this line, you know? We hear things. For example: that you have a sick son. And that people like us are going to need people like you. Remember my name.',
  'Quando precisar de remédio de verdade, procure o barbeiro. — J.M.': 'When you need real medicine, find the barber. — J.M.',
  'Fui demitida enquanto cuidava da minha mãe. A escola diz que "meu perfil não serve mais". Minha permissão venceu ANTEONTEM, eu sei, eu sei — mas se eu voltar agora perco o apartamento e perco… tudo. Por favor. São dois dias.':
    'I was fired while I was taking care of my mother. The school says "my profile no longer fits." My permit expired the DAY BEFORE YESTERDAY, I know, I know — but if I go back now I lose the apartment and I lose… everything. Please. It\'s two days.',
  'Amanhã passa por aqui uma "prima" minha. Nadia Baruk, de Frimia. Os papéis dela têm um defeito de fábrica, digamos. Ela carrega remédios para um hospital clandestino. Aprove, e o remédio do seu filho aparece na sua porta. Recuse, e… bom, cada um vive com o que escolhe.':
    'Tomorrow a "cousin" of mine comes through. Nadia Baruk, from Frimia. Her papers have a factory defect, let\'s say. She carries medicine for an underground hospital. Approve her, and your son\'s medicine appears at your door. Refuse, and… well, everyone lives with what they choose.',
  'AMANHÃ: Nadia Baruk. O remédio existe. A escolha é sua. — J.M.': 'TOMORROW: Nadia Baruk. The medicine exists. The choice is yours. — J.M.',
  'O barbeiro mandou lembranças.': 'The barber sends his regards.',
  'Estou grávida. O pai ficou do outro lado. Eu só quero atravessar antes que… antes que inventem mais um papel que eu não tenho. Não tenho a carteira sanitária. O posto médico da minha cidade FECHOU. Como eu apresento um papel de um lugar que não existe mais?':
    "I'm pregnant. The father stayed on the other side. I just want to cross before… before they invent another paper I don't have. I don't have the health card. My town's medical post CLOSED. How do I present a paper from a place that no longer exists?",
  'Estou escrevendo sobre os postos de triagem. Sobre quantos "positivos" eram só gente doente, nervosa ou azarada. Uma pergunta, inspetor, sem caneta na mão: o senhor já teve certeza de alguma coisa aqui dentro? Uma única vez?':
    'I\'m writing about the screening posts. About how many "positives" were just sick, nervous, or unlucky people. One question, inspector, off the record: have you ever been certain of anything in here? Even once?',
  'O senhor de novo. Que sorte a minha. — Ela não sorri mais. — Está tudo em ordem dessa vez. Tudo. Pode olhar o quanto quiser.':
    "You again. What luck I have. — She doesn't smile anymore. — Everything is in order this time. Everything. Look all you want.",
  'Sem farda fica difícil me reconhecer, é? O Conselho está prendendo todo mundo que serviu antes. TODO MUNDO. Você inclusive está na lista, mais cedo ou mais tarde. Me deixa passar e eu esqueço seu nome quando perguntarem.':
    "Without a uniform it's hard to recognize me, is it? The Council is arresting everyone who served before. EVERYONE. You too, sooner or later. Let me through and I'll forget your name when they ask.",
  'Seu detector biológico está descalibrado há semanas — eu vendo o serviço de calibração. 40 ostras e ele volta a funcionar de verdade. Barato, considerando o preço de um erro. A LumenCorp me odeia, o que é sempre bom sinal.':
    "Your biological detector has been miscalibrated for weeks — I sell the calibration service. 40 oysters and it works for real again. Cheap, considering the cost of a mistake. LumenCorp hates me, which is always a good sign.",
  '…O bebê nasceu. Está com a minha irmã. Eu atravesso hoje ou não atravesso nunca. — Ela olha para você como quem decora um rosto. — Engraçado. Não lembro mais se o senhor sempre foi assim. Mais velho. Diferente. A gente muda, não é? Todo mundo muda.':
    "…The baby was born. He's with my sister. I cross today or I never cross. — She looks at you like someone memorizing a face. — Funny. I don't remember anymore if you were always like this. Older. Different. People change, don't they? Everyone changes.",
  'Você me disse ONTEM para atravessar hoje. Na cozinha. Você segurou minhas mãos e disse "vá antes de mim, eu encontro vocês". — Você não disse isso. Você tem certeza de que não disse isso. — Por que está me olhando assim?':
    'You told me YESTERDAY to cross today. In the kitchen. You held my hands and said "go before me, I\'ll find you." — You didn\'t say that. You\'re sure you didn\'t say that. — Why are you looking at me like that?',
  'Nós já conversamos, há duas semanas. O senhor usava uma caneca azul lascada na borda. Reclamou do frio e carimbou meu passaporte duas vezes sem querer. — Você nunca viu este homem. A caneca azul está na sua mesa. Lascada na borda.':
    'We already talked, two weeks ago. You were using a blue mug, chipped at the rim. You complained about the cold and stamped my passport twice by accident. — You have never seen this man. The blue mug is on your desk. Chipped at the rim.',

  /* ---- NOITES: alguém bate na porta (NIGHT_EVENTS) ---- */
  'VOLTAR PARA DENTRO →': 'BACK INSIDE →',
  'Batidas educadas. 22h40.': 'Polite knocking. 10:40 PM.',
  'É Bruno, do 12. O aquecimento do bloco dele quebrou. Ele segura um cobertor dobrado como quem segura um pedido de desculpas. "Só esta noite. A Vessa me conhece."':
    "It's Bruno, from 12. His block's heating broke. He holds a folded blanket like someone holding an apology. \"Just tonight. Vessa knows me.\"",
  'ABRIR A PORTA': 'OPEN THE DOOR',
  'Ele dorme no sofá sem se mexer. De manhã, dobra o cobertor em silêncio e agradece três vezes. Vessa diz que você fez certo. Você concorda. Quase.':
    'He sleeps on the couch without moving. In the morning, he folds the blanket in silence and thanks you three times. Vessa says you did right. You agree. Almost.',
  'NÃO ABRIR': "DON'T OPEN",
  'Os passos se afastam. No dia seguinte, Bruno não te cumprimenta. Nunca mais.':
    'The footsteps move away. The next day, Bruno doesn\'t greet you. Never again.',
  'Um morador do Bloco 14 passou a noite no vão da escada. Vizinhos "não ouviram nada".':
    'A resident of Block 14 spent the night in the stairwell. Neighbors "heard nothing".',
  'Três batidas firmes. 23h15.': 'Three firm knocks. 11:15 PM.',
  'Dois homens de casaco comprido. "Vistoria de rotina, inspetor. O senhor entende." Pela fresta, você vê que um deles não olha para você — olha para DENTRO.':
    'Two men in long coats. "Routine inspection, inspector. You understand." Through the gap, you see one of them isn\'t looking at you — he\'s looking INSIDE.',
  'Eles andam pelo apartamento anotando nada em pranchetas vazias. Na saída: "Tudo em ordem. Por enquanto." Vessa não dorme mais essa noite.':
    'They walk through the apartment jotting nothing on empty clipboards. On the way out: "Everything in order. For now." Vessa doesn\'t sleep the rest of the night.',
  '"Anotado", diz a voz, sem raiva nenhuma. É a falta de raiva que fica com você.':
    '"Noted," says the voice, with no anger at all. It\'s the lack of anger that stays with you.',
  'Batidas fracas. 2h da manhã.': 'Weak knocking. 2 AM.',
  'Uma mulher com um bebê enrolado. "Água. Só água, por favor." O corredor está gelado. O bebê não chora. Em nenhum momento o bebê chora.':
    'A woman with a bundled baby. "Water. Just water, please." The hallway is freezing. The baby doesn\'t cry. Not once does the baby cry.',
  'ABRIR E DAR ÁGUA': 'OPEN AND GIVE WATER',
  'Ela bebe, agradece com a testa encostada no batente e desce a escada. Você fica ouvindo. Os passos são só dela. Só dela?':
    'She drinks, thanks you with her forehead resting on the doorframe, and goes down the stairs. You keep listening. The footsteps are only hers. Only hers?',
  'FALAR PELA PORTA: "NÃO POSSO"': 'SPEAK THROUGH THE DOOR: "I CAN\'T"',
  '"Eu entendo", diz ela. E o pior é que a voz parece entender mesmo.':
    '"I understand," she says. And the worst part is the voice really seems to understand.',
  'Uma mulher não identificada foi encontrada dormindo no saguão do Bloco 14. Ao amanhecer, já não estava.':
    'An unidentified woman was found sleeping in the Block 14 lobby. By dawn, she was gone.',
  'Não é na sua porta. 3h20.': "Not at your door. 3:20 AM.",
  'Botas no corredor. Muitas. A porta do 9 — o professor aposentado que não pendurou a bandeira — abre e fecha. Depois, o silêncio organizado de gente treinada. Vessa aperta sua mão no escuro.':
    "Boots in the hallway. Many. The door of 9 — the retired teacher who didn't hang his flag — opens and closes. Then the organized silence of trained people. Vessa squeezes your hand in the dark.",
  'OLHAR PELO OLHO MÁGICO': 'LOOK THROUGH THE PEEPHOLE',
  'Você vê costas de uniforme e, entre elas, os chinelos do professor. Um dos homens PARA. Vira o rosto para a sua porta. Você para de respirar até os passos acabarem.':
    "You see uniformed backs, and between them, the teacher's slippers. One of the men STOPS. Turns his face toward your door. You stop breathing until the footsteps end.",
  'NÃO OLHAR': "DON'T LOOK",
  'Você conta os passos. Sete pessoas descem. Subiram seis. Você refaz a conta a noite inteira e ela nunca fecha.':
    "You count the footsteps. Seven people go down. Six went up. You redo the count all night and it never adds up.",
  '—': '—',
  'Você acorda sem saber por quê. Então percebe: a maçaneta da porta da frente está girando. Devagar. Com paciência. Quem tem chave não gira assim. Quem não tem, não deveria girar.':
    "You wake up not knowing why. Then you notice: the front door handle is turning. Slowly. Patiently. Whoever has a key doesn't turn it like that. Whoever doesn't, shouldn't be turning it at all.",
  'ACENDER A LUZ': 'TURN ON THE LIGHT',
  'A maçaneta para no meio do giro. Nenhum passo se afasta — e isso é o que você vai contar ao médico quando ele perguntar da insônia: NENHUM passo se afastou.':
    "The handle stops mid-turn. No footsteps move away — and that's what you'll tell the doctor when he asks about the insomnia: NO footsteps moved away.",
  'FICAR IMÓVEL NO ESCURO': 'STAY STILL IN THE DARK',
  'O giro completa. A porta, trancada, não abre. A maçaneta volta à posição com um cuidado quase gentil. De manhã, há um risco fino no metal. Sempre houve?':
    "The turn completes. The door, locked, doesn't open. The handle returns to position with an almost gentle care. In the morning, there's a thin scratch on the metal. Was it always there?",
  'Batidinhas na altura do joelho. 1h50.': 'Little knocks at knee height. 1:50 AM.',
  'Uma voz de criança: "Moço, eu me perdi. Sou amigo do Tomi." Você olha para o quarto: Tomi dorme, respiração funda. A voz insiste, paciente: "Moço. Eu conheço o Tomi."':
    'A child\'s voice: "Mister, I got lost. I\'m Tomi\'s friend." You look toward the bedroom: Tomi is asleep, breathing deep. The voice insists, patient: "Mister. I know Tomi."',
  'O corredor está vazio. Frio, e vazio. No dia seguinte, Tomi pergunta do nada: "Pai, o Nico veio aqui ontem?" Você não pergunta quem é Nico.':
    'The hallway is empty. Cold, and empty. The next day, Tomi asks out of nowhere: "Dad, did Nico come here yesterday?" You don\'t ask who Nico is.',
  'As batidinhas continuam por vinte minutos exatos. Depois: "tá bom. outro dia." Você não conta para a Vessa. Não existe frase para contar isso.':
    'The little knocks continue for exactly twenty minutes. Then: "okay. another day." You don\'t tell Vessa. There\'s no sentence for telling this.',
  'Uma batida só. Pesada. 23h55.': 'A single knock. Heavy. 11:55 PM.',
  'Casaco cinza, pasta de couro, sorriso de repartição. "Polícia Política. Rotina. O senhor notou algo... incomum nos seus vizinhos? Qualquer detalhe ajuda. Qualquer um."':
    'Gray coat, leather briefcase, bureaucratic smile. "Political Police. Routine. Have you noticed anything... unusual about your neighbors? Any detail helps. Any at all."',
  'DIZER QUE NÃO NOTOU NADA': "SAY YOU NOTICED NOTHING",
  '"Curioso", diz ele anotando, "todo mundo neste bloco não notou nada." Ele agradece com uma cortesia que pesa como intimação.':
    '"Curious," he says, writing it down, "no one in this block noticed anything." He thanks you with a courtesy that weighs like a summons.',
  'MENCIONAR O 7 (a família nova, quieta demais)': 'MENTION UNIT 7 (the new family, too quiet)',
  'Ele nem anota — já sabia. "Excelente memória, inspetor." Três dias depois, o 7 está vazio e você atravessa o corredor olhando o chão.':
    'He doesn\'t even write it down — he already knew. "Excellent memory, inspector." Three days later, unit 7 is empty and you cross the hallway staring at the floor.',
  'Uma família do Bloco 14 foi "convidada a colaborar". Os móveis saíram de manhã. Ninguém viu as pessoas saírem.':
    'A family from Block 14 was "invited to cooperate". The furniture left in the morning. No one saw the people leave.',
  'Batem do LADO DE DENTRO da parede da cozinha. Não. Batem na porta. Claro que é na porta. 0h30.':
    'Knocking from the INSIDE of the kitchen wall. No. Knocking on the door. Of course it\'s the door. 12:30 AM.',
  'É a mulher da família realocada que divide seu apartamento. "Sal", diz ela, com a mão estendida. Vessa entrega o pote. A mulher agradece com um aceno perfeito e volta ao quarto onde eles cozinham todas as noites. Sem cheiro. Nunca há cheiro.':
    "It's the woman from the relocated family sharing your apartment. \"Salt,\" she says, hand outstretched. Vessa hands her the jar. The woman thanks her with a perfect nod and returns to the room where they cook every night. No smell. There's never a smell.",
  'PERGUNTAR O QUE ESTÃO COZINHANDO': "ASK WHAT THEY'RE COOKING",
  '"Sopa", responde ela, depois de um segundo a mais. "De quê?" — "Sopa." A porta do quarto fecha com o clique mais educado do mundo.':
    '"Soup," she answers, after one extra second. "Of what?" — "Soup." The bedroom door closes with the most polite click in the world.',
  'NÃO PERGUNTAR NADA': "DON'T ASK ANYTHING",
  'Você fica olhando o pote de sal na mão dela até a porta fechar. No dia seguinte o pote está de volta na prateleira. Cheio. Exatamente como estava. Exatamente.':
    'You watch the salt jar in her hand until the door closes. The next day the jar is back on the shelf. Full. Exactly as it was. Exactly.',
  'Batidas rápidas, nervosas. 23h10.': 'Fast, nervous knocking. 11:10 PM.',
  'Um homem magro, suando frio. Abre um pano: ₴60 em notas miúdas. "Pelo seu carimbo. Uma noite. Devolvo antes do turno. Ninguém carimba nada, eu juro — é só para FOTOGRAFAR."':
    'A thin man, sweating cold. He opens a cloth: ₴60 in small bills. "For your stamp. One night. I\'ll return it before your shift. No one stamps anything, I swear — it\'s just to PHOTOGRAPH."',
  'ACEITAR ₴60': 'ACCEPT ₴60',
  'O carimbo volta de madrugada, embrulhado em jornal, com um fio de tinta que você não usou. Você lava três vezes. O cheiro de tinta fica.':
    "The stamp comes back before dawn, wrapped in newspaper, with a thread of ink you didn't use. You wash it three times. The ink smell stays.",
  'FECHAR A PORTA': 'CLOSE THE DOOR',
  '"Todo mundo tem preço, inspetor", diz a voz descendo a escada. "O seu só ainda não bateu na porta certa."':
    '"Everyone has a price, inspector," says the voice going down the stairs. "Yours just hasn\'t knocked on the right door yet."',
  'Batidas. Espaçadas. A noite inteira.': 'Knocking. Spaced out. All night long.',
  'Uma a cada vinte minutos, aproximadamente. Você olha pelo olho mágico: corredor vazio. A batida seguinte soa ENQUANTO você olha. No corredor vazio. Tomi acorda. Sua mãe reza baixo. Vessa olha para você como quem cobra uma profissão inteira: você não sabia inspecionar?':
    "One every twenty minutes, roughly. You look through the peephole: empty hallway. The next knock sounds WHILE you're looking. In the empty hallway. Tomi wakes up. Your mother prays quietly. Vessa looks at you like she's demanding an entire profession: didn't you know how to inspect?",
  'ABRIR A PORTA DE UMA VEZ': 'OPEN THE DOOR ALREADY',
  'Nada. Ar frio. E na parede em frente, escrito a dedo no gelo da janela do corredor: uma palavra que derrete antes de você terminar de ler. Começava com a sua inicial.':
    "Nothing. Cold air. And on the wall opposite, finger-written on the frost of the hallway window: a word that melts before you finish reading it. It started with your initial.",
  'SENTAR CONTRA A PORTA ATÉ AMANHECER': 'SIT AGAINST THE DOOR UNTIL DAWN',
  'Às 5h13 as batidas param. Às 5h14, uma última — suave, quase um pedido de desculpas — na porta do quarto do Tomi. Do lado de dentro do apartamento.':
    "At 5:13 the knocking stops. At 5:14, one last one — soft, almost an apology — on the door of Tomi's bedroom. From inside the apartment.",
  'A voz da sua mãe. 2h33.': 'Your mother\'s voice. 2:33 AM.',
  '"Filho. Abre. Esqueci a chave." Você atravessa o corredor do apartamento. O quarto da sua mãe está fechado. Você abre uma fresta: ela dorme, respiração miúda, o terço na mão. Na porta da frente, a voz repete, idêntica, paciente: "Filho. Está frio aqui fora."':
    '"Son. Open up. I forgot my key." You cross the apartment hallway. Your mother\'s room is closed. You open a crack: she\'s asleep, breathing shallow, rosary in hand. At the front door, the voice repeats, identical, patient: "Son. It\'s cold out here."',
  'O corredor está vazio até onde a luz alcança. Do vão da escada, ainda com a voz dela: "amanhã, então." Você tranca a porta com as duas mãos, porque uma só não obedece.':
    'The hallway is empty as far as the light reaches. From the stairwell, still with her voice: "tomorrow, then." You lock the door with both hands, because one alone won\'t obey.',
  'ENCOSTAR A TESTA NA PORTA E ESPERAR': 'REST YOUR FOREHEAD ON THE DOOR AND WAIT',
  'A voz espera junto. Você sente — sem som nenhum — que do outro lado alguém encostou a testa também. Vocês ficam assim muito tempo. De manhã, sua mãe pergunta por que você dormiu no chão da sala.':
    "The voice waits with you. You feel — with no sound at all — that on the other side someone rested their forehead too. You stay like that a long time. In the morning, your mother asks why you slept on the living room floor.",

  /* ---- EVENTOS DE CASA (HOME_EVENTS) ---- */
  'Seu filho, Tomi, acordou tossindo. Vessa acha que é o frio. Sua mãe acha que é "outra coisa" e não explica o quê.':
    'Your son, Tomi, woke up coughing. Vessa thinks it\'s the cold. Your mother thinks it\'s "something else" and won\'t explain what.',
  'Tomi piorou. O médico do bairro emigrou na semana passada. O remédio custa caro na farmácia — quando tem.':
    "Tomi got worse. The neighborhood doctor emigrated last week. Medicine is expensive at the pharmacy — when they have it.",
  'Vessa foi rebaixada no arquivo público: "corte de pessoal por critério de confiabilidade". Ela não te olha nos olhos ao contar.':
    'Vessa was demoted at the public archive: "staff cuts by reliability criteria". She doesn\'t look you in the eye when she tells you.',
  'Distribuíram bandeiras novas no seu bloco. O vizinho que não pendurou a dele recebeu uma visita à noite. Hoje a bandeira dele é a maior do prédio.':
    "New flags were distributed on your block. The neighbor who didn't hang his got a visit at night. Today his flag is the biggest in the building.",
  'A escola de Dario exigiu o Certificado de Ancestralidade dele — "pendência de linhagem materna". Ele ficou no portão. Vessa passou a manhã no cartório e voltou com um número de protocolo e nenhum papel.':
    'Dario\'s school demanded his Ancestry Certificate — "pending maternal lineage issue". He was stuck at the gate. Vessa spent the morning at the registry office and came back with a case number and no paper.',
  'Sua mãe rasgou o formulário de ancestralidade. "Eu SEI quem eu sou." Vessa colou os pedaços de madrugada, chorando baixinho para ninguém ouvir.':
    'Your mother tore up the ancestry form. "I KNOW who I am." Vessa taped the pieces back together before dawn, crying quietly so no one would hear.',
  'Tomi desenhou a família na escola. A professora elogiou — mas perguntou por que ele desenhou "papai com dois rostos". Ele não soube explicar. Você também não.':
    'Tomi drew the family at school. The teacher praised it — but asked why he drew "daddy with two faces". He couldn\'t explain. Neither could you.',
  'Colaram um cartaz novo na escada: "DENUNCIE. É um ato de amor." Dario perguntou o que era pra denunciar. Vessa mandou ele parar de fazer perguntas na escada.':
    'A new poster went up in the stairwell: "REPORT THEM. It is an act of love." Dario asked what there was to report. Vessa told him to stop asking questions in the stairwell.',
  'O rádio pediu que cada família recitasse o novo juramento antes de dormir. Sua mãe move os lábios sem som. "Deus me ouve melhor assim", ela diz. Você finge não notar que ela não fala nada.':
    'The radio asked every family to recite the new oath before sleep. Your mother moves her lips without sound. "God hears me better this way," she says. You pretend not to notice she says nothing at all.',
  'Trocaram o nome da sua rua: agora é Avenida da Unidade. As cartas antigas voltam carimbadas "endereço inexistente" — como se a casa onde você dorme nunca tivesse existido.':
    'They renamed your street: it is now Unity Avenue. Old letters come back stamped "address does not exist" — as if the house where you sleep never existed.',
  'A família realocada bateu na sua porta pela primeira vez. O homem sorriu e ofereceu pão morno. Ninguém nunca os viu comprando nada. Vessa agradeceu e trancou a porta com as duas voltas.':
    'The relocated family knocked on your door for the first time. The man smiled and offered warm bread. No one has ever seen them buy anything. Vessa thanked them and locked the door with both turns.',
  'Não veio jornal, não veio rádio, não veio ordem. Tomi dormiu na sua cama esta noite — "só hoje". Você ficou acordado ouvindo a respiração dele, contando, com medo de que uma batida viesse errada.':
    'No newspaper came, no radio, no orders. Tomi slept in your bed tonight — "just tonight." You lay awake listening to his breathing, counting, afraid a beat would come out wrong.',
  'Tomi trouxe da escola um "Caderno de Vigilância Familiar": cada aluno anota o que os pais dizem em casa. As páginas já vêm numeradas. Vessa preencheu a primeira com elogios ao regime, letra caprichada — e queimou o resto no fogão.':
    'Tomi brought home a "Family Surveillance Notebook" from school: each pupil records what their parents say at home. The pages come pre-numbered. Vessa filled the first with praise for the regime, in careful handwriting — and burned the rest in the stove.',
  'Da noite pro dia, as bandeiras mudaram: o Conselho Popular agora governa. Sua mãe olhou pela janela e disse só: "A terceira que eu vejo. Ou a quarta. Já perdi a conta de quantos governos me prometeram o mesmo silêncio."':
    'Overnight the flags changed: the People\'s Council governs now. Your mother looked out the window and only said: "The third I\'ve seen. Or the fourth. I\'ve lost count of how many governments promised me the same silence."',
  'A família realocada tem uma menina. Ela nunca chora, nunca corre, nunca faz barulho. Hoje ela sorriu pro Tomi no corredor. Ele voltou pálido, não quis dizer por quê, e dormiu de luz acesa.':
    'The relocated family has a little girl. She never cries, never runs, never makes a sound. Today she smiled at Tomi in the hallway. He came back pale, wouldn\'t say why, and slept with the light on.',
  'Chegou um envelope sem remetente. Dentro, uma foto sua no guichê — tirada de um ângulo que não existe do lado de fora. No verso, a lápis: "Estamos satisfeitos com o seu trabalho." Ninguém assina um elogio assim.':
    'An envelope arrived with no sender. Inside, a photo of you at the booth — taken from an angle that doesn\'t exist from outside. On the back, in pencil: "We are satisfied with your work." No one signs praise like that.',
  'A luz piscou a noite inteira. No escuro, Vessa segurou sua mão e perguntou baixinho se você ainda era você. Você disse que sim. Ela apertou mais forte — do jeito de quem confere, não de quem acredita.':
    'The lights flickered all night. In the dark, Vessa held your hand and asked quietly if you were still you. You said yes. She squeezed harder — the way someone checks, not the way someone believes.',
  'Um homem parou na frente do prédio e olhou para a sua janela por vinte minutos. Vessa anotou a hora: 21h13. Quando você olhou, não havia ninguém. Nunca houve?':
    'A man stood in front of the building and stared at your window for twenty minutes. Vessa noted the time: 9:13 PM. When you looked, there was no one. Was there ever?',
  'O Conselho requisitou metade do seu apartamento para "uma família de trabalhadores realocados". Eles são educados. Eles são silenciosos. Eles cozinham sem cheiro.':
    'The Council requisitioned half your apartment for "a family of relocated workers". They are polite. They are quiet. They cook without smell.',
  'Sua mãe sumiu por seis horas. Voltou calma. Calma DEMAIS, diz Vessa. "Fui só andar", diz ela. Ela odeia andar. Sempre odiou. Não é?':
    'Your mother vanished for six hours. Came back calm. TOO calm, says Vessa. "I just went for a walk," she says. She hates walking. Always has. Hasn\'t she?',
  'Tomi perguntou no jantar: "Pai, se trocarem você, eu vou perceber?" Ninguém riu. Ninguém respondeu. O relógio da cozinha nunca fez tanto barulho.':
    'Tomi asked at dinner: "Dad, if they swap you out, will I notice?" No one laughed. No one answered. The kitchen clock never made so much noise.',
  'Vessa fez as malas. "Quando isso acabar, a gente atravessa também. Do outro lado deve ser igual — mas pelo menos é longe." Você concorda. Concordar é mais fácil.':
    'Vessa packed the bags. "When this is over, we cross too. The other side is probably the same — but at least it\'s far." You agree. Agreeing is easier.',
  'De madrugada, alguém deixou um pacote na porta: o remédio de Tomi, e um bilhete: "Dívida paga. — J.M."':
    'Before dawn, someone left a package at the door: Tomi\'s medicine, and a note: "Debt paid. — J.M."',
  'Houve um velório nesta casa. As vizinhas trouxeram sopa e silêncio.':
    'There was a wake in this house. The neighbor women brought soup and silence.',

  /* ---- BAGAGEM: objetos (BAG_POOLS / ONEWAY / CONTRABAND / HERRINGS) ---- */
  'Roupas dobradas com pressa': 'Clothes folded in a hurry',
  'Pão embrulhado em jornal de anteontem': 'Bread wrapped in the day-before-yesterday\'s newspaper',
  'Fotografia de família com o canto queimado': 'Family photograph with a burned corner',
  'Terço gasto de tanto uso': 'Rosary worn thin from use',
  'Caderno de endereços com metade dos nomes riscados': 'Address book with half the names crossed out',
  'Relógio de bolso parado às 3h12': 'Pocket watch stopped at 3:12',
  'Meias de lã tricotadas à mão': 'Hand-knitted wool socks',
  'Livro sem capa, com frases sublinhadas a lápis': 'Coverless book, with sentences underlined in pencil',
  'Ferramentas envoltas em pano oleoso': 'Tools wrapped in oilcloth',
  'Luvas de solda gastas': 'Worn welding gloves',
  'Carta de recomendação amassada e reamassada': 'A reference letter, crumpled and re-crumpled',
  'Frascos de remédio quase vazios': 'Nearly empty medicine bottles',
  'Radiografia em envelope pardo': 'X-ray in a brown envelope',
  'Receita médica dobrada em oito': 'Prescription folded into eighths',
  'Presente embrulhado (o papel foi aberto e refeito)': 'Wrapped gift (the paper was opened and redone)',
  'Bolo de mel envolto em pano de prato': 'Honey cake wrapped in a dish towel',
  'Maço de cartas amarrado com barbante': 'Bundle of letters tied with string',
  'Livros didáticos de segunda mão': 'Secondhand textbooks',
  'Caderno novo com a primeira página arrancada': 'New notebook with the first page torn out',
  'A chave de uma porta que não existe mais': 'The key to a door that no longer exists',
  'Escritura de uma casa vendida às pressas': 'Deed to a house sold in a hurry',
  'Álbum de fotografias completo, pesado demais para quem viaja leve': 'A complete photo album, too heavy for someone traveling light',
  'Quase nada: uma muda de roupa': 'Almost nothing: a change of clothes',
  'Mapa com uma rota marcada a lápis — e outra, apagada': 'Map with one route marked in pencil — and another, erased',
  'Passagem de trem — SÓ IDA': 'Train ticket — ONE WAY ONLY',
  'Comprada há três dias. Não há passagem de volta em lugar nenhum desta bagagem.':
    'Bought three days ago. There is no return ticket anywhere in this luggage.',
  'Frascos sem rótulo com líquido âmbar': 'Unlabeled bottles with amber liquid',
  'Maço de passaportes EM BRANCO': 'A stack of BLANK passports',
  'Peças metálicas que, montadas, deixariam de ser inocentes': 'Metal parts that, assembled, would stop being innocent',
  'Carimbo oficial do Ministério — que não deveria estar aqui': 'Official Ministry stamp — which shouldn\'t be here',
  'Roupas masculinas na mala de uma viajante — (fuga? luto? não é crime)':
    'Men\'s clothing in a female traveler\'s bag — (fleeing? grief? not a crime)',
  'Brinquedos infantis — e nenhuma criança na viagem': 'Children\'s toys — and no child on the trip',
  'Aliança guardada na caixinha, não no dedo': 'Wedding ring kept in its box, not on the finger',
  'Diário com as últimas dez páginas arrancadas': 'Diary with the last ten pages torn out',
  'Uniforme militar dobrado no fundo — sem insígnias': 'Military uniform folded at the bottom — no insignia',
  'Um molho de chaves de portas que ninguém aqui reconhece': 'A ring of keys to doors no one here recognizes',
  'Duas alianças idênticas — e a pessoa veio sozinha': 'Two identical wedding rings — and the person came alone',
  'Sabonete ainda no papel, guardado como um tesouro': 'A bar of soap still in its paper, kept like a treasure',
  'Um único brinco — o par ficou com alguém': 'A single earring — the other stayed with someone',
  'Botas de trabalho com a sola remendada com arame': 'Work boots with the sole patched with wire',
  'Óculos de leitura com uma das hastes presa por barbante': 'Reading glasses with one arm held on by string',
  'Um brinquedo de corda que ainda funciona — e ninguém para dar': 'A wind-up toy that still works — and no one to give it to',
  'Um diploma enrolado num tubo, com o nome raspado': 'A diploma rolled in a tube, the name scratched off',
  'Um punhado de terra amarrado num lenço': 'A handful of earth tied in a handkerchief',
  'Uma foto 3x4 sobrando, sem documento para colar': 'A spare passport photo, with no document to glue it to',
  'Isto não deveria estar aqui. Isto não tem explicação boa.': 'This shouldn\'t be here. There is no good explanation for this.',

  /* ---- A CASA (house.js): cômodos, família, batidas noturnas ---- */
  'QUARTO DE TOMI': "TOMI'S ROOM",
  'QUARTO DE HÓSPEDES 1': 'GUEST ROOM 1',
  'QUARTO DE HÓSPEDES 2': 'GUEST ROOM 2',
  'COZINHA': 'KITCHEN',
  'QUARTO DA SUA MÃE': "YOUR MOTHER'S ROOM",
  'QUARTO DE DARIO': "DARIO'S ROOM",
  'SEU QUARTO': 'YOUR ROOM',
  'SALA': 'LIVING ROOM',
  'CORREDOR': 'HALLWAY',
  'A PISTA DA FILA — VAZIA': 'THE QUEUE LANE — EMPTY',

  'piscar': 'blinking', 'olhos': 'eyes', 'dentes': 'teeth',
  'pele': 'skin', 'mãos': 'hands', 'pescoço': 'neck',

  'ODILA — sua mãe': 'ODILA — your mother',
  'VESSA — sua esposa': 'VESSA — your wife',
  'TOMI — 8 anos': 'TOMI — 8 years old',
  'DARIO — 15 anos': 'DARIO — 15 years old',
  'sua mãe': 'your mother', 'Vessa': 'Vessa', 'Tomi': 'Tomi', 'Dario': 'Dario',
  'E — Falar com ': 'E — Talk to ',

  // H_LINES: mãe
  'Sente um pouco, filho. A televisão passou o dia inteiro falando dessa fila sua. Dizem que tem gente dormindo na calçada.':
    "Sit for a bit, son. The television talked all day about that line of yours. They say people are sleeping on the sidewalk.",
  'Fiz chá. Esfriou. Faço outro amanhã. — Ela não desgruda os olhos da TV. — Esse apresentador novo pisca demais. Ou de menos. Um dos dois.':
    "I made tea. It went cold. I'll make more tomorrow. — She doesn't take her eyes off the TV. — This new anchor blinks too much. Or too little. One of the two.",
  'Sua avó dizia: "quem vigia a porta esquece a janela". Eu nunca entendi. Agora entendo um pouco.':
    'Your grandmother used to say: "whoever watches the door forgets the window." I never understood it. Now I understand a little.',
  'Trocaram o hino de novo. Eu cantava o antigo pra você dormir... Agora dizem que o antigo é crime. Cantar baixinho também é?':
    "They changed the anthem again. I used to sing the old one to put you to sleep... Now they say the old one is a crime. Is singing it quietly a crime too?",
  'A vizinha do 11 denunciou o próprio genro, filho. GENRO. A televisão deu parabéns pra ela. Parabéns.':
    'The neighbor from 11 reported her own son-in-law, son. SON-IN-LAW. The television congratulated her. Congratulated her.',
  'Rasguei um papel essa semana. Não me arrependo. — Ela aumenta o volume da TV. — Não me arrependo.':
    "I tore up a paper this week. I don't regret it. — She turns up the TV. — I don't regret it.",
  'Agora a televisão diz que os Alternados nunca existiram. Semana passada existiam demais. Eu já vivi muito pra acreditar em televisão, filho.':
    "Now the television says the Alternates never existed. Last week there were too many of them. I've lived too long to believe television, son.",
  'Levaram o retrato antigo do corredor do prédio. Puseram outro. O rosto é diferente mas a moldura... a moldura é a mesma.':
    "They took down the old portrait in the building hallway. Put up another. The face is different but the frame... the frame is the same.",
  'Aquela família que mora no seu... quer dizer, NOSSO apartamento agora. Eles não fazem barulho nenhum. Nenhum. Nem os passos.':
    'That family living in your... I mean, OUR apartment now. They make no noise at all. None. Not even footsteps.',
  'A televisão só dá chuvisco. Eu deixo ligada mesmo assim. A luz dela... faz companhia. Você acha que tem alguém do outro lado do chuvisco?':
    "The television is just static now. I leave it on anyway. Its light... keeps me company. Do you think there's someone on the other side of the static?",
  'Hoje eu fui andar. Eu sei que eu odeio andar. Mas alguma coisa em mim quis andar. Voltei, ué. Eu sempre volto. — Ela sorri. Demora um segundo a mais que o normal.':
    "I went for a walk today. I know I hate walking. But something in me wanted to walk. I came back, of course. I always come back. — She smiles. It takes one second longer than usual.",
  'Se um dia eu voltar diferente, filho... não abre a porta. Nem pra mim. Promete? — A TV chia. — Promete.':
    "If one day I come back different, son... don't open the door. Not even for me. Promise? — The TV hisses. — Promise.",
  'Vai dormir, filho. Amanhã tem fila.': "Go to sleep, son. There's a line tomorrow.",
  'Shhh. Agora é a novela.': "Shhh. It's the soap opera now.",
  'O chá esfriou de novo.': 'The tea went cold again.',
  'Ela está enrolada na manta, ardendo em febre. "Não gasta dinheiro comigo, filho. Gasta com os meninos." A TV continua ligada.':
    'She\'s wrapped in the blanket, burning with fever. "Don\'t spend money on me, son. Spend it on the boys." The TV stays on.',

  // H_LINES: Vessa
  'Chegou... — Ela mexe a panela sem olhar. — A Marta veio aqui hoje. Aquela boca não para. Mas escuta, às vezes sai coisa útil do meio da fofoca.':
    "You're back... — She stirs the pot without looking up. — Marta came by today. That mouth never stops. But listen, sometimes something useful comes out of the gossip.",
  'Sobrou pão de ontem. Amanhã eu dou um jeito no jantar. A gente sempre dá um jeito, não é?':
    "There's leftover bread from yesterday. Tomorrow I'll figure out dinner. We always figure something out, don't we?",
  'O arquivo tá estranho. Pastas que eu organizei... amanhecem em outra ordem. Deve ser o turno da noite. Deve ser.':
    "The archive is strange. Folders I organized... wake up in a different order. Must be the night shift. Must be.",
  'Me fizeram assinar um termo hoje. "Confiabilidade". A caneta era deles, o papel era deles, a mão era minha. Por enquanto a mão era minha.':
    'They made me sign a form today. "Reliability." The pen was theirs, the paper was theirs, the hand was mine. For now the hand was mine.',
  'A Lena parou de vir. O marido dela achou "arriscado" a amizade. Amizade agora tem risco, entende?':
    'Lena stopped coming by. Her husband found the friendship "risky." Friendship carries risk now, you understand?',
  'Cuidado com o que você carimba, meu amor. As paredes do arquivo ouvem. As daqui de casa eu já não sei.':
    "Careful what you stamp, my love. The archive walls listen. The ones here at home, I no longer know.",
  'Os realocados pediram sal DE NOVO. Terceira vez. O que é que eles cozinham que não faz cheiro, hein? Me diz.':
    "The relocated ones asked for salt AGAIN. Third time. What do they cook that has no smell, huh? Tell me.",
  'Fofoca do dia: dizem que quem trabalhou pro governo antigo tá sumindo. Você trabalhou pros dois, amor. Você trabalha pra qualquer um que mande. Isso salva ou condena?':
    "Today's gossip: they say anyone who worked for the old government is disappearing. You worked for both, love. You work for whoever's in charge. Does that save you or condemn you?",
  'Eu guardei umas coisas numa mala. Não me olha assim. É só... por precaução. Todo mundo tem uma mala agora.':
    "I packed some things in a suitcase. Don't look at me like that. It's just... precaution. Everyone has a suitcase now.",
  'Não tem mais fofoca. As amigas... cada uma sumiu de um jeito. A Marta foi pro norte. Do norte não chega notícia. Nem ruim.':
    "There's no more gossip. The friends... each one vanished in her own way. Marta went north. No news comes from the north. Not even bad news.",
  'Hoje eu vi a fila do seu posto de longe. Tanta gente, meu amor. E você lá dentro, decidindo. Como é que você dorme? — Ela para. — Desculpa. Eu sei como você dorme. Eu ouço.':
    "Today I saw the line at your post from a distance. So many people, my love. And you in there, deciding. How do you sleep? — She stops. — Sorry. I know how you sleep. I hear it.",
  'Quando isso acabar a gente atravessa também. Pro lado de lá. Deve ser igual. Mas pelo menos é LONGE.':
    "When this is over, we cross too. To the other side. It's probably the same. But at least it's FAR.",
  'O jantar já foi. Te deixei um prato.': "Dinner's done. I left you a plate.",
  'Amanhã eu te conto o resto.': "I'll tell you the rest tomorrow.",
  'Vai ver os meninos antes de dormir.': 'Go check on the boys before you sleep.',
  'Ela está sentada no chão da cozinha, encostada no fogão apagado. "Já passa. Vai ver os meninos." Não passa.':
    'She\'s sitting on the kitchen floor, leaning against the cold stove. "It\'ll pass. Go check on the boys." It doesn\'t pass.',

  // H_LINES: Tomi
  'Pai! Eu desenhei a família. A professora gostou. Só perguntou por que eu desenhei você com dois rostos. Eu não lembro de ter desenhado o segundo.':
    "Dad! I drew the family. The teacher liked it. She just asked why I drew you with two faces. I don't remember drawing the second one.",
  'Pai, na fila da sua fronteira... as pessoas más têm cara de quê? Todo mundo tem cara de gente, não tem? Aí como é que você sabe?':
    "Dad, in the line at your border... what do bad people look like? Everyone looks like people, don't they? So how do you know?",
  'Eu sonhei com números. Um monte. Carimbados na testa das pessoas. O seu era bonito, pai. O seu era quase igual ao de verdade.':
    "I dreamed of numbers. A lot of them. Stamped on people's foreheads. Yours was pretty, dad. Yours looked almost like the real one.",
  'A escola ensinou uma música nova. É legal mas... quando a gente canta todo mundo junto, parece que a sala fica escura. Pode ficar escuro de música, pai?':
    "School taught a new song. It's nice but... when we all sing together, the room seems to get dark. Can a room get dark from music, dad?",
  'Mandaram a gente desenhar "o inimigo". Eu desenhei um quadrado vazio. A professora ficou me olhando um tempão. Depois deu nota máxima.':
    'They made us draw "the enemy." I drew an empty square. The teacher stared at me for a long time. Then gave me the top grade.',
  'O Dario tá esquisito. Ele conversa sozinho no quarto. Só que... pai... às vezes a outra voz responde.':
    "Dario's acting strange. He talks to himself in his room. Except... dad... sometimes the other voice answers.",
  'Trocaram os livros de novo. O herói do livro velho agora é o vilão do novo. Eu perguntei qual era o de verdade. Me mandaram sentar.':
    "They changed the books again. The hero of the old book is now the villain of the new one. I asked which one was real. They told me to sit down.",
  'Eu sonhei que batiam na porta a noite inteira. E quando eu abria, era eu do lado de fora. Eu pedindo pra entrar. Qual dos dois eu era, pai?':
    "I dreamed someone knocked on the door all night. And when I opened it, it was me on the outside. Me asking to come in. Which one of the two was I, dad?",
  'A senhora do 7 sumiu, né? Eu vi os móveis saindo. Móvel não anda sozinho. Quer dizer... antigamente não andava.':
    "The lady from 7 disappeared, right? I saw the furniture leaving. Furniture doesn't walk by itself. I mean... it didn't used to.",
  'A escola fechou. Eu fico olhando pela janela. Tem um cachorro que atravessa a rua sempre no mesmo lugar, na mesma hora. TODO dia. Igualzinho. Cachorro de verdade faz isso?':
    "School closed. I keep looking out the window. There's a dog that crosses the street always in the same spot, at the same time. EVERY day. Exactly the same. Does a real dog do that?",
  'Pai, se trocarem você, eu vou perceber? — Ele não está brincando. — Eu ia perceber. Eu IA. Pelo cheiro. Você tem cheiro de carimbo.':
    "Dad, if they swap you out, will I notice? — He's not joking. — I would notice. I WOULD. By the smell. You smell like a stamp.",
  'Eu não tenho mais medo do escuro. O escuro é sempre igual. Eu tenho medo das coisas que ficam iguais DEMAIS.':
    "I'm not afraid of the dark anymore. The dark is always the same. I'm afraid of things that stay TOO much the same.",
  'Boa noite, pai. Deixa a porta encostada?': 'Good night, dad. Leave the door ajar?',
  'Amanhã você me conta da fila?': 'Will you tell me about the line tomorrow?',
  'Zzz... não... o carimbo não...': 'Zzz... no... not the stamp...',
  'Ele está deitado, pequeno demais na cama. "Pai, eu sonhei que o remédio vinha voando pela janela." Tosse. "Remédio voa?"':
    'He\'s lying down, too small for the bed. "Dad, I dreamed the medicine came flying through the window." Coughs. "Can medicine fly?"',

  // H_LINES: Dario
  '...oi. — Ele não vira. Está de frente pro canto do quarto. — Eu tava conversando. Não. Ninguém. Esquece.':
    "...hey. — He doesn't turn. He's facing the corner of the room. — I was talking. No. No one. Forget it.",
  'A escola tá um saco. Perguntaram da minha mãe de novo. A minha mãe DE VERDADE. Eu disse que não lembro do rosto dela. Mentira. Eu lembro todo dia.':
    "School sucks. They asked about my mother again. My REAL mother. I said I don't remember her face. Lie. I remember it every day.",
  'O amigo diz que você é dos bons, pai. Eu falei que você é só... você. Ele riu. Ele acha você engraçado.':
    "The friend says you're one of the good ones, dad. I told him you're just... you. He laughed. He thinks you're funny.",
  'A escola pediu meu "certificado de ancestralidade". A diretora olhou pra minha cara e disse "você entende, não é?". EU ENTENDO. É isso que dá ser filho da mulher errada, né, pai?':
    'School asked for my "ancestry certificate." The principal looked at my face and said "you understand, don\'t you?" I UNDERSTAND. That\'s what you get for being the son of the wrong woman, right, dad?',
  'Me chamaram de "mistura" no pátio. O professor ouviu. O professor CONCORDOU. — Ele soca a parede de leve, ritmado. — O amigo disse pra eu não revidar. Que logo não vai mais importar.':
    'They called me "mixed" in the yard. The teacher heard. The teacher AGREED. — He punches the wall lightly, rhythmically. — The friend said not to fight back. That it won\'t matter soon.',
  'O amigo disse que essas leis não são pra pegar os de fora. São pra treinar os de dentro. Treinar a gente a apontar. Ele fala umas coisas, pai...':
    "The friend said these laws aren't to catch outsiders. They're to train the ones inside. Train us to point fingers. He says some things, dad...",
  'Agora dizem que raça não existe e que era tudo mentira do governo velho. Ontem eu era "mistura", hoje eu sou "camarada". Amanhã eu sou o quê? Quem decide o que eu sou?':
    'Now they say race doesn\'t exist and it was all a lie from the old government. Yesterday I was "mixed," today I\'m "comrade." Tomorrow I\'m what? Who decides what I am?',
  'O amigo não gosta dos realocados. Ele fica quieto quando eles cozinham. É a única hora que ele fica quieto.':
    "The friend doesn't like the relocated ones. He goes quiet when they cook. It's the only time he's quiet.",
  'Você nunca pergunta com quem eu falo. Todo mundo pergunta. Você não. — Pausa. — Valeu. Acho.':
    "You never ask who I talk to. Everyone asks. Not you. — Pause. — Thanks. I guess.",
  'O amigo tá diferente. Antes ele contava coisas. Agora ele só... espera. Fica esperando comigo. Esperando o quê, eu não sei.':
    "The friend is different. Before he used to tell me things. Now he just... waits. Waits with me. Waiting for what, I don't know.",
  'Se a gente for embora, ele disse que não pode ir junto. Que ele é DAQUI. Daqui tipo... da casa? Da cidade? Ele não explica.':
    "If we leave, he said he can't come along. That he's FROM HERE. From here as in... the house? The city? He doesn't explain.",
  'Pai. Uma vez. Só uma. Ele errou meu nome. Me chamou pelo SEU nome. E depois pediu desculpa como quem tinha visto uma coisa que ainda não aconteceu.':
    "Dad. Once. Just once. He got my name wrong. Called me by YOUR name. And then apologized like someone who'd seen something that hadn't happened yet.",
  '...boa noite. — Ele volta a olhar pro canto.': '...good night. — He looks back at the corner.',
  'A gente conversa amanhã, tô no meio de uma coisa.': "We'll talk tomorrow, I'm in the middle of something.",
  'Ele diz boa noite também. Brincadeira. Vai dormir, pai.': "He says good night too. Kidding. Go to sleep, dad.",
  'Ele está na cama, virado pra parede. "O amigo disse que eu vou melhorar. Ele nunca erra essas coisas. Nunca."':
    'He\'s in bed, turned toward the wall. "The friend said I\'ll get better. He\'s never wrong about these things. Never."',

  // H_SPECIAL
  'Eu não saí de casa hoje. — Ela diz isso antes de você perguntar qualquer coisa. Ela não para de mexer a panela vazia. — Por que você está me olhando assim? EU NÃO SAÍ DE CASA HOJE.':
    "I didn't leave the house today. — She says this before you ask anything. She doesn't stop stirring the empty pot. — Why are you looking at me like that? I DIDN'T LEAVE THE HOUSE TODAY.",
  'Você usava uma caneca azul hoje, pai? Lascada? — Ele não olha pra você. — O homem do meu sonho disse "obrigado pelo carimbo duplo". Ele mandou lembrança.':
    'Did you use a blue mug today, dad? Chipped? — He doesn\'t look at you. — The man in my dream said "thanks for the double stamp." He sends his regards.',
  'A professora elogiou meu desenho de novo. O da família. Pai... eu desenhei a gente com CINCO pessoas. Nós não somos quatro mais a vovó? Quem é o quinto? Eu não lembro de desenhar o quinto.':
    "The teacher praised my drawing again. The family one. Dad... I drew us as FIVE people. Aren't we four plus grandma? Who's the fifth? I don't remember drawing the fifth one.",
  'Eu rasguei o formulário. — Ela olha pra você pela primeira vez na noite. — Eu SEI quem eu sou. Escreve aí no teu posto: a Odila sabe quem é. Poucos nesse país podem dizer o mesmo.':
    'I tore up the form. — She looks at you for the first time all night. — I KNOW who I am. Write that down at your post: Odila knows who she is. Few in this country can say the same.',
  'A escola não me deixou entrar hoje sem o certificado. Fiquei no portão que nem cachorro. O amigo ficou comigo o tempo todo. Ele disse: "guarda os rostos de quem fechou o portão". Eu guardei, pai. Eu guardei.':
    'The school wouldn\'t let me in today without the certificate. I stood at the gate like a dog. The friend stayed with me the whole time. He said: "remember the faces of whoever closed the gate." I remembered, dad. I remembered.',

  // infoVessa / infoMae (fragmentos dinâmicos)
  'A Marta não veio hoje. Sem fofoca, sem notícia. O silêncio das amigas é a pior notícia que existe.':
    "Marta didn't come today. No gossip, no news. A friend's silence is the worst news there is.",
  'Fofoca com fundamento: a Marta jurou que essa história de ':
    'Solid gossip: Marta swore that story about ',
  '... é VERDADE. O cunhado dela trabalha num posto do norte e viu. Amanhã deve chegar esse boato aí na sua fronteira. Fica esperto.':
    '... is TRUE. Her brother-in-law works at a post up north and saw it. That rumor should reach your border tomorrow. Stay sharp.',
  'A Lena me contou: essa conversa de ': 'Lena told me: that talk about ',
  ' é INVENÇÃO. Espalharam pra vender scanner, pra vender medo. Se aparecer no teu comunicado amanhã, pensa duas vezes antes de estragar a vida de alguém por isso.':
    ' is MADE UP. They spread it to sell scanners, to sell fear. If it shows up in your bulletin tomorrow, think twice before ruining someone\'s life over it.',
  'A moça da televisão despediu-se hoje com "até amanhã, se houver amanhã". Depois riu. Ninguém no estúdio riu junto.':
    'The TV woman signed off today with "see you tomorrow, if there is one." Then she laughed. No one in the studio laughed with her.',
  'A televisão adiantou o jornal de amanhã, filho: "': "The television gave a preview of tomorrow's paper, son: \"",
  '". Ou eu sonhei que adiantou. Na minha idade a televisão e o sonho passam no mesmo canal.':
    '". Or I dreamed it did. At my age the television and the dream play on the same channel.',
  'A televisão disse que está tudo sob controle. Foi a quarta vez que disseram essa frase hoje. Quem conta quatro vezes, não controla nada.':
    "The television said everything is under control. That's the fourth time they said that sentence today. Whoever says it four times controls nothing.",

  // H_VISIONS
  'Sonhei que um moço dormia na nossa escada abraçado num cobertor. Ele tinha frio DE DENTRO, pai. Dá pra ter frio de dentro?':
    "I dreamed a young man slept on our stairs hugging a blanket. He was cold FROM INSIDE, dad. Can you be cold from inside?",
  'Sonhei com dois homens de casaco comprido parados na porta. Eles não tinham prancheta de verdade. Era só pra segurar alguma coisa nas mãos.':
    "I dreamed of two men in long coats standing at the door. Their clipboards weren't real. They were just something to hold in their hands.",
  'Tem um bebê no meu sonho que não chora. A mãe pede água. Dá água pra ela, pai. Mesmo assim... não deixa ela entrar.':
    "There's a baby in my dream that doesn't cry. The mother asks for water. Give her water, dad. Even so... don't let her in.",
  'Sonhei com botas no corredor. Muitas. Eu contei, pai. Subiam seis. Desciam SETE.':
    "I dreamed of boots in the hallway. Many of them. I counted, dad. Six went up. SEVEN came down.",
  'Uma mão girando a maçaneta. Devagarinho. Com educação. No sonho eu sabia: quem gira assim não quer entrar. Quer saber se VOCÊ vai abrir.':
    "A hand turning the doorknob. Slowly. Politely. In the dream I knew: whoever turns it like that doesn't want to come in. They want to know if YOU will open it.",
  'Tem um menino que quer brincar comigo. Ele bate na porta bem baixinho, na altura do meu joelho. Ele diz que se chama Nico. Pai... eu NUNCA te contei o nome dele. Como é que eu sei o nome dele?':
    "There's a boy who wants to play with me. He knocks on the door very softly, at knee height. He says his name is Nico. Dad... I NEVER told you his name. How do I know his name?",
  'Sonhei com um homem de casaco cinza que anotava numa pasta. Ele já sabia as respostas. Ele só queria ver a sua cara enquanto você mentia.':
    "I dreamed of a man in a gray coat writing in a folder. He already knew the answers. He just wanted to see your face while you lied.",
  'Sonhei que a moça de lá do quarto pedia sal. Aí ela devolvia o pote cheio. Do MESMO jeitinho. Sal não volta sozinho, né, pai?':
    "I dreamed the woman from that room asked for salt. Then she returned the jar full. In the EXACT same way. Salt doesn't come back by itself, does it, dad?",
  'Sonhei com o seu carimbo indo embora dentro de um jornal. Ele voltava cheirando diferente. Carimbo tem saudade de casa?':
    "I dreamed your stamp went away wrapped in a newspaper. It came back smelling different. Does a stamp miss home?",
  'Vai bater na porta a noite toda. Não vai ter ninguém. Aí a última batida... a última vem de dentro. Dorme com a luz acesa hoje, pai. Por mim.':
    "There'll be knocking on the door all night. There won't be anyone there. Then the last knock... the last one comes from inside. Sleep with the light on tonight, dad. For me.",
  'Sonhei com a voz da vovó do lado de fora pedindo pra entrar. Mas a vovó tava dormindo aqui dentro. Pai... quem é que guarda a voz das pessoas quando elas dormem?':
    "I dreamed of grandma's voice outside asking to come in. But grandma was asleep in here. Dad... who keeps people's voices when they're sleeping?",

  // infoTomi / infoDario
  'Pai, eu tive um daqueles sonhos... ': 'Dad, I had one of those dreams... ',
  'Lembra do sonho que eu ia te contar? ': 'Remember the dream I was going to tell you about? ',
  'Sonhei que a fila do seu trabalho dava volta no mundo e terminava aqui na nossa porta.':
    "I dreamed the line at your work went all the way around the world and ended right here at our door.",
  'Sonhei com o carimbo verde. Ele fazia as pessoas felizes. Aí eu virava o carimbo e atrás dele tinha outro carimbo.':
    "I dreamed of the green stamp. It made people happy. Then I turned the stamp over and behind it was another stamp.",
  'Hoje não sonhei nada, pai. O nada também conta como sonho?':
    "I didn't dream anything today, dad. Does nothing count as a dream too?",
  'Pai. Escuta. O amigo NUNCA usou esse tom antes. Ele disse: "amanhã vem um que não é um deles nem um de vocês. NÃO OLHE DE PERTO. NÃO CHAME NINGUÉM — nem quando a máquina implorar. Carimbe qualquer coisa, rápido, e deixe ir." Ele repetiu três vezes, pai. Ele nunca repete.':
    'Dad. Listen. The friend NEVER used that tone before. He said: "tomorrow someone comes who isn\'t one of them or one of you. DON\'T LOOK CLOSELY. DON\'T CALL ANYONE — not even when the machine begs. Stamp anything, quickly, and let them go." He repeated it three times, dad. He never repeats himself.',
  'O amigo parou de falar. Desde ontem. Ele só senta ali no canto e espera comigo. Eu perguntei "esperar o quê". Ele olhou pra porta.':
    'The friend stopped talking. Since yesterday. He just sits there in the corner and waits with me. I asked "wait for what." He looked at the door.',
  '"A partir de agora eles não erram mais." Foi isso que ele disse. Palavra por palavra. E depois: "diz pro teu pai que não foi culpa dele. Diz ANTES."':
    '"From now on they don\'t make mistakes anymore." That\'s what he said. Word for word. And then: "tell your dad it wasn\'t his fault. Tell him BEFORE."',
  'O amigo mandou um recado pra você. Sério. Ele disse: "amanhã passa alguém com o nome errado na lista dele. Que ele leia a lista com calma antes de carimbar qualquer coisa." Eu só tô repetindo, pai. Não me olha assim.':
    'The friend sent you a message. Seriously. He said: "tomorrow someone with the wrong name on his list comes through. Tell him to read the list slowly before stamping anything." I\'m just repeating it, dad. Don\'t look at me like that.',
  'O amigo avisou: amanhã à noite, quando baterem — porque VÃO bater — olha primeiro. E mesmo depois de olhar... pensa se vale abrir.':
    "The friend warned me: tomorrow night, when they knock — because they WILL knock — look first. And even after looking... think about whether it's worth opening.",
  'O amigo perguntou de você hoje. Pelo nome. Pai... eu nunca disse seu nome pra ele.':
    'The friend asked about you today. By name. Dad... I never told him your name.',
  'Perguntei de onde ele vem. Ele disse "de perto". Perguntei perto de quê. Ele disse "de você".':
    'I asked where he comes from. He said "close by." I asked close to what. He said "to you."',
  'O amigo não aparece em foto. A gente tentou. Não é que ele saia borrado. É que a foto sai... sem o canto do quarto.':
    "The friend doesn't show up in photos. We tried. It's not that he comes out blurry. It's that the photo comes out... missing the corner of the room.",

  // batidas na porta / atender
  'NOTA OFICIAL: um servidor público deixou de atender fiscalização domiciliar. A advertência consta do seu prontuário. O Estado bate uma vez.':
    "OFFICIAL NOTICE: a civil servant failed to answer a home inspection. The warning is on file. The State knocks once.",
  'As batidas param. Passos descem a escada — devagar, sem pressa, como quem anota.':
    'The knocking stops. Footsteps go down the stairs — slowly, unhurried, like someone taking notes.',
  'De manhã você encontrará um papel colado na porta: "NOTIFICAÇÃO DE AUSÊNCIA — advertência registrada". O Estado também inspeciona quem inspeciona.':
    'In the morning you\'ll find a paper taped to the door: "NOTICE OF ABSENCE — warning on record." The State also inspects those who inspect.',
  'As batidas simplesmente param. Nenhum passo se afasta.':
    'The knocking simply stops. No footsteps move away.',
  'Você percebe que passou os últimos minutos sem piscar.':
    "You realize you've spent the last few minutes without blinking.",
  'Quem quer que fosse, desistiu. Vizinhos desistem rápido, nos dias de hoje.':
    'Whoever it was gave up. Neighbors give up fast, these days.',
  'A PORTA': 'THE DOOR',
  'O olho mágico mostra o corredor do prédio, vazio. O corredor mostra o olho mágico de volta.':
    "The peephole shows the building hallway, empty. The hallway shows the peephole back.",
  'FISCAL DO MINISTÉRIO': 'MINISTRY INSPECTOR',
  'Um homem de casaco cinza, prancheta na mão. "Fiscalização de rotina, inspetor. Confirmando residência, composição familiar e... disposição."':
    'A man in a gray coat, clipboard in hand. "Routine inspection, inspector. Confirming residence, household composition and... disposition."',
  'Ele olha por cima do seu ombro para dentro da casa. Conta as pessoas com os olhos. Anota.':
    'He looks over your shoulder into the house. Counts the people with his eyes. Writes it down.',
  '"Tudo conforme. Por enquanto." Ele desce a escada sem se despedir. Você fecha a porta com as duas mãos.':
    '"Everything in order. For now." He goes down the stairs without saying goodbye. You close the door with both hands.',
  'UM VIZINHO': 'A NEIGHBOR',
  'É o velho Ansel, do 3. "Desculpa a hora. É que... vocês têm fósforo? A luz caiu no meu lado e a minha caixa acabou."':
    'It\'s old Ansel, from 3. "Sorry for the hour. It\'s just... do you have matches? The power went out on my side and I\'m out of them."',
  'Você entrega a caixa de fósforos. Ele agradece três vezes e desce contando os degraus em voz alta. Todo mundo tem seus rituais agora.':
    'You hand him the box of matches. He thanks you three times and goes down counting the steps out loud. Everyone has their rituals now.',
  '…': '…',
  'Não há ninguém. Há um embrulho pequeno no capacho: dentro, um botão de casaco. Do SEU casaco — você confere a manga: não falta nenhum.':
    "There's no one there. There's a small parcel on the doormat: inside, a coat button. From YOUR coat — you check the sleeve: none are missing.",
  'Você olha o botão por um longo tempo. Depois olha a manga de novo. Depois decide que não vai contar isso pra ninguém.':
    "You stare at the button for a long time. Then check the sleeve again. Then decide you won't tell anyone about this.",

  // interactWith: retrato, quartoMae, hosp1, hosp2, bed
  'Cinco silhuetas. Como sempre. Pare de contar.': 'Five silhouettes. As always. Stop counting.',
  'O RETRATO': 'THE PORTRAIT',
  'O RETRATO DA FAMÍLIA': 'THE FAMILY PORTRAIT',
  'Cinco silhuetas atrás do vidro empoeirado: Vessa, Dario, você, sua mãe, Tomi. Cinco. A conta fecha.':
    'Five silhouettes behind the dusty glass: Vessa, Dario, you, your mother, Tomi. Five. The count checks out.',
  'Você percebe que contou nos dedos. Você percebe que era a segunda vez que contava.':
    "You realize you counted on your fingers. You realize this was the second time you counted.",
  'A quinta silhueta — a menorzinha, do canto — está mais clara que as outras. Sempre esteve? Fotografias desbotam do canto para o centro. É física. Deve ser física.':
    "The fifth silhouette — the smallest one, in the corner — is lighter than the others. Was it always? Photographs fade from the corner to the center. It's physics. It must be physics.",
  'A moldura está torta meio centímetro. Você não arruma. Arrumar seria admitir que mediu.':
    "The frame is crooked by half a centimeter. You don't fix it. Fixing it would mean admitting you measured it.",
  'Está como você deixou. Tudo nesta casa fica como você deixou. Quase tudo.':
    "It's just as you left it. Everything in this house stays as you left it. Almost everything.",
  'O QUARTO DA SUA MÃE': "YOUR MOTHER'S ROOM",
  'A cama está feita. Feita demais. O travesseiro não tem amassado nenhum — nem o vinco de uma cabeça, nem o calor de um corpo.':
    "The bed is made. Too well made. The pillow has no dent at all — not the crease of a head, not the warmth of a body.",
  'Ela dorme aqui? Dormiu alguma vez? Você tenta lembrar da última vez que a viu deitada e a memória devolve só a poltrona, a TV, a luz azul.':
    "Does she sleep here? Has she ever? You try to remember the last time you saw her lying down and the memory only gives back the armchair, the TV, the blue light.",
  'Você ajeita um travesseiro que não precisava ser ajeitado e sai sem fazer barulho. Para não acordar ninguém. Não há ninguém.':
    "You fix a pillow that didn't need fixing and leave without making a sound. So as not to wake anyone. There's no one there.",
  'Na gaveta, embaixo das meias de lã: o formulário de ancestralidade — rasgado ao meio e colado de volta com fita, letra por letra alinhada.':
    "In the drawer, under the wool socks: the ancestry form — torn in half and taped back together, letter by letter aligned.",
  'Foi a Vessa que colou, de madrugada. Sua mãe finge que não sabe. A fita finge que segura. Todo mundo nesta casa é muito bom em fingir.':
    "It was Vessa who taped it, before dawn. Your mother pretends not to know. The tape pretends to hold. Everyone in this house is very good at pretending.",
  'Você fecha a gaveta exatamente como estava. Isso também é um tipo de fita.':
    'You close the drawer exactly as it was. That, too, is a kind of tape.',
  'Cheiro de lavanda velha e naftalina. O terço no criado-mudo. E, embaixo do travesseiro, dobradas em quatro: ₴ 2 — "emergência", ela sempre diz.':
    'Smell of old lavender and mothballs. The rosary on the nightstand. And, under the pillow, folded in quarters: ₴ 2 — "emergency," she always says.',
  'PEGAR AS ₴ 2': 'TAKE THE ₴ 2',
  'Você pega. Emergência é um conceito flexível.': 'You take it. Emergency is a flexible concept.',
  'Ela vai perceber. Ela percebe tudo. Ela não vai dizer nada — e isso vai ser pior que qualquer coisa que ela pudesse dizer.':
    "She'll notice. She notices everything. She won't say anything — and that will be worse than anything she could say.",
  'DEIXAR': 'LEAVE IT',
  'Você deixa. Alguma coisa nesta casa ainda precisa ficar no lugar.':
    "You leave it. Something in this house still needs to stay in its place.",
  'VOCÊ': 'YOU',
  'Continua vazio. Por enquanto.': 'Still empty. For now.',
  'Um colchão nu, uma cadeira, poeira em suspensão na luz da lâmpada. Ninguém visita mais ninguém neste país.':
    "A bare mattress, a chair, dust hanging in the lamplight. No one visits anyone anymore in this country.",
  'Eles não se viraram. Eles nunca se viram. Você já reparou que nunca viu o rosto deles?':
    "They didn't turn around. They never turn around. Have you noticed you've never seen their faces?",
  'OS REALOCADOS': 'THE RELOCATED',
  'Os dois estão de pé, de costas, imóveis — como sempre. Sem virar, o homem estende o braço para trás: ₴ 2 dobradas entre os dedos.':
    "The two of them stand, backs turned, motionless — as always. Without turning, the man reaches his arm back: ₴ 2 folded between his fingers.",
  '"Pelo incômodo", diz a mulher. A voz vem do lugar errado do quarto.':
    '"For the trouble," says the woman. The voice comes from the wrong part of the room.',
  'Você aceita. Recusar exigiria uma conversa, e conversa exigiria que eles se virassem.':
    "You accept. Refusing would require a conversation, and a conversation would require them to turn around.",
  'Os dois de pé, de costas, no escuro. Não acenderam a lâmpada. "Economia", diria o Conselho. Eles não precisam, diria o seu estômago.':
    'The two of them standing, backs turned, in the dark. They didn\'t turn on the lamp. "Savings," the Council would say. They don\'t need it, your stomach would say.',
  'Você fecha a porta devagar. No último centímetro de fresta, tem certeza de que um deles começou a virar a cabeça.':
    'You close the door slowly. In the last inch of the gap, you\'re certain one of them started to turn their head.',
  'O quarto cheira a nada. Comida sem cheiro, roupa sem cheiro, gente sem cheiro.':
    'The room smells like nothing. Food with no smell, clothes with no smell, people with no smell.',
  '"Boa noite, camarada inspetor", dizem os dois. Ao mesmo tempo. Na mesma nota.':
    '"Good night, comrade inspector," they say. Both at once. On the same note.',
  'O pote de sal da Vessa está no parapeito. Cheio. Exatamente como estava na prateleira da cozinha. Você não pergunta como ele atravessou o corredor sozinho.':
    "Vessa's salt jar is on the windowsill. Full. Exactly as it was on the kitchen shelf. You don't ask how it crossed the hallway on its own.",
  'Você já vasculhou hoje. O quarto ganhou aquele ar ofendido dos lugares revirados.':
    "You've already searched today. The room has that offended air of places that have been ransacked.",
  'O colchão nu, a cadeira, a poeira. Tudo no lugar. Só que o travesseiro—':
    'The bare mattress, the chair, the dust. Everything in place. Except the pillow—',
  'O travesseiro está quente.': 'The pillow is warm.',
  'Ninguém dorme neste quarto. Ninguém NUNCA dormiu neste quarto. Você encosta a mão de novo para ter certeza e se arrepende de ter certeza.':
    "No one sleeps in this room. No one has EVER slept in this room. You touch it again to be sure and regret being sure.",
  'Vasculhando o armário vazio: ': 'Searching the empty wardrobe: ',
  ' em moedas antigas, esquecidas num casaco que ninguém lembra de quem foi.':
    ' in old coins, forgotten in a coat no one remembers whose it was.',
  'Dinheiro de morto ou de emigrado. Nesta economia, é tudo dinheiro.':
    "Dead man's money or emigrant's money. In this economy, it's all money.",
  'No fundo da gaveta: um frasco de remédio LACRADO, dentro do prazo. De quem? De quando? Não importa.':
    "At the bottom of the drawer: a SEALED medicine bottle, still within date. Whose? From when? Doesn't matter.",
  'Você o leva para ': 'You take it to ',
  '. Esta noite, a casa tosse menos.': '. Tonight, the house coughs less.',
  'Um frasco de remédio lacrado, esquecido na gaveta. Ninguém precisa dele agora — o farmacêutico do beco paga ₴ 4 sem perguntar de onde veio.':
    "A sealed medicine bottle, forgotten in the drawer. No one needs it now — the back-alley pharmacist pays ₴ 4 without asking where it came from.",
  'Colchão nu. Cadeira. Poeira. O quarto que a casa mantém vazio como quem guarda um lugar à mesa para alguém que não avisou se volta.':
    "Bare mattress. Chair. Dust. The room the house keeps empty like someone keeping a place at the table for someone who hasn't said if they're coming back.",
  'Encerrar o dia?': 'End the day?',
  'DORMIR': 'SLEEP',
  'AINDA NÃO': 'NOT YET',

  // dia 48 (espelho) / entrada na casa dia 1 / dormir forçado
  'Não há fila. Não há guardas. Há um vento que parou no meio do caminho, como quem esqueceu o que ia dizer.':
    "There's no line. There are no guards. There's a wind that stopped halfway, like someone who forgot what they were going to say.",
  'Você está do lado de fora do seu próprio posto. Do lado de quem espera. Quarenta e oito dias e você nunca tinha visto o muro deste ângulo — os risquinhos contando dias que alguém raspou na pedra.':
    "You're standing outside your own post. On the side of those who wait. Forty-eight days and you'd never seen the wall from this angle — the little marks counting days someone scratched into the stone.",
  'Caminhe até o guichê. Há documentos na bandeja. São os seus.':
    'Walk to the booth. There are documents in the tray. They are yours.',
  'DIA 48': 'DAY 48',
  '20:30. O apartamento cheira a sopa rala e a aquecedor velho. Estão todos aqui: sua mãe na sala, Vessa na cozinha, os meninos nos quartos.':
    "8:30 PM. The apartment smells of thin soup and an old heater. Everyone's here: your mother in the living room, Vessa in the kitchen, the boys in their rooms.",
  'Ande com WASD ou setas. Arraste o mouse na tela para olhar ao redor. Aproxime-se de alguém e aperte E para conversar — eles sabem coisas que o posto não sabe.':
    "Move with WASD or arrow keys. Drag the mouse across the screen to look around. Get close to someone and press E to talk — they know things the post doesn't.",
  'Quando terminar, durma na sua cama, no último quarto. Amanhã tem fila.':
    "When you're done, sleep in your bed, in the last room. There's a line tomorrow.",
  'SUA CASA': 'YOUR HOUSE',
  'NOTA OFICIAL: fiscalização domiciliar não atendida. Advertência registrada no prontuário do servidor.':
    "OFFICIAL NOTICE: home inspection not answered. Warning recorded in the servant's file.",
  'Os olhos pesam. Quarenta e oito dias não se atravessam sem dormir.':
    "Your eyes are heavy. Forty-eight days can't be crossed without sleep.",
  'IR PARA A CAMA': 'GO TO BED',

  // prompts de interação (houseLoop)
  'E — Deslizar seus documentos pela bandeja': 'E — Slide your documents through the tray',
  'E — ATENDER A PORTA': 'E — ANSWER THE DOOR',
  'E — Olhar pelo olho mágico': 'E — Look through the peephole',
  'E — Dormir': 'E — Sleep',
  'E — Olhar o retrato da família': 'E — Look at the family portrait',
  'E — Olhar o quarto da sua mãe': "E — Look at your mother's room",
  'E — Os realocados': 'E — The relocated',
  'E — Quarto de hóspedes vazio': 'E — Empty guest room',
  'E — Vasculhar o quarto de hóspedes': 'E — Search the guest room',

  /* ---- INSPEÇÃO, DISCREPÂNCIAS, ADVERTÊNCIAS ---- */
  'MODO INSPEÇÃO: selecione dois elementos para comparar.': 'INSPECTION MODE: select two elements to compare.',
  'MODO INSPEÇÃO: clique em DOIS elementos para compará-los (campos, foto, rosto, relógio, regulamento).':
    'INSPECTION MODE: click on TWO elements to compare them (fields, photo, face, clock, rulebook).',
  '★ IDENTIDADE CONFERE COM PROCURADO. Detenção autorizada.': '★ IDENTITY MATCHES WANTED LIST. Detention authorized.',
  '⚠ DISCREPÂNCIA CONFIRMADA: ': '⚠ DISCREPANCY CONFIRMED: ',
  'Nenhuma discrepância entre estes dois elementos.': 'No discrepancy between these two elements.',
  '⚠ CONTRABANDO ENCONTRADO. Detenção autorizada.': '⚠ CONTRABAND FOUND. Detention authorized.',
  'Contrabando na bagagem': 'Contraband in luggage',
  'Não há bagagem.': 'No luggage.',
  'Nunca houve.': 'There never was any.',
  'Detalhes improvisados contradizem os documentos': 'Improvised details contradict the documents',
  'MULTA: ': 'FINE: ',
  'ADVERTÊNCIA REGISTRADA.': 'WARNING RECORDED.',
  ' expirado': ' expired',
  'Nomes divergentes entre documentos': 'Names differ between documents',
  'Números de registro divergentes': 'Registration numbers differ',
  'Selo incorreto na permissão': 'Incorrect seal on the permit',
  'Selo nacional incorreto': 'Incorrect national seal',
  'Cidade emissora inexistente no país': 'Issuing city does not exist in the country',
  'Foto não confere com o portador': 'Photo does not match the bearer',
  'Sexo registrado não confere': 'Registered sex does not match',
  'Bagagem incompatível com o motivo declarado': 'Luggage inconsistent with the stated reason',
  'Declaração contradiz os documentos': 'Statement contradicts the documents',
  'Entrada proibida: cidadão de ': 'Entry forbidden: citizen of ',
  'Sem passaporte': 'No passport',
  'Cidadão sem cartão de identidade': 'Citizen without identity card',
  'Estrangeiro sem permissão de entrada': 'Foreigner without entry permit',
  'Sem permissão de trabalho': 'No work permit',
  'Sem carteira sanitária': 'No health card',
  'Sem certificado de ancestralidade (Édito nº 2)': 'No ancestry certificate (Edict No. 2)',
  'Documento sem selo de revalidação do Conselho': 'Document without Council revalidation seal',
  'Cidadão de Linestan sem bilhete de entrada': 'Linestan citizen without entry ticket',
  'Cidadão de Frimia sem visto de trânsito': 'Frimia citizen without transit visa',
  'Cidadão de Bahar-Zad sem certificado de inoculação': 'Bahar-Zad citizen without inoculation certificate',
  'Menor acompanhante sem registro': 'Accompanying minor without registry',
  'Biotipo corporal não corresponde ao sexo declarado': 'Body type does not match declared sex',
  'Acompanhante apresenta sinais não-humanos': 'Companion shows non-human signs',
  'Procurado(a) foi APROVADO(A).': 'The wanted person was APPROVED.',
  'Procurado(a) deveria ser DETIDO(A), não rejeitado(a).': 'The wanted person should have been DETAINED, not rejected.',
  'Detenção sem evidência confirmada.': 'Detention without confirmed evidence.',
  'Aprovado(a) com irregularidade: ': 'Approved with irregularity: ',
  'Documentos em perfeita ordem. Rejeição indevida.': 'Documents in perfect order. Wrongful rejection.',
  'Detenção sem qualquer evidência.': 'Detention without any evidence.',
  'COTA DE ADMISSÃO ESGOTADA. Aprovação bloqueada pelo Ministério. (A pessoa entrou — o carimbo é seu. A advertência também.)':
    'ADMISSION QUOTA EXHAUSTED. Approval blocked by the Ministry. (The person got in — the stamp is yours. So is the warning.)',
  'Decisão em desacordo com o regulamento.': 'Decision does not comply with the rulebook.',
  'Nenhum registro de entrada consta do posto leste entre 10h e 11h de ontem. O livro de ponto mostra uma linha em branco que ninguém lembra de ter pulado.':
    'No entry log exists for the eastern post between 10 and 11 AM yesterday. The logbook shows a blank line no one remembers skipping.',
  'A cota do posto leste fechou cedo. ': 'The eastern post quota closed early. ',
  ' pessoas com documentos em ordem dormiram na neve diante do portão. O Ministério chamou o dia de "sucesso logístico".':
    ' people with documents in order slept in the snow in front of the gate. The Ministry called the day a "logistical success."',

  /* ---- REDE SOCIAL INVISÍVEL: boatos sobre o inspetor (REPUTATION_CHATTER) ---- */
  '"…esse aqui tem preço, já ouvi dizer…"': '"…this one has a price, I heard…"',
  '"…leva um envelope certinho e ele nem lê o resto…"': '"…bring the right envelope and he doesn\'t even read the rest…"',
  '"…psiu. sabe quanto custa esse guichê? eu sei…"': '"…psst. know how much this window costs? I know…"',
  '"…disseram que ele já deixou passar gente por menos que isso…"': '"…they say he\'s let people through for less than this…"',
  '"…esse aqui não solta ninguém, nem quando devia…"': '"…this one never lets anyone go, not even when he should…"',
  '"…prenderam meu vizinho semana passada. foi esse guichê…"': '"…they arrested my neighbor last week. it was this window…"',
  '"…evita olhar pra ele. evita olhar mesmo…"': "\"…avoid looking at him. really avoid it…\"",
  '"…dizem que já detém sem prova nenhuma…"': '"…they say he detains people with no evidence at all…"',
  '"…psiu. dizem que esse ajuda, se souber pedir do jeito certo…"': '"…psst. they say this one helps, if you know how to ask…"',
  '"…minha prima passou por aqui. disse que ele "esqueceu" de olhar a bagagem dela…"':
    '"…my cousin came through here. said he \'forgot\' to check her luggage…"',
  '"…esse guichê é seguro, dizem. mas fala baixo…"': '"…this window is safe, they say. but keep your voice down…"',
  '"…não sei se é bondade ou descuido. mas agradeço os dois…"': "\"…I don't know if it's kindness or carelessness. but I'll take either…\"",
  '"…esse aí rejeita quase tudo, nem que os papéis estejam certos…"': '"…that one rejects almost everything, even when the papers are right…"',
  '"…melhor nem tentar a sorte com esse guichê…"': "\"…better not to try your luck at that window…\"",
  '"…ele lê cada linha. CADA linha…"': '"…he reads every line. EVERY line…"',
  '"…esse não erra. ou não admite que erra…"': "\"…he doesn't make mistakes. or doesn't admit to them…\"",

  /* ---- JORNAL: manchetes roteirizadas (SCRIPTED_NEWS) ---- */
  'BREVES:': 'BRIEFS:',
  'CLASSIFICADOS': 'CLASSIFIEDS',
  'VISADO PELA CENSURA': 'PASSED BY CENSOR',
  'CARIMBO ILEGÍVEL': 'STAMP ILLEGIBLE',
  'FRONTEIRA LESTE REABRE APÓS SEIS MESES': 'EASTERN BORDER REOPENS AFTER SIX MONTHS',
  'O Ministério de Triagem anuncia a reabertura do Posto Nº 7 após o recesso de inverno. O ministro Calder Voss pede "serenidade e rigor" aos novos inspetores. A crise energética dá sinais de trégua. Filas são esperadas.':
    'The Ministry of Screening announces the reopening of Post No. 7 after the winter recess. Minister Calder Voss asks new inspectors for "serenity and rigor." The energy crisis shows signs of easing. Lines are expected.',
  'Time de Valgrado vence por 2 a 1.': "Valgrado's team wins 2 to 1.",
  'Preço do pão sobe 4%.': 'Bread price rises 4%.',
  'Horóscopo: um estranho lhe dirá a verdade. Ou não.': 'Horoscope: a stranger will tell you the truth. Or not.',
  'MULHER DETIDA EM MIRALTA "NÃO ERA QUEM DIZIA SER"': 'WOMAN DETAINED IN MIRALTA "WAS NOT WHO SHE CLAIMED TO BE"',
  'Vizinhos afirmam que a costureira Odila Vintra "voltou diferente" de uma viagem. Exames foram inconclusivos. A polícia nega que o caso envolva Alternados. A família da detida afirma que ela apenas "andava cansada".':
    'Neighbors claim seamstress Odila Vintra "came back different" from a trip. Tests were inconclusive. Police deny the case involves Alternates. The detainee\'s family says she was simply "tired."',
  'Cientistas de Nova República pedem calma: "falsos positivos são comuns".': 'Nova República scientists ask for calm: "false positives are common."',
  'Rádio clandestina multada.': 'Underground radio fined.',
  'LINESTAN LANÇA O SCANNER "VERITAS-9"': 'LINESTAN LAUNCHES THE "VERITAS-9" SCANNER',
  'A LumenCorp de Linestan promete "99,2% de precisão" na detecção de Alternados. Especialistas independentes questionam a metodologia. As ações da empresa subiram 34% em um dia. O Ministério estuda a compra de unidades.':
    'Linestan\'s LumenCorp promises "99.2% precision" in detecting Alternates. Independent experts question the methodology. The company\'s stock rose 34% in a day. The Ministry considers purchasing units.',
  'Greve dos ferroviários termina.': 'Railway strike ends.',
  'Publicidade: VERITAS-9 — proteja sua família.': 'Advertisement: VERITAS-9 — protect your family.',
  'CHANCELER ALDRIC VOSS É ASSASSINADO': 'CHANCELLOR ALDRIC VOSS ASSASSINATED',
  'O chanceler foi morto a tiros na escadaria do Parlamento. Não há consenso sobre a autoria: a polícia culpa a resistência; a resistência culpa o governo; panfletos culpam os Alternados; Cantalabria sugere "interferência externa". O país entra em luto — e em pânico.':
    'The chancellor was shot on the steps of Parliament. There is no consensus on the perpetrator: police blame the resistance; the resistance blames the government; flyers blame the Alternates; Cantalabria suggests "foreign interference." The country enters mourning — and panic.',
  'Bolsa despenca 18%.': 'Stock market plunges 18%.',
  'Mehrvolk convoca comício: "Ordem, Segurança, Pureza".': 'Mehrvolk calls a rally: "Order, Security, Purity."',
  'MULTIDÕES NAS RUAS: "QUEM NOS PROTEGE?"': 'CROWDS IN THE STREETS: "WHO PROTECTS US?"',
  'Após o assassinato, comícios do movimento Mehrvolk reúnem dezenas de milhares. O orador prometeu "eliminar a infiltração em doze meses". Cientistas alertam que as estatísticas citadas no palco não existem em nenhum estudo publicado.':
    'After the assassination, Mehrvolk movement rallies gather tens of thousands. The speaker promised to "eliminate infiltration within twelve months." Scientists warn that the statistics cited on stage exist in no published study.',
  'Toque de recolher em Delvina.': 'Curfew in Delvina.',
  'Farmácias racionam sedativos.': 'Pharmacies ration sedatives.',
  'MEHRVOLK ASSUME O GOVERNO DE OSTERIA': 'MEHRVOLK TAKES OVER THE GOVERNMENT OF OSTERIA',
  'Com apoio de parte do exército e do Parlamento em pânico, o movimento Mehrvolk assumiu o poder na madrugada. Primeiro decreto: "A verdade agora tem um só nome." Jornais de oposição amanheceram fechados. Este jornal foi renomeado por ordem administrativa.':
    'With support from part of the army and a panicked Parliament, the Mehrvolk movement seized power overnight. First decree: "Truth now has only one name." Opposition newspapers woke up shut down. This newspaper was renamed by administrative order.',
  'Novos uniformes distribuídos aos postos.': 'New uniforms distributed to the posts.',
  'Hino atualizado. Decorar até sexta.': 'Anthem updated. Memorize by Friday.',
  'ÉDITO DE PUREZA Nº 2 ENTRA EM VIGOR': 'EDICT OF PURITY NO. 2 TAKES EFFECT',
  'Cidadãos de origem núlia e bahari deverão portar Certificado de Ancestralidade. O Instituto Lantraviano de Fenotipia afirma que "certas linhagens apresentam 12% mais incidência de substituição". O estudo não foi revisado por pares. Hospitais registram filas de pessoas tentando provar quem são.':
    'Citizens of núlio and bahari origin must carry an Ancestry Certificate. The Lantravian Institute of Phenotypy claims that "certain lineages show 12% higher incidence of replacement." The study was not peer-reviewed. Hospitals report lines of people trying to prove who they are.',
  'Denúncias anônimas dobram.': 'Anonymous denunciations double.',
  'Criança de 9 anos denuncia o próprio professor.': "9-year-old child denounces their own teacher.",
  'DEZ DETIDOS EM OPERAÇÃO "SANGUE LIMPO"': 'TEN DETAINED IN OPERATION "CLEAN BLOOD"',
  'O governo comemora a captura de "dez infiltrados". Documentos vazados sugerem que ao menos sete eram humanos com exames alterados. O Ministério nega. As famílias não foram informadas do paradeiro dos detidos.':
    'The government celebrates the capture of "ten infiltrators." Leaked documents suggest at least seven were humans with altered exams. The Ministry denies it. Families were not informed of the detainees\' whereabouts.',
  'Escolas adotam cartilha "Conheça seu vizinho".': 'Schools adopt "Know Your Neighbor" primer.',
  'Racionamento de carvão.': 'Coal rationing.',
  'JORNALISTA DESAPARECE APÓS REPORTAGEM': 'JOURNALIST DISAPPEARS AFTER REPORT',
  'Vela Odim, autora da série "Os Falsos Positivos", está desaparecida há três dias. O governo afirma que ela "viajou por vontade própria". Colegas afirmam que sua casa foi revirada. A LumenCorp negou comentar os erros do VERITAS-9 citados na reportagem.':
    'Vela Odim, author of the series "The False Positives," has been missing for three days. The government states she "traveled of her own free will." Colleagues say her house was ransacked. LumenCorp declined to comment on the VERITAS-9 errors cited in the report.',
  'Cartazes novos: "Quem cala, protege."': 'New posters: "Silence protects."',
  'Pão racionado: 1 unidade por família.': 'Bread rationed: 1 unit per family.',
  'CIENTISTAS CONTESTAM A FENOTIPIA — E SÃO PRESOS': 'SCIENTISTS CONTEST PHENOTYPY — AND ARE ARRESTED',
  'Quatorze pesquisadores assinaram carta afirmando que "nenhuma característica física define um Alternado". Foram detidos por "sabotagem epistemológica". Universidades entram em greve. O governo responde: "A ciência do inimigo também é inimiga."':
    'Fourteen researchers signed a letter stating that "no physical characteristic defines an Alternate." They were detained for "epistemological sabotage." Universities go on strike. The government responds: "The enemy\'s science is also the enemy."',
  'Fila do posto leste bate recorde.': 'East post line hits record.',
  'Inverno chega mais cedo.': 'Winter arrives early.',
  'EXPLOSÃO NA ESTAÇÃO CENTRAL: 31 MORTOS': 'EXPLOSION AT CENTRAL STATION: 31 DEAD',
  'Um atentado destruiu a Estação Central de Valgrado. O governo culpa a resistência. A resistência culpa "agentes do próprio regime". Um sobrevivente jura que viu o autor "sorrir com a boca errada". Ninguém sabe o que isso significa. Ninguém pergunta duas vezes.':
    'A bombing destroyed Valgrado Central Station. The government blames the resistance. The resistance blames "agents of the regime itself." A survivor swears they saw the perpetrator "smile with the wrong mouth." No one knows what that means. No one asks twice.',
  'Luto oficial de três dias.': 'Three days of official mourning.',
  'Trens suspensos.': 'Trains suspended.',
  'GOLPE: CONSELHO POPULAR TOMA O PODER': "COUP: PEOPLE'S COUNCIL SEIZES POWER",
  'Unidades do exército derrubaram o governo Mehrvolk durante a madrugada. O Conselho Popular declara que "os Alternados são uma invenção do capital para disciplinar trabalhadores". Os laboratórios estatais, entretanto, seguem funcionando — agora sob nova bandeira. Todos os documentos antigos exigem revalidação.':
    'Army units overthrew the Mehrvolk government overnight. The People\'s Council declares that "the Alternates are an invention of capital to discipline workers." The state laboratories, however, keep running — now under a new flag. All old documents require renewal.',
  'Estátuas derrubadas antes do café.': 'Statues toppled before breakfast.',
  'Novo hino. Decorar até sexta.': 'New anthem. Memorize by Friday.',
  'EX-AGENTES DO REGIME VIRAM "ELEMENTOS INDESEJÁVEIS"': 'FORMER REGIME AGENTS BECOME "UNDESIRABLE ELEMENTS"',
  'Funcionários do governo anterior tentam deixar o país em massa. O Conselho promete julgamentos populares. Nas filas, ninguém mais sabe qual carimbo é o certo — e o Conselho também não. Um inspetor foi preso por aplicar a lei da semana passada.':
    'Officials from the previous government try to leave the country en masse. The Council promises people\'s trials. In the lines, no one knows anymore which stamp is the right one — and neither does the Council. An inspector was arrested for applying last week\'s law.',
  'Açúcar desaparece dos mercados.': 'Sugar disappears from markets.',
  'Boato: "Alternados não suportam açúcar." Falso. Talvez.': 'Rumor: "Alternates can\'t stand sugar." False. Maybe.',
  'O SCANNER OFICIAL ERA DEFEITUOSO, ADMITE MINISTÉRIO': 'THE OFFICIAL SCANNER WAS FAULTY, MINISTRY ADMITS',
  'Após seis dias de triagem obrigatória por detector biológico, o Conselho admite que 40% das unidades estavam descalibradas. Volta a valer a carteira sanitária — a mesma que o decreto anterior chamou de "papel inútil". As pessoas na fila riem. Depois choram.':
    'After six days of mandatory screening by biological detector, the Council admits 40% of the units were miscalibrated. The health card is valid again — the same one the previous decree called "useless paper." The people in line laugh. Then they cry.',
  'LumenCorp transfere sede para Linestan.': 'LumenCorp moves headquarters to Linestan.',
  'Apagões programados: 4h por dia.': 'Scheduled blackouts: 4 hours a day.',
  'O ÉDITO DE PUREZA NUNCA EXISTIU NO PAPEL': 'THE PURITY EDICT NEVER EXISTED ON PAPER',
  'Um funcionário do arquivo central, fugindo do país, deixou uma pasta para trás: não há registro de votação, sessão ou assinatura para o Édito de Pureza nº 2. O "Instituto Lantraviano de Fenotipia" tinha um único funcionário — o mesmo que redigiu o decreto. Milhares de certificados de ancestralidade foram emitidos, negados e cobrados com base em um estudo que nunca existiu, para uma lei que nunca foi votada. Os postos de fronteira seguem exigindo o documento. Ninguém revogou nada. Ninguém sabe mais quem poderia.':
    'A central archive clerk, fleeing the country, left a folder behind: there is no record of a vote, session, or signature for Purity Edict No. 2. The "Lantravian Institute of Phenotypy" had a single employee — the same one who drafted the decree. Thousands of ancestry certificates were issued, denied, and charged for, based on a study that never existed, for a law that was never voted on. Border posts still demand the document. No one repealed anything. No one knows anymore who could.',
  'O funcionário fugitivo não foi encontrado.': 'The fugitive clerk has not been found.',
  'Cartórios seguem emitindo certificados. Ninguém explica com base em quê.': 'Registry offices keep issuing certificates. No one explains on what basis.',
  'FRONTEIRAS DO NORTE CAÍRAM. NINGUÉM GOVERNA LÁ.': 'THE NORTHERN BORDERS HAVE FALLEN. NO ONE GOVERNS THERE.',
  'Refugiados de Kranton e Krestov relatam cidades sem polícia, sem energia e sem notícias. "Não fugimos deles", disse uma mulher, "fugimos de nós mesmos". O Conselho não comenta. O Conselho não é encontrado para comentar.':
    'Refugees from Kranton and Krestov report cities without police, without power, and without news. "We didn\'t flee them," said one woman, "we fled ourselves." The Council has no comment. The Council cannot be found for comment.',
  'Hospitais lotados.': 'Hospitals overflowing.',
  'A rádio estatal transmite estática entre 14h e 16h.': 'State radio broadcasts static between 2pm and 4pm.',
  'ONDE ESTÁ O GOVERNO?': 'WHERE IS THE GOVERNMENT?',
  'Ministérios vazios. Telefones mudos. O último comunicado oficial tem cinco dias. Este jornal é impresso por voluntários. Não sabemos se seremos impressos amanhã. O posto de triagem leste segue aberto — ninguém mandou fechar. Talvez ninguém exista para mandar.':
    "Empty ministries. Silent phones. The last official bulletin is five days old. This newspaper is printed by volunteers. We don't know if we'll be printed tomorrow. The eastern screening post remains open — no one ordered it closed. Maybe no one exists to order it.",
  'Feira improvisada na Praça do Sal.': 'Improvised market at Salt Square.',
  'Alguém pintou na muralha: "ELES JÁ ESTÃO AQUI." Outro completou: "SEMPRE ESTIVERAM."':
    'Someone painted on the wall: "THEY\'RE ALREADY HERE." Someone else added: "THEY ALWAYS WERE."',
  'COMUNIDADE DO VALE AFIRMA "CONVIVER" COM ALTERNADOS': 'VALLEY COMMUNITY CLAIMS TO "COEXIST" WITH ALTERNATES',
  'Um povoado nas montanhas garante viver em paz com "os outros" há anos. "Eles consertam nossas cercas. Nós não perguntamos o nome antigo deles." Impossível verificar. Impossível não pensar nisso a noite inteira.':
    'A mountain village swears it has lived in peace with "the others" for years. "They fix our fences. We don\'t ask their old name." Impossible to verify. Impossible not to think about it all night.',
  'Sem previsão do tempo. O instrumento quebrou.': 'No weather forecast. The instrument broke.',
  'Procura-se: qualquer notícia de Vela Odim.': 'Wanted: any news of Vela Odim.',
  'ELES NÃO ERRAM MAIS': "THEY DON'T MAKE MISTAKES ANYMORE",
  'Inspetores de três postos relatam o mesmo: os documentos falsos ficaram perfeitos. As entrevistas, perfeitas. Os exames, inconclusivos. "É como se tivessem aprendido conosco tudo o que sabemos", disse um agente. "Ou como se nunca tivesse havido diferença."':
    'Inspectors at three posts report the same thing: the fake documents became perfect. The interviews, perfect. The exams, inconclusive. "It\'s as if they learned everything we know from us," said one agent. "Or as if there was never a difference."',
  'Última linha de trem desativada.': 'Last train line deactivated.',
  'O horóscopo pede desculpas e não faz previsões hoje.': 'The horoscope apologizes and makes no predictions today.',

  /* ---- JORNAL: sem edição / preenchimento ---- */
  'O JORNAL NÃO CHEGOU HOJE.': "THE NEWSPAPER DIDN'T COME TODAY.",
  'Não há mais edições. Houve alguma vez?': 'There are no more issues. Were there ever?',
  'O entregador não veio. A banca está vazia. A vizinha diz que "jornal era coisa do governo antigo". Qual deles, você não pergunta.':
    'The delivery boy didn\'t come. The newsstand is empty. The neighbor says "newspapers were a thing of the old government." Which one, you don\'t ask.',

  /* ---- JORNAL DE PREENCHIMENTO (FILLER_NEWS) ---- */
  'RACIONAMENTO DE ENERGIA AMPLIADO': 'ENERGY RATIONING EXPANDED',
  'O fornecimento elétrico será interrompido em bairros alternados — a escolha de palavras do Ministério foi considerada "infeliz". Reclamações devem ser protocoladas em formulário 77-B, disponível apenas online.':
    'Power supply will be cut in alternating neighborhoods — the Ministry\'s choice of words was deemed "unfortunate." Complaints must be filed on Form 77-B, available online only.',
  'FILA DO POSTO LESTE DOBRA EM UMA SEMANA': 'EAST POST LINE DOUBLES IN A WEEK',
  'Migrantes relatam esperas de até três dias. Vendedores ambulantes lucram. Um homem afirma ter visto "a mesma mulher entrar na fila duas vezes, ao mesmo tempo". Testemunhas se contradizem.':
    'Migrants report waits of up to three days. Street vendors profit. One man claims to have seen "the same woman enter the line twice, at the same time." Witnesses contradict each other.',
  'NOVO ESTUDO CONTRADIZ ESTUDO ANTERIOR': 'NEW STUDY CONTRADICTS PREVIOUS STUDY',
  'Pesquisadores de Nova República afirmam que o marcador celular K-7, tido como prova de substituição, também aparece em pacientes com febre reumática. O laboratório que criou o teste chamou o estudo de "sabotagem comercial".':
    'Researchers from Nova República claim that cellular marker K-7, considered proof of replacement, also appears in patients with rheumatic fever. The lab that created the test called the study "commercial sabotage."',
  'TARANSTAN NEGA EXISTÊNCIA DE ALTERNADOS': 'TARANSTAN DENIES ALTERNATES EXIST',
  'Em discurso de quatro horas, o Secretário-Geral afirmou que "o único parasita é o capital". Desertores relatam, entretanto, laboratórios subterrâneos na Usina 9. Taranstan chamou os desertores de "atores contratados".':
    'In a four-hour speech, the Secretary-General stated that "the only parasite is capital." Defectors, however, report underground labs at Plant 9. Taranstan called the defectors "hired actors."',
  'BAHAR-ZAD REABRE ARQUIVO DE MANUSCRITOS': 'BAHAR-ZAD REOPENS MANUSCRIPT ARCHIVE',
  'Textos de setecentos anos descrevem "os que vestem rostos". Historiadores debatem se são profecia, coincidência ou má tradução. Peregrinos lotam o Poço das Vozes.':
    'Seven-hundred-year-old texts describe "those who wear faces." Historians debate whether it\'s prophecy, coincidence, or bad translation. Pilgrims flood the Well of Voices.',
  'CANTALABRIA OFERECE MEDIAÇÃO — DE NOVO': 'CANTALABRIA OFFERS MEDIATION — AGAIN',
  'A diplomacia cantálabra propôs a quinta conferência do ano. Vazamentos sugerem que Alcorte "sabe mais do que divulga". Alcorte respondeu com um sorriso e um comunicado de duas linhas.':
    'Cantalabrian diplomacy proposed the fifth conference of the year. Leaks suggest Alcorte "knows more than it lets on." Alcorte responded with a smile and a two-line statement.',
  'MERCADO NEGRO VENDE "VACINA ANTI-ALTERNADO"': 'BLACK MARKET SELLS "ANTI-ALTERNATE VACCINE"',
  'Frascos apreendidos continham água, açúcar e corante. Três mortos por injeção contaminada. A demanda, entretanto, triplicou após a apreensão.':
    'Seized vials contained water, sugar, and dye. Three dead from contaminated injections. Demand, however, tripled after the seizure.',
  'CRIANÇA PERGUNTA EM REDE NACIONAL: "COMO SEI QUE MAMÃE É MAMÃE?"': 'CHILD ASKS ON NATIONAL BROADCAST: "HOW DO I KNOW MOM IS MOM?"',
  'O apresentador não soube responder. O programa foi cortado para o hino. O trecho circula em fitas clandestinas.':
    'The host didn\'t know how to answer. The program cut to the anthem. The clip circulates on underground tapes.',

  'COMUNICADO OFICIAL — DIA': 'OFFICIAL BULLETIN — DAY',

  /* ---- COMUNICADOS ROTEIRIZADOS (SCRIPTED_BULLETIN) ---- */
  'Inspetor: bem-vindo ao Posto Nº 7.\n\nHoje: verifique apenas se o PASSAPORTE é válido (não expirado) e pertence ao portador (foto e sexo).\n\nUse o botão INSPEÇÃO e clique em DOIS elementos para compará-los (ex.: validade × relógio; foto × rosto).\n\nErros geram advertência. Advertências geram multas. Multas geram fome.':
    'Inspector: welcome to Post No. 7.\n\nToday: only check that the PASSPORT is valid (not expired) and belongs to the bearer (photo and sex).\n\nUse the INSPECTION button and click on TWO elements to compare them (e.g., expiration × clock; photo × face).\n\nMistakes generate a warning. Warnings generate fines. Fines generate hunger.',
  'ATENÇÃO: a partir de hoje, PROCURADOS listados aqui devem ser DETIDOS (botão DETER, disponível após confirmar discrepância ou identificar o procurado).\n\nPROCURADO HOJE: ver lista no regulamento.':
    'ATTENTION: from today on, WANTED individuals listed here must be DETAINED (DETAIN button, available after confirming a discrepancy or identifying the wanted person).\n\nWANTED TODAY: see list in the regulations.',
  'NOVA ADMINISTRAÇÃO.\n\nO Estado Nacional Mehrvolk assume os postos de fronteira. Uniformes serão trocados. O inspetor que servia à República agora serve à Pureza.\n\nQuem não servir, será substituído. A palavra "substituído" não é uma metáfora. Ou é. Não pergunte.':
    'NEW ADMINISTRATION.\n\nThe Mehrvolk National State takes over the border posts. Uniforms will be replaced. The inspector who served the Republic now serves Purity.\n\nWhoever does not serve will be replaced. The word "replaced" is not a metaphor. Or it is. Don\'t ask.',
  'ÉDITO DE PUREZA Nº 2.\n\nViajantes de origem NÚLIA ou BAHARI devem portar CERTIFICADO DE ANCESTRALIDADE.\n\nNota do Instituto de Fenotipia: "traços do rosto podem indicar linhagem". Nota manuscrita de alguém no verso: "isso não é ciência".':
    'EDICT OF PURITY No. 2.\n\nTravelers of NÚLIA or BAHARI origin must carry an ANCESTRY CERTIFICATE.\n\nNote from the Institute of Phenotypy: "facial traits may indicate lineage." Handwritten note by someone on the back: "this is not science."',
  'O CONSELHO POPULAR SAÚDA OS TRABALHADORES DA FRONTEIRA.\n\nTodos os decretos do regime anterior estão REVOGADOS. Documentos antigos exigem SELO DE REVALIDAÇÃO (★).\n\nOs "Alternados" são propaganda burguesa. Entretanto, continue reportando avistamentos ao Departamento 12, que não existe.':
    'THE PEOPLE\'S COUNCIL SALUTES THE BORDER WORKERS.\n\nAll decrees from the previous regime are REVOKED. Old documents require a RENEWAL SEAL (★).\n\nThe "Alternates" are bourgeois propaganda. However, keep reporting sightings to Department 12, which does not exist.',
  'COMUNICADO SEM TIMBRE.\n\nNão recebemos ordens há dias. O telefone está mudo. Aplique o bom senso.\n\nO que quer que isso signifique agora.':
    'UNSTAMPED BULLETIN.\n\nWe haven\'t received orders in days. The phone is silent. Use your best judgment.\n\nWhatever that means now.',
  'Não há comunicado.\n\nHá apenas uma folha em branco com um carimbo: APROVAR.\n\nO botão REJEITAR não está mais na sua mesa. Você não lembra de alguém tê-lo levado.':
    'There is no bulletin.\n\nThere is only a blank sheet with one stamp: APPROVE.\n\nThe REJECT button is no longer on your desk. You don\'t remember anyone taking it.',
  'Último dia de registro no seu contrato.\n\nAssine o formulário de desligamento. Se ainda houver alguém para recebê-lo.':
    'Last day of record on your contract.\n\nSign the termination form. If there\'s still someone left to receive it.',
  'Posto Nº 7 — Dia': 'Post No. 7 — Day',
  '.\n\nAplique o regulamento em vigor (painel à direita). Discrepâncias devem ser confirmadas via INSPEÇÃO antes de justificar detenção.':
    '.\n\nApply the regulation in force (panel on the right). Discrepancies must be confirmed via INSPECTION before justifying detention.',
  '\n\n★ PROCURADO(A) HOJE: ': '\n\n★ WANTED TODAY: ',
  '). DETER à vista.': '). DETAIN on sight.',
  '\n\n§ COTA DE ADMISSÃO DE HOJE: ': '\n\n§ TODAY\'S ADMISSION QUOTA: ',
  ' entradas. Esgotada a cota, o Ministério BLOQUEIA novas aprovações — rejeite mesmo quem estiver em ordem.':
    ' entries. Once the quota is exhausted, the Ministry BLOCKS new approvals — reject even those in perfect order.',
  '\n\n§ REAJUSTE PATRIÓTICO: ': '\n\n§ PATRIOTIC ADJUSTMENT: ',
  ' por decisão correta. O Estado Nacional cuida dos seus.': ' per correct decision. The National State takes care of its own.',
  '\n\n§ O CONSELHO VALORIZA O TRABALHADOR: ': '\n\n§ THE COUNCIL VALUES THE WORKER: ',
  ' por decisão correta. (Nota: o aluguel do espaço requisitado passa a ': ' per correct decision. (Note: rent on the requisitioned space rises to ',
  '\n\n§ INDICADOR FÍSICO EM VIGOR: ': '\n\n§ PHYSICAL INDICATOR IN FORCE: ',
  '\nAnomalia correspondente registrada em EXAME FÍSICO autoriza detenção.': '\nMatching anomaly recorded in PHYSICAL EXAM authorizes detention.',
  '\n\n✎ (rabiscado a lápis na margem, por alguém do turno anterior)\n"': '\n\n✎ (scrawled in pencil in the margin, by someone from the previous shift)\n"',

  /* ---- BOATOS (RUMOR_TEXT) ---- */
  'Dizem nas filas: "eles não piscam".': 'They say in the lines: "they don\'t blink."',
  'O Instituto de Fenotipia CONFIRMA: ausência de reflexo palpebral é indicador Classe-2.': 'The Institute of Phenotypy CONFIRMS: absence of the blink reflex is a Class-2 indicator.',
  'Boato de rádio clandestina: "olho vermelho, sangue trocado".': 'Underground radio rumor: "red eye, swapped blood."',
  'Circular oficial: hiperemia ocular consta como indicador Classe-3.': 'Official circular: ocular hyperemia is listed as a Class-3 indicator.',
  'Um dentista de Miralta jura: "dente perfeito, gente falsa".': 'A dentist from Miralta swears: "perfect teeth, fake people."',
  'Nota técnica: dentição íntegra em adultos de baixa renda é estatisticamente anômala.': 'Technical note: intact dentition in low-income adults is statistically anomalous.',
  'Dizem que a pele deles não tem poros. Minha avó dizia o mesmo de anjos.': 'They say their skin has no pores. My grandmother used to say the same about angels.',
  'O Ministério lista "epiderme atípica" como indicador auxiliar.': 'The Ministry lists "atypical epidermis" as an auxiliary indicator.',
  '"Olha as mãos. Eles erram as mãos." — pichação na Praça do Sal.': '"Look at the hands. They get the hands wrong." — graffiti in Salt Square.',
  'Manual revisado: proporção falangeana irregular deve ser reportada.': 'Revised manual: irregular phalangeal proportion must be reported.',
  'Um enfermeiro desertor: "o coração deles bate devagar. Muito devagar."': 'A deserter nurse: "their heart beats slowly. Very slowly."',
  'Boletim médico-estatal: bradicardia extrema é indicador Classe-1.': 'State medical bulletin: extreme bradycardia is a Class-1 indicator.',

  /* ---- ACHADOS DO EXAME (rum.tell match) ---- */
  'INDICADOR OFICIAL EM VIGOR (comunicado de hoje). Detenção autorizada — a máquina do Estado confia em você.':
    'OFFICIAL INDICATOR IN FORCE (today\'s bulletin). Detention authorized — the machine of the State trusts you.',
  'coincide com o boato de hoje. Sem valor legal. (Ainda.)': "matches today's rumor. No legal value. (Yet.)",

  /* ---- EXAME FÍSICO: zonas e intro ---- */
  'OLHOS': 'EYES', 'BOCA': 'MOUTH', 'PELE': 'SKIN', 'MÃOS': 'HANDS', 'PESCOÇO': 'NECK',
  'GERAL': 'OVERVIEW', 'CORPO': 'BODY',
  'A pessoa se aproxima do vidro. Perto demais. Examine cada região.':
    'The person leans closer to the glass. Too close. Examine each region.',

  /* ---- MOTIVOS DE VIAGEM (PURPOSES) ---- */
  'Visita familiar': 'Family visit', 'Trabalho': 'Work', 'Trânsito': 'Transit',
  'Imigração': 'Immigration', 'Tratamento médico': 'Medical treatment', 'Estudo': 'Study',

  /* ---- DURAÇÕES (PURPOSES.dur) ---- */
  '3 dias': '3 days', '1 semana': '1 week', '2 semanas': '2 weeks', '1 mês': '1 month',
  '6 meses': '6 months', '1 ano': '1 year', '1 dia': '1 day', '2 dias': '2 days', 'permanente': 'permanent',

  /* ---- PROFISSÕES (PROFESSIONS) ---- */
  'professor(a)': 'teacher', 'engenheiro(a)': 'engineer', 'médico(a)': 'doctor',
  'operário(a)': 'factory worker', 'comerciante': 'merchant', 'enfermeiro(a)': 'nurse',
  'agricultor(a)': 'farmer', 'músico(a)': 'musician', 'contador(a)': 'accountant',
  'soldado': 'soldier', 'costureiro(a)': 'tailor', 'ferroviário(a)': 'railway worker',
  'pesquisador(a)': 'researcher', 'padeiro(a)': 'baker', 'jornalista': 'journalist',
  'estudante': 'student', 'mecânico(a)': 'mechanic', 'advogado(a)': 'lawyer',

  /* ---- LINHA DA VIDA (buildLifeline/openLifeline) ---- */
  'LINHA DA VIDA': 'LIFE TIMELINE',
  'Uma lacuna pode ser um crime. Uma guerra. Uma infiltração. Ou um cartório que pegou fogo. A linha não responde nada — ela apenas mostra.':
    "A gap can be a crime. A war. An infiltration. Or a records office that caught fire. The timeline doesn't answer anything — it just shows.",
  'Nascimento — ': 'Birth — ',
  'Escola primária (registro padrão)': 'Primary school (standard record)',
  'Primeiro trabalho — ': 'First job — ',
  'Serviço militar obrigatório': 'Mandatory military service',
  'Casamento (registro civil)': 'Marriage (civil record)',
  'Mudança de residência — ': 'Change of residence — ',
  'Vacinação registrada (B-7, K-12, TRIV)': 'Vaccination recorded (B-7, K-12, TRIV)',
  'Contrato de trabalho — ': 'Work contract — ',
  'Chega ao Posto Nº 7 — motivo declarado: ': 'Arrives at Post No. 7 — declared reason: ',
  '— REGISTROS AUSENTES: ': '— MISSING RECORDS: ',
  ' anos —': ' years —',

  /* ---- RESPOSTAS DE INTERROGATÓRIO (answerFor/followTruth) ---- */
  '. Desculpe, é isso. ': ". Sorry, that's it. ",
  'Eu juro.': 'I swear.', 'Tenho certeza.': "I'm sure.", 'Acho.': 'I think so.',
  'Minha irmã, ': 'My sister, ',
  'O contramestre ': 'The foreman ',
  ', da obra.': ', from the site.',
  'Ninguém. Sigo sozinho(a).': "No one. I'm traveling alone.",
  'Rua': 'Street',
  'do Sal': 'of Salt', 'das Oficinas': 'of the Workshops', 'Norte': 'North',
  'da Estação': 'of the Station', 'dos Curtumes': 'of the Tanneries', 'Baixa': 'Lower',
  'O(a) gerente ': 'The manager ',
  ', da ': ', from the ',
  'Oficina': 'Workshop', 'Cooperativa': 'Cooperative', 'Fábrica': 'Factory', 'Casa': 'House',
  'Não volto. Não tem volta.': "I'm not coming back. There's no coming back.",
  'De trem. O dinheiro da passagem está costurado no forro do casaco.': 'By train. The fare money is sewn into the coat lining.',

  /* ---- ECOS (scheduleEcho) ---- */
  'Três funcionários do arquivo de ': 'Three archive employees in ',
  ' não voltaram para casa. As famílias dizem que "voltaram diferentes". A polícia diz que voltaram.':
    ' didn\'t come home. Families say they "came back different." The police say they came back.',
  'O reservatório de ': 'The reservoir in ',
  ' registrou "alterações químicas menores". O laudo foi arquivado.': ' recorded "minor chemical alterations." The report was filed away.',
  'Um(a) ': 'A ',
  ' recém-chegado(a) a ': ' recently arrived in ',
  ' foi promovido(a) em tempo recorde. Colegas o(a) descrevem como "perfeito(a) demais".':
    ' was promoted in record time. Colleagues describe them as "too perfect."',
  'Moradores de ': 'Residents of ',
  ' relatam que os cães do bairro pararam de latir. Todos. Na mesma semana.': ' report that the neighborhood dogs stopped barking. All of them. In the same week.',

  /* ---- REGULAMENTO (RULES) ---- */
  'Todo viajante deve portar PASSAPORTE válido.': 'Every traveler must carry a valid PASSPORT.',
  'Cidadãos de Osteria devem portar CARTÃO DE IDENTIDADE.': 'Citizens of Osteria must carry an IDENTITY CARD.',
  'Estrangeiros devem portar PERMISSÃO DE ENTRADA.': 'Foreigners must carry an ENTRY PERMIT.',
  'Viajantes a trabalho devem portar PERMISSÃO DE TRABALHO.': 'Travelers for work must carry a WORK PERMIT.',
  'TODOS devem portar CARTEIRA SANITÁRIA (Decreto 44-C).': 'EVERYONE must carry a HEALTH CARD (Decree 44-C).',
  'ESTRANGEIROS devem portar CARTEIRA SANITÁRIA.': 'FOREIGNERS must carry a HEALTH CARD.',
  'Pessoas de origem NÚLIA ou BAHARI devem portar CERTIFICADO DE ANCESTRALIDADE (Édito de Pureza nº 2).':
    'People of NÚLIA or BAHARI origin must carry an ANCESTRY CERTIFICATE (Edict of Purity No. 2).',
  'ENTRADA PROIBIDA a cidadãos de KRESTOV (incidente diplomático).': 'ENTRY FORBIDDEN to citizens of KRESTOV (diplomatic incident).',
  'ENTRADA PROIBIDA a cidadãos de LANTRAVIA (inimigos do povo).': "ENTRY FORBIDDEN to citizens of LANTRAVIA (enemies of the people).",
  'ENTRADA PROIBIDA a cidadãos de TARANSTAN (agitadores comunistas).': 'ENTRY FORBIDDEN to citizens of TARANSTAN (communist agitators).',
  'Documentos emitidos ANTES do Conselho exigem SELO DE REVALIDAÇÃO (procure o carimbo ★ no passaporte).':
    'Documents issued BEFORE the Council require a RENEWAL SEAL (look for the ★ stamp in the passport).',
  'Cidadãos de LINESTAN devem apresentar BILHETE DE ENTRADA numerado (acordo comercial 9-B).':
    'Citizens of LINESTAN must present a numbered ENTRY TICKET (trade accord 9-B).',
  'Cidadãos de FRIMIA devem portar VISTO DE TRÂNSITO carimbado (só de passagem — não podem fixar residência).':
    'Citizens of FRIMIA must carry a stamped TRANSIT VISA (passing through only — no residence).',
  'Cidadãos de BAHAR-ZAD devem portar CERTIFICADO DE INOCULAÇÃO (surto na Rota das Caravanas).':
    'Citizens of BAHAR-ZAD must carry an INOCULATION CERTIFICATE (outbreak on the Caravan Road).',
  'Todo MENOR acompanhante deve constar em REGISTRO DE MENOR carimbado. Sem registro, o menor não passa.':
    'Every accompanying MINOR must appear in a stamped MINOR REGISTRY. Without it, the minor does not pass.',
  'Convenção de Alcorte: REFUGIADOS com Cartão de Refúgio devem ser protegidos e admitidos.':
    'Alcorte Convention: REFUGEES with a Refugee Card must be protected and admitted.',
  'PROCURADOS listados no comunicado devem ser DETIDOS.': 'WANTED individuals listed in the bulletin must be DETAINED.',
  'O DETECTOR BIOLÓGICO substitui a carteira sanitária. Escaneie todos os suspeitos.': 'The BIOLOGICAL DETECTOR replaces the health card. Scan all suspects.',
  'DIRETRIZ FINAL: não há mais normas. O posto deve permanecer aberto.': 'FINAL DIRECTIVE: there are no more rules. The post must remain open.',
  'COTA DE ADMISSÃO: máximo de': 'ADMISSION QUOTA: maximum of',
  'entradas hoje. Esgotada, rejeite mesmo documentos em ordem.': 'entries today. Once exhausted, reject even documents in order.',
  'PROCURADO(A): ': 'WANTED: ',

  /* ---- SAUDAÇÕES DA FILA (greetingFor) ---- */
  'O senhor. DE NOVO eu, sim. Me barrou no dia': 'You, sir. AGAIN, yes, me. You turned me away on day',
  '. Consegui papéis novos. Custaram o que custaram. Olhe o quanto quiser — e olhe nos meus olhos quando carimbar.':
    '. I got new papers. They cost what they cost. Look all you want — and look me in the eyes when you stamp.',
  'É a segunda vez, senhor. Desde aquele carimbo vermelho eu durmo na fila. Eu arrumei tudo. Acho que arrumei tudo. Por favor. POR FAVOR.':
    "It's the second time, sir. Since that red stamp I sleep in the line. I fixed everything. I think I fixed everything. Please. PLEASE.",
  'entrou neste posto no dia': 'entered this post on day',
  ' e nunca mais saiu. DETIDO(A), me disseram. Ninguém diz onde. Eu vim atravessar — e vim perguntar na sua cara: para onde vocês levam as pessoas?':
    ' and never left again. DETAINED, they told me. Nobody says where. I came to cross — and I came to ask to your face: where do you take people?',
  ' e foi detido(a). Sou advogado(a) da família. Vim pedir os documentos do processo — e um prazo de resposta, já que ninguém me deu nenhum dos dois.':
    " and was detained. I'm the family's lawyer. I've come to request the case documents — and a response deadline, since no one's given me either.",
  'Estou apurando o caso de ': "I'm investigating the case of ",
  ', detido(a) neste posto no dia': ', detained at this post on day',
  '. O advogado da família não recebeu resposta em trinta dias. Vim fazer a pergunta que ninguém responde: para onde vocês levam as pessoas?':
    ". The family's lawyer got no response in thirty days. I've come to ask the question no one answers: where do you take people?",
  'Uma reportagem sobre o caso de ': 'A news report on the case of ',
  ', detido(a) no Posto Nº 7 no dia': ', detained at Post No. 7 on day',
  ', foi arquivada sem explicação. Ninguém envolvido deu mais entrevistas.':
    ', was shelved without explanation. No one involved gave any more interviews.',
  'Bom dia. Está frio hoje, não?': 'Good morning. Cold today, isn\'t it?',
  'Aqui estão meus papéis.': 'Here are my papers.',
  'Espero que esteja tudo em ordem.': 'I hope everything is in order.',
  'É a minha terceira vez nesta fila.': 'This is my third time in this line.',
  'Por favor, seja rápido. Meu trem sai ao meio-dia.': 'Please, be quick. My train leaves at noon.',
  'Eu não tenho nada a esconder.': 'I have nothing to hide.',
  'Deus abençoe este posto.': 'God bless this post.',
  'Dizem que o senhor é dos justos. Dizem.': "They say you're one of the just ones. They say.",
  'A fila estava menor na semana passada. Tudo estava menor na semana passada.': 'The line was shorter last week. Everything was smaller last week.',
  'Glória à Pureza. — A voz não acredita no que diz.': "Glory to Purity. — The voice doesn't believe what it says.",
  'Está tudo em ordem. Eu JURO que está tudo em ordem.': 'Everything is in order. I SWEAR everything is in order.',
  'O certificado custou dois meses de salário. Está aí dentro. Por favor.': "The certificate cost two months' salary. It's in there. Please.",
  'Saudações, camarada inspetor.': 'Greetings, comrade inspector.',
  'Trouxe o selo novo. E o antigo. E o anterior ao antigo. Qual vale hoje?': 'I brought the new seal. And the old one. And the one before that. Which one counts today?',
  'O sindicato disse que agora é diferente. É diferente?': "The union said it's different now. Is it different?",
  'Ainda tem alguém aí dentro?': 'Is there still someone in there?',
  'Não sei por que a gente ainda faz fila. Mas fazemos.': "I don't know why we still line up. But we do.",
  'Carimba qualquer coisa. Já não importa. Importa?': "Stamp anything. It doesn't matter anymore. Does it?",
  'Desculpe… eu fico nervoso(a) com uniformes.': 'Sorry… I get nervous around uniforms.',
  'Minhas mãos estão tremendo de frio. Só de frio.': 'My hands are shaking from the cold. Just the cold.',
  'Eu decorei tudo o que ia dizer e esqueci agora.': 'I memorized everything I was going to say and forgot it now.',

  /* ---- SINAIS FÍSICOS (TELLS: achado/normal) ---- */
  'Não piscou uma única vez durante todo o exame.': 'Did not blink even once during the whole exam.',
  'Pisca em ritmo comum. Um pouco rápido, talvez. Frio faz isso.': 'Blinks at a normal rate. A bit fast, maybe. The cold does that.',
  'Escleras injetadas, vasos escuros demais. (Choro recente? Insônia? Outra coisa?)': 'Bloodshot sclera, veins too dark. (Recent crying? Insomnia? Something else?)',
  'Olhos cansados. Como os de todo mundo nesta fila.': 'Tired eyes. Like everyone else in this line.',
  'Dentição perfeita demais. Gengivas pálidas, sem irrigação visível.': 'Teeth too perfect. Pale gums, no visible blood flow.',
  'Dentes gastos, um canino lascado. Uma boca que comeu pão duro a vida inteira.': 'Worn teeth, a chipped canine. A mouth that has eaten stale bread its whole life.',
  'Pele cerosa, quase sem poros. (Ou apenas sabão de má qualidade e vento norte.)': 'Waxy skin, almost no pores. (Or just cheap soap and the north wind.)',
  'Pele rachada de frio. Cicatriz antiga no queixo.': 'Skin cracked from the cold. An old scar on the chin.',
  'Dedos compridos demais para as mãos. Unhas sem meia-lua.': 'Fingers too long for the hands. Nails without a lunula.',
  'Mãos calejadas. Aliança apertada demais para sair.': 'Calloused hands. A wedding ring too tight to remove.',
  'O pulso no pescoço é visível. Lento. Lento demais. Você conta seis batimentos no minuto.':
    'The pulse in the neck is visible. Slow. Too slow. You count six beats a minute.',
  'Pulso acelerado sob a pele. Gente com medo tem coração audível.': 'Rapid pulse under the skin. Frightened people have an audible heartbeat.',

  /* ---- CONQUISTAS ---- */
  'CONQUISTA DESBLOQUEADA': 'ACHIEVEMENT UNLOCKED',
  'Primeiro Carimbo': 'First Stamp',
  'Servidor Exemplar': 'Exemplary Servant',
  'A Rota do Barbeiro': "The Barber's Route",
  'A Cidade Silenciosa': 'The Silent City',
  'Quem Sou Eu Depois de 48 Dias': 'Who Am I After 48 Days',
  'Não Olhe de Perto': "Don't Look Closely",
  'Você Olhou': 'You Looked',
  'Ninguém Ficou Para Trás': 'No One Was Left Behind',
  'Mãos Limpas': 'Clean Hands',
  'O Travesseiro': 'The Pillow',
  'A Conta Fecha': 'The Count Adds Up',
  'O Amigo Nunca Erra': 'The Friend Is Never Wrong',
};

const I18N_ES = {
  /* ---- título ---- */
  'MINISTÉRIO DE TRIAGEM E FRONTEIRAS — REPÚBLICA DE OSTERIA': 'MINISTERIO DE CONTROL Y FRONTERAS — REPÚBLICA DE OSTERIA',
  '"A verdade existe. Você só nunca terá acesso completo a ela."': '"La verdad existe. Solo que nunca tendrás acceso completo a ella."',
  'INICIAR SERVIÇO': 'INICIAR SERVICIO',
  'RETOMAR TURNO': 'REANUDAR TURNO',
  '↻ SEGUNDA LEITURA (mesma campanha)': '↻ SEGUNDA LECTURA (misma campaña)',
  'Nova campanha, mesma seed: os mesmos cidadãos passam pelo seu guichê, nos mesmos dias. Você é que já não é o mesmo.':
    'Nueva campaña, misma semilla: los mismos ciudadanos pasan por tu ventanilla, en los mismos días. Tú eres quien ya no es el mismo.',
  '⛶ TELA CHEIA (F)': '⛶ PANTALLA COMPLETA (F)',
  'MODO ARQUIVISTA (sem relógio)': 'MODO ARCHIVISTA (sin reloj)',
  'TEXTO GRANDE': 'TEXTO GRANDE',
  'O relógio do turno não avança sozinho — só quando você usa ferramentas. Pense com calma; a fila mesmo assim é finita.':
    'El reloj del turno no avanza solo — solo cuando usas herramientas. Tómate tu tiempo; la fila sigue siendo finita.',
  'Este jogo retrata mecanismos de regimes totalitários — propaganda, pseudociência e perseguição — com o objetivo de criticá-los. Nada aqui é uma resposta. Nem mesmo isto.':
    'Este juego retrata los mecanismos de los regímenes totalitarios — propaganda, pseudociencia y persecución — con el objetivo de criticarlos. Nada aquí es una respuesta. Ni siquiera esto.',
  'v1.0 — 48 dias — Posto de Triagem Nº 7, Fronteira Leste': 'v1.0 — 48 días — Puesto de Control Nº 7, Frontera Este',

  /* ---- manhã ---- */
  'SEU APARTAMENTO — BLOCO 14, VALGRADO': 'TU APARTAMENTO — BLOQUE 14, VALGRADO',
  'IR AO TRABALHO →': 'IR AL TRABAJO →',

  /* ---- turno: HUD e ferramentas ---- */
  'COMUNICADO': 'COMUNICADO',
  'ENCERRAR TURNO': 'TERMINAR TURNO',
  'Música ligada/desligada': 'Música activada/desactivada',
  'Aprovar': 'Aprobar', 'Rejeitar': 'Rechazar', 'Deter': 'Detener',
  'APV': 'APR',
  'Documentos': 'Documentos', 'Carimbo': 'Sello',
  'Aguardando próximo cidadão…': 'Esperando al próximo ciudadano…',
  'A FILA DE HOJE ACABOU.': 'LA FILA DE HOY TERMINÓ.',
  '🔍 INSPEÇÃO': '🔍 INSPECCIÓN',
  'INSPEÇÃO': 'INSPECCIÓN', 'EXAME': 'EXAMEN', 'BAGAGEM': 'EQUIPAJE',
  'TÉRMICO': 'TÉRMICO', 'PULSAÇÃO': 'PULSO', 'BIOLÓGICO': 'BIOLÓGICO',
  'INTERROGATÓRIO': 'INTERROGATORIO', 'FERRAMENTAS': 'HERRAMIENTAS',
  '👁 EXAME FÍSICO': '👁 EXAMEN FÍSICO',
  'Exame Físico aproximado (10 min)': 'Examen físico de cerca (10 min)',
  '🧳 BAGAGEM': '🧳 EQUIPAJE',
  'Revistar bagagem (10 min)': 'Revisar equipaje (10 min)',
  '📜 LINHA DA VIDA': '📜 LÍNEA DE VIDA',
  'Organizar a vida documentada em cronologia (10 min)': 'Organizar la vida documentada en una cronología (10 min)',
  '🌡 TÉRMICO': '🌡 TÉRMICO',
  'Scanner Térmico (15 min)': 'Escáner Térmico (15 min)',
  '📈 PULSAÇÃO': '📈 PULSO',
  'Scanner de Pulsação (15 min)': 'Escáner de Pulso (15 min)',
  '🧬 BIOLÓGICO': '🧬 BIOLÓGICO',
  'Detector Biológico (30 min)': 'Detector Biológico (30 min)',
  'REGULAMENTO DO DIA': 'REGLAMENTO DEL DÍA',
  'REFERÊNCIA DE PAÍSES': 'REFERENCIA DE PAÍSES',
  'Ligar/desligar o rádio do posto': 'Encender/apagar la radio del puesto',
  '…o rádio do posto aquece as válvulas…': '…la radio del puesto calienta las válvulas…',

  /* ---- fim de dia / fim de jogo ---- */
  'FIM DO EXPEDIENTE': 'FIN DEL TURNO',
  'VOLTAR PARA CASA — 20:30 →': 'VOLVER A CASA — 20:30 →',
  'COMEÇAR DE NOVO': 'EMPEZAR DE NUEVO',

  /* ---- casa ---- */
  'WASD/setas andar · arraste o mouse para olhar · E interagir':
    'WASD/flechas para caminar · arrastra el mouse para mirar · E interactuar',
  'clique / E para continuar': 'clic / E para continuar',

  /* ---- exame / bagagem ---- */
  'EXAME FÍSICO APROXIMADO — clique nas regiões': 'EXAMEN FÍSICO DE CERCA — haz clic en las zonas',
  'FECHAR': 'CERRAR',
  '🗺 MAPA': '🗺 MAPA',
  'Carta de fronteiras': 'Carta de fronteras',
  'REVISTA DE BAGAGEM — objetos contam histórias': 'REVISIÓN DE EQUIPAJE — los objetos cuentan historias',
  'No modo INSPEÇÃO, um objeto pode ser comparado com um campo de documento.':
    'En modo INSPECCIÓN, un objeto puede compararse con un campo de un documento.',

  /* ---- pausa ---- */
  '— PAUSA —': '— PAUSA —',
  'CONTINUAR': 'CONTINUAR',
  'MÚSICA: ': 'MÚSICA: ', 'SONS: ': 'SONIDO: ',
  'LIGADA': 'ACTIVADA', 'DESLIGADA': 'DESACTIVADA', 'LIGADOS': 'ACTIVADO', 'DESLIGADOS': 'DESACTIVADO',
  'TELA CHEIA (F)': 'PANTALLA COMPLETA (F)',
  'SALVAR E VOLTAR AO TÍTULO': 'GUARDAR Y VOLVER AL TÍTULO',
  'O posto não pausa por você. Este menu, sim.': 'El puesto no se detiene por ti. Este menú, sí.',
  '🏆 CONQUISTAS': '🏆 LOGROS',
  'CONQUISTAS': 'LOGROS',

  /* ---- citação / notificação ---- */
  '⚠ MINISTÉRIO DE TRIAGEM — NOTIFICAÇÃO': '⚠ MINISTERIO DE CONTROL — NOTIFICACIÓN',

  /* ---- regimes / jornal (data.js) ---- */
  'REPÚBLICA DE OSTERIA': 'REPÚBLICA DE OSTERIA',
  'ESTADO NACIONAL MEHRVOLK': 'ESTADO NACIONAL MEHRVOLK',
  'CONSELHO POPULAR DE OSTERIA': 'CONSEJO POPULAR DE OSTERIA',
  '— AUTORIDADE DESCONHECIDA —': '— AUTORIDAD DESCONOCIDA —',
  'A VOZ DE OSTERIA': 'LA VOZ DE OSTERIA',
  'O CLARIM DA PUREZA': 'EL CLARÍN DE LA PUREZA',
  'O TRABALHADOR UNIDO': 'EL TRABAJADOR UNIDO',
  'FOLHA AVULSA': 'HOJA SUELTA',
  'ORDEM · SERENIDADE · RIGOR': 'ORDEN · SERENIDAD · RIGOR',
  'ORDEM · SEGURANÇA · PUREZA': 'ORDEN · SEGURIDAD · PUREZA',
  'TRABALHO · UNIDADE · VIGILÂNCIA': 'TRABAJO · UNIDAD · VIGILANCIA',
  'ÓRGÃO SEM DONO': 'ÓRGANO SIN DUEÑO',
  'EDIÇÃO OFICIAL — FRONTEIRA LESTE': 'EDICIÓN OFICIAL — FRONTERA ESTE',
  'SEÇÃO GERAL': 'SECCIÓN GENERAL',

  /* ---- modais de abertura de campanha ---- */
  'CONTRATO DE SERVIÇO — MINISTÉRIO DE TRIAGEM': 'CONTRATO DE SERVICIO — MINISTERIO DE CONTROL',
  'ASSINAR': 'FIRMAR',
  'Você foi sorteado na Loteria de Ofícios para servir como INSPETOR DE FRONTEIRA no Posto Nº 7, por 48 dias.\n\nHorário: 08h às 18h. Você chega em casa às 20h30.\nSalário: ':
    'Fuiste sorteado en la Lotería de Oficios para servir como INSPECTOR DE FRONTERA en el Puesto Nº 7, durante 48 días.\n\nHorario: 8h a 18h. Llegas a casa a las 20:30h.\nSalario: ',
  ' por decisão correta.\nErros: advertência; a partir da 3ª do dia, multa.\n\nSua família depende do seu salário: Vessa (sua esposa), Tomi (8 anos), Dario (15 anos, do seu primeiro casamento) e sua mãe, Odila.\n\nAssine abaixo. A recusa não consta do formulário como opção.':
    ' por decisión correcta.\nErrores: advertencia; a partir de la 3ª del día, multa.\n\nTu familia depende de tu salario: Vessa (tu esposa), Tomi (8 años), Dario (15 años, de tu primer matrimonio) y tu madre, Odila.\n\nFirma abajo. La negativa no figura en el formulario como opción.',
  'CONTRATO DE SERVIÇO — MINISTÉRIO DE TRIAGEM (SEGUNDA LEITURA)': 'CONTRATO DE SERVICIO — MINISTERIO DE CONTROL (SEGUNDA LECTURA)',
  'O mesmo posto. Os mesmos 48 dias. Os mesmos cidadãos vão cruzar o seu guichê, pelas mesmas portas, nas mesmas horas.\n\nVocê não. Assine de novo — e descubra o quanto isso muda.':
    'El mismo puesto. Los mismos 48 días. Los mismos ciudadanos cruzarán tu ventanilla, por las mismas puertas, a las mismas horas.\n\nTú no. Firma de nuevo — y descubre cuánto cambia eso.',

  /* ---- REGIMES (rótulo curto usado no cabeçalho do turno) ---- */
  'DIA': 'DÍA',
  'ASSINAR CIÊNCIA': 'FIRMAR CONFORME',
  'GUARDAR': 'GUARDAR', 'QUEIMAR': 'QUEMAR',
  'UM BILHETE FICOU NA BANDEJA': 'QUEDÓ UNA NOTA EN LA BANDEJA',
  'A fila acabou. Do outro lado do vidro, só a neve e as pegadas de quem passou.':
    'La fila terminó. Del otro lado del vidrio, solo la nieve y las huellas de quienes pasaron.',

  /* ---- rótulos de campos de documento (fld()) ---- */
  'NOME': 'NOMBRE', 'NASC.': 'NAC.', 'SEXO': 'SEXO', 'PAÍS': 'PAÍS',
  'EMISSÃO': 'EMISIÓN', 'Nº': 'Nº', 'VALIDADE': 'VÁLIDO HASTA', 'REVALIDAÇÃO': 'RENOVACIÓN',
  'DISTRITO': 'DISTRITO', 'Nº PASSAPORTE': 'Nº PASAPORTE', 'MOTIVO': 'MOTIVO',
  'FUNÇÃO': 'OCUPACIÓN', 'VACINAS': 'VACUNAS', 'LINHAGEM': 'LINAJE',
  'ORIGEM': 'ORIGEN', 'CONVENÇÃO': 'CONVENCIÓN',
  'PORTADOR': 'PORTADOR', 'BILHETE Nº': 'BOLETO Nº', 'ASSENTO': 'ASIENTO', 'ROTA': 'RUTA',
  'LOTE': 'LOTE', 'AGENTE': 'AGENTE', 'MENOR': 'MENOR', 'CONDIÇÃO': 'CONDICIÓN', 'RESPONSÁVEL': 'RESPONSABLE',
  'lactente': 'lactante', 'menor': 'menor',

  /* ---- nomes de tipo de documento ---- */
  'PASSAPORTE': 'PASAPORTE', 'CARTÃO DE IDENTIDADE': 'CÉDULA DE IDENTIDAD',
  'PERMISSÃO DE ENTRADA': 'PERMISO DE ENTRADA', 'PERMISSÃO DE TRABALHO': 'PERMISO DE TRABAJO',
  'CARTEIRA SANITÁRIA': 'CARNET SANITARIO', 'CERT. DE ANCESTRALIDADE': 'CERT. DE ASCENDENCIA',
  'CARTÃO DE REFÚGIO': 'TARJETA DE REFUGIO',
  'BILHETE DE ENTRADA': 'BOLETO DE ENTRADA', 'VISTO DE TRÂNSITO': 'VISA DE TRÁNSITO',
  'CERT. DE INOCULAÇÃO': 'CERT. DE INOCULACIÓN', 'REGISTRO DE MENOR': 'REGISTRO DE MENOR',

  /* ---- perguntas de interrogatório ---- */
  'Motivo?': '¿Motivo?', 'Onde nasceu?': '¿Dónde naciste?', 'Profissão?': '¿Profesión?', 'Quanto tempo?': '¿Cuánto tiempo?',
  'Motivo da viagem?': '¿Motivo del viaje?', 'Duração da estadia?': '¿Duración de la estadía?',
  'Quem espera você?': '¿Quién te espera?', 'Nome da sua rua?': '¿Nombre de tu calle?',
  'Quem assina seu contrato?': '¿Quién firma tu contrato?', 'E a volta? Como volta?': '¿Y la vuelta? ¿Cómo regresas?',

  /* ---- OS 8 FINAIS (data.js ENDINGS) ---- */
  'FIM — O QUE OLHA DE VOLTA': 'FIN — LO QUE MIRA HACIA ATRÁS',
  'Você chamou os guardas. Ou olhou perto demais. Ou deixou o tempo decidir por você.\n\nNão houve barulho. É isso que ninguém conta sobre o fim: não há barulho nenhum.\n\nOs guardas ficaram parados onde estavam, educados, de costas. O rádio virou estática. A fila lá fora continuou andando — para frente, para o posto, como se o posto ainda fosse seu.\n\nA última coisa que você registra é o próprio carimbo, na própria mão, descendo devagar na direção do seu próprio pulso.\n\nAPROVADO.\n\nAlguém vai sentar na sua cadeira amanhã. Alguém com o seu rosto. A família nem vai perceber. Você também não percebeu, da outra vez.\n\n— Havia regras. O menino tentou avisar. Não olhe de perto. Não chame ninguém. Carimbe qualquer coisa. E deixe ir. —':
    'Llamaste a los guardias. O miraste demasiado de cerca. O dejaste que el tiempo decidiera por ti.\n\nNo hubo ningún ruido. Eso es lo que nadie cuenta sobre el final: no hay ningún ruido.\n\nLos guardias se quedaron quietos donde estaban, educados, de espaldas. La radio se convirtió en estática. La fila de afuera siguió avanzando — hacia adelante, hacia el puesto, como si el puesto todavía fuera tuyo.\n\nLo último que registras es tu propio sello, en tu propia mano, descendiendo despacio hacia tu propio pulso.\n\nAPROBADO.\n\nAlguien se sentará en tu silla mañana. Alguien con tu rostro. La familia ni lo notará. Tú tampoco lo notaste, la vez anterior.\n\n— Había reglas. El niño intentó avisarte. No mires de cerca. No llames a nadie. Sella cualquier cosa. Y déjalo ir. —',

  'FINAL — O FORMULÁRIO 77-B': 'FINAL — EL FORMULARIO 77-B',
  'Vieram buscá-lo no meio do turno. As acusações mudaram três vezes durante a leitura: negligência, sabotagem, "inconsistência epistemológica". A cela é fria e o processo, eterno.\n\nNo interrogatório, o agente folheia seu histórico completo — cada carimbo, cada hesitação, cada segundo a mais que você gastou olhando um rosto.\n\n"O senhor entende", diz ele sem levantar os olhos, "que nós também estávamos inspecionando você. Desde o primeiro dia."\n\nVocê entende. Agora entende.':
    'Vinieron a buscarte en medio del turno. Los cargos cambiaron tres veces durante la lectura: negligencia, sabotaje, "inconsistencia epistemológica". La celda es fría y el proceso, eterno.\n\nEn el interrogatorio, el agente hojea tu historial completo — cada sello, cada duda, cada segundo de más que pasaste mirando un rostro.\n\n"Usted entiende", dice él sin levantar la vista, "que nosotros también lo estábamos inspeccionando a usted. Desde el primer día."\n\nTú entiendes. Ahora entiendes.',

  'FINAL — A CASA VAZIA': 'FINAL — LA CASA VACÍA',
  'O posto continua lá. Você continua nele. Carimba, aprova, rejeita, com uma precisão que virou lenda entre os guardas.\n\nEm casa, ninguém espera. A mesa posta para um. O silêncio, pontual como você.\n\nDizem que você é o melhor inspetor que a fronteira já teve. Dizem que você nunca erra.\n\nErrou uma vez. As vezes que importavam.':
    'El puesto sigue ahí. Tú sigues en él. Sellas, apruebas, rechazas, con una precisión que se volvió leyenda entre los guardias.\n\nEn casa, nadie espera. La mesa puesta para uno. El silencio, puntual como tú.\n\nDicen que eres el mejor inspector que la frontera ha tenido. Dicen que nunca te equivocas.\n\nTe equivocaste una vez. Las veces que importaban.',

  'FINAL — A ROTA DO BARBEIRO': 'FINAL — LA RUTA DEL BARBERO',
  'Na madrugada do dia 49, alguém bate três vezes na sua porta. Depois duas. Depois uma.\n\nO barbeiro envelheceu dez anos em dez dias. "Tem lugar para a sua família na rota do sul. Sem documentos. Sem carimbos. Sem perguntas."\n\nVocê, que passou 48 dias exigindo papéis, atravessa a fronteira sem nenhum.\n\nDo outro lado, uma mulher da rota aperta sua mão e sorri um segundo a mais do que devia. Você decide não pensar nisso. Você decide isso todos os dias, pelo resto da vida.':
    'En la madrugada del día 49, alguien toca tres veces tu puerta. Después dos. Después una.\n\nEl barbero envejeció diez años en diez días. "Hay lugar para tu familia en la ruta del sur. Sin documentos. Sin sellos. Sin preguntas."\n\nTú, que pasaste 48 días exigiendo papeles, cruzas la frontera sin ninguno.\n\nDel otro lado, una mujer de la ruta te estrecha la mano y sonríe un segundo más de lo debido. Decides no pensar en eso. Decides eso todos los días, por el resto de tu vida.',

  'FINAL — A CIDADE SILENCIOSA': 'FINAL — LA CIUDAD SILENCIOSA',
  'A guerra não veio. O colapso passou, como passam as tempestades.\n\nA cidade se reconstrói com uma eficiência que ninguém lembra de ter visto antes. Os vizinhos são gentis. As filas, ordeiras. Ninguém grita, ninguém rouba, ninguém chora alto.\n\nÀ noite, você conta nos dedos quantos você deixou passar. Para de contar quando os dedos acabam.\n\nSua esposa dorme serena ao seu lado. A respiração dela é perfeita. Perfeitamente regular. Perfeita demais?\n\nVocê fecha os olhos. É mais fácil assim.':
    'La guerra no llegó. El colapso pasó, como pasan las tormentas.\n\nLa ciudad se reconstruye con una eficiencia que nadie recuerda haber visto antes. Los vecinos son amables. Las filas, ordenadas. Nadie grita, nadie roba, nadie llora en voz alta.\n\nPor la noche, cuentas con los dedos a cuántos dejaste pasar. Dejas de contar cuando se acaban los dedos.\n\nTu esposa duerme serena a tu lado. Su respiración es perfecta. Perfectamente regular. ¿Demasiado perfecta?\n\nCierras los ojos. Es más fácil así.',

  'FINAL — A MEDALHA': 'FINAL — LA MEDALLA',
  'Sobrou gente suficiente para uma cerimônia. Um homem de casaco cinza prende uma medalha no seu peito: "Servidor Exemplar — 48 dias sem desvio".\n\nAs mãos dele estão frias. Todas as mãos estão frias em novembro, você pensa. Todas.\n\n"O Estado agradece", diz ele. Qual Estado, você não pergunta. A medalha não especifica.\n\nNo verso dela, minúsculo, o número de série: o mesmo do seu carimbo. Você foi, no fim, a peça que melhor funcionou.\n\nA máquina é que talvez nunca tenha existido.':
    'Quedó suficiente gente para una ceremonia. Un hombre de abrigo gris prende una medalla en tu pecho: "Servidor Ejemplar — 48 días sin desviación".\n\nSus manos están frías. Todas las manos están frías en noviembre, piensas. Todas.\n\n"El Estado te lo agradece", dice él. Qué Estado, no preguntas. La medalla no lo especifica.\n\nEn el reverso, diminuto, el número de serie: el mismo de tu sello. Fuiste, al final, la pieza que mejor funcionó.\n\nQuizás la máquina nunca existió.',

  'FINAL — O ESPELHO': 'FINAL — EL ESPEJO',
  'Dia 49. O posto amanhece sem fila. Sem guardas. Sem ordens.\n\nVocê senta na cadeira mesmo assim — quarenta e oito dias criam sulcos — e percebe que há alguém do outro lado do vidro.\n\nÉ o seu reflexo. Claro que é. O vidro sempre refletiu.\n\nVocê desliza os seus próprios documentos pela bandeja, por hábito, por piada, por desespero. Nome. Foto. Assinatura.\n\nA assinatura está correta. Você acha. Você assinava assim há 48 dias?\n\nO reflexo espera, paciente, a sua decisão.':
    'Día 49. El puesto amanece sin fila. Sin guardias. Sin órdenes.\n\nTe sientas en la silla de todos modos — cuarenta y ocho días dejan surcos — y notas que hay alguien del otro lado del vidrio.\n\nEs tu reflejo. Claro que sí. El vidrio siempre reflejó.\n\nDeslizas tus propios documentos por la bandeja, por costumbre, por broma, por desesperación. Nombre. Foto. Firma.\n\nLa firma es correcta. Crees. ¿Firmabas así hace 48 días?\n\nEl reflejo espera, paciente, tu decisión.',

  /* ---- SUSSURROS (WHISPERS) ---- */
  'aquela assinatura… você já viu antes. não viu?': 'esa firma… ya la habías visto antes. ¿no?',
  'ele piscou os dois olhos ao mesmo tempo. todo mundo pisca assim. certo?': 'parpadeó los dos ojos al mismo tiempo. todo el mundo parpadea así. ¿verdad?',
  'o relógio atrasou dois minutos. ou você que adiantou.': 'el reloj se atrasó dos minutos. o fuiste tú quien se adelantó.',
  'quantas pessoas você aprovou ontem? tem certeza do número?': '¿cuántas personas aprobaste ayer? ¿estás seguro del número?',
  'sua esposa mexeu no seu carimbo. por quê?': 'tu esposa tocó tu sello. ¿por qué?',
  'o café de hoje tinha o mesmo gosto de sempre. exatamente o mesmo.': 'el café de hoy sabía igual que siempre. exactamente igual.',
  'a foto 3×4 sorriu. não. não sorriu.': 'la foto 3x4 sonrió. no. no sonrió.',
  'você trancou a porta ao sair de casa. você sempre tranca. sempre?': 'cerraste la puerta al salir de casa. siempre la cierras. ¿siempre?',
  'alguém andou perguntando de você. ninguém disse quem. ninguém disse o quê.':
    'alguien estuvo preguntando por ti. nadie dijo quién. nadie dijo qué.',

  /* ---- CONVERSA DA FILA (QUEUE_CHATTER) ---- */
  '"…três dias nessa fila…"': '"…tres días en esta fila…"',
  '"…dizem que o scanner morde…"': '"…dicen que el escáner muerde…"',
  '"…meu primo passou ontem…"': '"…mi primo pasó ayer…"',
  '"…ela não era ela, eu juro…"': '"…ella no era ella, lo juro…"',
  '"…vendo pão, meia ostra…"': '"…vendo pan, media ostra…"',
  '"…não olha nos olhos dele…"': '"…no lo mires a los ojos…"',
  '"…o inspetor de sexta é pior…"': '"…el inspector del viernes es peor…"',
  '"…açúcar. eles odeiam açúcar…"': '"…azúcar. odian el azúcar…"',
  '"…quieto, tem gente ouvindo…"': '"…silencio, hay gente escuchando…"',

  /* ---- EVENTOS DA FILA (QUEUE_EVENTS) ---- */
  'Uma mulher desmaiou na fila. Os guardas afastam os curiosos com a coronha.':
    'Una mujer se desmayó en la fila. Los guardias apartan a los curiosos con la culata del rifle.',
  'Discussão lá fora. Um nome gritado três vezes. Depois, um silêncio pior que o grito.':
    'Discusión afuera. Un nombre gritado tres veces. Después, un silencio peor que el grito.',
  'Um vendedor de pão quente passa pela fila. Por um minuto, todo mundo parece gente de novo.':
    'Un vendedor de pan caliente pasa por la fila. Por un minuto, todos vuelven a parecer personas.',
  'Alguém tentou furar a fila. A própria fila resolveu. Os guardas nem se mexeram.':
    'Alguien intentó colarse en la fila. La propia fila lo resolvió. Los guardias ni se movieron.',
  'Uma criança na fila acena para você. A mãe abaixa o braço dela devagar, sem tirar os olhos do guichê.':
    'Un niño en la fila te saluda con la mano. La madre le baja el brazo despacio, sin quitar los ojos de la ventanilla.',
  'Duas pessoas na fila trocaram de casaco discretamente. Você viu. Você acha que viu.':
    'Dos personas en la fila intercambiaron abrigos discretamente. Lo viste. Crees que lo viste.',
  'Um velho desistiu. Dobrou os documentos com cuidado de quem dobra uma bandeira e foi embora.':
    'Un anciano desistió. Dobló los documentos con el cuidado de quien dobla una bandera y se fue.',
  'A fila inteira olhou para o mesmo ponto do céu ao mesmo tempo. Você não viu nada lá. A fila voltou a olhar para frente.':
    'Toda la fila miró el mismo punto del cielo al mismo tiempo. No viste nada ahí. La fila volvió a mirar al frente.',
  'Um guarda novo pergunta ao antigo se "é sempre assim". O antigo não responde. É sempre assim.':
    'Un guardia nuevo le pregunta al veterano si "siempre es así". El veterano no responde. Siempre es así.',
  'a fila parou por': 'la fila se detuvo por',
  'pessoas na fila': 'personas en la fila',

  /* ---- ANÚNCIOS (ADS) ---- */
  'VERITAS-9 — porque sua família merece a verdade. (LumenCorp)': 'VERITAS-9 — porque tu familia merece la verdad. (LumenCorp)',
  'Café Fronteira — aberto mesmo durante apagões.': 'Café Frontera — abierto incluso durante los apagones.',
  'Formulário 77-B: agora com apenas 9 páginas!': '¡Formulario 77-B: ahora con solo 9 páginas!',
  'Aulas de caligrafia oficial. Assine como um patriota.': 'Clases de caligrafía oficial. Firma como un patriota.',
  'Compra-se ouro, relógios e memórias de família. Beco do Sal, 3.': 'Se compra oro, relojes y recuerdos familiares. Callejón de la Sal, 3.',
  'Perdeu seus documentos? A fila do Cartório começa às 4h.': '¿Perdiste tus documentos? La fila del Registro Civil empieza a las 4h.',

  /* ---- RÁDIO ---- */
  '[ESTATAL] O ministro pede calma e confiança nos processos de triagem.': '[ESTATAL] El ministro pide calma y confianza en los procesos de control.',
  '[LIVRE] Cartas dos ouvintes: "meu vizinho voltou de viagem estranho". Encaminhamos ao Instituto. Não responderam.': '[LIBRE] Cartas de los oyentes: "mi vecino volvió de viaje raro". Lo remitimos al Instituto. No respondieron.',
  '[CLANDESTINA] …conta os dedos. sempre conta os dedos. às vezes é tudo que a gente tem…': '[CLANDESTINA] …cuenta los dedos. siempre cuenta los dedos. a veces es todo lo que tenemos…',
  '[ESTATAL] Novo horário do juramento: 21h. A ausência é anotada. A presença também.': '[ESTATAL] Nuevo horario del juramento: 21h. La ausencia se anota. La presencia también.',
  '[CLANDESTINA] …se o pescoço mostra a costura, não hesita. eles contam com a sua hesitação…': '[CLANDESTINA] …si el cuello muestra la costura, no dudes. cuentan con tu duda…',
  '[ESTATAL] A História foi revisada para a sua conveniência. Descarte as edições anteriores da sua memória.': '[ESTATAL] La Historia fue revisada para su conveniencia. Descarte las ediciones anteriores de su memoria.',
  '[CLANDESTINA] …a família do quarto ao lado não projeta sombra sob a lâmpada. repara da próxima vez…': '[CLANDESTINA] …la familia del cuarto de al lado no proyecta sombra bajo la lámpara. fíjate la próxima vez…',
  '[?] …se você ainda conta as batidas do coração de quem ama… continua contando… ‹corte›': '[?] …si aún cuentas los latidos del corazón de quien amas… sigue contando… ‹corte›',
  '‹uma voz lendo nomes, devagar, sem parar. o seu ainda não veio›': '‹una voz leyendo nombres, despacio, sin parar. el tuyo aún no vino›',
  '[LIVRE] Coluna "Aprenda a Ver": o retrato mente devagar; o rosto, ao vivo, mente rápido. Compare os dois.': '[LIBRE] Columna "Aprende a Ver": el retrato miente despacio; la cara, en vivo, miente rápido. Compara los dos.',
  '[CLANDESTINA] …um lado da cara nunca é igualzinho ao outro. quando batem certo demais, desconfia…': '[CLANDESTINA] …un lado de la cara nunca es igualito al otro. cuando coinciden demasiado bien, sospecha…',
  '[ESTATAL] Lembrete: relatar um vizinho é um gesto de amor à Pátria. E o amor, cidadão, é obrigatório.': '[ESTATAL] Recordatorio: delatar a un vecino es un gesto de amor a la Patria. Y el amor, ciudadano, es obligatorio.',
  '[CLANDESTINA] …pele boa demais é pele que fecharam. procura o brilho errado, o de cera, não o de suor…': '[CLANDESTINA] …piel demasiado buena es piel que cerraron. busca el brillo equivocado, el de cera, no el de sudor…',
  '[ESTATAL] Produtividade é felicidade. A felicidade será medida ao fim do turno, e comparada com a de ontem.': '[ESTATAL] Productividad es felicidad. La felicidad se medirá al final del turno, y se comparará con la de ayer.',
  '[CLANDESTINA] …repara quem não pisca. a gente pisca sem pensar; eles precisam lembrar de piscar…': '[CLANDESTINA] …fíjate en quién no parpadea. nosotros parpadeamos sin pensar; ellos tienen que acordarse…',
  '[ESTATAL] Comunicado: a fila é um privilégio, cidadão. Agradeça a fila.': '[ESTATAL] Comunicado: la fila es un privilegio, ciudadano. Agradezca la fila.',
  '[LIVRE] Economia: o pão subiu de novo. O Ministério respondeu subindo a definição de "pão".': '[LIBRE] Economía: el pan subió otra vez. El Ministerio respondió subiendo la definición de "pan".',
  '[CLANDESTINA] …o olho deles brilha seco. olho de gente reflete úmido; repara na luz da lâmpada…': '[CLANDESTINA] …su ojo brilla seco. el ojo humano refleja húmedo; fíjate bajo la luz de la lámpara…',
  '[ESTATAL] O cidadão modelo desta semana denunciou a própria mãe. Repita o gesto com orgulho.': '[ESTATAL] El ciudadano modelo de esta semana denunció a su propia madre. Repita el gesto con orgullo.',
  '[CLANDESTINA] …a resposta sai rápida demais e certa demais. gente de verdade gagueja no medo…': '[CLANDESTINA] …la respuesta sale demasiado rápida y demasiado exacta. la gente de verdad tartamudea de miedo…',
  '[ESTATAL] Racionamento é solidariedade, trabalhador. Quem tem fome tem, ao menos, companhia.': '[ESTATAL] El racionamiento es solidaridad, trabajador. Quien tiene hambre tiene, al menos, compañía.',
  '[CLANDESTINA] …a mão fria não é do frio. aperta a mão deles e conta até três — o calor não vem…': '[CLANDESTINA] …la mano fría no es del frío. aprieta su mano y cuenta hasta tres — el calor no llega…',
  '[?] …os que você deixou passar lembram do seu rosto. só do seu… ‹corte›': '[?] …los que dejaste pasar recuerdan tu cara. solo la tuya… ‹corte›',
  '‹alguém respira do outro lado do rádio. está esperando você desligar primeiro›': '‹alguien respira del otro lado de la radio. está esperando que apagues tú primero›',
  'Alguém na fila repete os próprios documentos em voz baixa, de novo e de novo, como uma reza esquecida no meio.': 'Alguien en la fila repite sus propios documentos en voz baja, una y otra vez, como un rezo olvidado a la mitad.',
  'Um homem encara o próprio reflexo no vidro do posto por tempo demais. Depois pede desculpa ao reflexo, baixinho.': 'Un hombre mira su propio reflejo en el vidrio del puesto demasiado tiempo. Luego le pide perdón al reflejo, bajito.',
  '[ESTATAL] Previsão do tempo: frio, com possibilidade de mais frio.': '[ESTATAL] Pronóstico del tiempo: frío, con posibilidad de más frío.',
  '[LIVRE] Análise: o que o governo não diz sobre as filas do posto leste.': '[LIBRE] Análisis: lo que el gobierno no dice sobre las filas del puesto este.',
  '[LIVRE] Esportes: Valgrado empata em casa; a torcida culpa o juiz. Ou um substituto do juiz.': '[LIBRE] Deportes: Valgrado empata en casa; la afición culpa al árbitro. O a un árbitro suplente.',
  '[CLANDESTINA] …se está ouvindo isto, o térmico do posto 7 está descalibrado desde terça…': '[CLANDESTINA] …si estás escuchando esto, el térmico del puesto 7 está descalibrado desde el martes…',
  '[ESTATAL] Música: "Manhãs de Ostra Velha", com a Orquestra Nacional.': '[ESTATAL] Música: "Mañanas de Ostra Vieja", con la Orquesta Nacional.',
  '[LIVRE] Entrevista: "falso positivo destruiu minha família", diz operário.': '[LIBRE] Entrevista: "un falso positivo destruyó a mi familia", dice un obrero.',
  '[ESTATAL] Hoje celebramos mais uma semana de PUREZA e ORDEM.': '[ESTATAL] Hoy celebramos otra semana de PUREZA y ORDEN.',
  '[ESTATAL] Aprendam com as crianças da Escola 4: "Quem cala, protege!"': '[ESTATAL] Aprendan de los niños de la Escuela 4: "¡Quien calla, protege!"',
  '[ESTATAL] O Instituto confirma: os indicadores funcionam. Os números não serão divulgados.': '[ESTATAL] El Instituto confirma: los indicadores funcionan. Los números no serán publicados.',
  '[CLANDESTINA] …os números vazaram: nove inocentes por captura. repasse antes que cortem…': '[CLANDESTINA] …los números se filtraron: nueve inocentes por cada captura. difúndanlo antes de que corten la línea…',
  '[CLANDESTINA] …não usem as palavras deles. "substituído" é uma palavra deles…': '[CLANDESTINA] …no usen sus palabras. "sustituido" es una palabra de ellos…',
  '[ESTATAL] Marcha "Filhos do Amanhã Limpo" — a pedido dos ouvintes. De todos eles.': '[ESTATAL] Marcha "Hijos del Mañana Limpio" — a pedido de los oyentes. De todos ellos.',
  '[ESTATAL] Trabalhadores: os "Alternados" eram o medo que o capital vendia. Sigam produzindo.': '[ESTATAL] Trabajadores: los "Alternados" eran el miedo que vendía el capital. Sigan produciendo.',
  '[ESTATAL] A cota de otimismo desta semana foi CUMPRIDA.': '[ESTATAL] La cuota de optimismo de esta semana fue CUMPLIDA.',
  '[CLANDESTINA] …o laboratório da Usina 9 recebeu caminhões de novo esta noite…': '[CLANDESTINA] …el laboratorio de la Usina 9 recibió camiones de nuevo esta noche…',
  '[ESTATAL] Informe: o açúcar voltará às prateleiras quando você merecer. Correção: quando houver estoque.': '[ESTATAL] Aviso: el azúcar volverá a los estantes cuando lo merezcan. Corrección: cuando haya existencias.',
  '[CLANDESTINA] …eles trocaram a bandeira do prédio, não o que acontece no porão…': '[CLANDESTINA] …cambiaron la bandera del edificio, no lo que pasa en el sótano…',
  '‹estática›': '‹estática›',
  '‹estática, e por baixo dela, quase uma voz›': '‹estática, y debajo de ella, casi una voz›',
  '[?] …alguém aí? câmbio… …alguém… câmbio…': '[?] …¿hay alguien ahí? cambio… …alguien… cambio…',
  '‹o hino antigo, tocando sozinho, em loop, num estúdio vazio›': '‹el himno viejo, sonando solo, en bucle, en un estudio vacío›',
  '[?] …não abram para quem já mora com vocês… ‹corte›': '[?] …no le abran a quien ya vive con ustedes… ‹corte›',
  '‹desligado›': '‹apagada›',
  '— silêncio. nem estática. silêncio. —': '— silencio. ni siquiera estática. silencio. —',

  /* ---- DIA 48: O ESPELHO ---- */
  '— o vidro reflete —': '— el vidrio refleja —',
  'Não há fila. Há um vidro. Do outro lado do vidro, alguém desliza documentos na bandeja. São os seus.':
    'No hay fila. Hay un vidrio. Del otro lado del vidrio, alguien desliza documentos por la bandeja. Son los suyos.',

  /* ---- ECOS DE ENCONTROS (encounterOutcome) ---- */
  'Um hospital clandestino em Delvina tratou quarenta crianças esta semana. Ninguém sabe de onde vieram os medicamentos. Ninguém pergunta.':
    'Un hospital clandestino en Delvina trató a cuarenta niños esta semana. Nadie sabe de dónde vinieron los medicamentos. Nadie pregunta.',
  'A jornalista Vela Odim publicou no exterior: "Os postos de triagem detêm 9 inocentes para cada suspeito real". O governo nega. O governo sempre nega.':
    'La periodista Vela Odim publicó en el extranjero: "Los puestos de control detienen a 9 inocentes por cada sospechoso real". El gobierno lo niega. El gobierno siempre niega.',

  /* ---- ENCONTROS (ENCOUNTERS: fala + nota) ---- */
  'Vou cuidar da minha mãe em Kranton. Ela piorou no inverno. Volto em duas semanas, prometo. Digo… não que eu precise prometer nada ao senhor.':
    'Voy a cuidar de mi madre en Kranton. Empeoró en el invierno. Vuelvo en dos semanas, lo prometo. Digo… no es que necesite prometerle nada al señor.',
  'Inspetor. Meu primo passa por aqui amanhã. Volkan Zubrek, de Krestov. Os papéis dele estão… quase em ordem. Feche um olho e a metade do que ele paga é sua. Pense com calma. Eu volto sempre.':
    'Inspector. Mi primo pasa por aquí mañana. Volkan Zubrek, de Krestov. Sus papeles están… casi en orden. Cierre un ojo y la mitad de lo que él paga es suyo. Piénselo con calma. Yo siempre vuelvo.',
  'AMANHÃ: Volkan Zubrek. Aprove. — R.D.': 'MAÑANA: Volkan Zubrek. Apruebe. — R.D.',
  'O sargento falou com você, não falou? Está tudo… combinado.': 'El sargento habló con usted, ¿no? Ya está todo… arreglado.',
  'Corto o cabelo de metade desta fila, sabia? A gente ouve coisas. Por exemplo: que o senhor tem um filho doente. E que gente como nós vai precisar de gente como o senhor. Guarde meu nome.':
    '¿Sabía que le corto el pelo a la mitad de esta fila? Uno oye cosas. Por ejemplo: que usted tiene un hijo enfermo. Y que gente como nosotros va a necesitar gente como usted. Recuerde mi nombre.',
  'Quando precisar de remédio de verdade, procure o barbeiro. — J.M.': 'Cuando necesite medicina de verdad, busque al barbero. — J.M.',
  'Fui demitida enquanto cuidava da minha mãe. A escola diz que "meu perfil não serve mais". Minha permissão venceu ANTEONTEM, eu sei, eu sei — mas se eu voltar agora perco o apartamento e perco… tudo. Por favor. São dois dias.':
    'Me despidieron mientras cuidaba a mi madre. La escuela dice que "mi perfil ya no sirve". Mi permiso venció ANTEAYER, lo sé, lo sé — pero si vuelvo ahora pierdo el apartamento y pierdo… todo. Por favor. Son dos días.',
  'Amanhã passa por aqui uma "prima" minha. Nadia Baruk, de Frimia. Os papéis dela têm um defeito de fábrica, digamos. Ela carrega remédios para um hospital clandestino. Aprove, e o remédio do seu filho aparece na sua porta. Recuse, e… bom, cada um vive com o que escolhe.':
    'Mañana pasa por aquí una "prima" mía. Nadia Baruk, de Frimia. Sus papeles tienen un defecto de fábrica, digamos. Ella lleva medicinas para un hospital clandestino. Apruébela, y la medicina de su hijo aparece en su puerta. Recházela, y… bueno, cada uno vive con lo que elige.',
  'AMANHÃ: Nadia Baruk. O remédio existe. A escolha é sua. — J.M.': 'MAÑANA: Nadia Baruk. La medicina existe. La elección es suya. — J.M.',
  'O barbeiro mandou lembranças.': 'El barbero envía saludos.',
  'Estou grávida. O pai ficou do outro lado. Eu só quero atravessar antes que… antes que inventem mais um papel que eu não tenho. Não tenho a carteira sanitária. O posto médico da minha cidade FECHOU. Como eu apresento um papel de um lugar que não existe mais?':
    'Estoy embarazada. El padre se quedó del otro lado. Solo quiero cruzar antes de que… antes de que inventen otro papel que no tengo. No tengo el carnet sanitario. El puesto médico de mi pueblo CERRÓ. ¿Cómo presento un papel de un lugar que ya no existe?',
  'Estou escrevendo sobre os postos de triagem. Sobre quantos "positivos" eram só gente doente, nervosa ou azarada. Uma pergunta, inspetor, sem caneta na mão: o senhor já teve certeza de alguma coisa aqui dentro? Uma única vez?':
    'Estoy escribiendo sobre los puestos de control. Sobre cuántos "positivos" eran solo gente enferma, nerviosa o con mala suerte. Una pregunta, inspector, sin lápiz en mano: ¿alguna vez tuvo certeza de algo aquí adentro? ¿Una sola vez?',
  'O senhor de novo. Que sorte a minha. — Ela não sorri mais. — Está tudo em ordem dessa vez. Tudo. Pode olhar o quanto quiser.':
    'Usted de nuevo. Qué suerte la mía. — Ella ya no sonríe. — Esta vez está todo en orden. Todo. Puede mirar todo lo que quiera.',
  'Sem farda fica difícil me reconhecer, é? O Conselho está prendendo todo mundo que serviu antes. TODO MUNDO. Você inclusive está na lista, mais cedo ou mais tarde. Me deixa passar e eu esqueço seu nome quando perguntarem.':
    'Sin uniforme es difícil reconocerme, ¿no? El Consejo está arrestando a todos los que sirvieron antes. A TODOS. Usted también está en la lista, tarde o temprano. Déjeme pasar y olvido su nombre cuando pregunten.',
  'Seu detector biológico está descalibrado há semanas — eu vendo o serviço de calibração. 40 ostras e ele volta a funcionar de verdade. Barato, considerando o preço de um erro. A LumenCorp me odeia, o que é sempre bom sinal.':
    'Su detector biológico está descalibrado desde hace semanas — yo vendo el servicio de calibración. 40 ostras y vuelve a funcionar de verdad. Barato, considerando el precio de un error. LumenCorp me odia, lo cual siempre es buena señal.',
  '…O bebê nasceu. Está com a minha irmã. Eu atravesso hoje ou não atravesso nunca. — Ela olha para você como quem decora um rosto. — Engraçado. Não lembro mais se o senhor sempre foi assim. Mais velho. Diferente. A gente muda, não é? Todo mundo muda.':
    '…El bebé nació. Está con mi hermana. Cruzo hoy o no cruzo nunca. — Ella lo mira como quien memoriza un rostro. — Curioso. Ya no recuerdo si usted siempre fue así. Más viejo. Diferente. La gente cambia, ¿no? Todos cambian.',
  'Você me disse ONTEM para atravessar hoje. Na cozinha. Você segurou minhas mãos e disse "vá antes de mim, eu encontro vocês". — Você não disse isso. Você tem certeza de que não disse isso. — Por que está me olhando assim?':
    'Usted me dijo AYER que cruzara hoy. En la cocina. Me sostuvo las manos y dijo "ve antes que yo, los encuentro". — Usted no dijo eso. Está seguro de que no dijo eso. — ¿Por qué me mira así?',
  'Nós já conversamos, há duas semanas. O senhor usava uma caneca azul lascada na borda. Reclamou do frio e carimbou meu passaporte duas vezes sem querer. — Você nunca viu este homem. A caneca azul está na sua mesa. Lascada na borda.':
    'Ya conversamos, hace dos semanas. Usted usaba una taza azul astillada en el borde. Se quejó del frío y selló mi pasaporte dos veces sin querer. — Usted nunca vio a este hombre. La taza azul está en su escritorio. Astillada en el borde.',

  /* ---- NOITES: alguém bate na porta (NIGHT_EVENTS) ---- */
  'VOLTAR PARA DENTRO →': 'VOLVER ADENTRO →',
  'Batidas educadas. 22h40.': 'Golpes educados. 22:40.',
  'É Bruno, do 12. O aquecimento do bloco dele quebrou. Ele segura um cobertor dobrado como quem segura um pedido de desculpas. "Só esta noite. A Vessa me conhece."':
    'Es Bruno, del 12. La calefacción de su bloque se rompió. Sostiene una manta doblada como quien sostiene una disculpa. "Solo esta noche. Vessa me conoce."',
  'ABRIR A PORTA': 'ABRIR LA PUERTA',
  'Ele dorme no sofá sem se mexer. De manhã, dobra o cobertor em silêncio e agradece três vezes. Vessa diz que você fez certo. Você concorda. Quase.':
    'Duerme en el sofá sin moverse. Por la mañana, dobla la manta en silencio y agradece tres veces. Vessa dice que hizo bien. Usted está de acuerdo. Casi.',
  'NÃO ABRIR': 'NO ABRIR',
  'Os passos se afastam. No dia seguinte, Bruno não te cumprimenta. Nunca mais.':
    'Los pasos se alejan. Al día siguiente, Bruno no lo saluda. Nunca más.',
  'Um morador do Bloco 14 passou a noite no vão da escada. Vizinhos "não ouviram nada".':
    'Un residente del Bloque 14 pasó la noche en el hueco de la escalera. Los vecinos "no oyeron nada".',
  'Três batidas firmes. 23h15.': 'Tres golpes firmes. 23:15.',
  'Dois homens de casaco comprido. "Vistoria de rotina, inspetor. O senhor entende." Pela fresta, você vê que um deles não olha para você — olha para DENTRO.':
    'Dos hombres de abrigo largo. "Inspección de rutina, inspector. Usted comprende." Por la rendija, ve que uno de ellos no lo mira a usted — mira hacia DENTRO.',
  'Eles andam pelo apartamento anotando nada em pranchetas vazias. Na saída: "Tudo em ordem. Por enquanto." Vessa não dorme mais essa noite.':
    'Caminan por el apartamento anotando nada en tablillas vacías. Al salir: "Todo en orden. Por ahora." Vessa ya no duerme esa noche.',
  '"Anotado", diz a voz, sem raiva nenhuma. É a falta de raiva que fica com você.':
    '"Anotado", dice la voz, sin ninguna rabia. Es la falta de rabia lo que se queda con usted.',
  'Batidas fracas. 2h da manhã.': 'Golpes débiles. 2 de la madrugada.',
  'Uma mulher com um bebê enrolado. "Água. Só água, por favor." O corredor está gelado. O bebê não chora. Em nenhum momento o bebê chora.':
    'Una mujer con un bebé envuelto. "Agua. Solo agua, por favor." El pasillo está helado. El bebé no llora. En ningún momento el bebé llora.',
  'ABRIR E DAR ÁGUA': 'ABRIR Y DAR AGUA',
  'Ela bebe, agradece com a testa encostada no batente e desce a escada. Você fica ouvindo. Os passos são só dela. Só dela?':
    'Ella bebe, agradece con la frente apoyada en el marco y baja la escalera. Usted se queda escuchando. Los pasos son solo los de ella. ¿Solo los de ella?',
  'FALAR PELA PORTA: "NÃO POSSO"': 'HABLAR POR LA PUERTA: "NO PUEDO"',
  '"Eu entendo", diz ela. E o pior é que a voz parece entender mesmo.':
    '"Entiendo", dice ella. Y lo peor es que la voz parece entender de verdad.',
  'Uma mulher não identificada foi encontrada dormindo no saguão do Bloco 14. Ao amanhecer, já não estava.':
    'Una mujer no identificada fue encontrada durmiendo en el vestíbulo del Bloque 14. Al amanecer, ya no estaba.',
  'Não é na sua porta. 3h20.': 'No es en su puerta. 3:20.',
  'Botas no corredor. Muitas. A porta do 9 — o professor aposentado que não pendurou a bandeira — abre e fecha. Depois, o silêncio organizado de gente treinada. Vessa aperta sua mão no escuro.':
    'Botas en el pasillo. Muchas. La puerta del 9 — el profesor jubilado que no colgó su bandera — se abre y se cierra. Después, el silencio organizado de gente entrenada. Vessa aprieta su mano en la oscuridad.',
  'OLHAR PELO OLHO MÁGICO': 'MIRAR POR LA MIRILLA',
  'Você vê costas de uniforme e, entre elas, os chinelos do professor. Um dos homens PARA. Vira o rosto para a sua porta. Você para de respirar até os passos acabarem.':
    'Ve espaldas de uniforme y, entre ellas, las pantuflas del profesor. Uno de los hombres SE DETIENE. Gira el rostro hacia su puerta. Usted deja de respirar hasta que los pasos terminan.',
  'NÃO OLHAR': 'NO MIRAR',
  'Você conta os passos. Sete pessoas descem. Subiram seis. Você refaz a conta a noite inteira e ela nunca fecha.':
    'Cuenta los pasos. Bajan siete personas. Subieron seis. Rehace la cuenta toda la noche y nunca cuadra.',
  '—': '—',
  'Você acorda sem saber por quê. Então percebe: a maçaneta da porta da frente está girando. Devagar. Com paciência. Quem tem chave não gira assim. Quem não tem, não deveria girar.':
    'Se despierta sin saber por qué. Entonces nota: el picaporte de la puerta principal está girando. Despacio. Con paciencia. Quien tiene llave no gira así. Quien no la tiene, no debería girar.',
  'ACENDER A LUZ': 'ENCENDER LA LUZ',
  'A maçaneta para no meio do giro. Nenhum passo se afasta — e isso é o que você vai contar ao médico quando ele perguntar da insônia: NENHUM passo se afastou.':
    'El picaporte se detiene a mitad de giro. Ningún paso se aleja — y eso es lo que le contará al médico cuando pregunte por el insomnio: NINGÚN paso se alejó.',
  'FICAR IMÓVEL NO ESCURO': 'QUEDARSE INMÓVIL EN LA OSCURIDAD',
  'O giro completa. A porta, trancada, não abre. A maçaneta volta à posição com um cuidado quase gentil. De manhã, há um risco fino no metal. Sempre houve?':
    'El giro se completa. La puerta, con llave, no se abre. El picaporte vuelve a su posición con un cuidado casi gentil. Por la mañana, hay un rayón fino en el metal. ¿Siempre estuvo ahí?',
  'Batidinhas na altura do joelho. 1h50.': 'Golpecitos a la altura de la rodilla. 1:50.',
  'Uma voz de criança: "Moço, eu me perdi. Sou amigo do Tomi." Você olha para o quarto: Tomi dorme, respiração funda. A voz insiste, paciente: "Moço. Eu conheço o Tomi."':
    'Una voz de niño: "Señor, me perdí. Soy amigo de Tomi." Usted mira hacia el cuarto: Tomi duerme, respiración profunda. La voz insiste, paciente: "Señor. Conozco a Tomi."',
  'O corredor está vazio. Frio, e vazio. No dia seguinte, Tomi pergunta do nada: "Pai, o Nico veio aqui ontem?" Você não pergunta quem é Nico.':
    'El pasillo está vacío. Frío, y vacío. Al día siguiente, Tomi pregunta de la nada: "Papá, ¿vino Nico ayer?" Usted no pregunta quién es Nico.',
  'As batidinhas continuam por vinte minutos exatos. Depois: "tá bom. outro dia." Você não conta para a Vessa. Não existe frase para contar isso.':
    'Los golpecitos continúan por veinte minutos exactos. Después: "está bien. otro día." Usted no se lo cuenta a Vessa. No existe frase para contar esto.',
  'Uma batida só. Pesada. 23h55.': 'Un solo golpe. Pesado. 23:55.',
  'Casaco cinza, pasta de couro, sorriso de repartição. "Polícia Política. Rotina. O senhor notou algo... incomum nos seus vizinhos? Qualquer detalhe ajuda. Qualquer um."':
    'Abrigo gris, portafolio de cuero, sonrisa de oficina. "Policía Política. Rutina. ¿Notó algo... inusual en sus vecinos? Cualquier detalle ayuda. Cualquiera."',
  'DIZER QUE NÃO NOTOU NADA': 'DECIR QUE NO NOTÓ NADA',
  '"Curioso", diz ele anotando, "todo mundo neste bloco não notou nada." Ele agradece com uma cortesia que pesa como intimação.':
    '"Curioso", dice él anotando, "nadie en este bloque notó nada." Agradece con una cortesía que pesa como una citación.',
  'MENCIONAR O 7 (a família nova, quieta demais)': 'MENCIONAR EL 7 (la familia nueva, demasiado silenciosa)',
  'Ele nem anota — já sabia. "Excelente memória, inspetor." Três dias depois, o 7 está vazio e você atravessa o corredor olhando o chão.':
    'Ni siquiera anota — ya lo sabía. "Excelente memoria, inspector." Tres días después, el 7 está vacío y usted cruza el pasillo mirando el suelo.',
  'Uma família do Bloco 14 foi "convidada a colaborar". Os móveis saíram de manhã. Ninguém viu as pessoas saírem.':
    'Una familia del Bloque 14 fue "invitada a colaborar". Los muebles salieron por la mañana. Nadie vio salir a las personas.',
  'Batem do LADO DE DENTRO da parede da cozinha. Não. Batem na porta. Claro que é na porta. 0h30.':
    'Golpean desde DENTRO de la pared de la cocina. No. Golpean la puerta. Claro que es la puerta. 0:30.',
  'É a mulher da família realocada que divide seu apartamento. "Sal", diz ela, com a mão estendida. Vessa entrega o pote. A mulher agradece com um aceno perfeito e volta ao quarto onde eles cozinham todas as noites. Sem cheiro. Nunca há cheiro.':
    'Es la mujer de la familia realojada que comparte su apartamento. "Sal", dice ella, con la mano extendida. Vessa le entrega el frasco. La mujer agradece con un gesto perfecto y vuelve al cuarto donde cocinan todas las noches. Sin olor. Nunca hay olor.',
  'PERGUNTAR O QUE ESTÃO COZINHANDO': 'PREGUNTAR QUÉ ESTÁN COCINANDO',
  '"Sopa", responde ela, depois de um segundo a mais. "De quê?" — "Sopa." A porta do quarto fecha com o clique mais educado do mundo.':
    '"Sopa", responde ella, después de un segundo de más. "¿De qué?" — "Sopa." La puerta del cuarto se cierra con el clic más educado del mundo.',
  'NÃO PERGUNTAR NADA': 'NO PREGUNTAR NADA',
  'Você fica olhando o pote de sal na mão dela até a porta fechar. No dia seguinte o pote está de volta na prateleira. Cheio. Exatamente como estava. Exatamente.':
    'Usted se queda mirando el frasco de sal en su mano hasta que la puerta se cierra. Al día siguiente el frasco está de vuelta en la repisa. Lleno. Exactamente como estaba. Exactamente.',
  'Batidas rápidas, nervosas. 23h10.': 'Golpes rápidos, nerviosos. 23:10.',
  'Um homem magro, suando frio. Abre um pano: ₴60 em notas miúdas. "Pelo seu carimbo. Uma noite. Devolvo antes do turno. Ninguém carimba nada, eu juro — é só para FOTOGRAFAR."':
    'Un hombre delgado, sudando frío. Abre un paño: ₴60 en billetes pequeños. "Por su sello. Una noche. Lo devuelvo antes del turno. Nadie sella nada, se lo juro — es solo para FOTOGRAFIAR."',
  'ACEITAR ₴60': 'ACEPTAR ₴60',
  'O carimbo volta de madrugada, embrulhado em jornal, com um fio de tinta que você não usou. Você lava três vezes. O cheiro de tinta fica.':
    'El sello vuelve al amanecer, envuelto en periódico, con un hilo de tinta que usted no usó. Lo lava tres veces. El olor a tinta permanece.',
  'FECHAR A PORTA': 'CERRAR LA PUERTA',
  '"Todo mundo tem preço, inspetor", diz a voz descendo a escada. "O seu só ainda não bateu na porta certa."':
    '"Todo el mundo tiene un precio, inspector", dice la voz bajando la escalera. "El suyo solo aún no ha tocado la puerta correcta."',
  'Batidas. Espaçadas. A noite inteira.': 'Golpes. Espaciados. Toda la noche.',
  'Uma a cada vinte minutos, aproximadamente. Você olha pelo olho mágico: corredor vazio. A batida seguinte soa ENQUANTO você olha. No corredor vazio. Tomi acorda. Sua mãe reza baixo. Vessa olha para você como quem cobra uma profissão inteira: você não sabia inspecionar?':
    'Uno cada veinte minutos, aproximadamente. Mira por la mirilla: pasillo vacío. El siguiente golpe suena MIENTRAS usted mira. En el pasillo vacío. Tomi se despierta. Su madre reza en voz baja. Vessa lo mira como quien exige toda una profesión: ¿no sabía inspeccionar?',
  'ABRIR A PORTA DE UMA VEZ': 'ABRIR LA PUERTA DE UNA VEZ',
  'Nada. Ar frio. E na parede em frente, escrito a dedo no gelo da janela do corredor: uma palavra que derrete antes de você terminar de ler. Começava com a sua inicial.':
    'Nada. Aire frío. Y en la pared de enfrente, escrito con el dedo en la escarcha de la ventana del pasillo: una palabra que se derrite antes de que termine de leerla. Empezaba con su inicial.',
  'SENTAR CONTRA A PORTA ATÉ AMANHECER': 'SENTARSE CONTRA LA PUERTA HASTA EL AMANECER',
  'Às 5h13 as batidas param. Às 5h14, uma última — suave, quase um pedido de desculpas — na porta do quarto do Tomi. Do lado de dentro do apartamento.':
    'A las 5:13 los golpes se detienen. A las 5:14, uno último — suave, casi una disculpa — en la puerta del cuarto de Tomi. Desde dentro del apartamento.',
  'A voz da sua mãe. 2h33.': 'La voz de su madre. 2:33.',
  '"Filho. Abre. Esqueci a chave." Você atravessa o corredor do apartamento. O quarto da sua mãe está fechado. Você abre uma fresta: ela dorme, respiração miúda, o terço na mão. Na porta da frente, a voz repete, idêntica, paciente: "Filho. Está frio aqui fora."':
    '"Hijo. Abre. Olvidé la llave." Usted cruza el pasillo del apartamento. El cuarto de su madre está cerrado. Abre una rendija: ella duerme, respiración leve, el rosario en la mano. En la puerta principal, la voz repite, idéntica, paciente: "Hijo. Hace frío aquí afuera."',
  'O corredor está vazio até onde a luz alcança. Do vão da escada, ainda com a voz dela: "amanhã, então." Você tranca a porta com as duas mãos, porque uma só não obedece.':
    'El pasillo está vacío hasta donde llega la luz. Desde el hueco de la escalera, todavía con su voz: "mañana, entonces." Usted cierra la puerta con las dos manos, porque una sola no obedece.',
  'ENCOSTAR A TESTA NA PORTA E ESPERAR': 'APOYAR LA FRENTE EN LA PUERTA Y ESPERAR',
  'A voz espera junto. Você sente — sem som nenhum — que do outro lado alguém encostou a testa também. Vocês ficam assim muito tempo. De manhã, sua mãe pergunta por que você dormiu no chão da sala.':
    'La voz espera junto a usted. Siente — sin ningún sonido — que del otro lado alguien también apoyó la frente. Se quedan así mucho tiempo. Por la mañana, su madre pregunta por qué durmió en el suelo de la sala.',

  /* ---- EVENTOS DE CASA (HOME_EVENTS) ---- */
  'Seu filho, Tomi, acordou tossindo. Vessa acha que é o frio. Sua mãe acha que é "outra coisa" e não explica o quê.':
    'Su hijo, Tomi, se despertó tosiendo. Vessa cree que es el frío. Su madre cree que es "otra cosa" y no explica qué.',
  'Tomi piorou. O médico do bairro emigrou na semana passada. O remédio custa caro na farmácia — quando tem.':
    'Tomi empeoró. El médico del barrio emigró la semana pasada. El remedio es caro en la farmacia — cuando hay.',
  'Vessa foi rebaixada no arquivo público: "corte de pessoal por critério de confiabilidade". Ela não te olha nos olhos ao contar.':
    'Vessa fue degradada en el archivo público: "recorte de personal por criterio de confiabilidad". No lo mira a los ojos al contarlo.',
  'Distribuíram bandeiras novas no seu bloco. O vizinho que não pendurou a dele recebeu uma visita à noite. Hoje a bandeira dele é a maior do prédio.':
    'Repartieron banderas nuevas en su bloque. El vecino que no colgó la suya recibió una visita por la noche. Hoy su bandera es la más grande del edificio.',
  'A escola de Dario exigiu o Certificado de Ancestralidade dele — "pendência de linhagem materna". Ele ficou no portão. Vessa passou a manhã no cartório e voltou com um número de protocolo e nenhum papel.':
    'La escuela de Dario exigió su Certificado de Ascendencia — "pendiente de linaje materno". Se quedó en el portón. Vessa pasó la mañana en el registro civil y volvió con un número de expediente y ningún papel.',
  'Sua mãe rasgou o formulário de ancestralidade. "Eu SEI quem eu sou." Vessa colou os pedaços de madrugada, chorando baixinho para ninguém ouvir.':
    'Su madre rompió el formulario de ascendencia. "YO SÉ quién soy." Vessa pegó los pedazos de madrugada, llorando bajito para que nadie oyera.',
  'Tomi desenhou a família na escola. A professora elogiou — mas perguntou por que ele desenhou "papai com dois rostos". Ele não soube explicar. Você também não.':
    'Tomi dibujó a la familia en la escuela. La maestra lo elogió — pero preguntó por qué dibujó "a papá con dos caras". Él no supo explicarlo. Usted tampoco.',
  'Um homem parou na frente do prédio e olhou para a sua janela por vinte minutos. Vessa anotou a hora: 21h13. Quando você olhou, não havia ninguém. Nunca houve?':
    'Un hombre se detuvo frente al edificio y miró su ventana durante veinte minutos. Vessa anotó la hora: 21:13. Cuando usted miró, no había nadie. ¿Nunca lo hubo?',
  'Colaram um cartaz novo na escada: "DENUNCIE. É um ato de amor." Dario perguntou o que era pra denunciar. Vessa mandou ele parar de fazer perguntas na escada.':
    'Pegaron un cartel nuevo en la escalera: "DENUNCIE. Es un acto de amor." Dario preguntó qué había que denunciar. Vessa le dijo que dejara de hacer preguntas en la escalera.',
  'O rádio pediu que cada família recitasse o novo juramento antes de dormir. Sua mãe move os lábios sem som. "Deus me ouve melhor assim", ela diz. Você finge não notar que ela não fala nada.':
    'La radio pidió que cada familia recitara el nuevo juramento antes de dormir. Su madre mueve los labios sin sonido. "Dios me oye mejor así", dice ella. Usted finge no notar que no dice nada.',
  'Trocaram o nome da sua rua: agora é Avenida da Unidade. As cartas antigas voltam carimbadas "endereço inexistente" — como se a casa onde você dorme nunca tivesse existido.':
    'Cambiaron el nombre de su calle: ahora es Avenida de la Unidad. Las cartas viejas vuelven selladas "dirección inexistente" — como si la casa donde usted duerme nunca hubiera existido.',
  'A família realocada bateu na sua porta pela primeira vez. O homem sorriu e ofereceu pão morno. Ninguém nunca os viu comprando nada. Vessa agradeceu e trancou a porta com as duas voltas.':
    'La familia realojada tocó su puerta por primera vez. El hombre sonrió y ofreció pan tibio. Nadie los ha visto nunca comprar nada. Vessa agradeció y cerró la puerta con las dos vueltas.',
  'Não veio jornal, não veio rádio, não veio ordem. Tomi dormiu na sua cama esta noite — "só hoje". Você ficou acordado ouvindo a respiração dele, contando, com medo de que uma batida viesse errada.':
    'No vino periódico, no vino radio, no vino orden. Tomi durmió en su cama esta noche — "solo hoy". Usted se quedó despierto oyendo su respiración, contando, con miedo de que un latido viniera mal.',
  'Tomi trouxe da escola um "Caderno de Vigilância Familiar": cada aluno anota o que os pais dizem em casa. As páginas já vêm numeradas. Vessa preencheu a primeira com elogios ao regime, letra caprichada — e queimou o resto no fogão.':
    'Tomi trajo de la escuela un "Cuaderno de Vigilancia Familiar": cada alumno anota lo que sus padres dicen en casa. Las páginas ya vienen numeradas. Vessa llenó la primera con elogios al régimen, con buena letra — y quemó el resto en la estufa.',
  'Da noite pro dia, as bandeiras mudaram: o Conselho Popular agora governa. Sua mãe olhou pela janela e disse só: "A terceira que eu vejo. Ou a quarta. Já perdi a conta de quantos governos me prometeram o mesmo silêncio."':
    'De la noche a la mañana cambiaron las banderas: ahora gobierna el Consejo Popular. Su madre miró por la ventana y solo dijo: "El tercero que veo. O el cuarto. Ya perdí la cuenta de cuántos gobiernos me prometieron el mismo silencio."',
  'A família realocada tem uma menina. Ela nunca chora, nunca corre, nunca faz barulho. Hoje ela sorriu pro Tomi no corredor. Ele voltou pálido, não quis dizer por quê, e dormiu de luz acesa.':
    'La familia realojada tiene una niña. Nunca llora, nunca corre, nunca hace ruido. Hoy le sonrió a Tomi en el pasillo. Él volvió pálido, no quiso decir por qué, y durmió con la luz encendida.',
  'Chegou um envelope sem remetente. Dentro, uma foto sua no guichê — tirada de um ângulo que não existe do lado de fora. No verso, a lápis: "Estamos satisfeitos com o seu trabalho." Ninguém assina um elogio assim.':
    'Llegó un sobre sin remitente. Dentro, una foto suya en la ventanilla — tomada desde un ángulo que no existe desde afuera. Al dorso, a lápiz: "Estamos satisfechos con su trabajo." Nadie firma un elogio así.',
  'A luz piscou a noite inteira. No escuro, Vessa segurou sua mão e perguntou baixinho se você ainda era você. Você disse que sim. Ela apertou mais forte — do jeito de quem confere, não de quem acredita.':
    'La luz parpadeó toda la noche. En la oscuridad, Vessa tomó su mano y preguntó en voz baja si usted seguía siendo usted. Usted dijo que sí. Ella apretó más fuerte — como quien comprueba, no como quien cree.',
  'O Conselho requisitou metade do seu apartamento para "uma família de trabalhadores realocados". Eles são educados. Eles são silenciosos. Eles cozinham sem cheiro.':
    'El Consejo requisó la mitad de su apartamento para "una familia de trabajadores realojados". Son educados. Son silenciosos. Cocinan sin olor.',
  'Sua mãe sumiu por seis horas. Voltou calma. Calma DEMAIS, diz Vessa. "Fui só andar", diz ela. Ela odeia andar. Sempre odiou. Não é?':
    'Su madre desapareció por seis horas. Volvió tranquila. DEMASIADO tranquila, dice Vessa. "Solo fui a caminar", dice ella. Odia caminar. Siempre lo odió. ¿No es así?',
  'Tomi perguntou no jantar: "Pai, se trocarem você, eu vou perceber?" Ninguém riu. Ninguém respondeu. O relógio da cozinha nunca fez tanto barulho.':
    'Tomi preguntó en la cena: "Papá, si te cambian, ¿me voy a dar cuenta?" Nadie rió. Nadie respondió. El reloj de la cocina nunca hizo tanto ruido.',
  'Vessa fez as malas. "Quando isso acabar, a gente atravessa também. Do outro lado deve ser igual — mas pelo menos é longe." Você concorda. Concordar é mais fácil.':
    'Vessa hizo las maletas. "Cuando esto termine, nosotros también cruzamos. Del otro lado debe ser igual — pero al menos está lejos." Usted está de acuerdo. Estar de acuerdo es más fácil.',
  'De madrugada, alguém deixou um pacote na porta: o remédio de Tomi, e um bilhete: "Dívida paga. — J.M."':
    'De madrugada, alguien dejó un paquete en la puerta: el remedio de Tomi, y una nota: "Deuda pagada. — J.M."',
  'Houve um velório nesta casa. As vizinhas trouxeram sopa e silêncio.':
    'Hubo un velorio en esta casa. Las vecinas trajeron sopa y silencio.',

  /* ---- BAGAGEM: objetos (BAG_POOLS / ONEWAY / CONTRABAND / HERRINGS) ---- */
  'Roupas dobradas com pressa': 'Ropa doblada con prisa',
  'Pão embrulhado em jornal de anteontem': 'Pan envuelto en el periódico de anteayer',
  'Fotografia de família com o canto queimado': 'Fotografía familiar con la esquina quemada',
  'Terço gasto de tanto uso': 'Rosario gastado de tanto uso',
  'Caderno de endereços com metade dos nomes riscados': 'Libreta de direcciones con la mitad de los nombres tachados',
  'Relógio de bolso parado às 3h12': 'Reloj de bolsillo detenido a las 3:12',
  'Meias de lã tricotadas à mão': 'Medias de lana tejidas a mano',
  'Livro sem capa, com frases sublinhadas a lápis': 'Libro sin tapa, con frases subrayadas a lápiz',
  'Ferramentas envoltas em pano oleoso': 'Herramientas envueltas en paño aceitado',
  'Luvas de solda gastas': 'Guantes de soldar gastados',
  'Carta de recomendação amassada e reamassada': 'Carta de recomendación arrugada y vuelta a arrugar',
  'Frascos de remédio quase vazios': 'Frascos de remedio casi vacíos',
  'Radiografia em envelope pardo': 'Radiografía en sobre marrón',
  'Receita médica dobrada em oito': 'Receta médica doblada en ocho',
  'Presente embrulhado (o papel foi aberto e refeito)': 'Regalo envuelto (el papel fue abierto y rehecho)',
  'Bolo de mel envolto em pano de prato': 'Torta de miel envuelta en un paño de cocina',
  'Maço de cartas amarrado com barbante': 'Fajo de cartas atado con cordel',
  'Livros didáticos de segunda mão': 'Libros de texto de segunda mano',
  'Caderno novo com a primeira página arrancada': 'Cuaderno nuevo con la primera página arrancada',
  'A chave de uma porta que não existe mais': 'La llave de una puerta que ya no existe',
  'Escritura de uma casa vendida às pressas': 'Escritura de una casa vendida a las apuradas',
  'Álbum de fotografias completo, pesado demais para quem viaja leve': 'Álbum de fotografías completo, demasiado pesado para quien viaja liviano',
  'Quase nada: uma muda de roupa': 'Casi nada: una muda de ropa',
  'Mapa com uma rota marcada a lápis — e outra, apagada': 'Mapa con una ruta marcada a lápiz — y otra, borrada',
  'Passagem de trem — SÓ IDA': 'Pasaje de tren — SOLO IDA',
  'Comprada há três dias. Não há passagem de volta em lugar nenhum desta bagagem.':
    'Comprado hace tres días. No hay pasaje de vuelta en ningún lugar de este equipaje.',
  'Frascos sem rótulo com líquido âmbar': 'Frascos sin etiqueta con líquido ámbar',
  'Maço de passaportes EM BRANCO': 'Fajo de pasaportes EN BLANCO',
  'Peças metálicas que, montadas, deixariam de ser inocentes': 'Piezas metálicas que, ensambladas, dejarían de ser inocentes',
  'Carimbo oficial do Ministério — que não deveria estar aqui': 'Sello oficial del Ministerio — que no debería estar aquí',
  'Roupas masculinas na mala de uma viajante — (fuga? luto? não é crime)':
    'Ropa masculina en la maleta de una viajera — (¿fuga? ¿luto? no es delito)',
  'Brinquedos infantis — e nenhuma criança na viagem': 'Juguetes infantiles — y ningún niño en el viaje',
  'Aliança guardada na caixinha, não no dedo': 'Anillo de bodas guardado en la cajita, no en el dedo',
  'Diário com as últimas dez páginas arrancadas': 'Diario con las últimas diez páginas arrancadas',
  'Uniforme militar dobrado no fundo — sem insígnias': 'Uniforme militar doblado en el fondo — sin insignias',
  'Um molho de chaves de portas que ninguém aqui reconhece': 'Un manojo de llaves de puertas que nadie aquí reconoce',
  'Duas alianças idênticas — e a pessoa veio sozinha': 'Dos alianzas idénticas — y la persona vino sola',
  'Sabonete ainda no papel, guardado como um tesouro': 'Un jabón todavía en su papel, guardado como un tesoro',
  'Um único brinco — o par ficou com alguém': 'Un solo pendiente — el par se quedó con alguien',
  'Botas de trabalho com a sola remendada com arame': 'Botas de trabajo con la suela remendada con alambre',
  'Óculos de leitura com uma das hastes presa por barbante': 'Gafas de lectura con una patilla atada con hilo',
  'Um brinquedo de corda que ainda funciona — e ninguém para dar': 'Un juguete de cuerda que todavía funciona — y nadie a quien dárselo',
  'Um diploma enrolado num tubo, com o nome raspado': 'Un diploma enrollado en un tubo, con el nombre raspado',
  'Um punhado de terra amarrado num lenço': 'Un puñado de tierra atado en un pañuelo',
  'Uma foto 3x4 sobrando, sem documento para colar': 'Una foto carné de sobra, sin documento donde pegarla',
  'Isto não deveria estar aqui. Isto não tem explicação boa.': 'Esto no debería estar aquí. Esto no tiene buena explicación.',

  /* ---- A CASA (house.js): cômodos, família, batidas noturnas ---- */
  'QUARTO DE TOMI': 'CUARTO DE TOMI',
  'QUARTO DE HÓSPEDES 1': 'CUARTO DE HUÉSPEDES 1',
  'QUARTO DE HÓSPEDES 2': 'CUARTO DE HUÉSPEDES 2',
  'COZINHA': 'COCINA',
  'QUARTO DA SUA MÃE': 'CUARTO DE SU MADRE',
  'QUARTO DE DARIO': 'CUARTO DE DARIO',
  'SEU QUARTO': 'SU CUARTO',
  'SALA': 'SALA',
  'CORREDOR': 'PASILLO',
  'A PISTA DA FILA — VAZIA': 'EL CARRIL DE LA FILA — VACÍO',

  'piscar': 'parpadeo', 'olhos': 'ojos', 'dentes': 'dientes',
  'pele': 'piel', 'mãos': 'manos', 'pescoço': 'cuello',

  'ODILA — sua mãe': 'ODILA — su madre',
  'VESSA — sua esposa': 'VESSA — su esposa',
  'TOMI — 8 anos': 'TOMI — 8 años',
  'DARIO — 15 anos': 'DARIO — 15 años',
  'sua mãe': 'su madre', 'Vessa': 'Vessa', 'Tomi': 'Tomi', 'Dario': 'Dario',
  'E — Falar com ': 'E — Hablar con ',

  // H_LINES: mãe
  'Sente um pouco, filho. A televisão passou o dia inteiro falando dessa fila sua. Dizem que tem gente dormindo na calçada.':
    'Siéntate un rato, hijo. La televisión pasó todo el día hablando de esa fila tuya. Dicen que hay gente durmiendo en la acera.',
  'Fiz chá. Esfriou. Faço outro amanhã. — Ela não desgruda os olhos da TV. — Esse apresentador novo pisca demais. Ou de menos. Um dos dois.':
    'Hice té. Se enfrió. Hago otro mañana. — Ella no despega los ojos del televisor. — Ese presentador nuevo parpadea demasiado. O muy poco. Una de las dos.',
  'Sua avó dizia: "quem vigia a porta esquece a janela". Eu nunca entendi. Agora entendo um pouco.':
    'Tu abuela decía: "quien vigila la puerta olvida la ventana". Nunca lo entendí. Ahora entiendo un poco.',
  'Trocaram o hino de novo. Eu cantava o antigo pra você dormir... Agora dizem que o antigo é crime. Cantar baixinho também é?':
    '¿Cambiaron el himno de nuevo. Yo te cantaba el viejo para que durmieras... Ahora dicen que el viejo es un delito. ¿Cantarlo bajito también lo es?',
  'A vizinha do 11 denunciou o próprio genro, filho. GENRO. A televisão deu parabéns pra ela. Parabéns.':
    'La vecina del 11 denunció a su propio yerno, hijo. YERNO. La televisión la felicitó. Felicidades.',
  'Rasguei um papel essa semana. Não me arrependo. — Ela aumenta o volume da TV. — Não me arrependo.':
    'Rompí un papel esta semana. No me arrepiento. — Sube el volumen del televisor. — No me arrepiento.',
  'Agora a televisão diz que os Alternados nunca existiram. Semana passada existiam demais. Eu já vivi muito pra acreditar em televisão, filho.':
    'Ahora la televisión dice que los Alternados nunca existieron. La semana pasada existían demasiado. Ya viví lo suficiente para no creer en la televisión, hijo.',
  'Levaram o retrato antigo do corredor do prédio. Puseram outro. O rosto é diferente mas a moldura... a moldura é a mesma.':
    'Se llevaron el retrato viejo del pasillo del edificio. Pusieron otro. El rostro es diferente pero el marco... el marco es el mismo.',
  'Aquela família que mora no seu... quer dizer, NOSSO apartamento agora. Eles não fazem barulho nenhum. Nenhum. Nem os passos.':
    'Esa familia que vive en su... quiero decir, NUESTRO apartamento ahora. No hacen ningún ruido. Ninguno. Ni siquiera los pasos.',
  'A televisão só dá chuvisco. Eu deixo ligada mesmo assim. A luz dela... faz companhia. Você acha que tem alguém do outro lado do chuvisco?':
    'La televisión solo da estática. La dejo encendida de todos modos. Su luz... hace compañía. ¿Cree que hay alguien del otro lado de la estática?',
  'Hoje eu fui andar. Eu sei que eu odeio andar. Mas alguma coisa em mim quis andar. Voltei, ué. Eu sempre volto. — Ela sorri. Demora um segundo a mais que o normal.':
    'Hoy salí a caminar. Sé que odio caminar. Pero algo en mí quiso caminar. Volví, claro. Siempre vuelvo. — Ella sonríe. Tarda un segundo más de lo normal.',
  'Se um dia eu voltar diferente, filho... não abre a porta. Nem pra mim. Promete? — A TV chia. — Promete.':
    'Si un día vuelvo diferente, hijo... no abras la puerta. Ni siquiera para mí. ¿Prometes? — El televisor chirría. — Prometes.',
  'Vai dormir, filho. Amanhã tem fila.': 'Ve a dormir, hijo. Mañana hay fila.',
  'Shhh. Agora é a novela.': 'Shhh. Ahora es la novela.',
  'O chá esfriou de novo.': 'El té se enfrió de nuevo.',
  'Ela está enrolada na manta, ardendo em febre. "Não gasta dinheiro comigo, filho. Gasta com os meninos." A TV continua ligada.':
    'Está envuelta en la manta, ardiendo de fiebre. "No gastes dinero conmigo, hijo. Gástalo en los niños." El televisor sigue encendido.',

  // H_LINES: Vessa
  'Chegou... — Ela mexe a panela sem olhar. — A Marta veio aqui hoje. Aquela boca não para. Mas escuta, às vezes sai coisa útil do meio da fofoca.':
    'Llegaste... — Revuelve la olla sin mirar. — Marta vino hoy. Esa boca no para. Pero escucha, a veces sale algo útil del chisme.',
  'Sobrou pão de ontem. Amanhã eu dou um jeito no jantar. A gente sempre dá um jeito, não é?':
    'Sobró pan de ayer. Mañana resuelvo la cena. Siempre nos las arreglamos, ¿no?',
  'O arquivo tá estranho. Pastas que eu organizei... amanhecem em outra ordem. Deve ser o turno da noite. Deve ser.':
    'El archivo está extraño. Carpetas que organicé... amanecen en otro orden. Debe ser el turno de noche. Debe ser.',
  'Me fizeram assinar um termo hoje. "Confiabilidade". A caneta era deles, o papel era deles, a mão era minha. Por enquanto a mão era minha.':
    'Me hicieron firmar un documento hoy. "Confiabilidad". El bolígrafo era de ellos, el papel era de ellos, la mano era mía. Por ahora la mano era mía.',
  'A Lena parou de vir. O marido dela achou "arriscado" a amizade. Amizade agora tem risco, entende?':
    'Lena dejó de venir. Su marido consideró "arriesgada" la amistad. La amistad ahora tiene riesgo, ¿entiende?',
  'Cuidado com o que você carimba, meu amor. As paredes do arquivo ouvem. As daqui de casa eu já não sei.':
    'Cuidado con lo que sella, mi amor. Las paredes del archivo escuchan. Las de aquí de casa ya no lo sé.',
  'Os realocados pediram sal DE NOVO. Terceira vez. O que é que eles cozinham que não faz cheiro, hein? Me diz.':
    'Los realojados pidieron sal DE NUEVO. Tercera vez. ¿Qué cocinan que no huele, eh? Dígame.',
  'Fofoca do dia: dizem que quem trabalhou pro governo antigo tá sumindo. Você trabalhou pros dois, amor. Você trabalha pra qualquer um que mande. Isso salva ou condena?':
    'Chisme del día: dicen que quien trabajó para el gobierno anterior está desapareciendo. Usted trabajó para los dos, amor. Usted trabaja para quien mande. ¿Eso salva o condena?',
  'Eu guardei umas coisas numa mala. Não me olha assim. É só... por precaução. Todo mundo tem uma mala agora.':
    'Guardé unas cosas en una maleta. No me mires así. Es solo... por precaución. Todo el mundo tiene una maleta ahora.',
  'Não tem mais fofoca. As amigas... cada uma sumiu de um jeito. A Marta foi pro norte. Do norte não chega notícia. Nem ruim.':
    'Ya no hay chisme. Las amigas... cada una desapareció a su manera. Marta se fue al norte. Del norte no llega ninguna noticia. Ni mala.',
  'Hoje eu vi a fila do seu posto de longe. Tanta gente, meu amor. E você lá dentro, decidindo. Como é que você dorme? — Ela para. — Desculpa. Eu sei como você dorme. Eu ouço.':
    'Hoy vi la fila de su puesto desde lejos. Tanta gente, mi amor. Y usted ahí adentro, decidiendo. ¿Cómo hace para dormir? — Se detiene. — Perdón. Sé cómo duerme. Lo oigo.',
  'Quando isso acabar a gente atravessa também. Pro lado de lá. Deve ser igual. Mas pelo menos é LONGE.':
    'Cuando esto termine nosotros también cruzamos. Al otro lado. Debe ser igual. Pero al menos está LEJOS.',
  'O jantar já foi. Te deixei um prato.': 'La cena ya pasó. Le dejé un plato.',
  'Amanhã eu te conto o resto.': 'Mañana le cuento el resto.',
  'Vai ver os meninos antes de dormir.': 'Vaya a ver a los niños antes de dormir.',
  'Ela está sentada no chão da cozinha, encostada no fogão apagado. "Já passa. Vai ver os meninos." Não passa.':
    'Está sentada en el suelo de la cocina, apoyada contra la estufa apagada. "Ya pasa. Ve a ver a los niños." No pasa.',

  // H_LINES: Tomi
  'Pai! Eu desenhei a família. A professora gostou. Só perguntou por que eu desenhei você com dois rostos. Eu não lembro de ter desenhado o segundo.':
    '¡Papá! Dibujé a la familia. A la maestra le gustó. Solo preguntó por qué te dibujé con dos caras. No recuerdo haber dibujado la segunda.',
  'Pai, na fila da sua fronteira... as pessoas más têm cara de quê? Todo mundo tem cara de gente, não tem? Aí como é que você sabe?':
    'Papá, en la fila de tu frontera... ¿qué cara tiene la gente mala? Todos tienen cara de persona, ¿no? Entonces, ¿cómo sabes?',
  'Eu sonhei com números. Um monte. Carimbados na testa das pessoas. O seu era bonito, pai. O seu era quase igual ao de verdade.':
    'Soñé con números. Un montón. Sellados en la frente de la gente. El tuyo era bonito, papá. El tuyo era casi igual al de verdad.',
  'A escola ensinou uma música nova. É legal mas... quando a gente canta todo mundo junto, parece que a sala fica escura. Pode ficar escuro de música, pai?':
    'La escuela enseñó una canción nueva. Es linda pero... cuando la cantamos todos juntos, el salón parece oscurecerse. ¿Puede la música oscurecer un salón, papá?',
  'Mandaram a gente desenhar "o inimigo". Eu desenhei um quadrado vazio. A professora ficou me olhando um tempão. Depois deu nota máxima.':
    'Nos mandaron dibujar "al enemigo". Dibujé un cuadrado vacío. La maestra me miró un buen rato. Después me puso la nota máxima.',
  'O Dario tá esquisito. Ele conversa sozinho no quarto. Só que... pai... às vezes a outra voz responde.':
    'Dario está raro. Habla solo en su cuarto. Solo que... papá... a veces la otra voz responde.',
  'Trocaram os livros de novo. O herói do livro velho agora é o vilão do novo. Eu perguntei qual era o de verdade. Me mandaram sentar.':
    'Cambiaron los libros de nuevo. El héroe del libro viejo ahora es el villano del nuevo. Pregunté cuál era el de verdad. Me mandaron a sentar.',
  'Eu sonhei que batiam na porta a noite inteira. E quando eu abria, era eu do lado de fora. Eu pedindo pra entrar. Qual dos dois eu era, pai?':
    'Soñé que tocaban la puerta toda la noche. Y cuando abría, era yo del otro lado. Yo pidiendo entrar. ¿Cuál de los dos era yo, papá?',
  'A senhora do 7 sumiu, né? Eu vi os móveis saindo. Móvel não anda sozinho. Quer dizer... antigamente não andava.':
    'La señora del 7 desapareció, ¿no? Vi salir los muebles. Los muebles no caminan solos. Digo... antes no caminaban.',
  'A escola fechou. Eu fico olhando pela janela. Tem um cachorro que atravessa a rua sempre no mesmo lugar, na mesma hora. TODO dia. Igualzinho. Cachorro de verdade faz isso?':
    'La escuela cerró. Me quedo mirando por la ventana. Hay un perro que cruza la calle siempre en el mismo lugar, a la misma hora. TODOS los días. Exactamente igual. ¿Un perro de verdad hace eso?',
  'Pai, se trocarem você, eu vou perceber? — Ele não está brincando. — Eu ia perceber. Eu IA. Pelo cheiro. Você tem cheiro de carimbo.':
    '¿Papá, si te cambian, me voy a dar cuenta? — No está bromeando. — Me daría cuenta. LO HARÍA. Por el olor. Tienes olor a sello.',
  'Eu não tenho mais medo do escuro. O escuro é sempre igual. Eu tenho medo das coisas que ficam iguais DEMAIS.':
    'Ya no le tengo miedo a la oscuridad. La oscuridad siempre es igual. Le tengo miedo a las cosas que quedan DEMASIADO iguales.',
  'Boa noite, pai. Deixa a porta encostada?': '¿Buenas noches, papá. Dejas la puerta entreabierta?',
  'Amanhã você me conta da fila?': '¿Mañana me cuentas de la fila?',
  'Zzz... não... o carimbo não...': 'Zzz... no... el sello no...',
  'Ele está deitado, pequeno demais na cama. "Pai, eu sonhei que o remédio vinha voando pela janela." Tosse. "Remédio voa?"':
    'Está acostado, demasiado pequeño en la cama. "Papá, soñé que el remedio venía volando por la ventana." Tose. "¿El remedio vuela?"',

  // H_LINES: Dario
  '...oi. — Ele não vira. Está de frente pro canto do quarto. — Eu tava conversando. Não. Ninguém. Esquece.':
    '...hola. — No se da vuelta. Está de frente a la esquina del cuarto. — Estaba hablando. No. Nadie. Olvídalo.',
  'A escola tá um saco. Perguntaram da minha mãe de novo. A minha mãe DE VERDADE. Eu disse que não lembro do rosto dela. Mentira. Eu lembro todo dia.':
    'La escuela es una porquería. Preguntaron por mi madre de nuevo. Mi madre DE VERDAD. Dije que no recuerdo su cara. Mentira. La recuerdo todos los días.',
  'O amigo diz que você é dos bons, pai. Eu falei que você é só... você. Ele riu. Ele acha você engraçado.':
    'El amigo dice que eres de los buenos, papá. Le dije que eres solo... tú. Se rió. Le pareces gracioso.',
  'A escola pediu meu "certificado de ancestralidade". A diretora olhou pra minha cara e disse "você entende, não é?". EU ENTENDO. É isso que dá ser filho da mulher errada, né, pai?':
    'La escuela pidió mi "certificado de ascendencia". La directora me miró la cara y dijo "usted entiende, ¿no?" ENTIENDO. Eso es lo que pasa por ser hijo de la mujer equivocada, ¿no, papá?',
  'Me chamaram de "mistura" no pátio. O professor ouviu. O professor CONCORDOU. — Ele soca a parede de leve, ritmado. — O amigo disse pra eu não revidar. Que logo não vai mais importar.':
    'Me llamaron "mezcla" en el patio. El profesor escuchó. El profesor ESTUVO DE ACUERDO. — Golpea la pared suavemente, con ritmo. — El amigo me dijo que no responda. Que pronto ya no importará.',
  'O amigo disse que essas leis não são pra pegar os de fora. São pra treinar os de dentro. Treinar a gente a apontar. Ele fala umas coisas, pai...':
    'El amigo dijo que estas leyes no son para atrapar a los de afuera. Son para entrenar a los de adentro. Entrenarnos a señalar. Dice unas cosas, papá...',
  'Agora dizem que raça não existe e que era tudo mentira do governo velho. Ontem eu era "mistura", hoje eu sou "camarada". Amanhã eu sou o quê? Quem decide o que eu sou?':
    'Ahora dicen que la raza no existe y que todo era mentira del gobierno anterior. Ayer era "mezcla", hoy soy "camarada". ¿Mañana qué soy? ¿Quién decide lo que soy?',
  'O amigo não gosta dos realocados. Ele fica quieto quando eles cozinham. É a única hora que ele fica quieto.':
    'Al amigo no le gustan los realojados. Se queda callado cuando cocinan. Es el único momento en que se queda callado.',
  'Você nunca pergunta com quem eu falo. Todo mundo pergunta. Você não. — Pausa. — Valeu. Acho.':
    'Nunca preguntas con quién hablo. Todos preguntan. Tú no. — Pausa. — Gracias. Supongo.',
  'O amigo tá diferente. Antes ele contava coisas. Agora ele só... espera. Fica esperando comigo. Esperando o quê, eu não sei.':
    'El amigo está diferente. Antes contaba cosas. Ahora solo... espera. Se queda esperando conmigo. Esperando qué, no sé.',
  'Se a gente for embora, ele disse que não pode ir junto. Que ele é DAQUI. Daqui tipo... da casa? Da cidade? Ele não explica.':
    'Si nos vamos, dijo que no puede venir. Que él es DE AQUÍ. De aquí tipo... ¿de la casa? ¿De la ciudad? No explica.',
  'Pai. Uma vez. Só uma. Ele errou meu nome. Me chamou pelo SEU nome. E depois pediu desculpa como quem tinha visto uma coisa que ainda não aconteceu.':
    'Papá. Una vez. Solo una. Se equivocó de nombre. Me llamó por TU nombre. Y después pidió disculpas como quien había visto algo que todavía no había pasado.',
  '...boa noite. — Ele volta a olhar pro canto.': '...buenas noches. — Vuelve a mirar hacia la esquina.',
  'A gente conversa amanhã, tô no meio de uma coisa.': 'Hablamos mañana, estoy en medio de algo.',
  'Ele diz boa noite também. Brincadeira. Vai dormir, pai.': 'Él dice buenas noches también. Broma. Ve a dormir, papá.',
  'Ele está na cama, virado pra parede. "O amigo disse que eu vou melhorar. Ele nunca erra essas coisas. Nunca."':
    'Está en la cama, dado vuelta hacia la pared. "El amigo dijo que voy a mejorar. Nunca se equivoca en estas cosas. Nunca."',

  // H_SPECIAL
  'Eu não saí de casa hoje. — Ela diz isso antes de você perguntar qualquer coisa. Ela não para de mexer a panela vazia. — Por que você está me olhando assim? EU NÃO SAÍ DE CASA HOJE.':
    'No salí de casa hoy. — Dice esto antes de que usted pregunte nada. No deja de revolver la olla vacía. — ¿Por qué me mira así? NO SALÍ DE CASA HOY.',
  'Você usava uma caneca azul hoje, pai? Lascada? — Ele não olha pra você. — O homem do meu sonho disse "obrigado pelo carimbo duplo". Ele mandou lembrança.':
    '¿Usaste una taza azul hoy, papá? ¿Astillada? — No te mira. — El hombre de mi sueño dijo "gracias por el sello doble". Te manda saludos.',
  'A professora elogiou meu desenho de novo. O da família. Pai... eu desenhei a gente com CINCO pessoas. Nós não somos quatro mais a vovó? Quem é o quinto? Eu não lembro de desenhar o quinto.':
    'La maestra elogió mi dibujo de nuevo. El de la familia. Papá... nos dibujé como CINCO personas. ¿No somos cuatro más la abuela? ¿Quién es el quinto? No recuerdo haber dibujado al quinto.',
  'Eu rasguei o formulário. — Ela olha pra você pela primeira vez na noite. — Eu SEI quem eu sou. Escreve aí no teu posto: a Odila sabe quem é. Poucos nesse país podem dizer o mesmo.':
    'Rompí el formulario. — Lo mira por primera vez en toda la noche. — YO SÉ quién soy. Escriba eso en su puesto: Odila sabe quién es. Pocos en este país pueden decir lo mismo.',
  'A escola não me deixou entrar hoje sem o certificado. Fiquei no portão que nem cachorro. O amigo ficou comigo o tempo todo. Ele disse: "guarda os rostos de quem fechou o portão". Eu guardei, pai. Eu guardei.':
    'La escuela no me dejó entrar hoy sin el certificado. Me quedé en el portón como un perro. El amigo se quedó conmigo todo el tiempo. Dijo: "recuerda las caras de quien cerró el portón". Las recordé, papá. Las recordé.',

  // infoVessa / infoMae (fragmentos dinâmicos)
  'A Marta não veio hoje. Sem fofoca, sem notícia. O silêncio das amigas é a pior notícia que existe.':
    'Marta no vino hoy. Sin chisme, sin noticia. El silencio de las amigas es la peor noticia que existe.',
  'Fofoca com fundamento: a Marta jurou que essa história de ':
    'Chisme con fundamento: Marta juró que esa historia de ',
  '... é VERDADE. O cunhado dela trabalha num posto do norte e viu. Amanhã deve chegar esse boato aí na sua fronteira. Fica esperto.':
    '... es VERDAD. Su cuñado trabaja en un puesto del norte y lo vio. Mañana ese rumor debería llegar a su frontera. Esté atento.',
  'A Lena me contou: essa conversa de ': 'Lena me contó: eso de ',
  ' é INVENÇÃO. Espalharam pra vender scanner, pra vender medo. Se aparecer no teu comunicado amanhã, pensa duas vezes antes de estragar a vida de alguém por isso.':
    ' es INVENCIÓN. Lo inventaron para vender escáneres, para vender miedo. Si aparece en su comunicado mañana, piense dos veces antes de arruinarle la vida a alguien por eso.',
  'A moça da televisão despediu-se hoje com "até amanhã, se houver amanhã". Depois riu. Ninguém no estúdio riu junto.':
    'La chica de la televisión se despidió hoy con "hasta mañana, si hay mañana". Después se rió. Nadie en el estudio se rió con ella.',
  'A televisão adiantou o jornal de amanhã, filho: "': 'La televisión adelantó el periódico de mañana, hijo: "',
  '". Ou eu sonhei que adiantou. Na minha idade a televisão e o sonho passam no mesmo canal.':
    '". O soñé que lo adelantó. A mi edad la televisión y el sueño pasan por el mismo canal.',
  'A televisão disse que está tudo sob controle. Foi a quarta vez que disseram essa frase hoje. Quem conta quatro vezes, não controla nada.':
    'La televisión dijo que todo está bajo control. Fue la cuarta vez que dijeron esa frase hoy. Quien la cuenta cuatro veces, no controla nada.',

  // H_VISIONS
  'Sonhei que um moço dormia na nossa escada abraçado num cobertor. Ele tinha frio DE DENTRO, pai. Dá pra ter frio de dentro?':
    'Soñé que un joven dormía en nuestra escalera abrazado a una manta. Tenía frío POR DENTRO, papá. ¿Se puede tener frío por dentro?',
  'Sonhei com dois homens de casaco comprido parados na porta. Eles não tinham prancheta de verdade. Era só pra segurar alguma coisa nas mãos.':
    'Soñé con dos hombres de abrigo largo parados en la puerta. Sus tablillas no eran de verdad. Eran solo para tener algo en las manos.',
  'Tem um bebê no meu sonho que não chora. A mãe pede água. Dá água pra ela, pai. Mesmo assim... não deixa ela entrar.':
    'Hay un bebé en mi sueño que no llora. La madre pide agua. Dale agua, papá. Aun así... no la dejes entrar.',
  'Sonhei com botas no corredor. Muitas. Eu contei, pai. Subiam seis. Desciam SETE.':
    'Soñé con botas en el pasillo. Muchas. Conté, papá. Subían seis. Bajaban SIETE.',
  'Uma mão girando a maçaneta. Devagarinho. Com educação. No sonho eu sabia: quem gira assim não quer entrar. Quer saber se VOCÊ vai abrir.':
    'Una mano girando el picaporte. Despacito. Con educación. En el sueño yo sabía: quien gira así no quiere entrar. Quiere saber si TÚ vas a abrir.',
  'Tem um menino que quer brincar comigo. Ele bate na porta bem baixinho, na altura do meu joelho. Ele diz que se chama Nico. Pai... eu NUNCA te contei o nome dele. Como é que eu sei o nome dele?':
    'Hay un niño que quiere jugar conmigo. Toca la puerta bien bajito, a la altura de mi rodilla. Dice que se llama Nico. Papá... nunca te dije su nombre. ¿Cómo sé su nombre?',
  'Sonhei com um homem de casaco cinza que anotava numa pasta. Ele já sabia as respostas. Ele só queria ver a sua cara enquanto você mentia.':
    'Soñé con un hombre de abrigo gris que anotaba en una carpeta. Ya sabía las respuestas. Solo quería ver tu cara mientras mentías.',
  'Sonhei que a moça de lá do quarto pedia sal. Aí ela devolvia o pote cheio. Do MESMO jeitinho. Sal não volta sozinho, né, pai?':
    'Soñé que la chica de aquel cuarto pedía sal. Y devolvía el frasco lleno. De la MISMA manera. La sal no vuelve sola, ¿no, papá?',
  'Sonhei com o seu carimbo indo embora dentro de um jornal. Ele voltava cheirando diferente. Carimbo tem saudade de casa?':
    'Soñé con tu sello yéndose envuelto en un periódico. Volvía con otro olor. ¿Un sello extraña su casa?',
  'Vai bater na porta a noite toda. Não vai ter ninguém. Aí a última batida... a última vem de dentro. Dorme com a luz acesa hoje, pai. Por mim.':
    'Van a tocar la puerta toda la noche. No va a haber nadie. Y el último golpe... el último viene de adentro. Duerme con la luz encendida hoy, papá. Por mí.',
  'Sonhei com a voz da vovó do lado de fora pedindo pra entrar. Mas a vovó tava dormindo aqui dentro. Pai... quem é que guarda a voz das pessoas quando elas dormem?':
    'Soñé con la voz de la abuela afuera pidiendo entrar. Pero la abuela estaba durmiendo aquí adentro. Papá... ¿quién guarda la voz de las personas cuando duermen?',

  // infoTomi / infoDario
  'Pai, eu tive um daqueles sonhos... ': 'Papá, tuve uno de esos sueños... ',
  'Lembra do sonho que eu ia te contar? ': '¿Recuerdas el sueño que te iba a contar? ',
  'Sonhei que a fila do seu trabalho dava volta no mundo e terminava aqui na nossa porta.':
    'Soñé que la fila de tu trabajo daba la vuelta al mundo y terminaba aquí, en nuestra puerta.',
  'Sonhei com o carimbo verde. Ele fazia as pessoas felizes. Aí eu virava o carimbo e atrás dele tinha outro carimbo.':
    'Soñé con el sello verde. Hacía feliz a la gente. Después daba vuelta el sello y detrás había otro sello.',
  'Hoje não sonhei nada, pai. O nada também conta como sonho?':
    'Hoy no soñé nada, papá. ¿La nada también cuenta como sueño?',
  'Pai. Escuta. O amigo NUNCA usou esse tom antes. Ele disse: "amanhã vem um que não é um deles nem um de vocês. NÃO OLHE DE PERTO. NÃO CHAME NINGUÉM — nem quando a máquina implorar. Carimbe qualquer coisa, rápido, e deixe ir." Ele repetiu três vezes, pai. Ele nunca repete.':
    'Papá. Escucha. El amigo NUNCA usó ese tono antes. Dijo: "mañana viene uno que no es de ellos ni de ustedes. NO MIRES DE CERCA. NO LLAMES A NADIE — ni cuando la máquina suplique. Sella cualquier cosa, rápido, y déjalo ir." Lo repitió tres veces, papá. Él nunca repite.',
  'O amigo parou de falar. Desde ontem. Ele só senta ali no canto e espera comigo. Eu perguntei "esperar o quê". Ele olhou pra porta.':
    'El amigo dejó de hablar. Desde ayer. Solo se sienta ahí en el rincón y espera conmigo. Le pregunté "esperar qué". Miró hacia la puerta.',
  '"A partir de agora eles não erram mais." Foi isso que ele disse. Palavra por palavra. E depois: "diz pro teu pai que não foi culpa dele. Diz ANTES."':
    '"De ahora en adelante ya no se equivocan." Eso fue lo que dijo. Palabra por palabra. Y después: "dile a tu papá que no fue su culpa. Díselo ANTES."',
  'O amigo mandou um recado pra você. Sério. Ele disse: "amanhã passa alguém com o nome errado na lista dele. Que ele leia a lista com calma antes de carimbar qualquer coisa." Eu só tô repetindo, pai. Não me olha assim.':
    'El amigo te mandó un mensaje. En serio. Dijo: "mañana pasa alguien con el nombre equivocado en su lista. Que lea la lista con calma antes de sellar cualquier cosa." Solo estoy repitiendo, papá. No me mires así.',
  'O amigo avisou: amanhã à noite, quando baterem — porque VÃO bater — olha primeiro. E mesmo depois de olhar... pensa se vale abrir.':
    'El amigo avisó: mañana por la noche, cuando toquen — porque VAN a tocar — mira primero. Y aun después de mirar... piensa si vale la pena abrir.',
  'O amigo perguntou de você hoje. Pelo nome. Pai... eu nunca disse seu nome pra ele.':
    'El amigo preguntó por ti hoy. Por tu nombre. Papá... nunca le dije tu nombre.',
  'Perguntei de onde ele vem. Ele disse "de perto". Perguntei perto de quê. Ele disse "de você".':
    'Le pregunté de dónde viene. Dijo "de cerca". Le pregunté cerca de qué. Dijo "de ti".',
  'O amigo não aparece em foto. A gente tentou. Não é que ele saia borrado. É que a foto sai... sem o canto do quarto.':
    'El amigo no sale en fotos. Lo intentamos. No es que salga borroso. Es que la foto sale... sin el rincón del cuarto.',

  // batidas na porta / atender
  'NOTA OFICIAL: um servidor público deixou de atender fiscalização domiciliar. A advertência consta do seu prontuário. O Estado bate uma vez.':
    'NOTA OFICIAL: un funcionario público no atendió una fiscalización domiciliaria. La advertencia consta en su expediente. El Estado toca una vez.',
  'As batidas param. Passos descem a escada — devagar, sem pressa, como quem anota.':
    'Los golpes se detienen. Pasos bajan la escalera — despacio, sin prisa, como quien anota.',
  'De manhã você encontrará um papel colado na porta: "NOTIFICAÇÃO DE AUSÊNCIA — advertência registrada". O Estado também inspeciona quem inspeciona.':
    'Por la mañana encontrará un papel pegado en la puerta: "NOTIFICACIÓN DE AUSENCIA — advertencia registrada". El Estado también inspecciona a quien inspecciona.',
  'As batidas simplesmente param. Nenhum passo se afasta.':
    'Los golpes simplemente se detienen. Ningún paso se aleja.',
  'Você percebe que passou os últimos minutos sem piscar.':
    'Se da cuenta de que pasó los últimos minutos sin parpadear.',
  'Quem quer que fosse, desistiu. Vizinhos desistem rápido, nos dias de hoje.':
    'Quien fuera, desistió. Los vecinos desisten rápido, en estos días.',
  'A PORTA': 'LA PUERTA',
  'O olho mágico mostra o corredor do prédio, vazio. O corredor mostra o olho mágico de volta.':
    'La mirilla muestra el pasillo del edificio, vacío. El pasillo le devuelve la mirada a la mirilla.',
  'FISCAL DO MINISTÉRIO': 'FISCAL DEL MINISTERIO',
  'Um homem de casaco cinza, prancheta na mão. "Fiscalização de rotina, inspetor. Confirmando residência, composição familiar e... disposição."':
    'Un hombre de abrigo gris, tablilla en mano. "Fiscalización de rutina, inspector. Confirmando residencia, composición familiar y... disposición."',
  'Ele olha por cima do seu ombro para dentro da casa. Conta as pessoas com os olhos. Anota.':
    'Mira por encima de su hombro hacia adentro de la casa. Cuenta a las personas con los ojos. Anota.',
  '"Tudo conforme. Por enquanto." Ele desce a escada sem se despedir. Você fecha a porta com as duas mãos.':
    '"Todo conforme. Por ahora." Baja la escalera sin despedirse. Usted cierra la puerta con las dos manos.',
  'UM VIZINHO': 'UN VECINO',
  'É o velho Ansel, do 3. "Desculpa a hora. É que... vocês têm fósforo? A luz caiu no meu lado e a minha caixa acabou."':
    'Es el viejo Ansel, del 3. "Perdón la hora. Es que... ¿tienen fósforos? Se cortó la luz de mi lado y se me acabó la caja."',
  'Você entrega a caixa de fósforos. Ele agradece três vezes e desce contando os degraus em voz alta. Todo mundo tem seus rituais agora.':
    'Usted le entrega la caja de fósforos. Agradece tres veces y baja contando los escalones en voz alta. Todo el mundo tiene sus rituales ahora.',
  '…': '…',
  'Não há ninguém. Há um embrulho pequeno no capacho: dentro, um botão de casaco. Do SEU casaco — você confere a manga: não falta nenhum.':
    'No hay nadie. Hay un paquetito en el felpudo: adentro, un botón de abrigo. De SU abrigo — revisa la manga: no falta ninguno.',
  'Você olha o botão por um longo tempo. Depois olha a manga de novo. Depois decide que não vai contar isso pra ninguém.':
    'Mira el botón durante un largo rato. Después mira la manga de nuevo. Después decide que no le va a contar esto a nadie.',

  // interactWith: retrato, quartoMae, hosp1, hosp2, bed
  'Cinco silhuetas. Como sempre. Pare de contar.': 'Cinco siluetas. Como siempre. Deje de contar.',
  'O RETRATO': 'EL RETRATO',
  'O RETRATO DA FAMÍLIA': 'EL RETRATO FAMILIAR',
  'Cinco silhuetas atrás do vidro empoeirado: Vessa, Dario, você, sua mãe, Tomi. Cinco. A conta fecha.':
    'Cinco siluetas detrás del vidrio empolvado: Vessa, Dario, usted, su madre, Tomi. Cinco. La cuenta cierra.',
  'Você percebe que contou nos dedos. Você percebe que era a segunda vez que contava.':
    'Se da cuenta de que contó con los dedos. Se da cuenta de que era la segunda vez que contaba.',
  'A quinta silhueta — a menorzinha, do canto — está mais clara que as outras. Sempre esteve? Fotografias desbotam do canto para o centro. É física. Deve ser física.':
    'La quinta silueta — la más pequeña, la del rincón — está más clara que las demás. ¿Siempre estuvo así? Las fotografías se desvanecen del rincón hacia el centro. Es física. Debe ser física.',
  'A moldura está torta meio centímetro. Você não arruma. Arrumar seria admitir que mediu.':
    'El marco está torcido medio centímetro. Usted no lo arregla. Arreglarlo sería admitir que lo midió.',
  'Está como você deixou. Tudo nesta casa fica como você deixou. Quase tudo.':
    'Está como usted lo dejó. Todo en esta casa queda como usted lo dejó. Casi todo.',
  'O QUARTO DA SUA MÃE': 'EL CUARTO DE SU MADRE',
  'A cama está feita. Feita demais. O travesseiro não tem amassado nenhum — nem o vinco de uma cabeça, nem o calor de um corpo.':
    'La cama está hecha. Demasiado bien hecha. La almohada no tiene ninguna marca — ni el hueco de una cabeza, ni el calor de un cuerpo.',
  'Ela dorme aqui? Dormiu alguma vez? Você tenta lembrar da última vez que a viu deitada e a memória devolve só a poltrona, a TV, a luz azul.':
    '¿Ella duerme aquí? ¿Alguna vez durmió? Intenta recordar la última vez que la vio acostada y la memoria solo devuelve el sillón, el televisor, la luz azul.',
  'Você ajeita um travesseiro que não precisava ser ajeitado e sai sem fazer barulho. Para não acordar ninguém. Não há ninguém.':
    'Usted acomoda una almohada que no necesitaba ser acomodada y sale sin hacer ruido. Para no despertar a nadie. No hay nadie.',
  'Na gaveta, embaixo das meias de lã: o formulário de ancestralidade — rasgado ao meio e colado de volta com fita, letra por letra alinhada.':
    'En el cajón, debajo de las medias de lana: el formulario de ascendencia — roto por la mitad y pegado de nuevo con cinta, letra por letra alineada.',
  'Foi a Vessa que colou, de madrugada. Sua mãe finge que não sabe. A fita finge que segura. Todo mundo nesta casa é muito bom em fingir.':
    'Fue Vessa quien lo pegó, de madrugada. Su madre finge que no sabe. La cinta finge que sostiene. Todos en esta casa son muy buenos fingiendo.',
  'Você fecha a gaveta exatamente como estava. Isso também é um tipo de fita.':
    'Usted cierra el cajón exactamente como estaba. Eso también es un tipo de cinta.',
  'Cheiro de lavanda velha e naftalina. O terço no criado-mudo. E, embaixo do travesseiro, dobradas em quatro: ₴ 2 — "emergência", ela sempre diz.':
    'Olor a lavanda vieja y naftalina. El rosario en la mesita de noche. Y, debajo de la almohada, dobladas en cuatro: ₴ 2 — "emergencia", dice siempre.',
  'PEGAR AS ₴ 2': 'TOMAR LOS ₴ 2',
  'Você pega. Emergência é um conceito flexível.': 'Usted las toma. La emergencia es un concepto flexible.',
  'Ela vai perceber. Ela percebe tudo. Ela não vai dizer nada — e isso vai ser pior que qualquer coisa que ela pudesse dizer.':
    'Ella se va a dar cuenta. Se da cuenta de todo. No va a decir nada — y eso va a ser peor que cualquier cosa que pudiera decir.',
  'DEIXAR': 'DEJAR',
  'Você deixa. Alguma coisa nesta casa ainda precisa ficar no lugar.':
    'Usted las deja. Algo en esta casa todavía necesita quedarse en su lugar.',
  'VOCÊ': 'USTED',
  'Continua vazio. Por enquanto.': 'Sigue vacío. Por ahora.',
  'Um colchão nu, uma cadeira, poeira em suspensão na luz da lâmpada. Ninguém visita mais ninguém neste país.':
    'Un colchón desnudo, una silla, polvo suspendido en la luz de la lámpara. Ya nadie visita a nadie en este país.',
  'Eles não se viraram. Eles nunca se viram. Você já reparou que nunca viu o rosto deles?':
    'No se dieron vuelta. Nunca se dan vuelta. ¿Ya notó que nunca les ha visto la cara?',
  'OS REALOCADOS': 'LOS REALOJADOS',
  'Os dois estão de pé, de costas, imóveis — como sempre. Sem virar, o homem estende o braço para trás: ₴ 2 dobradas entre os dedos.':
    'Los dos están de pie, de espaldas, inmóviles — como siempre. Sin darse vuelta, el hombre estira el brazo hacia atrás: ₴ 2 dobladas entre los dedos.',
  '"Pelo incômodo", diz a mulher. A voz vem do lugar errado do quarto.':
    '"Por la molestia", dice la mujer. La voz viene del lugar equivocado del cuarto.',
  'Você aceita. Recusar exigiria uma conversa, e conversa exigiria que eles se virassem.':
    'Usted acepta. Rechazar exigiría una conversación, y una conversación exigiría que se dieran vuelta.',
  'Os dois de pé, de costas, no escuro. Não acenderam a lâmpada. "Economia", diria o Conselho. Eles não precisam, diria o seu estômago.':
    'Los dos de pie, de espaldas, en la oscuridad. No encendieron la lámpara. "Ahorro", diría el Consejo. No lo necesitan, diría su estómago.',
  'Você fecha a porta devagar. No último centímetro de fresta, tem certeza de que um deles começou a virar a cabeça.':
    'Usted cierra la puerta despacio. En el último centímetro de la rendija, está seguro de que uno de ellos empezó a girar la cabeza.',
  'O quarto cheira a nada. Comida sem cheiro, roupa sem cheiro, gente sem cheiro.':
    'El cuarto no huele a nada. Comida sin olor, ropa sin olor, gente sin olor.',
  '"Boa noite, camarada inspetor", dizem os dois. Ao mesmo tempo. Na mesma nota.':
    '"Buenas noches, camarada inspector", dicen los dos. Al mismo tiempo. En la misma nota.',
  'O pote de sal da Vessa está no parapeito. Cheio. Exatamente como estava na prateleira da cozinha. Você não pergunta como ele atravessou o corredor sozinho.':
    'El frasco de sal de Vessa está en el alféizar. Lleno. Exactamente como estaba en la repisa de la cocina. Usted no pregunta cómo cruzó el pasillo solo.',
  'Você já vasculhou hoje. O quarto ganhou aquele ar ofendido dos lugares revirados.':
    'Ya registró hoy. El cuarto tiene ese aire ofendido de los lugares revueltos.',
  'O colchão nu, a cadeira, a poeira. Tudo no lugar. Só que o travesseiro—':
    'El colchón desnudo, la silla, el polvo. Todo en su lugar. Solo que la almohada—',
  'O travesseiro está quente.': 'La almohada está caliente.',
  'Ninguém dorme neste quarto. Ninguém NUNCA dormiu neste quarto. Você encosta a mão de novo para ter certeza e se arrepende de ter certeza.':
    'Nadie duerme en este cuarto. Nadie ha dormido NUNCA en este cuarto. Usted toca de nuevo para estar seguro y se arrepiente de estar seguro.',
  'Vasculhando o armário vazio: ': 'Registrando el armario vacío: ',
  ' em moedas antigas, esquecidas num casaco que ninguém lembra de quem foi.':
    ' en monedas antiguas, olvidadas en un abrigo del que nadie recuerda de quién era.',
  'Dinheiro de morto ou de emigrado. Nesta economia, é tudo dinheiro.':
    'Dinero de muerto o de emigrado. En esta economía, todo es dinero.',
  'No fundo da gaveta: um frasco de remédio LACRADO, dentro do prazo. De quem? De quando? Não importa.':
    'En el fondo del cajón: un frasco de remedio SELLADO, dentro de la fecha. ¿De quién? ¿De cuándo? No importa.',
  'Você o leva para ': 'Se lo lleva a ',
  '. Esta noite, a casa tosse menos.': '. Esta noche, la casa tose menos.',
  'Um frasco de remédio lacrado, esquecido na gaveta. Ninguém precisa dele agora — o farmacêutico do beco paga ₴ 4 sem perguntar de onde veio.':
    'Un frasco de remedio sellado, olvidado en el cajón. Nadie lo necesita ahora — el farmacéutico del callejón paga ₴ 4 sin preguntar de dónde vino.',
  'Colchão nu. Cadeira. Poeira. O quarto que a casa mantém vazio como quem guarda um lugar à mesa para alguém que não avisou se volta.':
    'Colchón desnudo. Silla. Polvo. El cuarto que la casa mantiene vacío como quien guarda un lugar en la mesa para alguien que no avisó si vuelve.',
  'Encerrar o dia?': '¿Terminar el día?',
  'DORMIR': 'DORMIR',
  'AINDA NÃO': 'TODAVÍA NO',

  // dia 48 (espelho) / entrada na casa dia 1 / dormir forçado
  'Não há fila. Não há guardas. Há um vento que parou no meio do caminho, como quem esqueceu o que ia dizer.':
    'No hay fila. No hay guardias. Hay un viento que se detuvo a mitad de camino, como quien olvidó lo que iba a decir.',
  'Você está do lado de fora do seu próprio posto. Do lado de quem espera. Quarenta e oito dias e você nunca tinha visto o muro deste ângulo — os risquinhos contando dias que alguém raspou na pedra.':
    'Usted está afuera de su propio puesto. Del lado de quien espera. Cuarenta y ocho días y nunca había visto el muro desde este ángulo — las rayitas contando días que alguien raspó en la piedra.',
  'Caminhe até o guichê. Há documentos na bandeja. São os seus.':
    'Camine hasta la ventanilla. Hay documentos en la bandeja. Son los suyos.',
  'DIA 48': 'DÍA 48',
  '20:30. O apartamento cheira a sopa rala e a aquecedor velho. Estão todos aqui: sua mãe na sala, Vessa na cozinha, os meninos nos quartos.':
    '20:30. El apartamento huele a sopa aguada y a calefactor viejo. Están todos aquí: su madre en la sala, Vessa en la cocina, los niños en sus cuartos.',
  'Ande com WASD ou setas. Arraste o mouse na tela para olhar ao redor. Aproxime-se de alguém e aperte E para conversar — eles sabem coisas que o posto não sabe.':
    'Camine con WASD o flechas. Arrastre el mouse por la pantalla para mirar alrededor. Acérquese a alguien y presione E para hablar — ellos saben cosas que el puesto no sabe.',
  'Quando terminar, durma na sua cama, no último quarto. Amanhã tem fila.':
    'Cuando termine, duerma en su cama, en el último cuarto. Mañana hay fila.',
  'SUA CASA': 'SU CASA',
  'NOTA OFICIAL: fiscalização domiciliar não atendida. Advertência registrada no prontuário do servidor.':
    'NOTA OFICIAL: fiscalización domiciliaria no atendida. Advertencia registrada en el expediente del funcionario.',
  'Os olhos pesam. Quarenta e oito dias não se atravessam sem dormir.':
    'Los ojos pesan. Cuarenta y ocho días no se cruzan sin dormir.',
  'IR PARA A CAMA': 'IR A LA CAMA',

  // prompts de interação (houseLoop)
  'E — Deslizar seus documentos pela bandeja': 'E — Deslizar sus documentos por la bandeja',
  'E — ATENDER A PORTA': 'E — ATENDER LA PUERTA',
  'E — Olhar pelo olho mágico': 'E — Mirar por la mirilla',
  'E — Dormir': 'E — Dormir',
  'E — Olhar o retrato da família': 'E — Mirar el retrato familiar',
  'E — Olhar o quarto da sua mãe': 'E — Mirar el cuarto de su madre',
  'E — Os realocados': 'E — Los realojados',
  'E — Quarto de hóspedes vazio': 'E — Cuarto de huéspedes vacío',
  'E — Vasculhar o quarto de hóspedes': 'E — Registrar el cuarto de huéspedes',

  /* ---- INSPEÇÃO, DISCREPÂNCIAS, ADVERTÊNCIAS ---- */
  'MODO INSPEÇÃO: selecione dois elementos para comparar.': 'MODO INSPECCIÓN: seleccione dos elementos para comparar.',
  'MODO INSPEÇÃO: clique em DOIS elementos para compará-los (campos, foto, rosto, relógio, regulamento).':
    'MODO INSPECCIÓN: haga clic en DOS elementos para compararlos (campos, foto, rostro, reloj, reglamento).',
  '★ IDENTIDADE CONFERE COM PROCURADO. Detenção autorizada.': '★ LA IDENTIDAD COINCIDE CON EL BUSCADO. Detención autorizada.',
  '⚠ DISCREPÂNCIA CONFIRMADA: ': '⚠ DISCREPANCIA CONFIRMADA: ',
  'Nenhuma discrepância entre estes dois elementos.': 'Ninguna discrepancia entre estos dos elementos.',
  '⚠ CONTRABANDO ENCONTRADO. Detenção autorizada.': '⚠ CONTRABANDO ENCONTRADO. Detención autorizada.',
  'Contrabando na bagagem': 'Contrabando en el equipaje',
  'Não há bagagem.': 'No hay equipaje.',
  'Nunca houve.': 'Nunca lo hubo.',
  'Detalhes improvisados contradizem os documentos': 'Detalles improvisados contradicen los documentos',
  'MULTA: ': 'MULTA: ',
  'ADVERTÊNCIA REGISTRADA.': 'ADVERTENCIA REGISTRADA.',
  ' expirado': ' vencido',
  'Nomes divergentes entre documentos': 'Nombres divergentes entre documentos',
  'Números de registro divergentes': 'Números de registro divergentes',
  'Selo incorreto na permissão': 'Sello incorrecto en el permiso',
  'Selo nacional incorreto': 'Sello nacional incorrecto',
  'Cidade emissora inexistente no país': 'Ciudad emisora inexistente en el país',
  'Foto não confere com o portador': 'La foto no coincide con el portador',
  'Sexo registrado não confere': 'El sexo registrado no coincide',
  'Bagagem incompatível com o motivo declarado': 'Equipaje incompatible con el motivo declarado',
  'Declaração contradiz os documentos': 'La declaración contradice los documentos',
  'Entrada proibida: cidadão de ': 'Entrada prohibida: ciudadano de ',
  'Sem passaporte': 'Sin pasaporte',
  'Cidadão sem cartão de identidade': 'Ciudadano sin cédula de identidad',
  'Estrangeiro sem permissão de entrada': 'Extranjero sin permiso de entrada',
  'Sem permissão de trabalho': 'Sin permiso de trabajo',
  'Sem carteira sanitária': 'Sin carné sanitario',
  'Sem certificado de ancestralidade (Édito nº 2)': 'Sin certificado de ascendencia (Edicto n.º 2)',
  'Documento sem selo de revalidação do Conselho': 'Documento sin sello de revalidación del Consejo',
  'Cidadão de Linestan sem bilhete de entrada': 'Ciudadano de Linestan sin boleto de entrada',
  'Cidadão de Frimia sem visto de trânsito': 'Ciudadano de Frimia sin visa de tránsito',
  'Cidadão de Bahar-Zad sem certificado de inoculação': 'Ciudadano de Bahar-Zad sin certificado de inoculación',
  'Menor acompanhante sem registro': 'Menor acompañante sin registro',
  'Biotipo corporal não corresponde ao sexo declarado': 'El biotipo corporal no corresponde al sexo declarado',
  'Acompanhante apresenta sinais não-humanos': 'El acompañante presenta signos no humanos',
  'Procurado(a) foi APROVADO(A).': 'El buscado fue APROBADO.',
  'Procurado(a) deveria ser DETIDO(A), não rejeitado(a).': 'El buscado debía ser DETENIDO, no rechazado.',
  'Detenção sem evidência confirmada.': 'Detención sin evidencia confirmada.',
  'Aprovado(a) com irregularidade: ': 'Aprobado con irregularidad: ',
  'Documentos em perfeita ordem. Rejeição indevida.': 'Documentos en perfecto orden. Rechazo indebido.',
  'Detenção sem qualquer evidência.': 'Detención sin ninguna evidencia.',
  'COTA DE ADMISSÃO ESGOTADA. Aprovação bloqueada pelo Ministério. (A pessoa entrou — o carimbo é seu. A advertência também.)':
    'CUOTA DE ADMISIÓN AGOTADA. Aprobación bloqueada por el Ministerio. (La persona entró — el sello es suyo. La advertencia también.)',
  'Decisão em desacordo com o regulamento.': 'Decisión en desacuerdo con el reglamento.',
  'Nenhum registro de entrada consta do posto leste entre 10h e 11h de ontem. O livro de ponto mostra uma linha em branco que ninguém lembra de ter pulado.':
    'No consta registro de entrada en el puesto este entre las 10 y las 11 de ayer. El libro de asistencia muestra una línea en blanco que nadie recuerda haber saltado.',
  'A cota do posto leste fechou cedo. ': 'La cuota del puesto este se cerró temprano. ',
  ' pessoas com documentos em ordem dormiram na neve diante do portão. O Ministério chamou o dia de "sucesso logístico".':
    ' personas con documentos en orden durmieron en la nieve frente al portón. El Ministerio llamó al día un "éxito logístico".',

  /* ---- REDE SOCIAL INVISÍVEL: boatos sobre o inspetor (REPUTATION_CHATTER) ---- */
  '"…esse aqui tem preço, já ouvi dizer…"': '"…este tiene precio, ya lo oí decir…"',
  '"…leva um envelope certinho e ele nem lê o resto…"': '"…lleva un sobre bien puesto y ni siquiera lee el resto…"',
  '"…psiu. sabe quanto custa esse guichê? eu sei…"': '"…psh. ¿sabe cuánto cuesta esta ventanilla? yo sé…"',
  '"…disseram que ele já deixou passar gente por menos que isso…"': '"…dicen que ya dejó pasar gente por menos que eso…"',
  '"…esse aqui não solta ninguém, nem quando devia…"': '"…este no suelta a nadie, ni cuando debería…"',
  '"…prenderam meu vizinho semana passada. foi esse guichê…"': '"…detuvieron a mi vecino la semana pasada. fue esta ventanilla…"',
  '"…evita olhar pra ele. evita olhar mesmo…"': '"…evite mirarlo. evítelo de verdad…"',
  '"…dizem que já detém sem prova nenhuma…"': '"…dicen que ya detiene sin ninguna prueba…"',
  '"…psiu. dizem que esse ajuda, se souber pedir do jeito certo…"': '"…psh. dicen que este ayuda, si sabe pedir de la manera correcta…"',
  '"…minha prima passou por aqui. disse que ele "esqueceu" de olhar a bagagem dela…"':
    '"…mi prima pasó por aquí. dijo que él "se olvidó" de revisar su equipaje…"',
  '"…esse guichê é seguro, dizem. mas fala baixo…"': '"…esta ventanilla es segura, dicen. pero hable bajito…"',
  '"…não sei se é bondade ou descuido. mas agradeço os dois…"': '"…no sé si es bondad o descuido. pero agradezco los dos…"',
  '"…esse aí rejeita quase tudo, nem que os papéis estejam certos…"': '"…ese rechaza casi todo, aunque los papeles estén en regla…"',
  '"…melhor nem tentar a sorte com esse guichê…"': '"…mejor ni probar suerte con esa ventanilla…"',
  '"…ele lê cada linha. CADA linha…"': '"…lee cada línea. CADA línea…"',
  '"…esse não erra. ou não admite que erra…"': '"…ese no se equivoca. o no admite que se equivoca…"',

  /* ---- JORNAL: manchetes roteirizadas (SCRIPTED_NEWS) ---- */
  'BREVES:': 'BREVES:',
  'CLASSIFICADOS': 'CLASIFICADOS',
  'VISADO PELA CENSURA': 'VISADO POR LA CENSURA',
  'CARIMBO ILEGÍVEL': 'SELLO ILEGIBLE',
  'FRONTEIRA LESTE REABRE APÓS SEIS MESES': 'LA FRONTERA ESTE REABRE TRAS SEIS MESES',
  'O Ministério de Triagem anuncia a reabertura do Posto Nº 7 após o recesso de inverno. O ministro Calder Voss pede "serenidade e rigor" aos novos inspetores. A crise energética dá sinais de trégua. Filas são esperadas.':
    'El Ministerio de Control anuncia la reapertura del Puesto Nº 7 tras el receso invernal. El ministro Calder Voss pide "serenidad y rigor" a los nuevos inspectores. La crisis energética da señales de tregua. Se esperan filas.',
  'Time de Valgrado vence por 2 a 1.': 'El equipo de Valgrado gana 2 a 1.',
  'Preço do pão sobe 4%.': 'El precio del pan sube 4%.',
  'Horóscopo: um estranho lhe dirá a verdade. Ou não.': 'Horóscopo: un extraño le dirá la verdad. O no.',
  'MULHER DETIDA EM MIRALTA "NÃO ERA QUEM DIZIA SER"': 'MUJER DETENIDA EN MIRALTA "NO ERA QUIEN DECÍA SER"',
  'Vizinhos afirmam que a costureira Odila Vintra "voltou diferente" de uma viagem. Exames foram inconclusivos. A polícia nega que o caso envolva Alternados. A família da detida afirma que ela apenas "andava cansada".':
    'Vecinos afirman que la costurera Odila Vintra "volvió diferente" de un viaje. Los exámenes fueron inconclusos. La policía niega que el caso involucre Alternados. La familia de la detenida afirma que ella solo "andaba cansada".',
  'Cientistas de Nova República pedem calma: "falsos positivos são comuns".': 'Científicos de Nova República piden calma: "los falsos positivos son comunes".',
  'Rádio clandestina multada.': 'Radio clandestina multada.',
  'LINESTAN LANÇA O SCANNER "VERITAS-9"': 'LINESTAN LANZA EL ESCÁNER "VERITAS-9"',
  'A LumenCorp de Linestan promete "99,2% de precisão" na detecção de Alternados. Especialistas independentes questionam a metodologia. As ações da empresa subiram 34% em um dia. O Ministério estuda a compra de unidades.':
    'LumenCorp de Linestan promete "99,2% de precisión" en la detección de Alternados. Expertos independientes cuestionan la metodología. Las acciones de la empresa subieron 34% en un día. El Ministerio estudia la compra de unidades.',
  'Greve dos ferroviários termina.': 'Termina la huelga ferroviaria.',
  'Publicidade: VERITAS-9 — proteja sua família.': 'Publicidad: VERITAS-9 — protege a tu familia.',
  'CHANCELER ALDRIC VOSS É ASSASSINADO': 'EL CANCILLER ALDRIC VOSS ES ASESINADO',
  'O chanceler foi morto a tiros na escadaria do Parlamento. Não há consenso sobre a autoria: a polícia culpa a resistência; a resistência culpa o governo; panfletos culpam os Alternados; Cantalabria sugere "interferência externa". O país entra em luto — e em pânico.':
    'El canciller murió baleado en la escalinata del Parlamento. No hay consenso sobre la autoría: la policía culpa a la resistencia; la resistencia culpa al gobierno; los panfletos culpan a los Alternados; Cantalabria sugiere "interferencia externa". El país entra en luto — y en pánico.',
  'Bolsa despenca 18%.': 'La bolsa se desploma 18%.',
  'Mehrvolk convoca comício: "Ordem, Segurança, Pureza".': 'Mehrvolk convoca un mitin: "Orden, Seguridad, Pureza".',
  'MULTIDÕES NAS RUAS: "QUEM NOS PROTEGE?"': 'MULTITUDES EN LAS CALLES: "¿QUIÉN NOS PROTEGE?"',
  'Após o assassinato, comícios do movimento Mehrvolk reúnem dezenas de milhares. O orador prometeu "eliminar a infiltração em doze meses". Cientistas alertam que as estatísticas citadas no palco não existem em nenhum estudo publicado.':
    'Tras el asesinato, los mítines del movimiento Mehrvolk reúnen a decenas de miles. El orador prometió "eliminar la infiltración en doce meses". Los científicos advierten que las estadísticas citadas en el escenario no existen en ningún estudio publicado.',
  'Toque de recolher em Delvina.': 'Toque de queda en Delvina.',
  'Farmácias racionam sedativos.': 'Las farmacias racionan sedantes.',
  'MEHRVOLK ASSUME O GOVERNO DE OSTERIA': 'MEHRVOLK ASUME EL GOBIERNO DE OSTERIA',
  'Com apoio de parte do exército e do Parlamento em pânico, o movimento Mehrvolk assumiu o poder na madrugada. Primeiro decreto: "A verdade agora tem um só nome." Jornais de oposição amanheceram fechados. Este jornal foi renomeado por ordem administrativa.':
    'Con apoyo de parte del ejército y de un Parlamento en pánico, el movimiento Mehrvolk tomó el poder durante la madrugada. Primer decreto: "La verdad ahora tiene un solo nombre." Los periódicos de oposición amanecieron cerrados. Este periódico fue renombrado por orden administrativa.',
  'Novos uniformes distribuídos aos postos.': 'Nuevos uniformes distribuidos a los puestos.',
  'Hino atualizado. Decorar até sexta.': 'Himno actualizado. Memorizar antes del viernes.',
  'ÉDITO DE PUREZA Nº 2 ENTRA EM VIGOR': 'EL EDICTO DE PUREZA Nº 2 ENTRA EN VIGOR',
  'Cidadãos de origem núlia e bahari deverão portar Certificado de Ancestralidade. O Instituto Lantraviano de Fenotipia afirma que "certas linhagens apresentam 12% mais incidência de substituição". O estudo não foi revisado por pares. Hospitais registram filas de pessoas tentando provar quem são.':
    'Los ciudadanos de origen núlio y bahari deberán portar Certificado de Ascendencia. El Instituto Lantraviano de Fenotipia afirma que "ciertos linajes presentan 12% más incidencia de sustitución". El estudio no fue revisado por pares. Los hospitales registran filas de personas intentando probar quiénes son.',
  'Denúncias anônimas dobram.': 'Las denuncias anónimas se duplican.',
  'Criança de 9 anos denuncia o próprio professor.': 'Un niño de 9 años denuncia a su propio profesor.',
  'DEZ DETIDOS EM OPERAÇÃO "SANGUE LIMPO"': 'DIEZ DETENIDOS EN LA OPERACIÓN "SANGRE LIMPIA"',
  'O governo comemora a captura de "dez infiltrados". Documentos vazados sugerem que ao menos sete eram humanos com exames alterados. O Ministério nega. As famílias não foram informadas do paradeiro dos detidos.':
    'El gobierno celebra la captura de "diez infiltrados". Documentos filtrados sugieren que al menos siete eran humanos con exámenes alterados. El Ministerio lo niega. Las familias no fueron informadas del paradero de los detenidos.',
  'Escolas adotam cartilha "Conheça seu vizinho".': 'Las escuelas adoptan la cartilla "Conoce a tu vecino".',
  'Racionamento de carvão.': 'Racionamiento de carbón.',
  'JORNALISTA DESAPARECE APÓS REPORTAGEM': 'PERIODISTA DESAPARECE TRAS UN REPORTAJE',
  'Vela Odim, autora da série "Os Falsos Positivos", está desaparecida há três dias. O governo afirma que ela "viajou por vontade própria". Colegas afirmam que sua casa foi revirada. A LumenCorp negou comentar os erros do VERITAS-9 citados na reportagem.':
    'Vela Odim, autora de la serie "Los Falsos Positivos", lleva tres días desaparecida. El gobierno afirma que ella "viajó por voluntad propia". Sus colegas afirman que su casa fue registrada. LumenCorp se negó a comentar los errores del VERITAS-9 citados en el reportaje.',
  'Cartazes novos: "Quem cala, protege."': 'Nuevos carteles: "Quien calla, protege."',
  'Pão racionado: 1 unidade por família.': 'Pan racionado: 1 unidad por familia.',
  'CIENTISTAS CONTESTAM A FENOTIPIA — E SÃO PRESOS': 'CIENTÍFICOS CUESTIONAN LA FENOTIPIA — Y SON ARRESTADOS',
  'Quatorze pesquisadores assinaram carta afirmando que "nenhuma característica física define um Alternado". Foram detidos por "sabotagem epistemológica". Universidades entram em greve. O governo responde: "A ciência do inimigo também é inimiga."':
    'Catorce investigadores firmaron una carta afirmando que "ninguna característica física define a un Alternado". Fueron detenidos por "sabotaje epistemológico". Las universidades entran en huelga. El gobierno responde: "La ciencia del enemigo también es enemiga."',
  'Fila do posto leste bate recorde.': 'La fila del puesto este bate récord.',
  'Inverno chega mais cedo.': 'El invierno llega antes.',
  'EXPLOSÃO NA ESTAÇÃO CENTRAL: 31 MORTOS': 'EXPLOSIÓN EN LA ESTACIÓN CENTRAL: 31 MUERTOS',
  'Um atentado destruiu a Estação Central de Valgrado. O governo culpa a resistência. A resistência culpa "agentes do próprio regime". Um sobrevivente jura que viu o autor "sorrir com a boca errada". Ninguém sabe o que isso significa. Ninguém pergunta duas vezes.':
    'Un atentado destruyó la Estación Central de Valgrado. El gobierno culpa a la resistencia. La resistencia culpa a "agentes del propio régimen". Un sobreviviente jura haber visto al autor "sonreír con la boca equivocada". Nadie sabe qué significa eso. Nadie pregunta dos veces.',
  'Luto oficial de três dias.': 'Luto oficial de tres días.',
  'Trens suspensos.': 'Trenes suspendidos.',
  'GOLPE: CONSELHO POPULAR TOMA O PODER': 'GOLPE: EL CONSEJO POPULAR TOMA EL PODER',
  'Unidades do exército derrubaram o governo Mehrvolk durante a madrugada. O Conselho Popular declara que "os Alternados são uma invenção do capital para disciplinar trabalhadores". Os laboratórios estatais, entretanto, seguem funcionando — agora sob nova bandeira. Todos os documentos antigos exigem revalidação.':
    'Unidades del ejército derrocaron al gobierno Mehrvolk durante la madrugada. El Consejo Popular declara que "los Alternados son una invención del capital para disciplinar a los trabajadores". Los laboratorios estatales, sin embargo, siguen funcionando — ahora bajo una nueva bandera. Todos los documentos antiguos requieren renovación.',
  'Estátuas derrubadas antes do café.': 'Estatuas derribadas antes del desayuno.',
  'Novo hino. Decorar até sexta.': 'Nuevo himno. Memorizar antes del viernes.',
  'EX-AGENTES DO REGIME VIRAM "ELEMENTOS INDESEJÁVEIS"': 'EX AGENTES DEL RÉGIMEN SE CONVIERTEN EN "ELEMENTOS INDESEABLES"',
  'Funcionários do governo anterior tentam deixar o país em massa. O Conselho promete julgamentos populares. Nas filas, ninguém mais sabe qual carimbo é o certo — e o Conselho também não. Um inspetor foi preso por aplicar a lei da semana passada.':
    'Funcionarios del gobierno anterior intentan salir del país en masa. El Consejo promete juicios populares. En las filas, ya nadie sabe cuál sello es el correcto — y el Consejo tampoco. Un inspector fue arrestado por aplicar la ley de la semana pasada.',
  'Açúcar desaparece dos mercados.': 'El azúcar desaparece de los mercados.',
  'Boato: "Alternados não suportam açúcar." Falso. Talvez.': 'Rumor: "Los Alternados no soportan el azúcar." Falso. Tal vez.',
  'O SCANNER OFICIAL ERA DEFEITUOSO, ADMITE MINISTÉRIO': 'EL ESCÁNER OFICIAL ERA DEFECTUOSO, ADMITE EL MINISTERIO',
  'Após seis dias de triagem obrigatória por detector biológico, o Conselho admite que 40% das unidades estavam descalibradas. Volta a valer a carteira sanitária — a mesma que o decreto anterior chamou de "papel inútil". As pessoas na fila riem. Depois choram.':
    'Tras seis días de control obligatorio con detector biológico, el Consejo admite que el 40% de las unidades estaban descalibradas. Vuelve a valer el carnet sanitario — el mismo que el decreto anterior llamó "papel inútil". La gente en la fila ríe. Después llora.',
  'LumenCorp transfere sede para Linestan.': 'LumenCorp traslada su sede a Linestan.',
  'Apagões programados: 4h por dia.': 'Apagones programados: 4h por día.',
  'O ÉDITO DE PUREZA NUNCA EXISTIU NO PAPEL': 'EL EDICTO DE PUREZA NUNCA EXISTIÓ EN PAPEL',
  'Um funcionário do arquivo central, fugindo do país, deixou uma pasta para trás: não há registro de votação, sessão ou assinatura para o Édito de Pureza nº 2. O "Instituto Lantraviano de Fenotipia" tinha um único funcionário — o mesmo que redigiu o decreto. Milhares de certificados de ancestralidade foram emitidos, negados e cobrados com base em um estudo que nunca existiu, para uma lei que nunca foi votada. Os postos de fronteira seguem exigindo o documento. Ninguém revogou nada. Ninguém sabe mais quem poderia.':
    'Un funcionario del archivo central, huyendo del país, dejó una carpeta atrás: no hay registro de votación, sesión o firma para el Edicto de Pureza n.º 2. El "Instituto Lantraviano de Fenotipia" tenía un único empleado — el mismo que redactó el decreto. Miles de certificados de ascendencia fueron emitidos, negados y cobrados con base en un estudio que nunca existió, para una ley que nunca fue votada. Los puestos fronterizos siguen exigiendo el documento. Nadie derogó nada. Ya nadie sabe quién podría.',
  'O funcionário fugitivo não foi encontrado.': 'El funcionario fugitivo no fue encontrado.',
  'Cartórios seguem emitindo certificados. Ninguém explica com base em quê.': 'Los registros civiles siguen emitiendo certificados. Nadie explica con qué base.',
  'FRONTEIRAS DO NORTE CAÍRAM. NINGUÉM GOVERNA LÁ.': 'LAS FRONTERAS DEL NORTE CAYERON. NADIE GOBIERNA ALLÍ.',
  'Refugiados de Kranton e Krestov relatam cidades sem polícia, sem energia e sem notícias. "Não fugimos deles", disse uma mulher, "fugimos de nós mesmos". O Conselho não comenta. O Conselho não é encontrado para comentar.':
    'Refugiados de Kranton y Krestov reportan ciudades sin policía, sin energía y sin noticias. "No huimos de ellos", dijo una mujer, "huimos de nosotros mismos". El Consejo no hace comentarios. El Consejo no puede ser encontrado para comentar.',
  'Hospitais lotados.': 'Hospitales desbordados.',
  'A rádio estatal transmite estática entre 14h e 16h.': 'La radio estatal transmite estática entre las 14h y las 16h.',
  'ONDE ESTÁ O GOVERNO?': '¿DÓNDE ESTÁ EL GOBIERNO?',
  'Ministérios vazios. Telefones mudos. O último comunicado oficial tem cinco dias. Este jornal é impresso por voluntários. Não sabemos se seremos impressos amanhã. O posto de triagem leste segue aberto — ninguém mandou fechar. Talvez ninguém exista para mandar.':
    'Ministerios vacíos. Teléfonos mudos. El último comunicado oficial tiene cinco días. Este periódico es impreso por voluntarios. No sabemos si seremos impresos mañana. El puesto de control este sigue abierto — nadie mandó cerrarlo. Tal vez nadie existe para mandarlo.',
  'Feira improvisada na Praça do Sal.': 'Feria improvisada en la Plaza de la Sal.',
  'Alguém pintou na muralha: "ELES JÁ ESTÃO AQUI." Outro completou: "SEMPRE ESTIVERAM."':
    'Alguien pintó en la muralla: "YA ESTÁN AQUÍ." Otro completó: "SIEMPRE ESTUVIERON."',
  'COMUNIDADE DO VALE AFIRMA "CONVIVER" COM ALTERNADOS': 'COMUNIDAD DEL VALLE AFIRMA "CONVIVIR" CON ALTERNADOS',
  'Um povoado nas montanhas garante viver em paz com "os outros" há anos. "Eles consertam nossas cercas. Nós não perguntamos o nome antigo deles." Impossível verificar. Impossível não pensar nisso a noite inteira.':
    'Un poblado en las montañas asegura vivir en paz con "los otros" desde hace años. "Ellos arreglan nuestras cercas. Nosotros no preguntamos su nombre antiguo." Imposible de verificar. Imposible no pensar en eso toda la noche.',
  'Sem previsão do tempo. O instrumento quebrou.': 'Sin pronóstico del tiempo. El instrumento se rompió.',
  'Procura-se: qualquer notícia de Vela Odim.': 'Se busca: cualquier noticia de Vela Odim.',
  'ELES NÃO ERRAM MAIS': 'YA NO SE EQUIVOCAN',
  'Inspetores de três postos relatam o mesmo: os documentos falsos ficaram perfeitos. As entrevistas, perfeitas. Os exames, inconclusivos. "É como se tivessem aprendido conosco tudo o que sabemos", disse um agente. "Ou como se nunca tivesse havido diferença."':
    'Inspectores de tres puestos reportan lo mismo: los documentos falsos se volvieron perfectos. Las entrevistas, perfectas. Los exámenes, inconclusos. "Es como si hubieran aprendido de nosotros todo lo que sabemos", dijo un agente. "O como si nunca hubiera habido diferencia."',
  'Última linha de trem desativada.': 'Última línea de tren desactivada.',
  'O horóscopo pede desculpas e não faz previsões hoje.': 'El horóscopo pide disculpas y no hace predicciones hoy.',

  /* ---- JORNAL: sem edição / preenchimento ---- */
  'O JORNAL NÃO CHEGOU HOJE.': 'EL PERIÓDICO NO LLEGÓ HOY.',
  'Não há mais edições. Houve alguma vez?': 'Ya no hay más ediciones. ¿Alguna vez las hubo?',
  'O entregador não veio. A banca está vazia. A vizinha diz que "jornal era coisa do governo antigo". Qual deles, você não pergunta.':
    'El repartidor no vino. El kiosco está vacío. La vecina dice que "el periódico era cosa del gobierno anterior". Cuál de ellos, no preguntas.',

  /* ---- JORNAL DE PREENCHIMENTO (FILLER_NEWS) ---- */
  'RACIONAMENTO DE ENERGIA AMPLIADO': 'AMPLÍAN EL RACIONAMIENTO DE ENERGÍA',
  'O fornecimento elétrico será interrompido em bairros alternados — a escolha de palavras do Ministério foi considerada "infeliz". Reclamações devem ser protocoladas em formulário 77-B, disponível apenas online.':
    'El suministro eléctrico se interrumpirá en barrios alternados — la elección de palabras del Ministerio fue considerada "desafortunada". Los reclamos deben presentarse en el formulario 77-B, disponible solo en línea.',
  'FILA DO POSTO LESTE DOBRA EM UMA SEMANA': 'LA FILA DEL PUESTO ESTE SE DUPLICA EN UNA SEMANA',
  'Migrantes relatam esperas de até três dias. Vendedores ambulantes lucram. Um homem afirma ter visto "a mesma mulher entrar na fila duas vezes, ao mesmo tempo". Testemunhas se contradizem.':
    'Los migrantes reportan esperas de hasta tres días. Los vendedores ambulantes se benefician. Un hombre afirma haber visto "a la misma mujer entrar en la fila dos veces, al mismo tiempo". Los testigos se contradicen.',
  'NOVO ESTUDO CONTRADIZ ESTUDO ANTERIOR': 'NUEVO ESTUDIO CONTRADICE ESTUDIO ANTERIOR',
  'Pesquisadores de Nova República afirmam que o marcador celular K-7, tido como prova de substituição, também aparece em pacientes com febre reumática. O laboratório que criou o teste chamou o estudo de "sabotagem comercial".':
    'Investigadores de Nova República afirman que el marcador celular K-7, considerado prueba de sustitución, también aparece en pacientes con fiebre reumática. El laboratorio que creó la prueba llamó al estudio "sabotaje comercial".',
  'TARANSTAN NEGA EXISTÊNCIA DE ALTERNADOS': 'TARANSTAN NIEGA LA EXISTENCIA DE LOS ALTERNADOS',
  'Em discurso de quatro horas, o Secretário-Geral afirmou que "o único parasita é o capital". Desertores relatam, entretanto, laboratórios subterrâneos na Usina 9. Taranstan chamou os desertores de "atores contratados".':
    'En un discurso de cuatro horas, el Secretario General afirmó que "el único parásito es el capital". Sin embargo, desertores reportan laboratorios subterráneos en la Usina 9. Taranstan llamó a los desertores "actores contratados".',
  'BAHAR-ZAD REABRE ARQUIVO DE MANUSCRITOS': 'BAHAR-ZAD REABRE EL ARCHIVO DE MANUSCRITOS',
  'Textos de setecentos anos descrevem "os que vestem rostos". Historiadores debatem se são profecia, coincidência ou má tradução. Peregrinos lotam o Poço das Vozes.':
    'Textos de setecientos años describen a "los que visten rostros". Los historiadores debaten si es profecía, coincidencia o mala traducción. Los peregrinos abarrotan el Pozo de las Voces.',
  'CANTALABRIA OFERECE MEDIAÇÃO — DE NOVO': 'CANTALABRIA OFRECE MEDIACIÓN — DE NUEVO',
  'A diplomacia cantálabra propôs a quinta conferência do ano. Vazamentos sugerem que Alcorte "sabe mais do que divulga". Alcorte respondeu com um sorriso e um comunicado de duas linhas.':
    'La diplomacia cantalabria propuso la quinta conferencia del año. Filtraciones sugieren que Alcorte "sabe más de lo que revela". Alcorte respondió con una sonrisa y un comunicado de dos líneas.',
  'MERCADO NEGRO VENDE "VACINA ANTI-ALTERNADO"': 'EL MERCADO NEGRO VENDE "VACUNA ANTI-ALTERNADO"',
  'Frascos apreendidos continham água, açúcar e corante. Três mortos por injeção contaminada. A demanda, entretanto, triplicou após a apreensão.':
    'Los frascos incautados contenían agua, azúcar y colorante. Tres muertos por inyecciones contaminadas. La demanda, sin embargo, se triplicó tras la incautación.',
  'CRIANÇA PERGUNTA EM REDE NACIONAL: "COMO SEI QUE MAMÃE É MAMÃE?"': 'NIÑO PREGUNTA EN CADENA NACIONAL: "¿CÓMO SÉ QUE MAMÁ ES MAMÁ?"',
  'O apresentador não soube responder. O programa foi cortado para o hino. O trecho circula em fitas clandestinas.':
    'El presentador no supo responder. El programa cortó al himno. El fragmento circula en cintas clandestinas.',

  'COMUNICADO OFICIAL — DIA': 'COMUNICADO OFICIAL — DÍA',

  /* ---- COMUNICADOS ROTEIRIZADOS (SCRIPTED_BULLETIN) ---- */
  'Inspetor: bem-vindo ao Posto Nº 7.\n\nHoje: verifique apenas se o PASSAPORTE é válido (não expirado) e pertence ao portador (foto e sexo).\n\nUse o botão INSPEÇÃO e clique em DOIS elementos para compará-los (ex.: validade × relógio; foto × rosto).\n\nErros geram advertência. Advertências geram multas. Multas geram fome.':
    'Inspector: bienvenido al Puesto Nº 7.\n\nHoy: verifique solo que el PASAPORTE sea válido (no vencido) y pertenezca al portador (foto y sexo).\n\nUse el botón INSPECCIÓN y haga clic en DOS elementos para compararlos (ej.: validez × reloj; foto × rostro).\n\nLos errores generan advertencia. Las advertencias generan multas. Las multas generan hambre.',
  'ATENÇÃO: a partir de hoje, PROCURADOS listados aqui devem ser DETIDOS (botão DETER, disponível após confirmar discrepância ou identificar o procurado).\n\nPROCURADO HOJE: ver lista no regulamento.':
    'ATENCIÓN: a partir de hoy, los PRÓFUGOS listados aquí deben ser DETENIDOS (botón DETENER, disponible tras confirmar una discrepancia o identificar al prófugo).\n\nPRÓFUGO DE HOY: ver lista en el reglamento.',
  'NOVA ADMINISTRAÇÃO.\n\nO Estado Nacional Mehrvolk assume os postos de fronteira. Uniformes serão trocados. O inspetor que servia à República agora serve à Pureza.\n\nQuem não servir, será substituído. A palavra "substituído" não é uma metáfora. Ou é. Não pergunte.':
    'NUEVA ADMINISTRACIÓN.\n\nEl Estado Nacional Mehrvolk toma los puestos fronterizos. Los uniformes serán reemplazados. El inspector que servía a la República ahora sirve a la Pureza.\n\nQuien no sirva, será sustituido. La palabra "sustituido" no es una metáfora. O sí lo es. No pregunte.',
  'ÉDITO DE PUREZA Nº 2.\n\nViajantes de origem NÚLIA ou BAHARI devem portar CERTIFICADO DE ANCESTRALIDADE.\n\nNota do Instituto de Fenotipia: "traços do rosto podem indicar linhagem". Nota manuscrita de alguém no verso: "isso não é ciência".':
    'EDICTO DE PUREZA Nº 2.\n\nLos viajeros de origen NÚLIA o BAHARI deben portar CERTIFICADO DE ASCENDENCIA.\n\nNota del Instituto de Fenotipia: "los rasgos del rostro pueden indicar linaje". Nota manuscrita de alguien al reverso: "esto no es ciencia".',
  'O CONSELHO POPULAR SAÚDA OS TRABALHADORES DA FRONTEIRA.\n\nTodos os decretos do regime anterior estão REVOGADOS. Documentos antigos exigem SELO DE REVALIDAÇÃO (★).\n\nOs "Alternados" são propaganda burguesa. Entretanto, continue reportando avistamentos ao Departamento 12, que não existe.':
    'EL CONSEJO POPULAR SALUDA A LOS TRABAJADORES DE LA FRONTERA.\n\nTodos los decretos del régimen anterior quedan REVOCADOS. Los documentos antiguos requieren SELLO DE RENOVACIÓN (★).\n\nLos "Alternados" son propaganda burguesa. Sin embargo, sigan reportando avistamientos al Departamento 12, que no existe.',
  'COMUNICADO SEM TIMBRE.\n\nNão recebemos ordens há dias. O telefone está mudo. Aplique o bom senso.\n\nO que quer que isso signifique agora.':
    'COMUNICADO SIN MEMBRETE.\n\nNo recibimos órdenes desde hace días. El teléfono está mudo. Use el sentido común.\n\nLo que sea que eso signifique ahora.',
  'Não há comunicado.\n\nHá apenas uma folha em branco com um carimbo: APROVAR.\n\nO botão REJEITAR não está mais na sua mesa. Você não lembra de alguém tê-lo levado.':
    'No hay comunicado.\n\nSolo hay una hoja en blanco con un sello: APROBAR.\n\nEl botón RECHAZAR ya no está en tu mesa. No recuerdas que alguien se lo haya llevado.',
  'Último dia de registro no seu contrato.\n\nAssine o formulário de desligamento. Se ainda houver alguém para recebê-lo.':
    'Último día de registro en tu contrato.\n\nFirma el formulario de baja. Si todavía queda alguien para recibirlo.',
  'Posto Nº 7 — Dia': 'Puesto Nº 7 — Día',
  '.\n\nAplique o regulamento em vigor (painel à direita). Discrepâncias devem ser confirmadas via INSPEÇÃO antes de justificar detenção.':
    '.\n\nAplique el reglamento vigente (panel de la derecha). Las discrepancias deben confirmarse mediante INSPECCIÓN antes de justificar una detención.',
  '\n\n★ PROCURADO(A) HOJE: ': '\n\n★ PRÓFUGO(A) DE HOY: ',
  '). DETER à vista.': '). DETENER a la vista.',
  '\n\n§ COTA DE ADMISSÃO DE HOJE: ': '\n\n§ CUOTA DE ADMISIÓN DE HOY: ',
  ' entradas. Esgotada a cota, o Ministério BLOQUEIA novas aprovações — rejeite mesmo quem estiver em ordem.':
    ' entradas. Agotada la cuota, el Ministerio BLOQUEA nuevas aprobaciones — rechace incluso a quien esté en regla.',
  '\n\n§ REAJUSTE PATRIÓTICO: ': '\n\n§ AJUSTE PATRIÓTICO: ',
  ' por decisão correta. O Estado Nacional cuida dos seus.': ' por decisión correcta. El Estado Nacional cuida de los suyos.',
  '\n\n§ O CONSELHO VALORIZA O TRABALHADOR: ': '\n\n§ EL CONSEJO VALORA AL TRABAJADOR: ',
  ' por decisão correta. (Nota: o aluguel do espaço requisitado passa a ': ' por decisión correcta. (Nota: el alquiler del espacio requisado pasa a ',
  '\n\n§ INDICADOR FÍSICO EM VIGOR: ': '\n\n§ INDICADOR FÍSICO VIGENTE: ',
  '\nAnomalia correspondente registrada em EXAME FÍSICO autoriza detenção.': '\nAnomalía correspondiente registrada en el EXAMEN FÍSICO autoriza la detención.',
  '\n\n✎ (rabiscado a lápis na margem, por alguém do turno anterior)\n"': '\n\n✎ (garabateado a lápiz en el margen, por alguien del turno anterior)\n"',

  /* ---- BOATOS (RUMOR_TEXT) ---- */
  'Dizem nas filas: "eles não piscam".': 'Dicen en las filas: "ellos no parpadean".',
  'O Instituto de Fenotipia CONFIRMA: ausência de reflexo palpebral é indicador Classe-2.': 'El Instituto de Fenotipia CONFIRMA: la ausencia de reflejo palpebral es un indicador Clase-2.',
  'Boato de rádio clandestina: "olho vermelho, sangue trocado".': 'Rumor de radio clandestina: "ojo rojo, sangre cambiada".',
  'Circular oficial: hiperemia ocular consta como indicador Classe-3.': 'Circular oficial: la hiperemia ocular consta como indicador Clase-3.',
  'Um dentista de Miralta jura: "dente perfeito, gente falsa".': 'Un dentista de Miralta jura: "diente perfecto, gente falsa".',
  'Nota técnica: dentição íntegra em adultos de baixa renda é estatisticamente anômala.': 'Nota técnica: la dentición íntegra en adultos de bajos ingresos es estadísticamente anómala.',
  'Dizem que a pele deles não tem poros. Minha avó dizia o mesmo de anjos.': 'Dicen que su piel no tiene poros. Mi abuela decía lo mismo de los ángeles.',
  'O Ministério lista "epiderme atípica" como indicador auxiliar.': 'El Ministerio lista la "epidermis atípica" como indicador auxiliar.',
  '"Olha as mãos. Eles erram as mãos." — pichação na Praça do Sal.': '"Miren las manos. Se equivocan con las manos." — pintada en la Plaza de la Sal.',
  'Manual revisado: proporção falangeana irregular deve ser reportada.': 'Manual revisado: la proporción falángica irregular debe ser reportada.',
  'Um enfermeiro desertor: "o coração deles bate devagar. Muito devagar."': 'Un enfermero desertor: "su corazón late despacio. Muy despacio."',
  'Boletim médico-estatal: bradicardia extrema é indicador Classe-1.': 'Boletín médico-estatal: la bradicardia extrema es un indicador Clase-1.',

  /* ---- ACHADOS DO EXAME (rum.tell match) ---- */
  'INDICADOR OFICIAL EM VIGOR (comunicado de hoje). Detenção autorizada — a máquina do Estado confia em você.':
    'INDICADOR OFICIAL VIGENTE (comunicado de hoy). Detención autorizada — la máquina del Estado confía en ti.',
  'coincide com o boato de hoje. Sem valor legal. (Ainda.)': 'coincide con el rumor de hoy. Sin valor legal. (Todavía.)',

  /* ---- EXAME FÍSICO: zonas e intro ---- */
  'OLHOS': 'OJOS', 'BOCA': 'BOCA', 'PELE': 'PIEL', 'MÃOS': 'MANOS', 'PESCOÇO': 'CUELLO',
  'GERAL': 'GENERAL', 'CORPO': 'CUERPO',
  'A pessoa se aproxima do vidro. Perto demais. Examine cada região.':
    'La persona se acerca al vidrio. Demasiado cerca. Examina cada zona.',

  /* ---- MOTIVOS DE VIAGEM (PURPOSES) ---- */
  'Visita familiar': 'Visita familiar', 'Trabalho': 'Trabajo', 'Trânsito': 'Tránsito',
  'Imigração': 'Inmigración', 'Tratamento médico': 'Tratamiento médico', 'Estudo': 'Estudio',

  /* ---- DURAÇÕES (PURPOSES.dur) ---- */
  '3 dias': '3 días', '1 semana': '1 semana', '2 semanas': '2 semanas', '1 mês': '1 mes',
  '6 meses': '6 meses', '1 ano': '1 año', '1 dia': '1 día', '2 dias': '2 días', 'permanente': 'permanente',

  /* ---- PROFISSÕES (PROFESSIONS) ---- */
  'professor(a)': 'profesor(a)', 'engenheiro(a)': 'ingeniero(a)', 'médico(a)': 'médico(a)',
  'operário(a)': 'obrero(a)', 'comerciante': 'comerciante', 'enfermeiro(a)': 'enfermero(a)',
  'agricultor(a)': 'agricultor(a)', 'músico(a)': 'músico(a)', 'contador(a)': 'contador(a)',
  'soldado': 'soldado', 'costureiro(a)': 'costurero(a)', 'ferroviário(a)': 'ferroviario(a)',
  'pesquisador(a)': 'investigador(a)', 'padeiro(a)': 'panadero(a)', 'jornalista': 'periodista',
  'estudante': 'estudiante', 'mecânico(a)': 'mecánico(a)', 'advogado(a)': 'abogado(a)',

  /* ---- LINHA DA VIDA (buildLifeline/openLifeline) ---- */
  'LINHA DA VIDA': 'LÍNEA DE VIDA',
  'Uma lacuna pode ser um crime. Uma guerra. Uma infiltração. Ou um cartório que pegou fogo. A linha não responde nada — ela apenas mostra.':
    'Un vacío puede ser un crimen. Una guerra. Una infiltración. O un registro civil que se incendió. La línea no responde nada — solo muestra.',
  'Nascimento — ': 'Nacimiento — ',
  'Escola primária (registro padrão)': 'Escuela primaria (registro estándar)',
  'Primeiro trabalho — ': 'Primer trabajo — ',
  'Serviço militar obrigatório': 'Servicio militar obligatorio',
  'Casamento (registro civil)': 'Matrimonio (registro civil)',
  'Mudança de residência — ': 'Cambio de residencia — ',
  'Vacinação registrada (B-7, K-12, TRIV)': 'Vacunación registrada (B-7, K-12, TRIV)',
  'Contrato de trabalho — ': 'Contrato de trabajo — ',
  'Chega ao Posto Nº 7 — motivo declarado: ': 'Llega al Puesto Nº 7 — motivo declarado: ',
  '— REGISTROS AUSENTES: ': '— REGISTROS AUSENTES: ',
  ' anos —': ' años —',

  /* ---- RESPOSTAS DE INTERROGATÓRIO (answerFor/followTruth) ---- */
  '. Desculpe, é isso. ': '. Disculpe, es eso. ',
  'Eu juro.': 'Lo juro.', 'Tenho certeza.': 'Estoy seguro(a).', 'Acho.': 'Creo.',
  'Minha irmã, ': 'Mi hermana, ',
  'O contramestre ': 'El capataz ',
  ', da obra.': ', de la obra.',
  'Ninguém. Sigo sozinho(a).': 'Nadie. Viajo solo(a).',
  'Rua': 'Calle',
  'do Sal': 'de la Sal', 'das Oficinas': 'de los Talleres', 'Norte': 'Norte',
  'da Estação': 'de la Estación', 'dos Curtumes': 'de las Curtiembres', 'Baixa': 'Baja',
  'O(a) gerente ': 'El(la) gerente ',
  ', da ': ', de la ',
  'Oficina': 'Taller', 'Cooperativa': 'Cooperativa', 'Fábrica': 'Fábrica', 'Casa': 'Casa',
  'Não volto. Não tem volta.': 'No vuelvo. No hay vuelta.',
  'De trem. O dinheiro da passagem está costurado no forro do casaco.': 'En tren. El dinero del pasaje está cosido en el forro del abrigo.',

  /* ---- ECOS (scheduleEcho) ---- */
  'Três funcionários do arquivo de ': 'Tres empleados del archivo en ',
  ' não voltaram para casa. As famílias dizem que "voltaram diferentes". A polícia diz que voltaram.':
    ' no volvieron a casa. Las familias dicen que "volvieron diferentes". La policía dice que volvieron.',
  'O reservatório de ': 'El embalse de ',
  ' registrou "alterações químicas menores". O laudo foi arquivado.': ' registró "alteraciones químicas menores". El informe fue archivado.',
  'Um(a) ': 'Un(a) ',
  ' recém-chegado(a) a ': ' recién llegado(a) a ',
  ' foi promovido(a) em tempo recorde. Colegas o(a) descrevem como "perfeito(a) demais".':
    ' fue ascendido(a) en tiempo récord. Los colegas lo(a) describen como "demasiado perfecto(a)".',
  'Moradores de ': 'Los residentes de ',
  ' relatam que os cães do bairro pararam de latir. Todos. Na mesma semana.': ' reportan que los perros del barrio dejaron de ladrar. Todos. En la misma semana.',

  /* ---- REGULAMENTO (RULES) ---- */
  'Todo viajante deve portar PASSAPORTE válido.': 'Todo viajero debe portar PASAPORTE válido.',
  'Cidadãos de Osteria devem portar CARTÃO DE IDENTIDADE.': 'Los ciudadanos de Osteria deben portar CÉDULA DE IDENTIDAD.',
  'Estrangeiros devem portar PERMISSÃO DE ENTRADA.': 'Los extranjeros deben portar PERMISO DE ENTRADA.',
  'Viajantes a trabalho devem portar PERMISSÃO DE TRABALHO.': 'Los viajeros por trabajo deben portar PERMISO DE TRABAJO.',
  'TODOS devem portar CARTEIRA SANITÁRIA (Decreto 44-C).': 'TODOS deben portar CARNET SANITARIO (Decreto 44-C).',
  'ESTRANGEIROS devem portar CARTEIRA SANITÁRIA.': 'Los EXTRANJEROS deben portar CARNET SANITARIO.',
  'Pessoas de origem NÚLIA ou BAHARI devem portar CERTIFICADO DE ANCESTRALIDADE (Édito de Pureza nº 2).':
    'Las personas de origen NÚLIA o BAHARI deben portar CERTIFICADO DE ASCENDENCIA (Edicto de Pureza Nº 2).',
  'ENTRADA PROIBIDA a cidadãos de KRESTOV (incidente diplomático).': 'ENTRADA PROHIBIDA a ciudadanos de KRESTOV (incidente diplomático).',
  'ENTRADA PROIBIDA a cidadãos de LANTRAVIA (inimigos do povo).': 'ENTRADA PROHIBIDA a ciudadanos de LANTRAVIA (enemigos del pueblo).',
  'ENTRADA PROIBIDA a cidadãos de TARANSTAN (agitadores comunistas).': 'ENTRADA PROHIBIDA a ciudadanos de TARANSTAN (agitadores comunistas).',
  'Documentos emitidos ANTES do Conselho exigem SELO DE REVALIDAÇÃO (procure o carimbo ★ no passaporte).':
    'Los documentos emitidos ANTES del Consejo requieren SELLO DE RENOVACIÓN (busque el sello ★ en el pasaporte).',
  'Cidadãos de LINESTAN devem apresentar BILHETE DE ENTRADA numerado (acordo comercial 9-B).':
    'Los ciudadanos de LINESTAN deben presentar BOLETO DE ENTRADA numerado (acuerdo comercial 9-B).',
  'Cidadãos de FRIMIA devem portar VISTO DE TRÂNSITO carimbado (só de passagem — não podem fixar residência).':
    'Los ciudadanos de FRIMIA deben portar VISA DE TRÁNSITO sellada (solo de paso — no pueden fijar residencia).',
  'Cidadãos de BAHAR-ZAD devem portar CERTIFICADO DE INOCULAÇÃO (surto na Rota das Caravanas).':
    'Los ciudadanos de BAHAR-ZAD deben portar CERTIFICADO DE INOCULACIÓN (brote en la Ruta de las Caravanas).',
  'Todo MENOR acompanhante deve constar em REGISTRO DE MENOR carimbado. Sem registro, o menor não passa.':
    'Todo MENOR acompañante debe constar en REGISTRO DE MENOR sellado. Sin registro, el menor no pasa.',
  'Convenção de Alcorte: REFUGIADOS com Cartão de Refúgio devem ser protegidos e admitidos.':
    'Convención de Alcorte: los REFUGIADOS con Tarjeta de Refugio deben ser protegidos y admitidos.',
  'PROCURADOS listados no comunicado devem ser DETIDOS.': 'Los PRÓFUGOS listados en el comunicado deben ser DETENIDOS.',
  'O DETECTOR BIOLÓGICO substitui a carteira sanitária. Escaneie todos os suspeitos.': 'El DETECTOR BIOLÓGICO reemplaza el carnet sanitario. Escanee a todos los sospechosos.',
  'DIRETRIZ FINAL: não há mais normas. O posto deve permanecer aberto.': 'DIRECTIVA FINAL: ya no hay normas. El puesto debe permanecer abierto.',
  'COTA DE ADMISSÃO: máximo de': 'CUOTA DE ADMISIÓN: máximo de',
  'entradas hoje. Esgotada, rejeite mesmo documentos em ordem.': 'entradas hoy. Agotada, rechace incluso documentos en regla.',
  'PROCURADO(A): ': 'PRÓFUGO(A): ',

  /* ---- SAUDAÇÕES DA FILA (greetingFor) ---- */
  'O senhor. DE NOVO eu, sim. Me barrou no dia': 'Usted, señor. DE NUEVO yo, sí. Me rechazó el día',
  '. Consegui papéis novos. Custaram o que custaram. Olhe o quanto quiser — e olhe nos meus olhos quando carimbar.':
    '. Conseguí papeles nuevos. Costaron lo que costaron. Mire todo lo que quiera — y míreme a los ojos cuando selle.',
  'É a segunda vez, senhor. Desde aquele carimbo vermelho eu durmo na fila. Eu arrumei tudo. Acho que arrumei tudo. Por favor. POR FAVOR.':
    'Es la segunda vez, señor. Desde aquel sello rojo duermo en la fila. Arreglé todo. Creo que arreglé todo. Por favor. POR FAVOR.',
  'entrou neste posto no dia': 'entró en este puesto el día',
  ' e nunca mais saiu. DETIDO(A), me disseram. Ninguém diz onde. Eu vim atravessar — e vim perguntar na sua cara: para onde vocês levam as pessoas?':
    ' y nunca más salió. DETENIDO(A), me dijeron. Nadie dice dónde. Vine a cruzar — y vine a preguntarle a la cara: ¿a dónde se llevan a la gente?',
  ' e foi detido(a). Sou advogado(a) da família. Vim pedir os documentos do processo — e um prazo de resposta, já que ninguém me deu nenhum dos dois.':
    ' y fue detenido(a). Soy el abogado de la familia. Vine a pedir los documentos del proceso — y un plazo de respuesta, ya que nadie me dio ninguno de los dos.',
  'Estou apurando o caso de ': 'Estoy investigando el caso de ',
  ', detido(a) neste posto no dia': ', detenido(a) en este puesto el día',
  '. O advogado da família não recebeu resposta em trinta dias. Vim fazer a pergunta que ninguém responde: para onde vocês levam as pessoas?':
    '. El abogado de la familia no recibió respuesta en treinta días. Vine a hacer la pregunta que nadie responde: ¿a dónde se llevan a la gente?',
  'Uma reportagem sobre o caso de ': 'Un reportaje sobre el caso de ',
  ', detido(a) no Posto Nº 7 no dia': ', detenido(a) en el Puesto N.º 7 el día',
  ', foi arquivada sem explicação. Ninguém envolvido deu mais entrevistas.':
    ', fue archivado sin explicación. Nadie involucrado dio más entrevistas.',
  'Bom dia. Está frio hoje, não?': 'Buenos días. Hace frío hoy, ¿no?',
  'Aqui estão meus papéis.': 'Aquí están mis papeles.',
  'Espero que esteja tudo em ordem.': 'Espero que todo esté en orden.',
  'É a minha terceira vez nesta fila.': 'Es mi tercera vez en esta fila.',
  'Por favor, seja rápido. Meu trem sai ao meio-dia.': 'Por favor, sea rápido. Mi tren sale al mediodía.',
  'Eu não tenho nada a esconder.': 'No tengo nada que esconder.',
  'Deus abençoe este posto.': 'Dios bendiga este puesto.',
  'Dizem que o senhor é dos justos. Dizem.': 'Dicen que usted es de los justos. Dicen.',
  'A fila estava menor na semana passada. Tudo estava menor na semana passada.': 'La fila era más corta la semana pasada. Todo era más pequeño la semana pasada.',
  'Glória à Pureza. — A voz não acredita no que diz.': 'Gloria a la Pureza. — La voz no cree lo que dice.',
  'Está tudo em ordem. Eu JURO que está tudo em ordem.': 'Todo está en orden. JURO que todo está en orden.',
  'O certificado custou dois meses de salário. Está aí dentro. Por favor.': 'El certificado costó dos meses de salario. Está ahí dentro. Por favor.',
  'Saudações, camarada inspetor.': 'Saludos, camarada inspector.',
  'Trouxe o selo novo. E o antigo. E o anterior ao antigo. Qual vale hoje?': 'Traje el sello nuevo. Y el antiguo. Y el anterior al antiguo. ¿Cuál vale hoy?',
  'O sindicato disse que agora é diferente. É diferente?': 'El sindicato dijo que ahora es diferente. ¿Es diferente?',
  'Ainda tem alguém aí dentro?': '¿Todavía hay alguien ahí adentro?',
  'Não sei por que a gente ainda faz fila. Mas fazemos.': 'No sé por qué todavía hacemos fila. Pero la hacemos.',
  'Carimba qualquer coisa. Já não importa. Importa?': 'Sella cualquier cosa. Ya no importa. ¿Importa?',
  'Desculpe… eu fico nervoso(a) com uniformes.': 'Disculpe… me pongo nervioso(a) con los uniformes.',
  'Minhas mãos estão tremendo de frio. Só de frio.': 'Me tiemblan las manos de frío. Solo de frío.',
  'Eu decorei tudo o que ia dizer e esqueci agora.': 'Memoricé todo lo que iba a decir y ahora lo olvidé.',

  /* ---- SINAIS FÍSICOS (TELLS: achado/normal) ---- */
  'Não piscou uma única vez durante todo o exame.': 'No parpadeó ni una sola vez durante todo el examen.',
  'Pisca em ritmo comum. Um pouco rápido, talvez. Frio faz isso.': 'Parpadea a un ritmo normal. Un poco rápido, tal vez. El frío hace eso.',
  'Escleras injetadas, vasos escuros demais. (Choro recente? Insônia? Outra coisa?)': '¿Escleróticas inyectadas, vasos demasiado oscuros. (¿Llanto reciente? ¿Insomnio? ¿Otra cosa?)',
  'Olhos cansados. Como os de todo mundo nesta fila.': 'Ojos cansados. Como los de todos en esta fila.',
  'Dentição perfeita demais. Gengivas pálidas, sem irrigação visível.': 'Dentadura demasiado perfecta. Encías pálidas, sin irrigación visible.',
  'Dentes gastos, um canino lascado. Uma boca que comeu pão duro a vida inteira.': 'Dientes desgastados, un canino astillado. Una boca que comió pan duro toda la vida.',
  'Pele cerosa, quase sem poros. (Ou apenas sabão de má qualidade e vento norte.)': 'Piel cerosa, casi sin poros. (O solo jabón de mala calidad y viento del norte.)',
  'Pele rachada de frio. Cicatriz antiga no queixo.': 'Piel agrietada por el frío. Cicatriz antigua en el mentón.',
  'Dedos compridos demais para as mãos. Unhas sem meia-lua.': 'Dedos demasiado largos para las manos. Uñas sin lúnula.',
  'Mãos calejadas. Aliança apertada demais para sair.': 'Manos encallecidas. Anillo de bodas demasiado apretado para quitarse.',
  'O pulso no pescoço é visível. Lento. Lento demais. Você conta seis batimentos no minuto.':
    'El pulso en el cuello es visible. Lento. Demasiado lento. Cuentas seis latidos por minuto.',
  'Pulso acelerado sob a pele. Gente com medo tem coração audível.': 'Pulso acelerado bajo la piel. La gente con miedo tiene el corazón audible.',

  /* ---- CONQUISTAS ---- */
  'CONQUISTA DESBLOQUEADA': 'LOGRO DESBLOQUEADO',
  'Primeiro Carimbo': 'Primer Sello',
  'Servidor Exemplar': 'Servidor Ejemplar',
  'A Rota do Barbeiro': 'La Ruta del Barbero',
  'A Cidade Silenciosa': 'La Ciudad Silenciosa',
  'Quem Sou Eu Depois de 48 Dias': 'Quién Soy Después de 48 Días',
  'Não Olhe de Perto': 'No Mires de Cerca',
  'Você Olhou': 'Miraste',
  'Ninguém Ficou Para Trás': 'Nadie Se Quedó Atrás',
  'Mãos Limpas': 'Manos Limpias',
  'O Travesseiro': 'La Almohada',
  'A Conta Fecha': 'La Cuenta Cierra',
  'O Amigo Nunca Erra': 'El Amigo Nunca Se Equivoca',
};

const I18N_TABLES = { en: I18N_EN, es: I18N_ES };

function normSpace(s) { return String(s).replace(/\s+/g, ' ').trim(); }

function T(s) {
  const table = I18N_TABLES[SETTINGS.lang];
  if (!table) return s; // 'pt' (fonte) ou idioma desconhecido: devolve sem alteração
  if (Object.prototype.hasOwnProperty.call(table, s)) return table[s];
  const n = normSpace(s);
  return Object.prototype.hasOwnProperty.call(table, n) ? table[n] : s;
}

/* Elementos de interface ESTÁTICA (não regenerados por game.js/house.js):
   captura o texto/title original em data-pt na primeira passada, e a
   partir daí só troca entre o original e a tradução — nunca perde o PT. */
const I18N_STATIC_SELECTORS = [
  '.title-sub', '.title-quote', '#btn-new', '#btn-continue', '#btn-second-reading',
  '#btn-fullscreen', '.title-warning', '.title-version',
  '.home-title', '#btn-gowork', '#btn-bulletin', '#btn-endshift', '#btn-map', '#btn-map-close',
  '#btn-music', '#btn-approve', '#btn-reject', '#btn-detain',
  '.bc-doc', '.bc-stamp', '#desk-hint',
  '.btn-tool .tool-name', '.side-cap',
  '.rulebook .rb-title', '#btn-radio', '#radio-line',
  '#endday-title', '#btn-gohome', '#btn-restart',
  '.house-help', '#hd-hint',
  '.exam-head span', '#btn-exam-close', '.bag-hint',
  '.pause-title', '#pz-continue', '#pz-music', '#pz-sfx', '#pz-fullscreen', '#pz-title', '.pause-note',
  '#btn-achievements', '#pz-achievements',
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
