/**
 * CHARACTER DEFINITIONS — 7 playable characters.
 * Post-Apocalyptic Alien Invasion lore. After "O Evento", each survived differently.
 * Only Rômulo is unlocked initially.
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
  name: 'Rômulo',
  title: 'O Sobrevivente',
  description: 'Um homem comum que se escondeu na mata. Aprendeu a transformar a selva mutante em arma.',
  backstory: 'Nao era soldado, nem heroi. Apenas um homem comum que estava acampando longe da cidade quando "O Evento" aconteceu. Enquanto as cidades caiam, ele fugiu para o fundo da floresta. Os esporos alienigenas que choveram nao o mataram — mutaram a vegetacao ao redor. Sozinho por meses, ele aprendeu a sobreviver: usar cipos como cordas, espinhos como laminas, seiva acida como veneno. A floresta virou seu lar, seu esconderijo e seu arsenal. Ele empilha tudo que encontra, porque na mata, quem desperdica, morre.',
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
  lore1: 'Eu nao escolhi lutar. Eu so nao queria morrer. A floresta me ensinou o resto.',
  lore2: 'Sozinho por tanto tempo, comecei a ouvir a mata. As raizes sabem onde os aliens pisam. Hoje eu nao me escondo mais — eu caco.',
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
  backstory: 'Dia 1 da invasao. Estava em casa com a esposa e a filha de 6 anos quando um alien de fogo atravessou a parede. Na luta desesperada, o cano de gas se rompeu. Ele agarrou a criatura para dar tempo das duas fugirem — entao tudo explodiu. Acordou dias depois no hospital de campanha: a esposa e a filha nao sobreviveram, e seu braco direito teve de ser amputado. Os engenheiros sobreviventes lhe deram uma protese: um braco mecanico que e, tambem, um lanca-chamas. No peito ele carrega um relicario com a foto das duas. Ele luta com o mesmo fogo que tirou tudo dele.',
  passive: 'Itens [Fogo] ganham +50% dano. Explosoes tem +30% raio. Perde 1 HP/s passivamente.',
  backpackRows: 5,
  backpackCols: 7,
  backpackRule: 'freeform',
  startingHp: 80,
  startingGold: 40,
  startingItems: ['fire_gun'],
  shipColorIndex: 1,
  unlockCondition: 'Alcance wave 10 com Rômulo.',
  unlockedByDefault: false,
  lore1: 'O fogo levou a Ana e a Bia. Levou meu braco. Mas o fogo tambem e a unica coisa que ainda me obedece.',
  lore2: 'Toda vez que incinero um deles, abro o relicario. Ainda sinto o cheiro da casa queimando. Nao paro ate o ultimo virar cinza — nem que eu vire junto.',
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
  backstory: 'Tenente-Comandante da frota de submarinos da Marinha do Brasil. Quando a superficie caiu, o que restou das forcas armadas recuou para debaixo d\'agua — o unico lugar que os Enxames nao alcancaram. De bunkers no fundo do mar, os militares planejam a reconquista. Mazu e a melhor operativa em servico: treinada, fria sob pressao, letal. E enviada a superficie em missoes de reconhecimento e sabotagem, usando canhoes de agua pressurizada e armamento criogenico adaptado de tecnologia alien capturada.',
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
  lore1: 'Embaixo d\'agua o mundo ainda faz sentido. Ordens claras, cadeia de comando, objetivos. La em cima e so caos — e meu trabalho e impor ordem nele.',
  lore2: 'A Operacao Ressurgencia comeca em 72 horas. Se eu nao voltar com dados sobre os Enxames da superficie, nao havera plano. Nao havera reconquista. Eu nao falho missoes.',
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
  backstory: 'Era fisico nuclear, chefe de turno na usina onde trabalhava. Quando os aliens atacaram, o reator entrou em colapso. A radiacao deveria te-lo matado — mas no instante exato da exposicao, um organismo alien foi irradiado junto dele e se fundiu ao seu corpo a nivel celular. Ele sobreviveu transformado: metade do rosto e humano, a outra metade e uma carapaca alienigena viva e pulsante. Sua biologia agora crepita com energia radioativa instavel. Pior: o alien dentro dele tem vontade propria, e luta constantemente para tomar o resto de seu corpo. Cada dia e uma batalha interna para continuar humano.',
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
  lore1: 'Metade de mim quer exterminar todos eles. A outra metade... e um deles. As vezes ouco os pensamentos do Enxame. E pior: as vezes concordo com eles.',
  lore2: 'Os medicos do submarino me deram 47 dias antes do alien dominar o resto do corpo. 47 dias pra levar o maximo deles comigo. O relogio nao para — entao eu tambem nao paro.',
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
  backstory: 'Fisico teorico obcecado por mecanica quantica e viagem dimensional. Quando os aliens rasgaram uma fenda no espaco-tempo sobre a cidade, ele viu a chance de sua vida: replicou o fenomeno em laboratorio. O experimento deu errado — e certo demais. Seu corpo deixou de estar totalmente ancorado a este plano. Agora, em momentos aleatorios, ele simplesmente "pisca" para fora da realidade: fica intangivel, e seres vivos e seus ataques o atravessam como se fosse fantasma. Nao controla quando acontece. As vezes e a salvacao; as vezes ele atravessa o chao e cai por segundos eternos no vazio.',
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
  lore1: 'As vezes a bala passa direto por mim e eu nem percebo. As vezes eu passo direto pelo chao. Eu nao decido. A realidade decide se quer me segurar.',
  lore2: 'Do outro lado da fenda eu vi de onde eles vem. Um vazio infinito e faminto. Se meu corpo continuar se soltando deste plano, talvez um dia eu nao volte. Talvez seja o unico jeito de fechar a fenda por dentro.',
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
  backstory: 'Era veterinaria e etologa — estudava o comportamento animal. Quando os Enxames chegaram, enquanto todos viam monstros, ela viu padroes: hierarquia, instinto, submissao. Descobriu que certos aliens respondem a dominancia, exatamente como predadores terrestres. Aprendeu a quebra-los, a doma-los, a transforma-los em armas vivas. Os outros sobreviventes a temem tanto quanto temem os aliens. Ela nao se importa: prefere a lealdade de uma fera domada a covardia de um humano. Quando ela mata um alien do jeito certo, as vezes ele se levanta de novo — mas dessa vez, do lado dela.',
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
  lore1: 'Eles me chamam de monstro por domar monstros. Mas minhas feras nunca me traem. Quantos humanos podem dizer o mesmo?',
  lore2: 'Encontrei a frequencia que os controla. Se eu amplificar o suficiente, talvez eu dome a colmeia inteira. Talvez eu dome a Rainha. O custo? Eu paro de sentir se ainda sou humana.',
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
  backstory: 'Bombeiro veterano, 18 anos de servico, nunca perdeu uma crianca. No dia da invasao, recebeu um chamado banal: "um gato preso no alto de uma arvore, criancas tentando resgatar". Chegou sorrindo, pronto pra mais um resgate de rotina. O "gato" abriu olhos demais. Era um alien. Ele viu, impotente, a criatura descer e devorar as criancas ao redor da arvore, uma a uma, antes que ele pudesse sacar o machado. Salvou ninguem naquele dia. Agora carrega o machado, a mangueira e o tanque de espuma para a guerra — e jurou que nenhum inocente vai morrer na frente dele de novo. Ele se joga na frente do perigo. E o escudo que falhou uma vez e nunca mais vai falhar.',
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
  lore1: 'Era so um gato numa arvore. So mais um resgate. Eu cheguei sorrindo. Eu nunca mais sorri.',
  lore2: 'Eu nao consigo salvar os que ja se foram. Mas posso me jogar na frente do proximo. E do proximo. Ate nao sobrar nada de mim pra queimar. Essa e a unica penitencia que aceito.',
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
