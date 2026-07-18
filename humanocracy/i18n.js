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

  /* ---- SUSSURROS (WHISPERS) ---- */
  'aquela assinatura… você já viu antes. não viu?': 'that signature… you\'ve seen it before. haven\'t you?',
  'ele piscou os dois olhos ao mesmo tempo. todo mundo pisca assim. certo?': 'he blinked both eyes at the same time. everyone blinks like that. right?',
  'o relógio atrasou dois minutos. ou você que adiantou.': 'the clock ran two minutes slow. or you ran fast.',
  'quantas pessoas você aprovou ontem? tem certeza do número?': 'how many people did you approve yesterday? are you sure of the number?',
  'sua esposa mexeu no seu carimbo. por quê?': 'your wife touched your stamp. why?',
  'o café de hoje tinha o mesmo gosto de sempre. exatamente o mesmo.': 'today\'s coffee tasted the same as always. exactly the same.',
  'a foto 3×4 sorriu. não. não sorriu.': 'the 3x4 photo smiled. no. it didn\'t.',
  'você trancou a porta ao sair de casa. você sempre tranca. sempre?': 'you locked the door when you left home. you always lock it. always?',

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

  /* ---- JORNAL: manchetes roteirizadas (SCRIPTED_NEWS) ---- */
  'BREVES:': 'BRIEFS:',
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
  'estudante': 'student', 'mecânico(a)': 'mechanic',

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
  'WASD/setas andar · clique e mexa o mouse para olhar · E interagir · ESC solta o mouse':
    'WASD/flechas para caminar · clic y mueve el mouse para mirar · E interactuar · ESC libera el mouse',
  'clique / E para continuar': 'clic / E para continuar',

  /* ---- exame / bagagem ---- */
  'EXAME FÍSICO APROXIMADO — clique nas regiões': 'EXAMEN FÍSICO DE CERCA — haz clic en las zonas',
  'FECHAR': 'CERRAR',
  'REVISTA DE BAGAGEM — objetos contam histórias': 'REVISIÓN DE EQUIPAJE — los objetos cuentan historias',
  'No modo INSPEÇÃO, um objeto pode ser comparado com um campo de documento.':
    'En modo INSPECCIÓN, un objeto puede compararse con un campo de un documento.',

  /* ---- pausa ---- */
  '— PAUSA —': '— PAUSA —',
  'CONTINUAR': 'CONTINUAR',
  'MÚSICA: LIGADA': 'MÚSICA: ACTIVADA', 'MÚSICA: DESLIGADA': 'MÚSICA: DESACTIVADA',
  'SONS: LIGADOS': 'SONIDO: ACTIVADO', 'SONS: DESLIGADOS': 'SONIDO: DESACTIVADO',
  'TELA CHEIA (F)': 'PANTALLA COMPLETA (F)',
  'SALVAR E VOLTAR AO TÍTULO': 'GUARDAR Y VOLVER AL TÍTULO',
  'O posto não pausa por você. Este menu, sim.': 'El puesto no se detiene por ti. Este menú, sí.',

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

  /* ---- nomes de tipo de documento ---- */
  'PASSAPORTE': 'PASAPORTE', 'CARTÃO DE IDENTIDADE': 'CÉDULA DE IDENTIDAD',
  'PERMISSÃO DE ENTRADA': 'PERMISO DE ENTRADA', 'PERMISSÃO DE TRABALHO': 'PERMISO DE TRABAJO',
  'CARTEIRA SANITÁRIA': 'CARNET SANITARIO', 'CERT. DE ANCESTRALIDADE': 'CERT. DE ASCENDENCIA',
  'CARTÃO DE REFÚGIO': 'TARJETA DE REFUGIO',

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

  /* ---- JORNAL: manchetes roteirizadas (SCRIPTED_NEWS) ---- */
  'BREVES:': 'BREVES:',
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
  'estudante': 'estudiante', 'mecânico(a)': 'mecánico(a)',

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
