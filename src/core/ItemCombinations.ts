/**
 * ITEM COMBINATIONS — When specific items are placed adjacent,
 * they fuse into a stronger combined form. Moving them apart reverts.
 *
 * Format: itemA + itemB (adjacent) → combined effect applied to itemA
 * The combined state is tracked and reverted when adjacency breaks.
 */

export interface ItemCombination {
  id: string;
  /** First item ID */
  itemA: string;
  /** Second item ID */
  itemB: string;
  /** Name of the combined result */
  resultName: string;
  /** Description of the fusion */
  description: string;
  /** Stat bonuses applied to itemA when fused */
  bonuses: {
    damageMultiplier?: number;
    fireRateMultiplier?: number;
    projectileSpeed?: number;
    aoeRadius?: number;
    piercing?: number;
    healPerSecond?: number;
    projectileCount?: number;
  };
  /** New tags added to itemA when fused */
  addTags?: string[];
  /** Visual color override */
  fusionColor?: string;
}

export const ALL_COMBINATIONS: ItemCombination[] = [
  // ─── Fire Combinations ───────────────────────────────────────────────────
  {
    id: 'phoenix_gun',
    itemA: 'fire_gun', itemB: 'parrot',
    resultName: 'Arma de Fênix',
    description: 'Projeteis de fogo que renascem ao atingir. +80% dano, +AoE.',
    bonuses: { damageMultiplier: 1.8, aoeRadius: 30 },
    addTags: ['Fogo'],
    fusionColor: '#ff6b00',
  },
  {
    id: 'infernal_core',
    itemA: 'fire_gun', itemB: 'battery',
    resultName: 'Núcleo Infernal',
    description: 'Energia canalizada em chamas. +50% cadência, explosões maiores.',
    bonuses: { fireRateMultiplier: 1.5, aoeRadius: 20 },
    fusionColor: '#dc2626',
  },
  {
    id: 'magma_beast',
    itemA: 'magma_launcher', itemB: 'dragon_whelp',
    resultName: 'Besta de Magma',
    description: 'O dragão canaliza o magma. +100% dano AoE.',
    bonuses: { damageMultiplier: 2.0, aoeRadius: 40 },
    fusionColor: '#ea580c',
  },
  {
    id: 'fire_storm',
    itemA: 'flamethrower', itemB: 'wind_fan',
    resultName: 'Tempestade de Fogo',
    description: 'Vento espalha as chamas. +60% AoE, +3 projeteis.',
    bonuses: { aoeRadius: 35, projectileCount: 3 },
    fusionColor: '#f97316',
  },

  // ─── Ice Combinations ────────────────────────────────────────────────────
  {
    id: 'frozen_barrage',
    itemA: 'ice_gun', itemB: 'speed_coil',
    resultName: 'Barragem Congelante',
    description: 'Tiros de gelo em rajada insana. +100% cadência.',
    bonuses: { fireRateMultiplier: 2.0 },
    fusionColor: '#38bdf8',
  },
  {
    id: 'blizzard_core',
    itemA: 'frost_turret', itemB: 'coolant',
    resultName: 'Núcleo Nevasca',
    description: 'Turreta congela tudo num raio massivo.',
    bonuses: { aoeRadius: 60, damageMultiplier: 1.4 },
    fusionColor: '#67e8f9',
  },
  {
    id: 'ice_phoenix',
    itemA: 'ice_gun', itemB: 'phoenix_egg',
    resultName: 'Fênix de Gelo',
    description: 'Projeteis de gelo que explodem em cristais. Perfura 2.',
    bonuses: { damageMultiplier: 1.6, piercing: 2 },
    fusionColor: '#a5f3fc',
  },

  // ─── Electric Combinations ───────────────────────────────────────────────
  {
    id: 'thunder_god',
    itemA: 'lightning_rod', itemB: 'tesla_coil',
    resultName: 'Deus do Trovão',
    description: 'Raios em cadeia devastadores. +3 projeteis, +50% dano.',
    bonuses: { projectileCount: 3, damageMultiplier: 1.5 },
    fusionColor: '#facc15',
  },
  {
    id: 'emp_overload',
    itemA: 'emp_generator', itemB: 'overload_capacitor',
    resultName: 'Sobrecarga EMP',
    description: 'EMP agora causa dano massivo além de paralisar.',
    bonuses: { damageMultiplier: 2.0, aoeRadius: 80 },
    fusionColor: '#eab308',
  },
  {
    id: 'storm_hawk',
    itemA: 'storm_eagle', itemB: 'thunder_coil',
    resultName: 'Falcão Tempestuoso',
    description: 'Águia eletrificada ataca 3x mais rápido.',
    bonuses: { fireRateMultiplier: 3.0, damageMultiplier: 1.3 },
    fusionColor: '#fde047',
  },

  // ─── Organic/Poison Combinations ─────────────────────────────────────────
  {
    id: 'toxic_bloom',
    itemA: 'vine_whip', itemB: 'poison_cloud_gen',
    resultName: 'Flor Tóxica',
    description: 'Videiras venenosas. Dano dobrado + nuvem em cada hit.',
    bonuses: { damageMultiplier: 2.0, aoeRadius: 25 },
    addTags: ['Veneno'],
    fusionColor: '#a855f7',
  },
  {
    id: 'spider_queen',
    itemA: 'spider_familiar', itemB: 'poison_frog',
    resultName: 'Rainha Aranha',
    description: 'Familiar evolui. +200% dano, tiros envenenam.',
    bonuses: { damageMultiplier: 3.0 },
    addTags: ['Veneno'],
    fusionColor: '#7c3aed',
  },
  {
    id: 'root_guardian',
    itemA: 'plant_shield', itemB: 'root_network',
    resultName: 'Guardião das Raízes',
    description: 'Escudo vivo que regenera. +10 armadura, +3 HP/s.',
    bonuses: { healPerSecond: 3 },
    fusionColor: '#22c55e',
  },

  // ─── Pet Combinations ────────────────────────────────────────────────────
  {
    id: 'pack_leader',
    itemA: 'cat', itemB: 'parrot',
    resultName: 'Líder da Matilha',
    description: 'Pets se organizam. Todos pets +40% cadência.',
    bonuses: { fireRateMultiplier: 1.4 },
    fusionColor: '#fb923c',
  },
  {
    id: 'crystal_dragon',
    itemA: 'dragon_whelp', itemB: 'crystal_golem',
    resultName: 'Dragão de Cristal',
    description: 'Dragão com armadura cristalina. +150% dano, +5 armadura.',
    bonuses: { damageMultiplier: 2.5 },
    fusionColor: '#c084fc',
  },
  {
    id: 'shadow_swarm',
    itemA: 'shadow_bat', itemB: 'bee_swarm',
    resultName: 'Enxame Sombrio',
    description: 'Morcegos e abelhas unidos. +4 projeteis, fase parcial.',
    bonuses: { projectileCount: 4, damageMultiplier: 1.3 },
    fusionColor: '#1e1b4b',
  },

  // ─── Weapon Combinations ─────────────────────────────────────────────────
  {
    id: 'railgun_prime',
    itemA: 'railgun', itemB: 'scope',
    resultName: 'Railgun Prime',
    description: 'Mira perfeita. +100% dano, perfura 5 inimigos.',
    bonuses: { damageMultiplier: 2.0, piercing: 5 },
    fusionColor: '#6366f1',
  },
  {
    id: 'minigun_chaos',
    itemA: 'minigun', itemB: 'chaos_engine',
    resultName: 'Minigun do Caos',
    description: 'Cada bala tem dano aleatório entre 1 e 500%.',
    bonuses: { fireRateMultiplier: 1.5, damageMultiplier: 1.8 },
    fusionColor: '#ef4444',
  },
  {
    id: 'void_sniper',
    itemA: 'sniper', itemB: 'void_crystal',
    resultName: 'Sniper do Vazio',
    description: 'Tiros rasgam a realidade. Dano ignora armadura.',
    bonuses: { damageMultiplier: 2.5, piercing: 10 },
    fusionColor: '#4c1d95',
  },
  {
    id: 'holy_cannon',
    itemA: 'arcane_orb', itemB: 'holy_grail',
    resultName: 'Canhão Sagrado',
    description: 'Orbes que curam ao matar. +80% dano, +2 HP por kill.',
    bonuses: { damageMultiplier: 1.8, healPerSecond: 2 },
    fusionColor: '#fbbf24',
  },

  // ─── Utility Combinations ────────────────────────────────────────────────
  {
    id: 'gold_factory',
    itemA: 'gold_magnet', itemB: 'coin_doubler',
    resultName: 'Fábrica de Ouro',
    description: '+50% gold de todas as fontes.',
    bonuses: {},
    fusionColor: '#fbbf24',
  },
  {
    id: 'quantum_shield',
    itemA: 'mirror_shield', itemB: 'quantum_entangler',
    resultName: 'Escudo Quântico',
    description: 'Reflete 60% dos projeteis E absorve 20% dano.',
    bonuses: { healPerSecond: 1 },
    fusionColor: '#818cf8',
  },
  {
    id: 'temporal_heal',
    itemA: 'nano_repair_bot', itemB: 'temporal_paradox',
    resultName: 'Cura Temporal',
    description: 'Regeneração duplicada no tempo. +8 HP/s.',
    bonuses: { healPerSecond: 8 },
    fusionColor: '#67e8f9',
  },
  {
    id: 'alien_heart_full',
    itemA: 'keplers_heart', itemB: 'alien_core_fragment',
    resultName: 'Coração Primordial',
    description: 'O poder máximo. +50% em TODOS os stats.',
    bonuses: { damageMultiplier: 1.5, fireRateMultiplier: 1.5, projectileSpeed: 200 },
    fusionColor: '#f472b6',
  },

  // ─── Advanced Combinations ─────────────────────────────────────────────────
  {
    id: 'death_blossom',
    itemA: 'shotgun', itemB: 'vine_whip',
    resultName: 'Flor da Morte',
    description: 'Espinhos disparam em todas as direções. +5 projeteis.',
    bonuses: { projectileCount: 5, damageMultiplier: 1.3 },
    fusionColor: '#22c55e',
  },
  {
    id: 'frozen_time',
    itemA: 'time_dilator', itemB: 'frost_turret',
    resultName: 'Tempo Congelado',
    description: 'Tiros param o tempo para inimigos atingidos. +100% slow.',
    bonuses: { damageMultiplier: 1.4, fireRateMultiplier: 1.3 },
    fusionColor: '#e0f2fe',
  },
  {
    id: 'soul_reaper',
    itemA: 'shadow_dagger', itemB: 'soul_collector',
    resultName: 'Ceifador de Almas',
    description: 'Cada kill regenera 3 HP. Dano +60%.',
    bonuses: { damageMultiplier: 1.6, healPerSecond: 3 },
    fusionColor: '#1e1b4b',
  },
  {
    id: 'galaxy_cannon',
    itemA: 'void_cannon', itemB: 'solar_beam',
    resultName: 'Canhão Galáctico',
    description: 'Concentra energia cósmica. Dano x3, cadência /2.',
    bonuses: { damageMultiplier: 3.0 },
    fusionColor: '#7c3aed',
  },
  {
    id: 'nano_swarm',
    itemA: 'bee_swarm', itemB: 'nano_repair_bot',
    resultName: 'Enxame Nano',
    description: 'Nanobots e abelhas se fundem. +4 projeteis que curam 1 HP/s.',
    bonuses: { projectileCount: 4, healPerSecond: 1, damageMultiplier: 1.2 },
    fusionColor: '#06b6d4',
  },
  {
    id: 'berserker_blade',
    itemA: 'shadow_dagger', itemB: 'adrenaline_injector',
    resultName: 'Lâmina Berserker',
    description: 'Abaixo de 50% HP: dano x3. Acima: dano normal.',
    bonuses: { damageMultiplier: 2.0, fireRateMultiplier: 1.5 },
    fusionColor: '#b91c1c',
  },
  {
    id: 'golden_rain',
    itemA: 'gold_magnet', itemB: 'acid_rain_gen',
    resultName: 'Chuva Dourada',
    description: 'Projeteis de chuva geram +1 gold por hit.',
    bonuses: { damageMultiplier: 1.2, fireRateMultiplier: 1.3 },
    fusionColor: '#fbbf24',
  },
  {
    id: 'gravity_bomb',
    itemA: 'gravity_anchor', itemB: 'grenade_launcher',
    resultName: 'Bomba Gravitacional',
    description: 'Granadas puxam inimigos antes de explodir. AoE +60.',
    bonuses: { aoeRadius: 60, damageMultiplier: 1.5 },
    fusionColor: '#4338ca',
  },
  {
    id: 'phoenix_storm',
    itemA: 'phoenix_egg', itemB: 'storm_eagle',
    resultName: 'Tempestade Fênix',
    description: 'Fênix elétrica renasce infinitamente. +200% dano pet.',
    bonuses: { damageMultiplier: 3.0, fireRateMultiplier: 1.5 },
    fusionColor: '#fb923c',
  },
  {
    id: 'omega_shield',
    itemA: 'titanium_plating', itemB: 'emergency_shield',
    resultName: 'Escudo Ômega',
    description: 'Proteção definitiva. -40% dano recebido, +50 HP máximo.',
    bonuses: { healPerSecond: 2 },
    fusionColor: '#3b82f6',
  },

  // ─── Cross-Element Combos ──────────────────────────────────────────────────
  {
    id: 'steam_engine',
    itemA: 'fire_gun', itemB: 'water_cannon',
    resultName: 'Motor a Vapor',
    description: 'Fogo + Água = vapor superaquecido. +70% dano, perfura 2.',
    bonuses: { damageMultiplier: 1.7, piercing: 2 },
    fusionColor: '#e2e8f0',
  },
  {
    id: 'black_ice',
    itemA: 'ice_gun', itemB: 'shadow_dagger',
    resultName: 'Gelo Negro',
    description: 'Cristais de gelo das sombras. +90% dano, inimigos ficam lentos.',
    bonuses: { damageMultiplier: 1.9, fireRateMultiplier: 1.2 },
    fusionColor: '#1e293b',
  },
  {
    id: 'plague_blossom',
    itemA: 'poison_cloud_gen', itemB: 'vine_whip',
    resultName: 'Floração Pestilenta',
    description: 'Plantas que espalham doença. +100% AoE veneno.',
    bonuses: { aoeRadius: 50, damageMultiplier: 1.5 },
    addTags: ['Veneno'],
    fusionColor: '#4d7c0f',
  },
  {
    id: 'lightning_whip',
    itemA: 'lightning_rod', itemB: 'vine_whip',
    resultName: 'Chicote Relâmpago',
    description: 'Videira condutora. +3 projeteis em cadeia.',
    bonuses: { projectileCount: 3, damageMultiplier: 1.4 },
    fusionColor: '#a3e635',
  },
  {
    id: 'frost_flame',
    itemA: 'fire_gun', itemB: 'frost_turret',
    resultName: 'Chama Gélida',
    description: 'Fogo que congela. Paradoxo destrutivo. +120% dano.',
    bonuses: { damageMultiplier: 2.2 },
    fusionColor: '#7dd3fc',
  },
  // ─── Pet Evolution Combos ──────────────────────────────────────────────────
  {
    id: 'war_cat',
    itemA: 'cat', itemB: 'damage_booster',
    resultName: 'Gato de Guerra',
    description: 'Felino assassino treinado. +150% dano pet, +50% cadência.',
    bonuses: { damageMultiplier: 2.5, fireRateMultiplier: 1.5 },
    fusionColor: '#fbbf24',
  },
  {
    id: 'phoenix_reborn',
    itemA: 'phoenix_egg', itemB: 'fire_gun',
    resultName: 'Fênix Renascida',
    description: 'A fênix nasceu! +200% dano fogo, projeteis renascem.',
    bonuses: { damageMultiplier: 3.0, aoeRadius: 30 },
    addTags: ['Fogo'],
    fusionColor: '#f97316',
  },
  {
    id: 'owl_sage',
    itemA: 'owl', itemB: 'scope',
    resultName: 'Coruja Sábia',
    description: 'Visão perfeita. +100% chance crit, +40% cadência.',
    bonuses: { fireRateMultiplier: 1.4, damageMultiplier: 1.5 },
    fusionColor: '#a78bfa',
  },
  // ─── Utility Megacombos ────────────────────────────────────────────────────
  {
    id: 'fort_knox',
    itemA: 'gold_mine', itemB: 'gold_magnet',
    resultName: 'Fort Knox',
    description: 'Geração de ouro absurda. +200% gold de todas fontes.',
    bonuses: {},
    fusionColor: '#fbbf24',
  },
  {
    id: 'immortal_core',
    itemA: 'nano_repair_bot', itemB: 'holy_grail',
    resultName: 'Núcleo Imortal',
    description: 'Regeneração divina. +12 HP/s permanente.',
    bonuses: { healPerSecond: 12 },
    fusionColor: '#fef08a',
  },
  {
    id: 'void_armor',
    itemA: 'void_crystal', itemB: 'titanium_plating',
    resultName: 'Armadura do Vazio',
    description: 'Proteção dimensional. -50% dano recebido.',
    bonuses: { healPerSecond: 3 },
    fusionColor: '#3b0764',
  },
  {
    id: 'sniper_hawk',
    itemA: 'sniper', itemB: 'thunder_hawk',
    resultName: 'Falcão Atirador',
    description: 'Precisão aérea. Perfura 8, +100% dano.',
    bonuses: { damageMultiplier: 2.0, piercing: 8 },
    fusionColor: '#0284c7',
  },
  {
    id: 'chain_reaction',
    itemA: 'grenade_launcher', itemB: 'explosive_core',
    resultName: 'Reação em Cadeia',
    description: 'Cada explosão causa outra. +80% AoE, +50% dano.',
    bonuses: { aoeRadius: 50, damageMultiplier: 1.5 },
    fusionColor: '#dc2626',
  },
  {
    id: 'time_freeze',
    itemA: 'time_dilator', itemB: 'emp_generator',
    resultName: 'Congelamento Temporal',
    description: 'Para o tempo completamente por 2s a cada 8s.',
    bonuses: { damageMultiplier: 1.3 },
    fusionColor: '#e0f2fe',
  },
  {
    id: 'mega_minigun',
    itemA: 'minigun', itemB: 'rapid_fire_module',
    resultName: 'Mega Minigun',
    description: 'Cadência insana. +200% cadência, projeteis menores.',
    bonuses: { fireRateMultiplier: 3.0, damageMultiplier: 0.8 },
    fusionColor: '#94a3b8',
  },
  // ─── New Elemental Fusions ───────────────────────────────────────────────────
  {
    id: 'venom_rain',
    itemA: 'acid_rain_gen', itemB: 'toxic_amplifier',
    resultName: 'Chuva de Veneno Puro',
    description: 'Chuva ácida amplificada. +100% dano veneno, AoE +40.',
    bonuses: { damageMultiplier: 2.0, aoeRadius: 40 },
    addTags: ['Veneno'],
    fusionColor: '#76ff03',
  },
  {
    id: 'cryo_storm',
    itemA: 'frost_turret', itemB: 'cryo_battery',
    resultName: 'Tempestade Cryo',
    description: 'Turreta congelante com cadência insana. +80% cadência, +20 AoE.',
    bonuses: { fireRateMultiplier: 1.8, aoeRadius: 20 },
    fusionColor: '#80deea',
  },
  {
    id: 'volcanic_eruption',
    itemA: 'magma_launcher', itemB: 'thermal_core',
    resultName: 'Erupção Vulcânica',
    description: 'Magma superaquecido. +120% dano, +50 AoE.',
    bonuses: { damageMultiplier: 2.2, aoeRadius: 50 },
    fusionColor: '#ff3d00',
  },
  {
    id: 'pulse_overload',
    itemA: 'pulse_rifle', itemB: 'overload_capacitor',
    resultName: 'Pulso Sobrecarregado',
    description: 'Rifle de pulso canaliza energia extra. +3 projeteis, +50% dano.',
    bonuses: { projectileCount: 3, damageMultiplier: 1.5 },
    fusionColor: '#448aff',
  },
  {
    id: 'thorn_wall',
    itemA: 'thorn_cannon', itemB: 'root_network',
    resultName: 'Muralha de Espinhos',
    description: 'Espinhos rastreados pelas raízes. +4 projeteis, perfura 3.',
    bonuses: { projectileCount: 4, piercing: 3 },
    fusionColor: '#2e7d32',
  },
  // ─── New Pet Evolutions ────────────────────────────────────────────────────
  {
    id: 'spider_empress',
    itemA: 'spider_familiar', itemB: 'toxic_amplifier',
    resultName: 'Imperatriz Aracnídea',
    description: 'Aranha evolui com veneno puro. +200% dano, teias envenenam.',
    bonuses: { damageMultiplier: 3.0, fireRateMultiplier: 1.5 },
    addTags: ['Veneno'],
    fusionColor: '#4a148c',
  },
  {
    id: 'crystal_titan',
    itemA: 'crystal_golem', itemB: 'titanium_plating',
    resultName: 'Titã de Cristal',
    description: 'Golem blindado absorve 40% do dano. +15 armadura.',
    bonuses: { healPerSecond: 4 },
    fusionColor: '#7986cb',
  },
  {
    id: 'mechanical_phoenix',
    itemA: 'mechanical_bird', itemB: 'thermal_core',
    resultName: 'Fênix Mecânica',
    description: 'Pássaro mecha renasce em chamas. +150% dano, +AoE 30.',
    bonuses: { damageMultiplier: 2.5, aoeRadius: 30 },
    addTags: ['Fogo'],
    fusionColor: '#ff6e40',
  },
  {
    id: 'ice_fairy_evolved',
    itemA: 'ice_fairy', itemB: 'cryo_battery',
    resultName: 'Fada do Permafrost',
    description: 'Fada de gelo com poder ancestral. +100% dano, congela 3s.',
    bonuses: { damageMultiplier: 2.0, fireRateMultiplier: 1.4 },
    fusionColor: '#e0f7fa',
  },
  // ─── New Weapon Mega-Combos ────────────────────────────────────────────────
  {
    id: 'railgun_omega',
    itemA: 'railgun', itemB: 'piercing_lens',
    resultName: 'Railgun Ômega',
    description: 'Perfuração máxima. Atravessa 10 inimigos, +80% dano.',
    bonuses: { damageMultiplier: 1.8, piercing: 10 },
    fusionColor: '#b0bec5',
  },
  {
    id: 'venom_blade',
    itemA: 'shadow_dagger', itemB: 'venom_spitter',
    resultName: 'Lâmina Envenenada',
    description: 'Cada hit aplica veneno letal. +100% dano, DoT ativo.',
    bonuses: { damageMultiplier: 2.0, fireRateMultiplier: 1.3 },
    addTags: ['Veneno'],
    fusionColor: '#1b5e20',
  },
  {
    id: 'arcane_chaos',
    itemA: 'arcane_orb', itemB: 'chaos_engine',
    resultName: 'Orbe do Caos Arcano',
    description: 'Cada orbe explode em padrões aleatórios. Dano x3, AoE x2.',
    bonuses: { damageMultiplier: 3.0, aoeRadius: 55 },
    fusionColor: '#aa00ff',
  },
  {
    id: 'wind_storm',
    itemA: 'wind_cutter', itemB: 'wind_fan',
    resultName: 'Furacão Cortante',
    description: 'Lâminas de vento em todas direções. +6 projeteis.',
    bonuses: { projectileCount: 6, fireRateMultiplier: 1.2 },
    fusionColor: '#b0bec5',
  },
  // ─── New Utility Mega-Combos ───────────────────────────────────────────────
  {
    id: 'life_nexus',
    itemA: 'healing_totem', itemB: 'nano_repair_bot',
    resultName: 'Nexus de Vida',
    description: 'Regeneração constante absurda. +10 HP/s.',
    bonuses: { healPerSecond: 10 },
    fusionColor: '#00e676',
  },
  {
    id: 'quantum_armor',
    itemA: 'quantum_entangler', itemB: 'heavy_armor',
    resultName: 'Armadura Quântica',
    description: 'Proteção que dobra entre dimensões. +30% redução dano.',
    bonuses: { healPerSecond: 3 },
    fusionColor: '#7c4dff',
  },
  {
    id: 'golden_empire',
    itemA: 'gold_mine', itemB: 'merchant_badge',
    resultName: 'Império Dourado',
    description: '+300% geração de gold. Lojas oferecem itens raros.',
    bonuses: {},
    fusionColor: '#ffd600',
  },
  {
    id: 'adrenaline_berserker',
    itemA: 'adrenaline_injector', itemB: 'berserker_core',
    resultName: 'Fúria Adrenalínica',
    description: 'Dano x4 abaixo de 30% HP. Velocidade de ataque x2.',
    bonuses: { damageMultiplier: 2.5, fireRateMultiplier: 2.0 },
    fusionColor: '#d50000',
  },
  {
    id: 'emp_temporal',
    itemA: 'emp_generator', itemB: 'temporal_paradox',
    resultName: 'EMP Temporal',
    description: 'Paralisa inimigos no tempo. +3s duração, afeta toda a tela.',
    bonuses: { damageMultiplier: 1.5 },
    fusionColor: '#b3e5fc',
  },
  {
    id: 'synergy_nexus',
    itemA: 'synergy_prism', itemB: 'nexus_crystal',
    resultName: 'Nexus de Sinergias',
    description: '+10% dano por tag única. Todas sinergias amplificadas.',
    bonuses: { damageMultiplier: 1.5, fireRateMultiplier: 1.3 },
    fusionColor: '#e040fb',
  },
  {
    id: 'alien_awakening',
    itemA: 'keplers_heart', itemB: 'infinity_stone',
    resultName: 'Despertar Alienígena',
    description: 'O poder final. TODOS os stats x2.',
    bonuses: { damageMultiplier: 2.0, fireRateMultiplier: 2.0, projectileSpeed: 300 },
    fusionColor: '#ff1744',
  },
];

/**
 * Find all active combinations for a given item based on its adjacents.
 * Returns the combination if itemA matches the given item and itemB is adjacent.
 */
export function findCombinationsFor(itemId: string, adjacentIds: string[]): ItemCombination[] {
  const results: ItemCombination[] = [];
  for (const combo of ALL_COMBINATIONS) {
    if (combo.itemA === itemId && adjacentIds.includes(combo.itemB)) {
      results.push(combo);
    }
    // Also check reverse (itemB is the source)
    if (combo.itemB === itemId && adjacentIds.includes(combo.itemA)) {
      results.push(combo);
    }
  }
  return results;
}

/**
 * Get how many items in a list can combine with a given item.
 */
export function countPossibleCombinations(itemId: string, existingItemIds: string[]): number {
  let count = 0;
  for (const combo of ALL_COMBINATIONS) {
    if (combo.itemA === itemId && existingItemIds.includes(combo.itemB)) count++;
    if (combo.itemB === itemId && existingItemIds.includes(combo.itemA)) count++;
  }
  return count;
}

/**
 * Get how many items in a list would receive buffs from the given item's tags.
 */
export function countPossibleBuffs(itemTags: string[], existingItemTags: string[][]): number {
  let count = 0;
  for (const tags of existingItemTags) {
    for (const tag of itemTags) {
      if (tags.includes(tag)) { count++; break; }
    }
  }
  return count;
}
