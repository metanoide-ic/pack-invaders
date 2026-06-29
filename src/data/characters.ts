/**
 * CHARACTER DEFINITIONS — 7 playable characters.
 * Post-Apocalyptic Alien Invasion lore. After "O Evento", each survived differently.
 * Only Raiz is unlocked initially.
 */

export interface CharacterDefinition {
  id: string;
  name: string;
  title: string;
  description: string;
  backstory: string;
  passive: string;
  backpackRows: number;
  backpackCols: number;
  /** Special backpack rule */
  backpackRule: 'stacking' | 'freeform' | 'rows_only' | 'columns_only' | 'diagonal' | 'tetris';
  startingHp: number;
  startingGold: number;
  startingItems: string[];
  /** Color index for player ship sprite (0-3) */
  shipColorIndex: number;
  /** Unlock condition description */
  unlockCondition: string;
  /** Is unlocked by default */
  unlockedByDefault: boolean;
  /** Lore unlocked on first play */
  lore1: string;
  /** Lore unlocked after completing missions */
  lore2: string;
  /** 6 gameplay advantages */
  advantages: string[];
  /** 3 gameplay disadvantages */
  disadvantages: string[];
}

export const GRASS_MAN: CharacterDefinition = {
  id: 'grass_man',
  name: 'Romulo',
  title: 'O Sobrevivente',
  description: 'Um biologo amador que se perdeu na mata durante o Evento. A floresta mutante o achou primeiro.',
  backstory: 'Estava acampando no Parque Nacional da Serra da Canastra quando o Evento comecou. Biologo amador, nao um heroi. Por 6 meses sobreviveu sozinho enquanto os esporos alienigenas mutavam a vegetacao ao redor. A floresta nao morreu — evoluiu para algo estranho, agressivo, e, descobriu ele, util. Aprendeu que as plantas mutadas reconhecem o Enxame como ameaca. Hoje ele e a floresta sao a mesma coisa.',
  passive: 'Itens ganham +75% dano por camada abaixo deles (stacking). Itens [Planta] curam 1 HP/s.',
  backpackRows: 6,
  backpackCols: 6,
  backpackRule: 'stacking',
  startingHp: 100,
  startingGold: 60,
  startingItems: ['basic_gun'],
  shipColorIndex: 2,
  unlockCondition: 'Disponivel desde o inicio.',
  unlockedByDefault: true,
  lore1: 'Seis meses sem ver outro humano. Comecei a ouvir as raizes. Parei de achar isso estranho.',
  lore2: 'A floresta lembra de cada alien que pisou nela. Cada um. E ela me mostra onde pisarao os proximos.',
  advantages: [
    'Itens empilhados: +75% dano por camada',
    'Itens [Planta] curam 1 HP/s',
    'Começa com 6x6 mochila (maior)',
    'Itens [Orgânico] custam -20% na loja',
    'Fusões de planta dão +30% extra',
    '+10 HP ao plantar um item na linha inferior',
  ],
  disadvantages: [
    'Itens DEVEM ser empilhados (de baixo pra cima)',
    '-20% dano em itens [Fogo]',
    'Não pode usar itens maiores que 2x3',
  ],
};

export const FIRE_LORD: CharacterDefinition = {
  id: 'fire_lord',
  name: 'Kagutsuchi',
  title: 'O Inconsolável',
  description: 'Perdeu a familia e o braco no primeiro dia. Hoje so o fogo o faz sentir algo.',
  backstory: 'Dia 1. Estava em casa com Ana (esposa) e Yuki (filha, 6 anos). Um drone alien de plasma atravessou a parede. Ele agarrou a maquina para dar tempo das duas fugirem — o gas explodiu. Acordou em um hospital de campanha sem o braco direito e sem a familia. Engenheiros sobreviventes construiram uma protese funcional: um braco mecanico integrado com um lanca-chamas de plasma alien. No peito, um relicario com a ultima foto das duas. O nome Kagutsuchi e o que os outros o chamam — o deus do fogo que foi destruido por seu proprio poder.',
  passive: 'Itens [Fogo] ganham +50% dano. Explosoes tem +30% raio. Perde 1 HP/s passivamente.',
  backpackRows: 5,
  backpackCols: 7,
  backpackRule: 'freeform',
  startingHp: 80,
  startingGold: 40,
  startingItems: ['fire_gun'],
  shipColorIndex: 1,
  unlockCondition: 'Alcance wave 10 com Raiz.',
  unlockedByDefault: false,
  lore1: 'O fogo levou tudo que eu amava. Levou meu braco. Mas o fogo tambem nao questiona. Nao hesita. Nao chora. Por isso eu o uso.',
  lore2: 'Toda vez que incinero um deles, abro o relicario. Conto ate tres. Fecho. E queimo o proximo.',
  advantages: [
    'Itens [Fogo] ganham +50% dano',
    'Explosões tem +30% de raio',
    'Mochila 5x7 (muitas colunas)',
    'Inimigos mortos tem 20% chance de explodir',
    'Crits causam combustão (dano ao longo do tempo)',
    'Começa com Braço Lança-Chamas (raro)',
  ],
  disadvantages: [
    'Perde 1 HP/s passivamente',
    'Itens [Água/Gelo] tem -40% eficiência',
    'Sem cura passiva de nenhuma fonte natural',
  ],
};

export const AQUA_SAGE: CharacterDefinition = {
  id: 'aqua_sage',
  name: 'Mazu',
  title: 'A Oficial da Marinha',
  description: 'Operativa da frota submarina. Disciplina militar e armamento aquatico pressurizado.',
  backstory: 'Tenente-Comandante Li Mazu, frota submarina da alianca militar internacional que sobreviveu ao Evento debaixo d\'agua. O Submarino Tupi e a maior concentracao de militares ativos restantes na Terra. Mazu e a melhor operativa de superficie: fria, precisa, letalmente eficiente. Usa canhoes de agua pressurizada e armamento criogenico adaptado de tecnologia alien capturada. Ela nao fala sobre sua familia. Nao porque morreu — porque ela mesma os mandou embora antes da invasao. Tomou uma decisao que nao pode desfazer.',
  passive: 'Projeteis [Agua] desaceleram inimigos em 30%. +2 HP/s de cura passiva.',
  backpackRows: 6,
  backpackCols: 6,
  backpackRule: 'columns_only',
  startingHp: 120,
  startingGold: 45,
  startingItems: ['basic_gun', 'watering_can'],
  shipColorIndex: 0,
  unlockCondition: 'Derrote o boss Hidra.',
  unlockedByDefault: false,
  lore1: 'Embaixo d\'agua tudo faz sentido. Ordens. Missoes. Objetivos. La em cima e so caos. E o meu trabalho transformar caos em derrota alien.',
  lore2: 'Mandei meus filhos para um abrigo antes de embarcar. Ainda nao sei se o abrigo existe. Essa incerteza e o que me faz voltar. Todo. Dia.',
  advantages: [
    'Projeteis [Água] desaceleram inimigos 30%',
    '+2 HP/s cura passiva constante',
    'Começa com 120 HP (o maior)',
    'Itens [Água] ganham +25% cadência',
    'Inimigos [Fogo] recebem 2x dano',
    'Regeneração dobra quando HP < 50%',
  ],
  disadvantages: [
    'Itens só podem ser colocados em colunas existentes',
    '-30% dano em itens [Instável]',
    'Movimento 15% mais lento no combate',
  ],
};

export const STORM_RUNNER: CharacterDefinition = {
  id: 'storm_runner',
  name: 'Frank',
  title: 'O Híbrido',
  description: 'Fisico nuclear fundido a um alien pela radiacao. Metade humano, metade Enxame.',
  backstory: 'Frank era fisico nuclear, chefe de turno da Usina de Angra. Quando a usina entrou em colapso durante o Evento, a radiacao deveria te-lo matado. Em vez disso, um organismo alien foi irradiado junto com ele e fundiu-se ao seu corpo em nivel celular. Metade do rosto e humano. A outra metade e uma carapaca alienigena viva e pulsante. Frank — ele insiste no nome simples, nao quer nada grandioso — passa cada dia lutando contra o alien dentro dele que quer dominar o que resta. 47 dias, disseram os cientistas. Isso foi ha 3 meses.',
  passive: 'Todos os emissores tem +40% cadencia e -20% dano. Pulsos instaveis ignoram armadura.',
  backpackRows: 5,
  backpackCols: 5,
  backpackRule: 'diagonal',
  startingHp: 90,
  startingGold: 55,
  startingItems: ['basic_gun', 'battery'],
  shipColorIndex: 3,
  unlockCondition: 'Mate 50 inimigos em uma unica wave.',
  unlockedByDefault: false,
  lore1: 'Me chamam de hibrido, de monstro, de experiencia. Eu prefiro Frank. Sempre fui Frank. E pretendo continuar sendo Frank ate o ultimo segundo.',
  lore2: 'O alien dentro de mim entende o Enxame. Ouve os sinais deles. Tem dias que quase concordo. Esses sao os dias mais perigosos.',
  advantages: [
    'Todos emissores +40% cadência',
    'Pulsos instáveis ignoram armadura',
    'Mochila diagonal (posicionamento criativo)',
    'A cada 10 kills, libera pulso radioativo em todos',
    'Projeteis instáveis ricocheteiam 1 vez',
    'Velocidade de movimento +25% no combate',
  ],
  disadvantages: [
    'Todos emissores -20% dano base',
    'Itens devem tocar diagonalmente (regra diagonal)',
    'HP máximo -20 comparado ao padrão',
  ],
};

export const VOID_WALKER: CharacterDefinition = {
  id: 'void_walker',
  name: 'Dr. Eon',
  title: 'O Intangível',
  description: 'Fisico cujo experimento o desconecta da realidade. Atravessa ataques sem querer.',
  backstory: 'Dr. Eon — sobrenome classificado, primeiro nome apagado dos registros — era fisico teorico especializado em mecanica quantica. Quando o Enxame abriu a fenda espaco-temporal sobre Sao Paulo, ele viu a oportunidade da sua vida e replicou o fenomeno em escala menor. O experimento funcionou demais: seu corpo deixou de estar completamente ancorado a este plano. Em momentos aleatorios, ele "pisca" para fora da realidade — atravessa paredes, ignora balas, cai pelo chao. Nao controla quando acontece. Os outros o chamam de Eon porque parece viver em outra era.',
  passive: 'Intangibilidade aleatoria: chance de atravessar ataques de inimigos vivos. Ganha +dano quanto mais arriscado o estado.',
  backpackRows: 7,
  backpackCols: 5,
  backpackRule: 'freeform',
  startingHp: 150,
  startingGold: 30,
  startingItems: ['basic_gun', 'void_crystal'],
  shipColorIndex: 0,
  unlockCondition: 'Venca o jogo com menos de 20 HP.',
  unlockedByDefault: false,
  lore1: 'Sabe o que e pior que ser atravessado por uma bala? Nao ser atravessado. Nao saber quando vai acontecer. Nao poder confiar no proprio chao.',
  lore2: 'Do outro lado eu vi de onde eles vem. Um vazio imenso e faminto. E vi algo pior: eles tambem tem medo. Do vazio. Vieram aqui fugindo de algo maior.',
  advantages: [
    'Chance de ficar intangível e ignorar dano',
    'Começa com 150 HP (o maior do jogo)',
    'Mochila 7x5 (alta, posição livre)',
    'Quanto menor o HP, maior o dano (até +100%)',
    'Crits tem +20% chance adicional',
    'Itens [Vazio] custam 50% menos',
  ],
  disadvantages: [
    'Não controla quando fica intangível',
    'Cura de todas as fontes reduzida em 50%',
    'Lojas tem 1 item a menos',
  ],
};

export const BEAST_TAMER: CharacterDefinition = {
  id: 'beast_tamer',
  name: 'Diana',
  title: 'A Domadora',
  description: 'Doma os proprios aliens. As vezes um inimigo morto se ergue e luta ao seu lado.',
  backstory: 'Diana era veterinaria e etologa especializada em comportamento de predadores. Enquanto todos viam monstros no Enxame, ela viu padroes: hierarquia, submissao, instinto. Descobriu que certos aliens respondem a dominancia da mesma forma que predadores terrestres — e aprendeu a quebra-los. Os outros sobreviventes a temem. Os aliens que ela doma, paradoxalmente, sao leais ate a morte. Diana aceita que o custo de seu metodo e perder um pouco de humanidade a cada alien que dobra. Ela paga o custo de bom grado.',
  passive: 'Itens [Pet]/[Animal] ganham +100% dano e +50% cadencia. Inimigos mortos tem chance de virar aliados.',
  backpackRows: 6,
  backpackCols: 7,
  backpackRule: 'freeform',
  startingHp: 90,
  startingGold: 60,
  startingItems: ['parrot', 'cat'],
  shipColorIndex: 2,
  unlockCondition: 'Tenha 4 pets na mochila simultaneamente.',
  unlockedByDefault: false,
  lore1: 'Perguntam como eu domino criaturas que tem o cerebro do tamanho de um carro. A resposta e simples: eu nao finjo que sou mais forte. Eu conveco que sou mais perigosa.',
  lore2: 'Encontrei a frequencia neural que os controla. Se eu amplificar o suficiente com o equipamento certo... talvez eu dome a Rainha. O custo e que eu precisaria pensar como ela pensa. Ja estou praticando.',
  advantages: [
    'Itens [Pet]/[Animal] ganham +100% dano',
    'Pets ganham +50% cadência',
    'Mochila 6x7 (a maior do jogo)',
    'Começa com 2 pets de graça',
    'Inimigos mortos viram aliados (sobem pela base, mais fracos)',
    'A cada 5 kills, invoca drone temporário',
  ],
  disadvantages: [
    'Itens sem tag [Pet]/[Animal] tem -30% dano',
    'Lojas só oferecem 3 itens (em vez de 5)',
    'Aliados domados são bem mais fracos que os aliens',
  ],
};

export const FIREFIGHTER: CharacterDefinition = {
  id: 'firefighter',
  name: 'Florian',
  title: 'O Guardião Quebrado',
  description: 'Bombeiro que falhou em salvar criancas no primeiro dia. Agora protege com obsessao.',
  backstory: 'Sargento Florian Kreuz, 18 anos de servico no Corpo de Bombeiros. Nunca tinha perdido uma vitima. Dia do Evento, chamado para "gato preso em arvore, criancas tentando ajudar". Chegou sorrindo. O gato tinha dezesseis olhos. Ele viu as criancas morrerem uma por uma antes de conseguir reagir. Desde entao, Florian nao dorme mais de 4 horas. Nao porque nao consegue — porque nao quer. Cada hora dormindo e uma hora que alguem pode morrer enquanto ele nao esta la. Ele e o escudo que falhou uma vez. Nunca mais vai falhar.',
  passive: 'Recebe -25% de dano quando esta acima de 50% HP. Itens [Água/Espuma] tambem protegem (escudo).',
  backpackRows: 6,
  backpackCols: 6,
  backpackRule: 'freeform',
  startingHp: 160,
  startingGold: 45,
  startingItems: ['basic_gun', 'watering_can'],
  shipColorIndex: 1,
  unlockCondition: 'Limpe uma wave (após a 5ª) sem receber nenhum dano.',
  unlockedByDefault: false,
  lore1: 'Era so um gato numa arvore. Eu cheguei sorrindo. Sorrindo. Nunca mais consegui fazer isso direito.',
  lore2: 'O nome Florian vem de Florianus — Santo Floriao, padroeiro dos bombeiros. Meu pai me deu esse nome com esperanca. Eu carrego ele como uma divida.',
  advantages: [
    'Maior HP do jogo (160) — um verdadeiro tanque',
    'Recebe -25% dano enquanto acima de 50% HP',
    'Jato de Espuma: desacelera todos os inimigos (skill)',
    'Escudo do Bombeiro: bloqueia tiros e cura 30 HP (skill)',
    'Machado Giratório: dano massivo em área (skill)',
    'Mochila 6x6 livre — fácil de montar',
  ],
  disadvantages: [
    'Movimento 20% mais lento (equipamento pesado)',
    '-15% cadência de tiro (foco em defesa, não ataque)',
    'Itens [Fogo] têm -30% de dano (trauma do fogo)',
  ],
};

// ─── All Characters Export ───────────────────────────────────────────────────

export const ALL_CHARACTERS: CharacterDefinition[] = [
  GRASS_MAN, FIRE_LORD, AQUA_SAGE, STORM_RUNNER, VOID_WALKER, BEAST_TAMER, FIREFIGHTER,
];

export function getCharacterById(id: string): CharacterDefinition | undefined {
  return ALL_CHARACTERS.find(c => c.id === id);
}

export function getUnlockedCharacters(): CharacterDefinition[] {
  // In a full implementation, this would check save data
  return ALL_CHARACTERS.filter(c => c.unlockedByDefault);
}
