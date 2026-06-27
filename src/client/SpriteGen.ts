/**
 * SpriteGen — Procedural pixel art sprite generator.
 * All game visuals generated on offscreen canvases at startup.
 */

export interface SpriteSheet {
  playerShips: HTMLCanvasElement[];
  enemies: Map<string, HTMLCanvasElement>;
  items: Map<string, HTMLCanvasElement>;
  projectiles: Map<string, HTMLCanvasElement>;
  ui: Map<string, HTMLCanvasElement>;
  background: HTMLCanvasElement;
  characters: Map<string, HTMLCanvasElement>;
}

// ─── Pixel Drawing Utilities ─────────────────────────────────────────────────

function createCanvas(w: number, h: number): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}

function px(ctx: CanvasRenderingContext2D, x: number, y: number, color: string): void {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, 1, 1);
}

function rect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string): void {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

/** Draw a mirrored sprite (left half is mirrored to right) */
function drawMirrored(
  ctx: CanvasRenderingContext2D, size: number,
  drawLeft: (px: (x: number, y: number, c: string) => void) => void
): void {
  const half = Math.floor(size / 2);
  const pixels: { x: number; y: number; c: string }[] = [];
  drawLeft((x, y, c) => { pixels.push({ x, y, c }); });
  for (const p of pixels) {
    ctx.fillStyle = p.c;
    ctx.fillRect(p.x, p.y, 1, 1);
    ctx.fillRect(size - 1 - p.x, p.y, 1, 1);
  }
}

// ─── Color Helpers ───────────────────────────────────────────────────────────

function shade(hex: string, factor: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const f = Math.max(0, Math.min(2, factor));
  const nr = Math.min(255, Math.floor(r * f));
  const ng = Math.min(255, Math.floor(g * f));
  const nb = Math.min(255, Math.floor(b * f));
  return `#${nr.toString(16).padStart(2,'0')}${ng.toString(16).padStart(2,'0')}${nb.toString(16).padStart(2,'0')}`;
}

const ELEMENT_COLORS: Record<string, { dark: string; mid: string; light: string }> = {
  fire:     { dark: '#8b2500', mid: '#e64a19', light: '#ffab40' },
  water:    { dark: '#0d47a1', mid: '#2196f3', light: '#80d8ff' },
  grass:    { dark: '#1b5e20', mid: '#4caf50', light: '#a5d6a7' },
  dark:     { dark: '#1a0033', mid: '#7b1fa2', light: '#ce93d8' },
  electric: { dark: '#795548', mid: '#ffc107', light: '#ffff00' },
  normal:   { dark: '#424242', mid: '#9e9e9e', light: '#e0e0e0' },
  ice:      { dark: '#006064', mid: '#00bcd4', light: '#e0f7fa' },
  poison:   { dark: '#1b3a1b', mid: '#388e3c', light: '#76ff03' },
};

// ─── Player Ship Generation ──────────────────────────────────────────────────

function generatePlayerShip(baseColor: string): HTMLCanvasElement {
  const c = createCanvas(32, 32);
  const ctx = c.getContext('2d')!;
  const dark = shade(baseColor, 0.5);
  const mid = baseColor;
  const light = shade(baseColor, 1.4);

  // Body (angular ship shape)
  // Nose
  rect(ctx, 15, 2, 2, 4, light);
  rect(ctx, 14, 6, 4, 2, mid);
  // Upper fuselage
  rect(ctx, 13, 8, 6, 4, mid);
  rect(ctx, 12, 12, 8, 4, mid);
  // Main body
  rect(ctx, 10, 16, 12, 6, mid);
  rect(ctx, 8, 22, 16, 4, mid);
  // Wings
  rect(ctx, 4, 20, 4, 6, dark);
  rect(ctx, 24, 20, 4, 6, dark);
  rect(ctx, 2, 22, 3, 4, dark);
  rect(ctx, 27, 22, 3, 4, dark);
  // Wing tips
  px(ctx, 1, 24, light);
  px(ctx, 30, 24, light);
  // Cockpit
  rect(ctx, 14, 10, 4, 4, light);
  px(ctx, 15, 11, '#ffffff');
  px(ctx, 16, 11, '#ffffff');
  // Thruster glow
  rect(ctx, 13, 26, 2, 3, '#ff6600');
  rect(ctx, 17, 26, 2, 3, '#ff6600');
  rect(ctx, 14, 28, 1, 2, '#ffcc00');
  rect(ctx, 18, 28, 1, 2, '#ffcc00');
  // Detail lines
  rect(ctx, 11, 18, 1, 4, light);
  rect(ctx, 20, 18, 1, 4, light);

  return c;
}

// ─── Enemy Generation ────────────────────────────────────────────────────────

function generateSmallEnemy(variant: number, element: string): HTMLCanvasElement {
  const c = createCanvas(16, 16);
  const ctx = c.getContext('2d')!;
  const col = ELEMENT_COLORS[element] || ELEMENT_COLORS.normal;

  switch (variant) {
    case 0: // Scout - triangular fast
      rect(ctx, 7, 1, 2, 2, col.light);
      rect(ctx, 5, 3, 6, 3, col.mid);
      rect(ctx, 3, 6, 10, 4, col.mid);
      rect(ctx, 1, 10, 14, 3, col.dark);
      px(ctx, 5, 7, col.light); px(ctx, 10, 7, col.light); // eyes
      rect(ctx, 4, 13, 2, 2, col.mid); rect(ctx, 10, 13, 2, 2, col.mid);
      break;
    case 1: // Swarm - tiny round bug
      rect(ctx, 5, 3, 6, 6, col.mid);
      rect(ctx, 4, 5, 8, 4, col.mid);
      rect(ctx, 6, 2, 4, 2, col.dark);
      px(ctx, 5, 5, col.light); px(ctx, 10, 5, col.light); // eyes
      rect(ctx, 3, 9, 2, 3, col.dark); rect(ctx, 11, 9, 2, 3, col.dark); // legs
      px(ctx, 6, 8, col.light); px(ctx, 9, 8, col.light); // antennae dots
      break;
    default: // Zigzag - wavy body
      rect(ctx, 4, 2, 8, 3, col.mid);
      rect(ctx, 3, 5, 10, 4, col.mid);
      rect(ctx, 5, 9, 6, 3, col.dark);
      px(ctx, 5, 4, '#ffffff'); px(ctx, 10, 4, '#ffffff');
      rect(ctx, 2, 6, 2, 2, col.light); rect(ctx, 12, 6, 2, 2, col.light);
      rect(ctx, 6, 12, 4, 2, col.mid);
      break;
  }
  return c;
}

function generateMediumEnemy(variant: number, element: string): HTMLCanvasElement {
  const c = createCanvas(24, 24);
  const ctx = c.getContext('2d')!;
  const col = ELEMENT_COLORS[element] || ELEMENT_COLORS.normal;

  switch (variant) {
    case 0: // Grunt - blocky soldier
      rect(ctx, 8, 1, 8, 4, col.dark);
      rect(ctx, 6, 5, 12, 8, col.mid);
      rect(ctx, 4, 13, 16, 6, col.mid);
      rect(ctx, 2, 15, 4, 4, col.dark); rect(ctx, 18, 15, 4, 4, col.dark);
      px(ctx, 9, 7, col.light); px(ctx, 14, 7, col.light);
      rect(ctx, 9, 10, 6, 2, col.dark); // mouth
      rect(ctx, 7, 19, 4, 3, col.dark); rect(ctx, 13, 19, 4, 3, col.dark);
      break;
    case 1: // Shooter - has cannon
      rect(ctx, 7, 2, 10, 6, col.mid);
      rect(ctx, 5, 8, 14, 8, col.mid);
      rect(ctx, 3, 10, 3, 6, col.dark); rect(ctx, 18, 10, 3, 6, col.dark);
      rect(ctx, 10, 16, 4, 6, col.light); // cannon barrel
      px(ctx, 8, 5, '#ff0000'); px(ctx, 15, 5, '#ff0000'); // red eyes
      rect(ctx, 9, 8, 6, 2, col.dark);
      break;
    case 2: // Armored - heavy plates
      rect(ctx, 6, 1, 12, 4, col.dark);
      rect(ctx, 4, 5, 16, 10, col.mid);
      rect(ctx, 2, 8, 20, 6, col.dark); // armor plates
      rect(ctx, 6, 15, 12, 6, col.mid);
      px(ctx, 8, 4, col.light); px(ctx, 15, 4, col.light);
      rect(ctx, 5, 6, 14, 2, col.light); // visor
      rect(ctx, 8, 21, 3, 2, col.dark); rect(ctx, 13, 21, 3, 2, col.dark);
      break;
    default: // Fast - sleek shape
      rect(ctx, 10, 1, 4, 3, col.light);
      rect(ctx, 8, 4, 8, 4, col.mid);
      rect(ctx, 5, 8, 14, 6, col.mid);
      rect(ctx, 3, 12, 18, 4, col.dark);
      rect(ctx, 1, 14, 4, 4, col.mid); rect(ctx, 19, 14, 4, 4, col.mid);
      px(ctx, 9, 6, col.light); px(ctx, 14, 6, col.light);
      rect(ctx, 7, 16, 10, 3, col.mid);
      rect(ctx, 9, 19, 2, 3, col.light); rect(ctx, 13, 19, 2, 3, col.light);
      break;
  }
  return c;
}

function generateLargeEnemy(variant: number, element: string): HTMLCanvasElement {
  const c = createCanvas(32, 32);
  const ctx = c.getContext('2d')!;
  const col = ELEMENT_COLORS[element] || ELEMENT_COLORS.normal;

  switch (variant) {
    case 0: // Tank - massive blocky
      rect(ctx, 10, 1, 12, 4, col.dark);
      rect(ctx, 6, 5, 20, 10, col.mid);
      rect(ctx, 4, 15, 24, 10, col.mid);
      rect(ctx, 2, 12, 4, 8, col.dark); rect(ctx, 26, 12, 4, 8, col.dark);
      rect(ctx, 8, 25, 6, 4, col.dark); rect(ctx, 18, 25, 6, 4, col.dark);
      px(ctx, 12, 7, '#ff0000'); px(ctx, 19, 7, '#ff0000');
      rect(ctx, 10, 10, 12, 3, col.light); // visor
      rect(ctx, 6, 18, 20, 2, col.dark); // armor band
      break;
    case 1: // Shield Bearer
      rect(ctx, 8, 2, 16, 6, col.mid);
      rect(ctx, 6, 8, 20, 12, col.mid);
      rect(ctx, 4, 6, 24, 3, col.light); // shield top
      rect(ctx, 3, 9, 26, 8, shade(col.mid, 0.7)); // shield
      rect(ctx, 10, 20, 12, 8, col.dark);
      px(ctx, 12, 4, col.light); px(ctx, 19, 4, col.light);
      rect(ctx, 11, 13, 10, 2, col.light);
      rect(ctx, 8, 28, 4, 3, col.mid); rect(ctx, 20, 28, 4, 3, col.mid);
      break;
    default: // Bomber - round explosive
      rect(ctx, 10, 2, 12, 4, col.dark);
      rect(ctx, 6, 6, 20, 8, col.mid);
      rect(ctx, 4, 14, 24, 10, col.mid);
      rect(ctx, 8, 24, 16, 4, col.mid);
      px(ctx, 11, 9, col.light); px(ctx, 20, 9, col.light);
      rect(ctx, 13, 12, 6, 4, '#ff3300'); // fuse/core
      rect(ctx, 14, 3, 4, 3, '#ffcc00'); // fuse tip
      rect(ctx, 6, 16, 20, 2, col.dark); // belt
      break;
  }
  return c;
}

function generateBossEnemy(variant: number): HTMLCanvasElement {
  const c = createCanvas(48, 48);
  const ctx = c.getContext('2d')!;

  if (variant === 0) {
    // Drill Sergeant - large armored commander
    const col = ELEMENT_COLORS.normal;
    rect(ctx, 16, 2, 16, 6, col.dark);
    rect(ctx, 12, 8, 24, 12, col.mid);
    rect(ctx, 8, 20, 32, 14, col.mid);
    rect(ctx, 4, 18, 6, 12, col.dark); rect(ctx, 38, 18, 6, 12, col.dark);
    rect(ctx, 14, 34, 20, 8, col.dark);
    rect(ctx, 10, 42, 8, 5, col.mid); rect(ctx, 30, 42, 8, 5, col.mid);
    // Eyes
    rect(ctx, 18, 10, 4, 4, '#ff0000'); rect(ctx, 26, 10, 4, 4, '#ff0000');
    // Drill
    rect(ctx, 21, 1, 6, 3, '#aaaaaa');
    rect(ctx, 22, 0, 4, 2, '#cccccc');
    // Armor details
    rect(ctx, 10, 24, 28, 2, col.light);
    rect(ctx, 14, 28, 20, 2, col.light);
    // Shoulder pads
    rect(ctx, 6, 16, 4, 6, col.light); rect(ctx, 38, 16, 4, 6, col.light);
  } else {
    // Hydra - three-headed beast
    const col = ELEMENT_COLORS.dark;
    // Body
    rect(ctx, 14, 24, 20, 16, col.mid);
    rect(ctx, 10, 30, 28, 12, col.dark);
    // Left head
    rect(ctx, 4, 6, 10, 10, col.mid);
    rect(ctx, 6, 4, 6, 4, col.dark);
    px(ctx, 7, 8, '#ff0000'); px(ctx, 11, 8, '#ff0000');
    rect(ctx, 8, 16, 4, 10, col.dark); // neck
    // Center head
    rect(ctx, 18, 2, 12, 12, col.mid);
    rect(ctx, 20, 0, 8, 4, col.dark);
    px(ctx, 21, 5, '#ff0000'); px(ctx, 27, 5, '#ff0000');
    rect(ctx, 22, 14, 4, 12, col.dark); // neck
    // Right head
    rect(ctx, 34, 6, 10, 10, col.mid);
    rect(ctx, 36, 4, 6, 4, col.dark);
    px(ctx, 37, 8, '#ff0000'); px(ctx, 41, 8, '#ff0000');
    rect(ctx, 36, 16, 4, 10, col.dark); // neck
    // Tail
    rect(ctx, 20, 40, 8, 6, col.dark);
    rect(ctx, 22, 44, 4, 3, col.mid);
  }
  return c;
}

// ─── Item Icon Generation ────────────────────────────────────────────────────

function generateItemIcon(itemId: string): HTMLCanvasElement {
  const c = createCanvas(24, 24);
  const ctx = c.getContext('2d')!;

  switch (itemId) {
    case 'basic_gun':
      rect(ctx, 8, 4, 8, 16, '#9e9e9e');
      rect(ctx, 10, 2, 4, 4, '#bdbdbd');
      rect(ctx, 6, 14, 12, 4, '#616161');
      rect(ctx, 10, 18, 4, 4, '#424242');
      px(ctx, 11, 3, '#ffffff');
      break;
    case 'fire_gun':
      rect(ctx, 8, 4, 8, 14, '#e64a19');
      rect(ctx, 10, 2, 4, 4, '#ff6e40');
      rect(ctx, 6, 12, 12, 4, '#bf360c');
      rect(ctx, 10, 18, 4, 4, '#8b2500');
      px(ctx, 11, 3, '#ffab40');
      rect(ctx, 9, 1, 2, 2, '#ffcc00'); rect(ctx, 13, 1, 2, 2, '#ffcc00');
      break;
    case 'ice_gun':
      rect(ctx, 8, 4, 8, 14, '#2196f3');
      rect(ctx, 10, 2, 4, 4, '#80d8ff');
      rect(ctx, 6, 12, 12, 4, '#0d47a1');
      rect(ctx, 10, 18, 4, 4, '#01579b');
      px(ctx, 11, 3, '#e0f7fa'); px(ctx, 13, 5, '#e0f7fa');
      break;
    case 'lightning_rod':
      rect(ctx, 10, 2, 4, 18, '#795548');
      rect(ctx, 8, 1, 8, 3, '#ffc107');
      rect(ctx, 6, 0, 12, 2, '#ffff00');
      px(ctx, 7, 4, '#ffff00'); px(ctx, 16, 4, '#ffff00');
      rect(ctx, 9, 20, 6, 3, '#5d4037');
      break;
    case 'poison_dart':
      rect(ctx, 10, 2, 4, 16, '#4e342e');
      rect(ctx, 11, 1, 2, 3, '#76ff03');
      rect(ctx, 8, 16, 8, 4, '#388e3c');
      rect(ctx, 9, 18, 2, 3, '#1b5e20');
      rect(ctx, 13, 18, 2, 3, '#1b5e20');
      break;
    case 'shotgun':
      rect(ctx, 7, 3, 4, 16, '#616161');
      rect(ctx, 13, 3, 4, 16, '#616161');
      rect(ctx, 6, 2, 12, 3, '#424242');
      rect(ctx, 8, 17, 8, 5, '#5d4037');
      px(ctx, 8, 3, '#ffffff'); px(ctx, 15, 3, '#ffffff');
      break;
    case 'sniper':
      rect(ctx, 10, 1, 4, 20, '#546e7a');
      rect(ctx, 8, 4, 8, 3, '#37474f');
      rect(ctx, 6, 6, 4, 4, '#80cbc4'); // scope
      rect(ctx, 9, 19, 6, 4, '#4e342e');
      px(ctx, 7, 7, '#ffffff');
      break;
    case 'missile_launcher':
      rect(ctx, 6, 4, 12, 14, '#455a64');
      rect(ctx, 8, 2, 8, 4, '#37474f');
      rect(ctx, 9, 1, 6, 2, '#ef5350');
      rect(ctx, 7, 16, 10, 6, '#5d4037');
      rect(ctx, 10, 6, 4, 4, '#ff5252');
      break;
    default:
      generateGenericItemIcon(ctx, itemId);
      break;
  }
  return c;
}

function generateGenericItemIcon(ctx: CanvasRenderingContext2D, itemId: string): void {
  switch (itemId) {
    case 'parrot':
      rect(ctx, 10, 3, 6, 6, '#4caf50');
      rect(ctx, 8, 9, 8, 8, '#388e3c');
      rect(ctx, 14, 5, 4, 3, '#ffc107'); // beak
      px(ctx, 12, 5, '#000000'); // eye
      rect(ctx, 6, 10, 3, 5, '#66bb6a'); // wing
      rect(ctx, 10, 17, 4, 5, '#1b5e20'); // tail
      break;
    case 'cat':
      rect(ctx, 8, 6, 8, 8, '#ff9800');
      rect(ctx, 7, 3, 4, 4, '#ff9800'); rect(ctx, 13, 3, 4, 4, '#ff9800'); // ears
      px(ctx, 9, 8, '#000000'); px(ctx, 14, 8, '#000000'); // eyes
      rect(ctx, 10, 10, 4, 2, '#e65100'); // nose
      rect(ctx, 9, 14, 6, 6, '#f57c00'); // body
      rect(ctx, 15, 16, 5, 2, '#e65100'); // tail
      break;
    case 'owl':
      rect(ctx, 8, 4, 8, 10, '#795548');
      rect(ctx, 6, 6, 12, 6, '#8d6e63');
      rect(ctx, 7, 5, 4, 4, '#ffcc02'); rect(ctx, 13, 5, 4, 4, '#ffcc02'); // big eyes
      px(ctx, 9, 6, '#000000'); px(ctx, 14, 6, '#000000');
      rect(ctx, 10, 10, 4, 2, '#ff8f00'); // beak
      rect(ctx, 5, 8, 3, 6, '#6d4c41'); rect(ctx, 16, 8, 3, 6, '#6d4c41'); // wings
      rect(ctx, 9, 14, 6, 4, '#5d4037');
      break;
    case 'snake':
      rect(ctx, 4, 10, 4, 4, '#388e3c');
      rect(ctx, 7, 8, 4, 4, '#4caf50');
      rect(ctx, 10, 10, 4, 4, '#388e3c');
      rect(ctx, 13, 8, 4, 4, '#4caf50');
      rect(ctx, 16, 6, 5, 5, '#2e7d32'); // head
      px(ctx, 18, 7, '#ff0000'); // eye
      rect(ctx, 20, 8, 3, 1, '#ff0000'); // tongue
      break;
    case 'phoenix_egg':
      rect(ctx, 8, 4, 8, 12, '#ff8f00');
      rect(ctx, 10, 2, 4, 4, '#ffcc02');
      rect(ctx, 6, 8, 12, 8, '#e65100');
      rect(ctx, 10, 16, 4, 4, '#bf360c');
      px(ctx, 10, 8, '#ffff00'); px(ctx, 13, 8, '#ffff00'); // glow
      rect(ctx, 9, 6, 6, 2, '#ffcc02');
      break;
    case 'stutter_box':
      rect(ctx, 4, 4, 16, 16, '#7b1fa2');
      rect(ctx, 6, 6, 12, 12, '#4a148c');
      rect(ctx, 8, 8, 8, 8, '#ce93d8');
      rect(ctx, 10, 10, 4, 4, '#ffffff');
      px(ctx, 5, 5, '#e040fb'); px(ctx, 18, 5, '#e040fb');
      px(ctx, 5, 18, '#e040fb'); px(ctx, 18, 18, '#e040fb');
      break;
    case 'watering_can':
      rect(ctx, 4, 8, 12, 10, '#2196f3');
      rect(ctx, 6, 6, 8, 4, '#1976d2');
      rect(ctx, 14, 6, 6, 3, '#90caf9'); // spout
      rect(ctx, 18, 5, 3, 2, '#bbdefb');
      rect(ctx, 8, 4, 4, 3, '#1565c0'); // handle
      px(ctx, 19, 5, '#e3f2fd'); // water drop
      break;
    case 'plant_shield':
      rect(ctx, 6, 3, 12, 14, '#4caf50');
      rect(ctx, 8, 2, 8, 2, '#388e3c');
      rect(ctx, 4, 6, 16, 8, '#2e7d32');
      rect(ctx, 8, 17, 8, 4, '#1b5e20');
      rect(ctx, 10, 8, 4, 6, '#a5d6a7'); // leaf vein
      px(ctx, 11, 4, '#c8e6c9');
      break;
    case 'amplifier_crystal':
      rect(ctx, 10, 2, 4, 4, '#e040fb');
      rect(ctx, 8, 6, 8, 8, '#7b1fa2');
      rect(ctx, 6, 10, 12, 6, '#4a148c');
      rect(ctx, 10, 16, 4, 6, '#6a1b9a');
      px(ctx, 11, 4, '#ffffff'); px(ctx, 12, 8, '#ffffff');
      break;
    case 'speed_coil':
      rect(ctx, 6, 4, 12, 16, '#ffc107');
      rect(ctx, 8, 6, 8, 2, '#ff8f00');
      rect(ctx, 8, 10, 8, 2, '#ff8f00');
      rect(ctx, 8, 14, 8, 2, '#ff8f00');
      rect(ctx, 4, 5, 3, 14, '#ffb300');
      rect(ctx, 17, 5, 3, 14, '#ffb300');
      break;
    case 'splitter_prism':
      rect(ctx, 10, 2, 4, 4, '#ffffff');
      rect(ctx, 7, 6, 10, 8, '#e0e0e0');
      rect(ctx, 5, 14, 14, 6, '#bdbdbd');
      px(ctx, 6, 16, '#ff0000'); px(ctx, 9, 16, '#00ff00');
      px(ctx, 12, 16, '#0000ff'); px(ctx, 15, 16, '#ffff00');
      rect(ctx, 9, 4, 6, 2, '#ffffff');
      break;
    case 'targeting_module':
      rect(ctx, 4, 4, 16, 16, '#37474f');
      rect(ctx, 6, 6, 12, 12, '#263238');
      rect(ctx, 10, 4, 4, 16, '#f44336');
      rect(ctx, 4, 10, 16, 4, '#f44336');
      rect(ctx, 9, 9, 6, 6, '#212121');
      px(ctx, 12, 12, '#ff0000');
      break;
    case 'repair_kit':
      rect(ctx, 4, 6, 16, 12, '#f44336');
      rect(ctx, 6, 4, 12, 2, '#d32f2f');
      rect(ctx, 9, 8, 6, 2, '#ffffff');
      rect(ctx, 11, 6, 2, 6, '#ffffff');
      rect(ctx, 6, 16, 12, 3, '#b71c1c');
      break;
    case 'gold_magnet':
      rect(ctx, 4, 4, 6, 12, '#f44336');
      rect(ctx, 14, 4, 6, 12, '#2196f3');
      rect(ctx, 6, 2, 12, 4, '#9e9e9e');
      rect(ctx, 8, 16, 8, 4, '#757575');
      px(ctx, 11, 18, '#ffc107'); px(ctx, 12, 19, '#ffc107');
      break;
    case 'armor_plate':
      rect(ctx, 4, 4, 16, 16, '#607d8b');
      rect(ctx, 6, 6, 12, 12, '#455a64');
      rect(ctx, 8, 8, 8, 8, '#546e7a');
      rect(ctx, 4, 10, 16, 4, '#37474f');
      px(ctx, 6, 6, '#90a4ae'); px(ctx, 17, 6, '#90a4ae');
      break;
    case 'battery':
      rect(ctx, 7, 4, 10, 16, '#ffc107');
      rect(ctx, 9, 2, 6, 3, '#616161');
      rect(ctx, 8, 8, 8, 2, '#212121');
      rect(ctx, 8, 14, 8, 2, '#212121');
      rect(ctx, 9, 6, 2, 2, '#ffff00');
      px(ctx, 13, 6, '#ffff00');
      break;
    case 'fertilizer':
      rect(ctx, 5, 4, 14, 14, '#5d4037');
      rect(ctx, 7, 2, 10, 4, '#795548');
      rect(ctx, 8, 8, 8, 6, '#4caf50');
      px(ctx, 9, 9, '#76ff03'); px(ctx, 14, 10, '#76ff03');
      rect(ctx, 9, 18, 6, 3, '#3e2723');
      break;
    case 'coolant':
      rect(ctx, 6, 4, 12, 14, '#00bcd4');
      rect(ctx, 8, 2, 8, 4, '#0097a7');
      rect(ctx, 4, 8, 16, 8, '#006064');
      px(ctx, 10, 8, '#e0f7fa'); px(ctx, 14, 10, '#e0f7fa');
      rect(ctx, 9, 18, 6, 3, '#004d40');
      break;
    case 'wind_fan':
      rect(ctx, 9, 9, 6, 6, '#78909c');
      rect(ctx, 10, 2, 4, 8, '#90a4ae');
      rect(ctx, 10, 14, 4, 8, '#90a4ae');
      rect(ctx, 2, 10, 8, 4, '#90a4ae');
      rect(ctx, 14, 10, 8, 4, '#90a4ae');
      rect(ctx, 10, 10, 4, 4, '#37474f');
      break;
    case 'lucky_charm':
      rect(ctx, 8, 4, 8, 8, '#ffc107');
      rect(ctx, 6, 8, 12, 8, '#ff8f00');
      rect(ctx, 10, 2, 4, 4, '#ffeb3b');
      rect(ctx, 10, 16, 4, 4, '#f57f17');
      px(ctx, 11, 8, '#ffffff'); px(ctx, 12, 10, '#ffffff');
      break;
    case 'void_crystal':
      rect(ctx, 10, 2, 4, 4, '#4a148c');
      rect(ctx, 8, 6, 8, 8, '#1a0033');
      rect(ctx, 6, 10, 12, 6, '#311b92');
      rect(ctx, 10, 16, 4, 6, '#4a148c');
      px(ctx, 11, 8, '#7c4dff'); px(ctx, 12, 12, '#7c4dff');
      px(ctx, 9, 10, '#ea80fc');
      break;
    case 'crown_of_thorns':
      rect(ctx, 4, 10, 16, 8, '#5d4037');
      rect(ctx, 6, 8, 12, 4, '#795548');
      rect(ctx, 5, 6, 3, 5, '#4e342e'); rect(ctx, 16, 6, 3, 5, '#4e342e');
      rect(ctx, 8, 4, 2, 4, '#f44336'); rect(ctx, 14, 4, 2, 4, '#f44336');
      rect(ctx, 11, 3, 2, 3, '#f44336');
      px(ctx, 6, 7, '#ff5252'); px(ctx, 17, 7, '#ff5252');
      break;
    // ─── Custom Icons for Items 51-100 ─────────────────────────────────────────
    case 'plasma_cannon':
      rect(ctx, 6, 6, 12, 12, '#7b1fa2');
      rect(ctx, 8, 4, 8, 4, '#9c27b0');
      rect(ctx, 9, 2, 6, 3, '#ce93d8');
      rect(ctx, 4, 10, 16, 6, '#4a148c');
      rect(ctx, 10, 16, 4, 5, '#6a1b9a');
      px(ctx, 11, 3, '#ffffff'); px(ctx, 12, 5, '#ea80fc');
      rect(ctx, 7, 8, 2, 2, '#e040fb'); rect(ctx, 15, 8, 2, 2, '#e040fb');
      break;
    case 'chain_gun':
      rect(ctx, 6, 2, 4, 18, '#616161');
      rect(ctx, 12, 2, 4, 18, '#616161');
      rect(ctx, 9, 4, 4, 3, '#424242');
      rect(ctx, 4, 6, 16, 4, '#757575');
      rect(ctx, 5, 10, 14, 6, '#9e9e9e');
      rect(ctx, 8, 16, 8, 5, '#5d4037');
      px(ctx, 7, 3, '#ffcc00'); px(ctx, 14, 3, '#ffcc00');
      rect(ctx, 9, 12, 6, 2, '#424242');
      break;
    case 'frost_nova':
      rect(ctx, 10, 2, 4, 20, '#80deea');
      rect(ctx, 2, 10, 20, 4, '#80deea');
      rect(ctx, 5, 5, 4, 4, '#4dd0e1'); rect(ctx, 15, 5, 4, 4, '#4dd0e1');
      rect(ctx, 5, 15, 4, 4, '#4dd0e1'); rect(ctx, 15, 15, 4, 4, '#4dd0e1');
      rect(ctx, 9, 9, 6, 6, '#e0f7fa');
      px(ctx, 11, 11, '#ffffff'); px(ctx, 12, 10, '#ffffff');
      break;
    case 'fire_ant_colony':
      rect(ctx, 4, 8, 16, 10, '#bf360c');
      rect(ctx, 6, 6, 12, 4, '#e64a19');
      rect(ctx, 8, 4, 8, 3, '#ff6e40');
      px(ctx, 6, 10, '#ff0000'); px(ctx, 10, 12, '#ff0000');
      px(ctx, 14, 9, '#ff0000'); px(ctx, 17, 11, '#ff0000');
      px(ctx, 8, 14, '#ff0000'); px(ctx, 12, 16, '#ff0000');
      rect(ctx, 10, 18, 4, 3, '#8b2500');
      px(ctx, 9, 5, '#ffab40'); px(ctx, 14, 5, '#ffab40');
      break;
    case 'overclocker':
      rect(ctx, 4, 4, 16, 16, '#b71c1c');
      rect(ctx, 6, 6, 12, 12, '#d32f2f');
      rect(ctx, 8, 8, 8, 8, '#ff5252');
      rect(ctx, 10, 4, 4, 2, '#ffcdd2');
      rect(ctx, 10, 18, 4, 2, '#ffcdd2');
      rect(ctx, 4, 10, 2, 4, '#ffcdd2');
      rect(ctx, 18, 10, 2, 4, '#ffcdd2');
      px(ctx, 11, 11, '#ffffff'); px(ctx, 12, 12, '#ffffff');
      break;
    case 'infinity_stone':
      rect(ctx, 8, 2, 8, 4, '#ffd600');
      rect(ctx, 6, 6, 12, 6, '#ffab00');
      rect(ctx, 4, 10, 16, 6, '#ff6f00');
      rect(ctx, 8, 16, 8, 5, '#e65100');
      px(ctx, 10, 8, '#ffffff'); px(ctx, 13, 8, '#ffffff');
      px(ctx, 11, 12, '#ffffff'); px(ctx, 12, 14, '#ffffff');
      rect(ctx, 9, 4, 6, 2, '#ffff00');
      px(ctx, 7, 11, '#ffff8d'); px(ctx, 16, 11, '#ffff8d');
      break;
    case 'nexus_crystal':
      rect(ctx, 10, 1, 4, 6, '#651fff');
      rect(ctx, 8, 7, 8, 6, '#7c4dff');
      rect(ctx, 6, 11, 12, 6, '#b388ff');
      rect(ctx, 10, 17, 4, 5, '#4a148c');
      px(ctx, 11, 4, '#ffffff'); px(ctx, 12, 9, '#ffffff');
      px(ctx, 9, 13, '#e8eaf6'); px(ctx, 14, 13, '#e8eaf6');
      rect(ctx, 4, 9, 3, 3, '#651fff'); rect(ctx, 17, 9, 3, 3, '#651fff');
      break;
    case 'berserker_core':
      rect(ctx, 6, 4, 12, 16, '#b71c1c');
      rect(ctx, 4, 8, 16, 8, '#d50000');
      rect(ctx, 8, 2, 8, 4, '#ff1744');
      rect(ctx, 9, 18, 6, 3, '#880e4f');
      px(ctx, 9, 9, '#ffff00'); px(ctx, 14, 9, '#ffff00');
      rect(ctx, 10, 12, 4, 3, '#ff8a80');
      px(ctx, 7, 6, '#ff5252'); px(ctx, 16, 6, '#ff5252');
      break;
    case 'golden_egg':
      rect(ctx, 9, 3, 6, 4, '#ffd600');
      rect(ctx, 7, 7, 10, 8, '#ffab00');
      rect(ctx, 8, 15, 8, 4, '#ff8f00');
      rect(ctx, 10, 19, 4, 3, '#e65100');
      px(ctx, 10, 5, '#ffffff'); px(ctx, 13, 7, '#ffffff');
      px(ctx, 9, 10, '#ffff8d');
      rect(ctx, 11, 1, 2, 3, '#ffd600');
      break;
    case 'dragon_whelp':
      rect(ctx, 8, 4, 8, 8, '#e64a19');
      rect(ctx, 6, 8, 12, 8, '#bf360c');
      rect(ctx, 5, 3, 4, 4, '#ff6e40'); rect(ctx, 15, 3, 4, 4, '#ff6e40');
      px(ctx, 7, 5, '#ffff00'); px(ctx, 16, 5, '#ffff00');
      rect(ctx, 3, 10, 4, 6, '#e64a19'); rect(ctx, 17, 10, 4, 6, '#e64a19');
      rect(ctx, 10, 16, 4, 4, '#bf360c');
      rect(ctx, 9, 12, 6, 2, '#ffcc00');
      break;
    // ─── Items 101-150 Icons ─────────────────────────────────────────────────
    case 'railgun':
      rect(ctx, 9, 1, 6, 20, '#546e7a');
      rect(ctx, 7, 4, 10, 4, '#37474f');
      rect(ctx, 6, 8, 12, 3, '#263238');
      rect(ctx, 11, 0, 2, 3, '#80cbc4');
      px(ctx, 11, 2, '#ffffff');
      rect(ctx, 9, 20, 6, 3, '#5d4037');
      break;
    case 'frost_turret':
      rect(ctx, 6, 10, 12, 10, '#00bcd4');
      rect(ctx, 8, 6, 8, 6, '#0097a7');
      rect(ctx, 10, 3, 4, 4, '#80deea');
      rect(ctx, 4, 14, 16, 4, '#006064');
      px(ctx, 11, 5, '#ffffff'); px(ctx, 13, 8, '#e0f7fa');
      break;
    case 'magma_launcher':
      rect(ctx, 6, 4, 12, 14, '#bf360c');
      rect(ctx, 8, 2, 8, 4, '#e64a19');
      rect(ctx, 4, 10, 16, 6, '#8b2500');
      rect(ctx, 9, 18, 6, 4, '#5d4037');
      px(ctx, 10, 4, '#ffab40'); px(ctx, 13, 6, '#ffcc00');
      break;
    case 'vine_whip':
      rect(ctx, 4, 4, 4, 16, '#2e7d32');
      rect(ctx, 7, 6, 4, 12, '#388e3c');
      rect(ctx, 10, 3, 4, 10, '#4caf50');
      rect(ctx, 13, 2, 4, 6, '#66bb6a');
      px(ctx, 15, 1, '#a5d6a7'); px(ctx, 5, 5, '#a5d6a7');
      break;
    case 'pulse_rifle':
      rect(ctx, 7, 3, 10, 16, '#1565c0');
      rect(ctx, 9, 1, 6, 4, '#1976d2');
      rect(ctx, 5, 8, 14, 4, '#0d47a1');
      rect(ctx, 9, 17, 6, 4, '#5d4037');
      px(ctx, 11, 3, '#64b5f6'); px(ctx, 14, 10, '#bbdefb');
      break;
    case 'thorn_cannon':
      rect(ctx, 8, 3, 8, 16, '#2e7d32');
      rect(ctx, 6, 6, 12, 4, '#1b5e20');
      rect(ctx, 5, 4, 3, 3, '#76ff03'); rect(ctx, 16, 8, 3, 3, '#76ff03');
      rect(ctx, 10, 18, 4, 3, '#5d4037');
      px(ctx, 7, 5, '#a5d6a7');
      break;
    case 'water_cannon':
      rect(ctx, 6, 4, 12, 14, '#1976d2');
      rect(ctx, 8, 2, 8, 4, '#2196f3');
      rect(ctx, 4, 8, 16, 6, '#0d47a1');
      rect(ctx, 12, 16, 6, 4, '#90caf9');
      px(ctx, 10, 4, '#bbdefb'); px(ctx, 16, 18, '#e3f2fd');
      break;
    case 'shadow_dagger':
      rect(ctx, 11, 2, 2, 14, '#37474f');
      rect(ctx, 10, 1, 4, 3, '#90a4ae');
      rect(ctx, 9, 14, 6, 4, '#1a1a2e');
      rect(ctx, 10, 17, 4, 4, '#4a148c');
      px(ctx, 11, 2, '#ffffff'); px(ctx, 12, 6, '#7c4dff');
      break;
    case 'wind_cutter':
      rect(ctx, 4, 8, 16, 6, '#90a4ae');
      rect(ctx, 6, 6, 12, 3, '#b0bec5');
      rect(ctx, 2, 10, 20, 2, '#78909c');
      rect(ctx, 8, 14, 8, 4, '#546e7a');
      px(ctx, 5, 9, '#e0f7fa'); px(ctx, 18, 9, '#e0f7fa');
      break;
    case 'venom_spitter':
      rect(ctx, 8, 4, 8, 12, '#388e3c');
      rect(ctx, 6, 8, 12, 6, '#1b5e20');
      rect(ctx, 10, 2, 4, 4, '#76ff03');
      rect(ctx, 9, 16, 6, 5, '#4e342e');
      px(ctx, 10, 3, '#c6ff00'); px(ctx, 14, 10, '#76ff03');
      break;
    case 'arcane_orb':
      rect(ctx, 6, 6, 12, 12, '#4a148c');
      rect(ctx, 8, 4, 8, 4, '#7b1fa2');
      rect(ctx, 4, 8, 16, 8, '#311b92');
      rect(ctx, 8, 16, 8, 4, '#6a1b9a');
      px(ctx, 11, 10, '#ea80fc'); px(ctx, 12, 8, '#ffffff');
      px(ctx, 9, 12, '#ce93d8');
      break;
    case 'spider_familiar':
      rect(ctx, 8, 6, 8, 6, '#4e342e');
      rect(ctx, 10, 4, 4, 4, '#5d4037');
      px(ctx, 10, 6, '#ff0000'); px(ctx, 14, 6, '#ff0000');
      rect(ctx, 4, 8, 4, 2, '#3e2723'); rect(ctx, 16, 8, 4, 2, '#3e2723');
      rect(ctx, 5, 12, 3, 4, '#3e2723'); rect(ctx, 16, 12, 3, 4, '#3e2723');
      rect(ctx, 9, 12, 6, 6, '#795548');
      break;
    case 'crystal_golem':
      rect(ctx, 6, 4, 12, 14, '#7986cb');
      rect(ctx, 8, 2, 8, 4, '#9fa8da');
      rect(ctx, 4, 8, 16, 8, '#5c6bc0');
      rect(ctx, 8, 18, 8, 4, '#3949ab');
      px(ctx, 10, 6, '#ffffff'); px(ctx, 14, 6, '#ffffff');
      px(ctx, 12, 12, '#c5cae9');
      break;
    case 'ember_sprite':
      rect(ctx, 8, 4, 8, 8, '#ff6e40');
      rect(ctx, 6, 8, 12, 6, '#e64a19');
      rect(ctx, 10, 2, 4, 4, '#ffab40');
      px(ctx, 10, 5, '#ffff00'); px(ctx, 14, 5, '#ffff00');
      rect(ctx, 5, 10, 3, 4, '#ff6e40'); rect(ctx, 16, 10, 3, 4, '#ff6e40');
      px(ctx, 11, 14, '#ffcc00');
      break;
    case 'storm_eagle':
      rect(ctx, 8, 4, 8, 8, '#ffc107');
      rect(ctx, 6, 8, 12, 6, '#ff8f00');
      rect(ctx, 3, 6, 5, 6, '#ffb300'); rect(ctx, 16, 6, 5, 6, '#ffb300');
      px(ctx, 9, 6, '#000'); px(ctx, 14, 6, '#000');
      rect(ctx, 10, 14, 4, 4, '#5d4037');
      px(ctx, 14, 4, '#ffff00');
      break;
    case 'damage_booster':
      rect(ctx, 4, 4, 16, 16, '#b71c1c');
      rect(ctx, 6, 6, 12, 12, '#c62828');
      rect(ctx, 9, 8, 6, 2, '#ffffff');
      rect(ctx, 9, 12, 6, 2, '#ffffff');
      rect(ctx, 9, 10, 6, 2, '#ffffff');
      px(ctx, 7, 10, '#ff5252'); px(ctx, 16, 10, '#ff5252');
      break;
    case 'rapid_fire_module':
      rect(ctx, 4, 4, 16, 16, '#e65100');
      rect(ctx, 6, 6, 12, 12, '#f57c00');
      rect(ctx, 8, 6, 2, 12, '#fff3e0');
      rect(ctx, 11, 6, 2, 12, '#fff3e0');
      rect(ctx, 14, 6, 2, 12, '#fff3e0');
      break;
    case 'piercing_lens':
      rect(ctx, 6, 6, 12, 12, '#1565c0');
      rect(ctx, 8, 4, 8, 4, '#1976d2');
      rect(ctx, 10, 8, 4, 8, '#ffffff');
      rect(ctx, 8, 10, 8, 4, '#bbdefb');
      px(ctx, 12, 12, '#e3f2fd');
      break;
    case 'splash_module':
      rect(ctx, 4, 4, 16, 16, '#00838f');
      rect(ctx, 6, 6, 12, 12, '#006064');
      rect(ctx, 8, 8, 8, 8, '#4dd0e1');
      px(ctx, 5, 5, '#80deea'); px(ctx, 18, 5, '#80deea');
      px(ctx, 5, 18, '#80deea'); px(ctx, 18, 18, '#80deea');
      break;
    case 'life_leech':
      rect(ctx, 8, 4, 8, 12, '#b71c1c');
      rect(ctx, 6, 8, 12, 6, '#880e4f');
      rect(ctx, 10, 2, 4, 4, '#d50000');
      rect(ctx, 9, 16, 6, 4, '#4a148c');
      px(ctx, 11, 5, '#ff8a80'); px(ctx, 13, 10, '#ff5252');
      break;
    case 'titanium_plating':
      rect(ctx, 2, 4, 20, 16, '#546e7a');
      rect(ctx, 4, 6, 16, 12, '#455a64');
      rect(ctx, 6, 8, 12, 8, '#37474f');
      rect(ctx, 2, 10, 20, 4, '#263238');
      px(ctx, 4, 5, '#90a4ae'); px(ctx, 19, 5, '#90a4ae');
      break;
    case 'gold_detector':
      rect(ctx, 10, 2, 4, 14, '#795548');
      rect(ctx, 6, 14, 12, 8, '#ffc107');
      rect(ctx, 8, 16, 8, 4, '#ff8f00');
      px(ctx, 11, 18, '#ffffff');
      rect(ctx, 9, 0, 6, 3, '#5d4037');
      break;
    case 'adrenaline_injector':
      rect(ctx, 9, 2, 6, 18, '#4caf50');
      rect(ctx, 7, 4, 10, 4, '#388e3c');
      rect(ctx, 11, 0, 2, 3, '#9e9e9e');
      rect(ctx, 8, 14, 8, 4, '#2e7d32');
      px(ctx, 11, 6, '#76ff03'); px(ctx, 14, 10, '#a5d6a7');
      break;
    case 'nano_repair_bot':
      rect(ctx, 6, 6, 12, 12, '#607d8b');
      rect(ctx, 8, 4, 8, 4, '#78909c');
      rect(ctx, 4, 10, 16, 4, '#455a64');
      rect(ctx, 9, 8, 2, 8, '#4caf50');
      rect(ctx, 13, 8, 2, 8, '#4caf50');
      px(ctx, 11, 11, '#76ff03');
      break;
    case 'emp_generator':
      rect(ctx, 4, 6, 16, 12, '#311b92');
      rect(ctx, 6, 4, 12, 4, '#4527a0');
      rect(ctx, 8, 10, 8, 4, '#ffff00');
      rect(ctx, 6, 16, 12, 4, '#1a237e');
      px(ctx, 8, 8, '#ffc107'); px(ctx, 15, 8, '#ffc107');
      break;
    case 'fire_shield':
      rect(ctx, 6, 3, 12, 16, '#e64a19');
      rect(ctx, 4, 6, 16, 10, '#bf360c');
      rect(ctx, 8, 2, 8, 4, '#ff6e40');
      rect(ctx, 10, 10, 4, 4, '#ffcc00');
      px(ctx, 8, 4, '#ffab40'); px(ctx, 15, 4, '#ffab40');
      break;
    case 'poison_cloud_gen':
      rect(ctx, 4, 8, 16, 10, '#2e7d32');
      rect(ctx, 6, 4, 12, 6, '#388e3c');
      rect(ctx, 8, 2, 8, 4, '#76ff03');
      px(ctx, 7, 10, '#c6ff00'); px(ctx, 16, 12, '#c6ff00');
      px(ctx, 10, 14, '#76ff03'); px(ctx, 14, 8, '#a5d6a7');
      break;
    case 'mirror_shield':
      rect(ctx, 6, 2, 12, 18, '#90a4ae');
      rect(ctx, 8, 4, 8, 14, '#eceff1');
      rect(ctx, 10, 6, 4, 10, '#ffffff');
      rect(ctx, 4, 8, 16, 2, '#b0bec5');
      px(ctx, 9, 7, '#e3f2fd'); px(ctx, 14, 12, '#e3f2fd');
      break;
    case 'quantum_entangler':
      rect(ctx, 4, 4, 16, 16, '#4527a0');
      rect(ctx, 6, 6, 12, 12, '#311b92');
      rect(ctx, 8, 8, 3, 3, '#7c4dff'); rect(ctx, 13, 13, 3, 3, '#7c4dff');
      rect(ctx, 10, 10, 4, 4, '#b388ff');
      px(ctx, 6, 6, '#ea80fc'); px(ctx, 17, 17, '#ea80fc');
      break;
    case 'gravity_anchor':
      rect(ctx, 6, 4, 12, 16, '#37474f');
      rect(ctx, 4, 8, 16, 8, '#263238');
      rect(ctx, 8, 2, 8, 4, '#546e7a');
      rect(ctx, 9, 12, 6, 6, '#4527a0');
      px(ctx, 11, 14, '#7c4dff'); px(ctx, 12, 16, '#b388ff');
      break;
    case 'scavenger_module':
      rect(ctx, 4, 6, 16, 12, '#5d4037');
      rect(ctx, 6, 4, 12, 4, '#795548');
      rect(ctx, 8, 10, 8, 4, '#ffc107');
      rect(ctx, 10, 16, 4, 4, '#3e2723');
      px(ctx, 10, 12, '#ffff00'); px(ctx, 14, 12, '#ffff00');
      break;
    case 'overload_capacitor':
      rect(ctx, 4, 4, 16, 16, '#f57f17');
      rect(ctx, 6, 6, 12, 12, '#ff6f00');
      rect(ctx, 8, 8, 8, 8, '#ffff00');
      px(ctx, 10, 10, '#ffffff'); px(ctx, 13, 13, '#ffffff');
      rect(ctx, 5, 10, 2, 4, '#ffc107'); rect(ctx, 17, 10, 2, 4, '#ffc107');
      break;
    case 'root_network':
      rect(ctx, 2, 14, 20, 6, '#5d4037');
      rect(ctx, 4, 10, 4, 6, '#4caf50');
      rect(ctx, 10, 8, 4, 8, '#388e3c');
      rect(ctx, 16, 10, 4, 6, '#4caf50');
      px(ctx, 5, 9, '#a5d6a7'); px(ctx, 11, 7, '#c8e6c9'); px(ctx, 17, 9, '#a5d6a7');
      break;
    case 'thermal_core':
      rect(ctx, 6, 6, 12, 12, '#e64a19');
      rect(ctx, 8, 4, 8, 4, '#ff6e40');
      rect(ctx, 4, 10, 16, 4, '#bf360c');
      rect(ctx, 9, 16, 6, 4, '#8b2500');
      px(ctx, 11, 8, '#ffcc00'); px(ctx, 12, 12, '#ffab40');
      break;
    case 'cryo_battery':
      rect(ctx, 7, 4, 10, 16, '#00bcd4');
      rect(ctx, 9, 2, 6, 3, '#616161');
      rect(ctx, 8, 8, 8, 2, '#e0f7fa');
      rect(ctx, 8, 14, 8, 2, '#e0f7fa');
      px(ctx, 10, 6, '#ffffff'); px(ctx, 14, 10, '#80deea');
      break;
    case 'thunder_coil':
      rect(ctx, 6, 4, 12, 16, '#ffc107');
      rect(ctx, 4, 6, 4, 12, '#ffb300'); rect(ctx, 16, 6, 4, 12, '#ffb300');
      rect(ctx, 8, 8, 8, 2, '#ffff00');
      rect(ctx, 8, 12, 8, 2, '#ffff00');
      px(ctx, 11, 6, '#ffffff');
      break;
    case 'toxic_amplifier':
      rect(ctx, 4, 4, 16, 16, '#1b5e20');
      rect(ctx, 6, 6, 12, 12, '#2e7d32');
      rect(ctx, 8, 8, 8, 8, '#76ff03');
      px(ctx, 10, 10, '#c6ff00'); px(ctx, 13, 13, '#ffffff');
      rect(ctx, 5, 10, 2, 4, '#4caf50');
      break;
    case 'pet_treat':
      rect(ctx, 6, 6, 12, 12, '#8d6e63');
      rect(ctx, 8, 4, 8, 4, '#a1887f');
      rect(ctx, 4, 10, 16, 6, '#6d4c41');
      rect(ctx, 8, 16, 8, 4, '#5d4037');
      px(ctx, 10, 8, '#ffcc02'); px(ctx, 14, 12, '#ffcc02');
      break;
    case 'synergy_prism':
      rect(ctx, 10, 2, 4, 4, '#ffffff');
      rect(ctx, 7, 6, 10, 8, '#e0e0e0');
      rect(ctx, 4, 14, 16, 6, '#bdbdbd');
      px(ctx, 5, 16, '#ff0000'); px(ctx, 8, 16, '#00ff00');
      px(ctx, 11, 16, '#0000ff'); px(ctx, 14, 16, '#ffff00');
      px(ctx, 17, 16, '#ff00ff');
      break;
    case 'emergency_shield':
      rect(ctx, 6, 3, 12, 16, '#1565c0');
      rect(ctx, 4, 6, 16, 10, '#0d47a1');
      rect(ctx, 8, 2, 8, 4, '#42a5f5');
      rect(ctx, 10, 9, 4, 4, '#ef5350');
      px(ctx, 11, 10, '#ffffff'); px(ctx, 12, 12, '#ffcdd2');
      break;
    case 'chain_lightning_rod':
      rect(ctx, 10, 1, 4, 20, '#795548');
      rect(ctx, 7, 0, 10, 3, '#ffff00');
      rect(ctx, 5, 2, 3, 3, '#ffc107'); rect(ctx, 16, 2, 3, 3, '#ffc107');
      px(ctx, 6, 3, '#ffffff'); px(ctx, 17, 3, '#ffffff');
      rect(ctx, 9, 20, 6, 3, '#5d4037');
      break;
    case 'acid_rain_gen':
      rect(ctx, 4, 8, 16, 10, '#388e3c');
      rect(ctx, 6, 4, 12, 6, '#4caf50');
      rect(ctx, 5, 16, 3, 4, '#76ff03'); rect(ctx, 10, 16, 3, 4, '#76ff03');
      rect(ctx, 16, 16, 3, 4, '#76ff03');
      px(ctx, 8, 6, '#c6ff00');
      break;
    case 'minigun':
      rect(ctx, 5, 2, 4, 18, '#616161');
      rect(ctx, 10, 2, 4, 18, '#616161');
      rect(ctx, 15, 2, 4, 18, '#616161');
      rect(ctx, 4, 6, 16, 4, '#424242');
      rect(ctx, 6, 10, 12, 4, '#757575');
      rect(ctx, 8, 18, 8, 4, '#5d4037');
      break;
    case 'holy_grail':
      rect(ctx, 8, 2, 8, 4, '#ffd600');
      rect(ctx, 6, 6, 12, 4, '#ffab00');
      rect(ctx, 10, 10, 4, 6, '#ff8f00');
      rect(ctx, 6, 16, 12, 4, '#ffd600');
      px(ctx, 11, 4, '#ffffff'); px(ctx, 12, 8, '#ffffff');
      break;
    case 'war_horn':
      rect(ctx, 4, 10, 16, 6, '#8d6e63');
      rect(ctx, 6, 8, 4, 8, '#a1887f');
      rect(ctx, 16, 8, 6, 8, '#6d4c41');
      rect(ctx, 20, 6, 3, 12, '#5d4037');
      px(ctx, 21, 8, '#ffc107');
      break;
    case 'merchant_badge':
      rect(ctx, 6, 4, 12, 14, '#ffd600');
      rect(ctx, 8, 2, 8, 4, '#ffab00');
      rect(ctx, 4, 8, 16, 8, '#ff8f00');
      rect(ctx, 10, 10, 4, 4, '#ffffff');
      px(ctx, 11, 11, '#ffd600');
      break;
    case 'alien_core_fragment':
      rect(ctx, 8, 4, 8, 8, '#7c4dff');
      rect(ctx, 6, 8, 12, 8, '#651fff');
      rect(ctx, 10, 2, 4, 4, '#b388ff');
      rect(ctx, 8, 16, 8, 4, '#4a148c');
      px(ctx, 10, 6, '#ea80fc'); px(ctx, 14, 10, '#ffffff');
      break;
    case 'chaos_engine':
      rect(ctx, 4, 4, 16, 16, '#d50000');
      rect(ctx, 6, 6, 12, 12, '#b71c1c');
      rect(ctx, 8, 8, 4, 4, '#ffff00'); rect(ctx, 12, 12, 4, 4, '#00e5ff');
      px(ctx, 6, 6, '#76ff03'); px(ctx, 17, 6, '#ff4081');
      px(ctx, 6, 17, '#7c4dff'); px(ctx, 17, 17, '#ffc107');
      break;
    case 'temporal_paradox':
      rect(ctx, 4, 4, 16, 16, '#1a237e');
      rect(ctx, 6, 6, 12, 12, '#283593');
      rect(ctx, 9, 6, 2, 6, '#80deea');
      rect(ctx, 12, 9, 4, 2, '#80deea');
      rect(ctx, 8, 8, 8, 8, '#1565c0');
      px(ctx, 12, 12, '#ffffff'); px(ctx, 10, 10, '#e0f7fa');
      break;
    case 'keplers_heart':
      rect(ctx, 6, 4, 12, 14, '#f50057');
      rect(ctx, 4, 6, 16, 10, '#c51162');
      rect(ctx, 8, 2, 8, 4, '#ff4081');
      rect(ctx, 8, 16, 8, 4, '#880e4f');
      px(ctx, 10, 8, '#ffffff'); px(ctx, 13, 8, '#ffffff');
      px(ctx, 11, 12, '#ff80ab'); px(ctx, 12, 10, '#ffffff');
      break;
    default:
      // Fallback: colored square
      rect(ctx, 4, 4, 16, 16, '#6b7280');
      rect(ctx, 6, 6, 12, 12, '#4b5563');
      rect(ctx, 8, 8, 8, 8, '#9ca3af');
      break;
  }
}

// ─── Projectile Generation ───────────────────────────────────────────────────

function generateProjectile(element: string): HTMLCanvasElement {
  const c = createCanvas(8, 8);
  const ctx = c.getContext('2d')!;

  switch (element) {
    case 'fire':
      rect(ctx, 2, 1, 4, 2, '#ffcc00');
      rect(ctx, 1, 3, 6, 3, '#ff6600');
      rect(ctx, 3, 6, 2, 2, '#ff3300');
      px(ctx, 3, 2, '#ffffff');
      break;
    case 'water':
      rect(ctx, 3, 1, 2, 2, '#80d8ff');
      rect(ctx, 2, 3, 4, 3, '#2196f3');
      rect(ctx, 3, 6, 2, 2, '#0d47a1');
      px(ctx, 3, 2, '#ffffff');
      break;
    case 'ice':
      rect(ctx, 3, 1, 2, 2, '#e0f7fa');
      rect(ctx, 2, 3, 4, 3, '#80deea');
      rect(ctx, 3, 6, 2, 1, '#00bcd4');
      px(ctx, 3, 2, '#ffffff'); px(ctx, 4, 4, '#ffffff');
      break;
    case 'poison':
      rect(ctx, 2, 2, 4, 4, '#388e3c');
      rect(ctx, 3, 1, 2, 1, '#76ff03');
      rect(ctx, 3, 6, 2, 1, '#1b5e20');
      px(ctx, 3, 3, '#76ff03'); px(ctx, 4, 4, '#76ff03');
      break;
    case 'electric':
      rect(ctx, 3, 0, 2, 2, '#ffff00');
      rect(ctx, 2, 2, 4, 2, '#ffc107');
      rect(ctx, 4, 4, 2, 2, '#ffff00');
      rect(ctx, 2, 5, 3, 2, '#ffc107');
      px(ctx, 3, 1, '#ffffff');
      break;
    case 'dark':
      rect(ctx, 2, 2, 4, 4, '#7b1fa2');
      rect(ctx, 3, 1, 2, 1, '#ce93d8');
      rect(ctx, 3, 6, 2, 1, '#4a148c');
      px(ctx, 3, 3, '#ea80fc');
      break;
    default: // normal
      rect(ctx, 3, 1, 2, 6, '#e0e0e0');
      rect(ctx, 2, 2, 4, 4, '#ffffff');
      px(ctx, 3, 2, '#ffffff');
      break;
  }
  return c;
}

// ─── UI Elements ─────────────────────────────────────────────────────────────

function generateHealthBarFrame(): HTMLCanvasElement {
  const c = createCanvas(104, 14);
  const ctx = c.getContext('2d')!;
  // Pixel art border
  rect(ctx, 0, 0, 104, 14, '#374151');
  rect(ctx, 1, 1, 102, 12, '#1f2937');
  rect(ctx, 2, 2, 100, 10, '#111827');
  // Corner accents
  px(ctx, 0, 0, '#6b7280'); px(ctx, 103, 0, '#6b7280');
  px(ctx, 0, 13, '#6b7280'); px(ctx, 103, 13, '#6b7280');
  return c;
}

function generateGoldCoin(): HTMLCanvasElement {
  const c = createCanvas(8, 8);
  const ctx = c.getContext('2d')!;
  rect(ctx, 2, 1, 4, 6, '#ffc107');
  rect(ctx, 1, 2, 6, 4, '#ffc107');
  px(ctx, 1, 1, '#ffb300'); px(ctx, 6, 1, '#ffb300');
  px(ctx, 1, 6, '#ffb300'); px(ctx, 6, 6, '#ffb300');
  rect(ctx, 3, 3, 2, 2, '#ff8f00');
  px(ctx, 3, 2, '#ffe082');
  return c;
}

function generateCardFrame(): HTMLCanvasElement {
  const c = createCanvas(48, 64);
  const ctx = c.getContext('2d')!;
  rect(ctx, 0, 0, 48, 64, '#4f46e5');
  rect(ctx, 1, 1, 46, 62, '#1e1b4b');
  rect(ctx, 2, 2, 44, 60, '#0f0d2e');
  // Corner decorations
  rect(ctx, 2, 2, 4, 4, '#6366f1');
  rect(ctx, 42, 2, 4, 4, '#6366f1');
  rect(ctx, 2, 58, 4, 4, '#6366f1');
  rect(ctx, 42, 58, 4, 4, '#6366f1');
  // Border accent lines
  rect(ctx, 6, 2, 36, 1, '#818cf8');
  rect(ctx, 6, 61, 36, 1, '#818cf8');
  return c;
}

// ─── Background Generation ───────────────────────────────────────────────────

function generateBackground(): HTMLCanvasElement {
  const c = createCanvas(256, 256);
  const ctx = c.getContext('2d')!;

  // Deep space base
  ctx.fillStyle = '#05050e';
  ctx.fillRect(0, 0, 256, 256);

  // Nebula blobs (soft colored regions)
  const nebulae = [
    { x: 60, y: 80, r: 50, color: 'rgba(99,102,241,0.06)' },
    { x: 180, y: 40, r: 40, color: 'rgba(168,85,247,0.05)' },
    { x: 120, y: 200, r: 60, color: 'rgba(20,184,166,0.04)' },
    { x: 220, y: 180, r: 35, color: 'rgba(239,68,68,0.04)' },
  ];
  for (const n of nebulae) {
    for (let i = 0; i < n.r; i += 2) {
      ctx.fillStyle = n.color;
      ctx.fillRect(n.x - i, n.y - i, i * 2, i * 2);
    }
  }

  // Stars - various brightness
  const rng = seedRandom(42);
  for (let i = 0; i < 120; i++) {
    const sx = Math.floor(rng() * 256);
    const sy = Math.floor(rng() * 256);
    const brightness = Math.floor(rng() * 200) + 55;
    const size = rng() > 0.85 ? 2 : 1;
    const hex = brightness.toString(16).padStart(2, '0');
    ctx.fillStyle = `#${hex}${hex}${hex}`;
    ctx.fillRect(sx, sy, size, size);
  }

  // A few colored stars
  for (let i = 0; i < 8; i++) {
    const sx = Math.floor(rng() * 256);
    const sy = Math.floor(rng() * 256);
    const colors = ['#6366f1', '#f472b6', '#22d3ee', '#fbbf24'];
    ctx.fillStyle = colors[i % colors.length];
    ctx.fillRect(sx, sy, 1, 1);
  }

  return c;
}

// ─── Character Sprite Generation ─────────────────────────────────────────────

const CHARACTER_IDS = ['grass_man', 'fire_lord', 'aqua_sage', 'storm_runner', 'void_walker', 'beast_tamer', 'firefighter'];

const CHARACTER_COLORS: Record<string, { main: string; dark: string }> = {
  grass_man:    { main: '#4ade80', dark: '#16a34a' },
  fire_lord:    { main: '#f97316', dark: '#c2410c' },
  aqua_sage:    { main: '#38bdf8', dark: '#0284c7' },
  storm_runner: { main: '#a3e635', dark: '#4d7c0f' },
  void_walker:  { main: '#a855f7', dark: '#7e22ce' },
  beast_tamer:  { main: '#ec4899', dark: '#be185d' },
  firefighter:  { main: '#ef4444', dark: '#b91c1c' },
};

const SKIN      = '#d4a574';
const SKIN_DARK = '#a07850';

function generateCharacterSprite(charId: string): HTMLCanvasElement {
  const c = createCanvas(20, 32);
  const ctx = c.getContext('2d')!;
  const col = CHARACTER_COLORS[charId] || { main: '#9e9e9e', dark: '#616161' };
  const m = col.main;
  const d = col.dark;

  // ── Head (rows 1-6) ─────────────────────────────────────────────────────
  rect(ctx, 6, 1, 8, 6, SKIN);
  // Face shadow
  rect(ctx, 6, 5, 8, 2, SKIN_DARK);
  // Eyes (row 3)
  px(ctx, 8,  3, '#1a1a1a');
  px(ctx, 11, 3, '#1a1a1a');

  // ── Neck (rows 7-8) ─────────────────────────────────────────────────────
  rect(ctx, 8, 7, 4, 2, SKIN_DARK);

  // ── Torso (rows 9-16) ────────────────────────────────────────────────────
  rect(ctx, 5, 9, 10, 8, m);
  rect(ctx, 5, 9, 1, 8, d);   // left shadow
  rect(ctx, 14, 9, 1, 8, d);  // right shadow
  // chest detail
  rect(ctx, 7, 11, 6, 2, d);

  // ── Belt (rows 17-18) ────────────────────────────────────────────────────
  rect(ctx, 5, 17, 10, 2, d);
  px(ctx, 9, 17, '#fbbf24');
  px(ctx, 10, 17, '#fbbf24');

  // ── Left arm (rows 9-18, x 2-4) ─────────────────────────────────────────
  rect(ctx, 2, 9, 3, 9, m);
  rect(ctx, 2, 9, 1, 9, d);
  // left hand
  rect(ctx, 2, 18, 3, 2, SKIN);

  // ── Right arm (rows 9-18, x 15-17) ──────────────────────────────────────
  rect(ctx, 15, 9, 3, 9, m);
  rect(ctx, 17, 9, 1, 9, d);
  // right hand
  rect(ctx, 15, 18, 3, 2, SKIN);

  // ── Legs (rows 19-28) ────────────────────────────────────────────────────
  // left leg
  rect(ctx, 5, 19, 4, 10, m);
  rect(ctx, 5, 19, 1, 10, d);
  // right leg
  rect(ctx, 11, 19, 4, 10, m);
  rect(ctx, 14, 19, 1, 10, d);
  // gap between legs
  rect(ctx, 9, 19, 2, 3, d);

  // ── Feet (rows 29-31) ────────────────────────────────────────────────────
  rect(ctx, 4, 29, 5, 3, d);
  rect(ctx, 11, 29, 5, 3, d);

  // ── Character-specific: hat/hair + weapon ────────────────────────────────
  switch (charId) {
    case 'grass_man':
      // Raiz: leaf crown + improvised wooden staff
      rect(ctx, 5, 0, 10, 2, d);
      rect(ctx, 4, 1, 2, 1, m); rect(ctx, 14, 1, 2, 1, m);
      px(ctx, 9, 0, m); px(ctx, 10, 0, m);
      // Extra leaf points
      px(ctx, 6, 0, '#22c55e'); px(ctx, 13, 0, '#22c55e');
      // Staff (right side, dark wood)
      rect(ctx, 17, 5, 2, 16, '#5d4037');
      rect(ctx, 16, 4, 4, 3, m);
      px(ctx, 15, 5, '#22c55e'); px(ctx, 19, 6, '#22c55e');
      break;

    case 'fire_lord':
      // Cinza: short dark hair, mechanical RIGHT arm (gray metal), flamethrower barrel
      rect(ctx, 6, 0, 8, 2, '#374151'); // dark hair
      // Mechanical right arm — overwrite skin arm with gray metal
      rect(ctx, 15, 9, 3, 10, '#6b7280');   // metal arm
      rect(ctx, 17, 9, 1, 10, '#374151');   // arm shadow
      rect(ctx, 15, 19, 3, 2, '#4b5563');   // metal hand/end
      // Flamethrower barrel extending from right hand
      rect(ctx, 15, 18, 5, 3, '#374151');   // barrel body
      rect(ctx, 19, 19, 1, 2, '#6b7280');   // barrel tip
      // Flame at tip
      px(ctx, 19, 18, '#fbbf24'); px(ctx, 19, 17, '#f97316');
      // Locket on chest (small gold pixel)
      px(ctx, 9, 13, '#fbbf24'); px(ctx, 10, 13, '#fbbf24');
      px(ctx, 9, 14, '#fbbf24'); px(ctx, 10, 14, '#fbbf24');
      break;

    case 'aqua_sage':
      // Maré: military beret + rank stripe, pressurized water cannon
      rect(ctx, 5, 0, 10, 3, d); // beret
      rect(ctx, 5, 1, 10, 2, m);
      px(ctx, 6, 0, d); px(ctx, 13, 0, d); // beret shape
      rect(ctx, 8, 2, 4, 1, '#fbbf24'); // rank stripe on beret
      // Military stripes on torso
      rect(ctx, 6, 10, 3, 1, '#fbbf24'); rect(ctx, 6, 12, 3, 1, '#fbbf24');
      // Pressurized water cannon (right side)
      rect(ctx, 15, 9, 4, 5, '#546e7a');  // cannon body
      rect(ctx, 17, 6, 2, 4, '#546e7a');  // cannon top
      rect(ctx, 17, 5, 2, 2, m);          // nozzle
      rect(ctx, 16, 14, 4, 2, '#374151'); // grip
      break;

    case 'storm_runner':
      // Pulso: HALF alien face (left=skin, right=alien carapace), radioactive glow
      // Overwrite right half of face with alien color (green-olive)
      rect(ctx, 10, 1, 4, 6, '#4d7c0f'); // alien side of face
      px(ctx, 11, 3, '#a3e635');          // alien eye (bright)
      px(ctx, 8, 3, '#1a1a1a');           // human eye stays
      // Alien texture on right head side
      px(ctx, 12, 2, '#a3e635'); px(ctx, 13, 4, '#4ade80');
      px(ctx, 11, 5, '#65a30d');
      // Hair on human left side
      rect(ctx, 6, 0, 5, 2, '#374151');
      // Radioactive energy pulse (right side, no physical weapon)
      rect(ctx, 16, 10, 3, 8, '#a3e635');
      px(ctx, 15, 9, m); px(ctx, 16, 8, '#86efac'); px(ctx, 17, 7, '#4ade80');
      px(ctx, 19, 11, '#fbbf24'); px(ctx, 19, 14, '#fbbf24');
      // Alien carapace continues to right arm
      rect(ctx, 15, 9, 3, 5, '#4d7c0f');
      rect(ctx, 17, 9, 1, 5, '#374151');
      break;

    case 'void_walker':
      // Fenda: scientist look — lab coat (white/light torso), glasses, no weapon
      // Lab coat overwrite on torso
      rect(ctx, 5, 9, 10, 8, '#e5e7eb');
      rect(ctx, 5, 9, 1, 8, '#9ca3af');
      rect(ctx, 14, 9, 1, 8, '#9ca3af');
      rect(ctx, 9, 9, 2, 8, '#d1d5db'); // coat lapels
      // Glasses
      rect(ctx, 7, 3, 2, 2, '#374151');
      rect(ctx, 11, 3, 2, 2, '#374151');
      rect(ctx, 9, 3, 2, 1, '#374151');  // bridge
      px(ctx, 7, 3, '#60a5fa'); px(ctx, 8, 3, '#60a5fa');
      px(ctx, 11, 3, '#60a5fa'); px(ctx, 12, 3, '#60a5fa');
      // Lab coat collar
      rect(ctx, 7, 8, 6, 2, '#f3f4f6');
      // Arms stay in coat color
      rect(ctx, 2, 9, 3, 9, '#e5e7eb');
      rect(ctx, 2, 9, 1, 9, '#9ca3af');
      rect(ctx, 15, 9, 3, 9, '#e5e7eb');
      rect(ctx, 17, 9, 1, 9, '#9ca3af');
      // Void shimmer (random intangibility effect on right side)
      px(ctx, 17, 11, d); px(ctx, 18, 13, d); px(ctx, 16, 15, d);
      px(ctx, 17, 17, d); px(ctx, 19, 12, '#7c3aed');
      break;

    case 'beast_tamer':
      // Nex: practical headband, small alien companion at feet
      rect(ctx, 5, 1, 10, 2, d); // headband
      px(ctx, 8, 1, m); px(ctx, 11, 1, m); // headband gems
      // Small tamed alien creature at feet (left side, tiny 4x5)
      rect(ctx, 0, 24, 4, 5, '#4d7c0f');  // alien body (green)
      px(ctx, 1, 23, '#a3e635');           // alien head
      px(ctx, 0, 25, '#1a1a1a');           // alien eye
      // Chain/leash connecting Nex to alien
      px(ctx, 4, 26, '#fbbf24'); px(ctx, 5, 26, '#fbbf24');
      // Whip in right hand
      rect(ctx, 16, 10, 3, 1, '#5d4037');
      rect(ctx, 17, 11, 2, 1, '#5d4037');
      rect(ctx, 18, 12, 2, 1, '#5d4037');
      rect(ctx, 17, 13, 3, 1, '#5d4037');
      rect(ctx, 18, 14, 1, 2, '#5d4037');
      break;

    case 'firefighter':
      // Fênix: heavy firefighter helmet, axe + foam tank on back
      rect(ctx, 4, 0, 12, 4, d); // helmet body
      rect(ctx, 5, 1, 10, 3, m); // helmet top
      rect(ctx, 4, 3, 12, 1, '#fbbf24'); // visor band
      rect(ctx, 6, 4, 8, 1, '#9ca3af');  // visor glass
      // Foam tank on back (left arm side, protruding)
      rect(ctx, 1, 10, 2, 8, '#ef4444');
      rect(ctx, 0, 11, 1, 6, '#b91c1c');
      // Fire axe (right hand)
      rect(ctx, 17, 9, 2, 14, '#616161'); // handle
      rect(ctx, 14, 7, 5, 4, d);          // axe head dark
      rect(ctx, 14, 7, 3, 4, '#9e9e9e'); // axe blade shine
      break;
  }

  return c;
}

// ─── Leech Enemy Sprite ───────────────────────────────────────────────────────

function generateLeechSprite(): HTMLCanvasElement {
  const c = createCanvas(16, 16);
  const ctx = c.getContext('2d')!;
  const mid = '#a855f7';
  const dark = '#7e22ce';
  const light = '#d8b4fe';

  // Worm body (oval)
  rect(ctx, 2, 5, 12, 7, mid);
  rect(ctx, 1, 6, 14, 5, mid);
  // Rings along body
  rect(ctx, 4, 5, 1, 7, dark);
  rect(ctx, 7, 5, 1, 7, dark);
  rect(ctx, 10, 5, 1, 7, dark);
  // Sucker mouth at left
  rect(ctx, 0, 6, 3, 5, dark);
  rect(ctx, 1, 7, 2, 3, light);
  px(ctx, 1, 8, '#ffffff');
  // Tail at right
  rect(ctx, 13, 7, 2, 3, dark);
  // Eyes on top of body
  px(ctx, 5, 5, '#ff0000');
  px(ctx, 8, 5, '#ff0000');

  return c;
}

/** Simple seeded PRNG for deterministic background */
function seedRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

// ─── Main Sprite Generation ──────────────────────────────────────────────────

const ALL_ITEM_IDS = [
  'basic_gun', 'parrot', 'stutter_box', 'watering_can', 'fire_gun', 'plant_shield',
  'ice_gun', 'lightning_rod', 'poison_dart', 'shotgun', 'sniper', 'missile_launcher',
  'cat', 'owl', 'snake', 'phoenix_egg',
  'amplifier_crystal', 'speed_coil', 'splitter_prism', 'targeting_module',
  'repair_kit', 'gold_magnet', 'armor_plate', 'battery',
  'fertilizer', 'coolant', 'wind_fan', 'lucky_charm', 'void_crystal', 'crown_of_thorns',
  // Items 31-50
  'laser_beam', 'boomerang', 'flamethrower', 'tesla_coil', 'acid_sprayer',
  'dragon_whelp', 'bee_swarm', 'ghost_cat',
  'overclocker', 'echo_chamber', 'ricochet_module', 'elemental_infusion',
  'shield_generator', 'coin_doubler', 'radar_dish', 'medkit', 'scrap_recycler',
  'power_core', 'gravity_well', 'time_dilator',
  // Items 51-100
  'plasma_cannon', 'chain_gun', 'frost_nova', 'solar_beam', 'harpoon_gun',
  'grenade_launcher', 'sound_cannon', 'bone_spear', 'crystal_shard_gun',
  'void_cannon', 'dual_pistols', 'ancient_staff',
  'fire_ant_colony', 'ice_fairy', 'thunder_hawk', 'poison_frog', 'shadow_bat', 'mechanical_bird',
  'scope', 'extended_magazine', 'explosive_rounds', 'vampiric_siphon', 'multi_target_lock',
  'cooldown_reducer', 'elemental_catalyst', 'size_enhancer', 'critical_core', 'momentum_engine',
  'gold_mine', 'magnet_field', 'emergency_repair', 'ammo_box', 'targeting_array',
  'reflection_matrix', 'bio_generator', 'plasma_shield', 'dark_pact', 'soul_collector',
  'overcharge_node', 'ancient_rune', 'explosive_core', 'healing_totem', 'war_banner',
  'nexus_crystal', 'luck_stone', 'heavy_armor', 'phase_shifter', 'berserker_core',
  'golden_egg', 'infinity_stone',
  // Items 101-150
  'railgun', 'frost_turret', 'magma_launcher', 'vine_whip', 'pulse_rifle',
  'thorn_cannon', 'water_cannon', 'shadow_dagger', 'wind_cutter', 'venom_spitter',
  'arcane_orb', 'spider_familiar', 'crystal_golem', 'ember_sprite', 'storm_eagle',
  'damage_booster', 'rapid_fire_module', 'piercing_lens', 'splash_module', 'life_leech',
  'titanium_plating', 'gold_detector', 'adrenaline_injector', 'nano_repair_bot', 'emp_generator',
  'fire_shield', 'poison_cloud_gen', 'mirror_shield', 'quantum_entangler', 'gravity_anchor',
  'scavenger_module', 'overload_capacitor', 'root_network', 'thermal_core', 'cryo_battery',
  'thunder_coil', 'toxic_amplifier', 'pet_treat', 'synergy_prism', 'emergency_shield',
  'chain_lightning_rod', 'acid_rain_gen', 'minigun', 'holy_grail', 'war_horn',
  'merchant_badge', 'alien_core_fragment', 'chaos_engine', 'temporal_paradox', 'keplers_heart',
];

const ENEMY_IDS = [
  'scout', 'grunt', 'tank', 'shooter', 'zigzag', 'swarm', 'shield_bearer', 'bomber',
  'fire_imp', 'ice_golem', 'vine_creep', 'thunder_bug', 'shadow_wraith',
  'boss_drill_sergeant', 'boss_hydra',
  // Enemies 16-25
  'healer', 'teleporter', 'splitter', 'magnetic', 'reflector',
  'spawner', 'berserker', 'ghost_ship', 'acid_blob', 'sentinel',
  // Enemies 26-40
  'frost_archer', 'fire_dancer', 'earth_golem', 'wind_sprite', 'poison_mushroom',
  'crystal_guardian', 'shadow_assassin', 'lava_slime', 'storm_cloud', 'bone_warrior',
  'mimic', 'plague_doctor', 'iron_maiden', 'time_warp', 'boss_swarm_queen',
];

const SHIP_COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b'];

let cachedSprites: SpriteSheet | null = null;

export function generateAllSprites(): SpriteSheet {
  if (cachedSprites) return cachedSprites;

  // Player ships (4 variants)
  const playerShips = SHIP_COLORS.map(c => generatePlayerShip(c));

  // Enemies
  const enemies = new Map<string, HTMLCanvasElement>();
  // Small enemies
  enemies.set('scout', generateSmallEnemy(0, 'normal'));
  enemies.set('swarm', generateSmallEnemy(1, 'normal'));
  enemies.set('zigzag', generateSmallEnemy(2, 'normal'));
  // Medium enemies
  enemies.set('grunt', generateMediumEnemy(0, 'normal'));
  enemies.set('shooter', generateMediumEnemy(1, 'normal'));
  enemies.set('shield_bearer', generateMediumEnemy(2, 'normal'));
  enemies.set('tank', generateMediumEnemy(3, 'normal'));
  // Large enemies
  enemies.set('bomber', generateLargeEnemy(2, 'normal'));
  // Elemental
  enemies.set('fire_imp', generateSmallEnemy(0, 'fire'));
  enemies.set('ice_golem', generateMediumEnemy(2, 'ice'));
  enemies.set('vine_creep', generateSmallEnemy(1, 'grass'));
  enemies.set('thunder_bug', generateSmallEnemy(2, 'electric'));
  enemies.set('shadow_wraith', generateMediumEnemy(3, 'dark'));
  // Bosses
  enemies.set('boss_drill_sergeant', generateBossEnemy(0));
  enemies.set('boss_hydra', generateBossEnemy(1));

  // Enemies 16-25 (existing, using variants)
  enemies.set('healer', generateMediumEnemy(0, 'grass'));
  enemies.set('teleporter', generateSmallEnemy(0, 'electric'));
  enemies.set('splitter', generateMediumEnemy(1, 'normal'));
  enemies.set('magnetic', generateMediumEnemy(2, 'electric'));
  enemies.set('reflector', generateMediumEnemy(3, 'normal'));
  enemies.set('spawner', generateLargeEnemy(0, 'normal'));
  enemies.set('berserker', generateMediumEnemy(0, 'fire'));
  enemies.set('ghost_ship', generateMediumEnemy(3, 'dark'));
  enemies.set('acid_blob', generateSmallEnemy(1, 'poison'));
  enemies.set('sentinel', generateLargeEnemy(1, 'normal'));

  // Enemies 26-40 (new)
  enemies.set('frost_archer', generateMediumEnemy(1, 'ice'));
  enemies.set('fire_dancer', generateSmallEnemy(0, 'fire'));
  enemies.set('earth_golem', generateLargeEnemy(0, 'grass'));
  enemies.set('wind_sprite', generateSmallEnemy(2, 'normal'));
  enemies.set('poison_mushroom', generateSmallEnemy(1, 'poison'));
  enemies.set('crystal_guardian', generateMediumEnemy(2, 'ice'));
  enemies.set('shadow_assassin', generateSmallEnemy(0, 'dark'));
  enemies.set('lava_slime', generateMediumEnemy(0, 'fire'));
  enemies.set('storm_cloud', generateMediumEnemy(3, 'electric'));
  enemies.set('bone_warrior', generateMediumEnemy(1, 'normal'));
  enemies.set('mimic', generateSmallEnemy(1, 'normal'));
  enemies.set('plague_doctor', generateMediumEnemy(2, 'poison'));
  enemies.set('iron_maiden', generateLargeEnemy(1, 'normal'));
  enemies.set('time_warp', generateMediumEnemy(3, 'dark'));
  enemies.set('boss_swarm_queen', generateBossEnemy(1));

  // Item icons
  const items = new Map<string, HTMLCanvasElement>();
  for (const id of ALL_ITEM_IDS) {
    items.set(id, generateItemIcon(id));
  }

  // Projectiles
  const projectiles = new Map<string, HTMLCanvasElement>();
  const elements = ['fire', 'water', 'ice', 'poison', 'electric', 'dark', 'normal'];
  for (const el of elements) {
    projectiles.set(el, generateProjectile(el));
  }

  // UI elements
  const ui = new Map<string, HTMLCanvasElement>();
  ui.set('health_bar_frame', generateHealthBarFrame());
  ui.set('gold_coin', generateGoldCoin());
  ui.set('card_frame', generateCardFrame());

  // Background
  const background = generateBackground();

  // Characters
  const characters = new Map<string, HTMLCanvasElement>();
  for (const id of CHARACTER_IDS) {
    characters.set(id, generateCharacterSprite(id));
  }

  // Leech enemy
  enemies.set('leech', generateLeechSprite());

  cachedSprites = { playerShips, enemies, items, projectiles, ui, background, characters };
  return cachedSprites;
}
