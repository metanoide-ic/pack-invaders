/**
 * CARD DEFINITIONS — escolha 1 de 3 após cada wave.
 * Cartas de personagem refletem o estilo dele.
 * Neutras são gambits universais.
 *
 * IMPORTANTE: efeitos persistentes usam item.state._cp (sobrevive ao recalculateSynergies).
 * Efeitos de flags globais (game._*) persistem naturalmente no GameManager.
 */

import { GameManager } from '../core/GameManager';
import { getItemWeight } from '../core/ItemSystem';

export interface CardDefinition {
  id: string;
  name: string;
  description: string;
  characterId: string | null;
  weight: number;
  apply: (game: GameManager) => void;
}

// ─── Persistent card buff helper ─────────────────────────────────────────────
// Armazena bônus em item.state._cp para sobreviver ao recalculateSynergies().
// d=damageMult, r=fireRateMult, p=projCount+, a=armor+, h=heal+, s=projSpeedMult, ao=aoeRadius+

function cp(item: any, opts: { d?: number; r?: number; p?: number; a?: number; h?: number; s?: number; ao?: number }): void {
  const persist = (item.state._cp = item.state._cp ?? {});
  if (opts.d !== undefined) persist.d = (persist.d ?? 1) * opts.d;
  if (opts.r !== undefined) persist.r = (persist.r ?? 1) * opts.r;
  if (opts.p !== undefined) persist.p = (persist.p ?? 0) + opts.p;
  if (opts.a !== undefined) persist.a = (persist.a ?? 0) + opts.a;
  if (opts.h !== undefined) persist.h = (persist.h ?? 0) + opts.h;
  if (opts.s !== undefined) persist.s = (persist.s ?? 1) * opts.s;
  if (opts.ao !== undefined) persist.ao = (persist.ao ?? 0) + opts.ao;
}

// ─── Rômulo (Grass Man) Cards ───────────────────────────────────────────────────

export const GRASS_MAN_CARDS: CardDefinition[] = [
  {
    id: 'photosynthesis',
    name: 'Fotossíntese',
    description: '+2 HP/s permanente. Itens [Orgânico] -10% dano.',
    characterId: 'grass_man',
    weight: 5,
    apply(game) {
      game.combat.state.playerMaxHp += 5;
      game.combat.state.playerHp += 5;
      for (const item of game.backpack.getAllItems()) {
        if (item.definition.tags.includes('Orgânico') || item.definition.tags.includes('Planta')) {
          cp(item, { h: 0.5 });
        } else {
          cp(item, { d: 0.92 });
        }
      }
    },
  },
  {
    id: 'deep_roots',
    name: 'Raízes Profundas',
    description: 'Itens na linha inferior: x2 dano. Linha superior: -50% dano.',
    characterId: 'grass_man',
    weight: 4,
    apply(game) {
      for (const item of game.backpack.getAllItems()) {
        if (item.position.row >= game.backpack.rows - 1) {
          cp(item, { d: 2 });
        } else if (item.position.row === 0) {
          cp(item, { d: 0.5 });
        }
      }
    },
  },
  {
    id: 'growth_spurt',
    name: 'Surto de Crescimento',
    description: '+20 HP máximo. Inimigos ganham +15% HP esta run.',
    characterId: 'grass_man',
    weight: 3,
    apply(game) {
      game.combat.state.playerMaxHp += 20;
      game.combat.state.playerHp += 20;
      (game as any)._enemyHpBonus = ((game as any)._enemyHpBonus ?? 0) + 0.15;
    },
  },
  {
    id: 'thorn_armor',
    name: 'Armadura de Espinhos',
    description: '+5 armadura. Inimigos que tocam você levam 10 dano.',
    characterId: 'grass_man',
    weight: 5,
    apply(game) {
      for (const item of game.backpack.getAllItems()) {
        cp(item, { a: 2 });
      }
      (game as any)._contactDamage = ((game as any)._contactDamage ?? 0) + 10;
    },
  },
  {
    id: 'vine_whip',
    name: 'Chicote de Vinha',
    description: '+25% cadência para itens [Planta/Orgânico]. Outros -5% cadência.',
    characterId: 'grass_man',
    weight: 4,
    apply(game) {
      for (const item of game.backpack.getAllItems()) {
        if (item.definition.tags.includes('Planta') || item.definition.tags.includes('Orgânico')) {
          cp(item, { r: 1.25 });
        } else {
          cp(item, { r: 0.95 });
        }
      }
    },
  },
  {
    id: 'pollination',
    name: 'Polinização',
    description: 'Itens [Animal] adjacentes a [Planta] ganham +50% dano.',
    characterId: 'grass_man',
    weight: 3,
    apply(game) {
      for (const item of game.backpack.getItemsByTag('Animal')) {
        const neighbors = game.backpack.getAdjacentItems(item.instanceId);
        if (neighbors.some(n => n.definition.tags.includes('Planta'))) {
          cp(item, { d: 1.5 });
        }
      }
    },
  },
  {
    id: 'compost',
    name: 'Compostagem',
    description: '+3 HP/s. +20% dano para [Orgânico].',
    characterId: 'grass_man',
    weight: 5,
    apply(game) {
      game.combat.state.playerMaxHp += 10;
      game.combat.state.playerHp += 10;
      for (const item of game.backpack.getItemsByTag('Orgânico')) {
        cp(item, { d: 1.2, h: 0.5 });
      }
    },
  },
  {
    id: 'rapid_growth',
    name: 'Crescimento Rápido',
    description: '+40% cadência global permanente.',
    characterId: 'grass_man',
    weight: 3,
    apply(game) {
      for (const item of game.backpack.getAllItems()) {
        cp(item, { r: 1.4 });
      }
    },
  },
  {
    id: 'bark_skin',
    name: 'Pele de Casca',
    description: '+12 armadura. -10% velocidade de projétil.',
    characterId: 'grass_man',
    weight: 4,
    apply(game) {
      for (const item of game.backpack.getAllItems()) {
        cp(item, { a: 2, s: 0.9 });
      }
    },
  },
  {
    id: 'seed_burst',
    name: 'Explosão de Sementes',
    description: '+2 projéteis para todos emissores, -25% dano cada.',
    characterId: 'grass_man',
    weight: 3,
    apply(game) {
      for (const item of game.backpack.getItemsByTag('Emissor')) {
        cp(item, { p: 2, d: 0.75 });
      }
    },
  },
  {
    id: 'natures_wrath',
    name: 'Ira da Natureza',
    description: '+80% dano global. Perde 2 HP/s.',
    characterId: 'grass_man',
    weight: 3,
    apply(game) {
      for (const item of game.backpack.getAllItems()) {
        cp(item, { d: 1.8, h: -0.15 });
      }
    },
  },
  {
    id: 'morning_dew',
    name: 'Orvalho Matinal',
    description: 'Cura 30 HP agora. +1 HP/s permanente.',
    characterId: 'grass_man',
    weight: 6,
    apply(game) {
      game.combat.state.playerHp = Math.min(game.combat.state.playerMaxHp, game.combat.state.playerHp + 30);
      // Permanent heal: stored as game flag, applied in CombatEngine.applyHealing
      (game as any)._permanentHealPerSec = ((game as any)._permanentHealPerSec ?? 0) + 1;
    },
  },
  {
    id: 'symbiosis',
    name: 'Simbiose',
    description: 'Cada par de itens adjacentes ganha +10% em tudo.',
    characterId: 'grass_man',
    weight: 4,
    apply(game) {
      for (const item of game.backpack.getAllItems()) {
        const neighbors = game.backpack.getAdjacentItems(item.instanceId);
        const bonus = 1 + neighbors.length * 0.1;
        cp(item, { d: bonus, r: bonus });
      }
    },
  },
  {
    id: 'overgrowth',
    name: 'Supercrescimento',
    description: 'Itens [Planta] ganham +100% dano.',
    characterId: 'grass_man',
    weight: 3,
    apply(game) {
      for (const item of game.backpack.getItemsByTag('Planta')) {
        cp(item, { d: 2 });
      }
    },
  },
  {
    id: 'forest_canopy',
    name: 'Dossel Florestal',
    description: 'Itens na linha do topo ganham +50% cadência.',
    characterId: 'grass_man',
    weight: 4,
    apply(game) {
      for (const item of game.backpack.getAllItems()) {
        if (item.position.row === 0) {
          cp(item, { r: 1.5 });
        }
      }
    },
  },
  {
    id: 'mycelium_network',
    name: 'Rede de Micélio',
    description: 'Todos os itens ganham +5% dano para cada outro item na mochila.',
    characterId: 'grass_man',
    weight: 4,
    apply(game) {
      const count = game.backpack.getAllItems().length;
      for (const item of game.backpack.getAllItems()) {
        cp(item, { d: 1 + (count - 1) * 0.05 });
      }
    },
  },
  {
    id: 'sap_shield',
    name: 'Escudo de Seiva',
    description: '+4 armadura para cada item [Planta] na mochila.',
    characterId: 'grass_man',
    weight: 4,
    apply(game) {
      const plantCount = game.backpack.getItemsByTag('Planta').length;
      for (const item of game.backpack.getAllItems()) {
        cp(item, { a: plantCount * 4 });
      }
    },
  },
  {
    id: 'wild_mutation',
    name: 'Mutação Selvagem',
    description: 'Item aleatório ganha +200% dano. Outro perde 50%.',
    characterId: 'grass_man',
    weight: 3,
    apply(game) {
      const items = game.backpack.getAllItems();
      if (items.length >= 2) {
        const idx = Math.floor(Math.random() * items.length);
        cp(items[idx], { d: 3 });
        const other = (idx + 1) % items.length;
        cp(items[other], { d: 0.5 });
      }
    },
  },
  {
    id: 'piercing_roots',
    name: 'Raízes Perfurantes',
    description: 'Todos os projéteis perfuram +1 inimigo.',
    characterId: 'grass_man',
    weight: 4,
    apply(game) {
      for (const item of game.backpack.getItemsByTag('Emissor')) {
        item.state.piercingBonus = (item.state.piercingBonus ?? 0) + 1;
      }
    },
  },
  {
    id: 'gold_harvest',
    name: 'Colheita Dourada',
    description: '+25 gold agora. +3 gold por kill permanente.',
    characterId: 'grass_man',
    weight: 5,
    apply(game) {
      game.gold += 25;
      (game as any)._goldPerKill = ((game as any)._goldPerKill ?? 0) + 3;
    },
  },
];

// ─── Kagutsuchi (Fire Lord) Cards ──────────────────────────────────────────────────

export const FIRE_LORD_CARDS: CardDefinition[] = [
  {
    id: 'inferno',
    name: 'Inferno',
    description: 'Todos [Fogo] +60% dano. Perde 1 HP/s.',
    characterId: 'fire_lord',
    weight: 4,
    apply(game) {
      for (const item of game.backpack.getItemsByTag('Fogo')) {
        cp(item, { d: 1.6 });
      }
      (game as any)._permanentHealPerSec = ((game as any)._permanentHealPerSec ?? 0) - 1;
    },
  },
  {
    id: 'ash_to_ash',
    name: 'Cinzas às Cinzas',
    description: 'Inimigos mortos explodem por 10 dano.',
    characterId: 'fire_lord',
    weight: 5,
    apply(game) {
      (game as any)._explodeOnKill = ((game as any)._explodeOnKill ?? 0) + 10;
    },
  },
  {
    id: 'pyromaniac',
    name: 'Piromaníaco',
    description: '+1 projétil para armas [Fogo].',
    characterId: 'fire_lord',
    weight: 4,
    apply(game) {
      for (const item of game.backpack.getItemsByTag('Fogo')) {
        if (item.definition.tags.includes('Emissor')) {
          cp(item, { p: 1 });
        }
      }
    },
  },
  {
    id: 'molten_core',
    name: 'Núcleo Fundido',
    description: '+100% dano. -5 HP máximo.',
    characterId: 'fire_lord',
    weight: 3,
    apply(game) {
      for (const item of game.backpack.getAllItems()) {
        cp(item, { d: 2 });
      }
      game.combat.state.playerMaxHp = Math.max(10, game.combat.state.playerMaxHp - 5);
      game.combat.state.playerHp = Math.min(game.combat.state.playerHp, game.combat.state.playerMaxHp);
    },
  },
  {
    id: 'flame_surge',
    name: 'Surto de Chamas',
    description: '+50% cadência para [Fogo]. Outros -10% cadência.',
    characterId: 'fire_lord',
    weight: 4,
    apply(game) {
      for (const item of game.backpack.getAllItems()) {
        if (item.definition.tags.includes('Fogo')) {
          cp(item, { r: 1.5 });
        } else {
          cp(item, { r: 0.9 });
        }
      }
    },
  },
  {
    id: 'fire_walk',
    name: 'Caminho de Fogo',
    description: '+40% velocidade de projéteis [Fogo]. +AoE 10.',
    characterId: 'fire_lord',
    weight: 5,
    apply(game) {
      for (const item of game.backpack.getItemsByTag('Fogo')) {
        cp(item, { s: 1.4, ao: 10 });
      }
    },
  },
  {
    id: 'burning_rage',
    name: 'Fúria Ardente',
    description: 'Abaixo de 50% HP agora: +80% dano global permanente.',
    characterId: 'fire_lord',
    weight: 4,
    apply(game) {
      const ratio = game.combat.state.playerHp / game.combat.state.playerMaxHp;
      if (ratio <= 0.5) {
        for (const item of game.backpack.getAllItems()) {
          cp(item, { d: 1.8 });
        }
      }
    },
  },
  {
    id: 'scorched_earth',
    name: 'Terra Arrasada',
    description: '+30 AoE raio para todos emissores. -1 HP/s.',
    characterId: 'fire_lord',
    weight: 3,
    apply(game) {
      for (const item of game.backpack.getItemsByTag('Emissor')) {
        cp(item, { ao: 30 });
      }
      (game as any)._permanentHealPerSec = ((game as any)._permanentHealPerSec ?? 0) - 1;
    },
  },
  {
    id: 'phoenix_rebirth',
    name: 'Renascimento da Fênix',
    description: 'Ao morrer, revive com 30 HP (1x por run).',
    characterId: 'fire_lord',
    weight: 3,
    apply(game) {
      (game as any)._phoenixRevive = true;
    },
  },
  {
    id: 'heat_wave',
    name: 'Onda de Calor',
    description: 'Inimigos perdem 1 HP/s passivamente.',
    characterId: 'fire_lord',
    weight: 5,
    apply(game) {
      (game as any)._heatWaveDps = ((game as any)._heatWaveDps ?? 0) + 1;
    },
  },
  {
    id: 'volcanic_eruption',
    name: 'Erupção Vulcânica',
    description: '+3 projéteis para todos emissores, -40% dano cada.',
    characterId: 'fire_lord',
    weight: 3,
    apply(game) {
      for (const item of game.backpack.getItemsByTag('Emissor')) {
        cp(item, { p: 3, d: 0.6 });
      }
    },
  },
  {
    id: 'ember_shield',
    name: 'Escudo de Brasas',
    description: '+10 armadura. Atacantes recebem 5 dano.',
    characterId: 'fire_lord',
    weight: 4,
    apply(game) {
      for (const item of game.backpack.getAllItems()) {
        cp(item, { a: 2 });
      }
      (game as any)._contactDamage = ((game as any)._contactDamage ?? 0) + 5;
    },
  },
  {
    id: 'fire_blood',
    name: 'Sangue de Fogo',
    description: 'Converte cura passiva em +dano. +5% por ponto de cura.',
    characterId: 'fire_lord',
    weight: 3,
    apply(game) {
      let totalHeal = 0;
      for (const item of game.backpack.getAllItems()) {
        totalHeal += item.stats.healPerSecond;
      }
      const bonus = 1 + Math.max(0, totalHeal) * 0.05;
      for (const item of game.backpack.getAllItems()) {
        cp(item, { d: bonus, h: -item.stats.healPerSecond });
      }
    },
  },
  {
    id: 'chain_reaction',
    name: 'Reação em Cadeia',
    description: 'Explosões ganham +50% raio e +20% dano.',
    characterId: 'fire_lord',
    weight: 4,
    apply(game) {
      for (const item of game.backpack.getAllItems()) {
        if (item.stats.aoeRadius > 0 || item.definition.tags.includes('Explosivo')) {
          cp(item, { ao: item.stats.aoeRadius * 0.5, d: 1.2 });
        }
      }
    },
  },
  {
    id: 'hellfire_pact',
    name: 'Pacto Infernal',
    description: '+150% dano. Perde 50% HP máximo.',
    characterId: 'fire_lord',
    weight: 2,
    apply(game) {
      for (const item of game.backpack.getAllItems()) {
        cp(item, { d: 2.5 });
      }
      game.combat.state.playerMaxHp = Math.max(10, Math.floor(game.combat.state.playerMaxHp * 0.5));
      game.combat.state.playerHp = Math.min(game.combat.state.playerHp, game.combat.state.playerMaxHp);
    },
  },
];

// ─── Mazu (Aqua Sage) Cards ──────────────────────────────────────────────────

export const AQUA_SAGE_CARDS: CardDefinition[] = [
  { id: 'onda_pressao', name: 'Onda de Pressão', description: 'Projéteis [Água] empurram inimigos para trás.', characterId: 'aqua_sage', weight: 4,
    apply(game) { for (const i of game.backpack.getItemsByTag('Água')) { i.state.pushback = (i.state.pushback ?? 0) + 30; } } },
  { id: 'corrente_profunda', name: 'Corrente Profunda', description: '+30% vel. projétil [Água], -10% dano.', characterId: 'aqua_sage', weight: 5,
    apply(game) { for (const i of game.backpack.getItemsByTag('Água')) { cp(i, { s: 1.3, d: 0.9 }); } } },
  { id: 'mar_calmo', name: 'Mar Calmo', description: '+5 HP/s permanente.', characterId: 'aqua_sage', weight: 4,
    apply(game) { (game as any)._permanentHealPerSec = ((game as any)._permanentHealPerSec ?? 0) + 5; } },
  { id: 'gelo_negro', name: 'Gelo Negro', description: 'Projéteis [Água] congelam inimigos por 0.5s.', characterId: 'aqua_sage', weight: 3,
    apply(game) { for (const i of game.backpack.getItemsByTag('Água')) { i.state.freezeDuration = (i.state.freezeDuration ?? 0) + 0.5; } } },
  { id: 'mare_alta', name: 'Maré Alta', description: '+33% cadência global.', characterId: 'aqua_sage', weight: 4,
    apply(game) { for (const i of game.backpack.getItemsByTag('Emissor')) { cp(i, { r: 1.33 }); } } },
  { id: 'resistencia_sub', name: 'Resistência Submarina', description: '+15 armadura, -10% cadência.', characterId: 'aqua_sage', weight: 5,
    apply(game) { for (const i of game.backpack.getAllItems()) { cp(i, { a: 3, r: 0.9 }); } } },
  { id: 'torpedo', name: 'Torpedo', description: '+100% dano ao emissor mais forte.', characterId: 'aqua_sage', weight: 3,
    apply(game) { const items = game.backpack.getItemsByTag('Emissor'); if (items.length > 0) { cp(items[0], { d: 2 }); } } },
  { id: 'refracao', name: 'Refração', description: 'Projéteis [Água] dividem em 2 ao atingir (-30% dano).', characterId: 'aqua_sage', weight: 3,
    apply(game) { for (const i of game.backpack.getItemsByTag('Água')) { cp(i, { p: 1, d: 0.7 }); } } },
  { id: 'diluvio', name: 'Dilúvio', description: 'Todos emissores disparam +1 projétil.', characterId: 'aqua_sage', weight: 4,
    apply(game) { for (const i of game.backpack.getItemsByTag('Emissor')) { cp(i, { p: 1 }); } } },
  { id: 'ancora', name: 'Âncora', description: '+20% dano, vel. projétil -30%.', characterId: 'aqua_sage', weight: 5,
    apply(game) { for (const i of game.backpack.getAllItems()) { cp(i, { d: 1.2, s: 0.7 }); } } },
  { id: 'resgate', name: 'Resgate', description: 'Cura 40 HP agora. +15 HP máximo.', characterId: 'aqua_sage', weight: 4,
    apply(game) { game.combat.state.playerMaxHp += 15; game.combat.state.playerHp = Math.min(game.combat.state.playerMaxHp, game.combat.state.playerHp + 40); } },
  { id: 'profundezas', name: 'Profundezas', description: 'Itens na última linha ganham +80% dano.', characterId: 'aqua_sage', weight: 4,
    apply(game) { const maxRow = game.backpack.rows - 1; for (const i of game.backpack.getAllItems()) { if (i.position.row >= maxRow) cp(i, { d: 1.8 }); } } },
  { id: 'maresia', name: 'Maresia', description: 'Inimigos 20% mais lentos permanentemente.', characterId: 'aqua_sage', weight: 5,
    apply(game) { (game as any)._globalSlow = ((game as any)._globalSlow ?? 1) * 0.8; } },
  { id: 'pressurizacao', name: 'Pressurização', description: '+50% dano se HP acima de 80% agora.',  characterId: 'aqua_sage', weight: 4,
    apply(game) { const ratio = game.combat.state.playerHp / game.combat.state.playerMaxHp; if (ratio >= 0.8) { for (const i of game.backpack.getAllItems()) { cp(i, { d: 1.5 }); } } } },
  { id: 'recuo_tatico', name: 'Recuo Tático', description: '+30% dano global permanente.', characterId: 'aqua_sage', weight: 3,
    apply(game) { for (const i of game.backpack.getItemsByTag('Emissor')) { cp(i, { d: 1.3 }); } } },
];

// ─── Frank (Storm Runner) Cards ──────────────────────────────────────────────

export const STORM_RUNNER_CARDS: CardDefinition[] = [
  { id: 'sobrecarga', name: 'Sobrecarga', description: '+60% cadência. -5 HP máximo.', characterId: 'storm_runner', weight: 4,
    apply(game) { for (const i of game.backpack.getAllItems()) { cp(i, { r: 1.6 }); } game.combat.state.playerMaxHp = Math.max(10, game.combat.state.playerMaxHp - 5); } },
  { id: 'curto_circuito', name: 'Curto-Circuito', description: 'Ao matar, 30% chance de chain para inimigo próximo.', characterId: 'storm_runner', weight: 4,
    apply(game) { for (const i of game.backpack.getItemsByTag('Elétrico')) { i.state.chainChance = (i.state.chainChance ?? 0) + 0.3; } } },
  { id: 'freq_alien', name: 'Frequência Alien', description: '+10% cadência. Inimigos visíveis mais cedo.', characterId: 'storm_runner', weight: 5,
    apply(game) { for (const i of game.backpack.getAllItems()) { cp(i, { r: 1.1 }); } } },
  { id: 'instabilidade', name: 'Instabilidade', description: '+25% dano global.', characterId: 'storm_runner', weight: 4,
    apply(game) { for (const i of game.backpack.getAllItems()) { cp(i, { d: 1.25 }); } } },
  { id: 'fusao_acelerada', name: 'Fusão Acelerada', description: '+15% cadência permanente.', characterId: 'storm_runner', weight: 3,
    apply(game) { for (const i of game.backpack.getAllItems()) { cp(i, { r: 1.15 }); } } },
  { id: 'radiacao_passiva', name: 'Radiação Passiva', description: 'Inimigos próximos levam 2 dano/s.', characterId: 'storm_runner', weight: 5,
    apply(game) { (game as any)._auraBaseDps = ((game as any)._auraBaseDps ?? 0) + 2; } },
  { id: 'pulso_emp', name: 'Pulso EMP', description: 'A cada 20s, paralisa todos inimigos por 1s.', characterId: 'storm_runner', weight: 3,
    apply(game) { (game as any)._empInterval = 20; } },
  { id: 'desintegracao', name: 'Desintegração', description: '+30% dano para itens [Elétrico].',  characterId: 'storm_runner', weight: 4,
    apply(game) { for (const i of game.backpack.getItemsByTag('Elétrico')) { cp(i, { d: 1.3 }); } } },
  { id: 'carga_residual', name: 'Carga Residual', description: 'Inimigos mortos explodem em arco elétrico (8 dano).', characterId: 'storm_runner', weight: 4,
    apply(game) { (game as any)._explodeOnKill = ((game as any)._explodeOnKill ?? 0) + 8; } },
  { id: 'overdrive', name: 'Overdrive', description: '+20% cadência permanente.', characterId: 'storm_runner', weight: 3,
    apply(game) { for (const i of game.backpack.getAllItems()) { cp(i, { r: 1.2 }); } } },
  { id: 'meia_vida', name: 'Meia-Vida', description: '-10 HP máximo, +30% dano.', characterId: 'storm_runner', weight: 4,
    apply(game) { game.combat.state.playerMaxHp = Math.max(10, game.combat.state.playerMaxHp - 10); game.combat.state.playerHp = Math.min(game.combat.state.playerHp, game.combat.state.playerMaxHp); for (const i of game.backpack.getAllItems()) { cp(i, { d: 1.3 }); } } },
  { id: 'ionizacao', name: 'Ionização', description: '+5 AoE raio e +10% dano para emissores.', characterId: 'storm_runner', weight: 4,
    apply(game) { for (const i of game.backpack.getItemsByTag('Emissor')) { cp(i, { ao: 5, d: 1.1 }); } } },
  { id: 'tempestade', name: 'Tempestade', description: 'Spawna 3 raios a cada 8s durante combate.', characterId: 'storm_runner', weight: 4,
    apply(game) { (game as any)._lightningInterval = 8; } },
  { id: 'absorcao_st', name: 'Absorção', description: 'Cura 15 HP agora. +10 HP máximo.', characterId: 'storm_runner', weight: 5,
    apply(game) { game.combat.state.playerMaxHp += 10; game.combat.state.playerHp = Math.min(game.combat.state.playerMaxHp, game.combat.state.playerHp + 15); } },
  { id: 'colapso_nuclear', name: 'Colapso Nuclear', description: 'Ao morrer, mata todos na tela e revive com 1 HP (1x/run).', characterId: 'storm_runner', weight: 2,
    apply(game) { (game as any)._nuclearRevive = true; } },
];

// ─── Dr. Eon (Void Walker) Cards ───────────────────────────────────────────────

export const VOID_WALKER_CARDS: CardDefinition[] = [
  { id: 'fenda_menor', name: 'Fenda Menor', description: 'Projéteis teletransportam inimigos para posição aleatória.', characterId: 'void_walker', weight: 4,
    apply(game) { for (const i of game.backpack.getAllItems()) { i.state.teleportOnHit = 1; } } },
  { id: 'gravitacao', name: 'Gravitação', description: 'Inimigos são puxados pro centro da tela (+15 força).', characterId: 'void_walker', weight: 5,
    apply(game) { (game as any)._gravityPull = ((game as any)._gravityPull ?? 0) + 15; } },
  { id: 'tempo_fraturado', name: 'Tempo Fraturado', description: '+20% cadência global.', characterId: 'void_walker', weight: 4,
    apply(game) { for (const i of game.backpack.getItemsByTag('Emissor')) { cp(i, { r: 1.2 }); } } },
  { id: 'duplicacao', name: 'Duplicação', description: '+10% dano e cadência em tudo.', characterId: 'void_walker', weight: 3,
    apply(game) { for (const i of game.backpack.getAllItems()) { cp(i, { d: 1.1, r: 1.1 }); } } },
  { id: 'sacrificio_dim', name: 'Sacrifício Dimensional', description: 'Perde 20 HP, ganha +50 gold e +40% dano.', characterId: 'void_walker', weight: 4,
    apply(game) { game.combat.state.playerHp = Math.max(1, game.combat.state.playerHp - 20); game.gold += 50; for (const i of game.backpack.getAllItems()) { cp(i, { d: 1.4 }); } } },
  { id: 'olhar_vazio', name: 'Olhar do Vazio', description: 'Inimigos com <10% HP morrem instantaneamente.', characterId: 'void_walker', weight: 4,
    apply(game) { (game as any)._executeThreshold = Math.max((game as any)._executeThreshold ?? 0, 0.1); } },
  { id: 'singularidade', name: 'Singularidade', description: 'A cada 30s, cria um buraco negro que puxa tudo por 2s.', characterId: 'void_walker', weight: 3,
    apply(game) { (game as any)._blackHoleInterval = 30; } },
  { id: 'distorcao', name: 'Distorção', description: 'Projéteis inimigos 50% mais lentos permanentemente.', characterId: 'void_walker', weight: 5,
    apply(game) { (game as any)._enemyProjSlow = ((game as any)._enemyProjSlow ?? 1) * 0.5; } },
  { id: 'fragmentacao', name: 'Fragmentação', description: 'Ao matar, o inimigo vira 2 projéteis aliados.', characterId: 'void_walker', weight: 3,
    apply(game) { (game as any)._deathProjectiles = ((game as any)._deathProjectiles ?? 0) + 2; } },
  { id: 'eco_temporal', name: 'Eco Temporal', description: '+2 projéteis para emissores, -40% dano cada.', characterId: 'void_walker', weight: 4,
    apply(game) { for (const i of game.backpack.getItemsByTag('Emissor')) { cp(i, { p: 2, d: 0.6 }); } } },
  { id: 'entropia', name: 'Entropia', description: '+5% dano para cada mês sobrevivido nesta run.', characterId: 'void_walker', weight: 5,
    apply(game) { const months = game.totalMonths; for (const i of game.backpack.getAllItems()) { cp(i, { d: 1 + months * 0.05 }); } } },
  { id: 'inversao', name: 'Inversão', description: 'Ao tomar dano, reflexo 30% de volta (permanente).', characterId: 'void_walker', weight: 3,
    apply(game) { (game as any)._damageReflect = ((game as any)._damageReflect ?? 0) + 0.3; } },
  { id: 'anti_materia', name: 'Anti-Matéria', description: 'Projéteis destroem projéteis inimigos ao colidir.', characterId: 'void_walker', weight: 4,
    apply(game) { (game as any)._antiMatter = true; } },
  { id: 'rift_walk', name: 'Rift Walk', description: 'Ao tomar dano letal, teleporta com 1 HP (1x/wave).', characterId: 'void_walker', weight: 3,
    apply(game) { (game as any)._riftWalk = true; } },
  { id: 'abraco_vazio', name: 'Abraço do Vazio', description: '-50% HP máximo. +100% dano e cadência em tudo.', characterId: 'void_walker', weight: 2,
    apply(game) { game.combat.state.playerMaxHp = Math.max(10, Math.floor(game.combat.state.playerMaxHp * 0.5)); game.combat.state.playerHp = Math.min(game.combat.state.playerHp, game.combat.state.playerMaxHp); for (const i of game.backpack.getAllItems()) { cp(i, { d: 2, r: 2 }); } } },
];

// ─── Necra (Beast Tamer) Cards ───────────────────────────────────────────────

export const BEAST_TAMER_CARDS: CardDefinition[] = [
  { id: 'reanimacao', name: 'Reanimação', description: 'Inimigos mortos têm 15% chance de lutar por você 5s.', characterId: 'beast_tamer', weight: 4,
    apply(game) { (game as any)._reanimate = ((game as any)._reanimate ?? 0) + 0.15; } },
  { id: 'controle_mental', name: 'Controle Mental', description: '1 inimigo por wave se torna aliado permanente.', characterId: 'beast_tamer', weight: 3,
    apply(game) { (game as any)._mindControl = true; } },
  { id: 'enxame_morto', name: 'Enxame Morto', description: 'A cada 5 kills, spawna um drone aliado.', characterId: 'beast_tamer', weight: 4,
    apply(game) { (game as any)._dronePerKills = 5; } },
  { id: 'elo_vital', name: 'Elo Vital', description: 'Pets ganham +20% dano para cada outro pet na mochila.', characterId: 'beast_tamer', weight: 5,
    apply(game) {
      const pets = game.backpack.getItemsByTag('Pet').length + game.backpack.getItemsByTag('Animal').length;
      for (const i of [...game.backpack.getItemsByTag('Pet'), ...game.backpack.getItemsByTag('Animal')]) {
        cp(i, { d: 1 + (pets - 1) * 0.2 });
      }
    } },
  { id: 'necrose', name: 'Necrose', description: 'Inimigos mortos deixam nuvem venenosa por 3s.', characterId: 'beast_tamer', weight: 4,
    apply(game) { (game as any)._deathPoison = 3; } },
  { id: 'marionete', name: 'Marionete', description: 'O primeiro inimigo de cada wave fica paralisado 5s.', characterId: 'beast_tamer', weight: 4,
    apply(game) { (game as any)._paralyzeFirst = 5; } },
  { id: 'simbiose_forcada', name: 'Simbiose Forçada', description: '+3 HP/s para cada item [Pet] na mochila.', characterId: 'beast_tamer', weight: 5,
    apply(game) {
      const petCount = game.backpack.getItemsByTag('Pet').length;
      (game as any)._permanentHealPerSec = ((game as any)._permanentHealPerSec ?? 0) + petCount * 3;
    } },
  { id: 'frenesi', name: 'Frenesi', description: 'Pets +50% cadência permanente.', characterId: 'beast_tamer', weight: 4,
    apply(game) {
      for (const i of [...game.backpack.getItemsByTag('Pet'), ...game.backpack.getItemsByTag('Animal')]) {
        cp(i, { r: 1.5 });
      }
    } },
  { id: 'dissecacao', name: 'Dissecação', description: 'Bosses dropam 2x mais gold.', characterId: 'beast_tamer', weight: 5,
    apply(game) { (game as any)._bossGoldMult = 2; } },
  { id: 'carcaca', name: 'Carcaça', description: '+10% dano. Kills explodem causando 8 dano.', characterId: 'beast_tamer', weight: 4,
    apply(game) { for (const i of game.backpack.getAllItems()) { cp(i, { d: 1.1 }); } (game as any)._explodeOnKill = ((game as any)._explodeOnKill ?? 0) + 8; } },
  { id: 'legiao', name: 'Legião', description: '+1 projétil para cada pet na mochila.', characterId: 'beast_tamer', weight: 4,
    apply(game) {
      const pets = game.backpack.getItemsByTag('Pet').length + game.backpack.getItemsByTag('Animal').length;
      for (const i of game.backpack.getItemsByTag('Emissor')) { cp(i, { p: pets }); }
    } },
  { id: 'sussurro', name: 'Sussurro', description: '+10% dano global.', characterId: 'beast_tamer', weight: 5,
    apply(game) { for (const i of game.backpack.getAllItems()) { cp(i, { d: 1.1 }); } } },
  { id: 'possessao', name: 'Possessão', description: '+25% dano global.', characterId: 'beast_tamer', weight: 3,
    apply(game) { for (const i of game.backpack.getAllItems()) { cp(i, { d: 1.25 }); } } },
  { id: 'colheita_bt', name: 'Colheita', description: '+5 HP/s de cura permanente.', characterId: 'beast_tamer', weight: 5,
    apply(game) { (game as any)._permanentHealPerSec = ((game as any)._permanentHealPerSec ?? 0) + 5; } },
  { id: 'dominio', name: 'Domínio', description: '[Pet/Animal] +50% dano. +20 HP máximo.', characterId: 'beast_tamer', weight: 4,
    apply(game) {
      for (const i of [...game.backpack.getItemsByTag('Pet'), ...game.backpack.getItemsByTag('Animal')]) {
        cp(i, { d: 1.5 });
      }
      game.combat.state.playerMaxHp += 20;
      game.combat.state.playerHp += 20;
    } },
];

// ─── Florian (Firefighter) Cards ─────────────────────────────────────────────
// The Guardião Quebrado: never lost a life before the Event, now overcorrects
// hard into pure defense. His pool leans protective (shields, reflect, armor,
// regen) with a few sacrifice/offense cards for players who want to push back.

export const FIREFIGHTER_CARDS: CardDefinition[] = [
  { id: 'escudo_vivo', name: 'Escudo Vivo', description: '+20 escudo máximo, recarrega na hora.', characterId: 'firefighter', weight: 5,
    apply(game) { game.combat.state.playerMaxShield += 20; game.combat.state.playerShield += 20; } },
  { id: 'coracao_de_aco', name: 'Coração de Aço', description: '+25 HP máximo.', characterId: 'firefighter', weight: 5,
    apply(game) { game.combat.state.playerMaxHp += 25; game.combat.state.playerHp += 25; } },
  { id: 'vigilia_eterna', name: 'Vigília Eterna', description: '+3 HP/s de regeneração permanente.', characterId: 'firefighter', weight: 5,
    apply(game) { (game as any)._permanentHealPerSec = ((game as any)._permanentHealPerSec ?? 0) + 3; } },
  { id: 'reflexo_guardiao', name: 'Reflexo do Guardião', description: 'Reflete 25% do dano recebido de volta.', characterId: 'firefighter', weight: 4,
    apply(game) { (game as any)._damageReflect = ((game as any)._damageReflect ?? 0) + 0.25; } },
  { id: 'escudo_de_emergencia_ff', name: 'Escudo de Emergência', description: 'Ganha 40 de escudo ao cair abaixo de 30% HP (1x/wave).', characterId: 'firefighter', weight: 4,
    apply(game) { (game as any)._regenShield = 40; } },
  { id: 'ultima_barreira', name: 'Última Barreira', description: '+80% dano causado abaixo de 25% HP.', characterId: 'firefighter', weight: 4,
    apply(game) { (game as any)._lastStand = true; } },
  { id: 'peso_da_culpa', name: 'Peso da Culpa', description: 'Perde 15 HP. +30% dano em tudo — ele empresta a dor.', characterId: 'firefighter', weight: 3,
    apply(game) { game.combat.state.playerHp = Math.max(1, game.combat.state.playerHp - 15); for (const i of game.backpack.getAllItems()) { cp(i, { d: 1.3 }); } } },
  { id: 'muralha_ambulante', name: 'Muralha Ambulante', description: '+40 HP máximo. -10% dano em tudo.', characterId: 'firefighter', weight: 4,
    apply(game) { game.combat.state.playerMaxHp += 40; game.combat.state.playerHp += 40; for (const i of game.backpack.getAllItems()) { cp(i, { d: 0.9 }); } } },
  { id: 'instinto_de_resgate', name: 'Instinto de Resgate', description: 'Quem toca em você leva 15 de dano.', characterId: 'firefighter', weight: 5,
    apply(game) { (game as any)._contactDamage = ((game as any)._contactDamage ?? 0) + 15; } },
  { id: 'barreira_de_espuma', name: 'Barreira de Espuma', description: 'Inimigos 15% mais lentos, permanentemente.', characterId: 'firefighter', weight: 4,
    apply(game) { (game as any)._globalSlow = ((game as any)._globalSlow ?? 1) * 0.85; } },
  { id: 'extintor_de_cargas', name: 'Extintor de Cargas', description: 'Itens [Água] causam +30% dano.', characterId: 'firefighter', weight: 4,
    apply(game) { for (const i of game.backpack.getAllItems()) { if (i.definition.tags.includes('Água')) cp(i, { d: 1.3 }); } } },
  { id: 'golpe_do_machado', name: 'Golpe do Machado', description: 'Kills explodem, causando 10 dano em área.', characterId: 'firefighter', weight: 4,
    apply(game) { (game as any)._explodeOnKill = ((game as any)._explodeOnKill ?? 0) + 10; } },
  { id: 'furia_do_resgate', name: 'Fúria do Resgate', description: '+15% dano global.', characterId: 'firefighter', weight: 5,
    apply(game) { for (const i of game.backpack.getAllItems()) { cp(i, { d: 1.15 }); } } },
  { id: 'armadura_do_corpo_de_bombeiros', name: 'Armadura do Corpo de Bombeiros', description: '+8 armadura (reduz dano recebido).', characterId: 'firefighter', weight: 4,
    apply(game) { for (const i of game.backpack.getAllItems()) { cp(i, { a: 8 / Math.max(1, game.backpack.getAllItems().length) }); } } },
];

// ─── Zabel (scrapper) Cards — economia de guerra ─────────────────────────────

export const SCRAPPER_CARDS: CardDefinition[] = [
  { id: 'sc_liquidacao', name: 'Liquidação', description: '+60 gold instantâneo. Estoque tem que girar.', characterId: 'scrapper', weight: 5,
    apply(game) { game.gold += 60; } },
  { id: 'sc_taxa_de_desmonte', name: 'Taxa de Desmonte', description: '+2 gold por kill, permanentemente.', characterId: 'scrapper', weight: 5,
    apply(game) { (game as any)._goldPerKill = ((game as any)._goldPerKill ?? 0) + 2; } },
  { id: 'sc_pedagio', name: 'Pedágio', description: 'Cada hit seu tem 20% de chance de soltar 1 gold.', characterId: 'scrapper', weight: 4,
    apply(game) { (game as any)._goldPerHit = ((game as any)._goldPerHit ?? 0) + 0.2; } },
  { id: 'sc_ferro_velho', name: 'Ferro-Velho Ambulante', description: '+20 HP máximo — sucata também é blindagem.', characterId: 'scrapper', weight: 5,
    apply(game) { game.combat.state.playerMaxHp += 20; game.combat.state.playerHp += 20; } },
  { id: 'sc_pecas_recondicionadas', name: 'Peças Recondicionadas', description: '+12% dano em todos os itens.', characterId: 'scrapper', weight: 5,
    apply(game) { for (const i of game.backpack.getAllItems()) { cp(i, { d: 1.12 }); } } },
  { id: 'sc_motor_turbinado', name: 'Motor Turbinado', description: '+15% cadência em todos os itens.', characterId: 'scrapper', weight: 4,
    apply(game) { for (const i of game.backpack.getAllItems()) { cp(i, { r: 1.15 }); } } },
  { id: 'sc_lataria_extra', name: 'Lataria Extra', description: '+15 escudo máximo, recarrega na hora.', characterId: 'scrapper', weight: 4,
    apply(game) { game.combat.state.playerMaxShield += 15; game.combat.state.playerShield += 15; } },
  { id: 'sc_investimento_de_risco', name: 'Investimento de Risco', description: 'Perde 40 gold. +25% dano em tudo — qualidade custa.', characterId: 'scrapper', weight: 3,
    apply(game) { game.gold = Math.max(0, game.gold - 40); for (const i of game.backpack.getAllItems()) { cp(i, { d: 1.25 }); } } },
  { id: 'sc_sucata_explosiva', name: 'Sucata Explosiva', description: 'Kills explodem, causando 8 de dano em área.', characterId: 'scrapper', weight: 4,
    apply(game) { (game as any)._explodeOnKill = ((game as any)._explodeOnKill ?? 0) + 8; } },
  { id: 'sc_ima_de_moedas', name: 'Ímã de Moedas', description: 'Gold e power-ups voam até você de mais longe.', characterId: 'scrapper', weight: 4,
    apply(game) { (game.combat as any)._relicPickup = ((game.combat as any)._relicPickup ?? 0) + 0.5; } },
];

// ─── Sétimo (renegade) Cards — biologia xeno ─────────────────────────────────

export const RENEGADE_CARDS: CardDefinition[] = [
  { id: 'rn_carapaca_espinhosa', name: 'Carapaça Espinhosa', description: 'Quem toca em você leva 12 de dano.', characterId: 'renegade', weight: 5,
    apply(game) { (game as any)._contactDamage = ((game as any)._contactDamage ?? 0) + 12; } },
  { id: 'rn_sangue_acido', name: 'Sangue Ácido', description: 'Itens [Veneno] causam +35% de dano.', characterId: 'renegade', weight: 5,
    apply(game) { for (const i of game.backpack.getAllItems()) { if (i.definition.tags.includes('Veneno')) cp(i, { d: 1.35 }); } } },
  { id: 'rn_simbiose', name: 'Simbiose', description: 'Itens [Orgânico] causam +25% de dano e curam +1 HP/s.', characterId: 'renegade', weight: 5,
    apply(game) { for (const i of game.backpack.getAllItems()) { if (i.definition.tags.includes('Orgânico')) cp(i, { d: 1.25, h: 1 }); } } },
  { id: 'rn_metabolismo_xeno', name: 'Metabolismo Xeno', description: '+2 HP/s de regeneração permanente.', characterId: 'renegade', weight: 4,
    apply(game) { (game as any)._permanentHealPerSec = ((game as any)._permanentHealPerSec ?? 0) + 2; } },
  { id: 'rn_instinto_predador', name: 'Instinto Predador', description: 'Executa inimigos abaixo de 12% de HP.', characterId: 'renegade', weight: 4,
    apply(game) { (game as any)._executeThreshold = Math.max((game as any)._executeThreshold ?? 0, 0.12); } },
  { id: 'rn_membrana_reflexa', name: 'Membrana Reflexa', description: 'Reflete 20% do dano recebido de volta.', characterId: 'renegade', weight: 4,
    apply(game) { (game as any)._damageReflect = ((game as any)._damageReflect ?? 0) + 0.2; } },
  { id: 'rn_crescimento_acelerado', name: 'Crescimento Acelerado', description: '+30 HP máximo — a carapaça engrossa.', characterId: 'renegade', weight: 5,
    apply(game) { game.combat.state.playerMaxHp += 30; game.combat.state.playerHp += 30; } },
  { id: 'rn_feromonio_de_medo', name: 'Feromônio de Medo', description: 'Inimigos 12% mais lentos, permanentemente.', characterId: 'renegade', weight: 4,
    apply(game) { (game as any)._globalSlow = ((game as any)._globalSlow ?? 1) * 0.88; } },
  { id: 'rn_toxina_de_despedida', name: 'Toxina de Despedida', description: 'Inimigos que morrem envenenam vizinhos (6 de dano).', characterId: 'renegade', weight: 4,
    apply(game) { (game as any)._deathPoison = ((game as any)._deathPoison ?? 0) + 6; } },
  { id: 'rn_traicao_total', name: 'Traição Total', description: 'Perde 20 HP. +30% dano em tudo — ele não guarda mais nada do Enxame.', characterId: 'renegade', weight: 3,
    apply(game) { game.combat.state.playerHp = Math.max(1, game.combat.state.playerHp - 20); for (const i of game.backpack.getAllItems()) { cp(i, { d: 1.3 }); } } },
];

// ─── Neutral Cards (available to all characters) ─────────────────────────────

export const NEUTRAL_CARDS: CardDefinition[] = [
  { id: 'n_gold_rush', name: 'Corrida do Ouro', description: '+30 gold instantâneo.', characterId: null, weight: 6,
    apply(game) { game.gold += 30; } },
  { id: 'n_full_heal', name: 'Recuperação Total', description: 'Restaura HP ao máximo.', characterId: null, weight: 4,
    apply(game) { game.combat.state.playerHp = game.combat.state.playerMaxHp; } },
  { id: 'n_max_hp_up', name: 'Vitalidade', description: '+15 HP máximo permanente.', characterId: null, weight: 5,
    apply(game) { game.combat.state.playerMaxHp += 15; game.combat.state.playerHp += 15; } },
  { id: 'n_all_damage_up', name: 'Fúria', description: '+15% dano global.', characterId: null, weight: 5,
    apply(game) { for (const i of game.backpack.getAllItems()) { cp(i, { d: 1.15 }); } } },
  { id: 'n_all_firerate_up', name: 'Adrenalina', description: '+15% cadência global.', characterId: null, weight: 5,
    apply(game) { for (const i of game.backpack.getAllItems()) { cp(i, { r: 1.15 }); } } },
  { id: 'n_armor_up', name: 'Fortificação', description: '+5 armadura permanente.', characterId: null, weight: 5,
    apply(game) { for (const i of game.backpack.getAllItems()) { cp(i, { a: 1 }); } } },
  { id: 'n_proj_speed', name: 'Propulsão', description: 'Projéteis +30% mais rápidos.', characterId: null, weight: 5,
    apply(game) { for (const i of game.backpack.getAllItems()) { cp(i, { s: 1.3 }); } } },
  { id: 'n_double_gold', name: 'Sorte Grande', description: '+50% gold por wave permanente.', characterId: null, weight: 4,
    apply(game) { (game as any)._goldBonus = ((game as any)._goldBonus ?? 0) + 0.5; } },
  { id: 'n_reroll', name: 'Novo Estoque', description: 'Próxima loja terá 7 itens em vez de 5.', characterId: null, weight: 4,
    apply(game) { (game as any)._extraShopSlots = 2; } },
  { id: 'n_risk_reward', name: 'Risco e Recompensa', description: '+30% dano, -20 HP máximo.', characterId: null, weight: 3,
    apply(game) { game.combat.state.playerMaxHp = Math.max(10, game.combat.state.playerMaxHp - 20); game.combat.state.playerHp = Math.min(game.combat.state.playerHp, game.combat.state.playerMaxHp); for (const i of game.backpack.getAllItems()) { cp(i, { d: 1.3 }); } } },
  { id: 'n_glass_cannon', name: 'Canhão de Vidro', description: '+50% dano, -40% HP máximo.', characterId: null, weight: 2,
    apply(game) { game.combat.state.playerMaxHp = Math.max(10, Math.floor(game.combat.state.playerMaxHp * 0.6)); game.combat.state.playerHp = Math.min(game.combat.state.playerHp, game.combat.state.playerMaxHp); for (const i of game.backpack.getAllItems()) { cp(i, { d: 1.5 }); } } },
  { id: 'n_tank_mode', name: 'Modo Tanque', description: '+50 HP máximo, -20% cadência.', characterId: null, weight: 4,
    apply(game) { game.combat.state.playerMaxHp += 50; game.combat.state.playerHp += 50; for (const i of game.backpack.getAllItems()) { cp(i, { r: 0.8 }); } } },
  { id: 'n_vampirism', name: 'Vampirismo', description: '+2 HP/s regeneração permanente.', characterId: null, weight: 5,
    apply(game) { (game as any)._permanentHealPerSec = ((game as any)._permanentHealPerSec ?? 0) + 2; } },
  { id: 'n_piercing_all', name: 'Perfuração Total', description: 'Todos projéteis ganham +1 perfuração.', characterId: null, weight: 4,
    apply(game) { for (const i of game.backpack.getAllItems()) { i.state.piercingBonus = (i.state.piercingBonus ?? 0) + 1; } } },
  { id: 'n_aoe_all', name: 'Explosão Generalizada', description: 'Todos projéteis ganham +15 raio AoE.', characterId: null, weight: 4,
    apply(game) { for (const i of game.backpack.getAllItems()) { cp(i, { ao: 15 }); } } },
  { id: 'n_crit_mastery', name: 'Mestre Crítico', description: '+20% chance de crítico global.', characterId: null, weight: 4,
    apply(game) { for (const i of game.backpack.getAllItems()) { i.state.critChance = (i.state.critChance ?? 0) + 0.2; } } },
  { id: 'n_merchant', name: 'Desconto VIP', description: 'Itens na loja custam -20% (permanente).', characterId: null, weight: 3,
    apply(game) { (game as any)._shopDiscount = ((game as any)._shopDiscount ?? 0) + 0.2; } },
  { id: 'n_multishot', name: 'Tiro Múltiplo', description: '+1 projétil em todas armas.', characterId: null, weight: 3,
    apply(game) { for (const i of game.backpack.getAllItems()) { if (i.definition.tags.includes('Emissor')) cp(i, { p: 1 }); } } },
  { id: 'n_lucky_drops', name: 'Drops de Sorte', description: '+3 gold por inimigo derrotado.', characterId: null, weight: 4,
    apply(game) { (game as any)._goldPerKill = ((game as any)._goldPerKill ?? 0) + 3; } },
  { id: 'n_overcharge', name: 'Sobrecarga', description: '+40% dano permanente.', characterId: null, weight: 4,
    apply(game) { for (const i of game.backpack.getAllItems()) { cp(i, { d: 1.4 }); } } },
  { id: 'n_last_stand', name: 'Último Recurso', description: 'Se HP < 25%, +80% dano.', characterId: null, weight: 3,
    apply(game) { (game as any)._lastStand = true; } },
  { id: 'n_elemental_mastery', name: 'Domínio Elemental', description: 'Dano elemental +25%.', characterId: null, weight: 4,
    apply(game) { for (const i of game.backpack.getAllItems()) { if (i.definition.tags.some(t => ['Fogo', 'Água', 'Gelo', 'Elétrico', 'Veneno', 'Vento'].includes(t))) cp(i, { d: 1.25 }); } } },
  { id: 'n_combo_master', name: 'Mestre do Combo', description: '+5% dano por hit no combo (max 50%).', characterId: null, weight: 3,
    apply(game) { (game as any)._comboDmgPerHit = 0.05; } },
  { id: 'n_second_wind', name: 'Segundo Fôlego', description: 'Ao chegar em 0 HP, revive com 30 HP (1x).', characterId: null, weight: 2,
    apply(game) { (game as any)._secondWind = true; } },
  { id: 'n_homing_shots', name: 'Tiros Teleguiados', description: 'Projéteis rastreiam inimigos. -30% cadência.', characterId: null, weight: 3,
    apply(game) { (game as any)._homingShots = true; game.combat.setHomingActive(true); for (const i of game.backpack.getAllItems()) { cp(i, { r: 0.7 }); } } },
  { id: 'n_ghost_merchant', name: 'Mercador Fantasma', description: '+50% gold por wave, 30% chance do vendedor não aparecer.', characterId: null, weight: 3,
    apply(game) { (game as any)._goldBonus = ((game as any)._goldBonus ?? 0) + 0.5; (game as any)._vendorSkipChance = 0.3; } },
  { id: 'n_regen_shield', name: 'Escudo Regenerativo', description: 'Abaixo de 30% HP, ganha escudo de 30 (1x/wave).', characterId: null, weight: 4,
    apply(game) { (game as any)._regenShield = 30; } },
  { id: 'n_double_shot', name: 'Tiro Duplo', description: 'Armas disparam 2x, cada projétil faz 60% dano.', characterId: null, weight: 3,
    apply(game) { for (const i of game.backpack.getAllItems()) { if (i.definition.tags.includes('Emissor')) { cp(i, { p: i.stats.projectileCount, d: 0.6 }); } } } },
  { id: 'n_blood_gold', name: 'Ouro Sangrento', description: '+2 gold por hit recebido. -10 HP máximo.', characterId: null, weight: 3,
    apply(game) { (game as any)._goldPerHit = ((game as any)._goldPerHit ?? 0) + 2; game.combat.state.playerMaxHp = Math.max(10, game.combat.state.playerMaxHp - 10); game.combat.state.playerHp = Math.min(game.combat.state.playerHp, game.combat.state.playerMaxHp); } },
  { id: 'n_deadly_speed', name: 'Velocidade Mortal', description: '+60% velocidade em combate, -30 HP máximo.', characterId: null, weight: 4,
    apply(game) { (game as any)._speedBonus = ((game as any)._speedBonus ?? 0) + 0.6; game.combat.setSpeedBonus((game as any)._speedBonus); game.combat.state.playerMaxHp = Math.max(10, game.combat.state.playerMaxHp - 30); game.combat.state.playerHp = Math.min(game.combat.state.playerHp, game.combat.state.playerMaxHp); } },
  { id: 'n_bouncy_shots', name: 'Tiros Ricochete', description: 'Projéteis quicam nas paredes laterais 2 vezes.', characterId: null, weight: 3,
    apply(game) { (game as any)._bouncyShots = 2; } },
  { id: 'n_big_bullets', name: 'Balas Gigantes', description: 'Projéteis 3x maiores, +50% dano, -40% velocidade.', characterId: null, weight: 3,
    apply(game) { for (const i of game.backpack.getAllItems()) { cp(i, { d: 1.5, s: 0.6 }); } } },
  { id: 'n_gold_rush_2', name: 'Febre do Ouro', description: '+100 gold instantâneo. Próximas 3 waves sem loja.', characterId: null, weight: 2,
    apply(game) { game.gold += 100; (game as any)._noShopWaves = 3; } },
  { id: 'n_clone_weapon', name: 'Clonagem', description: 'Seu emissor mais forte dispara 2x.', characterId: null, weight: 2,
    apply(game) {
      const emitters = game.backpack.getAllItems().filter(i => i.definition.tags.includes('Emissor'));
      if (emitters.length > 0) {
        // "Mais forte" = highest effective damage output — used to just grab
        // whichever emitter was placed first (usually the starting weapon,
        // often the weakest one by mid-run).
        const strongest = emitters.reduce((a, b) =>
          b.stats.damage * b.stats.damageMultiplier > a.stats.damage * a.stats.damageMultiplier ? b : a
        );
        cp(strongest, { p: strongest.stats.projectileCount });
      }
    } },
  { id: 'n_rage_mode', name: 'Modo Fúria', description: 'A cada kill, +2% dano (reseta no fim da wave). Max +100%.', characterId: null, weight: 3,
    apply(game) { (game as any)._rageModePerKill = 0.02; } },
  { id: 'n_shield_bash', name: 'Escudo Ofensivo', description: 'Inimigos que tocam o jogador recebem 50 dano.', characterId: null, weight: 4,
    apply(game) { (game as any)._contactDamage = ((game as any)._contactDamage ?? 0) + 50; } },
  { id: 'n_time_slow', name: 'Câmera Lenta', description: 'Inimigos 30% mais lentos permanentemente.', characterId: null, weight: 3,
    apply(game) { (game as any)._globalSlow = ((game as any)._globalSlow ?? 1) * 0.7; } },
  { id: 'n_explosive_kills', name: 'Kills Explosivas', description: 'Inimigos explodem ao morrer causando 10 dano em área.', characterId: null, weight: 3,
    apply(game) { (game as any)._explodeOnKill = ((game as any)._explodeOnKill ?? 0) + 10; } },
  { id: 'n_magnet_gold', name: 'Magnetismo Dourado', description: '+30% gold e itens na loja -15%.', characterId: null, weight: 4,
    apply(game) { (game as any)._goldBonus = ((game as any)._goldBonus ?? 0) + 0.3; (game as any)._shopDiscount = ((game as any)._shopDiscount ?? 0) + 0.15; } },
  { id: 'n_sacrifice', name: 'Sacrifício', description: 'Perde 50 HP máximo. Ganha +80% dano permanente.', characterId: null, weight: 2,
    apply(game) { game.combat.state.playerMaxHp = Math.max(10, game.combat.state.playerMaxHp - 50); game.combat.state.playerHp = Math.min(game.combat.state.playerHp, game.combat.state.playerMaxHp); for (const i of game.backpack.getAllItems()) { cp(i, { d: 1.8 }); } } },
  { id: 'n_fusion_power', name: 'Poder de Fusão', description: '+20% dano por fusão ativa na mochila.', characterId: null, weight: 3,
    apply(game) { const fusions = game.backpack.getAllItems().filter(i => (i.state as any).fusedName).length; if (fusions > 0) { for (const i of game.backpack.getAllItems()) { cp(i, { d: 1 + fusions * 0.2 }); } } } },
  { id: 'n_fusion_heal', name: 'Cura Fusional', description: '+2 HP/s por fusão ativa.', characterId: null, weight: 3,
    apply(game) { const fusions = game.backpack.getAllItems().filter(i => (i.state as any).fusedName).length; (game as any)._permanentHealPerSec = ((game as any)._permanentHealPerSec ?? 0) + fusions * 2; } },
  { id: 'n_adjacent_power', name: 'Força da Proximidade', description: '+5% dano por cada adjacência na mochila.', characterId: null, weight: 3,
    apply(game) { for (const item of game.backpack.getAllItems()) { const adj = game.backpack.getAdjacentItems(item.instanceId).length; if (adj > 0) cp(item, { d: 1 + adj * 0.05 }); } } },
  { id: 'n_synergy_chain', name: 'Cadeia Sinérgica', description: 'Tags duplicadas dão +10% cadência por tag (max +60%).', characterId: null, weight: 3,
    apply(game) {
      const tagCounts = new Map<string, number>();
      for (const i of game.backpack.getAllItems()) { for (const t of i.definition.tags) { tagCounts.set(t, (tagCounts.get(t) || 0) + 1); } }
      const bonus = Math.min(0.6, Array.from(tagCounts.values()).filter(c => c >= 2).length * 0.1);
      if (bonus > 0) { for (const i of game.backpack.getAllItems()) { cp(i, { r: 1 + bonus }); } }
    } },
  { id: 'n_compact_build', name: 'Build Compacta', description: 'Se mochila 80%+ cheia: +40% dano global.', characterId: null, weight: 3,
    apply(game) {
      const cells = game.backpack.cols * game.backpack.rows;
      const used = game.backpack.getAllItems().reduce((sum, i) => sum + i.definition.gridShape.flat().filter(c => c === 1).length, 0);
      if (used / cells >= 0.8) { for (const i of game.backpack.getAllItems()) { cp(i, { d: 1.4 }); } }
    } },
  { id: 'n_minimalist', name: 'Minimalista', description: 'Se tem 3 ou menos itens: +100% dano em todos.', characterId: null, weight: 2,
    apply(game) { if (game.backpack.getAllItems().length <= 3) { for (const i of game.backpack.getAllItems()) { cp(i, { d: 2.0 }); } } } },

  // ─── Capacidade de Peso ──────────────────────────────────────────────────
  { id: 'n_weight_cap_small', name: 'Mochila Reforçada', description: '+6 capacidade de peso máxima da mochila.', characterId: null, weight: 6,
    apply(game) { game.backpack.addWeightCapacity(6); } },
  { id: 'n_weight_cap_big', name: 'Compressão Espacial', description: '+10 capacidade de peso máxima, mas -10% dano global.', characterId: null, weight: 3,
    apply(game) { game.backpack.addWeightCapacity(10); for (const i of game.backpack.getAllItems()) { cp(i, { d: 0.9 }); } } },
  { id: 'n_weight_cap_synergy', name: 'Bolso Dimensional', description: '+4 capacidade de peso máxima. +8 HP máximo.', characterId: null, weight: 5,
    apply(game) { game.backpack.addWeightCapacity(4); game.combat.state.playerMaxHp += 8; game.combat.state.playerHp += 8; } },

  // ─── Mais cartas neutras ─────────────────────────────────────────────────
  { id: 'n_dash_master', name: 'Mestre do Dash', description: 'Recarga de dash -30% permanente.', characterId: null, weight: 4,
    apply(game) { (game as any)._dashCooldownMult = ((game as any)._dashCooldownMult ?? 1) * 0.7; } },
  { id: 'n_move_speed', name: 'Pés Ligeiros', description: '+15% velocidade de movimento permanente.', characterId: null, weight: 4,
    apply(game) { (game as any)._speedBonus = ((game as any)._speedBonus ?? 0) + 0.15; game.combat.setSpeedBonus((game as any)._speedBonus); } },
  { id: 'n_shield_boost', name: 'Barreira Extra', description: '+15 escudo máximo, regenera 50% mais rápido.', characterId: null, weight: 4,
    apply(game) { game.combat.state.playerMaxShield += 15; game.combat.state.playerShield += 15; (game as any)._shieldRegenMult = ((game as any)._shieldRegenMult ?? 1) * 1.5; } },
  { id: 'n_boss_slayer', name: 'Caçador de Chefes', description: '+40% dano contra chefes.', characterId: null, weight: 3,
    apply(game) { (game as any)._bossDamageMult = ((game as any)._bossDamageMult ?? 1) * 1.4; } },
  { id: 'n_boss_gold', name: 'Saque de Guerra', description: 'Chefes derrotados dão o dobro de ouro.', characterId: null, weight: 3,
    apply(game) { (game as any)._bossGoldMult = ((game as any)._bossGoldMult ?? 1) * 2; } },
  { id: 'n_elite_hunter', name: 'Caçador de Elites', description: '+30% dano contra inimigos elite.', characterId: null, weight: 3,
    apply(game) { (game as any)._eliteDamageMult = ((game as any)._eliteDamageMult ?? 1) * 1.3; } },
  { id: 'n_reroll_free', name: 'Estoque Rotativo', description: 'Rerolls da loja custam -50% permanente.', characterId: null, weight: 3,
    apply(game) { (game as any)._rerollDiscount = ((game as any)._rerollDiscount ?? 0) + 0.5; } },
  { id: 'n_sell_bonus', name: 'Faro de Comerciante', description: 'Vender itens dá +15% ouro permanente.', characterId: null, weight: 3,
    apply(game) { (game as any)._sellBonusGlobal = ((game as any)._sellBonusGlobal ?? 0) + 0.15; } },
  { id: 'n_early_bonus', name: 'Impulso Inicial', description: '+25% dano e cadência nos primeiros 6 meses.', characterId: null, weight: 3,
    apply(game) { if (game.totalMonths <= 6) { for (const i of game.backpack.getAllItems()) { cp(i, { d: 1.25, r: 1.25 }); } } } },
  { id: 'n_late_bonus', name: 'Veterania', description: 'Após o mês 12: +25% dano permanente.', characterId: null, weight: 3,
    apply(game) { if (game.totalMonths > 12) { for (const i of game.backpack.getAllItems()) { cp(i, { d: 1.25 }); } } } },
  { id: 'n_heavy_hitter', name: 'Golpe Pesado', description: 'Itens de peso 5+: +30% dano.', characterId: null, weight: 3,
    apply(game) {
      for (const i of game.backpack.getAllItems()) { if (getItemWeight(i.definition) >= 5) cp(i, { d: 1.3 }); }
    } },
  { id: 'n_light_swarm', name: 'Enxame Leve', description: 'Itens de peso 2 ou menos: +25% cadência.', characterId: null, weight: 3,
    apply(game) {
      for (const i of game.backpack.getAllItems()) { if (getItemWeight(i.definition) <= 2) cp(i, { r: 1.25 }); }
    } },
  { id: 'n_interest_boost', name: 'Investimento Sábio', description: 'Juros entre waves +50% (máximo maior).', characterId: null, weight: 3,
    apply(game) { (game as any)._interestBonusMult = ((game as any)._interestBonusMult ?? 1) * 1.5; } },
  { id: 'n_heal_on_kill', name: 'Absorção Vital', description: '10% de chance de curar 3 HP por kill.', characterId: null, weight: 3,
    apply(game) { (game as any)._healOnKillChance = ((game as any)._healOnKillChance ?? 0) + 0.1; (game as any)._healOnKillAmount = 3; } },
  { id: 'n_armor_pierce', name: 'Munição Perfurante', description: 'Ignora 50% da armadura inimiga.', characterId: null, weight: 3,
    apply(game) { (game as any)._armorPierce = ((game as any)._armorPierce ?? 0) + 0.5; } },
  { id: 'n_extra_life', name: 'Fôlego Extra', description: '+30 HP máximo. +1 escudo regenerado por segundo.', characterId: null, weight: 4,
    apply(game) { game.combat.state.playerMaxHp += 30; game.combat.state.playerHp += 30; (game as any)._shieldRegenFlat = ((game as any)._shieldRegenFlat ?? 0) + 1; } },
];

// ─── Card Pool Access ────────────────────────────────────────────────────────

export function getCardsForCharacter(characterId: string): CardDefinition[] {
  const allCards = [...GRASS_MAN_CARDS, ...FIRE_LORD_CARDS, ...AQUA_SAGE_CARDS, ...STORM_RUNNER_CARDS, ...VOID_WALKER_CARDS, ...BEAST_TAMER_CARDS, ...FIREFIGHTER_CARDS, ...SCRAPPER_CARDS, ...RENEGADE_CARDS, ...NEUTRAL_CARDS];
  return allCards.filter(c => c.characterId === null || c.characterId === characterId);
}

export function pickRandomCards(characterId: string, count: number): CardDefinition[] {
  const pool = getCardsForCharacter(characterId);
  const weighted: CardDefinition[] = [];
  for (const card of pool) {
    for (let i = 0; i < card.weight; i++) weighted.push(card);
  }
  const picked: CardDefinition[] = [];
  const usedIds = new Set<string>();
  while (picked.length < count && weighted.length > 0) {
    const idx = Math.floor(Math.random() * weighted.length);
    const card = weighted[idx];
    if (!usedIds.has(card.id)) {
      picked.push(card);
      usedIds.add(card.id);
    }
    weighted.splice(idx, 1);
  }
  return picked;
}
