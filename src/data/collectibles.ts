/**
 * COLLECTIBLES — 36 discoverable items that tell the story of "O Evento".
 * 6 base + 6 per character (5 characters with locked sets) = 36 total.
 * 20% chance to spawn one per wave as a floating item.
 */

export interface Collectible {
  id: string;
  name: string;
  /** Full lore paragraph */
  lore: string;
  /** Which character set this belongs to (null = base) */
  characterId: string | null;
  /** Order in narrative (for sequential reading) */
  order: number;
  /** Sprite type hint */
  spriteHint: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// BASE COLLECTIBLES — "O Evento" (The Event) narrative
// ═══════════════════════════════════════════════════════════════════════════════

export const BASE_COLLECTIBLES: Collectible[] = [
  {
    id: 'col_news_clip_1',
    name: 'Recorte de Jornal — Dia 1',
    lore: 'FOLHA DE SAO PAULO — EDICAO ESPECIAL. "OBJETOS NAO IDENTIFICADOS DETECTADOS EM ORBITA". O Ministerio da Defesa confirma a presenca de 47 objetos de origem desconhecida em orbita terrestre. NASA, ESA e Roscosmos tentam comunicacao. Populacao e orientada a manter a calma. Presidente fara pronunciamento as 20h. [A pagina esta manchada de sangue seco. O pronunciamento nunca aconteceu.]',
    characterId: null,
    order: 1,
    spriteHint: 'paper',
  },
  {
    id: 'col_radio_broadcast',
    name: 'Gravacao de Radio — Dia 2',
    lore: '[ESTATICA] "...repito, esto NO es un simulacro. Ciudad de Mexico esta en llamas. Los objetos descendieron a las 04:00... [ESTATICA] ...Brasilia nao responde. Repito, Brasilia NAO RESPONDE. Todas as frequencias militares estao em silencio. Se alguem esta ouvindo isso, va para o interior. Fuja das cidades. Eles estao caindo nas cidades primeiro..." [A gravacao termina com um som grave, vibrante — como mil vozes gemendo em unissono.]',
    characterId: null,
    order: 2,
    spriteHint: 'radio',
  },
  {
    id: 'col_military_order',
    name: 'Ordem Militar — Dia 3',
    lore: 'COMANDO MILITAR DO LESTE — ORDEM 0047-E. CLASSIFICACAO: ULTRASSECRETA. "Efetivo: TODAS as unidades. Operacao CORTINA DE FERRO cancelada. Repito: CANCELADA. Armamento convencional INEFICAZ contra alvos primarios. Prioridade absoluta: evacuacao de nucleos urbanos. Contingente remanescente: recuar para POSICOES DELTA (coordenadas anexas — MEMORIZAR E DESTRUIR). Deus nos ajude." Assinado: Gen. Ricardo Amorim. [Nota manuscrita na margem: "Amorim se matou 6h depois de assinar isso."]',
    characterId: null,
    order: 3,
    spriteHint: 'document',
  },
  {
    id: 'col_survivor_journal_1',
    name: 'Diario de Sobrevivente — Dia 7',
    lore: '"Dia 7. Ou 8. Perdi a conta. A eletricidade acabou ontem. O celular morreu. O silencio e o pior. Nao o silencio de \"sem barulho\" — o silencio de \"sem pessoas\". Eu era um professor de historia. Agora sou um rato que se esconde em pores. Tinha 32 alunos na minha turma. Nao sei se algum esta vivo. Na verdade, sei. Sei que nao estao. Vi o que aconteceu na escola." [As paginas seguintes estao arrancadas.]',
    characterId: null,
    order: 4,
    spriteHint: 'book',
  },
  {
    id: 'col_survivor_journal_2',
    name: 'Diario de Sobrevivente — Dia 14',
    lore: '"Dia 14. Encontrei um grupo. Sete pessoas. Um policial, uma enfermeira, um mecanico, tres adolescentes, e eu. O policial tentou manter ordem. Funcionou por 3 dias. No quarto, um dos adolescentes foi pego por algo rapido no escuro. Nao vimos o que era. So ouvimos. O som... era como papel rasgando. Mas molhado. O policial tentou atirar no escuro. Acertou a enfermeira. Agora somos cinco."',
    characterId: null,
    order: 5,
    spriteHint: 'book',
  },
  {
    id: 'col_emergency_broadcast',
    name: 'Transmissao de Emergencia — Dia 30',
    lore: '[SINAL FRACO] "Aqui e a Estacao Antartica Comandante Ferraz. Para qualquer sobrevivente: nos estamos vivos. Repito — a Antartica esta livre. Eles nao vieram aqui. O frio os mantem longe. Temos suprimentos para 6 meses. Estamos coordenando com submarinos da Marinha Brasileira. Ha um plano. Se voce esta ouvindo, va para o sul. Quanto mais frio, mais seguro. NAO va para os tropicos. Os tropicos ja nao sao nossos." [O sinal repete em loop. Nunca mais atualizou.]',
    characterId: null,
    order: 6,
    spriteHint: 'radio',
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// RAIZ COLLECTIBLES — Mutacao da Floresta
// ═══════════════════════════════════════════════════════════════════════════════

export const RAIZ_COLLECTIBLES: Collectible[] = [
  {
    id: 'col_raiz_seeds',
    name: 'Sementes Mutantes',
    lore: 'Seis sementes guardadas em um tubo de vidro lacrado. Cada uma pulsa com bioluminescencia verde. Etiqueta manuscrita: "ESPECIE DESCONHECIDA — NAO PLANTAR SEM SUPERVISAO". Raiz plantou uma no Dia 10. Em 48 horas, havia uma arvore de 12 metros que respondia a comandos de voz. As outras cinco ainda esperam. Ele diz que ainda nao e hora.',
    characterId: 'grass_man',
    order: 1,
    spriteHint: 'seed',
  },
  {
    id: 'col_raiz_recording',
    name: 'Gravacao da Floresta — Noite 4',
    lore: '[Gravador portatil, audio distorcido] "...estou a tres dias de caminhada do ultimo posto de guarda. A floresta mudou. As arvores se movem quando nao estou olhando — juro que se movem. Encontrei pegadas que nao sao de nenhum animal que conheco. Seis dedos. Cada um com 30cm. Algo grande esta aqui. Mas... nao me sinto ameacado. E como se a floresta estivesse... me protegendo? Isso soa louco. Talvez eu ESTEJA louco."',
    characterId: 'grass_man',
    order: 2,
    spriteHint: 'tape',
  },
  {
    id: 'col_raiz_spore_sample',
    name: 'Amostra de Esporo — Analise',
    lore: 'RELATORIO CIENTIFICO — Submarino Tupi. Amostra #0023: Esporos alienigenas coletados por operativo "Raiz". Composicao: 60% carbono, 15% silicio, 25% elementos desconhecidos (nao presentes na tabela periodica). Comportamento: os esporos tentam se FUNDIR com qualquer materia organica em contato. Em plantas, causam crescimento acelerado e mutação controlada. Em humanos... fusao e possivel, mas requer compatibilidade genetica extremamente rara. Nota: operativo "Raiz" apresenta fusao bem-sucedida. Caso unico. Nao replicavel.',
    characterId: 'grass_man',
    order: 3,
    spriteHint: 'vial',
  },
  {
    id: 'col_raiz_map',
    name: 'Mapa da Zona Mutante',
    lore: 'Mapa desenhado a mao mostrando a expansao da "Zona Verde" — area da Amazonia onde a vegetacao alien-mutante dominou completamente. Anotacoes: "Limite norte: Rio Negro (SEGURO). Limite sul: avanca 2km por dia (NAO seguro). Dentro da zona: aliens NAO entram. Motivo desconhecido. A floresta os rejeita." Uma nota final, em letra tremula: "A zona esta crescendo. Num ano, cobre o Brasil. Em cinco, o continente. Em dez... o mundo sera floresta. E e bom?"',
    characterId: 'grass_man',
    order: 4,
    spriteHint: 'map',
  },
  {
    id: 'col_raiz_photo',
    name: 'Foto Antiga — Pre-Evento',
    lore: 'Fotografia plastificada de um homem jovem em uniforme do ICMBio, sorrindo ao lado de uma arara-azul em um galho. Atras, escrito: "Primeira patrulha sozinho — Reserva Xingu, 2019. O melhor dia da minha vida." O homem na foto nao tem musgo nos bracos, cipós nas costas, ou olhos que brilham no escuro. Era humano. Inteiramente humano. Parece tao distante.',
    characterId: 'grass_man',
    order: 5,
    spriteHint: 'photo',
  },
  {
    id: 'col_raiz_root_network',
    name: 'Diagrama — Rede de Raizes',
    lore: 'Diagrama cientifico mostrando a rede neural subterranea que conecta todas as plantas mutantes na Zona Verde. Similar a uma rede de internet biologica, cada arvore e um "no" que transmite informacao quimica. No centro do diagrama, um X vermelho com a anotacao: "PONTO CENTRAL — coordenadas de Raiz. Ele e o servidor. A floresta o usa como cerebro. Ou ele usa a floresta. Nao sabemos qual." Embaixo, uma pergunta sem resposta: "Se ele morrer, a floresta morre?"',
    characterId: 'grass_man',
    order: 6,
    spriteHint: 'diagram',
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// INFERNO COLLECTIBLES — Trauma e Fogo
// ═══════════════════════════════════════════════════════════════════════════════

export const INFERNO_COLLECTIBLES: Collectible[] = [
  {
    id: 'col_inferno_teddy',
    name: 'Ursinho de Pelucia Queimado',
    lore: 'Metade derretida, metade intacta. O olho esquerdo de vidro ainda brilha. Era da Leticia — irma mais nova de Cinza. Ela tinha 7 anos. Dormia com o urso toda noite. Na noite do Evento, quando a casa explodiu, Cinza encontrou o urso no quintal, a 15 metros da cratera. Do corpo dela, nao encontrou nada. Ele carrega o urso no bolso interno do colete. Sempre. Nao fala sobre isso. Nunca.',
    characterId: 'fire_lord',
    order: 1,
    spriteHint: 'teddy',
  },
  {
    id: 'col_inferno_receipt',
    name: 'Nota Fiscal — Botijao de Gas',
    lore: 'Nota fiscal amassada, parcialmente queimada nas bordas. "ULTRAGAZ — 1x Botijao P13. R$ 95,00. Data: [ilegivel]. CPF na nota: 142.xxx.xxx-xx." A mesma nota que todo brasileiro ja viu mil vezes. So que essa nota e o motivo. Se nao tivesse comprado gas aquele dia. Se tivesse sido eletrico. Se tivesse sido qualquer outra coisa. 95 reais. O preco de uma familia.',
    characterId: 'fire_lord',
    order: 2,
    spriteHint: 'paper',
  },
  {
    id: 'col_inferno_photo',
    name: 'Foto de Familia — Derretida',
    lore: 'A foto esta quase irreconhecivel — o calor fundiu a camada plastica com a imagem. Mas se voce olhar com cuidado, de um angulo especifico, da pra ver: quatro pessoas. Um homem mais velho (o pai), uma mulher jovem sorrindo (a mae que ja tinha ido embora? Uma tia?), um adolescente com camisa de time (ele), e uma menina pequena de vestido amarelo (Leticia). Todos sorrindo. A ultima vez. Cinza olha para esta foto toda noite. E toda noite, queima algo depois.',
    characterId: 'fire_lord',
    order: 3,
    spriteHint: 'photo',
  },
  {
    id: 'col_inferno_badge',
    name: 'Distintivo de Bombeiro',
    lore: 'Distintivo #2847 do Corpo de Bombeiros Militar de Goias. Encontrado a 200 metros da casa destruida. O bombeiro chegou rapido — rapido demais para o incendio ser normal. Provavelmente ja estava na vizinhanca quando a explosao aconteceu. Nao sobreviveu. Cinza encontrou o corpo no dia seguinte — carbonizado, mas de joelhos, como se tivesse morrido tentando levantar. Ele guarda o distintivo como lembrete: ate o fim, alguem tentou.',
    characterId: 'fire_lord',
    order: 4,
    spriteHint: 'badge',
  },
  {
    id: 'col_inferno_psych_eval',
    name: 'Avaliacao Psicologica — Confidencial',
    lore: 'RELATORIO — Submarino Tupi, Dept. Psicologico. Paciente: "Cinza" (nome real riscado). Diagnostico: TEPT grave, piromania compulsiva, ideacao suicida recorrente mascarada como "comportamento de risco". Nota do psicologo: "Paciente demonstra zero valor pela propria vida mas alta eficiencia em combate. Funcional para missoes. Nao funcional como ser humano. Recomendacao: manter em campo. E o unico lugar onde nao tenta morrer." [Carimbo: APROVADO PARA OPERACOES]',
    characterId: 'fire_lord',
    order: 5,
    spriteHint: 'document',
  },
  {
    id: 'col_inferno_lighter',
    name: 'Isqueiro do Pai',
    lore: 'Zippo de aco com as iniciais "R.S." gravadas. O pai era fumante — o unico vicio dele. Cinza encontrou o isqueiro intacto nos escombros. Como sobreviveu ao calor, ele nao sabe. O mecanismo ainda funciona perfeitamente. Ele o usa para acender cada arma incendiaria que constroi. Cada chama que cria comeca com o isqueiro do pai. Como se, de alguma forma, o velho ainda estivesse ajudando. Ainda estivesse ali.',
    characterId: 'fire_lord',
    order: 6,
    spriteHint: 'lighter',
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// MARE COLLECTIBLES — Operacoes Submarinas
// ═══════════════════════════════════════════════════════════════════════════════

export const MARE_COLLECTIBLES: Collectible[] = [
  {
    id: 'col_mare_mission_log',
    name: 'Log de Missao — Op. Ancora',
    lore: 'SUBMARINO TUPI — LOG DE MISSAO #012. Operacao: Ancora. Objetivo: Reconhecimento da costa de Santos. Status: FRACASSO. Detalhes: "Superficie confirmada hostil. Detectamos 3 naves alien classe-media em patrulha a 50m de altitude. Porto de Santos completamente destruido. Nenhuma atividade humana detectada em 30km. Lancamos drone de superficie — destruido em 8 segundos. Recomendacao: Santos e territorio perdido. Nao alocar recursos." Assinado: Tenente-Comandante "Mare".',
    characterId: 'aqua_sage',
    order: 1,
    spriteHint: 'document',
  },
  {
    id: 'col_mare_blueprints',
    name: 'Projeto — Cidade Submarina',
    lore: 'Planta arquitetonica: "PROJETO ATLANTIS — Habitacao Submarina Permanente". Capacidade: 5.000 pessoas. Profundidade: 300m. Status: 40% construida. Notas do engenheiro: "Usando estruturas de plataformas de petroleo como base. Energia: reator nuclear do submarino Tikuna. Oxigenio: eletrolise + algas modificadas. Comida: aquicultura + racionamento. Viavel por 10 anos. Apos isso..." A frase termina sem conclusao. Dez anos. E depois?',
    characterId: 'aqua_sage',
    order: 2,
    spriteHint: 'blueprint',
  },
  {
    id: 'col_mare_dissection',
    name: 'Relatorio de Dissecacao — Especie 07',
    lore: 'SUBMARINO TUPI — LABORATORIO BIOLOGICO. Especie: 07-"Atirador". Especimen: Capturado vivo na costa de Paraty, incapacitado por pressao submarina. Observacoes: Sistema circulatorio baseado em cobre (sangue azul-esverdeado). Tres coracoes. Cerebro descentralizado — ganglio principal no torax, secundarios nos membros. Implicacao: "tiros na cabeca" sao ineficazes. Mirar no peito. SEMPRE no peito.',
    characterId: 'aqua_sage',
    order: 3,
    spriteHint: 'document',
  },
  {
    id: 'col_mare_personal_log',
    name: 'Diario Pessoal de Maré — Dia 22',
    lore: '"Faz 22 dias que nao vejo o sol. O submarino nao tem janelas — obvio. Mas eu sinto falta. Da luz natural, do vento no rosto. Subi ao periscópio hoje. Vi o ceu. Estava... errado. Nao azul. Nao cinza. Algo entre roxo e verde. Como se a atmosfera tivesse mudado de composicao. Ou como se algo estivesse entre nos e o sol, filtrando a luz. O ar da superficie ainda e respiravel. Por enquanto. Quanto tempo ate nao ser?"',
    characterId: 'aqua_sage',
    order: 4,
    spriteHint: 'book',
  },
  {
    id: 'col_mare_weapon_spec',
    name: 'Especificacao — Arma Hidrica Mk.III',
    lore: 'PROJETO: Arma de pressao hidrica para combate de superficie. Versao: Mk.III. Principio: agua comprimida a 500 atm, liberada em jatos cortantes. Baseado em tecnologia de corte industrial (water jet) miniaturizada com componentes alien. Notas de teste: "Corta armadura de tanque a 20m. Corta concreto a 10m. Corta TUDO a 5m. Peso: 12kg com reservatorio cheio. Problema: reservatorio dura 45 segundos de uso continuo. Solucao: operar perto de fonte de agua." Assinado: Div. Engenharia, Submarino Tupi.',
    characterId: 'aqua_sage',
    order: 5,
    spriteHint: 'blueprint',
  },
  {
    id: 'col_mare_letter',
    name: 'Carta Nunca Enviada',
    lore: '"Mae, sei que voce provavelmente nao esta mais... nao. Nao vou escrever isso. Mae, voce ESTA viva. Voce saiu de Vitoria. Voce foi pro interior como eu disse. Voce esta escondida, segura, esperando. E eu vou te encontrar. Quando a Operacao Ressurgencia comecar, quando tomarmos a superficie de volta, eu vou procurar. Nem que leve anos. Eu vou. Aguenta firme. Sua filha ainda esta lutando." [A carta esta dobrada, amarelada, com marcas de lagrimas secas. Nunca foi enviada. Nao ha como enviar.]',
    characterId: 'aqua_sage',
    order: 6,
    spriteHint: 'letter',
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// PULSO COLLECTIBLES — Fusao e Radiacao
// ═══════════════════════════════════════════════════════════════════════════════

export const PULSO_COLLECTIBLES: Collectible[] = [
  {
    id: 'col_pulso_dosimeter',
    name: 'Dosimetro — SATURADO',
    lore: 'Dosimetro pessoal de radiacao. O marcador esta no maximo — alem do maximo. O indicador ultrapassou a escala e parou. O dispositivo nao foi projetado para medir este nivel de exposicao porque este nivel de exposicao deveria ser instantaneamente fatal. No verso, etiqueta: "PROPRIEDADE DE: Matheus C. — Tecnico de manutencao, Usina Angra III". Matheus e o nome que Pulso nao usa mais. Matheus morreu no reator. O que saiu era outra coisa.',
    characterId: 'storm_runner',
    order: 1,
    spriteHint: 'device',
  },
  {
    id: 'col_pulso_tissue',
    name: 'Amostra de Tecido Fusionado',
    lore: 'Frasco de formol contendo um pedaco de pele. Metade e claramente humana — poros, pelos, melanina. A outra metade e algo impossivel: escamas microscopicas, bioluminescentes, que pulsam com uma luz azul-violeta. A transicao entre humano e alien nao e abrupta — e gradual. As celulas se misturaram como tintas na agua. Nota do laboratorio: "Amostra retirada do antebraco esquerdo do paciente Pulso. As celulas alien estao se expandindo a uma taxa de 0.3% por dia."',
    characterId: 'storm_runner',
    order: 2,
    spriteHint: 'vial',
  },
  {
    id: 'col_pulso_reactor_log',
    name: 'Log do Reator — Ultimas Horas',
    lore: 'ANGRA III — REGISTRO AUTOMATICO. 02:14 — Alerta sismico. Origem: impacto externo. 02:15 — Integridade do contencao: 97%. 02:16 — ALERTA: Objeto nao-identificado penetrou a cupula de contencao. 02:16 — ALERTA CRITICO: Barras de controle nao respondem. 02:17 — Temperatura do nucleo: 800°C e subindo. 02:17 — Evacuacao automatica iniciada. 02:18 — Temperatura: 2400°C. Fusao do nucleo em progresso. 02:18 — [SENSOR DESTRUIDO] 02:19 — [SEM DADOS] [O registro para aqui. Pulso diz que lembra dos proximos 11 minutos. Cada segundo. Nao conta o que aconteceu.]',
    characterId: 'storm_runner',
    order: 3,
    spriteHint: 'device',
  },
  {
    id: 'col_pulso_voices',
    name: 'Transcricao — "Vozes do Enxame"',
    lore: 'TRANSCRICAO DE SESSAO — Paciente "Pulso". Psicologo: "Descreva o que voce ouve." Pulso: "Nao e ouvir. E como... sentir palavras. Sem som. Sem lingua. So significado." Psicologo: "O que eles dizem?" Pulso: "A maioria e... coordenacao. Direcoes. Ordens. Ir aqui. Fazer isso. Como formigas. Mas as vezes..." Psicologo: "As vezes?" Pulso: "As vezes eles falam sobre nos. Sobre humanos. E nao e odio. E... curiosidade. Como um cientista olhando para uma bacteria. Nos somos interessantes. So isso. Nao importantes. Nao ameaca. Interessantes."',
    characterId: 'storm_runner',
    order: 4,
    spriteHint: 'document',
  },
  {
    id: 'col_pulso_countdown',
    name: 'Relatorio Medico — 47 Dias',
    lore: 'RELATORIO MEDICO — CONFIDENCIAL. Paciente: "Pulso". Condicao: Fusao celular progressiva human-alien. Prognostico: A taxa de conversao celular e constante. Em 47 dias (+/- 3), a porcentagem de tecido alien ultrapassara 50%. Apos esse ponto: desconhecido. Hipoteses: (A) Morte por rejeicao sistemica. (B) Conversao completa — perda da consciencia humana. (C) Estabilizacao em estado hibrido permanente. Probabilidades: A=40%, B=35%, C=25%. Recomendacao: maximizar utilidade operacional no tempo restante. [Nota manuscrita de Pulso: "Ou D: eu me torno algo novo. Algo melhor. Algo que eles nao esperam."]',
    characterId: 'storm_runner',
    order: 5,
    spriteHint: 'document',
  },
  {
    id: 'col_pulso_photo_town',
    name: 'Foto — Cidade de Angra (Antes)',
    lore: 'Cartao-postal turistico de Angra dos Reis. Praias cristalinas, lanchas, coqueiros, montanhas verdes. No verso, carimbo dos Correios de 2022 e uma mensagem: "Vó, aqui e lindo. Arranjei emprego na usina. Vou te visitar no Natal. Bejo, Matheus." A cidade na foto nao existe mais. O derretimento do nucleo criou uma zona de exclusao de 30km. A radiacao matou tudo que os aliens nao mataram primeiro. A vó... provavelmente nunca soube o que aconteceu com o neto.',
    characterId: 'storm_runner',
    order: 6,
    spriteHint: 'photo',
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// ABISMO COLLECTIBLES — A Fenda e o Outro Lado
// ═══════════════════════════════════════════════════════════════════════════════

export const ABISMO_COLLECTIBLES: Collectible[] = [
  {
    id: 'col_abismo_notebook',
    name: 'Caderno de Equacoes Quanticas',
    lore: 'Caderno universitario de 200 paginas, completamente preenchido. As primeiras 50 paginas sao fisica quantica convencional — equações de Schrodinger, diagramas de Feynman. As seguintes 100 sao... algo mais. Simbolos que nao existem em nenhuma notação cientifica. Equações que se contradizem e se resolvem simultaneamente. As ultimas 50 paginas foram escritas apos o retorno de Fenda. Os fisicos do submarino dizem que "fazem sentido impossível". Que descrevem coisas que nao deveriam ser descritíveis.',
    characterId: 'void_walker',
    order: 1,
    spriteHint: 'book',
  },
  {
    id: 'col_abismo_photo_other',
    name: 'Foto — "O Outro Lado"',
    lore: 'Uma fotografia Polaroid que nao deveria existir. Fenda nao levou camera ao outro lado. A foto apareceu no bolso de sua calca quando voltou. Mostra: um horizonte sem chao e sem ceu. Estruturas que parecem cidades invertidas, pendendo de nada. Luz vindo de todas as direcoes simultaneamente. E no centro, muito distante, algo escuro. Enorme. Esférico. Com olhos. Muitos olhos. Ninguem alem de Fenda olha para esta foto por mais de 5 segundos sem sentir nausea.',
    characterId: 'void_walker',
    order: 2,
    spriteHint: 'photo',
  },
  {
    id: 'col_abismo_clock',
    name: 'Relogio Distorcido',
    lore: 'Relogio de pulso Casio F-91W. O mais comum do mundo. Mas este marca o tempo ao contrário. O ponteiro dos segundos gira no sentido anti-horário. A hora diminui em vez de aumentar. A data retrocede. Fenda o usava quando caiu na fenda. Quando voltou, o relogio marcava uma data 300 anos no passado. E continua voltando. Os cientistas calculam que, pela taxa atual, em 2 meses o relogio marcará o momento exato do Big Bang. Ninguem sabe o que acontece depois.',
    characterId: 'void_walker',
    order: 3,
    spriteHint: 'watch',
  },
  {
    id: 'col_abismo_interview',
    name: 'Transcricao — "O Que Ha La"',
    lore: 'TRANSCRICAO — Debriefing de "Fenda", Dia 3 pos-retorno. Comandante: "O que voce viu do outro lado?" Fenda: "Tudo. Nada. As duas coisas sao a mesma la." Comandante: "Pode ser mais especifico?" Fenda: "O espaco nao tem direcao. O tempo nao tem sequencia. Eu vivi toda a minha vida — passado, presente, futuro — simultaneamente. Vi minha morte. Vi meu nascimento. Vi o fim do universo. Vi o inicio. E entre tudo isso... vi ELES. Os que vieram. E vi o que os fez vir." Comandante: "O que os fez vir?" [LONGO SILENCIO — 47 segundos] Fenda: "Medo." [FIM DA TRANSCRICAO]',
    characterId: 'void_walker',
    order: 4,
    spriteHint: 'document',
  },
  {
    id: 'col_abismo_scar',
    name: 'Diagrama — Cicatrizes Dimensionais',
    lore: 'Mapa de Sao Paulo e arredores com marcacoes em vermelho indicando "cicatrizes dimensionais" — pontos onde o tecido do espaco-tempo esta enfraquecido. Ha 247 marcacoes. A maior e a fenda principal sobre o centro da cidade. As menores sao onde teletransportadores e distorcoes temporais operam. Nota de Fenda: "As cicatrizes estao se conectando. Formando um padrão. Um circulo. Quando o circulo se fechar... outra fenda. Maior. Permanente. E o que esta do outro lado VAI passar." Data estimada de fechamento do circulo: 6 meses.',
    characterId: 'void_walker',
    order: 5,
    spriteHint: 'map',
  },
  {
    id: 'col_abismo_mirror',
    name: 'Fragmento de Espelho — Reflexo Errado',
    lore: 'Pedaco de espelho que Fenda carrega no bolso. Quem olha nao ve seu proprio reflexo — ve uma versao levemente diferente. Mais velha, ou mais jovem, ou com roupas diferentes. Sempre olhando de volta com uma expressao que voce NAO esta fazendo. Os cientistas dizem que o espelho esta mostrando versoes de realidades adjacentes. Fenda diz que e mais simples: "E a versao de voce que nao sobreviveu. Olhando com inveja. Querendo trocar de lugar."',
    characterId: 'void_walker',
    order: 6,
    spriteHint: 'mirror',
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// DOMADORA COLLECTIBLES — Necromancia Alien
// ═══════════════════════════════════════════════════════════════════════════════

export const DOMADORA_COLLECTIBLES: Collectible[] = [
  {
    id: 'col_domadora_brain_diagram',
    name: 'Diagrama — Cerebro Alien',
    lore: 'Desenho detalhado de um cerebro alienigena com anotacoes em letra miuda. "GANGLIO CENTRAL: Controle motor. GANGLIO DORSAL: Comunicacao com Enxame. GANGLIO VENTRAL: Memoria? Instintos? AREA CINZA (sem nome): Ativa apos morte por 3-7 horas. Hipotese: sistema de backup — o cerebro tenta retransmitir memorias apos morte para o Enxame. Se eu bloquear a transmissao e estimular o ganglio central... controle motor pos-mortem. Testado em 14 especimens. Funciona em 11. Taxa de 78%."',
    characterId: 'beast_tamer',
    order: 1,
    spriteHint: 'diagram',
  },
  {
    id: 'col_domadora_frequencies',
    name: 'Lista de Frequencias EM',
    lore: 'Folha de caderno coberta de numeros. "FREQUENCIAS DE CONTROLE: Scout: 2.4 GHz (pulso curto). Recruta: 2.4 GHz (pulso longo). Tanque: 1.8 GHz (onda quadrada). Atirador: 3.1 GHz (modulacao AM). NOTA: Frequencia do Enxame (comunicacao): 5.8 GHz. NAO USAR. Risco de atrair vivos. FREQUENCIA PROIBIDA: 7.7 GHz. Causa despertar completo — alien volta a consciencia. Recupera memorias. Recupera RAIVA. Testei uma vez. Nunca mais."',
    characterId: 'beast_tamer',
    order: 2,
    spriteHint: 'paper',
  },
  {
    id: 'col_domadora_ethics',
    name: 'Carta de Resignacao — Comite de Etica',
    lore: 'PARA: Conselho do Submarino Tupi. DE: Dr. Helena Rocha, Representante de Etica. ASSUNTO: RESIGNACAO IMEDIATA. "Nao posso mais fazer parte de um conselho que aprova os experimentos da operativa Nex. O que ela faz nao e ciencia — e profanacao. Usar cadaveres como armas? Manipular restos como marionetes? Onde esta a linha? SE ELES FIZESSEM ISSO COM NOSSOS MORTOS, chamariamos de crime de guerra. Eu me recuso. Eu saio." [Nota no rodape, outra letra: "Dra. Rocha morreu na missao seguinte. Ironia: Nex reanimou o alien que a matou e o usou para proteger a evacuacao de civis."]',
    characterId: 'beast_tamer',
    order: 3,
    spriteHint: 'letter',
  },
  {
    id: 'col_domadora_personal',
    name: 'Diario de Nex — Entrada 1',
    lore: '"Eu era veterinaria. Cuidava de gatos, cachorros, cavalos. Vida simples. Quando o Evento comecou e todos os animais da clinica entraram em panico, eu os soltei. Todos. Ate o rottweiler agressivo. Porque nenhum bicho merece morrer em gaiola. Depois, quando encontrei o primeiro alien morto, eu so... quis entender. Como qualquer vet faria. Abri. Estudei. E quando vi que ainda se mexia... eu nao tive medo. Tive curiosidade. Sempre foi meu maior defeito."',
    characterId: 'beast_tamer',
    order: 4,
    spriteHint: 'book',
  },
  {
    id: 'col_domadora_dog_tags',
    name: 'Plaqueta de Identificacao — "Rex"',
    lore: 'Plaqueta metalica de coleira de cachorro. "REX — Se encontrado, ligar: (21) 98xxx-xxxx". Rex era um pastor-alemao que Nex tratou por 4 anos na clinica. Artrite, problemas de quadril, coracao grande. Nunca soube o que aconteceu com ele apos o Evento. Ate que um dia, em missao, encontrou um corpo canino mutado por esporos, irreconhecível. Mas a plaqueta estava la. Ela enterrou o corpo. Foi a unica vez que os outros a viram chorar.',
    characterId: 'beast_tamer',
    order: 5,
    spriteHint: 'tag',
  },
  {
    id: 'col_domadora_discovery',
    name: 'Nota — A Grande Descoberta',
    lore: '"DIA 34. EUREKA. A frequencia 5.8 GHz nao e so comunicacao — e CONTROLE. O Enxame nao se comunica democraticamente. Ha uma hierarquia. Ordens vem DE CIMA. Se eu conseguir gerar um sinal forte o suficiente em 5.8, posso INSERIR comandos na rede. Nao apenas mover mortos — mas confundir vivos. Faze-los atacar uns aos outros. O problema: preciso de um amplificador biologico vivo. Preciso de uma SENTINELA viva. E capturar uma... vai custar vidas. A pergunta e: quantas vidas salvo depois? Quantas justificam o custo?"',
    characterId: 'beast_tamer',
    order: 6,
    spriteHint: 'paper',
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// ALL COLLECTIBLES EXPORT
// ═══════════════════════════════════════════════════════════════════════════════

export const ALL_COLLECTIBLES: Collectible[] = [
  ...BASE_COLLECTIBLES,
  ...RAIZ_COLLECTIBLES,
  ...INFERNO_COLLECTIBLES,
  ...MARE_COLLECTIBLES,
  ...PULSO_COLLECTIBLES,
  ...ABISMO_COLLECTIBLES,
  ...DOMADORA_COLLECTIBLES,
];

/** Get collectibles available for current unlocked characters */
export function getAvailableCollectibles(unlockedCharIds: string[]): Collectible[] {
  return ALL_COLLECTIBLES.filter(c =>
    c.characterId === null || unlockedCharIds.includes(c.characterId)
  );
}

/** Get a random collectible to spawn (20% chance called externally) */
export function getRandomCollectible(unlockedCharIds: string[]): Collectible | null {
  const available = getAvailableCollectibles(unlockedCharIds);
  if (available.length === 0) return null;
  return available[Math.floor(Math.random() * available.length)];
}
