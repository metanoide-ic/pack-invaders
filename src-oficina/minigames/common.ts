import type { ShapeDef } from '../render/shapes';

export const CANVAS_W = 640;
export const CANVAS_H = 400;
export const ITEM_CX = CANVAS_W / 2;
export const ITEM_CY = CANVAS_H / 2 - 10;

export function makeLayer(): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = CANVAS_W;
  c.height = CANVAS_H;
  return c;
}

/** White silhouette on transparent background, used both to render and as a raster clip mask. */
export function buildMask(shape: ShapeDef): HTMLCanvasElement {
  const layer = makeLayer();
  const ctx = layer.getContext('2d')!;
  shape.drawSilhouette(ctx, ITEM_CX, ITEM_CY, '#ffffff');
  return layer;
}

export function clipToMask(ctx: CanvasRenderingContext2D, mask: HTMLCanvasElement) {
  ctx.globalCompositeOperation = 'destination-in';
  ctx.drawImage(mask, 0, 0);
  ctx.globalCompositeOperation = 'source-over';
}

export function maskAlphaTotal(mask: HTMLCanvasElement): number {
  const ctx = mask.getContext('2d')!;
  const data = ctx.getImageData(0, 0, mask.width, mask.height).data;
  let total = 0;
  for (let i = 3; i < data.length; i += 4) total += data[i];
  return total || 1;
}

export function layerAlphaTotal(layer: HTMLCanvasElement): number {
  const ctx = layer.getContext('2d')!;
  const data = ctx.getImageData(0, 0, layer.width, layer.height).data;
  let total = 0;
  for (let i = 3; i < data.length; i += 4) total += data[i];
  return total;
}

export function drawWorkbench(ctx: CanvasRenderingContext2D) {
  const g = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
  g.addColorStop(0, '#dcc7a0');
  g.addColorStop(1, '#c9ac7c');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.strokeStyle = 'rgba(90,60,30,0.15)';
  ctx.lineWidth = 1;
  for (let x = 20; x < CANVAS_W; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, CANVAS_H);
    ctx.stroke();
  }
}

export interface PointerPos {
  x: number;
  y: number;
}

/** Returns a live handler you can (de)register for pointerdown/move/up, giving canvas-local coords. */
export function trackPointer(
  canvas: HTMLCanvasElement,
  onMove: (pos: PointerPos, pressed: boolean) => void
) {
  let pressed = false;
  const toLocal = (e: PointerEvent): PointerPos => {
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;
    return { x, y };
  };
  const down = (e: PointerEvent) => {
    pressed = true;
    canvas.setPointerCapture(e.pointerId);
    onMove(toLocal(e), true);
  };
  const move = (e: PointerEvent) => {
    if (pressed) onMove(toLocal(e), true);
  };
  const up = () => {
    pressed = false;
  };
  canvas.addEventListener('pointerdown', down);
  canvas.addEventListener('pointermove', move);
  canvas.addEventListener('pointerup', up);
  canvas.addEventListener('pointerleave', up);
  return () => {
    canvas.removeEventListener('pointerdown', down);
    canvas.removeEventListener('pointermove', move);
    canvas.removeEventListener('pointerup', up);
    canvas.removeEventListener('pointerleave', up);
  };
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
    /* audio not available, ignore */
  }
}
