import type { ItemDef } from '../core/types';

export const ITEMS: ItemDef[] = [
  {
    id: 'radio',
    name: 'Rádio de Válvulas',
    shape: 'radio',
    ownerName: 'Seu Bento',
    intro:
      '"Achei isso no porão da antiga oficina de táxi. Não sei se ainda pega alguma coisa, mas... eu queria ouvir de novo."',
    stages: ['clean', 'disassemble', 'weld', 'test'],
    baseColor: '#8a5a34',
    paintColor: '#c97b3d',
    storyLines: [
      'Sob a poeira de décadas, uma etiqueta ainda diz: "Rádio Aurora — Estação Central, 1998".',
      'Dentro, entre os fios, alguém guardou uma fita cassete com um rótulo escrito à mão: "ÚLTIMA TRANSMISSÃO — NÃO APAGAR".',
      'Os contatos estavam soldados às pressas — como se alguém tivesse consertado isso correndo, na última noite antes do apagão.',
      'O rádio liga. Por um segundo, estática. Depois, uma voz gravada: "Se alguém estiver ouvindo isso... ainda dá tempo."',
    ],
    choice: {
      prompt:
        'A fita com a última transmissão de rádio antes do colapso ainda funciona. O que você faz com ela?',
      options: [
        {
          id: 'broadcast',
          label: 'Tocar a gravação na praça, para todo mundo ouvir',
          description: 'A voz de antes do fim, ouvida por todos ao mesmo tempo.',
          effects: { esperanca: 8, memoria: 6, confianca: -2 },
          npcEffects: { theo: 10, iracema: 4 },
          resultText:
            'À noite, você liga o rádio na praça. A voz antiga enche o ar. Algumas pessoas choram, outras sorriem — mas todo mundo escuta até o fim. Theo pede para ouvir de novo no dia seguinte.',
        },
        {
          id: 'keep-private',
          label: 'Guardar a fita e devolver o rádio em silêncio',
          description: 'Nem tudo precisa ser ouvido por todos.',
          effects: { confianca: 6, memoria: -2 },
          npcEffects: { aldo: 5 },
          resultText:
            'Você devolve o rádio sem mencionar a fita. Seu Bento aperta sua mão, grato pelo silêncio — algumas memórias, ele diz, são só suas.',
        },
      ],
    },
  },
  {
    id: 'musicbox',
    name: 'Caixinha de Música',
    shape: 'musicbox',
    ownerName: 'Dona Iracema',
    intro:
      '"Era da minha filha. Ela sumiu na travessia, ano passado. Não toca mais desde então — talvez nunca tenha sido a caixinha que quebrou."',
    stages: ['clean', 'paint', 'test'],
    baseColor: '#6b4226',
    paintColor: '#b8863b',
    storyLines: [
      'Por baixo da sujeira, há um desenho entalhado à mão: duas figuras pequenas, de mãos dadas.',
      'A tinta original quase desapareceu, mas ainda dá para ver onde alguém pintou, com cuidado, os detalhes das flores na tampa.',
      'A manivela range, mas quando finalmente gira, uma melodia simples e desafinada preenche a oficina.',
    ],
    choice: {
      prompt:
        'Enquanto limpa a caixinha, você encontra um bilhete escondido no fundo falso: o endereço de uma família em outro vilarejo, que pode ser da filha de Dona Iracema.',
      options: [
        {
          id: 'tell-iracema',
          label: 'Contar a Dona Iracema sobre o bilhete',
          description: 'Uma esperança frágil — e talvez dolorosa.',
          effects: { esperanca: 10, confianca: 4 },
          npcEffects: { iracema: 15 },
          resultText:
            'Dona Iracema segura o bilhete com as duas mãos, tremendo. "Vou mandar alguém até lá", ela diz, com uma esperança que ela mesma parece desconfiar. Ela nunca mais te deixa sem um agrado na bancada.',
        },
        {
          id: 'keep-secret',
          label: 'Guardar o bilhete até ter certeza',
          description: 'Melhor não prometer o que talvez nunca chegue.',
          effects: { confianca: 3, esperanca: -3 },
          npcEffects: { iracema: 2 },
          resultText:
            'Você devolve só a caixinha, consertada, e guarda o bilhete numa gaveta. Talvez seja covardia, talvez seja cuidado — você ainda não sabe qual das duas.',
        },
      ],
    },
  },
  {
    id: 'bike',
    name: 'Bicicleta Torta',
    shape: 'bike',
    ownerName: 'sem dono — encontrada na estrada',
    intro:
      '"Achamos essa bike torta perto da ponte velha, sem ninguém por perto. Ninguém apareceu pra reclamar dela em semanas."',
    stages: ['disassemble', 'weld', 'paint', 'test'],
    baseColor: '#3f5d4e',
    paintColor: '#d9622b',
    storyLines: [
      'No quadro, gravado a canivete: "Se achar isso, as entregas continuam. — M."',
      'Presa no bagageiro, uma bolsa de mensageiro surrada, ainda com um mapa de rotas entre os vilarejos vizinhos.',
      'A corrente estava travada havia tanto tempo que enferrujou soldada — quem a usou por último pedalou até não poder mais.',
      'Depois de ajustada, a bicicleta roda solta e silenciosa, como se estivesse esperando alguém para continuar a rota.',
    ],
    choice: {
      prompt:
        'A bicicleta pode virar o início de uma rota de entregas entre os vilarejos vizinhos — ou pode ficar exposta na oficina, como lembrança de quem a usava.',
      options: [
        {
          id: 'delivery-route',
          label: 'Doar a bicicleta para criar uma rota de entregas',
          description: 'Conectar os vilarejos de novo, um pedal de cada vez.',
          effects: { esperanca: 9, confianca: 5 },
          npcEffects: { vic: 8 },
          resultText:
            'Vic se oferece para pedalar a primeira rota. "Já entreguei coisa pior em lugar pior", ela diz, quase sorrindo. Semanas depois, cartas e conservas começam a circular entre os vilarejos de novo.',
        },
        {
          id: 'memorial',
          label: 'Deixar a bicicleta exposta na oficina, intacta',
          description: 'Um memorial silencioso para quem a perdeu.',
          effects: { memoria: 10, esperanca: -2 },
          resultText:
            'Você pendura a bicicleta na parede da oficina, com o bilhete de "M." ao lado. Visitantes param para ler. Ninguém mais pedala essa rota — mas ninguém esquece dela.',
        },
      ],
    },
  },
  {
    id: 'typewriter',
    name: 'Máquina de Escrever',
    shape: 'typewriter',
    ownerName: 'encontrada no que sobrou do jornal local',
    intro:
      '"Isso veio dos escombros da redação do jornal. Ainda tem uma folha presa no rolo — nunca tirei pra ler."',
    stages: ['clean', 'disassemble', 'weld', 'test'],
    baseColor: '#2f2f33',
    paintColor: '#4a4a52',
    storyLines: [
      'A folha presa no rolo tem um título datilografado: "O QUE NINGUÉM QUIS PUBLICAR".',
      'Entre as teclas emperradas, um clipe prende um maço de páginas soltas, escritas às pressas.',
      'As páginas descrevem, em detalhes, os últimos dias antes do colapso — decisões erradas, avisos ignorados, nomes.',
      'Depois do reparo, as teclas voltam a bater com um som seco e satisfatório. A máquina está pronta para escrever de novo.',
    ],
    choice: {
      prompt:
        'As páginas encontradas na máquina descrevem, com nomes, quem tomou as decisões que levaram ao colapso — algumas dessas pessoas ainda vivem no vilarejo.',
      options: [
        {
          id: 'publish',
          label: 'Publicar as páginas no mural da praça',
          description: 'A verdade, mesmo que doa em quem ainda está aqui.',
          effects: { memoria: 10, confianca: -6, esperanca: 2 },
          npcEffects: { aldo: -5, vic: 6 },
          resultText:
            'O mural vira ponto de discussão por dias. Seu Aldo evita você por um tempo — um dos nomes era próximo dele. Vic, pela primeira vez, parece confiar mais no lugar: "pelo menos aqui não escondem as coisas".',
        },
        {
          id: 'let-rest',
          label: 'Deixar as páginas descansarem, guardadas',
          description: 'Reconstruir sem reabrir feridas antigas.',
          effects: { confianca: 6, memoria: -4 },
          npcEffects: { aldo: 4 },
          resultText:
            'Você guarda as páginas numa caixa, junto com a máquina consertada. Seu Aldo nunca pergunta o que você encontrou — mas parece um pouco mais leve nos dias seguintes.',
        },
      ],
    },
  },
  {
    id: 'clock',
    name: 'Relógio de Parede',
    shape: 'clock',
    ownerName: 'do antigo prefeito',
    intro:
      '"Esse relógio ficava na sala do prefeito, antes de tudo acontecer. Achei justo trazer pra você — não sei se ainda serve pra alguma coisa."',
    stages: ['clean', 'weld', 'paint', 'test'],
    baseColor: '#5a3a29',
    paintColor: '#caa24a',
    storyLines: [
      'Os ponteiros pararam às 23h47 — o horário, dizem, em que a energia da cidade acabou de vez.',
      'Atrás do mostrador, um mecanismo de corda ainda intacto, esperando ser rearmado.',
      'Gravada na base: "Para lembrarmos que o tempo continua, mesmo quando tudo mais para."',
      'O pêndulo balança de novo, firme, e o tique-taque preenche a oficina pela primeira vez em anos.',
    ],
    choice: {
      prompt:
        'O relógio pode voltar à praça central, marcando as horas para todo o vilarejo — ou pode ficar guardado num pequeno museu improvisado, como peça de memória.',
      options: [
        {
          id: 'town-square',
          label: 'Reinstalar o relógio na praça central',
          description: 'O tempo volta a ser contado junto, em público.',
          effects: { esperanca: 7, confianca: 7, memoria: 2 },
          npcEffects: { iracema: 5, theo: 5 },
          resultText:
            'Quando o relógio é içado na torre da praça, um pequeno grupo se reúne para ver. No primeiro meio-dia, alguém grita "meio-dia!" só para ouvir a própria voz marcando a hora certa, como antigamente.',
        },
        {
          id: 'museum',
          label: 'Doar o relógio ao museu improvisado',
          description: 'Preservar o objeto como testemunha do que passou.',
          effects: { memoria: 8, esperanca: -1 },
          npcEffects: { aldo: 6 },
          resultText:
            'O relógio ganha um lugar de honra ao lado de outros objetos salvos. Seu Aldo passa a tarde ali, contando pra quem visita a história de cada peça — inclusive a do relógio que parou às 23h47.',
        },
      ],
    },
  },
];
