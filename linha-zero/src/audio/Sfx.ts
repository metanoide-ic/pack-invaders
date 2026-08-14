/**
 * Tiny procedural sound effects via WebAudio — no asset files needed.
 * Everything is a short envelope over an oscillator, tuned by ear for a
 * bouncy, toy-like feel that matches the visual style.
 */
export class Sfx {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  muted = false;

  private ensure() {
    if (this.ctx) return this.ctx;
    const Ctx = window.AudioContext || (window as any).webkitAudioContext;
    if (!Ctx) return null;
    this.ctx = new Ctx();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.35;
    this.master.connect(this.ctx.destination);
    return this.ctx;
  }

  /** Call from a user gesture (start button) — browsers block audio before that. */
  unlock() {
    const ctx = this.ensure();
    if (ctx && ctx.state === 'suspended') ctx.resume();
  }

  private tone(freq: number, duration: number, opts: { type?: OscillatorType; gain?: number; slideTo?: number } = {}) {
    if (this.muted) return;
    const ctx = this.ensure();
    if (!ctx || !this.master) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = opts.type ?? 'square';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    if (opts.slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(1, opts.slideTo), ctx.currentTime + duration);
    gain.gain.setValueAtTime(opts.gain ?? 0.5, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(this.master);
    osc.start();
    osc.stop(ctx.currentTime + duration + 0.02);
  }

  jump() { this.tone(420, 0.12, { type: 'square', slideTo: 700, gain: 0.25 }); }
  land() { this.tone(180, 0.08, { type: 'sine', slideTo: 90, gain: 0.3 }); }
  pickup() {
    this.tone(660, 0.09, { type: 'square', gain: 0.3 });
    setTimeout(() => this.tone(880, 0.12, { type: 'square', gain: 0.28 }), 60);
  }
  rescue() {
    [520, 660, 880].forEach((f, i) => setTimeout(() => this.tone(f, 0.16, { type: 'triangle', gain: 0.3 }), i * 80));
  }
  board() { this.tone(300, 0.1, { type: 'square', slideTo: 500, gain: 0.22 }); }
  danger() {
    this.tone(180, 0.22, { type: 'sawtooth', gain: 0.28 });
    setTimeout(() => this.tone(140, 0.22, { type: 'sawtooth', gain: 0.26 }), 150);
  }
  detach() { this.tone(120, 0.3, { type: 'square', slideTo: 40, gain: 0.35 }); }
  build() {
    [440, 550, 660, 880].forEach((f, i) => setTimeout(() => this.tone(f, 0.1, { type: 'square', gain: 0.25 }), i * 55));
  }
  miss() { this.tone(300, 0.4, { type: 'sawtooth', slideTo: 60, gain: 0.3 }); }
  gameOver() {
    [440, 380, 300, 220].forEach((f, i) => setTimeout(() => this.tone(f, 0.35, { type: 'sawtooth', gain: 0.3 }), i * 180));
  }
  storm() {
    this.tone(90, 0.9, { type: 'sawtooth', slideTo: 45, gain: 0.22 });
    setTimeout(() => this.tone(70, 0.6, { type: 'sawtooth', slideTo: 30, gain: 0.18 }), 200);
  }
  record() {
    [660, 880, 1100].forEach((f, i) => setTimeout(() => this.tone(f, 0.2, { type: 'triangle', gain: 0.32 }), i * 100));
  }
}
