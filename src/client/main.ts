/**
 * Pack Invaders — Client entry point.
 */

import { GameManager, GamePhase } from '../core/GameManager';
import { Renderer } from './Renderer';
import { InputHandler } from './InputHandler';
import { AudioManager } from './AudioManager';
import { isPaused } from './PauseState';
import { loadAllSprites } from './SpriteLoader';

let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D;
let game: GameManager;
let audio: AudioManager;
let renderer: Renderer;
let input: InputHandler;

try {
  canvas = document.getElementById('game') as HTMLCanvasElement;
  if (!canvas) throw new Error('Canvas element not found');

  // Fixed internal resolution — CSS stretches to fill window
  canvas.width = 1280;
  canvas.height = 720;

  ctx = canvas.getContext('2d')!;
  if (!ctx) throw new Error('Could not get 2D context');

  game = new GameManager('grass_man');
  audio = new AudioManager();
  renderer = new Renderer(ctx, canvas, game);
  input = new InputHandler(canvas, game, renderer, audio);
  renderer.inputHandler = input;

  // Load real sprite assets in background (non-blocking)
  loadAllSprites().then(sprites => {
    (renderer as any).loadedSprites = sprites;
    console.log(`Loaded: ${sprites.characters.size} chars, ${sprites.vendors.size} vendors, ${sprites.bosses.size} bosses`);
  }).catch(() => { /* Use procedural fallback */ });
} catch (err) {
  // Show error on screen if initialization fails
  const errCanvas = document.getElementById('game') as HTMLCanvasElement;
  if (errCanvas) {
    errCanvas.width = 1280;
    errCanvas.height = 720;
    const errCtx = errCanvas.getContext('2d');
    if (errCtx) {
      errCtx.fillStyle = '#000';
      errCtx.fillRect(0, 0, 1280, 720);
      errCtx.font = '20px monospace';
      errCtx.fillStyle = '#ef4444';
      errCtx.fillText('ERRO NA INICIALIZAÇÃO:', 50, 100);
      errCtx.font = '14px monospace';
      errCtx.fillStyle = '#fbbf24';
      errCtx.fillText(String(err), 50, 140);
      errCtx.fillStyle = '#94a3b8';
      errCtx.fillText('Verifique o console (F12) para mais detalhes.', 50, 180);
    }
  }
  console.error('Pack Invaders init error:', err);
  throw err;
}

let lastTime = performance.now();
let prevPhase: GamePhase = game.phase;
let prevEnemyCount = 0;
let lavaWarningCooldown = 0;
let prevFusionCount = 0;

function gameLoop(): void {
  const now = performance.now();
  const dt = Math.min((now - lastTime) / 1000, 0.05);
  lastTime = now;

  // Phase transition audio & effects
  if (game.phase !== prevPhase) {
    if (game.phase === 'COMBAT' || game.phase === 'COOP') {
      audio.waveStart();
      audio.setCombatAmbient(true);
      renderer.startWaveTransition(game.wave);
      prevEnemyCount = game.combat.state.enemies.length;
    }
    if (game.phase === 'CARDS') {
      audio.setCombatAmbient(false);
      renderer.startCardAnimation();
      audio.waveComplete();
      if (game.pendingCollectible) {
        setTimeout(() => audio.collectibleFound(), 500);
      }
    }
    if (game.phase === 'SHOP') {
      renderer.startShopAnimation();
    }
    if (game.phase === 'INVENTORY') {
      renderer.flashInventory();
      // Check for new item fusions
      const fusedItems = game.backpack.getAllItems().filter(i => (i.state as any).fusedName);
      const fusions = fusedItems.length;
      if (fusions > (prevFusionCount ?? 0)) {
        audio.collectibleFound(); // Reuse magical chime for fusion
        // Track new fusions and show popups
        for (const fi of fusedItems) {
          const fname = String((fi.state as any).fusedName);
          const fcolor = String((fi.state as any).fusionColor || '#f472b6');
          if (!game.stats.fusionsDiscovered.includes(fname)) {
            game.stats.fusionsDiscovered.push(fname);
          }
          renderer.showFusionNotif(fname, fcolor);
        }
      }
      prevFusionCount = fusions;
    }
    if (game.phase === 'MAIN_MENU' && !audio['ambientPlaying']) {
      audio.startAmbient();
    }
    if (game.phase === 'GAME_OVER') audio.gameOver();
    if (game.phase === 'VICTORY') audio.victory();
    prevPhase = game.phase;
  }

  // Combat updates
  if ((game.phase === 'COMBAT' || game.phase === 'COOP') && !isPaused()) {
    // Pass player direction to combat engine
    const playerDir = input.getPlayerDir();
    const p2Dir = game.phase === 'COOP' ? input.getP2Dir() : 0;
    game.combat.tick(dt, playerDir, p2Dir);
    game.updateSkills(dt);

    // Check dash input
    if (input.checkDash()) {
      game.combat.dash();
      audio.dash();
    }

    // COOP: P2 dash
    if (game.phase === 'COOP' && input.checkP2Dash()) {
      game.combat.dashP2();
      audio.dash();
    }

    // Check skill inputs (1, 2, 3 keys)
    const skillUsed = input.checkSkillInput();
    if (skillUsed >= 0) {
      if (game.useSkill(skillUsed)) {
        audio.comboMilestone();
        // Skill activation visual effects
        const sk = game.skills[skillUsed];
        const colors: Record<string, string> = {
          vine_burst: '#4ade80', photosynthesis_active: '#fbbf24', thorn_shield: '#22c55e',
          meteor: '#f97316', inferno_wave: '#ef4444', self_ignite: '#dc2626',
          tidal_wave: '#38bdf8', healing_rain: '#67e8f9', whirlpool: '#06b6d4',
          thunder_strike: '#facc15', overclock: '#eab308', emp_blast: '#fde047',
          void_rift: '#7c3aed', phase_shift: '#a78bfa', dark_harvest: '#4c1d95',
          summon_swarm: '#fbbf24', frenzy: '#ec4899', reanimate_skill: '#4ade80',
        };
        const skillColor = colors[sk.definition.id] || '#6366f1';
        renderer.spawnParticles(game.combat.state.playerX, 680, skillColor, 15);
        renderer.spawnParticles(game.combat.state.playerX, 680, '#ffffff', 5);
        // Expanding ring
        (renderer as any).spawnExplosion(game.combat.state.playerX, 680, 80, skillColor);
      }
    }

    // Check potion inputs (4, 5, 6 keys)
    const potionUsed = input.checkPotionInput();
    if (potionUsed >= 0) {
      if (game.usePotion(potionUsed)) {
        audio.collectibleFound();
        renderer.spawnParticles(game.combat.state.playerX, 680, '#4ade80', 8);
      }
    }

    // Twitch: update effects and process events
    if (game.twitch.connected) {
      game.twitch.update(dt);
      game.processTwitchEvents();

      // Apply speed multiplier to enemies
      if (game.twitch.speedMultiplier !== 1) {
        for (const e of game.combat.state.enemies) {
          // Speed is applied per-tick by modifying movement in CombatEngine
          // We handle it here as a simple multiplier
          e.y += e.speed * (game.twitch.speedMultiplier - 1) * dt;
        }
      }

      // Twitch shield: absorb one hit
      if (game.twitch.shieldActive && game.combat.state.playerFlashTimer > 0) {
        // Restore HP from damage just taken (approximate)
        game.combat.state.playerHp = Math.min(
          game.combat.state.playerMaxHp,
          game.combat.state.playerHp + 10
        );
        game.twitch.shieldActive = false;
        game.twitch.addNotification('Escudo absorveu dano!', '#6366f1');
      }
    }

    // Kill sound
    const currentEnemies = game.combat.state.enemies.length;
    if (currentEnemies < prevEnemyCount) {
      audio.kill();
      // Combo milestone sounds at 5, 10, 15, 20...
      if (game.combat.state.combo > 0 && game.combat.state.combo % 5 === 0) {
        audio.comboMilestone();
      }
    }
    prevEnemyCount = currentEnemies;

    // Boss killed effect (massive particle explosion)
    const bossEffect = (game.combat.state as any)._bossKilledEffect;
    if (bossEffect && bossEffect.timer > 0) {
      bossEffect.timer -= dt;
      if (bossEffect.timer > 0.8) {
        // Spawn explosion particles
        renderer.spawnParticles(bossEffect.x, bossEffect.y, '#fbbf24', 8);
        renderer.spawnParticles(bossEffect.x, bossEffect.y, '#ef4444', 5);
        renderer.spawnParticles(bossEffect.x, bossEffect.y, '#a855f7', 3);
      }
      if (bossEffect.timer <= 0) {
        (game.combat.state as any)._bossKilledEffect = null;
      }
    }

    // Low HP warning
    const hpPct = game.combat.state.playerHp / game.combat.state.playerMaxHp;
    lavaWarningCooldown -= dt;
    if (hpPct < 0.3 && lavaWarningCooldown <= 0) {
      audio.lavaWarning();
      lavaWarningCooldown = 3;
    }

    if (game.combat.state.waveCleared || game.combat.state.playerHp <= 0) {
      // Wave cleared celebration
      if (game.combat.state.waveCleared) {
        // Big burst of particles from player position
        renderer.spawnParticles(game.combat.state.playerX, 680, '#fbbf24', 20);
        renderer.spawnParticles(game.combat.state.playerX, 680, '#4ade80', 15);
        // Scattered confetti across screen
        for (let i = 0; i < 12; i++) {
          const px = Math.random() * 1280;
          const py = Math.random() * 400 + 100;
          const colors = ['#fbbf24', '#4ade80', '#6366f1', '#f97316', '#22d3ee'];
          renderer.spawnParticles(px, py, colors[i % colors.length], 2);
        }
        audio.waveComplete();
      }
      game.endCombat();
      const phaseAfterCombat = game.phase as GamePhase;
      // Show achievement notifications
      if (game.newAchievements.length > 0) {
        for (const achName of game.newAchievements) {
          renderer.showAchievementNotif(achName);
        }
        // Don't clear on GAME_OVER/VICTORY — renderGameOver() needs them for static panel
        if (phaseAfterCombat !== 'GAME_OVER' && phaseAfterCombat !== 'VICTORY') {
          game.newAchievements = [];
        }
      }
    }
  }

  // Real-time fusion tracking during shop/inventory (items can be placed anytime)
  if (game.phase === 'SHOP' || game.phase === 'INVENTORY') {
    const fusedNow = game.backpack.getAllItems().filter(i => (i.state as any).fusedName);
    const fusionNow = fusedNow.length;
    if (fusionNow > prevFusionCount) {
      audio.collectibleFound();
      for (const fi of fusedNow) {
        const fname = String((fi.state as any).fusedName);
        const fcolor = String((fi.state as any).fusionColor || '#f472b6');
        if (!game.stats.fusionsDiscovered.includes(fname)) {
          game.stats.fusionsDiscovered.push(fname);
        }
        renderer.showFusionNotif(fname, fcolor);
      }
    }
    prevFusionCount = fusionNow;
  }

  // ── Versus modes tick ─────────────────────────────────────────────────────
  if ((game.phase === 'VERSUS_SHIPS' || game.phase === 'VERSUS_PVP') && game.versusEngine) {
    const vs = game.versusEngine;
    const st = vs.state;

    if (st.phase === 'playing') {
      // P1 movement (WASD)
      const p1Dir = input.getVersusP1Dir();
      if (p1Dir !== 0) vs.moveP1(p1Dir, dt);

      // P2 movement (Arrow keys)
      const p2Dir = input.getVersusP2Dir();
      if (p2Dir !== 0) vs.moveP2(p2Dir, dt);

      // PvP fire on demand; Ships = auto-fire (handled in VersusEngine.tick)
      if (st.mode === 'pvp') {
        if (input.checkVersusP1Fire()) vs.tryFireP1();
        if (input.checkVersusP2Fire()) vs.tryFireP2();
      }

      vs.tick(dt);
    } else {
      // Result screen — R to reset, ESC to menu
      if (input.checkVersusReset()) vs.reset();
    }
  }

  // Twitch vote phase
  if (game.phase === 'TWITCH_VOTE') {
    game.twitch.update(dt);
    if (game.twitch.isVoteExpired()) {
      const result = game.twitch.endVote();
      game.twitchVoteResult = result;
      game.applyTwitchVoteResult(result.winner);
      game.cardChoices = game.generateCardChoices();
      game.phase = 'CARDS';
    }
  }

  // Render
  renderer.render();
  if (isPaused() && (game.phase === 'COMBAT' || game.phase === 'COOP' || game.phase === 'INVENTORY')) {
    renderer.renderPause();
  }
  requestAnimationFrame(gameLoop);
}

// Init audio context on first click (browser requirement)
canvas.addEventListener('click', () => {
  // AudioContext is lazily initialized inside AudioManager
  // Start ambient on first interaction
  audio.startAmbient();
}, { once: true });

requestAnimationFrame(gameLoop);
