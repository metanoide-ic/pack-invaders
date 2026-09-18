/**
 * TIMELINE — Monthly flavor texts for the invasion timeline.
 * 48 entries (4 years). Dark, atmospheric tone. Portuguese (BR).
 * Displayed at the start of each month during wave transition.
 */

export interface MonthlyEvent {
  /** Total months elapsed (1 = first month) */
  month: number;
  /** Flavor text shown during transition */
  text: string;
}

export const MONTHLY_EVENTS: MonthlyEvent[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // ANO 1
  // ═══════════════════════════════════════════════════════════════════════════
  { month: 1, text: 'Sinais de origem desconhecida. O céu está diferente hoje.' },
  { month: 2, text: 'As sirenes pararam. O silêncio é pior.' },
  { month: 3, text: 'Os rádios captaram frequências impossíveis. Depois pararam.' },
  { month: 4, text: 'Encontramos outros sobreviventes. Poucos.' },
  { month: 5, text: 'A chuva tem gosto de metal agora.' },
  { month: 6, text: 'Seis meses desde o primeiro sinal. Já esqueci como era antes.' },
  { month: 7, text: 'Algo cresce onde os corpos caem.' },
  { month: 8, text: 'O chão treme à noite. Não são terremotos.' },
  { month: 9, text: 'Um cientista decifrou parte da linguagem deles. Desejou não ter feito isso.' },
  { month: 10, text: 'As estrelas sumiram atrás da poeira orbital.' },
  { month: 11, text: 'Os animais que sobreviveram estão mudando.' },
  { month: 12, text: 'Um ano. Ainda estamos aqui.' },

  // ═══════════════════════════════════════════════════════════════════════════
  // ANO 2
  // ═══════════════════════════════════════════════════════════════════════════
  { month: 13, text: 'Segundo ano. Eles não param. Nós também não.' },
  { month: 14, text: 'As cidades são deles agora. Nós vivemos nas sombras.' },
  { month: 15, text: 'A Operação Ressurgência começa. Temos um plano.' },
  { month: 16, text: 'Perdemos contato com o litoral norte. Silêncio total.' },
  { month: 17, text: 'Os sonhos ficaram estranhos. Todos sonham a mesma coisa.' },
  { month: 18, text: 'Uma segunda fenda abriu. O ar cheira a ozônio e desespero.' },
  { month: 19, text: 'Descobrimos um bunker militar intacto. Vazio. Trancado por dentro.' },
  { month: 20, text: 'As plantas alienígenas floresceram. É quase bonito. Quase.' },
  { month: 21, text: 'Sinais vindos do interior da Amazônia. Algo está crescendo.' },
  { month: 22, text: 'Não chove mais. A água vem de fontes subterrâneas contaminadas.' },
  { month: 23, text: 'As crianças nascidas após o Evento são... diferentes.' },
  { month: 24, text: 'Dois anos de guerra. Três por cento da humanidade sobrevive.' },

  // ═══════════════════════════════════════════════════════════════════════════
  // ANO 3
  // ═══════════════════════════════════════════════════════════════════════════
  { month: 25, text: 'Terceiro ano. A resistência se profissionaliza.' },
  { month: 26, text: 'Diana decifrou a frequência de controle. Testando em campo.' },
  { month: 27, text: 'Um enxame inteiro parou de atacar por 3 horas. Depois voltou pior.' },
  { month: 28, text: 'O submarino captou transmissões de outro continente. Há outros vivos.' },
  { month: 29, text: 'Os cadáveres alienígenas não decompõem mais. Acumulam-se.' },
  { month: 30, text: 'Diana dominou a frequência. Podemos virar o jogo.' },
  { month: 31, text: 'A fenda de São Paulo está se expandindo. Três quarteirões por semana.' },
  { month: 32, text: 'Frank não tem mais muito tempo. Ele sabe. Continua lutando.' },
  { month: 33, text: 'Encontramos inscrições alienígenas idênticas a hieróglifos egípcios.' },
  { month: 34, text: 'O horizonte brilha à noite. Não é o sol. Não é fogo.' },
  { month: 35, text: 'Dr. Eon disse algo pela primeira vez em semanas: "Eles têm medo."' },
  { month: 36, text: 'A Rainha enviou uma mensagem. Termos de rendição. Resposta: não.' },

  // ═══════════════════════════════════════════════════════════════════════════
  // ANO 4
  // ═══════════════════════════════════════════════════════════════════════════
  { month: 37, text: 'Quarto ano. Somos poucos. Somos o suficiente.' },
  { month: 38, text: 'A atmosfera mudou de composição. Respirar dói um pouco agora.' },
  { month: 39, text: 'Um alien se rendeu. Primeiro caso documentado. Não sabemos o que fazer.' },
  { month: 40, text: 'O solo em algumas regiões pulsa. Como um coração.' },
  { month: 41, text: 'Interceptamos uma mensagem deles para casa: "Resistência inesperada."' },
  { month: 42, text: 'Mazu trouxe dados do fundo do oceano. O ninho principal fica lá embaixo.' },
  { month: 43, text: 'Os que sobreviveram até aqui não são mais totalmente humanos. Nenhum de nós.' },
  { month: 44, text: 'Rômulo ouviu a floresta falar. Não em palavras. Em intenções.' },
  { month: 45, text: 'Kagutsuchi apagou o fogo pela primeira vez. Disse que precisa sentir frio para lembrar.' },
  { month: 46, text: 'A frequência de Diana funciona. Os pequenos obedecem. Os grandes resistem.' },
  { month: 47, text: 'Algo se move na fenda. Algo maior que o Titã. Algo que vem.' },
  { month: 48, text: 'A última transmissão conhecida. Depois disso, só nós. Só o silêncio. E eles.' },
];

/**
 * Get the flavor text for a given total month count.
 * If beyond month 48, cycles with increasingly dire generic messages.
 */
export function getMonthlyFlavorText(totalMonths: number): string {
  const event = MONTHLY_EVENTS.find(e => e.month === totalMonths);
  if (event) return event.text;

  // Beyond year 4: generic escalating messages
  const extras = [
    'O tempo perdeu significado. Só a luta permanece.',
    'Cada dia é uma vitória impossível.',
    'A humanidade não deveria ter durado tanto. Mas aqui estamos.',
    'Eles mandam mais. Nós aguentamos mais.',
    'O mundo antigo é um sonho distante.',
    'Não contamos mais os dias. Contamos os inimigos.',
    'A escuridão é constante. A resistência também.',
    'Já não lembramos paz. Só lembramos luta.',
  ];
  return extras[(totalMonths - 49) % extras.length];
}
