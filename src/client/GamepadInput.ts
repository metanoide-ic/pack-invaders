/**
 * GAMEPAD INPUT — PlayStation, Xbox, Switch Pro and arcade sticks.
 *
 * Browsers expose all of them through the Gamepad API "standard" mapping,
 * so one button table covers everything:
 *   0=Sul (A/✕/B)  1=Leste (B/○/A)  2=Oeste (X/⬜/Y)  3=Norte (Y/△/X)
 *   4=LB/L1/L  5=RB/R1/R  6=LT/L2/ZL  7=RT/R2/ZR
 *   8=Select  9=Start  12-15=D-pad  16=Home
 *
 * In combat the pad feeds the existing keyboard paths (move/dash/skills/
 * potions). Everywhere else the left stick drives a virtual cursor and the
 * south button clicks — implemented by synthesizing REAL mouse events on the
 * canvas, so menus, the backpack drag-and-drop and the shop work unchanged.
 */

export type PadBrand = 'xbox' | 'playstation' | 'switch' | 'generic';

const DEADZONE = 0.28;
const CURSOR_SPEED = 950; // px/s at full stick deflection

export class GamepadInput {
  connected = false;
  brand: PadBrand = 'generic';
  /** Virtual cursor position in canvas (1280x720) space */
  cursorX = 640;
  cursorY = 400;
  /** True while the pad is the most recent input source (draws the cursor) */
  cursorVisible = false;

  private padIndex = -1;
  private prev: boolean[] = [];
  private cur: boolean[] = [];
  private axes: number[] = [0, 0, 0, 0];
  private southHeld = false;
  private justConnected = false;

  constructor(private canvas: HTMLCanvasElement) {
    window.addEventListener('gamepadconnected', (e: GamepadEvent) => {
      this.padIndex = e.gamepad.index;
      this.brand = detectBrand(e.gamepad.id);
      this.connected = true;
      this.justConnected = true;
    });
    window.addEventListener('gamepaddisconnected', (e: GamepadEvent) => {
      if (e.gamepad.index === this.padIndex) {
        this.connected = false;
        this.padIndex = -1;
        this.cursorVisible = false;
      }
    });
  }

  /** True exactly once, on the frame after a pad connects (for a toast) */
  consumeJustConnected(): boolean {
    const j = this.justConnected;
    this.justConnected = false;
    return j;
  }

  /** Poll pad state; `inCombat` switches between direct-control and cursor
   * mode. Call once per frame before reading any input. */
  poll(dt: number, inCombat: boolean): void {
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    let pad: Gamepad | null = null;
    if (this.padIndex >= 0 && pads[this.padIndex]) {
      pad = pads[this.padIndex];
    } else {
      // Some browsers only populate getGamepads() after polling
      for (const p of pads) {
        if (p) { pad = p; this.padIndex = p.index; this.brand = detectBrand(p.id); this.connected = true; break; }
      }
    }
    if (!pad) return;

    this.prev = this.cur;
    this.cur = pad.buttons.map(b => b.pressed);
    this.axes = [...pad.axes];

    // Any pad activity claims the cursor (mouse movement releases it)
    const anyButton = this.cur.some(Boolean);
    const anyStick = Math.abs(this.axis(0)) > 0 || Math.abs(this.axis(1)) > 0;
    if (anyButton || anyStick) this.cursorVisible = true;

    if (!inCombat && this.cursorVisible) {
      this.updateCursor(dt);
    }

    // Start = pause/back everywhere (routes through the keyboard handler)
    if (this.justPressed(9)) {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    }
    // East button = back/cancel in menus
    if (!inCombat && this.justPressed(1)) {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    }
  }

  /** Dead-zoned axis read */
  axis(i: number): number {
    const v = this.axes[i] ?? 0;
    return Math.abs(v) < DEADZONE ? 0 : v;
  }

  isDown(i: number): boolean { return !!this.cur[i]; }
  justPressed(i: number): boolean { return !!this.cur[i] && !this.prev[i]; }

  /** Horizontal movement for combat: left stick + d-pad */
  moveDir(): number {
    let dir = this.axis(0);
    if (this.isDown(14)) dir = -1;
    if (this.isDown(15)) dir = 1;
    return Math.max(-1, Math.min(1, dir));
  }

  /** Dash: south face button or either bumper */
  dashPressed(): boolean {
    return this.justPressed(0) || this.justPressed(4) || this.justPressed(5);
  }

  /** Skill slot fired this frame: west=0, north=1, east=2 (or -1) */
  skillPressed(): number {
    if (this.justPressed(2)) return 0;
    if (this.justPressed(3)) return 1;
    if (this.justPressed(1)) return 2;
    return -1;
  }

  /** Potion slot fired this frame: LT=0, RT=1, d-pad up=2 (or -1) */
  potionPressed(): number {
    if (this.justPressed(6)) return 0;
    if (this.justPressed(7)) return 1;
    if (this.justPressed(12)) return 2;
    return -1;
  }

  /** Move the virtual cursor and synthesize mousemove/click on the canvas */
  private updateCursor(dt: number): void {
    const dx = this.axis(0) + (this.isDown(15) ? 1 : 0) - (this.isDown(14) ? 1 : 0);
    const dy = this.axis(1) + (this.isDown(13) ? 1 : 0) - (this.isDown(12) ? 1 : 0);
    if (dx !== 0 || dy !== 0) {
      this.cursorX = Math.max(0, Math.min(this.canvas.width, this.cursorX + dx * CURSOR_SPEED * dt));
      this.cursorY = Math.max(0, Math.min(this.canvas.height, this.cursorY + dy * CURSOR_SPEED * dt));
      this.dispatchMouse('mousemove');
    }
    // South button = click (press/release so drag-and-drop works too)
    if (this.justPressed(0)) {
      this.dispatchMouse('mousemove');
      this.dispatchMouse('mousedown');
      this.southHeld = true;
    } else if (this.southHeld && !this.isDown(0)) {
      this.dispatchMouse('mouseup');
      this.dispatchMouse('click');
      this.southHeld = false;
    }
  }

  /** Canvas (1280x720) coords → client coords → real MouseEvent, inverting
   * the object-fit:contain letterbox math used by InputHandler */
  private dispatchMouse(type: string): void {
    const rect = this.canvas.getBoundingClientRect();
    const scale = Math.min(rect.width / this.canvas.width, rect.height / this.canvas.height);
    const offX = (rect.width - this.canvas.width * scale) / 2;
    const offY = (rect.height - this.canvas.height * scale) / 2;
    const clientX = rect.left + offX + this.cursorX * scale;
    const clientY = rect.top + offY + this.cursorY * scale;
    this.canvas.dispatchEvent(new MouseEvent(type, { clientX, clientY, bubbles: true, button: 0 }));
  }

  /** Combat control hint matching the connected controller's labels */
  hudHint(): string {
    switch (this.brand) {
      case 'playstation': return 'Analógico | ✕ dash | ⬜ △ ○ skills | L2/R2/↑ poções';
      case 'switch':      return 'Analógico | B dash | Y X A skills | ZL/ZR/↑ poções';
      case 'xbox':        return 'Analógico | A dash | X Y B skills | LT/RT/↑ poções';
      default:            return 'Alavanca | B1 dash | B3 B4 B2 skills | B7/B8/↑ poções';
    }
  }
}

function detectBrand(id: string): PadBrand {
  const s = id.toLowerCase();
  if (/dualshock|dualsense|sony|playstation|054c/.test(s)) return 'playstation';
  if (/switch|joy-con|pro controller|nintendo|057e/.test(s)) return 'switch';
  if (/xbox|xinput|microsoft|045e/.test(s)) return 'xbox';
  return 'generic';
}
