import { PlayerInput } from '../types';

const DEAD_ZONE = 0.2;

function emptyInput(): PlayerInput {
  return {
    moveX: 0, moveZ: 0,
    jump: false, jumpPressed: false,
    interact: false, interactPressed: false,
    detach: false, detachPressed: false,
  };
}

/**
 * Handles up to 4 local co-op players:
 *  - Player 0 always uses the keyboard (WASD / Space / E / Q)
 *  - Players 0-3 additionally read from connected Gamepads (index order),
 *    so plugging in a controller for player 0 works too, and up to 3 more
 *    friends can join with controllers 1-3.
 */
export class InputManager {
  private keys = new Set<string>();
  private prevKeys = new Set<string>();
  private states: PlayerInput[] = [emptyInput(), emptyInput(), emptyInput(), emptyInput()];
  private prevButtons: boolean[][] = [[], [], [], []];
  public connectedPads = 0;

  constructor() {
    window.addEventListener('keydown', (e) => this.keys.add(e.code));
    window.addEventListener('keyup', (e) => this.keys.delete(e.code));
    window.addEventListener('gamepadconnected', () => this.refreshPadCount());
    window.addEventListener('gamepaddisconnected', () => this.refreshPadCount());
  }

  private refreshPadCount() {
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    this.connectedPads = Array.from(pads).filter(Boolean).length;
  }

  update() {
    // Player 0: keyboard
    const kb = emptyInput();
    const left = this.keys.has('KeyA') || this.keys.has('ArrowLeft');
    const right = this.keys.has('KeyD') || this.keys.has('ArrowRight');
    const up = this.keys.has('KeyW') || this.keys.has('ArrowUp');
    const down = this.keys.has('KeyS') || this.keys.has('ArrowDown');
    kb.moveX = (right ? 1 : 0) - (left ? 1 : 0);
    kb.moveZ = (up ? 1 : 0) - (down ? 1 : 0);
    kb.jump = this.keys.has('Space');
    kb.interact = this.keys.has('KeyE');
    kb.detach = this.keys.has('KeyQ');
    kb.jumpPressed = kb.jump && !this.prevKeys.has('Space');
    kb.interactPressed = kb.interact && !this.prevKeys.has('KeyE');
    kb.detachPressed = kb.detach && !this.prevKeys.has('KeyQ');
    this.states[0] = kb;
    this.prevKeys = new Set(this.keys);

    // Players 0-3: gamepads override/merge with keyboard for slot 0
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    this.connectedPads = 0;
    for (let i = 0; i < 4; i++) {
      const pad = pads[i];
      if (!pad) continue;
      this.connectedPads++;
      const axX = Math.abs(pad.axes[0]) > DEAD_ZONE ? pad.axes[0] : 0;
      const axY = Math.abs(pad.axes[1]) > DEAD_ZONE ? pad.axes[1] : 0;
      const btn = (n: number) => !!pad.buttons[n]?.pressed;
      const state = i === 0 ? this.states[0] : emptyInput();
      state.moveX = state.moveX !== 0 ? state.moveX : axX;
      state.moveZ = state.moveZ !== 0 ? state.moveZ : -axY;
      const jump = btn(0); // A
      const interact = btn(2); // X
      const detach = btn(3); // Y
      const prev = this.prevButtons[i] || [];
      state.jump = state.jump || jump;
      state.interact = state.interact || interact;
      state.detach = state.detach || detach;
      state.jumpPressed = state.jumpPressed || (jump && !prev[0]);
      state.interactPressed = state.interactPressed || (interact && !prev[2]);
      state.detachPressed = state.detachPressed || (detach && !prev[3]);
      this.prevButtons[i] = pad.buttons.map((b) => b.pressed);
      this.states[i] = state;
    }
  }

  getPlayerCount(): number {
    return Math.max(1, this.connectedPads);
  }

  getInput(playerIndex: number): PlayerInput {
    return this.states[playerIndex] || emptyInput();
  }
}
