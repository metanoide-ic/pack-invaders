/**
 * VENDORS — 4 merchants with personality, exclusive item pools, and unlock conditions.
 * Each vendor has a 25% chance to appear (equal weight when unlocked).
 * Vendors unlock progressively: 1st=start, 2nd=char2, 3rd=char4, 4th=char6.
 *
 * Art note: Vendors are rendered LARGE on screen (portrait-style, detailed art).
 * Placeholder will be a large colored silhouette with personality indicators.
 */

export interface VendorDefinition {
  id: string;
  name: string;
  title: string;
  description: string;
  personality: string;
  /** Which character unlock triggers this vendor. null = available from start */
  unlockTrigger: string | null;
  /** Item IDs this vendor sells exclusively (others won't sell these) */
  exclusiveItems: string[];
  /** Greeting phrases (random each visit) */
  greetings: string[];
  /** Phrases when player buys something */
  buyPhrases: string[];
  /** Phrases when player can't afford */
  brokePhrases: string[];
  /** Phrases when leaving without buying */
  leavePhrases: string[];
  /** Lore text for the codex */
  lore: string;
  /** Visual description for art reference */
  visualDescription: string;
  /** Dominant color for placeholder rendering */
  color: string;
  /** Secondary color */
  accentColor: string;
}

export const VENDOR_LUNA: VendorDefinition = {
  id: 'luna',
  name: 'Luna',
  title: 'A Comerciante do Abrigo',
  description: 'Jovem sobrevivente que transformou o caos em oportunidade de negócio.',
  personality: 'Carismática, esperta, flerta levemente com todo mundo. Sempre sorrindo mesmo no apocalipse.',
  unlockTrigger: null, // Available from start
  exclusiveItems: [
    'basic_gun', 'repair_kit', 'gold_magnet', 'armor_plate', 'wind_fan',
    'lucky_charm', 'watering_can', 'plant_shield', 'cat', 'snack_box',
    'coin_doubler', 'medkit', 'scrap_recycler', 'magnet_field', 'emergency_repair',
    'ammo_box', 'targeting_array', 'golden_egg', 'luck_stone', 'phase_shifter',
    'shotgun', 'poison_dart', 'ice_gun', 'dual_pistols', 'boomerang',
    'speed_coil', 'scope', 'cooldown_reducer', 'size_enhancer', 'momentum_engine',
    'bee_swarm', 'snake', 'mechanical_bird', 'gold_mine', 'war_banner',
    'shield_generator', 'radar_dish', 'reflection_matrix', 'healing_totem', 'bio_generator',
    // New items for Luna
    'vine_whip', 'water_cannon', 'wind_cutter', 'spider_familiar', 'nano_repair_bot',
    'life_leech', 'gold_detector', 'scavenger_module', 'merchant_badge', 'pet_treat',
    'root_network', 'holy_grail', 'mirror_shield',
  ],
  greetings: [
    'Oi, bonito! Tá precisando de alguma coisa? Eu tenho de TUDO.',
    'Mais um dia, mais um cliente. Meu favorito, aliás. Vem ver o que chegou!',
    'Se tá vivo, tá comprando. E se tá comprando, tá no lugar certo.',
    'Ah, você de novo! Tava guardando umas coisas especiais... talvez.',
    'O fim do mundo é péssimo pra quase tudo, menos pra quem sabe negociar.',
    'Fala sério, quem precisa de civilização quando se tem uma mochila cheia de armas?',
  ],
  buyPhrases: [
    'Ótima escolha! Sabia que você tinha bom gosto.',
    'Pode levar, pode levar. O próximo vai custar mais, hein.',
    'Fechado! Se quebrar, NÃO aceito devoluções.',
    'Uhul, adoro o som de dinheiro caindo. Quer dizer... ouro alien. Tanto faz.',
  ],
  brokePhrases: [
    'Fofo, mas sem grana não rola. Volta depois de matar mais uns aliens.',
    'Ah, que pena... Mas olha, se trouxer mais ouro, eu guardo pra você. Talvez.',
    'Sem gold, sem item. Regra número um do apocalipse.',
  ],
  leavePhrases: [
    'Tá bom, vai lá salvar o mundo. Mas volta pra gastar!',
    'Tchau! Tenta não morrer antes da próxima visita.',
    'Se mudar de ideia, sabe onde me encontrar. Beijo!',
  ],
  lore: 'Luna era estudante de administração quando o Evento aconteceu. Enquanto outros entravam em pânico, ela viu oportunidade. Em três semanas, já controlava a rede de troca do maior abrigo do interior de São Paulo. Seu segredo: nunca demonstrar medo, sempre sorrir, e cobrar 20% a mais de quem pergunta o preço duas vezes. Os sobreviventes precisam dela mais do que ela precisa deles — e ela sabe disso.',
  visualDescription: 'Mulher jovem (~24 anos), cabelo castanho ondulado até os ombros, olhos verdes brilhantes, sorriso confiante. Usa uma jaqueta de couro customizada com patches de marcas pré-apocalipse. Tem um colar feito de fragmentos de alien cristalizado. Expressão sempre entre o travesso e o sedutor.',
  color: '#ec4899',
  accentColor: '#f9a8d4',
};

export const VENDOR_BRUTUS: VendorDefinition = {
  id: 'brutus',
  name: 'Brutus',
  title: 'O Arsenal Ambulante',
  description: 'Ex-fisiculturista e militar que encontrou seu propósito no apocalipse.',
  personality: 'Agressivo, entusiasmado com violência, trata armas como filhos. Surpreendentemente gentil com crianças.',
  unlockTrigger: 'fire_lord', // Unlocks when 2nd character (Inferno) is unlocked
  exclusiveItems: [
    'fire_gun', 'shotgun', 'sniper', 'missile_launcher', 'chain_gun',
    'plasma_cannon', 'grenade_launcher', 'flamethrower', 'harpoon_gun', 'bone_spear',
    'stutter_box', 'amplifier_crystal', 'explosive_rounds', 'extended_magazine', 'ricochet_module',
    'overclocker', 'multi_target_lock', 'critical_core', 'berserker_core', 'dark_pact',
    'heavy_armor', 'crown_of_thorns', 'explosive_core', 'soul_collector', 'overcharge_node',
    // New items for Brutus
    'railgun', 'magma_launcher', 'pulse_rifle', 'thorn_cannon', 'shadow_dagger',
    'minigun', 'damage_booster', 'rapid_fire_module', 'titanium_plating', 'fire_shield',
    'war_horn', 'adrenaline_injector', 'chaos_engine',
  ],
  greetings: [
    'HAHA! Veio buscar DESTRUIÇÃO? Tá no lugar certo, meu irmão!',
    'Mano, ontem eu EXPLODI três tanques com uma mão. UMA MÃO. Quer saber como? Compra essa belezinha aqui.',
    'O mundo acabou e eu NUNCA fui tão feliz. Isso aqui é melhor que qualquer academia. Melhor que qualquer guerra.',
    'Sabe o que eu amo? O som de um alien ESTOURANDO. E sabe o que faz eles estourarem MELHOR? Meus produtos.',
    'EU AMO MEU TRABALHO. Quando era soldado, tinha regras. Agora? SEM REGRAS. SÓ EXPLOSÕES.',
  ],
  buyPhrases: [
    'ISSO AÍ! Vai fazer um ESTRAGO com isso! Me conta depois quantos explodiram!',
    'Boa escolha, guerreiro. Essa aí é uma das minhas favoritas. Trata ela bem.',
    'HAHA! Comprou! Agora vai lá e FAZ CHOVER FOGO!',
    'Sabia que ia levar essa. Tem cara de quem gosta de ver o mundo arder.',
  ],
  brokePhrases: [
    'Sem grana? Mata mais aliens, cara. Eles CAGAM ouro quando morrem. Literalmente.',
    'Poxa, mano. Volta com mais gold. Eu guardo essa aqui... NÃO, MENTIRA. Primeiro que chegar leva.',
    'Dinheiro curto? A vida é dura. Mas sabe o que é mais duro? MEUS MÍSSEIS. Junta grana e volta.',
  ],
  leavePhrases: [
    'Vai lá DESTRUIR, mano! E se sobrar algum alien, manda pra cá que eu termino o serviço!',
    'Valeu, parceiro! Lembra: se não tá explodindo, não tá tentando o suficiente!',
    'Tchau! Tenta fazer uma kill de 50+ combo dessa vez. BATE O RECORDE!',
  ],
  lore: 'Brutus era campeão estadual de fisiculturismo e sargento do Exército Brasileiro. Quando a invasão começou, ele estava em uma base militar que caiu em 6 horas. Dos 200 soldados, 3 sobreviveram. Ele era um deles. Em vez de PTSD, Brutus desenvolveu o que os psicólogos chamam de "adaptação paradoxal" — o apocalipse CUROU sua depressão. Pela primeira vez na vida, se sente completo. Livre. Poderoso. E absolutamente terrificante.',
  visualDescription: 'Homem imenso (~2m, 130kg de músculo), cabeça raspada com cicatriz de queimadura no lado esquerdo. Usa um colete tático cheio de munição e granadas. Braços expostos cobertos de tatuagens militares e marcas de garras alien. Sorriso maníaco permanente. Olhos que brilham com genuína alegria ao falar de armas.',
  color: '#dc2626',
  accentColor: '#fca5a5',
};

export const VENDOR_NYX: VendorDefinition = {
  id: 'nyx',
  name: 'Nyx',
  title: 'A Alquimista das Sombras',
  description: 'Cientista brilhante com estética gótica que cria tecnologia a partir de cadáveres alien.',
  personality: 'Fria, sarcástica, intelectualmente superior. Fala em metáforas macabras. Respeita apenas inteligência.',
  unlockTrigger: 'storm_runner', // Unlocks when 4th character (Pulso) is unlocked
  exclusiveItems: [
    'lightning_rod', 'tesla_coil', 'acid_sprayer', 'void_cannon', 'frost_nova',
    'solar_beam', 'crystal_shard_gun', 'ancient_staff', 'laser_beam', 'sound_cannon',
    'splitter_prism', 'targeting_module', 'echo_chamber', 'elemental_infusion', 'elemental_catalyst',
    'void_crystal', 'nexus_crystal', 'infinity_stone', 'time_dilator', 'gravity_well',
    'power_core', 'ancient_rune', 'plasma_shield', 'battery', 'coolant',
    // New items for Nyx
    'frost_turret', 'arcane_orb', 'venom_spitter', 'emp_generator', 'poison_cloud_gen',
    'quantum_entangler', 'overload_capacitor', 'cryo_battery', 'thunder_coil', 'toxic_amplifier',
    'temporal_paradox', 'synergy_prism', 'chain_lightning_rod',
  ],
  greetings: [
    'Ah. Você. Esperava alguém mais... morto. Mas serve.',
    'Cada item que vendo foi extraído de um cadáver. Alguns ainda estavam mornos. Isso te incomoda?',
    'A ciência não tem moral. Nem eu. Vamos aos negócios?',
    'Sabia que o córtex cerebral alien continua processando por 7 horas pós-morte? Fascinante. Enfim, quer comprar algo?',
    'Vocês matam os aliens. Eu os transformo em algo útil. Simbiose perfeita.',
  ],
  buyPhrases: [
    'Decisão racional. A entropia agradece.',
    'Excelente. Esse item tem 3% de chance de causar uma singularidade dimensional. Mas provavelmente não.',
    'Vendido. Se começar a sussurrar à noite, ignore. Provavelmente é só resíduo neural.',
    'Hmm. Boa escolha. Você é menos idiota do que aparenta.',
  ],
  brokePhrases: [
    'Sem recursos? A seleção natural é implacável. Volte quando for mais... apto.',
    'Interessante. Você quer o que não pode pagar. Tragédia clássica. Próximo.',
    'Gold insuficiente. Sugiro eliminar mais espécimes e retornar. Simples aritmética.',
  ],
  leavePhrases: [
    'Vá. Morra ou volte. Ambos os resultados me são... aceitáveis.',
    'Até breve. Ou não. Estatisticamente, 40% dos meus clientes não voltam.',
    'A porta é ali. Tente não se desintegrar no caminho.',
  ],
  lore: 'Nyx (nome real: Dra. Beatriz Novaes) era pesquisadora de biotecnologia na USP com 3 PhDs antes dos 30. Quando o Evento aconteceu, enquanto todos fugiam, ela CORREU em direção aos primeiros cadáveres alien. Em 48 horas, já tinha publicado (para ninguém) o primeiro paper sobre fisiologia extraterrestre. Sua obsessão não é salvar a humanidade — é ENTENDER os invasores. A gótica de preto que nunca sorri se tornou a maior especialista em tecnologia alien do hemisfério sul. E cobra caro por isso.',
  visualDescription: 'Mulher ~30 anos, pele extremamente pálida, cabelo preto liso até a cintura com mechas roxo-escuro. Olhos quase pretos com delineador elaborado. Usa um jaleco de laboratório customizado (preto, não branco) sobre roupa gótica. Luvas de látex pretas. Sempre segurando algum frasco ou ferramenta cirúrgica com fluido alien brilhante. Expressão de tédio permanente, como se o mundo fosse uma decepção.',
  color: '#7c3aed',
  accentColor: '#c4b5fd',
};

export const VENDOR_ZIKRI: VendorDefinition = {
  id: 'zikri',
  name: 'Zik\'ri',
  title: 'O Desertor do Enxame',
  description: 'Um alien que traiu sua espécie e agora vende tecnologia do Enxame para humanos.',
  personality: 'Curioso sobre humanos, fala de forma estranha (tradução imperfeita), genuinamente amigável mas perturbador.',
  unlockTrigger: 'beast_tamer', // Unlocks when 6th character (Domadora) is unlocked
  exclusiveItems: [
    'phoenix_egg', 'dragon_whelp', 'fire_ant_colony', 'ice_fairy', 'thunder_hawk',
    'poison_frog', 'shadow_bat', 'ghost_cat', 'owl', 'parrot',
    'vampiric_siphon', 'fertilizer', 'acid_sprayer', 'tesla_coil', 'void_cannon',
    'infinity_stone', 'nexus_crystal', 'time_dilator', 'gravity_well', 'ancient_rune',
    'soul_collector', 'overcharge_node', 'dark_pact', 'berserker_core', 'phase_shifter',
    // New items for Zik'ri
    'crystal_golem', 'ember_sprite', 'storm_eagle', 'piercing_lens', 'splash_module',
    'gravity_anchor', 'thermal_core', 'emergency_shield', 'acid_rain_gen', 'alien_core_fragment',
    'keplers_heart',
  ],
  greetings: [
    'Hu-ma-no! Olá! Zik\'ri tem coisas. Coisas boas. Coisas do Enxame que Enxame não quer que vocês tenham.',
    'Vocês são... fascinantes. Tão pequenos. Tão frágeis. Tão... TEIMOSOS. Zik\'ri admira isso.',
    'Shh! Não conta pro Enxame que Zik\'ri está aqui. Eles não gostam de... como vocês dizem... traição?',
    'Cada coisa que Zik\'ri vende é um segredo do Enxame. Cada compra é um dedo no olho deles. Zik\'ri ADORA.',
    'Humano! Zik\'ri aprendeu palavra nova hoje: "amigo". Zik\'ri é amigo? Vocês são amigo de Zik\'ri?',
  ],
  buyPhrases: [
    'Sim sim sim! Bom! Essa coisa vai fazer MUITO estrago nos irmãos de Zik\'ri. Hehe. Ex-irmãos.',
    'Humano inteligente! Zik\'ri sabia. Essa tecnologia... o Enxame vai SENTIR que está faltando.',
    'Boa compra! Zik\'ri garante qualidade. Se não funcionar... hmm. Não funcionar nunca aconteceu. NUNCA.',
    'Excelente! Mais uma arma contra o Enxame. Zik\'ri está... como dizem... "fazendo a diferença"?',
  ],
  brokePhrases: [
    'Hmm. Sem gold. Zik\'ri entende. Recursos limitados. Biologia humana é cara de manter, né?',
    'Não pode comprar? Tudo bem. Zik\'ri espera. Tempo é... relativo. Literalmente, pra Zik\'ri.',
    'Gold insuficiente! Mas Zik\'ri não aceita troca por sangue. Tentaram. Não funcionou. Longa história.',
  ],
  leavePhrases: [
    'Tchau-tchau, humano! Zik\'ri torce por vocês! Contra os ex-colegas de Zik\'ri! Hehe!',
    'Vai com cuidado! Se encontrar alien que parece Zik\'ri, NÃO é Zik\'ri. Mata sem pensar.',
    'Até próxima! Se houver próxima! Zik\'ri é otimista! Estatisticamente injustificado, mas otimista!',
  ],
  lore: 'Zik\'ri é uma anomalia — um alien do Enxame que desenvolveu individualidade. Isso não deveria ser possível. O Enxame opera como mente coletiva; não existem "indivíduos". Mas Zik\'ri, durante uma escaramuça no Dia 15, sofreu dano cerebral que cortou sua conexão com a rede. Em vez de morrer (como todos os outros desconectados), ele... acordou. Pela primeira vez, PENSOU sozinho. E o primeiro pensamento foi: "Eu não quero isso." O segundo foi: "Eles vão me matar se souberem." O terceiro foi: "Os humanos são interessantes." Desde então, vive escondido entre os sobreviventes, vendendo segredos do Enxame em troca de proteção e da única coisa que realmente quer: companhia.',
  visualDescription: 'Alien humanóide de ~1.5m, pele cinza-azulada semi-translúcida com veias bioluminescentes verdes visíveis. Quatro olhos grandes (dois principais, dois menores acima) cor de âmbar com pupilas horizontais. Sem nariz, boca fina que se curva em algo que TENTA ser um sorriso humano mas não é. Usa roupas humanas roubadas (camiseta larga demais, shorts cargo) que ficam cômicas nele. Tem um crachá improvisado que diz "AMIGO - NÃO ATIRAR".',
  color: '#06b6d4',
  accentColor: '#67e8f9',
};

// ─── All Vendors ─────────────────────────────────────────────────────────────

export const ALL_VENDORS: VendorDefinition[] = [
  VENDOR_LUNA, VENDOR_BRUTUS, VENDOR_NYX, VENDOR_ZIKRI,
];

/**
 * Get available vendors based on which characters are unlocked.
 */
export function getAvailableVendors(unlockedCharacters: string[]): VendorDefinition[] {
  return ALL_VENDORS.filter(v => {
    if (v.unlockTrigger === null) return true;
    return unlockedCharacters.includes(v.unlockTrigger);
  });
}

/**
 * Pick a random vendor from the available pool (equal 25% chance when all unlocked).
 */
export function pickRandomVendor(unlockedCharacters: string[]): VendorDefinition {
  const available = getAvailableVendors(unlockedCharacters);
  return available[Math.floor(Math.random() * available.length)];
}

/**
 * Get a random greeting from a vendor.
 */
export function getVendorGreeting(vendor: VendorDefinition): string {
  return vendor.greetings[Math.floor(Math.random() * vendor.greetings.length)];
}

/**
 * Get a random buy phrase from a vendor.
 */
export function getVendorBuyPhrase(vendor: VendorDefinition): string {
  return vendor.buyPhrases[Math.floor(Math.random() * vendor.buyPhrases.length)];
}

/**
 * Get a random broke phrase from a vendor.
 */
export function getVendorBrokePhrase(vendor: VendorDefinition): string {
  return vendor.brokePhrases[Math.floor(Math.random() * vendor.brokePhrases.length)];
}

/**
 * Get a random leave phrase from a vendor.
 */
export function getVendorLeavePhrase(vendor: VendorDefinition): string {
  return vendor.leavePhrases[Math.floor(Math.random() * vendor.leavePhrases.length)];
}
