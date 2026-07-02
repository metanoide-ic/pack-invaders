/**
 * Pack Invaders Renderer — draws backpack grid, combat arena, UI.
 * Now with: screen shake, explosions, trails, combo, boss glow,
 * wave progress, sell zone, title screen, card animations, rarity glow.
 * Fully responsive layout — all positions computed from canvas dimensions.
 */

import { GameManager } from '../core/GameManager';
import { generateAllSprites, SpriteSheet } from './SpriteGen';
import { ItemDefinition, getOccupiedCells } from '../core/ItemSystem';
import { InputHandler } from './InputHandler';
import { Enemy } from '../core/CombatEngine';
import { SaveManager } from '../core/SaveManager';
import { ALL_ACHIEVEMENTS, getUnlockedAchievements, getGlobalStats } from '../data/achievements';
import { ALL_MISSIONS, getMissionProgress, getClaimedMissions, getMetaGoldBonus, getClaimableMissionCount } from '../data/missions';
import { getDifficultyById } from '../data/difficulties';
import { getLeaderboard } from '../data/leaderboard';
import { renderPlanet } from './PlanetRenderer';
import { countPossibleCombinations, countPossibleBuffs, ALL_COMBINATIONS } from '../core/ItemCombinations';
import { ALL_ITEMS } from '../data/items';
import { CHARACTER_SKILLS } from '../core/SkillSystem';
import { getEquippedRelics, getCollectedRelics, ALL_RELICS } from '../data/relics';
import { getCharacterPortrait, getVendorPortrait, getBossPortrait } from './SpriteLoader';

export interface Layout {
  w: number; h: number; cell: number;
  gridX: number; gridY: number;
  gridW: number; gridH: number;
  panelX: number; panelY: number;
  cx: number; cy: number;
  btnY: number;
  sellZoneY: number;
  fontTitle: string;
  fontNormal: string;
  fontSmall: string;
  fontTiny: string;
  fontHuge: string;
}

interface Particle {
  x: number; y: number; vx: number; vy: number;
  life: number; maxLife: number; color: string; size: number;
}

interface Explosion {
  x: number; y: number;
  radius: number; maxRadius: number;
  life: number; maxLife: number;
  color: string;
}

export interface WaveTransition {
  wave: number;
  timer: number;
  duration: number;
}

/** Gold text popup for sell feedback */
interface GoldPopup {
  x: number; y: number; amount: number; life: number;
}

export class Renderer {
  mouseX = 0;
  mouseY = 0;
  inputHandler: InputHandler | null = null;
  waveTransition: WaveTransition | null = null;

  private sprites: SpriteSheet;
  private particles: Particle[] = [];
  private explosions: Explosion[] = [];
  private goldPopups: GoldPopup[] = [];
  private bgOffset = 0;
  private lastTime = 0;
  /** Track previous enemy count for death effects */
  private prevEnemyCount = 0;
  private prevEnemyPositions: Map<string, { x: number; y: number }> = new Map();
  /** Smooth HP bar */
  private displayHp = 100;
  /** Card entrance animation */
  private cardAnimTimer = 0;
  /** Inventory flash */
  private inventoryFlashTimer = 0;
  /** Title screen pulse */
  private titlePulse = 0;
  /** Codex tab index */
  codexTab = 0;
  /** Codex scroll offset */
  codexScroll = 0;
  /** Codex selected entry index (-1 = none) */
  codexSelectedEntry = -1;
  /** Shop item fade-in timer */
  private shopAnimTimer = 0;
  /** Vendor feedback phrase (buy/broke) */
  vendorFeedback: string = '';
  vendorFeedbackTimer: number = 0;
  /** Menu hover animation timer */
  private menuFloatTimer = 0;
  /** Achievement notification queue */
  private achievementNotifs: { name: string; timer: number }[] = [];
  /** Fusion activation popup queue */
  private fusionPopups: { name: string; color: string; timer: number }[] = [];
  /** Phase transition fade (0 = none, decreasing from 0.4) */
  phaseTransitionTimer = 0;

  constructor(
    private ctx: CanvasRenderingContext2D,
    private canvas: HTMLCanvasElement,
    private game: GameManager
  ) {
    this.sprites = generateAllSprites();
    this.lastTime = performance.now();
  }

  /** Compute responsive layout from current canvas dimensions */
  getLayout(): Layout {
    const w = this.canvas.width;
    const h = this.canvas.height;
    const cell = Math.floor(Math.min(w * 0.055, h * 0.09, 56));
    const cols = this.game.backpack.cols;
    const rows = this.game.backpack.rows;
    const gridW = cols * cell;
    const gridH = rows * cell;
    const gridX = Math.floor(w * 0.03);
    const gridY = Math.floor(h * 0.12);
    return {
      w, h, cell,
      gridX, gridY, gridW, gridH,
      panelX: gridX + gridW + Math.floor(w * 0.03),
      panelY: gridY,
      cx: Math.floor(w / 2),
      cy: Math.floor(h / 2),
      btnY: Math.floor(h * 0.85),
      sellZoneY: Math.floor(h * 0.88),
      fontTitle: `bold ${Math.floor(h * 0.04)}px monospace`,
      fontNormal: `${Math.floor(h * 0.022)}px monospace`,
      fontSmall: `${Math.floor(h * 0.017)}px monospace`,
      fontTiny: `${Math.floor(h * 0.013)}px monospace`,
      fontHuge: `bold ${Math.floor(h * 0.06)}px monospace`,
    };
  }

  /** Spawn gold popup text (for sell feedback) */
  spawnGoldText(x: number, y: number, amount: number): void {
    this.goldPopups.push({ x, y, amount, life: 1.2 });
  }

  /** Start a wave transition overlay */
  startWaveTransition(wave: number): void {
    this.waveTransition = { wave, timer: 0, duration: 1.5 };
  }

  /** Trigger inventory flash */
  flashInventory(): void {
    this.inventoryFlashTimer = 0.3;
  }

  /** Start card entrance animation */
  startCardAnimation(): void {
    this.cardAnimTimer = 0;
  }

  /** Start shop fade-in animation */
  startShopAnimation(): void {
    this.shopAnimTimer = 0;
  }

  /** Show vendor buy/broke feedback */
  showVendorFeedback(text: string): void {
    this.vendorFeedback = text;
    this.vendorFeedbackTimer = 2.5;
  }

  render(): void {
    const { ctx, canvas, game } = this;
    const now = performance.now();
    const dt = Math.min((now - this.lastTime) / 1000, 0.05);
    this.lastTime = now;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply screen shake
    const state = game.combat.state;
    let shakeX = 0;
    let shakeY = 0;
    if (state.shakeDuration > 0 && state.shakeTimer < state.shakeDuration && localStorage.getItem('packinvaders_shake') !== 'off') {
      const decay = 1 - state.shakeTimer / state.shakeDuration;
      shakeX = (Math.random() - 0.5) * state.shakeIntensity * decay * 2;
      shakeY = (Math.random() - 0.5) * state.shakeIntensity * decay * 2;
    }

    ctx.save();
    ctx.translate(shakeX, shakeY);

    this.renderBackground(dt);

    switch (game.phase) {
      case 'SPLASH': this.renderSplash(dt); break;
      case 'MAIN_MENU': this.renderMainMenu(dt); break;
      case 'SAVE_SELECT': this.renderSaveSelect(dt); break;
      case 'CREDITS': this.renderCredits(dt); break;
      case 'ACHIEVEMENTS': this.renderAchievements(dt); break;
      case 'MISSIONS': this.renderMissions(dt); break;
      case 'TITLE': this.renderTitle(dt); break;
      case 'INVENTORY': this.renderInventory(dt); break;
      case 'COMBAT': this.renderCombat(dt); break;
      case 'CARDS': this.renderCards(dt); break;
      case 'SHOP': this.renderShop(dt); break;
      case 'GAME_OVER': this.renderGameOver(false); break;
      case 'VICTORY': this.renderGameOver(true); break;
      case 'CODEX': this.renderCodex(); break;
      case 'TWITCH_VOTE': this.renderTwitchVote(dt); break;
      case 'SETTINGS': this.renderSettings(); break;
      case 'EXTRA_MODES': this.renderExtraModes(); break;
      case 'COOP': this.renderCombat(dt); break;
      case 'VERSUS_SHIPS': this.renderVersusShips(dt); break;
      case 'VERSUS_PVP': this.renderVersusPvp(dt); break;
    }

    this.updateAndRenderParticles(dt);
    this.updateAndRenderExplosions(dt);
    this.renderGoldPopups(dt);
    this.renderWaveTransition(dt);
    this.renderHeldItem();
    this.renderTwitchNotifications(dt);
    this.renderTwitchStatus();
    this.renderControlsOverlay(dt);
    this.renderAchievementNotifs(dt);
    this.renderFusionPopups(dt);
    this.renderTwitchInput();

    // Phase transition fade overlay
    if (this.phaseTransitionTimer > 0) {
      this.phaseTransitionTimer -= dt;
      const fadeAlpha = this.phaseTransitionTimer / 0.3;
      ctx.globalAlpha = fadeAlpha * 0.6;
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      ctx.globalAlpha = 1;
    }

    ctx.restore();
  }

  // ─── Splash Screen ──────────────────────────────────────────────────────────

  private renderSplash(dt: number): void {
    const { ctx, canvas } = this;
    const L = this.getLayout();
    this.titlePulse += dt;

    // Black background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Animated tiny stars
    for (let i = 0; i < 30; i++) {
      const sx = (Math.sin(i * 3.7 + this.titlePulse * 0.2) * 0.5 + 0.5) * canvas.width;
      const sy = (Math.cos(i * 2.3 + this.titlePulse * 0.15) * 0.5 + 0.5) * canvas.height;
      const alpha = 0.2 + Math.sin(this.titlePulse * 2 + i) * 0.15;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(sx, sy, 1, 1);
    }
    ctx.globalAlpha = 1;

    // Title with gentle float
    const floatY = Math.sin(this.titlePulse * 1.5) * 4;
    ctx.font = `bold ${Math.floor(L.h * 0.07)}px monospace`;
    ctx.fillStyle = '#fbbf24';
    ctx.textAlign = 'center';
    ctx.fillText('PACK INVADERS', L.cx, Math.floor(L.h * 0.38) + floatY);

    // Subtitle
    ctx.font = `${Math.floor(L.h * 0.016)}px monospace`;
    ctx.fillStyle = '#6366f1';
    ctx.fillText('Organize. Funda. Destrua.', L.cx, Math.floor(L.h * 0.46));

    // Pulsing text
    const alpha = 0.3 + Math.sin(this.titlePulse * 3) * 0.4;
    ctx.globalAlpha = alpha;
    ctx.font = `${Math.floor(L.h * 0.015)}px monospace`;
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('Pressione qualquer tecla', L.cx, Math.floor(L.h * 0.62));
    ctx.globalAlpha = 1;

    // Credits at bottom
    ctx.font = `${Math.floor(L.h * 0.01)}px monospace`;
    ctx.fillStyle = '#374151';
    ctx.fillText('João Paulo Leal — 2024', L.cx, Math.floor(L.h * 0.92));
    ctx.textAlign = 'left';
  }

  // ─── Main Menu ─────────────────────────────────────────────────────────────

  private renderMainMenu(dt: number): void {
    const { ctx, canvas } = this;
    const L = this.getLayout();
    this.titlePulse += dt;
    this.menuFloatTimer += dt;

    // ─── Background: real sprite or dark fallback ────────────────────────
    const loadedSpritesMenu = (this as any).loadedSprites;
    const menuBg = loadedSpritesMenu?.menuBg as HTMLImageElement | null;

    if (menuBg) {
      const imgW = menuBg.naturalWidth || menuBg.width;
      const imgH = menuBg.naturalHeight || menuBg.height;
      const scale = Math.max(canvas.width / imgW, canvas.height / imgH);
      const drawW = imgW * scale;
      const drawH = imgH * scale;
      const offX = (canvas.width - drawW) / 2;
      const offY = (canvas.height - drawH) / 2;
      ctx.drawImage(menuBg, offX, offY, drawW, drawH);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
      ctx.fillStyle = '#030308';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      // Procedural starfield
      const nowMs = performance.now();
      const seed = 12345;
      const starCount = 90;
      for (let s = 0; s < starCount; s++) {
        const sx = ((seed * (s * 7919 + 1)) % canvas.width + canvas.width) % canvas.width;
        const sy = ((seed * (s * 3571 + 13)) % canvas.height + canvas.height) % canvas.height;
        const twinkle = 0.25 + Math.abs(Math.sin(nowMs * 0.001 * (0.3 + (s % 7) * 0.1) + s)) * 0.75;
        const r = 0.5 + (s % 3) * 0.5;
        ctx.globalAlpha = twinkle * 0.7;
        ctx.fillStyle = s % 5 === 0 ? '#a5b4fc' : s % 3 === 0 ? '#fbbf24' : '#ffffff';
        ctx.beginPath();
        ctx.arc(sx, sy, r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      // Subtle vignette
      const vgr = ctx.createRadialGradient(L.cx, L.cy, L.h * 0.1, L.cx, L.cy, L.h * 0.75);
      vgr.addColorStop(0, 'transparent');
      vgr.addColorStop(1, 'rgba(0,0,0,0.6)');
      ctx.fillStyle = vgr;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // ─── Character idle bounce (Castle Crashers style) ───────────────────
    const charSpriteIds = ['raiz', 'favil', 'pelagia', 'arco', 'barathro', 'nex'];
    const charSprites = loadedSpritesMenu?.characters as Map<string, HTMLImageElement> | undefined;
    if (charSprites && charSprites.size > 0) {
      const charCount = Math.min(charSprites.size, 4);
      const charStartX = Math.floor(L.w * 0.50);
      const charSpacing = Math.floor(L.w * 0.12);
      const charY = Math.floor(L.h * 0.35);
      const charH = Math.floor(L.h * 0.50);

      for (let i = 0; i < charCount; i++) {
        const sprId = charSpriteIds[i];
        const spr = charSprites.get(sprId);
        if (!spr) continue;

        // Castle Crashers bounce: each char bounces at different phase
        const bouncePhase = this.menuFloatTimer * 2.5 + i * 1.2;
        const bounceY = Math.abs(Math.sin(bouncePhase)) * 12;
        // Slight squash and stretch
        const squash = 1 + Math.sin(bouncePhase) * 0.03;
        const stretch = 1 - Math.sin(bouncePhase) * 0.02;

        const cx = charStartX + i * charSpacing;
        const cy = charY - bounceY;
        const drawH2 = Math.floor(charH * squash);
        const drawW2 = Math.floor(charH * 0.5 * stretch);

        ctx.save();
        ctx.globalAlpha = 0.9;
        ctx.drawImage(spr, cx - drawW2 / 2, cy, drawW2, drawH2);
        ctx.restore();

        // Shadow below character
        ctx.globalAlpha = 0.2;
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.ellipse(cx, charY + charH + 5, drawW2 * 0.4, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }

    // ─── Left panel (semi-transparent) ───────────────────────────────────
    const panelW = Math.floor(L.w * 0.35);
    ctx.fillStyle = 'rgba(3, 3, 12, 0.88)';
    ctx.fillRect(0, 0, panelW, canvas.height);
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(panelW, 0);
    ctx.lineTo(panelW, canvas.height);
    ctx.stroke();

    // ─── Title ───────────────────────────────────────────────────────────
    const titleX = Math.floor(panelW * 0.1);
    const floatY = Math.sin(this.menuFloatTimer * 1.1) * 3;
    const titleGlow = 8 + Math.sin(this.menuFloatTimer * 1.8) * 5;
    ctx.shadowColor = '#fbbf24';
    ctx.shadowBlur = titleGlow;
    ctx.font = `bold ${Math.floor(L.h * 0.056)}px monospace`;
    ctx.fillStyle = '#fbbf24';
    ctx.textAlign = 'left';
    ctx.fillText('PACK', titleX, Math.floor(L.h * 0.115) + floatY);
    ctx.shadowColor = '#f97316';
    ctx.shadowBlur = titleGlow * 0.7;
    ctx.fillStyle = '#fb923c';
    ctx.fillText('INVADERS', titleX, Math.floor(L.h * 0.178) + floatY);
    ctx.shadowBlur = 0;

    ctx.font = `${Math.floor(L.h * 0.011)}px monospace`;
    ctx.fillStyle = '#4b5563';
    ctx.fillText('Mochila  ◆  Roguelike  ◆  Arcade', titleX, Math.floor(L.h * 0.215));

    // ─── Menu buttons ────────────────────────────────────────────────────
    const menuItems = ['JOGAR', 'MODOS EXTRAS', 'ARQUIVO', 'CONQUISTAS', 'MISSÕES', 'CONTROLES', 'OPÇÕES', 'CRÉDITOS', 'SAIR'];
    const btnW = Math.floor(panelW * 0.8);
    const btnH = Math.floor(L.h * 0.05);
    const btnX = titleX;
    const startY = Math.floor(L.h * 0.30);
    const gap = Math.floor(L.h * 0.065);
    const claimableCount = getClaimableMissionCount();

    for (let i = 0; i < menuItems.length; i++) {
      const y = startY + i * gap;
      const isHover = this.mouseX >= btnX && this.mouseX <= btnX + btnW &&
                      this.mouseY >= y && this.mouseY <= y + btnH;
      const isKeySelected = ((this as any)._menuSelectedIdx ?? 0) === i;
      const isActive = isHover || isKeySelected;

      if (isActive) {
        ctx.fillStyle = 'rgba(99, 102, 241, 0.15)';
        ctx.fillRect(btnX - 5, y, btnW + 10, btnH);
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(btnX - 5, y, 3, btnH);
      }

      ctx.font = i === 0 ? `bold ${Math.floor(L.h * 0.02)}px monospace` : `${Math.floor(L.h * 0.016)}px monospace`;
      ctx.fillStyle = i === 0 ? '#fbbf24' : isActive ? '#e2e8f0' : '#94a3b8';
      ctx.textAlign = 'left';
      ctx.fillText(menuItems[i], btnX + 8, y + btnH * 0.65);

      // Badge for claimable missions on the MISSÕES item
      if (menuItems[i] === 'MISSÕES' && claimableCount > 0) {
        const textW = ctx.measureText(menuItems[i]).width;
        const badgeX = btnX + 8 + textW + 8;
        const badgeY = y + btnH * 0.5;
        const badgeR = Math.floor(L.h * 0.012);
        const pulse = 0.7 + Math.sin(this.titlePulse * 3) * 0.3;
        ctx.save();
        ctx.globalAlpha = pulse;
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(badgeX + badgeR, badgeY, badgeR, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.font = `bold ${Math.floor(L.h * 0.011)}px monospace`;
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText(String(claimableCount), badgeX + badgeR, badgeY + Math.floor(L.h * 0.004));
        ctx.textAlign = 'left';
        ctx.restore();
      }
    }

    // Version
    ctx.font = `${Math.floor(L.h * 0.009)}px monospace`;
    ctx.fillStyle = '#1e293b';
    ctx.fillText('v1.0 — 2024', titleX, L.h - Math.floor(L.h * 0.025));
  }

  // ─── Save Select ──────────────────────────────────────────────────────────

  private renderSaveSelect(dt: number): void {
    const { ctx, canvas } = this;
    const L = this.getLayout();
    this.menuFloatTimer += dt;

    ctx.fillStyle = '#050510';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = L.fontTitle;
    ctx.fillStyle = '#fbbf24';
    ctx.textAlign = 'center';
    ctx.fillText('SELECIONE UM SAVE', L.cx, Math.floor(L.h * 0.08));
    ctx.font = `${Math.floor(L.h * 0.012)}px monospace`;
    ctx.fillStyle = '#64748b';
    ctx.fillText('Clique em um slot vazio para novo jogo, ou em um existente para continuar', L.cx, Math.floor(L.h * 0.12));
    ctx.textAlign = 'left';

    // Character name lookup
    const charNames: Record<string, string> = {
      grass_man: 'Romulo', fire_lord: 'Kagutsuchi', aqua_sage: 'Mazu',
      storm_runner: 'Frank', void_walker: 'Dr. Eon', beast_tamer: 'Diana', firefighter: 'Florian',
    };

    // 4 Save slot cards
    const slotW = Math.floor(L.w * 0.2);
    const slotH = Math.floor(L.h * 0.5);
    const slotGap = Math.floor(L.w * 0.02);
    const totalW = 4 * slotW + 3 * slotGap;
    const startX = (L.w - totalW) / 2;
    const slotY = Math.floor(L.h * 0.18);

    const slots = SaveManager.getSlots();

    for (let i = 0; i < 4; i++) {
      const x = startX + i * (slotW + slotGap);
      const slot = slots[i];
      const isHover = this.mouseX >= x && this.mouseX <= x + slotW &&
                      this.mouseY >= slotY && this.mouseY <= slotY + slotH;

      // Card background
      ctx.fillStyle = isHover ? '#12122a' : '#0a0a18';
      ctx.fillRect(x, slotY, slotW, slotH);

      // Border with glow on hover
      if (isHover) {
        ctx.shadowColor = slot.exists ? '#6366f1' : '#4ade80';
        ctx.shadowBlur = 8;
      }
      ctx.strokeStyle = slot.exists ? '#6366f1' : '#374151';
      ctx.lineWidth = isHover ? 2 : 1;
      ctx.strokeRect(x, slotY, slotW, slotH);
      ctx.shadowBlur = 0;

      // Top accent bar
      ctx.fillStyle = slot.exists ? '#6366f1' : '#1e293b';
      ctx.fillRect(x, slotY, slotW, 3);

      ctx.textAlign = 'center';
      ctx.font = `bold ${Math.floor(L.h * 0.018)}px monospace`;
      ctx.fillStyle = '#a78bfa';
      ctx.fillText(`SLOT ${i + 1}`, x + slotW / 2, slotY + Math.floor(slotH * 0.08));

      if (slot.exists) {
        // Character name (display name, not ID)
        const displayName = charNames[slot.characterId] || slot.characterId;
        ctx.font = `bold ${Math.floor(L.h * 0.016)}px monospace`;
        ctx.fillStyle = '#e2e8f0';
        ctx.fillText(displayName, x + slotW / 2, slotY + Math.floor(slotH * 0.18));

        // Character title
        ctx.font = `${Math.floor(L.h * 0.010)}px monospace`;
        ctx.fillStyle = '#64748b';
        ctx.fillText(`(${slot.characterId})`, x + slotW / 2, slotY + Math.floor(slotH * 0.24));

        // Stats
        ctx.font = `${Math.floor(L.h * 0.012)}px monospace`;
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(`Ano ${slot.year} — Mês ${slot.month}`, x + slotW / 2, slotY + Math.floor(slotH * 0.35));
        ctx.fillStyle = '#fbbf24';
        ctx.fillText(`💰 ${slot.gold} gold`, x + slotW / 2, slotY + Math.floor(slotH * 0.44));
        ctx.fillStyle = '#6366f1';
        ctx.fillText(`📦 ${slot.itemCount} itens`, x + slotW / 2, slotY + Math.floor(slotH * 0.53));
        ctx.fillStyle = '#4ade80';
        ctx.fillText(`${slot.totalMonths} meses jogados`, x + slotW / 2, slotY + Math.floor(slotH * 0.62));

        if (slot.aliencore) {
          ctx.fillStyle = '#ef4444';
          ctx.font = `bold ${Math.floor(L.h * 0.011)}px monospace`;
          ctx.fillText('⚠ ALIENCORE', x + slotW / 2, slotY + Math.floor(slotH * 0.72));
        }

        // Action hint
        ctx.font = `${Math.floor(L.h * 0.009)}px monospace`;
        ctx.fillStyle = '#475569';
        ctx.fillText('Clique para continuar', x + slotW / 2, slotY + Math.floor(slotH * 0.82));

        // Delete button
        const delBtnH = Math.floor(L.h * 0.04);
        const delBtnY2 = slotY + slotH - delBtnH - 8;
        const delBtnW = Math.floor(slotW * 0.55);
        const delBtnX = x + (slotW - delBtnW) / 2;
        const isDelHover = this.mouseX >= delBtnX && this.mouseX <= delBtnX + delBtnW &&
                           this.mouseY >= delBtnY2 && this.mouseY <= delBtnY2 + delBtnH;
        const isConfirming = !!(this.inputHandler as any)?.[`_deleteConfirm_${i}`];
        ctx.fillStyle = isConfirming ? '#dc2626' : isDelHover ? '#991b1b' : '#7f1d1d';
        ctx.fillRect(delBtnX, delBtnY2, delBtnW, delBtnH);
        ctx.strokeStyle = isConfirming ? '#fbbf24' : '#ef4444';
        ctx.lineWidth = isConfirming ? 2 : 1;
        ctx.strokeRect(delBtnX, delBtnY2, delBtnW, delBtnH);
        ctx.font = `bold ${Math.floor(L.h * 0.011)}px monospace`;
        ctx.fillStyle = isConfirming ? '#fbbf24' : '#ffffff';
        ctx.fillText(isConfirming ? 'CONFIRMAR?' : 'DELETAR', delBtnX + delBtnW / 2, delBtnY2 + delBtnH * 0.7);
      } else {
        // Empty slot
        ctx.font = `${Math.floor(L.h * 0.04)}px monospace`;
        ctx.fillStyle = '#1e293b';
        ctx.fillText('+', x + slotW / 2, slotY + Math.floor(slotH * 0.4));
        ctx.font = `${Math.floor(L.h * 0.014)}px monospace`;
        ctx.fillStyle = '#475569';
        ctx.fillText('Vazio', x + slotW / 2, slotY + Math.floor(slotH * 0.52));
        ctx.font = `${Math.floor(L.h * 0.010)}px monospace`;
        ctx.fillStyle = '#374151';
        ctx.fillText('Clique para novo jogo', x + slotW / 2, slotY + Math.floor(slotH * 0.60));
      }
    }

    // Back button
    ctx.textAlign = 'left';
    const backBtnW = Math.floor(L.w * 0.12);
    const backBtnH = Math.floor(L.h * 0.05);
    this.renderButton(Math.floor(L.w * 0.03), L.h - Math.floor(L.h * 0.08), backBtnW, backBtnH, '← VOLTAR', '#374151');
  }

  // ─── Credits ──────────────────────────────────────────────────────────────

  private renderCredits(dt: number): void {
    const { ctx, canvas } = this;
    const L = this.getLayout();
    this.menuFloatTimer += dt;

    // Background: menu bg with dark overlay, or deep space fallback
    const loadedSprites = (this as any).loadedSprites;
    const menuBg = loadedSprites?.menuBg as HTMLImageElement | null;
    if (menuBg) {
      const imgW = menuBg.naturalWidth || menuBg.width;
      const imgH = menuBg.naturalHeight || menuBg.height;
      const scale = Math.max(canvas.width / imgW, canvas.height / imgH);
      ctx.drawImage(menuBg, (canvas.width - imgW * scale) / 2, (canvas.height - imgH * scale) / 2, imgW * scale, imgH * scale);
      ctx.fillStyle = 'rgba(3,3,12,0.82)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
      ctx.fillStyle = '#050510';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Animated star field
    if (!(this as any)._creditStars) {
      (this as any)._creditStars = Array.from({ length: 80 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.5 + 0.3,
        speed: Math.random() * 0.15 + 0.05,
      }));
    }
    const stars: { x: number; y: number; r: number; speed: number }[] = (this as any)._creditStars;
    for (const s of stars) {
      s.y += s.speed;
      if (s.y > canvas.height) { s.y = 0; s.x = Math.random() * canvas.width; }
      const alpha = 0.4 + Math.sin(this.menuFloatTimer * s.speed * 8 + s.x) * 0.3;
      ctx.globalAlpha = Math.max(0.1, alpha);
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Title with glow
    const floatY = Math.sin(this.menuFloatTimer * 0.9) * 4;
    ctx.textAlign = 'center';
    ctx.shadowColor = '#fbbf24';
    ctx.shadowBlur = 18 + Math.sin(this.menuFloatTimer * 1.5) * 6;
    ctx.font = L.fontHuge;
    ctx.fillStyle = '#fbbf24';
    ctx.fillText('PACK INVADERS', L.cx, Math.floor(L.h * 0.14) + floatY);
    ctx.shadowBlur = 0;

    ctx.font = `${Math.floor(L.h * 0.012)}px monospace`;
    ctx.fillStyle = '#475569';
    ctx.fillText('Mochila • Roguelike • Arcade', L.cx, Math.floor(L.h * 0.20) + floatY);

    // Divider line
    const lineW = Math.floor(L.w * 0.35);
    const lineY = Math.floor(L.h * 0.255);
    ctx.strokeStyle = 'rgba(99,102,241,0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(L.cx - lineW / 2, lineY);
    ctx.lineTo(L.cx + lineW / 2, lineY);
    ctx.stroke();

    // Credits sections
    const sections: { label: string; color: string; lines: string[] }[] = [
      {
        label: 'DESENVOLVIMENTO',
        color: '#6366f1',
        lines: ['João Paulo Leal', 'Código, design e game design'],
      },
      {
        label: 'ARTE & NARRATIVA',
        color: '#f472b6',
        lines: ['Sprites procedurais e retratos por IA', 'Lore original em português'],
      },
      {
        label: 'ÁUDIO',
        color: '#4ade80',
        lines: ['Sintetizador Web Audio API', 'Todos os sons gerados proceduralmente'],
      },
      {
        label: 'AGRADECIMENTOS',
        color: '#fbbf24',
        lines: ['Família, amigos e testadores', 'Comunidade roguelike brasileira'],
      },
    ];

    const sectionGapX = Math.floor(L.w * 0.25);
    const col0 = L.cx - sectionGapX;
    const col1 = L.cx + sectionGapX;
    const row0Y = Math.floor(L.h * 0.33);
    const row1Y = Math.floor(L.h * 0.57);
    const positions = [
      { x: col0, y: row0Y }, { x: col1, y: row0Y },
      { x: col0, y: row1Y }, { x: col1, y: row1Y },
    ];

    for (let si = 0; si < sections.length; si++) {
      const sec = sections[si];
      const pos = positions[si];
      const sectionFloat = Math.sin(this.menuFloatTimer * 0.7 + si * 0.9) * 2;

      ctx.font = `bold ${Math.floor(L.h * 0.012)}px monospace`;
      ctx.fillStyle = sec.color;
      ctx.fillText(sec.label, pos.x, pos.y + sectionFloat);

      ctx.font = `${Math.floor(L.h * 0.015)}px monospace`;
      ctx.fillStyle = '#e2e8f0';
      ctx.fillText(sec.lines[0], pos.x, pos.y + Math.floor(L.h * 0.038) + sectionFloat);

      ctx.font = `${Math.floor(L.h * 0.011)}px monospace`;
      ctx.fillStyle = '#64748b';
      ctx.fillText(sec.lines[1], pos.x, pos.y + Math.floor(L.h * 0.058) + sectionFloat);
    }

    // Bottom tagline
    ctx.font = `${Math.floor(L.h * 0.013)}px monospace`;
    ctx.fillStyle = '#334155';
    ctx.fillText('Feito com TypeScript + Canvas 2D', L.cx, Math.floor(L.h * 0.83));
    ctx.fillStyle = '#6366f1';
    ctx.fillText('Brasil, 2025', L.cx, Math.floor(L.h * 0.87));

    // Back button
    const backBtnW = Math.floor(L.w * 0.12);
    const backBtnH = Math.floor(L.h * 0.05);
    this.renderButton(L.cx - backBtnW / 2, Math.floor(L.h * 0.92), backBtnW, backBtnH, '← VOLTAR', '#374151');

    ctx.textAlign = 'left';
  }

  // ─── Achievements ──────────────────────────────────────────────────────────

  private renderMissions(_dt: number): void {
    const { ctx, canvas } = this;
    const L = this.getLayout();

    ctx.fillStyle = '#06060f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Title
    ctx.font = `bold ${Math.floor(L.h * 0.04)}px monospace`;
    ctx.fillStyle = '#fbbf24';
    ctx.textAlign = 'center';
    ctx.fillText('🎯 MISSÕES', L.cx, Math.floor(L.h * 0.06));
    ctx.font = `${Math.floor(L.h * 0.014)}px monospace`;
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`Bônus de gold inicial acumulado: +${getMetaGoldBonus()}g por run`, L.cx, Math.floor(L.h * 0.095));
    ctx.textAlign = 'left';

    const stats = getGlobalStats();
    const claimed = getClaimedMissions();
    const listX = Math.floor(L.w * 0.12);
    const listW = Math.floor(L.w * 0.76);
    const startY = Math.floor(L.h * 0.135);
    const rowH = Math.floor(L.h * 0.058);
    const gap = Math.floor(L.h * 0.004);
    const claimW = Math.floor(L.w * 0.13);
    const claimH = Math.floor(rowH * 0.7);

    for (let i = 0; i < ALL_MISSIONS.length; i++) {
      const m = ALL_MISSIONS[i];
      const prog = getMissionProgress(m, stats);
      const isClaimed = claimed.has(m.id);
      const rowY = startY + i * (rowH + gap);

      // Row background
      ctx.fillStyle = isClaimed ? 'rgba(20,40,24,0.6)' : (prog.complete ? 'rgba(42,34,8,0.75)' : 'rgba(14,14,24,0.7)');
      ctx.fillRect(listX, rowY, listW, rowH);
      ctx.strokeStyle = isClaimed ? 'rgba(34,197,94,0.4)' : (prog.complete ? '#fbbf24' : '#1e293b');
      ctx.lineWidth = 1;
      ctx.strokeRect(listX, rowY, listW, rowH);

      // Icon
      ctx.font = `${Math.floor(rowH * 0.5)}px monospace`;
      ctx.fillStyle = '#e2e8f0';
      ctx.textAlign = 'center';
      ctx.fillText(m.icon, listX + Math.floor(rowH * 0.55), rowY + rowH * 0.64);

      // Name + description
      ctx.textAlign = 'left';
      ctx.font = `bold ${Math.floor(L.h * 0.014)}px monospace`;
      ctx.fillStyle = isClaimed ? '#86efac' : '#e2e8f0';
      ctx.fillText(m.name, listX + Math.floor(rowH * 1.1), rowY + rowH * 0.42);
      ctx.font = `${Math.floor(L.h * 0.0108)}px monospace`;
      ctx.fillStyle = '#64748b';
      ctx.fillText(`${m.description}   ★ +${m.rewardGold}g inicial`, listX + Math.floor(rowH * 1.1), rowY + rowH * 0.8);

      // Progress bar
      const barX = listX + Math.floor(listW * 0.46);
      const barW = Math.floor(listW * 0.26);
      const barY = rowY + rowH * 0.5 - 3;
      ctx.fillStyle = '#0f1420';
      ctx.fillRect(barX, barY, barW, 8);
      ctx.fillStyle = prog.complete ? '#22c55e' : '#6366f1';
      ctx.fillRect(barX, barY, Math.floor(barW * prog.pct), 8);
      ctx.font = `${Math.floor(L.h * 0.0098)}px monospace`;
      ctx.fillStyle = '#94a3b8';
      ctx.textAlign = 'center';
      ctx.fillText(`${Math.min(prog.value, m.goal)}/${m.goal}`, barX + barW / 2, barY - 3);
      ctx.textAlign = 'left';

      // Claim button / status
      const cx = listX + listW - claimW - 8;
      const cy = rowY + (rowH - claimH) / 2;
      if (isClaimed) {
        ctx.fillStyle = '#14532d';
        ctx.fillRect(cx, cy, claimW, claimH);
        ctx.fillStyle = '#86efac';
        ctx.font = `bold ${Math.floor(L.h * 0.012)}px monospace`;
        ctx.textAlign = 'center';
        ctx.fillText('✓ COLETADO', cx + claimW / 2, cy + claimH * 0.65);
      } else if (prog.complete) {
        const pulse = 0.55 + Math.sin(performance.now() * 0.005) * 0.3;
        ctx.globalAlpha = pulse;
        ctx.shadowColor = '#fbbf24';
        ctx.shadowBlur = 8;
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(cx, cy, claimW, claimH);
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
        ctx.fillStyle = '#000000';
        ctx.font = `bold ${Math.floor(L.h * 0.013)}px monospace`;
        ctx.textAlign = 'center';
        ctx.fillText('COLETAR', cx + claimW / 2, cy + claimH * 0.65);
      } else {
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(cx, cy, claimW, claimH);
        ctx.fillStyle = '#475569';
        ctx.font = `${Math.floor(L.h * 0.011)}px monospace`;
        ctx.textAlign = 'center';
        ctx.fillText('Em progresso', cx + claimW / 2, cy + claimH * 0.65);
      }
      ctx.textAlign = 'left';
    }

    // Back button
    this.renderButton(Math.floor(L.w * 0.03), L.h - Math.floor(L.h * 0.08), Math.floor(L.w * 0.12), Math.floor(L.h * 0.05), '◀ VOLTAR', '#374151');
  }

  private renderAchievements(dt: number): void {
    const { ctx, canvas } = this;
    const L = this.getLayout();
    this.menuFloatTimer += dt;

    ctx.fillStyle = '#050510';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = L.fontTitle;
    ctx.fillStyle = '#fbbf24';
    ctx.textAlign = 'center';
    ctx.fillText('🏆 CONQUISTAS', L.cx, Math.floor(L.h * 0.06));

    const unlocked = getUnlockedAchievements();
    const progress = unlocked.size / ALL_ACHIEVEMENTS.length;
    ctx.font = L.fontSmall;
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`${unlocked.size}/${ALL_ACHIEVEMENTS.length} desbloqueadas`, L.cx, Math.floor(L.h * 0.095));

    // Progress bar
    const barW = Math.floor(L.w * 0.25);
    const barX = L.cx - barW / 2;
    const barY = Math.floor(L.h * 0.105);
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(barX, barY, barW, 6);
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(barX, barY, barW * progress, 6);
    ctx.textAlign = 'left';

    // Grid of achievements
    const cols = 3;
    const achW = Math.floor(L.w * 0.28);
    const achH = Math.floor(L.h * 0.095);
    const gap = Math.floor(L.w * 0.02);
    const startX = (L.w - cols * achW - (cols - 1) * gap) / 2;
    const startY = Math.floor(L.h * 0.14);

    for (let i = 0; i < ALL_ACHIEVEMENTS.length; i++) {
      const ach = ALL_ACHIEVEMENTS[i];
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * (achW + gap);
      const y = startY + row * (achH + 6);

      if (y + achH > L.h - Math.floor(L.h * 0.1)) break;

      const isUnlocked = unlocked.has(ach.id);

      // Card background
      ctx.fillStyle = isUnlocked ? 'rgba(20, 35, 20, 0.9)' : 'rgba(12, 12, 20, 0.8)';
      ctx.fillRect(x, y, achW, achH);

      // Left accent bar (gold if unlocked)
      ctx.fillStyle = isUnlocked ? '#fbbf24' : '#1f2937';
      ctx.fillRect(x, y, 3, achH);

      // Border
      ctx.strokeStyle = isUnlocked ? '#4ade80' : '#1e293b';
      ctx.lineWidth = isUnlocked ? 1.5 : 1;
      ctx.strokeRect(x, y, achW, achH);

      // Icon
      ctx.font = `${Math.floor(L.h * 0.028)}px monospace`;
      ctx.fillStyle = isUnlocked ? '#ffffff' : '#374151';
      ctx.textAlign = 'center';
      ctx.fillText(isUnlocked ? ach.icon : '🔒', x + 22, y + Math.floor(achH * 0.6));

      // Name and description
      ctx.textAlign = 'left';
      ctx.font = `bold ${Math.floor(L.h * 0.012)}px monospace`;
      ctx.fillStyle = isUnlocked ? '#e2e8f0' : '#475569';
      ctx.fillText(isUnlocked ? ach.name : '???', x + 40, y + Math.floor(achH * 0.35));
      ctx.font = `${Math.floor(L.h * 0.010)}px monospace`;
      ctx.fillStyle = isUnlocked ? '#94a3b8' : '#374151';
      ctx.fillText(ach.description.slice(0, 38), x + 40, y + Math.floor(achH * 0.62));

      // Checkmark for unlocked
      if (isUnlocked) {
        ctx.font = `bold ${Math.floor(L.h * 0.012)}px monospace`;
        ctx.fillStyle = '#4ade80';
        ctx.textAlign = 'right';
        ctx.fillText('✓', x + achW - 8, y + Math.floor(achH * 0.5));
        ctx.textAlign = 'left';
      }
    }

    // Global stats at bottom
    const stats = getGlobalStats();
    const statsY = L.h - Math.floor(L.h * 0.13);
    ctx.font = `${Math.floor(L.h * 0.010)}px monospace`;
    ctx.fillStyle = '#475569';
    ctx.textAlign = 'center';
    ctx.fillText(
      `Kills: ${stats.totalKills} | Gold: ${stats.totalGoldEarned} | Runs: ${stats.totalRuns} | Max Combo: ${stats.maxCombo} | Bosses: ${stats.bossesKilled}`,
      L.cx, statsY
    );
    ctx.textAlign = 'left';

    // Back button
    const backBtnW = Math.floor(L.w * 0.12);
    const backBtnH = Math.floor(L.h * 0.05);
    this.renderButton(Math.floor(L.w * 0.03), L.h - Math.floor(L.h * 0.08), backBtnW, backBtnH, '← VOLTAR', '#374151');
  }

  // ─── Title Screen ──────────────────────────────────────────────────────────

  /** Currently selected character index in title screen */
  selectedCharIdx = 0;
  /** Shake timer when trying to select locked character */
  private _lockedShakeTimer = 0;

  private readonly CHAR_COLORS = ['#4ade80', '#f97316', '#38bdf8', '#a3e635', '#a855f7', '#ec4899', '#ef4444'];
  private readonly CHAR_BGS    = ['#052010', '#180800', '#011020', '#0d1400', '#0d0017', '#1a001a', '#1a0500'];
  private readonly CHAR_SPRITE_MAP: Record<string, string> = {
    grass_man: 'raiz', fire_lord: 'favil', aqua_sage: 'pelagia',
    storm_runner: 'arco', void_walker: 'barathro', beast_tamer: 'nex', firefighter: 'fenix',
  };
  private readonly CHAR_ICONS: Record<string, string> = {
    grass_man: '🌿', fire_lord: '🔥', aqua_sage: '🌊',
    storm_runner: '☢', void_walker: '🕳', beast_tamer: '🐾', firefighter: '🧯',
  };

  /** Draw a stylized silhouette placeholder when character sprite isn't loaded */
  private drawCharPlaceholder(
    ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number,
    color: string, charId: string,
  ): void {
    ctx.save();
    const cx2 = x + w / 2;
    const headR  = Math.floor(w * 0.13);
    const bodyW  = Math.floor(w * 0.30);
    const bodyH  = Math.floor(h * 0.26);
    const headY  = y + Math.floor(h * 0.26);
    const bodyY  = headY + headR + Math.floor(h * 0.03);
    const armW   = Math.floor(w * 0.09);
    const armH   = Math.floor(h * 0.20);
    const legW   = Math.floor(bodyW * 0.38);
    const legH   = Math.floor(h * 0.20);

    // Body gradient
    const grad = ctx.createLinearGradient(x, y, x, y + h);
    grad.addColorStop(0, color + '30');
    grad.addColorStop(1, color + '08');
    ctx.fillStyle = grad;
    ctx.fillRect(x, y, w, h);

    ctx.fillStyle = color + '55';

    // Head
    ctx.beginPath();
    ctx.arc(cx2, headY, headR, 0, Math.PI * 2);
    ctx.fill();

    // Body
    ctx.fillRect(cx2 - bodyW / 2, bodyY, bodyW, bodyH);

    // Arms
    ctx.fillRect(cx2 - bodyW / 2 - armW - 2, bodyY, armW, armH);
    ctx.fillRect(cx2 + bodyW / 2 + 2, bodyY, armW, armH);

    // Legs
    ctx.fillRect(cx2 - bodyW / 2, bodyY + bodyH + 2, legW, legH);
    ctx.fillRect(cx2 + bodyW / 2 - legW, bodyY + bodyH + 2, legW, legH);

    // Per-character weapon/accessory accent
    ctx.strokeStyle = color + '88';
    ctx.lineWidth = Math.max(2, Math.floor(w * 0.022));
    ctx.lineCap = 'round';
    switch (charId) {
      case 'fire_lord':
        ctx.beginPath();
        ctx.moveTo(cx2 + bodyW / 2 + 2, bodyY + armH * 0.3);
        ctx.lineTo(cx2 + bodyW / 2 + armW * 2.8, bodyY - Math.floor(h * 0.04));
        ctx.stroke();
        // Flame tip
        ctx.beginPath();
        ctx.arc(cx2 + bodyW / 2 + armW * 2.8, bodyY - Math.floor(h * 0.04), Math.floor(w * 0.04), 0, Math.PI * 2);
        ctx.fillStyle = '#fbbf24bb';
        ctx.fill();
        break;
      case 'aqua_sage':
        // Helmet arc
        ctx.beginPath();
        ctx.arc(cx2, headY, headR * 1.25, Math.PI * 0.85, Math.PI * 2.15);
        ctx.stroke();
        break;
      case 'firefighter':
        // Axe
        ctx.beginPath();
        ctx.moveTo(cx2 - bodyW / 2 - armW, bodyY + armH * 0.5);
        ctx.lineTo(cx2 - bodyW / 2 - armW * 2.2, bodyY - Math.floor(h * 0.1));
        ctx.stroke();
        ctx.fillStyle = color + '66';
        ctx.beginPath();
        ctx.arc(cx2 - bodyW / 2 - armW * 2.2, bodyY - Math.floor(h * 0.1), Math.floor(w * 0.05), 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'storm_runner':
        // Radioactive halo
        ctx.strokeStyle = color + '55';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx2, headY, headR * 1.6, 0, Math.PI * 2);
        ctx.stroke();
        break;
    }

    // Large faded icon (top area)
    ctx.font = `${Math.floor(h * 0.10)}px monospace`;
    ctx.fillStyle = color + '22';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(this.CHAR_ICONS[charId] || '?', cx2, y + Math.floor(h * 0.04));
    ctx.textBaseline = 'alphabetic';
    ctx.textAlign = 'left';

    ctx.restore();
  }

  private renderTitle(dt: number): void {
    const { ctx, canvas } = this;
    const L = this.getLayout();
    this.titlePulse += dt;
    this.menuFloatTimer += dt;
    const chars = this.game.characters;
    const idx = this.selectedCharIdx;
    const selChar = chars[idx];
    const charColors = this.CHAR_COLORS;
    const charBgs   = this.CHAR_BGS;
    const color = charColors[idx] || '#94a3b8';
    const bg    = charBgs[idx]    || '#0a0a1a';

    // ── Fade between characters ───────────────────────────────────────────
    if ((this as any)._charFadeTimer === undefined) (this as any)._charFadeTimer = 1;
    if ((this as any)._prevCharIdx === undefined) (this as any)._prevCharIdx = idx;
    if ((this as any)._prevCharIdx !== idx) {
      (this as any)._charFadeTimer = 0;
      (this as any)._prevCharIdx = idx;
    }
    if ((this as any)._charFadeTimer < 1) (this as any)._charFadeTimer = Math.min(1, (this as any)._charFadeTimer + dt * 5);
    const fadeIn = (this as any)._charFadeTimer as number;

    // ── Carousel slide offset ─────────────────────────────────────────────
    if ((this as any)._carouselOff === undefined) (this as any)._carouselOff = 0;
    if ((this as any)._prevCIdx === undefined) (this as any)._prevCIdx = idx;
    if ((this as any)._prevCIdx !== idx) {
      const dir = idx > (this as any)._prevCIdx ? -1 : 1;
      (this as any)._carouselOff = dir * 0.55;
      (this as any)._prevCIdx = idx;
    }
    const off = (this as any)._carouselOff as number;
    if (Math.abs(off) > 0.002) (this as any)._carouselOff = off * 0.72;
    else (this as any)._carouselOff = 0;

    // ── Locked shake ──────────────────────────────────────────────────────
    if (this._lockedShakeTimer > 0) this._lockedShakeTimer -= dt;
    const lockedShake = this._lockedShakeTimer > 0 ? Math.sin(this._lockedShakeTimer * 80) * 6 : 0;
    const isUnlocked = this.game.isCharacterUnlocked(selChar.id);

    // ── BACKGROUND ───────────────────────────────────────────────────────
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const bgGrad = ctx.createRadialGradient(L.cx, L.cy * 0.75, 0, L.cx, L.cy * 0.75, L.h * 0.75);
    bgGrad.addColorStop(0, color + '1e');
    bgGrad.addColorStop(0.55, color + '07');
    bgGrad.addColorStop(1, 'transparent');
    ctx.globalAlpha = fadeIn;
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1;

    // Particles
    const now = performance.now() * 0.001;
    ctx.globalAlpha = 0.18 * fadeIn;
    for (let pi = 0; pi < 18; pi++) {
      const seed = pi * 137.508;
      const px = (Math.sin(seed) * 0.5 + 0.5) * L.w;
      const py = ((Math.cos(seed * 0.7) * 0.5 + 0.5) + now * (0.008 + (pi % 4) * 0.006)) % 1.0;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(Math.floor(px), Math.floor(py * L.h * 0.92), 1.5 + (pi % 3), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // ── CAROUSEL CARDS ───────────────────────────────────────────────────
    const CARD_W    = Math.floor(L.w * 0.265);
    const CARD_H    = Math.floor(L.h * 0.638);
    const CARD_Y    = Math.floor(L.h * 0.048);
    const SPACING   = Math.floor(L.w * 0.296);
    const loadedSp  = (this as any).loadedSprites;

    const drawCard = (ci: number, centerX: number, scale: number, alpha: number): void => {
      if (ci < 0 || ci >= chars.length) return;
      const ch = chars[ci];
      const chColor = charColors[ci] || '#94a3b8';
      const cw  = Math.floor(CARD_W * scale);
      const ch2 = Math.floor(CARD_H * scale);
      const cx2 = Math.floor(centerX - cw / 2);
      const cy2 = Math.floor(CARD_Y + (CARD_H - ch2) / 2);
      const chUnlocked = this.game.isCharacterUnlocked(ch.id);
      const isCenter = scale > 0.85;

      ctx.save();
      ctx.globalAlpha = alpha;

      // Drop shadow
      if (isCenter) {
        ctx.shadowColor = chColor + '99';
        ctx.shadowBlur = 28;
      }

      // Card bg
      const cardGrad = ctx.createLinearGradient(cx2, cy2, cx2, cy2 + ch2);
      cardGrad.addColorStop(0, '#0e0e1c');
      cardGrad.addColorStop(1, '#06060f');
      ctx.fillStyle = cardGrad;
      ctx.fillRect(cx2, cy2, cw, ch2);

      // Border
      ctx.strokeStyle = isCenter ? chColor : chColor + '50';
      ctx.lineWidth = isCenter ? 2 : 1;
      ctx.strokeRect(cx2, cy2, cw, ch2);
      ctx.shadowBlur = 0;

      // Portrait / placeholder
      const portrait = loadedSp?.characters?.get(this.CHAR_SPRITE_MAP[ch.id]) || null;
      ctx.beginPath();
      ctx.rect(cx2 + 1, cy2 + 1, cw - 2, ch2 - 2);
      ctx.clip();
      // Fallback: generated pixel art character sprite (scaled up)
      const genCharSprite = this.sprites.characters?.get(ch.id);

      if (portrait) {
        const iw = portrait.naturalWidth || portrait.width;
        const ih = portrait.naturalHeight || portrait.height;
        const sc2 = Math.max(cw / iw, ch2 / ih);
        const dw = iw * sc2; const dh = ih * sc2;
        ctx.drawImage(portrait, cx2 + (cw - dw) / 2, cy2 + (ch2 - dh), dw, dh);
      } else if (genCharSprite) {
        // Draw pixel art character scaled to fill bottom 55% of card, crisp pixels
        ctx.imageSmoothingEnabled = false;
        const pxW = genCharSprite.width;
        const pxH = genCharSprite.height;
        const maxW = cw * 0.75;
        const maxH = ch2 * 0.62;
        const scChar = Math.min(maxW / pxW, maxH / pxH);
        const dw2 = Math.floor(pxW * scChar);
        const dh2 = Math.floor(pxH * scChar);
        // Position: horizontally centered, vertically in lower half
        const drawX = cx2 + Math.floor((cw - dw2) / 2);
        const drawY = cy2 + ch2 - dh2 - Math.floor(ch2 * 0.05);
        ctx.drawImage(genCharSprite, drawX, drawY, dw2, dh2);
        ctx.imageSmoothingEnabled = true;
      } else {
        this.drawCharPlaceholder(ctx, cx2, cy2, cw, ch2, chColor, ch.id);
      }

      // Bottom gradient name overlay (center card only)
      if (isCenter) {
        const nameGrad = ctx.createLinearGradient(0, cy2 + ch2 * 0.56, 0, cy2 + ch2);
        nameGrad.addColorStop(0, 'transparent');
        nameGrad.addColorStop(1, 'rgba(4,4,16,0.97)');
        ctx.fillStyle = nameGrad;
        ctx.fillRect(cx2, cy2, cw, ch2);
      }

      // Locked overlay
      if (!chUnlocked) {
        ctx.fillStyle = 'rgba(0,0,0,0.75)';
        ctx.fillRect(cx2, cy2, cw, ch2);
        ctx.font = `${Math.floor(ch2 * 0.13)}px monospace`;
        ctx.fillStyle = '#374151';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🔒', cx2 + cw / 2, cy2 + ch2 * 0.45);
        ctx.textBaseline = 'alphabetic';
        ctx.textAlign = 'left';
      }

      ctx.restore();

      // Name + title on center card (outside clip)
      if (isCenter) {
        ctx.save();
        ctx.globalAlpha = alpha * fadeIn;
        ctx.font = `bold ${Math.floor(L.h * 0.042)}px monospace`;
        ctx.fillStyle = chColor;
        ctx.textAlign = 'center';
        ctx.shadowColor = chColor;
        ctx.shadowBlur = 14;
        ctx.fillText(ch.name.toUpperCase(), cx2 + cw / 2 + lockedShake, cy2 + ch2 - Math.floor(ch2 * 0.115));
        ctx.shadowBlur = 0;
        ctx.font = `${Math.floor(L.h * 0.014)}px monospace`;
        ctx.fillStyle = chColor + 'bb';
        ctx.fillText(ch.title, cx2 + cw / 2, cy2 + ch2 - Math.floor(ch2 * 0.046));
        ctx.textAlign = 'left';
        ctx.restore();
      }
    };

    const slideOff = (this as any)._carouselOff as number;
    // Draw side cards behind center
    drawCard(idx - 1, L.cx - SPACING + slideOff * SPACING, 0.70, 0.40);
    drawCard(idx + 1, L.cx + SPACING + slideOff * SPACING, 0.70, 0.40);
    // Draw center card on top
    drawCard(idx, L.cx + slideOff * SPACING, 1.00, 1.00);

    // ── NAVIGATION ARROWS ─────────────────────────────────────────────────
    const arrowCY = CARD_Y + Math.floor(CARD_H * 0.44);
    const arrowSize = Math.floor(L.h * 0.06);
    const pulse = 0.68 + Math.sin(now * 2.2) * 0.18;
    ctx.font = `bold ${arrowSize}px monospace`;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    if (idx > 0) {
      ctx.globalAlpha = pulse;
      ctx.fillStyle = charColors[idx - 1];
      ctx.shadowColor = charColors[idx - 1];
      ctx.shadowBlur = 10;
      ctx.fillText('◀', Math.floor(L.cx - SPACING * 0.54), arrowCY);
      ctx.shadowBlur = 0;
    }
    if (idx < chars.length - 1) {
      ctx.globalAlpha = pulse;
      ctx.fillStyle = charColors[idx + 1];
      ctx.shadowColor = charColors[idx + 1];
      ctx.shadowBlur = 10;
      ctx.fillText('▶', Math.floor(L.cx + SPACING * 0.54), arrowCY);
      ctx.shadowBlur = 0;
    }
    ctx.globalAlpha = 1;
    ctx.textBaseline = 'alphabetic';
    ctx.textAlign = 'left';

    // ── DOT INDICATORS ────────────────────────────────────────────────────
    const dotY  = CARD_Y + CARD_H + Math.floor(L.h * 0.022);
    const dotR  = Math.floor(L.h * 0.007);
    const dotGap = Math.floor(L.w * 0.016);
    const dotsW = chars.length * (dotR * 2 + dotGap) - dotGap;
    const dotStartX = Math.floor(L.cx - dotsW / 2 + dotR);
    for (let di = 0; di < chars.length; di++) {
      const dx = dotStartX + di * (dotR * 2 + dotGap);
      const dActive = di === idx;
      ctx.beginPath();
      ctx.arc(dx, dotY, dActive ? dotR * 1.5 : dotR, 0, Math.PI * 2);
      ctx.fillStyle = dActive ? charColors[di] : charColors[di] + '40';
      if (dActive) { ctx.shadowColor = charColors[di]; ctx.shadowBlur = 8; }
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // ── INFO PANEL (below cards) ──────────────────────────────────────────
    const infoY = dotY + Math.floor(L.h * 0.038);
    const infoW = Math.floor(L.w * 0.58);
    const infoX = Math.floor(L.cx - infoW / 2);

    ctx.save();
    ctx.globalAlpha = fadeIn;

    // Passive card
    const lineSmall = Math.floor(L.h * 0.0185);
    const passH = Math.floor(L.h * 0.076);
    ctx.fillStyle = color + '12';
    ctx.fillRect(infoX, infoY, infoW, passH);
    ctx.strokeStyle = color + '35';
    ctx.lineWidth = 1;
    ctx.strokeRect(infoX, infoY, infoW, passH);
    ctx.fillStyle = color;
    ctx.fillRect(infoX, infoY, 3, passH);
    ctx.font = `bold ${Math.floor(L.h * 0.011)}px monospace`;
    ctx.fillStyle = color;
    ctx.fillText('◆ PASSIVA', infoX + 10, infoY + Math.floor(L.h * 0.016));
    ctx.font = `${Math.floor(L.h * 0.0108)}px monospace`;
    ctx.fillStyle = '#cbd5e1';
    const pWords = selChar.passive.split(' '); let pLine = '';
    let pY = infoY + Math.floor(L.h * 0.034);
    for (const w of pWords) {
      if (ctx.measureText(pLine + w).width > infoW - 22 && pLine) {
        ctx.fillText(pLine.trim(), infoX + 10, pY); pY += lineSmall; pLine = w + ' ';
      } else { pLine += w + ' '; }
    }
    if (pLine.trim()) ctx.fillText(pLine.trim(), infoX + 10, pY);

    // Stats row
    const statsY  = infoY + passH + Math.floor(L.h * 0.01);
    const statW2  = Math.floor(infoW / 3);
    const statH   = Math.floor(L.h * 0.058);
    const statDefs = [
      { icon: '♥', label: 'HP',    value: String(selChar.startingHp),              clr: '#f87171' },
      { icon: '💰', label: 'GOLD',  value: selChar.startingGold + 'g',              clr: '#fbbf24' },
      { icon: '📦', label: 'GRADE', value: `${selChar.backpackCols}×${selChar.backpackRows}`, clr: '#60a5fa' },
    ];
    for (let si = 0; si < statDefs.length; si++) {
      const st = statDefs[si];
      const sx = infoX + si * statW2;
      ctx.fillStyle = st.clr + '14';
      ctx.fillRect(sx, statsY, statW2 - 3, statH);
      ctx.strokeStyle = st.clr + '40';
      ctx.lineWidth = 1;
      ctx.strokeRect(sx, statsY, statW2 - 3, statH);
      ctx.font = `bold ${Math.floor(L.h * 0.022)}px monospace`;
      ctx.fillStyle = st.clr;
      ctx.textAlign = 'center';
      ctx.fillText(st.icon + ' ' + st.value, sx + (statW2 - 3) / 2, statsY + Math.floor(statH * 0.55));
      ctx.font = `${Math.floor(L.h * 0.009)}px monospace`;
      ctx.fillStyle = '#4b5563';
      ctx.fillText(st.label, sx + (statW2 - 3) / 2, statsY + Math.floor(statH * 0.84));
      ctx.textAlign = 'left';
    }

    // Unlock condition (locked)
    if (!isUnlocked) {
      const lockY = statsY + statH + Math.floor(L.h * 0.008);
      ctx.fillStyle = 'rgba(127,29,29,0.32)';
      ctx.fillRect(infoX, lockY, infoW, Math.floor(L.h * 0.044));
      ctx.strokeStyle = '#ef444455';
      ctx.lineWidth = 1;
      ctx.strokeRect(infoX, lockY, infoW, Math.floor(L.h * 0.044));
      ctx.font = `bold ${Math.floor(L.h * 0.011)}px monospace`;
      ctx.fillStyle = '#fca5a5';
      ctx.textAlign = 'center';
      ctx.fillText('🔒  ' + selChar.unlockCondition, infoX + infoW / 2, lockY + Math.floor(L.h * 0.028));
      ctx.textAlign = 'left';
    }

    ctx.restore();

    // ── PLAY BUTTON (centered bottom) ─────────────────────────────────────
    const pbW = Math.floor(L.w * 0.19);
    const pbH = Math.floor(L.h * 0.068);
    const pbX = Math.floor(L.cx - pbW / 2 + lockedShake);
    const pbY = L.h - Math.floor(L.h * 0.054) - pbH;
    if (isUnlocked) {
      ctx.shadowColor = color; ctx.shadowBlur = 12 + Math.sin(this.titlePulse * 2.5) * 5;
    } else if (this._lockedShakeTimer > 0) {
      ctx.shadowColor = '#ef4444'; ctx.shadowBlur = 14;
    }
    this.renderButton(pbX, pbY, pbW, pbH,
      isUnlocked ? '▶  JOGAR' : '🔒 BLOQUEADO',
      isUnlocked ? color : (this._lockedShakeTimer > 0 ? '#ef4444' : '#374151'));
    ctx.shadowBlur = 0;

    // ── DIFFICULTY (bottom left) ──────────────────────────────────────────
    const currentDiff = getDifficultyById(this.game.currentDifficulty);
    const diffX = Math.floor(L.w * 0.032);
    const diffBY = L.h - Math.floor(L.h * 0.03);
    ctx.font = `${Math.floor(L.h * 0.009)}px monospace`;
    ctx.fillStyle = '#374151';
    ctx.fillText('DIFICULDADE ▼', diffX, diffBY - Math.floor(L.h * 0.03));
    ctx.font = `bold ${Math.floor(L.h * 0.019)}px monospace`;
    ctx.fillStyle = currentDiff.color;
    ctx.fillText(`${currentDiff.icon} ${currentDiff.name}`, diffX, diffBY);

    // ◀ ESC (top-left)
    ctx.font = `${Math.floor(L.h * 0.013)}px monospace`;
    ctx.fillStyle = '#4b5563';
    ctx.fillText('◀ ESC', Math.floor(L.w * 0.018), Math.floor(L.h * 0.036));

    // Keyboard hint
    ctx.font = `${Math.floor(L.h * 0.009)}px monospace`;
    ctx.fillStyle = '#1f2937';
    ctx.textAlign = 'center';
    ctx.fillText('← → navegar  |  ENTER jogar  |  ESC voltar', L.cx, L.h - Math.floor(L.h * 0.006));
    ctx.textAlign = 'left';
  }

  // ─── Wave Transition Overlay ----------------------------------------------

  private renderWaveTransition(dt: number): void {
    if (!this.waveTransition) return;
    const t = this.waveTransition;
    t.timer += dt;
    if (t.timer >= t.duration) {
      this.waveTransition = null;
      return;
    }
    const progress = t.timer / t.duration;
    // Ease-in-out for reveal, ease-out for fade
    const revealP = Math.min(1, progress * 2.5);
    const fadeP   = Math.max(0, (progress - 0.5) * 2);
    const alpha   = revealP * (1 - fadeP * 0.9);
    const { ctx, canvas } = this;
    const L = this.getLayout();
    ctx.save();

    // Dark overlay
    ctx.globalAlpha = alpha * 0.85;
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Horizontal scan lines sweep effect
    const scanAlpha = Math.max(0, alpha * 0.06);
    ctx.globalAlpha = scanAlpha;
    ctx.fillStyle = '#6366f1';
    for (let sy = 0; sy < canvas.height; sy += 6) {
      ctx.fillRect(0, sy, canvas.width, 2);
    }

    // White flash at peak (progress ~0.2)
    const flashIntensity = Math.max(0, 1 - Math.abs(progress - 0.18) * 8);
    if (flashIntensity > 0) {
      ctx.globalAlpha = flashIntensity * 0.55;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Month text — zoom-in from large
    const scaleT = 1 + (1 - revealP) * 1.8;
    ctx.globalAlpha = alpha;
    ctx.font = `bold ${Math.floor(L.h * 0.058 * scaleT)}px monospace`;
    ctx.fillStyle = '#fbbf24';
    ctx.shadowColor = '#fbbf24';
    ctx.shadowBlur = 20 * alpha;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.game.getTimeString(), L.cx, L.cy - Math.floor(L.h * 0.04));
    ctx.shadowBlur = 0;

    // Flavor line
    ctx.font = `${Math.floor(L.h * 0.017)}px monospace`;
    ctx.fillStyle = `rgba(148,163,184,${alpha})`;
    ctx.fillText(this.game.getMonthlyFlavor(), L.cx, L.cy + Math.floor(L.h * 0.038));

    // Gameplay tip (rotates based on wave)
    const tips = [
      'Itens colados = fusão. Testa!',
      'Tags iguais se buffam. Empilha o mesmo elemento.',
      'Abre o Codex pra ver as fusões (tecla C).',
      'Arrasta pra baixo pra vender. Às vezes vale.',
      'Mods buffam TUDO adjacente. São OP.',
      'Cada herói tem regras de mochila diferentes.',
      'SHIFT = dash. Iframe curto.',
      'Fusão boa > item caro sozinho.',
      'Mesmo elemento na loja? Compra. Confia.',
      'Meses 6 e 12: boss. Se prepara.',
      'Boss morto = ouro absurdo.',
      'Combo 20 reseta os cooldowns das skills.',
    ];
    const tipIdx = this.game.totalMonths % tips.length;
    ctx.font = `${Math.floor(L.h * 0.012)}px monospace`;
    ctx.fillStyle = '#6366f1';
    ctx.globalAlpha = Math.min(alpha, 0.7);
    ctx.fillText(`💡 ${tips[tipIdx]}`, L.cx, L.cy + Math.floor(L.h * 0.1));
    ctx.globalAlpha = alpha;

    // Survival mode message
    if (this.game.showSurvivalMessage) {
      this.game.survivalMessageTimer -= dt;
      ctx.font = `bold ${Math.floor(L.h * 0.025)}px monospace`;
      ctx.fillStyle = '#4ade80';
      ctx.fillText('MODO SOBREVIVÊNCIA DESBLOQUEADO', L.cx, L.cy + Math.floor(L.h * 0.12));
      if (this.game.aliencoreUnlocked) {
        ctx.fillStyle = '#ef4444';
        ctx.fillText('ALIENCORE DESBLOQUEADO', L.cx, L.cy + Math.floor(L.h * 0.17));
      }
      if (this.game.survivalMessageTimer <= 0) {
        this.game.showSurvivalMessage = false;
      }
    }

    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.restore();
  }

  // ─── Held Item (Drag-and-Drop) ────────────────────────────────────────────

  private renderHeldItem(): void {
    if (!this.inputHandler?.heldItem) return;
    const held = this.inputHandler.heldItem;
    const shape = this.inputHandler.getHeldShape();
    if (!shape) return;

    const { ctx } = this;
    const L = this.getLayout();
    const color = this.getItemColor(held.definition.tags);

    // Calculate grid position under cursor
    const gridCol = Math.floor((this.mouseX - L.gridX) / L.cell);
    const gridRow = Math.floor((this.mouseY - L.gridY) / L.cell);
    const inGrid = gridCol >= 0 && gridRow >= 0 &&
      gridCol < this.game.backpack.cols && gridRow < this.game.backpack.rows;

    // Show grid highlight if cursor is over grid
    if (inGrid) {
      const tempDef: ItemDefinition = { ...held.definition, gridShape: shape };
      const canPlace = this.game.backpack.canPlace(tempDef, { col: gridCol, row: gridRow });
      const cells = getOccupiedCells(shape, { col: gridCol, row: gridRow });
      const highlightColor = canPlace ? 'rgba(74, 222, 128, 0.35)' : 'rgba(239, 68, 68, 0.35)';
      const borderColor = canPlace ? '#4ade80' : '#ef4444';

      for (const cell of cells) {
        if (cell.col >= 0 && cell.col < this.game.backpack.cols &&
            cell.row >= 0 && cell.row < this.game.backpack.rows) {
          const x = L.gridX + cell.col * L.cell;
          const y = L.gridY + cell.row * L.cell;
          ctx.fillStyle = highlightColor;
          ctx.fillRect(x, y, L.cell - 2, L.cell - 2);
          ctx.strokeStyle = borderColor;
          ctx.lineWidth = 2;
          ctx.strokeRect(x, y, L.cell - 2, L.cell - 2);
        }
      }

      // Adjacency preview — highlight items that would be neighbors
      if (canPlace) {
        const dirs = [[0, -1], [0, 1], [-1, 0], [1, 0]];
        const adjSet = new Set<string>();
        for (const cell of cells) {
          for (const [dc, dr] of dirs) {
            const nc = cell.col + dc;
            const nr = cell.row + dr;
            if (nc < 0 || nc >= this.game.backpack.cols || nr < 0 || nr >= this.game.backpack.rows) continue;
            const occupant = this.game.backpack.getItemAt(nc, nr);
            if (occupant && !adjSet.has(occupant.instanceId)) {
              adjSet.add(occupant.instanceId);
              const ax = L.gridX + occupant.position.col * L.cell;
              const ay = L.gridY + occupant.position.row * L.cell;
              ctx.globalAlpha = 0.4;
              ctx.strokeStyle = '#fbbf24';
              ctx.lineWidth = 2;
              ctx.strokeRect(ax + 1, ay + 1, L.cell - 4, L.cell - 4);
              ctx.globalAlpha = 1;
            }
          }
        }
      }
    }

    // Draw item following cursor (ghost)
    ctx.globalAlpha = 0.7;
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c] !== 1) continue;
        const x = this.mouseX - (shape[0].length * L.cell) / 2 + c * L.cell;
        const y = this.mouseY - (shape.length * L.cell) / 2 + r * L.cell;
        ctx.fillStyle = color;
        ctx.fillRect(x + 2, y + 2, L.cell - 6, L.cell - 6);
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 2, y + 2, L.cell - 6, L.cell - 6);
      }
    }
    ctx.globalAlpha = 1;

    // Item name near cursor
    ctx.font = L.fontSmall;
    ctx.fillStyle = '#e2e8f0';
    ctx.fillText(held.definition.name, this.mouseX + 10, this.mouseY - 10);
    ctx.font = L.fontTiny;
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('[R-click: rotacionar]', this.mouseX + 10, this.mouseY + 2);
  }

  // ─── Background ───────────────────────────────────────────────────────────

  private renderBackground(dt: number): void {
    const { ctx, canvas } = this;
    this.bgOffset = (this.bgOffset + dt * 20) % 256;
    const bg = this.sprites.background;
    const tilesX = Math.ceil(canvas.width / 256) + 1;
    const tilesY = Math.ceil(canvas.height / 256) + 1;
    for (let tx = 0; tx < tilesX; tx++) {
      for (let ty = 0; ty < tilesY; ty++) {
        ctx.drawImage(bg, tx * 256, ty * 256 - 256 + this.bgOffset);
      }
    }
  }

  // ─── Particles ────────────────────────────────────────────────────────────

  spawnParticles(x: number, y: number, color: string, count: number): void {
    if (localStorage.getItem('packinvaders_particles') === 'off') return;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 30 + Math.random() * 100;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.4 + Math.random() * 0.4,
        maxLife: 0.8,
        color, size: 1 + Math.random() * 2,
      });
    }
  }

  private spawnExplosion(x: number, y: number, maxRadius: number, color: string): void {
    this.explosions.push({
      x, y, radius: 0, maxRadius, life: 0.4, maxLife: 0.4, color,
    });
  }

  private updateAndRenderParticles(dt: number): void {
    const { ctx } = this;
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      if (p.life <= 0) { this.particles.splice(i, 1); continue; }
      const alpha = p.life / p.maxLife;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.size, p.size);
    }
    ctx.globalAlpha = 1;
  }

  private updateAndRenderExplosions(dt: number): void {
    const { ctx } = this;
    for (let i = this.explosions.length - 1; i >= 0; i--) {
      const ex = this.explosions[i];
      ex.life -= dt;
      if (ex.life <= 0) { this.explosions.splice(i, 1); continue; }
      const progress = 1 - ex.life / ex.maxLife;
      ex.radius = ex.maxRadius * progress;
      const alpha = ex.life / ex.maxLife;
      ctx.globalAlpha = alpha * 0.6;
      ctx.strokeStyle = ex.color;
      ctx.lineWidth = 3 * (1 - progress);
      ctx.beginPath();
      ctx.arc(ex.x, ex.y, ex.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = alpha * 0.15;
      ctx.fillStyle = ex.color;
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  private renderGoldPopups(dt: number): void {
    const { ctx } = this;
    const L = this.getLayout();
    for (let i = this.goldPopups.length - 1; i >= 0; i--) {
      const gp = this.goldPopups[i];
      gp.y -= 30 * dt;
      gp.life -= dt;
      if (gp.life <= 0) { this.goldPopups.splice(i, 1); continue; }
      ctx.globalAlpha = Math.min(1, gp.life * 2);
      ctx.font = `bold ${Math.floor(L.h * 0.02)}px monospace`;
      ctx.fillStyle = '#fbbf24';
      ctx.fillText(`+${gp.amount}g`, gp.x, gp.y);
    }
    ctx.globalAlpha = 1;
  }

  // ─── Inventory Phase ────────────────────────────────────────────────────

  /**
   * Skill slots panel shown in the inventory (separate area from the item grid).
   * Shows the character's 3 active skills + their keys, plus the dash control.
   */
  private renderSkillPanel(): void {
    const { ctx, game } = this;
    const L = this.getLayout();
    const skills = game.skills || [];

    const slot = Math.floor(L.h * 0.072);
    const gap = Math.floor(L.w * 0.008);
    const startX = L.gridX;
    const panelY = L.gridY + L.gridH + Math.floor(L.h * 0.045);

    // Label
    ctx.font = `bold ${Math.floor(L.h * 0.014)}px monospace`;
    ctx.fillStyle = '#a78bfa';
    ctx.textAlign = 'left';
    ctx.fillText('HABILIDADES & DASH', startX, panelY - Math.floor(L.h * 0.012));

    // 3 skill slots
    for (let i = 0; i < Math.min(skills.length, 3); i++) {
      const sk = skills[i];
      const sx = startX + i * (slot + gap);
      ctx.fillStyle = 'rgba(22, 20, 44, 0.9)';
      ctx.fillRect(sx, panelY, slot, slot);
      ctx.strokeStyle = '#6366f1';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(sx, panelY, slot, slot);
      // Key badge (top-left)
      ctx.fillStyle = '#6366f1';
      ctx.fillRect(sx, panelY, Math.floor(slot * 0.3), Math.floor(slot * 0.3));
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${Math.floor(L.h * 0.012)}px monospace`;
      ctx.textAlign = 'center';
      ctx.fillText(`${i + 1}`, sx + Math.floor(slot * 0.15), panelY + Math.floor(slot * 0.23));
      // Icon
      ctx.font = `${Math.floor(slot * 0.4)}px monospace`;
      ctx.fillStyle = '#e2e8f0';
      ctx.fillText(sk.definition.icon, sx + slot / 2, panelY + slot * 0.6);
      // Name below
      ctx.font = `${Math.floor(L.h * 0.0092)}px monospace`;
      ctx.fillStyle = '#c7d2fe';
      ctx.fillText(sk.definition.name.slice(0, 11), sx + slot / 2, panelY + slot + Math.floor(L.h * 0.014));
    }

    // Dash slot (after the 3 skills)
    const canDash = game.characterId !== 'beast_tamer';
    const dx = startX + 3 * (slot + gap) + gap;
    ctx.fillStyle = canDash ? 'rgba(44, 32, 8, 0.9)' : 'rgba(20, 20, 24, 0.85)';
    ctx.fillRect(dx, panelY, slot, slot);
    ctx.strokeStyle = canDash ? '#fbbf24' : '#374151';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(dx, panelY, slot, slot);
    // Key badge "SHIFT"
    ctx.fillStyle = canDash ? '#fbbf24' : '#374151';
    ctx.fillRect(dx, panelY, Math.floor(slot * 0.55), Math.floor(slot * 0.26));
    ctx.fillStyle = canDash ? '#000000' : '#94a3b8';
    ctx.font = `bold ${Math.floor(L.h * 0.0088)}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText('SHIFT', dx + Math.floor(slot * 0.275), panelY + Math.floor(slot * 0.19));
    ctx.font = `${Math.floor(slot * 0.4)}px monospace`;
    ctx.fillStyle = canDash ? '#fbbf24' : '#475569';
    ctx.fillText('💨', dx + slot / 2, panelY + slot * 0.62);
    ctx.font = `${Math.floor(L.h * 0.0092)}px monospace`;
    ctx.fillStyle = canDash ? '#fde68a' : '#475569';
    ctx.fillText(canDash ? 'DASH' : 'SEM DASH', dx + slot / 2, panelY + slot + Math.floor(L.h * 0.014));

    ctx.textAlign = 'left';
  }

  private renderInventory(dt: number): void {
    const { ctx, game } = this;
    const L = this.getLayout();

    // Flash effect when entering inventory
    this.inventoryFlashTimer = Math.max(0, this.inventoryFlashTimer - dt);

    // Planet background (right side)
    const planetX = Math.floor(L.w * 0.78);
    const planetY = Math.floor(L.h * 0.45);
    const planetR = Math.floor(L.h * 0.25);
    renderPlanet(ctx, planetX, planetY, planetR, game.totalMonths, performance.now() / 1000);

    ctx.fillStyle = 'rgba(10,10,18,0.85)';
    ctx.fillRect(L.gridX - 10, L.gridY - 20, L.gridW + 20, L.gridH + 40);

    // Flash overlay
    if (this.inventoryFlashTimer > 0) {
      ctx.globalAlpha = this.inventoryFlashTimer * 2;
      ctx.fillStyle = 'rgba(99, 102, 241, 0.2)';
      ctx.fillRect(L.gridX - 10, L.gridY - 20, L.gridW + 20, L.gridH + 40);
      ctx.globalAlpha = 1;
    }

    const itemCount = game.backpack.getAllItems().length;
    const totalCells = game.backpack.cols * game.backpack.rows;
    const usedCells = game.backpack.getAllItems().reduce((sum, it) => sum + it.definition.gridShape.flat().filter(c => c === 1).length, 0);
    ctx.font = L.fontTitle;
    ctx.fillStyle = '#a78bfa';
    ctx.fillText(`MOCHILA (${itemCount})`, L.gridX, L.gridY - Math.floor(L.h * 0.04));

    ctx.font = L.fontSmall;
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(
      `${game.getTimeString()} | Gold: ${game.gold} | Espaço: ${usedCells}/${totalCells}`,
      L.gridX + Math.floor(L.w * 0.1), L.gridY - Math.floor(L.h * 0.04)
    );

    this.renderGrid();
    this.renderPlacedItems();
    this.renderSkillPanel();
    this.renderPowerSummary();
    this.renderTooltip();
    this.renderSellZone();

    // Active synergies display (below power panel)
    if (game.activeSynergies.length > 0) {
      const synX = L.panelX;
      const synY = L.panelY + Math.floor(L.h * 0.37);
      ctx.font = `bold ${Math.floor(L.h * 0.013)}px monospace`;
      ctx.fillStyle = '#a78bfa';
      ctx.fillText('SINERGIAS:', synX, synY);
      ctx.font = `${Math.floor(L.h * 0.012)}px monospace`;
      for (let i = 0; i < Math.min(game.activeSynergies.length, 5); i++) {
        ctx.fillStyle = '#6366f1';
        ctx.fillText(`✦ ${game.activeSynergies[i]}`, synX, synY + (i + 1) * Math.floor(L.h * 0.02));
      }
    }

    // Active fusions count
    const fusedItems = game.backpack.getAllItems().filter(i => (i.state as any).fusedName);
    if (fusedItems.length > 0) {
      const fusY = L.panelY + Math.floor(L.h * 0.55);
      ctx.font = `bold ${Math.floor(L.h * 0.013)}px monospace`;
      ctx.fillStyle = '#f472b6';
      ctx.fillText(`★ FUSÕES ATIVAS: ${fusedItems.length}`, L.panelX, fusY);
      ctx.font = `${Math.floor(L.h * 0.010)}px monospace`;
      for (let i = 0; i < Math.min(fusedItems.length, 3); i++) {
        ctx.fillStyle = '#f9a8d4';
        ctx.fillText(`  ${(fusedItems[i].state as any).fusedName}`, L.panelX, fusY + (i + 1) * Math.floor(L.h * 0.018));
      }
    }

    // Buttons
    const btnW = Math.floor(L.w * 0.2);
    const btnH = Math.floor(L.h * 0.065);
    const hasWeapon = game.backpack.getAllItems().some(i => i.definition.tags.includes('Emissor'));
    if (hasWeapon) {
      const pulse = 0.5 + Math.sin(performance.now() * 0.003) * 0.3;
      ctx.shadowColor = '#6366f1';
      ctx.shadowBlur = 10 * pulse;
    }
    this.renderButton(L.cx - btnW / 2, L.btnY, btnW, btnH, 'INICIAR COMBATE', hasWeapon ? '#6366f1' : '#374151');
    ctx.shadowBlur = 0;

    // Show DPS estimate below button
    if (hasWeapon) {
      const power = game.backpack.calculateBackpackPower();
      const dpsEst = power.totalDamage * (power.totalFireRate / Math.max(1, power.emitters.length)) * power.totalProjectiles;
      ctx.font = `${Math.floor(L.h * 0.010)}px monospace`;
      ctx.fillStyle = '#64748b';
      ctx.textAlign = 'center';
      ctx.fillText(`DPS estimado: ${dpsEst.toFixed(0)}`, L.cx, L.btnY + btnH + Math.floor(L.h * 0.018));
      ctx.textAlign = 'left';
    }

    // Aliencore toggle (below combat button, only when unlocked)
    if (game.aliencoreUnlocked) {
      const acBtnW = Math.floor(L.w * 0.16);
      const acBtnH = Math.floor(L.h * 0.034);
      const acBtnX = L.cx - acBtnW / 2;
      const acBtnY = L.btnY + btnH + Math.floor(L.h * 0.012);
      this.renderButton(acBtnX, acBtnY, acBtnW, acBtnH,
        game.aliencoreMode ? '⚠ ALIENCORE: ON' : '⚠ ALIENCORE: OFF',
        game.aliencoreMode ? '#ef4444' : '#374151');
    }

    // Codex shortcut button (top right)
    const codexBtnW = Math.floor(L.w * 0.1);
    const codexBtnH = Math.floor(L.h * 0.04);
    this.renderButton(L.w - codexBtnW - Math.floor(L.w * 0.02), Math.floor(L.h * 0.02), codexBtnW, codexBtnH, '📖 CODEX', '#374151');

    // Equipped relics display (below codex button)
    const equippedRelics = getEquippedRelics();
    if (equippedRelics.length > 0) {
      const relicY = Math.floor(L.h * 0.07);
      const relicX = L.w - Math.floor(L.w * 0.12);
      ctx.font = `${Math.floor(L.h * 0.009)}px monospace`;
      ctx.fillStyle = '#64748b';
      ctx.fillText('RELÍQUIAS:', relicX, relicY);
      ctx.font = `${Math.floor(L.h * 0.016)}px monospace`;
      for (let ri = 0; ri < equippedRelics.length; ri++) {
        ctx.fillText(equippedRelics[ri].icon, relicX + ri * Math.floor(L.w * 0.02), relicY + Math.floor(L.h * 0.02));
      }
    }
  }

  private renderGrid(): void {
    const { ctx, game } = this;
    const L = this.getLayout();
    const { cols, rows } = game.backpack;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = L.gridX + c * L.cell;
        const y = L.gridY + r * L.cell;
        // Darker cells with subtle gradient feel
        ctx.fillStyle = (r + c) % 2 === 0 ? '#10101a' : '#0d0d16';
        ctx.fillRect(x, y, L.cell - 2, L.cell - 2);
        // Subtle inner border
        ctx.strokeStyle = '#1e1e30';
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 0.5, y + 0.5, L.cell - 3, L.cell - 3);
      }
    }
    // Outer grid border
    ctx.strokeStyle = '#3b3b5a';
    ctx.lineWidth = 2;
    ctx.strokeRect(L.gridX - 1, L.gridY - 1, cols * L.cell + 1, rows * L.cell + 1);
  }

  private renderPlacedItems(): void {
    const { ctx, game } = this;
    const L = this.getLayout();
    const items = game.backpack.getAllItems();

    for (const item of items) {
      const shape = item.definition.gridShape;
      const color = this.getItemColor(item.definition.tags);
      const hasFusion = !!(item.state as any).fusedName;

      for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[r].length; c++) {
          if (shape[r][c] !== 1) continue;
          const x = L.gridX + (item.position.col + c) * L.cell;
          const y = L.gridY + (item.position.row + r) * L.cell;

          // Base cell fill
          ctx.fillStyle = color;
          ctx.fillRect(x + 2, y + 2, L.cell - 6, L.cell - 6);

          // Top highlight
          ctx.fillStyle = 'rgba(255,255,255,0.12)';
          ctx.fillRect(x + 2, y + 2, L.cell - 6, 3);

          // Border — color based on rarity for rare+ items
          const rarityColors2 = ['', '', '#3b82f6', '#a855f7'];
          const rarityBorder = item.definition.rarity >= 2 ? rarityColors2[item.definition.rarity] : '';
          if (hasFusion) {
            ctx.strokeStyle = '#f472b6';
            ctx.lineWidth = 1.5;
          } else if (rarityBorder) {
            ctx.strokeStyle = rarityBorder + '80';
            ctx.lineWidth = 1.5;
          } else {
            ctx.strokeStyle = 'rgba(255,255,255,0.18)';
            ctx.lineWidth = 1;
          }
          ctx.strokeRect(x + 2, y + 2, L.cell - 6, L.cell - 6);

          // Rarity corner dot (rare = blue, legendary = purple)
          if (item.definition.rarity >= 2 && !hasFusion) {
            ctx.fillStyle = rarityColors2[item.definition.rarity] || '#6366f1';
            ctx.beginPath();
            ctx.arc(x + L.cell - 7, y + 6, 3, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // Fusion glow effect (pulsing border around entire item)
      if (hasFusion) {
        const glowPulse = 0.25 + Math.sin(performance.now() * 0.004) * 0.15;
        const fusionColor = ((item.state as any).fusionColor as string) || '#f472b6';
        ctx.globalAlpha = glowPulse;
        ctx.shadowColor = fusionColor;
        ctx.shadowBlur = 10;
        const gx = L.gridX + item.position.col * L.cell;
        const gy = L.gridY + item.position.row * L.cell;
        const gw = shape[0].length * L.cell;
        const gh = shape.length * L.cell;
        ctx.strokeStyle = fusionColor;
        ctx.lineWidth = 2;
        ctx.strokeRect(gx + 1, gy + 1, gw - 4, gh - 4);
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      }

      // Item icon — scaled to fill the first cell nicely
      const sprite = this.sprites.items.get(item.definition.id);
      if (sprite) {
        const spriteSize = Math.floor(L.cell * 0.65);
        const sx = L.gridX + item.position.col * L.cell + (L.cell - spriteSize) / 2;
        const sy = L.gridY + item.position.row * L.cell + (L.cell - spriteSize) / 2;
        ctx.drawImage(sprite, sx, sy, spriteSize, spriteSize);
      }

      // Item name label (bottom of first cell)
      const lx = L.gridX + item.position.col * L.cell + 3;
      const ly = L.gridY + item.position.row * L.cell + L.cell - 4;
      ctx.font = L.fontTiny;
      ctx.fillStyle = '#ffffff';
      ctx.globalAlpha = 0.9;
      ctx.fillText(item.definition.name.slice(0, 8), lx, ly);
      ctx.globalAlpha = 1;

      // Upgrade level badge (gold "+N", top-left corner) — merge-duplicates system
      const upLvl = game.backpack.getUpgradeLevel(item);
      if (upLvl > 0) {
        const ix = L.gridX + item.position.col * L.cell;
        const iy = L.gridY + item.position.row * L.cell;
        const bw = Math.floor(L.cell * 0.42);
        const bh = Math.floor(L.h * 0.018);
        ctx.fillStyle = '#1a1206';
        ctx.fillRect(ix + 2, iy + 2, bw, bh);
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 1;
        ctx.strokeRect(ix + 2, iy + 2, bw, bh);
        ctx.fillStyle = '#fbbf24';
        ctx.font = `bold ${Math.floor(L.h * 0.012)}px monospace`;
        ctx.textAlign = 'center';
        ctx.fillText('+' + upLvl, ix + 2 + bw / 2, iy + 2 + bh - 3);
        ctx.textAlign = 'left';
      }

      // Fusion name badge (below item name)
      if (hasFusion) {
        const fname = String((item.state as any).fusedName);
        const badgeX = L.gridX + item.position.col * L.cell;
        const badgeY = L.gridY + item.position.row * L.cell + L.cell + 1;
        ctx.font = `bold ${Math.floor(L.h * 0.009)}px monospace`;
        ctx.fillStyle = '#f472b6';
        ctx.fillText('★' + fname.slice(0, 10), badgeX + 2, badgeY + 8);
      }
    }
  }

  /** Tooltip when hovering over placed items */
  private renderTooltip(): void {
    if (this.inputHandler?.heldItem) return;
    const { ctx, game } = this;
    const L = this.getLayout();

    const gridCol = Math.floor((this.mouseX - L.gridX) / L.cell);
    const gridRow = Math.floor((this.mouseY - L.gridY) / L.cell);
    if (gridCol < 0 || gridRow < 0 || gridCol >= game.backpack.cols || gridRow >= game.backpack.rows) return;

    // Hover highlight on grid cell
    const hx = L.gridX + gridCol * L.cell;
    const hy = L.gridY + gridRow * L.cell;
    ctx.fillStyle = 'rgba(99, 102, 241, 0.15)';
    ctx.fillRect(hx, hy, L.cell - 2, L.cell - 2);
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.4)';
    ctx.lineWidth = 1;
    ctx.strokeRect(hx, hy, L.cell - 2, L.cell - 2);

    const item = game.backpack.getItemAt(gridCol, gridRow);
    if (!item) return;

    // Calculate tooltip dimensions
    const w = Math.floor(L.w * 0.24);
    const lineH = Math.floor(L.h * 0.018);
    const hasFusion = !!(item.state as any).fusedName;
    const fusionName = hasFusion ? String((item.state as any).fusedName) : '';
    const upLvl = game.backpack.getUpgradeLevel(item);
    const maxUp = game.backpack.maxUpgrade;
    const hasStats = item.stats.damage > 0 || item.stats.fireRate > 0 || item.stats.healPerSecond > 0;
    // Find possible fusions not yet active
    const allBackpackIds = game.backpack.getAllItems().map(i => i.definition.id);
    const pendingFusions = ALL_COMBINATIONS.filter(c => {
      if ((item.state as any).fusedName) return false; // already fused
      const isA = c.itemA === item.definition.id;
      const isB = c.itemB === item.definition.id;
      if (!isA && !isB) return false;
      const partnerId = isA ? c.itemB : c.itemA;
      return allBackpackIds.includes(partnerId);
    });
    const h = Math.floor(L.h * 0.22) + (hasFusion ? lineH * 2 : 0) + (hasStats ? lineH * 3 : 0) + (pendingFusions.length > 0 ? lineH * (pendingFusions.length + 1) : 0) + lineH;

    // Position tooltip (avoid clipping edges)
    let tx = this.mouseX + 15;
    let ty = this.mouseY - 10;
    if (tx + w > L.w) tx = this.mouseX - w - 10;
    if (ty + h > L.h) ty = L.h - h - 5;
    if (ty < 5) ty = 5;

    // Background with subtle gradient effect
    ctx.fillStyle = 'rgba(6, 6, 18, 0.97)';
    ctx.fillRect(tx, ty, w, h);
    // Accent bar at top
    const rarityColors = ['#94a3b8', '#4ade80', '#3b82f6', '#a855f7'];
    const rarityColor = hasFusion
      ? (((item.state as any).fusionColor as string) || '#f472b6')
      : rarityColors[Math.min(item.definition.rarity, 3)];
    ctx.fillStyle = rarityColor;
    ctx.fillRect(tx, ty, w, 3);
    ctx.strokeStyle = rarityColor + '80';
    ctx.lineWidth = 1;
    ctx.strokeRect(tx, ty, w, h);

    let cy = ty + 20;

    // Item icon (large) in top-right of tooltip
    const sprite = this.sprites.items.get(item.definition.id);
    if (sprite) {
      const iconSize = Math.floor(L.h * 0.05);
      ctx.drawImage(sprite, tx + w - iconSize - 8, ty + 8, iconSize, iconSize);
    }

    // Name (or fusion name if fused)
    ctx.font = `bold ${Math.floor(L.h * 0.016)}px monospace`;
    if (hasFusion) {
      ctx.fillStyle = '#f472b6';
      ctx.fillText(`★ ${fusionName}`, tx + 8, cy);
      cy += lineH;
      ctx.font = `${Math.floor(L.h * 0.011)}px monospace`;
      ctx.fillStyle = '#64748b';
      ctx.fillText(`(${item.definition.name})`, tx + 8, cy);
    } else {
      ctx.fillStyle = '#e2e8f0';
      ctx.fillText(item.definition.name, tx + 8, cy);
    }
    cy += lineH + 2;

    // Rarity label
    const rarityNames = ['Comum', 'Incomum', 'Raro', 'Lendário'];
    ctx.font = `${Math.floor(L.h * 0.010)}px monospace`;
    ctx.fillStyle = rarityColor;
    ctx.fillText(`[${rarityNames[Math.min(item.definition.rarity, 3)]}]`, tx + 8, cy);
    cy += lineH - 2;

    // Upgrade level / hint (merge-duplicates system)
    if (upLvl > 0) {
      ctx.font = `bold ${Math.floor(L.h * 0.011)}px monospace`;
      ctx.fillStyle = '#fbbf24';
      ctx.fillText(upLvl >= maxUp ? `⬆ Nível +${upLvl} (MÁX)` : `⬆ Nível +${upLvl} / +${maxUp}`, tx + 8, cy);
      cy += lineH;
    } else {
      ctx.font = `${Math.floor(L.h * 0.0095)}px monospace`;
      ctx.fillStyle = '#fbbf2499';
      ctx.fillText('Solte um item igual em cima para melhorar', tx + 8, cy);
      cy += lineH;
    }

    // Tags with colored dots
    ctx.font = `${Math.floor(L.h * 0.010)}px monospace`;
    ctx.fillStyle = '#a78bfa';
    ctx.fillText(item.definition.tags.join(' • '), tx + 8, cy);
    cy += lineH;

    // Description (word-wrapped)
    ctx.fillStyle = '#94a3b8';
    ctx.font = `${Math.floor(L.h * 0.011)}px monospace`;
    const words = item.definition.description.split(' ');
    let line = '';
    for (const word of words) {
      const test = line + word + ' ';
      if (ctx.measureText(test).width > w - 20 && line) {
        ctx.fillText(line.trim(), tx + 8, cy);
        line = word + ' ';
        cy += lineH;
        if (cy > ty + h - lineH * 5) break;
      } else {
        line = test;
      }
    }
    if (line) { ctx.fillText(line.trim(), tx + 8, cy); cy += lineH; }

    // ─── Computed Stats Panel ────────────────────────────────────────────
    if (hasStats) {
      cy += 4;
      // Divider line
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(tx + 8, cy); ctx.lineTo(tx + w - 8, cy);
      ctx.stroke();
      cy += 8;

      ctx.font = `bold ${Math.floor(L.h * 0.010)}px monospace`;
      ctx.fillStyle = '#64748b';
      ctx.fillText('STATS (com sinergias)', tx + 8, cy);
      cy += lineH;

      ctx.font = `${Math.floor(L.h * 0.011)}px monospace`;
      const effDmg = item.stats.damage * item.stats.damageMultiplier;
      const effRate = item.stats.fireRate * item.stats.fireRateMultiplier;
      const dps = effDmg * effRate * item.stats.projectileCount;

      if (item.stats.damage > 0) {
        ctx.fillStyle = '#ef4444';
        ctx.fillText(`⚔ Dano: ${effDmg.toFixed(1)}`, tx + 8, cy);
        if (item.stats.damageMultiplier > 1) {
          ctx.fillStyle = '#4ade80';
          ctx.fillText(`(x${item.stats.damageMultiplier.toFixed(2)})`, tx + Math.floor(w * 0.45), cy);
        }
        cy += lineH;
      }
      if (item.stats.fireRate > 0) {
        ctx.fillStyle = '#fbbf24';
        ctx.fillText(`⚡ Cadência: ${effRate.toFixed(2)}/s`, tx + 8, cy);
        if (item.stats.fireRateMultiplier > 1) {
          ctx.fillStyle = '#4ade80';
          ctx.fillText(`(x${item.stats.fireRateMultiplier.toFixed(2)})`, tx + Math.floor(w * 0.45), cy);
        }
        cy += lineH;
      }
      if (item.stats.projectileCount > 1) {
        ctx.fillStyle = '#6366f1';
        ctx.fillText(`◆ Projéteis: ${item.stats.projectileCount}`, tx + 8, cy);
        cy += lineH;
      }
      if (item.stats.aoeRadius > 0) {
        ctx.fillStyle = '#f97316';
        ctx.fillText(`◉ AoE: ${item.stats.aoeRadius.toFixed(0)}px`, tx + 8, cy);
        cy += lineH;
      }
      if (item.stats.healPerSecond > 0) {
        ctx.fillStyle = '#4ade80';
        ctx.fillText(`♥ Cura: ${item.stats.healPerSecond.toFixed(1)}/s`, tx + 8, cy);
        cy += lineH;
      }
      if (dps > 0) {
        ctx.fillStyle = '#e2e8f0';
        ctx.font = `bold ${Math.floor(L.h * 0.011)}px monospace`;
        ctx.fillText(`DPS: ${dps.toFixed(1)}`, tx + 8, cy);
        cy += lineH;
      }
    }

    // ─── Footer: sell value + adjacency count ────────────────────────────
    cy += 4;
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(tx + 8, cy); ctx.lineTo(tx + w - 8, cy);
    ctx.stroke();
    cy += 8;

    ctx.font = `${Math.floor(L.h * 0.010)}px monospace`;
    ctx.fillStyle = '#fbbf24';
    ctx.fillText(`💰 Venda: ${Math.floor(item.definition.cost * 0.5)}g`, tx + 8, cy);

    // Show adjacency synergy count
    const adjItems = game.backpack.getAdjacentItems(item.instanceId);
    if (adjItems.length > 0) {
      ctx.fillStyle = '#6366f1';
      ctx.fillText(`🔗 Adjacentes: ${adjItems.length}`, tx + Math.floor(w * 0.5), cy);
    }
    cy += lineH;

    // ─── Pending Fusion Hints ────────────────────────────────────────────
    if (pendingFusions.length > 0) {
      ctx.strokeStyle = '#4a044e';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(tx + 8, cy); ctx.lineTo(tx + w - 8, cy);
      ctx.stroke();
      cy += 6;
      ctx.font = `bold ${Math.floor(L.h * 0.010)}px monospace`;
      ctx.fillStyle = '#d946ef';
      ctx.fillText('FUSÕES POSSÍVEIS:', tx + 8, cy);
      cy += lineH - 2;
      ctx.font = `${Math.floor(L.h * 0.010)}px monospace`;
      for (const fc of pendingFusions) {
        const partnerId = fc.itemA === item.definition.id ? fc.itemB : fc.itemA;
        const partnerDef = game.backpack.getAllItems().find(i => i.definition.id === partnerId)?.definition;
        const partnerName = partnerDef?.name ?? partnerId;
        ctx.fillStyle = (fc.fusionColor as string) || '#f472b6';
        ctx.fillText(`★ ${fc.resultName}`, tx + 8, cy);
        ctx.fillStyle = '#64748b';
        ctx.fillText(`  ← junto com ${partnerName}`, tx + 8 + Math.floor(w * 0.38), cy);
        cy += lineH - 2;
      }
    }
  }

  /** Sell zone at the bottom of inventory/shop */
  private renderSellZone(): void {
    const { ctx, canvas } = this;
    const L = this.getLayout();
    const held = this.inputHandler?.heldItem;
    const isHovering = held && this.mouseY > L.sellZoneY;
    const zoneH = L.h - L.sellZoneY;

    ctx.fillStyle = isHovering ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.1)';
    ctx.fillRect(0, L.sellZoneY, canvas.width, zoneH);
    ctx.strokeStyle = isHovering ? '#ef4444' : '#7f1d1d';
    ctx.lineWidth = 2;
    ctx.strokeRect(2, L.sellZoneY + 2, canvas.width - 4, zoneH - 4);

    ctx.font = `bold ${Math.floor(L.h * 0.016)}px monospace`;
    ctx.fillStyle = isHovering ? '#ef4444' : '#991b1b';
    ctx.textAlign = 'center';
    const label = held
      ? `VENDER (${Math.floor(held.definition.cost * 0.5)}g)`
      : 'VENDER (arraste aqui)';
    ctx.fillText(label, L.cx, L.sellZoneY + zoneH / 2 + 4);
    ctx.textAlign = 'left';
  }

  private renderPowerSummary(): void {
    const { ctx, game } = this;
    const L = this.getLayout();
    const power = game.backpack.calculateBackpackPower();
    const x = L.panelX;
    const y = L.panelY;
    const panelW = Math.floor(L.w * 0.20);
    const panelH = Math.floor(L.h * 0.35);

    // Panel background
    ctx.fillStyle = 'rgba(8, 8, 18, 0.92)';
    ctx.fillRect(x - 10, y - 20, panelW, panelH);
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.strokeRect(x - 10, y - 20, panelW, panelH);

    // Title
    ctx.font = `bold ${Math.floor(L.h * 0.018)}px monospace`;
    ctx.fillStyle = '#e2e8f0';
    ctx.fillText('PODER DE COMBATE', x, y);

    // Accent bar
    ctx.fillStyle = '#6366f1';
    ctx.fillRect(x, y + 4, Math.floor(panelW * 0.6), 2);

    const lineH = Math.floor(L.h * 0.026);
    let cy = y + lineH;

    // DPS (total damage per second)
    const dps = power.totalDamage * (power.totalFireRate > 0 ? power.totalFireRate / power.emitters.length : 0);
    ctx.font = `bold ${Math.floor(L.h * 0.016)}px monospace`;
    ctx.fillStyle = '#ef4444';
    ctx.fillText(`DPS: ${(dps * power.totalProjectiles / Math.max(1, power.emitters.length)).toFixed(1)}`, x, cy);
    cy += lineH;

    // Stats with icons
    ctx.font = `${Math.floor(L.h * 0.013)}px monospace`;
    ctx.fillStyle = '#f87171';
    ctx.fillText(`⚔ Dano: ${power.totalDamage.toFixed(1)}`, x, cy); cy += lineH;
    ctx.fillStyle = '#fbbf24';
    ctx.fillText(`⚡ Cadência: ${power.totalFireRate.toFixed(1)}/s`, x, cy); cy += lineH;
    ctx.fillStyle = '#6366f1';
    ctx.fillText(`◆ Projéteis: ${power.totalProjectiles}`, x, cy); cy += lineH;
    ctx.fillStyle = '#4ade80';
    ctx.fillText(`♥ Cura: ${power.totalHeal.toFixed(1)}/s`, x, cy); cy += lineH;
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`🛡 Armadura: ${power.totalArmor}`, x, cy); cy += lineH;
    ctx.fillStyle = '#a78bfa';
    ctx.fillText(`⊕ Emissores: ${power.emitters.length}`, x, cy); cy += lineH;

    // Fusion counter
    const allItems = game.backpack.getAllItems();
    const fusionCount = allItems.filter(i => (i.state as any).fusedName).length;
    if (fusionCount > 0) {
      cy += 4;
      ctx.fillStyle = '#f472b6';
      ctx.font = `bold ${Math.floor(L.h * 0.013)}px monospace`;
      ctx.fillText(`★ Fusões Ativas: ${fusionCount}`, x, cy);
      cy += lineH;

      // List active fusions (max 3)
      ctx.font = `${Math.floor(L.h * 0.010)}px monospace`;
      const fusedItems = allItems.filter(i => (i.state as any).fusedName).slice(0, 3);
      for (const fi of fusedItems) {
        ctx.fillStyle = '#f9a8d4';
        ctx.fillText(`  ${(fi.state as any).fusedName}`, x, cy);
        cy += Math.floor(lineH * 0.75);
      }
    }

    // Gold
    cy += 4;
    const coin = this.sprites.ui.get('gold_coin');
    if (coin) {
      ctx.drawImage(coin, x - 2, cy - 6);
      ctx.fillStyle = '#fbbf24';
      ctx.font = `bold ${Math.floor(L.h * 0.014)}px monospace`;
      ctx.fillText(`${game.gold}`, x + 12, cy);
    }
  }

  // ─── Combat Phase ───────────────────────────────────────────────────────

  private renderCombat(dt: number): void {
    const { ctx, canvas, game } = this;
    const state = game.combat.state;
    const L = this.getLayout();

    // Smooth HP
    this.displayHp += (state.playerHp - this.displayHp) * Math.min(1, dt * 8);

    // Ground zone indicator (subtle gradient at bottom)
    const groundGrad = ctx.createLinearGradient(0, canvas.height - 80, 0, canvas.height);
    groundGrad.addColorStop(0, 'transparent');
    groundGrad.addColorStop(1, 'rgba(99, 102, 241, 0.08)');
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, canvas.height - 80, canvas.width, 80);
    // Ground line
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height - 55);
    ctx.lineTo(canvas.width, canvas.height - 55);
    ctx.stroke();

    // Track enemy deaths for explosion effects
    const currentEnemyIds = new Set(state.enemies.map(e => e.id));
    for (const [id, data] of this.prevEnemyPositions) {
      if (!currentEnemyIds.has(id)) {
        const pos = data;
        // Color explosion based on enemy element
        const color = (pos as any).color || '#ef4444';
        this.spawnExplosion(pos.x, pos.y, 25, color);
        this.spawnParticles(pos.x, pos.y, color, 6);
        this.spawnParticles(pos.x, pos.y, '#fbbf24', 4);
      }
    }
    this.prevEnemyPositions.clear();
    for (const e of state.enemies) {
      // Store position + color hint based on tags
      let color = '#ef4444';
      if (e.tags.includes('Fogo')) color = '#f97316';
      else if (e.tags.includes('Gelo') || e.tags.includes('Água')) color = '#38bdf8';
      else if (e.tags.includes('Elétrico')) color = '#facc15';
      else if (e.tags.includes('Veneno')) color = '#a855f7';
      else if (e.tags.includes('Orgânico')) color = '#4ade80';
      const posData: any = { x: e.x, y: e.y, color };
      this.prevEnemyPositions.set(e.id, posData);
    }

    // Damage flash — red vignette from edges (more impactful than flat tint)
    if (state.playerFlashTimer > 0) {
      const flashAlpha = state.playerFlashTimer * 2.5;
      const edgeGrad = ctx.createRadialGradient(L.cx, L.cy, Math.floor(L.h * 0.25), L.cx, L.cy, Math.floor(L.h * 0.65));
      edgeGrad.addColorStop(0, 'transparent');
      edgeGrad.addColorStop(1, `rgba(220, 38, 38, ${flashAlpha * 0.6})`);
      ctx.fillStyle = edgeGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Render enemies
    for (const e of state.enemies) {
      this.renderEnemy(e, dt);
    }

    // Off-screen enemy indicators (arrows at top edge)
    const indicatorY = Math.floor(L.h * 0.07);
    for (const e of state.enemies) {
      if (e.y < -5) {
        const arrowX = Math.max(10, Math.min(canvas.width - 10, e.x));
        ctx.globalAlpha = 0.6;
        ctx.fillStyle = e.isBoss ? '#fbbf24' : '#ef4444';
        ctx.beginPath();
        ctx.moveTo(arrowX, indicatorY);
        ctx.lineTo(arrowX - 5, indicatorY + 8);
        ctx.lineTo(arrowX + 5, indicatorY + 8);
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }

    // Render player projectiles with trails
    for (const p of state.projectiles) {
      for (let t = 0; t < p.trail.length; t++) {
        const alpha = (t + 1) / (p.trail.length + 1) * 0.3;
        ctx.globalAlpha = alpha;
        const element = this.getProjectileElement(p.tags);
        ctx.fillStyle = element === 'fire' ? '#f97316'
          : element === 'ice' ? '#67e8f9'
          : element === 'electric' ? '#facc15'
          : '#22d3ee';
        ctx.fillRect(p.trail[t].x - 2, p.trail[t].y - 2, 4, 4);
      }
      ctx.globalAlpha = 1;

      const element = this.getProjectileElement(p.tags);
      const projSprite = this.sprites.projectiles.get(element);
      if (projSprite) {
        ctx.drawImage(projSprite, p.x - 4, p.y - 4);
      } else {
        ctx.fillStyle = '#22d3ee';
        ctx.fillRect(p.x - 3, p.y - 3, 6, 6);
      }
    }

    // Render enemy projectiles (red, with bounce glow for bouncing ones)
    for (const ep of state.enemyProjectiles) {
      if (ep.bounces && ep.bounces > 0) {
        // Bouncing projectile: orange with trail
        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.arc(ep.x, ep.y, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(ep.x, ep.y, 3, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(ep.x, ep.y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fca5a5';
        ctx.beginPath();
        ctx.arc(ep.x, ep.y, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Dash afterimage trail
    if ((game.combat as any).dashActive > 0) {
      const velocity = (game.combat as any).playerVelocity ?? 0;
      const dir = Math.sign(velocity);
      // Draw 3 ghost images behind the player
      for (let gi = 1; gi <= 3; gi++) {
        ctx.globalAlpha = 0.3 - gi * 0.08;
        ctx.fillStyle = '#67e8f9';
        const ghostX = state.playerX - dir * gi * 18;
        ctx.beginPath();
        ctx.moveTo(ghostX, canvas.height - 49);
        ctx.lineTo(ghostX - 10, canvas.height - 25);
        ctx.lineTo(ghostX + 10, canvas.height - 25);
        ctx.closePath();
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      // Ground spark
      ctx.fillStyle = '#67e8f9';
      ctx.globalAlpha = 0.6;
      ctx.beginPath();
      ctx.ellipse(state.playerX, canvas.height - 22, 15, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // Render player character (top-down back view)
    const charId = this.game.characterId;
    const CHARACTER_ORDER = ['grass_man', 'fire_lord', 'aqua_sage', 'storm_runner', 'void_walker', 'beast_tamer', 'firefighter'];
    const charIdx = CHARACTER_ORDER.indexOf(charId);
    // playerShips[0-6] now hold the 7 top-down character sprites
    const playerSprite = (charIdx >= 0 ? this.sprites.playerShips[charIdx] : null)
      ?? this.sprites.playerShips[0];

    // Ground shadow beneath character
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.ellipse(state.playerX, canvas.height - 14, 20, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    // Active skill aura (colored ring when skill is active)
    for (const sk of this.game.skills) {
      if (sk.activeTimer > 0) {
        const auraPulse = 0.2 + Math.sin(performance.now() * 0.008) * 0.1;
        ctx.globalAlpha = auraPulse;
        ctx.strokeStyle = sk.definition.id.includes('fire') || sk.definition.id.includes('inferno') || sk.definition.id.includes('ignite') ? '#f97316'
          : sk.definition.id.includes('phase') || sk.definition.id.includes('void') || sk.definition.id.includes('dark') ? '#a78bfa'
          : sk.definition.id.includes('heal') || sk.definition.id.includes('photo') || sk.definition.id.includes('vine') || sk.definition.id.includes('thorn') ? '#4ade80'
          : sk.definition.id.includes('tidal') || sk.definition.id.includes('whirl') || sk.definition.id.includes('rain') ? '#38bdf8'
          : sk.definition.id.includes('thunder') || sk.definition.id.includes('over') || sk.definition.id.includes('emp') ? '#facc15'
          : '#ec4899';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(state.playerX, canvas.height - 32, 30, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
        break;
      }
    }

    if (playerSprite) {
      // Draw top-down character — 48x48 (larger for visibility)
      ctx.save();
      ctx.imageSmoothingEnabled = false;
      ctx.translate(state.playerX, canvas.height - 32);
      ctx.drawImage(playerSprite, -24, -24, 48, 48);
      ctx.restore();
    } else {
      // Fallback: simple person silhouette
      const px = state.playerX;
      const py = canvas.height - 32;
      ctx.fillStyle = '#4ade80';
      ctx.fillRect(px - 10, py - 18, 20, 24); // body (bigger)
      ctx.beginPath();
      ctx.arc(px, py - 24, 10, 0, Math.PI * 2); // head (bigger)
      ctx.fill();
    }

    // ── Player 2 (COOP) ──────────────────────────────────────────────────────
    if (state.player2Active && state.player2X !== undefined) {
      // P2 shadow
      ctx.globalAlpha = 0.3;
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.ellipse(state.player2X, canvas.height - 18, 14, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      // Use fire_lord (index 1) for P2 top-down character sprite
      const p2Sprite = this.sprites.playerShips[1] ?? this.sprites.playerShips[0];
      if (p2Sprite) {
        ctx.save();
        ctx.translate(state.player2X, canvas.height - 29);
        ctx.drawImage(p2Sprite, -16, -16);
        ctx.restore();
      }
    }

    // Render floating texts (damage numbers, gold)
    for (const ft of state.floatingTexts) {
      const alpha = ft.life / ft.maxLife;
      const lifeRatio = 1 - alpha; // 0=fresh, 1=dead
      // Scale: pops big at first, shrinks slightly
      const ftScale = 1 + Math.max(0, 0.3 - lifeRatio * 0.6);
      const fontSize = Math.floor(L.h * 0.016 * ftScale);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.font = `bold ${fontSize}px monospace`;
      ctx.textAlign = 'center';
      // Drop shadow for readability
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillText(ft.text, ft.x + 1, ft.y + 1);
      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    }
    ctx.globalAlpha = 1;
    ctx.textAlign = 'left';

    // Vignette effect (darkened edges)
    const vigGrad = ctx.createRadialGradient(L.cx, L.cy, Math.floor(L.h * 0.3), L.cx, L.cy, Math.floor(L.h * 0.7));
    vigGrad.addColorStop(0, 'transparent');
    vigGrad.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
    ctx.fillStyle = vigGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    this.renderCombatHUD();
  }

  private renderEnemy(e: Enemy, dt: number): void {
    const { ctx } = this;
    const spriteId = this.getEnemySpriteId(e);
    const sprite = this.sprites.enemies.get(spriteId);

    // Phased enemies are semi-transparent and flickering
    if (e.phased) {
      ctx.globalAlpha = 0.2 + Math.sin(performance.now() * 0.02) * 0.15;
    }

    // Spawn entrance: brief white flash when first entering screen
    if (e.y > -5 && e.y < 30) {
      ctx.globalAlpha = Math.max(0, (30 - e.y) / 30) * 0.5;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.width * 0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = e.phased ? 0.25 : 1;
    }

    // Boss glow/pulse effect
    if (e.isBoss) {
      const pulse = Math.sin(performance.now() * 0.005) * 0.3 + 0.5;
      ctx.globalAlpha = (e.phased ? 0.3 : 1) * pulse * 0.3;
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.width * 0.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = e.phased ? 0.25 : 1;
    }

    // Elite enemy golden outline
    if ((e as any).isElite && !e.isBoss) {
      const elitePulse = 0.5 + Math.sin(performance.now() * 0.006) * 0.3;
      ctx.globalAlpha = elitePulse;
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.width * 0.6 + 3, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // Charging enemies glow red
    if (e.charging) {
      ctx.globalAlpha = (e.phased ? 0.25 : 1);
      ctx.fillStyle = 'rgba(239, 68, 68, 0.4)';
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.width * 0.6, 0, Math.PI * 2);
      ctx.fill();
    }

    if (sprite) {
      // Draw 40% larger than hitbox for visual punch
      const drawW = Math.floor(e.width * 1.4);
      const drawH = Math.floor(e.height * 1.4);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(sprite, e.x - drawW / 2, e.y - drawH / 2, drawW, drawH);
      ctx.imageSmoothingEnabled = true;
    } else {
      // Procedural enemy shapes — also 40% larger visually
      const vw = Math.floor(e.width * 1.4);
      const vh = Math.floor(e.height * 1.4);
      switch (e.movement) {
        case 'straight':
          ctx.fillStyle = e.isBoss ? '#fbbf24' : '#ef4444';
          ctx.fillRect(e.x - vw / 2, e.y - vh / 2, vw, vh);
          ctx.fillStyle = 'rgba(255,255,255,0.2)';
          ctx.fillRect(e.x - vw / 2, e.y - vh / 2, vw, 3);
          break;
        case 'sine':
          ctx.fillStyle = '#a855f7';
          ctx.beginPath();
          ctx.moveTo(e.x, e.y - vh / 2);
          ctx.lineTo(e.x + vw / 2, e.y);
          ctx.lineTo(e.x, e.y + vh / 2);
          ctx.lineTo(e.x - vw / 2, e.y);
          ctx.closePath();
          ctx.fill();
          break;
        case 'zigzag':
          ctx.fillStyle = '#f97316';
          ctx.beginPath();
          ctx.moveTo(e.x - vw / 2, e.y - vh / 2);
          ctx.lineTo(e.x + vw / 2, e.y - vh / 2);
          ctx.lineTo(e.x, e.y + vh / 2);
          ctx.closePath();
          ctx.fill();
          break;
        case 'erratic':
          ctx.fillStyle = '#facc15';
          ctx.beginPath();
          ctx.arc(e.x, e.y, vw / 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = 'rgba(0,0,0,0.3)';
          ctx.beginPath();
          ctx.arc(e.x - 2, e.y - 2, vw * 0.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(e.x + 3, e.y - 2, vw * 0.2, 0, Math.PI * 2);
          ctx.fill();
          break;
        case 'charge':
          ctx.fillStyle = e.charging ? '#ff6b6b' : '#ef4444';
          ctx.beginPath();
          ctx.moveTo(e.x, e.y + vh / 2);
          ctx.lineTo(e.x - vw / 2, e.y - vh / 3);
          ctx.lineTo(e.x - vw / 4, e.y - vh / 3);
          ctx.lineTo(e.x - vw / 4, e.y - vh / 2);
          ctx.lineTo(e.x + vw / 4, e.y - vh / 2);
          ctx.lineTo(e.x + vw / 4, e.y - vh / 3);
          ctx.lineTo(e.x + vw / 2, e.y - vh / 3);
          ctx.closePath();
          ctx.fill();
          break;
        case 'strafe':
          // Hexagon (turret-like)
          ctx.fillStyle = '#3b82f6';
          ctx.beginPath();
          for (let a = 0; a < 6; a++) {
            const angle = (a / 6) * Math.PI * 2 - Math.PI / 2;
            const hx = e.x + Math.cos(angle) * vw / 2;
            const hy = e.y + Math.sin(angle) * vh / 2;
            if (a === 0) ctx.moveTo(hx, hy);
            else ctx.lineTo(hx, hy);
          }
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = '#1d4ed8';
          ctx.fillRect(e.x - 3, e.y, 6, vh / 2);
          break;
        default:
          ctx.fillStyle = e.isBoss ? '#fbbf24' : '#ef4444';
          ctx.fillRect(e.x - vw / 2, e.y - vh / 2, vw, vh);
      }

      // Eyes for non-boss regular enemies (gives them character)
      if (!e.isBoss && e.width >= 16) {
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        const eyeSize = Math.max(2, e.width * 0.12);
        ctx.beginPath();
        ctx.arc(e.x - e.width * 0.15, e.y - e.height * 0.1, eyeSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(e.x + e.width * 0.15, e.y - e.height * 0.1, eyeSize, 0, Math.PI * 2);
        ctx.fill();
        // Pupils
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(e.x - e.width * 0.15, e.y - e.height * 0.08, eyeSize * 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(e.x + e.width * 0.15, e.y - e.height * 0.08, eyeSize * 0.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Armor indicator (blue shield arc)
    if (e.armorHits !== undefined && e.armorHits > 0) {
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.width * 0.55, -Math.PI * 0.7, Math.PI * 0.7);
      ctx.stroke();
      // Armor hits counter
      ctx.font = `bold 9px monospace`;
      ctx.fillStyle = '#38bdf8';
      ctx.textAlign = 'center';
      ctx.fillText(`${e.armorHits}`, e.x, e.y - e.height / 2 - 10);
      ctx.textAlign = 'left';
    }

    // ── HP bar ────────────────────────────────────────────────────────────
    const hpPct = e.hp / e.maxHp;
    const barW  = e.isBoss ? Math.min(240, e.width * 2.5) : e.width;
    const barH  = e.isBoss ? 7 : 4;
    const barX  = e.x - barW / 2;
    const barY  = e.y - e.height / 2 - (e.isBoss ? 10 : 7);
    const hpColor = hpPct > 0.5 ? '#4ade80' : hpPct > 0.25 ? '#f59e0b' : '#ef4444';

    ctx.fillStyle = '#111827';
    ctx.fillRect(barX - 1, barY - 1, barW + 2, barH + 2);
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(barX, barY, barW, barH);
    ctx.fillStyle = hpColor;
    ctx.fillRect(barX, barY, barW * hpPct, barH);
    // Shine
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    ctx.fillRect(barX, barY, barW * hpPct, Math.floor(barH * 0.4));

    if (e.isBoss) {
      // Boss phase 2 indicator on HP bar
      if (e.boss2ndPhaseActive) {
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 1;
        ctx.strokeRect(barX - 1, barY - 1, barW + 2, barH + 2);
      }
      // 50% marker line
      ctx.fillStyle = 'rgba(239,68,68,0.5)';
      ctx.fillRect(barX + barW * 0.5 - 1, barY, 2, barH);
      // Boss HP text
      ctx.font = `bold 9px monospace`;
      ctx.fillStyle = '#e2e8f0';
      ctx.textAlign = 'center';
      ctx.fillText(`${Math.ceil(e.hp)} / ${e.maxHp}`, e.x, barY - 2);
      ctx.textAlign = 'left';
    }

    // ── Support / Special auras ───────────────────────────────────────────
    if ((e as any).defId === 'healer') {
      ctx.globalAlpha = 0.3 + Math.sin(performance.now() * 0.005) * 0.1;
      ctx.strokeStyle = '#4ade80';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(e.x, e.y, 50, 0, Math.PI * 2);
      ctx.stroke();
    }
    if ((e as any).defId === 'war_drum') {
      ctx.globalAlpha = 0.25 + Math.sin(performance.now() * 0.006) * 0.1;
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(e.x, e.y, 60, 0, Math.PI * 2);
      ctx.stroke();
    }
    // Leech drain range pulse
    if (e.special?.type === 'drain') {
      const dPulse = 0.12 + Math.sin(performance.now() * 0.009) * 0.08;
      ctx.globalAlpha = dPulse;
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.special.range, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Reset alpha
    ctx.globalAlpha = 1;
  }

  private renderCombatHUD(): void {
    const { ctx, canvas, game } = this;
    const state = game.combat.state;
    const L = this.getLayout();
    const hudH = Math.floor(L.h * 0.072);
    const now = performance.now();

    // ── Drain warning flash (red vignette at edges) ──────────────────────
    if (state.drainWarningTimer > 0) {
      const alpha = state.drainWarningTimer * 0.5 * (0.7 + Math.sin(now * 0.025) * 0.3);
      ctx.globalAlpha = alpha;
      const vGrad = ctx.createRadialGradient(L.cx, L.cy, L.h * 0.25, L.cx, L.cy, L.h * 0.75);
      vGrad.addColorStop(0, 'transparent');
      vGrad.addColorStop(1, '#a855f7');
      ctx.fillStyle = vGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = 1;
    }

    // ── Boss phase 2 transition flash ────────────────────────────────────
    if (state.bossPhaseTransitionTimer > 0) {
      const t = state.bossPhaseTransitionTimer;
      if (t > 2.0) {
        const flashAlpha = (t - 2.0) * 0.7;
        ctx.globalAlpha = flashAlpha;
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = 1;
      }
      const pulseAlpha = 0.06 + Math.sin(now * 0.015) * 0.04;
      ctx.globalAlpha = pulseAlpha;
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = 1;
      // Banner
      ctx.font = `bold ${Math.floor(L.h * 0.028)}px monospace`;
      ctx.fillStyle = '#ef4444';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#ef4444'; ctx.shadowBlur = 18;
      const shk = Math.sin(now * 0.025) * 4;
      ctx.fillText('⚠ FASE 2 ⚠', L.cx + shk, Math.floor(L.h * 0.22));
      ctx.shadowBlur = 0;
      ctx.textAlign = 'left';
    }

    // ── Aliencore tint ───────────────────────────────────────────────────
    if (game.aliencoreMode) {
      ctx.fillStyle = 'rgba(239, 68, 68, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // ── Top HUD bar ──────────────────────────────────────────────────────
    const barGrad = ctx.createLinearGradient(0, 0, 0, hudH);
    barGrad.addColorStop(0, 'rgba(0,0,0,0.92)');
    barGrad.addColorStop(1, 'rgba(0,0,0,0.72)');
    ctx.fillStyle = barGrad;
    ctx.fillRect(0, 0, canvas.width, hudH);
    // Bottom edge accent
    ctx.fillStyle = 'rgba(99,102,241,0.18)';
    ctx.fillRect(0, hudH - 1, canvas.width, 1);

    // ── LEFT: HP + Shield ────────────────────────────────────────────────
    const hpBarW = Math.floor(L.w * 0.175);
    const hpBarH = Math.floor(hudH * 0.38);
    const hpBarX = Math.floor(L.w * 0.01);
    const hpBarY = Math.floor(hudH * 0.12);

    const hpPct = Math.max(0, this.displayHp / state.playerMaxHp);
    const hpColor = hpPct > 0.5 ? '#4ade80' : hpPct > 0.25 ? '#f59e0b' : '#ef4444';

    // HP label
    ctx.font = `bold ${Math.floor(L.h * 0.011)}px monospace`;
    ctx.fillStyle = '#4b5563';
    ctx.fillText('♥  HP', hpBarX, hpBarY - 2);

    // HP bar bg
    ctx.fillStyle = '#111827';
    ctx.fillRect(hpBarX, hpBarY, hpBarW, hpBarH);
    // HP fill
    ctx.fillStyle = hpColor;
    ctx.fillRect(hpBarX + 1, hpBarY + 1, Math.floor((hpBarW - 2) * hpPct), hpBarH - 2);
    // HP shine
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.fillRect(hpBarX + 1, hpBarY + 1, Math.floor((hpBarW - 2) * hpPct), Math.floor(hpBarH * 0.38));
    // HP border
    ctx.strokeStyle = hpPct < 0.25 ? '#ef444480' : 'rgba(255,255,255,0.18)';
    ctx.lineWidth = 1;
    ctx.strokeRect(hpBarX, hpBarY, hpBarW, hpBarH);

    // HP text inside bar
    ctx.font = `bold ${Math.floor(hpBarH * 0.65)}px monospace`;
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'right';
    ctx.fillText(`${Math.ceil(state.playerHp)}/${state.playerMaxHp}`, hpBarX + hpBarW - 4, hpBarY + hpBarH - 3);
    ctx.textAlign = 'left';

    // Last Stand pulse
    if (hpPct < 0.25 && (game.combat as any)._lastStandActive) {
      const pulse2 = 0.3 + Math.sin(now * 0.008) * 0.25;
      ctx.globalAlpha = pulse2;
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.strokeRect(hpBarX - 1, hpBarY - 1, hpBarW + 2, hpBarH + 2);
      ctx.globalAlpha = 1;
      ctx.font = `bold ${Math.floor(L.h * 0.01)}px monospace`;
      ctx.fillStyle = '#fbbf24';
      ctx.fillText('ÚLTIMO RECURSO!', hpBarX, hpBarY + hpBarH + 11);
    }

    // Shield bar (slim, below HP)
    if (state.playerMaxShield > 0) {
      const shY = hpBarY + hpBarH + 3;
      const shH = Math.floor(hudH * 0.14);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(hpBarX, shY, hpBarW, shH);
      const shPct = state.playerShield / state.playerMaxShield;
      if (shPct > 0) {
        ctx.fillStyle = state.shieldRegenDelay > 0 ? '#1e40af' : '#38bdf8';
        ctx.fillRect(hpBarX + 1, shY + 1, Math.floor((hpBarW - 2) * shPct), shH - 2);
        ctx.fillStyle = 'rgba(255,255,255,0.12)';
        ctx.fillRect(hpBarX + 1, shY + 1, Math.floor((hpBarW - 2) * shPct), Math.floor(shH * 0.4));
      }
      ctx.strokeStyle = 'rgba(56,189,248,0.35)';
      ctx.lineWidth = 1;
      ctx.strokeRect(hpBarX, shY, hpBarW, shH);
      ctx.font = `${Math.floor(shH * 0.75)}px monospace`;
      ctx.fillStyle = '#67e8f9';
      ctx.textAlign = 'right';
      ctx.fillText(`🛡 ${Math.ceil(state.playerShield)}`, hpBarX + hpBarW - 2, shY + shH - 1);
      ctx.textAlign = 'left';
    }

    // Active synergies (below HP area, tiny pills)
    if (game.activeSynergies.length > 0) {
      ctx.font = `${Math.floor(L.h * 0.0085)}px monospace`;
      ctx.fillStyle = '#6366f1';
      ctx.fillText(game.activeSynergies.slice(0, 5).join(' ◆ '), hpBarX, hudH - 4);
    }

    // ── CENTER-LEFT: Wave date + timer ───────────────────────────────────
    const col2X = Math.floor(L.w * 0.205);
    const timeText = game.getTimeString();
    ctx.font = `bold ${Math.floor(L.h * 0.019)}px monospace`;
    ctx.fillStyle = '#c7d2fe';
    ctx.fillText(timeText, col2X, Math.floor(hudH * 0.52));
    ctx.font = `${Math.floor(L.h * 0.0095)}px monospace`;
    ctx.fillStyle = '#4b5563';
    ctx.fillText(`${state.waveTime.toFixed(0)}s`, col2X, Math.floor(hudH * 0.78));

    // ── CENTER-LEFT: Gold ────────────────────────────────────────────────
    const col3X = Math.floor(L.w * 0.29);
    ctx.font = `bold ${Math.floor(L.h * 0.019)}px monospace`;
    ctx.fillStyle = '#fbbf24';
    ctx.fillText(`⬡ ${state.gold + game.gold}`, col3X, Math.floor(hudH * 0.52));
    ctx.font = `${Math.floor(L.h * 0.0085)}px monospace`;
    ctx.fillStyle = '#78350f';
    ctx.fillText('GOLD', col3X, Math.floor(hudH * 0.78));

    // ── CENTER: Wave progress ────────────────────────────────────────────
    const progX  = Math.floor(L.w * 0.38);
    const progW  = Math.floor(L.w * 0.16);
    const progH  = Math.floor(hudH * 0.28);
    const progY  = Math.floor(hudH * 0.32);
    const killed = state.totalEnemies - state.enemies.length;
    const progPct = state.totalEnemies > 0 ? killed / state.totalEnemies : 0;

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(progX, progY, progW, progH);
    const progGrad = ctx.createLinearGradient(progX, 0, progX + progW * progPct, 0);
    progGrad.addColorStop(0, '#4f46e5');
    progGrad.addColorStop(1, '#818cf8');
    ctx.fillStyle = progGrad;
    ctx.fillRect(progX + 1, progY + 1, Math.floor((progW - 2) * progPct), progH - 2);
    ctx.strokeStyle = 'rgba(99,102,241,0.5)';
    ctx.lineWidth = 1;
    ctx.strokeRect(progX, progY, progW, progH);
    ctx.font = `bold ${Math.floor(progH * 0.75)}px monospace`;
    ctx.fillStyle = '#e2e8f0';
    ctx.textAlign = 'center';
    ctx.fillText(`${killed} / ${state.totalEnemies}`, progX + progW / 2, progY + progH - 3);
    ctx.font = `${Math.floor(L.h * 0.0082)}px monospace`;
    ctx.fillStyle = '#4b5563';
    ctx.fillText('INIMIGOS', progX + progW / 2, progY + progH + Math.floor(L.h * 0.013));
    ctx.textAlign = 'left';

    // DPS (small, below progress)
    ctx.font = `${Math.floor(L.h * 0.0082)}px monospace`;
    ctx.fillStyle = '#f97316';
    ctx.fillText(`DPS ${state.dpsDisplay}`, progX, progY + progH + Math.floor(L.h * 0.026));

    // ── CENTER-RIGHT: Combo ──────────────────────────────────────────────
    if (state.combo > 1) {
      const comboX = Math.floor(L.w * 0.58);
      const comboColor = state.combo >= 15 ? '#ef4444' : state.combo >= 8 ? '#f97316' : '#fbbf24';
      const comboScale = Math.min(1.6, 1 + state.combo * 0.025);
      ctx.font = `bold ${Math.floor(L.h * 0.022 * comboScale)}px monospace`;
      ctx.fillStyle = comboColor;
      ctx.shadowColor = comboColor;
      ctx.shadowBlur = 6 + state.combo * 0.3;
      ctx.fillText(`× ${state.combo}`, comboX, Math.floor(hudH * 0.56));
      ctx.shadowBlur = 0;
      ctx.font = `${Math.floor(L.h * 0.0085)}px monospace`;
      ctx.fillStyle = comboColor + 'aa';
      ctx.fillText('COMBO', comboX, Math.floor(hudH * 0.8));
      const comboBonus = 1 + Math.min(state.combo * 0.1, 2.0);
      ctx.fillStyle = '#4ade80';
      ctx.fillText(`gold ×${comboBonus.toFixed(1)}`, comboX + Math.floor(L.w * 0.075), Math.floor(hudH * 0.8));

      // Big center combo for high streaks
      if (state.combo >= 10) {
        ctx.globalAlpha = 0.22 + Math.sin(now * 0.009) * 0.08;
        ctx.font = `bold ${Math.floor(L.h * 0.075)}px monospace`;
        ctx.fillStyle = comboColor;
        ctx.textAlign = 'center';
        ctx.fillText(`×${state.combo}`, L.cx, L.cy + Math.floor(L.h * 0.03));
        ctx.textAlign = 'left';
        ctx.globalAlpha = 1;
      }
    }

    // ── RIGHT: Score + multiplier + mini portrait ────────────────────────
    const charPortrait = getCharacterPortrait(game.characterId);
    if (charPortrait) {
      const pSize = Math.floor(hudH * 0.82);
      ctx.globalAlpha = 0.85;
      ctx.drawImage(charPortrait, canvas.width - pSize - Math.floor(L.w * 0.105), 3, pSize, pSize);
      ctx.globalAlpha = 1;
    }

    ctx.font = `bold ${Math.floor(L.h * 0.016)}px monospace`;
    ctx.fillStyle = '#a78bfa';
    ctx.textAlign = 'right';
    ctx.fillText(`${state.score}`, canvas.width - Math.floor(L.w * 0.12), Math.floor(hudH * 0.48));
    ctx.font = `${Math.floor(L.h * 0.0082)}px monospace`;
    ctx.fillStyle = '#4b5563';
    ctx.fillText('SCORE', canvas.width - Math.floor(L.w * 0.12), Math.floor(hudH * 0.76));
    if (state.scoreMultiplier > 1.05) {
      const mColor = state.scoreMultiplier >= 3 ? '#fbbf24' : state.scoreMultiplier >= 2 ? '#f97316' : '#a78bfa';
      ctx.font = `bold ${Math.floor(L.h * 0.012)}px monospace`;
      ctx.fillStyle = mColor;
      ctx.fillText(`×${state.scoreMultiplier.toFixed(1)}`, canvas.width - Math.floor(L.w * 0.01), Math.floor(hudH * 0.48));
    }

    // Aliencore badge
    if (game.aliencoreMode) {
      ctx.font = `bold ${Math.floor(L.h * 0.011)}px monospace`;
      ctx.fillStyle = '#ef4444';
      ctx.fillText('ALIENCORE', canvas.width - Math.floor(L.w * 0.12), Math.floor(hudH * 0.76) - Math.floor(L.h * 0.014));
    }
    ctx.textAlign = 'left';

    // ── P2 HP bar (COOP mode) ────────────────────────────────────────────
    if (state.player2Active && state.player2Hp !== undefined && state.player2MaxHp !== undefined) {
      const p2BarW = Math.floor(L.w * 0.12);
      const p2BarH = Math.floor(hudH * 0.32);
      const p2BarX = canvas.width - Math.floor(L.w * 0.01) - p2BarW;
      const p2BarY = Math.floor(hudH * 0.55);
      const p2Pct = Math.max(0, state.player2Hp / state.player2MaxHp);
      const p2Color = p2Pct > 0.5 ? '#ef4444' : p2Pct > 0.25 ? '#f59e0b' : '#b91c1c';
      ctx.font = `bold ${Math.floor(L.h * 0.009)}px monospace`;
      ctx.fillStyle = '#4b5563';
      ctx.textAlign = 'right';
      ctx.fillText('P2 ♥', p2BarX + p2BarW, p2BarY - 2);
      ctx.fillStyle = '#111827';
      ctx.fillRect(p2BarX, p2BarY, p2BarW, p2BarH);
      ctx.fillStyle = p2Color;
      ctx.fillRect(p2BarX + 1, p2BarY + 1, Math.floor((p2BarW - 2) * p2Pct), p2BarH - 2);
      ctx.strokeStyle = 'rgba(255,255,255,0.18)';
      ctx.lineWidth = 1;
      ctx.strokeRect(p2BarX, p2BarY, p2BarW, p2BarH);
      ctx.font = `${Math.floor(p2BarH * 0.6)}px monospace`;
      ctx.fillStyle = '#ffffff';
      ctx.fillText(`${Math.ceil(state.player2Hp)}/${state.player2MaxHp}`, p2BarX + p2BarW - 2, p2BarY + p2BarH - 2);
      ctx.textAlign = 'left';
    }

    // ── Boss Intro (dramatic) ───────────────────────────────────────────
    if (state.bossWarningTimer > 0) {
      const bTimer = state.bossWarningTimer;
      const alpha = Math.min(1, bTimer * 0.8);

      // Dark cinematic bars (top and bottom)
      ctx.globalAlpha = alpha * 0.7;
      ctx.fillStyle = '#000000';
      const barH2 = Math.floor(L.h * 0.08 * Math.min(1, (2 - bTimer) * 3));
      ctx.fillRect(0, 0, canvas.width, barH2);
      ctx.fillRect(0, canvas.height - barH2, canvas.width, barH2);

      // Boss name (find boss in enemies)
      const bossEnemy = state.enemies.find(e => e.isBoss);
      const bossName = bossEnemy ? (bossEnemy as any).displayName || bossEnemy.defId.replace('boss_', '').replace(/_/g, ' ').toUpperCase() : 'BOSS';

      ctx.globalAlpha = alpha;
      ctx.textAlign = 'center';

      // "WARNING" flash
      const flash = Math.sin(now * 0.015) > 0;
      if (flash) {
        ctx.font = `bold ${Math.floor(L.h * 0.018)}px monospace`;
        ctx.fillStyle = '#ef4444';
        ctx.fillText('⚠ WARNING ⚠', L.cx, L.cy - Math.floor(L.h * 0.15));
      }

      // Boss name (large, with glow)
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 15 + Math.sin(now * 0.01) * 5;
      ctx.font = `bold ${Math.floor(L.h * 0.045)}px monospace`;
      ctx.fillStyle = '#fbbf24';
      ctx.fillText(bossName, L.cx, L.cy - Math.floor(L.h * 0.04));
      ctx.shadowBlur = 0;

      // Subtitle
      ctx.font = `${Math.floor(L.h * 0.014)}px monospace`;
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('se aproxima...', L.cx, L.cy + Math.floor(L.h * 0.02));

      ctx.textAlign = 'left';
      ctx.globalAlpha = 1;
    }

    // ── Boss HP Bar (top center, large) ──────────────────────────────────
    const bossAlive = state.enemies.find(e2 => e2.isBoss);
    if (bossAlive && state.bossWarningTimer <= 0) {
      const bHpBarW = Math.floor(L.w * 0.35);
      const bHpBarH = Math.floor(L.h * 0.022);
      const bHpBarX = L.cx - bHpBarW / 2;
      const bHpBarY = hudH + Math.floor(L.h * 0.015);
      const bHpPct = Math.max(0, bossAlive.hp / bossAlive.maxHp);
      // Background
      ctx.fillStyle = '#1f2937';
      ctx.fillRect(bHpBarX, bHpBarY, bHpBarW, bHpBarH);
      // HP fill (red gradient)
      ctx.fillStyle = bHpPct > 0.5 ? '#dc2626' : bHpPct > 0.25 ? '#f97316' : '#fbbf24';
      ctx.fillRect(bHpBarX + 1, bHpBarY + 1, (bHpBarW - 2) * bHpPct, bHpBarH - 2);
      // Shine
      ctx.fillStyle = 'rgba(255,255,255,0.12)';
      ctx.fillRect(bHpBarX + 1, bHpBarY + 1, (bHpBarW - 2) * bHpPct, Math.floor(bHpBarH * 0.4));
      // Border
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 1;
      ctx.strokeRect(bHpBarX, bHpBarY, bHpBarW, bHpBarH);
      // Boss name
      const bName = (bossAlive as any).displayName || bossAlive.defId.replace('boss_', '').replace(/_/g, ' ');
      ctx.font = `bold ${Math.floor(L.h * 0.011)}px monospace`;
      ctx.fillStyle = '#fbbf24';
      ctx.textAlign = 'center';
      ctx.fillText(bName.toUpperCase(), L.cx, bHpBarY - 4);
      // HP text
      ctx.font = `${Math.floor(L.h * 0.009)}px monospace`;
      ctx.fillStyle = '#e2e8f0';
      ctx.fillText(`${Math.ceil(bossAlive.hp)} / ${bossAlive.maxHp}`, L.cx, bHpBarY + bHpBarH + Math.floor(L.h * 0.012));
      ctx.textAlign = 'left';
    }

    // ── Wave Event banner ────────────────────────────────────────────────
    const waveEvent = game.currentWaveEvent;
    if (waveEvent) {
      const bannerW = Math.floor(L.w * 0.22);
      const bannerH = Math.floor(L.h * 0.035);
      const bannerX = L.cx - bannerW / 2;
      const bannerY = hudH + 4;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(bannerX, bannerY, bannerW, bannerH);
      ctx.strokeStyle = waveEvent.color + '80';
      ctx.lineWidth = 1;
      ctx.strokeRect(bannerX, bannerY, bannerW, bannerH);
      ctx.fillStyle = waveEvent.color;
      ctx.fillRect(bannerX, bannerY, 3, bannerH);
      ctx.font = `bold ${Math.floor(L.h * 0.012)}px monospace`;
      ctx.fillStyle = waveEvent.color;
      ctx.textAlign = 'center';
      ctx.fillText(`${waveEvent.icon} ${waveEvent.name}`, L.cx, bannerY + bannerH * 0.65);
      ctx.textAlign = 'left';
    }

    // Controls hint
    // Dash cooldown indicator
    const dashCd = (game.combat as any).dashCooldown ?? 0;
    if (dashCd > 0) {
      ctx.fillStyle = '#374151';
      ctx.fillRect(canvas.width - Math.floor(L.w * 0.06), Math.floor(hudH * 0.7), Math.floor(L.w * 0.05), 4);
      ctx.fillStyle = '#67e8f9';
      ctx.fillRect(canvas.width - Math.floor(L.w * 0.06), Math.floor(hudH * 0.7), Math.floor(L.w * 0.05) * (1 - dashCd), 4);
    } else {
      ctx.font = L.fontTiny;
      ctx.fillStyle = '#67e8f9';
      ctx.textAlign = 'right';
      ctx.fillText('DASH ✓', canvas.width - Math.floor(L.w * 0.01), Math.floor(hudH * 0.7));
    }

    ctx.font = L.fontTiny;
    ctx.fillStyle = '#475569';
    ctx.textAlign = 'right';
    ctx.fillText('A/D mover | SHIFT dash | 1-2-3 skills | ESC pausa', canvas.width - Math.floor(L.w * 0.01), Math.floor(hudH * 0.88));
    ctx.textAlign = 'left';

    // ── Enemy radar (bottom-right) ───────────────────────────────────────
    if (state.enemies.length > 0) {
      const radarW = Math.floor(L.w * 0.13);
      const radarH = Math.floor(L.h * 0.115);
      const radarX = canvas.width - radarW - Math.floor(L.w * 0.012);
      const radarY = canvas.height - radarH - Math.floor(L.h * 0.07);

      // Background panel
      ctx.globalAlpha = 0.82;
      ctx.fillStyle = '#050510';
      ctx.fillRect(radarX - 2, radarY - 14, radarW + 4, radarH + 16);
      ctx.globalAlpha = 1;

      // Scanline grid lines (subtle)
      ctx.globalAlpha = 0.12;
      ctx.strokeStyle = '#4b5563';
      ctx.lineWidth = 1;
      for (let gx = radarX; gx <= radarX + radarW; gx += Math.floor(radarW / 4)) {
        ctx.beginPath(); ctx.moveTo(gx, radarY); ctx.lineTo(gx, radarY + radarH); ctx.stroke();
      }
      for (let gy = radarY; gy <= radarY + radarH; gy += Math.floor(radarH / 3)) {
        ctx.beginPath(); ctx.moveTo(radarX, gy); ctx.lineTo(radarX + radarW, gy); ctx.stroke();
      }
      ctx.globalAlpha = 1;

      // Border
      const radarBossActive = state.enemies.some(e => e.isBoss);
      ctx.strokeStyle = radarBossActive ? '#fbbf24' : 'rgba(99,102,241,0.55)';
      ctx.lineWidth = 1;
      ctx.strokeRect(radarX, radarY, radarW, radarH);

      // Label
      ctx.font = `bold ${Math.floor(L.h * 0.009)}px monospace`;
      ctx.fillStyle = radarBossActive ? '#fbbf24' : '#4b5563';
      ctx.textAlign = 'left';
      ctx.fillText('RADAR', radarX, radarY - 3);
      ctx.fillStyle = '#475569';
      ctx.textAlign = 'right';
      ctx.fillText(`${state.enemies.length}`, radarX + radarW, radarY - 3);
      ctx.textAlign = 'left';

      // Enemy dots
      for (const e of state.enemies) {
        const rx = radarX + (e.x / canvas.width) * radarW;
        const ry = radarY + Math.max(0, Math.min(1, (e.y + 80) / (canvas.height + 80))) * radarH;
        if (e.isBoss) {
          const bPulse = 0.6 + Math.sin(performance.now() * 0.008) * 0.4;
          ctx.globalAlpha = bPulse;
          ctx.fillStyle = '#fbbf24';
          ctx.beginPath(); ctx.arc(rx, ry, 4, 0, Math.PI * 2); ctx.fill();
          ctx.globalAlpha = 1;
        } else {
          ctx.fillStyle = e.special?.type === 'drain' ? '#a855f7' : '#ef4444';
          ctx.fillRect(rx - 1.5, ry - 1.5, 3, 3);
        }
      }

      // Player dot (bright green triangle pointing up)
      const px = radarX + (state.playerX / canvas.width) * radarW;
      const py2 = radarY + radarH - 5;
      ctx.fillStyle = '#4ade80';
      ctx.beginPath();
      ctx.moveTo(px, py2 - 5);
      ctx.lineTo(px - 4, py2 + 2);
      ctx.lineTo(px + 4, py2 + 2);
      ctx.closePath();
      ctx.fill();
    }

    // ─── Skill Bar (bottom-left) ─────────────────────────────────────────
    const skills = game.skills;
    if (skills.length > 0) {
      const skillBarX = Math.floor(L.w * 0.01);
      const skillBarY = canvas.height - Math.floor(L.h * 0.12);
      const skillSize = Math.floor(L.h * 0.06);
      const skillGap = Math.floor(L.w * 0.005);

      for (let i = 0; i < skills.length; i++) {
        const sk = skills[i];
        const sx = skillBarX + i * (skillSize + skillGap);
        const sy = skillBarY;
        const onCd = sk.cooldownRemaining > 0;
        const isActive = sk.activeTimer > 0;

        // Background
        ctx.fillStyle = isActive ? 'rgba(99, 102, 241, 0.4)' : 'rgba(10, 10, 20, 0.85)';
        ctx.fillRect(sx, sy, skillSize, skillSize);

        // Border (active = glowing, ready = bright, cd = dim)
        if (isActive) {
          ctx.strokeStyle = '#818cf8';
          ctx.lineWidth = 2;
          ctx.shadowColor = '#6366f1';
          ctx.shadowBlur = 6;
        } else if (onCd) {
          ctx.strokeStyle = '#374151';
          ctx.lineWidth = 1;
        } else {
          ctx.strokeStyle = '#e2e8f0';
          ctx.lineWidth = 1.5;
        }
        ctx.strokeRect(sx, sy, skillSize, skillSize);
        ctx.shadowBlur = 0;

        // Cooldown overlay (gray sweep)
        if (onCd) {
          const cdPct = sk.cooldownRemaining / sk.definition.cooldown;
          ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
          ctx.fillRect(sx, sy, skillSize, skillSize * cdPct);
          // Cooldown number
          ctx.font = `bold ${Math.floor(L.h * 0.016)}px monospace`;
          ctx.fillStyle = '#94a3b8';
          ctx.textAlign = 'center';
          ctx.fillText(Math.ceil(sk.cooldownRemaining).toString(), sx + skillSize / 2, sy + skillSize * 0.6);
        }

        // Icon
        if (!onCd || sk.cooldownRemaining < sk.definition.cooldown * 0.3) {
          ctx.font = `${Math.floor(skillSize * 0.45)}px monospace`;
          ctx.fillStyle = onCd ? '#475569' : '#ffffff';
          ctx.textAlign = 'center';
          ctx.fillText(sk.definition.icon, sx + skillSize / 2, sy + skillSize * 0.55);
        }

        // Key binding label
        ctx.font = `bold ${Math.floor(L.h * 0.012)}px monospace`;
        ctx.fillStyle = onCd ? '#374151' : '#fbbf24';
        ctx.textAlign = 'center';
        ctx.fillText(`${i + 1}`, sx + skillSize / 2, sy + skillSize + Math.floor(L.h * 0.015));

        // Active timer bar (green bar at bottom of skill)
        if (isActive) {
          const activePct = sk.activeTimer / sk.definition.duration;
          ctx.fillStyle = '#4ade80';
          ctx.fillRect(sx, sy + skillSize - 3, skillSize * activePct, 3);
        }

        ctx.textAlign = 'left';
      }

      // Dash slot — grouped with the skills as a clear control
      if (game.characterId !== 'beast_tamer') {
        const dashX = skillBarX + skills.length * (skillSize + skillGap) + skillGap;
        const dashCd = (game.combat as any).dashCooldown ?? 0;
        const dashReady = dashCd <= 0;
        ctx.fillStyle = 'rgba(40, 30, 8, 0.85)';
        ctx.fillRect(dashX, skillBarY, skillSize, skillSize);
        if (dashReady) { ctx.shadowColor = '#fbbf24'; ctx.shadowBlur = 6; }
        ctx.strokeStyle = dashReady ? '#fbbf24' : '#374151';
        ctx.lineWidth = dashReady ? 1.5 : 1;
        ctx.strokeRect(dashX, skillBarY, skillSize, skillSize);
        ctx.shadowBlur = 0;
        // Cooldown sweep (dash cooldown maxes at 1.0s)
        if (dashCd > 0) {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
          ctx.fillRect(dashX, skillBarY, skillSize, skillSize * Math.min(1, dashCd));
        }
        ctx.font = `${Math.floor(skillSize * 0.45)}px monospace`;
        ctx.fillStyle = dashReady ? '#fbbf24' : '#475569';
        ctx.textAlign = 'center';
        ctx.fillText('💨', dashX + skillSize / 2, skillBarY + skillSize * 0.58);
        ctx.font = `bold ${Math.floor(L.h * 0.011)}px monospace`;
        ctx.fillStyle = dashReady ? '#fbbf24' : '#374151';
        ctx.fillText('SHIFT', dashX + skillSize / 2, skillBarY + skillSize + Math.floor(L.h * 0.015));
        ctx.textAlign = 'left';
      }

      // Skill name tooltip on hover
      for (let i = 0; i < skills.length; i++) {
        const sk = skills[i];
        const sx = skillBarX + i * (skillSize + skillGap);
        const sy = skillBarY;
        if (this.mouseX >= sx && this.mouseX <= sx + skillSize &&
            this.mouseY >= sy && this.mouseY <= sy + skillSize) {
          ctx.fillStyle = 'rgba(8, 8, 20, 0.95)';
          const tipW = Math.floor(L.w * 0.18);
          const tipH = Math.floor(L.h * 0.07);
          const tipX = sx;
          const tipY = sy - tipH - 5;
          ctx.fillRect(tipX, tipY, tipW, tipH);
          ctx.strokeStyle = '#6366f1';
          ctx.lineWidth = 1;
          ctx.strokeRect(tipX, tipY, tipW, tipH);
          ctx.font = `bold ${Math.floor(L.h * 0.012)}px monospace`;
          ctx.fillStyle = '#fbbf24';
          ctx.fillText(sk.definition.name, tipX + 6, tipY + Math.floor(tipH * 0.35));
          ctx.font = `${Math.floor(L.h * 0.009)}px monospace`;
          ctx.fillStyle = '#94a3b8';
          ctx.fillText(sk.definition.description.slice(0, 45), tipX + 6, tipY + Math.floor(tipH * 0.65));
          ctx.fillStyle = '#64748b';
          const powerLvl = sk.usesThisRun > 0 ? ` | Poder: +${Math.min(50, sk.usesThisRun * 5)}%` : '';
          ctx.fillText(`CD: ${sk.definition.cooldown}s${powerLvl}`, tipX + 6, tipY + Math.floor(tipH * 0.9));
        }
      }
    }

    // ─── Potion Bar (right of skills) ────────────────────────────────────
    if (game.potions.length > 0) {
      const potBarX = Math.floor(L.w * 0.20);
      const potBarY = canvas.height - Math.floor(L.h * 0.12);
      const potSize = Math.floor(L.h * 0.05);
      const potGap = Math.floor(L.w * 0.004);

      for (let pi = 0; pi < game.potions.length; pi++) {
        const pot = game.potions[pi];
        const px2 = potBarX + pi * (potSize + potGap);
        const py2 = potBarY;

        ctx.fillStyle = 'rgba(20, 80, 20, 0.7)';
        ctx.fillRect(px2, py2, potSize, potSize);
        ctx.strokeStyle = '#4ade80';
        ctx.lineWidth = 1;
        ctx.strokeRect(px2, py2, potSize, potSize);

        // Icon
        ctx.font = `${Math.floor(potSize * 0.5)}px monospace`;
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText(pot.def.icon, px2 + potSize / 2, py2 + potSize * 0.6);

        // Count
        ctx.font = `bold ${Math.floor(L.h * 0.010)}px monospace`;
        ctx.fillStyle = '#4ade80';
        ctx.fillText(`x${pot.count}`, px2 + potSize / 2, py2 + potSize + Math.floor(L.h * 0.012));

        // Key hint
        ctx.font = `${Math.floor(L.h * 0.009)}px monospace`;
        ctx.fillStyle = '#64748b';
        ctx.fillText(`${pi + 4}`, px2 + potSize / 2, py2 - 4);
        ctx.textAlign = 'left';
      }
    }

    // First wave tutorial — minimal, visual, fades fast
    if (game.totalMonths === 1 && state.waveTime < 4) {
      const tutAlpha = Math.max(0, 1 - state.waveTime * 0.3);
      ctx.globalAlpha = tutAlpha;
      ctx.textAlign = 'center';

      // Key prompts floating near player
      const py = canvas.height - 80;
      ctx.font = `bold ${Math.floor(L.h * 0.02)}px monospace`;

      // Left/Right hint
      ctx.fillStyle = '#fbbf24';
      ctx.fillText('A', state.playerX - 50, py);
      ctx.fillText('D', state.playerX + 50, py);
      ctx.font = `${Math.floor(L.h * 0.012)}px monospace`;
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('mover', state.playerX, py + 18);

      // Skill hint (top)
      if (state.waveTime > 1.5) {
        ctx.font = `bold ${Math.floor(L.h * 0.016)}px monospace`;
        ctx.fillStyle = '#6366f1';
        ctx.fillText('1  2  3', L.cx, Math.floor(L.h * 0.15));
        ctx.font = `${Math.floor(L.h * 0.010)}px monospace`;
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('habilidades', L.cx, Math.floor(L.h * 0.18));
      }

      // Dash hint
      if (state.waveTime > 2.5) {
        ctx.font = `bold ${Math.floor(L.h * 0.014)}px monospace`;
        ctx.fillStyle = '#67e8f9';
        ctx.fillText('SHIFT = dash', L.cx, Math.floor(L.h * 0.85));
      }

      ctx.textAlign = 'left';
      ctx.globalAlpha = 1;
    }
  }

  // ─── Cards Phase ────────────────────────────────────────────────────────

  private renderCards(dt: number): void {
    const { ctx, canvas, game } = this;
    const L = this.getLayout();

    this.cardAnimTimer += dt;

    // Per-card rarity colors (derive from card type or index)
    const rarityColors = ['#60a5fa', '#a78bfa', '#fbbf24']; // blue, purple, gold
    const rarityNames  = ['COMUM',   'RARO',    'ÉPICO'];

    // ─── BACKGROUND — deep dark with radial glow ─────────────────────────
    ctx.fillStyle = '#06060f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // Center radial glow (golden light from cards area)
    const bgGlow = ctx.createRadialGradient(L.cx, L.cy - 20, 0, L.cx, L.cy - 20, Math.floor(L.h * 0.6));
    bgGlow.addColorStop(0, '#fbbf2410');
    bgGlow.addColorStop(0.5, '#6366f108');
    bgGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = bgGlow;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // ─── HEADER ──────────────────────────────────────────────────────────
    // Wave gold result
    const perfectText = game.combat.state.damageTakenThisWave === 0 ? ' ★ PERFEITO!' : '';
    if (game.lastWaveGold > 0) {
      ctx.font = `bold ${Math.floor(L.h * 0.02)}px monospace`;
      ctx.fillStyle = '#4ade80';
      ctx.textAlign = 'center';
      ctx.fillText(`+${game.lastWaveGold} Gold${perfectText}`, L.cx, Math.floor(L.h * 0.055));
      ctx.textAlign = 'left';
    }

    // Title
    ctx.font = `bold ${Math.floor(L.h * 0.03)}px monospace`;
    ctx.fillStyle = '#fbbf24';
    ctx.textAlign = 'center';
    ctx.fillText('ESCOLHA UMA CARTA', L.cx, Math.floor(L.h * 0.095));
    ctx.textAlign = 'left';

    // Thin accent line under title
    const lineW = Math.floor(L.w * 0.22);
    const lineY = Math.floor(L.h * 0.105);
    const lineGrad = ctx.createLinearGradient(L.cx - lineW / 2, 0, L.cx + lineW / 2, 0);
    lineGrad.addColorStop(0, 'transparent');
    lineGrad.addColorStop(0.5, '#fbbf24aa');
    lineGrad.addColorStop(1, 'transparent');
    ctx.strokeStyle = lineGrad as any;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(L.cx - lineW / 2, lineY);
    ctx.lineTo(L.cx + lineW / 2, lineY);
    ctx.stroke();

    // ─── CARDS ──────────────────────────────────────────────────────────
    const cardCount = game.cardChoices.length;
    const cardW = Math.floor(L.w * 0.22);
    const cardH = Math.floor(L.h * 0.67);
    const gap = Math.floor(L.w * 0.035);
    const totalW = cardCount * cardW + (cardCount - 1) * gap;
    const startX = Math.floor((L.w - totalW) / 2);
    const cardTopY = Math.floor(L.h * 0.135);

    // Track hovered card for expand effect
    let hoveredCardIdx = -1;
    for (let i = 0; i < cardCount; i++) {
      const tx = startX + i * (cardW + gap);
      if (this.mouseX >= tx && this.mouseX <= tx + cardW &&
          this.mouseY >= cardTopY && this.mouseY <= cardTopY + cardH) {
        hoveredCardIdx = i;
      }
    }

    for (let i = 0; i < cardCount; i++) {
      const card = game.cardChoices[i];
      const rarity = i; // 0=common, 1=rare, 2=epic (deterministic per position)
      const rColor = rarityColors[rarity] ?? '#60a5fa';
      const rName  = rarityNames[rarity]  ?? 'COMUM';

      // Fly-in animation
      const animDelay = i * 0.12;
      const animProgress = Math.min(1, Math.max(0, (this.cardAnimTimer - animDelay) * 3.2));
      const eased = 1 - Math.pow(1 - animProgress, 4);
      const slideY = (1 - eased) * 260;
      const rotation = (1 - eased) * (i - 1) * 0.08;

      const isHovered = i === hoveredCardIdx && animProgress >= 1;
      const hoverLift = isHovered ? -Math.floor(L.h * 0.025) : 0;
      const hoverScale = isHovered ? 1.035 : 1;

      const tx = startX + i * (cardW + gap);
      const ty = cardTopY + Math.floor(slideY) + Math.floor(hoverLift);

      ctx.globalAlpha = eased;
      ctx.save();
      ctx.translate(tx + cardW / 2, ty + cardH / 2);
      ctx.rotate(rotation);
      ctx.scale(hoverScale, hoverScale);
      ctx.translate(-(tx + cardW / 2), -(ty + cardH / 2));

      // ── Card glow (behind card body) ─────────────────────────────────
      if (isHovered || rarity >= 2) {
        ctx.shadowColor = rColor;
        ctx.shadowBlur = isHovered ? 28 : 14;
      }

      // ── Card body ────────────────────────────────────────────────────
      // Dark background
      ctx.fillStyle = '#09091a';
      ctx.fillRect(tx, ty, cardW, cardH);

      // Rarity left-edge bar
      ctx.fillStyle = rColor;
      ctx.fillRect(tx, ty, 3, cardH);

      // Outer border
      ctx.strokeStyle = rColor + (isHovered ? 'ff' : '66');
      ctx.lineWidth = isHovered ? 2 : 1;
      ctx.strokeRect(tx, ty, cardW, cardH);
      ctx.shadowBlur = 0;

      // Inner card bg (slight gradient top to bottom)
      const cardBgGrad = ctx.createLinearGradient(tx, ty, tx, ty + cardH);
      cardBgGrad.addColorStop(0, rColor + '18');
      cardBgGrad.addColorStop(0.35, rColor + '06');
      cardBgGrad.addColorStop(1, '#000000');
      ctx.fillStyle = cardBgGrad;
      ctx.fillRect(tx + 3, ty, cardW - 3, cardH);

      // ── Art area (top 38% of card) ────────────────────────────────────
      const artH = Math.floor(cardH * 0.38);
      // Art background (character-color themed)
      const artGrad = ctx.createRadialGradient(tx + cardW / 2, ty + artH / 2, 0, tx + cardW / 2, ty + artH / 2, cardW * 0.55);
      artGrad.addColorStop(0, rColor + '30');
      artGrad.addColorStop(1, '#000000');
      ctx.fillStyle = artGrad;
      ctx.fillRect(tx + 3, ty, cardW - 3, artH);

      // Art placeholder icon (card type icon)
      const cardIcons: Record<string, string> = {
        damage: '⚔', fire_rate: '💨', projectiles: '✦', piercing: '→',
        armor: '🛡', heal: '♥', speed: '⚡', aoe: '💥', gold: '💰',
      };
      const cardIcon = (card as any).type ? (cardIcons[(card as any).type] || '✦') : '✦';
      ctx.font = `${Math.floor(artH * 0.52)}px monospace`;
      ctx.fillStyle = rColor + '55';
      ctx.textAlign = 'center';
      ctx.fillText(cardIcon, tx + cardW / 2, ty + artH * 0.62);

      // Art bottom fade
      const artFade = ctx.createLinearGradient(0, ty + artH - 24, 0, ty + artH);
      artFade.addColorStop(0, 'transparent');
      artFade.addColorStop(1, '#09091a');
      ctx.fillStyle = artFade;
      ctx.fillRect(tx + 3, ty + artH - 24, cardW - 3, 24);

      // ── Rarity badge ──────────────────────────────────────────────────
      const badgeY = ty + artH + 4;
      ctx.fillStyle = rColor + '22';
      ctx.fillRect(tx + Math.floor(cardW * 0.15), badgeY, Math.floor(cardW * 0.7), Math.floor(L.h * 0.024));
      ctx.strokeStyle = rColor + '66';
      ctx.lineWidth = 1;
      ctx.strokeRect(tx + Math.floor(cardW * 0.15), badgeY, Math.floor(cardW * 0.7), Math.floor(L.h * 0.024));
      ctx.font = `bold ${Math.floor(L.h * 0.011)}px monospace`;
      ctx.fillStyle = rColor;
      ctx.textAlign = 'center';
      ctx.fillText(`◆ ${rName} ◆`, tx + cardW / 2, badgeY + Math.floor(L.h * 0.017));

      // ── Card name ─────────────────────────────────────────────────────
      ctx.font = `bold ${Math.floor(L.h * 0.019)}px monospace`;
      ctx.fillStyle = '#f1f5f9';
      ctx.textAlign = 'center';
      const nameY = badgeY + Math.floor(L.h * 0.048);
      // Handle long names
      if (ctx.measureText(card.name).width > cardW - 16) {
        ctx.font = `bold ${Math.floor(L.h * 0.014)}px monospace`;
      }
      ctx.fillText(card.name, tx + cardW / 2, nameY);

      // ── Divider ───────────────────────────────────────────────────────
      const divY = nameY + Math.floor(L.h * 0.016);
      const divGrad = ctx.createLinearGradient(tx + 12, 0, tx + cardW - 12, 0);
      divGrad.addColorStop(0, 'transparent');
      divGrad.addColorStop(0.5, rColor + '55');
      divGrad.addColorStop(1, 'transparent');
      ctx.strokeStyle = divGrad as any;
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(tx + 12, divY); ctx.lineTo(tx + cardW - 12, divY); ctx.stroke();

      // ── Description ───────────────────────────────────────────────────
      ctx.font = `${Math.floor(L.h * 0.013)}px monospace`;
      ctx.fillStyle = '#94a3b8';
      this.wrapText(card.description, tx + cardW / 2, divY + Math.floor(L.h * 0.025), cardW - 20, Math.floor(L.h * 0.0195));

      // ── Bottom click hint ─────────────────────────────────────────────
      if (isHovered) {
        ctx.fillStyle = rColor + 'cc';
        ctx.fillRect(tx + 3, ty + cardH - Math.floor(L.h * 0.04), cardW - 3, Math.floor(L.h * 0.04));
        ctx.font = `bold ${Math.floor(L.h * 0.012)}px monospace`;
        ctx.fillStyle = '#000000';
        ctx.textAlign = 'center';
        ctx.fillText('CLIQUE PARA ESCOLHER', tx + cardW / 2, ty + cardH - Math.floor(L.h * 0.013));
      }

      ctx.restore();
      ctx.globalAlpha = 1;
      ctx.textAlign = 'left';
    }

    // ─── BOTTOM AREA: Skip + Reroll ───────────────────────────────────────
    const bottomY = Math.floor(L.h * 0.855);

    // Collectible notification (above bottom buttons)
    if (game.pendingCollectible) {
      const colY = bottomY - Math.floor(L.h * 0.10);
      ctx.fillStyle = 'rgba(99, 102, 241, 0.12)';
      ctx.fillRect(L.cx - Math.floor(L.w * 0.18), colY, Math.floor(L.w * 0.36), Math.floor(L.h * 0.082));
      ctx.strokeStyle = '#6366f1';
      ctx.lineWidth = 1;
      ctx.strokeRect(L.cx - Math.floor(L.w * 0.18), colY, Math.floor(L.w * 0.36), Math.floor(L.h * 0.082));
      ctx.font = `bold ${Math.floor(L.h * 0.013)}px monospace`;
      ctx.fillStyle = '#a78bfa';
      ctx.textAlign = 'center';
      ctx.fillText('★ ITEM RARO: ' + game.pendingCollectible.name + ' ★', L.cx, colY + Math.floor(L.h * 0.028));
      ctx.font = L.fontTiny;
      ctx.fillStyle = '#64748b';
      ctx.fillText('Salvo no Arquivo', L.cx, colY + Math.floor(L.h * 0.055));
      ctx.textAlign = 'left';
    }

    // Relic notification
    if (game.pendingRelic) {
      const relY = bottomY - Math.floor(L.h * 0.195);
      ctx.fillStyle = 'rgba(251, 191, 36, 0.10)';
      ctx.fillRect(L.cx - Math.floor(L.w * 0.16), relY, Math.floor(L.w * 0.32), Math.floor(L.h * 0.075));
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2;
      ctx.strokeRect(L.cx - Math.floor(L.w * 0.16), relY, Math.floor(L.w * 0.32), Math.floor(L.h * 0.075));
      ctx.font = `bold ${Math.floor(L.h * 0.013)}px monospace`;
      ctx.fillStyle = '#fbbf24';
      ctx.textAlign = 'center';
      ctx.fillText(`${game.pendingRelic.icon} RELÍQUIA: ${game.pendingRelic.name}`, L.cx, relY + Math.floor(L.h * 0.03));
      ctx.font = L.fontTiny;
      ctx.fillStyle = '#e2e8f0';
      ctx.fillText(game.pendingRelic.description, L.cx, relY + Math.floor(L.h * 0.055));
      ctx.textAlign = 'left';
    }

    // Skip button
    const skipBtnW = Math.floor(L.w * 0.14);
    const skipBtnH = Math.floor(L.h * 0.052);
    this.renderButton(L.cx - skipBtnW / 2, bottomY, skipBtnW, skipBtnH, 'PULAR  +15g', '#374151');

    // Reroll button
    const rerollCost = game.getRerollCost();
    const canReroll = game.gold >= rerollCost;
    const rerollBtnW = Math.floor(L.w * 0.15);
    this.renderButton(L.cx - rerollBtnW / 2, bottomY + skipBtnH + Math.floor(L.h * 0.012),
      rerollBtnW, Math.floor(L.h * 0.042),
      `↺  REROLAR  ${rerollCost}g`, canReroll ? '#6d28d9' : '#1f2937');
  }

  // ─── Shop Phase ─────────────────────────────────────────────────────────

  private renderShop(dt: number): void {
    const { ctx, canvas, game } = this;
    const L = this.getLayout();
    this.shopAnimTimer += dt;

    // Show grid on left for item placement
    ctx.fillStyle = 'rgba(10,10,18,0.85)';
    ctx.fillRect(L.gridX - 10, L.gridY - 20, L.gridW + 20, L.gridH + 40);
    this.renderGrid();
    this.renderPlacedItems();

    // Highlight fusion partners when hovering over shop item
    const shopItems = this.inputHandler?.getShopItems() ?? game.getShopItems();
    const hoverAreaW = L.w - L.panelX - Math.floor(L.w * 0.02);
    const itemCardW2 = Math.min(Math.floor(hoverAreaW / Math.max(shopItems.length, 1)) - 10, Math.floor(L.w * 0.13));
    const itemCardH2 = Math.floor(L.h * 0.45);
    let hoveredShopItemId: string | null = null;
    for (let si = 0; si < shopItems.length; si++) {
      const sx = L.panelX + si * (itemCardW2 + 10);
      const sy = Math.floor(L.h * 0.14);
      if (this.mouseX >= sx && this.mouseX <= sx + itemCardW2 &&
          this.mouseY >= sy && this.mouseY <= sy + itemCardH2) {
        hoveredShopItemId = shopItems[si].id;
        break;
      }
    }
    if (hoveredShopItemId) {
      // Find which backpack items can fuse with the hovered shop item
      for (const combo of ALL_COMBINATIONS) {
        let partnerId: string | null = null;
        if (combo.itemA === hoveredShopItemId) partnerId = combo.itemB;
        if (combo.itemB === hoveredShopItemId) partnerId = combo.itemA;
        if (!partnerId) continue;
        // Highlight that partner in the grid
        for (const placed of game.backpack.getAllItems()) {
          if (placed.definition.id === partnerId) {
            const gx = L.gridX + placed.position.col * L.cell;
            const gy = L.gridY + placed.position.row * L.cell;
            const gw = placed.definition.gridShape[0].length * L.cell;
            const gh = placed.definition.gridShape.length * L.cell;
            ctx.globalAlpha = 0.3 + Math.sin(performance.now() * 0.005) * 0.15;
            ctx.strokeStyle = '#f472b6';
            ctx.lineWidth = 2;
            ctx.strokeRect(gx, gy, gw - 2, gh - 2);
            ctx.fillStyle = 'rgba(244, 114, 182, 0.1)';
            ctx.fillRect(gx, gy, gw - 2, gh - 2);
            ctx.globalAlpha = 1;
          }
        }
      }
    }

    // Shop panel on right
    ctx.font = L.fontTitle;
    ctx.fillStyle = '#fbbf24';
    ctx.textAlign = 'center';
    const shopCenterX = L.panelX + Math.floor((L.w - L.panelX) / 2);
    ctx.fillText('LOJA', shopCenterX, Math.floor(L.h * 0.04));

    // ─── Vendor Portrait & Greeting ─────────────────────────────────────
    const vendor = game.currentVendor;
    if (vendor) {
      // Vendor portrait — LARGE, bottom-right (visual novel style)
      const portraitW = Math.floor(L.w * 0.22);
      const portraitH = Math.floor(L.h * 0.65);
      const portraitX = L.w - portraitW - Math.floor(L.w * 0.01);
      const portraitY = L.h - portraitH;

      // Try loading real sprite
      const loadedSprites3 = (this as any).loadedSprites;
      const vendorSpriteMap: Record<string, string> = { luna: 'luna', brutus: 'brutus', nyx: 'nyx', zikri: 'zikri' };
      const vendorImg = loadedSprites3?.vendors?.get(vendorSpriteMap[vendor.id]) || null;

      if (vendorImg) {
        // Draw with correct aspect ratio (align bottom, crop top if needed)
        const imgW = vendorImg.naturalWidth || vendorImg.width;
        const imgH = vendorImg.naturalHeight || vendorImg.height;
        const scale = Math.max(portraitW / imgW, portraitH / imgH);
        const drawW = imgW * scale;
        const drawH = imgH * scale;
        const offX = (portraitW - drawW) / 2;
        const offY = portraitH - drawH; // Align bottom
        ctx.save();
        ctx.beginPath();
        ctx.rect(portraitX, portraitY, portraitW, portraitH);
        ctx.clip();
        ctx.drawImage(vendorImg, portraitX + offX, portraitY + offY, drawW, drawH);
        ctx.restore();
      } else {
        // Fallback silhouette
        ctx.fillStyle = vendor.color;
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        ctx.ellipse(portraitX + portraitW / 2, portraitY + portraitH * 0.25, portraitW * 0.25, portraitH * 0.15, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(portraitX + portraitW / 2, portraitY + portraitH * 0.6, portraitW * 0.35, portraitH * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // Vendor name (below portrait or beside)
      ctx.font = `bold ${Math.floor(L.h * 0.015)}px monospace`;
      ctx.fillStyle = vendor.color;
      ctx.textAlign = 'center';
      ctx.fillText(vendor.name, portraitX + portraitW / 2, portraitY - Math.floor(L.h * 0.015));
      ctx.font = `${Math.floor(L.h * 0.010)}px monospace`;
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(vendor.title, portraitX + portraitW / 2, portraitY - Math.floor(L.h * 0.002));
      ctx.textAlign = 'left';

      // Greeting speech bubble
      if (game.vendorGreeting) {
        const bubbleX = L.panelX;
        const bubbleY = Math.floor(L.h * 0.06);
        const bubbleW = Math.floor(L.w * 0.35);
        const bubbleH = Math.floor(L.h * 0.07);

        // Speech bubble with nicer styling
        ctx.fillStyle = 'rgba(15, 15, 30, 0.94)';
        ctx.fillRect(bubbleX, bubbleY, bubbleW, bubbleH);
        ctx.strokeStyle = vendor.color + '60';
        ctx.lineWidth = 2;
        ctx.strokeRect(bubbleX, bubbleY, bubbleW, bubbleH);
        // Accent line at top
        ctx.fillStyle = vendor.color;
        ctx.fillRect(bubbleX, bubbleY, bubbleW, 3);

        ctx.font = L.fontSmall;
        ctx.fillStyle = '#e2e8f0';
        ctx.textAlign = 'left';
        // Wrap the greeting
        const words = game.vendorGreeting.split(' ');
        let line = '';
        let ly = bubbleY + Math.floor(bubbleH * 0.35);
        const maxLineW = bubbleW - 16;
        for (const word of words) {
          const testLine = line + word + ' ';
          if (ctx.measureText(testLine).width > maxLineW && line.length > 0) {
            ctx.fillText(line.trim(), bubbleX + 8, ly);
            line = word + ' ';
            ly += Math.floor(L.h * 0.018);
            if (ly > bubbleY + bubbleH - 5) break;
          } else {
            line = testLine;
          }
        }
        if (ly <= bubbleY + bubbleH - 5) {
          ctx.fillText(line.trim(), bubbleX + 8, ly);
        }
      }
    }

    const coin = this.sprites.ui.get('gold_coin');
    if (coin) ctx.drawImage(coin, shopCenterX - Math.floor(L.w * 0.03), Math.floor(L.h * 0.09));
    ctx.font = L.fontNormal;
    ctx.fillStyle = '#94a3b8';
    ctx.textAlign = 'center';
    ctx.fillText(`${game.gold}`, shopCenterX, Math.floor(L.h * 0.11));
    // Show last wave gold
    if (game.lastWaveGold > 0) {
      ctx.font = L.fontSmall;
      ctx.fillStyle = '#4ade80';
      ctx.fillText(`(+${game.lastWaveGold} da última wave)`, shopCenterX, Math.floor(L.h * 0.13));
    }
    ctx.textAlign = 'left';

    const items = this.inputHandler?.getShopItems() ?? game.getShopItems();
    const shopAreaW = L.w - L.panelX - Math.floor(L.w * 0.02);
    const itemW = Math.floor(shopAreaW / Math.max(items.length, 1)) - 10;
    const itemCardW = Math.min(itemW, Math.floor(L.w * 0.13));
    const itemCardH = Math.floor(L.h * 0.45);

    // Find best pick (most synergies)
    const existingIds2 = game.backpack.getAllItems().map(it => it.definition.id);
    let bestPickIdx = -1;
    let bestPickScore = 0;
    for (let bi = 0; bi < items.length; bi++) {
      const sc = countPossibleCombinations(items[bi].id, existingIds2) * 3 + countPossibleBuffs(items[bi].tags, game.backpack.getAllItems().map(it => [...it.definition.tags]));
      if (sc > bestPickScore && game.gold >= items[bi].cost) { bestPickScore = sc; bestPickIdx = bi; }
    }

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const x = L.panelX + i * (itemCardW + 10);
      const y = Math.floor(L.h * 0.14);

      // Fade-in animation with stagger
      const fadeProgress = Math.min(1, Math.max(0, (this.shopAnimTimer - i * 0.1) * 4));
      ctx.globalAlpha = fadeProgress;

      // Rarity border glow
      const rarityColors = ['#94a3b8', '#4ade80', '#3b82f6', '#a855f7'];
      const rarityColor = rarityColors[Math.min(item.rarity, 3)];

      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(x, y, itemCardW, itemCardH);
      ctx.strokeStyle = rarityColor;
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, itemCardW, itemCardH);

      if (item.rarity >= 2) {
        ctx.shadowColor = rarityColor;
        ctx.shadowBlur = 8;
        ctx.strokeRect(x, y, itemCardW, itemCardH);
        ctx.shadowBlur = 0;
      }

      // "★ BEST" badge for highest synergy pick
      if (i === bestPickIdx && bestPickScore > 0) {
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(x, y, itemCardW, 14);
        ctx.font = `bold ${Math.floor(L.h * 0.009)}px monospace`;
        ctx.fillStyle = '#000000';
        ctx.textAlign = 'center';
        ctx.fillText('★ BEST PICK', x + itemCardW / 2, y + 10);
        ctx.textAlign = 'left';
      }

      const sprite = this.sprites.items.get(item.id);
      if (sprite) {
        const spriteS = Math.floor(itemCardH * 0.12);
        ctx.drawImage(sprite, x + itemCardW / 2 - spriteS / 2, y + Math.floor(itemCardH * 0.03), spriteS, spriteS);
      }

      ctx.font = `bold ${Math.floor(L.h * 0.014)}px monospace`;
      ctx.fillStyle = '#e2e8f0';
      ctx.textAlign = 'center';
      ctx.fillText(item.name, x + itemCardW / 2, y + Math.floor(itemCardH * 0.2));

      ctx.font = L.fontTiny;
      ctx.fillStyle = '#94a3b8';
      this.wrapText(item.description, x + itemCardW / 2, y + Math.floor(itemCardH * 0.28), itemCardW - 14, Math.floor(L.h * 0.016));

      ctx.font = L.fontTiny;
      ctx.fillStyle = '#6366f1';
      ctx.fillText(item.tags.slice(0, 3).join(', '), x + itemCardW / 2, y + Math.floor(itemCardH * 0.75));

      const discount = (game as any)._shopDiscount ?? 0;
      const finalCost = Math.floor(item.cost * (1 - discount));
      ctx.font = `bold ${Math.floor(L.h * 0.018)}px monospace`;
      ctx.fillStyle = game.gold >= finalCost ? '#4ade80' : '#ef4444';
      if (discount > 0) {
        ctx.fillText(`${finalCost}g`, x + itemCardW / 2, y + Math.floor(itemCardH * 0.88));
        ctx.font = `${Math.floor(L.h * 0.011)}px monospace`;
        ctx.fillStyle = '#64748b';
        ctx.globalAlpha = 0.6;
        ctx.fillText(`${item.cost}g`, x + itemCardW / 2, y + Math.floor(itemCardH * 0.93));
        ctx.globalAlpha = 1;
      } else {
        ctx.fillText(`${item.cost} gold`, x + itemCardW / 2, y + Math.floor(itemCardH * 0.9));
      }
      ctx.textAlign = 'left';

      // Synergy/Combo indicators
      const existingIds = game.backpack.getAllItems().map(i => i.definition.id);
      const existingTags = game.backpack.getAllItems().map(i => [...i.definition.tags]);
      const combos = countPossibleCombinations(item.id, existingIds);
      const buffs = countPossibleBuffs(item.tags, existingTags);

      if (combos > 0 || buffs > 0) {
        ctx.font = `bold ${Math.floor(L.h * 0.01)}px monospace`;
        ctx.textAlign = 'center';
        if (combos > 0) {
          ctx.fillStyle = '#f472b6';
          ctx.fillText(`Fusões: ${combos}`, x + itemCardW / 2, y + Math.floor(itemCardH * 0.80));
        }
        if (buffs > 0) {
          ctx.fillStyle = '#a78bfa';
          ctx.fillText(`Buffs: ${buffs}`, x + itemCardW / 2, y + Math.floor(itemCardH * 0.84));
        }
        ctx.textAlign = 'left';
      }

      // Shape preview — always visible inside card
      if (item.gridShape) {
        const previewCellSize = Math.floor(L.h * 0.014);
        const shape = item.gridShape;
        const shapeCols = shape[0].length;
        const shapeRows = shape.length;
        const previewW = shapeCols * previewCellSize;
        const previewH = shapeRows * previewCellSize;
        const previewX = x + (itemCardW - previewW) / 2;
        const previewY = y + Math.floor(itemCardH * 0.58);
        const color = this.getItemColor(item.tags);
        for (let sr = 0; sr < shapeRows; sr++) {
          for (let sc = 0; sc < shapeCols; sc++) {
            const px = previewX + sc * previewCellSize;
            const py = previewY + sr * previewCellSize;
            if (shape[sr][sc] === 1) {
              ctx.fillStyle = color;
              ctx.fillRect(px, py, previewCellSize - 1, previewCellSize - 1);
            } else {
              ctx.fillStyle = 'rgba(30,30,50,0.3)';
              ctx.fillRect(px, py, previewCellSize - 1, previewCellSize - 1);
            }
          }
        }
      }

      // Fade-in animation per item
      ctx.globalAlpha = 1;
    }

    // Sell zone
    this.renderSellZone();

    // Continue button
    const btnW = Math.floor(L.w * 0.17);
    const btnH = Math.floor(L.h * 0.065);
    const btnColor = this.inputHandler?.heldItem ? '#1f2937' : '#6366f1';
    this.renderButton(L.cx - btnW / 2, L.btnY, btnW, btnH, '→ SAIR DA LOJA', btnColor);

    // Reroll button in shop
    const rerollCost = game.getRerollCost();
    const rerollBtnW = Math.floor(L.w * 0.14);
    const rerollBtnH = Math.floor(L.h * 0.045);
    const rerollBtnX = L.cx - rerollBtnW / 2;
    const rerollBtnY = L.btnY - Math.floor(L.h * 0.06);
    const canReroll = game.gold >= rerollCost && !this.inputHandler?.heldItem;
    this.renderButton(rerollBtnX, rerollBtnY, rerollBtnW, rerollBtnH, `REROLAR (${rerollCost}g)`, canReroll ? '#6d28d9' : '#1f2937');

    // Potion shop (below grid)
    const potShopY = L.gridY + L.gridH + Math.floor(L.h * 0.02);
    ctx.font = `bold ${Math.floor(L.h * 0.011)}px monospace`;
    ctx.fillStyle = '#4ade80';
    ctx.fillText('POÇÕES:', L.gridX, potShopY);
    const potBtnW = Math.floor(L.w * 0.08);
    const potBtnH = Math.floor(L.h * 0.035);
    const potions = [
      { id: 'health_potion', name: '❤ Vida', cost: 25 },
      { id: 'shield_potion', name: '🛡 Escudo', cost: 20 },
      { id: 'rage_potion', name: '💢 Fúria', cost: 35 },
    ];
    for (let pi = 0; pi < potions.length; pi++) {
      const pot = potions[pi];
      const pbx = L.gridX + pi * (potBtnW + 5);
      const pby = potShopY + Math.floor(L.h * 0.015);
      const canBuy = game.gold >= pot.cost && game.potions.length < 3;
      ctx.fillStyle = canBuy ? 'rgba(20, 60, 20, 0.8)' : 'rgba(15, 15, 20, 0.6)';
      ctx.fillRect(pbx, pby, potBtnW, potBtnH);
      ctx.strokeStyle = canBuy ? '#4ade80' : '#374151';
      ctx.lineWidth = 1;
      ctx.strokeRect(pbx, pby, potBtnW, potBtnH);
      ctx.font = `${Math.floor(L.h * 0.009)}px monospace`;
      ctx.fillStyle = canBuy ? '#e2e8f0' : '#475569';
      ctx.textAlign = 'center';
      ctx.fillText(pot.name, pbx + potBtnW / 2, pby + potBtnH * 0.45);
      ctx.fillStyle = canBuy ? '#fbbf24' : '#374151';
      ctx.fillText(`${pot.cost}g`, pbx + potBtnW / 2, pby + potBtnH * 0.8);
      ctx.textAlign = 'left';
    }

    if (this.inputHandler?.heldItem) {
      ctx.font = L.fontSmall;
      ctx.fillStyle = '#fbbf24';
      ctx.textAlign = 'center';
      ctx.fillText('Coloque o item na mochila antes de continuar', L.cx, L.btnY - Math.floor(L.h * 0.015));
      ctx.textAlign = 'left';
    }

    // Vendor feedback phrase (buy/broke)
    if (this.vendorFeedbackTimer > 0) {
      this.vendorFeedbackTimer -= dt;
      const feedAlpha = Math.min(1, this.vendorFeedbackTimer * 2);
      ctx.globalAlpha = feedAlpha;
      ctx.font = `bold ${Math.floor(L.h * 0.013)}px monospace`;
      ctx.fillStyle = '#fbbf24';
      ctx.textAlign = 'center';
      ctx.fillText(`"${this.vendorFeedback}"`, L.cx, Math.floor(L.h * 0.15));
      ctx.textAlign = 'left';
      ctx.globalAlpha = 1;
    }
  }

  // ─── Game Over ──────────────────────────────────────────────────────────

  private renderGameOver(victory: boolean): void {
    const { ctx, canvas, game } = this;
    const L = this.getLayout();
    const now = performance.now();

    // ── Dramatic background ──────────────────────────────────────────────
    ctx.fillStyle = 'rgba(0,0,0,0.88)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Atmospheric gradient overlay
    const bgGrad = ctx.createRadialGradient(L.cx, L.cy * 0.5, 0, L.cx, L.cy * 0.5, L.h * 0.6);
    if (victory) {
      bgGrad.addColorStop(0, 'rgba(251,191,36,0.12)');
      bgGrad.addColorStop(1, 'transparent');
    } else {
      bgGrad.addColorStop(0, 'rgba(239,68,68,0.10)');
      bgGrad.addColorStop(1, 'transparent');
    }
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // ── Title ─────────────────────────────────────────────────────────────
    const titleY = Math.floor(L.h * 0.11);
    const titleSize = Math.floor(L.h * 0.062);
    ctx.font = `bold ${titleSize}px monospace`;
    ctx.textAlign = 'center';
    const titleText = victory ? 'VITÓRIA!' : 'GAME OVER';
    const titleColor = victory ? '#fbbf24' : '#ef4444';
    const titlePulse = 0.85 + Math.sin(now * 0.0025) * 0.15;
    ctx.shadowColor = titleColor;
    ctx.shadowBlur = 28 * titlePulse;
    ctx.fillStyle = titleColor;
    ctx.fillText(titleText, L.cx, titleY);
    ctx.shadowBlur = 0;

    // Check for record
    const isRecord = game.totalMonths >= game.bestRun && game.totalMonths > 0;
    if (isRecord) {
      ctx.font = `bold ${Math.floor(L.h * 0.022)}px monospace`;
      ctx.fillStyle = '#fbbf24';
      ctx.fillText('★ NOVO RECORDE! ★', L.cx, Math.floor(L.h * 0.16));
    }

    // ─── Stats Panel ─────────────────────────────────────────────────────
    const panelW = Math.floor(L.w * 0.58);
    const panelX = (L.w - panelW) / 2;
    const panelY = Math.floor(L.h * 0.16);
    const panelH = Math.floor(L.h * 0.44);

    ctx.fillStyle = 'rgba(5, 5, 18, 0.92)';
    ctx.fillRect(panelX, panelY, panelW, panelH);
    ctx.strokeStyle = victory ? 'rgba(251,191,36,0.3)' : 'rgba(239,68,68,0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(panelX, panelY, panelW, panelH);
    // Top accent line
    ctx.fillStyle = titleColor;
    ctx.fillRect(panelX, panelY, panelW, 2);

    const lineH = Math.floor(L.h * 0.032);
    let cy = panelY + lineH;
    const leftCol = panelX + 20;
    const rightCol = panelX + panelW / 2 + 10;

    // Left column — core stats
    ctx.textAlign = 'left';
    ctx.font = `bold ${Math.floor(L.h * 0.013)}px monospace`;
    ctx.fillStyle = '#64748b';
    ctx.fillText('ESTATÍSTICAS', leftCol, cy); cy += lineH;

    ctx.font = `${Math.floor(L.h * 0.013)}px monospace`;
    ctx.fillStyle = '#e2e8f0';
    ctx.fillText(`⏱ ${game.getTimeString()}`, leftCol, cy); cy += lineH;
    ctx.fillStyle = '#94a3b8';
    const runMs = Date.now() - game.stats.runStartTime;
    const runMins = Math.floor(runMs / 60000);
    const runSecs = Math.floor((runMs % 60000) / 1000);
    ctx.fillText(`Meses: ${game.totalMonths} (${runMins}m ${runSecs}s de jogo)`, leftCol, cy);
    ctx.fillStyle = '#6366f1';
    ctx.fillText(`(Recorde: ${game.bestRun})`, leftCol + Math.floor(panelW * 0.25), cy); cy += lineH;
    ctx.fillStyle = '#ef4444';
    ctx.fillText(`⚔ Kills: ${game.stats.enemiesKilled}`, leftCol, cy); cy += lineH;
    ctx.fillStyle = '#fbbf24';
    ctx.fillText(`💰 Score: ${game.combat.state.score}`, leftCol, cy); cy += lineH;
    ctx.fillStyle = '#4ade80';
    ctx.fillText(`🛒 Itens comprados: ${game.stats.itemsBought}`, leftCol, cy); cy += lineH;

    // Fusions achieved this run
    const fusionCount = game.backpack.getAllItems().filter(i => (i.state as any).fusedName).length;
    ctx.fillStyle = '#f472b6';
    ctx.fillText(`★ Fusões ativas: ${fusionCount}`, leftCol, cy); cy += lineH;
    if (game.stats.fusionsDiscovered.length > 0) {
      ctx.fillStyle = '#f9a8d4';
      ctx.font = `${Math.floor(L.h * 0.010)}px monospace`;
      ctx.fillText(`  Descobertas: ${game.stats.fusionsDiscovered.slice(0, 3).join(', ')}`, leftCol, cy); cy += lineH;
    }

    // DPS at death
    const power = game.backpack.calculateBackpackPower();
    ctx.fillStyle = '#f97316';
    ctx.fillText(`⚡ Emissores: ${power.emitters.length} | Projeteis: ${power.totalProjectiles}`, leftCol, cy); cy += lineH;

    // Right column — more stats
    cy = panelY + lineH;
    ctx.font = `bold ${Math.floor(L.h * 0.013)}px monospace`;
    ctx.fillStyle = '#64748b';
    ctx.fillText('DETALHES', rightCol, cy); cy += lineH;

    ctx.font = `${Math.floor(L.h * 0.013)}px monospace`;
    const charDef = game.characters.find(c => c.id === game.characterId);
    ctx.fillStyle = '#a78bfa';
    ctx.fillText(`🧑 ${charDef?.name || game.characterId}`, rightCol, cy); cy += lineH;
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`Dano total: ${power.totalDamage.toFixed(1)}`, rightCol, cy); cy += lineH;
    ctx.fillText(`Cadência total: ${power.totalFireRate.toFixed(1)}/s`, rightCol, cy); cy += lineH;
    ctx.fillText(`Cura/s: ${power.totalHeal.toFixed(1)}`, rightCol, cy); cy += lineH;
    ctx.fillText(`Armadura: ${power.totalArmor}`, rightCol, cy); cy += lineH;
    ctx.fillText(`Gold final: ${game.gold}`, rightCol, cy); cy += lineH;
    ctx.fillStyle = '#6366f1';
    ctx.fillText(`Skills usadas: ${game.stats.skillsUsed}`, rightCol, cy); cy += lineH;

    // Difficulty badge
    const diffDef = getDifficultyById(game.currentDifficulty);
    const diffName = diffDef?.name ?? game.currentDifficulty;
    ctx.fillStyle = game.aliencoreMode ? '#ef4444' : '#4ade80';
    ctx.fillText(`Dificuldade: ${diffName}${game.aliencoreMode ? ' [ALIENCORE]' : ''}`, rightCol, cy);

    // ─── Leaderboard ─────────────────────────────────────────────────────
    const board = getLeaderboard();
    const charNameMap: Record<string, string> = {
      grass_man: 'Romulo', fire_lord: 'Kagutsuchi', aqua_sage: 'Mazu',
      storm_runner: 'Frank', void_walker: 'Dr. Eon', beast_tamer: 'Diana', firefighter: 'Florian',
    };
    if (board.length > 0) {
      const lbY = panelY + panelH + Math.floor(L.h * 0.015);
      ctx.font = `bold ${Math.floor(L.h * 0.012)}px monospace`;
      ctx.fillStyle = '#fbbf24';
      ctx.textAlign = 'center';
      ctx.fillText('TOP RUNS', L.cx, lbY);
      ctx.font = `${Math.floor(L.h * 0.010)}px monospace`;
      const lineGap = Math.floor(L.h * 0.019);
      for (let lb = 0; lb < Math.min(board.length, 5); lb++) {
        const entry = board[lb];
        const charName = charNameMap[entry.characterId] ?? entry.characterId;
        const medal = lb === 0 ? '🥇' : lb === 1 ? '🥈' : lb === 2 ? '🥉' : `${lb + 1}.`;
        ctx.fillStyle = lb === 0 ? '#fbbf24' : lb < 3 ? '#94a3b8' : '#475569';
        const entryDiff = getDifficultyById(entry.difficulty)?.name ?? entry.difficulty;
        ctx.fillText(
          `${medal} ${charName} — ${entry.months}m | ${entry.kills}k | ${entryDiff}`,
          L.cx, lbY + (lb + 1) * lineGap
        );
      }
    }

    // Newly unlocked difficulty notification
    if (game.newlyUnlockedDifficulty) {
      const diffUnlocked = getDifficultyById(game.newlyUnlockedDifficulty);
      const unlockY = panelY + panelH + Math.floor(L.h * 0.125);
      const unlockW = Math.floor(L.w * 0.38);
      const unlockH = Math.floor(L.h * 0.04);
      ctx.fillStyle = 'rgba(251,191,36,0.15)';
      ctx.fillRect(L.cx - unlockW / 2, unlockY - Math.floor(unlockH * 0.75), unlockW, unlockH);
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 1;
      ctx.strokeRect(L.cx - unlockW / 2, unlockY - Math.floor(unlockH * 0.75), unlockW, unlockH);
      ctx.font = `bold ${Math.floor(L.h * 0.012)}px monospace`;
      ctx.fillStyle = '#fbbf24';
      ctx.textAlign = 'center';
      ctx.fillText(`🔓 DIFICULDADE DESBLOQUEADA: ${diffUnlocked.icon} ${diffUnlocked.name.toUpperCase()}`, L.cx, unlockY);
    }

    // Meta gold bonus hint
    const metaBonus = getMetaGoldBonus();
    if (metaBonus > 0) {
      const bonusY = panelY + panelH + Math.floor(L.h * 0.175);
      ctx.font = `${Math.floor(L.h * 0.010)}px monospace`;
      ctx.fillStyle = '#fbbf24';
      ctx.textAlign = 'center';
      ctx.fillText(`💰 Bônus de missões: +${metaBonus}g por run`, L.cx, bonusY);
    }

    // Achievements unlocked this run (IDs → display names)
    if (game.newAchievements.length > 0) {
      const achNames = game.newAchievements.slice(0, 3).map(id => {
        if (id.startsWith('🔓')) return id; // character unlocks already have display text
        const def = ALL_ACHIEVEMENTS.find(a => a.id === id);
        return def ? `${def.icon} ${def.name}` : id;
      });
      ctx.font = `bold ${Math.floor(L.h * 0.013)}px monospace`;
      ctx.fillStyle = '#4ade80';
      ctx.textAlign = 'center';
      ctx.fillText('🏆 CONQUISTAS:', L.cx, Math.floor(L.h * 0.74));
      ctx.font = `${Math.floor(L.h * 0.011)}px monospace`;
      ctx.fillStyle = '#e2e8f0';
      ctx.fillText(achNames.join(' | '), L.cx, Math.floor(L.h * 0.77));
    }

    // Codex entries unlocked this run
    if (game.stats.codexUnlockedThisRun.length > 0) {
      ctx.font = L.fontSmall;
      ctx.fillStyle = '#a78bfa';
      ctx.textAlign = 'center';
      ctx.fillText(`📖 Codex: ${game.stats.codexUnlockedThisRun.slice(0, 3).join(', ')}`, L.cx, Math.floor(L.h * 0.81));
    }

    // ─── Final Build Preview (item strip) ──────────────────────────────
    const buildItems = game.backpack.getAllItems();
    if (buildItems.length > 0) {
      const stripY = Math.floor(L.h * 0.79);
      ctx.font = `bold ${Math.floor(L.h * 0.010)}px monospace`;
      ctx.fillStyle = '#475569';
      ctx.textAlign = 'center';
      ctx.fillText(`BUILD FINAL (${buildItems.length} itens)`, L.cx, stripY - 6);
      const maxShow = Math.min(buildItems.length, 12);
      const iconS = Math.floor(L.h * 0.035);
      const totalStripW = maxShow * (iconS + 4);
      const stripX = L.cx - totalStripW / 2;
      for (let bi = 0; bi < maxShow; bi++) {
        const bItem = buildItems[bi];
        const bx = stripX + bi * (iconS + 4);
        const sprite = this.sprites.items.get(bItem.definition.id);
        if (sprite) {
          ctx.drawImage(sprite, bx, stripY, iconS, iconS);
        } else {
          ctx.fillStyle = this.getItemColor(bItem.definition.tags);
          ctx.fillRect(bx, stripY, iconS, iconS);
        }
        // Fusion star
        if ((bItem.state as any).fusedName) {
          ctx.font = `${Math.floor(L.h * 0.008)}px monospace`;
          ctx.fillStyle = '#f472b6';
          ctx.textAlign = 'center';
          ctx.fillText('★', bx + iconS / 2, stripY - 2);
        }
      }
      if (buildItems.length > 12) {
        ctx.font = `${Math.floor(L.h * 0.010)}px monospace`;
        ctx.fillStyle = '#64748b';
        ctx.textAlign = 'left';
        ctx.fillText(`+${buildItems.length - 12}`, stripX + totalStripW + 4, stripY + iconS / 2);
      }
    }
    ctx.textAlign = 'left';

    // ── Buttons ───────────────────────────────────────────────────────────
    const btnW  = Math.floor(L.w * 0.23);
    const btnH  = Math.floor(L.h * 0.067);
    const btn1Y = Math.floor(L.h * 0.84);
    const btn2Y = Math.floor(L.h * 0.918);
    // Primary button glow pulse
    const btnPulse = 0.7 + Math.sin(now * 0.004) * 0.3;
    ctx.shadowColor = '#6366f1';
    ctx.shadowBlur = 12 * btnPulse;
    this.renderButton(L.cx - btnW / 2, btn1Y, btnW, btnH, 'TENTAR NOVAMENTE', '#4f46e5');
    ctx.shadowBlur = 0;
    this.renderButton(L.cx - btnW / 2, btn2Y, btnW, btnH, 'MENU PRINCIPAL', '#1e293b');

    ctx.textAlign = 'left';
  }

  // ─── Helpers ────────────────────────────────────────────────────────────

  private renderButton(x: number, y: number, w: number, h: number, text: string, color: string): void {
    const { ctx } = this;
    const L = this.getLayout();
    // Hover highlight
    const isHover = this.mouseX >= x && this.mouseX <= x + w &&
                    this.mouseY >= y && this.mouseY <= y + h;
    ctx.fillStyle = isHover ? this.brightenColor(color) : color;
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = isHover ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, w, h);
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.fillRect(x, y, w, 3);
    ctx.font = `bold ${Math.floor(L.h * 0.02)}px monospace`;
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText(text, x + w / 2, y + h / 2 + Math.floor(h * 0.1));
    ctx.textAlign = 'left';
  }

  /** Brighten a hex color for hover effect */
  private brightenColor(color: string): string {
    // Simple brighten: lighten the color slightly
    if (color.startsWith('#') && color.length === 7) {
      const r = Math.min(255, parseInt(color.slice(1, 3), 16) + 25);
      const g = Math.min(255, parseInt(color.slice(3, 5), 16) + 25);
      const b = Math.min(255, parseInt(color.slice(5, 7), 16) + 25);
      return `rgb(${r},${g},${b})`;
    }
    return color;
  }

  private wrapText(text: string, x: number, y: number, maxW: number, lineH: number): void {
    const words = text.split(' ');
    let line = '';
    let cy = y;
    for (const word of words) {
      const test = line + word + ' ';
      if (this.ctx.measureText(test).width > maxW && line) {
        this.ctx.fillText(line.trim(), x, cy);
        line = word + ' ';
        cy += lineH;
      } else {
        line = test;
      }
    }
    if (line) this.ctx.fillText(line.trim(), x, cy);
  }

  // ─── Codex Phase ──────────────────────────────────────────────────────────

  private renderCodex(): void {
    const { ctx, canvas, game } = this;
    const L = this.getLayout();
    const codex = game.codex;
    const tabs = ['Inimigos', 'Bosses', 'Personagens', 'Itens', 'Cartas', 'Fusões', 'Colecionaveis', 'Relíquias'];
    const categories: Array<'enemy' | 'boss' | 'character' | 'item' | 'card' | 'collectible' | 'fusion' | 'relics'> = [
      'enemy', 'boss', 'character', 'item', 'card', 'fusion', 'collectible', 'relics'
    ];

    // Background
    ctx.fillStyle = 'rgba(5, 5, 15, 0.95)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Title
    ctx.font = L.fontTitle;
    ctx.fillStyle = '#a78bfa';
    ctx.textAlign = 'center';
    ctx.fillText('ARQUIVO ALIEN', L.cx, Math.floor(L.h * 0.05));

    // Progress
    const progress = codex.getProgress();
    ctx.font = L.fontSmall;
    ctx.fillStyle = '#64748b';
    ctx.fillText(`${progress.unlocked}/${progress.total} desbloqueados`, L.cx, Math.floor(L.h * 0.08));

    // Progress bar
    const barW = Math.floor(L.w * 0.2);
    const barX = (L.w - barW) / 2;
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(barX, Math.floor(L.h * 0.09), barW, 6);
    ctx.fillStyle = '#a78bfa';
    ctx.fillRect(barX, Math.floor(L.h * 0.09), barW * (progress.unlocked / Math.max(1, progress.total)), 6);

    // Tabs
    const tabW = Math.floor(L.w * 0.1);
    const tabGap = Math.floor(L.w * 0.005);
    const tabStartX = (L.w - tabs.length * (tabW + tabGap)) / 2;
    const tabY = Math.floor(L.h * 0.11);
    const tabH = Math.floor(L.h * 0.04);
    for (let i = 0; i < tabs.length; i++) {
      const tx = tabStartX + i * (tabW + tabGap);
      const active = i === this.codexTab;
      ctx.fillStyle = active ? '#6366f1' : '#1f2937';
      ctx.fillRect(tx, tabY, tabW, tabH);
      ctx.strokeStyle = active ? '#818cf8' : '#374151';
      ctx.lineWidth = 1;
      ctx.strokeRect(tx, tabY, tabW, tabH);
      ctx.font = active ? `bold ${Math.floor(L.h * 0.013)}px monospace` : `${Math.floor(L.h * 0.013)}px monospace`;
      ctx.fillStyle = active ? '#ffffff' : '#94a3b8';
      ctx.fillText(tabs[i], tx + tabW / 2, tabY + tabH * 0.7);
    }

    // Entries — special handling for Fusion and Relics tabs
    const currentCat = categories[this.codexTab];
    const isFusionTab = currentCat === 'fusion';
    const isRelicsTab = currentCat === 'relics';
    const startY = Math.floor(L.h * 0.17);
    const margin = Math.floor(L.w * 0.02);

    if (isFusionTab) {
      this.renderFusionGuide(startY, L, margin);
    } else if (isRelicsTab) {
      this.renderRelicsGuide(startY, L, margin);
    } else {
    const entries = codex.getAllByCategory(categories[this.codexTab] as any);
    const entryH = Math.floor(L.h * 0.1);
    const visibleCount = Math.floor((L.h - startY - Math.floor(L.h * 0.08)) / entryH);
    const scrollMax = Math.max(0, entries.length - visibleCount);
    this.codexScroll = Math.max(0, Math.min(scrollMax, this.codexScroll));

    // Auto-select first entry if none selected
    if (this.codexSelectedEntry < 0 && entries.length > 0) {
      this.codexSelectedEntry = 0;
    }
    if (this.codexSelectedEntry >= entries.length) this.codexSelectedEntry = -1;

    ctx.textAlign = 'left';
    for (let i = 0; i < visibleCount && (i + this.codexScroll) < entries.length; i++) {
      const entry = entries[i + this.codexScroll];
      const ey = startY + i * entryH;

      ctx.fillStyle = entry.unlocked ? 'rgba(20, 20, 40, 0.8)' : 'rgba(10, 10, 20, 0.5)';
      ctx.fillRect(margin, ey, Math.floor(L.w * 0.47), entryH - 5);
      ctx.strokeStyle = entry.unlocked ? '#374151' : '#1f2937';
      if (i + this.codexScroll === this.codexSelectedEntry) {
        ctx.strokeStyle = '#6366f1';
        ctx.lineWidth = 2;
      } else {
        ctx.lineWidth = 1;
      }
      ctx.strokeRect(margin, ey, Math.floor(L.w * 0.47), entryH - 5);

      if (entry.unlocked) {
        ctx.font = `bold ${Math.floor(L.h * 0.016)}px monospace`;
        ctx.fillStyle = '#e2e8f0';
        ctx.fillText(entry.name, margin + 10, ey + Math.floor(entryH * 0.25));
        ctx.font = L.fontTiny;
        ctx.fillStyle = '#94a3b8';
        const loreText = entry.lore1.slice(0, 120) + (entry.lore1.length > 120 ? '...' : '');
        ctx.fillText(loreText, margin + 10, ey + Math.floor(entryH * 0.5));
        if (entry.lore2Unlocked && entry.lore2) {
          ctx.fillStyle = '#6366f1';
          const lore2Text = entry.lore2.slice(0, 100) + (entry.lore2.length > 100 ? '...' : '');
          ctx.fillText(lore2Text, margin + 10, ey + Math.floor(entryH * 0.75));
        }
      } else {
        ctx.font = `bold ${Math.floor(L.h * 0.016)}px monospace`;
        ctx.fillStyle = '#374151';
        ctx.fillText('??? — Nao descoberto', margin + 10, ey + Math.floor(entryH * 0.25));
        ctx.font = L.fontTiny;
        ctx.fillStyle = '#1f2937';
        ctx.fillText('████████████████████████████', margin + 10, ey + Math.floor(entryH * 0.5));
      }
    }

    // Scroll indicators
    if (this.codexScroll > 0) {
      ctx.font = `bold ${Math.floor(L.h * 0.016)}px monospace`;
      ctx.fillStyle = '#6366f1';
      ctx.textAlign = 'center';
      ctx.fillText('▲', margin + Math.floor(L.w * 0.2), startY - Math.floor(L.h * 0.01));
    }
    if (this.codexScroll < scrollMax) {
      ctx.font = `bold ${Math.floor(L.h * 0.016)}px monospace`;
      ctx.fillStyle = '#6366f1';
      ctx.textAlign = 'center';
      ctx.fillText('▼', margin + Math.floor(L.w * 0.2), L.h - Math.floor(L.h * 0.04));
    }

    // ─── RIGHT PANEL: Detail View (Hollow Knight style) ────────────────────
    const detailX = Math.floor(L.w * 0.52);
    const detailW = Math.floor(L.w * 0.45);
    const detailY = startY;
    const detailH = L.h - startY - Math.floor(L.h * 0.08);

    ctx.fillStyle = 'rgba(8, 8, 18, 0.9)';
    ctx.fillRect(detailX, detailY, detailW, detailH);
    ctx.strokeStyle = '#1f2937';
    ctx.lineWidth = 1;
    ctx.strokeRect(detailX, detailY, detailW, detailH);

    if (this.codexSelectedEntry >= 0 && this.codexSelectedEntry < entries.length) {
      const selEntry = entries[this.codexSelectedEntry];
      if (selEntry.unlocked) {
        const dx = detailX + Math.floor(detailW * 0.05);
        const dw = Math.floor(detailW * 0.9);

        // Large portrait (top right)
        const portraitSize = Math.floor(Math.min(detailW * 0.35, L.h * 0.28));
        const portraitX = detailX + detailW - portraitSize - Math.floor(detailW * 0.05);
        const portraitY2 = detailY + Math.floor(detailH * 0.05);

        // Try loading real boss/character portrait
        const bossImg = getBossPortrait(selEntry.id);
        const charImg = getCharacterPortrait(selEntry.id);
        const realImg = bossImg || charImg;
        if (realImg) {
          ctx.drawImage(realImg, portraitX, portraitY2, portraitSize, portraitSize);
        } else {
          // Draw enlarged sprite or placeholder
          const sprite = this.sprites.enemies.get(selEntry.id) || this.sprites.items.get(selEntry.id);
          if (sprite) {
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(sprite, portraitX, portraitY2, portraitSize, portraitSize);
            ctx.imageSmoothingEnabled = true;
          } else {
            ctx.fillStyle = 'rgba(99, 102, 241, 0.1)';
            ctx.fillRect(portraitX, portraitY2, portraitSize, portraitSize);
            ctx.strokeStyle = '#374151';
            ctx.strokeRect(portraitX, portraitY2, portraitSize, portraitSize);
            ctx.font = `${Math.floor(portraitSize * 0.35)}px monospace`;
            ctx.fillStyle = '#6366f1';
            ctx.textAlign = 'center';
            const icons: Record<string, string> = { enemy: '👾', boss: '🐉', character: '🧑', item: '⚙', card: '🃏', collectible: '📜' };
            ctx.fillText(icons[selEntry.category] || '?', portraitX + portraitSize / 2, portraitY2 + portraitSize * 0.6);
            ctx.textAlign = 'left';
          }
        }

        // Entry name
        ctx.font = `bold ${Math.floor(L.h * 0.022)}px monospace`;
        ctx.fillStyle = '#fbbf24';
        ctx.textAlign = 'left';
        ctx.fillText(selEntry.name, dx, portraitY2 + Math.floor(L.h * 0.02));

        // Category
        ctx.font = `${Math.floor(L.h * 0.011)}px monospace`;
        ctx.fillStyle = '#6366f1';
        ctx.fillText(selEntry.category.toUpperCase(), dx, portraitY2 + Math.floor(L.h * 0.045));

        // Full lore text (word wrapped)
        const loreStartY = portraitY2 + portraitSize + Math.floor(L.h * 0.03);
        ctx.font = `${Math.floor(L.h * 0.013)}px monospace`;
        ctx.fillStyle = '#e2e8f0';
        const loreWords = selEntry.lore1.split(' ');
        let loreLine = '';
        let loreCY = loreStartY;
        const loreLineH = Math.floor(L.h * 0.02);
        for (const word of loreWords) {
          const test = loreLine + word + ' ';
          if (ctx.measureText(test).width > dw && loreLine) {
            ctx.fillText(loreLine.trim(), dx, loreCY);
            loreLine = word + ' ';
            loreCY += loreLineH;
            if (loreCY > detailY + detailH - Math.floor(L.h * 0.05)) break;
          } else {
            loreLine = test;
          }
        }
        if (loreLine && loreCY <= detailY + detailH - Math.floor(L.h * 0.05)) {
          ctx.fillText(loreLine.trim(), dx, loreCY);
        }

        // Lore 2
        if (selEntry.lore2Unlocked && selEntry.lore2) {
          loreCY += loreLineH * 1.5;
          ctx.fillStyle = '#a78bfa';
          ctx.font = `italic ${Math.floor(L.h * 0.012)}px monospace`;
          const l2Words = selEntry.lore2.split(' ');
          let l2Line = '';
          for (const word of l2Words) {
            const test = l2Line + word + ' ';
            if (ctx.measureText(test).width > dw && l2Line) {
              ctx.fillText(l2Line.trim(), dx, loreCY);
              l2Line = word + ' ';
              loreCY += loreLineH;
              if (loreCY > detailY + detailH - Math.floor(L.h * 0.02)) break;
            } else {
              l2Line = test;
            }
          }
          if (l2Line && loreCY <= detailY + detailH - Math.floor(L.h * 0.02)) {
            ctx.fillText(l2Line.trim(), dx, loreCY);
          }
        }
      } else {
        ctx.font = `bold ${Math.floor(L.h * 0.02)}px monospace`;
        ctx.fillStyle = '#374151';
        ctx.textAlign = 'center';
        ctx.fillText('???', detailX + detailW / 2, detailY + detailH / 2);
        ctx.font = L.fontSmall;
        ctx.fillText('Ainda não descoberto', detailX + detailW / 2, detailY + detailH / 2 + Math.floor(L.h * 0.04));
        ctx.textAlign = 'left';
      }
    } else {
      ctx.font = `${Math.floor(L.h * 0.015)}px monospace`;
      ctx.fillStyle = '#475569';
      ctx.textAlign = 'center';
      ctx.fillText('Selecione uma entrada à esquerda', detailX + detailW / 2, detailY + detailH / 2);
      ctx.textAlign = 'left';
    }
    } // end of else (non-fusion tabs)

    // Back button
    ctx.textAlign = 'left';
    const backBtnW = Math.floor(L.w * 0.1);
    const backBtnH = Math.floor(L.h * 0.05);
    this.renderButton(margin, L.h - Math.floor(L.h * 0.08), backBtnW, backBtnH, '← VOLTAR', '#374151');
  }

  /** Render the Fusion Guide tab in the Codex */
  private renderFusionGuide(startY: number, L: Layout, margin: number): void {
    const { ctx } = this;
    const combos = ALL_COMBINATIONS;
    const entryH = Math.floor(L.h * 0.065);
    const visibleCount = Math.floor((L.h - startY - Math.floor(L.h * 0.08)) / entryH);
    const scrollMax = Math.max(0, combos.length - visibleCount);
    this.codexScroll = Math.max(0, Math.min(scrollMax, this.codexScroll));

    // Header
    ctx.font = `bold ${Math.floor(L.h * 0.014)}px monospace`;
    ctx.fillStyle = '#f472b6';
    ctx.textAlign = 'left';
    ctx.fillText(`${combos.length} Fusões — Coloque itens adjacentes para ativar!`, margin, startY - Math.floor(L.h * 0.015));

    for (let i = 0; i < visibleCount && (i + this.codexScroll) < combos.length; i++) {
      const combo = combos[i + this.codexScroll];
      const ey = startY + i * entryH;

      // Row background
      ctx.fillStyle = i % 2 === 0 ? 'rgba(20, 20, 40, 0.7)' : 'rgba(15, 15, 30, 0.7)';
      ctx.fillRect(margin, ey, L.w - margin * 2, entryH - 3);

      // Hover highlight
      const isHover = this.mouseY >= ey && this.mouseY <= ey + entryH - 3 &&
                      this.mouseX >= margin && this.mouseX <= L.w - margin;
      if (isHover) {
        ctx.strokeStyle = '#f472b6';
        ctx.lineWidth = 1;
        ctx.strokeRect(margin, ey, L.w - margin * 2, entryH - 3);
      }

      // Fusion color indicator bar
      ctx.fillStyle = combo.fusionColor || '#6366f1';
      ctx.fillRect(margin, ey, 4, entryH - 3);

      // Result name
      ctx.font = `bold ${Math.floor(L.h * 0.013)}px monospace`;
      ctx.fillStyle = combo.fusionColor || '#f472b6';
      ctx.fillText(`★ ${combo.resultName}`, margin + 12, ey + Math.floor(entryH * 0.35));

      // Formula: Item A + Item B
      ctx.font = `${Math.floor(L.h * 0.010)}px monospace`;
      ctx.fillStyle = '#94a3b8';
      const nameA = ALL_ITEMS.find(i => i.id === combo.itemA)?.name ?? combo.itemA;
      const nameB = ALL_ITEMS.find(i => i.id === combo.itemB)?.name ?? combo.itemB;
      ctx.fillText(`${nameA} + ${nameB}`, margin + 12, ey + Math.floor(entryH * 0.7));

      // Bonuses summary on right
      const bonusTexts: string[] = [];
      if (combo.bonuses.damageMultiplier) bonusTexts.push(`DMG x${combo.bonuses.damageMultiplier}`);
      if (combo.bonuses.fireRateMultiplier) bonusTexts.push(`SPD x${combo.bonuses.fireRateMultiplier}`);
      if (combo.bonuses.projectileCount) bonusTexts.push(`+${combo.bonuses.projectileCount} proj`);
      if (combo.bonuses.aoeRadius) bonusTexts.push(`AoE +${combo.bonuses.aoeRadius}`);
      if (combo.bonuses.piercing) bonusTexts.push(`Perf +${combo.bonuses.piercing}`);
      if (combo.bonuses.healPerSecond) bonusTexts.push(`Cura +${combo.bonuses.healPerSecond}/s`);

      ctx.font = `${Math.floor(L.h * 0.009)}px monospace`;
      ctx.fillStyle = '#4ade80';
      ctx.textAlign = 'right';
      ctx.fillText(bonusTexts.join(' | '), L.w - margin - 8, ey + Math.floor(entryH * 0.35));

      // Description
      ctx.font = `${Math.floor(L.h * 0.009)}px monospace`;
      ctx.fillStyle = '#64748b';
      ctx.fillText(combo.description.slice(0, 60), L.w - margin - 8, ey + Math.floor(entryH * 0.7));
      ctx.textAlign = 'left';

      // Item icons
      const spriteA = this.sprites.items.get(combo.itemA);
      const spriteB = this.sprites.items.get(combo.itemB);
      const iconSize = Math.floor(entryH * 0.55);
      const iconX = Math.floor(L.w * 0.4);
      if (spriteA) ctx.drawImage(spriteA, iconX, ey + 4, iconSize, iconSize);
      ctx.font = `bold ${Math.floor(L.h * 0.014)}px monospace`;
      ctx.fillStyle = '#fbbf24';
      ctx.fillText('+', iconX + iconSize + 4, ey + Math.floor(entryH * 0.55));
      if (spriteB) ctx.drawImage(spriteB, iconX + iconSize + 18, ey + 4, iconSize, iconSize);
    }

    // Scroll indicators
    if (this.codexScroll > 0) {
      ctx.font = `bold ${Math.floor(L.h * 0.016)}px monospace`;
      ctx.fillStyle = '#f472b6';
      ctx.textAlign = 'center';
      ctx.fillText('▲', L.cx, startY - Math.floor(L.h * 0.002));
    }
    if (this.codexScroll < scrollMax) {
      ctx.font = `bold ${Math.floor(L.h * 0.016)}px monospace`;
      ctx.fillStyle = '#f472b6';
      ctx.textAlign = 'center';
      ctx.fillText('▼', L.cx, L.h - Math.floor(L.h * 0.04));
    }
    ctx.textAlign = 'left';
  }

  /** Render the Relics tab in the Codex — shows all 12 relics with collected status */
  private renderRelicsGuide(startY: number, L: Layout, margin: number): void {
    const { ctx } = this;
    const collected = new Set(getCollectedRelics());
    const collectedCount = collected.size;
    const equipped = getEquippedRelics();

    // Summary header
    ctx.font = `bold ${Math.floor(L.h * 0.014)}px monospace`;
    ctx.fillStyle = '#fbbf24';
    ctx.textAlign = 'left';
    ctx.fillText(
      `${collectedCount}/${ALL_RELICS.length} Relíquias coletadas — Equipadas: ${equipped.length}/5`,
      margin, startY - Math.floor(L.h * 0.015)
    );

    // Show equipped bonuses summary
    if (equipped.length > 0) {
      const bonusParts: string[] = [];
      let totalHp = 0, totalDmg = 0, totalRate = 0, totalHeal = 0;
      for (const r of equipped) {
        totalHp += r.bonus.hpBonus ?? 0;
        totalDmg += r.bonus.damagePercent ?? 0;
        totalRate += r.bonus.fireRatePercent ?? 0;
        totalHeal += r.bonus.healPerSecond ?? 0;
      }
      if (totalHp > 0) bonusParts.push(`+${totalHp} HP`);
      if (totalDmg > 0) bonusParts.push(`+${totalDmg}% DMG`);
      if (totalRate > 0) bonusParts.push(`+${totalRate}% Cadência`);
      if (totalHeal > 0) bonusParts.push(`+${totalHeal} HP/s`);
      if (bonusParts.length > 0) {
        ctx.font = `${Math.floor(L.h * 0.011)}px monospace`;
        ctx.fillStyle = '#4ade80';
        ctx.fillText(`Bônus ativo: ${bonusParts.join(' | ')}`, margin, startY - Math.floor(L.h * 0.002));
      }
    }

    // Grid of relics: 4 columns × 3 rows
    const cols = 4;
    const cardW = Math.floor((L.w - margin * 2 - (cols - 1) * Math.floor(L.w * 0.012)) / cols);
    const cardH = Math.floor(L.h * 0.22);
    const gapX = Math.floor(L.w * 0.012);
    const gapY = Math.floor(L.h * 0.015);

    for (let ri = 0; ri < ALL_RELICS.length; ri++) {
      const relic = ALL_RELICS[ri];
      const col = ri % cols;
      const row = Math.floor(ri / cols);
      const cx = margin + col * (cardW + gapX);
      const cy = startY + row * (cardH + gapY);
      const isCollected = collected.has(relic.id);
      const isEquipped = equipped.some(e => e.id === relic.id);

      // Card bg
      ctx.fillStyle = isEquipped
        ? 'rgba(251,191,36,0.12)'
        : isCollected
          ? 'rgba(20,60,40,0.7)'
          : 'rgba(10,10,24,0.6)';
      ctx.fillRect(cx, cy, cardW, cardH);

      // Border
      ctx.strokeStyle = isEquipped ? '#fbbf24' : isCollected ? '#4ade80' : '#1f2937';
      ctx.lineWidth = isEquipped ? 2 : 1;
      ctx.strokeRect(cx, cy, cardW, cardH);

      // Top accent bar
      if (isCollected) {
        ctx.fillStyle = isEquipped ? '#fbbf24' : '#4ade80';
        ctx.fillRect(cx, cy, cardW, 2);
      }

      // Icon
      ctx.font = `${Math.floor(L.h * 0.045)}px monospace`;
      ctx.textAlign = 'center';
      ctx.globalAlpha = isCollected ? 1 : 0.25;
      ctx.fillText(relic.icon, cx + cardW / 2, cy + Math.floor(cardH * 0.4));
      ctx.globalAlpha = 1;

      // Name
      ctx.font = `bold ${Math.floor(L.h * 0.012)}px monospace`;
      ctx.fillStyle = isCollected ? '#e2e8f0' : '#374151';
      ctx.fillText(isCollected ? relic.name : '???', cx + cardW / 2, cy + Math.floor(cardH * 0.58));

      // Description / bonus
      ctx.font = `${Math.floor(L.h * 0.010)}px monospace`;
      ctx.fillStyle = isCollected ? '#94a3b8' : '#1f2937';
      ctx.fillText(isCollected ? relic.description : 'Derrote bosses', cx + cardW / 2, cy + Math.floor(cardH * 0.74));

      // "EQUIPADA" badge
      if (isEquipped) {
        ctx.font = `bold ${Math.floor(L.h * 0.009)}px monospace`;
        ctx.fillStyle = '#fbbf24';
        ctx.fillText('EQUIPADA', cx + cardW / 2, cy + Math.floor(cardH * 0.90));
      }
    }
    ctx.textAlign = 'left';
  }

  private getItemColor(tags: string[]): string {
    if (tags.includes('Fogo')) return '#7c2d12';
    if (tags.includes('Água') || tags.includes('Gelo')) return '#0c4a6e';
    if (tags.includes('Animal') || tags.includes('Planta')) return '#14532d';
    if (tags.includes('Modificador')) return '#3b0764';
    if (tags.includes('Escudo')) return '#1e3a5f';
    if (tags.includes('Elétrico')) return '#713f12';
    if (tags.includes('Arma')) return '#450a0a';
    if (tags.includes('Veneno')) return '#052e16';
    return '#1f2937';
  }

  private getEnemySpriteId(e: { tags: string[] | readonly string[]; width: number; defId?: string }): string {
    if (e.defId && this.sprites.enemies.has(e.defId)) return e.defId;
    if (e.tags.includes('Fogo')) return 'fire_imp';
    if (e.tags.includes('Gelo') || e.tags.includes('Água')) return 'ice_golem';
    if (e.tags.includes('Orgânico') || e.tags.includes('Planta')) return 'vine_creep';
    if (e.tags.includes('Elétrico')) return 'thunder_bug';
    if (e.width >= 48) return 'boss_drill_sergeant';
    if (e.width >= 32) return 'tank';
    if (e.width >= 24) return 'grunt';
    return 'scout';
  }

  private getProjectileElement(tags: string[] | readonly string[]): string {
    if (tags.includes('Fogo')) return 'fire';
    if (tags.includes('Gelo')) return 'ice';
    if (tags.includes('Água')) return 'water';
    if (tags.includes('Veneno')) return 'poison';
    if (tags.includes('Elétrico')) return 'electric';
    return 'normal';
  }

  // ─── Twitch Vote Phase ────────────────────────────────────────────────────

  private renderTwitchVote(dt: number): void {
    const { ctx, canvas, game } = this;
    const L = this.getLayout();

    ctx.fillStyle = 'rgba(5, 5, 15, 0.9)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = L.fontTitle;
    ctx.fillStyle = '#a78bfa';
    ctx.textAlign = 'center';
    ctx.fillText('CHAT ESCOLHE!', L.cx, Math.floor(L.h * 0.1));

    // Timer
    const remaining = game.twitch.getVoteTimeRemaining();
    const seconds = Math.ceil(remaining / 1000);
    ctx.font = L.fontNormal;
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`Tempo restante: ${seconds}s`, L.cx, Math.floor(L.h * 0.16));

    // Options
    const options = [
      { key: 'A', label: '+20 Gold', color: '#fbbf24' },
      { key: 'B', label: 'Heal 30 HP', color: '#4ade80' },
      { key: 'C', label: 'Inimigos +50% mas +100 Gold', color: '#f97316' },
    ];

    const voteCounts = game.twitch.getVoteCounts();
    const totalVotes = Array.from(voteCounts.values()).reduce((a, b) => a + b, 0);
    const optionW = Math.floor(L.w * 0.22);
    const optionH = Math.floor(L.h * 0.35);
    const gap = Math.floor(L.w * 0.03);
    const startX = (L.w - 3 * optionW - 2 * gap) / 2;
    const optionY = Math.floor(L.h * 0.22);

    for (let i = 0; i < options.length; i++) {
      const opt = options[i];
      const x = startX + i * (optionW + gap);
      const votes = voteCounts.get(opt.key) || 0;
      const pct = totalVotes > 0 ? votes / totalVotes : 0;

      // Card background
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(x, optionY, optionW, optionH);
      ctx.strokeStyle = opt.color;
      ctx.lineWidth = 2;
      ctx.strokeRect(x, optionY, optionW, optionH);

      // Key
      ctx.font = `bold ${Math.floor(L.h * 0.04)}px monospace`;
      ctx.fillStyle = opt.color;
      ctx.fillText(`!${opt.key}`, x + optionW / 2, optionY + Math.floor(optionH * 0.2));

      // Label
      ctx.font = `bold ${Math.floor(L.h * 0.018)}px monospace`;
      ctx.fillStyle = '#e2e8f0';
      ctx.fillText(opt.label, x + optionW / 2, optionY + Math.floor(optionH * 0.4));

      // Vote bar
      const barX = x + Math.floor(optionW * 0.1);
      const barW = Math.floor(optionW * 0.8);
      const barY = optionY + Math.floor(optionH * 0.55);
      const barH = Math.floor(optionH * 0.12);
      ctx.fillStyle = '#1f2937';
      ctx.fillRect(barX, barY, barW, barH);
      ctx.fillStyle = opt.color;
      ctx.fillRect(barX, barY, barW * pct, barH);

      // Vote count
      ctx.font = L.fontNormal;
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(`${votes} votos (${Math.round(pct * 100)}%)`, x + optionW / 2, optionY + Math.floor(optionH * 0.82));
    }

    ctx.font = L.fontSmall;
    ctx.fillStyle = '#64748b';
    ctx.fillText('Digite !A, !B ou !C no chat', L.cx, Math.floor(L.h * 0.88));
    ctx.textAlign = 'left';
  }

  // ─── Twitch Notifications ─────────────────────────────────────────────────

  private renderTwitchNotifications(dt: number): void {
    const { ctx, game } = this;
    if (!game.twitch.connected) return;
    const L = this.getLayout();
    const notifications = game.twitch.notifications;

    for (let i = 0; i < notifications.length; i++) {
      const notif = notifications[i];
      const alpha = Math.min(1, notif.life / (notif.maxLife * 0.3));
      const y = Math.floor(L.h * 0.15) + i * Math.floor(L.h * 0.035);

      ctx.globalAlpha = alpha;
      ctx.fillStyle = 'rgba(10,10,18,0.8)';
      const textWidth = ctx.measureText(notif.text).width;
      ctx.fillRect(L.w - textWidth - 30, y - Math.floor(L.h * 0.012), textWidth + 20, Math.floor(L.h * 0.03));
      ctx.font = L.fontSmall;
      ctx.fillStyle = notif.color;
      ctx.textAlign = 'right';
      ctx.fillText(notif.text, L.w - 20, y);
      ctx.textAlign = 'left';
    }
    ctx.globalAlpha = 1;
  }

  // ─── Twitch Status Icon ───────────────────────────────────────────────────

  private renderTwitchStatus(): void {
    const { ctx, game } = this;
    if (!game.twitch.enabled && !game.twitch.connected) return;
    const L = this.getLayout();

    // Small icon in top-right corner during gameplay
    if (game.phase !== 'TITLE') {
      const iconX = L.w - 25;
      const iconY = 8;
      const size = 12;

      ctx.fillStyle = game.twitch.connected ? '#9333ea' : '#374151';
      ctx.beginPath();
      ctx.arc(iconX, iconY + size / 2, size / 2, 0, Math.PI * 2);
      ctx.fill();

      // "TV" text
      ctx.font = `bold ${Math.floor(size * 0.6)}px monospace`;
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText('T', iconX, iconY + size / 2 + 2);
      ctx.textAlign = 'left';

      // Shield indicator
      if (game.twitch.shieldActive) {
        ctx.strokeStyle = '#6366f1';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(iconX, iconY + size / 2, size / 2 + 3, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  }

  // ─── Twitch Input Overlay ─────────────────────────────────────────────────

  private renderTwitchInput(): void {
    if (!this.inputHandler?.twitchInputActive) return;
    const { ctx, canvas } = this;
    const L = this.getLayout();

    // Overlay
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Input box
    const boxW = Math.floor(L.w * 0.3);
    const boxH = Math.floor(L.h * 0.08);
    const boxX = L.cx - boxW / 2;
    const boxY = Math.floor(L.h * 0.45);

    ctx.font = `bold ${Math.floor(L.h * 0.022)}px monospace`;
    ctx.fillStyle = '#a78bfa';
    ctx.textAlign = 'center';
    ctx.fillText('CONECTAR À TWITCH', L.cx, boxY - Math.floor(L.h * 0.05));

    ctx.font = L.fontSmall;
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('Digite o nome do canal e pressione Enter', L.cx, boxY - Math.floor(L.h * 0.02));

    // Input field
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(boxX, boxY, boxW, boxH);
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 2;
    ctx.strokeRect(boxX, boxY, boxW, boxH);

    // Text
    const text = this.inputHandler.twitchInputText;
    ctx.font = L.fontNormal;
    ctx.fillStyle = '#e2e8f0';
    ctx.fillText(text + (Math.floor(Date.now() / 500) % 2 === 0 ? '|' : ''), L.cx, boxY + boxH / 2 + 4);

    // Status
    const twitch = this.game.twitch;
    if (twitch.connected) {
      ctx.fillStyle = '#4ade80';
      ctx.fillText(`Conectado: ${twitch.channelName}`, L.cx, boxY + boxH + Math.floor(L.h * 0.04));
    } else if (twitch.error) {
      ctx.fillStyle = '#ef4444';
      ctx.fillText(twitch.error, L.cx, boxY + boxH + Math.floor(L.h * 0.04));
    }

    ctx.font = L.fontTiny;
    ctx.fillStyle = '#64748b';
    ctx.fillText('Esc para fechar', L.cx, boxY + boxH + Math.floor(L.h * 0.08));
    ctx.textAlign = 'left';
  }

  // ─── Pause Overlay ────────────────────────────────────────────────────────

  renderPause(): void {
    const { ctx, canvas, game } = this;
    const L = this.getLayout();

    // Dark overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // "PAUSADO" text
    ctx.font = L.fontHuge;
    ctx.fillStyle = '#fbbf24';
    ctx.textAlign = 'center';
    ctx.fillText('PAUSADO', L.cx, L.cy - Math.floor(L.h * 0.18));

    // Current stats
    ctx.font = L.fontNormal;
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(
      `${game.getTimeString()} | Gold: ${game.gold} | HP: ${Math.ceil(game.combat.state.playerHp)}/${game.combat.state.playerMaxHp}`,
      L.cx, L.cy - Math.floor(L.h * 0.10)
    );

    // Active synergies
    if (game.activeSynergies.length > 0) {
      ctx.font = L.fontSmall;
      ctx.fillStyle = '#a78bfa';
      ctx.fillText(game.activeSynergies.join(' | '), L.cx, L.cy - Math.floor(L.h * 0.05));
    }

    // Buttons
    const btnW = Math.floor(L.w * 0.2);
    const btnH = Math.floor(L.h * 0.055);
    const btnX = L.cx - btnW / 2;
    const gap = Math.floor(L.h * 0.07);

    let btnY = L.cy;
    this.renderButton(btnX, btnY, btnW, btnH, '▶ CONTINUAR', '#4ade80');
    btnY += gap;
    this.renderButton(btnX, btnY, btnW, btnH, '⚙ CONFIGURAÇÕES', '#6366f1');
    btnY += gap;
    this.renderButton(btnX, btnY, btnW, btnH, '📖 ARQUIVO ALIEN', '#a78bfa');
    btnY += gap;
    this.renderButton(btnX, btnY, btnW, btnH, '🏠 MENU PRINCIPAL', '#374151');

    // Hint
    ctx.font = L.fontTiny;
    ctx.fillStyle = '#475569';
    ctx.fillText('ESC para continuar', L.cx, L.cy + Math.floor(L.h * 0.35));

    ctx.textAlign = 'left';
  }

  // ─── Settings Screen ───────────────────────────────────────────────────────

  private renderSettings(): void {
    const { ctx, canvas, game } = this;
    const L = this.getLayout();

    // Background
    ctx.fillStyle = 'rgba(5, 5, 15, 0.97)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Title
    ctx.font = L.fontTitle;
    ctx.fillStyle = '#fbbf24';
    ctx.textAlign = 'center';
    ctx.fillText('CONFIGURAÇÕES', L.cx, Math.floor(L.h * 0.08));

    const panelW = Math.floor(L.w * 0.5);
    const panelX = (L.w - panelW) / 2;
    const startY = Math.floor(L.h * 0.14);
    const lineH = Math.floor(L.h * 0.075);
    const sliderW = Math.floor(panelW * 0.6);
    const sliderX = L.cx - sliderW / 2;
    const labelX = panelX + 10;
    let cy = startY;

    // ─── Music Volume ────────────────────────────────────────────────────
    ctx.font = `bold ${Math.floor(L.h * 0.014)}px monospace`;
    ctx.fillStyle = '#e2e8f0';
    ctx.textAlign = 'left';
    ctx.fillText('🎵 Volume Música', labelX, cy);
    const volStored = parseInt(localStorage.getItem('packinvaders_volume') || '40', 10) / 100;
    const volBarY = cy + Math.floor(lineH * 0.35);
    const volBarH = Math.floor(L.h * 0.02);
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(sliderX, volBarY, sliderW, volBarH);
    ctx.fillStyle = '#6366f1';
    ctx.fillRect(sliderX, volBarY, sliderW * volStored, volBarH);
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(sliderX + sliderW * volStored, volBarY + volBarH / 2, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = `${Math.floor(L.h * 0.012)}px monospace`;
    ctx.fillStyle = '#94a3b8';
    ctx.textAlign = 'right';
    ctx.fillText(`${Math.round(volStored * 100)}%`, panelX + panelW - 10, cy + Math.floor(lineH * 0.4));
    cy += lineH;

    // ─── SFX Volume ──────────────────────────────────────────────────────
    ctx.textAlign = 'left';
    ctx.font = `bold ${Math.floor(L.h * 0.014)}px monospace`;
    ctx.fillStyle = '#e2e8f0';
    ctx.fillText('🔊 Volume SFX', labelX, cy);
    const sfxStored = parseInt(localStorage.getItem('packinvaders_sfx_volume') || '60', 10) / 100;
    const sfxBarY = cy + Math.floor(lineH * 0.35);
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(sliderX, sfxBarY, sliderW, volBarH);
    ctx.fillStyle = '#4ade80';
    ctx.fillRect(sliderX, sfxBarY, sliderW * sfxStored, volBarH);
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(sliderX + sliderW * sfxStored, sfxBarY + volBarH / 2, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = `${Math.floor(L.h * 0.012)}px monospace`;
    ctx.fillStyle = '#94a3b8';
    ctx.textAlign = 'right';
    ctx.fillText(`${Math.round(sfxStored * 100)}%`, panelX + panelW - 10, cy + Math.floor(lineH * 0.4));
    cy += lineH;

    // ─── Screen Shake ────────────────────────────────────────────────────
    ctx.textAlign = 'left';
    ctx.font = `bold ${Math.floor(L.h * 0.014)}px monospace`;
    ctx.fillStyle = '#e2e8f0';
    ctx.fillText('📳 Screen Shake', labelX, cy);
    const shakeEnabled = localStorage.getItem('packinvaders_shake') !== 'off';
    const shakeBtn = { x: sliderX, y: cy + Math.floor(lineH * 0.15), w: Math.floor(sliderW * 0.3), h: Math.floor(L.h * 0.035) };
    ctx.fillStyle = shakeEnabled ? '#4ade80' : '#374151';
    ctx.fillRect(shakeBtn.x, shakeBtn.y, shakeBtn.w, shakeBtn.h);
    ctx.strokeStyle = shakeEnabled ? '#22c55e' : '#64748b';
    ctx.lineWidth = 1;
    ctx.strokeRect(shakeBtn.x, shakeBtn.y, shakeBtn.w, shakeBtn.h);
    ctx.font = `bold ${Math.floor(L.h * 0.012)}px monospace`;
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText(shakeEnabled ? 'LIGADO' : 'DESLIGADO', shakeBtn.x + shakeBtn.w / 2, shakeBtn.y + shakeBtn.h * 0.7);
    cy += lineH;

    // ─── Particles ───────────────────────────────────────────────────────
    ctx.textAlign = 'left';
    ctx.font = `bold ${Math.floor(L.h * 0.014)}px monospace`;
    ctx.fillStyle = '#e2e8f0';
    ctx.fillText('✨ Partículas', labelX, cy);
    const particlesEnabled = localStorage.getItem('packinvaders_particles') !== 'off';
    const partBtn = { x: sliderX, y: cy + Math.floor(lineH * 0.15), w: Math.floor(sliderW * 0.3), h: Math.floor(L.h * 0.035) };
    ctx.fillStyle = particlesEnabled ? '#4ade80' : '#374151';
    ctx.fillRect(partBtn.x, partBtn.y, partBtn.w, partBtn.h);
    ctx.strokeStyle = particlesEnabled ? '#22c55e' : '#64748b';
    ctx.lineWidth = 1;
    ctx.strokeRect(partBtn.x, partBtn.y, partBtn.w, partBtn.h);
    ctx.font = `bold ${Math.floor(L.h * 0.012)}px monospace`;
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText(particlesEnabled ? 'LIGADO' : 'DESLIGADO', partBtn.x + partBtn.w / 2, partBtn.y + partBtn.h * 0.7);
    cy += lineH;

    // ─── Fullscreen ──────────────────────────────────────────────────────
    const fsBtnW = Math.floor(panelW * 0.4);
    const fsBtnH = Math.floor(L.h * 0.045);
    const fsBtnX = L.cx - fsBtnW / 2;
    const isFs = !!document.fullscreenElement;
    this.renderButton(fsBtnX, cy, fsBtnW, fsBtnH, isFs ? '🖥 JANELA' : '🖥 TELA CHEIA', '#374151');
    cy += lineH;

    // ─── Reset Progress ──────────────────────────────────────────────────
    const resetBtnW = Math.floor(panelW * 0.45);
    const resetBtnH = Math.floor(L.h * 0.045);
    const resetBtnX = L.cx - resetBtnW / 2;
    const isResetConfirm = !!(this.inputHandler as any)?._resetConfirm;
    ctx.fillStyle = isResetConfirm ? '#dc2626' : '#7f1d1d';
    ctx.fillRect(resetBtnX, cy, resetBtnW, resetBtnH);
    ctx.strokeStyle = isResetConfirm ? '#fbbf24' : '#ef4444';
    ctx.lineWidth = isResetConfirm ? 2 : 1;
    ctx.strokeRect(resetBtnX, cy, resetBtnW, resetBtnH);
    ctx.font = `bold ${Math.floor(L.h * 0.013)}px monospace`;
    ctx.fillStyle = isResetConfirm ? '#fbbf24' : '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText(isResetConfirm ? '⚠ CLIQUE NOVAMENTE' : '🗑 RESETAR PROGRESSO', resetBtnX + resetBtnW / 2, cy + resetBtnH * 0.65);
    cy += lineH;

    // ─── Back button ─────────────────────────────────────────────────────
    const backBtnW = Math.floor(panelW * 0.35);
    const backBtnH = Math.floor(L.h * 0.05);
    const backBtnX = L.cx - backBtnW / 2;
    this.renderButton(backBtnX, cy, backBtnW, backBtnH, '← VOLTAR', '#374151');

    // Footer hint
    ctx.font = `${Math.floor(L.h * 0.009)}px monospace`;
    ctx.fillStyle = '#374151';
    ctx.fillText('ESC para voltar', L.cx, L.h - Math.floor(L.h * 0.03));
    ctx.textAlign = 'left';
  }

  // ─── Achievement Notifications ──────────────────────────────────────────────

  private renderAchievementNotifs(dt: number): void {
    const { ctx } = this;
    const L = this.getLayout();
    for (let i = this.achievementNotifs.length - 1; i >= 0; i--) {
      const notif = this.achievementNotifs[i];
      notif.timer -= dt;
      if (notif.timer <= 0) { this.achievementNotifs.splice(i, 1); continue; }
      const alpha = Math.min(1, notif.timer);
      const y = Math.floor(L.h * 0.15) + i * Math.floor(L.h * 0.06);
      ctx.globalAlpha = alpha * 0.9;
      ctx.fillStyle = 'rgba(20, 30, 20, 0.9)';
      ctx.fillRect(L.w - Math.floor(L.w * 0.25), y, Math.floor(L.w * 0.23), Math.floor(L.h * 0.05));
      ctx.strokeStyle = '#4ade80';
      ctx.lineWidth = 1;
      ctx.strokeRect(L.w - Math.floor(L.w * 0.25), y, Math.floor(L.w * 0.23), Math.floor(L.h * 0.05));
      ctx.font = `bold ${Math.floor(L.h * 0.011)}px monospace`;
      ctx.fillStyle = '#4ade80';
      ctx.textAlign = 'right';
      ctx.fillText('🏆 CONQUISTA!', L.w - Math.floor(L.w * 0.03), y + Math.floor(L.h * 0.02));
      ctx.font = `${Math.floor(L.h * 0.012)}px monospace`;
      ctx.fillStyle = '#e2e8f0';
      ctx.fillText(notif.name, L.w - Math.floor(L.w * 0.03), y + Math.floor(L.h * 0.038));
      ctx.textAlign = 'left';
      ctx.globalAlpha = 1;
    }
  }

  /** Queue an achievement notification */
  showAchievementNotif(name: string): void {
    this.achievementNotifs.push({ name, timer: 3.0 });
  }

  /** Queue a fusion activation popup */
  showFusionNotif(name: string, color: string): void {
    // Avoid duplicates already showing
    if (!this.fusionPopups.some(p => p.name === name)) {
      this.fusionPopups.push({ name, color, timer: 2.5 });
    }
  }

  private renderFusionPopups(dt: number): void {
    const { ctx } = this;
    const L = this.getLayout();
    for (let i = this.fusionPopups.length - 1; i >= 0; i--) {
      const popup = this.fusionPopups[i];
      popup.timer -= dt;
      if (popup.timer <= 0) { this.fusionPopups.splice(i, 1); continue; }
      const alpha = Math.min(1, popup.timer * 0.9);
      const slideIn = Math.min(1, (2.5 - popup.timer) * 4); // slide in fast
      const notifW = Math.floor(L.w * 0.26);
      const notifH = Math.floor(L.h * 0.055);
      const x = L.w - notifW - Math.floor(L.w * 0.01) - (1 - slideIn) * notifW;
      const y = Math.floor(L.h * 0.22) + i * (notifH + 4) + this.achievementNotifs.length * Math.floor(L.h * 0.06);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = 'rgba(30, 5, 35, 0.95)';
      ctx.fillRect(x, y, notifW, notifH);
      ctx.strokeStyle = popup.color;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x, y, notifW, notifH);
      ctx.fillStyle = popup.color;
      ctx.fillRect(x, y, 4, notifH);
      ctx.font = `bold ${Math.floor(L.h * 0.010)}px monospace`;
      ctx.fillStyle = popup.color;
      ctx.textAlign = 'right';
      ctx.fillText('✨ FUSÃO ATIVADA!', x + notifW - 6, y + Math.floor(notifH * 0.38));
      ctx.font = `${Math.floor(L.h * 0.012)}px monospace`;
      ctx.fillStyle = '#e2e8f0';
      ctx.fillText(popup.name, x + notifW - 6, y + Math.floor(notifH * 0.75));
      ctx.textAlign = 'left';
      ctx.globalAlpha = 1;
    }
  }

  // ─── Controls Overlay ─────────────────────────────────────────────────────

  private renderControlsOverlay(dt: number): void {
    if (!this.game.showControlsOverlay) return;
    if (this.game.phase !== 'TITLE' && this.game.phase !== 'INVENTORY' && this.game.phase !== 'MAIN_MENU') return;
    const { ctx, canvas } = this;
    const L = this.getLayout();

    ctx.fillStyle = 'rgba(0,0,0,0.85)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = L.fontTitle;
    ctx.fillStyle = '#fbbf24';
    ctx.textAlign = 'center';
    ctx.fillText('CONTROLES', L.cx, Math.floor(L.h * 0.15));

    const lines = [
      ['A/D ou ←/→', 'Mover nave no combate'],
      ['SHIFT ou ESPAÇO', 'Dash (esquiva rápida)'],
      ['1 / 2 / 3', 'Usar habilidades ativas'],
      ['Clique', 'Interagir com menus e itens'],
      ['Clique Direito', 'Rotacionar item segurado'],
      ['ESC', 'Pausar / Configurações'],
      ['C', 'Abrir/fechar Codex'],
      ['TAB', 'Guia de Fusões (na loja/inventário)'],
      ['', ''],
      ['DICA:', 'Cada personagem tem 3 skills únicas!'],
      ['DICA:', 'Combo de kills = mais gold!'],
    ];

    ctx.font = L.fontNormal;
    const startY = Math.floor(L.h * 0.26);
    const lineH = Math.floor(L.h * 0.055);
    for (let i = 0; i < lines.length; i++) {
      const [key, desc] = lines[i];
      if (key) {
        ctx.fillStyle = '#6366f1';
        ctx.textAlign = 'right';
        ctx.fillText(key, L.cx - 10, startY + i * lineH);
        ctx.fillStyle = '#e2e8f0';
        ctx.textAlign = 'left';
        ctx.fillText(desc, L.cx + 10, startY + i * lineH);
      }
    }

    ctx.textAlign = 'center';
    ctx.font = L.fontSmall;
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('Sobreviva. Monte sua mochila. Detone os aliens.', L.cx, Math.floor(L.h * 0.73));

    const alpha = 0.5 + Math.sin(Date.now() * 0.003) * 0.4;
    ctx.globalAlpha = alpha;
    ctx.font = L.fontNormal;
    ctx.fillStyle = '#64748b';
    ctx.fillText('Clique ou pressione qualquer tecla para continuar', L.cx, Math.floor(L.h * 0.85));
    ctx.globalAlpha = 1;
    ctx.textAlign = 'left';
  }

  // ─── Extra Modes ─────────────────────────────────────────────────────────────

  private renderExtraModes(): void {
    const { ctx, canvas, game } = this;
    const L = this.getLayout();

    ctx.fillStyle = '#050510';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Title
    ctx.font = `bold ${Math.floor(L.h * 0.045)}px monospace`;
    ctx.fillStyle = '#fbbf24';
    ctx.textAlign = 'center';
    ctx.fillText('MODOS EXTRAS', L.cx, Math.floor(L.h * 0.1));

    ctx.font = `${Math.floor(L.h * 0.013)}px monospace`;
    ctx.fillStyle = '#4b5563';
    ctx.fillText('Escolha o modo de jogo', L.cx, Math.floor(L.h * 0.16));

    const modes = [
      {
        id: 'COOP',
        title: 'CO-OP',
        icon: '👥',
        desc: ['2 jogadores local', 'Compartilham a arena', 'P2 usa setas do teclado'],
        color: '#4ade80',
        available: true,
      },
      {
        id: 'VERSUS_SHIPS',
        title: 'VERSUS NAVES',
        icon: '🚀',
        desc: ['2 naves local', 'Ondas de inimigos', 'A/D  ←/→  tiro auto'],
        color: '#38bdf8',
        available: true,
      },
      {
        id: 'VERSUS_PVP',
        title: 'PVP PURO',
        icon: '⚔',
        desc: ['Combate direto', 'Sem inimigos', 'SPACE / ENTER atirar'],
        color: '#f97316',
        available: true,
      },
    ];

    const cardW = Math.floor(L.w * 0.24);
    const cardH = Math.floor(L.h * 0.52);
    const totalW = cardW * 3 + Math.floor(L.w * 0.04) * 2;
    const startX = L.cx - Math.floor(totalW / 2);
    const cardY = Math.floor(L.h * 0.22);
    const gap = Math.floor(L.w * 0.04);

    for (let i = 0; i < modes.length; i++) {
      const mode = modes[i];
      const cx = startX + i * (cardW + gap);
      const isHover = this.mouseX >= cx && this.mouseX <= cx + cardW &&
                      this.mouseY >= cardY && this.mouseY <= cardY + cardH;

      // Card background
      ctx.fillStyle = isHover && mode.available ? `${mode.color}22` : 'rgba(10,10,30,0.9)';
      ctx.fillRect(cx, cardY, cardW, cardH);
      // Card border
      ctx.strokeStyle = isHover && mode.available ? mode.color : (mode.available ? `${mode.color}66` : '#374151');
      ctx.lineWidth = 2;
      ctx.strokeRect(cx, cardY, cardW, cardH);

      // Icon
      ctx.font = `${Math.floor(L.h * 0.07)}px monospace`;
      ctx.fillStyle = mode.available ? mode.color : '#374151';
      ctx.textAlign = 'center';
      ctx.fillText(mode.icon, cx + cardW / 2, cardY + Math.floor(cardH * 0.22));

      // Title
      ctx.font = `bold ${Math.floor(L.h * 0.022)}px monospace`;
      ctx.fillStyle = mode.available ? '#e2e8f0' : '#4b5563';
      ctx.fillText(mode.title, cx + cardW / 2, cardY + Math.floor(cardH * 0.38));

      // Description lines
      ctx.font = `${Math.floor(L.h * 0.013)}px monospace`;
      ctx.fillStyle = mode.available ? '#94a3b8' : '#374151';
      for (let j = 0; j < mode.desc.length; j++) {
        ctx.fillText(mode.desc[j], cx + cardW / 2, cardY + Math.floor(cardH * 0.50) + j * Math.floor(L.h * 0.04));
      }

      // Play button or "Em Breve"
      const btnY = cardY + Math.floor(cardH * 0.80);
      const btnH = Math.floor(L.h * 0.045);
      const btnX = cx + Math.floor(cardW * 0.1);
      const btnW = Math.floor(cardW * 0.8);

      if (mode.available) {
        ctx.fillStyle = isHover ? mode.color : `${mode.color}88`;
        ctx.fillRect(btnX, btnY, btnW, btnH);
        ctx.font = `bold ${Math.floor(L.h * 0.018)}px monospace`;
        ctx.fillStyle = '#000000';
        ctx.fillText('JOGAR', cx + cardW / 2, btnY + btnH * 0.65);
      } else {
        ctx.fillStyle = '#1f2937';
        ctx.fillRect(btnX, btnY, btnW, btnH);
        ctx.font = `${Math.floor(L.h * 0.014)}px monospace`;
        ctx.fillStyle = '#4b5563';
        ctx.fillText('EM BREVE', cx + cardW / 2, btnY + btnH * 0.65);
      }
    }

    // Back button
    const backY = Math.floor(L.h * 0.88);
    ctx.font = `${Math.floor(L.h * 0.016)}px monospace`;
    ctx.fillStyle = '#6366f1';
    ctx.fillText('← VOLTAR', L.cx, backY);
    ctx.textAlign = 'left';
  }

  private renderVersus(dt: number): void {
    const { ctx, canvas, game } = this;
    const L = this.getLayout();
    const vs = game.versusEngine;
    if (!vs) return;
    const st = vs.state;
    const now = performance.now();

    // ── Background ────────────────────────────────────────────────────────
    const bg = this.sprites.background;
    if (bg) {
      const sc = Math.max(canvas.width / bg.width, canvas.height / bg.height);
      ctx.drawImage(bg, 0, 0, bg.width * sc, bg.height * sc);
    } else {
      ctx.fillStyle = '#050510';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Screen shake
    let shakeX = 0; let shakeY = 0;
    if (st.shakeTimer > 0) {
      shakeX = (Math.random() - 0.5) * 8;
      shakeY = (Math.random() - 0.5) * 8;
      ctx.save();
      ctx.translate(shakeX, shakeY);
    }

    // ── Divider (PvP visual cue) ──────────────────────────────────────────
    if (st.mode === 'pvp') {
      ctx.globalAlpha = 0.15;
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.setLineDash([12, 8]);
      ctx.beginPath();
      ctx.moveTo(0, L.cy);
      ctx.lineTo(canvas.width, L.cy);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;
    }

    // ── Enemies ───────────────────────────────────────────────────────────
    for (const e of st.enemies) {
      const sprite = this.sprites.enemies.get('scout');
      if (sprite) {
        ctx.drawImage(sprite, e.x - e.width / 2, e.y - 10, e.width, 20);
      } else {
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(e.x - e.width / 2, e.y - 10, e.width, 20);
      }
      // HP bar
      const hp = e.hp / e.maxHp;
      ctx.fillStyle = '#111827'; ctx.fillRect(e.x - 10, e.y - 14, 20, 3);
      ctx.fillStyle = hp > 0.5 ? '#4ade80' : '#ef4444';
      ctx.fillRect(e.x - 10, e.y - 14, 20 * hp, 3);
    }

    // ── Projectiles ────────────────────────────────────────────────────────
    for (const p of st.projectiles) {
      if (p.owner === 1) ctx.fillStyle = '#4ade80';
      else if (p.owner === 2) ctx.fillStyle = '#38bdf8';
      else ctx.fillStyle = '#ef4444';
      ctx.shadowColor = ctx.fillStyle;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // ── Ships ─────────────────────────────────────────────────────────────
    const drawShip = (ship: typeof st.p1, colorIdx: number, label: string, color: string): void => {
      if (!ship.alive) return;
      const flicker = ship.invTimer > 0 && Math.sin(now * 0.04) > 0;
      if (flicker) return;
      const sprite = this.sprites.playerShips[colorIdx % 4];
      ctx.save();
      ctx.shadowColor = color; ctx.shadowBlur = 14;
      ctx.drawImage(sprite, ship.x - 16, ship.y - 16, 32, 32);
      ctx.shadowBlur = 0;
      ctx.restore();
      // Label tag
      ctx.font = `bold ${Math.floor(L.h * 0.012)}px monospace`;
      ctx.fillStyle = color;
      ctx.textAlign = 'center';
      ctx.fillText(label, ship.x, ship.y - 22);
      ctx.textAlign = 'left';
    };
    drawShip(st.p1, 0, 'P1', '#4ade80');
    drawShip(st.p2, 2, 'P2', '#38bdf8');

    // ── Floating scores ────────────────────────────────────────────────────
    for (const f of st.floats) {
      ctx.globalAlpha = f.life / f.maxLife;
      ctx.font = `bold ${Math.floor(L.h * 0.018)}px monospace`;
      ctx.fillStyle = f.color;
      ctx.textAlign = 'center';
      ctx.fillText(f.text, f.x, f.y);
    }
    ctx.globalAlpha = 1;
    ctx.textAlign = 'left';

    if (st.shakeTimer > 0) ctx.restore();

    // ── HUD ───────────────────────────────────────────────────────────────
    const hudH = Math.floor(L.h * 0.068);
    ctx.fillStyle = 'rgba(0,0,0,0.85)';
    ctx.fillRect(0, 0, canvas.width, hudH);

    // P1 HP bar (left)
    this.drawVersusHPBar(20, 8, Math.floor(L.w * 0.3), hudH - 16, st.p1, '#4ade80', 'P1');
    // P2 HP bar (right)
    this.drawVersusHPBar(canvas.width - 20 - Math.floor(L.w * 0.3), 8, Math.floor(L.w * 0.3), hudH - 16, st.p2, '#38bdf8', 'P2');

    // Center: mode title + wave or timer
    ctx.textAlign = 'center';
    if (st.mode === 'ships') {
      ctx.font = `bold ${Math.floor(L.h * 0.016)}px monospace`;
      ctx.fillStyle = '#fbbf24';
      ctx.fillText(`ONDA ${st.wave}`, L.cx, Math.floor(hudH * 0.45));
      ctx.font = `${Math.floor(L.h * 0.011)}px monospace`;
      ctx.fillStyle = '#4b5563';
      ctx.fillText(`P1: ${st.p1.score}  |  P2: ${st.p2.score}`, L.cx, Math.floor(hudH * 0.8));
    } else {
      const timeLeft = Math.max(0, Math.ceil(st.roundTimer));
      const tColor = timeLeft <= 10 ? '#ef4444' : '#fbbf24';
      ctx.font = `bold ${Math.floor(L.h * 0.022)}px monospace`;
      ctx.fillStyle = tColor;
      ctx.fillText(timeLeft > 0 ? `${timeLeft}s` : 'FIM!', L.cx, Math.floor(hudH * 0.55));
    }
    ctx.textAlign = 'left';

    // ── Result overlay ────────────────────────────────────────────────────
    if (st.phase !== 'playing') {
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const resultColor = st.phase === 'p1_wins' ? '#4ade80' : st.phase === 'p2_wins' ? '#38bdf8' : '#fbbf24';
      const resultText  = st.phase === 'p1_wins' ? 'P1 VENCEU!' : st.phase === 'p2_wins' ? 'P2 VENCEU!' : 'EMPATE!';
      ctx.font = `bold ${Math.floor(L.h * 0.07)}px monospace`;
      ctx.fillStyle = resultColor;
      ctx.shadowColor = resultColor; ctx.shadowBlur = 30;
      ctx.textAlign = 'center';
      ctx.fillText(resultText, L.cx, L.cy - 20);
      ctx.shadowBlur = 0;
      ctx.font = `${Math.floor(L.h * 0.018)}px monospace`;
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('R = REVANCHE  |  ESC = MENU', L.cx, L.cy + 40);
      ctx.textAlign = 'left';
    }

    // ── Controls hint (bottom) ────────────────────────────────────────────
    if (st.phase === 'playing') {
      ctx.font = `${Math.floor(L.h * 0.009)}px monospace`;
      ctx.fillStyle = '#374151';
      ctx.fillText('P1: A/D mover' + (st.mode === 'pvp' ? ' | SPACE atirar' : ''), 10, canvas.height - 8);
      ctx.textAlign = 'right';
      ctx.fillText('P2: ←/→ mover' + (st.mode === 'pvp' ? ' | ENTER atirar' : ''), canvas.width - 10, canvas.height - 8);
      ctx.textAlign = 'left';
    }
  }

  private drawVersusHPBar(x: number, y: number, w: number, h: number, ship: { hp: number; maxHp: number; alive: boolean; kills: number }, color: string, label: string): void {
    const { ctx } = this;
    const pct = ship.alive ? ship.hp / ship.maxHp : 0;
    ctx.fillStyle = '#111827';
    ctx.fillRect(x, y, w, h);
    const barColor = pct > 0.5 ? color : pct > 0.25 ? '#f59e0b' : '#ef4444';
    ctx.fillStyle = barColor;
    ctx.fillRect(x + 1, y + 1, (w - 2) * pct, h - 2);
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.fillRect(x + 1, y + 1, (w - 2) * pct, Math.floor(h * 0.4));
    ctx.strokeStyle = color + '66';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, w, h);
    ctx.font = `bold ${Math.floor(h * 0.65)}px monospace`;
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText(`${label}  ${Math.ceil(ship.hp)} HP`, x + w / 2, y + h - 3);
    ctx.textAlign = 'left';
    ctx.font = `${Math.floor(h * 0.5)}px monospace`;
    ctx.fillStyle = color + 'aa';
    ctx.fillText(`kills: ${ship.kills}`, x + 4, y + h + Math.floor(h * 0.6));
  }

  private renderVersusShips(dt: number): void {
    this.renderVersus(dt);
  }

  private renderVersusPvp(dt: number): void {
    this.renderVersus(dt);
  }
}
