/**
 * AudioManager — Procedural Web Audio API sound effects.
 * No external files needed; all sounds are synthesized.
 */

export class AudioManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private muted = false;
  private ambientOsc: OscillatorNode | null = null;
  private ambientGain: GainNode | null = null;
  private ambientPlaying = false;

  private getCtx(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext();
      this.masterGain = this.ctx.createGain();
      this.sfxGain = this.ctx.createGain();
      this.musicGain = this.ctx.createGain();
      // Load saved volumes
      const savedVol = parseInt(localStorage.getItem('packinvaders_volume') || '40', 10) / 100;
      const savedSfx = parseInt(localStorage.getItem('packinvaders_sfx_volume') || '60', 10) / 100;
      this.masterGain.gain.value = 1;
      this.musicGain.gain.value = Math.max(0, Math.min(1, savedVol));
      this.sfxGain.gain.value = Math.max(0, Math.min(1, savedSfx));
      this.sfxGain.connect(this.masterGain);
      this.musicGain.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  private getMaster(): GainNode {
    this.getCtx();
    return this.sfxGain!;
  }

  private getMusicGain(): GainNode {
    this.getCtx();
    return this.musicGain!;
  }

  toggleMute(): void {
    this.muted = !this.muted;
    if (this.masterGain) {
      this.masterGain.gain.value = this.muted ? 0 : 1;
    }
  }

  /** Set music volume (0-1) */
  setVolume(vol: number): void {
    this.getCtx();
    if (this.musicGain) {
      this.musicGain.gain.value = Math.max(0, Math.min(1, vol));
    }
    this.muted = vol === 0;
  }

  /** Set SFX volume (0-1) */
  setSfxVolume(vol: number): void {
    this.getCtx();
    if (this.sfxGain) {
      this.sfxGain.gain.value = Math.max(0, Math.min(1, vol));
    }
  }

  /** Get current volume (0-1) */
  getVolume(): number {
    if (!this.musicGain) return 0.4;
    return this.musicGain.gain.value;
  }

  // ─── Sound Effects ──────────────────────────────────────────────────────

  shoot(): void {
    const ctx = this.getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    osc.connect(gain);
    gain.connect(this.getMaster());
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.08);
  }

  hit(): void {
    const ctx = this.getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(this.getMaster());
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.1);
  }

  kill(): void {
    const ctx = this.getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.05);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(this.getMaster());
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
  }

  buy(): void {
    const ctx = this.getCtx();
    const t = ctx.currentTime;
    // Two quick high tones (ching)
    for (let i = 0; i < 2; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1800 + i * 400, t + i * 0.06);
      gain.gain.setValueAtTime(0.15, t + i * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.06 + 0.1);
      osc.connect(gain);
      gain.connect(this.getMaster());
      osc.start(t + i * 0.06);
      osc.stop(t + i * 0.06 + 0.1);
    }
  }

  cardSelect(): void {
    const ctx = this.getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(this.getMaster());
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
  }

  lavaWarning(): void {
    const ctx = this.getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(50, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(40, ctx.currentTime + 0.5);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.5);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    osc.connect(gain);
    gain.connect(this.getMaster());
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.6);
  }

  gameOver(): void {
    const ctx = this.getCtx();
    const t = ctx.currentTime;
    const notes = [400, 350, 280, 200];
    for (let i = 0; i < notes.length; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(notes[i], t + i * 0.2);
      gain.gain.setValueAtTime(0.15, t + i * 0.2);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.2 + 0.25);
      osc.connect(gain);
      gain.connect(this.getMaster());
      osc.start(t + i * 0.2);
      osc.stop(t + i * 0.2 + 0.25);
    }
  }

  victory(): void {
    const ctx = this.getCtx();
    const t = ctx.currentTime;
    const notes = [523, 659, 784, 1047]; // C5 E5 G5 C6
    for (let i = 0; i < notes.length; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(notes[i], t + i * 0.12);
      gain.gain.setValueAtTime(0.18, t + i * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.12 + 0.3);
      osc.connect(gain);
      gain.connect(this.getMaster());
      osc.start(t + i * 0.12);
      osc.stop(t + i * 0.12 + 0.3);
    }
  }

  buttonClick(): void {
    const ctx = this.getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1000, ctx.currentTime);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
    osc.connect(gain);
    gain.connect(this.getMaster());
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.04);
  }

  waveStart(): void {
    const ctx = this.getCtx();
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, t);
    osc.frequency.exponentialRampToValueAtTime(600, t + 0.3);
    gain.gain.setValueAtTime(0.15, t);
    gain.gain.linearRampToValueAtTime(0.15, t + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
    osc.connect(gain);
    gain.connect(this.getMaster());
    osc.start(t);
    osc.stop(t + 0.4);
  }

  dash(): void {
    const ctx = this.getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.06);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    osc.connect(gain);
    gain.connect(this.getMaster());
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.08);
  }

  comboMilestone(): void {
    const ctx = this.getCtx();
    const t = ctx.currentTime;
    const notes = [800, 1000, 1200];
    for (let i = 0; i < notes.length; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(notes[i], t + i * 0.04);
      gain.gain.setValueAtTime(0.1, t + i * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.04 + 0.08);
      osc.connect(gain);
      gain.connect(this.getMaster());
      osc.start(t + i * 0.04);
      osc.stop(t + i * 0.04 + 0.08);
    }
  }

  waveComplete(): void {
    const ctx = this.getCtx();
    const t = ctx.currentTime;
    const notes = [523, 659, 784, 1047, 1319]; // C5 E5 G5 C6 E6
    for (let i = 0; i < notes.length; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(notes[i], t + i * 0.08);
      gain.gain.setValueAtTime(0.12, t + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.08 + 0.2);
      osc.connect(gain);
      gain.connect(this.getMaster());
      osc.start(t + i * 0.08);
      osc.stop(t + i * 0.08 + 0.2);
    }
  }

  collectibleFound(): void {
    const ctx = this.getCtx();
    const t = ctx.currentTime;
    // Magical chime
    const notes = [880, 1108, 1320, 1760];
    for (let i = 0; i < notes.length; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(notes[i], t + i * 0.1);
      gain.gain.setValueAtTime(0.08, t + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.1 + 0.3);
      osc.connect(gain);
      gain.connect(this.getMaster());
      osc.start(t + i * 0.1);
      osc.stop(t + i * 0.1 + 0.3);
    }
  }

  /** Start low ambient drone for atmosphere */
  startAmbient(): void {
    if (this.ambientPlaying) return;
    const ctx = this.getCtx();
    this.ambientOsc = ctx.createOscillator();
    this.ambientGain = ctx.createGain();
    this.ambientOsc.type = 'sine';
    this.ambientOsc.frequency.setValueAtTime(55, ctx.currentTime); // Low A
    this.ambientGain.gain.setValueAtTime(0, ctx.currentTime);
    this.ambientGain.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 2);
    this.ambientOsc.connect(this.ambientGain);
    this.ambientGain.connect(this.getMusicGain());
    this.ambientOsc.start();
    this.ambientPlaying = true;
  }

  /** Stop ambient drone */
  stopAmbient(): void {
    if (!this.ambientPlaying || !this.ambientOsc || !this.ambientGain) return;
    const ctx = this.getCtx();
    this.ambientGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
    this.ambientOsc.stop(ctx.currentTime + 0.6);
    this.ambientOsc = null;
    this.ambientGain = null;
    this.ambientPlaying = false;
  }

  /** Increase ambient intensity during combat */
  setCombatAmbient(active: boolean): void {
    if (!this.ambientGain) return;
    const ctx = this.getCtx();
    const target = active ? 0.06 : 0.03;
    this.ambientGain.gain.linearRampToValueAtTime(target, ctx.currentTime + 0.5);
    if (this.ambientOsc) {
      this.ambientOsc.frequency.linearRampToValueAtTime(active ? 65 : 55, ctx.currentTime + 0.5);
    }
  }
}
