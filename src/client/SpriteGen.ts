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

// ─── Player Top-Down Character Generation ────────────────────────────────────

const TD_SKIN      = '#d4a574';
const TD_SKIN_DARK = '#a07850';

function generatePlayerTopDown(charId: string): HTMLCanvasElement {
  const c = createCanvas(32, 32);
  const ctx = c.getContext('2d')!;

  switch (charId) {
    case 'grass_man': {
      // Raiz — earthy rags, wooden staff pointing up
      rect(ctx, 15, 0, 2, 6, '#5d4037'); // staff shaft
      rect(ctx, 13, 0, 6, 2, '#4ade80'); // staff tip leaves
      px(ctx, 12, 1, '#22c55e'); px(ctx, 19, 1, '#22c55e');
      // Head
      rect(ctx, 12, 6, 8, 6, TD_SKIN);
      rect(ctx, 12, 6, 8, 2, '#3b1f0a'); // dark brown hair
      px(ctx, 13, 9, '#1a1a1a'); px(ctx, 18, 9, '#1a1a1a');
      // Shoulders + arms
      rect(ctx, 8, 12, 16, 4, '#4a5e2a');
      rect(ctx, 5, 13, 5, 6, TD_SKIN); rect(ctx, 22, 13, 5, 6, TD_SKIN);
      rect(ctx, 5, 18, 4, 2, '#3b2510'); rect(ctx, 23, 18, 4, 2, '#3b2510');
      // Torso
      rect(ctx, 11, 16, 10, 7, '#3d5a1e');
      rect(ctx, 13, 17, 6, 5, '#4a6b25');
      rect(ctx, 14, 18, 4, 3, '#2d4015');
      // Hips + legs
      rect(ctx, 10, 23, 12, 3, '#3b2510');
      rect(ctx, 10, 26, 5, 5, '#2d4015'); rect(ctx, 17, 26, 5, 5, '#2d4015');
      rect(ctx, 9, 29, 6, 3, '#1a0f05'); rect(ctx, 17, 29, 6, 3, '#1a0f05');
      break;
    }
    case 'fire_lord': {
      // Cinza — dark jacket, mechanical right arm, flamethrower above
      rect(ctx, 18, 0, 3, 8, '#374151'); // flamethrower barrel
      rect(ctx, 16, 0, 6, 2, '#4b5563');
      px(ctx, 20, 0, '#f97316'); px(ctx, 21, 0, '#fbbf24');
      // Head
      rect(ctx, 12, 7, 8, 5, TD_SKIN);
      rect(ctx, 12, 7, 8, 2, '#1f2937'); // short dark hair
      px(ctx, 13, 10, '#1a1a1a'); px(ctx, 18, 10, '#1a1a1a');
      // Left arm (skin)
      rect(ctx, 6, 13, 5, 7, TD_SKIN); rect(ctx, 6, 19, 4, 2, TD_SKIN_DARK);
      // Right arm (mechanical)
      rect(ctx, 21, 11, 5, 9, '#6b7280'); rect(ctx, 22, 11, 3, 9, '#9ca3af');
      rect(ctx, 21, 19, 5, 2, '#374151');
      // Shoulders
      rect(ctx, 9, 12, 14, 4, '#374151');
      // Torso
      rect(ctx, 11, 16, 10, 7, '#1f2937');
      rect(ctx, 13, 17, 6, 5, '#374151');
      rect(ctx, 14, 18, 4, 3, '#4b5563');
      // Legs
      rect(ctx, 10, 23, 12, 3, '#111827');
      rect(ctx, 10, 26, 5, 5, '#1f2937'); rect(ctx, 17, 26, 5, 5, '#1f2937');
      rect(ctx, 9, 29, 6, 3, '#0f172a'); rect(ctx, 17, 29, 6, 3, '#0f172a');
      break;
    }
    case 'aqua_sage': {
      // Maré — navy military uniform, beret, water cannon
      rect(ctx, 14, 0, 4, 7, '#546e7a'); // water cannon
      rect(ctx, 13, 0, 6, 2, '#78909c');
      rect(ctx, 15, 0, 2, 1, '#80d8ff');
      // Head + beret
      rect(ctx, 11, 5, 10, 3, '#1e3a5f'); rect(ctx, 10, 6, 12, 2, '#1565c0');
      rect(ctx, 13, 8, 6, 4, TD_SKIN);
      rect(ctx, 14, 6, 4, 1, '#fbbf24'); // rank stripe on beret
      px(ctx, 14, 10, '#1a1a1a'); px(ctx, 18, 10, '#1a1a1a');
      // Arms
      rect(ctx, 6, 13, 5, 7, '#1e3a5f'); rect(ctx, 21, 13, 5, 7, '#1e3a5f');
      rect(ctx, 6, 19, 4, 2, TD_SKIN); rect(ctx, 22, 19, 4, 2, TD_SKIN);
      rect(ctx, 9, 12, 14, 4, '#1e3a5f');
      // Torso
      rect(ctx, 11, 16, 10, 7, '#1e3a5f');
      rect(ctx, 13, 17, 6, 5, '#1565c0');
      rect(ctx, 13, 17, 3, 2, '#fbbf24');
      // Legs
      rect(ctx, 10, 23, 12, 3, '#0d2340');
      rect(ctx, 10, 26, 5, 5, '#1e3a5f'); rect(ctx, 17, 26, 5, 5, '#1e3a5f');
      rect(ctx, 9, 29, 6, 3, '#0d1a2e'); rect(ctx, 17, 29, 6, 3, '#0d1a2e');
      break;
    }
    case 'storm_runner': {
      // Pulso — half alien, torn lab coat, energy hands
      rect(ctx, 7, 0, 4, 5, '#a3e635'); // energy glow left
      px(ctx, 7, 0, '#86efac'); px(ctx, 10, 1, '#fbbf24');
      // Head (left = skin, right = alien)
      rect(ctx, 11, 6, 5, 6, TD_SKIN);
      rect(ctx, 16, 6, 5, 6, '#4d7c0f');
      rect(ctx, 11, 6, 5, 2, '#374151'); // human hair
      rect(ctx, 16, 6, 5, 2, '#3a5e09'); // alien carapace
      px(ctx, 13, 9, '#1a1a1a'); px(ctx, 18, 9, '#a3e635'); // human / alien eye
      // Shoulders
      rect(ctx, 9, 12, 6, 4, '#e5e7eb'); rect(ctx, 17, 12, 6, 4, '#4d7c0f');
      // Arms
      rect(ctx, 6, 13, 5, 7, '#e5e7eb'); rect(ctx, 21, 13, 5, 7, '#4d7c0f');
      rect(ctx, 6, 19, 4, 3, '#a3e635'); rect(ctx, 22, 19, 4, 3, '#65a30d');
      // Torso
      rect(ctx, 11, 16, 10, 7, '#e5e7eb');
      rect(ctx, 13, 17, 6, 5, '#f3f4f6');
      rect(ctx, 14, 18, 4, 3, '#d1d5db');
      px(ctx, 15, 19, '#a3e635'); px(ctx, 16, 20, '#86efac');
      // Legs
      rect(ctx, 10, 23, 12, 3, '#9ca3af');
      rect(ctx, 10, 26, 5, 5, '#6b7280'); rect(ctx, 17, 26, 5, 5, '#6b7280');
      rect(ctx, 9, 29, 6, 3, '#374151'); rect(ctx, 17, 29, 6, 3, '#374151');
      break;
    }
    case 'void_walker': {
      // Fenda — white lab coat, glasses, purple shimmer
      px(ctx, 14, 2, '#a855f7'); px(ctx, 16, 1, '#c084fc');
      px(ctx, 18, 3, '#7c3aed'); px(ctx, 12, 3, '#a855f7');
      // Head
      rect(ctx, 12, 6, 8, 6, TD_SKIN);
      rect(ctx, 12, 6, 8, 2, '#5c3d1a'); // messy brown hair
      px(ctx, 12, 7, '#7c5030'); px(ctx, 19, 7, '#7c5030');
      // Glasses
      rect(ctx, 12, 9, 3, 2, '#374151'); rect(ctx, 17, 9, 3, 2, '#374151');
      rect(ctx, 15, 9, 2, 1, '#374151');
      px(ctx, 12, 9, '#60a5fa'); px(ctx, 13, 9, '#93c5fd');
      px(ctx, 17, 9, '#60a5fa'); px(ctx, 18, 9, '#93c5fd');
      // Shoulders + arms
      rect(ctx, 9, 12, 14, 4, '#f3f4f6');
      rect(ctx, 6, 13, 5, 7, '#f3f4f6'); rect(ctx, 21, 13, 5, 7, '#f3f4f6');
      rect(ctx, 6, 19, 4, 2, TD_SKIN); rect(ctx, 22, 19, 4, 2, TD_SKIN);
      // Torso
      rect(ctx, 11, 16, 10, 7, '#f3f4f6');
      rect(ctx, 13, 17, 6, 5, '#ffffff');
      rect(ctx, 9, 16, 2, 7, '#9ca3af'); rect(ctx, 21, 16, 2, 7, '#9ca3af');
      // Purple shimmer
      px(ctx, 8, 14, '#a855f7'); px(ctx, 23, 16, '#c084fc');
      px(ctx, 9, 20, '#7c3aed'); px(ctx, 22, 22, '#a855f7');
      // Legs
      rect(ctx, 10, 23, 12, 3, '#d1d5db');
      rect(ctx, 10, 26, 5, 5, '#9ca3af'); rect(ctx, 17, 26, 5, 5, '#9ca3af');
      rect(ctx, 9, 29, 6, 3, '#4b5563'); rect(ctx, 17, 29, 6, 3, '#4b5563');
      break;
    }
    case 'beast_tamer': {
      // Nex — tactical vest, ponytail, whip up, small alien ahead
      rect(ctx, 13, 0, 6, 5, '#4d7c0f'); // alien companion
      px(ctx, 14, 0, '#a3e635'); px(ctx, 18, 0, '#a3e635');
      rect(ctx, 12, 2, 2, 2, '#3a5e09'); rect(ctx, 18, 2, 2, 2, '#3a5e09');
      // Whip
      px(ctx, 20, 4, '#5d4037'); px(ctx, 21, 5, '#5d4037');
      px(ctx, 22, 5, '#5d4037'); px(ctx, 23, 6, '#5d4037');
      // Head
      rect(ctx, 12, 6, 8, 6, TD_SKIN);
      rect(ctx, 12, 6, 8, 2, '#ec4899'); // dark pink hair
      rect(ctx, 20, 6, 3, 7, '#be185d'); // ponytail right
      px(ctx, 13, 9, '#1a1a1a'); px(ctx, 18, 9, '#1a1a1a');
      // Arms
      rect(ctx, 9, 12, 14, 4, '#374151');
      rect(ctx, 6, 13, 5, 7, TD_SKIN); rect(ctx, 21, 13, 5, 7, TD_SKIN);
      rect(ctx, 6, 19, 4, 2, TD_SKIN_DARK); rect(ctx, 22, 19, 4, 2, TD_SKIN_DARK);
      // Torso
      rect(ctx, 11, 16, 10, 7, '#374151');
      rect(ctx, 13, 17, 6, 5, '#4b5563');
      rect(ctx, 14, 18, 4, 3, '#ec4899');
      rect(ctx, 13, 16, 2, 2, '#ec4899'); rect(ctx, 17, 16, 2, 2, '#ec4899');
      // Legs
      rect(ctx, 10, 23, 12, 3, '#1f2937');
      rect(ctx, 10, 26, 5, 5, '#374151'); rect(ctx, 17, 26, 5, 5, '#374151');
      rect(ctx, 9, 29, 6, 3, '#111827'); rect(ctx, 17, 29, 6, 3, '#111827');
      break;
    }
    case 'firefighter': {
      // Fênix — heavy helmet, fire axe up, foam tank hump, red gear
      rect(ctx, 14, 0, 2, 8, '#9e9e9e'); // axe handle
      rect(ctx, 11, 0, 6, 3, '#ef4444'); // axe head
      rect(ctx, 11, 0, 3, 3, '#bdbdbd');
      // Head + helmet
      rect(ctx, 10, 5, 12, 7, '#ef4444');
      rect(ctx, 9, 6, 14, 5, '#fbbf24');
      rect(ctx, 11, 8, 10, 4, '#374151'); // visor
      rect(ctx, 12, 8, 8, 3, '#60a5fa');
      // Foam tank hump
      rect(ctx, 8, 12, 4, 6, '#dc2626'); rect(ctx, 7, 13, 3, 4, '#b91c1c');
      // Shoulders
      rect(ctx, 9, 12, 14, 4, '#7f1d1d');
      rect(ctx, 8, 12, 3, 5, '#991b1b'); rect(ctx, 21, 12, 3, 5, '#991b1b');
      // Arms
      rect(ctx, 6, 15, 5, 6, '#7f1d1d'); rect(ctx, 21, 15, 5, 6, '#7f1d1d');
      rect(ctx, 6, 20, 4, 2, '#374151'); rect(ctx, 22, 20, 4, 2, '#374151');
      // Torso
      rect(ctx, 11, 16, 10, 7, '#7f1d1d');
      rect(ctx, 13, 17, 6, 5, '#991b1b');
      rect(ctx, 14, 18, 4, 3, '#fbbf24'); // safety stripe
      // Legs
      rect(ctx, 10, 23, 12, 3, '#450a0a');
      rect(ctx, 10, 26, 5, 5, '#7f1d1d'); rect(ctx, 17, 26, 5, 5, '#7f1d1d');
      rect(ctx, 9, 29, 6, 3, '#1c0a0a'); rect(ctx, 17, 29, 6, 3, '#1c0a0a');
      break;
    }
    default: {
      rect(ctx, 12, 6, 8, 6, '#374151');
      rect(ctx, 11, 7, 10, 5, TD_SKIN);
      rect(ctx, 9, 12, 14, 4, '#6b7280');
      rect(ctx, 6, 13, 5, 7, TD_SKIN); rect(ctx, 21, 13, 5, 7, TD_SKIN);
      rect(ctx, 11, 16, 10, 7, '#4b5563');
      rect(ctx, 10, 23, 12, 9, '#374151');
      break;
    }
  }

  return c;
}

/** Backward-compat alias */
function generatePlayerShip(_baseColor: string): HTMLCanvasElement {
  return generatePlayerTopDown('grass_man');
}

// ─── Enemy Generation ────────────────────────────────────────────────────────

function generateSmallEnemy(variant: number, element: string): HTMLCanvasElement {
  const c = createCanvas(16, 16);
  const ctx = c.getContext('2d')!;
  const col = ELEMENT_COLORS[element] || ELEMENT_COLORS.normal;

  switch (variant) {
    case 0: // Scout — fast dart-shaped insectoid alien
      // Curved streamlined body
      rect(ctx, 6, 1, 4, 3, col.light);   // head point
      rect(ctx, 5, 4, 6, 4, col.mid);      // upper body
      rect(ctx, 4, 8, 8, 4, col.mid);      // lower body
      rect(ctx, 3, 10, 10, 2, col.dark);   // widest point
      // Wing nubs
      rect(ctx, 1, 7, 3, 3, col.dark); rect(ctx, 12, 7, 3, 3, col.dark);
      // Glowing eyes
      px(ctx, 6, 5, '#ffffff'); px(ctx, 9, 5, '#ffffff');
      px(ctx, 6, 6, col.light); px(ctx, 9, 6, col.light);
      // Tail/thruster
      rect(ctx, 6, 12, 4, 3, col.dark);
      px(ctx, 7, 14, col.light); px(ctx, 8, 15, col.light);
      break;
    case 1: // Swarm — round bug alien, 4 legs, glowing back
      rect(ctx, 5, 4, 6, 7, col.mid);      // round body
      rect(ctx, 4, 5, 8, 5, col.mid);
      rect(ctx, 6, 3, 4, 2, col.dark);     // head carapace
      // Antenna
      px(ctx, 7, 2, col.mid); px(ctx, 6, 1, col.mid);
      px(ctx, 8, 2, col.mid); px(ctx, 9, 1, col.mid);
      // 4 legs
      rect(ctx, 2, 7, 3, 1, col.dark); rect(ctx, 11, 7, 3, 1, col.dark);
      rect(ctx, 2, 9, 3, 1, col.dark); rect(ctx, 11, 9, 3, 1, col.dark);
      px(ctx, 1, 8, col.dark); px(ctx, 14, 8, col.dark);
      // Eyes
      px(ctx, 6, 5, '#ff4444'); px(ctx, 9, 5, '#ff4444');
      // Glowing spot on back
      rect(ctx, 7, 7, 2, 2, col.light);
      px(ctx, 7, 7, '#ffffff');
      break;
    default: // Zigzag — worm-like segmented alien
      // Segmented body
      rect(ctx, 5, 1, 6, 3, col.mid);      // head
      rect(ctx, 4, 4, 8, 2, col.dark);     // segment 1
      rect(ctx, 3, 6, 10, 2, col.mid);     // segment 2
      rect(ctx, 4, 8, 8, 2, col.dark);     // segment 3
      rect(ctx, 5, 10, 6, 2, col.mid);     // segment 4
      rect(ctx, 6, 12, 4, 3, col.dark);    // tail
      // Fang mouth at bottom (toward player)
      px(ctx, 6, 3, col.light); px(ctx, 9, 3, col.light); // eyes
      rect(ctx, 5, 1, 2, 1, col.light); rect(ctx, 9, 1, 2, 1, col.light); // fangs
      // Side frills on segments
      px(ctx, 2, 7, col.light); px(ctx, 13, 7, col.light);
      break;
  }
  return c;
}

function generateMediumEnemy(variant: number, element: string): HTMLCanvasElement {
  const c = createCanvas(24, 24);
  const ctx = c.getContext('2d')!;
  const col = ELEMENT_COLORS[element] || ELEMENT_COLORS.normal;

  switch (variant) {
    case 0: // Grunt — upright bipedal alien, wide head, 3 eyes, claws
      rect(ctx, 7, 1, 10, 5, col.dark);    // wide alien head
      rect(ctx, 6, 2, 12, 4, col.mid);
      // 3 eyes
      px(ctx, 8, 3, '#ff2020'); px(ctx, 12, 3, '#ff2020'); px(ctx, 16, 3, '#ff2020');
      rect(ctx, 6, 6, 12, 8, col.mid);     // torso
      rect(ctx, 4, 7, 3, 6, col.dark);     // left arm
      rect(ctx, 17, 7, 3, 6, col.dark);    // right arm
      // Claws
      px(ctx, 3, 12, col.light); px(ctx, 4, 13, col.light);
      px(ctx, 20, 12, col.light); px(ctx, 19, 13, col.light);
      // Alien armor plates on torso
      rect(ctx, 8, 7, 8, 2, col.light);
      rect(ctx, 7, 10, 10, 2, shade(col.mid, 0.8));
      rect(ctx, 6, 14, 12, 6, col.mid);    // lower body
      rect(ctx, 7, 20, 4, 3, col.dark); rect(ctx, 13, 20, 4, 3, col.dark); // legs
      break;
    case 1: // Shooter — alien with oversized cannon arm pointing DOWN, single large eye
      rect(ctx, 8, 2, 8, 6, col.mid);      // head
      rect(ctx, 9, 2, 6, 4, col.dark);
      // Single large eye
      rect(ctx, 10, 3, 4, 3, col.light);
      px(ctx, 11, 4, '#ff0000'); px(ctx, 12, 4, '#660000');
      rect(ctx, 6, 8, 12, 7, col.mid);     // body
      // Cannon arm on right (pointing DOWN — toward player)
      rect(ctx, 17, 6, 5, 4, col.dark);    // cannon shoulder
      rect(ctx, 18, 10, 4, 9, col.dark);   // cannon barrel downward
      rect(ctx, 19, 18, 2, 3, col.light);  // barrel tip glow
      // Left arm (normal)
      rect(ctx, 3, 8, 3, 6, col.mid);
      rect(ctx, 6, 15, 12, 5, col.dark);   // lower body
      rect(ctx, 8, 20, 3, 3, col.mid); rect(ctx, 13, 20, 3, 3, col.mid);
      break;
    case 2: // Armored — carapace plates, 2 red eyes behind visor
      // Head with visor
      rect(ctx, 6, 1, 12, 4, col.dark);
      rect(ctx, 5, 2, 14, 4, col.mid);
      // Visor slit
      rect(ctx, 6, 3, 12, 2, shade(col.dark, 0.5));
      px(ctx, 8, 3, '#ff0000'); px(ctx, 14, 3, '#ff0000'); // eyes behind visor
      // Heavy carapace body
      rect(ctx, 4, 5, 16, 10, col.mid);
      rect(ctx, 2, 7, 20, 6, col.dark);    // main carapace plate
      rect(ctx, 3, 8, 18, 4, col.mid);     // plate highlight
      rect(ctx, 6, 15, 12, 6, col.mid);    // lower body
      // Thick arms
      rect(ctx, 1, 8, 3, 7, col.dark); rect(ctx, 20, 8, 3, 7, col.dark);
      rect(ctx, 8, 21, 3, 2, col.dark); rect(ctx, 13, 21, 3, 2, col.dark);
      // Armor ridge on chest
      rect(ctx, 8, 10, 8, 1, col.light);
      break;
    default: // Fast — sleek insectoid, 4 limbs, streamlined, 2 yellow eyes
      // Streamlined head
      rect(ctx, 9, 1, 6, 4, col.light);
      rect(ctx, 8, 2, 8, 3, col.mid);
      px(ctx, 9, 3, '#ffff00'); px(ctx, 14, 3, '#ffff00'); // yellow eyes
      // Sleek body
      rect(ctx, 7, 5, 10, 7, col.mid);
      rect(ctx, 8, 5, 8, 7, col.dark);
      // 4 limbs (2 pairs)
      rect(ctx, 3, 6, 4, 2, col.mid); rect(ctx, 17, 6, 4, 2, col.mid);
      rect(ctx, 2, 8, 5, 2, col.dark); rect(ctx, 17, 8, 5, 2, col.dark);
      rect(ctx, 5, 12, 3, 4, col.mid); rect(ctx, 16, 12, 3, 4, col.mid);
      rect(ctx, 3, 14, 5, 2, col.dark); rect(ctx, 16, 14, 5, 2, col.dark);
      // Tail
      rect(ctx, 9, 12, 6, 8, col.mid);
      rect(ctx, 10, 18, 4, 3, col.dark);
      break;
  }
  return c;
}

function generateLargeEnemy(variant: number, element: string): HTMLCanvasElement {
  const c = createCanvas(32, 32);
  const ctx = c.getContext('2d')!;
  const col = ELEMENT_COLORS[element] || ELEMENT_COLORS.normal;

  switch (variant) {
    case 0: // Tank — massive blocky alien, 4 arms, 3 red eyes, thick carapace
      // Massive head
      rect(ctx, 8, 1, 16, 7, col.dark);
      rect(ctx, 7, 2, 18, 6, col.mid);
      // 3 red eyes (vertical pair center + 1 above)
      px(ctx, 13, 3, '#ff0000'); px(ctx, 14, 3, '#ff0000');
      px(ctx, 17, 3, '#ff0000'); px(ctx, 18, 3, '#ff0000');
      px(ctx, 15, 2, '#ff4400'); // top eye
      // Thick armored body
      rect(ctx, 5, 8, 22, 12, col.mid);
      rect(ctx, 4, 9, 24, 10, col.dark);
      rect(ctx, 5, 10, 22, 8, col.mid);
      // Carapace ridges
      rect(ctx, 6, 12, 20, 2, col.light);
      rect(ctx, 7, 15, 18, 2, shade(col.mid, 0.8));
      // 4 arms
      rect(ctx, 1, 8, 4, 5, col.dark); rect(ctx, 27, 8, 4, 5, col.dark);  // upper arms
      rect(ctx, 0, 13, 4, 5, col.mid); rect(ctx, 28, 13, 4, 5, col.mid);  // lower arms
      px(ctx, 0, 17, col.light); px(ctx, 3, 18, col.light);  // left claws
      px(ctx, 31, 17, col.light); px(ctx, 28, 18, col.light); // right claws
      // Legs
      rect(ctx, 6, 20, 8, 10, col.dark); rect(ctx, 18, 20, 8, 10, col.dark);
      rect(ctx, 5, 27, 9, 4, col.mid); rect(ctx, 18, 27, 9, 4, col.mid);
      break;
    case 1: // Shield Bearer — alien with chitin shield appendage
      // Body
      rect(ctx, 9, 8, 14, 12, col.mid);
      rect(ctx, 8, 9, 16, 10, col.dark);
      rect(ctx, 10, 10, 12, 8, col.mid);
      // Head
      rect(ctx, 10, 2, 12, 7, col.dark);
      rect(ctx, 11, 3, 10, 5, col.mid);
      // Single glowing eye (big)
      rect(ctx, 13, 4, 6, 3, col.light);
      px(ctx, 14, 5, '#44ffff'); px(ctx, 15, 5, '#ffffff'); px(ctx, 17, 5, '#44ffff');
      // Shield appendage (semicircle of hardened chitin in front/above)
      rect(ctx, 3, 1, 26, 8, shade(col.dark, 0.6)); // shield body
      rect(ctx, 2, 3, 28, 5, shade(col.mid, 0.7));  // shield face
      rect(ctx, 3, 2, 26, 2, col.light);             // shield highlight
      // Arms holding shield
      rect(ctx, 6, 8, 4, 4, col.dark); rect(ctx, 22, 8, 4, 4, col.dark);
      // Legs
      rect(ctx, 9, 20, 5, 10, col.dark); rect(ctx, 18, 20, 5, 10, col.dark);
      rect(ctx, 8, 27, 6, 4, col.mid); rect(ctx, 18, 27, 6, 4, col.mid);
      break;
    default: // Bomber — swollen round alien, glowing core visible through skin
      // Swollen round body
      rect(ctx, 7, 6, 18, 18, col.mid);
      rect(ctx, 5, 8, 22, 14, col.mid);
      rect(ctx, 6, 7, 20, 16, col.dark);
      // Glowing core visible through skin
      rect(ctx, 11, 12, 10, 8, shade(col.mid, 1.3));
      rect(ctx, 13, 14, 6, 4, col.light);
      px(ctx, 14, 15, '#ffffff'); px(ctx, 15, 15, '#ffffff');
      // Eyes (2)
      px(ctx, 11, 9, '#ff6600'); px(ctx, 19, 9, '#ff6600');
      // Tendrils
      rect(ctx, 2, 12, 4, 2, col.dark); rect(ctx, 26, 12, 4, 2, col.dark);
      rect(ctx, 1, 14, 3, 2, col.mid); rect(ctx, 28, 14, 3, 2, col.mid);
      rect(ctx, 3, 10, 2, 3, col.dark); rect(ctx, 27, 10, 2, 3, col.dark);
      // Head
      rect(ctx, 10, 2, 12, 6, col.dark);
      rect(ctx, 11, 3, 10, 4, col.mid);
      px(ctx, 13, 4, col.light); px(ctx, 18, 4, col.light); // small eyes
      break;
  }
  return c;
}

function generateBossEnemy(variant: number): HTMLCanvasElement {
  const c = createCanvas(48, 48);
  const ctx = c.getContext('2d')!;

  if (variant === 0) {
    // Drill Sergeant — alien COMMANDER, 4 arms, 4 glowing red eyes (vertical pairs), energy blades
    const col = ELEMENT_COLORS.normal;
    // Imposing head with alien glyphs
    rect(ctx, 14, 2, 20, 10, col.dark);
    rect(ctx, 12, 3, 24, 9, col.mid);
    // 4 red eyes in vertical pairs
    rect(ctx, 16, 4, 3, 3, '#ff0000'); rect(ctx, 29, 4, 3, 3, '#ff0000');
    px(ctx, 16, 4, '#ff8800'); px(ctx, 29, 4, '#ff8800');    // glow inner
    rect(ctx, 17, 7, 3, 3, '#ff0000'); rect(ctx, 28, 7, 3, 3, '#ff0000');
    px(ctx, 17, 7, '#ff8800'); px(ctx, 28, 7, '#ff8800');
    // Alien glyph marks on head
    px(ctx, 20, 4, col.light); px(ctx, 21, 6, col.light); px(ctx, 22, 4, col.light);
    px(ctx, 25, 4, col.light); px(ctx, 26, 6, col.light); px(ctx, 27, 4, col.light);
    // Armored body
    rect(ctx, 10, 12, 28, 18, col.mid);
    rect(ctx, 8, 14, 32, 14, col.dark);
    rect(ctx, 10, 15, 28, 12, col.mid);
    // Armor glyphs on chest
    rect(ctx, 14, 18, 20, 2, col.light);
    rect(ctx, 16, 21, 16, 2, shade(col.mid, 1.4));
    rect(ctx, 18, 24, 12, 2, col.light);
    // 4 arms (2 pairs)
    rect(ctx, 2, 12, 6, 8, col.dark); rect(ctx, 40, 12, 6, 8, col.dark);
    rect(ctx, 1, 20, 6, 6, col.mid); rect(ctx, 41, 20, 6, 6, col.mid);
    // Twin energy blades (raised)
    rect(ctx, 3, 2, 3, 12, '#6366f1'); // left blade
    rect(ctx, 4, 1, 1, 13, '#a5b4fc'); // left blade shine
    rect(ctx, 42, 2, 3, 12, '#6366f1'); // right blade
    rect(ctx, 42, 1, 1, 13, '#a5b4fc');
    // Lower body
    rect(ctx, 12, 30, 24, 10, col.dark);
    rect(ctx, 14, 40, 8, 7, col.mid); rect(ctx, 26, 40, 8, 7, col.mid); // legs
  } else {
    // Hydra — alien HIVE QUEEN, 3 tentacle-neck heads, claws, purple eyes, egg sacs
    const col = ELEMENT_COLORS.dark;
    // Massive main body
    rect(ctx, 10, 26, 28, 16, col.mid);
    rect(ctx, 8, 28, 32, 14, col.dark);
    rect(ctx, 10, 29, 28, 12, col.mid);
    // Egg sacs on sides
    rect(ctx, 2, 30, 8, 8, shade(col.mid, 0.9));
    rect(ctx, 38, 30, 8, 8, shade(col.mid, 0.9));
    px(ctx, 4, 34, col.light); px(ctx, 41, 34, col.light);
    // Claws
    px(ctx, 0, 32, col.light); px(ctx, 1, 33, col.light); px(ctx, 0, 35, col.light);
    px(ctx, 47, 32, col.light); px(ctx, 46, 33, col.light); px(ctx, 47, 35, col.light);
    // Left tentacle neck + head
    rect(ctx, 4, 16, 8, 8, col.dark);   // neck
    rect(ctx, 2, 6, 12, 11, col.mid);   // head
    rect(ctx, 3, 5, 10, 6, col.dark);   // head carapace
    px(ctx, 5, 8, '#cc44ff'); px(ctx, 5, 9, '#8800cc'); // purple eye left
    px(ctx, 11, 8, '#cc44ff'); px(ctx, 11, 9, '#8800cc');
    rect(ctx, 4, 14, 6, 2, col.mid);    // fang open
    // Center tentacle neck + head
    rect(ctx, 20, 10, 8, 16, col.dark); // neck center
    rect(ctx, 16, 1, 16, 11, col.mid);  // center head
    rect(ctx, 17, 0, 14, 6, col.dark);
    px(ctx, 19, 4, '#cc44ff'); px(ctx, 20, 5, '#ffffff'); // eye
    px(ctx, 27, 4, '#cc44ff'); px(ctx, 26, 5, '#ffffff');
    rect(ctx, 19, 1, 10, 1, col.light); // crest
    // Right tentacle neck + head
    rect(ctx, 36, 16, 8, 8, col.dark);  // neck
    rect(ctx, 34, 6, 12, 11, col.mid);  // head
    rect(ctx, 35, 5, 10, 6, col.dark);
    px(ctx, 37, 8, '#cc44ff'); px(ctx, 37, 9, '#8800cc');
    px(ctx, 43, 8, '#cc44ff'); px(ctx, 43, 9, '#8800cc');
    rect(ctx, 38, 14, 6, 2, col.mid);   // fang
  }
  return c;
}

// ─── Item Icon Generation ────────────────────────────────────────────────────

function generateItemIcon(itemId: string): HTMLCanvasElement {
  const c = createCanvas(24, 24);
  const ctx = c.getContext('2d')!;

  switch (itemId) {
    case 'basic_gun':
      // Side-view pistol silhouette
      rect(ctx, 4, 10, 16, 5, '#9e9e9e'); // barrel + body
      rect(ctx, 14, 7, 6, 8, '#757575'); // slide/chamber
      rect(ctx, 5, 14, 6, 7, '#616161'); // grip
      rect(ctx, 14, 7, 6, 3, '#9e9e9e'); // top of slide
      px(ctx, 14, 8, '#bdbdbd'); px(ctx, 15, 8, '#bdbdbd'); // sight
      rect(ctx, 4, 10, 10, 2, '#bdbdbd'); // barrel highlight
      break;
    case 'fire_gun':
      // Flamethrower / fire pistol
      rect(ctx, 3, 10, 17, 5, '#e64a19');
      rect(ctx, 14, 7, 6, 8, '#bf360c');
      rect(ctx, 5, 14, 6, 7, '#8b2500');
      rect(ctx, 3, 10, 11, 2, '#ff6e40');
      // Flame at muzzle
      px(ctx, 2, 9, '#ffcc00'); px(ctx, 1, 10, '#ffab40');
      px(ctx, 2, 11, '#ff6e40'); px(ctx, 1, 12, '#e64a19');
      px(ctx, 14, 8, '#ff6e40'); px(ctx, 15, 8, '#ffcc00');
      break;
    case 'ice_gun':
      // Ice rifle with crystal accents
      rect(ctx, 3, 10, 17, 5, '#2196f3');
      rect(ctx, 14, 7, 6, 8, '#0d47a1');
      rect(ctx, 5, 14, 6, 7, '#01579b');
      rect(ctx, 3, 10, 11, 2, '#80d8ff');
      // Crystal shard at muzzle
      px(ctx, 2, 9, '#e0f7fa'); px(ctx, 1, 10, '#80deea');
      px(ctx, 2, 11, '#00bcd4');
      rect(ctx, 7, 8, 4, 3, '#80d8ff'); // scope/crystal
      px(ctx, 8, 8, '#ffffff'); px(ctx, 9, 9, '#e0f7fa');
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
      // Clearer parrot: body, head, beak, wing, tail
      rect(ctx, 9, 5, 7, 7, '#4caf50');    // body
      rect(ctx, 8, 4, 8, 6, '#388e3c');
      rect(ctx, 10, 3, 5, 3, '#66bb6a');   // head top
      rect(ctx, 15, 5, 3, 3, '#ffc107');   // beak upper
      rect(ctx, 15, 7, 3, 2, '#ff8f00');   // beak lower
      px(ctx, 12, 5, '#ffffff'); px(ctx, 13, 5, '#ffffff'); // eye white
      px(ctx, 12, 5, '#000000'); // eye pupil
      rect(ctx, 5, 9, 4, 5, '#81c784');    // left wing
      px(ctx, 5, 9, '#a5d6a7'); px(ctx, 6, 11, '#a5d6a7'); // wing highlights
      rect(ctx, 9, 12, 4, 8, '#1b5e20');   // tail feathers
      rect(ctx, 11, 11, 2, 8, '#2e7d32');
      break;
    case 'cat':
      // Clearer cat: ears, head, face details, body, tail
      rect(ctx, 8, 4, 3, 4, '#ff9800');    // left ear
      rect(ctx, 9, 5, 2, 3, '#f57c00');    // ear inner
      rect(ctx, 13, 4, 3, 4, '#ff9800');   // right ear
      rect(ctx, 14, 5, 2, 3, '#f57c00');
      rect(ctx, 7, 7, 10, 7, '#ff9800');   // head
      px(ctx, 10, 9, '#1a1a1a'); px(ctx, 13, 9, '#1a1a1a'); // eyes
      px(ctx, 10, 9, '#00cc88'); px(ctx, 13, 9, '#00cc88'); // green eyes
      rect(ctx, 11, 11, 2, 2, '#e65100');  // nose
      rect(ctx, 9, 13, 2, 1, '#ff7043'); rect(ctx, 13, 13, 2, 1, '#ff7043'); // whisker marks
      rect(ctx, 9, 14, 6, 7, '#f57c00');  // body
      rect(ctx, 7, 15, 3, 5, '#ff9800'); rect(ctx, 14, 15, 3, 5, '#ff9800'); // sides
      rect(ctx, 15, 17, 7, 3, '#e65100'); // tail
      rect(ctx, 20, 16, 3, 2, '#ff9800'); // tail tip
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
      // Elongated oval, bright yellow core, flame tail
      rect(ctx, 3, 0, 2, 2, '#ffff00'); // bright tip
      px(ctx, 3, 0, '#ffffff'); px(ctx, 4, 0, '#ffffff');
      rect(ctx, 2, 2, 4, 3, '#f97316'); // orange body
      px(ctx, 3, 3, '#fbbf24'); px(ctx, 4, 3, '#fbbf24'); // core glow
      rect(ctx, 3, 5, 2, 2, '#ef4444'); // tail base
      px(ctx, 3, 6, '#7f1d1d'); px(ctx, 4, 7, '#7f1d1d'); // flame tail tip
      break;
    case 'water':
      // Cyan teardrop shape
      rect(ctx, 3, 0, 2, 2, '#e0f7fa'); // tip
      px(ctx, 3, 0, '#ffffff');
      rect(ctx, 2, 2, 4, 3, '#38bdf8'); // body
      px(ctx, 3, 3, '#bae6fd'); px(ctx, 4, 3, '#bae6fd'); // inner shine
      rect(ctx, 2, 5, 4, 2, '#0284c7'); // tail
      px(ctx, 3, 6, '#0c4a6e'); px(ctx, 4, 6, '#0c4a6e');
      break;
    case 'ice':
      // Blue crystal shard shape
      px(ctx, 3, 0, '#e0f7fa'); px(ctx, 4, 0, '#e0f7fa');
      rect(ctx, 2, 1, 4, 2, '#80deea'); // upper shard
      rect(ctx, 3, 3, 2, 3, '#00bcd4'); // main shaft
      px(ctx, 2, 3, '#e0f7fa'); px(ctx, 5, 4, '#e0f7fa'); // facets
      rect(ctx, 2, 5, 4, 2, '#006064'); // base
      px(ctx, 3, 6, '#00838f');
      break;
    case 'poison':
      // Green bubble/droplet
      rect(ctx, 2, 1, 4, 5, '#4ade80'); // round body
      rect(ctx, 3, 0, 2, 2, '#86efac'); // top highlight
      px(ctx, 2, 2, '#86efac');          // left shine
      rect(ctx, 3, 5, 2, 2, '#16a34a'); // tail
      px(ctx, 3, 6, '#166534'); px(ctx, 4, 6, '#166534');
      px(ctx, 3, 2, '#ffffff'); // bubble shine
      break;
    case 'electric':
      // Jagged bright yellow bolt
      rect(ctx, 3, 0, 2, 1, '#ffff00');
      rect(ctx, 2, 1, 3, 1, '#fbbf24');
      rect(ctx, 4, 2, 2, 2, '#ffff00');
      px(ctx, 4, 2, '#ffffff'); // spark
      rect(ctx, 2, 4, 3, 1, '#fbbf24');
      rect(ctx, 3, 5, 3, 1, '#ffff00');
      rect(ctx, 2, 6, 3, 2, '#fbbf24');
      px(ctx, 3, 0, '#ffffff'); // top glow
      break;
    case 'dark':
      // Purple oval with dark core
      rect(ctx, 3, 1, 2, 1, '#d8b4fe'); // tip glow
      rect(ctx, 2, 2, 4, 4, '#a855f7'); // outer
      px(ctx, 3, 3, '#1a0033'); px(ctx, 4, 3, '#1a0033'); // dark core
      px(ctx, 3, 4, '#1a0033'); px(ctx, 4, 4, '#1a0033');
      rect(ctx, 3, 6, 2, 2, '#7e22ce'); // tail
      px(ctx, 3, 7, '#4a0072');
      break;
    default: // normal — white/gray elongated bullet
      px(ctx, 3, 0, '#ffffff'); px(ctx, 4, 0, '#ffffff'); // tip
      rect(ctx, 2, 1, 4, 1, '#e5e7eb');
      rect(ctx, 2, 2, 4, 4, '#9ca3af');
      px(ctx, 3, 2, '#ffffff'); px(ctx, 4, 3, '#d1d5db'); // shine
      rect(ctx, 3, 6, 2, 2, '#4b5563');
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
  // Gold coin with gradient feel and "G" mark
  rect(ctx, 2, 1, 4, 6, '#fbbf24'); // main circle
  rect(ctx, 1, 2, 6, 4, '#fbbf24');
  // Outer rim (darker gold)
  px(ctx, 2, 1, '#d97706'); px(ctx, 5, 1, '#d97706');
  px(ctx, 1, 2, '#d97706'); px(ctx, 6, 2, '#d97706');
  px(ctx, 1, 5, '#d97706'); px(ctx, 6, 5, '#d97706');
  px(ctx, 2, 6, '#d97706'); px(ctx, 5, 6, '#d97706');
  // Bright inner highlight
  rect(ctx, 3, 2, 2, 2, '#fef3c7');
  px(ctx, 2, 3, '#fef3c7');
  // "G" symbol (simplified)
  px(ctx, 3, 4, '#92400e'); px(ctx, 4, 4, '#92400e');
  px(ctx, 4, 3, '#92400e');
  return c;
}

function generateCardFrame(): HTMLCanvasElement {
  const c = createCanvas(48, 64);
  const ctx = c.getContext('2d')!;
  // Clean card with corner ornaments
  rect(ctx, 0, 0, 48, 64, '#312e81'); // outer border
  rect(ctx, 1, 1, 46, 62, '#1e1b4b'); // inner border
  rect(ctx, 2, 2, 44, 60, '#0f0d2e'); // card body
  // Corner ornaments (L-shaped)
  rect(ctx, 2, 2, 6, 2, '#6366f1'); rect(ctx, 2, 2, 2, 6, '#6366f1'); // TL
  rect(ctx, 40, 2, 6, 2, '#6366f1'); rect(ctx, 46, 2, 2, 6, '#6366f1'); // TR
  rect(ctx, 2, 60, 6, 2, '#6366f1'); rect(ctx, 2, 58, 2, 6, '#6366f1'); // BL
  rect(ctx, 40, 60, 6, 2, '#6366f1'); rect(ctx, 46, 58, 2, 6, '#6366f1'); // BR
  // Corner diamond accents
  px(ctx, 4, 4, '#a5b4fc'); px(ctx, 43, 4, '#a5b4fc');
  px(ctx, 4, 59, '#a5b4fc'); px(ctx, 43, 59, '#a5b4fc');
  // Top and bottom accent lines
  rect(ctx, 10, 2, 28, 1, '#818cf8');
  rect(ctx, 10, 61, 28, 1, '#818cf8');
  return c;
}

// ─── Background Generation ───────────────────────────────────────────────────

function generateBackground(): HTMLCanvasElement {
  const c = createCanvas(256, 256);
  const ctx = c.getContext('2d')!;
  const rng = seedRandom(42);

  // Dark cracked asphalt base
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, 256, 256);

  // Crack lines (dark fractures in the asphalt)
  ctx.strokeStyle = '#0d0d0d';
  ctx.lineWidth = 1;
  const cracks = [
    [[20,10],[45,35],[38,60]], [[80,0],[92,28],[110,45],[100,70]],
    [[150,5],[162,22],[155,50],[170,80]], [[200,15],[210,40],[195,65]],
    [[10,100],[35,115],[50,140]], [[90,90],[105,120],[120,140],[115,170]],
    [[160,95],[170,130],[185,150]], [[220,80],[215,110],[230,140]],
    [[30,170],[50,190],[45,220]], [[100,160],[120,185],[110,210],[130,240]],
    [[170,170],[180,200],[195,225]], [[5,200],[25,220],[40,245]],
  ];
  for (const crack of cracks) {
    ctx.beginPath();
    ctx.moveTo(crack[0][0], crack[0][1]);
    for (let i = 1; i < crack.length; i++) ctx.lineTo(crack[i][0], crack[i][1]);
    ctx.stroke();
  }

  // Scorched earth patches
  const scorches = [
    {x:40, y:50, w:35, h:25}, {x:130, y:30, w:40, h:20},
    {x:200, y:90, w:30, h:30}, {x:60, y:150, w:45, h:30},
    {x:170, y:180, w:38, h:22}, {x:10, y:220, w:30, h:25},
  ];
  for (const s of scorches) {
    ctx.fillStyle = '#2d1a0a';
    ctx.fillRect(s.x, s.y, s.w, s.h);
    // Darker center
    ctx.fillStyle = '#1f0f05';
    ctx.fillRect(s.x + 4, s.y + 4, s.w - 8, s.h - 8);
  }

  // Ruined building footprints (dark rectangles suggesting walls)
  const buildings = [
    {x:5, y:5, w:55, h:40}, {x:110, y:0, w:70, h:55},
    {x:195, y:10, w:55, h:45}, {x:0, y:140, w:50, h:60},
    {x:180, y:145, w:70, h:65}, {x:85, y:195, w:80, h:55},
  ];
  for (const b of buildings) {
    ctx.fillStyle = '#252525';
    ctx.fillRect(b.x, b.y, b.w, b.h);
    // Lighter edge (ruined wall top)
    ctx.fillStyle = '#303030';
    ctx.fillRect(b.x, b.y, b.w, 2);
    ctx.fillRect(b.x, b.y, 2, b.h);
    // Dark interior
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(b.x + 4, b.y + 4, b.w - 8, b.h - 8);
  }

  // Rubble piles (small dark rectangles scattered)
  const rubblePositions = [
    [70,40],[85,55],[155,70],[240,50],[30,110],[145,100],
    [220,130],[55,200],[165,220],[240,200],[120,240],[20,85],
  ];
  for (const [rx, ry] of rubblePositions) {
    const rw = 4 + Math.floor(rng() * 8);
    const rh = 3 + Math.floor(rng() * 5);
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(rx, ry, rw, rh);
    ctx.fillStyle = '#1e1e1e';
    ctx.fillRect(rx + 1, ry + 1, rw - 2, rh - 2);
  }

  // Alien energy residue (orange/red glow patches)
  const glows = [
    {x:75, y:80, r:22}, {x:190, y:60, r:18},
    {x:30, y:190, r:15}, {x:210, y:210, r:20},
    {x:120, y:130, r:25},
  ];
  for (const g of glows) {
    for (let i = g.r; i > 0; i -= 2) {
      const alpha = (0.06 * (g.r - i) / g.r).toFixed(3);
      ctx.fillStyle = `rgba(239,68,68,${alpha})`;
      ctx.beginPath();
      ctx.ellipse(g.x, g.y, i * 1.4, i, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Faded road markings (broken yellow dashes)
  ctx.fillStyle = 'rgba(180,160,0,0.25)';
  // Vertical center line (road going up-down)
  for (let y = 0; y < 256; y += 24) {
    ctx.fillRect(126, y, 4, 14);
  }
  // Horizontal road crossing
  for (let x = 0; x < 256; x += 24) {
    ctx.fillRect(x, 118, 14, 4);
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

const CHARACTER_ORDER = ['grass_man', 'fire_lord', 'aqua_sage', 'storm_runner', 'void_walker', 'beast_tamer', 'firefighter'];

let cachedSprites: SpriteSheet | null = null;

export function generateAllSprites(): SpriteSheet {
  if (cachedSprites) return cachedSprites;

  // Player ships — now 7 character top-down sprites (index 0-6 matches CHARACTER_ORDER)
  const playerShips = CHARACTER_ORDER.map(id => generatePlayerTopDown(id));

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
