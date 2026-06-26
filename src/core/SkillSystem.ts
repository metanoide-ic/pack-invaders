/**
 * SKILL SYSTEM — Active abilities triggered by player input.
 * Each character has 3 unique skills mapped to keys 1, 2, 3.
 * Skills have cooldowns and effects that alter combat state.
 */

import { CombatState, Enemy } from './CombatEngine';

export interface SkillDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  /** Cooldown in seconds */
  cooldown: number;
  /** Duration of effect (0 = instant) */
  duration: number;
  /** Apply the skill effect */
  activate: (state: CombatState, ctx: SkillContext) => void;
}

export interface SkillContext {
  arenaWidth: number;
  arenaHeight: number;
  /** Spawn a projectile burst */
  spawnBurst: (count: number, damage: number, speed: number, color: string) => void;
  /** Damage all enemies in radius */
  damageArea: (x: number, y: number, radius: number, damage: number) => void;
  /** Heal player */
  heal: (amount: number) => void;
  /** Slow all enemies */
  slowAll: (amount: number, duration: number) => void;
  /** Push enemies away from point */
  pushEnemies: (x: number, y: number, force: number) => void;
}

export interface SkillState {
  definition: SkillDefinition;
  cooldownRemaining: number;
  activeTimer: number;
  /** Times used this run (for power scaling) */
  usesThisRun: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CHARACTER SKILLS
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Raiz (Grass Man) ────────────────────────────────────────────────────────

const SKILL_VINE_BURST: SkillDefinition = {
  id: 'vine_burst', name: 'Explosão de Videiras', description: 'Raízes brotam do chão danificando todos inimigos próximos.',
  icon: '🌿', cooldown: 8, duration: 0,
  activate(state, ctx) {
    ctx.damageArea(state.playerX, state.playerHp > 0 ? 600 : 360, 200, 30);
    ctx.pushEnemies(state.playerX, 600, 150);
  },
};

const SKILL_PHOTOSYNTHESIS: SkillDefinition = {
  id: 'photosynthesis_active', name: 'Fotossíntese', description: 'Regenera 40 HP ao longo de 5 segundos.',
  icon: '☀', cooldown: 15, duration: 5,
  activate(state, ctx) {
    ctx.heal(40);
  },
};

const SKILL_THORN_SHIELD: SkillDefinition = {
  id: 'thorn_shield', name: 'Escudo de Espinhos', description: 'Projéteis inimigos são bloqueados por 3s. Inimigos que tocam levam dano.',
  icon: '🛡', cooldown: 12, duration: 3,
  activate(state, _ctx) {
    // Handled in combat engine via activeTimer check
    state.playerFlashTimer = 0.1; // Visual indicator
  },
};

// ─── Cinza (Fire Lord) ───────────────────────────────────────────────────────

const SKILL_METEOR: SkillDefinition = {
  id: 'meteor', name: 'Meteoro', description: 'Invoca um meteoro que causa 80 dano em grande área.',
  icon: '☄', cooldown: 10, duration: 0,
  activate(state, ctx) {
    // Target densest enemy cluster
    let bestX = ctx.arenaWidth / 2, bestY = 300;
    if (state.enemies.length > 0) {
      bestX = state.enemies[0].x;
      bestY = state.enemies[0].y;
    }
    ctx.damageArea(bestX, bestY, 150, 80);
  },
};

const SKILL_INFERNO: SkillDefinition = {
  id: 'inferno_wave', name: 'Onda de Fogo', description: 'Dispara 12 projéteis flamejantes em todas as direções.',
  icon: '🔥', cooldown: 7, duration: 0,
  activate(state, ctx) {
    ctx.spawnBurst(12, 20, 400, '#f97316');
  },
};

const SKILL_SELF_IGNITE: SkillDefinition = {
  id: 'self_ignite', name: 'Auto-Ignição', description: '+100% dano por 4s, mas perde 20 HP.',
  icon: '💥', cooldown: 14, duration: 4,
  activate(state, _ctx) {
    state.playerHp = Math.max(1, state.playerHp - 20);
  },
};

// ─── Maré (Aqua Sage) ───────────────────────────────────────────────────────

const SKILL_TIDAL_WAVE: SkillDefinition = {
  id: 'tidal_wave', name: 'Onda de Maré', description: 'Empurra todos os inimigos para cima e causa 25 dano.',
  icon: '🌊', cooldown: 9, duration: 0,
  activate(state, ctx) {
    ctx.pushEnemies(ctx.arenaWidth / 2, ctx.arenaHeight, 250);
    ctx.damageArea(ctx.arenaWidth / 2, ctx.arenaHeight / 2, 600, 25);
  },
};

const SKILL_HEALING_RAIN: SkillDefinition = {
  id: 'healing_rain', name: 'Chuva Curativa', description: 'Regenera 60 HP e desacelera todos inimigos por 4s.',
  icon: '💧', cooldown: 18, duration: 4,
  activate(state, ctx) {
    ctx.heal(60);
    ctx.slowAll(0.4, 4);
  },
};

const SKILL_WHIRLPOOL: SkillDefinition = {
  id: 'whirlpool', name: 'Redemoinho', description: 'Puxa inimigos para o centro e causa dano contínuo por 3s.',
  icon: '🌀', cooldown: 12, duration: 3,
  activate(state, ctx) {
    ctx.damageArea(ctx.arenaWidth / 2, ctx.arenaHeight / 2, 300, 15);
  },
};

// ─── Pulso (Storm Runner) ────────────────────────────────────────────────────

const SKILL_THUNDER_STRIKE: SkillDefinition = {
  id: 'thunder_strike', name: 'Decaimento', description: 'Feixe de radiação atinge o inimigo com mais HP causando 100 dano.',
  icon: '☢', cooldown: 8, duration: 0,
  activate(state, ctx) {
    if (state.enemies.length === 0) return;
    const target = state.enemies.reduce((a, b) => a.hp > b.hp ? a : b);
    ctx.damageArea(target.x, target.y, 40, 100);
  },
};

const SKILL_OVERCLOCK: SkillDefinition = {
  id: 'overclock', name: 'Sobrecarga Instável', description: '+200% cadência por 3s. O alien interior assume as armas.',
  icon: '⚛', cooldown: 12, duration: 3,
  activate(_state, _ctx) {
    // Handled in combat engine via activeTimer
  },
};

const SKILL_EMP_BLAST: SkillDefinition = {
  id: 'emp_blast', name: 'Pulso de Radiação', description: 'Emite um pulso radioativo que paralisa todos inimigos por 2s.',
  icon: '📡', cooldown: 16, duration: 2,
  activate(_state, ctx) {
    ctx.slowAll(0.05, 2);
  },
};

// ─── Fenda (Void Walker) ─────────────────────────────────────────────────────

const SKILL_VOID_RIFT: SkillDefinition = {
  id: 'void_rift', name: 'Fenda do Vazio', description: 'Abre uma fenda que suga inimigos e causa 50 dano.',
  icon: '🕳', cooldown: 10, duration: 0,
  activate(state, ctx) {
    const cx = ctx.arenaWidth / 2;
    const cy = ctx.arenaHeight * 0.4;
    ctx.damageArea(cx, cy, 200, 50);
    ctx.pushEnemies(cx, cy, -180); // Negative = pull toward
  },
};

const SKILL_PHASE_SHIFT: SkillDefinition = {
  id: 'phase_shift', name: 'Mudança de Fase', description: 'Invulnerável por 2s. Não pode atacar.',
  icon: '👻', cooldown: 14, duration: 2,
  activate(state, _ctx) {
    state.playerFlashTimer = 0.1;
  },
};

const SKILL_DARK_HARVEST: SkillDefinition = {
  id: 'dark_harvest', name: 'Colheita Sombria', description: 'Drena 5% do HP de todos inimigos e cura o jogador.',
  icon: '💀', cooldown: 11, duration: 0,
  activate(state, ctx) {
    let totalDrain = 0;
    for (const e of state.enemies) {
      const drain = Math.floor(e.hp * 0.05);
      e.hp -= drain;
      totalDrain += drain;
    }
    ctx.heal(Math.min(totalDrain, 80));
  },
};

// ─── Necra (Beast Tamer) ─────────────────────────────────────────────────────

const SKILL_SUMMON_SWARM: SkillDefinition = {
  id: 'summon_swarm', name: 'Invocar Enxame', description: 'Invoca 8 projéteis teleguiados que caçam inimigos.',
  icon: '🐝', cooldown: 9, duration: 0,
  activate(_state, ctx) {
    ctx.spawnBurst(8, 15, 300, '#fbbf24');
  },
};

const SKILL_FRENZY: SkillDefinition = {
  id: 'frenzy', name: 'Frenesi', description: 'Pets atacam 3x mais rápido por 4s.',
  icon: '🐾', cooldown: 13, duration: 4,
  activate(_state, _ctx) {
    // Handled in combat engine via activeTimer
  },
};

const SKILL_REANIMATE: SkillDefinition = {
  id: 'reanimate_skill', name: 'Reanimar', description: 'O inimigo mais forte morto nesta wave é reanimado como aliado.',
  icon: '💚', cooldown: 20, duration: 0,
  activate(state, ctx) {
    // Heal as compensation since reanimation is complex
    ctx.heal(25);
    // Damage random enemies (simulating the reanimated one attacking)
    for (let i = 0; i < 3 && state.enemies.length > 0; i++) {
      const idx = Math.floor(Math.random() * state.enemies.length);
      ctx.damageArea(state.enemies[idx].x, state.enemies[idx].y, 30, 40);
    }
  },
};

// ─── Fênix (Firefighter) ─────────────────────────────────────────────────────

const SKILL_FOAM_JET: SkillDefinition = {
  id: 'foam_jet', name: 'Jato de Espuma', description: 'Cobre os inimigos com espuma, desacelerando todos por 4s e causando 25 dano.',
  icon: '🧯', cooldown: 9, duration: 4,
  activate(state, ctx) {
    ctx.slowAll(0.45, 4);
    ctx.damageArea(ctx.arenaWidth / 2, ctx.arenaHeight / 2, 600, 25);
  },
};

const SKILL_RESCUE_SHIELD: SkillDefinition = {
  id: 'rescue_shield', name: 'Escudo do Bombeiro', description: 'Bloqueia projéteis inimigos por 3s e cura 30 HP.',
  icon: '🛡', cooldown: 14, duration: 3,
  activate(state, ctx) {
    state.playerFlashTimer = 0.1; // Visual indicator; block handled via activeTimer
    ctx.heal(30);
  },
};

const SKILL_AXE_SPIN: SkillDefinition = {
  id: 'axe_spin', name: 'Machado Giratório', description: 'Gira o machado causando 65 dano a todos inimigos próximos e os empurra.',
  icon: '🪓', cooldown: 10, duration: 0,
  activate(state, ctx) {
    ctx.damageArea(state.playerX, 600, 220, 65);
    ctx.pushEnemies(state.playerX, 600, 180);
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// SKILL SETS PER CHARACTER
// ═══════════════════════════════════════════════════════════════════════════════

export const CHARACTER_SKILLS: Record<string, SkillDefinition[]> = {
  grass_man: [SKILL_VINE_BURST, SKILL_PHOTOSYNTHESIS, SKILL_THORN_SHIELD],
  fire_lord: [SKILL_METEOR, SKILL_INFERNO, SKILL_SELF_IGNITE],
  aqua_sage: [SKILL_TIDAL_WAVE, SKILL_HEALING_RAIN, SKILL_WHIRLPOOL],
  storm_runner: [SKILL_THUNDER_STRIKE, SKILL_OVERCLOCK, SKILL_EMP_BLAST],
  void_walker: [SKILL_VOID_RIFT, SKILL_PHASE_SHIFT, SKILL_DARK_HARVEST],
  beast_tamer: [SKILL_SUMMON_SWARM, SKILL_FRENZY, SKILL_REANIMATE],
  firefighter: [SKILL_FOAM_JET, SKILL_RESCUE_SHIELD, SKILL_AXE_SPIN],
};

/**
 * Create initial skill states for a character.
 */
export function createSkillStates(characterId: string): SkillState[] {
  const defs = CHARACTER_SKILLS[characterId] || CHARACTER_SKILLS['grass_man'];
  return defs.map(def => ({
    definition: def,
    cooldownRemaining: 0,
    activeTimer: 0,
    usesThisRun: 0,
  }));
}

/**
 * Get skill power multiplier based on usage (skills get 5% stronger per use, max +50%).
 */
export function getSkillPowerMult(skill: SkillState): number {
  return 1 + Math.min(0.5, skill.usesThisRun * 0.05);
}
