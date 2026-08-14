/**
 * On-screen virtual joystick + action buttons for touch devices, feeding
 * player 0's input the same way a gamepad would. Only builds its DOM and
 * activates if the device actually looks touch-primary — desktop players
 * never see it.
 */
export class TouchControls {
  readonly active: boolean;
  moveX = 0;
  moveZ = 0;
  jump = false;
  interact = false;
  detach = false;
  private pauseRequested = false;

  /** Edge-triggered: true at most once per tap, consumed by the caller. */
  consumePause(): boolean {
    if (!this.pauseRequested) return false;
    this.pauseRequested = false;
    return true;
  }

  private root: HTMLDivElement | null = null;
  private nub: HTMLDivElement | null = null;
  private base: HTMLDivElement | null = null;
  private joystickTouchId: number | null = null;
  private baseCenter = { x: 0, y: 0 };
  private readonly RADIUS = 44;

  constructor() {
    this.active = window.matchMedia?.('(pointer: coarse)').matches || 'ontouchstart' in window;
    if (this.active) {
      document.body.classList.add('touch-ui-active'); // lets index.html reflow the HUD out of the way
      this.build();
    }
  }

  show() {
    if (this.root) this.root.style.display = 'block';
  }
  hide() {
    if (this.root) this.root.style.display = 'none';
  }

  private build() {
    const style = document.createElement('style');
    style.textContent = `
      #touch-controls { position: fixed; inset: 0; z-index: 15; pointer-events: none; display: none; }
      #touch-joystick-base {
        position: absolute; left: 26px; bottom: 26px; width: 110px; height: 110px; border-radius: 50%;
        background: rgba(255,255,255,0.12); border: 2px solid rgba(255,255,255,0.25); pointer-events: auto; touch-action: none;
      }
      #touch-joystick-nub {
        position: absolute; left: 50%; top: 50%; width: 48px; height: 48px; border-radius: 50%;
        background: rgba(255,255,255,0.4); transform: translate(-50%, -50%); pointer-events: none;
      }
      .touch-btn {
        position: absolute; bottom: 30px; width: 68px; height: 68px; border-radius: 50%;
        background: rgba(255,138,61,0.55); border: 2px solid rgba(255,255,255,0.35); color: #fff;
        font-size: 1.5rem; display: flex; align-items: center; justify-content: center;
        pointer-events: auto; touch-action: none; user-select: none;
      }
      .touch-btn:active, .touch-btn.pressed { background: rgba(255,138,61,0.9); }
      #touch-btn-jump { right: 26px; }
      #touch-btn-interact { right: 108px; bottom: 78px; }
      #touch-btn-detach { right: 108px; bottom: 8px; width: 52px; height: 52px; font-size: 1.1rem; }
      #touch-btn-pause {
        position: absolute; top: 14px; right: 14px; width: 40px; height: 40px; bottom: auto;
        border-radius: 10px; font-size: 1.1rem;
      }
    `;
    document.head.appendChild(style);

    const root = document.createElement('div');
    root.id = 'touch-controls';
    root.innerHTML = `
      <div id="touch-joystick-base"><div id="touch-joystick-nub"></div></div>
      <div class="touch-btn" id="touch-btn-jump">⤴</div>
      <div class="touch-btn" id="touch-btn-interact">E</div>
      <div class="touch-btn" id="touch-btn-detach">✂</div>
      <div class="touch-btn" id="touch-btn-pause">⏸</div>
    `;
    document.body.appendChild(root);
    this.root = root;
    this.base = root.querySelector('#touch-joystick-base');
    this.nub = root.querySelector('#touch-joystick-nub');

    this.wireJoystick();
    this.wireButton('#touch-btn-jump', (v) => (this.jump = v));
    this.wireButton('#touch-btn-interact', (v) => (this.interact = v));
    this.wireButton('#touch-btn-detach', (v) => (this.detach = v));
    const pauseBtn = root.querySelector('#touch-btn-pause') as HTMLElement;
    pauseBtn.addEventListener(
      'touchstart',
      (e: TouchEvent) => {
        e.preventDefault();
        this.pauseRequested = true;
      },
      { passive: false }
    );
  }

  private wireButton(selector: string, setter: (v: boolean) => void) {
    const el = this.root!.querySelector(selector) as HTMLElement;
    const on = (e: TouchEvent) => {
      e.preventDefault();
      setter(true);
      el.classList.add('pressed');
    };
    const off = (e: TouchEvent) => {
      e.preventDefault();
      setter(false);
      el.classList.remove('pressed');
    };
    el.addEventListener('touchstart', on, { passive: false });
    el.addEventListener('touchend', off, { passive: false });
    el.addEventListener('touchcancel', off, { passive: false });
  }

  private wireJoystick() {
    const base = this.base!;
    const updateFromTouch = (touch: Touch) => {
      const dx = touch.clientX - this.baseCenter.x;
      const dy = touch.clientY - this.baseCenter.y;
      const dist = Math.min(this.RADIUS, Math.hypot(dx, dy));
      const angle = Math.atan2(dy, dx);
      const nx = Math.cos(angle) * dist;
      const ny = Math.sin(angle) * dist;
      this.nub!.style.transform = `translate(${nx - 24}px, ${ny - 24}px)`;
      this.moveX = nx / this.RADIUS;
      this.moveZ = -ny / this.RADIUS; // screen-down is negative forward
    };
    const reset = () => {
      this.joystickTouchId = null;
      this.moveX = 0;
      this.moveZ = 0;
      this.nub!.style.transform = 'translate(-50%, -50%)';
    };

    base.addEventListener(
      'touchstart',
      (e: TouchEvent) => {
        e.preventDefault();
        const touch = e.changedTouches[0];
        this.joystickTouchId = touch.identifier;
        const rect = base.getBoundingClientRect();
        this.baseCenter = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
        updateFromTouch(touch);
      },
      { passive: false }
    );
    base.addEventListener(
      'touchmove',
      (e: TouchEvent) => {
        e.preventDefault();
        for (const touch of Array.from(e.changedTouches)) {
          if (touch.identifier === this.joystickTouchId) updateFromTouch(touch);
        }
      },
      { passive: false }
    );
    const endHandler = (e: TouchEvent) => {
      for (const touch of Array.from(e.changedTouches)) {
        if (touch.identifier === this.joystickTouchId) {
          e.preventDefault();
          reset();
        }
      }
    };
    base.addEventListener('touchend', endHandler, { passive: false });
    base.addEventListener('touchcancel', endHandler, { passive: false });
  }
}
