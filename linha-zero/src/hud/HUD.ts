import { Train } from '../world/Train';
import { Track } from '../world/Track';
import { Player } from '../entities/Player';
import { RunStats } from '../types';

const MINIMAP_RANGE = 170; // world units of track shown ahead of the engine
const ZONE_COLOR: Record<string, string> = {
  city: '#f2c94c',
  rescue: '#6fcf97',
  raid: '#ff5c5c',
};

export class HUD {
  private hud = document.getElementById('hud')!;
  private distanceEl = document.getElementById('stat-distance')!;
  private speedEl = document.getElementById('stat-speed')!;
  private resourcesEl = document.getElementById('stat-resources')!;
  private passengersEl = document.getElementById('stat-passengers')!;
  private wagonsStrip = document.getElementById('wagons-strip')!;
  private banner = document.getElementById('event-banner')!;
  private playersPanel = document.getElementById('players-panel')!;
  private actionHint = document.getElementById('action-hint')!;
  private minimap = document.getElementById('minimap') as HTMLCanvasElement;
  private minimapCtx = this.minimap.getContext('2d')!;
  private stormBadge = document.getElementById('storm-badge')!;
  private bannerTimer = 0;
  private hintTimer = 0;

  show() { this.hud.classList.remove('hidden'); }
  hide() { this.hud.classList.add('hidden'); }

  banner_show(text: string, duration = 3) {
    this.banner.textContent = text;
    this.banner.classList.add('show');
    this.bannerTimer = duration;
  }

  hint(text: string) {
    this.actionHint.textContent = text;
    this.actionHint.classList.add('show');
    this.hintTimer = 0.2;
  }

  update(dt: number, stats: RunStats, train: Train, players: Player[], track: Track, stormActive = false) {
    this.stormBadge.classList.toggle('hidden', !stormActive);
    this.distanceEl.textContent = `${Math.floor(stats.distance / 10)} m`;
    this.speedEl.textContent = `${Math.round(train.speed * 3.2)} km/h`;
    this.resourcesEl.textContent = `${stats.resources}`;
    this.passengersEl.textContent = `${stats.passengersSaved}`;

    this.wagonsStrip.innerHTML = '';
    for (const w of train.wagons) {
      const chip = document.createElement('div');
      chip.className = 'wagon-chip' + (w.fire > 0 ? ' burning' : '') + (w.destroyed ? ' gone' : '');
      chip.textContent = w.kind === 'engine' ? '🚂' : w.raider ? '⚠️' : '';
      const bar = document.createElement('div');
      bar.className = 'hp-bar';
      const fill = document.createElement('div');
      fill.style.width = `${Math.max(0, (w.hp / w.maxHp) * 100)}%`;
      fill.style.background = w.hp < 35 ? '#ff3d3d' : w.hp < 70 ? '#ffb347' : '#4ade80';
      bar.appendChild(fill);
      chip.appendChild(bar);
      this.wagonsStrip.appendChild(chip);
    }

    this.playersPanel.innerHTML = '';
    for (const p of players) {
      const card = document.createElement('div');
      card.className = 'player-card' + (!p.alive ? ' dead' : '');
      const dot = document.createElement('div');
      dot.className = 'dot';
      dot.style.background = `#${p.color.toString(16).padStart(6, '0')}`;
      card.appendChild(dot);
      const label = document.createElement('span');
      label.textContent = `${p.name}${p.onTrain ? '' : ' • fora do trem!'}`;
      card.appendChild(label);
      if (p.carry) {
        const carry = document.createElement('span');
        carry.className = 'carry';
        carry.textContent = p.carry === 'resource' ? ` +${p.carryValue}` : ' 🧍 carregando';
        card.appendChild(carry);
      }
      this.playersPanel.appendChild(card);
    }

    if (this.bannerTimer > 0) {
      this.bannerTimer -= dt;
      if (this.bannerTimer <= 0) this.banner.classList.remove('show');
    }
    if (this.hintTimer > 0) {
      this.hintTimer -= dt;
      if (this.hintTimer <= 0) this.actionHint.classList.remove('show');
    }

    this.drawMinimap(train, players, track);
  }

  /** Small radar: what's coming up the line, and where the crew currently is. */
  private drawMinimap(train: Train, players: Player[], track: Track) {
    const ctx = this.minimapCtx;
    const w = this.minimap.width;
    const h = this.minimap.height;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(10,12,20,0.35)';
    ctx.fillRect(0, 0, w, h);

    const cx = w / 2;
    const zToY = (z: number) => h - 14 - ((z - train.z) / MINIMAP_RANGE) * (h - 24);

    // rails
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - 4, h);
    ctx.lineTo(cx - 4, 0);
    ctx.moveTo(cx + 4, h);
    ctx.lineTo(cx + 4, 0);
    ctx.stroke();

    // upcoming zones, offset to whichever side they're actually on
    for (const zone of track.zones) {
      const color = ZONE_COLOR[zone.kind];
      if (!color) continue; // 'calm' zones don't need a blip
      const yStart = zToY(zone.startZ);
      const yEnd = zToY(zone.endZ);
      if (yEnd > h && yStart > h) continue;
      if (yStart < -10 && yEnd < -10) continue;
      const x = cx + zone.side * 16;
      ctx.fillStyle = color;
      ctx.fillRect(x - 4, Math.min(yStart, yEnd), 8, Math.max(2, Math.abs(yEnd - yStart)));
    }

    // the train itself, near the bottom
    const trainY = zToY(train.z + train.length / 2);
    ctx.fillStyle = '#9fb4ff';
    ctx.fillRect(cx - 3, trainY - 5, 6, 10);

    // crew dots
    for (const p of players) {
      const y = clampNum(zToY(p.z), 4, h - 4);
      const x = clampNum(cx + (p.x / 12) * 16, 4, w - 4);
      ctx.fillStyle = `#${p.color.toString(16).padStart(6, '0')}`;
      ctx.beginPath();
      ctx.arc(x, y, p.alive ? 3 : 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function clampNum(v: number, min: number, max: number) {
  return v < min ? min : v > max ? max : v;
}
