export interface Client3DPointer {
  x: number;
  y: number;
}

export function trackPointer3D(
  el: HTMLElement,
  onMove: (pos: Client3DPointer, pressed: boolean, button: number) => void
) {
  let pressed = false;
  const down = (e: PointerEvent) => {
    if (e.button !== 0) return;
    pressed = true;
    onMove({ x: e.clientX, y: e.clientY }, true, e.button);
  };
  const move = (e: PointerEvent) => {
    if (pressed) onMove({ x: e.clientX, y: e.clientY }, true, e.button);
  };
  const up = () => {
    pressed = false;
  };
  el.addEventListener('pointerdown', down);
  window.addEventListener('pointermove', move);
  window.addEventListener('pointerup', up);
  return () => {
    el.removeEventListener('pointerdown', down);
    window.removeEventListener('pointermove', move);
    window.removeEventListener('pointerup', up);
  };
}

export function trackClick3D(el: HTMLElement, onClick: (pos: Client3DPointer) => void) {
  const handler = (e: PointerEvent) => {
    if (e.button !== 0) return;
    onClick({ x: e.clientX, y: e.clientY });
  };
  el.addEventListener('pointerdown', handler);
  return () => el.removeEventListener('pointerdown', handler);
}

export function layerAlpha(canvas: HTMLCanvasElement): number {
  const ctx = canvas.getContext('2d')!;
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  let total = 0;
  for (let i = 3; i < data.length; i += 4) total += data[i];
  return total;
}

export function tinyBeep(freq = 440, duration = 0.12, type: OscillatorType = 'sine', vol = 0.05) {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.value = vol;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    osc.stop(ctx.currentTime + duration + 0.02);
    osc.onended = () => ctx.close();
  } catch {
    /* audio not available */
  }
}
