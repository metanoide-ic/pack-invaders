/**
 * AudioManager — Procedural Web Audio API sound effects + chiptune music.
 * No external files needed; all sounds are synthesized.
 */

type MusicMode = 'calm' | 'combat' | 'boss';

/**
 * Music data: 4-bar loops in A minor, one chord table per mode.
 * bass = root frequency per bar; chord = arpeggio tones per bar.
 */
const MUSIC: Record<MusicMode, {
  bpm: number;
  bass: number[];
  chords: number[][];
}> = {
  // Menu/shop: Am — F — C — G, gentle
  calm: {
    bpm: 84,
    bass: [55.00, 43.65, 65.41, 49.00],
    chords: [
      [220.00, 261.63, 329.63],
      [174.61, 220.00, 261.63],
      [261.63, 329.63, 392.00],
      [196.00, 246.94, 293.66],
    ],
  },
  // Combat: Am — Am — F — G, driving
  combat: {
    bpm: 112,
    bass: [55.00, 55.00, 43.65, 49.00],
    chords: [
      [220.00, 261.63, 329.63],
      [220.00, 261.63, 329.63],
      [174.61, 220.00, 261.63],
      [196.00, 246.94, 293.66],
    ],
  },
  // Boss: Am — B♭ — Am — E, phrygian menace
  boss: {
    bpm: 122,
    bass: [55.00, 58.27, 55.00, 41.20],
    chords: [
      [220.00, 261.63, 329.63],
      [233.08, 293.66, 349.23],
      [220.00, 261.63, 329.63],
      [164.81, 207.65, 246.94],
    ],
  },
};

export class AudioManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private muted = false;
  // ── Music sequencer state ──
  private musicInterval: number | null = null;
  private musicMode: MusicMode = 'calm';
  private nextStepTime = 0;
  private musicStep = 0;
  private noiseBuffer: AudioBuffer | null = null;

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

  /** SFX bus — routes through the SFX volume slider */
  private getSfx(): GainNode {
    this.getCtx();
    return this.sfxGain!;
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
    gain.connect(this.getSfx());
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
    gain.connect(this.getSfx());
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
    gain.connect(this.getSfx());
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
      gain.connect(this.getSfx());
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
    gain.connect(this.getSfx());
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
    gain.connect(this.getSfx());
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
      gain.connect(this.getSfx());
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
      gain.connect(this.getSfx());
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
    gain.connect(this.getSfx());
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
    gain.connect(this.getSfx());
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
    gain.connect(this.getSfx());
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
      gain.connect(this.getSfx());
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
      gain.connect(this.getSfx());
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
      gain.connect(this.getSfx());
      osc.start(t + i * 0.1);
      osc.stop(t + i * 0.1 + 0.3);
    }
  }

  /** Boss attack alarm — short two-tone siren for beam/dive telegraphs */
  bossAlarm(): void {
    const ctx = this.getCtx();
    const t = ctx.currentTime;
    for (let i = 0; i < 2; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(i === 0 ? 660 : 440, t + i * 0.14);
      gain.gain.setValueAtTime(0.09, t + i * 0.14);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.14 + 0.13);
      osc.connect(gain);
      gain.connect(this.getSfx());
      osc.start(t + i * 0.14);
      osc.stop(t + i * 0.14 + 0.13);
    }
  }

  /** Monstrous creature roar for the final boss's entrance — layered detuned
   * saws sweeping down into sub-bass, with a breathy noise burst on top. */
  monsterRoar(): void {
    const ctx = this.getCtx();
    const t = ctx.currentTime;
    const dur = 1.6;
    // Three detuned saw layers falling from a scream into a growl
    for (const [start, detune] of [[150, 0], [163, 8], [141, -11]] as const) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filt = ctx.createBiquadFilter();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(start, t);
      osc.frequency.exponentialRampToValueAtTime(38, t + dur);
      osc.detune.value = detune;
      filt.type = 'lowpass';
      filt.frequency.setValueAtTime(1200, t);
      filt.frequency.exponentialRampToValueAtTime(220, t + dur);
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.16, t + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
      osc.connect(filt); filt.connect(gain); gain.connect(this.getSfx());
      osc.start(t); osc.stop(t + dur);
    }
    // Sub-bass body
    const sub = ctx.createOscillator();
    const subGain = ctx.createGain();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(55, t);
    sub.frequency.exponentialRampToValueAtTime(26, t + dur);
    subGain.gain.setValueAtTime(0.0001, t);
    subGain.gain.exponentialRampToValueAtTime(0.22, t + 0.1);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    sub.connect(subGain); subGain.connect(this.getSfx());
    sub.start(t); sub.stop(t + dur);
    // Breathy rasp: filtered noise burst
    const len = Math.floor(ctx.sampleRate * 0.9);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const noise = ctx.createBufferSource();
    noise.buffer = buf;
    const nFilt = ctx.createBiquadFilter();
    nFilt.type = 'bandpass';
    nFilt.frequency.setValueAtTime(700, t);
    nFilt.frequency.exponentialRampToValueAtTime(180, t + 0.9);
    nFilt.Q.value = 0.8;
    const nGain = ctx.createGain();
    nGain.gain.setValueAtTime(0.14, t);
    nGain.gain.exponentialRampToValueAtTime(0.001, t + 0.9);
    noise.connect(nFilt); nFilt.connect(nGain); nGain.connect(this.getSfx());
    noise.start(t);
  }

  // ─── Music sequencer ──────────────────────────────────────────────────────
  // 4-bar chiptune loop (16 steps/bar): bass, arpeggio lead, kick and hats.
  // A 25ms lookahead scheduler keeps timing sample-accurate ("Tale of Two
  // Clocks" pattern) while the mode can switch chord tables at any moment.

  /** Start the music loop (idempotent) */
  startMusic(mode: MusicMode): void {
    this.musicMode = mode;
    if (this.musicInterval !== null) return;
    const ctx = this.getCtx();
    this.nextStepTime = ctx.currentTime + 0.06;
    this.musicStep = 0;
    this.musicInterval = window.setInterval(() => this.scheduleMusic(), 25);
  }

  /** Switch mood — takes effect on the very next step */
  setMusicMode(mode: MusicMode): void {
    if (this.musicInterval === null) { this.startMusic(mode); return; }
    this.musicMode = mode;
  }

  stopMusic(): void {
    if (this.musicInterval !== null) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }

  private scheduleMusic(): void {
    const ctx = this.getCtx();
    if (ctx.state === 'suspended') return; // wait for the first user gesture
    // Recover if the tab slept: don't machine-gun a backlog of steps
    if (this.nextStepTime < ctx.currentTime - 0.25) {
      this.nextStepTime = ctx.currentTime + 0.05;
    }
    while (this.nextStepTime < ctx.currentTime + 0.12) {
      this.scheduleStep(this.musicStep, this.nextStepTime);
      const stepDur = 60 / MUSIC[this.musicMode].bpm / 4;
      this.nextStepTime += stepDur;
      this.musicStep = (this.musicStep + 1) % 64; // 4 bars × 16 steps
    }
  }

  private scheduleStep(step: number, t: number): void {
    const mode = this.musicMode;
    const data = MUSIC[mode];
    const bar = Math.floor(step / 16);
    const s = step % 16;
    const stepDur = 60 / data.bpm / 4;

    // Bass: driving 8ths in combat/boss, roots on the beat when calm
    const bassSteps = mode === 'calm' ? [0, 8] : [0, 2, 4, 7, 8, 10, 12, 14];
    if (bassSteps.includes(s)) {
      const freq = s === 7 ? data.bass[bar] * 1.5 : data.bass[bar]; // fifth pickup
      this.playNote(freq, t, stepDur * (mode === 'calm' ? 3.5 : 1.6), 'triangle', 0.11);
    }

    // Arpeggio lead: 8ths in combat, 16ths at the boss, sparse when calm
    const chord = data.chords[bar];
    const arpOn = mode === 'boss' ? true : mode === 'combat' ? s % 2 === 1 : (s === 0 || s === 6 || s === 12);
    if (arpOn) {
      const tone = chord[(Math.floor(step / (mode === 'calm' ? 6 : 1))) % 3];
      const oct = mode === 'boss' && s % 8 >= 4 ? 2 : 1; // boss arp climbs an octave
      this.playNote(tone * oct, t, stepDur * 0.9, 'square', mode === 'calm' ? 0.035 : 0.03);
    }

    // Drums (combat/boss only)
    if (mode !== 'calm') {
      if (s % 4 === 0) this.playKick(t);
      if (s % 4 === 2) this.playHat(t);
      if (mode === 'boss' && (s === 7 || s === 15)) this.playHat(t); // extra push
    }
  }

  private playNote(freq: number, t: number, dur: number, type: OscillatorType, vol: number): void {
    const ctx = this.getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(gain);
    gain.connect(this.getMusicGain());
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  private playKick(t: number): void {
    const ctx = this.getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.1);
    gain.gain.setValueAtTime(0.22, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    osc.connect(gain);
    gain.connect(this.getMusicGain());
    osc.start(t);
    osc.stop(t + 0.13);
  }

  private playHat(t: number): void {
    const ctx = this.getCtx();
    if (!this.noiseBuffer) {
      const len = Math.floor(ctx.sampleRate * 0.05);
      this.noiseBuffer = ctx.createBuffer(1, len, ctx.sampleRate);
      const ch = this.noiseBuffer.getChannelData(0);
      for (let i = 0; i < len; i++) ch[i] = Math.random() * 2 - 1;
    }
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 6500;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.05, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
    src.connect(hp);
    hp.connect(gain);
    gain.connect(this.getMusicGain());
    src.start(t);
    src.stop(t + 0.05);
  }
}
