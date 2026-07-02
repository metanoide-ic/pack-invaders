/**
 * Input handler — drag-and-drop for backpack items + UI interactions.
 * Now with: keyboard movement during combat, sell zone, title screen input.
 * All click zones use responsive layout from Renderer.getLayout().
 */

import { GameManager } from '../core/GameManager';
import { Renderer } from './Renderer';
import { ItemDefinition } from '../core/ItemSystem';
import { AudioManager } from './AudioManager';
import { TwitchIntegration } from './TwitchIntegration';
import { togglePause, isPaused, setPaused } from './PauseState';
import { SaveManager } from '../core/SaveManager';
import { ALL_DIFFICULTIES, getUnlockedDifficulties } from '../data/difficulties';
import { ALL_MISSIONS, getMissionProgress, getClaimedMissions, claimMission } from '../data/missions';

export interface HeldItem {
  definition: ItemDefinition;
  /** Current rotation (0-3, 90° clockwise each) */
  rotation: number;
  /** Original instanceId if picked from grid (null if from shop) */
  fromInstanceId: string | null;
}

/** Rotate a grid shape 90° clockwise */
function rotateShape(shape: number[][]): number[][] {
  const rows = shape.length;
  const cols = shape[0].length;
  const rotated: number[][] = [];
  for (let c = 0; c < cols; c++) {
    const newRow: number[] = [];
    for (let r = rows - 1; r >= 0; r--) {
      newRow.push(shape[r][c]);
    }
    rotated.push(newRow);
  }
  return rotated;
}

/** Get shape after N rotations */
function getRotatedShape(base: number[][], rotation: number): number[][] {
  let shape = base;
  for (let i = 0; i < rotation % 4; i++) {
    shape = rotateShape(shape);
  }
  return shape;
}

export class InputHandler {
  /** Currently held item for drag-and-drop */
  heldItem: HeldItem | null = null;
  /** Cached shop items for the current shop phase */
  private shopItems: ItemDefinition[] = [];
  private shopItemsCached = false;

  /** Keyboard state for combat movement */
  private keysDown = new Set<string>();

  /** Twitch settings input state */
  twitchInputActive: boolean = false;
  twitchInputText: string = '';

  /** Which settings slider is being dragged: 'vol' | 'sfx' | null */
  private _sliderDrag: 'vol' | 'sfx' | null = null;

  constructor(
    private canvas: HTMLCanvasElement,
    private game: GameManager,
    private renderer: Renderer,
    private audio: AudioManager
  ) {
    canvas.addEventListener('click', (e) => this.onClick(e));
    canvas.addEventListener('contextmenu', (e) => this.onRightClick(e));
    canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
    canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
    canvas.addEventListener('mouseup', () => { this._sliderDrag = null; });
    window.addEventListener('mouseup', () => { this._sliderDrag = null; });
    canvas.addEventListener('wheel', (e) => this.onWheel(e));

    // Keyboard for combat movement + Twitch input
    window.addEventListener('keydown', (e) => {
      // Twitch text input mode
      if (this.twitchInputActive) {
        e.preventDefault();
        if (e.key === 'Enter') {
          if (this.twitchInputText.trim()) {
            this.game.twitch.connect(this.twitchInputText.trim());
          }
          this.twitchInputActive = false;
          return;
        }
        if (e.key === 'Escape') {
          this.twitchInputActive = false;
          return;
        }
        if (e.key === 'Backspace') {
          this.twitchInputText = this.twitchInputText.slice(0, -1);
          return;
        }
        if (e.key.length === 1) {
          this.twitchInputText += e.key;
        }
        return;
      }

      this.keysDown.add(e.key.toLowerCase());
      // SPLASH: any key goes to main menu
      if (this.game.phase === 'SPLASH') {
        this.game.phase = 'MAIN_MENU';
        this.audio.buttonClick();
        return;
      }
      // Main Menu: arrow keys for selection, Enter to confirm
      if (this.game.phase === 'MAIN_MENU') {
        const menuCount = 9;
        if (e.key === 'ArrowUp') {
          (this.renderer as any)._menuSelectedIdx = Math.max(0, ((this.renderer as any)._menuSelectedIdx ?? 0) - 1);
          this.audio.buttonClick();
        }
        if (e.key === 'ArrowDown') {
          (this.renderer as any)._menuSelectedIdx = Math.min(menuCount - 1, ((this.renderer as any)._menuSelectedIdx ?? 0) + 1);
          this.audio.buttonClick();
        }
        if (e.key === 'Enter') {
          const idx = (this.renderer as any)._menuSelectedIdx ?? 0;
          this.audio.buttonClick();
          switch (idx) {
            case 0: this.game.phase = 'SAVE_SELECT'; break;
            case 1: this.game.enterExtraModes(); break;
            case 2: this.game.openCodex(); break;
            case 3: this.game.phase = 'ACHIEVEMENTS'; break;
            case 4: this.game.phase = 'MISSIONS'; break;
            case 5: this.game.showControlsOverlay = true; break;
            case 6: this.game.openSettings('MAIN_MENU'); break;
            case 7: this.game.phase = 'CREDITS'; break;
            case 8: window.close(); break;
          }
        }
      }
      if (this.game.phase === 'EXTRA_MODES') {
        if (e.key === 'Escape') {
          this.game.phase = 'MAIN_MENU';
          this.audio.buttonClick();
        }
      }
      if (this.game.phase === 'CODEX') {
        if (e.key === 'ArrowUp') this.renderer.codexScroll = Math.max(0, this.renderer.codexScroll - 1);
        if (e.key === 'ArrowDown') this.renderer.codexScroll += 1;
        if (e.key === 'Escape') this.game.closeCodex();
      }
      // Title screen: arrow keys for character navigation, Enter to play
      if (this.game.phase === 'TITLE') {
        const chars = this.game.characters;
        const currentIdx = (this.renderer as any).selectedCharIdx ?? 0;
        if (e.key === 'ArrowLeft' && currentIdx > 0) {
          (this.renderer as any)._charSlideOffset = 1;
          (this.renderer as any).selectedCharIdx = currentIdx - 1;
          this.audio.buttonClick();
        }
        if (e.key === 'ArrowRight' && currentIdx < chars.length - 1) {
          (this.renderer as any)._charSlideOffset = -1;
          (this.renderer as any).selectedCharIdx = currentIdx + 1;
          this.audio.buttonClick();
        }
        if (e.key === 'Enter') {
          const char = chars[currentIdx];
          if (this.game.isCharacterUnlocked(char.id)) {
            this.audio.cardSelect();
            this.game.startFromTitle(char.id);
          } else {
            (this.renderer as any)._lockedShakeTimer = 0.4;
            this.audio.buttonClick();
          }
        }
        if (e.key === 'Escape') {
          this.game.phase = 'SAVE_SELECT';
          this.audio.buttonClick();
        }
      }
      // Escape handling for pause / settings / codex / twitch input / navigation
      if (e.key === 'Escape' && this.game.phase !== 'CODEX') {
        if (this.game.phase === 'SETTINGS') {
          this.game.closeSettings();
        } else if (this.game.phase === 'SAVE_SELECT') {
          this.game.phase = 'MAIN_MENU';
          this.audio.buttonClick();
        } else if (this.game.phase === 'CREDITS' || this.game.phase === 'ACHIEVEMENTS' || this.game.phase === 'MISSIONS' || this.game.phase === 'EXTRA_MODES') {
          this.game.phase = 'MAIN_MENU';
          this.audio.buttonClick();
        } else if (this.game.phase === 'GAME_OVER' || this.game.phase === 'VICTORY') {
          this.game.phase = 'MAIN_MENU';
          this.audio.buttonClick();
        } else if (this.game.phase === 'COMBAT' || this.game.phase === 'COOP' || this.game.phase === 'INVENTORY') {
          togglePause();
        } else if (this.game.phase === 'TITLE' && this.twitchInputActive) {
          this.twitchInputActive = false;
        }
      }
      // Enter = Quick Retry on Game Over
      if (e.key === 'Enter' && (this.game.phase === 'GAME_OVER' || this.game.phase === 'VICTORY')) {
        this.audio.cardSelect();
        const charId = this.game.characterId;
        const slot = this.game.currentSaveSlot;
        this.game.startFromSave(slot, charId);
      }
      // Quick shortcut: C to open/close codex from inventory or combat
      if (e.key.toLowerCase() === 'c' && !this.twitchInputActive) {
        if (this.game.phase === 'CODEX') {
          this.game.closeCodex();
        } else if (this.game.phase === 'INVENTORY' || this.game.phase === 'SHOP') {
          this.game.openCodex();
        }
      }
      // Quick shortcut: TAB to toggle between inventory sections (synergies info)
      if (e.key === 'Tab' && (this.game.phase === 'INVENTORY' || this.game.phase === 'SHOP')) {
        e.preventDefault();
        this.game.openCodex();
        // Go directly to Fusions tab
        (this.renderer as any).codexTab = 5;
        this.renderer.codexScroll = 0;
      }
      // Dismiss controls overlay on any key (but not the Enter that just opened it)
      if (this.game.showControlsOverlay && e.key !== 'Enter') {
        this.game.dismissControlsOverlay();
      }
    });
    window.addEventListener('keyup', (e) => {
      this.keysDown.delete(e.key.toLowerCase());
    });
  }

  /** Get current player movement direction: -1, 0, or 1 */
  getPlayerDir(): number {
    let dir = 0;
    const isCoopP2Active = this.game.phase === 'COOP' && this.game.combat.state.player2Active;
    // In COOP mode P1 uses only A/D; otherwise A/D and arrow keys work for P1
    if (isCoopP2Active) {
      if (this.keysDown.has('a')) dir -= 1;
      if (this.keysDown.has('d')) dir += 1;
    } else {
      if (this.keysDown.has('a') || this.keysDown.has('arrowleft')) dir -= 1;
      if (this.keysDown.has('d') || this.keysDown.has('arrowright')) dir += 1;
    }
    return dir;
  }

  /** Get P2 movement direction in COOP mode */
  getP2Dir(): number {
    if (!(this.game.phase === 'COOP' && this.game.combat.state.player2Active)) return 0;
    let dir = 0;
    if (this.keysDown.has('arrowleft')) dir -= 1;
    if (this.keysDown.has('arrowright')) dir += 1;
    return dir;
  }

  /** Check if P2 dash (ArrowUp) was pressed */
  private p2DashPressed = false;
  checkP2Dash(): boolean {
    const upDown = this.keysDown.has('arrowup');
    if (upDown && !this.p2DashPressed) {
      this.p2DashPressed = true;
      return true;
    }
    if (!upDown) this.p2DashPressed = false;
    return false;
  }

  /** Check if dash was pressed this frame */
  private dashPressed = false;
  checkDash(): boolean {
    const shiftDown = this.keysDown.has('shift') || this.keysDown.has(' ');
    if (shiftDown && !this.dashPressed) {
      this.dashPressed = true;
      return true;
    }
    if (!shiftDown) {
      this.dashPressed = false;
    }
    return false;
  }

  /** Check if a skill key was pressed (1, 2, 3). Returns slot index or -1. */
  private skillPressed: Set<string> = new Set();
  checkSkillInput(): number {
    const keys = ['1', '2', '3'];
    for (let i = 0; i < keys.length; i++) {
      if (this.keysDown.has(keys[i]) && !this.skillPressed.has(keys[i])) {
        this.skillPressed.add(keys[i]);
        return i;
      }
      if (!this.keysDown.has(keys[i])) {
        this.skillPressed.delete(keys[i]);
      }
    }
    return -1;
  }

  /** Check if a potion key was pressed (4, 5, 6). Returns slot index or -1. */
  checkPotionInput(): number {
    const keys = ['4', '5', '6'];
    for (let i = 0; i < keys.length; i++) {
      if (this.keysDown.has(keys[i]) && !this.skillPressed.has(keys[i])) {
        this.skillPressed.add(keys[i]);
        return i;
      }
      if (!this.keysDown.has(keys[i])) {
        this.skillPressed.delete(keys[i]);
      }
    }
    return -1;
  }

  private getCanvasPos(e: MouseEvent): { x: number; y: number } {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }

  /** Get the current rotated shape of the held item */
  getHeldShape(): number[][] | null {
    if (!this.heldItem) return null;
    return getRotatedShape(this.heldItem.definition.gridShape, this.heldItem.rotation);
  }

  private onClick(e: MouseEvent): void {
    const pos = this.getCanvasPos(e);

    // Controls overlay promises "click or any key to continue" — honor the click
    if (this.game.showControlsOverlay) {
      this.game.dismissControlsOverlay();
      this.audio.buttonClick();
      return;
    }

    // Dismiss Twitch input on click outside
    if (this.twitchInputActive && this.game.phase === 'TITLE') {
      const L = this.renderer.getLayout();
      const inputBoxY = Math.floor(L.h * 0.72);
      const inputBoxH = Math.floor(L.h * 0.08);
      if (pos.y < inputBoxY || pos.y > inputBoxY + inputBoxH) {
        this.twitchInputActive = false;
      }
    }

    switch (this.game.phase) {
      case 'SPLASH':
        this.game.phase = 'MAIN_MENU';
        this.audio.buttonClick();
        break;
      case 'MAIN_MENU':
        this.handleMainMenuClick(pos);
        break;
      case 'SAVE_SELECT':
        this.handleSaveSelectClick(pos);
        break;
      case 'CREDITS':
        this.handleCreditsClick(pos);
        break;
      case 'ACHIEVEMENTS':
        this.handleAchievementsClick(pos);
        break;
      case 'MISSIONS':
        this.handleMissionsClick(pos);
        break;
      case 'TITLE':
        this.handleTitleClick(pos);
        break;
      case 'INVENTORY':
        if (isPaused()) { this.handlePauseClick(pos); return; }
        this.handleInventoryClick(pos);
        break;
      case 'COMBAT':
        if (isPaused()) { this.handlePauseClick(pos); return; }
        break;
      case 'CARDS':
        this.handleCardClick(pos);
        break;
      case 'SHOP':
        this.handleShopClick(pos);
        break;
      case 'CODEX':
        this.handleCodexClick(pos);
        break;
      case 'SETTINGS':
        this.handleSettingsClick(pos);
        break;
      case 'EXTRA_MODES':
        this.handleExtraModesClick(pos);
        break;
      case 'TWITCH_VOTE':
        // Vote is handled by timer, no click needed
        break;
      case 'GAME_OVER':
      case 'VICTORY':
        this.handleGameOverClick(pos);
        break;
    }
  }

  private onRightClick(e: MouseEvent): void {
    e.preventDefault();
    if (this.heldItem) {
      this.heldItem.rotation = (this.heldItem.rotation + 1) % 4;
      this.audio.buttonClick();
    }
  }

  private onMouseDown(e: MouseEvent): void {
    if (this.game.phase !== 'SETTINGS') return;
    const pos = this.getCanvasPos(e);
    const L = this.renderer.getLayout();
    const panelW = Math.floor(L.w * 0.5);
    const sliderW = Math.floor(panelW * 0.6);
    const sliderX = L.cx - sliderW / 2;
    const startY = Math.floor(L.h * 0.14);
    const lineH = Math.floor(L.h * 0.075);
    const volBarH = Math.floor(L.h * 0.02);

    const volBarY = startY + Math.floor(lineH * 0.35);
    if (pos.x >= sliderX - 10 && pos.x <= sliderX + sliderW + 10 &&
        pos.y >= volBarY - 12 && pos.y <= volBarY + volBarH + 12) {
      this._sliderDrag = 'vol';
    }
    const sfxBarY = startY + lineH + Math.floor(lineH * 0.35);
    if (pos.x >= sliderX - 10 && pos.x <= sliderX + sliderW + 10 &&
        pos.y >= sfxBarY - 12 && pos.y <= sfxBarY + volBarH + 12) {
      this._sliderDrag = 'sfx';
    }
  }

  private onMouseMove(e: MouseEvent): void {
    const pos = this.getCanvasPos(e);
    this.renderer.mouseX = pos.x;
    this.renderer.mouseY = pos.y;

    // Drag settings sliders
    if (this._sliderDrag && this.game.phase === 'SETTINGS') {
      const L = this.renderer.getLayout();
      const panelW = Math.floor(L.w * 0.5);
      const sliderW = Math.floor(panelW * 0.6);
      const sliderX = L.cx - sliderW / 2;
      const vol = Math.max(0, Math.min(1, (pos.x - sliderX) / sliderW));
      if (this._sliderDrag === 'vol') {
        this.audio.setVolume(vol);
        localStorage.setItem('packinvaders_volume', String(Math.round(vol * 100)));
      } else {
        this.audio.setSfxVolume(vol);
        localStorage.setItem('packinvaders_sfx_volume', String(Math.round(vol * 100)));
      }
    }
  }

  private onWheel(e: WheelEvent): void {
    if (this.game.phase === 'CODEX') {
      e.preventDefault();
      if (e.deltaY > 0) {
        this.renderer.codexScroll += 1;
      } else {
        this.renderer.codexScroll = Math.max(0, this.renderer.codexScroll - 1);
      }
    }
  }

  // ─── Main Menu Phase ──────────────────────────────────────────────────────

  private handleMainMenuClick(pos: { x: number; y: number }): void {
    const L = this.renderer.getLayout();
    const panelW = Math.floor(L.w * 0.35);
    const titleX = Math.floor(panelW * 0.1);
    const btnW = Math.floor(panelW * 0.8);
    const btnH = Math.floor(L.h * 0.05);
    const btnX = titleX;
    const startY = Math.floor(L.h * 0.30);
    const gap = Math.floor(L.h * 0.065);

    const menuItems = 9;
    for (let i = 0; i < menuItems; i++) {
      const y = startY + i * gap;
      if (pos.x >= btnX && pos.x <= btnX + btnW && pos.y >= y && pos.y <= y + btnH) {
        this.audio.buttonClick();
        switch (i) {
          case 0: this.game.phase = 'SAVE_SELECT'; break;
          case 1: this.game.enterExtraModes(); break;
          case 2: this.game.openCodex(); break;
          case 3: this.game.phase = 'ACHIEVEMENTS'; break;
          case 4: this.game.phase = 'MISSIONS'; break;
          case 5: this.game.showControlsOverlay = true; break;
          case 6: this.game.openSettings('MAIN_MENU'); break;
          case 7: this.game.phase = 'CREDITS'; break;
          case 8: window.close(); break;
        }
        return;
      }
    }
  }

  // ─── Extra Modes Phase ────────────────────────────────────────────────────

  private handleExtraModesClick(pos: { x: number; y: number }): void {
    const L = this.renderer.getLayout();

    // Back button
    const backY = Math.floor(L.h * 0.88);
    const btnH = Math.floor(L.h * 0.03);
    if (pos.y >= backY - btnH && pos.y <= backY + btnH) {
      this.audio.buttonClick();
      this.game.phase = 'MAIN_MENU';
      return;
    }

    // Mode cards — same layout as renderExtraModes
    const cardW = Math.floor(L.w * 0.24);
    const cardH = Math.floor(L.h * 0.52);
    const totalW = cardW * 3 + Math.floor(L.w * 0.04) * 2;
    const startX = L.cx - Math.floor(totalW / 2);
    const cardY = Math.floor(L.h * 0.22);
    const gap = Math.floor(L.w * 0.04);
    const modes = ['COOP', 'VERSUS_SHIPS', 'VERSUS_PVP'] as const;

    for (let i = 0; i < modes.length; i++) {
      const cx = startX + i * (cardW + gap);
      if (pos.x >= cx && pos.x <= cx + cardW && pos.y >= cardY && pos.y <= cardY + cardH) {
        this.audio.buttonClick();
        if (modes[i] === 'VERSUS_SHIPS') {
          this.game.enterVersusShips();
        } else if (modes[i] === 'VERSUS_PVP') {
          this.game.enterVersusPvp();
        } else if (modes[i] === 'COOP') {
          this.game.enterCoop();
        } else {
          this.game.phase = modes[i];
        }
        return;
      }
    }
  }

  // ─── Save Select Phase ──────────────────────────────────────────────────────

  private handleSaveSelectClick(pos: { x: number; y: number }): void {
    const L = this.renderer.getLayout();

    // Back button
    const backBtnW = Math.floor(L.w * 0.12);
    const backBtnH = Math.floor(L.h * 0.05);
    const backBtnX = Math.floor(L.w * 0.03);
    const backBtnY = L.h - Math.floor(L.h * 0.08);
    if (pos.x >= backBtnX && pos.x <= backBtnX + backBtnW &&
        pos.y >= backBtnY && pos.y <= backBtnY + backBtnH) {
      this.audio.buttonClick();
      this.game.phase = 'MAIN_MENU';
      return;
    }

    // Save slot cards
    const slotW = Math.floor(L.w * 0.2);
    const slotH = Math.floor(L.h * 0.5);
    const slotGap = Math.floor(L.w * 0.02);
    const totalW = 4 * slotW + 3 * slotGap;
    const startX = (L.w - totalW) / 2;
    const slotY = Math.floor(L.h * 0.18);

    for (let i = 0; i < 4; i++) {
      const x = startX + i * (slotW + slotGap);

      // Check delete button FIRST (it's inside the slot area)
      const slot2 = SaveManager.getSlot(i);
      if (slot2.exists) {
        const delBtnH = Math.floor(L.h * 0.04);
        const delBtnY = slotY + slotH - delBtnH - 8;
        const delBtnW = Math.floor(slotW * 0.55);
        const delBtnX = x + (slotW - delBtnW) / 2;
        if (pos.x >= delBtnX && pos.x <= delBtnX + delBtnW &&
            pos.y >= delBtnY && pos.y <= delBtnY + delBtnH) {
          if ((this as any)[`_deleteConfirm_${i}`]) {
            SaveManager.deleteSlot(i);
            (this as any)[`_deleteConfirm_${i}`] = false;
            this.audio.buttonClick();
          } else {
            (this as any)[`_deleteConfirm_${i}`] = true;
            this.audio.buttonClick();
            setTimeout(() => { (this as any)[`_deleteConfirm_${i}`] = false; }, 3000);
          }
          return;
        }
      }

      // Then check the slot itself (load/new game)
      if (pos.x >= x && pos.x <= x + slotW && pos.y >= slotY && pos.y <= slotY + slotH) {
        const slot = SaveManager.getSlot(i);
        if (slot.exists) {
          this.audio.cardSelect();
          this.game.loadFromSave(i);
        } else {
          this.audio.cardSelect();
          this.game.currentSaveSlot = i;
          this.game.phase = 'TITLE';
        }
        return;
      }
    }
  }

  // ─── Credits Phase ──────────────────────────────────────────────────────────

  private handleCreditsClick(pos: { x: number; y: number }): void {
    const L = this.renderer.getLayout();
    // Back button — must match Renderer: L.h * 0.92
    const backBtnW = Math.floor(L.w * 0.12);
    const backBtnH = Math.floor(L.h * 0.05);
    const backBtnX = L.cx - backBtnW / 2;
    const backBtnY = Math.floor(L.h * 0.92);
    if (pos.x >= backBtnX && pos.x <= backBtnX + backBtnW &&
        pos.y >= backBtnY && pos.y <= backBtnY + backBtnH) {
      this.audio.buttonClick();
      this.game.phase = 'MAIN_MENU';
      return;
    }
  }

  // ─── Title Phase ──────────────────────────────────────────────────────────

  private handleTitleClick(pos: { x: number; y: number }): void {
    const L = this.renderer.getLayout();
    const chars = this.game.characters;
    const currentIdx = (this.renderer as any).selectedCharIdx ?? 0;

    // ◀ ESC (top-left)
    if (pos.x < Math.floor(L.w * 0.10) && pos.y < Math.floor(L.h * 0.06)) {
      this.audio.buttonClick();
      this.game.phase = 'SAVE_SELECT';
      return;
    }

    // Carousel geometry — must match Renderer constants
    const CARD_W  = Math.floor(L.w * 0.265);
    const CARD_H  = Math.floor(L.h * 0.638);
    const CARD_Y  = Math.floor(L.h * 0.048);
    const SPACING = Math.floor(L.w * 0.296);

    // Left arrow / left card area
    if (pos.y >= CARD_Y && pos.y <= CARD_Y + CARD_H && pos.x < L.cx - Math.floor(CARD_W * 0.5)) {
      if (currentIdx > 0) {
        (this.renderer as any).selectedCharIdx = currentIdx - 1;
        this.audio.buttonClick();
      }
      return;
    }

    // Right arrow / right card area
    if (pos.y >= CARD_Y && pos.y <= CARD_Y + CARD_H && pos.x > L.cx + Math.floor(CARD_W * 0.5)) {
      if (currentIdx < chars.length - 1) {
        (this.renderer as any).selectedCharIdx = currentIdx + 1;
        this.audio.buttonClick();
      }
      return;
    }

    // Play button (centered bottom)
    const pbW = Math.floor(L.w * 0.19);
    const pbH = Math.floor(L.h * 0.068);
    const pbX = Math.floor(L.cx - pbW / 2);
    const pbY = L.h - Math.floor(L.h * 0.054) - pbH;
    if (pos.x >= pbX && pos.x <= pbX + pbW && pos.y >= pbY && pos.y <= pbY + pbH) {
      const char = chars[currentIdx];
      if (this.game.isCharacterUnlocked(char.id)) {
        this.audio.cardSelect();
        this.game.startFromTitle(char.id);
      } else {
        (this.renderer as any)._lockedShakeTimer = 0.4;
        this.audio.buttonClick();
      }
      return;
    }

    // Difficulty cycling (bottom left)
    const diffBY = L.h - Math.floor(L.h * 0.03);
    const diffX  = Math.floor(L.w * 0.032);
    if (pos.x >= diffX && pos.x <= diffX + Math.floor(L.w * 0.20) &&
        pos.y >= diffBY - Math.floor(L.h * 0.065) && pos.y <= diffBY + Math.floor(L.h * 0.01)) {
      this.audio.buttonClick();
      const unlocked = getUnlockedDifficulties();
      const cIdx = ALL_DIFFICULTIES.findIndex(d => d.id === this.game.currentDifficulty);
      for (let offset = 1; offset <= ALL_DIFFICULTIES.length; offset++) {
        const nextIdx = (cIdx + offset) % ALL_DIFFICULTIES.length;
        if (unlocked.has(ALL_DIFFICULTIES[nextIdx].id)) {
          this.game.currentDifficulty = ALL_DIFFICULTIES[nextIdx].id;
          break;
        }
      }
      return;
    }
  }

  // ─── Codex Phase ────────────────────────────────────────────────────────

  private handleCodexClick(pos: { x: number; y: number }): void {
    const L = this.renderer.getLayout();
    const margin = Math.floor(L.w * 0.02);
    const listW = Math.floor(L.w * 0.42);

    // Back button
    const backBtnW = Math.floor(L.w * 0.1);
    const backBtnH = Math.floor(L.h * 0.05);
    const backBtnY = L.h - Math.floor(L.h * 0.08);
    if (pos.x >= margin && pos.x <= margin + backBtnW &&
        pos.y >= backBtnY && pos.y <= backBtnY + backBtnH) {
      this.audio.buttonClick();
      this.game.closeCodex();
      return;
    }

    // Tab clicks
    const tabs = 8;
    const tabW = Math.floor(L.w * 0.1);
    const tabGap = Math.floor(L.w * 0.005);
    const tabStartX = (L.w - tabs * (tabW + tabGap)) / 2;
    const tabY = Math.floor(L.h * 0.11);
    const tabH = Math.floor(L.h * 0.04);
    for (let i = 0; i < tabs; i++) {
      const tx = tabStartX + i * (tabW + tabGap);
      if (pos.x >= tx && pos.x <= tx + tabW && pos.y >= tabY && pos.y <= tabY + tabH) {
        this.audio.buttonClick();
        this.renderer.codexTab = i;
        this.renderer.codexScroll = 0;
        this.renderer.codexSelectedEntry = -1;
        return;
      }
    }

    // Entry clicks (select entry for detail view)
    const entryH = Math.floor(L.h * 0.1);
    const startY = Math.floor(L.h * 0.17);
    const visibleCount = Math.floor((L.h - startY - Math.floor(L.h * 0.08)) / entryH);
    if (pos.x >= margin && pos.x <= margin + listW) {
      for (let i = 0; i < visibleCount; i++) {
        const ey = startY + i * entryH;
        if (pos.y >= ey && pos.y <= ey + entryH) {
          const entryIdx = i + this.renderer.codexScroll;
          this.renderer.codexSelectedEntry = entryIdx;
          this.audio.buttonClick();
          return;
        }
      }
    }

    // Scroll by clicking bottom area
    if (pos.y >= L.h - Math.floor(L.h * 0.06)) {
      this.renderer.codexScroll += 1;
      return;
    }
    if (pos.y >= startY - Math.floor(L.h * 0.02) && pos.y <= startY) {
      this.renderer.codexScroll = Math.max(0, this.renderer.codexScroll - 1);
      return;
    }
  }

  /**
   * If a held item is dropped onto an identical item, upgrade that item (9 Kings style)
   * and consume the held one. Returns true if an upgrade happened.
   */
  private tryUpgradeHeld(gridCol: number, gridRow: number): boolean {
    if (!this.heldItem) return false;
    const target = this.game.backpack.getItemAt(gridCol, gridRow);
    if (!target) return false;
    // Only acts on identical items; for different items, let the caller do a swap.
    if (target.definition.id !== this.heldItem.definition.id) return false;
    if (this.game.backpack.tryUpgradeItem(target.instanceId, this.heldItem.definition.id)) {
      const lvl = this.game.backpack.getUpgradeLevel(target);
      this.audio.collectibleFound();
      this.renderer.showFusionNotif(`⬆ ${target.definition.name} +${lvl}`, '#fbbf24');
      this.heldItem = null;
      return true;
    }
    // Same item but already maxed — block the swap (which would destroy the upgrade),
    // keep the held duplicate so the player can place it elsewhere.
    this.audio.buttonClick();
    this.renderer.showFusionNotif(`${target.definition.name} no máximo (+${this.game.backpack.maxUpgrade})`, '#94a3b8');
    return true;
  }

  // ─── Inventory Phase ─────────────────────────────────────────────────────

  private handleInventoryClick(pos: { x: number; y: number }): void {
    const L = this.renderer.getLayout();

    // Check sell zone if holding an item
    if (this.heldItem) {
      if (pos.y > L.sellZoneY) {
        const sellPrice = this.game.sellItem(this.heldItem.definition);
        this.audio.buy();
        this.renderer.spawnGoldText(pos.x, pos.y - 20, sellPrice);
        this.heldItem = null;
        return;
      }

      const gridCol = Math.floor((pos.x - L.gridX) / L.cell);
      const gridRow = Math.floor((pos.y - L.gridY) / L.cell);

      if (gridCol >= 0 && gridRow >= 0 && gridCol < this.game.backpack.cols && gridRow < this.game.backpack.rows) {
        const shape = this.getHeldShape()!;
        const tempDef: ItemDefinition = { ...this.heldItem.definition, gridShape: shape };
        if (this.game.backpack.canPlace(tempDef, { col: gridCol, row: gridRow })) {
          this.game.backpack.placeItem(tempDef, { col: gridCol, row: gridRow });
          this.audio.buttonClick();
          this.heldItem = null;
          return;
        }
        // ITEM UPGRADE: dropping a duplicate onto an item levels it up
        if (this.tryUpgradeHeld(gridCol, gridRow)) return;
        // ITEM SWAP: try removing existing item and placing held
        const existingItem = this.game.backpack.getItemAt(gridCol, gridRow);
        if (existingItem) {
          const existingDef = existingItem.definition;
          const existingId = existingItem.instanceId;
          // Remove existing item temporarily
          this.game.backpack.removeItem(existingId);
          // Try to place held item
          if (this.game.backpack.canPlace(tempDef, { col: gridCol, row: gridRow })) {
            this.game.backpack.placeItem(tempDef, { col: gridCol, row: gridRow });
            // Swap: existing item becomes the new held item
            this.heldItem = {
              definition: existingDef,
              rotation: 0,
              fromInstanceId: null,
            };
            this.audio.buttonClick();
            return;
          }
          // Swap failed: put original back
          this.game.backpack.placeItem(existingDef, existingItem.position);
        }
      }
      return;
    }

    // Codex shortcut button (top-right)
    const codexBtnW = Math.floor(L.w * 0.1);
    const codexBtnH = Math.floor(L.h * 0.04);
    const codexBtnX = L.w - codexBtnW - Math.floor(L.w * 0.02);
    const codexBtnY = Math.floor(L.h * 0.02);
    if (pos.x >= codexBtnX && pos.x <= codexBtnX + codexBtnW &&
        pos.y >= codexBtnY && pos.y <= codexBtnY + codexBtnH) {
      this.audio.buttonClick();
      this.game.openCodex();
      return;
    }

    // Check "Start Combat" button (centered at bottom)
    const btnW = Math.floor(L.w * 0.2);
    const btnH = Math.floor(L.h * 0.065);
    const btnX = L.cx - btnW / 2;
    if (pos.x > btnX && pos.x < btnX + btnW && pos.y > L.btnY && pos.y < L.btnY + btnH) {
      this.audio.waveStart();
      this.game.startCombat();
      return;
    }

    // Aliencore toggle (below combat button)
    if (this.game.aliencoreUnlocked) {
      const acBtnW = Math.floor(L.w * 0.16);
      const acBtnH = Math.floor(L.h * 0.034);
      const acBtnX = L.cx - acBtnW / 2;
      const acBtnY = L.btnY + btnH + Math.floor(L.h * 0.012);
      if (pos.x >= acBtnX && pos.x <= acBtnX + acBtnW &&
          pos.y >= acBtnY && pos.y <= acBtnY + acBtnH) {
        this.game.aliencoreMode = !this.game.aliencoreMode;
        this.audio.buttonClick();
        return;
      }
    }

    // Check if clicking on a placed item to pick it up
    const gridCol = Math.floor((pos.x - L.gridX) / L.cell);
    const gridRow = Math.floor((pos.y - L.gridY) / L.cell);

    if (gridCol >= 0 && gridRow >= 0 && gridCol < this.game.backpack.cols && gridRow < this.game.backpack.rows) {
      const item = this.game.backpack.getItemAt(gridCol, gridRow);
      if (item) {
        this.heldItem = {
          definition: item.definition,
          rotation: 0,
          fromInstanceId: item.instanceId,
        };
        this.game.backpack.removeItem(item.instanceId);
        this.audio.buttonClick();
      }
    }
  }

  // ─── Card Phase ──────────────────────────────────────────────────────────

  private handleCardClick(pos: { x: number; y: number }): void {
    const L = this.renderer.getLayout();
    // Card geometry must match Renderer.renderCards exactly
    const cardCount = this.game.cardChoices.length;
    const cardW = Math.floor(L.w * 0.22);
    const cardH = Math.floor(L.h * 0.67);
    const gap = Math.floor(L.w * 0.035);
    const totalW = cardCount * cardW + (cardCount - 1) * gap;
    const startX = Math.floor((L.w - totalW) / 2);
    const cardTopY = Math.floor(L.h * 0.135);

    for (let i = 0; i < cardCount; i++) {
      const cx = startX + i * (cardW + gap);
      if (pos.x >= cx && pos.x <= cx + cardW && pos.y >= cardTopY && pos.y <= cardTopY + cardH) {
        this.audio.cardSelect();
        this.game.selectCard(i);
        this.shopItemsCached = false;
        return;
      }
    }

    // Skip button — must match Renderer bottomY = Math.floor(L.h * 0.855)
    const bottomY = Math.floor(L.h * 0.855);
    const skipBtnW = Math.floor(L.w * 0.14);
    const skipBtnH = Math.floor(L.h * 0.052);
    const skipBtnX = L.cx - skipBtnW / 2;
    if (pos.x > skipBtnX && pos.x < skipBtnX + skipBtnW &&
        pos.y > bottomY && pos.y < bottomY + skipBtnH) {
      this.audio.buttonClick();
      this.game.skipCards();
      this.shopItemsCached = false;
      return;
    }

    // Reroll button — rendered just below skip
    const rerollBtnW = Math.floor(L.w * 0.15);
    const rerollBtnH = Math.floor(L.h * 0.042);
    const rerollBtnX = L.cx - rerollBtnW / 2;
    const rerollBtnY = bottomY + skipBtnH + Math.floor(L.h * 0.012);
    if (pos.x >= rerollBtnX && pos.x <= rerollBtnX + rerollBtnW &&
        pos.y >= rerollBtnY && pos.y <= rerollBtnY + rerollBtnH) {
      if (this.game.gold >= this.game.getRerollCost()) {
        this.game.gold -= this.game.getRerollCost();
        this.game.cardChoices = this.game.generateCardChoices();
        this.audio.buy();
      }
      return;
    }
  }

  // ─── Shop Phase ──────────────────────────────────────────────────────────

  private handleShopClick(pos: { x: number; y: number }): void {
    const L = this.renderer.getLayout();

    // Cache shop items for the session
    if (!this.shopItemsCached) {
      this.shopItems = this.game.getShopItems();
      this.shopItemsCached = true;
    }

    // Sell zone in shop too
    if (this.heldItem && pos.y > L.sellZoneY) {
      const sellPrice = this.game.sellItem(this.heldItem.definition);
      this.audio.buy();
      this.renderer.spawnGoldText(pos.x, pos.y - 20, sellPrice);
      this.heldItem = null;
      return;
    }

    // "Continue" button — only if not holding an item
    const btnW = Math.floor(L.w * 0.17);
    const btnH = Math.floor(L.h * 0.065);
    const btnX = L.cx - btnW / 2;
    if (!this.heldItem && pos.x > btnX && pos.x < btnX + btnW &&
        pos.y > L.btnY && pos.y < L.btnY + btnH) {
      this.audio.buttonClick();
      this.game.exitShop();
      this.shopItemsCached = false;
      return;
    }

    // Reroll button
    const rerollBtnW = Math.floor(L.w * 0.14);
    const rerollBtnH = Math.floor(L.h * 0.045);
    const rerollBtnX = L.cx - rerollBtnW / 2;
    const rerollBtnY = L.btnY - Math.floor(L.h * 0.06);
    if (!this.heldItem && pos.x >= rerollBtnX && pos.x <= rerollBtnX + rerollBtnW &&
        pos.y >= rerollBtnY && pos.y <= rerollBtnY + rerollBtnH) {
      if (this.game.rerollShop()) {
        this.audio.buy();
        this.shopItemsCached = false;
        this.shopItems = this.game.getShopItems();
        this.shopItemsCached = true;
      }
      return;
    }

    // Potion buy buttons (below grid)
    const potShopY = L.gridY + L.gridH + Math.floor(L.h * 0.02) + Math.floor(L.h * 0.015);
    const potBtnW = Math.floor(L.w * 0.08);
    const potBtnH = Math.floor(L.h * 0.035);
    const potionIds = ['health_potion', 'shield_potion', 'rage_potion'];
    for (let pi = 0; pi < potionIds.length; pi++) {
      const pbx = L.gridX + pi * (potBtnW + 5);
      if (pos.x >= pbx && pos.x <= pbx + potBtnW && pos.y >= potShopY && pos.y <= potShopY + potBtnH) {
        if (this.game.buyPotion(potionIds[pi])) {
          this.audio.buy();
          if (this.game.currentVendor) {
            this.renderer.showVendorFeedback(this.game.currentVendor.buyPhrases[Math.floor(Math.random() * this.game.currentVendor.buyPhrases.length)]);
          }
        }
        return;
      }
    }

    // If holding an item, try to place it in the grid
    if (this.heldItem) {
      const gridCol = Math.floor((pos.x - L.gridX) / L.cell);
      const gridRow = Math.floor((pos.y - L.gridY) / L.cell);

      if (gridCol >= 0 && gridRow >= 0 && gridCol < this.game.backpack.cols && gridRow < this.game.backpack.rows) {
        const shape = this.getHeldShape()!;
        const tempDef: ItemDefinition = { ...this.heldItem.definition, gridShape: shape };
        if (this.game.backpack.canPlace(tempDef, { col: gridCol, row: gridRow })) {
          this.game.backpack.placeItem(tempDef, { col: gridCol, row: gridRow });
          this.audio.buttonClick();
          this.heldItem = null;
          return;
        }
        // ITEM UPGRADE: dropping a duplicate onto an item levels it up
        if (this.tryUpgradeHeld(gridCol, gridRow)) return;
        // ITEM SWAP in shop too
        const existingItem = this.game.backpack.getItemAt(gridCol, gridRow);
        if (existingItem) {
          const existingDef = existingItem.definition;
          const existingId = existingItem.instanceId;
          this.game.backpack.removeItem(existingId);
          if (this.game.backpack.canPlace(tempDef, { col: gridCol, row: gridRow })) {
            this.game.backpack.placeItem(tempDef, { col: gridCol, row: gridRow });
            this.heldItem = {
              definition: existingDef,
              rotation: 0,
              fromInstanceId: null,
            };
            this.audio.buttonClick();
            return;
          }
          this.game.backpack.placeItem(existingDef, existingItem.position);
        }
      }
      return;
    }

    // Check if clicking a shop item to buy
    const shopAreaW = L.w - L.panelX - Math.floor(L.w * 0.02);
    const itemW = Math.floor(shopAreaW / Math.max(this.shopItems.length, 1)) - 10;
    const itemCardW = Math.min(itemW, Math.floor(L.w * 0.13));
    const itemCardH = Math.floor(L.h * 0.45);
    const itemTopY = Math.floor(L.h * 0.14);

    for (let i = 0; i < this.shopItems.length; i++) {
      const x = L.panelX + i * (itemCardW + 10);
      const y = itemTopY;
      if (pos.x >= x && pos.x <= x + itemCardW && pos.y >= y && pos.y <= y + itemCardH) {
        const item = this.shopItems[i];
        if (this.game.buyItem(item)) {
          this.audio.buy();
          this.heldItem = {
            definition: item,
            rotation: 0,
            fromInstanceId: null,
          };
          this.shopItems.splice(i, 1);
          // Vendor buy feedback
          if (this.game.currentVendor) {
            const phrases = this.game.currentVendor.buyPhrases;
            this.renderer.showVendorFeedback(phrases[Math.floor(Math.random() * phrases.length)]);
          }
        } else {
          // Can't afford feedback
          if (this.game.currentVendor) {
            const phrases = this.game.currentVendor.brokePhrases;
            this.renderer.showVendorFeedback(phrases[Math.floor(Math.random() * phrases.length)]);
          }
        }
        return;
      }
    }
  }

  /** Get cached shop items for Renderer */
  getShopItems(): ItemDefinition[] {
    if (!this.shopItemsCached) {
      this.shopItems = this.game.getShopItems();
      this.shopItemsCached = true;
    }
    return this.shopItems;
  }

  // ─── Pause Menu ───────────────────────────────────────────────────────────

  private handlePauseClick(pos: { x: number; y: number }): void {
    const L = this.renderer.getLayout();
    const btnW = Math.floor(L.w * 0.2);
    const btnH = Math.floor(L.h * 0.055);
    const btnX = L.cx - btnW / 2;
    const gap = Math.floor(L.h * 0.07);

    // "CONTINUAR" button
    let btnY = L.cy;
    if (pos.x >= btnX && pos.x <= btnX + btnW && pos.y >= btnY && pos.y <= btnY + btnH) {
      this.audio.buttonClick();
      togglePause();
      return;
    }

    // "CONFIGURAÇÕES" button
    btnY += gap;
    if (pos.x >= btnX && pos.x <= btnX + btnW && pos.y >= btnY && pos.y <= btnY + btnH) {
      this.audio.buttonClick();
      setPaused(false);
      this.game.openSettings();
      return;
    }

    // "ARQUIVO ALIEN" button
    btnY += gap;
    if (pos.x >= btnX && pos.x <= btnX + btnW && pos.y >= btnY && pos.y <= btnY + btnH) {
      this.audio.buttonClick();
      setPaused(false);
      this.game.openCodex();
      return;
    }

    // "MENU PRINCIPAL" button
    btnY += gap;
    if (pos.x >= btnX && pos.x <= btnX + btnW && pos.y >= btnY && pos.y <= btnY + btnH) {
      this.audio.buttonClick();
      setPaused(false);
      this.game.phase = 'MAIN_MENU';
      return;
    }
  }

  // ─── Settings Phase ──────────────────────────────────────────────────────

  private handleSettingsClick(pos: { x: number; y: number }): void {
    const L = this.renderer.getLayout();
    const panelW = Math.floor(L.w * 0.5);
    const panelX = (L.w - panelW) / 2;
    const startY = Math.floor(L.h * 0.14);
    const lineH = Math.floor(L.h * 0.075);
    const sliderW = Math.floor(panelW * 0.6);
    const sliderX = L.cx - sliderW / 2;
    let cy = startY;

    // ─── Music Volume slider (row 0) ────────────────────────────────────
    const volBarY = cy + Math.floor(lineH * 0.35);
    const volBarH = Math.floor(L.h * 0.02);
    if (pos.x >= sliderX - 10 && pos.x <= sliderX + sliderW + 10 &&
        pos.y >= volBarY - 12 && pos.y <= volBarY + volBarH + 12) {
      const vol = (pos.x - sliderX) / sliderW;
      const clamped = Math.max(0, Math.min(1, vol));
      this.audio.setVolume(clamped);
      localStorage.setItem('packinvaders_volume', String(Math.round(clamped * 100)));
      return;
    }
    cy += lineH;

    // ─── SFX Volume slider (row 1) ──────────────────────────────────────
    const sfxBarY = cy + Math.floor(lineH * 0.35);
    if (pos.x >= sliderX - 10 && pos.x <= sliderX + sliderW + 10 &&
        pos.y >= sfxBarY - 12 && pos.y <= sfxBarY + volBarH + 12) {
      const vol = (pos.x - sliderX) / sliderW;
      const clamped = Math.max(0, Math.min(1, vol));
      localStorage.setItem('packinvaders_sfx_volume', String(Math.round(clamped * 100)));
      this.audio.setSfxVolume(clamped);
      this.audio.buttonClick();
      return;
    }
    cy += lineH;

    // ─── Screen Shake toggle (row 2) ────────────────────────────────────
    const shakeBtnW = Math.floor(sliderW * 0.3);
    const shakeBtnH = Math.floor(L.h * 0.035);
    const shakeBtnY = cy + Math.floor(lineH * 0.15);
    if (pos.x >= sliderX && pos.x <= sliderX + shakeBtnW &&
        pos.y >= shakeBtnY && pos.y <= shakeBtnY + shakeBtnH) {
      this.audio.buttonClick();
      const current = localStorage.getItem('packinvaders_shake') !== 'off';
      localStorage.setItem('packinvaders_shake', current ? 'off' : 'on');
      return;
    }
    cy += lineH;

    // ─── Particles toggle (row 3) ───────────────────────────────────────
    const partBtnY = cy + Math.floor(lineH * 0.15);
    if (pos.x >= sliderX && pos.x <= sliderX + shakeBtnW &&
        pos.y >= partBtnY && pos.y <= partBtnY + shakeBtnH) {
      this.audio.buttonClick();
      const current = localStorage.getItem('packinvaders_particles') !== 'off';
      localStorage.setItem('packinvaders_particles', current ? 'off' : 'on');
      return;
    }
    cy += lineH;

    // ─── CRT toggle (row 4) ─────────────────────────────────────────────
    const crtBtnY = cy + Math.floor(lineH * 0.15);
    if (pos.x >= sliderX && pos.x <= sliderX + shakeBtnW &&
        pos.y >= crtBtnY && pos.y <= crtBtnY + shakeBtnH) {
      this.audio.buttonClick();
      const current = localStorage.getItem('packinvaders_crt') !== 'off';
      localStorage.setItem('packinvaders_crt', current ? 'off' : 'on');
      return;
    }
    cy += lineH;

    // ─── Fullscreen toggle (row 5) ──────────────────────────────────────
    const fsBtnW = Math.floor(panelW * 0.4);
    const fsBtnH = Math.floor(L.h * 0.045);
    const fsBtnX = L.cx - fsBtnW / 2;
    if (pos.x >= fsBtnX && pos.x <= fsBtnX + fsBtnW &&
        pos.y >= cy && pos.y <= cy + fsBtnH) {
      this.audio.buttonClick();
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        document.documentElement.requestFullscreen();
      }
      return;
    }
    cy += lineH;

    // ─── Reset Progress (row 5) ─────────────────────────────────────────
    const resetBtnW = Math.floor(panelW * 0.45);
    const resetBtnH = Math.floor(L.h * 0.045);
    const resetBtnX = L.cx - resetBtnW / 2;
    if (pos.x >= resetBtnX && pos.x <= resetBtnX + resetBtnW &&
        pos.y >= cy && pos.y <= cy + resetBtnH) {
      this.audio.buttonClick();
      if ((this as any)._resetConfirm) {
        localStorage.clear();
        location.reload();
      } else {
        (this as any)._resetConfirm = true;
        setTimeout(() => { (this as any)._resetConfirm = false; }, 3000);
      }
      return;
    }
    cy += lineH;

    // ─── Back button (row 6) ────────────────────────────────────────────
    const backBtnW = Math.floor(panelW * 0.35);
    const backBtnH = Math.floor(L.h * 0.05);
    const backBtnX = L.cx - backBtnW / 2;
    if (pos.x >= backBtnX && pos.x <= backBtnX + backBtnW &&
        pos.y >= cy && pos.y <= cy + backBtnH) {
      this.audio.buttonClick();
      this.game.closeSettings();
      return;
    }
  }

  // ─── Achievements Phase ──────────────────────────────────────────────────

  private handleAchievementsClick(pos: { x: number; y: number }): void {
    const L = this.renderer.getLayout();
    // Back button
    const backBtnW = Math.floor(L.w * 0.12);
    const backBtnH = Math.floor(L.h * 0.05);
    const backBtnX = Math.floor(L.w * 0.03);
    const backBtnY = L.h - Math.floor(L.h * 0.08);
    if (pos.x >= backBtnX && pos.x <= backBtnX + backBtnW &&
        pos.y >= backBtnY && pos.y <= backBtnY + backBtnH) {
      this.audio.buttonClick();
      this.game.phase = 'MAIN_MENU';
      return;
    }
  }

  // ─── Missions Phase ───────────────────────────────────────────────────────

  private handleMissionsClick(pos: { x: number; y: number }): void {
    const L = this.renderer.getLayout();
    // Back button
    const backBtnW = Math.floor(L.w * 0.12);
    const backBtnH = Math.floor(L.h * 0.05);
    const backBtnX = Math.floor(L.w * 0.03);
    const backBtnY = L.h - Math.floor(L.h * 0.08);
    if (pos.x >= backBtnX && pos.x <= backBtnX + backBtnW &&
        pos.y >= backBtnY && pos.y <= backBtnY + backBtnH) {
      this.audio.buttonClick();
      this.game.phase = 'MAIN_MENU';
      return;
    }

    // Claim buttons — geometry must mirror Renderer.renderMissions
    const listX = Math.floor(L.w * 0.12);
    const listW = Math.floor(L.w * 0.76);
    const startY = Math.floor(L.h * 0.135);
    const rowH = Math.floor(L.h * 0.058);
    const gap = Math.floor(L.h * 0.004);
    const claimW = Math.floor(L.w * 0.13);
    const claimH = Math.floor(rowH * 0.7);
    const claimed = getClaimedMissions();
    for (let i = 0; i < ALL_MISSIONS.length; i++) {
      const m = ALL_MISSIONS[i];
      if (claimed.has(m.id)) continue;
      if (!getMissionProgress(m).complete) continue;
      const rowY = startY + i * (rowH + gap);
      const cx = listX + listW - claimW - 8;
      const cy = rowY + (rowH - claimH) / 2;
      if (pos.x >= cx && pos.x <= cx + claimW && pos.y >= cy && pos.y <= cy + claimH) {
        const reward = claimMission(m.id);
        if (reward > 0) {
          this.audio.collectibleFound();
          this.renderer.showFusionNotif(`+${reward}g inicial permanente!`, '#fbbf24');
        }
        return;
      }
    }
  }

  // ─── Game Over Phase ──────────────────────────────────────────────────────

  private handleGameOverClick(pos: { x: number; y: number }): void {
    const L = this.renderer.getLayout();
    const btnW = Math.floor(L.w * 0.2);
    const btnH = Math.floor(L.h * 0.067);
    const btnX = L.cx - btnW / 2;

    // "Tentar Novamente" button — must match Renderer: btn1Y = L.h * 0.84
    const retryY = Math.floor(L.h * 0.84);
    if (pos.x >= btnX && pos.x <= btnX + btnW &&
        pos.y >= retryY && pos.y <= retryY + btnH) {
      this.audio.buttonClick();
      // Restart with same character and save slot
      const charId = this.game.characterId;
      const slot = this.game.currentSaveSlot;
      this.game.startFromSave(slot, charId);
      return;
    }

    // "Menu Principal" button — must match Renderer: btn2Y = L.h * 0.918
    const menuY = Math.floor(L.h * 0.918);
    if (pos.x >= btnX && pos.x <= btnX + btnW &&
        pos.y >= menuY && pos.y <= menuY + btnH) {
      this.audio.buttonClick();
      this.game.phase = 'MAIN_MENU';
      return;
    }
  }

  // ── Versus mode input helpers ────────────────────────────────────────────

  getVersusP1Dir(): number {
    let dir = 0;
    if (this.keysDown.has('a')) dir -= 1;
    if (this.keysDown.has('d')) dir += 1;
    return dir;
  }

  getVersusP2Dir(): number {
    let dir = 0;
    if (this.keysDown.has('arrowleft')) dir -= 1;
    if (this.keysDown.has('arrowright')) dir += 1;
    return dir;
  }

  private p1FirePressed = false;
  checkVersusP1Fire(): boolean {
    const down = this.keysDown.has(' ') || this.keysDown.has('z');
    if (down && !this.p1FirePressed) { this.p1FirePressed = true; return true; }
    if (!down) this.p1FirePressed = false;
    return false;
  }

  private p2FirePressed = false;
  checkVersusP2Fire(): boolean {
    const down = this.keysDown.has('enter') || this.keysDown.has('m');
    if (down && !this.p2FirePressed) { this.p2FirePressed = true; return true; }
    if (!down) this.p2FirePressed = false;
    return false;
  }

  private versusRPressed = false;
  checkVersusReset(): boolean {
    const down = this.keysDown.has('r');
    if (down && !this.versusRPressed) { this.versusRPressed = true; return true; }
    if (!down) this.versusRPressed = false;
    return false;
  }
}
