/**
 * PLANET RENDERER — Draws the dynamic planet in the inventory background.
 * The planet changes appearance based on the current timeline era.
 */

/** Offscreen buffer reused across frames for the pixelated variant */
let planetBuf: HTMLCanvasElement | null = null;

/**
 * Pixel-art wrapper: renders the planet small and upscales without smoothing,
 * turning the smooth gradients into chunky retro pixels. Time is quantized
 * so orbiting UFOs/moons step frame-by-frame like classic sprite animation.
 */
export function renderPlanetPixelated(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, radius: number,
  totalMonths: number, time: number
): void {
  const scale = 5;
  const pad = 2.3; // covers moon orbit (1.8r) and ring (1.4r)
  const bufSize = Math.ceil((radius * pad * 2) / scale);
  if (!planetBuf || planetBuf.width !== bufSize) {
    planetBuf = document.createElement('canvas');
    planetBuf.width = bufSize;
    planetBuf.height = bufSize;
  }
  const bctx = planetBuf.getContext('2d')!;
  bctx.clearRect(0, 0, bufSize, bufSize);
  const steppedTime = Math.floor(time * 8) / 8;
  renderPlanet(bctx, bufSize / 2, bufSize / 2, radius / scale, totalMonths, steppedTime);
  const prevSmooth = ctx.imageSmoothingEnabled;
  ctx.imageSmoothingEnabled = false;
  const drawSize = bufSize * scale;
  ctx.drawImage(planetBuf, x - drawSize / 2, y - drawSize / 2, drawSize, drawSize);
  ctx.imageSmoothingEnabled = prevSmooth;
}

export function renderPlanet(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, radius: number,
  totalMonths: number, time: number
): void {
  const year = Math.ceil(totalMonths / 12);
  const month = ((totalMonths - 1) % 12) + 1;

  ctx.save();

  // Base planet
  const gradient = ctx.createRadialGradient(x - radius * 0.3, y - radius * 0.3, 0, x, y, radius);

  if (totalMonths <= 2) {
    // Normal planet (months 1-2)
    gradient.addColorStop(0, '#4ade80');
    gradient.addColorStop(0.6, '#166534');
    gradient.addColorStop(1, '#052e16');
  } else if (totalMonths <= 6) {
    // Slightly changed (months 3-6)
    gradient.addColorStop(0, '#86efac');
    gradient.addColorStop(0.4, '#4d7c0f');
    gradient.addColorStop(0.8, '#3f3f00');
    gradient.addColorStop(1, '#1a1a00');
  } else if (totalMonths <= 11) {
    // Starting to be destroyed (months 7-11)
    gradient.addColorStop(0, '#a3a3a3');
    gradient.addColorStop(0.4, '#6b5b00');
    gradient.addColorStop(0.8, '#4a3000');
    gradient.addColorStop(1, '#1c0800');
  } else if (year === 2 && month <= 5) {
    // Year 2: changing color
    gradient.addColorStop(0, '#fbbf24');
    gradient.addColorStop(0.5, '#92400e');
    gradient.addColorStop(1, '#451a03');
  } else if (year === 2 && month >= 6) {
    // Year 2 month 6+: completely changed color
    gradient.addColorStop(0, '#f97316');
    gradient.addColorStop(0.5, '#7c2d12');
    gradient.addColorStop(1, '#3b0800');
  } else if (year === 3 && month <= 5) {
    // Year 3: more UFOs and giant structures
    gradient.addColorStop(0, '#ef4444');
    gradient.addColorStop(0.5, '#7f1d1d');
    gradient.addColorStop(1, '#2d0000');
  } else if (year === 3 && month >= 6) {
    // Year 3.5: giant alien embracing planet
    gradient.addColorStop(0, '#dc2626');
    gradient.addColorStop(0.5, '#5b0000');
    gradient.addColorStop(1, '#1a0000');
  } else if (year === 4 && month === 1) {
    // Year 4 month 1: alien gone, constructions destroyed
    gradient.addColorStop(0, '#9ca3af');
    gradient.addColorStop(0.5, '#4b5563');
    gradient.addColorStop(1, '#1f2937');
  } else if (year >= 4 && year < 5) {
    // Year 4: almost completely destroyed
    gradient.addColorStop(0, '#6b7280');
    gradient.addColorStop(0.5, '#374151');
    gradient.addColorStop(1, '#111827');
  } else if (year === 5) {
    // Year 5: meteor crater
    gradient.addColorStop(0, '#78716c');
    gradient.addColorStop(0.5, '#44403c');
    gradient.addColorStop(1, '#1c1917');
  } else if (year === 6) {
    // Year 6: mechanical ring, well-reconstructed
    gradient.addColorStop(0, '#6366f1');
    gradient.addColorStop(0.5, '#3730a3');
    gradient.addColorStop(1, '#1e1b4b');
  } else if (year >= 7 && year <= 8) {
    // Year 7-8: extreme coloration, particles, satellites
    gradient.addColorStop(0, '#a855f7');
    gradient.addColorStop(0.5, '#6b21a8');
    gradient.addColorStop(1, '#3b0764');
  } else if (year >= 9) {
    // Year 9+: massive creature era
    gradient.addColorStop(0, '#ec4899');
    gradient.addColorStop(0.5, '#9d174d');
    gradient.addColorStop(1, '#4c0519');
  }

  // Draw planet sphere
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();

  // Atmosphere glow
  ctx.globalAlpha = 0.15;
  ctx.strokeStyle = year >= 6 ? '#818cf8' : year >= 3 ? '#ef4444' : '#4ade80';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(x, y, radius + 4, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Surface details (craters/scars based on era)
  if (totalMonths > 6) {
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = '#000000';
    for (let i = 0; i < Math.min(totalMonths / 6, 5); i++) {
      const cx = x + Math.cos(i * 1.8 + 0.5) * radius * 0.4;
      const cy = y + Math.sin(i * 2.1 + 0.3) * radius * 0.3;
      const cr = radius * (0.05 + i * 0.02);
      ctx.beginPath();
      ctx.arc(cx, cy, cr, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // Year 5: meteor crater
  if (year >= 5) {
    ctx.fillStyle = '#1c1917';
    ctx.beginPath();
    ctx.arc(x + radius * 0.2, y + radius * 0.1, radius * 0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#78716c';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // Year 6: mechanical ring
  if (year >= 6) {
    ctx.globalAlpha = 0.7;
    ctx.strokeStyle = '#818cf8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(x, y, radius * 1.4, radius * 0.3, Math.PI * 0.1, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  // UFOs (from month 7 onwards, increasing count)
  const ufoCount = totalMonths <= 6 ? 0 : Math.min(Math.floor((totalMonths - 6) / 4), 8);
  if (year !== 7 && year !== 8) { // Years 7-8 have satellites instead
    for (let i = 0; i < ufoCount; i++) {
      const angle = (time * 0.3 + i * (Math.PI * 2 / ufoCount)) % (Math.PI * 2);
      const orbitR = radius * (1.3 + i * 0.1);
      const ux = x + Math.cos(angle) * orbitR;
      const uy = y + Math.sin(angle) * orbitR * 0.5;
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.ellipse(ux, uy, 4, 2, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Year 7+: satellites
  if (year >= 7) {
    for (let i = 0; i < 4; i++) {
      const angle = (time * 0.2 + i * Math.PI / 2) % (Math.PI * 2);
      const sx = x + Math.cos(angle) * (radius * 1.5);
      const sy = y + Math.sin(angle) * (radius * 1.5) * 0.4;
      ctx.fillStyle = '#a78bfa';
      ctx.fillRect(sx - 3, sy - 1, 6, 2);
      ctx.fillStyle = '#6366f1';
      ctx.fillRect(sx - 1, sy - 3, 2, 6);
    }
  }

  // Year 3.5+ / Year 9+: giant creature
  if ((year === 3 && month >= 6) || year >= 9) {
    const creatureSize = year >= 9 ? radius * 0.8 : radius * 0.5;
    ctx.globalAlpha = year >= 9 ? 0.6 : 0.35;
    ctx.fillStyle = year >= 9 ? '#ec4899' : '#7f1d1d';
    // Tentacles/arms wrapping planet
    for (let i = 0; i < 4; i++) {
      const angle = i * Math.PI / 2 + time * 0.1;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(
        x + Math.cos(angle) * radius * 1.5,
        y + Math.sin(angle) * radius,
        x + Math.cos(angle + 0.5) * radius * 0.8,
        y + Math.sin(angle + 0.5) * radius * 0.8
      );
      ctx.lineWidth = creatureSize * 0.15;
      ctx.strokeStyle = ctx.fillStyle;
      ctx.stroke();
    }
    // Creature body
    ctx.beginPath();
    ctx.arc(x + radius * 0.6, y - radius * 0.6, creatureSize * 0.4, 0, Math.PI * 2);
    ctx.fill();
    // Eye
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x + radius * 0.6, y - radius * 0.6, creatureSize * 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  // Year 7+: energy particles
  if (year >= 7) {
    ctx.globalAlpha = 0.5;
    for (let i = 0; i < 8; i++) {
      const px = x + Math.sin(time * 0.5 + i * 0.8) * radius * (1.2 + Math.sin(i) * 0.3);
      const py = y + Math.cos(time * 0.4 + i * 1.1) * radius * (0.8 + Math.cos(i) * 0.2);
      ctx.fillStyle = '#c084fc';
      ctx.beginPath();
      ctx.arc(px, py, 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // Moon (year 5+)
  if (year >= 5) {
    const moonAngle = time * 0.15;
    const moonX = x + Math.cos(moonAngle) * radius * 1.8;
    const moonY = y + Math.sin(moonAngle) * radius * 1.2;
    const moonR = radius * 0.15;
    ctx.fillStyle = '#d4d4d8';
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}
