/**
 * ITEM DEFINITIONS — 150 itens com sinergias.
 */

import { ItemDefinition, PlacedItem, SynergyContext, EmitProjectile } from '../core/ItemSystem';

// ─── Helper: standard weapon tick ────────────────────────────────────────────

function weaponTick(item: PlacedItem, dt: number, emit: EmitProjectile, opts?: {
  spreadAngle?: number;
  homing?: boolean;
  element?: string;
}): void {
  const rate = item.stats.fireRate * item.stats.fireRateMultiplier;
  if (rate <= 0) return;
  const cooldown = 1 / rate;
  item.state.timer = (item.state.timer ?? 0) + dt;
  if (item.state.timer >= cooldown) {
    item.state.timer -= cooldown;
    const count = item.stats.projectileCount;
    const spread = opts?.spreadAngle ?? 0;
    for (let p = 0; p < count; p++) {
      const angle = count > 1
        ? -spread / 2 + (spread / (count - 1)) * p
        : 0;
      const rad = angle * Math.PI / 180;
      const vx = Math.sin(rad) * item.stats.projectileSpeed;
      const vy = -Math.cos(rad) * item.stats.projectileSpeed;
      const extraTags = opts?.homing ? ['Guiado' as const] : [];
      emit({
        x: 400, y: 500,
        vx, vy,
        damage: item.stats.damage * item.stats.damageMultiplier,
        piercing: item.state.piercingBonus ?? 0,
        aoeRadius: item.stats.aoeRadius,
        tags: [...item.definition.tags, ...extraTags],
        ownerId: item.instanceId,
      });
    }
  }
}

/** Grass Man height bonus helper */
function applyGrassManBonus(item: PlacedItem, ctx: SynergyContext): void {
  if (ctx.characterId === 'grass_man') {
    const heightBonus = 1 + ctx.stackHeight * 0.75;
    item.stats.damageMultiplier *= heightBonus;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// WEAPONS (1-12)
// ═══════════════════════════════════════════════════════════════════════════════

// 1. Basic Gun
export const BASIC_GUN: ItemDefinition = {
  id: 'basic_gun',
  name: 'Arma Basica',
  description: 'Dispara um projetil em linha reta. Nada demais.',
  tags: ['Arma', 'Emissor'],
  gridShape: [[1, 1]],
  baseStats: { damage: 6, fireRate: 2.5, projectileSpeed: 400 },
  cost: 0,
  rarity: 0,
  onSynergyUpdate(item, ctx) { applyGrassManBonus(item, ctx); },
  onTick(item, dt, emit) { weaponTick(item, dt, emit); },
};

// 2. Fire Gun
export const FIRE_GUN: ItemDefinition = {
  id: 'fire_gun',
  name: 'Arma de Fogo',
  description: 'Projeteis flamejantes com AoE. Dano alto, cadencia baixa.',
  tags: ['Arma', 'Emissor', 'Fogo'],
  gridShape: [[1, 1, 1]],
  baseStats: { damage: 12, fireRate: 1, projectileSpeed: 350, aoeRadius: 20 },
  cost: 60,
  rarity: 2,
  onSynergyUpdate(item, ctx) { applyGrassManBonus(item, ctx); },
  onTick(item, dt, emit) { weaponTick(item, dt, emit, { spreadAngle: 10 }); },
};

// 3. Ice Gun
export const ICE_GUN: ItemDefinition = {
  id: 'ice_gun',
  name: 'Arma de Gelo',
  description: 'Projeteis lentos que desaceleram inimigos por 2s.',
  tags: ['Arma', 'Emissor', 'Gelo', 'Água'],
  gridShape: [[1, 1]],
  baseStats: { damage: 4, fireRate: 1.5, projectileSpeed: 250 },
  cost: 45,
  rarity: 1,
  onSynergyUpdate(item, ctx) { applyGrassManBonus(item, ctx); },
  onTick(item, dt, emit) { weaponTick(item, dt, emit); },
};

// 4. Lightning Rod
export const LIGHTNING_ROD: ItemDefinition = {
  id: 'lightning_rod',
  name: 'Para-raios',
  description: 'Raio em cadeia atinge ate 3 inimigos proximos.',
  tags: ['Arma', 'Emissor', 'Elétrico'],
  gridShape: [[1], [1]],
  baseStats: { damage: 7, fireRate: 1.2, projectileSpeed: 600 },
  cost: 55,
  rarity: 2,
  onSynergyUpdate(item, ctx) {
    applyGrassManBonus(item, ctx);
    // Chain lightning: mark as piercing 2 (hits 3 total)
    item.state.piercingBonus = 2;
  },
  onTick(item, dt, emit) { weaponTick(item, dt, emit); },
};

// 5. Poison Dart
export const POISON_DART: ItemDefinition = {
  id: 'poison_dart',
  name: 'Dardo Venenoso',
  description: 'Dano ao longo de 3 segundos. Baixo dano inicial.',
  tags: ['Arma', 'Emissor', 'Veneno', 'Orgânico'],
  gridShape: [[1]],
  baseStats: { damage: 3, fireRate: 2, projectileSpeed: 350 },
  cost: 35,
  rarity: 1,
  onSynergyUpdate(item, ctx) { applyGrassManBonus(item, ctx); },
  onTick(item, dt, emit) { weaponTick(item, dt, emit); },
};

// 6. Shotgun
export const SHOTGUN: ItemDefinition = {
  id: 'shotgun',
  name: 'Espingarda',
  description: '5 projeteis em cone. Curto alcance, dano devastador.',
  tags: ['Arma', 'Emissor'],
  gridShape: [[1, 1], [1, 1]],
  baseStats: { damage: 4, fireRate: 0.8, projectileSpeed: 300, projectileCount: 5 },
  cost: 70,
  rarity: 2,
  onSynergyUpdate(item, ctx) { applyGrassManBonus(item, ctx); },
  onTick(item, dt, emit) { weaponTick(item, dt, emit, { spreadAngle: 50 }); },
};

// 7. Sniper
export const SNIPER: ItemDefinition = {
  id: 'sniper',
  name: 'Sniper',
  description: 'Dano massivo, cadencia muito lenta. Perfura 1 inimigo.',
  tags: ['Arma', 'Emissor', 'Perfurante'],
  gridShape: [[1], [1], [1]],
  baseStats: { damage: 30, fireRate: 0.4, projectileSpeed: 800 },
  cost: 80,
  rarity: 2,
  onSynergyUpdate(item, ctx) {
    applyGrassManBonus(item, ctx);
    item.state.piercingBonus = 1;
  },
  onTick(item, dt, emit) { weaponTick(item, dt, emit); },
};

// 8. Missile Launcher
export const MISSILE_LAUNCHER: ItemDefinition = {
  id: 'missile_launcher',
  name: 'Lanca-misseis',
  description: 'Misseis teleguiados. Lentos mas certeiros.',
  tags: ['Arma', 'Emissor', 'Explosivo'],
  gridShape: [[1, 1], [1, 1]],
  baseStats: { damage: 15, fireRate: 0.6, projectileSpeed: 200, aoeRadius: 30 },
  cost: 90,
  rarity: 3,
  onSynergyUpdate(item, ctx) { applyGrassManBonus(item, ctx); },
  onTick(item, dt, emit) { weaponTick(item, dt, emit, { homing: true }); },
};

// ═══════════════════════════════════════════════════════════════════════════════
// PETS (9-12)
// ═══════════════════════════════════════════════════════════════════════════════

// 9. Parrot
export const PARROT: ItemDefinition = {
  id: 'parrot',
  name: 'Papagaio',
  description: 'Atira em diagonal. Adjacente a [Fogo] vira Fenix.',
  tags: ['Pet', 'Animal', 'Emissor', 'Vento'],
  gridShape: [[1]],
  baseStats: { damage: 3, fireRate: 1.5, projectileSpeed: 350 },
  cost: 30,
  rarity: 1,
  onSynergyUpdate(item, ctx) {
    const hasFireNeighbor = ctx.adjacentItems.some(i => i.definition.tags.includes('Fogo'));
    if (hasFireNeighbor) {
      item.stats.damage *= 2.5;
      item.stats.fireRate *= 1.3;
      item.state.isPhoenix = 1;
    }
  },
  onTick(item, dt, emit) {
    const rate = item.stats.fireRate * item.stats.fireRateMultiplier;
    if (rate <= 0) return;
    const cooldown = 1 / rate;
    item.state.timer = (item.state.timer ?? 0) + dt;
    if (item.state.timer >= cooldown) {
      item.state.timer -= cooldown;
      const tags = [...item.definition.tags] as any[];
      if (item.state.isPhoenix) tags.push('Fogo');
      emit({
        x: 400, y: 500,
        vx: -100, vy: -item.stats.projectileSpeed,
        damage: item.stats.damage * item.stats.damageMultiplier,
        piercing: 0, aoeRadius: 0, tags, ownerId: item.instanceId,
      });
      emit({
        x: 400, y: 500,
        vx: 100, vy: -item.stats.projectileSpeed,
        damage: item.stats.damage * item.stats.damageMultiplier,
        piercing: 0, aoeRadius: 0, tags, ownerId: item.instanceId,
      });
    }
  },
};

// 10. Cat
export const CAT: ItemDefinition = {
  id: 'cat',
  name: 'Gato',
  description: '+15% cadencia para todos os itens adjacentes.',
  tags: ['Pet', 'Animal'],
  gridShape: [[1]],
  baseStats: {},
  cost: 35,
  rarity: 1,
  onSynergyUpdate(item, ctx) {
    for (const neighbor of ctx.adjacentItems) {
      neighbor.stats.fireRateMultiplier *= 1.15;
    }
  },
};

// 11. Owl
export const OWL: ItemDefinition = {
  id: 'owl',
  name: 'Coruja',
  description: 'Dispara rajada de 3 tiros a cada 3 segundos.',
  tags: ['Pet', 'Animal', 'Emissor'],
  gridShape: [[1]],
  baseStats: { damage: 6, fireRate: 0, projectileSpeed: 400 },
  cost: 40,
  rarity: 1,
  onSynergyUpdate(item, ctx) { applyGrassManBonus(item, ctx); },
  onTick(item, dt, emit) {
    item.state.burstTimer = (item.state.burstTimer ?? 0) + dt;
    if (item.state.burstTimer >= 3) {
      item.state.burstTimer -= 3;
      for (let i = 0; i < 3; i++) {
        const angle = (i - 1) * 15;
        const rad = angle * Math.PI / 180;
        emit({
          x: 400, y: 500,
          vx: Math.sin(rad) * item.stats.projectileSpeed,
          vy: -Math.cos(rad) * item.stats.projectileSpeed,
          damage: item.stats.damage * item.stats.damageMultiplier,
          piercing: 0, aoeRadius: 0,
          tags: [...item.definition.tags],
          ownerId: item.instanceId,
        });
      }
    }
  },
};

// 12. Snake
export const SNAKE: ItemDefinition = {
  id: 'snake',
  name: 'Serpente',
  description: 'Envenena passivamente o inimigo mais proximo a cada 2s.',
  tags: ['Pet', 'Animal', 'Emissor', 'Veneno', 'Orgânico'],
  gridShape: [[1, 1]],
  baseStats: { damage: 2, fireRate: 0.5, projectileSpeed: 500 },
  cost: 30,
  rarity: 1,
  onSynergyUpdate(item, ctx) { applyGrassManBonus(item, ctx); },
  onTick(item, dt, emit) { weaponTick(item, dt, emit); },
};

// 13. Phoenix Egg
export const PHOENIX_EGG: ItemDefinition = {
  id: 'phoenix_egg',
  name: 'Ovo de Fenix',
  description: 'Adjacente a [Fogo], eclode em torrreta automatica (+8 dano, 2/s).',
  tags: ['Pet', 'Animal', 'Fogo'],
  gridShape: [[1]],
  baseStats: { damage: 0, fireRate: 0, projectileSpeed: 400 },
  cost: 50,
  rarity: 2,
  onSynergyUpdate(item, ctx) {
    const hasFireNeighbor = ctx.adjacentItems.some(i => i.definition.tags.includes('Fogo'));
    if (hasFireNeighbor) {
      item.stats.damage = 8;
      item.stats.fireRate = 2;
      item.state.hatched = 1;
    } else {
      item.state.hatched = 0;
    }
  },
  onTick(item, dt, emit) {
    if (!item.state.hatched) return;
    weaponTick(item, dt, emit);
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// MODIFIERS (14-17)
// ═══════════════════════════════════════════════════════════════════════════════

// 14. Stutter Box (original)
export const STUTTER_BOX: ItemDefinition = {
  id: 'stutter_box',
  name: 'Caixa de Gagueira',
  description: 'Adjacentes [Arma/Emissor]: +1 projetil, -20% cadencia.',
  tags: ['Modificador', 'ModFrequência'],
  gridShape: [[1, 1], [1, 1]],
  baseStats: {},
  cost: 45,
  rarity: 2,
  onSynergyUpdate(item, ctx) {
    const emitters = ctx.adjacentItems.filter(i =>
      i.definition.tags.includes('Arma') || i.definition.tags.includes('Emissor')
    );
    for (const emitter of emitters) {
      emitter.stats.projectileCount += 1;
      emitter.stats.fireRateMultiplier *= 0.8;
    }
  },
};

// 15. Amplifier Crystal
export const AMPLIFIER_CRYSTAL: ItemDefinition = {
  id: 'amplifier_crystal',
  name: 'Cristal Amplificador',
  description: '+50% dano para todas as [Arma] adjacentes.',
  tags: ['Modificador'],
  gridShape: [[1]],
  baseStats: {},
  cost: 55,
  rarity: 2,
  onSynergyUpdate(item, ctx) {
    const weapons = ctx.adjacentItems.filter(i => i.definition.tags.includes('Arma'));
    for (const w of weapons) {
      w.stats.damageMultiplier *= 1.5;
    }
  },
};

// 16. Speed Coil
export const SPEED_COIL: ItemDefinition = {
  id: 'speed_coil',
  name: 'Bobina de Velocidade',
  description: '+25% velocidade de projetil para [Emissor] adjacentes.',
  tags: ['Modificador'],
  gridShape: [[1], [1]],
  baseStats: {},
  cost: 40,
  rarity: 1,
  onSynergyUpdate(item, ctx) {
    const emitters = ctx.adjacentItems.filter(i => i.definition.tags.includes('Emissor'));
    for (const e of emitters) {
      e.stats.projectileSpeed *= 1.25;
    }
  },
};

// 17. Splitter Prism
export const SPLITTER_PRISM: ItemDefinition = {
  id: 'splitter_prism',
  name: 'Prisma Divisor',
  description: 'Adjacentes [Emissor] disparam +1 projetil (-30% dano cada).',
  tags: ['Modificador'],
  gridShape: [[1]],
  baseStats: {},
  cost: 60,
  rarity: 2,
  onSynergyUpdate(item, ctx) {
    const emitters = ctx.adjacentItems.filter(i => i.definition.tags.includes('Emissor'));
    for (const e of emitters) {
      e.stats.projectileCount += 1;
      e.stats.damageMultiplier *= 0.7;
    }
  },
};

// 18. Targeting Module
export const TARGETING_MODULE: ItemDefinition = {
  id: 'targeting_module',
  name: 'Modulo de Mira',
  description: 'Projeteis de [Arma] adjacentes rastreiam levemente.',
  tags: ['Modificador'],
  gridShape: [[1, 1]],
  baseStats: {},
  cost: 50,
  rarity: 2,
  onSynergyUpdate(item, ctx) {
    const weapons = ctx.adjacentItems.filter(i => i.definition.tags.includes('Arma'));
    for (const w of weapons) {
      w.state.homingBonus = (w.state.homingBonus ?? 0) + 1;
      w.stats.damageMultiplier *= 1.1;
    }
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// UTILITIES (19-30)
// ═══════════════════════════════════════════════════════════════════════════════

// 19. Watering Can
export const WATERING_CAN: ItemDefinition = {
  id: 'watering_can',
  name: 'Regador',
  description: '+10% cadencia para [Organico] adjacentes. Grass Man: cura na base.',
  tags: ['Utilitário', 'Água'],
  gridShape: [[1, 1]],
  baseStats: { healPerSecond: 0 },
  cost: 20,
  rarity: 0,
  onSynergyUpdate(item, ctx) {
    const organics = ctx.adjacentItems.filter(i => i.definition.tags.includes('Orgânico'));
    for (const o of organics) {
      o.stats.fireRateMultiplier *= 1.1;
    }
    if (ctx.characterId === 'grass_man' && ctx.position.row >= 5) {
      item.stats.healPerSecond = 2;
    }
    const fireNeighbors = ctx.adjacentItems.filter(i => i.definition.tags.includes('Fogo'));
    if (fireNeighbors.length > 0) {
      item.stats.aoeRadius = 50;
      item.stats.damage = 1;
      item.state.steamActive = 1;
    }
  },
};

// 20. Plant Shield
export const PLANT_SHIELD: ItemDefinition = {
  id: 'plant_shield',
  name: 'Escudo Vegetal',
  description: '+5 armadura. Adjacente a [Agua]: +1 HP/s e +2 armadura.',
  tags: ['Escudo', 'Orgânico', 'Planta'],
  gridShape: [[1], [1]],
  baseStats: { armorBonus: 5 },
  cost: 25,
  rarity: 1,
  onSynergyUpdate(item, ctx) {
    const hasWater = ctx.adjacentItems.some(i => i.definition.tags.includes('Água'));
    if (hasWater) {
      item.stats.healPerSecond = 1;
      item.stats.armorBonus += 2;
    }
  },
};

// 21. Repair Kit
export const REPAIR_KIT: ItemDefinition = {
  id: 'repair_kit',
  name: 'Kit de Reparo',
  description: '+3 HP/s de cura passiva.',
  tags: ['Utilitário', 'Cura'],
  gridShape: [[1, 1]],
  baseStats: { healPerSecond: 3 },
  cost: 40,
  rarity: 1,
  onSynergyUpdate(_item, _ctx) { /* Pure passive heal */ },
};

// 22. Gold Magnet
export const GOLD_MAGNET: ItemDefinition = {
  id: 'gold_magnet',
  name: 'Ima de Ouro',
  description: '+20% gold de kills (stacks).',
  tags: ['Utilitário'],
  gridShape: [[1]],
  baseStats: {},
  cost: 30,
  rarity: 1,
  onSynergyUpdate(item, _ctx) {
    item.state.goldBonus = 0.2;
  },
};

// 23. Armor Plate
export const ARMOR_PLATE: ItemDefinition = {
  id: 'armor_plate',
  name: 'Placa de Armadura',
  description: '+8 armadura. Solido e confiavel.',
  tags: ['Escudo', 'Utilitário'],
  gridShape: [[1, 1], [1, 1]],
  baseStats: { armorBonus: 8 },
  cost: 50,
  rarity: 1,
  onSynergyUpdate(_item, _ctx) { /* Pure armor */ },
};

// 24. Battery
export const BATTERY: ItemDefinition = {
  id: 'battery',
  name: 'Bateria',
  description: 'Adjacentes [Eletrico] ganham +30% cadencia.',
  tags: ['Utilitário', 'Elétrico'],
  gridShape: [[1], [1]],
  baseStats: {},
  cost: 35,
  rarity: 1,
  onSynergyUpdate(item, ctx) {
    const electrics = ctx.adjacentItems.filter(i => i.definition.tags.includes('Elétrico'));
    for (const e of electrics) {
      e.stats.fireRateMultiplier *= 1.3;
    }
  },
};

// 25. Fertilizer
export const FERTILIZER: ItemDefinition = {
  id: 'fertilizer',
  name: 'Fertilizante',
  description: 'Adjacentes [Organico]/[Planta] ganham +40% dano.',
  tags: ['Utilitário', 'Orgânico'],
  gridShape: [[1]],
  baseStats: {},
  cost: 30,
  rarity: 1,
  onSynergyUpdate(item, ctx) {
    const organics = ctx.adjacentItems.filter(i =>
      i.definition.tags.includes('Orgânico') || i.definition.tags.includes('Planta')
    );
    for (const o of organics) {
      o.stats.damageMultiplier *= 1.4;
    }
  },
};

// 26. Coolant
export const COOLANT: ItemDefinition = {
  id: 'coolant',
  name: 'Refrigerante',
  description: 'Adjacentes [Fogo]: -1 AoE radius mas +2 dano por hit.',
  tags: ['Utilitário', 'Gelo'],
  gridShape: [[1, 1]],
  baseStats: {},
  cost: 35,
  rarity: 1,
  onSynergyUpdate(item, ctx) {
    const fireItems = ctx.adjacentItems.filter(i => i.definition.tags.includes('Fogo'));
    for (const f of fireItems) {
      f.stats.aoeRadius = Math.max(0, f.stats.aoeRadius - 1);
      f.stats.damage += 2;
    }
  },
};

// 27. Wind Fan
export const WIND_FAN: ItemDefinition = {
  id: 'wind_fan',
  name: 'Ventilador',
  description: 'Empurra projeteis inimigos. -15% dano recebido.',
  tags: ['Utilitário', 'Vento'],
  gridShape: [[1]],
  baseStats: { armorBonus: 3 },
  cost: 40,
  rarity: 1,
  onSynergyUpdate(item, _ctx) {
    item.state.damageReduction = 0.15;
  },
};

// 28. Lucky Charm
export const LUCKY_CHARM: ItemDefinition = {
  id: 'lucky_charm',
  name: 'Amuleto da Sorte',
  description: '5% chance de dobrar efeito de qualquer item a cada tick.',
  tags: ['Utilitário'],
  gridShape: [[1]],
  baseStats: {},
  cost: 45,
  rarity: 2,
  onSynergyUpdate(item, ctx) {
    // Randomly boost a neighbor
    if (ctx.adjacentItems.length > 0) {
      const seed = (item.state.luckSeed ?? 0);
      const idx = seed % ctx.adjacentItems.length;
      const target = ctx.adjacentItems[idx];
      // 5% represented as always applying a small bonus to simulate probability
      target.stats.damageMultiplier *= 1.05;
      target.stats.fireRateMultiplier *= 1.05;
    }
  },
};

// 29. Void Crystal
export const VOID_CRYSTAL: ItemDefinition = {
  id: 'void_crystal',
  name: 'Cristal do Vazio',
  description: 'Drena 1 HP/s mas adjacentes ganham +25% em tudo.',
  tags: ['Utilitário'],
  gridShape: [[1]],
  baseStats: { healPerSecond: -1 },
  cost: 65,
  rarity: 3,
  onSynergyUpdate(item, ctx) {
    for (const neighbor of ctx.adjacentItems) {
      neighbor.stats.damageMultiplier *= 1.25;
      neighbor.stats.fireRateMultiplier *= 1.25;
    }
  },
};

// 30. Crown of Thorns
export const CROWN_OF_THORNS: ItemDefinition = {
  id: 'crown_of_thorns',
  name: 'Coroa de Espinhos',
  description: 'Ao receber dano, devolve 50% a inimigo aleatorio.',
  tags: ['Utilitário', 'Orgânico'],
  gridShape: [[1, 1, 1]],
  baseStats: { armorBonus: 2 },
  cost: 55,
  rarity: 2,
  onSynergyUpdate(item, _ctx) {
    item.state.thornDamage = 0.5; // 50% reflect
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// NEW WEAPONS (31-35)
// ═══════════════════════════════════════════════════════════════════════════════

// 31. Laser Beam
export const LASER_BEAM: ItemDefinition = {
  id: 'laser_beam',
  name: 'Raio Laser',
  description: 'Dano continuo na linha reta. Sem projeteis, atinge o primeiro inimigo.',
  tags: ['Arma', 'Emissor'],
  gridShape: [[1, 1, 1]],
  baseStats: { damage: 8, fireRate: 5, projectileSpeed: 9999 },
  cost: 75,
  rarity: 2,
  onSynergyUpdate(item, ctx) { applyGrassManBonus(item, ctx); },
  onTick(item, dt, emit) { weaponTick(item, dt, emit); },
};

// 32. Boomerang
export const BOOMERANG: ItemDefinition = {
  id: 'boomerang',
  name: 'Bumerangue',
  description: 'Projetil retorna, atingindo inimigos duas vezes.',
  tags: ['Arma', 'Emissor'],
  gridShape: [[1, 1]],
  baseStats: { damage: 7, fireRate: 1, projectileSpeed: 300 },
  cost: 55,
  rarity: 2,
  onSynergyUpdate(item, ctx) {
    applyGrassManBonus(item, ctx);
    item.state.piercingBonus = 3;
  },
  onTick(item, dt, emit) { weaponTick(item, dt, emit); },
};

// 33. Flamethrower
export const FLAMETHROWER: ItemDefinition = {
  id: 'flamethrower',
  name: 'Lanca-chamas',
  description: 'Cone de fogo de curto alcance. DPS altissimo.',
  tags: ['Arma', 'Emissor', 'Fogo'],
  gridShape: [[1, 1], [1, 1]],
  baseStats: { damage: 3, fireRate: 8, projectileSpeed: 150, projectileCount: 3, aoeRadius: 15 },
  cost: 80,
  rarity: 2,
  onSynergyUpdate(item, ctx) { applyGrassManBonus(item, ctx); },
  onTick(item, dt, emit) { weaponTick(item, dt, emit, { spreadAngle: 40 }); },
};

// 34. Tesla Coil
export const TESLA_COIL: ItemDefinition = {
  id: 'tesla_coil',
  name: 'Bobina Tesla',
  description: 'Zaps um inimigo aleatorio a cada 1.5s.',
  tags: ['Arma', 'Emissor', 'Elétrico'],
  gridShape: [[1], [1], [1]],
  baseStats: { damage: 12, fireRate: 0, projectileSpeed: 800 },
  cost: 70,
  rarity: 2,
  onSynergyUpdate(item, ctx) { applyGrassManBonus(item, ctx); },
  onTick(item, dt, emit) {
    item.state.zapTimer = (item.state.zapTimer ?? 0) + dt;
    if (item.state.zapTimer >= 1.5) {
      item.state.zapTimer -= 1.5;
      const angle = (Math.random() - 0.5) * 60 * Math.PI / 180;
      emit({
        x: 400, y: 500,
        vx: Math.sin(angle) * item.stats.projectileSpeed,
        vy: -Math.cos(angle) * item.stats.projectileSpeed,
        damage: item.stats.damage * item.stats.damageMultiplier,
        piercing: 1,
        aoeRadius: 0,
        tags: [...item.definition.tags],
        ownerId: item.instanceId,
      });
    }
  },
};

// 35. Acid Sprayer
export const ACID_SPRAYER: ItemDefinition = {
  id: 'acid_sprayer',
  name: 'Aspersor Acido',
  description: 'Poca no chao que danifica inimigos passando.',
  tags: ['Arma', 'Emissor', 'Veneno'],
  gridShape: [[1, 1]],
  baseStats: { damage: 4, fireRate: 1.5, projectileSpeed: 200, aoeRadius: 25 },
  cost: 60,
  rarity: 2,
  onSynergyUpdate(item, ctx) { applyGrassManBonus(item, ctx); },
  onTick(item, dt, emit) { weaponTick(item, dt, emit, { spreadAngle: 20 }); },
};

// ═══════════════════════════════════════════════════════════════════════════════
// NEW PETS (36-38)
// ═══════════════════════════════════════════════════════════════════════════════

// 36. Dragon Whelp
export const DRAGON_WHELP: ItemDefinition = {
  id: 'dragon_whelp',
  name: 'Filhote de Dragao',
  description: 'Sopra fogo em cone. Dano de area devastador.',
  tags: ['Pet', 'Animal', 'Emissor', 'Fogo'],
  gridShape: [[1, 1], [1, 1]],
  baseStats: { damage: 6, fireRate: 2, projectileSpeed: 250, projectileCount: 3, aoeRadius: 10 },
  cost: 85,
  rarity: 3,
  onSynergyUpdate(item, ctx) { applyGrassManBonus(item, ctx); },
  onTick(item, dt, emit) { weaponTick(item, dt, emit, { spreadAngle: 45 }); },
};

// 37. Bee Swarm
export const BEE_SWARM: ItemDefinition = {
  id: 'bee_swarm',
  name: 'Enxame de Abelhas',
  description: '5 projeteis minusculos por tiro. Fraco mas persistente.',
  tags: ['Pet', 'Animal', 'Emissor', 'Orgânico'],
  gridShape: [[1, 1]],
  baseStats: { damage: 2, fireRate: 2.5, projectileSpeed: 350, projectileCount: 5 },
  cost: 50,
  rarity: 1,
  onSynergyUpdate(item, ctx) { applyGrassManBonus(item, ctx); },
  onTick(item, dt, emit) { weaponTick(item, dt, emit, { spreadAngle: 60 }); },
};

// 38. Ghost Cat
export const GHOST_CAT: ItemDefinition = {
  id: 'ghost_cat',
  name: 'Gato Fantasma',
  description: 'Atravessa inimigos aplicando lentidao.',
  tags: ['Pet', 'Animal', 'Emissor'],
  gridShape: [[1]],
  baseStats: { damage: 1, fireRate: 1, projectileSpeed: 400 },
  cost: 45,
  rarity: 2,
  onSynergyUpdate(item, ctx) {
    // Applies slow passively
    item.state.piercingBonus = 5;
    for (const neighbor of ctx.adjacentItems) {
      neighbor.stats.fireRateMultiplier *= 1.1;
    }
  },
  onTick(item, dt, emit) { weaponTick(item, dt, emit); },
};

// ═══════════════════════════════════════════════════════════════════════════════
// NEW MODIFIERS (39-42)
// ═══════════════════════════════════════════════════════════════════════════════

// 39. Overclocker
export const OVERCLOCKER: ItemDefinition = {
  id: 'overclocker',
  name: 'Overclocker',
  description: '+100% cadencia para adjacentes, mas drena 1 HP/s.',
  tags: ['Modificador'],
  gridShape: [[1, 1]],
  baseStats: { healPerSecond: -1 },
  cost: 65,
  rarity: 2,
  onSynergyUpdate(item, ctx) {
    const emitters = ctx.adjacentItems.filter(i =>
      i.definition.tags.includes('Arma') || i.definition.tags.includes('Emissor')
    );
    for (const e of emitters) {
      e.stats.fireRateMultiplier *= 2;
    }
  },
};

// 40. Echo Chamber
export const ECHO_CHAMBER: ItemDefinition = {
  id: 'echo_chamber',
  name: 'Camara de Eco',
  description: 'Adjacentes [Emissor]: a cada 3 tiros, dispara 3x projeteis.',
  tags: ['Modificador', 'ModFrequência'],
  gridShape: [[1], [1]],
  baseStats: {},
  cost: 55,
  rarity: 2,
  onSynergyUpdate(item, ctx) {
    const emitters = ctx.adjacentItems.filter(i => i.definition.tags.includes('Emissor'));
    for (const e of emitters) {
      e.stats.projectileCount += 2;
      e.stats.fireRateMultiplier *= 0.6;
    }
  },
};

// 41. Ricochet Module
export const RICOCHET_MODULE: ItemDefinition = {
  id: 'ricochet_module',
  name: 'Modulo Ricochete',
  description: 'Projeteis de adjacentes ricocheteiam uma vez nas paredes.',
  tags: ['Modificador'],
  gridShape: [[1]],
  baseStats: {},
  cost: 50,
  rarity: 2,
  onSynergyUpdate(item, ctx) {
    const emitters = ctx.adjacentItems.filter(i => i.definition.tags.includes('Emissor'));
    for (const e of emitters) {
      e.state.ricochet = 1;
      e.stats.damageMultiplier *= 1.1;
    }
  },
};

// 42. Elemental Infusion
export const ELEMENTAL_INFUSION: ItemDefinition = {
  id: 'elemental_infusion',
  name: 'Infusao Elemental',
  description: 'Armas adjacentes ganham elemento aleatorio e +20% dano.',
  tags: ['Modificador'],
  gridShape: [[1, 1], [1, 1]],
  baseStats: {},
  cost: 70,
  rarity: 3,
  onSynergyUpdate(item, ctx) {
    const weapons = ctx.adjacentItems.filter(i => i.definition.tags.includes('Arma'));
    for (const w of weapons) {
      w.stats.damageMultiplier *= 1.2;
    }
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// NEW UTILITIES (43-50)
// ═══════════════════════════════════════════════════════════════════════════════

// 43. Shield Generator
export const SHIELD_GENERATOR: ItemDefinition = {
  id: 'shield_generator',
  name: 'Gerador de Escudo',
  description: 'Absorve 20 dano por wave, depois recarrega.',
  tags: ['Utilitário', 'Escudo'],
  gridShape: [[1, 1], [1, 1]],
  baseStats: { armorBonus: 10 },
  cost: 75,
  rarity: 2,
  onSynergyUpdate(item, _ctx) {
    item.state.shieldMax = 20;
  },
};

// 44. Coin Doubler
export const COIN_DOUBLER: ItemDefinition = {
  id: 'coin_doubler',
  name: 'Duplicador de Moedas',
  description: '10% chance de dobrar gold de kills.',
  tags: ['Utilitário'],
  gridShape: [[1]],
  baseStats: {},
  cost: 50,
  rarity: 2,
  onSynergyUpdate(item, _ctx) {
    item.state.goldDoubleChance = 0.1;
  },
};

// 45. Radar Dish
export const RADAR_DISH: ItemDefinition = {
  id: 'radar_dish',
  name: 'Antena Radar',
  description: 'Inimigos na tela recebem 5% mais dano (global).',
  tags: ['Utilitário'],
  gridShape: [[1, 1], [1, 1]],
  baseStats: {},
  cost: 60,
  rarity: 2,
  onSynergyUpdate(item, ctx) {
    // Global buff: boost all emitters slightly
    for (const i of ctx.allItems) {
      if (i.definition.tags.includes('Emissor') || i.definition.tags.includes('Arma')) {
        i.stats.damageMultiplier *= 1.05;
      }
    }
  },
};

// 46. Medkit
export const MEDKIT: ItemDefinition = {
  id: 'medkit',
  name: 'Kit Medico',
  description: '+50 HP no inicio de cada wave. Cura massiva.',
  tags: ['Utilitário', 'Cura'],
  gridShape: [[1, 1], [1, 1]],
  baseStats: { healPerSecond: 1 },
  cost: 65,
  rarity: 2,
  onSynergyUpdate(item, _ctx) {
    item.state.waveHealBonus = 50;
  },
};

// 47. Scrap Recycler
export const SCRAP_RECYCLER: ItemDefinition = {
  id: 'scrap_recycler',
  name: 'Reciclador de Sucata',
  description: 'Venda itens por 75% do valor (normalmente 50%).',
  tags: ['Utilitário'],
  gridShape: [[1]],
  baseStats: {},
  cost: 40,
  rarity: 1,
  onSynergyUpdate(item, _ctx) {
    item.state.sellBonus = 0.25;
  },
};

// 48. Power Core
export const POWER_CORE: ItemDefinition = {
  id: 'power_core',
  name: 'Nucleo de Poder',
  description: 'Itens adjacentes ganham +10% em TODOS os stats.',
  tags: ['Utilitário'],
  gridShape: [[1]],
  baseStats: {},
  cost: 70,
  rarity: 3,
  onSynergyUpdate(item, ctx) {
    for (const neighbor of ctx.adjacentItems) {
      neighbor.stats.damageMultiplier *= 1.1;
      neighbor.stats.fireRateMultiplier *= 1.1;
      neighbor.stats.projectileSpeed *= 1.1;
      neighbor.stats.healPerSecond *= 1.1;
    }
  },
};

// 49. Gravity Well
export const GRAVITY_WELL: ItemDefinition = {
  id: 'gravity_well',
  name: 'Poco Gravitacional',
  description: 'Puxa projeteis inimigos para o centro. Reduz dano recebido.',
  tags: ['Utilitário'],
  gridShape: [[1, 1, 1], [1, 1, 1]],
  baseStats: { armorBonus: 4 },
  cost: 80,
  rarity: 3,
  onSynergyUpdate(item, _ctx) {
    item.state.damageReduction = 0.15;
  },
};

// 50. Time Dilator
export const TIME_DILATOR: ItemDefinition = {
  id: 'time_dilator',
  name: 'Dilatador Temporal',
  description: 'Inimigos se movem 10% mais devagar globalmente.',
  tags: ['Utilitário'],
  gridShape: [[1, 1], [1, 1]],
  baseStats: {},
  cost: 75,
  rarity: 3,
  onSynergyUpdate(item, _ctx) {
    item.state.slowAura = 0.1;
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// WEAPONS (51-62)
// ═══════════════════════════════════════════════════════════════════════════════

// 51. Plasma Cannon
export const PLASMA_CANNON: ItemDefinition = {
  id: 'plasma_cannon',
  name: 'Canhao de Plasma',
  description: 'Dano alto, lento, explosao AoE no impacto.',
  tags: ['Arma', 'Emissor'],
  gridShape: [[1, 1, 1], [1, 1, 1]],
  baseStats: { damage: 25, fireRate: 0.5, projectileSpeed: 200, aoeRadius: 40 },
  cost: 95,
  rarity: 3,
  onSynergyUpdate(item, ctx) { applyGrassManBonus(item, ctx); },
  onTick(item, dt, emit) { weaponTick(item, dt, emit); },
};

// 52. Chain Gun
export const CHAIN_GUN: ItemDefinition = {
  id: 'chain_gun',
  name: 'Metralhadora',
  description: 'Cadencia altissima, dano por tiro baixo.',
  tags: ['Arma', 'Emissor'],
  gridShape: [[1, 1], [1, 1], [1, 1]],
  baseStats: { damage: 2, fireRate: 10, projectileSpeed: 500 },
  cost: 85,
  rarity: 2,
  onSynergyUpdate(item, ctx) { applyGrassManBonus(item, ctx); },
  onTick(item, dt, emit) { weaponTick(item, dt, emit, { spreadAngle: 8 }); },
};

// 53. Frost Nova
export const FROST_NOVA: ItemDefinition = {
  id: 'frost_nova',
  name: 'Nova de Gelo',
  description: 'Atinge todos na tela com dano baixo + lentidao. Cooldown 8s.',
  tags: ['Arma', 'Gelo', 'AoE'],
  gridShape: [[1, 1, 1], [1, 1, 1]],
  baseStats: { damage: 8, fireRate: 0, projectileSpeed: 0, aoeRadius: 999 },
  cost: 100,
  rarity: 3,
  onSynergyUpdate(item, ctx) { applyGrassManBonus(item, ctx); },
  onTick(item, dt, emit) {
    item.state.novaTimer = (item.state.novaTimer ?? 0) + dt;
    if (item.state.novaTimer >= 8) {
      item.state.novaTimer -= 8;
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        emit({
          x: 400, y: 300,
          vx: Math.cos(angle) * 200,
          vy: Math.sin(angle) * 200,
          damage: item.stats.damage * item.stats.damageMultiplier,
          piercing: 99, aoeRadius: 30,
          tags: [...item.definition.tags],
          ownerId: item.instanceId,
        });
      }
    }
  },
};

// 54. Solar Beam
export const SOLAR_BEAM: ItemDefinition = {
  id: 'solar_beam',
  name: 'Raio Solar',
  description: 'Carrega por 3s, dispara raio devastador.',
  tags: ['Arma', 'Emissor', 'Fogo'],
  gridShape: [[1], [1], [1]],
  baseStats: { damage: 60, fireRate: 0, projectileSpeed: 1200 },
  cost: 110,
  rarity: 3,
  onSynergyUpdate(item, ctx) { applyGrassManBonus(item, ctx); },
  onTick(item, dt, emit) {
    item.state.chargeTimer = (item.state.chargeTimer ?? 0) + dt;
    if (item.state.chargeTimer >= 3) {
      item.state.chargeTimer -= 3;
      emit({
        x: 400, y: 500,
        vx: 0, vy: -item.stats.projectileSpeed,
        damage: item.stats.damage * item.stats.damageMultiplier,
        piercing: 99, aoeRadius: 15,
        tags: [...item.definition.tags],
        ownerId: item.instanceId,
      });
    }
  },
};

// 55. Harpoon Gun
export const HARPOON_GUN: ItemDefinition = {
  id: 'harpoon_gun',
  name: 'Arpao',
  description: 'Puxa inimigo atingido para baixo (mais vulneravel).',
  tags: ['Arma', 'Emissor'],
  gridShape: [[1], [1], [1]],
  baseStats: { damage: 10, fireRate: 0.7, projectileSpeed: 500 },
  cost: 65,
  rarity: 2,
  onSynergyUpdate(item, ctx) {
    applyGrassManBonus(item, ctx);
    item.state.pullEffect = 1;
  },
  onTick(item, dt, emit) { weaponTick(item, dt, emit); },
};

// 56. Grenade Launcher
export const GRENADE_LAUNCHER: ItemDefinition = {
  id: 'grenade_launcher',
  name: 'Lanca-granadas',
  description: 'Tiros em arco, grande AoE no impacto.',
  tags: ['Arma', 'Explosivo'],
  gridShape: [[1, 1], [1, 1]],
  baseStats: { damage: 18, fireRate: 0.6, projectileSpeed: 180, aoeRadius: 50 },
  cost: 90,
  rarity: 2,
  onSynergyUpdate(item, ctx) { applyGrassManBonus(item, ctx); },
  onTick(item, dt, emit) { weaponTick(item, dt, emit, { spreadAngle: 15 }); },
};

// 57. Sound Cannon
export const SOUND_CANNON: ItemDefinition = {
  id: 'sound_cannon',
  name: 'Canhao Sonico',
  description: 'Knockback + stun em inimigos atingidos.',
  tags: ['Arma', 'Emissor', 'Vento'],
  gridShape: [[1, 1, 1], [1, 1, 1]],
  baseStats: { damage: 6, fireRate: 1, projectileSpeed: 350, aoeRadius: 25 },
  cost: 70,
  rarity: 2,
  onSynergyUpdate(item, ctx) {
    applyGrassManBonus(item, ctx);
    item.state.knockback = 1;
    item.state.stunDuration = 0.5;
  },
  onTick(item, dt, emit) { weaponTick(item, dt, emit); },
};

// 58. Bone Spear
export const BONE_SPEAR: ItemDefinition = {
  id: 'bone_spear',
  name: 'Lanca de Ossos',
  description: 'Perfura todos os inimigos em linha.',
  tags: ['Arma', 'Emissor', 'Perfurante'],
  gridShape: [[1], [1], [1]],
  baseStats: { damage: 14, fireRate: 0.8, projectileSpeed: 600 },
  cost: 75,
  rarity: 2,
  onSynergyUpdate(item, ctx) {
    applyGrassManBonus(item, ctx);
    item.state.piercingBonus = 99;
  },
  onTick(item, dt, emit) { weaponTick(item, dt, emit); },
};

// 59. Crystal Shard Gun
export const CRYSTAL_SHARD_GUN: ItemDefinition = {
  id: 'crystal_shard_gun',
  name: 'Arma de Fragmentos',
  description: 'Projeteis se estilhacam em 3 ao atingir inimigo.',
  tags: ['Arma', 'Emissor'],
  gridShape: [[1, 1], [1, 1]],
  baseStats: { damage: 8, fireRate: 1.2, projectileSpeed: 400 },
  cost: 70,
  rarity: 2,
  onSynergyUpdate(item, ctx) {
    applyGrassManBonus(item, ctx);
    item.state.shatterCount = 3;
  },
  onTick(item, dt, emit) { weaponTick(item, dt, emit); },
};

// 60. Void Cannon
export const VOID_CANNON: ItemDefinition = {
  id: 'void_cannon',
  name: 'Canhao do Vazio',
  description: 'Dispara buraco negro lento que puxa inimigos.',
  tags: ['Arma', 'Emissor'],
  gridShape: [[1, 1], [1, 1], [1, 1]],
  baseStats: { damage: 5, fireRate: 0.3, projectileSpeed: 80, aoeRadius: 60 },
  cost: 120,
  rarity: 3,
  onSynergyUpdate(item, ctx) {
    applyGrassManBonus(item, ctx);
    item.state.gravityPull = 1;
  },
  onTick(item, dt, emit) { weaponTick(item, dt, emit); },
};

// 61. Dual Pistols
export const DUAL_PISTOLS: ItemDefinition = {
  id: 'dual_pistols',
  name: 'Pistolas Duplas',
  description: '2 projeteis alternando esquerda/direita, rapido.',
  tags: ['Arma', 'Emissor'],
  gridShape: [[1, 1, 1]],
  baseStats: { damage: 5, fireRate: 3, projectileSpeed: 450, projectileCount: 2 },
  cost: 60,
  rarity: 1,
  onSynergyUpdate(item, ctx) { applyGrassManBonus(item, ctx); },
  onTick(item, dt, emit) { weaponTick(item, dt, emit, { spreadAngle: 20 }); },
};

// 62. Ancient Staff
export const ANCIENT_STAFF: ItemDefinition = {
  id: 'ancient_staff',
  name: 'Cajado Ancestral',
  description: 'Cada 5o tiro causa 10x dano.',
  tags: ['Arma', 'Emissor'],
  gridShape: [[1], [1], [1]],
  baseStats: { damage: 7, fireRate: 1.5, projectileSpeed: 400 },
  cost: 95,
  rarity: 3,
  onSynergyUpdate(item, ctx) { applyGrassManBonus(item, ctx); },
  onTick(item, dt, emit) {
    const rate = item.stats.fireRate * item.stats.fireRateMultiplier;
    if (rate <= 0) return;
    const cooldown = 1 / rate;
    item.state.timer = (item.state.timer ?? 0) + dt;
    if (item.state.timer >= cooldown) {
      item.state.timer -= cooldown;
      item.state.shotCount = (item.state.shotCount ?? 0) + 1;
      const multiplier = item.state.shotCount % 5 === 0 ? 10 : 1;
      emit({
        x: 400, y: 500,
        vx: 0, vy: -item.stats.projectileSpeed,
        damage: item.stats.damage * item.stats.damageMultiplier * multiplier,
        piercing: multiplier > 1 ? 3 : 0,
        aoeRadius: multiplier > 1 ? 20 : 0,
        tags: [...item.definition.tags],
        ownerId: item.instanceId,
      });
    }
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// PETS (63-68)
// ═══════════════════════════════════════════════════════════════════════════════

// 63. Fire Ant Colony
export const FIRE_ANT_COLONY: ItemDefinition = {
  id: 'fire_ant_colony',
  name: 'Colonia de Formigas de Fogo',
  description: 'Fluxo constante de projeteis de fogo minusculos.',
  tags: ['Pet', 'Animal', 'Fogo'],
  gridShape: [[1, 1], [1, 1]],
  baseStats: { damage: 1, fireRate: 12, projectileSpeed: 300, projectileCount: 2 },
  cost: 70,
  rarity: 2,
  onSynergyUpdate(item, ctx) { applyGrassManBonus(item, ctx); },
  onTick(item, dt, emit) { weaponTick(item, dt, emit, { spreadAngle: 30 }); },
};

// 64. Ice Fairy
export const ICE_FAIRY: ItemDefinition = {
  id: 'ice_fairy',
  name: 'Fada de Gelo',
  description: 'Congela inimigo aleatorio a cada 4s.',
  tags: ['Pet', 'Animal', 'Gelo'],
  gridShape: [[1]],
  baseStats: { damage: 15, fireRate: 0, projectileSpeed: 600 },
  cost: 55,
  rarity: 2,
  onSynergyUpdate(item, ctx) { applyGrassManBonus(item, ctx); },
  onTick(item, dt, emit) {
    item.state.freezeTimer = (item.state.freezeTimer ?? 0) + dt;
    if (item.state.freezeTimer >= 4) {
      item.state.freezeTimer -= 4;
      const angle = (Math.random() - 0.5) * 90 * Math.PI / 180;
      emit({
        x: 400, y: 500,
        vx: Math.sin(angle) * item.stats.projectileSpeed,
        vy: -Math.cos(angle) * item.stats.projectileSpeed,
        damage: item.stats.damage * item.stats.damageMultiplier,
        piercing: 0, aoeRadius: 0,
        tags: [...item.definition.tags],
        ownerId: item.instanceId,
      });
    }
  },
};

// 65. Thunder Hawk
export const THUNDER_HAWK: ItemDefinition = {
  id: 'thunder_hawk',
  name: 'Falcao Trovao',
  description: 'Mergulha no inimigo mais forte a cada 6s.',
  tags: ['Pet', 'Animal', 'Elétrico'],
  gridShape: [[1, 1]],
  baseStats: { damage: 30, fireRate: 0, projectileSpeed: 800 },
  cost: 80,
  rarity: 2,
  onSynergyUpdate(item, ctx) { applyGrassManBonus(item, ctx); },
  onTick(item, dt, emit) {
    item.state.diveTimer = (item.state.diveTimer ?? 0) + dt;
    if (item.state.diveTimer >= 6) {
      item.state.diveTimer -= 6;
      emit({
        x: 400, y: 500,
        vx: 0, vy: -item.stats.projectileSpeed,
        damage: item.stats.damage * item.stats.damageMultiplier,
        piercing: 2, aoeRadius: 15,
        tags: [...item.definition.tags],
        ownerId: item.instanceId,
      });
    }
  },
};

// 66. Poison Frog
export const POISON_FROG: ItemDefinition = {
  id: 'poison_frog',
  name: 'Sapo Venenoso',
  description: 'Pula e cria poca de veneno a cada 3s.',
  tags: ['Pet', 'Animal', 'Veneno'],
  gridShape: [[1]],
  baseStats: { damage: 4, fireRate: 0, projectileSpeed: 150, aoeRadius: 35 },
  cost: 45,
  rarity: 1,
  onSynergyUpdate(item, ctx) { applyGrassManBonus(item, ctx); },
  onTick(item, dt, emit) {
    item.state.hopTimer = (item.state.hopTimer ?? 0) + dt;
    if (item.state.hopTimer >= 3) {
      item.state.hopTimer -= 3;
      const xOffset = (Math.random() - 0.5) * 300;
      emit({
        x: 400 + xOffset, y: 400,
        vx: 0, vy: -item.stats.projectileSpeed,
        damage: item.stats.damage * item.stats.damageMultiplier,
        piercing: 0, aoeRadius: item.stats.aoeRadius,
        tags: [...item.definition.tags],
        ownerId: item.instanceId,
      });
    }
  },
};

// 67. Shadow Bat
export const SHADOW_BAT: ItemDefinition = {
  id: 'shadow_bat',
  name: 'Morcego das Sombras',
  description: 'Rouba 1 gold por inimigo morto.',
  tags: ['Pet', 'Animal'],
  gridShape: [[1]],
  baseStats: { damage: 3, fireRate: 2, projectileSpeed: 350 },
  cost: 40,
  rarity: 1,
  onSynergyUpdate(item, _ctx) {
    item.state.goldSteal = 1;
  },
  onTick(item, dt, emit) { weaponTick(item, dt, emit); },
};

// 68. Mechanical Bird
export const MECHANICAL_BIRD: ItemDefinition = {
  id: 'mechanical_bird',
  name: 'Passaro Mecanico',
  description: 'Copia o padrao de disparo de [Emissor] adjacente.',
  tags: ['Pet'],
  gridShape: [[1, 1]],
  baseStats: { damage: 4, fireRate: 2, projectileSpeed: 400 },
  cost: 60,
  rarity: 2,
  onSynergyUpdate(item, ctx) {
    const emitter = ctx.adjacentItems.find(i => i.definition.tags.includes('Emissor'));
    if (emitter) {
      item.stats.fireRate = emitter.stats.fireRate * emitter.stats.fireRateMultiplier;
      item.stats.projectileCount = emitter.stats.projectileCount;
      item.stats.damage = emitter.stats.damage * 0.6;
    }
  },
  onTick(item, dt, emit) { weaponTick(item, dt, emit); },
};

// ═══════════════════════════════════════════════════════════════════════════════
// MODIFIERS (69-78)
// ═══════════════════════════════════════════════════════════════════════════════

// 69. Scope
export const SCOPE: ItemDefinition = {
  id: 'scope',
  name: 'Mira Telescopica',
  description: '+30% dano para [Arma] com 1 projetil.',
  tags: ['Modificador'],
  gridShape: [[1]],
  baseStats: {},
  cost: 40,
  rarity: 1,
  onSynergyUpdate(item, ctx) {
    const singleShots = ctx.adjacentItems.filter(i =>
      i.definition.tags.includes('Arma') && i.stats.projectileCount === 1
    );
    for (const w of singleShots) {
      w.stats.damageMultiplier *= 1.3;
    }
  },
};

// 70. Extended Magazine
export const EXTENDED_MAGAZINE: ItemDefinition = {
  id: 'extended_magazine',
  name: 'Pente Estendido',
  description: 'Adjacentes [Arma] disparam 2 tiros extras por rajada.',
  tags: ['ModFrequência'],
  gridShape: [[1], [1]],
  baseStats: {},
  cost: 50,
  rarity: 2,
  onSynergyUpdate(item, ctx) {
    const weapons = ctx.adjacentItems.filter(i => i.definition.tags.includes('Arma'));
    for (const w of weapons) {
      w.stats.projectileCount += 2;
    }
  },
};

// 71. Explosive Rounds
export const EXPLOSIVE_ROUNDS: ItemDefinition = {
  id: 'explosive_rounds',
  name: 'Balas Explosivas',
  description: 'Projeteis de [Arma] adjacentes ganham +15 raio AoE.',
  tags: ['Modificador', 'Explosivo'],
  gridShape: [[1, 1]],
  baseStats: {},
  cost: 55,
  rarity: 2,
  onSynergyUpdate(item, ctx) {
    const weapons = ctx.adjacentItems.filter(i => i.definition.tags.includes('Arma'));
    for (const w of weapons) {
      w.stats.aoeRadius += 15;
    }
  },
};

// 72. Vampiric Siphon
export const VAMPIRIC_SIPHON: ItemDefinition = {
  id: 'vampiric_siphon',
  name: 'Sifao Vampirico',
  description: '[Emissor] adjacentes curam 1HP por kill.',
  tags: ['Modificador', 'Cura'],
  gridShape: [[1]],
  baseStats: {},
  cost: 60,
  rarity: 2,
  onSynergyUpdate(item, ctx) {
    const emitters = ctx.adjacentItems.filter(i => i.definition.tags.includes('Emissor'));
    for (const e of emitters) {
      e.state.vampiricHeal = 1;
    }
  },
};

// 73. Multi-Target Lock
export const MULTI_TARGET_LOCK: ItemDefinition = {
  id: 'multi_target_lock',
  name: 'Trava Multi-alvo',
  description: 'Projeteis de [Arma] adjacentes dividem em 2 no primeiro hit.',
  tags: ['Modificador'],
  gridShape: [[1, 1]],
  baseStats: {},
  cost: 65,
  rarity: 2,
  onSynergyUpdate(item, ctx) {
    const weapons = ctx.adjacentItems.filter(i => i.definition.tags.includes('Arma'));
    for (const w of weapons) {
      w.state.splitOnHit = 2;
      w.stats.damageMultiplier *= 0.85;
    }
  },
};

// 74. Cooldown Reducer
export const COOLDOWN_REDUCER: ItemDefinition = {
  id: 'cooldown_reducer',
  name: 'Redutor de Cooldown',
  description: 'Itens adjacentes agem 20% mais rapido.',
  tags: ['Modificador'],
  gridShape: [[1]],
  baseStats: {},
  cost: 55,
  rarity: 2,
  onSynergyUpdate(item, ctx) {
    for (const neighbor of ctx.adjacentItems) {
      neighbor.stats.fireRateMultiplier *= 1.2;
    }
  },
};

// 75. Elemental Catalyst
export const ELEMENTAL_CATALYST: ItemDefinition = {
  id: 'elemental_catalyst',
  name: 'Catalisador Elemental',
  description: 'Se adjacente a 2+ elementos diferentes, todos ganham +50% dano.',
  tags: ['Modificador'],
  gridShape: [[1, 1, 1]],
  baseStats: {},
  cost: 80,
  rarity: 3,
  onSynergyUpdate(item, ctx) {
    const elementTags = ['Fogo', 'Gelo', 'Elétrico', 'Veneno', 'Vento', 'Água'] as const;
    const foundElements = new Set<string>();
    for (const neighbor of ctx.adjacentItems) {
      for (const tag of neighbor.definition.tags) {
        if ((elementTags as readonly string[]).includes(tag)) {
          foundElements.add(tag);
        }
      }
    }
    if (foundElements.size >= 2) {
      for (const neighbor of ctx.adjacentItems) {
        neighbor.stats.damageMultiplier *= 1.5;
      }
    }
  },
};

// 76. Size Enhancer
export const SIZE_ENHANCER: ItemDefinition = {
  id: 'size_enhancer',
  name: 'Amplificador de Tamanho',
  description: 'Projeteis adjacentes sao 50% maiores (acertam mais facil).',
  tags: ['Modificador'],
  gridShape: [[1]],
  baseStats: {},
  cost: 45,
  rarity: 1,
  onSynergyUpdate(item, ctx) {
    for (const neighbor of ctx.adjacentItems) {
      if (neighbor.definition.tags.includes('Emissor')) {
        neighbor.state.projectileSizeBonus = 1.5;
      }
    }
  },
};

// 77. Critical Core
export const CRITICAL_CORE: ItemDefinition = {
  id: 'critical_core',
  name: 'Nucleo Critico',
  description: '15% chance de adjacentes [Arma] darem 3x dano.',
  tags: ['Modificador'],
  gridShape: [[1, 1], [1, 1]],
  baseStats: {},
  cost: 70,
  rarity: 2,
  onSynergyUpdate(item, ctx) {
    const weapons = ctx.adjacentItems.filter(i => i.definition.tags.includes('Arma'));
    for (const w of weapons) {
      w.state.critChance = (w.state.critChance ?? 0) + 0.15;
      w.state.critMultiplier = 3;
    }
  },
};

// 78. Momentum Engine
export const MOMENTUM_ENGINE: ItemDefinition = {
  id: 'momentum_engine',
  name: 'Motor de Momentum',
  description: 'Dano aumenta +5% por hit consecutivo (reseta ao errar).',
  tags: ['Modificador'],
  gridShape: [[1, 1]],
  baseStats: {},
  cost: 60,
  rarity: 2,
  onSynergyUpdate(item, ctx) {
    for (const neighbor of ctx.adjacentItems) {
      if (neighbor.definition.tags.includes('Arma')) {
        neighbor.state.momentumActive = 1;
        neighbor.state.momentumPerHit = 0.05;
      }
    }
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// UTILITIES (79-100)
// ═══════════════════════════════════════════════════════════════════════════════

// 79. Gold Mine
export const GOLD_MINE: ItemDefinition = {
  id: 'gold_mine',
  name: 'Mina de Ouro',
  description: 'Gera 1 gold/segundo durante combate.',
  tags: ['Utilitário'],
  gridShape: [[1, 1], [1, 1]],
  baseStats: {},
  cost: 80,
  rarity: 2,
  onSynergyUpdate(item, _ctx) {
    item.state.goldPerSecond = 1;
  },
  onTick(item, dt, _emit) {
    item.state.goldAccum = (item.state.goldAccum ?? 0) + dt;
  },
};

// 80. Magnet Field
export const MAGNET_FIELD: ItemDefinition = {
  id: 'magnet_field',
  name: 'Campo Magnetico',
  description: 'Aumenta raio de coleta de gold.',
  tags: ['Utilitário'],
  gridShape: [[1]],
  baseStats: {},
  cost: 25,
  rarity: 0,
  onSynergyUpdate(item, _ctx) {
    item.state.pickupRadiusBonus = 2;
  },
};

// 81. Emergency Repair
export const EMERGENCY_REPAIR: ItemDefinition = {
  id: 'emergency_repair',
  name: 'Reparo de Emergencia',
  description: 'Abaixo de 20% HP: cura 30 HP (1x por wave).',
  tags: ['Utilitário', 'Cura'],
  gridShape: [[1, 1], [1, 1]],
  baseStats: {},
  cost: 65,
  rarity: 2,
  onSynergyUpdate(item, _ctx) {
    item.state.emergencyHeal = 30;
    item.state.emergencyThreshold = 0.2;
  },
};

// 82. Ammo Box
export const AMMO_BOX: ItemDefinition = {
  id: 'ammo_box',
  name: 'Caixa de Municao',
  description: 'Todas as [Arma] ganham +1 projetil.',
  tags: ['Utilitário'],
  gridShape: [[1, 1], [1, 1]],
  baseStats: {},
  cost: 75,
  rarity: 2,
  onSynergyUpdate(item, ctx) {
    for (const i of ctx.allItems) {
      if (i.definition.tags.includes('Arma')) {
        i.stats.projectileCount += 1;
      }
    }
  },
};

// 83. Targeting Array
export const TARGETING_ARRAY: ItemDefinition = {
  id: 'targeting_array',
  name: 'Sistema de Mira',
  description: 'Todos os projeteis rastreiam levemente.',
  tags: ['Utilitário'],
  gridShape: [[1, 1, 1]],
  baseStats: {},
  cost: 70,
  rarity: 2,
  onSynergyUpdate(item, ctx) {
    for (const i of ctx.allItems) {
      if (i.definition.tags.includes('Emissor')) {
        i.state.homingBonus = (i.state.homingBonus ?? 0) + 1;
      }
    }
  },
};

// 84. Reflection Matrix
export const REFLECTION_MATRIX: ItemDefinition = {
  id: 'reflection_matrix',
  name: 'Matriz de Reflexao',
  description: '20% chance de refletir projetil inimigo.',
  tags: ['Utilitário', 'Escudo'],
  gridShape: [[1, 1, 1]],
  baseStats: { armorBonus: 3 },
  cost: 60,
  rarity: 2,
  onSynergyUpdate(item, _ctx) {
    item.state.reflectChance = 0.2;
  },
};

// 85. Bio-Generator
export const BIO_GENERATOR: ItemDefinition = {
  id: 'bio_generator',
  name: 'Bio-Gerador',
  description: '+2 HP/s para cada item [Organico] na mochila.',
  tags: ['Utilitário', 'Orgânico'],
  gridShape: [[1, 1], [1, 1]],
  baseStats: {},
  cost: 55,
  rarity: 2,
  onSynergyUpdate(item, ctx) {
    const organicCount = ctx.allItems.filter(i =>
      i.definition.tags.includes('Orgânico')
    ).length;
    item.stats.healPerSecond = organicCount * 2;
  },
};

// 86. Plasma Shield
export const PLASMA_SHIELD: ItemDefinition = {
  id: 'plasma_shield',
  name: 'Escudo de Plasma',
  description: 'Absorve 30 dano por wave.',
  tags: ['Escudo'],
  gridShape: [[1, 1, 1], [1, 1, 1]],
  baseStats: { armorBonus: 5 },
  cost: 85,
  rarity: 2,
  onSynergyUpdate(item, _ctx) {
    item.state.shieldMax = 30;
  },
};

// 87. Dark Pact
export const DARK_PACT: ItemDefinition = {
  id: 'dark_pact',
  name: 'Pacto Sombrio',
  description: '+30% dano global, perde 5 max HP permanente.',
  tags: ['Utilitário'],
  gridShape: [[1]],
  baseStats: {},
  cost: 50,
  rarity: 2,
  onSynergyUpdate(item, ctx) {
    for (const i of ctx.allItems) {
      i.stats.damageMultiplier *= 1.3;
    }
    item.state.maxHpPenalty = 5;
  },
};

// 88. Soul Collector
export const SOUL_COLLECTOR: ItemDefinition = {
  id: 'soul_collector',
  name: 'Coletor de Almas',
  description: '+1% dano por inimigo morto na run (acumula).',
  tags: ['Utilitário'],
  gridShape: [[1], [1]],
  baseStats: {},
  cost: 60,
  rarity: 2,
  onSynergyUpdate(item, _ctx) {
    item.state.soulDamagePerKill = 0.01;
  },
};

// 89. Overcharge Node
export const OVERCHARGE_NODE: ItemDefinition = {
  id: 'overcharge_node',
  name: 'Nodo de Sobrecarga',
  description: 'Itens [Eletrico] dobram efeitos mas drena 2HP/s.',
  tags: ['Utilitário', 'Elétrico'],
  gridShape: [[1, 1], [1, 1]],
  baseStats: { healPerSecond: -2 },
  cost: 75,
  rarity: 3,
  onSynergyUpdate(item, ctx) {
    for (const i of ctx.allItems) {
      if (i.definition.tags.includes('Elétrico') && i.instanceId !== item.instanceId) {
        i.stats.damageMultiplier *= 2;
        i.stats.fireRateMultiplier *= 2;
      }
    }
  },
};

// 90. Ancient Rune
export const ANCIENT_RUNE: ItemDefinition = {
  id: 'ancient_rune',
  name: 'Runa Ancestral',
  description: 'Boost aleatorio a cada wave (+20-50% em stat aleatorio).',
  tags: ['Utilitário'],
  gridShape: [[1]],
  baseStats: {},
  cost: 50,
  rarity: 2,
  onSynergyUpdate(item, ctx) {
    // Random boost simulated as average 35%
    const idx = (item.state.runeWave ?? 0) % ctx.allItems.length;
    if (ctx.allItems[idx]) {
      ctx.allItems[idx].stats.damageMultiplier *= 1.35;
    }
    item.state.runeWave = (item.state.runeWave ?? 0) + 1;
  },
};

// 91. Explosive Core
export const EXPLOSIVE_CORE: ItemDefinition = {
  id: 'explosive_core',
  name: 'Nucleo Explosivo',
  description: 'Inimigos ao morrer perto de outros causam 5 dano.',
  tags: ['Utilitário', 'Explosivo'],
  gridShape: [[1, 1]],
  baseStats: {},
  cost: 55,
  rarity: 2,
  onSynergyUpdate(item, _ctx) {
    item.state.deathExplosionDamage = 5;
    item.state.deathExplosionRadius = 40;
  },
};

// 92. Healing Totem
export const HEALING_TOTEM: ItemDefinition = {
  id: 'healing_totem',
  name: 'Totem de Cura',
  description: '+5 HP/s mas -15% dano global.',
  tags: ['Utilitário', 'Cura'],
  gridShape: [[1], [1], [1]],
  baseStats: { healPerSecond: 5 },
  cost: 50,
  rarity: 1,
  onSynergyUpdate(item, ctx) {
    for (const i of ctx.allItems) {
      if (i.instanceId !== item.instanceId) {
        i.stats.damageMultiplier *= 0.85;
      }
    }
  },
};

// 93. War Banner
export const WAR_BANNER: ItemDefinition = {
  id: 'war_banner',
  name: 'Estandarte de Guerra',
  description: '+5% dano global para cada inimigo morto nesta wave.',
  tags: ['Utilitário'],
  gridShape: [[1], [1], [1]],
  baseStats: {},
  cost: 70,
  rarity: 2,
  onSynergyUpdate(item, _ctx) {
    item.state.warBannerBonusPerKill = 0.05;
  },
};

// 94. Nexus Crystal
export const NEXUS_CRYSTAL: ItemDefinition = {
  id: 'nexus_crystal',
  name: 'Cristal Nexus',
  description: 'Conecta TODOS os itens como se fossem adjacentes.',
  tags: ['Utilitário'],
  gridShape: [[1, 1, 1], [1, 1, 1], [1, 1, 1]],
  baseStats: {},
  cost: 150,
  rarity: 3,
  onSynergyUpdate(item, _ctx) {
    item.state.nexusActive = 1;
  },
};

// 95. Luck Stone
export const LUCK_STONE: ItemDefinition = {
  id: 'luck_stone',
  name: 'Pedra da Sorte',
  description: '+10% chance da loja oferecer itens raros.',
  tags: ['Utilitário'],
  gridShape: [[1]],
  baseStats: {},
  cost: 45,
  rarity: 1,
  onSynergyUpdate(item, _ctx) {
    item.state.shopRarityBonus = 0.1;
  },
};

// 96. Heavy Armor
export const HEAVY_ARMOR: ItemDefinition = {
  id: 'heavy_armor',
  name: 'Armadura Pesada',
  description: '+20 armadura mas -30% cadencia global.',
  tags: ['Escudo'],
  gridShape: [[1, 1, 1], [1, 1, 1]],
  baseStats: { armorBonus: 20 },
  cost: 90,
  rarity: 2,
  onSynergyUpdate(item, ctx) {
    for (const i of ctx.allItems) {
      if (i.instanceId !== item.instanceId) {
        i.stats.fireRateMultiplier *= 0.7;
      }
    }
  },
};

// 97. Phase Shifter
export const PHASE_SHIFTER: ItemDefinition = {
  id: 'phase_shifter',
  name: 'Deslocador de Fase',
  description: '10% chance de esquivar qualquer dano completamente.',
  tags: ['Utilitário'],
  gridShape: [[1, 1]],
  baseStats: {},
  cost: 70,
  rarity: 2,
  onSynergyUpdate(item, _ctx) {
    item.state.dodgeChance = 0.1;
  },
};

// 98. Berserker Core
export const BERSERKER_CORE: ItemDefinition = {
  id: 'berserker_core',
  name: 'Nucleo Berserker',
  description: 'Abaixo de 30% HP: +100% dano global.',
  tags: ['Utilitário'],
  gridShape: [[1, 1], [1, 1]],
  baseStats: {},
  cost: 75,
  rarity: 3,
  onSynergyUpdate(item, _ctx) {
    item.state.berserkerThreshold = 0.3;
    item.state.berserkerDamageBonus = 2.0;
  },
};

// 99. Golden Egg
export const GOLDEN_EGG: ItemDefinition = {
  id: 'golden_egg',
  name: 'Ovo Dourado',
  description: 'Gera 5 gold no inicio de cada wave.',
  tags: ['Utilitário'],
  gridShape: [[1]],
  baseStats: {},
  cost: 55,
  rarity: 2,
  onSynergyUpdate(item, _ctx) {
    item.state.waveStartGold = 5;
  },
};

// 100. Infinity Stone
export const INFINITY_STONE: ItemDefinition = {
  id: 'infinity_stone',
  name: 'Pedra do Infinito',
  description: '+10% em TODOS os stats. Adjacentes tambem ganham +10%.',
  tags: ['Utilitário'],
  gridShape: [[1, 1, 1], [1, 1, 1]],
  baseStats: {},
  cost: 200,
  rarity: 3,
  onSynergyUpdate(item, ctx) {
    for (const i of ctx.allItems) {
      i.stats.damageMultiplier *= 1.1;
      i.stats.fireRateMultiplier *= 1.1;
      i.stats.projectileSpeed *= 1.1;
    }
    for (const neighbor of ctx.adjacentItems) {
      neighbor.stats.damageMultiplier *= 1.1;
      neighbor.stats.fireRateMultiplier *= 1.1;
    }
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// NEW ITEMS (101-150)
// ═══════════════════════════════════════════════════════════════════════════════

// 101. Railgun
export const RAILGUN: ItemDefinition = {
  id: 'railgun', name: 'Railgun',
  description: 'Tiro unico de dano massivo. Perfura 3 inimigos.',
  tags: ['Arma', 'Emissor', 'Elétrico', 'Perfurante'],
  gridShape: [[1, 1, 1]], baseStats: { damage: 40, fireRate: 0.5, projectileSpeed: 800 },
  cost: 120, rarity: 3,
  onSynergyUpdate(item, ctx) { applyGrassManBonus(item, ctx); item.state.piercingBonus = 3; },
  onTick(item, dt, emit) { weaponTick(item, dt, emit); },
};

// 102. Frost Turret
export const FROST_TURRET: ItemDefinition = {
  id: 'frost_turret', name: 'Torreta de Gelo',
  description: 'Disparos congelantes que desaceleram inimigos.',
  tags: ['Arma', 'Emissor', 'Gelo'],
  gridShape: [[1, 1], [1, 1]], baseStats: { damage: 5, fireRate: 3, projectileSpeed: 300 },
  cost: 65, rarity: 2,
  onSynergyUpdate(item, ctx) { applyGrassManBonus(item, ctx); },
  onTick(item, dt, emit) { weaponTick(item, dt, emit); },
};

// 103. Magma Launcher
export const MAGMA_LAUNCHER: ItemDefinition = {
  id: 'magma_launcher', name: 'Lancador de Magma',
  description: 'Bolas de magma com grande AoE.',
  tags: ['Arma', 'Emissor', 'Fogo', 'AoE'],
  gridShape: [[1, 1], [0, 1]], baseStats: { damage: 18, fireRate: 0.8, projectileSpeed: 250, aoeRadius: 45 },
  cost: 90, rarity: 2,
  onSynergyUpdate(item, ctx) { applyGrassManBonus(item, ctx); },
  onTick(item, dt, emit) { weaponTick(item, dt, emit); },
};

// 104. Vine Whip
export const VINE_WHIP: ItemDefinition = {
  id: 'vine_whip', name: 'Chicote de Videira',
  description: 'Ataque organico rapido com chance de enredar.',
  tags: ['Arma', 'Emissor', 'Orgânico', 'Planta'],
  gridShape: [[1], [1], [1]], baseStats: { damage: 7, fireRate: 4, projectileSpeed: 500 },
  cost: 45, rarity: 1,
  onSynergyUpdate(item, ctx) { applyGrassManBonus(item, ctx); },
  onTick(item, dt, emit) { weaponTick(item, dt, emit); },
};

// 105. Pulse Rifle
export const PULSE_RIFLE: ItemDefinition = {
  id: 'pulse_rifle', name: 'Rifle de Pulso',
  description: 'Rajada de 3 tiros rapidos, pausa, repete.',
  tags: ['Arma', 'Emissor', 'Elétrico'],
  gridShape: [[1, 1]], baseStats: { damage: 8, fireRate: 5, projectileSpeed: 450 },
  cost: 55, rarity: 1,
  onSynergyUpdate(item, ctx) { applyGrassManBonus(item, ctx); },
  onTick(item, dt, emit) { weaponTick(item, dt, emit); },
};

// 106. Thorn Cannon
export const THORN_CANNON: ItemDefinition = {
  id: 'thorn_cannon', name: 'Canhao de Espinhos',
  description: 'Dispara espinhos que perfuram 2 inimigos.',
  tags: ['Arma', 'Emissor', 'Orgânico', 'Perfurante'],
  gridShape: [[1], [1]], baseStats: { damage: 9, fireRate: 2.2, projectileSpeed: 380 },
  cost: 50, rarity: 1,
  onSynergyUpdate(item, ctx) { applyGrassManBonus(item, ctx); item.state.piercingBonus = 2; },
  onTick(item, dt, emit) { weaponTick(item, dt, emit); },
};

// 107. Water Cannon
export const WATER_CANNON: ItemDefinition = {
  id: 'water_cannon', name: 'Canhao d\'Agua',
  description: 'Jato de alta pressao. Empurra inimigos.',
  tags: ['Arma', 'Emissor', 'Água'],
  gridShape: [[1, 1], [0, 1]], baseStats: { damage: 10, fireRate: 2, projectileSpeed: 350 },
  cost: 55, rarity: 1,
  onSynergyUpdate(item, ctx) { applyGrassManBonus(item, ctx); },
  onTick(item, dt, emit) { weaponTick(item, dt, emit); },
};

// 108. Shadow Dagger
export const SHADOW_DAGGER: ItemDefinition = {
  id: 'shadow_dagger', name: 'Adaga Sombria',
  description: 'Projetil rapido e invisivel. Crit +30%.',
  tags: ['Arma', 'Emissor'],
  gridShape: [[1]], baseStats: { damage: 15, fireRate: 1.8, projectileSpeed: 600 },
  cost: 70, rarity: 2,
  onSynergyUpdate(item, ctx) { applyGrassManBonus(item, ctx); item.state.critChance = 0.3; },
  onTick(item, dt, emit) { weaponTick(item, dt, emit); },
};

// 109. Wind Cutter
export const WIND_CUTTER: ItemDefinition = {
  id: 'wind_cutter', name: 'Cortador de Vento',
  description: 'Laminas de vento em leque. Rapido e leve.',
  tags: ['Arma', 'Emissor', 'Vento'],
  gridShape: [[1, 1]], baseStats: { damage: 5, fireRate: 4.5, projectileSpeed: 500 },
  cost: 40, rarity: 1,
  onSynergyUpdate(item, ctx) { applyGrassManBonus(item, ctx); },
  onTick(item, dt, emit) { weaponTick(item, dt, emit, { spreadAngle: 30 }); },
};

// 110. Venom Spitter
export const VENOM_SPITTER: ItemDefinition = {
  id: 'venom_spitter', name: 'Cuspidor de Veneno',
  description: 'Gosma toxica com dano ao longo do tempo.',
  tags: ['Arma', 'Emissor', 'Veneno'],
  gridShape: [[1], [1]], baseStats: { damage: 4, fireRate: 3.5, projectileSpeed: 280 },
  cost: 45, rarity: 1,
  onSynergyUpdate(item, ctx) { applyGrassManBonus(item, ctx); },
  onTick(item, dt, emit) { weaponTick(item, dt, emit); },
};

// 111. Arcane Orb
export const ARCANE_ORB: ItemDefinition = {
  id: 'arcane_orb', name: 'Orbe Arcano',
  description: 'Orbes lentos mas com dano massivo e AoE.',
  tags: ['Arma', 'Emissor', 'AoE'],
  gridShape: [[1, 1], [1, 1]], baseStats: { damage: 25, fireRate: 0.6, projectileSpeed: 180, aoeRadius: 55 },
  cost: 100, rarity: 3,
  onSynergyUpdate(item, ctx) { applyGrassManBonus(item, ctx); },
  onTick(item, dt, emit) { weaponTick(item, dt, emit); },
};

// 112. Spider Familiar
export const SPIDER_FAMILIAR: ItemDefinition = {
  id: 'spider_familiar', name: 'Familiar Aranha',
  description: 'Pet que dispara teias. Desacelera inimigos proximos.',
  tags: ['Pet', 'Animal', 'Veneno'],
  gridShape: [[1]], baseStats: { damage: 3, fireRate: 2, projectileSpeed: 250 },
  cost: 40, rarity: 1,
  onSynergyUpdate(item, ctx) { applyGrassManBonus(item, ctx); },
  onTick(item, dt, emit) { weaponTick(item, dt, emit); },
};

// 113. Crystal Golem
export const CRYSTAL_GOLEM: ItemDefinition = {
  id: 'crystal_golem', name: 'Golem de Cristal',
  description: 'Pet grande que absorve 15% do dano ao jogador.',
  tags: ['Pet', 'Escudo'],
  gridShape: [[1, 1], [1, 1]], baseStats: { armorBonus: 5 },
  cost: 75, rarity: 2,
  onSynergyUpdate(item, _ctx) { item.state.damageAbsorb = 0.15; },
};

// 114. Ember Sprite
export const EMBER_SPRITE: ItemDefinition = {
  id: 'ember_sprite', name: 'Sprite de Brasa',
  description: 'Pet de fogo que ataca rapido com chamas curtas.',
  tags: ['Pet', 'Animal', 'Fogo'],
  gridShape: [[1]], baseStats: { damage: 4, fireRate: 5, projectileSpeed: 350 },
  cost: 50, rarity: 1,
  onSynergyUpdate(item, ctx) { applyGrassManBonus(item, ctx); },
  onTick(item, dt, emit) { weaponTick(item, dt, emit); },
};

// 115. Storm Eagle
export const STORM_EAGLE: ItemDefinition = {
  id: 'storm_eagle', name: 'Aguia da Tempestade',
  description: 'Pet eletrico com ataques em cadeia.',
  tags: ['Pet', 'Animal', 'Elétrico'],
  gridShape: [[1, 1]], baseStats: { damage: 7, fireRate: 2, projectileSpeed: 400 },
  cost: 60, rarity: 2,
  onSynergyUpdate(item, ctx) { applyGrassManBonus(item, ctx); },
  onTick(item, dt, emit) { weaponTick(item, dt, emit); },
};

// 116. Damage Booster
export const DAMAGE_BOOSTER: ItemDefinition = {
  id: 'damage_booster', name: 'Amplificador de Dano',
  description: 'Adjacentes ganham +25% dano.',
  tags: ['Modificador'],
  gridShape: [[1]], baseStats: {},
  cost: 55, rarity: 2,
  onSynergyUpdate(item, ctx) {
    for (const n of ctx.adjacentItems) { n.stats.damageMultiplier *= 1.25; }
  },
};

// 117. Rapid Fire Module
export const RAPID_FIRE_MODULE: ItemDefinition = {
  id: 'rapid_fire_module', name: 'Modulo Tiro Rapido',
  description: 'Adjacentes ganham +30% cadencia.',
  tags: ['Modificador', 'ModFrequência'],
  gridShape: [[1]], baseStats: {},
  cost: 55, rarity: 2,
  onSynergyUpdate(item, ctx) {
    for (const n of ctx.adjacentItems) { n.stats.fireRateMultiplier *= 1.3; }
  },
};

// 118. Piercing Lens
export const PIERCING_LENS: ItemDefinition = {
  id: 'piercing_lens', name: 'Lente Perfurante',
  description: 'Adjacentes ganham +1 perfuracao.',
  tags: ['Modificador', 'Perfurante'],
  gridShape: [[1]], baseStats: {},
  cost: 45, rarity: 1,
  onSynergyUpdate(item, ctx) {
    for (const n of ctx.adjacentItems) { n.state.piercingBonus = (n.state.piercingBonus ?? 0) + 1; }
  },
};

// 119. Splash Module
export const SPLASH_MODULE: ItemDefinition = {
  id: 'splash_module', name: 'Modulo de Splash',
  description: 'Adjacentes ganham +20 raio AoE.',
  tags: ['Modificador', 'AoE'],
  gridShape: [[1]], baseStats: {},
  cost: 50, rarity: 1,
  onSynergyUpdate(item, ctx) {
    for (const n of ctx.adjacentItems) { n.stats.aoeRadius += 20; }
  },
};

// 120. Life Leech
export const LIFE_LEECH: ItemDefinition = {
  id: 'life_leech', name: 'Sanguessuga Vital',
  description: 'Recupera 1 HP para cada 50 de dano causado.',
  tags: ['Utilitário', 'Cura'],
  gridShape: [[1, 1]], baseStats: { healPerSecond: 0.5 },
  cost: 60, rarity: 2,
  onSynergyUpdate(item, _ctx) { item.state.leechRatio = 0.02; },
};

// 121. Titanium Plating
export const TITANIUM_PLATING: ItemDefinition = {
  id: 'titanium_plating', name: 'Blindagem de Titanio',
  description: 'Reduz dano recebido em 20%. Pesado.',
  tags: ['Utilitário', 'Escudo'],
  gridShape: [[1, 1, 1], [1, 1, 1]], baseStats: { armorBonus: 8 },
  cost: 85, rarity: 2,
  onSynergyUpdate(item, _ctx) { item.state.damageReduction = 0.2; },
};

// 122. Gold Detector
export const GOLD_DETECTOR: ItemDefinition = {
  id: 'gold_detector', name: 'Detector de Ouro',
  description: '+3 gold por inimigo eliminado.',
  tags: ['Utilitário'],
  gridShape: [[1]], baseStats: {},
  cost: 50, rarity: 1,
  onSynergyUpdate(item, _ctx) { item.state.goldPerKill = 3; },
};

// 123. Adrenaline Injector
export const ADRENALINE_INJECTOR: ItemDefinition = {
  id: 'adrenaline_injector', name: 'Injetor de Adrenalina',
  description: '+50% cadencia quando HP < 50%.',
  tags: ['Utilitário'],
  gridShape: [[1], [1]], baseStats: {},
  cost: 60, rarity: 2,
  onSynergyUpdate(item, _ctx) { item.state.lowHpFireRateBonus = 1.5; },
};

// 124. Nano Repair Bot
export const NANO_REPAIR_BOT: ItemDefinition = {
  id: 'nano_repair_bot', name: 'Nanobot Reparador',
  description: 'Regenera 3 HP/s constantemente.',
  tags: ['Utilitário', 'Cura'],
  gridShape: [[1, 1]], baseStats: { healPerSecond: 3 },
  cost: 65, rarity: 2,
  onSynergyUpdate(item, _ctx) {},
};

// 125. EMP Generator
export const EMP_GENERATOR: ItemDefinition = {
  id: 'emp_generator', name: 'Gerador EMP',
  description: 'A cada 10s paralisa todos inimigos por 1s.',
  tags: ['Utilitário', 'Elétrico'],
  gridShape: [[1, 1], [1, 0]], baseStats: {},
  cost: 80, rarity: 3,
  onSynergyUpdate(item, _ctx) { item.state.empInterval = 10; item.state.empDuration = 1; },
};

// 126. Fire Shield
export const FIRE_SHIELD: ItemDefinition = {
  id: 'fire_shield', name: 'Escudo de Fogo',
  description: 'Ao receber dano, causa 10 dano em area.',
  tags: ['Escudo', 'Fogo'],
  gridShape: [[1, 1]], baseStats: { armorBonus: 3 },
  cost: 55, rarity: 2,
  onSynergyUpdate(item, _ctx) { item.state.reflectDamage = 10; item.state.reflectRadius = 60; },
};

// 127. Poison Cloud Generator
export const POISON_CLOUD_GEN: ItemDefinition = {
  id: 'poison_cloud_gen', name: 'Gerador de Nuvem Toxica',
  description: 'Cria nuvem venenosa que causa dano continuo.',
  tags: ['Utilitário', 'Veneno', 'AoE'],
  gridShape: [[1, 1], [1, 1]], baseStats: { damage: 2, fireRate: 1 },
  cost: 70, rarity: 2,
  onSynergyUpdate(item, ctx) { applyGrassManBonus(item, ctx); },
  onTick(item, dt, emit) { weaponTick(item, dt, emit, { spreadAngle: 40 }); },
};

// 128. Mirror Shield
export const MIRROR_SHIELD: ItemDefinition = {
  id: 'mirror_shield', name: 'Escudo Espelhado',
  description: 'Reflete 30% dos projeteis inimigos.',
  tags: ['Escudo', 'Utilitário'],
  gridShape: [[1], [1], [1]], baseStats: { armorBonus: 4 },
  cost: 75, rarity: 2,
  onSynergyUpdate(item, _ctx) { item.state.reflectChance = 0.3; },
};

// 129. Quantum Entangler
export const QUANTUM_ENTANGLER: ItemDefinition = {
  id: 'quantum_entangler', name: 'Emaranhador Quantico',
  description: 'Projeteis atingem 2 alvos simultaneamente.',
  tags: ['Modificador'],
  gridShape: [[1, 1]], baseStats: {},
  cost: 90, rarity: 3,
  onSynergyUpdate(item, ctx) {
    for (const n of ctx.adjacentItems) {
      if (n.definition.tags.includes('Emissor')) {
        n.stats.projectileCount += 1;
      }
    }
  },
};

// 130. Gravity Anchor
export const GRAVITY_ANCHOR: ItemDefinition = {
  id: 'gravity_anchor', name: 'Ancora Gravitacional',
  description: 'Desacelera inimigos proximos ao jogador em 25%.',
  tags: ['Utilitário'],
  gridShape: [[1, 1], [1, 1]], baseStats: {},
  cost: 70, rarity: 2,
  onSynergyUpdate(item, _ctx) { item.state.slowAura = 0.25; item.state.slowRadius = 120; },
};

// 131. Scavenger Module
export const SCAVENGER_MODULE: ItemDefinition = {
  id: 'scavenger_module', name: 'Modulo Catador',
  description: '+15% gold de todos inimigos.',
  tags: ['Utilitário'],
  gridShape: [[1]], baseStats: {},
  cost: 45, rarity: 1,
  onSynergyUpdate(item, _ctx) { item.state.goldBonus = 0.15; },
};

// 132. Overload Capacitor
export const OVERLOAD_CAPACITOR: ItemDefinition = {
  id: 'overload_capacitor', name: 'Capacitor de Sobrecarga',
  description: 'Acumula energia. A cada 5 kills dispara raio massivo.',
  tags: ['Utilitário', 'Elétrico'],
  gridShape: [[1, 1]], baseStats: {},
  cost: 65, rarity: 2,
  onSynergyUpdate(item, _ctx) { item.state.killsToDischarge = 5; item.state.dischargeDamage = 50; },
};

// 133. Root Network
export const ROOT_NETWORK: ItemDefinition = {
  id: 'root_network', name: 'Rede de Raizes',
  description: 'Todos itens Planta ganham +20% dano.',
  tags: ['Utilitário', 'Planta', 'Orgânico'],
  gridShape: [[1, 1, 1]], baseStats: {},
  cost: 50, rarity: 1,
  onSynergyUpdate(item, ctx) {
    for (const i of ctx.allItems) {
      if (i.definition.tags.includes('Planta')) i.stats.damageMultiplier *= 1.2;
    }
  },
};

// 134. Thermal Core
export const THERMAL_CORE: ItemDefinition = {
  id: 'thermal_core', name: 'Nucleo Termico',
  description: 'Todos itens Fogo ganham +25% AoE.',
  tags: ['Utilitário', 'Fogo'],
  gridShape: [[1, 1]], baseStats: {},
  cost: 55, rarity: 2,
  onSynergyUpdate(item, ctx) {
    for (const i of ctx.allItems) {
      if (i.definition.tags.includes('Fogo')) i.stats.aoeRadius += 15;
    }
  },
};

// 135. Cryo Battery
export const CRYO_BATTERY: ItemDefinition = {
  id: 'cryo_battery', name: 'Bateria Cryo',
  description: 'Todos itens Gelo ganham +30% cadencia.',
  tags: ['Utilitário', 'Gelo'],
  gridShape: [[1], [1]], baseStats: {},
  cost: 55, rarity: 2,
  onSynergyUpdate(item, ctx) {
    for (const i of ctx.allItems) {
      if (i.definition.tags.includes('Gelo')) i.stats.fireRateMultiplier *= 1.3;
    }
  },
};

// 136. Thunder Coil
export const THUNDER_COIL: ItemDefinition = {
  id: 'thunder_coil', name: 'Bobina de Trovao',
  description: 'Itens Eletrico ganham +20% dano e velocidade.',
  tags: ['Utilitário', 'Elétrico'],
  gridShape: [[1, 1]], baseStats: {},
  cost: 55, rarity: 2,
  onSynergyUpdate(item, ctx) {
    for (const i of ctx.allItems) {
      if (i.definition.tags.includes('Elétrico')) {
        i.stats.damageMultiplier *= 1.2;
        i.stats.projectileSpeed *= 1.2;
      }
    }
  },
};

// 137. Toxic Amplifier
export const TOXIC_AMPLIFIER: ItemDefinition = {
  id: 'toxic_amplifier', name: 'Amplificador Toxico',
  description: 'Itens Veneno ganham +40% dano.',
  tags: ['Utilitário', 'Veneno'],
  gridShape: [[1]], baseStats: {},
  cost: 50, rarity: 2,
  onSynergyUpdate(item, ctx) {
    for (const i of ctx.allItems) {
      if (i.definition.tags.includes('Veneno')) i.stats.damageMultiplier *= 1.4;
    }
  },
};

// 138. Pet Treat
export const PET_TREAT: ItemDefinition = {
  id: 'pet_treat', name: 'Petisco para Pets',
  description: 'Todos Pets ganham +50% cadencia.',
  tags: ['Utilitário', 'Animal'],
  gridShape: [[1]], baseStats: {},
  cost: 45, rarity: 1,
  onSynergyUpdate(item, ctx) {
    for (const i of ctx.allItems) {
      if (i.definition.tags.includes('Pet')) i.stats.fireRateMultiplier *= 1.5;
    }
  },
};

// 139. Synergy Prism
export const SYNERGY_PRISM: ItemDefinition = {
  id: 'synergy_prism', name: 'Prisma de Sinergia',
  description: '+5% dano global por tag unica na mochila.',
  tags: ['Utilitário'],
  gridShape: [[1, 1], [1, 1]], baseStats: {},
  cost: 100, rarity: 3,
  onSynergyUpdate(item, ctx) {
    const tags = new Set<string>();
    for (const i of ctx.allItems) { for (const t of i.definition.tags) tags.add(t); }
    const bonus = 1 + tags.size * 0.05;
    for (const i of ctx.allItems) { i.stats.damageMultiplier *= bonus; }
  },
};

// 140. Emergency Shield
export const EMERGENCY_SHIELD: ItemDefinition = {
  id: 'emergency_shield', name: 'Escudo de Emergencia',
  description: 'Ao chegar em 15% HP, ganha escudo de 50 HP (1x por wave).',
  tags: ['Escudo', 'Utilitário'],
  gridShape: [[1, 1]], baseStats: {},
  cost: 80, rarity: 3,
  onSynergyUpdate(item, _ctx) { item.state.emergencyThreshold = 0.15; item.state.shieldAmount = 50; },
};

// 141. Chain Lightning Rod
export const CHAIN_LIGHTNING_ROD: ItemDefinition = {
  id: 'chain_lightning_rod', name: 'Para-Raios em Cadeia',
  description: 'Projeteis eletricos saltam para 2 alvos extras.',
  tags: ['Arma', 'Emissor', 'Elétrico'],
  gridShape: [[1], [1], [1]], baseStats: { damage: 6, fireRate: 2.5, projectileSpeed: 500 },
  cost: 70, rarity: 2,
  onSynergyUpdate(item, ctx) { applyGrassManBonus(item, ctx); item.state.piercingBonus = 2; },
  onTick(item, dt, emit) { weaponTick(item, dt, emit); },
};

// 142. Acid Rain Generator
export const ACID_RAIN_GENERATOR: ItemDefinition = {
  id: 'acid_rain_gen', name: 'Gerador de Chuva Acida',
  description: 'Chuva de projeteis toxicos em area ampla.',
  tags: ['Arma', 'Emissor', 'Veneno', 'AoE'],
  gridShape: [[1, 1, 1]], baseStats: { damage: 3, fireRate: 6, projectileSpeed: 200, aoeRadius: 30 },
  cost: 75, rarity: 2,
  onSynergyUpdate(item, ctx) { applyGrassManBonus(item, ctx); },
  onTick(item, dt, emit) { weaponTick(item, dt, emit, { spreadAngle: 60 }); },
};

// 143. Minigun
export const MINIGUN: ItemDefinition = {
  id: 'minigun', name: 'Minigun',
  description: 'Cadencia absurda. Dano baixo por tiro.',
  tags: ['Arma', 'Emissor'],
  gridShape: [[1, 1], [1, 1], [1, 1]], baseStats: { damage: 3, fireRate: 12, projectileSpeed: 450 },
  cost: 110, rarity: 3,
  onSynergyUpdate(item, ctx) { applyGrassManBonus(item, ctx); },
  onTick(item, dt, emit) { weaponTick(item, dt, emit, { spreadAngle: 8 }); },
};

// 144. Holy Grail
export const HOLY_GRAIL: ItemDefinition = {
  id: 'holy_grail', name: 'Santo Graal',
  description: 'Regenera 5 HP/s. +20% cura de todas as fontes.',
  tags: ['Utilitário', 'Cura'],
  gridShape: [[1, 1], [1, 1]], baseStats: { healPerSecond: 5 },
  cost: 120, rarity: 3,
  onSynergyUpdate(item, _ctx) { item.state.healBonus = 1.2; },
};

// 145. War Horn
export const WAR_HORN: ItemDefinition = {
  id: 'war_horn', name: 'Corneta de Guerra',
  description: '+10% dano global por combo ativo.',
  tags: ['Utilitário'],
  gridShape: [[1, 1]], baseStats: {},
  cost: 65, rarity: 2,
  onSynergyUpdate(item, _ctx) { item.state.comboDamageBonus = 0.1; },
};

// 146. Merchant Badge
export const MERCHANT_BADGE: ItemDefinition = {
  id: 'merchant_badge', name: 'Insignia de Mercador',
  description: 'Lojas oferecem 1 item extra. -10% precos.',
  tags: ['Utilitário'],
  gridShape: [[1]], baseStats: {},
  cost: 40, rarity: 1,
  onSynergyUpdate(item, _ctx) { item.state.shopDiscount = 0.1; item.state.extraShopItem = 1; },
};

// 147. Alien Core Fragment
export const ALIEN_CORE_FRAGMENT: ItemDefinition = {
  id: 'alien_core_fragment', name: 'Fragmento de Nucleo Alien',
  description: '+3% dano por cada inimigo na tela.',
  tags: ['Utilitário'],
  gridShape: [[1, 1]], baseStats: {},
  cost: 70, rarity: 2,
  onSynergyUpdate(item, _ctx) { item.state.damagePerEnemy = 0.03; },
};

// 148. Chaos Engine
export const CHAOS_ENGINE: ItemDefinition = {
  id: 'chaos_engine', name: 'Motor do Caos',
  description: 'Dano entre 50% e 200% aleatorio cada tiro.',
  tags: ['Modificador'],
  gridShape: [[1, 1], [1, 1]], baseStats: {},
  cost: 80, rarity: 3,
  onSynergyUpdate(item, ctx) {
    for (const n of ctx.adjacentItems) { n.state.chaosMode = 1; }
  },
};

// 149. Temporal Paradox
export const TEMPORAL_PARADOX: ItemDefinition = {
  id: 'temporal_paradox', name: 'Paradoxo Temporal',
  description: 'Dispara 2x mas com 50% chance de nao causar dano.',
  tags: ['Modificador'],
  gridShape: [[1, 1]], baseStats: {},
  cost: 60, rarity: 2,
  onSynergyUpdate(item, ctx) {
    for (const n of ctx.adjacentItems) {
      if (n.definition.tags.includes('Emissor')) {
        n.stats.fireRateMultiplier *= 2;
        n.state.missChance = 0.5;
      }
    }
  },
};

// 150. Alien Heart
export const KEPLERS_HEART: ItemDefinition = {
  id: 'keplers_heart', name: 'Coracao Alien',
  description: 'Item lendario. +30% todos stats. Brilha no escuro.',
  tags: ['Utilitário'],
  gridShape: [[1, 1, 1], [1, 1, 1], [1, 1, 1]], baseStats: {},
  cost: 300, rarity: 3,
  onSynergyUpdate(item, ctx) {
    for (const i of ctx.allItems) {
      i.stats.damageMultiplier *= 1.3;
      i.stats.fireRateMultiplier *= 1.3;
      i.stats.projectileSpeed *= 1.15;
    }
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export const ALL_ITEMS: ItemDefinition[] = [
  // Weapons (1-8)
  BASIC_GUN, FIRE_GUN, ICE_GUN, LIGHTNING_ROD, POISON_DART, SHOTGUN, SNIPER, MISSILE_LAUNCHER,
  // Pets (9-13)
  PARROT, CAT, OWL, SNAKE, PHOENIX_EGG,
  // Modifiers (14-18)
  STUTTER_BOX, AMPLIFIER_CRYSTAL, SPEED_COIL, SPLITTER_PRISM, TARGETING_MODULE,
  // Utilities (19-30)
  WATERING_CAN, PLANT_SHIELD, REPAIR_KIT, GOLD_MAGNET, ARMOR_PLATE,
  BATTERY, FERTILIZER, COOLANT, WIND_FAN, LUCKY_CHARM, VOID_CRYSTAL, CROWN_OF_THORNS,
  // Weapons (31-35)
  LASER_BEAM, BOOMERANG, FLAMETHROWER, TESLA_COIL, ACID_SPRAYER,
  // Pets (36-38)
  DRAGON_WHELP, BEE_SWARM, GHOST_CAT,
  // Modifiers (39-42)
  OVERCLOCKER, ECHO_CHAMBER, RICOCHET_MODULE, ELEMENTAL_INFUSION,
  // Utilities (43-50)
  SHIELD_GENERATOR, COIN_DOUBLER, RADAR_DISH, MEDKIT, SCRAP_RECYCLER,
  POWER_CORE, GRAVITY_WELL, TIME_DILATOR,
  // Weapons (51-62)
  PLASMA_CANNON, CHAIN_GUN, FROST_NOVA, SOLAR_BEAM, HARPOON_GUN,
  GRENADE_LAUNCHER, SOUND_CANNON, BONE_SPEAR, CRYSTAL_SHARD_GUN,
  VOID_CANNON, DUAL_PISTOLS, ANCIENT_STAFF,
  // Pets (63-68)
  FIRE_ANT_COLONY, ICE_FAIRY, THUNDER_HAWK, POISON_FROG, SHADOW_BAT, MECHANICAL_BIRD,
  // Modifiers (69-78)
  SCOPE, EXTENDED_MAGAZINE, EXPLOSIVE_ROUNDS, VAMPIRIC_SIPHON, MULTI_TARGET_LOCK,
  COOLDOWN_REDUCER, ELEMENTAL_CATALYST, SIZE_ENHANCER, CRITICAL_CORE, MOMENTUM_ENGINE,
  // Utilities (79-100)
  GOLD_MINE, MAGNET_FIELD, EMERGENCY_REPAIR, AMMO_BOX, TARGETING_ARRAY,
  REFLECTION_MATRIX, BIO_GENERATOR, PLASMA_SHIELD, DARK_PACT, SOUL_COLLECTOR,
  OVERCHARGE_NODE, ANCIENT_RUNE, EXPLOSIVE_CORE, HEALING_TOTEM, WAR_BANNER,
  NEXUS_CRYSTAL, LUCK_STONE, HEAVY_ARMOR, PHASE_SHIFTER, BERSERKER_CORE,
  GOLDEN_EGG, INFINITY_STONE,
  // New items (101-150)
  RAILGUN, FROST_TURRET, MAGMA_LAUNCHER, VINE_WHIP, PULSE_RIFLE,
  THORN_CANNON, WATER_CANNON, SHADOW_DAGGER, WIND_CUTTER, VENOM_SPITTER,
  ARCANE_ORB, SPIDER_FAMILIAR, CRYSTAL_GOLEM, EMBER_SPRITE, STORM_EAGLE,
  DAMAGE_BOOSTER, RAPID_FIRE_MODULE, PIERCING_LENS, SPLASH_MODULE, LIFE_LEECH,
  TITANIUM_PLATING, GOLD_DETECTOR, ADRENALINE_INJECTOR, NANO_REPAIR_BOT, EMP_GENERATOR,
  FIRE_SHIELD, POISON_CLOUD_GEN, MIRROR_SHIELD, QUANTUM_ENTANGLER, GRAVITY_ANCHOR,
  SCAVENGER_MODULE, OVERLOAD_CAPACITOR, ROOT_NETWORK, THERMAL_CORE, CRYO_BATTERY,
  THUNDER_COIL, TOXIC_AMPLIFIER, PET_TREAT, SYNERGY_PRISM, EMERGENCY_SHIELD,
  CHAIN_LIGHTNING_ROD, ACID_RAIN_GENERATOR, MINIGUN, HOLY_GRAIL, WAR_HORN,
  MERCHANT_BADGE, ALIEN_CORE_FRAGMENT, CHAOS_ENGINE, TEMPORAL_PARADOX, KEPLERS_HEART,
];

export function getItemById(id: string): ItemDefinition | undefined {
  return ALL_ITEMS.find(i => i.id === id);
}
